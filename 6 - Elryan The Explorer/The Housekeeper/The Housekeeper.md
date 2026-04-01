---
Date Created: "2026-03-20 00:00"
Last Updated: "2026-03-21 04:31"
tags:
  - Index
Index:
  - "[[Elryan The Explorer]]"
Topic:
  - "[[Workflow & Tooling]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]], [[Programming]]

# The Housekeeper

The Housekeeper is the persona responsible for **vault maintenance, semantic linking, orphan management, and automation scheduling**. While other personas create and organize knowledge, The Housekeeper ensures it stays connected, discoverable, and structurally sound.

---

## Scope

- Orphan detection and resolution (notes without Topic/Index/wikilink connections)
- Semantic cross-linking: finding overlapping concepts and inserting `[[note|display text]]` links
- Frontmatter compliance auditing (missing fields, malformed YAML, incorrect Published states)
- Path and Index file generation and maintenance
- Broken wikilink detection and repair
- Directory flattening and restructuring recommendations
- Scheduled Claude Code automation for continuous vault hygiene
- Theme taxonomy governance (proposing new themes, retiring stale ones)

---

## Key Tools

| Tool | Purpose | Location |
|------|---------|----------|
| [[Semantic Tagger]] | Classify orphans into themes via keyword scoring | `scripts/semantic_tagger.py` |
| [[Semantic Linker]] | Cross-link notes by matching body text to note titles | `scripts/semantic_linker.py` |
| [[Project Scanner]] | Audit project health, task counts, stale projects | `scripts/scan_projects.py` |
| `/vault-status` | Quick vault health check | `.claude/commands/vault-status.md` |
| `/link-notes` | Run semantic linker via Claude Code | `.claude/commands/link-notes.md` |

---

## Maintenance Cadence

### Per-Session (run at start)
- `/start-session` to orient and check vault health
- `/vault-status` for quick orphan count and frontmatter compliance

### Weekly
- Run `./scripts/semantic_linker.py --report` to preview new cross-links
- Run `./scripts/semantic_tagger.py --dry-run` to check unclassified notes
- Review broken wikilinks via grep for `[[` patterns that don't resolve

### Monthly
- Run `./scripts/semantic_linker.py` in live mode to apply cross-links
- Run `./scripts/semantic_tagger.py` in live mode to classify new orphans
- Audit directory depth (flag anything > 5 levels deep)
- Review path length compliance (flag anything > 200 chars relative)

---

## Automation Architecture

The Housekeeper leverages Claude Code commands and scripts to keep the vault healthy without manual intervention. The key principle: **preview first, apply second**.

### Scheduling with Claude Code

Claude Code sessions can invoke The Housekeeper's tools via slash commands:

```
/link-notes              # Preview + apply semantic cross-links
/link-notes --dry-run    # Preview only
/vault-status            # Quick health check
```

For recurring automation, use the `/loop` command:
```
/loop 30m /vault-status  # Check vault health every 30 minutes during a session
```

### How Semantic Linking Works

1. **Build title index**: Collect all note filenames (sans `.md`) as linkable targets
2. **Scan body text**: For each note, search its body for phrases matching note titles
3. **Preserve wording**: Use `[[Note Name|original text]]` syntax so the reader's flow is unchanged
4. **Skip self-links**: Never link a note to itself
5. **Skip existing links**: Don't double-link text already inside `[[ ]]`
6. **Respect boundaries**: Don't link inside frontmatter, code blocks, or existing wikilinks

---

## Directory Philosophy

The vault uses numbered top-level directories (0-6) for organizational layers. Within `6 - [[Elryan The Explorer]]/`, each persona is a flat directory. Projects live directly under their persona. The Housekeeper recommends:

- **Max depth**: Persona > Project > (optional submodule). Three levels max.
- **No deeper nesting**: If you need more structure, use wikilinks and indexes instead of subdirectories
- **Flatten when possible**: Move deeply nested files up and use `[[links|descriptive text]]` to maintain context
- **Submodules**: Only for projects with genuinely independent codebases or deliverables (e.g., a server/ directory within a software project)

---

## Orphan Resolution Strategy

1. **Classify first**: Run semantic tagger to assign Theme topics
2. **Cross-link second**: Run semantic linker to find body-text matches
3. **Manual review third**: Notes that resist automation get flagged in `/vault-status` for human attention
4. **Connect to personas**: Orphan project notes should be routed to the appropriate persona directory
5. **Create stub indexes**: For orphan clusters sharing a theme but lacking an index, create one

---

## Entity Assignment

All vault maintenance tooling and automation falls under **ARX Foundation** as open-source infrastructure. The Housekeeper persona itself is a vault-internal organizational construct.
