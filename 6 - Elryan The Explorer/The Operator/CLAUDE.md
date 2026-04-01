# CLAUDE.md — The Operator

## Who This Is

[[The Operator]] is the persona responsible for **systems infrastructure, automation, software architecture, API development, DevOps, and AI tooling**. This is the builder that makes everything run — the engine room of the entire Elryan system.

---

## AI Focus in This Space

When working inside The Operator's directory:
- Think in **automation, reliability, and minimal manual intervention**
- Infrastructure decisions have long-term consequences — document everything
- Prefer idempotent, reproducible operations with clear rollback paths
- Distinguish between open-source infrastructure (ARX Foundation) and commercial automation ([[Hopefully Abysmal]] LLC)

---

## Active Projects & Directories

| Directory / File | What It Is |
|---|---|
| `ARX Homepage/` | ARX Foundation web presence (static site) |
| `Claude Feedback Audit/` | AI interaction quality tracking and improvement |
| `E+K Transition Dashboard/` | Transition project management dashboard |
| `Ideas/` | Infrastructure and automation concepts |
| `Intro to Linux/` | Linux learning and reference materials |
| `Mimmin/` | Project directory (TBD scope) |
| `ORBUS/` | Infrastructure orchestration project |
| `Taskylanders/` | Task management automation concept |
| `The Life Engine/` | Core personal automation engine (with server and icons subdirectories) |
| `Thread Commander/` | Thread and task management system |
| `Troubleshooting/` | System troubleshooting logs and solutions |
| `VELLUM/` | Document/knowledge management automation |
| `ARX_Claude_Transfer_Doc.md` | Canonical Claude AI handoff document |
| `Linux Setup Log.md` | Linux environment setup and configuration log |
| `Biometric Authentication.md` | Identity verification systems |
| `Delayed Stream Architecture.md` | Stream processing infrastructure design |

---

## Sub-Personas (from [[Persona Org Charts]])

| Sub-Persona | Mandate |
|---|---|
| The Automation Architect | Designs automation pipelines — scripts, cron jobs, CI/CD, workflow orchestration |
| The Sysadmin | Linux administration, server management, NAS, homelab, service monitoring |
| The API Smith | API design, integration architecture, webhook plumbing, data pipeline construction |
| The DevOps Engineer | Docker, Flatpak, deployment pipelines, environment management, build systems |
| The AI Toolsmith | GPT/Claude integration, prompt engineering, agent architecture, Sovereign development |
| The Database Warden | Database design, migration management, backup strategy, query optimization |
| The Scribe | Installation logs, setup guides, architecture decisions, runbooks |

---

## Collaboration Dependencies

| Partner Persona | When to Engage |
|---|---|
| [[The Capitalist]] | For building commercial software products and automation pipelines |
| [[The Website Dealer]] | For web infrastructure and deployment architecture |
| [[The Defender]] | For security controls, hardening, and privacy infrastructure |
| [[The Architect]] | When system design needs structural/physical hardware integration |
| [[The Medic]] | For firmware, software, and APIs in medical device systems |
| [[The Gatekeeper]] | For entity routing of open-source vs. commercial software |

---

## Entity Assignment

| Work Type | Entity |
|---|---|
| Open-source software, privacy infrastructure | ARX Foundation (AFPP licensed) |
| Commercial automation services, client tooling | [[Hopefully Abysmal]] LLC |
| Employer-specific platform work (InsightAlly) | Insight-Ally, LLC |
| Personal scripts and tooling | Personal ([[Landon Dahle]]) |

---

## AI Guidelines

- NEVER commit credentials, API keys, `.env` files, or IP addresses
- Transfer documents (`ARX_Claude_Transfer_Doc.md`, session transfer files) are continuity artifacts — treat as high-priority reference
- When writing scripts, document inputs, outputs, and side effects clearly
- `The Life Engine/` is a core system — changes here need careful consideration
- Infrastructure decisions should be logged in `Linux Setup Log.md` or appropriate Troubleshooting notes
- Do NOT modify `.obsidian/` or `.smart-env/` directories
