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
| `tests/i18n.test.js` | 12 jazyků: shodné klíče, parametry, plurály; klíče použité v `app.js`/`index.html` (+ `rt*`, `back`, `preHere`, `preOnMap`) existují a nejsou prázdné; letištní texty; slovníky `android/menu.js`, `validity.js` |
| `tests/presets.test.js`, `pois.test.js`, `routes.test.js` | `Places.presets/pois/routes`: poškozený vstup, duplicity, limity (`POI_MAX`, `ROUTE_MAX`), ořez délek, jen povolené klíče (čas ani linky se neukládají) |

- Bez `gtfs.zip` se testy nad reálným feedem přeskočí (skip), ostatní běží.
- Snapshot plánovače platí pro konkrétní `feed_version`; při jiném feedu se test přeskočí s výzvou k přegenerování. Změna snapshotu v PR = změna chování plánovače → popsat v PR a ověřit, že je to zlepšení (příjezd nikdy horší).
- Test označený `# TODO <ID>` je známá chyba evidovaná v `TASKS.md`; neblokuje CI. Po opravě odstranit `todo`.

V CI běží na každém Pull Requestu (`.github/workflows/tests.yml`, feed z release `tirana-latest`). Workflow navíc ověří generátor SEO stránek. Android build hlídá `.github/workflows/android.yml` (PR, které sahají do `android/` nebo sdíleného webu).

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
9. Edge-to-edge: hlavička nepřekrývá status bar, obsah nezasahuje pod navigační lištu ani klávesnici; světlý i tmavý systémový režim.
10. Zpět: z „Platnost dat“ na hlavní stránku, na hlavní stránce ukončí aplikaci (Android 13+ predictive back).
11. Menu ☰: první položka Oblíbené trasy, pak ostatní; po výběru se menu zavře.
12. Hvězdička u spojení je přepínač (přidat ↔ odebrat) a pokaždé zobrazí oznámení (rtAdded / rtRemoved); po restartu aplikace trasa zůstává.
13. Karta Oblíbené trasy: prázdný stav; přejmenování (uloží se Odkud/Kam + název, žádný čas ani linky); smazání; otevření trasy spočítá spojení nad aktuálními daty a časem; trasa s neplatnou zastávkou se nerozbije (rtGone).
14. Odkud/Kam: tlačítka Moje aktuální poloha (se zapnutou i vypnutou polohou) a Vybrat na mapě – pro zastávky i místa (předvolby Domů/Práce/Škola, vlastní místa); výběr vrátí do formuláře správný popisek.
15. Zpět v kartách: z detailu linky/zastávky/spojení o krok zpět; skrytý plánovač se po zavření karet vrátí; Zpět při výběru na mapě výběr zruší.
16. Úvodní pohled mapy: střed Tirany, zoom 13, bez skoku po načtení dat; po zapnutí polohy se mapa neposune bez vyžádání.
17. Tmavý režim: karty, menu, tlačítka a oznámení čitelné; přepnutí za běhu bez restartu.

Výsledek zapsat do úkolu (TASKS.md) a do `releases/` při vydání.

## Poznámky k prostředí

- Prohlížeč v aplikaci Claude (Browser pane) při načítání stránky z `python -m http.server` opakovaně přerušil přenos `js/i18n.js` (`ERR_CONNECTION_RESET`), i u nezměněné verze z `main`. Curl i `fetch` soubor stáhnou celý. Pro kontrolu webu v tomto prohlížeči použít jiný statický server (např. jednoduchý server v Node bez závislostí). Zjištěno 2026-11-07.
- Poloha na emulátoru: `adb emu geo fix <lon> <lat>` (Tirana `19.8187 41.3275`, Praha `14.4378 50.0755`), polohové služby `adb shell cmd location set-location-enabled true|false`.

### Pasti při testování v emulátoru

- První klepnutí po zobrazení klávesnice se může minout (klávesnice posune rozložení) – po zavření klávesnice klepnout znovu, než se hlásí chyba.
- Snímky z `adb exec-out screencap -p` zaostávají za skutečným stavem; před snímkem chvíli počkat a u sporného stavu pořídit druhý.
- Čerstvá instalace (nebo smazaná data) se načítá asi 60 s (stažení a zpracování GTFS); netestovat dřív.
- Poloha: `adb emu geo fix <lon> <lat>` (pořadí lon, lat!), po změně chvíli počkat na obnovení.
