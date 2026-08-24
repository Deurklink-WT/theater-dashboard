(function () {
  const TOKEN_KEY = 'shift_controlpanel_token';
  let connectionsTimer = null;
  let auditLogTimer = null;

  function token() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async function api(path, options) {
    const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Shift-Client': 'controlpanel' }, (options && options.headers) || {});
    if (token()) headers.Authorization = 'Bearer ' + token();
    const r = await fetch(path, Object.assign({}, options || {}, { headers }));
    const j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw new Error(j.error || r.statusText || 'Request failed');
    return j;
  }

  function show(id) {
    ['bootstrapSection', 'loginSection', 'adminSection'].forEach(function (s) {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  async function init() {
    const status = await fetch('/api/auth/status').then(function (r) { return r.json(); });
    if (status.needsBootstrap) {
      show('bootstrapSection');
      return;
    }
    if (!token()) {
      show('loginSection');
      return;
    }
    try {
      await loadAdmin();
    } catch (_) {
      setToken('');
      show('loginSection');
    }
  }

  async function loadAdmin() {
    const me = await api('/api/auth/me');
    show('adminSection');
    document.getElementById('adminWelcome').textContent = me.user.email;
    document.getElementById('adminRole').textContent = me.user.role;
    const isAdmin = me.user.role === 'admin';
    document.getElementById('userPanel').classList.toggle('hidden', !isAdmin);
    document.getElementById('nonAdminPanel').classList.toggle('hidden', isAdmin);
    startConnectionsPoll();
    startAuditLogPoll();
    if (isAdmin) {
      await refreshUsers();
    }
  }

  function startConnectionsPoll() {
    stopConnectionsPoll();
    void refreshConnections();
    connectionsTimer = setInterval(function () { void refreshConnections(); }, 3000);
  }

  function stopConnectionsPoll() {
    if (connectionsTimer) {
      clearInterval(connectionsTimer);
      connectionsTimer = null;
    }
  }

  function formatLastSeen(c) {
    const ts = c.lastSeenAt ? new Date(c.lastSeenAt) : null;
    if (!ts || Number.isNaN(ts.getTime())) return '—';
    return ts.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  async function refreshConnections() {
    const tbody = document.getElementById('connectionsBody');
    const countEl = document.getElementById('connectionsCount');
    const updatedEl = document.getElementById('connectionsUpdated');
    if (!tbody) return;
    try {
      const res = await api('/api/admin/connections');
      const list = Array.isArray(res.connections) ? res.connections : [];
      const online = list.filter(function (c) { return c.online; });
      if (countEl) countEl.textContent = String(online.length);
      if (updatedEl) {
        const now = new Date();
        const stale = res.staleAfterSeconds != null ? res.staleAfterSeconds + 's' : '—';
        updatedEl.textContent = 'Laatste check: ' + now.toLocaleTimeString('nl-NL')
          + ' · ' + online.length + ' online / ' + list.length + ' totaal · offline na ' + stale;
      }
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="hint">Geen clients gezien — log in via Shift Happens (Instellingen → Shift-server).</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      list.forEach(function (c) {
        const tr = document.createElement('tr');
        if (!c.online) tr.className = 'row-offline';
        tr.innerHTML =
          '<td>' + (c.online ? 'Online' : 'Offline') + '</td>' +
          '<td>' + escapeHtml(c.email) + '</td>' +
          '<td>' + escapeHtml(c.client || '—') + '</td>' +
          '<td>' + escapeHtml(c.view || '—') + '</td>' +
          '<td>' + escapeHtml(formatLastSeen(c)) + '</td>' +
          '<td class="col-actions"></td>';
        const actions = tr.querySelector('.col-actions');
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-icon';
        del.title = 'Verwijder uit lijst';
        del.setAttribute('aria-label', 'Verwijder sessie');
        del.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
        del.onclick = function () { void removeConnection(c.id); };
        actions.appendChild(del);
        tbody.appendChild(tr);
      });
    } catch (e) {
      if (updatedEl) updatedEl.textContent = 'Fout bij laden';
      tbody.innerHTML = '<tr><td colspan="6" class="hint">Kon verbindingen niet laden: ' + escapeHtml(e.message || 'onbekende fout') + '</td></tr>';
    }
  }

  async function removeConnection(id) {
    if (!id) return;
    try {
      await api('/api/admin/connections/' + encodeURIComponent(id), { method: 'DELETE' });
      await refreshConnections();
    } catch (e) {
      alert(mapError(e.message) || 'Verwijderen mislukt.');
    }
  }

  async function refreshUsers() {
    const res = await api('/api/admin/users');
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    (res.users || []).forEach(function (u) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(u.email) + '</td>' +
        '<td>' + escapeHtml(u.role) + '</td>' +
        '<td class="' + (u.enabled ? 'status-on">Actief' : 'status-off">Uit') + '</td>' +
        '<td><div class="row-actions"></div></td>';
      const actions = tr.querySelector('.row-actions');
      if (u.enabled) {
        const dis = document.createElement('button');
        dis.textContent = 'Uitzetten';
        dis.className = 'btn-secondary';
        dis.onclick = function () { void toggleUser(u.id, false); };
        actions.appendChild(dis);
      } else {
        const en = document.createElement('button');
        en.textContent = 'Aanzetten';
        en.className = 'btn-secondary';
        en.onclick = function () { void toggleUser(u.id, true); };
        actions.appendChild(en);
      }
      const del = document.createElement('button');
      del.textContent = 'Verwijder';
      del.className = 'btn-secondary';
      del.onclick = function () {
        if (confirm('Gebruiker ' + u.email + ' verwijderen?')) void deleteUser(u.id);
      };
      actions.appendChild(del);
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function toggleUser(id, enabled) {
    await api('/api/admin/users/' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify({ enabled: enabled })
    });
    await refreshUsers();
  }

  async function deleteUser(id) {
    await api('/api/admin/users/' + encodeURIComponent(id), { method: 'DELETE' });
    await refreshUsers();
  }

  document.getElementById('bootstrapForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const err = document.getElementById('bootstrapError');
    err.textContent = '';
    try {
      const res = await api('/api/auth/bootstrap', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('bootstrapEmail').value,
          password: document.getElementById('bootstrapPassword').value
        })
      });
      setToken(res.token);
      await loadAdmin();
    } catch (e) {
      err.textContent = mapError(e.message);
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const err = document.getElementById('loginError');
    err.textContent = '';
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginPassword').value
        })
      });
      setToken(res.token);
      await loadAdmin();
    } catch (e) {
      err.textContent = mapError(e.message);
    }
  });

  document.getElementById('addUserForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const err = document.getElementById('addUserError');
    err.textContent = '';
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('newEmail').value,
          password: document.getElementById('newPassword').value,
          role: document.getElementById('newRole').value
        })
      });
      document.getElementById('newEmail').value = '';
      document.getElementById('newPassword').value = '';
      await refreshUsers();
    } catch (e) {
      err.textContent = mapError(e.message);
    }
  });

  function stopAuditLogPoll() {
    if (auditLogTimer) {
      clearInterval(auditLogTimer);
      auditLogTimer = null;
    }
  }

  function formatAuditAction(action) {
    const map = {
      'trekkenlijst.verwerkt': 'Trekkenlijst verwerkt',
      'trekkenlijst.onverwerkt': 'Trekkenlijst onverwerkt',
      'trekkenlijst.opmerking': 'Opmerking geplaatst',
      'trekkenlijst.opmerking_gewist': 'Opmerking gewist'
    };
    return map[action] || action || '—';
  }

  function formatAuditDetail(entry) {
    if (!entry || entry.detail == null) return '—';
    if (typeof entry.detail === 'string') return entry.detail;
    if (entry.detail.comment != null) {
      const c = String(entry.detail.comment);
      return c ? c : '—';
    }
    if (entry.detail.verwerkt != null) return entry.detail.verwerkt ? 'ja' : 'nee';
    try { return JSON.stringify(entry.detail); } catch (_) { return '—'; }
  }

  async function refreshAuditLog() {
    const tbody = document.getElementById('auditLogBody');
    const countEl = document.getElementById('auditLogCount');
    const updatedEl = document.getElementById('auditLogUpdated');
    if (!tbody) return;
    const email = String(document.getElementById('auditFilterEmail')?.value || '').trim();
    const action = String(document.getElementById('auditFilterAction')?.value || '').trim();
    const qs = new URLSearchParams({ limit: '100' });
    if (email) qs.set('email', email);
    if (action) qs.set('action', action);
    try {
      const res = await api('/api/admin/audit-log?' + qs.toString());
      const list = Array.isArray(res.entries) ? res.entries : [];
      if (countEl) countEl.textContent = String(list.length);
      if (updatedEl) {
        updatedEl.textContent = 'Laatste check: ' + new Date().toLocaleTimeString('nl-NL');
      }
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="hint">Geen logregels gevonden.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      list.forEach(function (e) {
        const tr = document.createElement('tr');
        const at = e.at ? new Date(e.at).toLocaleString('nl-NL', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) : '—';
        const target = e.title ? (e.title + ' (' + (e.targetKey || '') + ')') : (e.targetKey || '—');
        tr.innerHTML =
          '<td>' + escapeHtml(at) + '</td>' +
          '<td>' + escapeHtml(e.email || '—') + '</td>' +
          '<td>' + escapeHtml(formatAuditAction(e.action)) + '</td>' +
          '<td>' + escapeHtml(target) + '</td>' +
          '<td>' + escapeHtml(formatAuditDetail(e)) + '</td>';
        tbody.appendChild(tr);
      });
    } catch (err) {
      if (updatedEl) updatedEl.textContent = 'Fout bij laden';
      tbody.innerHTML = '<tr><td colspan="5" class="hint">Kon log niet laden: ' + escapeHtml(err.message || 'onbekende fout') + '</td></tr>';
    }
  }

  function startAuditLogPoll() {
    stopAuditLogPoll();
    void refreshAuditLog();
    auditLogTimer = setInterval(function () { void refreshAuditLog(); }, 5000);
  }

  document.getElementById('auditRefreshBtn')?.addEventListener('click', function () {
    void refreshAuditLog();
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    stopConnectionsPoll();
    stopAuditLogPoll();
    setToken('');
    show('loginSection');
  });

  function mapError(code) {
    const m = {
      INVALID_CREDENTIALS: 'Onjuist e-mailadres of wachtwoord.',
      EMAIL_EXISTS: 'Dit e-mailadres staat al op de whitelist.',
      PASSWORD_TOO_SHORT: 'Wachtwoord moet minimaal 8 tekens zijn.',
      LAST_ADMIN: 'Je kunt de laatste admin niet verwijderen of degraderen.',
      SELF_DELETE: 'Je kunt jezelf niet verwijderen.',
      ALREADY_BOOTSTRAPPED: 'Setup is al gedaan.'
    };
    return m[code] || code || 'Er ging iets mis.';
  }

  void init();
})();
