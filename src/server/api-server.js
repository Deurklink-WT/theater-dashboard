/**
 * Shift Happens - API server voor iPhone/web clients
 * Zelfde logica als Electron IPC-handlers, via REST.
 * Start met: node src/server/api-server.js
 * @author PdV
 * @license UNLICENSED
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./store');

const YesplanAPI = require('../api/yesplan');
const ItixAPI = require('../api/itix');
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

const YESPLAN_CACHE_TTL_MS = 3 * 60 * 1000;
const YESPLAN_CACHE_MAX = 100;
const yesplanCache = new Map();

function yesplanCacheKey(params) {
  const { startDate, endDate, venueId } = params;
  const org = getActiveYesplanOrg();
  return `yesplan:org${org}:${startDate || ''}:${endDate || ''}:${venueId ?? 'all'}`;
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
  const apiParams = { startDate: params.startDate, endDate: params.endDate, venueId, limit: params.limit };
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

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'shift-happens-api' });
});

// Config
app.get('/api/config/:system', (req, res) => {
  const system = req.params.system;
  const raw = store.get(system, {});
  const out = ['yesplan', 'yesplan2', 'itix', 'priva'].includes(system)
    ? secureConfigFromStorage(raw)
    : raw;
  res.json(out);
});

app.post('/api/config', (req, res) => {
  const { system, config } = req.body;
  if (!system) return res.status(400).json({ success: false, error: 'system required' });
  const toStore = ['yesplan', 'yesplan2', 'itix', 'priva'].includes(system)
    ? secureConfigForStorage(config)
    : config;
  store.set(system, toStore);
  res.json({ success: true });
});

// Yesplan
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

// Itix
app.post('/api/itix/data', async (req, res) => {
  try {
    const itix = new ItixAPI(secureConfigFromStorage(store.get('itix', {})));
    const result = await itix.getEvents(req.body || {});
    res.json(result);
  } catch (e) {
    console.error('Itix error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Priva
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

// Open external: server doet niets, client opent URL zelf
app.post('/api/open-external', (req, res) => {
  res.json({ success: true });
});

// Optioneel: serveer de web-ui vanaf dezelfde server (voor eenvoudige deploy)
const staticDir = path.join(__dirname, '..', 'renderer');
app.use('/app', express.static(staticDir));
app.get('/app', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Shift Happens API server op http://0.0.0.0:${PORT}`);
  console.log(`Config: ${store.path}`);
});
