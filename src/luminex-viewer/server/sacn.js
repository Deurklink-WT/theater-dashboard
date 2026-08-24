'use strict';

/**
 * Minimale E1.31 (sACN) receiver, zonder externe dependencies.
 * Luistert op UDP 5568, joint multicast groepen voor een universe-bereik
 * en houdt per universe bij welke bronnen (consoles) er zenden.
 *
 * Windows: joint expliciet per netwerkadapter (addMembership + setMulticastInterface).
 */

const dgram = require('dgram');
const { resolveJoinAddresses } = require('./network');

const SACN_PORT = 5568;
const ACN_ID = Buffer.from([0x41, 0x53, 0x43, 0x2d, 0x45, 0x31, 0x2e, 0x31, 0x37, 0x00, 0x00, 0x00]);

const ACTIVE_TIMEOUT_MS = 3000;
const REMOVE_TIMEOUT_MS = 15000;

function multicastGroup(universe) {
  return `239.255.${(universe >> 8) & 0xff}.${universe & 0xff}`;
}

function parsePacket(msg, rinfo) {
  if (msg.length < 126) return null;
  if (msg.readUInt16BE(0) !== 0x0010) return null;
  if (!msg.subarray(4, 16).equals(ACN_ID)) return null;
  if (msg.readUInt32BE(18) !== 0x00000004) return null;
  const cid = msg.subarray(22, 38).toString('hex');
  const framingVector = msg.readUInt32BE(40);
  if (framingVector !== 0x00000002) return null;
  const rawName = msg.subarray(44, 108);
  const nul = rawName.indexOf(0);
  const name = rawName.subarray(0, nul === -1 ? 64 : nul).toString('utf8').trim();
  const priority = msg[108];
  const sequence = msg[111];
  const options = msg[112];
  const universe = msg.readUInt16BE(113);
  let propCount = msg.readUInt16BE(123);
  let startCode = msg[125];
  let dataStart = 126;
  let slots = Math.max(0, Math.min(propCount - 1, msg.length - dataStart));
  if (slots < 1 && msg.length > 126) {
    propCount = msg.readUInt16BE(122);
    startCode = msg[124];
    dataStart = 125;
    slots = Math.max(0, Math.min(propCount - 1, msg.length - dataStart));
  }
  const data = msg.subarray(dataStart, dataStart + slots);
  return {
    cid, name, ip: rinfo.address, priority, sequence, universe, startCode, data,
    preview: (options & 0x80) !== 0,
    terminated: (options & 0x40) !== 0,
  };
}

class SacnReceiver {
  constructor() {
    this.socket = null;
    this.error = null;
    this.warnings = [];
    this.range = { start: 1, end: 32 };
    this.ifaceConfig = '';
    this.joinPlan = { mode: 'auto', addresses: [], selected: '' };
    this.joined = new Set();
    this.universes = new Map();
    this.tick = null;
    this.stats = {
      packetsTotal: 0,
      packetsParsed: 0,
      lastPacketAt: 0,
      bindAddress: '',
    };
  }

  start(range, ifaceConfig) {
    this.stop();
    this.range = range;
    this.ifaceConfig = ifaceConfig || '';
    this.error = null;
    this.warnings = [];
    this.joinPlan = resolveJoinAddresses(this.ifaceConfig);

    if (this.joinPlan.addresses.length === 0) {
      this.error = 'Geen netwerkadapter gevonden. Controleer je netwerkverbinding.';
      return;
    }
    if (this.joinPlan.unknown) {
      this.warnings.push(`Adapter ${this.joinPlan.selected} niet herkend — wordt toch geprobeerd.`);
    }

    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.socket = socket;

    socket.on('error', (err) => {
      const msg = String(err.message || err);
      this.error = msg;
      if (/EADDRINUSE|address already in use/i.test(msg)) {
        this.warnings.push(
          'Poort 5568 is al in gebruik (bijv. door SACNViewer). Sluit andere sACN-tools of start alleen deze viewer.'
        );
      }
    });

    socket.on('message', (msg, rinfo) => {
      this.stats.packetsTotal++;
      this.stats.lastPacketAt = Date.now();
      this.onMessage(msg, rinfo);
    });

    // Expliciet op alle interfaces binden (vereist op Windows)
    socket.bind(SACN_PORT, '0.0.0.0', () => {
      this.stats.bindAddress = '0.0.0.0:' + SACN_PORT;
      try { socket.setRecvBufferSize(4 * 1024 * 1024); } catch (_) { /* optioneel */ }

      const joinErrors = [];
      for (let u = range.start; u <= range.end && u <= 63999; u++) {
        const group = multicastGroup(u);
        for (const addr of this.joinPlan.addresses) {
          try {
            socket.addMembership(group, addr);
            if (process.platform === 'win32') {
              try { socket.setMulticastInterface(addr); } catch (_) { /* per-join */ }
            }
            this.joined.add(`${group}@${addr}`);
          } catch (err) {
            joinErrors.push(`U${u} @ ${addr}: ${err.message}`);
          }
        }
      }

      if (this.joined.size === 0) {
        this.error = joinErrors[0] || 'Multicast join mislukt op alle adapters.';
      } else if (joinErrors.length) {
        this.warnings.push(`${joinErrors.length} join(s) mislukt (andere wel OK).`);
      }
    });

    this.tick = setInterval(() => this.onTick(), 1000);
  }

