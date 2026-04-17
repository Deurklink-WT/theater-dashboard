const axios = require('axios');
const { format, parseISO } = require('date-fns');

function safeLog(level, ...args) {
  try {
    if (level === 'error') console.error(...args);
    else if (level === 'warn') console.warn(...args);
    else console.log(...args);
  } catch (_) { /* EPIPE/closed stream: negeer */ }
}

class YesplanAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.apiKey = config.apiKey || '';
    this.organizationId = config.organizationId || '';
    this.verboseLogs = process.argv.includes('--dev') || process.argv.includes('--yesplan-search') || process.env.YESPLAN_DEBUG === '1';
    
    // Yesplan gebruikt api_key als query parameter, niet als header
    // Timeout 30s: formatEvents doet veel calls per event; korte timeout gaf "helemaal niks" bij trage API
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Cache op datum-niveau om dezelfde day-requests te dedupliceren.
    // Dit helpt vooral bij weekweergave (dag-voor-dag ophalen) en bij snelle navigatie.
    this._eventsCache = new Map(); // cacheKey -> { ts, data }
    this._eventsInFlight = new Map(); // inflightKey -> Promise<events[]>
    // Standaard TTL voor day-requests: liever niet te vaak refreshen om 429's te beperken.
    // Richtlijn: ruim cachen; default 6 uur.
    this._eventsCacheTtlMs = Number(process.env.YESPLAN_EVENTS_CACHE_TTL_MS || (6 * 60 * 60 * 1000)); // default 6h
    this._eventsCacheMax = Number(process.env.YESPLAN_EVENTS_CACHE_MAX || 300);

    // Cache op event-customdata niveau om per event-customdata-call bursts te voorkomen.
    this._eventCustomDataCache = new Map(); // eventId -> { ts, data }
    this._eventCustomDataInFlight = new Map(); // eventId -> Promise<customdata>
    this._eventCustomDataCacheTtlMs = Number(process.env.YESPLAN_EVENT_CUSTOMDATA_CACHE_TTL_MS || (6 * 60 * 60 * 1000)); // default 6h
    this._eventCustomDataCacheMax = Number(process.env.YESPLAN_EVENT_CUSTOMDATA_CACHE_MAX || 500);
  }

  debugLog(...args) {
    if (this.verboseLogs) safeLog('log', ...args);
  }

  // Helper om api_key toe te voegen aan query parameters
  addApiKey(params = {}) {
    const queryParams = new URLSearchParams(params);
    if (this.apiKey) {
      queryParams.append('api_key', this.apiKey);
    }
    return queryParams.toString();
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isRetryableDateError(error) {
    const status = error?.response?.status;
    if (status === 429) return true;
    if (status >= 500 && status < 600) return true;
    const code = String(error?.code || '').toUpperCase();
    return code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ECONNRESET';
  }

  async fetchEventsForDate(dateIso, options = {}) {
    const { tagRequestedDate = false, maxRetries = 4, baseDelayMs = 450 } = options;

    const dateStr = this.formatDateForYesplan(dateIso);
    const cacheKey = `date:${dateStr}`; // per YesplanAPI-instantie (dus per org/baseURL/apiKey)
    const cached = this._eventsCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.ts) < this._eventsCacheTtlMs) {
      const events = cached.data || [];
      if (!tagRequestedDate) return events;
      return events.map((e) => ({ ...e, _requestedDate: dateIso }));
    }

    const inFlightKey = `${cacheKey}|mr:${maxRetries}|bd:${baseDelayMs}`;
    const inFlight = this._eventsInFlight.get(inFlightKey);
    if (inFlight) {
      const events = await inFlight;
      if (!tagRequestedDate) return events;
      return events.map((e) => ({ ...e, _requestedDate: dateIso }));
    }

    const queryString = this.addApiKey();
    const url = `/api/events/date:${dateStr}?${queryString}`;

    const fetchPromise = (async () => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await this.client.get(url);
          const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
          return Array.isArray(events) ? events : [];
        } catch (error) {
          if (error?.response?.status === 404) return [];
          const canRetry = this.isRetryableDateError(error) && attempt < maxRetries;
          if (canRetry) {
            const backoff = Math.min(3200, baseDelayMs * (2 ** attempt)) + Math.floor(Math.random() * 120);
            await this.sleep(backoff);
            continue;
          }
          throw error;
        }
      }
      return [];
    })();

    this._eventsInFlight.set(inFlightKey, fetchPromise);
    try {
      const events = await fetchPromise;
      // Zet cache (evict oudste entry als we te groot worden)
      if (this._eventsCache.size >= this._eventsCacheMax) {
        const oldestKey = this._eventsCache.keys().next().value;
        if (oldestKey) this._eventsCache.delete(oldestKey);
      }
      this._eventsCache.set(cacheKey, { ts: Date.now(), data: events });

      if (!tagRequestedDate) return events;
      return events.map((e) => ({ ...e, _requestedDate: dateIso }));
    } finally {
      this._eventsInFlight.delete(inFlightKey);
    }
  }

  async getEvents(params = {}) {
    try {
      const { startDate, endDate, limit = 50, venueId } = params;
      let hadAuthError = false;
      
      // Yesplan gebruikt date-based queries: /api/events/date:dd-mm-yyyy
      // We moeten events per dag ophalen als er een date range is
      let allEvents = [];
      
      if (startDate && endDate && startDate === endDate) {
        try {
          allEvents = await this.fetchEventsForDate(startDate, { tagRequestedDate: false, maxRetries: 2, baseDelayMs: 350 });
        } catch (error) {
          if (error?.response?.status === 401 || error?.response?.status === 403) hadAuthError = true;
          const dateStr = this.formatDateForYesplan(startDate);
          safeLog('error', `Error fetching events for ${dateStr}:`, error.message);
        }
      } else if (startDate && endDate) {
        const toLocalDateStr = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        const start = new Date(startDate + 'T12:00:00');
        const end = new Date(endDate + 'T12:00:00');
        const currentDate = new Date(start);
        const weekOpts = { tagRequestedDate: true, maxRetries: 2, baseDelayMs: 350 };
        while (currentDate <= end) {
          const requestedDate = toLocalDateStr(currentDate);
          try {
            const dayEvents = await this.fetchEventsForDate(requestedDate, weekOpts);
            if (dayEvents.length > 0) allEvents = allEvents.concat(dayEvents);
          } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) hadAuthError = true;
            const dateStr = this.formatDateForYesplan(requestedDate);
            safeLog('error', `Error fetching events for ${dateStr}:`, error.message);
          }
          await this.sleep(100);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        try {
          allEvents = await this.fetchEventsForDate(startDate, { tagRequestedDate: false, maxRetries: 2, baseDelayMs: 350 });
        } catch (error) {
          if (error?.response?.status === 401 || error?.response?.status === 403) hadAuthError = true;
          throw error;
        }
      } else {
        const today = new Date();
        try {
          allEvents = await this.fetchEventsForDate(today.toISOString().split('T')[0], { tagRequestedDate: false, maxRetries: 2, baseDelayMs: 350 });
        } catch (error) {
          if (error?.response?.status === 401 || error?.response?.status === 403) hadAuthError = true;
          throw error;
        }
      }

      if (hadAuthError) {
        return {
          success: false,
          error: 'Yesplan authenticatie mislukt (401/403)',
          data: [],
          timestamp: new Date().toISOString()
        };
      }
      
      // Filter op venueId als opgegeven (match op id of op zaalnaam)
      if (venueId && allEvents.length > 0) {
        const vid = String(venueId).toUpperCase().trim();
        allEvents = allEvents.filter(event => {
          if (event.locations && Array.isArray(event.locations)) {
            return event.locations.some(loc =>
              String(loc.id) === String(venueId) ||
              String(loc.id).toUpperCase().trim() === vid ||
              String(loc.name || '').toUpperCase().trim() === vid
            );
          }
          return false;
        });
      }
      
      // Limiteer resultaten
      if (limit && allEvents.length > limit) {
        allEvents = allEvents.slice(0, limit);
      }
      
      return {
        success: true,
        data: await this.formatEvents(allEvents),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      safeLog('error', 'Yesplan API Error:', error.message);
      if (error.response) {
        safeLog('error', 'Response status:', error.response.status);
        safeLog('error', 'Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Weekweergave: haalt alleen dag-voor-dag op en maakt minimale opmaak ZONDER formatEvents.
   * Geen extra API-calls per event → veel minder 429 en week laadt wel.
   */
  async getEventsForWeek(params = {}) {
    try {
      const { startDate, endDate, limit = 500, venueId, includeEventDetailsForWeekFilters = false } = params;
      let hadAuthError = false;
      if (!startDate || !endDate) {
        return { success: true, data: [], timestamp: new Date().toISOString() };
      }
      const toLocalDateStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const start = new Date(startDate + 'T12:00:00');
      const end = new Date(endDate + 'T12:00:00');
      const currentDate = new Date(start);
      const weekOpts = { tagRequestedDate: true, maxRetries: 2, baseDelayMs: 350 };
      let allEvents = [];
      while (currentDate <= end) {
        const requestedDate = toLocalDateStr(currentDate);
        try {
          const dayEvents = await this.fetchEventsForDate(requestedDate, weekOpts);
          if (dayEvents.length > 0) allEvents = allEvents.concat(dayEvents);
        } catch (error) {
          if (error?.response?.status === 401 || error?.response?.status === 403) hadAuthError = true;
          safeLog('error', `Error fetching events for ${requestedDate}:`, error.message);
        }
        await this.sleep(100);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (hadAuthError) {
        return {
          success: false,
          error: 'Yesplan authenticatie mislukt (401/403)',
          data: [],
          timestamp: new Date().toISOString()
        };
      }
      if (venueId && allEvents.length > 0) {
        const vid = String(venueId).toUpperCase().trim();
        allEvents = allEvents.filter((e) => {
          const locs = e.locations || e.rawEvent?.locations;
          if (!Array.isArray(locs)) return false;
          return locs.some((loc) =>
            String(loc.id) === String(venueId) ||
            String(loc.id || '').toUpperCase().trim() === vid ||
            String(loc.name || '').toUpperCase().trim() === vid
          );
        });
      }
      if (limit && allEvents.length > limit) allEvents = allEvents.slice(0, limit);

      // Maak minimale event-objecten voor weekoverzicht (zonder formatEvents).
      const minimal = allEvents.map((e) => {
        const requestedDate = e._requestedDate || null;
        const locations = e.locations || (e.rawEvent && e.rawEvent.locations) || [];
        const venue = Array.isArray(locations)
          ? locations.map((l) => l.name || '').filter(Boolean).join(', ') || 'Onbekend'
          : 'Onbekend';
        const venueIds = Array.isArray(locations) ? locations.map((l) => String(l.id)).filter(Boolean) : [];
        const startTime = e.defaultschedulestart || e.starttime || e.start_date || null;
        const endTime = e.defaultscheduleend || e.endtime || e.end_date || null;
        return {
          id: e.id,
          title: e.name || 'Geen titel',
          performer: e.group?.name || e.parentgroup?.name || null,
          venue,
          venueIds,
          startDate: startTime,
          endDate: endTime,
          scheduleStartTime: e.defaultschedulestarttime || null,
          scheduleEndTime: e.defaultscheduleendtime || null,
          _requestedDate: requestedDate || (startTime ? String(startTime).slice(0, 10) : ''),
          rawEvent: e.rawEvent || e,
          status: e.status?.name || e.status || 'unknown',
          urenInfo: null,
          resources: this.extractResources(e, null, null, null),
          technicalMaterialResources: [],
          balletvloerExplicit: this.extractResources(e, null, null, null).some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('balletvloer') || lower.includes('ballet');
          }),
          hasBalletvloer: this.extractResources(e, null, null, null).some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('balletvloer') || lower.includes('ballet');
          }),
          vleugelExplicit: this.extractResources(e, null, null, null).some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('vleugel') || lower.includes('piano');
          }),
          hasVleugel: this.extractResources(e, null, null, null).some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('vleugel') || lower.includes('piano');
          }),
          orkestbakExplicit: this.extractResources(e, null, null, null).some((r) => String(r || '').toLowerCase().includes('orkestbak')),
          hasOrkestbak: this.extractResources(e, null, null, null).some((r) => String(r || '').toLowerCase().includes('orkestbak')),
          orkestbakValue: this.extractResources(e, null, null, null).some((r) => String(r || '').toLowerCase().includes('orkestbak')) ? 'ja' : null
        };
      });

      // Voor weekfilters en resource-correctheid in weekoverzicht halen we (gelimiteerd)
      // event-customdata op. Zonder deze verrijking ontbreken balletvloer/vleugel/orkestbak
      // soms in dag-events en lijkt de koppeling "weg".
      if (minimal.length > 0) {
        const maxCustomDataCalls = Number(process.env.YESPLAN_WEEK_CUSTOMDATA_CALLS_MAX || 120);
        let calls = 0;

        for (let i = 0; i < allEvents.length; i++) {
          if (calls >= maxCustomDataCalls) break;
          const raw = allEvents[i];
          const minimalEvent = minimal[i];
          if (!raw?.id || !minimalEvent) continue;

          // Let op: getEventCustomDataRaw doet caching + dedupe (in-flight).
          const eventCustomData = await this.getEventCustomDataRaw(raw.id);

          // Verrijk resourcevelden voor weekkaart (ook als filters uit staan)
          const enrichedResources = this.extractResources(raw, null, null, eventCustomData);
          const hasBalletvloer = enrichedResources.some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('balletvloer') || lower.includes('ballet');
          });
          const hasVleugel = enrichedResources.some((r) => {
            const lower = String(r || '').toLowerCase();
            return lower.includes('vleugel') || lower.includes('piano');
          });
          const hasOrkestbak = enrichedResources.some((r) =>
            String(r || '').toLowerCase().includes('orkestbak')
          );

          minimalEvent.resources = enrichedResources;
          minimalEvent.balletvloerExplicit = hasBalletvloer;
          minimalEvent.hasBalletvloer = hasBalletvloer;
          minimalEvent.vleugelExplicit = hasVleugel;
          minimalEvent.hasVleugel = hasVleugel;
          minimalEvent.orkestbakExplicit = hasOrkestbak;
          minimalEvent.hasOrkestbak = hasOrkestbak;
          minimalEvent.orkestbakValue = hasOrkestbak ? 'ja' : null;

          if (includeEventDetailsForWeekFilters) {
            const urenInfo = this.extractUrenInfo(eventCustomData);
            const technicalMaterialResources = this.extractTechnicalMaterialResources(raw, eventCustomData);
            minimalEvent.urenInfo = urenInfo;
            minimalEvent.technicalMaterialResources = technicalMaterialResources;
          }

          calls += 1;
          // Kleine spacing om bursts op 429 te beperken.
          if (calls % 10 === 0) await this.sleep(200);
        }
      }

      return {
        success: true,
        data: minimal,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      safeLog('error', 'Yesplan getEventsForWeek:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /** Geeft alleen ruwe events terug (geen formatEvents) — o.a. voor personeel-ophaling per datum. */
  async getRawEvents(params = {}) {
    try {
      const { startDate, endDate, limit = 100, venueId } = params;
      let allEvents = [];
      if (startDate && endDate && startDate === endDate) {
        const dateStr = this.formatDateForYesplan(startDate);
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;
        const response = await this.client.get(url);
        const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(events)) allEvents = events;
      } else if (startDate && endDate) {
        const toLocalDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const start = new Date(startDate + 'T12:00:00');
        const end = new Date(endDate + 'T12:00:00');
        const currentDate = new Date(start);
        const queryString = this.addApiKey();
        while (currentDate <= end) {
          const dateStr = this.formatDateForYesplan(toLocalDateStr(currentDate));
          const url = `/api/events/date:${dateStr}?${queryString}`;
          try {
            const response = await this.client.get(url);
            const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            if (Array.isArray(events) && events.length > 0) allEvents = allEvents.concat(events);
          } catch (e) { if (e.response?.status !== 404) safeLog('error', e.message); }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        const dateStr = this.formatDateForYesplan(startDate);
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;
        const response = await this.client.get(url);
        const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(events)) allEvents = events;
      }
      if (venueId && allEvents.length > 0) {
        const vid = String(venueId).toUpperCase().trim();
        allEvents = allEvents.filter(e => e.locations?.some(loc =>
          String(loc.id) === String(venueId) || String(loc.id).toUpperCase().trim() === vid || String(loc.name || '').toUpperCase().trim() === vid
        ));
      }
      if (limit && allEvents.length > limit) allEvents = allEvents.slice(0, limit);
      return { success: true, data: allEvents };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * Zoek evenementen in de hele Yesplan-omgeving op naam (Yesplan query: event:name:term).
   */
  async getEventsBySearch(searchTerm) {
    if (!searchTerm || String(searchTerm).trim().length < 2) {
      return { success: true, data: [], timestamp: new Date().toISOString() };
    }
    try {
      const term = String(searchTerm).trim();
      const cacheKey = term.toLowerCase();
      if (!this._searchCache) this._searchCache = new Map();
      if (!this._searchUniverse) this._searchUniverse = { ts: 0, data: [] };
      const cached = this._searchCache.get(cacheKey);
      if (cached && (Date.now() - cached.ts) < 120000) {
        return { success: true, data: cached.data, timestamp: new Date().toISOString() };
      }

      // Helper: bouw een URL-veilige Yesplan-query – alleen het zoekwoord URL-coderen
      const buildQueryUrl = (scope, keyword, word) =>
        `${scope}:${keyword}:${encodeURIComponent(word)}`;

      // Als de gebruiker al een Yesplan-zoekopdracht intypt, gebruik die direct.
      // Ondersteunt zowel scope:keyword:word als keyword:word (standaardscope).
      const isDirectQuery = /^([a-zA-Z_]+:){1,2}.+/.test(term);
      const yesplanWord = (w) => (String(w).includes(' ') ? `"${String(w)}"` : String(w));

      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const formatRawEvent = (event, requestedDate = null) => {
        const locations = event.locations && Array.isArray(event.locations)
          ? event.locations.map(loc => loc.name).filter(Boolean).join(', ')
          : 'Onbekend';
        const venueIds = event.locations && Array.isArray(event.locations)
          ? event.locations.map(loc => String(loc.id)).filter(Boolean)
          : [];
        const startTime = event.defaultschedulestart || event.starttime || event.start_date || null;
        const endTime = event.defaultscheduleend || event.endtime || event.end_date || null;
        return {
          id: event.id,
          title: event.name || 'Geen titel',
          performer: event.group?.name || event.parentgroup?.name || null,
          startDate: startTime,
          endDate: endTime,
          venue: locations,
          venueIds,
          status: event.status?.name || event.status || 'unknown',
          scheduleStartTime: event.defaultschedulestarttime || null,
          scheduleEndTime: event.defaultscheduleendtime || null,
          _requestedDate: requestedDate || (startTime ? String(startTime).slice(0, 10) : '')
        };
      };
      let queries;
      if (isDirectQuery) {
        // Directe query: encodeer alleen het word-deel (na de tweede dubbele punt)
        const match = term.match(/^([a-zA-Z]+:[a-zA-Z_]+:)(.*)$/);
        queries = match
          ? [`${match[1]}${encodeURIComponent(match[2])}`]
          : [encodeURIComponent(term)];
      } else {
        // Zoek in hele Yesplan met 1 compacte OR-query (sneller en minder 429).
        const normalizedTerm = term.replace(/\s+/g, ' ').trim();
        const exact = yesplanWord(normalizedTerm);
        const firstToken = normalizedTerm
          .split(' ')
          .map(t => t.trim())
          .find(t => t.length >= 2);
        const combined = `event:name:${exact} + event_or_group:name:${exact} + production:name:${exact} + event:*:${exact}`;
        queries = [encodeURIComponent(combined)];
        // Kleine fallback query op eerste token.
        if (firstToken && firstToken.toLowerCase() !== normalizedTerm.toLowerCase()) {
          queries.push(encodeURIComponent(`event:name:${firstToken} + event_or_group:name:${firstToken}`));
        }
      }
      queries = Array.from(new Set(queries));
      this.debugLog('[SearchAPI] term:', term, '| queries:', queries.length);

      // Voer alle zoekopdrachten parallel uit en dedupliceer op event-id
      const queryString = this.addApiKey({ limit: 80 });
      let rateLimitHits = 0;
      const fetchQuery = async (query) => {
        const rawQuery = (() => {
          try { return decodeURIComponent(query); } catch (_) { return query; }
        })();
        const urls = [
          `/api/events/query:${query}?${queryString}`,
          `/api/events?query=${encodeURIComponent(rawQuery)}&${queryString}`
        ];
        let saw429 = false;
        for (const url of urls) {
          try {
            const response = await this.client.get(url);
            const raw = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            const arr = Array.isArray(raw) ? raw : [];
            // Zodra een endpoint-vorm geldig antwoordt, stoppen we met alternatieve URL-vormen.
            return arr;
          } catch (err) {
            if (err.response?.status === 429) {
              saw429 = true;
              continue;
            }
            // Een ongeldige/deels niet-ondersteunde queryvorm mag de hele zoekactie niet breken.
            if (err.response?.status === 400 || err.response?.status === 404 || err.response?.status === 422) continue;
            throw err;
          }
        }
        if (saw429) {
          rateLimitHits += 1;
          await sleep(600);
          for (const url of urls) {
            try {
              const retryRes = await this.client.get(url);
              const retryRaw = retryRes.data?.data || (Array.isArray(retryRes.data) ? retryRes.data : []);
              const retryArr = Array.isArray(retryRaw) ? retryRaw : [];
              return retryArr;
            } catch (retryErr) {
              if (retryErr.response?.status === 400 || retryErr.response?.status === 404 || retryErr.response?.status === 422 || retryErr.response?.status === 429) continue;
              throw retryErr;
            }
          }
        }
        return [];
      };

      const seenIds = new Set();
      const allEvents = [];
      // Sequentieel uitvoeren om bursts en 429's te beperken.
      for (const q of queries) {
        const arr = await fetchQuery(q);
        this.debugLog('[SearchAPI] query result size:', q, Array.isArray(arr) ? arr.length : 0);
        for (const e of arr) {
          const uid = String(e.id);
          if (!seenIds.has(uid)) {
            seenIds.add(uid);
            allEvents.push(e);
          }
          if (allEvents.length >= 200) break;
        }
        if (allEvents.length >= 200) break;
      }

      // Rangschik: volledige termmatch eerst, daarna datum
      const lowerTerm = term.toLowerCase();
      const score = (e) => {
        const name = String(e.name || '').toLowerCase();
        const group = String(e.group?.name || e.parentgroup?.name || '').toLowerCase();
        let s = 0;
        if (name === lowerTerm) s += 100;
        if (name.includes(lowerTerm)) s += 60;
        if (group.includes(lowerTerm)) s += 30;
        return s;
      };
      allEvents.sort((a, b) => {
        const diff = score(b) - score(a);
        if (diff !== 0) return diff;
        const tA = a.defaultschedulestart || a.starttime || a.start_date;
        const tB = b.defaultschedulestart || b.starttime || b.start_date;
        return (tA || '').localeCompare(tB || '');
      });

      let formatted = allEvents.map((event) => formatRawEvent(event));
      if (formatted.length === 0 && !isDirectQuery) {
        const normalizedTerm = term.toLowerCase();
        const tokens = normalizedTerm.split(/\s+/).filter(t => t.length >= 2);
        // Bouw/gebruik lokale zoekindex voor fallback (scheelt herhaalde dag-scans per zoekterm).
        const indexFresh = this._searchIndexCache && (Date.now() - this._searchIndexCache.ts) < (15 * 60 * 1000);
        let universe = indexFresh ? (this._searchIndexCache.data || []) : null;
        if (!universe) {
          const dateQueryString = this.addApiKey();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const seen = new Set();
          universe = [];
          let consecutive429 = 0;

          for (let i = 0; i < 60; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateISO = `${y}-${m}-${day}`;
            const yesplanDate = this.formatDateForYesplan(dateISO);
            try {
              const response = await this.client.get(`/api/events/date:${yesplanDate}?${dateQueryString}`);
              consecutive429 = 0;
              const raw = response.data?.data || (Array.isArray(response.data) ? response.data : []);
              const arr = Array.isArray(raw) ? raw : [];
              for (const event of arr) {
                const uid = String(event.id || '');
                if (!uid || seen.has(uid)) continue;
                seen.add(uid);
                universe.push(formatRawEvent(event, dateISO));
              }
            } catch (err) {
              if (err.response?.status === 404) continue;
              if (err.response?.status === 429) {
                consecutive429 += 1;
                await sleep(Math.min(2000, 350 * consecutive429));
                if (consecutive429 >= 6) break;
                continue;
              }
              throw err;
            }
            await sleep(50);
          }
          this._searchIndexCache = { ts: Date.now(), data: universe };
        }

        if (Array.isArray(universe) && universe.length > 0) {
          formatted = universe.filter((event) => {
            const haystack = `${String(event.title || '').toLowerCase()} ${String(event.performer || '').toLowerCase()} ${String(event.venue || '').toLowerCase()}`;
            return haystack.includes(normalizedTerm) || tokens.every(t => haystack.includes(t));
          }).slice(0, 80);
          if (formatted.length > 0) this.debugLog('[SearchAPI] fallback index results:', formatted.length);
        }
      }

      if (formatted.length === 0) {
        const pool = Array.isArray(this._searchUniverse.data) ? this._searchUniverse.data : [];
        const poolFresh = (Date.now() - Number(this._searchUniverse.ts || 0)) < (10 * 60 * 1000);
        if (poolFresh && pool.length > 0) {
          const normalizedTerm = term.toLowerCase();
          const tokens = normalizedTerm.split(/\s+/).filter(t => t.length >= 2);
          const fromPool = pool.filter((e) => {
            const hay = `${String(e.title || '').toLowerCase()} ${String(e.performer || '').toLowerCase()} ${String(e.venue || '').toLowerCase()}`.trim();
            return hay.includes(normalizedTerm) || tokens.every(t => hay.includes(t));
          }).slice(0, 80);
          if (fromPool.length > 0) {
            formatted = fromPool;
            this.debugLog('[SearchAPI] result from local universe cache:', fromPool.length);
          }
        }
      }

      if (formatted.length === 0 && rateLimitHits > 0) {
        // Vermijd foutmelding in UI bij tijdelijke rate limit; geef lege lijst terug.
        this.debugLog('[SearchAPI] rate-limited, no results');
        return {
          success: true,
          data: [],
          rateLimited: true,
          timestamp: new Date().toISOString()
        };
      }

      if (formatted.length > 0) {
        const mergedPool = Array.from(new Map(
          [...formatted, ...(Array.isArray(this._searchUniverse.data) ? this._searchUniverse.data : [])]
            .map(e => [String(e.id), e])
        ).values()).slice(0, 400);
        this._searchUniverse = { ts: Date.now(), data: mergedPool };
      }

      this._searchCache.set(cacheKey, { ts: Date.now(), data: formatted });
      return {
        success: true,
        data: formatted,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: [], timestamp: new Date().toISOString() };
      }
      safeLog('error', 'Yesplan search error:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  extractResources(event, groupData = null, customData = null, eventCustomData = null) {
    // Resources kunnen op verschillende manieren in het event object zitten
    const resources = [];
    
    // Haal effectieve waarde uit object (Yesplan dropdowns kunnen { name: "Ja" } retourneren)
    const toEffectiveValue = (v) => {
      if (v == null) return null;
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
      if (typeof v === 'object') return v.value ?? v.name ?? v.label ?? v.text ?? null;
      return null;
    };
    // Helper functie om een waarde te checken op "Ja"/"Yes"/true/1
    const isTrueValue = (value) => {
      const v = toEffectiveValue(value);
      if (v === true || v === 1 || v === '1') return true;
      if (typeof v === 'string') {
        const lower = v.toLowerCase().trim();
        return lower === 'ja' || lower === 'yes' || lower === 'true';
      }
      return false;
    };
    // Orkestbak kan beschrijvende waarden hebben (grote bak, kleine bak) – alles behalve nee = ja
    const isOrkestbakValue = (value) => {
      const v = toEffectiveValue(value);
      if (v == null || v === '') return false;
      if (v === true || v === 1) return true;
      if (typeof v === 'string') {
        const lower = v.toLowerCase().trim();
        if (lower === 'nee' || lower === 'no') return false;
        return lower.length > 0;
      }
      return false;
    };

    // Alleen technische resources (balletvloer, vleugel, orkestbak) tellen mee voor weergave/filter
    const isTechnicalResourceName = (name) => {
      if (!name || typeof name !== 'string') return false;
      const n = name.toLowerCase().trim();
      return (n.includes('balletvloer') || n.includes('ballet')) ||
        (n.includes('vleugel') || n.includes('piano')) ||
        n.includes('orkestbak');
    };

    const pushIfTechnicalResource = (resourceName) => {
      if (!resourceName) return;
      const name = typeof resourceName === 'string' ? resourceName : (resourceName.name || resourceName.resource_name || '');
      if (!isTechnicalResourceName(name)) return;
      const canonical = (n) => {
        const lower = n.toLowerCase();
        if (lower.includes('orkestbak')) return 'Orkestbak';
        if (lower.includes('vleugel') || lower.includes('piano')) return 'Vleugel';
        if (lower.includes('balletvloer') || lower.includes('ballet')) return 'Balletvloer';
        return null;
      };
      const c = canonical(name);
      if (c && !resources.includes(c)) resources.push(c);
    };

    // Helper functie om recursief door customdata structuur te zoeken
    const searchCustomData = (obj) => {
      const found = [];
      
      if (!obj || typeof obj !== 'object') return found;
      
      // Check of dit een Resource Field is
      if (obj.keyword === 'group_group_resourcefield' || 
          (obj.type === 'Resource' && obj.value && Array.isArray(obj.value))) {
        if (Array.isArray(obj.value)) {
          obj.value.forEach(booking => {
            if (booking && booking.resource) {
              const resourceName = booking.resource.name || '';
              found.push(resourceName);
            }
          });
        }
      }
      
      // Recursief door children en groups
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(child => {
          found.push(...searchCustomData(child));
        });
      }
      
      if (obj.groups && Array.isArray(obj.groups)) {
        obj.groups.forEach(group => {
          found.push(...searchCustomData(group));
        });
      }
      
      // Check alle andere properties
      for (const key in obj) {
        if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
          found.push(...searchCustomData(obj[key]));
        }
      }
      
      return found;
    };
    
    // Check event customdata voor technische lijst velden (productie_technischelijst_balletvloer, etc.)
    // Deze velden zijn Dropdown types met waarden "Ja" of "Nee"
    if (eventCustomData) {
      const toEff = (x) => (x != null && typeof x === 'object') ? (x.value ?? x.name ?? x.label ?? x.text ?? null) : x;
      const isTrueVal = (v) => {
        const x = toEff(v);
        if (x === true || x === 1 || x === '1') return true;
        if (typeof x === 'string') {
          const l = x.toLowerCase().trim();
          return l === 'ja' || l === 'yes' || l === 'true' || l === 'jaa';
        }
        return false;
      };
      const searchEventCustomData = (obj) => {
        const found = [];
        
        if (!obj || typeof obj !== 'object') return found;
        
        // Check keyword en name (Yesplan kan beide gebruiken)
        const kw = (obj.keyword || obj.name || '').toLowerCase();
        const isTechListField = kw.includes('technischelijst') && 
          (kw.includes('balletvloer') || kw.includes('vleugel') || kw.includes('orkestbak') || kw.includes('orkest'));
        if (isTechListField) {
          const value = obj.value;
          const okForBallet = kw.includes('balletvloer') && isTrueVal(value);
          const okForVleugel = kw.includes('vleugel') && isTrueVal(value);
          const okForOrkest = (kw.includes('orkestbak') || kw.includes('orkest')) && isOrkestbakValue(value);
          if (okForBallet) found.push('Balletvloer');
          if (okForVleugel) found.push('Vleugel');
          if (okForOrkest) found.push('Orkestbak');
        }
        
        // Recursief door children en groups
        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => {
            found.push(...searchEventCustomData(child));
          });
        }
        
        if (obj.groups && Array.isArray(obj.groups)) {
          obj.groups.forEach(group => {
            found.push(...searchEventCustomData(group));
          });
        }
        
        // Check alle andere properties
        for (const key in obj) {
          if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
            found.push(...searchEventCustomData(obj[key]));
          }
        }
        
        return found;
      };
      
      const foundResources = searchEventCustomData(eventCustomData);
      foundResources.forEach(resource => {
        if (resource && !resources.includes(resource)) {
          resources.push(resource);
        }
      });
    }
    
    // Check customdata voor Resource Fields (fallback)
    if (customData) {
      const foundResources = searchCustomData(customData);
      foundResources.forEach(resourceName => {
        if (resourceName) {
          const resourceNameLower = resourceName.toLowerCase();
          
          // Check voor balletvloer
          if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
              !resources.includes('Balletvloer')) {
            resources.push('Balletvloer');
          }
          // Check voor vleugel/piano
          if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
              !resources.includes('Vleugel')) {
            resources.push('Vleugel');
          }
          // Check voor orkestbak
          if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
            resources.push('Orkestbak');
          }
        }
      });
    }
    
    // Check group properties voor Resource Fields (fallback)
    if (groupData && groupData.properties && Array.isArray(groupData.properties)) {
      groupData.properties.forEach(prop => {
        // Check voor Resource Field type
        if (prop.keyword === 'group_group_resourcefield' || 
            (prop.type === 'Resource' && prop.value && Array.isArray(prop.value))) {
          // prop.value is een array van resourcebookings
          if (Array.isArray(prop.value)) {
            prop.value.forEach(booking => {
              if (booking && booking.resource) {
                const resourceName = booking.resource.name || '';
                const resourceNameLower = resourceName.toLowerCase();
                
                // Check voor balletvloer
                if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
                    !resources.includes('Balletvloer')) {
                  resources.push('Balletvloer');
                }
                // Check voor vleugel/piano
                if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
                    !resources.includes('Vleugel')) {
                  resources.push('Vleugel');
                }
                // Check voor orkestbak
                if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
                  resources.push('Orkestbak');
                }
              }
            });
          }
        }
      });
    }
    
    // Check ook event.group.properties als die direct beschikbaar is
    if (event.group && event.group.properties && Array.isArray(event.group.properties)) {
      event.group.properties.forEach(prop => {
        if (prop.keyword === 'group_group_resourcefield' || 
            (prop.type === 'Resource' && prop.value && Array.isArray(prop.value))) {
          if (Array.isArray(prop.value)) {
            prop.value.forEach(booking => {
              if (booking && booking.resource) {
                const resourceName = booking.resource.name || '';
                const resourceNameLower = resourceName.toLowerCase();
                
                if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
                    !resources.includes('Balletvloer')) {
                  resources.push('Balletvloer');
                }
                if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
                    !resources.includes('Vleugel')) {
                  resources.push('Vleugel');
                }
                if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
                  resources.push('Orkestbak');
                }
              }
            });
          }
        }
      });
    }
    
    // Helper functie om recursief door een object te zoeken
    const searchInObject = (obj, searchKey, maxDepth = 5, currentDepth = 0) => {
      if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') return null;
      
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        
        const keyLower = key.toLowerCase();
        const value = obj[key];
        
        // Check of de key overeenkomt met wat we zoeken
        if (keyLower.includes(searchKey.toLowerCase())) {
          const useOrkestCheck = (searchKey.toLowerCase().includes('orkest'));
          if (useOrkestCheck ? isOrkestbakValue(value) : isTrueValue(value)) {
            return value;
          }
        }
        
        // Recursief zoeken in nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const found = searchInObject(value, searchKey, maxDepth, currentDepth + 1);
          if (found !== null) return found;
        }
        
        // Check arrays
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object') {
              const found = searchInObject(item, searchKey, maxDepth, currentDepth + 1);
              if (found !== null) return found;
            }
          }
        }
      }
      
      return null;
    };
    
    // Check event.resources (array) – alleen technische resources (balletvloer, vleugel, orkestbak)
    if (event.resources && Array.isArray(event.resources)) {
      event.resources.forEach(resource => {
        if (resource && resource.name) {
          pushIfTechnicalResource(resource.name);
        } else if (typeof resource === 'string') {
          pushIfTechnicalResource(resource);
        }
      });
    }

    // Check event.resourcebookings (array)
    if (event.resourcebookings && Array.isArray(event.resourcebookings)) {
      event.resourcebookings.forEach(booking => {
        if (booking && booking.resource && booking.resource.name) {
          pushIfTechnicalResource(booking.resource.name);
        } else if (booking.resource_name) {
          pushIfTechnicalResource(booking.resource_name);
        }
      });
    }

    // Check event.resource_assignments (array)
    if (event.resource_assignments && Array.isArray(event.resource_assignments)) {
      event.resource_assignments.forEach(assignment => {
        if (assignment.resource && assignment.resource.name) {
          pushIfTechnicalResource(assignment.resource.name);
        } else if (assignment.resource_name) {
          pushIfTechnicalResource(assignment.resource_name);
        }
      });
    }

    // Check event.resourcebookings (object met arrays)
    if (event.resourcebookings && typeof event.resourcebookings === 'object' && !Array.isArray(event.resourcebookings)) {
      Object.values(event.resourcebookings).forEach(booking => {
        if (booking && booking.resource && booking.resource.name) {
          pushIfTechnicalResource(booking.resource.name);
        }
      });
    }

    // Check event.resources (object)
    if (event.resources && typeof event.resources === 'object' && !Array.isArray(event.resources)) {
      Object.values(event.resources).forEach(resource => {
        if (resource && resource.name) {
          pushIfTechnicalResource(resource.name);
        }
      });
    }
    
    // Check TECHNISCHE LIJST / Production data - uitgebreide check
    if (event.production) {
      // Check production.technical_list (kan object of array zijn)
      if (event.production.technical_list) {
        const techList = event.production.technical_list;
        
        // Als het een object is, check alle properties
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          // Check directe properties
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
              if (isTrueValue(value)) {
                resources.push('Balletvloer');
              }
            }
            if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
              if (isTrueValue(value)) {
                resources.push('Vleugel');
              }
            }
            if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
              if (isOrkestbakValue(value)) {
                resources.push('Orkestbak');
              }
            }
          }
        }
        
        // Als het een array is, check elk item
        if (Array.isArray(techList)) {
          techList.forEach(item => {
            if (item && typeof item === 'object') {
              for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                const keyLower = key.toLowerCase();
                const value = item[key];
                
                if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
                  if (isTrueValue(value)) {
                    resources.push('Balletvloer');
                  }
                }
                if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
                  if (isTrueValue(value)) {
                    resources.push('Vleugel');
                  }
                }
                if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
                  if (isOrkestbakValue(value)) {
                    resources.push('Orkestbak');
                  }
                }
              }
            }
          });
        }
      }
      
      // Check production.properties (array)
      if (event.production.properties && Array.isArray(event.production.properties)) {
        event.production.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if (propName.includes('balletvloer') || propName.includes('ballet')) {
              if (isTrueValue(propValue)) {
                resources.push('Balletvloer');
              }
            }
            if (propName.includes('vleugel') || propName.includes('piano')) {
              if (isTrueValue(propValue)) {
                resources.push('Vleugel');
              }
            }
            if (propName.includes('orkestbak') || propName.includes('orkest')) {
              if (isOrkestbakValue(propValue)) {
                resources.push('Orkestbak');
              }
            }
          }
        });
      }
      
      // Recursief zoeken in production object
      if (searchInObject(event.production, 'balletvloer') !== null) {
        resources.push('Balletvloer');
      }
      if (searchInObject(event.production, 'vleugel') !== null || searchInObject(event.production, 'piano') !== null) {
        resources.push('Vleugel');
      }
      if (searchInObject(event.production, 'orkestbak') !== null || searchInObject(event.production, 'orkest') !== null) {
        resources.push('Orkestbak');
      }
    }
    
    // Check properties array voor technische lijst
    if (event.properties && Array.isArray(event.properties)) {
      event.properties.forEach(prop => {
        if (prop.name) {
          const propName = prop.name.toLowerCase();
          const propValue = prop.value;
          
          if (propName.includes('balletvloer') || propName.includes('ballet')) {
            if (isTrueValue(propValue)) {
              resources.push('Balletvloer');
            }
          }
          if (propName.includes('vleugel') || propName.includes('piano')) {
            if (isTrueValue(propValue)) {
              resources.push('Vleugel');
            }
          }
          if (propName.includes('orkestbak') || propName.includes('orkest')) {
            if (isOrkestbakValue(propValue)) {
              resources.push('Orkestbak');
            }
          }
        }
      });
    }
    
    // Check event.technical_list direct
    if (event.technical_list) {
      const techList = event.technical_list;
      if (typeof techList === 'object' && !Array.isArray(techList)) {
        for (const key in techList) {
          if (!techList.hasOwnProperty(key)) continue;
          const keyLower = key.toLowerCase();
          const value = techList[key];
          
          if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
            if (isTrueValue(value)) {
              resources.push('Balletvloer');
            }
          }
          if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
            if (isTrueValue(value)) {
              resources.push('Vleugel');
            }
          }
          if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
            if (isOrkestbakValue(value)) {
              resources.push('Orkestbak');
            }
          }
        }
      }
    }
    
    // Recursief zoeken in het hele event object als laatste redmiddel
    if (!resources.some(r => r.toLowerCase().includes('balletvloer') || r.toLowerCase().includes('ballet'))) {
      if (searchInObject(event, 'balletvloer') !== null) {
        resources.push('Balletvloer');
      }
    }
    if (!resources.some(r => r.toLowerCase().includes('vleugel') || r.toLowerCase().includes('piano'))) {
      if (searchInObject(event, 'vleugel') !== null || searchInObject(event, 'piano') !== null) {
        resources.push('Vleugel');
      }
    }
    if (!resources.some(r => r.toLowerCase().includes('orkestbak'))) {
      if (searchInObject(event, 'orkestbak') !== null || searchInObject(event, 'orkest') !== null) {
        resources.push('Orkestbak');
      }
    }
    
    // Verwijder duplicaten en return
    return [...new Set(resources)];
  }

  extractTechnicalMaterialResources(event, eventCustomData = null) {
    const materials = new Set();
    const venueTokens = new Set();
    const addVenueToken = (v) => {
      const s = String(v || '').trim().toLowerCase();
      if (!s) return;
      venueTokens.add(s);
      // Voeg ook losse woorden toe (bv. "DKW, Grote zaal" -> "dkw")
      s.split(/[,\s/|-]+/).filter(Boolean).forEach(t => venueTokens.add(t));
    };
    if (Array.isArray(event?.locations)) {
      event.locations.forEach((loc) => {
        addVenueToken(loc?.name);
        addVenueToken(loc?.id);
      });
    }
    addVenueToken(event?.venue);

    const normalizeName = (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (!str) return null;
      // Geen documenten/urls als materiaal tonen
      if (/^https?:\/\//i.test(str) || str.includes('/documents/') || str.endsWith('.pdf')) return null;
      if (!str.includes('/')) return str;
      const parts = str.split('/').map(p => p.trim()).filter(Boolean);
      // Strip zaalprefix (bv. "DKW/Truss" -> "Truss")
      if (parts.length >= 2) {
        const first = parts[0].toLowerCase();
        const firstCompact = first.replace(/[^a-z0-9]/g, '');
        if (venueTokens.has(first) || venueTokens.has(firstCompact)) {
          return parts.slice(1).join('/').trim() || null;
        }
      }
      if (parts.length === 2) return str;
      const after = str.replace(/^.*technisch\s+materiaal\/?/i, '').trim();
      return after || parts[parts.length - 1] || null;
    };

    const matchesTechnicalMaterial = (value) => {
      if (!value) return false;
      const str = String(value).toLowerCase();
      return str.includes('technisch materiaal') ||
        str.includes('technical material') ||
        str.includes('resources/technisch materiaal') ||
        str.includes('recources/technisch materiaal');
    };

    const isNoiseCandidate = (value) => {
      const s = String(value || '').trim();
      if (!s) return true;
      const lower = s.toLowerCase();
      if (s.length > 64) return true;
      if (s.includes('\n')) return true;
      if (/^https?:\/\//i.test(s) || s.includes('/documents/') || s.endsWith('.pdf')) return true;
      if (/\b\d{1,2}:\d{2}\b/.test(s)) return true;
      if (/[?:]/.test(s)) return true;
      if (/\b(jan|feb|maa|apr|mei|jun|jul|aug|sep|okt|nov|dec)\b/i.test(s)) return true;
      if (['ja', 'nee', 'yes', 'no', 'true', 'false', 'niet ingevuld', 'n.v.t.', 'nvt'].includes(lower)) return true;
      const blockedExact = [
        'techniek', 'technical', 'opmerkingen techniek', 'opmerkingen', 'remarks', 'notes',
        'rider', 'bijlage', 'draaiboek', 'datum stemmen', 'tijdstip stemmen exact om',
        'of uiterlijk gestemd voor', 'contactpersoon techniek', 'location', 'locaties',
        'zaalopstelling', 'notities zaalopstelling', 'technische info', 'uren uurwerk techniek'
      ];
      if (blockedExact.includes(lower)) return true;
      if (lower.startsWith('extra bijlage')) return true;
      // Niet-technische (financiele/ticketing/horeca-logistiek) resources nooit als technisch materiaal tonen.
      // Yesplan zet soms horeca/logistiek onder dezelfde "Technisch materiaal"-structuur; die filteren we hier weg.
      const blockedContains = [
        'ticketing', 'ticket', 'tickets', 'consumptiebon', 'consumptiebonnen',
        'servicekosten', 'handelingkosten', 'handlingskosten', 'nacalculatie',
        'facilitair', 'financieel', 'facturatie', 'btw', 'garderobe', 'pauzedrankje',
        'internetsite', 'website', 'web site', 'webpagina', 'vermelding internetsite',
        'drankbuffet', 'drank buffet', 'buffet plaats', 'horeca', 'catering', 'gastronomie',
        'koffiebar', 'theebar',
        // Personeelsresources zijn geen "technisch materiaal"
        'ondersteunend personeel', 'technisch personeel', 'personeel',
        'beveiliging', 'techniekmedewerker', 'technicus', 'stagemanager'
      ];
      if (blockedContains.some(term => lower.includes(term))) return true;
      // Zaalcodes of locatienamen (zoals DKW/WTPY) zijn geen technisch materiaal.
      if (venueTokens.has(lower)) return true;
      if (lower.length <= 6 && venueTokens.has(lower.replace(/[^a-z0-9]/g, ''))) return true;
      return false;
    };

    const addMaterial = (value) => {
      const name = normalizeName(value);
      if (name) {
        const lower = name.toLowerCase().trim();
        // Houd de "extra materialen"-lijst schoon; vaste 3 resources hebben eigen weergave.
        const isBaseResource = lower.includes('balletvloer') || lower.includes('ballet') || lower.includes('vleugel') || lower.includes('piano') || lower.includes('orkestbak');
        const isNoise = isNoiseCandidate(name);
        if (!isBaseResource && !isNoise) materials.add(name);
      }
    };

    const getResourceName = (resource) => {
      if (!resource || typeof resource !== 'object') return null;
      // Gebruik waar mogelijk expliciete titel uit Yesplan.
      return resource.title ||
        resource.name ||
        resource.resource_name ||
        resource.resource?.title ||
        resource.resource?.name ||
        resource.item?.title ||
        resource.item?.name ||
        null;
    };

    const hasDeepMatch = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 4) return false;
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const value = obj[key];
        if (matchesTechnicalMaterial(key) || matchesTechnicalMaterial(value)) {
          return true;
        }
        if (typeof value === 'object') {
          if (hasDeepMatch(value, depth + 1)) {
            return true;
          }
        }
      }
      return false;
    };

    const inspectResource = (resource, forceAdd = false) => {
      if (!resource) return;
      if (Array.isArray(resource)) {
        resource.forEach(item => inspectResource(item, forceAdd));
        return;
      }

      if (typeof resource === 'string') {
        if (forceAdd || matchesTechnicalMaterial(resource)) {
          addMaterial(resource);
        }
        return;
      }

      const fieldsToCheck = [
        resource.title,
        resource.name,
        resource.path,
        resource.full_path,
        resource.folder,
        resource.category?.name,
        resource.category?.path,
        resource.category?.parent?.name,
        resource.parent?.name,
        resource.group?.name,
        resource.group?.parent?.name,
        resource.resource_name
      ];

      const hasMatch = fieldsToCheck.some(matchesTechnicalMaterial) || hasDeepMatch(resource);
      if (forceAdd || hasMatch) {
        addMaterial(
          resource.title ||
          resource.name ||
          resource.resource_name ||
          resource.resource?.title ||
          resource.resource?.name ||
          resource.path ||
          resource.full_path ||
          getResourceName(resource)
        );
      }
    };

    const isLikelyMaterialKey = (k) => {
      const key = String(k || '').toLowerCase();
      return key.includes('resource') || key.includes('materiaal') || key.includes('material');
    };

    const isPersonnelLikeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      const values = [
        obj.type,
        obj.resourcespecies,
        obj.category?.name,
        obj.group?.name,
        obj.group?.parent?.name,
        obj.parent?.name,
        obj.name,
        obj.title,
        obj.resource_name
      ].filter(Boolean).map(v => String(v).toLowerCase());
      return values.some(v =>
        v.includes('personeel') ||
        v.includes('human') ||
        v.includes('beveiliging') ||
        v.includes('techniekmedewerker')
      );
    };

    // event.resources (array)
    if (event.resources && Array.isArray(event.resources)) {
      event.resources.forEach(resource => inspectResource(resource));
    }

    // event.resources (object)
    if (event.resources && typeof event.resources === 'object' && !Array.isArray(event.resources)) {
      Object.values(event.resources).forEach(resource => inspectResource(resource));
    }

    // event.resourcebookings (array)
    if (event.resourcebookings && Array.isArray(event.resourcebookings)) {
      event.resourcebookings.forEach(booking => {
        inspectResource(booking.resource || booking.resource_name || booking);
      });
    }

    // event.resourcebookings (object met arrays)
    if (event.resourcebookings && typeof event.resourcebookings === 'object' && !Array.isArray(event.resourcebookings)) {
      Object.values(event.resourcebookings).forEach(booking => {
        inspectResource(booking.resource || booking.resource_name || booking);
      });
    }

    // event.resource_assignments (array)
    if (event.resource_assignments && Array.isArray(event.resource_assignments)) {
      event.resource_assignments.forEach(assignment => {
        inspectResource(assignment.resource || assignment.resource_name || assignment);
      });
    }

    // Fallback: als resources op een andere plek in event zitten, pak ze toch mee.
    const scanEventForMaterialLikeData = (obj, depth = 0, techContext = false) => {
      if (!obj || typeof obj !== 'object' || depth > 5) return;
      if (Array.isArray(obj)) {
        obj.forEach(v => scanEventForMaterialLikeData(v, depth + 1, techContext));
        return;
      }
      for (const [key, value] of Object.entries(obj)) {
        if (value == null) continue;
        const nextTechContext = techContext || matchesTechnicalMaterial(key);
        if (isLikelyMaterialKey(key)) {
          // Alleen forceren als we echt in "technisch materiaal"-context zitten.
          if (typeof value === 'object' && nextTechContext) {
            inspectResource(value, true);
          }
        }
        if (typeof value === 'object') {
          // Vermijd dat personeelsstructuren als materiaal worden geïnterpreteerd.
          if (!isPersonnelLikeObject(value)) {
            scanEventForMaterialLikeData(value, depth + 1, nextTechContext);
          }
        }
      }
    };
    scanEventForMaterialLikeData(event);

    // eventCustomData: zoek in technische contexten (pad kan variëren per event).
    if (eventCustomData) {
      const searchCustomData = (obj, inTechContext = false, parentName = '') => {
        if (!obj || typeof obj !== 'object') return;

        const name = String(obj.name || obj.label || obj.keyword || '').toLowerCase();
        const fullPath = parentName ? `${parentName}/${name}` : name;
        const isTechContext = inTechContext || matchesTechnicalMaterial(name) || matchesTechnicalMaterial(fullPath);

        // Als we in Technisch materiaal context zijn, probeer resources te lezen
        if (isTechContext) {
          if (obj.value) {
            if (Array.isArray(obj.value)) {
              obj.value.forEach(valueItem => {
                if (valueItem && valueItem.resource) {
                  inspectResource(valueItem.resource, true);
                } else if (valueItem && typeof valueItem === 'object') {
                  // Probeer ook resource_name, name, etc.
                  const resourceName = valueItem.resource_name || valueItem.name || valueItem.title || valueItem;
                  inspectResource(resourceName, true);
                } else {
                  inspectResource(valueItem, true);
                }
              });
            } else if (typeof obj.value === 'object') {
              // Als value een object is, probeer resource info te halen
              if (obj.value.resource) {
                inspectResource(obj.value.resource, true);
              } else if (obj.value.resource_name || obj.value.name) {
                inspectResource(obj.value, true);
              }
            } else {
              inspectResource(obj.value, true);
            }
          }

          if (obj.resource) {
            inspectResource(obj.resource, true);
          }
          
          // Probeer ook direct properties te lezen als dit een resource item lijkt
          if (obj.resource_name || obj.resource || obj.resources) {
            inspectResource(obj, true);
          }
        }

        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => searchCustomData(child, isTechContext, fullPath));
        }

        if (obj.groups && Array.isArray(obj.groups)) {
          obj.groups.forEach(group => searchCustomData(group, isTechContext, fullPath));
        }

        for (const key in obj) {
          if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
            searchCustomData(obj[key], isTechContext, fullPath);
          }
        }
      };

      searchCustomData(eventCustomData, false, '');
    }

    return [...materials];
  }

  // Extract alle documenten uit TECHNISCHE LIJST (niet alleen rider, maar alle documenten)
  extractTechnicalListDocuments(eventCustomData) {
    const root = eventCustomData?.data ?? eventCustomData?.customdata ?? eventCustomData;
    if (!root || typeof root !== 'object') return [];

    const out = [];
    const seen = new Set();

    const isTechContext = (s) => {
      const t = String(s || '').toLowerCase();
      return t.includes('technische lijst') || t.includes('technical list') || t.includes('rider') || t.includes('draaiboek');
    };
    const isDocLike = (u) => {
      const s = String(u || '');
      return s.includes('/documents/') || s.endsWith('.pdf') || s.includes('/api/documents/');
    };
    const normalizeUrl = (u) => {
      if (!u) return null;
      let url = String(u).trim();
      if (!url) return null;
      if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) url = this.baseURL + url;
      if (url.startsWith('documents/') && this.baseURL) url = `${this.baseURL}/${url}`;
      return isDocLike(url) ? url : null;
    };
    const pushDoc = (url, name, category, date, author) => {
      const normalized = normalizeUrl(url);
      if (!normalized) return;
      const key = `${normalized}|${String(name || '')}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        name: name || 'Document',
        url: normalized,
        type: 'application/pdf',
        date: date || null,
        author: author || null,
        category: category || name || 'Document'
      });
    };

    const walk = (obj, techCtx = false, parentPath = '', depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 8) return;
      if (Array.isArray(obj)) {
        obj.forEach(v => walk(v, techCtx, parentPath, depth + 1));
        return;
      }

      const name = String(obj.name || obj.label || obj.keyword || '').trim();
      const path = parentPath ? `${parentPath}/${name.toLowerCase()}` : name.toLowerCase();
      const nextCtx = techCtx || isTechContext(name) || isTechContext(path);

      const v = obj.value;
      if (nextCtx) {
        if (typeof v === 'string') pushDoc(v, name, name);
        if (v && typeof v === 'object') {
          pushDoc(v.url || v.link || v.href || v.dataurl || v.document_url, v.name || v.filename || v.originalname || name, name, v.date || v.created || v.updated, v.author || v.username || v.created_by);
        }
        pushDoc(obj.url || obj.link || obj.href || obj.dataurl || obj.document_url, name, name, obj.date || null, obj.author || obj.username || null);
      }

      (obj.children || []).forEach(c => walk(c, nextCtx, path, depth + 1));
      (obj.groups || []).forEach(g => walk(g, nextCtx, path, depth + 1));
      (obj.fields || []).forEach(f => walk(f, nextCtx, path, depth + 1));
      if (obj.customdata) walk(obj.customdata, nextCtx, path, depth + 1);
      for (const [k, val] of Object.entries(obj)) {
        if (['children', 'groups', 'fields', 'customdata', 'value'].includes(k)) continue;
        if (val && typeof val === 'object') walk(val, nextCtx, path, depth + 1);
      }
    };

    walk(root, false, '');
    return out;
  }

  // Extract bijlage/rider informatie uit eventCustomData (oude functie, behouden voor backwards compatibility)
  extractRiderAttachment(eventCustomData) {
    if (!eventCustomData || !eventCustomData.groups) {
      return null;
    }

    // Helper functie om recursief door customdata te zoeken naar bijlage/rider
    const searchForAttachment = (obj, path = []) => {
      if (!obj || typeof obj !== 'object') return null;

      // Check eerst direct op document URLs in value (ook als het geen File type is)
      if (obj.value) {
        if (typeof obj.value === 'string') {
          // Check of het een document URL is - MOET /documents/ bevatten of eindigen op .pdf
          // NIET andere API endpoints zoals /api/contactbooking/
          const isDocumentUrl = obj.value.includes('/documents/') || 
                                (obj.value.endsWith('.pdf') && !obj.value.includes('/api/'));
          
          if (isDocumentUrl) {
            let url = obj.value;
            // Als het een relatief pad is, maak er een absolute URL van
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Check of dit een rider/bijlage veld is OF als het een document URL is
            const isRiderField = obj.name?.toLowerCase().includes('rider') || 
                                 obj.name?.toLowerCase().includes('bijlage') ||
                                 obj.keyword?.toLowerCase().includes('rider') ||
                                 obj.keyword?.toLowerCase().includes('bijlage') ||
                                 obj.label?.toLowerCase().includes('rider') ||
                                 obj.label?.toLowerCase().includes('bijlage');
            
            // Alleen accepteren als het een document URL is (met /documents/) of een rider/bijlage veld
            if (isRiderField || url.includes('/documents/')) {
              return {
                name: obj.name || obj.label || obj.value.split('/').pop() || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
        // Check ook als value een object is met een URL property
        else if (typeof obj.value === 'object') {
          const url = obj.value.url || obj.value.link || obj.value.href || obj.value.document_url || obj.value.documentUrl;
          // Alleen document URLs accepteren - MOET /documents/ bevatten
          if (url && url.includes('/documents/')) {
            let fullUrl = url;
            if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
              fullUrl = this.baseURL + fullUrl;
            } else if (fullUrl.startsWith('documents/') && this.baseURL) {
              fullUrl = this.baseURL + '/' + fullUrl;
            }
            
            // Alleen accepteren als het een document URL is
            if (fullUrl.includes('/documents/')) {
              return {
                name: obj.value.name || obj.value.filename || obj.name || obj.label || fullUrl.split('/').pop() || 'Bijlage',
                url: fullUrl,
                type: 'application/pdf'
              };
            }
          }
        }
      }
      
      // Check ook direct op url/link/href properties
      if (obj.url || obj.link || obj.href) {
        const url = obj.url || obj.link || obj.href;
        // Alleen document URLs accepteren - MOET /documents/ bevatten
        if (url && url.includes('/documents/')) {
          let fullUrl = url;
          if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
            fullUrl = this.baseURL + fullUrl;
          } else if (fullUrl.startsWith('documents/') && this.baseURL) {
            fullUrl = this.baseURL + '/' + fullUrl;
          }
          
          // Alleen accepteren als het een document URL is
          if (fullUrl.includes('/documents/')) {
            return {
              name: obj.name || obj.label || fullUrl.split('/').pop() || 'Bijlage',
              url: fullUrl,
              type: 'application/pdf'
            };
          }
        }
      }

      // Check voor file/attachment velden - verschillende mogelijke structuren
      const isFileField = obj.type === 'File' || 
                         obj.type === 'Attachment' || 
                         obj.type === 'Document' ||
                         obj.keyword?.toLowerCase().includes('rider') || 
                         obj.keyword?.toLowerCase().includes('bijlage') ||
                         obj.keyword?.toLowerCase().includes('attachment') ||
                         obj.name?.toLowerCase().includes('rider') ||
                         obj.name?.toLowerCase().includes('bijlage') ||
                         (obj.name && obj.name.toLowerCase().includes('rider - bijlage'));

      if (isFileField) {
        // Check verschillende mogelijke structuren voor file data
        let fileData = null;
        
        // Structuur 1: obj.value is een object met file info
        if (obj.value && typeof obj.value === 'object') {
          // Check voor document URL in value object - MOET /documents/ bevatten
          const url = obj.value.url || obj.value.link || obj.value.href || obj.value.document_url || obj.value.documentUrl;
          const name = obj.value.name || obj.value.filename || obj.name || obj.value.title || obj.label || 'Bijlage';
          
          // Alleen accepteren als het een document URL is
          if (url && url.includes('/documents/')) {
            let fullUrl = url;
            if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
              fullUrl = this.baseURL + fullUrl;
            } else if (fullUrl.startsWith('documents/') && this.baseURL) {
              fullUrl = this.baseURL + '/' + fullUrl;
            }
            
            // Alleen accepteren als het een document URL is
            if (fullUrl.includes('/documents/')) {
              fileData = {
                name: name,
                url: fullUrl,
                type: obj.value.type || obj.value.mime_type || obj.value.content_type || 'application/pdf',
                date: obj.value.date || obj.value.created || obj.value.updated,
                author: obj.value.author || obj.value.created_by || obj.value.uploaded_by
              };
            }
          }
        }
        // Structuur 2: obj.value is een string (URL of document path)
        else if (obj.value && typeof obj.value === 'string') {
          // Check of het een document path is - MOET /documents/ bevatten
          if (obj.value.includes('/documents/') || (obj.value.startsWith('/documents/') || obj.value.startsWith('documents/'))) {
            // Als het een relatief pad is, maak er een absolute URL van
            let url = obj.value;
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              fileData = {
                name: obj.name || obj.label || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
        // Structuur 3: obj heeft direct url/file/document properties
        else if (obj.url || obj.file || obj.href || obj.document_url || obj.documentUrl) {
          let url = obj.url || obj.file || obj.href || obj.document_url || obj.documentUrl;
          // Alleen accepteren als het een document URL is - MOET /documents/ bevatten
          if (url && url.includes('/documents/')) {
            // Als het een relatief pad is, maak er een absolute URL van
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              fileData = {
                name: obj.name || obj.label || 'Bijlage',
                url: url,
                type: obj.type || 'application/pdf'
              };
            }
          }
        }
        // Structuur 4: Check voor document_id of documentId en bouw URL
        else if (obj.document_id || obj.documentId) {
          const docId = obj.document_id || obj.documentId;
          if (this.baseURL) {
            // Probeer verschillende URL formaten
            const possibleUrls = [
              `${this.baseURL}/documents/${docId}`,
              `${this.baseURL}/api/documents/${docId}`,
              `${this.baseURL}/document/${docId}`
            ];
            
            fileData = {
              name: obj.name || obj.label || 'Bijlage',
              url: possibleUrls[0], // Gebruik eerste format als default
              type: 'application/pdf'
            };
          }
        }

        if (fileData && fileData.url) {
          return fileData;
        }
      }

      // Recursief door children en groups zoeken
      if (obj.children && Array.isArray(obj.children)) {
        for (const child of obj.children) {
          const found = searchForAttachment(child, [...path, 'children']);
          if (found) return found;
        }
      }

      if (obj.groups && Array.isArray(obj.groups)) {
        for (const group of obj.groups) {
          const found = searchForAttachment(group, [...path, 'groups']);
          if (found) return found;
        }
      }

      // Check alle andere properties die objecten kunnen zijn
      for (const key in obj) {
        if (key !== 'children' && key !== 'groups' && key !== 'value' && key !== 'url' && key !== 'link' && key !== 'href' && obj[key] && typeof obj[key] === 'object') {
          const found = searchForAttachment(obj[key], [...path, key]);
          if (found) return found;
        }
        // Check ook string properties die URLs kunnen zijn
        else if (key !== 'children' && key !== 'groups' && key !== 'value' && typeof obj[key] === 'string') {
          const strValue = obj[key];
          // Check of het een document URL is - MOET /documents/ bevatten
          if (strValue.includes('/documents/')) {
            let url = strValue;
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              return {
                name: obj.name || obj.label || url.split('/').pop().split('?')[0] || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
      }

      return null;
    };

    // Zoek eerst specifiek in PRODUCTIE > TECHNISCHE LIJST > Rider - bijlage
    const productieGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie' || 
      g.name === 'PRODUCTIE' ||
      g.name?.toLowerCase().includes('productie')
    );

    if (productieGroup && productieGroup.children) {
      // Zoek TECHNISCHE LIJST in children van PRODUCTIE
      const techListInProductie = productieGroup.children.find(c =>
        c.keyword === 'productie_technischelijst' ||
        c.name === 'TECHNISCHE LIJST' ||
        c.name?.toLowerCase().includes('technische lijst')
      );
      
      if (techListInProductie && techListInProductie.children) {
        // Zoek "Rider - bijlage" in children van TECHNISCHE LIJST
        const riderBijlage = techListInProductie.children.find(c =>
          (c.keyword === 'rider' || c.name?.toLowerCase().includes('rider')) &&
          c.type === 'Attachment' &&
          c.value &&
          typeof c.value === 'object' &&
          c.value.dataurl
        );
        
        if (riderBijlage && riderBijlage.value && riderBijlage.value.dataurl) {
          // Check of het een document URL is
          const url = riderBijlage.value.dataurl;
          if (url.includes('/documents/')) {
            return {
              name: riderBijlage.value.originalname || riderBijlage.name || 'Technische lijst',
              url: url,
              type: riderBijlage.value.datatype || 'application/pdf',
              date: riderBijlage.value.date || null,
              author: riderBijlage.value.username || null
            };
          }
        }
      }
    }

    // Fallback: Zoek eerst in TECHNISCHE LIJST groep (direct)
    const techListGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie_technischelijst' || 
      g.name === 'TECHNISCHE LIJST' ||
      g.name?.toLowerCase().includes('technische lijst')
    );

    if (techListGroup) {
      const attachment = searchForAttachment(techListGroup);
      if (attachment) return attachment;
    }

    // Fallback: Zoek in PRODUCTIE groep (algemeen)
    if (productieGroup) {
      // Zoek direct in PRODUCTIE groep
      const attachment = searchForAttachment(productieGroup);
      if (attachment) return attachment;
    }

    // Zoek in alle groups als fallback
    for (const group of eventCustomData.groups) {
      const attachment = searchForAttachment(group);
      if (attachment) return attachment;
    }

    return null;
  }

  // Extract technische opmerkingen uit eventCustomData
  extractTechnicalRemarks(rawCustomData) {
    // Ontvouw bekende wrappers
    const eventCustomData = rawCustomData?.data ?? rawCustomData?.customdata ?? rawCustomData;
    if (!eventCustomData || typeof eventCustomData !== 'object') return null;

    const toText = (v) => {
      if (v == null) return null;
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (typeof v === 'object') {
        const direct = v.value ?? v.text ?? v.label ?? v.name ?? null;
        if (typeof direct === 'string') return direct.trim();
        if (Array.isArray(v)) return v.map(toText).filter(Boolean).join('\n').trim() || null;
      }
      return null;
    };

    const isTechContext = (s) => {
      const t = String(s || '').toLowerCase();
      return t.includes('technische lijst') || t.includes('technical list') || t.includes('techniek');
    };

    const isRemarkField = (s) => {
      const t = String(s || '').toLowerCase();
      return t.includes('opmerking') || t.includes('remarks') || t.includes('remark') || t.includes('notes');
    };

    const isPlaceholderRemark = (s) => {
      const t = String(s || '').trim().toLowerCase();
      if (!t) return true;
      // Technische keys/paths mogen nooit als zichtbare opmerking eindigen.
      if (t.includes('productie_technischelijst_opmerkingentechniek')) return true;
      if (t.includes('opmerkingentechniek') && !t.includes(' ')) return true;
      // Pure sleutel-achtige tokens (snake_case / path) zonder leesbare tekst filteren.
      if ((t.includes('_') || t.includes('/')) && t.length < 120) {
        const wordLike = /[a-z]{3,}\s+[a-z]{2,}/i.test(t);
        if (!wordLike) return true;
      }
      return false;
    };

    let best = null;
    const visit = (obj, techCtx = false, parentPath = '', depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 8) return;
      if (Array.isArray(obj)) {
        obj.forEach(v => visit(v, techCtx, parentPath, depth + 1));
        return;
      }

      const name = String(obj.name || obj.label || obj.keyword || '').trim();
      const path = parentPath ? `${parentPath}/${name.toLowerCase()}` : name.toLowerCase();
      const nextTechCtx = techCtx || isTechContext(name) || isTechContext(path);

      const keyHint = `${obj.keyword || ''} ${obj.name || ''} ${obj.label || ''}`.toLowerCase();
      const likelyTechRemark = (isRemarkField(keyHint) && (nextTechCtx || keyHint.includes('techniek') || keyHint.includes('technical')));

      if (likelyTechRemark) {
        const value = toText(obj.value);
        if (value && value.length > 0 && !isPlaceholderRemark(value)) {
          if (!best || value.length > best.length) best = value;
        }
      }

      // Soms zit de tekst niet in value maar in properties met naam-achtige keys.
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'children' || k === 'groups' || k === 'fields' || k === 'customdata') continue;
        const combinedHint = `${k} ${name} ${path}`.toLowerCase();
        if (isRemarkField(combinedHint) && (nextTechCtx || combinedHint.includes('techniek') || combinedHint.includes('technical'))) {
          const value = toText(v);
          if (value && value.length > 0 && !isPlaceholderRemark(value)) {
            if (!best || value.length > best.length) best = value;
          }
        }
      }

      (obj.children || []).forEach(c => visit(c, nextTechCtx, path, depth + 1));
      (obj.groups || []).forEach(g => visit(g, nextTechCtx, path, depth + 1));
      (obj.fields || []).forEach(f => visit(f, nextTechCtx, path, depth + 1));
      if (obj.customdata) visit(obj.customdata, nextTechCtx, path, depth + 1);
      for (const [k, v] of Object.entries(obj)) {
        if (['children', 'groups', 'fields', 'customdata', 'value'].includes(k)) continue;
        if (v && typeof v === 'object') visit(v, nextTechCtx, path, depth + 1);
      }
    };

    visit(eventCustomData);
    return best;
  }

  // Extract ureninfo (Uurwerk personeelsplanning) uit eventCustomData
  // Bestand tegen Yesplan-structuurwijzigingen: exacte keywords + zoeken op naam/deel-keyword
  extractUrenInfo(rawCustomData) {
    // Yesplan kan .data of .customdata wrapper gebruiken
    const eventCustomData = rawCustomData?.data ?? rawCustomData?.customdata ?? rawCustomData;
    if (!eventCustomData) {
      return { techniek: [], horeca: [], frontOffice: [], nostradamus: [] };
    }

    const toValueString = (v) => {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'object') return v.text || v.value || v.data || '';
      return String(v);
    };

    const parseUrenText = (text) => {
      const s = toValueString(text);
      if (!s || !s.trim()) return [];
      return s.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    };

    // Verzamel alle te doorlopen nodes (bekende keys + elke array van objecten, voor tabs/sections etc.)
    const getTraverseTargets = (obj) => {
      const known = [].concat(
        obj.children || [],
        obj.groups || [],
        obj.fields || [],
        obj.customdata ? [obj.customdata] : []
      );
      Object.values(obj).forEach((v) => {
        if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null) known.push(...v);
      });
      return known;
    };

    const findByKeywordRecursive = (node, keywords) => {
      const results = {};
      const traverse = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj.keyword && keywords.includes(obj.keyword)) {
          const str = toValueString(obj.value);
          if (str) results[obj.keyword] = str;
        }
        getTraverseTargets(obj).forEach(traverse);
      };
      traverse(node);
      return results;
    };

    const findByKeywordOrName = (node, patterns) => {
      const results = {};
      const traverse = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        const kw = (obj.keyword || '').toLowerCase();
        const name = (obj.name || '').toLowerCase();
        const label = (obj.label || '').toLowerCase();
        const str = toValueString(obj.value);
        if (!str) { getTraverseTargets(obj).forEach(traverse); return; }
        for (const { key, test } of patterns) {
          if (test(kw) || test(name) || test(label)) {
            if (!results[key]) results[key] = str;
            break;
          }
        }
        getTraverseTargets(obj).forEach(traverse);
      };
      traverse(node);
      return results;
    };

    const urenKeywords = ['urenuurwerktechniek', 'urenuurwerkhoreca', 'urenuurwerkfrontoffice'];
    const nostradamusKeywords = ['nostradamus_uren_dienst', 'nostradamus_uren_afdeling', 'nostradamus_uren_team'];

    // Fallback op keyword/naam/label: géén puur "opmerkingen …" velden (bijv. Opmerkingen techniek),
    // die matchen anders op 'techniek' maar horen niet bij Uurwerk-personeel.
    const isPureRemarkFieldName = (s) => {
      const t = String(s || '').toLowerCase();
      return (
        t.includes('opmerking') ||
        t.includes('remark') ||
        t.includes('remarks') ||
        t.includes('notes') ||
        t.includes('bijzonderheden')
      );
    };
    const looksLikeUrenUurwerkFieldName = (s) => {
      const t = String(s || '').toLowerCase();
      return (
        t.includes('urenuurwerk') ||
        t.includes('uren uurwerk') ||
        /\buurwerk\b/.test(t)
      );
    };
    const uurwerkFallbackMatch = (s, deptHint) => {
      const t = String(s || '').toLowerCase();
      if (!t) return false;
      let matchesDept = false;
      if (deptHint === 'horeca') matchesDept = t.includes('horeca');
      else if (deptHint === 'frontOffice') matchesDept = t.includes('frontoffice') || t.includes('front office');
      else if (deptHint === 'techniek') matchesDept = t.includes('techniek') || t.includes('uurwerk');
      if (!matchesDept) return false;
      if (isPureRemarkFieldName(t) && !looksLikeUrenUurwerkFieldName(t)) return false;
      return true;
    };

    // Volgorde: horeca/frontoffice eerst (specifiek), daarna techniek (ook losse 'uurwerk')
    const urenPatterns = [
      { key: 'horeca', test: (s) => uurwerkFallbackMatch(s, 'horeca') },
      { key: 'frontOffice', test: (s) => uurwerkFallbackMatch(s, 'frontOffice') },
      { key: 'techniek', test: (s) => uurwerkFallbackMatch(s, 'techniek') }
    ];
    const nostradamusPatterns = [{ key: 'nostradamus', test: s => s.includes('nostradamus') }];

    let techniek = [];
    let horeca = [];
    let frontOffice = [];
    let nostradamus = [];

    // 1) Exacte keywords (originele Yesplan-structuur)
    const found = findByKeywordRecursive(eventCustomData, urenKeywords);
    if (found['urenuurwerktechniek']) techniek = parseUrenText(found['urenuurwerktechniek']);
    if (found['urenuurwerkhoreca']) horeca = parseUrenText(found['urenuurwerkhoreca']);
    if (found['urenuurwerkfrontoffice']) frontOffice = parseUrenText(found['urenuurwerkfrontoffice']);

    // 2) Fallback: zoek op keyword/naam (bij hernoemde of verplaatste velden)
    const fallback = findByKeywordOrName(eventCustomData, urenPatterns);
    if (techniek.length === 0 && fallback['techniek']) techniek = parseUrenText(fallback['techniek']);
    if (horeca.length === 0 && fallback['horeca']) horeca = parseUrenText(fallback['horeca']);
    if (frontOffice.length === 0 && fallback['frontOffice']) frontOffice = parseUrenText(fallback['frontOffice']);

    // Verwijder losse tekstregels zonder diensttijd / typische Yesplan-structuur (bijv. opmerkingen die
    // per ongeluk in het uurwerkveld staan, of die via API toch binnenkomen).
    const isPlausibleUurwerkPlanningLine = (line) => {
      const s = String(line || '').trim();
      if (!s) return false;
      if (/\b\d{1,2}:\d{2}\b/.test(s)) return true;
      const segments = s.split(/\s+[-–—]\s+/).map((x) => x.trim()).filter(Boolean);
      if (segments.length >= 3) return true;
      if (/\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|oktober|nov|dec)/i.test(s)) {
        return true;
      }
      return false;
    };
    techniek = techniek.filter(isPlausibleUurwerkPlanningLine);

    // Nostradamus: exact + fallback op naam
    const nostradamusFound = findByKeywordRecursive(eventCustomData, nostradamusKeywords);
    const nostradamusFallback = findByKeywordOrName(eventCustomData, nostradamusPatterns);
    [].concat(
      Object.values(nostradamusFound),
      nostradamusFallback['nostradamus'] ? [nostradamusFallback['nostradamus']] : []
    ).forEach(v => { if (v) nostradamus = nostradamus.concat(parseUrenText(v)); });

    return { techniek, horeca, frontOffice, nostradamus };
  }

  /** Ruwe customdata voor één event (voor debug). */
  async getEventCustomDataRaw(eventId) {
    if (!eventId) return null;

    const id = String(eventId);
    const cached = this._eventCustomDataCache.get(id);
    const now = Date.now();
    if (cached && (now - cached.ts) < this._eventCustomDataCacheTtlMs) {
      return cached.data || null;
    }

    const inFlight = this._eventCustomDataInFlight.get(id);
    if (inFlight) {
      return await inFlight;
    }

    const fetchPromise = (async () => {
      try {
        const queryString = this.addApiKey();
        const url = `/api/event/${id}/customdata?${queryString}`;
        const res = await this.client.get(url);
        const data = res?.data ?? null;

        if (this._eventCustomDataCache.size >= this._eventCustomDataCacheMax) {
          const oldestKey = this._eventCustomDataCache.keys().next().value;
          if (oldestKey) this._eventCustomDataCache.delete(oldestKey);
        }
        this._eventCustomDataCache.set(id, { ts: Date.now(), data });
        return data;
      } catch (err) {
        return null;
      } finally {
        this._eventCustomDataInFlight.delete(id);
      }
    })();

    this._eventCustomDataInFlight.set(id, fetchPromise);
    return await fetchPromise;
  }

  /** Haalt alleen personeelsplanning op voor één event (direct customdata-call). */
  async getEventPersonnel(eventId) {
    if (!eventId) return { techniek: [], horeca: [], frontOffice: [], nostradamus: [] };
    try {
      const customData = await this.getEventCustomDataRaw(eventId);
      return this.extractUrenInfo(customData);
    } catch (err) {
      return { techniek: [], horeca: [], frontOffice: [], nostradamus: [] };
    }
  }

  formatDateForYesplan(dateString) {
    // Converteer YYYY-MM-DD naar dd-mm-yyyy
    if (!dateString) return '';
    
    // Parse direct uit string om timezone problemen te voorkomen
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // YYYY-MM-DD formaat
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}-${month}-${year}`;
      }
    }
    
    // Fallback naar Date object parsing
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async getSchedule(eventId) {
    try {
      const queryString = this.addApiKey();
      const url = queryString ? `/api/event/${eventId}/schedule?${queryString}` : `/api/event/${eventId}/schedule`;

      const response = await this.client.get(url);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: { items: [] }, timestamp: new Date().toISOString() };
      }
      safeLog('error', 'Yesplan Schedule Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getEventDetails(eventId) {
    try {
      const queryString = this.addApiKey();
      const url = queryString ? `/api/event/${eventId}?${queryString}` : `/api/event/${eventId}`;
      
      const response = await this.client.get(url);
      
      return {
        success: true,
        data: this.formatEventDetails(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      safeLog('error', 'Yesplan Event Details Error:', error.message);
      if (error.response) {
        safeLog('error', 'Response status:', error.response.status);
        safeLog('error', 'Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getReservations(params = {}) {
    try {
      const { eventId, startDate, endDate, venueId } = params;
      const queryParams = {};
      
      if (eventId) queryParams.event_id = eventId;
      if (startDate) queryParams.start_date = this.formatDateForYesplan(startDate);
      if (endDate) queryParams.end_date = this.formatDateForYesplan(endDate);
      if (venueId) queryParams.venue_id = venueId;
      
      const queryString = this.addApiKey(queryParams);
      
      // Probeer verschillende endpoints
      let reservations = [];
      
      // Probeer /api/reservations
      try {
        const url = `/api/reservations?${queryString}`;
        const response = await this.client.get(url);
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(data)) {
          reservations = data;
        }
      } catch (error) {
        // Als /api/reservations niet werkt, probeer /api/bookings
        if (error.response?.status === 404) {
          try {
            const url = `/api/bookings?${queryString}`;
            const response = await this.client.get(url);
            const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            if (Array.isArray(data)) {
              reservations = data;
            }
          } catch (error2) {
            // Als beide niet werken, haal reserveringen uit event details
            // Reservations endpoint not found, extracting from events
          }
        }
      }
      
      // Als er geen directe reserveringen endpoint is, haal reserveringen uit events
      if (reservations.length === 0 && (startDate || eventId)) {
        // Haal events op en extract reserveringen (inclusief Itix data)
        const eventsResult = await this.getEvents({ startDate, endDate, venueId });
        if (eventsResult.success && eventsResult.data) {
          eventsResult.data.forEach(event => {
            if (event.rawEvent) {
              // Check voor reserveringen in event data
              const rawEvent = event.rawEvent;
              
              // Check voor Itix reserveringen data (van Itix naar Yesplan)
              // Itix stuurt reserveringen data naar Yesplan, mogelijk in verschillende velden
              if (rawEvent.ticketing && rawEvent.ticketing.reserved) {
                // Directe reserveringen count uit Itix
                const reservedCount = rawEvent.ticketing.reserved || 0;
                if (reservedCount > 0) {
                  reservations.push({
                    id: `itix-reserved-${event.id}`,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: 'Itix Reserveringen',
                    customerEmail: '',
                    tickets: reservedCount,
                    status: 'reserved',
                    reservationDate: rawEvent.ticketing.status_date || rawEvent.starttime,
                    notes: 'Reserveringen van Itix',
                    source: 'itix'
                  });
                }
              }
              
              // Check voor Itix data in andere velden
              if (rawEvent.itix_data && rawEvent.itix_data.Gereserveerd) {
                const reservedCount = parseInt(rawEvent.itix_data.Gereserveerd) || 0;
                if (reservedCount > 0) {
                  reservations.push({
                    id: `itix-reserved-${event.id}`,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: 'Itix Reserveringen',
                    customerEmail: '',
                    tickets: reservedCount,
                    status: 'reserved',
                    reservationDate: rawEvent.itix_data['Status op'] || rawEvent.starttime,
                    notes: 'Reserveringen van Itix',
                    source: 'itix'
                  });
                }
              }
              
              // Check voor reserveringen in event properties (mogelijk Itix integratie)
              if (rawEvent.properties) {
                const reservedProp = rawEvent.properties.find(p => 
                  p.name && (p.name.toLowerCase().includes('gereserveerd') || 
                            p.name.toLowerCase().includes('reserved') ||
                            p.name.toLowerCase().includes('itix'))
                );
                if (reservedProp && reservedProp.value) {
                  const reservedCount = parseInt(reservedProp.value) || 0;
                  if (reservedCount > 0) {
                    reservations.push({
                      id: `itix-reserved-${event.id}`,
                      eventId: event.id,
                      eventName: event.title,
                      customerName: 'Itix Reserveringen',
                      customerEmail: '',
                      tickets: reservedCount,
                      status: 'reserved',
                      reservationDate: rawEvent.starttime,
                      notes: `Reserveringen van Itix (${reservedProp.name})`,
                      source: 'itix'
                    });
                  }
                }
              }
              
              // Mogelijke velden: reservations, bookings, ticket_reservations, etc.
              if (rawEvent.reservations && Array.isArray(rawEvent.reservations)) {
                rawEvent.reservations.forEach(res => {
                  reservations.push({
                    id: res.id || res._id,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: res.customer_name || res.name || res.customer?.name,
                    customerEmail: res.customer_email || res.email || res.customer?.email,
                    tickets: res.tickets || res.ticket_count || res.quantity || 1,
                    status: res.status || 'reserved',
                    reservationDate: res.reservation_date || res.date || res.created_at,
                    notes: res.notes || res.comment
                  });
                });
              }
              
              if (rawEvent.bookings && Array.isArray(rawEvent.bookings)) {
                rawEvent.bookings.forEach(book => {
                  if (book.status === 'reserved' || book.type === 'reservation') {
                    reservations.push({
                      id: book.id || book._id,
                      eventId: event.id,
                      eventName: event.title,
                      customerName: book.customer_name || book.name || book.customer?.name,
                      customerEmail: book.customer_email || book.email || book.customer?.email,
                      tickets: book.tickets || book.ticket_count || book.quantity || 1,
                      status: book.status || 'reserved',
                      reservationDate: book.reservation_date || book.date || book.created_at,
                      notes: book.notes || book.comment
                    });
                  }
                });
              }
            }
          });
        }
      }
      
      return {
        success: true,
        data: this.formatReservations(reservations),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      safeLog('error', 'Yesplan Reservations Error:', error.message);
      if (error.response) {
        safeLog('error', 'Response status:', error.response.status);
        safeLog('error', 'Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatReservations(reservations) {
    if (!Array.isArray(reservations)) return [];
    
    return reservations.map(reservation => ({
      id: reservation.id,
      eventId: reservation.eventId,
      eventName: reservation.eventName || 'Onbekend evenement',
      customerName: reservation.customerName || 'Onbekend',
      customerEmail: reservation.customerEmail || '',
      tickets: reservation.tickets || 1,
      status: reservation.status || 'reserved',
      reservationDate: reservation.reservationDate,
      notes: reservation.notes || '',
      formattedDate: reservation.reservationDate ? format(parseISO(reservation.reservationDate), 'dd-MM-yyyy HH:mm') : ''
    }));
  }

  async getVenues() {
    try {
      // Yesplan heeft geen directe venues endpoint, dus halen we venues uit events
      // Haal events op over een periode om alle venues te vinden
      const today = new Date();
      const venueMap = new Map();
      let foundEvents = 0;
      let consecutiveRateLimitHits = 0;
      const debugVenues = process.env.YESPLAN_VENUES_DEBUG === '1';
      
      // Houd deze scan bewust beperkt om 429's te voorkomen.
      // De scan moet zowel recente dagen terug als vooruit meenemen,
      // omdat nieuwe locaties (bv. WTPH) soms pas in events "later" zichtbaar worden.
      const pastDays = Number(process.env.YESPLAN_VENUES_SCAN_PAST_DAYS || 10);   // default 10 dagen terug
      const futureDays = Number(process.env.YESPLAN_VENUES_SCAN_FUTURE_DAYS || 14); // default 14 dagen vooruit
      const daysToCheck = [];
      for (let i = -pastDays; i <= futureDays; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        daysToCheck.push(checkDate);
      }

      // Sequentieel met lichte pacing om rate limiting te vermijden.
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      for (const date of daysToCheck) {
        const dateStr = this.formatDateForYesplan(date.toISOString().split('T')[0]);
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;

        try {
          const response = await this.client.get(url);
          consecutiveRateLimitHits = 0;
          const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
          if (Array.isArray(events) && events.length > 0) {
            foundEvents += events.length;
            events.forEach(event => {
              // Yesplan locaties kunnen per endpoint variëren in datastructuur.
              // We proberen zowel `event.locations` als `event.rawEvent.locations`.
              const locations =
                (Array.isArray(event?.locations) && event.locations.length > 0)
                  ? event.locations
                  : (Array.isArray(event?.rawEvent?.locations) ? event.rawEvent.locations : []);

              if (!Array.isArray(locations) || locations.length === 0) return;

              locations.forEach(location => {
                const locationId =
                  location?.id ??
                  location?.location_id ??
                  location?.venue_id ??
                  location?.venueId ??
                  location?.code ??
                  location?.name;

                const idKey = locationId != null ? String(locationId) : null;
                if (!idKey || venueMap.has(idKey)) return;

                if (debugVenues && (idKey === 'WTPH' || String(idKey).includes('WTPH') || location?.name === 'WTPH')) {
                  safeLog('log', `[getVenues] Match WTPH in venueMap scan: id=${idKey} name=${location?.name} eventId=${event?.id}`);
                }

                venueMap.set(idKey, {
                  id: idKey,
                  name: location?.name ?? location?.location_name ?? location?.venue_name ?? location?.code ?? idKey,
                  capacity: location?.capacity ?? 0,
                  location: location?.location ?? '',
                  description: location?.description ?? '',
                  type: location?._type ?? 'location',
                  url: location?.url
                });
              });
            });
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Geen events op deze dag
          } else if (error.response?.status === 429) {
            consecutiveRateLimitHits += 1;
            // Even wachten en daarna verder; bij herhaling vroegtijdig stoppen.
            await sleep(250);
            if (consecutiveRateLimitHits >= 3) break;
          } else {
            safeLog('error', `Error fetching events for ${dateStr}:`, error.message);
          }
        }

        // Voorkom onnodig extra API-load: stop pas als er genoeg locaties gevonden zijn.
        if (venueMap.size >= 50 && foundEvents >= 200) break;
        await sleep(80);
      }
      
      const venues = Array.from(venueMap.values());
      
      // Sorteer alfabetisch op naam (geen specifieke volgorde)
      venues.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      return {
        success: true,
        data: this.formatVenues(venues),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      safeLog('error', 'Yesplan Venues Error:', error.message);
      if (error.response) {
        safeLog('error', 'Response status:', error.response.status);
        safeLog('error', 'Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatVenues(venues) {
    if (!Array.isArray(venues)) return [];
    
    return venues.map(venue => ({
      id: venue.id || venue.venue_id,
      name: venue.name || venue.venue_name || 'Onbekende zaal',
      capacity: venue.capacity || 0,
      location: venue.location || '',
      description: venue.description || '',
      type: venue.type || 'venue'
    }));
  }

  async formatEvents(events) {
    if (!Array.isArray(events)) return [];
    
    try {
      // Per event: altijd event customdata ophalen (personeel/urenInfo); bij group ook group data
      const queryString = this.addApiKey();
      const groupDataPromises = events.map(async (event) => {
        let eventCustomData = null;
        let groupData = null;
        let customData = null;
        let ticketingData = null;
        let eventDetails = null;
        let resourceBookingsData = null;

        // 1. Altijd event customdata ophalen (personeel, techniek, etc.)
        try {
          const eventCustomDataUrl = `/api/event/${event.id}/customdata?${queryString}`;
          const eventCustomDataResponse = await this.client.get(eventCustomDataUrl);
          eventCustomData = eventCustomDataResponse.data;
        } catch (error) {}

        // 2. Altijd event details + ticketing + resourcebookings ophalen (kaartverkoop, zaalplattegrond)
        try {
          const eventDetailUrl = `/api/event/${event.id}?${queryString}&expand=ticketing,resources,resourcebookings,contactbookings`;
          const eventDetailResponse = await this.client.get(eventDetailUrl);
          eventDetails = eventDetailResponse.data || null;
          if (eventDetails?.ticketing) ticketingData = eventDetails.ticketing;
          if (eventDetails?.resourcebookings) resourceBookingsData = eventDetails.resourcebookings;
        } catch (error) {
          try {
            const ticketingUrl = `/api/event/${event.id}/ticketing?${queryString}`;
            const ticketingResponse = await this.client.get(ticketingUrl);
            ticketingData = ticketingResponse.data;
          } catch (e2) {}
        }
        if (!resourceBookingsData) {
          try {
            const rbUrl = `/api/event/${event.id}/resourcebookings?${queryString}`;
            const rbRes = await this.client.get(rbUrl);
            resourceBookingsData = rbRes.data?.data || rbRes.data;
          } catch (error) {}
        }

        // 3. Als er een group is: group data en group customdata (voor resources e.d.)
        const groupRef = event.group || event.parentgroup || null;
        const groupId = groupRef?.id || (groupRef?.url ? groupRef.url.match(/\/group\/([^/?]+)/)?.[1] : null);
        if (groupRef && groupId) {
          try {
            const groupUrl = groupRef.url?.includes('?') ? groupRef.url : `${groupRef.url}?${queryString}`;
            const groupResponse = await this.client.get(groupUrl);
            groupData = groupResponse.data;
          } catch (error) {}
          try {
            const customDataUrl = `/api/group/${groupId}/customdata?${queryString}`;
            const customDataResponse = await this.client.get(customDataUrl);
            customData = customDataResponse.data;
          } catch (error) {}
        }

        return {
          eventId: event.id,
          groupData,
          customData,
          eventCustomData,
          ticketingData,
          eventDetails,
          resourceBookingsData
        };
      });
    
    const groupDataResults = await Promise.all(groupDataPromises);
    const groupDataMap = new Map();
    const customDataMap = new Map();
    const eventCustomDataMap = new Map();
    const ticketingDataMap = new Map();
    const eventDetailsMap = new Map();
    const resourceBookingsMap = new Map();
    groupDataResults.forEach(result => {
      if (result.groupData) {
        groupDataMap.set(result.eventId, result.groupData);
      }
      if (result.customData) {
        customDataMap.set(result.eventId, result.customData);
      }
      if (result.eventCustomData) {
        eventCustomDataMap.set(result.eventId, result.eventCustomData);
      }
      if (result.ticketingData) {
        ticketingDataMap.set(result.eventId, result.ticketingData);
      }
      if (result.eventDetails) {
        eventDetailsMap.set(result.eventId, result.eventDetails);
      }
      if (result.resourceBookingsData) {
        resourceBookingsMap.set(result.eventId, result.resourceBookingsData);
      }
    });
    
    return events.map(event => {
      const groupData = groupDataMap.get(event.id) || null;
      const customData = customDataMap.get(event.id) || null;
      const eventCustomData = eventCustomDataMap.get(event.id) || null;
      const ticketingData = ticketingDataMap.get(event.id) || null;
      const eventDetails = eventDetailsMap.get(event.id) || null;
      const resourceBookingsData = resourceBookingsMap.get(event.id) || null;
      // Yesplan gebruikt starttime/endtime en locations array
      const locations = event.locations && Array.isArray(event.locations) 
        ? event.locations.map(loc => loc.name).join(', ')
        : 'Onbekend';
      const venueIds = event.locations && Array.isArray(event.locations)
        ? event.locations.map(loc => String(loc.id))
        : [];
      
      // Gebruik defaultschedulestart/end als beschikbaar, anders starttime/endtime
      const startTime = event.defaultschedulestart || event.starttime || event.start_date;
      const endTime = event.defaultscheduleend || event.endtime || event.end_date;
      
      // Haal uitvoerende op uit group of parentgroup
      const performer = event.group?.name || event.parentgroup?.name || null;
      
      // Haal schedule tijden op (voor opbouw, pauze, etc.)
      const scheduleStartTime = event.defaultschedulestarttime;
      const scheduleEndTime = event.defaultscheduleendtime;
      const scheduleDescription = event.defaultscheduledescription;
      
      // Haal resources op (balletvloer, vleugel, etc.) - gebruik group data, customdata en event customdata
      const eventForResources = eventDetails 
        ? { ...event, ...eventDetails, resourcebookings: resourceBookingsData || eventDetails.resourcebookings || event.resourcebookings }
        : { ...event, resourcebookings: resourceBookingsData || event.resourcebookings };
      const resources = this.extractResources(eventForResources, groupData, customData, eventCustomData);
      const technicalMaterialResources = this.extractTechnicalMaterialResources(eventForResources, eventCustomData);

      // Debug: log resource structuur als technisch materiaal ontbreekt
      if (technicalMaterialResources.length === 0) {
        const rawResources = eventForResources.resources;
        const rawResourceBookings = eventForResources.resourcebookings;
        const resourcesCount = Array.isArray(rawResources)
          ? rawResources.length
          : (rawResources && typeof rawResources === 'object' ? Object.keys(rawResources).length : 0);
        const resourceBookingsCount = Array.isArray(rawResourceBookings)
          ? rawResourceBookings.length
          : (rawResourceBookings && typeof rawResourceBookings === 'object' ? Object.keys(rawResourceBookings).length : 0);
      }
      
      // Haal ureninfo op uit eventCustomData (bevat Uurwerk personeelsplanning)
      const urenInfo = this.extractUrenInfo(eventCustomData);
      
      // Haal technische opmerkingen op uit eventCustomData
      let technicalRemarks = null;
      try {
        technicalRemarks = this.extractTechnicalRemarks(eventCustomData);
      } catch (error) {
        // Negeer errors bij het ophalen van technische opmerkingen
        safeLog('error', 'Error extracting technical remarks:', error);
      }
      
      // Haal alle documenten uit TECHNISCHE LIJST op (niet alleen rider, maar alle documenten)
      let technicalListDocuments = [];
      try {
        technicalListDocuments = this.extractTechnicalListDocuments(eventCustomData);
      } catch (error) {
        // Negeer errors bij het ophalen van technische lijst documenten
        safeLog('error', 'Error extracting technical list documents:', error);
      }
      
      // Backwards compatibility: haal ook rider attachment op (voor oude code)
      let riderAttachment = null;
      if (technicalListDocuments.length > 0) {
        // Gebruik eerste document als rider attachment voor backwards compatibility
        riderAttachment = technicalListDocuments[0];
      } else {
      try {
        riderAttachment = this.extractRiderAttachment(eventCustomData);
      } catch (error) {
        safeLog('error', 'Error extracting rider attachment:', error);
        }
      }
      
      // Check specifiek voor balletvloer en vleugel uit resources (resource booking = expliciete "ja")
      let hasBalletvloer = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('balletvloer') || rLower.includes('ballet');
      });
      let balletvloerExplicit = hasBalletvloer;
      let hasVleugel = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('vleugel') || rLower.includes('piano');
      });
      let vleugelExplicit = hasVleugel;
      let hasOrkestbak = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('orkestbak');
      });
      let orkestbakExplicit = hasOrkestbak;
      let orkestbakValue = null;
      const toOrkestbakDisplay = (val) => {
        const v = toEffectiveValue(val);
        if (v == null || v === '') return null;
        if (typeof v === 'string') {
          const t = v.trim();
          if (t.toLowerCase() === 'nee' || t.toLowerCase() === 'no') return 'nee';
          return t || null;
        }
        return (v === true || v === 1) ? 'ja' : null;
      };
      
      // Haal effectieve waarde uit object (Yesplan dropdowns kunnen { name: "Ja" } retourneren)
      const toEffectiveValue = (v) => {
        if (v == null) return null;
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
        if (typeof v === 'object') return v.value ?? v.name ?? v.label ?? v.text ?? null;
        return null;
      };
      // Helper functie om een waarde te checken op "Ja"/"Yes"/true/1
      const isTrueValue = (value) => {
        const v = toEffectiveValue(value);
        if (v === true || v === 1 || v === '1') return true;
        if (typeof v === 'string') {
          const lower = v.toLowerCase().trim();
          return lower === 'ja' || lower === 'yes' || lower === 'true';
        }
        return false;
      };
      const isOrkestbakValue = (value) => {
        const v = toEffectiveValue(value);
        if (v == null || v === '') return false;
        if (v === true || v === 1) return true;
        if (typeof v === 'string') {
          const lower = v.toLowerCase().trim();
          if (lower === 'nee' || lower === 'no') return false;
          return lower.length > 0;
        }
        return false;
      };
      // Waarde geeft aan dat de gebruiker iets heeft ingevuld (ja, nee, of orkestbak-beschrijving)
      const valueIndicatesUserInput = (value, forOrkestbak = false) => {
        const v = toEffectiveValue(value);
        if (v == null) return false;
        if (typeof v === 'string') {
          const t = v.trim();
          if (t === '') return false;
          return true;
        }
        if (forOrkestbak) return v === true || v === 1 || v === false || v === 0;
        return v === true || v === 1 || v === false || v === 0;
      };
      
      // Check ook direct in raw event voor technische lijst (production.technical_list)
      if (event.production && event.production.technical_list) {
        const techList = event.production.technical_list;
        
        // Als het een object is, check alle properties
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
            }
            if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
            }
            if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(value)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
            }
          }
        }
        
        // Als het een array is, check elk item
        if (Array.isArray(techList)) {
          techList.forEach(item => {
            if (item && typeof item === 'object') {
              for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                const keyLower = key.toLowerCase();
                const value = item[key];
                
                if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
                  balletvloerExplicit = true;
                  if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
                }
                if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
                  vleugelExplicit = true;
                  if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
                }
                if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
                  orkestbakExplicit = true;
                  if (!hasOrkestbak && isOrkestbakValue(value)) {
                    hasOrkestbak = true;
                    orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
                  } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
                }
              }
            }
          });
        }
      }
      
      // Check production.properties voor technische lijst
      if (event.production && event.production.properties && Array.isArray(event.production.properties)) {
        event.production.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if ((propName.includes('balletvloer') || propName.includes('ballet')) && valueIndicatesUserInput(propValue)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(propValue)) hasBalletvloer = true;
            }
            if ((propName.includes('vleugel') || propName.includes('piano')) && valueIndicatesUserInput(propValue)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(propValue)) hasVleugel = true;
            }
            if ((propName.includes('orkestbak') || propName.includes('orkest')) && valueIndicatesUserInput(propValue, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(propValue)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(propValue);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(propValue);
            }
          }
        });
      }
      
      // Check properties voor technische lijst
      if (event.properties && Array.isArray(event.properties)) {
        event.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if ((propName.includes('balletvloer') || propName.includes('ballet')) && valueIndicatesUserInput(propValue)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(propValue)) hasBalletvloer = true;
            }
            if ((propName.includes('vleugel') || propName.includes('piano')) && valueIndicatesUserInput(propValue)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(propValue)) hasVleugel = true;
            }
            if ((propName.includes('orkestbak') || propName.includes('orkest')) && valueIndicatesUserInput(propValue, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(propValue)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(propValue);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(propValue);
            }
          }
        });
      }
      
      // Check event.technical_list direct
      if (event.technical_list) {
        const techList = event.technical_list;
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
            }
            if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
            }
            if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(value)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
            }
          }
        }
      }
      
      // eventCustomData: zet explicit ALLEEN bij technische lijst velden als er een echte waarde is
      // Lege/ontbrekende velden = geen info = "niet bekend", niet "nee"
      if (eventCustomData) {
        const hasExplicitValue = (value) => {
          const v = toEffectiveValue(value);
          if (v == null) return false;
          if (typeof v === 'string') {
            const t = v.trim();
            if (t === '') return false;
            return true; // ja, nee, of orkestbak-beschrijving = gebruiker heeft ingevuld
          }
          return v === true || v === false || v === 1 || v === 0;
        };
        const setExplicitFromCustomData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          const value = obj.value;
          if (kw.includes('technischelijst') && hasExplicitValue(value)) {
            if (kw.includes('balletvloer')) balletvloerExplicit = true;
            if (kw.includes('vleugel')) vleugelExplicit = true;
            if (kw.includes('orkestbak') || kw.includes('orkest')) orkestbakExplicit = true;
          }
          if (obj.children) obj.children.forEach(setExplicitFromCustomData);
          if (obj.groups) obj.groups.forEach(setExplicitFromCustomData);
          for (const k in obj) {
            if (!['children', 'groups'].includes(k) && obj[k] && typeof obj[k] === 'object') setExplicitFromCustomData(obj[k]);
          }
        };
        setExplicitFromCustomData(eventCustomData);
      }
      
      // Haal "boeking beheerd door" / verantwoordelijke op
      let bookingManager = null;
      const fullEvent = eventDetails ? { ...event, ...eventDetails } : event;
      if (fullEvent.responsible && (typeof fullEvent.responsible === 'string' || fullEvent.responsible?.name)) {
        bookingManager = typeof fullEvent.responsible === 'string' ? fullEvent.responsible : (fullEvent.responsible.name || null);
      }
      if (!bookingManager && fullEvent.responsible_contact) {
        const rc = fullEvent.responsible_contact;
        bookingManager = rc.name || rc.contact?.name || (typeof rc === 'string' ? rc : null);
      }
      if (!bookingManager && fullEvent.contactbookings && Array.isArray(fullEvent.contactbookings)) {
        const roles = ['artistieke zaken', 'boeking', 'verantwoordelijke', 'beheerder', 'contact'];
        for (const cb of fullEvent.contactbookings) {
          const roleName = (cb.role?.name || cb.role || '').toLowerCase();
          const contactName = cb.contact?.name || cb.contact?.firstname || cb.name;
          if (contactName && roles.some(r => roleName.includes(r))) {
            bookingManager = contactName;
            break;
          }
          if (contactName && !bookingManager) bookingManager = contactName;
        }
      }
      if (!bookingManager && eventCustomData) {
        const findBookingManager = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          const names = ['verantwoordelijk', 'beheerd', 'artistieke', 'boeking', 'contact', 'responsible'];
          if (names.some(n => kw.includes(n))) {
            const v = obj.value;
            if (v && typeof v === 'string' && v.trim() && !/^(nee|no)$/i.test(v.trim())) return v.trim();
            if (v && typeof v === 'object' && v.name) return v.name;
          }
          if (obj.children) for (const c of obj.children) { const r = findBookingManager(c); if (r) return r; }
          if (obj.groups) for (const g of obj.groups) { const r = findBookingManager(g); if (r) return r; }
          for (const key in obj) {
            if (!['children', 'groups'].includes(key) && obj[key] && typeof obj[key] === 'object') {
              const r = findBookingManager(obj[key]);
              if (r) return r;
            }
          }
          return null;
        };
        bookingManager = findBookingManager(eventCustomData);
      }
      
      // Haal orkestbak waarde uit eventCustomData (TECHNISCHE LIJST)
      if (!orkestbakValue && eventCustomData) {
        const findOrkestValue = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          if ((kw.includes('orkestbak') || kw.includes('orkest')) && kw.includes('technischelijst')) {
            const v = toOrkestbakDisplay(obj.value);
            if (v) return v;
          }
          if (obj.children) {
            for (const c of obj.children) {
              const r = findOrkestValue(c);
              if (r) return r;
            }
          }
          if (obj.groups) {
            for (const g of obj.groups) {
              const r = findOrkestValue(g);
              if (r) return r;
            }
          }
          for (const key in obj) {
            if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
              const r = findOrkestValue(obj[key]);
              if (r) return r;
            }
          }
          return null;
        };
        orkestbakValue = findOrkestValue(eventCustomData);
      }
      
      // Haal verkoopdata op — bestand tegen Yesplan-structuurwijzigingen: eerst recursief door alle customdata
      let capacity = 0;
      let soldTickets = 0;
      let ticketsReserved = 0;
      let revenue = 0;
      let aantalGasten = 0;
      let ticketingIdFromCustomData = null;

      const num = (v) => (typeof v === 'number' && !Number.isNaN(v)) ? v : parseInt(v) || 0;
      const float = (v) => (typeof v === 'number' && !Number.isNaN(v)) ? v : parseFloat(v) || 0;
      const unwrap = (v) => (v != null && typeof v === 'object' && ('value' in v || 'data' in v)) ? (v.value ?? v.data) : v;
      const applyVerkoopValue = (keywordLower, nameLower, value) => {
        const v = unwrap(value);
        if (keywordLower.includes('capaciteit') || nameLower.includes('capaciteit') || nameLower.includes('capacity')) {
          capacity = num(v);
        } else if (keywordLower.includes('verkocht') || nameLower.includes('verkocht') || nameLower.includes('sold')) {
          soldTickets = num(v);
        } else if (keywordLower.includes('gereserveerd') || keywordLower.includes('reserved') || nameLower.includes('gereserveerd') || nameLower.includes('reserved')) {
          ticketsReserved = num(v);
        } else if (keywordLower.includes('recette') || keywordLower.includes('revenue') || nameLower.includes('recette') || nameLower.includes('revenue') || nameLower.includes('omzet')) {
          revenue = float(v);
        } else if (keywordLower.includes('gasten') || keywordLower.includes('guests') || nameLower.includes('gasten') || nameLower.includes('guests')) {
          aantalGasten = num(v);
        } else if ((keywordLower.includes('ticketing') && keywordLower.includes('id')) || (nameLower.includes('ticketing') && nameLower.includes('id'))) {
          const sid = String(v != null ? v : value).trim();
          if (sid && !keywordLower.includes('group')) ticketingIdFromCustomData = sid;
        }
      };

      const walkVerkoop = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        const keywordLower = (obj.keyword || '').toLowerCase();
        const nameLower = (obj.name || '').toLowerCase();
        const val = obj.value;
        if (val !== null && val !== undefined && (keywordLower || nameLower)) {
          applyVerkoopValue(keywordLower, nameLower, val);
        }
        (obj.children || []).forEach(walkVerkoop);
        (obj.groups || []).forEach(walkVerkoop);
        (obj.fields || []).forEach(walkVerkoop);
      };

      const customForWalk = eventCustomData?.data ?? eventCustomData;
      if (customForWalk) walkVerkoop(customForWalk);
      
      // Fallback naar ticketingData
      if (capacity === 0 && ticketingData) {
        capacity = ticketingData.capacity || ticketingData.max_capacity || ticketingData.total_capacity || 0;
        soldTickets = ticketingData.sold || ticketingData.sold_tickets || ticketingData.tickets_sold || ticketingData.booked || 0;
        ticketsReserved = ticketingData.reserved || ticketingData.tickets_reserved || 0;
        revenue = ticketingData.revenue || ticketingData.total_revenue || ticketingData.sales_revenue || 0;
      }
      
      // Fallback naar event.ticketing
      if (capacity === 0 && event.ticketing) {
        capacity = event.ticketing.capacity || event.ticketing.max_capacity || 0;
        soldTickets = event.ticketing.sold || event.ticketing.sold_tickets || 0;
        ticketsReserved = parseInt(event.ticketing.reserved) || 0;
        revenue = event.ticketing.revenue || 0;
      }
      
      // Fallback naar event velden
      if (capacity === 0) {
        capacity = event.capacity || event.max_capacity || event.total_capacity || 0;
      }
      if (soldTickets === 0) {
        soldTickets = event.sold_tickets || event.tickets_sold || event.sold || event.booked_tickets || 0;
      }
      if (revenue === 0) {
        revenue = event.revenue || event.total_revenue || event.sales_revenue || 0;
      }
      
      // Haal reserveringen op (van Itix naar Yesplan) - fallback
      if (ticketsReserved === 0) {
        if (event.itix_data && event.itix_data.Gereserveerd) {
          ticketsReserved = parseInt(event.itix_data.Gereserveerd) || 0;
        } else if (event.properties && Array.isArray(event.properties)) {
          const reservedProp = event.properties.find(p => 
            p.name && (p.name.toLowerCase().includes('gereserveerd') || 
                      p.name.toLowerCase().includes('reserved') ||
                      p.name.toLowerCase().includes('itix'))
          );
          if (reservedProp && reservedProp.value) {
            ticketsReserved = parseInt(reservedProp.value) || 0;
          }
        }
      }
      
      const availableTickets = capacity > 0 ? capacity - soldTickets : 0;
      const soldPercentage = capacity > 0 ? Math.round((soldTickets / capacity) * 100) : 0;
      
      // Haal ticketingId op uit verschillende bronnen (prioriteit: customdata > ticketingData > event.ticketing)
      const ticketingId = ticketingIdFromCustomData || ticketingData?.id || ticketingData?.ticketing_id || event.ticketing?.id || event.ticketing_id || null;
      
      // Bouw event URL voor web interface (niet API endpoint)
      // Yesplan ondersteunt geen directe links naar events via URL parameters
      // URL wordt niet gebruikt, maar behouden voor eventuele toekomstige functionaliteit
      let eventUrl = null;
      
      return {
        id: event.id,
        title: event.name || 'Geen titel',
        performer: performer,
        startDate: startTime,
        endDate: endTime,
        venue: locations,
        venueIds: venueIds,
        status: event.status?.name || event.status || 'unknown',
        bookingManager: bookingManager || null,
        capacity: capacity,
        soldTickets: soldTickets,
        availableTickets: availableTickets,
        soldPercentage: soldPercentage,
        revenue: revenue,
        ticketsReserved: ticketsReserved,
        aantalGasten: aantalGasten,
        ticketingId: ticketingId,
        // Schedule informatie
        scheduleStartTime: scheduleStartTime,
        scheduleEndTime: scheduleEndTime,
        scheduleDescription: scheduleDescription,
        scheduleStart: event.defaultschedulestart,
        scheduleEnd: event.defaultscheduleend,
        // Resources
        resources: resources,
        technicalMaterialResources: technicalMaterialResources,
        
        // Ureninfo (Uurwerk personeelsplanning)
        urenInfo: urenInfo,
        hasBalletvloer: hasBalletvloer,
        hasVleugel: hasVleugel,
        hasOrkestbak: hasOrkestbak,
        orkestbakValue: orkestbakValue || (hasOrkestbak ? 'ja' : null),
        balletvloerExplicit,
        vleugelExplicit,
        orkestbakExplicit,
        // Bijlage/rider informatie (backwards compatibility)
        riderAttachment: riderAttachment,
        // Alle documenten uit TECHNISCHE LIJST
        technicalListDocuments: technicalListDocuments,
        // Technische opmerkingen
        technicalRemarks: technicalRemarks,
        // Volledige event voor extra informatie
        rawEvent: event,
        // Event URL voor "open in yesplan" knop
        url: eventUrl,
        formattedStartDate: startTime ? format(parseISO(startTime), 'dd-MM-yyyy HH:mm') : '',
        formattedEndDate: endTime ? format(parseISO(endTime), 'dd-MM-yyyy HH:mm') : '',
        _requestedDate: event._requestedDate || null
      };
    });
    } catch (error) {
      safeLog('error', 'Error in formatEvents:', error);
      // Return lege array bij error om app niet te crashen
      return [];
    }
  }

  formatEventDetails(event) {
    const resources = this.extractResources(event);
    
    return {
      id: event.id,
      title: event.name,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      venue: event.venue,
      capacity: event.capacity,
      soldTickets: event.sold_tickets,
      revenue: event.revenue,
      status: event.status,
      categories: event.categories || [],
      artists: event.artists || [],
      pricing: event.pricing || [],
      resources: resources,
      hasBalletvloer: resources.some(r => r.toLowerCase().includes('balletvloer') || r.toLowerCase().includes('ballet')),
      hasVleugel: resources.some(r => r.toLowerCase().includes('vleugel') || r.toLowerCase().includes('piano')),
      hasOrkestbak: resources.some(r => r.toLowerCase().includes('orkestbak')),
      orkestbakValue: null
    };
  }

  // Test verbinding
  async testConnection() {
    try {
      // Test met een simpele events call
      const queryString = this.addApiKey({ limit: 1 });
      const url = queryString ? `/api/events?${queryString}` : '/api/events';
      
      const response = await this.client.get(url);
      return {
        success: true,
        message: 'Verbinding succesvol'
      };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return {
            success: false,
            message: 'API key is ongeldig'
          };
        } else if (error.response.status === 403) {
          return {
            success: false,
            message: 'Geen toegang met deze API key'
          };
        }
      }
      return {
        success: false,
        message: `Verbindingsfout: ${error.message}`
      };
    }
  }
}

module.exports = YesplanAPI;

