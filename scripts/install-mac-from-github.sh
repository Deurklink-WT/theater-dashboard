#!/usr/bin/env bash
# Download Shift Happens (macOS arm64) van GitHub Releases en installeer naar /Applications.
#
# Vereist: GitHub CLI (gh) en ingelogd met toegang tot de repo (private repo).
#
# "Latest" (zoals Docker :latest):
#   Zonder tag download je altijd de nieuwste GitHub-release — vergelijkbaar met een latest-tag.
#   Optioneel: upload bij elke release een asset met een VASTE naam (zie docs/UPDATES.md), dan
#   blijft ook de download-URL stabiel: .../releases/latest/download/<vaste-naam>.dmg
#
# Gebruik:
#   ./scripts/install-mac-from-github.sh                    # nieuwste release (= latest)
#   ./scripts/install-mac-from-github.sh v1.5.6             # vaste tag
#   STABLE_DMG_NAME="Shift-Happens-mac-arm64.dmg" \
#     ./scripts/install-mac-from-github.sh                  # alleen dit bestand (aanbevolen na upload)
#
# Optioneel:
#   REPO=owner/repo ./scripts/install-mac-from-github.sh

set -euo pipefail

REPO="${REPO:-Deurklink-WT/theater-dashboard}"
TAG="${1:-}"
# Vaste assetnaam op elke release (optioneel; anders pattern *arm64.dmg)
STABLE_DMG_NAME="${STABLE_DMG_NAME:-}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Installeer eerst GitHub CLI: brew install gh && gh auth login" >&2
  exit 1
fi

TMPDIR="${TMPDIR:-/tmp}"
WORKDIR=$(mktemp -d "${TMPDIR}/shift-happens-install.XXXXXX")
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

cd "$WORKDIR"

PATTERN="${STABLE_DMG_NAME:-*arm64.dmg}"

if [[ -n "$TAG" ]]; then
  echo "Download release $TAG van $REPO (pattern: $PATTERN) ..."
  gh release download "$TAG" --repo "$REPO" --pattern "$PATTERN" --clobber
else
  echo "Download nieuwste release (= latest) van $REPO (pattern: $PATTERN) ..."
  gh release download --repo "$REPO" --pattern "$PATTERN" --clobber
fi

shopt -s nullglob
DMG=( *.dmg )
shopt -u nullglob

if [[ ${#DMG[@]} -eq 0 ]]; then
  echo "Geen .dmg gevonden. Controleer release-assets (pattern: $PATTERN)." >&2
  exit 1
fi

if [[ ${#DMG[@]} -gt 1 ]]; then
  echo "Meerdere .dmg gevonden; gebruik STABLE_DMG_NAME met één vaste bestandsnaam op de release." >&2
  printf '%s\n' "${DMG[@]}"
  exit 1
fi

DMG_FILE="${DMG[0]}"
echo "DMG: $DMG_FILE"

MNT="$WORKDIR/mnt"
mkdir -p "$MNT"
echo "Mount DMG ..."
hdiutil attach "$DMG_FILE" -mountpoint "$MNT" -nobrowse

APP=$(find "$MNT" -maxdepth 2 -name "*.app" -print -quit)
if [[ -z "$APP" || ! -d "$APP" ]]; then
  hdiutil detach "$MNT" || true
  echo "Geen .app gevonden in DMG." >&2
  exit 1
fi

echo "Installeer naar /Applications ..."
rm -rf "/Applications/$(basename "$APP")"
cp -R "$APP" /Applications/

hdiutil detach "$MNT"
echo "Klaar: $(basename "$APP") staat in /Applications"
