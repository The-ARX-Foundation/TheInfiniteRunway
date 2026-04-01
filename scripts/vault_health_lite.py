#!/usr/bin/env python3
"""
vault_health_lite.py — Staging_Zettelkasten health snapshot (personal ARX vault).

Aligned in spirit with InsightAlly's 00 - Housekeeping/Scripts/vault_health.py.
Canonical shared contract (skip lists, CLI, strict rules):
  OneDrive - InsightAlly/Cross_Context_ARX_Daemon/VAULT_HEALTH_SHARED.md

Tolerant of an uninitialized or shallow git repo and Zettelkasten layout.

  python3 scripts/vault_health_lite.py
  python3 scripts/vault_health_lite.py --strict
  python3 scripts/vault_health_lite.py --no-wikilinks
  python3 scripts/vault_health_lite.py --json

Vault root: .../Staging_Zettelkasten/ (parent of scripts/).
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

_FILE = Path(__file__).resolve()
VAULT_ROOT = _FILE.parents[1]

SKIP_DIR_NAMES = frozenset({
    ".git",
    ".github",
    ".obsidian",
    ".smart-env",
    ".claude",
    ".opencode",
    "node_modules",
    ".venv",
    "__pycache__",
    ".pnpm-store",
    "dist",
    "build",
    ".vite",
    ".turbo",
    ".next",
})

# Skip wikilink/embed validation in very noisy trees (optional; on by default)
DEFAULT_SKIP_WIKILINK_PREFIXES: tuple[str, ...] = (
    "4 - Source Material/ChatGPT/",
    "1 - Templates/",
)

# Exact paths: meta docs that mention [[...]] as syntax examples, not as links
SKIP_WIKILINK_SOURCE_FILES: frozenset[str] = frozenset(
    {
        "0 - Housekeeping/Automated Housekeeping Schedule.md",
    }
)

SKIP_LINK_PLACEHOLDERS = frozenset({
    "wikilinks",
    "embeds",
    "note name",
    "note title",
    "note",
    "links",
    "filename.png",
    "image.ext",
    "path name",
    "some related note",
    "...solution...",
    "...problem...",
    "...",
    "",
})

WIKILINK_RE = re.compile(r"(?<!\!)\[\[([^\]]+)\]\]")
EMBED_RE = re.compile(r"!\[\[([^\]]+)\]\]")


def should_skip_dir(rel: Path) -> bool:
    return any(part in SKIP_DIR_NAMES for part in rel.parts)


def iter_markdown_files(vault: Path) -> list[Path]:
    out: list[Path] = []
    for p in vault.rglob("*.md"):
        try:
            rel = p.relative_to(vault)
        except ValueError:
            continue
        if should_skip_dir(rel):
            continue
        out.append(p)
    return sorted(out)


def run_git(vault: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(vault), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


@dataclass
class Report:
    git_branch: str = ""
    git_commit: str = ""
    git_dirty: bool = False
    git_porcelain: str = ""
    git_ahead: int | None = None
    git_behind: int | None = None
    git_sync_error: str | None = None
    git_has_commits: bool = False
    markdown_files: int = 0
    empty_markdown: list[str] = field(default_factory=list)
    large_files: list[tuple[str, float]] = field(default_factory=list)
    ambiguous_stems: dict[str, int] = field(default_factory=dict)
    broken_wikilinks: list[str] = field(default_factory=list)
    ambiguous_wikilinks: list[str] = field(default_factory=list)
    broken_embeds: list[str] = field(default_factory=list)


def check_git(r: Report, vault: Path) -> None:
    if not (vault / ".git").exists():
        r.git_sync_error = "No .git directory (OneDrive-only or not initialized)."
        return

    head = run_git(vault, "rev-parse", "--verify", "HEAD")
    r.git_has_commits = head.returncode == 0 and bool(head.stdout.strip())
    if not r.git_has_commits:
        r.git_branch = run_git(vault, "rev-parse", "--abbrev-ref", "HEAD").stdout.strip() or "?"
        r.git_commit = "(no commits yet)"
        st = run_git(vault, "status", "--porcelain")
        r.git_porcelain = st.stdout
        r.git_dirty = bool(st.stdout.strip())
        r.git_sync_error = "Repository has no commits — connect to origin or make an initial commit."
        return

    p = run_git(vault, "rev-parse", "--abbrev-ref", "HEAD")
    r.git_branch = p.stdout.strip() if p.returncode == 0 else "?"

    p = run_git(vault, "rev-parse", "--short", "HEAD")
    r.git_commit = p.stdout.strip() if p.returncode == 0 else "?"

    p = run_git(vault, "status", "--porcelain")
    r.git_porcelain = p.stdout
    r.git_dirty = bool(p.stdout.strip())

    up = run_git(vault, "rev-parse", "--verify", "@{upstream}")
    if up.returncode != 0:
        r.git_sync_error = "No upstream branch (git branch -u origin/<branch>)."
        return

    cnt = run_git(vault, "rev-list", "--left-right", "--count", "HEAD...@{upstream}")
    if cnt.returncode != 0 or not cnt.stdout.strip():
        r.git_sync_error = "Could not compare to upstream."
        return
    parts = cnt.stdout.strip().split()
    if len(parts) == 2:
        try:
            r.git_ahead = int(parts[0])
            r.git_behind = int(parts[1])
        except ValueError:
            r.git_sync_error = "Unexpected rev-list output."


def check_large_files(
    r: Report, vault: Path, mb_threshold: float, *, git_tracked_only: bool
) -> None:
    if git_tracked_only and r.git_has_commits:
        ls = run_git(vault, "ls-files", "-z")
        if ls.returncode != 0:
            return
        for rel in ls.stdout.split("\0"):
            if not rel:
                continue
            p = vault / rel
            try:
                sz = p.stat().st_size
            except OSError:
                continue
            mb = sz / (1024 * 1024)
            if mb >= mb_threshold:
                r.large_files.append((rel, round(mb, 2)))
        return

    for p in vault.rglob("*"):
        if not p.is_file():
            continue
        try:
            rel = p.relative_to(vault)
        except ValueError:
            continue
        if should_skip_dir(rel):
            continue
        try:
            sz = p.stat().st_size
        except OSError:
            continue
        mb = sz / (1024 * 1024)
        if mb >= mb_threshold:
            r.large_files.append((rel.as_posix(), round(mb, 2)))


def line_at(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def build_indices(md_files: list[Path], vault: Path):
    stem_to_paths: dict[str, list[Path]] = defaultdict(list)
    rel_no_ext: set[str] = set()

    for p in md_files:
        stem_to_paths[p.stem].append(p)
        rel = p.relative_to(vault).as_posix()
        if rel.endswith(".md"):
            rel_no_ext.add(rel[: -len(".md")])

    return stem_to_paths, rel_no_ext


def wikilink_stem_key(normalized: str) -> str:
    if normalized.endswith(".md"):
        return Path(normalized).stem
    return normalized


def build_aux_file_index(vault: Path) -> dict[str, list[Path]]:
    d: dict[str, list[Path]] = defaultdict(list)
    exts = frozenset({".jsx", ".tsx", ".ts", ".js", ".mjs", ".py", ".json", ".html"})
    for p in vault.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts:
            continue
        try:
            rel = p.relative_to(vault)
        except ValueError:
            continue
        if should_skip_dir(rel):
            continue
        d[p.name].append(p)
    return d


def resolve_wikilink_target(
    raw: str,
    vault: Path,
    stem_to_paths: dict[str, list[Path]],
    rel_no_ext: set[str],
    aux_by_name: dict[str, list[Path]],
) -> tuple[str, str | None]:
    t = raw.strip()
    if "|" in t:
        t = t.split("|", 1)[0].strip()
    if "#" in t:
        t = t.split("#", 1)[0].strip()
    if not t:
        return "skip", None
    if t.lower().startswith(("http://", "https://", "mailto:")):
        return "skip", None

    normalized = t.replace("\\", "/")
    if normalized.strip().lower() in SKIP_LINK_PLACEHOLDERS:
        return "skip", None
    if "==" in normalized and '"' in normalized:
        return "skip", None
    if "<" in normalized and ">" in normalized:
        return "skip", None

    if "/" in normalized:
        cand = normalized + ".md" if not normalized.endswith(".md") else normalized
        rel_key = cand.removesuffix(".md") if cand.endswith(".md") else cand
        if rel_key in rel_no_ext or (vault / cand).is_file():
            return "ok", None
        return "missing", cand

    stem_key = wikilink_stem_key(normalized)
    paths = stem_to_paths.get(stem_key, [])

    if len(paths) == 0:
        if "/" not in normalized and "." in normalized and not normalized.endswith(".md"):
            hits = aux_by_name.get(Path(normalized).name, [])
            if len(hits) == 1:
                return "ok", None
            if len(hits) > 1:
                return "ambiguous", normalized
        return "missing", normalized
    if len(paths) > 1:
        return "ambiguous", normalized
    return "ok", None


def resolve_embed_target(raw: str, vault: Path, note_dir: Path) -> tuple[str, str | None]:
    t = raw.strip()
    if "|" in t:
        t = t.split("|", 1)[0].strip()
    if "#" in t:
        t = t.split("#", 1)[0].strip()
    if not t or t.lower().startswith(("http://", "https://")):
        return "skip", None

    normalized = t.replace("\\", "/")
    if normalized.strip().lower() in SKIP_LINK_PLACEHOLDERS:
        return "skip", None
    if "\u2026" in normalized or normalized.endswith("\u2026"):
        return "skip", None
    if "<" in normalized and ">" in normalized:
        return "skip", None

    def try_exists(p: Path) -> bool:
        try:
            return p.is_file()
        except OSError:
            return False

    to_check: list[Path] = []
    if "/" in normalized:
        to_check.append(vault / normalized)
    else:
        to_check.append(note_dir / normalized)
        if not Path(normalized).suffix:
            to_check.append(note_dir / f"{normalized}.md")
        for sub in (
            "4 - Source Material/Attachments",
            "4 - Source Material/Images",
            "0 - Housekeeping/Attachments",
        ):
            to_check.append(vault / sub / normalized)

    for c in to_check:
        if try_exists(c):
            return "ok", None
        if not c.suffix and try_exists(c.with_suffix(".md")):
            return "ok", None
        for ext in (".md", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf", ".webm", ".mp4", ".jsx"):
            if try_exists(c.with_suffix(ext)):
                return "ok", None

    return "missing", normalized


def scan_links(
    r: Report,
    vault: Path,
    md_files: list[Path],
    skip_prefixes: tuple[str, ...],
) -> None:
    stem_to_paths, rel_no_ext = build_indices(md_files, vault)
    aux_by_name = build_aux_file_index(vault)
    amb = {s: len(v) for s, v in stem_to_paths.items() if len(v) > 1}
    r.ambiguous_stems = dict(sorted(amb.items(), key=lambda x: -x[1])[:50])

    for md in md_files:
        try:
            text = md.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            r.broken_wikilinks.append(f"{md.relative_to(vault)}: (read error: {e})")
            continue

        rel_note = md.relative_to(vault)
        note_dir = md.parent
        rel_posix = rel_note.as_posix()
        if rel_posix.startswith(skip_prefixes):
            continue
        if rel_posix in SKIP_WIKILINK_SOURCE_FILES:
            continue

        for m in WIKILINK_RE.finditer(text):
            status, detail = resolve_wikilink_target(
                m.group(1), vault, stem_to_paths, rel_no_ext, aux_by_name
            )
            if status == "missing":
                ln = line_at(text, m.start())
                r.broken_wikilinks.append(
                    f"{rel_posix}:{ln}  [[{m.group(1)}]] -> not found ({detail})"
                )
            elif status == "ambiguous":
                ln = line_at(text, m.start())
                r.ambiguous_wikilinks.append(
                    f"{rel_posix}:{ln}  [[{m.group(1)}]] -> ambiguous stem ({detail})"
                )

        for m in EMBED_RE.finditer(text):
            status, detail = resolve_embed_target(m.group(1), vault, note_dir)
            if status == "missing":
                ln = line_at(text, m.start())
                r.broken_embeds.append(
                    f"{rel_posix}:{ln}  ![[{m.group(1)}]] -> not found ({detail})"
                )


def human_report(r: Report) -> str:
    lines: list[str] = []
    lines.append("=== Staging_Zettelkasten — vault health (lite) ===")
    lines.append(f"Root: {VAULT_ROOT}")
    lines.append("")
    lines.append("--- Git ---")
    lines.append(f"  Branch:  {r.git_branch}")
    lines.append(f"  HEAD:    {r.git_commit}")
    if r.git_sync_error:
        lines.append(f"  Note:    {r.git_sync_error}")
    if r.git_has_commits:
        if r.git_dirty:
            lines.append("  Status:  DIRTY (uncommitted or untracked changes)")
        else:
            lines.append("  Status:  clean working tree")
        if r.git_ahead is not None and r.git_behind is not None:
            lines.append(f"  vs upstream:  behind {r.git_behind},  ahead {r.git_ahead}")
    lines.append("")
    lines.append("--- Markdown ---")
    lines.append(f"  .md files:  {r.markdown_files}")
    if r.empty_markdown:
        lines.append(f"  Empty .md files:  {len(r.empty_markdown)}")
        for e in r.empty_markdown[:20]:
            lines.append(f"    - {e}")
        if len(r.empty_markdown) > 20:
            lines.append(f"    ... and {len(r.empty_markdown) - 20} more")
    lines.append("")
    lines.append("--- Large files ---")
    if r.large_files:
        lines.append(f"  (>={2.0} MiB on disk or git index):")
        for rel, mb in sorted(r.large_files, key=lambda x: -x[1])[:25]:
            lines.append(f"    {mb} MiB  {rel}")
        if len(r.large_files) > 25:
            lines.append(f"    ... and {len(r.large_files) - 25} more")
    else:
        lines.append("  (none over threshold)")
    lines.append("")
    lines.append("--- Wikilinks & embeds ---")
    lines.append(f"  Broken [[wikilinks]]:  {len(r.broken_wikilinks)}")
    for x in r.broken_wikilinks[:20]:
        lines.append(f"    {x}")
    if len(r.broken_wikilinks) > 20:
        lines.append(f"    ... and {len(r.broken_wikilinks) - 20} more")
    lines.append(f"  Ambiguous [[wikilinks]]:  {len(r.ambiguous_wikilinks)}")
    for x in r.ambiguous_wikilinks[:12]:
        lines.append(f"    {x}")
    lines.append(f"  Broken ![[embeds]]:  {len(r.broken_embeds)}")
    for x in r.broken_embeds[:15]:
        lines.append(f"    {x}")
    if r.ambiguous_stems:
        lines.append(f"  Ambiguous note stems (sample):  {len(r.ambiguous_stems)}")
        for stem, n in list(r.ambiguous_stems.items())[:8]:
            lines.append(f"    {stem!r}  ({n} paths)")
    lines.append("")
    lines.append("=== end ===")
    lines.append(
        "Shared contract: OneDrive - InsightAlly/Cross_Context_ARX_Daemon/VAULT_HEALTH_SHARED.md"
    )
    return "\n".join(lines)


def report_to_dict(r: Report) -> dict:
    return {
        "vault_root": str(VAULT_ROOT),
        "git": {
            "branch": r.git_branch,
            "commit": r.git_commit,
            "dirty": r.git_dirty,
            "has_commits": r.git_has_commits,
            "ahead": r.git_ahead,
            "behind": r.git_behind,
            "sync_error": r.git_sync_error,
        },
        "markdown_files": r.markdown_files,
        "empty_markdown": r.empty_markdown,
        "large_files_mib": {k: v for k, v in r.large_files},
        "broken_wikilinks_count": len(r.broken_wikilinks),
        "ambiguous_wikilinks_count": len(r.ambiguous_wikilinks),
        "broken_embeds_count": len(r.broken_embeds),
        "broken_wikilinks_sample": r.broken_wikilinks[:80],
        "ambiguous_wikilinks_sample": r.ambiguous_wikilinks[:80],
        "broken_embeds_sample": r.broken_embeds[:80],
        "ambiguous_stem_count": len(r.ambiguous_stems),
    }


def main() -> int:
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass

    ap = argparse.ArgumentParser(description="Staging_Zettelkasten vault health (lite).")
    ap.add_argument("--strict", action="store_true", help="Exit 1 if git dirty (with commits) or broken links/embeds")
    ap.add_argument("--no-wikilinks", action="store_true", help="Skip wikilink and embed scan")
    ap.add_argument("--json", action="store_true", help="JSON summary to stdout")
    ap.add_argument(
        "--large-mib",
        type=float,
        default=2.0,
        metavar="N",
        help="Report files >= N MiB (default: 2)",
    )
    ap.add_argument(
        "--include-chatgpt",
        action="store_true",
        help="Validate wikilinks inside 4 - Source Material/ChatGPT/ (default: skip that tree)",
    )
    args = ap.parse_args()

    vault = VAULT_ROOT
    if not vault.is_dir():
        print(f"Vault root not found: {vault}", file=sys.stderr)
        return 2

    skip_prefixes: tuple[str, ...] = () if args.include_chatgpt else DEFAULT_SKIP_WIKILINK_PREFIXES

    r = Report()
    md_files = iter_markdown_files(vault)
    r.markdown_files = len(md_files)
    for p in md_files:
        try:
            if p.stat().st_size == 0:
                r.empty_markdown.append(p.relative_to(vault).as_posix())
        except OSError:
            pass

    check_git(r, vault)
    check_large_files(
        r, vault, mb_threshold=args.large_mib, git_tracked_only=r.git_has_commits
    )

    if not args.no_wikilinks:
        scan_links(r, vault, md_files, skip_prefixes)

    if args.json:
        print(json.dumps(report_to_dict(r), indent=2))
    else:
        print(human_report(r))

    if args.strict:
        if r.git_has_commits and r.git_dirty:
            return 1
        if r.broken_wikilinks or r.broken_embeds:
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
