/**
 * Shift Happens - API server voor iPhone/web clients
 * Zelfde logica als Electron IPC-handlers, via REST.
 * Start met: node src/server/api-server.js
 * @author Team
 * @license UNLICENSED
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const store = require('./store');
const timerSync = require('./voorstelling-timer-sync');
const trekkenlijstSync = require('./trekkenlijst-sync');
const auditLog = require('./audit-log');
const accessAuth = require('./access-auth');
const presence = require('./connection-tracker');

const YesplanAPI = require('../api/yesplan');
const PrivaAPI = require('../api/priva');

const SENSITIVE_KEYS = ['apiKey'];
/** Config zoals de server die zelf gebruikt (mét sleutels). Gaat nooit ongefilterd naar een client. */
function secureConfigFromStorage(config) {
  if (!config) return config;
  const out = { ...config };
  for (const key of SENSITIVE_KEYS) {
    const encKey = `_${key}Encrypted`;
    if (out[encKey] || out[key]) {
      out[key] = out[encKey] ? out[key] || '' : out[key];
      delete out[encKey];
    }
  }
  return out;
}

// --- Config via de API: alleen bekende systemen, geheimen blijven op de server ---
/** Systemen die een client mag lezen/schrijven. Interne sleutels (accessAuth, auditLog, ...) horen hier nooit bij. */
const CONFIG_SYSTEMS = new Set(['app', 'yesplan', 'yesplan2', 'priva', 'itix', 'voorstellingTimer']);
/** Koppelingen met externe systemen: wijzigen mag alleen een beheerder. */
const CONNECTION_SYSTEMS = new Set(['yesplan', 'yesplan2', 'priva', 'itix']);
const SECRET_FIELD_RE = /(apikey|password|secret|token)$/i;
/** Wat een client te zien krijgt in plaats van een opgeslagen geheim; terugsturen betekent "ongewijzigd". */
const SECRET_MASK = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
const URL_FIELD_RE = /^baseURL\d*$/;
/** Instellingen in 'app' die per gebruiker gelden in plaats van voor iedereen. */
const APP_PERSONAL_FIELDS = ['theme', 'language', 'cloudflareAccessClientId', 'cloudflareAccessClientSecret', 'shiftServerBaseUrl'];
/** Legacy gedeelde waarden die een ingelogde gebruiker niet van een ander mag overnemen. */
const APP_SHARED_SECRET_FIELDS = ['cloudflareAccessClientId', 'cloudflareAccessClientSecret'];
/** Wordt nooit opgeslagen: het login-token hoort alleen op het toestel van de gebruiker. */
const APP_NEVER_STORED_FIELDS = ['shiftAuthToken', 'shiftAuthEmail'];
const FORBIDDEN_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function withoutKeys(obj, keys) {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

function maskSecrets(config) {
  const out = {};
  for (const [k, v] of Object.entries(config || {})) {
    if (/^_.*Encrypted$/.test(k)) continue;
    out[k] = (SECRET_FIELD_RE.test(k) && typeof v === 'string' && v) ? SECRET_MASK : v;
  }
  return out;
}

/** Neemt opgeslagen geheimen over als de client het masker (of niets) terugstuurt; een leeg veld wist de sleutel. */
function mergeSecrets(incoming, stored) {
  const out = {};
  for (const [k, v] of Object.entries(incoming)) {
    if (FORBIDDEN_OBJECT_KEYS.has(k) || /^_.*Encrypted$/.test(k)) continue;
    out[k] = v;
  }
  for (const [k, v] of Object.entries(stored || {})) {
    if (!SECRET_FIELD_RE.test(k)) continue;
    if (out[k] === undefined || out[k] === SECRET_MASK) out[k] = v;
  }
  return out;
}

/** Lege velden tellen niet als wijziging (een formulier stuurt ze altijd mee). */
function withoutEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) out[k] = v;
  }
  return out;
}

function stableStringify(v) {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  if (isPlainObject(v)) {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v === undefined ? null : v);
}

