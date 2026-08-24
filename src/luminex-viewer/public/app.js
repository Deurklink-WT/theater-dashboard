'use strict';

/* ============================================================
   sACN Flow Viewer — frontend
   Kolommen: Bronnen -> sACN In -> Nodes -> Uitgangen (sACN + DMX)
   Verbindingen worden als SVG-paden getekend en geanimeerd.
   ============================================================ */

const state = {
  snap: null,
  selected: null,
  connected: false,
  dmxView: null,
  idleUniversesExpanded: false,
};

const PALETTE = [
  '#4cc2ff', '#ff8a3d', '#41d98d', '#c084fc', '#ffd166',
  '#ff5d8f', '#5eead4', '#a3e635', '#f97316', '#818cf8',
];

function colorForSource(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const COPY = {
  appTitle: 'Lichtsignaal Viewer',
  stream: 'Stream',
  streamShort: (n) => `Stream ${n}`,
  streamTag: (n, snap) => {
    const alias = universeAlias(n, snap);
    return alias || `#${n}`;
  },
  priority: (p) => `Prioriteit ${p}`,
  refresh: (fps) => (fps > 0 ? `${fps}× per seconde` : 'geen signaal'),
  refreshShort: (fps) => (fps > 0 ? `${fps}×/s` : 'stil'),
  winner: '★ wint',
  mergeBadge: 'Meerdere bronnen',
  liveBadge: 'Actief',
  inferredBadge: 'Via DMX',
  waiting: 'Wacht op signaal',
  configuredIdle: 'Klaargezet · nog geen signaal',
  configuredOff: 'Klaargezet · uit',
  sacnOutLive: 'Zendt naar netwerk',
  sacnOutInferred: 'DMX actief · netwerk-uit stil',
  engineLive: (name, ch) => `● binnen: ${name}${ch != null ? ` (${COPY.streamShort(ch)})` : ''}`,
  engineIdle: 'Nog geen signaal binnen',
  route: 'Route',
  modes: {
    forward: 'Doorsturen',
    htp: 'Hoogste waarde wint',
    ltp: 'Laatste signaal wint',
    priority: 'Prioriteit',
    backup: 'Reserve',
    switch: 'Schakelaar',
    crossfade: 'Overblend',
    xfade: 'Overblend',
    custom: 'Aangepast',
  },
};

function fmtPriority(p) { return COPY.priority(p); }

function fmtRefresh(fps, short) {
  return short ? COPY.refreshShort(fps) : COPY.refresh(fps);
}

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function universeAlias(n, snap) {
  return (snap && snap.universeAliases && snap.universeAliases[String(n)]) || '';
}

function universeLabel(n, snap, opts = {}) {
  const alias = universeAlias(n, snap);
  if (opts.short) return COPY.streamTag(n, snap);
  if (alias && opts.aliasOnly) return alias;
  if (alias) return `${alias} (${COPY.streamShort(n)})`;
  return `${COPY.stream} ${n}`;
}

/** Compacte weergave van actieve bronnen op een engine. */
function formatLiveInputs(live, snap) {
  if (!live.length) return '';
  const byName = new Map();
  for (const s of live) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    if (s.universe != null) byName.get(s.name).push(COPY.streamTag(s.universe, snap));
  }
  return [...byName.entries()]
    .map(([name, tags]) => (tags.length ? `${name} · ${tags.join(' + ')}` : name))
    .join(' · ');
}

function portAliasKey(node, portIndex) {
  return `${node.ip}:${portIndex}`;
}

function sacnOutAliasKey(nodeIp, universe) {
  return `${nodeIp}/${universe}`;
}

function sacnOutAlias(nodeIp, universe, snap) {
  const key = sacnOutAliasKey(nodeIp, universe);
  return (snap && snap.sacnOutAliases && snap.sacnOutAliases[key]) || '';
}

/** Naam voor een sACN-uitgang op een specifiek apparaat (los van binnenkomende streams). */
function sacnOutLabel(universe, nodeIp, snap, opts = {}) {
  const outAlias = sacnOutAlias(nodeIp, universe, snap);
  const streamAlias = universeAlias(universe, snap);
  const alias = outAlias || streamAlias;
  if (opts.short) return alias || COPY.streamTag(universe, snap);
  if (alias) return `${alias} (${COPY.streamShort(universe)})`;
  return `${COPY.stream} ${universe}`;
}

function portDisplayLabel(port, node, snap) {
  const alias = snap && snap.portAliases && snap.portAliases[portAliasKey(node, port.index)];
  return alias || port.label;
}

