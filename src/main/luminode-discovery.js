/**
 * mDNS/Bonjour discovery voor Luminex LumiNode (_luminex._tcp).
 * Zelfde service-type als Bitfocus Companion-module (bonjourQueries.type: luminex).
 */
const { Bonjour } = require('bonjour-service');

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * @param {number} [timeoutMs]
 * @returns {Promise<{ ok: boolean, devices: object[], error?: string }>}
 */
function browseLuminodes(timeoutMs = DEFAULT_TIMEOUT_MS) {
    return new Promise((resolve) => {
        let bonjour;
        let browser;
        const devices = [];
        const seen = new Set();

        try {
            bonjour = new Bonjour();
            browser = bonjour.find({ type: 'luminex', protocol: 'tcp' });
        } catch (err) {
            resolve({
                ok: false,
                error: err && err.message ? err.message : String(err),
                devices: []
            });
            return;
        }

        browser.on('up', (service) => {
            const key = service.fqdn || `${service.name || ''}:${service.host || ''}:${service.port || ''}`;
            if (seen.has(key)) return;
            seen.add(key);
            const addrs = Array.isArray(service.addresses) ? service.addresses : [];
            const ipv4 = addrs.find((a) => a && typeof a === 'string' && !a.includes(':'));
            devices.push({
                name: service.name || 'LumiNode',
                host: service.host,
                port: service.port,
                fqdn: service.fqdn,
                addresses: addrs,
                ipv4: ipv4 || null,
                txt: service.txt || {}
            });
        });

        const finish = () => {
            try {
                if (browser && typeof browser.stop === 'function') browser.stop();
            } catch (_) {
                /* ignore */
            }
            try {
                if (bonjour && typeof bonjour.destroy === 'function') {
                    bonjour.destroy();
                }
            } catch (_) {
                /* ignore */
            }
            resolve({ ok: true, devices });
        };

        setTimeout(finish, timeoutMs);
    });
}

module.exports = { browseLuminodes, DEFAULT_TIMEOUT_MS };
