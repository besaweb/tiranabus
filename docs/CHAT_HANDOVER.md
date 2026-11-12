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

## CORE-007 Tirana BUS PRO
- Chat: 08 PRO funkce · Větev: `feat/CORE-007-pro-plany` · Aktualizováno: 2026-11-12
- Hotovo: `js/pro.js`, obrazovka PRO, zámky čtyř funkcí, texty ve 12 jazycích, příznak `PRO_ENFORCE` v Gradle, háček pro reklamy.
- Změněné soubory: `js/pro.js`, `js/app.js`, `js/i18n.js`, `css/style.css`, `index.html`, `android/menu.js`, `android/build.gradle`, `tests/pro.test.js`, dokumentace.
- Testy: `node --test "tests/*.test.js"` 44/44; prohlížeč v režimu aplikace (stavy FREE, Tourist, Annual, Lifetime, vypršení, 12 jazyků, tmavý režim).
- Platformy: web ☑ · android ☐ (Gradle build lokálně nešel, jen Java 8)
- Problémy: `pro.js` není v seznamech souborů mimo glob `js/**` (ověřit `deploy-ftp.sh` a `pages.yml` při nasazení).
- Další krok: PR, zelené CI včetně `android.yml`, APK v emulátoru a na telefonu; potom AND-005 (Play Billing) a MKT-001 (AdMob).

## AND-008 První vydání v Google Play
- Chat: 03 Android · Větev: `doc/CORE-006-uzavreni` · Aktualizováno: 2026-11-07
- Hotovo: podklady v `docs/play/` (grafika, 6 snímků, texty en/sq/cs, Data safety, IARC, postup).
- Testy: délky textů v limitech Play ověřeny skriptem; snímky 1080 × 1920 (9:16).
- Problémy: hlavní obrázek se starým logem; albánské texty strojové.
- Další krok: účet ověřen (2026-11-09). Po sloučení PR s BUG-001/002 a WEB-001 postavit AAB z čistého `main` (`./gradlew aab`, nová verze – `versionCode` ≥ 19), uživatel nahraje na interní testování a zahájí uzavřený test (12 testerů / 14 dní).
## MKT-001 Reklamy AdMob
- Chat: 08 PRO funkce · Větev: `and/MKT-001-admob` (navazuje na `feat/CORE-007-pro-plany`) · Aktualizováno: 2026-11-12
- Hotovo: `Ads.java` (banner pod WebView, UMP, most `TBAds`), konfigurace ID v `build.gradle`, `adsSync()` v `app.js`, položka „Soukromí reklam“ v `android/menu.js`.
- Změněné soubory: `android/src/com/besaweb/tiranabus/Ads.java`, `MainActivity.java`, `android/build.gradle`, `android/AndroidManifest.xml`, `android/menu.js`, `android/menu.css`, `android/ads.properties.example`, `.gitignore`, `js/app.js`, dokumentace.
- Testy: `node --test` 44/44; lokální debug build OK; emulátor: souhlas UMP proběhl, požadavek na testovací reklamu odeslán, načtení selhalo na certifikátech emulátoru (`Trust anchor for certification path not found`), aplikace běží dál.
- Zbývá: vidět testovací banner na telefonu nebo jiném emulátoru; dialog souhlasu s `ADS_TEST_EEA=1`; otočení displeje; po AND-005 ověřit zmizení banneru po nákupu a návrat po vypršení.
- Čeká na uživatele: účet AdMob, `ADMOB_APP_ID`, `ADMOB_BANNER_ID`, zpráva souhlasu v AdMob, `app-ads.txt`, Data safety a reklamní ID v Play Console, zásady soukromí.
- Lokální build: `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`, `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`.
