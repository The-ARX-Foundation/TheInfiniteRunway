#!/usr/bin/env python3
"""
directories2path-n-index — Convert directory structure into Path and Index notes.

Scans the vault's directory tree and generates:
  - Path files (2 - Paths/) for curated topic directories (personas, projects)
  - Index files (3 - Indexes/) for categorical directories (source types, journal categories)

This lets the vault stop relying on the filesystem as an organizational crutch —
notes become discoverable via wikilinks in Paths and Indexes instead of folders.

Usage:
    ./scripts/directories2path_n_index.py               # Live mode
    ./scripts/directories2path_n_index.py --dry-run      # Preview without changes
    ./scripts/directories2path_n_index.py --report        # Report only
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

VAULT_ROOT = Path(__file__).parent.parent

# Directories to skip entirely
SKIP_DIRS = {
    ".obsidian", ".git", ".smart-env", ".claude", ".trash",
    "scripts", "__pycache__", "node_modules", "Attachments", "Images",
}

# Top-level dirs to skip (they ARE the organizational layer, not content)
SKIP_TOP_LEVEL = {
    "0 - Housekeeping", "1 - Templates", "2 - Paths", "3 - Indexes",
}

# ─── Directory Classification ────────────────────────────────────────────────
# Determines whether a directory gets a Path, an Index, or both.
#
# Paths = curated thematic collections (personas, projects, topic areas)
# Indexes = searchable categorical listings (source types, journal categories)

# Directories that should produce INDEX files (categorical containers)
INDEX_DIRS = {
    "4 - Source Material",  # top-level gets an index
    "5 - Journal",          # top-level gets an index
}

# Sub-directories of these parents produce INDEX files
INDEX_PARENT_DIRS = {
    "4 - Source Material",  # Books, Papers, Videos, etc. → indexes
    "5 - Journal",          # Beliefs, Entries, Thoughts, etc. → indexes
}

# Directories that should produce PATH files (thematic/project collections)
PATH_DIRS = {
    "6 - Elryan The Explorer",  # persona directories → paths
    "Chit Skit",
}


def count_md_files(dirpath):
    """Count .md files directly in a directory (non-recursive)."""
    count = 0
    try:
        for f in os.listdir(dirpath):
            if f.endswith(".md"):
                count += 1
    except OSError:
        pass
    return count


def collect_md_files(dirpath, recursive=False):
    """Collect .md files in a directory. Returns list of (filename, rel_path)."""
    files = []
    if recursive:
        for root, dirs, fnames in os.walk(dirpath):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            for f in fnames:
                if f.endswith(".md"):
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, VAULT_ROOT)
                    files.append((f, rel))
    else:
        try:
            for f in os.listdir(dirpath):
                full = os.path.join(dirpath, f)
                if f.endswith(".md") and os.path.isfile(full):
                    rel = os.path.relpath(full, VAULT_ROOT)
                    files.append((f, rel))
        except OSError:
            pass
    return sorted(files, key=lambda x: x[0].lower())


def get_subdirs(dirpath):
    """Get immediate subdirectories of a directory."""
    subdirs = []
    try:
        for d in sorted(os.listdir(dirpath)):
            full = os.path.join(dirpath, d)
            if os.path.isdir(full) and d not in SKIP_DIRS and not d.startswith("."):
                subdirs.append((d, full))
    except OSError:
        pass
    return subdirs


def note_name(filename):
    """Convert filename to note name (strip .md)."""
    return filename.replace(".md", "")


def file_has_content(filepath):
    """Check if an existing Path/Index file already has substantial body content."""
    if not os.path.exists(filepath):
        return False
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except OSError:
        return False

    # Find end of frontmatter
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return False

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return False

    # Skip double separator
    body_start = end_idx + 1
    if body_start < len(lines) and lines[body_start].strip() == "---":
        body_start += 1

    body = "\n".join(lines[body_start:]).strip()

    # Consider it "has content" if body has wikilinks (manually curated)
    wikilink_count = len(re.findall(r'\[\[', body))
    return wikilink_count >= 3


def make_frontmatter(note_type, topic=None, index_ref=None):
    """Generate standard frontmatter."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        "---",
        f'Date Created: "{now}"',
        f'Last Updated: "{now}"',
        "tags:",
        f"  - {note_type}",
    ]
    if index_ref:
        lines.append("Index:")
        lines.append(f'  - "[[{index_ref}]]"')
    else:
        lines.append("Index: ")

    if topic:
        lines.append("Topic:")
        for t in (topic if isinstance(topic, list) else [topic]):
            lines.append(f'  - "[[{t}]]"')
    else:
        lines.append("Topic: ")

    lines.extend([
        "Status: Unweathered",
        "Published: false",
        "---",
        "---",
    ])
    return "\n".join(lines)


