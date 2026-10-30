# HANDOFF – MHD Tirana

Stav k 29. 10. 2026. Pravidla pro práci na projektu jsou v `CLAUDE.md`.

## Co to je

Statická webová aplikace (vanilla JS, bez buildu) nad GTFS feedem MHD Tirany. Mapa linek a zastávek, nejbližší odjezdy a vyhledání spojení. Vše běží v prohlížeči, žádný backend.

## Hotovo

- **Načtení GTFS** ze zipu (automaticky při startu, záložně drag & drop; tlačítka Stáhnout/Nahrát GTFS, hlášení „Načteno“ a štítky shapes/frequencies/letiště byly odstraněny), parsování přes PapaParse, zpracování jen v prohlížeči.
- **Ukázková síť** (`demo.js`) při startu, dokud uživatel nenahraje feed.
- **Mapa** (Leaflet, canvas renderer): linky podle `shapes.txt`, jinak rovné spojnice zastávek. Volba podkladu: OSM, Esri ulice, Esri letecká, OpenTopoMap, bez podkladu. Volba se ukládá do `localStorage`.
- **Prohlížení:** seznam linek s hledáním, detail linky (zastávky po směrech, přestupní linky), detail zastávky s odjezdy na 3 h dopředu, obnova každých 30 s.
- **Kalendář:** `calendar.txt` + `calendar_dates.txt`, časy přes 24:00, odjezdy z předchozího i následujícího provozního dne (oprava chyby kolem půlnoci).
- **`frequencies.txt`:** podporované v odjezdech i v plánovači (Tirana je zatím nepoužívá).
- **Plánovač spojení:** Connection Scan Algorithm s Pareto výběrem (čas příjezdu × počet přestupů), chůze mezi zastávkami, až 5 jízd, horizont 6 h, dnes/zítra. Detail cesty s mezizastávkami a vykreslením na mapě.
- **Seskupení zastávek** (`GTFS.groupStops`): podle názvu a vzdálenosti do 300 m. Vzdálené stejnojmenné zastávky se rozliší jako „Název (1)“, „Název (2)“ (ve feedu Selitë, Xhamia). Skupiny mají id, výběr v plánovači jde přes id.
- **Jazykové verze** čeština / angličtina / albánština / italština / němčina / polština (`js/i18n.js`, přepínač vlajek SQ | EN | CS | IT | DE | PL v hlavičce; it/de/pl doplněny 30. 10. 2026, překlady psané strojově – zkontrolovat rodilým mluvčím; pl má 3 tvary množného čísla, měny: it/de EUR, pl PLN kurz .047 odhad; vlajky jsou inline SVG, protože emoji vlajky ve Windows nefungují): slovník `I18N.D`, funkce `t(klíč, {param})` a `pl(klíč, n)` (cs má 3 tvary množného čísla, en a sq 2). Statické texty v `index.html` mají `data-i18n*` atributy, `applyLang()` v `app.js` je přepíše a znovu vykreslí panel. Jazyk se ukládá do `localStorage` (`tirana-mhd-lang`), jinak se vezme z prohlížeče (sq/cs/en, jinak en). Názvy zastávek a linek se nepřekládají. Albánština a angličtina jsou strojový překlad bez rodilého korektora.
- **Poznámka „časy jsou orientační“** (klíč `approx`) pod odjezdy zastávky i pod výsledky plánovače.
- **Přehled počtů** (linek, zastávek, spojů) odstraněn z postranního panelu; zůstaly údaje Dopravce a Platnost, řádek Zdroj (název souboru a časová zóna) byl také odstraněn (na telefonu je celý blok `.meta` skrytý). Záložky mají ikony: Spojení autobus, Linky a zastávky trasa se dvěma zastávkami (inline SVG).
- **Informace o jízdném** (klíč `fare`, nad záložkami, i na telefonu): 40 lekë za jednu jízdu na všech městských linkách (kromě cest na/z letiště), platí se v autobuse hotově, průvodčí vydá papírovou jízdenku, jen na jednu jízdu, nepřenosné. Údaj dodal uživatel 29. 10. 2026, bez uvedeného zdroje, stojí za ověření a případné doplnění odkazu (např. tirana.al).
- **Cena spojení** v souhrnu každého nalezeného spojení (`fareText` v `app.js`): počet jízd × 40 lekë (každý nástup se platí zvlášť, jízdenka není přenosná) a v závorce přepočet: CZK v češtině, EUR v angličtině, v albánštině bez přepočtu. Jízdy linkami Luna Travel se počítají podle linky: RX 400 lekë, RT 300 lekë (`FARE.luna`, podle luna.al/aeroporti ze 29. 10. 2026), ostatní jízdy 40 lekë. Pevné kurzy `FARE.cur`: 1 lek ≈ 0,268 Kč, ≈ 0,011 €. Odhad podle kurzů z open.er-api.com ze 29. 10. 2026 (1 EUR = 90,88 ALL = 24,36 CZK); kurzy se v aplikaci nenačítají, je třeba je občas ručně aktualizovat. U spojení jen pěšky se cena nezobrazuje.
- **Přepínač jazyka na telefonu** (≤ 760 px): jedna vlajka vpravo nahoře v hlavičce, klepnutím se rozbalí nabídka všech šesti, výběr nebo klepnutí mimo ji zavře. Na desktopu zůstávají tři vlajky vedle sebe.
- **Záložka Spojení je první** a je výchozí režim po startu.
- **Hlídání feedu** (`.github/workflows/gtfs-watch.yml`, připraveno, zatím necommitnuto a neběželo): denně stáhne feed, ověří zip a povinné soubory, porovná sha256 s hodnotou v popisu release `tirana-latest` a při změně nahraje nový `gtfs.zip` do Releases. Repozitář `gtfs-watch` se tím nahrazuje workflow přímo v tomto repu, proměnná `GTFS_URL_TIRANA` není potřeba (URL je ve workflow).
- **Automatické načtení feedu při startu** (`autoLoad` v `app.js`): přes http(s) zkusí `fetch('gtfs.zip')` vedle `index.html`, při úspěchu ho načte stejnou cestou jako ruční nahrání (včetně letištního doplňku); jinak zůstane ukázková síť. Nepřepíše ručně nahraný soubor. Na GitHub Pages dodá `gtfs.zip` workflow `pages.yml` (necommitnuto, neběželo; vyžaduje Pages Source = GitHub Actions). Zip se tak nedostane do gitu.
- **Upozornění na platnost feedu** (`GTFS.validity`, `renderExpiry`): žlutočervený pruh v postranním panelu, když feed skončil, začíná až v budoucnu nebo končí do 30 dnů. U ukázkové sítě se nezobrazuje.
- **Hledání bez diakritiky** v seznamu linek a zastávek (`norm`).
- **Letištní linky LU-NA** (`extra-airport.js`): RX Opera ⇄ TIA (24/7, každou hodinu, 45 min), RT Terminál Jug–Sever ⇄ TIA (7–18 / 8–18 h, odhad 30 min). Slučují se do každého nahraného feedu s prefixem ID `rx:`. Stejná data jako samostatný GTFS v `data/gtfs-extra.zip`.
- **Vzhled:** světlý i tmavý režim, responzivní, české UI.
- **Android APK** (`android/`): WebView obálka bez Gradle, `bash android/build.sh` → `android/out/TiranaBus.apk` (min. Android 7, podepsáno vlastním klíčem). Web, Leaflet/JSZip/PapaParse a lokální `gtfs.zip` jsou v APK; `gtfs.zip` se při startu stáhne z Pages a uloží do `filesDir`; offline se použije uložená, jinak vložená kopie. Mapové dlaždice a Google Fonts se při prvním zobrazení ukládají do `cacheDir/ext` a dál fungují offline (jen dříve prohlížená místa, cache bez limitu a expirace). Verze 1.3. Offline režim neověřen na zařízení. Ověřeno na emulátoru (aplikace, feed, UI); dlaždice se tam nenačetly kvůli TLS na emulátoru, na telefonu neověřeno. **Menu (v1.5, jen APK, web beze změny):** `android/menu.js` + `menu.css` nahradí vlajky tlačítkem ☰ s položkami Jazyk (přesune stávající přepínač cs/en/sq do menu) a O aplikaci (verze z `window.APP_VERSION`, vkládá `build.sh`). V cs/sq verzi `menu.js` nahradí nativní pole času (WebView ukazuje AM/PM podle jazyka zařízení) textovým polem HH:MM (maska, 24 h; `#time` si zachová `value` přes proxy, takže `app.js` zůstává beze změny); v en zůstává nativní pole. Logo (od 30. 10. 2026; web `img/logo.png` i APK): adaptivní (`res/mipmap-anydpi-v26/ic_launcher.xml`, popředí `ic_launcher_foreground.png` 432 px, pozadí barva `#0141A4`) + starší `ic_launcher.png` 192 px pro Android < 8, zdroj logo ze `TiranaBusIcon` (3.webp). Úvodní obrazovka v APK: `android/splash.webp` jako pozadí `#boot` (SVG skryté) + text „Načítají se jízdní řády“ (cs/en/sq, v tmavé pilulce se stínem) nad simulovaným progress barem (CSS animace do 92 %, po `.done` 100 %); oba prvky vkládá `build.sh` z `android/boot-extra.html` přímo do HTML, aby byly vidět hned; web má původní modrou obrazovku. Texty menu jsou přímo v `menu.js` (3 jazyky), ne v `i18n.js`, aby se web nemusel měnit. **Offline vektorová mapa (v1.4, jen APK):** `android/map/tirana.mbtiles` (OpenMapTiles schéma, výřez Tirany bbox 19.62,41.22,20.02,41.46, z0–14, 6,6 MB, vygenerováno Planetilerem 0.10.2 z Geofabrik albania.osm.pbf, 30. 10. 2026), styly `style-light/dark.json` (generuje `android/map/mkstyle.py`), glyfy Noto Sans (Protomaps basemaps-assets). `build.sh` přidá MapLibre GL JS 4.7.1 (cdnjs) a `window.OFFLINE_MAP=1`; `MainActivity` servíruje `/vt/{z}/{x}/{y}.pbf` z mbtiles (kopie ve `filesDir`). `app.js` přidá vrstvu „Offline mapa“ (Leaflet obálka nad MapLibre, výchozí v APK, přepíná styl se světlým/tmavým režimem). Ověřeno v emulátoru v letadlovém režimu. Mimo bbox je mapa prázdná; atribuce © OpenMapTiles © OpenStreetMap. Regenerace Planetileru: data stahovat `curl`em (Java v tomto prostředí nedůvěřuje TLS), spouštět s `--nodemap-type=sparsearray --storage=mmap`.
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
├── js/i18n.js            překlady cs/en/sq/it/de/pl, t(), pl()
├── js/app.js             mapa, panely, plánovací formulář, načítání souboru
├── android/              WebView obálka a build.sh pro APK (build/, out/, *.keystore jsou v .gitignore)
└── data/gtfs-extra.zip   letištní linky jako samostatný GTFS (generovaný z extra-airport.js)
```

Pořadí skriptů v `index.html`: `gtfs-core` → `demo` → `extra-airport` → `i18n` → `app`. Moduly jsou globální proměnné (`GTFS`, `demoTables`, `EXTRA_FEEDS`, `I18N`). `gtfs-core.js` a `extra-airport.js` exportují i přes `module.exports`, takže jdou testovat v Node.

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

Letiště ve feedu není (Rinas leží mimo území města, linky provozuje soukromý LU-NA). Zdroje pro doplněk (ověřeno 29. 10. 2026):

- https://luna.al/aeroporti (přehled linek, sekce `#timetable` a `#stacionet`) a https://luna.al/aeroporti/orari (jízdní řád obou směrů). Starší adresy `luna.al/en/airport/...` nahrazeny těmito.
- Strojově čitelná data (API, PDF, GTFS) neexistují. Stránka je Next.js, v HTML je jen JSON-LD (schema.org) s cenami a odkazy na Google Maps u stanic. Stránka ukazuje jen aktuální den, bez minutových časů, provozních dní, výjimek a platnosti řádu.
- Potvrzeno: Qendra ⇄ TIA 24/7 každou celou hodinu (00:00–23:00) v obou směrech, jízdné 400 L (JSON-LD); Terminali Jug-Veri → TIA 07:00–18:00 (12 odjezdů), TIA → terminál 08:00–18:00 (11 odjezdů), jízdné 300 L (JSON-LD). Doba jízdy 45 min je na stránce uvedena u hlavní linky, u RT není (30 min zůstává odhad). Souřadnice stanic z vložených Google Map sedí s `extra-airport.js` na desítky metrů. Hodinové časy odjezdů jsou ze shrnutí stránky, ne z čtení surového HTML.
- Další údaje ze stránky (zatím v aplikaci nepoužité): platba v lekë, eurech nebo kartou (POS); jízdenka platí celý den; velké zavazadlo +500 L; 50% sleva pro albánské občany se zdravotním postižením; online platba kartou +30 L (RX) / +28 L (RT).

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