function aliasesToText(map) {
  return Object.entries(map || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

function portAliasesToText(map) {
  return Object.entries(map || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

function sacnOutAliasesToText(map) {
  return Object.entries(map || {})
    .sort((a, b) => {
      const [aIp, aU] = a[0].split('/');
      const [bIp, bU] = b[0].split('/');
      return aIp.localeCompare(bIp) || Number(aU) - Number(bU);
    })
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

function dmxBtn(universe) {
  const active = state.dmxView && state.dmxView.universe === universe;
  return `<button type="button" class="btn-dmx${active ? ' active' : ''}" data-dmx-universe="${universe}" title="Toon lichtniveaus">DMX</button>`;
}

function dmxInlineHtml(universe) {
  return `
    <div class="dmx-inline" data-dmx-slot="${universe}">
      <div class="dmx-inline-readout hidden"></div>
      <div class="dmx-value-strip" data-dmx-strip></div>
      <div class="dmx-matrix" data-dmx-grid="${universe}"></div>
    </div>`;
}

/* ---------------- SSE-verbinding ---------------- */

function connect() {
  const es = new EventSource('/events');
  es.onmessage = (ev) => {
    state.connected = true;
    state.snap = JSON.parse(ev.data);
    render();
  };
  es.onerror = () => {
    state.connected = false;
    renderStatus();
    // EventSource herverbindt zelf
  };
}

/* ---------------- grafiekmodel ---------------- */

function uniId(u) { return `uni:${u}`; }
function deviceId(ip) { return `device:${ip}`; }
function outUniId(u) { return `outuni:${u}`; }
function outGroupId(nodeId) { return `outgroup:${nodeId}`; }

/** Alle universe-nummers die als sACN-uitgang op een node geconfigureerd zijn. */
function getOutputUniverseSet(snap) {
  const set = new Set();
  for (const node of snap.nodes) {
    for (const eng of node.engines) {
      for (const out of eng.outputUniverses || []) {
        if (out.protocol === 'sacn' && Number.isFinite(out.universe)) set.add(out.universe);
      }
    }
  }
  return set;
}

/** Consoles/senders met hetzelfde IP samenvoegen tot één kaart. */
function groupConsoleSources(sources) {
  const map = new Map();
  for (const src of sources.filter((s) => !s.viaNode)) {
    const key = src.ip || src.id;
    if (!map.has(key)) {
      map.set(key, { id: deviceId(key), ip: key, name: src.name, sourceIds: [], universes: [] });
    }
    const g = map.get(key);
    g.sourceIds.push(src.id);
    if (src.name && (!g.name || src.name.length >= g.name.length)) g.name = src.name;
    for (const u of src.universes) {
      const ex = g.universes.find((x) => x.universe === u.universe);
      if (!ex) g.universes.push({ ...u });
      else if (u.active || (u.fps || 0) > (ex.fps || 0)) Object.assign(ex, u);
    }
  }
  return [...map.values()].map((g) => {
    g.universes.sort((a, b) => a.universe - b.universe);
    return g;
  });
}

/** sACN-uitgangen per node gegroepeerd (één kaart per device). */
function buildOutputGroups(snap) {
  const groups = [];
  for (const node of snap.nodes) {
    const entries = [];
    const seen = new Set();
    const nodeSrc = snap.sources.find((s) => s.viaNode === node.id);
    for (const eng of node.engines) {
      for (const out of eng.outputUniverses || []) {
        if (out.protocol !== 'sacn' || !Number.isFinite(out.universe)) continue;
        if (seen.has(out.universe)) {
          const e = entries.find((x) => x.universe === out.universe);
          if (e && !e.engines.includes(eng.name)) e.engines.push(eng.name);
          continue;
        }
        seen.add(out.universe);
        const liveU = nodeSrc?.universes.find((u) => u.universe === out.universe);
        const entry = {
          universe: out.universe,
          id: outUniId(out.universe),
          engines: [eng.name],
          active: !!(liveU?.active),
          fps: liveU?.fps || 0,
          priority: liveU?.priority ?? out.priority,
        };
        entry.outputStatus = sacnOutputStatus(entry, node, snap);
        entries.push(entry);
      }
    }
    if (!entries.length) continue;
    entries.sort((a, b) => a.universe - b.universe);
    groups.push({
      id: outGroupId(node.id),
      nodeId: node.id,
      nodeName: node.name,
      nodeIp: node.ip,
      universes: entries,
      anyActive: entries.some((e) => e.active),
    });
  }
  return groups;
}

function inputUniverses(snap) {
  const outputSet = getOutputUniverseSet(snap);
  return snap.universes.filter((u) => !outputSet.has(u.universe));
}

function isMergeEngine(mode) {
  return ['ltp', 'htp', 'priority', 'backup', 'crossfade', 'xfade'].includes(String(mode || '').toLowerCase());
}

function isEngineDownstreamActive(eng, node, snap) {
  for (const portIdx of eng.outputPorts) {
    const port = node.ports[portIdx];
    if (port && isDmxPortActive(port.state)) return true;
  }
  const nodeSrc = snap.sources.find((s) => s.viaNode === node.id);
  for (const out of eng.outputUniverses || []) {
    if (nodeSrc?.universes.some((u) => u.universe === out.universe && u.active)) return true;
  }
  return false;
}

function streamLabelOnUniverse(snap, universeNum, viaNode) {
  const alias = universeAlias(universeNum, snap);
  if (viaNode) return alias ? `↺ ${alias}` : `↺ ${COPY.streamShort(universeNum)}`;
  const uni = snap.universes.find((u) => u.universe === universeNum);
  const win = uni?.sources.find((s) => s.winning && !s.viaNode);
  if (!win) return alias || COPY.streamShort(universeNum);
  const src = snap.sources.find((s) => s.id === win.sourceId);
  const short = src?.name ? src.name.split(/[@\s]/)[0].slice(0, 12) : '';
  const tag = alias || COPY.streamShort(universeNum);
  return short ? `${short} · ${tag}` : tag;
}

/** Herken actieve DMX-poortstatus (Luminex: streaming, outputting, …). */
function isDmxPortActive(state) {
  if (!state) return false;
  return /stream|output|input|active|on|tx|live/i.test(String(state));
}

function engineForDmxPort(node, portIndex) {
  return node.engines.find((e) => e.outputPorts.includes(portIndex)) || null;
}

/** Welke sACN-universes deze engine als input heeft en welke live zijn. */
function describeEngineFeed(eng, snap) {
  if (!eng) return { uniList: '', mode: '', liveOnNet: [], liveFromNode: [], summary: '' };
  const sacnIn = eng.inputs.filter((i) => i.protocol === 'sacn' && Number.isFinite(i.universe));
  const uniList = sacnIn.map((i) => COPY.streamTag(i.universe, snap)).join(', ');
  const mode = modeLabel(eng.mode);

  const liveOnNet = sacnIn.filter((i) => {
    const uni = snap.universes.find((u) => u.universe === i.universe);
    return uni && uni.sources.some((s) => s.active && !s.viaNode);
  }).map((i) => i.universe);

  const liveFromNode = (eng.liveSources || []).filter(Boolean).map((ls) => {
    const inp = sacnIn.find((i) => i.slot === ls.slot);
    return {
      universe: inp ? inp.universe : null,
      name: ls.name || ls.ip,
      slot: ls.slot,
    };
  });

  let summary = '';
  if (!sacnIn.length) {
    summary = 'geen signaal ingesteld';
  } else if (eng.mode === 'ltp' || eng.mode === 'htp') {
    summary = `${mode} van ${uniList}`;
    if (liveOnNet.length) summary += ` · actief: ${liveOnNet.map((u) => COPY.streamTag(u, snap)).join(', ')}`;
  } else {
    const primary = liveFromNode[0] || (liveOnNet[0] != null ? { universe: liveOnNet[0] } : sacnIn[0]);
    const u = primary.universe != null ? COPY.streamTag(primary.universe, snap) : uniList;
    const name = primary.name ? ` (${primary.name})` : '';
    summary = `${mode} ← ${u}${name}`;
    if (sacnIn.length > 1) summary += ` · ook ingesteld: ${uniList}`;
  }

  return { uniList, mode, liveOnNet, liveFromNode, sacnIn, summary };
}

function winningSourceOnUniverse(snap, universeNum) {
  const uni = snap.universes.find((u) => u.universe === universeNum);
  if (!uni) return null;
  const win = uni.sources.find((s) => s.winning && s.active && !s.viaNode)
    || uni.sources.filter((s) => s.active && !s.viaNode).sort((a, b) => b.priority - a.priority)[0];
  if (!win) return null;
  const src = snap.sources.find((s) => s.id === win.sourceId);
  return src ? { ...win, name: src.name, ip: src.ip } : null;
}

/** Actieve input-bronnen: eerst node-API, anders afgeleid uit live sACN. */
function resolveActiveEngineInputs(eng, snap) {
  const fromNode = (eng.liveSources || []).filter(Boolean);
  if (fromNode.length) {
    return fromNode.map((ls) => {
      const inp = eng.inputs.find((i) => i.slot === ls.slot);
      return {
        universe: inp ? inp.universe : null,
        name: ls.name || ls.ip || 'onbekend',
        source: 'node',
      };
    });
  }

  const live = [];
  for (const input of eng.inputs) {
    if (input.protocol !== 'sacn' || !Number.isFinite(input.universe)) continue;
    const winner = winningSourceOnUniverse(snap, input.universe);
    if (winner) {
      live.push({
        universe: input.universe,
        name: winner.name,
        source: 'network',
        priority: winner.priority,
      });
    }
  }
  return live;
}

function sacnOutputStatus(entry, node, snap) {
  if (entry.active && (entry.fps || 0) > 0) {
    return { status: 'live', label: COPY.sacnOutLive, badge: 'live', cls: 'live' };
  }

  for (const eng of node.engines) {
    if (!entry.engines.includes(eng.name)) continue;
    const dmxLive = eng.outputPorts.some((p) => {
      const port = node.ports[p];
      return port && isDmxPortActive(port.state);
    });
    const feed = describeEngineFeed(eng, snap);
    if (dmxLive && feed.liveOnNet.length) {
      return {
        status: 'inferred',
        label: COPY.sacnOutInferred,
        badge: 'inferred',
        cls: 'inferred',
      };
    }
  }

  return {
    status: 'idle',
    label: COPY.configuredOff,
    badge: null,
    cls: 'unused',
  };
}

function formatRouteChain(parts) {
  return parts.filter(Boolean)
    .map((p) => esc(p))
    .join('<span class="route-arrow">→</span>');
}

/** Uitgangen van één engine als routeketting (na engine-naam). */
function engineOutputChainParts(node, eng, snap) {
  const parts = [];
  const livePort = eng.outputPorts.find((p) => isDmxPortActive(node.ports[p]?.state));
  if (livePort != null) parts.push(portDisplayLabel(node.ports[livePort], node, snap));
  for (const out of eng.outputUniverses || []) {
    if (out.protocol === 'sacn') parts.push(sacnOutLabel(out.universe, node.ip, snap, { short: true }));
  }
  return parts;
}

/** Alle engines op een node die een sACN-universe als input hebben. */
function enginesWithSacnInput(node, universeNum) {
  return node.engines.filter((eng) =>
    eng.inputs.some((i) => i.protocol === 'sacn' && i.universe === universeNum)
  );
}

function buildEngineRouteSegment(node, eng, snap, active) {
  const head = active && active.length
    ? [active[0].name, universeLabel(active[0].universe, snap, { short: true })]
    : [];
  return [...head, eng.name, ...engineOutputChainParts(node, eng, snap)].join(' → ');
}

function buildUniverseRouteSummary(snap, universeNum) {
  const winner = winningSourceOnUniverse(snap, universeNum);
  const head = winner
    ? [winner.name, universeLabel(universeNum, snap, { short: true })]
    : [universeLabel(universeNum, snap, { short: true })];

  const segments = [];
  for (const node of snap.nodes) {
    for (const eng of enginesWithSacnInput(node, universeNum)) {
      const tail = [eng.name, ...engineOutputChainParts(node, eng, snap)];
      segments.push(tail.join(' → '));
    }
  }
  if (!segments.length) return head;
  if (segments.length === 1) return [...head, ...segments[0].split(' → ')];
  return [...head, segments.join(' · ')];
}

function buildDefaultRouteSummary(snap) {
  const segments = [];
  for (const node of snap.nodes) {
    for (const eng of node.engines) {
      const active = resolveActiveEngineInputs(eng, snap);
      if (!active.length) continue;
      segments.push(buildEngineRouteSegment(node, eng, snap, active));
    }
  }
  if (segments.length) return [segments.join(' · ')];

  const group = groupConsoleSources(snap.sources).find((g) => g.universes.some((u) => u.active));
  if (group) {
    const u = group.universes.find((x) => x.active);
    return [group.name, universeLabel(u.universe, snap, { short: true })];
  }
  return null;
}

function buildRouteSummary(snap, selectedId) {
  if (!snap) return null;

  if (selectedId) {
    if (selectedId.startsWith('device:')) {
      const group = groupConsoleSources(snap.sources).find((g) => g.id === selectedId);
      if (group) {
        const activeU = group.universes.find((u) => u.active);
        if (activeU) return buildUniverseRouteSummary(snap, activeU.universe);
        return [group.name];
      }
    }
    if (selectedId.startsWith('uni:')) {
      return buildUniverseRouteSummary(snap, Number(selectedId.slice(4)));
    }
    for (const node of snap.nodes) {
      const eng = node.engines.find((e) => e.id === selectedId);
      if (eng) {
        const active = resolveActiveEngineInputs(eng, snap);
        const chain = [];
        if (active[0]) chain.push(active[0].name, universeLabel(active[0].universe, snap, { short: true }));
        chain.push(eng.name, ...engineOutputChainParts(node, eng, snap));
        return chain;
      }
      const port = node.ports.find((p) => p.id === selectedId);
      if (port) {
        const eng2 = engineForDmxPort(node, port.index);
        const active = eng2 ? resolveActiveEngineInputs(eng2, snap) : [];
        const chain = [];
        if (active[0]) chain.push(active[0].name, universeLabel(active[0].universe, snap, { short: true }));
        if (eng2) chain.push(eng2.name);
        chain.push(portDisplayLabel(port, node, snap));
        return chain;
      }
    }
  }

  return buildDefaultRouteSummary(snap);
}

function markHotRouteEdges(edges, snap) {
  const hot = new Set();
  for (const node of snap.nodes) {
    const nodeSrc = snap.sources.find((s) => s.viaNode === node.id);
    for (const eng of node.engines) {
      const feed = describeEngineFeed(eng, snap);
      const activeIns = resolveActiveEngineInputs(eng, snap);
      const liveUniverses = new Set([
        ...feed.liveOnNet,
        ...activeIns.map((a) => a.universe).filter((u) => u != null),
      ]);
      if (!liveUniverses.size) continue;

      const dmxLive = eng.outputPorts.some((p) => isDmxPortActive(node.ports[p]?.state));
      const sacnLive = (eng.outputUniverses || []).some(
        (o) => o.protocol === 'sacn' && nodeSrc?.universes.some((u) => u.universe === o.universe && u.active)
      );
      const outputLive = dmxLive || sacnLive;

      for (const uNum of liveUniverses) {
        const uni = snap.universes.find((x) => x.universe === uNum);
        const win = uni?.sources.find((s) => s.winning && s.active && !s.viaNode);
        if (win) {
          const src = snap.sources.find((s) => s.id === win.sourceId);
          if (src) hot.add(`e:${deviceId(src.ip)}>${uniId(uNum)}`);
        }
        hot.add(`e:${uniId(uNum)}>${eng.id}`);
      }

      if (outputLive) {
        if (dmxLive) {
          for (const portIdx of eng.outputPorts) {
            const port = node.ports[portIdx];
            if (port && isDmxPortActive(port.state)) hot.add(`e:${eng.id}>${port.id}`);
          }
        }
        for (const out of eng.outputUniverses || []) {
          if (out.protocol === 'sacn' && nodeSrc?.universes.some((u) => u.universe === out.universe && u.active)) {
            hot.add(`e:${eng.id}>${outUniId(out.universe)}`);
          }
        }
      } else {
        for (const portIdx of eng.outputPorts) {
          const port = node.ports[portIdx];
          if (port) hot.add(`e:${eng.id}>${port.id}`);
        }
        for (const out of eng.outputUniverses || []) {
          if (out.protocol === 'sacn') hot.add(`e:${eng.id}>${outUniId(out.universe)}`);
        }
      }
    }
  }
  for (const edge of edges) {
    if (!hot.has(edge.id)) continue;
    if (edge.cls.includes('flow') || edge.cls.includes('merge-feed') || edge.cls.includes('expected')) {
      edge.cls += ' route-hot';
    }
  }
}

function dmxPortLabel(state) {
  const s = String(state || '').toLowerCase();
  if (/stream/i.test(s)) return 'DMX stroomt';
  if (/output/i.test(s)) return 'output actief';
  if (/input/i.test(s)) return 'input actief';
  return state || 'onbekend';
}

/**
 * Bouwt de lijst van edges (verbindingen) uit het snapshot.
 * Elke edge: { id, from, to, color, cls, width }
 */
function buildEdges(snap) {
  const edges = [];
  const winnerColor = new Map();
  const outputSet = getOutputUniverseSet(snap);

  for (const uni of snap.universes) {
    if (outputSet.has(uni.universe)) continue;
    const winner = uni.sources.find((s) => s.winning && !s.viaNode);
    winnerColor.set(uni.universe, winner ? colorForSource(winner.sourceId) : '#44566b');
  }

  // device (samengevoegd) -> inkomende universe
  for (const group of groupConsoleSources(snap.sources)) {
    const color = colorForSource(group.id);
    for (const u of group.universes) {
      const uniEntry = snap.universes.find((x) => x.universe === u.universe);
      const entry = uniEntry && group.sourceIds
        .map((sid) => uniEntry.sources.find((s) => s.sourceId === sid))
        .find(Boolean);
      const winning = entry ? entry.winning : false;
      let cls = 'idle';
      if (u.active) cls = winning ? 'flow' : 'flow losing';
      edges.push({
        id: `e:${group.id}>${uniId(u.universe)}`,
        from: group.id,
        to: uniId(u.universe),
        color,
        cls,
        width: 1.4 + Math.min(u.fps || 0, 44) / 44 * 2.4,
      });
    }
  }

  // universe -> engine -> DMX / sACN-uit (+ terugloop naar In-kolom)
  for (const node of snap.nodes) {
    const nodeSrc = snap.sources.find((s) => s.viaNode === node.id);

    for (const eng of node.engines) {
      const feed = describeEngineFeed(eng, snap);
      const downstreamActive = isEngineDownstreamActive(eng, node, snap);
      const isMerge = isMergeEngine(eng.mode);
      let engColor = '#44566b';
      let engActive = false;

      for (const input of eng.inputs) {
        if (input.protocol === 'sacn' && Number.isFinite(input.universe)) {
          const uniEntry = snap.universes.find((x) => x.universe === input.universe);
          const hasActive = !!(uniEntry && uniEntry.sources.some((s) => s.active && !s.viaNode));
          const color = winnerColor.get(input.universe) || '#44566b';
          if (hasActive) { engActive = true; engColor = color; }
          const mergePath = downstreamActive && isMerge;
          let cls = 'idle expected';
          if (hasActive) cls = 'flow';
          else if (mergePath) cls = 'merge-feed';
          edges.push({
            id: `e:${uniId(input.universe)}>${eng.id}`,
            from: uniId(input.universe),
            to: eng.id,
            color: hasActive ? color : (mergePath ? '#6b8299' : '#44566b'),
            cls,
            width: hasActive ? (downstreamActive ? 3.4 : 2.8) : mergePath ? 2 : 1.6,
          });
        } else if (input.protocol === 'engine' && input.fromEngine != null) {
          edges.push({
            id: `e:${node.id}:engine:${input.fromEngine}>${eng.id}`,
            from: `${node.id}:engine:${input.fromEngine}`,
            to: eng.id,
            color: '#8298ad',
            cls: downstreamActive ? 'flow' : 'idle expected',
            width: 1.6,
          });
        }
      }

      if (downstreamActive) engActive = true;
      const outColor = feed.liveOnNet.length
        ? (winnerColor.get(feed.liveOnNet[0]) || engColor)
        : engColor;

      for (const portIdx of eng.outputPorts) {
        const port = node.ports[portIdx];
        if (!port) continue;
        const portLive = isDmxPortActive(port.state);
        edges.push({
          id: `e:${eng.id}>${port.id}`,
          from: eng.id,
          to: port.id,
          color: portLive ? (outColor !== '#44566b' ? outColor : '#41d98d') : '#44566b',
          cls: portLive ? 'flow dmx-live' : (downstreamActive ? 'merge-feed' : 'idle expected'),
          width: portLive ? 3.8 : downstreamActive ? 2 : 1.6,
        });
      }

      for (const out of eng.outputUniverses || []) {
        if (!Number.isFinite(out.universe) || out.protocol !== 'sacn') continue;
        const oid = outUniId(out.universe);
        const transmitting = !!(nodeSrc && nodeSrc.universes.some(
          (u) => u.universe === out.universe && u.active
        ));
        const color = transmitting
          ? (outColor !== '#44566b' ? outColor : colorForSource(nodeSrc?.id || node.id))
          : '#44566b';
        edges.push({
          id: `e:${eng.id}>${oid}`,
          from: eng.id,
          to: oid,
          color,
          cls: transmitting ? 'flow sacn-out-edge' : (downstreamActive ? 'merge-feed' : 'idle expected'),
          width: transmitting ? 2.6 : 1.8,
        });
      }
    }
  }
  markHotRouteEdges(edges, snap);
  return edges;
}

/** Adjacency-map voor route-highlight (beide richtingen). */
function buildAdjacency(edges) {
  const adj = new Map();
  const add = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
  };
  for (const e of edges) { add(e.from, e.to); add(e.to, e.from); }
  return adj;
}

function reachable(start, adj, snap) {
  const seen = new Set([start]);
  const queue = [start];
  // Groepskaarten: kinderen meteen meenemen voor highlight
  if (start.startsWith('outgroup:') && snap) {
    const g = buildOutputGroups(snap).find((x) => x.id === start);
    if (g) g.universes.forEach((u) => seen.add(u.id));
  }
  if (start.startsWith('device:') && snap) {
    const g = groupConsoleSources(snap.sources).find((x) => x.id === start);
    if (g) g.universes.forEach((u) => seen.add(uniId(u.universe)));
  }
  while (queue.length) {
    const cur = queue.shift();
    for (const next of adj.get(cur) || []) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return seen;
}

/* ---------------- rendering: kaarten ---------------- */

function render() {
  const snap = state.snap;
  if (!snap) return;
  renderStatus();
  renderRouteBanner(snap);
  renderSources(snap);
  renderUniverses(snap);
  renderNodes(snap);
  renderOutputsColumn(snap);
  applySelection();
  syncInlineDmx();
  refreshDmxFromSnap(snap);
  requestAnimationFrame(drawEdges);
  renderDetail();
}

function renderRouteBanner(snap) {
  const banner = $('#route-banner');
  const chain = buildRouteSummary(snap, state.selected);
  if (!chain || !chain.length) {
    banner.classList.add('hidden');
    banner.innerHTML = '';
    return;
  }
  banner.classList.remove('hidden');
  banner.innerHTML = `<strong>${COPY.route}</strong> ${formatRouteChain(chain)}`;
}

function renderStatus() {
  const snap = state.snap;
  const pill = $('#mode-pill');
  if (snap) {
    const configured = snap.configuredMode || 'auto';
    pill.textContent = snap.mode === 'demo'
      ? (configured === 'live' ? 'Wacht op signaal' : 'Demovoorbeeld')
      : 'Live';
    pill.className = `pill ${snap.mode === 'demo' && configured !== 'live' ? 'demo' : 'live'}`;
    $('#stat-sources').textContent = `${snap.sources.length} ${snap.sources.length === 1 ? 'console' : 'consoles'}`;
    $('#stat-universes').textContent = `${snap.universes.length} ${snap.universes.length === 1 ? 'stream' : 'streams'}`;
    const onlineNodes = snap.nodes.filter((n) => n.online).length;
    let nodeStat = snap.nodes.length
      ? `${onlineNodes}/${snap.nodes.length} verwerkers bereikbaar`
      : 'Geen verwerker ingesteld';
    if (snap.discovery?.scanning) nodeStat += ' · zoekt…';
    else if (snap.discovery?.lastAdded > 0) nodeStat += ` · ${snap.discovery.lastAdded} nieuw gevonden`;
    $('#stat-nodes').textContent = nodeStat;
  }

  const listenerEl = $('#stat-listener');
  const banner = $('#listener-banner');
  if (!state.connected) {
    listenerEl.textContent = 'SSE: verbinding kwijt…';
    listenerEl.className = 'stat warn';
    banner.classList.remove('visible');
    return;
  }

  const li = snap && snap.listener;
  if (!li) {
    listenerEl.textContent = 'Ontvangst: …';
    listenerEl.className = 'stat warn';
    return;
  }

  const pkts = li.stats && li.stats.packetsTotal != null ? li.stats.packetsTotal : 0;
  const parsed = li.stats && li.stats.packetsParsed != null ? li.stats.packetsParsed : 0;
  const ifaces = (li.interfaces || []).join(', ') || 'geen verbinding';
  const ifaceLabel = li.interfaceMode === 'auto' ? `automatisch (${ifaces})` : (li.selectedInterface || ifaces);

  if (li.error) {
    listenerEl.textContent = 'Ontvangst: probleem';
    listenerEl.className = 'stat bad';
    banner.textContent = li.error + (li.warnings && li.warnings.length ? ' — ' + li.warnings.join(' ') : '');
    banner.className = 'visible';
  } else if (pkts === 0) {
    listenerEl.textContent = `Ontvangst: nog niets · ${ifaceLabel}`;
    listenerEl.className = 'stat warn';
    const msgs = (li.warnings || []).slice();
    if (snap.mode === 'live' && configuredModeIsLive(snap)) {
      msgs.unshift('Live modus aan, maar er komt nog geen signaal binnen.');
    }
    if (msgs.length) {
      banner.textContent = msgs.join(' ');
      banner.className = 'visible warn-only';
    } else {
      banner.classList.remove('visible');
    }
  } else {
    listenerEl.textContent = `Ontvangst: actief · ${ifaceLabel}`;
    listenerEl.className = 'stat ok';
    if (li.warnings && li.warnings.length) {
      banner.textContent = li.warnings.join(' ');
      banner.className = 'visible warn-only';
    } else {
      banner.classList.remove('visible');
    }
  }
}

function configuredModeIsLive(snap) {
  return (snap.configuredMode || 'auto') === 'live';
}

function renderSources(snap) {
  const groups = groupConsoleSources(snap.sources);
  const html = groups.map((g) => {
    const color = colorForSource(g.id);
    const anyActive = g.universes.some((u) => u.active);
    const chips = g.universes
      .map((u) => {
        const lbl = universeLabel(u.universe, snap, { short: true });
        return `<span class="uni-chip ${u.active ? 'on' : ''}" title="${esc(COPY.streamShort(u.universe))}">${esc(lbl)} · ${esc(fmtPriority(u.priority))}</span>`;
      })
      .join('');
    const count = g.universes.length;
    return `
      <div class="card device-group ${anyActive ? '' : 'offline'}" data-id="${esc(g.id)}">
        <div class="name"><span class="dot" style="background:${color}"></span>${esc(g.name)}</div>
        <div class="sub">${esc(g.ip)} · ${count} ${count === 1 ? 'stream' : 'streams'}</div>
        <div class="uni-chips">${chips}</div>
      </div>`;
  }).join('');
  $('#list-sources').innerHTML = html || `<div class="card offline"><div class="sub">Nog geen console of sender gevonden…</div></div>`;
}

function renderUniCard(uni, snap) {
  const consoleSources = uni.sources.filter((s) => !s.viaNode);
  const hasActive = consoleSources.some((s) => s.active);
  const rows = consoleSources
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .map((s) => {
      const src = snap.sources.find((x) => x.id === s.sourceId);
      const color = colorForSource(src ? deviceId(src.ip) : s.sourceId);
      const prioPct = Math.min(100, (s.priority / 200) * 100);
      return `
        <div class="src-block ${s.winning ? 'winning' : ''}">
          <div class="src-line1">
            <span class="dot" style="background:${color}"></span>
            <span class="src-name" title="${esc(src ? src.name : s.sourceId)}">${esc(src ? src.name : s.sourceId)}</span>
          </div>
          <div class="src-line2">
            ${s.winning ? `<span class="badge winner">${COPY.winner}</span>` : ''}
            <span class="badge prio ${s.priority > 100 ? 'high' : ''}">${esc(fmtPriority(s.priority))}</span>
            <span class="fps">${esc(fmtRefresh(s.fps || 0, true))}</span>
          </div>
          <div class="prio-bar"><i style="width:${prioPct}%; background:${color}"></i></div>
        </div>`;
    }).join('');
  const stale = !hasActive && consoleSources.length === 0;
  return `
    <div class="card sacn-dmx-card ${stale ? 'universe-stale' : ''}" data-id="${esc(uniId(uni.universe))}" data-dmx-universe="${uni.universe}">
      <div class="name card-name-row">${esc(universeLabel(uni.universe, snap))}
        ${uni.merged ? `<span class="badge merge">${COPY.mergeBadge}</span>` : ''}
        <span class="spacer"></span>${dmxBtn(uni.universe)}
      </div>
      ${rows || `<div class="sub">${COPY.configuredIdle}</div>`}
      ${dmxInlineHtml(uni.universe)}
    </div>`;
}

function renderUniverses(snap) {
  const all = inputUniverses(snap);
  const active = [];
  const idle = [];
  for (const uni of all) {
    const hasActive = uni.sources.some((s) => s.active && !s.viaNode);
    if (hasActive) active.push(uni);
    else idle.push(uni);
  }

  let html = active.map((uni) => renderUniCard(uni, snap)).join('');

  if (idle.length) {
    const labels = idle.map((u) => universeLabel(u.universe, snap, { short: true })).join(', ');
    if (state.idleUniversesExpanded) {
      html += `
        <div class="universe-collapse expanded" data-action="collapse-idle">
          <div><b>${idle.length} klaargezet</b> · nog geen signaal — klik om in te klappen</div>
          <div class="collapse-body">${idle.map((uni) => renderUniCard(uni, snap)).join('')}</div>
        </div>`;
    } else {
      html += `
        <div class="universe-collapse" data-action="expand-idle">
          <b>${idle.length} klaargezet</b> · nog geen signaal (${esc(labels)}) — klik om te tonen
        </div>`;
    }
  }

  $('#list-universes').innerHTML = html || `<div class="card offline"><div class="sub">Geen binnenkomende streams</div></div>`;
}

function renderSacnOutRows(group, snap) {
  const node = snap.nodes.find((n) => n.id === group.nodeId);
  return group.universes.map((u) => {
    const st = u.outputStatus || (node ? sacnOutputStatus(u, node, snap) : { cls: 'unused', label: 'onbekend', badge: null });
    const fpsTxt = st.status === 'live' ? fmtRefresh(u.fps || 0, true) : st.label;
    return `
    <div class="out-uni-row sacn-dmx-card ${st.cls} ${u.active && st.status === 'live' ? 'live' : ''}" data-id="${esc(u.id)}" data-dmx-universe="${u.universe}">
      <div class="row-head">
        <span class="state-dot ${st.status === 'live' ? 'on pulse' : st.status === 'inferred' ? 'on' : ''}"></span>
        ${esc(sacnOutLabel(u.universe, group.nodeIp, snap))}
        ${st.badge === 'live' ? `<span class="badge winner">${COPY.liveBadge}</span>` : ''}
        ${st.badge === 'inferred' ? `<span class="badge merge">${COPY.inferredBadge}</span>` : ''}
        <span class="badge prio">${esc(fmtPriority(u.priority ?? 100))}</span>
        <span class="fps out-status">${esc(fpsTxt)}</span>
        ${dmxBtn(u.universe)}
      </div>
      <div class="row-sub">${esc(u.engines.join(', '))}${st.status === 'live' ? ' · terug naar netwerk' : ''}</div>
      ${dmxInlineHtml(u.universe)}
    </div>`;
  }).join('');
}

function renderDmxOutRows(node, snap) {
  return node.ports.map((port) => {
    const active = isDmxPortActive(port.state);
    const eng = engineForDmxPort(node, port.index);
    const patched = !!eng;
    const feed = patched ? describeEngineFeed(eng, snap) : null;
    const frames = port.raw?.counters?.output_frames;
    const statusTxt = active ? dmxPortLabel(port.state) : (port.state || 'stil');
    const activeStreams = patched && feed.liveOnNet.length
      ? feed.liveOnNet.map((u) => COPY.streamTag(u, snap)).join(', ')
      : '';
    return `
      <div class="dmx-out-row ${active ? 'live' : 'unused'}" data-id="${esc(port.id)}">
        <div class="row-head">
          <span class="state-dot ${active ? 'on pulse' : ''}"></span>
          ${esc(portDisplayLabel(port, node, snap))}
          ${active ? '<span class="badge winner">live</span>' : ''}
          <span class="type-tag">DMX</span>
        </div>
        ${patched ? `<div class="feed-line">${esc(eng.name)}${activeStreams ? ` · ${esc(activeStreams)} actief` : ''}</div>` : ''}
        <div class="row-sub">${esc(statusTxt)}${frames != null && active ? ` · ${frames} frames` : ''}${!patched ? ' · niet gepatcht' : ''}</div>
      </div>`;
  }).join('');
}

/** sACN-uit + DMX-poorten per node in één kolom. */
function renderOutputsColumn(snap) {
  const sacnByNode = new Map(buildOutputGroups(snap).map((g) => [g.nodeId, g]));
  const html = snap.nodes.map((node) => {
    const sacn = sacnByNode.get(node.id);
    const hasSacn = !!(sacn && sacn.universes.length);
    const hasDmx = node.ports.length > 0;
    if (!hasSacn && !hasDmx) return '';

    const color = colorForSource(node.id);
    const dmxLive = node.ports.some((p) => isDmxPortActive(p.state));
    const anyActive = !!(sacn?.anyActive || dmxLive);
    const sacnRows = hasSacn ? renderSacnOutRows(sacn, snap) : '';
    const dmxRows = hasDmx ? renderDmxOutRows(node, snap) : '';
    const parts = [];
    if (hasSacn) {
      parts.push(`<div class="output-section"><div class="section-label">Naar netwerk <small>signaal terug</small></div><div class="group-rows">${sacnRows}</div></div>`);
    }
    if (hasDmx) {
      parts.push(`<div class="output-section"><div class="section-label">Naar zaal <small>DMX</small></div><div class="group-rows">${dmxRows}</div></div>`);
    }

    return `
      <div class="card device-group output-group ${anyActive ? 'live' : 'offline'}" data-id="${esc(outGroupId(node.id))}">
        <div class="name"><span class="dot" style="background:${color}"></span>${esc(node.name)}
          ${anyActive ? '<span class="badge winner">● actief</span>' : ''}
        </div>
        <div class="sub">${esc(node.ip)}${hasSacn ? ` · ${sacn.universes.length} netwerk` : ''}${hasDmx ? ` · ${node.ports.length} DMX` : ''}</div>
        ${parts.join('')}
      </div>`;
  }).filter(Boolean).join('');

  $('#list-outputs').innerHTML = html || `<div class="card offline"><div class="sub">Geen uitgangen ingesteld</div></div>`;
}

function modeLabel(mode) {
  return COPY.modes[String(mode || '').toLowerCase()] || mode;
}

function renderNodes(snap) {
  const html = snap.nodes.map((node) => {
    const engines = node.engines.map((eng) => {
      const live = resolveActiveEngineInputs(eng, snap);
      const liveTxt = formatLiveInputs(live, snap);
      const inTxt = eng.inputs.map((i) => {
        if (i.protocol === 'sacn' && Number.isFinite(i.universe)) return COPY.streamTag(i.universe, snap);
        if (i.protocol === 'artnet' && Number.isFinite(i.universe)) return `ArtNet ${i.universe}`;
        if (i.protocol === 'engine') return `Verwerker ${(i.fromEngine ?? 0) + 1}`;
        if (i.protocol === 'dmx') return `DMX ${(i.port ?? 0) + 1} in`;
        return i.protocol;
      }).join(', ');
      const outTxt = [
        ...(eng.outputUniverses || []).map((o) => {
          if (o.protocol === 'sacn') return sacnOutLabel(o.universe, node.ip, snap, { short: true });
          if (o.protocol === 'artnet') return `ArtNet ${o.universe}`;
          return o.protocol;
        }),
        ...eng.outputPorts.map((p) => {
          const port = node.ports[p];
          return port ? portDisplayLabel(port, node, snap) : `DMX ${p + 1}`;
        }),
      ].join(', ');
      const patchTxt = `${inTxt || 'geen'}${outTxt ? ` → ${outTxt}` : ''}`;
      return `
        <div class="engine" data-id="${esc(eng.id)}">
          <div class="e-head">${esc(eng.name)}<span class="spacer"></span>
            <span class="badge mode">${esc(modeLabel(eng.mode))}</span>
          </div>
          ${liveTxt
            ? `<div class="engine-active-input">● ${esc(liveTxt)}</div>`
            : `<div class="engine-active-input idle">${COPY.engineIdle}</div>`}
          ${patchTxt ? `<div class="e-sub">${esc(patchTxt)}</div>` : ''}
        </div>`;
    }).join('');
    return `
      <div class="card ${node.online ? '' : 'offline'}" data-id="${esc(node.id)}">
        <div class="name">${esc(node.name)}
          ${node.online ? '' : '<span class="badge off">OFFLINE</span>'}
        </div>
        <div class="sub">${esc(node.type)} · ${esc(node.ip)}${node.assumedMapping ? ' · poortkoppeling aangenomen' : ''}</div>
        ${node.error ? `<div class="sub" style="color:var(--bad)">${esc(node.error)}</div>` : ''}
        ${engines}
      </div>`;
  }).join('');
  $('#list-nodes').innerHTML = html || `<div class="card offline"><div class="sub">Geen Luminex verwerker ingesteld.<br>⚙ Instellingen → zoek of vul een apparaat in → <b>Verbinding testen</b> → Opslaan.</div></div>`;
}

/* ---------------- rendering: edges ---------------- */

const edgeEls = new Map();
const edgeLabelEls = new Map();

function rectOf(id) {
  const el = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!el) return null;
  const cr = $('#canvas').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    left: r.left - cr.left,
    right: r.right - cr.left,
    cy: r.top + r.height / 2 - cr.top,
  };
}

/**
 * Altijd links → rechts: vertrek rechterkant bron, aankomst linkerkant doel.
 * Zelfde kolom: boog langs de rechterflank (nooit terug naar links).
 */
function edgePath(fr, tr) {
  if (tr.left >= fr.right - 6) {
    const dx = Math.max(36, (tr.left - fr.right) / 2);
    return `M ${fr.right} ${fr.cy} C ${fr.right + dx} ${fr.cy}, ${tr.left - dx} ${tr.cy}, ${tr.left} ${tr.cy}`;
  }
  const x = Math.max(fr.right, tr.right) + 28;
  return `M ${fr.right} ${fr.cy} L ${x} ${fr.cy} L ${x} ${tr.cy} L ${tr.left} ${tr.cy}`;
}

function edgeLabelPoint(fr, tr, slotIndex = 0, slotTotal = 1) {
  const spread = 26;
  const yOff = (slotIndex - (slotTotal - 1) / 2) * spread;
  if (tr.left >= fr.right - 6) {
    return {
      x: (fr.right + tr.left) / 2,
      y: (fr.cy + tr.cy) / 2 + yOff - 14,
    };
  }
  const x = Math.max(fr.right, tr.right) + 28;
  return { x: x + 8, y: (fr.cy + tr.cy) / 2 + yOff };
}

function labelCorridorKey(fr, tr) {
  const midX = Math.round((fr.right + tr.left) / 2);
  const bandY = Math.round(((fr.cy + tr.cy) / 2) / 48);
  return `${midX}:${bandY}`;
}

function drawEdges() {
  const snap = state.snap;
  if (!snap) return;
  const svg = $('#edges');
  const labelsLayer = $('#edge-labels');
  const canvas = $('#canvas');
  svg.setAttribute('width', canvas.scrollWidth);
  svg.setAttribute('height', canvas.scrollHeight);

  const edges = buildEdges(snap);
  const adj = buildAdjacency(edges);
  const lit = state.selected ? reachable(state.selected, adj, snap) : null;
  const liveIds = new Set();
  const labelPlan = [];

  for (const e of edges) {
    const fr = rectOf(e.from);
    const tr = rectOf(e.to);
    if (!fr || !tr) continue;
    liveIds.add(e.id);

    let path = edgeEls.get(e.id);
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(path);
      edgeEls.set(e.id, path);
    }
    path.setAttribute('d', edgePath(fr, tr));
    path.setAttribute('stroke', e.color);
    path.setAttribute('stroke-width', e.width);

    let cls = e.cls;
    const edgeLit = !lit || (lit.has(e.from) && lit.has(e.to));
    if (!edgeLit) cls += ' dimmed';
    path.setAttribute('class', cls);

    if (e.label && edgeLit && cls.includes('flow')) {
      labelPlan.push({ edge: e, fr, tr, cls, corridor: labelCorridorKey(fr, tr) });
    } else {
      const lbl = edgeLabelEls.get(e.id);
      if (lbl) { lbl.remove(); edgeLabelEls.delete(e.id); }
    }
  }

  const byCorridor = new Map();
  for (const item of labelPlan) {
    if (!byCorridor.has(item.corridor)) byCorridor.set(item.corridor, []);
    byCorridor.get(item.corridor).push(item);
  }

  for (const items of byCorridor.values()) {
    items.sort((a, b) => a.fr.cy - b.fr.cy);
    items.forEach((item, slotIndex) => {
      const { edge: e, fr, tr, cls } = item;
      const slotTotal = items.length;
      let lbl = edgeLabelEls.get(e.id);
      if (!lbl) {
        lbl = document.createElement('span');
        lbl.className = 'edge-label-tag';
        labelsLayer.appendChild(lbl);
        edgeLabelEls.set(e.id, lbl);
      }
      const pt = edgeLabelPoint(fr, tr, slotIndex, slotTotal);
      lbl.textContent = e.label;
      lbl.style.left = `${pt.x}px`;
      lbl.style.top = `${pt.y}px`;
      lbl.style.borderColor = e.color;
      lbl.style.boxShadow = `0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px ${e.color}33`;
      lbl.classList.toggle('dimmed', cls.includes('dimmed'));
      liveIds.add(`lbl:${e.id}`);
    });
  }

  for (const [id, el] of edgeEls) {
    if (!liveIds.has(id)) { el.remove(); edgeEls.delete(id); }
  }
  for (const [id, el] of edgeLabelEls) {
    if (!liveIds.has(`lbl:${id}`)) { el.remove(); edgeLabelEls.delete(id); }
  }

  // kaarten dimmen buiten de geselecteerde route
  document.querySelectorAll('[data-id]').forEach((el) => {
    const id = el.dataset.id;
    const isCardOrEngine = el.classList.contains('card') || el.classList.contains('engine');
    if (!isCardOrEngine) return;
    let related = true;
    if (lit) {
      related = lit.has(id);
      if (!related && id.startsWith('node:')) {
        related = [...lit].some((x) => x.startsWith(id + ':'));
      }
      if (!related && id.startsWith('device:')) {
        related = [...lit].some((x) => x.startsWith('uni:'));
      }
      if (!related && id.startsWith('outgroup:')) {
        related = [...lit].some((x) => x.startsWith('outuni:') || x.includes(':port:'));
      }
    }
    el.classList.toggle('dimmed', !!lit && !related);
  });
  document.querySelectorAll('.out-uni-row, .dmx-out-row').forEach((el) => {
    const id = el.dataset.id;
    const parent = el.closest('.device-group');
    let related = true;
    if (lit) {
      related = lit.has(id);
      if (!related && parent) related = lit.has(parent.dataset.id);
    }
    el.classList.toggle('dimmed', !!lit && !related);
  });
}

function applySelection() {
  document.querySelectorAll('.card, .engine').forEach((el) => {
    el.classList.toggle('selected', el.dataset.id === state.selected);
  });
  document.querySelectorAll('.out-uni-row, .dmx-out-row').forEach((el) => {
    el.classList.toggle('selected', el.dataset.id === state.selected);
  });
}

/* ---------------- detailpaneel ---------------- */

function kv(pairs) {
  return `<dl class="kv">${pairs
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('')}</dl>`;
}

function renderDetail() {
  const snap = state.snap;
  const box = $('#detail-content');
  if (!snap) return;

  if (!state.selected) {
    box.innerHTML = `
      <h2>Overzicht</h2>
      <p class="intro">
        Van links naar rechts zie je het lichtsignaal door het netwerk:<br><br>
        <b>Consoles</b> — wie er lichtsignaal verstuurt.<br><br>
        <b>Binnenkomend</b> — welke streams binnenkomen en welke console wint bij meerdere bronnen.<br><br>
        <b>Verwerkers</b> — Luminex apparaten die signalen mengen of doorsturen.<br><br>
        <b>Uitgangen</b> — signaal terug het netwerk in, of DMX naar armaturen in de zaal.<br><br>
        <b>Klik</b> op een onderdeel om de route te volgen. Met de <b>DMX</b>-knop zie je live lichtniveaus.
      </p>`;
    return;
  }

  const id = state.selected;

  if (id.startsWith('device:')) {
    const group = groupConsoleSources(snap.sources).find((g) => g.id === id);
    if (group) {
      box.innerHTML = `
        <h2><span class="dot" style="display:inline-block;background:${colorForSource(group.id)}"></span> ${esc(group.name)}</h2>
        ${kv([['IP-adres', group.ip], ['Streams', group.universes.map((u) => universeLabel(u.universe, snap)).join(', ')]])}
        <h3>Per stream</h3>
        ${group.universes.map((u) => kv([
          [universeLabel(u.universe, snap), `${u.active ? 'actief' : 'inactief'} · P${u.priority} · ${u.fps || 0} fps`],
        ])).join('<hr style="border-color:var(--border)">')}`;
      return;
    }
  }

  if (id.startsWith('outuni:')) {
    const uNum = Number(id.slice(7));
    for (const g of buildOutputGroups(snap)) {
      const entry = g.universes.find((u) => u.universe === uNum);
      if (!entry) continue;
      const node = snap.nodes.find((n) => n.id === g.nodeId);
      const st = entry.outputStatus || (node ? sacnOutputStatus(entry, node, snap) : { status: 'idle', label: 'onbekend' });
      box.innerHTML = `
        <h2>sACN uit — ${esc(sacnOutLabel(uNum, g.nodeIp, snap))}</h2>
        <p class="intro">Eindpunt in de flow: <b>${esc(g.nodeName)}</b> zendt deze stream het netwerk in (geen lijn terug naar links).</p>
        ${buildRouteSummary(snap, id) ? `<p class="intro"><b>Route</b> ${formatRouteChain(buildRouteSummary(snap, id))}</p>` : ''}
        ${kv([
          ['Node', g.nodeName], ['IP', g.nodeIp],
          ['Engine(s)', entry.engines.join(', ')],
          ['Prioriteit', `P${entry.priority ?? 100}`],
          ['Status', st.status === 'live' ? COPY.sacnOutLive : st.label],
        ])}`;
      return;
    }
  }

  if (id.startsWith('outgroup:')) {
    const group = buildOutputGroups(snap).find((g) => g.id === id);
    if (group) {
      box.innerHTML = `
        <h2>${esc(group.nodeName)} — sACN uit</h2>
        ${kv([['IP-adres', group.nodeIp], ['Uit-streams', group.universes.map((u) => sacnOutLabel(u.universe, group.nodeIp, snap)).join(', ')]])}
        <h3>Per stream</h3>
        ${group.universes.map((u) => {
          const st = u.outputStatus || { label: u.active ? 'live' : 'stil' };
          return kv([
            [sacnOutLabel(u.universe, group.nodeIp, snap), `${st.label}${u.fps ? ' · ' + u.fps + ' fps' : ''}`],
            ['Engine', u.engines.join(', ')],
          ]);
        }).join('<hr style="border-color:var(--border)">')}`;
      return;
    }
  }

  if (id.startsWith('uni:')) {
    const n = Number(id.slice(4));
    const uni = inputUniverses(snap).find((u) => u.universe === n);
    if (!uni) return;
    const consoleSources = uni.sources.filter((s) => !s.viaNode);
    box.innerHTML = `
      <h2>${esc(universeLabel(n, snap))} <span class="badge mode">inkomend</span></h2>
      ${uni.merged ? `<p class="intro">Meerdere bronnen actief — merge-type: <b>${esc(uni.mergeType)}</b>.
        ${uni.mergeType === 'HTP' ? 'Gelijke prioriteit: hoogste waarde wint per stream.' : 'De bron met de hoogste prioriteit wint volledig.'}</p>` : ''}
      <h3>Bronnen</h3>
      ${consoleSources.map((s) => {
        const sd = snap.sources.find((x) => x.id === s.sourceId);
        return kv([
          ['Bron', sd ? sd.name : s.sourceId],
          ['Prioriteit', `P${s.priority}${s.winning ? ' ★ wint' : ''}`],
          ['Refresh', `${s.fps || 0} fps`],
          ['Status', s.active ? 'actief' : 'inactief'],
        ]);
      }).join('<hr style="border-color:var(--border)">') || '<p class="intro">Geen actieve bron op deze stream.</p>'}`;
    return;
  }

  for (const node of snap.nodes) {
    if (node.id === id) {
      box.innerHTML = `
        <h2>${esc(node.name)}</h2>
        ${kv([
          ['Type', node.type], ['IP-adres', node.ip],
          ['Status', node.online ? 'online' : 'offline'],
          ['Fout', node.error],
          ['Serienummer', node.deviceInfo && node.deviceInfo.serial],
          ['Engines', node.engines.length], ['DMX-poorten', node.ports.length],
        ])}
        <h3>Ruwe API-data (deviceinfo)</h3>
        <pre>${esc(JSON.stringify(node.deviceInfo, null, 2))}</pre>`;
      return;
    }
    const eng = node.engines.find((e) => e.id === id);
    if (eng) {
      const active = resolveActiveEngineInputs(eng, snap);
      const inTxt = eng.inputs.map((i) => {
        if (i.protocol === 'sacn') return `sACN ${COPY.streamShort(i.universe)}${i.sourceIp ? ` (alleen ${i.sourceIp})` : ''}`;
        if (i.protocol === 'artnet') return `ArtNet ${i.universe}`;
        if (i.protocol === 'engine') return `uitgang van Engine ${(i.fromEngine ?? 0) + 1}`;
        if (i.protocol === 'dmx') return `DMX-poort ${(i.port ?? 0) + 1} (in)`;
        return i.protocol;
      }).join(' · ');
      const outTxt = [
        ...(eng.outputUniverses || []).map((o) => {
          if (o.protocol === 'sacn') return `sACN ${sacnOutLabel(o.universe, node.ip, snap)}`;
          if (o.protocol === 'artnet') return `ArtNet ${o.universe}`;
          return o.protocol;
        }),
        ...eng.outputPorts.map((p) => `DMX-poort ${p + 1}`),
      ].join(' · ');
      box.innerHTML = `
        <h2>${esc(eng.name)} <span class="badge mode">${esc(modeLabel(eng.mode))}</span></h2>
        ${buildRouteSummary(snap, id) ? `<p class="intro"><b>${COPY.route}</b> ${formatRouteChain(buildRouteSummary(snap, id))}</p>` : ''}
        ${kv([
          ['Apparaat', node.name],
          ['Signaal binnen', active.length
            ? active.map((a) => `${a.name}${a.universe != null ? ' → ' + COPY.streamShort(a.universe) : ''}`).join(', ')
            : COPY.waiting],
          ['Ingangen', inTxt || 'geen'],
          ['Uitgangen', outTxt || 'geen'],
        ])}
        ${(eng.liveSources || []).filter(Boolean).length ? `
          <h3>Live bronnen (volgens node)</h3>
          ${eng.liveSources.filter(Boolean).map((s) => kv([[`Slot ${s.slot + 1}`, `${s.name || ''} ${s.ip || ''}`.trim()]])).join('')}` : ''}
        <h3>Ruwe API-data (processblock)</h3>
        <pre>${esc(JSON.stringify(eng.raw, null, 2))}</pre>`;
      return;
    }
    const port = node.ports.find((p) => p.id === id);
    if (port) {
      box.innerHTML = `
        <h2>${esc(node.name)} — ${esc(portDisplayLabel(port, node, snap))}</h2>
        ${(() => {
          const eng = engineForDmxPort(node, port.index);
          const feed = describeEngineFeed(eng, snap);
          return kv([
            ['Status', isDmxPortActive(port.state) ? dmxPortLabel(port.state) : (port.state || 'stil')],
            ['Engine', eng ? eng.name : 'niet gepatcht'],
            ['Merge-mode', eng ? feed.mode : null],
            ['sACN-inputs', feed.uniList || null],
            ['Live op netwerk', feed.liveOnNet.length ? feed.liveOnNet.map((u) => 'U' + u).join(', ') : 'geen'],
            ['Bron (volgens node)', feed.liveFromNode.map((x) => `${x.name}${x.universe != null ? ' → ' + COPY.streamShort(x.universe) : ''}`).join(', ') || 'onbekend'],
            ['Output frames', port.raw?.counters?.output_frames],
          ]);
        })()}
        <h3>Ruwe API-data</h3>
        <pre>${esc(JSON.stringify(port.raw, null, 2))}</pre>`;
      return;
    }
  }

  box.innerHTML = '<p class="intro">Selectie niet meer aanwezig in de data.</p>';
}

/* ---------------- DMX-matrix inline in sACN-kaart ---------------- */

const dmxMatrix = { cells: null, gridEl: null, readout: '—', lastChannels: null, lastUniverse: null };

function applyDmxCardState() {
  document.querySelectorAll('.dmx-inline').forEach((el) => {
    const u = Number(el.dataset.dmxSlot);
    el.classList.toggle('open', !!(state.dmxView && state.dmxView.universe === u));
  });
  document.querySelectorAll('.btn-dmx').forEach((btn) => {
    btn.classList.toggle('active', !!(state.dmxView && state.dmxView.universe === Number(btn.dataset.dmxUniverse)));
  });
}

function closeDmxWindow() {
  state.dmxView = null;
  dmxMatrix.cells = null;
  dmxMatrix.gridEl = null;
  dmxMatrix.lastChannels = null;
  dmxMatrix.lastUniverse = null;
  applyDmxCardState();
}

function ensureDmxMatrix(gridEl) {
  if (dmxMatrix.gridEl === gridEl && dmxMatrix.cells) return dmxMatrix.cells;
  gridEl.textContent = '';
  const cells = [];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 512; i++) {
    const el = document.createElement('div');
    el.className = 'dmx-pixel';
    el.dataset.ch = String(i + 1);
    frag.appendChild(el);
    cells.push(el);
  }
  gridEl.appendChild(frag);
  dmxMatrix.gridEl = gridEl;
  dmxMatrix.cells = cells;
  return cells;
}

function dmxCellColor(v) {
  if (!v) return '#121a24';
  const t = v / 255;
  const g = Math.round(80 + t * 175);
  const r = Math.round(20 + t * 60);
  return `rgb(${r}, ${g}, ${Math.round(30 + t * 40)})`;
}

function paintDmxValueStrip(channels, stripEl) {
  if (!stripEl || !channels) return;
  const parts = [];
  for (let i = 0; i < 16; i++) {
    const v = channels[i] || 0;
    parts.push(`<span class="dmx-val ${v ? 'on' : ''}" title="Adres ${i + 1}">${i + 1}:${v}</span>`);
  }
  stripEl.innerHTML = parts.join('');
}

function paintDmxMatrix(channels) {
  const cells = dmxMatrix.cells;
  if (!cells) return;
  for (let i = 0; i < 512; i++) {
    const v = channels[i] || 0;
    const el = cells[i];
    el.style.setProperty('--v', String(v));
    el.style.backgroundColor = dmxCellColor(v);
    el.classList.toggle('on', v > 0);
    el.classList.toggle('hi', v >= 200);
    el.title = `Adres ${i + 1}: ${v}`;
  }
  const slot = state.dmxView && document.querySelector(`.dmx-inline[data-dmx-slot="${state.dmxView.universe}"]`);
  if (slot) paintDmxValueStrip(channels, slot.querySelector('[data-dmx-strip]'));
}

function syncInlineDmx() {
  if (!state.dmxView) return;
  applyDmxCardState();
  const u = state.dmxView.universe;
  const slot = document.querySelector(`.dmx-inline[data-dmx-slot="${u}"]`);
  if (!slot) return;
  const grid = slot.querySelector('[data-dmx-grid]');
  if (!grid) return;
  ensureDmxMatrix(grid);
  state.dmxView.readoutEl = slot.querySelector('.dmx-inline-readout');
  if (dmxMatrix.lastChannels && dmxMatrix.lastUniverse === u) {
    paintDmxMatrix(dmxMatrix.lastChannels);
    if (state.dmxView.readoutEl) state.dmxView.readoutEl.textContent = dmxMatrix.readout;
  }
}

function normalizeChannels(raw) {
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length >= 512) return raw;
  if (ArrayBuffer.isView(raw) && raw.length >= 512) return Array.from(raw);
  if (typeof raw === 'object' && raw.length >= 512) return Array.from(raw);
  if (typeof raw === 'object') {
    const arr = new Array(512).fill(0);
    let any = false;
    for (let i = 0; i < 512; i++) {
      const v = Number(raw[i] ?? raw[String(i)] ?? 0);
      if (v > 0) any = true;
      arr[i] = v;
    }
    return any ? arr : arr;
  }
  return null;
}

