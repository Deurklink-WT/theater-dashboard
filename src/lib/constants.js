/**
 * Gedeelde constanten (main process, api-server, cache).
 * Wijzig hier TTL en limieten om gedrag op één plek aan te passen.
 */
module.exports = {
  YESPLAN_CACHE_TTL_MS: 3 * 60 * 1000,  // 3 minuten
  YESPLAN_CACHE_MAX: 100
};
