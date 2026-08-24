'use strict';

/**
 * Subnet-scan voor LumiNodes op de geselecteerde netwerkadapter.
 */

const { listInterfaces } = require('./network');
const { normalizeHost } = require('./luminode');

const SCAN_TIMEOUT_MS = 1200;
const SCAN_CONCURRENCY = 48;
const MAX_HOSTS = 254;

function ipToInt(ip) {
  const parts = String(ip).split('.').map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

function cidrFromNetmask(netmask) {
  const mask = ipToInt(netmask);
  if (mask == null) return null;
  let bits = 0;
  for (let i = 31; i >= 0; i--) {
    if ((mask >>> i) & 1) bits++;
    else break;
  }
  return bits;
}

function hostsForAdapter(interfaceIp) {
  const { interfaces } = listInterfaces();
  const iface = interfaces.find((i) => i.address === interfaceIp);
  if (!iface) {
    return { error: `Adapter ${interfaceIp} niet gevonden. Vernieuw instellingen en kies een actieve adapter.` };
  }
  if (!iface.netmask) {
    return { error: `${iface.label || iface.name} heeft geen subnetmasker — geen scan mogelijk.` };
  }

  const ip = ipToInt(iface.address);
  const mask = ipToInt(iface.netmask);
  if (ip == null || mask == null) {
    return { error: 'Ongeldig IP of subnetmasker op de geselecteerde adapter.' };
  }

  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const hostCount = broadcast - network - 1;
  const cidr = cidrFromNetmask(iface.netmask);
  let scanBase = network;
  let scanEnd = broadcast;
  let limited = false;

  if (hostCount > MAX_HOSTS) {
    scanBase = (ip & 0xffffff00) >>> 0;
    scanEnd = scanBase + 255;
    limited = true;
  }

  const hosts = [];
  for (let h = scanBase + 1; h < scanEnd; h++) {
    if (h === ip) continue;
    hosts.push(intToIp(h));
  }

  const prefixBits = limited ? 24 : cidr;
  const prefix = intToIp(scanBase);
  return {
    interface: {
      name: iface.name,
      label: iface.label || iface.name,
      address: iface.address,
      netmask: iface.netmask,
    },
    subnet: `${prefix}/${prefixBits}`,
    limited,
    hosts,
  };
}

async function probeDeviceInfo(ip, password) {
  const host = normalizeHost(ip);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
  const started = Date.now();
  try {
    const headers = { Accept: 'application/json' };
    if (password) {
      headers.Authorization = `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`;
    }
    const res = await fetch(`http://${host}/api/deviceinfo`, { headers, signal: controller.signal });
    if (res.status === 401 || res.status === 403) {
      return { ip: host, needsPassword: true, ms: Date.now() - started };
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    const type = String(data.type || '').toLowerCase();
    const looksLikeLuminex = type.includes('lumi') || data.short_name || data.long_name || data.firmware;
    if (!looksLikeLuminex) return null;
    return {
      ip: host,
      name: data.short_name || data.long_name || host,
      type: data.type || 'LumiNode',
      firmware: data.firmware || data.software_version || null,
      ms: Date.now() - started,
    };
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
    while (index < items.length) {
      const i = index++;
      const result = await worker(items[i]);
      if (result) results.push(result);
    }
  });
  await Promise.all(runners);
  return results;
}

async function discoverNodes({ interfaceIp, password }) {
  const plan = hostsForAdapter(interfaceIp);
  if (plan.error) return { ok: false, error: plan.error };

  const started = Date.now();
  const found = await runPool(
    plan.hosts,
    (ip) => probeDeviceInfo(ip, password),
    SCAN_CONCURRENCY
  );

  found.sort((a, b) => {
    const aParts = a.ip.split('.').map(Number);
    const bParts = b.ip.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
    }
    return 0;
  });

  const needsPassword = found.filter((n) => n.needsPassword);

  return {
    ok: true,
    subnet: plan.subnet,
    limited: plan.limited,
    interface: plan.interface,
    scanned: plan.hosts.length,
    ms: Date.now() - started,
    nodes: found.filter((n) => !n.needsPassword),
    needsPassword,
  };
}

module.exports = { discoverNodes, hostsForAdapter };
