# CLAUDE.md — Project Commander (ARX)

**Folder:** `Project Commander/` under **The Operator** persona.

**Artifact:** `ProjectCommand.arx.jsx` — fork of InsightAlly’s `ProjectCommand.jsx` with ARX palette, defaults, and `project-command-arx-data` storage key.

**When editing**

- Preserve parity with upstream behavior unless the user wants ARX-only UX changes.
- Do not rename `STORAGE_KEY` without a migration note (users would lose local artifact data).
- Keep the file **self-contained** (single JSX, no external imports beyond React).

**Cross-links:** [[Thread Commander]], [[Mimmin]], [[ORBUS]].
