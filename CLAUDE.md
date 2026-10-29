# CLAUDE.md – MHD Tirana

Mapa a plánovač MHD Tirany nad GTFS. Aktuální stav, TODO a známé chyby: `HANDOFF.md`. Uživatelský popis: `README.md`.

## Komunikace

- Odpovídej česky, stručně, rovnou řešení. Nevysvětluj základy.
- Více možných řešení → krátký výčet variant, ne jedna dlouhá odpověď.
- Když je něco nejasné, zeptej se.

## Kód

- Vanilla JS, žádný framework, bundler ani npm závislosti v aplikaci. Musí jít spustit otevřením `index.html`.
- Knihovny jen z cdnjs s přesnou verzí (Leaflet 1.9.4, JSZip 3.10.1, PapaParse 5.4.1). Nové knihovny jen po dohodě.
- Bez zbytečných komentářů. Krátké názvy proměnných ve stylu stávajícího kódu, 2 mezery, středníky, jednoduché uvozovky.
- `js/gtfs-core.js` nesmí sahat na DOM ani Leaflet – čistá logika, testovatelná v Node (`module.exports`).
- UI logika patří do `js/app.js`, styly do `css/style.css` přes CSS proměnné (světlý i tmavý režim).
- Texty v UI jsou ve třech jazycích (cs, en, sq) v `js/i18n.js`; nový text vždy přidat do všech tří. Uživatelský obsah vždy přes `esc()`.
- Pořadí skriptů v `index.html` neměnit bez důvodu (`gtfs-core` → `demo` → `extra-airport` → `i18n` → `app`).

## Data

- Městský feed: https://pt.tirana.al/gtfs/gtfs.zip, licence CC BY-SA 4.0 – zachovat atribuci v mapě a v README.
- Městský feed neupravovat. Doplňky (letiště LU-NA) řešit v `js/extra-airport.js` s vlastním prefixem ID přes `GTFS.merge`.
- Po každé změně `js/extra-airport.js` přegenerovat `data/gtfs-extra.zip` a aktualizovat tabulku v `README.md`.
- U ručně doplněných údajů uvádět zdroj a datum ověření; odhady označit jako odhad.
- Časy počítat v časové zóně feedu (Europe/Tirane), ne prohlížeče. Počítat s časy přes 24:00 a s přechodem přes půlnoc.
- `gtfs.zip` v kořeni je lokální kopie feedu, necommitovat ho do gitu (zipy patří do Releases).

## Ověření před předáním

- Načíst skutečný `gtfs.zip` přes `GTFS.readZip` + `GTFS.build` v Node a zkontrolovat počty linek/zastávek.
- Pro změny v kalendáři/odjezdech/plánovači otestovat i čas kolem půlnoci a zítřejší den.
- Změny UI zkontrolovat v prohlížeči (Playwright), světlý i tmavý režim, šířka telefonu.

## Údržba dokumentace

- Po dokončení změny aktualizovat `HANDOFF.md` (Hotovo, TODO, Známé chyby) a případně `README.md`.
- Rozhodnutí, která mění architekturu, zapsat do sekce Rozhodnutí v `HANDOFF.md`.
