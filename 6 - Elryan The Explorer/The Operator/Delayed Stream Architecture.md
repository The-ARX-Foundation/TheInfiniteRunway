---
date: 2026-03-11
type: project
tags: [arx-foundation, streaming, tor, decentralization, ipfs, nostr, privacy, llm]
status: concept
Topic:
  - "[[Mechanical Engineering]]"
---

Themes: [[Mechanical Engineering]]

# Delayed Stream Architecture

## Concept

Live stream with 24-hour latency. Today's recording airs tomorrow. Comments come in, batch-respond next cycle. Anti-algorithmic by design — creates rhythm instead of dopamine loop.

## Architecture

### The Feed
- Record daily (capture hardware: TBD, Blackmagic ecosystem candidate)
- Store as video files
- Publish on 24hr delay

### The Membrane
LLM sits between you and the audience:
- Automated responses to low-signal comments
- You batch-review and respond to meaningful ones next cycle
- Nobody knows which responses are human vs model — **ambiguity is the feature**
- Masks as network latency / system behavior

### Distribution Stack (Decentralized)

| Layer | Service | Role |
|-------|---------|------|
| **Canonical** | `.onion` hidden service | Uncensorable source of truth |
| **Storage** | IPFS pins | Static video content, content-addressed |
| **Social** | Nostr relays | Comment layer, decentralized, censorship-resistant |
| **Mirror** | Clearnet site | Read-only accessibility mirror |

The clearnet is a read-only mirror of something that lives somewhere they can't touch. The root is never on the clearnet.

### Tor Setup (on Pensieve)

Basic `torrc` hidden service config → reverse proxy to nginx serving the site. Tor generates the `.onion` address. Full site (HTML, video, API endpoints) served through it.

Pre-recorded delayed feed sidesteps Tor's worst bandwidth/latency constraints since you're serving static video, not live.

### NFC Integration

NFC tags can store `.onion` URLs. Caveats:
- Default phone browsers can't resolve `.onion`
- Workarounds: clearnet gateway proxy (onion.to), deep link into Orbot/Tor Browser on Android, custom intent handler on GrapheneOS
- Physical hyperlink to the dark web — compelling ARX interaction pattern

See: [[NFC to Onion Services]]

## Related

- [[NFC to Onion Services]] — physical access point
- [[ARX Foundation]] — parent organization
- [[2026-03-11 - Session Transfer]] — spawning context
