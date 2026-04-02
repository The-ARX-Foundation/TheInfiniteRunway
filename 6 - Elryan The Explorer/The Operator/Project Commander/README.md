# Project Commander (ARX fork)

**Upstream:** `OneDrive - InsightAlly` → `03-Ops/knowledgebase/02 - Engineering/Reference/ProjectCommand.jsx` (and copies under `03-Ops/company-files/project-command`).

**This folder:** `ProjectCommand.arx.jsx` — same feature set as the reference (list / kanban / timeline, `window.storage` persistence, filters, shortcuts), restyled for **The ARX Foundation** (forest / citadel palette aligned with personal Cursor chrome: `#1B4332`, `#2D6A4F`, `#40916C`).

**Boundaries**

- Use for **personal / ARX** work only. Do not store **InsightAlly client data, PHI, or company-confidential** material here; keep employer operations in the company vault.
- Storage key is **`project-command-arx-data`** so artifact sessions do not overwrite data from the company template (`project-command-data`).

**Use**

- Paste into a **Claude artifact** (or any React + `window.storage` host) as a single-file component. Default export: `ProjectCommand`.

**Related**

- [[Thread Commander]] — multi-agent tiling / orchestration (separate concept; name similarity is historical).
