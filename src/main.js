/**
 * Shift Happens - Theater Dashboard
 * Copyright (c) 2026 Team
 * 
 * Proprietary software - All rights reserved
 * 
 * @author Team
 * @license UNLICENSED
 */

const { app, BrowserWindow, ipcMain, Menu, shell, screen, safeStorage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const cron = require('node-cron');
const os = require('os');
const { MasterModeService } = require('./main/master-mode');
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
const { setupAutoUpdater, checkForUpdatesNow, downloadUpdateNow, quitAndInstallUpdate } = require('./updater');
const { startOscTimerListener } = require('./main/osc-timer-listener');
const { browseLuminodes } = require('./main/luminode-discovery');
const { scanSacnUniverses } = require('./main/sacn-scan');
const { getLumiNodeCapabilities, fetchJson, writeJson } = require('./main/luminode-api');
const {
  startLuminexViewerServer,
  stopLuminexViewerServer,
  getLuminexViewerUrl,
  reloadLuminexViewerConfig,
} = require('./main/luminex-viewer-server');

// Yesplan response cache (vermindert serverbelasting bij navigatie)
// Standaard ruim: 6 uur. Overschrijfbaar via env var.
const YESPLAN_CACHE_TTL_MS = Number(process.env.YESPLAN_CACHE_TTL_MS || (6 * 60 * 60 * 1000));
const YESPLAN_CACHE_MAX = 100;
const yesplanCache = new Map();
const YESPLAN_VENUES_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 uur
const YESPLAN_PERSONNEL_CACHE_TTL_MS = Number(process.env.YESPLAN_PERSONNEL_CACHE_TTL_MS || (90 * 1000)); // 90s
const YESPLAN_PERSONNEL_CACHE_MAX = 300;
const yesplanApiInstances = new Map();
const yesplanPersonnelCache = new Map();

function getYesplanConfig(org) {
  const key = org === 2 ? 'yesplan2' : 'yesplan';
  const config = secureConfigFromStorage(store.get(key, {}));
  const appConfig = store.get('app', {}) || {};
  const profiles = (appConfig.yesplanFieldProfiles && typeof appConfig.yesplanFieldProfiles === 'object')
    ? appConfig.yesplanFieldProfiles
    : {};
  const profile = profiles[String(org)] || profiles.default || (
    String(config?.name || '').toLowerCase().includes('metropool')
      ? {
          techniek: ['techniek', 'tech', 'podiumtechniek', 'stage crew', 'crew'],
          horeca: ['horeca', 'catering', 'bediening', 'bar'],
          frontOffice: ['frontoffice', 'front office', 'publieksservice', 'garderobe', 'ticketing', 'kassa', 'entree'],
          nostradamus: ['nostradamus'],
          exclude: ['opmerking', 'opmerkingen', 'remark', 'remarks', 'notes', 'bijzonderheden']
        }
      : null
  );
  return {
    ...config,
    organizationId: org,
    fieldProfile: profile
  };
}

function getActiveYesplanOrg() {
  const appConfig = store.get('app', {});
  const v = appConfig.activeYesplanOrg;
  return v === 'both' ? 'both' : (v === 2 ? 2 : 1);
}

function listNetworkInterfaces() {
  const nets = os.networkInterfaces();
  const rows = [];
  for (const [name, addrs] of Object.entries(nets || {})) {
    for (const a of addrs || []) {
      if (!a || a.family !== 'IPv4' || a.internal) continue;
      const address = String(a.address || '').trim();
      if (!address) continue;
      rows.push({
        id: `${name}:${address}`,
        name,
        address,
        cidr: a.cidr || '',
        mac: a.mac || ''
      });
    }
  }
  rows.sort((a, b) => {
    const n = a.name.localeCompare(b.name, 'nl', { numeric: true });
    if (n !== 0) return n;
    return a.address.localeCompare(b.address, 'nl', { numeric: true });
  });
  return rows;
}

function getNetworkRoutingConfig() {
  const appConfig = store.get('app', {}) || {};
  return (appConfig.networkRouting && typeof appConfig.networkRouting === 'object')
    ? appConfig.networkRouting
    : {};
}

function getSelectedInterfaceAddress(role) {
  const routing = getNetworkRoutingConfig();
  const selected = String(routing?.[role] || '').trim();
  if (!selected || selected === 'auto') return '';
  const available = listNetworkInterfaces();
  const byAddress = available.find((i) => i.address === selected);
  if (byAddress) return byAddress.address;
  const byId = available.find((i) => i.id === selected);
  return byId ? byId.address : '';
}

function getYesplanApi(config = {}) {
  const localAddress = getSelectedInterfaceAddress('internetInterface');
  const baseURL = String(config.baseURL || '').trim();
  const apiKey = String(config.apiKey || '').trim();
  const org = String(config.organizationId || '');
  const profileKey = (() => {
    try { return JSON.stringify(config.fieldProfile || {}); } catch (_) { return ''; }
  })();
  const key = `${baseURL}|${apiKey}|${org}|${localAddress}|${profileKey}`;
  if (!baseURL || !apiKey) return new YesplanAPI(config);
  const existing = yesplanApiInstances.get(key);
  if (existing) return existing;
  const api = new YesplanAPI({ ...config, localAddress });
  yesplanApiInstances.set(key, api);
  if (yesplanApiInstances.size > 12) {
    const firstKey = yesplanApiInstances.keys().next().value;
    if (firstKey) yesplanApiInstances.delete(firstKey);
  }
  return api;
}

function yesplanCacheKey(params, activeOrg, singleOrg) {
  const { startDate, endDate, venueId, includeEventDetailsForWeekFilters } = params;
  const detailsKey = includeEventDetailsForWeekFilters ? 'fullWeekFilters' : 'liteWeekFilters';
  const orgs = activeOrg === 'both'
    ? (singleOrg ? [singleOrg] : [1, 2])
    : [activeOrg === 2 ? 2 : 1];
  const orgFingerprint = orgs.map((orgNum) => {
    const cfg = getYesplanConfig(orgNum);
    return `org${orgNum}@${String(cfg.baseURL || '').trim()}`;
  }).join('|');
  return `yesplan:${orgFingerprint}:${startDate || ''}:${endDate || ''}:${venueId ?? 'all'}:${detailsKey}`;
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

function yesplanPersonnelCacheKey(params = {}, activeOrg, venueOrg) {
  const startDate = String(params.startDate || '').trim();
  const endDate = String(params.endDate || '').trim();
  const venueId = String(params.venueId || '').trim() || 'all';
  const orgs = activeOrg === 'both'
    ? (venueOrg ? [venueOrg] : [1, 2])
    : [activeOrg === 2 ? 2 : 1];
  const orgFingerprint = orgs.map((orgNum) => {
    const cfg = getYesplanConfig(orgNum);
    let profileKey = '';
    try { profileKey = JSON.stringify(cfg.fieldProfile || {}); } catch (_) { profileKey = ''; }
    return `org${orgNum}@${String(cfg.baseURL || '').trim()}#${profileKey}`;
  }).join('|');
  return `personnel:${orgFingerprint}:${startDate}:${endDate}:${venueId}`;
}

function yesplanPersonnelCacheGet(key) {
  const ent = yesplanPersonnelCache.get(key);
  if (!ent) return null;
  if (Date.now() - ent.ts > YESPLAN_PERSONNEL_CACHE_TTL_MS) {
    yesplanPersonnelCache.delete(key);
    return null;
  }
  return ent.data;
}

function yesplanPersonnelCacheSet(key, data) {
  if (yesplanPersonnelCache.size >= YESPLAN_PERSONNEL_CACHE_MAX) {
    let oldest = null;
    let oldestTs = Infinity;
    for (const [k, v] of yesplanPersonnelCache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldest = k; }
    }
    if (oldest) yesplanPersonnelCache.delete(oldest);
  }
  yesplanPersonnelCache.set(key, { data, ts: Date.now() });
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
let stopOscTimer = null;
const masterModeService = new MasterModeService({
  getName: () => {
    const cfg = store.get('app', {}) || {};
    const custom = String(cfg.masterModeName || '').trim();
    if (custom) return custom;
    const host = String(os.hostname() || '').trim();
    return host || 'Shift Happens master';
  }
});

function getDefaultWindowBounds(isKioskMode) {
  const MIN_WINDOW_WIDTH = 1920;
  const MIN_WINDOW_HEIGHT = 1080;
  if (process.platform === 'darwin' && !isKioskMode) {
    const { workArea } = screen.getPrimaryDisplay();
    return { x: workArea.x, y: workArea.y, width: workArea.width, height: workArea.height };
  }
  return { width: MIN_WINDOW_WIDTH, height: MIN_WINDOW_HEIGHT };
}

function isWindowBoundsUsable(bounds) {
  if (!bounds || typeof bounds !== 'object') return false;
  const { x, y, width, height } = bounds;
  if (![x, y, width, height].every((v) => Number.isFinite(v))) return false;
  if (width < 1920 || height < 1080) return false;

  // Gebruik middelpunt-check zodat venster op aangesloten schermen blijft.
  const centerX = x + (width / 2);
  const centerY = y + (height / 2);
  return screen.getAllDisplays().some(({ workArea }) =>
    centerX >= workArea.x &&
    centerX <= workArea.x + workArea.width &&
    centerY >= workArea.y &&
    centerY <= workArea.y + workArea.height
  );
}

function getInitialWindowBounds(isKioskMode) {
  const saved = store.get('windowBounds');
  if (!isKioskMode && isWindowBoundsUsable(saved)) return saved;
  return getDefaultWindowBounds(isKioskMode);
}

/** Eén GUI: tweede start (npm start, dubbelklik .app) focust het open venster; CLI-modi uitgezonderd. */
const _guiSingleInstance =
  !process.argv.includes('--personnel-wtpy') && !process.argv.includes('--yesplan-search');
if (_guiSingleInstance) {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  } else {
    app.on('second-instance', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
}

function createWindow() {
  // Check voor kiosk mode argument
  const isKioskMode = process.argv.includes('--kiosk') || process.env.KIOSK_MODE === 'true';
  const MIN_WINDOW_WIDTH = 1920;
  const MIN_WINDOW_HEIGHT = 1080;
  const winOpts = getInitialWindowBounds(isKioskMode);

  // Hoofdvenster aanmaken
  mainWindow = new BrowserWindow({
    ...winOpts,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    fullscreen: isKioskMode,
    fullscreenable: true, // Groene plus-knop op Mac doet beeldvullend fullscreen
    kiosk: isKioskMode,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
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

  // Bewaar laatste vensterpositie/-grootte voor volgende start.
  const persistWindowBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized() || mainWindow.isFullScreen() || mainWindow.isMaximized()) return;
    const bounds = mainWindow.getBounds();
    if (!isWindowBoundsUsable(bounds)) return;
    store.set('windowBounds', bounds);
  };
  mainWindow.on('resize', persistWindowBounds);
  mainWindow.on('move', persistWindowBounds);
  mainWindow.on('close', persistWindowBounds);

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
    const key = yesplanCacheKey(apiParams, activeOrg, singleOrg);
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
      const hasAny = Object.values(urenInfo || {}).some((v) => Array.isArray(v) && v.length > 0);
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
  const skipCache = !!params?.skipCache || !!params?.forceRefresh;
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
    const personnelCacheParams = { startDate: start, endDate: end, venueId };
    const personnelCacheKey = yesplanPersonnelCacheKey(personnelCacheParams, activeOrg, venueOrg);
    if (!skipCache) {
      const cached = yesplanPersonnelCacheGet(personnelCacheKey);
      if (cached) return { ...cached, _fromCache: true };
    }
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
        for (const [key, value] of Object.entries(urenInfo || {})) {
          if (!Array.isArray(value) || value.length === 0) continue;
          if (!Array.isArray(merged[key])) merged[key] = [];
          merged[key] = merged[key].concat(value);
        }
      }
    }
    const total = Object.values(merged).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0);
    if (!hadValidConfig) {
      runtimeLog('[Personeel] Geen geldige Yesplan-config in deze app. Gebruik Instellingen → Yesplan (org 1/2) en vul base URL + API-key in.');
    }
    runtimeLog('[Personeel] Resultaat: techniek=', merged.techniek.length, 'horeca=', merged.horeca.length, 'frontOffice=', merged.frontOffice.length, 'totaal=', total);
    const out = { success: true, data: merged };
    yesplanPersonnelCacheSet(personnelCacheKey, out);
    return out;
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
      const label1 = (config1.shortName && String(config1.shortName).trim()) || (config1.name && String(config1.name).trim()) || 'Org 1';
      const label2 = (config2.shortName && String(config2.shortName).trim()) || (config2.name && String(config2.name).trim()) || 'Org 2';
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
    const localAddress = getSelectedInterfaceAddress('internetInterface');
    const priva = new PrivaAPI({
      ...secureConfigFromStorage(store.get('priva', {})),
      localAddress
    });
    return await priva.getClimateData(params);
  } catch (error) {
    console.error('Priva API error:', error);
    throw error;
  }
});

