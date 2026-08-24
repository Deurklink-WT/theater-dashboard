/**
 * Sync voor trekkenlijst-status per Yesplan-event (opmerking + verwerkt).
 * Sleutel = {orgId}:{eventId}
 */

const store = require('./store');
const auditLog = require('./audit-log');

const MAX_AGE_MS = 120 * 86400000;
const MAX_KEYS = 500;

function readItems() {
  const raw = store.get('trekkenlijst', {});
  return raw && typeof raw.items === 'object' && raw.items ? raw.items : {};
}

function pruneItems(items) {
  const out = { ...(items || {}) };
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const [k, item] of Object.entries(out)) {
    const eventDate = item?.eventDate ? Date.parse(String(item.eventDate)) : NaN;
    const updated = Date.parse(item?.updatedAt || '') || 0;
    const ref = Number.isFinite(eventDate) ? eventDate : updated;
    if (ref && ref < cutoff) delete out[k];
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

function writeItems(items) {
  store.set('trekkenlijst', { items: pruneItems(items) });
}

function normalizeKey(key) {
  const k = String(key || '').trim();
  if (!k || k.length > 512) return null;
  if (k.includes('__proto__') || k.includes('prototype') || k.includes('constructor')) return null;
  return k;
}

function normalizeComment(value) {
  if (value == null) return '';
  return String(value).slice(0, 4000);
}

function getItem(key) {
  const k = normalizeKey(key);
  if (!k) return { success: false, error: 'INVALID_KEY' };
  const item = readItems()[k];
  if (!item) {
    return {
      success: true,
      key: k,
      item: null
    };
  }
  return { success: true, key: k, item };
}

function listItems() {
  return { success: true, items: readItems() };
}

function putItem(payload = {}, actor = {}) {
  const k = normalizeKey(payload.key);
  if (!k) return { success: false, error: 'INVALID_KEY' };

  const all = readItems();
  const current = all[k] || null;
  const baseUpdatedAt = payload.baseUpdatedAt ? String(payload.baseUpdatedAt) : null;

  if (current?.updatedAt && baseUpdatedAt && current.updatedAt !== baseUpdatedAt) {
    const curTs = Date.parse(current.updatedAt) || 0;
    const baseTs = Date.parse(baseUpdatedAt) || 0;
    if (curTs > baseTs) {
      return {
        success: false,
        conflict: true,
        key: k,
        item: current
      };
    }
  }

  const now = new Date().toISOString();
  const next = {
    ...(current || {}),
    title: payload.title != null ? String(payload.title).slice(0, 500) : (current?.title || null),
    eventDate: payload.eventDate != null ? String(payload.eventDate).slice(0, 32) : (current?.eventDate || null),
    updatedAt: now
  };

  const auditEntries = [];
  const actorEmail = actor.email || null;
  const actorId = actor.userId || null;
  const actorClient = actor.client || null;

  if (typeof payload.verwerkt === 'boolean') {
    const prev = !!current?.verwerkt;
    const val = payload.verwerkt;
    if (prev !== val) {
      next.verwerkt = val;
      next.verwerktAt = now;
      next.verwerktBy = actorEmail;
      auditEntries.push({
        action: val ? 'trekkenlijst.verwerkt' : 'trekkenlijst.onverwerkt',
        detail: { verwerkt: val }
      });
    }
  }

  if (payload.comment !== undefined) {
    const prev = normalizeComment(current?.comment);
    const val = normalizeComment(payload.comment);
    if (prev !== val) {
      next.comment = val;
      next.commentAt = val ? now : (current?.commentAt || null);
      next.commentBy = val ? actorEmail : null;
      auditEntries.push({
        action: val ? 'trekkenlijst.opmerking' : 'trekkenlijst.opmerking_gewist',
        detail: { comment: val || null }
      });
    }
  }

  if (!current && next.verwerkt == null && !next.comment) {
    return { success: true, key: k, item: null, updatedAt: null, unchanged: true };
  }

  all[k] = next;
  writeItems(all);

  for (const audit of auditEntries) {
    auditLog.appendEntry({
      userId: actorId,
      email: actorEmail,
      client: actorClient,
      action: audit.action,
      targetKey: k,
      title: next.title || null,
      detail: audit.detail
    });
  }

  return { success: true, key: k, item: next, updatedAt: now };
}

module.exports = {
  getItem,
  listItems,
  putItem
};
