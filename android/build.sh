#!/usr/bin/env bash
# Sestaví android/out/TiranaBus.apk (bez Gradle): aapt2 + javac + d8 + apksigner. Spouštět z Git Bash.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=..
SDK="${ANDROID_HOME:-$LOCALAPPDATA/Android/Sdk}"
BT="$SDK/build-tools/36.0.0"
AJAR="$SDK/platforms/android-34/android.jar"
JH="${JAVA_HOME:-/c/Program Files/Android/Android Studio/jbr}"
JAVA="$JH/bin/java"; JAVAC="$JH/bin/javac"; KEYTOOL="$JH/bin/keytool"
VER="${VERSION:-1.0}"; CODE="${VERSION_CODE:-1}"
KS=tirana-bus.keystore; PASS=tiranabus

rm -rf build; mkdir -p build/site build/classes build/dex out
cp -r $ROOT/index.html $ROOT/tickets.html $ROOT/css $ROOT/js $ROOT/data $ROOT/img build/site/
[ -f $ROOT/gtfs.zip ] && cp $ROOT/gtfs.zip build/site/gtfs.zip || echo 'Pozor: chybí gtfs.zip v kořeni, aplikace ho stáhne jen online.'

mkdir -p build/site/lib
CDN=https://cdnjs.cloudflare.com/ajax/libs
curl -fsSL $CDN/leaflet/1.9.4/leaflet.min.js -o build/site/lib/leaflet.min.js
curl -fsSL $CDN/jszip/3.10.1/jszip.min.js -o build/site/lib/jszip.min.js
curl -fsSL $CDN/PapaParse/5.4.1/papaparse.min.js -o build/site/lib/papaparse.min.js
curl -fsSL $CDN/maplibre-gl/4.7.1/maplibre-gl.js -o build/site/lib/maplibre-gl.js
curl -fsSL $CDN/maplibre-gl/4.7.1/maplibre-gl.css -o build/site/lib/maplibre-gl.css
mkdir -p build/site/map && cp -r map/fonts map/style-*.json map/tirana.mbtiles build/site/map/
cp menu.js menu.css splash.webp validity.html validity.js build/site/
python -c "p='build/site/index.html';s=open(p,encoding='utf-8').read();x=open('boot-extra.html',encoding='utf-8').read();s=s.replace('<p id=\"boottext\"',x+'<p id=\"boottext\"',1);open(p,'w',encoding='utf-8').write(s)"
sed -i 's#<link rel="stylesheet" href="css/style.css">#<link rel="stylesheet" href="lib/maplibre-gl.css">&<link rel="stylesheet" href="menu.css">#; s#<script src="js/gtfs-core.js">#<script>window.OFFLINE_MAP=1;window.APP_VERSION="'$VER'"</script><script src="lib/maplibre-gl.js"></script>&#; s#<script src="js/app.js"></script>#&<script src="menu.js"></script>#' build/site/index.html
sed -i "s#$CDN/leaflet/1.9.4/#lib/#; s#$CDN/jszip/3.10.1/#lib/#; s#$CDN/PapaParse/5.4.1/#lib/#" build/site/index.html

"$BT/aapt2.exe" compile --dir res -o build/res.zip
"$BT/aapt2.exe" link -o build/base.apk -I "$AJAR" --manifest AndroidManifest.xml -A build/site \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$CODE" --version-name "$VER" build/res.zip
"$JAVAC" --release 8 -Xlint:-options -cp "$AJAR" -d build/classes $(find src -name '*.java')
"$JAVA" -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 --release --min-api 24 --lib "$AJAR" --output build/dex $(find build/classes -name '*.class')
python -c "import zipfile;z=zipfile.ZipFile('build/base.apk','a',zipfile.ZIP_DEFLATED);z.write('build/dex/classes.dex','classes.dex');z.close()"
"$BT/zipalign.exe" -f 4 build/base.apk build/aligned.apk

[ -f $KS ] || "$KEYTOOL" -genkeypair -keystore $KS -storepass $PASS -keypass $PASS -alias tiranabus -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Tirana Bus"
"$JAVA" -jar "$BT/lib/apksigner.jar" sign --ks $KS --ks-pass pass:$PASS --out out/TiranaBus.apk build/aligned.apk
"$JAVA" -jar "$BT/lib/apksigner.jar" verify out/TiranaBus.apk
ls -l out/TiranaBus.apk