ipcMain.handle('get-network-interfaces', async () => {
  try {
    return { success: true, data: listNetworkInterfaces() };
  } catch (error) {
    return { success: false, error: error && error.message ? error.message : String(error), data: [] };
  }
});

ipcMain.handle('unlock-master-mode', async (_event, { password } = {}) => {
  return masterModeService.unlock(password);
});

ipcMain.handle('discover-master-mode', async () => {
  try {
    const masters = await masterModeService.discoverMaster({ timeoutMs: 1400 });
    return { success: true, masters };
  } catch (error) {
    return { success: false, error: error && error.message ? error.message : String(error), masters: [] };
  }
});

ipcMain.handle('get-master-mode-status', async () => {
  return { success: true, status: masterModeService.getStatus() };
});

ipcMain.handle('save-config', async (event, system, config) => {
  try {
    const allowedSystems = new Set(['yesplan', 'yesplan2', 'priva', 'itix', 'app', 'voorstellingTimer', 'luminex']);
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
    if (system === 'app') {
      // OSC luistert op gekozen netwerkinterface; herstart listener na opslaan.
      if (typeof stopOscTimer === 'function') {
        stopOscTimer();
        stopOscTimer = null;
      }
      stopOscTimer = startOscTimerListener({
        host: getSelectedInterfaceAddress('oscInterface') || undefined,
        onTrigger: ({ slotId, stepId }) => {
          const win = mainWindow;
          if (!win || win.isDestroyed()) return;
          win.webContents.send('osc-timer-trigger', { slotId, stepId });
        }
      });
      const masterResult = await masterModeService.applyConfig(config || {});
      if (!masterResult?.success) {
        return {
          success: false,
          error: masterResult.error || 'MASTER_MODE_FAILED',
          message: masterResult.message || 'Master mode kon niet worden gestart.'
        };
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Config save error:', error);
    throw error;
  }
});

ipcMain.handle('get-config', async (event, system) => {
  const allowedSystems = new Set(['yesplan', 'yesplan2', 'priva', 'itix', 'app', 'voorstellingTimer', 'luminex']);
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
function isPrivateLanHttpUrl(url) {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1') return true;
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
    if (!m) return false;
    const a = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    if (a.some((n) => n > 255)) return false;
    if (a[0] === 10) return true;
    if (a[0] === 192 && a[1] === 168) return true;
    if (a[0] === 172 && a[1] >= 16 && a[1] <= 31) return true;
    return false;
  } catch (_) {
    return false;
  }
}

function isUrlAllowed(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (isPrivateLanHttpUrl(trimmed)) return true;
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

ipcMain.handle('luminode-discover', async () => {
  try {
    return await browseLuminodes();
  } catch (error) {
    console.error('LumiNode discovery error:', error);
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
      devices: []
    };
  }
});

ipcMain.handle('sacn-discover', async (_event, opts) => {
  try {
    const sacnIface = getSelectedInterfaceAddress('sacnInterface');
    const luminexIface = getSelectedInterfaceAddress('luminexInterface');
    return await scanSacnUniverses({
      ...(opts || {}),
      iface: (opts && opts.iface) || sacnIface || luminexIface || undefined
    });
  } catch (error) {
    console.error('sACN scan error:', error);
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
      universes: []
    };
  }
});

ipcMain.handle('luminode-capabilities', async (_event, { host, password } = {}) => {
  try {
    const localAddress = getSelectedInterfaceAddress('luminexInterface');
    return await getLumiNodeCapabilities(host, password, { localAddress });
  } catch (error) {
    console.error('LumiNode capabilities error:', error);
    return {
      ok: false,
      errors: [error && error.message ? error.message : String(error)],
      deviceinfo: null,
      processblocks: [],
      io: null
    };
  }
});

ipcMain.handle('luminode-fetch-json', async (_event, { host, password, path } = {}) => {
  try {
    const localAddress = getSelectedInterfaceAddress('luminexInterface');
    const data = await fetchJson(host, password, path, { localAddress });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) };
  }
});

