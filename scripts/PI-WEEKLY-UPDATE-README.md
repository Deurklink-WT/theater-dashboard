# Wekelijkse Pi-update (maandag 04:00)

## Op de Pi uitvoeren

### 1. Script kopiëren
Kopieer `pi-weekly-update.sh` naar de Pi, bijvoorbeeld:
```bash
sudo cp pi-weekly-update.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/pi-weekly-update.sh
```

### 2. Cron-job instellen
```bash
sudo crontab -e
```

Voeg deze regel toe (maandag om 04:00):
```
0 4 * * 1 /usr/local/bin/pi-weekly-update.sh
```

Opslaan en afsluiten (nano: Ctrl+O, Enter, Ctrl+X).

### 3. Controleren
```bash
sudo crontab -l
```

## Wat doet het script?
- `apt-get update` + `apt-get upgrade -y`
- 60 seconden wachten (zodat theater-dashboard service kan herstarten)
- `reboot`

Logs zijn zichtbaar via `journalctl` of `grep pi-weekly-update /var/log/syslog`.
