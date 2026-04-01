#!/usr/bin/env python3
"""
build_sites.py — Multi-domain vault build filter for Zettelkasten publishing

Usage:
    python3 scripts/build_sites.py                    # Build all domains
    python3 scripts/build_sites.py --domain arx       # Build one domain
    python3 scripts/build_sites.py --domain arx --surface external --build-subdir arx-external
    python3 scripts/build_sites.py --dry-run          # Preview without copying
    python3 scripts/build_sites.py --report           # Print stats only

Reads frontmatter from all vault notes and copies notes matching:
    Published: true
    Sites: [<domain>]

Optional gate (Peter / approver queue):
    PublishApproval: approved
When you pass --require-approval, only notes with PublishApproval: approved
are copied (case-insensitive). Omit the key or use --no-require-approval for
legacy behavior: Published + Sites is enough.

Optional deploy surface (public vs team sites):
    Surface: external   # default — included on public Pages deploys
    Surface: internal   # team-only; excluded from --surface external builds;
                        # included on --surface internal builds (full mirror)

When --surface is omitted, no Surface filter is applied (legacy: all assigned notes).

Output is written to build/<domain>/content/ by default, or build/<subdir>/content/
when you pass --build-subdir (for parallel CI jobs: arx-external vs arx-internal).
ready to be picked up by Quartz v4 (`npx quartz build`).

Domain keys:
    arx      → thearxfoundation.md
    abysmal  → hopefullyabysmal.md
    landon   → landondahle.md
    elryan   → elryantheexplorer.md
"""

import os
import sys
import shutil
import argparse
import re
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

VAULT_ROOT = Path(__file__).parent.parent.resolve()
BUILD_DIR = VAULT_ROOT / "build"

DOMAINS = {
    "arx":     "thearxfoundation.md",
    "abysmal": "hopefullyabysmal.md",
    "landon":  "landondahle.md",
    "elryan":  "elryantheexplorer.md",
}

# Directories to always exclude from scanning
EXCLUDE_DIRS = {
    ".obsidian", ".smart-env", ".git", "build", "scripts",
    "__pycache__", ".claude", "node_modules",
}

# Visibility tiers
VISIBILITY_TIERS = {"public", "link-only", "authenticated", "named"}


# ---------------------------------------------------------------------------
# Frontmatter parsing (stdlib only — no PyYAML)
# ---------------------------------------------------------------------------

def parse_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter from a markdown string. Returns {} on failure."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    yaml_block = text[3:end].strip()
    return _simple_yaml_parse(yaml_block)


def _simple_yaml_parse(yaml_text: str) -> dict:
    """
    Minimal YAML parser for the frontmatter subset used in this vault.
    Handles: strings, booleans, lists (block style), nested keys.
    Not a full YAML parser — covers the patterns actually present.
    """
    result = {}
    lines = yaml_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        # Skip blank lines and comments
        if not line.strip() or line.strip().startswith("#"):
            i += 1
            continue
        # Key: value pair
        m = re.match(r'^(\w[\w &|]*?):\s*(.*)', line)
        if not m:
            i += 1
            continue
        key = m.group(1).strip()
        raw_val = m.group(2).strip()
        # Check if this is a block list (next lines start with '  -')
        if raw_val == "" and i + 1 < len(lines) and re.match(r'^\s+-', lines[i + 1]):
            items = []
            i += 1
            while i < len(lines) and re.match(r'^\s+-\s*(.*)', lines[i]):
                item_m = re.match(r'^\s+-\s*(.*)', lines[i])
                items.append(item_m.group(1).strip().strip('"'))
                i += 1
            result[key] = items
            continue
        # Inline list: [a, b, c]
        if raw_val.startswith("[") and raw_val.endswith("]"):
            inner = raw_val[1:-1]
            if inner.strip():
                result[key] = [x.strip().strip('"') for x in inner.split(",")]
            else:
                result[key] = []
        # Boolean
        elif raw_val.lower() in ("true", "false"):
            result[key] = raw_val.lower() == "true"
        # Quoted string
        elif raw_val.startswith('"') and raw_val.endswith('"'):
            result[key] = raw_val[1:-1]
        # Plain string or empty
        else:
            result[key] = raw_val
        i += 1
    return result


# ---------------------------------------------------------------------------
# Vault scanning
# ---------------------------------------------------------------------------

def iter_notes(vault_root: Path):
    """Yield (path, frontmatter_dict) for every .md file in the vault."""
    for dirpath, dirnames, filenames in os.walk(vault_root):
        # Prune excluded directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            if not fname.endswith(".md"):
                continue
            fpath = Path(dirpath) / fname
            try:
                text = fpath.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            fm = parse_frontmatter(text)
            yield fpath, fm


