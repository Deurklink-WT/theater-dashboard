#!/bin/bash
set -euo pipefail

REPO="${REPO:-Deurklink-WT/theater-dashboard}"
TAG="${1:-latest}"

SCRIPT_URL="https://raw.githubusercontent.com/${REPO}/main/scripts/install-mac-from-github.sh"
TMP_SCRIPT="$(mktemp /tmp/shift-happens-install.XXXXXX.sh)"

cleanup() {
  rm -f "$TMP_SCRIPT"
}
trap cleanup EXIT

curl -fsSL "$SCRIPT_URL" -o "$TMP_SCRIPT"
chmod +x "$TMP_SCRIPT"

"$TMP_SCRIPT" "$TAG"

echo
read -r -p "Klaar. Druk op Enter om af te sluiten..." _
