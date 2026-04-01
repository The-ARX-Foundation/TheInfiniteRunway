---
date: 2026-03-11
type: research-seed
parent: "[[ARX Foundation]]"
tags: [arx-foundation, field-theory, bioelectrics, magnetoreception, sensing, whitepaper-candidate]
status: seed
Topic:
  - "[[Signal Processing]]"
---

Themes: [[Signal Processing]]

# Field Theory of Biological Sensing

## Core Reframe

Stop categorizing senses by receptor organ (nose, ear, eye). Start categorizing by the field type they sample. Then ask: what fields can a given organism detect, and at what sensitivity?

## Scent as a Scalar Field

A volatile organic compound diffusing from a source creates a **scalar concentration field** in 3D space. It has a value at every point, gradients, a Laplacian. Governed by the diffusion equation (same math as [[Heat]] transfer).

A dog's nose samples this field at two spatially separated points (left/right nostril) and computes the **spatial gradient** — literally vector calculus with wetware. They navigate a scalar field by sensing its derivative. Not a metaphor. That's the physics.

## Multi-Field Framing

A human body is a walking, breathing, multi-field emitter:

| Field Type | Physical Basis | Propagation Speed | Detector Example |
|------------|---------------|-------------------|-----------------|
| Chemical concentration | VOC diffusion | [[Wind]] speed (~m/s) | Dog nose (gradient sampling) |
| Pressure (acoustic) | Mechanical wave | ~343 m/s in air | Ear (frequency decomposition) |
| Thermal (IR) | Blackbody radiation | c | Pit viper IR organs |
| Bioelectric (EMG/ECG) | Ion channel currents | c (EM propagation) | Shark ampullae of Lorenzini |
| Geomagnetic perturbation | Body's ferromagnetic/diamagnetic response | c | Bird cryptochrome proteins |

## The Sheldrake Problem

Rupert Sheldrake's experiments: dogs go to the window at the moment the owner **decides** to come home. At distances where chemical and acoustic fields can't propagate fast enough. But EM fields propagate at c — effectively instantaneous at any terrestrial distance.

If a human body's bioelectric signature has ANY detectable EM component, and if a dog has ANY magnetoreceptive sensitivity to it, the signal arrives instantly regardless of distance.

**Problem**: amplitude. Human bioelectric field at 10km = femtotesla or below. But biological magnetoreceptors may operate at sensitivities below current instrumentation thresholds (migrating birds detect geomagnetic variations smaller than 1980s lab instruments could measure).

## Research Thread

**Proposed whitepaper**: Characterize [[The Human]] bioelectric field at varying distances. Map spectral content. Test whether biological magnetoreceptors (or engineered ones) can detect the signature above noise floor.

## Connection to ARX Hardware

SCRIM's CNF mesh = engineered pressure field detector. Add magnetometer arrays = EM field detector. The suit becomes a multi-field sampling surface — the same thing a dog's sensory system is, but engineered and quantified.

[[VELLUM]]'s sensing stack is a subset: sample the fields your body produces, infer intent from field dynamics.

## Related

- [[VELLUM - Adaptive Membrane Input Glove]] — multi-modal field sensing at hand scale
- [[SCRIM]] — multi-modal field sensing at body scale
- [[Variable Friction House]] — electromagnetic field manipulation at furniture scale
