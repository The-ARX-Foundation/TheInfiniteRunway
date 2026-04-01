#!/usr/bin/env python3
"""
Semantic Linker for Obsidian Zettelkasten
Scans note bodies for phrases matching other note titles and inserts
[[Note Name|original text]] wikilinks to preserve natural wording.

Usage:
    ./scripts/semantic_linker.py              # Live mode — modifies files
    ./scripts/semantic_linker.py --dry-run    # Preview without changes
    ./scripts/semantic_linker.py --report     # Report only (no file details)
    ./scripts/semantic_linker.py --scope journals   # Only scan 5 - Journal/
    ./scripts/semantic_linker.py --scope personas   # Only scan 6 - Elryan The Explorer/
    ./scripts/semantic_linker.py --scope sources    # Only scan 4 - Source Material/
    ./scripts/semantic_linker.py --scope all        # Scan everything (default)
    ./scripts/semantic_linker.py --min-title 4      # Min title length to consider (default: 4)
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

VAULT_ROOT = Path(__file__).parent.parent

# Directories to skip entirely
SKIP_DIRS = {".obsidian", ".git", ".smart-env", "scripts", ".trash",
             "1 - Templates", ".claude", "__pycache__"}

# Minimum title length (characters) to consider for linking.
# Short titles like "GRE" or "FFT" cause too many false positives.
DEFAULT_MIN_TITLE_LEN = 4

# Titles to never link (too generic, structural, or single-word noise)
TITLE_BLOCKLIST = {
    # Structural
    "index", "path", "template", "readme", "changelog", "todo",
    "intro", "ideas", "notes", "note", "misc", "draft", "test",
    "home", "homepage", "status", "about", "overview", "summary",
    "attachments", "images", "archive", "new", "empty", "general",
    "categories", "tags", "resources", "links", "references",
    # Day-numbered reflection logs
    "day 0", "day 1", "day 2", "day 3", "day 4", "day 5",
    "day 6", "day 7", "day 8", "day 9",
    # Too generic single words that appear everywhere
    "page", "people", "change", "money", "tasks", "progress",
    "filters", "concepts", "location", "claude", "license",
    "journal", "journals", "paths", "water", "energy", "science",
    "practices", "applications", "interviews", "inspiration",
    "governance", "insurance", "patents", "outreach",
    # Notes that are link magnets but not useful targets
    "chatgpt", "communication", "names", "branding", "advice",
    "optimizer", "optimizers", "accessibility", "purpose",
    "clarity", "evolution",
}

# Regex to find regions we should NOT insert links into
# Matches: existing wikilinks, code blocks, frontmatter
RE_WIKILINK = re.compile(r'\[\[[^\]]+\]\]')
RE_CODE_BLOCK = re.compile(r'```.*?```', re.DOTALL)
RE_INLINE_CODE = re.compile(r'`[^`]+`')
RE_FRONTMATTER = re.compile(r'^---\s*\n.*?\n---', re.DOTALL)
RE_HEADING = re.compile(r'^#+\s+', re.MULTILINE)
RE_URL = re.compile(r'https?://\S+')


def parse_args():
    """Parse command-line arguments."""
    args = {
        "dry_run": False,
        "report_only": False,
        "scope": "all",
        "min_title": DEFAULT_MIN_TITLE_LEN,
        "verbose": False,
    }

    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--dry-run":
            args["dry_run"] = True
        elif arg == "--report":
            args["report_only"] = True
        elif arg == "--verbose":
            args["verbose"] = True
        elif arg == "--scope" and i + 1 < len(sys.argv):
            i += 1
            args["scope"] = sys.argv[i]
        elif arg == "--min-title" and i + 1 < len(sys.argv):
            i += 1
            args["min_title"] = int(sys.argv[i])
        i += 1

    return args


def should_process(rel_path, scope):
    """Check if a file should be processed based on scope."""
    if scope == "all":
        return True
    scope_map = {
        "journals": "5 - Journal",
        "personas": "6 - Elryan The Explorer",
        "sources": "4 - Source Material",
        "housekeeping": "0 - Housekeeping",
        "paths": "2 - Paths",
        "indexes": "3 - Indexes",
    }
    prefix = scope_map.get(scope, scope)
    return rel_path.startswith(prefix)


def build_title_index(min_title_len):
    """
    Build an index of note titles -> file paths.
    Returns dict: {lowercase_title: {"title": original_title, "path": rel_path}}
    """
    title_index = {}

    for root, dirs, files in os.walk(VAULT_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]

        for f in files:
            if not f.endswith(".md"):
                continue

            title = f[:-3]  # strip .md
            title_lower = title.lower().strip()

            # Skip blocklisted titles
            if title_lower in TITLE_BLOCKLIST:
                continue

            # Skip titles that are too short
            if len(title_lower) < min_title_len:
                continue

            # Skip titles that are just numbers or dates
            if re.match(r'^\d+[\s\-\.]*\d*$', title_lower):
                continue

            rel_path = os.path.relpath(os.path.join(root, f), VAULT_ROOT)

            # If duplicate title, prefer shorter path (closer to root = more canonical)
            if title_lower in title_index:
                if len(rel_path) >= len(title_index[title_lower]["path"]):
                    continue

            title_index[title_lower] = {
                "title": title,
                "path": rel_path,
            }

    return title_index


def extract_protected_ranges(text):
    """
    Find all character ranges in text that should not be modified.
    Returns a sorted list of (start, end) tuples.
    """
    protected = []

    # Frontmatter
    fm_match = RE_FRONTMATTER.match(text)
    if fm_match:
        protected.append((fm_match.start(), fm_match.end()))
        # Also protect the decorative --- after frontmatter
        after_fm = text[fm_match.end():]
        stripped = after_fm.lstrip('\n')
        offset = fm_match.end() + (len(after_fm) - len(stripped))
        if stripped.startswith("---"):
            protected.append((offset, offset + 3))

    # Code blocks
    for m in RE_CODE_BLOCK.finditer(text):
        protected.append((m.start(), m.end()))

    # Inline code
    for m in RE_INLINE_CODE.finditer(text):
        protected.append((m.start(), m.end()))

    # Existing wikilinks
    for m in RE_WIKILINK.finditer(text):
        protected.append((m.start(), m.end()))

    # Headings (don't link inside heading text)
    for m in RE_HEADING.finditer(text):
        line_end = text.find('\n', m.start())
        if line_end == -1:
            line_end = len(text)
        protected.append((m.start(), line_end))

    # URLs
    for m in RE_URL.finditer(text):
        protected.append((m.start(), m.end()))

    # Themes: line
    for m in re.finditer(r'^Themes:.*$', text, re.MULTILINE):
        protected.append((m.start(), m.end()))

    # Sort and merge overlapping ranges
    protected.sort()
    merged = []
    for start, end in protected:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))

    return merged


def is_in_protected_range(pos, length, protected_ranges):
    """Check if a position+length overlaps any protected range."""
    end = pos + length
    for pstart, pend in protected_ranges:
        if pos < pend and end > pstart:
            return True
        if pstart > end:
            break
    return False


def precompile_title_patterns(title_index):
    """Pre-compile regex patterns for all titles. Called once, reused per note."""
    patterns = []
    # Sort longest-first to prefer longer matches
    for title_lower in sorted(title_index.keys(), key=len, reverse=True):
        entry = title_index[title_lower]
        escaped = re.escape(title_lower)
        try:
            pat = re.compile(r'(?<!\[)(?<!\w)' + escaped + r'(?!\])(?!\w)', re.IGNORECASE)
        except re.error:
            continue
        patterns.append((title_lower, entry["title"], pat))
    return patterns


def find_linkable_matches(body_text, title_patterns, self_title, protected_ranges):
    """
    Find all positions in body_text where note titles appear and can be linked.
    Returns list of (start, end, matched_text, target_title) sorted by position descending.
    """
    matches = []
    self_lower = self_title.lower() if self_title else ""
    already_linked = set()  # only link each target once per note
    body_lower = body_text.lower()

    for title_lower, target_title, pattern in title_patterns:
        # Don't self-link
        if title_lower == self_lower:
            continue

        # Only link each target once per note
        if title_lower in already_linked:
            continue

        # Fast pre-check: skip if title substring not even present
        if title_lower not in body_lower:
            continue

        for m in pattern.finditer(body_text):
            start, end = m.start(), m.end()
            matched_text = body_text[start:end]

            # Skip if in protected range
            if is_in_protected_range(start, end - start, protected_ranges):
                continue

            # Skip if this position overlaps with an already-accepted match
            overlap = False
            for existing_start, existing_end, _, _ in matches:
                if start < existing_end and end > existing_start:
                    overlap = True
                    break
            if overlap:
                continue

            matches.append((start, end, matched_text, target_title))
            already_linked.add(title_lower)
            break  # Only first occurrence per target per note

    # Sort by position descending so we can replace from end to start
    matches.sort(key=lambda x: x[0], reverse=True)
    return matches


def apply_links_to_content(content, matches):
    """
    Apply wikilink replacements to content.
    Matches should be sorted by position descending.
    """
    for start, end, matched_text, target_title in matches:
        # If matched text exactly equals the target title (case-insensitive),
        # use simple [[Target Title]] link. Otherwise use [[Target Title|matched text]].
        if matched_text.lower() == target_title.lower():
            replacement = f"[[{target_title}]]"
        else:
            replacement = f"[[{target_title}|{matched_text}]]"
        content = content[:start] + replacement + content[end:]

    return content


def update_last_updated(content):
    """Update the Last Updated field in frontmatter."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return re.sub(
        r'(Last Updated:\s*")[^"]*(")',
        f'\\g<1>{now}\\2',
        content,
        count=1,
    )


