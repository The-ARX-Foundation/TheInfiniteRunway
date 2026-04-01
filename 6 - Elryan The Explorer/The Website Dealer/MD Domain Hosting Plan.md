---
Date Created: "2026-03-21 09:15"
Last Updated: "2026-03-21 09:15"
tags:
  - Area
Index:
  - "[[The Website Dealer]]"
  - "[[ARX Foundation Infrastructure]]"
Topic:
  - "[[Architecture]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Architecture]], [[Programming]]

# .md Domain Hosting Plan

Multi-site, multi-persona publishing architecture for the Staging_Zettelkasten vault. One vault. Multiple filtered views. Per-file authorization membranes.

---

## Domain Strategy

### Entity Domains (Primary — Buy These First)

| Domain | Entity | Purpose |
|--------|--------|---------|
| `thearxfoundation.md` | ARX Foundation | Institutional knowledge, open research, public index |
| `hopefullyabysmal.md` | Hopefully Abysmal | Creative identity, music, art, brand |
| `landondahle.md` | Landon Dahle | Professional/clinical profile, CV, research |
| `elryantheexplorer.md` | Elryan The Explorer | Persona hub, explorer projects, vault gateway |

### Persona Domains (One Per Persona — Prioritize Unique Names)

Common English words are likely registered. Unique names are almost certainly available.

| Domain | Persona | Priority |
|--------|---------|----------|
| `creostic.md` | The Creostic | High — unique word, almost certainly available |
| `psychonaut.md` | The Psychonaut | Medium — niche but used |
| `thegatekeeper.md` | The Gatekeeper | Medium |
| `thefinancer.md` | The Financer | Medium |
| `thewebsitedealer.md` | The Website Dealer | Medium — meta/fun |
| `theseer.md` | The Seer | Low — check availability |
| `theoperator.md` | The Operator | Low — check availability |
| `thecapitalist.md` | The Capitalist | Low |
| `thearchitect.md` | The Architect | Low — likely taken |
| `themedic.md` | The Medic | Low |

