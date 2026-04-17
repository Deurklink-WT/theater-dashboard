# Updates naar eindgebruikers (Shift Happens)

**Stap-voor-stap testen:** zie [`UPDATE-TEST-STAPPEN.md`](./UPDATE-TEST-STAPPEN.md) (Fase A: dev-knop; Fase B: echte release).

## macOS auto-install structureel fixen (signing + notarization)

Voor betrouwbare in-app installatie op macOS moeten releases **gesigned en notarized** zijn.

### GitHub secrets (repo settings)

Zet deze secrets in GitHub:

- `CSC_LINK`: base64/pad/data-URL naar je `.p12` Developer ID Application certificaat
- `CSC_KEY_PASSWORD`: wachtwoord van dat `.p12` certificaat
- `APPLE_ID`: Apple ID voor notarization
- `APPLE_APP_SPECIFIC_PASSWORD`: app-specifiek wachtwoord van Apple ID
- `APPLE_TEAM_ID`: je Apple Team ID
- `GH_TOKEN_UPDATER` (optioneel): read-only token voor private release feed injectie

### Workflow

Gebruik workflow **`Release macOS Signed`** (`.github/workflows/release-mac-signed.yml`):

- trigger op tag (`v*`) of handmatig met `tag`
- bouwt mac artifacts
- signeert + notarize via electron-builder env vars
- uploadt updater-metadata (`latest-mac.yml`) en mac assets naar de release

> Zonder geldige signing/notarization kan `electron-updater` downloaden, maar install op macOS alsnog blokkeren met code-signature fouten.

## Hoe het werkt

1. **Jij bouwt** een nieuwe versie (`npm run build:win` / `build:mac` / `build:pi`).
2. **Jij publiceert** op **GitHub Releases** (zelfde repo als in `package.json` → `build.publish`).
3. **Geïnstalleerde apps** controleren automatisch op updates en downloaden die op de achtergrond. Na download: bij **volgende app-afsluiting** wordt geïnstalleerd (`autoInstallOnAppQuit`).

- In **development** (`npm start`) gebeurt er **geen** auto-update.
- Om updates tijdelijk uit te zetten: omgevingsvariabele `SKIP_AUTO_UPDATE=1`.

## Belangrijk: private GitHub-repo

GitHub geeft **geen** anonieme toegang aan release-metadata van een **private** repository.  
Dan werkt de standaard GitHub-feed in de app **niet** voor willekeurige eindgebruikers zonder GitHub-token.

**Oplossingen:**

- **Eigen update-URL (aanbevolen bij private repo):** host `latest.yml` + installers op een **HTTPS**-pad waar iedereen mag lezen (bijv. je eigen server, S3/R2, of een map op `huistechneut.nl`).  
  Start de app met:
  ```bash
  export UPDATE_BASE_URL="https://voorbeeld.nl/shift-happens-updates"
  ```
  Zet die URL vast in je **systemd** (Pi) of **LaunchAgent** (Mac) of Windows-omgeving.

- **Handmatig:** blijf installers mailen/Teams; zet `SKIP_AUTO_UPDATE=1` als je geen auto-update wilt.

## Wat je op GitHub Release zet

Per release minimaal de gegenereerde bestanden uit `dist/` voor elk platform, **inclusief** de `*.yml` / `latest*.yml` bestanden die electron-builder maakt (nodig voor de updater).

Voorbeeld (namen kunnen iets verschillen):

- Windows: `Shift Happens Setup x.y.z.exe`, `latest.yml`, blockmaps
- macOS: `Shift Happens-x.y.z-arm64.dmg` / `.zip`, `latest-mac.yml` (of vergelijkbaar)
- Linux: `Shift Happens-x.y.z-arm64.AppImage`, `latest-linux.yml`

Gebruik bij voorkeur:

```bash
gh release create v1.5.7 ./dist/* --title "v1.5.7" --notes "..."
```

(Pas pad/pattern aan zodat je geen onnodige oude builds meeneemt.)

## Handmatig “nu checken” (IPC)

De renderer kan `window.electronAPI.checkForUpdates()` aanroepen (bijv. knop in Instellingen); dat is optioneel voor een toekomstige UI.


## Mac: download + installeren in één keer (terminal)

Script in de repo (vereist `gh` + login met repo-toegang):

```bash
cd /pad/naar/theater-dashboard
./scripts/install-mac-from-github.sh        # nieuwste release
./scripts/install-mac-from-github.sh v1.5.6   # vaste tag
```

Andere repo:

```bash
REPO=jouw-org/jouw-repo ./scripts/install-mac-from-github.sh v1.5.6
```

Dit downloadt `*arm64.dmg`, mount de schijf, kopieert `Shift Happens.app` naar `/Applications` en unmount weer.

**Let op:** zonder GitHub-release (assets) faalt de download — eerst `gh release create` met DMG.

## “Latest” zoals bij Docker

Bij Docker wijst de tag `:latest` naar de nieuwste image. Bij **GitHub Releases** is het equivalent:

| Docker | GitHub Releases |
|--------|-----------------|
| `image:latest` | De **nieuwste release** (geen tag in `gh release download` = latest) |
| Vaste image-naam | Optioneel: een **vaste asset-naam** op elke release, zodat de URL stabiel blijft |

### Stabiele download-URL (aanbevolen voor scripts zonder `gh`)

Als je bij **elke** release **een extra bestand** uploadt met **altijd dezelfde naam**, bijvoorbeeld:

`Shift-Happens-mac-arm64.dmg`

…dan blijft deze URL voor eindgebruikers gelijk (alleen de inhoud wisselt per release):

```text
https://github.com/OWNER/REPO/releases/latest/download/Shift-Happens-mac-arm64.dmg
```

*(Spaties in bestandsnamen liever vermijden; gebruik koppeltekens.)*

Upload na elke build bijvoorbeeld:

```bash
cp "dist/Shift Happens-1.5.6-arm64.dmg" "/tmp/Shift-Happens-mac-arm64.dmg"
gh release upload v1.5.6 "/tmp/Shift-Happens-mac-arm64.dmg" --repo Deurklink-WT/theater-dashboard --clobber
```

Install-script met vaste naam:

```bash
STABLE_DMG_NAME="Shift-Happens-mac-arm64.dmg" ./scripts/install-mac-from-github.sh
```

**Private repo:** anonieme `curl` naar die URL werkt niet; gebruik `gh` (ingelogd) of een token — het install-script gebruikt `gh` en volgt daarmee hetzelfde “latest”-gedrag.

## Token in de app “inbakken” (build-time, bijv. v1.5.6)

**Niet** in git: geen token in broncode committen.

Wel kun je bij het **bouwen** van de installer een token uit de omgeving laten wegschrijven naar een gegenereerd bestand dat **wel** in de `.dmg` / `.exe` zit:

```bash
export GH_TOKEN=ghp_xxx_readonly
npm run build:mac
```

(`GITHUB_TOKEN` mag ook.) Script: `scripts/inject-update-token.js` → `src/generated/update-token.js` (staat in `.gitignore`).

**Risico:** iedereen met de installer kan de token uit het pakket proberen te halen. Gebruik een **fine-grained** PAT met zo min mogelijk rechten, of liever **`UPDATE_BASE_URL`** naar een publieke HTTPS-map zonder GitHub-token in de app.

