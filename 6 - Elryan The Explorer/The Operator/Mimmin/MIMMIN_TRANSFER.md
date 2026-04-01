# MIMMIN — Master Transfer Document
**Last updated:** March 11, 2026 (night session)
**Owner:** Elryan · ARX Foundation
**Purpose:** Paste this into any new Claude conversation to restore full context. This is the last manual transfer doc — once [[Mimmin]] is running, the system handles its own continuity.

---

## WHO I AM

I'm Elryan, building through ARX Foundation. I augment reality — physical and digital. I build custom infrastructure when defaults don't match how I think: parallel, visual, spatial, non-linear.

**How I work with Claude:**
- Projects = domains ([[Mimmin]], ARX, garment design, yoga app, smart home, etc.)
- Threads stay alive within projects, running continuously
- I switch focus by day for clean categorization in my records
- Each thread is a running conversation, not a one-shot task
- Orient to where we left off — don't make me recap

**Communication style:** Casual, direct, no fluff. Match my energy. If I'm rapid-fire, be rapid-fire. If I'm exploring, explore with me — validate instincts before offering paths. I think through tradeoffs aloud. I value depth over surface-level output.

---

## MIMMIN — The Product

**Name:** [[Mimmin]] (play on "mimic" — it cuts your mimic time short)
**Core concept:** Self-hosted, always-watching workstation intelligence. A second brain that auto-refactors your thoughts into categorized filing. Zettelkasten that builds itself.

**[[Philosophy]]:**
- Sovereignty over your own cognition layer — your data, your hardware, no kill switch
- Local-first, privacy-respecting, open-source foundations
- Zero-friction capture: everything you say/do is potential atomic notes
- Auto-categorization: thoughts file themselves into the right cabinet
- The workspace should be as fluid as thought — physical and digital

**Built on:** OpenClaw (formerly Moltbot/Clawdbot) — open-source autonomous agent framework
- GitHub: `moltbot/moltbot` (100K+ stars)
- Node.js based, fully self-hosted
- Multi-agent routing with isolated sessions/workspaces
- Tool ecosystem: browser, filesystem, bash, cron, memory
- Messaging integration: Matrix, Telegram, Discord, Slack, WhatsApp, etc.
- Gateway WebSocket control plane for custom UIs
- ClawHub skill marketplace

---

## ARCHITECTURE — Decided Stack

```
┌──────────────────────────────────────────────┐
│  Mimmin Dashboard (React + Electron)          │
│  Parallel thread grid — all agents visible    │
│  Auto-resize active pane (flex-grow)          │
│  JSON-driven hot-reload config                │
└──────────────┬───────────────────────────────┘
               │ WebSocket
┌──────────────┴───────────────────────────────┐
│  OpenClaw Gateway                             │
│  Multi-agent orchestration + sessions         │
│  ws://127.0.0.1:18789 (instance 1)           │
│  ws://127.0.0.1:18790 (instance 2, if dual)  │
└──────────────┬───────────────────────────────┘
               │ Messages
┌──────────────┴───────────────────────────────┐
│  Matrix Homeserver (Synapse, self-hosted)      │
│  Room-per-agent threading                     │
│  Full data ownership, federated protocol      │
└──────────────┬───────────────────────────────┘
               │ API
┌──────────────┴───────────────────────────────┐
│  Claude API + Tools (inference layer)         │
└───────────────────────────────────────────────┘
```

**Dual workspace isolation:** Two OpenClaw instances on separate ports. Claude workspace and Tools workspace never cross-contaminate.

---

## UI — Parallel Threads (CEO Mode)

The core UX breakthrough: kill the channel list. No more "pick one agent to look at." All agent threads are tiled as simultaneous vertical columns on one screen.

**What exists so far:**
- `openclaw-ui.html` — original single-pane chat mockup (design reference only)
- `openclaw-threads.html` — parallel thread grid prototype (4 agents side by side)

**Each thread column contains:**
- Color-coded header with live status dot (online/thinking/waiting)
- Model + token count + tool count
- Thin progress bar
- Scrollable message stream (user messages, agent responses, tool calls, thinking blocks)
- Per-thread input with contextual quick-action chips

**Active pane auto-resize:** The focused column should expand (e.g. 45% width) while inactive columns compress proportionally. CSS flex-grow transition on mouse enter or click.

**Global status bar** pinned to bottom: tokens, tool calls, active agents, approvals pending, uptime.

