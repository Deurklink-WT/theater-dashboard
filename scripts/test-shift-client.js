#!/usr/bin/env node
/**
 * Snelle CLI-test tegen Shift-server (login + presence + health).
 * Gebruik: SHIFT_TEST_BASE=https://... SHIFT_TEST_EMAIL=... SHIFT_TEST_PASSWORD=... node scripts/test-shift-client.js
 */
const BASE = (process.env.SHIFT_TEST_BASE || '').replace(/\/$/, '');
const email = process.env.SHIFT_TEST_EMAIL || '';
const password = process.env.SHIFT_TEST_PASSWORD || '';

async function main() {
  if (!BASE) {
    console.error('SHIFT_TEST_BASE is verplicht (bijv. https://your-server.example.com)');
    process.exit(1);
  }
  console.log('Server:', BASE);
  const status = await fetch(`${BASE}/api/auth/status`).then((r) => r.json());
  console.log('Auth status:', status);

  if (!email || !password) {
    console.log('\nGeen SHIFT_TEST_EMAIL / SHIFT_TEST_PASSWORD — alleen status-check.');
    console.log('Voor volledige test:');
    console.log('  SHIFT_TEST_EMAIL=user@example.com SHIFT_TEST_PASSWORD=... node scripts/test-shift-client.js');
    return;
  }

  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shift-Client': 'test-script' },
    body: JSON.stringify({ email, password })
  });
  const loginBody = await login.json();
  if (!login.ok || !loginBody.token) {
    console.error('Login mislukt:', loginBody);
    process.exit(1);
  }
  console.log('Login OK:', loginBody.user?.email);

  const headers = {
    Authorization: `Bearer ${loginBody.token}`,
    'Content-Type': 'application/json',
    'X-Shift-Client': 'test-script'
  };

  const health = await fetch(`${BASE}/api/health`, { headers }).then((r) => r.json());
  console.log('Health (authed):', health);

  const presence = await fetch(`${BASE}/api/auth/presence`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ client: 'test-script', view: 'test' })
  }).then((r) => r.json());
  console.log('Presence:', presence);

  const connRes = await fetch(`${BASE}/api/admin/connections`, { headers });
  const connBody = await connRes.json().catch(() => ({}));
  console.log('Connections HTTP', connRes.status, connBody);
  if (!connRes.ok) {
    console.error('Connections ophalen mislukt — controlpanel kan niets tonen.');
    process.exit(1);
  }
  const list = connBody.connections || [];
  console.log(`Actieve sessies: ${list.length}`);
  list.forEach((c) => {
    console.log(`  - ${c.email} · ${c.client} · ${c.online ? 'online' : 'offline'} · idle ${c.idleSeconds}s`);
  });

  console.log('\n✓ Client-test geslaagd. Check /controlpanel → Verbonden clients.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
