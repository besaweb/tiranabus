# Tasks – Tirana Bus

Aktualizováno: 2026-11-12

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
| AND-005 | Pro: nákup tří plánů přes Google Play Billing (nativní most `TBPro`) | ANDROID | P2 | BACKLOG | CORE-007, první vydání v Play | 2026-11-12 |
| CORE-007 | Oprávnění Pro (`js/pro.js`), obrazovka Tirana BUS PRO, tři plány, zámky funkcí | SHARED | P2 | REVIEW | – | 2026-11-12 |
| AND-007 | Promo kódy z Play Console pro přispěvatele Ko-fi | ANDROID | P3 | BACKLOG | AND-005 | 2026-11-07 |
| MKT-001 | Reklamy pro neplatící uživatele aplikace (AdMob, nativní most `TBAds`) | ANDROID | P3 | REVIEW | účet AdMob | 2026-11-12 |
| AND-009 | Dočasný testovací přepínač PRO v menu (`PRO_TEST=1`) | ANDROID | P3 | REVIEW | CORE-007, MKT-001 | 2026-11-12 |
| AND-010 | `ADS_TEST=1`: podepsaný release s testovacími ID Google (build pro testery) | ANDROID | P3 | REVIEW | MKT-001 | 2026-11-12 |
| AND-006 | Barvy systémových lišt podle motivu stránky (přepínač v aplikaci vs. systém) | ANDROID | P3 | BACKLOG | – | 2026-11-07 |
| I18N-002 | Korektury překladů rodilými mluvčími (sq, en prioritně) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-002 | Varianty tras linek (větve) | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-003 | Libovolné datum v plánovači | SHARED | P2 | BACKLOG | – | 2026-11-07 |
| GTFS-004 | `fare_*` a odkazy na PDF řády (`timetable_pages.txt`) | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-002 | Skript pro přegenerování `data/gtfs-extra.zip` | SHARED | P3 | BACKLOG | – | 2026-11-07 |
| DATA-003 | Kontrola stránky Luna v hlídání feedu | SHARED | P3 | BACKLOG | DATA-001 | 2026-11-07 |
| WEB-002 | Odznak Google Play jako odkaz na aplikaci | WEB | P3 | BLOCKED | publikace v Play | 2026-11-07 |
| SEO-002 | Stránky zastávek (493 × 12), schema.org pro linky | WEB | P3 | BACKLOG | – | 2026-11-07 |
| UX-019 | Jen jedna karta (Oblíbené zastávky / trasy / Moje místa) naráz | ANDROID ONLY | P3 | REVIEW | – | 2026-11-10 |
| BUG-003 | Klepnutí na existující vlastní bod nevyvolá nabídku; sjednocení vzhledu nabídek bodů | ANDROID ONLY | P2 | REVIEW | POI-001 | 2026-11-10 |
| UX-024 | Obrazovka PRO na celou obrazovku bez mapy | SHARED | P3 | REVIEW | CORE-007 | 2026-11-13 |
| UX-023 | Poloha uživatele na mapě hned po spuštění | ANDROID ONLY | P3 | REVIEW | MAP-001, UX-013 | 2026-11-12 |
| UX-025 | Posuvný panel mapa / vyhledávání (bottom sheet, 3 stavy) | ANDROID ONLY | P3 | REVIEW | – | 2026-11-13 |
| UX-026 | Testerský build: bez položky „Tirana BUS PRO“ v menu, přepínač PRO test ve výchozím stavu zapnutý | ANDROID ONLY | P3 | REVIEW | CORE-007 | 2026-11-13 |
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
- Popis: tři produkty podle D-038: `pro_tourist_7d` (jednorázový, 1,99 €, 7 dní; po vypršení spotřebovat `consume`, aby šel koupit znovu), `pro_annual` (předplatné, 4,99 € / rok), `pro_lifetime` (jednorázový, 19,99 €). Play Billing Library (nová nativní závislost v Gradle, schváleno volbou modelu 2026-11-07), nativní most `window.TBPro` podle smlouvy v `ARCHITECTURE.md` › Pro (stav, nákup), potvrzení nákupu (acknowledge), stav uložený v zařízení pro offline. Webová část (obrazovka, zámky, výpočet platnosti) je hotová v CORE-007; build pro Play se staví s `PRO_ENFORCE=1`.
- Kritéria: [ ] tři produkty v Play Console s cenami z D-038 · [ ] nákup, zrušení a obnovení na testovací stopě s testery licencí · [ ] stav Pro platí offline do konce zaplaceného období, po vypršení se zamkne · [ ] most vystavený jen stránce z `appassets.androidplatform.net` · [ ] po nákupu most zavolá `window.tbProUpdate()` · [ ] zásady soukromí a Data safety aktualizované
- Poznámky: předplatné se dá testovat až s aplikací nahranou na testovací stopu v Play (první vydání). Ověření nákupu jen v zařízení (bez backendu, D-002). Kód je veřejný, proto žádná tajemství v aplikaci.

