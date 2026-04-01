#!/usr/bin/env python3
"""
tfidf_tagger.py

TF-IDF similarity-based Topic tagger for orphan notes.

For each orphan note (no Topic wikilinks in frontmatter), finds the most
content-similar already-tagged notes in the vault and assigns Topic tags
via weighted voting.  Complements semantic_tagger.py (keyword scoring) by
discovering tags through content proximity rather than fixed keyword lists.

Usage:
    python3 scripts/tfidf_tagger.py              # live mode
    python3 scripts/tfidf_tagger.py --dry-run    # preview without writing
    python3 scripts/tfidf_tagger.py --report     # stats only, no file list
    python3 scripts/tfidf_tagger.py --min-sim 0.15 --top-k 10
    python3 scripts/tfidf_tagger.py --scope sources   # only 4 - Source Material/
    python3 scripts/tfidf_tagger.py --scope personas  # only 6 - Elryan The Explorer/
    python3 scripts/tfidf_tagger.py --scope journals  # only 5 - Journal/
"""

import os
import re
import sys
import math
from collections import defaultdict, Counter
from pathlib import Path
from datetime import datetime

VAULT_ROOT = Path(__file__).parent.parent

SKIP_DIRS = {
    ".obsidian", ".smart-env", ".git", "scripts", "__pycache__",
    ".claude", "1 - Templates", "0 - Housekeeping",
    "2 - Paths", "3 - Indexes", "Chit Skit",
}
SKIP_FILES = {"README.md", "CLAUDE.md", "discord_message.md"}

SCOPE_MAP = {
    "sources":   "4 - Source Material",
    "personas":  "6 - Elryan The Explorer",
    "journals":  "5 - Journal",
}

# Defaults (overridable via CLI)
MIN_SIM        = 0.12   # minimum cosine similarity to count a neighbor
TOP_K          = 8      # neighbors to consult per orphan
MAX_TOPICS     = 3      # max new topics to assign per note
VOTE_THRESHOLD = 0.30   # topic must reach this fraction of top vote
MAX_CHARS      = 3000   # content cap per note
MIN_TOKENS     = 25     # skip notes with fewer useful tokens (stubs)

# Only allow these topics to be assigned — prevents course/index-specific
# labels (e.g. "ENGR 461 - Lean Launch") from spreading to unrelated notes.
# Add to this list if new valid top-level themes are introduced to the vault.
VALID_TOPICS = {
    # 22 THEME_MAP themes from semantic_tagger.py
    "Biomedical Engineering", "Machine Learning", "Signal Processing",
    "Mechanical Engineering", "Statistics", "Programming", "Philosophy",
    "Computational Neuroscience", "Biomimetics", "Money", "Self Preservation",
    "Workflow & Tooling", "Architecture", "The Senses", "Connection", "Death",
    "Introspection", "Lucid Dream", "Change", "Research Methods",
    # Personal/journal topics that appear in the vault and are meaningful
    "Positive Emotions", "Negative Emotions", "Neutral Emotions",
    "Dreams", "Recipes", "Creosticism", "Economic Philosophy",
    "Linux", "Infrastructure", "Agentic Coding", "Neurotechnology",
    "Belief", "Hopefully Abysmal",
}

STOPWORDS = {
    "the","a","an","and","or","but","in","on","at","to","for","of","with",
    "is","was","are","were","be","been","have","has","had","do","does","did",
    "will","would","could","should","may","might","can","this","that","these",
    "those","it","its","i","my","me","we","our","you","your","he","his","she",
    "her","they","their","not","no","so","as","if","by","from","into","about",
    "through","up","out","what","which","who","when","where","how","all","more",
    "also","than","just","only","then","there","here","very","being","am",
    "some","any","each","few","many","such","both","nor","yet","while",
    "however","therefore","thus","hence","since","because","although",
    "either","neither","every","most","least","much","well","even","still",
    "already","never","always","often","sometimes","usually","after","before",
    "during","between","among","above","below","over","under","again","once",
    "same","other","own","like","new","use","used","using","make","made",
    "get","got","take","took","see","saw","go","went","come","came","know",
    "knew","think","thought","want","need","say","said","one","two","three",
    "first","last","next","back","long","right","left","high","low","old",
    "good","bad","great","small","large","big","different","important",
    "possible","number","way","time","year","day","week","part","place",
    "case","point","work","life","people","world","system",
    # vault-specific noise
    "note","notes","obsidian","markdown","file","files","path","tags","tag",
    "index","link","links","page","pages","published","status","created",
    "updated","date","topic","themes","template","frontmatter",
}


# ── Tokenizer ─────────────────────────────────────────────────────────────────

def tokenize(text):
    text = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    return [w for w in text.split() if len(w) >= 3 and w not in STOPWORDS]


# ── Frontmatter parser ────────────────────────────────────────────────────────

