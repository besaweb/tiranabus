# Tasks – Tirana Bus

Aktualizováno: 2026-11-07

**Pravidla:** ID `PREFIX-NNN` se nikdy nepoužije znovu (prefixy CORE, WEB, AND, GTFS, POI, MAP, DATA, I18N, UX, SEO, MKT, BUG, TEST, DOC). Priority P0 kritická – P3 nízká. Stavy BACKLOG → READY → IN_PROGRESS → REVIEW → DONE; BLOCKED vždy s důvodem. Platforma SHARED / WEB / ANDROID (WEB/ANDROID se zdůvodněním). SHARED je DONE až s ☑ u obou platforem. DONE = splněná kritéria + testy + dokumentace; pak přesun do Archivu. Před založením hledat podobný úkol.

## Přehled

| ID | Název | Pl. | P | Stav | Závisí na | Akt. |
|---|---|---|---|---|---|---|
| BUG-002 | Plánovač vrací spojení začínající před zadaným časem | SHARED | P1 | READY | – | 2026-11-07 |
| DATA-001 | Ověřit běh `gtfs-watch` a `pages.yml` | SHARED | P0 | REVIEW | – | 2026-11-07 |
| GTFS-001 | Feed 2027 (současný končí 31. 12. 2026) | SHARED | P0 | BLOCKED | DATA-001 | 2026-11-07 |
| CORE-001 | Objekt `PLATFORM` místo `OFFLINE_MAP`/`APP_VERSION` | SHARED | P1 | BACKLOG | TEST-001 | 2026-11-07 |
| CORE-002 | Explicitní vkládací body pro Android místo přepisování `index.html` v Gradle | ANDROID | P1 | BACKLOG | – | 2026-11-07 |
| I18N-001 | Texty Android menu/platnosti/úvodu do `i18n.js` | SHARED | P2 | BACKLOG | TEST-002 | 2026-11-07 |
| WEB-001 | `deploy-ftp.sh` jen z čistého `main` | WEB | P1 | READY | – | 2026-11-07 |
| SEO-001 | Google Search Console + Bing, odeslat sitemap | WEB | P1 | READY | – | 2026-11-07 |
| SEO-003 | Consent Mode v2 pro EU | SHARED | P1 | BACKLOG | – | 2026-11-07 |
| CORE-004 | Jeden seznam souborů pro Pages / FTP / Android | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| CORE-005 | Sjednocená konfigurace jízdného, kurzů, verze a platnosti | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| BUG-001 | Cena RT: 3 € (tickets) vs. 3,50 € (data) | SHARED | P2 | READY | – | 2026-11-07 |
| AND-008 | První vydání v Google Play (podklady, testovací stopa) | ANDROID | P0 | IN_PROGRESS | ověření účtu Play | 2026-11-07 |
| AND-005 | Pro: roční předplatné 4,99 € přes Google Play Billing | ANDROID | P2 | BACKLOG | CORE-007, první vydání v Play | 2026-11-07 |
| CORE-007 | Oprávnění Pro (`PLATFORM.pro`) a zamykání funkcí | SHARED | P2 | BACKLOG | CORE-001 | 2026-11-07 |
| MAP-001 | Moje poloha a nejbližší zastávky (Pro později) | ANDROID | P2 | REVIEW | – | 2026-11-07 |
| UX-001 | Předvolby Domů / Práce / Škola pro Odkud a Kam (Pro) | ANDROID | P2 | BACKLOG | CORE-007 | 2026-11-07 |
| UX-002 | Našeptávač u pole Kam je na telefonu schovaný pod klávesnicí | SHARED | P2 | READY | – | 2026-11-07 |
| POI-001 | Vlastní body na mapě, použitelné v Odkud a Kam (Pro) | ANDROID | P2 | BACKLOG | CORE-007 | 2026-11-07 |
| AND-007 | Promo kódy z Play Console pro přispěvatele Ko-fi | ANDROID | P3 | BACKLOG | AND-005 | 2026-11-07 |
| MKT-001 | Reklamy pro neplatící uživatele aplikace | ANDROID | P3 | BACKLOG | AND-005, SEO-003 | 2026-11-07 |
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

### DATA-001 Ověřit workflow
- SHARED · P0 · READY
- Kritéria: [x] release `tirana-latest` existuje a obsahuje platný `gtfs.zip` (feed 2026-09-30) · [x] denní běhy `gtfs-watch` a `pages.yml` zelené (ověřeno 7. 11. 2026, nasazení Pages úspěšné) · [ ] web na Pages načte feed sám (ověřit v prohlížeči)

### WEB-001 Bezpečný FTP deploy
- WEB (FTP jen pro web) · P1 · READY
- Kritéria: `deploy-ftp.sh` odmítne běžet mimo `main`, s necommitovanými změnami nebo za `origin/main`.

