#!/usr/bin/env bash
# Upload stabiele releasenamen naar een bestaande GitHub release-tag.
# Voorbeeld: ./scripts/upload-stable-assets.sh v1.5.9

set -euo pipefail

TAG="${1:-}"
REPO="${REPO:-Deurklink-WT/theater-dashboard}"
DIST_DIR="${DIST_DIR:-dist}"

if [[ -z "$TAG" ]]; then
  echo "Gebruik: $0 <tag>" >&2
  exit 1
fi

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Fout: vereist commando ontbreekt: $1" >&2
    exit 1
  }
}

need gh
need cp
need mktemp

mac_dmg_src="$(/bin/ls -t "$DIST_DIR"/*arm64.dmg 2>/dev/null | sed -n '1p')"
mac_zip_src="$(/bin/ls -t "$DIST_DIR"/*arm64-mac.zip 2>/dev/null | sed -n '1p')"
win_src="$(/bin/ls -t "$DIST_DIR"/*Setup*1.5*.exe "$DIST_DIR"/*Setup*.exe 2>/dev/null | sed -n '1p')"
pi_src="$(/bin/ls -t "$DIST_DIR"/*arm64.AppImage 2>/dev/null | sed -n '1p')"

[[ -n "$mac_dmg_src" ]] || { echo "Geen mac DMG gevonden in $DIST_DIR" >&2; exit 1; }
[[ -n "$mac_zip_src" ]] || { echo "Geen mac ZIP gevonden in $DIST_DIR" >&2; exit 1; }
[[ -n "$win_src" ]] || { echo "Geen Windows EXE gevonden in $DIST_DIR" >&2; exit 1; }
[[ -n "$pi_src" ]] || { echo "Geen Pi AppImage gevonden in $DIST_DIR" >&2; exit 1; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cp "$mac_dmg_src" "$tmp/Shift-Happens-mac-arm64.dmg"
cp "$mac_zip_src" "$tmp/Shift-Happens-mac-arm64.zip"
cp "$win_src" "$tmp/Shift-Happens-win-x64.exe"
cp "$pi_src" "$tmp/Shift-Happens-pi-arm64.AppImage"

gh release upload "$TAG" \
  "$tmp/Shift-Happens-mac-arm64.dmg" \
  "$tmp/Shift-Happens-mac-arm64.zip" \
  "$tmp/Shift-Happens-win-x64.exe" \
  "$tmp/Shift-Happens-pi-arm64.AppImage" \
  --repo "$REPO" --clobber

echo "Klaar: stabiele assets geupload naar $REPO@$TAG"
