'use strict';

const { listInterfaces } = require('./network');
const { discoverNodes } = require('./discover');
const { normalizeHost } = require('./luminode');

const SCAN_INTERVAL_MS = 60000;

function resolveScanInterface(config) {
  const raw = String(config.interface || '').trim();
  const { interfaces, recommended } = listInterfaces();
  const selectable = interfaces.filter((i) => i.selectable);

  if (raw && raw !== 'auto') {
    const match = selectable.find((i) => i.address === raw);
    if (match) return match.address;
    return '';
  }

  if (recommended) return recommended;
  return selectable[0] ? selectable[0].address : '';
}

function mergeDiscoveredNodes(config, found) {
  const nodes = [...(config.nodes || [])];
  const known = new Set(nodes.map((n) => normalizeHost(n.ip)));
  let added = 0;

  for (const item of found) {
    if (!item || !item.ip || item.needsPassword) continue;
    const ip = normalizeHost(item.ip);
    if (!ip || known.has(ip)) continue;
    nodes.push({ ip, name: item.name || '', password: '' });
    known.add(ip);
    added++;
  }

  return { nodes, added };
}

function createDiscoveryLoop(getConfig, saveConfig, onConfigApplied) {
  const status = {
    enabled: true,
    scanning: false,
    lastScanAt: 0,
    lastAdded: 0,
    lastFound: [],
    lastError: null,
    interface: '',
  };

  let timer = null;
  let running = false;

  async function scan() {
    if (running) return;
    const config = getConfig();
    const iface = resolveScanInterface(config);
    status.interface = iface;

    if (!iface) {
      status.lastError = 'Geen bruikbare netwerkadapter voor auto-discovery';
      return;
    }

    running = true;
    status.scanning = true;
    status.lastError = null;

    try {
      const result = await discoverNodes({ interfaceIp: iface, password: '' });
      status.lastScanAt = Date.now();

      if (!result.ok) {
        status.lastError = result.error || 'Scan mislukt';
        status.lastFound = [];
        return;
      }

      status.lastFound = result.nodes || [];
      const merged = mergeDiscoveredNodes(config, status.lastFound);
      if (merged.added > 0) {
        const next = { ...config, nodes: merged.nodes };
        saveConfig(next);
        onConfigApplied(next);
        status.lastAdded = merged.added;
        console.log(`Auto-discovery: ${merged.added} node(s) toegevoegd (${status.lastFound.map((n) => n.ip).join(', ')})`);
      } else {
        status.lastAdded = 0;
      }
    } catch (err) {
      status.lastError = String(err.message || err);
    } finally {
      status.scanning = false;
      running = false;
    }
  }

  function start() {
    if (timer) return;
    setTimeout(scan, 8000);
    timer = setInterval(scan, SCAN_INTERVAL_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function snapshot() {
    return { ...status };
  }

  return { start, stop, scan, snapshot };
}

module.exports = { createDiscoveryLoop, resolveScanInterface, mergeDiscoveredNodes };
