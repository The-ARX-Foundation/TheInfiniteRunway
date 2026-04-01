---
Date Created: "2026-03-12 00:00"
Last Updated: "2026-03-12 00:00"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]]

## Claude Code - Cannot Upload Files From Chat Initiation

**Platform:** Claude Code (CLI / Web)
**Date Observed:** 2026-03-12
**Type:** Bug / Limitation Complaint

### Issue

Claude Code (web "Code view" and CLI) does not support file uploads at all -- not at chat initiation, not mid-conversation, not ever. There is no upload button or drag-and-drop functionality. This is in contrast to the regular Claude chat interface which supports file uploads natively.

This means there is no way to bring external files (images, PDFs, documents, data files) into a Claude Code session unless they already exist on the connected filesystem.

### Impact

- Cannot share reference images, screenshots, design files, or documents for context
- Cannot upload files to be placed into the repository -- must manually add them to the filesystem first
- Completely blocks workflows where the session's purpose is to process or organize uploaded content
- Forces a two-step workaround: manually place files on the filesystem, then ask Claude Code to read/move them

### Workarounds

- Manually place files into the repo/filesystem first (via terminal, file manager, or regular git operations), then reference their paths in Claude Code
- Use regular Claude chat for tasks that require file uploads, then switch to Code view for implementation
- Copy-paste file contents directly into the chat as text (only works for text-based files)

### Status

Unresolved. Appears to be a platform limitation, not a bug. Filed as a known complaint for tracking.
