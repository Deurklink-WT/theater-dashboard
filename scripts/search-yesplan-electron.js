const { app, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function decryptIfEncrypted(encrypted, plain) {
  if (plain) return plain;
  if (!encrypted) return '';
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    }
  } catch (e) {
    console.log('Decrypt fout:', e.message);
  }
  return '';
}

function loadYesplanConfig() {
  const configDir = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : (process.env.APPDATA || os.homedir());
  const candidates = [
    path.join(configDir, 'Shift Happens', 'config.json'),
    path.join(configDir, 'theater-dashboard', 'config.json')
  ];
  const cfgPath = candidates.find((p) => fs.existsSync(p));
  if (!cfgPath) throw new Error('Geen config.json gevonden.');
  console.log('Config pad:', cfgPath);
  console.log('safeStorage beschikbaar:', safeStorage.isEncryptionAvailable());
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const activeOrg = cfg.app?.activeYesplanOrg;
  const y1 = cfg.yesplan || {};
  const y2 = cfg.yesplan2 || {};

  const c1 = { baseURL: y1.baseURL || '', apiKey: decryptIfEncrypted(y1._apiKeyEncrypted, y1.apiKey) };
  const c2 = { baseURL: y2.baseURL || '', apiKey: decryptIfEncrypted(y2._apiKeyEncrypted, y2.apiKey) };

  const valid1 = !!(c1.baseURL && c1.apiKey);
  const valid2 = !!(c2.baseURL && c2.apiKey);

  if (activeOrg === 'both') {
    return [valid1 ? { org: 1, ...c1 } : null, valid2 ? { org: 2, ...c2 } : null].filter(Boolean);
  }
  if (activeOrg === 2) return valid2 ? [{ org: 2, ...c2 }] : [];
  return valid1 ? [{ org: 1, ...c1 }] : [];
}

async function run() {
  const term = (process.argv.slice(2).join(' ') || 'west side story').trim();
  const YesplanAPI = require('../src/api/yesplan');
  const configs = loadYesplanConfig();
  if (!configs.length) {
    console.log('Geen geldige Yesplan-config gevonden.');
    return;
  }
  const all = [];
  for (const c of configs) {
    const api = new YesplanAPI({ baseURL: c.baseURL, apiKey: c.apiKey });
    const res = await api.getEventsBySearch(term);
    const data = (res?.success && Array.isArray(res.data)) ? res.data : [];
    all.push(...data.map(e => ({ ...e, _org: c.org })));
  }

  const seen = new Set();
  const uniq = [];
  for (const e of all) {
    const id = `${e._org}:${e.id}`;
    if (!seen.has(id)) {
      seen.add(id);
      uniq.push(e);
    }
  }

  console.log(`Zoekterm: ${term}`);
  console.log(`Resultaten: ${uniq.length}`);
  uniq.slice(0, 30).forEach((e, i) => {
    const date = e.startDate ? String(e.startDate).slice(0, 10) : 'onbekende datum';
    const venue = e.venue || '';
    console.log(`${i + 1}. [org ${e._org}] ${e.title || e.name} | ${date} | ${venue}`);
  });
}

app.whenReady().then(async () => {
  try {
    await run();
  } catch (e) {
    console.error('Zoektest fout:', e.message);
  } finally {
    app.quit();
  }
});
