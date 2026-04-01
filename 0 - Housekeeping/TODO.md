---
Date Created: 2026-03-11
Last Updated: 2026-03-21
tags:
  - Project
Index:
  - "[[Housekeeping Notes]]"
Topic:
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

# Housekeeping TODO — Pointer Note

All TODOs have been distributed to their relevant notes for in-context redundancy. This note serves as a map so you (or any human helper) can find them.

---

## Master Project System (NEW)
> **Start here for all project management:** [[Master Project Index]]

- All active ARX projects ranked by urgency (P0-P4)
- Task breakdowns with subtasks and dependencies per project
- Collaborative assignments (L, K, L+K, C)
- Interdependency map across all projects
- Automation: `./scripts/scan_projects.py --report`
- System [[Architecture]]: [[Collaborative Task System]]
- Template for new projects: use `Project Breakdown Template` in `1 - Templates/`

### Next Steps (from 2026-03-21 session)
- [ ] Create breakdown notes for remaining P0-P2 projects (E+K Transition Dashboard, Semantic Tagger, ARX Portal)
- [ ] Build `./scripts/scan_projects.py` to auto-scan breakdowns and generate the Master Project Index
- [ ] Add the `Project Breakdown Template` to `1 - Templates/`
- [ ] Wire up other Operator projects (Xatalyst, SCOOL) into the Master Project Index
- [ ] Review and flesh out [[The Life Engine Breakdown]] subtasks with time estimates and dependencies

---

## Vault Automation
> Full details with checkboxes: [[The Note-taker's Housekeeping Bots]]

- `Last Updated` property automation
- PARA transfer suggestions (auto-archive stale Resources/Projects/Areas)
- `directories2path-n-index` script
- [[Pathfinder]] (retroactive Path linking)
- Automated publishing system (strip "delete" sections)
- Bulk property editing / automation

## Vault Structure & Interoperability
> Full details with checkboxes: [[Symlinking Operational directories in nested vaults]]

- Decide on symlink strategy (Option A/B/C)
- Deduplicate cross-vault notes
- Vault-specific subfolders for paths/indexes/source material
- Migrate fully to Paths and Indexes

## Path vs Index Migration
> Full details with checkboxes: [[0 - Housekeeping/Path vs Index|Path vs Index]]

- Define the distinction
- Stop using filesystem as organizational crutch
- `directories2path-n-index` script

## Calendar & Daily Planning
> Full details with checkboxes: [[Calendar and Productivity]]

- Daily planning automation script

## Properties & Publishing
> Full details with checkboxes: [[Housekeeping Notes]]

- Bulk property editing
- Automated publishing system

## Personal Goals (from [[Homepage]])

### Quarterly
- Finish Six Sigma White Belt
- Finish MIT OCW — Algorithms and Data Structures
- Watch MIT OCW — [[Neuroscience]] Course
- Read through the list: [[pewdiepie books to read]]

### Vestigial / Ongoing
- Finish [[Digital Cleanse Record|Digital Cleanse]] (backup drive read-only, etc.)
- Plan 5 videos: [[EtE - Video Planning]]
- Make webcam mount

## Misc / Tooling
> Full details with checkboxes: [[To-do]]

- Add to [[To-do]] list from browser
- VSCode — untrust downloads folder
- Kanban [[To-do]] integration (completion dates, dependencies)
- Reach out to Obsidian re: making an OS

---

## Next Session (Semantic Linking / Orphan Reduction) — 2026-03-21

Orphan work remaining after the `claude/semantic-linking-orphans-vYsSN` PR:

- **Guided Journal Template frontmatter**: The individual entries still have stripped-down frontmatter (`Date:` / `Paths:`) instead of the full Zettelkasten schema. Consider a bulk upgrade pass when the person filling them out is ready to commit to the format.
- **Remaining ~151 orphans**: The semantic tagger run fixed the bulk, but ~151 notes still have no Topic links. Run `./scripts/semantic_tagger.py --report` to get the current list and triage which are genuinely unlinkable vs. just needing manual review.
- **`0. Read Me.md` Topic fix**: Currently tagged `[[Programming]]` — should be something like `[[Introspection]]` or `[[Connection]]` given it's a personal biography invitation letter.
- **Guided Journal entries with wrong/empty `Paths:` field**: The `Paths:` key in those files is non-standard. If unifying frontmatter, rename to `Index:` and point to `[[Journal]]`.
- **Source Material orphans**: The bulk of remaining orphans likely live in `4 - Source Material/ChatGPT/` — these are mass-imported and hard to theme automatically. Consider a targeted script pass or spot-checking the worst offenders.
