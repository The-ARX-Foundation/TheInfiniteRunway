#!/usr/bin/env bash
# Build the public ARX vault site (vault.thearxfoundation.org) with Quartz.
# Cloudflare Workers Builds runs this as the build command; wrangler.jsonc serves the output.
# Local: bash scripts/build_vault_site.sh  (output: build/arx-external/public)
set -euo pipefail
QUARTZ_REF="${QUARTZ_REF:-v5.1.0}"
OUT=build/arx-external
cd "$(dirname "$0")/.."
if [ ! -f "$OUT/package.json" ]; then
  rm -rf "$OUT"
  git clone --depth 1 --branch "$QUARTZ_REF" https://github.com/jackyzha0/quartz.git "$OUT"
fi
(cd "$OUT" && npm ci --no-audit --no-fund)
sed -i -e 's/^  pageTitle: .*/  pageTitle: The Infinite Runway/' \
       -e 's/^  baseUrl: .*/  baseUrl: vault.thearxfoundation.org/' "$OUT/quartz.config.default.yaml"
rm -rf "$OUT/content"
python3 scripts/build_sites.py --domain arx --surface external --build-subdir arx-external
if [ ! -f "$OUT/content/index.md" ]; then
  cat > "$OUT/content/index.md" <<'MD'
---
title: The Infinite Runway
---
The ARX Foundation's public vault. Modules published so far:

- [[Modules/DIY-MBA/Global Index|DIY-MBA]]: notes for learning business acumen.
MD
fi
(cd "$OUT" && npx quartz build)
echo "built: $OUT/public"
