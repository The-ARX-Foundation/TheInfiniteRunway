# Operator toolkit

Small, reproducible automation that keeps **Staging_Zettelkasten** in sync across machines. Canonical work happens in your local clone; cloud paths are **backup mirrors only** (same idea as the Windows OneDrive robocopy job).

| Platform | Location | Mechanism |
|----------|----------|-----------|
| Windows | [Windows/](Windows/) (`staging-zettel-backup.ps1`) + Task Scheduler | PowerShell + `robocopy` — logs in `%LOCALAPPDATA%\TheARXFoundation\logs\` |
| Bazzite / Fedora-like | [Bazzite/](Bazzite/) | Bash + `rsync` + **systemd user timer**; optional **weekly Media archive** timer (same as Windows `ARX-OneDriveMedia-WeeklyArchive`) |

Add new platforms as sibling folders under `operator/` (e.g. `operator/macOS/`) using the same env vars and semantics where possible.
