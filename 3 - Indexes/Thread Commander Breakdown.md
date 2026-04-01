---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-21 09:18"
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

# Thread Commander — Task Breakdown

> **Priority:** P2 — This Month
> **Owners:** L
> **Persona:** [[The Operator]]
> **Status:** Scoped
> **Location:** `6 - Elryan The Explorer/The Operator/Thread Commander/`

---

## Purpose
Multi-agent orchestration system. Replace manual browser-tab switching with a tiling grid of AI conversations, each scoped to a domain. The conductor's podium for all ARX workstreams.

---

## Dependencies
```
VELLUM ──────────→ Thread Commander (input device)
The Life Engine ──→ Thread Commander (emotional context signal)
Life Engine GUI ──→ Thread Commander (task data feeds thread priorities)
Vault Automation ─→ Thread Commander (semantic awareness of knowledge graph)
Thread Commander ─→ ORBUS (display/output layer)
```

**This is the convergence node. Most things flow through here.**

---

## Tasks

### 1. Architecture Decision
- [ ] Choose rendering approach: Electron vs browser-based vs Tauri `#L`
- [ ] Define agent protocol: how threads communicate `#L`
- [ ] Define domain schema (what constitutes a "thread domain") `#L`

### 2. Thread Domains (Planned)
Each domain gets its own persistent thread/pane:
- [ ] ARX Foundation `#L`
- [ ] SCRIM (if applicable) `#L`
- [ ] Clinical Ink `#L`
- [ ] Infrastructure (homelab, servers) `#L`
- [ ] Income/SaaS projects `#L`
- [ ] Tattoo (Tu Madre) `#L`
- [ ] Van Life planning `#L`
- [ ] VELLUM development `#L`
- [ ] Personal/Life Engine `#L`

### 3. Core Features
- [ ] Multi-pane tiling layout `#L`
- [ ] Thread persistence (resume conversations) `#L`
- [ ] Inter-agent communication protocol `#L`
- [ ] Context injection from vault (relevant notes per domain) `#L`
- [ ] Priority signaling (highlight urgent threads) `#L`

### 4. Integration Points
- [ ] Pull task data from Life Engine GUI layer `#L`
- [ ] Pull emotional context from Life Engine software layer `#L`
- [ ] Pull project status from Master Project Index `#L`
- [ ] Push thread outputs back to vault as notes `#L`

---

## Blockers
- [[Architecture]] decision needed before any implementation
- [[VELLUM]] must prove input patterns first (or use keyboard/mouse fallback initially)

---

## Notes
- This is the big one. Don't rush it. Let [[VELLUM]], Life Engine, and [[Taskylanders]] mature first.
- The [[Architecture]] of [[Thread Commander]] IS the [[Architecture]] of how you work. Get it right.
