---
Date Created: "2026-04-02 12:00"
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

# Publish workflow — Quartz + Peter approval queue

## Current pipeline (implemented)

1. **Vault** — `Published: true` + **`Sites: [arx|abysmal|landon|elryan]`** (required for `build_sites.py` to copy the note).
2. **`Surface`** (optional) — **`external`** (default) = included on **public** Pages builds; **`internal`** = **team-only** notes (excluded from `--surface external`, included on `--surface internal`). Synonyms for internal: `team`, `private`, `staff`.
3. **`scripts/build_sites.py`** — copies into `build/<domain>/content/` locally, or `build/<subdir>/content/` when using **`--build-subdir`** (CI uses `arx-external` / `arx-internal` so parallel jobs do not clobber each other).
4. **Quartz** — `npx quartz build` per matrix row (see `.github/workflows/deploy-sites.yml`).
5. **Cloudflare Pages** — deploy `public/` to one project per row (e.g. `arx-md-site` vs `arx-internal-md-site`).

### Who gets which site (matrix)

| Brand | Public (external) | Team (internal) |
| --- | --- | --- |
| The ARX Foundation (`Sites: arx`) | `arx-md-site` | `arx-internal-md-site` — put **Cloudflare Access** on this hostname |
| Hopefully Abysmal (`Sites: abysmal`) | `abysmal-md-site` | `abysmal-internal-md-site` — Access recommended |
| Elryan The Explorer (`Sites: elryan`) | `elryan-md-site` | *(no internal row — personal public surface only)* |
| landon (`Sites: landon`) | `landon-md-site` | *(single surface)* |

Create the **`arx-internal-md-site`** and **`abysmal-internal-md-site`** projects in Cloudflare (or let first `wrangler pages deploy` create them if your token allows). Point internal hostnames at those projects and enable **Zero Trust → Access** for org email / group.

## Peter queue (implemented in `build_sites.py`)

Frontmatter (optional until you turn the gate on):

```yaml
Published: true
Sites:
  - arx
PublishApproval: pending    # pending | review | queued → waiting for Peter
# After OK:
PublishApproval: approved
```

- **`python3 scripts/build_sites.py --report`** — shows **PublishApproval** queue vs **Published with Sites** vs **Published but no Sites** (your vault currently has many `Published: true` without `Sites`; assign `Sites` before anything hits Quartz).
- **`python3 scripts/build_sites.py --require-approval`** — copies **only** notes with `PublishApproval: approved` (or YAML `true`). Use this in **production** CI when Peter gate is live. Omit flag for **local / full** builds while migrating.

## Suggested operating modes

| Mode | Build command | Who |
| --- | --- | --- |
| **Local preview (everything with Sites)** | `build_sites.py` (no flag) | You |
| **Production / post-Peter** | `build_sites.py --require-approval` | CI after Peter sets `approved` |
| **Peter packet** | Run `--report`; send him the **PENDING** list or a filtered Obsidian search `PublishApproval: pending` | Email / meeting |

## Other options (pick what fits Peter)

1. **GitHub Environments** — Require **Peter** as approver on the **production** deployment job before Pages deploy runs; no vault change, parallel to frontmatter gate.
2. **Preview deploy** — Separate Cloudflare project or branch deploy with **Access** restricted to Peter’s email; build **without** `--require-approval` so he sees full draft set; production still uses `--require-approval`.
3. **PR-only** — Publish changes land only via PR; Peter approves merge → main → existing workflow (combine with `--require-approval` on main if you want double gate).

## Still on your backlog (from housekeeping)

- **`scripts/publish.py`** — strip `<!-- delete -->` / private sections before public copy (not built yet).
- **Quartz config** per domain — keep `quartz.config.ts` / theme aligned across four builds if you care about visual parity.

## GitHub Actions → “it keeps deploying”

