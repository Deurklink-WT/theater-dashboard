/**
 * Actieve sACN-universes op het LAN: E1.31 multicast (poort 5568).
 *
 * Eén UDP-socket (meerdere sockets op 5568 delen multicast onbetrouwbaar op macOS).
 * Multicast-joins gebruiken expliciet de interface van hetzelfde subnet als de
 * LumiNode (`hintHost`), anders pakt het OS soms Wi‑Fi i.p.v. je lichtnetwerk.
 */
const dgram = require('dgram');
const os = require('os');
const { Packet } = require('sacn');

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 96;
const DEFAULT_DURATION_MS = 4500;
const SETTLE_MS = 400;
const SACN_PORT = 5568;

/** RootVector.DATA / FrameVector.DATA — zelfde als sacn constants */
const E131_ROOT_DATA = 4;
const E131_FRAME_DATA = 2;

/** @deprecated Alleen voor compat; scan gebruikt nu één socket. */
const UNIVERSES_PER_SOCKET = 24;

/**
 * Zelfde adreslogica als sacn `multicastGroup`.
 * @param {number} universe
 */
function multicastGroupAddr(universe) {
    if ((universe > 0 && universe <= 63999) || universe === 64214) {
        return `239.255.${universe >> 8}.${universe & 255}`;
    }
    throw new RangeError('universe must be between 1-63999');
}

/**
 * Lokale IPv4 kiezen in hetzelfde /24 als `remoteIp` (bv. LumiNode 10.0.1.230).
 * @param {string} [remoteIp]
 * @returns {string|undefined}
 */
function pickMulticastIfaceForRemoteHost(remoteIp) {
    if (!remoteIp || typeof remoteIp !== 'string') return undefined;
    const t = remoteIp.trim();
    const m = t.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return undefined;
    const o = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    if (o.some((x) => x > 255)) return undefined;

    const nets = os.networkInterfaces();
    let fallback;
    for (const addrs of Object.values(nets)) {
        if (!addrs) continue;
        for (const a of addrs) {
            if (a.family !== 'IPv4' || a.internal) continue;
            const p = a.address.split('.').map(Number);
            if (p[0] === o[0] && p[1] === o[1] && p[2] === o[2]) {
                return a.address;
            }
            if (!fallback) fallback = a.address;
        }
    }
    return fallback;
}

/**
 * Als `sacn.Packet` faalt (strikte asserts), toch universe proberen te lezen.
 * @param {Buffer} buf
 * @returns {{ universe: number, sourceName: string, cidHex: string } | null}
 */
function parseSacnDataLoose(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 126) return null;
    try {
        if (buf.readUInt32BE(18) !== E131_ROOT_DATA) return null;
        if (buf.readUInt32BE(40) !== E131_FRAME_DATA) return null;
        const universe = buf.readUInt16BE(113);
        if (universe < 1 || universe > 63999) return null;
        const sourceName = buf.toString('ascii', 44, 107).replace(/\x00/g, '').trim();
        const cidHex = buf.length >= 38 ? buf.slice(22, 38).toString('hex') : 'unknown';
        return { universe, sourceName, cidHex };
    } catch (_) {
        return null;
    }
}

function mergeUniverseRows(a, b) {
    const hits = (a.hits || 0) + (b.hits || 0);
    const scA = Number(a.streamCount) > 0 ? Number(a.streamCount) : 1;
    const scB = Number(b.streamCount) > 0 ? Number(b.streamCount) : 1;
    return {
        universe: a.universe,
        hits,
        streamCount: scA + scB,
        sourceName: (a.sourceName && String(a.sourceName).trim()) || (b.sourceName && String(b.sourceName).trim()) || '',
        sourceAddress: (a.sourceAddress && String(a.sourceAddress).trim()) || (b.sourceAddress && String(b.sourceAddress).trim()) || '',
        priority: a.priority != null ? a.priority : b.priority
    };
}