### AND-008 První vydání v Google Play
- Oblast: Android / vydání · ANDROID (Google Play) · P0 · IN_PROGRESS
- Popis: podklady pro Play Console a první nahrání AAB na testovací stopu. Podklady v `docs/play/`.
- Kritéria:
  - [x] ikona 512 × 512, hlavní obrázek 1024 × 500, 6 snímků 1080 × 1920 (emulátor API 36, 2026-11-07)
  - [x] texty listingu en, sq (strojově, ke kontrole), cs; odpovědi pro Data safety, IARC a ostatní formuláře; postup vydání
  - [x] typ účtu: osobní, veřejné jméno „BesaWeb“ (2026-11-07) · [ ] uživatel založí účet a ověří totožnost · [ ] uzavřený test 12 testerů / 14 dní · [x] záloha keystore provedena (uživatel, 2026-11-07)
  - [ ] AAB `1.8` / `versionCode 18` z čistého `main` nahrané na interní testování, Play App Signing zapnuté při prvním nahrání (D-022)
- Poznámky: hlavní obrázek je z obálky se starším modrým logem, doporučeno nahradit. Při snímcích nalezeno: našeptávač u pole Kam je na telefonu schovaný pod klávesnicí (navrhnout úkol pro Chat 02).

### AND-005 Pro: roční předplatné přes Google Play Billing
- Oblast: Android / platby · ANDROID (Google Play Billing existuje jen v aplikaci z Play; D-026) · P2 · BACKLOG
- Popis: předplatné „Tirana Bus Pro“ 4,99 € / rok, bez zkušební doby. Play Billing Library (nová nativní závislost v Gradle, schváleno volbou modelu 2026-11-07), most WebView ↔ nativní kód (stav, nákup, obnovení), potvrzení nákupu (acknowledge), stav uložený v zařízení pro offline.
- Kritéria: [ ] produkt předplatného v Play Console · [ ] nákup, zrušení a obnovení na testovací stopě s testery licencí · [ ] stav Pro platí offline do konce zaplaceného období, po vypršení se zamkne · [ ] most vystavený jen stránce z `appassets.androidplatform.net` · [ ] texty ve 12 jazycích (`i18n.js`) · [ ] zásady soukromí a Data safety aktualizované
- Poznámky: předplatné se dá testovat až s aplikací nahranou na testovací stopu v Play (první vydání). Ověření nákupu jen v zařízení (bez backendu, D-002). Kód je veřejný, proto žádná tajemství v aplikaci.

### CORE-007 Oprávnění Pro a zamykání funkcí
- Oblast: sdílený kód, platformní vrstva · SHARED (přepínač ve sdíleném kódu, chování se liší podle platformy) · P2 · BACKLOG
- Popis: `PLATFORM.pro` (součást CORE-001) určuje dostupnost Pro funkcí. Web: rozšířené vyhledávání zdarma jako dnes, ostatní Pro funkce se nezobrazují. Android: rozšířené vyhledávání, poloha, předvolby a vlastní body jen s Pro; bez Pro výzva k předplatnému.
- Kritéria: [ ] jeden zdroj pravdy (`PLATFORM.pro`), žádné kontroly roztroušené v kódu · [ ] web beze změny chování · [ ] APK bez Pro: rozšířené vyhledávání zamčené až od verze vydané v Play · [ ] ověřeno na webu i v APK (s Pro i bez)

### MAP-001 Moje poloha a nejbližší zastávky
- Oblast: mapa · ANDROID (rozhodl uživatel 2026-11-07; Pro funkce jen v aplikaci, D-026, D-028) · P2 · REVIEW
- Popis: tlačítko „Moje poloha“ na mapě (vpravo dole), jednorázové zjištění polohy (`navigator.geolocation` ve WebView, oprávnění řeší `MainActivity`), kontrola oblasti (výřez offline mapy), 5 nejbližších zastávek podle vzdušné vzdálenosti (jedna za skupinu stejného názvu), modrý bod s kruhem přesnosti, zvýrazněná nejbližší zastávka, panel se seznamem, popisky s linkami a detailem zastávky. Zatím bez zámku Pro (zámek s CORE-007 / AND-005).
- Kritéria:
  - [x] sdílená logika `Places.locate`, `Places.inArea`, `Places.nearest`, `Places.AREA` + `tests/geo.test.js` (centrum, okraj, mimo, Praha, neplatné souřadnice, nízká přesnost, řazení, prázdná data, reálný feed offline); všech 493 zastávek uvnitř oblasti
  - [x] emulátor API 36: dotaz na oprávnění až po klepnutí; zamítnutí; trvalé zakázání → „Otevřít nastavení“; vypnuté polohové služby → „Zapnout polohu“; poloha v Praze → „Lokalizace je dostupná pouze v oblasti Tirany“; úspěch na náměstí Skanderbeg (5 zastávek, přesnost ±5 m); „Zobrazit na mapě“, popisek, „Detail zastávky“; opakované spuštění; čerstvá instalace s „Při používání aplikace“; tmavý režim a albánština
  - [x] web beze změny (bez tlačítka a panelu, bez chyb v konzoli), testy Node 24/24 (1 `todo` BUG-002)
  - [ ] reálný telefon (uživatel) · [ ] Data safety v Play: poloha se zpracovává jen v zařízení (neodesílá se)
