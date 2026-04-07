#!/usr/bin/env bash
# Download Shift Happens van GitHub Releases en installeer naar /Applications.
#
# Eigenschappen:
# - Auto detectie van arch (arm64/x64)
# - Werkt met publieke repo (geen gh nodig)
# - Fallback op meerdere assetnaam-varianten
# - Duidelijke foutmelding per stap
#
# Gebruik:
#   ./scripts/install-mac-from-github.sh            # latest
#   ./scripts/install-mac-from-github.sh v1.5.9     # specifieke tag
#
# Optioneel:
#   REPO=owner/repo APP_NAME="Shift Happens" ./scripts/install-mac-from-github.sh

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
need hdiutil
need ditto
need uname
need python3

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *)
    echo "Fout: onbekende mac architectuur: $ARCH_RAW" >&2
    exit 1
    ;;
esac

TMPDIR_ROOT="${TMPDIR:-/tmp}"
WORKDIR="$(mktemp -d "$TMPDIR_ROOT/shift-happens-install.XXXXXX")"
MNT="$WORKDIR/mnt"
DMG="$WORKDIR/app.dmg"

cleanup() {
  hdiutil detach "$MNT" >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

mkdir -p "$MNT"

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

DMG_URL="$(RELEASE_JSON="$RELEASE_JSON" ARCH="$ARCH" python3 - <<'PY'
import json, os

j = json.loads(os.environ['RELEASE_JSON'])
arch = os.environ['ARCH']
assets = j.get('assets', [])
names = [a.get('name', '') for a in assets]

preferred = [
  f"Shift-Happens-mac-{arch}.dmg",
  f"Shift.Happens-mac-{arch}.dmg",
]

# Fallbacks op veelvoorkomende oude/nieuwe naamvormen
contains_priority = [
  f"mac-{arch}.dmg",
  f"{arch}.dmg",
  ".dmg",
]

def url_for(name):
  for a in assets:
    if a.get('name') == name:
      return a.get('browser_download_url', '')
  return ''

url = ''
for n in preferred:
  url = url_for(n)
  if url:
    break

if not url:
  lowered = [(a.get('name','').lower(), a.get('browser_download_url','')) for a in assets]
  for needle in contains_priority:
    n = needle.lower()
    for name, u in lowered:
      if n in name and name.endswith('.dmg'):
        url = u
        break
    if url:
      break

print(url)
PY
)"

if [[ -z "$DMG_URL" ]]; then
  echo "Fout: geen passende DMG-asset gevonden voor arch=$ARCH op release $TAG." >&2
  echo "Tip: controleer assets op https://github.com/${REPO}/releases" >&2
  exit 1
fi

echo "Download: $DMG_URL"
curl -fL "$DMG_URL" -o "$DMG" || {
  echo "Fout: downloaden van DMG is mislukt." >&2
  exit 1
}

echo "Mount DMG"
hdiutil attach "$DMG" -mountpoint "$MNT" -nobrowse -quiet || {
  echo "Fout: DMG mounten mislukt." >&2
  exit 1
}

APP_PATH="$(/bin/ls -d "$MNT"/*.app 2>/dev/null | sed -n '1p')"
if [[ -z "$APP_PATH" || ! -d "$APP_PATH" ]]; then
  echo "Fout: geen .app gevonden in DMG." >&2
  exit 1
fi

APP_BASENAME="$(basename "$APP_PATH")"
if [[ "$APP_BASENAME" != *.app ]]; then
  echo "Fout: ongeldige app-naam in DMG: $APP_BASENAME" >&2
  exit 1
fi

if [[ "$APP_NAME" != "${APP_BASENAME%.app}" ]]; then
  echo "Waarschuwing: app-naam in DMG is "$APP_BASENAME" (verwacht: "$APP_NAME.app")."
fi

DEST="/Applications/$APP_BASENAME"
echo "Installeer: $DEST"
sudo ditto "$APP_PATH" "$DEST"

# Best effort: verwijder quarantine en refresh icon cache
sudo xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
touch "$DEST" || true
killall Finder >/dev/null 2>&1 || true
killall Dock >/dev/null 2>&1 || true

echo "Klaar: $DEST"
