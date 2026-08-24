/**
 * Centrale sync voor voorstelling-timer snapshots.
 * Sleutel = datum|zaal|event-ids (zelfde als renderer getVoorstellingTimerStorageKey).
 */

const store = require('./store');

const MAX_AGE_MS = 120 * 86400000;
const MAX_KEYS = 200;

function pruneSnapshots(snapshots) {
  const out = { ...(snapshots || {}) };
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const k of Object.keys(out)) {
    const datePart = String(k).split('|')[0];
    const t = Date.parse(`${datePart}T12:00:00`);
    if (Number.isFinite(t) && t < cutoff) delete out[k];
  }
  const keys = Object.keys(out);
  if (keys.length <= MAX_KEYS) return out;
  const scored = keys.map((k) => ({
    k,
    u: Date.parse(out[k]?.updatedAt || '') || 0
  }));
  scored.sort((a, b) => b.u - a.u);
  for (const { k } of scored.slice(MAX_KEYS)) delete out[k];
  return out;
}

function readAllSnapshots() {
  const raw = store.get('voorstellingTimer', {});
  return raw && typeof raw === 'object' && raw.snapshots ? raw.snapshots : {};
}

function writeSnapshots(snapshots) {
  store.set('voorstellingTimer', { snapshots: pruneSnapshots(snapshots) });
}

function normalizeKey(key) {
  const k = String(key || '').trim();
  if (!k || k.length > 512) return null;
  if (k.includes('__proto__') || k.includes('prototype') || k.includes('constructor')) return null;
  return k;
}

function normalizeSlots(slots) {
  if (!slots || typeof slots !== 'object') return null;
  const out = {};
  for (const [slotId, payload] of Object.entries(slots)) {
    if (!slotId || typeof slotId !== 'object' && typeof slotId !== 'string') continue;
    const id = String(slotId);
    if (!id || id === '__proto__' || id === 'prototype' || id === 'constructor') continue;
    if (!payload || typeof payload !== 'object') continue;
    out[id] = payload;
  }
  return out;
}

function getSnapshot(key) {
  const k = normalizeKey(key);
  if (!k) return { success: false, error: 'INVALID_KEY' };
  const snap = readAllSnapshots()[k];
  if (!snap) return { success: true, key: k, slots: null, updatedAt: null };
  return {
    success: true,
    key: k,
    slots: snap.slots || null,
    updatedAt: snap.updatedAt || null
  };
}

function putSnapshot({ key, slots, updatedAt, baseUpdatedAt }) {
  const k = normalizeKey(key);
  const normalizedSlots = normalizeSlots(slots);
  if (!k || !normalizedSlots) return { success: false, error: 'INVALID_PAYLOAD' };
  const ts = String(updatedAt || new Date().toISOString());
  const all = readAllSnapshots();
  const current = all[k];
  if (current?.updatedAt && baseUpdatedAt && current.updatedAt !== baseUpdatedAt) {
    const curTs = Date.parse(current.updatedAt) || 0;
    const baseTs = Date.parse(baseUpdatedAt) || 0;
    if (curTs > baseTs) {
      return {
        success: false,
        conflict: true,
        key: k,
        slots: current.slots || null,
        updatedAt: current.updatedAt
      };
    }
  }
  all[k] = { slots: normalizedSlots, updatedAt: ts };
  writeSnapshots(all);
  return { success: true, key: k, updatedAt: ts };
}

function listSnapshots() {
  const all = readAllSnapshots();
  return {
    success: true,
    items: Object.entries(all).map(([key, snap]) => ({
      key,
      updatedAt: snap?.updatedAt || null,
      slotCount: snap?.slots ? Object.keys(snap.slots).length : 0
    }))
  };
}

module.exports = {
  getSnapshot,
  putSnapshot,
  listSnapshots
};
