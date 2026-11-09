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

## Checklist: Pro funkce a reklamy (až budou implementovány)

Platí pro CORE-007, AND-005, AND-007, MKT-001. Ověřit v APK z testovací stopy Play (nákupy a reklamy nefungují v APK z `gradlew apk` mimo Play). Web se chování nemění, pokud úkol neurčí jinak.

### Pro – zámky (CORE-007)

1. Bez Pro: zamčené funkce (rozšířené vyhledávání, poloha, předvolby, vlastní body) mají zámek a po klepnutí ukážou výzvu k předplatnému, nic se nerozbije ani neuloží.
2. S Pro: všechny funkce odemčené, žádné zbytkové zámky ani výzvy; po restartu aplikace stav platí.
3. Přechod bez Pro → Pro za běhu (po nákupu) odemkne funkce bez restartu; Pro → bez Pro (vypršení) je zamkne, uložená data (předvolby, místa, trasy) zůstanou zachována a po obnově Pro jsou zpět.
4. Funkce dostupné zdarma (plánovač, mapa, odjezdy, linky, offline mapa) zůstávají bez Pro plně funkční.
5. Web: chování beze změny, žádné Pro zámky ani reklamy.
6. Texty zámků a výzev ve všech 12 jazycích, dlouhé jazyky (de, el), světlý i tmavý režim, telefon i tablet.

### Pro – předplatné (AND-005, AND-007)

7. Nákup: tester s licencí (License testing) dokončí nákup, stav Pro se projeví a nákup je potvrzen (acknowledge, ověřit v Play Console, jinak se po 3 dnech vrátí).
8. Zrušení nákupu uprostřed a platba zamítnutá: aplikace zůstane bez Pro, bez pádu, srozumitelná hláška.
9. Obnovení nákupu (nová instalace, jiné zařízení se stejným účtem) vrátí Pro.
10. Režim letadlo: Pro platí offline do konce zaplaceného období; po vypršení se zamkne. Zrušené předplatné platí do konce období.
11. Testovací předplatné má zkrácené období (obnovení po minutách): ověřit obnovení i expiraci.
12. Promo kód z Play Console (AND-007) se uplatní a odemkne Pro; uplatnění kódu přes Play Store, ne v aplikaci.
13. Most WebView ↔ nativní kód: dostupný jen stránce z `appassets.androidplatform.net`, cizí stránka (externí odkaz) stav ani nákup nevyvolá.
14. Správa předplatného (odkaz do Play) otevře správnou stránku.

### Reklamy (MKT-001, SEO-003)

15. Bez Pro se reklamy zobrazují jen na určených místech; s Pro se nezobrazují vůbec (ani po restartu a v režimu letadlo).
16. Reklama nezakrývá ovládací prvky, neposouvá rozložení, neblokuje klávesnici ani tlačítko Zpět; edge-to-edge (status bar, navigační lišta) beze změny.
17. Bez sítě: aplikace funguje, na místě reklamy nezůstane prázdné místo ani chybová hláška.
18. Souhlas (EU, SEO-003): při prvním spuštění se zobrazí volba souhlasu; odmítnutí = reklamy bez personalizace nebo žádné; volbu lze později změnit v menu; výchozí chování mimo EU.
19. Reklamy jen testovací (test ad unit ID) při vývoji; v testovací stopě nikdy neklikat na ostré reklamy (hrozí blokace účtu AdMob).
20. Play Console: Ads declaration a Data safety (reklamní ID, SDK třetích stran) a zásady soukromí aktualizované před nahráním verze s reklamami; věková kategorie (IARC) znovu zkontrolována.
21. Výkon: start aplikace a plynulost mapy se po přidání SDK reklam nezhoršily (srovnat s verzí bez reklam), velikost APK/AAB.

### Pasti při testování v emulátoru

- První klepnutí po zobrazení klávesnice se může minout (klávesnice posune rozložení) – po zavření klávesnice klepnout znovu, než se hlásí chyba.
- Snímky z `adb exec-out screencap -p` zaostávají za skutečným stavem; před snímkem chvíli počkat a u sporného stavu pořídit druhý.
- Čerstvá instalace (nebo smazaná data) se načítá asi 60 s (stažení a zpracování GTFS); netestovat dřív.
- Poloha: `adb emu geo fix <lon> <lat>` (pořadí lon, lat!), po změně chvíli počkat na obnovení.
