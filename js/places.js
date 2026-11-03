// Rozšířené vyhledávání: místa a ulice z data/poi.json (OSM), pěší docházka na zastávky. Bez DOM.
const Places = (() => {
  const RANK = { gov: 1, health: 1, edu: 1, air: 1, bus: 1, sight: 2, museum: 2, worship: 2, park: 2, square: 3, street: 3, area: 3, sport: 4, culture: 4, hotel: 4, food: 4, shop: 4 };
  const NEAR = 800, FAR = 1500, WALK_V = 1.25, DETOUR = 1.3;

  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

  function dist(a, b) {
    const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos((a[0] + b[0]) / 2 * r), y = (b[0] - a[0]) * r;
    return Math.sqrt(x * x + y * y) * 6371000;
  }

  function build(db) {
    const items = [];
    const add = (n, c, pts, t, a, id) => {
      const vs = [n, ...Object.values(t || {}), ...(a || [])].map(norm).filter(Boolean);
      items.push({ id, n, c, pts, t: t || {}, a: a || [], vs: [...new Set(vs)].map(v => [v, v.split(' ')]) });
    };
    (db.p || []).forEach((p, i) => add(p[0], p[1], [[p[2], p[3]]], p[4], p[5], 'p' + i));
    (db.s || []).forEach((s, i) => add(s[0], s[1], s[2], s[3], s[4], 's' + i));
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
        if (w.length >= 5 && vt.some(x => near1(w, x) || (x.length > w.length && near1(w, x.slice(0, w.length))))) { fuzzy = true; continue; }
        ok = false; break;
      }
      if (ok) best = Math.min(best, fuzzy ? 3 : 2);
    }
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

  function access(stops, pts) {
    const all = [];
    for (const s of stops) {
      let m = Infinity;
      for (const p of pts) m = Math.min(m, dist(p, [s.lat, s.lon]));
      if (m <= FAR) all.push([s, m]);
    }
    all.sort((a, b) => a[1] - b[1]);
    const near = all.filter(x => x[1] <= NEAR);
    const pick = (near.length ? near : all.slice(0, 3)).slice(0, 16);
    return pick.map(([s, m]) => ({ s, w: Math.max(30, Math.round(m * DETOUR / WALK_V)), m: Math.round(m * DETOUR) }));
  }

  function center(it) {
    if (it.pts.length === 1) return it.pts[0];
    const c = [it.pts.reduce((a, p) => a + p[0], 0) / it.pts.length, it.pts.reduce((a, p) => a + p[1], 0) / it.pts.length];
    return it.pts.reduce((b, p) => dist(p, c) < dist(b, c) ? p : b, it.pts[0]);
  }

  return { norm, build, search, label, access, center, dist, RANK };
})();
if (typeof module !== 'undefined') module.exports = Places;
