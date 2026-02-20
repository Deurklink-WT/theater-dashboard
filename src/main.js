/**
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
const axios = require('axios');

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
const ItixAPI = require('./api/itix');
const PrivaAPI = require('./api/priva');

// Yesplan response cache (vermindert serverbelasting bij navigatie)
const YESPLAN_CACHE_TTL_MS = 3 * 60 * 1000;  // 3 minuten
const YESPLAN_CACHE_MAX = 100;
const yesplanCache = new Map();

function getYesplanConfig(org) {
  const key = org === 2 ? 'yesplan2' : 'yesplan';
  return secureConfigFromStorage(store.get(key, {}));
}

function getActiveYesplanOrg() {
  const appConfig = store.get('app', {});
  const v = appConfig.activeYesplanOrg;
  return v === 'both' ? 'both' : (v === 2 ? 2 : 1);
}

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

    // Bij "both" en composite venueId "1:123" → alleen die org met die venue ophalen
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
  } catch (error) {
    console.error('Yesplan API error:', error);
    throw error;
  }
});

ipcMain.handle('get-yesplan-venues', async (event, params = {}) => {
  try {
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
  } catch (error) {
    console.error('Yesplan Venues API error:', error);
    throw error;
  }
});

ipcMain.handle('get-yesplan-schedule', async (event, eventId, org) => {
  try {
    const orgNum = (org === 2 ? 2 : 1);
    const yesplan = new YesplanAPI(getYesplanConfig(orgNum));
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
  } catch (error) {
    console.error('Yesplan Reservations API error:', error);
    throw error;
  }
});

// Uurwerk API handler verwijderd - data komt nu uit Yesplan

ipcMain.handle('get-itix-data', async (event, params) => {
  try {
    const itix = new ItixAPI(secureConfigFromStorage(store.get('itix', {})));
    // Haal events op (bevat verkoop en reserveringen data)
    return await itix.getEvents(params);
  } catch (error) {
    console.error('Itix API error:', error);
    throw error;
  }
});

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
    const toStore = ['yesplan', 'yesplan2', 'itix', 'priva'].includes(system)
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
  const raw = store.get(system, {});
  return ['yesplan', 'yesplan2', 'itix', 'priva'].includes(system)
    ? secureConfigFromStorage(raw)
    : raw;
});

// Toegestane domeinen voor externe links (voorkomt open-redirect)
const ALLOWED_EXTERNAL_HOSTS = [
  'yesplan.nl', 'yesplan.com',
  'wilminktheater.nl', 'tickets.wilminktheater.nl',
  'huistechneut.nl', 'itix.nl', 'priva.nl'
];
function isUrlAllowed(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    return ALLOWED_EXTERNAL_HOSTS.some(allowed => host === allowed || host.endsWith('.' + allowed));
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

// Automatische data vernieuwing elke 4 uur
cron.schedule('0 */4 * * *', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('auto-refresh');
  }
});

// App event handlers
app.whenReady().then(createWindow);

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

