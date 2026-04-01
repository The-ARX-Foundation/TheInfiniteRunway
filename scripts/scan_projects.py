#!/usr/bin/env python3
"""
scan_projects.py — Project Scanner for ARX Vault

Scans the vault for project metadata, task checkboxes, and interdependencies.
Generates a report of project health, task completion rates, and stale projects.

Usage:
    ./scripts/scan_projects.py              # Full report
    ./scripts/scan_projects.py --report     # Summary only
    ./scripts/scan_projects.py --json       # Machine-readable output
    ./scripts/scan_projects.py --update     # Update Master Project Index task counts

Future automation:
    - Cron/scheduled runs for auto-reprioritization
    - Slack/notification integration for stale project alerts
    - Dependency graph visualization export
"""

import os
import re
import sys
import json
import datetime
from pathlib import Path
from collections import defaultdict

VAULT_ROOT = Path(__file__).parent.parent
BREAKDOWN_DIR = VAULT_ROOT / "3 - Indexes"
OPERATOR_DIR = VAULT_ROOT / "6 - Elryan The Explorer" / "The Operator"
PERSONAS_DIR = VAULT_ROOT / "6 - Elryan The Explorer"
HOUSEKEEPING_DIR = VAULT_ROOT / "0 - Housekeeping"

# Patterns
CHECKBOX_OPEN = re.compile(r'^\s*-\s*\[\s\]\s+(.+)', re.MULTILINE)
CHECKBOX_DONE = re.compile(r'^\s*-\s*\[[xX]\]\s+(.+)', re.MULTILINE)
WIKILINK = re.compile(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]')
FRONTMATTER = re.compile(r'^---\s*\n(.*?)\n---', re.DOTALL)
PRIORITY_PATTERN = re.compile(r'\*\*Priority:\*\*\s*(P\d)\s*')
STATUS_PATTERN = re.compile(r'\*\*Status:\*\*\s*(.+?)(?:\s*\||\s*\n)')
OWNER_PATTERN = re.compile(r'\*\*Owners?:\*\*\s*(.+?)(?:\s*\n)')
ASSIGNEE_TAG = re.compile(r'`#([LKC+]+)`')


def scan_checkboxes(filepath):
    """Count open and completed checkboxes in a file."""
    try:
        content = filepath.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return 0, 0

    open_tasks = len(CHECKBOX_OPEN.findall(content))
    done_tasks = len(CHECKBOX_DONE.findall(content))
    return open_tasks, done_tasks


def scan_wikilinks(filepath):
    """Extract all wikilinks from a file."""
    try:
        content = filepath.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return []
    return WIKILINK.findall(content)


def scan_breakdown_files():
    """Scan all Breakdown files in 3 - Indexes/ for project metadata."""
    projects = []

    for f in BREAKDOWN_DIR.glob("*Breakdown*.md"):
        try:
            content = f.read_text(encoding='utf-8', errors='replace')
        except Exception:
            continue

        name = f.stem.replace(" Breakdown", "")
        open_tasks, done_tasks = scan_checkboxes(f)
        total = open_tasks + done_tasks
        completion = (done_tasks / total * 100) if total > 0 else 0

        priority_match = PRIORITY_PATTERN.search(content)
        status_match = STATUS_PATTERN.search(content)
        owner_match = OWNER_PATTERN.search(content)

        # Find assignee distribution
        assignees = ASSIGNEE_TAG.findall(content)
        assignee_counts = defaultdict(int)
        for a in assignees:
            assignee_counts[a] += 1

        # Find wikilink dependencies
        links = WIKILINK.findall(content)

        projects.append({
            'name': name,
            'file': str(f.relative_to(VAULT_ROOT)),
            'priority': priority_match.group(1) if priority_match else 'Unknown',
            'status': status_match.group(1).strip() if status_match else 'Unknown',
            'owner': owner_match.group(1).strip() if owner_match else 'Unknown',
            'open_tasks': open_tasks,
            'done_tasks': done_tasks,
            'total_tasks': total,
            'completion_pct': round(completion, 1),
            'assignee_distribution': dict(assignee_counts),
            'wikilinks': links,
        })

    return sorted(projects, key=lambda p: p.get('priority', 'P9'))


def scan_vault_checkboxes():
    """Scan entire vault for checkbox tasks, grouped by directory."""
    results = defaultdict(lambda: {'open': 0, 'done': 0, 'files': 0})

    for md_file in VAULT_ROOT.rglob("*.md"):
        # Skip hidden dirs
        if any(part.startswith('.') for part in md_file.parts):
            continue

        open_t, done_t = scan_checkboxes(md_file)
        if open_t + done_t > 0:
            # Group by top-level directory
            rel = md_file.relative_to(VAULT_ROOT)
            top_dir = rel.parts[0] if len(rel.parts) > 1 else "Root"
            results[top_dir]['open'] += open_t
            results[top_dir]['done'] += done_t
            results[top_dir]['files'] += 1

    return dict(results)


