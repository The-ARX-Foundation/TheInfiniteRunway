---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-21 09:18"
tags:
  - Area
Index:
  - "[[The Operator]]"
Topic:
  - "[[Workflow & Tooling]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]], [[Programming]]

# Code Uploading and API Portability Buildout

**Priority:** High — blocks workflows across the entire ARX portfolio, not just [[The Operator]]
**Parent:** [[Mimmin]], [[Thread Commander - Multi-Agent Orchestration]]
**Related:** [[Claude Code Cannot Upload Files From Chat Initiation]], [[Automating Everything]], [[Initiation - Cybersecurity Policy]]

---

## The Problem

Claude Code (CLI and web) has zero file upload capability. No drag-and-drop, no upload button, no way to inject external files into a session unless they already exist on the connected filesystem. This is documented in [[Claude Code Cannot Upload Files From Chat Initiation]].

Beyond Claude specifically — the broader issue is **API portability**. You should be able to spin up an AI agent session from anywhere, against any provider, with your credentials following you. No manual key pasting, no "which machine has my API key," no platform lock-in on where you can work.

This isn't just an Operator problem. It touches every persona and project that uses LLM inference, file management, or multi-device workflows.

---

## What OpenClaw Already Solves

OpenClaw (the backbone of [[Mimmin]]) already has infrastructure for most of this:

### Filesystem & Code Access
- **Filesystem tools** — agents can read/write files, traverse directories
- **Shell execution** — `exec` tool runs arbitrary commands on the gateway host
- **Browser automation** — CDP-controlled Chrome for OAuth, scraping, file interactions
- **Sandbox modes** — off, agent, session, shared (Docker-based isolation)

### API Key Management
- **SecretRef system** — credentials sourced from `env`, `file`, or `exec` (e.g., HashiCorp Vault)
- **Auth profiles** — `openclaw onboard` stores keys in system keychain, not plaintext
- **Provider-agnostic routing** — same agent memory/skills work across Anthropic, OpenAI, Google, Groq, Mistral, Cerebras, OpenRouter
- **Fallback chains** — if primary provider is down, auto-routes to next

### Multi-Channel Deployment
- Gateway binds to `ws://127.0.0.1:18789` — accessible from any local client
- Messaging bridges: Matrix, Telegram, Discord, Slack, WhatsApp, Signal, iMessage
- ClawHub skills registry (13,700+ skills as of Feb 2026)
- Cloudflare Workers deployment for always-on without [[Self-Hosting]]

### What This Means
OpenClaw's gateway already acts as a universal API relay. Your credentials live in one place (keychain/vault), your agents route through one control plane, and any messaging channel or custom UI can talk to it. The "API accounts everywhere" problem is architecturally solved — it just needs to be wired up for the [[Mimmin]]/[[Thread Commander]] stack.

---

## What Still Needs Building

### 1. Code Upload Bridge
- **Goal:** Push files INTO an AI session from any device, any context
- **Approach:** OpenClaw skill or plugin that accepts file uploads via:
  - Gateway WebSocket (from [[Thread Commander]] dashboard)
  - Matrix room attachments (from any Matrix client, including mobile)
  - Webhook endpoint (POST files from scripts, CI, curl, Shortcuts app)
  - Telegram/Signal file messages (already supported as input channels)
- **Output:** File lands on the gateway host filesystem, agent is notified with path
- **Stretch:** Auto-stage uploaded files into the active git repo context

### 2. Universal API Key Wallet
- **Goal:** One credential store, accessible from any machine/context
- **Approach:** Fork OpenClaw's SecretRef to use Bitwarden CLI or Tailscale-secured vault
  - `openclaw config` already supports `exec` source — point it at `bw get password anthropic-api-key`
  - Tailscale Serve exposes gateway securely across all devices without port forwarding
  - Auth profile synced via Syncthing or Bitwarden attachment
- **Output:** Spin up an agent session on any device, credentials auto-resolve

### 3. Session Portability
- **Goal:** Start a conversation on phone, continue on workstation, resume on laptop
- **Approach:** OpenClaw sessions persist in SQLite — gateway is the source of truth
  - [[Thread Commander]] dashboard connects to same gateway from any device
  - Matrix rooms provide natural session persistence across clients
  - Agent memory files travel with the gateway, not the client

