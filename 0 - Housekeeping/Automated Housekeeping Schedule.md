---
Date Created: "2026-03-27 00:00"
Last Updated: "2026-04-02 12:00"
tags:
  - Area
Index:
  - "[[Housekeeping Notes]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---
Themes: [[Workflow & Tooling]], [[Programming]]

# Automated Housekeeping Schedule

A comprehensive map of all vault automation — what exists, what is planned, and when each task should run. This is the canonical reference for vault maintenance cadence.

---

## Cadence Overview

| Frequency | Tasks |
|-----------|-------|
| Daily | Last Updated sync, orphan quick-report, Windows filename gate (CI / pre-backup) |
| Weekly | Semantic tagging pass, vault health lite (optional), broken wikilink scan, project scan |
| Monthly | Full vault health report, PARA staleness audit, Path/Index refresh, **Chron / membrane** review ([[Chron — Cross-vault IP membrane]] + optional `kb_differential_map.py --json`) |
| On-demand | Pathfinder linking, publish strip, TF-IDF deep tagger, bulk property edit, KB differential map (`kb_differential_map.py`) |

---

## Daily Tasks

### 1. `Last Updated` Sync
**Status**: Planned
**Script**: `scripts/update_last_updated.py` (to be built)
**What it does**: Detects which `.md` files were modified since the last run (via `git diff` or `mtime`) and rewrites the `Last Updated` frontmatter field with the current timestamp.
**Trigger**: On vault open, or via cron at 06:00
**Notes**:
- Only fires on human edits — skip files touched by automation scripts
- Consider a separate `Last Referenced` property if backlinking causes false positives
- See: [[The Note-taker's Housekeeping Bots]]

### 2. Windows filename gate
**Status**: Working
**Script**: `python3 scripts/validate_windows_filenames.py` (any OS); `operator/Windows/validate-windows-filenames.ps1` (Windows wrapper)
**What it does**: Fails if any file or directory **name** (path segment) violates Win32 rules: illegal characters (`<>:"/\|?*` + controls), trailing space/dot, or reserved device names (`CON`, `COM1`, …).
**Trigger**: Every push via GitHub Actions (`validate-windows-names` job before site deploy); `staging-zettel-backup.ps1` before `git pull`; on demand before large imports.
**Notes**: Skips `.git`, `node_modules`, build artifacts per script. **Insight Ally** is building broader company-side checks; a transfer doc will align cross-domain expectations when ready.

### 3. Orphan Quick-Report
**Status**: Working (read-only)
**Script**: `python3 scripts/semantic_tagger.py --report`
**What it does**: Counts unclassified notes and prints theme distribution. No files modified.
**Trigger**: Daily, 06:05 (after `Last Updated` sync)
**Output**: stdout summary — redirect to `0 - Housekeeping/logs/daily-orphan-report.txt` if log retention is desired

### 3b. Vault health (lite) — parity with company checker
**Status**: Working (read-only)
**Script**: `python3 scripts/vault_health_lite.py` (optional `--strict`, `--json`, `--no-wikilinks`, `--include-chatgpt`)
**What it does**: Markdown count, empty `.md`, git summary (tolerates **no commits yet**), large files on disk or in git index, `[[wikilinks]]` / `![[embeds]]` with ChatGPT tree skipped by default (use `--include-chatgpt` for full scan).
**Trigger**: Weekly with semantic tagger, or before pushing to GitHub. **Transfer doc (shared skips / strict rules):** `OneDrive - InsightAlly\Cross_Context_ARX_Daemon\VAULT_HEALTH_SHARED.md`.
**Output**: stdout or JSON

### 3c. KB differential map (company ↔ personal)
**Status**: Working (read-only; logs only)
**Script**: `python3 scripts/kb_differential_map.py` (`--no-lexical` for fast mirror+hash-only, `--json`, optional `--overlap-json` to merge `IP_OVERLAP_*.json` scores)
**What it does**: Mirror path pairs (`Mirrored_from_Staging_*` ↔ `0 - Housekeeping/`), identical normalized-body hashes (T2 cross-vault), optional lexical rows for company `01–03/`. **No copy** into company KB (moratorium).
**Trigger**: On-demand for PIIA / provenance; after large edits on either vault.
**Output**: `0 - Housekeeping/logs/KB_DIFFERENTIAL_YYYY-MM-DD.md` + `.json`

---

## Weekly Tasks

### 4. Semantic Tagging Pass
**Status**: Working
**Script**: `python3 scripts/semantic_tagger.py`
**What it does**: Classifies notes into 22 themes via keyword scoring, writes `Topic` frontmatter, updates `2 - Paths/` and `3 - Indexes/`, appends `Themes:` lines to note bodies.
**Trigger**: Sunday 22:00
**Current state** (2026-03-27): 4,198 notes total; 2,680 unclassified (64%)
**Notes**:
- Run `--dry-run` first if vault has seen heavy edits that week
- Most remaining orphans are in `4 - Source Material/ChatGPT/` — hard to auto-classify
- Pairs with TF-IDF tagger for hard cases (see On-Demand section)

### 5. Broken Wikilink Scan
**Status**: Planned
**Script**: `scripts/check_wikilinks.py` (to be built)
**What it does**: Greps all `[[...]]` patterns, resolves each against the filesystem, reports links that point to nonexistent notes.
**Trigger**: Sunday 22:15 (after semantic tagger)
**Output**: `0 - Housekeeping/logs/broken-links-YYYY-MM-DD.md`
**Notes**:
- Must handle aliased links (`[[Note Name|Display Text]]`) and path-qualified links
- Treat `[[Housekeeping]]` (topic tag) vs. `[[Housekeeping Notes]]` (real note) as distinct

### 6. Project Status Scan
**Status**: Partially built
**Script**: `python3 scripts/scan_projects.py --report`
**What it does**: Scans project breakdown notes, aggregates task completion status, regenerates [[Master Project Index]].
**Trigger**: Monday 06:00 (start of work week)
**Notes**:
- `scan_projects.py` currently needs breakdown notes for E+K Transition Dashboard, Semantic Tagger project, and ARX Portal before it can produce a full report
- See [[Master Project Index]] for current project rankings (P0–P4)

---

## Monthly Tasks

### 7. Full Vault Health Report
**Status**: Planned
**Script**: `scripts/vault_health.py` (to be built, or compose from existing scripts)
**What it does**: Aggregates all health signals into a single dated report note:
- Total note count and growth delta
- Orphan count and % change from last month
- Broken wikilink count
- Frontmatter compliance rate (notes missing required fields)
- PARA tag distribution (Area / Index / Resource / Path)
- Stale note candidates (not updated in 90+ days, still `Status: Unweathered`)
**Trigger**: 1st of month, 07:00
**Output**: `0 - Housekeeping/logs/health-YYYY-MM.md`

### 8. PARA Staleness Audit
**Status**: Planned
**Script**: Extend `scripts/vault_health.py` or standalone `scripts/para_audit.py`
**What it does**: Flags notes by PARA tag whose `Last Updated` exceeds staleness thresholds:
- `Resource` → stale after 180 days
- `Project` → stale after 90 days (likely needs archiving or re-scoping)
- `Area` → stale after 365 days
Produces a suggestion list — **does not auto-archive**; human decision required.
**Trigger**: 1st of month, 07:10 (after vault health report)
**Notes**:
- See [[PARA - How I want to implement]] for transfer rules between categories
- Archive candidates go to an `Archive/` subdirectory (to be defined)

### 9. Path and Index Refresh
**Status**: Partially built
**Script**: `python3 scripts/directories2path_n_index.py`
**What it does**: Converts directory structures into Path and Index files, ensuring the wikilink graph reflects the current filesystem layout.
**Trigger**: 1st of month, 07:20
**Notes**:
- See [[Symlinking Operational directories in nested vaults]] for the broader strategy decision (symlink vs. tags-only)
- Do not run until the Path vs. Index distinction is formally defined — see [[Path vs Index]]

---

## On-Demand Tasks

### 10. TF-IDF Deep Tagger
**Status**: Working
**Script**: `python3 scripts/tfidf_tagger.py`
**What it does**: Tags hard-to-classify orphan notes (especially `4 - Source Material/ChatGPT/`) using TF-IDF similarity against existing classified notes. More aggressive than the keyword scorer.
**When to run**: After a weekly semantic tagger pass still leaves a large orphan backlog, or after a bulk import of new source material.

### 11. Pathfinder — Retroactive Path Linking
**Status**: Planned
**Script**: `scripts/pathfinder.py` (to be built)
**What it does**: When a new Path note is created, scans all vault notes for occurrences of the associated word(s) and inserts wikilinks (`[[Path Name]]` or `[[Path Name|original word]]`). Pushes candidates to a review queue — does not auto-commit.
**When to run**: After creating or renaming a Path note in `2 - Paths/`
**Notes**:
- Support aliases via bracket-pipe notation
- Skip phrases already linked
- Consider the Obsidian plugin as a supplement: https://github.com/AlexW00/obsidian-note-linker
- See [[Pathfinder]]

### 12. Publish Strip
**Status**: Planned
**Script**: `scripts/publish.py` (to be built)
**What it does**: For all notes with `Published: true`, strips sections marked with a `<!-- delete -->` or `%% delete %%` annotation before copying to the public ARX vault output directory.
**When to run**: Manually, before any public vault sync
**Notes**:
- Never auto-set `Published: true` — that is always a human decision
- See [[Properties & Publishing]] in [[Housekeeping Notes]]

### 13. Bulk Property Edit
**Status**: Planned
**Script**: Ad-hoc via `scripts/semantic_tagger.py` + custom one-offs
**What it does**: Batch-updates a frontmatter field across many notes (e.g., rename a tag value, add a missing field, normalize date formats).
**When to run**: As needed — especially after schema changes
**Reference**: https://forum.obsidian.md/t/bulk-edit-properties-surround-author-values-with/67672

### 14. Daily Note Generator
**Status**: Planned
**Script**: `scripts/daily_note.py` (to be built)
**What it does**:
1. Creates a dated note in `5 - Journal/Entries/`
2. Pulls calendar events for the day (cloud calendar integration TBD)
3. Pulls unblocked misc tasks and pre-planned items from prior day's note
4. Formats three tables: Day Plan | Misc Tasks (blocked / unblocked) | Tomorrow's Tasks
5. Adds a free-form Notes section (not pulled by automation)
**When to run**: Daily 06:00 (before orphan report)
**Notes**: See [[Calendar and Productivity]] for full design spec

---

## Implementation Priority

| Priority | Task | Effort | Blocks |
|----------|------|--------|--------|
| P0 | `Last Updated` sync (task 1) | Low | Nothing |
| P0 | Broken wikilink scan (task 5) | Medium | Nothing |
| P1 | Full vault health report (task 7) | Medium | Task 1 (for accurate staleness) |
| P1 | PARA staleness audit (task 8) | Low | Task 7 |
| P2 | Pathfinder (task 11) | High | Path vs Index distinction resolved |
| P2 | Daily note generator (task 14) | Medium | Calendar integration decision |
| P3 | Publish strip (task 12) | Medium | Published workflow finalized |
| P3 | Path and Index refresh (task 9) | Low | Path vs Index definition done |
| P4 | Bulk property edit (task 13) | Low | Schema stabilization |

---

## Suggested Cron Schedule

```cron
# Vault Automated Housekeeping
# (run from vault root; adjust python path as needed)

# Daily — 06:00: Last Updated sync
0 6 * * * cd /path/to/vault && python3 scripts/update_last_updated.py >> logs/housekeeping.log 2>&1

# Daily — 06:02: Windows filename gate (fails on illegal names; keep logs)
2 6 * * * cd /path/to/vault && python3 scripts/validate_windows_filenames.py >> logs/housekeeping.log 2>&1

# Daily — 06:05: Orphan quick-report
5 6 * * * cd /path/to/vault && python3 scripts/semantic_tagger.py --report >> logs/daily-orphan-report.txt 2>&1

# Daily — 06:10: Daily note generator (when built)
# 10 6 * * * cd /path/to/vault && python3 scripts/daily_note.py >> logs/housekeeping.log 2>&1

# Weekly Sunday 22:00 — Semantic tagging pass
0 22 * * 0 cd /path/to/vault && python3 scripts/semantic_tagger.py >> logs/housekeeping.log 2>&1

# Weekly Sunday 22:15 — Broken wikilink scan (when built)
# 15 22 * * 0 cd /path/to/vault && python3 scripts/check_wikilinks.py >> logs/broken-links-$(date +\%Y-\%m-\%d).md 2>&1

# Weekly Monday 06:00 — Project scan
0 6 * * 1 cd /path/to/vault && python3 scripts/scan_projects.py --report >> logs/housekeeping.log 2>&1

# Monthly 1st 07:00 — Vault health report (when built)
# 0 7 1 * * cd /path/to/vault && python3 scripts/vault_health.py >> logs/housekeeping.log 2>&1

# Monthly 1st 07:10 — PARA staleness audit (when built)
# 10 7 1 * * cd /path/to/vault && python3 scripts/para_audit.py >> logs/housekeeping.log 2>&1

# Monthly 1st 07:20 — Path/Index refresh
# 20 7 1 * * cd /path/to/vault && python3 scripts/directories2path_n_index.py >> logs/housekeeping.log 2>&1
```

> Commented-out lines are for scripts not yet built. Uncomment as each is completed.

---

## Scripts Build Backlog

- [ ] `scripts/update_last_updated.py` — Last Updated frontmatter sync
- [ ] `scripts/check_wikilinks.py` — Broken wikilink scanner
- [ ] `scripts/vault_health.py` — Monthly health report composer
- [ ] `scripts/para_audit.py` — PARA staleness auditor
- [ ] `scripts/pathfinder.py` — Retroactive Path wikilink injector
- [ ] `scripts/publish.py` — Publish strip for public ARX vault
- [ ] `scripts/daily_note.py` — Daily note generator with calendar + task pull

---

---

## Claude Code Setup

The primary automation mechanism is **Claude Code remote scheduled agents** — cloud-hosted Claude sessions that fire on a cron schedule via `/schedule` in the Claude Code GUI. No daemon, no cron, no local machine required.

---

### Remote Scheduled Agents (Primary)

Run `/schedule` in a Claude Code session to create each agent below. Each entry shows the cron expression and the exact prompt to paste.

| # | Name | Cron | Prompt |
|---|------|------|--------|
| 1 | Daily Orphan Report | `5 6 * * *` | `Run python3 scripts/semantic_tagger.py --report and summarize orphan count and theme coverage.` |
| 2 | Weekly Semantic Tag | `0 22 * * 0` | `Run python3 scripts/semantic_tagger.py to classify orphaned notes. Commit any changed files with message "chore: weekly semantic tag pass".` |
| 3 | Weekly Project Scan | `0 6 * * 1` | `Run python3 scripts/scan_projects.py --report and update [[Master Project Index]] with current project status. Commit changes.` |
| 4 | Monthly Deep Tag | `0 7 1 * *` | `Run python3 scripts/tfidf_tagger.py to tag hard-to-classify orphans, then run python3 scripts/directories2path_n_index.py to refresh Path and Index files. Commit all changes with message "chore: monthly vault refresh".` |

**Status**: Pending setup — `/schedule` connection was unavailable on 2026-03-27. Retry when resolved.

---

### Fallbacks (no claude.ai access)

If the remote scheduler is unavailable, use native cron as a no-Claude fallback. These run the underlying scripts directly without a Claude session.

Scripts are in `scripts/deprecated/` — see deprecation notices in each file before use.

```cron
# Paste into: crontab -e
VAULT=/home/user/Staging_Zettelkasten

5 6 * * *   cd $VAULT && python3 scripts/semantic_tagger.py --report >> logs/daily-orphan-report.txt 2>&1
0 22 * * 0  cd $VAULT && python3 scripts/semantic_tagger.py >> logs/housekeeping.log 2>&1
0 6 * * 1   cd $VAULT && python3 scripts/scan_projects.py --report >> logs/housekeeping.log 2>&1
0 7 1 * *   cd $VAULT && python3 scripts/tfidf_tagger.py >> logs/housekeeping.log 2>&1
20 7 1 * *  cd $VAULT && python3 scripts/directories2path_n_index.py >> logs/housekeeping.log 2>&1
```

---

## Related Notes

- [[The Note-taker's Housekeeping Bots]] — original automation wishlist
- [[Calendar and Productivity]] — daily note design spec
- [[Pathfinder]] — retroactive Path linking spec
- [[Path vs Index]] — distinction definition (unresolved)
- [[Symlinking Operational directories in nested vaults]] — vault interoperability strategy
- [[PARA - How I want to implement]] — transfer rules for PARA categories
- [[Master Project Index]] — active project rankings
- [[Housekeeping Notes]] — properties and publishing automation
