/**image.png
 * Shift Happens - Theater Dashboard
 * Copyright (c) 2026 PdV
 * 
 * Proprietary software - All rights reserved
 * 
 * @author PdV
 * @license UNLICENSED
 */

const { app, BrowserWindow, ipcMain, Menu, shell, screen, safeStorage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const cron = require('node-cron');
const VERBOSE_RUNTIME_LOGS = process.argv.includes('--dev') || process.argv.includes('--yesplan-search') || process.argv.includes('--personnel-wtpy');
function runtimeLog(...args) {
  if (VERBOSE_RUNTIME_LOGS) console.log(...args);
}

// Configuratie store
// Opslag locatie:
// macOS: ~/Library/Application Support/Shift Happens/config.json
// Windows: %APPDATA%/Shift Happens/config.json
const store = new Store({
  name: 'config'
});

// Versleuteling voor gevoelige velden (apiKey)
const SENSITIVE_KEYS = ['apiKey'];
function encryptIfAvailable(text) {
  if (!text || typeof text !== 'string') return { encrypted: null, plain: text };
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const buf = safeStorage.encryptString(text);
      return { encrypted: buf.toString('base64'), plain: null };
    }
  } catch (e) { /* fallback to plain */ }
  return { encrypted: null, plain: text };
}
function decryptIfEncrypted(encrypted, plain) {
  if (plain) return plain;
  if (!encrypted) return '';
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    }
  } catch (e) { console.error('Decrypt error:', e.message); }
  return '';
}
function secureConfigForStorage(config) {
  const out = { ...config };
  for (const key of SENSITIVE_KEYS) {
    if (out[key]) {
      const { encrypted, plain } = encryptIfAvailable(out[key]);
      if (encrypted) {
        out[`_${key}Encrypted`] = encrypted;
        delete out[key];
      } else if (!plain) {
        delete out[key];
      }
    }
  }
  return out;
}
function secureConfigFromStorage(config) {
  if (!config) return config;
  const out = { ...config };
  for (const key of SENSITIVE_KEYS) {
    const encKey = `_${key}Encrypted`;
    if (out[encKey] || out[key]) {
      out[key] = decryptIfEncrypted(out[encKey], out[key]);
      delete out[encKey];
    }
  }
  return out;
}

// API services
const YesplanAPI = require('./api/yesplan');
const PrivaAPI = require('./api/priva');
const { setupAutoUpdater, checkForUpdatesNow, quitAndInstallUpdate } = require('./updater');

// Yesplan response cache (vermindert serverbelasting bij navigatie)
// Standaard ruim: 6 uur. Overschrijfbaar via env var.
const YESPLAN_CACHE_TTL_MS = Number(process.env.YESPLAN_CACHE_TTL_MS || (6 * 60 * 60 * 1000));
const YESPLAN_CACHE_MAX = 100;
const yesplanCache = new Map();
const YESPLAN_VENUES_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 uur
const yesplanApiInstances = new Map();

function getYesplanConfig(org) {
  const key = org === 2 ? 'yesplan2' : 'yesplan';
  return secureConfigFromStorage(store.get(key, {}));
}

function getActiveYesplanOrg() {
  const appConfig = store.get('app', {});
  const v = appConfig.activeYesplanOrg;
  return v === 'both' ? 'both' : (v === 2 ? 2 : 1);
}

function getYesplanApi(config = {}) {
  const baseURL = String(config.baseURL || '').trim();
  const apiKey = String(config.apiKey || '').trim();
  const org = String(config.organizationId || '');
  const key = `${baseURL}|${apiKey}|${org}`;
  if (!baseURL || !apiKey) return new YesplanAPI(config);
  const existing = yesplanApiInstances.get(key);
  if (existing) return existing;
  const api = new YesplanAPI(config);
  yesplanApiInstances.set(key, api);
  if (yesplanApiInstances.size > 12) {
    const firstKey = yesplanApiInstances.keys().next().value;
    if (firstKey) yesplanApiInstances.delete(firstKey);
  }
  return api;
}

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

function venuesCacheStoreGetAll() {
  const obj = store.get('yesplanVenuesCache', {});
  return (obj && typeof obj === 'object') ? obj : {};
}

function venuesCacheStoreSetEntry(key, data) {
  const all = venuesCacheStoreGetAll();
  all[key] = { ts: Date.now(), data };
  store.set('yesplanVenuesCache', all);
}

