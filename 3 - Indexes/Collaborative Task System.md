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

Themes: [[Workflow & Tooling]]

# Collaborative Task System — Architecture & Future Automation

> This note documents the task management system sitting on top of the Obsidian vault, and tracks the automation roadmap for self-maintaining project awareness.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MASTER PROJECT INDEX                   │
│  Single source of truth. All projects, ranked, linked.   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Breakdown    │  │  Breakdown    │  │  Breakdown    │  │
│  │  Notes (P0)   │  │  Notes (P1)   │  │  Notes (P2+)  │  │
│  │              │  │              │  │              │   │
│  │ Tasks        │  │ Tasks        │  │ Tasks        │   │
│  │ Subtasks     │  │ Subtasks     │  │ Subtasks     │   │
│  │ Dependencies │  │ Dependencies │  │ Dependencies │   │
│  │ Assignees    │  │ Assignees    │  │ Assignees    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  AUTOMATION LAYER                                        │
│                                                          │
│  scan_projects.py ──→ Task counts, stale detection,     │
│                       interdependency mapping            │
│                                                          │
│  semantic_tagger.py ──→ Theme classification,            │
│                         orphan detection                 │
│                                                          │
│  [FUTURE] auto_triage.py ──→ Priority recalculation,    │
│                               deadline enforcement,      │
│                               notification system        │
│                                                          │
│  [FUTURE] vault_sync.py ──→ Shared view generation      │
│                              for Kenya's access          │
├─────────────────────────────────────────────────────────┤
│  VIEWS                                                   │
│                                                          │
│  Obsidian:  Kanban plugin, Dataview queries              │
│  CLI:       scan_projects.py --report                    │
│  Web:       Life Engine GUI layer (React PWA)             │
│  Shared:    [FUTURE] Exported HTML dashboard             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Conventions

### Assignee Tags
Use inline code tags on tasks to mark ownership:
- `` `#L` `` = Landon
- `` `#K` `` = Kenya
- `` `#L+K` `` = Joint / collaborative
- `` `#C` `` = Claude (automated)

### Task Format
```markdown
- [ ] Task description `#L`
  - [ ] Subtask
  - [ ] Subtask with dependency: depends on [[Other Task]]
```

### Priority Convention
In Breakdown notes, use the header block:
```markdown
> **Priority:** P0 — NOW
> **Owners:** L+K
> **Status:** Active
```

### Completion Protocol
1. Check off the task in the Breakdown note: `- [x] Task`
2. If the project status changed, update [[Master Project Index]]
3. Run `./scripts/scan_projects.py` to verify counts

---

## Automation Roadmap (TODO)

### Phase 1 — Scanning (NOW)
- [x] `scan_projects.py` — scan Breakdown notes for task counts `#C`
- [x] Stale project detection `#C`
- [x] Interdependency mapping from wikilinks `#C`
- [x] JSON export for machine consumption `#C`
- [ ] Vault-wide checkbox aggregation by directory `#C`

### Phase 2 — Auto-Triage (NEXT)
- [ ] `auto_triage.py` — recalculate priorities based on: `#L+C`
  - [ ] Days since last edit
  - [ ] Blocker age (blocked > 7 days = escalate)
  - [ ] Dependency chain depth (deeper = higher risk)
  - [ ] Completion percentage vs deadline proximity
- [ ] Weekly summary email/notification `#L`
- [ ] Slack webhook for priority changes `#L`

### Phase 3 — Shared View (LATER)
- [ ] Generate static HTML dashboard from scan data `#L+C`
  - [ ] Hostable on SiteGround alongside Life Engine
  - [ ] Kenya can view without Obsidian
  - [ ] Real-time via cron + git push
- [ ] Life Engine GUI vault integration (parse checkboxes into game) `#L`
- [ ] Thread Commander project-awareness feed `#L`

### Phase 4 — Self-Maintaining (SOMEDAY)
- [ ] Git hook: on commit, auto-run scan_projects.py `#C`
- [ ] Auto-update Master Project Index with fresh counts `#C`
- [ ] Auto-detect new CLAUDE.md files and suggest adding to Master Index `#C`
- [ ] Auto-archive completed projects (move to done tier) `#C`
- [ ] Natural language triage: "What should I work on?" → context-aware answer `#L+C`

---

## Dataview Queries (for Obsidian)

### All open tasks across Breakdowns
```dataview
TASK FROM "3 - Indexes"
WHERE contains(file.name, "Breakdown")
WHERE !completed
```

### Project completion dashboard
```dataview
TABLE
  length(filter(file.tasks, (t) => t.completed)) AS "Done",
  length(file.tasks) AS "Total",
  round(length(filter(file.tasks, (t) => t.completed)) / length(file.tasks) * 100) + "%" AS "Progress"
FROM "3 - Indexes"
WHERE contains(file.name, "Breakdown")
SORT file.name ASC
```

### Kenya's tasks
```dataview
TASK FROM "3 - Indexes"
WHERE contains(file.name, "Breakdown")
WHERE contains(text, "#K") OR contains(text, "#L+K")
WHERE !completed
```

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `./scripts/scan_projects.py` | Full project report |
| `./scripts/scan_projects.py --report` | Summary only |
| `./scripts/scan_projects.py --json` | Machine-readable output |
| `./scripts/semantic_tagger.py --report` | Vault health / orphan count |