/** Per unieke zender (CID): meerdere streams op dezelfde universe zijn aparte sleutels. */
function applyPacketToStreamMap(streamMap, u, cidHex, sourceName, sourceAddress, priority) {
    if (Number.isNaN(u) || u < 1 || u > 63999) return;
    const cid = cidHex && typeof cidHex === 'string' && cidHex.length ? cidHex : 'unknown';
    const key = `${u}:${cid}`;
    const cur = streamMap.get(key) || {
        universe: u,
        cidHex: cid,
        sourceName: '',
        sourceAddress: '',
        hits: 0,
        priority: null
    };
    cur.hits += 1;
    if (sourceName) cur.sourceName = String(sourceName);
    if (sourceAddress) cur.sourceAddress = String(sourceAddress);
    if (priority != null) cur.priority = priority;
    streamMap.set(key, cur);
}

/**
 * Streams samenvouwen naar één rij per universe (voor de matrix), met streamCount.
 * @param {Map<string, object>} streamMap
 */
function aggregateStreamsToUniverseList(streamMap) {
    const byU = new Map();
    for (const row of streamMap.values()) {
        const u = Number(row.universe);
        if (Number.isNaN(u)) continue;
        const ex = byU.get(u);
        if (!ex) {
            byU.set(u, {
                universe: u,
                hits: row.hits || 0,
                sourceName: (row.sourceName && String(row.sourceName).trim()) || '',
                sourceAddress: (row.sourceAddress && String(row.sourceAddress).trim()) || '',
                priority: row.priority != null ? row.priority : null,
                streamCount: 1
            });
        } else {
            ex.hits += row.hits || 0;
            ex.streamCount += 1;
            if (!ex.sourceName && row.sourceName) ex.sourceName = String(row.sourceName).trim();
            if (!ex.sourceAddress && row.sourceAddress) ex.sourceAddress = String(row.sourceAddress).trim();
            if (ex.priority == null && row.priority != null) ex.priority = row.priority;
        }
    }
    return Array.from(byU.values()).sort((a, b) => a.universe - b.universe);
}

/**
 * @param {number} minU
 * @param {number} maxU
 * @param {number} durationMs
 * @param {string|undefined} iface — lokale IPv4 voor IP_ADD_MEMBERSHIP
 */
function scanSacnSingleSocket(minU, maxU, durationMs, iface) {
    return new Promise((resolve) => {
        const streamMap = new Map();
        const errors = [];
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        let finished = false;

        const done = (payload) => {
            if (finished) return;
            finished = true;
            try {
                socket.removeAllListeners('message');
                socket.removeAllListeners('error');
                socket.close();
            } catch (_) {
                /* ignore */
            }
            resolve(payload);
        };

        const onMessage = (msg, rinfo) => {
            const addr = rinfo && rinfo.address ? String(rinfo.address) : '';
            try {
                const packet = new Packet(msg, addr);
                const u = Number(packet.universe);
                if (u < minU || u > maxU) return;
                const cidHex =
                    packet.cid && packet.cid.length ? packet.cid.toString('hex') : 'unknown';
                applyPacketToStreamMap(
                    streamMap,
                    u,
                    cidHex,
                    packet.sourceName,
                    packet.sourceAddress,
                    packet.priority
                );
            } catch (_) {
                const loose = parseSacnDataLoose(msg);
                if (!loose || loose.universe < minU || loose.universe > maxU) return;
                applyPacketToStreamMap(
                    streamMap,
                    loose.universe,
                    loose.cidHex || 'unknown',
                    loose.sourceName,
                    addr,
                    null
                );
            }
        };

        socket.on('message', onMessage);
        socket.on('error', (e) => {
            const m = e && e.message ? String(e.message) : String(e);
            errors.push(m);
        });

        socket.bind(SACN_PORT, () => {
            try {
                if (iface) {
                    socket.setMulticastInterface(iface);
                }
            } catch (e) {
                errors.push(`setMulticastInterface: ${e && e.message ? e.message : e}`);
            }
            try {
                socket.setMulticastLoopback(true);
            } catch (_) {
                /* optioneel */
            }

            for (let u = minU; u <= maxU; u++) {
                try {
                    socket.addMembership(multicastGroupAddr(u), iface || undefined);
                } catch (err) {
                    const em = err && err.message ? String(err.message) : String(err);
                    errors.push(`Multicast join universe ${u}: ${em}`);
                }
            }

            setTimeout(() => {
                setTimeout(() => {
                    const universes = aggregateStreamsToUniverseList(streamMap);
                    const totalStreams = streamMap.size;
                    done({ ok: true, universes, totalStreams, errors });
                }, durationMs);
            }, SETTLE_MS);
        });

        socket.once('error', (e) => {
            if (finished) return;
            const msg = e && e.message ? e.message : String(e);
            done({
                ok: false,
                error: msg,
                universes: [],
                errors
            });
        });
    });
}

