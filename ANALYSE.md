# Analyse: verbeteringen, veiligheid, opruimen

## Uitgevoerde aanpassingen

### 1. Veiligheid (XSS)
- **Yesplan event-weergave**: `event.title`, `event.performer` en `timeRange` worden nu via `this.escapeHtml()` geëscaped voordat ze in `innerHTML` komen. Hiermee is XSS via Yesplan-eventnamen/artiesten afgedekt.

### 2. Opgeruimde code
- **getSearchDateRange()** en **searchMaxDaysForward** verwijderd: zoeken gebruikt nu de volledige Yesplan-database zonder datumfilter; deze code werd niet meer gebruikt.

---

## Aanbevelingen (optioneel)

### Veiligheid
- **API-keys**: Blijven in electron-store (main); main.js gebruikt al `safeStorage` voor encryptie. Geen keys in renderer of in logs.
- **Overige innerHTML**: Op veel plekken wordt `innerHTML` gebruikt met `this.t()` (vertalingen) of escape; controleer bij grote wijzigingen of alle gebruikers- of API-data geëscaped is (bijv. Itix/Priva-kaarten).
- **api-server.js**: Wordt gebruikt voor iPhone/web; config wordt daar niet met safeStorage gedecrypt. Als de server alleen intern wordt gebruikt, is dat acceptabel; anders decrypt in de server toevoegen.

### Opruimen / onderhoud
- **console.log/warn/error**: Er staan ~80+ console-aanroepen in src. In productie kun je ze wrappen in `if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev'))` of ze verwijderen waar ze niet meer nodig zijn.
- **api-mobile.js**: Heeft geen `getYesplanSearch`. Als je de zoekfunctie ook in de web/iPhone-versie wilt, voeg daar `getYesplanSearch: (params) => post('/api/yesplan/search', params)` toe en implementeer route `/api/yesplan/search` in api-server.js.
- **Duplicatie**: In updateYesplanDisplay staat een lokale `escapeText`; die doet hetzelfde als `this.escapeHtml()`. Je kunt overal `this.escapeHtml()` gebruiken voor één consistente escape-functie.

### Structuur
- **app.js** is groot (~4700 regels). Overweeg op termijn te splitsen (bijv. views, API-helpers, modals) voor leesbaarheid en onderhoud.
- **Tests**: `npm run test` (Jest) staat in package.json; er zijn waarschijnlijk weinig of geen tests. Toevoegen van een paar smoke- of unittests zou regressie helpen voorkomen.

### Dependencies
- **package.json**: Geen ongebruikte dependencies gevonden. `cors` en `express` worden gebruikt door api-server; `node-cron` door main.js. Regelmatig `npm audit` draaien voor beveiligingsupdates.

---

## Samenvatting

| Categorie    | Status |
|-------------|--------|
| XSS Yesplan-titel/performer | Gefixt |
| Dode zoek-datumcode         | Verwijderd |
| API-keys / storage          | Al goed (main encryptie) |
| Console in productie        | Optioneel aanpakken |
| api-mobile zoek             | Optioneel toevoegen |
| Grootte app.js              | Optioneel refactoren |

Functionaliteit blijft gelijk; alleen veiligheid (escape) en opruimen (dode code) zijn aangepast.