- Poznámky: D-028. Vzdálenost je vzdušná a je tak označená. Opravena chyba nalezená testem: při vypnuté poloze WebView vracel starou uloženou polohu, teď se oprávnění WebView při vypnutých službách nepovolí.

### UX-001 Předvolby Domů / Práce / Škola
- Oblast: plánovač, UI · ANDROID (Pro funkce jen v aplikaci, D-026) · P2 · BACKLOG
- Popis: tři pojmenované předvolby (zastávka nebo místo), uložené v zařízení, jedním klepnutím do Odkud nebo Kam.
- Kritéria: [ ] nastavení, změna a smazání předvolby · [ ] vložení do Odkud i Kam · [ ] texty ve 12 jazycích · [ ] světlý i tmavý režim, šířka telefonu

### POI-001 Vlastní body na mapě
- Oblast: mapa, místa · ANDROID (Pro funkce jen v aplikaci, D-026) · P2 · BACKLOG
- Popis: přidat bod (dlouhý stisk na mapě), pojmenovat, zobrazit na mapě, použít v Odkud a Kam (docházka přes `Places` jako u míst z OSM), upravit a smazat. Uložené jen v zařízení.
- Kritéria: [ ] přidání, přejmenování, smazání · [ ] vyhledání v Odkud/Kam a plánování s docházkou · [ ] zobrazení na mapě ve světlém i tmavém režimu · [ ] data přežijí aktualizaci aplikace

### AND-007 Promo kódy pro přispěvatele Ko-fi
- ANDROID · P3 · BACKLOG
- Popis: přispěvatelé Ko-fi dostanou Pro zdarma přes promo kódy z Play Console.
- Kritéria: [ ] ověřit, že Play promo kódy fungují pro roční předplatné a jaké mají limity · [ ] postup vydání kódů a evidence (bez osobních údajů v gitu)

### MKT-001 Reklamy pro neplatící uživatele aplikace
- ANDROID · P3 · BACKLOG (až po Pro funkcích, rozhodnutí 2026-11-07)
- Popis: reklamy v aplikaci pro uživatele bez Pro; Pro je bez reklam. Způsob (např. AdMob) a souhlas (SEO-003) určit při zahájení. Reklamy na webu zatím nerozhodnuty.

### UX-002 Našeptávač schovaný pod klávesnicí
- Oblast: plánovač, UI (Chat 02) · SHARED (nalezeno v APK na emulátoru API 36, 1080 × 1920; web na telefonu neověřen) · P2 · READY
- Popis: při psaní do pole Kam (a Odkud) se seznam návrhů zobrazí pod klávesnicí a stránka se k němu neposune, uživatel návrhy nevidí. Pole Odkud je výš a návrhy jsou na hraně klávesnice.
- Kritéria: [ ] návrhy jsou při otevřené klávesnici vidět (scroll do výhledu, nebo seznam nad polem) · [ ] ověřeno na webu v prohlížeči (šířka telefonu) i v APK s klávesnicí · [ ] světlý i tmavý režim
- Poznámky: v APK se po AND-001 odsazuje okno o `ime`, takže pole je nad klávesnicí, ale seznam je pod ním. Chování ověřit nejdřív ve webu (stejný kód).

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
- APK: ověřeno na emulátoru API 36 a Samsung Galaxy S21 (7. 11. 2026, výsledek od uživatele bez podrobností o verzi Androidu); build na Linuxu hlídá `android.yml`.
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
| CORE-003 | Android jako Gradle projekt (AGP 9.0.0, wrapper, `apk`/`aab`, bez `build.sh`; assets a certifikát shodné s dřívějším APK, telefon Samsung S21) | 2026-11-07 | PR #7 |
| CORE-006 | Android Gradle build v CI na Linuxu (`android.yml`: debug APK + AAB, kontrola obsahu APK, release bez hesla selže; běh na PR 68 s, na `main` s cache 52 s, Gradle krok 32 s, cache 322 MB) | 2026-11-07 | PR #11 |
| AND-002 | Heslo keystore mimo skript (`keystore.properties` / `TB_KS_PASS`), záloha keystore mimo počítač (uživatel, 2026-11-07), rozhodnutí o Play App Signing (D-022); heslo keystore změněno 2026-11-07 přes `keytool -storepasswd` (klíč i certifikát SHA-256 `0354…0d92` beze změny, ověřeno podpisem APK), staré heslo z historie gitu je tím k ničemu | 2026-11-07 | PR #6 |
| AND-004 | `DiskCache` (limit 100 MB, platnost 30 dní, SHA-256) a robustní kopie mbtiles | 2026-11-07 | PR #9 |
| – | Práce do 6. 11. 2026 | – | viz `releases/history-2026-11.md` |
