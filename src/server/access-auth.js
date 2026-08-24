/**
 * E-mail/wachtwoord whitelist voor de Shift API-server.
 * Gebruikers beheer je via /controlpanel (admin).
 */

const crypto = require('crypto');
const store = require('./store');
const presence = require('./connection-tracker');

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 64;
const TOKEN_TTL_MS = 30 * 86400000; // 30 dagen

function readState() {
  const raw = store.get('accessAuth', null);
  if (!raw || typeof raw !== 'object') {
    return { users: [], settings: { authEnabled: true } };
  }
  return {
    users: Array.isArray(raw.users) ? raw.users : [],
    settings: raw.settings && typeof raw.settings === 'object' ? raw.settings : { authEnabled: true }
  };
}

function writeState(state) {
  store.set('accessAuth', state);
}

function getTokenSecret() {
  const env = String(process.env.SHIFT_HAPPENS_AUTH_SECRET || '').trim();
  if (env) return env;
  const state = readState();
  if (state.settings.tokenSecret) return state.settings.tokenSecret;
  const secret = crypto.randomBytes(32).toString('hex');
  state.settings.tokenSecret = secret;
  writeState(state);
  return secret;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, KEY_LEN, SCRYPT);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  try {
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    const actual = crypto.scryptSync(String(password), salt, KEY_LEN, SCRYPT);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function signToken(payload) {
  const body = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', getTokenSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', getTokenSecret()).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload?.sub || !payload?.exp || Date.now() > payload.exp) return null;
    const state = readState();
    const user = state.users.find((u) => u.id === payload.sub && u.enabled !== false);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role || 'user' };
  } catch {
    return null;
  }
}

function extractBearer(req) {
  const h = String(req.headers.authorization || req.headers.Authorization || '');
  // Geen regex met \s+ (ReDoS); vaste "Bearer "-prefix.
  if (h.length < 7) return '';
  if (h.slice(0, 7).toLowerCase() !== 'bearer ') return '';
  return h.slice(7).trim();
}

function isAuthEnabled() {
  const state = readState();
  if (state.settings.authEnabled === false) return false;
  return state.users.length > 0;
}

function needsBootstrap() {
  return readState().users.length === 0;
}

function listUsers() {
  return readState().users.map(({ id, email, role, enabled, createdAt }) => ({
    id,
    email,
    role: role || 'user',
    enabled: enabled !== false,
    createdAt: createdAt || null
  }));
}

function createUser({ email, password, role = 'user' }) {
  const norm = normalizeEmail(email);
  if (!norm || !norm.includes('@')) return { success: false, error: 'INVALID_EMAIL' };
  if (!password || String(password).length < 8) {
    return { success: false, error: 'PASSWORD_TOO_SHORT' };
  }
  const state = readState();
  if (state.users.some((u) => normalizeEmail(u.email) === norm)) {
    return { success: false, error: 'EMAIL_EXISTS' };
  }
  const user = {
    id: crypto.randomUUID(),
    email: norm,
    passwordHash: hashPassword(password),
    role: role === 'admin' ? 'admin' : 'user',
    enabled: true,
    createdAt: new Date().toISOString()
  };
  state.users.push(user);
  writeState(state);
  return { success: true, user: { id: user.id, email: user.email, role: user.role } };
}

function bootstrapAdmin({ email, password }) {
  if (!needsBootstrap()) return { success: false, error: 'ALREADY_BOOTSTRAPPED' };
  return createUser({ email, password, role: 'admin' });
}

function login({ email, password }) {
  const norm = normalizeEmail(email);
  const state = readState();
  const user = state.users.find((u) => normalizeEmail(u.email) === norm);
  if (!user || user.enabled === false) return { success: false, error: 'INVALID_CREDENTIALS' };
  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  const token = signToken({ sub: user.id, email: user.email, role: user.role || 'user' });
  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role || 'user' }
  };
}

function deleteUser(id, actor) {
  const state = readState();
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx < 0) return { success: false, error: 'NOT_FOUND' };
  if (state.users[idx].role === 'admin') {
    const adminCount = state.users.filter((u) => u.role === 'admin' && u.enabled !== false).length;
    if (adminCount <= 1) return { success: false, error: 'LAST_ADMIN' };
  }
  if (actor?.id === id) return { success: false, error: 'SELF_DELETE' };
  state.users.splice(idx, 1);
  writeState(state);
  return { success: true };
}

function updateUser(id, { password, enabled, role }, actor) {
  const state = readState();
  const user = state.users.find((u) => u.id === id);
  if (!user) return { success: false, error: 'NOT_FOUND' };
  if (role === 'user' && user.role === 'admin') {
    const adminCount = state.users.filter((u) => u.role === 'admin' && u.enabled !== false).length;
    if (adminCount <= 1) return { success: false, error: 'LAST_ADMIN' };
  }
  if (password != null && String(password).length > 0) {
    if (String(password).length < 8) return { success: false, error: 'PASSWORD_TOO_SHORT' };
    user.passwordHash = hashPassword(password);
  }
  if (enabled != null) user.enabled = !!enabled;
  if (role === 'admin' || role === 'user') user.role = role;
  writeState(state);
  return { success: true, user: { id: user.id, email: user.email, role: user.role, enabled: user.enabled !== false } };
}

function requireAuth(req, res, next) {
  if (!isAuthEnabled()) return next();
  const token = extractBearer(req);
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  req.shiftUser = user;
  req.shiftAuthToken = token;
  presence.upsert(token, user, req, {
    client: req.headers['x-shift-client'],
    view: req.headers['x-shift-view']
  });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.shiftUser || req.shiftUser.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  next();
}

module.exports = {
  bootstrapAdmin,
  createUser,
  deleteUser,
  extractBearer,
  isAuthEnabled,
  listUsers,
  login,
  needsBootstrap,
  requireAdmin,
  requireAuth,
  updateUser,
  verifyToken
};
