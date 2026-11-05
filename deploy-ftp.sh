#!/usr/bin/env bash
# Nahraje web na FTP (tiranabus.al). Údaje v .ftp.env (není v gitu). Spouštět z Git Bash v kořeni projektu.
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.ftp.env; set +a
: "${FTP_HOST:?}" "${FTP_USER:?}" "${FTP_PASS:?}" "${FTP_DIR:?}"
URL=https://tiranabus.al/
V=$(git rev-parse --short=8 HEAD)
S=$(mktemp -d)
trap 'rm -rf "$S"' EXIT

cp -r index.html tickets.html privacy.html 404.html robots.txt sitemap.xml .htaccess favicon.ico css js data img "$S/"
sed -i -E "s#((src|href)=\"(css|js)/[^\"?]+\.(js|css))\"#\1?v=$V\"#g" "$S/index.html" "$S/tickets.html" "$S/privacy.html"
if ! curl -fsSL --retry 3 -o "$S/gtfs.zip" https://github.com/besaweb/tiranabus/releases/download/tirana-latest/gtfs.zip; then
  cp gtfs.zip "$S/gtfs.zip"
fi
unzip -tq "$S/gtfs.zip"
V=$V node tools/build-pages.js "$S"
sed -i -E "s#((src|href)=\"(css|js)/[^\"?]+\.(js|css))\"#\1?v=$V\"#g" "$S"/??/index.html

SW=$(cygpath -m "$S" 2>/dev/null || echo "$S")
CFG="$S/.curl-files"
n=0
while IFS= read -r f; do printf 'upload-file = "%s"
url = "ftp://%s%s/%s"
' "$SW/$f" "$FTP_HOST" "$FTP_DIR" "$f" >> "$CFG"; n=$((n + 1)); done < <(cd "$S" && find . -type f ! -name .curl-files | sed 's#^\./##' | sort)
echo "Nahrávám $n souborů na $FTP_HOST$FTP_DIR (verze $V)"
curl -sS --ftp-ssl-control --ftp-create-dirs --retry 2 -u "$FTP_USER:$FTP_PASS" -K "$CFG"
echo "Hotovo: $URL"
