---
date: 2026-03-11
type: project
parent: "[[ARX Foundation]]"
tags: [arx-foundation, hardware, input-device, glove, scrim-convergence, cnf-mesh]
status: design-phase
Topic:
  - "[[Machine Learning]]"
---

Themes: [[Machine Learning]]

# VELLUM - Adaptive Membrane Input Glove

Skintight membrane glove that turns any surface — or no surface — into a full input device. Keyboard, trackpad, gesture controller, instrument. One form factor, infinite contexts.

Named for the thin membrane historically used for writing.

## Core Thesis

Every previous glove input device failed because it asked humans to adapt to the device. [[VELLUM]] inverts this: the glove observes how you naturally type, then builds a personalized input model around YOUR biomechanics.

## Layer Architecture (sub-2mm total)

| Layer | Name | Thickness | Material |
|-------|------|-----------|----------|
| L0 | Contact Skin | 0.15mm | Medical-grade silicone elastomer |
| L1 | Sense Mesh | 0.30mm | CNF piezoresistive array + flex sensor traces |
| L2 | Haptic Grid | 0.40mm | PZT thin-film piezoelectric actuators |
| L3 | Signal Bus | 0.20mm | Flexible PCB (polyimide substrate) |
| L4 | [[Comfort]] Liner | 0.25mm | Moisture-wicking elastane knit |

## Sensing Stack

- **Fingertip pressure**: 10x10 taxel CNF piezoresistive grid per pad, 200Hz, 0.01-10N range
- **Finger articulation**: 3 flex sensors per finger (MCP/PIP/DIP), 2 for thumb, 0.5° resolution
- **Hand orientation**: 9-axis IMU at dorsal wrist, 1000Hz, quaternion pose output
- **Inter-finger contact**: Capacitive proximity, thumb-to-finger detection for mode switching

## Critical Engineering Insight — Predictive Haptics

The haptic fires on PREDICTED contact, not detected contact. The input model sees finger trajectory and activates the piezo ~1ms BEFORE the fingertip reaches the keystroke threshold. Creates the illusion of physical resistance. This is the make-or-break feature.

## Adaptive Input Model

Five-phase calibration pipeline:
1. Geometric scan (30s) — maps joint limits, finger lengths, resting positions
2. Surface typing capture (15min) — supervised training on real keyboard
3. Free typing capture (15min) — desk typing with model correction
4. Air typing calibration (15min) — separate model branch for surface-free input
5. Continuous learning (ongoing) — every correction feeds back, drift compensation

[[Architecture]]: Lightweight temporal CNN on-device (nRF5340), <500KB, <5ms inference. Optional host-side language model for ambiguous predictions.

## Power & Comms

- 200mAh thin-film LiPo, 8-12hr runtime, Qi charging
- BLE 5.3 HID profile — presents as standard keyboard to any OS
- NFC tap-to-pair in wrist module
- nRF5340 MCU (dual-core ARM Cortex-M33), ~25mW active

## SCRIM Convergence

Shared IP with [[SCRIM]]:
- CNF mesh sensing substrate (same material, different geometry)
- Sensor fusion pipeline (same Kalman filtering, quaternion math)
- MCU platform (same nRF family, Zephyr RTOS, nRF Connect SDK)
- Haptic rendering pipeline (different actuators, shared driver [[Architecture]])

A developer working on SCRIM firmware is immediately productive on [[VELLUM]].

## Development Roadmap

**Phase 0 (Mo 1-3)**: Off-the-shelf flex sensor glove + custom CNF fingertip overlays + nRF5340-DK. Target >85% surface accuracy, >70% air. Validate ML model hypothesis without custom hardware.

**Phase 1 (Mo 4-8)**: Custom CNF arrays, custom flex traces, haptic integration, temporal CNN + language model assist. Target >93% surface, >85% air.

**Phase 2 (Mo 9-14)**: Full 5-layer membrane integration, custom silicone overmold, wrist module ID, extended wear testing, FCC/CE pre-compliance.

**Phase 3 (Mo 15-18)**: Open-source release under ARX Foundation. Devkit program, config app, documentation, BOM, assembly guides. Explore beyond keyboard: instrument input, sign language capture, rehabilitation tracking.

## Related

- [[SCRIM]] — shared CNF mesh, MCU platform, firmware stack
- [[ORBUS]] — [[VELLUM]] as input device inside [[ORBUS]] spherical display
- [[Field Theory of Biological Sensing]] — [[VELLUM]] as engineered multi-field sensor
- [[ARX Foundation]] — parent organization
