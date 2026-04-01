---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-13 00:00"
tags:
  - Index
Index:
  - "[[Master Project Index]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]], [[Programming]]

# Vault Automation — Task Breakdown

> **Priority:** P1 — This Week
> **Owners:** L + C (Claude)
> **Location:** `scripts/`, `0 - Housekeeping/`
> **Cross-ref:** [[The Note-taker's Housekeeping Bots]], [[TODO]]

---

## Purpose
Keep the 4,000-note Zettelkasten healthy, organized, and self-maintaining. Every hour spent on automation saves days of manual triage.

---

## Dependencies
```
Semantic Tagger ──→ Pathfinder (needs theme data)
Semantic Tagger ──→ Project Scanner (extends tagger patterns)
directories2path-n-index ──→ Path vs Index migration
Last Updated automation ──→ PARA transfer suggestions (needs timestamp data)
```

---

## Tasks

### 1. Semantic Tagger Enhancements (Active)
- [x] Core keyword scoring engine `#C`
- [x] 22-theme taxonomy `#C`
- [x] Path/Index auto-generation `#C`
- [x] Dry-run and report modes `#C`
- [ ] Add project-awareness (scan CLAUDE.md files for project metadata) `#C`
- [ ] Add task-awareness (scan for `- [ ]` checkboxes, aggregate counts) `#C`
- [ ] Improve theme accuracy with TF-IDF or embedding similarity `#L+C`

### 2. Last Updated Automation
- [ ] Script to update `Last Updated` on non-automated file changes `#L+C`
  - [ ] Git hook approach (post-commit)
  - [ ] Or filesystem watcher approach
- [ ] Consider separate `Last Referenced` property `#L`

### 3. PARA Transfer Suggestions
- [ ] Script to flag stale notes for archival `#L+C`
  - [ ] Resource → Archive after X days untouched
  - [ ] Project → Archive after X days untouched
  - [ ] Area → Archive after X days untouched
- [ ] Queue system for manual accept/reject `#L`

### 4. directories2path-n-index Script
- [ ] Walk directory tree, generate Path notes for each folder `#L+C`
- [ ] Generate Index notes that aggregate by theme `#L+C`
- [ ] Integrate with existing Path/Index structure `#L+C`
- [ ] See [[Symlinking Operational directories in nested vaults]] for strategy

### 5. Pathfinder (Retroactive Linking)
- [ ] When a Path note exists, find all notes containing associated terms `#C`
- [ ] Auto-add wikilinks to those notes `#C`
- [ ] Support Path aliases (bracket-pipe notation) `#C`
- [ ] Push to queue for manual accept/reject `#L`
- [ ] Skip phrases already linked `#C`

### 6. Automated Publishing System
- [ ] Strip sections marked "delete" before publishing `#C`
- [ ] Allow inline notes-to-self during writing `#L`
- [ ] Generate clean output for public ARX vault `#C`

### 7. Project Scanner (NEW — for this UI)
- [ ] Script: `scan_projects.py` `#C`
  - [ ] Scan all CLAUDE.md files for project metadata
  - [ ] Scan all `- [ ]` / `- [x]` checkboxes vault-wide
  - [ ] Aggregate task counts per project
  - [ ] Detect stale projects (no commits/edits in X days)
  - [ ] Output: update Master Project Index automatically
  - [ ] Flag interdependencies from wikilinks between project notes

### 8. Bulk Property Editing
- [ ] Script or Obsidian plugin for mass frontmatter updates `#L+C`
- [ ] Reference: Obsidian forum thread on bulk property editing

---

## Blockers
None. This is a force multiplier — every piece completed accelerates everything else.
