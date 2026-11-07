# Tasks – Tirana Bus

Aktualizováno: 2026-11-07

**Pravidla:** ID `PREFIX-NNN` se nikdy nepoužije znovu (prefixy CORE, WEB, AND, GTFS, POI, MAP, DATA, I18N, UX, SEO, MKT, BUG, TEST, DOC). Priority P0 kritická – P3 nízká. Stavy BACKLOG → READY → IN_PROGRESS → REVIEW → DONE; BLOCKED vždy s důvodem. Platforma SHARED / WEB / ANDROID (WEB/ANDROID se zdůvodněním). SHARED je DONE až s ☑ u obou platforem. DONE = splněná kritéria + testy + dokumentace; pak přesun do Archivu. Před založením hledat podobný úkol.

## Přehled

| ID | Název | Pl. | P | Stav | Závisí na | Akt. |
|---|---|---|---|---|---|---|
| DOC-001 | Dokumentační struktura `docs/`, nový CLAUDE.md | – | P1 | IN_PROGRESS | – | 2026-11-07 |
| TEST-001 | Testy v Node + CI na Pull Requestech | SHARED | P1 | REVIEW | – | 2026-11-07 |
| TEST-002 | Kontrola úplnosti překladů (12 jazyků) | SHARED | P1 | REVIEW | TEST-001 | 2026-11-07 |
| BUG-002 | Plánovač vrací spojení začínající před zadaným časem | SHARED | P1 | READY | – | 2026-11-07 |
| CORE-003 | Android jako Gradle projekt | ANDROID | P0 | READY | – | 2026-11-07 |
| AND-001 | Target API 36 + AAB pro Google Play | ANDROID | P0 | BLOCKED | CORE-003 | 2026-11-07 |
| AND-002 | Bezpečné podepisování: heslo mimo skript, záloha keystore, Play App Signing | ANDROID | P0 | READY | – | 2026-11-07 |
| DATA-001 | Ověřit běh `gtfs-watch` a `pages.yml` | SHARED | P0 | REVIEW | – | 2026-11-07 |
| GTFS-001 | Feed 2027 (současný končí 31. 12. 2026) | SHARED | P0 | BLOCKED | DATA-001 | 2026-11-07 |
| AND-003 | Ověřit offline režim na reálném telefonu | ANDROID | P1 | READY | – | 2026-11-07 |
| CORE-001 | Objekt `PLATFORM` místo `OFFLINE_MAP`/`APP_VERSION` | SHARED | P1 | BACKLOG | TEST-001 | 2026-11-07 |
| CORE-002 | Explicitní vkládací body pro Android místo `sed` | ANDROID | P1 | BACKLOG | CORE-003 | 2026-11-07 |
| I18N-001 | Texty Android menu/platnosti/úvodu do `i18n.js` | SHARED | P2 | BACKLOG | TEST-002 | 2026-11-07 |
| WEB-001 | `deploy-ftp.sh` jen z čistého `main` | WEB | P1 | READY | – | 2026-11-07 |
| SEO-001 | Google Search Console + Bing, odeslat sitemap | WEB | P1 | READY | – | 2026-11-07 |
| SEO-003 | Consent Mode v2 pro EU | SHARED | P1 | BACKLOG | – | 2026-11-07 |
| CORE-004 | Jeden seznam souborů pro Pages / FTP / Android | SHARED | P2 | BACKLOG | CORE-003 | 2026-11-07 |
| CORE-005 | Sjednocená konfigurace jízdného, kurzů, verze a platnosti | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| BUG-001 | Cena RT: 3 € (tickets) vs. 3,50 € (data) | SHARED | P2 | READY | – | 2026-11-07 |
| AND-004 | Limit cache dlaždic, robustní kopie mbtiles | ANDROID | P2 | BACKLOG | – | 2026-11-07 |
| AND-005 | Pro verze a licence (Ko-fi kódy, Play Billing) | ANDROID | P2 | BACKLOG | AND-001 | 2026-11-07 |
| I18N-002 | Korektury překladů rodilými mluvčími (sq, en prioritně) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-002 | Varianty tras linek (větve) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-003 | Libovolné datum v plánovači | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-004 | `fare_*` a odkazy na PDF řády (`timetable_pages.txt`) | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-002 | Skript pro přegenerování `data/gtfs-extra.zip` | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-003 | Kontrola stránky Luna v hlídání feedu | SHARED | P3 | BACKLOG | DATA-001 | 2026-11-07 |
| WEB-002 | Odznak Google Play jako odkaz na aplikaci | WEB | P3 | BLOCKED | AND-001 | 2026-11-07 |
| SEO-002 | Stránky zastávek (493 × 12), schema.org pro linky | WEB | P3 | BACKLOG | – | 2026-11-07 |

