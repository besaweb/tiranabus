# Pracovní chaty – Tirana Bus

8 tematických chatů (D-020). Nový chat jen pro novou oblast, ne pro drobnou úpravu. Každý chat na začátku čte `CLAUDE.md`, `docs/TASKS.md`, `docs/CHAT_HANDOVER.md` + dokumenty uvedené níže.

| Chat | Účel a rozsah | Prefixy úkolů | Navíc načítá | Spolupracuje s |
|---|---|---|---|---|
| **00 PROJECT MANAGEMENT** | priority, roadmapa, přehledy úkolů, kontrola SHARED a DONE, plán další práce. Neimplementuje. | – | `ROADMAP.md`, `DECISIONS.md` | všemi |
| **01 ARCHITECTURE & CORE** | `gtfs-core.js`, `places.js`, platformní vrstva, build a deploy skripty, CI, Git, worktree, technická rozhodnutí | CORE, DOC | `ARCHITECTURE.md`, `DECISIONS.md` | 02, 03 při změně API jádra |
| **02 DESKTOP WEB** | `app.js`, CSS, HTML, responzivita, design a UX, překlady, SEO, marketing a Google Search Console | WEB, UX, I18N, SEO, MKT | `ARCHITECTURE.md` (UI, Platformní rozdíly, Lokalizace, SEO) | 03 u každé SHARED změny UI |
| **03 ANDROID** | `android/`, Gradle, AAB, Google Play, offline režim, nativní funkce, Pro verze | AND | `ARCHITECTURE.md` (Android, Platformní rozdíly), `testing/README.md` | 01 (build), 02 (UI) |
| **04 ROUTES & GTFS & DATA** | plánovač, kalendář, odjezdy, letištní linky, feed a jeho hlídání, importy dat, eTransport | GTFS, DATA | `ARCHITECTURE.md` (Plánovač, Data), `PROJECT_OVERVIEW.md` | 01, 06 (regrese) |
| **05 MAPS & POI** | Leaflet, MapLibre, mbtiles, `poi.json`, `walk.json`, kategorie, navigace | POI, MAP | `ARCHITECTURE.md` (Mapy, Data) | 03 (offline mapa), 04 |
| **06 BUGS & TESTING** | chyby, testy, regrese, výkon | BUG, TEST | `testing/README.md` | všemi |
| **07 PROMO VIDEO** | scénář, záběry a export promo videa pro Google Play, Facebook a Ko-fi; texty a titulky. Aplikaci ani web nemění. | MKT (video) | `PROJECT_OVERVIEW.md`, `play/README.md` | 03 (záběry z APK, termín vydání), 02 (texty) |

## Předávání práce

- Práce mimo rozsah chatu → navrhnout úkol s prefixem cílové oblasti v `TASKS.md`, nedělat „mimochodem“.
- Nedokončená práce → `CHAT_HANDOVER.md`. Dokončená → stav v `TASKS.md`, záznam v handoveru smazat, změny do `releases/` při vydání.
- Chat 00 pracuje jen nad dokumenty; žádná důležitá informace nesmí zůstat jen v konverzaci.

## Typické dotazy pro chat 00

- „Otevřené úkoly podle priority“ · „Rozpracované podle platformy“ · „Blokované úkoly a co je odblokuje“
- „SHARED úkoly s neověřenou platformou“ · „Co dělat dál (3 úkoly)“ · „Aktualizuj ROADMAP“