**Note**: `guild.md` is taken (Magpie). Check `.md` availability at [registry.md](https://www.registry.md) or Namecheap. Cost is ~$30-80/yr per domain.

**Practical recommendation**: Buy the 4 entity domains now. Persona domains can route as subdomains (e.g., `creostic.elryantheexplorer.md`) until/unless individual domains are warranted.

---

## Architecture Overview

```
Vault (single source of truth)
  │
  ├── Build Layer (Quartz v4 per domain)
  │     ├── Filter by: Published: true + Sites: [domain]
  │     └── Output: static HTML per domain
  │
  ├── Deploy Layer (Cloudflare Pages)
  │     ├── thearxfoundation.md → Pages project A
  │     ├── hopefullyabysmal.md → Pages project B
  │     ├── landondahle.md → Pages project C
  │     └── elryantheexplorer.md → Pages project D
  │
  └── Auth Layer (Cloudflare Access + Workers)
        ├── Tier 0: Public routes — no auth
        ├── Tier 1: Link-only — signed URL via Worker
        ├── Tier 2: Authenticated — email OTP or OAuth via Access
        └── Tier 3: Named users — per-email Access policy
```

---

## Frontmatter Schema Changes

Two new fields to add to notes you want to publish:

```yaml
Sites:
  - arx          # thearxfoundation.md
  - abysmal      # hopefullyabysmal.md
  - landon       # landondahle.md
  - elryan       # elryantheexplorer.md
Visibility: public   # public | link-only | authenticated | named
AuthorizedUsers:     # only used when Visibility: named
  - email@example.com
  - another@example.com
```

The existing `Published: true` field remains the master gate. A note must have **both** `Published: true` AND a `Sites:` entry to appear on any domain.

---

## Authorization Membranes

### Tier 0 — Public

- `Published: true` + `Visibility: public`
- Fully static, no auth, indexed by search engines
- This is the default for anything marked `Published: true`

### Tier 1 — Link-Only (Dynamic Share Links)

- `Visibility: link-only`
- Note is generated as a static file but placed at an obscure hash path
- A **Cloudflare Worker** generates signed URLs: `/share/<jwt>` → resolves to note path
- JWT contains: `{ notePath, expiresAt, shareId }`
- Share management UI (simple admin page, password-protected) lets you create/revoke shares
- Revocation: Worker checks KV store for blacklisted `shareId`

### Tier 2 — Authenticated

- `Visibility: authenticated`
- Route is behind **Cloudflare Access** policy
- Access supports: Email OTP (no password), Google/GitHub OAuth, magic links
- Free for up to 50 users (ideal for collaborators, board members, etc.)
- Note is still static — Access just gates the route

### Tier 3 — Named Users

- `Visibility: named` + `AuthorizedUsers: [emails]`
- Build script reads `AuthorizedUsers` and writes an Access policy JSON
- Cloudflare Access `terraform` or API call creates per-path policy with email allowlist
- This is the tightest membrane — specific people only, per note

---

## Build Pipeline

### Tooling: Quartz v4

Quartz is purpose-built for Obsidian vaults. Handles wikilinks, backlinks, graph view, search, tags natively.

```
quartz/
  quartz.config.ts   ← one config per domain
  content/           ← symlink or copy of filtered vault notes
```

### Filter Script: `scripts/build_sites.py`

```python
# Pseudocode
for domain in ['arx', 'abysmal', 'landon', 'elryan']:
    notes = [n for n in all_notes
             if n.frontmatter.get('Published') == True
             and domain in n.frontmatter.get('Sites', [])]
    copy_to_quartz_content(domain, notes)
    run_quartz_build(domain)
    deploy_to_cloudflare_pages(domain)
```

### GitHub Actions CI/CD

Trigger on push to `main`. For each domain:
1. Run `build_sites.py` filter
2. `npx quartz build --config quartz.<domain>.config.ts`
3. `wrangler pages deploy` to appropriate Pages project

---

## Dynamic Share Links — Implementation Detail

```
POST /api/share
  body: { notePath: "notes/my-note.md", expiresIn: "7d" }
  auth: admin token (Cloudflare Access protected)

Response: { shareUrl: "https://elryantheexplorer.md/share/<jwt>" }

GET /share/<jwt>
  Worker validates JWT
  Checks KV for revocation
  Returns 302 redirect to actual note path
  Or: inlines note content for link-only notes
```

**KV Store schema** (Cloudflare KV):
```
shares:<shareId> → { notePath, expiresAt, createdAt, revokedAt? }
```

Admin panel (single HTML page, protected by Access):
- List active shares
- Create new share (pick note, set expiry)
- Revoke share (set revokedAt in KV)

---

## Tech Stack Summary

| Layer | Tool | Cost |
|-------|------|------|
| Site generator | Quartz v4 | Free / open source |
| Hosting | Cloudflare Pages | Free (unlimited requests) |
| Auth | Cloudflare Access | Free (up to 50 users) |
| Share links | Cloudflare Workers | Free (100k req/day) |
| Link storage | Cloudflare KV | Free tier sufficient |
| CI/CD | GitHub Actions | Free (public repo) |
| Domains | .md via Namecheap | ~$30-80/yr each |

**Estimated cost**: $120-320/yr for 4 entity domains. Everything else free.

---

## Implementation Phases

### Phase 1 — Foundation (1-2 weeks)
- [ ] Register `thearxfoundation.md`, `hopefullyabysmal.md`, `landondahle.md`, `elryantheexplorer.md`
- [ ] Set up Quartz v4 locally
- [ ] Build `scripts/build_sites.py` filter script
- [ ] Add `Sites:` + `Visibility:` fields to frontmatter schema / templates
- [ ] Deploy first static build of `thearxfoundation.md` (public notes only)

### Phase 2 — Auth Membranes (1 week)
- [ ] Configure Cloudflare Access on `landondahle.md` (professional content, restricted)
- [ ] Set up Cloudflare Access email OTP for Tier 2 notes
- [ ] Implement per-path Access policies for named-user notes

### Phase 3 — Dynamic Sharing (1 week)
- [ ] Build Cloudflare Worker for share link generation
- [ ] Set up KV store for share management
- [ ] Build admin panel (simple HTML + Access-protected)

### Phase 4 — Persona Domains (ongoing)
- [ ] Evaluate persona domain registrations
- [ ] Set up subdomain routing for personas not warranting own domains
- [ ] Migrate deliverables per persona

---

## Open Questions

- Should persona domains be subdomains of `elryantheexplorer.md` or independent registrations?
- Quartz vs Astro: Quartz wins for vault-native features; Astro wins if heavy custom UI is needed
- `.arx` Handshake TLD (from [[ARX Foundation Infrastructure]]): could eventually replace `.md` for the ARX ecosystem — worth pursuing in parallel
- Do you want the graph view public? (Quartz's killer feature — shows note relationships visually)

---

## Related Notes

- [[ARX Foundation Infrastructure]]
- [[Hopefully Abysmal Website]]
- [[Automation Architecture]]
- [[Symlinking Operational directories in nested vaults]]
