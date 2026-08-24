'use strict';

/**
 * sACN Flow Viewer — server.
 * Zero-dependency: alleen Node.js (>= 18) nodig.
 *
 *   node server/index.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const { AppState } = require('./state');
const { listInterfaces, validateInterfaceSelection, sanitizeConfigInterface } = require('./network');
const { testNodeConnection, normalizeHost } = require('./luminode');
const { discoverNodes } = require('./discover');
const { createDiscoveryLoop } = require('./discovery-loop');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONFIG_PATH = path.join(ROOT, 'config.json');

const DEFAULT_CONFIG = {
  httpPort: 8765,
  mode: 'auto', // auto | live | demo
  universeRange: { start: 1, end: 32 },
  interface: 'auto',
  nodes: [],
  universeAliases: {},
  portAliases: {},
  sacnOutAliases: {},
};

function parseAliasMap(raw, keyPattern) {
  const map = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return map;
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k).trim();
    const val = String(v ?? '').trim();
    if (!key || !val || !keyPattern.test(key)) continue;
    map[key] = val.slice(0, 80);
  }
  return map;
}

function parseAliasText(text, type) {
  const map = {};
  if (!text || typeof text !== 'string') return map;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (type === 'universe') {
      const m = trimmed.match(/^(\d{1,5})\s*[=:]\s*(.+)$/);
      if (m) map[m[1]] = m[2].trim().slice(0, 80);
    } else if (type === 'port') {
      const m = trimmed.match(/^([^=:]+):(\d+)\s*[=:]\s*(.+)$/);
      if (m) map[`${normalizeHost(m[1])}:${m[2]}`] = m[3].trim().slice(0, 80);
    } else if (type === 'sacnOut') {
      const m = trimmed.match(/^([^/=:]+)\/(\d{1,5})\s*[=:]\s*(.+)$/);
      if (m) map[`${normalizeHost(m[1])}/${m[2]}`] = m[3].trim().slice(0, 80);
    }
  }
  return map;
}

function loadConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return {
      ...DEFAULT_CONFIG,
      ...raw,
      universeRange: { ...DEFAULT_CONFIG.universeRange, ...(raw.universeRange || {}) },
      universeAliases: { ...DEFAULT_CONFIG.universeAliases, ...(raw.universeAliases || {}) },
      portAliases: { ...DEFAULT_CONFIG.portAliases, ...(raw.portAliases || {}) },
      sacnOutAliases: { ...DEFAULT_CONFIG.sacnOutAliases, ...(raw.sacnOutAliases || {}) },
    };
  } catch (_) {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

let config = loadConfig();
const savedIface = config.interface;
config.interface = sanitizeConfigInterface(config.interface);
if (config.interface !== savedIface) saveConfig(config);

const state = new AppState(config);

const discoveryLoop = createDiscoveryLoop(
  () => config,
  (next) => { config = next; saveConfig(next); },
  (next) => { config = next; state.apply(next); }
);
state.discoverySnapshot = () => discoveryLoop.snapshot();
discoveryLoop.start();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const sseClients = new Set();

setInterval(() => {
  if (sseClients.size === 0) return;
  const payload = `data: ${JSON.stringify(state.snapshot())}\n\n`;
  for (const res of sseClients) res.write(payload);
}, 1000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(`data: ${JSON.stringify(state.snapshot())}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (url.pathname === '/api/snapshot') {
    json(res, 200, state.snapshot());
    return;
  }

  const uniChannelsMatch = url.pathname.match(/^\/api\/universe\/(\d+)\/channels$/);
  if (uniChannelsMatch && req.method === 'GET') {
    const data = state.getUniverseChannels(Number(uniChannelsMatch[1]));
    if (!data) { json(res, 400, { error: 'Ongeldig universe' }); return; }
    json(res, 200, data);
    return;
  }

  if (url.pathname === '/api/interfaces' && req.method === 'GET') {
    json(res, 200, listInterfaces());
    return;
  }

  if (url.pathname === '/api/nodes/discover' && req.method === 'POST') {
    try {
      const body = JSON.parse(await readBody(req) || '{}');
      const iface = String(body.interface || config.interface || '').trim();
      if (!iface || iface === 'auto') {
        json(res, 400, {
          error: 'Kies eerst een specifieke netwerkadapter (niet Automatisch) om het juiste subnet te scannen.',
        });
        return;
      }
      const result = await discoverNodes({
        interfaceIp: iface,
        password: body.password && body.password !== '••••' ? body.password : '',
      });
      json(res, result.ok ? 200 : 400, result);
    } catch (err) {
      console.error('[luminex] discover failed:', err && err.message ? err.message : err);
      json(res, 400, { error: 'Discovery mislukt' });
    }
    try {
      const body = JSON.parse(await readBody(req) || '{}');
      const ip = normalizeHost(body.ip);
      if (!ip) { json(res, 400, { error: 'IP-adres verplicht' }); return; }
      const existing = (config.nodes || []).find((n) => normalizeHost(n.ip) === ip);
      const password = body.password === '••••'
        ? (existing ? existing.password : '')
        : (body.password || '');
      const result = await testNodeConnection({ ip, password });
      json(res, 200, result);
    } catch (err) {
      console.error('[luminex] node test failed:', err && err.message ? err.message : err);
      json(res, 400, { error: 'Verbindingstest mislukt' });
    }
    if (req.method === 'GET') {
      const nets = listInterfaces();
      const safe = {
        ...config,
        interface: config.interface || 'auto',
        nodes: (config.nodes || []).map((n) => ({ ...n, password: n.password ? '••••' : '' })),
        network: nets,
      };
      json(res, 200, safe);
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = JSON.parse(await readBody(req) || '{}');
        const next = { ...config };
        if (body.mode && ['auto', 'live', 'demo'].includes(body.mode)) next.mode = body.mode;
        if (body.universeRange) {
          const start = Math.max(1, Math.min(63999, Number(body.universeRange.start) || 1));
          const end = Math.max(start, Math.min(63999, Number(body.universeRange.end) || start));
          if (end - start > 256) { json(res, 400, { error: 'Universe-bereik maximaal 256 groot (multicast joins).' }); return; }
          next.universeRange = { start, end };
        }
        if (typeof body.interface === 'string') {
          const iface = body.interface.trim();
          const nextIface = !iface || iface === 'auto' ? 'auto' : iface;
          if (nextIface !== 'auto') {
            const check = validateInterfaceSelection(nextIface);
            if (!check.ok) { json(res, 400, { error: check.error }); return; }
          }
          next.interface = nextIface;
        }
        if (Array.isArray(body.nodes)) {
          next.nodes = body.nodes
            .filter((n) => n && typeof n.ip === 'string' && n.ip.trim())
            .map((n) => {
              const ip = normalizeHost(n.ip);
              const existing = (config.nodes || []).find((o) => normalizeHost(o.ip) === ip);
              return {
                ip,
                name: (n.name || '').trim(),
                password: n.password === '••••' ? (existing ? existing.password : '') : (n.password || ''),
              };
            });
        }
        if (body.universeAliases != null) {
          next.universeAliases = typeof body.universeAliases === 'string'
            ? parseAliasText(body.universeAliases, 'universe')
            : parseAliasMap(body.universeAliases, /^\d{1,5}$/);
        }
        if (body.portAliases != null) {
          next.portAliases = typeof body.portAliases === 'string'
            ? parseAliasText(body.portAliases, 'port')
            : parseAliasMap(body.portAliases, /^[^:]+:\d+$/);
        }
        if (body.sacnOutAliases != null) {
          next.sacnOutAliases = typeof body.sacnOutAliases === 'string'
            ? parseAliasText(body.sacnOutAliases, 'sacnOut')
            : parseAliasMap(body.sacnOutAliases, /^[^/]+\/\d{1,5}$/);
        }
        config = next;
        saveConfig(config);
        state.apply(config);
        json(res, 200, { ok: true });
      } catch (err) {
        console.error('[luminex] config save failed:', err && err.message ? err.message : err);
        json(res, 400, { error: 'Config opslaan mislukt' });
      }
      return;
    }
  }

  if (req.method === 'GET') {
    serveStatic(req, res, url.pathname);
    return;
  }

  res.writeHead(405);
  res.end();
});

server.listen(config.httpPort, () => {
  const nets = listInterfaces();
  console.log(`sACN Flow Viewer draait op http://localhost:${config.httpPort}`);
  console.log(`Modus: ${config.mode} | Universe-bereik: ${config.universeRange.start}-${config.universeRange.end}`);
  const active = nets.interfaces.filter((i) => i.selectable).map((i) => i.address);
  const all = nets.interfaces.map((i) => {
    const title = i.label && i.label !== i.name ? `${i.label} (${i.name})` : i.name;
    return i.address ? `${title}: ${i.address}` : `${title}: inactief`;
  });
  console.log(`Netwerkadapter: ${config.interface || 'auto'} (${active.join(', ') || 'geen actief'})`);
  console.log(`Alle adapters (${nets.interfaces.length}): ${all.join(' | ')}`);
  console.log(`Geconfigureerde nodes: ${(config.nodes || []).map((n) => n.ip).join(', ') || 'geen (voeg toe via instellingen)'}`);
});

process.on('SIGINT', () => {
  discoveryLoop.stop();
  state.stop();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500);
});
