# Taskylanders — GUI / Game Layer of The Life Engine

**Elemental task management — tasks as collectible figurines on elemental platforms.**

> This project has been merged into **[[The Life Engine Breakdown|The Life Engine]]** as its GUI/Game layer. Code remains here; task tracking lives in the unified breakdown.

A gamified kanban alternative where task priority maps to elements. Fire is urgent, Water is in progress, Earth is backlog. Tasks are SVG figurines you place and arrange spatially.

---

## Quick Start

1. Drop `taskylanders.jsx` into a React project
2. Import and render the component
3. All styles and SVGs are self-contained

---

## Element Map

- **Fire** — Urgent (red)
- **Water** — In Progress (blue)
- **Earth** — Backlog (green)
- **Tech** — Blocked (amber)
- **Magic** — Done (purple)
- **Dark** — Someday (gray)

---

## Life Engine Integration

This is one of three layers in The Life Engine:

| Layer | What | Location |
|-------|------|----------|
| **Software** | Emotion tracking PWA, creature system | `The Life Engine/` |
| **GUI / Game** | Elemental task management (this code) | `Taskylanders/` |
| **Hardware** | Physical figurines, ESP32 LEDs, NFC | Embedded in `taskylanders.jsx` |

The **Persona System** (23 roles, 5 clusters) is the identity layer running through all three.

---

## Related

- **[[The Life Engine Breakdown]]** — Unified project breakdown and task tracking
- **[[E+K Transition Dashboard]]** — Companion planning/tracking tool
- **[[emotion-board-app]]** — Related emotional/visual board concept
