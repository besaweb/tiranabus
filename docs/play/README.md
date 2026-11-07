# Google Play – podklady pro první vydání (AND-008)

Připraveno 2026-11-07 pro verzi 1.8 (target API 36). Údaje ověřit při vyplňování v Play Console, formuláře se mění.

## Soubory

| Soubor | Pro Play | Poznámka |
|---|---|---|
| `icon-512.png` | Ikona aplikace 512 × 512, PNG | ze `TiranaBusIcon.png` (shodná s `ic_launcher`) |
| `feature-1024x500.jpg` | Hlavní obrázek 1024 × 500 | výřez z `TiranaBusCover.png`; **obsahuje starší modré logo bez orlice**, doporučeno nahradit novou grafikou |
| `screenshots/01–06.jpg` | Snímky telefonu 1080 × 1920 (9:16) | emulátor API 36, anglické UI, 2026-11-07 |

Snímky: 01 spojení na mapě · 02 detail spojení s jízdným · 03 linky a zastávky · 04 přehled sítě, tmavý režim · 05 výběr z 12 jazyků · 06 přehled sítě, světlý režim.

## Základní údaje

| Pole | Hodnota |
|---|---|
| Název aplikace | Tirana Bus |
| Balíček | `com.besaweb.tiranabus` |
| Kategorie | Mapy a navigace (Maps & Navigation) |
| Kontaktní e-mail | info@besaweb.al |
| Web | https://tiranabus.al |
| Zásady ochrany soukromí | https://tiranabus.al/privacy.html |
| Reklamy | Ne (do MKT-001) |
| Cena | Zdarma (Pro předplatné až s AND-005) |
| Cílová skupina | 13+ (pod 13 let by se vztahovala pravidla pro rodiny) |

## Texty listingu

Výchozí jazyk en-US. Albánština a čeština níže; ostatní jazyky (it, de, pl, fr, es, mk, el, ru, tr) zatím přes automatický překlad Play nebo později. **Albánský text je strojový, nechat zkontrolovat rodilým mluvčím (I18N-002).** Neoficiálnost aplikace musí v popisu zůstat (pravidla Play proti vydávání se za instituci).

### English (en-US)

**Title (30):** Tirana Bus – Routes & Map

**Short description (80):** Tirana city buses: journey planner, lines, stops and departures – also offline.

**Full description:**

Tirana Bus helps you get around Tirana by public transport.

• Journey planner – find the fastest connection between two stops, including transfers and short walks, with fares.
• Lines and stops – every city bus line on the map, its stops and departures.
• Airport – LU-NA (Luna Travel) buses between Tirana and Tirana International Airport (Rinas).
• Works offline – timetables and the map of Tirana are stored in the app, so it works at the bus stop even without internet.
• Search for places and streets, not only stops, with walking time to the nearest stop.
• 12 languages: English, Albanian, Czech, Italian, German, Polish, French, Spanish, Macedonian, Greek, Russian and Turkish.
• Light and dark mode. No account, no registration.

Timetables are planned schedules from the open data of the Municipality of Tirana (GTFS, CC BY-SA 4.0); real-time delays are not available. Maps © OpenMapTiles © OpenStreetMap contributors.

Tirana Bus is an independent app by BesaWeb. It is not an official app of the Municipality of Tirana or of any transport operator.

### Shqip (sq)

**Titulli:** Tirana Bus – Linjat dhe harta

**Përshkrim i shkurtër:** Autobusët e Tiranës: udhëtime, linja, stacione dhe nisje – edhe offline.

**Përshkrimi i plotë:**

Tirana Bus ju ndihmon të lëvizni në Tiranë me transportin publik.

• Planifikues udhëtimi – gjeni lidhjen më të shpejtë mes dy stacioneve, me ndërrime dhe ecje të shkurtra, bashkë me çmimin e biletës.
• Linjat dhe stacionet – çdo linjë autobusi e qytetit në hartë, me stacionet dhe nisjet.
• Aeroporti – autobusët LU-NA (Luna Travel) mes Tiranës dhe Aeroportit Ndërkombëtar të Tiranës (Rinas).
• Funksionon offline – oraret dhe harta e Tiranës ruhen në aplikacion, prandaj funksionon në stacion edhe pa internet.
• Kërkoni vende dhe rrugë, jo vetëm stacione, me kohën e ecjes deri te stacioni më i afërt.
• 12 gjuhë, modaliteti i çelët dhe i errët. Pa llogari, pa regjistrim.

Oraret janë orare të planifikuara nga të dhënat e hapura të Bashkisë së Tiranës (GTFS, CC BY-SA 4.0); vonesat në kohë reale nuk janë të disponueshme. Harta © OpenMapTiles © kontribuuesit e OpenStreetMap.

