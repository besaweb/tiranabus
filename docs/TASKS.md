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
| UX-001 | Předvolby Domů / Práce / Škola pro Odkud a Kam (Pro později) | ANDROID | P2 | REVIEW | MAP-001 | 2026-11-07 |
| UX-002 | Našeptávač u pole Kam je na telefonu schovaný pod klávesnicí | SHARED | P2 | REVIEW | – | 2026-11-07 |
| UX-003 | Ikony předvoleb (20 ikon Lucide, výběr, zobrazení na mapě) | ANDROID | P2 | REVIEW | UX-001 | 2026-11-07 |
| UX-004 | Ikony předvoleb přímo v polích Odkud / Kam | ANDROID | P2 | REVIEW | UX-003 | 2026-11-07 |
| UX-005 | Tlačítko X pro vymazání polí Odkud / Kam | SHARED | P2 | REVIEW | UX-004 | 2026-11-07 |
| UX-006 | Redesign karet Moje předvolby a Moje místa | ANDROID | P2 | REVIEW | POI-001 | 2026-11-08 |
| UX-015 | Oblíbené trasy (menu ☰, hvězdička u výsledku) | ANDROID ONLY | P2 | REVIEW | UX-006 | 2026-11-09 |
| UX-013 | Poloha uživatele na mapě jako malý smajlík | ANDROID ONLY | P3 | REVIEW | – | 2026-11-08 |
| UX-017 | Tlačítko Zpět v kartách a skrytí plánovače | ANDROID ONLY | P3 | REVIEW | UX-014, UX-015, UX-016 | 2026-11-09 |
| UX-016 | Přidání místa: Moje aktuální poloha / Vybrat na mapě | ANDROID ONLY | P3 | REVIEW | UX-014 | 2026-11-09 |
| UX-014 | Tlačítka v úpravě oblíbené zastávky | SHARED | P3 | REVIEW | – | 2026-11-09 |
| UX-012 | Ikona upozornění u hlášky „Lokalizace je dostupná pouze v oblasti Tirany“ | ANDROID ONLY | P3 | REVIEW | – | 2026-11-08 |
| UX-011 | Nabídka po podržení prstu na mapě jako menu s ikonami | ANDROID ONLY | P3 | REVIEW | POI-001 | 2026-11-08 |
| UX-010 | Zkrácená atribuce pod mapou (jedna řádka) | SHARED | P3 | REVIEW | – | 2026-11-08 |
| UX-009 | Rozbalovací nápověda u Rozšířeného vyhledávání | SHARED | P3 | REVIEW | UX-008 | 2026-11-08 |
| UX-008 | Přepínač světlého / tmavého režimu a pořadí položek v menu aplikace | ANDROID | P3 | REVIEW | UX-007 | 2026-11-08 |
| UX-007 | Ikony v hlavním menu aplikace | ANDROID | P3 | REVIEW | UX-006 | 2026-11-08 |
| POI-001 | Vlastní místa na mapě, použitelná v Odkud a Kam (Pro později) | ANDROID | P2 | REVIEW | – | 2026-11-07 |
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
  - [~] reálný telefon (APK 1.9-geo, uživatel 2026-11-07): dotaz na oprávnění a odmítnutí, poloha mimo Tiranu → hláška o oblasti; zbývá trvalé zakázání a nastavení, vypnutá poloha, bez internetu, úspěch v Tiraně · [ ] Data safety v Play: poloha se zpracovává jen v zařízení (neodesílá se)
- Poznámky: D-028. Vzdálenost je vzdušná a je tak označená. Opravena chyba nalezená testem: při vypnuté poloze WebView vracel starou uloženou polohu, teď se oprávnění WebView při vypnutých službách nepovolí.

