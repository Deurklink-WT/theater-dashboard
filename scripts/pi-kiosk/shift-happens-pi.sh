#!/usr/bin/env bash
# Shift Happens — Raspberry Pi / Linux arm64: AppImage downloaden, updaten, kiosk starten.
# Vereist: bash, curl, python3. Voor private GitHub-releases: GH_TOKEN (repo read).
#
# Gebruik:
#   ./shift-happens-pi.sh install
#   ./shift-happens-pi.sh update
#   ./shift-happens-pi.sh update-if-newer   # alleen downloaden als release nieuwer is
#   ./shift-happens-pi.sh kiosk-autostart
#   ./shift-happens-pi.sh kiosk-systemd
#   ./shift-happens-pi.sh install-update-timer   # systemd user: dagelijks update-if-newer
#   ./shift-happens-pi.sh status
#   ./shift-happens-pi.sh install-deps
#
# Omgeving: GITHUB_REPO, SHIFT_HAPPENS_HOME, GH_TOKEN, SHIFT_HAPPENS_CURL_IPV4=1
# Config: ~/.config/shift-happens/env

set -euo pipefail

GITHUB_REPO="${GITHUB_REPO:-Deurklink-WT/theater-dashboard}"
SCRIPT_NAME="$(basename "$0")"

if [[ -n "${SHIFT_HAPPENS_HOME:-}" ]]; then
  INSTALL_DIR="$SHIFT_HAPPENS_HOME"
elif [[ "$(id -u)" -eq 0 ]]; then
  INSTALL_DIR="${SHIFT_HAPPENS_HOME_ROOT:-/opt/shift-happens}"
else
  INSTALL_DIR="${HOME}/.local/share/shift-happens"
fi

APPIMAGE_LINK="${INSTALL_DIR}/ShiftHappens.AppImage"
WRAPPER_SCRIPT="${INSTALL_DIR}/run-kiosk.sh"
ENV_DIR="${HOME}/.config/shift-happens"
ENV_FILE="${ENV_DIR}/env"
DESKTOP_AUTOSTART="${HOME}/.config/autostart/shift-happens-kiosk.desktop"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"
SYSTEMD_UNIT="${SYSTEMD_USER_DIR}/shift-happens-kiosk.service"
UPDATE_SERVICE="${SYSTEMD_USER_DIR}/shift-happens-update.service"
UPDATE_TIMER="${SYSTEMD_USER_DIR}/shift-happens-update.timer"
# Standaard: elke dag om 04:00 (override via env SHIFT_HAPPENS_UPDATE_ONCALENDAR)
SHIFT_HAPPENS_UPDATE_ONCALENDAR="${SHIFT_HAPPENS_UPDATE_ONCALENDAR:-*-*-* 04:00:00}"

die() { echo "${SCRIPT_NAME}: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Ontbreekt: $1 (installeer en probeer opnieuw)"
}

load_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
}

