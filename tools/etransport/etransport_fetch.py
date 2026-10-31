#!/usr/bin/env python3
"""eTransport (DPSHTRR): denní snapshot registru meziměstských linek pro NEVEŘEJNOU analýzu.

Data pocházejí z nedokumentovaného API webu https://www.etransport.al (POST /api/lines),
bez licence a s uvedením "všechna práva vyhrazena". Výstupy proto nezveřejňuj a nepoužívej
ve veřejné ani placené aplikaci, dokud nebudeš mít souhlas DPSHTRR.

Jeden běh:
  1. stáhne všechny linky (stránkuje po 100, mezi dotazy pauza),
  2. uloží surový snapshot  raw/YYYY-MM-DD.json.gz,
  3. vytvoří CSV pro import do DB  csv/stations.csv, csv/lines.csv, csv/departures.csv,
  4. vytvoří GTFS  gtfs-etransport.zip  (jen konečné zastávky, kalendář od data snapshotu na 90 dní),
  5. porovná s předchozím snapshotem  changes/YYYY-MM-DD.csv  a připíše řádek do changes/summary.csv.

Jen standardní knihovna Pythonu 3.8+.
"""

import argparse
import csv
import gzip
import io
import json
import sys
import time
import zipfile
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib import error, request

API = "https://www.etransport.al/api/lines"
PAGE_SIZE = 100
TIMEOUT_S = 60
TZ = "Europe/Tirane"
CALENDAR_DAYS = 90
FALLBACK_KMH = 50
WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def log(msg):
    print(f"{datetime.now():%Y-%m-%d %H:%M:%S} {msg}", flush=True)


def post_page(page, size, user_agent):
    body = {
        "startCityId": None, "startStationId": None, "toCityId": None, "toStationId": None, "operator": None,
        "pagination": {"currentPage": page, "itemsPerPage": size, "totalResults": 0},
    }
    req = request.Request(
        API, data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json", "User-Agent": user_agent},
    )
    for attempt in range(3):
        try:
            with request.urlopen(req, timeout=TIMEOUT_S) as resp:
                return json.load(resp)
        except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt == 2:
                raise
            wait = 15 * (attempt + 1)
            log(f"stránka {page}: {exc}, opakuji za {wait} s")
            time.sleep(wait)