  stop() {
    if (this.tick) { clearInterval(this.tick); this.tick = null; }
    if (this.socket) {
      try { this.socket.close(); } catch (_) { /* al gesloten */ }
      this.socket = null;
    }
    this.joined.clear();
    this.universes.clear();
    this.stats = { packetsTotal: 0, packetsParsed: 0, lastPacketAt: 0, bindAddress: '' };
  }

  onMessage(msg, rinfo) {
    const pkt = parsePacket(msg, rinfo);
    if (!pkt) return;
    this.stats.packetsParsed++;

    let perUni = this.universes.get(pkt.universe);
    if (!perUni) {
      perUni = new Map();
      this.universes.set(pkt.universe, perUni);
    }
    let src = perUni.get(pkt.cid);
    if (!src) {
      src = {
        cid: pkt.cid, name: pkt.name, ip: pkt.ip,
        priority: pkt.priority, fps: 0, packetCount: 0,
        lastSeen: 0, preview: false, terminated: false,
        pap: false, activeChannels: 0, peak: 0, seqErrors: 0, lastSeq: -1,
        channels: new Uint8Array(512),
      };
      perUni.set(pkt.cid, src);
    }

    src.name = pkt.name || src.name;
    src.ip = pkt.ip;
    src.lastSeen = Date.now();
    src.preview = pkt.preview;
    src.terminated = pkt.terminated;

    if (pkt.startCode === 0xdd) { src.pap = true; return; }
    if (pkt.startCode !== 0x00) return;

    src.priority = pkt.priority;
    src.packetCount++;
    if (src.lastSeq >= 0) {
      const diff = (pkt.sequence - src.lastSeq + 256) % 256;
      if (diff !== 1 && diff < 200) src.seqErrors++;
    }
    src.lastSeq = pkt.sequence;

    // Partiële sACN-pakketten: alleen ontvangen slots bijwerken (rest behouden).
    const len = Math.min(pkt.data.length, 512);
    let active = 0, peak = 0;
    for (let i = 0; i < len; i++) src.channels[i] = pkt.data[i];
    for (let i = 0; i < 512; i++) {
      const v = src.channels[i];
      if (v > 0) active++;
      if (v > peak) peak = v;
    }
    src.activeChannels = active;
    src.peak = peak;
  }

  /** Winnende kanaalwaarden voor een universe (prioriteit of HTP bij gelijke prio). */
  universeChannels(universe) {
    const perUni = this.universes.get(universe);
    if (!perUni) {
      return { universe, active: false, channels: new Array(512).fill(0), sources: [], mergeType: null, winner: null };
    }

    const now = Date.now();
    const active = [];
    for (const src of perUni.values()) {
      const age = now - src.lastSeen;
      if (age >= ACTIVE_TIMEOUT_MS || src.terminated) continue;
      active.push(src);
    }
    if (!active.length) {
      return { universe, active: false, channels: new Array(512).fill(0), sources: [], mergeType: null, winner: null };
    }

    const maxPrio = Math.max(...active.map((s) => s.priority));
    const winners = active.filter((s) => s.priority === maxPrio);
    const mergeType = active.length > 1 ? (winners.length > 1 ? 'HTP' : 'PRIORITEIT') : null;
    const channels = new Array(512).fill(0);

    if (winners.length === 1) {
      for (let i = 0; i < 512; i++) channels[i] = winners[0].channels[i];
    } else {
      for (const src of winners) {
        for (let i = 0; i < 512; i++) {
          if (src.channels[i] > channels[i]) channels[i] = src.channels[i];
        }
      }
    }

    const top = winners[0];
    let activeCount = 0;
    let peak = 0;
    for (const v of channels) {
      if (v > 0) activeCount++;
      if (v > peak) peak = v;
    }

    return {
      universe,
      active: true,
      channels,
      mergeType,
      activeChannels: activeCount,
      peak,
      winner: {
        name: top.name || top.ip,
        ip: top.ip,
        priority: top.priority,
        fps: top.fps,
      },
      sources: active.map((s) => ({
        name: s.name || s.ip,
        ip: s.ip,
        priority: s.priority,
        fps: s.fps,
        winning: s.priority === maxPrio,
        activeChannels: s.activeChannels,
      })),
    };
  }

