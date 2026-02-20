# Raspberry Pi Autostart Instructies

Er zijn twee manieren om de Theater Dashboard app automatisch te laten starten bij het opstarten van de Raspberry Pi:

## Optie 1: Systemd Service (Aanbevolen)

1. Kopieer het service bestand naar de systemd directory:
```bash
sudo cp theater-dashboard.service /etc/systemd/system/
```

2. Herlaad systemd:
```bash
sudo systemctl daemon-reload
```

3. Activeer de service:
```bash
sudo systemctl enable theater-dashboard.service
```

4. Start de service:
```bash
sudo systemctl start theater-dashboard.service
```

5. Controleer de status:
```bash
sudo systemctl status theater-dashboard.service
```

**De service starten/stoppen:**
- Starten: `sudo systemctl start theater-dashboard.service`
- Stoppen: `sudo systemctl stop theater-dashboard.service`
- Herstarten: `sudo systemctl restart theater-dashboard.service`
- Uitschakelen: `sudo systemctl disable theater-dashboard.service`

## Optie 2: Desktop Autostart (Voor desktop environments)

1. Maak de autostart directory aan (als deze niet bestaat):
```bash
mkdir -p ~/.config/autostart
```

2. Kopieer het desktop bestand:
```bash
cp theater-dashboard.desktop ~/.config/autostart/
```

3. Maak het uitvoerbaar:
```bash
chmod +x ~/.config/autostart/theater-dashboard.desktop
```

De app start nu automatisch wanneer je inlogt op de desktop.

**Autostart uitschakelen:**
```bash
rm ~/.config/autostart/theater-dashboard.desktop
```

## Troubleshooting

Als de app niet start, controleer:
- Logs van systemd service: `sudo journalctl -u theater-dashboard.service -f`
- Of de app handmatig werkt: `theater-dashboard`
- Of X11 display beschikbaar is: `echo $DISPLAY`
