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

cp -r index.html tickets.html privacy.html 404.html robots.txt sitemap.xml .htaccess css js data img "$S/"
sed -i -E "s#((src|href)=\"(css|js)/[^\"?]+\.(js|css))\"#\1?v=$V\"#g" "$S/index.html" "$S/tickets.html" "$S/privacy.html"
if ! curl -fsSL --retry 3 -o "$S/gtfs.zip" https://github.com/besaweb/tiranabus/releases/download/tirana-latest/gtfs.zip; then
  cp gtfs.zip "$S/gtfs.zip"
fi
unzip -tq "$S/gtfs.zip"

args=()
while IFS= read -r f; do args+=(-T "$S/$f" "ftp://$FTP_HOST$FTP_DIR/$f"); done < <(cd "$S" && find . -type f | sed 's#^\./##' | sort)
echo "Nahrávám $(( ${#args[@]} / 3 )) souborů na $FTP_HOST$FTP_DIR (verze $V)"
curl -sS --ftp-ssl-control --ftp-create-dirs --retry 2 -u "$FTP_USER:$FTP_PASS" "${args[@]}"
echo "Hotovo: $URL"
