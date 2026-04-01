---
Date Created: "2026-03-30"
Last Updated: "2026-03-30"
tags:
  - Area
Index:
  - "[[Housekeeping Notes]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]]

# ARX public repo scope (TheInfiniteRunway)

**Repo:** [The-ARX-Foundation/TheInfiniteRunway](https://github.com/The-ARX-Foundation/TheInfiniteRunway) — canonical **public** ARX Foundation knowledge + **persona** workspace for the vault site (e.g. vault.thearxfoundation.org).

## What belongs here

- **Mission and projects:** `6 - Projects/` (Infinite Runway / SCOOL / outreach, etc.).
- **Personas:** `6 - Elryan The Explorer/` — role-based work (Capitalist, Operator, Wizard, …). Treat this as the long-term home for *narrated* ARX-facing and founder-facing material.
- **Shared structure:** `0 - Housekeeping/` (ops, publish, templates index), `1 - Templates/`, `2 - Paths/`, `3 - Indexes/` — when a note is **not** persona-specific, it can live here until you **route it under a persona**.
- **Source material:** `4 - Source Material/` (books, papers, imports) that you are willing to host **publicly**.
- **Public runway narrative:** `5 - Journals/` (e.g. team + beliefs + daily logs that you intentionally ship as part of the open climb). *Trim or move to a persona if a subtree turns personal.*

## What stays out (private / other vaults)

Keep in **Staging_Zettelkasten** (or another private clone), **not** in this repo:

- Employer boundary, legal packets, and company KB relays (e.g. InsightAlly).
- Intimate **singular** journal vault (`5 - Journal/` in staging) — dreams, emotions bucket, partner-specific trees.
- Scratch / chit chat not meant for the public corpus.
- Raw **Claude app exports** (`conversations.json`, etc.) — large and easy to over-share.
- Anything you would not want indexed on the open web.

## Sorting “everything into personas” (target shape)

1. Pick a **default persona** for new ARX work (often **The Capitalist** for funding/runway, **The Operator** for systems, **The Wizard** for narrative/experiments).
2. For each loose note under `2 - Paths/` or `0 - Housekeeping/`, either **link** from a persona MOC or **move** the file under `6 - Elryan The Explorer/<Persona>/…`.
3. Use frontmatter **`Sites: [arx]`** + **`Published: true`** (+ optional **`Surface:`**) when the note should appear on the Quartz **ARX** build.

This file is the **intent**; git history may still contain removed paths until rewritten — do not rely on deletion for secrecy if something was ever pushed; rotate or treat as public.
