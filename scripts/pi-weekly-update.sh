#!/bin/bash
# Wekelijkse Pi-update: maandag 04:00 uur
# Voer uit als root via cron: 0 4 * * 1 /path/to/pi-weekly-update.sh

set -e
logger -t pi-weekly-update "Start wekelijkse update"
apt-get update -qq
apt-get upgrade -y -qq
logger -t pi-weekly-update "Update voltooid, reboot over 60 seconden"
sleep 60
reboot