def parse_note(filepath):
    """
    Returns dict or None.
    Keys: content, body, topics (list[str]), has_topic (bool)
    """
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return None

    result = {
        "content": content,
        "body": content,
        "topics": [],
        "has_topic": False,
    }

    if not content.startswith("---"):
        return result

    lines = content.split("\n")
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return result

    result["body"] = "\n".join(lines[end_idx + 1:])
    fm_body = "\n".join(lines[1:end_idx])

    # Multi-line Topic list
    topics = []
    topic_block = re.search(
        r"^Topic:\s*\n((?:[ \t]+-[ \t]+.*\n?)*)", fm_body, re.MULTILINE
    )
    if topic_block:
        for line in topic_block.group(1).splitlines():
            m = re.search(r"\[\[([^\]|]+)", line)
            if m:
                topics.append(m.group(1).strip())

    # Inline Topic: [[...]]
    if not topics:
        inline = re.search(r"^Topic:\s+(.+)", fm_body, re.MULTILINE)
        if inline:
            for m in re.finditer(r"\[\[([^\]|]+)", inline.group(1)):
                topics.append(m.group(1).strip())

    result["topics"] = topics
    result["has_topic"] = len(topics) > 0
    return result


# ── TF-IDF engine ─────────────────────────────────────────────────────────────

def build_tfidf(doc_tokens):
    """
    doc_tokens: {path: [token, ...]}
    Returns: {path: {term: tfidf}} — L2-normalised sparse vectors.
    """
    N = len(doc_tokens)
    df = defaultdict(int)
    for tokens in doc_tokens.values():
        for t in set(tokens):
            df[t] += 1

    idf = {t: math.log(N / (n + 1)) + 1.0 for t, n in df.items()}

    tfidf = {}
    for path, tokens in doc_tokens.items():
        if not tokens:
            tfidf[path] = {}
            continue
        counts = Counter(tokens)
        total = len(tokens)
        vec = {t: (c / total) * idf.get(t, 1.0) for t, c in counts.items()}
        norm = math.sqrt(sum(v * v for v in vec.values()))
        tfidf[path] = {t: v / norm for t, v in vec.items()} if norm > 0 else {}

    return tfidf


def cosine(v1, v2):
    if len(v1) > len(v2):
        v1, v2 = v2, v1
    return sum(w * v2.get(t, 0.0) for t, w in v1.items())


# ── Frontmatter writer ────────────────────────────────────────────────────────

def inject_topics(content, new_themes):
    """
    Add Topic: list entries to frontmatter.
    Mirrors semantic_tagger.py logic so output is consistent.
    """
    if not new_themes:
        return content

    lines = content.split("\n")
    if not lines[0].strip() == "---":
        return content

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return content

    # Locate Topic field
    topic_idx, topic_end_idx = None, None
    for i in range(1, end_idx):
        if re.match(r"^Topic:", lines[i]):
            topic_idx = i
            topic_end_idx = i + 1
            while topic_end_idx < end_idx and lines[topic_end_idx].strip().startswith("- "):
                topic_end_idx += 1
            break

    new_entries = [f'  - "[[{t}]]"' for t in new_themes]

    if topic_idx is None:
        # No Topic field — insert before Status: or before closing ---
        insert_at = end_idx
        for i in range(1, end_idx):
            if re.match(r"^Status:", lines[i]):
                insert_at = i
                break
        lines = lines[:insert_at] + ["Topic:"] + new_entries + lines[insert_at:]
        return "\n".join(lines)

    # Topic field exists — collect existing wikilinks, skip duplicates
    existing = set()
    for i in range(topic_idx + 1, topic_end_idx):
        m = re.search(r"\[\[([^\]|]+)", lines[i])
        if m:
            existing.add(m.group(1).strip())

    to_add = [e for e in new_entries if not any(t in e for t in existing)]
    if not to_add:
        return content

    # Insert after existing entries (or directly after Topic: if empty)
    if re.match(r"^Topic:\s*$", lines[topic_idx]):
        lines = lines[:topic_idx + 1] + to_add + lines[topic_end_idx:]
    else:
        lines = lines[:topic_end_idx] + to_add + lines[topic_end_idx:]

    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_args():
    argv = sys.argv[1:]
    cfg = {
        "dry_run":    "--dry-run" in argv or "--report" in argv,
        "report":     "--report" in argv,
        "scope":      None,
        "min_sim":    MIN_SIM,
        "top_k":      TOP_K,
    }
    for flag, key, cast in [("--min-sim","min_sim",float), ("--top-k","top_k",int), ("--scope","scope",str)]:
        if flag in argv:
            idx = argv.index(flag)
            if idx + 1 < len(argv):
                try:
                    cfg[key] = cast(argv[idx + 1])
                except ValueError:
                    pass
    return cfg


