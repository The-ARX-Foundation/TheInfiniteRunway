# OPENCLAW BUILDOUT — Transfer Document
**Last updated:** March 13, 2026
**Owner:** Elryan · ARX Foundation
**Purpose:** Paste this into any new Claude conversation to start building. No preamble needed — just say what phase you're working on.

---

## WHO I AM

I'm Elryan, building through ARX Foundation. I build custom infrastructure when defaults don't match how I think: parallel, visual, spatial, non-linear. I have 20+ concurrent projects across hardware, software, and research — all feeding into a unified self-hosted workspace vision.

**Communication style:** Casual, direct, no fluff. Match my energy. Don't over-format. Don't ask me questions when you can just build. Orient to where we left off.

**How I work:**
- Claude Code is my primary dev environment (CLI + web)
- Obsidian Zettelkasten vault (~4,000 notes) is my knowledge base
- Every project lives under a persona directory in the vault
- I think in parallel — multiple threads, multiple projects, CEO mode

---

## WHAT WE'RE BUILDING

**Project:** Code Uploading & API Portability — the nervous system connecting every ARX project.

**The problem in one sentence:** I can't push files into an AI session, I can't carry my API keys between machines, and I can't resume a conversation across devices. OpenClaw solves all of this.

### The Four Deliverables

| # | Deliverable | What It Does | Status |
|---|------------|-------------|--------|
| 1 | **File Upload Bridge** | Push files INTO any agent session from any device — WebSocket, webhook, Matrix attachment, Signal/Telegram file message | Not started |
| 2 | **Universal API Key Wallet** | One credential store (Bitwarden CLI → OpenClaw SecretRef), accessible from any machine via Tailscale | Not started |
| 3 | **Session Portability** | Start convo on phone, continue on workstation, resume on laptop — SQLite + Matrix persistence | Not started |
| 4 | **Provider Hot-Swap** | Switch models mid-conversation without context loss — auto-route by complexity, fallback chains, cost-aware | Not started |

### What These Unblock (why it matters)

**Tier 1 — directly blocked without this:**
- **[[Mimmin]]** (self-hosted workstation intelligence, auto-Zettelkasten) — needs multi-device capture + provider routing
- **[[Thread Commander]]** (20+ agent tiling grid) — needs file injection per-thread + model selector + cross-device dashboard
- **[[InsightAlly]]** (clinical data automation) — needs multi-provider switching + file upload for extraction scripts
- **Delayed Stream** (24hr latency livestream with LLM comment triage) — needs provider hot-swap + file upload for video pipeline
- **Aeon The Awoken** (LLM-driven social presence) — needs multi-provider routing + session portability

**Tier 2 — significantly accelerated:**
- [[VELLUM]] (input glove firmware), Archive Eternal/DataBANK, Tu Madre Tattoo, [[Hopefully Abysmal]], [[ARX Homepage]]

**Tier 3 — benefits from shared infra:**
- [[ORBUS]], [[Variable Friction House]], ARE, Life Engine, E+K Dashboard, [[Longing]] game, Field Theory, NFC to Onion, [[Claude Feedback Audit]]

---

## OPENCLAW — What It Is & What It Already Does

OpenClaw (formerly Moltbot/Clawdbot) is an open-source autonomous agent framework. MIT license. 196K+ GitHub stars. Node.js. Fully self-hosted.

**Already built for us:**
- Multi-agent routing with isolated sessions/workspaces
- Gateway control plane on `ws://127.0.0.1:18789` (WebSocket)
- Tool ecosystem: filesystem read/write, shell exec, browser automation (CDP), cron, memory
- Messaging bridges: Matrix, Telegram, Discord, Slack, WhatsApp, Signal, iMessage
- SecretRef credential system: `env`, `file`, `exec` sources (point at Bitwarden CLI, Vault, etc.)
- Auth profiles via `openclaw onboard` — stores keys in system keychain
- Provider-agnostic: Anthropic, OpenAI, Google, Groq, Mistral, Cerebras, OpenRouter
- Fallback chains: primary provider down → auto-routes to next
- Sandbox modes: off, agent, session, shared (Docker isolation)
- ClawHub skills registry (13,700+ skills — but 12-20% malicious, so manual review only)
- Cloudflare Workers deployment option for always-on without [[Self-Hosting]]

