# Architecture – Tirana Bus

Aktualizováno: 2026-11-07. Historie změn: `docs/releases/`. Rozhodnutí: `docs/DECISIONS.md`.

## Přehled

Statická aplikace bez backendu a bez buildu (vanilla JS). Jediný zdroj kódu; Android je WebView obálka, která při buildu zkopíruje web a přidá platformní doplňky.

```
index.html, tickets.html, privacy.html, css/, js/, data/, img/   ← SHARED zdroj
        ├── web:     pages.yml (GitHub Pages) / deploy-ftp.sh (tiranabus.al)
        │            + tools/build-pages.js (SEO stránky, sitemap)       ← WEB ONLY
        └── android: android/build.sh → APK                              ← ANDROID ONLY doplňky
                     menu.js/css, validity.*, boot-extra.html, splash, MapLibre + mbtiles, MainActivity.java
```

## Vrstvy a moduly

| Vrstva | Soubor | Obsah | Pravidlo |
|---|---|---|---|
| Core | `js/gtfs-core.js` (`GTFS`) | build feedu, kalendář, `departures`, `plan` (CSA), `merge`, `readZip`, `groupStops`, `validity`, `clock` | bez DOM, `module.exports` |
| Core | `js/places.js` (`Places`) | hledání míst/ulic, pěší síť (`net`, `access`, `between`, `route`, `stopWalks`) | bez DOM, `module.exports` |
| Core data | `js/extra-airport.js` (`EXTRA_FEEDS`), `js/demo.js` (`demoTables`) | letištní mini-GTFS, ukázková síť | `module.exports` |
| I18N | `js/i18n.js` (`I18N`) | 12 jazyků, `t(klíč, {p})`, `pl(klíč, n)` | všechny jazyky mají stejné klíče |
| UI | `js/app.js` | mapa, panely, formulář, načtení feedu, jízdné (`FARE`), verze (`VERSION`) | jediné místo UI logiky |
| UI | `css/style.css`, `css/tickets.css` | vzhled, tokeny, světlý/tmavý režim | přes CSS proměnné |
| Ostatní | `js/consent.js` (vypnutý souhlas s reklamou), `js/tickets.js`, `js/privacy.js` | | |

Pořadí skriptů v `index.html`: Leaflet → JSZip → PapaParse → `gtfs-core` → `places` → `demo` → `extra-airport` → `i18n` → `consent` → `app`. Moduly jsou globální proměnné.

## Data a jejich tok

- **GTFS:** `gtfs-watch.yml` denně stáhne feed, ověří zip, porovná sha256 a při změně aktualizuje release `tirana-latest` (+ issue). `pages.yml` i `deploy-ftp.sh` vloží `gtfs.zip` z release vedle `index.html`. `autoLoad` v `app.js` ho načte přes `fetch('gtfs.zip')`; bez něj běží ukázková síť (`demo.js`). Ruční nahrání/drag & drop zůstává jako záloha. Parsování PapaParse, vše v prohlížeči.
- **Letiště:** `EXTRA_FEEDS` se slučuje do každého načteného feedu přes `GTFS.merge` (prefix `rx:`). Stejná data jako samostatný `data/gtfs-extra.zip` (ruční přegenerování). Kalendář natvrdo 2026–2027.
- **POI:** `tools/poi-build.js` (Overpass) → `data/poi.json` (~2 350 míst + 1 850 ulic, 80 KB gzip; formát `[název, kategorie, druh, lat, lon, překlady, aliasy]`, ruční doplňky `MANUAL`). Načte se při prvním kliknutí do Odkud/Kam, jen při zapnutém rozšířeném hledání (`localStorage tirana-mhd-ext`).
- **Pěší síť:** `tools/walk-build.js` → `data/walk.json` (~59 000 uzlů, 640 KB). Načítá se po startu; bez ní vzdušná čára × 1,3.
- **localStorage klíče:** `tirana-mhd-base`, `tirana-mhd-ext`, `tirana-mhd-theme`, `tirana-mhd-lang`, `tirana-data-info` (APK).

