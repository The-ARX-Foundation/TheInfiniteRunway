---
Date Created: "2026-03-12 00:00"
Last Updated: "2026-03-27 00:00"
tags:
  - Area
Index:
  - "[[The Website Dealer]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]]

# Open Issues and TODOs

Consolidated tracker for all unresolved bugs, pending decisions, and blockers across [[The Website Dealer]] projects.

## Tu Madre Tattoo

- [ ] Booking form needs backend (or Calendly/Acuity embed)
- [ ] Mobile hamburger nav not implemented
- [ ] Real Instagram feed embed pending API token
- [ ] Google Maps embed pending studio confirmation of pin accuracy
- [ ] SEO meta tags and schema markup not added
- [ ] Color control panel needs debug-mode gating
- [ ] Monolithic HTML needs full modularization (Session 6 was interrupted)

## Forma Hardware

- [ ] VC 1-pager not yet generated (offered, not requested)
- [ ] Hardware roadmap timeline visual not yet generated
- [ ] Apple internal review version not yet generated
- [ ] Companion app UI/UX design not started

## Hopefully Abysmal

- [ ] Are.na iframe integration needs real channel ID
- [ ] Vault link (vault.hopefullyabysmal.com) needs DNS/hosting setup
- [ ] Custom shirt form uses mailto: fallback -- needs real form backend

## ARX Foundation

- [ ] .arx TLD auction on Handshake not yet initiated
- [ ] Conventional domains (arx.foundation, arx.network) not yet registered
- [ ] CDN infrastructure is conceptual -- no implementation started
- [ ] ARX Browser is spec-only -- no codebase exists

## .md Domain CI/CD Infrastructure (Cloudflare Setup)

CI pipeline is built and merging. Blocked on account/infrastructure setup.

### Cloudflare Account
- [ ] Create Cloudflare account (cloudflare.com) if not already done
- [ ] Copy **Account ID** from dashboard right sidebar

### API Token
- [ ] Create API Token with permissions: "Cloudflare Pages: Edit" + "Workers KV Storage: Edit"

### Cloudflare Pages Projects (names must match exactly)
- [ ] Create Pages project: `arx-md-site`
- [ ] Create Pages project: `abysmal-md-site`
- [ ] Create Pages project: `landon-md-site`
- [ ] Create Pages project: `elryan-md-site`

### KV Namespace (for share-links Worker)
- [ ] Create KV Namespace in Workers > KV (e.g. name it `share-links`)
- [ ] Copy the namespace ID

### GitHub Secrets (repo Settings > Secrets and variables > Actions)
- [ ] Add secret: `CLOUDFLARE_API_TOKEN`
- [ ] Add secret: `CLOUDFLARE_ACCOUNT_ID`
- [ ] Add secret: `CF_KV_NAMESPACE_ID`

### Domain Registration + DNS (after Pages projects exist)
- [ ] Register `thearxfoundation.md` (~$30-80/yr via Namecheap or registry.md)
- [ ] Register `hopefullyabysmal.md`
- [ ] Register `landondahle.md`
- [ ] Register `elryantheexplorer.md`
- [ ] In each Pages project > Settings > Custom domains, add the domain
- [ ] Point each domain's DNS CNAME to the Pages-provided address

### Content (unblocks actual deploys)
- [ ] Tag at least one note per domain with `Published: true` + `Sites: [arx]` (etc.) to move past placeholder pages

## HobbyTown St George

- [ ] Awaiting owner input on events, hours, brand preferences
- [ ] No hosting/deployment set up

## Nonverbal Coffee Ordering

- [ ] List 3-5 target coffee shops with current menu format
- [ ] Photograph one menu and test Claude Vision extraction pipeline
- [x] Build HTML template with full accessibility compliance (coffee-shop-template.html)
- [x] Add receipt-authenticated WiFi password feature
- [ ] Generate first working prototype for one shop (swap demo menu for real shop data)
- [ ] Connect WiFi code validation to POS/receipt system (currently uses preset codes)
- [ ] Deploy prototype and generate QR code for counter display
