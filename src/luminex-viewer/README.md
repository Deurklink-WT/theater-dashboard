# sACN Flow Viewer — Luminex

Grafische live-weergave van alle sACN-flows door het theaternetwerk, in één
oogopslag: **Bronnen → Universes → Luminex node-engines → DMX-uitgangen**,
inclusief merging, prioriteiten en de winnende bron per universe.

Typisch scenario: het huis draait op een eigen console, een gast komt binnen
met een eigen console en sACN-output. Beide bronnen verschijnen automatisch in
de viewer, je ziet per universe wie er zendt, met welke prioriteit, of er
gemerged wordt (HTP of prioriteit) en via welke LumiNode-poort het signaal de
zaal in gaat.

## Vereisten

- **Node.js 18 of nieuwer** — verder géén dependencies, geen `npm install`.
- De machine waarop de server draait moet op het **sACN-netwerk** zitten
  (multicast bereikbaar) en de LumiNode(s) via HTTP kunnen bereiken.

## Starten

```
node server/index.js
```

of dubbelklik `start.cmd` (Windows). Open daarna **http://localhost:8765**.

## Hoe het werkt

| Onderdeel | Bron van de data |
|---|---|
| Bronnen (consoles) | Live meeluisteren op sACN multicast (E1.31, UDP 5568). Naam, IP, prioriteit, fps en per-address-priority komen rechtstreeks uit de pakketten. |
| Universes & merging | Berekend uit de live pakketten: hoogste prioriteit wint, bij gelijke prioriteit HTP-merge. |
| Luminex nodes | Web-API van de LumiNode/LumiCore (`/api/deviceinfo`, `/api/processblock`, `/api/dmx/ports`), elke 5 s gepolld. |
| DMX-uitgangen | Poortstatus uit de node-API; koppeling engine→poort uit de configuratie (of 1-op-1 aangenomen bij standaardconfig). |

## Instellingen (⚙ in de UI)

- **LumiNodes**: één per regel — `ip` of `ip, naam` of `ip, naam, wachtwoord`.
- **Universe-bereik**: welke universes er gejoind worden op multicast
  (standaard 1–32, max. 256 tegelijk).
- **Modus**: `auto` (demo zolang er geen verkeer/nodes zijn), `live` of `demo`.
- **Netwerkadapter**: kies in ⚙ Instellingen — **Automatisch** joint alle actieve adapters (aanbevolen op Windows). Kies één specifieke adapter als sACN op het verkeerde netwerk binnenkomt (bijv. alleen `10.0.1.41`, niet VirtualBox `192.168.56.x`).
- **Luister-interface**: oude handmatige IP-invoer is vervangen door een dropdown met gedetecteerde adapters.

Instellingen worden opgeslagen in `config.json`.

## Demo-modus

Zonder live netwerk toont de app een demoscenario: huisconsole (grandMA3),
gastconsole (Avolites) en een backup-console. Op universe 2 neemt de gast elke
20 seconden over met prioriteit 200 — zo zie je de prioriteit-takeover en
HTP-merge in actie.

## Tips

- Klik op een bron, universe, engine of poort om de **volledige route** op te
  lichten; het detailpaneel rechts toont alle details (incl. ruwe API-data van
  de node, handig per firmwareversie).
- Draait er al andere sACN-software (bijv. **SACNViewer**) op dezelfde machine, dan
  vecht die om UDP-poort **5568**. Op Windows wint maar één programma — sluit
  SACNViewer als je deze viewer wilt gebruiken, of andersom. De statusbalk toont
  `sACN: 0 pakketten` en een waarschuwing als er niets binnenkomt.
- **LumiNode offline?** Vul het IP in via ⚙ Instellingen, klik **Node testen**,
  en daarna **Opslaan**. Zonder opgeslagen IP wordt de node niet gepolld
  (`config.json` → `nodes`).
