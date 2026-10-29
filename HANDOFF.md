# HANDOFF – MHD Tirana

Stav k 29. 10. 2026. Pravidla pro práci na projektu jsou v `CLAUDE.md`.

## Co to je

Statická webová aplikace (vanilla JS, bez buildu) nad GTFS feedem MHD Tirany. Mapa linek a zastávek, nejbližší odjezdy a vyhledání spojení. Vše běží v prohlížeči, žádný backend.

## Hotovo

- **Načtení GTFS** ze zipu (tlačítko nebo drag & drop), parsování přes PapaParse, zpracování jen v prohlížeči.
- **Ukázková síť** (`demo.js`) při startu, dokud uživatel nenahraje feed.
- **Mapa** (Leaflet, canvas renderer): linky podle `shapes.txt`, jinak rovné spojnice zastávek. Volba podkladu: OSM, Esri ulice, Esri letecká, OpenTopoMap, bez podkladu. Volba se ukládá do `localStorage`.
- **Prohlížení:** seznam linek s hledáním, detail linky (zastávky po směrech, přestupní linky), detail zastávky s odjezdy na 3 h dopředu, obnova každých 30 s.
- **Kalendář:** `calendar.txt` + `calendar_dates.txt`, časy přes 24:00, odjezdy z předchozího i následujícího provozního dne (oprava chyby kolem půlnoci).
- **`frequencies.txt`:** podporované v odjezdech i v plánovači (Tirana je zatím nepoužívá).
- **Plánovač spojení:** Connection Scan Algorithm s Pareto výběrem (čas příjezdu × počet přestupů), chůze mezi zastávkami, až 5 jízd, horizont 6 h, dnes/zítra. Detail cesty s mezizastávkami a vykreslením na mapě.
- **Seskupení zastávek** (`GTFS.groupStops`): podle názvu a vzdálenosti do 300 m. Vzdálené stejnojmenné zastávky se rozliší jako „Název (1)“, „Název (2)“ (ve feedu Selitë, Xhamia). Skupiny mají id, výběr v plánovači jde přes id.
- **Upozornění na platnost feedu** (`GTFS.validity`, `renderExpiry`): žlutočervený pruh v postranním panelu, když feed skončil, začíná až v budoucnu nebo končí do 30 dnů. U ukázkové sítě se nezobrazuje.
- **Hledání bez diakritiky** v seznamu linek a zastávek (`norm`).
- **Letištní linky LU-NA** (`extra-airport.js`): RX Opera ⇄ TIA (24/7, každou hodinu, 45 min), RT Terminál Jug–Sever ⇄ TIA (7–18 / 8–18 h, odhad 30 min). Slučují se do každého nahraného feedu s prefixem ID `rx:`. Stejná data jako samostatný GTFS v `data/gtfs-extra.zip`.
- **Vzhled:** světlý i tmavý režim, responzivní, české UI.
- **Artefakt** „Tirana MHD mapa“ (jednosouborová verze `tirana-mhd-mapa.html`) na claude.ai.

## Struktura souborů

```
MHD Tirana/
├── index.html            stránka, knihovny z cdnjs (Leaflet 1.9.4, JSZip 3.10.1, PapaParse 5.4.1)
├── README.md             uživatelský popis, tabulka letištních linek, parametry plánovače
├── HANDOFF.md            tento soubor
├── CLAUDE.md             pravidla projektu
├── gtfs.zip              stažený městský feed (verze 2026-09-30), aplikace ho sama nenačítá
├── css/style.css         vzhled, CSS proměnné, světlý/tmavý režim
├── js/gtfs-core.js       jádro bez DOM: build, kalendář, departures, plánovač (CSA), merge, readZip
├── js/demo.js            demoTables() – smyšlená síť
├── js/extra-airport.js   EXTRA_FEEDS – linky LU-NA včetně shapes z OSRM
├── js/app.js             mapa, panely, plánovací formulář, načítání souboru
└── data/gtfs-extra.zip   letištní linky jako samostatný GTFS (generovaný z extra-airport.js)
```

Pořadí skriptů v `index.html`: `gtfs-core` → `demo` → `extra-airport` → `app`. Moduly jsou globální proměnné (`GTFS`, `demoTables`, `EXTRA_FEEDS`). `gtfs-core.js` a `extra-airport.js` exportují i přes `module.exports`, takže jdou testovat v Node.

