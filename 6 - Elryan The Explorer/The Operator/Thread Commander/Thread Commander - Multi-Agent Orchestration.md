---
date: 2026-03-11
type: project
tags: [arx-foundation, tooling, claude, orchestration, agents, infrastructure]
status: need
Topic:
  - "[[Workflow & Tooling]]"
  - "[[Programming]]"
---

# Thread Commander - Multi-Agent Orchestration

## Problem

20+ concurrent Claude threads needed across ARX workstreams. Current UX: manually switching browser tabs. Need:
- Split window into many smaller Claude instances
- Agents that talk to each other
- Integration between Claude chat, Claude Code, and other tooling
- Spaced repetition tracking across thread domains

## Desired Capabilities

### Multi-Pane View
- Tiling grid of Claude conversations
- Auto-weight active pane (active column expands, inactive compress)
- `focus_follows_mouse` behavior
- CSS `flex-grow` transitions between panes

### Inter-Agent Communication
- Script that bridges Claude chat sessions
- Claude Code CLI as a participant in the mesh
- Shared context passing between threads
- Message bus or event system for cross-thread signals

### Thread Domains (from spaced repetition manager concept)
- ARX Foundation (meta)
- SCRIM
- Clinical Ink / Open Ink Standard
- Infrastructure (Pensieve, Tailscale, Docker)
- Income / SaaS
- Tattoo
- Van Life / Redding transition
- [[VELLUM]] (new)
- [[Variable Friction House]] (new)
- Delayed Stream (new)

### Integration Points
- Claude Code CLI (Termux, SSH workflows)
- Obsidian vault (DataviewJS, Claudian plugin fork)
- ARXd local FastAPI daemon
- OpenClaw

## Implementation Approach

TBD — needs scoping. Options:
1. Browser extension that tiles claude.ai windows
2. Custom Electron app wrapping multiple Claude web views
3. Terminal-based via Claude Code CLI with tmux-style multiplexing
4. Full custom app using Claude API directly (most control, most work)

## Related

- [[ORBUS]] — the 360 display chair IS the physical [[Thread Commander]]
- [[2026-03-11 - Session Transfer]] — spawning context
