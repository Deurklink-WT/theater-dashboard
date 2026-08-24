const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__IS_ELECTRON__', true);
// Veilige API blootstelling aan renderer proces
contextBridge.exposeInMainWorld('electronAPI', {
  // Yesplan API
  getYesplanData: (params) => ipcRenderer.invoke('get-yesplan-data', params),
  getYesplanEventPersonnel: (eventId) => ipcRenderer.invoke('get-yesplan-event-personnel', { eventId }),
  getYesplanPersonnelForDate: (params) => ipcRenderer.invoke('get-yesplan-personnel-for-date', params),
  getYesplanSearch: (query) => ipcRenderer.invoke('get-yesplan-search', { query }),
  getYesplanVenues: (params) => ipcRenderer.invoke('get-yesplan-venues', params || {}),
  getYesplanReservations: (params) => ipcRenderer.invoke('get-yesplan-reservations', params),
  getYesplanSchedule: (eventId, org) => ipcRenderer.invoke('get-yesplan-schedule', eventId, org),

  // Priva API
  getPrivaData: (params) => ipcRenderer.invoke('get-priva-data', params),

  // Configuratie
  saveConfig: (system, config) => ipcRenderer.invoke('save-config', system, config),
  getConfig: (system) => ipcRenderer.invoke('get-config', system),
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  unlockMasterMode: (password) => ipcRenderer.invoke('unlock-master-mode', { password }),
  discoverMasterMode: () => ipcRenderer.invoke('discover-master-mode'),
  getMasterModeStatus: () => ipcRenderer.invoke('get-master-mode-status'),

  // Event listeners
  onAutoRefresh: (callback) => ipcRenderer.on('auto-refresh', callback),
  onRefreshData: (callback) => ipcRenderer.on('refresh-data', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),

  // Event listeners verwijderen
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Open externe links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Updates (alleen geïnstalleerde app)
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('quit-and-install-update'),
  onUpdateStatus: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  },

  /** LumiNode mDNS (_luminex._tcp), zie companion-module bonjourQueries */
  discoverLuminodes: () => ipcRenderer.invoke('luminode-discover'),

  /** sACN E1.31: actieve universes in een bereik (multicast scan) */
  discoverSacnUniverses: (opts) => ipcRenderer.invoke('sacn-discover', opts),

  /** LumiNode REST: deviceinfo, pipeline/sources, IO */
  getLuminodeCapabilities: (host, password) =>
    ipcRenderer.invoke('luminode-capabilities', { host, password }),

  luminodeFetchJson: (opts) => ipcRenderer.invoke('luminode-fetch-json', opts),

  luminodeWriteJson: (opts) => ipcRenderer.invoke('luminode-write-json', opts),

  /** Embedded Luminex Flow Viewer (localhost HTTP + SSE) */
  ensureLuminexViewer: () => ipcRenderer.invoke('ensure-luminex-viewer'),

  /** OSC / Stream Deck / Companion → voorstelling-timer (main stuurt osc-timer-trigger) */
  onOscTimerTrigger: (callback) => {
    const channel = 'osc-timer-trigger';
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  }
});
