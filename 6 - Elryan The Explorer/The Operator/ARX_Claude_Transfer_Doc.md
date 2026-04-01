# ARX Foundation — Claude Transfer Document
**Last updated:** March 11, 2026
**Author:** Elryan (via Claude)
**Purpose:** Drop this into any new Claude conversation to restore full ARX context. This is the canonical handoff.

---

## Who I Am

I'm Elryan. I build the ARX Foundation — an international nonprofit focused on digital sovereignty, privacy infrastructure, and systemic advocacy for underserved communities. I'm technical, no-nonsense, and building real things. Skip motivation, give me actionable specifics.

I maintain a comprehensive knowledge vault at `vault.hopefullyabysmal.com` (Obsidian-based Quartz site, ~31MB) containing all ARX planning documents. This vault is the canonical source of truth.

Kenya is my partner. Two ARX builds are shared with her board: GrapheneOS onboarding and Signal→Matrix migration. When those move, they move on both our boards. Kenya's family is undocumented — this isn't theoretical. Privacy infrastructure for them is safety infrastructure.

I'm based in Saint George, Utah. Spain relocation (Non-Lucrative Visa or Digital Nomad Visa) is on the horizon.

---

## What ARX Is

**Pronounced:** ARK, like Noah's.
**Tagline:** [[The Archive Eternal]]. A library for one's soul.
**Legal structure:** Hybrid — traditional nonprofit entity (targeting US 501(c)(3)) layered with a DAO governance component. The legal entity is primary; the DAO is a governance layer underneath. DAO alone won't qualify for nonprofit pricing programs.

**Three pillars:**
1. Digital Sovereignty — your data, devices, infrastructure. No landlord, no gatekeeper.
2. Privacy Infrastructure — encryption as [[Architecture]], not paranoia. GrapheneOS, Signal→Matrix, sovereign tech stacks.
3. Systemic Advocacy — technology without policy is a toy; policy without technology is a prayer.

**Vault documents (11 canonical docs):**
- [[Introducing The ARX Foundation]]
- [[ARX General Business Plan]]
- [[DAO scope]]
- [[DAO Global Compliance Checklist]]
- [[Foundation Company Holding Structure]]
- [[DAO Voting Structures]]
- [[ARX Names]]
- [[ARX Idea Generation]]
- [[ARX CDN]]
- [[The School of X]]
- [[ARX Products]]

---

## The Xatalyst System

My productivity engine. Not traditional task management — a momentum system.

**Core rules:**
- Tasks are "builds," measured in milestone steps. No time estimates — ever.
- Tasks sort by priority then stagnation (least progress rises automatically).
- One "Active Build" is locked at a time as the baseline. All other builds are measured relative to it.
- Confidence levels and momentum decay replace due dates.

**[[Architecture]] (four layers):**
1. Structured JSON as canonical data source
2. ICS generation for calendar integration
3. Pure rendering GUI layer (React, Xatalyst amber/industrial dark aesthetic)
4. Claude skill for task manipulation

