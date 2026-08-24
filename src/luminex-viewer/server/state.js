'use strict';

/**
 * Combineert live sACN-data en LumiNode-API-data tot één snapshot
 * voor de frontend. Beslist ook over de modus (live/demo/auto).
 */

const { SacnReceiver } = require('./sacn');
const { LuminodePoller } = require('./luminode');
const { demoSnapshot } = require('./demo');

class AppState {
  constructor(config) {
    this.config = config;
    this.sacn = new SacnReceiver();
    this.pollers = [];
    this.apply(config);
  }

  apply(config) {
    this.config = config;
    this.sacn.start(
      {
        start: Math.max(1, Number(config.universeRange.start) || 1),
        end: Math.min(63999, Number(config.universeRange.end) || 32),
      },
      config.interface || 'auto'
    );
    for (const p of this.pollers) p.stop();
    this.pollers = (config.nodes || [])
      .filter((n) => n && n.ip)
      .map((n) => {
        const poller = new LuminodePoller(n);
        poller.start();
        return poller;
      });
  }

  stop() {
    this.sacn.stop();
    for (const p of this.pollers) p.stop();
  }

  effectiveMode() {
    const mode = this.config.mode || 'auto';
    if (mode !== 'auto') return mode;
    const anyNodeOnline = this.pollers.some((p) => p.online);
    const anyTraffic = this.sacn.hasRecentTraffic();
    return anyNodeOnline || anyTraffic ? 'live' : 'demo';
  }

  aliasMeta(nodes) {
    const universeAliases = { ...(this.config.universeAliases || {}) };
    const portAliases = { ...(this.config.portAliases || {}) };
    const sacnOutAliases = { ...(this.config.sacnOutAliases || {}) };

    for (const node of nodes || []) {
      for (const io of node.ios || []) {
        if (io.io_class === 'sacn' && io.name && io.universe != null && String(io.io_type || '').toLowerCase() !== 'output') {
          const key = String(io.universe);
          if (!universeAliases[key]) universeAliases[key] = String(io.name).trim();
        }
        if (io.io_class === 'dmx' && io.name && io.port_number != null) {
          const key = `${node.ip}:${io.port_number}`;
          if (!portAliases[key]) portAliases[key] = String(io.name).trim();
        }
      }
      for (const eng of node.engines || []) {
        for (const out of eng.outputUniverses || []) {
          if (out.protocol !== 'sacn' || !Number.isFinite(out.universe)) continue;
          const key = `${node.ip}/${out.universe}`;
          if (sacnOutAliases[key]) continue;
          const io = (node.ios || []).find(
            (i) => i.io_class === 'sacn' && Number(i.universe) === out.universe
          );
          if (io?.name) sacnOutAliases[key] = String(io.name).trim();
        }
      }
    }

    return { universeAliases, portAliases, sacnOutAliases };
  }

  getUniverseChannels(universe) {
    const u = Number(universe);
    if (!Number.isFinite(u) || u < 1) return null;
    if (this.effectiveMode() === 'demo') return demoUniverseChannels(u);
    return this.sacn.universeChannels(u);
  }

  snapshot() {
    const mode = this.effectiveMode();
    const discovery = this.discoverySnapshot ? this.discoverySnapshot() : null;
    if (mode === 'demo') {
      const demo = demoSnapshot();
      demo.universes = demo.universes.map((u) => {
        const ch = demoUniverseChannels(u.universe);
        return {
          ...u,
          activeChannels: ch.activeChannels,
          peak: ch.peak,
          channels: ch.channels,
        };
      });
      const listener = this.sacn.snapshot().listener;
      return {
        mode: 'demo',
        configuredMode: this.config.mode || 'auto',
        generatedAt: Date.now(),
        channelStream: true,
        listener,
        discovery,
        ...this.aliasMeta([]),
        ...demo,
      };
    }

    const live = this.sacn.snapshot();
    const nodes = this.pollers.map((p) => p.view());
    const aliases = this.aliasMeta(nodes);

    // Bronnen die vanaf een geconfigureerde node komen zijn geen console
    // maar een sACN-uitgang van die node: markeren zodat de frontend ze
    // bij de node tekent in plaats van in de bronnen-kolom.
    for (const src of live.sources) {
      const node = nodes.find((n) => n.ip === src.ip);
      if (node) src.viaNode = node.id;
    }
    const viaNodeIds = new Set(live.sources.filter((s) => s.viaNode).map((s) => s.id));
    for (const uni of live.universes) {
      for (const entry of uni.sources) {
        if (viaNodeIds.has(entry.sourceId)) entry.viaNode = true;
      }
    }

    // Universes die nodes verwachten (inputs) of zelf uitsturen (outputs)
    // maar waar (nog) geen live verkeer op is, toch tonen.
    const known = new Set(live.universes.map((u) => u.universe));
    const ensureUniverse = (u) => {
      if (!Number.isFinite(u) || known.has(u)) return;
      known.add(u);
      live.universes.push({ universe: u, sources: [], merged: false, mergeType: null });
    };
    for (const node of nodes) {
      for (const engine of node.engines) {
        for (const input of engine.inputs) {
          if (input.protocol === 'sacn') ensureUniverse(input.universe);
        }
        for (const out of engine.outputUniverses || []) {
          if (out.protocol === 'sacn') ensureUniverse(out.universe);
        }
      }
    }
    live.universes.sort((a, b) => a.universe - b.universe);

    return {
      mode: 'live',
      configuredMode: this.config.mode || 'auto',
      generatedAt: Date.now(),
      channelStream: true,
      listener: live.listener,
      discovery,
      ...aliases,
      sources: live.sources,
      universes: live.universes,
      nodes,
    };
  }
}

/** Demo-kanaaldata voor het DMX-venster. */
function demoUniverseChannels(universe) {
  const t = Date.now() / 1000;
  const channels = new Array(512).fill(0);
  for (let i = 0; i < 48; i++) {
    channels[i] = Math.max(0, Math.min(255, Math.round(
      128 + 100 * Math.sin(t * 0.7 + i * 0.35 + universe * 0.5)
    )));
  }
  channels[0] = 255;
  let activeChannels = 0;
  let peak = 0;
  for (const v of channels) {
    if (v > 0) activeChannels++;
    if (v > peak) peak = v;
  }
  return {
    universe,
    active: true,
    channels,
    mergeType: universe <= 4 ? 'HTP' : null,
    activeChannels,
    peak,
    winner: { name: 'Demo — grandMA3', ip: '10.101.1.10', priority: 100, fps: 33 },
    sources: [
      { name: 'Demo — grandMA3', ip: '10.101.1.10', priority: 100, fps: 33, winning: true, activeChannels },
    ],
  };
}

module.exports = { AppState };
