# MHD Tirana

Prototyp mapy městské dopravy v Tiraně nad GTFS feedem: linky, zastávky, odjezdy a vyhledání spojení.

## Spuštění

Otevři `index.html` v prohlížeči. Podklad OpenStreetMap funguje jen přes web server:

```
python -m http.server 8000
```

a pak http://localhost:8000/

## Data

- GTFS Tirany: https://pt.tirana.al/gtfs/gtfs.zip (CC BY-SA 4.0, Bashkia e Tiranës)
- Ručně ho lze načíst přetažením `gtfs.zip` na mapu. Bez feedu běží smyšlená ukázková síť.
- Pokud je vedle `index.html` dostupný `gtfs.zip` (nasazený web na GitHub Pages, nebo lokální kopie přes `python -m http.server`), načte se automaticky při startu. Při otevření přes `file://` se neděje nic.
- Nasazení: `.github/workflows/pages.yml` při každém pushi a denně sestaví web s aktuálním `gtfs.zip` z Releases `tirana-latest`. V repozitáři je nutné zapnout Settings → Pages → Source: **GitHub Actions**.
- Aktuální kopii feedu hlídá GitHub Action `.github/workflows/gtfs-watch.yml`: každý den kolem 5:17 UTC stáhne feed, a pokud se změnil obsah (sha256), nahraje ho do Releases jako `tirana-latest` (`gtfs.zip`). Jde spustit i ručně (Actions → gtfs-watch → Run workflow).

## Soubory

| Soubor | Obsah |
|---|---|
| `index.html` | stránka a knihovny z CDN (Leaflet 1.9.4, JSZip 3.10.1, PapaParse 5.4.1) |
| `css/style.css` | vzhled, světlý a tmavý režim |
| `js/gtfs-core.js` | načtení GTFS, kalendář, odjezdy, plánovač spojení (Connection Scan, Pareto čas × přestupy) |
| `js/demo.js` | ukázková síť |
| `js/extra-airport.js` | doplňková linka na letiště, přidá se k nahranému feedu |
| `data/gtfs-extra.zip` | stejná linka jako samostatný GTFS (pro jiné nástroje nebo import do DB) |
| `js/i18n.js` | překlady rozhraní (čeština, angličtina, albánština) |
| `js/app.js` | mapa a ovládání |

## Doplňkové linky na letiště (LU-NA)

Městský feed letiště neobsahuje, protože Rinas leží mimo území Tirany a linky provozuje soukromý dopravce LU-NA (Luna Travel). Aplikace proto ke každému nahranému feedu přidá dvě linky z `js/extra-airport.js`:

| Linka | Trasa | Odjezdy | Jízdné | Jízdní doba v datech |
|---|---|---|---|---|
| **RX** Rinas Express | Opera (Pallati i Kulturës) ⇄ letiště TIA | každou celou hodinu, 24/7, oba směry | 400 ALL | 45 min (údaj Luna) |
| **RT** | Terminál Jug–Sever ⇄ letiště TIA | z terminálu 7:00–18:00, z letiště 8:00–18:00 | 300 ALL | 30 min (odhad, Luna neuvádí) |

- Zdroj jízdního řádu a zastávek: https://luna.al/en/airport/timetable a https://luna.al/en/airport#stacionet (stav 29. 10. 2026).
- Polohy zastávek pocházejí z odkazů Luna na Google Maps.
- Trasy (`shapes`) jsou silniční trasy z OSRM nad OpenStreetMap, zjednodušené s odchylkou do 6 m. Skutečná trasa autobusu se může lišit.
- Jízdenka platí celý den do 23:59. Autobus může na požádání zastavit i po cestě.
- ID z doplňku dostávají prefix `rx:`, aby nekolidovala s městským feedem. Po úpravě `js/extra-airport.js` je potřeba znovu vygenerovat `data/gtfs-extra.zip`.

## Android aplikace (APK)

Ve složce `android/` je WebView obálka. `bash android/build.sh` (Git Bash, Android SDK a Android Studio JBR) vytvoří `android/out/TiranaBus.apk`, bez Gradle. APK obsahuje web, knihovny a lokální `gtfs.zip`, při startu zkusí stáhnout čerstvý feed z GitHub Pages. Mapové dlaždice potřebují internet. Instalace: nahrát APK do telefonu a povolit instalaci z neznámých zdrojů. Klíč `android/tirana-bus.keystore` je mimo git, bez něj nejde aplikaci aktualizovat.

## Parametry plánovače (`js/gtfs-core.js`)

- `WALK_R = 400` – max. chůze mezi zastávkami (m)
- `WALK_V = 1.25`, `DETOUR = 1.3` – rychlost chůze (m/s) a koeficient zajížďky
- `CHANGE = 60` – min. čas na přestup (s)
- `HORIZON = 6 * 3600` – jak daleko dopředu se hledá (s)
- `MAXR = 5` – max. počet jízd v jednom spojení

## Omezení

Jen plánovaný jízdní řád (bez zpoždění), linky zadané intervalem mají orientační časy, chůze se počítá vzdušnou čarou × 1,3.
