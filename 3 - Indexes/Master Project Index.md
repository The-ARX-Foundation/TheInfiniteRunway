---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-21 00:00"
tags:
  - Index
Index:
  - "[[Housekeeping Notes]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]], [[Programming]]

# Master Project Index

> The nerve center. Every active ARX project, ranked by urgency, broken into tasks, mapped by dependency. This is the single source of truth for what you and Kenya are working on, what's blocked, and what moves the needle.

**Owners:** Landon + Kenya
**Last Triaged:** 2026-03-13
**Next Triage:** Weekly (Sundays)

---

## How This Works

### Urgency Tiers
| Tier | Label | Meaning | Color |
|------|-------|---------|-------|
| P0 | **NOW** | Actively on fire or blocking everything else | Red |
| P1 | **This Week** | Must move forward this week or consequences | Orange |
| P2 | **This Month** | Important but not time-critical | Yellow |
| P3 | **This Quarter** | Strategic / skill-building / long-horizon | Blue |
| P4 | **Someday** | Parked ideas with value but no deadline | Gray |

### Status Key
- **Active** — Currently being worked on
- **Blocked** — Waiting on external input or dependency
- **Scoped** — Designed but not started
- **Concept** — Idea phase, needs scoping
- **Delivered** — Shipped, may need maintenance
- **Paused** — Intentionally shelved

### Assignees
- **L** = Landon
- **K** = Kenya
- **L+K** = Both / collaborative
- **C** = Claude (automation)

---

## Project Dashboard

### P0 — NOW
| Project | Persona | Status | Owner | Blocker | Link |
|---------|---------|--------|-------|---------|------|
| [[E+K Transition Dashboard]] | [[The Operator]] | Active | L+K | None | [[E+K Transition Dashboard Breakdown]] |
| The Life Engine | [[The Operator]] | Active | L+K | None | [[The Life Engine Breakdown]] |

> **Note:** Taskylanders has been merged into The Life Engine as its GUI/Game layer. The Life Engine now spans three layers: Software (emotion PWA), GUI/Game (elemental task management, formerly Taskylanders), and Hardware (physical figurines + LEDs). The Persona System is the identity layer running through all three.

### P1 — This Week
| Project | Persona | Status | Owner | Blocker | Link |
|---------|---------|--------|-------|---------|------|
| Tu Madre Tattoo Website | [[The Website Dealer]] | Active | L | Mobile nav, booking backend | [[Website Dealer Projects Breakdown]] |
| Vault Automation (Housekeeping Bots) | Housekeeping | Active | L+C | None | [[Vault Automation Breakdown]] |
| [[Taskylanders]] | [[The Operator]] | Active | L | None | [[Taskylanders Breakdown]] |

### P2 — This Month
| Project | Persona | Status | Owner | Blocker | Link |
|---------|---------|--------|-------|---------|------|
| [[Hopefully Abysmal Website]] | [[The Website Dealer]] | Delivered | L | Are.na iframe, form backend | [[Website Dealer Projects Breakdown]] |
| [[Thread Commander]] | The Operator | Scoped | L | Needs [[Architecture]] decision | [[Thread Commander Breakdown]] |
| [[ARX Homepage]] | The Operator | Delivered | L | None (maintenance) | [[ARX Homepage Breakdown]] |
| Video Planning (5 videos) | [[The Wizard]] | Active | L | Content selection | [[Video Planning Breakdown]] |
| Financial Planning | [[The Financer]] | Active | L+K | None | [[Financial Planning Breakdown]] |

### P3 — This Quarter
| Project | Persona | Status | Owner | Blocker | Link |
|---------|---------|--------|-------|---------|------|
| Six Sigma White Belt | [[The Generalist]] | Paused | L | Time | — |
| MIT OCW Algorithms & DS | [[The Thinker]] | Paused | L | Time | — |
| MIT OCW [[Neuroscience]] | [[The Thinker]] | Paused | L | Time | — |
| Reading List | [[The Thinker]] | Active | L | None | [[pewdiepie books to read]] |
| [[Forma Hardware]] | [[The Website Dealer]] | Scoped | L | Client decision | [[Website Dealer Projects Breakdown]] |
| [[VELLUM]] | The Operator | Scoped | L | Needs Phase 0 funding | [[VELLUM Breakdown]] |
| Digital Cleanse | Housekeeping | Active | L | Backup drive setup | [[Digital Cleanse Record]] |