## Detail

### DOC-001 Dokumentační struktura
- Oblast: dokumentace · Platforma: – · P1 · IN_PROGRESS
- Popis: rozdělit `HANDOFF.md` a README do `docs/` dle schváleného návrhu, nový `CLAUDE.md`.
- Akceptační kritéria:
  - [x] `docs/` se soubory PROJECT_OVERVIEW, ARCHITECTURE, ROADMAP, DECISIONS, TASKS, CHAT_HANDOVER, CHATS, releases/, testing/
  - [x] každá informace z `HANDOFF.md` dohledatelná v `docs/`
  - [ ] PR schválen uživatelem a sloučen
- Historie: 2026-11-07 založeno a zahájeno

### TEST-001 Testy v Node + CI
- Oblast: testování · SHARED · P1 · READY
- Popis: `tests/*.test.js` přes vestavěný `node --test` (bez npm): build reálného feedu (počty linek/zastávek), kalendář a půlnoc, odjezdy, plánovač (snapshot regresní sady dotazů), `merge` letiště, `places`. Workflow `tests.yml` na každý PR stáhne `gtfs.zip` z release `tirana-latest`.
- Akceptační kritéria:
  - [x] `node --test "tests/*.test.js"` zelené lokálně (20 testů, 1 todo BUG-002)
  - [ ] zelené v CI (`.github/workflows/tests.yml`)
  - [x] regresní sada plánovače 2 × 81 dotazů se snapshotem
  - [x] `docs/testing/README.md` popisuje spuštění
- Poznámky: worktree – cesta k feedu přes `GTFS_ZIP`. Testovací den = úterý s nejvíce aktivními službami v platnosti feedu.
- Historie: 2026-11-07 implementováno, PR

### TEST-002 Úplnost překladů
- SHARED · P1 · READY · Závisí na TEST-001
- Kritéria: [x] test selže, pokud kterýkoli z 12 jazyků v `I18N.D` nemá stejnou sadu klíčů nebo parametrů jako `en` · [x] plurály · [x] letištní texty · [x] `android/menu.js`, `validity.js`
- Historie: 2026-11-07 implementováno spolu s TEST-001.

### BUG-002 Spojení začíná před zadaným časem
- Oblast: plánovač · SHARED · P1 · READY
- Popis: v režimu bez pěší sítě (vzdušná čára) plán vrátí spojení, jehož úvodní chůze začíná před zadaným časem – uživatel by spoj nestihl. Příklady (feed 2026-09-30, 1. 9. 2026): Pallati Brigadave → Haki Shehu 11:58 → start 11:57 (chůze 4 min na 8A v 12:01); Njësia 2 → Terminal D 12:00 → start 11:53. Pravděpodobně `tidy` (přesun nástupu na jinou zastávku téhož spoje) nebo dopočet úvodní chůze zpětně od odjezdu.
- Kritéria: test „spojení nezačíná před zadaným časem“ bez `todo`; regresní snapshot – příjezd nikdy horší; ověřeno na webu i v APK.
- Historie: 2026-11-07 nalezeno testem TEST-001.

