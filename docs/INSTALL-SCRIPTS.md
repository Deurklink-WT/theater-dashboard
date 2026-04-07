# Install scripts

## macOS (aanbevolen)

Gebruik het script in deze repository:

```bash
./scripts/install-mac-from-github.sh
```

Specifieke release-tag:

```bash
./scripts/install-mac-from-github.sh v1.5.9
```

### Dubbelklik-variant

Voor niet-technische gebruikers kun je ook `scripts/install-mac.command` gebruiken.
Deze haalt automatisch de actuele `install-mac-from-github.sh` op van GitHub en voert die uit.

## Stabiele assetnamen

Voor macOS publiceer je bij voorkeur beide assets:

- `Shift-Happens-mac-arm64.zip` (voorkeur voor installer)
- `Shift-Happens-mac-arm64.dmg` (fallback)

Daarnaast blijft `latest-mac.yml` nodig voor updater metadata.

## Waarom dit betrouwbaarder is

- kiest automatisch juiste architectuur (`arm64`/`x64`)
- probeert eerst ZIP en valt daarna terug op DMG
- duidelijke foutmeldingen per stap
- geen risicovolle brede delete van `/Applications`
