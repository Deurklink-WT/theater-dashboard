/**
 * Veilige API-foutlogging: alleen bericht en optioneel HTTP-status.
 * Logt nooit response.body, config of apiKey.
 * @param {string} service - Naam van de service (bijv. 'Yesplan', 'Itix')
 * @param {Error} err - Foutobject
 */
function logApiError(service, err) {
  const msg = err && (err.message || String(err));
  const status = err && err.response && err.response.status;
  if (status != null) {
    console.error(`${service}:`, msg, `(status ${status})`);
  } else {
    console.error(`${service}:`, msg);
  }
}

module.exports = { logApiError };
