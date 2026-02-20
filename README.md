# Theater Dashboard - Huistechneut

Een cross-platform desktop applicatie voor het monitoren van theater systemen, gebouwd met Electron.

## Overzicht

Dit dashboard integreert data uit vier verschillende systemen:
- **Yesplan** - Event planning en evenementenbeheer
- **Uurwerk** - Personeelsplanning en roosters
- **Itix** - Kaartverkoop en ticketing
- **Priva** - Luchtbehandeling en klimaatbeheer

## Functies

- 🎭 Real-time dashboard met data uit alle systemen
- ⚙️ Instellingen scherm voor API configuratie
- 🔄 Automatische data vernieuwing elke 5 minuten
- 📊 Data visualisatie en statistieken
- 🖥️ Cross-platform (macOS en Windows)
- 🔒 Veilige API key opslag

## Installatie

### Vereisten
- Node.js 16+ 
- npm of yarn

### Setup
```bash
# Clone het project
git clone <repository-url>
cd theater-dashboard

# Installeer dependencies
npm install

# Start de applicatie in development mode
npm run dev

# Of start de productie versie
npm start
```

## Build

### macOS
```bash
npm run build:mac
```

### Windows
```bash
npm run build:win
```

### Beide platformen
```bash
npm run build
```

### TestFlight Distributie

Voor het distribueren via TestFlight:

1. **Bouw voor TestFlight:**
```bash
npm run build:testflight
```

2. **Upload instructies bekijken:**
```bash
npm run upload:testflight
```

Zie [BUILD.md](BUILD.md) voor gedetailleerde instructies over code signing, notarization en upload naar TestFlight.

**Vereisten:**
- Apple Developer Account ($99/jaar)
- Code signing certificaat
- App geregistreerd in App Store Connect

## Configuratie

### API Instellingen

Open het instellingen scherm via de knop in de header om de API endpoints en keys te configureren:

#### Yesplan
- **Base URL**: API endpoint voor Yesplan
- **API Key**: Authenticatie token
- **Organisatie ID**: Unieke organisatie identifier

#### Uurwerk
- **Base URL**: API endpoint voor Uurwerk
- **API Key**: Authenticatie token
- **Bedrijf ID**: Unieke bedrijf identifier

#### Itix
- **Base URL**: API endpoint voor Itix
- **API Key**: Authenticatie token
- **Locatie ID**: Unieke locatie identifier

#### Priva
- **Base URL**: API endpoint voor Priva
- **API Key**: Authenticatie token
- **Systeem ID**: Unieke systeem identifier

### Test Verbinding

Elke API configuratie heeft een "Test Verbinding" knop om te controleren of de instellingen correct zijn.

## Gebruik

### Dashboard
Het hoofdscherm toont vier kaarten met data uit elk systeem:
- **Yesplan**: Evenementen, omzet en ticket verkoop
- **Uurwerk**: Personeelsplanning, diensten en uren
- **Itix**: Kaartverkoop, transacties en omzet
- **Priva**: Klimaatdata, temperatuur en luchtkwaliteit

### Status Indicatoren
- 🟢 **Online**: Systeem is verbonden en data wordt geladen
- 🔴 **Offline**: Systeem is niet bereikbaar
- 🟡 **Waarschuwing**: Systeem heeft problemen

### Auto-refresh
- Data wordt automatisch vernieuwd elke 5 minuten
- Handmatige refresh via de "Vernieuwen" knop
- Real-time updates via IPC communicatie

## Technische Details

### Architectuur
- **Electron**: Cross-platform desktop framework
- **Node.js**: Backend API integraties
- **Vanilla JavaScript**: Frontend zonder frameworks
- **CSS Grid/Flexbox**: Responsive layout
- **IPC**: Veilige communicatie tussen processen

### Bestandsstructuur
```
src/
├── main.js              # Electron hoofdproces
├── preload.js           # Veilige API blootstelling
├── api/                 # API integraties
│   ├── yesplan.js
│   ├── uurwerk.js
│   ├── itix.js
│   └── priva.js
└── renderer/            # Frontend
    ├── index.html
    ├── styles.css
    └── app.js
```

### Security
- Context isolation enabled
- Node integration disabled in renderer
- API keys opgeslagen in electron-store
- IPC communicatie voor veilige data overdracht

## Ontwikkeling

### Development Mode
```bash
npm run dev
```
Start de app met DevTools open voor debugging.

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Veelvoorkomende Problemen

1. **API verbinding faalt**
   - Controleer API endpoints en keys
   - Test verbinding via instellingen scherm
   - Controleer netwerk connectiviteit

2. **Data wordt niet geladen**
   - Controleer console voor errors
   - Verifieer API permissions
   - Controleer datum ranges

3. **App start niet**
   - Controleer Node.js versie (16+)
   - Herinstalleer dependencies: `npm install`
   - Controleer systeem requirements

### Logs
Logs worden weggeschreven naar:
- **macOS**: `~/Library/Logs/theater-dashboard/`
- **Windows**: `%APPDATA%/theater-dashboard/logs/`

## Licentie

MIT License - Zie LICENSE bestand voor details.

## Support

Voor vragen of problemen, neem contact op met het Huistechneut team.