def _approval_ok(fm: dict, require_approval: bool) -> bool:
    if not require_approval:
        return True
    val = fm.get("PublishApproval", "")
    if isinstance(val, bool):
        return val  # YAML true → treat as approved
    return str(val).strip().lower() == "approved"


def _note_surface(fm: dict) -> str:
    """external = public Pages; internal = team-only slice."""
    v = fm.get("Surface", "external")
    if isinstance(v, bool):
        return "external"
    s = str(v).strip().lower()
    if s in ("internal", "team", "private", "staff"):
        return "internal"
    return "external"


def _surface_ok(fm: dict, surface: str | None) -> bool:
    if surface is None:
        return True
    if surface == "internal":
        return True
    if surface == "external":
        return _note_surface(fm) == "external"
    return True


def collect_publishable(
    vault_root: Path,
    domain: str | None = None,
    *,
    require_approval: bool = False,
    surface: str | None = None,
):
    """
    Return list of (path, frontmatter) for notes that should be published.
    If domain is given, filter to that domain only.
    If require_approval, require PublishApproval: approved (or YAML true).
    If surface is external, omit notes with Surface: internal (team-only).
    If surface is internal, include all publishable notes for the domain (superset).
    If surface is None, do not filter by Surface (legacy).
    """
    results = []
    for fpath, fm in iter_notes(vault_root):
        if not fm.get("Published", False):
            continue
        if not _approval_ok(fm, require_approval):
            continue
        sites = fm.get("Sites", [])
        if isinstance(sites, str):
            sites = [sites]
        if not sites:
            continue  # Published but no Sites → not yet assigned to a domain
        if domain and domain not in sites:
            continue
        if not _surface_ok(fm, surface):
            continue
        results.append((fpath, fm))
    return results


# ---------------------------------------------------------------------------
# Visibility / auth metadata
# ---------------------------------------------------------------------------

def visibility_report(notes):
    """Return a dict of {tier: [paths]} for the given note list."""
    tiers = {t: [] for t in VISIBILITY_TIERS}
    tiers["unknown"] = []
    for fpath, fm in notes:
        vis = fm.get("Visibility", "public")
        if vis in tiers:
            tiers[vis].append(fpath)
        else:
            tiers["unknown"].append(fpath)
    return tiers


def generate_access_policy(notes, domain: str) -> dict:
    """
    Generate a Cloudflare Access policy descriptor for named-user notes.
    Returns a dict that can be serialized to JSON and applied via CF API.
    """
    named_rules = []
    for fpath, fm in notes:
        if fm.get("Visibility") != "named":
            continue
        users = fm.get("AuthorizedUsers", [])
        if isinstance(users, str):
            users = [users]
        if not users:
            continue
        # Relative path from vault root, normalized for URL
        rel = fpath.relative_to(VAULT_ROOT)
        url_path = "/" + str(rel).replace("\\", "/").replace(".md", "")
        named_rules.append({
            "path": url_path,
            "allowed_emails": users,
        })
    return {
        "domain": DOMAINS.get(domain, domain),
        "named_access_rules": named_rules,
    }


# ---------------------------------------------------------------------------
# Build / copy
# ---------------------------------------------------------------------------

