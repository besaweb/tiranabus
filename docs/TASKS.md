# Tasks – Tirana Bus

Aktualizováno: 2026-11-10

**Pravidla:** ID `PREFIX-NNN` se nikdy nepoužije znovu (prefixy CORE, WEB, AND, GTFS, POI, MAP, DATA, I18N, UX, SEO, MKT, BUG, TEST, DOC). Priority P0 kritická – P3 nízká. Stavy BACKLOG → READY → IN_PROGRESS → REVIEW → DONE; BLOCKED vždy s důvodem. Platforma SHARED / WEB / ANDROID (WEB/ANDROID se zdůvodněním). SHARED je DONE až s ☑ u obou platforem. DONE = splněná kritéria + testy + dokumentace; pak přesun do Archivu. Před založením hledat podobný úkol.

## Přehled

| ID | Název | Pl. | P | Stav | Závisí na | Akt. |
|---|---|---|---|---|---|---|
| GTFS-001 | Feed 2027 (současný končí 31. 12. 2026) | SHARED | P0 | BLOCKED | DATA-001 | 2026-11-07 |
| CORE-001 | Objekt `PLATFORM` místo `OFFLINE_MAP`/`APP_VERSION` | SHARED | P1 | BACKLOG | TEST-001 | 2026-11-07 |
| CORE-002 | Explicitní vkládací body pro Android místo přepisování `index.html` v Gradle | ANDROID | P1 | BACKLOG | – | 2026-11-07 |
| I18N-001 | Texty Android menu/platnosti/úvodu do `i18n.js` | SHARED | P2 | BACKLOG | TEST-002 | 2026-11-07 |
| SEO-001 | Google Search Console + Bing, odeslat sitemap | WEB | P1 | READY | – | 2026-11-07 |
| SEO-003 | Consent Mode v2 pro EU | SHARED | P1 | BACKLOG | – | 2026-11-07 |
| CORE-004 | Jeden seznam souborů pro Pages / FTP / Android | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| CORE-005 | Sjednocená konfigurace jízdného, kurzů, verze a platnosti | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| AND-008 | První vydání v Google Play (podklady, testovací stopa) | ANDROID | P0 | IN_PROGRESS | ověření účtu Play | 2026-11-07 |
| AND-005 | Pro: roční předplatné 4,99 € přes Google Play Billing | ANDROID | P2 | BACKLOG | CORE-007, první vydání v Play | 2026-11-07 |
| CORE-007 | Oprávnění Pro (`PLATFORM.pro`) a zamykání funkcí | SHARED | P2 | BACKLOG | CORE-001 | 2026-11-07 |
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
| WEB-003 | Kontaktní formulář (`contact.html` + `contact.php`, zatím mimo menu) | WEB | P2 | IN_PROGRESS | PHP na hostingu | 2026-11-10 |

## Detail

### WEB-003 Kontaktní formulář
- Oblast: web / kontakt · WEB (odeslání přes PHP na FTP hostingu tiranabus.al, v APK ani na GitHub Pages neexistuje; D-037) · P2 · IN_PROGRESS
- Popis: stránka `contact.html` (jméno, e-mail odesílatele, předmět, text, až 3 přílohy – fotky JPG/PNG/WebP/GIF do 4 MB) a `contact.php`, který zprávu odešle na tiranabus@besaweb.al. Ochrana: honeypot, limit 5 zpráv/hod z jedné IP, kontrola typu a velikosti příloh na serveru. Do menu a sitemap zatím nepřidáno, stránka je `noindex`.
- Kritéria:
  - [x] formulář ve 12 jazycích, světlý i tmavý režim, telefon
  - [ ] `contact.php` ověřen na produkčním hostingu (PHP, `mail()`, limity `upload_max_filesize` / `post_max_size`)
  - [ ] skutečné odeslání s přílohou doručeno na tiranabus@besaweb.al
- Poznámky: lokálně není PHP, serverová část je ověřena až po nasazení (`deploy-ftp.sh` nahrává `contact.html` a `contact.php`; `pages.yml` ne).

### AND-008 První vydání v Google Play
- Oblast: Android / vydání · ANDROID (Google Play) · P0 · IN_PROGRESS
- Popis: podklady pro Play Console a první nahrání AAB na testovací stopu. Podklady v `docs/play/`.
- Kritéria:
  - [x] ikona 512 × 512, hlavní obrázek 1024 × 500, 6 snímků 1080 × 1920 (emulátor API 36, 2026-11-07)
  - [x] texty listingu en, sq (strojově, ke kontrole), cs; odpovědi pro Data safety, IARC a ostatní formuláře; postup vydání
  - [x] typ účtu: osobní, veřejné jméno „BesaWeb“ (2026-11-07) · [x] uživatel založil účet a ověřil totožnost (2026-11-09) · [ ] uzavřený test 12 testerů / 14 dní · [x] záloha keystore provedena (uživatel, 2026-11-07)
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

