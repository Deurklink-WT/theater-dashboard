/**
 * Shift Happens - Theater Dashboard
 * Copyright (c) 2026 PdV
 * 
 * Proprietary software - All rights reserved
 * 
 * @author PdV
 * @license UNLICENSED
 */

// Vertalingen (i18n)
const TRANSLATIONS = {
    nl: {
        settings: { colorMode: 'Kleurmodus', language: 'Taal', title: 'Instellingen', save: 'Opslaan', saved: 'Instellingen opgeslagen!', theme: 'Thema', timezoneMode: 'Tijd', timezoneAuto: 'Automatisch', timezoneManual: 'Handmatig', timezoneSelect: 'Handmatige tijdzone', manualTime: 'Handmatige tijd', touchscreenMode: 'Touchscreen-modus', touchscreenModeHint: 'Grotere scrollbalk en grotere tikgebieden voor gebruik op aanraakschermen (bijv. Raspberry Pi-kiosk).', showMode: 'Showmodus', showModeHint: 'Geeft toegang tot de voorstellingtimer en later meer toneelfuncties. Zet uit als je alleen de planning bekijkt.', ioTitle: 'In/Uit', ioHint: 'Kies per protocol welke netwerkinterface gebruikt wordt. Dezelfde interface mag meerdere keren gekozen worden.', interfaceInternet: 'Internet / API verkeer', interfaceLuminex: 'Luminex uitlezen', interfaceSacn: 'sACN scan', interfaceOsc: 'OSC listener', interfaceAuto: 'Automatisch (OS standaard)', venueOrder: 'Zaalvolgorde', venueOrderHint: 'Sleep de zalen om de volgorde aan te passen. Klik op het oog om een zaal te verbergen in de zaal-dropdown.', resetVenueOrder: 'Reset naar standaard', techOptions: 'Technische opties per zaal', techOptionsHint: 'Kies per zaal welke opties (balletvloer, vleugel, orkestbak, zaalplattegrond) getoond worden.', yesplan: 'Yesplan', activeOrg: 'Actieve organisatie', activeOrgHint: 'Bepaal welke Yesplan-organisatie het dashboard gebruikt', org1: 'Organisatie 1', org2: 'Organisatie 2', orgN: 'Organisatie {n}', bothOrgs: 'Beide organisaties', name: 'Naam', shortName: 'Afkorting', baseURL: 'Base URL', apiKey: 'API Key', loadVenues: 'Laad Zalen', loadVenuesHint: 'Haalt zalen op voor zaalvolgorde en header', loadVenuesFullHint: 'Vul per organisatie Base URL en API Key in, klik op "Laad Zalen"', testConnection: 'Test Verbinding', about: 'Over deze app', showVenue: 'Zaal tonen', hideVenue: 'Zaal verbergen', balletvloer: 'Balletvloer', vleugel: 'Vleugel', orkestbak: 'Orkestbak', itix: 'Itix', itixBaseURL: 'Basis-URL zaalplattegrond', itixBaseURLHint: 'Voer het voorvoegsel van de beheer-URL voor de zaalplattegrond in, eindigend vóór het uitvoerings-id (Yesplan-event-id). Voorbeeld: https://tickets.jouworganisatie.nl/beheer/zaalplattegrond/uitvoeringinfo' },
        status: { online: 'Online', offline: 'Offline', deels: 'Deels bereikbaar', warning: 'Waarschuwing', systemStatus: 'Systeemstatus', clickForStatus: 'Klik voor systeemstatus', apiServerLabel: 'API-server', apiServerNotSet: 'Niet ingesteld' },
        nav: { back: 'Terug', backTitle: 'Terug naar vorig scherm', home: 'Home', weekView: 'Weekoverzicht', voorstellingTimer: 'Voorstelling timer', luminex: 'Luminex matrix', techOverview: 'Technisch overzicht', techOverviewTitle: 'Print technisch overzicht voor deze dag (alle zalen)', prevDay: 'Vorige dag', nextDay: 'Volgende dag', refresh: 'Vernieuwen', searchEvent: 'Zoek evenement', searchEventTitle: 'Zoek op evenementnaam (* en ? als wildcard)' },
        search: { placeholder: 'Evenementnaam… (* = alles, ? = één teken)', wildcardHint: 'Gebruik * voor een reeks tekens en ? voor één teken.' },
        date: { today: 'Vandaag', chooseDate: 'Kies eigen datum', selectDate: 'Selecteer datum:', manualDate: 'Of voer handmatig in (dd-mm-jjjj):', datePlaceholder: 'dd-mm-jjjj', confirm: 'Bevestigen', cancel: 'Annuleren' },
        venue: { allVenues: 'Alle zalen', venue: 'Zaal', unknownVenue: 'Onbekende zaal', venueCount: '{n} zalen', venueId: 'Zaal {id}' },
        filters: { title: 'Filters', hideCancelled: 'Verberg geannuleerde voorstellingen', technischPersoneel: 'Alleen evenementen met technisch personeel', technischeResources: 'Alleen evenementen met technische resources' },
        weekView: { title: 'Weekoverzicht', sortByVenue: 'Op zaal', sortByVenueTitle: 'Sorteren op zaal (instellingen volgorde)', sortByTime: 'Op tijd', sortByTimeTitle: 'Sorteren op tijd', eventsSingle: '{n} evenement', eventsPlural: '{n} evenementen', filtersPrefix: 'Filters', filterNone: 'geen actief', filterHideCancelled: 'geannuleerd verborgen', filterTechnischPersoneel: 'technisch personeel', filterTechnischeResources: 'technische resources' },
        cards: { yesplan: 'Yesplan', personnel: 'Personeel', itix: 'Verkoop', priva: 'Priva - Klimaat', tijdschema: 'Tijdschema', seatingPlan: 'Zaalplattegrond', openSeatingPlan: 'Open zaalplattegrond' },
        personnel: { techniek: 'Techniek', horeca: 'Horeca', frontOffice: 'Front Office' },
        dataStats: { capaciteit: 'Capaciteit', verkocht: 'Verkocht', gereserveerd: 'Gereserveerd', beschikbaar: 'Beschikbaar', omzet: 'Omzet', gasten: 'Gasten', totaal: 'Totaal', transacties: 'Transacties', omzetEur: 'Omzet (€)', temp: 'Temperatuur', luchtvochtigheid: 'Luchtvochtigheid', luchtkwaliteit: 'Luchtkwaliteit', co2: 'CO₂' },
        tech: { materiaal: 'Technisch materiaal:', lijst: 'Technische lijst:', lijstBijlage: 'Technische lijst bijlage:' },
        resources: { ja: 'ja', nee: 'nee', nietBekend: 'niet ingevuld' },
        loading: 'Laden...',
        messages: { noEvents: 'Geen evenementen gevonden voor {venue} op {date}', noEventsDate: 'Geen evenementen gevonden op {date}', noEventsWeek: 'Geen evenementen in deze week voor {venue}.', selectDayVenueTijdschema: 'Selecteer 1 dag en 1 zaal om het tijdschema te zien.', noTijdschema: 'Geen tijdschema beschikbaar voor deze evenementen.', noPlanning: 'Geen planning beschikbaar voor deze dag', noVerkoop: 'Geen verkoopdata beschikbaar voor deze dag', noKlimaat: 'Geen klimaatdata beschikbaar', venueOrderReset: 'Zaalvolgorde gereset naar standaard', loadVenuesFirst: 'Laad eerst zalen in de Yesplan instellingen.', venuesLoaded: '{n} zalen geladen', configureBothOrgs: 'Configureer eerst beide organisaties voor "Beide"', fillBaseUrlApiKey: 'Vul eerst Base URL en API Key in voor organisatie {n}', secureStorageUnavailable: 'Veilige opslag voor API-keys is niet beschikbaar op dit systeem. Stel eerst een keychain/secret-service in.', seatingPlanUnavailable: 'Geen zaalplattegrond beschikbaar', seatingPlanNoBase: 'Stel onder Instellingen → Itix de basis-URL voor de zaalplattegrond in.' },
        techPrint: { title: 'Technisch overzicht', subtitle: 'Alle zalen – {date}', noEvents: 'Geen evenementen op deze dag.', venue: 'Zaal', time: 'Tijd', remarks: 'Opmerkingen techniek', documents: 'Technische lijst documenten', filterTitle: 'Evenementen voor print', filterHint: 'Vink de evenementen aan die in het overzicht moeten komen.', selectAll: 'Alles selecteren', deselectAll: 'Alles deselecteren' },
        errors: { yesplanLoad: 'Kon Yesplan data niet laden', eventsLoad: 'Kon evenementen niet laden', weekLoad: 'Kon weekoverzicht niet laden', uurwerkLoad: 'Kon personeelsplanning niet laden', itixLoad: 'Kon Itix data niet laden', privaLoad: 'Kon Priva data niet laden', settingsSave: 'Kon instellingen niet opslaan', apiServerInvalid: 'Ongeldige API-server-URL. Gebruik bijvoorbeeld http://192.168.1.10:3847', apiServerWrongKind: 'Server-URL is voor de Shift Happens API (poort 3847), niet voor Yesplan of de Itix-zaalplattegrond. Vul Yesplan/Itix verderop in dit formulier in.' },
        test: { testing: 'Testen...', success: 'Succesvol', failed: 'Gefaald' },
        updates: {
            sectionTitle: 'Updates (desktop)',
            hint: 'Alleen actief in de geïnstalleerde app. Met npm start (ontwikkeling) is er geen automatische update.',
            checkNow: 'Nu controleren op updates',
            devNoop: 'Ontwikkelingsmodus: geen update-check (test met de geïnstalleerde app).',
            disabled: 'Updates uit (SKIP_AUTO_UPDATE).',
            okAvailable: 'Update beschikbaar: {v}',
            okUptodate: 'Je hebt de nieuwste versie.',
            checkFailed: 'Controleren mislukt: {msg}',
            checking: 'Bezig met controleren…'
        },
        updatesBanner: {
            checking: 'Zoeken naar updates…',
            available: 'Update {v} — tik om te downloaden',
            downloading: 'Downloaden {n}%',
            restart: 'Klaar — tik om te herstarten en te installeren',
            uptodate: 'Je hebt de nieuwste versie.',
            privateRepo: 'Updates niet bereikbaar (private repo? Token of UPDATE_BASE_URL nodig — zie docs/UPDATES.md).',
            manualInstall: 'Update gedownload, maar automatische installatie is geblokkeerd. Klik hier voor handmatige installatie.'
        },
        voorstellingTimer: {
            title: 'Voorstelling timer',
            stopwatch: 'Verstreken tijd',
            logTitle: 'Geregistreerde tijdstippen',
            scheduleHeading: 'Tijdschema (Yesplan)',
            replaceTitle: 'Stap opnieuw registreren',
            replaceBody: 'Er is al een tijdstip voor “{step}” ({slot}). Pas hieronder alleen de kloktijd aan; de timer wordt daarna automatisch opnieuw berekend.',
            replaceCorrectClockLabel: 'Gecorrigeerde kloktijd',
            replaceCorrectClockHint: 'Standaard: huidige tijd. Gebruik uu:mm of uu:mm:ss.',
            replacePreviousRegistration: 'Eerdere registratie: {clock} · {elapsed}',
            replaceInvalidClock: 'Ongeldige tijd.',
            replaceRemarkLabel: 'Opmerking',
            replaceRemarkPlaceholder: 'Typ hier je opmerking...',
            replaceAddRemark: 'Opmerking plaatsen',
            replaceEmptyRemark: 'Vul eerst een opmerking in.',
            remarkEditTitle: 'Opmerking aanpassen',
            remarkDelete: 'Verwijderen',
            remarkSave: 'Opslaan',
            slotOchtend: 'Ochtend',
            slotMiddag: 'Middag',
            slotAvond: 'Avond',
            slotAlledag: 'Dag',
            replaceConfirm: 'Tijd aanpassen',
            replaceCancel: 'Annuleren',
            replaceReset: 'Reset stap',
            noSchedule: 'Geen tijdschema beschikbaar voor de timer.',
            notAvailable: 'Timer is alleen beschikbaar bij één voorstelling op deze dag en zaal, met een geladen tijdschema.',
            buttonDisabledHint: 'Niet beschikbaar: kies één zaal en zorg dat het tijdschema geladen is (geen “Geen tijdschema…” op de kaart).',
            pickPerformanceHint: 'Kies een voorstelling om de timer te openen',
            pickPerformanceHeading: 'Voorstelling kiezen',
            pickPerformanceSub: 'Voorstellingen op de geselecteerde dag in de agenda.',
            pickPerformanceLoading: 'Voorstellingen laden…',
            pickPerformanceEmpty: 'Geen voorstellingen op deze dag.',
            pickPerformanceLoadError: 'Kon de voorstellingen niet laden.',
            exportTitle: 'Timer exporteren',
            exportHeading: 'Voorstellings verslag',
            exportNoData: 'Geen timerregistraties of opmerkingen om te exporteren.',
            exportPrintedAt: 'Geprint op {time}',
            exportStep: 'Stap',
            exportRemark: 'Opmerking',
            exportSubtotals: 'Subtotalen',
            exportPauseTotal: 'Pauzes totaal',
            exportTotalWithPauses: 'Totale tijd incl. pauzes',
            exportVenue: 'Zaal',
            exportTechCrew: 'Techniek',
            exportHorecaCrew: 'Horeca',
            exportFrontOfficeCrew: 'Front Office',
            steps: {
                deuren_open: 'Deuren open',
                vijf_voor_aanvang: '5 min voor aanvang',
                aanvang: 'Aanvang',
                vijf_voor_pauze: '5 min voor pauze',
                pauze: 'Pauze',
                vijf_voor_tweede_deel: '5 min aanvang 2e deel',
                aanvang_tweede_deel: 'Aanvang 2e deel',
                vijf_voor_einde: '5 min einde voorstelling',
                einde: 'Einde voorstelling'
            },
            pauseDurationLabel: 'Pauzeduur (min)',
            pauseRemainingLabel: 'Pauze resterend',
            auxClockUntilFirstAct: 'Tot 1e acte',
            auxClockPauseRemaining: 'Pauze resterend',
            auxClockActTimer: '{act} acte',
            auxClockTotalRunning: 'Speelduur (lopend)',
            auxClockTotalFinal: 'Speelduur (totaal)',
            auxClockNoAnchor: 'Timer',
            columnEditTitle: 'Kolom bewerken',
            columnEditSave: 'Opslaan',
            columnEditCancel: 'Annuleren',
            columnEditAddCustom: 'Vrije knop',
            columnEditAddBuiltin: 'Standaardstap toevoegen…',
            columnEditMoveUp: 'Omhoog',
            columnEditMoveDown: 'Omlaag',
            columnEditRemove: 'Verwijderen uit lijst',
            columnEditPromptLabel: 'Label voor de nieuwe knop:',
            columnEditAddCustomModalTitle: 'Vrije knop toevoegen',
            columnEditConfirmAdd: 'Toevoegen',
            columnEditEmptyLabel: 'Vul een label in.',
            columnEditDrag: 'Sleep om te herschikken'
        },
        luminex: {
            title: 'Luminex',
            subtitle: 'Het flowschema toont de route via de process engine. Waar de LumiNode-API routing teruggeeft, tekenen we die lijnen; anders gelden je opgeslagen verbindingen. sACN-scan vult live bronnen aan.',
            compactLead: 'Bij openen halen we engines en I/O van de node op. Je ziet meteen het patchschema (bron → engine → uitgang). sACN-scan is optioneel voor live namen.',
            inputsTitle: 'Bronnen',
            outputsTitle: 'Uitgangen',
            engineColumnTitle: 'Process engine',
            engineHubLabel: 'Routing',
            deviceSourceLabel: 'Universe (node)',
            enginePlaceholder: 'Engine',
            portIn: 'In {n}',
            portOut: 'Uit {n}',
            sacnHeading: 'sACN — actieve bronnen',
            sacnToolbarLabel: 'sACN',
            sacnHint: 'Luistert op multicast (poort 5568) binnen het ingestelde bereik. Scan om te zien welke universes actief zijn.',
            sacnFrom: 'Van',
            sacnTo: 'Tot',
            sacnScanBtn: 'Scan sACN',
            sacnScanning: 'sACN scannen…',
            sacnDone: '{n} actieve universe(s).',
            sacnDoneUniversesAndSources: '{u} universe(s), {s} actieve sACN-bron(nen).',
            sacnEmpty: 'Geen sACN-frames in dit bereik en tijdvenster.',
            sacnScanMeta: 'Universes {min}–{max} · scan {sec}s',
            sacnScanMetaIface: ' · multicast op {iface}',
            sacnSocketWarning: 'Netwerk/socket: {detail}',
            sacnError: 'sACN-scan mislukt: {msg}',
            sacnMixedExplain:
                'Blokken uit de LumiNode zijn geconfigureerde bronnen (vaak 1–4). De scan telt alleen streams die tijdens het scanvenster op dit netwerk binnenkomen — tik «Scan sACN» opnieuw terwijl je zendt als een universe ontbreekt.',
            notSeenInScanShort: 'Niet gezien in laatste scan',
            sourceLanOnly: 'Alleen op netwerk (staat nog niet in LumiNode-bronnen)',
            sacnPick: 'Gebruik als bron',
            flowReminder: 'Het signaal loopt altijd via de process engine uit stap 2: bron → engine → uitgang.',
            flowReminderShort: 'Bron → process engine → uitgang',
            step1Title: 'Stap 1 — LumiNode',
            step1Hint: 'Zoek het apparaat of vul het IP in en sla op — dan kan de app met je LumiNode praten.',
            step2Title: 'Stap 2 — Process engine',
            step2Hint: 'Elke route gaat door een process engine. Haal engines en uitgangen op en kies welke engine bij deze patch hoort.',
            step3Title: 'Stap 3 — Bron naar uitgang',
            step3Hint: 'Scan sACN, sleep verbindingen naar een uitgang, en bewaar. Dit hoort bij de gekozen engine.',
            routingFooterHint: 'Sla process engine en patch lokaal op (dashboard). Volledige device-instellingen blijven via de LumiNode-webinterface.',
            saveRouteRequiresEngine: 'Kies eerst een process engine in de lijst (of vernieuw engines & I/O als de lijst leeg is).',
            lumiNodeHeading: 'LumiNode',
            discoverBtn: 'Zoek LumiNode (mDNS)',
            discovering: 'Zoeken op het netwerk…',
            discoverDone: '{n} apparaat(en) gevonden.',
            discoverEmpty: 'Geen LumiNode via mDNS gevonden. Controleer netwerk of vul handmatig het IP in.',
            discoverError: 'Zoeken mislukt: {msg}',
            discoverUnavailable: 'Alleen in de desktop-app (Electron).',
            hostLabel: 'LumiNode IP',
            passwordLabel: 'Wachtwoord (optioneel)',
            saveHost: 'Opslaan',
            hostSaved: 'Verbinding opgeslagen.',
            pickDevice: 'Kies',
            routingHeading: 'Route naar process engine',
            routingHint: 'Kies de process engine voor je patch en bewaar lokaal. Volledige device-configuratie via de LumiNode-webinterface.',
            visualPatchHeading: 'Je patch',
            visualPatchHint: 'Sleep van een bron naar een uitgang. Op de node loopt het signaal via de gekozen process engine. Tik op een lijn om hem te verwijderen.',
            emptyInputsHint: 'Geen bronnen in dit bereik: verruim het sACN-bereik en tik op «Scan sACN», of wacht tot er DMX/sACN binnenkomt.',
            dragHint:
                'Sleep vanaf de ronde poort naar een uitgang (links), of los op het process engine-blok voor de dichtstbijzijnde uitgang.',
            dragCanvasHint: 'Sleep een blok om het vrij te positioneren; de layout wordt lokaal bewaard.',
            sourceNetworkLine: 'Netwerk',
            matrixConnectionsStatus: '{n} verbinding(en) in de patch.',
            routeSource: 'Brons (sACN universe)',
            routeSourceManual: 'Of handmatig #',
            routeEngine: 'Process engine',
            mergeHint:
                'Meerdere sACN-universes naar dezelfde process engine worden op de LumiNode samengevoegd (merge). Standaard zet je daar vaak HTP (highest takes precedence) in de webinterface van de node. We proberen de koppelingen van de node uit de API te tonen; als dat niet lukt, zie je je lokaal opgeslagen patch. De merge-modus zelf staat op het apparaat, niet in dit dashboard.',
            sacnMergeEngineBadge:
                'sACN na merge (process engine → dit universe)',
            mergeLine: '{mode} {universes}',
            mergeLineModeOnly: '{mode}',
            syncSourcesError: 'Bronnen niet gelezen: {detail}',
            syncSourcesCountMismatch:
                'Zelfde aantal bron-universes op de node als in de patch nodig ({current} op device, {desired} in patch). Pas aan in de webinterface of voeg/verwijder verbindingen.',
            syncSourcesPutError: 'Bronnen niet weggeschreven: {detail}',
            syncSourcesOk: 'Patch gesynchroniseerd met LumiNode.',
            syncSourcesNoIo: 'Geen sACN-invoer-I/O voor universe {u} op de node — voeg die toe in de webinterface.',
            syncSourcesReadOnly:
                'API weigerde bronnen-wijziging; op veel LumiNodes gaat alleen universe-wissel via pipeline/sources of de webinterface. Controleer of universe 6 als invoer bestaat.',
            syncNeedsCapabilities: 'Tik eerst op «Vernieuw engines & I/O» — dan kan de app naar de node schrijven.',
            syncSourcesWorking: 'Bezig met synchroniseren naar LumiNode…',
            syncToNode: 'Push naar LumiNode',
            syncSourcesNoChange: 'LumiNode had al dezelfde bron-universes als je patch — geen schrijfactie nodig.',
            showAllOutputsLabel: 'Toon alle uitgangen (ook zonder patch)',
            routeOutput: 'Uitgang',
            fetchCapabilities: 'Vernieuw engines & I/O',
            fetchCapLoading: 'Laden van LumiNode…',
            fetchCapDone: 'Data geladen.',
            fetchCapError: 'LumiNode API: {msg}',
            openWebUi: 'Open webinterface',
            saveRoute: 'Bewaar route',
            routeSaved: 'Route opgeslagen (lokaal).',
            outputDmx: 'DMX {n}',
            outputFallback: 'Configureer uitgang in webinterface'
        }
    },
    en: {
        settings: { colorMode: 'Color mode', language: 'Language', title: 'Settings', save: 'Save', saved: 'Settings saved!', theme: 'Theme', timezoneMode: 'Time', timezoneAuto: 'Automatic', timezoneManual: 'Manual', timezoneSelect: 'Manual time zone', manualTime: 'Manual time', touchscreenMode: 'Touchscreen mode', touchscreenModeHint: 'Larger scrollbar and tap targets for use on touchscreens (e.g. Raspberry Pi kiosk).', showMode: 'Show mode', showModeHint: 'Enables the performance timer and future show features. Turn off if you only read the schedule.', ioTitle: 'In/Out', ioHint: 'Choose which network interface each protocol should use. The same interface can be selected multiple times.', interfaceInternet: 'Internet / API traffic', interfaceLuminex: 'Luminex readout', interfaceSacn: 'sACN scan', interfaceOsc: 'OSC listener', interfaceAuto: 'Automatic (OS default)', venueOrder: 'Venue order', venueOrderHint: 'Drag venues to change the order. Click the eye to hide a venue in the venue dropdown.', resetVenueOrder: 'Reset to default', techOptions: 'Technical options per venue', techOptionsHint: 'Choose per venue which options (dance floor, grand piano, orchestra pit, seating plan) are shown.', yesplan: 'Yesplan', activeOrg: 'Active organisation', activeOrgHint: 'Determine which Yesplan organisation the dashboard uses', org1: 'Organisation 1', org2: 'Organisation 2', orgN: 'Organisation {n}', bothOrgs: 'Both organisations', name: 'Name', shortName: 'Abbreviation', baseURL: 'Base URL', apiKey: 'API Key', loadVenues: 'Load Venues', loadVenuesHint: 'Fetches venues for order and header', loadVenuesFullHint: 'Enter Base URL and API Key per organisation, click "Load Venues"', testConnection: 'Test Connection', about: 'About this app', showVenue: 'Show venue', hideVenue: 'Hide venue', balletvloer: 'Dance floor', vleugel: 'Grand piano', orkestbak: 'Orchestra pit', itix: 'Itix', itixBaseURL: 'Seating plan base URL', itixBaseURLHint: 'Enter the admin URL prefix for the seating plan, ending before the performance id (Yesplan event id). Example: https://tickets.example.com/beheer/zaalplattegrond/uitvoeringinfo' },
        status: { online: 'Online', offline: 'Offline', deels: 'Partially available', warning: 'Warning', systemStatus: 'System status', clickForStatus: 'Click for system status', apiServerLabel: 'API server', apiServerNotSet: 'Not configured' },
        nav: { back: 'Back', backTitle: 'Back to previous screen', home: 'Home', weekView: 'Week overview', voorstellingTimer: 'Performance timer', luminex: 'Luminex matrix', techOverview: 'Technical overview', techOverviewTitle: 'Print technical overview for this day (all venues)', prevDay: 'Previous day', nextDay: 'Next day', refresh: 'Refresh', searchEvent: 'Search event', searchEventTitle: 'Search by event name (* and ? as wildcards)' },
        search: { placeholder: 'Event name… (* = any, ? = one character)', wildcardHint: 'Use * for any characters and ? for one character.' },
        date: { today: 'Today', chooseDate: 'Choose date', selectDate: 'Select date:', manualDate: 'Or enter manually (dd-mm-yyyy):', datePlaceholder: 'dd-mm-yyyy', confirm: 'Confirm', cancel: 'Cancel' },
        venue: { allVenues: 'All venues', venue: 'Venue', unknownVenue: 'Unknown venue', venueCount: '{n} venues', venueId: 'Venue {id}' },
        filters: { title: 'Filters', hideCancelled: 'Hide cancelled performances', technischPersoneel: 'Only events with technical staff', technischeResources: 'Only events with technical resources' },
        weekView: { title: 'Week overview', sortByVenue: 'By venue', sortByVenueTitle: 'Sort by venue (settings order)', sortByTime: 'By time', sortByTimeTitle: 'Sort by time', eventsSingle: '{n} event', eventsPlural: '{n} events', filtersPrefix: 'Filters', filterNone: 'none active', filterHideCancelled: 'cancelled hidden', filterTechnischPersoneel: 'technical staff', filterTechnischeResources: 'technical resources' },
        cards: { yesplan: 'Yesplan', personnel: 'Personnel', itix: 'Sales', priva: 'Priva - Climate', tijdschema: 'Schedule', seatingPlan: 'Seating plan', openSeatingPlan: 'Open seating plan' },
        personnel: { techniek: 'Technical', horeca: 'Catering', frontOffice: 'Front Office' },
        dataStats: { capaciteit: 'Capacity', verkocht: 'Sold', gereserveerd: 'Reserved', beschikbaar: 'Available', omzet: 'Revenue', gasten: 'Guests', totaal: 'Total', transacties: 'Transactions', omzetEur: 'Revenue (€)', temp: 'Temperature', luchtvochtigheid: 'Humidity', luchtkwaliteit: 'Air quality', co2: 'CO₂' },
        tech: { materiaal: 'Technical equipment:', lijst: 'Technical list:', lijstBijlage: 'Technical list attachment:' },
        resources: { ja: 'yes', nee: 'no', nietBekend: 'not filled in' },
        loading: 'Loading...',
        messages: { noEvents: 'No events found for {venue} on {date}', noEventsDate: 'No events found on {date}', noEventsWeek: 'No events this week for {venue}.', selectDayVenueTijdschema: 'Select 1 day and 1 venue to see the schedule.', noTijdschema: 'No schedule available for these events.', noPlanning: 'No schedule available for this day', noVerkoop: 'No sales data available for this day', noKlimaat: 'No climate data available', venueOrderReset: 'Venue order reset to default', loadVenuesFirst: 'Load venues first in Yesplan settings.', venuesLoaded: '{n} venues loaded', configureBothOrgs: 'Configure both organisations first for "Both"', fillBaseUrlApiKey: 'Enter Base URL and API Key first for organisation {n}', secureStorageUnavailable: 'Secure API-key storage is unavailable on this system. Configure a keychain/secret service first.', seatingPlanUnavailable: 'No seating plan available', seatingPlanNoBase: 'Set the seating plan base URL under Settings → Itix.' },
        techPrint: { title: 'Technical overview', subtitle: 'All venues – {date}', noEvents: 'No events on this day.', venue: 'Venue', time: 'Time', remarks: 'Technical remarks', documents: 'Technical list documents', filterTitle: 'Events for print', filterHint: 'Select which events to include in the overview.', selectAll: 'Select all', deselectAll: 'Deselect all' },
        errors: { yesplanLoad: 'Could not load Yesplan data', eventsLoad: 'Could not load events', weekLoad: 'Could not load week overview', uurwerkLoad: 'Could not load personnel planning', itixLoad: 'Could not load Itix data', privaLoad: 'Could not load Priva data', settingsSave: 'Could not save settings', apiServerInvalid: 'Invalid API server URL. Example: http://192.168.1.10:3847', apiServerWrongKind: 'This field is for the Shift Happens API server (port 3847), not Yesplan or the Itix seating URL. Use Yesplan/Itix sections below.' },
        test: { testing: 'Testing...', success: 'Success', failed: 'Failed' },
        updates: {
            sectionTitle: 'Updates (desktop)',
            hint: 'Only active in the installed app. There is no auto-update when using npm start (development).',
            checkNow: 'Check for updates now',
            devNoop: 'Development mode: no update check (use the installed app to test updates).',
            disabled: 'Updates disabled (SKIP_AUTO_UPDATE).',
            okAvailable: 'Update available: {v}',
            okUptodate: 'You are on the latest version.',
            checkFailed: 'Check failed: {msg}',
            checking: 'Checking…'
        },
        updatesBanner: {
            checking: 'Checking for updates…',
            available: 'Update {v} — tap to download',
            downloading: 'Downloading {n}%',
            restart: 'Ready — click to restart and install',
            uptodate: 'You are on the latest version.',
            privateRepo: 'Updates unavailable (private repo? Token or UPDATE_BASE_URL needed — see docs/UPDATES.md).',
            manualInstall: 'Update downloaded, but auto-install is blocked. Click here for manual installation.'
        },
        voorstellingTimer: {
            title: 'Performance timer',
            stopwatch: 'Elapsed time',
            logTitle: 'Recorded timestamps',
            scheduleHeading: 'Schedule (Yesplan)',
            replaceTitle: 'Register step again',
            replaceBody: 'There is already a timestamp for “{step}” ({slot}). Adjust the clock time only; the timer is recalculated automatically after confirming.',
            replaceCorrectClockLabel: 'Corrected clock time',
            replaceCorrectClockHint: 'Defaults to current time. Use hh:mm or hh:mm:ss.',
            replacePreviousRegistration: 'Previous entry: {clock} · {elapsed}',
            replaceInvalidClock: 'Invalid time.',
            replaceRemarkLabel: 'Remark',
            replaceRemarkPlaceholder: 'Type your remark here...',
            replaceAddRemark: 'Add remark',
            replaceEmptyRemark: 'Enter a remark first.',
            remarkEditTitle: 'Edit remark',
            remarkDelete: 'Delete',
            remarkSave: 'Save',
            slotOchtend: 'Morning',
            slotMiddag: 'Afternoon',
            slotAvond: 'Evening',
            slotAlledag: 'Day',
            replaceConfirm: 'Adjust time',
            replaceCancel: 'Cancel',
            replaceReset: 'Reset step',
            noSchedule: 'No schedule available for the timer.',
            notAvailable: 'The timer is only available for a single performance on this day and venue, with a loaded schedule.',
            buttonDisabledHint: 'Unavailable: pick one venue and ensure the schedule has loaded (not “No schedule…” on the card).',
            pickPerformanceHint: 'Choose a performance to open the timer',
            pickPerformanceHeading: 'Choose performance',
            pickPerformanceSub: 'Performances on the selected day.',
            pickPerformanceLoading: 'Loading performances…',
            pickPerformanceEmpty: 'No performances on this day.',
            pickPerformanceLoadError: 'Could not load performances.',
            exportTitle: 'Export timer',
            exportHeading: 'Performance report',
            exportNoData: 'No timer marks or remarks to export.',
            exportPrintedAt: 'Printed at {time}',
            exportStep: 'Step',
            exportRemark: 'Remark',
            exportSubtotals: 'Subtotals',
            exportPauseTotal: 'Pauses total',
            exportTotalWithPauses: 'Total time incl. pauses',
            exportVenue: 'Venue',
            exportTechCrew: 'Technical crew',
            exportHorecaCrew: 'Catering crew',
            exportFrontOfficeCrew: 'Front Office',
            steps: {
                deuren_open: 'Doors open',
                vijf_voor_aanvang: '5 min before start',
                aanvang: 'Start',
                vijf_voor_pauze: '5 min before interval',
                pauze: 'Interval',
                vijf_voor_tweede_deel: '5 min before act 2',
                aanvang_tweede_deel: 'Act 2 starts',
                vijf_voor_einde: '5 min before end',
                einde: 'End'
            },
            pauseDurationLabel: 'Interval length (min)',
            pauseRemainingLabel: 'Interval remaining',
            auxClockUntilFirstAct: 'Until 1st act',
            auxClockPauseRemaining: 'Interval remaining',
            auxClockActTimer: '{act} act',
            auxClockTotalRunning: 'Running time',
            auxClockTotalFinal: 'Total running time',
            auxClockNoAnchor: 'Timer',
            columnEditTitle: 'Edit column',
            columnEditSave: 'Save',
            columnEditCancel: 'Cancel',
            columnEditAddCustom: 'Custom button',
            columnEditAddBuiltin: 'Add standard step…',
            columnEditMoveUp: 'Up',
            columnEditMoveDown: 'Down',
            columnEditRemove: 'Remove from list',
            columnEditPromptLabel: 'Label for the new button:',
            columnEditAddCustomModalTitle: 'Add custom button',
            columnEditConfirmAdd: 'Add',
            columnEditEmptyLabel: 'Enter a label.',
            columnEditDrag: 'Drag to reorder'
        },
        luminex: {
            title: 'Luminex',
            subtitle: 'The flow shows traffic via the process engine. When the LumiNode API exposes routing, we draw those lines; otherwise your saved connections apply. sACN scan adds live sources.',
            compactLead: 'On open we load engines and I/O from the node so you immediately see the patch (source → engine → output). sACN scan is optional for live names.',
            inputsTitle: 'Sources',
            outputsTitle: 'Outputs',
            engineColumnTitle: 'Process engine',
            engineHubLabel: 'Routing',
            deviceSourceLabel: 'Universe (node)',
            enginePlaceholder: 'Engine',
            portIn: 'In {n}',
            portOut: 'Out {n}',
            sacnHeading: 'sACN — active sources',
            sacnToolbarLabel: 'sACN',
            sacnHint: 'Listens on multicast (port 5568) within the range. Scan to see which universes are active.',
            sacnFrom: 'From',
            sacnTo: 'To',
            sacnScanBtn: 'Scan sACN',
            sacnScanning: 'Scanning sACN…',
            sacnDone: '{n} active universe(s).',
            sacnDoneUniversesAndSources: '{u} universe(s), {s} active sACN source(s).',
            sacnEmpty: 'No sACN frames in this range and time window.',
            sacnScanMeta: 'Universes {min}–{max} · scan {sec}s',
            sacnScanMetaIface: ' · multicast on {iface}',
            sacnSocketWarning: 'Network/socket: {detail}',
            sacnError: 'sACN scan failed: {msg}',
            sacnMixedExplain:
                'Blocks from the LumiNode are configured sources (often 1–4). The scan only counts streams received on this network during the scan window — tap «Scan sACN» again while transmitting if a universe is missing.',
            notSeenInScanShort: 'Not seen in last scan',
            sourceLanOnly: 'On network only (not in LumiNode sources yet)',
            sacnPick: 'Use as source',
            flowReminder: 'Signal always goes through the process engine from step 2: source → engine → output.',
            flowReminderShort: 'Source → process engine → output',
            step1Title: 'Step 1 — LumiNode',
            step1Hint: 'Find the device or enter its IP and save — so the app can talk to your LumiNode.',
            step2Title: 'Step 2 — Process engine',
            step2Hint: 'Every route goes through a process engine. Load engines and outputs, then pick which engine this patch uses.',
            step3Title: 'Step 3 — Source to output',
            step3Hint: 'Scan sACN, drag connections to an output, then save. This belongs to the engine you chose.',
            routingFooterHint: 'Save process engine and patch locally (dashboard). Full device configuration stays in the LumiNode web UI.',
            saveRouteRequiresEngine: 'Pick a process engine from the list first (or refresh engines & I/O if the list is empty).',
            lumiNodeHeading: 'LumiNode',
            discoverBtn: 'Find LumiNode (mDNS)',
            discovering: 'Searching the network…',
            discoverDone: 'Found {n} device(s).',
            discoverEmpty: 'No LumiNode found via mDNS. Check the network or enter the IP manually.',
            discoverError: 'Search failed: {msg}',
            discoverUnavailable: 'Desktop app (Electron) only.',
            hostLabel: 'LumiNode IP',
            passwordLabel: 'Password (optional)',
            saveHost: 'Save',
            hostSaved: 'Connection saved.',
            pickDevice: 'Select',
            routingHeading: 'Route to process engine',
            routingHint: 'Choose the process engine for your patch and save locally. Full device configuration remains in the LumiNode web UI.',
            visualPatchHeading: 'Your patch',
            visualPatchHint: 'Drag from a source to an output. On the device the signal goes through the selected process engine. Click a line to remove it.',
            emptyInputsHint: 'No sources in this range: widen the sACN range and tap «Scan sACN», or wait for DMX/sACN traffic.',
            dragHint:
                'Drag from the round port on the right of a source to an output (left port). You can also release on the process engine block to pick the nearest output.',
            dragCanvasHint: 'Drag a block to place it freely; layout is saved locally.',
            sourceNetworkLine: 'Network',
            matrixConnectionsStatus: '{n} connection(s) in the patch.',
            routeSource: 'Source (sACN universe)',
            routeSourceManual: 'Or manual #',
            routeEngine: 'Process engine',
            mergeHint:
                'Multiple sACN universes into the same process engine are merged on the LumiNode. HTP (highest takes precedence) is usually set in the device web UI. We try to show links from the device API; if that fails, you see your locally saved patch. Merge mode itself lives on the hardware, not the dashboard.',
            sacnMergeEngineBadge: 'sACN after merge (process engine → this universe)',
            mergeLine: '{mode} {universes}',
            mergeLineModeOnly: '{mode}',
            syncSourcesError: 'Could not read sources: {detail}',
            syncSourcesCountMismatch:
                'Same number of source universes on device as in patch required ({current} on device, {desired} in patch). Adjust in web UI or add/remove connections.',
            syncSourcesPutError: 'Could not write sources: {detail}',
            syncSourcesOk: 'Patch synced to LumiNode.',
            syncSourcesNoIo: 'No sACN input I/O for universe {u} on the device — add it in the web UI.',
            syncSourcesReadOnly:
                'API refused to change sources; on many LumiNodes universe changes only apply via pipeline/sources or the web UI. Ensure universe 6 exists as an input.',
            syncNeedsCapabilities: 'Tap «Refresh engines & I/O» first — then the app can write to the node.',
            syncSourcesWorking: 'Syncing to LumiNode…',
            syncToNode: 'Push to LumiNode',
            syncSourcesNoChange: 'LumiNode already had the same source universes as your patch — nothing to write.',
            showAllOutputsLabel: 'Show all outputs (including unused in patch)',
            routeOutput: 'Output',
            fetchCapabilities: 'Refresh engines & I/O',
            fetchCapLoading: 'Loading from LumiNode…',
            fetchCapDone: 'Data loaded.',
            fetchCapError: 'LumiNode API: {msg}',
            openWebUi: 'Open web interface',
            saveRoute: 'Save route',
            routeSaved: 'Route saved (local).',
            outputDmx: 'DMX {n}',
            outputFallback: 'Configure output in web interface'
        }
    }
};

// Theater Dashboard App
class TheaterDashboard {
    constructor() {
        this.config = {};
        this.data = {
            yesplan: null,
            uurwerk: null,
            priva: null
        };
        this.selectedVenues = []; // Geselecteerde zalen voor alle plugins
        this.availableVenues = []; // Beschikbare zalen
        this.selectedDate = new Date(); // Geselecteerde datum (standaard vandaag)
        this.maxDateOffsetForward = 365; // Maximaal 1 jaar vooruit
        this.maxDateOffsetBackward = 31; // Maximaal 1 maand terug
        this.currentView = 'home'; // 'home', 'detail', 'week', 'voorstellingTimer', 'luminex' of 'oscMonitor'
        this._luminexMatrix = null;
        this._luminexDiscoveryRunning = false;
        this._luminexSacnRunning = false;
        /** @type {object[]} */
        this._luminexSacnUniverses = [];
        /** @type {object|null} */
        this._luminexCapabilities = null;
        /** @type {Record<string, { sourceUniverse: number, outputKey: string }[]>} */
        this._luminexRoutePatchesByPb = {};
        this._luminexNodeLayoutSaveTimer = null;
        this.tijdschemaScheduleData = null; // laatste geladen tijdschema (detail / timer)
        this._voorstellingTimerClockInterval = null;
        /** Per dagdeel (ochtend / middag / avond): eigen stopwatch en stappen. */
        this.voorstellingTimerBySlot = {};
        /** Laatste sessies voor clock-tick en render (buildTimerDaySessions). */
        this._timerSessions = [];
        /** Debounce voor lokale opslag van timer-marks (electron-store). */
        this._voorstellingTimerPersistTimer = null;
        /** Laatste sleutel waarvoor schijf-merge is gedaan (voorkomt overschrijven bij elke re-render). */
        this._voorstellingTimerLastMergedKey = null;
        /** Kolomtitel-bewerken: welke slot-kolom toont stap-volgorde-editor. */
        this._voorstellingTimerEditingSlotId = null;
        /** Snapshot vóór bewerken (annuleren). */
        this._timerColumnEditBackup = null;
        /** Drag-and-drop voor timerstappen (één keer gebonden op #voorstellingTimerSessionsRow). */
        this._timerDragListenersAttached = false;
        this._timerDragHoverRow = null;
        this.previousView = null; // Voor terug-navigatie
        this.viewHistory = []; // Stapel met eerder geopende view-snapshots voor terug-knop
        this._isNavigatingBack = false; // Voorkomt history-vervuiling tijdens terug-navigatie
        this._pendingHistorySnapshot = null; // Snapshot van staat vóór mutatie/navigatie
        this.isOnline = navigator.onLine; // Internetverbinding status
        this.statusBySystem = { yesplan: null, apiServer: null }; // Yesplan + optioneel Shift Happens API (iPhone/web)
        this.hideCancelledEvents = false; // Filter voor geannuleerde events
        this.filterOnlyWithTechnischPersoneel = false; // Alleen evenementen met technisch personeel
        this.filterOnlyWithTechnischeResources = false; // Alleen evenementen met technische resources
        this.personnelCategoryFilter = 'all'; // zichtbare filter in Personeel-kaart
        this.nostradamusRoleFilter = 'all'; // dynamische functie-filter (FOH, Monitor, ...)
        this.nostradamusRoleOrder = []; // gebruikersvolgorde voor functie-filters
        this._nostradamusRoleDragMoved = false;
        this.personnelFiltersCollapsed = true; // filterrijen in Personeel-card standaard verborgen
        this.loadHomeRequestId = 0;  // Latest-request-wins bij datumwissel
        this.loadWeekRequestId = 0;
        this.weekSortMode = 'venue';  // 'venue' = zaalvolgorde instellingen, 'time' = alleen op tijd
        this.searchQuery = '';  // Zoekterm voor evenementnaam (* en ? als wildcard)
        this.yesplanDataIsSearchResults = false;  // true = data komt van zoek-API (hele Yesplan)
        this.searchDebounceTimer = null;
        this.searchRequestSeq = 0; // voorkomt dat oudere zoekresponses nieuwe resultaten overschrijven
        this.searchKeyboardShift = false;
        this.touchInputKeyboardShift = false;
        this.touchInputKeyboardTarget = null;
        /** 'full' | 'numeric' — virtueel toetsenbord in touchscreen-modus */
        this.touchInputKeyboardLayout = 'full';
        this.settingsNavInitialized = false;
        this.settingsPageKey = 'app-config';
        this.weekEventCount = 0;
        this.locale = 'nl';  // 'nl' of 'en'
        this._updateBannerHideTimer = null; // electron-updater banner auto-hide
        this._lastDayString = null;  // Voor middernacht-check: ga automatisch naar home van nieuwe dag
        this.detailContext = null;   // { productionId, productionName, eventName } wanneer je via een event naar detail gaat: alleen die productie tonen
        this._navRailReorderMode = false;
        this._navRailLongPressTimer = null;
        this._navRailDragId = null;
        this._navRailReorderExitTimer = null;
        this._oscMonitorEntries = [];
        this._oscMonitorMaxEntries = 250;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupLogo();
        this.setupDateTimeDisplay(); // Setup datum/tijd weergave
        this.setupOnlineStatus(); // Setup internetverbinding monitoring
        // Setup custom venue selector eerst (moet gebeuren voordat we zalen laden)
        this.setupCustomVenueSelector();
        await this.loadConfig();
        if (window.__SHIFT_HAPPENS_MOBILE__) void this.refreshApiServerStatus();
        await this.loadVenues(); // Laad zalen eerst
        this.updateDateDisplay(); // Update datum weergave
        // Start met home view (reset datum naar vandaag)
        await this.showHomeView(true);
        this.setupCardDragAndDrop();
        this.setupStatusPopover();
        this.setupSearchEventListeners();
        this.setupAutoRefresh();
        this.setupDesktopUpdates();
    }
    
    setupDateTimeDisplay() {
        this.checkMidnightNavigation();
        this.updateDateTimeDisplay();
        // Zelfde updatecadans als de timer-klok: voorkomt zichtbare achterstand in header.
        setInterval(() => this.updateDateTimeDisplay(), 1000);
        setInterval(() => this.checkMidnightNavigation(), 3600000);
    }
    
    checkMidnightNavigation() {
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const todayStr = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: this.getEffectiveTimeZone()
        }).format(this.getNowDate());
        if (this._lastDayString !== null && todayStr !== this._lastDayString) {
            this._lastDayString = todayStr;
            this.showHomeView(true);
        } else if (this._lastDayString === null) {
            this._lastDayString = todayStr;
        }
    }

    updateDateTimeDisplay() {
        const now = this.getNowDate();
        const dateTimeElement = document.getElementById('currentDateTime');
        if (!dateTimeElement) return;
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const parts = new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            hourCycle: 'h23',
            timeZone: this.getEffectiveTimeZone()
        }).formatToParts(now);
        const get = (type) => (parts.find((p) => p.type === type)?.value || '').trim();
        const dayName = get('weekday');
        const day = get('day');
        const month = get('month');
        const year = get('year');
        const hour = get('hour');
        const minute = get('minute');
        dateTimeElement.textContent = `| ${dayName} ${day} ${month} ${year} | ${hour}:${minute} |`;
    }

    setupLogo() {
        const logo = document.getElementById('headerLogo');
        const icon = document.getElementById('headerIcon');
        
        if (logo && icon) {
            // Probeer logo te laden
            logo.onload = () => {
                // Logo geladen succesvol
                logo.style.display = 'block';
                icon.style.display = 'none';
            };
            
            logo.onerror = () => {
                // Logo niet gevonden, toon icon
                logo.style.display = 'none';
                icon.style.display = 'inline-block';
            };
            
            // Probeer logo te laden (als het bestaat wordt onload aangeroepen, anders onerror)
            logo.src = 'logowm.png';
        }
    }

    setupEventListeners() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showHomeView(true);
        });

        document.getElementById('weekBtn').addEventListener('click', () => {
            this.showWeekView();
        });

        document.getElementById('luminexNavBtn')?.addEventListener('click', () => {
            if (this._navRailReorderMode) return;
            void this.showLuminexView();
        });
        document.getElementById('oscMonitorNavBtn')?.addEventListener('click', () => {
            if (this._navRailReorderMode) return;
            void this.showOscMonitorView();
        });
        document.getElementById('oscMonitorClearBtn')?.addEventListener('click', () => {
            this._oscMonitorEntries = [];
            this.renderOscMonitorEntries();
        });
        this.setupNavRailReorder();

        this.setupLuminexDiscoveryListeners();

        if (window.electronAPI?.onOscTimerTrigger) {
            window.electronAPI.onOscTimerTrigger((payload) => {
                const slotId = payload?.slotId;
                const stepId = payload?.stepId;
                this.addOscMonitorEntry(payload);
                if (typeof slotId === 'string' && typeof stepId === 'string') {
                    this.triggerVoorstellingTimerStepFromOsc(slotId.trim(), stepId.trim());
                }
            });
        }

        const voorstellingTimerBtn = document.getElementById('voorstellingTimerBtn');
        if (voorstellingTimerBtn) {
            voorstellingTimerBtn.addEventListener('click', () => {
                if (this._navRailReorderMode) return;
                if (!this.isShowModeEnabled()) return;
                if (this.canOpenVoorstellingTimer()) {
                    void this.showVoorstellingTimerView();
                } else {
                    void this.openTimerPickPerformanceModal();
                }
            });
        }
        const voorstellingTimerExportBtn = document.getElementById('voorstellingTimerExportBtn');
        if (voorstellingTimerExportBtn) {
            voorstellingTimerExportBtn.addEventListener('click', () => {
                this.openVoorstellingTimerExportWindow();
            });
        }
        document.getElementById('closeTimerPickPerformance')?.addEventListener('click', () => {
            this.closeTimerPickPerformanceModal();
        });
        document.getElementById('timerPickPerformanceModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'timerPickPerformanceModal') this.closeTimerPickPerformanceModal();
        });
        const tijdschemaContentEl = document.getElementById('tijdschemaContent');
        if (tijdschemaContentEl) {
            tijdschemaContentEl.addEventListener('click', () => {
                const card = document.getElementById('tijdschemaCard');
                if (!card?.classList.contains('tijdschema-card--clickable')) return;
                this.showVoorstellingTimerView();
            });
        }
        document.getElementById('techOverviewBtn').addEventListener('click', () => {
            this.openTechOverviewPrint();
        });
        const personnelFilterToggleBtn = document.getElementById('personnelFilterToggleBtn');
        if (personnelFilterToggleBtn) {
            personnelFilterToggleBtn.addEventListener('click', () => {
                this.personnelFiltersCollapsed = !this.personnelFiltersCollapsed;
                this.updatePersonnelFilterToggleState();
                this.updateUurwerkDisplay(this.data?.uurwerk);
            });
            this.updatePersonnelFilterToggleState();
        }

        // Terug-knop (navigatie tussen schermen, niet dagen)
        document.getElementById('backBtn')?.addEventListener('click', () => {
            this.showPreviousView();
        });

        this.setupWeekViewSort();

        // Filter cancelled events button
        const filterBtn = document.getElementById('filterCancelledBtn');
        const filterPopup = document.getElementById('filterPopup');
        const hideCancelledCheckbox = document.getElementById('hideCancelledCheckbox');
        const filterTechnischPersoneelCheckbox = document.getElementById('filterTechnischPersoneelCheckbox');
        const filterTechnischeResourcesCheckbox = document.getElementById('filterTechnischeResourcesCheckbox');
        
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = filterPopup.style.display !== 'none';
            filterPopup.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) this.updateFilterButtonState(); // Sync checkboxes bij openen
        });
        
        // Sluit popup bij klik buiten
        document.addEventListener('click', (e) => {
            if (!filterBtn.contains(e.target) && !filterPopup.contains(e.target)) {
                filterPopup.style.display = 'none';
            }
        });
        
        const applyFilterAndReload = () => {
            this.updateFilterButtonState();
            if (this.currentView === 'home') {
                this.loadHomeData();
            } else {
                this.loadAllData();
            }
        };
        
        hideCancelledCheckbox.addEventListener('change', (e) => {
            this.hideCancelledEvents = e.target.checked;
            applyFilterAndReload();
        });
        if (filterTechnischPersoneelCheckbox) {
            filterTechnischPersoneelCheckbox.addEventListener('change', (e) => {
                this.filterOnlyWithTechnischPersoneel = e.target.checked;
                applyFilterAndReload();
            });
        }
        if (filterTechnischeResourcesCheckbox) {
            filterTechnischeResourcesCheckbox.addEventListener('change', (e) => {
                this.filterOnlyWithTechnischeResources = e.target.checked;
                applyFilterAndReload();
            });
        }

        document.addEventListener('keydown', (e) => {
            this.handleVoorstellingTimerSpacebarShortcut(e);
        });

        // Refresh button (bypass cache voor verse data)
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadAllData({ forceRefresh: true });
        });

        // Update filter button visual state
        this.updateFilterButtonState();

        // Venue selector wordt al in init() opgezet

        // Date selector dropdown
        this.setupCustomDateSelector();
        
        // Date navigation buttons
        document.getElementById('nextDayBtn').addEventListener('click', () => {
            this.goToNextDay();
        });
        
        document.getElementById('prevDayBtn').addEventListener('click', () => {
            this.goToPreviousDay();
        });
        
        // Update date display
        this.updateDateDisplay();

        // Test connection buttons
        document.querySelectorAll('.btn-test').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const system = e.target.closest('.btn-test').dataset.system;
                this.testConnection(system);
            });
        });

        // Load venues buttons (in settings, per organisatie)
        document.querySelectorAll('.loadVenuesBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const org = parseInt(e.currentTarget.dataset.org, 10) || 1;
                this.loadVenuesForSettings(org);
            });
        });
        document.getElementById('discoverMasterBtn')?.addEventListener('click', async () => {
            const resultEl = document.getElementById('masterModeDiscoveryResult');
            if (resultEl) resultEl.textContent = 'Zoeken...';
            try {
                const res = await window.electronAPI?.discoverMasterMode?.();
                if (!res?.success) throw new Error(res?.error || 'onbekende fout');
                if (!Array.isArray(res.masters) || res.masters.length === 0) {
                    if (resultEl) resultEl.textContent = 'Geen actieve master gevonden op dit netwerk.';
                    return;
                }
                const m = res.masters[0];
                if (resultEl) resultEl.textContent = `Master gevonden: ${m.address}:${m.port}${m.name ? ` (${m.name})` : ''}`;
            } catch (error) {
                if (resultEl) resultEl.textContent = `Zoeken mislukt: ${error?.message || String(error)}`;
            }
        });
        document.getElementById('masterModeEnabledCheckbox')?.addEventListener('change', () => {
            this.updateMasterModeInputState();
        });

        // Reset zaalvolgorde knop
        document.getElementById('resetVenueOrder').addEventListener('click', async () => {
            const defaultOrder = this.getDefaultVenueOrder();
            await this.saveVenueOrder(defaultOrder);
            this.populateVenueOrderSettings();
            this.showSuccess(this.t('messages.venueOrderReset'));
        });

        // Zorg dat plakken werkt in alle input velden
        const enablePaste = (input) => {
            // Paste event
            input.addEventListener('paste', (e) => {
                e.stopPropagation();
                // Plakken is toegestaan
            }, true);
            
            // Keyboard shortcut voor plakken (Cmd+V / Ctrl+V)
            input.addEventListener('keydown', (e) => {
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                const isPaste = (isMac && e.metaKey && e.key === 'v') || 
                               (!isMac && e.ctrlKey && e.key === 'v');
                
                if (isPaste) {
                    e.stopPropagation();
                    // Laat de browser de standaard plak actie uitvoeren
                    setTimeout(() => {
                        // Trigger input event om te zorgen dat de waarde wordt bijgewerkt
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }, 0);
                }
            }, true);
        };

        const enableSensitiveInputProtection = (input) => {
            if (!input?.matches?.('input[data-sensitive="true"]')) return;

            // Voorkom kopieren/knippen van gevoelige waarden (ook via contextmenu).
            input.addEventListener('copy', (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, true);

            input.addEventListener('cut', (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, true);

            input.addEventListener('keydown', (e) => {
                const key = String(e.key || '').toLowerCase();
                const isCopy = (e.metaKey || e.ctrlKey) && key === 'c';
                const isCut = (e.metaKey || e.ctrlKey) && key === 'x';
                if (isCopy || isCut) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
        };
        
        // Voeg toe aan alle bestaande input velden
        document.querySelectorAll('input[type="password"], input[type="text"], input[type="url"]').forEach(enablePaste);
        document.querySelectorAll('input[data-sensitive="true"]').forEach(enableSensitiveInputProtection);
        
        // Voeg ook toe aan dynamisch geladen input velden (via MutationObserver)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'INPUT') {
                            enablePaste(node);
                            enableSensitiveInputProtection(node);
                        }
                        // Check ook voor input velden binnen toegevoegde nodes
                        node.querySelectorAll?.('input[type="password"], input[type="text"], input[type="url"]').forEach(enablePaste);
                        node.querySelectorAll?.('input[data-sensitive="true"]').forEach(enableSensitiveInputProtection);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });

        // Virtueel toetsenbord voor invoervelden in instellingen (touchscreen-modus).
        this.setupTouchscreenInputKeyboard();

        // Close modal on outside click
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });

        // IPC listeners
        if (window.electronAPI) {
            window.electronAPI.onAutoRefresh(() => {
                this.loadAllData({ forceRefresh: true });
            });

            window.electronAPI.onRefreshData(() => {
                this.loadAllData({ forceRefresh: true });
            });

            window.electronAPI.onOpenSettings(() => {
                this.openSettings();
            });
        }
    }

    setupTouchscreenInputKeyboard() {
        const ensureKeyboardEl = () => {
            let el = document.getElementById('touchInputKeyboard');
            if (el) return el;
            el = document.createElement('div');
            el.id = 'touchInputKeyboard';
            el.style.cssText = [
                'position: fixed',
                'left: 0',
                'right: 0',
                'bottom: 0',
                'z-index: 3000',
                'display: none',
                'background: rgba(23, 30, 47, 0.97)',
                'backdrop-filter: blur(6px)',
                'border-top: 1px solid #4a5568',
                'padding: 0.4rem'
            ].join(';');
            el.innerHTML = '<div id="touchInputKeyboardKeys"></div>';
            document.body.appendChild(el);
            return el;
        };

        const keyboardRowsFull = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
            ['Close', 'Space', 'Enter']
        ];
        const keyboardRowsNumeric = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ['0', 'Backspace', 'Enter', 'Close']
        ];

        const insertAtCursor = (input, text) => {
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? start;
            const before = input.value.slice(0, start);
            const after = input.value.slice(end);
            input.value = `${before}${text}${after}`;
            const pos = start + text.length;
            input.setSelectionRange(pos, pos);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const renderKeyboard = () => {
            const keysWrap = document.getElementById('touchInputKeyboardKeys');
            if (!keysWrap) return;
            const rows = this.touchInputKeyboardLayout === 'numeric' ? keyboardRowsNumeric : keyboardRowsFull;
            keysWrap.innerHTML = '';
            rows.forEach((row) => {
                const rowEl = document.createElement('div');
                rowEl.className = 'search-keyboard-row';
                row.forEach((key) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'search-key';
                    if (key === 'Space') btn.classList.add('search-key-wide');
                    if (key === 'Backspace' || key === 'Shift' || key === 'Enter' || key === 'Close') btn.classList.add('search-key-special');
                    if (key === 'Shift' && this.touchInputKeyboardShift) btn.classList.add('active');
                    btn.dataset.key = key;
                    const isLetter = /^[a-z]$/.test(key);
                    btn.textContent = isLetter ? (this.touchInputKeyboardShift ? key.toUpperCase() : key) : (key === 'Space' ? 'spatie' : key);
                    rowEl.appendChild(btn);
                });
                keysWrap.appendChild(rowEl);
            });
        };

        const isTouchscreenMode = () => document.body.classList.contains('touchscreen-mode');
        const isPauseDurationTouchInput = (el) => {
            if (!(el instanceof HTMLElement)) return false;
            if (el.tagName !== 'INPUT') return false;
            return el.hasAttribute('data-slot-pause-duration');
        };
        const isSettingsTextInput = (el) => {
            if (!(el instanceof HTMLElement)) return false;
            if (!el.closest('#settingsModal')) return false;
            if (el.tagName !== 'INPUT') return false;
            const input = el;
            if (input.disabled || input.readOnly) return false;
            const type = String(input.type || 'text').toLowerCase();
            return ['text', 'password', 'url', 'search', 'email', 'tel'].includes(type);
        };

        const showKeyboard = (input, layout = 'full') => {
            if (!isTouchscreenMode()) return;
            if (layout === 'numeric') {
                if (!isPauseDurationTouchInput(input)) return;
            } else if (!isSettingsTextInput(input)) return;
            const el = ensureKeyboardEl();
            this.touchInputKeyboardTarget = input;
            this.touchInputKeyboardLayout = layout;
            if (layout === 'full') this.touchInputKeyboardShift = false;
            renderKeyboard();
            el.style.display = 'block';
        };

        const hideKeyboard = () => {
            const el = document.getElementById('touchInputKeyboard');
            if (el) el.style.display = 'none';
            this.touchInputKeyboardShift = false;
            this.touchInputKeyboardLayout = 'full';
            this.touchInputKeyboardTarget = null;
        };

        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (isPauseDurationTouchInput(target)) showKeyboard(target, 'numeric');
            else if (isSettingsTextInput(target)) showKeyboard(target, 'full');
        });

        document.addEventListener('focusout', () => {
            setTimeout(() => {
                const active = document.activeElement;
                const keyboardHasFocus = !!active?.closest?.('#touchInputKeyboard');
                if (!keyboardHasFocus && !isSettingsTextInput(active) && !isPauseDurationTouchInput(active)) hideKeyboard();
            }, 0);
        });

        document.addEventListener('click', (e) => {
            const keyBtn = e.target?.closest?.('#touchInputKeyboard .search-key');
            if (!keyBtn) return;
            const key = keyBtn.dataset.key;
            const input = this.touchInputKeyboardTarget;
            if (!input) return;
            input.focus();
            const numeric = this.touchInputKeyboardLayout === 'numeric';
            if (numeric) {
                if (key === 'Backspace') {
                    const start = input.selectionStart ?? input.value.length;
                    const end = input.selectionEnd ?? start;
                    if (start !== end) {
                        insertAtCursor(input, '');
                    } else if (start > 0) {
                        input.setSelectionRange(start - 1, start);
                        insertAtCursor(input, '');
                    }
                    return;
                }
                if (key === 'Enter') {
                    hideKeyboard();
                    input.blur();
                    return;
                }
                if (key === 'Close') {
                    hideKeyboard();
                    input.blur();
                    return;
                }
                if (/^[0-9]$/.test(key)) {
                    insertAtCursor(input, key);
                }
                return;
            }
            if (key === 'Shift') {
                this.touchInputKeyboardShift = !this.touchInputKeyboardShift;
                renderKeyboard();
                return;
            }
            if (key === 'Backspace') {
                const start = input.selectionStart ?? input.value.length;
                const end = input.selectionEnd ?? start;
                if (start !== end) {
                    insertAtCursor(input, '');
                } else if (start > 0) {
                    input.setSelectionRange(start - 1, start);
                    insertAtCursor(input, '');
                }
                return;
            }
            if (key === 'Enter' || key === 'Close') {
                hideKeyboard();
                input.blur();
                return;
            }
            if (key === 'Space') {
                insertAtCursor(input, ' ');
            } else {
                const out = this.touchInputKeyboardShift ? key.toUpperCase() : key;
                insertAtCursor(input, out);
                if (this.touchInputKeyboardShift && /^[a-z]$/i.test(key)) {
                    this.touchInputKeyboardShift = false;
                    renderKeyboard();
                }
            }
        });
    }

    getActiveYesplanConfig() {
        const activeOrg = this.config?.app?.activeYesplanOrg;
        if (activeOrg === 2) return this.config.yesplan2 || {};
        if (activeOrg === 'both') return this.config.yesplan || {}; // Voor "heeft config" check
        return this.config.yesplan || {};
    }

    /** Toneel-/showfuncties (o.a. voorstellingtimer). Standaard aan zolang niet expliciet uitgeschakeld. */
    isShowModeEnabled() {
        return this.config?.app?.showMode !== false;
    }

    updateShowModeHeaderChrome() {
        const on = !!this.isShowModeEnabled();
        document.body.classList.toggle('show-mode-active', on);
        document.getElementById('headerShowModeSlot')?.setAttribute('aria-hidden', on ? 'false' : 'true');
        this.relocateShowModeTimerButton(on);
    }

    relocateShowModeTimerButton(showModeOn) {
        const btn = document.getElementById('voorstellingTimerBtn');
        const headerSlot = document.getElementById('headerTimerSlot');
        const railSlot = document.getElementById('navRailTimerSlot');
        if (!btn || !headerSlot || !railSlot) return;

        const target = showModeOn ? railSlot : headerSlot;
        if (btn.parentElement !== target) target.appendChild(btn);
        railSlot.setAttribute('aria-hidden', showModeOn ? 'false' : 'true');
        headerSlot.style.display = showModeOn ? 'none' : '';

        btn.classList.toggle('nav-rail-btn', showModeOn);
        this.applySavedNavRailOrder();
    }

    setupNavRailReorder() {
        const rail = document.getElementById('navRail');
        if (!rail) return;

        rail.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest('.nav-rail-btn[id]');
            if (!btn || !rail.contains(btn)) return;
            this.clearNavRailLongPressTimer();
            this._navRailLongPressTimer = setTimeout(() => {
                this.enterNavRailReorderMode();
            }, 450);
        });

        rail.addEventListener('pointerup', () => this.clearNavRailLongPressTimer());
        rail.addEventListener('pointercancel', () => this.clearNavRailLongPressTimer());
        rail.addEventListener('pointerleave', () => this.clearNavRailLongPressTimer());

        rail.addEventListener('dragstart', (e) => {
            const btn = e.target.closest('.nav-rail-btn[id]');
            if (!btn) return;
            if (!this._navRailReorderMode) {
                e.preventDefault();
                return;
            }
            this._navRailDragId = btn.id;
            btn.classList.add('nav-rail-btn--dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', btn.id);
            }
        });

        rail.addEventListener('dragend', () => {
            this._navRailDragId = null;
            rail.querySelectorAll('.nav-rail-btn--dragging').forEach((el) => el.classList.remove('nav-rail-btn--dragging'));
            this.scheduleNavRailReorderModeExit();
        });

        rail.addEventListener('dragover', (e) => {
            if (!this._navRailReorderMode) return;
            e.preventDefault();
        });

        rail.addEventListener('drop', (e) => {
            if (!this._navRailReorderMode) return;
            e.preventDefault();
            const dragId = this._navRailDragId || e.dataTransfer?.getData('text/plain');
            if (!dragId) return;
            const dragged = document.getElementById(dragId);
            if (!dragged || dragged.parentElement !== rail) return;
            const target = e.target.closest('.nav-rail-btn[id]');
            if (!target || target === dragged || target.parentElement !== rail) {
                this.saveNavRailOrder().catch(() => {});
                this.scheduleNavRailReorderModeExit();
                return;
            }

            const rect = target.getBoundingClientRect();
            const insertAfter = e.clientY > rect.top + (rect.height / 2);
            if (insertAfter) {
                rail.insertBefore(dragged, target.nextElementSibling);
            } else {
                rail.insertBefore(dragged, target);
            }
            this.saveNavRailOrder().catch(() => {});
            this.scheduleNavRailReorderModeExit();
        });
    }

    clearNavRailLongPressTimer() {
        if (!this._navRailLongPressTimer) return;
        clearTimeout(this._navRailLongPressTimer);
        this._navRailLongPressTimer = null;
    }

    enterNavRailReorderMode() {
        this.clearNavRailLongPressTimer();
        if (this._navRailReorderMode) return;
        this._navRailReorderMode = true;
        document.body.classList.add('nav-rail-reorder-active');
        const rail = document.getElementById('navRail');
        rail?.querySelectorAll('.nav-rail-btn[id]').forEach((btn) => btn.setAttribute('draggable', 'true'));
        this.scheduleNavRailReorderModeExit();
    }

    scheduleNavRailReorderModeExit() {
        if (this._navRailReorderExitTimer) clearTimeout(this._navRailReorderExitTimer);
        this._navRailReorderExitTimer = setTimeout(() => this.exitNavRailReorderMode(), 5000);
    }

    exitNavRailReorderMode() {
        if (!this._navRailReorderMode) return;
        this._navRailReorderMode = false;
        document.body.classList.remove('nav-rail-reorder-active');
        const rail = document.getElementById('navRail');
        rail?.querySelectorAll('.nav-rail-btn[id]').forEach((btn) => {
            btn.setAttribute('draggable', 'false');
            btn.classList.remove('nav-rail-btn--dragging');
        });
        if (this._navRailReorderExitTimer) {
            clearTimeout(this._navRailReorderExitTimer);
            this._navRailReorderExitTimer = null;
        }
    }

    applySavedNavRailOrder() {
        const rail = document.getElementById('navRail');
        if (!rail) return;
        const order = Array.isArray(this.config?.app?.navRailOrder) ? this.config.app.navRailOrder : [];
        if (!order.length) return;

        const known = new Set(order.map((id) => String(id)));
        for (const id of order) {
            const el = rail.querySelector(`#${CSS.escape(String(id))}`);
            if (el) rail.appendChild(el);
        }
        rail.querySelectorAll('.nav-rail-btn[id]').forEach((btn) => {
            if (!known.has(btn.id)) rail.appendChild(btn);
        });
    }

    async saveNavRailOrder() {
        const rail = document.getElementById('navRail');
        if (!rail || !window.electronAPI?.getConfig || !window.electronAPI?.saveConfig) return;
        const navRailOrder = Array.from(rail.querySelectorAll('.nav-rail-btn[id]')).map((btn) => btn.id);
        const currentConfig = await window.electronAPI.getConfig('app') || {};
        currentConfig.navRailOrder = navRailOrder;
        await window.electronAPI.saveConfig('app', currentConfig);
        this.config.app = this.config.app || {};
        this.config.app.navRailOrder = navRailOrder;
    }

    isBothOrgsActive() {
        return this.config?.app?.activeYesplanOrg === 'both';
    }

    async loadConfig() {
        if (!window.electronAPI) return;

        try {
            const [yesplan, yesplan2, priva, itix, app] = await Promise.all([
                window.electronAPI.getConfig('yesplan'),
                window.electronAPI.getConfig('yesplan2'),
                window.electronAPI.getConfig('priva'),
                window.electronAPI.getConfig('itix'),
                window.electronAPI.getConfig('app')
            ]);
            
            this.config = {
                yesplan: yesplan || {},
                yesplan2: yesplan2 || {},
                priva: priva || {},
                itix: itix || {},
                app: app || {}
            };
            this.nostradamusRoleOrder = Array.isArray(this.config?.app?.nostradamusRoleOrder)
                ? this.config.app.nostradamusRoleOrder.map((v) => String(v || '').trim()).filter(Boolean)
                : [];
            
            // Pas thema toe
            this.applyTheme(this.config.app?.theme || 'default');
            // Pas taal toe
            this.applyLanguage(this.config.app?.language || 'nl');
            // Pas tijdzone toe
            await this.refreshEffectiveTimeZone();
            // Touchscreen-modus
            this.applyTouchscreenMode(!!this.config.app?.touchscreenMode);
            
            // Herstel laatst gekozen zaal(en)
            if (Array.isArray(app?.selectedVenues)) {
                this.selectedVenues = app.selectedVenues.map(id => String(id)).filter(Boolean);
            } else if (app?.selectedVenue) {
                this.selectedVenues = [String(app.selectedVenue)];
            }
            
            // Verberg Priva card als API niet is geconfigureerd
            if (!priva || !priva.baseURL || !priva.apiKey) {
                const privaCard = document.querySelector('#privaContent')?.closest('.card');
                if (privaCard) {
                    privaCard.style.display = 'none';
                }
            }
            
            // Herstel laatst gekozen datum
            if (app?.selectedDate) {
                const savedDate = new Date(app.selectedDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // Alleen herstellen als de opgeslagen datum vandaag of later is
                if (savedDate >= today) {
                    this.selectedDate = savedDate;
                }
            }
        } catch (error) {
            console.error('Config laden fout:', error);
            this.config = {
                yesplan: {},
                yesplan2: {},
                priva: {},
                itix: {},
                app: {}
            };
            this.nostradamusRoleOrder = [];
        }
    }

    getOrderedNostradamusRoles(roleOptions = []) {
        const roles = roleOptions.map((r) => String(r || '').trim()).filter(Boolean);
        if (!roles.length) return [];
        const order = Array.isArray(this.nostradamusRoleOrder) ? this.nostradamusRoleOrder : [];
        const ordered = [];
        const seen = new Set();
        order.forEach((role) => {
            if (roles.includes(role) && !seen.has(role)) {
                ordered.push(role);
                seen.add(role);
            }
        });
        roles.forEach((role) => {
            if (!seen.has(role)) {
                ordered.push(role);
                seen.add(role);
            }
        });
        return ordered;
    }

    async saveNostradamusRoleOrder(nextOrder = []) {
        const normalized = nextOrder.map((v) => String(v || '').trim()).filter(Boolean);
        this.nostradamusRoleOrder = normalized;
        if (!window.electronAPI?.getConfig || !window.electronAPI?.saveConfig) return;
        try {
            const currentConfig = await window.electronAPI.getConfig('app') || {};
            currentConfig.nostradamusRoleOrder = normalized;
            await window.electronAPI.saveConfig('app', currentConfig);
            this.config.app = this.config.app || {};
            this.config.app.nostradamusRoleOrder = normalized;
        } catch (error) {
            console.warn('Opslaan van Nostradamus-functievolgorde mislukt:', error);
        }
    }

    async loadVenues() {
        if (!window.electronAPI) return;
        const activeOrg = this.config?.app?.activeYesplanOrg;
        const yp1 = this.config.yesplan;
        const yp2 = this.config.yesplan2;
        const isBoth = activeOrg === 'both';
        const hasConfig = isBoth
            ? (yp1?.baseURL && yp1?.apiKey && yp2?.baseURL && yp2?.apiKey)
            : (activeOrg === 2 ? (yp2?.baseURL && yp2?.apiKey) : (yp1?.baseURL && yp1?.apiKey));
        if (!hasConfig) return;

        try {
            const result = await window.electronAPI.getYesplanVenues(
                isBoth ? { org: 'both' } : (activeOrg === 2 ? { org: 2 } : { org: 1 })
            );
            
            if (result && result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                this.availableVenues = result.data;
                this.populateVenueSelector();
                
                // Herstel laatst gekozen zalen als beschikbaar
                if (this.selectedVenues.length > 0) {
                    const validSelections = this.selectedVenues
                        .map((id) => this.getCanonicalVenueId(id))
                        .filter((id) => id && this.availableVenues.some((v) => String(v.id) === String(id)));
                    this.selectedVenues = validSelections;
                    this.updateVenueSelectorDisplay();
                }
            } else {
                // Toon toch "Alle zalen" optie
                this.availableVenues = [];
                this.populateVenueSelector();
            }
        } catch (error) {
            console.error('Zalen laden fout:', error);
            // Toon toch "Alle zalen" optie bij error
            this.availableVenues = [];
            this.populateVenueSelector();
        }
    }

    setupCustomVenueSelector() {
        const customSelect = document.getElementById('venueSelectCustom');
        const trigger = customSelect?.querySelector('.custom-select-trigger');
        const optionsContainer = document.getElementById('venueSelectOptions');
        
        if (!customSelect || !trigger || !optionsContainer) {
            console.error('Custom venue selector elementen niet gevonden:', {
                customSelect: !!customSelect,
                trigger: !!trigger,
                optionsContainer: !!optionsContainer
            });
            return;
        }
        
        // Toggle dropdown - gebruik mousedown in plaats van click voor betere compatibiliteit
        trigger.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });
        
        // Ook click event voor touch devices
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Sluit dropdown bij klik buiten (alleen als er al een listener is, voeg niet meerdere toe)
        if (!this.venueSelectorClickHandler) {
            this.venueSelectorClickHandler = (e) => {
                if (!customSelect.contains(e.target)) {
                    customSelect.classList.remove('open');
                }
            };
            document.addEventListener('click', this.venueSelectorClickHandler);
        }
        
        // Option click handler
        optionsContainer.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-select-option');
            if (!option) return;
            
            e.stopPropagation();
            const value = option.dataset.value || '';
            this.toggleVenueSelection(value);
            // Laat dropdown open voor multi-select
        });
    }
    
    async toggleVenueSelection(value) {
        const normalizedValue = value ? String(value) : '';
        if (!normalizedValue) {
            await this.setSelectedVenues([]);
            return;
        }

        const current = this.getSelectedVenueIds();
        const isSelected = current.includes(normalizedValue);
        const nextSelections = isSelected
            ? current.filter(id => id !== normalizedValue)
            : [...current, normalizedValue];

        await this.setSelectedVenues(nextSelections);
    }

    async setSelectedVenues(venueIds) {
        if (!this._isNavigatingBack && !this._pendingHistorySnapshot) {
            this._pendingHistorySnapshot = this.createViewSnapshot();
        }
        const uniqueIds = [...new Set((venueIds || []).map(id => String(id)).filter(Boolean))];
        this.selectedVenues = uniqueIds;
        
        // Sla gekozen zaal op in configuratie
        if (window.electronAPI) {
            try {
                // Haal huidige config op
                const currentConfig = await window.electronAPI.getConfig('app') || {};
                // Update selectedVenues (en legacy selectedVenue)
                currentConfig.selectedVenues = this.selectedVenues;
                currentConfig.selectedVenue = this.selectedVenues.length === 1 ? this.selectedVenues[0] : null;
                // Sla op
                await window.electronAPI.saveConfig('app', currentConfig);
                // Update lokale config
                this.config.selectedVenues = this.selectedVenues;
                this.config.selectedVenue = this.selectedVenues.length === 1 ? this.selectedVenues[0] : null;
            } catch (error) {
                console.error('Fout bij opslaan gekozen zaal:', error);
            }
        }
        
        // Update hidden select
        const hiddenSelect = document.getElementById('venueSelect');
        if (hiddenSelect) {
            hiddenSelect.value = this.selectedVenues.length === 1 ? this.selectedVenues[0] : '';
        }
        
        // Update custom select display
        this.updateVenueSelectorDisplay();
        
        // In week view: blijf in week view en herlaad alleen week data
        if (this.currentView === 'week') {
            await this.loadWeekData();
            return;
        }
        // Als een specifieke zaal is geselecteerd, ga naar detail view
        // Als "alle zalen" is geselecteerd, ga naar home view
        if (this.selectedVenues.length === 1) {
            await this.showDetailView();
        } else {
            await this.showHomeView();
        }
    }

    async selectVenueAndDate(venueId, dateString) {
        // Update venue zonder data te laden
        const canonicalVenueId = venueId ? this.getCanonicalVenueId(venueId) : null;
        this.selectedVenues = canonicalVenueId ? [String(canonicalVenueId)] : [];
        
        // Update datum
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date >= today) {
            this.selectedDate = date;
            this.updateDateDisplay();
        }
        
        // Sla beide op in configuratie
        if (window.electronAPI) {
            try {
                const currentConfig = await window.electronAPI.getConfig('app') || {};
                currentConfig.selectedVenues = this.selectedVenues;
                currentConfig.selectedVenue = this.selectedVenues.length === 1 ? this.selectedVenues[0] : null;
                currentConfig.selectedDate = this.selectedDate.toISOString();
                await window.electronAPI.saveConfig('app', currentConfig);
                this.config.selectedVenues = this.selectedVenues;
                this.config.selectedVenue = this.selectedVenues.length === 1 ? this.selectedVenues[0] : null;
                this.config.app = currentConfig;
            } catch (error) {
                console.error('Fout bij opslaan gekozen zaal en datum:', error);
            }
        }

        // Update hidden select en display
        const hiddenSelect = document.getElementById('venueSelect');
        if (hiddenSelect) {
            hiddenSelect.value = this.selectedVenues.length === 1 ? this.selectedVenues[0] : '';
        }
        this.updateVenueSelectorDisplay();
        
        
        // Laad data alleen als we niet in home view zijn (showDetailView laadt data zelf)
        if (this.currentView !== 'home') {
            this.loadAllData();
        }
    }

    populateVenueSelector() {
        const optionsContainer = document.getElementById('venueSelectOptions');
        const hiddenSelect = document.getElementById('venueSelect');
        const customSelect = document.getElementById('venueSelectCustom');
        const valueSpan = customSelect?.querySelector('.custom-select-value');
        
        if (!optionsContainer) {
            console.error('venueSelectOptions element niet gevonden');
            return;
        }

        // Bewaar huidige selectie
        const currentValues = this.getSelectedVenueIds();

        // Leeg en voeg opties toe
        optionsContainer.innerHTML = '';
        
        // Voeg "Alle zalen" optie toe
        const allOption = document.createElement('div');
        allOption.className = 'custom-select-option';
        allOption.dataset.value = '';
        allOption.textContent = this.t('venue.allVenues');
        if (currentValues.length === 0) {
            allOption.classList.add('selected');
        }
        optionsContainer.appendChild(allOption);
        
        const hiddenIds = this.getHiddenVenueIds();
        const sortedVenues = this.availableVenues && Array.isArray(this.availableVenues) 
            ? this.availableVenues.filter(v => !hiddenIds.includes(String(v.id)))
            : [];
        const venueOrder = this.getVenueOrder();
        // Voor matching: check langere strings eerst
        const venueOrderForMatching = [...venueOrder].sort((a, b) => b.length - a.length);
        
        sortedVenues.sort((a, b) => {
            const getIndex = (venueName) => {
                if (!venueName) return -1;
                const upperName = venueName.toUpperCase();
                
                // Check eerst op exacte match
                let index = venueOrder.findIndex(order => upperName === order);
                if (index !== -1) return index;
                
                // Dan check op startsWith (langere strings eerst)
                for (const order of venueOrderForMatching) {
                    if (upperName.startsWith(order)) {
                        return venueOrder.indexOf(order);
                    }
                }
                
                return -1;
            };
            
            const indexA = getIndex(a.name);
            const indexB = getIndex(b.name);
            
            // Als beide in de volgorde staan, sorteer op volgorde
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // Als alleen A in de volgorde staat, komt A eerst
            if (indexA !== -1) return -1;
            // Als alleen B in de volgorde staat, komt B eerst
            if (indexB !== -1) return 1;
            // Beide niet in volgorde, sorteer alfabetisch
            return a.name.localeCompare(b.name);
        });
        
        // Voeg zalen toe
        if (sortedVenues.length > 0) {
            sortedVenues.forEach(venue => {
                const option = document.createElement('div');
                option.className = 'custom-select-option';
                option.dataset.value = venue.id;
                option.textContent = this.getVenueDisplayName(venue);
                if (currentValues.includes(String(venue.id))) {
                    option.classList.add('selected');
                }
                optionsContainer.appendChild(option);
            });
        } else {
        }
        
        
        // Update hidden select ook
        if (hiddenSelect) {
            hiddenSelect.innerHTML = `<option value="">${this.t('venue.allVenues')}</option>`;
            if (sortedVenues && sortedVenues.length > 0) {
                sortedVenues.forEach(venue => {
                    const option = document.createElement('option');
                    option.value = venue.id;
                    option.textContent = this.getVenueDisplayName(venue);
                    hiddenSelect.appendChild(option);
                });
            }
            hiddenSelect.value = currentValues.length === 1 ? currentValues[0] : '';
        }
        
        // Update display value
        if (valueSpan) {
            this.updateVenueSelectorDisplay();
        }
    }

    getSelectedVenueIds() {
        return (this.selectedVenues || []).map(id => String(id)).filter(Boolean);
    }

    getPrimarySelectedVenueId() {
        const ids = this.getSelectedVenueIds();
        return ids.length === 1 ? ids[0] : null;
    }

    updateVenueSelectorDisplay() {
        const customSelect = document.getElementById('venueSelectCustom');
        const valueSpan = customSelect?.querySelector('.custom-select-value');
        const options = customSelect?.querySelectorAll('.custom-select-option');
        const selectedIds = this.getSelectedVenueIds();
        
        if (valueSpan) {
            if (selectedIds.length === 0) {
                valueSpan.textContent = this.t('venue.allVenues');
            } else if (selectedIds.length === 1) {
                const canonicalId = this.getCanonicalVenueId(selectedIds[0]);
                const venue = this.availableVenues.find(v => String(v.id) === String(canonicalId));
                valueSpan.textContent = venue ? this.getVenueDisplayName(venue) : this.t('venue.unknownVenue');
            } else {
                valueSpan.textContent = this.t('venue.venueCount', { n: selectedIds.length });
            }
        }
        
        if (options) {
            options.forEach(opt => {
                const optValue = opt.dataset.value || '';
                const isSelected = optValue === ''
                    ? selectedIds.length === 0
                    : selectedIds.includes(String(optValue));
                opt.classList.toggle('selected', isSelected);
            });
        }
    }

    updateFilterButtonState() {
        const filterBtn = document.getElementById('filterCancelledBtn');
        const hideCancelledCheckbox = document.getElementById('hideCancelledCheckbox');
        const filterTechnischPersoneelCheckbox = document.getElementById('filterTechnischPersoneelCheckbox');
        const filterTechnischeResourcesCheckbox = document.getElementById('filterTechnischeResourcesCheckbox');
        
        if (!filterBtn || !hideCancelledCheckbox) return;
        
        hideCancelledCheckbox.checked = this.hideCancelledEvents;
        if (filterTechnischPersoneelCheckbox) filterTechnischPersoneelCheckbox.checked = this.filterOnlyWithTechnischPersoneel;
        if (filterTechnischeResourcesCheckbox) filterTechnischeResourcesCheckbox.checked = this.filterOnlyWithTechnischeResources;
        
        const anyFilterActive = this.hideCancelledEvents || this.filterOnlyWithTechnischPersoneel || this.filterOnlyWithTechnischeResources;
        if (anyFilterActive) {
            filterBtn.classList.add('active');
            filterBtn.style.background = '#667eea';
            filterBtn.style.color = 'white';
        } else {
            filterBtn.classList.remove('active');
            filterBtn.style.background = '';
            filterBtn.style.color = '';
        }
    }

    updatePersonnelFilterToggleState() {
        const btn = document.getElementById('personnelFilterToggleBtn');
        if (!btn) return;
        const isCollapsed = !!this.personnelFiltersCollapsed;
        const title = this.locale === 'en'
            ? (isCollapsed ? 'Show personnel filters' : 'Hide personnel filters')
            : (isCollapsed ? 'Toon personeel filters' : 'Verberg personeel filters');
        btn.title = title;
        btn.setAttribute('aria-label', title);
        btn.classList.toggle('active', !isCollapsed);
        btn.style.background = !isCollapsed ? '#667eea' : '';
        btn.style.color = !isCollapsed ? 'white' : '';
    }

    setupSearchEventListeners() {
        const searchBtn = document.getElementById('searchEventBtn');
        const searchBackdrop = document.getElementById('searchBackdrop');
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchEventInput');
        const searchBarClose = document.getElementById('searchBarClose');
        const searchKeyboard = document.getElementById('searchKeyboard');
        const searchKeyboardKeys = document.getElementById('searchKeyboardKeys');
        if (!searchBtn || !searchBackdrop || !searchBar || !searchInput) return;
        searchInput.setAttribute('inputmode', 'search');
        searchInput.setAttribute('autocapitalize', 'off');
        searchInput.setAttribute('autocorrect', 'off');

        const isTouchscreenMode = () => document.body.classList.contains('touchscreen-mode');
        const keyboardRows = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
            ['Close', 'Space', 'Enter']
        ];

        const insertAtCursor = (input, text) => {
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? start;
            const before = input.value.slice(0, start);
            const after = input.value.slice(end);
            input.value = `${before}${text}${after}`;
            const pos = start + text.length;
            input.setSelectionRange(pos, pos);
        };

        const renderKeyboard = () => {
            if (!searchKeyboardKeys) return;
            searchKeyboardKeys.innerHTML = '';
            keyboardRows.forEach((row) => {
                const rowEl = document.createElement('div');
                rowEl.className = 'search-keyboard-row';
                row.forEach((key) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'search-key';
                    if (key === 'Space') btn.classList.add('search-key-wide');
                    if (key === 'Backspace' || key === 'Shift' || key === 'Enter' || key === 'Close') btn.classList.add('search-key-special');
                    if (key === 'Shift' && this.searchKeyboardShift) btn.classList.add('active');
                    btn.dataset.key = key;
                    const isLetter = /^[a-z]$/.test(key);
                    btn.textContent = isLetter ? (this.searchKeyboardShift ? key.toUpperCase() : key) : (key === 'Space' ? 'spatie' : key);
                    rowEl.appendChild(btn);
                });
                searchKeyboardKeys.appendChild(rowEl);
            });
        };

        const showKeyboard = () => {
            if (!searchKeyboard || !isTouchscreenMode()) return;
            renderKeyboard();
            searchKeyboard.style.display = 'block';
        };

        const hideKeyboard = () => {
            if (!searchKeyboard) return;
            searchKeyboard.style.display = 'none';
            this.searchKeyboardShift = false;
        };

        if (searchKeyboardKeys) {
            searchKeyboardKeys.addEventListener('click', (e) => {
                const btn = e.target.closest('.search-key');
                if (!btn) return;
                const key = btn.dataset.key;
                if (!key) return;
                searchInput.focus();
                if (key === 'Shift') {
                    this.searchKeyboardShift = !this.searchKeyboardShift;
                    renderKeyboard();
                    return;
                }
                if (key === 'Backspace') {
                    const start = searchInput.selectionStart ?? searchInput.value.length;
                    const end = searchInput.selectionEnd ?? start;
                    if (start !== end) {
                        insertAtCursor(searchInput, '');
                    } else if (start > 0) {
                        searchInput.setSelectionRange(start - 1, start);
                        insertAtCursor(searchInput, '');
                    }
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
                if (key === 'Enter') {
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
                if (key === 'Close') {
                    hideKeyboard();
                    return;
                }
                if (key === 'Space') {
                    insertAtCursor(searchInput, ' ');
                } else {
                    const out = this.searchKeyboardShift ? key.toUpperCase() : key;
                    insertAtCursor(searchInput, out);
                    if (this.searchKeyboardShift && /^[a-z]$/i.test(key)) {
                        this.searchKeyboardShift = false;
                        renderKeyboard();
                    }
                }
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }

        const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        searchBtn.title = this.t('nav.searchEventTitle') + (isMac ? ' (⌘+Spatie)' : ' (Ctrl+Spatie)');
        searchInput.placeholder = this.t('nav.searchEvent');
        const showBar = () => {
            searchBackdrop.style.display = 'flex';
            searchInput.focus();
            showKeyboard();
        };
        const hideBar = () => {
            searchBackdrop.style.display = 'none';
            hideKeyboard();
        };
        const applySearch = () => {
            this.searchQuery = (searchInput.value || '').trim();
            const requestSeq = ++this.searchRequestSeq;
            searchBtn.classList.toggle('active', this.searchQuery.length >= 2);
            if (this.searchQuery.length >= 2) {
                searchBtn.style.background = '#667eea';
                searchBtn.style.color = 'white';
            } else {
                searchBtn.style.background = '';
                searchBtn.style.color = '';
            }
            if (this.searchQuery.length >= 2) {
                if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
                // Toon direct laadspinner
                this.updateSearchResultsList([], { loading: true });
                this.searchDebounceTimer = setTimeout(async () => {
                    this.searchDebounceTimer = null;
                    const currentQuery = this.searchQuery;
                    if (requestSeq !== this.searchRequestSeq) return;
                    try {
                        const result = await window.electronAPI.getYesplanSearch(currentQuery);
                        if (requestSeq !== this.searchRequestSeq) return;
                        // Zoekresultaten blijven in de overlay; achtergrondcards niet vervangen.
                        this.yesplanDataIsSearchResults = false;
                        if (result && result.success === false && result.error) {
                            this.updateSearchResultsList([], { query: `${currentQuery} (${result.error})` });
                            return;
                        }
                        this.updateSearchResultsList(result.data || [], { query: currentQuery });
                    } catch (e) {
                        if (requestSeq !== this.searchRequestSeq) return;
                        console.error('Zoekfout:', e);
                        this.yesplanDataIsSearchResults = false;
                        this.updateSearchResultsList([], { query: currentQuery });
                    }
                }, 350);
            } else {
                // Invalideer eventuele lopende zoekresponses
                this.searchRequestSeq += 1;
                this.yesplanDataIsSearchResults = false;
                this.updateSearchResultsList([]);
                // Alleen resetten naar normale lijst als het veld echt leeg is.
                // Bij 1 teken geen achtergrond-refresh, zodat de overlay "spotlight"-achtig rustig blijft.
                if (this.searchQuery.length === 0 && this.currentView === 'home') {
                    this.loadHomeData();
                } else if (this.searchQuery.length === 0 && this.currentView === 'week' && this.data.weekYesplan) {
                    this.updateWeekDisplay(this.data.weekYesplan);
                }
            }
        };
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = searchBackdrop.style.display === 'flex';
            if (isVisible) hideBar();
            else showBar();
        });
        searchBackdrop.addEventListener('click', (e) => {
            if (e.target === searchBackdrop) {
                searchInput.value = '';
                this.searchQuery = '';
                this.searchRequestSeq += 1;
                this.yesplanDataIsSearchResults = false;
                this.updateSearchResultsList([]);
                if (this.currentView === 'home') this.loadHomeData();
                hideBar();
            }
        });
        searchBar.addEventListener('click', (e) => e.stopPropagation());
        document.getElementById('searchResults')?.addEventListener('click', (e) => e.stopPropagation());
        searchInput.addEventListener('focus', () => {
            if (searchBackdrop.style.display === 'flex') showKeyboard();
        });
        if (searchBarClose) {
            searchBarClose.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
                this.searchRequestSeq += 1;
                applySearch();
                hideBar();
            });
        }
        searchInput.addEventListener('input', applySearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.searchQuery = '';
                this.searchRequestSeq += 1;
                applySearch();
                hideBar();
            }
        });
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
                e.preventDefault();
                const isVisible = searchBackdrop.style.display === 'flex';
                if (isVisible) hideBar();
                else showBar();
            }
        });
    }

    updateSearchResultsList(events, { loading = false, query = '' } = {}) {
        const container = document.getElementById('searchResults');
        const metaEl = document.getElementById('searchMeta');
        const spinner = document.getElementById('searchSpinner');
        if (!container) return;

        if (spinner) spinner.style.display = loading ? 'inline-flex' : 'none';

        container.innerHTML = '';
        if (metaEl) metaEl.style.display = 'none';

        if (loading) return;

        if (!Array.isArray(events) || events.length === 0) {
            if (query && query.length >= 2) {
                container.innerHTML = `<div class="search-no-results"><i class="fas fa-search"></i> Geen resultaten voor <strong>${query.replace(/</g,'&lt;')}</strong></div>`;
            }
            return;
        }

        // Toon aantal resultaten
        if (metaEl) {
            metaEl.style.display = 'block';
            metaEl.textContent = `${events.length} resultaat${events.length !== 1 ? 'en' : ''}`;
        }

        const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        const statusClass = (statusStr) => {
            const s = String(statusStr || '').toLowerCase();
            if (['geannuleerd', 'cancelled', 'canceled'].some(x => s.includes(x))) return 'status-cancelled';
            if (['bevestigd', 'confirmed'].some(x => s.includes(x))) return 'status-confirmed';
            if (['optie', 'option'].some(x => s.includes(x))) return 'status-option';
            return '';
        };
        const statusLabel = (statusStr) => {
            const s = String(statusStr || '').toLowerCase();
            if (['geannuleerd', 'cancelled', 'canceled'].some(x => s.includes(x))) return 'Geannuleerd';
            if (['bevestigd', 'confirmed'].some(x => s.includes(x))) return 'Bevestigd';
            if (['optie', 'option'].some(x => s.includes(x))) return 'Optie';
            return statusStr || '';
        };

        events.forEach((event) => {
            const venueId = event._organizationId && event.venueIds?.[0]
                ? `${event._organizationId}:${event.venueIds[0]}`
                : (event.venueIds?.[0] || '');
            // Gebruik _requestedDate indien aanwezig, anders afleiden uit startDate string (tijdzone-veilig)
            let eventDate = event._requestedDate || '';
            if (!eventDate && event.startDate) {
                eventDate = String(event.startDate).substring(0, 10);
            }

            const title = event.title || event.name || 'Onbekend';
            const venueName = typeof event.venue === 'string' ? event.venue : '';
            const performer = event.performer || '';
            const rawStatus = typeof event.status === 'object' ? (event.status?.name || '') : (event.status || '');
            const sCls = statusClass(rawStatus);
            const sLabel = statusLabel(rawStatus);

            // Datum + tijd
            const dt = event.startDate ? new Date(event.startDate) : null;
            const dateLabel = dt
                ? dt.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                : eventDate;
            const timeLabel = event.scheduleStartTime
                ? event.scheduleStartTime
                : (dt ? dt.toLocaleTimeString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { hour: '2-digit', minute: '2-digit' }) : '');

            const metaParts = [dateLabel, timeLabel, venueName, performer].filter(Boolean);

            const row = document.createElement('div');
            row.className = 'search-result-item';
            row.setAttribute('data-venue-id', venueId);
            row.setAttribute('data-event-date', eventDate);

            const badgeHtml = sCls
                ? `<span class="search-status-badge ${sCls}">${escapeHtml(sLabel)}</span>`
                : '';

            row.innerHTML = `
                <div class="search-result-body">
                    <span class="search-result-title">${escapeHtml(title)}${badgeHtml}</span>
                    <span class="search-result-meta">${escapeHtml(metaParts.join(' · '))}</span>
                </div>
                <i class="fas fa-chevron-right search-result-arrow"></i>`;

            row.addEventListener('click', async (e) => {
                e.preventDefault();
                const vid = row.getAttribute('data-venue-id');
                const ed = row.getAttribute('data-event-date');
                const fallbackDate = this.getDateRange().start;
                const targetDate = ed || fallbackDate;
                this.detailContext = { eventName: title };
                if (vid) {
                    this._pendingHistorySnapshot = this.createViewSnapshot();
                    await this.selectVenueAndDate(vid, targetDate);
                    await this.showDetailView();
                } else {
                    // Geen venue-id: navigeer naar die dag in home view
                    this._pendingHistorySnapshot = this.createViewSnapshot();
                    await this.selectVenueAndDate('', targetDate);
                    await this.showHomeView();
                }
                document.getElementById('searchBackdrop').style.display = 'none';
            });
            container.appendChild(row);
        });
    }

    matchSearchQuery(title, query) {
        if (!query || query.length < 2) return true;
        try {
            const escaped = query.replace(/[.+^${}()|[\]\\]/g, '\\$&');
            const pattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
            const re = new RegExp(pattern, 'i');
            return re.test(String(title || ''));
        } catch (_) {
            return String(title || '').toLowerCase().includes(query.toLowerCase());
        }
    }

    async loadAllData(opts = {}) {
        const forceRefresh = !!opts.forceRefresh;
        if (this.currentView === 'home') {
            await this.loadHomeData(forceRefresh);
            return;
        }
        if (this.currentView === 'week') {
            await this.loadWeekData(forceRefresh);
            return;
        }
        
        this.showLoading(true);
        
        try {
            await this.loadYesplanData(forceRefresh);
            
            // Laad dan Uurwerk (gebruikt Yesplan data)
            await this.loadUurwerkData();
            
            // Laad andere data parallel
            const promises = [this.loadSalesData()];
            
            // Laad Priva alleen als API is geconfigureerd
            if (this.config.priva && this.config.priva.baseURL && this.config.priva.apiKey) {
                promises.push(this.loadPrivaData());
                // Toon Priva card
                const privaCard = document.getElementById('privaCard');
                if (privaCard) {
                    privaCard.style.setProperty('display', 'block', 'important');
                }
            } else {
                // Verberg Priva card als API niet is geconfigureerd
                const privaCard = document.getElementById('privaCard');
                if (privaCard) {
                    privaCard.style.setProperty('display', 'none', 'important');
                }
            }

            await Promise.allSettled(promises);

            // Tijdschema laden: alleen bij 1 dag + 1 zaal (detail view)
            if (this.selectedVenues.length === 1 && this.data.yesplan?.success && this.data.yesplan?.data?.length > 0) {
                await this.loadTijdschemaData(this.data.yesplan.data);
            } else {
                this.updateTijdschemaDisplay(null);
            }
        } catch (error) {
            console.error('Data laden fout:', error);
        } finally {
            this.showLoading(false);
            if (window.__SHIFT_HAPPENS_MOBILE__) void this.refreshApiServerStatus();
        }
    }

    async loadYesplanData(forceRefresh = false) {
        try {
            const dateRange = this.getDateRange();
            let venueId = this.getPrimarySelectedVenueId();
            if (!venueId) venueId = undefined;
            const skipCache = !!forceRefresh || (this.currentView === 'detail');

            let result = await window.electronAPI.getYesplanData({
                startDate: dateRange.start,
                endDate: dateRange.end,
                venueId,
                skipCache
            });

            // Fallback: bij 0 events met zaal geselecteerd opnieuw ophalen zonder zaal-filter, daarna client-side op zaal filteren.
            // Belangrijk: als filtering niets oplevert, GEEN unfiltered retry-resultaat tonen (anders mix van zalen).
            if (venueId && result?.success && (!result.data || result.data.length === 0)) {
                const retry = await window.electronAPI.getYesplanData({
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    venueId: undefined,
                    skipCache: true
                });
                if (retry?.success && retry.data && retry.data.length > 0) {
                    const vidRaw = String(venueId).toUpperCase().trim();
                    const vid = vidRaw.includes(':') ? vidRaw.split(':').pop() : vidRaw;
                    const filtered = retry.data.filter((e) => {
                        const ids = (e.venueIds || []).map((x) => String(x).toUpperCase().trim());
                        const venueStr = (e.venue || '').toUpperCase();
                        const locNames = (e.locations || []).map((l) => String(l?.name || '').toUpperCase().trim());
                        return ids.includes(vid) || ids.includes(vidRaw) || locNames.includes(vid) || venueStr.includes(vid) || venueStr.includes(vidRaw);
                    });
                    result = { ...retry, data: filtered };
                }
            }

            this.data.yesplan = result;
            this.updateYesplanDisplay(result);
            this.updateStatus('yesplan', result.success ? 'online' : 'offline', result.timestamp || new Date());
            // Verkoopkaart werkt volledig op Yesplan-data en reserveringen.
            this.updateItixDisplay({ success: true, data: [] });
        } catch (error) {
            console.error('Yesplan data fout:', error);
            this.data.yesplan = { success: false, data: [], timestamp: null };
            this.updateYesplanDisplay(this.data.yesplan);
            this.updateStatus('yesplan', 'offline', null);
            this.showError('yesplan', this.t('errors.yesplanLoad'));
        }
    }

    /**
     * Personeel: altijd ophalen via getYesplanPersonnelForDate (zelfde pad als CLI --personnel-wtpy),
     * zodat de kaart niet afhangt van event.urenInfo uit de eventlijst.
     */
    async loadUurwerkData() {
        try {
            const dateRange = this.getDateRange();
            const venueId = this.getPrimarySelectedVenueId() || undefined;
            const res = await window.electronAPI.getYesplanPersonnelForDate({
                startDate: dateRange.start,
                endDate: dateRange.end,
                venueId
            });
            const allUrenInfo = res?.success && res.data ? res.data : { techniek: [], horeca: [], frontOffice: [], nostradamus: [] };
            const hasAny = Object.values(allUrenInfo || {}).some((v) => Array.isArray(v) && v.length > 0);
            const result = {
                success: hasAny,
                data: allUrenInfo,
                timestamp: new Date().toISOString()
            };
            this.data.uurwerk = result;
            this.updateUurwerkDisplay(result);
        } catch (error) {
            console.error('Uurwerk data fout:', error);
            this.showError('uurwerk', this.t('errors.uurwerkLoad'));
        }
    }

    async loadSalesData() {
        try {
            // Verkoopcijfers komen rechtstreeks uit Yesplan eventvelden.
            this.updateItixDisplay({ success: true, data: [] });
        } catch (error) {
            console.error('Verkoopdata (Yesplan) fout:', error);
            this.updateItixDisplay({ success: true, data: [] });
        }
    }

    async loadPrivaData() {
        try {
            // Gebruik geselecteerde zaal als beschikbaar
            const venueId = this.getPrimarySelectedVenueId();
            const venueName = this.getVenueNameById(venueId);

            if (!venueId) {
                // Geen specifieke zaal geselecteerd
                this.data.priva = { success: false, data: [] };
                this.updatePrivaDisplay(this.data.priva);
                return;
            }
            
            const result = await window.electronAPI.getPrivaData({
                venueId: venueId,
                location: venueName
            });

            this.data.priva = result;
            this.updatePrivaDisplay(result);
        } catch (error) {
            console.error('Priva data fout:', error);
            this.showError('priva', this.t('errors.privaLoad'));
        }
    }

    createViewSnapshot() {
        return {
            view: this.currentView,
            selectedVenues: Array.isArray(this.selectedVenues) ? [...this.selectedVenues] : [],
            selectedDate: this.selectedDate instanceof Date ? this.selectedDate.toISOString() : null,
            detailContext: this.detailContext ? { ...this.detailContext } : null
        };
    }

    pushHistorySnapshotIfNeeded(targetView) {
        if (this._isNavigatingBack) {
            this._pendingHistorySnapshot = null;
            return;
        }
        if (this.currentView === targetView) {
            this._pendingHistorySnapshot = null;
            return;
        }
        const snapshot = this._pendingHistorySnapshot || this.createViewSnapshot();
        this._pendingHistorySnapshot = null;
        this.viewHistory.push(snapshot);
        if (this.viewHistory.length > 50) this.viewHistory.shift();
    }

    async showHomeView(resetDate = false) {
        this.pushHistorySnapshotIfNeeded('home');
        this.previousView = this.currentView;
        this.currentView = 'home';
        this.detailContext = null;
        this.hideVoorstellingTimerShell();
        this.hideLuminexShell();
        this.hideOscMonitorShell();

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const dashboardGrid = document.getElementById('dashboardGrid');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = 'none';
        if (homeContainer) homeContainer.style.display = '';
        if (homeStatus) homeStatus.style.display = 'flex';
        if (dashboardGrid) {
            dashboardGrid.style.display = '';
            if (homeContainer && !homeContainer.contains(dashboardGrid)) {
                homeContainer.appendChild(dashboardGrid);
            }
        }

        document.getElementById('weekBtn')?.classList.remove('active');
        document.getElementById('homeBtn')?.classList.add('active');
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');
        
        if (dashboardGrid) {
            dashboardGrid.classList.add('home-view');
            dashboardGrid.classList.remove('detail-view');
        }
        const cards = dashboardGrid ? dashboardGrid.querySelectorAll('.card') : [];
        cards.forEach((card, index) => {
            if (index === 0) {
                // Yesplan card - altijd tonen
                card.style.display = 'block';
            } else {
                // Andere cards - verbergen (inclusief Priva)
                card.style.display = 'none';
                card.style.visibility = 'hidden';
            }
        });
        
        // Voeg home-view class toe aan body voor CSS targeting
        document.body.classList.add('home-view-active');
        document.body.classList.remove('week-view-active');
        
        // Toon date selector en venue selector in header (blijven zichtbaar)
        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) dateSelector.style.display = 'flex';
        if (venueSelector) venueSelector.style.display = 'block';

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = (this.selectedVenues || []).length === 0 ? '' : 'none';
        
        // Reset alleen naar vandaag en alle zalen als resetDate true is (bijvoorbeeld bij home knop klik)
        if (resetDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.selectedDate = today;
            this.selectedVenues = [];
        }
        
        // Update displays
        this.updateDateDisplay();
        this.updateVenueSelectorDisplay();
        
        // Laad evenementen voor geselecteerde datum en zaal
        await this.loadHomeData();
        this.applyCardOrder();
        this.updateMasterStatus();
        this.updateBackButtonVisibility();
        this.refreshVoorstellingTimerChrome();
    }
    
    async showDetailView(clearDetailContext = false, forceRefresh = false) {
        this.pushHistorySnapshotIfNeeded('detail');
        this.previousView = this.currentView;
        this.currentView = 'detail';
        // Bij dag-navigatie in detailview willen we niet vast blijven zitten op 1 aangeklikt event.
        if (clearDetailContext) this.detailContext = null;
        this.hideVoorstellingTimerShell();
        this.hideLuminexShell();
        this.hideOscMonitorShell();

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const detailGridContainer = document.getElementById('detailViewGridContainer');
        const dashboardGrid = document.getElementById('dashboardGrid');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'none';
        if (homeContainer) homeContainer.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = '';
        if (homeStatus) homeStatus.style.display = 'none';
        if (dashboardGrid) {
            dashboardGrid.style.display = '';
            if (detailGridContainer && !detailGridContainer.contains(dashboardGrid)) {
                detailGridContainer.appendChild(dashboardGrid);
            }
        }
        this.updateDetailViewTitle(this.getVenueName(), null);

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = 'none';

        document.getElementById('weekBtn')?.classList.remove('active');
        document.getElementById('homeBtn')?.classList.remove('active');
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');
        
        document.body.classList.remove('home-view-active');
        document.body.classList.remove('week-view-active');
        document.body.classList.remove('voorstelling-timer-active');
        
        // Toon alle cards expliciet, 4 kolommen in detail view
        if (dashboardGrid) {
            dashboardGrid.classList.remove('home-view');
            dashboardGrid.classList.add('detail-view');
        }
        const cards = dashboardGrid ? dashboardGrid.querySelectorAll('.card') : [];
        const isPrivaConfigured = this.config.priva && this.config.priva.baseURL && this.config.priva.apiKey;
        const showTijdschema = this.selectedVenues.length === 1;
        cards.forEach((card, index) => {
            // Priva card alleen tonen als geconfigureerd
            if (card.id === 'privaCard') {
                card.style.display = isPrivaConfigured ? 'block' : 'none';
                card.style.visibility = isPrivaConfigured ? 'visible' : 'hidden';
            } else if (card.id === 'tijdschemaCard') {
                // Tijdschema card alleen bij 1 dag + 1 zaal
                card.style.display = showTijdschema ? 'block' : 'none';
                card.style.visibility = showTijdschema ? 'visible' : 'hidden';
            } else {
                // Alle andere cards moeten zichtbaar zijn in detail view
                card.style.display = 'block';
                card.style.visibility = 'visible';
            }
        });
        
        // Toon date selector en venue selector in header
        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) {
            dateSelector.style.display = 'flex';
            dateSelector.style.visibility = 'visible';
        }
        if (venueSelector) {
            venueSelector.style.display = 'block';
            venueSelector.style.visibility = 'visible';
        }
        
        await this.loadAllData({ forceRefresh: !!forceRefresh });
        this.applyCardOrder();
        this.updateBackButtonVisibility();
    }

    async showWeekView() {
        this.pushHistorySnapshotIfNeeded('week');
        this.previousView = this.currentView;
        this.currentView = 'week';
        this.detailContext = null;
        this.hideVoorstellingTimerShell();
        this.hideLuminexShell();
        this.hideOscMonitorShell();
        document.body.classList.remove('home-view-active');
        document.body.classList.add('week-view-active');
        document.body.classList.remove('voorstelling-timer-active');

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'block';
        if (homeContainer) homeContainer.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = 'none';
        if (homeStatus) homeStatus.style.display = 'none';

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = 'none';

        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) dateSelector.style.display = 'none';
        if (venueSelector) venueSelector.style.display = 'block';

        document.getElementById('weekBtn')?.classList.add('active');
        document.getElementById('homeBtn')?.classList.remove('active');
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');

        const sortWrap = document.getElementById('weekViewSort');
        if (sortWrap) {
            sortWrap.querySelectorAll('.week-view-sort-btn').forEach((b) => {
                b.classList.toggle('active', b.dataset.sort === this.weekSortMode);
            });
        }

        this.updateVenueSelectorDisplay();
        await this.loadWeekData();
        this.updateBackButtonVisibility();
        this.refreshVoorstellingTimerChrome();
    }

    updateBackButtonVisibility() {
        const backBtn = document.getElementById('backBtn');
        if (!backBtn) return;
        const canGoBack = this.findLastNavigableHistoryEntry() !== null;
        backBtn.disabled = !canGoBack;
        backBtn.classList.toggle('btn-back--disabled', !canGoBack);
    }

    canNavigateToView(viewName) {
        if (!viewName || viewName === this.currentView) return false;
        if (viewName === 'home' || viewName === 'week') return true;
        if (viewName === 'detail') {
            // Detail is alleen zinvol met exact 1 geselecteerde zaal.
            return Array.isArray(this.selectedVenues) && this.selectedVenues.length === 1;
        }
        if (viewName === 'voorstellingTimer') {
            return this.canOpenVoorstellingTimer();
        }
        if (viewName === 'luminex') {
            return true;
        }
        if (viewName === 'oscMonitor') {
            return this.isShowModeEnabled();
        }
        return false;
    }

    _normalizeDayString(value) {
        if (!value) return null;
        const d = value instanceof Date ? new Date(value) : new Date(String(value));
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    }

    _historyEntryChangesState(entry) {
        if (!entry || typeof entry === 'string') return false;
        const entryVenues = Array.isArray(entry.selectedVenues) ? entry.selectedVenues.map(v => String(v)) : [];
        const currentVenues = Array.isArray(this.selectedVenues) ? this.selectedVenues.map(v => String(v)) : [];
        const sameVenues = entryVenues.length === currentVenues.length && entryVenues.every((v, i) => v === currentVenues[i]);

        const sameDate = this._normalizeDayString(entry.selectedDate) === this._normalizeDayString(this.selectedDate);
        const sameDetailContext = JSON.stringify(entry.detailContext || null) === JSON.stringify(this.detailContext || null);

        return !(sameVenues && sameDate && sameDetailContext);
    }

    findLastNavigableHistoryEntry() {
        for (let i = this.viewHistory.length - 1; i >= 0; i--) {
            const candidate = this.viewHistory[i];
            if (this.canNavigateToHistoryEntry(candidate)) {
                return { index: i, entry: candidate };
            }
        }
        return null;
    }

    canNavigateToHistoryEntry(entry) {
        if (!entry) return false;
        if (typeof entry === 'string') return this.canNavigateToView(entry);

        const viewName = entry.view;
        if (!viewName) return false;

        // Zelfde view kan alsnog een geldige "terug" zijn (bijv. andere datum in detail/week).
        if (viewName === this.currentView) {
            if (!this._historyEntryChangesState(entry)) return false;
        }

        if (viewName === 'home' || viewName === 'week') return true;
        if (viewName === 'detail') {
            return Array.isArray(entry.selectedVenues) && entry.selectedVenues.length === 1;
        }
        if (viewName === 'voorstellingTimer') {
            return this.canOpenVoorstellingTimer();
        }
        if (viewName === 'luminex') {
            return true;
        }
        if (viewName === 'oscMonitor') {
            return this.isShowModeEnabled();
        }
        return false;
    }

    async showPreviousView() {
        this._pendingHistorySnapshot = null;

        let targetEntry = null;
        while (this.viewHistory.length > 0) {
            const candidate = this.viewHistory.pop();
            if (this.canNavigateToHistoryEntry(candidate)) {
                targetEntry = (typeof candidate === 'string' ? { view: candidate } : candidate);
                break;
            }
        }

        if (!targetEntry) {
            this.updateBackButtonVisibility();
            return;
        }

        this._isNavigatingBack = true;
        try {
            if (Array.isArray(targetEntry.selectedVenues)) {
                this.selectedVenues = [...targetEntry.selectedVenues];
            }
            if (targetEntry.selectedDate) {
                const restoredDate = new Date(targetEntry.selectedDate);
                if (!Number.isNaN(restoredDate.getTime())) {
                    restoredDate.setHours(0, 0, 0, 0);
                    this.selectedDate = restoredDate;
                }
            }
            this.detailContext = targetEntry.detailContext || null;

            if (targetEntry.view === 'home') {
                await this.showHomeView(false);
            } else if (targetEntry.view === 'detail') {
                await this.showDetailView();
            } else if (targetEntry.view === 'week') {
                await this.showWeekView();
            } else if (targetEntry.view === 'voorstellingTimer') {
                await this.showVoorstellingTimerView();
            } else if (targetEntry.view === 'luminex') {
                await this.showLuminexView();
            }
        } finally {
            this._isNavigatingBack = false;
            this.updateBackButtonVisibility();
        }
    }
    
    async loadHomeData(forceRefresh = false) {
        this.yesplanDataIsSearchResults = false;
        const id = ++this.loadHomeRequestId;
        this.showLoading(true);
        this.setDateNavDisabled(true);
        
        try {
            const selectedDate = this.selectedDate || new Date();
            selectedDate.setHours(0, 0, 0, 0);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            let venueId = this.getPrimarySelectedVenueId();
            if (!venueId) venueId = undefined;
            
            let result = await window.electronAPI.getYesplanData({
                startDate: dateStr,
                endDate: dateStr,
                venueId,
                skipCache: !!forceRefresh
            });
            if (id !== this.loadHomeRequestId) return;
            // Bij 0 events met zaal geselecteerd: opnieuw zonder zaal ophalen en client-side filteren (zodat urenInfo binnenkomt)
            if (venueId && result?.success && (!result.data || result.data.length === 0)) {
                const retry = await window.electronAPI.getYesplanData({
                    startDate: dateStr,
                    endDate: dateStr,
                    venueId: undefined,
                    skipCache: true
                });
                if (id !== this.loadHomeRequestId) return;
                if (retry?.success && retry.data && retry.data.length > 0) {
                    const vidRaw = String(venueId).toUpperCase().trim();
                    const vid = vidRaw.includes(':') ? vidRaw.split(':').pop() : vidRaw;
                    const filtered = retry.data.filter((e) => {
                        const ids = (e.venueIds || []).map((x) => String(x).toUpperCase().trim());
                        const venueStr = (e.venue || '').toUpperCase();
                        const locNames = (e.locations || []).map((l) => String(l?.name || '').toUpperCase().trim());
                        return ids.includes(vid) || ids.includes(vidRaw) || locNames.includes(vid) || venueStr.includes(vid) || venueStr.includes(vidRaw);
                    });
                    result = filtered.length > 0 ? { ...retry, data: filtered } : retry;
                }
            }
            this.data.yesplan = result;
            this.updateYesplanDisplay(result);
            this.updateStatus('yesplan', result.success ? 'online' : 'offline', result.timestamp || new Date());
            if (id === this.loadHomeRequestId) await this.loadUurwerkData();
        } catch (error) {
            if (id !== this.loadHomeRequestId) return;
            console.error('Home data laden fout:', error);
            this.data.yesplan = { success: false, data: [], timestamp: null };
            this.updateYesplanDisplay(this.data.yesplan);
            this.updateStatus('yesplan', 'offline', null);
            this.showError('yesplan', this.t('errors.eventsLoad'));
        } finally {
            if (id === this.loadHomeRequestId) {
                this.showLoading(false);
                this.setDateNavDisabled(false);
                if (window.__SHIFT_HAPPENS_MOBILE__) void this.refreshApiServerStatus();
            }
        }
    }

    async loadWeekData(forceRefresh = false) {
        const id = ++this.loadWeekRequestId;
        this.showLoading(true);
        this.setDateNavDisabled(true);
        const statusEl = document.getElementById('weekViewStatus');
        const statusText = statusEl?.querySelector('.status-text');
        if (statusText) statusText.textContent = this.t('loading');

        try {
            const { start, end } = this.getWeekDateRange();
            // Weekview: altijd zonder server-side venue filter laden.
            // Venue-filtering gebeurt client-side in updateWeekDisplay; dit voorkomt lege resultaten
            // bij venue-id/prefix verschillen tussen systemen of organisatie-modus.
            // Gebruik main-process cache waar mogelijk om minder API-calls/429's te krijgen.
            // Als personeel/technische resources-filters aan staan, hebben we event-details nodig
            // (urenInfo/resources) anders kan updateWeekDisplay niet filteren.
            // In weekoverzicht moeten urenInfo/techniek en technische materialen
            // altijd beschikbaar zijn, ook als de weekfilters uit staan.
            const venueId = undefined;

            const WEEK_LOAD_TIMEOUT_MS = 35000;
            const loadPromise = window.electronAPI.getYesplanData({
                startDate: start,
                endDate: end,
                venueId,
                limit: 500,
                skipCache: !!forceRefresh,
                includeEventDetailsForWeekFilters: true
            });
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), WEEK_LOAD_TIMEOUT_MS)
            );
            let result = await Promise.race([loadPromise, timeoutPromise]);

            if (result?.success && (!result.data || result.data.length === 0)) {
                const retryPromise = window.electronAPI.getYesplanData({
                    startDate: start,
                    endDate: end,
                    venueId: undefined,
                    limit: 500,
                    skipCache: !!forceRefresh,
                    includeEventDetailsForWeekFilters: true
                });
                const retry = await Promise.race([retryPromise, timeoutPromise]);
                if (retry?.success && retry.data && retry.data.length > 0) result = retry;
            } else if (!result?.success && result !== undefined) {
                const retryPromise = window.electronAPI.getYesplanData({
                    startDate: start,
                    endDate: end,
                    venueId: undefined,
                    limit: 500,
                    skipCache: !!forceRefresh,
                    includeEventDetailsForWeekFilters: true
                });
                const retry = await Promise.race([retryPromise, timeoutPromise]);
                if (retry?.success && retry.data && retry.data.length > 0) result = retry;
            }

            if (id !== this.loadWeekRequestId) return;

            // Debug: uitgeschakeld in productie; zet DEV_WEEK_DEBUG=true in console om aan te zetten
            if (typeof window !== 'undefined' && window.DEV_WEEK_DEBUG) {
                const cnt = result?.data?.length ?? 0;
                const samples = (result?.data ?? []).slice(0, 3).map((e) => e._requestedDate || '(geen)');
                console.log('[Week] start=', start, 'end=', end, 'events=', cnt, 'samples=', samples);
            }

            this.data.weekYesplan = result;
            this.updateWeekDisplay(result);
            const ok = result && result.success;
            this.statusBySystem.yesplan = ok ? 'online' : 'offline';
            this.updateMasterStatus();
        } catch (e) {
            if (id !== this.loadWeekRequestId) return;
            console.error('Week data laden fout:', e);
            this.statusBySystem.yesplan = 'offline';
            this.updateMasterStatus();
            const msg = e?.message === 'TIMEOUT'
                ? (this.locale === 'en' ? 'Week load took too long. Try again or refresh.' : 'Week laden duurde te lang. Probeer opnieuw of ververs.')
                : this.t('errors.weekLoad');
            this.showError('yesplan', msg);
        } finally {
            if (id === this.loadWeekRequestId) {
                this.showLoading(false);
                this.setDateNavDisabled(false);
                if (window.__SHIFT_HAPPENS_MOBILE__) void this.refreshApiServerStatus();
            }
        }
    }

    updateWeekDisplay(data) {
        const container = document.getElementById('weekViewContent');
        if (!container) return;

        const selectedVenueIds = this.getSelectedVenueIds();
        const availableVenueIds = (this.availableVenues || []).map((v) => String(v.id));
        const isKnownSelectedVenueId = (sid) => {
            const s = String(sid || '');
            if (!s) return false;
            return availableVenueIds.some((aid) => aid === s || aid.endsWith(`:${s}`) || s.endsWith(`:${aid}`));
        };
        const effectiveSelectedVenueIds = selectedVenueIds.filter(isKnownSelectedVenueId);
        const venueFilterIds = (selectedVenueIds.length > 0 && effectiveSelectedVenueIds.length === 0)
            ? []
            : effectiveSelectedVenueIds;
        const dayNames = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
        const { startDate, endDate } = this.getWeekDateRange();

        if (!data?.success || !data?.data?.length) {
            this.updateWeekHeaderSummary(0);
            const venueLabel = this.getVenueName() || 'alle zalen';
            const rangeStart = startDate.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { day: 'numeric', month: 'short' });
            const rangeEnd = endDate.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
            const rangeText = `${rangeStart} – ${rangeEnd}`;
            container.innerHTML = `
                <div class="info-message">
                    <p>${this.t('messages.noEventsWeek', { venue: venueLabel })}</p>
                    <p class="week-empty-range">${rangeText}</p>
                </div>`;
            return;
        }

        let events = [...data.data];
        if (venueFilterIds.length > 0) {
            const beforeVenueFilter = events;
            events = events.filter((e) => {
                const eventOrg = e._organizationId;
                const venueIds = Array.isArray(e.venueIds) ? e.venueIds.map((id) => String(id)) : [];
                const locIds = Array.isArray(e.rawEvent?.locations)
                    ? e.rawEvent.locations.map((l) => String(l?.id || '')).filter(Boolean)
                    : [];
                const allEventVenueIds = new Set([...venueIds, ...locIds]);
                if (allEventVenueIds.size === 0) return false;

                return venueFilterIds.some((sid) => {
                    const s = String(sid);
                    if (s.includes(':')) {
                        const [o, id] = s.split(':');
                        if (eventOrg && String(eventOrg) !== o) return false;
                        return allEventVenueIds.has(String(id));
                    }
                    return allEventVenueIds.has(s);
                });
            });

            // Fallback 1: match op zaalnaam wanneer ID's in API payload veranderd zijn.
            if (events.length === 0) {
                const selectedVenueNames = (this.availableVenues || [])
                    .filter((v) => venueFilterIds.some((sid) => {
                        const s = String(sid || '');
                        const id = String(v.id || '');
                        return s === id || s.endsWith(`:${id}`) || id.endsWith(`:${s}`);
                    }))
                    .map((v) => String(v.name || '').trim().toUpperCase())
                    .filter(Boolean);

                if (selectedVenueNames.length > 0) {
                    events = beforeVenueFilter.filter((e) => {
                        const eventVenue = String(e.venue || '').toUpperCase();
                        const locNames = Array.isArray(e.rawEvent?.locations)
                            ? e.rawEvent.locations.map((l) => String(l?.name || '').toUpperCase())
                            : [];
                        return selectedVenueNames.some((name) =>
                            eventVenue.includes(name) || locNames.some((ln) => ln.includes(name))
                        );
                    });
                }
            }

            // Fallback 2: toon in elk geval weekevents i.p.v. "geen resultaten" door een filter-mismatch.
            if (events.length === 0) {
                events = beforeVenueFilter;
            }
        }
        if (this.searchQuery && this.searchQuery.length >= 2) {
            const beforeSearchFilter = events;
            events = events.filter((e) => this.matchSearchQuery(e.title || e.name, this.searchQuery));
            // Voorkom "lege week" door een achtergebleven zoekterm.
            if (events.length === 0) {
                events = beforeSearchFilter;
            }
        }
        if (this.hideCancelledEvents) {
            events = events.filter((e) => {
                const s = (e.status || '').toLowerCase();
                const sn = (typeof e.status === 'object' && e.status?.name ? e.status.name : '').toLowerCase();
                return !['geannuleerd', 'cancelled', 'canceled'].some((x) => s.includes(x) || sn.includes(x));
            });
        }
        if (this.filterOnlyWithTechnischPersoneel) {
            events = events.filter((e) => (e.urenInfo?.techniek?.length ?? 0) > 0);
        }
        if (this.filterOnlyWithTechnischeResources) {
            events = events.filter((e) => {
                const hasResources = Array.isArray(e.resources) && e.resources.length > 0;
                const hasTechMaterial = Array.isArray(e.technicalMaterialResources) && e.technicalMaterialResources.length > 0;
                return hasResources || hasTechMaterial;
            });
        }

        if (events.length === 0) {
            this.updateWeekHeaderSummary(0);
            const venueLabel = this.getVenueName() || 'alle zalen';
            container.innerHTML = `<div class="info-message">${this.t('messages.noEventsWeek', { venue: venueLabel })}</div>`;
            return;
        }
        this.updateWeekHeaderSummary(events.length);

        const byDay = {};
        const pad = (n) => String(n).padStart(2, '0');
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            byDay[key] = [];
        }
        events.forEach((e) => {
            // Gebruik _requestedDate (de kalenderdag van het API-verzoek) om timezone-fouten te vermijden
            let key = e._requestedDate || null;
            if (!key) {
                const dt = e.startDate ? new Date(e.startDate) : null;
                if (!dt) return;
                key = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
            }
            if (byDay[key]) byDay[key].push(e);
        });

        const escapeText = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

        const buildEventBlock = (event) => {
            const title = escapeText(event.title);
            const performer = event.performer ? `<p class="week-event-performer"><i class="fas fa-user"></i> ${escapeText(event.performer)}</p>` : '';
            let timeRange = '';
            if (event.scheduleStartTime && event.scheduleEndTime) timeRange = `${event.scheduleStartTime} – ${event.scheduleEndTime}`;
            else {
                const st = event.startDate ? this.formatTime(event.startDate) : '?';
                const et = event.endDate ? this.formatTime(event.endDate) : '?';
                timeRange = `${st} – ${et}`;
            }
            const venue = event.venue && event.venue !== 'Onbekend' ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeText(event.venue)}</p>` : '';
            const eventVenueId = event._organizationId && event.venueIds?.[0] ? `${event._organizationId}:${event.venueIds[0]}` : event.venueIds?.[0];
            const { showBalletvloer, showVleugel, showOrkestbak } = this.getBalletvloerVleugelDisplay(event.venue, eventVenueId);
            let resources = '';
            if (showBalletvloer || showVleugel || showOrkestbak) {
                const parts = [];
                const bv = event.balletvloerExplicit ? (event.hasBalletvloer ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                const vl = event.vleugelExplicit ? (event.hasVleugel ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                const ob = event.orkestbakExplicit || event.orkestbakValue
                    ? (event.orkestbakValue || (event.hasOrkestbak ? this.t('resources.ja') : this.t('resources.nee')))
                    : this.t('resources.nietBekend');
                if (this.shouldShowTechnicalPartForEvent(event, 'balletvloer', showBalletvloer)) parts.push(`Balletvloer: <strong>${bv}</strong>`);
                if (this.shouldShowTechnicalPartForEvent(event, 'vleugel', showVleugel)) parts.push(`Vleugel: <strong>${vl}</strong>`);
                if (this.shouldShowTechnicalPartForEvent(event, 'orkestbak', showOrkestbak)) parts.push(`Orkestbak: <strong>${ob}</strong>`);
                if (parts.length) {
                    resources = `<div class="week-event-resources">${parts.join(' · ')}</div>`;
                }
            }

            let tech = '';
            const techniekRaw = (event.urenInfo?.techniek || []).filter((entry) => {
                const u = String(entry).toUpperCase();
                return !u.includes('VRIJWILLIGER') && !u.includes('VOLUNTEER');
            });
            const looksLikeDateOrTime = (t) => {
                const s = String(t).trim();
                return /^\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|oktober|nov|dec)[a-z]*\s*[\d:\-\s]*$/i.test(s) || /^\d{1,2}:\d{2}(-\d{1,2}:\d{2})?$/.test(s);
            };
            const dateOnlyLine = (t) => /^\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|oktober|nov|dec)[a-z]*\s*[\d:\-\s]*$/i.test(String(t).trim()) || /^\d{1,2}:\d{2}(-\d{1,2}:\d{2})?$/.test(String(t).trim());
            const looksLikeVenueRole = (t) => {
                const u = String(t).trim().toUpperCase();
                return /\d+\s*man\b/.test(u) || /^(mcgz|wtpy|dkw|mckz|wtso|mkvk)\b/.test(u) || /^techniek\s+algemeen$/i.test(u) || /^techniek$/i.test(u) || u.length < 3;
            };
            const looksLikeName = (p) => !looksLikeDateOrTime(p) && !looksLikeVenueRole(p) && /^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(p) && p.length > 2;
            const timeOnly = (t) => String(t || '').replace(/^\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|oktober|nov|dec)[a-z]*\s+/i, '').trim() || t;
            const cleanRawPersonnelEntry = (entry) => {
                const parts = String(entry || '').split(/\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);
                if (!parts.length) return '';
                const isNoise = (p) => {
                    const s = p.toLowerCase();
                    return /^\d+\./.test(s) ||
                        /(wtpy|mcgz|dkw|mckz|wtso|mkvk)/.test(s) ||
                        /(techniek algemeen|hoofd publieksservice|receptie\/kassa|receptie|kassa)/.test(s) ||
                        /\d+\s*man\b/.test(s) ||
                        /<\s*\d+/.test(s);
                };
                const filtered = parts.filter(p => !isNoise(p));
                return (filtered.length ? filtered : parts).join(' - ').trim();
            };
            const extractNameAndTime = (e) => {
                const s = String(e).trim();
                const parts = s.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
                if (parts.length < 2) return null;
                const last = parts[parts.length - 1];
                if (!looksLikeDateOrTime(last)) return null;
                const name = parts[parts.length - 2];
                if (!looksLikeName(name)) return null;
                return { name, time: timeOnly(last) };
            };
            const fallbackParse = (e) => {
                const s = String(e).trim();
                const parts = s.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
                if (parts.length >= 4) {
                    const timePart = parts[parts.length - 1];
                    const namePart = parts[parts.length - 2];
                    if (looksLikeDateOrTime(timePart) && looksLikeName(namePart)) return { name: namePart, time: timeOnly(timePart) };
                }
                return null;
            };
            const isVenueRoleOnly = (e) => {
                const s = String(e).trim();
                return /\d+\s*man\b/i.test(s) && /techniek\s+algemeen/i.test(s) && !/[A-Za-z\u00C0-\u024F]{2,}\s+[A-Za-z\u00C0-\u024F]{2,}/.test(s);
            };
            const nameTimePairs = techniekRaw
                .filter(e => !isVenueRoleOnly(e))
                .map((e) => {
                    const parsed = extractNameAndTime(e) || fallbackParse(e);
                    if (parsed) return parsed;
                    const raw = cleanRawPersonnelEntry(e);
                    return raw ? { name: raw, time: '' } : null;
                })
                .filter(Boolean);
            const uniqPairs = [];
            const seen = new Set();
            for (const p of nameTimePairs) {
                const key = `${p.name}|${p.time}`;
                if (!seen.has(key)) { seen.add(key); uniqPairs.push(p); }
            }
            if (uniqPairs.length > 0) {
                const lines = uniqPairs.map((p) => escapeText(`${p.name} – ${p.time}`)).join('<br>');
                tech = `<div class="week-event-tech"><strong>Techniek:</strong><div class="week-event-tech-body">${lines}</div></div>`;
            }
            let extra = '';
            const extraParts = [];
            if (event.rawEvent) {
                const raw = event.rawEvent;
                if (raw.starttime && raw.defaultschedulestart && raw.starttime !== raw.defaultschedulestart) extraParts.push(`Opbouw: ${this.formatTime(raw.starttime)}`);
                if (raw.endtime && raw.defaultscheduleend && raw.endtime !== raw.defaultscheduleend) extraParts.push(`Afbouw: ${this.formatTime(raw.endtime)}`);
            }
            if (event.status && event.status !== 'unknown') {
                const statusStr = event.bookingManager ? `${event.status} – ${escapeText(event.bookingManager)}` : event.status;
                extraParts.push(statusStr);
            }
            if (extraParts.length) extra = `<p class="week-event-extra"><i class="fas fa-info-circle"></i> ${extraParts.join(' · ')}</p>`;

            let venueId = null;
            let eventDate = null;
            if (event.rawEvent?.locations && Array.isArray(event.rawEvent.locations) && event.rawEvent.locations.length > 0) {
                venueId = event.rawEvent.locations[0].id;
            }
            if (event.startDate) {
                const d = new Date(event.startDate);
                eventDate = d.toISOString().split('T')[0];
            }
            const clickable = venueId && eventDate;
            const clickAttrs = clickable ? ` data-venue-id="${venueId}" data-event-date="${eventDate}"` : '';
            const clickClass = clickable ? ' week-event-clickable' : '';

            return `
                <div class="week-event-card${clickClass}" draggable="false" data-event-id="${event.id || ''}"${clickAttrs}>
                    <h4 class="week-event-title" draggable="false">${title}</h4>
                    ${performer}
                    <p><i class="fas fa-clock"></i> <strong>${timeRange}</strong></p>
                    ${venue}
                    ${resources}
                    ${tech ? `<div class="week-event-tech-wrap">${tech}</div>` : ''}
                    ${extra}
                </div>`;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '<div class="week-overview-grid">';
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const dayEvts = byDay[key] || [];
            if (this.weekSortMode === 'time') {
                dayEvts.sort((a, b) => (a.startDate ? new Date(a.startDate).getTime() : 0) - (b.startDate ? new Date(b.startDate).getTime() : 0));
            } else {
                dayEvts.sort((a, b) => this.sortEventByDefault(a, b));
            }
            const isToday = d.getTime() === today.getTime();
            const dayLabel = dayNames[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
            html += `
                <div class="week-day-col ${isToday ? 'week-day-today' : ''}">
                    <div class="week-day-header">${dayLabel}${isToday ? ' (vandaag)' : ''}</div>
                    <div class="week-day-events">${dayEvts.map(buildEventBlock).join('')}</div>
                </div>`;
        }
        html += '</div>';
        container.innerHTML = html;

        // Weekoverzicht is alleen klikbaar; drag&drop staat hier expliciet uit.
        container.querySelectorAll('.week-event-card, .week-event-title').forEach((el) => {
            el.setAttribute('draggable', 'false');
            el.addEventListener('dragstart', (ev) => ev.preventDefault());
        });

        container.querySelectorAll('.rider-link').forEach((a) => {
            a.addEventListener('click', async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const url = a.getAttribute('data-rider-url');
                if (url && window.electronAPI?.openExternal) await window.electronAPI.openExternal(url);
            });
        });

        container.querySelectorAll('.week-event-clickable').forEach((card) => {
            card.addEventListener('click', async (ev) => {
                if (ev.target.closest('.rider-link')) return;
                const venueId = card.getAttribute('data-venue-id');
                const eventDate = card.getAttribute('data-event-date');
                if (!venueId || !eventDate) return;
                this._pendingHistorySnapshot = this.createViewSnapshot();
                await this.selectVenueAndDate(venueId, eventDate);
                await this.showDetailView();
            });
        });
    }

    updateWeekHeaderSummary(eventCount = 0) {
        this.weekEventCount = Number(eventCount) || 0;
        const summaryEl = document.getElementById('weekViewSummary');
        if (!summaryEl) return;

        const filters = [];
        if (this.hideCancelledEvents) filters.push(this.t('weekView.filterHideCancelled'));
        if (this.filterOnlyWithTechnischPersoneel) filters.push(this.t('weekView.filterTechnischPersoneel'));
        if (this.filterOnlyWithTechnischeResources) filters.push(this.t('weekView.filterTechnischeResources'));

        const countText = this.weekEventCount === 1
            ? this.t('weekView.eventsSingle', { n: this.weekEventCount })
            : this.t('weekView.eventsPlural', { n: this.weekEventCount });
        const filterText = filters.length > 0 ? filters.join(', ') : this.t('weekView.filterNone');
        summaryEl.textContent = `${countText} · ${this.t('weekView.filtersPrefix')}: ${filterText}`;
    }

    getDateRange() {
        // Gebruik geselecteerde datum in plaats van altijd vandaag
        const selectedDate = new Date(this.selectedDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        // Format als YYYY-MM-DD (gebruik locale date string om tijdzone problemen te voorkomen)
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        return {
            start: dateStr,
            end: dateStr
        };
    }

    getDateBounds() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date(today);
        minDate.setDate(today.getDate() - this.maxDateOffsetBackward);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + this.maxDateOffsetForward);
        return { today, minDate, maxDate };
    }

    // Week = geselecteerde dag t/m +6 dagen (7 dagen vanaf selectedDate; volgt agenda / "kies eigen datum").
    getWeekDateRange() {
        const start = new Date(this.selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const fmt = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        return { start: fmt(start), end: fmt(end), startDate: start, endDate: end };
    }

    setupCustomDateSelector() {
        const customSelect = document.getElementById('dateSelectCustom');
        const trigger = customSelect?.querySelector('.custom-select-trigger');
        const optionsContainer = document.getElementById('dateSelectOptions');
        
        if (!customSelect || !trigger || !optionsContainer) {
            console.error('Custom date selector elementen niet gevonden');
            return;
        }
        
        // Toggle dropdown
        trigger.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Sluit dropdown bij klik buiten
        if (!this.dateSelectorClickHandler) {
            this.dateSelectorClickHandler = (e) => {
                if (!customSelect.contains(e.target)) {
                    customSelect.classList.remove('open');
                }
            };
            document.addEventListener('click', this.dateSelectorClickHandler);
        }
        
        // Vul dropdown met datums
        this.populateDateSelector();
    }

    setupWeekViewSort() {
        const wrap = document.getElementById('weekViewSort');
        if (!wrap) return;
        const btns = wrap.querySelectorAll('.week-view-sort-btn');
        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.sort;
                if (!mode || mode === this.weekSortMode) return;
                this.weekSortMode = mode;
                btns.forEach((b) => b.classList.toggle('active', b.dataset.sort === mode));
                if (this.data.weekYesplan) this.updateWeekDisplay(this.data.weekYesplan);
            });
        });
    }

    populateDateSelector() {
        const optionsContainer = document.getElementById('dateSelectOptions');
        if (!optionsContainer) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        
        // Genereer opties voor vandaag + 7 dagen
        optionsContainer.innerHTML = '';
        for (let i = 0; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
            const dateStr = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
            
            let label;
            if (i === 0) {
                label = `${this.t('date.today')} (${dayName})`;
            } else {
                label = `${dayName} ${dateStr}`;
            }
            
            const option = document.createElement('div');
            option.className = 'custom-select-option';
            option.dataset.date = date.toISOString().split('T')[0];
            option.textContent = label;
            
            option.addEventListener('click', () => {
                this.selectDate(date);
            });
            
            optionsContainer.appendChild(option);
        }
        
        // Voeg "Kies eigen datum" optie toe helemaal onderaan
        const separator = document.createElement('div');
        separator.style.height = '1px';
        separator.style.backgroundColor = '#4a5568';
        separator.style.margin = '0.5rem 0';
        optionsContainer.appendChild(separator);
        
        const customDateOption = document.createElement('div');
        customDateOption.className = 'custom-select-option';
        customDateOption.style.color = '#818cf8';
        customDateOption.style.fontWeight = '500';
        customDateOption.innerHTML = `<i class="fas fa-calendar-alt"></i> ${this.t('date.chooseDate')}`;
        customDateOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCustomDatePicker();
        });
        optionsContainer.appendChild(customDateOption);
    }
    
    async selectDate(date) {
        date.setHours(0, 0, 0, 0);
        if (!this._isNavigatingBack) {
            this.viewHistory.push(this.createViewSnapshot());
            if (this.viewHistory.length > 50) this.viewHistory.shift();
        }
        const { minDate, maxDate } = this.getDateBounds();
        
        // Alleen binnen bereik toestaan (max 1 maand terug en 1 jaar vooruit)
        if (date >= minDate && date <= maxDate) {
            this.selectedDate = date;
            this.updateDateDisplay();
            this.saveSelectedDate();
            
            if (this.currentView === 'week') {
                await this.loadWeekData();
            } else if (this.selectedVenues.length === 1) {
                this.detailContext = null;
                await this.showDetailView(true, true);
            } else {
                await this.showHomeView();
            }
        }
        
        const customSelect = document.getElementById('dateSelectCustom');
        if (customSelect) {
            customSelect.classList.remove('open');
        }
    }
    
    async saveSelectedDate() {
        if (window.electronAPI) {
            try {
                // Haal huidige app config op
                const currentConfig = this.config.app || {};
                // Update selectedDate
                currentConfig.selectedDate = this.selectedDate.toISOString();
                // Sla op
                await window.electronAPI.saveConfig('app', currentConfig);
                // Update lokale config
                this.config.app = currentConfig;
            } catch (error) {
                console.error('Fout bij opslaan gekozen datum:', error);
            }
        }
    }
    
    showCustomDatePicker() {
        // Sluit datum dropdown
        const customSelect = document.getElementById('dateSelectCustom');
        if (customSelect) {
            customSelect.classList.remove('open');
        }

        const { minDate, maxDate } = this.getDateBounds();
        const minDateStr = minDate.toISOString().split('T')[0];
        const maxDateStr = maxDate.toISOString().split('T')[0];
        
        // Maak een modal voor datum selectie
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-alt"></i> ${this.t('date.chooseDate')}</h2>
                    <button class="modal-close" id="closeCustomDatePicker">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="customDateInput">${this.t('date.selectDate')}</label>
                        <input type="date" id="customDateInput" class="form-input" 
                               min="${minDateStr}"
                               max="${maxDateStr}"
                               value="${this.selectedDate.toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group" style="margin-top: 1rem;">
                        <label for="customDateTextInput">${this.t('date.manualDate')}</label>
                        <input type="text" id="customDateTextInput" class="form-input" 
                               placeholder="${this.t('date.datePlaceholder')}">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" id="confirmCustomDate" style="flex: 1;">
                            <i class="fas fa-check"></i> ${this.t('date.confirm')}
                        </button>
                        <button class="btn btn-secondary" id="cancelCustomDate" style="flex: 1;">
                            <i class="fas fa-times"></i> ${this.t('date.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('#closeCustomDatePicker');
        const cancelBtn = modal.querySelector('#cancelCustomDate');
        const confirmBtn = modal.querySelector('#confirmCustomDate');
        const dateInput = modal.querySelector('#customDateInput');
        const dateTextInput = modal.querySelector('#customDateTextInput');
        
        // Helper om dd-mm-jjjj te parsen naar YYYY-MM-DD
        const parseDateString = (dateStr) => {
            if (!dateStr) return null;
            // Verwijder whitespace
            dateStr = dateStr.trim();
            // Match dd-mm-jjjj of d-m-jjjj
            const match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (match) {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10);
                const year = parseInt(match[3], 10);
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
                    const date = new Date(year, month - 1, day);
                    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        return `${y}-${m}-${d}`;
                    }
                }
            }
            return null;
        };
        
        // Update tekstveld als date input verandert (YYYY-MM-DD lokaal, geen UTC-shift)
        dateInput.addEventListener('change', () => {
            if (dateInput.value) {
                const p = dateInput.value.split('-');
                if (p.length === 3) {
                    const y = parseInt(p[0], 10);
                    const mo = parseInt(p[1], 10) - 1;
                    const da = parseInt(p[2], 10);
                    const date = new Date(y, mo, da);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    dateTextInput.value = `${day}-${month}-${year}`;
                }
            }
        });
        
        // Update date input als tekstveld verandert
        dateTextInput.addEventListener('change', () => {
            const parsedDate = parseDateString(dateTextInput.value);
            if (parsedDate) {
                dateInput.value = parsedDate;
            }
        });
        
        // Enter toets in tekstveld
        dateTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const parsedDate = parseDateString(dateTextInput.value);
                if (parsedDate) {
                    dateInput.value = parsedDate;
                    confirmBtn.click();
                }
            }
        });
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        const handleConfirm = async () => {
            let selectedDateStr = dateInput.value;
            const parsedManual = dateTextInput.value ? parseDateString(dateTextInput.value.trim()) : null;
            if (parsedManual) {
                selectedDateStr = parsedManual;
                dateInput.value = parsedManual;
            } else if (!selectedDateStr && dateTextInput.value) {
                selectedDateStr = parseDateString(dateTextInput.value);
                if (selectedDateStr) {
                    dateInput.value = selectedDateStr;
                }
            }

            if (selectedDateStr) {
                const p = String(selectedDateStr).trim().split('-');
                let selectedDate = null;
                if (p.length === 3) {
                    const y = parseInt(p[0], 10);
                    const mo = parseInt(p[1], 10) - 1;
                    const da = parseInt(p[2], 10);
                    if (!Number.isNaN(y) && !Number.isNaN(mo) && !Number.isNaN(da)) {
                        selectedDate = new Date(y, mo, da);
                        selectedDate.setHours(0, 0, 0, 0);
                    }
                }
                if (!selectedDate || Number.isNaN(selectedDate.getTime())) return;

                const { minDate, maxDate } = this.getDateBounds();

                if (selectedDate >= minDate && selectedDate <= maxDate) {
                    await this.selectDate(selectedDate);
                    closeModal();
                } else {
                    alert('Je kunt alleen een datum kiezen tussen 1 week terug en 1 jaar vooruit.');
                }
            }
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        
        // Focus en open kalender meteen
        setTimeout(() => {
            dateInput.focus();
            dateInput.showPicker ? dateInput.showPicker() : dateInput.click();
        }, 100);
        
        // Sluit bij klik buiten modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    async goToNextDay() {
        const { maxDate } = this.getDateBounds();
        if (!this._isNavigatingBack) {
            this.viewHistory.push(this.createViewSnapshot());
            if (this.viewHistory.length > 50) this.viewHistory.shift();
        }
        
        const nextDate = new Date(this.selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Check of we niet verder gaan dan max datum
        if (nextDate <= maxDate) {
            this.selectedDate = nextDate;
            this.updateDateDisplay();
            this.saveSelectedDate();
            
            // Weekweergave: één dag opschuiven = hele week (7 dagen vanaf selectedDate) meeschuiven
            if (this.currentView === 'week') {
                await this.loadWeekData();
                return;
            }
            if (this.selectedVenues.length === 1) {
                const wasVoorstellingTimer = this.currentView === 'voorstellingTimer';
                this.detailContext = null;
                await this.showDetailView(true, true);
                if (wasVoorstellingTimer && this.canOpenVoorstellingTimer()) {
                    await this.showVoorstellingTimerView();
                }
            } else {
                await this.showHomeView();
            }
        }
    }

    async goToPreviousDay() {
        const { minDate } = this.getDateBounds();
        if (!this._isNavigatingBack) {
            this.viewHistory.push(this.createViewSnapshot());
            if (this.viewHistory.length > 50) this.viewHistory.shift();
        }
        
        const prevDate = new Date(this.selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        
        // Check of we niet verder gaan dan een week terug
        if (prevDate >= minDate) {
            this.selectedDate = prevDate;
            this.updateDateDisplay();
            this.saveSelectedDate();
            
            // Weekweergave: één dag terug = hele week meeschuiven
            if (this.currentView === 'week') {
                await this.loadWeekData();
                return;
            }
            if (this.selectedVenues.length === 1) {
                const wasVoorstellingTimer = this.currentView === 'voorstellingTimer';
                this.detailContext = null;
                await this.showDetailView(true, true);
                if (wasVoorstellingTimer && this.canOpenVoorstellingTimer()) {
                    await this.showVoorstellingTimerView();
                }
            } else {
                await this.showHomeView();
            }
        }
    }
    
    setDateNavDisabled(disabled) {
        this._dateNavLoading = !!disabled;
        const prevBtn = document.getElementById('prevDayBtn');
        const nextBtn = document.getElementById('nextDayBtn');
        if (disabled) {
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
        } else {
            this.updateDateDisplay();
        }
    }

    updateDateDisplay() {
        const { today, minDate, maxDate } = this.getDateBounds();
        const selected = new Date(this.selectedDate);
        selected.setHours(0, 0, 0, 0);
        
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const dayName = selected.toLocaleDateString(locale, { weekday: 'long' });
        const dateStr = selected.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
        
        const dateText = document.getElementById('dateText');
        if (dateText) {
            if (selected.getTime() === today.getTime()) {
                dateText.textContent = `${this.t('date.today')} (${dayName})`;
            } else {
                dateText.textContent = `${dayName} ${dateStr}`;
            }
        }
        
        const prevBtn = document.getElementById('prevDayBtn');
        const nextBtn = document.getElementById('nextDayBtn');
        if (prevBtn && nextBtn) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
            if (this._dateNavLoading) return;
            prevBtn.disabled = selected.getTime() <= minDate.getTime();
            nextBtn.disabled = selected.getTime() >= maxDate.getTime();
            prevBtn.classList.toggle('btn-danger', selected.getTime() <= minDate.getTime());
        }
        
        // Update selected state in dropdown
        const optionsContainer = document.getElementById('dateSelectOptions');
        if (optionsContainer) {
            const selectedDateStr = selected.toISOString().split('T')[0];
            const options = optionsContainer.querySelectorAll('.custom-select-option');
            options.forEach(option => {
                if (option.dataset.date === selectedDateStr) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }
    }

    updateYesplanDisplay(data) {
        const container = document.getElementById('yesplanContent');
        const dashboardGrid = document.querySelector('.dashboard-grid');
        
        const selectedVenueIds = this.getSelectedVenueIds();
        // Check of "Alle zalen" is geselecteerd
        const isAllVenues = selectedVenueIds.length === 0;

        const renderNoEventsMessage = () => {
            if (this.currentView === 'detail') this.updateDetailViewTitle(this.getVenueName(), null);
            const venueName = this.getVenueName();
            const d = this.selectedDate ? new Date(this.selectedDate) : new Date();
            const dateLabel = d.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const message = venueName
                ? this.t('messages.noEvents', { venue: venueName, date: dateLabel })
                : this.t('messages.noEventsDate', { date: dateLabel });
            container.innerHTML = `<div class="info-message">${message}</div>`;
        };
        
        // Pas grid layout aan
        if (isAllVenues) {
            dashboardGrid.classList.add('all-venues');
        } else {
            dashboardGrid.classList.remove('all-venues');
        }
        
        if (!data.success || !data.data || data.data.length === 0) {
            renderNoEventsMessage();
            return;
        }

        // Filter geannuleerde events als filter actief is
        let events = [...data.data];
        
        // Filter op geselecteerde zalen (multi-select)
        if (selectedVenueIds.length > 0) {
            events = events.filter(event => {
                const locations = Array.isArray(event.rawEvent?.locations) ? event.rawEvent.locations : [];
                const locationIds = locations
                    .map(loc => String(loc?.id || '').trim())
                    .filter(Boolean);
                const eventVenueIds = Array.isArray(event.venueIds)
                    ? event.venueIds.map(id => String(id).trim()).filter(Boolean)
                    : [];
                const eventOrg = String(event._organizationId || '').trim();

                return selectedVenueIds.some((sid) => {
                    const s = String(sid || '').trim();
                    if (!s) return false;
                    if (s.includes(':')) {
                        const [org, id] = s.split(':');
                        if (String(org) !== eventOrg) return false;
                        return locationIds.includes(String(id)) || eventVenueIds.includes(String(id));
                    }
                    return locationIds.includes(s) || eventVenueIds.includes(s);
                });
            });
        }
        
        if (this.hideCancelledEvents) {
            events = events.filter(event => {
                const status = event.status?.toLowerCase() || '';
                const statusName = (typeof event.status === 'object' && event.status?.name) ? event.status.name.toLowerCase() : '';
                const isCancelled = status.includes('geannuleerd') || 
                                  status.includes('cancelled') || 
                                  status.includes('canceled') ||
                                  statusName.includes('geannuleerd') || 
                                  statusName.includes('cancelled') || 
                                  statusName.includes('canceled');
                return !isCancelled;
            });
        }

        if (this.filterOnlyWithTechnischPersoneel) {
            events = events.filter(event => (event.urenInfo?.techniek?.length ?? 0) > 0);
        }
        if (this.filterOnlyWithTechnischeResources) {
            events = events.filter(event => {
                const hasResources = Array.isArray(event.resources) && event.resources.length > 0;
                const hasTechMaterial = Array.isArray(event.technicalMaterialResources) && event.technicalMaterialResources.length > 0;
                return hasResources || hasTechMaterial;
            });
        }

        if (this.searchQuery && this.searchQuery.length >= 2 && !this.yesplanDataIsSearchResults) {
            events = events.filter((e) => this.matchSearchQuery(e.title || e.name, this.searchQuery));
        }

        // In detail view: alleen evenementen van hetzelfde hoofdevenement (zelfde productie ofzelfde eventgroep)
        if (this.currentView === 'detail' && this.detailContext) {
            const ctx = this.detailContext;
            events = events.filter(event => {
                if (ctx.groupId) {
                    const gid = event.rawEvent?.group?.id ?? event.rawEvent?.group?.uuid;
                    if (gid != null && String(gid) === ctx.groupId) return true;
                }
                if (ctx.groupName) {
                    const gName = (event.rawEvent?.group && typeof event.rawEvent.group === 'object')
                        ? (event.rawEvent.group.name || event.rawEvent.group.title)
                        : (typeof event.rawEvent?.group === 'string' ? event.rawEvent.group : '');
                    if (gName && String(gName).trim().toLowerCase() === String(ctx.groupName).trim().toLowerCase()) return true;
                }
                if (ctx.productionId) {
                    const pid = event.rawEvent?.production?.id ?? event.rawEvent?.production?.uuid;
                    if (pid != null && String(pid) === ctx.productionId) return true;
                }
                if (ctx.productionName) {
                    const pName = (event.rawEvent?.production && typeof event.rawEvent.production === 'object')
                        ? (event.rawEvent.production.name || event.rawEvent.production.title)
                        : (typeof event.rawEvent?.production === 'string' ? event.rawEvent.production : '');
                    if (pName && String(pName).trim().toLowerCase() === String(ctx.productionName).trim().toLowerCase()) return true;
                }
                if (ctx.eventName) {
                    const en = event.name || event.title || '';
                    if (en && String(en).trim().toLowerCase() === String(ctx.eventName).trim().toLowerCase()) return true;
                }
                return false;
            });
        }

        if (!data.success || !data.data || data.data.length === 0) {
            renderNoEventsMessage();
            return;
        }
        
        // Sorteer events - eerst opgeslagen volgorde (als in home view), anders default sortering
        if (this.currentView === 'home') {
            // Herstel opgeslagen volgorde voor deze datum
            const dateKey = this.selectedDate.toISOString().split('T')[0];
            const savedOrder = this.config.app?.eventOrder?.[dateKey];
            
            if (savedOrder && Array.isArray(savedOrder)) {
                // Sorteer op basis van opgeslagen volgorde
                events.sort((a, b) => {
                    const indexA = savedOrder.indexOf(String(a.id));
                    const indexB = savedOrder.indexOf(String(b.id));
                    
                    // Events in opgeslagen volgorde komen eerst
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    
                    // Events niet in opgeslagen volgorde: gebruik default sortering (zaal + tijd)
                    return this.sortEventByDefault(a, b);
                });
            } else {
                // Geen opgeslagen volgorde: gebruik default sortering (zaal + tijd)
                events.sort((a, b) => this.sortEventByDefault(a, b));
            }
        } else {
            // Detail view: sorteer op starttijd
            events.sort((a, b) => {
                const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
                const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
                return timeA - timeB;
            });
        }

        // Update mastertitel in detail view: zaal + evenementnaam (1x), anders alleen zaal
        const isDetailSingleEvent = this.currentView === 'detail' && events.length === 1;
        const hideVenueInCardFooter = selectedVenueIds.length === 1 || this.currentView === 'detail';
        if (this.currentView === 'detail') {
            if (isDetailSingleEvent) {
                const ev = events[0];
                const eventTitle = this.buildEventDisplayTitle(ev.title, ev.performer);
                this.updateDetailViewTitle(this.getVenueName(), eventTitle);
            } else {
                this.updateDetailViewTitle(this.getVenueName(), null);
            }
        }

        container.innerHTML = `
            <div class="events-list">
                ${events.map(event => {
                    // Titel zonder artiest
                    const title = event.title;
                    
                    // Artiest op aparte regel (ook als Yesplan titel en artiest dezelfde tekst heeft)
                    const performerInfo = event.performer
                        ? `<p style="margin-top: 0.25rem; color: #a0aec0; font-size: 0.9rem;"><i class="fas fa-user"></i> ${event.performer}</p>`
                        : '';
                    const showOrgInfo = this.isBothOrgsActive();
                    const orgNumRaw = String(event._organizationId || '').trim();
                    const orgNum = orgNumRaw === '2' ? 2 : 1;
                    const orgName = this.getOrgDisplayName(orgNum);
                    const orgBadge = showOrgInfo
                        ? `<span style="margin-left: 0.75rem; color: #93c5fd; font-size: 0.85rem; white-space: nowrap;"><i class="fas fa-building"></i> ${this.escapeHtml(orgName)}</span>`
                        : '';
                    
                    // Gebruik schedule tijden als beschikbaar, anders start/end tijd
                    let timeRange = '';
                    if (event.scheduleStartTime && event.scheduleEndTime) {
                        // Gebruik schedule tijden (bijv. 20:00 - 22:05)
                        timeRange = `${event.scheduleStartTime} - ${event.scheduleEndTime}`;
                    } else {
                        // Fallback naar start/end tijd
                        const startTime = event.startDate ? this.formatTime(event.startDate) : 'Onbekend';
                        const endTime = event.endDate ? this.formatTime(event.endDate) : 'Onbekend';
                        timeRange = `${startTime} - ${endTime}`;
                    }
                    
                    // Resources (balletvloer, vleugel, orkestbak) - per zaal configureerbaar in instellingen
                    const eventVenueId = event._organizationId && event.venueIds?.[0] ? `${event._organizationId}:${event.venueIds[0]}` : event.venueIds?.[0];
                    const { showBalletvloer, showVleugel, showOrkestbak } = this.getBalletvloerVleugelDisplay(event.venue, eventVenueId);
                    let resourcesInfo = '';
                    if (showBalletvloer || showVleugel || showOrkestbak) {
                        const topLineParts = [];
                        if (this.shouldShowTechnicalPartForEvent(event, 'balletvloer', showBalletvloer)) {
                            const balletvloerStatus = event.balletvloerExplicit ? (event.hasBalletvloer ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                            topLineParts.push(`Balletvloer: <strong>${balletvloerStatus}</strong>`);
                        }
                        if (this.shouldShowTechnicalPartForEvent(event, 'vleugel', showVleugel)) {
                            const vleugelStatus = event.vleugelExplicit ? (event.hasVleugel ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                            topLineParts.push(`Vleugel: <strong>${vleugelStatus}</strong>`);
                        }
                        if (this.shouldShowTechnicalPartForEvent(event, 'orkestbak', showOrkestbak)) {
                            const orkestbakStatus = (event.orkestbakExplicit || event.orkestbakValue)
                                ? (event.orkestbakValue || (event.hasOrkestbak ? this.t('resources.ja') : this.t('resources.nee')))
                                : this.t('resources.nietBekend');
                            topLineParts.push(`Orkestbak: <strong>${orkestbakStatus}</strong>`);
                        }
                        const topLineHtml = topLineParts
                            .map((part) => `<span style="white-space: nowrap;">${part}</span>`)
                            .join('<span style="opacity:.7;">&nbsp;&nbsp;</span>');
                        if (topLineHtml) {
                            resourcesInfo = `
                                <div style="margin-top: 0.5rem; padding: 0.5rem; background: #374151; border-radius: 6px; font-size: 0.85rem; color: #a0aec0;">
                                    <div style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${topLineHtml}</div>
                                </div>
                            `;
                        }
                    }
                    
                    // Technisch materiaal uit /resources/Technisch materiaal
                    const escapeText = (value) => this.escapeHtml(value);
                    const infoBoxStyle = 'margin-top: 0.35rem; padding: 0.6rem 0.75rem; background: #374151; border-radius: 6px; font-size: 0.85rem;';

                    let technicalMaterialInfo = '';
                    const technicalMaterialResources = event.technicalMaterialResources || [];
                    if (technicalMaterialResources.length > 0) {
                        const materialsHtml = technicalMaterialResources.map(item => {
                            const escapedItem = escapeText(item);
                            return `<span style="display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; border: 1px solid #4a5568; border-radius: 6px; background: #2d3748; color: #e2e8f0; font-size: 0.8rem;">${escapedItem}</span>`;
                        }).join(' ');
                        technicalMaterialInfo = `<div style="${infoBoxStyle}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-toolbox" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technisch materiaal:</span>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">${materialsHtml}</div>
                        </div>`;
                    } else {
                        technicalMaterialInfo = `<div style="${infoBoxStyle}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-toolbox" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technisch materiaal:</span>
                            </div>
                            <div style="color: #a0aec0; padding-left: 1.75rem;">-</div>
                        </div>`;
                    }

                    // Technische opmerkingen
                    const rawRemarks = String(event.technicalRemarks || '').trim();
                    const lowerRemarks = rawRemarks.toLowerCase();
                    const isPlaceholderRemarks =
                        !rawRemarks ||
                        lowerRemarks === 'opmerkingen techniek' ||
                        lowerRemarks === 'opmerkingentechniek' ||
                        lowerRemarks.includes('productie_technischelijst_opmerkingentechniek');
                    const remarksText = isPlaceholderRemarks ? '-' : rawRemarks;
                    const escapedRemarks = escapeText(remarksText);
                    let technicalRemarksInfo = `<div style="${infoBoxStyle}">
                        <div style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <i class="fas fa-comment-alt" style="color: #818cf8; margin-top: 0.125rem;"></i>
                            <div style="flex: 1;">
                                <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.25rem;">Opmerkingen techniek:</div>
                                <div style="color: #a0aec0; white-space: pre-wrap; word-wrap: break-word;">${escapedRemarks}</div>
                            </div>
                        </div>
                    </div>`;
                    
                    // Alle documenten uit TECHNISCHE LIJST
                    let technicalListInfo = '';
                    const technicalDocs = event.technicalListDocuments || [];
                    
                    if (technicalDocs.length > 0) {
                        const docsHtml = technicalDocs.map(doc => {
                            // Gebruik altijd de bestandsnaam uit de URL
                            const urlParts = doc.url.split('/');
                            const fileName = urlParts[urlParts.length - 1] || doc.name || 'Document';
                            const decodedFileName = decodeURIComponent(fileName).replace(/%20/g, ' ');
                            const docName = decodedFileName.endsWith('.pdf') ? decodedFileName.replace('.pdf', '') : decodedFileName;
                            const docDate = doc.date ? new Date(doc.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                            const docAuthor = doc.author || '';
                            const escapedUrl = doc.url.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            const category = doc.category || 'Document';
                            
                            return `
                                <div style="margin-top: 0.5rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <i class="fas fa-file-pdf" style="color: #818cf8;"></i>
                                        <span style="color: #e2e8f0; font-weight: 500;">${category}:</span>
                                    </div>
                                    <a href="#" class="rider-link" data-rider-url="${escapedUrl}" style="color: #818cf8; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; cursor: pointer;">
                                        <i class="fas fa-external-link-alt"></i> <span style="text-decoration: underline;">${docName}</span>
                                    </a>
                                    ${docDate || docAuthor ? `<div style="font-size: 0.75rem; color: #a0aec0; margin-top: 0.25rem;">${docDate ? `PDF, ${docDate}` : ''}${docDate && docAuthor ? ', ' : ''}${docAuthor || ''}</div>` : ''}
                                </div>
                            `;
                        }).join('');
                        
                        technicalListInfo = `<div style="${infoBoxStyle}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-folder-open" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technische lijst:</span>
                            </div>
                            ${docsHtml}
                        </div>`;
                    } else {
                        technicalListInfo = `<div style="${infoBoxStyle}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-folder-open" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technische lijst:</span>
                            </div>
                            <div style="color: #a0aec0; padding-left: 1.75rem;">-</div>
                        </div>`;
                    }
                    
                    // Backwards compatibility: toon ook oude rider attachment als er geen nieuwe documenten zijn
                    if (technicalDocs.length === 0 && event.riderAttachment && event.riderAttachment.url) {
                        const urlParts = event.riderAttachment.url.split('/');
                        const fileName = urlParts[urlParts.length - 1] || 'Technische lijst';
                        const decodedFileName = decodeURIComponent(fileName).replace(/%20/g, ' ');
                        const riderName = decodedFileName.endsWith('.pdf') ? decodedFileName.replace('.pdf', '') : decodedFileName;
                        const riderDate = event.riderAttachment.date ? new Date(event.riderAttachment.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                        const riderAuthor = event.riderAttachment.author || '';
                        const escapedUrl = event.riderAttachment.url.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        technicalListInfo = `<div style="${infoBoxStyle}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-folder-open" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technische lijst:</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-file-pdf" style="color: #818cf8;"></i>
                                <span style="color: #e2e8f0; font-weight: 500;">Technische lijst bijlage:</span>
                            </div>
                            <a href="#" class="rider-link" data-rider-url="${escapedUrl}" style="color: #818cf8; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; cursor: pointer;">
                                <i class="fas fa-external-link-alt"></i> <span style="text-decoration: underline;">${riderName}</span>
                            </a>
                            ${riderDate || riderAuthor ? `<div style="font-size: 0.75rem; color: #a0aec0; margin-top: 0.25rem;">${riderDate ? `PDF, ${riderDate}` : ''}${riderDate && riderAuthor ? ', ' : ''}${riderAuthor || ''}</div>` : ''}
                        </div>`;
                    }
                    
                    // Extra tijd informatie (opbouw, etc.) als beschikbaar
                    let extraTimeInfo = '';
                    if (event.rawEvent) {
                        const raw = event.rawEvent;
                        // Check voor andere tijd gerelateerde velden
                        const times = [];
                        if (raw.starttime && raw.defaultschedulestart && raw.starttime !== raw.defaultschedulestart) {
                            const setupStart = this.formatTime(raw.starttime);
                            times.push(`Opbouw: ${setupStart}`);
                        }
                        if (raw.endtime && raw.defaultscheduleend && raw.endtime !== raw.defaultscheduleend) {
                            const teardownEnd = this.formatTime(raw.endtime);
                            times.push(`Afbouw: ${teardownEnd}`);
                        }
                        if (times.length > 0) {
                            extraTimeInfo = `<p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;"><i class="fas fa-info-circle"></i> ${times.join(' | ')}</p>`;
                        }
                    }
                    
                    
                    // Zaal en status: bij één zaal of detailweergave geen dubbele zaal onderaan; status blijft
                    let venueStatusInfo = '';
                    if (!isDetailSingleEvent) {
                        const statusPart = (event.status && event.status !== 'unknown') 
                            ? (event.bookingManager 
                                ? `${event.status} – ${escapeText(event.bookingManager)}` 
                                : event.status)
                            : null;
                        if (hideVenueInCardFooter) {
                            venueStatusInfo = statusPart
                                ? `<p style="margin-top: 0.5rem; text-align: right;"><i class="fas fa-info-circle"></i> ${statusPart}</p>`
                                : '';
                        } else {
                            venueStatusInfo = (event.venue && event.venue !== 'Onbekend' && statusPart) 
                                ? `<p style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                    <span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
                                    <span><i class="fas fa-info-circle"></i> ${statusPart}</span>
                                </p>`
                                : (event.venue && event.venue !== 'Onbekend' 
                                    ? `<p><i class="fas fa-map-marker-alt"></i> ${event.venue}</p>`
                                    : '') + (statusPart 
                                        ? `<p><i class="fas fa-info-circle"></i> ${statusPart}</p>`
                                        : '');
                        }
                    } else if (event.status && event.status !== 'unknown') {
                        const statusPart = event.bookingManager 
                            ? `${event.status} – ${escapeText(event.bookingManager)}` 
                            : event.status;
                        venueStatusInfo = `<p style="margin-top: 0.5rem;"><i class="fas fa-info-circle"></i> ${statusPart}</p>`;
                    }
                    
                    // Gebruik canonieke zaal-id (incl. org-prefix indien nodig) voor klikfunctionaliteit.
                    let venueId = this.getEventVenueSelectionId(event);
                    let eventDate = null;
                    if (!venueId && event.rawEvent && event.rawEvent.locations && Array.isArray(event.rawEvent.locations) && event.rawEvent.locations.length > 0) {
                        venueId = event.rawEvent.locations[0].id;
                    }
                    if (event.startDate) {
                        // Format datum als YYYY-MM-DD
                        const date = new Date(event.startDate);
                        eventDate = date.toISOString().split('T')[0];
                    }
                    
                    // Maak evenement klikbaar als "Alle zalen" is geselecteerd OF als we in home view zijn
                    const isHomeView = this.currentView === 'home';
                    const clickableClass = (isAllVenues || isHomeView) && venueId && eventDate ? 'clickable' : '';
                    const production = event.rawEvent?.production;
                    const productionId = (production && (production.id ?? production.uuid)) ? String(production.id ?? production.uuid) : '';
                    const productionName = (production && typeof production === 'object') ? (production.name || production.title || '') : (typeof production === 'string' ? production : '');
                    const group = event.rawEvent?.group;
                    const groupId = (group && (group.id ?? group.uuid)) ? String(group.id ?? group.uuid) : '';
                    const groupName = (group && typeof group === 'object') ? (group.name || group.title || '') : (typeof group === 'string' ? group : '');
                    const eventNameVal = event.name || event.title || '';
                    const clickableAttrs = (isAllVenues || isHomeView) && venueId && eventDate 
                        ? `data-venue-id="${this.escapeHtml(venueId)}" data-event-date="${eventDate}" data-production-id="${this.escapeHtml(productionId)}" data-production-name="${this.escapeHtml(productionName)}" data-group-id="${this.escapeHtml(groupId)}" data-group-name="${this.escapeHtml(groupName)}" data-event-name="${this.escapeHtml(eventNameVal)}"` 
                        : '';
                    
                    // Maak draagbaar in home view - alleen de titel is draggable
                    const draggableAttr = isHomeView ? 'draggable="true"' : '';
                    const eventIdAttr = event.id ? `data-event-id="${event.id}"` : '';
                    const titleBlock = isDetailSingleEvent ? '' : `
                        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem;">
                            <h4 ${draggableAttr} class="${isHomeView ? 'drag-handle' : ''}" style="margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</h4>
                            ${orgBadge}
                        </div>
                        ${performerInfo}
                    `;
                    
                    const venueNameAttr = event.venue && event.venue !== 'Onbekend'
                        ? `data-venue-name="${this.escapeHtml(String(event.venue))}"`
                        : '';

                    return `
                    <div class="data-item ${clickableClass}" ${clickableAttrs} ${eventIdAttr} ${venueNameAttr} style="display:flex;flex-direction:column;height:100%;">
                        ${titleBlock}
                        <p><i class="fas fa-clock"></i> <strong>${timeRange}</strong></p>
                        ${extraTimeInfo}
                        ${resourcesInfo}
                        ${technicalListInfo}
                        ${technicalRemarksInfo}
                        ${technicalMaterialInfo}
                        <div class="event-bottom-meta" style="margin-top:auto;">${venueStatusInfo}</div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
        
        // Voeg event listeners toe voor rider links na het renderen
        try {
            setTimeout(() => {
                const riderLinks = container.querySelectorAll('.rider-link');
                riderLinks.forEach(link => {
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Voorkom dat het evenement wordt geklikt
                        const url = link.getAttribute('data-rider-url');
                        if (url && window.electronAPI && window.electronAPI.openExternal) {
                            try {
                                await window.electronAPI.openExternal(url);
                            } catch (error) {
                                console.error('Error opening rider attachment:', error);
                            }
                        }
                    });
                });
                
                // Voeg drag & drop functionaliteit toe in home view
                if (this.currentView === 'home') {
                    this.setupDragAndDrop(container);
                }
                
                // Voeg event listeners toe voor klikbare evenementen
                const clickableEvents = container.querySelectorAll('.data-item.clickable');
                clickableEvents.forEach(item => {
                    item.addEventListener('click', async (e) => {
                        // Voorkom klikken als er op een link wordt geklikt of tijdens drag
                        if (e.target.closest('a') || e.target.closest('.rider-link') || item.classList.contains('dragging')) {
                            return;
                        }
                        
                        const venueId = item.getAttribute('data-venue-id');
                        const eventDate = item.getAttribute('data-event-date');
                        
                        if (venueId && eventDate) {
                            // Als we in home view zijn, ga naar detail view
                            if (this.currentView === 'home') {
                                const productionId = item.getAttribute('data-production-id') || '';
                                const productionName = item.getAttribute('data-production-name') || '';
                                const groupId = item.getAttribute('data-group-id') || '';
                                const groupName = item.getAttribute('data-group-name') || '';
                                const eventName = item.getAttribute('data-event-name') || '';
                                const eventId = item.getAttribute('data-event-id') || '';
                                this.detailContext = (productionId || productionName || groupId || groupName || eventName || eventId)
                                    ? { productionId, productionName, groupId, groupName, eventName, eventId }
                                    : null;
                                this._pendingHistorySnapshot = this.createViewSnapshot();
                                await this.selectVenueAndDate(venueId, eventDate);
                                await this.showDetailView();
                            } else {
                                // Update beide selecties zonder dubbele data loading
                                await this.selectVenueAndDate(venueId, eventDate);
                            }
                        }
                    });
                });
            }, 0);
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    async loadTijdschemaData(events) {
        const container = document.getElementById('tijdschemaContent');
        if (!container) return;

        if (!events || events.length === 0) {
            this.updateTijdschemaDisplay(null);
            return;
        }

        const allScheduleItems = [];
        for (const event of events) {
            if (!event.id) continue;
            let items = [];
            const org = event._organizationId ?? (this.config?.app?.activeYesplanOrg === 2 ? 2 : 1);
            try {
                const result = await window.electronAPI.getYesplanSchedule(event.id, org);
                if (result?.success && result?.data) {
                    items = this.parseScheduleResponse(result.data);
                }
            } catch (err) {
                console.warn('Tijdschema laden mislukt voor event', event.id, err);
            }
            // Fallback: parse scheduleDescription van event (bv. "10:00 Opbouw, 19:30 Deuren open")
            if (items.length === 0) {
                const desc = event.scheduleDescription || event.rawEvent?.defaultscheduledescription || '';
                if (desc) items = this.parseScheduleDescriptionText(desc);
            }
            if (items.length > 0) {
                allScheduleItems.push({ eventTitle: event.title, eventId: event.id, items });
            }
        }

        this.updateTijdschemaDisplay(allScheduleItems);
    }

    /**
     * HTML voor tijdschema-lijst (zelfde opmaak als op de kaart en in de timer).
     */
    buildTijdschemaListHtml(scheduleData) {
        if (!scheduleData || scheduleData.length === 0) return '';

        const timeToMinutes = (s) => {
            if (!s || typeof s !== 'string') return 999999;
            const part = s.split(/[\s–—-]/)[0].trim();
            const m = part.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (!m) return 999999;
            const mins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
            return this.normalizeShowDayMinutes(mins) ?? 999999;
        };
        const sorted = [...scheduleData].sort((a, b) => {
            const minA = Math.min(...(a.items || []).map((it) => timeToMinutes(it.time || it.description)));
            const minB = Math.min(...(b.items || []).map((it) => timeToMinutes(it.time || it.description)));
            return minA - minB;
        });

        const escape = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const singleEvent = sorted.length === 1;

        const html = sorted.map(({ eventTitle, items }) => {
            const sortedItems = [...(items || [])].sort((a, b) => timeToMinutes(a.time || a.description) - timeToMinutes(b.time || b.description));
            const rows = sortedItems.map((it) => {
                const time = it.time ? `<span class="tijdschema-time">${escape(it.time)}</span>` : '';
                const desc = it.description ? `<span class="tijdschema-desc">${escape(it.description)}</span>` : '';
                return `<div class="tijdschema-row">${time}${time && desc ? ' ' : ''}${desc}</div>`;
            }).join('');
            const header = !singleEvent && eventTitle ? `<div class="tijdschema-event-header"><i class="fas fa-calendar-alt"></i> ${escape(eventTitle)}</div>` : '';
            return `${header}<div class="tijdschema-items">${rows}</div>`;
        }).join('');

        return `<div class="tijdschema-list">${html}</div>`;
    }

    parseScheduleDescriptionText(text) {
        if (!text || typeof text !== 'string') return [];
        const items = [];
        const trimmed = text.trim();
        if (!trimmed) return [];
        const timeDescRe = /^(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?\s+(.+)$/;
        const parts = trimmed.split(/[\n,]+\s*(?=\d{1,2}:\d{2}\b)|[\n,]+/);
        for (const part of parts) {
            const p = part.trim();
            if (!p) continue;
            const m = p.match(timeDescRe);
            if (m) {
                const time = m[2] ? `${m[1]} – ${m[2]}` : m[1];
                items.push({ time, description: m[3].trim() });
            } else {
                items.push({ time: '', description: p });
            }
        }
        return items;
    }

    parseScheduleResponse(data) {
        const items = [];
        let raw = data.items || data.data || data.schedule || data.entries || (Array.isArray(data) ? data : []);
        if (!Array.isArray(raw)) raw = [];
        raw.forEach((it) => {
            if (!it || typeof it !== 'object') return;
            const desc = it.description || it.name || it.text || it.label || it.value || it.defaultscheduledescription || '';
            let start = it.starttime || it.start_time || it.start || it.time || it.timestamp || '';
            let end = it.endtime || it.end_time || it.end || '';
            if (typeof start === 'string' && start.includes('T')) {
                start = start.split('T')[1]?.substring(0, 5) || start;
            }
            if (typeof end === 'string' && end.includes('T')) {
                end = end.split('T')[1]?.substring(0, 5) || end;
            }
            const timeStr = [start, end].filter(Boolean).join(' – ');
            if (desc || timeStr) {
                items.push({ description: String(desc).trim(), time: timeStr });
            }
        });
        return items;
    }

    updateTijdschemaDisplay(scheduleData) {
        const container = document.getElementById('tijdschemaContent');
        const card = document.getElementById('tijdschemaCard');
        if (!container || !card) return;

        this.tijdschemaScheduleData = scheduleData && scheduleData.length > 0 ? scheduleData : null;

        if (!scheduleData || scheduleData.length === 0) {
            container.innerHTML = `<div class="info-message">${this.t('messages.noTijdschema')}</div>`;
            card.classList.remove('tijdschema-card--clickable');
            card.removeAttribute('title');
            this.refreshVoorstellingTimerChrome();
            return;
        }

        container.innerHTML = this.buildTijdschemaListHtml(scheduleData);
        this.refreshVoorstellingTimerChrome();
    }

    canOpenVoorstellingTimer() {
        if (!this.isShowModeEnabled()) return false;
        if (!Array.isArray(this.selectedVenues) || this.selectedVenues.length !== 1) return false;
        const ev = this.data?.yesplan;
        // Meerdere voorstellingen op dezelfde dag (bv. matinee + avond) zijn toegestaan: tijdschema bevat alle blokken.
        if (!ev?.success || !Array.isArray(ev.data) || ev.data.length < 1) return false;
        return !!(this.tijdschemaScheduleData && this.tijdschemaScheduleData.length > 0);
    }

    /** Alleen echte pauze-regels, niet aankondigingen zoals "5 min voor pauze". */
    isActualPauseScheduleRow(item) {
        const desc = String(item?.description || '').trim().toLowerCase();
        if (!desc) return false;
        if (!/\b(pauze|interval|tussenpauze)\b/i.test(desc)) return false;
        // "5 min voor pauze"/"5 min before interval" telt niet als echte pauze.
        if (/(^|\b)(5|vijf)\s*(min(uten)?|mins?)?\s*(voor|before)\b/i.test(desc)) return false;
        return true;
    }

    /** Yesplan gebruikt vaak twee regels voor één pauze: "pauze (start)" / "pauze (stop)" — die stop-regel telt niet mee als tweede pauze. */
    isPauseScheduleStopRow(item) {
        const desc = String(item?.description || '').trim().toLowerCase();
        if (!desc || !this.isActualPauseScheduleRow(item)) return false;
        if (/\(\s*stop\s*\)/i.test(desc)) return true;
        if (/\(\s*eind(e)?\s*\)/i.test(desc) && /\bpauze\b/i.test(desc)) return true;
        if (/\beinde\s+pauze\b/i.test(desc) || /\bpauze\s+einde\b/i.test(desc)) return true;
        if (/\binterval\s*\(\s*end\s*\)/i.test(desc) || /\(\s*end\s*\)/i.test(desc)) return true;
        return false;
    }

    /** Eerste kloktijd uit het time-veld (bij "15:50 – 16:10" alleen start). */
    tijdschemaItemFirstClockMinutes(item) {
        const raw = String(item?.time || '').trim();
        if (!raw) return null;
        const first = raw.split(/[–—-]/)[0].trim();
        return this.tijdschemaTimeStringToMinutes(first);
    }

    /**
     * Aantal pauzes = aantal pauze-intervallen in Yesplan (niet: aantal regels met "pauze").
     * - Eén regel met van–tot in het tijdveld = 1 pauze.
     * - Twee regels start/stop = 1 pauze (stop telt niet mee als extra pauze).
     */
    countPauzesInSchedule(scheduleData) {
        if (!scheduleData || !scheduleData.length) return 0;
        let count = 0;
        for (const block of scheduleData) {
            for (const it of block.items || []) {
                if (!this.isActualPauseScheduleRow(it)) continue;
                const tStr = String(it.time || '');
                if (this.tijdschemaTimeRangeToDurationMinutes(tStr) != null) {
                    count += 1;
                    continue;
                }
                if (this.isPauseScheduleStopRow(it)) continue;
                count += 1;
            }
        }
        return count;
    }

    detectPauzeInSchedule(scheduleData) {
        return this.countPauzesInSchedule(scheduleData) > 0;
    }

    getVoorstellingTimerStepIds(pauseCount) {
        const pauses = Math.max(0, Number(pauseCount) || 0);
        const steps = ['deuren_open', 'vijf_voor_aanvang', 'aanvang'];
        for (let p = 1; p <= pauses; p++) {
            steps.push(p === 1 ? 'vijf_voor_pauze' : `vijf_voor_pauze_${p}`);
            steps.push(p === 1 ? 'pauze' : `pauze_${p}`);
            const nextAct = p + 1;
            steps.push(nextAct === 2 ? 'vijf_voor_tweede_deel' : `vijf_voor_aanvang_act_${nextAct}`);
            steps.push(nextAct === 2 ? 'aanvang_tweede_deel' : `aanvang_act_${nextAct}`);
        }
        steps.push('vijf_voor_einde', 'einde');
        return steps;
    }

    /**
     * Effectieve stapvolgorde: optioneel aangepaste lijst per slot + vrije knoppen (custom_*),
     * met ontbrekende standaardstappen uit het Yesplan-schema automatisch achteraan.
     */
    getVoorstellingTimerStepsForSlot(slotId, pauseCount) {
        const defaultSteps = this.getVoorstellingTimerStepIds(pauseCount);
        const defaultSet = new Set(defaultSteps);
        const st = this.ensureVoorstellingSlotState(slotId);
        const custom = st.customStepOrder;
        if (!Array.isArray(custom) || custom.length === 0) {
            return [...defaultSteps];
        }
        const isCustom = (id) => typeof id === 'string' && id.startsWith('custom_');
        const out = [];
        const seenBuiltin = new Set();
        for (const id of custom) {
            if (isCustom(id)) {
                out.push(id);
                continue;
            }
            if (defaultSet.has(id) && !seenBuiltin.has(id)) {
                out.push(id);
                seenBuiltin.add(id);
            }
        }
        for (const id of defaultSteps) {
            if (!seenBuiltin.has(id)) out.push(id);
        }
        return out;
    }

    getActOrdinalLabel(n) {
        const nr = Math.max(1, Number(n) || 1);
        if (this.locale === 'en') {
            if (nr % 100 >= 11 && nr % 100 <= 13) return `${nr}th`;
            if (nr % 10 === 1) return `${nr}st`;
            if (nr % 10 === 2) return `${nr}nd`;
            if (nr % 10 === 3) return `${nr}rd`;
            return `${nr}th`;
        }
        return `${nr}e`;
    }

    /**
     * @param {string} stepId
     * @param {number} [pauseCount] Aantal pauzes in het tijdschema. Bij 1 geen "… 1" achter pauze; bij 2+ wel nummering.
     * @param {string} [slotId] Voor labels van vrije knoppen (custom_*).
     */
    getVoorstellingTimerStepLabel(stepId, pauseCount, slotId) {
        if (typeof stepId === 'string' && stepId.startsWith('custom_') && slotId) {
            const lab = this.ensureVoorstellingSlotState(slotId).customLabels?.[stepId];
            if (lab && String(lab).trim()) return String(lab).trim();
            return this.locale === 'en' ? 'Custom step' : 'Vrije stap';
        }

        const totalPauses = pauseCount == null ? 1 : Math.max(0, Number(pauseCount) || 0);
        const showPauseNum = totalPauses >= 2;

        if (stepId === 'deuren_open' || stepId === 'vijf_voor_einde' || stepId === 'einde') {
            return this.t(`voorstellingTimer.steps.${stepId}`);
        }
        if (stepId === 'vijf_voor_aanvang') {
            const ord = this.getActOrdinalLabel(1);
            return this.locale === 'en' ? `5 min before start ${ord} act` : `5 min voor aanvang ${ord} acte`;
        }
        if (stepId === 'aanvang') {
            const ord = this.getActOrdinalLabel(1);
            return this.locale === 'en' ? `Start ${ord} act` : `Aanvang ${ord} acte`;
        }

        let m = stepId.match(/^vijf_voor_pauze_(\d+)$/);
        if (stepId === 'vijf_voor_pauze' || m) {
            const pauseNr = m ? parseInt(m[1], 10) : 1;
            if (!showPauseNum) {
                return this.locale === 'en' ? '5 min before interval' : '5 min voor pauze';
            }
            return this.locale === 'en' ? `5 min before break ${pauseNr}` : `5 min voor pauze ${pauseNr}`;
        }
        m = stepId.match(/^pauze_(\d+)$/);
        if (stepId === 'pauze' || m) {
            const pauseNr = m ? parseInt(m[1], 10) : 1;
            if (!showPauseNum) {
                return this.locale === 'en' ? 'Interval' : 'Pauze';
            }
            return this.locale === 'en' ? `Break ${pauseNr}` : `Pauze ${pauseNr}`;
        }

        m = stepId.match(/^vijf_voor_aanvang_act_(\d+)$/);
        if (stepId === 'vijf_voor_tweede_deel' || m) {
            const actNr = m ? parseInt(m[1], 10) : 2;
            const ord = this.getActOrdinalLabel(actNr);
            return this.locale === 'en' ? `5 min before start ${ord} act` : `5 min voor aanvang ${ord} acte`;
        }
        m = stepId.match(/^aanvang_act_(\d+)$/);
        if (stepId === 'aanvang_tweede_deel' || m) {
            const actNr = m ? parseInt(m[1], 10) : 2;
            const ord = this.getActOrdinalLabel(actNr);
            return this.locale === 'en' ? `Start ${ord} act` : `Aanvang ${ord} acte`;
        }

        return this.t(`voorstellingTimer.steps.${stepId}`);
    }

    /**
     * Na “Deuren open” mag hooguit één eerdere stap in de keten ontbreken om deze index nog te kunnen tikken
     * (overslaan van één tussenstap, daarna weer verder).
     */
    isVoorstellingStepReachable(index, steps, marks) {
        if (index === 0) return true;
        if (!marks[steps[0]]) return false;
        if (index === 1) return true;
        let missing = 0;
        for (let j = 1; j <= index - 1; j++) {
            if (!marks[steps[j]]) missing++;
        }
        return missing <= 1;
    }

    /** Eerste tijd uit een tijdschema-regel (bv. "19:30" of "19:30 – 22:00") → minuten sinds middernacht. */
    tijdschemaTimeStringToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return null;
        const part = timeStr.split(/[\s–—-]/)[0].trim();
        const m = part.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
    }

    /** Duur (in minuten) uit een timerange zoals "20:15 - 20:35". */
    tijdschemaTimeRangeToDurationMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return null;
        const m = timeStr.match(/(\d{1,2}:\d{2})(?::\d{2})?\s*[–—-]\s*(\d{1,2}:\d{2})(?::\d{2})?/);
        if (!m) return null;
        const start = this.tijdschemaTimeStringToMinutes(m[1]);
        const end = this.tijdschemaTimeStringToMinutes(m[2]);
        if (start == null || end == null) return null;
        let diff = end - start;
        if (diff < 0) diff += 24 * 60;
        if (diff < 1 || diff > 240) return null;
        return diff;
    }

    /** Pauzeduur uit Yesplan: regel met tijdsrange, anders verschil tussen start- en stopregel. */
    getPauseDurationMinutesFromSchedule(scheduleData) {
        if (!scheduleData?.length) return null;
        for (const block of scheduleData) {
            for (const it of block.items || []) {
                if (!this.isActualPauseScheduleRow(it)) continue;
                const mins = this.tijdschemaTimeRangeToDurationMinutes(String(it.time || ''));
                if (mins != null) return mins;
            }
        }
        for (const block of scheduleData) {
            const items = [...(block.items || [])].sort(
                (a, b) =>
                    (this.normalizeShowDayMinutes(this.tijdschemaItemFirstClockMinutes(a)) ?? 0) -
                    (this.normalizeShowDayMinutes(this.tijdschemaItemFirstClockMinutes(b)) ?? 0)
            );
            let startMin = null;
            for (const it of items) {
                if (!this.isActualPauseScheduleRow(it)) continue;
                if (this.tijdschemaTimeRangeToDurationMinutes(String(it.time || '')) != null) continue;
                const m = this.tijdschemaItemFirstClockMinutes(it);
                if (m == null) continue;
                if (this.isPauseScheduleStopRow(it)) {
                    if (startMin != null) {
                        let diff = m - startMin;
                        if (diff < 0) diff += 24 * 60;
                        if (diff >= 1 && diff <= 240) return diff;
                    }
                    startMin = null;
                    continue;
                }
                startMin = m;
            }
        }
        return null;
    }

    /** Vroegste tijd in een Yesplan-blok (min over alle regels met tijd). */
    getTijdschemaBlockEarliestMinutes(block) {
        const items = block?.items || [];
        let min = Infinity;
        for (const it of items) {
            const t = this.tijdschemaTimeStringToMinutes(it.time);
            const normalized = this.normalizeShowDayMinutes(t);
            if (normalized != null && normalized < min) min = normalized;
        }
        return Number.isFinite(min) ? min : null;
    }

    /**
     * Regels die voor dagdeel-classificatie niet meetellen (aankomst/opbouw vóór de voorstelling).
     * Voorstelling/pauze/einde tellen wél mee.
     */
    isPrepTijdschemaRowForSlotClassification(it) {
        const d = String(it.description || '').toLowerCase();
        if (/\b(voorstelling|pauze|einde|interval|tussenpauze)\b/.test(d)) return false;
        return /\b(aankomst|opbouw|soundcheck|techniek|grime|kap|briefing|preek|kleed|garderobe)\b/.test(d);
    }

    /**
     * Tijd waarop we het dagdeel bepalen: liefst de vroegste regel met "voorstelling",
     * anders vroegste niet-prep-regel (zodat 14:30 start niet als "ochtend" door 10:30 aankomst valt).
     */
    getTijdschemaBlockClassificationMinutes(block) {
        const items = block?.items || [];
        let voorstellingMin = Infinity;
        let nonPrepMin = Infinity;
        for (const it of items) {
            const m = this.normalizeShowDayMinutes(this.tijdschemaTimeStringToMinutes(it.time));
            if (m == null) continue;
            const desc = String(it.description || '');
            if (/\bvoorstelling\b/i.test(desc) && m < voorstellingMin) voorstellingMin = m;
            if (!this.isPrepTijdschemaRowForSlotClassification(it) && m < nonPrepMin) nonPrepMin = m;
        }
        if (Number.isFinite(voorstellingMin)) return voorstellingMin;
        if (Number.isFinite(nonPrepMin)) return nonPrepMin;
        return this.getTijdschemaBlockEarliestMinutes(block);
    }

    /**
     * Dagdeel uit vroegste tijd in het schema: vóór 12:00 ochtend, 12:00–16:59 middag, vanaf 17:00 avond.
     */
    classifyDayPartFromMinutes(mins) {
        mins = this.normalizeShowDayMinutes(mins);
        if (mins == null) return 'middag';
        if (mins >= 24 * 60) return 'avond';
        const middagStart = 12 * 60;
        const avondStart = 17 * 60;
        if (mins < middagStart) return 'ochtend';
        if (mins < avondStart) return 'middag';
        return 'avond';
    }

    getTimerSlotLabel(slotId) {
        const key = { ochtend: 'slotOchtend', middag: 'slotMiddag', avond: 'slotAvond', alledag: 'slotAlledag' }[slotId] || 'slotAlledag';
        return this.t(`voorstellingTimer.${key}`);
    }

    /**
     * Naam van de voorstelling voor de timer-kop: eerst detailcontext (home/zoeken), anders titels uit het geladen tijdschema.
     */
    getVoorstellingTimerEventDisplayName() {
        const ctx = this.detailContext;
        if (ctx && typeof ctx === 'object') {
            const fromCtx = String(ctx.eventName || ctx.productionName || ctx.groupName || '').trim();
            if (fromCtx) return fromCtx;
        }
        const data = this.tijdschemaScheduleData;
        if (!Array.isArray(data) || !data.length) return '';
        const titles = [];
        const seen = new Set();
        for (const block of data) {
            const t = String(block?.eventTitle || '').trim();
            if (!t) continue;
            const k = t.toLowerCase();
            if (seen.has(k)) continue;
            seen.add(k);
            titles.push(t);
        }
        if (titles.length === 0) return '';
        if (titles.length === 1) return titles[0];
        return titles.join(' · ');
    }

    updateVoorstellingTimerCardTitle() {
        const part = document.getElementById('voorstellingTimerTitleEventPart');
        const nameEl = document.getElementById('voorstellingTimerTitleEventName');
        if (!part || !nameEl) return;
        const name = this.getVoorstellingTimerEventDisplayName();
        if (!name) {
            part.hidden = true;
            nameEl.textContent = '';
            return;
        }
        nameEl.textContent = name;
        part.hidden = false;
    }

    getVoorstellingTimerTimelineEntries() {
        const sessions = Array.isArray(this._timerSessions) ? this._timerSessions : [];
        const entries = [];
        for (const { slotId, scheduleData } of sessions) {
            const slotLabel = this.getTimerSlotLabel(slotId);
            const pauseCount = this.countPauzesInSchedule(scheduleData);
            const st = this.ensureVoorstellingSlotState(slotId);
            const marks = st?.marks || {};
            for (const [stepId, wallIso] of Object.entries(marks)) {
                if (!wallIso) continue;
                entries.push({
                    type: 'mark',
                    slotId,
                    slotLabel,
                    stepId,
                    stepLabel: this.getVoorstellingTimerStepLabel(stepId, pauseCount, slotId),
                    wallIso: String(wallIso)
                });
            }
            const remarks = Array.isArray(st?.remarks) ? st.remarks : [];
            for (const r of remarks) {
                if (!r?.stepId || !r?.wallIso || !r?.text) continue;
                entries.push({
                    type: 'remark',
                    slotId,
                    slotLabel,
                    stepId: r.stepId,
                    stepLabel: this.getVoorstellingTimerStepLabel(r.stepId, pauseCount, slotId),
                    wallIso: String(r.wallIso),
                    text: String(r.text)
                });
            }
        }
        entries.sort((a, b) => {
            const ta = Date.parse(a.wallIso || '') || 0;
            const tb = Date.parse(b.wallIso || '') || 0;
            if (ta !== tb) return ta - tb;
            if (a.type === b.type) return 0;
            return a.type === 'mark' ? -1 : 1;
        });
        return entries;
    }

    getVoorstellingTimerExportSummary(slotId) {
        if (!slotId) return { acts: [], pauseTotalMs: null, totalWithPausesMs: null };
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        const scheduleData = sess?.scheduleData || [];
        const pauseCount = this.countPauzesInSchedule(scheduleData);
        const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount);
        const marks = this.ensureVoorstellingSlotState(slotId).marks || {};
        const parseIso = (v) => {
            const t = Date.parse(v || '');
            return Number.isFinite(t) ? t : null;
        };

        const actStartDefs = [];
        for (const id of steps) {
            if (id === 'aanvang' || id === 'aanvang_tweede_deel' || /^aanvang_act_\d+$/.test(id)) {
                const actNum = this.getActNumberFromTimerStepId(id);
                actStartDefs.push({ id, actNum, startMs: parseIso(marks[id]) });
            }
        }

        const acts = [];
        for (const def of actStartDefs) {
            if (def.startMs == null) continue;
            const pauseId = def.actNum === 1 ? 'pauze' : `pauze_${def.actNum}`;
            const nextActId = def.actNum === 1 ? 'aanvang_tweede_deel' : `aanvang_act_${def.actNum + 1}`;
            const candidates = [parseIso(marks[pauseId]), parseIso(marks[nextActId]), parseIso(marks.einde)].filter(
                (t) => t != null && t > def.startMs
            );
            if (!candidates.length) continue;
            const endMs = Math.min(...candidates);
            acts.push({ actNum: def.actNum, ms: Math.max(0, endMs - def.startMs) });
        }

        let pauseTotalMs = 0;
        let hasPause = false;
        const pauseSlots = Math.max(1, pauseCount || 0);
        for (let i = 1; i <= pauseSlots; i++) {
            const pauseId = i === 1 ? 'pauze' : `pauze_${i}`;
            const resumeId = i === 1 ? 'aanvang_tweede_deel' : `aanvang_act_${i + 1}`;
            const p0 = parseIso(marks[pauseId]);
            const p1 = parseIso(marks[resumeId]);
            if (p0 == null || p1 == null || p1 <= p0) continue;
            hasPause = true;
            pauseTotalMs += p1 - p0;
        }

        const startTotal = parseIso(marks.aanvang);
        const endTotal = parseIso(marks.einde);
        const totalWithPausesMs =
            startTotal != null && endTotal != null && endTotal > startTotal ? endTotal - startTotal : null;

        return {
            acts: acts.sort((a, b) => a.actNum - b.actNum),
            pauseTotalMs: hasPause ? pauseTotalMs : null,
            totalWithPausesMs
        };
    }

    extractClockMinutesFromText(text) {
        const s = String(text || '');
        const out = [];
        const re = /(^|[^0-9])([01]?\d|2[0-3]):([0-5]\d)(?!\d)/g;
        let m;
        while ((m = re.exec(s)) !== null) {
            const hh = parseInt(m[2], 10);
            const mm = parseInt(m[3], 10);
            out.push(hh * 60 + mm);
        }
        return out;
    }

    /**
     * Theaterdag loopt vaak na middernacht door (bv. 00:30 afbouw).
     * Die tijden behandelen we als "volgende blok" zodat ze ná avond komen.
     */
    normalizeShowDayMinutes(mins) {
        if (mins == null || !Number.isFinite(mins)) return null;
        const NIGHT_FOLLOW_THRESHOLD_MINUTES = 6 * 60;
        return mins < NIGHT_FOLLOW_THRESHOLD_MINUTES ? mins + 24 * 60 : mins;
    }

    getVoorstellingTimerSlotWindowMinutes(slotId) {
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        const times = [];
        for (const block of sess?.scheduleData || []) {
            for (const item of block.items || []) {
                const t = String(item?.time || '');
                if (t) times.push(...this.extractClockMinutesFromText(t));
            }
        }
        if (times.length >= 2) {
            const normalizedTimes = times
                .map((m) => this.normalizeShowDayMinutes(m))
                .filter((m) => m != null);
            if (normalizedTimes.length >= 2) {
            // Iets ruimer dan alleen schema-items; personeel start/stop vaak net buiten het schema.
            const pad = 120;
                return {
                    start: Math.max(0, Math.min(...normalizedTimes) - pad),
                    end: Math.min(48 * 60, Math.max(...normalizedTimes) + pad)
                };
            }
        }
        if (slotId === 'ochtend') return { start: 0, end: 12 * 60 };
        if (slotId === 'middag') return { start: 12 * 60, end: 17 * 60 };
        if (slotId === 'avond') return { start: 17 * 60, end: 24 * 60 };
        return { start: 0, end: 24 * 60 };
    }

    getVoorstellingTimerExportContextInfo(slotId) {
        const venueId = this.getPrimarySelectedVenueId();
        const venueName = this.getVenueNameById(venueId) || this.t('venue.unknownVenue');
        const uren = this.data?.uurwerk?.data || {};
        const slotWindow = this.getVoorstellingTimerSlotWindowMinutes(slotId);

        const parsePersonnelEntries = (arr) => {
            const rows = [];
            const seen = new Set();
            for (const entry of arr || []) {
                const s = String(entry || '').trim();
                if (!s) continue;
                if (s.toUpperCase().includes('VRIJWILLIGER') || s.toUpperCase().includes('VOLUNTEER')) continue;
                const parts = s.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
                let name = parts.length >= 2 ? parts[parts.length - 2] : s;
                if (!/^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'\- ]{1,60}$/.test(name)) name = s;
                if (name.split(/\s+/).length > 8) continue;
                const mins = this.extractClockMinutesFromText(s);
                let start = null;
                let end = null;
                if (mins.length >= 2) {
                    start = mins[0];
                    end = mins[mins.length - 1];
                    if (end < start) end += 24 * 60;
                }
                const key = `${name.toLowerCase()}|${start ?? ''}|${end ?? ''}`;
                if (seen.has(key)) continue;
                seen.add(key);
                rows.push({ name, start, end });
            }
            return rows;
        };

        const pickForSlot = (arr) => {
            const rows = parsePersonnelEntries(arr);
            const picked = rows.filter((r) => {
                if (r.start == null || r.end == null) return false;
                const a0 = slotWindow.start;
                const a1 = slotWindow.end;
                const b0 = r.start;
                const b1 = r.end;
                return Math.max(a0, b0) < Math.min(a1, b1);
            });
            if (picked.length) return picked.map((r) => r.name);
            // Fallback: geen overlap gevonden -> toon alle bekende namen i.p.v. leeg (ook mét tijd).
            return rows.map((r) => r.name);
        };

        return {
            venueName,
            techCrew: pickForSlot(uren.techniek),
            horecaCrew: pickForSlot(uren.horeca),
            frontOfficeCrew: pickForSlot(uren.frontOffice)
        };
    }

    updateVoorstellingTimerExportButtonState() {
        const btn = document.getElementById('voorstellingTimerExportBtn');
        if (!btn) return;
        const hasEntries = this.getVoorstellingTimerTimelineEntries().length > 0;
        btn.disabled = !hasEntries;
    }

    openVoorstellingTimerExportWindow() {
        const rows = this.getVoorstellingTimerTimelineEntries();
        if (!rows.length) {
            this.showError('yesplan', this.t('voorstellingTimer.exportNoData'));
            return;
        }
        const sessions = Array.isArray(this._timerSessions) ? this._timerSessions : [];
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const date = this.selectedDate || new Date();
        date.setHours(0, 0, 0, 0);
        const dateLabel = date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const printedAt = new Date().toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23'
        });
        const escape = (s) => this.escapeHtml(String(s || ''));
        const titleSuffix = this.getVoorstellingTimerEventDisplayName();
        const title = titleSuffix
            ? `${this.t('voorstellingTimer.exportHeading')} | ${titleSuffix}`
            : this.t('voorstellingTimer.exportHeading');
        const fallbackSlotId = sessions[0]?.slotId || null;
        const groupedRows = new Map();
        for (const row of rows) {
            const sid = row.slotId || fallbackSlotId || 'alledag';
            if (!groupedRows.has(sid)) groupedRows.set(sid, []);
            groupedRows.get(sid).push(row);
        }
        const sectionOrder = sessions.length
            ? sessions.map((s) => s.slotId).filter((sid) => groupedRows.has(sid))
            : Array.from(groupedRows.keys());
        const buildListHtml = (slotRows) =>
            slotRows
                .map((row) => {
                const clock = this.formatVoorstellingMarkTime(row.wallIso);
                if (row.type === 'remark') {
                    return `<div class="timer-export-row timer-export-row--remark">
                        <div class="timer-export-time">${escape(clock)}</div>
                        <div class="timer-export-content">
                            <div class="timer-export-line"><strong>${escape(this.t('voorstellingTimer.exportRemark'))}:</strong> ${escape(row.text)}</div>
                            <div class="timer-export-meta">${escape(row.stepLabel)}</div>
                        </div>
                    </div>`;
                }
                return `<div class="timer-export-row">
                    <div class="timer-export-time">${escape(clock)}</div>
                    <div class="timer-export-content">
                        <div class="timer-export-line"><strong>${escape(this.t('voorstellingTimer.exportStep'))}:</strong> ${escape(row.stepLabel)}</div>
                    </div>
                </div>`;
            })
            .join('');
        const sectionsHtml = sectionOrder
            .map((slotId, idx) => {
                const slotRows = groupedRows.get(slotId) || [];
                if (!slotRows.length) return '';
                const summary = this.getVoorstellingTimerExportSummary(slotId);
                const summaryItems = [];
                summary.acts.forEach((a) => {
                    const actLabel = this.locale === 'en' ? `Act ${a.actNum}` : `${this.getActOrdinalLabel(a.actNum)} acte`;
                    summaryItems.push({
                        label: actLabel,
                        value: this.formatStopwatchMs(a.ms)
                    });
                });
                if (summary.pauseTotalMs != null) {
                    summaryItems.push({
                        label: this.t('voorstellingTimer.exportPauseTotal'),
                        value: this.formatStopwatchMs(summary.pauseTotalMs)
                    });
                }
                if (summary.totalWithPausesMs != null) {
                    summaryItems.push({
                        label: this.t('voorstellingTimer.exportTotalWithPauses'),
                        value: this.formatStopwatchMs(summary.totalWithPausesMs)
                    });
                }
                const summaryHtml = summaryItems.length
                    ? `<section class="timer-export-summary">
                        <h2>${escape(this.t('voorstellingTimer.exportSubtotals'))}</h2>
                        ${summaryItems
                            .map(
                                (it) =>
                                    `<div class="timer-export-summary-row"><span>${escape(it.label)}</span><strong>${escape(it.value)}</strong></div>`
                            )
                            .join('')}
                    </section>`
                    : '';
                const sessionTitle = escape(this.getTimerSlotLabel(slotId));
                const pageClass = idx > 0 ? ' timer-export-page--new' : '';
                const ctx = this.getVoorstellingTimerExportContextInfo(slotId);
                const infoHtml = `<section class="timer-export-context">
                    <div class="timer-export-context-row"><strong>${escape(this.t('voorstellingTimer.exportVenue'))}:</strong> <span>${escape(ctx.venueName)}</span></div>
                    <div class="timer-export-context-row"><strong>${escape(this.t('voorstellingTimer.exportTechCrew'))}:</strong> <span>${escape(ctx.techCrew.length ? ctx.techCrew.join(', ') : '—')}</span></div>
                    <div class="timer-export-context-row"><strong>${escape(this.t('voorstellingTimer.exportHorecaCrew'))}:</strong> <span>${escape(ctx.horecaCrew.length ? ctx.horecaCrew.join(', ') : '—')}</span></div>
                    <div class="timer-export-context-row"><strong>${escape(this.t('voorstellingTimer.exportFrontOfficeCrew'))}:</strong> <span>${escape(ctx.frontOfficeCrew.length ? ctx.frontOfficeCrew.join(', ') : '—')}</span></div>
                </section>`;
                return `<section class="timer-export-page${pageClass}">
                    <div class="timer-export-page-head">
                        <h1>${escape(title)}</h1>
                        <div class="sub">${escape(dateLabel)}</div>
                    </div>
                    <h2 class="timer-export-session-title">${sessionTitle}</h2>
                    ${infoHtml}
                    ${summaryHtml}
                    ${buildListHtml(slotRows)}
                </section>`;
            })
            .join('');
        const printBtnLabel = this.locale === 'en' ? 'Print' : 'Printen';
        const closeBtnLabel = this.locale === 'en' ? 'Close' : 'Sluiten';
        const html = `<!DOCTYPE html><html lang="${this.locale}"><head><meta charset="UTF-8"><title>${escape(title)}</title>
        <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: Inter, sans-serif; color:#111; background:#fff; margin:0; }
            .sheet { width: 100%; max-width: 190mm; margin: 0 auto; }
            .head { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; }
            .head h1 { margin:0 0 4px 0; font-size: 20px; }
            .head .sub { color:#444; font-size: 13px; margin-top: 2px; }
            .timer-export-page-head { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; display:none; }
            .timer-export-page-head h1 { margin:0 0 4px 0; font-size: 20px; }
            .timer-export-page-head .sub { color:#444; font-size: 13px; margin-top: 2px; }
            .timer-export-page { margin-bottom: 14px; }
            .timer-export-page--new { page-break-before: always; }
            .timer-export-session-title { margin: 0 0 10px 0; font-size: 16px; }
            .timer-export-context { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; margin: 0 0 10px 0; }
            .timer-export-context-row { font-size: 12px; line-height: 1.35; margin: 2px 0; }
            .timer-export-summary { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 12px; margin: 0 0 14px 0; }
            .timer-export-summary h2 { margin:0 0 8px 0; font-size: 14px; }
            .timer-export-summary-row { display:flex; justify-content: space-between; gap: 12px; padding: 2px 0; font-size: 13px; }
            .timer-export-summary-row strong { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
            .actions { margin: 0 0 14px 0; display:flex; gap:10px; }
            .actions button { padding: 8px 14px; border-radius: 7px; border: none; color: #fff; cursor: pointer; }
            .actions .print { background: #4f46e5; }
            .actions .close { background: #6b7280; }
            .timer-export-row { display:grid; grid-template-columns: 78px 1fr; gap: 10px; border-bottom: 1px solid #e5e7eb; padding: 6px 0; }
            .timer-export-row--remark { margin-left: 18px; border-left: 2px solid #c7d2fe; padding-left: 10px; }
            .timer-export-time { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color:#1f2937; }
            .timer-export-line { font-size: 13px; line-height: 1.4; }
            .timer-export-meta { font-size: 11px; color:#6b7280; margin-top: 2px; }
            .footer { margin-top: 14px; padding-top: 6px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; text-align: right; }
            @media print { .actions { display:none !important; } body { margin:0; } .footer { position: fixed; left: 0; right: 0; bottom: 0; border-top: none; } .timer-export-page-head { display:block; } .timer-export-page:first-of-type .timer-export-page-head { display:none; } }
        </style></head><body>
            <div class="sheet">
                <div class="head">
                    <h1>${escape(title)}</h1>
                    <div class="sub">${escape(dateLabel)}</div>
                </div>
                <div class="actions">
                    <button type="button" class="print" onclick="window.print();">${escape(printBtnLabel)}</button>
                    <button type="button" class="close" onclick="window.close();">${escape(closeBtnLabel)}</button>
                </div>
                ${sectionsHtml}
                <div class="footer">${escape(this.t('voorstellingTimer.exportPrintedAt', { time: printedAt }))}</div>
            </div>
        </body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const printWin = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        URL.revokeObjectURL(blobUrl);
        if (printWin) printWin.focus();
    }

    /**
     * Verdeelt tijdschema-blokken in ochtend / middag / avond op basis van speeltijd (voorstelling),
     * niet op vroege aankomst-/opbouwregels.
     */
    buildTimerDaySessions(scheduleData) {
        if (!scheduleData?.length) return [];
        const buckets = { ochtend: [], middag: [], avond: [] };
        for (const block of scheduleData) {
            if (!block.items?.length) continue;
            let em = this.getTijdschemaBlockClassificationMinutes(block);
            if (em == null) em = 14 * 60;
            const part = this.classifyDayPartFromMinutes(em);
            buckets[part].push(block);
        }
        const order = ['ochtend', 'middag', 'avond'];
        const sessions = [];
        for (const slotId of order) {
            const blocks = buckets[slotId];
            if (!blocks.length) continue;
            blocks.sort(
                (a, b) =>
                    (this.getTijdschemaBlockClassificationMinutes(a) ?? 0) -
                    (this.getTijdschemaBlockClassificationMinutes(b) ?? 0)
            );
            sessions.push({ slotId, scheduleData: blocks });
        }
        if (!sessions.length && scheduleData.length) {
            return [{ slotId: 'alledag', scheduleData: [...scheduleData] }];
        }
        return sessions;
    }

    /**
     * Zelfde zaal-id als bij klik op een event op home: eerst Yesplan-location, dan venueIds,
     * altijd laten matchen met {@link #availableVenues} (vaak "org:locationId") zodat de zaalkiezer geen "Onbekende zaal" toont.
     */
    getCanonicalVenueId(rawId, orgHint = '') {
        if (rawId === undefined || rawId === null) return null;
        const s = String(rawId).trim();
        if (!s) return null;
        const venues = Array.isArray(this.availableVenues) ? this.availableVenues : [];
        if (!venues.length) return s;
        const exact = venues.find((v) => String(v.id) === s);
        if (exact) return String(exact.id);
        const org = String(orgHint || '').trim();
        if (org && !s.includes(':')) {
            const prefixed = `${org}:${s}`;
            const hitPref = venues.find((v) => String(v.id) === prefixed);
            if (hitPref) return String(hitPref.id);
        }
        const suffix = s.split(':').pop();
        const bySuffix = venues.find((v) => String(v.id).split(':').pop() === suffix);
        if (bySuffix) return String(bySuffix.id);
        return s;
    }

    getEventVenueSelectionId(event) {
        if (!event) return null;
        const org =
            event._organizationId !== undefined && event._organizationId !== null
                ? String(event._organizationId).trim()
                : '';

        const loc0 = event.rawEvent?.locations?.[0];
        if (loc0?.id != null) {
            const id = this.getCanonicalVenueId(loc0.id, org);
            if (id) return id;
        }
        if (Array.isArray(event.venueIds) && event.venueIds[0] != null) {
            const id = this.getCanonicalVenueId(event.venueIds[0], org);
            if (id) return id;
        }
        return null;
    }

    getEventCalendarDateString(event) {
        if (!event?.startDate) return null;
        const d = new Date(event.startDate);
        if (Number.isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    buildDetailContextFromEvent(event) {
        if (!event) return null;
        const production = event.rawEvent?.production;
        const productionId =
            production && (production.id ?? production.uuid) != null ? String(production.id ?? production.uuid) : '';
        const productionName =
            production && typeof production === 'object'
                ? production.name || production.title || ''
                : typeof production === 'string'
                  ? production
                  : '';
        const group = event.rawEvent?.group;
        const groupId = group && (group.id ?? group.uuid) != null ? String(group.id ?? group.uuid) : '';
        const groupName =
            group && typeof group === 'object' ? group.name || group.title || '' : typeof group === 'string' ? group : '';
        const eventNameVal = event.name || event.title || '';
        const eventId = event.id != null ? String(event.id) : '';
        return productionId || productionName || groupId || groupName || eventNameVal || eventId
            ? { productionId, productionName, groupId, groupName, eventName: eventNameVal, eventId }
            : null;
    }

    filterTimerPickerEventsList(rawList) {
        const targetDay = this.getDateRange().start;
        let events = (rawList || []).filter((ev) => this.getEventCalendarDateString(ev) === targetDay);
        const seen = new Set();
        events = events.filter((ev) => {
            const id = ev.id != null ? String(ev.id) : `${this.getEventCalendarDateString(ev)}-${ev.title || ''}`;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
        if (this.hideCancelledEvents) {
            events = events.filter((ev) => {
                const status = ev.status?.toLowerCase() || '';
                const statusName =
                    typeof ev.status === 'object' && ev.status?.name ? ev.status.name.toLowerCase() : '';
                const isCancelled =
                    status.includes('geannuleerd') ||
                    status.includes('cancelled') ||
                    status.includes('canceled') ||
                    statusName.includes('geannuleerd') ||
                    statusName.includes('cancelled') ||
                    statusName.includes('canceled');
                return !isCancelled;
            });
        }
        events.sort((a, b) => this.sortEventByDefault(a, b));
        return events;
    }

    closeTimerPickPerformanceModal() {
        const modal = document.getElementById('timerPickPerformanceModal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
        if (this._timerPickEscHandler) {
            document.removeEventListener('keydown', this._timerPickEscHandler);
            this._timerPickEscHandler = null;
        }
    }

    async openTimerPickPerformanceModal() {
        if (!window.electronAPI?.getYesplanData) return;
        const modal = document.getElementById('timerPickPerformanceModal');
        const body = document.getElementById('timerPickPerformanceBody');
        const heading = document.getElementById('timerPickPerformanceHeading');
        if (!modal || !body) return;

        this.closeTimerPickPerformanceModal();
        const escHandler = (e) => {
            if (e.key === 'Escape') this.closeTimerPickPerformanceModal();
        };
        this._timerPickEscHandler = escHandler;
        document.addEventListener('keydown', escHandler);

        if (heading) {
            heading.innerHTML = `<i class="fas fa-stopwatch"></i> ${this.escapeHtml(this.t('voorstellingTimer.pickPerformanceHeading'))}`;
        }
        body.innerHTML = `<div class="timer-pick-performance-loading">${this.escapeHtml(this.t('voorstellingTimer.pickPerformanceLoading'))}</div>`;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');

        const { start, end } = this.getDateRange();
        try {
            const result = await window.electronAPI.getYesplanData({
                startDate: start,
                endDate: end,
                venueId: undefined,
                skipCache: true
            });
            if (!result?.success || !Array.isArray(result.data)) {
                body.innerHTML = `<div class="timer-pick-performance-empty">${this.escapeHtml(this.t('voorstellingTimer.pickPerformanceLoadError'))}</div>`;
                return;
            }
            const events = this.filterTimerPickerEventsList(result.data);
            if (events.length === 0) {
                body.innerHTML = `<p class="timer-pick-performance-empty">${this.escapeHtml(this.t('voorstellingTimer.pickPerformanceEmpty'))}</p>`;
                return;
            }
            const sub = this.escapeHtml(this.t('voorstellingTimer.pickPerformanceSub'));
            const rows = events
                .map((ev, idx) => {
                    const title = this.escapeHtml(ev.title || ev.name || '—');
                    let timeRange = '';
                    if (ev.scheduleStartTime && ev.scheduleEndTime) {
                        timeRange = `${this.escapeHtml(ev.scheduleStartTime)} – ${this.escapeHtml(ev.scheduleEndTime)}`;
                    } else {
                        const st = ev.startDate ? this.formatTime(ev.startDate) : '—';
                        const en = ev.endDate ? this.formatTime(ev.endDate) : '—';
                        timeRange = `${this.escapeHtml(st)} – ${this.escapeHtml(en)}`;
                    }
                    const venue = ev.venue && ev.venue !== 'Onbekend' ? this.escapeHtml(String(ev.venue)) : '';
                    const metaParts = [timeRange, venue].filter(Boolean);
                    const meta = metaParts.join(' · ');
                    return `<button type="button" class="timer-pick-performance-item" data-timer-pick-index="${idx}">
                        <p class="timer-pick-performance-item-title">${title}</p>
                        <p class="timer-pick-performance-item-meta">${meta}</p>
                    </button>`;
                })
                .join('');
            body.innerHTML = `<p style="color:#94a3b8;font-size:0.88rem;margin:0 0 0.75rem 0;">${sub}</p><div class="timer-pick-performance-list">${rows}</div>`;
            body.querySelectorAll('[data-timer-pick-index]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const i = parseInt(btn.getAttribute('data-timer-pick-index'), 10);
                    if (!Number.isNaN(i) && events[i]) void this.onTimerPerformancePicked(events[i]);
                });
            });
        } catch (e) {
            console.error(e);
            body.innerHTML = `<div class="timer-pick-performance-empty">${this.escapeHtml(this.t('voorstellingTimer.pickPerformanceLoadError'))}</div>`;
        }
    }

    async onTimerPerformancePicked(event) {
        this.closeTimerPickPerformanceModal();
        const venueId = this.getEventVenueSelectionId(event);
        // Zelfde dag als de agenda (niet event.startDate → UTC/ISO); anders wijkt de timer-opslagsleutel af van een normale navigatie.
        const dateStr = this.getDateRange().start;
        if (!venueId) {
            this.showError('yesplan', this.t('voorstellingTimer.pickPerformanceLoadError'));
            return;
        }
        this.detailContext = this.buildDetailContextFromEvent(event);
        await this.selectVenueAndDate(venueId, dateStr);
        // Timer heeft detail-data nodig (incl. tijdschema), maar zonder zichtbare tussenstap naar detail view.
        const originalView = this.currentView;
        this.currentView = 'detail';
        await this.loadAllData({ forceRefresh: true });
        this.currentView = originalView;
        this.refreshVoorstellingTimerChrome();
        if (this.canOpenVoorstellingTimer()) {
            await this.showVoorstellingTimerView();
        } else {
            this.showError('yesplan', this.t('voorstellingTimer.notAvailable'));
        }
    }

    refreshVoorstellingTimerChrome() {
        this.updateShowModeHeaderChrome();
        this.updateVoorstellingTimerExportButtonState();
        const btn = document.getElementById('voorstellingTimerBtn');
        const card = document.getElementById('tijdschemaCard');
        const open = this.canOpenVoorstellingTimer();
        const showBtn = this.isShowModeEnabled();
        if (btn) {
            if (showBtn) {
                btn.style.display = '';
                btn.disabled = false;
                if (open) {
                    btn.title = this.t('nav.voorstellingTimer');
                    btn.classList.remove('btn--muted');
                } else {
                    btn.title = this.t('voorstellingTimer.pickPerformanceHint');
                    btn.classList.add('btn--muted');
                }
            } else {
                btn.style.display = 'none';
                btn.disabled = true;
                btn.classList.remove('btn--muted');
            }
        }
        if (card) {
            if (open) {
                card.classList.add('tijdschema-card--clickable');
                card.title = this.t('nav.voorstellingTimer');
            } else {
                card.classList.remove('tijdschema-card--clickable');
                card.removeAttribute('title');
            }
        }
        if (this.currentView === 'voorstellingTimer' && !open) {
            void this.showDetailView(false, false);
        } else if (this.currentView === 'voorstellingTimer' && open) {
            void this.renderVoorstellingTimerUI().catch(() => {});
        }
    }

    hideVoorstellingTimerShell() {
        if (this._voorstellingTimerEditingSlotId) {
            this.cancelTimerColumnEdit();
        }
        this.stopVoorstellingTimerClockLoop();
        const w = document.getElementById('voorstellingTimerWrapper');
        if (w) w.style.display = 'none';
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');
        document.body.classList.remove('voorstelling-timer-active');
    }

    hideLuminexShell() {
        const w = document.getElementById('luminexViewWrapper');
        if (w) w.style.display = 'none';
        document.getElementById('luminexNavBtn')?.classList.remove('active');
        document.body.classList.remove('luminex-view-active');
    }

    hideOscMonitorShell() {
        const w = document.getElementById('oscMonitorWrapper');
        if (w) w.style.display = 'none';
        document.getElementById('oscMonitorNavBtn')?.classList.remove('active');
        document.body.classList.remove('osc-monitor-active');
    }

    addOscMonitorEntry(payload) {
        const now = new Date();
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const stamp = now.toLocaleTimeString(locale, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const slotId = String(payload?.slotId || 'onbekend').trim() || 'onbekend';
        const stepId = String(payload?.stepId || 'onbekend').trim() || 'onbekend';
        this._oscMonitorEntries.unshift({ stamp, slotId, stepId });
        if (this._oscMonitorEntries.length > this._oscMonitorMaxEntries) {
            this._oscMonitorEntries.length = this._oscMonitorMaxEntries;
        }
        if (this.currentView === 'oscMonitor') this.renderOscMonitorEntries();
    }

    renderOscMonitorEntries() {
        const list = document.getElementById('oscMonitorList');
        const meta = document.getElementById('oscMonitorMeta');
        if (!list || !meta) return;
        if (!this._oscMonitorEntries.length) {
            meta.textContent = 'Wachten op OSC berichten…';
            list.innerHTML = '';
            return;
        }
        meta.textContent = `${this._oscMonitorEntries.length} bericht(en) in buffer. Nieuwste bovenaan.`;
        list.innerHTML = this._oscMonitorEntries.map((entry) => (
            `<div class="osc-monitor-entry">` +
            `<span class="osc-monitor-entry-time">${this.escapeHtml(entry.stamp)}</span>` +
            `<span class="osc-monitor-entry-slot">${this.escapeHtml(entry.slotId)}</span>` +
            `<span class="osc-monitor-entry-step">${this.escapeHtml(entry.stepId)}</span>` +
            `</div>`
        )).join('');
    }

    ensureLuminexMatrix() {
        const root = document.getElementById('luminexMatrixRoot');
        if (!root || !window.LuminexMatrixView || this._luminexMatrix) return;
        this._luminexMatrix = new window.LuminexMatrixView(root, {
            dynamic: true,
            inputsTitle: this.t('luminex.inputsTitle'),
            outputsTitle: this.t('luminex.outputsTitle'),
            engineColumnTitle: this.t('luminex.engineColumnTitle'),
            engineHubLabel: this.t('luminex.engineHubLabel'),
            emptyInputsHint: this.t('luminex.emptyInputsHint'),
            dragHint: this.t('luminex.dragHint'),
            dragCanvasHint: this.t('luminex.dragCanvasHint'),
            sourceNetworkLine: this.t('luminex.sourceNetworkLine'),
            notSeenInScanShort: this.t('luminex.notSeenInScanShort'),
            sourceLanOnly: this.t('luminex.sourceLanOnly'),
            sacnMergeEngineBadge: this.t('luminex.sacnMergeEngineBadge'),
            mergeLine: this.t('luminex.mergeLine'),
            mergeLineModeOnly: this.t('luminex.mergeLineModeOnly'),
            getLabelIn: (i) => this.t('luminex.portIn', { n: i + 1 }),
            getLabelOut: (i) => this.t('luminex.portOut', { n: i + 1 }),
            onChange: () => this.onLuminexMatrixChange(),
            onNodeLayoutChange: (layout) => this._saveLuminexNodeLayoutDebounced(layout)
        });
    }

    _saveLuminexNodeLayoutDebounced(layout) {
        if (!window.electronAPI?.saveConfig || !layout || typeof layout !== 'object') return;
        if (this._luminexNodeLayoutSaveTimer) clearTimeout(this._luminexNodeLayoutSaveTimer);
        this._luminexNodeLayoutSaveTimer = setTimeout(async () => {
            this._luminexNodeLayoutSaveTimer = null;
            try {
                const prev = await this.getLuminexConfigRaw();
                const prevNl = prev.nodeLayout && typeof prev.nodeLayout === 'object' ? prev.nodeLayout : {};
                const { byProcessblock: _drop, ...restNl } = prevNl;
                await window.electronAPI.saveConfig('luminex', { ...prev, nodeLayout: { ...restNl, ...layout } });
            } catch (_) {
                /* ignore */
            }
        }, 650);
    }

    refreshLuminexChrome() {
        const sub = document.getElementById('luminexCardSubtitle');
        if (sub) sub.textContent = this.t('luminex.subtitle');
        const lumNav = document.getElementById('luminexNavBtn');
        if (lumNav) lumNav.title = this.t('nav.luminex');
        if (this._luminexMatrix) {
            this._luminexMatrix.setLabels({
                inputsTitle: this.t('luminex.inputsTitle'),
                outputsTitle: this.t('luminex.outputsTitle'),
                engineColumnTitle: this.t('luminex.engineColumnTitle'),
                engineHubLabel: this.t('luminex.engineHubLabel'),
                emptyInputsHint: this.t('luminex.emptyInputsHint'),
                dragHint: this.t('luminex.dragHint'),
                dragCanvasHint: this.t('luminex.dragCanvasHint'),
                sourceNetworkLine: this.t('luminex.sourceNetworkLine'),
                notSeenInScanShort: this.t('luminex.notSeenInScanShort'),
                sourceLanOnly: this.t('luminex.sourceLanOnly'),
                sacnMergeEngineBadge: this.t('luminex.sacnMergeEngineBadge'),
                mergeLine: this.t('luminex.mergeLine'),
                mergeLineModeOnly: this.t('luminex.mergeLineModeOnly'),
                getLabelIn: (i) => this.t('luminex.portIn', { n: i + 1 }),
                getLabelOut: (i) => this.t('luminex.portOut', { n: i + 1 })
            });
        }
        const syncNodeLbl = document.querySelector('#luminexSyncNodeBtn span[data-i18n="luminex.syncToNode"]');
        if (syncNodeLbl) syncNodeLbl.textContent = this.t('luminex.syncToNode');
    }

    setupLuminexDiscoveryListeners() {
        document.getElementById('luminexDiscoverBtn')?.addEventListener('click', () => {
            void this.runLuminodeDiscovery();
        });
        document.getElementById('luminexSacnScanBtn')?.addEventListener('click', () => {
            void this.runSacnDiscovery();
        });
        document.getElementById('luminexSaveHostBtn')?.addEventListener('click', () => {
            void this.saveLuminexHostFromInput();
        });
        document.getElementById('luminexFetchCapBtn')?.addEventListener('click', () => {
            void this.fetchLuminodeCapabilitiesUI();
        });
        document.getElementById('luminexOpenWebBtn')?.addEventListener('click', () => {
            void this.openLuminodeWebUi();
        });
        document.getElementById('luminexSaveRouteBtn')?.addEventListener('click', () => {
            void this.saveLuminexRoute();
        });
        document.getElementById('luminexSyncNodeBtn')?.addEventListener('click', () => {
            void this.pushLuminodePatchFromUi();
        });
        document.getElementById('luminexDeviceList')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.luminex-device-pick');
            if (!btn) return;
            const ip = btn.getAttribute('data-ip');
            if (!ip) return;
            const input = document.getElementById('luminexHostInput');
            if (input) input.value = ip;
            void this.saveLuminexHostFromInput();
        });
        document.getElementById('luminexShowAllOutputs')?.addEventListener('change', (e) => {
            void this.saveLuminexShowAllOutputsPreference(!!e.target.checked);
        });
    }

    async saveLuminexShowAllOutputsPreference(checked) {
        if (!window.electronAPI?.saveConfig) return;
        try {
            const prev = await this.getLuminexConfigRaw();
            const prevRoute = prev.route && typeof prev.route === 'object' ? prev.route : {};
            await window.electronAPI.saveConfig('luminex', {
                ...prev,
                route: { ...prevRoute, showAllOutputs: checked }
            });
            await this.refreshLuminexMatrixPorts();
        } catch (_) {
            /* ignore */
        }
    }

    setLuminexDiscoveryStatus(text) {
        const el = document.getElementById('luminexDiscoveryStatus');
        if (el) el.textContent = text || '';
    }

    /**
     * @param {string} main
     * @param {{ warnings?: string[], meta?: string, isError?: boolean } | undefined} opts
     */
    setLuminexSacnStatus(main, opts) {
        const block = document.getElementById('luminexSacnResultBlock');
        const mainEl = document.getElementById('luminexSacnStatusLine');
        const metaEl = document.getElementById('luminexSacnMetaLine');
        const warnEl = document.getElementById('luminexSacnWarningsLine');
        const text = main || '';
        const warnings = opts && Array.isArray(opts.warnings) ? opts.warnings : [];
        const meta = opts && opts.meta ? String(opts.meta) : '';
        const isError = !!(opts && opts.isError);

        if (mainEl) {
            mainEl.textContent = text;
            mainEl.classList.toggle('luminex-sacn-result-main--error', isError);
        }
        if (metaEl) {
            if (meta) {
                metaEl.hidden = false;
                metaEl.textContent = meta;
            } else {
                metaEl.hidden = true;
                metaEl.textContent = '';
            }
        }
        if (warnEl) {
            if (warnings.length) {
                warnEl.hidden = false;
                const detail =
                    warnings.length <= 2
                        ? warnings.join(' · ')
                        : `${warnings.slice(0, 2).join(' · ')} (+${warnings.length - 2})`;
                warnEl.textContent = this.t('luminex.sacnSocketWarning', { detail });
            } else {
                warnEl.hidden = true;
                warnEl.textContent = '';
            }
        }
        if (block) {
            block.hidden = !text && warnings.length === 0;
        }
    }

    setLuminexRouteStatus(text) {
        const el = document.getElementById('luminexRouteStatus');
        if (el) el.textContent = text || '';
    }

    setLuminexEngineStatus(text) {
        const el = document.getElementById('luminexEngineStatus');
        if (el) el.textContent = text || '';
    }

    async getLuminexConfigRaw() {
        if (!window.electronAPI?.getConfig) return {};
        try {
            return (await window.electronAPI.getConfig('luminex')) || {};
        } catch (_) {
            return {};
        }
    }

    async loadLuminexConfigIntoUI() {
        const cfg = await this.getLuminexConfigRaw();
        const hostEl = document.getElementById('luminexHostInput');
        if (hostEl) hostEl.value = (cfg.host && String(cfg.host).trim()) || '10.0.1.230';
        const pwEl = document.getElementById('luminexPasswordInput');
        if (pwEl) pwEl.value = cfg.password != null ? String(cfg.password) : '';
        const minEl = document.getElementById('luminexSacnMin');
        const maxEl = document.getElementById('luminexSacnMax');
        if (minEl) minEl.value = cfg.sacnMin != null ? String(cfg.sacnMin) : '1';
        if (maxEl) maxEl.value = cfg.sacnMax != null ? String(cfg.sacnMax) : '96';
        const showAllEl = document.getElementById('luminexShowAllOutputs');
        if (showAllEl) showAllEl.checked = cfg.route?.showAllOutputs === true;
        this._hydrateLuminexRoutePatchesFromConfig(cfg);
        const pbSel = document.getElementById('luminexRouteProcessblock');
        const r = cfg.route || {};
        if (pbSel && r.processblockId != null && [...pbSel.options].some((o) => o.value === String(r.processblockId))) {
            pbSel.value = String(r.processblockId);
        }
        /* Matrix wordt gevuld na getLuminodeCapabilities (device-config + lokale patch). */
    }

    async saveLuminexHostFromInput() {
        const hostEl = document.getElementById('luminexHostInput');
        const pwEl = document.getElementById('luminexPasswordInput');
        if (!hostEl || !window.electronAPI?.saveConfig) return;
        const host = String(hostEl.value || '').trim();
        if (!host) return;
        const password = pwEl ? String(pwEl.value || '') : '';
        const prev = await this.getLuminexConfigRaw();
        const minEl = document.getElementById('luminexSacnMin');
        const maxEl = document.getElementById('luminexSacnMax');
        const sacnMin = minEl ? parseInt(minEl.value, 10) : 1;
        const sacnMax = maxEl ? parseInt(maxEl.value, 10) : 96;
        const res = await window.electronAPI.saveConfig('luminex', {
            ...prev,
            host,
            password,
            sacnMin: Number.isNaN(sacnMin) ? 1 : sacnMin,
            sacnMax: Number.isNaN(sacnMax) ? 96 : sacnMax
        });
        if (res && res.success === false) {
            this.setLuminexDiscoveryStatus(this.t('luminex.discoverError', { msg: res.error || 'save' }));
            return;
        }
        this.setLuminexDiscoveryStatus(this.t('luminex.hostSaved'));
        await this.fetchLuminodeCapabilitiesUI();
    }

    _normalizeLuminexRoutePatches(arr) {
        return (arr || [])
            .map((p) => ({
                sourceUniverse: Number(p.sourceUniverse),
                outputKey: p.outputKey != null ? String(p.outputKey) : ''
            }))
            .filter((p) => !Number.isNaN(p.sourceUniverse) && p.outputKey);
    }

    /**
     * @param {number|null} pbId
     */
    _getSavedPatchesForPb(pbId) {
        if (pbId == null) return [];
        return this._luminexRoutePatchesByPb[String(pbId)] || [];
    }

    _hydrateLuminexRoutePatchesFromConfig(cfg) {
        const r = (cfg && cfg.route) || {};
        if (r.patchesByProcessblock && typeof r.patchesByProcessblock === 'object' && !Array.isArray(r.patchesByProcessblock)) {
            this._luminexRoutePatchesByPb = {};
            for (const [k, v] of Object.entries(r.patchesByProcessblock)) {
                this._luminexRoutePatchesByPb[k] = this._normalizeLuminexRoutePatches(Array.isArray(v) ? v : []);
            }
        } else if (Array.isArray(r.patches) && r.patches.length) {
            const pid = r.processblockId != null ? String(r.processblockId) : '0';
            this._luminexRoutePatchesByPb = { [pid]: this._normalizeLuminexRoutePatches(r.patches) };
        } else if (r.sourceUniverse != null && r.outputKey) {
            const pid = r.processblockId != null ? String(r.processblockId) : '0';
            this._luminexRoutePatchesByPb = {
                [pid]: this._normalizeLuminexRoutePatches([{ sourceUniverse: r.sourceUniverse, outputKey: r.outputKey }])
            };
        } else {
            this._luminexRoutePatchesByPb = {};
        }
    }

    async runSacnDiscovery() {
        if (!window.electronAPI?.discoverSacnUniverses) {
            this.setLuminexSacnStatus(this.t('luminex.discoverUnavailable'), { isError: true });
            return;
        }
        if (this._luminexSacnRunning) return;
        this._luminexSacnRunning = true;
        const btn = document.getElementById('luminexSacnScanBtn');
        if (btn) btn.disabled = true;
        this.setLuminexSacnStatus(this.t('luminex.sacnScanning'), {});
        const minEl = document.getElementById('luminexSacnMin');
        const maxEl = document.getElementById('luminexSacnMax');
        const minU = minEl ? parseInt(minEl.value, 10) : 1;
        const maxU = maxEl ? parseInt(maxEl.value, 10) : 96;
        const hostEl = document.getElementById('luminexHostInput');
        const hintHost =
            hostEl && String(hostEl.value || '').trim() ? String(hostEl.value).trim() : undefined;
        const selectedIface = String(
            this.config?.app?.networkRouting?.sacnInterface ||
            this.config?.app?.networkRouting?.luminexInterface ||
            ''
        ).trim();
        const iface = selectedIface && selectedIface !== 'auto' ? selectedIface : undefined;
        try {
            const res = await window.electronAPI.discoverSacnUniverses({
                minUniverse: Number.isNaN(minU) ? 1 : minU,
                maxUniverse: Number.isNaN(maxU) ? 96 : maxU,
                durationMs: 7500,
                hintHost,
                iface
            });
            if (!res || !res.ok) {
                this.setLuminexSacnStatus(this.t('luminex.sacnError', { msg: (res && res.error) || '?' }), {
                    isError: true,
                    warnings: (res && res.warnings) || []
                });
                this._luminexSacnUniverses = [];
                await this.refreshLuminexMatrixPorts();
                return;
            }
            this._luminexSacnUniverses = res.universes || [];
            const n = this._luminexSacnUniverses.length;
            const totalStreams =
                res.totalStreams != null ? Number(res.totalStreams) : n;
            let mainLine;
            if (n === 0) {
                mainLine = this.t('luminex.sacnEmpty');
            } else if (totalStreams > n) {
                mainLine = this.t('luminex.sacnDoneUniversesAndSources', {
                    u: n,
                    s: totalStreams
                });
            } else {
                mainLine = this.t('luminex.sacnDone', { n });
            }
            const rmin = res.range && res.range.min != null ? res.range.min : minU;
            const rmax = res.range && res.range.max != null ? res.range.max : maxU;
            const sec = res.durationMs != null ? Math.round(Number(res.durationMs) / 1000) : 8;
            let metaLine = this.t('luminex.sacnScanMeta', { min: rmin, max: rmax, sec });
            if (res.multicastIface) {
                metaLine += this.t('luminex.sacnScanMetaIface', { iface: res.multicastIface });
            }
            this.setLuminexSacnStatus(mainLine, {
                meta: metaLine,
                warnings: res.warnings || []
            });
            const prev = await this.getLuminexConfigRaw();
            await window.electronAPI.saveConfig('luminex', {
                ...prev,
                sacnMin: Number.isNaN(minU) ? 1 : minU,
                sacnMax: Number.isNaN(maxU) ? 96 : maxU
            });
            await this.refreshLuminexMatrixPorts();
        } catch (e) {
            this.setLuminexSacnStatus(this.t('luminex.sacnError', { msg: e.message || String(e) }), {
                isError: true
            });
            await this.refreshLuminexMatrixPorts();
        } finally {
            this._luminexSacnRunning = false;
            if (btn) btn.disabled = false;
        }
    }

    buildOutputOptionsFromCapabilities(cap) {
        const opts = [];
        const di = cap.deviceinfo || {};
        const n = Number(di.nr_dmx_ports) || 0;
        for (let i = 1; i <= n; i++) {
            opts.push({
                key: `dmx:${i - 1}`,
                label: this.t('luminex.outputDmx', { n: i }),
                ioClass: 'dmx'
            });
        }
        const io = cap.io;
        if (Array.isArray(io)) {
            io.forEach((row, idx) => {
                const name = row.name || row.label || row.title || `I/O ${idx + 1}`;
                const cls = row.io_class != null ? String(row.io_class).toLowerCase() : '';
                opts.push({ key: `io:${idx}`, label: String(name), ioClass: cls });
            });
        } else if (io && typeof io === 'object') {
            const arr = io.outputs || io.IO || io.list;
            if (Array.isArray(arr)) {
                arr.forEach((row, idx) => {
                    const name = row.name || row.label || `Output ${idx + 1}`;
                    const cls = row.io_class != null ? String(row.io_class).toLowerCase() : '';
                    opts.push({ key: `ioarr:${idx}`, label: String(name), ioClass: cls });
                });
            }
        }
        if (opts.length === 0) {
            opts.push({ key: 'web:manual', label: this.t('luminex.outputFallback'), ioClass: '' });
        }
        return opts;
    }

    buildDefaultLuminexOutputs() {
        const out = [];
        for (let i = 1; i <= 8; i++) {
            out.push({
                key: `dmx:${i - 1}`,
                label: this.t('luminex.outputDmx', { n: i }),
                ioClass: 'dmx'
            });
        }
        return out;
    }

    /** sACN-universes die op de LumiNode als uitgang staan — scan kan dat als “bron” tonen; het is merge→uitgang. */
    getSacnOutputUniversesFromCap(cap) {
        const s = new Set();
        if (!cap || !Array.isArray(cap.io)) return s;
        cap.io.forEach((row) => {
            if (!row || String(row.io_class).toLowerCase() !== 'sacn') return;
            const ot = String(row.io_type ?? '').toLowerCase();
            if (ot === 'input' || ot === 'idle') return;
            if (ot !== '' && ot !== 'output') return;
            const u = Number(row.universe);
            if (!Number.isNaN(u) && u >= 1 && u <= 64000) s.add(u);
        });
        return s;
    }

    /** Voegt device-routing en lokaal opgeslagen routes samen (device wint bij dezelfde bron→uitgang). */
    mergeRoutePatches(devicePatches, savedPatches) {
        const m = new Map();
        for (const p of savedPatches || []) {
            if (p == null || p.sourceUniverse == null || !p.outputKey) continue;
            const pid = p.processblockId != null && p.processblockId !== '' ? Number(p.processblockId) : null;
            m.set(`${pid == null ? '' : pid}→${Number(p.sourceUniverse)}→${String(p.outputKey)}`, {
                sourceUniverse: Number(p.sourceUniverse),
                outputKey: String(p.outputKey),
                processblockId: pid
            });
        }
        for (const p of devicePatches || []) {
            if (p == null || p.sourceUniverse == null || !p.outputKey) continue;
            const pid = p.processblockId != null && p.processblockId !== '' ? Number(p.processblockId) : null;
            m.set(`${pid == null ? '' : pid}→${Number(p.sourceUniverse)}→${String(p.outputKey)}`, {
                sourceUniverse: Number(p.sourceUniverse),
                outputKey: String(p.outputKey),
                processblockId: pid
            });
        }
        return [...m.values()];
    }

    normalizePipelineOutputsBlob(raw) {
        if (!raw || raw._error) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'object') {
            const keys = ['outputs', 'output', 'list', 'data', 'items', 'IO'];
            for (const k of keys) {
                if (Array.isArray(raw[k])) return raw[k];
            }
        }
        return [];
    }

    /** Bron-volgorde zoals de LumiNode die oplevert (slot 0 = eerste invoer in de flow). */
    extractOrderedSourceSlots(sources) {
        if (!sources || sources._error) return [];
        const parseNum = (v) => {
            if (typeof v === 'number' && v >= 1 && v <= 64000) return v;
            if (typeof v === 'string') {
                const t = v.trim();
                if (/^\d{1,5}$/.test(t)) {
                    const n = parseInt(t, 10);
                    if (n >= 1 && n <= 64000) return n;
                }
                const m = t.match(/^(\d+)\s*\.\s*(\d{1,5})$/);
                if (m) {
                    const n = parseInt(m[2], 10);
                    if (n >= 1 && n <= 64000) return n;
                }
            }
            return null;
        };
        const extractU = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            const keys = [
                'universe',
                'Universe',
                'sourceUniverse',
                'sacn_universe',
                'universeId',
                'uni',
                'dmxUniverse',
                'dmx_universe'
            ];
            for (const k of keys) {
                if (obj[k] == null) continue;
                const n = parseNum(obj[k]);
                if (n != null) return n;
            }
            return null;
        };
        if (Array.isArray(sources)) {
            const out = [];
            for (const item of sources) {
                if (typeof item === 'number' && item >= 1 && item <= 64000) {
                    out.push(item);
                    continue;
                }
                if (item && typeof item === 'object') {
                    const u = extractU(item);
                    if (u != null) out.push(u);
                }
            }
            return out;
        }
        if (typeof sources === 'object') {
            const numKeys = Object.keys(sources)
                .filter((k) => /^\d+$/.test(k))
                .map(Number)
                .sort((a, b) => a - b);
            if (numKeys.length) {
                return numKeys
                    .map((k) => {
                        const item = sources[String(k)];
                        if (typeof item === 'number' && item >= 1 && item <= 64000) return item;
                        if (item && typeof item === 'object') return extractU(item);
                        return null;
                    })
                    .filter((u) => u != null);
            }
        }
        return [];
    }

    resolveOutputKeyForPipelineOutput(outEntry, oi, outputOpts) {
        if (!outEntry || typeof outEntry !== 'object' || !Array.isArray(outputOpts) || outputOpts.length === 0) return null;
        const label = (outEntry.name || outEntry.label || outEntry.title || outEntry.protocol || '').toString();
        const hay = `${label} ${outEntry.type || ''} ${outEntry.io_type || ''}`.toLowerCase();
        if (hay.trim()) {
            for (const o of outputOpts) {
                const ol = o.label.toLowerCase();
                if (ol.length >= 3 && hay.includes(ol.slice(0, Math.min(8, ol.length)))) return o.key;
            }
        }
        const idx = outEntry.index ?? outEntry.output_index ?? outEntry.id ?? oi;
        const n = Number(idx);
        if (!Number.isNaN(n) && outputOpts[n]) return outputOpts[n].key;
        if (outputOpts[oi]) return outputOpts[oi].key;
        return null;
    }

    pickGraphUniverse(obj) {
        if (!obj || typeof obj !== 'object') return null;
        const keys = [
            'input_universe',
            'inputUniverse',
            'sourceUniverse',
            'universe_in',
            'src_universe',
            'universe'
        ];
        for (const k of keys) {
            if (obj[k] == null) continue;
            const n = Number(obj[k]);
            if (!Number.isNaN(n) && n >= 1 && n <= 64000) return n;
        }
        return null;
    }

    pickGraphOutputKey(obj, outputOpts) {
        if (!obj || typeof obj !== 'object' || !Array.isArray(outputOpts)) return null;
        if (obj.output_key != null) {
            const s = String(obj.output_key);
            if (outputOpts.some((o) => o.key === s)) return s;
        }
        const oi = obj.output_index ?? obj.output_idx ?? obj.out_index ?? obj.destination_index;
        if (oi != null && Number.isFinite(Number(oi))) {
            const i = Number(oi);
            if (outputOpts[i]) return outputOpts[i].key;
        }
        return null;
    }

    collectPatchesFromPipelineGraph(root, outputOpts, tryAdd, depth = 0) {
        if (depth > 18 || root == null) return;
        if (Array.isArray(root)) {
            root.forEach((x) => this.collectPatchesFromPipelineGraph(x, outputOpts, tryAdd, depth + 1));
            return;
        }
        if (typeof root !== 'object') return;
        const u = this.pickGraphUniverse(root);
        const ok = this.pickGraphOutputKey(root, outputOpts);
        if (u != null && ok) tryAdd(u, ok);
        for (const v of Object.values(root)) {
            if (v != null && typeof v === 'object') this.collectPatchesFromPipelineGraph(v, outputOpts, tryAdd, depth + 1);
        }
    }

    buildIoByIdMap(cap) {
        const m = new Map();
        const ioList = cap && Array.isArray(cap.io) ? cap.io : [];
        ioList.forEach((row) => {
            if (row && row.id != null && !Number.isNaN(Number(row.id))) m.set(Number(row.id), row);
        });
        return m;
    }

    /** Zelfde volgorde/sleutels als buildOutputOptionsFromCapabilities: dmx:p, daarna io:idx. */
    buildIoIdToOutputKeyMap(cap) {
        const map = new Map();
        const di = (cap && cap.deviceinfo) || {};
        const nrDmx = Number(di.nr_dmx_ports) || 0;
        const ioList = cap && Array.isArray(cap.io) ? cap.io : [];
        ioList.forEach((row, idx) => {
            if (row == null || row.id == null) return;
            const id = Number(row.id);
            if (Number.isNaN(id)) return;
            const cls = String(row.io_class || '').toLowerCase();
            if (cls === 'dmx') {
                const pn = Number(row.port_number) || 0;
                if (pn >= 0 && (nrDmx === 0 || pn < nrDmx)) {
                    map.set(id, `dmx:${pn}`);
                    return;
                }
            }
            map.set(id, `io:${idx}`);
        });
        return map;
    }

    /** Universe voor matrix-bronkolom (sACN/Art-Net/DMX-input). */
    universeFromInputIo(io) {
        if (!io || typeof io !== 'object') return null;
        const cls = String(io.io_class || '').toLowerCase();
        if (cls === 'sacn') {
            const u = Number(io.universe);
            if (!Number.isNaN(u) && u >= 1 && u <= 64000) return u;
        }
        if (cls === 'artnet') {
            const u = Number(io.universe);
            if (!Number.isNaN(u) && u >= 0 && u <= 64000) return u >= 1 ? u : u + 1;
        }
        if (cls === 'dmx') {
            const rdm = Number(io.rdm_universe);
            if (!Number.isNaN(rdm) && rdm >= 0) return rdm;
            const pn = Number(io.port_number);
            if (!Number.isNaN(pn) && pn >= 0) return pn + 1;
        }
        return null;
    }

    /**
     * LumiNode levert processblock/{id} soms met inputs/outputs in een geneste `processblockConfig`.
     */
    _normalizeProcessBlockSerializeConfig(cfg) {
        if (!cfg || typeof cfg !== 'object' || cfg._error) return null;
        if (cfg.inputs && cfg.outputs && typeof cfg.inputs === 'object' && typeof cfg.outputs === 'object') {
            return { inputs: cfg.inputs, outputs: cfg.outputs };
        }
        const pbc = cfg.processblockConfig;
        if (pbc && typeof pbc === 'object' && pbc.inputs && pbc.outputs) {
            return { inputs: pbc.inputs, outputs: pbc.outputs };
        }
        if (cfg.data && typeof cfg.data === 'object' && cfg.data.inputs && cfg.data.outputs) {
            return { inputs: cfg.data.inputs, outputs: cfg.data.outputs };
        }
        if (cfg.meta && typeof cfg.meta === 'object' && cfg.meta.inputs && cfg.meta.outputs) {
            return { inputs: cfg.meta.inputs, outputs: cfg.meta.outputs };
        }
        if (
            cfg.configuration &&
            typeof cfg.configuration === 'object' &&
            cfg.configuration.inputs &&
            cfg.configuration.outputs
        ) {
            return { inputs: cfg.configuration.inputs, outputs: cfg.configuration.outputs };
        }
        return null;
    }

    /** inputs/outputs als array [{ io_id, … }] of [12, 13] → slot-map voor infer. */
    _coerceProcessBlockIoMaps(inputs, outs) {
        const toMap = (v) => {
            if (v == null) return v;
            if (!Array.isArray(v)) return v;
            const o = {};
            v.forEach((item, i) => {
                if (item == null) return;
                if (typeof item === 'number' || typeof item === 'string') {
                    const n = Number(item);
                    if (!Number.isNaN(n)) o[String(i)] = n;
                    return;
                }
                if (typeof item === 'object') {
                    const id = item.io_id ?? item.ioId ?? item.id ?? item.IO;
                    if (id == null) return;
                    const n = Number(id);
                    if (Number.isNaN(n)) return;
                    const slot = item.slot != null ? String(item.slot) : String(i);
                    o[slot] = n;
                }
            });
            return o;
        };
        return { inputs: toMap(inputs), outputs: toMap(outs) };
    }

    /**
     * OpenAPI ProcessBlockSerialize: inputs { slot: io_id }, outputs { key: io_id }.
     * Merge-engine: alle actieve invoer-universes naar elke geconfigureerde uitgang (zoals op de node).
     */
    inferPatchesFromProcessBlockSerialize(cfg, cap, outputOpts) {
        const flat = this._normalizeProcessBlockSerializeConfig(cfg);
        if (!flat) return [];
        const coerced = this._coerceProcessBlockIoMaps(flat.inputs, flat.outputs);
        const inputs = coerced.inputs;
        const outs = coerced.outputs;
        if (!inputs || !outs || typeof inputs !== 'object' || typeof outs !== 'object') return [];

        const ioById = this.buildIoByIdMap(cap);
        const ioIdToKey = this.buildIoIdToOutputKeyMap(cap);
        const validKeys = new Set((outputOpts || []).map((o) => o.key));

        const inputUniverses = [];
        for (const ioIdRaw of Object.values(inputs)) {
            const ioId = Number(ioIdRaw);
            if (Number.isNaN(ioId) || ioId < 0) continue;
            const io = ioById.get(ioId);
            const u = this.universeFromInputIo(io);
            if (u != null) inputUniverses.push(u);
        }
        const uniqIn = [...new Set(inputUniverses)];

        const outputKeys = [];
        for (const ioIdRaw of Object.values(outs)) {
            const ioId = Number(ioIdRaw);
            if (Number.isNaN(ioId) || ioId < 0) continue;
            const ok = ioIdToKey.get(ioId);
            if (ok && validKeys.has(ok)) outputKeys.push(ok);
        }
        const uniqOut = [...new Set(outputKeys)];

        if (uniqIn.length === 0 || uniqOut.length === 0) return [];

        const patches = [];
        for (const u of uniqIn) {
            for (const ok of uniqOut) {
                patches.push({ sourceUniverse: u, outputKey: ok });
            }
        }
        return patches;
    }

    _collectIoIds(v, out, keyHint = '') {
        if (v == null) return;
        if (typeof v === 'number' || typeof v === 'string') {
            if (!/io|id|input|output|slot/i.test(String(keyHint || ''))) return;
            const n = Number(v);
            if (!Number.isNaN(n) && n >= 0) out.push(n);
            return;
        }
        if (Array.isArray(v)) {
            v.forEach((x) => this._collectIoIds(x, out, keyHint));
            return;
        }
        if (typeof v !== 'object') return;
        if (v._error) return;
        const maybeId = v.io_id ?? v.ioId ?? v.id ?? v.IO;
        if (maybeId != null) {
            const n = Number(maybeId);
            if (!Number.isNaN(n) && n >= 0) out.push(n);
        }
        for (const [k, val] of Object.entries(v)) this._collectIoIds(val, out, k);
    }

    inferDeviceRoutePatchesFromExtendedApi(pb, cap, outputOpts) {
        if (!pb || !cap || !Array.isArray(outputOpts) || outputOpts.length === 0) return [];
        const ioById = this.buildIoByIdMap(cap);
        const ioIdToKey = this.buildIoIdToOutputKeyMap(cap);
        const validKeys = new Set(outputOpts.map((o) => String(o.key || '')));

        const inIoIdsRaw = [];
        const outIoIdsRaw = [];

        /* 1) Processblock serialize (direct of genest) */
        const cfg = this._normalizeProcessBlockSerializeConfig(pb.processblockConfig || pb.meta);
        if (cfg) {
            const c = this._coerceProcessBlockIoMaps(cfg.inputs, cfg.outputs);
            this._collectIoIds(c.inputs, inIoIdsRaw, 'input');
            this._collectIoIds(c.outputs, outIoIdsRaw, 'output');
        }

        /* 2) Extra endpoints uit OpenAPI */
        this._collectIoIds(pb.processblockInputSlots, inIoIdsRaw, 'input');
        this._collectIoIds(pb.processblockOutputsConfig, outIoIdsRaw, 'output');
        this._collectIoIds(pb.ioByProcessblockInput, inIoIdsRaw, 'input');

        const inputUniverses = [];
        for (const ioId of inIoIdsRaw) {
            const io = ioById.get(Number(ioId));
            const u = this.universeFromInputIo(io);
            if (u != null) inputUniverses.push(Number(u));
        }
        const uniqIn = [...new Set(inputUniverses)];

        const outputKeys = [];
        for (const ioId of outIoIdsRaw) {
            const ok = ioIdToKey.get(Number(ioId));
            if (ok && validKeys.has(ok)) outputKeys.push(String(ok));
        }
        const uniqOut = [...new Set(outputKeys)];

        if (uniqIn.length === 0 || uniqOut.length === 0) return [];
        const patches = [];
        for (const u of uniqIn) {
            for (const ok of uniqOut) patches.push({ sourceUniverse: u, outputKey: ok });
        }
        return patches;
    }

    /**
     * Fallback: pipeline JSON (sources/outputs blobs) + pipelineRoot-graaf.
     */
    inferDeviceRoutePatchesFromPipeline(pb, outputOpts) {
        if (!pb || !Array.isArray(outputOpts) || outputOpts.length === 0) return [];
        const patches = [];
        const tryAdd = (u, key) => {
            const n = Number(u);
            if (Number.isNaN(n) || n < 1 || !key) return;
            patches.push({ sourceUniverse: n, outputKey: String(key) });
        };
        const slotU = this.extractOrderedSourceSlots(pb.sources);
        const outs = this.normalizePipelineOutputsBlob(pb.outputs);
        outs.forEach((outEntry, oi) => {
            const outKey = this.resolveOutputKeyForPipelineOutput(outEntry, oi, outputOpts);
            if (!outKey) return;
            const slotKeys = [
                'inputs',
                'input_slots',
                'source_slots',
                'input_indices',
                'source_indices',
                'from_slots',
                'in_slots',
                'active_sources',
                'sources',
                'connected_inputs'
            ];
            for (const sk of slotKeys) {
                const arr = outEntry[sk];
                if (!Array.isArray(arr)) continue;
                for (const slot of arr) {
                    const si = Number(slot);
                    if (!Number.isNaN(si) && slotU[si] != null) tryAdd(slotU[si], outKey);
                }
            }
            const single = outEntry.input_slot ?? outEntry.input_index ?? outEntry.source_slot;
            if (single != null && !Number.isNaN(Number(single)) && slotU[Number(single)] != null) {
                tryAdd(slotU[Number(single)], outKey);
            }
        });

        if (pb.pipelineRoot && typeof pb.pipelineRoot === 'object') {
            this.collectPatchesFromPipelineGraph(pb.pipelineRoot, outputOpts, tryAdd, 0);
        }

        const seen = new Set();
        const out = [];
        for (const p of patches) {
            const k = `${p.sourceUniverse}→${p.outputKey}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(p);
        }
        return out;
    }

    /**
     * Eerst OpenAPI processblock (inputs/outputs als io_id), anders pipeline-heuristiek.
     * Zet route.deviceRouting false om uit te zetten.
     */
    inferDeviceRoutePatches(pb, cap, outputOpts) {
        if (!pb || !cap || !Array.isArray(outputOpts) || outputOpts.length === 0) return [];
        const fromExtendedApi = this.inferDeviceRoutePatchesFromExtendedApi(pb, cap, outputOpts);
        if (fromExtendedApi.length > 0) return fromExtendedApi;
        return this.inferDeviceRoutePatchesFromPipeline(pb, outputOpts);
    }

    /** Haalt universe-nummers uit het ruwe JSON van pipeline/.../sources (LumiNode). */
    extractUniversesFromLumiNodeSources(sources) {
        const out = [];
        const seen = new Set();
        const walk = (v, key) => {
            if (v == null) return;
            if (typeof v === 'number') {
                const n = v;
                if (n >= 1 && n <= 64000 && key && /universe|net|src|source|sacn|dmx|input|port/i.test(String(key))) {
                    if (!seen.has(n)) {
                        seen.add(n);
                        out.push(n);
                    }
                }
                return;
            }
            if (Array.isArray(v)) {
                v.forEach((item) => walk(item, key));
                return;
            }
            if (typeof v === 'object') {
                for (const [k, val] of Object.entries(v)) {
                    walk(val, k);
                    if (typeof val === 'number' && val >= 1 && val <= 64000) {
                        if (/universe|net|src|source|sacn|dmx|input|port/i.test(k) && !seen.has(val)) {
                            seen.add(val);
                            out.push(val);
                        }
                    }
                }
            }
        };
        walk(sources, '');
        return out.sort((a, b) => a - b);
    }

    /**
     * Parseert pipeline/.../sources JSON naar rijen met universe + netwerk/tags uit LumiNode.
     * Ondersteunt o.a. arrays van universe-nummers en objecten met network/interface/tags.
     */
    parseLumiNodeSourcesToRows(sources) {
        const byU = new Map();

        const mergeNet = (a, b) => {
            if (!b || !String(b).trim()) return a || '';
            const t = String(b).trim();
            if (!a) return t;
            if (a.includes(t)) return a;
            return `${a} · ${t}`;
        };

        const add = (u, opts = {}) => {
            const n = Number(u);
            if (Number.isNaN(n) || n < 1 || n > 64000) return;
            const cur = byU.get(n) || { universe: n, networkTag: '', labelFromDevice: '' };
            if (opts.networkTag) cur.networkTag = mergeNet(cur.networkTag, opts.networkTag);
            if (opts.labelFromDevice && String(opts.labelFromDevice).trim() && !cur.labelFromDevice) {
                cur.labelFromDevice = String(opts.labelFromDevice).trim();
            }
            byU.set(n, cur);
        };

        const parseNum = (v) => {
            if (typeof v === 'number' && v >= 1 && v <= 64000) return v;
            if (typeof v === 'string') {
                const t = v.trim();
                if (/^\d{1,5}$/.test(t)) {
                    const n = parseInt(t, 10);
                    if (n >= 1 && n <= 64000) return n;
                }
                const m = t.match(/^(\d+)\s*\.\s*(\d{1,5})$/);
                if (m) {
                    const n = parseInt(m[2], 10);
                    if (n >= 1 && n <= 64000) return n;
                }
            }
            return null;
        };

        const extractNetworkFromObj = (obj) => {
            const keys = [
                'network',
                'Network',
                'networkName',
                'interface',
                'Interface',
                'nic',
                'NIC',
                'ethernet',
                'sourceNetwork',
                'netName',
                'net',
                'Net',
                'iface',
                'deviceNetwork',
                'tag',
                'Tag',
                'tags',
                'network_tag',
                'NetworkTag',
                'networkTags',
                'vlan',
                'ipSubnet',
                'subnet'
            ];
            for (const k of keys) {
                const v = obj[k];
                if (v == null) continue;
                if (Array.isArray(v)) {
                    const s = v
                        .map((x) => {
                            if (x != null && typeof x === 'object' && x.name != null) return String(x.name);
                            if (x != null && typeof x !== 'object') return String(x);
                            return '';
                        })
                        .filter(Boolean)
                        .join(', ');
                    if (s) return s;
                } else if (typeof v === 'object' && v != null && v.name != null) {
                    return String(v.name);
                } else if (typeof v === 'string' || typeof v === 'number') {
                    return String(v);
                }
            }
            return '';
        };

        const extractLabelFromObj = (obj) => {
            const keys = ['name', 'label', 'sourceName', 'title', 'SourceName', 'displayName', 'shortName', 'description'];
            for (const k of keys) {
                if (obj[k] != null && String(obj[k]).trim()) return String(obj[k]).trim();
            }
            return '';
        };

        const extractUniverseFromObj = (obj) => {
            const keys = [
                'universe',
                'Universe',
                'sourceUniverse',
                'sacn_universe',
                'universeId',
                'uni',
                'unv',
                'dmxUniverse',
                'dmx_universe',
                'UniverseNumber',
                'universe_no',
                'universeNumber'
            ];
            for (const k of keys) {
                if (obj[k] == null) continue;
                const n = parseNum(obj[k]);
                if (n != null) return n;
            }
            return null;
        };

        const handleObject = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            const u = extractUniverseFromObj(obj);
            if (u != null) {
                add(u, {
                    networkTag: extractNetworkFromObj(obj),
                    labelFromDevice: extractLabelFromObj(obj)
                });
            }
        };

        const walk = (v, depth) => {
            if (depth > 48 || v == null) return;
            if (Array.isArray(v)) {
                if (
                    v.length > 0 &&
                    v.every((x) => typeof x === 'number' && x >= 1 && x <= 64000)
                ) {
                    v.forEach((n) => add(n, {}));
                    return;
                }
                v.forEach((item) => walk(item, depth + 1));
                return;
            }
            if (typeof v === 'object') {
                handleObject(v);
                for (const [k, val] of Object.entries(v)) {
                    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
                        const kn = parseNum(k);
                        if (kn != null) {
                            add(kn, {
                                networkTag: extractNetworkFromObj(val),
                                labelFromDevice: extractLabelFromObj(val)
                            });
                        }
                    }
                    walk(val, depth + 1);
                }
            }
        };

        walk(sources, 0);
        return Array.from(byU.values()).sort((a, b) => a.universe - b.universe);
    }

    /**
     * Universes die volgens device-routing (of bronnenlijst) in de gekozen process engine samenkomen — voor HPT-merge-label op sACN-uit.
     */
    _computeMergeHtpSourceUniverses(pb, cap) {
        if (!pb || !cap || !cap.ok) return [];
        const fullOutputs = this.buildOutputOptionsFromCapabilities(cap);
        const patches = this.inferDeviceRoutePatches(pb, cap, fullOutputs);
        const s = new Set();
        for (const p of patches) {
            if (p.sourceUniverse != null) s.add(Number(p.sourceUniverse));
        }
        let arr = [...s].sort((a, b) => a - b);
        if (arr.length === 0 && pb.sources && !pb.sources._error) {
            let dr = this.parseLumiNodeSourcesToRows(pb.sources);
            if (dr.length === 0) {
                const nums = this.extractUniversesFromLumiNodeSources(pb.sources);
                dr = nums.map((u) => ({ universe: u }));
            }
            arr = [...new Set(dr.map((x) => Number(x.universe)).filter((u) => !Number.isNaN(u)))].sort((a, b) => a - b);
        }
        return arr;
    }

    /** Merge-modus zoals de LumiNode die meldt (processblock.mode), genormaliseerd naar korte label (HTP/LTP/…). */
    _formatMergeModeLabel(raw) {
        if (raw == null || raw === '') return 'HTP';
        const s = String(raw).trim();
        const u = s.toUpperCase();
        if (u.includes('HTP') || u.includes('HIGHEST')) return 'HTP';
        if (u.includes('LTP') || u.includes('LATEST') || u.includes('LOWEST')) return 'LTP';
        if (/^[A-Z0-9 _+-]{1,24}$/i.test(s)) return s.length <= 16 ? s.toUpperCase() : u.slice(0, 16);
        return 'HTP';
    }

    /**
     * Vervangt universe-nummers in pipeline/sources-JSON; vermijdt io_id en andere numerieke id's te wijzigen.
     */
    applyUniverseMapToPipelineSourcesJson(value, map) {
        if (value == null) return value;
        if (Array.isArray(value)) {
            if (value.length && value.every((x) => typeof x === 'number')) {
                return value.map((n) => (typeof n === 'number' && map.has(n) ? map.get(n) : n));
            }
            return value.map((v) => this.applyUniverseMapToPipelineSourcesJson(v, map));
        }
        if (typeof value === 'object') {
            const o = {};
            for (const [k, v] of Object.entries(value)) {
                const kl = String(k).toLowerCase();
                const universeKey =
                    /universe|univers|src|source|sacn|net$|input|dmx_port|port_no|rdm/i.test(kl) &&
                    !/id$|_id|index|slot|count|offset|version|type|class/i.test(kl);
                if (universeKey && typeof v === 'number' && map.has(v)) {
                    o[k] = map.get(v);
                } else {
                    o[k] = this.applyUniverseMapToPipelineSourcesJson(v, map);
                }
            }
            return o;
        }
        return value;
    }

    /** Invulo-universes per processblock.inputs-io_id (OpenAPI). */
    _inputUniversesFromProcessblockInputs(inputs, ioById) {
        const list = [];
        if (!inputs || typeof inputs !== 'object') return list;
        for (const ioIdRaw of Object.values(inputs)) {
            const io = ioById.get(Number(ioIdRaw));
            const u = this.universeFromInputIo(io);
            if (u != null) list.push(u);
        }
        return [...new Set(list)].sort((a, b) => a - b);
    }

    /** Zoekt io.id van een sACN-invoerregel met dit universe (zoals in deviceinfo IO-lijst). */
    findSacnInputIoIdForUniverse(cap, universe) {
        const u = Number(universe);
        if (Number.isNaN(u)) return null;
        const ioList = cap && Array.isArray(cap.io) ? cap.io : [];
        const scoreRow = (row) => {
            if (!row || row.id == null) return -1;
            if (String(row.io_class || '').toLowerCase() !== 'sacn') return -1;
            if (Number(row.universe) !== u) return -1;
            const ot = String(row.io_type || '').toLowerCase();
            if (ot === 'input' || ot === '') return 2;
            if (ot === 'output') return 0;
            return 1;
        };
        let best = null;
        let bestScore = -1;
        for (const row of ioList) {
            const sc = scoreRow(row);
            if (sc > bestScore) {
                bestScore = sc;
                best = row;
            }
        }
        return best && best.id != null ? Number(best.id) : null;
    }

    buildMergedSacnInputs(cap, processblockId, scanUniverses) {
        const scanList = Array.isArray(scanUniverses) ? scanUniverses : [];
        const scanMap = new Map();
        for (const u of scanList) {
            if (u == null || u.universe == null) continue;
            const n = Number(u.universe);
            if (!Number.isNaN(n)) scanMap.set(n, u);
        }

        const scanRowForUniverse = (uni) => {
            const n = Number(uni);
            if (Number.isNaN(n)) return null;
            const direct = scanMap.get(n);
            if (direct) return direct;
            for (const x of scanList) {
                if (x && Number(x.universe) === n) return x;
            }
            return null;
        };

        const isLiveSacn = (s) => {
            if (!s) return false;
            if (Number(s.hits) > 0) return true;
            if (s.sourceName && String(s.sourceName).trim()) return true;
            if (s.sourceAddress && String(s.sourceAddress).trim()) return true;
            return false;
        };

        const rows = [];
        const seenU = new Set();
        const sacnOutU = this.getSacnOutputUniversesFromCap(cap);
        const pb =
            cap && cap.ok && Array.isArray(cap.processblocks)
                ? cap.processblocks.find((p) => Number(p.id) === Number(processblockId))
                : null;
        const mergeHtpUniverses = this._computeMergeHtpSourceUniverses(pb, cap);
        const mergeModeLabel = pb ? this._formatMergeModeLabel(pb.meta?.mode ?? pb.processblockConfig?.mode) : 'HTP';
        if (pb && pb.sources && !pb.sources._error) {
            let deviceRows = this.parseLumiNodeSourcesToRows(pb.sources);
            if (deviceRows.length === 0) {
                const nums = this.extractUniversesFromLumiNodeSources(pb.sources);
                deviceRows = nums.map((u) => ({ universe: u, networkTag: '', labelFromDevice: '' }));
            }
            deviceRows.forEach((dr) => {
                const u = Number(dr.universe);
                if (Number.isNaN(u)) return;
                seenU.add(u);
                const s = scanRowForUniverse(u);
                const liveSacn = isLiveSacn(s);
                const sourceName =
                    (s && s.sourceName && String(s.sourceName).trim()) ||
                    (dr.labelFromDevice && String(dr.labelFromDevice).trim()) ||
                    this.t('luminex.deviceSourceLabel');
                const row = {
                    universe: u,
                    sourceName,
                    sourceAddress: (s && s.sourceAddress) || '',
                    networkTag: dr.networkTag || '',
                    fromDevice: true,
                    liveSacn,
                    mergeFromEngine: sacnOutU.has(u)
                };
                if (row.mergeFromEngine) {
                    row.mergeHtpUniverses = mergeHtpUniverses.slice();
                    row.mergeModeLabel = mergeModeLabel;
                }
                rows.push(row);
            });
        }
        scanList.forEach((u) => {
            if (u == null || u.universe == null) return;
            const uni = Number(u.universe);
            if (Number.isNaN(uni)) return;
            if (!seenU.has(uni)) {
                const row = {
                    universe: uni,
                    sourceName: u.sourceName,
                    sourceAddress: u.sourceAddress || '',
                    networkTag: '',
                    fromDevice: false,
                    liveSacn: true,
                    mergeFromEngine: sacnOutU.has(uni)
                };
                if (row.mergeFromEngine) {
                    row.mergeHtpUniverses = mergeHtpUniverses.slice();
                    row.mergeModeLabel = mergeModeLabel;
                }
                rows.push(row);
            }
        });
        rows.sort((a, b) => a.universe - b.universe);
        return rows.map((r) => ({ ...r, processblockId: Number(processblockId) }));
    }

    /**
     * Eén invoerkaart per universe (geen dubbele rijen per process engine); processblockId zit op de patch, niet op de bron.
     */
    dedupeMergedSacnInputsAcrossEngines(pbs, cap, scanUniverses) {
        const byNorm = new Map();
        const byMerge = new Map();
        for (const pb of pbs) {
            const rows = this.buildMergedSacnInputs(cap, pb.id, scanUniverses);
            for (const r of rows) {
                const u = Number(r.universe);
                if (Number.isNaN(u)) continue;
                if (r.mergeFromEngine) {
                    if (!byMerge.has(u)) {
                        const { processblockId: _pb, ...rest } = r;
                        byMerge.set(u, { ...rest });
                    } else {
                        const ex = byMerge.get(u);
                        if (!ex.fromDevice && r.fromDevice) ex.fromDevice = true;
                        if (r.liveSacn) ex.liveSacn = true;
                    }
                } else if (!byNorm.has(u)) {
                    const { processblockId: _pb, ...rest } = r;
                    byNorm.set(u, { ...rest });
                } else {
                    const ex = byNorm.get(u);
                    if (!ex.fromDevice && r.fromDevice) ex.fromDevice = true;
                    if (r.liveSacn) ex.liveSacn = true;
                }
            }
        }
        return [...byNorm.values(), ...byMerge.values()].sort((a, b) => Number(a.universe) - Number(b.universe));
    }

    _updateLuminexRouteStatusFromMatrices() {
        const patches = this._luminexMatrix?.getRoutePatches?.() || [];
        const n = patches.filter((p) => p.sourceUniverse != null && p.outputKey).length;
        this.setLuminexRouteStatus(this.t('luminex.matrixConnectionsStatus', { n: String(n) }));
    }

    async refreshLuminexMatrixPorts() {
        this.ensureLuminexMatrix();
        if (!this._luminexMatrix || !this._luminexMatrix.dynamic) return;
        const cfg = await this.getLuminexConfigRaw();
        const preserveLayout = cfg.route && cfg.route.preserveLuminexNodeLayout === true;
        const nl = cfg.nodeLayout;
        if (
            preserveLayout &&
            nl &&
            typeof nl === 'object' &&
            this._luminexMatrix.setNodeLayout
        ) {
            if (nl.byProcessblock && typeof nl.byProcessblock === 'object') {
                const merged = {};
                for (const v of Object.values(nl.byProcessblock)) {
                    if (v && typeof v === 'object') Object.assign(merged, v);
                }
                this._luminexMatrix.setNodeLayout(merged, true);
            } else if (!nl.byProcessblock) {
                this._luminexMatrix.setNodeLayout(nl, true);
            }
        }
        const cap = this._luminexCapabilities;
        const pbsRaw = cap && cap.ok && Array.isArray(cap.processblocks) ? cap.processblocks : [];
        const _seenPbId = new Set();
        const pbs = pbsRaw.filter((pb) => {
            const id = Number(pb && pb.id);
            if (Number.isNaN(id) || _seenPbId.has(id)) return false;
            _seenPbId.add(id);
            return true;
        });
        if (pbs.length > 1 && this._luminexMatrix.setEngineBlockSpecs) {
            this._luminexMatrix.setEngineBlockSpecs(pbs.map((pb) => ({ id: pb.id, name: pb.name || '' })));
        } else if (this._luminexMatrix.setEngineBlockSpecs) {
            this._luminexMatrix.setEngineBlockSpecs(null);
        }
        const mergedInputs =
            pbs.length > 1
                ? this.dedupeMergedSacnInputsAcrossEngines(pbs, cap, this._luminexSacnUniverses)
                : pbs.length === 1
                  ? this.buildMergedSacnInputs(cap, pbs[0].id, this._luminexSacnUniverses)
                  : [];
        const fullOutputs =
            cap && cap.ok ? this.buildOutputOptionsFromCapabilities(cap) : this.buildDefaultLuminexOutputs();
        const deviceSync = cfg.route?.deviceRouting !== false;
        const showAllOutputs = cfg.route?.showAllOutputs === true;
        const allCombined = [];
        for (const pb of pbs) {
            const devicePatches =
                deviceSync && pb
                    ? this.inferDeviceRoutePatches(pb, cap, fullOutputs).map((p) => ({
                          ...p,
                          processblockId: Number(pb.id)
                      }))
                    : [];
            const savedPatches = this._getSavedPatchesForPb(pb.id).map((p) => ({
                ...p,
                processblockId: Number(pb.id)
            }));
            allCombined.push(...this.mergeRoutePatches(devicePatches, savedPatches));
        }
        const usedOutKeys = new Set(allCombined.map((p) => p.outputKey).filter(Boolean));
        const hideUnused = !showAllOutputs && allCombined.length > 0;
        const isIoOutputKey = (k) => {
            const s = String(k || '');
            return s.startsWith('io:') || s.startsWith('ioarr:');
        };
        const outputs = fullOutputs.map((o) => {
            const key = o.key;
            const used = key && usedOutKeys.has(key);
            const hideBecauseUnused = !!(hideUnused && key && !used);
            /*
             * Generieke fysieke I/O (cap.io, geen sACN-universe-uitgang) altijd verborgen — ook als
             * «Toon alle uitgangen» aan staat (die optie geldt voor ongebruikte DMX e.d., niet voor RJ45/I/O-blokken).
             * sACN-universe als uitgang (io_class sacn, label Universe …) blijft zichtbaar tenzij hideBecauseUnused.
             */
            const ioCls = String(o.ioClass || '').toLowerCase();
            const lab = String(o.label || '').trim();
            /* Ook als de node io_class=sacn foutief zet op fysieke I/O-poorten (label «I/O 6»). */
            const looksLikePhysicalIoLabel = /^I\s*\/\s*O\s*\d+/i.test(lab);
            const hideGenericPhysicalIo = !!(
                isIoOutputKey(key) &&
                (ioCls !== 'sacn' || looksLikePhysicalIoLabel)
            );
            return {
                ...o,
                hidden: hideBecauseUnused || hideGenericPhysicalIo
            };
        });
        if (pbs.length === 1) {
            const pb = pbs[0];
            this._luminexMatrix.setEngineSpec({ name: pb.name, id: pb.id });
        } else {
            this._luminexMatrix.setEngineSpec({ name: '', id: null });
        }
        this._luminexMatrix.setDynamicPorts(mergedInputs, outputs);
        if (allCombined.length) {
            this._luminexMatrix.applyPatchesFromRoutes(allCombined);
        }
        if (!preserveLayout && typeof this._luminexMatrix.applyAutoStackedLayout === 'function') {
            this._luminexMatrix.applyAutoStackedLayout();
        }
        this._updateLuminexRouteStatusFromMatrices();
    }

    onLuminexMatrixChange() {
        this._updateLuminexRouteStatusFromMatrices();
        if (this._luminexRouteAutoSaveTimer) clearTimeout(this._luminexRouteAutoSaveTimer);
        this._luminexRouteAutoSaveTimer = setTimeout(() => {
            this._luminexRouteAutoSaveTimer = null;
            void this.saveLuminexRoute({ silent: true });
        }, 550);
        if (this._luminexNodeSyncTimer) clearTimeout(this._luminexNodeSyncTimer);
        this._luminexNodeSyncTimer = setTimeout(() => {
            this._luminexNodeSyncTimer = null;
            void this.syncLuminodePipelineSources({ silent: true });
        }, 950);
    }

    async fetchLuminodeCapabilitiesUI() {
        const hostEl = document.getElementById('luminexHostInput');
        const pwEl = document.getElementById('luminexPasswordInput');
        if (!hostEl || !window.electronAPI?.getLuminodeCapabilities) return;
        const host = String(hostEl.value || '').trim();
        if (!host) {
            this.setLuminexEngineStatus(this.t('luminex.discoverError', { msg: 'host' }));
            return;
        }
        const password = pwEl ? String(pwEl.value || '') : '';
        this.setLuminexEngineStatus(this.t('luminex.fetchCapLoading'));
        try {
            const cap = await window.electronAPI.getLuminodeCapabilities(host, password);
            this._luminexCapabilities = cap;
            if (!cap.ok) {
                this.setLuminexEngineStatus(this.t('luminex.fetchCapError', { msg: (cap.errors && cap.errors[0]) || '?' }));
                return;
            }
            const pbSel = document.getElementById('luminexRouteProcessblock');
            if (pbSel) {
                pbSel.innerHTML = '';
                (cap.processblocks || []).forEach((pb) => {
                    const opt = document.createElement('option');
                    opt.value = String(pb.id);
                    opt.textContent = `${pb.name} (id ${pb.id})`;
                    pbSel.appendChild(opt);
                });
            }
            const cfg = await this.getLuminexConfigRaw();
            const r = cfg.route || {};
            const savedId = r.processblockId != null ? String(r.processblockId) : '';
            if (pbSel && pbSel.options.length > 0) {
                if (savedId && [...pbSel.options].some((o) => o.value === savedId)) {
                    pbSel.value = savedId;
                } else {
                    pbSel.selectedIndex = 0;
                }
            }
            this.setLuminexEngineStatus(this.t('luminex.fetchCapDone'));
            await this.refreshLuminexMatrixPorts();
        } catch (e) {
            this.setLuminexEngineStatus(this.t('luminex.fetchCapError', { msg: e.message || String(e) }));
        }
    }

    async openLuminodeWebUi() {
        const hostEl = document.getElementById('luminexHostInput');
        const host = hostEl && String(hostEl.value || '').trim();
        if (!host || !window.electronAPI?.openExternal) return;
        const url = `http://${host}/`;
        await window.electronAPI.openExternal(url);
    }

    /** Handmatig: duidelijke status + altijd resultaat tonen (ook «geen wijziging»). */
    async pushLuminodePatchFromUi() {
        if (!window.electronAPI?.luminodeFetchJson || !window.electronAPI?.luminodeWriteJson) {
            this.setLuminexEngineStatus(this.t('luminex.syncSourcesPutError', { detail: 'IPC' }));
            return;
        }
        this.setLuminexEngineStatus(this.t('luminex.syncSourcesWorking'));
        try {
            await this.syncLuminodePipelineSources({ silent: false });
        } catch (e) {
            this.setLuminexEngineStatus(this.t('luminex.syncSourcesPutError', { detail: e.message || String(e) }));
        }
    }

    /**
     * Eén processblock: pipeline/sources of fallback processblock-PUT.
     * @returns {'changed'|'noop'|'error'}
     */
    async _syncLuminodePipelineSourcesForProcessblock(host, password, cap, pbId) {
        const all = this._luminexMatrix?.getRoutePatches?.() || [];
        const pbs = cap && cap.ok && Array.isArray(cap.processblocks) ? cap.processblocks : [];
        const multi = pbs.length > 1;
        const patches = all.filter((p) => {
            if (p.processblockId != null && p.processblockId !== '') {
                return Number(p.processblockId) === Number(pbId);
            }
            /* In multi-engine mogen ongedefinieerde processblock-routes niet impliciet naar engine 1 vallen. */
            return !multi;
        });
        const hasExplicitForPb = all.some(
            (p) => p.processblockId != null && p.processblockId !== '' && Number(p.processblockId) === Number(pbId)
        );
        if (multi && !hasExplicitForPb) {
            return 'noop';
        }
        const rows = this.buildMergedSacnInputs(cap, pbId, this._luminexSacnUniverses);
        const mergeOut = new Set(rows.filter((x) => x.mergeFromEngine).map((x) => Number(x.universe)));
        const desired = [];
        for (const p of patches) {
            const u = Number(p.sourceUniverse);
            if (Number.isNaN(u)) continue;
            if (mergeOut.has(u)) continue;
            desired.push(u);
        }
        const desiredUnis = [...new Set(desired)].sort((a, b) => a - b);

        const pathSources = `pipeline/processblock/${pbId}/sources`;
        const res = await window.electronAPI.luminodeFetchJson({ host, password, path: pathSources });
        if (!res || !res.ok || res.data == null) {
            this.setLuminexEngineStatus(this.t('luminex.syncSourcesError', { detail: (res && res.error) || '?' }));
            return 'error';
        }

        const srcRows = this.parseLumiNodeSourcesToRows(res.data);
        let currentUnis =
            srcRows.length > 0
                ? [...new Set(srcRows.map((r) => Number(r.universe)).filter((n) => !Number.isNaN(n)))].sort(
                      (a, b) => a - b
                  )
                : this.extractUniversesFromLumiNodeSources(res.data).sort((a, b) => a - b);

        if (currentUnis.length !== desiredUnis.length) {
            this.setLuminexEngineStatus(
                this.t('luminex.syncSourcesCountMismatch', {
                    current: String(currentUnis.length),
                    desired: String(desiredUnis.length)
                })
            );
            return 'error';
        }
        const same =
            currentUnis.length === desiredUnis.length && currentUnis.every((v, i) => v === desiredUnis[i]);
        if (same) {
            return 'noop';
        }

        const map = new Map();
        for (let i = 0; i < currentUnis.length; i++) {
            map.set(currentUnis[i], desiredUnis[i]);
        }

        const newSourcesBody = this.applyUniverseMapToPipelineSourcesJson(res.data, map);
        let put = await window.electronAPI.luminodeWriteJson({
            host,
            password,
            path: pathSources,
            body: newSourcesBody,
            method: 'PUT'
        });
        if (!put || !put.ok) {
            put = await window.electronAPI.luminodeWriteJson({
                host,
                password,
                path: pathSources,
                body: newSourcesBody,
                method: 'POST'
            });
        }

        if (put && put.ok) {
            return 'changed';
        }

        const resPb = await window.electronAPI.luminodeFetchJson({ host, password, path: `processblock/${pbId}` });
        if (!resPb || !resPb.ok || resPb.data == null) {
            this.setLuminexEngineStatus(
                this.t('luminex.syncSourcesPutError', {
                    detail: (put && put.error) || '?'
                })
            );
            return 'error';
        }

        const rawPb = resPb.data;
        const cfg = rawPb.processblockConfig != null ? rawPb.processblockConfig : rawPb;
        const inputs = cfg && cfg.inputs;
        const ioById = this.buildIoByIdMap(cap);
        if (!inputs || typeof inputs !== 'object') {
            this.setLuminexEngineStatus(this.t('luminex.syncSourcesPutError', { detail: (put && put.error) || '?' }));
            return 'error';
        }

        const currentPbUnis = this._inputUniversesFromProcessblockInputs(inputs, ioById);
        if (currentPbUnis.length !== desiredUnis.length) {
            this.setLuminexEngineStatus(
                this.t('luminex.syncSourcesCountMismatch', {
                    current: String(currentPbUnis.length),
                    desired: String(desiredUnis.length)
                })
            );
            return 'error';
        }
        const mapPb = new Map();
        for (let i = 0; i < currentPbUnis.length; i++) {
            mapPb.set(currentPbUnis[i], desiredUnis[i]);
        }

        const out = JSON.parse(JSON.stringify(rawPb));
        const outCfg = out.processblockConfig != null ? out.processblockConfig : out;
        const newInputs = { ...outCfg.inputs };
        for (const [slot, ioIdRaw] of Object.entries(outCfg.inputs)) {
            const ioId = Number(ioIdRaw);
            const io = ioById.get(ioId);
            const u = this.universeFromInputIo(io);
            if (u == null || !mapPb.has(u)) continue;
            const targetU = mapPb.get(u);
            if (targetU === u) continue;
            const newIoId = this.findSacnInputIoIdForUniverse(cap, targetU);
            if (newIoId == null) {
                this.setLuminexEngineStatus(this.t('luminex.syncSourcesNoIo', { u: String(targetU) }));
                return 'error';
            }
            newInputs[slot] = newIoId;
        }
        const inputsChanged = Object.keys(newInputs).some(
            (slot) => Number(newInputs[slot]) !== Number(outCfg.inputs[slot])
        );
        if (!inputsChanged) {
            this.setLuminexEngineStatus(this.t('luminex.syncSourcesReadOnly'));
            return 'error';
        }
        if (out.processblockConfig != null) {
            out.processblockConfig = { ...outCfg, inputs: newInputs };
        } else {
            out.inputs = newInputs;
        }

        let putPb = await window.electronAPI.luminodeWriteJson({
            host,
            password,
            path: `processblock/${pbId}`,
            body: out,
            method: 'PUT'
        });
        if (!putPb || !putPb.ok) {
            putPb = await window.electronAPI.luminodeWriteJson({
                host,
                password,
                path: `processblock/${pbId}`,
                body: out,
                method: 'POST'
            });
        }
        if (!putPb || !putPb.ok) {
            this.setLuminexEngineStatus(
                this.t('luminex.syncSourcesPutError', { detail: (putPb && putPb.error) || (put && put.error) || '?' })
            );
            return 'error';
        }
        return 'changed';
    }

    /**
     * Schrijft naar de LumiNode: eerst pipeline/sources (als de firmware dat toestaat), anders PUT processblock/{id}
     * met hergemapte inputs-io_id's (OpenAPI). Zelfde aantal bronnen; pairwise op gesorteerde universe-lijsten.
     * @param {{ silent?: boolean }} [opts] — bij silent: geen succes- of «geen wijziging»-melding (wel fouten).
     */
    async syncLuminodePipelineSources(opts = {}) {
        const silent = opts && opts.silent === true;
        try {
            const prev = await this.getLuminexConfigRaw();
            const r = prev.route && typeof prev.route === 'object' ? prev.route : {};
            if (r.syncPipelineSources === false) return;
        } catch (_) {
            /* ignore */
        }

        if (!window.electronAPI?.luminodeFetchJson || !window.electronAPI?.luminodeWriteJson) {
            if (!silent) this.setLuminexEngineStatus(this.t('luminex.syncSourcesPutError', { detail: 'IPC' }));
            return;
        }
        const hostEl = document.getElementById('luminexHostInput');
        const pwEl = document.getElementById('luminexPasswordInput');
        const host = hostEl && String(hostEl.value || '').trim();
        if (!host) {
            if (!silent) this.setLuminexEngineStatus(this.t('luminex.discoverError', { msg: 'host' }));
            return;
        }
        const password = pwEl ? String(pwEl.value || '') : '';

        const cap = this._luminexCapabilities;
        if (!cap || !cap.ok) {
            this.setLuminexEngineStatus(this.t('luminex.syncNeedsCapabilities'));
            return;
        }
        const pbs = Array.isArray(cap.processblocks) ? cap.processblocks : [];
        if (!pbs.length || !this._luminexMatrix) {
            if (!silent) this.setLuminexEngineStatus(this.t('luminex.saveRouteRequiresEngine'));
            return;
        }

        let anyChanged = false;
        for (const pb of pbs) {
            const outcome = await this._syncLuminodePipelineSourcesForProcessblock(host, password, cap, pb.id);
            if (outcome === 'error') return;
            if (outcome === 'changed') anyChanged = true;
        }

        if (anyChanged) {
            try {
                await this.fetchLuminodeCapabilitiesUI();
            } catch (_) {
                await this.refreshLuminexMatrixPorts();
            }
        }
        if (!silent) {
            if (anyChanged) this.setLuminexEngineStatus(this.t('luminex.syncSourcesOk'));
            else this.setLuminexEngineStatus(this.t('luminex.syncSourcesNoChange'));
        }
    }

    async saveLuminexRoute(opts = {}) {
        const silent = opts && opts.silent === true;
        if (!this._luminexMatrix) {
            if (!silent) this.setLuminexRouteStatus(this.t('luminex.saveRouteRequiresEngine'));
            return;
        }
        const patchesRaw = this._luminexMatrix.getRoutePatches?.() || [];
        const cap = this._luminexCapabilities;
        const defaultPb =
            cap && cap.ok && Array.isArray(cap.processblocks) && cap.processblocks[0]
                ? String(cap.processblocks[0].id)
                : '0';
        const patchesByProcessblock = {};
        for (const p of patchesRaw) {
            if (p.sourceUniverse == null || !p.outputKey) continue;
            const pid = p.processblockId != null ? String(p.processblockId) : defaultPb;
            if (!patchesByProcessblock[pid]) patchesByProcessblock[pid] = [];
            patchesByProcessblock[pid].push({
                sourceUniverse: Number(p.sourceUniverse),
                outputKey: String(p.outputKey)
            });
        }
        const firstPid = Object.keys(patchesByProcessblock).sort()[0] || defaultPb;
        const firstPatches = patchesByProcessblock[firstPid] || [];
        const first = firstPatches[0];
        const processblockId = firstPid ? Number(firstPid) : null;
        const prev = await this.getLuminexConfigRaw();
        const prevRoute = prev.route && typeof prev.route === 'object' ? prev.route : {};
        const prevNl = prev.nodeLayout && typeof prev.nodeLayout === 'object' ? prev.nodeLayout : {};
        const { byProcessblock: _b, ...restNl } = prevNl;
        const flatLayout = this._luminexMatrix.getNodeLayout?.() || {};
        const nodeLayout = { ...restNl, ...flatLayout };
        const res = await window.electronAPI.saveConfig('luminex', {
            ...prev,
            nodeLayout,
            route: {
                ...prevRoute,
                patches: firstPatches,
                patchesByProcessblock,
                processblockId: processblockId != null && !Number.isNaN(processblockId) ? processblockId : null,
                sourceUniverse: first ? first.sourceUniverse : null,
                outputKey: first ? first.outputKey : null,
                updatedAt: Date.now()
            }
        });
        if (res && res.success === false) {
            this.setLuminexRouteStatus(this.t('luminex.discoverError', { msg: res.error || 'save' }));
            return;
        }
        this._luminexRoutePatchesByPb = { ...patchesByProcessblock };
        if (!silent) this.setLuminexRouteStatus(this.t('luminex.routeSaved'));
    }

    renderLuminexDeviceList(devices) {
        const ul = document.getElementById('luminexDeviceList');
        if (!ul) return;
        ul.innerHTML = '';
        (devices || []).forEach((d) => {
            const ip =
                d.ipv4 ||
                (Array.isArray(d.addresses) ? d.addresses.find((a) => a && typeof a === 'string' && !a.includes(':')) : null) ||
                (Array.isArray(d.addresses) ? d.addresses[0] : null);
            if (!ip) return;
            const li = document.createElement('li');
            li.className = 'luminex-device-item';
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-secondary btn-sm luminex-device-pick';
            b.setAttribute('data-ip', ip);
            const label = d.name || 'LumiNode';
            b.textContent = `${label} — ${ip}`;
            b.title = this.t('luminex.pickDevice');
            li.appendChild(b);
            ul.appendChild(li);
        });
    }

    async runLuminodeDiscovery() {
        if (!window.electronAPI?.discoverLuminodes) {
            this.setLuminexDiscoveryStatus(this.t('luminex.discoverUnavailable'));
            return;
        }
        if (this._luminexDiscoveryRunning) return;
        this._luminexDiscoveryRunning = true;
        const btn = document.getElementById('luminexDiscoverBtn');
        if (btn) btn.disabled = true;
        this.setLuminexDiscoveryStatus(this.t('luminex.discovering'));
        try {
            const res = await window.electronAPI.discoverLuminodes();
            if (!res || !res.ok) {
                this.setLuminexDiscoveryStatus(this.t('luminex.discoverError', { msg: (res && res.error) || '?' }));
                this.renderLuminexDeviceList([]);
                return;
            }
            const devs = res.devices || [];
            this.renderLuminexDeviceList(devs);
            if (devs.length === 0) {
                this.setLuminexDiscoveryStatus(this.t('luminex.discoverEmpty'));
            } else {
                this.setLuminexDiscoveryStatus(this.t('luminex.discoverDone', { n: devs.length }));
            }
        } catch (e) {
            this.setLuminexDiscoveryStatus(this.t('luminex.discoverError', { msg: e.message || String(e) }));
        } finally {
            this._luminexDiscoveryRunning = false;
            if (btn) btn.disabled = false;
        }
    }

    async showLuminexView() {
        if (this.currentView === 'luminex') {
            await this.showHomeView(false);
            return;
        }
        this.pushHistorySnapshotIfNeeded('luminex');
        this.previousView = this.currentView;
        this.currentView = 'luminex';
        this.hideVoorstellingTimerShell();
        this.hideOscMonitorShell();

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const luminexWrapper = document.getElementById('luminexViewWrapper');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'none';
        if (homeContainer) homeContainer.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = 'none';
        if (luminexWrapper) luminexWrapper.style.display = 'block';
        if (homeStatus) homeStatus.style.display = 'none';

        document.getElementById('weekBtn')?.classList.remove('active');
        document.getElementById('homeBtn')?.classList.remove('active');
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');
        document.getElementById('luminexNavBtn')?.classList.add('active');

        document.body.classList.remove('home-view-active');
        document.body.classList.remove('week-view-active');
        document.body.classList.remove('voorstelling-timer-active');
        document.body.classList.add('luminex-view-active');

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = 'none';

        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) {
            dateSelector.style.display = 'flex';
            dateSelector.style.visibility = 'visible';
        }
        if (venueSelector) {
            venueSelector.style.display = 'block';
            venueSelector.style.visibility = 'visible';
        }

        this.ensureLuminexMatrix();
        this.refreshLuminexChrome();
        await this.loadLuminexConfigIntoUI();
        await this.fetchLuminodeCapabilitiesUI();
        void this.runLuminodeDiscovery();
        await this.runSacnDiscovery();
        this.updateBackButtonVisibility();
    }

    async showOscMonitorView() {
        if (!this.isShowModeEnabled()) return;
        if (this.currentView === 'oscMonitor') {
            await this.showHomeView(false);
            return;
        }
        this.pushHistorySnapshotIfNeeded('oscMonitor');
        this.previousView = this.currentView;
        this.currentView = 'oscMonitor';
        this.hideVoorstellingTimerShell();
        this.hideLuminexShell();

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const timerWrapper = document.getElementById('voorstellingTimerWrapper');
        const luminexWrapper = document.getElementById('luminexViewWrapper');
        const oscWrapper = document.getElementById('oscMonitorWrapper');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'none';
        if (homeContainer) homeContainer.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = 'none';
        if (timerWrapper) timerWrapper.style.display = 'none';
        if (luminexWrapper) luminexWrapper.style.display = 'none';
        if (oscWrapper) oscWrapper.style.display = 'block';
        if (homeStatus) homeStatus.style.display = 'none';

        document.getElementById('weekBtn')?.classList.remove('active');
        document.getElementById('homeBtn')?.classList.remove('active');
        document.getElementById('voorstellingTimerBtn')?.classList.remove('active');
        document.getElementById('luminexNavBtn')?.classList.remove('active');
        document.getElementById('oscMonitorNavBtn')?.classList.add('active');

        document.body.classList.remove('home-view-active');
        document.body.classList.remove('week-view-active');
        document.body.classList.remove('voorstelling-timer-active');
        document.body.classList.remove('luminex-view-active');
        document.body.classList.add('osc-monitor-active');

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = 'none';

        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) {
            dateSelector.style.display = 'flex';
            dateSelector.style.visibility = 'visible';
        }
        if (venueSelector) {
            venueSelector.style.display = 'block';
            venueSelector.style.visibility = 'visible';
        }

        this.renderOscMonitorEntries();
        this.updateBackButtonVisibility();
    }

    stopVoorstellingTimerClockLoop() {
        if (this._voorstellingTimerClockInterval) {
            clearInterval(this._voorstellingTimerClockInterval);
            this._voorstellingTimerClockInterval = null;
        }
    }

    createEmptyVoorstellingSlotState() {
        return {
            running: false,
            accumulatedMs: 0,
            runStartedAt: null,
            marks: {},
            markElapsedMs: {},
            remarks: [],
            pauseDurationMinutes: 20,
            pauseCountdownEndAt: null,
            customStepOrder: null,
            customLabels: {}
        };
    }

    ensureVoorstellingSlotState(slotId) {
        if (!this.voorstellingTimerBySlot[slotId]) {
            this.voorstellingTimerBySlot[slotId] = this.createEmptyVoorstellingSlotState();
        } else {
            const st = this.voorstellingTimerBySlot[slotId];
            if (st.pauseDurationMinutes == null || Number.isNaN(Number(st.pauseDurationMinutes))) st.pauseDurationMinutes = 20;
            if (st.pauseCountdownEndAt === undefined) st.pauseCountdownEndAt = null;
            if (!st.markElapsedMs) st.markElapsedMs = {};
            if (!Array.isArray(st.remarks)) st.remarks = [];
            if (st.customLabels === undefined) st.customLabels = {};
            if (st.customStepOrder === undefined) st.customStepOrder = null;
        }
        return this.voorstellingTimerBySlot[slotId];
    }

    pruneVoorstellingSlotState(activeSlotIds) {
        const keep = new Set(activeSlotIds);
        Object.keys(this.voorstellingTimerBySlot).forEach((k) => {
            if (!keep.has(k)) delete this.voorstellingTimerBySlot[k];
        });
    }

    /**
     * Unieke sleutel voor opgeslagen timer-marks: lokale datum + zaal + gesorteerde Yesplan-event-ids uit het tijdschema.
     */
    getVoorstellingTimerStorageKey() {
        const d = this.selectedDate instanceof Date ? new Date(this.selectedDate) : new Date();
        d.setHours(0, 0, 0, 0);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const venue =
            Array.isArray(this.selectedVenues) && this.selectedVenues.length
                ? String(this.selectedVenues[0])
                : '';
        const evIds = (this.tijdschemaScheduleData || [])
            .map((x) => x && x.eventId)
            .filter((id) => id != null && id !== '')
            .map(String)
            .sort();
        const evKey = evIds.length ? evIds.join(',') : 'no-event';
        return `${dateStr}|${venue}|${evKey}`;
    }

    pruneVoorstellingTimerSnapshotKeys(snapshots) {
        const maxAgeMs = 120 * 86400000;
        const cutoff = Date.now() - maxAgeMs;
        const out = { ...snapshots };
        for (const k of Object.keys(out)) {
            const datePart = k.split('|')[0];
            const t = Date.parse(`${datePart}T12:00:00`);
            if (Number.isFinite(t) && t < cutoff) delete out[k];
        }
        const keys = Object.keys(out);
        const maxKeys = 200;
        if (keys.length <= maxKeys) return out;
        const scored = keys.map((k) => ({
            k,
            u: Date.parse(out[k]?.updatedAt || '') || 0
        }));
        scored.sort((a, b) => b.u - a.u);
        const drop = scored.slice(maxKeys);
        for (const { k } of drop) delete out[k];
        return out;
    }

    async mergeVoorstellingTimerSnapshotFromStorage(sessions) {
        /** Eerst alles leeg: anders blijven marks van gisteren/andere dag staan als er geen snapshot is. */
        for (const { slotId } of sessions) {
            this.voorstellingTimerBySlot[slotId] = this.createEmptyVoorstellingSlotState();
        }

        const recalcAll = () => {
            for (const { slotId } of sessions) {
                this.recalculateVoorstellingTimerFromMarks(slotId);
            }
        };

        if (!window.electronAPI?.getConfig) {
            recalcAll();
            return;
        }
        try {
            const key = this.getVoorstellingTimerStorageKey();
            if (!key) {
                recalcAll();
                return;
            }
            const raw = await window.electronAPI.getConfig('voorstellingTimer');
            const snap = raw?.snapshots?.[key];
            if (!snap?.slots) {
                recalcAll();
                return;
            }
            for (const { slotId, scheduleData: sessSched } of sessions) {
                const saved = snap.slots[slotId];
                if (!saved || typeof saved !== 'object') {
                    this.recalculateVoorstellingTimerFromMarks(slotId);
                    continue;
                }
                const pauseCount = this.countPauzesInSchedule(sessSched);
                const st = this.ensureVoorstellingSlotState(slotId);
                if (Array.isArray(saved.customStepOrder) && saved.customStepOrder.length) {
                    st.customStepOrder = saved.customStepOrder.filter(
                        (id) => typeof id === 'string' && id.length > 0
                    );
                }
                if (saved.customLabels && typeof saved.customLabels === 'object') {
                    st.customLabels = { ...saved.customLabels };
                }
                if (Array.isArray(saved.remarks)) {
                    st.remarks = saved.remarks
                        .filter((r) => r && typeof r === 'object')
                        .map((r) => ({
                            id: typeof r.id === 'string' && r.id ? r.id : `remark_${Math.random().toString(36).slice(2, 10)}`,
                            stepId: typeof r.stepId === 'string' ? r.stepId : '',
                            wallIso: typeof r.wallIso === 'string' ? r.wallIso : '',
                            text: String(r.text || '').trim()
                        }))
                        .filter((r) => r.stepId && r.wallIso && r.text);
                }
                if (!saved.marks || typeof saved.marks !== 'object') {
                    this.recalculateVoorstellingTimerFromMarks(slotId);
                    continue;
                }
                const validSteps = new Set(this.getVoorstellingTimerStepsForSlot(slotId, pauseCount));
                for (const [stepId, iso] of Object.entries(saved.marks)) {
                    if (!validSteps.has(stepId) || typeof iso !== 'string') continue;
                    st.marks[stepId] = iso;
                }
                this.recalculateVoorstellingTimerFromMarks(slotId);
            }
        } catch (e) {
            console.warn('Voorstelling timer snapshot laden mislukt:', e);
            for (const { slotId } of sessions) {
                this.voorstellingTimerBySlot[slotId] = this.createEmptyVoorstellingSlotState();
                this.recalculateVoorstellingTimerFromMarks(slotId);
            }
        }
    }

    schedulePersistVoorstellingTimerSnapshot() {
        if (this._voorstellingTimerPersistTimer) clearTimeout(this._voorstellingTimerPersistTimer);
        this._voorstellingTimerPersistTimer = setTimeout(() => {
            this._voorstellingTimerPersistTimer = null;
            void this.persistVoorstellingTimerSnapshotNow();
        }, 450);
    }

    async persistVoorstellingTimerSnapshotNow() {
        if (!window.electronAPI?.getConfig || !window.electronAPI?.saveConfig) return;
        if (!this.tijdschemaScheduleData?.length) return;
        const key = this.getVoorstellingTimerStorageKey();
        const sessions = this.buildTimerDaySessions(this.tijdschemaScheduleData);
        const slots = {};
        let any = false;
        for (const { slotId } of sessions) {
            const st = this.voorstellingTimerBySlot[slotId];
            const marks = st?.marks;
            const hasMarks = marks && Object.keys(marks).length > 0;
            const remarks = Array.isArray(st?.remarks) ? st.remarks : [];
            const hasRemarks = remarks.length > 0;
            const hasLayout =
                (Array.isArray(st?.customStepOrder) && st.customStepOrder.length > 0) ||
                (st?.customLabels && Object.keys(st.customLabels).length > 0);
            if (!hasMarks && !hasLayout && !hasRemarks) continue;
            const payload = { marks: hasMarks ? { ...marks } : {} };
            if (Array.isArray(st.customStepOrder) && st.customStepOrder.length) {
                payload.customStepOrder = [...st.customStepOrder];
            }
            if (st.customLabels && Object.keys(st.customLabels).length) {
                payload.customLabels = { ...st.customLabels };
            }
            if (hasRemarks) {
                payload.remarks = remarks
                    .map((r) => ({
                        id: String(r?.id || ''),
                        stepId: String(r?.stepId || ''),
                        wallIso: String(r?.wallIso || ''),
                        text: String(r?.text || '').trim()
                    }))
                    .filter((r) => r.id && r.stepId && r.wallIso && r.text);
            }
            slots[slotId] = payload;
            any = true;
        }
        try {
            const prev = await window.electronAPI.getConfig('voorstellingTimer');
            const base = { ...(prev?.snapshots || {}) };
            if (!any) {
                delete base[key];
            } else {
                base[key] = { slots, updatedAt: new Date().toISOString() };
            }
            const snapshots = this.pruneVoorstellingTimerSnapshotKeys(base);
            await window.electronAPI.saveConfig('voorstellingTimer', { snapshots });
        } catch (e) {
            console.warn('Voorstelling timer snapshot opslaan mislukt:', e);
        }
    }

    startVoorstellingTimerClockLoop() {
        this.stopVoorstellingTimerClockLoop();
        const tick = () => {
            const wallEl = document.getElementById('voorstellingWallClock');
            if (wallEl) {
                const now = this.getNowDate();
                const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
                wallEl.textContent = now.toLocaleTimeString(locale, this.wallClockTimeFormatOptions());
            }
            this.updateVoorstellingTimezoneDisplay();
            (this._timerSessions || []).forEach(({ slotId }) => {
                const swEl = document.querySelector(`[data-slot-stopwatch="${slotId}"]`);
                if (swEl) {
                    swEl.textContent = this.formatStopwatchMs(this.getVoorstellingStopwatchMs(slotId));
                }
            });
            this.updateVoorstellingAuxiliaryClock();
        };
        tick();
        this._voorstellingTimerClockInterval = setInterval(tick, 250);
    }

    /** Kloktijd waarop de pauze voorbij is (lokale tijd). */
    formatPauseEndWallClock(endAtMs) {
        return new Date(endAtMs).toLocaleTimeString(this.locale === 'en' ? 'en-GB' : 'nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: this.getEffectiveTimeZone()
        });
    }

    /** Resterende pauze als mm:ss (of h:mm:ss bij >1 uur) — o.a. boven naast de klok. */
    formatPauseCountdownRemaining(endAtMs) {
        const sec = Math.max(0, Math.ceil((endAtMs - Date.now()) / 1000));
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    /** Na afloop geplande pauze: optellen vanaf het moment dat de timer op 0 stond (tot aanvang volgende acte). */
    formatPauseOvertimeSincePlannedEnd(endAtMs) {
        const sec = Math.max(0, Math.floor((Date.now() - endAtMs) / 1000));
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const core =
            h > 0
                ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
                : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `+${core}`;
    }

    /** Weergave in het linker pauzeblok vóór start van de aftelling: totale pauzelengte als mm:ss (uit Yesplan-duur). */
    formatPauseDurationIdleDisplay(minutes) {
        const m = Math.max(1, Math.min(240, Number(minutes) || 20));
        const totalSec = m * 60;
        const h = Math.floor(totalSec / 3600);
        const mm = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}:${String(mm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(mm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    getSystemTimeZone() {
        try {
            return String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').trim();
        } catch (_) {
            return 'UTC';
        }
    }

    getAvailableTimeZones() {
        try {
            if (typeof Intl.supportedValuesOf === 'function') {
                const list = Intl.supportedValuesOf('timeZone');
                if (Array.isArray(list) && list.length) return list;
            }
        } catch (_) {
            /* ignore */
        }
        return ['UTC', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/London', 'America/New_York'];
    }

    async resolveAutoTimeZoneByInternet() {
        if (!navigator.onLine) return this.getSystemTimeZone();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1800);
            const res = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store', signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) return this.getSystemTimeZone();
            const data = await res.json();
            const tz = String(data?.timezone || '').trim();
            if (!tz) return this.getSystemTimeZone();
            if (this.getAvailableTimeZones().includes(tz)) return tz;
            return this.getSystemTimeZone();
        } catch (_) {
            return this.getSystemTimeZone();
        }
    }

    async refreshEffectiveTimeZone() {
        const appCfg = this.config?.app || {};
        const mode = appCfg.timezoneMode === 'manual' ? 'manual' : 'auto';
        const manualTz = String(appCfg.manualTimeZone || '').trim();
        if (mode === 'manual' && manualTz) {
            this._effectiveTimeZone = manualTz;
            return this._effectiveTimeZone;
        }
        this._effectiveTimeZone = await this.resolveAutoTimeZoneByInternet();
        return this._effectiveTimeZone;
    }

    getEffectiveTimeZone() {
        if (this._effectiveTimeZone && String(this._effectiveTimeZone).trim()) return this._effectiveTimeZone;
        return this.getSystemTimeZone();
    }

    getManualClockOffsetMs() {
        const sec = Number(this.config?.app?.manualClockOffsetSeconds || 0);
        return Number.isFinite(sec) ? sec * 1000 : 0;
    }

    getNowDate() {
        const mode = this.config?.app?.timezoneMode === 'manual' ? 'manual' : 'auto';
        if (mode !== 'manual') return new Date();
        return new Date(Date.now() + this.getManualClockOffsetMs());
    }

    refreshManualTimeInputFromSelectedTimezone() {
        const input = document.getElementById('manualTimeInput');
        const tzSelect = document.getElementById('timezoneManualSelect');
        if (!input) return;
        const tz = String(tzSelect?.value || this.getEffectiveTimeZone() || this.getSystemTimeZone());
        input.value = this.formatTimeForInputFromDate(new Date(), tz);
        input.dataset.userEdited = '0';
    }

    formatTimeForInputFromDate(date, timeZone) {
        const locale = 'en-GB';
        const parts = new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23',
            timeZone
        }).formatToParts(date);
        const get = (type) => (parts.find((p) => p.type === type)?.value || '00').padStart(2, '0');
        return `${get('hour')}:${get('minute')}:${get('second')}`;
    }

    computeManualClockOffsetSeconds(targetClock, timeZone) {
        const m = String(targetClock || '').trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (!m) return 0;
        const targetSeconds = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0);
        const now = new Date();
        const nowParts = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23',
            timeZone
        }).formatToParts(now);
        const get = (type) => Number(nowParts.find((p) => p.type === type)?.value || 0);
        const currentSeconds = get('hour') * 3600 + get('minute') * 60 + get('second');
        let diff = targetSeconds - currentSeconds;
        if (diff > 12 * 3600) diff -= 24 * 3600;
        if (diff < -12 * 3600) diff += 24 * 3600;
        return diff;
    }

    updateTimezoneManualVisibility() {
        const modeEl = document.getElementById('timezoneModeSelect');
        const manualGroup = document.getElementById('timezoneManualGroup');
        const manualTimeGroup = document.getElementById('manualTimeGroup');
        if (!modeEl || !manualGroup) return;
        const showManual = modeEl.value === 'manual';
        const tzSel = document.getElementById('timezoneManualSelect');
        const timeInp = document.getElementById('manualTimeInput');
        const dim = showManual ? '1' : '0.55';
        const pe = showManual ? '' : 'none';
        manualGroup.style.opacity = dim;
        manualGroup.style.pointerEvents = pe;
        if (manualTimeGroup) {
            manualTimeGroup.style.opacity = dim;
            manualTimeGroup.style.pointerEvents = pe;
        }
        if (tzSel) tzSel.disabled = !showManual;
        if (timeInp) timeInp.disabled = !showManual;
    }

    handleTimezoneModeChanged() {
        const modeEl = document.getElementById('timezoneModeSelect');
        const tzSel = document.getElementById('timezoneManualSelect');
        const timeInp = document.getElementById('manualTimeInput');
        if (!modeEl) return;
        if (modeEl.value !== 'manual') {
            if (tzSel) tzSel.value = this.getSystemTimeZone();
            this.refreshManualTimeInputFromSelectedTimezone();
            if (timeInp) timeInp.dataset.userEdited = '0';
        } else if (timeInp && !timeInp.value) {
            this.refreshManualTimeInputFromSelectedTimezone();
        }
        this.updateTimezoneManualVisibility();
    }

    /** IANA-zone en afkorting (bijv. Europe/Amsterdam - CET). */
    formatLocalTimezoneDisplay() {
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const iana = this.getEffectiveTimeZone();
        if (!iana) return '—';
        const pretty = iana.replace(/_/g, ' ');
        try {
            const parts = new Intl.DateTimeFormat(locale, { timeZone: iana, timeZoneName: 'short' }).formatToParts(
                new Date()
            );
            let abbr = parts.find((p) => p.type === 'timeZoneName')?.value?.trim() || '';
            if (abbr) {
                abbr = abbr.toUpperCase();
                return `${pretty} - ${abbr}`;
            }
        } catch (e) {
            /* ignore */
        }
        return pretty;
    }

    updateVoorstellingTimezoneDisplay() {
        const el = document.getElementById('voorstellingTimezoneDisplay');
        if (!el) return;
        el.textContent = this.formatLocalTimezoneDisplay();
    }

    commitPauseDurationInput(inp) {
        const sid = inp?.getAttribute?.('data-slot-pause-duration');
        if (!sid) return;
        let v = parseInt(String(inp.value).replace(/\D/g, ''), 10);
        if (Number.isNaN(v)) v = 20;
        v = Math.max(1, Math.min(240, v));
        inp.value = String(v);
        const st = this.ensureVoorstellingSlotState(sid);
        st.pauseDurationMinutes = v;
        if (st.pauseCountdownEndAt && Date.now() < st.pauseCountdownEndAt) {
            st.pauseCountdownEndAt = Date.now() + v * 60 * 1000;
        }
        this.updateVoorstellingAuxiliaryClock();
    }

    /**
     * Tweede klok naast de muurklok: modus afhankelijk van fase (aftellen tot 1e acte, pauze, acttimer, totale speelduur).
     * Primaire sessie = laatste kolom in de timer (meestal avond).
     */
    updateVoorstellingAuxiliaryClock() {
        const topWrap = document.getElementById('voorstellingPauseCountdownTopWrap');
        const topEl = document.getElementById('voorstellingPauseCountdownTop');
        const labelEl = document.getElementById('voorstellingAuxClockLabel');
        if (!topWrap || !topEl) return;

        const sessions = this._timerSessions || [];
        if (!sessions.length) {
            topWrap.style.display = 'none';
            topWrap.setAttribute('hidden', '');
            topEl.classList.remove('voorstelling-pause-countdown--overtime');
            return;
        }

        const avondSession = sessions.find((s) => s.slotId === 'avond');
        const primarySlotId = (avondSession || sessions[sessions.length - 1]).slotId;
        const state = this.getVoorstellingAuxiliaryClockState(primarySlotId);

        topWrap.style.display = '';
        topWrap.removeAttribute('hidden');

        const setLabel = (key, params) => {
            if (labelEl) {
                labelEl.textContent = params ? this.t(`voorstellingTimer.${key}`, params) : this.t(`voorstellingTimer.${key}`);
            }
        };

        if (state.kind === 'empty') {
            topEl.textContent = '—';
            setLabel('auxClockNoAnchor');
            topEl.classList.remove('voorstelling-pause-countdown--overtime');
            return;
        }

        if (state.kind === 'pause') {
            setLabel('auxClockPauseRemaining');
            if (!state.overtime) {
                topEl.textContent = this.formatPauseCountdownRemaining(state.endAt);
                topEl.classList.remove('voorstelling-pause-countdown--overtime');
            } else {
                topEl.textContent = this.formatPauseOvertimeSincePlannedEnd(state.endAt);
                topEl.classList.add('voorstelling-pause-countdown--overtime');
            }
            return;
        }

        if (state.kind === 'preAct1') {
            setLabel('auxClockUntilFirstAct');
            const target = state.targetMs;
            const now = Date.now();
            if (now < target) {
                topEl.textContent = this.formatPauseCountdownRemaining(target);
                topEl.classList.remove('voorstelling-pause-countdown--overtime');
            } else {
                topEl.textContent = this.formatPauseOvertimeSincePlannedEnd(target);
                topEl.classList.add('voorstelling-pause-countdown--overtime');
            }
            return;
        }

        if (state.kind === 'totalFrozen') {
            setLabel('auxClockTotalFinal');
            topEl.textContent = this.formatStopwatchMs(state.ms);
            topEl.classList.remove('voorstelling-pause-countdown--overtime');
            return;
        }

        if (state.kind === 'totalRunning') {
            setLabel('auxClockTotalRunning');
            topEl.textContent = this.formatStopwatchMs(state.ms);
            topEl.classList.remove('voorstelling-pause-countdown--overtime');
            return;
        }

        if (state.kind === 'act') {
            const ord = this.getActOrdinalLabel(state.actNum);
            setLabel('auxClockActTimer', { act: ord });
            topEl.textContent = this.formatStopwatchMs(state.ms);
            topEl.classList.remove('voorstelling-pause-countdown--overtime');
            return;
        }

        setLabel('auxClockNoAnchor');
        topEl.textContent = '—';
        topEl.classList.remove('voorstelling-pause-countdown--overtime');
    }

    getVoorstellingStopwatchMs(slotId) {
        const s = this.ensureVoorstellingSlotState(slotId);
        if (!s.running) return s.accumulatedMs || 0;
        return (s.accumulatedMs || 0) + (Date.now() - (s.runStartedAt || Date.now()));
    }

    formatStopwatchMs(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const sec = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    voorstellingStopwatchStart(slotId) {
        const s = this.ensureVoorstellingSlotState(slotId);
        if (s.running) return;
        s.running = true;
        s.runStartedAt = Date.now();
    }

    voorstellingStopwatchPause(slotId) {
        const s = this.ensureVoorstellingSlotState(slotId);
        if (!s.running) return;
        s.accumulatedMs = (s.accumulatedMs || 0) + (Date.now() - (s.runStartedAt || Date.now()));
        s.running = false;
        s.runStartedAt = null;
    }

    /** Stopwatch op 0 en opnieuw laten lopen (bij vervangen van “Deuren open”). */
    voorstellingStopwatchResetAndStart(slotId) {
        const s = this.ensureVoorstellingSlotState(slotId);
        s.accumulatedMs = 0;
        s.running = true;
        s.runStartedAt = Date.now();
    }

    voorstellingTimerApplyStepSideEffects(stepId, slotId) {
        if (stepId === 'deuren_open') {
            this.voorstellingStopwatchStart(slotId);
        } else if (stepId === 'vijf_voor_tweede_deel') {
            this.voorstellingStopwatchStart(slotId);
        } else if (stepId === 'einde') {
            this.voorstellingStopwatchPause(slotId);
        }
    }

    getSessionScheduleDataForSlot(slotId) {
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        if (sess?.scheduleData?.length) return sess.scheduleData;
        const data = this.tijdschemaScheduleData;
        if (!data?.length) return null;
        const built = this.buildTimerDaySessions(data);
        const m = built.find((s) => s.slotId === slotId);
        return m?.scheduleData?.length ? m.scheduleData : null;
    }

    /** Middel van de geselecteerde kalenderdag → epoch-ms voor een gegeven tijd (lokaal). */
    scheduleDayWallClockMsFromMinutes(minutesSinceMidnight) {
        const n = Number(minutesSinceMidnight);
        if (!Number.isFinite(n)) return null;
        const raw = this.selectedDate instanceof Date ? this.selectedDate : new Date();
        const d = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate(), 0, 0, 0, 0);
        d.setHours(Math.floor(n / 60), n % 60, 0, 0);
        return d.getTime();
    }

    /** Vroegste Yesplan-classificatietijd over alle blokken (≈ geplande start van de voorstelling / 1e acte). */
    getScheduleEarliestClassificationMinutes(scheduleData) {
        let best = null;
        for (const block of scheduleData || []) {
            const m = this.getTijdschemaBlockClassificationMinutes(block);
            if (m != null && (best == null || m < best)) best = m;
        }
        return best;
    }

    /** Laatst gemarkeerde aanvang-stap (act 1 / 2 / 3 / …). */
    getLatestMarkedActStartStepId(steps, marks) {
        if (!marks || !steps?.length) return null;
        let chosen = null;
        for (const id of steps) {
            if (id === 'aanvang' || id === 'aanvang_tweede_deel' || /^aanvang_act_\d+$/.test(id)) {
                if (marks[id]) chosen = id;
            }
        }
        return chosen;
    }

    /** Actenummer bij een aanvang-stap-id (1-based). */
    getActNumberFromTimerStepId(stepId) {
        if (stepId === 'aanvang') return 1;
        if (stepId === 'aanvang_tweede_deel') return 2;
        const m = typeof stepId === 'string' ? stepId.match(/^aanvang_act_(\d+)$/) : null;
        return m ? parseInt(m[1], 10) : 1;
    }

    /**
     * Na de laatste acte: vanaf “5 min einde” (of einde is de eerstvolgende stap) tonen we de totale speelduur t.o.v. 1e aanvang.
     */
    isScheduleFinalePhase(steps, marks, nextIdx) {
        if (!steps?.length || !marks) return false;
        const ei = steps.indexOf('einde');
        if (marks.vijf_voor_einde) return true;
        if (ei >= 0 && nextIdx === ei) {
            const actIds = steps.filter(
                (id) => id === 'aanvang' || id === 'aanvang_tweede_deel' || /^aanvang_act_\d+$/.test(id)
            );
            const lastActId = actIds[actIds.length - 1];
            if (lastActId && marks[lastActId] && !marks.einde) return true;
        }
        return false;
    }

    getVoorstellingAuxiliaryClockState(slotId) {
        const sched = this.getSessionScheduleDataForSlot(slotId);
        const now = Date.now();
        if (!sched?.length) return { kind: 'empty' };
        const pauseCount = this.countPauzesInSchedule(sched);
        const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount);
        const st = this.ensureVoorstellingSlotState(slotId);
        const marks = st.marks || {};

        let nextIdx = -1;
        for (let i = 0; i < steps.length; i++) {
            if (!marks[steps[i]]) {
                nextIdx = i;
                break;
            }
        }

        const endAt = st.pauseCountdownEndAt;
        const inPause = endAt != null && Number.isFinite(endAt);
        if (inPause) {
            return { kind: 'pause', endAt, overtime: now >= endAt };
        }

        if (!marks.aanvang) {
            const firstMin = this.getScheduleEarliestClassificationMinutes(sched);
            const targetMs = firstMin != null ? this.scheduleDayWallClockMsFromMinutes(firstMin) : null;
            if (targetMs != null) {
                return { kind: 'preAct1', targetMs };
            }
            return { kind: 'noAnchor' };
        }

        if (marks.einde) {
            const t0 = Date.parse(marks.aanvang);
            const t1 = Date.parse(marks.einde);
            if (Number.isFinite(t0) && Number.isFinite(t1)) {
                return { kind: 'totalFrozen', ms: Math.max(0, t1 - t0) };
            }
            return { kind: 'noAnchor' };
        }

        const actStartId = this.getLatestMarkedActStartStepId(steps, marks);
        if (actStartId && marks[actStartId]) {
            const t = Date.parse(marks[actStartId]);
            if (Number.isFinite(t)) {
                return {
                    kind: 'act',
                    ms: Math.max(0, now - t),
                    actNum: this.getActNumberFromTimerStepId(actStartId)
                };
            }
        }

        if (this.isScheduleFinalePhase(steps, marks, nextIdx) && marks.aanvang) {
            const t0 = Date.parse(marks.aanvang);
            if (Number.isFinite(t0)) {
                return { kind: 'totalRunning', ms: Math.max(0, now - t0) };
            }
        }

        return { kind: 'noAnchor' };
    }

    /** Zelfde opties als muurklok — voorkomt afwijking t.o.v. getoonde timestamps. */
    wallClockTimeFormatOptions() {
        return {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23',
            timeZone: this.getEffectiveTimeZone()
        };
    }

    canApplyVoorstellingStep(stepId, slotId) {
        if (!this.isShowModeEnabled()) return false;
        const sched = this.getSessionScheduleDataForSlot(slotId);
        if (!sched?.length) return false;
        const pauseCount = this.countPauzesInSchedule(sched);
        const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount);
        if (!steps.includes(stepId)) return false;
        const idx = steps.indexOf(stepId);
        const marks = this.ensureVoorstellingSlotState(slotId).marks || {};
        if (marks[stepId]) return true;
        return this.isVoorstellingStepReachable(idx, steps, marks);
    }

    recalculateVoorstellingTimerFromMarks(slotId) {
        const st = this.ensureVoorstellingSlotState(slotId);
        const sched = this.getSessionScheduleDataForSlot(slotId);
        if (!sched?.length) return;
        const pauseCount = this.countPauzesInSchedule(sched);
        const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount);
        let running = false;
        let runStartedAt = null;
        let accumulated = 0;
        let previousMarkedAt = null;
        const recalculatedElapsedByStep = {};

        steps.forEach((id) => {
            const iso = st.marks?.[id];
            if (!iso) return;
            const atMs = Date.parse(iso);
            if (!Number.isFinite(atMs)) return;

            const elapsedSincePrevious =
                previousMarkedAt == null ? 0 : Math.max(0, atMs - previousMarkedAt);
            recalculatedElapsedByStep[id] = elapsedSincePrevious;
            previousMarkedAt = atMs;

            // Stopwatch start opnieuw na elke stap; bij "einde" stopt hij.
            if (id === 'einde') {
                running = false;
                runStartedAt = null;
                accumulated = 0;
            } else {
                running = true;
                runStartedAt = atMs;
                accumulated = 0;
            }
        });

        /* Lopend segment: verstreken tijd = Date.now() - runStartedAt (zie getVoorstellingStopwatchMs).
         * accumulatedMs hier niet vullen met diezelfde duur — anders dubbelt de weergave. */
        if (running && runStartedAt != null) {
            accumulated = 0;
        }
        st.accumulatedMs = Math.max(0, accumulated);
        st.running = running;
        st.runStartedAt = running ? runStartedAt : null;
        st.markElapsedMs = recalculatedElapsedByStep;

        const mins = Math.max(1, Math.min(240, Number(st.pauseDurationMinutes) || 20));
        st.pauseDurationMinutes = mins;
        st.pauseCountdownEndAt = null;
        let activePauseStartMs = null;
        for (let p = 1; p <= pauseCount; p++) {
            const pauseId = p === 1 ? 'pauze' : `pauze_${p}`;
            const resumeAct = p + 1;
            const resumeId = resumeAct === 2 ? 'aanvang_tweede_deel' : `aanvang_act_${resumeAct}`;
            const pauseMs = Date.parse(st.marks?.[pauseId] || '');
            if (!Number.isFinite(pauseMs)) continue;
            if (st.marks?.[resumeId] || st.marks?.einde) continue;
            if (activePauseStartMs == null || pauseMs > activePauseStartMs) activePauseStartMs = pauseMs;
        }
        if (activePauseStartMs != null) {
            st.pauseCountdownEndAt = activePauseStartMs + mins * 60 * 1000;
        }
    }

    applyVoorstellingTimerMark(stepId, { replace = false, slotId, wallIso = null } = {}) {
        if (this._voorstellingTimerEditingSlotId) return;
        if (!slotId || !this.canApplyVoorstellingStep(stepId, slotId)) return;
        const st = this.ensureVoorstellingSlotState(slotId);
        st.marks[stepId] = wallIso && typeof wallIso === 'string' ? wallIso : new Date().toISOString();
        this.recalculateVoorstellingTimerFromMarks(slotId);

        void this.renderVoorstellingTimerUI({ skipStorageMerge: true })
            .then(() => this.schedulePersistVoorstellingTimerSnapshot())
            .catch(() => {});
    }

    /** Waarde voor time-input (lokale tijd, inclusief seconden). */
    toDatetimeLocalValue(d) {
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    openVoorstellingTimerReplaceModal(stepId, slotId, pressedIso) {
        return new Promise((resolve) => {
            const sched = this.getSessionScheduleDataForSlot(slotId);
            const pauseCount = sched?.length ? this.countPauzesInSchedule(sched) : 0;
            const stepLabel = this.getVoorstellingTimerStepLabel(stepId, pauseCount, slotId);
            const slotLabel = this.getTimerSlotLabel(slotId);
            const st = this.ensureVoorstellingSlotState(slotId);
            const prevIso = st.marks?.[stepId];
            const prevClock = prevIso ? this.formatVoorstellingMarkTime(prevIso) : '—';
            const prevMs = typeof st.markElapsedMs?.[stepId] === 'number' ? st.markElapsedMs[stepId] : null;
            const prevElapsed = prevMs != null ? this.formatStopwatchMs(prevMs) : '—';
            const prevLine = this.escapeHtml(
                this.t('voorstellingTimer.replacePreviousRegistration', { clock: prevClock, elapsed: prevElapsed })
            );

            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'voorstellingTimerReplaceHeading');
            const title = this.escapeHtml(this.t('voorstellingTimer.replaceTitle'));
            const body = this.escapeHtml(this.t('voorstellingTimer.replaceBody', { step: stepLabel, slot: slotLabel }));
            const cancelTxt = this.escapeHtml(this.t('voorstellingTimer.replaceCancel'));
            const confirmTxt = this.escapeHtml(this.t('voorstellingTimer.replaceConfirm'));
            const resetTxt = this.escapeHtml(this.t('voorstellingTimer.replaceReset'));
            const addRemarkTxt = this.escapeHtml(this.t('voorstellingTimer.replaceAddRemark'));
            const lblClock = this.escapeHtml(this.t('voorstellingTimer.replaceCorrectClockLabel'));
            const hintClock = this.escapeHtml(this.t('voorstellingTimer.replaceCorrectClockHint'));
            const lblRemark = this.escapeHtml(this.t('voorstellingTimer.replaceRemarkLabel'));
            const remarkPlaceholder = this.escapeHtml(this.t('voorstellingTimer.replaceRemarkPlaceholder'));
            const now = new Date();
            const clockDefault = this.toDatetimeLocalValue(now);

            modal.innerHTML = `
                <div class="modal-content voorstelling-timer-replace-modal" style="max-width: 480px;">
                    <div class="modal-header">
                        <h2 id="voorstellingTimerReplaceHeading">${title}</h2>
                        <button type="button" class="modal-close" data-vtr-close aria-label="${cancelTxt}"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <p style="margin:0 0 0.85rem 0; color:#cbd5e0; line-height:1.5;">${body}</p>
                        <p class="voorstelling-timer-replace-prev" style="margin:0 0 1rem 0; font-size:0.88rem; color:#94a3b8;">${prevLine}</p>
                        <div class="voorstelling-timer-replace-fields">
                            <label class="voorstelling-timer-replace-label">
                                <span>${lblRemark}</span>
                                <textarea class="voorstelling-timer-replace-input" data-vtr-remark placeholder="${remarkPlaceholder}" rows="3"></textarea>
                            </label>
                            <div class="voorstelling-timer-replace-actions">
                                <button type="button" class="btn btn-secondary" data-vtr-remark-btn>${addRemarkTxt}</button>
                            </div>
                            <label class="voorstelling-timer-replace-label">
                                <span>${lblClock}</span>
                                <input type="time" step="1" class="voorstelling-timer-replace-input" data-vtr-clock value="${clockDefault}" />
                            </label>
                            <p class="voorstelling-timer-replace-hint">${hintClock}</p>
                            <div class="voorstelling-timer-replace-actions voorstelling-timer-replace-actions--final">
                                <button type="button" class="btn btn-secondary" data-vtr-cancel>${cancelTxt}</button>
                                <button type="button" class="btn btn-danger" data-vtr-reset>${resetTxt}</button>
                                <button type="button" class="btn btn-primary" data-vtr-confirm>${confirmTxt}</button>
                            </div>
                        </div>
                        <p class="voorstelling-timer-replace-error" data-vtr-err style="display:none;margin:0.75rem 0 0 0;color:#fca5a5;font-size:0.9rem;"></p>
                    </div>
                </div>`;

            const errEl = modal.querySelector('[data-vtr-err]');
            const showErr = (msg) => {
                if (errEl) {
                    errEl.textContent = msg;
                    errEl.style.display = msg ? 'block' : 'none';
                }
            };

            const cleanup = (val) => {
                document.removeEventListener('keydown', onKey);
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                resolve(val);
            };
            const onKey = (e) => {
                if (e.key === 'Escape') cleanup(false);
            };
            document.addEventListener('keydown', onKey);

            const onConfirm = () => {
                showErr('');
                const clockInp = modal.querySelector('[data-vtr-clock]');
                const rawClock = clockInp?.value?.trim() || '';
                const m = rawClock.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
                if (!m) {
                    showErr(this.t('voorstellingTimer.replaceInvalidClock'));
                    return;
                }
                const base = prevIso ? new Date(prevIso) : new Date();
                base.setHours(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3] || '0', 10), 0);
                cleanup({ type: 'replace', wallIso: base.toISOString() });
            };

            const onRemark = () => {
                showErr('');
                const remarkInp = modal.querySelector('[data-vtr-remark]');
                const text = String(remarkInp?.value || '').trim();
                if (!text) {
                    showErr(this.t('voorstellingTimer.replaceEmptyRemark'));
                    remarkInp?.focus();
                    return;
                }
                cleanup({ type: 'remark', wallIso: pressedIso || new Date().toISOString(), text });
            };

            modal.querySelector('[data-vtr-cancel]')?.addEventListener('click', () => cleanup(false));
            modal.querySelector('[data-vtr-close]')?.addEventListener('click', () => cleanup(false));
            modal.querySelector('[data-vtr-reset]')?.addEventListener('click', () => cleanup({ type: 'reset' }));
            modal.querySelector('[data-vtr-confirm]')?.addEventListener('click', onConfirm);
            modal.querySelector('[data-vtr-remark-btn]')?.addEventListener('click', onRemark);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(false);
            });

            document.body.appendChild(modal);
            modal.querySelector('[data-vtr-remark]')?.focus();
        });
    }

    addVoorstellingTimerRemark(stepId, slotId, text, wallIso) {
        if (!slotId || !stepId) return;
        const st = this.ensureVoorstellingSlotState(slotId);
        const cleanText = String(text || '').trim();
        if (!cleanText) return;
        if (!Array.isArray(st.remarks)) st.remarks = [];
        st.remarks.push({
            id: `remark_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
            stepId,
            wallIso: wallIso && typeof wallIso === 'string' ? wallIso : new Date().toISOString(),
            text: cleanText
        });
        st.remarks.sort((a, b) => Date.parse(a.wallIso || '') - Date.parse(b.wallIso || ''));
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true })
            .then(() => this.schedulePersistVoorstellingTimerSnapshot())
            .catch(() => {});
    }

    openVoorstellingTimerRemarkEditModal(slotId, remarkId) {
        return new Promise((resolve) => {
            const st = this.ensureVoorstellingSlotState(slotId);
            const remarks = Array.isArray(st.remarks) ? st.remarks : [];
            const remark = remarks.find((r) => r?.id === remarkId);
            if (!remark) {
                resolve(null);
                return;
            }
            const cancelTxt = this.escapeHtml(this.t('voorstellingTimer.replaceCancel'));
            const saveTxt = this.escapeHtml(this.t('voorstellingTimer.remarkSave'));
            const delTxt = this.escapeHtml(this.t('voorstellingTimer.remarkDelete'));
            const title = this.escapeHtml(this.t('voorstellingTimer.remarkEditTitle'));
            const lblClock = this.escapeHtml(this.t('voorstellingTimer.replaceCorrectClockLabel'));
            const lblRemark = this.escapeHtml(this.t('voorstellingTimer.replaceRemarkLabel'));
            const hintClock = this.escapeHtml(this.t('voorstellingTimer.replaceCorrectClockHint'));
            const remarkPlaceholder = this.escapeHtml(this.t('voorstellingTimer.replaceRemarkPlaceholder'));
            const remarkDate = new Date(remark.wallIso || '');
            const clockDefault = this.toDatetimeLocalValue(Number.isNaN(remarkDate.getTime()) ? new Date() : remarkDate);

            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'voorstellingTimerRemarkEditHeading');
            modal.innerHTML = `
                <div class="modal-content voorstelling-timer-replace-modal" style="max-width: 480px;">
                    <div class="modal-header">
                        <h2 id="voorstellingTimerRemarkEditHeading">${title}</h2>
                        <button type="button" class="modal-close" data-vtr-close aria-label="${cancelTxt}"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="voorstelling-timer-replace-fields">
                            <label class="voorstelling-timer-replace-label">
                                <span>${lblRemark}</span>
                                <textarea class="voorstelling-timer-replace-input" data-vtr-remark placeholder="${remarkPlaceholder}" rows="3">${this.escapeHtml(remark.text || '')}</textarea>
                            </label>
                            <label class="voorstelling-timer-replace-label">
                                <span>${lblClock}</span>
                                <input type="time" step="1" class="voorstelling-timer-replace-input" data-vtr-clock value="${clockDefault}" />
                            </label>
                            <p class="voorstelling-timer-replace-hint">${hintClock}</p>
                            <div class="voorstelling-timer-replace-actions voorstelling-timer-replace-actions--final">
                                <button type="button" class="btn btn-secondary" data-vtr-cancel>${cancelTxt}</button>
                                <button type="button" class="btn btn-danger" data-vtr-delete>${delTxt}</button>
                                <button type="button" class="btn btn-primary" data-vtr-save>${saveTxt}</button>
                            </div>
                        </div>
                        <p class="voorstelling-timer-replace-error" data-vtr-err style="display:none;margin:0.75rem 0 0 0;color:#fca5a5;font-size:0.9rem;"></p>
                    </div>
                </div>`;

            const errEl = modal.querySelector('[data-vtr-err]');
            const showErr = (msg) => {
                if (errEl) {
                    errEl.textContent = msg || '';
                    errEl.style.display = msg ? 'block' : 'none';
                }
            };
            const cleanup = (val) => {
                document.removeEventListener('keydown', onKey);
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                resolve(val);
            };
            const onKey = (e) => {
                if (e.key === 'Escape') cleanup(false);
            };
            document.addEventListener('keydown', onKey);

            const onSave = () => {
                showErr('');
                const text = String(modal.querySelector('[data-vtr-remark]')?.value || '').trim();
                if (!text) {
                    showErr(this.t('voorstellingTimer.replaceEmptyRemark'));
                    modal.querySelector('[data-vtr-remark]')?.focus();
                    return;
                }
                const rawClock = String(modal.querySelector('[data-vtr-clock]')?.value || '').trim();
                const m = rawClock.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
                if (!m) {
                    showErr(this.t('voorstellingTimer.replaceInvalidClock'));
                    modal.querySelector('[data-vtr-clock]')?.focus();
                    return;
                }
                const base = new Date(remark.wallIso || new Date().toISOString());
                base.setHours(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3] || '0', 10), 0);
                cleanup({ type: 'save', text, wallIso: base.toISOString() });
            };

            modal.querySelector('[data-vtr-cancel]')?.addEventListener('click', () => cleanup(false));
            modal.querySelector('[data-vtr-close]')?.addEventListener('click', () => cleanup(false));
            modal.querySelector('[data-vtr-delete]')?.addEventListener('click', () => cleanup({ type: 'delete' }));
            modal.querySelector('[data-vtr-save]')?.addEventListener('click', onSave);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(false);
            });
            document.body.appendChild(modal);
            modal.querySelector('[data-vtr-remark]')?.focus();
        });
    }

    async editVoorstellingTimerRemark(slotId, remarkId) {
        const result = await this.openVoorstellingTimerRemarkEditModal(slotId, remarkId);
        if (!result) return;
        const st = this.ensureVoorstellingSlotState(slotId);
        if (!Array.isArray(st.remarks)) return;
        const idx = st.remarks.findIndex((r) => r?.id === remarkId);
        if (idx < 0) return;
        if (result.type === 'delete') {
            st.remarks.splice(idx, 1);
        } else if (result.type === 'save') {
            st.remarks[idx] = {
                ...st.remarks[idx],
                wallIso: result.wallIso,
                text: result.text
            };
            st.remarks.sort((a, b) => Date.parse(a.wallIso || '') - Date.parse(b.wallIso || ''));
        } else {
            return;
        }
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true })
            .then(() => this.schedulePersistVoorstellingTimerSnapshot())
            .catch(() => {});
    }

    async handleVoorstellingTimerStepClick(stepId, slotId) {
        if (!this.canApplyVoorstellingStep(stepId, slotId)) return;
        const marks = this.ensureVoorstellingSlotState(slotId).marks || {};
        const had = !!marks[stepId];
        if (had) {
            const pressedIso = new Date().toISOString();
            const correction = await this.openVoorstellingTimerReplaceModal(stepId, slotId, pressedIso);
            if (!correction) return;
            if (correction.type === 'remark') {
                this.addVoorstellingTimerRemark(stepId, slotId, correction.text, correction.wallIso);
                return;
            }
            if (correction.type === 'replace') {
                this.applyVoorstellingTimerMark(stepId, {
                    replace: true,
                    slotId,
                    wallIso: correction.wallIso
                });
            } else if (correction.type === 'reset') {
                const st = this.ensureVoorstellingSlotState(slotId);
                if (st?.marks && Object.prototype.hasOwnProperty.call(st.marks, stepId)) {
                    delete st.marks[stepId];
                }
                if (st?.markElapsedMs && Object.prototype.hasOwnProperty.call(st.markElapsedMs, stepId)) {
                    delete st.markElapsedMs[stepId];
                }
                if (st?.elapsedByStep && Object.prototype.hasOwnProperty.call(st.elapsedByStep, stepId)) {
                    delete st.elapsedByStep[stepId];
                }
                this.recalculateVoorstellingTimerFromMarks(slotId);
                void this.renderVoorstellingTimerUI({ skipStorageMerge: true })
                    .then(() => this.schedulePersistVoorstellingTimerSnapshot())
                    .catch(() => {});
            }
        } else {
            this.applyVoorstellingTimerMark(stepId, { replace: false, slotId });
        }
    }

    handleVoorstellingTimerSpacebarShortcut(e) {
        if (e.defaultPrevented) return;
        if (e.key !== ' ' && e.code !== 'Space' && e.key !== 'Spacebar') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (this.currentView !== 'voorstellingTimer') return;
        if (this._voorstellingTimerEditingSlotId) return;

        const target = e.target;
        if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/i.test(target.tagName))) return;
        if (document.querySelector('.modal.show')) return;

        const nextBtn = document.querySelector(
            '#voorstellingTimerSessionsRow .voorstelling-timer-step-btn--next:not(:disabled)'
        );
        if (!nextBtn) return;
        e.preventDefault();
        nextBtn.click();
    }

    /** Externe trigger (OSC / Stream Deck / Companion): alleen eerste markering; geen vervang-modal. */
    triggerVoorstellingTimerStepFromOsc(slotId, stepId) {
        if (this._voorstellingTimerEditingSlotId) return;
        if (!this.canApplyVoorstellingStep(stepId, slotId)) return;
        const marks = this.ensureVoorstellingSlotState(slotId).marks || {};
        if (marks[stepId]) return;
        this.applyVoorstellingTimerMark(stepId, { replace: false, slotId });
    }

    formatVoorstellingMarkTime(iso) {
        if (!iso) return '—';
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        return new Date(iso).toLocaleTimeString(locale, this.wallClockTimeFormatOptions());
    }

    beginTimerColumnEdit(slotId) {
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        if (!sess) return;
        if (this._voorstellingTimerEditingSlotId && this._voorstellingTimerEditingSlotId !== slotId) {
            this._timerColumnEditBackup = null;
            this._voorstellingTimerEditingSlotId = null;
            this.schedulePersistVoorstellingTimerSnapshot();
        }
        const pauseCount = this.countPauzesInSchedule(sess.scheduleData);
        const st = this.ensureVoorstellingSlotState(slotId);
        const prevOrder = st.customStepOrder?.length ? [...st.customStepOrder] : null;
        const prevLabels = { ...(st.customLabels || {}) };
        if (!st.customStepOrder?.length) {
            st.customStepOrder = [...this.getVoorstellingTimerStepsForSlot(slotId, pauseCount)];
        }
        if (!st.customLabels) st.customLabels = {};
        this._timerColumnEditBackup = { slotId, order: prevOrder, labels: prevLabels };
        this._voorstellingTimerEditingSlotId = slotId;
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    cancelTimerColumnEdit() {
        if (this._timerColumnEditBackup) {
            const { slotId, order, labels } = this._timerColumnEditBackup;
            const st = this.ensureVoorstellingSlotState(slotId);
            st.customStepOrder = order ? [...order] : null;
            st.customLabels = { ...labels };
        }
        this._timerColumnEditBackup = null;
        this._voorstellingTimerEditingSlotId = null;
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    saveTimerColumnEdit() {
        this._timerColumnEditBackup = null;
        this._voorstellingTimerEditingSlotId = null;
        const sessions = this._timerSessions || [];
        for (const { slotId } of sessions) {
            this.recalculateVoorstellingTimerFromMarks(slotId);
        }
        this.schedulePersistVoorstellingTimerSnapshot();
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    moveTimerStepInColumn(slotId, index, delta) {
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        if (!sess) return;
        const pauseCount = this.countPauzesInSchedule(sess.scheduleData);
        const steps = [...this.getVoorstellingTimerStepsForSlot(slotId, pauseCount)];
        const j = index + delta;
        if (j < 0 || j >= steps.length) return;
        const t = steps[index];
        steps[index] = steps[j];
        steps[j] = t;
        this.ensureVoorstellingSlotState(slotId).customStepOrder = steps;
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    reorderTimerStepByDrag(slotId, fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        if (!sess) return;
        const pauseCount = this.countPauzesInSchedule(sess.scheduleData);
        const steps = [...this.getVoorstellingTimerStepsForSlot(slotId, pauseCount)];
        if (fromIndex < 0 || fromIndex >= steps.length || toIndex < 0 || toIndex >= steps.length) return;
        const [item] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, item);
        this.ensureVoorstellingSlotState(slotId).customStepOrder = steps;
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    ensureVoorstellingTimerStepDragListeners(sessionsRow) {
        if (!sessionsRow || this._timerDragListenersAttached) return;
        this._timerDragListenersAttached = true;
        sessionsRow.addEventListener('dragstart', (e) => {
            const h = e.target.closest('[data-timer-drag-handle]');
            if (!h) return;
            const slotId = h.getAttribute('data-slot-id');
            const fromIndex = parseInt(h.getAttribute('data-step-index'), 10);
            if (!slotId || !Number.isFinite(fromIndex)) return;
            try {
                e.dataTransfer.setData('application/json', JSON.stringify({ slotId, fromIndex }));
            } catch (_) {
                e.dataTransfer.setData('text/plain', `${slotId}|${fromIndex}`);
            }
            e.dataTransfer.effectAllowed = 'move';
            h.closest('[data-timer-step-row]')?.classList.add('voorstelling-timer-step--dragging');
        });
        sessionsRow.addEventListener('dragend', () => {
            sessionsRow.querySelectorAll('.voorstelling-timer-step--dragging').forEach((el) => {
                el.classList.remove('voorstelling-timer-step--dragging');
            });
            sessionsRow.querySelectorAll('.voorstelling-timer-step--drop-hover').forEach((el) => {
                el.classList.remove('voorstelling-timer-step--drop-hover');
            });
            this._timerDragHoverRow = null;
        });
        sessionsRow.addEventListener('dragover', (e) => {
            const row = e.target.closest('[data-timer-step-row]');
            if (!row) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (this._timerDragHoverRow && this._timerDragHoverRow !== row) {
                this._timerDragHoverRow.classList.remove('voorstelling-timer-step--drop-hover');
            }
            this._timerDragHoverRow = row;
            row.classList.add('voorstelling-timer-step--drop-hover');
        });
        sessionsRow.addEventListener('drop', (e) => {
            const row = e.target.closest('[data-timer-step-row]');
            if (!row) return;
            e.preventDefault();
            let payload = null;
            try {
                const raw = e.dataTransfer.getData('application/json');
                if (raw) payload = JSON.parse(raw);
            } catch (_) {
                /* ignore */
            }
            if (!payload) {
                const fallback = e.dataTransfer.getData('text/plain');
                const parts = String(fallback || '').split('|');
                if (parts.length >= 2) {
                    payload = { slotId: parts[0], fromIndex: parseInt(parts[1], 10) };
                }
            }
            if (!payload || payload.slotId == null || !Number.isFinite(payload.fromIndex)) return;
            const toIndex = parseInt(row.getAttribute('data-step-index'), 10);
            if (!Number.isFinite(toIndex)) return;
            this.reorderTimerStepByDrag(payload.slotId, payload.fromIndex, toIndex);
            sessionsRow.querySelectorAll('.voorstelling-timer-step--drop-hover').forEach((el) => {
                el.classList.remove('voorstelling-timer-step--drop-hover');
            });
            this._timerDragHoverRow = null;
        });
    }

    removeTimerStepFromColumn(slotId, stepId) {
        if (typeof stepId !== 'string' || !stepId.startsWith('custom_')) return;
        const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
        if (!sess) return;
        const pauseCount = this.countPauzesInSchedule(sess.scheduleData);
        const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount).filter((id) => id !== stepId);
        const st = this.ensureVoorstellingSlotState(slotId);
        st.customStepOrder = steps;
        delete st.customLabels[stepId];
        delete st.marks[stepId];
        if (st.markElapsedMs && stepId in st.markElapsedMs) delete st.markElapsedMs[stepId];
        if (Array.isArray(st.remarks)) {
            st.remarks = st.remarks.filter((r) => r?.stepId !== stepId);
        }
        this.recalculateVoorstellingTimerFromMarks(slotId);
        void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
    }

    /**
     * Vraagt label voor een vrije knop. Geen window.prompt — die werkt in Electron niet betrouwbaar.
     */
    openVoorstellingTimerCustomStepModal() {
        return new Promise((resolve) => {
            const title = this.escapeHtml(this.t('voorstellingTimer.columnEditAddCustomModalTitle'));
            const lbl = this.escapeHtml(this.t('voorstellingTimer.columnEditPromptLabel'));
            const cancelTxt = this.escapeHtml(this.t('voorstellingTimer.columnEditCancel'));
            const okTxt = this.escapeHtml(this.t('voorstellingTimer.columnEditConfirmAdd'));

            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'voorstellingTimerCustomStepHeading');
            modal.innerHTML = `
                <div class="modal-content voorstelling-timer-custom-step-modal" style="max-width: 440px;">
                    <div class="modal-header">
                        <h2 id="voorstellingTimerCustomStepHeading">${title}</h2>
                        <button type="button" class="modal-close" data-csc-close aria-label="${cancelTxt}"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <label class="voorstelling-timer-custom-step-label">
                            <span>${lbl}</span>
                            <input type="text" class="voorstelling-timer-custom-step-input" data-csc-input autocomplete="off" />
                        </label>
                        <p class="voorstelling-timer-custom-step-err" data-csc-err style="display:none;margin:0.5rem 0 0 0;color:#fca5a5;font-size:0.9rem;"></p>
                    </div>
                    <div class="modal-footer voorstelling-timer-custom-step-footer">
                        <button type="button" class="btn btn-secondary" data-csc-cancel>${cancelTxt}</button>
                        <button type="button" class="btn btn-primary" data-csc-ok>${okTxt}</button>
                    </div>
                </div>`;

            const cleanup = (val) => {
                document.removeEventListener('keydown', onKey);
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                resolve(val);
            };

            const onKey = (e) => {
                if (e.key === 'Escape') cleanup(null);
            };
            document.addEventListener('keydown', onKey);

            const inp = modal.querySelector('[data-csc-input]');
            const errEl = modal.querySelector('[data-csc-err]');
            const showErr = (msg) => {
                if (errEl) {
                    errEl.textContent = msg || '';
                    errEl.style.display = msg ? 'block' : 'none';
                }
            };

            const submit = () => {
                showErr('');
                const v = String(inp?.value || '').trim();
                if (!v) {
                    showErr(this.t('voorstellingTimer.columnEditEmptyLabel'));
                    inp?.focus();
                    return;
                }
                cleanup(v);
            };

            modal.querySelector('[data-csc-close]')?.addEventListener('click', () => cleanup(null));
            modal.querySelector('[data-csc-cancel]')?.addEventListener('click', () => cleanup(null));
            modal.querySelector('[data-csc-ok]')?.addEventListener('click', submit);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(null);
            });
            inp?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submit();
                }
            });

            document.body.appendChild(modal);
            requestAnimationFrame(() => {
                inp?.focus();
            });
        });
    }

    addCustomTimerStepToColumn(slotId) {
        void this.openVoorstellingTimerCustomStepModal().then((label) => {
            if (!label || !String(label).trim()) return;
            const sess = (this._timerSessions || []).find((s) => s.slotId === slotId);
            if (!sess) return;
            const pauseCount = this.countPauzesInSchedule(sess.scheduleData);
            const st = this.ensureVoorstellingSlotState(slotId);
            const cur = [...this.getVoorstellingTimerStepsForSlot(slotId, pauseCount)];
            const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
            st.customLabels[id] = String(label).trim();
            cur.push(id);
            st.customStepOrder = cur;
            void this.renderVoorstellingTimerUI({ skipStorageMerge: true });
        });
    }

    async renderVoorstellingTimerUI(options = {}) {
        const skipStorageMerge = options.skipStorageMerge === true;
        const schemaEl = document.getElementById('voorstellingTimerTijdschema');
        const sessionsRow = document.getElementById('voorstellingTimerSessionsRow');
        try {
        if (!schemaEl || !sessionsRow) return;

        const data = this.tijdschemaScheduleData;
        if (!data || !data.length) {
            schemaEl.innerHTML = `<div class="info-message">${this.escapeHtml(this.t('voorstellingTimer.noSchedule'))}</div>`;
            sessionsRow.innerHTML = '';
            this._timerSessions = [];
            return;
        }

        schemaEl.innerHTML = this.buildTijdschemaListHtml(data);

        const sessions = this.buildTimerDaySessions(data);
        this._timerSessions = sessions;
        this.pruneVoorstellingSlotState(sessions.map((s) => s.slotId));
        sessions.forEach(({ slotId }) => this.ensureVoorstellingSlotState(slotId));
        if (!skipStorageMerge) {
            const storageKey = this.getVoorstellingTimerStorageKey();
            if (this._voorstellingTimerLastMergedKey !== storageKey) {
                await this.mergeVoorstellingTimerSnapshotFromStorage(sessions);
                this._voorstellingTimerLastMergedKey = storageKey;
            }
        }

        const n = sessions.length;
        sessionsRow.style.setProperty('--timer-cols', String(Math.max(1, n)));

        sessionsRow.innerHTML = sessions
            .map((session) => {
                const { slotId, scheduleData: sessSched } = session;
                const pauseCount = this.countPauzesInSchedule(sessSched);
                const steps = this.getVoorstellingTimerStepsForSlot(slotId, pauseCount);
                const marks = this.ensureVoorstellingSlotState(slotId).marks || {};
                const isEditing = this._voorstellingTimerEditingSlotId === slotId;

                let nextIdx = -1;
                for (let i = 0; i < steps.length; i++) {
                    if (!marks[steps[i]]) {
                        nextIdx = i;
                        break;
                    }
                }

                /** Laatst gemarkeerde stap = huidige positie; daar hoort de live stopwatch bij, niet bij de volgende open stap. */
                let currentIdx = -1;
                for (let i = 0; i < steps.length; i++) {
                    if (marks[steps[i]]) currentIdx = i;
                }

                const slotTitle = this.escapeHtml(this.getTimerSlotLabel(slotId));
                const stSlot = this.ensureVoorstellingSlotState(slotId);
                const derivedPauseMinutes = this.getPauseDurationMinutesFromSchedule(sessSched);
                if (derivedPauseMinutes != null) stSlot.pauseDurationMinutes = derivedPauseMinutes;
                const rawRemarks = Array.isArray(stSlot.remarks) ? stSlot.remarks : [];
                const remarksByStep = new Map();
                for (const r of rawRemarks) {
                    if (!r?.id || !r?.stepId || !r?.wallIso || !String(r.text || '').trim()) continue;
                    if (!remarksByStep.has(r.stepId)) remarksByStep.set(r.stepId, []);
                    remarksByStep.get(r.stepId).push(r);
                }
                for (const arr of remarksByStep.values()) {
                    arr.sort((a, b) => (Date.parse(a.wallIso || '') || 0) - (Date.parse(b.wallIso || '') || 0));
                }

                const stepRows = steps.map((id, index) => {
                        const label = this.getVoorstellingTimerStepLabel(id, pauseCount, slotId);
                        const done = !!marks[id];
                        const reachable = this.isVoorstellingStepReachable(index, steps, marks);
                        const enabled = done || reachable;
                        const isNext = enabled && !done && index === nextIdx;
                        let cls = 'voorstelling-timer-step-btn';
                        if (done) cls += ' voorstelling-timer-step-btn--done';
                        if (isNext) cls += ' voorstelling-timer-step-btn--next';
                        const num = index + 1;
                        const timeStr = this.escapeHtml(this.formatVoorstellingMarkTime(marks[id]));
                        /** Segment i→i+1 hoort bij stap i (timestamp daar); duur staat in markElapsedMs van de *volgende* stap. */
                        const nextIdInChain = index + 1 < steps.length ? steps[index + 1] : null;
                        const segmentFrozenMs =
                            nextIdInChain &&
                            marks[id] &&
                            marks[nextIdInChain] &&
                            typeof stSlot.markElapsedMs?.[nextIdInChain] === 'number'
                                ? stSlot.markElapsedMs[nextIdInChain]
                                : null;
                        const check = done ? '<i class="fas fa-check voorstelling-timer-step-check"></i>' : '';
                        /** Live segment op laatst getikte stap; volgende knop staat nog open. Geen live op einde (totaal loopt daar vast). */
                        const showLiveStopwatch =
                            currentIdx === index && id !== 'einde' && nextIdx > index;
                        const hasMark = !!marks[id];
                        if (hasMark && showLiveStopwatch) cls += ' voorstelling-timer-step-btn--live';

                        let timesRowHtml = '';
                        if (hasMark && showLiveStopwatch) {
                            timesRowHtml = `<span class="voorstelling-timer-step-btn-times">
                            <span class="voorstelling-timer-step-btn-time voorstelling-timer-step-btn-time--pressed${done ? '' : ' voorstelling-timer-step-btn-time--pending'}">${timeStr}</span>
                            <span class="voorstelling-timer-step-btn-timed voorstelling-timer-step-btn-timed--live voorstelling-timer-step-btn-live-sw voorstelling-stopwatch voorstelling-stopwatch--inline" data-slot-stopwatch="${this.escapeHtml(slotId)}" aria-live="polite">${this.formatStopwatchMs(this.getVoorstellingStopwatchMs(slotId))}</span>
                        </span>`;
                        } else if (segmentFrozenMs != null) {
                            timesRowHtml = `<span class="voorstelling-timer-step-btn-times">
                            <span class="voorstelling-timer-step-btn-time voorstelling-timer-step-btn-time--pressed${done ? '' : ' voorstelling-timer-step-btn-time--pending'}">${timeStr}</span>
                            <span class="voorstelling-timer-step-btn-timed voorstelling-timer-step-btn-timed--segment">${this.escapeHtml(this.formatStopwatchMs(segmentFrozenMs))}</span>
                        </span>`;
                        } else if (hasMark) {
                            timesRowHtml = `<span class="voorstelling-timer-step-btn-times voorstelling-timer-step-btn-times--stamp-only">
                            <span class="voorstelling-timer-step-btn-time voorstelling-timer-step-btn-time--pressed${done ? '' : ' voorstelling-timer-step-btn-time--pending'}">${timeStr}</span>
                        </span>`;
                        } else {
                            /* Zelfde tweede regel als na tik (tijd + stopwatch-kolom), onzichtbaar — voorkomt groei per klik. */
                            timesRowHtml = `<span class="voorstelling-timer-step-btn-times voorstelling-timer-step-btn-times--reserve" aria-hidden="true">
                            <span class="voorstelling-timer-step-btn-time voorstelling-timer-step-btn-time--pending">00:00:00</span>
                            <span class="voorstelling-timer-step-btn-timed voorstelling-stopwatch--inline">00:00:00</span>
                        </span>`;
                        }
                        const liveAttr = showLiveStopwatch ? ' aria-current="step"' : '';
                        const btnLocked = isEditing || !enabled;
                        const stepRowClass = `voorstelling-timer-step${isEditing ? ' voorstelling-timer-step--edit-mode' : ''}`;
                        const stepRowAttrs = isEditing
                            ? ` data-timer-step-row data-step-index="${index}" data-slot-id="${this.escapeHtml(slotId)}"`
                            : '';
                        const leadHtml = isEditing
                            ? `<div class="voorstelling-timer-step-lead" title="${this.escapeHtml(this.t('voorstellingTimer.columnEditDrag'))}">
                            <span class="voorstelling-timer-step-num voorstelling-timer-step-num--in-lead">${num}</span>
                            <div class="voorstelling-timer-step-drag-handle" draggable="true" data-timer-drag-handle data-step-index="${index}" data-slot-id="${this.escapeHtml(slotId)}" aria-grabbed="false"><i class="fas fa-grip-vertical" aria-hidden="true"></i></div>
                        </div>`
                            : '';
                        const removeHtml =
                            isEditing && typeof id === 'string' && id.startsWith('custom_')
                                ? `<button type="button" class="voorstelling-timer-step-remove" data-step-remove="${this.escapeHtml(id)}" data-slot-id="${this.escapeHtml(slotId)}" title="${this.escapeHtml(this.t('voorstellingTimer.columnEditRemove'))}"><i class="fas fa-times"></i></button>`
                                : isEditing
                                  ? '<span class="voorstelling-timer-step-remove-spacer" aria-hidden="true"></span>'
                                  : '';
                        const stepHtml = `
                <div class="${stepRowClass}"${stepRowAttrs}>
                    ${isEditing ? leadHtml : `<span class="voorstelling-timer-step-num">${num}</span>`}
                    <button type="button" class="${cls}" data-step-id="${id}" data-slot-id="${this.escapeHtml(slotId)}"${liveAttr} ${btnLocked ? 'disabled' : ''}>
                        <span class="voorstelling-timer-step-btn-inner">
                            <span class="voorstelling-timer-step-btn-title">${check}<span class="voorstelling-timer-step-btn-title-text">${this.escapeHtml(label)}</span></span>
                            ${timesRowHtml}
                        </span>
                    </button>
                    ${removeHtml}
                </div>`;
                        if (isEditing) return { kind: 'step', html: stepHtml };
                        const linkedRemarks = remarksByStep.get(id) || [];
                        if (!linkedRemarks.length) return { kind: 'step', html: stepHtml };
                        const remarksHtml = linkedRemarks
                            .map((r) => {
                                const rid = this.escapeHtml(r.id);
                                const txt = this.escapeHtml(r.text);
                                const timeLabel = this.escapeHtml(this.formatVoorstellingMarkTime(r.wallIso));
                                return `
                <div class="voorstelling-timer-remark-row" data-remark-edit="${rid}" data-slot-id="${this.escapeHtml(slotId)}">
                    <span class="voorstelling-timer-remark-indent" aria-hidden="true"></span>
                    <button type="button" class="voorstelling-timer-remark-btn" title="${timeLabel} · ${txt}">
                        <span class="voorstelling-timer-remark-time">${timeLabel}</span>
                        <span class="voorstelling-timer-remark-text">${txt}</span>
                    </button>
                </div>`;
                            })
                            .join('');
                        return {
                            kind: 'step',
                            html: `${stepHtml}${remarksHtml}`
                        };
                    });
                const buttonsHtml = stepRows.map((row) => row.html).join('');

                const titleBlock = isEditing
                    ? `<h4 class="voorstelling-timer-session-title"><span class="voorstelling-timer-session-title-text">${slotTitle}</span></h4>`
                    : `<h4 class="voorstelling-timer-session-title"><button type="button" class="voorstelling-timer-session-title-btn" data-slot-begin-edit="${this.escapeHtml(slotId)}">${slotTitle}</button></h4>`;

                const editBarHtml = isEditing
                    ? `<div class="voorstelling-timer-session-edit-bar">
                    <div class="voorstelling-timer-session-edit-actions">
                        <div class="voorstelling-timer-session-add-step-wrap">
                            <div class="voorstelling-timer-session-add-step-aligner" aria-hidden="true"></div>
                            <button type="button" class="voorstelling-timer-step-btn voorstelling-timer-session-add-step" data-slot-add-custom="${this.escapeHtml(slotId)}">
                                <span class="voorstelling-timer-step-btn-inner">
                                    <span class="voorstelling-timer-step-btn-title">
                                        <i class="fas fa-plus voorstelling-timer-session-add-step-plus" aria-hidden="true"></i>
                                        <span class="voorstelling-timer-step-btn-title-text">${this.escapeHtml(this.t('voorstellingTimer.columnEditAddCustom'))}</span>
                                    </span>
                                </span>
                            </button>
                            <span class="voorstelling-timer-step-remove-spacer" aria-hidden="true"></span>
                        </div>
                        <div class="voorstelling-timer-session-edit-row voorstelling-timer-session-edit-row--primary">
                            <button type="button" class="btn btn-secondary voorstelling-timer-session-edit-btn" data-slot-edit-cancel>${this.escapeHtml(this.t('voorstellingTimer.columnEditCancel'))}</button>
                            <button type="button" class="btn btn-primary voorstelling-timer-session-edit-btn" data-slot-edit-save>${this.escapeHtml(this.t('voorstellingTimer.columnEditSave'))}</button>
                        </div>
                    </div>
                </div>`
                    : '';

                return `
            <section class="voorstelling-timer-session${isEditing ? ' voorstelling-timer-session--editing' : ''}" data-slot-id="${this.escapeHtml(slotId)}" aria-label="${slotTitle}">
                ${titleBlock}
                <div class="voorstelling-timer-buttons">${buttonsHtml}</div>
                ${editBarHtml}
            </section>`;
            })
            .join('');

        sessionsRow.querySelectorAll('[data-step-id][data-slot-id]').forEach((b) => {
            b.addEventListener('click', async () => {
                if (this._voorstellingTimerEditingSlotId) return;
                const id = b.getAttribute('data-step-id');
                const sid = b.getAttribute('data-slot-id');
                if (id && sid) await this.handleVoorstellingTimerStepClick(id, sid);
            });
        });

        sessionsRow.querySelectorAll('[data-slot-begin-edit]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sid = btn.getAttribute('data-slot-begin-edit');
                if (sid) this.beginTimerColumnEdit(sid);
            });
        });
        sessionsRow.querySelectorAll('[data-slot-edit-cancel]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.cancelTimerColumnEdit();
            });
        });
        sessionsRow.querySelectorAll('[data-slot-edit-save]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveTimerColumnEdit();
            });
        });
        sessionsRow.querySelectorAll('[data-slot-add-custom]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sid = btn.getAttribute('data-slot-add-custom');
                if (sid) this.addCustomTimerStepToColumn(sid);
            });
        });
        sessionsRow.querySelectorAll('[data-step-remove]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sid = btn.getAttribute('data-slot-id');
                const rid = btn.getAttribute('data-step-remove');
                if (sid && rid) this.removeTimerStepFromColumn(sid, rid);
            });
        });
        sessionsRow.querySelectorAll('[data-remark-edit][data-slot-id]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sid = btn.getAttribute('data-slot-id');
                const rid = btn.getAttribute('data-remark-edit');
                if (sid && rid) {
                    void this.editVoorstellingTimerRemark(sid, rid);
                }
            });
        });

        this.ensureVoorstellingTimerStepDragListeners(sessionsRow);

        this.updateVoorstellingAuxiliaryClock();
        } finally {
            this.updateVoorstellingTimerCardTitle();
            this.updateVoorstellingTimerExportButtonState();
        }
    }

    async showVoorstellingTimerView() {
        if (!this.canOpenVoorstellingTimer()) {
            return;
        }
        this.pushHistorySnapshotIfNeeded('voorstellingTimer');
        this.previousView = this.currentView;
        this.currentView = 'voorstellingTimer';
        this.hideLuminexShell();
        this.hideOscMonitorShell();

        const weekWrapper = document.getElementById('weekViewWrapper');
        const homeContainer = document.getElementById('homeViewContainer');
        const detailWrapper = document.getElementById('detailViewWrapper');
        const homeStatus = document.getElementById('homeViewStatus');
        if (weekWrapper) weekWrapper.style.display = 'none';
        if (homeContainer) homeContainer.style.display = 'none';
        if (detailWrapper) detailWrapper.style.display = 'none';
        if (homeStatus) homeStatus.style.display = 'none';

        const timerWrap = document.getElementById('voorstellingTimerWrapper');
        if (timerWrap) timerWrap.style.display = 'block';

        document.body.classList.remove('home-view-active');
        document.body.classList.remove('week-view-active');
        document.body.classList.add('voorstelling-timer-active');

        document.getElementById('weekBtn')?.classList.remove('active');
        document.getElementById('homeBtn')?.classList.remove('active');
        document.getElementById('voorstellingTimerBtn')?.classList.add('active');

        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.style.display = 'none';

        const dateSelector = document.querySelector('.date-selector');
        const venueSelector = document.querySelector('.venue-selector');
        if (dateSelector) {
            dateSelector.style.display = 'flex';
            dateSelector.style.visibility = 'visible';
        }
        if (venueSelector) {
            venueSelector.style.display = 'block';
            venueSelector.style.visibility = 'visible';
        }

        await this.renderVoorstellingTimerUI();
        this.startVoorstellingTimerClockLoop();
        this.updateBackButtonVisibility();
    }

    /**
     * Koppelt .rider-link (zaalplattegrond, bijlagen) aan openExternal na dynamische HTML.
     */
    setupRiderLinkHandlers(container) {
        if (!container) return;
        container.querySelectorAll('.rider-link').forEach((a) => {
            a.addEventListener('click', async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const url = a.getAttribute('data-rider-url');
                if (url && window.electronAPI?.openExternal) {
                    try {
                        await window.electronAPI.openExternal(url);
                    } catch (err) {
                        console.error('Externe link openen:', err);
                    }
                }
            });
        });
    }

    setupDragAndDrop(container) {
        const eventsList = container.querySelector('.events-list');
        if (!eventsList) return;
        
        let draggedElement = null;
        let draggedItem = null; // De parent data-item van het gedragde element
        const COLUMNS = 3; // Aantal kolommen in de grid
        
        // Zoek alle drag handles (h4 titels) in home view
        const dragHandles = eventsList.querySelectorAll('.drag-handle[draggable="true"]');
        
        dragHandles.forEach((handle) => {
            const item = handle.closest('.data-item');
            if (!item) return;
            
            handle.addEventListener('dragstart', (e) => {
                draggedItem = item;
                draggedElement = handle;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                // Maak element onzichtbaar tijdens drag (maar behoud ruimte)
                e.dataTransfer.setDragImage(item, 0, 0);
            });
            
            handle.addEventListener('dragend', (e) => {
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');
                }
                const allItems = eventsList.querySelectorAll('.data-item');
                allItems.forEach(i => {
                    i.classList.remove('drag-over');
                    i.style.opacity = '';
                });
                draggedItem = null;
                draggedElement = null;
                });
            });
            
        // Drop zones zijn de data-items zelf
        const items = eventsList.querySelectorAll('.data-item');
        
        items.forEach((item) => {
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (!draggedItem || draggedItem === item) return;
                
                // Verwijder drag-over van alle items
                items.forEach(i => {
                    if (i !== draggedItem) {
                        i.classList.remove('drag-over');
                        i.style.opacity = '';
                    }
                });
                
                // Voeg drag-over toe aan huidige item
                if (item !== draggedItem) {
                    item.classList.add('drag-over');
                    item.style.opacity = '0.6';
                }
            });
            
            item.addEventListener('dragleave', (e) => {
                // Alleen verwijderen als we echt het item verlaten
                const rect = item.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                    item.classList.remove('drag-over');
                    item.style.opacity = '';
                }
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!draggedItem || draggedItem === item) {
                    items.forEach(i => {
                        i.classList.remove('drag-over');
                        i.style.opacity = '';
                    });
                    return;
                }
                
                // Bepaal de huidige positie van alle items (inclusief dragged item)
                const allItems = Array.from(eventsList.querySelectorAll('.data-item'));
                const dragIndex = allItems.indexOf(draggedItem);
                const dropIndex = allItems.indexOf(item);
                
                if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) {
                    // Geen verplaatsing nodig
                    items.forEach(i => {
                        i.classList.remove('drag-over');
                        i.style.opacity = '';
                    });
                    return;
                }
                
                // Verwijder eerst het gedragde item uit de DOM
                draggedItem.remove();
                
                // Haal alle items opnieuw op (zonder het gedragde item)
                const itemsAfterRemove = Array.from(eventsList.querySelectorAll('.data-item'));
                
                // Bepaal waar we het item moeten invoegen
                if (dropIndex >= itemsAfterRemove.length) {
                    // Als we aan het einde zijn, voeg toe aan het einde
                    eventsList.appendChild(draggedItem);
                } else {
                    // Als we naar links schuiven (dragIndex > dropIndex), gebruik dropIndex
                    // Als we naar rechts schuiven (dragIndex < dropIndex), gebruik dropIndex + 1
                    const insertIndex = dragIndex > dropIndex ? dropIndex : dropIndex;
                    const targetItem = itemsAfterRemove[insertIndex];
                    if (targetItem) {
                        eventsList.insertBefore(draggedItem, targetItem);
                    } else {
                        eventsList.appendChild(draggedItem);
                    }
                }
                
                // Verwijder visuele feedback
                items.forEach(i => {
                    i.classList.remove('drag-over');
                    i.style.opacity = '';
                });
                
                // Sla de nieuwe volgorde op
                this.saveEventOrder(eventsList);
            });
        });
    }
    
    async saveEventOrder(eventsList) {
        const items = eventsList.querySelectorAll('.data-item[data-event-id]');
        const order = Array.from(items).map(item => item.getAttribute('data-event-id'));
        
        // Sla volgorde op per datum
        const dateKey = this.selectedDate.toISOString().split('T')[0];
        
        if (window.electronAPI) {
            try {
                const currentConfig = this.config.app || {};
                if (!currentConfig.eventOrder) {
                    currentConfig.eventOrder = {};
                }
                currentConfig.eventOrder[dateKey] = order;
                
                await window.electronAPI.saveConfig('app', currentConfig);
                this.config.app = currentConfig;

                // Als gebruiker in "Alle zalen" events sleept, vertaal die volgorde ook naar zaalvolgorde.
                // Zo blijft Instellingen > Zaalvolgorde synchroon met wat in de home-grid is gezet.
                const isAllVenuesView = this.currentView === 'home' && (!this.selectedVenues || this.selectedVenues.length === 0);
                if (isAllVenuesView) {
                    const draggedVenueOrder = Array.from(items)
                        .map(item => String(item.getAttribute('data-venue-name') || '').trim())
                        .filter(Boolean)
                        .map(name => name.toUpperCase())
                        .filter((name, idx, arr) => arr.indexOf(name) === idx);

                    if (draggedVenueOrder.length > 0) {
                        const existingVenueOrder = this.getVenueOrder().map(v => String(v || '').toUpperCase()).filter(Boolean);
                        const mergedVenueOrder = [
                            ...draggedVenueOrder,
                            ...existingVenueOrder.filter(v => !draggedVenueOrder.includes(v))
                        ];
                        await this.saveVenueOrder(mergedVenueOrder);
                    }
                }
            } catch (error) {
                console.error('Fout bij opslaan event volgorde:', error);
            }
        }
    }

    getDefaultCardOrder() {
        return ['yesplan', 'tijdschema', 'uurwerk', 'itix', 'priva'];
    }

    applyCardOrder() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        const savedOrder = this.config?.app?.cardOrder;
        const order = Array.isArray(savedOrder) && savedOrder.length > 0
            ? savedOrder
            : this.getDefaultCardOrder();

        const cards = Array.from(grid.querySelectorAll('.card.card-draggable[data-card-id]'));
        const byId = new Map(cards.map(c => [c.getAttribute('data-card-id'), c]));

        for (const id of order) {
            const card = byId.get(id);
            if (card) grid.appendChild(card);
        }
        for (const card of cards) {
            const id = card.getAttribute('data-card-id');
            if (!order.includes(id)) grid.appendChild(card);
        }
    }

    setupCardDragAndDrop() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        let draggedCard = null;

        grid.querySelectorAll('.card.card-draggable').forEach((card) => {
            const header = card.querySelector('.card-header');
            if (!header) return;

            header.setAttribute('draggable', 'true');
            header.classList.add('card-drag-handle');

            header.addEventListener('dragstart', (e) => {
                draggedCard = card;
                card.classList.add('card-dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.getAttribute('data-card-id'));
                e.dataTransfer.setDragImage(card, 0, 0);
            });

            header.addEventListener('dragend', () => {
                if (draggedCard) {
                    draggedCard.classList.remove('card-dragging');
                }
                grid.querySelectorAll('.card').forEach(c => c.classList.remove('card-drag-over'));
                draggedCard = null;
            });
        });

        grid.querySelectorAll('.card.card-draggable').forEach((card) => {
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (!draggedCard || draggedCard === card) return;
                card.classList.add('card-drag-over');
            });

            card.addEventListener('dragleave', (e) => {
                if (!card.contains(e.relatedTarget)) {
                    card.classList.remove('card-drag-over');
                }
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!draggedCard || draggedCard === card) {
                    card.classList.remove('card-drag-over');
                    return;
                }

                const cards = Array.from(grid.querySelectorAll('.card.card-draggable'));
                const dragIdx = cards.indexOf(draggedCard);
                const dropIdx = cards.indexOf(card);
                if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) {
                    card.classList.remove('card-drag-over');
                    return;
                }

                if (dragIdx < dropIdx) {
                    card.parentNode.insertBefore(draggedCard, card.nextSibling);
                } else {
                    card.parentNode.insertBefore(draggedCard, card);
                }

                card.classList.remove('card-drag-over');
                this.saveCardOrder();
            });
        });
    }

    saveCardOrder() {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.card.card-draggable[data-card-id]');
        const order = Array.from(cards).map(c => c.getAttribute('data-card-id'));

        if (window.electronAPI) {
            const currentConfig = this.config.app || {};
            currentConfig.cardOrder = order;
            window.electronAPI.saveConfig('app', currentConfig).then(() => {
                this.config.app = currentConfig;
            }).catch(err => console.error('Fout bij opslaan card volgorde:', err));
        }
    }

    sortEventByDefault(a, b) {
        // Gebruik opgeslagen zaalvolgorde (uit instellingen of default)
        const venueOrder = this.getVenueOrder();
        const venueOrderForMatching = [...venueOrder].sort((a, b) => b.length - a.length);
        
        const getVenueIndex = (venueName) => {
            if (!venueName) return -1;
            const upperName = venueName.toUpperCase();
            
            // Check eerst op exacte match
            let index = venueOrder.findIndex(order => upperName === order);
            if (index !== -1) return index;
            
            // Dan check op startsWith (langere strings eerst)
            for (const order of venueOrderForMatching) {
                if (upperName.startsWith(order)) {
                    return venueOrder.indexOf(order);
                }
            }
            
            return -1;
        };
        
        const venueA = a.venue || '';
        const venueB = b.venue || '';
        const indexA = getVenueIndex(venueA);
        const indexB = getVenueIndex(venueB);
        
        // Sorteer eerst op zaal volgorde
        if (indexA !== -1 && indexB !== -1) {
            // Beide in volgorde: sorteer op volgorde, dan op tijd
            if (indexA !== indexB) {
                return indexA - indexB;
            }
        } else if (indexA !== -1) {
            return -1; // A in volgorde, B niet
        } else if (indexB !== -1) {
            return 1; // B in volgorde, A niet
        } else {
            // Beide niet in volgorde: sorteer alfabetisch op zaal, dan op tijd
            const venueCompare = venueA.localeCompare(venueB);
            if (venueCompare !== 0) {
                return venueCompare;
            }
        }
        
        // Binnen dezelfde zaal: sorteer op starttijd
        // Deze sortering zorgt ervoor dat items van links naar rechts worden geplaatst
        // in de 3-kolommen grid (rij voor rij)
        const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return timeA - timeB;
    }

    formatTime(dateString) {
        if (!dateString) return 'Onbekend';
        try {
            const date = new Date(dateString);
            const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
            return date.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: this.getEffectiveTimeZone()
            });
        } catch (e) {
            return 'Onbekend';
        }
    }

    /** Haalt alle evenementen voor de geselecteerde datum op (alle zalen) voor technisch overzicht. */
    async fetchAllEventsForDate(dateStr) {
        if (!window.electronAPI) return { success: false, data: [] };
        return await window.electronAPI.getYesplanData({
            startDate: dateStr,
            endDate: dateStr,
            skipCache: true
        });
    }

    /** Opent een printvenster met technisch overzicht. In detail view: alle zalen van hetzelfde hoofdevenement (bijv. alle Stresscongres-zalen). Anders: alle evenementen van die dag. */
    async openTechOverviewPrint() {
        const date = this.selectedDate || new Date();
        date.setHours(0, 0, 0, 0);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const dateLabel = date.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        try {
            const result = await this.fetchAllEventsForDate(dateStr);
            if (!result.success || !result.data || result.data.length === 0) {
                this.showError('yesplan', this.t('techPrint.noEvents'));
                return;
            }
            let events = [...result.data];

            if (this.currentView === 'detail' && this.detailContext) {
                const ctx = this.detailContext;
                events = events.filter(event => {
                    if (ctx.groupId) {
                        const gid = event.rawEvent?.group?.id ?? event.rawEvent?.group?.uuid;
                        if (gid != null && String(gid) === ctx.groupId) return true;
                    }
                    if (ctx.groupName) {
                        const gName = (event.rawEvent?.group && typeof event.rawEvent.group === 'object')
                            ? (event.rawEvent.group.name || event.rawEvent.group.title)
                            : (typeof event.rawEvent?.group === 'string' ? event.rawEvent.group : '');
                        if (gName && String(gName).trim().toLowerCase() === String(ctx.groupName).trim().toLowerCase()) return true;
                    }
                    if (ctx.productionId) {
                        const pid = event.rawEvent?.production?.id ?? event.rawEvent?.production?.uuid;
                        if (pid != null && String(pid) === ctx.productionId) return true;
                    }
                    if (ctx.productionName) {
                        const pName = (event.rawEvent?.production && typeof event.rawEvent.production === 'object')
                            ? (event.rawEvent.production.name || event.rawEvent.production.title)
                            : (typeof event.rawEvent?.production === 'string' ? event.rawEvent.production : '');
                        if (pName && String(pName).trim().toLowerCase() === String(ctx.productionName).trim().toLowerCase()) return true;
                    }
                    if (ctx.eventName) {
                        const en = event.name || event.title || '';
                        if (en && String(en).trim().toLowerCase() === String(ctx.eventName).trim().toLowerCase()) return true;
                    }
                    return false;
                });
            }

            if (this.hideCancelledEvents) {
                events = events.filter(ev => {
                    const status = (typeof ev.status === 'string' ? ev.status : '').toLowerCase();
                    const statusName = (typeof ev.status === 'object' && ev.status?.name) ? String(ev.status.name || '').toLowerCase() : '';
                    const cancelled = status.includes('geannuleerd') || status.includes('cancelled') || status.includes('canceled') ||
                        statusName.includes('geannuleerd') || statusName.includes('cancelled') || statusName.includes('canceled');
                    return !cancelled;
                });
            }
            if (events.length === 0) {
                this.showError('yesplan', this.t('techPrint.noEvents'));
                return;
            }
            events.sort((a, b) => this.sortEventByDefault(a, b));

            const escape = (s) => this.escapeHtml(String(s || ''));
            const listItems = events.map((ev, i) => {
                const venueName = ev.venue || this.getVenueNameById(ev.venueIds?.[0]) || this.t('venue.unknownVenue');
                const title = ev.name || ev.title || 'Onbekend';
                const timeRange = ev.scheduleStartTime && ev.scheduleEndTime
                    ? `${ev.scheduleStartTime} – ${ev.scheduleEndTime}`
                    : (ev.startDate && ev.endDate ? `${this.formatTime(ev.startDate)} – ${this.formatTime(ev.endDate)}` : '–');
                return `<label class="print-filter-item"><input type="checkbox" data-index="${i}" checked> <span class="print-filter-venue">${escape(venueName)}</span> · <span class="print-filter-name">${escape(title)}</span> <span class="print-filter-time">${escape(timeRange)}</span></label>`;
            }).join('');

            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.setAttribute('id', 'printFilterModal');
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 520px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-filter"></i> ${escape(this.t('techPrint.filterTitle'))}</h2>
                        <button class="modal-close" id="closePrintFilter" type="button"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <p class="print-filter-hint">${escape(this.t('techPrint.filterHint'))}</p>
                        <div class="print-filter-actions">
                            <button type="button" class="btn btn-secondary btn-sm" id="printFilterSelectAll">${escape(this.t('techPrint.selectAll'))}</button>
                            <button type="button" class="btn btn-secondary btn-sm" id="printFilterDeselectAll">${escape(this.t('techPrint.deselectAll'))}</button>
                        </div>
                        <div class="print-filter-list">${listItems}</div>
                    </div>
                    <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" id="printFilterCancel">${escape(this.t('date.cancel'))}</button>
                        <button type="button" class="btn btn-primary" id="printFilterPrint"><i class="fas fa-print"></i> ${this.locale === 'en' ? 'Print' : 'Printen'}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeFilterModal = () => {
                if (modal.parentNode) document.body.removeChild(modal);
            };

            modal.querySelector('#closePrintFilter').addEventListener('click', closeFilterModal);
            modal.querySelector('#printFilterCancel').addEventListener('click', closeFilterModal);
            modal.addEventListener('click', (e) => { if (e.target === modal) closeFilterModal(); });

            modal.querySelector('#printFilterSelectAll').addEventListener('click', () => {
                modal.querySelectorAll('input[type="checkbox"][data-index]').forEach(cb => { cb.checked = true; });
            });
            modal.querySelector('#printFilterDeselectAll').addEventListener('click', () => {
                modal.querySelectorAll('input[type="checkbox"][data-index]').forEach(cb => { cb.checked = false; });
            });

            modal.querySelector('#printFilterPrint').addEventListener('click', () => {
                const checked = Array.from(modal.querySelectorAll('input[type="checkbox"][data-index]:checked'))
                    .map(cb => parseInt(cb.getAttribute('data-index'), 10));
                const selectedEvents = events.filter((_, i) => checked.includes(i));
                closeFilterModal();
                if (selectedEvents.length === 0) {
                    this.showError('yesplan', this.t('techPrint.noEvents'));
                    return;
                }
                this.openTechOverviewPrintWindow(selectedEvents);
            });
        } catch (err) {
            console.error('Technisch overzicht printen:', err);
            this.showError('yesplan', this.t('errors.yesplanLoad'));
        }
    }

    /** Opent het printvenster met alleen de gegeven evenementen (na filter in modal). */
    openTechOverviewPrintWindow(events) {
        const date = this.selectedDate || new Date();
        date.setHours(0, 0, 0, 0);
        const dateLabel = date.toLocaleDateString(this.locale === 'en' ? 'en-GB' : 'nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const escape = (s) => this.escapeHtml(String(s || ''));

        const byVenue = {};
        events.forEach(ev => {
            const venueName = ev.venue || this.getVenueNameById(ev.venueIds?.[0]) || this.t('venue.unknownVenue');
            if (!byVenue[venueName]) byVenue[venueName] = [];
            byVenue[venueName].push(ev);
        });
        const venueOrder = Object.keys(byVenue).sort((a, b) => a.localeCompare(b));

        const eventBlock = (event) => {
            const title = event.name || event.title || 'Onbekend';
            const timeRange = event.scheduleStartTime && event.scheduleEndTime
                ? `${event.scheduleStartTime} – ${event.scheduleEndTime}`
                : (event.startDate && event.endDate ? `${this.formatTime(event.startDate)} – ${this.formatTime(event.endDate)}` : '–');
            const eventVenueId = event._organizationId && event.venueIds?.[0] ? `${event._organizationId}:${event.venueIds[0]}` : event.venueIds?.[0];
            const { showBalletvloer, showVleugel, showOrkestbak } = this.getBalletvloerVleugelDisplay(event.venue, eventVenueId);
            const parts = [];
            if (this.shouldShowTechnicalPartForEvent(event, 'balletvloer', showBalletvloer)) parts.push(`Balletvloer: ${event.balletvloerExplicit ? (event.hasBalletvloer ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend')}`);
            if (this.shouldShowTechnicalPartForEvent(event, 'vleugel', showVleugel)) parts.push(`Vleugel: ${event.vleugelExplicit ? (event.hasVleugel ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend')}`);
            if (this.shouldShowTechnicalPartForEvent(event, 'orkestbak', showOrkestbak)) parts.push(`Orkestbak: ${(event.orkestbakExplicit || event.orkestbakValue) ? (event.orkestbakValue || (event.hasOrkestbak ? this.t('resources.ja') : this.t('resources.nee'))) : this.t('resources.nietBekend')}`);
            const resourcesLine = parts.length ? parts.join(' · ') : '';
            const materials = (event.technicalMaterialResources || []).map(m => escape(m)).join(', ');
            const docs = (event.technicalListDocuments || []).map(doc => {
                const urlParts = (doc.url || '').split('/');
                const name = decodeURIComponent(urlParts[urlParts.length - 1] || doc.name || 'Document').replace(/%20/g, ' ');
                return name.endsWith('.pdf') ? name.replace('.pdf', '') : name;
            }).join(', ');
            const rider = event.riderAttachment && !(event.technicalListDocuments || []).length && event.riderAttachment.url
                ? decodeURIComponent((event.riderAttachment.url.split('/').pop() || '').replace(/%20/g, ' ')).replace(/\.pdf$/, '') : '';
            const docList = docs || rider || '';
            const remarks = (event.technicalRemarks || '').trim();
            return `<div class="print-event">
                <div class="print-event-title">${escape(title)}</div>
                <div class="print-event-meta">${this.t('techPrint.time')}: ${timeRange}</div>
                ${resourcesLine ? `<div class="print-event-resources">${escape(resourcesLine)}</div>` : ''}
                ${materials ? `<div class="print-event-materials">${this.t('tech.materiaal')} ${materials}</div>` : ''}
                ${docList ? `<div class="print-event-docs">${this.t('techPrint.documents')}: ${escape(docList)}</div>` : ''}
                ${remarks ? `<div class="print-event-remarks">${this.t('techPrint.remarks')}: ${escape(remarks)}</div>` : ''}
            </div>`;
        };

        const bodyParts = venueOrder.map(venueName => {
            const venueEvents = byVenue[venueName];
            const eventsHtml = venueEvents.map(ev => eventBlock(ev)).join('');
            return `<section class="print-venue"><h2 class="print-venue-title">${escape(venueName)}</h2>${eventsHtml}</section>`;
        });

        const printCss = `
            @media print { body { background: #fff; color: #111; } .print-venue { page-break-inside: avoid; } }
            body { font-family: 'Inter', sans-serif; background: #fff; color: #111; max-width: 800px; margin: 0 auto; padding: 24px; font-size: 14px; }
            .print-header { margin-bottom: 24px; border-bottom: 2px solid #333; padding-bottom: 12px; }
            .print-header h1 { margin: 0 0 4px 0; font-size: 22px; }
            .print-header .subtitle { color: #444; font-size: 15px; }
            .print-venue { margin-bottom: 24px; }
            .print-venue-title { font-size: 16px; margin: 0 0 12px 0; color: #222; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
            .print-event { margin-bottom: 16px; padding: 12px; background: #f8f8f8; border-radius: 6px; border-left: 4px solid #6366f1; }
            .print-event-title { font-weight: 600; margin-bottom: 6px; }
            .print-event-meta, .print-event-resources, .print-event-materials, .print-event-docs, .print-event-remarks { font-size: 13px; margin-top: 4px; color: #333; }
        `;
        const printBtnLabel = this.locale === 'en' ? 'Print' : 'Printen';
        const html = `<!DOCTYPE html><html lang="${this.locale}"><head><meta charset="UTF-8"><title>${escape(this.t('techPrint.title'))}</title><style>${printCss}
            .print-actions { margin: 24px 0; padding: 12px 0; border-bottom: 1px solid #ddd; display: flex; gap: 12px; align-items: center; }
            .print-actions .btn-print { padding: 10px 20px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500; }
            .print-actions .btn-print:hover { background: #4f46e5; }
            .print-actions .btn-close { padding: 10px 20px; background: #6b7280; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
            .print-actions .btn-close:hover { background: #4b5563; }
            @media print { .print-actions { display: none !important; } }
        </style></head><body>
            <div class="print-header">
                <h1>${escape(this.t('techPrint.title'))}</h1>
                <div class="subtitle">${escape(this.t('techPrint.subtitle', { date: dateLabel }))}</div>
            </div>
            <div class="print-actions">
                <button type="button" class="btn-print" onclick="window.print();">${escape(printBtnLabel)}</button>
                <button type="button" class="btn-close" onclick="window.close();">${this.locale === 'en' ? 'Close' : 'Sluiten'}</button>
            </div>
            ${bodyParts.join('')}
        </body></html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const printWin = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        URL.revokeObjectURL(blobUrl);
        if (printWin) printWin.focus();
    }

    updateUurwerkDisplay(data) {
        const container = document.getElementById('uurwerkContent');
        const noPlanningMsg = `<div class="info-message">${this.t('messages.noPlanning')}</div>`;
        if (!container) return;
        if (!data || !data.data) {
            container.innerHTML = noPlanningMsg;
            return;
        }
        const urenInfo = data.data;
        const hasAny = Object.values(urenInfo || {}).some((v) => Array.isArray(v) && v.length > 0);
        if (!hasAny) {
            container.innerHTML = noPlanningMsg;
            return;
        }

        const extractNameAndTime = (entry) => {
            const s = String(entry || '').trim();
            if (!s) return null;
            const parts = s.split(/\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);
            if (parts.length < 2) return null;
            const looksLikeDate = (t) => /^\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|nov|dec)[a-z]*\s*[\d:\-\s]*$/i.test(String(t).trim()) || /^\d{1,2}:\d{2}/.test(String(t).trim());
            const looksLikeVenueRole = (t) => {
                const u = String(t).trim().toUpperCase();
                return /\d+\s*man\b/.test(u) || /^(mcgz|wtpy|dkw|mckz|wtso|mkvk)\b/.test(u) || /^techniek\s+algemeen$/i.test(u) || /^techniek$/i.test(u) || u.length < 3;
            };
            const looksLikeName = (p) => /^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(p) && p.length > 2 && !looksLikeVenueRole(p) && !looksLikeDate(p);
            const last = parts[parts.length - 1];
            if (!looksLikeDate(last)) return null;
            const name = parts[parts.length - 2];
            if (!looksLikeName(name)) return null;
            return { name, time: timeOnly(last) };
        };

        const isVenueRoleOnly = (entry) => {
            const s = String(entry).trim();
            return /\d+\s*man\b/i.test(s) && /techniek\s+algemeen/i.test(s) && !/[A-Za-z\u00C0-\u024F]{2,}\s+[A-Za-z\u00C0-\u024F]{2,}/.test(s);
        };

        const timeOnly = (t) => String(t || '').replace(/^\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|oktober|nov|dec)[a-z]*\s+/i, '').trim() || t;

        const fallbackParse = (entry) => {
            const s = String(entry).trim();
            const parts = s.split(/\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 4) {
                const timePart = parts[parts.length - 1];
                const namePart = parts[parts.length - 2];
                if (/\d{1,2}\s+(jan|feb|maa|mrt|maart|apr|mei|jun|jul|aug|sep|okt|nov|dec)/i.test(timePart) && namePart.length > 2) {
                    return { name: namePart, time: timeOnly(timePart) };
                }
            }
            return null;
        };

        const cleanRawPersonnelEntry = (entry) => {
            const parts = String(entry || '').split(/\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);
            if (!parts.length) return '';
            const isNoise = (p) => {
                const s = p.toLowerCase();
                return /^\d+\./.test(s) ||
                    /(wtpy|mcgz|dkw|mckz|wtso|mkvk)/.test(s) ||
                    /(techniek algemeen|hoofd publieksservice|receptie\/kassa|receptie|kassa)/.test(s) ||
                    /\d+\s*man\b/.test(s) ||
                    /<\s*\d+/.test(s);
            };
            const filtered = parts.filter(p => !isNoise(p));
            return (filtered.length ? filtered : parts).join(' - ').trim();
        };

        const isClearlyNonPersonnelText = (entry) => {
            const s = String(entry || '').trim();
            if (!s) return true;
            const lower = s.toLowerCase();
            const hasTime = /\b\d{1,2}:\d{2}\b/.test(s);
            const isStatusOnly = /^(yes|no|on|off|ja|nee|true|false|nvt|n\.v\.t\.)$/i.test(s);
            if (isStatusOnly) return true;
            if (/^[a-z0-9_\s]+[:\-]\s*(yes|no|on|off|ja|nee|true|false)\s*$/i.test(lower)) return true;
            const blockedPhrases = [
                'opmerkingen techniek',
                'verder hebben we nodig',
                'we nemen zelf',
                'er komt geen technicus',
                'gemaild',
                'microfoon',
                'headset',
                'drumstel',
                'viool',
                'trompet',
                'stoel',
                'poef'
            ];
            if (blockedPhrases.some(p => lower.includes(p))) return true;
            // Genummerde lijst zonder tijd is meestal opmerkingstekst.
            // Echte personeelsregels kunnen ook met "1." starten, maar bevatten dan doorgaans een tijd.
            if (/^\d+\./.test(lower) && !hasTime) return true;
            if (/:/.test(s) && !hasTime) return true; // zinnen met labels, geen planningstijd
            if (s.split(/\s+/).length > 6 && !hasTime) return true; // lange zinnen zijn vrijwel nooit personeelsregels
            return false;
        };

        const isLikelyPersonName = (value) => {
            const raw = String(value || '').trim();
            if (!raw) return false;
            if (raw.length > 60) return false;
            if (/[0-9]/.test(raw)) return false;
            if (/[,:;()[\]{}]/.test(raw)) return false;
            if (/\b\d{1,2}:\d{2}\b/.test(raw)) return false;
            const tokens = raw.split(/\s+/).filter(Boolean);
            if (tokens.length < 1 || tokens.length > 4) return false;
            const lowerJoin = tokens.join(' ').toLowerCase();
            if (/\b(stage|show|soundcheck|doors|curfew|start|stop|set\s?up|setup|changeover|diner)\b/i.test(lowerJoin)) return false;

            const particles = new Set(['de', 'den', 'der', 'van', 'von', 'ten', 'ter', 'la', 'le', 'du']);
            const isNameToken = (token) => {
                const t = token.replace(/[.'-]/g, '');
                if (!t) return false;
                if (particles.has(t.toLowerCase())) return true;
                if (/^[A-Z]{2,4}$/.test(t)) return true; // DJ, FOH, etc.
                return /^[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ]+$/.test(t);
            };
            return tokens.every(isNameToken);
        };

        const isLikelySimplePersonnelRaw = (raw) => {
            const s = String(raw || '').trim();
            if (!s) return false;
            if (isClearlyNonPersonnelText(s)) return false;
            // Alleen korte waarden die echt op een persoonsnaam lijken.
            return isLikelyPersonName(s);
        };

        const toDisplayNameTimePairs = (entries) => {
            const pairs = entries.map((e) => {
                if (isClearlyNonPersonnelText(e)) return null;
                const parsed = extractNameAndTime(e) || fallbackParse(e);
                if (parsed) return parsed;
                const raw = cleanRawPersonnelEntry(e);
                if (isLikelySimplePersonnelRaw(raw)) return { name: raw, time: '' };
                // Fallback: regel met diensttijd maar afwijkend formaat (vaak horeca/FO)
                const full = String(e || '').trim();
                const hasTime = /\b\d{1,2}:\d{2}\b/.test(full);
                if (hasTime && full.length <= 220 && full.split(/\s+/).length <= 25) {
                    return { name: full, time: '' };
                }
                return null;
            }).filter(Boolean);
            if (pairs.length === 0) return [];
            const seen = new Set();
            const uniq = [];
            for (const p of pairs) {
                const key = `${p.name}|${p.time}`;
                if (!seen.has(key)) { seen.add(key); uniq.push(p); }
            }
            return uniq;
        };

        // Filter vrijwilligers + technische-opmerking-regels eruit.
        // Die opmerking-velden zitten soms in dezelfde urenInfo.techniek lijst en anders worden ze als "techniek" zichtbaar.
        const isTechnicalRemarksLine = (entry) => {
            const s = String(entry || '').trim();
            if (!s) return false;
            const lower = s.toLowerCase();
            return (
                lower === 'opmerkingen techniek' ||
                lower === 'opmerkingentechniek' ||
                lower.includes('opmerkingen techniek') ||
                lower.includes('opmerkingentechniek') ||
                lower.includes('productie_technischelijst_opmerkingentechniek')
            );
        };

        const normalizeCategoryKey = (key) => String(key || '').trim();
        const getCategoryLabel = (key) => {
            if (key === 'techniek') return this.t('personnel.techniek');
            if (key === 'horeca') return this.t('personnel.horeca');
            if (key === 'frontOffice') return this.t('personnel.frontOffice');
            if (key === 'nostradamus') return 'Nostradamus';
            const k = String(key || '').replace(/[_-]+/g, ' ').trim();
            if (!k) return 'Overig';
            return k.charAt(0).toUpperCase() + k.slice(1);
        };
        const categoryOrderRank = (key) => {
            if (key === 'techniek') return 0;
            if (key === 'horeca') return 1;
            if (key === 'frontOffice') return 2;
            if (key === 'nostradamus') return 3;
            return 10;
        };
        const categoryEntries = Object.entries(urenInfo || {})
            .filter(([, entries]) => Array.isArray(entries))
            .map(([key, entries]) => {
                const filtered = entries.filter((entry) => {
                    const entryUpper = String(entry || '').toUpperCase();
                    if (isTechnicalRemarksLine(entry)) return false;
                    return !entryUpper.includes('VRIJWILLIGER') && !entryUpper.includes('VOLUNTEER');
                });
                return {
                    key: normalizeCategoryKey(key),
                    label: getCategoryLabel(key),
                    display: toDisplayNameTimePairs(filtered)
                };
            })
            .filter((c) => c.display.length > 0)
            .sort((a, b) => {
                const r = categoryOrderRank(a.key) - categoryOrderRank(b.key);
                if (r !== 0) return r;
                return a.label.localeCompare(b.label, this.locale === 'en' ? 'en' : 'nl', { sensitivity: 'base' });
            });
        if (!categoryEntries.length) {
            container.innerHTML = noPlanningMsg;
            return;
        }
        const validFilter = this.personnelCategoryFilter && (this.personnelCategoryFilter === 'all' || categoryEntries.some((c) => c.key === this.personnelCategoryFilter));
        if (!validFilter) this.personnelCategoryFilter = 'all';

        const escInline = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const renderPersonnelRows = (pairs) => {
            if (!pairs.length) {
                return '<div style="padding: 0.5rem; background: #1a202c; border-radius: 4px; font-size: 0.85rem; color: #718096;">—</div>';
            }
            return pairs.map((p) => {
                const text = p.time ? `${p.name} – ${p.time}` : p.name;
                return `<div style="padding: 0.5rem; background: #1a202c; border-radius: 4px; font-size: 0.85rem; color: #a0aec0;">${escInline(text)}</div>`;
            }).join('');
        };
        const buildNostradamusGroups = (pairs) => {
            const groups = new Map();
            const pushUnique = (role, person) => {
                const r = String(role || '').trim() || 'Overig';
                const p = String(person || '').trim();
                if (!p) return;
                const arr = groups.get(r) || [];
                if (!arr.some((x) => x.toLowerCase() === p.toLowerCase())) arr.push(p);
                groups.set(r, arr);
            };
            pairs.forEach((pair) => {
                const text = String(pair?.time ? `${pair.name} – ${pair.time}` : pair?.name || '').trim();
                if (!text) return;
                const parts = text.split('|').map((x) => x.trim()).filter(Boolean);
                if (parts.length >= 2) {
                    pushUnique(parts[0], parts[1]);
                    return;
                }
                pushUnique('Overig', text);
            });
            return [...groups.entries()];
        };
        const renderNostradamusByRole = (groups) => {
            if (!groups.length) return renderPersonnelRows([]);
            const filter = this.nostradamusRoleFilter || 'all';
            const visibleGroups = filter === 'all'
                ? groups
                : groups.filter(([role]) => String(role) === filter);
            if (!visibleGroups.length) return renderPersonnelRows([]);
            return visibleGroups.map(([role, names]) => `
                <div style="padding: 0.6rem; background: rgba(15, 23, 42, 0.45); border: 1px solid #334155; border-radius: 8px;">
                    <div style="font-size: 0.9rem; color: #c7d2fe; font-weight: 600; margin-bottom: 0.4rem;">${escInline(role)}</div>
                    <div style="display:flex; flex-direction:column; gap:0.35rem;">
                        ${names.map((n) => `<div style="padding: 0.45rem 0.55rem; background: #1a202c; border-radius: 6px; font-size: 0.84rem; color: #a0aec0;">${escInline(n)}</div>`).join('')}
                    </div>
                </div>
            `).join('');
        };
        const filterButtonsHtml = [
            `<button type="button" class="personnel-filter-btn${this.personnelCategoryFilter === 'all' ? ' active' : ''}" data-personnel-filter="all">Alles</button>`,
            ...categoryEntries.map((c) => `<button type="button" class="personnel-filter-btn${this.personnelCategoryFilter === c.key ? ' active' : ''}" data-personnel-filter="${this.escapeHtml(c.key)}">${this.escapeHtml(c.label)}</button>`)
        ].join('');
        const nostradamusEntry = categoryEntries.find((c) => c.key === 'nostradamus');
        const nostradamusGroups = nostradamusEntry ? buildNostradamusGroups(nostradamusEntry.display) : [];
        const nostradamusRoleOptionsRaw = nostradamusGroups.map(([role]) => String(role)).filter(Boolean);
        const nostradamusRoleOptions = this.getOrderedNostradamusRoles(nostradamusRoleOptionsRaw);
        if (this.nostradamusRoleFilter !== 'all' && !nostradamusRoleOptions.includes(this.nostradamusRoleFilter)) {
            this.nostradamusRoleFilter = 'all';
        }
        const showRoleFilterRow = nostradamusRoleOptions.length > 1 &&
            (this.personnelCategoryFilter === 'all' || this.personnelCategoryFilter === 'nostradamus');
        const roleFilterButtonsHtml = showRoleFilterRow
            ? [
                `<button type="button" class="personnel-filter-btn${this.nostradamusRoleFilter === 'all' ? ' active' : ''}" data-nostradamus-role="all">Alle functies</button>`,
                ...nostradamusRoleOptions.map((role) => `<button type="button" class="personnel-filter-btn personnel-filter-btn--draggable${this.nostradamusRoleFilter === role ? ' active' : ''}" data-nostradamus-role="${this.escapeHtml(role)}" data-nostradamus-role-draggable="${this.escapeHtml(role)}" draggable="true">${this.escapeHtml(role)}</button>`)
            ].join('')
            : '';
        const filterRowsHiddenStyle = this.personnelFiltersCollapsed ? 'display:none;' : '';
        const blocksHtml = categoryEntries.map((c) => `
                <div class="data-item personnel-category-block" data-personnel-cat="${this.escapeHtml(c.key)}" style="margin-bottom: 1.5rem;${this.personnelCategoryFilter !== 'all' && this.personnelCategoryFilter !== c.key ? ' display:none;' : ''}">
                    <h4 style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                        ${this.escapeHtml(c.label)}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${c.key === 'nostradamus' ? renderNostradamusByRole(nostradamusGroups) : renderPersonnelRows(c.display)}
                    </div>
                </div>
        `).join('');
        container.innerHTML = `
            <div class="shifts-list">
                <div class="data-item" data-personnel-filter-row="category" style="margin-bottom: 1rem; ${filterRowsHiddenStyle}">
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        ${filterButtonsHtml}
                    </div>
                </div>
                ${showRoleFilterRow ? `
                <div class="data-item" data-personnel-filter-row="role" style="margin-bottom: 1rem; ${filterRowsHiddenStyle}">
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                        ${roleFilterButtonsHtml}
                    </div>
                </div>` : ''}
                ${blocksHtml}
            </div>
        `;
        this.updatePersonnelFilterToggleState();
        container.querySelectorAll('[data-personnel-filter]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = String(btn.dataset.personnelFilter || 'all');
                this.personnelCategoryFilter = next || 'all';
                this.updateUurwerkDisplay({ success: true, data: urenInfo, timestamp: new Date().toISOString() });
            });
        });
        container.querySelectorAll('[data-nostradamus-role]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (this._nostradamusRoleDragMoved) {
                    this._nostradamusRoleDragMoved = false;
                    return;
                }
                const role = String(btn.getAttribute('data-nostradamus-role') || 'all');
                this.nostradamusRoleFilter = role || 'all';
                this.updateUurwerkDisplay({ success: true, data: urenInfo, timestamp: new Date().toISOString() });
            });
        });
        const draggableRoleButtons = Array.from(container.querySelectorAll('[data-nostradamus-role-draggable]'));
        draggableRoleButtons.forEach((btn) => {
            btn.addEventListener('dragstart', (e) => {
                const role = String(btn.getAttribute('data-nostradamus-role-draggable') || '').trim();
                if (!role) return;
                this._nostradamusRoleDragMoved = false;
                btn.classList.add('personnel-filter-btn--dragging');
                e.dataTransfer?.setData('text/plain', role);
                if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
            });
            btn.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            });
            btn.addEventListener('drop', async (e) => {
                e.preventDefault();
                const sourceRole = String(e.dataTransfer?.getData('text/plain') || '').trim();
                const targetRole = String(btn.getAttribute('data-nostradamus-role-draggable') || '').trim();
                if (!sourceRole || !targetRole || sourceRole === targetRole) return;
                const nextOrder = [...nostradamusRoleOptions];
                const from = nextOrder.indexOf(sourceRole);
                const to = nextOrder.indexOf(targetRole);
                if (from < 0 || to < 0) return;
                nextOrder.splice(from, 1);
                nextOrder.splice(to, 0, sourceRole);
                this._nostradamusRoleDragMoved = true;
                await this.saveNostradamusRoleOrder(nextOrder);
                this.updateUurwerkDisplay({ success: true, data: urenInfo, timestamp: new Date().toISOString() });
            });
            btn.addEventListener('dragend', () => {
                btn.classList.remove('personnel-filter-btn--dragging');
                setTimeout(() => { this._nostradamusRoleDragMoved = false; }, 0);
            });
        });
    }

    /**
     * Itix / tickets: basis-URL uit instellingen + Yesplan-event-id voor zaalplattegrond-link.
     * baseURL zonder slash aan het einde; er wordt /{eventId} toegevoegd.
     */
    getItixSeatingPlanBaseURLForOrg(orgId) {
        const orgNum = orgId === 2 ? 2 : 1;
        const legacy = String(this.config?.itix?.baseURL || '').trim();
        if (orgNum === 2) return String(this.config?.itix?.baseURL2 || '').trim();
        return String(this.config?.itix?.baseURL1 || legacy || '').trim();
    }

    getVenueOrgFromId(venueId) {
        const raw = String(venueId || '').trim();
        if (!raw) return 1;
        if (raw.includes(':')) {
            const orgPart = raw.split(':')[0];
            return String(orgPart).trim() === '2' ? 2 : 1;
        }
        const venues = Array.isArray(this.availableVenues) ? this.availableVenues : [];
        const exact = venues.find((v) => String(v.id || '').trim() === raw);
        if (exact?._organizationId != null) {
            return String(exact._organizationId).trim() === '2' ? 2 : 1;
        }
        const bySuffix = venues.find((v) => String(v.id || '').split(':').pop() === raw);
        if (bySuffix?._organizationId != null) {
            return String(bySuffix._organizationId).trim() === '2' ? 2 : 1;
        }
        // Fallback: als deze sessie op org 2 staat en venues geen _organizationId dragen,
        // behandel ongeprefixte ids als org 2.
        const activeOrg = this.config?.app?.activeYesplanOrg;
        if (activeOrg === 2) return 2;
        return 1;
    }

    hasItixBaseURLForVenue(venueId) {
        const orgNum = this.getVenueOrgFromId(venueId);
        return !!this.getItixSeatingPlanBaseURLForOrg(orgNum);
    }

    getItixSeatingPlanUrl(eventId, orgId = 1) {
        const baseURL = this.getItixSeatingPlanBaseURLForOrg(orgId);
        if (typeof window !== 'undefined' && typeof window.buildItixSeatingPlanUrl === 'function') {
            return window.buildItixSeatingPlanUrl(baseURL, eventId);
        }
        const base = String(baseURL || '').trim().replace(/\/+$/, '');
        if (!base || eventId == null || eventId === '') return '';
        return `${base}/${encodeURIComponent(String(eventId))}`;
    }

    async updateItixDisplay(data) {
        const container = document.getElementById('itixContent');
        
        if (!container) {
            console.error('itixContent container niet gevonden');
            return;
        }
        
        // Haal verkoopdata uit Yesplan als beschikbaar
        const yesplanData = this.data.yesplan;
        const yesplanEventsRaw = (yesplanData && yesplanData.success && yesplanData.data) ? yesplanData.data : [];
        // Zelfde volgorde als Yesplan-kaart: zaalvolgorde (instellingen), binnen zaal op starttijd — geen willekeurige API-volgorde.
        const yesplanEvents = [...yesplanEventsRaw].sort((a, b) => this.sortEventByDefault(a, b));
        
        const escapeInline = (value) => String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        // Als er Yesplan verkoopdata is, toon die (met reserveringen uit Yesplan).
        if (yesplanEvents.length > 0) {
            // Verkoop: per Yesplan-event één blok (eigen verkocht / gereserveerd / capaciteit / totaal).
            // Bij 2+ voorstellingen op dezelfde dag (zelfde zaal of niet) zie je bewust verschillende
            // aantallen per event — data komt per event uit Yesplan + reserveringen gefilterd op eventId.
            // Geen apart "overall"-blok onderaan: bij 1 event was dat een dubbele weergave van dezelfde cijfers.

            const isDetailSingleEvent = this.currentView === 'detail' && yesplanEvents.length === 1;

            container.innerHTML = `
                <div class="events-list" style="margin-bottom: 1rem;">
                    ${await Promise.all(yesplanEvents.map(async (event) => {
                        // Format titel met uitvoerende (niet tonen als 1 event in detail – staat in mastertitel)
                        let title = this.buildEventDisplayTitle(event.title, event.performer);
                        
                        // Tijd range (niet tonen als 1 event in detail – staat in Yesplan card)
                        let timeRange = '';
                        if (!isDetailSingleEvent) {
                            if (event.scheduleStartTime && event.scheduleEndTime) {
                                timeRange = `${event.scheduleStartTime} - ${event.scheduleEndTime}`;
                            } else {
                                const startTime = event.startDate ? this.formatTime(event.startDate) : 'Onbekend';
                                const endTime = event.endDate ? this.formatTime(event.endDate) : 'Onbekend';
                                timeRange = `${startTime} - ${endTime}`;
                            }
                        }
                        
                        // Verkoopstanden (per voorstelling/event).
                        const sold = event.soldTickets || 0;
                        const capacity = event.capacity || 0;
                        const reserved = event.ticketsReserved || 0;
                        
                        const reservedCount = reserved;
                        const gasten = event.aantalGasten || 0;
                        const totaal = sold + reservedCount + gasten;
                        
                        // Itix-zaalplattegrond: uitvoeringsnummer uit ticketing-koppeling, niet Yesplan event.id (te lang).
                        let seatingPlanId = '';
                        if (typeof window !== 'undefined' && typeof window.pickItixSeatingPlanEventId === 'function') {
                            seatingPlanId = window.pickItixSeatingPlanEventId(event);
                        } else {
                            const t = (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : '');
                            seatingPlanId = t(event.ticketingId) || t(event.rawEvent?.ticketing?.id) || t(event.eventId) || t(event.id);
                        }
                        
                        const primaryVenueId = Array.isArray(event.venueIds) && event.venueIds.length > 0 ? event.venueIds[0] : null;
                        const displayOptions = this.getBalletvloerVleugelDisplay(event.venue, primaryVenueId);
                        const showSeatingPlan = displayOptions?.showZaalplattegrond !== false;
                        let seatingPlanBlock = '';
                        if (showSeatingPlan) {
                            const eventOrgId = event?._organizationId === 2 ? 2 : 1;
                            if (seatingPlanId) {
                                const seatingPlanUrl = this.getItixSeatingPlanUrl(seatingPlanId, eventOrgId);
                                if (seatingPlanUrl) {
                                    const escapedPlanUrl = escapeInline(seatingPlanUrl);
                                    const seatingPlanHtml = `
                                    <a href="#" class="rider-link"
                                       data-rider-url="${escapedPlanUrl}"
                                       style="color: #818cf8; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(129, 140, 248, 0.1); border-radius: 4px; transition: all 0.2s; cursor: pointer;">
                                        <i class="fas fa-external-link-alt"></i>
                                        <span>${this.escapeHtml(this.t('cards.openSeatingPlan'))}</span>
                                    </a>
                                `;
                                    seatingPlanBlock = `
                                        <div>
                                            <h4 style="margin-bottom: 0.5rem; margin-top: 0; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                                                ${this.escapeHtml(this.t('cards.seatingPlan'))}
                                            </h4>
                                            ${seatingPlanHtml}
                                        </div>
                                    `;
                                }
                            }
                        }
                        
                        return `
                            <div class="data-item">
                                ${!isDetailSingleEvent ? `<h4>${escapeInline(title)}</h4>
                                <p><i class="fas fa-clock"></i> <strong>${timeRange}</strong></p>` : ''}

                                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: ${!isDetailSingleEvent ? '0.25rem' : '0.5rem'};">
                                    <div style="display: flex; gap: 1rem; flex-wrap: nowrap;">
                                        <div class="data-stat" style="flex: 1; min-width: 0;">
                                            <div class="data-stat-value">${sold}</div>
                                            <div class="data-stat-label">${this.t('dataStats.verkocht')}</div>
                                        </div>
                                        <div class="data-stat" style="flex: 1; min-width: 0;">
                                            <div class="data-stat-value">${reservedCount}</div>
                                            <div class="data-stat-label">${this.t('dataStats.gereserveerd')}</div>
                                        </div>
                                        <div class="data-stat" style="flex: 1; min-width: 0;">
                                            <div class="data-stat-value">${gasten > 0 ? gasten : '--'}</div>
                                            <div class="data-stat-label">${this.t('dataStats.gasten')}</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: nowrap;">
                                        <div class="data-stat" style="flex: 0 0 auto; min-width: 200px;">
                                            <div class="data-stat-value">${capacity > 0 ? capacity : '--'}</div>
                                            <div class="data-stat-label">${this.t('dataStats.capaciteit')}</div>
                                        </div>
                                        <div class="data-stat" style="flex: 0 0 auto; min-width: 200px;">
                                            <div class="data-stat-value">${totaal}</div>
                                            <div class="data-stat-label">${this.t('dataStats.totaal')}</div>
                                        </div>
                                    </div>

                                    ${seatingPlanBlock}
                                </div>
                            </div>
                        `;
                    }))}
                </div>
            `;
            this.setupRiderLinkHandlers(container);
            return;
        }

        container.innerHTML = `<div class="info-message">${this.t('messages.noVerkoop')}</div>`;
    }

    updatePrivaDisplay(data) {
        const container = document.getElementById('privaContent');
        
        if (!data.success || !data.data) {
            container.innerHTML = `<div class="info-message">${this.t('messages.noKlimaat')}</div>`;
            return;
        }

        const climate = data.data;
        
        container.innerHTML = `
            <div class="data-grid">
                <div class="data-stat">
                    <div class="data-stat-value">${climate.temperature || '--'}°C</div>
                    <div class="data-stat-label">${this.t('dataStats.temp')}</div>
                </div>
                <div class="data-stat">
                    <div class="data-stat-value">${climate.humidity || '--'}%</div>
                    <div class="data-stat-label">${this.t('dataStats.luchtvochtigheid')}</div>
                </div>
                <div class="data-stat">
                    <div class="data-stat-value">${climate.airQuality || '--'}</div>
                    <div class="data-stat-label">${this.t('dataStats.luchtkwaliteit')}</div>
                </div>
                <div class="data-stat">
                    <div class="data-stat-value">${climate.co2 || '--'} ppm</div>
                    <div class="data-stat-label">${this.t('dataStats.co2')}</div>
                </div>
            </div>
            <div class="climate-info">
                <div class="data-item">
                    <h4>Huidige Status</h4>
                    <p><i class="fas fa-thermometer-half"></i> Temperatuur: ${climate.temperature || 'Onbekend'}°C</p>
                    <p><i class="fas fa-tint"></i> Luchtvochtigheid: ${climate.humidity || 'Onbekend'}%</p>
                    <p><i class="fas fa-wind"></i> Ventilatie: ${climate.ventilation || 'Onbekend'}</p>
                    <p><i class="fas fa-clock"></i> Laatste update: ${climate.lastUpdate || 'Onbekend'}</p>
                </div>
            </div>
        `;
    }

    setupOnlineStatus() {
        // Update status bij wijziging van internetverbinding
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (window.__SHIFT_HAPPENS_MOBILE__) void this.refreshApiServerStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            // Zet alle cards op offline
            this.updateAllCardsOffline();
        });
        
        // Check initial status
        this.isOnline = navigator.onLine;
        if (!this.isOnline) {
            this.updateAllCardsOffline();
        }
    }
    
    updateAllCardsOffline() {
        this.statusBySystem.yesplan = 'offline';
        if (window.__SHIFT_HAPPENS_MOBILE__ && this.getShiftHappensApiBase()) {
            this.statusBySystem.apiServer = 'offline';
        }
        this.updateMasterStatus();
    }

    /**
     * Zelfde normalisatie als api-mobile.js (Shift Happens API-basis-URL).
     */
    getShiftHappensApiBase() {
        if (!window.__SHIFT_HAPPENS_MOBILE__) return '';
        const raw = window.SHIFT_HAPPENS_API_BASE || localStorage.getItem('SHIFT_HAPPENS_API_BASE') || '';
        let t = String(raw || '').trim();
        if (!t) return '';
        if (!/^https?:\/\//i.test(t)) t = 'http://' + t;
        try {
            const u = new URL(t);
            const host = u.hostname.toLowerCase();
            if (host.indexOf('yesplan') !== -1) return '';
            const p = (u.pathname || '').toLowerCase();
            if (p.indexOf('zaalplattegrond') !== -1 || p.indexOf('uitvoeringinfo') !== -1) return '';
            const pathPart = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
            return u.origin + pathPart;
        } catch {
            return '';
        }
    }

    async refreshApiServerStatus() {
        if (!window.__SHIFT_HAPPENS_MOBILE__) {
            this.statusBySystem.apiServer = null;
            return;
        }
        const base = this.getShiftHappensApiBase();
        if (!base) {
            this.statusBySystem.apiServer = null;
            this.updateMasterStatus();
            return;
        }
        if (!this.isOnline) {
            this.statusBySystem.apiServer = 'offline';
            this.updateMasterStatus();
            return;
        }
        try {
            const url = `${base.replace(/\/$/, '')}/api/health`;
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 8000);
            const r = await fetch(url, { method: 'GET', cache: 'no-store', signal: ctrl.signal });
            clearTimeout(t);
            let j = {};
            try {
                j = await r.json();
            } catch {
                /* ignore */
            }
            this.statusBySystem.apiServer = r.ok && j && j.ok === true ? 'online' : 'offline';
        } catch {
            this.statusBySystem.apiServer = 'offline';
        }
        this.updateMasterStatus();
    }
    
    updateStatus(system, status) {
        if (!this.isOnline) status = 'offline';
        if (this.statusBySystem && system in this.statusBySystem) {
            this.statusBySystem[system] = status;
        }
        this.updateMasterStatus();
    }

    updateMasterStatus() {
        const sb = this.statusBySystem || {};
        const parts = [];
        if (sb.yesplan) parts.push(sb.yesplan);
        if (window.__SHIFT_HAPPENS_MOBILE__ && this.getShiftHappensApiBase() && sb.apiServer) {
            parts.push(sb.apiServer);
        }
        const onlineCount = parts.filter((s) => s === 'online').length;
        const aggregate = parts.length === 0 ? 'offline'
            : onlineCount === parts.length ? 'online'
            : onlineCount === 0 ? 'offline'
            : 'deels'; // Tussenstand: een deel werkt

        const masterEl = this.currentView === 'detail'
            ? document.getElementById('detailViewStatus')
            : this.currentView === 'week'
                ? document.getElementById('weekViewStatus')
                : this.currentView === 'home'
                    ? document.getElementById('homeViewStatus')
                    : null;
        if (!masterEl) return;

        const labels = { online: this.t('status.online'), deels: this.t('status.deels'), offline: this.t('status.offline'), warning: this.t('status.warning') };
        const indicator = masterEl.querySelector('.status-indicator');
        const textEl = masterEl.querySelector('.status-text');
        if (indicator) indicator.className = `status-indicator ${aggregate}`;
        if (textEl) textEl.textContent = labels[aggregate] || 'Offline';
        masterEl.className = `card-status status-${aggregate}`;
    }

    showStatusPopover(anchorEl) {
        const popover = document.getElementById('statusPopover');
        const content = document.getElementById('statusPopoverContent');
        if (!popover || !content) return;
        if (this._closeStatusPopover) this._closeStatusPopover();

        const renderContent = () => {
            const systems = [{ id: 'yesplan', label: 'Yesplan' }];
            if (window.__SHIFT_HAPPENS_MOBILE__) {
                systems.push({ id: 'apiServer', label: this.t('status.apiServerLabel') });
            }
            let html = '';
            for (const { id, label } of systems) {
                if (id === 'apiServer') {
                    const base = this.getShiftHappensApiBase();
                    if (!base) {
                        html += `<div class="status-popover-row"><span class="status-dot neutral"></span><span class="status-label">${label}</span><span class="status-value" style="color:#718096">${this.t('status.apiServerNotSet')}</span></div>`;
                    } else {
                        const st = this.statusBySystem?.apiServer;
                        const value = st === 'online'
                            ? this.t('status.online')
                            : st === 'offline'
                                ? this.t('status.offline')
                                : '–';
                        const dotClass = st === 'online' ? 'online' : st === 'offline' ? 'offline' : 'neutral';
                        const color = st === 'online' ? '#48bb78' : st === 'offline' ? '#f56565' : '#718096';
                        html += `<div class="status-popover-row"><span class="status-dot ${dotClass}"></span><span class="status-label">${label}</span><span class="status-value" style="color:${color}">${value}</span></div>`;
                    }
                    continue;
                }
                const status = this.statusBySystem?.[id] || null;
                const value = status === 'online' ? this.t('status.online') : status ? this.t('status.offline') : '–';
                const dotClass = status === 'online' ? 'online' : 'offline';
                html += `<div class="status-popover-row"><span class="status-dot ${dotClass}"></span><span class="status-label">${label}</span><span class="status-value" style="color:${status === 'online' ? '#48bb78' : status ? '#f56565' : '#718096'}">${value}</span></div>`;
            }
            content.innerHTML = html;
        };
        renderContent();
        void this.refreshApiServerStatus().then(() => {
            const p = document.getElementById('statusPopover');
            if (p && p.style.display === 'block') renderContent();
        });

        const placePopover = () => {
            const margin = 12;
            const gap = 8;
            const rect = anchorEl.getBoundingClientRect();

            // Gebruik client size i.p.v. inner* voor robuustheid bij fullscreen/visualViewport.
            const viewportW = window.visualViewport?.width || document.documentElement.clientWidth || window.innerWidth;
            const viewportH = window.visualViewport?.height || document.documentElement.clientHeight || window.innerHeight;

            let popRect = popover.getBoundingClientRect();
            // Soms kan width/height 0 zijn wanneer fonts nog net niet klaar zijn; re-meet.
            if (!popRect.width || !popRect.height) {
                const prevVis = popover.style.visibility;
                popover.style.visibility = 'visible';
                popRect = popover.getBoundingClientRect();
                popover.style.visibility = prevVis;
            }

            // X: clampen binnen viewport.
            let left = rect.left;
            const maxLeft = viewportW - popRect.width - margin;
            left = Math.min(Math.max(left, margin), maxLeft);

            // Y: onder anker, anders boven anker.
            let top = rect.bottom + gap;
            const maxTop = viewportH - popRect.height - margin;
            if (top > maxTop) top = rect.top - popRect.height - gap;
            top = Math.min(Math.max(top, margin), maxTop);

            popover.style.left = `${Math.round(left)}px`;
            popover.style.top = `${Math.round(top)}px`;
        };

        popover.style.display = 'block';
        popover.style.visibility = 'hidden';
        placePopover();
        popover.style.visibility = 'visible';

        const close = () => {
            popover.style.display = 'none';
            popover.style.visibility = '';
            document.removeEventListener('click', closeOutside);
            document.removeEventListener('keydown', closeOnEsc);
            window.removeEventListener('resize', placePopover);
            window.removeEventListener('scroll', placePopover, true);
            this._closeStatusPopover = null;
        };
        const closeOutside = (e) => {
            if (!popover.contains(e.target) && !anchorEl.contains(e.target)) close();
        };
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') close();
        };
        this._closeStatusPopover = close;
        window.addEventListener('resize', placePopover);
        window.addEventListener('scroll', placePopover, true);
        document.addEventListener('keydown', closeOnEsc);
        setTimeout(() => document.addEventListener('click', closeOutside), 0);
    }

    setupStatusPopover() {
        ['weekViewStatus', 'detailViewStatus', 'homeViewStatus'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', (e) => { e.stopPropagation(); this.showStatusPopover(el); });
        });
    }

    showError(system, message) {
        const container = document.getElementById(`${system}Content`);
        container.innerHTML = `<div class="info-message">${message}</div>`;
    }

    calculateTotalRevenue(events) {
        return events.reduce((total, event) => total + (event.revenue || 0), 0).toFixed(0);
    }

    async openSettings() {
        const timezoneModeSelect = document.getElementById('timezoneModeSelect');
        if (timezoneModeSelect && !timezoneModeSelect.dataset.boundTzMode) {
            timezoneModeSelect.addEventListener('change', () => this.handleTimezoneModeChanged());
            timezoneModeSelect.dataset.boundTzMode = '1';
        }
        const timezoneManualSelect = document.getElementById('timezoneManualSelect');
        if (timezoneManualSelect && !timezoneManualSelect.dataset.boundTzPick) {
            timezoneManualSelect.addEventListener('change', () => {
                this.refreshManualTimeInputFromSelectedTimezone();
            });
            timezoneManualSelect.dataset.boundTzPick = '1';
        }
        const manualTimeInput = document.getElementById('manualTimeInput');
        if (manualTimeInput && !manualTimeInput.dataset.boundManualTime) {
            manualTimeInput.addEventListener('input', () => {
                manualTimeInput.dataset.userEdited = '1';
            });
            manualTimeInput.dataset.boundManualTime = '1';
        }
        await this.refreshNetworkInterfaceOptions();
        this.populateSettingsForm();
        this.setupSettingsNavigation();
        this.activateSettingsPage(this.settingsPageKey || 'app-config');
        const modal = document.getElementById('settingsModal');
        const modalContent = modal?.querySelector('.modal-content');
        const modalBody = modal?.querySelector('.modal-body');
        if (modalContent) {
            // Houd het instellingenvenster altijd op een vaste hoogte voor consistente UX.
            modalContent.style.height = '90vh';
            modalContent.style.maxHeight = '90vh';
            modalContent.style.display = 'flex';
            modalContent.style.flexDirection = 'column';
        }
        if (modalBody) {
            modalBody.style.flex = '1';
            modalBody.style.maxHeight = 'none';
            modalBody.style.minHeight = '0';
        }
        document.getElementById('settingsModal').classList.add('show');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    setupSettingsNavigation() {
        if (this.settingsNavInitialized) return;
        const modal = document.getElementById('settingsModal');
        if (!modal) return;

        const settingsBody = modal.querySelector('.modal-body') || modal.querySelector('.settings-content') || modal;
        if (!settingsBody) return;

        const contentRoot = settingsBody.querySelector('.settings-content') || settingsBody.querySelector('.config-grid') || settingsBody;
        if (!contentRoot) return;
        const settingsForm = modal.querySelector('#settingsForm');

        this.settingsPages = [
            {
                key: 'app-config',
                title: this.locale === 'en' ? 'App Configuration' : 'App configuratie',
                selectors: [
                    '#themeSelect', '#languageSelect', '#timezoneModeSelect', '#timezoneManualSelect', '#touchscreenModeCheckbox', '#showModeCheckbox',
                    '#privaBaseURL', '#privaApiKey', '#privaSystemId',
                    '#apiServerSection',
                    '.loadVenuesBtn'
                ]
            },
            {
                key: 'io',
                title: this.locale === 'en' ? 'In/Out' : 'In/Uit',
                selectors: ['#networkInternetInterface', '#networkLuminexInterface', '#networkSacnInterface', '#networkOscInterface']
            },
            {
                key: 'yesplan',
                title: this.locale === 'en' ? 'Yesplan Settings' : 'Yesplan instellingen',
                selectors: [
                    '#activeYesplanOrg',
                    '#yesplanOrgName', '#yesplanOrgShortName', '#yesplanBaseURL', '#yesplanApiKey',
                    '#yesplanOrgName2', '#yesplanOrgShortName2', '#yesplanBaseURL2', '#yesplanApiKey2',
                    '#venueOrderList', '#resetVenueOrder', '#venueResourceOptionsList'
                ]
            },
            {
                key: 'itix',
                title: this.locale === 'en' ? 'Itix Settings' : 'Itix instellingen',
                selectors: ['#itixBaseURL1', '#itixBaseURL2']
            },
            {
                key: 'about',
                title: this.locale === 'en' ? 'About this app' : 'Over deze app',
                selectors: ['#desktopUpdateSection', '#updateCheckResult']
            }
        ];

        // Tabs-nav (zonder DOM verplaatsing van settingsblokken)
        const nav = document.createElement('div');
        nav.className = 'settings-subnav';
        nav.style.cssText = 'display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;min-height:56px;margin-bottom:.85rem;position:sticky;top:0;z-index:20;background:#2d3748;padding:.45rem .4rem;border:1px solid #334155;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.18);';

        contentRoot.prepend(nav);

        // Voorkom dat inhoud "onder" de tabknoppen schuift:
        // tabs staan buiten de scroll, alleen het formulier scrollt.
        if (settingsBody && settingsForm) {
            settingsBody.style.overflow = 'hidden';
            settingsBody.style.display = 'flex';
            settingsBody.style.flexDirection = 'column';
            settingsBody.style.gap = '0.5rem';
            settingsBody.style.minHeight = '0';
            settingsBody.style.flex = '1';
            settingsForm.style.overflowY = 'auto';
            settingsForm.style.overflowX = 'hidden';
            settingsForm.style.maxHeight = 'none';
            settingsForm.style.height = '100%';
            settingsForm.style.flex = '1';
            settingsForm.style.paddingRight = '0.25rem';
            settingsForm.style.marginBottom = '0';
        }

        const pagesByKey = new Set(this.settingsPages.map((p) => p.key));
        this.settingsPageSections = {};
        this.settingsPages.forEach((p) => { this.settingsPageSections[p.key] = []; });

        const sectionToPage = (sectionEl) => {
            if (!sectionEl) return null;
            if (sectionEl.id === 'apiServerSection') return 'app-config';
            if (sectionEl.id === 'desktopUpdateSection') return 'app-config'; // updates horen bij app-configuratie
            if (sectionEl.querySelector('#themeSelect') || sectionEl.querySelector('#touchscreenModeCheckbox')) return 'app-config';
            if (sectionEl.querySelector('#networkInternetInterface') || sectionEl.querySelector('#networkOscInterface') || sectionEl.querySelector('#networkSacnInterface')) return 'io';
            if (sectionEl.querySelector('#masterModeEnabledCheckbox')) return 'io';
            if (sectionEl.querySelector('#yesplanBaseURL') || sectionEl.querySelector('#yesplanBaseURL2') || sectionEl.querySelector('#activeYesplanOrg')) return 'yesplan';
            if (sectionEl.querySelector('#privaBaseURL')) return 'app-config';
            if (sectionEl.querySelector('#venueOrderList') || sectionEl.querySelector('#venueResourceOptionsList')) return 'yesplan';
            if (sectionEl.querySelector('#itixBaseURL1') || sectionEl.querySelector('#itixBaseURL2')) return 'itix';
            if (sectionEl.querySelector('h3')?.textContent?.toLowerCase().includes('over deze app')) return 'about';
            return null;
        };

        const allSections = Array.from(modal.querySelectorAll('#settingsForm > .settings-section'));
        allSections.forEach((section) => {
            const page = sectionToPage(section);
            if (!page || !pagesByKey.has(page)) return;
            section.dataset.settingsPage = page;
            if (section.dataset.settingsOriginalDisplay === undefined) {
                section.dataset.settingsOriginalDisplay = section.style.display || '';
            }
            this.settingsPageSections[page].push(section);
        });

        // Gewenste volgorde binnen Yesplan-tab:
        // 1) vinkjes/technische opties 2) zaalvolgorde.
        if (Array.isArray(this.settingsPageSections.yesplan)) {
            this.settingsPageSections.yesplan.sort((a, b) => {
                const rank = (section) => {
                    if (section.querySelector('#activeYesplanOrg')) return -1;
                    if (section.querySelector('#venueResourceOptionsList')) return 0;
                    if (section.querySelector('#venueOrderList')) return 1;
                    return 2;
                };
                return rank(a) - rank(b);
            });
        }

        // Gewenste volgorde binnen App-config tab:
        // overige app-instellingen, daarna updates, en master-mode als laatste.
        if (Array.isArray(this.settingsPageSections['app-config'])) {
            this.settingsPageSections['app-config'].sort((a, b) => {
                const rank = (section) => {
                    if (section.querySelector('#masterModeEnabledCheckbox')) return 2;
                    if (section.id === 'desktopUpdateSection') return 1;
                    return 0;
                };
                return rank(a) - rank(b);
            });
        }

        // Gewenste volgorde binnen In/Uit-tab:
        // netwerkinterfaces eerst, master mode helemaal onderaan.
        if (Array.isArray(this.settingsPageSections.io)) {
            this.settingsPageSections.io.sort((a, b) => {
                const rank = (section) => (section.querySelector('#masterModeEnabledCheckbox') ? 1 : 0);
                return rank(a) - rank(b);
            });
        }

        // Zet de fysieke sectievolgorde in het formulier gelijk aan de tab-volgorde en subvolgorde.
        if (settingsForm) {
            const desired = [
                ...(this.settingsPageSections['app-config'] || []),
                ...(this.settingsPageSections['io'] || []),
                ...(this.settingsPageSections['yesplan'] || []),
                ...(this.settingsPageSections['itix'] || []),
                ...(this.settingsPageSections['about'] || [])
            ];
            desired.forEach((section) => {
                if (section?.parentElement === settingsForm) settingsForm.appendChild(section);
            });
        }

        this.settingsPages.forEach((p) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'settings-subnav-btn';
            btn.dataset.page = p.key;
            btn.textContent = p.title;
            btn.style.cssText = 'padding:.45rem .85rem;font-size:.86rem;line-height:1.2;border:1px solid #475569;border-radius:10px;background:rgba(51,65,85,.55);color:#e2e8f0;box-shadow:none;transition:all .15s ease;cursor:pointer;';
            btn.addEventListener('mouseenter', () => {
                if (btn.dataset.page !== this.settingsPageKey) {
                    btn.style.background = 'rgba(71,85,105,.6)';
                    btn.style.borderColor = '#64748b';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (btn.dataset.page !== this.settingsPageKey) {
                    btn.style.background = 'rgba(51,65,85,.55)';
                    btn.style.borderColor = '#475569';
                }
            });
            btn.addEventListener('click', () => this.activateSettingsPage(p.key));
            nav.appendChild(btn);
        });

        this.settingsNavInitialized = true;
    }

    activateSettingsPage(pageKey) {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        this.settingsPageKey = pageKey;

        if (this.settingsPageSections) {
            Object.values(this.settingsPageSections).flat().forEach((section) => {
                let shouldShow = section.dataset.settingsPage === pageKey;
                // Master mode hoort uitsluitend bij In/Uit-tab.
                if (section.querySelector('#masterModeEnabledCheckbox')) {
                    shouldShow = pageKey === 'io';
                }
                section.style.display = shouldShow ? (section.dataset.settingsOriginalDisplay || '') : 'none';
            });
        }

        modal.querySelectorAll('.settings-subnav-btn').forEach((btn) => {
            const active = btn.dataset.page === pageKey;
            btn.classList.toggle('active', active);
            btn.style.background = active ? 'linear-gradient(180deg, #7c8ef3 0%, #667eea 100%)' : 'rgba(51,65,85,.55)';
            btn.style.color = active ? '#fff' : '#e2e8f0';
            btn.style.borderColor = active ? '#8190f8' : '#475569';
            btn.style.boxShadow = active ? '0 0 0 1px rgba(129,144,248,.35), 0 4px 12px rgba(102,126,234,.25)' : 'none';
            btn.style.transform = active ? 'translateY(-1px)' : 'translateY(0)';
        });

        // Voorkom "verspringen": bij tabwissel altijd starten vanaf bovengrens van instellingen.
        const settingsForm = modal.querySelector('#settingsForm');
        if (settingsForm) settingsForm.scrollTop = 0;
    }

    getOrgDisplayName(orgNum) {
        const config = orgNum === 2 ? this.config.yesplan2 : this.config.yesplan;
        const shortName = config?.shortName?.trim();
        const name = config?.name?.trim();
        if (shortName) return shortName;
        if (name) {
            const words = name.split(/[\s\-_/]+/).map((w) => w.trim()).filter(Boolean);
            if (words.length >= 2) {
                return words.slice(0, 3).map((w) => w.charAt(0).toUpperCase()).join('');
            }
            const upperHints = (name.match(/[A-Z]/g) || []).join('');
            if (upperHints.length >= 2) return upperHints.slice(0, 3);
            const compact = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (compact.length >= 2) return compact.slice(0, 2);
            if (compact.length === 1) return compact;
        }
        return this.t('settings.orgN', { n: orgNum });
    }

    getVenueDisplayName(venue) {
        const fallback = this.t('venue.venueId', { id: venue?.id });
        const rawName = String(venue?.name || '').trim() || fallback;
        const orgRaw = venue?._organizationId ?? (String(venue?.id || '').includes(':') ? String(venue.id).split(':')[0] : '');
        let orgNum = String(orgRaw).trim() === '2' ? 2 : (String(orgRaw).trim() === '1' ? 1 : null);
        if (!orgNum) {
            const trailingMatch = /\s*\(([^)]*)\)\s*$/.exec(rawName);
            const trailing = String(trailingMatch?.[1] || '').trim().toLowerCase();
            const cfg1 = this.config?.yesplan || {};
            const cfg2 = this.config?.yesplan2 || {};
            const org1Names = [cfg1.shortName, cfg1.name, 'org 1', 'organisatie 1', 'organisation 1']
                .map((v) => String(v || '').trim().toLowerCase())
                .filter(Boolean);
            const org2Names = [cfg2.shortName, cfg2.name, 'org 2', 'organisatie 2', 'organisation 2']
                .map((v) => String(v || '').trim().toLowerCase())
                .filter(Boolean);
            if (org1Names.includes(trailing)) orgNum = 1;
            if (org2Names.includes(trailing)) orgNum = 2;
        }
        if (!orgNum) return rawName;

        const orgLabel = this.getOrgDisplayName(orgNum);
        const orgConfig = orgNum === 2 ? this.config?.yesplan2 : this.config?.yesplan;
        const orgFullName = String(orgConfig?.name || '').trim();
        const orgShortName = String(orgConfig?.shortName || '').trim();
        const trailingMatch = /\s*\(([^)]*)\)\s*$/.exec(rawName);
        let baseName = rawName;
        if (trailingMatch) {
            const trailing = String(trailingMatch[1] || '').trim().toLowerCase();
            const known = [orgLabel, orgFullName, orgShortName, `org ${orgNum}`, `organisatie ${orgNum}`, `organisation ${orgNum}`]
                .map((v) => String(v || '').trim().toLowerCase())
                .filter(Boolean);
            // In multi-org dropdowns willen we altijd een compacte, uniforme suffix.
            // Daarom vervangen we elke bestaande "(...)" suffix door de gekozen org-label.
            if (known.includes(trailing) || trailing.length > 0) {
                baseName = rawName.slice(0, trailingMatch.index).trim();
            }
        }
        return `${baseName} (${orgLabel})`;
    }

    escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    formatNetworkInterfaceLabel(iface) {
        if (!iface || typeof iface !== 'object') return '';
        const name = String(iface.name || '').trim();
        const address = String(iface.address || '').trim();
        if (name && address) return `${name} (${address})`;
        return name || address;
    }

    async refreshNetworkInterfaceOptions() {
        const ids = ['networkInternetInterface', 'networkLuminexInterface', 'networkSacnInterface', 'networkOscInterface'];
        const selects = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (!selects.length) return;

        let interfaces = [];
        try {
            const res = await window.electronAPI?.getNetworkInterfaces?.();
            if (res?.success && Array.isArray(res.data)) interfaces = res.data;
        } catch (_) {
            interfaces = [];
        }

        const autoLabel = this.t('settings.interfaceAuto');
        const options = [`<option value="auto">${this.escapeHtml(autoLabel)}</option>`];
        for (const iface of interfaces) {
            const value = String(iface.address || '').trim();
            const label = this.formatNetworkInterfaceLabel(iface);
            if (!value || !label) continue;
            options.push(`<option value="${this.escapeHtml(value)}">${this.escapeHtml(label)}</option>`);
        }
        const html = options.join('');
        selects.forEach((sel) => {
            const prev = String(sel.value || '').trim();
            sel.innerHTML = html;
            if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
        });
    }

    populateSettingsForm() {
        this.enforceUpdateAndMasterSectionOrder();
        // Actieve Yesplan organisatie - dynamisch vullen met ingevoerde namen
        const activeOrgSelect = document.getElementById('activeYesplanOrg');
        if (activeOrgSelect) {
            const name1 = this.getOrgDisplayName(1);
            const name2 = this.getOrgDisplayName(2);
            activeOrgSelect.innerHTML = `
                <option value="1">${this.escapeHtml(name1)}</option>
                <option value="2">${this.escapeHtml(name2)}</option>
                <option value="both">${this.t('settings.bothOrgs')}</option>
            `;
            const v = this.config.app?.activeYesplanOrg;
            activeOrgSelect.value = v === 'both' ? 'both' : (v === 2 ? '2' : '1');
        }
        // Yesplan organisatie 1
        document.getElementById('yesplanOrgName').value = this.config.yesplan?.name || '';
        const yesplanOrgShortNameEl = document.getElementById('yesplanOrgShortName');
        if (yesplanOrgShortNameEl) yesplanOrgShortNameEl.value = this.config.yesplan?.shortName || '';
        document.getElementById('yesplanBaseURL').value = this.config.yesplan?.baseURL || '';
        document.getElementById('yesplanApiKey').value = this.config.yesplan?.apiKey || '';
        // Yesplan organisatie 2
        const url2El = document.getElementById('yesplanBaseURL2');
        const key2El = document.getElementById('yesplanApiKey2');
        const name2El = document.getElementById('yesplanOrgName2');
        const shortName2El = document.getElementById('yesplanOrgShortName2');
        if (name2El) name2El.value = this.config.yesplan2?.name || '';
        if (shortName2El) shortName2El.value = this.config.yesplan2?.shortName || '';
        if (url2El) url2El.value = this.config.yesplan2?.baseURL || '';
        if (key2El) key2El.value = this.config.yesplan2?.apiKey || '';

        // Priva
        document.getElementById('privaBaseURL').value = this.config.priva?.baseURL || '';
        document.getElementById('privaApiKey').value = this.config.priva?.apiKey || '';
        document.getElementById('privaSystemId').value = this.config.priva?.systemId || '';

        const itixBaseEl1 = document.getElementById('itixBaseURL1');
        const itixBaseEl2 = document.getElementById('itixBaseURL2');
        const legacyItixBase = this.config.itix?.baseURL || '';
        if (itixBaseEl1) itixBaseEl1.value = this.config.itix?.baseURL1 || legacyItixBase;
        if (itixBaseEl2) itixBaseEl2.value = this.config.itix?.baseURL2 || '';

        // Thema
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.config.app?.theme || 'default';
        }
        // Taal
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.config.app?.language || 'nl';
        }
        const timezoneManualSelect = document.getElementById('timezoneManualSelect');
        if (timezoneManualSelect) {
            const timeZones = this.getAvailableTimeZones();
            timezoneManualSelect.innerHTML = timeZones
                .map((tz) => `<option value="${this.escapeHtml(tz)}">${this.escapeHtml(tz.replace(/_/g, ' '))}</option>`)
                .join('');
            const manualZone = String(this.config.app?.manualTimeZone || this.getSystemTimeZone());
            timezoneManualSelect.value = timeZones.includes(manualZone) ? manualZone : this.getSystemTimeZone();
        }
        const timezoneModeSelect = document.getElementById('timezoneModeSelect');
        if (timezoneModeSelect) {
            timezoneModeSelect.value = this.config.app?.timezoneMode === 'manual' ? 'manual' : 'auto';
        }
        const manualTimeInput = document.getElementById('manualTimeInput');
        if (manualTimeInput) {
            this.refreshManualTimeInputFromSelectedTimezone();
        }
        this.updateTimezoneManualVisibility();
        // Touchscreen-modus
        const touchscreenModeCheckbox = document.getElementById('touchscreenModeCheckbox');
        if (touchscreenModeCheckbox) {
            touchscreenModeCheckbox.checked = !!this.config.app?.touchscreenMode;
        }
        const showModeCheckbox = document.getElementById('showModeCheckbox');
        if (showModeCheckbox) {
            showModeCheckbox.checked = this.config.app?.showMode !== false;
        }
        const masterModeEnabledCheckbox = document.getElementById('masterModeEnabledCheckbox');
        if (masterModeEnabledCheckbox) {
            masterModeEnabledCheckbox.checked = this.config.app?.masterModeEnabled === true;
        }
        const masterModeNameInput = document.getElementById('masterModeNameInput');
        if (masterModeNameInput) {
            masterModeNameInput.value = String(this.config.app?.masterModeName || '');
        }
        const masterModePortInput = document.getElementById('masterModePortInput');
        if (masterModePortInput) {
            masterModePortInput.value = String(this.config.app?.masterModePort || 3847);
        }
        const unlockInput = document.getElementById('masterModeUnlockPassword');
        if (unlockInput) unlockInput.value = '';
        this.updateMasterModeInputState();
        this.refreshMasterModeStatusLine().catch(() => {
            /* ignore */
        });
        const routing = this.config.app?.networkRouting || {};
        const networkInternetInterface = document.getElementById('networkInternetInterface');
        if (networkInternetInterface) {
            networkInternetInterface.value = String(routing.internetInterface || 'auto');
            if (![...networkInternetInterface.options].some((o) => o.value === networkInternetInterface.value)) {
                networkInternetInterface.value = 'auto';
            }
        }
        const networkLuminexInterface = document.getElementById('networkLuminexInterface');
        if (networkLuminexInterface) {
            networkLuminexInterface.value = String(routing.luminexInterface || 'auto');
            if (![...networkLuminexInterface.options].some((o) => o.value === networkLuminexInterface.value)) {
                networkLuminexInterface.value = 'auto';
            }
        }
        const networkOscInterface = document.getElementById('networkOscInterface');
        if (networkOscInterface) {
            networkOscInterface.value = String(routing.oscInterface || 'auto');
            if (![...networkOscInterface.options].some((o) => o.value === networkOscInterface.value)) {
                networkOscInterface.value = 'auto';
            }
        }
        const networkSacnInterface = document.getElementById('networkSacnInterface');
        if (networkSacnInterface) {
            networkSacnInterface.value = String(routing.sacnInterface || 'auto');
            if (![...networkSacnInterface.options].some((o) => o.value === networkSacnInterface.value)) {
                networkSacnInterface.value = 'auto';
            }
        }

        // API-server URL (alleen op iPhone/web)
        const apiServerSection = document.getElementById('apiServerSection');
        const apiServerURLInput = document.getElementById('apiServerURL');
        if (apiServerSection && apiServerURLInput && window.__SHIFT_HAPPENS_MOBILE__) {
            apiServerSection.style.display = 'block';
            apiServerURLInput.value = localStorage.getItem('SHIFT_HAPPENS_API_BASE') || window.SHIFT_HAPPENS_API_BASE || '';
        }

        const desktopUpdateSection = document.getElementById('desktopUpdateSection');
        const updateCheckResult = document.getElementById('updateCheckResult');
        if (desktopUpdateSection) {
            const showDesktopUpdates = !!(window.__IS_ELECTRON__ && typeof window.electronAPI?.checkForUpdates === 'function');
            desktopUpdateSection.style.display = showDesktopUpdates ? 'block' : 'none';
        }
        if (updateCheckResult) updateCheckResult.textContent = '';

        // Zaalvolgorde
        this.populateVenueOrderSettings();
        // Technische opties per zaal
        this.populateVenueResourceOptionsSettings();
    }

    enforceUpdateAndMasterSectionOrder() {
        const settingsForm = document.getElementById('settingsForm');
        const updatesSection = document.getElementById('desktopUpdateSection');
        if (!settingsForm || !updatesSection) return;
        if (updatesSection.parentElement !== settingsForm) return;
        // Legacy helper: updates-sectie onderaan in formulier houden.
        // Master-mode positie wordt via tab-indeling en io-sortering bepaald.
        settingsForm.appendChild(updatesSection);
    }

    async refreshMasterModeStatusLine() {
        const resultEl = document.getElementById('masterModeDiscoveryResult');
        if (!resultEl) return;
        if (!window.electronAPI?.getMasterModeStatus) {
            resultEl.textContent = '';
            return;
        }
        try {
            const res = await window.electronAPI.getMasterModeStatus();
            const status = res?.status;
            if (!res?.success || !status) {
                resultEl.textContent = '';
                return;
            }
            if (status.enabled) {
                const firstIp = Array.isArray(status.addresses) && status.addresses.length > 0 ? status.addresses[0] : '0.0.0.0';
                resultEl.textContent = `Deze app is master op ${firstIp}:${status.port}`;
                return;
            }
            resultEl.textContent = 'Master mode staat uit op dit apparaat.';
        } catch (_) {
            resultEl.textContent = '';
        }
    }

    updateMasterModeInputState() {
        const enabled = document.getElementById('masterModeEnabledCheckbox')?.checked === true;
        const nameInput = document.getElementById('masterModeNameInput');
        const portInput = document.getElementById('masterModePortInput');
        const discoverBtn = document.getElementById('discoverMasterBtn');
        const passwordInput = document.getElementById('masterModeUnlockPassword');

        if (nameInput) nameInput.disabled = !enabled;
        if (portInput) portInput.disabled = !enabled;
        if (discoverBtn) discoverBtn.disabled = !enabled;
        // Wachtwoordveld blijft bewust altijd actief, ook wanneer master mode uit staat.
        if (passwordInput) passwordInput.disabled = false;
    }

    getDefaultVenueOrder() {
        // Geen standaard volgorde - zalen worden alfabetisch gesorteerd
        return [];
    }

    getVenueOrder() {
        return this.config.app?.venueOrder || this.getDefaultVenueOrder();
    }

    getHiddenVenueIds() {
        return this.config.app?.hiddenVenues || [];
    }

    async saveVenueOrder(order) {
        if (!window.electronAPI) return;
        try {
            const currentConfig = this.config.app || {};
            currentConfig.venueOrder = order;
            await window.electronAPI.saveConfig('app', currentConfig);
            this.config.app = currentConfig;
        } catch (error) {
            console.error('Fout bij opslaan zaalvolgorde:', error);
        }
    }

    async toggleVenueVisibility(venueId) {
        if (!window.electronAPI) return;
        const hidden = this.getHiddenVenueIds();
        const id = String(venueId);
        const newHidden = hidden.includes(id) ? hidden.filter(h => h !== id) : [...hidden, id];
        try {
            const currentConfig = this.config.app || {};
            currentConfig.hiddenVenues = newHidden;
            await window.electronAPI.saveConfig('app', currentConfig);
            this.config.app = currentConfig;
            this.populateVenueOrderSettings();
            this.populateVenueSelector();
        } catch (error) {
            console.error('Fout bij opslaan zichtbaarheid zaal:', error);
        }
    }

    populateVenueOrderSettings() {
        const container = document.getElementById('venueOrderList');
        if (!container || !this.availableVenues || !Array.isArray(this.availableVenues)) {
            container.innerHTML = `<p style="color: #a0aec0; font-size: 0.875rem;">${this.t('messages.loadVenuesFirst')}</p>`;
            return;
        }

        const savedOrder = this.getVenueOrder();
        const venues = [...this.availableVenues];
        
        // Sorteer zalen volgens opgeslagen volgorde
        venues.sort((a, b) => {
            const getIndex = (venueName) => {
                if (!venueName) return -1;
                const upperName = venueName.toUpperCase();
                
                // Check op exacte match
                let index = savedOrder.findIndex(order => upperName === order);
                if (index !== -1) return index;
                
                // Check op startsWith (langere strings eerst)
                const sortedForMatching = [...savedOrder].sort((x, y) => y.length - x.length);
                for (const order of sortedForMatching) {
                    if (upperName.startsWith(order)) {
                        return savedOrder.indexOf(order);
                    }
                }
                
                return -1;
            };
            
            const indexA = getIndex(a.name);
            const indexB = getIndex(b.name);
            
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

        const hiddenIds = this.getHiddenVenueIds();
        container.innerHTML = '';
        venues.forEach((venue, index) => {
            const item = document.createElement('div');
            item.className = 'venue-order-item';
            item.draggable = true;
            item.dataset.venueId = venue.id;
            item.dataset.venueName = venue.name;
            const isHidden = hiddenIds.includes(String(venue.id));
            const eyeIcon = isHidden ? 'fa-eye-slash' : 'fa-eye';
            const eyeTitle = isHidden ? this.t('settings.showVenue') : this.t('settings.hideVenue');
            item.innerHTML = `
                <i class="fas fa-grip-vertical venue-order-drag" aria-hidden="true"></i>
                <span class="venue-order-name">${this.getVenueDisplayName(venue)}</span>
                <button type="button" class="venue-order-eye" data-venue-id="${venue.id}" title="${eyeTitle}" aria-label="${eyeTitle}">
                    <i class="fas ${eyeIcon}"></i>
                </button>
            `;
            if (isHidden) item.classList.add('venue-order-item--hidden');
            container.appendChild(item);
        });

        container.querySelectorAll('.venue-order-eye').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleVenueVisibility(btn.dataset.venueId);
            });
        });

        // Setup drag and drop voor zaalvolgorde
        this.setupVenueOrderDragAndDrop(container);
    }

    populateVenueResourceOptionsSettings() {
        const container = document.getElementById('venueResourceOptionsList');
        if (!container || !this.availableVenues || !Array.isArray(this.availableVenues)) {
            container.innerHTML = `<p style="color: #a0aec0; font-size: 0.875rem;">${this.t('messages.loadVenuesFirst')}</p>`;
            return;
        }
        const saved = this.config.app?.venueResourceOptions || {};
        const savedOrder = this.getVenueOrder();
        const venues = [...this.availableVenues].sort((a, b) => {
            const getIndex = (n) => {
                const u = String(n || '').toUpperCase();
                const idx = savedOrder.findIndex(o => u === o);
                if (idx !== -1) return idx;
                for (const o of [...savedOrder].sort((x, y) => y.length - x.length)) {
                    if (u.startsWith(o)) return savedOrder.indexOf(o);
                }
                return -1;
            };
            const iA = getIndex(a.name), iB = getIndex(b.name);
            if (iA !== -1 && iB !== -1) return iA - iB;
            if (iA !== -1) return -1;
            if (iB !== -1) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
        container.innerHTML = '';
        venues.forEach(venue => {
            const id = String(venue.id);
            let v = saved[id];
            if (!v) {
                // Eerste installatie / geen lokale instellingen voor deze zaal:
                // start met alle vinkjes uit. Bij updates met bestaande data blijft saved[id] leidend.
                v = {
                    balletvloer: false,
                    vleugel: false,
                    orkestbak: false,
                    zaalplattegrond: false
                };
            }
            const detected = this.getBalletvloerVleugelDisplay(venue.name, id);
            const showBalletvloerOpt = !!detected.showBalletvloer || !!v.balletvloer;
            const showVleugelOpt = !!detected.showVleugel || !!v.vleugel;
            const showOrkestbakOpt = !!detected.showOrkestbak || !!v.orkestbak;
            const showZaalplattegrondOpt = this.hasItixBaseURLForVenue(id);
            const optionCount = [showBalletvloerOpt, showVleugelOpt, showOrkestbakOpt, showZaalplattegrondOpt].filter(Boolean).length;
            if (!optionCount) return;
            const item = document.createElement('div');
            item.className = 'venue-resource-options-item';
            item.innerHTML = `
                <span class="venue-resource-name">${this.escapeHtml(this.getVenueDisplayName(venue))}</span>
                <div class="venue-resource-checkboxes">
                    ${showBalletvloerOpt ? `<label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="balletvloer" ${v.balletvloer ? 'checked' : ''}> ${this.t('settings.balletvloer')}</label>` : ''}
                    ${showVleugelOpt ? `<label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="vleugel" ${v.vleugel ? 'checked' : ''}> ${this.t('settings.vleugel')}</label>` : ''}
                    ${showOrkestbakOpt ? `<label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="orkestbak" ${v.orkestbak ? 'checked' : ''}> ${this.t('settings.orkestbak')}</label>` : ''}
                    ${showZaalplattegrondOpt ? `<label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="zaalplattegrond" ${v.zaalplattegrond !== false ? 'checked' : ''}> Zaalplattegrond</label>` : ''}
                </div>
            `;
            container.appendChild(item);
        });
    }

    setupVenueOrderDragAndDrop(container) {
        const items = container.querySelectorAll('.venue-order-item');
        let draggedElement = null;

        items.forEach((item) => {
            item.addEventListener('dragstart', (e) => {
                if (e.target.closest('.venue-order-eye')) {
                    e.preventDefault();
                    return;
                }
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                items.forEach(i => i.classList.remove('drag-over'));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (!draggedElement) return;
                
                items.forEach(i => {
                    if (i !== draggedElement) {
                        i.classList.remove('drag-over');
                    }
                });
                
                if (item !== draggedElement) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                
                if (!draggedElement || draggedElement === item) {
                    items.forEach(i => i.classList.remove('drag-over'));
                    return;
                }

                const allItems = Array.from(container.querySelectorAll('.venue-order-item'));
                const dropIndex = allItems.indexOf(item);
                const dragIndex = allItems.indexOf(draggedElement);

                if (dropIndex < dragIndex) {
                    container.insertBefore(draggedElement, item);
                } else {
                    container.insertBefore(draggedElement, item.nextSibling);
                }

                // Sla nieuwe volgorde op
                const newOrder = Array.from(container.querySelectorAll('.venue-order-item'))
                    .map(item => item.dataset.venueName.toUpperCase());
                await this.saveVenueOrder(newOrder);

                items.forEach(i => i.classList.remove('drag-over'));
            });
        });
    }

    async saveSettings() {
        if (!window.electronAPI) return;

        try {
            // Bewaar huidige schermcontext zodat Opslaan de gebruiker niet naar een andere zaal/view duwt.
            const currentActiveOrg = this.config?.app?.activeYesplanOrg;
            const requestedActiveOrgRaw = document.getElementById('activeYesplanOrg')?.value;
            const requestedActiveOrg = requestedActiveOrgRaw === 'both'
                ? 'both'
                : (parseInt(requestedActiveOrgRaw, 10) || 1);
            const didSwitchActiveOrg = String(currentActiveOrg ?? '1') !== String(requestedActiveOrg);
            const preservedSelectedVenues = didSwitchActiveOrg
                ? []
                : (Array.isArray(this.selectedVenues) ? [...this.selectedVenues] : []);
            const preservedSelectedDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
            const preservedCurrentView = this.currentView;
            const preservedDetailContext = this.detailContext ? { ...this.detailContext } : null;

            const configs = {
                _timezoneMode: document.getElementById('timezoneModeSelect')?.value === 'manual' ? 'manual' : 'auto',
                _manualTimeZone: document.getElementById('timezoneManualSelect')?.value || this.getSystemTimeZone(),
                yesplan: {
                    name: document.getElementById('yesplanOrgName').value.trim(),
                    shortName: document.getElementById('yesplanOrgShortName')?.value.trim() || '',
                    baseURL: document.getElementById('yesplanBaseURL').value,
                    apiKey: document.getElementById('yesplanApiKey').value
                },
                yesplan2: {
                    name: document.getElementById('yesplanOrgName2').value.trim(),
                    shortName: document.getElementById('yesplanOrgShortName2')?.value.trim() || '',
                    baseURL: document.getElementById('yesplanBaseURL2').value,
                    apiKey: document.getElementById('yesplanApiKey2').value
                },
                app: {
                    ...this.config.app,
                    theme: document.getElementById('themeSelect').value,
                    language: document.getElementById('languageSelect')?.value || 'nl',
                    timezoneMode: undefined,
                    manualTimeZone: undefined,
                    manualClockOffsetSeconds: 0,
                    touchscreenMode: document.getElementById('touchscreenModeCheckbox')?.checked ?? false,
                    showMode: document.getElementById('showModeCheckbox')?.checked !== false,
                    masterModeEnabled: document.getElementById('masterModeEnabledCheckbox')?.checked === true,
                    masterModeName: String(document.getElementById('masterModeNameInput')?.value || '').trim(),
                    masterModePort: (() => {
                        const n = parseInt(document.getElementById('masterModePortInput')?.value || '3847', 10);
                        return Number.isFinite(n) && n > 0 && n <= 65535 ? n : 3847;
                    })(),
                    networkRouting: {
                        ...(this.config.app?.networkRouting || {}),
                        internetInterface: document.getElementById('networkInternetInterface')?.value || 'auto',
                        luminexInterface: document.getElementById('networkLuminexInterface')?.value || 'auto',
                        sacnInterface: document.getElementById('networkSacnInterface')?.value || 'auto',
                        oscInterface: document.getElementById('networkOscInterface')?.value || 'auto'
                    },
                    activeYesplanOrg: (() => {
                        const v = requestedActiveOrgRaw;
                        return v === 'both' ? 'both' : (parseInt(v, 10) || 1);
                    })(),
                    selectedVenues: preservedSelectedVenues,
                    selectedVenue: preservedSelectedVenues.length === 1 ? preservedSelectedVenues[0] : null,
                    selectedDate: preservedSelectedDate.toISOString(),
                    venueResourceOptions: (() => {
                        const opts = {};
                        const list = document.getElementById('venueResourceOptionsList');
                        if (list) {
                            list.querySelectorAll('input[data-venue-id][data-option]').forEach(cb => {
                                const vid = cb.dataset.venueId;
                                const opt = cb.dataset.option;
                                if (!vid || !opt) return;
                                if (!opts[vid]) opts[vid] = {};
                                opts[vid][opt] = cb.checked;
                            });
                        }
                        return opts;
                    })()
                },
                priva: {
                    baseURL: document.getElementById('privaBaseURL').value,
                    apiKey: document.getElementById('privaApiKey').value,
                    systemId: document.getElementById('privaSystemId').value
                },
                itix: {
                    baseURL1: (document.getElementById('itixBaseURL1')?.value || '').trim(),
                    baseURL2: (document.getElementById('itixBaseURL2')?.value || '').trim()
                }
            };
            const manualClockInput = String(document.getElementById('manualTimeInput')?.value || '').trim();
            const manualInputWasEdited = document.getElementById('manualTimeInput')?.dataset.userEdited === '1';
            const manualOffsetSeconds =
                configs._timezoneMode === 'manual' && manualInputWasEdited
                    ? this.computeManualClockOffsetSeconds(manualClockInput, configs._manualTimeZone)
                    : 0;
            configs.app.timezoneMode = configs._timezoneMode;
            configs.app.manualTimeZone = configs._manualTimeZone;
            configs.app.manualClockOffsetSeconds = manualOffsetSeconds;
            delete configs._timezoneMode;
            delete configs._manualTimeZone;

            if (configs.app.masterModeEnabled && window.electronAPI?.unlockMasterMode) {
                let mustUnlock = this.config.app?.masterModeEnabled !== true;
                if (window.electronAPI?.getMasterModeStatus) {
                    try {
                        const st = await window.electronAPI.getMasterModeStatus();
                        // Als master nog niet draait, dan altijd unlock afdwingen.
                        mustUnlock = !st?.status?.enabled;
                    } catch (_) {
                        // fallback op config-state hierboven
                    }
                }
                if (mustUnlock) {
                    const pwd = String(document.getElementById('masterModeUnlockPassword')?.value || '').trim();
                    if (!pwd) {
                        throw new Error('Vul eerst het ontgrendelwachtwoord in om Master mode in te schakelen.');
                    }
                    const unlockRes = await window.electronAPI.unlockMasterMode(pwd);
                    if (!unlockRes?.success) {
                        throw new Error('Master mode ontgrendelen mislukt: onjuist wachtwoord.');
                    }
                }
            }

            // Sla app-instellingen eerst op zodat UI-vinkjes/thema altijd persistenteren,
            // ook als secure storage voor API keys op dit apparaat niet beschikbaar is.
            const appSaveResult = await window.electronAPI.saveConfig('app', configs.app);
            if (!appSaveResult?.success) {
                throw new Error(appSaveResult?.message || this.t('errors.settingsSave'));
            }

            // Opslaan van overige configuraties (best effort per systeem)
            const saveWarnings = [];
            for (const [system, config] of Object.entries(configs)) {
                if (system === 'app') continue;
                const result = await window.electronAPI.saveConfig(system, config);
                if (!result?.success) {
                    if (result?.error === 'SECURE_STORAGE_UNAVAILABLE') {
                        saveWarnings.push(this.t('messages.secureStorageUnavailable'));
                        continue;
                    }
                    throw new Error(this.t('errors.settingsSave'));
                }
            }

            // API-server URL opslaan (iPhone/web): alleen overschrijven als er iets is ingevuld.
            // Leeg laten wist de opgeslagen URL niet — anders raak je bij "alleen thema opslaan" per ongeluk de werkende server kwijt (regressie na base-URL-instelling).
            if (window.__SHIFT_HAPPENS_MOBILE__) {
                const apiUrlRaw = (document.getElementById('apiServerURL')?.value || '').trim();
                if (apiUrlRaw) {
                    let s = apiUrlRaw;
                    if (!/^https?:\/\//i.test(s)) s = 'http://' + s;
                    let u;
                    try {
                        u = new URL(s);
                    } catch {
                        throw new Error(this.t('errors.apiServerInvalid'));
                    }
                    const host = u.hostname.toLowerCase();
                    if (host.includes('yesplan')) {
                        throw new Error(this.t('errors.apiServerWrongKind'));
                    }
                    const p = (u.pathname || '').toLowerCase();
                    if (p.includes('zaalplattegrond') || p.includes('uitvoeringinfo')) {
                        throw new Error(this.t('errors.apiServerWrongKind'));
                    }
                    const pathPart = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
                    const normalized = u.origin + pathPart;
                    localStorage.setItem('SHIFT_HAPPENS_API_BASE', normalized);
                    window.SHIFT_HAPPENS_API_BASE = normalized;
                }
                // Formulierveld weer gelijk trekken met opgeslagen waarde (bij leeg laten = behouden)
                const apiIn = document.getElementById('apiServerURL');
                if (apiIn) {
                    apiIn.value = localStorage.getItem('SHIFT_HAPPENS_API_BASE') || window.SHIFT_HAPPENS_API_BASE || '';
                }
            }

            // Configuratie herladen
            await this.loadConfig();

            // Herstel bewaarde context direct na config-reload.
            this.selectedVenues = preservedSelectedVenues;
            this.selectedDate = preservedSelectedDate;
            this.currentView = preservedCurrentView;
            this.detailContext = preservedDetailContext;
            
            // Thema, taal en touchscreen-modus toepassen na opslaan
            const theme = document.getElementById('themeSelect').value;
            this.applyTheme(theme);
            const language = document.getElementById('languageSelect')?.value || 'nl';
            this.applyLanguage(language);
            await this.refreshEffectiveTimeZone();
            this.applyTouchscreenMode(document.getElementById('touchscreenModeCheckbox')?.checked ?? false);
            
            // Zalen opnieuw laden als Yesplan configuratie is gewijzigd
            await this.loadVenues(); // Header dropdown zalen
            // Gebruik de opgeschoonde selectie uit loadVenues (geen oude, mogelijk ongeldige zaal terugduwen).
            const hiddenSelect = document.getElementById('venueSelect');
            if (hiddenSelect) hiddenSelect.value = this.selectedVenues.length === 1 ? this.selectedVenues[0] : '';
            this.updateVenueSelectorDisplay();
            
            // Zaalvolgorde en technische opties opnieuw laden in instellingen
            this.populateVenueOrderSettings();
            this.populateVenueResourceOptionsSettings();
            
            // Data herladen met nieuwe configuratie
            await this.loadAllData();

            if (saveWarnings.length > 0) {
                this.showError('settings', Array.from(new Set(saveWarnings)).join(' '));
            }
            this.showSuccess(this.t('settings.saved'));
            await this.refreshMasterModeStatusLine();
        } catch (error) {
            console.error('Instellingen opslaan fout:', error);
            this.showError('settings', error?.message || this.t('errors.settingsSave'));
        }
    }

    applyTheme(theme) {
        const body = document.body;
        const themes = ['theme-default', 'theme-pink', 'theme-green', 'theme-amber', 'theme-slate', 'theme-purple'];
        themes.forEach(t => body.classList.remove(t));
        body.classList.add(theme === 'default' ? 'theme-default' : `theme-${theme}`);
    }

    applyTouchscreenMode(enabled) {
        document.body.classList.toggle('touchscreen-mode', !!enabled);
        const searchKeyboard = document.getElementById('searchKeyboard');
        if (searchKeyboard && !enabled) searchKeyboard.style.display = 'none';
        const touchInputKeyboard = document.getElementById('touchInputKeyboard');
        if (touchInputKeyboard && !enabled) touchInputKeyboard.style.display = 'none';
    }

    t(key, params = {}) {
        const fallback = TRANSLATIONS.nl;
        const tr = TRANSLATIONS[this.locale] || fallback;
        const parts = key.split('.');
        let v = tr;
        for (const p of parts) {
            v = v?.[p];
            if (v === undefined) break;
        }
        let str = v !== undefined ? v : (key.split('.').reduce((o, p) => o?.[p], fallback) ?? key);
        Object.entries(params).forEach(([k, val]) => { str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), val); });
        return str;
    }

    applyLanguage(locale) {
        this.locale = locale === 'en' ? 'en' : 'nl';
        document.documentElement.lang = this.locale;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });
        // Status labels in master cards (dynamisch)
        const labels = {
            online: this.t('status.online'),
            deels: this.t('status.deels'),
            offline: this.t('status.offline'),
            warning: this.t('status.warning')
        };
        ['weekViewStatus', 'detailViewStatus', 'homeViewStatus'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const textEl = el.querySelector('.status-text');
                const aggregate = el.className.match(/status-(online|deels|offline|warning)/)?.[1] || 'offline';
                if (textEl) textEl.textContent = labels[aggregate] || labels.offline;
            }
        });
        // Update titels (title attributen)
        const backBtn = document.getElementById('backBtn');
        if (backBtn) backBtn.title = this.t('nav.backTitle');
        const prevBtn = document.getElementById('prevDayBtn');
        if (prevBtn) prevBtn.title = this.t('nav.prevDay');
        const nextBtn = document.getElementById('nextDayBtn');
        if (nextBtn) nextBtn.title = this.t('nav.nextDay');
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) homeBtn.title = this.t('nav.home');
        const weekBtn = document.getElementById('weekBtn');
        if (weekBtn) weekBtn.title = this.t('nav.weekView');
        const luminexNavBtn = document.getElementById('luminexNavBtn');
        if (luminexNavBtn) luminexNavBtn.title = this.t('nav.luminex');
        this.refreshVoorstellingTimerChrome();
        this.refreshLuminexChrome();
        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.title = this.t('nav.techOverviewTitle');
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) refreshBtn.title = this.t('nav.refresh');
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.title = this.t('settings.title');
        const voorstellingTimerExportBtn = document.getElementById('voorstellingTimerExportBtn');
        if (voorstellingTimerExportBtn) voorstellingTimerExportBtn.title = this.t('voorstellingTimer.exportTitle');
        const weekStatus = document.getElementById('weekViewStatus');
        if (weekStatus) weekStatus.title = this.t('status.clickForStatus');
        const homeStatus = document.getElementById('homeViewStatus');
        if (homeStatus) homeStatus.title = this.t('status.clickForStatus');
        const detailStatus = document.getElementById('detailViewStatus');
        if (detailStatus) detailStatus.title = this.t('status.clickForStatus');
        this.updateWeekHeaderSummary(this.weekEventCount || 0);
        this.updateDateDisplay();
        this.updateDateTimeDisplay();
        this.updateVoorstellingTimezoneDisplay();
    }

    async testConnection(system) {
        const button = document.querySelector(`[data-system="${system}"]`);
        const originalText = button.innerHTML;
        
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this.t('test.testing')}`;
        button.disabled = true;

        try {
            // Hier zou je de test connection API kunnen aanroepen
            // Voor nu simuleren we een test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            button.innerHTML = `<i class="fas fa-check"></i> ${this.t('test.success')}`;
            button.style.background = '#48bb78';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        } catch (error) {
            button.innerHTML = `<i class="fas fa-times"></i> ${this.t('test.failed')}`;
            button.style.background = '#f56565';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        }
    }

    async loadVenuesForSettings(org = 1, showLoading = true) {
        if (!window.electronAPI) return;

        const orgNum = org === 2 ? 2 : 1;
        const configKey = orgNum === 2 ? 'yesplan2' : 'yesplan';
        const baseURLId = orgNum === 2 ? 'yesplanBaseURL2' : 'yesplanBaseURL';
        const apiKeyId = orgNum === 2 ? 'yesplanApiKey2' : 'yesplanApiKey';
        const button = document.querySelector(`.loadVenuesBtn[data-org="${orgNum}"]`);

        if (!button) return;

        const originalText = button.innerHTML;
        const baseURL = document.getElementById(baseURLId).value;
        const apiKey = document.getElementById(apiKeyId).value;

        if (!baseURL || !apiKey) {
            this.showError('settings', this.t('messages.fillBaseUrlApiKey', { n: orgNum }));
            return;
        }

        try {
            const current = this.config[configKey] || {};
            const nameId = orgNum === 2 ? 'yesplanOrgName2' : 'yesplanOrgName';
            const shortNameId = orgNum === 2 ? 'yesplanOrgShortName2' : 'yesplanOrgShortName';
            const name = document.getElementById(nameId)?.value?.trim() || current.name;
            const shortName = document.getElementById(shortNameId)?.value?.trim() || current.shortName || '';
            const saveResult = await window.electronAPI.saveConfig(configKey, { ...current, name, shortName, baseURL, apiKey });
            if (!saveResult?.success) {
                const msg = saveResult?.error === 'SECURE_STORAGE_UNAVAILABLE'
                    ? this.t('messages.secureStorageUnavailable')
                    : this.t('errors.settingsSave');
                this.showError('settings', msg);
                return;
            }
        } catch (error) {
            console.error('Config opslaan fout:', error);
            this.showError('settings', this.t('errors.settingsSave'));
            return;
        }

        if (showLoading) {
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this.t('loading')}`;
            button.disabled = true;
        }

        const activeOrg = this.config?.app?.activeYesplanOrg;
        const loadBoth = activeOrg === 'both';
        // Bij handmatig "Laad Zalen" willen we altijd de huidige zaal-lijst.
        // Daarom bypassen we de main-process cache.
        const fetchParams = loadBoth
            ? { org: 'both', skipCache: true }
            : (orgNum === 2 ? { org: 2, skipCache: true } : { org: 1, skipCache: true });
        if (loadBoth) {
            const otherConfig = orgNum === 1 ? this.config.yesplan2 : this.config.yesplan;
            if (!otherConfig?.baseURL || !otherConfig?.apiKey) {
                if (showLoading) this.showError('settings', this.t('messages.configureBothOrgs'));
                if (showLoading) { button.innerHTML = originalText; button.disabled = false; }
                return;
            }
        }

        try {
            const result = await window.electronAPI.getYesplanVenues(fetchParams);

            if (result.success && result.data && result.data.length > 0) {
                this.availableVenues = result.data;
                this.populateVenueSelector();
                this.populateVenueOrderSettings();
                if (showLoading) this.showSuccess(this.t('messages.venuesLoaded', { n: result.data.length }));
            } else {
                if (showLoading) alert('Geen zalen gevonden. Controleer je API instellingen.');
            }
        } catch (error) {
            console.error('Zalen laden fout:', error);
            if (showLoading) alert(`Fout bij laden zalen: ${error.message || 'Onbekende fout'}`);
        } finally {
            if (showLoading) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showSuccess(message) {
        // Eenvoudige success melding
        const notification = document.createElement('div');
        notification.className = 'success';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1001';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '8px';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupAutoRefresh() {
        // Auto refresh wordt afgehandeld via IPC event van main.js (cron job)
        // Geen extra setInterval nodig om dubbele refreshes te voorkomen
    }

    /**
     * Electron: update-banner + handmatige check (Instellingen). Geen-op op web/Capacitor.
     */
    setupDesktopUpdates() {
        if (typeof window.electronAPI?.onUpdateStatus !== 'function') return;

        const banner = document.getElementById('updateBanner');
        if (banner) {
            banner.addEventListener('click', async () => {
                const phase = banner.dataset.phase;
                if (phase === 'manual-download' && window.electronAPI?.openExternal) {
                    await window.electronAPI.openExternal('https://github.com/Deurklink-WT/theater-dashboard/releases/latest');
                    return;
                }
                if (phase === 'downloaded' && window.electronAPI.quitAndInstallUpdate) {
                    try {
                        const r = await window.electronAPI.quitAndInstallUpdate();
                        if (r && !r.ok) {
                            this._handleUpdateStatus({
                                phase: 'error',
                                error: r.error || r.reason || 'Herstart/installatie mislukt'
                            });
                        }
                    } catch (e) {
                        this._handleUpdateStatus({ phase: 'error', error: e?.message || String(e) });
                    }
                    return;
                }
                if (phase === 'available' && typeof window.electronAPI?.downloadUpdate === 'function') {
                    banner.classList.add('update-banner--disabled');
                    banner.textContent = this.t('updatesBanner.checking');
                    try {
                        const r = await window.electronAPI.downloadUpdate();
                        if (!r?.ok) {
                            this._handleUpdateStatus({
                                phase: 'error',
                                error: r?.error || r?.reason || 'Download mislukt'
                            });
                        }
                    } catch (e) {
                        this._handleUpdateStatus({ phase: 'error', error: e?.message || String(e) });
                    }
                }
            });
        }

        window.electronAPI.onUpdateStatus((payload) => this._handleUpdateStatus(payload));

        const btn = document.getElementById('checkUpdatesBtn');
        if (btn) {
            btn.addEventListener('click', () => this.manualCheckForUpdates());
        }
    }

    _handleUpdateStatus(p) {
        const banner = document.getElementById('updateBanner');
        if (!banner || !p) return;

        if (this._updateBannerHideTimer) {
            clearTimeout(this._updateBannerHideTimer);
            this._updateBannerHideTimer = null;
        }

        banner.className = 'update-banner';
        banner.dataset.phase = p.phase || '';
        banner.disabled = false;
        banner.removeAttribute('title');

        const show = () => { banner.style.display = 'flex'; };

        if (p.phase === 'checking') {
            show();
            banner.classList.add('update-banner--disabled');
            banner.textContent = this.t('updatesBanner.checking');
            return;
        }
        if (p.phase === 'downloading') {
            show();
            const pct = p.percent != null ? Math.round(p.percent) : null;
            banner.classList.add('update-banner--disabled');
            banner.textContent = pct != null
                ? this.t('updatesBanner.downloading', { n: String(pct) })
                : this.t('updatesBanner.checking');
            return;
        }
        if (p.phase === 'available') {
            show();
            banner.textContent = this.t('updatesBanner.available', { v: p.version || '?' });
            return;
        }
        if (p.phase === 'downloaded') {
            show();
            banner.classList.add('update-banner--ready');
            banner.textContent = this.t('updatesBanner.restart');
            banner.title = this.t('updatesBanner.restart');
            return;
        }
        if (p.phase === 'not-available') {
            show();
            banner.textContent = this.t('updatesBanner.uptodate');
            this._updateBannerHideTimer = setTimeout(() => {
                banner.style.display = 'none';
            }, 4000);
            return;
        }
        if (p.phase === 'error') {
            const raw = String(p.error || 'Error');
            const lower = raw.toLowerCase();
            const isSignatureLike = lower.includes('code signature') || lower.includes('codesign') || lower.includes('cannot be verified');

            show();
            if (isSignatureLike) {
                banner.classList.add('update-banner--info');
                banner.dataset.phase = 'manual-download';
                banner.textContent = this.t('updatesBanner.manualInstall');
                banner.title = this.t('updatesBanner.manualInstall');
                return;
            }

            banner.classList.add('update-banner--error');
            const msg = raw.slice(0, 160);
            banner.textContent = msg;
            this._updateBannerHideTimer = setTimeout(() => {
                banner.style.display = 'none';
            }, 10000);
            return;
        }
        if (p.phase === 'info' && p.info === 'private_repo') {
            // Niet als storende opstartbanner tonen; alleen bij handmatige check in instellingen.
            banner.style.display = 'none';
            return;
        }
    }

    async manualCheckForUpdates() {
        const out = document.getElementById('updateCheckResult');
        if (!window.electronAPI?.checkForUpdates) {
            if (out) out.textContent = '';
            return;
        }
        if (out) out.textContent = this.t('updates.checking');
        try {
            const r = await window.electronAPI.checkForUpdates();
            if (r.reason === 'development') {
                if (out) out.textContent = this.t('updates.devNoop');
            } else if (r.reason === 'disabled') {
                if (out) out.textContent = this.t('updates.disabled');
            } else if (r.ok) {
                if (out) {
                    out.textContent = r.updateAvailable
                        ? this.t('updates.okAvailable', { v: r.version || '?' })
                        : this.t('updates.okUptodate');
                }
            } else if (out) {
                out.textContent = this.t('updates.checkFailed', { msg: r.error || '?' });
            }
        } catch (e) {
            if (out) out.textContent = this.t('updates.checkFailed', { msg: e?.message || String(e) });
        }
    }

    /** Bepaal of balletvloer/vleugel/orkestbak/zaalplattegrond getoond moeten worden.
     *  Gebruikt app.venueResourceOptions per zaal (configuratie in instellingen).
     *  Fallback: oude zaalnaam-pattern (WTPY, MCGZ, DKW, MCKZ) voor backwards compatibility. */
    getBalletvloerVleugelDisplay(venueName, venueId) {
        const opts = this.getVenueResourceOptions(venueId, venueName);
        if (opts) return opts;
        const v = String(venueName || '').toUpperCase();
        const code = String(v.split(/[,\s(]/)[0] || '').trim();
        const canShowSeating = this.hasItixBaseURLForVenue(venueId);
        if (['WTPY', 'MCGZ', 'DKW'].includes(code)) return { showBalletvloer: true, showVleugel: true, showOrkestbak: true, showZaalplattegrond: canShowSeating };
        if (code === 'MCKZ') return { showBalletvloer: false, showVleugel: true, showOrkestbak: true, showZaalplattegrond: canShowSeating };
        return { showBalletvloer: false, showVleugel: false, showOrkestbak: false, showZaalplattegrond: canShowSeating };
    }

    shouldShowTechnicalPartForEvent(event, partKey, enabledByVenue) {
        if (!enabledByVenue || !event) return false;
        if (partKey === 'balletvloer') return !!event.hasBalletvloer;
        if (partKey === 'vleugel') return !!event.hasVleugel;
        if (partKey === 'orkestbak') {
            const ov = String(event.orkestbakValue || '').trim().toLowerCase();
            return !!event.hasOrkestbak || ov === 'ja' || ov === 'yes' || ov === 'open';
        }
        return false;
    }

    getVenueResourceOptions(venueId, venueName) {
        const config = this.config.app?.venueResourceOptions || {};
        if (!config || typeof config !== 'object') return null;

        const toOpts = (opts) => opts && typeof opts === 'object' ? {
            showBalletvloer: !!opts.balletvloer,
            showVleugel: !!opts.vleugel,
            showOrkestbak: !!opts.orkestbak,
            showZaalplattegrond: this.hasItixBaseURLForVenue(venueId) ? (opts.zaalplattegrond !== false) : false
        } : null;

        if (venueId) {
            const byId = toOpts(config[String(venueId)]);
            if (byId) return byId;
        }
        if (venueName && this.availableVenues?.length) {
            const nameStr = String(venueName).trim();
            const firstPart = nameStr.split(',')[0].trim();
            const venue = this.availableVenues.find(v => {
                const vn = (v.name || '').trim();
                return vn === nameStr || vn === firstPart ||
                    vn.toUpperCase().includes(firstPart.toUpperCase()) ||
                    firstPart.toUpperCase().includes(vn.toUpperCase().split(' ')[0]);
            });
            if (venue) {
                const byId = toOpts(config[String(venue.id)]);
                if (byId) return byId;
            }
        }
        return null;
    }

    /** Mastertitel / gekoppelde koppen: "titel - artiest" zodra artiest in Yesplan staat. */
    buildEventDisplayTitle(title, performer) {
        const t = String(title || '').trim();
        const p = String(performer || '').trim();
        if (!p) return t;
        return `${t} - ${p}`;
    }

    updateDetailViewTitle(venueName, eventTitle) {
        const el = document.getElementById('detailViewVenueName');
        if (!el) return;
        const venue = venueName || 'Zaal';
        el.textContent = eventTitle ? `${venue} – ${eventTitle}` : venue;
    }

    getVenueName() {
        const selectedIds = this.getSelectedVenueIds();
        if (selectedIds.length === 0) return null;
        if (selectedIds.length === 1) return this.getVenueNameById(selectedIds[0]);
        return `${selectedIds.length} zalen`;
    }

    getVenueNameById(venueId) {
        if (!venueId) return null;
        const canonicalId = this.getCanonicalVenueId(venueId);
        
        // Zoek in beschikbare zalen
        const venue = this.availableVenues.find(v => String(v.id) === String(canonicalId));
        if (venue) return this.getVenueDisplayName(venue);
        
        // Probeer de naam uit de events te halen
        if (this.data.yesplan && this.data.yesplan.data && this.data.yesplan.data.length > 0) {
            const event = this.data.yesplan.data[0];
            if (event.locations && Array.isArray(event.locations)) {
                const location = event.locations.find(loc => String(loc.id) === String(venueId));
                if (location) return location.name;
            }
        }
        
        return null; // Naam niet beschikbaar
    }
}


// App initialiseren wanneer DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
    new TheaterDashboard();
});