def build_note_body(title, md_files, subdirs=None, description=None):
    """Build the body of a Path or Index note."""
    parts = []

    if description:
        parts.append(f"\n{description}\n")

    if md_files:
        parts.append(f"\n## Notes ({len(md_files)})\n")
        for fname, rel_path in md_files:
            name = note_name(fname)
            parts.append(f"- [[{name}]]")

    if subdirs:
        parts.append(f"\n## Subdirectories\n")
        for dirname, _ in subdirs:
            parts.append(f"- [[{dirname}]]")

    if not md_files and not subdirs:
        parts.append("\n*No notes found in this directory.*\n")

    return "\n".join(parts) + "\n"


# ─── Scan & Plan ──────────────────────────────────────────────────────────────

def scan_directories():
    """
    Walk the vault and determine which directories need Path or Index files.
    Returns a list of actions: (dir_path, dir_name, note_type, target_file, notes, subdirs)
    """
    actions = []

    for top_entry in sorted(os.listdir(VAULT_ROOT)):
        top_path = os.path.join(VAULT_ROOT, top_entry)
        if not os.path.isdir(top_path):
            continue
        if top_entry in SKIP_DIRS or top_entry.startswith(".") or top_entry in SKIP_TOP_LEVEL:
            continue

        # ── 4 - Source Material → Index for each sub-type ──
        if top_entry in INDEX_DIRS:
            subdirs = get_subdirs(top_path)
            direct_files = collect_md_files(top_path, recursive=False)

            # Top-level index
            actions.append({
                "dir_path": top_path,
                "dir_name": top_entry,
                "note_type": "Index",
                "target_dir": "3 - Indexes",
                "target_name": f"{top_entry} Index",
                "notes": direct_files,
                "subdirs": subdirs,
                "description": f"Master index for all {top_entry.split(' - ', 1)[-1] if ' - ' in top_entry else top_entry} content.",
                "topic": None,
            })

            # Sub-directory indexes
            if top_entry in INDEX_PARENT_DIRS:
                for subname, subpath in subdirs:
                    if subname in SKIP_DIRS:
                        continue
                    sub_files = collect_md_files(subpath, recursive=True)
                    if not sub_files:
                        continue
                    actions.append({
                        "dir_path": subpath,
                        "dir_name": subname,
                        "note_type": "Index",
                        "target_dir": "3 - Indexes",
                        "target_name": f"{subname} Index",
                        "notes": sub_files,
                        "subdirs": get_subdirs(subpath),
                        "description": f"Index of {subname} in {top_entry.split(' - ', 1)[-1]}.",
                        "topic": subname,
                    })

        # ── 6 - Elryan The Explorer → Path for each persona/project ──
        elif top_entry in PATH_DIRS:
            subdirs = get_subdirs(top_path)
            direct_files = collect_md_files(top_path, recursive=False)

            # Top-level path
            if direct_files or subdirs:
                actions.append({
                    "dir_path": top_path,
                    "dir_name": top_entry,
                    "note_type": "Path",
                    "target_dir": "2 - Paths",
                    "target_name": top_entry.split(" - ", 1)[-1] if " - " in top_entry else top_entry,
                    "notes": direct_files,
                    "subdirs": subdirs,
                    "description": f"Path collecting all notes under {top_entry}.",
                    "topic": None,
                })

            # Persona-level paths
            for persona_name, persona_path in subdirs:
                persona_files = collect_md_files(persona_path, recursive=False)
                persona_subdirs = get_subdirs(persona_path)

                if not persona_files and not persona_subdirs:
                    continue

                actions.append({
                    "dir_path": persona_path,
                    "dir_name": persona_name,
                    "note_type": "Path",
                    "target_dir": "2 - Paths",
                    "target_name": persona_name,
                    "notes": persona_files,
                    "subdirs": persona_subdirs,
                    "description": f"Persona path for {persona_name}.",
                    "topic": persona_name,
                })

                # Project-level paths (subdirs within personas)
                for proj_name, proj_path in persona_subdirs:
                    if proj_name in SKIP_DIRS or proj_name.startswith("_"):
                        continue
                    proj_files = collect_md_files(proj_path, recursive=True)
                    if not proj_files:
                        continue

                    actions.append({
                        "dir_path": proj_path,
                        "dir_name": proj_name,
                        "note_type": "Path",
                        "target_dir": "2 - Paths",
                        "target_name": proj_name,
                        "notes": proj_files,
                        "subdirs": get_subdirs(proj_path),
                        "description": f"Project path for {proj_name} (under {persona_name}).",
                        "topic": persona_name,
                    })

        # ── Chit Skit or other top-level content dirs ──
        else:
            direct_files = collect_md_files(top_path, recursive=True)
            if direct_files:
                actions.append({
                    "dir_path": top_path,
                    "dir_name": top_entry,
                    "note_type": "Path",
                    "target_dir": "2 - Paths",
                    "target_name": top_entry,
                    "notes": direct_files,
                    "subdirs": get_subdirs(top_path),
                    "description": f"Path for {top_entry} notes.",
                    "topic": None,
                })

    return actions