**Repo:** `github.com/openclaw/openclaw`

---

## DECIDED ARCHITECTURE

```
┌──────────────────────────────────────────────────┐
│  Thread Commander Dashboard (React + Electron)    │
│  Upload button per-thread, model selector,        │
│  cross-device session resume                      │
└──────────────────┬───────────────────────────────┘
                   │ WebSocket (Tailscale mesh)
┌──────────────────┴───────────────────────────────┐
│  OpenClaw Gateway (ARX fork)                      │
│  ws://127.0.0.1:18789 (loopback, Tailscale only) │
│  SecretRef → Bitwarden CLI                        │
│  Sandbox: Docker isolation by default             │
│  Upload skill: WebSocket + webhook + Matrix       │
└──────────────────┬───────────────────────────────┘
                   │ Messages
┌──────────────────┴───────────────────────────────┐
│  Matrix Homeserver (Synapse, self-hosted)          │
│  Room-per-agent threading                         │
│  File attachment passthrough → gateway filesystem │
│  Session persistence (secondary to SQLite)        │
└──────────────────┬───────────────────────────────┘
                   │ API (SecretRef-resolved keys)
┌──────────────────┴───────────────────────────────┐
│  LLM Providers (auto-routed)                      │
│  Anthropic → OpenAI → Groq (fallback chain)       │
│  Haiku (quick) → Sonnet (standard) → Opus (deep) │
└──────────────────────────────────────────────────┘
```

**Credential flow:**
```
Any device → Tailscale → Gateway → SecretRef → `bw get password anthropic-api-key` → Provider API
```

**File upload flow:**
```
Phone share sheet → iOS Shortcut → POST /upload (Tailscale) → Gateway filesystem → Agent notified
Matrix client → Room attachment → Gateway listener → filesystem → Agent notified
Thread Commander → Drag-and-drop → WebSocket binary → filesystem → Agent notified
curl/script → POST /upload webhook → filesystem → Agent notified
```

---

## BUILD PHASES (in dependency order)

### Phase 0: Fork OpenClaw
- Clone `openclaw/openclaw` into ARX GitHub org (private fork, MIT allows this)
- Strip ClawHub auto-update (no auto-install from registry)
- Pin to known-good release tag
- Set up basic CI (lint + test)
- Document fork divergence strategy (how/when to merge upstream)

### Phase 1: Security Hardening
- `gateway.bind: "loopback"` — never expose port publicly
- Docker sandbox mode ON by default for all agents
- Define sandbox profiles: `strict`, `standard`, `open`
- Skill allowlist: inventory needed skills (filesystem, browser, cron, memory), block everything else
- Pin skill versions, disable auto-update
- Remove all plaintext env var credential patterns
- Mandate keychain or `exec` source only for SecretRef

### Phase 2: Credential Infrastructure
- Install `bw` CLI on: Arch workstation, laptop, Pensieve server
- Create Bitwarden entries for all API keys: Anthropic, OpenAI, Google, Groq, Mistral, Cerebras, OpenRouter
- Configure SecretRef `exec` source: `bw get password <key-name>`
- Test cold boot credential resolution
- Install Tailscale on all devices
- Configure Tailscale Serve to expose gateway WebSocket
- Set ACLs: only my devices reach the gateway
- Test multi-provider fallback chain: Anthropic → OpenAI → Groq
- Benchmark latency/cost per provider

### Phase 3: File Upload Bridge ← THE CORE DELIVERABLE
- Build OpenClaw skill or gateway plugin:
  - WebSocket upload handler (binary + metadata)
  - Webhook endpoint: `POST /upload` with multipart/form-data
  - Matrix room attachment listener → gateway filesystem
  - Telegram/Signal file passthrough (already supported channels)
- File lands at configurable directory, agent gets notified with path + metadata
- Stretch: auto-`git add` uploaded files to active repo staging area
- Mobile upload:
  - iOS Shortcut: share sheet → POST to webhook via Tailscale
  - Android: Tasker/Automate → POST to webhook
  - Target: screenshot on phone → in agent session within 5 seconds

### Phase 4: Session Portability
- Verify SQLite session store survives gateway restarts
- Test: start on workstation, kill client, reconnect from laptop — context preserved
- Configure Matrix rooms as secondary persistence (room-per-agent)
- Thread Commander: session list with "resume" action
- Mobile: Element app connects to same agent rooms
- Offline: queue messages when gateway unreachable, sync on reconnect

