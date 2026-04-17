#!/usr/bin/env bash
# Download Shift Happens van GitHub Releases en installeer naar /Applications.
#
# Strategie:
# - voorkeur: ZIP (minder issues bij sommige Gatekeeper/DMG gevallen)
# - fallback: DMG
#
# Gebruik:
#   ./scripts/install-mac-from-github.sh
#   ./scripts/install-mac-from-github.sh v1.5.9

set -euo pipefail

REPO="${REPO:-Deurklink-WT/theater-dashboard}"
APP_NAME="${APP_NAME:-Shift Happens}"
TAG="${1:-latest}"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Fout: vereist commando ontbreekt: $1" >&2
    exit 1
  }
}

need curl
need ditto
need uname
need python3
need hdiutil

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *) echo "Fout: onbekende mac architectuur: $ARCH_RAW" >&2; exit 1 ;;
esac

TMPDIR_ROOT="${TMPDIR:-/tmp}"
WORKDIR="$(mktemp -d "$TMPDIR_ROOT/shift-happens-install.XXXXXX")"
MNT="$WORKDIR/mnt"
ZIP_FILE="$WORKDIR/app.zip"
DMG_FILE="$WORKDIR/app.dmg"
UNZIP_DIR="$WORKDIR/unzip"

cleanup() {
  hdiutil detach "$MNT" >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

mkdir -p "$MNT" "$UNZIP_DIR"

if [[ "$TAG" == "latest" ]]; then
  API_URL="https://api.github.com/repos/${REPO}/releases/latest"
else
  API_URL="https://api.github.com/repos/${REPO}/releases/tags/${TAG}"
fi

echo "Release metadata ophalen: $REPO ($TAG, $ARCH)"
RELEASE_JSON="$(curl -fsSL "$API_URL")" || {
  echo "Fout: kan release metadata niet ophalen. Controleer repo/tag/netwerk." >&2
  exit 1
}

read_urls="$(RELEASE_JSON="$RELEASE_JSON" ARCH="$ARCH" python3 - <<'PY'
import json, os
j = json.loads(os.environ['RELEASE_JSON'])
arch = os.environ['ARCH']
assets = j.get('assets', [])
ver = (j.get('tag_name') or '').lstrip('v')

zip_preferred = [
  f"Shift-Happens-mac-{arch}.zip",
  f"Shift.Happens-{ver}-{arch}-mac.zip",
]
# electron-builder --x64 --arm64 op Apple Silicon: x64-ZIP heet vaak *-mac.zip zonder "x64"
if arch == "x64":
  zip_preferred.append(f"Shift.Happens-{ver}-mac.zip")

dmg_preferred = [
  f"Shift-Happens-mac-{arch}.dmg",
  f"Shift.Happens-{ver}-{arch}.dmg",
]
if arch == "x64":
  dmg_preferred.append(f"Shift.Happens-{ver}.dmg")

def find_exact(names):
  for n in names:
    for a in assets:
      if a.get('name') == n:
        return a.get('browser_download_url','')
  return ''

def find_contains(parts, suffix):
  for a in assets:
    n = a.get('name','').lower()
    if all(p in n for p in parts) and n.endswith(suffix):
      return a.get('browser_download_url','')
  return ''

zip_url = find_exact(zip_preferred) or find_contains(['mac', arch], '.zip')
dmg_url = find_exact(dmg_preferred) or find_contains(['mac', arch], '.dmg')
print(zip_url)
print(dmg_url)
PY
)"
ZIP_URL="$(echo "$read_urls" | sed -n '1p')"
DMG_URL="$(echo "$read_urls" | sed -n '2p')"

APP_PATH=""

if [[ -n "$ZIP_URL" ]]; then
  echo "Download ZIP: $ZIP_URL"
  if curl -fL "$ZIP_URL" -o "$ZIP_FILE"; then
    ditto -x -k "$ZIP_FILE" "$UNZIP_DIR"
    APP_PATH="$(/bin/ls -d "$UNZIP_DIR"/*.app 2>/dev/null | sed -n '1p')"
  fi
fi

if [[ -z "$APP_PATH" ]]; then
  [[ -n "$DMG_URL" ]] || { echo "Fout: geen passende ZIP of DMG asset gevonden." >&2; exit 1; }
  echo "ZIP niet bruikbaar, fallback naar DMG: $DMG_URL"
  curl -fL "$DMG_URL" -o "$DMG_FILE"
  hdiutil attach "$DMG_FILE" -mountpoint "$MNT" -nobrowse -quiet
  APP_PATH="$(/bin/ls -d "$MNT"/*.app 2>/dev/null | sed -n '1p')"
fi

if [[ -z "$APP_PATH" || ! -d "$APP_PATH" ]]; then
  echo "Fout: geen .app gevonden in artifact." >&2
  exit 1
fi

APP_BASENAME="$(basename "$APP_PATH")"
if [[ "$APP_BASENAME" != *.app ]]; then
  echo "Fout: ongeldige app-naam: $APP_BASENAME" >&2
  exit 1
fi

if [[ "$APP_NAME" != "${APP_BASENAME%.app}" ]]; then
  echo "Waarschuwing: app-naam in artifact is '$APP_BASENAME' (verwacht: '$APP_NAME.app')."
fi

DEST="/Applications/$APP_BASENAME"
echo "Installeer: $DEST"
sudo ditto "$APP_PATH" "$DEST"

# Best effort: minder Gatekeeper/icoon-cache issues
sudo xattr -cr "$DEST" 2>/dev/null || true
touch "$DEST" || true
killall Finder >/dev/null 2>&1 || true
killall Dock >/dev/null 2>&1 || true

echo "Klaar: $DEST"