  onTick() {
    const now = Date.now();
    for (const [universe, perUni] of this.universes) {
      for (const [cid, src] of perUni) {
        src.fps = src.packetCount;
        src.packetCount = 0;
        if (now - src.lastSeen > REMOVE_TIMEOUT_MS) perUni.delete(cid);
      }
      if (perUni.size === 0) this.universes.delete(universe);
    }
  }

  hasRecentTraffic(windowMs = 10000) {
    if (this.stats.lastPacketAt && Date.now() - this.stats.lastPacketAt < windowMs) return true;
    const now = Date.now();
    for (const perUni of this.universes.values()) {
      for (const src of perUni.values()) {
        if (now - src.lastSeen < windowMs) return true;
      }
    }
    return false;
  }

  snapshot() {
    const now = Date.now();
    const sourcesById = new Map();
    const universes = [];

    for (const universe of [...this.universes.keys()].sort((a, b) => a - b)) {
      const perUni = this.universes.get(universe);
      const entries = [];
      for (const src of perUni.values()) {
        const age = now - src.lastSeen;
        const active = age < ACTIVE_TIMEOUT_MS && !src.terminated;
        const id = `src:${src.cid}`;
        if (!sourcesById.has(id)) {
          sourcesById.set(id, {
            id, cid: src.cid, name: src.name || `Bron ${src.ip}`,
            ip: src.ip, universes: [],
          });
        }
        sourcesById.get(id).universes.push({
          universe, priority: src.priority, fps: src.fps,
          active, preview: src.preview, pap: src.pap,
          activeChannels: src.activeChannels, peak: src.peak,
          seqErrors: src.seqErrors, lastSeenAgo: age,
          channels: active ? Array.from(src.channels) : null,
        });
        entries.push({ sourceId: id, priority: src.priority, fps: src.fps, active, pap: src.pap });
      }

      const activeEntries = entries.filter((e) => e.active);
      const maxPrio = activeEntries.length ? Math.max(...activeEntries.map((e) => e.priority)) : null;
      const winners = activeEntries.filter((e) => e.priority === maxPrio);
      for (const e of entries) e.winning = e.active && e.priority === maxPrio;

      const chData = this.universeChannels(universe);
      universes.push({
        universe, sources: entries,
        merged: activeEntries.length > 1,
        mergeType: activeEntries.length > 1 ? (winners.length > 1 ? 'HTP' : 'PRIORITEIT') : null,
        activeChannels: chData.activeChannels,
        peak: chData.peak,
        channels: chData.active ? chData.channels : (activeEntries.length ? new Array(512).fill(0) : null),
      });
    }

    const noPacketsYet = this.stats.packetsTotal === 0;
    const warnings = [...this.warnings];
    if (noPacketsYet && !this.error && this.joined.size > 0) {
      warnings.push(
        'Nog geen sACN-pakketten ontvangen. Controleer universe-bereik, netwerkadapter, en of SACNViewer dezelfde poort 5568 claimt.'
      );
    }

    return {
      sources: [...sourcesById.values()],
      universes,
      listener: {
        range: this.range,
        joined: this.joined.size,
        interfaces: this.joinPlan.addresses,
        interfaceMode: this.joinPlan.mode,
        selectedInterface: this.joinPlan.selected || 'auto',
        error: this.error,
        warnings,
        stats: { ...this.stats, ageMs: this.stats.lastPacketAt ? now - this.stats.lastPacketAt : null },
      },
    };
  }
}

module.exports = { SacnReceiver };