function channelsFromSnap(snap, universeNum) {
  const uni = snap.universes.find((u) => u.universe === universeNum);
  if (!uni) return null;

  let channels = normalizeChannels(uni.channels);
  if (!channels || !channels.some((v) => v > 0)) {
    const merged = new Array(512).fill(0);
    let any = false;
    const maxPrio = Math.max(...uni.sources.filter((s) => s.active).map((s) => s.priority), -1);
    for (const entry of uni.sources.filter((s) => s.active && s.priority === maxPrio)) {
      const src = snap.sources.find((s) => s.id === entry.sourceId);
      const su = src && src.universes.find((x) => x.universe === universeNum);
      const sc = su && normalizeChannels(su.channels);
      if (!sc) continue;
      for (let i = 0; i < 512; i++) {
        if (sc[i] > merged[i]) merged[i] = sc[i];
        if (sc[i] > 0) any = true;
      }
    }
    if (any) channels = merged;
  }

  return { uni, channels };
}

function dmxDataFromSnap(snap, universeNum) {
  const parsed = channelsFromSnap(snap, universeNum);
  if (!parsed) return null;
  const { uni, channels } = parsed;
  const hasActive = uni.sources.some((s) => s.active);
  if (!hasActive) return null;

  const win = uni.sources.find((s) => s.winning && s.active)
    || uni.sources.filter((s) => s.active).sort((a, b) => b.priority - a.priority)[0];
  let winner = null;
  if (win) {
    const src = snap.sources.find((s) => s.id === win.sourceId);
    const su = src && src.universes.find((x) => x.universe === universeNum);
    if (src) winner = { name: src.name, fps: su ? su.fps : win.fps, priority: win.priority };
  }

  const useChannels = channels || new Array(512).fill(0);
  let activeChannels = uni.activeChannels || 0;
  let peak = uni.peak || 0;
  if (!activeChannels || !peak) {
    for (const v of useChannels) {
      if (v > 0) activeChannels++;
      if (v > peak) peak = v;
    }
  }

  return {
    universe: universeNum,
    active: true,
    channels: useChannels,
    activeChannels,
    peak,
    winner,
  };
}