### AND-007 Promo kódy pro přispěvatele Ko-fi
- ANDROID · P3 · BACKLOG
- Popis: přispěvatelé Ko-fi dostanou Pro zdarma přes promo kódy z Play Console.
- Kritéria: [ ] ověřit, že Play promo kódy fungují pro roční předplatné a jaké mají limity · [ ] postup vydání kódů a evidence (bez osobních údajů v gitu)

### MKT-001 Reklamy pro neplatící uživatele aplikace
- ANDROID · P3 · BACKLOG (až po Pro funkcích, rozhodnutí 2026-11-07)
- Popis: reklamy v aplikaci pro uživatele bez Pro; Pro je bez reklam. Způsob (např. AdMob) a souhlas (SEO-003) určit při zahájení. Reklamy na webu zatím nerozhodnuty.

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
| DATA-001 | Ověřit běh `gtfs-watch` a `pages.yml` | 2026-11-09 | – |
| MAP-001 | Moje poloha a nejbližší zastávky (Pro později) | 2026-11-09 | – |
| POI-001 | Vlastní místa na mapě, použitelná v Odkud a Kam (Pro později) | 2026-11-09 | – |
| UX-001 | Předvolby Domů / Práce / Škola pro Odkud a Kam (Pro později) | 2026-11-09 | – |
| UX-002 | Našeptávač u pole Kam je na telefonu schovaný pod klávesnicí | 2026-11-09 | – |
| UX-003 | Ikony předvoleb (20 ikon Lucide, výběr, zobrazení na mapě) | 2026-11-09 | – |
| UX-004 | Ikony předvoleb přímo v polích Odkud / Kam | 2026-11-09 | – |
| UX-005 | Tlačítko X pro vymazání polí Odkud / Kam | 2026-11-09 | – |
| UX-006 | Redesign karet Moje předvolby a Moje místa | 2026-11-09 | – |
| UX-007 | Ikony v hlavním menu aplikace | 2026-11-09 | – |
| UX-008 | Přepínač světlého / tmavého režimu a pořadí položek v menu aplikace | 2026-11-09 | – |
| UX-009 | Rozbalovací nápověda u Rozšířeného vyhledávání | 2026-11-09 | – |
| UX-010 | Zkrácená atribuce pod mapou (jedna řádka) | 2026-11-09 | PR #18 |
| UX-011 | Nabídka po podržení prstu na mapě jako menu s ikonami | 2026-11-09 | PR #18 |
| UX-012 | Ikona upozornění u hlášky „Lokalizace je dostupná pouze v oblasti Tirany“ | 2026-11-09 | PR #18 |
| UX-013 | Poloha uživatele na mapě jako malý smajlík | 2026-11-09 | PR #18 |
| UX-014 | Tlačítka v úpravě oblíbené zastávky | 2026-11-09 | PR #19 |
| UX-015 | Oblíbené trasy (menu ☰, hvězdička u výsledku) | 2026-11-09 | PR #19 |
| UX-016 | Přidání místa: Moje aktuální poloha / Vybrat na mapě | 2026-11-09 | PR #19 |
| UX-017 | Tlačítko Zpět v kartách a skrytí plánovače | 2026-11-09 | PR #19 |
| UX-018 | Úvodní pohled mapy: střed Tirany, přiblížení 13 | 2026-11-09 | PR #19 |
| BUG-001 | Cena RT na palubě sjednocena na 300 L / 3,50 € (data z luna.al, ověřeno 29. 10. 2026; `tkPriceB` ve 12 jazycích a `tickets.html`) | 2026-11-09 | – |
| BUG-002 | Plánovač vracel spojení s chůzí začínající před zadaným časem (příčina: `tidy` nehlídal čas začátku první chůze; oprava parametrem `tOrg`; test bez `todo`, snapshot přegenerován, nejlepší příjezd ve 160 dotazech nikdy horší) | 2026-11-09 | – |
| WEB-001 | `deploy-ftp.sh` odmítne běh mimo `main`, s necommitovanými změnami sledovaných souborů a při rozdílu proti `origin/main` (guardy ověřeny odděleně, skript samotný se nespouštěl) | 2026-11-09 | – |
