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

  // Itix API
  getItixData: (params) => ipcRenderer.invoke('get-itix-data', params),

  // Priva API
  getPrivaData: (params) => ipcRenderer.invoke('get-priva-data', params),

  // Configuratie
  saveConfig: (system, config) => ipcRenderer.invoke('save-config', system, config),
  getConfig: (system) => ipcRenderer.invoke('get-config', system),

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
  }
});
