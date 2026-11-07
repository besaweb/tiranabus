# Decisions – Tirana Bus

Formát: `D-NNN` · datum · rozhodnutí · důvod / důsledky. Záznamy se nemažou; zrušené rozhodnutí se označí „Nahrazeno D-xxx“.

## Technologie a architektura

- **D-001** (2026-10) **Bez buildu a frameworku.** Čistý JS, knihovny z CDN, spustitelné přes `python -m http.server`.
- **D-002** (2026-10) **Žádný backend.** Nic se neodesílá; feed z pt.tirana.al se kvůli licenci a CORS nestahuje za běhu, dodává ho nasazení (release `tirana-latest`).
- **D-003** (2026-10) **Plánovač = CSA**, ne RAPTOR: jednodušší, pro ~130 tis. stop_times dost rychlý. Přestup min. 60 s, zákaz přestupu na stejnou linku opačným směrem.
- **D-004** (2026-11-01) **Zůstat sedět = stejný `block_id`**, jen stejná linka a směr, pauza do 10 min na stejné zastávce; přes konečnou s otočením směru se nepokračuje.
- **D-005** (2026-10) **Zastávky v plánovači se seskupují podle názvu** (obě strany ulice = jedna volba).
- **D-006** (2026-10) **Doplňkové linky** jako samostatný mini-GTFS přes `GTFS.merge` s prefixem ID, městský feed se neupravuje.
- **D-007** (2026-10) **Zobrazená trasa linky** = nejdelší spoj v každém směru.
- **D-008** (2026-10) **Časová zóna** z `agency.txt` (Europe/Tirane), ne z prohlížeče.
- **D-009** (2026-10) **Výchozí podklad:** OSM přes http(s), Esri ulice při `file://`.
- **D-010** (2026-11-02) **Hlavní doména** `https://tiranabus.al/` (canonical ve zdroji); GitHub Pages jsou zrcadlo.
- **D-011** (2026-11-03) **Místa a ulice z OSM lokálně** (`data/poi.json`), ne Nominatim/Overpass za běhu: rychlost, offline v APK, Nominatim zakazuje našeptávání. `js/places.js` je čistá logika. Rozšířené vyhledávání volitelné, výchozí vypnuté.
- **D-012** (2026-11-04) **Mobilní rozhraní = stejné HTML** jako desktop, přeskládání jen CSS gridem (mapa nahoře, panel pod ní).
- **D-013** (2026-11-03) **Pěší vzdálenosti po síti ulic z OSM** (`data/walk.json`); `gtfs-core.js` zůstává bez závislostí, síť předává aplikace přes `feed.walkFn`.
- **D-014** (2026-11-05) **Statické SEO stránky se generují při nasazení**, necommitují se; jazykový adresář místo parametru, `/` jako x-default, `<base href="../">` v jazykových kopiích.
- **D-015** (2026-10-30) **Offline mapa v APK** jako vektorové mbtiles servírované z `MainActivity` + MapLibre GL; web zůstává u rastrových podkladů.

## Organizace vývoje (2026-11-07, schváleno uživatelem)

- **D-016** **Jeden zdroj kódu pro web i Android, Android jako WebView obálka.** Splňuje SHARED BY DEFAULT bez dvojího vývoje; zpevnit platformní vrstvu (CORE-001, CORE-002, I18N-001, CORE-004, CORE-005). Capacitor/nativní Android zamítnuty (npm/duplicitní UI).
- **D-017** **SHARED BY DEFAULT**; WEB ONLY / ANDROID ONLY jen s technickým zdůvodněním; SHARED úkol DONE až po ověření na obou platformách.
- **D-018** **Android přejde na Gradle projekt** (kvůli AAB a target API 36 pro Google Play). Provedeno v CORE-003 (2026-11-07), `build.sh` odstraněn.
- **D-019** **Git: krátké větve na úkol, merge do `main` jen přes Pull Request s automatickými testy**, paralelní práce přes git worktree.
- **D-020** **7 tematických chatů** (varianta S, `docs/CHATS.md`).
- **D-021** **Dokumentace v `docs/`**, `HANDOFF.md` zrušen (obsah rozdělen do `docs/`).
- **D-022** (2026-11-07) **Podepisování APK/AAB: heslo mimo git, Play App Signing zapnout.** Heslo keystore (beze změny, stávající klíč a certifikát zůstávají) se čte z `android/keystore.properties` (v `.gitignore`, šablona `keystore.properties.example`) nebo z `TB_KS_PASS` / `TB_KEY_PASS` / `TB_KEY_ALIAS`; `build.sh` bez nich skončí. Chybějící keystore už nevede k vygenerování nového klíče (rozbilo by aktualizace), build skončí s chybou. Staré heslo zůstává v historii gitu (soukromý repozitář), klíč ne. Při prvním nahrání AAB zapnout Play App Signing: Google drží podpisový klíč, `tirana-bus.keystore` slouží jako upload key a při ztrátě jde resetovat.
- **D-023** (2026-11-07) **Android build: AGP 9.0.0 + Gradle 9.1.0 (wrapper je v gitu), Groovy DSL, zdroje na původních místech, příprava webu jako Gradle task místo bash/python/sed.** Důvod: stejný build na Windows i Linuxu bez závislosti na Git Bash a Pythonu. `targetSdk` zůstává 34 do AND-001. Výstup shodný s `build.sh` (assets, certifikát klíče); rozdíly jen kosmetické (zkrácené názvy souborů v `res/`, konce řádků).