function venuesCacheStoreGetFresh(key) {
  const all = venuesCacheStoreGetAll();
  const ent = all[key];
  if (!ent || typeof ent !== 'object') return null;
  if ((Date.now() - Number(ent.ts || 0)) > YESPLAN_VENUES_CACHE_TTL_MS) return null;
  return ent.data || null;
}

function venuesCacheStoreGetAny(key) {
  const all = venuesCacheStoreGetAll();
  const ent = all[key];
  return (ent && typeof ent === 'object') ? (ent.data || null) : null;
}

let mainWindow;

function createWindow() {
  // Check voor kiosk mode argument
  const isKioskMode = process.argv.includes('--kiosk') || process.env.KIOSK_MODE === 'true';

  // Op macOS: venster beeldvullend (work area) zodat maximize/groene knop goed werkt
  let winOpts = { width: 1400, height: 900 };
  if (process.platform === 'darwin' && !isKioskMode) {
    const { workArea } = screen.getPrimaryDisplay();
    winOpts = { x: workArea.x, y: workArea.y, width: workArea.width, height: workArea.height };
  }

  // Hoofdvenster aanmaken
  mainWindow = new BrowserWindow({
    ...winOpts,
    minWidth: 1200,
    minHeight: 800,
    fullscreen: isKioskMode,
    fullscreenable: true, // Groene plus-knop op Mac doet beeldvullend fullscreen
    kiosk: isKioskMode,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS stijl
    show: false
  });

  // HTML laden
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Venster tonen wanneer klaar
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Op Mac: groene plus-knop → forceer fullscreen als zoom niet beeldvullend is
  if (process.platform === 'darwin' && !isKioskMode) {
    mainWindow.on('maximize', () => {
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      }
    });
  }

  // DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Context menu met plakken functionaliteit
  const { Menu: ContextMenu } = require('electron');
  
  mainWindow.webContents.on('context-menu', (event, params) => {
    const contextMenu = ContextMenu.buildFromTemplate([
      { role: 'cut', label: 'Knippen' },
      { role: 'copy', label: 'Kopiëren' },
      { role: 'paste', label: 'Plakken' },
      { type: 'separator' },
      { role: 'selectAll', label: 'Alles selecteren' }
    ]);
    
    contextMenu.popup();
  });

  // Menu setup
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Theater Dashboard',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Bewerken',
      submenu: [
        { role: 'undo', label: 'Ongedaan maken' },
        { role: 'redo', label: 'Opnieuw' },
        { type: 'separator' },
        { role: 'cut', label: 'Knippen' },
        { role: 'copy', label: 'Kopiëren' },
        { role: 'paste', label: 'Plakken' },
        { role: 'pasteAndMatchStyle', label: 'Plakken en stijl aanpassen' },
        { role: 'selectAll', label: 'Alles selecteren' },
        { type: 'separator' },
        { role: 'delete', label: 'Verwijderen' }
      ]
    },
    {
      label: 'Configuratie',
      submenu: [
        {
          label: 'API Instellingen',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Data Vernieuwen',
          click: () => {
            mainWindow.webContents.send('refresh-data');
          }
        }
      ]
    },
    {
      label: 'Weergave',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle('get-yesplan-data', async (event, params) => {
  try {
    const skipCache = !!params.skipCache;
    let venueId = params.venueId;
    const activeOrg = getActiveYesplanOrg();
    const includeEventDetailsForWeekFilters = !!params.includeEventDetailsForWeekFilters;

    // Bij "both" en composite venueId "1:123" → alleen die org met die venue ophalen
    let singleOrg = null;
    if (activeOrg === 'both' && venueId && String(venueId).includes(':')) {
      const [orgPart, idPart] = String(venueId).split(':');
      singleOrg = orgPart === '2' ? 2 : 1;
      venueId = idPart || undefined;
    }
    const apiParams = { startDate: params.startDate, endDate: params.endDate, venueId, limit: params.limit, includeEventDetailsForWeekFilters };
    const key = yesplanCacheKey(apiParams);
    const isWeekRequest = params.startDate && params.endDate && params.startDate !== params.endDate;

    const fetchWeek = (api, orgId) => {
      const promise = isWeekRequest
        ? api.getEventsForWeek(apiParams)
        : api.getEvents(apiParams);
      return promise.then((r) => (r?.success && r?.data ? r.data.map((e) => ({ ...e, _organizationId: orgId })) : []));
    };

    if (activeOrg === 'both' && singleOrg === null) {
      const config1 = getYesplanConfig(1);
      const config2 = getYesplanConfig(2);
      if (!config1.baseURL || !config1.apiKey || !config2.baseURL || !config2.apiKey) {
        return { success: false, data: [], timestamp: new Date().toISOString() };
      }
      if (!skipCache) {
        const cached = yesplanCacheGet(key);
        if (cached) return cached;
      }
      const [data1, data2] = await Promise.all([
        fetchWeek(getYesplanApi(config1), 1),
        fetchWeek(getYesplanApi(config2), 2)
      ]);
      const merged = [...data1, ...data2].sort((a, b) => {
        const tA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const tB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return tA - tB;
      });
      const result = { success: true, data: merged, timestamp: new Date().toISOString() };
      if (merged.length > 0 || params.startDate === params.endDate) yesplanCacheSet(key, result);
      return result;
    }

    const orgNum = singleOrg ?? (activeOrg === 2 ? 2 : 1);
    const singleConfig = getYesplanConfig(orgNum);
    if (!singleConfig.baseURL || !singleConfig.apiKey) {
      return { success: false, data: [], timestamp: new Date().toISOString(), error: 'Yesplan config ontbreekt (baseURL/apiKey)' };
    }
    if (!skipCache) {
      const cached = yesplanCacheGet(key);
      if (cached) return cached;
    }
    const yesplan = getYesplanApi(singleConfig);
    const result = isWeekRequest
      ? await yesplan.getEventsForWeek(apiParams)
      : await yesplan.getEvents(apiParams);
    if (result && result.success) {
      const data = (result.data || []).map(e => ({ ...e, _organizationId: orgNum }));
      const out = { ...result, data };
      if (data.length > 0 || params.startDate === params.endDate) yesplanCacheSet(key, out);
      return out;
    }
    return result;
  } catch (error) {
    console.error('Yesplan API error:', error);
    throw error;
  }
});

ipcMain.handle('get-yesplan-event-personnel', async (event, { eventId }) => {
  if (!eventId) return { success: false, data: null };
  try {
    const activeOrg = getActiveYesplanOrg();
    const orgs = activeOrg === 'both' ? [1, 2] : [activeOrg];
    for (const org of orgs) {
      const config = getYesplanConfig(org);
      if (!config.baseURL || !config.apiKey) continue;
      const api = getYesplanApi(config);
      const urenInfo = await api.getEventPersonnel(eventId);
      const hasAny = (urenInfo.techniek?.length || 0) + (urenInfo.horeca?.length || 0) + (urenInfo.frontOffice?.length || 0) + (urenInfo.nostradamus?.length || 0) > 0;
      if (hasAny) return { success: true, data: urenInfo };
    }
    return { success: true, data: { techniek: [], horeca: [], frontOffice: [], nostradamus: [] } };
  } catch (err) {
    console.error('get-yesplan-event-personnel error:', err);
    return { success: false, data: null };
  }
});

/** Personeel voor een datum (en optioneel zaal): haalt events op voor die dag en per event de customdata-personeel. */
ipcMain.handle('get-yesplan-personnel-for-date', async (event, params) => {
  let { startDate, endDate, venueId } = params || {};
  const venueRaw = venueId != null ? String(venueId).trim() : '';
  const venueOrg = venueRaw && venueRaw.includes(':') ? Number(venueRaw.split(':')[0]) : null;
  const venueOnlyId = venueRaw && venueRaw.includes(':') ? String(venueRaw.split(':').slice(1).join(':')).trim() : venueRaw;
  venueId = venueOnlyId || undefined;
  const date = startDate && endDate ? startDate : (startDate || new Date().toISOString().slice(0, 10));
  const start = date;
  const end = endDate || date;
  runtimeLog('[Personeel] Aanroep: datum=', start, 'venueId=', venueId || 'alle', 'venueOrg=', venueOrg || 'alle');
  try {
    const activeOrg = getActiveYesplanOrg();
    const orgs = activeOrg === 'both'
      ? (venueOrg ? [venueOrg] : [1, 2])
      : [activeOrg];
    const merged = { techniek: [], horeca: [], frontOffice: [], nostradamus: [] };
    let hadValidConfig = false;
    for (const org of orgs) {
      const config = getYesplanConfig(org);
      if (!config.baseURL || !config.apiKey) {
        runtimeLog('[Personeel] Org', org, ': geen Yesplan-config (baseURL/apiKey). In Shift Happens: Instellingen → Yesplan invullen.');
        continue;
      }
      hadValidConfig = true;
      const api = getYesplanApi(config);
      let raw = await api.getRawEvents({ startDate: start, endDate: end, venueId, limit: 50 });
      let events = raw?.data || [];
      if (venueId && events.length === 0) {
        raw = await api.getRawEvents({ startDate: start, endDate: end, limit: 50 });
        const retryEvents = raw?.data || [];
        const vid = String(venueId).toUpperCase().trim();
        events = retryEvents.filter((ev) => {
          const locs = Array.isArray(ev?.locations) ? ev.locations : [];
          return locs.some((loc) =>
            String(loc?.id || '').toUpperCase().trim() === vid ||
            String(loc?.name || '').toUpperCase().trim() === vid
          );
        });
      }
      runtimeLog('[Personeel] Org', org, ': events=', events.length);
      for (const ev of events) {
        const id = ev.id;
        if (!id) continue;
        const urenInfo = await api.getEventPersonnel(id);
        if (urenInfo.techniek?.length) merged.techniek = merged.techniek.concat(urenInfo.techniek);
        if (urenInfo.horeca?.length) merged.horeca = merged.horeca.concat(urenInfo.horeca);
        if (urenInfo.frontOffice?.length) merged.frontOffice = merged.frontOffice.concat(urenInfo.frontOffice);
        if (urenInfo.nostradamus?.length) merged.nostradamus = merged.nostradamus.concat(urenInfo.nostradamus);
      }
    }
    const total = merged.techniek.length + merged.horeca.length + merged.frontOffice.length + merged.nostradamus.length;
    if (!hadValidConfig) {
      runtimeLog('[Personeel] Geen geldige Yesplan-config in deze app. Gebruik Instellingen → Yesplan (org 1/2) en vul base URL + API-key in.');
    }
    runtimeLog('[Personeel] Resultaat: techniek=', merged.techniek.length, 'horeca=', merged.horeca.length, 'frontOffice=', merged.frontOffice.length, 'totaal=', total);
    return { success: true, data: merged };
  } catch (err) {
    console.error('[Personeel] Fout:', err);
    return { success: false, data: { techniek: [], horeca: [], frontOffice: [], nostradamus: [] } };
  }
});

ipcMain.handle('get-yesplan-search', async (event, { query }) => {
  runtimeLog('[Search] IPC query:', query);
  if (!query || String(query).trim().length < 2) {
    return { success: true, data: [], timestamp: new Date().toISOString() };
  }
  try {
    const activeOrg = getActiveYesplanOrg();
    if (activeOrg === 'both') {
      const config1 = getYesplanConfig(1);
      const config2 = getYesplanConfig(2);
      const requests = [];
      if (config1.baseURL && config1.apiKey) requests.push({ org: 1, api: getYesplanApi(config1) });
      if (config2.baseURL && config2.apiKey) requests.push({ org: 2, api: getYesplanApi(config2) });
      if (requests.length === 0) {
        return { success: false, data: [], timestamp: new Date().toISOString() };
      }
      const settled = await Promise.allSettled(
        requests.map(async ({ org, api }) => ({ org, result: await api.getEventsBySearch(query) }))
      );
      const mergedRaw = [];
      settled.forEach((s) => {
        if (s.status !== 'fulfilled') return;
        const org = s.value.org;
        const r = s.value.result;
        if (r?.success && Array.isArray(r.data)) {
          mergedRaw.push(...r.data.map(e => ({ ...e, _organizationId: org })));
        }
      });
      const merged = mergedRaw.sort((a, b) => {
        const tA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const tB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return tA - tB;
      });
      runtimeLog('[Search] both orgs result count:', merged.length);
      return { success: true, data: merged, timestamp: new Date().toISOString() };
    }
    const orgNum = activeOrg === 2 ? 2 : 1;
    const yesplan = getYesplanApi(getYesplanConfig(orgNum));
    const result = await yesplan.getEventsBySearch(query);
    if (result?.success && result.data) {
      const data = (result.data || []).map(e => ({ ...e, _organizationId: orgNum }));
      runtimeLog('[Search] single org result count:', data.length);
      return { ...result, data };
    }
    return result || { success: false, data: [], timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Yesplan search error:', error);
    return {
      success: false,
      data: [],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

ipcMain.handle('get-yesplan-venues', async (event, params = {}) => {
  try {
    const skipCache = !!params.skipCache || !!params.forceRefresh;
    const org = params.org;
    if (org === 'both') {
      const config1 = getYesplanConfig(1);
      const config2 = getYesplanConfig(2);
      if (!config1.baseURL || !config1.apiKey || !config2.baseURL || !config2.apiKey) {
        return { success: false, data: [] };
      }
      const cacheKey = `yesplan:venues:both:${String(config1.baseURL).trim()}|${String(config2.baseURL).trim()}`;
      if (!skipCache) {
        const cached = venuesCacheStoreGetFresh(cacheKey);
        if (cached) return { success: true, data: cached, timestamp: new Date().toISOString(), _fromCache: true };
      }
      const [r1, r2] = await Promise.all([
        getYesplanApi(config1).getVenues(),
        getYesplanApi(config2).getVenues()
      ]);
      const label1 = (config1.name && String(config1.name).trim()) || 'Org 1';
      const label2 = (config2.name && String(config2.name).trim()) || 'Org 2';
      const v1 = (r1?.success && r1?.data) ? r1.data.map(v => ({ ...v, id: `1:${v.id}`, _organizationId: 1, name: `${v.name || 'Zaal'} (${label1})` })) : [];
      const v2 = (r2?.success && r2?.data) ? r2.data.map(v => ({ ...v, id: `2:${v.id}`, _organizationId: 2, name: `${v.name || 'Zaal'} (${label2})` })) : [];
      const merged = [...v1, ...v2];
      if (merged.length > 0) {
        venuesCacheStoreSetEntry(cacheKey, merged);
      } else {
        const stale = venuesCacheStoreGetAny(cacheKey);
        if (stale && stale.length > 0) return { success: true, data: stale, timestamp: new Date().toISOString(), _fromCache: true, _stale: true };
      }
      return { success: true, data: merged };
    }
    const orgNum = org === 2 ? 2 : 1;
    const config = getYesplanConfig(orgNum);
    const cacheKey = `yesplan:venues:org${orgNum}:${String(config.baseURL || '').trim()}`;
    if (!skipCache) {
      const cached = venuesCacheStoreGetFresh(cacheKey);
      if (cached) return { success: true, data: cached, timestamp: new Date().toISOString(), _fromCache: true };
    }
    const yesplan = getYesplanApi(config);
    const result = await yesplan.getVenues();
    if (result?.success && Array.isArray(result.data) && result.data.length > 0) {
      venuesCacheStoreSetEntry(cacheKey, result.data);
      return result;
    }
    const stale = venuesCacheStoreGetAny(cacheKey);
    if (stale && stale.length > 0) {
      return { success: true, data: stale, timestamp: new Date().toISOString(), _fromCache: true, _stale: true };
    }
    return result;
  } catch (error) {
    console.error('Yesplan Venues API error:', error);
    throw error;
  }
});

ipcMain.handle('get-yesplan-schedule', async (event, eventId, org) => {
  try {
    const orgNum = (org === 2 ? 2 : 1);
    const yesplan = getYesplanApi(getYesplanConfig(orgNum));
    const result = await yesplan.getSchedule(eventId);
    if (process.argv.includes('--dev') && result?.data) {
      console.log('Yesplan schedule raw response for', eventId, ':', JSON.stringify(result.data).slice(0, 500));
    }
    return result;
  } catch (error) {
    console.error('Yesplan Schedule API error:', error);
    throw error;
  }
});

ipcMain.handle('get-yesplan-reservations', async (event, params) => {
  try {
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
        getYesplanApi(config1).getReservations(apiParams),
        getYesplanApi(config2).getReservations(apiParams)
      ]);
      const d1 = (r1?.success && r1?.data) ? r1.data : [];
      const d2 = (r2?.success && r2?.data) ? r2.data : [];
      return { success: true, data: [...d1, ...d2] };
    }
    const orgNum = singleOrg ?? (activeOrg === 2 ? 2 : 1);
    const yesplan = getYesplanApi(getYesplanConfig(orgNum));
    return await yesplan.getReservations(apiParams);
  } catch (error) {
    console.error('Yesplan Reservations API error:', error);
    throw error;
  }
});

// Uurwerk API handler verwijderd - data komt nu uit Yesplan

ipcMain.handle('get-priva-data', async (event, params) => {
  try {
    const priva = new PrivaAPI(secureConfigFromStorage(store.get('priva', {})));
    return await priva.getClimateData(params);
  } catch (error) {
    console.error('Priva API error:', error);
    throw error;
  }
});

ipcMain.handle('save-config', async (event, system, config) => {
  try {
    const allowedSystems = new Set(['yesplan', 'yesplan2', 'priva', 'itix', 'app']);
    if (!allowedSystems.has(system)) {
      return { success: false, error: 'Invalid config system' };
    }
    const sensitiveSystem = ['yesplan', 'yesplan2', 'priva'].includes(system);
    const apiKey = String(config?.apiKey || '').trim();
    if (sensitiveSystem && apiKey && !safeStorage.isEncryptionAvailable()) {
      return {
        success: false,
        error: 'SECURE_STORAGE_UNAVAILABLE',
        message: 'API key kon niet veilig worden opgeslagen op dit systeem.'
      };
    }
    const toStore = ['yesplan', 'yesplan2', 'priva'].includes(system)
      ? secureConfigForStorage(config)
      : config;
    store.set(system, toStore);
    return { success: true };
  } catch (error) {
    console.error('Config save error:', error);
    throw error;
  }
});

ipcMain.handle('get-config', async (event, system) => {
  const allowedSystems = new Set(['yesplan', 'yesplan2', 'priva', 'itix', 'app']);
  if (!allowedSystems.has(system)) return {};
  const raw = store.get(system, {});
  if (!['yesplan', 'yesplan2', 'priva'].includes(system)) return raw;
  const config = secureConfigFromStorage(raw);
  // Best effort migratie: bestaande plaintext API key direct opnieuw versleuteld opslaan.
  if (raw?.apiKey && safeStorage.isEncryptionAvailable()) {
    try {
      store.set(system, secureConfigForStorage(config));
    } catch (_) {
      // Niet blokkeren op migratiefout; config blijft bruikbaar in runtime.
    }
  }
  return config;
});

// Toegestane domeinen voor externe links (voorkomt open-redirect)
const ALLOWED_EXTERNAL_HOSTS = [
  'yesplan.nl', 'yesplan.com',
  'priva.nl'
];
function getConfiguredExternalHosts() {
  const hosts = [];
  const systems = ['yesplan', 'yesplan2', 'priva', 'itix'];
  systems.forEach((system) => {
    const cfg = secureConfigFromStorage(store.get(system, {}));
    const url = String(cfg?.baseURL || '').trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' && parsed.hostname) hosts.push(parsed.hostname.toLowerCase());
    } catch (_) {
      // Negeer ongeldige URL in config.
    }
  });
  return hosts;
}
function isUrlAllowed(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    const allowlist = Array.from(new Set([...ALLOWED_EXTERNAL_HOSTS, ...getConfiguredExternalHosts()]));
    return allowlist.some(allowed => host === allowed || host.endsWith('.' + allowed));
  } catch (e) {
    return false;
  }
}

ipcMain.handle('open-external', async (event, url) => {
  try {
    if (!isUrlAllowed(url)) {
      console.warn('Blocked external URL (not in allowlist):', url?.substring(0, 50));
      return { success: false, error: 'URL not allowed' };
    }
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-for-updates', async () => checkForUpdatesNow());

ipcMain.handle('quit-and-install-update', async () => quitAndInstallUpdate());


// Automatische data vernieuwing elke 4 uur
cron.schedule('0 */4 * * *', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('auto-refresh');
  }
});

// CLI: personeel vandaag WTPY / Yentl en Boer naar console (gebruikt gedecrypte config)
const PERSONNEL_CLI = process.argv.includes('--personnel-wtpy');
const SEARCH_CLI = process.argv.includes('--yesplan-search');
const SEARCH_TERM = (() => {
  const i = process.argv.indexOf('--yesplan-search');
  return i >= 0 ? (process.argv.slice(i + 1).join(' ').trim() || 'west side story') : '';
})();
async function runPersonnelCli() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const activeOrg = getActiveYesplanOrg();
  const configs = [];
  if (activeOrg === 'both') {
    const c1 = getYesplanConfig(1), c2 = getYesplanConfig(2);
    if (c1.baseURL && c1.apiKey) configs.push({ org: 1, ...c1 });
    if (c2.baseURL && c2.apiKey) configs.push({ org: 2, ...c2 });
  } else {
    const c = getYesplanConfig(activeOrg);
    if (c.baseURL && c.apiKey) configs.push({ org: activeOrg, ...c });
  }
  if (!configs.length) {
    console.error('Geen Yesplan-config met baseURL + apiKey.');
    app.quit();
    return;
  }
  const allEvents = [];
  for (const { org, baseURL, apiKey } of configs) {
    const api = new YesplanAPI({ baseURL, apiKey });
    const result = await api.getEvents({ startDate: todayStr, endDate: todayStr, limit: 100 });
    if (result.success && result.data) allEvents.push(...result.data.map(e => ({ ...e, _org: org })));
  }
  const venueStr = (e) => (e.locations || []).map(l => l?.name || l?.id || l).join(', ') || (e.venueIds || []).join(', ') || e.venue || '';
  const hasWtpy = (e) => {
    const s = venueStr(e).toUpperCase() + (e.venueIds || []).join(',').toUpperCase();
    return s.includes('WTPY');
  };
  const wtpyEvents = allEvents.filter(e => hasWtpy(e));
  const yentlEvents = allEvents.filter(e => {
    const n = (e.name || e.title || '').toLowerCase();
    const p = (e.performer || e.groupName || '').toLowerCase();
    return n.includes('yentl') || n.includes('rekhalzen') || p.includes('yentl') || p.includes('boer');
  });
  const toShow = wtpyEvents.length ? wtpyEvents : (yentlEvents.length ? yentlEvents : allEvents);
  if (!toShow.length) {
    console.log('Geen events voor vandaag. Opgehaald:', allEvents.length, 'events.');
    app.quit();
    return;
  }
  if (allEvents.length && !wtpyEvents.length) console.log('(Geen events met zaal WTPY; toon alle events van vandaag met personeel)\n');
  for (const event of toShow) {
    const u = event.urenInfo || {};
    const t = (u.techniek || []).filter(Boolean);
    const h = (u.horeca || []).filter(Boolean);
    const f = (u.frontOffice || []).filter(Boolean);
    console.log('\n---', event.name || event.title, '|', event.performer || event.groupName || '', '---');
    if (t.length || h.length || f.length) {
      if (t.length) { console.log('Techniek:'); t.forEach(l => console.log(' ', l)); }
      if (h.length) { console.log('Horeca:'); h.forEach(l => console.log(' ', l)); }
      if (f.length) { console.log('Front Office:'); f.forEach(l => console.log(' ', l)); }
    } else console.log('Geen personeelsplanning voor dit event.');
  }
  console.log('');
  app.quit();
}

async function runYesplanSearchCli() {
  const term = SEARCH_TERM;
  const activeOrg = getActiveYesplanOrg();
  const configs = [];
  if (activeOrg === 'both') {
    const c1 = getYesplanConfig(1), c2 = getYesplanConfig(2);
    if (c1.baseURL && c1.apiKey) configs.push({ org: 1, ...c1 });
    if (c2.baseURL && c2.apiKey) configs.push({ org: 2, ...c2 });
  } else {
    const c = getYesplanConfig(activeOrg);
    if (c.baseURL && c.apiKey) configs.push({ org: activeOrg, ...c });
  }
  if (!configs.length) {
    console.error('Geen Yesplan-config met baseURL + apiKey.');
    app.quit();
    return;
  }
  const all = [];
  for (const { org, baseURL, apiKey } of configs) {
    const api = new YesplanAPI({ baseURL, apiKey });
    const r = await api.getEventsBySearch(term);
    const arr = (r?.success && Array.isArray(r.data)) ? r.data : [];
    all.push(...arr.map(e => ({ ...e, _org: org })));
  }
  const seen = new Set();
  const uniq = [];
  for (const e of all) {
    const id = `${e._org}:${e.id}`;
    if (!seen.has(id)) { seen.add(id); uniq.push(e); }
  }
  console.log(`Zoekterm: ${term}`);
  console.log(`Resultaten: ${uniq.length}`);
  uniq.slice(0, 40).forEach((e, i) => {
    const d = e.startDate ? String(e.startDate).slice(0, 10) : 'onbekende datum';
    console.log(`${i + 1}. [org ${e._org}] ${e.title || e.name || 'Onbekend'} | ${d} | ${e.venue || ''}`);
  });
  app.quit();
}

// App event handlers
app.whenReady().then(() => {
  if (PERSONNEL_CLI) return runPersonnelCli();
  if (SEARCH_CLI) return runYesplanSearchCli();
  createWindow();
  setupAutoUpdater(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

