# CLAUDE.md — Taskylanders (Life Engine GUI Layer)

## What This Is

**[[Taskylanders]]** is the GUI/Game layer of **[[The Life Engine Breakdown|The Life Engine]]** — an elemental-themed task management application built in React. Tasks are represented as collectible figurines on elemental platforms — a gamified kanban system where task priority maps to elements (Fire = Urgent, Water = In Progress, Earth = Backlog, etc.).

> **Project tracking has moved to [[The Life Engine Breakdown]].** This CLAUDE.md covers code-level context only.

## Tech Stack

- **Framework:** React (functional components, hooks)
- **Styling:** Inline CSS-in-JS with SVG figurines
- **State:** `useState`, `useRef`, `useEffect`
- **No build system yet** — single JSX file

## File Structure

```
Taskylanders/
  taskylanders.jsx   — Full application component
  CLAUDE.md          — This file
  README.md          — Project overview
```

## Element System

| Element | Color | Icon | Meaning |
|---------|-------|------|---------|
| Fire | #FF4D1C | Flame | Urgent |
| Water | #0EA5E9 | Droplet | In Progress |
| Earth | #84CC16 | Leaf | Backlog |
| Tech | #F59E0B | [[Lightning]] | Blocked |
| Magic | #A855F7 | Sparkle | Done |
| Dark | #6B7280 | Moon | Someday |

## Parent Context

- **Organization:** The ARX Foundation / [[Hopefully Abysmal]]
- **Persona:** [[The Operator]]
- **Related:** [[E+K Transition Dashboard]] (another task/planning tool)

## Things to Avoid

- Do NOT flatten the gamification — the figurine metaphor is core to the UX
- Do NOT add traditional kanban column layouts — this is intentionally spatial/visual