def build_domain(
    vault_root: Path,
    domain: str,
    dry_run: bool = False,
    verbose: bool = True,
    *,
    require_approval: bool = False,
    surface: str | None = None,
    build_subdir: str | None = None,
):
    """
    Copy publishable notes for a domain into build/<subdir>/content/.
    subdir defaults to domain. Use build_subdir for parallel CI (e.g. arx-external).
    """
    notes = collect_publishable(
        vault_root, domain, require_approval=require_approval, surface=surface
    )
    sub = build_subdir or domain
    out_dir = BUILD_DIR / sub / "content"

    if verbose:
        surf = f", surface={surface!r}" if surface else ""
        print(f"\n{'[DRY RUN] ' if dry_run else ''}Building: {domain} → {sub}{surf} ({DOMAINS.get(domain)})")
        print(f"  Notes to publish: {len(notes)}")

    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    vis = visibility_report(notes)
    if verbose:
        for tier, paths in vis.items():
            if paths:
                print(f"  {tier}: {len(paths)} notes")

    copied = 0
    for fpath, fm in notes:
        rel = fpath.relative_to(vault_root)
        dest = out_dir / rel
        if not dry_run:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(fpath, dest)
        copied += 1

    if verbose:
        print(f"  {'Would copy' if dry_run else 'Copied'}: {copied} files")

    # Generate access policy JSON
    policy = generate_access_policy(notes, domain)
    policy_path = BUILD_DIR / sub / "access-policy.json"
    if not dry_run and policy["named_access_rules"]:
        import json
        policy_path.parent.mkdir(parents=True, exist_ok=True)
        policy_path.write_text(json.dumps(policy, indent=2))
        if verbose:
            print(f"  Access policy written: {policy_path}")

    return notes


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(vault_root: Path):
    print("\n" + "=" * 70)
    print("BUILD SITES REPORT")
    print("=" * 70)

    all_notes = list(iter_notes(vault_root))
    published = [(p, fm) for p, fm in all_notes if fm.get("Published", False)]
    print(f"Total notes: {len(all_notes)}")
    print(f"Published: {len(published)}")

    # Publish approval queue (for Peter / approver workflow) — only notes with Sites
    with_sites = []
    for p, fm in published:
        s = fm.get("Sites", [])
        if isinstance(s, str):
            s = [s]
        if s:
            with_sites.append((p, fm))
    print(f"\n--- Published with Sites (eligible for Quartz build) ---")
    print(f"  count: {len(with_sites)}")

    pending = []
    approved = []
    other = []
    for p, fm in with_sites:
        pa = fm.get("PublishApproval", "")
        if pa == "" or pa is None:
            other.append((p, fm))
        elif str(pa).strip().lower() in ("approved", "true") or pa is True:
            approved.append((p, fm))
        elif str(pa).strip().lower() in ("pending", "review", "queued"):
            pending.append((p, fm))
        else:
            other.append((p, fm))

    print("\n--- PublishApproval queue (Published + has Sites) ---")
    print(f"  pending/review/queued: {len(pending)}")
    print(f"  approved: {len(approved)}")
    print(f"  no PublishApproval key (legacy / unset): {len(other)}")
    if pending:
        print("  Pending paths:")
        for fpath, _ in pending[:25]:
            print(f"    - {fpath.relative_to(vault_root)}")
        if len(pending) > 25:
            print(f"    ... and {len(pending) - 25} more")
    if approved:
        print("  Approved paths (sample):")
        for fpath, _ in approved[:20]:
            print(f"    - {fpath.relative_to(vault_root)}")
        if len(approved) > 20:
            print(f"    ... and {len(approved) - 20} more")

    # Per-domain breakdown
    print("\n--- Per-Domain Breakdown ---")
    for domain, hostname in DOMAINS.items():
        notes = collect_publishable(vault_root, domain)
        n_ext = len(collect_publishable(vault_root, domain, surface="external"))
        n_int = len(collect_publishable(vault_root, domain, surface="internal"))
        vis = visibility_report(notes)
        print(f"\n  {hostname} ({domain}): {len(notes)} notes (no Surface filter)")
        print(f"    --surface external: {n_ext} | --surface internal: {n_int}")
        for tier, paths in vis.items():
            if paths:
                print(f"    {tier}: {len(paths)}")

    print("\n--- Per-Domain (if --require-approval were used) ---")
    for domain, hostname in DOMAINS.items():
        n = len(collect_publishable(vault_root, domain, require_approval=True))
        print(f"  {hostname} ({domain}): {n} notes with PublishApproval: approved")

    # Published but no Sites
    no_site = [(p, fm) for p, fm in published
               if not fm.get("Sites") or fm.get("Sites") == []]
    print(f"\n--- Published but no Sites assigned: {len(no_site)} ---")
    for fpath, _ in no_site[:10]:
        print(f"  {fpath.relative_to(vault_root)}")
    if len(no_site) > 10:
        print(f"  ... and {len(no_site) - 10} more")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Build multi-domain vault sites")
    parser.add_argument("--domain", choices=list(DOMAINS.keys()),
                        help="Build only this domain")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview without copying files")
    parser.add_argument("--report", action="store_true",
                        help="Print stats report only")
    parser.add_argument(
        "--require-approval",
        action="store_true",
        help="Only copy notes with PublishApproval: approved (Peter queue)",
    )
    parser.add_argument(
        "--surface",
        choices=("external", "internal"),
        default=None,
        help="external = public Pages (omit Surface:internal notes); internal = all notes for domain",
    )
    parser.add_argument(
        "--build-subdir",
        default=None,
        metavar="NAME",
        help="Output under build/NAME/content/ (default: same as --domain). Use for CI parallel builds.",
    )
    args = parser.parse_args()

    if args.report:
        print_report(VAULT_ROOT)
        return

    if args.build_subdir and not args.domain:
        parser.error("--build-subdir requires --domain")

    domains_to_build = [args.domain] if args.domain else list(DOMAINS.keys())

    for domain in domains_to_build:
        build_domain(
            VAULT_ROOT,
            domain,
            dry_run=args.dry_run,
            require_approval=args.require_approval,
            surface=args.surface,
            build_subdir=args.build_subdir,
        )

    if not args.dry_run:
        print(f"\nBuild complete. Output in: {BUILD_DIR}/")
        print("Next: run `npx quartz build` in each build/<domain>/ directory.")
        print("Then: `wrangler pages deploy build/<domain>/public` for each domain.")


if __name__ == "__main__":
    main()