function updateDmxPanel(data) {
  const win = data.winner;
  dmxMatrix.lastChannels = data.channels;
  dmxMatrix.lastUniverse = data.universe;
  if (data.active) {
    dmxMatrix.readout = win ? win.name : '';
  } else {
    dmxMatrix.readout = '';
  }
  if (state.dmxView && state.dmxView.readoutEl) {
    state.dmxView.readoutEl.textContent = dmxMatrix.readout;
    state.dmxView.readoutEl.classList.toggle('hidden', !dmxMatrix.readout);
  }
  paintDmxMatrix(data.channels);
}

function refreshDmxFromSnap(snap) {
  if (!state.dmxView || !snap) return;
  const data = dmxDataFromSnap(snap, state.dmxView.universe);
  if (data) {
    updateDmxPanel(data);
  } else if (state.dmxView.readoutEl) {
    state.dmxView.readoutEl.textContent = '';
    state.dmxView.readoutEl.classList.add('hidden');
  }
}

function toggleDmxInline(universe) {
  const u = Number(universe);
  if (!Number.isFinite(u) || u < 1) return;
  if (state.dmxView && state.dmxView.universe === u) {
    closeDmxWindow();
    return;
  }
  dmxMatrix.cells = null;
  dmxMatrix.gridEl = null;
  state.dmxView = { universe: u };
  syncInlineDmx();
  refreshDmxFromSnap(state.snap);
}