### UX-001 Předvolby Domů / Práce / Škola
- Oblast: plánovač, UI · ANDROID (Pro funkce jen v aplikaci, D-026, D-029) · P2 · REVIEW
- Popis: tři přejmenovatelné předvolby (`home`, `work`, `school`), cíl zastávka, místo nebo ulice, aktuální poloha nebo bod na mapě. Nabízejí se v našeptávači Odkud/Kam (v prázdném poli všechny, při psaní podle názvu). Nastavení v menu ☰ → Moje předvolby. Dlouhý stisk na mapě nabízí Odsud / Sem. Uloženo jen v zařízení (`localStorage` `tirana-presets`). Zatím bez zámku Pro.
- Kritéria:
  - [x] sdílená logika `Places.presets` (ověření a oříznutí uložených dat) a `Places.presetHit` + `tests/presets.test.js`
  - [x] emulátor API 36 (cs, tmavý režim): menu → karta, přejmenování Práce → Fitko, Domů = zastávka Kombinat (vyhledání), Fitko = aktuální poloha, Škola = bod na mapě; po restartu aplikace uloženo; našeptávač v prázdném poli ukáže všechny tři, „do“ → Domů před zastávkami; Fitko → Domů naplánováno (5 spojení s chůzí); dlouhý stisk → Sem → Fitko → Bod na mapě
  - [x] web beze změny (žádné předvolby, karta ani položka menu), Node testy 27/27 (1 `todo` BUG-002)
  - [x] oprava po testu na telefonu (uživatel 2026-11-07: „Vybrat na mapě“ uložilo bod hned po klepnutí, bez značky a bez názvu): v režimu výběru klepnutí nebo podržení prstu na mapě či zastávce ukáže značku a popup s polem pro název a tlačítky Uložit / Zrušit, další klepnutí značku přesune; nápověda je v mapě (pod mapou na telefonu nebyla vidět). Ověřeno na emulátoru API 36 (světlý i tmavý režim, klávesnice, přesun, Zrušit, Odsud/Sem beze změny), web beze změny
  - [ ] reálný telefon (uživatel)
- Poznámky: D-029. Při psaní do Odkud / Kam (2026-11-08, zadání uživatele) se předvolby v našeptávači vůbec nezobrazují (rozhodl uživatel: „úplně skrýt“), ani po klepnutí do prázdného pole (našeptávač se v prázdném poli neotevře); předvolby jsou jen jako ikony v polích Odkud / Kam a v kartě Moje předvolby. Značky předvoleb na mapě se po načtení nezobrazují; objeví se, až je uživatel vybere nebo napíše do Odkud / Kam (zmizí po smazání pole nebo změně výběru). Napsaný přesný název předvolby se při hledání stále rozpozná. Zastávka se po novém feedu dohledá podle názvu, jinak podle souřadnic. Obsahuje i opravu UX-002 pro šířku ≤ 760 px (viz UX-002).

### UX-017 Tlačítko Zpět v kartách a skrytí plánovače
- Oblast: UI · ANDROID ONLY (karty jsou jen v aplikaci) · P3 · REVIEW · větev obsahuje UX-014, UX-015 a UX-016 (sloučené, vzájemně se dotýkají `app.js` a CSS)
- Popis: v kartách Oblíbené zastávky, Oblíbené trasy a Moje místa je na konci tlačítko Zpět (centrované, sekundární, klíč `back` ve 12 jazycích). Je-li některá karta otevřená a nesbalená, je skrytá karta plánovače (`.searchcard`) i panel výsledků (`#sheet`) přes třídu `body.seclist` (nastavuje `plHead`). Plánovač se vrátí po Zpět, po × a po sbalení karty. Plánování zevnitř karty (otevření oblíbené trasy, Odsud/Sem z mapy, klepnutí na zastávku) karty zavře (`plCloseAll`), aby bylo výsledky vidět.
- Kritéria:
  - [x] web (režim aplikace): všechny tři karty skryjí plánovač, Zpět i × ho vrátí, otevření trasy zavře kartu a ukáže spojení
  - [x] APK v emulátoru: Zpět v kartě, plánovač skrytý
  - [ ] tmavý režim a telefon (uživatel)