Tirana Bus është aplikacion i pavarur i BesaWeb. Nuk është aplikacion zyrtar i Bashkisë së Tiranës apo i ndonjë operatori transporti.

### Čeština (cs-CZ)

**Název:** Tirana Bus – linky a mapa

**Krátký popis:** MHD Tirana: vyhledávání spojení, linky, zastávky a odjezdy – i bez internetu.

**Úplný popis:**

Tirana Bus vám pomůže cestovat po Tiraně městskou dopravou.

• Vyhledávání spojení – nejrychlejší spojení mezi dvěma zastávkami včetně přestupů a krátké chůze, s cenou jízdného.
• Linky a zastávky – všechny městské linky na mapě, jejich zastávky a odjezdy.
• Letiště – autobusy LU-NA (Luna Travel) mezi Tiranou a mezinárodním letištěm Tirana (Rinas).
• Funguje offline – jízdní řády i mapa Tirany jsou uložené v aplikaci, takže fungují na zastávce i bez internetu.
• Hledání míst a ulic, nejen zastávek, s časem chůze k nejbližší zastávce.
• 12 jazyků, světlý a tmavý režim. Bez účtu a registrace.

Jízdní řády jsou plánované, z otevřených dat města Tirana (GTFS, CC BY-SA 4.0); zpoždění v reálném čase nejsou k dispozici. Mapy © OpenMapTiles © přispěvatelé OpenStreetMap.

Tirana Bus je nezávislá aplikace BesaWeb. Není oficiální aplikací města Tirana ani žádného dopravce.

## Bezpečnost dat (Data safety)

Stav verze 1.8: bez reklam, bez polohy, bez účtu. GA4 (`G-XJ9EK9ZKWF`) se v aplikaci načítá z webu při připojení k internetu, proto se musí uvést.

| Otázka | Odpověď |
|---|---|
| Sbírá aplikace data? | Ano (Google Analytics 4) |
| Sdílí data s třetími stranami? | Ne (Google zpracovává jako poskytovatel služby) |
| Šifrováno při přenosu? | Ano (jen HTTPS, `usesCleartextTraffic=false`) |
| Lze požádat o smazání? | Ne – aplikace nemá účty ani vlastní úložiště dat uživatelů |
| Aktivita v aplikaci → Interakce s aplikací | Sbíráno · Analytika · povinné |
| ID zařízení nebo jiná ID | Sbíráno (identifikátor GA) · Analytika · povinné |
| Přibližná poloha | Sbíráno (GA odvozuje zemi a město z IP, shodně s `privacy.html`) · Analytika · povinné |
| Přesná poloha, osobní údaje, finance, zprávy, fotky, kontakty | Ne |

Při MAP-001 (GPS), AND-005 (nákupy) a MKT-001 (reklamy) formulář aktualizovat. Souhlas s GA4 v EU řeší SEO-003.

## Ostatní formuláře

| Formulář | Odpověď |
|---|---|
| Přístup do aplikace | Všechny funkce bez přihlášení |
| Hodnocení obsahu (IARC) | Kategorie „Nástroje, produktivita, komunikace nebo jiné“; všechny otázky Ne → očekávané hodnocení 3+ / Everyone |
| Reklamy | Ne |
| Zpravodajská aplikace | Ne |
| Vládní aplikace | Ne (neoficiální, viz popis) |
| Finanční / zdravotní funkce | Ne |
| Oprávnění | jen `INTERNET` |

## Postup prvního vydání

1. **Účet:** ověřit typ vývojářského účtu. U osobních účtů založených po 13. 11. 2023 Play před produkcí vyžaduje uzavřené testování s alespoň 12 testery po dobu 14 dní (ověřit aktuální pravidla v Play Console).
2. **Keystore:** záloha `android/tirana-bus.keystore` mimo počítač (AND-002) – před prvním nahráním.
3. **Build** z čistého aktuálního `main`:
   ```bash
   cd android && VERSION=1.8 VERSION_CODE=18 ./gradlew aab
   ```
   Výstup `android/out/TiranaBus.aab`. `versionCode` musí s každým nahráním růst.
4. **Play Console:** vytvořit aplikaci (název, výchozí jazyk en-US, aplikace, zdarma), vyplnit formuláře výše, nahrát grafiku a texty.
5. **Podepisování:** při prvním nahrání AAB zvolit Play App Signing s klíčem vygenerovaným Googlem; `tirana-bus.keystore` je pak upload key (D-022).
6. **Testovací stopa:** interní testování (do 100 testerů) → uzavřené testování → produkce.
7. Po vydání: odkaz na Play do webu (WEB-002), promo kódy pro Ko-fi (AND-007, až s předplatným).
