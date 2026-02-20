#!/bin/bash

# Script om iconen te maken voor macOS en Windows
# Gebruik: ./scripts/create-icons.sh

ICON_SOURCE="build/icon.png"
ICONSET_DIR="build/icon.iconset"
ICNS_OUTPUT="build/icon.icns"
ICO_OUTPUT="build/icon.ico"

# Check of source bestand bestaat
if [ ! -f "$ICON_SOURCE" ]; then
    echo "Fout: $ICON_SOURCE niet gevonden!"
    echo "Plaats een PNG bestand (1024x1024 of groter) in build/icon.png"
    exit 1
fi

echo "Icon bestand gevonden: $ICON_SOURCE"

# Maak iconset directory voor macOS
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Genereer alle benodigde icon sizes voor macOS
echo "Genereren van macOS icon sizes..."
sips -z 16 16     "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_16x16.png"
sips -z 32 32     "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_16x16@2x.png"
sips -z 32 32     "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_32x32.png"
sips -z 64 64     "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_32x32@2x.png"
sips -z 128 128   "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_128x128.png"
sips -z 256 256   "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_128x128@2x.png"
sips -z 256 256   "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_256x256.png"
sips -z 512 512   "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_256x256@2x.png"
sips -z 512 512   "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_512x512.png"
sips -z 1024 1024 "$ICON_SOURCE" --out "${ICONSET_DIR}/icon_512x512@2x.png"

# Converteer naar .icns
echo "Converteren naar .icns..."
iconutil -c icns "$ICONSET_DIR" -o "$ICNS_OUTPUT"
rm -rf "$ICONSET_DIR"

# Voor Windows .ico maken we verschillende sizes
echo "Genereren van Windows icon sizes..."
# Maak een tijdelijke directory voor Windows icon sizes
TEMP_ICO_DIR=$(mktemp -d)
sips -z 16 16   "$ICON_SOURCE" --out "${TEMP_ICO_DIR}/icon_16.png"
sips -z 32 32   "$ICON_SOURCE" --out "${TEMP_ICO_DIR}/icon_32.png"
sips -z 48 48   "$ICON_SOURCE" --out "${TEMP_ICO_DIR}/icon_48.png"
sips -z 256 256 "$ICON_SOURCE" --out "${TEMP_ICO_DIR}/icon_256.png"

# Voor .ico op macOS kunnen we imagemagick gebruiken, of een eenvoudige conversie
# Als imagemagick niet beschikbaar is, maken we een eenvoudige .ico van de 256x256 versie
if command -v convert &> /dev/null; then
    echo "Converteren naar .ico met ImageMagick..."
    convert "${TEMP_ICO_DIR}/icon_16.png" "${TEMP_ICO_DIR}/icon_32.png" "${TEMP_ICO_DIR}/icon_48.png" "${TEMP_ICO_DIR}/icon_256.png" "$ICO_OUTPUT"
else
    echo "ImageMagick niet gevonden, gebruik sips voor eenvoudige .ico conversie..."
    # Electron-builder kan ook een PNG gebruiken voor Windows, maar we proberen een .ico te maken
    # Als fallback kopiëren we de 256x256 PNG
    cp "${TEMP_ICO_DIR}/icon_256.png" "${ICO_OUTPUT%.ico}.png"
    echo "Let op: Voor Windows wordt een PNG gebruikt in plaats van .ico"
    echo "Installeer ImageMagick (brew install imagemagick) voor een echte .ico conversie"
fi

rm -rf "$TEMP_ICO_DIR"

echo ""
echo "✅ Iconen succesvol aangemaakt!"
echo "   macOS: $ICNS_OUTPUT"
if [ -f "$ICO_OUTPUT" ]; then
    echo "   Windows: $ICO_OUTPUT"
else
    echo "   Windows: ${ICO_OUTPUT%.ico}.png (gebruik ImageMagick voor .ico)"
fi