$('#canvas').addEventListener('mouseover', (ev) => {
  const px = ev.target.closest('.dmx-pixel');
  if (!px || !state.dmxView || !state.dmxView.readoutEl) return;
  if (!px.closest(`[data-dmx-slot="${state.dmxView.universe}"]`)) return;
  state.dmxView.readoutEl.textContent = `Adres ${px.dataset.ch}: ${px.style.getPropertyValue('--v') || '0'}`;
  state.dmxView.readoutEl.classList.remove('hidden');
});
$('#canvas').addEventListener('mouseout', (ev) => {
  const px = ev.target.closest('.dmx-pixel');
  if (!px || !state.dmxView || !state.dmxView.readoutEl) return;
  const related = ev.relatedTarget && ev.relatedTarget.closest(`[data-dmx-slot="${state.dmxView.universe}"] .dmx-matrix`);
  if (related) return;
  state.dmxView.readoutEl.textContent = dmxMatrix.readout || '';
  state.dmxView.readoutEl.classList.toggle('hidden', !dmxMatrix.readout);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && state.dmxView) closeDmxWindow();
});

/* ---------------- interactie ---------------- */

function handleDmxTrigger(ev) {
  const btn = ev.target.closest('.btn-dmx');
  if (btn) {
    toggleDmxInline(btn.dataset.dmxUniverse);
    ev.preventDefault();
    ev.stopPropagation();
    return true;
  }
  if (ev.type === 'dblclick') {
    const card = ev.target.closest('.sacn-dmx-card[data-dmx-universe]');
    if (card && !ev.target.closest('.btn-dmx')) {
      toggleDmxInline(card.dataset.dmxUniverse);
      ev.preventDefault();
      ev.stopPropagation();
      return true;
    }
  }
  return false;
}

