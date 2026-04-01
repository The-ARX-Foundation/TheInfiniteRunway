# CLAUDE.md — VELLUM

## What This Is

**[[VELLUM]]** is an adaptive membrane input glove — a skintight glove that turns any surface (or no surface) into a full input device. Keyboard, trackpad, gesture controller, instrument. One form factor, infinite contexts. Named for the thin membrane historically used for writing.

## Project Status

**Phase:** Design spec v0.1 complete. Interactive React spec built. Ready for Phase 0 scoping.

## Tech Stack (Spec Viewer)

- **Framework:** React (JSX)
- **Purpose:** Interactive specification document, not the glove firmware

## File Structure

```
VELLUM/
  VELLUM - Adaptive Membrane Input Glove.md   — Full design spec (layer architecture, sensing stack, adaptive input model)
  vellum-spec.jsx                              — Interactive React spec viewer (8 sections)
  CLAUDE.md                                    — This file
  README.md                                    — Project overview
```

## Layer Architecture (sub-2mm total)

| Layer | Name | Thickness | Material |
|-------|------|-----------|----------|
| L0 | Contact Skin | 0.15mm | Medical-grade silicone elastomer |
| L1 | Sense Mesh | 0.30mm | CNF piezoresistive array + flex sensor traces |
| L2 | Haptic Grid | 0.40mm | PZT thin-film piezoelectric actuators |
| L3 | Signal Bus | 0.20mm | Flexible PCB (polyimide substrate) |
| L4 | [[Comfort]] Liner | 0.25mm | Moisture-wicking elastane knit |

## Critical Engineering Insight

Haptic fires on PREDICTED contact, not detected contact. The input model sees finger trajectory and activates the piezo ~1ms BEFORE the fingertip reaches the keystroke threshold. Creates the illusion of physical resistance. This is the make-or-break feature.

## Parent Context

- **Organization:** The ARX Foundation
- **Persona:** [[The Operator]]
- **Related:** [[ORBUS]] ([[VELLUM]] is the input device for [[ORBUS]]), [[Thread Commander]], SCRIM

## Things to Avoid

- Do NOT simplify the predictive haptics — that's the core differentiator
- Do NOT design for tethered-only operation — wireless is table stakes
- Do NOT decouple from the [[ORBUS]]/[[Thread Commander]] ecosystem
