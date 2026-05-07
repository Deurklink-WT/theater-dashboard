/**
 * Minimale OSC UDP-server voor Stream Deck / Bitfocus Companion → voorstelling-timer stappen.
 * Standaard: 127.0.0.1:3955 (override: OSC_TIMER_PORT, OSC_TIMER_HOST)
 *
 * Ondersteunde adressen:
 * - /shift-happens/timer/step + 2× string-arg: slotId, stepId  (aanbevolen)
 * - /shift-happens/timer/<slotId>/<stepId>  (één pad; stepId mag underscores bevatten)
 */

const dgram = require('dgram');

function align4(n) {
    return Math.ceil(n / 4) * 4;
}

function readOscString(buf, off) {
    let end = off;
    while (end < buf.length && buf[end] !== 0) end += 1;
    const s = buf.toString('utf8', off, end);
    end += 1;
    return { str: s, offset: align4(end) };
}

function parseOscArgs(buf, off, typetag) {
    const args = [];
    let o = off;
    for (let i = 1; i < typetag.length; i += 1) {
        const t = typetag[i];
        if (t === 's') {
            const r = readOscString(buf, o);
            args.push(r.str);
            o = r.offset;
        } else if (t === 'i') {
            if (o + 4 > buf.length) break;
            args.push(buf.readInt32BE(o));
            o += 4;
        } else if (t === 'f') {
            if (o + 4 > buf.length) break;
            args.push(buf.readFloatBE(o));
            o += 4;
        } else {
            break;
        }
    }
    return args;
}

function parseOscMessage(buf) {
    if (!buf || buf.length < 4) return null;
    const pathR = readOscString(buf, 0);
    if (pathR.offset >= buf.length) return { path: pathR.str, args: [] };
    const tagR = readOscString(buf, pathR.offset);
    const typetag = tagR.str;
    if (!typetag.startsWith(',')) return { path: pathR.str, args: [] };
    const args = parseOscArgs(buf, tagR.offset, typetag);
    return { path: pathR.str, args };
}

function parseOscPacket(buf) {
    if (buf.length >= 16 && buf.toString('ascii', 0, 8) === '#bundle\0') {
        let o = 16;
        while (o + 4 <= buf.length) {
            const size = buf.readUInt32BE(o);
            o += 4;
            if (size <= 0 || o + size > buf.length) break;
            const inner = buf.subarray(o, o + size);
            o += size;
            const msg = parseOscMessage(inner);
            if (msg) return msg;
        }
        return null;
    }
    return parseOscMessage(buf);
}

function matchTimerTrigger(path, args) {
    const p = path.replace(/\/+$/, '');
    if (p === '/shift-happens/timer/step' && args.length >= 2) {
        return { slotId: String(args[0]).trim(), stepId: String(args[1]).trim() };
    }
    const m = p.match(/^\/shift-happens\/timer\/([^/]+)\/(.+)$/);
    if (m) return { slotId: m[1].trim(), stepId: m[2].trim() };
    return null;
}

/**
 * @param {{ port?: number, host?: string, onTrigger: (p: { slotId: string, stepId: string }) => void }} opts
 * @returns {() => void} stop
 */
function startOscTimerListener(opts) {
    const port = Number(opts.port || process.env.OSC_TIMER_PORT || 3955);
    const host = String(opts.host || process.env.OSC_TIMER_HOST || '127.0.0.1');
    const { onTrigger } = opts;

    const socket = dgram.createSocket('udp4');
    socket.on('message', (msg) => {
        try {
            const parsed = parseOscPacket(msg);
            if (!parsed) return;
            const data = matchTimerTrigger(parsed.path, parsed.args);
            if (data && data.slotId && data.stepId) onTrigger(data);
        } catch (e) {
            console.error('[OSC timer]', e.message);
        }
    });
    socket.on('error', (err) => console.error('[OSC timer] socket:', err.message));

    socket.bind(port, host, () => {
        console.log(`[OSC timer] luistert op udp://${host}:${port} (Shift Happens timer-stappen)`);
    });

    return () => {
        try {
            socket.close();
        } catch (_) {
            /* ignore */
        }
    };
}

module.exports = { startOscTimerListener, parseOscPacket, matchTimerTrigger };
