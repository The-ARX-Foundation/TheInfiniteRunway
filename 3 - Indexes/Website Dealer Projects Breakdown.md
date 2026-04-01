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

Themes: [[Workflow & Tooling]], [[Programming]]

# Website Dealer Projects — Task Breakdown

> **Persona:** [[The Website Dealer]]
> **Location:** `6 - Elryan The Explorer/The Website Dealer/`
> **Cross-ref:** [[Open Issues and TODOs]]

---

## Tu Madre Tattoo (P1 — This Week)
**Status:** Active | **Owner:** L | **Delivered:** Partial

### Tasks
- [ ] Implement mobile hamburger navigation `#L`
  - [ ] Responsive breakpoint CSS
  - [ ] JS toggle handler
  - [ ] Test on iOS Safari + Android Chrome
- [ ] Set up booking backend `#L`
  - [ ] Evaluate: Calendly embed vs Acuity vs custom
  - [ ] Integrate into existing booking section
- [ ] Instagram feed embed `#L`
  - [ ] Get Instagram API token from client
  - [ ] Implement feed component
- [ ] Google Maps embed `#L`
  - [ ] Confirm pin accuracy with studio
  - [ ] Embed verified map
- [ ] SEO meta tags + schema markup `#L`
- [ ] Debug-gate the color control panel `#L`
- [ ] **Modularize monolithic HTML** `#L`
  - [ ] Extract header/nav component
  - [ ] Extract gallery section
  - [ ] Extract booking section
  - [ ] Extract footer
  - [ ] Set up build pipeline or include system

### Dependencies
- Instagram API token → client must provide
- Google Maps pin → client must confirm
- Modularization → blocks future maintainability

---

## Hopefully Abysmal (P2 — This Month)
**Status:** Delivered | **Owner:** L

### Tasks
- [ ] Are.na iframe integration `#L`
  - [ ] Get real channel ID
  - [ ] Replace placeholder iframe
- [ ] DNS setup for vault.hopefullyabysmal.com `#L`
  - [ ] Configure DNS records
  - [ ] Set up hosting for vault subdomain
- [ ] Replace mailto: shirt form with real backend `#L`
  - [ ] Form handler (PHP on SiteGround or serverless)
  - [ ] Email notification on submission

---

## Forma Hardware (P3 — This Quarter)
**Status:** Scoped | **Owner:** L | **Blocked:** Client decision

### Tasks
- [ ] Generate VC 1-pager (when requested) `#L`
- [ ] Create hardware roadmap timeline visual `#L`
- [ ] Prepare Apple internal review version `#L`
- [ ] Design companion app UI/UX `#L`

---

## ARX Foundation Infrastructure (P4 — Someday)
**Status:** Concept | **Owner:** L

### Tasks
- [ ] Research .arx TLD auction on Handshake `#L`
- [ ] Register conventional domains (arx.foundation, arx.network) `#L`
- [ ] Design CDN infrastructure `#L`
- [ ] Begin ARX Browser codebase `#L`

### Dependencies
- TLD auction → needs funding decision
- CDN → needs domain first
- Browser → needs everything above

---

## HobbyTown St George (P4 — Someday)
**Status:** Blocked | **Owner:** L

### Tasks
- [ ] Get owner input on events, hours, branding `#L`
- [ ] Set up hosting/deployment `#L`

### Blockers
- Entirely blocked on owner response

---

## Nonverbal Coffee Ordering (P4 — Someday)
**Status:** Scoped | **Owner:** L

### Tasks
- [x] Build HTML template with accessibility `#L`
- [x] Add receipt-authenticated WiFi feature `#L`
- [ ] List 3-5 target coffee shops `#L`
- [ ] Test Claude Vision menu extraction on one menu `#L`
- [ ] Generate working prototype for one shop `#L`
- [ ] Connect WiFi validation to POS/receipt system `#L`
- [ ] Deploy prototype + generate QR code `#L`

### Dependencies
- Target shop selection → blocks everything
- Claude Vision test → validates entire pipeline