1. **Hlídání feedu:** po pushi workflow jednou spustit ručně (workflow_dispatch) a zkontrolovat vznik release `tirana-latest`. Pak případně přidat kontrolu stránky Luna (bod 4).
2. Zapnout GitHub Pages (Source: GitHub Actions) a po pushi ověřit, že běží `pages.yml` a web na Pages načte feed sám.
3. **Feed končí 31. 12. 2026.** UI už upozorní, zbývá stáhnout novou verzi, až ji město vydá (řeší hlídání feedu). Kalendář letištních linek je do 2027.
4. Kontrola stránky Luna (jízdní řád letiště) v rámci hlídání feedu.
5. Zobrazit varianty tras linek (větve), nejen nejdelší spoj.
6. Výběr libovolného data v plánovači (teď jen dnes/zítra).
7. Jízdné (`fare_*`) a odkazy na oficiální PDF jízdní řády (`timetable_pages.txt`).
8. Po změně `extra-airport.js` ručně přegenerovat `data/gtfs-extra.zip` – zvážit skript.
9. Android: zálohovat `android/tirana-bus.keystore` (bez něj nejde APK aktualizovat přes stávající instalaci), případně ikona se zaoblením (adaptive icon) a vydání APK do Releases.

## Známé chyby a omezení

- Rozlišení „Název (1)/(2)“ u stejnojmenných vzdálených zastávek je číslované bez popisu místa; pomáhá výpis linek v nápovědě. Prahová vzdálenost 300 m je odhad.
- Jen plánovaný jízdní řád, žádná zpoždění (realtime není k dispozici).
- Jízdní doba linky RT (30 min) je odhad, Luna ji neuvádí. Trasy letištních linek jsou z OSRM, skutečná trasa se může lišit.
- Kalendář letištních linek je natvrdo 2026–2027.
- Chůze vzdušnou čarou, ne po síti ulic.
- Při otevření z `file://` nefunguje OSM podklad a v náhledu artefaktu se podklad nemusí načíst vůbec.
- Ukázková síť se s letištním doplňkem neslučuje (doplněk jen k nahranému feedu).
