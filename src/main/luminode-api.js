/**
 * LumiNode / LumiCore REST API (basis-URL http://host/api/).
 * Zie o.a. Bitfocus companion-module-luminex-luminode.
 */
const axios = require('axios');
const http = require('http');

function buildAuthHeaders(password) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (password && String(password).trim()) {
        headers.Authorization = `Basic ${Buffer.from(`admin:${String(password).trim()}`, 'utf8').toString('base64')}`;
    }
    return headers;
}

function normalizeHost(host) {
    return String(host || '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .split('/')[0];
}

/**
 * /api/processblock kan een array zijn, of JSON met { processblocks: [...] }, of één object.
 * Soms: { "0": {...}, "1": {...} } of { engines: [...] }.
 */
function normalizeProcessblockList(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
        if (Array.isArray(raw.processblock)) return raw.processblock;
        if (Array.isArray(raw.processblocks)) return raw.processblocks;
        if (Array.isArray(raw.blocks)) return raw.blocks;
        if (Array.isArray(raw.data)) return raw.data;
        if (Array.isArray(raw.list)) return raw.list;
        if (Array.isArray(raw.items)) return raw.items;
        if (Array.isArray(raw.engines)) return raw.engines;
        if (Array.isArray(raw.entries)) return raw.entries;
        if (raw.id != null) return [raw];
        const keys = Object.keys(raw).filter((k) => /^\d+$/.test(k));
        if (keys.length > 0) {
            return keys
                .sort((a, b) => Number(a) - Number(b))
                .map((k) => {
                    const v = raw[k];
                    if (v && typeof v === 'object' && v.id == null) {
                        return { ...v, id: Number(k) };
                    }
                    return v;
                })
                .filter(Boolean);
        }
    }
    return [];
}

function createLuminodeHttpClient(localAddress) {
    const cfg = {
        timeout: 10000,
        validateStatus: () => true
    };
    if (localAddress) {
        cfg.httpAgent = new http.Agent({ keepAlive: true, localAddress });
    }
    return axios.create(cfg);
}

async function fetchJson(host, password, path, options = {}) {
    const h = normalizeHost(host);
    if (!h) throw new Error('Geen host');
    const url = `http://${h}/api/${String(path).replace(/^\//, '')}`;
    const client = createLuminodeHttpClient(String(options.localAddress || '').trim());
    const res = await client.get(url, { headers: buildAuthHeaders(password), responseType: 'text' });
    if (res.status < 200 || res.status >= 300) {
        const t = String(res.data || '');
        throw new Error(`HTTP ${res.status}${t ? `: ${t.slice(0, 200)}` : ''}`);
    }
    const ct = String(res.headers?.['content-type'] || '');
    if (ct.includes('application/json')) return JSON.parse(String(res.data || 'null'));
    return null;
}

/**
 * @param {string} host
 * @param {string} password
 * @param {string} path — zonder /api/
 * @param {unknown} body — wordt als JSON verstuurd
 * @param {'PUT'|'POST'|'PATCH'} [method='PUT']
 */
async function writeJson(host, password, path, body, method = 'PUT', options = {}) {
    const h = normalizeHost(host);
    if (!h) throw new Error('Geen host');
    const url = `http://${h}/api/${String(path).replace(/^\//, '')}`;
    const client = createLuminodeHttpClient(String(options.localAddress || '').trim());
    const res = await client.request({
        url,
        method,
        headers: buildAuthHeaders(password),
        data: body,
        responseType: 'text'
    });
    if (res.status < 200 || res.status >= 300) {
        const t = String(res.data || '');
        throw new Error(`HTTP ${res.status}${t ? `: ${t.slice(0, 200)}` : ''}`);
    }
    const ct = String(res.headers?.['content-type'] || '');
    if (ct.includes('application/json')) {
        try {
            return JSON.parse(String(res.data || 'null'));
        } catch (_) {
            return null;
        }
    }
    return null;
}

async function tryFetchJson(host, password, path, errors, required, options = {}) {
    try {
        return await fetchJson(host, password, path, options);
    } catch (e) {
        if (required) errors.push(`${path}: ${e.message || e}`);
        return { _error: e.message || String(e) };
    }
}

/**
 * Haalt deviceinfo, processblock-metadata, pipeline/sources per block, en IO-lijst (best effort).
 */
