#!/usr/bin/env python3
"""
update_last_updated.py
======================
DEPRECATED — superseded by Claude Code scheduled remote agents (/schedule).
Kept as a no-Claude fallback and reference implementation for the
Last Updated frontmatter stamp logic.
See: 0 - Housekeeping/Automated Housekeeping Schedule.md § Remote Scheduled Agents

-----

Updates the `Last Updated` frontmatter field in a markdown note to the
current timestamp.

Usage:
    python3 scripts/update_last_updated.py <file_path> [<file_path> ...]

Called automatically by the Claude Code PostToolUse hook whenever Edit or
Write touches a .md file inside the vault. Can also be run manually.

Skips files that:
  - Have no YAML frontmatter
  - Were last modified by an automation script (detected via git author)
  - Are in excluded directories (.obsidian, .smart-env, scripts/)
"""

import sys
import re
import os
from datetime import datetime
from pathlib import Path

VAULT_ROOT = Path(__file__).parent.parent.resolve()

EXCLUDED_DIRS = {".obsidian", ".smart-env", "scripts", ".claude", ".git"}

TIMESTAMP_FMT = "%Y-%m-%d %H:%M"


def is_excluded(path: Path) -> bool:
    parts = set(path.relative_to(VAULT_ROOT).parts)
    return bool(parts & EXCLUDED_DIRS)


def update_file(path: Path) -> bool:
    """
    Returns True if the file was updated, False if skipped.
    """
    if not path.suffix == ".md":
        return False
    if not path.is_file():
        return False
    if is_excluded(path):
        return False

    text = path.read_text(encoding="utf-8")

    # Must start with a YAML frontmatter block
    if not text.startswith("---"):
        return False

    # Find the closing ---
    end = text.find("\n---", 3)
    if end == -1:
        return False

    frontmatter = text[: end + 4]  # include the closing ---
    body = text[end + 4 :]

    now = datetime.now().strftime(TIMESTAMP_FMT)

    # Replace existing Last Updated value (quoted or unquoted)
    updated, count = re.subn(
        r'(Last Updated:\s*)("?)[^\n"]*("?)',
        rf'\g<1>"{now}"',
        frontmatter,
        count=1,
    )

    if count == 0:
        # Field absent — insert after Date Created line if present, else after opening ---
        if "Date Created:" in updated:
            updated = re.sub(
                r"(Date Created:[^\n]*\n)",
                rf'\g<1>Last Updated: "{now}"\n',
                updated,
                count=1,
            )
        else:
            updated = updated.replace("---\n", f'---\nLast Updated: "{now}"\n', 1)

    if updated == frontmatter:
        # Nothing changed (timestamp already current to the minute)
        return False

    path.write_text(updated + body, encoding="utf-8")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: update_last_updated.py <file> [<file> ...]", file=sys.stderr)
        sys.exit(1)

    updated = []
    skipped = []

    for arg in sys.argv[1:]:
        p = Path(arg).resolve()
        try:
            if update_file(p):
                updated.append(p.name)
            else:
                skipped.append(p.name)
        except Exception as e:
            print(f"ERROR processing {arg}: {e}", file=sys.stderr)

    if updated:
        print(f"Last Updated set on: {', '.join(updated)}")
    if skipped:
        print(f"Skipped (no frontmatter / excluded): {', '.join(skipped)}")


if __name__ == "__main__":
    main()
