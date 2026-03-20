/**
 * Gedeelde Yesplan-response cache (gebruikt door main process en api-server).
 * Vermindert serverbelasting bij navigatie; lege resultaten worden door de aanroeper niet gecachet.
 */
const { YESPLAN_CACHE_TTL_MS, YESPLAN_CACHE_MAX } = require('./constants');

const cache = new Map();

function createKey(orgKey, params) {
  const { startDate, endDate, venueId } = params;
  return `yesplan:org${orgKey}:${startDate || ''}:${endDate || ''}:${venueId ?? 'all'}`;
}

function get(key) {
  const ent = cache.get(key);
  if (!ent) return null;
  if (Date.now() - ent.ts > YESPLAN_CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return ent.data;
}

function set(key, data) {
  if (cache.size >= YESPLAN_CACHE_MAX) {
    let oldest = null;
    let oldestTs = Infinity;
    for (const [k, v] of cache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldest = k; }
    }
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

module.exports = { createKey, get, set };
