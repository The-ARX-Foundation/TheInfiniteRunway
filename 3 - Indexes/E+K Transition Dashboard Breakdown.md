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

# E+K Transition Dashboard — Task Breakdown

> **Priority:** P0 — NOW
> **Owners:** L+K
> **Persona:** [[The Operator]]
> **Status:** Active
> **Location:** `6 - Elryan The Explorer/The Operator/E+K Transition Dashboard/`

---

## Purpose
Track the joint life transition: student loans, CACREP counseling program for Kenya, property search, asset liquidation, and financial runway. This is the daily driver for both of you.

---

## Dependencies
```
Financial Planning ←──→ E+K Transition Dashboard (shared financial data)
The Life Engine ───────→ E+K Transition Dashboard (emotional check-ins inform priorities)
```

---

## Tasks

### 1. Student Loan Management
- [ ] Consolidate all loan balances into dashboard view `#L+K`
- [ ] Model refinancing scenarios (rate comparison) `#L`
- [ ] Set up auto-payment tracking `#L`
- [ ] Build payoff timeline visualization `#L`

### 2. CACREP Counseling Program (Kenya)
- [ ] Research accredited programs in target locations `#K`
- [ ] Track application deadlines and requirements `#K`
- [ ] Compare program costs vs financial aid `#L+K`
- [ ] Map program locations against property search `#L+K`

### 3. Property Search
- [ ] Define search criteria (location, budget, features) `#L+K`
- [ ] Integrate Zillow data into dashboard `#L`
  - [ ] API or scrape pipeline for listings
  - [ ] Filter by CACREP program proximity
- [ ] Build comparison view for top candidates `#L`
- [ ] Track offer/negotiation status when ready `#L+K`

### 4. Asset Liquidation
- [ ] Inventory items to sell `#L+K`
- [ ] Price and list items (FB Marketplace, Craigslist) `#K`
- [ ] Track sold items and running total `#L+K`

### 5. Dashboard Technical Improvements
- [ ] Migrate from v1 to v2 dashboard (React) `#L`
- [ ] Add localStorage persistence for all workstreams `#L`
- [ ] Add shared view / export for Kenya `#L`
  - [ ] Consider simple auth or shared link
- [ ] Mobile-responsive layout `#L`
- [ ] Add timeline/milestone view across all workstreams `#L`

---

## Blockers
None currently. This is unblocked and top priority.

---

## Notes
- Dashboard lives as a React SPA in the vault
- v1 and v2 both exist — consolidation needed
- Kenya needs view access without needing to run the dev server