# Eén Python-stap: API + JSON + arm64-AppImage (geen tweede python via bash-pipe).
github_fetch_arm64_appimage_triple() {
  GITHUB_REPO="$GITHUB_REPO" GH_TOKEN="${GH_TOKEN:-}" python3 - <<'PY'
import json
import os
import re
import sys
import urllib.error
import urllib.request

repo = (os.environ.get("GITHUB_REPO") or "").strip() or "Deurklink-WT/theater-dashboard"
token = (os.environ.get("GH_TOKEN") or "").strip()
api = f"https://api.github.com/repos/{repo}/releases/latest"
req = urllib.request.Request(api)
req.add_header("Accept", "application/vnd.github+json")
req.add_header("X-GitHub-Api-Version", "2022-11-28")
req.add_header("User-Agent", "Shift-Happens-Pi/1.0 (Python-one-shot)")
if token:
    req.add_header("Authorization", f"Bearer {token}")
try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        raw = resp.read().decode()
except urllib.error.HTTPError as e:
    err = ""
    try:
        err = e.read().decode(errors="replace")
    except Exception:
        pass
    print(f"shift-happens-pi: GitHub API HTTP {e.code}: {err[:800]}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"shift-happens-pi: GitHub API / netwerk: {e}", file=sys.stderr)
    sys.exit(1)
if not (raw or "").strip():
    print("shift-happens-pi: leeg antwoord van GitHub API", file=sys.stderr)
    sys.exit(1)
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    print(f"shift-happens-pi: JSON parse: {e} — begin: {raw[:400]!r}", file=sys.stderr)
    sys.exit(1)
tag = data.get("tag_name") or ""
assets = data.get("assets") or []
pat_dot = re.compile(r"^Shift\.Happens-.+-arm64\.AppImage$")
pat_space = re.compile(r"^Shift Happens-.+-arm64\.AppImage$")
for a in assets:
    name = (a.get("name") or "").strip()
    bu = (a.get("browser_download_url") or "").strip()
    if not name or not bu:
        continue
    if pat_dot.match(name) or pat_space.match(name):
        ver = tag.lstrip("v") or ""
        print(name)
        print(bu)
        print(ver)
        sys.exit(0)
names = [a.get("name") for a in assets if a.get("name")]
print(
    "shift-happens-pi: geen *-arm64.AppImage in laatste release. "
    f"Assets ({len(names)}): {names[:30]}",
    file=sys.stderr,
)
sys.exit(1)
PY
}

fill_lines_from_github() {
  lines=()
  if ! readarray -t lines < <(github_fetch_arm64_appimage_triple); then
    die "GitHub-release kon niet worden gelezen (zie stderr hierboven)."
  fi
  if (( ${#lines[@]} < 3 )) || [[ -z "${lines[0]:-}" ]]; then
    die "Onverwacht korte output van GitHub-parser."
  fi
}

get_local_appimage_version() {
  local target base
  if [[ ! -e "$APPIMAGE_LINK" ]]; then
    echo ""
    return 0
  fi
  target="$(readlink -f "$APPIMAGE_LINK" 2>/dev/null || readlink "$APPIMAGE_LINK" 2>/dev/null || true)"
  base="$(basename "$target")"
  if [[ "$base" =~ Shift\.Happens-([0-9]+\.[0-9]+\.[0-9]+)-arm64\.AppImage ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo ""
  fi
}

# Exit 0 = upgrade nodig; exit 1 = niet nodig (actueel of lokaal nieuwer)
need_upgrade_semver() {
  python3 - "$1" "$2" <<'PY'
import sys

def tup(s):
    if not s or not s.strip():
        return None
    parts = s.strip().lstrip("v").split(".")
    out = []
    for p in parts[:4]:
        if p.isdigit():
            out.append(int(p))
        else:
            digits = "".join(ch for ch in p if ch.isdigit())
            out.append(int(digits) if digits else 0)
    while len(out) < 3:
        out.append(0)
    return tuple(out[:4])

rem, loc = sys.argv[1], sys.argv[2]
tr, tl = tup(rem), tup(loc)
if tl is None:
    sys.exit(0)
if tr is None:
    sys.exit(1)
if tr > tl:
    sys.exit(0)
sys.exit(1)
PY
}

download_parts_to_install() {
  local name="$1" url="$2" ver="$3"
  mkdir -p "$INSTALL_DIR"
  local tmp="${INSTALL_DIR}/${name}.part"
  echo "Download: $name (v${ver})"
  if [[ -n "${GH_TOKEN:-}" ]]; then
    curl -fL --retry 3 --retry-delay 2 \
      -H "User-Agent: Shift-Happens-Pi/1.0" \
      -H "Authorization: Bearer ${GH_TOKEN}" \
      -o "$tmp" "$url"
  else
    curl -fL --retry 3 --retry-delay 2 \
      -H "User-Agent: Shift-Happens-Pi/1.0" \
      -o "$tmp" "$url"
  fi
  chmod a+x "$tmp"
  mv -f "$tmp" "${INSTALL_DIR}/${name}"
  ln -sfn "${INSTALL_DIR}/${name}" "$APPIMAGE_LINK"
  echo "Klaar: ${INSTALL_DIR}/${name} -> ${APPIMAGE_LINK}"
}

post_update_restart_kiosk() {
  if command -v systemctl >/dev/null 2>&1; then
    if systemctl --user is-active --quiet shift-happens-kiosk.service 2>/dev/null; then
      echo "Herstart kiosk-service voor nieuwe versie…"
      systemctl --user restart shift-happens-kiosk.service || true
    fi
  fi
}

download_release_asset() {
  require_cmd curl
  require_cmd python3
  load_env_file

  local name url ver
  fill_lines_from_github
  name="${lines[0]}"
  url="${lines[1]}"
  ver="${lines[2]}"

  download_parts_to_install "$name" "$url" "$ver"
  post_update_restart_kiosk
}

cmd_update_if_newer() {
  require_cmd curl
  require_cmd python3
  load_env_file

  local name url remote_ver local_ver
  fill_lines_from_github
  name="${lines[0]}"
  url="${lines[1]}"
  remote_ver="${lines[2]}"
  local_ver="$(get_local_appimage_version)"

  if [[ -n "$local_ver" ]] && ! need_upgrade_semver "$remote_ver" "$local_ver"; then
    echo "Geen update: lokaal ${local_ver}, release ${remote_ver} (actueel of nieuwer geïnstalleerd)."
    exit 0
  fi

  if [[ -z "$local_ver" ]]; then
    echo "Geen lokale versie gevonden: installeer ${remote_ver}."
  else
    echo "Update beschikbaar: ${local_ver} -> ${remote_ver}"
  fi

  download_parts_to_install "$name" "$url" "$remote_ver"
  post_update_restart_kiosk
}

cmd_install() { download_release_asset; }
cmd_update() { download_release_asset; }

cmd_status() {
  load_env_file
  echo "INSTALL_DIR=$INSTALL_DIR"
  echo "APPIMAGE_LINK=$APPIMAGE_LINK"
  echo "lokaal_versie=$(get_local_appimage_version || true)"
  echo "WRAPPER_SCRIPT=$WRAPPER_SCRIPT"
  if [[ -L "$APPIMAGE_LINK" || -f "$APPIMAGE_LINK" ]]; then
    ls -la "$APPIMAGE_LINK"
    readlink -f "$APPIMAGE_LINK" 2>/dev/null || true
  else
    echo "(nog geen AppImage — voer '${SCRIPT_NAME} install' uit)"
  fi
  echo "ENV_FILE=$ENV_FILE"
  if [[ -f "$ENV_FILE" ]]; then
    echo "--- ${ENV_FILE} (gevoelige waarden gemaskeerd) ---"
    sed 's/ghp_[A-Za-z0-9]*/ghp_***MASKED***/g' "$ENV_FILE" | grep -v '^#' || true
  fi
}

ensure_appimage_or_die() {
  [[ -e "$APPIMAGE_LINK" ]] || die "Geen AppImage op ${APPIMAGE_LINK}. Eerst: ${SCRIPT_NAME} install"
}

write_env_template() {
  mkdir -p "$ENV_DIR"
  if [[ ! -f "$ENV_FILE" ]]; then
    cat > "$ENV_FILE" <<'EOF'
# Optioneel: GitHub token voor install/update via API bij een private repository.
# GH_TOKEN=ghp_voorbeeld

# X11-scherm (standaard op Raspberry Pi OS met desktop; nodig voor kiosk + systemd --user)
DISPLAY=:0

# Extra argumenten voor Electron (spaties toegestaan; alleen indien nodig)
# EXTRA_APPIMAGE_ARGS=--no-sandbox
EOF
    echo "Aangemaakt: $ENV_FILE (pas aan indien nodig)"
  fi
}

# Zonder DISPLAY start Electron onder systemd --user vaak niet (lege GUI).
ensure_display_in_env_for_kiosk() {
  write_env_template
  touch "$ENV_FILE"
  if ! grep -qE '^[[:space:]]*DISPLAY=' "$ENV_FILE"; then
    {
      echo ""
      echo "# Toegevoegd voor kiosk-autostart / systemd (X11)"
      echo "DISPLAY=:0"
    } >> "$ENV_FILE"
    echo "${SCRIPT_NAME}: DISPLAY=:0 toegevoegd aan ${ENV_FILE}"
  fi
}

write_kiosk_wrapper() {
  cat > "$WRAPPER_SCRIPT" <<EOF
#!/usr/bin/env bash
set -euo pipefail
APPIMAGE="${APPIMAGE_LINK}"
ENV_FILE="${ENV_FILE}"
[[ -f "\$ENV_FILE" ]] && set -a && source "\$ENV_FILE" && set +a
export KIOSK_MODE="\${KIOSK_MODE:-true}"
# shellcheck disable=SC2086
exec "\$APPIMAGE" --kiosk \${EXTRA_APPIMAGE_ARGS-}
EOF
  chmod a+x "$WRAPPER_SCRIPT"
  echo "Wrapper: $WRAPPER_SCRIPT"
}

cmd_kiosk_autostart() {
  require_cmd mkdir
  ensure_appimage_or_die
  ensure_display_in_env_for_kiosk
  write_kiosk_wrapper
  mkdir -p "$(dirname "$DESKTOP_AUTOSTART")"
  cat > "$DESKTOP_AUTOSTART" <<EOF
[Desktop Entry]
Type=Application
Name=Shift Happens (kiosk)
Comment=Theater Dashboard kiosk
Exec=/usr/bin/env DISPLAY=:0 ${WRAPPER_SCRIPT}
Icon=application-x-executable
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
EOF
  chmod 644 "$DESKTOP_AUTOSTART"
  echo "Autostart: $DESKTOP_AUTOSTART"
  echo "Zonder automatisch inloggen op de desktop start de kiosk niet na een reboot:"
  echo "  sudo raspi-config → System Options → Boot / Auto Login → Desktop Autologin"
  echo "Daarna: opnieuw inloggen of herstarten. (Gebruik je óók systemd kiosk: één methode, anders dubbele app.)"
}

cmd_install_update_timer() {
  require_cmd mkdir
  local script_abs
  script_abs="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
  [[ -x "$script_abs" || -f "$script_abs" ]] || die "Kan script niet vinden: $script_abs"
  mkdir -p "$SYSTEMD_USER_DIR"
  write_env_template

  cat > "$UPDATE_SERVICE" <<EOF
[Unit]
Description=Shift Happens — check voor nieuwe release (arm64 AppImage)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
EnvironmentFile=-${ENV_FILE}
ExecStart=/bin/bash ${script_abs} update-if-newer
EOF

  cat > "$UPDATE_TIMER" <<EOF
[Unit]
Description=Dagelijkse Shift Happens update-check

[Timer]
OnCalendar=${SHIFT_HAPPENS_UPDATE_ONCALENDAR}
RandomizedDelaySec=45min
Persistent=true

[Install]
WantedBy=timers.target
EOF

  echo "Service: $UPDATE_SERVICE"
  echo "Timer:   $UPDATE_TIMER (OnCalendar=${SHIFT_HAPPENS_UPDATE_ONCALENDAR})"
  echo "Schakel in: systemctl --user daemon-reload && systemctl --user enable --now shift-happens-update.timer"
  echo "Logs:       journalctl --user -u shift-happens-update.service -n 50 --no-pager"
}

cmd_kiosk_systemd() {
  require_cmd mkdir
  ensure_appimage_or_die
  ensure_display_in_env_for_kiosk
  write_kiosk_wrapper
  mkdir -p "$SYSTEMD_USER_DIR"
  cat > "$SYSTEMD_UNIT" <<EOF
[Unit]
Description=Shift Happens (kiosk)
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Type=simple
EnvironmentFile=-${ENV_FILE}
Environment=DISPLAY=:0
Environment=XAUTHORITY=%h/.Xauthority
ExecStart=${WRAPPER_SCRIPT}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
EOF
  echo "User unit: $SYSTEMD_UNIT"
  echo "Voer uit: systemctl --user daemon-reload && systemctl --user enable --now shift-happens-kiosk.service"
  echo "Na reboot moet je automatisch op de desktop inloggen: sudo raspi-config → Boot / Auto Login → Desktop Autologin"
  echo "Als je óók ~/.config/autostart/… gebruikt: dubbele kiosk — verwijder het .desktop-bestand of schakel deze service uit."
  echo "Eventueel (user timers zonder login): loginctl enable-linger \$USER"
}

cmd_install_deps() {
  if [[ ! -f /etc/debian_version ]]; then
    die "install-deps ondersteunt nu alleen Debian/Ubuntu-achtigen (apt)."
  fi
  require_cmd sudo
  sudo apt-get update
  sudo apt-get install -y --no-install-recommends libfuse2 squashfs-tools
  echo "libfuse2 geïnstalleerd (veel AppImages hebben dit nodig op Pi OS)."
}

usage() {
  cat <<EOF
Shift Happens — Pi/Linux arm64 helper

  install           Download nieuwste Shift.Happens-*-arm64.AppImage
  update            Zelfde als install
  update-if-newer   Alleen downloaden als GitHub-release nieuwer is; herstart kiosk indien actief
  status            Paden en symlink
  kiosk-autostart   XDG autostart + wrapper (kiosk)
  kiosk-systemd     systemd user unit + wrapper
  install-update-timer  systemd user: dagelijks update-if-newer (timer + oneshot-service)
  install-deps      sudo apt: libfuse2 (Debian/Ubuntu)

Omgeving: GITHUB_REPO, SHIFT_HAPPENS_HOME, GH_TOKEN, SHIFT_HAPPENS_UPDATE_ONCALENDAR
EOF
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    install) cmd_install ;;
    update) cmd_update ;;
    update-if-newer) cmd_update_if_newer ;;
    status) cmd_status ;;
    kiosk-autostart) cmd_kiosk_autostart ;;
    kiosk-systemd) cmd_kiosk_systemd ;;
    install-update-timer) cmd_install_update_timer ;;
    install-deps) cmd_install_deps ;;
    -h|--help|help|'') usage ;;
    *) die "Onbekend commando: $cmd (zie --help)" ;;
  esac
}

main "$@"
