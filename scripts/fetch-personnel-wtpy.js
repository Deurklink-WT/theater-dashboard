#!/usr/bin/env node
/**
 * Haalt personeel op voor vandaag, WTPY, Yentl en Boer (Rekhalzen).
 * Gebruikt dezelfde config als de app, of env vars.
 * Run: node scripts/fetch-personnel-wtpy.js
 * Of: YESPLAN_BASE_URL=... YESPLAN_API_KEY=... node scripts/fetch-personnel-wtpy.js
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Config pad: dev = theater-dashboard, gebouwd = Shift Happens
const configDir = process.platform === 'darwin'
  ? path.join(os.homedir(), 'Library', 'Application Support')
  : (process.env.APPDATA || os.homedir());
const candidates = [
  process.env.THEATER_CONFIG_PATH,
  path.join(configDir, 'theater-dashboard', 'config.json'),
  path.join(configDir, 'Shift Happens', 'config.json')
].filter(Boolean);
const configPath = candidates.find((p) => fs.existsSync(p)) || candidates[0];

function loadConfig() {
  let baseURL, apiKey;
  if (process.env.YESPLAN_BASE_URL && process.env.YESPLAN_API_KEY) {
    baseURL = process.env.YESPLAN_BASE_URL;
    apiKey = process.env.YESPLAN_API_KEY;
    return { baseURL, apiKey };
  }
  try {
    if (!fs.existsSync(configPath)) {
      console.error('Config niet gevonden:', configPath);
      console.error('Run dit script vanuit de terminal op je Mac (naast de app). Of zet:');
      console.error('  export YESPLAN_BASE_URL="https://jouw-org.yesplan.nl"');
      console.error('  export YESPLAN_API_KEY="jouw-key"');
      process.exit(1);
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(raw);
    const activeOrg = data.app?.activeYesplanOrg;
    const y1 = data.yesplan || {};
    const y2 = data.yesplan2 || {};
    const plainKey = (y) => typeof y.apiKey === 'string' && y.apiKey.length > 0;
    const use1 = plainKey(y1) && y1.baseURL;
    const use2 = plainKey(y2) && y2.baseURL;
    if (use1 && (activeOrg === 1 || !use2)) {
      baseURL = y1.baseURL;
      apiKey = y1.apiKey;
    } else if (use2) {
      baseURL = y2.baseURL;
      apiKey = y2.apiKey;
    } else if (y1.baseURL || y2.baseURL) {
      console.error('API key staat versleuteld in config. Zet: export YESPLAN_BASE_URL=... YESPLAN_API_KEY=...');
      process.exit(1);
    }
    if (!baseURL || !apiKey) {
      console.error('Geen Yesplan baseURL + apiKey in', configPath);
      process.exit(1);
    }
    return { baseURL, apiKey };
  } catch (e) {
    console.error('Config lezen mislukt:', configPath, e.message);
    process.exit(1);
  }
}

async function main() {
  const config = loadConfig();
  const YesplanAPI = require('../src/api/yesplan');
  const api = new YesplanAPI(config);

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  console.log('Vandaag:', todayStr);
  console.log('Ophalen events + personeel voor WTPY / Yentl en Boer...\n');

  let result;
  try {
    result = await api.getEvents({ startDate: todayStr, endDate: todayStr, limit: 100 });
  } catch (err) {
    console.error('Yesplan API fout:', err.message);
    if (err.response) console.error('Status:', err.response.status);
    process.exit(1);
  }

  if (!result.success || !result.data || !result.data.length) {
    console.log('Geen events gevonden voor vandaag.');
    return;
  }

  const hasWtpy = (e) => {
    const locs = (e.locations || []).map((l) => String(l?.id || l?.name || l)).join(' ');
    const venueStr = (e.venue || '') + (e.venueIds || []).map((id) => String(id)).join(' ');
    return (locs + ' ' + venueStr).toUpperCase().includes('WTPY');
  };

  // Alle events van vandaag op zaal WTPY
  const byWtpy = result.data.filter(hasWtpy);
  const events = byWtpy.length ? byWtpy : result.data;

  if (!events.length) {
    console.log('Geen events voor vandaag.');
    return;
  }
  if (byWtpy.length === 0 && result.data.length) {
    console.log('(Geen events op zaal WTPY; toon alle events van vandaag)\n');
  }
  if (byWtpy.length) {
    console.log('Events op WTPY vandaag:', byWtpy.length, '\n');
  }

  for (const event of events) {
    const uren = event.urenInfo || {};
    const techniek = (uren.techniek || []).filter(Boolean);
    const horeca = (uren.horeca || []).filter(Boolean);
    const frontOffice = (uren.frontOffice || []).filter(Boolean);
    const nostradamus = (uren.nostradamus || []).filter(Boolean);

    console.log('---', event.name || event.title, '|', event.performer || event.groupName || '', '---');
    if (techniek.length || horeca.length || frontOffice.length || nostradamus.length) {
      if (techniek.length) {
        console.log('\nTechniek:');
        techniek.forEach((line) => console.log('  ', line));
      }
      if (horeca.length) {
        console.log('\nHoreca:');
        horeca.forEach((line) => console.log('  ', line));
      }
      if (frontOffice.length) {
        console.log('\nFront Office:');
        frontOffice.forEach((line) => console.log('  ', line));
      }
      if (nostradamus.length) {
        console.log('\nNostradamus:');
        nostradamus.forEach((line) => console.log('  ', line));
      }
      console.log('');
    } else {
      console.log('Geen personeelsplanning in dit event (urenInfo leeg).\n');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