### 4. Provider Hot-Swap
- **Goal:** Dynamic model routing without losing context (pain point #3 from [[claude-pain-points]])
- **Approach:** OpenClaw already supports this via model ID switching per-message
  - Build a [[Thread Commander]] UI control: model dropdown per-thread
  - Auto-route based on task complexity (Haiku for quick, Opus for deep)
  - Fallback chains already exist — extend to cost-aware routing

---

## Cross-Project Impact Map

This buildout isn't just infrastructure — it's the **nervous system** connecting every ARX project. Every project below gets unblocked or accelerated by at least one of the four deliverables above.

### Tier 1: Directly Unblocked (needs this to function)

| Project | Persona | What It Gets | Deliverable |
|---------|---------|-------------|-------------|
| [[Mimmin]] | Operator | Multi-device thought capture; provider-agnostic inference; ambient note generation from any device | Upload Bridge + API Wallet + Session Portability |
| [[Thread Commander - Multi-Agent Orchestration]] | Operator | File injection into any agent thread; model selector per-pane; cross-device dashboard | Upload Bridge + Hot-Swap + Session Portability |
| [[InsightAlly]] | Capitalist | Push Python [[Parsers]] and extraction prompts to gateway from any device; switch between Claude Bedrock, OpenAI, Gemini without manual key management; fallback chains for provider failover | Upload Bridge + API Wallet |
| [[Delayed Stream Architecture]] | Operator | LLM comment triage across providers; push source footage to gateway for encoding pipeline; Tor hidden service from gateway | Upload Bridge + Hot-Swap |
| [[Aeon The Awoken]] | Wizard | Push markdown fragments from vault to LLM to social post; multi-provider routing for tone/model selection; session portability for narrative work across devices | Upload Bridge + API Wallet + Session Portability |

### Tier 2: Significantly Accelerated

| Project | Persona | What It Gets | Deliverable |
|---------|---------|-------------|-------------|
| [[VELLUM - Adaptive Membrane Input Glove]] | Operator | Push firmware patches and ML models to gateway; centralize sensor calibration data from multiple test sessions; OTA update pipeline | Upload Bridge |
| [[The Archive Eternal]] / DataBANK | Capitalist / Wizard | Ingest user digital footprints (PDFs, social exports, emails) at scale via webhook; multi-provider inference for conversational ghost generation; compliance scanning | Upload Bridge + API Wallet |
| [[Tu Madre Tattoo]] | Website Dealer | Deploy booking backend from any device; unified credential management for Stripe, Twilio, email services; push portfolio images directly | Upload Bridge + API Wallet |
| [[Hopefully Abysmal]] | Capitalist / Website Dealer | Push media assets from Figma/creative tools to gateway; multi-provider CDN routing; draft content on any device | Upload Bridge + Session Portability |
| [[ARX Homepage]] | Operator | Deploy foundation site updates from any device; multi-device content authoring | Upload Bridge + Session Portability |

### Tier 3: Benefits from Shared Infrastructure

| Project | Persona | What It Gets | Deliverable |
|---------|---------|-------------|-------------|
| [[ORBUS]] | Operator | Unified API for multi-display workspace; agents accessible from the chair without leaving the environment | Session Portability + API Wallet |
| [[Variable Friction House]] | Operator | Push PID tuning parameters to furniture modules; centralize sensor data; multi-device control UI | Upload Bridge |
| [[Autonomous Resuscitation Engine]] | Medic | Model versioning and hot-swap for ACLS decision algorithms; EMR credential abstraction; regulatory audit logging | Hot-Swap + API Wallet |
| [[The Life Engine]] | Operator | Multi-device emotion check-in sync (currently localStorage only); API backend for spouse notifications | Session Portability |
| [[E+K Transition Dashboard]] | Operator | Multi-device property search sync; API integrations for Zillow/financial tools | Session Portability + API Wallet |
| [[Longing - The Archive Eternal]] (Game) | Capitalist | Multi-provider NPC AI routing; community mod submission via webhook; cross-device save states | Hot-Swap + Upload Bridge |
| [[Field Theory of Biological Sensing]] | Operator | Push experimental data and analysis scripts to gateway from lab hardware | Upload Bridge |
| [[Live Capture & Memory Recording]] | Operator | Push capture data from volumetric rigs to processing pipeline; multi-device review | Upload Bridge |
| [[NFC to Onion Services]] | Operator | Gateway serves as the hidden service endpoint that NFC tags point to | API Wallet (credential routing for Tor) |
| [[Claude Feedback Audit]] | Operator | Chat export parsing pipeline via gateway; multi-provider analysis of conversation data | Upload Bridge + Hot-Swap |

### Shared Infrastructure That Benefits Everything

| Infrastructure Layer | Projects Served | Notes |
|---------------------|----------------|-------|
| **OpenClaw Gateway** (forked) | All 20+ projects | Universal API relay, tool dispatch, session management |
| **Tailscale Mesh** | All multi-device workflows | Secure cross-device gateway access without port forwarding |
| **Bitwarden SecretRef** | All API-consuming projects | One credential store, any machine, any provider |
| **Matrix Homeserver** | [[Mimmin]], Thread Commander, Delayed Stream | Message persistence, room-per-agent threading, file attachments |
| **Docker Sandbox** | All agent execution | Isolation for shell/browser/filesystem tools |
| **React Component Library** | Thread Commander, [[Mimmin]] Dashboard, [[Taskylanders]], Life Engine, E+K Dashboard, [[ARX Homepage]] | 6 projects share UI patterns — consistent theming |

---

## Dependency Graph

```
                    ┌─────────────────────┐
                    │  FORK OPENCLAW       │ ← Everything starts here
                    │  into ARX infra      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                 │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────────┐
    │ SECURITY       │ │ TAILSCALE    │ │ BITWARDEN       │
    │ HARDENING      │ │ MESH SETUP   │ │ SECRETREF       │
    │                │ │              │ │ INTEGRATION     │
    │ - Sandbox ON   │ │ - Install    │ │                 │
    │ - Loopback     │ │   tailscale  │ │ - bw CLI setup  │
    │ - Skill audit  │ │ - Serve      │ │ - exec source   │
    │ - Pin versions │ │   config     │ │ - Auth profile  │
    └───────┬────────┘ │ - ACLs       │ │   sync          │
            │          └──────┬───────┘ └───────┬─────────┘
            │                 │                  │
            └────────┬────────┘                  │
                     │                           │
           ┌─────────▼──────────┐    ┌──────────▼──────────┐
           │ GATEWAY ONLINE     │    │ API KEY WALLET       │
           │ (secure, multi-    │    │ OPERATIONAL          │
           │  device)           │    │                      │
           └────────┬───────────┘    └──────────┬──────────┘
                    │                            │
       ┌────────────┼────────────────────────────┤
       │            │                            │
┌──────▼──────┐ ┌───▼──────────────┐  ┌─────────▼──────────┐
│ FILE UPLOAD │ │ SESSION          │  │ PROVIDER HOT-SWAP   │
│ BRIDGE      │ │ PORTABILITY      │  │                     │
│             │ │                  │  │ - Model dropdown    │
│ - WebSocket │ │ - SQLite persist │  │   per thread        │
│ - Webhook   │ │ - Matrix rooms   │  │ - Auto-route by     │
│ - Matrix    │ │ - Cross-device   │  │   complexity        │
│   attach    │ │   reconnect      │  │ - Fallback chains   │
│ - Signal/   │ │                  │  │ - Cost-aware        │
│   Telegram  │ │                  │  │   routing           │
│ - Git auto- │ │                  │  │                     │
│   stage     │ │                  │  │                     │
└──────┬──────┘ └────────┬─────────┘  └─────────┬──────────┘
       │                 │                       │
       └─────────────────┼───────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ THREAD COMMANDER    │
              │ DASHBOARD           │
              │ INTEGRATION         │
              │                     │
              │ - Upload UI         │
              │ - Model selector    │
              │ - Cross-device      │
              │   session resume    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ MIMMIN ONLINE       │
              │ (full stack)        │
              └─────────────────────┘
```

---

## TODO Checklist (Ordered by Dependency)

### Phase 0: Foundation (blocks everything)
- [ ] **Fork OpenClaw into ARX infra** (private fork, MIT license allows this)
  - [ ] Clone `openclaw/openclaw` into ARX GitHub org
  - [ ] Strip ClawHub auto-update (security: no auto-install from registry)
  - [ ] Pin to known-good release tag
  - [ ] Set up CI for the fork (basic lint + test)
  - [ ] Document fork divergence strategy (upstream merge policy)

### Phase 1: Security Hardening (before anything goes online)
- [ ] **Sandbox mode ON by default** for all agent execution
  - [ ] Configure Docker sandbox mode in gateway config
  - [ ] Test agent isolation (filesystem, network, process boundaries)
  - [ ] Define sandbox profiles: `strict` (CI/untrusted), `standard` (daily use), `open` (dev only)
- [ ] **Gateway bound to loopback only**
  - [ ] Set `gateway.bind: "loopback"` in config
  - [ ] Verify no public port exposure
- [ ] **Skill allowlist**
  - [ ] Inventory which ClawHub skills are needed (filesystem, browser, cron, memory)
  - [ ] Review source of each skill (ClawHavoc campaign — 12-20% malicious)
  - [ ] Create allowlist config, block all others
  - [ ] Pin skill versions, disable auto-update
- [ ] **SecretRef lockdown**
  - [ ] Remove all plaintext env var credential patterns
  - [ ] Mandate keychain or `exec` source only
  - [ ] Audit gateway config for leaked secrets

### Phase 2: Credential Infrastructure (enables API portability)
- [ ] **Set up Bitwarden CLI as SecretRef backend**
  - [ ] Install `bw` CLI on all machines (Arch workstation, laptop, Pensieve server)
  - [ ] Create Bitwarden entries for: Anthropic, OpenAI, Google, Groq, Mistral, Cerebras, OpenRouter API keys
  - [ ] Configure OpenClaw SecretRef `exec` source: `bw get password <key-name>`
  - [ ] Test: `openclaw config` resolves credentials from Bitwarden on cold boot
  - [ ] Document the credential flow for onboarding new machines
- [ ] **Wire Tailscale Serve for cross-device gateway access**
  - [ ] Install Tailscale on all devices (workstation, laptop, phone, Pensieve)
  - [ ] Configure Tailscale Serve to expose gateway WebSocket (`ws://[tailscale-ip]:18789`)
  - [ ] Set ACLs: only your devices can reach the gateway
  - [ ] Test: connect to gateway from phone over Tailscale
- [ ] **Test multi-provider routing**
  - [ ] Configure fallback chain: Anthropic → OpenAI → Groq
  - [ ] Verify model switch preserves agent memory and session state
  - [ ] Benchmark latency and cost per provider for common tasks
  - [ ] Document which providers are best for which task types

### Phase 3: File Upload Bridge (the core deliverable)
- [ ] **Build file upload OpenClaw skill/plugin**
  - [ ] WebSocket upload handler on gateway (accepts binary + metadata)
  - [ ] Webhook endpoint (`POST /upload` with multipart/form-data)
  - [ ] Matrix room attachment listener (file messages → gateway filesystem)
  - [ ] Telegram/Signal file message passthrough (already supported channels)
  - [ ] File lands at configurable directory, agent receives notification with path + metadata
- [ ] **Git auto-staging (stretch)**
  - [ ] Detect active git repo context for the session
  - [ ] Auto-`git add` uploaded files to staging area
  - [ ] Agent confirms before commit
- [ ] **Upload from mobile**
  - [ ] iOS Shortcut: share sheet → POST to webhook endpoint via Tailscale
  - [ ] Android: Tasker/Automate task → POST to webhook
  - [ ] Test: screenshot on phone → appears in agent session within 5 seconds

### Phase 4: Session Portability (multi-device continuity)
- [ ] **Implement session persistence**
  - [ ] Verify OpenClaw SQLite session store works across gateway restarts
  - [ ] Test: start conversation on workstation, kill client, reconnect from laptop, context preserved
  - [ ] Configure Matrix rooms as secondary persistence layer (room-per-agent)
- [ ] **Cross-device session resume**
  - [ ] Thread Commander dashboard: session list with "resume" action
  - [ ] Mobile client (Element/Matrix): same agent rooms accessible from phone
  - [ ] Agent memory files travel with gateway SQLite, not the client
- [ ] **Offline resilience**
  - [ ] Queue messages when gateway is unreachable
  - [ ] Sync on reconnect (Matrix handles this natively)
  - [ ] Test: draft messages offline on phone, reconnect, messages deliver

### Phase 5: Provider Hot-Swap (dynamic model routing)
- [ ] **Thread Commander model selector UI**
  - [ ] Per-thread dropdown: Opus, Sonnet, Haiku, GPT-4.5, Gemini, Llama, etc.
  - [ ] Visual indicator of active model per thread (color-coded)
  - [ ] One-click switch mid-conversation, no context loss
- [ ] **Auto-routing engine**
  - [ ] Define complexity heuristics (message length, tool count, domain keywords)
  - [ ] Route: Haiku for quick queries, Sonnet for standard work, Opus for deep reasoning
  - [ ] Override: user can pin a thread to a specific model
- [ ] **Cost-aware routing**
  - [ ] Track token usage per provider per session
  - [ ] Budget alerts: "you've spent $X on Opus today, switch to Sonnet?"
  - [ ] Monthly cost dashboard in Thread Commander global bar
- [ ] **Fallback chain hardening**
  - [ ] Test: kill Anthropic API key → auto-routes to OpenAI → verify no context loss
  - [ ] Test: all providers down → graceful error with queue-for-later option

### Phase 6: Integration (wire into the full stack)
- [ ] **Thread Commander dashboard integration**
  - [ ] Upload button per-thread (drag-and-drop zone)
  - [ ] Model selector dropdown per-thread
  - [ ] Session resume across devices
  - [ ] Global status bar: active provider, token spend, upload queue
- [ ] **Mimmin integration**
  - [ ] Mimmin agents use same gateway and credential infrastructure
  - [ ] Ambient capture from any device routes through upload bridge
  - [ ] Auto-categorized notes inherit session context (which thread/agent generated them)
- [ ] **Vault integration**
  - [ ] Uploaded files auto-placed in correct vault directory based on agent context
  - [ ] Frontmatter auto-generated for uploaded content (using vault templates)
  - [ ] Wikilinks auto-created from upload metadata

---

## Security Considerations

OpenClaw's power is also its attack surface. Key mitigations for this buildout:

- **Gateway bound to loopback only** — remote access via Tailscale Serve or SSH tunnel
- **Sandbox mode ON** for all agent execution — Docker isolation by default
- **No ClawHub skills without manual review** — 12-20% of registry skills are malicious (CVE-2026-25253, ClawHavoc campaign)
- **SecretRef via keychain/vault only** — never plaintext env vars in production
- **Pin skill versions** — no auto-update from ClawHub
- **Tailscale ACLs** — only your devices can reach the gateway, no public exposure
- **Credential rotation** — Bitwarden entries rotate quarterly, gateway picks up new values automatically via `exec` source

---

## References

- [OpenClaw GitHub](https://github.com/openclaw/openclaw) — main repo (MIT, 196K+ stars)
- [OpenClaw Gateway Config](https://docs.openclaw.ai/gateway/configuration) — SecretRef and auth profiles
- [OpenClaw Security Docs](https://docs.openclaw.ai/gateway/security) — sandbox modes, hardening
- [ClawHub Skills Registry](https://github.com/VoltAgent/awesome-openclaw-skills) — curated skills list
- [OpenClaw on Cloudflare Workers](https://github.com/cloudflare/moltworker) — managed deployment option
- [OpenClaw + OpenRouter Integration](https://openrouter.ai/docs/guides/guides/openclaw-integration) — multi-provider routing
- [OpenClaw [[Architecture]] Overview](https://ppaolo.substack.com/p/openclaw-system-architecture-overview) — gateway internals
- [OpenClaw Security Hardening (Nebius)](https://nebius.com/blog/posts/openclaw-security) — production hardening guide
