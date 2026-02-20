#!/usr/bin/env node

/**
 * Script om quarantaine attributen te verwijderen van apps in DMG bestanden
 * Dit voorkomt de "beschadigd" melding bij macOS Gatekeeper
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, '..', 'dist');

function fixDMGQuarantine() {
  console.log('🔍 Zoeken naar DMG bestanden...');
  
  const files = fs.readdirSync(distPath);
  const dmgFiles = files.filter(file => file.endsWith('.dmg') && !file.endsWith('.blockmap'));
  
  if (dmgFiles.length === 0) {
    console.log('⚠️  Geen DMG bestanden gevonden');
    return;
  }
  
  console.log(`📦 ${dmgFiles.length} DMG bestand(en) gevonden\n`);
  
  dmgFiles.forEach(dmgFile => {
    const dmgPath = path.join(distPath, dmgFile);
    const mountPoint = `/tmp/${path.basename(dmgFile, '.dmg')}-mount`;
    
    try {
      console.log(`📂 Mounten van ${dmgFile}...`);
      
      // Maak mount point aan
      if (fs.existsSync(mountPoint)) {
        try {
          execSync(`hdiutil detach "${mountPoint}" -force 2>/dev/null || true`, { stdio: 'ignore' });
        } catch (e) {}
        fs.rmdirSync(mountPoint);
      }
      fs.mkdirSync(mountPoint, { recursive: true });
      
      // Mount de DMG
      execSync(`hdiutil attach "${dmgPath}" -mountpoint "${mountPoint}" -quiet`, { stdio: 'inherit' });
      
      // Zoek .app bestanden in de DMG
      const appFiles = [];
      function findApps(dir) {
        const entries = fs.readdirSync(dir);
        entries.forEach(entry => {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && entry.endsWith('.app')) {
            appFiles.push(fullPath);
          } else if (stat.isDirectory()) {
            findApps(fullPath);
          }
        });
      }
      
      findApps(mountPoint);
      
      if (appFiles.length > 0) {
        console.log(`🧹 Verwijderen quarantaine van ${appFiles.length} app(s)...`);
        appFiles.forEach(appPath => {
          try {
            execSync(`xattr -cr "${appPath}"`, { stdio: 'ignore' });
            console.log(`  ✅ ${path.basename(appPath)}`);
          } catch (error) {
            console.log(`  ⚠️  ${path.basename(appPath)} (read-only, normaal in DMG)`);
          }
        });
      }
      
      // Unmount
      console.log(`📤 Unmounten van ${dmgFile}...`);
      execSync(`hdiutil detach "${mountPoint}" -quiet`, { stdio: 'inherit' });
      
      // Verwijder mount point
      try {
        fs.rmdirSync(mountPoint);
      } catch (e) {}
      
      console.log(`✅ ${dmgFile} gefixt!\n`);
      
    } catch (error) {
      console.error(`❌ Fout bij verwerken van ${dmgFile}:`, error.message);
      // Probeer te unmounten als er een fout is
      try {
        execSync(`hdiutil detach "${mountPoint}" -force 2>/dev/null || true`, { stdio: 'ignore' });
        if (fs.existsSync(mountPoint)) {
          fs.rmdirSync(mountPoint);
        }
      } catch (e) {}
    }
  });
  
  console.log('✨ Klaar!');
  console.log('\n📝 Let op: Als je de DMG downloadt, voegt macOS mogelijk nog steeds quarantaine toe.');
  console.log('   Zie INSTALLATIE_INSTRUCTIES.md voor instructies om dit op te lossen.');
}

fixDMGQuarantine();
