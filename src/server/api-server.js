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
function secureConfigForStorage(config) {
  return { ...config };
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

app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// --- Auth (whitelist e-mail/wachtwoord) ---
app.get('/api/auth/status', (req, res) => {
  res.json({
    success: true,
    needsBootstrap: accessAuth.needsBootstrap(),
    authEnabled: accessAuth.isAuthEnabled()
  });
});

app.post('/api/auth/bootstrap', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  const result = accessAuth.bootstrapAdmin({ email, password });
  if (!result.success) return res.status(400).json(result);
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

app.get('/api/admin/users', accessAuth.requireAuth, accessAuth.requireAdmin, (req, res) => {
  res.json({ success: true, users: accessAuth.listUsers() });
});

app.get('/api/admin/connections', accessAuth.requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const connections = presence.listActive();
  res.json({
    success: true,
    staleAfterSeconds: Math.round(presence.STALE_MS / 1000),
    count: connections.length,
    connections
  });
});

app.delete('/api/admin/connections/:id', accessAuth.requireAuth, accessAuth.requireAdmin, (req, res) => {
  const ok = presence.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  res.json({ success: true });
});

app.post('/api/admin/users', accessAuth.requireAuth, accessAuth.requireAdmin, (req, res) => {
  const { email, password, role } = req.body || {};
  const result = accessAuth.createUser({ email, password, role });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.patch('/api/admin/users/:id', accessAuth.requireAuth, accessAuth.requireAdmin, (req, res) => {
  const result = accessAuth.updateUser(req.params.id, req.body || {}, req.shiftUser);
  if (!result.success) {
    const code = result.error === 'NOT_FOUND' ? 404 : 400;
    return res.status(code).json(result);
  }
  res.json(result);
});

app.delete('/api/admin/users/:id', accessAuth.requireAuth, accessAuth.requireAdmin, (req, res) => {
  const result = accessAuth.deleteUser(req.params.id, req.shiftUser);
  if (!result.success) {
    const code = result.error === 'NOT_FOUND' ? 404 : 400;
    return res.status(code).json(result);
  }
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
  const key = decodeURIComponent(req.params.key || '');
  const result = timerSync.getSnapshot(key);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.put('/api/voorstelling-timer/snapshot', (req, res) => {
  const result = timerSync.putSnapshot(req.body || {});
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
  const key = decodeURIComponent(req.params.key || '');
  const result = trekkenlijstSync.getItem(key);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.put('/api/trekkenlijst/item', (req, res) => {
  const body = req.body || {};
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

app.get('/api/admin/audit-log', accessAuth.requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { limit, email, action } = req.query || {};
  res.json(auditLog.listEntries({
    limit: limit != null ? Number(limit) : 100,
    email: email || '',
    action: action || ''
  }));
});

app.use('/api/config', protectApi);
app.get('/api/config/:system', (req, res) => {
  const system = req.params.system;
  const raw = store.get(system, {});
  const out = ['yesplan', 'yesplan2', 'priva'].includes(system)
    ? secureConfigFromStorage(raw)
    : raw;
  res.json(out);
});

app.post('/api/config', (req, res) => {
  const { system, config } = req.body;
  if (!system) return res.status(400).json({ success: false, error: 'system required' });
  const toStore = ['yesplan', 'yesplan2', 'priva'].includes(system)
    ? secureConfigForStorage(config)
    : config;
  store.set(system, toStore);
  res.json({ success: true });
});

app.use('/api/yesplan', protectApi);
app.use('/api/priva', protectApi);
app.post('/api/yesplan/data', async (req, res) => {
  try {
    const result = await getYesplanData(req.body || {});
    res.json(result);
  } catch (e) {
    console.error('Yesplan data error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/yesplan/venues', async (req, res) => {
  try {
    const params = req.body || {};
    const result = await getYesplanVenues(params);
    res.json(result);
  } catch (e) {
    console.error('Yesplan venues error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/yesplan/reservations', async (req, res) => {
  try {
    const result = await getYesplanReservations(req.body || {});
    res.json(result);
  } catch (e) {
    console.error('Yesplan reservations error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/yesplan/schedule', async (req, res) => {
  try {
    const { eventId, org } = req.body || {};
    const result = await getYesplanSchedule(eventId, org);
    res.json(result);
  } catch (e) {
    console.error('Yesplan schedule error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/priva/data', async (req, res) => {
  try {
    const priva = new PrivaAPI(secureConfigFromStorage(store.get('priva', {})));
    const result = await priva.getClimateData(req.body || {});
    res.json(result);
  } catch (e) {
    console.error('Priva error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/open-external', protectApi, (req, res) => {
  res.json({ success: true });
});

const controlpanelDir = path.join(__dirname, 'controlpanel');
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

app.listen(PORT, () => {
  console.log(`Shift Happens API server op http://0.0.0.0:${PORT}`);
  console.log(`Config: ${store.path}`);
});
