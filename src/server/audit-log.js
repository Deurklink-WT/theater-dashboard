/**
 * Append-only auditlog voor Shift-server (o.a. trekkenlijst-acties).
 */

const crypto = require('crypto');
const store = require('./store');

const MAX_ENTRIES = 5000;

function readEntries() {
  const raw = store.get('auditLog', {});
  return Array.isArray(raw?.entries) ? raw.entries : [];
}

function writeEntries(entries) {
  store.set('auditLog', { entries: entries.slice(0, MAX_ENTRIES) });
}

function appendEntry({ userId, email, client, action, targetKey, title, detail }) {
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    userId: userId || null,
    email: email || null,
    client: client || null,
    action: String(action || '').trim(),
    targetKey: targetKey || null,
    title: title || null,
    detail: detail != null ? detail : null
  };
  const entries = readEntries();
  entries.unshift(entry);
  writeEntries(entries);
  return entry;
}

function listEntries(opts = {}) {
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 500);
  const email = opts.email ? String(opts.email).trim().toLowerCase() : '';
  const action = opts.action ? String(opts.action).trim() : '';
  let entries = readEntries();
  if (email) {
    entries = entries.filter((e) => String(e.email || '').toLowerCase() === email);
  }
  if (action) {
    entries = entries.filter((e) => {
      const a = String(e.action || '');
      return a === action || a.startsWith(`${action}.`) || a.startsWith(action);
    });
  }
  return { success: true, entries: entries.slice(0, limit) };
}

module.exports = {
  appendEntry,
  listEntries
};