function invalidBaseUrlField(config) {
  for (const [k, v] of Object.entries(config)) {
    if (!URL_FIELD_RE.test(k) || v == null || v === '') continue;
    if (typeof v !== 'string' || v.length > 2048) return k;
    try {
      const u = new URL(v.trim());
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return k;
      if (u.username || u.password) return k;
    } catch {
      return k;
    }
  }
  return null;
}

function readAppConfigFor(user) {
  const shared = withoutKeys(store.get('app', {}), APP_NEVER_STORED_FIELDS);
  if (!user) return shared;
  const personalAll = store.get('appUsers', {});
  const personal = isPlainObject(personalAll[user.id]) ? personalAll[user.id] : {};
  return { ...withoutKeys(shared, APP_SHARED_SECRET_FIELDS), ...personal };
}

function writeAppConfigFor(user, config) {
  const clean = {};
  for (const [k, v] of Object.entries(config)) {
    if (FORBIDDEN_OBJECT_KEYS.has(k) || APP_NEVER_STORED_FIELDS.includes(k)) continue;
    clean[k] = v;
  }
  if (!user) {
    store.set('app', clean);
    return;
  }
  const personal = {};
  for (const k of APP_PERSONAL_FIELDS) {
    if (clean[k] !== undefined) personal[k] = clean[k];
    delete clean[k];
  }
  // Gedeelde standaardwaarden (bv. thema van vóór de persoonlijke instellingen) blijven staan.
  const previousShared = store.get('app', {});
  for (const k of APP_PERSONAL_FIELDS) {
    if (previousShared[k] !== undefined && !APP_SHARED_SECRET_FIELDS.includes(k)) clean[k] = previousShared[k];
  }
  store.set('app', clean);
  const personalAll = store.get('appUsers', {});
  personalAll[user.id] = personal;
  store.set('appUsers', personalAll);
}

function getYesplanConfig(org) {
  const key = org === 2 ? 'yesplan2' : 'yesplan';
  return secureConfigFromStorage(store.get(key, {}));
}

function getActiveYesplanOrg() {
  const appConfig = store.get('app', {});
  const v = appConfig.activeYesplanOrg;
  return v === 'both' ? 'both' : (v === 2 ? 2 : 1);
}

// Cache TTL zodat we niet te vaak dezelfde Yesplan responses opnieuw ophalen.
// Standaard ruim: 6 uur. Overschrijfbaar via env var.
const YESPLAN_CACHE_TTL_MS = Number(process.env.YESPLAN_CACHE_TTL_MS || (6 * 60 * 60 * 1000));
const YESPLAN_CACHE_MAX = 100;
const yesplanCache = new Map();

function yesplanCacheKey(params) {
  const { startDate, endDate, venueId, includeEventDetailsForWeekFilters } = params;
  const org = getActiveYesplanOrg();
  const detailsKey = includeEventDetailsForWeekFilters ? 'fullWeekFilters' : 'liteWeekFilters';
  return `yesplan:org${org}:${startDate || ''}:${endDate || ''}:${venueId ?? 'all'}:${detailsKey}`;
}
function yesplanCacheGet(key) {
  const ent = yesplanCache.get(key);
  if (!ent) return null;
  if (Date.now() - ent.ts > YESPLAN_CACHE_TTL_MS) {
    yesplanCache.delete(key);
    return null;
  }
  return ent.data;
}
function yesplanCacheSet(key, data) {
  if (yesplanCache.size >= YESPLAN_CACHE_MAX) {
    let oldest = null;
    let oldestTs = Infinity;
    for (const [k, v] of yesplanCache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldest = k; }
    }
    if (oldest) yesplanCache.delete(oldest);
  }
  yesplanCache.set(key, { data, ts: Date.now() });
}

