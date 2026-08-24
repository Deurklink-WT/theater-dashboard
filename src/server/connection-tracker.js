/**
 * Actieve client-sessies. Zichtbaar in controlpanel.
 * Online-drempel (STALE); sessies blijven tot manueel verwijderd.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('./store');

/** Na zoveel ms zonder signaal → online = false */
const STALE_MS = Number(process.env.SHIFT_PRESENCE_STALE_MS || 25000);

const sessions = new Map();
const PRESENCE_FILE = path.join(store.dir, 'presence.json');

function tokenKey(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex').slice(0, 24);
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || '';
}

function clientLabel(req, override) {
  const raw = override || req.headers['x-shift-client'] || req.headers['X-Shift-Client'] || '';
  const label = String(raw || 'onbekend').trim().slice(0, 64);
  return label || 'onbekend';
}

function loadFromDisk() {
  try {
    if (!fs.existsSync(PRESENCE_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(PRESENCE_FILE, 'utf8'));
    const list = Array.isArray(raw?.sessions) ? raw.sessions : [];
    for (const s of list) {
      if (!s?.id || !s?.userId) continue;
      sessions.set(s.id, s);
    }
  } catch {
    /* ignore corrupt snapshot */
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (!fs.existsSync(store.dir)) fs.mkdirSync(store.dir, { recursive: true });
      const payload = {
        savedAt: Date.now(),
        sessions: [...sessions.values()]
      };
      fs.writeFileSync(PRESENCE_FILE, JSON.stringify(payload, null, 2), 'utf8');
    } catch {
      /* ignore */
    }
  }, 250);
}

function upsert(token, user, req, meta = {}) {
  if (!token || !user?.id) return null;
  const key = tokenKey(token);
  const now = Date.now();
  const prev = sessions.get(key);
  const session = {
    id: key,
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    client: clientLabel(req, meta.client),
    view: String(meta.view || req.headers['x-shift-view'] || prev?.view || '').slice(0, 64) || null,
    ip: clientIp(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 180),
    connectedAt: prev?.connectedAt || now,
    lastSeenAt: now
  };
  sessions.set(key, session);
  scheduleSave();
  return session;
}

function touch(token, req, meta = {}) {
  if (!token) return null;
  const key = tokenKey(token);
  const prev = sessions.get(key);
  if (!prev) return null;
  prev.lastSeenAt = Date.now();
  if (meta.client) prev.client = clientLabel(req, meta.client);
  if (meta.view) prev.view = String(meta.view).slice(0, 64);
  prev.ip = clientIp(req);
  sessions.set(key, prev);
  scheduleSave();
  return prev;
}

function remove(id) {
  const key = String(id || '').trim();
  if (!key || !sessions.has(key)) return false;
  sessions.delete(key);
  scheduleSave();
  return true;
}

function listActive() {
  const now = Date.now();
  return [...sessions.values()]
    .sort((a, b) => {
      const ao = (now - (a.lastSeenAt || 0)) <= STALE_MS ? 1 : 0;
      const bo = (now - (b.lastSeenAt || 0)) <= STALE_MS ? 1 : 0;
      if (ao !== bo) return bo - ao;
      return (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
    })
    .map((s) => ({
      ...s,
      online: (now - (s.lastSeenAt || 0)) <= STALE_MS,
      idleSeconds: Math.max(0, Math.round((now - (s.lastSeenAt || 0)) / 1000)),
      lastSeenAt: s.lastSeenAt || null
    }));
}

function size() {
  return sessions.size;
}

loadFromDisk();

module.exports = {
  listActive,
  touch,
  upsert,
  remove,
  size,
  STALE_MS
};
