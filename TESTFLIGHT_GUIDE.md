# TestFlight Upload Gids

## Vereisten Checklist

Voordat je begint, zorg dat je hebt:
- [ ] Apple Developer Account ($99/jaar) - [Aanmelden](https://developer.apple.com/programs/)
- [ ] App geregistreerd in App Store Connect
- [ ] Code signing certificaat (download via Xcode of Developer portal)
- [ ] App-specific password voor notarization

## Stap 1: App registreren in App Store Connect

1. Ga naar [App Store Connect](https://appstoreconnect.apple.com)
2. Log in met je Apple Developer account
3. Klik op "My Apps"
4. Klik op "+" om een nieuwe app aan te maken
5. Vul in:
   - **Platform**: macOS
   - **Name**: Shift Happens (of jouw gewenste naam)
   - **Primary Language**: Nederlands
   - **Bundle ID**: `com.huistechneut.shift-happens` (moet overeenkomen met package.json)
   - **SKU**: Unieke identifier (bijv. `shift-happens-001`)
6. Klik "Create"

## Stap 2: Code Signing Certificaat ophalen

### Optie A: Via Xcode (Aanbevolen)
1. Open Xcode
2. Ga naar Xcode > Settings (of Preferences) > Accounts
3. Voeg je Apple ID toe
4. Selecteer je team
5. Klik op "Manage Certificates"
6. Klik op "+" en kies "Developer ID Application"
7. Het certificaat wordt automatisch toegevoegd aan je keychain

### Optie B: Via Apple Developer Portal
1. Ga naar [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Klik op "+" om een nieuw certificaat aan te maken
3. Selecteer "Developer ID Application"
4. Volg de instructies om het certificaat te downloaden en installeren

## Stap 3: App-specific Password aanmaken

1. Ga naar [appleid.apple.com](https://appleid.apple.com)
2. Log in met je Apple ID
3. Ga naar "Security" sectie
4. Onder "App-Specific Passwords", klik op "Generate Password"
5. Geef het een naam (bijv. "TestFlight Notarization")
6. Kopieer het wachtwoord (je ziet het maar één keer!)

## Stap 4: Code Signing configureren

### Optie A: Via Environment Variabelen (Aanbevolen)

Maak een `.env` bestand in de root van het project (niet committen!):

```bash
# .env bestand
APPLE_ID="jouw@email.com"
APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
APPLE_TEAM_ID="TEAM123456"
CSC_LINK="path/to/certificate.p12"  # Optioneel als je een .p12 bestand hebt
CSC_KEY_PASSWORD="certificate_password"  # Alleen nodig als je .p12 gebruikt
```

Of exporteer direct in de terminal:

```bash
export APPLE_ID="jouw@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAM123456"
```

### Optie B: Via package.json

Als je certificaat al in je keychain staat, kun je de identity specificeren:

```json
"mac": {
  "identity": "Developer ID Application: Jouw Naam (TEAM123456)"
}
```

**Let op**: Vervang "Jouw Naam" en "TEAM123456" met je eigen gegevens.

## Stap 5: Bouw de app voor TestFlight

```bash
npm run build:testflight
```

Dit genereert een `.zip` bestand in de `dist/` map.

**Belangrijk**: De app wordt automatisch code-signed tijdens het build proces als je certificaat in je keychain staat.

## Stap 6: Notarization (Vereist)

De app MOET genotariseerd zijn voordat deze naar TestFlight kan:

```bash
# Vervang {version} met je versie nummer (bijv. 0.9.0)
xcrun notarytool submit "dist/Shift Happens-0.9.0-mac.zip" \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --wait
```

**Let op**: 
- Vervang `0.9.0` met je daadwerkelijke versie nummer
- De `--wait` flag zorgt dat het commando wacht tot notarization klaar is (kan 5-15 minuten duren)

Als notarization succesvol is, zie je:
```
Successfully received submission ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Stap 7: Upload naar TestFlight

### Optie A: Via Transporter App (Aanbevolen - Meest Eenvoudig)

1. Download "Transporter" uit de Mac App Store (gratis)
2. Open Transporter
3. Sleep het `.zip` bestand uit `dist/` naar Transporter
4. Log in met je Apple ID (gebruik je normale Apple ID wachtwoord, niet app-specific)
5. Klik op "Deliver"
6. Wacht tot upload klaar is

### Optie B: Via Xcode Organizer

1. Open Xcode
2. Ga naar Window > Organizer (of Cmd+Shift+O, typ "Organizer")
3. Klik op "Distribute App"
4. Selecteer het `.zip` bestand
5. Kies "App Store Connect"
6. Volg de wizard
7. Upload het bestand

### Optie C: Via Command Line (Geavanceerd)

```bash
# Gebruik altool (deprecated maar nog werkend)
xcrun altool --upload-app \
  --type macos \
  --file "dist/Shift Happens-0.9.0-mac.zip" \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

**Let op**: Voor command line upload heb je een App Store Connect API key nodig.

## Stap 8: Wacht op Processing

1. Ga naar [App Store Connect](https://appstoreconnect.apple.com)
2. Ga naar je app > TestFlight tab
3. Wacht tot de build verschijnt (kan 10-30 minuten duren)
4. Status zal eerst "Processing" zijn, daarna "Ready to Test"

## Stap 9: Voeg Testers toe

### Interne Testers (Teamleden)
1. Ga naar TestFlight > Internal Testing
2. Klik op "+" om testers toe te voegen
3. Selecteer teamleden uit je Apple Developer team

### Externe Testers
1. Ga naar TestFlight > External Testing
2. Klik op "+" om een testgroep aan te maken
3. Voeg email adressen toe
4. Stuur uitnodigingen

## Troubleshooting

### Code Signing Errors

**Probleem**: "No identity found"
**Oplossing**: 
```bash
# Controleer beschikbare certificaten
security find-identity -v -p codesigning

# Zorg dat je certificaat in de keychain staat
```

**Probleem**: "Certificate not trusted"
**Oplossing**: 
- Open Keychain Access
- Zoek je certificaat
- Rechts-klik > Get Info
- Expand "Trust" sectie
- Zet "When using this certificate" op "Always Trust"

### Notarization Errors

**Probleem**: "Invalid signature"
**Oplossing**: 
- Zorg dat de app correct is code-signed
- Controleer met: `codesign -dv --verbose=4 "dist/mac/Shift Happens.app"`

**Probleem**: "Notarization failed"
**Oplossing**: 
- Check de notarization log:
```bash
xcrun notarytool log <submission-id> \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD"
```

### Upload Errors

**Probleem**: "Invalid bundle"
**Oplossing**: 
- Zorg dat de Bundle ID overeenkomt met App Store Connect
- Check `package.json` > `build.appId`

**Probleem**: "Version already exists"
**Oplossing**: 
- Verhoog het versie nummer in `package.json`
- Rebuild de app

## Snelle Referentie Commando's

```bash
# 1. Build voor TestFlight
npm run build:testflight

# 2. Notarize
xcrun notarytool submit "dist/Shift Happens-0.9.0-mac.zip" \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --wait

# 3. Upload via Transporter (GUI) of Xcode Organizer
```

## Belangrijke Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com/account)
- [Transporter App](https://apps.apple.com/app/transporter/id1450874784)

## Tips

1. **Test eerst lokaal**: Test de app altijd eerst lokaal voordat je naar TestFlight upload
2. **Version nummers**: Gebruik semver (bijv. 0.9.0, 0.9.1, etc.)
3. **Build nummers**: Elke upload moet een uniek build nummer hebben
4. **Processing tijd**: Plan tijd in voor processing (10-30 minuten)
5. **Notarization**: Kan 5-15 minuten duren, wees geduldig

## Hulp Nodig?

Als je problemen hebt:
1. Check de BUILD.md voor meer details
2. Check Apple Developer documentatie
3. Controleer de logs voor specifieke error messages
