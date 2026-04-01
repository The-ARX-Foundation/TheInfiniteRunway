---
Date Created: "2026-03-12 00:00"
Last Updated: "2026-03-21 09:15"
tags:
  - Area
Index:
  - "[[The Website Dealer]]"
Topic:
  - "[[Programming]]"
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]], [[Workflow & Tooling]]

# Automation Architecture

Framework for generating coffee shop ordering sites at scale. The goal: take a shop's menu data and brand assets, output a complete accessible ordering site in under 10 minutes.

Supports the [[Nonverbal Coffee Ordering Network]] initiative.

## Template System

### Config Schema (per shop)

Each shop gets a single config.json that drives the entire site generation:

- **shop.name** -- display name
- **shop.logo** -- path or URL to logo image
- **shop.colors.primary / secondary / background / text** -- brand palette
- **shop.fonts.heading / body** -- Google Fonts or system fonts
- **shop.hours** -- object with day:open/close pairs
- **shop.location** -- address + lat/lng for future maps integration
- **menu[]** -- array of categories, each containing items with name, price, image, sizes, modifiers

### Generation Pipeline

1. Populate config.json (manually or from photographed menu via Claude Vision)
2. Run generator script that injects config into HTML template
3. Output is a single self-contained HTML file with embedded assets
4. Generate QR code PNG pointing to hosted URL
5. Deploy to hosting (Vercel, Netlify, or [[ARX CDN]] when ready)

## Claude Vision Menu Ingestion

Photograph a chalkboard or printed menu. Send to Claude Vision API. Extract structured menu data as JSON. Human reviews and corrects. Feed into generator. This collapses the most time-consuming step (data entry) from hours to minutes.

## Scaling Strategy

| Phase | Scope | Automation Level |
|-------|-------|-----------------|
| Pilot (now) | 3-5 local shops, manual config | Template + manual JSON |
| v1.0 | 10-20 shops, Claude Vision menu ingestion | Semi-automated |
| v2.0 | Regional network, simple CMS for shop owners | Self-service with HA support |
| v3.0 | Open-source template, [[ARX CDN]] hosting | Fully automated pipeline |

## Revenue Model

Same [[Hopefully Abysmal Website|Hopefully Abysmal]] partnership structure: build for free, earn 10-15% on provable incremental revenue above a 90-day baseline. For coffee shops, this means tracking order volume lift via the digital ordering interface. Analytics built into each site provide the attribution data.