### CORE-007 Oprávnění Pro a zamykání funkcí
- Oblast: sdílený kód, platformní vrstva · SHARED (logika ve sdíleném kódu, zámky a obrazovka jen v aplikaci; D-038) · P2 · REVIEW
- Popis: čistý modul `js/pro.js` (plány, ceny, výpočet stavu z nákupů, `can`, `ads`) je jediný zdroj pravdy; `app.js` se ptá jen přes `proOk()`. Obrazovka „Tirana BUS PRO“ (karta `#procard`, položka v menu ☰): stav plánu, srovnání FREE / PRO včetně reklam, tři plány (TOURIST PASS 1,99 € / 7 dní, ANNUAL PREMIUM 4,99 € / 365 dní s označením BEST VALUE, LIFETIME PREMIUM 19,99 €). Zamčené funkce (Oblíbené trasy, Oblíbené zastávky, Moje místa, Rozšířené vyhledávání) jdou bez Pro otevřít a prohlédnout, ovládací prvky jsou neaktivní, nahoře výzva s tlačítkem „Odemknout PRO“; uložená data se nemažou, jen se nepoužívají (našeptávač, značky na mapě, ikony v polích). Poloha z GPS zůstává zdarma. Zámky se vynucují jen s `window.PRO_ENFORCE` (Gradle `PRO_ENFORCE=1`), do té doby je vše odemčené. Bez nativního mostu `TBPro` tlačítka plánů hlásí, že nákup bude dostupný po aktivaci platebního systému. Reklamy: `TBAds.set(bool)` podle stavu Pro (most zatím neexistuje, MKT-001). Odchylka od původního zadání: místo `PLATFORM.pro` samostatný modul `Pro`, CORE-001 ho může jen zabalit.
- Kritéria:
  - [x] jeden zdroj pravdy (`js/pro.js`, `proOk()`), testy `tests/pro.test.js` (platnost 7 / 365 dní, trvalý plán, vypršení, nepotvrzený nákup)
  - [x] web beze změny chování (bez `APP_VERSION` žádné zámky, položka PRO ani most)
  - [x] web v režimu aplikace (telefon 375 px, světlý i tmavý režim, 12 jazyků bez přetečení): FREE zamčeno, Tourist / Annual / Lifetime odemčeno, vypršení Tourist Pass za běhu zamkne a data zůstanou, nevynucený režim odemčen
  - [x] lokální build APK s `PRO_ENFORCE=1` (JDK 21 z Android Studia), v `index.html` v APK je `window.PRO_ENFORCE=1` · [ ] build v CI (`android.yml`)
  - [x] APK v emulátoru s `PRO_ENFORCE=1`, stav FREE: menu s odznaky PRO, obrazovka PRO, hláška u nákupu, zamčené Oblíbené trasy a Moje místa (2026-11-12) · [ ] bez `PRO_ENFORCE` · [ ] Oblíbené zastávky, Rozšířené vyhledávání, tmavý režim · [ ] telefon (uživatel)