async function getYesplanData(params) {
  const skipCache = !!params.skipCache;
  let venueId = params.venueId;
  const activeOrg = getActiveYesplanOrg();
  let singleOrg = null;
  if (activeOrg === 'both' && venueId && String(venueId).includes(':')) {
    const [orgPart, idPart] = String(venueId).split(':');
    singleOrg = orgPart === '2' ? 2 : 1;
    venueId = idPart || undefined;
  }
  const apiParams = { startDate: params.startDate, endDate: params.endDate, venueId, limit: params.limit, includeEventDetailsForWeekFilters: !!params.includeEventDetailsForWeekFilters };
  const key = yesplanCacheKey(apiParams);
  if (!skipCache) {
    const cached = yesplanCacheGet(key);
    if (cached) return cached;
  }
  if (activeOrg === 'both' && singleOrg === null) {
    const config1 = getYesplanConfig(1);
    const config2 = getYesplanConfig(2);
    if (!config1.baseURL || !config1.apiKey || !config2.baseURL || !config2.apiKey) {
      return { success: false, data: [], timestamp: new Date().toISOString() };
    }
    const [r1, r2] = await Promise.all([
      new YesplanAPI(config1).getEvents(apiParams),
      new YesplanAPI(config2).getEvents(apiParams)
    ]);
    const data1 = (r1?.success && r1?.data) ? r1.data.map(e => ({ ...e, _organizationId: 1 })) : [];
    const data2 = (r2?.success && r2?.data) ? r2.data.map(e => ({ ...e, _organizationId: 2 })) : [];
    const merged = [...data1, ...data2].sort((a, b) => {
      const tA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const tB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return tA - tB;
    });
    const result = { success: true, data: merged, timestamp: new Date().toISOString() };
    yesplanCacheSet(key, result);
    return result;
  }
  const orgNum = singleOrg ?? (activeOrg === 2 ? 2 : 1);
  const yesplan = new YesplanAPI(getYesplanConfig(orgNum));
  const result = await yesplan.getEvents(apiParams);
  if (result && result.success) {
    const data = (result.data || []).map(e => ({ ...e, _organizationId: orgNum }));
    const out = { ...result, data };
    yesplanCacheSet(key, out);
    return out;
  }
  return result;
}

async function getYesplanVenues(params = {}) {
  const org = params.org;
  if (org === 'both') {
    const config1 = getYesplanConfig(1);
    const config2 = getYesplanConfig(2);
    if (!config1.baseURL || !config1.apiKey || !config2.baseURL || !config2.apiKey) {
      return { success: false, data: [] };
    }
    const [r1, r2] = await Promise.all([
      new YesplanAPI(config1).getVenues(),
      new YesplanAPI(config2).getVenues()
    ]);
    const label1 = (config1.name && String(config1.name).trim()) || 'Org 1';
    const label2 = (config2.name && String(config2.name).trim()) || 'Org 2';
    const v1 = (r1?.success && r1?.data) ? r1.data.map(v => ({ ...v, id: `1:${v.id}`, _organizationId: 1, name: `${v.name || 'Zaal'} (${label1})` })) : [];
    const v2 = (r2?.success && r2?.data) ? r2.data.map(v => ({ ...v, id: `2:${v.id}`, _organizationId: 2, name: `${v.name || 'Zaal'} (${label2})` })) : [];
    return { success: true, data: [...v1, ...v2] };
  }
  const orgNum = org === 2 ? 2 : 1;
  const yesplan = new YesplanAPI(getYesplanConfig(orgNum));
  return await yesplan.getVenues();
}

async function getYesplanSchedule(eventId, org) {
  const orgNum = (org === 2 ? 2 : 1);
  const yesplan = new YesplanAPI(getYesplanConfig(orgNum));
  return await yesplan.getSchedule(eventId);
}

async function getYesplanReservations(params) {
  const activeOrg = getActiveYesplanOrg();
  let venueId = params.venueId;
  let singleOrg = null;
  if (activeOrg === 'both' && venueId && String(venueId).includes(':')) {
    const [orgPart, idPart] = String(venueId).split(':');
    singleOrg = orgPart === '2' ? 2 : 1;
    venueId = idPart || undefined;
  }
  const apiParams = { ...params, venueId };
  if (activeOrg === 'both' && singleOrg === null) {
    const config1 = getYesplanConfig(1);
    const config2 = getYesplanConfig(2);
    if (!config1.baseURL || !config1.apiKey || !config2.baseURL || !config2.apiKey) {
      return { success: false, data: [] };
    }
    const [r1, r2] = await Promise.all([
      new YesplanAPI(config1).getReservations(apiParams),
      new YesplanAPI(config2).getReservations(apiParams)
    ]);
    const d1 = (r1?.success && r1?.data) ? r1.data : [];
    const d2 = (r2?.success && r2?.data) ? r2.data : [];
    return { success: true, data: [...d1, ...d2] };
  }
  const orgNum = singleOrg ?? (activeOrg === 2 ? 2 : 1);
  const yesplan = new YesplanAPI(getYesplanConfig(orgNum));
  return await yesplan.getReservations(apiParams);
}

