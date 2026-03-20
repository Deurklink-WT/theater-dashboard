# Shift Happens – iPhone-versie

Dezelfde theaterdashboard-app is beschikbaar als **iPhone-app**. De app praat niet rechtstreeks met Yesplan/Itix/Priva; daarvoor draait een kleine **API-server** (dezelfde logica als in de Electron-desktopapp). De iPhone-app is een webview die deze API gebruikt.

## Overzicht

1. **API-server** (Node.js) – draait op een machine die bereikbaar is voor je telefoon (lokaal netwerk of internet). Slaat configuratie op en praat met Yesplan, Itix, Priva.
2. **iPhone-app** (Capacitor) – toont de bestaande web-UI; alle calls gaan via `fetch` naar de API-server.

## 1. API-server starten

De server gebruikt dezelfde API-logica als de Electron-app, maar zonder Electron (geen vensters).

```bash
npm install
npm run server
```

Standaard luistert de server op **poort 3847** (`http://0.0.0.0:3847`).

- **Configuratie** wordt opgeslagen in de map `data/` in de projectroot (of in de map die je opgeeft via `SHIFT_HAPPENS_CONFIG_DIR`).
- Eerste keer configuratie:
  - **Optie A:** In de **iPhone-app** (of in de browser op `http://<server>:3847/app`) Instellingen openen en daar Yesplan/Itix/Priva invullen; de server slaat alles in `data/config.json` op.
  - **Optie B:** Configuratie overnemen van de desktopapp: kopieer `~/Library/Application Support/Shift Happens/config.json` (Mac) naar `data/config.json` in het project. De structuur is hetzelfde.

Als je de server op een andere host/poort wilt:

```bash
PORT=3000 node src/server/api-server.js
```

Voor toegang vanaf je iPhone moet de telefoon de server kunnen bereiken:

- **Lokaal netwerk:** gebruik het lokale IP van je Mac (bijv. `http://192.168.1.10:3847`).
- **Internet:** zet de server achter HTTPS (reverse proxy, bijv. nginx) en open poort 443 (of een andere veilige poort). Gebruik dan bijvoorbeeld `https://shift.jouwdomein.nl`.

## 2. API-URL instellen in de iPhone-app

In de app: **Instellingen (tandwiel)** → sectie **"API-server (iPhone)"** → vul de **Server-URL** in (bijv. `http://192.168.1.10:3847` of `https://shift.jouwdomein.nl`) → **Opslaan**.

Daarna haalt de app alle data via deze server op.

## 3. iOS-project bouwen (Xcode)

Vereisten:

- **macOS** met **Xcode** (bijv. 14+)
- **Node.js** (zoals al gebruikt voor de desktopapp)

Stappen:

```bash
# Eenmalig: Capacitor en iOS-platform toevoegen (staat al in package.json)
npm install

# iOS-project aanmaken/ bijwerken
npx cap add ios
# of als ios al bestaat:
npx cap sync ios

# Xcode openen
npx cap open ios
```

In Xcode:

- Kies je **Team** (Apple ID) onder Signing & Capabilities.
- Kies een **simulator** of een **echte iPhone** en druk op Run (▶).

De app laadt de web-ui uit `src/renderer`; er is geen aparte “build” van de web-app nodig.

## 4. Handige npm-scripts

- `npm run server` – start de API-server (poort 3847).
- `npm run cap:sync` – sync Capacitor (webDir → ios).
- `npm run cap:ios` – sync + Xcode openen.

Na wijzigingen in `src/renderer` (HTML/CSS/JS):

```bash
npx cap sync ios
```

Daarna in Xcode opnieuw bouwen/draaien.

**Wijzigingen door andere agent of devs:** zie [docs/IPHONE-WIJZIGINGEN.md](docs/IPHONE-WIJZIGINGEN.md) voor hoe je de iPhone-app in sync houdt (gedeelde renderer, sync-stap, API-contract).

## 5. Beveiliging (productie)

- Gebruik **HTTPS** voor de API-server zodra die vanaf internet bereikbaar is.
- Zet de server achter een **reverse proxy** (nginx/Apache) en eventueel **authenticatie** (bijv. basis-auth of token) als je dat wilt.
- API-keys (Yesplan, Itix, etc.) staan in `data/config.json` op de server; beveilig die map en de machine waarop de server draait.

## 6. Samenvatting

| Onderdeel        | Rol |
|------------------|-----|
| **API-server**   | Draait op een computer, praat met Yesplan/Itix/Priva, slaat config op in `data/`. |
| **iPhone-app**   | Toont dezelfde UI als de desktopapp; alle requests gaan naar de ingestelde API-URL. |
| **Instellingen → API-server (iPhone)** | Hier zet je de URL van de server (lokaal IP of https-URL). |

Als je de server-URL eenmaal hebt ingesteld en de server draait, werkt de iPhone-app hetzelfde als de desktopversie (zelfde schermen, zalen, filters, thema’s).
