---
date: 2026-03-11
type: project
parent: "[[ARX Foundation]]"
tags: [arx-foundation, hardware, electromagnetics, pid-control, smart-home, furniture]
status: seed
---

# Variable Friction House

## Problem

Rearranging furniture destroys floors, requires disproportionate effort, and discourages reconfiguration. Physical space should be as fluid as a digital workspace.

## Solution

Electromagnets in furniture feet, steel or opposing magnets in the floor. PID controller oscillates coil polarity to create three states:

### Friction States

| State | Mode | Behavior |
|-------|------|----------|
| **Lock** | Attract | Furniture grips floor, zero slide |
| **Glide** | Repel | Near-frictionless hover, push with one finger |
| **Damp** | PID-tuned middle | Controlled resistance — won't drift, moves smoothly when pushed |

## Mechanism

PID loop reads from load cell or accelerometer in each foot. If you're pushing → reduces friction (ramps [[Repulsion]]). If you let go → ramps attraction back to lock position. No scratches ever because contact pressure approaches zero during movement.

Key insight: Don't need permanent rare-earth magnets strong enough to lift furniture. Only need enough [[Repulsion]] to **unweight the contact points below the static friction threshold**. Furniture still touches the floor, it's just effectively weightless at the contact surface.

## Open Engineering Questions

- **Power delivery**: Hardwired floor grid vs battery feet? Floor grid is cleaner but requires installation. Battery feet are portable but need charging infrastructure.
- **[[Heat]] dissipation**: Coils under sustained hold (Lock mode) generate [[Heat]]. Duty cycle management? Passive cooling fins in the foot housing?
- **PID response time**: Can the controller respond fast enough to prevent drift on uneven floors? What sample rate on the accelerometer/load cell?
- **Floor compatibility**: Steel plates embedded in floor vs magnetic floor tiles vs conductive floor coating?
- **Weight range**: What coil size handles a 200lb couch vs a 5lb side table? Modular foot sizing?

## Digital Parallel

Same [[Philosophy]] as auto-weight active pane in tiling WMs. i3 `focus_follows_mouse`, tmux `aggressive-resize`. The active workspace element (physical or digital) gets priority, everything else holds position until you engage it.

## Related

- [[Field Theory of Biological Sensing]] — electromagnetic field manipulation
- [[ORBUS]] — fluid workspace concept, physical manifestation
- [[2026-03-11 - Session Transfer]] — spawning context
