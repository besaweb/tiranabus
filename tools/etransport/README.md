# eTransport – denní snapshot meziměstských linek

Skript `etransport_fetch.py` jednou denně stáhne registr licencovaných meziměstských linek z webu
[eTransport](https://www.etransport.al/RrjetiLinjave/LinjaDheOrare), který provozuje DPSHTRR, a uloží ho pro analýzu.

**Jen pro neveřejnou analýzu.** Data jsou z nedokumentovaného API (`POST /api/lines`), bez licence a s uvedením
„všechna práva vyhrazena“. Výstupy nezveřejňuj a nepoužívej ve veřejné ani placené aplikaci, dokud nebudeš mít
souhlas DPSHTRR.

## Požadavky

Python 3.8 nebo novější, jen standardní knihovna. Ověření: `py -3 --version` nebo `python --version`.

## První ruční spuštění

```
cd "C:\WORK\Claude\MHD Tirana\tools\etransport"
py -3 etransport_fetch.py --contact "tvuj@email.cz"
```

Kontakt se pošle v hlavičce User-Agent, aby provozovatel věděl, kdo data stahuje. Doplň ho i do `run_etransport.bat`.

## Denní spouštění (Plánovač úloh Windows)

V příkazovém řádku (cmd):

```
schtasks /Create /TN "MHD Tirana eTransport" /SC DAILY /ST 05:17 /TR "\"C:\WORK\Claude\MHD Tirana\tools\etransport\run_etransport.bat\""
```

Kontrola: `schtasks /Query /TN "MHD Tirana eTransport"`. Zrušení: `schtasks /Delete /TN "MHD Tirana eTransport" /F`.
Úloha běží, jen když je počítač zapnutý a uživatel přihlášený. Když se den vynechá, nic se neděje,
další běh porovná s posledním dostupným snapshotem.

## Výstupy (`data\etransport\`)

| Soubor | Obsah |
|---|---|
| `raw\YYYY-MM-DD.json.gz` | surový snapshot API, jeden za den |
| `csv\stations.csv` | stanice: kód, název, město, souřadnice, adresa |
| `csv\lines.csv` | linky (směry): kód trasy, dopravce, výchozí a cílová stanice, km |
| `csv\departures.csv` | odjezdy po dnech v týdnu, příjezd, jízdní doba, příznak kvality |
| `gtfs-etransport.zip` | GTFS z posledního snapshotu, kalendář 90 dní od data stažení |
| `changes\YYYY-MM-DD.csv` | změny proti předchozímu snapshotu: přidané a zrušené linky a odjezdy |
| `changes\summary.csv` | jeden řádek za den: počty linek, stanic, dopravců, odjezdů a změn |
| `log.txt` | výpis z každého běhu |

CSV používají oddělovač `;` a kódování UTF-8 s BOM, takže se otevřou v Excelu a dají se načíst do Oracle
(SQL*Loader nebo External Table).

`quality_flag` v `departures.csv`:
- `odhad_doby`: registr má nulovou nebo chybnou jízdní dobu, příjezd je odhad podle km při 50 km/h,
- `pres_pulnoc`: příjezd je až po půlnoci.

## Jak se chová k serveru

- Stránkuje po 100 linkách, mezi dotazy čeká 2 s (`--pause`, minimum 1 s). Běžný běh je asi 11 dotazů.
- Server občas vrací stránky v nestabilním pořadí a některé linky chybí. Skript pak udělá druhý průchod.
  Pokrytí je vidět ve sloupci `coverage_pct` v `summary.csv`.
- Když dnešní snapshot existuje, nestahuje znovu (vynutíš `--force`).
- Při chybě sítě to zkusí 3×, pak skončí s kódem 2 a nic nepřepíše.

## Omezení dat

- V registru jsou jen konečné stanice, bez mezilehlých zastávek a bez tvaru trasy.
- Jízdní doby jsou místy nespolehlivé (například letištní linka LU-NA má v registru 22 min, Luna uvádí 45 min).
- Registr nemá platnost od–do, GTFS proto používá kalendář na 90 dní od stažení.
- GTFS jde nahrát do aplikace MHD Tirana tlačítkem Nahrát GTFS, ale jen pro vlastní testování.