## GTFS zdroj

| | |
|---|---|
| URL | https://pt.tirana.al/gtfs/gtfs.zip |
| Vydavatel | Municipality of Tirana, Directorate of Transportation and Road Traffic (kontakt eric.stemmler@tirana.al) |
| Licence | CC BY-SA 4.0, nutné uvést autora |
| Verze v projektu | `feed_version` 2026-09-30, platnost **1. 1. – 31. 12. 2026** |
| Obsah | 27 linek, 490 zastávek, 6 415 spojů, 129 113 stop_times, shapes ano, frequencies ne |
| Nestandardní soubory | `timetables.txt`, `timetable_pages.txt`, `stops_pos.txt` (ignorujeme) |
| Realtime | žádný veřejný GTFS-RT neexistuje |

Letiště ve feedu není (Rinas leží mimo území města, linky provozuje soukromý LU-NA). Zdroj pro doplněk: https://luna.al/en/airport/timetable a https://luna.al/en/airport#stacionet.

## Rozhodnutí

- **Bez buildu a frameworku.** Čistý JS, knihovny z CDN, spustitelné otevřením `index.html` nebo přes `python -m http.server`.
- **Žádný backend.** Feed nahrává uživatel, nic se neodesílá. Kvůli licenci a CORS feed z pt.tirana.al nestahujeme za běhu.
- **Výchozí podklad:** OSM přes http(s), Esri ulice při `file://` (OSM tam vrací „Access blocked“).
- **Plánovač = CSA**, ne RAPTOR: jednodušší, pro ~130 tis. stop_times dost rychlý. Chůze vzdušnou čarou × 1,3, max. 400 m, přestup min. 60 s. Zákaz přestupu na stejnou linku opačným směrem.
- **Zastávky v plánovači se seskupují podle názvu** (obě strany ulice = jedna volba).
- **Doplňkové linky** jako samostatný mini-GTFS slučovaný přes `GTFS.merge` s prefixem ID, ne úprava městského feedu.
- **Zobrazená trasa linky** = nejdelší spoj v každém směru (varianty a větve se nekreslí zvlášť).
- **Časová zóna** z `agency.txt` (Europe/Tirane), ne z prohlížeče.

## TODO

1. **Hlídání feedu:** nasadit připravené repo `gtfs-watch` (GitHub Actions, ETag + hash obsahu, Releases `tirana-latest`). Proměnná `GTFS_URL_TIRANA` = URL výše. Zatím neběželo na GitHubu.
2. **Automatické načtení feedu** při startu (`gtfs.zip` vedle `index.html` nebo z `tirana-latest` release), aby nebylo nutné nahrávat ručně.
3. **Feed končí 31. 12. 2026.** UI už upozorní, zbývá stáhnout novou verzi, až ji město vydá (řeší hlídání feedu). Kalendář letištních linek je do 2027.
4. Kontrola stránky Luna (jízdní řád letiště) v rámci hlídání feedu.
5. Zobrazit varianty tras linek (větve), nejen nejdelší spoj.
6. Výběr libovolného data v plánovači (teď jen dnes/zítra).
7. Jízdné (`fare_*`) a odkazy na oficiální PDF jízdní řády (`timetable_pages.txt`).
8. Po změně `extra-airport.js` ručně přegenerovat `data/gtfs-extra.zip` – zvážit skript.
9. Git repozitář projektu (složka zatím není pod gitem).

## Známé chyby a omezení

- Rozlišení „Název (1)/(2)“ u stejnojmenných vzdálených zastávek je číslované bez popisu místa; pomáhá výpis linek v nápovědě. Prahová vzdálenost 300 m je odhad.
- Jen plánovaný jízdní řád, žádná zpoždění (realtime není k dispozici).
- Jízdní doba linky RT (30 min) je odhad, Luna ji neuvádí. Trasy letištních linek jsou z OSRM, skutečná trasa se může lišit.
- Kalendář letištních linek je natvrdo 2026–2027.
- Chůze vzdušnou čarou, ne po síti ulic.
- Při otevření z `file://` nefunguje OSM podklad a v náhledu artefaktu se podklad nemusí načíst vůbec.
- Ukázková síť se s letištním doplňkem neslučuje (doplněk jen k nahranému feedu).