### P4 — Someday
| Project | Persona | Status | Owner | Blocker | Link |
|---------|---------|--------|-------|---------|------|
| [[ORBUS]] | The Operator | Concept | L | Depends on [[Thread Commander]] + [[VELLUM]] | [[ORBUS Breakdown]] |
| [[Mimmin]] | The Operator | Concept | L | [[Architecture]] decisions | [[Mimmin Breakdown]] |
| ARX Browser | The Operator | Concept | L | [[ARX Foundation Infrastructure]] | — |
| ARX Foundation (.arx TLD) | The Website Dealer | Concept | L | Handshake auction | [[Website Dealer Projects Breakdown]] |
| [[HobbyTown St George]] | The Website Dealer | Blocked | L | Owner input | [[Website Dealer Projects Breakdown]] |
| Nonverbal Coffee Ordering | The Website Dealer | Scoped | L | Target shop selection | [[Website Dealer Projects Breakdown]] |
| [[Creostic Star Order]] | [[The Creostic]] | Concept | L | None | — |
| [[I Blinked]] | [[The Wizard]] | Concept | L | Worldbuilding | — |
| Webcam Mount | Housekeeping | Paused | L | Parts | — |

---

## Interdependency Map

```
VELLUM ──────────┐
                  ├──→ Thread Commander ──→ ORBUS
The Life Engine ──┘          │
  ├─ Software (emotion PWA)  │
  ├─ GUI/Game (Taskylanders) ────→│ (task data feeds Thread Commander)
  ├─ Hardware (figurines)    │
  └─ Personas (identity)    │
                             │
Vault Automation ───────────→│ (semantic tagger feeds project awareness)
                             │
E+K Transition Dashboard ──→ Financial Planning (shared data)
                             │
Tu Madre Website ──→ Hopefully Abysmal ──→ ARX Foundation Infrastructure
                                                    │
                                              ARX Homepage ──→ ARX Browser
                                                    │
                                              Nonverbal Coffee ──→ (client pipeline)
```

### Critical Path
1. **The Life Engine** = The unified system. Software + GUI/Game + Hardware + Personas. Daily driver for you and Kenya, meta-tool for managing everything else.
2. **E+K Transition Dashboard** = Companion daily driver. Emotional data from Life Engine informs decisions.
3. **Thread Commander** = Force multiplier. Depends on VELLUM + Life Engine proving patterns.
4. **Vault Automation** = Keeps the knowledge graph healthy. Feeds everything.

---

## Triage Rules

1. **Every Sunday:** Review this index. Move projects between tiers. Update blockers.
2. **When starting a session:** Check P0 and P1 first. Only touch P2+ if P0-P1 are unblocked.
3. **When finishing a task:** Mark it in the relevant Breakdown note. Update status here if project-level status changed.
4. **Kenya's items:** Anything marked L+K or K should be visible in shared view. Tag with `#collab` in task notes.
5. **Blocked items:** If blocked >7 days, escalate to P0 or kill it.

---

## Quick Links

| Category | Note |
|----------|------|
| All TODOs (pointer) | [[TODO]] |
| Vault Automation | [[The Note-taker's Housekeeping Bots]] |
| Website Dealer TODOs | [[Open Issues and TODOs]] |
| Quarterly Goals | [[Homepage]] |
| Kanban Board | [[Kanban-1769936266166]] |
| Semantic Tagger | Run `./scripts/semantic_tagger.py --report` |
| Project Scanner | Run `./scripts/scan_projects.py --report` |
| All Breakdowns | [[E+K Transition Dashboard Breakdown]], [[The Life Engine Breakdown]], [[Website Dealer Projects Breakdown]], [[Vault Automation Breakdown]], [[Thread Commander Breakdown]], [[VELLUM Breakdown]], [[Video Planning Breakdown]], [[Financial Planning Breakdown]] |
