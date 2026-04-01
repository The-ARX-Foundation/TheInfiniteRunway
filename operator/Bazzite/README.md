# Bazzite — replicate the Staging_Zettelkasten backup flow

**Bazzite** is the Universal Blue Fedora Atomic desktop (gaming-focused). This folder is named for that spelling; people often type *Bazite*—same target OS.

This mirrors what you run on **Windows**: `git pull --ff-only` on the canonical clone, then a **one-way mirror** of the working tree into a sync-backed directory (e.g. OneDrive, Google Drive, Dropbox, or an `rclone` mount). **`.git` is excluded** from the mirror.

## Prerequisites

- `git`, `bash`, `rsync` (Bazzite ships these).
- A **backup destination directory** that your sync client keeps updated (native OneDrive client, Insync, `rclone mount`, etc.).

## Quick setup

1. **Environment file** (paths are examples—edit for your home layout):

   ```bash
   mkdir -p ~/.config
   cp operator/Bazzite/config/arx-staging-backup.env.example ~/.config/arx-staging-backup.env
   $EDITOR ~/.config/arx-staging-backup.env
   ```

2. **Install the script** to your user `bin` (so systemd does not hardcode your clone path):

   ```bash
   install -Dm0755 operator/Bazzite/scripts/staging-zettel-backup.sh ~/.local/bin/arx-staging-zettel-backup
   ```

3. **Systemd user units** (daily ~06:30, same spirit as the Windows scheduled task):

   ```bash
   mkdir -p ~/.config/systemd/user
   cp operator/Bazzite/systemd/arx-staging-zettel-backup.service ~/.config/systemd/user/
   cp operator/Bazzite/systemd/arx-staging-zettel-backup.timer ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now arx-staging-zettel-backup.timer
   systemctl --user list-timers arx-staging-zettel-backup.timer
   ```

4. **Dry run** (optional): run the script once by hand and inspect logs under `~/.local/state/arx-staging-backup/logs/` (or whatever you set in `ARX_STAGING_LOG_DIR`).

## Environment variables

| Variable | Meaning |
|----------|---------|
| `ARX_STAGING_SOURCE` | Canonical git clone (where you work). |
| `ARX_STAGING_BACKUP_DEST` | Mirror target inside your synced folder. |
| `ARX_STAGING_ENV_FILE` | Optional: override path to the env file (default `~/.config/arx-staging-backup.env`). |
| `ARX_STAGING_LOG_DIR` | Log directory (default `XDG_STATE_HOME/.../arx-staging-backup/logs`). |

## Parity with Windows

On Windows the same flow lives in **[../Windows/staging-zettel-backup.ps1](../Windows/staging-zettel-backup.ps1)** plus Task Scheduler task `ARX-StagingZettelkasten-Backup`. You can install a copy under `%LOCALAPPDATA%\TheARXFoundation\` and point the task at it, or run the script straight from the clone.

Behavior matches this folder’s intent:

1. `git pull --ff-only origin <current-branch>`
2. Mirror tree with deletes, excluding `.git`
3. Exit `0` only on success (robocopy “success but copied files” codes are normalized on Windows)

## OneDrive on Linux

Bazzite does not use `%OneDrive%`. Typical options:

- Official Linux sync client → use its mount path in `ARX_STAGING_BACKUP_DEST`.
- **`rclone mount`** → point `ARX_STAGING_BACKUP_DEST` at the mountpoint (ensure the mount is active before the timer fires, or wrap with a small check in a drop-in override).

## OneDrive `Media/` weekly archive (systemd timer)

Same idea as Windows Task Scheduler task **`ARX-OneDriveMedia-WeeklyArchive`**: each week, **move** (not copy) files over a size threshold out of **`Media/`** into **`~/Videos/OneDrive-Media-Archive/<date>/`** so the cloud folder stays small.

1. Optional config (only if auto-detect fails or you want overrides):

   ```bash
   cp operator/Bazzite/config/arx-onedrive-media-archive.env.example ~/.config/arx-onedrive-media-archive.env
   $EDITOR ~/.config/arx-onedrive-media-archive.env
   ```

2. Install the script:

   ```bash
   install -Dm0755 operator/Bazzite/scripts/onedrive-media-weekly-archive.sh ~/.local/bin/arx-onedrive-media-archive
   ```

3. Enable the **user** timer (Sundays **09:00**, matches the Windows weekly job):

   ```bash
   cp operator/Bazzite/systemd/arx-onedrive-media-archive.service ~/.config/systemd/user/
   cp operator/Bazzite/systemd/arx-onedrive-media-archive.timer ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now arx-onedrive-media-archive.timer
   systemctl --user list-timers arx-onedrive-media-archive.timer
   ```

4. Test once:

   ```bash
   ARX_MEDIA_MIN_MB=500 ~/.local/bin/arx-onedrive-media-archive   # should move nothing if nothing > 500 MB
   ```

**Environment variables** (see `config/arx-onedrive-media-archive.env.example`):

| Variable | Meaning |
|----------|---------|
| `ARX_ONEDRIVE_ROOT` | Sync root containing `Media/` (auto: `~/OneDrive`, `~/onedrive`, `~/OneDrive*`). |
| `ARX_MEDIA_ARCHIVE_DEST` | Base archive dir (default `~/Videos/OneDrive-Media-Archive`). |
| `ARX_MEDIA_MIN_MB` | Minimum file size to move in MB (default **20**). |
| `ARX_MEDIA_LOG_DIR` | Log directory under `XDG_STATE_HOME` by default. |

**Cron** (if you prefer crontab over systemd): same schedule as the timer, e.g. `0 9 * * sun ~/.local/bin/arx-onedrive-media-archive`

## Troubleshooting

- **`git pull` fails in timer**: ensure credentials (SSH agent, `git credential-manager`, or token) are available in your **user** session; test with `systemctl --user start arx-staging-zettel-backup.service`.
- **Empty or partial mirror**: confirm `ARX_STAGING_BACKUP_DEST` is writable and sync software is not locking files; try lowering concurrency (edit `rsync` flags in the script if needed).
- **Media archive finds nothing**: set `ARX_ONEDRIVE_ROOT` to the real mount (e.g. Insync or `rclone` path) if your synced vault is not under `~/OneDrive*/Media`.
