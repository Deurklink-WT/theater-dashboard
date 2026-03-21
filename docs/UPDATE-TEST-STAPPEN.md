# Updates testen — stap voor stap

Gebruik dit samen met `docs/UPDATES.md` (technische achtergrond).

## Wat je al in de app hebt (na deze repo-wijziging)

- **Header:** een **update-banner** verschijnt bij controle / download / klaar (alleen geïnstalleerde desktop-app).
- **Instellingen → Updates (desktop):** knop **Nu controleren op updates** + kort resultaat (alleen Electron).

---

## Fase A — Alleen controleren of de knop werkt (lokaal)

1. Start de app zoals normaal: `npm start` of `npm run dev`.
2. Open **Instellingen** (tandwiel).
3. Scroll naar **Updates (desktop)**.
4. Klik **Nu controleren op updates**.

**Verwacht:** tekst in de trant van *In ontwikkelingssmodus is er geen update-check* — dat is **goed**: de updater draait alleen in een **geïnstalleerde** build.

---

## Fase B — Echte update-test (geïnstalleerde app)

### Stap 1 — Oude versie installeren

1. Installeer een **bestaande** release (bijv. v1.5.6) vanaf GitHub of uit je `dist/`-map.

### Stap 2 — Nieuwe versie bouwen en publiceren

1. Zet in `package.json` een **hogere** versie (bijv. `1.5.7`).
2. Bouw voor jouw platform: `npm run build:mac` (of `build:win` / `build:pi`).
3. Maak een **GitHub Release** met de bestanden uit `dist/`, inclusief de `latest*.yml`-bestanden.  
   Zie `docs/UPDATES.md` voor `gh release create` en private-repo/token.

### Stap 3 — Token of update-URL (private repo)

- Zet `GH_TOKEN` / `GITHUB_TOKEN` op de machine, **of** gebruik `UPDATE_BASE_URL` naar een publieke map, **of** bouw met geïnjecteerde token (`GH_TOKEN=... npm run build:mac`).

### Stap 4 — In de geïnstalleerde (oude) app

1. Start de **oude** geïnstalleerde app.
2. Wacht **~8 seconden** (eerste automatische check) **of** ga naar **Instellingen → Nu controleren op updates**.
3. Let op de **banner** bovenin: download → *Herstart om te installeren*.
4. **Sluit de app** om te installeren (of gebruik de banner-klep als die op *downloaded* staat en klik om te herstarten — zie gedrag van `quitAndInstall`).

### Stap 5 — Verifiëren

1. Start de app opnieuw.
2. Controleer **Over deze app** / versie in de footer: moet **1.5.7** (of je nieuwe versie) zijn.

---

## Snelle troubleshooting

| Symptoom | Actie |
|----------|--------|
| Geen banner, geen melding | Private repo zonder token → zie `docs/UPDATES.md`; of `SKIP_AUTO_UPDATE=1` gezet. |
| `npm start` doet niets | Normaal — test met geïnstalleerde app. |
| Geen nieuwere versie gevonden | Release-tag / `latest.yml` / asset-namen controleren; versie in `package.json` moet **hoger** zijn dan geïnstalleerd. |

---

## Jouw stappen (samenvatting)

| # | Wie | Actie |
|---|-----|--------|
| 1 | Jij | Fase A: knop in dev — bevestigen dat “geen update in dev” klopt. |
| 2 | Jij | Fase B: oude build installeren + nieuwe release publiceren. |
| 3 | Jij | Token/URL regelen voor private GitHub. |
| 4 | Jij | In oude app: controleren + herstarten na download. |

Code in de repo regelt banner + instellingenknop; **jij** voert de release en installatie uit.
