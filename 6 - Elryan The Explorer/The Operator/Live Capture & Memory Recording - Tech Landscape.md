---
date: 2026-03-11
type: landscape
tags: [mocap, volumetric-capture, nerf, gaussian-splatting, vtuber, avatars]
status: reference
Topic:
  - "[[Biomedical Engineering]]"
  - "[[Money]]"
  - "[[Programming]]"
---

# Live Capture & Memory Recording - Tech Landscape (2026)

Prompted by: "what kind of tech do they use nowadays for memory recording? like VRChat but infinitely better. vtuber but realistic af"

## Facial/Body Capture Tiers

### Top Tier — Studio Grade
- **Epic MetaHuman Animator**: Codec avatar-level photorealistic digital human driven from single iPhone camera, near-real-time
- **Meta Reality Labs Codec Avatars**: Full facial reconstruction from Quest headset-mounted cameras, no external tracking

### Mid Tier — Accessible Markerless Mocap
- **Move.ai**: Full-body skeletal capture from multi-camera phone setups, no suit
- **Rokoko**: IMU suit + software, mainstream price point
- **RADiCAL**: Body capture from standard video cameras

### Bleeding Edge — Volumetric
- **Neural Radiance Fields (NeRFs)**: Volumetrically capture a person → reconstruct as 3D-renderable asset
- **Gaussian Splatting**: Faster alternative to NeRFs for real-time volumetric rendering
- **Luma, Volucap, Microsoft Mixed Reality Capture Studios**: Pushing toward live volumetric streaming

## The Missing Piece

Nobody has the **unified rig**: capture real human → drive photorealistic avatar → stream real-time → with haptic/spatial feedback in both directions. Pieces exist independently. Integration layer is fragmented across proprietary stacks.

This is the gap ARX occupies. [[SCRIM]] provides the body-side sensing/haptic loop. [[5th Wall]] provides the capture side. [[ORBUS]] provides the display. [[VELLUM]] provides the input. The unified rig IS the ARX portfolio assembled.

## Related

- [[SCRIM]] — body-side haptic/sensing
- [[ORBUS]] — display/output
- [[VELLUM - Adaptive Membrane Input Glove]] — input
- [[ARX Foundation]] — parent