**Aesthetic:** "Xatalyst" — amber (#F5A623) accent, industrial dark theme, Sora + Fraunces fonts, hexagonal motifs (⬡). This aesthetic is established and must be applied consistently across all ARX UI builds.

---

## Active Builds (as of March 2026)

### 🔒 GrapheneOS on Pixel 9 [ACTIVE BUILD — Priority 1]
Validate camera stack, write non-technical install guide for families. Kenya loves the camera, hates Google. GrapheneOS sandboxes Play if needed.
- Flash on test device
- Test Google Camera via sandboxed Play Store
- Benchmark camera output vs stock
- Document install process for non-technical users
- Write plain-English recommendation doc

### Signal + Matrix Migration [Priority 1]
Moving undocumented families off platforms that cooperate with surveillance. Signal is the bridge, Matrix/Element is the long-term home.
- Set up Matrix homeserver (or trusted public one)
- Build Signal→Matrix migration guide with screenshots
- Test international call quality
- Create "family tech setup" doc Kenya can share
- Confirm Signal number portability to Spanish number post-move

### Define ARX Foundation [Priority 1, Scoping]
Before building anything public: what is ARX, who does it serve, what does it do, what does it explicitly NOT do.
- Draft mission statement — one sentence, no jargon
- Map 3 core pillars
- Decide: nonprofit, LLC, or something else → leaning 501(c)(3)
- Write 1-page founding doc

### Sovereign Tech Stack [Priority 2, Scoping]
If ARX advocates for digital sovereignty, it models it. Self-hosted everything.
- Pick email solution (Proton, Migadu, or self-run)
- Set up Matrix homeserver for ARX internal comms
- Evaluate Nextcloud for file storage
- Document full stack publicly

### Spain Relocation Research [Priority 2, Scoping]
Know NLV and Digital Nomad Visa cold before Kenya needs answers.
- Deep-dive NLV requirements
- Research Digital Nomad Visa alternative
- Map apostille process for US documents
- Compare cities: Barcelona vs Valencia vs Málaga
- Find 2–3 gestor recommendations

### ARX Public Presence [Priority 2, Backlog]
Website, identity, first content. No templates. No cookie-cutter nonprofit aesthetic.
- Lock visual identity (wordmark, colors, tone)
- Build static site on open infrastructure
- Write first public ARX content piece
- Set up newsletter/announcement channel

### End-of-Life Reform Research [Priority 3, Backlog]
Kenya's vision for biographical legacy services in [[Death]] with Dignity. Map orgs, find gaps, identify partners.

### International Student Grad School Access [Priority 3, Backlog]
Kenya is living this problem. Document barriers, amplify stories, find policy levers. DACA, visa rules, financial aid exclusions.

---

## Key Technical Decisions (Locked)

### Forgejo for Git Infrastructure
- Forgejo selected over GitLab CE, Gitea, and custom fork
- Gitea is disqualifying: 2022 for-profit trademark capture
- Forgejo governed by Codeberg e.V. (nonprofit) — values-aligned
- Planned topology: three-node federated mesh — primary at `forge.arx.foundation` + EU and US geo-mirrors
- **CRITICAL:** ActivityPub/ForgeFed domain is permanent once federation is established. Cannot be changed. Domain selection is irreversible.

### Self-Hosted Sovereign Infrastructure
- Actively moving off Microsoft/GitHub and all centralized platforms
- Forgejo + Matrix + Nextcloud + self-hosted email is the target stack
- Coolify identified for one-click deployment for non-DevOps contributors

### The Arx Mesh (Long-Term Vision)
- Raspberry Pi nodes in public libraries running a privacy-first OS
- Offline knowledge access (Wikipedia, Internet Archive, public domain)
- Mesh network via LoRa (long-range) + 802.11s wifi (local)
- Shamir Secret Sharing for storage (3-of-5, AES key only — 1.4x overhead, not 5x)
- OTA updates propagate through the mesh itself
- Partners identified: Raspberry Pi Foundation, Hailo (AI accelerator), Wikimedia, Internet Archive, ALA
- Discord/Signal outreach drafted for The Mapmaker's Guild community

### Vault Integration
- GitHub PAT is the fastest path to Claude accessing private Obsidian content
- MCP (Model Context Protocol) server is the right long-term solution
- Quartz publishes at vault.hopefullyabysmal.com but network restrictions limit Claude's access

---

## Aesthetic Systems

### Xatalyst (Internal Ops UI)
- Dark theme: bg #08090C, surface #0F1014
- Amber accent: #F5A623
- Fonts: Sora (sans), Fraunces (serif display)
- Hexagonal motif: ⬡
- Industrial, raw, utilitarian

### ARX Foundation Homepage ("The Archive Eternal")
- Black and white base — sacred minimalism
- Cathedral geometry: rose windows, gothic arches, crosses (all CSS-rendered)
- Fonts: Cormorant Garamond (display), EB Garamond (body)
- "Coloring Book OS" — user customizes colors as initiation/onboarding
- Draggable windowed interface — each window is a "room" in the cathedral
- Biblical imagery, Roman Catholic architectural references
- Memento mori as philosophical thread
- Dark/light mode toggle

---

## Companion Projects

### Mnemo
Obsidian plugin using FSRS algorithm for spaced repetition memorization with Anki sync.

### Agora (Concept)
ActivityPub-native collaborative wiki/forum. Wikipedia-style editing + federation. Phase-based roadmap from single instance to federated network.

### Are.na Educational Division (Proposed)
Pitch to the Are.na community for structured learning paths built from curated blocks.

---

## Working Patterns & Preferences

- **Artifacts only.** I cannot see raw code blocks pasted in conversation. All UI builds and interactive deliverables MUST be rendered as proper Claude artifacts, not code in chat. This has been corrected multiple times.
- **Modular, layered architectures** — data, logic, and presentation cleanly separated.
- **Strong preference for self-hosted, sovereign infrastructure.**
- **Values alignment matters** — I evaluate platforms on governance and ethics, not just features.
- **No time estimates, ever.** Steps only.
- **Be sharp and tactical.** Skip motivation. When I mention any ARX topic, help me generate milestones, prioritize across builds, or think through relative step weight.
- **When building UI:** Check the frontend-design skill first. Outline design direction before code. Make bold, context-specific aesthetic choices. No generic defaults.

---

## Key People & Orgs Referenced

- **Kenya** — partner, shared board on GrapheneOS + Signal migration, undocumented family context, grad school access advocate, [[Death]] with Dignity vision
- **Codeberg e.V.** — nonprofit governing Forgejo
- **Brewster Kahle / Internet Archive** — natural ally for The Arx mesh
- **The Mapmaker's Guild** — Discord/Signal community for recruiting contributors

---

## How to Use This Document

Drop it at the start of any new Claude conversation. It replaces the need for re-explanation. If working in a Claude Project, pin it as project context. If working in general chat, paste it as the first message.

This is the last transfer doc. Everything lives here or in the vault.

---

*"What you build today is your letter to the future."*
*— ARX Foundation, Est. 2025*
