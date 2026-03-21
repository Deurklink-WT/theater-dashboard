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

  /**
   * Normaliseert en valideert de opgeslagen API-server-URL.
   * Voorkomt per ongeluk Yesplan- of Itix-zaalplattegrond-URL in dit veld (regressie na v1.5.5).
   */
  function getBase() {
    const raw = window.SHIFT_HAPPENS_API_BASE || localStorage.getItem('SHIFT_HAPPENS_API_BASE') || '';
    let t = String(raw || '').trim();
    if (!t) return '';
    if (!/^https?:\/\//i.test(t)) t = 'http://' + t;
    try {
      var u = new URL(t);
      var host = u.hostname.toLowerCase();
      if (host.indexOf('yesplan') !== -1) return '';
      var p = (u.pathname || '').toLowerCase();
      if (p.indexOf('zaalplattegrond') !== -1 || p.indexOf('uitvoeringinfo') !== -1) return '';
      var pathPart = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
      return u.origin + pathPart;
    } catch (e) {
      return '';
    }
  }

  function apiBaseMissingError() {
    return new Error(
      'Shift Happens API-server niet ingesteld. Open Instellingen → sectie API-server (iPhone) en vul het adres in van jouw server (bijv. http://192.168.1.10:3847), niet de Yesplan- of ticket-URL.'
    );
  }

  function post(path, body) {
    const base = getBase();
    if (!base) return Promise.reject(apiBaseMissingError());
    const url = base.replace(/\/$/, '') + path;
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
    if (!base) return Promise.reject(apiBaseMissingError());
    const url = base.replace(/\/$/, '') + path;
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
      if (!url || typeof url !== 'string') return Promise.resolve({ success: false, error: 'URL required' });
      var trimmed = url.trim();
      if (!trimmed.startsWith('https://')) return Promise.resolve({ success: false, error: 'URL not allowed' });
      try {
        var u = new URL(trimmed);
        var host = u.hostname.toLowerCase();
        var allowed = ['yesplan.nl', 'yesplan.com', 'wilminktheater.nl', 'tickets.wilminktheater.nl', 'huistechneut.nl', 'itix.nl', 'priva.nl'];
        var ok = allowed.some(function (a) { return host === a || host.endsWith('.' + a); });
        if (!ok) return Promise.resolve({ success: false, error: 'URL not allowed' });
        window.open(trimmed, '_blank', 'noopener');
        return Promise.resolve({ success: true });
      } catch (e) {
        return Promise.resolve({ success: false, error: e.message });
      }
    }
  };
})();
