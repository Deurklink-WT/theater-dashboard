#!/usr/bin/env node

/**
 * Script om de app naar TestFlight te uploaden
 * 
 * Vereisten:
 * - Apple Developer account
 * - App Store Connect API key of Apple ID credentials
 * - De app moet gebouwd zijn met: npm run build:testflight
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const appName = packageJson.build.productName;
const version = packageJson.version;
const appId = packageJson.build.appId;

// Zoek het zip bestand
const distDir = path.join(__dirname, '..', 'dist');
const zipFiles = fs.readdirSync(distDir).filter(file => 
  file.endsWith('.zip') && file.includes(appName)
);

if (zipFiles.length === 0) {
  console.error('❌ Geen zip bestand gevonden in dist/');
  console.error('   Bouw eerst de app met: npm run build:testflight');
  process.exit(1);
}

const zipFile = path.join(distDir, zipFiles[0]);
console.log(`📦 Gevonden zip bestand: ${zipFiles[0]}`);

// Controleer of de app code-signed is
console.log('\n🔍 Controleren code signing...');
try {
  const codesignCheck = execSync(`codesign -dv --verbose=4 "${zipFile}" 2>&1 || true`, { encoding: 'utf8' });
  if (!codesignCheck.includes('Authority=')) {
    console.warn('⚠️  Waarschuwing: App lijkt niet code-signed te zijn');
    console.warn('   Voor TestFlight moet de app ondertekend zijn met een Apple Developer certificaat');
  }
} catch (error) {
  console.warn('⚠️  Kon code signing niet verifiëren');
}

// Upload opties
console.log('\n📤 Upload opties:');
console.log('1. Via Xcode (aanbevolen voor eerste keer)');
console.log('2. Via altool (command line)');
console.log('3. Via Transporter app (GUI)');
console.log('\n');

// Optie 1: Xcode instructies
console.log('📱 Optie 1: Via Xcode');
console.log('   1. Open Xcode');
console.log('   2. Ga naar Window > Organizer');
console.log('   3. Klik op "Distribute App"');
console.log('   4. Selecteer "App Store Connect"');
console.log('   5. Upload het zip bestand of de .app uit de zip');
console.log('\n');

// Optie 2: altool (deprecated maar nog werkend)
console.log('💻 Optie 2: Via altool (command line)');
console.log('   Let op: altool is deprecated, gebruik optie 3 of 4');
console.log(`   xcrun altool --upload-app --type macos --file "${zipFile}" --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID`);
console.log('\n');

// Optie 3: Transporter
console.log('📦 Optie 3: Via Transporter app');
console.log('   1. Download Transporter app uit de Mac App Store');
console.log('   2. Open Transporter');
console.log(`   3. Sleep het zip bestand: ${zipFile}`);
console.log('   4. Log in met je Apple ID');
console.log('   5. Klik op "Deliver"');
console.log('\n');

// Optie 4: xcrun notarytool (voor notarization, vereist voor TestFlight)
console.log('🔐 Optie 4: Notarization (vereist voor TestFlight)');
console.log('   De app moet genotariseerd zijn voordat deze naar TestFlight kan:');
console.log(`   xcrun notarytool submit "${zipFile}" --apple-id YOUR_APPLE_ID --team-id YOUR_TEAM_ID --password YOUR_APP_SPECIFIC_PASSWORD --wait`);
console.log('\n');

// App Store Connect API optie
console.log('🔑 Optie 5: Via App Store Connect API (geavanceerd)');
console.log('   Voor geautomatiseerde uploads kun je de App Store Connect API gebruiken.');
console.log('   Zie: https://developer.apple.com/documentation/appstoreconnectapi');
console.log('\n');

console.log('📝 Belangrijke notities:');
console.log(`   - App ID: ${appId}`);
console.log(`   - Versie: ${version}`);
console.log(`   - Zip bestand: ${zipFile}`);
console.log('   - Zorg dat je een Apple Developer account hebt ($99/jaar)');
console.log('   - De app moet code-signed zijn met een Developer certificaat');
console.log('   - De app moet genotariseerd zijn door Apple');
console.log('   - TestFlight werkt alleen voor Mac Catalyst apps of native macOS apps');
console.log('   - Electron apps kunnen naar TestFlight, maar moeten correct geconfigureerd zijn');
console.log('\n');

console.log('✅ Klaar! Kies een van de bovenstaande opties om te uploaden.');
