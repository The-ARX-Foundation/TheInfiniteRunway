#!/usr/bin/env python3
"""
Claude Export Parser for Obsidian Zettelkasten
Parses Claude.ai conversation exports and splits them into atomic notes.

Hallucination mitigation:
- Sets Epistemic_Status: AI-Unverified on all output notes
- Detects red-flag patterns (anonymous authority, absolute claims, specific stats)
- Preserves conversation context in Change log for traceability
- Separates assistant claims from established structure

Usage:
    ./scripts/parse_claude_export.py <path-to-export.json>
    ./scripts/parse_claude_export.py <path-to-export.json> --dry-run
    ./scripts/parse_claude_export.py <path-to-export.json> --output-dir "4 - Source Material/Claude"
"""

import json
import os
import re
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from collections import defaultdict

VAULT_ROOT = Path(__file__).parent.parent
DEFAULT_OUTPUT_DIR = VAULT_ROOT / "4 - Source Material" / "Claude"

# ─── Hallucination Red-Flag Patterns ─────────────────────────────────────────
# Patterns that suggest AI-generated content may be unreliable.
# Keyed by label, value is compiled regex.
HALLUCINATION_RED_FLAGS = [
    (r'\b\d+\s*%',                                                          "specific percentage"),
    (r'\b(studies show|research shows|research indicates|studies indicate)\b', "anonymous authority"),
    (r'\b(always|never|the only way|impossible to|guaranteed to)\b',         "absolute claim"),
    (r'\b(experts agree|scientists believe|researchers found|it is known)\b',"anonymous authority"),
    (r'\baccording to\b',                                                    "cited claim — verify source"),
    (r'\bin (19|20)\d{2},\s+\w[\w\s]{1,30}(found|showed|discovered|proved)', "specific citation"),
    (r'\brecent(?:ly)?\s+(study|research|paper|findings)\b',                "vague recency claim"),
]

# ─── Topic Scoring (mirrors semantic_tagger.py simplified) ───────────────────
TOPIC_KEYWORDS = {
    "Machine Learning":        ["machine learning", "neural network", "deep learning", "cnn", "lstm",
                                 "transformer", "classifier", "autoencoder", "gradient descent",
                                 "training", "inference", "loss function", "embedding", "fine-tun"],
    "Programming":             ["python", "javascript", "api", "function", "class", "script",
                                 "database", "docker", "git", "refactor", "debug", "framework",
                                 "endpoint", "async", "library", "module", "import"],
    "Biomedical Engineering":  ["biomedical", "fetal", "aneurysm", "stent", "tissue", "scaffold",
                                 "vascular", "biomaterial", "endovascular", "clinical", "medical"],
    "Signal Processing":       ["fft", "filter", "amplifier", "frequency", "signal", "waveform",
                                 "circuit", "sensor", "sampling", "noise", "impedance"],
    "Philosophy":              ["philosophy", "consciousness", "ethics", "meaning", "existential",
                                 "moral", "ontology", "epistemology", "belief", "truth"],
    "Research Methods":        ["literature review", "pubmed", "citation", "doi", "paper",
                                 "methodology", "systematic review", "keyword", "bibliometric"],
    "Statistics":              ["anova", "regression", "p-value", "statistical", "hypothesis",
                                 "confidence interval", "distribution", "variance", "correlation"],
    "Workflow & Tooling":      ["linux", "ubuntu", "terminal", "bash", "shell", "config",
                                 "obsidian", "zettelkasten", "vault", "workflow", "automation"],
    "Introspection":           ["self-reflection", "personal growth", "journal", "awareness",
                                 "identity", "belief", "introspection", "values", "mindset"],
    "Money":                   ["business", "startup", "revenue", "investment", "saas",
                                 "pricing", "financial", "market", "monetiz"],
    "Architecture":            ["architecture", "system design", "infrastructure", "pattern",
                                 "microservice", "database design", "schema"],
}


def detect_red_flags(text):
    """Return list of (label, sample) for red-flag patterns found in text."""
    found = []
    for pattern, label in HALLUCINATION_RED_FLAGS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            sample = matches[0] if isinstance(matches[0], str) else matches[0][0]
            found.append((label, sample[:60]))
    return found


