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
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 256;
const MAX_EMAIL_LENGTH = 254;

function readState() {
  const raw = store.get('accessAuth', null);
  if (!raw || typeof raw !== 'object') {
    return { users: [], settings: { authEnabled: true }, revoked: {} };
  }
  return {
    users: Array.isArray(raw.users) ? raw.users : [],
    settings: raw.settings && typeof raw.settings === 'object' ? raw.settings : { authEnabled: true },
    // Ingetrokken sessies: { <tokenKey>: <vervaltijd in ms> }
    revoked: raw.revoked && typeof raw.revoked === 'object' && !Array.isArray(raw.revoked) ? raw.revoked : {}
  };
}

function writeState(state) {
  const now = Date.now();
  const revoked = {};
  for (const [k, exp] of Object.entries(state.revoked || {})) {
    if (Number(exp) > now) revoked[k] = Number(exp);
  }
  store.set('accessAuth', { users: state.users, settings: state.settings, revoked });
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

function isValidEmail(norm) {
  if (!norm || norm.length > MAX_EMAIL_LENGTH) return false;
  const at = norm.indexOf('@');
  if (at <= 0 || at !== norm.lastIndexOf('@') || at === norm.length - 1) return false;
  for (let i = 0; i < norm.length; i += 1) {
    const c = norm.charCodeAt(i);
    if (c <= 32 || c === 127) return false; // geen spaties of stuurtekens
  }
  return true;
}

function passwordError(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) return 'PASSWORD_TOO_SHORT';
  if (password.length > MAX_PASSWORD_LENGTH) return 'PASSWORD_TOO_LONG';
  return null;
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

/** Voor onbekende accounts: even lang rekenen als bij een bestaand account (geen tijdsverschil). */
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

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
  if (!token || typeof token !== 'string' || token.length > 4096) return null;
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
    if (state.revoked[presence.tokenKey(token)]) return null;
    const user = state.users.find((u) => u.id === payload.sub && u.enabled !== false);
    if (!user) return null;
    // Na wachtwoord-, rol- of statuswijziging vervallen eerder uitgegeven tokens.
    if (Number(payload.tv || 0) !== Number(user.tokenVersion || 0)) return null;
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

/** Ingelogde gebruiker van dit verzoek, ook als login op de server uit staat. */
function getRequestUser(req) {
  const token = extractBearer(req);
  return token ? verifyToken(token) : null;
}

function isAuthEnabled() {
  const state = readState();
  if (state.settings.authEnabled === false) return false;
  return state.users.length > 0;
}

function needsBootstrap() {
  return readState().users.length === 0;
}

// --- Installatiecode: alleen wie de serverlog kan lezen mag de eerste beheerder aanmaken ---
let generatedSetupCode = null;
function getSetupCode() {
  const env = String(process.env.SHIFT_HAPPENS_SETUP_CODE || '').trim();
  if (env) return env;
  if (!generatedSetupCode) generatedSetupCode = crypto.randomBytes(5).toString('hex').toUpperCase();
  return generatedSetupCode;
}

function checkSetupCode(given) {
  const a = Buffer.from(String(given || '').trim().toUpperCase());
  const b = Buffer.from(getSetupCode().toUpperCase());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
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
  if (!isValidEmail(norm)) return { success: false, error: 'INVALID_EMAIL' };
  const pwErr = passwordError(password);
  if (pwErr) return { success: false, error: pwErr };
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
    tokenVersion: 0,
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
  const pw = typeof password === 'string' ? password.slice(0, MAX_PASSWORD_LENGTH + 1) : '';
  const state = readState();
  const user = state.users.find((u) => normalizeEmail(u.email) === norm);
  if (!user || user.enabled === false) {
    verifyPassword(pw, DUMMY_HASH);
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  if (!verifyPassword(pw, user.passwordHash)) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role || 'user',
    tv: Number(user.tokenVersion || 0)
  });
  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role || 'user' }
  };
}

function enabledAdminCount(state) {
  return state.users.filter((u) => u.role === 'admin' && u.enabled !== false).length;
}

function isLastEnabledAdmin(state, user) {
  return user.role === 'admin' && user.enabled !== false && enabledAdminCount(state) <= 1;
}

function deleteUser(id, actor) {
  const state = readState();
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx < 0) return { success: false, error: 'NOT_FOUND' };
  if (isLastEnabledAdmin(state, state.users[idx])) return { success: false, error: 'LAST_ADMIN' };
  if (actor?.id === id) return { success: false, error: 'SELF_DELETE' };
  state.users.splice(idx, 1);
  writeState(state);
  return { success: true };
}

function updateUser(id, { password, enabled, role }, actor) {
  const state = readState();
  const user = state.users.find((u) => u.id === id);
  if (!user) return { success: false, error: 'NOT_FOUND' };
  const demotes = role === 'user' && user.role === 'admin';
  const disables = enabled != null && !enabled && user.enabled !== false;
  if ((demotes || disables) && isLastEnabledAdmin(state, user)) {
    return { success: false, error: 'LAST_ADMIN' };
  }
  let invalidateTokens = false;
  if (password != null && String(password).length > 0) {
    const pwErr = passwordError(password);
    if (pwErr) return { success: false, error: pwErr };
    user.passwordHash = hashPassword(password);
    invalidateTokens = true;
  }
  if (enabled != null) {
    if (user.enabled !== false && !enabled) invalidateTokens = true;
    user.enabled = !!enabled;
  }
  if ((role === 'admin' || role === 'user') && role !== (user.role || 'user')) {
    user.role = role;
    invalidateTokens = true;
  }
  if (invalidateTokens) user.tokenVersion = Number(user.tokenVersion || 0) + 1;
  writeState(state);
  return {
    success: true,
    // De beheerder die zijn eigen account wijzigt moet opnieuw inloggen.
    reloginRequired: invalidateTokens && actor?.id === id,
    user: { id: user.id, email: user.email, role: user.role, enabled: user.enabled !== false }
  };
}

/** Trekt één sessie in (id = tokenKey uit de verbindingenlijst); het token werkt daarna niet meer. */
function revokeSession(sessionId) {
  const key = String(sessionId || '').trim();
  if (!/^[a-f0-9]{24}$/.test(key)) return false;
  const state = readState();
  state.revoked[key] = Date.now() + TOKEN_TTL_MS;
  writeState(state);
  return true;
}

function authenticate(req, res) {
  const token = extractBearer(req);
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    return false;
  }
  req.shiftUser = user;
  req.shiftAuthToken = token;
  presence.upsert(token, user, req, {
    client: req.headers['x-shift-client'],
    view: req.headers['x-shift-view']
  });
  return true;
}

/** Vereist login zodra er gebruikers zijn; zonder gebruikers (verse installatie) is de API open. */
function requireAuth(req, res, next) {
  if (!isAuthEnabled()) return next();
  if (authenticate(req, res)) next();
}

/** Vereist altijd een geldige login, ook als login op de server uit staat. */
function requireUser(req, res, next) {
  if (authenticate(req, res)) next();
}

function requireAdmin(req, res, next) {
  if (!req.shiftUser || req.shiftUser.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  next();
}

module.exports = {
  bootstrapAdmin,
  checkSetupCode,
  createUser,
  deleteUser,
  extractBearer,
  getRequestUser,
  getSetupCode,
  isAuthEnabled,
  listUsers,
  login,
  needsBootstrap,
  requireAdmin,
  requireAuth,
  requireUser,
  revokeSession,
  updateUser,
  verifyToken
};
