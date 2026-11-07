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
