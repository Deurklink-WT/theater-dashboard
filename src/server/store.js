/**
 * Shift Happens - File-based config store (voor API-server / iPhone-backend)
 * Zelfde structuur als electron-store: per-systeem keys (yesplan, yesplan2, itix, priva, app).
 * Geen Electron-afhankelijkheid.
 * @author Team
 * @license UNLICENSED
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = process.env.SHIFT_HAPPENS_CONFIG_DIR || path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

let cached = null;
let cachedMtimeMs = null;

function ensureDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readAll() {
  ensureDir();
  try {
    const stat = fs.statSync(CONFIG_FILE);
    if (cached && cachedMtimeMs === stat.mtimeMs) return cached;
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    cached = JSON.parse(raw);
    cachedMtimeMs = stat.mtimeMs;
    return cached;
  } catch (e) {
    if (e.code === 'ENOENT') {
      cached = {};
      cachedMtimeMs = null;
      return cached;
    }
    throw e;
  }
}

function writeAll(obj) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(obj, null, 2), 'utf8');
  cached = obj;
  try {
    cachedMtimeMs = fs.statSync(CONFIG_FILE).mtimeMs;
  } catch (_) {
    cachedMtimeMs = null;
  }
}

function cloneValue(value) {
  if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
  return value;
}

module.exports = {
  get(key, defaultValue = {}) {
    const all = readAll();
    return key in all ? cloneValue(all[key]) : defaultValue;
  },
  set(key, value) {
    const all = readAll();
    all[key] = value;
    writeAll(all);
  },
  path: CONFIG_FILE,
  dir: CONFIG_DIR
};
