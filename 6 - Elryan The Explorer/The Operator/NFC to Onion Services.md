---
date: 2026-03-11
type: micro
tags: [nfc, tor, onion, grapheneos, privacy, physical-computing]
status: seed
Topic:
  - "[[Mechanical Engineering]]"
---

# NFC to Onion Services

Physical NFC tags that hyperlink to `.onion` addresses. A physical-world entry point to censorship-resistant infrastructure.

## Problem

NFC tags store URLs. Phone taps tag → opens default browser. Default browsers can't resolve `.onion`.

## Solutions

1. **Clearnet gateway**: Tag points to `https://[hash].onion.to` or similar Tor2Web proxy. Accessible but defeats some privacy guarantees.
2. **Deep link**: Tag triggers intent to open Orbot/Tor Browser if installed on Android.
3. **Custom intent handler** (GrapheneOS): Build a small app that intercepts `.onion` URL schemes and routes to Tor Browser. Most elegant solution for the ARX device fleet.

## Use Cases

- Distribute at events, embed in products, tattoo studio cards
- ARX project access points — tap to enter the uncensorable version
- [[Delayed Stream Architecture]] — physical access tag for the feed

## Related

- [[Delayed Stream Architecture]] — parent concept