### UX-016 Přidání místa tlačítky Moje aktuální poloha / Vybrat na mapě
- Oblast: UI, Moje místa · ANDROID ONLY (karta Moje místa je jen v aplikaci) · P3 · REVIEW · závisí na UX-014 (třída `.pact`)
- Popis: v kartě Moje místa nahradilo tlačítko „Přidat nové místo“ (klíč `plAdd` zrušen) dvojici tlačítek vedle sebe jako v Oblíbených zastávkách (`.pact`, ikony `locate` / `map`, červená / modrá). „Vybrat na mapě“ = dosavadní postup (klepnutí na mapu → formulář názvu). „Moje aktuální poloha“ zjistí polohu (`geoOnce`), vycentruje mapu a otevře stejný formulář názvu a popisu v bodě polohy; chyby (mimo Tiranu, bez oprávnění, nepřesné) se ukazují pod tlačítky.
- Kritéria:
  - [x] web (režim aplikace, 390 px, falešná poloha): dvě stejná tlačítka, popup se uloží do seznamu, mimo oblast hlásí chybu
  - [x] APK v emulátoru (`adb emu geo fix`): tlačítka, po „Moje aktuální poloha“ formulář v bodě polohy
  - [ ] tmavý režim a telefon (uživatel)

### UX-014 Tlačítka v úpravě oblíbené zastávky
- Oblast: UI, Moje předvolby · SHARED · P3 · REVIEW
- Popis: v úpravě předvolby jsou „Moje aktuální poloha“ a „Vybrat na mapě“ vedle sebe ve stejné šířce (mřížka 2 sloupce, `.pact`), pod nimi mřížka výběru ikon (přesunuta sem z horní části úpravy) a vycentrované sekundární tlačítko „Zrušit“ (průhledné, tlumená barva, `.btn.sec`). Hlavní tlačítka mají ikonu nad textem (`locate`, `map` v `UI_IC`) a barevné zvýraznění: poloha červeně (`--accent`), mapa modře (#1A73E8). Akce a texty beze změny; `.grow` ostatních karet nedotčen.
- Kritéria:
  - [x] web, šířka 320 px: dvě buňky po 128 px, Zrušit uprostřed
  - [x] APK v emulátoru (1080 px): dvě stejná tlačítka, Zrušit uprostřed
  - [ ] tmavý režim a telefon (uživatel)
### UX-015 Oblíbené trasy
- Oblast: UI, plánovač, úložiště · ANDROID ONLY (menu ☰ existuje jen v aplikaci, `android/menu.js`; hvězdička se ukazuje jen při `window.APP_VERSION`) · P2 · REVIEW
- Popis: položka menu ☰ „Oblíbené trasy“ (ikona route, událost `tb-routes`) otevře kartu `#rtcard` (stejný mechanismus `SEC` jako Oblíbené zastávky a Moje místa, sbalitelná). U výsledku vyhledávání je v `.jhead` hvězdička jako přepínač (od 2026-11-09, zadání uživatele): klepnutí trasu hned uloží (název „Odkud → Kam“, přejmenovat lze v kartě) a ukáže oznámení (`.rttoast`, 2,6 s); hvězdička svítí žlutě vždy, když Odkud / Kam odpovídá uložené trase; klepnutí na žlutou trasu odstraní a ukáže oznámení. Uloží se jen odkud a kam (typ, název, souřadnice) a vlastní název, ne linky ani přestupy (rozhodl uživatel, D-036). Karta: název a Odkud → Kam; klepnutí na řádek trasu znovu vyhledá nad aktuálními daty (čas „teď“) a ukáže živý výsledek včetně přestupů; tužka = přejmenování (pole + Uložit / Zrušit), koš = smazání s potvrzením. Duplicita je vyloučená přepínačem. Prázdný stav s návodem.
- Data: `localStorage['tirana-routes']` = `{ v: 1, items: [{ id, n, f, t, x }] }`, čistá validace `Places.routes()` (`js/places.js`, nejvýš 50, duplicity podle `Places.routeKey` = odkud + kam). Nikdy se neukládá datum, čas ani linky a přestupy. Chybějící zastávka (název ani zastávka do 150 m) → „Zastávka … už není v aktuálních datech“ (trasa se nespustí). Bez sítě funguje (jen `localStorage` a feed v aplikaci).
- Kritéria:
  - [x] web (režim aplikace, 390 px): přidání, duplicita, seznam, přejmenování, otevření, smazání, zrušená zastávka, uložení po reloadu, bez sítě (server vypnutý, 0 požadavků)
  - [x] `tests/routes.test.js` (3 testy), `tests/i18n.test.js` (12 jazyků)
  - [x] APK v emulátoru: položka menu, hvězdička, přidání s názvem, karta se seznamem
  - [ ] tmavý režim a telefon (uživatel)
- Poznámky: D-036. Strojový překlad nových textů (sq, it, de, pl, fr, es, mk, el, ru, tr) bez kontroly rodilým mluvčím.

### UX-013 Poloha uživatele na mapě jako malý smajlík
- Oblast: poloha, mapa · ANDROID ONLY (`GEO`) · P3 · REVIEW
- Popis: nalezená poloha (`geoDraw`) je místo modrého bodu malý statický smajlík (Lucide `smile`, 22 px, žlutá výplň, modré linky, bílý obrys, `.gme`, bez kruhu pozadí a bez animace); kruh přesnosti a červená značka nejbližší zastávky beze změny.
- Kritéria:
  - [ ] emulátor (poloha v Tiranně): postavička viditelná nad zastávkami
  - [ ] telefon (uživatel)

### UX-012 Ikona upozornění u hlášky mimo oblast Tirany
- Oblast: poloha, UI · ANDROID ONLY (polohu nabízí jen aplikace, `GEO`) · P3 · REVIEW
- Popis: před textem `geoOutside` („Lokalizace je dostupná pouze v oblasti Tirany.“, 12 jazyků beze změny) je oranžová ikona upozornění (Lucide `triangle-alert`, `PRE_ICO`, styl `.gwarn`). Ostatní chybové hlášky polohy beze změny.
- Kritéria:
  - [x] prohlížeč v režimu aplikace, simulovaná poloha mimo Tirany: ikona před textem
  - [ ] emulátor / telefon (uživatel)

### UX-011 Nabídka po podržení prstu na mapě jako menu s ikonami
- Oblast: mapa, UI · ANDROID ONLY (nabídka existuje jen při `GEO`, tj. v aplikaci; stejně jako POI-001) · P3 · REVIEW
- Popis: popup „Bod na mapě“ má červenou ikonu špendlíku v záhlaví a pod ním řádky odděleného menu s modrými ikonami: Odsud (špendlík), Sem (vlajka), Uložit místo (hvězda). Ikony z Lucide (`PRE_ICO`, přidána `flag`), styly `.gmenu` v `style.css`, bez změny logiky.
- Kritéria:
  - [x] prohlížeč v režimu aplikace, 375 px: nabídka se zobrazí, Sem vyplní pole Kam
  - [ ] emulátor / telefon (uživatel), světlý i tmavý režim

### UX-010 Zkrácená atribuce pod mapou
- Oblast: mapa, UI · SHARED (web i aplikace) · P3 · REVIEW
- Popis: povinná atribuce pod mapou je jedna krátká řádka „© OpenMapTiles, OpenStreetMap · Municipality of Tirana, LU-NA“ (v aplikaci s offline mapou) a „© OpenStreetMap · Municipality of Tirana, LU-NA“ (rastrové podklady na webu), odkaz na https://www.openstreetmap.org/copyright zůstává na slově OpenStreetMap. Oddělovač částí je „ · “ (`L.Control.Attribution._update`), z názvu dopravce se odstraňují závorky („LU-NA (Luna Travel)“ → „LU-NA“), předpona „Timetables:“ zrušena (`attr` v `i18n.js`, 12 jazyků). Plné znění zdrojů zůstává v menu O aplikaci (`aboutCredits`), licence viz také `privacy.html` a README.
- Kritéria:
  - [x] web: jedna řádka na šířce 375 i 320 px, odkaz na OSM funguje; emulátor API 36 (offline vektorová mapa): jedna řádka, odkaz na OSM
  - [ ] reálný telefon (uživatel)
- Poznámky: D-035. Zkrácená forma „© OpenStreetMap“ bez „contributors“ je na malých mapách běžná; OSM doporučuje „© OpenStreetMap contributors“, rozhodl uživatel.

### UX-009 Rozbalovací nápověda u Rozšířeného vyhledávání
- Oblast: UI, texty · SHARED (menu aplikace i menu webu; rozdíl jen ve výčtu zdrojů) · P3 · REVIEW
- Popis: vedle přepínače Rozšířené vyhledávání je tlačítko „?“, které rozbalí text pod položkou (znovu klepnutím se sbalí; přepínač je nezávislý). Aplikace: „Při psaní do polí Odkud a Kam nabídne kromě zastávek, vašich předvoleb a Mých míst také ulice, náměstí, městské části a zajímavá místa (úřady, školy, nemocnice, památky, obchody, restaurace…). K vybranému místu pak plánovač najde nejbližší zastávky.“ (zadání uživatele); web má stejný text bez předvoleb a Mých míst (klíč `extHelpW`, předvolby a místa jsou jen v aplikaci). Texty `extHelp`, `extHelpW`, `extHelpLbl` ve 12 jazycích. V aplikaci otevření jazyků nebo jiné podnabídky nápovědu sbalí; menu aplikace je širší (330 px), aby se název nezalamoval.
- Kritéria:
  - [x] web (375 px a desktop): tlačítko, rozbalení a sbalení, přepínač nezávislý, text bez předvoleb
  - [x] emulátor API 36: tlačítko, rozbalení, sbalení při otevření Jazyka, přepínač, výška položek 46 px
  - [ ] reálný telefon (uživatel)

### UX-008 Přepínač světlého / tmavého režimu a pořadí položek v menu aplikace
- Oblast: UI · ANDROID (menu ☰ je jen v aplikaci; web má přepínač v hlavičce na desktopu a v menu na telefonu, beze změny) · P3 · REVIEW
- Popis: v menu aplikace je nová položka mezi Jízdným a Platností dat (jako v menu webu na telefonu): měsíc + „Tmavý režim“, ve tmavém režimu slunce + „Světlý režim“ (texty z `I18N.D`, 12 jazyků). Klepnutí volá stávající `toggleTheme` (klik na skryté `#theme`), takže volba se ukládá do `tirana-mhd-theme` jako dřív. Tlačítko měsíce/slunce v hlavičce aplikace je skryté (`#theme { display: none }` v `android/menu.css`). Menu se po přepnutí zavře. Pořadí položek (zadání uživatele 2026-11-08): Moje předvolby, Moje místa, Rozšířené vyhledávání, Jazyk, Tmavý režim, Jízdné, Platnost dat, O aplikaci. Podnabídky Jazyka a O aplikaci zůstávají pod svými položkami.
- Kritéria:
  - [x] emulátor API 36 (ladicí APK): nové pořadí položek (emulátor), podnabídky jazyka i O aplikaci, přepínač rozšířeného vyhledávání, položka se jménem i ikonou podle režimu (cs i en), přepnutí tam i zpět, uložení volby, tlačítko v hlavičce zmizelo, mapa i karty se přebarví
  - [ ] reálný telefon (uživatel)

### UX-007 Ikony v hlavním menu aplikace
- Oblast: UI · ANDROID (menu ☰ existuje jen v aplikaci, `android/menu.js`; web má v hlavičce samostatná tlačítka s ikonami) · P3 · REVIEW
- Popis: každá položka menu má vlevo obrysovou ikonu 20 px (čára 1,8 jako ve zbytku aplikace, barva `--muted`, ve tmavém režimu světlá): Jazyk `languages`, Jízdné lístek z hlavičky webu, Platnost dat `calendar-check`, Moje předvolby `bookmark`, Moje místa `map-pin`, O aplikaci `info` z hlavičky webu, Rozšířené vyhledávání `search` (Lucide 0.460.0). Ikona je uvnitř tlačítka/odkazu položky. Hodnota jazyka a přepínač zůstávají vpravo (`margin-left: auto`). Pořadí, názvy, odkazy a chování beze změny.
- Kritéria:
  - [x] emulátor API 36 (ladicí APK): světlý i tmavý režim, výška všech položek 46 px, podnabídka jazyka, přepínač rozšířeného vyhledávání
  - [ ] reálný telefon (uživatel)

### UX-006 Redesign karet Moje předvolby a Moje místa
- Oblast: předvolby, vlastní místa, UI · ANDROID (D-026, D-033, D-034) · P2 · REVIEW
- Popis: dvě samostatné karty, každá z vlastní položky menu ☰ (Moje předvolby `#precard`, Moje místa `#places`), s hlavičkou (název, počet, šipka sbalit/rozbalit s pamětí `tirana-pre-col` / `tirana-pl-col`, zavřít). Moje místa mají podtitul „Uložená místa pro rychlé plánování cest“ a dole „+ Přidat nové místo“ (60 px, přerušovaný okraj). Řádek: předvolby jednobarevná ikona 24 px bez podkladu, vlastní místa červený bod 10 px (`--accent`, bez okraje, stejný jako bod na mapě; i v našeptávači), název a adresa/popis na jeden řádek se zkrácením, vpravo kruhová tlačítka 48 px Změnit cíl (tužka) a Smazat (koš, s potvrzením v řádku). Klepnutí na řádek: místo na mapě + popup Odsud / Sem (nenastavená předvolba otevře editor). Editor předvolby: přejmenování, výběr ikony, cíl (hledání, poloha, mapa); editor místa: název, adresa/popis, přesun. Tlačítka jsou sourozenci řádku, klepnutí se nepropaguje.
- Kritéria:
  - [x] první verze (jedna karta, D-033): prohlížeč v režimu aplikace 375 / 320 px a desktop, světlý i tmavý režim, emulátor
  - [x] rozdělení (D-034), prohlížeč v režimu aplikace 375 px, světlý i tmavý režim: dvě karty, nezávislé sbalení a zavření; ikony předvoleb bez podkladu; červené body u míst i v našeptávači; smazání s potvrzením, úprava názvu a adresy, editor předvolby, klepnutí na řádek → mapa + popup, Odsud → pole Odkud; dlouhé názvy se zkrátí, bez vodorovného posunu; zastávky zůstávají modré
  - [x] web beze změny; Node testy 32/32 (1 `todo` BUG-002)
  - [ ] reálný telefon (uživatel)
- Poznámky: D-033, D-034. Bez grafického návrhu, podle textového zadání uživatele. Karta a položka menu Moje předvolby se od 2026-11-08 jmenují „Oblíbené zastávky“ (klíč `preTitle`, 12 jazyků; zadání uživatele).

### POI-001 Vlastní místa na mapě
- Oblast: mapa, plánovač · ANDROID (Pro funkce jen v aplikaci, D-026, D-032) · P2 · REVIEW
- Popis: uživatel si ukládá vlastní místa (název povinný, popis nepovinný, souřadnice z mapy), nejvýš 100, jen v oblasti Tirany (`Places.AREA`). Přidání: dlouhý stisk na mapě → Uložit místo, nebo menu ☰ → Moje místa → Přidat místo → klepnutí do mapy. Na mapě malý červený bod (velikost jako zastávka, `sr()`), klepnutí → název, popis, Odsud / Sem / Upravit. V Odkud / Kam se nabízejí při psaní (název i popis) s označením „Moje místo“; plánuje se jako bod na mapě (`ptEnd` → `placeEnd`, docházka k zastávkám do 1,5 km přes `Places.access`), do zastávek se nic nepřidává. Karta Moje místa: seznam, úprava názvu a popisu, přesun, mazání s potvrzením. Uloženo jen v zařízení (`localStorage` `tirana-pois`, `{ v: 1, items: [{ id, n, d, lat, lon, ts }] }` – stálé `id` a čas změny pro případnou synchronizaci). Zatím bez zámku Pro.
- Kritéria:
  - [x] sdílená logika `Places.pois` (ověření, oblast, limit, duplicity) a `Places.poiHit` + `tests/pois.test.js`; Node testy 32/32 (1 `todo` BUG-002)
  - [x] prohlížeč v režimu aplikace (375 px): Přidat místo → klepnutí do mapy → formulář, prázdný název odmítnut, uložení; červený bod i po načtení stránky znovu; dlouhý stisk → Uložit místo; našeptávač „bab“ → Babička (Moje místo); přesun do centra a plánování Babička → Skënder Luarasi (3 spojení s chůzí na Spitali Ushtarak); přejmenování se promítne i do pole Odkud; mazání s potvrzením
  - [x] emulátor API 36: položka menu Moje místa, karta, červené body, popup Odsud / Sem / Upravit; web beze změny (žádné body, karta ani „Uložit místo“)
  - [ ] plánování na emulátoru (Avast zachytává HTTPS na `pt.tirana.al`) · [ ] reálný telefon (uživatel) · [ ] Data safety v Play (vlastní místa jen v zařízení)
- Poznámky: D-032. Bod dál než 1,5 km od zastávky nemá docházku, plánovač pak spojení nenajde (stejně jako u bodu na mapě). Mapa se nedá oddálit mimo oblast, kontrola oblasti je i tak v kódu.

### AND-007 Promo kódy pro přispěvatele Ko-fi
- ANDROID · P3 · BACKLOG
- Popis: přispěvatelé Ko-fi dostanou Pro zdarma přes promo kódy z Play Console.
- Kritéria: [ ] ověřit, že Play promo kódy fungují pro roční předplatné a jaké mají limity · [ ] postup vydání kódů a evidence (bez osobních údajů v gitu)

### MKT-001 Reklamy pro neplatící uživatele aplikace
- ANDROID · P3 · BACKLOG (až po Pro funkcích, rozhodnutí 2026-11-07)
- Popis: reklamy v aplikaci pro uživatele bez Pro; Pro je bez reklam. Způsob (např. AdMob) a souhlas (SEO-003) určit při zahájení. Reklamy na webu zatím nerozhodnuty.

### UX-002 Našeptávač schovaný pod klávesnicí
- Oblast: plánovač, UI (Chat 02) · SHARED (nalezeno v APK na emulátoru API 36, 1080 × 1920; web na telefonu neověřen) · P2 · REVIEW
- Popis: při psaní do pole Kam (a Odkud) se seznam návrhů zobrazí pod klávesnicí a stránka se k němu neposune, uživatel návrhy nevidí. Pole Odkud je výš a návrhy jsou na hraně klávesnice.
- Kritéria: [ ] návrhy jsou při otevřené klávesnici vidět (scroll do výhledu, nebo seznam nad polem) · [ ] ověřeno na webu v prohlížeči (šířka telefonu) i v APK s klávesnicí · [ ] světlý i tmavý režim
- Poznámky: v APK se po AND-001 odsazuje okno o `ime`, takže pole je nad klávesnicí, ale seznam je pod ním. Oprava udělána v rámci UX-001 (Chat 03, větev `feat/UX-001-predvolby`), protože bez ní byly předvolby na telefonu nepoužitelné: do 760 px se při otevřeném seznamu přidá dolní odsazení `.side` (`body.sgpad`) a pole se posune k hornímu okraji (`sgView`, i při změně velikosti okna kvůli klávesnici). Ověřeno: APK na emulátoru (Odkud i Kam), web v prohlížeči na šířce 375 px (seznam vidět), desktop beze změny. Chybí: web na reálném telefonu s klávesnicí (Chat 02).

### UX-003 Ikony předvoleb
- Oblast: předvolby, mapa · ANDROID (předvolby jsou jen v aplikaci, D-029, D-030) · P2 · REVIEW
- Popis: každá ze 3 předvoleb má ikonu z pevné sady 20 ikon Lucide (house, briefcase-business, graduation-cap, building-2, shopping-cart, shopping-bag, utensils, coffee, heart-pulse, dumbbell, landmark, plane, train-front, bus-front, car-front, map-pin, users, church, tree-pine, star). Klepnutí na ikonu v kartě Moje předvolby otevře mřížku 4 × 5 bez popisků (popisy jen pro čtečky), vybraná ikona je zvýrazněná. Bez ruční volby se ikona odhaduje z názvu (klíčová slova cs/en/sq), jinak podle slotu. Nastavené předvolby se ukazují na mapě jako značky s ikonou, klepnutí nabídne Odsud / Sem. Klepnutí na předvolbu v našeptávači beze změny. Vlastní obrázky ne.
- Kritéria:
  - [x] sdílená logika `Places.ICONS`, `Places.presetIcon`, ukládání `i` v `Places.presets` + testy (`tests/presets.test.js`), Node testy 28/28 (1 `todo` BUG-002)
  - [x] emulátor API 36: odhad Fitko → dumbbell, výběr kávy uložen a promítnut do karty, našeptávače i značky na mapě; mřížka ve světlém i tmavém režimu; klepnutí na značku → popup Odsud / Sem
  - [x] web beze změny (žádné značky ani karta, bez chyb v konzoli)
  - [ ] naplánování trasy z popupu značky (na emulátoru nešlo ověřit: Avast zachytává HTTPS na `pt.tirana.al`, emulátor jeho certifikátu nevěří) · [ ] reálný telefon (uživatel)
- Poznámky: D-030. Ikony vložené jako SVG v `app.js` (bez knihovny), licence ISC uvedena u nich. Opraveno: ve vlastních stylech Leafletu chybělo `pointer-events` pro klikací značky (`.leaflet-marker-icon.leaflet-interactive`).

### UX-004 Ikony předvoleb v polích Odkud / Kam
- Oblast: plánovač, UI · ANDROID (předvolby jsou jen v aplikaci, D-029, D-031) · P2 · REVIEW
- Popis: nastavené předvolby (max. 3) se zobrazují jako ikony vpravo uvnitř polí Odkud a Kam (`#from-pre`, `#to-pre`), text pole se zkrátí o jejich šířku (`.field.haspre`, `--pn`). Při aktivaci pole (`:focus`) se ikony u něj skryjí a pole má celou šířku, po opuštění se vrátí; každé pole zvlášť. Klepnutí na ikonu vyplní pole stejně jako výběr v našeptávači (`chooseEnd` + `preEnd`), ale nepřesune kurzor do druhého pole. Bez předvoleb beze změny.
- Kritéria:
  - [x] prohlížeč v režimu aplikace (`APP_VERSION` vložené lokálním serverem, 375 px i desktop, světlý i tmavý režim): 0 / 1 / 2 / 3 předvolby (odsazení 14 / 44 / 78 / 112 px), dlouhý text se zkrátí, klepnutí do Odkud skryje jen jeho ikony a otevře našeptávač, po opuštění se vrátí; ikona Kam vyplní „Fitko“ bez fokusu, ikona Odkud pak spustí vyhledání (5 spojení Domů → Fitko, značky předvoleb na mapě)
  - [x] web beze změny i s uloženými předvolbami, bez chyb v konzoli; Node testy 28/28 (1 `todo` BUG-002)
  - [ ] emulátor (nenačte data, Avast zachytává HTTPS na `pt.tirana.al`) · [ ] reálný telefon (uživatel)
- Poznámky: D-031.

### UX-005 Vymazání polí Odkud / Kam
- Oblast: plánovač, UI · SHARED (není vázané na předvolby, funguje i na webu) · P2 · REVIEW
- Popis: pole Odkud / Kam s textem má vpravo tlačítko X (Lucide `x`, 36 × 36 px). Klepnutí pole vymaže, nechá v něm kurzor (klávesnice zůstane otevřená, `mousedown` nepřesune fokus) a vyvolá stejnou událost `input` jako ruční mazání (zruší vybraný cíl a výsledky, otevře našeptávač); vyhledávání nespustí, druhé pole ani předvolby nemění. Viditelnost čistě v CSS přes `:placeholder-shown`: text → X místo ikon předvoleb, prázdné a neaktivní → ikony předvoleb (UX-004), prázdné a aktivní → nic.
- Kritéria:
  - [x] prohlížeč v režimu aplikace (375 px): po výběru ikonou předvolby X místo ikon; X v neaktivním poli → prázdné, aktivní, našeptávač s předvolbami, druhé pole a předvolby beze změny, bez vyhledání; psaní → X; X v aktivním poli → fokus zůstává; výběr z našeptávače → X
  - [x] web (375 px i desktop, světlý i tmavý režim): ruční zadání a výběr Enterem → X, bez ikon předvoleb; Node testy 28/28 (1 `todo` BUG-002)
  - [ ] emulátor (nenačte data, Avast zachytává HTTPS na `pt.tirana.al`) · [ ] reálný telefon s klávesnicí – web i aplikace (uživatel)
- Poznámky: text `clearField` ve 12 jazycích.

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
