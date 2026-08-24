const dgram = require('dgram');

function alignOscString(s) {
    const b = Buffer.from(`${s}\0`, 'utf8');
    const pad = (4 - (b.length % 4)) % 4;
    return Buffer.concat([b, Buffer.alloc(pad, 0)]);
}

/** OSC-bericht: /shift-happens/timer/step ,ss slotId stepId */
function buildTimerStepOscBuffer(slotId, stepId) {
    return Buffer.concat([
        alignOscString('/shift-happens/timer/step'),
        alignOscString(',ss'),
        alignOscString(String(slotId)),
        alignOscString(String(stepId))
    ]);
}

function sendOscUdp(host, port, buf) {
    return new Promise((resolve, reject) => {
        const s = dgram.createSocket('udp4');
        s.send(buf, port, host, (err) => {
            try {
                s.close();
            } catch (_) {
                /* ignore */
            }
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { buildTimerStepOscBuffer, sendOscUdp };
