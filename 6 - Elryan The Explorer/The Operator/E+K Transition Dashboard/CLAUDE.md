# CLAUDE.md — E+K Transition Dashboard

## What This Is

A planning and tracking dashboard for Elryan + Kenya's life transition. Covers student loans, CACREP counseling program, living situation (property search), and asset liquidation. Includes a Zillow property tracker with status pipeline.

## Tech Stack

- **Framework:** React (functional components, hooks)
- **Styling:** Inline CSS-in-JS
- **State:** `useState`, `useEffect`, `useCallback` with localStorage persistence
- **No build system yet** — single JSX files

## File Structure

```
E+K Transition Dashboard/
  dashboard.jsx              — v1: basic workstream tabs
  dashboard-v2.jsx           — v2: adds property tracker with Zillow integration
  signal-zillow-extract.md   — Instructions for extracting Zillow links from Signal
  CLAUDE.md                  — This file
  README.md                  — Project overview
```

## Workstreams

- **Student Loans** — refinance planning, payment tracking
- **CACREP** — counseling program application/progress
- **Living Situation** — property search with Zillow pipeline (reviewing -> interested -> touring -> offer -> passed)
- **Asset Liquidation** — sell/donate tracking

## Key Features

- Tab-based workstream navigation
- Milestones and task tracking per workstream
- Property tracker with Zillow URLs, price, acreage, status
- Pinned cross-cutting items
- localStorage persistence

## Parent Context

- **Organization:** Personal (Elryan + Kenya)
- **Persona:** The Operator
- **Related:** Signal Zillow extract workflow, The Financer (financial planning)

## Things to Avoid

- Do NOT expose this dashboard publicly — contains personal financial data
- Do NOT remove the property tracker — it's actively used for the housing search
- `Published: false` always — this is personal planning infrastructure
