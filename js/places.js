// Rozšířené vyhledávání: místa a ulice z data/poi.json (OSM), pěší docházka na zastávky. Bez DOM.
const Places = (() => {
  const RANK = { gov: 1, health: 1, edu: 1, air: 1, bus: 1, sight: 2, museum: 2, worship: 2, park: 2, square: 3, street: 3, area: 3, sport: 4, culture: 4, fun: 4, hotel: 4, food: 4, shop: 4 };
  const NEAR = 500, FAR = 1500, WALK_V = 1.25, DETOUR = 1.3, CELL = 0.002, SNAP = 400;

  // Hledání podle druhu místa: klíčem je hodnota tagu OSM, slova ve všech jazycích aplikace.
  const KW = [
    ['fitness_centre', 'fitness gym posilovna fitko palestra fitnessstudio silownia salle sport gimnasio spor salonu фитнес спортзал γυμναστήριο теретана'],
    ['swimming_pool', 'bazen pool swimming pishina piscina schwimmbad hallenbad basen piscine havuz бассейн πισινα базен'],
    ['casino', 'kasino casino casinò kazino kasyno казино καζινο kumarhane'],
    ['nightclub', 'klub club diskoteka disco nightclub klubi nate discoteca nachtklub disko gece kulubu ночной клуб νυχτερινο'],
    ['playground indoor_play', 'hriste detske herna playground kids deti lojrash parco giochi spielplatz plac zabaw aire jeux parque infantil oyun alani детская площадка παιδικη χαρα'],
    ['amusement_arcade internet_cafe escape_game', 'herna hry games gaming arcade lojra sala giochi spielhalle salon gier salle jeux salon juegos oyun salonu игровой παιχνιδια'],
    ['trampoline_park', 'trampolina trampoline trampolin trampolino trambolin батут τραμπολινο zabava'],
    ['bowling_alley', 'bowling kuzelky kegeln kregle боулинг μπολινγκ'],
    ['adventure_park miniature_golf', 'lanovy park adventure golf avventura abenteuer przygoda aventure aventura macera'],
    ['pitch sports_hall stadium sports_centre track club ice_rink', 'sportoviste hriste sport stadion stadium fushe sporti campo sportplatz boisko terrain cancha saha спорт σταδιο'],
    ['hospital clinic', 'nemocnice klinika hospital spital spitali ospedale krankenhaus szpital hopital hastane больница νοσοκομειο болница'],
    ['university college', 'univerzita vysoka skola university universitet universiteti universita universitat uniwersytet universite universidad universite университет πανεπιστημιο'],
    ['school', 'skola school shkolla scuola schule szkola ecole escuela okul школа σχολειο училиште'],
    ['mall department_store building', 'nakupni centrum obchodni mall shopping center centre qender tregtare centro commerciale einkaufszentrum galeria handlowa comercial avm торговый центр εμπορικο κεντρο'],
    ['supermarket marketplace', 'supermarket trh market tregu mercato markt targ marche mercado pazar рынок супермаркет αγορα'],
    ['cinema', 'kino cinema kinema cine sinema кино σινεμα'],
    ['theatre', 'divadlo theatre theater teatri teatro teatr theatre tiyatro театр θεατρο театар'],
    ['museum gallery', 'muzeum museum muze muzeu museo musee galerie gallery galeria müze музей μουσειο'],
    ['park garden', 'park parku parco parque парк παρκο'],
    ['place_of_worship', 'kostel mesita chram church mosque kisha xhamia chiesa moschea kirche moschee kosciol meczet eglise mosquee iglesia mezquita kilise cami церковь мечеть εκκλησια τζαμι'],
    ['embassy', 'ambasada velvyslanectvi embassy ambasciata botschaft ambassade embajada buyukelcilik посольство πρεσβεια'],
    ['police', 'policie police policia polizia polizei policja polis полиция αστυνομια'],
    ['post_office', 'posta post poczta poste correos postane почта ταχυδρομειο'],
    ['restaurant', 'restaurace restaurant restorant ristorante restauracja restaurante restoran ресторан εστιατοριο'],
    ['hotel hostel guest_house motel resort camp_site', 'hotel hostel ubytovani hoteli albergo unterkunft nocleg hebergement alojamiento otel отель гостиница ξενοδοχειο кемп camping kemp'],
    ['events_venue conference_centre exhibition_centre', 'akce event sal salla eventi veranstaltung wydarzenia evenement eventos etkinlik мероприятия εκδηλωσεις konference conference'],
    ['aerodrome', 'letiste airport aeroport aeroporti aeroporto flughafen lotnisko aeropuerto havalimani аэропорт αεροδρομιο аеродром']
  ];
  const KWM = new Map();

  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

  function dist(a, b) {
    const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos((a[0] + b[0]) / 2 * r), y = (b[0] - a[0]) * r;
    return Math.sqrt(x * x + y * y) * 6371000;
  }

  function build(db) {
    if (!KWM.size) for (const [ks, w] of KW) for (const k of ks.split(' ')) KWM.set(k, norm(w).split(' '));
    const items = [];
    const add = (n, c, k, pts, t, a, id) => {
      const vs = [n, ...Object.values(t || {}), ...(a || [])].map(norm).filter(Boolean);
      items.push({ id, n, c, pts, t: t || {}, a: a || [], kw: KWM.get(k) || [], vs: [...new Set(vs)].map(v => [v, v.split(' ')]) });
    };
    (db.p || []).forEach((p, i) => add(p[0], p[1], p[2], [[p[3], p[4]]], p[5], p[6], 'p' + i));
    (db.s || []).forEach((s, i) => add(s[0], s[1], '', s[2], s[3], s[4], 's' + i));
    return { items, v: db.v };
  }

  function near1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; }
      else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }

  function score(it, q, qt) {
    let best = 9;
    for (const [v, vt] of it.vs) {
      if (v === q) return 0;
      if (v.startsWith(q)) { best = Math.min(best, 1); continue; }
      let fuzzy = false, ok = true;
      for (const w of qt) {
        if (vt.some(x => x.startsWith(w))) continue;
        if (w.length >= 5 && vt.some(x => x[0] === w[0] && (near1(w, x) || (x.length > w.length && near1(w, x.slice(0, w.length)))))) { fuzzy = true; continue; }
        ok = false; break;
      }
      if (ok) best = Math.min(best, fuzzy ? 3.5 : 2);
    }
    if (best > 3 && it.kw.length && qt.every(w => w.length >= 3 && it.kw.some(x => x.startsWith(w)))) best = 3;
    return best;
  }

  function search(idx, text, lang, n = 5) {
    const q = norm(text);
    if (!idx || q.length < 2) return [];
    const qt = q.split(' ');
    const hits = [];
    for (const it of idx.items) {
      const s = score(it, q, qt);
      if (s < 9) hits.push([s, RANK[it.c] || 5, it]);
    }
    hits.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2].n.length - b[2].n.length);
    const out = [], seen = new Set();
    for (const [, , it] of hits) {
      const k = norm(label(it, lang)) + '|' + it.c;
      if (seen.has(k)) continue;
      seen.add(k); out.push(it);
      if (out.length >= n) break;
    }
    return out;
  }

  const label = (it, lang) => (lang !== 'sq' && it.t[lang]) || it.n;

  function net(d) {
    const n = d.a.length, lat = new Float64Array(n), lon = new Float64Array(n), grid = new Map();
    for (let i = 0, x = 0, y = 0; i < n; i++) {
      x += d.a[i]; y += d.o[i]; lat[i] = x / 1e5; lon[i] = y / 1e5;
      const k = Math.floor(lat[i] / CELL) + ':' + Math.floor(lon[i] / CELL);
      (grid.get(k) || grid.set(k, []).get(k)).push(i);
    }
    const m = d.e.length, A = new Int32Array(m), B = new Int32Array(m), st = new Int32Array(n + 1);
    for (let i = 0, a = 0; i < m; i++) { a += d.e[i]; A[i] = a; B[i] = a + d.f[i]; st[A[i] + 1]++; st[B[i] + 1]++; }
    for (let i = 0; i < n; i++) st[i + 1] += st[i];
    const nb = new Int32Array(2 * m), ln = new Float32Array(2 * m), fill = st.slice(0, n);
    for (let i = 0; i < m; i++) {
      const l = dist([lat[A[i]], lon[A[i]]], [lat[B[i]], lon[B[i]]]);
      nb[fill[A[i]]] = B[i]; ln[fill[A[i]]++] = l;
      nb[fill[B[i]]] = A[i]; ln[fill[B[i]]++] = l;
    }
    return { n, lat, lon, st, nb, ln, grid, sc: new Map() };
  }

  function snap(N, p) {
    const gy = Math.floor(p[0] / CELL), gx = Math.floor(p[1] / CELL);
    let bi = -1, bd = SNAP;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) for (const i of N.grid.get((gy + dy) + ':' + (gx + dx)) || []) {
      const d = dist(p, [N.lat[i], N.lon[i]]);
      if (d < bd) { bd = d; bi = i; }
    }
    return bi < 0 ? null : [bi, bd];
  }

  function spread(N, src, limit, P) {
    const D = N.D || (N.D = new Float64Array(N.n).fill(Infinity)), H = [];
    for (const v of N.T || []) D[v] = Infinity;
    const T = N.T = [];
    const push = (d, v) => { H.push([d, v]); let i = H.length - 1; while (i) { const q = (i - 1) >> 1; if (H[q][0] <= H[i][0]) break; [H[q], H[i]] = [H[i], H[q]]; i = q; } };
    const pop = () => {
      const top = H[0], last = H.pop();
      if (H.length) {
        H[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let k = i;
          if (l < H.length && H[l][0] < H[k][0]) k = l;
          if (r < H.length && H[r][0] < H[k][0]) k = r;
          if (k === i) break;
          [H[k], H[i]] = [H[i], H[k]]; i = k;
        }
      }
      return top;
    };
    for (const [v, d] of src) if (d < D[v]) { D[v] = d; T.push(v); push(d, v); }
    while (H.length) {
      const [d, v] = pop();
      if (d > D[v] || d > limit) continue;
      for (let e = N.st[v]; e < N.st[v + 1]; e++) {
        const o = N.nb[e], nd = d + N.ln[e];
        if (nd < D[o] && nd <= limit) { if (D[o] === Infinity) T.push(o); D[o] = nd; if (P) P[o] = v; push(nd, o); }
      }
    }
    return D;
  }

  function stopSnap(N, s) {
    let c = N.sc.get(s.id);
    if (!c || c.lat !== s.lat || c.lon !== s.lon) { c = { lat: s.lat, lon: s.lon, v: snap(N, [s.lat, s.lon]) }; N.sc.set(s.id, c); }
    return c.v;
  }

  function access(stops, pts, N) {
    const src = N ? pts.map(p => snap(N, p)).filter(Boolean) : [];
    const D = src.length ? spread(N, src, FAR) : null;
    const all = [];
    for (const s of stops) {
      let air = Infinity;
      for (const p of pts) air = Math.min(air, dist(p, [s.lat, s.lon]));
      if (air > FAR) continue;
      let m = air * DETOUR;
      if (D && air > 30) {
        const v = stopSnap(N, s);
        m = v ? D[v[0]] + v[1] : Infinity;
      }
      if (m <= FAR) all.push([s, m]);
    }
    all.sort((a, b) => a[1] - b[1]);
    const near = all.filter(x => x[1] <= NEAR);
    const pick = (near.length ? near : all.slice(0, 3)).slice(0, 16);
    return pick.map(([s, m]) => ({ s, w: Math.max(30, Math.round(m / WALK_V)), m: Math.round(m) }));
  }

  function between(N, a, b, limit) {
    const air = dist(a, b);
    if (air > limit) return null;
    const sa = N && snap(N, a), sb = N && snap(N, b);
    if (!sa || !sb || air <= 30) return air * DETOUR <= limit ? air * DETOUR : null;
    const m = spread(N, [sa], limit)[sb[0]] + sb[1];
    return m <= limit ? m : null;
  }

  function route(N, a, b) {
    const sa = N && snap(N, a), sb = N && snap(N, b);
    if (!sa || !sb) return [a, b];
    const P = new Int32Array(N.n).fill(-1), D = spread(N, [sa], 4000, P), out = [b];
    if (D[sb[0]] === Infinity) return [a, b];
    for (let v = sb[0]; v >= 0; v = v === sa[0] ? -1 : P[v]) out.push([N.lat[v], N.lon[v]]);
    out.push(a);
    return out.reverse();
  }

  function stopWalks(N, stops, limit) {
    const out = new Map(), grid = new Map(), key = (a, b) => a + ':' + b;
    for (const s of stops) {
      const k = key(Math.floor(s.lat / CELL), Math.floor(s.lon / CELL));
      (grid.get(k) || grid.set(k, []).get(k)).push(s);
    }
    const r = Math.ceil(limit / 160);
    for (const s of stops) {
      const gy = Math.floor(s.lat / CELL), gx = Math.floor(s.lon / CELL), near = [];
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) for (const o of grid.get(key(gy + dy, gx + dx)) || []) {
        if (o !== s && dist([s.lat, s.lon], [o.lat, o.lon]) <= limit) near.push(o);
      }
      const a = near.length && stopSnap(N, s), list = [];
      const D = a && a[1] < limit ? spread(N, [[a[0], a[1]]], limit) : null;
      for (const o of near) {
        const air = dist([s.lat, s.lon], [o.lat, o.lon]), b = D && stopSnap(N, o);
        const m = air <= 30 || !b ? air * DETOUR : D[b[0]] + b[1];
        if (m <= limit) list.push([o, m]);
      }
      out.set(s.id, list);
    }
    return out;
  }

  function center(it) {
    if (it.pts.length === 1) return it.pts[0];
    const c = [it.pts.reduce((a, p) => a + p[0], 0) / it.pts.length, it.pts.reduce((a, p) => a + p[1], 0) / it.pts.length];
    return it.pts.reduce((b, p) => dist(p, c) < dist(b, c) ? p : b, it.pts[0]);
  }

  const AREA = { s: 41.22, w: 19.62, n: 41.46, e: 20.02 };
  const MAX_ACC = 1500;
  const valid = p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180 && !(p[0] === 0 && p[1] === 0);
  const inArea = (p, a = AREA) => valid(p) && p[0] >= a.s && p[0] <= a.n && p[1] >= a.w && p[1] <= a.e;

  function locate(p, acc, a = AREA) {
    if (!valid(p)) return 'invalid';
    if (!inArea(p, a)) return 'outside';
    if (acc != null && !(acc <= MAX_ACC)) return 'inaccurate';
    return 'ok';
  }

  function nearest(stops, p, n = 5, key = s => s.id) {
    const best = new Map();
    for (const s of stops) {
      if (!valid([s.lat, s.lon])) continue;
      const d = dist(p, [s.lat, s.lon]), k = key(s), b = best.get(k);
      if (!b || d < b.d) best.set(k, { s, d });
    }
    return [...best.values()].sort((a, b) => a.d - b.d).slice(0, n);
  }

  const SLOTS = ['home', 'work', 'school'];
  const KINDS = ['stop', 'place', 'gps', 'map'];
  const ICONS = ['house', 'briefcase-business', 'graduation-cap', 'building-2', 'shopping-cart', 'shopping-bag', 'utensils', 'coffee', 'heart-pulse', 'dumbbell',
    'landmark', 'plane', 'train-front', 'bus-front', 'car-front', 'map-pin', 'users', 'church', 'tree-pine', 'star'];
  const SLOT_IC = { home: 'house', work: 'briefcase-business', school: 'graduation-cap' };
  const IC_WORDS = [
    ['plane', 'letist airport aeroport rinas'],
    ['house', 'domov doma domu home shtepi chata chalupa'],
    ['briefcase-business', 'prace work job puna kancelar'],
    ['graduation-cap', 'skola skolka school shkoll univerzit universit fakult kolej'],
    ['building-2', 'urad office zyra bashki ministr banka bank posta'],
    ['shopping-cart', 'obchod supermarket market potravin dyqan carrefour spar conad lidl'],
    ['shopping-bag', 'nakup shopping mall qendr'],
    ['utensils', 'restaura restoran jidl obed vecer food lunch dinner pizz'],
    ['coffee', 'kav cafe coffee kafe bar'],
    ['heart-pulse', 'lekar nemocn zdravi doctor hospital klinik spital mjek poliklin farmaci pharmac'],
    ['dumbbell', 'fit gym posilov palestr sport'],
    ['landmark', 'pamat muze museum muzeu monument'],
    ['train-front', 'vlak nadrazi train tren'],
    ['bus-front', 'autobus bus terminal'],
    ['car-front', 'auto car parking parkovist makin garaz'],
    ['users', 'rodin family famil babick dedeck rodic prind mama tata kamarad pratel friend shok gjysh'],
    ['church', 'kostel church kish xhami mosque mesit'],
    ['tree-pine', 'park prirod les nature liqen lake dajti hory zahrad garden'],
    ['star', 'oblib favorit fav']
  ].map(([i, w]) => [i, w.split(' ')]);

  function presets(raw) {
    let o;
    try { o = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { o = null; }
    const out = {};
    if (!o || typeof o !== 'object') return out;
    for (const k of SLOTS) {
      const p = o[k];
      if (!p || typeof p !== 'object') continue;
      const x = { n: typeof p.n === 'string' ? p.n.trim().slice(0, 24) : '' };
      if (KINDS.includes(p.k) && valid([+p.lat, +p.lon])) Object.assign(x, { k: p.k, l: String(p.l || '').slice(0, 80), lat: +p.lat, lon: +p.lon });
      if (ICONS.includes(p.i)) x.i = p.i;
      if (x.n || x.k || x.i) out[k] = x;
    }
    return out;
  }

  function presetHit(name, q) {
    const a = norm(name), b = norm(q);
    return !!b && (a.startsWith(b) || a.split(' ').some(w => w.startsWith(b)));
  }

  function presetIcon(p, slot) {
    if (p && ICONS.includes(p.i)) return p.i;
    const ws = norm(p && p.n || '').split(/[^a-z0-9]+/).filter(Boolean);
    const hit = IC_WORDS.find(([, keys]) => ws.some(w => keys.some(k => w.startsWith(k))));
    return hit ? hit[0] : SLOT_IC[slot] || 'map-pin';
  }

  const POI_MAX = 100;

  function pois(raw) {
    let o;
    try { o = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { o = null; }
    const list = Array.isArray(o) ? o : o && Array.isArray(o.items) ? o.items : [];
    const out = [], ids = new Set();
    for (const p of list) {
      if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !/^[\w-]{1,40}$/.test(p.id) || ids.has(p.id)) continue;
      const n = typeof p.n === 'string' ? p.n.trim().slice(0, 40) : '', pt = [+p.lat, +p.lon];
      if (!n || !inArea(pt)) continue;
      ids.add(p.id);
      out.push({ id: p.id, n, d: typeof p.d === 'string' ? p.d.trim().slice(0, 200) : '', lat: pt[0], lon: pt[1], ts: +p.ts || 0 });
      if (out.length >= POI_MAX) break;
    }
    return out;
  }

  const ROUTE_MAX = 50;

  function routeEnd(p) {
    if (!p || typeof p !== 'object' || !['stop', 'place'].includes(p.k) || !valid([+p.lat, +p.lon])) return null;
    const l = String(p.l || '').trim().slice(0, 80);
    return l ? { k: p.k, l, lat: +p.lat, lon: +p.lon } : null;
  }

  function routeKey(r) {
    return [r.f.l, r.t.l, ...r.x.map(x => x.r)].map(norm).join('|');
  }

  function routes(raw) {
    let o;
    try { o = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { o = null; }
    const list = Array.isArray(o) ? o : o && Array.isArray(o.items) ? o.items : [];
    const out = [], ids = new Set(), keys = new Set();
    for (const p of list) {
      if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !/^[\w-]{1,20}$/.test(p.id) || ids.has(p.id)) continue;
      const f = routeEnd(p.f), t = routeEnd(p.t);
      if (!f || !t) continue;
      const x = (Array.isArray(p.x) ? p.x : []).slice(0, 6).map(v => v && typeof v === 'object' ? { r: String(v.r || '').trim().slice(0, 12), a: String(v.a || '').trim().slice(0, 80), b: String(v.b || '').trim().slice(0, 80) } : null).filter(v => v && v.r);
      const r = { id: p.id, n: typeof p.n === 'string' ? p.n.trim().slice(0, 60) : '', f, t, x }, k = routeKey(r);
      if (keys.has(k)) continue;
      ids.add(p.id); keys.add(k);
      out.push(r);
      if (out.length >= ROUTE_MAX) break;
    }
    return out;
  }

  const poiHit = (p, q) =>presetHit(p.n, q) || (!!p.d && presetHit(p.d, q));

  return { norm, build, search, label, access, between, route, stopWalks, net, center, dist, locate, inArea, nearest, presets, presetHit, presetIcon, pois, poiHit, routes, routeKey, ROUTE_MAX, SLOTS, ICONS, AREA, MAX_ACC, POI_MAX, RANK, WALK_V };
})();
if (typeof module !== 'undefined') module.exports = Places;
