## Shift Happens — voorstelling-timer

Deze module stuurt **OSC UDP** naar de Electron-app **Shift Happens Theater Dashboard** op de geconfigureerde host en poort (standaard `127.0.0.1:3955`).

### Vereisten

- Theater Dashboard draait op dezelfde machine (of bereikbaar via netwerk; zet dan het juiste IP in de module-instellingen).
- In de app moet het voorstelling-timer-scherm voor die dag/sessie beschikbaar zijn (zelfde voorwaarden als een klik op een timerstap).

### Actie: timerstap

Kies **slot** (ochtend / middag / avond / alledag) en **stap** (technische id, zelfde als in de app).

Bericht: adres `/shift-happens/timer/step` met twee string-argumenten: `slotId`, `stepId`.

### Opmerking

Een stap die al gemarkeerd is wordt via OSC **niet** overschreven (geen vervang-dialoog). Alleen de eerste registratie wordt verwerkt.