def fetch_all(user_agent, pause_s, fetch=post_page):
    first = fetch(1, PAGE_SIZE, user_agent)
    total = int(first["pagination"]["totalResults"])
    pages = -(-total // PAGE_SIZE)
    lines = {l["id"]: l for l in first["result"]}
    requests_made = 1
    for p in range(2, pages + 1):
        time.sleep(pause_s)
        for l in fetch(p, PAGE_SIZE, user_agent)["result"]:
            lines[l["id"]] = l
        requests_made += 1
    if len(lines) < total:
        log(f"server vrátil {len(lines)} z {total} linek (nestabilní stránkování), druhý průchod")
        for p in range(1, pages + 1):
            time.sleep(pause_s)
            for l in fetch(p, PAGE_SIZE, user_agent)["result"]:
                lines.setdefault(l["id"], l)
            requests_made += 1
    return total, sorted(lines.values(), key=lambda l: l["id"]), requests_made


def weekday_index(tt):
    name = str(tt.get("weekDay") or "").strip().lower()
    if name in WEEKDAYS:
        return WEEKDAYS.index(name)
    n = int(tt.get("weekDayNumber") or 0)
    return 6 if n in (0, 7) else n - 1


def hhmmss(sec):
    return f"{sec // 3600:02d}:{sec // 60 % 60:02d}:{sec % 60:02d}"


def hhmm(sec):
    return f"{sec // 3600 % 24:02d}:{sec // 60 % 60:02d}"


def ride(line, tt):
    """Vrátí (příjezd v s od půlnoci, příznak kvality)."""
    start, stop = int(tt["start"]), int(tt.get("stop") or 0)
    if stop > start:
        return stop, ""
    if 0 < stop < start and start - stop > 6 * 3600:
        return stop + 86400, "pres_pulnoc"
    est = max(5 * 60, round(float(line.get("kilometers") or 0) / FALLBACK_KMH * 3600 / 60) * 60)
    return start + est, "odhad_doby"


def stations_of(lines):
    st = {}
    for l in lines:
        for s in (l["stationFrom"], l["stationTo"]):
            st[s["id"]] = s
    return st


def write_csv(path, header, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(header)
        w.writerows(rows)


def export_csv(lines, out):
    st = stations_of(lines)
    write_csv(out / "stations.csv", ["station_id", "code", "name", "city", "lat", "lon", "address"],
              [[s["id"], s.get("code"), s.get("name"), (s.get("city") or {}).get("name"), s.get("latitude"), s.get("longitude"), s.get("address")]
               for s in sorted(st.values(), key=lambda s: s["id"])])
    write_csv(out / "lines.csv", ["line_id", "route_id", "route_code", "name", "operator", "from_station_id", "to_station_id", "km"],
              [[l["id"], l.get("routeId"), l.get("routeCode"), l.get("name"), l.get("operator"), l["stationFrom"]["id"], l["stationTo"]["id"], round(float(l.get("kilometers") or 0), 2)]
               for l in lines])
    rows = []
    for l in lines:
        for tt in sorted(l["timetables"], key=lambda t: (weekday_index(t), t["start"])):
            arr, flag = ride(l, tt)
            rows.append([l["id"], tt["id"], weekday_index(tt) + 1, WEEKDAYS[weekday_index(tt)], hhmm(int(tt["start"])), hhmm(arr), round((arr - int(tt["start"])) / 60), flag])
    write_csv(out / "departures.csv", ["line_id", "timetable_id", "weekday_no", "weekday", "dep", "arr", "duration_min", "quality_flag"], rows)
    return len(rows)


def gtfs_zip(lines, snapshot_day, path):
    def table(header, rows):
        buf = io.StringIO()
        w = csv.writer(buf, lineterminator="\n")
        w.writerow(header)
        w.writerows(rows)
        return buf.getvalue()

    operators = sorted({l.get("operator") or "?" for l in lines})
    agency_id = {op: f"A{i + 1}" for i, op in enumerate(operators)}
    st = stations_of(lines)
    routes, trips, stop_times = {}, [], []
    flags = {"pres_pulnoc": 0, "odhad_doby": 0}
    for l in lines:
        op = l.get("operator") or "?"
        rid = f"{l.get('routeCode') or l.get('routeId')}-{agency_id[op]}"
        a, b = l["stationFrom"], l["stationTo"]
        if rid not in routes:
            ends = sorted([a["name"], b["name"]])
            routes[rid] = [rid, agency_id[op], l.get("routeCode") or "", f"{ends[0]} – {ends[1]}", "", "3"]
        direction = "0" if a["id"] < b["id"] else "1"
        for tt in l["timetables"]:
            arr, flag = ride(l, tt)
            if flag:
                flags[flag] += 1
            tid = f"T{tt['id']}"
            trips.append([rid, f"W{weekday_index(tt) + 1}", tid, b["name"], direction])
            dep = int(tt["start"])
            stop_times.append([tid, hhmmss(dep), hhmmss(dep), f"S{a['id']}", "1"])
            stop_times.append([tid, hhmmss(arr), hhmmss(arr), f"S{b['id']}", "2"])
    d0 = snapshot_day.strftime("%Y%m%d")
    d1 = (snapshot_day + timedelta(days=CALENDAR_DAYS)).strftime("%Y%m%d")
    files = {
        "agency.txt": table(["agency_id", "agency_name", "agency_url", "agency_timezone", "agency_lang"],
                            [[agency_id[op], op, "https://www.etransport.al", TZ, "sq"] for op in operators]),
        "stops.txt": table(["stop_id", "stop_code", "stop_name", "stop_desc", "stop_lat", "stop_lon"],
                           [[f"S{s['id']}", s.get("code") or "", s.get("name") or "", ", ".join(x for x in [s.get("address"), (s.get("city") or {}).get("name")] if x), s.get("latitude"), s.get("longitude")]
                            for s in sorted(st.values(), key=lambda s: s["id"]) if s.get("latitude") and s.get("longitude")]),
        "routes.txt": table(["route_id", "agency_id", "route_short_name", "route_long_name", "route_desc", "route_type"], list(routes.values())),
        "calendar.txt": table(["service_id"] + WEEKDAYS + ["start_date", "end_date"],
                              [[f"W{i + 1}"] + ["1" if j == i else "0" for j in range(7)] + [d0, d1] for i in range(7)]),
        "trips.txt": table(["route_id", "service_id", "trip_id", "trip_headsign", "direction_id"], trips),
        "stop_times.txt": table(["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"], stop_times),
        "feed_info.txt": table(["feed_publisher_name", "feed_publisher_url", "feed_lang", "feed_start_date", "feed_end_date", "feed_version"],
                               [["Neoficiální převod dat eTransport (DPSHTRR), jen pro interní analýzu", "https://www.etransport.al", "sq", d0, d1, d0]]),
    }
    tmp = path.with_suffix(".tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for name, text in files.items():
            z.writestr(name, text)
    tmp.replace(path)
    return len(routes), len(trips), flags


def dep_keys(lines):
    return {(l["id"], weekday_index(t), int(t["start"])) for l in lines for t in l["timetables"]}


def previous_snapshot(raw_dir, today_name):
    older = sorted(p for p in raw_dir.glob("*.json.gz") if p.name < today_name)
    if not older:
        return None, None
    with gzip.open(older[-1], "rt", encoding="utf-8") as f:
        return older[-1].name[:10], json.load(f)["lines"]


def diff_and_summary(prev_day, prev, cur, day, total, out):
    by_id_prev = {l["id"]: l for l in prev or []}
    by_id_cur = {l["id"]: l for l in cur}
    added_l = sorted(set(by_id_cur) - set(by_id_prev)) if prev is not None else []
    removed_l = sorted(set(by_id_prev) - set(by_id_cur)) if prev is not None else []
    kp, kc = (dep_keys(prev), dep_keys(cur)) if prev is not None else (set(), set())
    added_d, removed_d = sorted(kc - kp), sorted(kp - kc)
    if prev is not None:
        rows = [["linka_pridana", i, by_id_cur[i].get("routeCode"), by_id_cur[i].get("name"), by_id_cur[i].get("operator"), "", ""] for i in added_l]
        rows += [["linka_zrusena", i, by_id_prev[i].get("routeCode"), by_id_prev[i].get("name"), by_id_prev[i].get("operator"), "", ""] for i in removed_l]
        for kind, keys, src in (("odjezd_pridan", added_d, by_id_cur), ("odjezd_zrusen", removed_d, by_id_prev)):
            for lid, wd, start in keys:
                if lid in added_l or lid in removed_l:
                    continue
                l = src[lid]
                rows.append([kind, lid, l.get("routeCode"), l.get("name"), l.get("operator"), WEEKDAYS[wd], hhmm(start)])
        write_csv(out / "changes" / f"{day}.csv", ["zmena", "line_id", "route_code", "name", "operator", "weekday", "dep"], rows)
    summary = out / "changes" / "summary.csv"
    new_file = not summary.exists()
    summary.parent.mkdir(parents=True, exist_ok=True)
    with open(summary, "a", newline="", encoding="utf-8-sig" if new_file else "utf-8") as f:
        w = csv.writer(f, delimiter=";")
        if new_file:
            w.writerow(["date", "compared_to", "total_reported", "lines", "coverage_pct", "stations", "operators", "departures_week",
                        "lines_added", "lines_removed", "departures_added", "departures_removed"])
        w.writerow([day, prev_day or "", total, len(cur), round(100 * len(cur) / total, 1) if total else "", len(stations_of(cur)),
                    len({l.get("operator") for l in cur}), len(kc) if prev is not None else len(dep_keys(cur)),
                    len(added_l), len(removed_l), len(added_d), len(removed_d)])
    return len(added_l), len(removed_l), len(added_d), len(removed_d)


def main(argv=None, fetch=post_page):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[2] / "data" / "etransport"), help="výstupní složka")
    ap.add_argument("--pause", type=float, default=2.0, help="pauza mezi dotazy v sekundách (min. 1)")
    ap.add_argument("--contact", default="", help="kontakt do User-Agent, např. e-mail")
    ap.add_argument("--force", action="store_true", help="stáhnout znovu, i když dnešní snapshot existuje")
    args = ap.parse_args(argv)

    out = Path(args.out)
    raw_dir = out / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    day = date.today()
    raw_path = raw_dir / f"{day:%Y-%m-%d}.json.gz"
    if raw_path.exists() and not args.force:
        log(f"snapshot {raw_path.name} už existuje, končím (použij --force)")
        return 0

    ua = "MHD-Tirana-research/1.0 (daily, non-public analysis" + (f"; contact: {args.contact}" if args.contact else "") + ")"
    log("stahuji eTransport /api/lines")
    try:
        total, lines, n_req = fetch_all(ua, max(1.0, args.pause), fetch)
    except Exception as exc:
        log(f"CHYBA stahování: {exc}")
        return 2
    if not lines:
        log("CHYBA: API nevrátilo žádné linky, snapshot neukládám")
        return 3

    with gzip.open(raw_path, "wt", encoding="utf-8") as f:
        json.dump({"fetched_at": datetime.now().isoformat(timespec="seconds"), "source": API, "total_reported": total, "lines": lines}, f, ensure_ascii=False)
    n_dep = export_csv(lines, out / "csv")
    n_routes, n_trips, flags = gtfs_zip(lines, day, out / "gtfs-etransport.zip")
    prev_day, prev = previous_snapshot(raw_dir, raw_path.name)
    a_l, r_l, a_d, r_d = diff_and_summary(prev_day, prev, lines, f"{day:%Y-%m-%d}", total, out)
    log(f"hotovo: {len(lines)}/{total} linek, {len(stations_of(lines))} stanic, {n_dep} odjezdů/týden, {n_routes} tras v GTFS, "
        f"{n_req} dotazů; přes půlnoc {flags['pres_pulnoc']}, odhad doby {flags['odhad_doby']}")
    if prev is not None:
        log(f"změny proti {prev_day}: linky +{a_l} −{r_l}, odjezdy +{a_d} −{r_d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