const app = express();
const PORT = process.env.PORT || 3847;

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.SHIFT_HAPPENS_API_RATE_MAX || 180),
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.SHIFT_HAPPENS_AUTH_RATE_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false
});
const staticLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.SHIFT_HAPPENS_STATIC_RATE_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false
});

app.disable('x-powered-by');

// Achter een reverse proxy (nginx, cloudflared): zet SHIFT_HAPPENS_TRUST_PROXY=1 zodat
// het echte client-adres wordt gebruikt voor rate limiting en de verbindingenlijst.
const trustProxyEnv = String(process.env.SHIFT_HAPPENS_TRUST_PROXY || '').trim();
if (trustProxyEnv) {
  const n = Number(trustProxyEnv);
  app.set('trust proxy', Number.isInteger(n) && n >= 0 ? n : trustProxyEnv);
}

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// --- CORS: alleen de eigen clients mogen vanuit een browser-context de API aanroepen ---
const EXTRA_CORS_ORIGINS = new Set(
  String(process.env.SHIFT_HAPPENS_CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
function isAllowedOrigin(origin, req) {
  if (!origin) return true; // geen browser-context (curl, Electron main, native)
  if (origin === 'null') return true; // Electron-venster (file://); alle gevoelige routes vragen een token
  if (EXTRA_CORS_ORIGINS.has(origin)) return true;
  let u;
  try {
    u = new URL(origin);
  } catch {
    return false;
  }
  if (u.protocol === 'capacitor:' || u.protocol === 'ionic:') return u.hostname === 'localhost';
  if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]') return true;
  // Zelfde herkomst als de server zelf (controlpanel en /app).
  return !!req.headers.host && u.host === req.headers.host;
}
app.use(cors((req, cb) => {
  const origin = req.headers.origin;
  cb(null, {
    origin: isAllowedOrigin(origin, req) ? (origin || false) : false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Shift-Client', 'X-Shift-View', 'CF-Access-Client-Id', 'CF-Access-Client-Secret'],
    maxAge: 600
  });
}));
// Verzoeken vanaf een vreemde website weigeren we ook als de browser ze toch verstuurt.
app.use('/api/', (req, res, next) => {
  if (isAllowedOrigin(req.headers.origin, req)) return next();
  res.status(403).json({ success: false, error: 'ORIGIN_NOT_ALLOWED' });
});
app.use(express.json({ limit: '200kb' }));
app.use('/api/', apiLimiter);
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function isDirectLoopback(req) {
  const h = req.headers;
  if (h['x-forwarded-for'] || h['x-real-ip'] || h.forwarded || h['cf-connecting-ip']) return false;
  const a = String(req.socket?.remoteAddress || '');
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
}

// --- Auth (whitelist e-mail/wachtwoord) ---
app.get('/api/auth/status', (req, res) => {
  const needsBootstrap = accessAuth.needsBootstrap();
  res.json({
    success: true,
    needsBootstrap,
    setupCodeRequired: needsBootstrap && !isDirectLoopback(req),
    authEnabled: accessAuth.isAuthEnabled()
  });
});

app.post('/api/auth/bootstrap', authLimiter, (req, res) => {
  const { email, password, setupCode } = req.body || {};
  if (!accessAuth.needsBootstrap()) {
    return res.status(400).json({ success: false, error: 'ALREADY_BOOTSTRAPPED' });
  }
  // De eerste beheerder aanmaken mag alleen op de server zelf, of met de installatiecode uit de serverlog.
  if (!isDirectLoopback(req) && !accessAuth.checkSetupCode(setupCode)) {
    return res.status(403).json({ success: false, error: 'SETUP_CODE_REQUIRED' });
  }
  const result = accessAuth.bootstrapAdmin({ email, password });
  if (!result.success) return res.status(400).json(result);
  auditLog.appendEntry({ userId: result.user.id, email: result.user.email, action: 'auth.eerste_beheerder' });
  const login = accessAuth.login({ email, password });
  if (login.success) presence.upsert(login.token, login.user, req);
  res.json(login);
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  const result = accessAuth.login({ email, password });
  if (!result.success) return res.status(401).json(result);
  presence.upsert(result.token, result.user, req, {
    client: req.headers['x-shift-client'] || req.body?.client,
    view: req.body?.view
  });
  res.json(result);
});

app.post('/api/auth/presence', accessAuth.requireAuth, (req, res) => {
  const { client, view } = req.body || {};
  presence.upsert(req.shiftAuthToken, req.shiftUser, req, { client, view });
  res.json({ success: true });
});

app.get('/api/auth/me', accessAuth.requireAuth, (req, res) => {
  res.json({ success: true, user: req.shiftUser });
});

app.get('/api/admin/users', accessAuth.requireUser, accessAuth.requireAdmin, (req, res) => {
  res.json({ success: true, users: accessAuth.listUsers() });
});

app.get('/api/admin/connections', accessAuth.requireUser, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const connections = presence.listActive();
  res.json({
    success: true,
    staleAfterSeconds: Math.round(presence.STALE_MS / 1000),
    count: connections.length,
    connections
  });
});

