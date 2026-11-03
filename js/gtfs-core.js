const GTFS = (() => {
  const toSec = t => {
    const m = /^\s*(\d+):(\d{2}):(\d{2})\s*$/.exec(t || '');
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null;
  };
  const STAY = 600;
  const PALETTE = ['#D1495B', '#00798C', '#D99A1E', '#30638E', '#6A4C93', '#2A9D8F', '#E76F51', '#8A5A44', '#3D7D3A', '#C2185B', '#5C6BC0', '#9C6644'];
  const hex = v => /^[0-9a-fA-F]{6}$/.test((v || '').trim()) ? '#' + v.trim().toUpperCase() : null;
  const WD = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  function build(t) {
    if (!t.stops || !t.stops.length) throw new Error('V souboru chybí stops.txt, nejde o GTFS feed.');
    if (!t.routes || !t.trips || !t.stop_times) throw new Error('V souboru chybí routes.txt, trips.txt nebo stop_times.txt.');
    const tz = (t.agency && t.agency[0] && t.agency[0].agency_timezone) || 'Europe/Tirane';
    const agencies = (t.agency || []).map(a => (a.agency_name || '').trim()).filter(Boolean);

    const stops = new Map();
    for (const s of t.stops) {
      const lt = (s.location_type || '0').trim();
      if (lt !== '0' && lt !== '') continue;
      const lat = +s.stop_lat, lon = +s.stop_lon;
      if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)) continue;
      stops.set(s.stop_id, { id: s.stop_id, name: (s.stop_name || s.stop_id).trim(), code: (s.stop_code || '').trim(), desc: (s.stop_desc || '').trim(), lat, lon, routes: new Set(), deps: [] });
    }

    const routes = new Map();
    let i = 0;
    for (const r of t.routes) {
      const short = (r.route_short_name || '').trim(), long = (r.route_long_name || '').trim();
      routes.set(r.route_id, { id: r.route_id, short: short || long || r.route_id, long: short ? long : '', desc: (r.route_desc || '').trim(), color: hex(r.route_color) || PALETTE[i % PALETTE.length], text: hex(r.route_text_color), type: +r.route_type, trips: [], dirs: [], stops: new Set(), idx: i++ });
    }

    const trips = new Map();
    for (const tr of t.trips) {
      const r = routes.get(tr.route_id);
      if (!r) continue;
      const o = { id: tr.trip_id, route: r, service: tr.service_id, shape: tr.shape_id || '', dir: (tr.direction_id || '0').trim() || '0', head: (tr.trip_headsign || '').trim(), block: (tr.block_id || '').trim(), st: [], freq: null, first: null };
      trips.set(tr.trip_id, o);
      r.trips.push(o);
    }

    for (const x of t.stop_times) {
      const tr = trips.get(x.trip_id);
      if (!tr) continue;
      const a = toSec(x.arrival_time), d = toSec(x.departure_time);
      tr.st.push({ stop: x.stop_id, seq: +x.stop_sequence, arr: a != null ? a : d, dep: d != null ? d : a });
    }

    for (const f of t.frequencies || []) {
      const tr = trips.get(f.trip_id);
      const hw = +f.headway_secs;
      if (!tr || !(hw > 0)) continue;
      (tr.freq || (tr.freq = [])).push({ start: toSec(f.start_time), end: toSec(f.end_time), hw });
    }

    const shapes = new Map();
    for (const p of t.shapes || []) {
      let a = shapes.get(p.shape_id);
      if (!a) shapes.set(p.shape_id, a = []);
      a.push([+p.shape_pt_sequence, +p.shape_pt_lat, +p.shape_pt_lon]);
    }
    for (const a of shapes.values()) a.sort((x, y) => x[0] - y[0]);

    let nTrips = 0;
    for (const tr of trips.values()) {
      tr.st.sort((a, b) => a.seq - b.seq);
      tr.st = tr.st.filter(x => stops.has(x.stop));
      if (!tr.st.length) continue;
      interpolate(tr.st);
      nTrips++;
      const f0 = tr.st.find(x => x.dep != null);
      tr.first = f0 ? f0.dep : null;
      if (!tr.head) tr.head = stops.get(tr.st[tr.st.length - 1].stop).name;
      const lastIdx = tr.st.length - 1;
      tr.st.forEach((x, i) => {
        const s = stops.get(x.stop);
        s.routes.add(tr.route);
        tr.route.stops.add(s);
        if (x.dep != null && i < lastIdx) s.deps.push([tr, x.dep]);
      });
    }

    const blocks = new Map();
    for (const tr of trips.values()) if (tr.block && !tr.freq && tr.st.length > 1) {
      const k = tr.service + '|' + tr.block;
      (blocks.get(k) || blocks.set(k, []).get(k)).push(tr);
    }
    for (const a of blocks.values()) {
      a.sort((x, y) => x.st[0].dep - y.st[0].dep);
      for (let i = 1; i < a.length; i++) {
        const p = a[i - 1], q = a[i], e = p.st[p.st.length - 1], g = q.st[0].dep - e.arr;
        if (p.route === q.route && p.dir === q.dir && e.stop === q.st[0].stop && g >= 0 && g <= STAY) { p.next = q; q.prev = p; }
      }
    }
    for (const tr of trips.values()) if (tr.next && !tr.prev) for (let x = tr; x; x = x.next) x.chain = tr.id;

    for (const [id, r] of routes) {
      const byDir = new Map();
      for (const tr of r.trips) {
        if (!tr.st.length) continue;
        const cur = byDir.get(tr.dir);
        if (!cur || tr.st.length > cur.st.length || (tr.st.length === cur.st.length && tr.shape && !cur.shape)) byDir.set(tr.dir, tr);
      }
      r.dirs = [...byDir.keys()].sort().map(d => {
        const tr = byDir.get(d);
        const sh = tr.shape && shapes.get(tr.shape);
        const st = tr.st.map(x => stops.get(x.stop));
        return { dir: d, head: tr.head, stops: st, line: sh && sh.length > 1 ? sh.map(p => [p[1], p[2]]) : st.map(s => [s.lat, s.lon]) };
      });
      if (!r.dirs.length) routes.delete(id);
    }
    for (const [id, s] of stops) if (!s.routes.size) stops.delete(id);

    const cal = new Map();
    for (const c of t.calendar || []) cal.set(c.service_id, c);
    const ex = new Map();
    for (const d of t.calendar_dates || []) ex.set(d.service_id + '|' + (d.date || '').trim(), (d.exception_type || '').trim());

    let from = null, to = null;
    const fi = t.feed_info && t.feed_info[0];
    if (fi && fi.feed_start_date) { from = fi.feed_start_date; to = fi.feed_end_date || null; }
    else {
      for (const c of cal.values()) {
        if (!from || c.start_date < from) from = c.start_date;
        if (!to || c.end_date > to) to = c.end_date;
      }
    }
    return { tz, agencies, stops, routes, trips, cal, ex, from, to, version: (fi && fi.feed_version || '').trim(), nTrips, shapes, hasShapes: shapes.size > 0, hasFreq: !!(t.frequencies && t.frequencies.length) };
  }

  function interpolate(st) {
    let last = -1;
    for (let k = 0; k < st.length; k++) {
      if (st[k].dep == null) continue;
      if (last >= 0 && k - last > 1) {
        const t0 = st[last].dep, t1 = st[k].arr;
        for (let m = last + 1; m < k; m++) st[m].arr = st[m].dep = Math.round(t0 + (t1 - t0) * (m - last) / (k - last));
      }
      last = k;
    }
  }

  function active(f, sid, ymd, wd) {
    const e = f.ex.get(sid + '|' + ymd);
    if (e === '1') return true;
    if (e === '2') return false;
    const c = f.cal.get(sid);
    return !!c && c.start_date <= ymd && ymd <= c.end_date && (c[WD[wd]] || '').trim() === '1';
  }

  function validity(f, ymd, soon = 30) {
    const day = s => Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)) / 864e5;
    if (f.from && ymd < f.from) return { state: 'future', days: day(f.from) - day(ymd) };
    if (!f.to) return { state: 'ok', days: null };
    const days = day(f.to) - day(ymd);
    return { state: days < 0 ? 'expired' : days <= soon ? 'soon' : 'ok', days };
  }

  function clock(tz, d = new Date()) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]));
    return { ymd: p.year + p.month + p.day, wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday), sec: +p.hour * 3600 + +p.minute * 60 + +p.second };
  }

  function prevDay(ymd, wd) {
    const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)) - 864e5);
    return { ymd: d.toISOString().slice(0, 10).replace(/-/g, ''), wd: (wd + 6) % 7 };
  }

  function departures(f, stop, now, n = 8, horizon = 3 * 3600) {
    const days = [{ ymd: now.ymd, wd: now.wd, off: 0 }, { ...prevDay(now.ymd, now.wd), off: 86400 }, { ...nextDay(now.ymd, now.wd), off: -86400 }];
    const memo = new Map();
    const act = (sid, d) => {
      const k = sid + '|' + d.ymd;
      if (!memo.has(k)) memo.set(k, active(f, sid, d.ymd, d.wd));
      return memo.get(k);
    };
    const out = [];
    for (const [tr, dep] of stop.deps) {
      for (const d of days) {
        if (!act(tr.service, d)) continue;
        const base = now.sec + d.off, lim = base + horizon;
        if (tr.freq && tr.first != null) {
          const off = dep - tr.first;
          for (const fq of tr.freq) {
            if (fq.start == null || fq.end == null) continue;
            let t0 = fq.start + off;
            if (t0 < base) t0 += Math.ceil((base - t0) / fq.hw) * fq.hw;
            for (let t = t0; t < lim && t - off < fq.end; t += fq.hw) out.push({ t: t - d.off, tr, hw: fq.hw });
          }
        } else if (dep >= base && dep < lim) out.push({ t: dep - d.off, tr });
      }
    }
    out.sort((a, b) => a.t - b.t || a.tr.route.idx - b.tr.route.idx);
    const seen = new Set();
    return out.filter(x => {
      const k = x.t + '|' + x.tr.route.id + '|' + x.tr.head;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, n);
  }


  const WALK_R = 400, WALK_V = 1.25, DETOUR = 1.3, CHANGE = 60, HORIZON = 6 * 3600, SAFE = 180, ACC_K = 2, XFER = 600;

  function dist(a, b) {
    const R = 6371000, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function groupStops(stops, maxD = 300) {
    const byName = new Map(), out = [];
    for (const s of stops) (byName.get(s.name) || byName.set(s.name, []).get(s.name)).push(s);
    for (const [name, list] of byName) {
      const par = list.map((_, i) => i), root = i => par[i] === i ? i : (par[i] = root(par[i]));
      for (let i = 0; i < list.length; i++) for (let j = 0; j < i; j++) if (dist(list[i], list[j]) <= maxD) par[root(i)] = root(j);
      const cl = new Map();
      list.forEach((s, i) => { const r = root(i); (cl.get(r) || cl.set(r, []).get(r)).push(s); });
      const parts = [...cl.values()].sort((a, b) => b.length - a.length || a[0].lat - b[0].lat);
      const street = p => {
        for (const s of p) {
          const m = /\b(blv|bulevardi|rr|rruga|rrug[eë]s|rrug[eë]n)\.?\s*["“]([^"”]+)["”]/i.exec(s.desc || '');
          if (m) return name + ' – ' + (/^b/i.test(m[1]) ? 'Bulevardi ' : 'Rruga ') + m[2].trim();
        }
        return '';
      };
      const lines = p => name + ' (' + [...new Set(p.flatMap(s => [...(s.routes || [])].map(r => r.short)))].sort((a, b) => a.localeCompare(b, 'cs', { numeric: true })).join(', ') + ')';
      let labels = parts.map(p => street(p) || lines(p));
      labels = labels.map((l, i) => labels.indexOf(l) !== labels.lastIndexOf(l) ? lines(parts[i]) : l);
      labels = labels.map((l, i) => labels.indexOf(l) !== labels.lastIndexOf(l) ? name + ' (' + (i + 1) + ')' : l);
      parts.forEach((p, i) => out.push({ name, label: parts.length > 1 ? labels[i] : name, stops: p }));
    }
    return out;
  }

  function walkGraph(f) {
    if (f.walk) return f.walk;
    if (f.walkFn) {
      const W = new Map(), M = f.walkFn([...f.stops.values()], WALK_R * DETOUR);
      for (const s of f.stops.values()) W.set(s.id, (M.get(s.id) || []).filter(([o]) => o !== s).map(([o, m]) => [o, Math.max(30, Math.round(m / WALK_V)), Math.round(m)]));
      return (f.walk = W);
    }
    const cell = 0.005, grid = new Map(), W = new Map();
    const key = (a, b) => a + ':' + b;
    for (const s of f.stops.values()) {
      const k = key(Math.floor(s.lat / cell), Math.floor(s.lon / cell));
      (grid.get(k) || grid.set(k, []).get(k)).push(s);
    }
    for (const s of f.stops.values()) {
      const gy = Math.floor(s.lat / cell), gx = Math.floor(s.lon / cell), out = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        for (const o of grid.get(key(gy + dy, gx + dx)) || []) {
          if (o === s) continue;
          const m = dist(s, o);
          if (m <= WALK_R) out.push([o, Math.max(30, Math.round(m * DETOUR / WALK_V)), Math.round(m * DETOUR)]);
        }
      }
      W.set(s.id, out);
    }
    return (f.walk = W);
  }

  function nextDay(ymd, wd) {
    const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)) + 864e5);
    return { ymd: d.toISOString().slice(0, 10).replace(/-/g, ''), wd: (wd + 1) % 7 };
  }

  function connections(f, day, from, until) {
    const days = [{ ...prevDay(day.ymd, day.wd), off: -86400 }, { ymd: day.ymd, wd: day.wd, off: 0 }, { ...nextDay(day.ymd, day.wd), off: 86400 }];
    const memo = new Map(), out = [];
    const act = (sid, d) => {
      const k = sid + '|' + d.ymd;
      if (!memo.has(k)) memo.set(k, active(f, sid, d.ymd, d.wd));
      return memo.get(k);
    };
    for (const tr of f.trips.values()) {
      const st = tr.st, n = st.length;
      if (n < 2 || tr.first == null) continue;
      const tFirst = st[0].dep, tLast = st[n - 1].arr;
      if (tFirst == null || tLast == null) continue;
      for (const d of days) {
        if (!act(tr.service, d)) continue;
        const shifts = [];
        if (tr.freq) {
          for (const fq of tr.freq) {
            if (fq.start == null || fq.end == null) continue;
            for (let t = fq.start; t < fq.end; t += fq.hw) shifts.push(t - tr.first);
          }
        } else shifts.push(0);
        for (const sh of shifts) {
          const base = d.off + sh;
          if (tLast + base < from || tFirst + base > until) continue;
          const id = tr.id + '@' + d.ymd + '@' + sh;
          const inst = { tr, base, id, rid: tr.chain && !tr.freq ? tr.chain + '@' + d.ymd : id };
          for (let k = 0; k < n - 1; k++) {
            const a = st[k], b = st[k + 1];
            if (a.dep == null || b.arr == null) continue;
            const dep = a.dep + base;
            if (dep < from) continue;
            if (dep > until) break;
            out.push({ dep, arr: b.arr + base, from: a.stop, to: b.stop, inst, k });
          }
        }
      }
    }
    out.sort((x, y) => x.dep - y.dep || x.arr - y.arr);
    return out;
  }

  const MAXR = 5;

  function tidy(f, W, legs, tEnd, org, dst) {
    for (let i = 0; i < legs.length; i++) {
      const w = legs[i];
      if (w.kind !== 'walk') continue;
      const A = legs[i - 1], B = legs[i + 1];
      const sa = A && A.inst.tr.st, sb = B && B.inst.tr.st;
      const xs = A ? sa.map((x, e) => e).filter(e => e > A.k0 && sa[e].arr != null) : org;
      const ys = B ? sb.map((x, b) => b).filter(b => b < B.k1 && sb[b].dep != null) : dst;
      let best = null, orig = null;
      const worse = (p, q) => (p.sl < SAFE) - (q.sl < SAFE) || p.m - q.m;
      for (const e of xs) {
        const X = A ? sa[e].stop : e, tX = A ? sa[e].arr + A.inst.base : -Infinity;
        const near = new Map((W.get(X) || []).map(([o, s2, m]) => [o.id, [s2, m]]));
        for (const b of ys) {
          const Y = B ? sb[b].stop : b, tY = B ? sb[b].dep + B.inst.base : Infinity;
          if (A && B && A.inst === B.inst) continue;
          const v = X === Y ? [A && B ? CHANGE : 0, 0] : near.get(Y);
          if (!v || tX + v[0] > tY || (!B && tX + v[0] > tEnd)) continue;
          const cand = { e, b, X, Y, tX, s: v[0], m: v[1], sl: B ? tY - tX - v[0] : Infinity };
          if (X === w.from.id && Y === w.to.id && (!A || e === A.k1) && (!B || b === B.k0)) orig = cand;
          if (!best || worse(cand, best) < 0) best = cand;
        }
      }
      if (!best || best === orig || (orig ? worse(best, orig) >= 0 : best.m >= w.m)) continue;
      if (A) { A.k1 = best.e; A.to = f.stops.get(best.X); A.arr = best.tX; }
      if (B) { B.k0 = best.b; B.from = f.stops.get(best.Y); B.dep = sb[best.b].dep + B.inst.base; }
      if (best.X === best.Y) { legs.splice(i, 1); i--; continue; }
      Object.assign(w, { from: f.stops.get(best.X), to: f.stops.get(best.Y), m: best.m, dep: A ? best.tX : w.dep, arr: A ? best.tX + best.s : w.arr });
      if (!A) w.dep = w.arr - best.s;
    }
  }

  function span(f, enter, exit) {
    if (enter.inst === exit.inst) return [enter.inst, exit.k + 1];
    const st = [];
    let pts = [], k1 = 0;
    for (let tr = enter.inst.tr; tr; tr = tr.next) {
      const off = st.length ? st.length - 1 : 0;
      if (st.length) st[off] = { ...st[off], dep: tr.st[0].dep };
      st.push(...(st.length ? tr.st.slice(1) : tr.st));
      const sh = tr.shape && f.shapes.get(tr.shape);
      pts = pts && sh ? pts.concat(sh) : null;
      if (tr === exit.inst.tr) { k1 = off + exit.k + 1; break; }
    }
    const tr = exit.inst.tr;
    return [{ tr: { ...enter.inst.tr, st, head: tr.head, pts }, base: enter.inst.base, id: enter.inst.id }, k1];
  }

  function scan(f, conns, fromStops, toSet, t0, acc) {
    const W = walkGraph(f), INF = Infinity;
    const eg = id => acc && acc.d.has(id) ? acc.d.get(id).w * ACC_K : 0;
    const arr = [], board = [], J = [], T = [], RA = [];
    for (let k = 0; k <= MAXR; k++) { arr.push(new Map()); board.push(new Map()); J.push(new Map()); T.push(new Map()); RA.push(new Map()); }
    let best = INF;
    const get = (m, id) => m.has(id) ? m.get(id) : INF;
    const reach = (k, id, t, b, j) => {
      let hit = false;
      for (let kk = k; kk <= MAXR; kk++) {
        if (t >= get(arr[kk], id)) continue;
        arr[kk].set(id, t); board[kk].set(id, b); J[kk].set(id, j); hit = true;
      }
      if (hit && toSet.has(id) && !(acc && j.kind === 'origin') && t + eg(id) < best) best = t + eg(id);
      return hit;
    };
    for (const s of fromStops) { const w = acc && acc.o.has(s.id) ? acc.o.get(s.id).w : 0; reach(0, s.id, t0 + w, t0 + w, { kind: 'origin' }); }
    if (!acc) for (const s of fromStops) for (const [o, w, m] of W.get(s.id) || []) reach(0, o.id, t0 + w, t0 + w, { kind: 'walk', k: 0, from: s.id, to: o.id, dep: t0, arr: t0 + w, m });
    let lo = 0, hi = conns.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (conns[mid].dep < t0) lo = mid + 1; else hi = mid; }
    for (let i = lo; i < conns.length; i++) {
      const c = conns[i];
      if (c.dep >= best) break;
      let kmin = 0, enter = null;
      for (let k = 1; k <= MAXR; k++) {
        let e = T[k].get(c.inst.rid);
        if (!e && get(board[k - 1], c.from) <= c.dep) {
          const prev = J[k - 1].get(c.from);
          if (!(prev && prev.kind === 'ride' && prev.enter.inst.tr.route === c.inst.tr.route && prev.enter.inst.tr.dir !== c.inst.tr.dir)) { e = c; T[k].set(c.inst.rid, c); }
        }
        if (e && !kmin) { kmin = k; enter = e; }
      }
      if (!kmin) continue;
      const jr = { kind: 'ride', k: kmin, enter, exit: c };
      reach(kmin, c.to, c.arr, c.arr + CHANGE, jr);
      if (c.arr < get(RA[kmin], c.to)) {
        for (let kk = kmin; kk <= MAXR; kk++) if (c.arr < get(RA[kk], c.to)) RA[kk].set(c.to, c.arr);
        for (const [o, w, m] of W.get(c.to) || []) reach(kmin, o.id, c.arr + w, c.arr + w, { kind: 'walk', k: kmin, from: c.to, to: o.id, dep: c.arr, arr: c.arr + w, m, prev: jr });
      }
    }
    const out = [];
    let prevBest = INF;
    for (let k = 0; k <= MAXR; k++) {
      let bk = INF, bs = null;
      for (const id of toSet) { if (acc && J[k].has(id) && J[k].get(id).kind === 'origin') continue; const t = get(arr[k], id) + eg(id); if (t < bk) { bk = t; bs = id; } }
      if (!bs || bk >= prevBest) continue;
      prevBest = bk;
      if (acc && !k) continue;
      const legs = [];
      let p = bs, lvl = k, guard = 0, nx = null;
      while (guard++ < 100) {
        const j = nx || J[lvl].get(p);
        nx = null;
        if (!j || j.kind === 'origin') break;
        if (j.kind === 'ride') {
          const [inst, k1] = span(f, j.enter, j.exit);
          legs.unshift({ kind: 'ride', inst, route: inst.tr.route, head: inst.tr.head, from: f.stops.get(j.enter.from), to: f.stops.get(j.exit.to), dep: j.enter.dep, arr: j.exit.arr, k0: j.enter.k, k1 });
          p = j.enter.from; lvl = j.k - 1;
        } else {
          legs.unshift({ kind: 'walk', from: f.stops.get(j.from), to: f.stops.get(j.to), dep: j.dep, arr: j.arr, m: j.m });
          p = j.from; lvl = j.k; nx = j.prev || null;
        }
      }
      tidy(f, W, legs, bk - eg(bs), acc ? [p] : fromStops.map(s => s.id), acc ? [bs] : [...toSet]);
      if (acc) {
        const a = acc.o.get(p), e = acc.d.get(bs), last = legs[legs.length - 1];
        if (a && a.m >= 25) legs.unshift({ kind: 'walk', from: acc.op, to: legs[0].from, dep: legs[0].dep - a.w, arr: legs[0].dep, m: a.m, acc: 1 });
        if (e && e.m < 25) last.arr += e.w;
        else if (e && last.kind === 'walk') Object.assign(last, { to: acc.dp, arr: last.arr + e.w, m: last.m + e.m, acc: 1 });
        else if (e) legs.push({ kind: 'walk', from: last.to, to: acc.dp, dep: last.arr, arr: last.arr + e.w, m: e.m, acc: 1 });
      }
      if (legs.length > 1 && legs[0].kind === 'walk' && legs[1].kind === 'ride') {
        const w = legs[0].arr - legs[0].dep;
        legs[0].arr = legs[1].dep; legs[0].dep = legs[1].dep - w;
      }
      const rides = legs.filter(l => l.kind === 'ride').length;
      out.push({
        origin: legs.length ? legs[0].from : f.stops.get(p), dest: legs.length ? legs[legs.length - 1].to : f.stops.get(bs), legs,
        dep: legs.length ? legs[0].dep : t0, arr: acc ? legs[legs.length - 1].arr : bk, cost: bk,
        rides, transfers: Math.max(0, rides - 1),
        walkM: legs.filter(l => l.kind === 'walk').reduce((s, l) => s + l.m, 0)
      });
    }
    return out;
  }

  function plan(f, fromStops, toStops, day, t0, n = 5, acc) {
    const toSet = new Set(toStops.map(s => s.id));
    if (!acc && fromStops.some(s => toSet.has(s.id))) return { same: true, list: [] };
    const conns = connections(f, day, t0, t0 + HORIZON);
    const all = [], seen = new Set();
    let t = t0;
    for (let i = 0; i < 8; i++) {
      const js = scan(f, conns, fromStops, toSet, t, acc);
      if (!js.length) break;
      for (const j of js) {
        const sig = j.legs.map(l => l.kind === 'ride' ? l.inst.id + ':' + l.from.id + '>' + l.to.id : 'w').join('|');
        if (!seen.has(sig)) { seen.add(sig); all.push(j); }
      }
      if (!js.some(j => j.rides)) break;
      const nt = Math.min(...js.filter(j => j.rides).map(j => j.dep)) + 60;
      t = Math.max(t + 60, nt);
      if (new Set(all.map(j => j.dep)).size >= n) break;
    }
    if (acc && acc.walk) all.push({ origin: acc.op, dest: acc.dp, legs: [{ kind: 'walk', from: acc.op, to: acc.dp, dep: t0, arr: t0 + acc.walk.w, m: acc.walk.m, acc: 1 }], dep: t0, arr: t0 + acc.walk.w, cost: t0 + acc.walk.w, rides: 0, transfers: 0, walkM: acc.walk.m });
    const dom = (b, a) => b.dep >= a.dep && (b.cost <= a.cost && b.transfers <= a.transfers && (b.dep > a.dep || b.cost < a.cost || b.transfers < a.transfers) ||
      !!acc && b.transfers < a.transfers && b.cost + XFER * b.transfers <= a.cost + XFER * a.transfers);
    const kept = all.filter(a => !all.some(b => b !== a && dom(b, a)) && !(acc && acc.walk && a.rides && a.arr > t0 + acc.walk.w + 900));
    kept.sort((x, y) => (acc ? Math.floor(x.dep / 60) - Math.floor(y.dep / 60) : x.dep - y.dep) || x.cost - y.cost || x.arr - y.arr || x.transfers - y.transfers);
    return { same: false, list: kept.slice(0, n), nConns: conns.length };
  }

  function legPath(f, leg) {
    const st = leg.inst.tr.st.slice(leg.k0, leg.k1 + 1).map(x => f.stops.get(x.stop));
    const sh = leg.inst.tr.pts || (leg.inst.tr.shape && f.shapes.get(leg.inst.tr.shape));
    if (!sh || sh.length < 2) return st.map(s => [s.lat, s.lon]);
    const near = (s, from) => {
      let bi = from, bd = Infinity;
      for (let i = from; i < sh.length; i++) {
        const d = (sh[i][1] - s.lat) ** 2 + ((sh[i][2] - s.lon) * 0.75) ** 2;
        if (d < bd) { bd = d; bi = i; }
      }
      return bi;
    };
    const i0 = near(st[0], 0), i1 = near(st[st.length - 1], i0);
    if (i1 <= i0) return st.map(s => [s.lat, s.lon]);
    return [[st[0].lat, st[0].lon], ...sh.slice(i0, i1 + 1).map(p => [p[1], p[2]]), [st[st.length - 1].lat, st[st.length - 1].lon]];
  }

  const hhmm = s => {
    s = ((s % 86400) + 86400) % 86400;
    return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0');
  };

  const IDS = {
    agency: ['agency_id'], stops: ['stop_id', 'parent_station'], routes: ['route_id', 'agency_id'],
    trips: ['route_id', 'service_id', 'trip_id', 'shape_id'], stop_times: ['trip_id', 'stop_id'],
    calendar: ['service_id'], calendar_dates: ['service_id'], frequencies: ['trip_id'], shapes: ['shape_id']
  };
  function merge(base, extra, prefix) {
    const out = { ...base };
    for (const [name, rows] of Object.entries(extra)) {
      if (!IDS[name]) continue;
      const mapped = rows.map(r => {
        const o = { ...r };
        for (const col of IDS[name]) if (o[col]) o[col] = prefix + o[col];
        return o;
      });
      out[name] = (base[name] || []).concat(mapped);
    }
    return out;
  }

  const FILES = ['agency', 'stops', 'routes', 'trips', 'stop_times', 'calendar', 'calendar_dates', 'frequencies', 'shapes', 'feed_info'];

  async function readZip(zip, parse) {
    const t = {};
    for (const n of FILES) {
      const f = zip.file(n + '.txt') || zip.file(new RegExp('(^|/)' + n + '\\.txt$'))[0];
      if (!f) continue;
      const txt = (await f.async('string')).replace(/^﻿/, '');
      t[n] = parse(txt);
    }
    return t;
  }

  return { build, departures, clock, hhmm, readZip, toSec, plan, legPath, nextDay, walkGraph, merge, groupStops, validity };
})();
if (typeof module !== 'undefined') module.exports = GTFS;
