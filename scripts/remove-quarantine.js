#!/usr/bin/env node

/**
 * Script om quarantaine attributen te verwijderen van de gebouwde app
 * Dit voorkomt de "beschadigd" melding bij macOS Gatekeeper
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, '..', 'dist');

// Verwijder quarantaine van alle .app bestanden in dist
function removeQuarantine() {
  console.log('🔍 Zoeken naar .app bestanden in dist...');
  
  const macPath = path.join(distPath, 'mac');
  const macArm64Path = path.join(distPath, 'mac-arm64');
  
  const appPaths = [];
  
  // Zoek in mac folder
  if (fs.existsSync(macPath)) {
    const files = fs.readdirSync(macPath);
    files.forEach(file => {
      if (file.endsWith('.app')) {
        appPaths.push(path.join(macPath, file));
      }
    });
  }
  
  // Zoek in mac-arm64 folder
  if (fs.existsSync(macArm64Path)) {
    const files = fs.readdirSync(macArm64Path);
    files.forEach(file => {
      if (file.endsWith('.app')) {
        appPaths.push(path.join(macArm64Path, file));
      }
    });
  }
  
  if (appPaths.length === 0) {
    console.log('⚠️  Geen .app bestanden gevonden in dist folder');
    return;
  }
  
  console.log(`📦 ${appPaths.length} app(s) gevonden`);
  
  appPaths.forEach(appPath => {
    try {
      console.log(`🧹 Verwijderen quarantaine van: ${path.basename(appPath)}`);
      execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
      console.log(`✅ Quarantaine verwijderd van ${path.basename(appPath)}`);
    } catch (error) {
      console.error(`❌ Fout bij verwijderen quarantaine van ${path.basename(appPath)}:`, error.message);
    }
  });
  
  console.log('✨ Klaar!');
}

removeQuarantine();
