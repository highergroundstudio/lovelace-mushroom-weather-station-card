#!/usr/bin/env bash
# Stamp the card version in the one place HACS actually ships.
# Usage: ./scripts/set-version.sh 0.4.3
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VER="${1:-}"

if [[ ! "$VER" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)?$ ]]; then
  echo "Usage: $0 0.4.3" >&2
  exit 1
fi

card="$ROOT/mushroom-weather-station-card.js"
if [[ ! -f "$card" ]]; then
  card="$ROOT/dist/mushroom-weather-station-card.js"
fi
if [[ ! -f "$card" ]]; then
  echo "Cannot find mushroom-weather-station-card.js" >&2
  exit 1
fi

# Only the card file holds CARD_VERSION. The editor reads it from the custom element.
sed -i -E \
  -e "s/^( \* Version )[0-9].*/\\1${VER}/" \
  -e "s/^(const CARD_VERSION = \")[^\"]+(\";)/\\1${VER}\\2/" \
  "$card"

if [[ -f "$ROOT/package.json" ]]; then
  sed -i -E "s/(\"version\": \")[^\"]+(\")/\\1${VER}\\2/" "$ROOT/package.json"
fi

readme="$ROOT/README.md"
if [[ -f "$readme" ]]; then
  sed -i -E "s/(Mushroom Weather Station Card · v)[0-9][0-9A-Za-z.-]*/\\1${VER}/" "$readme"
fi

echo "Set CARD_VERSION to ${VER} in $(basename "$card")"
echo "Next:"
echo "  1. Copy both JS files into dist/"
echo "  2. git add -A && git commit -m \"Release v${VER}\""
echo "  3. git tag v${VER} && git push origin main --tags"
echo "  4. GitHub → Releases → v${VER}, attach both JS files"
