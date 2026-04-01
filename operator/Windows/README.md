# Windows — Staging_Zettelkasten backup

Canonical script in this repo: **`staging-zettel-backup.ps1`**.

## Windows filename gate

**`validate-windows-filenames.ps1`** runs **`scripts/validate_windows_filenames.py`** (same rules as GitHub Actions). Use on demand or hook into Task Scheduler before backup.

- **Manual:** `powershell -NoProfile -ExecutionPolicy Bypass -File operator\Windows\validate-windows-filenames.ps1`
- **Backup:** `staging-zettel-backup.ps1` calls the validator automatically when the script exists under `$Source`.

Requires **Python 3** on PATH (`py -3`, `python`, or `python3`).

## Clone fails: “invalid path” on checkout (Git GUI / `git clone`)

**Windows cannot create files whose names contain `* ? < > : " |` or certain other reserved characters.** The clone may **download** the repo but **fail at checkout** when it hits one of those paths.

Example from [The-ARX-Foundation/TheInfiniteRunway](https://github.com/The-ARX-Foundation/TheInfiniteRunway):

- `.../Top Dawgs at Paradromics for Strategic Targeting**.md` — `**` is illegal.
- `.../Literature Review: Neurotechnology - Nuffield.md` — `:` is illegal in a Windows filename.

**Fix the repo (best):** On github.com, open each file → edit → change the **filename** in the UI (remove `**`, replace `:` with `—` or `-`), commit to `main`. After that, Windows clones work for everyone.

**Work around locally:** Clone inside **WSL** (same disk is fine), e.g. `wsl` then `git clone …` under `/mnt/c/...`, or use **GitHub Codespaces** / a Linux machine — then rename and push from there.

Sparse checkout on Git for Windows often **still** validates all paths in the tree, so excluding folders is not a reliable workaround; renaming upstream is the durable fix.

## Behavior

1. `git pull --ff-only origin <current-branch>` in `C:\The ARX Foundation\Staging_Zettelkasten`
2. Robocopy **mirror** into `%OneDrive%\The ARX Foundation\Staging_Zettelkasten` (excludes `.git`)
3. Logs: `%LOCALAPPDATA%\TheARXFoundation\logs\` (same location whether you run the copy from this repo or from AppData)

## Task Scheduler

- **Task name:** `ARX-StagingZettelkasten-Backup`
- **Program:** `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
- **Arguments:** `-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File <path\to\staging-zettel-backup.ps1>`
- **Principal:** your user, **Run only when user is logged on** (so `git` + OneDrive env are available)

After editing the script in git, copy it to the path you use in the scheduled task (for example `%LOCALAPPDATA%\TheARXFoundation\staging-zettel-backup.ps1`) or point the task at the file inside your clone.
