# Wijzigingen en de iPhone-app (andere agent / andere devs)

De iPhone-app **deelt bijna alles** met de desktopversie. Eén codebase voor beide.

## Wat is gedeeld

| Wat | Gebruikt door | Actie na wijziging |
|-----|----------------|--------------------|
| `src/renderer/*.html`, `*.css`, `*.js` | Electron + iPhone | Na elke wijziging: **`npx cap sync ios`** (daarna in Xcode opnieuw bouwen). |
| `src/renderer/app.js` | Beide | Geen aparte iPhone-versie; sync zoals hierboven. |
| `src/renderer/styles.css` | Beide | Idem. |
| `src/renderer/styles-ios.css` | Alleen iPhone | Alleen geladen buiten Electron. Compacte header, verborgen knoppen op iOS. |
| `src/renderer/api-mobile.js` | Alleen iPhone/web | Alleen zonder `window.electronAPI`. Vervangt IPC door fetch naar de API-server. |

## Nieuwe features in de desktopapp

### 1. Alleen UI (HTML/CSS/JS in `src/renderer`)

- Na de wijziging **`npx cap sync ios`** draaien.
- Nieuwe headerknoppen die op iPhone verborgen moeten: in **`styles-ios.css`** zetten, bijv.  
  `body.ios-app #nieuweKnop { display: none !important; }`

### 2. Nieuwe API-aanroepen (preload.js + main.js)

Het contract is **`window.electronAPI`**. Voor iPhone moet hetzelfde contract via de server bestaan:

- **`src/renderer/api-mobile.js`**: nieuwe methode toevoegen, bijv.  
  `getNieuweData: (p) => post('/api/nieuw', p)`
- **`src/server/api-server.js`**: bijbehorende route toevoegen met dezelfde logica als in `main.js`.

Dan werkt `app.js` op zowel desktop (IPC) als iPhone (fetch).

### 3. Alleen server

Geen wijziging in het iOS-project; alleen de server herstarten.

## Checklist voor andere agent / developer

- [ ] Wijzigingen in **`src/renderer`**: na merge **`npx cap sync ios`** draaien.
- [ ] Nieuwe **IPC-handlers + electronAPI-methodes**: dezelfde methodes/endpoints toevoegen in **`api-mobile.js`** en **`api-server.js`**.
- [ ] Nieuwe headerknoppen die op iPhone niet of anders moeten: in **`styles-ios.css`** afhandelen.

Zo blijven wijzigingen van een andere agent in sync met de iPhone-app.
