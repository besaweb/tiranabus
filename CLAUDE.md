# CLAUDE.md – Tirana Bus (MHD Tirana)

Mapa, odjezdy a plánovač MHD Tirany nad GTFS. Dvě cílové aplikace ze **společného kódu**: Desktop Web (https://tiranabus.al) a Android (WebView obálka, Google Play).

| Dokument | Kdy číst |
|---|---|
| `docs/TASKS.md` | vždy – úkoly, stavy, známé chyby |
| `docs/CHAT_HANDOVER.md` | vždy – rozpracovaná práce |
| `docs/ARCHITECTURE.md` | před změnou kódu – příslušná sekce |
| `docs/DECISIONS.md` | před architektonickou změnou |
| `docs/PROJECT_OVERVIEW.md` | zdroje dat, licence, URL, účty |
| `docs/ROADMAP.md`, `docs/CHATS.md` | plánování, rozdělení chatů |
| `docs/testing/README.md` | jak ověřovat |

## Komunikace

- Odpovídej česky, stručně, rovnou řešení. Nevysvětluj základy.
- Více možných řešení → krátký výčet variant. Když je něco nejasné, zeptej se.

## Postup práce (každý chat)

1. Přečti tento soubor, `docs/TASKS.md` a `docs/CHAT_HANDOVER.md`.
2. Najdi úkol v `TASKS.md`. Neexistuje → navrhni založení (zkontroluj podobné úkoly) a počkej na souhlas.
3. Proveď kontrolu SHARED BY DEFAULT (níže). Analyzuj současnou implementaci, než ji změníš.
4. Pracuj ve vlastní větvi / worktree (viz Git). Neměň nesouvisející části.
5. Ověř (viz Testy), aktualizuj stav úkolu, zapiš rozhodnutí do `DECISIONS.md`, změny architektury do `ARCHITECTURE.md`.
6. Nedokončeno → záznam v `CHAT_HANDOVER.md`. Dokončeno → záznam z `CHAT_HANDOVER.md` odstraň.

Úkol nikdy neoznačuj DONE jen proto, že se změnil kód.

## SHARED BY DEFAULT

Každá funkce je výchozí **SHARED** (web i Android). WEB ONLY / ANDROID ONLY jen s technickým zdůvodněním v úkolu.

Před implementací: platformy · společná logika · platformně specifické části · způsob sdílení · omezení.
Po implementaci: ověřit na všech relevantních platformách · regrese · aktualizovat úkol · zapsat rozdíly mezi platformami.

- Logika jen jednou, v čistých modulech (`js/gtfs-core.js`, `js/places.js`, …).
- Android se staví z webu – SHARED změna se do APK dostane dalším buildem; ověřit ji ale musíš i v APK.
- Platformní rozdíly jen přes dokumentované přepínače (dnes `window.OFFLINE_MAP`, `window.APP_VERSION`; cíl `PLATFORM`, úkol CORE-001). Každý rozdíl uvést v `ARCHITECTURE.md` › Platformní rozdíly.
- Texty pro obě platformy v `js/i18n.js` (cíl I18N-001).
- SHARED úkol je DONE až po ověření na webu **i** v Androidu; jinak REVIEW s poznámkou, co chybí.

## Kód

- Vanilla JS, žádný framework, bundler ani npm závislosti v aplikaci. Musí jít spustit přes `python -m http.server`.
- Knihovny jen z cdnjs s přesnou verzí (Leaflet 1.9.4, JSZip 3.10.1, PapaParse 5.4.1; APK navíc MapLibre GL 4.7.1). Nové knihovny jen po dohodě.
- Bez zbytečných komentářů. Krátké názvy ve stylu kódu, 2 mezery, středníky, jednoduché uvozovky.
- `js/gtfs-core.js` a `js/places.js` nesmí sahat na DOM ani Leaflet – čistá logika s `module.exports`.
- UI logika v `js/app.js`, styly v `css/style.css` přes CSS proměnné (světlý i tmavý režim).
- UI texty ve všech 12 jazycích v `js/i18n.js`. Uživatelský obsah vždy přes `esc()`.
- Pořadí skriptů v `index.html` neměnit bez důvodu (viz `ARCHITECTURE.md`).

## Data

- Městský feed `https://pt.tirana.al/gtfs/gtfs.zip` (CC BY-SA 4.0) neupravovat, zachovat atribuci. Doplňky (letiště LU-NA) jen v `js/extra-airport.js` s prefixem ID přes `GTFS.merge`; poté přegenerovat `data/gtfs-extra.zip` a tabulku v `README.md`.
- U ručně doplněných údajů uvádět zdroj a datum ověření; odhady označit.
- Časy v zóně feedu (Europe/Tirane), počítat s časy přes 24:00 a přechodem přes půlnoc.
- Zipy, `.ftp.env`, keystore nikdy do gitu.

## Testy

- `node --test tests/` (potřebuje `gtfs.zip` v kořeni nebo `GTFS_ZIP=cesta`). Běží i v CI na každém PR.
- Kalendář/odjezdy/plánovač: navíc čas kolem půlnoci a zítřejší den.
- UI: prohlížeč (Playwright), světlý i tmavý režim, šířka telefonu.
- Android: checklist v `docs/testing/README.md`.

## Git

- `main` = produkce (push spouští nasazení na GitHub Pages). Přímo na `main` necommitovat.
- Větev na úkol: `feat/WEB-012-popis`, `fix/BUG-001-popis`, `and/AND-001-popis`, `core/…`, `doc/…`. Commit začíná ID úkolu (`AND-001: …`).
- Paralelně přes worktree: `C:\WORK\Claude\MHD Tirana.wt\<ID>`. Ignorované soubory (`gtfs.zip`, keystore, `.ftp.env`) tam nejsou – testy přes `GTFS_ZIP`, nasazení a podpis jen z hlavní složky.
- Do `main` jen přes Pull Request se zelenými testy. Dva paralelní úkoly nesmí měnit stejnou oblast `app.js` / `i18n.js`.
- Nasazení FTP a build APK jen z čistého, aktuálního `main`.

## Dokumentace

- Stručně, aktuálně, bez duplicit: informace má jedno místo.
- `TASKS.md` a `CHAT_HANDOVER.md` při každé změně stavu; `releases/` při vydání; `ARCHITECTURE.md` / `DECISIONS.md` při změně řešení.
- `CLAUDE.md` měnit jen po schválení uživatelem.