async function getLumiNodeCapabilities(host, password, options = {}) {
    const out = {
        ok: true,
        host: normalizeHost(host),
        deviceinfo: null,
        processblocks: [],
        io: null,
        errors: []
    };

    try {
        out.deviceinfo = await fetchJson(host, password, 'deviceinfo', options);
    } catch (e) {
        out.ok = false;
        out.errors.push(`deviceinfo: ${e.message || e}`);
        return out;
    }

    let pbList = [];
    try {
        const rawPb = await fetchJson(host, password, 'processblock', options);
        pbList = normalizeProcessblockList(rawPb);
    } catch (e) {
        out.errors.push(`processblock: ${e.message || e}`);
    }

    const di = out.deviceinfo || {};
    const nrRaw =
        di.nr_processblocks ??
        di.nrProcessblocks ??
        di.processblock_count ??
        di.nr_process_blocks ??
        di.processBlocks;
    const nrFromDevice = Number(nrRaw);

    const idSet = new Set();
    pbList.forEach((p, idx) => {
        const id = p && p.id != null ? Number(p.id) : idx;
        if (!Number.isNaN(id)) idSet.add(id);
    });

    /**
     * Vul ontbrekende indices: bij nr=2 en API levert alleen id 1 → voeg 0 en 1 toe (0-based pipeline).
     * Als de API al nr stuks levert (0,1 of 1,2), niet extra mengen.
     */
    if (!Number.isNaN(nrFromDevice) && nrFromDevice > 0 && idSet.size < nrFromDevice) {
        for (let k = 0; k < nrFromDevice; k++) {
            idSet.add(k);
        }
    }
    if (idSet.size === 0 && pbList.length > 0) {
        pbList.forEach((_, idx) => idSet.add(idx));
    }

    const ids = Array.from(idSet).sort((a, b) => a - b);

    for (const i of ids) {
        const meta = pbList.find((p) => Number(p.id) === i) || null;
        const name =
            meta && (meta.name != null || meta.short_name != null)
                ? String(meta.name != null ? meta.name : meta.short_name)
                : `Process ${i + 1}`;
        const sources = await tryFetchJson(
            host,
            password,
            `pipeline/processblock/${i}/sources`,
            out.errors,
            true,
            options
        );
        const outputs = await tryFetchJson(
            host,
            password,
            `pipeline/processblock/${i}/outputs`,
            out.errors,
            false,
            options
        );
        const pipelineRoot = await tryFetchJson(
            host,
            password,
            `pipeline/processblock/${i}`,
            out.errors,
            false,
            options
        );
        /** Volledige processblock (OpenAPI: inputs/outputs als io_id-maps) — bron voor routing t.o.v. pipeline/sources. */
        const processblockConfig = await tryFetchJson(host, password, `processblock/${i}`, out.errors, true, options);
        /* Extra OpenAPI-config voor completere visuele route-inferentie. */
        const processblockInputSlots = await tryFetchJson(
            host,
            password,
            `processblock/${i}/input`,
            out.errors,
            false,
            options
        );
        const processblockOutputsConfig = await tryFetchJson(
            host,
            password,
            `processblock/${i}/output`,
            out.errors,
            false,
            options
        );
        const processblockMergeMap = await tryFetchJson(
            host,
            password,
            `processblock/${i}/merge_map`,
            out.errors,
            false,
            options
        );
        /* IO-koppelingen per processblock/slot (best effort; slot 0..15 dekt gangbare engines). */
        const ioByProcessblockInput = {};
        for (let slot = 0; slot < 16; slot++) {
            const p = `IO/by_processblock/${i}/input/${slot}`;
            const row = await tryFetchJson(host, password, p, out.errors, false, options);
            if (row && !row._error) ioByProcessblockInput[String(slot)] = row;
        }
        out.processblocks.push({
            id: i,
            name,
            sources,
            outputs,
            meta,
            pipelineRoot,
            processblockConfig: processblockConfig && typeof processblockConfig === 'object' ? processblockConfig : meta,
            processblockInputSlots:
                processblockInputSlots && typeof processblockInputSlots === 'object' ? processblockInputSlots : null,
            processblockOutputsConfig:
                processblockOutputsConfig && typeof processblockOutputsConfig === 'object' ? processblockOutputsConfig : null,
            processblockMergeMap:
                processblockMergeMap && typeof processblockMergeMap === 'object' ? processblockMergeMap : null,
            ioByProcessblockInput
        });
    }

    /** Volledige IO-lijst nodig om io_id → universe (inputs) en io_id → uitgang (outputs) te mappen. */
    const ioTries = ['IO', 'IO?io_class=output', 'IO?io_class=sacn'];
    for (const p of ioTries) {
        try {
            out.io = await fetchJson(host, password, p, options);
            if (out.io != null) break;
        } catch (e) {
            out.errors.push(`${p}: ${e.message || e}`);
        }
    }

    /** Voorkom dubbele processblock-id (API kan duplicaten leveren) — dubbele engine-kaarten in de UI. */
    const pbById = new Map();
    for (const pb of out.processblocks) {
        const id = Number(pb.id);
        if (Number.isNaN(id) || pbById.has(id)) continue;
        pbById.set(id, pb);
    }
    out.processblocks = Array.from(pbById.values()).sort((a, b) => Number(a.id) - Number(b.id));

    return out;
}

module.exports = { getLumiNodeCapabilities, fetchJson, writeJson, normalizeHost };
