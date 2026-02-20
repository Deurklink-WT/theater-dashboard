#!/bin/bash

# Script om de DMG installatie te testen door quarantaine attributen toe te voegen

echo "🧪 DMG Installatie Test Script"
echo "=============================="
echo ""

# Zoek de app
APP_PATH=$(find /Applications -name "Shift Happens.app" -type d 2>/dev/null | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Shift Happens.app niet gevonden in /Applications"
    echo "   Installeer eerst de app uit de DMG"
    exit 1
fi

echo "📱 App gevonden: $APP_PATH"
echo ""

# Check huidige attributen
echo "🔍 Huidige attributen:"
xattr -l "$APP_PATH" 2>/dev/null | head -5 || echo "   Geen attributen gevonden"
echo ""

# Vraag bevestiging
read -p "⚠️  Dit script voegt quarantaine attributen toe om te testen. Doorgaan? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Geannuleerd"
    exit 1
fi

# Voeg quarantaine toe (simuleert download van internet)
echo "🔒 Quarantaine attributen toevoegen..."
xattr -w com.apple.quarantine "0081;$(uuidgen);Safari;$(date +%s)" "$APP_PATH" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Quarantaine attributen toegevoegd"
    echo ""
    echo "📋 Nieuwe attributen:"
    xattr -l "$APP_PATH" | grep quarantine || echo "   (niet zichtbaar, maar aanwezig)"
    echo ""
    echo "🧪 Test nu:"
    echo "   1. Probeer de app te openen (dubbelklik)"
    echo "   2. Je zou de 'beschadigd' melding moeten zien"
    echo "   3. Test dan de fix: xattr -cr \"$APP_PATH\""
    echo ""
    echo "🔄 Om terug te gaan naar normaal:"
    echo "   xattr -d com.apple.quarantine \"$APP_PATH\""
else
    echo "❌ Fout bij toevoegen quarantaine attributen"
    exit 1
fi
