# Project overview – Tirana Bus

Aktualizováno: 2026-11-07

## Co to je

Mapa městské dopravy Tirany: linky a zastávky, nejbližší odjezdy, plánovač spojení s přestupy a chůzí, letištní autobusy LU-NA, volitelné hledání míst a ulic, informace o jízdném. 12 jazyků. Bez backendu – vše počítá klient nad GTFS.

Cílová skupina: turisté a obyvatelé Tirany (kampaň na Facebooku míří i na české turisty). Autor a provozovatel: BesaWeb (besaweb.al, info@besaweb.al).

## Aplikace

| | Desktop Web Application | Android Application |
|---|---|---|
| Adresa / distribuce | https://tiranabus.al (hlavní, FTP), zrcadlo GitHub Pages `besaweb.github.io/tiranabus` | APK z release `apk-latest`; připravuje se Google Play |
| Verze | `VERSION` v `js/app.js` (1.04) | `VERSION` v `android/build.sh` (1.7) |
| Data | `gtfs.zip` dodaný při nasazení | vložený `gtfs.zip` + stažení čerstvého z Pages, offline |
| Mapa | rastrové podklady online | offline vektorová mapa Tirany (mbtiles) + online podklady |

## Zdroje dat a licence

| Zdroj | Použití | Licence / poznámka |
|---|---|---|
| GTFS Tirana `https://pt.tirana.al/gtfs/gtfs.zip` | linky, zastávky, řády | CC BY-SA 4.0, Municipality of Tirana – atribuce povinná |
| luna.al (`/aeroporti`, `/aeroporti/orari`) | letištní linky RX, RT (`js/extra-airport.js`) | ručně přepsáno, ověřeno 29. 10. 2026 |
| OpenStreetMap (Overpass) | `data/poi.json`, `data/walk.json` | ODbL, © OpenStreetMap contributors |
| OpenMapTiles / Planetiler, Geofabrik | `android/map/tirana.mbtiles` | © OpenMapTiles © OpenStreetMap |
| OSRM | tvary letištních tras | nad OSM |
| eTransport (DPSHTRR) | meziměstské linky, `tools/etransport/` | bez licence → jen interní analýza, nepublikovat |

### GTFS Tirana

| | |
|---|---|
| Vydavatel | Municipality of Tirana, Directorate of Transportation and Road Traffic (kontakt eric.stemmler@tirana.al) |
| Verze (k 5. 11. 2026) | `feed_version` 2026-09-30, platnost **1. 1. – 31. 12. 2026** |
| Obsah | 27 linek, 490 zastávek, 6 415 spojů, 129 113 stop_times, shapes ano, frequencies ne |
| Nestandardní soubory | `timetables.txt`, `timetable_pages.txt`, `stops_pos.txt` (ignorujeme) |
| Realtime | žádný veřejný GTFS-RT neexistuje |
| Hlídání | `.github/workflows/gtfs-watch.yml` → release `tirana-latest`, issue při změně/výpadku |

### Letiště (LU-NA)

Letiště ve feedu není (Rinas leží mimo území města, linky provozuje soukromý LU-NA / Luna Travel).

- Strojově čitelná data (API, PDF, GTFS) neexistují. Stránka je Next.js, v HTML je jen JSON-LD (schema.org) s cenami a odkazy na Google Maps u stanic. Ukazuje jen aktuální den, bez minutových časů, provozních dní, výjimek a platnosti.
- Potvrzeno: Qendra ⇄ TIA 24/7 každou celou hodinu v obou směrech, 400 L; Terminali Jug-Veri → TIA 07:00–18:00 (12 odjezdů), TIA → terminál 08:00–18:00 (11 odjezdů), 300 L. Doba 45 min uvedena u hlavní linky, u RT ne (30 min = odhad). Souřadnice stanic sedí na desítky metrů.
- Nepoužité údaje: platba lekë/EUR/kartou; jízdenka platí celý den; velké zavazadlo +500 L; 50% sleva pro albánské občany se zdravotním postižením; online platba +30 L (RX) / +28 L (RT).

### Jízdné (údaje od uživatele, k ověření)

40 lekë za jízdu městským autobusem, hotově v autobuse, papírová nepřenosná jízdenka (29. 10. 2026, bez zdroje). Kurzy pro přepočet pevné v `FARE.cur` (`js/app.js`), odhad z 29. 10. 2026 (1 EUR = 90,88 ALL = 24,36 CZK) – ručně aktualizovat.

## Infrastruktura a účty

| | |
|---|---|
| Repozitář | `github.com/besaweb/tiranabus` (soukromý), větev `main` |
| GitHub Releases | `tirana-latest` (feed), `apk-latest` (APK) |
| Hosting | gigaserver.cz, FTP `wh03.farma.gigaserver.cz`, složka `/tiranabus.al`, údaje v `.ftp.env` (mimo git) |
| Analytika | GA4 `G-XJ9EK9ZKWF` (web i APK; uvést v Google Play Data safety) |
| Podepisovací klíč | `android/tirana-bus.keystore` – mimo git, **bez něj nejde APK aktualizovat**; heslo v `android/keystore.properties` (mimo git) nebo `TB_KS_PASS` |
| Podpora | Ko-fi (sbírka na vydání v Google Play) |

## Monetizace

- Dobrovolné příspěvky přes Ko-fi (na vývoj).
- Plánovaná Pro verze v Google Play; přispěvatelé Ko-fi ji dostanou zdarma (kódy po vydání).
- Připravený souhlas s reklamou (`js/consent.js`), zatím vypnutý.