def generate_report(actions):
    """Print a report of planned actions."""
    print("\n" + "=" * 70)
    print("DIRECTORIES → PATH & INDEX REPORT")
    print("=" * 70)

    path_actions = [a for a in actions if a["note_type"] == "Path"]
    index_actions = [a for a in actions if a["note_type"] == "Index"]

    total_notes = sum(len(a["notes"]) for a in actions)

    print(f"\nTotal directories to process: {len(actions)}")
    print(f"  Path files to create/update: {len(path_actions)}")
    print(f"  Index files to create/update: {len(index_actions)}")
    print(f"  Total notes referenced: {total_notes}")

    # Check for conflicts with existing files
    skipped = 0
    for action in actions:
        target_path = VAULT_ROOT / action["target_dir"] / f"{action['target_name']}.md"
        if file_has_content(target_path):
            skipped += 1

    print(f"  Files with existing content (will skip): {skipped}")

    print(f"\n--- Planned Path Files ({len(path_actions)}) ---")
    for a in path_actions:
        target = VAULT_ROOT / a["target_dir"] / f"{a['target_name']}.md"
        exists = "EXISTS" if file_has_content(target) else ("UPDATE" if target.exists() else "NEW")
        print(f"  [{exists}] {a['target_name']}.md  ← {a['dir_name']}/ ({len(a['notes'])} notes)")

    print(f"\n--- Planned Index Files ({len(index_actions)}) ---")
    for a in index_actions:
        target = VAULT_ROOT / a["target_dir"] / f"{a['target_name']}.md"
        exists = "EXISTS" if file_has_content(target) else ("UPDATE" if target.exists() else "NEW")
        print(f"  [{exists}] {a['target_name']}.md  ← {a['dir_name']}/ ({len(a['notes'])} notes)")


def apply_actions(actions, dry_run=False):
    """Create or update Path and Index files."""
    created = 0
    updated = 0
    skipped = 0

    for action in actions:
        target_path = VAULT_ROOT / action["target_dir"] / f"{action['target_name']}.md"

        # Skip if file already has manually curated content
        if file_has_content(target_path):
            skipped += 1
            continue

        if dry_run:
            if target_path.exists():
                updated += 1
            else:
                created += 1
            continue

        # Build the note
        fm = make_frontmatter(
            note_type=action["note_type"],
            topic=action.get("topic"),
        )
        body = build_note_body(
            title=action["target_name"],
            md_files=action["notes"],
            subdirs=action.get("subdirs"),
            description=action.get("description"),
        )
        content = fm + "\n" + body

        # Ensure target directory exists
        target_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            is_update = target_path.exists()
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            if is_update:
                updated += 1
                print(f"  UPDATED: {action['target_name']}.md ({len(action['notes'])} notes)")
            else:
                created += 1
                print(f"  CREATED: {action['target_name']}.md ({len(action['notes'])} notes)")
        except OSError as e:
            print(f"  ERROR: {action['target_name']}.md — {e}")

    return created, updated, skipped


def main():
    dry_run = "--dry-run" in sys.argv
    report_only = "--report" in sys.argv

    if dry_run or report_only:
        print("Running in DRY-RUN mode (no files will be modified)")
    else:
        print("Running in LIVE mode (files will be modified)")

    print("\nScanning vault directories...")
    actions = scan_directories()

    generate_report(actions)

    if report_only:
        return

    if dry_run:
        print("\nDry-run results:")
        created, updated, skipped = apply_actions(actions, dry_run=True)
        print(f"  Would create: {created}")
        print(f"  Would update: {updated}")
        print(f"  Would skip (existing content): {skipped}")
        return

    print("\nApplying changes...")
    created, updated, skipped = apply_actions(actions)
    print(f"\nDone!")
    print(f"  Created: {created}")
    print(f"  Updated: {updated}")
    print(f"  Skipped (existing content): {skipped}")


if __name__ == "__main__":
    main()
