/**
 * Shift Happens - Mobile/Web API adapter
 * Zelfde interface als Electron preload (window.electronAPI), maar via fetch naar de API-server.
 * Wordt alleen gebruikt als window.electronAPI nog niet bestaat (geen Electron).
 * Stel de server in via localStorage 'SHIFT_HAPPENS_API_BASE' of window.SHIFT_HAPPENS_API_BASE.
 * @author PdV
 * @license UNLICENSED
 */

(function () {
  if (window.__IS_ELECTRON__ || typeof window.electronAPI !== 'undefined') return;

  function getBase() {
    return window.SHIFT_HAPPENS_API_BASE || localStorage.getItem('SHIFT_HAPPENS_API_BASE') || '';
  }

  function post(path, body) {
    const base = getBase();
    const url = base ? (base.replace(/\/$/, '') + path) : path;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error(r.statusText || 'Request failed');
      return r.json();
    });
  }

  function get(path) {
    const base = getBase();
    const url = base ? (base.replace(/\/$/, '') + path) : path;
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.statusText || 'Request failed');
      return r.json();
    });
  }

  window.__SHIFT_HAPPENS_MOBILE__ = true;
  document.body.classList.add('ios-app');
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'styles-ios.css';
  document.head.appendChild(link);
  window.electronAPI = {
    getYesplanData: function (params) { return post('/api/yesplan/data', params); },
    getYesplanVenues: function (params) { return post('/api/yesplan/venues', params || {}); },
    getYesplanReservations: function (params) { return post('/api/yesplan/reservations', params); },
    getYesplanSchedule: function (eventId, org) { return post('/api/yesplan/schedule', { eventId, org }); },
    getItixData: function (params) { return post('/api/itix/data', params); },
    getPrivaData: function (params) { return post('/api/priva/data', params); },
    saveConfig: function (system, config) { return post('/api/config', { system, config }); },
    getConfig: function (system) { return get('/api/config/' + encodeURIComponent(system)); },
    onAutoRefresh: function (cb) { window._onAutoRefresh = cb; },
    onRefreshData: function (cb) { window._onRefreshData = cb; },
    onOpenSettings: function (cb) { window._onOpenSettings = cb; },
    removeAllListeners: function () { window._onAutoRefresh = window._onRefreshData = window._onOpenSettings = null; },
    openExternal: function (url) {
      if (url) window.open(url, '_blank', 'noopener');
      return Promise.resolve({ success: true });
    }
  };
})();
