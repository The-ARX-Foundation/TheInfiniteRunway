#!/usr/bin/env python3
"""
validate_windows_filenames.py
=============================
Fail if any file or directory name under the vault uses characters illegal on Windows
or reserved device names. Use in CI (Linux) and locally before backup / push.

Rules (Win32, conservative):
  - Name must not contain: < > : " / \\ | ? * or ASCII control chars (0x00-0x1F)
  - Name must not end with space or period
  - Stem (file without extension) or full directory name must not be a reserved device name

Skips: .git, __pycache__, node_modules, .pnpm-store, dist, build, .vite, .turbo, .next
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent

SKIP_DIR_NAMES = frozenset({
    ".git",
    "__pycache__",
    "node_modules",
    ".pnpm-store",
    "dist",
    "build",
    ".vite",
    ".turbo",
    ".next",
})

RESERVED = frozenset(f"COM{i}" for i in range(1, 10)) | frozenset(
    f"LPT{i}" for i in range(1, 10)
) | frozenset(("CON", "PRN", "AUX", "NUL"))

BAD_IN_NAME = re.compile(r'[<>:"/\\|?\*\x00-\x1f]')


def violations_for_leaf(name: str, *, is_dir: bool) -> list[str]:
    out: list[str] = []
    if BAD_IN_NAME.search(name):
        out.append("illegal character (<>:\"/\\|?* or control char)")
    if name.endswith(" ") or name.endswith("."):
        out.append("trailing space or period")
    stem = name if is_dir else Path(name).stem
    if stem.upper() in RESERVED:
        out.append(f"reserved device name ({stem!r})")
    return out


def scan(root: Path) -> list[tuple[Path, str]]:
    bad: list[tuple[Path, str]] = []
    root = root.resolve()

    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
        base = Path(dirpath)
        for d in dirnames:
            for reason in violations_for_leaf(d, is_dir=True):
                bad.append((base / d, reason))
        for f in filenames:
            for reason in violations_for_leaf(f, is_dir=False):
                bad.append((base / f, reason))

    return bad


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Windows-safe vault paths.")
    parser.add_argument(
        "--root",
        type=Path,
        default=VAULT_ROOT,
        help="Directory tree to scan (default: vault root)",
    )
    args = parser.parse_args()
    root: Path = args.root

    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    issues = scan(root)

    if not issues:
        print(f"OK: Windows-safe names under {root}")
        return 0

    print(f"FAIL: {len(issues)} path(s) violate Windows naming rules:\n", file=sys.stderr)
    for path, reason in sorted(issues, key=lambda x: str(x[0]).lower()):
        print(f"  {reason}: {path}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
