# Data Opslag Locatie

## Waar worden API keys en instellingen opgeslagen?

De app gebruikt `electron-store` om alle configuratie op te slaan, inclusief:
- Yesplan API keys en instellingen
- Itix API keys en instellingen
- Priva API keys en instellingen
- Gekozen zaal en datum
- Zaalvolgorde
- Event volgorde

### macOS
**Locatie:** `~/Library/Application Support/Shift Happens/config.json`

**Volledig pad:** `/Users/[jouw-gebruikersnaam]/Library/Application Support/Shift Happens/config.json`

### Windows
**Locatie:** `%APPDATA%/Shift Happens/config.json`

**Volledig pad:** `C:\Users\[jouw-gebruikersnaam]\AppData\Roaming\Shift Happens\config.json`

## Data verwijderen

### macOS
```bash
# Verwijder alle opgeslagen data
rm -rf ~/Library/Application\ Support/Shift\ Happens/

# Of alleen via Finder:
# 1. Open Finder
# 2. Druk op Cmd+Shift+G
# 3. Typ: ~/Library/Application Support/Shift Happens
# 4. Verwijder de map
```

### Windows
```cmd
# Verwijder alle opgeslagen data
rmdir /s "%APPDATA%\theater-dashboard"
```

## Waarom blijft data staan na verwijderen app?

De app data wordt opgeslagen in de gebruikersmap, niet in de app zelf. Dit betekent:
- ✅ Data blijft behouden bij app updates
- ✅ Data blijft behouden bij herinstallatie
- ✅ Data is per gebruiker (meerdere gebruikers kunnen verschillende instellingen hebben)

Als je de app volledig wilt resetten, verwijder dan de map zoals hierboven beschreven.

## Data structuur

Het `config.json` bestand bevat:
```json
{
  "yesplan": {
    "baseURL": "...",
    "apiKey": "...",
    "organizationId": "...",
    "venueId": "..."
  },
  "itix": { ... },
  "priva": { ... },
  "app": {
    "selectedVenue": "...",
    "selectedDate": "...",
    "venueOrder": [...],
    "eventOrder": { ... }
  }
}
```