### Phase 5: Provider Hot-Swap
- Thread Commander UI: per-thread model dropdown (Opus, Sonnet, Haiku, GPT-4.5, Gemini, Llama)
- Visual indicator of active model (color-coded per thread)
- Auto-routing engine: Haiku for quick, Sonnet for standard, Opus for deep
- User override: pin thread to specific model
- Cost tracking: token usage per provider per session
- Budget alerts + monthly cost dashboard in global bar
- Fallback hardening: kill API key → verify auto-route → verify no context loss

### Phase 6: Full Integration
- Thread Commander: upload drag-and-drop zone per-thread, model selector, session resume, global status bar
- Mimmin: agents use same gateway + credentials; ambient capture from any device routes through upload bridge
- Vault: uploaded files auto-placed in correct directory; frontmatter auto-generated; wikilinks auto-created

---

## SECURITY NON-NEGOTIABLES

- Gateway loopback only. Remote access via Tailscale Serve or SSH tunnel. Never expose 18789 publicly.
- Docker sandbox ON for all agent execution. No exceptions in production.
- No ClawHub skills without manual source review. 12-20% of registry is malicious (CVE-2026-25253, ClawHavoc campaign).
- SecretRef via keychain or `exec` only. Never plaintext env vars.
- Pin all skill versions. No auto-update from ClawHub.
- Tailscale ACLs: only my devices reach the gateway.
- Credential rotation: quarterly via Bitwarden, gateway picks up new values automatically.

---

## MACHINES IN THE MESH

| Machine | Role | Tailscale | OpenClaw |
|---------|------|-----------|----------|
| Arch workstation | Primary dev, gateway host | Yes | Gateway + agents |
| Laptop | Mobile dev, secondary client | Yes | Client only |
| Pensieve (server) | Hosting: Matrix, Tor, IPFS, backups | Yes | Gateway (secondary) |
| Phone (GrapheneOS) | Capture, mobile client | Yes | Client only (Element) |

---

## TECH STACK SUMMARY

| Layer | Tech | Why |
|-------|------|-----|
| Agent framework | OpenClaw (ARX fork) | MIT, self-hosted, multi-provider, tool ecosystem |
| Messaging | Matrix (Synapse) | Self-hosted, federated, room-per-agent, file attachments |
| Credentials | Bitwarden CLI → SecretRef `exec` | Already use Bitwarden, no new infra |
| Networking | Tailscale | Zero-config mesh VPN, Serve for HTTPS, ACLs |
| Sandbox | Docker | Agent isolation, OpenClaw native support |
| Dashboard | React + Electron ([[Thread Commander]]) | Existing [[Architecture]] from [[Mimmin]] transfer doc |
| State | SQLite (OpenClaw native) + Matrix (secondary) | Dual persistence, no cloud dependency |
| Vault | Obsidian (Staging_Zettelkasten) | Existing 4K-note vault, semantic_tagger.py automation |

---

## REFERENCE LINKS

- [OpenClaw repo](https://github.com/openclaw/openclaw) — MIT, 196K+ stars
- [Gateway config](https://docs.openclaw.ai/gateway/configuration) — SecretRef, auth profiles
- [Security docs](https://docs.openclaw.ai/gateway/security) — sandbox modes, hardening
- [Architecture overview](https://ppaolo.substack.com/p/openclaw-system-architecture-overview) — gateway internals
- [Security hardening guide (Nebius)](https://nebius.com/blog/posts/openclaw-security) — production hardening
- [OpenRouter integration](https://openrouter.ai/docs/guides/guides/openclaw-integration) — multi-provider routing
- [Cloudflare Workers deploy](https://github.com/cloudflare/moltworker) — managed option
- [ClawHub skills (curated)](https://github.com/VoltAgent/awesome-openclaw-skills) — vetted skills list

---

## HOW TO USE THIS DOC

Paste at the start of a new Claude conversation. Then say which phase you're working on. Claude should:
- Know the full [[Architecture]] and where everything stands
- Know about all dependent projects and why this matters
- Know the security constraints (non-negotiable)
- Know the machine topology and credential flow
- Pick up from whatever phase you're at, not from zero
- Build, don't ask questions