def main():
    cfg = parse_args()
    mode = "REPORT" if cfg["report"] else ("DRY-RUN" if cfg["dry_run"] else "LIVE")
    scope_prefix = SCOPE_MAP.get(cfg["scope"]) if cfg["scope"] else None

    print(f"tfidf_tagger.py — {mode} mode")
    print(f"  min_sim={cfg['min_sim']}  top_k={cfg['top_k']}  "
          f"vote_threshold={VOTE_THRESHOLD}  max_topics={MAX_TOPICS}")
    print(f"  scope: {cfg['scope'] or 'all'}")
    print()

    # ── Scan ──────────────────────────────────────────────────────────────
    print("Scanning vault...")
    notes = {}
    for root, dirs, files in os.walk(VAULT_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for f in files:
            if not f.endswith(".md") or f in SKIP_FILES:
                continue
            fp = Path(root) / f
            rel = str(fp.relative_to(VAULT_ROOT))
            if scope_prefix and not rel.startswith(scope_prefix):
                continue
            data = parse_note(fp)
            if data is not None:
                notes[fp] = data

    # When scoped, we still need ALL tagged notes as reference (scan full vault for those)
    all_tagged = {}
    if scope_prefix:
        for root, dirs, files in os.walk(VAULT_ROOT):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            for f in files:
                if not f.endswith(".md") or f in SKIP_FILES:
                    continue
                fp = Path(root) / f
                if fp in notes:
                    continue
                data = parse_note(fp)
                if data and data["has_topic"]:
                    all_tagged[fp] = data

    tagged  = {p: d for p, d in notes.items() if d["has_topic"]}
    tagged.update(all_tagged)
    orphans = {p: d for p, d in notes.items() if not d["has_topic"]}

    print(f"  {len(notes)} notes in scope  |  {len(tagged)} tagged (reference)  |  {len(orphans)} orphans")

    if len(tagged) < 10:
        print("Not enough tagged notes to build a reliable model.")
        return

    # ── TF-IDF ────────────────────────────────────────────────────────────
    print("Building TF-IDF vectors...")
    corpus = {}
    for fp, data in {**tagged, **orphans}.items():
        stem = fp.stem.replace("-", " ").replace("_", " ")
        text  = stem + " " + (data["body"] or "")
        corpus[fp] = tokenize(text[:MAX_CHARS])

    tfidf = build_tfidf(corpus)
    vocab = sum(len(v) for v in tfidf.values())
    print(f"  {len(corpus):,} docs  |  ~{vocab:,} weighted terms total")

    # ── Similarity + voting ────────────────────────────────────────────────
    print(f"Finding neighbors for {len(orphans):,} orphans...")
    tagged_paths = list(tagged.keys())
    assignments  = {}

    for i, (fp, data) in enumerate(orphans.items()):
        if i and i % 300 == 0:
            print(f"  {i}/{len(orphans)}...")

        ovec = tfidf.get(fp, {})
        # Skip stub notes — too little content for reliable similarity
        if not ovec or len(corpus.get(fp, [])) < MIN_TOKENS:
            continue

        sims = [(cosine(ovec, tfidf.get(tp, {})), tp) for tp in tagged_paths]
        sims = sorted([(s, tp) for s, tp in sims if s >= cfg["min_sim"]], reverse=True)
        if not sims:
            continue

        neighbors = sims[:cfg["top_k"]]

        votes = defaultdict(float)
        for sim, tp in neighbors:
            for topic in tagged[tp]["topics"]:
                # Only vote for topics in the allowed set
                if topic in VALID_TOPICS:
                    votes[topic] += sim

        if not votes:
            continue

        top_vote = max(votes.values())
        strong = sorted(
            [(t, v / top_vote) for t, v in votes.items() if v / top_vote >= VOTE_THRESHOLD],
            key=lambda x: -x[1]
        )[:MAX_TOPICS]

        if strong:
            assignments[fp] = strong

    # ── Report ────────────────────────────────────────────────────────────
    print()
    print("=" * 70)
    print(f"  Can assign topics to {len(assignments):,} / {len(orphans):,} orphans")
    print("=" * 70)

    dist = defaultdict(int)
    for topics in assignments.values():
        for t, _ in topics:
            dist[t] += 1

    print("\nProposed topic distribution:")
    for topic, count in sorted(dist.items(), key=lambda x: -x[1]):
        print(f"  {count:>5}  {topic}")

    print(f"\nSample assignments (first 40):")
    for fp, topics in list(assignments.items())[:40]:
        rel = fp.relative_to(VAULT_ROOT)
        tag_str = ", ".join(f"{t}({v:.2f})" for t, v in topics)
        print(f"  {rel}")
        print(f"    -> {tag_str}")

    if cfg["report"] or cfg["dry_run"]:
        remaining = len(orphans) - len(assignments)
        print(f"\nStill untaggable after this run: {remaining:,}")
        print("Run without --dry-run to apply." if cfg["dry_run"] else "")
        return

    # ── Apply ─────────────────────────────────────────────────────────────
    print(f"\nApplying to {len(assignments):,} notes...")
    applied, errors = 0, 0
    for fp, topics in assignments.items():
        new_themes = [t for t, _ in topics]
        try:
            content = fp.read_text(encoding="utf-8", errors="replace")
            updated = inject_topics(content, new_themes)
            if updated != content:
                fp.write_text(updated, encoding="utf-8")
                applied += 1
        except Exception as e:
            print(f"  ERROR {fp.name}: {e}")
            errors += 1

    remaining = len(orphans) - applied
    print(f"Done — tagged {applied} notes  |  {errors} errors  |  ~{remaining:,} orphans remain")


if __name__ == "__main__":
    main()
