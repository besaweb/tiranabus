# Architecture – Tirana Bus

Aktualizováno: 2026-11-07. Historie změn: `docs/releases/`. Rozhodnutí: `docs/DECISIONS.md`.

## Přehled

Statická aplikace bez backendu a bez buildu (vanilla JS). Jediný zdroj kódu; Android je WebView obálka, která při buildu zkopíruje web a přidá platformní doplňky.

```
index.html, tickets.html, privacy.html, css/, js/, data/, img/   ← SHARED zdroj
        ├── web:     pages.yml (GitHub Pages) / deploy-ftp.sh (tiranabus.al)
        │            + tools/build-pages.js (SEO stránky, sitemap)       ← WEB ONLY
        │            + contact.html, contact.php, js/contact.js (formulář; jen FTP) ← WEB ONLY
        └── android: android/ (Gradle) → APK / AAB                              ← ANDROID ONLY doplňky
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
| Verze v O aplikaci | `VERSION` v `app.js` | `window.APP_VERSION` z Gradle (`prepareSite`) | `window.APP_VERSION \|\| VERSION` |
| Offline vektorová mapa | – | ano | `window.OFFLINE_MAP` + `window.maplibregl` |
| Odkazy Linky/Letiště (SEO stránky) | ano | skryté | `window.APP_VERSION` |
| Kontaktní formulář (WEB-003) | `contact.html` + `contact.php` (`mail()`), mimo menu, `noindex` | není (bez backendu, `contact.html` není v Gradle `include`) | jen `deploy-ftp.sh`, `pages.yml` ho nenasazuje; D-037 |
| Menu | hlavička (desktop), hamburger (≤ 760 px) | `android/menu.js` (☰, třídy `am*`), přesouvá přepínač jazyka | vloženo Gradle taskem `prepareSite` |
| Platnost dat | blok v menu (`renderExpiry`, `GTFS.validity`) | stránka `android/validity.html` + `validity.js` (vlastní parsování `feed_info`, vlastní slovník 12 jazyků) | duplicita → I18N-001, CORE-005 |
| Pole času | nativní | cs/sq: textové pole HH:MM (proxy na `#time`), en nativní | `menu.js` |
| Úvodní obrazovka | modrá | `splash.webp` + text a progress bar z `boot-extra.html` | vloženo Gradle taskem `prepareSite` |
| Odznak Google Play | ano | skrytý (`.gplay` v `menu.css`) | CSS |
| Knihovny | cdnjs | lokálně v `lib/` | Gradle `prepareSite` (stahuje z cdnjs, přepisuje `index.html`) |
| Feed | `gtfs.zip` vedle webu | `MainActivity`: stáhne z Pages do `filesDir`, offline uložená, jinak vložená kopie | interceptor `gtfs.zip` |
| Vlastní místa (POI-001) | není | karta `#places` (Moje místa) z menu ☰ (`tb-pois`), červené body na mapě, „Uložit místo“ v dlouhém stisku, místa v našeptávači | `GEO` v `app.js` |
| Předvolby, Odsud/Sem z mapy (UX-001) | není | karta `#precard` (Moje předvolby) z menu ☰ (`tb-presets`), předvolby v našeptávači, `contextmenu` na mapě; ikony předvoleb a jejich značky na mapě (UX-003); ikony předvoleb v polích Odkud / Kam (UX-004) | `GEO` v `app.js` (`window.APP_VERSION` && `navigator.geolocation`) |
| Oblíbené trasy (UX-015) | není | položka menu ☰ (`tb-routes`), karta `#rtcard`, hvězdička a formulář názvu v hlavičce výsledku (`.rtstar`, `.rtadd`), úložiště `tirana-routes` (`Places.routes`) | `window.APP_VERSION` (hvězdička), menu jen v aplikaci |
| Tirana BUS PRO (CORE-007, D-038) | není (bez zámků, rozšířené vyhledávání zdarma) | položka menu ☰ (`tb-pro`), karta `#procard`, odznaky PRO v menu, zámky karet Oblíbené trasy / Oblíbené zastávky / Moje místa a Rozšířeného vyhledávání | `window.APP_VERSION` zapíná vrstvu Pro, `window.PRO_ENFORCE` (Gradle, `PRO_ENFORCE=1`) vynucení zámků, nativní mosty `window.TBPro` (zatím neexistuje) a `window.TBAds` (`Ads.java`); stav v `<html data-pro="free|open|pro">` |
| Moje poloha (MAP-001) | není | tlačítko na mapě, panel `#geo`, oprávnění k poloze v `MainActivity` | `window.APP_VERSION` && `navigator.geolocation` (`GEO` v `app.js`) |
| Dlaždice a fonty | online | `DiskCache` v `cacheDir/ext`: klíč SHA-256 URL, limit 100 MB (při překročení se maže nejstarší na 80 %), platnost 30 dní (po vypršení se zkusí stáhnout znovu, offline se použije stará kopie), úklid při startu | `MainActivity.external`, `DiskCache.java` |
| GA4 | ano | ano (z `index.html`) | – |

