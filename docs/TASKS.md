# Tasks – Tirana Bus

Aktualizováno: 2026-11-07

**Pravidla:** ID `PREFIX-NNN` se nikdy nepoužije znovu (prefixy CORE, WEB, AND, GTFS, POI, MAP, DATA, I18N, UX, SEO, MKT, BUG, TEST, DOC). Priority P0 kritická – P3 nízká. Stavy BACKLOG → READY → IN_PROGRESS → REVIEW → DONE; BLOCKED vždy s důvodem. Platforma SHARED / WEB / ANDROID (WEB/ANDROID se zdůvodněním). SHARED je DONE až s ☑ u obou platforem. DONE = splněná kritéria + testy + dokumentace; pak přesun do Archivu. Před založením hledat podobný úkol.

## Přehled

| ID | Název | Pl. | P | Stav | Závisí na | Akt. |
|---|---|---|---|---|---|---|
| BUG-002 | Plánovač vrací spojení začínající před zadaným časem | SHARED | P1 | READY | – | 2026-11-07 |
| CORE-003 | Android jako Gradle projekt | ANDROID | P0 | REVIEW | – | 2026-11-07 |
| AND-002 | Bezpečné podepisování: heslo mimo skript, záloha keystore, Play App Signing | ANDROID | P0 | REVIEW | – | 2026-11-07 |
| DATA-001 | Ověřit běh `gtfs-watch` a `pages.yml` | SHARED | P0 | REVIEW | – | 2026-11-07 |
| GTFS-001 | Feed 2027 (současný končí 31. 12. 2026) | SHARED | P0 | BLOCKED | DATA-001 | 2026-11-07 |
| CORE-001 | Objekt `PLATFORM` místo `OFFLINE_MAP`/`APP_VERSION` | SHARED | P1 | BACKLOG | TEST-001 | 2026-11-07 |
| CORE-002 | Explicitní vkládací body pro Android místo `sed` | ANDROID | P1 | BACKLOG | CORE-003 | 2026-11-07 |
| I18N-001 | Texty Android menu/platnosti/úvodu do `i18n.js` | SHARED | P2 | BACKLOG | TEST-002 | 2026-11-07 |
| WEB-001 | `deploy-ftp.sh` jen z čistého `main` | WEB | P1 | READY | – | 2026-11-07 |
| SEO-001 | Google Search Console + Bing, odeslat sitemap | WEB | P1 | READY | – | 2026-11-07 |
| SEO-003 | Consent Mode v2 pro EU | SHARED | P1 | BACKLOG | – | 2026-11-07 |
| CORE-004 | Jeden seznam souborů pro Pages / FTP / Android | SHARED | P2 | BACKLOG | CORE-003 | 2026-11-07 |
| CORE-005 | Sjednocená konfigurace jízdného, kurzů, verze a platnosti | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| CORE-006 | Android Gradle build v CI na Linuxu | ANDROID | P2 | READY | CORE-003 | 2026-11-07 |
| BUG-001 | Cena RT: 3 € (tickets) vs. 3,50 € (data) | SHARED | P2 | READY | – | 2026-11-07 |
| AND-005 | Pro verze a licence (Ko-fi kódy, Play Billing) | ANDROID | P2 | BACKLOG | – | 2026-11-07 |
| AND-006 | Barvy systémových lišt podle motivu stránky (přepínač v aplikaci vs. systém) | ANDROID | P3 | BACKLOG | – | 2026-11-07 |
| I18N-002 | Korektury překladů rodilými mluvčími (sq, en prioritně) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-002 | Varianty tras linek (větve) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-003 | Libovolné datum v plánovači | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-004 | `fare_*` a odkazy na PDF řády (`timetable_pages.txt`) | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-002 | Skript pro přegenerování `data/gtfs-extra.zip` | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-003 | Kontrola stránky Luna v hlídání feedu | SHARED | P3 | BACKLOG | DATA-001 | 2026-11-07 |
| WEB-002 | Odznak Google Play jako odkaz na aplikaci | WEB | P3 | BLOCKED | publikace v Play | 2026-11-07 |
| SEO-002 | Stránky zastávek (493 × 12), schema.org pro linky | WEB | P3 | BACKLOG | – | 2026-11-07 |

## Detail

### BUG-002 Spojení začíná před zadaným časem
- Oblast: plánovač · SHARED · P1 · READY
- Popis: v režimu bez pěší sítě (vzdušná čára) plán vrátí spojení, jehož úvodní chůze začíná před zadaným časem – uživatel by spoj nestihl. Příklady (feed 2026-09-30, 1. 9. 2026): Pallati Brigadave → Haki Shehu 11:58 → start 11:57 (chůze 4 min na 8A v 12:01); Njësia 2 → Terminal D 12:00 → start 11:53. Pravděpodobně `tidy` (přesun nástupu na jinou zastávku téhož spoje) nebo dopočet úvodní chůze zpětně od odjezdu.
- Kritéria: test „spojení nezačíná před zadaným časem“ bez `todo`; regresní snapshot – příjezd nikdy horší; ověřeno na webu i v APK.
- Historie: 2026-11-07 nalezeno testem TEST-001.