def score_topics(text):
    """Score text against topic keywords. Returns sorted list of (topic, score)."""
    text_lower = text.lower()
    scores = {}
    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(3 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[topic] = score
    return sorted(scores.items(), key=lambda x: -x[1])


def sanitize_filename(title, max_len=80):
    """Convert a conversation title to a Windows-safe filename."""
    # Strip illegal chars
    clean = re.sub(r'[<>:"/\\|?*]', '', title)
    # Replace smart quotes and dashes
    clean = clean.replace('\u2018', "'").replace('\u2019', "'")
    clean = clean.replace('\u201c', '').replace('\u201d', '')
    clean = clean.replace('\u2014', '-').replace('\u2013', '-')
    # Collapse whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    # Trim to max length
    if len(clean) > max_len:
        clean = clean[:max_len].rstrip()
    return clean or "Untitled Claude Conversation"


def extract_key_claims(messages, max_claims=8):
    """
    Extract bullet-point-worthy claims from assistant messages.
    Prioritises short, declarative assistant turns.
    Returns list of strings.
    """
    claims = []
    for msg in messages:
        if msg.get("role") != "assistant":
            continue
        text = msg.get("content", "")
        if not isinstance(text, str):
            # Handle content blocks (list format)
            if isinstance(text, list):
                text = " ".join(
                    block.get("text", "") for block in text
                    if isinstance(block, dict) and block.get("type") == "text"
                )
            else:
                continue

        # Extract existing bullet points from assistant response
        bullets = re.findall(r'^[-*•]\s+(.+)', text, re.MULTILINE)
        for b in bullets:
            b = b.strip()
            if 20 < len(b) < 200:
                claims.append(b)
            if len(claims) >= max_claims:
                return claims

        # Fall back to first sentence of short paragraphs
        if not bullets:
            sentences = re.split(r'(?<=[.!?])\s+', text.strip())
            for s in sentences[:2]:
                s = s.strip()
                if 20 < len(s) < 180:
                    claims.append(f"~ {s}")   # ~ prefix = AI-asserted, unverified
            if len(claims) >= max_claims:
                return claims

    return claims[:max_claims]


def classify_conversation(title, messages):
    """Return 'Concepts' or 'Projects' based on conversation content."""
    full_text = title + " " + " ".join(
        (msg.get("content", "") if isinstance(msg.get("content"), str)
         else " ".join(b.get("text", "") for b in msg.get("content", []) if isinstance(b, dict)))
        for msg in messages
    )

    project_signals = [
        "build", "implement", "create", "develop", "write a", "code for",
        "project", "setup", "configure", "deploy", "install",
    ]
    concept_signals = [
        "what is", "explain", "define", "concept", "theory", "how does",
        "difference between", "why does", "understand",
    ]

    proj_score = sum(1 for s in project_signals if s in full_text.lower())
    conc_score = sum(1 for s in concept_signals if s in full_text.lower())

    return "Projects" if proj_score > conc_score else "Concepts"


def build_note(title, messages, created_at, conversation_uuid, flags, topics, category):
    """Construct a Zettelkasten note from a Claude conversation."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    try:
        date_created = datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M")
    except Exception:
        date_created = now

    # Topic frontmatter entries
    topic_entries = ""
    if topics:
        topic_entries = "\n".join(f'  - "[[{t}]]"' for t, _ in topics[:2])
    else:
        topic_entries = ""

    # Red-flag callout
    flag_block = ""
    if flags:
        flag_lines = [
            "",
            ">[!warning] Hallucination Flags",
            ">Automated scan detected potentially unreliable patterns — verify before trusting:",
        ]
        for label, sample in flags[:5]:
            flag_lines.append(f">- **{label}**: `{sample}`")
        flag_block = "\n".join(flag_lines)

    # Key claims from assistant
    claims = extract_key_claims(messages)
    claims_body = "\n".join(f"- {c}" for c in claims) if claims else "-"

    # Summary from first human message
    first_human = next(
        (m for m in messages if m.get("role") == "human"), None
    )
    context_summary = ""
    if first_human:
        raw = first_human.get("content", "")
        if isinstance(raw, list):
            raw = " ".join(b.get("text", "") for b in raw if isinstance(b, dict))
        context_summary = raw.strip()[:300].replace("\n", " ")

    frontmatter = f"""---
Date Created: {date_created}
Last Updated: {now}
tags:
  - Resource
Index:
  - "[[Claude]]"
Topic:
{topic_entries if topic_entries else ""}
Status: Unweathered
Epistemic_Status: AI-Unverified
Published: false
---
---
"""

    body = f"""# {title}
{flag_block}

## Context
{context_summary if context_summary else "-"}

## Definition
-

## My current stance
-

## Key claims
{claims_body}

## Links
- Related:
- Projects:
- Evidence:

## Change log
- {now}: created from Claude export (conversation: {conversation_uuid[:8]}...)
"""

    return frontmatter + body


def load_export(export_path):
    """Load Claude export — handles .json directly or .zip containing conversations.json."""
    path = Path(export_path)
    if not path.exists():
        raise FileNotFoundError(f"Export not found: {export_path}")

    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as zf:
            names = zf.namelist()
            # Find conversations.json
            candidates = [n for n in names if n.endswith("conversations.json") or n == "conversations.json"]
            if not candidates:
                # Try any JSON
                candidates = [n for n in names if n.endswith(".json")]
            if not candidates:
                raise ValueError(f"No JSON found in zip. Contents: {names}")
            with zf.open(candidates[0]) as f:
                return json.load(f)
    else:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)


def parse_conversations(data):
    """
    Normalise Claude export data into a flat list of conversation dicts.
    Handles both list-of-conversations and {conversations: [...]} formats.
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("conversations", "data", "chats"):
            if key in data:
                return data[key]
    raise ValueError("Unrecognised export format — expected list or dict with 'conversations' key.")


def process_export(export_path, output_dir=None, dry_run=False):
    output_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR

    print(f"Loading export: {export_path}")
    raw = load_export(export_path)
    conversations = parse_conversations(raw)
    print(f"Found {len(conversations)} conversations")

    # Ensure output dirs exist
    if not dry_run:
        (output_dir / "Concepts").mkdir(parents=True, exist_ok=True)
        (output_dir / "Projects").mkdir(parents=True, exist_ok=True)

    stats = defaultdict(int)
    skipped = []

    for conv in conversations:
        # Support both "chat_messages" and "messages" keys
        messages = conv.get("chat_messages") or conv.get("messages") or []
        title_raw = conv.get("name") or conv.get("title") or "Untitled"
        created_at = conv.get("created_at") or conv.get("create_time") or ""
        uuid = conv.get("uuid") or conv.get("id") or ""

        if not messages:
            skipped.append(title_raw)
            stats["skipped_empty"] += 1
            continue

        title = sanitize_filename(title_raw)
        category = classify_conversation(title, messages)

        # Collect all text for scoring
        full_text = " ".join(
            (m.get("content", "") if isinstance(m.get("content"), str)
             else " ".join(b.get("text", "") for b in m.get("content", []) if isinstance(b, dict)))
            for m in messages
        )
        topics = score_topics(full_text)
        flags = detect_red_flags(full_text)

        out_path = output_dir / category / f"{title}.md"

        if dry_run:
            flag_labels = [f[0] for f in flags]
            topic_names = [t[0] for t in topics[:2]]
            print(f"  [{category}] {title}")
            print(f"    Topics: {', '.join(topic_names) or 'unclassified'}")
            if flags:
                print(f"    FLAGS:  {', '.join(flag_labels)}")
            stats["would_create"] += 1
            continue

        # Skip if already exists (don't overwrite manual edits)
        if out_path.exists():
            stats["skipped_exists"] += 1
            continue

        note_content = build_note(title, messages, created_at, uuid, flags, topics, category)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(note_content)

        stats["created"] += 1
        if flags:
            stats["flagged"] += 1

    # Report
    print("\n" + "=" * 60)
    print("CLAUDE EXPORT PARSE REPORT")
    print("=" * 60)
    print(f"  Total conversations:  {len(conversations)}")
    if dry_run:
        print(f"  Would create:        {stats['would_create']}")
    else:
        print(f"  Notes created:       {stats['created']}")
        print(f"  Skipped (exists):    {stats['skipped_exists']}")
    print(f"  Skipped (empty):     {stats['skipped_empty']}")
    print(f"  Red-flag notes:      {stats['flagged']}")
    print(f"  Output dir:          {output_dir}")
    print("\nAll notes set to Epistemic_Status: AI-Unverified")
    print("Review 'My current stance' sections to promote to Resonant.")
    if skipped:
        print(f"\nSkipped (no messages): {skipped[:5]}")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    export_path = args[0]
    dry_run = "--dry-run" in args
    output_dir = None
    for i, a in enumerate(args):
        if a == "--output-dir" and i + 1 < len(args):
            output_dir = VAULT_ROOT / args[i + 1]

    if dry_run:
        print("DRY-RUN mode — no files will be written\n")

    process_export(export_path, output_dir=output_dir, dry_run=dry_run)


if __name__ == "__main__":
    main()
