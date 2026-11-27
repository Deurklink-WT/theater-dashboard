/**
 * Beveiligingstests voor de Shift API-server.
 * Draait de echte Express-app op een tijdelijke poort met een tijdelijke config-map.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const MASK = '•'.repeat(12);
let dir;
let server;
let port;
let adminToken;
let userToken;

function call(method, urlPath, { body, token, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : (typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { /* geen JSON */ }
        resolve({ status: res.statusCode, json, headers: res.headers, text: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function readConfigFile() {
  return JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'));
}

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-api-test-'));
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({
    app: { theme: 'pink', shiftAuthToken: 'LEAK', cloudflareAccessClientSecret: 'CFSECRET' },
    yesplan: { baseURL: 'https://x.yesplan.nl', apiKey: 'SECRETKEY' }
  }));
  process.env.SHIFT_HAPPENS_CONFIG_DIR = dir;
  process.env.SHIFT_HAPPENS_SETUP_CODE = 'TESTCODE1';
  process.env.SHIFT_HAPPENS_AUTH_RATE_MAX = '1000';
  const app = require('./api-server');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await new Promise((resolve) => setTimeout(resolve, 400)); // presence.json wordt vertraagd weggeschreven
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('vóór de eerste beheerder (open modus)', () => {
  test('API-sleutel wordt nooit teruggegeven', async () => {
    const r = await call('GET', '/api/config/yesplan');
    expect(r.status).toBe(200);
    expect(r.json.apiKey).toBe(MASK);
    expect(r.text).not.toContain('SECRETKEY');
  });

  test('interne opslag is niet leesbaar of schrijfbaar via /api/config', async () => {
    for (const key of ['accessAuth', 'auditLog', 'appUsers', '__proto__', 'constructor']) {
      expect((await call('GET', `/api/config/${key}`)).status).toBe(404);
      expect((await call('POST', '/api/config', { body: { system: key, config: { users: [] } } })).status).toBe(400);
    }
  });

  test('koppeling wijzigen kan niet zonder beheerder', async () => {
    const r = await call('POST', '/api/config', { body: { system: 'yesplan', config: { baseURL: 'https://evil.example', apiKey: 'x' } } });
    expect(r.status).toBe(403);
    expect(readConfigFile().yesplan.baseURL).toBe('https://x.yesplan.nl');
  });

  test('opgeslagen login-token van een ander lekt niet via app-config', async () => {
    const r = await call('GET', '/api/config/app');
    expect(r.text).not.toContain('LEAK');
  });

  test('eerste beheerder vanaf een ander apparaat vereist de installatiecode', async () => {
    const remote = { 'X-Forwarded-For': '203.0.113.5' };
    const body = { email: 'admin@example.nl', password: 'geheim1234' };
    expect((await call('POST', '/api/auth/bootstrap', { body, headers: remote })).status).toBe(403);
    expect((await call('POST', '/api/auth/bootstrap', { body: { ...body, setupCode: 'fout' }, headers: remote })).status).toBe(403);
    const ok = await call('POST', '/api/auth/bootstrap', { body: { ...body, setupCode: 'testcode1' }, headers: remote });
    expect(ok.status).toBe(200);
    adminToken = ok.json.token;
    expect(adminToken).toBeTruthy();
    expect((await call('POST', '/api/auth/bootstrap', { body: { ...body, setupCode: 'testcode1' }, headers: remote })).status).toBe(400);
  });
});

describe('met login', () => {
  test('zonder token geen toegang', async () => {
    for (const p of ['/api/config/yesplan', '/api/config/app', '/api/trekkenlijst/items', '/api/voorstelling-timer/snapshots', '/api/admin/connections', '/api/admin/audit-log', '/api/admin/users']) {
      expect((await call('GET', p)).status).toBe(401);
    }
    expect((await call('GET', '/api/config/yesplan', { token: 'niet.geldig' })).status).toBe(401);
  });

  test('gebruiker aanmaken en inloggen; fout wachtwoord en onbekend account geven dezelfde fout', async () => {
    const created = await call('POST', '/api/admin/users', { token: adminToken, body: { email: 'user@example.nl', password: 'gebruiker1' } });
    expect(created.status).toBe(200);
    const login = await call('POST', '/api/auth/login', { body: { email: 'user@example.nl', password: 'gebruiker1' } });
    expect(login.status).toBe(200);
    userToken = login.json.token;
    const wrong = await call('POST', '/api/auth/login', { body: { email: 'user@example.nl', password: 'fout' } });
    const unknown = await call('POST', '/api/auth/login', { body: { email: 'niemand@example.nl', password: 'fout' } });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.json).toEqual(unknown.json);
    expect((await call('POST', '/api/auth/login', { body: { email: { $gt: '' }, password: ['x'] } })).status).toBe(401);
  });

  test('gewone gebruiker mag geen beheerroutes gebruiken', async () => {
    expect((await call('GET', '/api/admin/users', { token: userToken })).status).toBe(403);
    expect((await call('POST', '/api/admin/users', { token: userToken, body: { email: 'x@example.nl', password: 'wachtwoord1', role: 'admin' } })).status).toBe(403);
  });

  test('gewone gebruiker: ongewijzigd opslaan lukt, koppeling wijzigen niet', async () => {
    const same = await call('POST', '/api/config', { token: userToken, body: { system: 'yesplan', config: { baseURL: 'https://x.yesplan.nl', apiKey: MASK, name: '' } } });
    expect(same.status).toBe(200);
    const changed = await call('POST', '/api/config', { token: userToken, body: { system: 'yesplan', config: { baseURL: 'https://evil.example', apiKey: MASK } } });
    expect(changed.status).toBe(403);
    const newKey = await call('POST', '/api/config', { token: userToken, body: { system: 'yesplan', config: { baseURL: 'https://x.yesplan.nl', apiKey: 'andere' } } });
    expect(newKey.status).toBe(403);
    expect(readConfigFile().yesplan.apiKey).toBe('SECRETKEY');
  });

  test('beheerder: sleutel blijft staan als het masker terugkomt; ongeldige URL wordt geweigerd', async () => {
    const bad = await call('POST', '/api/config', { token: adminToken, body: { system: 'yesplan', config: { baseURL: 'javascript:alert(1)', apiKey: MASK } } });
    expect(bad.status).toBe(400);
    const creds = await call('POST', '/api/config', { token: adminToken, body: { system: 'yesplan', config: { baseURL: 'https://user:pw@x.yesplan.nl', apiKey: MASK } } });
    expect(creds.status).toBe(400);
    const ok = await call('POST', '/api/config', { token: adminToken, body: { system: 'yesplan', config: { baseURL: 'https://x.yesplan.nl', apiKey: MASK, name: 'WT' } } });
    expect(ok.status).toBe(200);
    const stored = readConfigFile().yesplan;
    expect(stored.apiKey).toBe('SECRETKEY');
    expect(stored.name).toBe('WT');
  });

  test('persoonlijke instellingen en tokens blijven per gebruiker', async () => {
    const save = await call('POST', '/api/config', { token: userToken, body: { system: 'app', config: { theme: 'green', showMode: true, shiftAuthToken: userToken, cloudflareAccessClientSecret: 'MIJNCF' } } });
    expect(save.status).toBe(200);
    const asAdmin = await call('GET', '/api/config/app', { token: adminToken });
    expect(asAdmin.json.theme).toBe('pink'); // gedeelde standaard blijft
    expect(asAdmin.json.showMode).toBe(true); // gedeelde instelling
    expect(asAdmin.json.shiftAuthToken).toBe(adminToken); // eigen token, niet dat van een ander
    expect(asAdmin.text).not.toContain(userToken);
    expect(asAdmin.text).not.toContain('MIJNCF');
    expect(asAdmin.text).not.toContain('CFSECRET');
    const asUser = await call('GET', '/api/config/app', { token: userToken });
    expect(asUser.json.theme).toBe('green');
    expect(asUser.json.cloudflareAccessClientSecret).toBe('MIJNCF');
    const file = readConfigFile();
    expect(JSON.stringify(file.app)).not.toContain('shiftAuthToken');
    expect(JSON.stringify(file)).not.toContain(userToken);
  });

  test('sessie intrekken maakt het token ongeldig', async () => {
    const list = await call('GET', '/api/admin/connections', { token: adminToken });
    const session = list.json.connections.find((c) => c.email === 'user@example.nl');
    expect(session).toBeTruthy();
    expect((await call('DELETE', `/api/admin/connections/${session.id}`, { token: userToken })).status).toBe(403);
    expect((await call('DELETE', `/api/admin/connections/${session.id}`, { token: adminToken })).status).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: userToken })).status).toBe(401);
  });

  test('wachtwoord wijzigen maakt oude tokens ongeldig; laatste beheerder kan niet uitgeschakeld worden', async () => {
    const login = await call('POST', '/api/auth/login', { body: { email: 'user@example.nl', password: 'gebruiker1' } });
    const fresh = login.json.token;
    expect((await call('GET', '/api/auth/me', { token: fresh })).status).toBe(200);
    const users = await call('GET', '/api/admin/users', { token: adminToken });
    const user = users.json.users.find((u) => u.email === 'user@example.nl');
    const admin = users.json.users.find((u) => u.email === 'admin@example.nl');
    expect((await call('PATCH', `/api/admin/users/${user.id}`, { token: adminToken, body: { password: 'nieuwwachtwoord1' } })).status).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: fresh })).status).toBe(401);
    expect((await call('PATCH', `/api/admin/users/${admin.id}`, { token: adminToken, body: { enabled: false } })).status).toBe(400);
    expect((await call('PATCH', `/api/admin/users/${admin.id}`, { token: adminToken, body: { role: 'user' } })).status).toBe(400);
    expect((await call('GET', '/api/auth/me', { token: adminToken })).status).toBe(200);
  });
});

