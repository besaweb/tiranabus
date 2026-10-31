#!/usr/bin/env bash
# Nahraje android/out/TiranaBus.apk do vydání apk-latest (přepíše stávající soubor). Vyžaduje GITHUB_TOKEN s právem zápisu do repozitáře (Contents: Read and write).
set -euo pipefail
cd "$(dirname "$0")"
REPO=besaweb/tiranabus; TAG=apk-latest; APK=out/TiranaBus.apk
: "${GITHUB_TOKEN:?Nastav GITHUB_TOKEN}"
[ -f "$APK" ] || { echo "Chybí $APK, nejdřív spusť build.sh"; exit 1; }
API=https://api.github.com/repos/$REPO
H=(-H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json")
REL=$(curl -fsSL "${H[@]}" "$API/releases/tags/$TAG")
ID=$(printf '%s' "$REL" | python -c "import json,sys;print(json.load(sys.stdin)['id'])")
OLD=$(printf '%s' "$REL" | python -c "import json,sys;print(' '.join(str(a['id']) for a in json.load(sys.stdin)['assets'] if a['name']=='TiranaBus.apk'))")
for a in $OLD; do curl -fsSL -X DELETE "${H[@]}" "$API/releases/assets/$a"; done
curl -fsSL -X POST "${H[@]}" -H "Content-Type: application/vnd.android.package-archive" --data-binary @"$APK" "https://uploads.github.com/repos/$REPO/releases/$ID/assets?name=TiranaBus.apk" -o /dev/null
echo "Nahráno: https://github.com/$REPO/releases/download/$TAG/TiranaBus.apk"
