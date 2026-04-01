#!/usr/bin/env python3
"""
kb_differential_map.py — timestamp + content differential between company KB and personal vault.

Produces a factual map (not legal classification). **Read-only** on both vaults; writes **report files only**.
Does **not** copy personal content into company KB. While `PERSONAL_VAULT_COPY_MORATORIUM.md` is active, company-side agents use this for **flagging** only.

Produces:
  - Explicit mirror pairs (Mirrored_from_Staging_Zettelkasten → 0 - Housekeeping)
  - Identical normalized body (SHA-256 of stripped markdown)
  - FS mtime ordering (OneDrive mtime is unreliable — see report header)
  - Optional: lexical overlap for company notes under 01-/02-/03- (product/ops/engineering)
  - Optional: merge rows from existing IP_OVERLAP_*.json

Usage:
  python3 scripts/kb_differential_map.py
  python3 scripts/kb_differential_map.py --out "0 - Housekeeping/logs/KB_DIFF.md" --json
  python3 scripts/kb_differential_map.py --overlap-json "path/to/IP_OVERLAP_2026-04-02.json"
  python3 scripts/kb_differential_map.py --no-lexical
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

_FILE = Path(__file__).resolve()
PERSONAL_ROOT_DEFAULT = _FILE.parents[1]
COMPANY_ROOT_DEFAULT = Path.home() / "OneDrive - InsightAlly" / "03-Ops" / "knowledgebase"

COMPANY_SKIP = frozenset({
    ".git", ".github", ".obsidian", "SharePoint", "node_modules", ".venv", "__pycache__",
})
PERSONAL_SKIP = frozenset({
    ".git", ".github", ".obsidian", ".smart-env", ".claude", ".opencode", "node_modules",
    ".venv", "__pycache__", ".pnpm-store", "dist", "build", ".vite", ".turbo", ".next",
})

MIRROR_COMPANY_PREFIX = "00 - Housekeeping/Mirrored_from_Staging_Zettelkasten/"
IMPORTS_PREFIX = "00 - Housekeeping/Imports/"

LEXICAL_COMPANY_PREFIXES = (
    "01 - Operations/",
    "02 - Engineering/",
    "03 - Projects/",
)

FRONTMATTER_RE = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL | re.MULTILINE)
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")
NON_WORD_RE = re.compile(r"[^\w\s]+", re.UNICODE)
WS_RE = re.compile(r"\s+")

STOPWORDS = frozenset(
    """
    the a an and or but if in on at to for of as is was are were be been being
    with by from than that this these those it its into not no yes so such
    any all each every both few more most other some only own same than too very
    can will just should now then here there when where while which who whom what
    about also over after before again further once have has had having do does did
    may might must shall could would your you we they them their our my his her its
    one two first last new old get got use used using make made like via per eg ie vs etc
    """.split()
)


def should_skip(rel: Path, skip: frozenset[str]) -> bool:
    return any(p in skip for p in rel.parts)


def strip_markdown_noise(text: str) -> str:
    text = FRONTMATTER_RE.sub("", text)
    text = WIKILINK_RE.sub(r" \1 ", text)
    text = MD_LINK_RE.sub(r" \1 ", text)
    text = NON_WORD_RE.sub(" ", text)
    text = WS_RE.sub(" ", text).strip().lower()
    return text


def iter_md(root: Path, skip: frozenset[str]) -> list[Path]:
    out: list[Path] = []
    for p in root.rglob("*.md"):
        try:
            rel = p.relative_to(root)
        except ValueError:
            continue
        if should_skip(rel, skip):
            continue
        out.append(p)
    return sorted(out)


def file_meta(path: Path) -> tuple[float, int, str]:
    """mtime (epoch seconds), size, normalized_sha256_hex."""
    try:
        st = path.stat()
        raw = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return 0.0, 0, ""
    body = strip_markdown_noise(raw)
    h = hashlib.sha256(body.encode("utf-8")).hexdigest() if body else ""
    return st.st_mtime, st.st_size, h


def git_last_iso(root: Path, rel_posix: str) -> str | None:
    if not (root / ".git").exists():
        return None
    try:
        cp = subprocess.run(
            ["git", "-C", str(root), "log", "-1", "--format=%cI", "--", rel_posix],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
        if cp.returncode != 0:
            return None
        s = cp.stdout.strip()
        return s or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def mirror_company_to_personal_relpath(company_rel: str) -> str | None:
    if not company_rel.startswith(MIRROR_COMPANY_PREFIX):
        return None
    rest = company_rel[len(MIRROR_COMPANY_PREFIX) :]
    # Personal housekeeping uses "0 - Housekeeping"; mirror README: source 0 - Housekeeping/
    # Company mirror uses Desktop_Setup vs personal "Desktop Setup" — normalize underscores in segments
    parts = rest.split("/")
    parts = [p.replace("_", " ") for p in parts]
    rest2 = "/".join(parts)
    return "0 - Housekeeping/" + rest2


def scrutiny_tier(
    *,
    mirror: bool,
    imports: bool,
    identical_hash: bool,
    lexical_score: float | None,
) -> str:
    if imports:
        return "T0_IMPORT_FOLDER"
    if mirror:
        return "T1_EXPLICIT_MIRROR"
    if identical_hash:
        return "T2_IDENTICAL_NORMALIZED_BODY"
    if lexical_score is not None and lexical_score >= 0.35:
        return "T3_HIGH_LEXICAL_OVERLAP"
    if lexical_score is not None and lexical_score >= 0.12:
        return "T4_MODERATE_LEXICAL_OVERLAP"
    return "T5_OTHER"


def temporal_label(p_mtime: float, c_mtime: float, same_hash: bool, threshold_sec: float) -> str:
    if same_hash:
        if abs(p_mtime - c_mtime) <= threshold_sec:
            return "SAME_BODY_NEAR_SAME_FS_TIME"
        if p_mtime < c_mtime:
            return "SAME_BODY_PERSONAL_FS_OLDER"
        return "SAME_BODY_COMPANY_FS_OLDER"
    if abs(p_mtime - c_mtime) <= threshold_sec:
        return "CONCURRENT_FS_WINDOW"
    if p_mtime < c_mtime:
        return "PERSONAL_FS_OLDER"
    return "COMPANY_FS_OLDER"


# --- lightweight lexical index (personal) for 01/02/03 company notes only ---

def tokenize_for_lex(s: str, min_len: int = 4) -> list[str]:
    return [t for t in s.split() if len(t) >= min_len and t not in STOPWORDS]


def build_personal_lex_index(personal_root: Path, max_df: int) -> tuple[dict[str, int], list[tuple[str, Counter[str]]], int]:
    df: dict[str, int] = defaultdict(int)
    doc_words: list[tuple[str, Counter[str]]] = []
    for path in iter_md(personal_root, PERSONAL_SKIP):
        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        words = tokenize_for_lex(strip_markdown_noise(raw))
        if not words:
            continue
        ctr = Counter(words)
        rel = path.relative_to(personal_root).as_posix()
        doc_words.append((rel, ctr))
        for w in ctr:
            df[w] += 1
    filtered = {w: n for w, n in df.items() if n <= max_df}
    return filtered, doc_words, len(doc_words)


def inverted_lex(inv_docs: list[tuple[str, Counter[str]]], filtered: dict[str, int]):
    inv: dict[str, list[tuple[str, int]]] = defaultdict(list)
    for rel, ctr in inv_docs:
        for w, c in ctr.items():
            if w in filtered:
                inv[w].append((rel, min(c, 8)))
    return inv


def score_company_note(c_words: list[str], inv, filtered, n_personal: int) -> dict[str, float]:
    if not c_words:
        return {}
    c_ctr = Counter(c_words)
    scores: dict[str, float] = defaultdict(float)
    for w, tf_c in c_ctr.items():
        if w not in inv:
            continue
        idf = math.log((1 + n_personal) / (1 + filtered.get(w, n_personal)))
        weight = (1.0 + idf) * min(tf_c, 6)
        for rel_p, tf_p in inv[w]:
            scores[rel_p] += weight * min(tf_p, 4)
    denom = max(5.0, sum(min(c_ctr[w], 6) for w in c_ctr))
    raw = {p: s / denom for p, s in scores.items()}
    if not raw:
        return {}
    top = max(raw.values())
    return {p: v / top for p, v in raw.items()} if top > 0 else {}


@dataclass
class PairRow:
    company_rel: str
    personal_rel: str | None
    personal_mtime_iso: str
    company_mtime_iso: str
    same_normalized_hash: bool
    temporal_fs: str
    git_personal: str | None
    git_company: str | None
    tier: str
    lexical_top_score: float | None = None
    overlap_json_score: float | None = None
    notes: str = ""


def main() -> int:
    ap = argparse.ArgumentParser(description="KB differential map: company vs personal.")
    ap.add_argument("--company-root", type=Path, default=COMPANY_ROOT_DEFAULT)
    ap.add_argument("--personal-root", type=Path, default=PERSONAL_ROOT_DEFAULT)
    ap.add_argument("--out", type=Path, default=None, help="Markdown output path")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--no-lexical", action="store_true")
    ap.add_argument("--max-df", type=int, default=400)
    ap.add_argument("--overlap-json", type=Path, default=None, help="Merge IP_OVERLAP_*.json scores")
    ap.add_argument("--concurrent-sec", type=float, default=900.0, help="FS mtime window for 'concurrent'")
    args = ap.parse_args()

    company = args.company_root.resolve()
    personal = args.personal_root.resolve()
    if not company.is_dir() or not personal.is_dir():
        print("Company or personal root missing. Set --company-root / --personal-root.", file=sys.stderr)
        return 2

    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")

    # Index personal files
    p_index: dict[str, tuple[float, int, str]] = {}
    for p in iter_md(personal, PERSONAL_SKIP):
        rel = p.relative_to(personal).as_posix()
        p_index[rel] = file_meta(p)

    # Index company files
    c_index: dict[str, tuple[float, int, str]] = {}
    for p in iter_md(company, COMPANY_SKIP):
        rel = p.relative_to(company).as_posix()
        c_index[rel] = file_meta(p)

    # Optional overlap JSON: company_rel -> {personal: score}
    overlap_map: dict[str, dict[str, float]] = {}
    if args.overlap_json and args.overlap_json.is_file():
        data = json.loads(args.overlap_json.read_text(encoding="utf-8"))
        for block in data.get("per_company_note", []):
            cr = block.get("company_note", "")
            overlap_map[cr] = {
                m["personal_note"]: float(m["score"])
                for m in block.get("matches", [])
            }

    rows: list[PairRow] = []

    # 1) Mirror pairs
    for crel, (cmt, csz, ch) in c_index.items():
        prel = mirror_company_to_personal_relpath(crel)
        if not prel:
            continue
        if prel not in p_index:
            rows.append(
                PairRow(
                    company_rel=crel,
                    personal_rel=None,
                    personal_mtime_iso="(missing on personal)",
                    company_mtime_iso=datetime.fromtimestamp(cmt, tz=timezone.utc).isoformat(),
                    same_normalized_hash=False,
                    temporal_fs="NO_PERSONAL_FILE",
                    git_personal=None,
                    git_company=git_last_iso(company, crel),
                    tier="T1_EXPLICIT_MIRROR",
                    notes="Mirror path has no matching personal file (name drift?)",
                )
            )
            continue
        pm, psz, ph = p_index[prel]
        same = bool(ch and ph and ch == ph)
        rows.append(
            PairRow(
                company_rel=crel,
                personal_rel=prel,
                personal_mtime_iso=datetime.fromtimestamp(pm, tz=timezone.utc).isoformat(),
                company_mtime_iso=datetime.fromtimestamp(cmt, tz=timezone.utc).isoformat(),
                same_normalized_hash=same,
                temporal_fs=temporal_label(pm, cmt, same, args.concurrent_sec),
                git_personal=git_last_iso(personal, prel),
                git_company=git_last_iso(company, crel),
                tier="T1_EXPLICIT_MIRROR",
                overlap_json_score=(overlap_map.get(crel, {}).get(prel)),
            )
        )

    # 2) Identical hash, non-mirror pairs (cross-vault duplicates)
    hash_to_personal: dict[str, list[str]] = defaultdict(list)
    hash_to_company: dict[str, list[str]] = defaultdict(list)
    for rel, (_, _, h) in p_index.items():
        if h:
            hash_to_personal[h].append(rel)
    for rel, (_, _, h) in c_index.items():
        if h:
            hash_to_company[h].append(rel)

    mirror_pairs_seen = {(r.company_rel, r.personal_rel) for r in rows if r.personal_rel}

    for h, clist in hash_to_company.items():
        plist = hash_to_personal.get(h, [])
        if not plist:
            continue
        for cr in clist:
            if cr.startswith(MIRROR_COMPANY_PREFIX):
                continue  # already covered
            for pr in plist:
                if (cr, pr) in mirror_pairs_seen:
                    continue
                pm, _, _ = p_index[pr]
                cm, _, _ = c_index[cr]
                same = True
                rows.append(
                    PairRow(
                        company_rel=cr,
                        personal_rel=pr,
                        personal_mtime_iso=datetime.fromtimestamp(pm, tz=timezone.utc).isoformat(),
                        company_mtime_iso=datetime.fromtimestamp(cm, tz=timezone.utc).isoformat(),
                        same_normalized_hash=same,
                        temporal_fs=temporal_label(pm, cm, same, args.concurrent_sec),
                        git_personal=git_last_iso(personal, pr),
                        git_company=git_last_iso(company, cr),
                        tier="T2_IDENTICAL_NORMALIZED_BODY",
                        overlap_json_score=overlap_map.get(cr, {}).get(pr),
                    )
                )

    # 3) Lexical: company 01/02/03 vs personal
    lex_rows: list[PairRow] = []
    if not args.no_lexical:
        filtered, doc_words, n_p = build_personal_lex_index(personal, args.max_df)
        inv = inverted_lex(doc_words, filtered)
        for cpath in iter_md(company, COMPANY_SKIP):
            crel = cpath.relative_to(company).as_posix()
            if not any(crel.startswith(pfx) for pfx in LEXICAL_COMPANY_PREFIXES):
                continue
            if crel.startswith(MIRROR_COMPANY_PREFIX) or crel.startswith(IMPORTS_PREFIX):
                continue
            try:
                raw = cpath.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            c_words = tokenize_for_lex(strip_markdown_noise(raw))
            scores = score_company_note(c_words, inv, filtered, max(1, n_p))
            if not scores:
                continue
            top_p, top_s = max(scores.items(), key=lambda x: x[1])
            if top_s < 0.08:
                continue
            # only add if not already have a row for this pair with stronger tier
            existing = {(r.company_rel, r.personal_rel) for r in rows}
            if (crel, top_p) in existing:
                continue
            pm, _, ph = p_index.get(top_p, (0.0, 0, ""))
            cm, _, ch = c_index[crel]
            same = bool(ph and ch and ph == ch)
            tier = scrutiny_tier(
                mirror=False,
                imports=False,
                identical_hash=same,
                lexical_score=top_s,
            )
            lex_rows.append(
                PairRow(
                    company_rel=crel,
                    personal_rel=top_p,
                    personal_mtime_iso=datetime.fromtimestamp(pm, tz=timezone.utc).isoformat(),
                    company_mtime_iso=datetime.fromtimestamp(cm, tz=timezone.utc).isoformat(),
                    same_normalized_hash=same,
                    temporal_fs=temporal_label(pm, cm, same, args.concurrent_sec),
                    git_personal=git_last_iso(personal, top_p),
                    git_company=git_last_iso(company, crel),
                    tier=tier,
                    lexical_top_score=round(top_s, 4),
                    overlap_json_score=overlap_map.get(crel, {}).get(top_p),
                )
            )
        rows.extend(lex_rows)

    # 4) Imports folder listing (no auto personal mapping)
    import_notes = [r for r in c_index if r.startswith(IMPORTS_PREFIX)]

    # Sort output: tier then company path
    tier_order = {
        "T1_EXPLICIT_MIRROR": 1,
        "T2_IDENTICAL_NORMALIZED_BODY": 2,
        "T3_HIGH_LEXICAL_OVERLAP": 3,
        "T4_MODERATE_LEXICAL_OVERLAP": 4,
        "T5_OTHER": 5,
        "T0_IMPORT_FOLDER": 0,
    }
    rows.sort(key=lambda r: (tier_order.get(r.tier, 9), r.company_rel))

    out_md = args.out
    if out_md is None:
        log_dir = personal / "0 - Housekeeping" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        out_md = log_dir / f"KB_DIFFERENTIAL_{day}.md"

    lines: list[str] = [
        "# Knowledgebase differential map (company ↔ personal)",
        "",
        f"- **Generated (UTC):** {now}",
        f"- **Company KB:** `{company}`",
        f"- **Personal vault:** `{personal}`",
        "",
        "> **Not legal advice.** This is a **technical/factual** map: paths, filesystem mtimes, normalized-content hash equality, and optional lexical similarity. **OneDrive / sync can rewrite `mtime`** — prefer **git** dates when available; corroborate with your own memory and exports.",
        "",
        "## Scrutiny tiers (operational labels)",
        "",
        "| Tier | Meaning |",
        "| --- | --- |",
        "| **T0** | Company `Imports/` — provenance varies; review manually. |",
        "| **T1** | Explicit mirror path (`Mirrored_from_Staging_Zettelkasten/` → `0 - Housekeeping/`). |",
        "| **T2** | Same normalized markdown body (hash match), not necessarily mirror path. |",
        "| **T3** | High lexical overlap (top personal match ≥ 0.35) under 01/02/03. |",
        "| **T4** | Moderate overlap (0.12–0.35). |",
        "| **T5** | Other / not scored here. |",
        "",
        "## Temporal labels (FS + same-body)",
        "",
        "- **PERSONAL_FS_OLDER** / **COMPANY_FS_OLDER**: ordered by file `mtime` (unreliable on cloud sync).",
        "- **CONCURRENT_FS_WINDOW**: mtimes within `--concurrent-sec` (default 900s).",
        "- **SAME_BODY_***: normalized hash identical; still verify authorship outside this tool.",
        "",
        f"- **Import-folder notes (company only, not paired):** {len(import_notes)}",
        "",
        "## Paired rows",
        "",
        "| Tier | Company note | Personal note | Same body? | FS temporal | Top lexical | Git (p) | Git (c) |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]

    for r in rows:
        lines.append(
            "| {tier} | `{cr}` | `{pr}` | {sh} | {tm} | {lx} | {gp} | {gc} |".format(
                tier=r.tier.replace("T1_EXPLICIT_MIRROR", "T1").replace("T2_IDENTICAL_NORMALIZED_BODY", "T2").replace("T3_HIGH_LEXICAL_OVERLAP", "T3").replace("T4_MODERATE_LEXICAL_OVERLAP", "T4"),
                cr=r.company_rel,
                pr=r.personal_rel or "—",
                sh="yes" if r.same_normalized_hash else "no",
                tm=r.temporal_fs,
                lx=r.lexical_top_score if r.lexical_top_score is not None else "—",
                gp=r.git_personal or "—",
                gc=r.git_company or "—",
            )
        )

    lines.extend(
        [
            "",
            "## Imports folder (company) — list",
            "",
            "Review manually for provenance; no automatic personal path.",
            "",
        ]
    )
    for ir in sorted(import_notes)[:200]:
        lines.append(f"- `{ir}`")
    if len(import_notes) > 200:
        lines.append(f"- … and {len(import_notes) - 200} more")

    lines.extend(
        [
            "",
            "## Suggested human interpretation (non-legal)",
            "",
            "1. **T1 + PERSONAL_FS_OLDER** often matches “copied personal → company mirror,” but **not always**.",
            "2. **T2** means text matches after stripping frontmatter/wikilinks noise — still need **authorship** evidence (git, exports).",
            "3. **T3/T4** means “similar vocabulary,” not copying — cross-check with `ip_overlap_scan.py` JSON if you have it (`--overlap-json`).",
            "4. For PIIA / counsel: export this file + git logs + dated PDFs as **your** evidence package.",
            "",
        ]
    )

    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out_md}")

    if args.json:
        jp = out_md.with_suffix(".json")
        payload = {
            "generated_utc": now,
            "company_root": str(company),
            "personal_root": str(personal),
            "import_folder_note_count": len(import_notes),
            "pairs": [
                {
                    "tier": r.tier,
                    "company_rel": r.company_rel,
                    "personal_rel": r.personal_rel,
                    "same_normalized_hash": r.same_normalized_hash,
                    "temporal_fs": r.temporal_fs,
                    "lexical_top_score": r.lexical_top_score,
                    "overlap_json_score": r.overlap_json_score,
                    "git_personal": r.git_personal,
                    "git_company": r.git_company,
                    "notes": r.notes,
                }
                for r in rows
            ],
        }
        jp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"Wrote {jp}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
