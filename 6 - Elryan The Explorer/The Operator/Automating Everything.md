---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---
# Automating Everything

[[The Operator]]'s automation playbook. Anything done more than twice should be scripted.

---

## Web Scraping — Apify MCP Server

Source: [How to Scrape (almost) ANYTHING in Seconds | Apify's New MCP Server](https://www.youtube.com/watch?v=OdJeXVrcpus)

- Cost structure differs per site
- Edit config, paste code for MCP servers
- Pairs well with Claude Code and other LLM toolchains

---

## Automation Targets

### System & Infrastructure
- Backup scheduling via Borg/Restic (see [[NAS Full Filesystem]])
- `Last Updated` property automation in Obsidian vault (see [[TODO|Housekeeping TODO]])
- Daily planning note generation (see [[Calendar and Productivity]])

### Development Environment
- [[Appimage-launcher]] script for auto-registering AppImages to desktop
- [[pipenv]] / [[poetry]] project scaffolding
- [[docker installation|Docker]] container orchestration for self-hosted services

### Security & Privacy
- Automated 2FA backup rotation (see [[get off google entirely]])
- Self-hosted [[Bitwarden Password Management|Bitwarden]] vault backup

---

## Tools to Explore
- Ansible — configuration management across machines
- cron / systemd timers — scheduled task execution
- Make / Just — task runners for project-level automation
- n8n / Huginn — self-hosted workflow automation (IFTTT replacement)