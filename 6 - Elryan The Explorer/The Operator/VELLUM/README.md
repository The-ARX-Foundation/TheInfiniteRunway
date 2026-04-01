# VELLUM

**Adaptive Membrane Input Glove — any surface becomes a full input device.**

A skintight membrane glove (sub-2mm) that observes how you naturally type, then builds a personalized input model around YOUR biomechanics. Keyboard, trackpad, gesture controller, instrument. One form factor, infinite contexts.

Every previous glove input device failed because it asked humans to adapt to the device. [[VELLUM]] inverts this.

---

## Architecture

5-layer stack: Contact Skin, Sense Mesh (CNF piezoresistive), Haptic Grid (piezoelectric), Signal Bus (flex PCB), [[Comfort]] Liner. Total thickness under 2mm.

**Key innovation:** Predictive haptics — fires ~1ms BEFORE contact based on finger trajectory prediction. Creates the illusion of physical resistance on any surface.

---

## Status

- [x] Design spec v0.1 complete
- [x] Interactive React spec built (8 sections)
- [ ] Phase 0 scoping
- [ ] CNF piezoresistive prototype
- [ ] Haptic timing validation
- [ ] Adaptive input model training pipeline

---

## Related

- **[[ORBUS]]** — 360 display workspace ([[VELLUM]] is the input device)
- **[[Thread Commander]]** — Multi-agent orchestration (runs inside [[ORBUS]])
- **SCRIM** — Convergent sensing [[Philosophy]]