def detect_stale_projects(days_threshold=14):
    """Find projects with CLAUDE.md files not modified recently."""
    stale = []
    now = datetime.datetime.now()

    for claude_md in VAULT_ROOT.rglob("CLAUDE.md"):
        if claude_md == VAULT_ROOT / "CLAUDE.md":
            continue
        mtime = datetime.datetime.fromtimestamp(claude_md.stat().st_mtime)
        age_days = (now - mtime).days

        if age_days > days_threshold:
            project_dir = claude_md.parent
            stale.append({
                'project': project_dir.name,
                'path': str(project_dir.relative_to(VAULT_ROOT)),
                'last_modified': mtime.strftime('%Y-%m-%d'),
                'days_stale': age_days,
            })

    return sorted(stale, key=lambda x: x['days_stale'], reverse=True)


def find_interdependencies(projects):
    """Map which projects reference which other projects via wikilinks."""
    project_names = {p['name'] for p in projects}
    deps = []

    for p in projects:
        for link in p.get('wikilinks', []):
            # Check if this wikilink points to another project
            clean_link = link.replace(" Breakdown", "")
            if clean_link in project_names and clean_link != p['name']:
                deps.append({
                    'from': p['name'],
                    'to': clean_link,
                })

    return deps


def print_report(projects, vault_tasks, stale, interdeps):
    """Print human-readable report."""
    print("=" * 70)
    print("  ARX VAULT — PROJECT SCANNER REPORT")
    print(f"  Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 70)

    # Project summary
    print("\n## PROJECT STATUS\n")
    print(f"{'Project':<35} {'Pri':>3} {'Status':<12} {'Tasks':>7} {'Done':>5} {'%':>5}")
    print("-" * 70)
    for p in projects:
        task_str = f"{p['done_tasks']}/{p['total_tasks']}"
        print(f"{p['name']:<35} {p['priority']:>3} {p['status']:<12} {task_str:>7} "
              f"{p['done_tasks']:>5} {p['completion_pct']:>4.0f}%")

    # Totals
    total_open = sum(p['open_tasks'] for p in projects)
    total_done = sum(p['done_tasks'] for p in projects)
    total_all = total_open + total_done
    total_pct = (total_done / total_all * 100) if total_all > 0 else 0
    print("-" * 70)
    print(f"{'TOTAL':<35} {'':>3} {'':>12} {f'{total_done}/{total_all}':>7} "
          f"{total_done:>5} {total_pct:>4.0f}%")

    # Vault-wide task distribution
    print("\n## VAULT-WIDE TASK DISTRIBUTION\n")
    print(f"{'Directory':<40} {'Open':>6} {'Done':>6} {'Files':>6}")
    print("-" * 60)
    for dir_name, counts in sorted(vault_tasks.items()):
        print(f"{dir_name:<40} {counts['open']:>6} {counts['done']:>6} {counts['files']:>6}")

    # Stale projects
    if stale:
        print(f"\n## STALE PROJECTS (>{14} days since CLAUDE.md modified)\n")
        for s in stale:
            print(f"  {s['project']:<30} {s['days_stale']} days  ({s['last_modified']})")
    else:
        print("\n## No stale projects detected.\n")

    # Interdependencies
    if interdeps:
        print("\n## INTERDEPENDENCIES\n")
        for d in interdeps:
            print(f"  {d['from']} ──→ {d['to']}")

    # Collaborative tasks
    print("\n## COLLABORATIVE TASKS (L+K)\n")
    collab_count = 0
    for p in projects:
        lk = p['assignee_distribution'].get('L+K', 0)
        k = p['assignee_distribution'].get('K', 0)
        if lk + k > 0:
            print(f"  {p['name']}: {lk} joint tasks, {k} Kenya-only tasks")
            collab_count += lk + k
    if collab_count == 0:
        print("  No collaborative tasks tagged yet.")

    print("\n" + "=" * 70)
    print(f"  Total tracked projects: {len(projects)}")
    print(f"  Total open tasks: {total_open}")
    print(f"  Total completed: {total_done}")
    print(f"  Overall completion: {total_pct:.0f}%")
    print("=" * 70)


def main():
    args = set(sys.argv[1:])

    projects = scan_breakdown_files()
    vault_tasks = scan_vault_checkboxes()
    stale = detect_stale_projects()
    interdeps = find_interdependencies(projects)

    if '--json' in args:
        output = {
            'generated': datetime.datetime.now().isoformat(),
            'projects': projects,
            'vault_tasks': vault_tasks,
            'stale_projects': stale,
            'interdependencies': interdeps,
        }
        print(json.dumps(output, indent=2, default=str))
    else:
        print_report(projects, vault_tasks, stale, interdeps)

    if '--update' in args:
        print("\n[--update mode not yet implemented. Future: auto-update Master Project Index counts.]")


if __name__ == '__main__':
    main()
