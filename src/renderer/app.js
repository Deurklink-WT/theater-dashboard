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
        settings: { colorMode: 'Kleurmodus', language: 'Taal', title: 'Instellingen', save: 'Opslaan', saved: 'Instellingen opgeslagen!', theme: 'Thema', touchscreenMode: 'Touchscreen-modus', touchscreenModeHint: 'Grotere scrollbalk en grotere tikgebieden voor gebruik op aanraakschermen (bijv. Raspberry Pi-kiosk).', venueOrder: 'Zaalvolgorde', venueOrderHint: 'Sleep de zalen om de volgorde aan te passen. Klik op het oog om een zaal te verbergen in de zaal-dropdown.', resetVenueOrder: 'Reset naar standaard', techOptions: 'Technische opties per zaal', techOptionsHint: 'Kies per zaal welke opties (balletvloer, vleugel, orkestbak, zaalplattegrond) getoond worden.', yesplan: 'Yesplan', activeOrg: 'Actieve organisatie', activeOrgHint: 'Bepaal welke Yesplan-organisatie het dashboard gebruikt', org1: 'Organisatie 1', org2: 'Organisatie 2', orgN: 'Organisatie {n}', bothOrgs: 'Beide organisaties', name: 'Naam', baseURL: 'Base URL', apiKey: 'API Key', loadVenues: 'Laad Zalen', loadVenuesHint: 'Haalt zalen op voor zaalvolgorde en header', loadVenuesFullHint: 'Vul per organisatie Base URL en API Key in, klik op "Laad Zalen"', testConnection: 'Test Verbinding', about: 'Over deze app', showVenue: 'Zaal tonen', hideVenue: 'Zaal verbergen', balletvloer: 'Balletvloer', vleugel: 'Vleugel', orkestbak: 'Orkestbak', itix: 'Itix', itixBaseURL: 'Basis-URL zaalplattegrond', itixBaseURLHint: 'Voer het voorvoegsel van de beheer-URL voor de zaalplattegrond in, eindigend vóór het uitvoerings-id (Yesplan-event-id). Voorbeeld: https://tickets.jouworganisatie.nl/beheer/zaalplattegrond/uitvoeringinfo' },
        status: { online: 'Online', offline: 'Offline', deels: 'Deels bereikbaar', warning: 'Waarschuwing', systemStatus: 'Systeemstatus', clickForStatus: 'Klik voor systeemstatus' },
        nav: { back: 'Terug', backTitle: 'Terug naar vorig scherm', home: 'Home', weekView: 'Weekoverzicht', techOverview: 'Technisch overzicht', techOverviewTitle: 'Print technisch overzicht voor deze dag (alle zalen)', prevDay: 'Vorige dag', nextDay: 'Volgende dag', refresh: 'Vernieuwen', searchEvent: 'Zoek evenement', searchEventTitle: 'Zoek op evenementnaam (* en ? als wildcard)' },
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
        }
    },
    en: {
        settings: { colorMode: 'Color mode', language: 'Language', title: 'Settings', save: 'Save', saved: 'Settings saved!', theme: 'Theme', touchscreenMode: 'Touchscreen mode', touchscreenModeHint: 'Larger scrollbar and tap targets for use on touchscreens (e.g. Raspberry Pi kiosk).', venueOrder: 'Venue order', venueOrderHint: 'Drag venues to change the order. Click the eye to hide a venue in the venue dropdown.', resetVenueOrder: 'Reset to default', techOptions: 'Technical options per venue', techOptionsHint: 'Choose per venue which options (dance floor, grand piano, orchestra pit, seating plan) are shown.', yesplan: 'Yesplan', activeOrg: 'Active organisation', activeOrgHint: 'Determine which Yesplan organisation the dashboard uses', org1: 'Organisation 1', org2: 'Organisation 2', orgN: 'Organisation {n}', bothOrgs: 'Both organisations', name: 'Name', baseURL: 'Base URL', apiKey: 'API Key', loadVenues: 'Load Venues', loadVenuesHint: 'Fetches venues for order and header', loadVenuesFullHint: 'Enter Base URL and API Key per organisation, click "Load Venues"', testConnection: 'Test Connection', about: 'About this app', showVenue: 'Show venue', hideVenue: 'Hide venue', balletvloer: 'Dance floor', vleugel: 'Grand piano', orkestbak: 'Orchestra pit', itix: 'Itix', itixBaseURL: 'Seating plan base URL', itixBaseURLHint: 'Enter the admin URL prefix for the seating plan, ending before the performance id (Yesplan event id). Example: https://tickets.example.com/beheer/zaalplattegrond/uitvoeringinfo' },
        status: { online: 'Online', offline: 'Offline', deels: 'Partially available', warning: 'Warning', systemStatus: 'System status', clickForStatus: 'Click for system status' },
        nav: { back: 'Back', backTitle: 'Back to previous screen', home: 'Home', weekView: 'Week overview', techOverview: 'Technical overview', techOverviewTitle: 'Print technical overview for this day (all venues)', prevDay: 'Previous day', nextDay: 'Next day', refresh: 'Refresh', searchEvent: 'Search event', searchEventTitle: 'Search by event name (* and ? as wildcards)' },
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
        this.maxDateOffsetBackward = 7; // Maximaal 1 week terug
        this.currentView = 'home'; // 'home', 'detail' of 'week'
        this.previousView = null; // Voor terug-navigatie
        this.viewHistory = []; // Stapel met eerder geopende view-snapshots voor terug-knop
        this._isNavigatingBack = false; // Voorkomt history-vervuiling tijdens terug-navigatie
        this._pendingHistorySnapshot = null; // Snapshot van staat vóór mutatie/navigatie
        this.isOnline = navigator.onLine; // Internetverbinding status
        this.statusBySystem = { yesplan: null }; // Alleen Yesplan; Priva-koppeling volgt later indien mogelijk
        this.hideCancelledEvents = false; // Filter voor geannuleerde events
        this.filterOnlyWithTechnischPersoneel = false; // Alleen evenementen met technisch personeel
        this.filterOnlyWithTechnischeResources = false; // Alleen evenementen met technische resources
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
        this.settingsNavInitialized = false;
        this.settingsPageKey = 'app-config';
        this.weekEventCount = 0;
        this.locale = 'nl';  // 'nl' of 'en'
        this._updateBannerHideTimer = null; // electron-updater banner auto-hide
        this._lastDayString = null;  // Voor middernacht-check: ga automatisch naar home van nieuwe dag
        this.detailContext = null;   // { productionId, productionName, eventName } wanneer je via een event naar detail gaat: alleen die productie tonen
        
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
        setInterval(() => this.updateDateTimeDisplay(), 60000);
        setInterval(() => this.checkMidnightNavigation(), 3600000);
    }
    
    checkMidnightNavigation() {
        const todayStr = new Date().toDateString();
        if (this._lastDayString !== null && todayStr !== this._lastDayString) {
            this._lastDayString = todayStr;
            this.showHomeView(true);
        } else if (this._lastDayString === null) {
            this._lastDayString = todayStr;
        }
    }

    updateDateTimeDisplay() {
        const now = new Date();
        const dateTimeElement = document.getElementById('currentDateTime');
        if (!dateTimeElement) return;
        const locale = this.locale === 'en' ? 'en-GB' : 'nl-NL';
        const dayName = now.toLocaleDateString(locale, { weekday: 'long' });
        const day = now.getDate();
        const month = now.toLocaleDateString(locale, { month: 'long' });
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        dateTimeElement.textContent = `| ${dayName} ${day} ${month} ${year} | ${hours}:${minutes} |`;
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

        document.getElementById('techOverviewBtn').addEventListener('click', () => {
            this.openTechOverviewPrint();
        });

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
            input.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const renderKeyboard = () => {
            const keysWrap = document.getElementById('touchInputKeyboardKeys');
            if (!keysWrap) return;
            keysWrap.innerHTML = '';
            keyboardRows.forEach((row) => {
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
        const isSettingsTextInput = (el) => {
            if (!(el instanceof HTMLElement)) return false;
            if (!el.closest('#settingsModal')) return false;
            if (el.tagName !== 'INPUT') return false;
            const input = el;
            if (input.disabled || input.readOnly) return false;
            const type = String(input.type || 'text').toLowerCase();
            return ['text', 'password', 'url', 'search', 'email', 'tel'].includes(type);
        };

        const showKeyboard = (input) => {
            if (!isTouchscreenMode() || !isSettingsTextInput(input)) return;
            const el = ensureKeyboardEl();
            this.touchInputKeyboardTarget = input;
            renderKeyboard();
            el.style.display = 'block';
        };

        const hideKeyboard = () => {
            const el = document.getElementById('touchInputKeyboard');
            if (el) el.style.display = 'none';
            this.touchInputKeyboardShift = false;
            this.touchInputKeyboardTarget = null;
        };

        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (isSettingsTextInput(target)) showKeyboard(target);
        });

        document.addEventListener('focusout', () => {
            setTimeout(() => {
                const active = document.activeElement;
                const keyboardHasFocus = !!active?.closest?.('#touchInputKeyboard');
                if (!keyboardHasFocus && !isSettingsTextInput(active)) hideKeyboard();
            }, 0);
        });

        document.addEventListener('click', (e) => {
            const keyBtn = e.target?.closest?.('#touchInputKeyboard .search-key');
            if (!keyBtn) return;
            const key = keyBtn.dataset.key;
            const input = this.touchInputKeyboardTarget;
            if (!input) return;
            input.focus();
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
            
            // Pas thema toe
            this.applyTheme(this.config.app?.theme || 'default');
            // Pas taal toe
            this.applyLanguage(this.config.app?.language || 'nl');
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
                    const validSelections = this.selectedVenues.filter(id =>
                        this.availableVenues.some(v => String(v.id) === String(id))
                    );
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
        this.selectedVenues = venueId ? [String(venueId)] : [];
        
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
                option.textContent = venue.name || this.t('venue.venueId', { id: venue.id });
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
                    option.textContent = venue.name;
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
                const venue = this.availableVenues.find(v => String(v.id) === String(selectedIds[0]));
                valueSpan.textContent = venue ? venue.name : this.t('venue.unknownVenue');
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
            this.updateItixDisplay({ success: true, data: [] }, this.data.reservations);
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
            const result = {
                success: (allUrenInfo.techniek?.length || 0) + (allUrenInfo.horeca?.length || 0) + (allUrenInfo.frontOffice?.length || 0) > 0,
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
            // Gebruik geselecteerde zaal als beschikbaar
            const venueId = this.getPrimarySelectedVenueId();
            const dateRange = this.getDateRange();
            
            const reservationsData = await window.electronAPI.getYesplanReservations({
                startDate: dateRange.start,
                endDate: dateRange.end,
                venueId: venueId
            });
            this.data.reservations = reservationsData;
            
            // Update display met Yesplan verkoopdata en reserveringen
            this.updateItixDisplay({ success: true, data: [] }, reservationsData);
        } catch (error) {
            console.error('Verkoopdata (Yesplan) fout:', error);
            this.data.reservations = { success: false, data: [] };
            this.updateItixDisplay({ success: true, data: [] }, this.data.reservations);
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
    }
    
    async showDetailView(clearDetailContext = false, forceRefresh = false) {
        this.pushHistorySnapshotIfNeeded('detail');
        this.previousView = this.currentView;
        this.currentView = 'detail';
        // Bij dag-navigatie in detailview willen we niet vast blijven zitten op 1 aangeklikt event.
        if (clearDetailContext) this.detailContext = null;
        
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
        
        document.body.classList.remove('home-view-active');
        document.body.classList.remove('week-view-active');
        
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
        document.body.classList.remove('home-view-active');
        document.body.classList.add('week-view-active');

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

        const sortWrap = document.getElementById('weekViewSort');
        if (sortWrap) {
            sortWrap.querySelectorAll('.week-view-sort-btn').forEach((b) => {
                b.classList.toggle('active', b.dataset.sort === this.weekSortMode);
            });
        }

        this.updateVenueSelectorDisplay();
        await this.loadWeekData();
        this.updateBackButtonVisibility();
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
                if (showBalletvloer) parts.push(`Balletvloer: <strong>${bv}</strong>`);
                if (showVleugel) parts.push(`Vleugel: <strong>${vl}</strong>`);
                if (showOrkestbak) parts.push(`Orkestbak: <strong>${ob}</strong>`);
                resources = `<div class="week-event-resources">${parts.join(' · ')}</div>`;
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
        
        // Alleen binnen bereik toestaan (max 1 week terug en 1 jaar vooruit)
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
                this.detailContext = null;
                await this.showDetailView(true, true);
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
                this.detailContext = null;
                await this.showDetailView(true, true);
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
                        if (showBalletvloer) {
                            const balletvloerStatus = event.balletvloerExplicit ? (event.hasBalletvloer ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                            topLineParts.push(`Balletvloer: <strong>${balletvloerStatus}</strong>`);
                        }
                        if (showVleugel) {
                            const vleugelStatus = event.vleugelExplicit ? (event.hasVleugel ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend');
                            topLineParts.push(`Vleugel: <strong>${vleugelStatus}</strong>`);
                        }
                        if (showOrkestbak) {
                            const orkestbakStatus = (event.orkestbakExplicit || event.orkestbakValue)
                                ? (event.orkestbakValue || (event.hasOrkestbak ? this.t('resources.ja') : this.t('resources.nee')))
                                : this.t('resources.nietBekend');
                            topLineParts.push(`Orkestbak: <strong>${orkestbakStatus}</strong>`);
                        }
                        const topLineHtml = topLineParts
                            .map((part) => `<span style="white-space: nowrap;">${part}</span>`)
                            .join('<span style="opacity:.7;">&nbsp;&nbsp;</span>');
                        resourcesInfo = `
                            <div style="margin-top: 0.5rem; padding: 0.5rem; background: #374151; border-radius: 6px; font-size: 0.85rem; color: #a0aec0;">
                                ${topLineHtml ? `<div style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${topLineHtml}</div>` : ''}
                            </div>
                        `;
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
                    
                    // Haal venue ID op uit rawEvent voor klikfunctionaliteit
                    let venueId = null;
                    let eventDate = null;
                    if (event.rawEvent && event.rawEvent.locations && Array.isArray(event.rawEvent.locations) && event.rawEvent.locations.length > 0) {
                        // Neem de eerste location ID
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
                    const titleBlock = isDetailSingleEvent ? '' : `<h4 ${draggableAttr} class="${isHomeView ? 'drag-handle' : ''}">${title}</h4>${performerInfo}`;
                    
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

        if (!scheduleData || scheduleData.length === 0) {
            container.innerHTML = `<div class="info-message">${this.t('messages.noTijdschema')}</div>`;
            return;
        }

        const timeToMinutes = (s) => {
            if (!s || typeof s !== 'string') return 999999;
            const part = s.split(/[\s–—-]/)[0].trim();
            const m = part.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 999999;
        };
        const sorted = [...scheduleData].sort((a, b) => {
            const minA = Math.min(...(a.items || []).map((it) => timeToMinutes(it.time || it.description)));
            const minB = Math.min(...(b.items || []).map((it) => timeToMinutes(it.time || it.description)));
            return minA - minB;
        });

        const escape = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const singleEvent = sorted.length === 1; // Eventnaam staat in mastertitel

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

        container.innerHTML = `<div class="tijdschema-list">${html}</div>`;
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
            return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
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
            if (showBalletvloer) parts.push(`Balletvloer: ${event.balletvloerExplicit ? (event.hasBalletvloer ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend')}`);
            if (showVleugel) parts.push(`Vleugel: ${event.vleugelExplicit ? (event.hasVleugel ? this.t('resources.ja') : this.t('resources.nee')) : this.t('resources.nietBekend')}`);
            if (showOrkestbak) parts.push(`Orkestbak: ${(event.orkestbakExplicit || event.orkestbakValue) ? (event.orkestbakValue || (event.hasOrkestbak ? this.t('resources.ja') : this.t('resources.nee'))) : this.t('resources.nietBekend')}`);
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
        const hasAny = (urenInfo.techniek?.length || 0) + (urenInfo.horeca?.length || 0) + (urenInfo.frontOffice?.length || 0) > 0;
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

        const isLikelySimplePersonnelRaw = (raw) => {
            const s = String(raw || '').trim();
            if (!s) return false;
            if (isClearlyNonPersonnelText(s)) return false;
            // Eenvoudige personeelsregel: 1-4 woorden, letters/spaties/koppeltekens/apostrof.
            return /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'\- ]{1,60}$/.test(s) && s.split(/\s+/).length <= 4;
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

        const techniek = (urenInfo.techniek || []).filter(entry => {
            const entryUpper = String(entry || '').toUpperCase();
            if (isTechnicalRemarksLine(entry)) return false;
            return !entryUpper.includes('VRIJWILLIGER') && !entryUpper.includes('VOLUNTEER');
        });
        const techniekDisplay = toDisplayNameTimePairs(techniek);
        const horeca = (urenInfo.horeca || []).filter(entry => {
            const entryUpper = String(entry).toUpperCase();
            return !entryUpper.includes('VRIJWILLIGER') && !entryUpper.includes('VOLUNTEER');
        });
        const frontOffice = (urenInfo.frontOffice || []).filter(entry => {
            const entryUpper = String(entry).toUpperCase();
            return !entryUpper.includes('VRIJWILLIGER') && !entryUpper.includes('VOLUNTEER');
        });
        const horecaDisplay = toDisplayNameTimePairs(horeca);
        const frontOfficeDisplay = toDisplayNameTimePairs(frontOffice);

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

        container.innerHTML = `
            <div class="shifts-list">
                <div class="data-item" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                        ${this.t('personnel.techniek')}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${renderPersonnelRows(techniekDisplay)}
                    </div>
                </div>
                <div class="data-item" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                        ${this.t('personnel.horeca')}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${renderPersonnelRows(horecaDisplay)}
                    </div>
                </div>
                <div class="data-item" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                        ${this.t('personnel.frontOffice')}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${renderPersonnelRows(frontOfficeDisplay)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Itix / tickets: basis-URL uit instellingen + Yesplan-event-id voor zaalplattegrond-link.
     * baseURL zonder slash aan het einde; er wordt /{eventId} toegevoegd.
     */
    getItixSeatingPlanUrl(eventId) {
        if (typeof window !== 'undefined' && typeof window.buildItixSeatingPlanUrl === 'function') {
            return window.buildItixSeatingPlanUrl(this.config?.itix?.baseURL, eventId);
        }
        const base = String(this.config?.itix?.baseURL || '').trim().replace(/\/+$/, '');
        if (!base || eventId == null || eventId === '') return '';
        return `${base}/${encodeURIComponent(String(eventId))}`;
    }

    async updateItixDisplay(data, reservationsData = null) {
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
        
        // Haal reserveringen op
        const reservations = (reservationsData && reservationsData.success && reservationsData.data) 
            ? reservationsData.data 
            : (this.data.reservations && this.data.reservations.success && this.data.reservations.data) 
                ? this.data.reservations.data 
                : [];
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
                        
                        // Haal reserveringen voor dit evenement op
                        const eventReservations = reservations.filter(r => r.eventId === event.id);
                        const reservedCount = reserved || eventReservations.reduce((sum, r) => sum + (r.tickets || 1), 0);
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
                            let seatingPlanHtml;
                            if (seatingPlanId) {
                                const seatingPlanUrl = this.getItixSeatingPlanUrl(seatingPlanId);
                                if (seatingPlanUrl) {
                                    const escapedPlanUrl = escapeInline(seatingPlanUrl);
                                    seatingPlanHtml = `
                                    <a href="#" class="rider-link"
                                       data-rider-url="${escapedPlanUrl}"
                                       style="color: #818cf8; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(129, 140, 248, 0.1); border-radius: 4px; transition: all 0.2s; cursor: pointer;">
                                        <i class="fas fa-external-link-alt"></i>
                                        <span>${this.escapeHtml(this.t('cards.openSeatingPlan'))}</span>
                                    </a>
                                `;
                                } else {
                                    seatingPlanHtml = `<p style="color: #718096; font-size: 0.9rem; margin: 0;">${this.escapeHtml(this.t('messages.seatingPlanNoBase'))}</p>`;
                                }
                            } else {
                                seatingPlanHtml = `<p style="color: #718096; font-size: 0.9rem; margin: 0;">${this.escapeHtml(this.t('messages.seatingPlanUnavailable'))}</p>`;
                            }
                            seatingPlanBlock = `
                                <div>
                                    <h4 style="margin-bottom: 0.5rem; margin-top: 0; color: #e2e8f0; font-size: 1rem; font-weight: 600;">
                                        ${this.escapeHtml(this.t('cards.seatingPlan'))}
                                    </h4>
                                    ${seatingPlanHtml}
                                </div>
                            `;
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
                ${reservations.length > 0 && !yesplanEvents.some(e => reservations.some(r => r.eventId === e.id)) ? `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e2e8f0;">
                    <h4 style="margin-bottom: 0.75rem; color: #e2e8f0;"><i class="fas fa-bookmark"></i> Reserveringen</h4>
                    <div class="events-list">
                        ${reservations.map(res => `
                            <div class="data-item">
                                <h4>${res.eventName}</h4>
                                <p><strong>${res.customerName || 'Onbekend'}</strong> - ${res.tickets || 1} ticket(s)</p>
                                ${res.customerEmail ? `<p style="font-size: 0.85rem; color: #718096;"><i class="fas fa-envelope"></i> ${res.customerEmail}</p>` : ''}
                                ${res.formattedDate ? `<p style="font-size: 0.85rem; color: #718096;"><i class="fas fa-calendar"></i> ${res.formattedDate}</p>` : ''}
                                ${res.notes ? `<p style="font-size: 0.85rem; color: #718096; font-style: italic;">${res.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
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
            // Status wordt automatisch geüpdatet bij volgende data load
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
        ['yesplan'].forEach(system => {
            this.statusBySystem[system] = 'offline';
        });
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
        const statuses = Object.values(this.statusBySystem || {}).filter(Boolean);
        const onlineCount = statuses.filter(s => s === 'online').length;
        const aggregate = statuses.length === 0 ? 'offline'
            : onlineCount === statuses.length ? 'online'
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

        const systems = [
            { id: 'yesplan', label: 'Yesplan' }
        ];

        let html = '';
        for (const { id, label } of systems) {
            const status = this.statusBySystem?.[id] || null;
                const value = status === 'online' ? this.t('status.online') : status ? this.t('status.offline') : '–';
            const dotClass = status === 'online' ? 'online' : 'offline';
            html += `<div class="status-popover-row"><span class="status-dot ${dotClass}"></span><span class="status-label">${label}</span><span class="status-value" style="color:${status === 'online' ? '#48bb78' : status ? '#f56565' : '#718096'}">${value}</span></div>`;
        }
        content.innerHTML = html;

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

    openSettings() {
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
                    '#themeSelect', '#languageSelect', '#touchscreenModeCheckbox',
                    '#activeYesplanOrg',
                    '#yesplanOrgName', '#yesplanBaseURL', '#yesplanApiKey',
                    '#yesplanOrgName2', '#yesplanBaseURL2', '#yesplanApiKey2',
                    '#privaBaseURL', '#privaApiKey', '#privaSystemId',
                    '#apiServerSection',
                    '.loadVenuesBtn'
                ]
            },
            {
                key: 'yesplan',
                title: this.locale === 'en' ? 'Yesplan Settings' : 'Yesplan instellingen',
                selectors: ['#venueOrderList', '#resetVenueOrder', '#venueResourceOptionsList']
            },
            {
                key: 'itix',
                title: this.locale === 'en' ? 'Itix Settings' : 'Itix instellingen',
                selectors: ['#itixBaseURL']
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
            if (sectionEl.querySelector('#yesplanBaseURL') || sectionEl.querySelector('#yesplanBaseURL2') || sectionEl.querySelector('#activeYesplanOrg')) return 'app-config';
            if (sectionEl.querySelector('#privaBaseURL')) return 'app-config';
            if (sectionEl.querySelector('#venueOrderList') || sectionEl.querySelector('#venueResourceOptionsList')) return 'yesplan';
            if (sectionEl.querySelector('#itixBaseURL')) return 'itix';
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
                    if (section.querySelector('#venueResourceOptionsList')) return 0;
                    if (section.querySelector('#venueOrderList')) return 1;
                    return 2;
                };
                return rank(a) - rank(b);
            });
        }

        // Zet de fysieke sectievolgorde in het formulier gelijk aan de tab-volgorde en subvolgorde.
        if (settingsForm) {
            const desired = [
                ...(this.settingsPageSections['app-config'] || []),
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
                const shouldShow = section.dataset.settingsPage === pageKey;
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
        const name = config?.name?.trim();
        return name || this.t('settings.orgN', { n: orgNum });
    }

    escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    populateSettingsForm() {
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
        document.getElementById('yesplanBaseURL').value = this.config.yesplan?.baseURL || '';
        document.getElementById('yesplanApiKey').value = this.config.yesplan?.apiKey || '';
        // Yesplan organisatie 2
        const url2El = document.getElementById('yesplanBaseURL2');
        const key2El = document.getElementById('yesplanApiKey2');
        const name2El = document.getElementById('yesplanOrgName2');
        if (name2El) name2El.value = this.config.yesplan2?.name || '';
        if (url2El) url2El.value = this.config.yesplan2?.baseURL || '';
        if (key2El) key2El.value = this.config.yesplan2?.apiKey || '';

        // Priva
        document.getElementById('privaBaseURL').value = this.config.priva?.baseURL || '';
        document.getElementById('privaApiKey').value = this.config.priva?.apiKey || '';
        document.getElementById('privaSystemId').value = this.config.priva?.systemId || '';

        const itixBaseEl = document.getElementById('itixBaseURL');
        if (itixBaseEl) itixBaseEl.value = this.config.itix?.baseURL || '';

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
        // Touchscreen-modus
        const touchscreenModeCheckbox = document.getElementById('touchscreenModeCheckbox');
        if (touchscreenModeCheckbox) {
            touchscreenModeCheckbox.checked = !!this.config.app?.touchscreenMode;
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
                <span class="venue-order-name">${venue.name || this.t('venue.venueId', { id: venue.id })}</span>
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
            const item = document.createElement('div');
            item.className = 'venue-resource-options-item';
            item.innerHTML = `
                <span class="venue-resource-name">${this.escapeHtml(venue.name || this.t('venue.venueId', { id }))}</span>
                <div class="venue-resource-checkboxes">
                    <label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="balletvloer" ${v.balletvloer ? 'checked' : ''}> ${this.t('settings.balletvloer')}</label>
                    <label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="vleugel" ${v.vleugel ? 'checked' : ''}> ${this.t('settings.vleugel')}</label>
                    <label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="orkestbak" ${v.orkestbak ? 'checked' : ''}> ${this.t('settings.orkestbak')}</label>
                    <label><input type="checkbox" data-venue-id="${this.escapeHtml(id)}" data-option="zaalplattegrond" ${v.zaalplattegrond !== false ? 'checked' : ''}> Zaalplattegrond</label>
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
            const preservedSelectedVenues = Array.isArray(this.selectedVenues) ? [...this.selectedVenues] : [];
            const preservedSelectedDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
            const preservedCurrentView = this.currentView;
            const preservedDetailContext = this.detailContext ? { ...this.detailContext } : null;

            const configs = {
                yesplan: {
                    name: document.getElementById('yesplanOrgName').value.trim(),
                    baseURL: document.getElementById('yesplanBaseURL').value,
                    apiKey: document.getElementById('yesplanApiKey').value
                },
                yesplan2: {
                    name: document.getElementById('yesplanOrgName2').value.trim(),
                    baseURL: document.getElementById('yesplanBaseURL2').value,
                    apiKey: document.getElementById('yesplanApiKey2').value
                },
                app: {
                    ...this.config.app,
                    theme: document.getElementById('themeSelect').value,
                    language: document.getElementById('languageSelect')?.value || 'nl',
                    touchscreenMode: document.getElementById('touchscreenModeCheckbox')?.checked ?? false,
                    activeYesplanOrg: (() => {
                        const v = document.getElementById('activeYesplanOrg').value;
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
                    baseURL: (document.getElementById('itixBaseURL')?.value || '').trim()
                }
            };

            // Sla app-instellingen eerst op zodat UI-vinkjes/thema altijd persistenteren,
            // ook als secure storage voor API keys op dit apparaat niet beschikbaar is.
            const appSaveResult = await window.electronAPI.saveConfig('app', configs.app);
            if (!appSaveResult?.success) {
                throw new Error(this.t('errors.settingsSave'));
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
            this.applyTouchscreenMode(document.getElementById('touchscreenModeCheckbox')?.checked ?? false);
            
            // Zalen opnieuw laden als Yesplan configuratie is gewijzigd
            await this.loadVenues(); // Header dropdown zalen
            // loadVenues kan selections opschonen; forceer bewaarde keuze terug zolang die nog bestaat.
            this.selectedVenues = preservedSelectedVenues;
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
        const techOverviewBtn = document.getElementById('techOverviewBtn');
        if (techOverviewBtn) techOverviewBtn.title = this.t('nav.techOverviewTitle');
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) refreshBtn.title = this.t('nav.refresh');
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.title = this.t('settings.title');
        const weekStatus = document.getElementById('weekViewStatus');
        if (weekStatus) weekStatus.title = this.t('status.clickForStatus');
        const homeStatus = document.getElementById('homeViewStatus');
        if (homeStatus) homeStatus.title = this.t('status.clickForStatus');
        const detailStatus = document.getElementById('detailViewStatus');
        if (detailStatus) detailStatus.title = this.t('status.clickForStatus');
        this.updateWeekHeaderSummary(this.weekEventCount || 0);
        this.updateDateDisplay();
        this.updateDateTimeDisplay();
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
            const name = document.getElementById(nameId)?.value?.trim() || current.name;
            const saveResult = await window.electronAPI.saveConfig(configKey, { ...current, name, baseURL, apiKey });
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
        if (/WTPY|MCGZ|DKW/.test(v)) return { showBalletvloer: true, showVleugel: true, showOrkestbak: true, showZaalplattegrond: true };
        if (/MCKZ/.test(v)) return { showBalletvloer: false, showVleugel: true, showOrkestbak: true, showZaalplattegrond: true };
        return { showBalletvloer: false, showVleugel: false, showOrkestbak: false, showZaalplattegrond: true };
    }

    getVenueResourceOptions(venueId, venueName) {
        const config = this.config.app?.venueResourceOptions || {};
        if (!config || typeof config !== 'object') return null;

        const toOpts = (opts) => opts && typeof opts === 'object' ? {
            showBalletvloer: !!opts.balletvloer,
            showVleugel: !!opts.vleugel,
            showOrkestbak: !!opts.orkestbak,
            showZaalplattegrond: opts.zaalplattegrond !== false
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
        
        // Zoek in beschikbare zalen
        const venue = this.availableVenues.find(v => String(v.id) === String(venueId));
        if (venue) return venue.name;
        
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

