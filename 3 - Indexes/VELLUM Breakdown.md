---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-21 09:15"
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

Themes: [[Workflow & Tooling]], [[Mechanical Engineering]]

# VELLUM — Task Breakdown

> **Priority:** P3 — This Quarter
> **Owners:** L
> **Persona:** [[The Operator]]
> **Status:** Scoped (Design spec v0.1 complete)
> **Location:** `6 - Elryan The Explorer/The Operator/VELLUM/`

---

## Purpose
Adaptive Membrane Input Glove. Haptic feedback fires on PREDICTED contact, not detected contact. The input layer for [[Thread Commander]] and eventually [[ORBUS]].

---

## Dependencies
```
VELLUM ──→ Thread Commander (VELLUM is the input device)
VELLUM ──→ ORBUS (gesture input for spherical display)
```

---

## Tasks

### Phase 0 — Scoping & Funding
- [ ] Finalize Bill of Materials `#L`
- [ ] Cost estimation for prototype `#L`
- [ ] Identify funding path (self-funded, grant, or VC) `#L`
- [ ] Source components for first prototype `#L`

### Phase 1 — Prototype
- [ ] Build sensor array prototype `#L`
- [ ] Implement predictive contact algorithm `#L`
- [ ] Haptic actuator integration `#L`
- [ ] Basic gesture recognition `#L`

### Phase 2 — Software Integration
- [ ] Driver layer for OS input mapping `#L`
- [ ] Thread Commander integration `#L`
- [ ] Gesture-to-command mapping UI `#L`
- [ ] Calibration system per user `#L`

### Documentation (Done)
- [x] Interactive React spec viewer `#L`
- [x] Design spec v0.1 `#L`

---

## Blockers
- Funding decision for Phase 0
- Hardware sourcing

---

## Notes
- Core innovation: predictive haptics. This is the differentiator.
- React spec already built — can demo the concept to potential funders
