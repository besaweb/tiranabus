# Chat handover – Tirana Bus

Jen **aktuálně rozpracované** úkoly. Po dokončení úkolu jeho sekci smaž (trvalé informace patří do `TASKS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `releases/`).

## Šablona

```markdown
## <ID> <název>
- Chat: 0X <oblast> · Větev / worktree: <větev> · Aktualizováno: RRRR-MM-DD
- Hotovo: …
- Změněné soubory: …
- Testy: … (výsledek)
- Platformy: web ☐/☑ · android ☐/☑ (SHARED)
- Problémy: …
- Další krok: …
```

## AND-008 První vydání v Google Play
- Chat: 03 Android · Větev: `doc/CORE-006-uzavreni` · Aktualizováno: 2026-11-07
- Hotovo: podklady v `docs/play/` (grafika, 6 snímků, texty en/sq/cs, Data safety, IARC, postup).
- Testy: délky textů v limitech Play ověřeny skriptem; snímky 1080 × 1920 (9:16).
- Problémy: hlavní obrázek se starým logem; albánské texty strojové.
- Další krok: uživatel čeká na ověření účtu Play (doklady odeslány 2026-11-07; keystore zálohován) → build AAB 1.8 (code 18) z `main` → nahrání na interní testování.

## MAP-001 Moje poloha a nejbližší zastávky
- Chat: 03 Android · Větev: `feat/MAP-001-poloha` · Aktualizováno: 2026-11-07
- Hotovo: implementace, Node testy 24/24 (1 todo), emulátor API 36 všechny stavy, web beze změny. Telefon: body 1 (oprávnění, odmítnutí) a 4 (mimo Tiranu).
- Testovací APK: `android/out/TiranaBus-1.9-geo.apk` (z větve, `versionCode` 19).
- Zbývá na telefonu: trvalé zakázání → Otevřít nastavení, vypnutá poloha → Zapnout polohu, bez internetu, úspěch v Tiraně.
- Další krok: výsledky od uživatele → zapsat do MAP-001; po sloučení PR a dokončení testů DONE a smazat tento záznam.

## UX-001 Předvolby Domů / Práce / Škola
- Chat: 03 Android · Větev: `fix/UX-001-bod-na-mape` (oprava výběru bodu na mapě; základ sloučen v PR #14) · Aktualizováno: 2026-11-07
- Hotovo: implementace v `main`, oprava „Vybrat na mapě“ (značka, název, Uložit), emulátor API 36, web beze změny.
- Testovací APK: `android/out/TiranaBus-1.9-bod.apk` (`versionCode` 21).
- Zbývá: PR opravy; test na telefonu (uživatel); UX-002 ověřit Chatem 02 na webu na telefonu.
- Další krok: výsledky od uživatele → UX-001 DONE.

## UX-003 Ikony předvoleb
- Chat: 03 Android · Větev: `feat/UX-003-ikony` (nad `fix/UX-001-bod-na-mape`) · Aktualizováno: 2026-11-07
- Hotovo: implementace, Node testy, emulátor API 36 (bez plánování trasy, viz TASKS), web beze změny.
- Testovací APK: `android/out/TiranaBus-1.9-ikony.apk` (`versionCode` 22).
- Obsahuje i UX-004 (ikony v polích Odkud / Kam). Testovací APK: `android/out/TiranaBus-1.9-pole.apk` (`versionCode` 23).
- Zbývá: PR po sloučení `fix/UX-001-bod-na-mape`; test na telefonu (uživatel).
- Další krok: výsledky od uživatele → UX-003 DONE.

## UX-005 Vymazání polí Odkud / Kam
- Chat: 03 Android · Větev: `feat/UX-005-vymazat` (nad `feat/UX-003-ikony`) · Aktualizováno: 2026-11-07
- Hotovo: implementace, ověření v prohlížeči (web i režim aplikace), Node testy.
- Testovací APK: `android/out/TiranaBus-1.9-x.apk` (`versionCode` 24, obsahuje i UX-003/UX-004).
- Zbývá: PR po sloučení `feat/UX-003-ikony`; test na telefonu (web i aplikace).

## POI-001 Vlastní místa na mapě
- Chat: 03 Android · Větev: `feat/POI-001-vlastni-mista` · Aktualizováno: 2026-11-07
- Hotovo: implementace, Node testy, prohlížeč v režimu aplikace, emulátor (karta, body, popup), web beze změny, zásady soukromí.
- Testovací APK: `android/out/TiranaBus-1.9-mista.apk` (`versionCode` 25, obsahuje vše z `main`).
- Zbývá: PR; test na telefonu (uživatel); Data safety v Play.

## UX-006 Redesign karet Moje předvolby a Moje místa
- Chat: 03 Android · Větev: `feat/UX-006-moje-mista` (nad `feat/POI-001-vlastni-mista`) · Aktualizováno: 2026-11-08
- Hotovo: implementace, prohlížeč v režimu aplikace (telefon, desktop, světlý/tmavý), web beze změny, Node testy.
- Rozdělení na dvě karty podle zadání z 2026-11-08 (D-034). Testovací APK: `android/out/TiranaBus-1.9-karty.apk` (`versionCode` 27, obsahuje i POI-001).
- Zbývá: PR po sloučení POI-001 (nebo jen tento PR, obsahuje obojí); test na telefonu.

## UX-007 Ikony v hlavním menu aplikace
- Chat: 03 Android · Větev: `feat/UX-007-ikony-menu` (nad `feat/UX-006-moje-mista`) · Aktualizováno: 2026-11-08
- Hotovo: implementace, emulátor (světlý i tmavý režim).
- Testovací APK: `android/out/TiranaBus-1.9-menu.apk` (`versionCode` 28, obsahuje i POI-001 a UX-006).
- Zbývá: PR (stačí jeden pro POI-001 + UX-006 + UX-007); test na telefonu.

## UX-008 Přepínač režimu v menu aplikace
- Chat: 03 Android · Větev: `feat/UX-008-tema-v-menu` (nad `feat/UX-007-ikony-menu`) · Aktualizováno: 2026-11-08
- Hotovo: implementace, nové pořadí položek menu, emulátor (světlý i tmavý režim, cs i en).
- Testovací APK: `android/out/TiranaBus-1.9-tema.apk` (`versionCode` 29, obsahuje i POI-001, UX-006, UX-007).
- Zbývá: PR (stačí jeden pro POI-001 + UX-006 + UX-007 + UX-008); test na telefonu.

## UX-009 Nápověda k Rozšířenému vyhledávání
- Chat: 03 Android · Větev: `feat/UX-009-napoveda-rozsirene` (nad `feat/UX-008-tema-v-menu`) · Aktualizováno: 2026-11-08
- Hotovo: implementace (web i aplikace), web v prohlížeči, emulátor.
- Testovací APK: `android/out/TiranaBus-1.9-napoveda.apk` (`versionCode` 31, obsahuje i POI-001, UX-006 až UX-008).
- Zbývá: PR (stačí jeden pro celý řetěz); test na telefonu; web se změní až po sloučení.
- Přidáno do téže větve: předvolby při psaní do Odkud / Kam až na konec našeptávače (APK `TiranaBus-1.9-poradi-nas.apk`, `versionCode` 32).
