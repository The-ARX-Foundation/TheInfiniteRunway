#!/usr/bin/env bash
# ARX Staging_Zettelkasten: git pull (canonical clone) + rsync mirror to cloud-sync folder.
# Bazzite / Fedora-class systems. See ../README.md for Windows parity.

set -euo pipefail

ENV_FILE="${ARX_STAGING_ENV_FILE:-${HOME}/.config/arx-staging-backup.env}"
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi

SOURCE="${ARX_STAGING_SOURCE:-${HOME}/The ARX Foundation/Staging_Zettelkasten}"
DEST="${ARX_STAGING_BACKUP_DEST:-${HOME}/OneDrive/The ARX Foundation/Staging_Zettelkasten}"
LOG_DIR="${ARX_STAGING_LOG_DIR:-${XDG_STATE_HOME:-${HOME}/.local/state}/arx-staging-backup/logs}"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/backup-$(date -u +%Y%m%d-%H%M%S).log"

log() {
  local line="[$(date -u '+%Y-%m-%d %H:%M:%SZ')] $*"
  printf '%s\n' "${line}" | tee -a "${LOG_FILE}"
}

die() {
  log "ERROR: $*"
  exit 1
}

[[ -d "${SOURCE}" ]] || die "Source missing: ${SOURCE}"
[[ -d "${SOURCE}/.git" ]] || die "Not a git repo: ${SOURCE}"

log "Starting backup (pull + mirror)."
log "Source: ${SOURCE}"
log "Dest:   ${DEST}"

branch="$(git -C "${SOURCE}" rev-parse --abbrev-ref HEAD)"
log "Branch: ${branch}"
log "git pull --ff-only origin ${branch}"
if ! git -C "${SOURCE}" pull --ff-only "origin" "${branch}" >>"${LOG_FILE}" 2>&1; then
  die "git pull failed."
fi

mkdir -p "${DEST}"
log "rsync mirror -> ${DEST}"
# Trailing slashes: copy contents; --delete drops extras in dest; exclude .git like Windows robocopy /XD .git
if ! rsync -a --delete --exclude='.git/' "${SOURCE}/" "${DEST}/" >>"${LOG_FILE}" 2>&1; then
  die "rsync failed."
fi

log "Done."
exit 0
