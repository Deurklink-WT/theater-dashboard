/**
 * Gedeelde logica voor Itix-zaalplattegrond-URL (browser + Jest).
 */

/**
 * Welk id achter de basis-URL komt (Itix uitvoeringsnummer).
 * Yesplan event.id is vaak een lang samengesteld id (bijv. 5298708737-1744626436) — dat is niet het segment
 * in de ticket-URL; dat staat in de ticketing-koppeling (ticketingId).
 */
function pickItixSeatingPlanEventId(event) {
  if (!event || typeof event !== 'object') return '';
  const trim = (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : '');
  if (trim(event.ticketingId)) return trim(event.ticketingId);
  if (event.rawEvent && event.rawEvent.ticketing && trim(event.rawEvent.ticketing.id)) {
    return trim(event.rawEvent.ticketing.id);
  }
  if (trim(event.eventId)) return trim(event.eventId);
  if (trim(event.id)) return trim(event.id);
  return '';
}

function buildItixSeatingPlanUrl(baseURL, eventId) {
  const base = String(baseURL || '').trim().replace(/\/+$/, '');
  if (!base || eventId == null || eventId === '') return '';
  return `${base}/${encodeURIComponent(String(eventId))}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildItixSeatingPlanUrl, pickItixSeatingPlanEventId };
}
if (typeof window !== 'undefined') {
  window.buildItixSeatingPlanUrl = buildItixSeatingPlanUrl;
  window.pickItixSeatingPlanEventId = pickItixSeatingPlanEventId;
}
