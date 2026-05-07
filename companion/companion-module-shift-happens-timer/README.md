# companion-module-shift-happens-timer

Bitfocus **Companion 3**-module die OSC naar **Shift Happens Theater Dashboard** stuurt om voorstelling-timerstappen te triggeren (bijv. Stream Deck).

## Ontwikkeling

```bash
yarn install
yarn companion-module-build   # of: yarn package
```

Koppel de gebouwde map als **development connection** in Companion (zie Companion-docs) of publiceer naar de module registry.

## Zonder deze repo (generieke OSC)

In Companion kun je ook de ingebouwde **OSC**-module gebruiken:

- **Host:** `127.0.0.1` (of IP van de machine met de app)
- **Poort:** `3955` (of `OSC_TIMER_PORT`)
- **Pad:** `/shift-happens/timer/step`
- **Argumenten:** twee strings — `slotId` (bijv. `middag`), `stepId` (bijv. `deuren_open`)

Alternatief pad: `/shift-happens/timer/<slotId>/<stepId>` (één OSC-adres, geen aparte args).

## Omgeving (app)

- `OSC_TIMER_PORT` — standaard `3955`
- `OSC_TIMER_HOST` — standaard `127.0.0.1` (alleen deze interface)