/**
 * @param {object} [options]
 * @param {number} [options.minUniverse]
 * @param {number} [options.maxUniverse]
 * @param {number} [options.durationMs]
 * @param {string} [options.iface] — lokale IP van de gewenste netwerkinterface
 * @param {string} [options.hintHost] — bv. LumiNode-IP; zelfde subnet → juiste interface
 * @returns {Promise<{ ok: boolean, universes?: object[], error?: string, warnings?: string[], range?: object, durationMs?: number, multicastIface?: string }>}
 */
async function scanSacnUniverses(options = {}) {
    const minU = Math.max(1, Number(options.minUniverse) || DEFAULT_MIN);
    const maxU = Math.min(63999, Number(options.maxUniverse) || DEFAULT_MAX);
    if (minU > maxU) {
        return { ok: false, error: 'minUniverse > maxUniverse', universes: [] };
    }
    const span = maxU - minU + 1;
    if (span > 512) {
        return { ok: false, error: 'Maximaal 512 universes per scan (range te breed).', universes: [] };
    }

    const durationMs = Math.min(60000, Math.max(1000, Number(options.durationMs) || DEFAULT_DURATION_MS));
    const ifaceOpt =
        (options.iface && String(options.iface).trim()) ||
        pickMulticastIfaceForRemoteHost(options.hintHost && String(options.hintHost).trim()) ||
        undefined;

    const r = await scanSacnSingleSocket(minU, maxU, durationMs, ifaceOpt);

    if (!r.ok) {
        const uniq = [...new Set(r.errors || [])];
        return {
            ok: false,
            error: r.error || 'sACN-socket mislukt.',
            universes: [],
            warnings: uniq.length ? uniq : undefined,
            multicastIface: ifaceOpt
        };
    }

    const merged = new Map();
    for (const row of r.universes || []) {
        const u = Number(row.universe);
        if (Number.isNaN(u)) continue;
        const ex = merged.get(u);
        if (!ex) merged.set(u, { ...row, universe: u });
        else merged.set(u, mergeUniverseRows(ex, row));
    }

    const list = Array.from(merged.values()).sort((a, b) => a.universe - b.universe);
    const uniqWarnings = [...new Set(r.errors || [])];
    const totalStreams =
        typeof r.totalStreams === 'number'
            ? r.totalStreams
            : list.reduce((sum, x) => sum + (Number(x.streamCount) > 0 ? Number(x.streamCount) : 1), 0);

    const out = {
        ok: true,
        universes: list,
        totalStreams,
        range: { min: minU, max: maxU },
        durationMs,
        multicastIface: ifaceOpt
    };
    if (uniqWarnings.length) {
        out.warnings = uniqWarnings;
    }
    return out;
}

module.exports = {
    scanSacnUniverses,
    pickMulticastIfaceForRemoteHost,
    DEFAULT_MIN,
    DEFAULT_MAX,
    DEFAULT_DURATION_MS,
    UNIVERSES_PER_SOCKET
};