app.delete('/api/admin/connections/:id', accessAuth.requireUser, accessAuth.requireAdmin, (req, res) => {
  const ok = presence.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  // Alleen uit de lijst halen is niet genoeg: het token van die sessie wordt ook ongeldig.
  accessAuth.revokeSession(req.params.id);
  auditLog.appendEntry({ userId: req.shiftUser.id, email: req.shiftUser.email, action: 'auth.sessie_ingetrokken', targetKey: req.params.id });
  res.json({ success: true });
});

app.post('/api/admin/users', accessAuth.requireUser, accessAuth.requireAdmin, (req, res) => {
  const { email, password, role } = req.body || {};
  const result = accessAuth.createUser({ email, password, role });
  if (!result.success) return res.status(400).json(result);
  auditLog.appendEntry({ userId: req.shiftUser.id, email: req.shiftUser.email, action: 'auth.gebruiker_aangemaakt', targetKey: result.user.id, title: result.user.email, detail: { role: result.user.role } });
  res.json(result);
});

app.patch('/api/admin/users/:id', accessAuth.requireUser, accessAuth.requireAdmin, (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const result = accessAuth.updateUser(req.params.id, body, req.shiftUser);
  if (!result.success) {
    const code = result.error === 'NOT_FOUND' ? 404 : 400;
    return res.status(code).json(result);
  }
  auditLog.appendEntry({
    userId: req.shiftUser.id,
    email: req.shiftUser.email,
    action: 'auth.gebruiker_gewijzigd',
    targetKey: result.user.id,
    title: result.user.email,
    detail: { wachtwoord: !!body.password, role: result.user.role, enabled: result.user.enabled }
  });
  res.json(result);
});

app.delete('/api/admin/users/:id', accessAuth.requireUser, accessAuth.requireAdmin, (req, res) => {
  const result = accessAuth.deleteUser(req.params.id, req.shiftUser);
  if (!result.success) {
    const code = result.error === 'NOT_FOUND' ? 404 : 400;
    return res.status(code).json(result);
  }
  auditLog.appendEntry({ userId: req.shiftUser.id, email: req.shiftUser.email, action: 'auth.gebruiker_verwijderd', targetKey: req.params.id });
  res.json(result);
});

function protectApi(req, res, next) {
  if (!accessAuth.isAuthEnabled()) return next();
  return accessAuth.requireAuth(req, res, next);
}

// Health check (+ presence bij ingelogde clients)
app.get('/api/health', (req, res) => {
  const token = accessAuth.extractBearer(req);
  const user = token ? accessAuth.verifyToken(token) : null;
  if (user && token) {
    presence.upsert(token, user, req, {
      client: req.headers['x-shift-client'],
      view: req.headers['x-shift-view']
    });
  }
  if (accessAuth.isAuthEnabled() && !user) {
    return res.json({ ok: true, authRequired: true, presenceTracking: true });
  }
  res.json({
    ok: true,
    service: 'shift-happens-api',
    timerSync: true,
    authRequired: accessAuth.isAuthEnabled(),
    presenceTracking: true
  });
});

