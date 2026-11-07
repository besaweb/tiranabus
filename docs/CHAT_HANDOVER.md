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
