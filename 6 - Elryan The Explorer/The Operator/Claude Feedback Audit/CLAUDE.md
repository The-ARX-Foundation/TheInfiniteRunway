# CLAUDE.md — Claude Feedback Audit

## What This Is

A systematic audit of Claude and ChatGPT UX pain points, extracted from chat history exports. Documents explicit complaints, implicit friction patterns, and migration triggers. Intended as actionable feedback for Anthropic and as design input for ARX tooling ([[Thread Commander]], [[Mimmin]]).

## Project Status

**Phase:** Active audit. Pain points documented, transfer workflow defined.

## File Structure

```
Claude Feedback Audit/
  claude-pain-points.md              — Systematic chat sweep findings (explicit complaints, implicit friction)
  TRANSFER_pain-points-audit.md      — Workstream instructions (audit + chat vault build)
  TRANSFER_pain-points-audit-v2.md   — Updated version of transfer doc
  claude_feedback_report.docx        — Formatted feedback report
  CLAUDE.md                          — This file
  README.md                          — Project overview
```

## Key Pain Point Categories

1. **Mobile voice mode** — talks over user, ignores volume, broken turn-taking
2. **UX paradigm** — chat loop is limiting; wants ambient/streaming model
3. **Model switching** — friction when changing between models
4. **Context loss** — manual transfer docs needed ([[Mimmin]] solves this)
5. **Multi-thread management** — tab switching at scale ([[Thread Commander]] solves this)

## Parent Context

- **Organization:** The ARX Foundation / [[Hopefully Abysmal]]
- **Persona:** [[The Operator]]
- **Related:** [[Thread Commander]] (informed by these findings), [[Mimmin]] (solves context loss)

## Things to Avoid

- Do NOT sanitize the language — raw quotes are the point
- Do NOT conflate UI complaints with UX complaints (the doc distinguishes them)
- Do NOT remove duplicate transfer docs — v1 and v2 may differ