app.use('/api/voorstelling-timer', protectApi);
app.get('/api/voorstelling-timer/snapshots', (req, res) => {
  res.json(timerSync.listSnapshots());
});

app.get('/api/voorstelling-timer/snapshot/:key', (req, res) => {
  const result = timerSync.getSnapshot(req.params.key || '');
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.put('/api/voorstelling-timer/snapshot', (req, res) => {
  const result = timerSync.putSnapshot(isPlainObject(req.body) ? req.body : {});
  if (!result.success) {
    const code = result.conflict ? 409 : 400;
    return res.status(code).json(result);
  }
  res.json(result);
});

app.use('/api/trekkenlijst', protectApi);
app.get('/api/trekkenlijst/items', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(trekkenlijstSync.listItems());
});

app.get('/api/trekkenlijst/item/:key', (req, res) => {
  const result = trekkenlijstSync.getItem(req.params.key || '');
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.put('/api/trekkenlijst/item', (req, res) => {
  const body = isPlainObject(req.body) ? req.body : {};
  const actor = {
    userId: req.shiftUser?.id || null,
    email: req.shiftUser?.email || null,
    client: req.headers['x-shift-client'] || null
  };
  const result = trekkenlijstSync.putItem(body, actor);
  if (!result.success) {
    const code = result.conflict ? 409 : 400;
    return res.status(code).json(result);
  }
  res.json(result);
});

app.get('/api/admin/audit-log', accessAuth.requireUser, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { limit, email, action } = req.query || {};
  res.json(auditLog.listEntries({
    limit: limit != null ? Number(limit) : 100,
    email: typeof email === 'string' ? email : '',
    action: typeof action === 'string' ? action : ''
  }));
});

app.use('/api/config', protectApi);
app.get('/api/config/:system', (req, res) => {
  const system = req.params.system;
  if (!CONFIG_SYSTEMS.has(system)) {
    return res.status(404).json({ success: false, error: 'UNKNOWN_SYSTEM' });
  }
  if (system === 'app') {
    const user = req.shiftUser || null;
    const out = readAppConfigFor(user);
    if (user) {
      // Oudere clients lezen hun eigen login terug uit de config; die komt uit dit verzoek, niet uit de opslag.
      out.shiftAuthToken = req.shiftAuthToken || '';
      out.shiftAuthEmail = user.email;
    }
    return res.json(out);
  }
  const raw = store.get(system, {});
  res.json(CONNECTION_SYSTEMS.has(system) ? maskSecrets(raw) : raw);
});

app.post('/api/config', (req, res) => {
  const { system, config } = isPlainObject(req.body) ? req.body : {};
  if (typeof system !== 'string' || !CONFIG_SYSTEMS.has(system)) {
    return res.status(400).json({ success: false, error: 'UNKNOWN_SYSTEM' });
  }
  if (!isPlainObject(config)) {
    return res.status(400).json({ success: false, error: 'INVALID_CONFIG' });
  }
  const user = req.shiftUser || accessAuth.getRequestUser(req);

  if (system === 'app') {
    writeAppConfigFor(user, config);
    return res.json({ success: true });
  }

  if (system === 'voorstellingTimer') {
    const snapshots = isPlainObject(config.snapshots) ? config.snapshots : {};
    const clean = {};
    for (const [k, v] of Object.entries(snapshots)) {
      if (FORBIDDEN_OBJECT_KEYS.has(k) || k.length > 512 || !isPlainObject(v)) continue;
      clean[k] = v;
    }
    store.set('voorstellingTimer', { snapshots: clean });
    return res.json({ success: true });
  }

  // Koppelingen (Yesplan, Priva, Itix): alleen een beheerder mag adres of sleutel wijzigen.
  const stored = store.get(system, {});
  const next = mergeSecrets(config, stored);
  const badField = invalidBaseUrlField(next);
  if (badField) {
    return res.status(400).json({ success: false, error: 'INVALID_URL', field: badField });
  }
  if (stableStringify(withoutEmpty(next)) === stableStringify(withoutEmpty(mergeSecrets(stored, stored)))) {
    return res.json({ success: true, unchanged: true });
  }
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'ADMIN_REQUIRED' });
  }
  store.set(system, next);
  yesplanCache.clear();
  auditLog.appendEntry({
    userId: user.id,
    email: user.email,
    client: req.headers['x-shift-client'] || null,
    action: 'config.koppeling_gewijzigd',
    targetKey: system,
    detail: { velden: Object.keys(next).filter((k) => stableStringify(next[k]) !== stableStringify(stored[k])) }
  });
  res.json({ success: true });
});

