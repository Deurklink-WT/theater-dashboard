'use strict';

/**
 * Demo-modus: simuleert het hypothetische theaterscenario.
 *  - Huisconsole (grandMA3) zendt universe 1-6 met prioriteit 100
 *  - Gastconsole (Avolites) zendt universe 1-4; op universe 2 neemt de
 *    gast periodiek over met prioriteit 200 (takeover-demo)
 *  - Backup-console op universe 1 met lage prioriteit 50
 *  - Twee LumiNodes verdelen de universes naar DMX-poorten
 */

function jitter(base, spread) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * spread));
}

function demoSnapshot() {
  const now = Date.now();
  // Elke 20 seconden wisselt de gast tussen prio 100 (HTP-merge) en 200 (takeover)
  const guestTakeover = Math.floor(now / 20000) % 2 === 1;
  const guestPrioU2 = guestTakeover ? 200 : 100;

  const houseUni = [1, 2, 3, 4, 5, 6].map((u) => ({
    universe: u, priority: 100, fps: jitter(33, 6), active: true,
    preview: false, pap: false, activeChannels: jitter(180, 40), peak: 255,
    seqErrors: 0, lastSeenAgo: 0,
  }));

  const guestUni = [1, 2, 3, 4].map((u) => ({
    universe: u, priority: u === 2 ? guestPrioU2 : 100, fps: jitter(30, 8), active: true,
    preview: false, pap: false, activeChannels: jitter(96, 30), peak: 240,
    seqErrors: 0, lastSeenAgo: 0,
  }));

  const backupUni = [{
    universe: 1, priority: 50, fps: jitter(25, 4), active: true,
    preview: false, pap: false, activeChannels: 24, peak: 128,
    seqErrors: 0, lastSeenAgo: 0,
  }];

  const sources = [
    { id: 'src:demo-house', cid: 'demo-house', name: 'Huis — grandMA3 (FOH)', ip: '10.101.1.10', universes: houseUni },
    { id: 'src:demo-guest', cid: 'demo-guest', name: 'Gast — Avolites D9', ip: '10.101.1.50', universes: guestUni },
    { id: 'src:demo-backup', cid: 'demo-backup', name: 'Backup — Onyx', ip: '10.101.1.11', universes: backupUni },
  ];

  const universes = [];
  for (let u = 1; u <= 6; u++) {
    const entries = [];
    for (const src of sources) {
      const e = src.universes.find((x) => x.universe === u);
      if (e) entries.push({ sourceId: src.id, priority: e.priority, fps: e.fps, active: true, pap: false });
    }
    const maxPrio = Math.max(...entries.map((e) => e.priority));
    const winners = entries.filter((e) => e.priority === maxPrio);
    for (const e of entries) e.winning = e.priority === maxPrio;
    universes.push({
      universe: u,
      sources: entries,
      merged: entries.length > 1,
      mergeType: entries.length > 1 ? (winners.length > 1 ? 'HTP' : 'PRIORITEIT') : null,
    });
  }

  const mkEngine = (nodeId, idx, name, mode, unis, ports, liveSources) => ({
    id: `${nodeId}:engine:${idx}`,
    index: idx,
    name,
    mode,
    colors: [],
    selectedInput: 0,
    inputs: unis.map((u) => ({ path: 'demo', protocol: 'sacn', universe: u, priority: null, sourceIp: null, enabled: true })),
    liveSources: liveSources || [],
    outputPorts: ports,
    raw: { demo: true, mode, name },
  });

  const node1 = 'node:demo-toren';
  const node2 = 'node:demo-foh';

  const nodes = [
    {
      id: node1, ip: '10.101.2.21', name: 'LumiNode 12 — Toneeltoren', type: 'LumiNode 12',
      online: true, error: null, assumedMapping: false,
      engines: [
        mkEngine(node1, 0, 'Kap 1', 'forward', [1], [0], [{ slot: 0, ip: '10.101.1.10', name: 'grandMA3' }]),
        mkEngine(node1, 1, 'Kap 2', 'htp', [2], [1], [{ slot: 0, ip: '10.101.1.10', name: 'grandMA3' }, { slot: 1, ip: '10.101.1.50', name: 'Avolites D9' }]),
        mkEngine(node1, 2, 'Toneel L', 'forward', [3], [2], []),
        mkEngine(node1, 3, 'Toneel R', 'forward', [4], [3], []),
      ],
      ports: [0, 1, 2, 3].map((i) => ({
        id: `${node1}:port:${i}`, index: i, label: `DMX ${i + 1}`,
        state: 'outputting', direction: 'output', raw: { demo: true },
      })),
      deviceInfo: { type: 'LumiNode 12', serial: 'DEMO-0001' },
    },
    {
      id: node2, ip: '10.101.2.22', name: 'LumiNode 4 — FOH-rek', type: 'LumiNode 4',
      online: true, error: null, assumedMapping: false,
      engines: [
        mkEngine(node2, 0, 'Zaal voor', 'forward', [5], [0], []),
        mkEngine(node2, 1, 'Zaal achter', 'forward', [6], [1], []),
        mkEngine(node2, 2, 'Effecten', 'priority', [2], [2], []),
      ],
      ports: [0, 1, 2].map((i) => ({
        id: `${node2}:port:${i}`, index: i, label: `DMX ${i + 1}`,
        state: 'outputting', direction: 'output', raw: { demo: true },
      })),
      deviceInfo: { type: 'LumiNode 4', serial: 'DEMO-0002' },
    },
  ];

  return { sources, universes, nodes };
}

module.exports = { demoSnapshot };
