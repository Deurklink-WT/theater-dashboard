# Shift Happens 1.5.4 – iPhone uitbrengen

Versie **1.5.4** staat klaar voor uitbrengen op iPhone (TestFlight of App Store).

## Versiegegevens

- **Marketingversie:** 1.5.4 (zichtbaar voor gebruikers)
- **Buildnummer:** 154 (CURRENT_PROJECT_VERSION in Xcode; verhoog bij elke nieuwe upload)
- **Bundle ID:** com.huistechneut.shifthappens

## Stappen om uit te brengen

### 1. Alles syncen en Xcode openen

```bash
npm run cap:ios
```

(of: `npx cap sync ios` en daarna handmatig `ios/App/App.xcworkspace` openen in Xcode)

### 2. In Xcode

- **Team:** Kies je Apple Developer Team (Signing & Capabilities).
- **Device:** Kies "Any iOS Device (arm64)" of een echte iPhone voor archive.
- **Menu:** Product → Archive.

### 3. Na het archiven

- Window → Organizer opent zich (of Product → Organizer).
- Selecteer het nieuwste archive.
- Klik **Distribute App**.
- Kies **App Store Connect** → Next.
- Kies **Upload** → Next.
- Opties: automatisch tekenen, inclusief bitcode uit (standaard) → Next.
- Bevestig en wacht op de upload.

### 4. App Store Connect

- Ga naar [App Store Connect](https://appstoreconnect.apple.com).
- **Mijn apps** → **Shift Happens** (of maak de app aan als die nog niet bestaat; platform **iOS**, Bundle ID `com.huistechneut.shifthappens`).
- Tab **TestFlight** of **App Store**:
  - **TestFlight:** Na verwerking (enkele minuten) kun je interne/externe testers toevoegen.
  - **App Store:** Maak een nieuwe versie 1.5.4 aan en koppel de geüploade build; vul metadata in en dien in voor beoordeling.

### 5. Volgende release (bijv. 1.5.5)

- Verhoog in `package.json` de `version`.
- In `ios/App/App.xcodeproj/project.pbxproj`: zet **MARKETING_VERSION** op de nieuwe versie en **CURRENT_PROJECT_VERSION** op een hoger getal dan 154 (bijv. 155).
- Daarna opnieuw Archive en Upload.

## Als `npx cap sync ios` faalt (pod install / Xcode-plugin)

Als je een fout ziet over een Xcode-plug-in (bijv. IDESimulatorFoundation):

- Voer eenmalig uit: `xcodebuild -runFirstLaunch` (of herinstalleer/update Xcode).
- Of ga in de terminal naar de iOS-map en voer daar `pod install` handmatig uit:
  ```bash
  cd ios/App && pod install
  ```
- Daarna in Xcode het workspace openen en bouwen.

De web-assets (HTML/CSS/JS) zijn al gekopieerd naar `ios/App/App/public`; alleen de Pods-stap kan op jouw Mac fout geven tot Xcode weer goed laadt.

## Vereisten

- Apple Developer-account ($99/jaar).
- App aangemaakt in App Store Connect met Bundle ID `com.huistechneut.shifthappens`.
- Xcode met ingelogde Apple ID en juist team geselecteerd.

## API-server (voor gebruikers)

Gebruikers moeten de API-server bereikbaar hebben (lokaal netwerk of internet). Zie **IPHONE.md** voor uitleg over server-URL instellen in de app.