$('#canvas').addEventListener('dblclick', (ev) => {
  if (handleDmxTrigger(ev)) return;
});

$('#canvas').addEventListener('click', (ev) => {
  if (ev.target.closest('.btn-dmx')) {
    handleDmxTrigger(ev);
    return;
  }
  const collapse = ev.target.closest('[data-action="expand-idle"], [data-action="collapse-idle"]');
  if (collapse) {
    state.idleUniversesExpanded = collapse.dataset.action === 'expand-idle';
    renderUniverses(state.snap);
    ev.stopPropagation();
    return;
  }
  const el = ev.target.closest('[data-id]');
  if (!el) {
    state.selected = null;
  } else if (state.selected === el.dataset.id) {
    state.selected = null; // tweede klik deselecteert
  } else {
    state.selected = el.dataset.id;
  }
  ev.stopPropagation();
  applySelection();
  drawEdges();
  renderRouteBanner(state.snap);
  renderDetail();
});

window.addEventListener('resize', () => requestAnimationFrame(drawEdges));
$('#canvas-wrap').addEventListener('scroll', () => requestAnimationFrame(drawEdges));

/* ---------------- instellingen ---------------- */

function formatAdapterLabel(iface) {
  const title = iface.label && iface.label !== iface.name
    ? `${iface.label} (${iface.name})`
    : iface.name;
  if (!iface.address) {
    if (iface.internal) return `${title} — lokaal, geen bruikbaar IP`;
    if (iface.ipv6Only) return `${title} — alleen IPv6, geen IPv4`;
    return `${title} — inactief, geen IP`;
  }
  const tags = [];
  if (iface.internal) tags.push('lokaal');
  if (iface.linkLocal) tags.push('link-local');
  if (iface.virtual) tags.push('virtueel');
  if (iface.recommended) tags.push('aanbevolen');
  const tagStr = tags.length ? ` · ${tags.join(', ')}` : '';
  return `${title} — ${iface.address}${tagStr}`;
}

