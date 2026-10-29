/**
 * Gedeelde cache van de komende trekkenlijsten.
 * De Yesplan-oproep blijft bij de client; het resultaat staat hier
 * zodat de volgende keer (ook een andere app) niet opnieuw 120 dagen ophaalt.
 */

const store = require('./store');

const TTL_MS = Number(process.env.SHIFT_TREKKENLIJST_FEED_TTL_MS || (6 * 60 * 60 * 1000));
const MAX_ITEMS = 120;
const MAX_DOCS = 12;

function readState() {
  const raw = store.get('trekkenlijstFeed', null);
  if (!raw || typeof raw !== 'object' || !raw.entries || typeof raw.entries !== 'object') {
    return { entries: {} };
  }
  return { entries: raw.entries };
}

function writeState(state) {
  store.set('trekkenlijstFeed', { entries: state.entries || {} });
}

function venueKey(venueIds) {
  const ids = (Array.isArray(venueIds) ? venueIds : [])
    .map((id) => String(id || '').trim())
    .filter(Boolean)
    .slice(0, 40);
  if (!ids.length) return '';
  return [...new Set(ids)].sort().join('|');
}

function clip(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

function sanitizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const docs = (Array.isArray(raw.docs) ? raw.docs : [])
    .slice(0, MAX_DOCS)
    .map((doc) => ({
      url: clip(doc?.url, 2000),
      label: clip(doc?.label, 300)
    }))
    .filter((doc) => doc.url);
  const startRaw = clip(raw.startRaw || raw.eventDateRaw, 40);
  const sortTs = Number(raw.sortTs);
  return {
    id: clip(raw.id, 80),
    orgId: raw.orgId === 2 ? 2 : 1,
    syncKey: clip(raw.syncKey, 400),
    venueId: clip(raw.venueId, 80),
    venueLabel: clip(raw.venueLabel, 120),
    title: clip(raw.title, 300) || '—',
    groupId: clip(raw.groupId, 80) || null,
    startRaw,
    eventDateRaw: clip(raw.eventDateRaw, 10),
    docs,
    sortTs: Number.isFinite(sortTs) ? sortTs : Number.MAX_SAFE_INTEGER
  };
}

function getFeed(venueIds) {
  const key = venueKey(venueIds);
  if (!key) return { success: false, error: 'VENUES_REQUIRED' };
  const entry = readState().entries[key];
  if (!entry || !Array.isArray(entry.items)) {
    return { success: true, hit: false, stale: false, items: [], savedAt: null };
  }
  const savedAt = Number(entry.savedAt) || 0;
  const fresh = savedAt > 0 && (Date.now() - savedAt) <= TTL_MS;
  return {
    success: true,
    hit: fresh,
    stale: !fresh,
    items: entry.items,
    savedAt: savedAt || null
  };
}

function putFeed(venueIds, items) {
  const key = venueKey(venueIds);
  if (!key) return { success: false, error: 'VENUES_REQUIRED' };
  const clean = (Array.isArray(items) ? items : [])
    .map(sanitizeItem)
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
  const state = readState();
  state.entries[key] = { savedAt: Date.now(), items: clean };
  const keys = Object.keys(state.entries);
  if (keys.length > 30) {
    keys
      .sort((a, b) => (state.entries[a].savedAt || 0) - (state.entries[b].savedAt || 0))
      .slice(0, keys.length - 30)
      .forEach((k) => { delete state.entries[k]; });
  }
  writeState(state);
  return { success: true, savedAt: state.entries[key].savedAt, count: clean.length };
}

module.exports = {
  getFeed,
  putFeed,
  venueKey
};
