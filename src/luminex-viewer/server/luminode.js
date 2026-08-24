'use strict';

/**
 * Poller voor de Luminex LumiNode / LumiCore web-API (REST/JSON).
 * Gebruikt o.a.:
 *   GET /api/deviceinfo      -> naam, type, aantal poorten/engines
 *   GET /api/processblock    -> process engines: mode, sources, actieve input
 *   GET /api/IO              -> IO-tabel: sACN/Art-Net/DMX in- en uitgangen
 *   GET /api/dmx/ports       -> status per DMX-poort
 *
 * De engine-velden `inputs` en `outputs` zijn mappings slot -> IO-id;
 * de IO-tabel vertaalt die naar protocol + universe of DMX-poort.
 */

const POLL_INTERVAL_MS = 5000;
const FETCH_TIMEOUT_MS = 5000;

function normalizeHost(raw) {
  let host = String(raw || '').trim();
  host = host.replace(/^https?:\/\//i, '');
  host = host.replace(/\/.*$/, '');
  return host;
}

function friendlyFetchError(host, path, err, status) {
  const msg = String(err && err.message ? err.message : err || '');
  if (status === 401) return `${host}: wachtwoord verkeerd (HTTP 401)`;
  if (status === 403) return `${host}: geen toegang (HTTP 403)`;
  if (/abort|timeout/i.test(msg)) return `${host}: timeout — node niet bereikbaar op poort 80?`;
  if (/ECONNREFUSED/i.test(msg)) return `${host}: verbinding geweigerd — IP klopt? Node aan?`;
  if (/EHOSTUNREACH|ENETUNREACH/i.test(msg)) return `${host}: netwerk onbereikbaar — verkeerde subnet/VLAN?`;
  if (/ENOTFOUND/i.test(msg)) return `${host}: hostnaam niet gevonden`;
  if (/fetch failed/i.test(msg)) return `${host}: niet bereikbaar`;
  if (status) return `${host}: HTTP ${status} op /api/${path}`;
  return `${host}: verbinding mislukt`;
}

/** /api/processblock kan array, object-map of wrapper zijn — normaliseer naar array. */
function normalizeProcessblockList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    if (Array.isArray(raw.processblock)) return raw.processblock;
    if (Array.isArray(raw.processblocks)) return raw.processblocks;
    if (Array.isArray(raw.blocks)) return raw.blocks;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.engines)) return raw.engines;
    if (raw.id != null) return [raw];
    const keys = Object.keys(raw).filter((k) => /^\d+$/.test(k));
    if (keys.length > 0) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => {
          const v = raw[k];
          if (v && typeof v === 'object' && v.id == null) return { ...v, id: Number(k) };
          return v;
        })
        .filter(Boolean);
    }
  }
  return [];
}