function populateInterfaceDropdown(network, selected) {
  const sel = $('#cfg-iface');
  const current = selected || 'auto';
  const interfaces = (network && network.interfaces) || [];
  const active = interfaces.filter((i) => i.selectable);
  sel.innerHTML = `<option value="auto">Automatisch — alle actieve verbindingen (${active.length})</option>`;

  for (const iface of interfaces) {
    const opt = document.createElement('option');
    opt.value = iface.selectable ? iface.address : '';
    opt.textContent = formatAdapterLabel(iface);
    if (!iface.selectable) opt.disabled = true;
    sel.appendChild(opt);
  }

  if (current !== 'auto' && ![...sel.options].some((o) => o.value === current && !o.disabled)) {
    const saved = document.createElement('option');
    saved.value = current;
    saved.disabled = true;
    saved.textContent = `${current} — opgeslagen (niet actief op deze machine)`;
    sel.appendChild(saved);
  }

  const hasOption = [...sel.options].some((o) => o.value === current);
  sel.value = hasOption ? current : 'auto';

  const hint = $('#iface-hint');
  const total = interfaces.length;
  const inactive = interfaces.filter((i) => !i.selectable && !i.internal).length;
  if (current === 'auto') {
    const addrs = active.map((i) => i.address);
    hint.textContent = addrs.length
      ? `${total} verbindingen (${inactive} inactief). Luistert op: ${addrs.join(', ')}.`
      : `${total} verbindingen gevonden, geen met een bruikbaar adres.`;
  } else {
    hint.textContent = `Luistert alleen via ${current}. Het lichtsignaal moet op die verbinding binnenkomen.`;
  }
}

