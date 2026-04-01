---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Cybersecurity]]"
  - "[[Machine Learning]]"
Status: Unweathered
Published: false
---
---

Themes: [[Machine Learning]]

[Self-host an Organization | Bitwarden](https://bitwarden.com/help/self-host-an-organization/)

Part of the broader [[Initiation - Cybersecurity Policy|cybersecurity policy]] and [[get off google entirely|de-Googling strategy]].

## Why Bitwarden

- Open source password manager with [[Self-Hosting]] option
- End-to-end encrypted; zero-knowledge [[Architecture]]
- Organization support for shared credentials
- Replaces reliance on Google Password Manager and browser-based storage

## Self-Hosting Considerations

- Can run on Raspberry Pi or NAS via [[docker installation|Docker]]
- Requires reverse proxy (nginx/Caddy) for HTTPS
- Backup the vault database regularly (integrate with [[NAS Full Filesystem|backup strategy]])
- Consider Vaultwarden (lightweight Rust implementation) for personal/small-org use