## Plánovač (`GTFS.plan`)

- Connection Scan Algorithm, Pareto výběr (čas příjezdu × počet přestupů), dnes/zítra, časy v zóně z `agency.txt`, časy přes 24:00, odjezdy z předchozího i následujícího provozního dne.
- Parametry: `WALK_R = 400` m vzdušně (s pěší sítí max. 520 m po ulicích), `WALK_V = 1.25` m/s, `DETOUR = 1.3`, `CHANGE = 60` s, `HORIZON = 6 h`, `MAXR = 5` jízd.
- **block_id:** navazující spoj téže linky a směru se stejným `block_id` a `service_id` z konečné do 10 min (`STAY`) = bez přestupu; úsek se zobrazí jako jeden spoj (`span`).
- **tidy:** po nalezení zkusí vystoupit/nastoupit na jiné zastávce téhož spoje, pokud je chůze kratší a příjezd se nezhorší; přednost přestupy s rezervou ≥ 3 min (`SAFE`).
- Zákaz přestupu na stejnou linku opačným směrem.
- **Docházka k místům** (`acc`): zastávky do 500 m po ulicích (jinak 3 nejbližší do 1,5 km), varianta „jen pěšky“ do 1,5 km, chůze k cíli váhou `ACC_K = 2` (jen hodnocení), skrytí spojení s přestupem, který neušetří ≥ 10 min (`XFER`), a spojů o > 15 min pomalejších než chůze. Bez `acc` je plánovač beze změny.
- Pěší přestupy po síti ulic: `feed.walkFn` → `Places.stopWalks` (přepočet ~80 ms).
- `frequencies.txt` podporováno (Tirana nepoužívá). Seskupení zastávek `groupStops` (název + do 300 m; stejnojmenné vzdálené rozlišené ulicí ze `stop_desc`, linkou, pak číslem).
- Zobrazená trasa linky = nejdelší spoj ve směru.

## Mapy

- Web: Leaflet (canvas renderer), podklady OSM, Esri ulice, Esri letecká, OpenTopoMap, bez podkladu (volba v `localStorage`). Při `file://` výchozí Esri (OSM blokuje).
- APK: navíc vrstva „Offline mapa“ (výchozí) – Leaflet obálka nad MapLibre GL 4.7.1, styly `android/map/style-light/dark.json` (generuje `mkstyle.py`), glyfy Noto Sans, dlaždice `/vt/{z}/{x}/{y}.pbf` z `tirana.mbtiles` (OpenMapTiles, bbox 19.62,41.22,20.02,41.46, z0–14, 6,6 MB, Planetiler 0.10.2, 30. 10. 2026). Mimo bbox prázdno.
- Regenerace Planetileru: data stahovat `curl`em, spouštět s `--nodemap-type=sparsearray --storage=mmap`.

## Platformní rozdíly

| Funkce | Web | Android | Mechanismus |
|---|---|---|---|
| Verze v O aplikaci | `VERSION` v `app.js` | `window.APP_VERSION` z `build.sh` | `window.APP_VERSION \|\| VERSION` |
| Offline vektorová mapa | – | ano | `window.OFFLINE_MAP` + `window.maplibregl` |
| Odkazy Linky/Letiště (SEO stránky) | ano | skryté | `window.APP_VERSION` |
| Menu | hlavička (desktop), hamburger (≤ 760 px) | `android/menu.js` (☰, třídy `am*`), přesouvá přepínač jazyka | vloženo `build.sh` |
| Platnost dat | blok v menu (`renderExpiry`, `GTFS.validity`) | stránka `android/validity.html` + `validity.js` (vlastní parsování `feed_info`, jen cs/en/sq) | duplicita → I18N-001, CORE-005 |
| Pole času | nativní | cs/sq: textové pole HH:MM (proxy na `#time`), en nativní | `menu.js` |
| Úvodní obrazovka | modrá | `splash.webp` + text a progress bar z `boot-extra.html` | vloženo `build.sh` |
| Odznak Google Play | ano | skrytý (`.gplay` v `menu.css`) | CSS |
| Knihovny | cdnjs | lokálně v `lib/` | `sed` v `build.sh` |
| Feed | `gtfs.zip` vedle webu | `MainActivity`: stáhne z Pages do `filesDir`, offline uložená, jinak vložená kopie | interceptor `gtfs.zip` |
| Dlaždice a fonty | online | cache `cacheDir/ext` bez limitu | `MainActivity.external` |
| GA4 | ano | ano (z `index.html`) | – |

