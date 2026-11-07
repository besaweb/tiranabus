# Testování – Tirana Bus

## Automatické testy (Node, bez npm)

```
node --test "tests/*.test.js"                            # gtfs.zip v kořeni
GTFS_ZIP=/cesta/gtfs.zip node --test "tests/*.test.js"   # worktree
UPDATE_SNAPSHOT=1 node --test tests/planner.test.js      # nový snapshot plánovače
```

| Soubor | Obsah |
|---|---|
| `tests/core.test.js` | čas, kalendář, platnost, `merge`, build reálného feedu, letiště, `groupStops`, odjezdy přes půlnoc |
| `tests/planner.test.js` | 2 × 81 dotazů (vzdušná čára / pěší síť) – invarianty a snapshot `tests/fixtures/planner-snapshot.json` |
| `tests/i18n.test.js` | 12 jazyků: shodné klíče, parametry, plurály; letištní texty; slovníky `android/menu.js`, `validity.js` |

- Bez `gtfs.zip` se testy nad reálným feedem přeskočí (skip), ostatní běží.
- Snapshot plánovače platí pro konkrétní `feed_version`; při jiném feedu se test přeskočí s výzvou k přegenerování. Změna snapshotu v PR = změna chování plánovače → popsat v PR a ověřit, že je to zlepšení (příjezd nikdy horší).
- Test označený `# TODO <ID>` je známá chyba evidovaná v `TASKS.md`; neblokuje CI. Po opravě odstranit `todo`.

V CI běží na každém Pull Requestu (`.github/workflows/tests.yml`, feed z release `tirana-latest`). Workflow navíc ověří generátor SEO stránek.

## Ruční ověření podle typu změny

| Změna | Ověřit |
|---|---|
| Kalendář, odjezdy, plánovač | testy + dotazy kolem půlnoci a na zítřek; u plánovače regresní sada (příjezd nikdy horší) |
| Data (`extra-airport.js`, POI, walk) | přegenerované soubory, počty v testech, `data/gtfs-extra.zip` |
| UI | prohlížeč (Playwright): světlý i tmavý režim, desktop ≥ 1280 px, 761–1099 px, telefon ≤ 760 px; 2–3 jazyky včetně dlouhých (de, el) |
| SEO / nasazení | `node tools/build-pages.js /tmp/site` proběhne, počet stránek a URL v sitemap |
| Cokoli SHARED | navíc Android checklist |

## Android checklist

1. Build projde, `apksigner verify` OK, verze v O aplikaci odpovídá.
2. Start: úvodní obrazovka, načtení jízdních řádů, výchozí jazyk.
3. Spojení: vyhledání, detail, kreslení na mapě; Linky a zastávky; odjezdy.
4. Menu ☰: Jazyk (všech 12), Jízdné, Platnost dat, O aplikaci; tmavý režim.
5. Offline mapa: přepnutí vrstvy, světlý/tmavý styl.
6. **Režim letadlo** (po předchozím spuštění online): start, plánovač, offline mapa, dříve viděné online dlaždice.
7. Externí odkazy se otevřou v prohlížeči, tlačítko Zpět.
8. Na reálném telefonu i emulátoru (aktuální target API).

Výsledek zapsat do úkolu (TASKS.md) a do `releases/` při vydání.