- Poznámky: lokální build jde přes `JAVA_HOME` = JBR z Android Studia (systémová Java je 8). Akcent zůstal `var(--accent)` (#C8102E), zadaná #DC2626 by znamenala změnu barev celé aplikace.

### AND-007 Promo kódy pro přispěvatele Ko-fi
- ANDROID · P3 · BACKLOG
- Popis: přispěvatelé Ko-fi dostanou Pro zdarma přes promo kódy z Play Console.
- Kritéria: [ ] ověřit, že Play promo kódy fungují pro roční předplatné a jaké mají limity · [ ] postup vydání kódů a evidence (bez osobních údajů v gitu)

### MKT-001 Reklamy pro neplatící uživatele aplikace
- ANDROID ONLY (nativní SDK, web reklamy nemá; D-039) · P3 · REVIEW (zadání uživatele 2026-11-12)
- Popis: adaptivní banner Google AdMob pro uživatele bez aktivního Pro (Tourist, Annual i Lifetime jsou bez reklam). Jediná reklamní plocha: nativní pruh pod WebView (`Ads.java`), takže nikdy nepřekrývá mapu, jízdní řády ani ovládání; systémové okraje řeší kořenové rozvržení. O zobrazení rozhoduje jen web přes `TBAds.set(bool)`: `Pro.ads(stav)` a zároveň není otevřená obrazovka PRO ani zobrazené výsledky hledání spojení. Banner se nezobrazí ani při otevřené klávesnici. Souhlas: Google UMP před první reklamou (jen když jsou reklamy potřeba, tedy ne u Pro), bez souhlasu se nenačítá nic; položka menu „Soukromí reklam“ se ukáže, když UMP vyžaduje možnost změny. SDK se inicializuje jednou na pozadí, při chybě načtení se banner zruší a další pokus je nejdřív za 60 s. Konfigurace: `ADMOB_APP_ID` a `ADMOB_BANNER_ID` z prostředí nebo `android/ads.properties` (mimo git, šablona `ads.properties.example`); debug vždy testovací ID Google, release bez ID má reklamy vypnuté, testovací ID v release build odmítne. `ADS=0` reklamy v buildu vypne, `ADS_TEST_EEA=1` v debug buildu vynutí chování EHP. Interstitial ani rewarded nejsou.
- Kritéria:
  - [x] lokální build debug APK (play-services-ads 25.5.0, UMP 4.0.0), testy 44/44
  - [x] emulátor: souhlas UMP proběhl, požadavek na testovací reklamu odeslán, při chybě načtení aplikace běží dál a pokus se opakuje po 60 s
  - [x] web v režimu aplikace: `TBAds.set(true)` při startu FREE, `false` po otevření obrazovky PRO, `true` po zavření
  - [ ] viditelný testovací banner (v emulátoru nešlo: jeho WebView nedůvěřuje certifikátům, `Trust anchor for certification path not found`) · [ ] dialog souhlasu v EHP (`ADS_TEST_EEA=1`) · [ ] otočení displeje, tmavý režim
  - [ ] po nákupu banner ihned zmizí, po vypršení se vrátí (čeká na AND-005)
  - [ ] účet AdMob, ID aplikace a jednotky, zpráva souhlasu v AdMob (Privacy & messaging), `app-ads.txt` na tiranabus.al, Data safety a prohlášení o reklamním ID v Play Console, zásady soukromí (uživatel)
  - [ ] telefon (uživatel)
- Poznámky: debug APK narostlo z 9,6 na 16,6 MB (SDK a Kotlin runtime, který SDK potřebuje). Release se nezmenšuje (R8 vypnuto), případné zapnutí je samostatný úkol.

### AND-009 Dočasný testovací přepínač PRO v menu
- ANDROID ONLY (menu ☰ je jen v aplikaci) · P3 · REVIEW (návrh uživatele 2026-11-12)
- Popis: jen pro testování, než bude Play Billing (AND-005). Build s `PRO_TEST=1` (zapne i `PRO_ENFORCE`) vloží `window.PRO_TEST=1` a v menu pod „Tirana BUS PRO“ ukáže přepínač „PRO test“. Zapnuto: `proRead()` v `app.js` místo mostu `TBPro` použije simulovaný nákup LIFETIME, funkce PRO jsou odemčené a reklamy vypnuté. Vypnuto: stav FREE, zámky a reklamy. Volba se pamatuje v `localStorage['tirana-pro-test']`. Bez `PRO_TEST` přepínač neexistuje a klíč se nečte. Build pro veřejné vydání se s `PRO_TEST=1` stavět nesmí. Po AND-005 odstranit.
- Kritéria: [x] testy 44/44 · [x] emulátor: přepínač v menu, po zapnutí obrazovka PRO ukazuje LIFETIME PREMIUM · [ ] po zapnutí zmizí banner, po vypnutí se vrátí (v emulátoru se reklamy nenačítají) · [ ] telefon (uživatel)

### UX-019 Jen jedna karta naráz
- Oblast: UI · ANDROID ONLY (karty jsou jen v aplikaci) · P3 · REVIEW
- Popis: otevření karty z menu ☰ (Oblíbené zastávky, Oblíbené trasy, Moje místa) zavře ostatní otevřené karty (`plShow` volá `plClose` pro ostatní sekce); stav editace zavřené karty se zruší. Zadání uživatele.
- Kritéria:
  - [x] web (režim aplikace): střídání všech tří karet, vždy otevřená jediná, plánovač skrytý, Zpět ho vrátí
  - [ ] APK v emulátoru · [ ] telefon (uživatel)

### BUG-003 Nabídka existujícího bodu
- Oblast: mapa, UI · ANDROID ONLY (vlastní body a předvolby jsou jen v aplikaci) · P2 · REVIEW
- Popis: značka vlastního bodu je malá (poloměr 2–4 px), klepnutí prstem ji často netrefilo a nabídka (`poiPop`) se neotevřela. Oprava: viditelná značka je neinteraktivní a nad ní leží průhledný zásah o poloměru 16 px (`_hit` v `poiLayer`, tooltip i klik jsou na něm). V APK (emulátor, klepnutí `adb input tap`) ale klepnutí na značky v canvasu vůbec nevyvolalo `click` vrstvy (platí i pro zastávky), zatímco klepnutí na mapu ano; proto `map.on('click')` navíc hledá nejbližší vlastní bod do 24 px a otevře jeho nabídku (`poiPop`). Na webu klik na značku zastaví šíření, takže se nevolá dvakrát. Nabídka existujícího bodu (`poiPop`) a předvolby (`prePop`) mají nově stejný vzhled jako nabídka po podržení prstu na mapě: široké řádky s ikonami (`.gmenu`, `gmRow`; Odsud, Sem, Upravit), hlavička s ikonou a popisem.
- Kritéria:
  - [x] web (režim aplikace): klepnutí do 12 px od značky otevře nabídku, 40 px ne; nový vzhled
  - [x] APK v emulátoru: klepnutí na uložený bod otevře nabídku v novém vzhledu
  - [ ] telefon (uživatel)

### UX-024 Obrazovka PRO na celou obrazovku
- Oblast: PRO · SHARED (jen CSS; na webu se karta PRO neotevírá, protože PRO je jen v aplikaci) · P3 · REVIEW (zadání uživatele 2026-11-13)
- Popis: karta „Tirana BUS PRO“ se po otevření (tlačítko „Odemknout PRO“ u zamčené funkce, položka PRO v menu, klepnutí na zamčené „Rozšířené vyhledávání“) zobrazí přes celou obrazovku bez mapy (`position: fixed; inset: 0` na `#procard`, `css/style.css`); zavírá se křížkem nebo tlačítkem Zpět dole. Sbalení karty je v tomto režimu skryté. Respektuje okraje displeje (`safe-area`), na širokých displejích je obsah vystředěný (max. 640 px). Ostatní karty beze změny.
- Kritéria: [x] web 375×812: karta pokrývá celé okno, křížek i Zpět ji zavřou a mapa se vrátí · [x] APK v emulátoru: Odemknout PRO i Rozšířené vyhledávání (2026-11-13) · [ ] tmavý režim · [ ] telefon (uživatel)

### UX-023 Poloha při startu
- Oblast: mapa · ANDROID ONLY (`GEO` je jen v APK; na webu by to znamenalo dotaz prohlížeče při každé první návštěvě) · P3 · REVIEW
- Popis: po spuštění se jednou tiše zjistí poloha (`geoOnce`). V Tiraně se zobrazí smajlík s kruhem přesnosti (bez panelu zastávek, mapa zůstává na Tiraně, zoom 13); mimo Tiranu, při vypnuté poloze nebo chybě se nic nestane. Oprávnění uděleno → bez dotazu; neuděleno → systémový dotaz při startu. Po odmítnutí se `localStorage` `tirana-geo-no` nastaví a při dalších startech se už neptá; smaže se úspěšným zjištěním přes tlačítko „Moje poloha“ (změna oprávnění v nastavení systému se tedy projeví až po něm). Zadání uživatele.
- Kritéria:
  - [x] APK v emulátoru: první start → dotaz → povolit → smajlík v Tiraně; další start bez dotazu se smajlíkem; poloha v Praze → nic
  - [ ] odmítnutí a další start bez dotazu · [ ] telefon (uživatel)

### UX-025 Posuvný panel mapa / vyhledávání
- Oblast: UI, mapa · ANDROID ONLY (zadání uživatele; kód je v `js/app.js` pod `window.APP_VERSION`, na webu by šel zapnout stejně) · P3 · REVIEW
- Popis: na telefonu (šířka ≤ 760 px) lze tažením úchytu `#grab` nahoře v `.side` měnit výšku mapy plynule (řádek mřížky `--maph`) a po uvolnění se panel přichytí (animace 240 ms) na nejbližší ze tří stavů: panel ~30 % (mapa 70 %), výchozí (beze změny, mapa 44 % výšky aplikace) a panel ~78 %. Úchyt je `position: sticky`, takže zůstává vidět při rolování panelu; tažení začíná jen na něm, gesta mapy a rolování panelu se nemíchají (`touch-action: none` jen na úchytu). Přístupnost: `role=separator`, šipky nahoru/dolů přepínají stavy, `aria-label` z i18n (`sheetGrab`, 12 jazyků). Stav se drží za běhu a po otočení / změně velikosti se znovu spočítá. Karty, plánovač ani mapa se jinak nemění.
- Kritéria:
  - [x] APK v emulátoru: výchozí vzhled beze změny; tažení nahoru → panel velký, dolů → mapa velká, přichycení; tažení mapy ve spodní části mapy panel nemění
  - [ ] telefon (uživatel) · [ ] tmavý režim, otočení, rolování dlouhého panelu

### UX-026 Testerský build: PRO test výchozí zapnutý
- Oblast: menu, Pro · ANDROID ONLY (jen build s `PRO_TEST=1`) · P3 · REVIEW
- Popis: v buildu `PRO_TEST=1` se v menu ☰ nezobrazuje položka „Tirana BUS PRO“ (duplicitní s přepínačem „PRO test“; obrazovka PRO zůstává dostupná z Unlock PRO a zamčených funkcí) a přepínač „PRO test“ je při prvním spuštění zapnutý (`build.gradle` vloží do injektovaného skriptu `localStorage.tirana-pro-test = 1`, jen pokud není nastaven; ruční vypnutí se zachová). Běžné buildy beze změny.
- Kritéria:
  - [x] APK `PRO_TEST=1` v emulátoru (čistá instalace): v menu není „Tirana BUS PRO“, „PRO test“ zapnutý
  - [ ] telefon (uživatel) · [ ] vypnutý přepínač přežije restart

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