function firstNodeFromForm() {
  const line = $('#cfg-nodes').value.split('\n').map((l) => l.trim()).find(Boolean);
  if (!line) return null;
  const parts = line.split(',').map((s) => s.trim());
  return { ip: parts[0], password: parts[2] || '' };
}

function existingNodeIps() {
  return new Set(
    $('#cfg-nodes').value
      .split('\n')
      .map((line) => line.split(',')[0].trim())
      .filter(Boolean)
  );
}

function appendNodesToForm(nodes) {
  const existing = existingNodeIps();
  const lines = [];
  for (const node of nodes) {
    if (existing.has(node.ip)) continue;
    lines.push(node.name ? `${node.ip}, ${node.name}` : node.ip);
    existing.add(node.ip);
  }
  if (!lines.length) return 0;
  const current = $('#cfg-nodes').value.trim();
  $('#cfg-nodes').value = current ? `${current}\n${lines.join('\n')}` : lines.join('\n');
  return lines.length;
}

function renderDiscoverPanel(data) {
  const panel = $('#discover-panel');
  if (!data || !data.ok) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }

  const nodes = data.nodes || [];
  const locked = data.needsPassword || [];
  const limitedNote = data.limited ? ' (groot netwerk — alleen het directe bereik gescand)' : '';

  let html = `<div><b>${esc(data.subnet)}</b>${esc(limitedNote)} · ${data.scanned} adressen gecontroleerd in ${(data.ms / 1000).toFixed(1)}s</div>`;

  if (nodes.length) {
    html += '<ul>';
    for (const node of nodes) {
      html += `<li><b>${esc(node.name)}</b> — ${esc(node.ip)} (${esc(node.type)}${node.firmware ? `, ${esc(node.firmware)}` : ''})</li>`;
    }
    html += '</ul>';
    html += `<div class="discover-actions"><button type="button" id="btn-discover-add">Gevonden apparaten toevoegen (${nodes.length})</button></div>`;
  } else {
    html += '<p>Geen Luminex apparaten gevonden op dit netwerk.</p>';
  }

  if (locked.length) {
    html += `<p>${locked.length} apparaat/apparaten reageerden met wachtwoord (niet toegevoegd): ${esc(locked.map((n) => n.ip).join(', '))}</p>`;
  }

  panel.innerHTML = html;
  panel.classList.remove('hidden');

  const addBtn = $('#btn-discover-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const added = appendNodesToForm(nodes);
      const out = $('#node-discover-result');
      out.textContent = added ? `${added} node(s) toegevoegd aan de lijst` : 'Alle gevonden nodes stonden al in de lijst';
      out.style.color = added ? 'var(--good)' : 'var(--muted)';
    });
  }
}

$('#btn-discover-nodes').addEventListener('click', async () => {
  const iface = $('#cfg-iface').value;
  const out = $('#node-discover-result');
  const panel = $('#discover-panel');
  panel.classList.add('hidden');
  panel.innerHTML = '';

  if (!iface || iface === 'auto') {
    out.textContent = 'Kies eerst een netwerkverbinding (niet Automatisch).';
    out.style.color = 'var(--warn)';
    return;
  }

  const node = firstNodeFromForm();
  out.textContent = 'Zoekt apparaten…';
  out.style.color = 'var(--muted)';

  try {
    const res = await fetch('/api/nodes/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface: iface,
        password: node && node.password ? node.password : '',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      out.textContent = `✗ ${data.error || 'Scan mislukt'}`;
      out.style.color = 'var(--bad)';
      renderDiscoverPanel(null);
      return;
    }

    const count = (data.nodes || []).length;
    out.textContent = count
      ? `✓ ${count} node(s) gevonden op ${data.subnet}`
      : `Geen nodes gevonden op ${data.subnet}`;
    out.style.color = count ? 'var(--good)' : 'var(--warn)';
    renderDiscoverPanel(data);
  } catch (err) {
    out.textContent = `✗ ${err.message}`;
    out.style.color = 'var(--bad)';
    renderDiscoverPanel(null);
  }
});

$('#btn-settings').addEventListener('click', async () => {
  const drawer = $('#settings');
  const btn = $('#btn-settings');
  drawer.classList.toggle('hidden');
  const open = !drawer.classList.contains('hidden');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    const cfg = await fetch('/api/config').then((r) => r.json());
    $('#cfg-mode').value = cfg.mode || 'auto';
    $('#cfg-uni-start').value = cfg.universeRange.start;
    $('#cfg-uni-end').value = cfg.universeRange.end;
    populateInterfaceDropdown(cfg.network, cfg.interface || 'auto');
    $('#cfg-uni-aliases').value = aliasesToText(cfg.universeAliases);
    $('#cfg-sacn-out-aliases').value = sacnOutAliasesToText(cfg.sacnOutAliases);
    $('#cfg-port-aliases').value = portAliasesToText(cfg.portAliases);
    $('#cfg-nodes').value = (cfg.nodes || [])
      .map((n) => [n.ip, n.name, n.password].filter(Boolean).join(', '))
      .join('\n');
    $('#save-result').textContent = '';
    $('#node-test-result').textContent = '';
    $('#node-discover-result').textContent = '';
    $('#discover-panel').classList.add('hidden');
    $('#discover-panel').innerHTML = '';
  }
});

$('#cfg-iface').addEventListener('change', async () => {
  const cfg = await fetch('/api/config').then((r) => r.json()).catch(() => ({}));
  populateInterfaceDropdown(cfg.network, $('#cfg-iface').value);
});

$('#btn-test-node').addEventListener('click', async () => {
  const node = firstNodeFromForm();
  const out = $('#node-test-result');
  if (!node || !node.ip) {
    out.textContent = 'Vul eerst een node-IP in (eerste regel).';
    out.style.color = 'var(--warn)';
    return;
  }
  out.textContent = `Test ${node.ip}…`;
  out.style.color = 'var(--muted)';
  try {
    const res = await fetch('/api/node/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: node.ip, password: node.password || '••••' }),
    });
    const data = await res.json();
    if (data.ok) {
      out.textContent = `✓ ${data.name} (${data.type}) bereikbaar in ${data.ms}ms`;
      out.style.color = 'var(--good)';
    } else {
      out.textContent = `✗ ${data.error}`;
      out.style.color = 'var(--bad)';
    }
  } catch (err) {
    out.textContent = `✗ ${err.message}`;
    out.style.color = 'var(--bad)';
  }
});

$('#btn-save').addEventListener('click', async () => {
  const nodes = $('#cfg-nodes').value.split('\n')
    .map((line) => line.split(',').map((s) => s.trim()))
    .filter((parts) => parts[0])
    .map(([ip, name, password]) => ({ ip, name: name || '', password: password || '' }));

  const body = {
    mode: $('#cfg-mode').value,
    universeRange: {
      start: Number($('#cfg-uni-start').value),
      end: Number($('#cfg-uni-end').value),
    },
    interface: $('#cfg-iface').value,
    universeAliases: $('#cfg-uni-aliases').value,
    sacnOutAliases: $('#cfg-sacn-out-aliases').value,
    portAliases: $('#cfg-port-aliases').value,
    nodes,
  };
  const out = $('#save-result');
  out.textContent = 'opslaan…';
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    out.textContent = res.ok ? 'Opgeslagen ✓ — listener en nodes herstart' : `Fout: ${data.error}`;
  } catch (err) {
    out.textContent = `Fout: ${err.message}`;
  }
});

connect();
