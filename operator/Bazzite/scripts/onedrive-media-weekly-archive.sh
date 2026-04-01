#!/usr/bin/env bash
# Weekly: move large files out of synced OneDrive Media/ into local Videos/OneDrive-Media-Archive/.
# Parity with Windows: %LOCALAPPDATA%\TheARXFoundation\onedrive-media-weekly-archive.ps1

set -euo pipefail

ENV_FILE="${ARX_MEDIA_ARCHIVE_ENV_FILE:-${HOME}/.config/arx-onedrive-media-archive.env}"
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi

MIN_MB="${ARX_MEDIA_MIN_MB:-20}"
LOG_DIR="${ARX_MEDIA_LOG_DIR:-${XDG_STATE_HOME:-${HOME}/.local/state}/arx-onedrive-media-archive/logs}"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/media-archive-$(date -u +%Y%m%d-%H%M%S).log"

log() {
  local line="[$(date -u '+%Y-%m-%d %H:%M:%SZ')] $*"
  printf '%s\n' "${line}" | tee -a "${LOG_FILE}"
}

die() {
  log "ERROR: $*"
  exit 1
}

resolve_onedrive_root() {
  if [[ -n "${ARX_ONEDRIVE_ROOT:-}" && -d "${ARX_ONEDRIVE_ROOT}/Media" ]]; then
    printf '%s\n' "${ARX_ONEDRIVE_ROOT}"
    return 0
  fi
  local c
  for c in "${HOME}/OneDrive" "${HOME}/onedrive"; do
    if [[ -d "${c}/Media" ]]; then
      printf '%s\n' "${c}"
      return 0
    fi
  done
  shopt -s nullglob
  for c in "${HOME}/OneDrive"*; do
    if [[ -d "${c}/Media" ]]; then
      printf '%s\n' "${c}"
      shopt -u nullglob
      return 0
    fi
  done
  shopt -u nullglob
  return 1
}

ROOT="$(resolve_onedrive_root)" || die "Could not find OneDrive Media/ (set ARX_ONEDRIVE_ROOT in ~/.config/arx-onedrive-media-archive.env)."
SRC_MEDIA="${ROOT}/Media"
DEST_ROOT="${ARX_MEDIA_ARCHIVE_DEST:-${HOME}/Videos/OneDrive-Media-Archive}"
DEST_BATCH="${DEST_ROOT}/$(date -u +%Y-%m-%d)"

log "OneDrive root: ${ROOT}"
log "Source: ${SRC_MEDIA}"
log "Archive batch: ${DEST_BATCH}"
log "Min size: ${MIN_MB} MB"

mapfile -t FILES < <(find "${SRC_MEDIA}" -type f -size "+${MIN_MB}M" 2>/dev/null || true)

if [[ "${#FILES[@]}" -eq 0 ]]; then
  log "No files over threshold; nothing to move."
  exit 0
fi

log "Files to move: ${#FILES[@]}"

for f in "${FILES[@]}"; do
  [[ -f "${f}" ]] || continue
  rel="${f#"${SRC_MEDIA}"/}"
  target="${DEST_BATCH}/${rel}"
  target_dir="$(dirname "${target}")"
  mkdir -p "${target_dir}"
  log "MOVE: ${f} -> ${target}"
  mv -f -- "${f}" "${target}"
done

log "Done."
exit 0