app.use('/api/yesplan', protectApi);
app.use('/api/priva', protectApi);
app.post('/api/yesplan/data', async (req, res) => {
  try {
    const result = await getYesplanData(isPlainObject(req.body) ? req.body : {});
    res.json(result);
  } catch (e) {
    console.error('Yesplan data error:', e);
    res.status(500).json({ success: false, error: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/yesplan/venues', async (req, res) => {
  try {
    const params = isPlainObject(req.body) ? req.body : {};
    const result = await getYesplanVenues(params);
    res.json(result);
  } catch (e) {
    console.error('Yesplan venues error:', e);
    res.status(500).json({ success: false, error: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/yesplan/reservations', async (req, res) => {
  try {
    const result = await getYesplanReservations(isPlainObject(req.body) ? req.body : {});
    res.json(result);
  } catch (e) {
    console.error('Yesplan reservations error:', e);
    res.status(500).json({ success: false, error: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/yesplan/schedule', async (req, res) => {
  try {
    const { eventId, org } = isPlainObject(req.body) ? req.body : {};
    const result = await getYesplanSchedule(eventId, org);
    res.json(result);
  } catch (e) {
    console.error('Yesplan schedule error:', e);
    res.status(500).json({ success: false, error: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/priva/data', async (req, res) => {
  try {
    const priva = new PrivaAPI(secureConfigFromStorage(store.get('priva', {})));
    const result = await priva.getClimateData(isPlainObject(req.body) ? req.body : {});
    res.json(result);
  } catch (e) {
    console.error('Priva error:', e);
    res.status(500).json({ success: false, error: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/open-external', protectApi, (req, res) => {
  res.json({ success: true });
});

const controlpanelDir = path.join(__dirname, 'controlpanel');
app.use('/controlpanel', (req, res, next) => {
  res.set('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  next();
});
app.use('/controlpanel', staticLimiter, express.static(controlpanelDir, {
  etag: false,
  lastModified: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
    }
  }
}));
app.get('/controlpanel', staticLimiter, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(controlpanelDir, 'index.html'));
});

app.get('/', staticLimiter, (req, res) => {
  res.redirect('/controlpanel');
});

// Optioneel: serveer de web-ui vanaf dezelfde server (voor eenvoudige deploy)
const staticDir = path.join(__dirname, '..', 'renderer');
app.use('/app', staticLimiter, express.static(staticDir));
app.get('/app', staticLimiter, (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Onbekende API-routes en fouten: altijd JSON, nooit een stacktrace naar de client.
app.use('/api/', (req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large' || err instanceof URIError)) {
    return res.status(err.status || 400).json({ success: false, error: 'BAD_REQUEST' });
  }
  console.error('Serverfout:', err && err.code === 'CONFIG_CORRUPT' ? err.message : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
});

const HOST = process.env.SHIFT_HAPPENS_HOST || '0.0.0.0';
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Shift Happens API server op http://${HOST}:${PORT}`);
    console.log(`Config: ${store.path}`);
    if (accessAuth.needsBootstrap()) {
      console.log('');
      console.log('Nog geen beheerder ingesteld. Open /controlpanel en maak de eerste beheerder aan.');
      console.log(`Installatiecode (nodig vanaf een ander apparaat dan deze server): ${accessAuth.getSetupCode()}`);
      console.log('');
    }
  });
}

module.exports = app;
