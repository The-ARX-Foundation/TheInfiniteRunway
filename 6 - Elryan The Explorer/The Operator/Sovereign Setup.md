---
Date Created: "2026-03-20 12:00"
Last Updated: "2026-03-21 09:15"
tags:
  - Resource
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

# Sovereign Setup

## What Is Sovereign

Sovereign is a self-hosted, multi-organization development platform by [[HexaField]] that runs entirely on your own hardware. It unifies code management, project planning, voice communication, and AI agent orchestration into a single interface.

Repository: `https://github.com/HexaField/sovereign`

## Core Capabilities

- **Organization and Projects** - Multi-org workspace with git repos as first-class entities
- **Code Features** - File explorer, git integration, embedded terminal, diff engine
- **Issue and Review Management** - GitHub and Radicle backed tracking, cached locally
- **Planning Tools** - DAG-based project planning with graph, kanban, list, and tree views
- **Chat and Messaging** - Entity-bound threads for branches, issues, and PRs
- **Voice Integration** - Speech-to-text input and text-to-speech output
- **Meeting Support** - Transcription, diarization, summarization
- **Agent Integration** - WebSocket-based AI agent runtime [[Connection]] (OpenClaw)

## Architecture

TypeScript monorepo with three packages:

```
packages/
  client/     SolidJS + Vite + Tailwind
  server/     Express + typed event bus + 17 modules
  core/       Shared types, event bus, agent backend interface
```

Design principles: file-driven, event bus architecture, runtime configuration, code-first reliability, complete transparency.

## Local Setup

Location: `6 - [[Elryan The Explorer]]/[[The Operator]]/sovereign/`

### Prerequisites

- Node.js 22+
- pnpm 10+
- Git

### Running

```bash
cd "6 - Elryan The Explorer/The Operator/sovereign"
pnpm dev          # Hot-reloading dev environment
```

### Configuration

Environment config lives in `.env.local` (copied from `.env.example`). Key settings:

- `SOVEREIGN_DATA_DIR` - Where persistent data is stored (default `~/.sovereign`)
- `HOST` / `PORT` - Server binding (default `localhost:3001`)
- `OPENCLAW_GATEWAY_URL` - Agent backend WebSocket URL
- `VOICE_TRANSCRIBE_URL` / `VOICE_TTS_URL` - Voice service endpoints

### Production

```bash
bin/sovereign build
bin/sovereign start
bin/sovereign status
bin/sovereign logs
bin/sovereign stop
```

## Persona Routing

All 20 Elryan personas are registered as sovereign orgs via symlinks in `packages/server/.data/orgs/`. Sovereign reads `orgs.json` on startup and discovers each persona as a workspace. Any git repos inside a persona directory are auto-detected as projects.

Symlink structure:
```
packages/server/.data/orgs/
  the-architect  ->  6 - Elryan The Explorer/The Architect/
  the-artist     ->  6 - Elryan The Explorer/The Artist/
  the-capitalist ->  6 - Elryan The Explorer/The Capitalist/
  ...            ->  (20 total)
```

Config lives in `packages/server/.data/orgs/orgs.json`. To add a new persona, create the symlink and add an entry to that file.

## Tech Stack

TypeScript, SolidJS, Express, Vite, Vitest, Tailwind CSS, pnpm workspaces, Oxlint

## Related

- [[Code Uploading and API Portability Buildout]]
- [[Thread Commander]]