### CORE-003 Android jako Gradle projekt
- Oblast: Android / build · ANDROID (build nástroj jen pro Android) · P0 · REVIEW
- Popis: nahradit ruční `android/build.sh` minimálním Gradle projektem (bez Kotlinu, stávající `MainActivity.java`), který při buildu zkopíruje web do `assets` stejně jako dnes.
- Kritéria:
  - [x] `./gradlew apk` a `aab` fungují na Windows · [ ] Linux/CI neověřeno
  - [x] výsledné APK shodné s dnešním: `assets` stejné bajt po bajtu (kromě konců řádků), certifikát SHA-256 `0354…0d92` shodný; emulátor API 36: start, feed, offline mapa, menu · [x] zbytek checklistu na Samsung Galaxy S21 (7. 11. 2026, hlášeno uživatelem: vše v pořádku, vč. režimu letadlo, okrajů, Zpět)
  - [x] podpis stejným klíčem (`adb install -r` přes stávající instalaci proběhl)
  - [x] heslo z `keystore.properties` / `TB_KS_PASS`
- Poznámky: rozhodnutí D-018, D-023. `build.sh` odstraněn. Zbývá jen Linux/CI (CORE-006).

### CORE-006 Android Gradle build v CI na Linuxu
- Oblast: CI / build · ANDROID (build jen pro Android) · P2 · READY
- Popis: ověřit, že `./gradlew` build funguje mimo Windows, a hlídat ho na Pull Requestech, které sahají do `android/` nebo sdíleného webu. Uzavírá poslední kritérium CORE-003.
- Kritéria:
  - [ ] workflow `.github/workflows/android.yml` (spouští se na PR s `android/**`, `index.html`, `css/**`, `js/**`, `data/**`, `img/**` a ručně), JDK 17+, Android SDK z runneru, `gtfs.zip` z release `tirana-latest`
  - [ ] bez podpisových tajemství: sestaví nepodepsaný `assembleRelease` nebo `assembleDebug` + `bundleDebug` (podepisování zůstává lokálně z hlavní složky, D-022); kontrola `checkSigning` se pro release bez hesla musí chovat podle D-022
  - [ ] `android/gradlew` spustitelný v gitu (opraveno 2026-11-07: `git update-index --chmod=+x`) · [ ] konce řádků `gradlew` LF na Linuxu
  - [ ] CI zelené na PR, doba běhu a velikost cache Gradle zapsány
- Poznámky: Gradle stahuje knihovny z cdnjs (`prepareSite`), CI musí mít síť. AGP 9.0.0 vyžaduje Gradle 9.1+ a JDK 17+.

### AND-002 Bezpečné podepisování
- ANDROID · P0 · READY
- Kritéria: [ ] keystore zálohován mimo počítač (uživatel) · [x] heslo není ve skriptu (`keystore.properties` / `TB_KS_PASS`, heslo samotné beze změny, certifikát APK ověřen shodný) · [x] rozhodnutí o Play App Signing zapsáno v DECISIONS (D-022)
- Zbývá: záloha keystore mimo počítač (uživatel); zapnutí Play App Signing při prvním nahrání AAB (AND-001).
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
- APK: ověřeno na emulátoru API 36 a Samsung Galaxy S21 (7. 11. 2026, výsledek od uživatele bez podrobností o verzi Androidu); build na Linuxu/CI zatím ne.
- Překlady všech jazyků strojové, bez korektury (I18N-002). Kurzy měn pevné (ručně aktualizovat).
- Jízdné 40 lekë dodal uživatel bez zdroje – ověřit (tirana.al).

## Archiv (DONE)

| ID | Název | Dokončeno | Release |
|---|---|---|---|
| DOC-001 | Dokumentační struktura `docs/`, nový CLAUDE.md | 2026-11-07 | PR #3 |
| TEST-001 | Testy v Node + CI na Pull Requestech (CI zelené) | 2026-11-07 | PR #4 |
| TEST-002 | Kontrola úplnosti překladů (12 jazyků, i Android slovníky) | 2026-11-07 | PR #4 |
| AND-001 | Target API 36, edge-to-edge a Zpět v obálce, AAB (`bundletool validate` OK; emulátor API 36 a Samsung S21) | 2026-11-07 | PR #8 |
| AND-003 | Offline režim ověřen na reálném telefonu (Samsung Galaxy S21, APK 1.8-test, checklist `testing/README.md`) | 2026-11-07 | – |
| AND-004 | `DiskCache` (limit 100 MB, platnost 30 dní, SHA-256) a robustní kopie mbtiles | 2026-11-07 | PR #9 |
| – | Práce do 6. 11. 2026 | – | viz `releases/history-2026-11.md` |