Vkládání do `index.html` v APK je přes `sed`/`python` na konkrétní řetězce – po změně hlavičky nebo pořadí skriptů ověřit build (CORE-002).

## Pro (CORE-007)

- `js/pro.js` (čistý modul, testy `tests/pro.test.js`): `Pro.PLANS` (id, název, SKU, typ `inapp` / `subs`, dny, cena), `Pro.state(raw, now)` → `{ plan, until, auto, active, billing }`, `Pro.can(stav, vynucení)`, `Pro.ads(stav)`.
- `app.js`: `proOk()` je jediná kontrola zámku (na webu vždy `true`). `proApply()` znovu načte stav (každých 30 s, při návratu do aplikace a z `window.tbProUpdate()`), překreslí karty, značky a našeptávač a zavolá `TBAds.set`.
- Smlouva nativního mostu (AND-005): `TBPro.state()` vrací JSON `{ "ready": true, "purchases": [{ "sku": "pro_annual", "time": 1794480000000, "auto": true, "state": "purchased" }] }` – `time` je čas nákupu z Play v ms, `auto` u předplatného značí zapnuté obnovování, jiný `state` než `purchased` se nepočítá; `TBPro.buy(sku)` spustí nákup; po každé změně nativní kód zavolá `window.tbProUpdate()`. Předplatné, které Play už nevrací, se do seznamu nedává.
- Platnost počítá JS: Tourist `time` + 7 dní, Annual `time` + 365 dní (s `auto` nejbližší další výročí), Lifetime bez konce. Nákup s časem víc než den v budoucnosti se ignoruje.
- Testovací přepínač (AND-009, dočasný): build s `PRO_TEST=1` vloží `window.PRO_TEST=1` (a `PRO_ENFORCE`); `android/menu.js` ukáže přepínač „PRO test“, který zapisuje `localStorage['tirana-pro-test']` a volá `tbProUpdate()`; `proRead()` pak místo `TBPro.state()` použije simulovaný nákup LIFETIME. Ne pro veřejné vydání.
- Reklamy (MKT-001, D-039): web volá `TBAds.set(true|false)` z `adsSync()`; `true` jen bez aktivního plánu a když není otevřená obrazovka PRO ani zobrazené výsledky spojení. `android/src/…/Ads.java`: adaptivní banner AdMob v nativním pruhu pod WebView (kořen je svislý `LinearLayout`: WebView s vahou 1, pod ním `FrameLayout` s bannerem, viditelný jen s načtenou reklamou a bez klávesnice). Před první reklamou souhlas přes Google UMP, bez `canRequestAds()` se nic nenačítá; `MobileAds.initialize` jednou na pozadí; chyba načtení banner zruší a další pokus je nejdřív za 60 s; `set(false)` banner okamžitě zničí. Další metody mostu: `TBAds.privacy()` (má se nabízet změna souhlasu) a `TBAds.options()` (formulář UMP); nativní kód po změně volá `window.tbAdsPrivacy()` a `android/menu.js` podle toho ukáže položku „Soukromí reklam“. Most reaguje jen na stránce z `appassets.androidplatform.net`. Konfigurace buildu: `ADMOB_APP_ID`, `ADMOB_BANNER_ID` (prostředí nebo `android/ads.properties`), `ADS=0`, `ADS_TEST_EEA=1`; debug má testovací ID Google, release bez ID má `BuildConfig.ADS` = false. Další formát (interstitial) by přibyl jako další jednotka v `BuildConfig` a metoda v `Ads`.

## Android

