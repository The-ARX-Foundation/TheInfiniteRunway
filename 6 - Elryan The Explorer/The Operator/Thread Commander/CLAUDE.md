# CLAUDE.md — Thread Commander

## What This Is

**[[Thread Commander]]** is a multi-agent orchestration system for managing 20+ concurrent Claude threads across ARX workstreams. It replaces manual browser-tab switching with a tiling grid of AI conversations that can communicate with each other.

## Project Status

**Phase:** Need / early concept. Problem is well-defined, solution [[Architecture]] is sketched.

## File Structure

```
Thread Commander/
  Thread Commander - Multi-Agent Orchestration.md   — Full concept doc (capabilities, domains, architecture)
  CLAUDE.md                                         — This file
  README.md                                         — Project overview
```

## Desired Capabilities

### Multi-Pane View
- Tiling grid of Claude conversations
- Auto-weight active pane (active expands, inactive compress)
- `focus_follows_mouse` behavior
- CSS `flex-grow` transitions between panes

### Inter-Agent Communication
- Script bridging Claude chat sessions
- Claude Code CLI as a mesh participant
- Shared context passing between threads
- Message bus / event system for cross-thread signals

### Thread Domains
ARX Foundation, SCRIM, Clinical Ink, Infrastructure, Income/SaaS, Tattoo, Van Life, [[VELLUM]], and more.

## Parent Context

- **Organization:** The ARX Foundation
- **Persona:** [[The Operator]]
- **Related:** [[ORBUS]] (runs inside it), [[Mimmin]] (persistent memory), [[Claude Feedback Audit]] (UX insights)

## Things to Avoid

- Do NOT build as a browser extension hack — needs to be a proper application
- Do NOT assume single-model — should support multiple AI providers
- Do NOT ignore the spaced repetition / domain rotation concept