describe('transport en invoer', () => {
  test('vreemde website wordt geweigerd, eigen clients toegestaan', async () => {
    const evil = await call('GET', '/api/auth/me', { token: adminToken, headers: { Origin: 'https://evil.example' } });
    expect(evil.status).toBe(403);
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
    const cap = await call('GET', '/api/auth/me', { token: adminToken, headers: { Origin: 'capacitor://localhost' } });
    expect(cap.status).toBe(200);
    expect(cap.headers['access-control-allow-origin']).toBe('capacitor://localhost');
    const same = await call('GET', '/api/auth/me', { token: adminToken, headers: { Origin: `http://127.0.0.1:${port}` } });
    expect(same.status).toBe(200);
  });

  test('beveiligingsheaders staan aan', async () => {
    const r = await call('GET', '/controlpanel/');
    expect(r.headers['x-powered-by']).toBeUndefined();
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-frame-options']).toBe('DENY');
    expect(r.headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('kapotte invoer geeft een nette fout zonder stacktrace', async () => {
    const badJson = await call('POST', '/api/auth/login', { body: '{kapot' });
    expect(badJson.status).toBe(400);
    expect(badJson.json).toEqual({ success: false, error: 'BAD_REQUEST' });
    const badKey = await call('GET', '/api/trekkenlijst/item/%E0%A4%A', { token: adminToken });
    expect(badKey.status).toBe(400);
    expect(badKey.text).not.toContain('at ');
    expect((await call('GET', '/api/bestaat-niet', { token: adminToken })).status).toBe(404);
    const arr = await call('PUT', '/api/trekkenlijst/item', { token: adminToken, body: [1, 2, 3] });
    expect(arr.status).toBe(400);
  });

  test('configbestand is alleen leesbaar voor de eigenaar', () => {
    if (process.platform === 'win32') return;
    const mode = fs.statSync(path.join(dir, 'config.json')).mode & 0o777;
    expect(mode).toBe(0o600);
  });
});