ipcMain.handle('ensure-luminex-viewer', async () => {
  try {
    const luminex = secureConfigFromStorage(store.get('luminex', {}) || {});
    const appCfg = store.get('app', {}) || {};
    const existingUrl = getLuminexViewerUrl();
    if (existingUrl) {
      reloadLuminexViewerConfig(luminex, appCfg);
      return { success: true, url: existingUrl };
    }
    const result = await startLuminexViewerServer({
      userDataDir: app.getPath('userData'),
      shiftHappensLuminex: luminex,
      shiftHappensApp: appCfg,
    });
    return { success: true, url: result.url };
  } catch (err) {
    console.error('ensure-luminex-viewer:', err);
    return { success: false, error: String(err.message || err) };
  }
});

ipcMain.handle('luminode-write-json', async (_event, { host, password, path, body, method } = {}) => {
  try {
    const localAddress = getSelectedInterfaceAddress('luminexInterface');
    const data = await writeJson(host, password, path, body, method || 'PUT', { localAddress });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) };
  }
});

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

ipcMain.handle('download-update', async () => downloadUpdateNow());

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
  masterModeService.applyConfig(store.get('app', {}) || {}, { skipUnlock: true }).catch((error) => {
    console.error('Master mode startfout:', error?.message || error);
  });
  stopOscTimer = startOscTimerListener({
    host: getSelectedInterfaceAddress('oscInterface') || undefined,
    onTrigger: ({ slotId, stepId }) => {
      const win = mainWindow;
      if (!win || win.isDestroyed()) return;
      win.webContents.send('osc-timer-trigger', { slotId, stepId });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (typeof stopOscTimer === 'function') {
    stopOscTimer();
    stopOscTimer = null;
  }
  stopLuminexViewerServer();
  masterModeService.stop().catch(() => {
    /* ignore */
  });
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

