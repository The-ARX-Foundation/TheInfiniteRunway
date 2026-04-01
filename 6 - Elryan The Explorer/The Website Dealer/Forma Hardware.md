---
Date Created: "2026-03-12 00:00"
Last Updated: "2026-03-21 04:31"
tags:
  - Area
Index:
  - "[[The Website Dealer]]"
Topic:
  - "[[Programming]]"
  - "[[Architecture]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]], [[Architecture]]

# Forma Hardware

Handheld split keyboard controller designed for Apple Vision Pro and spatial computing. Full desktop replacement input system that works without flat surfaces.

## Core Specifications

| Spec | Detail |
|------|--------|
| Layout | 70 keys total (35 per half), preserving MD770 muscle memory |
| Switches | Kailh Choc V2 Silent -- low-profile, silent, tactile |
| Trackpads | Dual Cirque capacitive, one per half |
| Connectivity | Dual BLE via Nordic nRF52840 (<8ms combined latency) |
| Firmware | ZMK with OTA DFU, Forma Companion app for GUI config |
| Battery | 600 mAh Li-Po per half, Qi 5W wireless charging |
| Dimensions | ~145x85mm per half |
| Chassis | Aluminum top plate + injection-molded lower (TPU/ABS) |
| Colorways | Silver, Midnight, Starlight |

## Pricing and Funding

| Item | Value |
|------|-------|
| Retail Price | $379 (Midnight/Starlight), $299 Kickstarter early bird (Silver) |
| Solar Dock Accessory | $89 -- Dual Qi bays + 2W Voltaic panel |
| COGS per Pair | ~$107-118 at 10K units |
| Gross Margin | ~46% at retail |
| Pre-Seed Ask | $950K -- EVT through DVT, tooling NRE, regulatory |
| Seed Ask (projected) | $3.8M -- Hard tooling, 10K inventory, DTC + Kickstarter |
| Kickstarter Target | $1.2M (3,200 units at $379 early bird) |
| Target Investors | Bolt, HAX, Lemnos, Apple ecosystem angels |

## Manufacturing Timeline

- **Phase 1 (Mo 1-5):** EVT -- 3D-printed enclosures, hand-soldered PCBs, Qi coil validation
- **Phase 2 (Mo 6-8):** DVT -- First aluminum CNC, injection-molded chassis, certification filing
- **Phase 3 (Mo 9-10):** PVT -- Hard tool molds, 500-unit pilot, FCC/CE/BT SIG certification
- **Phase 4 (Mo 11-12):** MP -- 10K unit initial run, Kickstarter [[Fulfillment]]

## Key Risks

- **Dual BLE sync latency** -- mitigated by proven ZMK split [[Architecture]]
- **Qi + aluminum interference** -- coil positioned in lower non-metal chassis section
- **F-row reach in handheld geometry** -- requires EVT prototype validation
- **Solar Dock regulatory** -- UL 2054 + UL 62368, ~$8K and 10 weeks

## Deliverables Produced

- 20-page product brief (.docx) with full technical spec, BOM, competitive analysis, pitch
- Interactive product website with CSS-rendered hardware visualizations
- Responsive rebuild addressing mobile layout issues

## Open TODOs

- VC 1-pager not yet generated (offered, not requested)
- Hardware roadmap timeline visual not yet generated
- Apple internal review version not yet generated
- Companion app UI/UX design not started
