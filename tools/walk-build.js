// Vytvoří data/walk.json (pěší síť ulic Tirany) z OpenStreetMap přes Overpass API.
// Spuštění: node tools/walk-build.js   (data © OpenStreetMap contributors, ODbL)
const fs = require('fs');
const path = require('path');

const BB = '41.27,19.73,41.39,19.90';
const HW = 'trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|service|pedestrian|footway|path|steps|track|cycleway|corridor';
const Q = `[out:json][timeout:180];way["highway"~"^(${HW})$"]["foot"!~"^(no|private)$"]["access"!~"^(no|private)$"](${BB});out body;>;out skel qt;`;
const SEG = 50;

const dist = (a, b) => {
  const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos((a[0] + b[0]) / 2 * r), y = (b[0] - a[0]) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
};

async function load() {
  const urls = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter'];
  for (const u of urls) {
    const r = await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TiranaBus-walk/1.0 (info@besaweb.al)' },
      body: 'data=' + encodeURIComponent(Q)
    }).catch(e => ({ ok: false, status: e.message }));
    if (r.ok) return (await r.json()).elements;
    console.log('Overpass ' + r.status + ' (' + u + '), zkouším znovu');
    await new Promise(f => setTimeout(f, 10000));
  }
  throw new Error('Overpass nedostupný');
}

async function main() {
  const els = await load();
  const N = new Map(), W = [];
  for (const e of els) {
    if (e.type === 'node') N.set(e.id, [e.lat, e.lon]);
    else if (e.type === 'way') W.push(e.nodes);
  }
  const deg = new Map();
  for (const w of W) w.forEach((n, i) => deg.set(n, (deg.get(n) || 0) + (i === 0 || i === w.length - 1 ? 1 : 2)));
  const E = new Map();
  for (const w of W) {
    let last = w[0], acc = 0;
    for (let i = 1; i < w.length; i++) {
      acc += dist(N.get(w[i - 1]), N.get(w[i]));
      if (i === w.length - 1 || deg.get(w[i]) !== 2 || acc >= SEG) {
        if (last !== w[i]) E.set(last < w[i] ? last + ':' + w[i] : w[i] + ':' + last, [last, w[i]]);
        last = w[i]; acc = 0;
      }
    }
  }
  const adj = new Map();
  for (const [a, b] of E.values()) {
    (adj.get(a) || adj.set(a, []).get(a)).push(b);
    (adj.get(b) || adj.set(b, []).get(b)).push(a);
  }
  let best = [];
  const seen = new Set();
  for (const s of adj.keys()) {
    if (seen.has(s)) continue;
    const comp = [s];
    seen.add(s);
    for (let i = 0; i < comp.length; i++) for (const o of adj.get(comp[i])) if (!seen.has(o)) { seen.add(o); comp.push(o); }
    if (comp.length > best.length) best = comp;
  }
  const keep = new Set(best);
  const ids = best.sort((a, b) => Math.round(N.get(a)[0] * 1e3) - Math.round(N.get(b)[0] * 1e3) || N.get(a)[1] - N.get(b)[1]);
  const ix = new Map(ids.map((n, i) => [n, i]));
  const la = ids.map(n => Math.round(N.get(n)[0] * 1e5)), lo = ids.map(n => Math.round(N.get(n)[1] * 1e5));
  const es = [...E.values()].filter(([a, b]) => keep.has(a)).map(([a, b]) => ix.get(a) < ix.get(b) ? [ix.get(a), ix.get(b)] : [ix.get(b), ix.get(a)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const delta = v => v.map((x, i) => i ? x - v[i - 1] : x);
  const out = {
    v: new Date().toISOString().slice(0, 10),
    src: '© OpenStreetMap contributors, ODbL',
    a: delta(la), o: delta(lo), e: delta(es.map(x => x[0])), f: es.map(x => x[1] - x[0])
  };
  const json = JSON.stringify(out);
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'walk.json'), json);
  console.log(`Hotovo: ${ids.length} uzlů, ${es.length} úseků (zahozeno ${adj.size - ids.length} uzlů mimo hlavní síť), ${Math.round(json.length / 1024)} KB`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
