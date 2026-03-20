# Security-check (na jouw recente wijzigingen)

Korte controle van de veiligheidsaanpassingen en wat er nog is gedaan.

## Wat er al goed staat (jouw wijzigingen)

- **API-keys versleuteld (Electron)**  
  In `main.js`: `safeStorage` voor `apiKey`; opslag als `_apiKeyEncrypted`, bij uitlezen decrypt. Keys staan niet in platte tekst in de config op schijf waar Electron draait.

- **Externe links alleen naar allowlist (Electron)**  
  `open-external` in main controleert `isUrlAllowed()`: alleen `https://` en host in `ALLOWED_EXTERNAL_HOSTS` (yesplan.nl, wilminktheater.nl, huistechneut.nl, itix.nl, priva.nl). Anders wordt de URL geblokkeerd.

- **XSS-preventie**  
  Veel plekken gebruiken `escapeHtml` / `escapeText` bij dynamische HTML (zoektresultaten, weekoverzicht, technische opmerkingen, rider-links, print, etc.).

- **Logging**  
  In `src/lib/log.js`: geen response.body, config of apiKey in logs.

## Aanvullingen na deze check

1. **iPhone/web: openExternal ook beperkt**  
  In de mobile adapter opende `openExternal` elke URL in een nieuw tab. Er is dezelfde allowlist-logica als in Electron toegevoegd: alleen `https://` en hosts uit dezelfde lijst. Rider- en zaalplattegrond-links blijven werken; willekeurige URLs niet.

2. **Seating-plan-URL in onclick**  
  `ticketingId` uit de API werd ongeëscaped in een `onclick` gezet. Als die waarde een aanhalingsteken bevatte, kon dat de JS breken. De URL wordt nu geëscaped (o.a. `'` → `\'`, `"` → `&quot;`) voordat hij in de `onclick` komt. Beide plekken (zaalplattegrond-links) zijn aangepast.

## Aandachtspunten (geen code-aanpassing gedaan)

- **API-server (`src/server/api-server.js`)**  
  - **CORS:** `app.use(cors())` staat aan zonder beperking; elke origin mag aanroepen. Voor lokaal/netwerk vaak bewust. Voor productie: overweeg `cors({ origin: 'https://jouw-app-origin.nl' })` of een whitelist.  
  - **Geen auth:** wie de server kan bereiken, kan config lezen/schrijven en alle endpoints gebruiken. Bedoeling: server alleen op vertrouwd netwerk of achter auth (bijv. reverse proxy met basis-auth of token).  
  - **Config op schijf:** `data/config.json` is platte tekst (geen safeStorage op de server). API-keys staan daar leesbaar. Zorg dat de map `data/` en de machine goed beveiligd zijn (rechten, netwerk, backup).

- **Rider-URLs**  
  Komen van de Yesplan-API. In Electron worden ze nog steeds via `open-external` + allowlist gecontroleerd. Op iPhone doen we nu hetzelfde in de mobile adapter. Als Yesplan ooit een URL buiten de allowlist zou teruggeven, wordt die niet geopend.

## Samenvatting

Jouw wijzigingen (versleuteling API-keys, allowlist externe links, escape bij weergave) zijn consistent en goed toegepast. Er zijn twee kleine aanvullingen gedaan: allowlist voor `openExternal` op iPhone, en correct escapen van de seating-plan-URL in `onclick`. De rest is documentatie en aanbevelingen (CORS/auth/server-config) voor als je de server breder inzet.