async function fetchJson(host, path, password) {
  const ip = normalizeHost(host);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (password) {
      headers.Authorization = `Basic ${Buffer.from('admin:' + password).toString('base64')}`;
    }
    const res = await fetch(`http://${ip}/api/${path}`, { headers, signal: controller.signal });
    if (!res.ok) {
      const err = new Error(friendlyFetchError(ip, path, null, res.status));
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    if (!err.status) throw new Error(friendlyFetchError(ip, path, err));
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Eenmalige connectietest (voor UI). */
async function testNodeConnection(nodeConfig) {
  const ip = normalizeHost(nodeConfig.ip);
  const password = nodeConfig.password || '';
  const started = Date.now();
  try {
    const deviceInfo = await fetchJson(ip, 'deviceinfo', password);
    return {
      ok: true,
      ip,
      ms: Date.now() - started,
      name: deviceInfo.short_name || deviceInfo.long_name || ip,
      type: deviceInfo.type || 'LumiNode',
      firmware: deviceInfo.firmware || deviceInfo.software_version || null,
    };
  } catch (err) {
    // Geen raw exception-tekst naar de UI: friendlyFetchError mapt al naar vaste meldingen.
    const status = err && err.status ? err.status : undefined;
    return {
      ok: false,
      ip,
      ms: Date.now() - started,
      error: friendlyFetchError(ip, 'deviceinfo', err, status),
    };
  }
}

/**
 * Vertaal de engine-mappings (slot -> IO-id) naar concrete in- en uitgangen
 * met behulp van de IO-tabel van de node.
 */
function resolveEngineIO(pb, ioById) {
  const inputs = [];
  for (const [slot, ioId] of Object.entries(pb.inputs || {})) {
    const io = ioById.get(Number(ioId));
    if (!io) continue;
    const base = { slot: Number(slot), ioId: Number(ioId), enabled: true };
    if (io.io_class === 'sacn' || io.io_class === 'artnet') {
      inputs.push({
        ...base,
        protocol: io.io_class,
        universe: Number(io.universe),
        priority: io.priority != null ? Number(io.priority) : null,
        sourceIp: io.source_ip && io.source_ip !== '0.0.0.0' ? io.source_ip : null,
      });
    } else if (io.io_class === 'dmx') {
      inputs.push({ ...base, protocol: 'dmx', universe: null, port: io.port_number });
    } else if (io.io_class === 'internal') {
      inputs.push({ ...base, protocol: 'engine', universe: null, fromEngine: io.pb_number });
    } else {
      inputs.push({ ...base, protocol: String(io.io_class || 'onbekend'), universe: io.universe != null ? Number(io.universe) : null });
    }
  }

  const outputPorts = [];
  const outputUniverses = [];
  for (const ioId of Object.values(pb.outputs || {})) {
    const io = ioById.get(Number(ioId));
    if (!io) continue;
    if (io.io_class === 'dmx') {
      outputPorts.push(io.port_number);
    } else if (io.io_class === 'sacn' || io.io_class === 'artnet') {
      outputUniverses.push({
        protocol: io.io_class,
        universe: Number(io.universe),
        priority: io.priority != null ? Number(io.priority) : null,
      });
    }
  }
  return { inputs, outputPorts, outputUniverses };
}

/**
 * Fallback (oudere firmware zonder /api/IO): zoek tolerant naar
 * input-definities (protocol + universe) in een processblock-object.
 */
function extractInputs(pb) {
  const found = [];
  const visit = (obj, path) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => visit(v, `${path}/${i}`));
      return;
    }
    if (Object.prototype.hasOwnProperty.call(obj, 'universe')) {
      const lower = path.toLowerCase();
      const isOutput = lower.includes('output');
      if (!isOutput) {
        let protocol = obj.protocol || obj.type || '';
        if (!protocol) {
          if (lower.includes('sacn')) protocol = 'sacn';
          else if (lower.includes('artnet') || lower.includes('art-net')) protocol = 'artnet';
        }
        found.push({
          path,
          protocol: String(protocol || 'onbekend').toLowerCase(),
          universe: Number(obj.universe),
          priority: obj.priority != null ? Number(obj.priority) : null,
          sourceIp: obj.ip || obj.source_ip || null,
          enabled: obj.enabled !== false,
        });
      }
    }
    for (const k of Object.keys(obj)) visit(obj[k], `${path}/${k}`);
  };
  visit(pb, '');
  // dedupliceren op protocol+universe
  const seen = new Set();
  return found.filter((f) => {
    const key = `${f.protocol}:${f.universe}:${f.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Zoek tolerant naar output-poortnummers in een processblock-object. */
function extractOutputPorts(pb) {
  const ports = new Set();
  const visit = (obj, path) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => visit(v, `${path}/${i}`));
      return;
    }
    const lower = path.toLowerCase();
    if (lower.includes('output')) {
      for (const key of ['port', 'dmx_port', 'ports', 'dmx']) {
        const v = obj[key];
        if (typeof v === 'number') ports.add(v);
        if (Array.isArray(v)) v.forEach((p) => { if (typeof p === 'number') ports.add(p); });
      }
    }
    for (const k of Object.keys(obj)) visit(obj[k], `${path}/${k}`);
  };
  visit(pb, '');
  return [...ports];
}

class LuminodePoller {
  constructor(nodeConfig) {
    this.ip = normalizeHost(nodeConfig.ip);
    this.label = nodeConfig.name || '';
    this.password = nodeConfig.password || '';
    this.online = false;
    this.error = null;
    this.deviceInfo = null;
    this.processblocks = [];
    this.ports = [];
    this.ios = [];
    this.lastOk = 0;
    this.timer = null;
  }

  start() {
    this.stop();
    this.poll();
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  async poll() {
    try {
      const [deviceInfo, processblocks, ports, ios] = await Promise.all([
        fetchJson(this.ip, 'deviceinfo', this.password),
        fetchJson(this.ip, 'processblock', this.password).catch(() => []),
        fetchJson(this.ip, 'dmx/ports', this.password).catch(() => []),
        fetchJson(this.ip, 'IO', this.password).catch(() => []),
      ]);
      this.deviceInfo = deviceInfo;
      this.processblocks = normalizeProcessblockList(processblocks);
      const nrPb = Number(this.deviceInfo?.nr_processblocks);
      if (!Number.isNaN(nrPb) && nrPb > this.processblocks.length) {
        const have = new Set(this.processblocks.map((pb, idx) => (pb && pb.id != null ? Number(pb.id) : idx)));
        for (let k = 0; k < nrPb; k++) {
          if (!have.has(k)) this.processblocks.push({ id: k, name: `Engine ${k + 1}`, inputs: {}, outputs: {} });
        }
        this.processblocks.sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
      }
      this.ports = Array.isArray(ports) ? ports : [];
      this.ios = Array.isArray(ios) ? ios : [];
      this.online = true;
      this.error = null;
      this.lastOk = Date.now();
    } catch (err) {
      this.online = false;
      const status = err && err.status ? err.status : undefined;
      this.error = friendlyFetchError(this.ip, 'poll', err, status);
    }
  }

  /** Genormaliseerde weergave voor de frontend. */
  view() {
    const id = `node:${this.ip}`;
    const di = this.deviceInfo || {};
    const ioById = new Map(this.ios.map((io) => [Number(io.id), io]));
    const hasIoTable = this.ios.length > 0;

    const engines = this.processblocks.map((pb, idx) => {
      const pbId = pb.id != null ? pb.id : idx;
      const sources = pb.sources && Array.isArray(pb.sources.inputs) ? pb.sources.inputs : [];
      const resolved = hasIoTable
        ? resolveEngineIO(pb, ioById)
        : { inputs: extractInputs(pb), outputPorts: extractOutputPorts(pb), outputUniverses: [] };
      return {
        id: `${id}:engine:${pbId}`,
        index: pbId,
        name: pb.name || `Engine ${pbId + 1}`,
        mode: String(pb.mode || 'forward').toLowerCase(),
        colors: pb.colors || [],
        selectedInput: pb.summarized_active_input != null ? pb.summarized_active_input : null,
        inputs: resolved.inputs,
        liveSources: sources.map((s, i) => (s ? { slot: i, ip: s.ip || null, name: s.name || null, priority: s.priority != null ? s.priority : null } : null)),
        outputPorts: resolved.outputPorts,
        outputUniverses: resolved.outputUniverses,
        raw: pb,
      };
    });

    // Fallback: standaard LumiNode-config is 1 engine per DMX-poort.
    const portCount = this.ports.length || Number(di.nr_dmx_ports) || 0;
    let assumedMapping = false;
    if (!hasIoTable && engines.length && engines.every((e) => e.outputPorts.length === 0) && portCount === engines.length) {
      engines.forEach((e, i) => { e.outputPorts = [i]; });
      assumedMapping = true;
    }

    // Labels uit de IO-tabel (io_class 'dmx' heeft name + port_number)
    const dmxIoByPort = new Map(
      this.ios.filter((io) => io.io_class === 'dmx').map((io) => [Number(io.port_number), io])
    );

    const ports = (this.ports.length ? this.ports : Array.from({ length: portCount }, () => ({}))).map((p, i) => {
      const io = dmxIoByPort.get(i);
      return {
        id: `${id}:port:${i}`,
        index: i,
        label: (io && io.name) || p.name || `DMX ${i + 1}`,
        state: p.stream_activity_state != null ? String(p.stream_activity_state) : null,
        direction: (io && io.io_type) || p.direction || p.mode || null,
        raw: p,
      };
    });

    return {
      id,
      ip: this.ip,
      name: this.label || di.short_name || di.long_name || `LumiNode ${this.ip}`,
      type: di.type || 'LumiNode',
      online: this.online,
      error: this.error,
      assumedMapping,
      engines,
      ports,
      ios: this.ios,
      deviceInfo: di,
    };
  }
}

module.exports = { LuminodePoller, testNodeConnection, normalizeHost };
