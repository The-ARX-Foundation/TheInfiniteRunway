# CLAUDE.md — AI Assistant Guide for Staging_Zettelkasten

## What This Is

This is an **Obsidian Zettelkasten vault** — a personal and organizational knowledge management system owned by [[Landon Dahle]], operating under **The ARX Foundation** / **[[Hopefully Abysmal]]**. It contains ~4,000 markdown notes spanning personal journals, academic research, business planning, and project documentation.

The vault is transitioning toward a **dual-layer [[Architecture]]**: a public ARX Foundation vault and a nested personal vault, governed by a publish/private workflow driven by frontmatter tags.

## Repository Structure

```
0 - Housekeeping/     System notes, desktop configs, vault meta, snippets
1 - Templates/        Frontmatter templates for all note types
2 - Paths/            Curated topic pathways (thematic collections)
3 - Indexes/          Searchable domain indexes (auto-generated)
4 - Source Material/   External knowledge: books, papers, ChatGPT imports, videos, etc.
5 - Journal/          Personal entries: beliefs, dreams, emotions, recipes, thoughts
6 - Elryan The Explorer/  Persona-based project directories (20 personas)
Chit Skit/            Informal/scratch content
scripts/              Python automation (semantic_tagger.py)
```

## Frontmatter Convention (CRITICAL)

Every note MUST have this YAML frontmatter structure:

```yaml
---
Date Created: "YYYY-MM-DD HH:MM"
Last Updated: "2026-03-21 09:15"
tags:
  - Area | Index | Resource | Path
Index:
  - "[[Parent Index]]"
Topic:
  - "[[Theme Name]]"
Status: Unweathered
Published: false
---
```

Key rules:
- `Published: true` marks notes for the public ARX vault; `Published: false` keeps them private
- `Status: Unweathered` = actively being refined; other statuses exist
- `tags` use the modified PARA categories: Area, Index, Resource, Path
- `Topic` and `Index` use `"[[WikiLink]]"` syntax (quoted wikilinks)
- Double `---` separators: one closing frontmatter, one decorative below it
- After frontmatter, a `Themes:` line may appear: `Themes: [[Theme1]], [[Theme2]]`

## WikiLink Conventions

- Internal references use `[[Note Name]]` syntax (Obsidian-style)
- Spaces are preserved in filenames and links (no underscores or hyphens)
- Cross-references between notes are the backbone of the Zettelkasten

## Templates (in `1 - Templates/`)

Use these when creating new notes:
- **General Note Template** — default for any note
- **Journal Entry Template** / **Dream Entry Template** / **Guided Journal Entry Template**
- **Source Template** — for external sources (books, papers, videos)
- **Belief Template** / **Question Template**
- **Business Idea Template**
- **Index Template** / **Path Template**
- **Artistic Content Generation Framework**

## Semantic Tagging System

`scripts/semantic_tagger.py` is the primary automation tool.

### What it does
- Scans for orphaned notes (notes without Topic links)
- Classifies notes into 22 themes using keyword scoring (primary=3pts, secondary=1pt)
- Applies `[[Theme]]` links to frontmatter `Topic` fields
- Generates/updates Path files in `2 - Paths/` and Index files in `3 - Indexes/`
- Adds `Themes: [[...]]` lines to note bodies

### How to run
```bash
./scripts/semantic_tagger.py              # Live mode — modifies files
./scripts/semantic_tagger.py --dry-run    # Preview without changes
./scripts/semantic_tagger.py --report     # Report only
```

### Theme Taxonomy (22 themes)
Technical: Machine Learning, Signal Processing, Programming, Statistics, Research Methods
Engineering: Biomedical Engineering, Mechanical Engineering, Computational Neuroscience
Personal: Philosophy, Money, Self Preservation, Introspection, Death, Change
Other: Workflow & Tooling, Architecture, The Senses, Connection, Biomimetics, Lucid Dream, and more

## Directory Conventions

### Numbered prefixes indicate hierarchy
- `0-6` are primary organizational layers
- Numbers reflect PARA-adjacent ordering: meta (0), templates (1), curated (2-3), raw (4), personal (5), projects (6)

### Persona directories under `6 - Elryan The Explorer/`
Each subdirectory represents a persona/role (e.g., The Capitalist, The Operator, The Wizard). Projects live under the relevant persona.

### Source Material organization (`4 - Source Material/`)
Subdirectories by type: Books, Papers, Videos, Lectures, ChatGPT (2,256+ imported conversations), Repositories, Research, Images, Songs, Conversations, Attachments

## Build & Tooling

- **No build system** — this is a markdown vault, not a compiled project
- **No package.json or requirements.txt** — Python scripts use stdlib only
- **No CI/CD pipelines** — automation is manual via scripts
- **No active git hooks** — sample hooks only
- **Primary editor**: Obsidian
- **Git**: LF line endings enforced for `.md` files (`.gitattributes`)

## Git Conventions

- `main` is the primary remote branch
- Feature work happens on `claude/*` branches (AI-assisted) or topic branches
- PRs are used for merging AI-assisted work
- Commit messages should be descriptive and reference what was changed at a vault level

## IP and Licensing

- Licensed under **ARX Foundation Public Pact (AFPP) v1.1**
- Background IP owned by Landon Dahle / Hopefully Abysmal
- See `[[Intellectual Property Boundary, Disclosure, and Clarification]].md` for full details
- Do NOT commit or expose credentials, API keys, or `.env` files
- Respect the IP boundary: company deliverables vs. developer-owned tooling

## Cross-vault IP membrane (InsightAlly ↔ personal) — **when the user asks**

