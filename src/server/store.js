/**
 * Shift Happens - File-based config store (voor API-server / iPhone-backend)
 * Zelfde structuur als electron-store: per-systeem keys (yesplan, yesplan2, itix, priva, app).
 * Geen Electron-afhankelijkheid.
 *
 * Veiligheid:
 *  - schrijven gebeurt atomair (tijdelijk bestand + rename), zodat een crash of stroomstoring
 *    het configbestand niet half geschreven achterlaat;
 *  - het bestand is alleen leesbaar voor de eigenaar (0600), want het bevat API-sleutels en wachtwoord-hashes;
 *  - een beschadigd bestand geeft een fout en wordt NIET stil vervangen door een lege config
 *    (een lege config zou de server zonder gebruikers, dus zonder login, laten draaien).
 * @author Team
 * @license UNLICENSED
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = process.env.SHIFT_HAPPENS_CONFIG_DIR || path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

/** Laatst gelezen inhoud; ongeldig zodra mtime of grootte van het bestand wijzigt. */
let cache = null;

function ensureDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function corruptError(detail) {
  const err = new Error(`Configbestand is beschadigd (${CONFIG_FILE}): ${detail}`);
  err.code = 'CONFIG_CORRUPT';
  return err;
}

function readAll() {
  ensureDir();
  let st;
  try {
    st = fs.statSync(CONFIG_FILE);
  } catch (e) {
    if (e.code === 'ENOENT') {
      cache = null;
      return {};
    }
    throw e;
  }
  if (cache && cache.mtimeMs === st.mtimeMs && cache.size === st.size) return cache.data;
  const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw corruptError(e.message);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw corruptError('verwacht een JSON-object');
  }
  cache = { mtimeMs: st.mtimeMs, size: st.size, data };
  return data;
}

function writeAll(obj) {
  ensureDir();
  const json = JSON.stringify(obj, null, 2);
  const tmp = `${CONFIG_FILE}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, json, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, CONFIG_FILE);
  } catch (e) {
    // Rename kan mislukken als een ander proces het bestand vasthoudt (virusscanner, sync-client).
    try { fs.unlinkSync(tmp); } catch (_) { /* tijdelijk bestand bestond niet */ }
    fs.writeFileSync(CONFIG_FILE, json, { encoding: 'utf8', mode: 0o600 });
  }
  try { fs.chmodSync(CONFIG_FILE, 0o600); } catch (_) { /* niet ondersteund op dit bestandssysteem */ }
  try {
    const st = fs.statSync(CONFIG_FILE);
    cache = { mtimeMs: st.mtimeMs, size: st.size, data: obj };
  } catch (_) {
    cache = null;
  }
}

function assertKey(key) {
  if (typeof key !== 'string' || !key || FORBIDDEN_KEYS.has(key)) {
    throw new Error('Ongeldige config-sleutel');
  }
}

function clone(value) {
  return value === undefined ? value : structuredClone(value);
}

module.exports = {
  /** Geeft een kopie terug: aanpassingen aan het resultaat raken de opgeslagen config pas na set(). */
  get(key, defaultValue = {}) {
    assertKey(key);
    const all = readAll();
    return Object.prototype.hasOwnProperty.call(all, key) ? clone(all[key]) : defaultValue;
  },
  set(key, value) {
    assertKey(key);
    const all = { ...readAll() };
    all[key] = clone(value);
    writeAll(all);
  },
  path: CONFIG_FILE,
  dir: CONFIG_DIR
};
