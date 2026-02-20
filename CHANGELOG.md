# Changelog

Alle belangrijke wijzigingen in dit project worden gedocumenteerd in dit bestand.

## [1.4.0] - 2026

### Toegevoegd
- **Twee Yesplan-organisaties**: In instellingen kun je nu twee Yesplan-API-codes invoeren (Organisatie 1 en 2) en wisselen via "Actieve organisatie".
- **Beide organisaties**: Optie "Beide organisaties" combineert events en zalen van beide Yesplan-organisaties in één overzicht.
- **Filters**: Twee nieuwe filters (filter-icoon): "Alleen evenementen met technisch personeel" en "Alleen evenementen met technische resources".
- **Orkestbak**: Naast balletvloer en vleugel; toont de waarde uit Yesplan (bv. grote bak, kleine bak, ja/nee).
- **Technische opties per zaal**: Stel per zaal in welke opties (balletvloer, vleugel, orkestbak) getoond worden; geschikt voor meerdere schouwburgen.

### Gewijzigd
- **Weekoverzicht**: Titel verkort naar "Weekoverzicht" (zonder "– evenementen & techniek").
- **Instellingen Yesplan**: Zaal-selectie verwijderd; zaal kies je via de header-dropdown. "Laad Zalen" haalt zalen op voor zaalvolgorde en header.
- **Organisatienamen**: Geef per Yesplan-organisatie een eigen naam; verschijnt in de dropdown en bij zalen in "Beide"-modus.
- **Zaalplattegrond**: Bij geen zaalplattegrond wordt "Geen zaalplattegrond beschikbaar" getoond.
- **Instellingen**: Opslaan sluit het venster niet meer; Annuleren-knop verwijderd.
- **Extra thema's**: Roze, Groen, Amber, Grijs en Paars kleurmodi.

### Beveiliging
- **API-keys versleuteld**: Gevoelige configuratie wordt met Electron safeStorage versleuteld opgeslagen.
- **URL-validatie**: Externe links worden gevalideerd voordat ze worden geopend (alleen https, toegestane domeinen).

## [1.3.0] - 2026

### Toegevoegd
- **Master card in detail view**: Bij 1 dag + 1 zaal een grote card met zaalnaam als titel, daarin de subcards (zoals thuis en weekoverzicht).
- **Uitgebreide systeemstatus**: Klik op de status (Online/Deels bereikbaar/Offline) voor een popover met per-systeem status (Yesplan, Personeel, Itix, Priva).
- **Drie statusniveaus**: Online (alles werkt), Deels bereikbaar (een deel werkt), Offline (niets werkt).
- **Status in hoofdscherm**: Online-indicator toegevoegd in de header wanneer je op het hoofdscherm bent.

### Gewijzigd
- **Status alleen in master cards**: Online/Offline niet meer in de subcards; alleen in de master card (week, detail) of naast Yesplan-titel (home).
- **Minder dubbele info in eventscherm**: Zaannaam en evenementnaam 1x in de mastertitel; titel en zaal weggelaten uit Yesplan-, Tijdschema- en Itix-subcards bij 1 evenement.
- **Yesplan card**: Titel verkort van "Yesplan - Evenementen" naar "Yesplan".
- **Zaalplattegrond**: Titel als losse titel boven de klikbare knop; styling gelijkgetrokken met Uren Techniek.
- **Update tijd verwijderd**: Tijdstempel naast Online-status overal verwijderd.
- **Thuisknop actief**: Thuisknop krijgt actief kleurtje wanneer je op het thuisscherm bent (zoals week-knop).
- **Mac fullscreen**: Groene plus-knop doet nu beeldvullend fullscreen; venster opent standaard op volledige schermgrootte.
- **Terug-knop**: Altijd zichtbaar; ga terug naar vorig scherm (week/detail → home).
- **Zaalvolgorde**: Oog-icoon per zaal om een zaal te verbergen in de zaal-dropdown.
- **Instellingen**: Organisatie ID veld verwijderd.
- **Personeel kaart**: Koppen verkort – "Techniek", "Horeca", "Front Office" (zonder "Uren").

## [1.2.0] - 2026

### Toegevoegd
- **Weekoverzicht**: Nieuwe knop naast de thuisknop opent een weekweergave met alleen evenementen en technische planning voor alle actieve zalen. Zeven dagen in kolommen, inclusief technisch materiaal, technische lijst en opmerkingen.
- **Tijdschema**: Kaart met dagprogramma uit Yesplan, zichtbaar bij 1 dag + 1 zaal geselecteerd. Standaard als 2e kolom van links (op verzoek van Jennigje).
- **Verplaatsbare cards**: Kaarten zijn versleepbaar; sleep de titelbalk om de volgorde aan te passen. Volgorde wordt opgeslagen (op verzoek van Eelco).
- **Yesplan-cache**: Responses worden 3 minuten gecachet om de server minder te belasten bij navigatie. Vernieuwen-knop, menu "Data vernieuwen" en auto-refresh halen altijd verse data op (bypass cache).

### Gewijzigd
- **Datum-navigatie en requests**: "Latest-request-wins" bij snel wisselen van datum; oude responses overschrijven geen nieuwere meer. Vorige/volgende-knoppen worden uitgeschakeld tijdens het laden om dubbele requests te voorkomen.
- **"Geen evenementen"-melding**: Gebruikt nu de geselecteerde datum in plaats van altijd "vandaag".

### Technisch
- In-memory Yesplan-cache in main process (TTL 3 min, max 100 entries). `skipCache`-parameter bij vernieuwen en auto-refresh.

## [1.1.0] - 2026-01-19

### Toegevoegd
- **Multi-select voor zalen**: Mogelijkheid om meerdere zalen tegelijk te selecteren in de zalen dropdown (op verzoek van R. Bijker)
- **Zalen dropdown als selectieknoppen**: Zalen worden nu getoond als klikbare knoppen in een 3-kolommen grid layout
- **Technisch materiaal weergave**: Technisch materiaal uit Yesplan resources wordt nu getoond in de event cards onder de technische lijst (op verzoek van R. Bijker)
- **Verbeterde datum picker**: Bij "Kies eigen datum" opent nu automatisch een kalender met daarnaast een veld voor handmatige datum invoer (dd-mm-jjjj)
- **Uitgebreide datum navigatie**: 
  - Vooruit navigeren tot 1 jaar vooruit (was 6 dagen)
  - Achteruit navigeren tot max 1 week terug
  - Navigatie knoppen blijven altijd zichtbaar en worden disabled bij de grenzen

### Gewijzigd
- **Datum weergave**: Vaste breedte voor datum selectie dropdown om verspringen van navigatie knoppen te voorkomen
- **Terug knop styling**: Terug knop wordt rood wanneer je op de maximale achteruit positie zit (1 week terug)
- **Zalen dropdown layout**: Grid layout met 3 kolommen die naar links uitlijnt in plaats van rechts, zodat het menu binnen het venster blijft

### Technisch
- Aangepaste date bounds logica voor flexibelere datum navigatie
- Verbeterde resource extractie uit Yesplan API voor technisch materiaal
- Uitgebreide event details API calls met resourcebookings expand parameter
- Verbeterde synchronisatie tussen kalender en handmatige datum invoer
