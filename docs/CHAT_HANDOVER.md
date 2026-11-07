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

## AND-003 / AND-001 / AND-004 / CORE-003 ověření na reálném telefonu
- Chat: 03 Android · Větev / worktree: `and/AND-004-cache` (`MHD Tirana.wt\AND-004`) · Aktualizováno: 2026-11-07
- Hotovo: CORE-003 a AND-001 sloučeno (PR #7, #8), AND-004 na větvi (PR otevírá uživatel). Testovací APK `android/out/TiranaBus-1.8-test.apk` (z větve AND-004, `VERSION=1.8-test`, `VERSION_CODE=1`).
- Změněné soubory: `android/src/.../DiskCache.java`, `MainActivity.java`, docs.
- Testy: DiskCache v Javě 12/12 OK; emulátor API 36 OK (start, okraje, Zpět, odkazy, obnova mbtiles). Telefon neověřen.
- Platformy: ANDROID ONLY (obálka).
- Problémy: emulátor nestáhne externí dlaždice (Avast), cache ověřena jen jednotkovým testem; CORE-003: chybí build na Linuxu/CI.
- Další krok: uživatel zapíše výsledky testu na telefonu (checklist `testing/README.md`, režim letadlo) → zapsat do TASKS, uzavřít AND-003, a po ověření AND-001, AND-004, CORE-003 (přesun do Archivu), smazat tento záznam.