### CORE-003 Android jako Gradle projekt
- Oblast: Android / build · ANDROID (build nástroj jen pro Android) · P0 · READY
- Popis: nahradit ruční `android/build.sh` minimálním Gradle projektem (bez Kotlinu, stávající `MainActivity.java`), který při buildu zkopíruje web do `assets` stejně jako dnes.
- Kritéria:
  - [ ] `gradlew assembleRelease` a `bundleRelease` fungují (Windows i Linux/CI)
  - [ ] výsledné APK funkčně shodné s dnešním (checklist `testing/README.md`)
  - [ ] podpis stejným klíčem (aktualizace přes stávající instalaci funguje)
  - [ ] heslo keystore z `keystore.properties` / proměnných prostředí, ne ze skriptu
- Poznámky: rozhodnutí D-018.

### AND-001 Target API 36 + AAB
- ANDROID · P0 · BLOCKED (čeká na CORE-003)
- Popis: Google Play od 31. 8. 2026 vyžaduje pro nové aplikace i aktualizace target API 36; nové aplikace jako AAB.
- Kritéria: `targetSdkVersion 36`; ověřeno na emulátoru API 36 (edge-to-edge, WebView, zpět, odkazy); podepsaný `.aab` prochází `bundletool validate`.

### AND-002 Bezpečné podepisování
- ANDROID · P0 · READY
- Kritéria: [ ] keystore zálohován mimo počítač (uživatel) · [ ] heslo není v gitu · [ ] rozhodnutí o Play App Signing zapsáno v DECISIONS.
- Poznámky: repozitář je soukromý, heslo je ale v historii gitu.

### DATA-001 Ověřit workflow
- SHARED · P0 · READY
- Kritéria: [x] release `tirana-latest` existuje a obsahuje platný `gtfs.zip` (feed 2026-09-30) · [x] denní běhy `gtfs-watch` a `pages.yml` zelené (ověřeno 7. 11. 2026, nasazení Pages úspěšné) · [ ] web na Pages načte feed sám (ověřit v prohlížeči)

### WEB-001 Bezpečný FTP deploy
- WEB (FTP jen pro web) · P1 · READY
- Kritéria: `deploy-ftp.sh` odmítne běžet mimo `main`, s necommitovanými změnami nebo za `origin/main`.

### BUG-001 Cena RT
- SHARED · P2 · READY
- Kritéria: ověřená cena na luna.al, sjednocená v `tickets` textech (`i18n.js`) i `extra-airport.js`, zdroj a datum v `PROJECT_OVERVIEW.md`.

## Známé chyby a omezení

- Statické stránky linek: první/poslední odjezd a interval z kalendáře podle dnů v týdnu (bez `calendar_dates` a rozsahu platnosti); u frekvenčních spojů poslední odjezd z `end_time`. Směry a názvy linek albánsky. `/{jazyk}` bez lomítka spoléhá na přesměrování serveru.
- Rozšířené vyhledávání: kvalita a překlady podle OSM (většinou albánský název), ulice bez čísel domů, velké areály mají bod uprostřed. `data/poi.json` obnovovat zhruba měsíčně.
- Stejnojmenné vzdálené zastávky bez popisu se číslují; prahová vzdálenost 300 m je odhad.
- Jen plánovaný jízdní řád, žádná zpoždění (realtime neexistuje).
- Linka RT: jízdní doba 30 min je odhad; trasy letištních linek z OSRM. Kalendář letištních linek natvrdo 2026–2027.
- Našeptávač na desktopu se ořízne spodním okrajem levého sloupce při velmi nízkém okně.
- Inter z Google Fonts; offline (APK bez cache) systémové písmo.
- Z `file://` nefunguje OSM podklad; v náhledu artefaktu se podklad nemusí načíst.
- Ukázková síť se s letištním doplňkem neslučuje.
- APK: offline režim a dlaždice ověřeny jen v emulátoru (AND-003); cache dlaždic bez limitu (AND-004).
- Překlady všech jazyků strojové, bez korektury (I18N-002). Kurzy měn pevné (ručně aktualizovat).
- Jízdné 40 lekë dodal uživatel bez zdroje – ověřit (tirana.al).

## Archiv (DONE)

| ID | Název | Dokončeno | Release |
|---|---|---|---|
| – | Práce do 6. 11. 2026 | – | viz `releases/history-2026-11.md` |