1. **Repo** — Put the vault (or a subtree that contains `scripts/`, `.github/workflows/`, and your `.md` tree) on GitHub; default branch **`main`** (or change the workflow `branches:` list).
2. **Secrets** (repo → *Settings → Secrets and variables → Actions*):
   - **`CLOUDFLARE_API_TOKEN`** — Permissions: *Account · Cloudflare Pages · Edit* and whatever your Worker needs.
   - **`CLOUDFLARE_ACCOUNT_ID`** — Dashboard sidebar when a zone/account is selected.
   - **`CF_KV_NAMESPACE_ID`** — Only if `deploy-worker` / share-links KV is configured; otherwise that job may fail until `workers/wrangler.toml` and secrets match reality.
3. **Push** — Any push to **`main`** that touches `**/*.md`, `scripts/build_sites.py`, `scripts/validate_windows_filenames.py`, or the workflow file triggers **validate** then **six** Quartz builds + Pages deploys + worker.
4. **Ongoing** — Edit notes in Obsidian → sync to the machine that pushes → `git push origin main` → Actions runs. There is no magic “OneDrive alone” hook; the trigger is **git push** (or a scheduled workflow if you add `schedule:` later).

Manual run: **Actions → Deploy .md Domain Sites → Run workflow**.

## Quartz look per brand + Claude artifacts

- **One Quartz clone per matrix row** (already how CI works) — you can **fork Quartz once**, commit **per-brand** `quartz.config.ts` / theme in branches or repos, and change the `git clone` URL in the workflow per `matrix.quartz_dir` if you want fully different chrome. Lighter approach: keep one upstream Quartz and only vary **content** + a small shared patch step (e.g. copy a checked-in `quartz.config.ts` from `scripts/quartz-overrides/<brand>/` after clone) — add that only when you are ready.
- **Templates** — Fine as **Obsidian templates** for frontmatter + body; the build does not care as long as output is markdown under the vault.
- **HTML from Claude** — Paste into markdown; Quartz/remark usually passes **raw HTML** through. Prefer self-contained snippets; avoid scripts that conflict with CSP on Pages.
- **JSX** — Quartz v4 is **not** a generic React app for arbitrary JSX-in-notes. Practical options: (1) export the artifact as **static HTML** and embed via **iframe** to a static asset or another URL; (2) add a **custom Quartz component** (TypeScript/JSX in the Quartz repo) and reference it from frontmatter/layout — that is real code, not paste-only.

## Next concrete steps

1. **Assign `Sites:`** on any note you actually want live (many `Published` without `Sites` still means **zero** Quartz output for that note).
2. Use **`Surface: internal`** only on notes that must **not** appear on the public `*-md-site` builds but **should** appear on `*-internal-md-site`.
3. Set **`PublishApproval: pending`** on candidates for Peter; after OK, **`approved`**.
4. When ready, change the **`Filter notes`** step in **GitHub Actions** to append **`--require-approval`** to `build_sites.py` (or toggle via a repo variable).

## SiteGround + FTP/FTPS (optional)

You do **not** have to use Cloudflare. Quartz output is plain static files in `public/`; **FTPS** upload to SiteGround works the same idea as “FTP.”

- **Workflow:** `.github/workflows/deploy-sites-siteground.yml` — **manual only** (*Actions → Deploy sites (SiteGround FTPS) → Run workflow*) so it does not fight the Cloudflare workflow on every push.
- **You still do:** create the matching folders on the server (e.g. `arx-external`, `arx-internal`, … under your site’s `public_html`), add the four GitHub secrets listed in that file’s header, and point subdomains or addon domains at those folders if you use multiple sites.
- **“Internal” on SiteGround** is not automatic: use **Site Tools → Security → Protected URLs** (HTTP basic auth), or a separate addon domain with its own protection — unlike Cloudflare Access.
- If SiteGround only gives you **SFTP** (not FTPS on port 21), say so and swap the upload step for an SFTP action; the **build** half stays identical.