def scan_and_link(args):
    """Main scan and link pipeline."""
    dry_run = args["dry_run"]
    report_only = args["report_only"]
    scope = args["scope"]
    min_title = args["min_title"]
    verbose = args["verbose"]

    mode = "REPORT" if report_only else ("DRY-RUN" if dry_run else "LIVE")
    print(f"Semantic Linker — {mode} mode")
    print(f"Scope: {scope} | Min title length: {min_title}")

    # Step 1: Build title index
    print("\nBuilding title index...")
    title_index = build_title_index(min_title)
    print(f"  {len(title_index)} linkable titles indexed")

    # Step 1b: Pre-compile regex patterns (once, reused for all notes)
    print("  Pre-compiling patterns...")
    title_patterns = precompile_title_patterns(title_index)
    print(f"  {len(title_patterns)} patterns compiled")

    # Step 2: Scan notes
    print("\nScanning notes...")
    notes = []
    for root, dirs, files in os.walk(VAULT_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for f in files:
            if not f.endswith(".md"):
                continue
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, VAULT_ROOT)
            if not should_process(rel_path, scope):
                continue
            notes.append({
                "filepath": filepath,
                "rel_path": rel_path,
                "title": f[:-3],
            })
    print(f"  {len(notes)} notes in scope")

    # Step 3: Find and apply links
    total_links = 0
    modified_files = 0
    link_details = []  # (source_path, target_title, matched_text)
    target_link_counts = defaultdict(int)

    for note in notes:
        try:
            with open(note["filepath"], "r", encoding="utf-8", errors="replace") as fh:
                content = fh.read()
        except Exception:
            continue

        protected_ranges = extract_protected_ranges(content)
        matches = find_linkable_matches(content, title_patterns, note["title"], protected_ranges)

        if not matches:
            continue

        total_links += len(matches)
        modified_files += 1

        for start, end, matched_text, target_title in matches:
            link_details.append((note["rel_path"], target_title, matched_text))
            target_link_counts[target_title] += 1

        if verbose or report_only:
            for _, _, matched_text, target_title in matches:
                if matched_text.lower() == target_title.lower():
                    print(f"  {note['rel_path']}: [[{target_title}]]")
                else:
                    print(f"  {note['rel_path']}: [[{target_title}|{matched_text}]]")

        if report_only or dry_run:
            continue

        # Apply links
        new_content = apply_links_to_content(content, matches)
        new_content = update_last_updated(new_content)

        try:
            with open(note["filepath"], "w", encoding="utf-8") as fh:
                fh.write(new_content)
        except Exception as e:
            print(f"  ERROR writing {note['rel_path']}: {e}")

    # Report
    print(f"\n{'=' * 60}")
    print(f"SEMANTIC LINKER {'REPORT' if report_only else ('DRY-RUN' if dry_run else 'RESULTS')}")
    print(f"{'=' * 60}")
    print(f"\nNotes scanned: {len(notes)}")
    print(f"Notes {'that would be' if dry_run or report_only else ''} modified: {modified_files}")
    print(f"Links {'proposed' if dry_run or report_only else 'inserted'}: {total_links}")

    if target_link_counts:
        print(f"\n--- Most-Linked Targets (top 30) ---")
        for title, count in sorted(target_link_counts.items(), key=lambda x: -x[1])[:30]:
            print(f"  {title}: {count} incoming links")

    # Identify orphans (notes with no incoming links AND no outgoing theme links)
    all_titles_lower = set(title_index.keys())
    orphan_candidates = []
    for note in notes:
        title_lower = note["title"].lower()
        # Check if this note is a link target
        is_target = title_lower in all_titles_lower and target_link_counts.get(
            title_index.get(title_lower, {}).get("title", ""), 0
        ) > 0

        if not is_target:
            # Check if it has any outgoing wikilinks
            try:
                with open(note["filepath"], "r", encoding="utf-8", errors="replace") as fh:
                    content = fh.read()
                has_outgoing = bool(RE_WIKILINK.search(content))
            except Exception:
                has_outgoing = False

            if not has_outgoing:
                orphan_candidates.append(note["rel_path"])

    if orphan_candidates:
        print(f"\n--- True Orphans (no incoming or outgoing links, first 30) ---")
        for p in orphan_candidates[:30]:
            print(f"  {p}")
        if len(orphan_candidates) > 30:
            print(f"  ...and {len(orphan_candidates) - 30} more")
        print(f"\nTotal true orphans: {len(orphan_candidates)}")

    return total_links, modified_files


def main():
    args = parse_args()
    scan_and_link(args)


if __name__ == "__main__":
    main()