**Chron / single anchor note:** `[[Chron — Cross-vault IP membrane]]` (`0 - Housekeeping/Chron — Cross-vault IP membrane.md`) — policy timeline, cadence, membrane table, link to **30-day draft** in company `outbox/`.

When the user mentions **membrane**, **cross-vault**, **InsightAlly KB**, **IP overlap**, **PIIA**, **prior works**, **no copy**, or asks to **compare vaults**:

1. Read company relay tail: `OneDrive - InsightAlly/Cross_Context_ARX_Daemon/THREAD.md` and **`outbox/PERSONAL_VAULT_COPY_MORATORIUM.md`** (ACTIVE: **no** personal → company KB copies).
2. Run **`python3 scripts/kb_differential_map.py --json`** (optional `--no-lexical` for speed; optional `--overlap-json` to merge latest `IP_OVERLAP_*.json` from company `outbox/`).
3. Do **not** suggest ingesting personal note bodies into the company KB while moratorium stands; **flag-only** reports live under company **`outbox/`**.
4. Append a row to the **Chron** table in the anchor note when material policy or runs occur (user may ask you to).

**Negotiation draft (not binding):** `Cross_Context_ARX_Daemon/outbox/PROPOSED_30_DAY_UNCLAIMED_IP.md`

## Windows Path Compatibility

This vault must remain compatible with Windows filesystems. Follow these rules to prevent checkout failures, sync errors, and broken paths on Windows machines.

### Windows Path Limits
Windows `MAX_PATH` is 260 characters (including the full absolute path). Keep **relative paths under 200 characters** (from vault root) to leave room for different clone locations.

### Filename Length
Keep individual filenames **under 100 characters**. Abbreviate long academic titles rather than using the full title verbatim.

### Illegal Characters
Windows forbids these characters in filenames: `< > : " / \ | ? *`

Also avoid Unicode lookalikes that cause cross-platform issues:
- Bullet dots (`·`, `•`)
- Smart quotes (`"` `"` `'` `'`)
- Em-dashes (`—`) and en-dashes (`–`) — use regular hyphens (`-`) only within filenames
- Any non-ASCII punctuation or symbols

Stick to ASCII letters, numbers, spaces, parentheses, commas, periods, and hyphens.

### Path Depth
Avoid nesting deeper than **5 directory levels** from the vault root. For example, `4 - Source Material/Books/Subtopic/Author/Note.md` (4 levels) is fine; adding more levels risks hitting path limits and reduces navigability.

### Naming Convention for Long Titles
For source material with long academic titles, use the format:

```
Author Last - Short Title.md
```

Keep the full filename **under 80 characters**. For example:
- Instead of: `Vaswani et al - Attention Is All You Need Transformer [[Architecture]] for Sequence Transduction.md`
- Use: `Vaswani - Attention Is All You Need.md`

## Things to Avoid

- Do NOT modify `.obsidian/` or `.smart-env/` directories
- Do NOT create notes without proper frontmatter
- Do NOT use underscores or hyphens in note filenames (use spaces)
- Do NOT delete notes without understanding their wikilink graph connections
- Do NOT change the numbered directory structure
- Do NOT commit `__pycache__/`, `_zettel_miner_*` files, or `.obsidian/`
- Do NOT modify frontmatter fields you don't understand — especially `Published` and `Status`
- Do NOT create file paths that exceed 200 characters (relative to vault root) — Windows compatibility
- Do NOT use special Unicode characters in filenames (bullets, smart quotes, em-dashes) — use ASCII equivalents

## Workflow Commands (IMPORTANT)

Custom slash commands live in `.claude/commands/`. **Use these at the start of every session and when performing common tasks:**

- **`/start-session`** — Run this first in any new workflow thread. It auto-orients you: checks git state, reads active TODOs, runs the semantic tagger report, and presents a structured briefing with active work streams and quarterly goals. Always start here.
- **`/vault-status`** — Quick vault health check: orphan count, frontmatter compliance, broken wikilinks, git state.
- **`/new-note`** — Guided note creation: walks through template selection, directory placement, frontmatter filling, and cross-referencing.

## Common Tasks for AI Assistants

1. **Adding new notes**: Use `/new-note` or manually use appropriate template, fill all frontmatter fields, set `Published: false` by default
2. **Organizing orphaned notes**: Run semantic tagger or manually add Topic/Index links
3. **Vault maintenance**: Fix broken wikilinks, normalize frontmatter, update indexes
4. **Script improvements**: Enhance `semantic_tagger.py` or create new automation
5. **Content development**: Flesh out stub notes, add cross-references, curate paths
6. **Publish workflow**: Only set `Published: true` when explicitly requested by the vault owner

## Metagovernance (Upcoming)

The vault is implementing **Metagov KOI (Knowledge Organization Infrastructure)** to separate:
- **Global ARX vault** — publicly published knowledge (`Published: true`)
- **Personal vault** — private notes nested within (`Published: false`)

The `Published` frontmatter field is the primary mechanism for this split. Respect this boundary in all operations.

## InsightAlly company knowledgebase (separate vault)

For **InsightAlly / work** documentation, the canonical Obsidian vault is on **company OneDrive** (`03-Ops/knowledgebase/`), not inside Staging_Zettelkasten. Read **`0 - Housekeeping/InsightAlly_Knowledgebase_Relay.md`** for absolute paths, the Downloads/import **AGENT_Playbook** location, and how **Cross_Vault_Housekeeping** relates to the company `00 - Housekeeping/` tree.

**Membrane:** While copy moratorium is active, **do not** treat company `Mirrored_from_Staging_Zettelkasten/` as something to refresh from personal—**frozen**. See **`[[Chron — Cross-vault IP membrane]]`**.