- Gradle projekt v `android/` (AGP 9.0.0, Gradle 9.1.0 přes wrapper, `compileSdk` 36, `targetSdk` 36): `./gradlew apk` → `android/out/TiranaBus.apk`, `./gradlew aab` → `android/out/TiranaBus.aab`. Verze z proměnných prostředí `VERSION` a `VERSION_CODE` (výchozí 1.0 / 1). Zdroje zůstávají v `android/src`, `android/res`, `android/AndroidManifest.xml`. Task `prepareSite` zkopíruje web do `assets`, stáhne Leaflet, JSZip, PapaParse a MapLibre z cdnjs, vloží `boot-extra.html`, `OFFLINE_MAP`, `APP_VERSION` a `menu.*` do `index.html` (náhrada původních `sed`/`python` z `build.sh`, výstup shodný až na konce řádků). Podpis: `keystore.properties` nebo `TB_KS_PASS` (D-022), v APK v1 + v2. Závislosti: `play-services-ads` a `user-messaging-platform` (MKT-001; kvůli nim je v APK i Kotlin runtime), `.mbtiles` se v APK nekomprimuje, VCS info vypnuto. `release.sh` nahraje do release `apk-latest`.
- Lokální build: `JAVA_HOME` (JDK 17+), `ANDROID_HOME` nebo `android/local.properties`. Antivirus s inspekcí HTTPS (Avast Web Shield) podvrhuje certifikáty, kterým Java nedůvěřuje (`PKIX path building failed`): přidat výjimky pro `dl.google.com`, `repo.maven.apache.org`, `plugins.gradle.org`, `services.gradle.org` a `cdnjs.cloudflare.com`.
- Offline mapa: `tirana.mbtiles` se kopiuje z `assets` do `filesDir` přes `.tmp` a `rename` s `fsync`; marker `tirana.mbtiles.ver` (`versionCode:velikost`) vynutí překopírování po aktualizaci; po kopii se ověří otevřením databáze a dotazem, při chybě se soubor smaže a zkopíruje znovu (1×), pak se 60 s nezkouší.
- Poloha: `WebChromeClient.onGeolocationPermissionsShowPrompt` povolí polohu jen stránce z `appassets.androidplatform.net`; bez oprávnění požádá o `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`, výsledek předá do JS jako `window.tbGeo` (`ok`, `off`, `denied`, `blocked`). Při vypnutých polohových službách polohu WebView nepovolí (jinak vrací starou uloženou polohu). Odkazy `tbapp://settings` a `tbapp://location` otevřou nastavení aplikace a polohy. `uses-feature` pro polohu je `required=false`.
- `MainActivity.java`: servíruje assety z `https://appassets.androidplatform.net/`, interceptuje `gtfs.zip` a `vt/`, externí odkazy otevírá v prohlížeči. min SDK 24, target 36. Okno je edge-to-edge (Android 15+ to vynucuje): `MainActivity` odsazuje WebView o `systemBars`, `displayCutout` a `ime`. Zpět přes `OnBackInvokedCallback` (API 33+), starší `onBackPressed`. Téma `AppTheme` (`res/values`, `-v27`, `-night`): barva okna `#FFFFFF` / `#161E31` a ikony lišt podle systémového režimu.
- Ikony: adaptivní `res/mipmap-anydpi-v26/ic_launcher.xml`, popředí 432 px (obrázek 320 px), pozadí `#7A0A0A`; `ic_launcher.png` 192 px pro Android < 8.

## Web – nasazení a SEO

- `android.yml`: na PR a push do `main` s cestami `android/**`, `index.html`, `css|js|data|img/**` (a ručně) → JDK 21, feed z release, `./gradlew assembleDebug bundleDebug` bez podpisových tajemství, kontrola obsahu APK (`index.html` s `OFFLINE_MAP`, `gtfs.zip`, knihovny, mapa, `classes.dex`) a že `assembleRelease` bez hesla selže (D-022). Podepsané buildy jen lokálně.
- `pages.yml`: push na `main` + denně → kopie webu, cache-busting `?v=<sha>`, `gtfs.zip` z release, `node tools/build-pages.js site`, deploy Pages.
- `deploy-ftp.sh`: totéž, nahrání na tiranabus.al přes FTP (šifrovaný jen řídicí kanál – Pure-FTPd vrací 451 při TLS na datovém). Starší soubory nemaže. Nahrává pracovní adresář (WEB-001).
- `tools/build-pages.js` (+ `tools/gtfs-node.js`, čtečka zipu bez závislostí): 12 × (`/{jazyk}/`, `/lines/`, `/airport/`, `/line/{linka}/`) = 384 stránek + `sitemap.xml` (387 URL, hreflang, x-default). Jazykové kopie `index.html` mají `<base href="../">`. Výstup se necommituje.
- Kanonická doména `https://tiranabus.al/` (Pages = zrcadlo). `.htaccess` (www → bez www, 404) a `404.html` jen na FTP.
- SEO v HTML: výchozí jazyk en, JSON-LD (WebSite, WebApplication, Organization), OG `img/og.jpg`, `<noscript>`.

## Lokalizace

- Jazyky: cs, en, sq, it, de, pl, fr, es, mk, el, ru, tr. Výchozí podle URL (`/{jazyk}/`), pak `localStorage`, pak prohlížeč, jinak en. Překlady strojové, bez korektury.
- Plurály: cs, pl, ru 3 tvary, ostatní 2 (fr: 0 a 1 = jednotné). Názvy zastávek a linek se nepřekládají.
- Statické texty v HTML přes `data-i18n*`, `applyLang()` přepíše a překreslí panel.
- Výjimky mimo `i18n.js` (vlastní slovníky, všech 12 jazyků, kontroluje `tests/i18n.test.js`): `android/menu.js`, `android/validity.js`, `android/boot-extra.html`, texty letiště v `extra-airport.js`.

## Nástroje (`tools/`)

| Skript | Výstup |
|---|---|
| `build-pages.js` | SEO stránky a sitemap |
| `gtfs-node.js` | čtení `gtfs.zip` v Node bez závislostí |
| `poi-build.js` | `data/poi.json` (Overpass; při 502 opakuje) |
| `walk-build.js` | `data/walk.json` |
| `etransport/` | interní stahování meziměstských linek (Python), výstup `data/etransport/` mimo git |
| `android/map/mkstyle.py` | styly offline mapy |