Vkládání do `index.html` v APK je přes `sed`/`python` na konkrétní řetězce – po změně hlavičky nebo pořadí skriptů ověřit build (CORE-002).

## Android

- WebView obálka bez Gradle: `android/build.sh` (Git Bash, Android SDK build-tools 36.0.0, platforma 34, JBR z Android Studia): aapt2 + javac + d8 + zipalign + apksigner → `android/out/TiranaBus.apk`. `release.sh` nahraje do release `apk-latest`. Plánován přechod na Gradle + AAB (CORE-003, AND-001).
- `MainActivity.java`: servíruje assety z `https://appassets.androidplatform.net/`, interceptuje `gtfs.zip` a `vt/`, externí odkazy otevírá v prohlížeči. min SDK 24, target 34.
- Ikony: adaptivní `res/mipmap-anydpi-v26/ic_launcher.xml`, popředí 432 px (obrázek 320 px), pozadí `#7A0A0A`; `ic_launcher.png` 192 px pro Android < 8.

## Web – nasazení a SEO

- `pages.yml`: push na `main` + denně → kopie webu, cache-busting `?v=<sha>`, `gtfs.zip` z release, `node tools/build-pages.js site`, deploy Pages.
- `deploy-ftp.sh`: totéž, nahrání na tiranabus.al přes FTP (šifrovaný jen řídicí kanál – Pure-FTPd vrací 451 při TLS na datovém). Starší soubory nemaže. Nahrává pracovní adresář (WEB-001).
- `tools/build-pages.js` (+ `tools/gtfs-node.js`, čtečka zipu bez závislostí): 12 × (`/{jazyk}/`, `/lines/`, `/airport/`, `/line/{linka}/`) = 384 stránek + `sitemap.xml` (387 URL, hreflang, x-default). Jazykové kopie `index.html` mají `<base href="../">`. Výstup se necommituje.
- Kanonická doména `https://tiranabus.al/` (Pages = zrcadlo). `.htaccess` (www → bez www, 404) a `404.html` jen na FTP.
- SEO v HTML: výchozí jazyk en, JSON-LD (WebSite, WebApplication, Organization), OG `img/og.jpg`, `<noscript>`.

## Lokalizace

- Jazyky: cs, en, sq, it, de, pl, fr, es, mk, el, ru, tr. Výchozí podle URL (`/{jazyk}/`), pak `localStorage`, pak prohlížeč, jinak en. Překlady strojové, bez korektury.
- Plurály: cs/pl 3 tvary, ostatní 2. Názvy zastávek a linek se nepřekládají.
- Statické texty v HTML přes `data-i18n*`, `applyLang()` přepíše a překreslí panel.
- Výjimky mimo `i18n.js`: `android/menu.js`, `android/validity.js`, `android/boot-extra.html`, texty letiště v `extra-airport.js`.

## Nástroje (`tools/`)

| Skript | Výstup |
|---|---|
| `build-pages.js` | SEO stránky a sitemap |
| `gtfs-node.js` | čtení `gtfs.zip` v Node bez závislostí |
| `poi-build.js` | `data/poi.json` (Overpass; při 502 opakuje) |
| `walk-build.js` | `data/walk.json` |
| `etransport/` | interní stahování meziměstských linek (Python), výstup `data/etransport/` mimo git |
| `android/map/mkstyle.py` | styly offline mapy |
