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
- Další krok: uživatel ověří typ účtu Play a zálohuje keystore → build AAB 1.8 (code 18) z `main` → nahrání na interní testování.
