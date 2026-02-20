# Build Instructies

## Mac Installer (DMG) maken

### Vereisten
- Node.js en npm geïnstalleerd
- macOS (voor het bouwen van Mac installers)

### Stappen

1. Installeer dependencies:
```bash
npm install
```

2. Bouw de Mac installer:
```bash
npm run build:mac
```

De DMG file wordt gegenereerd in de `dist/` map.

### Optionele configuratie

- **Icon**: Plaats een `icon.icns` bestand in `build/icon.icns` voor een custom app icon
- **DMG achtergrond**: Plaats een `dmg-background.png` bestand in `build/dmg-background.png` voor een custom DMG achtergrond

### Notities

- De app werkt zonder Yesplan API key - gebruikers kunnen deze later configureren in de instellingen
- De installer bevat alle benodigde dependencies
- De app is geconfigureerd voor zowel Intel (x64) als Apple Silicon (arm64) Macs

## TestFlight Distributie

### Vereisten voor TestFlight

- **Apple Developer Account** ($99/jaar) - vereist voor code signing en notarization
- **Code Signing Certificaat** - download via Xcode of Apple Developer portal
- **App Store Connect** - app moet geregistreerd zijn in App Store Connect
- **Notarization** - app moet genotariseerd zijn door Apple

### Stappen

#### 1. Code Signing Setup

Voeg je Apple Developer certificaat toe aan je keychain:

```bash
# Importeer certificaat (vervang met jouw certificaat pad)
security import YourCertificate.p12 -k ~/Library/Keychains/login.keychain
```

Configureer code signing in `package.json` of via environment variabelen:

```bash
# Via environment variabelen (aanbevolen)
export APPLE_ID="jouw@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAM123456"
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"
```

Of voeg toe aan `package.json` build configuratie:
```json
"mac": {
  "identity": "Developer ID Application: Jouw Naam (TEAM123456)"
}
```

#### 2. Bouw voor TestFlight

Bouw de app als zip bestand voor TestFlight:

```bash
npm run build:testflight
```

Dit genereert een `.zip` bestand in de `dist/` map met de naam `Shift Happens-{version}-mac.zip`.

#### 3. Notarization (Vereist)

De app moet genotariseerd zijn voordat deze naar TestFlight kan:

```bash
# Notarize de app
xcrun notarytool submit "dist/Shift Happens-{version}-mac.zip" \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --wait
```

#### 4. Upload naar TestFlight

Er zijn verschillende manieren om te uploaden:

**Optie A: Via Transporter App (Aanbevolen)**
1. Download "Transporter" uit de Mac App Store
2. Open Transporter
3. Sleep het zip bestand naar Transporter
4. Log in met je Apple ID
5. Klik op "Deliver"

**Optie B: Via Xcode**
1. Open Xcode
2. Ga naar Window > Organizer
3. Klik op "Distribute App"
4. Selecteer "App Store Connect"
5. Upload het zip bestand

**Optie C: Via Command Line (geavanceerd)**
```bash
npm run upload:testflight
```

Dit script toont alle beschikbare upload opties.

#### 5. App Store Connect Configuratie

1. Log in op [App Store Connect](https://appstoreconnect.apple.com)
2. Ga naar "My Apps"
3. Selecteer of maak je app aan
4. Ga naar "TestFlight" tab
5. Wacht tot de build verwerkt is (kan 10-30 minuten duren)
6. Voeg testers toe en stuur uitnodigingen

### Belangrijke Notities

- **Code Signing**: De app MOET ondertekend zijn met een geldig Apple Developer certificaat
- **Notarization**: Vereist voor alle macOS apps die buiten de Mac App Store worden gedistribueerd
- **Processing Time**: Na upload kan het 10-30 minuten duren voordat de build beschikbaar is in TestFlight
- **Version Numbers**: Elke upload moet een uniek build nummer hebben (versie + build nummer)
- **Entitlements**: Controleer `build/entitlements.mac.plist` voor benodigde permissions

### Troubleshooting

**Code Signing Errors:**
```bash
# Controleer beschikbare certificaten
security find-identity -v -p codesigning

# Verifieer code signing
codesign -dv --verbose=4 "dist/mac/Shift Happens.app"
```

**Notarization Errors:**
- Controleer dat alle binaries ondertekend zijn
- Zorg dat hardened runtime is ingeschakeld
- Controleer entitlements bestand

**Upload Errors:**
- Controleer internet verbinding
- Verifieer Apple ID credentials
- Zorg dat app geregistreerd is in App Store Connect
