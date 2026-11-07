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

## DOC-001 Dokumentační struktura
- Chat: 01 ARCHITECTURE & CORE · Větev: `doc/DOC-001-docs-structure` · Aktualizováno: 2026-11-07
- Hotovo: `docs/` vytvořen, `HANDOFF.md` rozdělen a odstraněn, nový `CLAUDE.md`, README aktualizováno.
- Změněné soubory: `CLAUDE.md`, `README.md`, `HANDOFF.md` (smazán), `docs/**`
- Testy: kontrola, že každá sekce `HANDOFF.md` má cíl v `docs/`
- Platformy: n/a (jen dokumentace)
- Problémy: odkazy na `tests/` a CI platí až po sloučení TEST-001
- Další krok: review a sloučení PR; pak TEST-001

## TEST-001 / TEST-002 Testy a CI
- Chat: 06 BUGS & TESTING · Větev: `test/TEST-001-node-tests` (navazuje na DOC-001) · Aktualizováno: 2026-11-07
- Hotovo: `tests/` (core, planner se snapshotem, i18n), `tests/fixtures/planner-snapshot.json`, workflow `.github/workflows/tests.yml`
- Testy: lokálně 20 testů, 19 OK, 1 TODO (BUG-002); bez `gtfs.zip` 12 OK, 8 přeskočeno
- Platformy: testy čisté logiky (sdílená pro web i APK)
- Problémy: nalezena chyba BUG-002
- Další krok: CI zelené (PR #4); sloučit po DOC-001 (#3); pak BUG-002 (chat 04)