**Color language:**
- Yellow (#e8ff5a) — Research / primary agent identity
- Cyan (#5affe8) — Code / engineering
- Pink (#ff5a8e) — Inbox / comms / needs-approval states
- Purple (#a78bfa) — Analytics / data

**Thread spawning:** "+" column on right edge to spawn new agent threads. Grid scrolls horizontally if needed.

---

## FILE STRUCTURE — Dashboard Project

```
openclaw-dashboard/
├── config/
│   ├── agents.json          # Define agents (name, icon, color, model, tools, system prompt)
│   ├── theme.json           # Colors, fonts, spacing
│   └── gateway.json         # OpenClaw connection settings
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Main layout — thread grid
│   ├── store.js             # Zustand state tree
│   ├── config.js            # Hot-reload JSON config loader (chokidar)
│   ├── api/
│   │   └── gateway.js       # WebSocket client, auto-reconnect, event system
│   └── components/
│       ├── ThreadColumn.jsx  # Single agent thread (header + messages + input)
│       ├── MessageStream.jsx # Scrollable message list
│       ├── ThreadInput.jsx   # Per-thread input + chips
│       └── GlobalBar.jsx     # Bottom status bar
├── electron/
│   └── main.js              # Desktop app wrapper
├── docker-compose.yml        # Local dev (Matrix + OpenClaw)
├── vite.config.js
└── package.json
```

**State tree (Zustand):**
```
├── gateway { connected, connecting, error }
├── agents[] (from config)
├── activeAgentId
├── agentSessions
│   └── {agentId} { messages[], status, metadata }
├── ui { focusedThread, threadWidths }
└── config { agents, theme, gateway }
```

**Hot-reload:** Change agents.json → dashboard updates instantly. No restart.

---

## SETUP SEQUENCE (when ready to build for real)

### Phase 1: OpenClaw
1. Node.js 22+
2. `npm install -g moltbot`
3. `export ANTHROPIC_API_KEY=sk-xxx`
4. `moltbot gateway` → verify ws://127.0.0.1:18789

### Phase 2: Matrix Homeserver
1. Docker: `docker run -v ~/synapse:/data matrixdotorg/synapse:latest`
2. Create bot user for OpenClaw
3. Create rooms per agent

### Phase 3: Dashboard
1. Clone/scaffold the React project from file structure above
2. Wire WebSocket to OpenClaw gateway
3. Build thread grid UI
4. Connect to Matrix rooms

### Phase 4: Zettelkasten Layer
- Auto-extract atomic notes from all conversations
- Categorize by domain (tags, links, hierarchy)
- Store locally (SQLite or flat files, not cloud)
- Surface connections between notes across domains

---

## OTHER ACTIVE PROJECTS (for cross-reference)

### Smart Home
- Hybrid Home Assistant + Apple HomeKit
- Local data storage, behavior-learning automation
- Watching Apple HomePad hub + new cameras

### Garment Design
- Hemp/neem-fiber blend with microencapsulated citronella
- Conductive-thread NFC antenna at inner neckline (NXP NTAG213/216)
- Insect repellency + sensory-friendly + digital tagging

### Yoga/Meditation App
- 30-day program with philosophical meditations
- Animated SVG anatomical muscle engagement per pose
- Scientific physiological context
- Future: personalized 3D model from MRI scan data

### Variable Friction House (new concept — March 11, 2026)
- Electromagnets in furniture feet, steel/magnets in floor
- PID controller oscillates coil polarity for three states: Lock (attract), Glide (repel, near-frictionless), Damp (controlled resistance)
- Load cell / accelerometer feedback — push to move, release to lock
- Zero floor contact damage, one-finger furniture rearrangement
- Open questions: power delivery (hardwired floor vs battery), [[Heat]] dissipation, PID response on uneven surfaces

---

## DESIGN PRINCIPLES (apply to everything)

1. Systems should enable living "unimpaired by anything else" — minimal friction, maximum control
2. No dependency on closed platforms for critical infrastructure
3. Pragmatic about Apple hardware / quality ecosystem when it earns it
4. Visual and spatial thinking is central — parallel structure, not linear queues
5. Depth over genericness — [[Frustration]] with surface-level AI output is a recurring signal
6. Hybrid approaches when pure solutions have tradeoffs
7. Build custom infrastructure rather than accepting default UX when the default doesn't match mental models

---

## HOW TO USE THIS DOC

Paste this at the start of a new Claude conversation. Then say what you're working on. Claude should:
- Know who you are and how you communicate
- Know the full [[Mimmin]] [[Architecture]] and where it stands
- Know about all active projects for cross-pollination
- Not ask you to repeat context that's already here
- Pick up mid-thought, not from zero
