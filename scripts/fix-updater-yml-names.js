#!/usr/bin/env node
/**
 * Herschrijft bestandsurls in electron-builder latest*.yml zodat ze overeenkomen
 * met de GitHub release-assetlabels die we uploaden (spaties → punten).
 *
 * Voorbeeld:
 *   "Shift Happens-1.5.93-arm64-mac.zip" → "Shift.Happens-1.5.93-arm64-mac.zip"
 *   "Shift-Happens-1.5.93-arm64-mac.zip"  → "Shift.Happens-1.5.93-arm64-mac.zip"
 */
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Gebruik: node scripts/fix-updater-yml-names.js <latest*.yml>...');
  process.exit(1);
}

function rewrite(content) {
  return content
    .replace(/(url|path):\s*Shift Happens-/g, '$1: Shift.Happens-')
    .replace(/(url|path):\s*Shift-Happens-/g, '$1: Shift.Happens-');
}

let changed = 0;
for (const file of files) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.warn(`Skip (ontbreekt): ${file}`);
    continue;
  }
  const before = fs.readFileSync(abs, 'utf8');
  const after = rewrite(before);
  if (after === before) {
    console.log(`Ongewijzigd: ${file}`);
    continue;
  }
  fs.writeFileSync(abs, after, 'utf8');
  changed += 1;
  console.log(`Herschreven: ${file}`);
}

console.log(`[fix-updater-yml-names] klaar (${changed} bestand(en) aangepast)`);
