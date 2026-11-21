#!/usr/bin/env bash
# Stamp the card version in TypeScript source (and package.json / README).
# Usage: ./scripts/set-version.sh 0.6.1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VER="${1:-}"

if [[ ! "$VER" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z]+)?$ ]]; then
  echo "Usage: $0 0.6.1" >&2
  exit 1
fi

version_ts="$ROOT/src/version.ts"
if [[ ! -f "$version_ts" ]]; then
  echo "Cannot find src/version.ts" >&2
  exit 1
fi

sed -i -E "s/(export const CARD_VERSION = \")[^\"]+(\";)/\\1${VER}\\2/" "$version_ts"

if [[ -f "$ROOT/package.json" ]]; then
  sed -i -E "s/(\"version\": \")[^\"]+(\")/\\1${VER}\\2/" "$ROOT/package.json"
fi

readme="$ROOT/README.md"
if [[ -f "$readme" ]]; then
  sed -i -E "s/(Mushroom Weather Station Card · v)[0-9][0-9A-Za-z.-]*/\\1${VER}/" "$readme"
fi

echo "Set CARD_VERSION to ${VER} in src/version.ts"
echo "Next:"
echo "  1. npm run build"
echo "  2. git add -A && git commit -m \"Release v${VER}\""
echo "  3. Use Actions → Release, or tag and attach dist/*.js"
