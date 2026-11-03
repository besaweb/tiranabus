// Vytvoří data/poi.json (místa a ulice v Tiraně) z OpenStreetMap přes Overpass API.
// Spuštění: node tools/poi-build.js   (data © OpenStreetMap contributors, ODbL)
const fs = require('fs');
const path = require('path');

const BB = '41.27,19.73,41.39,19.90';
const Q = `[out:json][timeout:120];(
nwr["name"]["amenity"~"^(hospital|clinic|university|college|school|theatre|cinema|townhall|courthouse|embassy|police|library|marketplace|bus_station|place_of_worship|restaurant|post_office|arts_centre|community_centre|nightclub|casino|internet_cafe|events_venue|conference_centre|social_centre|exhibition_centre|music_school|dancing_school|planetarium)$"](${BB});
nwr["name"]["tourism"~"^(hotel|hostel|guest_house|motel|attraction|museum|artwork|viewpoint|gallery|zoo|theme_park|camp_site)$"](${BB});
nwr["name"]["historic"](${BB});
nwr["name"]["leisure"~"^(park|garden|stadium|sports_centre|water_park|fitness_centre|swimming_pool|sports_hall|ice_rink|pitch|track|dance|resort|playground|indoor_play|amusement_arcade|bowling_alley|trampoline_park|escape_game|adventure_park|miniature_golf)$"](${BB});
nwr["name"]["club"="sport"](${BB});
nwr["name"]["building"~"^(commercial|retail)$"][!"amenity"][!"shop"][!"office"][!"tourism"](${BB});
nwr["name"]["shop"~"^(mall|department_store|supermarket)$"](${BB});
nwr["name"]["office"="government"](${BB});
nwr["name"]["aeroway"="aerodrome"](41.35,19.65,41.45,19.80);
nwr["name"]["place"~"^(square|neighbourhood|suburb|quarter)$"](${BB});
way["name"]["highway"~"^(trunk|primary|secondary|tertiary|residential|unclassified|pedestrian|living_street)$"](${BB});
);out center tags;`;

// Běžně používané názvy, které v OSM chybějí (ověřeno 3. 11. 2026 proti OSM a webům institucí).
const ALIAS = {
  'Rektorati i Universitetit të Tiranës': ['University of Tirana', 'Universiteti i Tiranës', 'Università di Tirana', 'Universität Tirana', 'Univerzita Tirana'],
  'Qendra Spitalore Universitare "Nënë Teresa"': ['Mother Teresa Hospital', 'QSUT', 'Spitali Nënë Tereza', 'Mother Teresa University Hospital'],
  'Teatri Kombëtar i Operas dhe Baletit': ['Opera and Ballet Theatre', 'Opera', 'Teatri i Operas', 'Opera Tirana'],
  'Sheshi Skënderbej': ['Skanderbeg Square', 'Sheshi Skënderbeg', 'Piazza Scanderbeg', 'Skanderbeg-Platz', 'Skanderbegovo náměstí'],
  'Aeroporti Ndërkombëtar i Tiranës Nënë Tereza': ['Tirana Airport', 'Rinas', 'Aeroporti i Rinasit', 'TIA', 'Letiště Tirana'],
  'Parku i Madh i Tiranës': ['Grand Park', 'Parku i Liqenit', 'Big Park', 'Velký park'],
  'Muzeu Historik Kombëtar': ['Historical Museum', 'Národní historické muzeum']
};

// Místa, která v OSM chybějí. Zdroj a datum ověření u každého, odhad polohy výslovně označen.
const MANUAL = [
  // Adresa: Mbikalimi i Unazës së Re, Rruga e Kavajës, Tiranë 1019 (spottedbylocals.com, qkk.filmmakers.systems, ověřeno 3. 11. 2026).
  // Poloha: souřadnice dodal provozovatel aplikace 3. 11. 2026.
  { n: 'Latitude Tirana', c: 'fun', k: 'trampoline_park', pt: [41.32278, 19.78661], a: ['Latitude', 'Latitude Air', 'Latitude Air Tirana', 'Latitude Games Park'] }
];

// Obecné názvy bez užitku pro hledání (hřiště, herní koutky, bazény bez vlastního jména).
const GENERIC = /^(fush[eë]( (e )?(sporti|basketbolli|futbolli|tenisit?|volejbollit|minifutbollit))?|k[eë]nd(i)? lojrash|pishina|gym|kasino|playground|pitch|basketball( court)?|football( pitch)?|tennis( court)?|sport|terren sportiv)$/i;

// Poloha vstupu místo středu areálu (letiště: autobusové stání LU-NA u příletové haly, viz js/extra-airport.js).
const POS = { 'Aeroporti Ndërkombëtar i Tiranës Nënë Tereza': [41.41726, 19.71391] };

const LANGS = ['en', 'sq', 'it', 'de', 'cs', 'pl', 'fr', 'es', 'mk', 'el', 'ru', 'tr'];

const FUN = ['playground', 'indoor_play', 'amusement_arcade', 'bowling_alley', 'trampoline_park', 'escape_game', 'adventure_park', 'miniature_golf'];
const CULT = ['theatre', 'cinema', 'arts_centre', 'events_venue', 'conference_centre', 'social_centre', 'exhibition_centre', 'music_school', 'dancing_school', 'planetarium'];

const sub = t => t.amenity || t.leisure || t.tourism || t.shop || (t.historic && 'historic') || (t.office && 'government') || (t.club && 'club') || t.aeroway || t.place || (t.building && 'building') || '';

function cat(t) {
  if (t.aeroway) return 'air';
  if (t.highway) return /^sheshi\b/i.test(t.name) ? 'square' : 'street';
  if (t.place) return t.place === 'square' ? 'square' : 'area';
  const a = t.amenity;
  if (a === 'hospital' || a === 'clinic') return 'health';
  if (a === 'university' || a === 'college' || a === 'school') return 'edu';
  if (a === 'bus_station') return 'bus';
  if (['townhall', 'courthouse', 'embassy', 'police', 'library', 'post_office', 'community_centre'].includes(a) || t.office) return 'gov';
  if (CULT.includes(a)) return 'culture';
  if (a === 'nightclub' || a === 'casino' || a === 'internet_cafe' || FUN.includes(t.leisure)) return 'fun';
  if (a === 'restaurant') return 'food';
  if (a === 'marketplace' || t.shop) return 'shop';
  if (a === 'place_of_worship') return 'worship';
  if (t.leisure === 'park' || t.leisure === 'garden') return 'park';
  if (t.leisure === 'resort') return 'hotel';
  if (t.leisure || t.club) return 'sport';
  if (['hotel', 'hostel', 'guest_house', 'motel', 'camp_site'].includes(t.tourism)) return 'hotel';
  if (t.building && !t.tourism && !t.historic) return 'shop';
  if (t.tourism === 'museum' || t.tourism === 'gallery') return 'museum';
  return 'sight';
}

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9а-яёα-ω]+/g, ' ').trim();
const dist = (a, b) => {
  const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos((a[0] + b[0]) / 2 * r), y = (b[0] - a[0]) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
};
const rd = v => Math.round(v * 1e5) / 1e5;

async function load() {
  const urls = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter'];
  for (const u of urls) {
    const r = await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TiranaBus-poi/1.0 (info@besaweb.al)' },
      body: 'data=' + encodeURIComponent(Q)
    }).catch(e => ({ ok: false, status: e.message }));
    if (r.ok) return (await r.json()).elements;
    console.log('Overpass ' + r.status + ' (' + u + '), zkouším znovu');
    await new Promise(f => setTimeout(f, 5000));
  }
  throw new Error('Overpass nedostupný');
}

async function main() {
  const els = await load();
  const P = [], S = new Map();
  for (const e of els) {
    const t = e.tags, c = e.center || e;
    if (c.lat == null || !t.name || GENERIC.test(t.name.trim())) continue;
    const pt = POS[t.name] || [rd(c.lat), rd(c.lon)];
    const tr = {};
    for (const l of LANGS) if (t['name:' + l] && t['name:' + l] !== t.name) tr[l] = t['name:' + l];
    const alt = [t.alt_name, t.old_name, t.short_name, t.official_name, t.loc_name].filter(Boolean).flatMap(s => s.split(';')).map(s => s.trim());
    alt.push(...(ALIAS[t.name] || []));
    const k = cat(t);
    if (k === 'street' || k === 'square') {
      const s = S.get(t.name) || S.set(t.name, { n: t.name, c: k, t: {}, a: new Set(), pts: [] }).get(t.name);
      Object.assign(s.t, tr); alt.forEach(x => s.a.add(x));
      if (!s.pts.some(p => dist(p, pt) < 150)) s.pts.push(pt);
      continue;
    }
    const key = norm(t.name) + '|' + k;
    if (P.some(p => p.key === key && dist(p.pt, pt) < 150)) continue;
    P.push({ key, n: t.name, c: k, k: sub(t), t: tr, a: [...new Set(alt)].filter(x => x !== t.name), pt });
  }
  for (const m of MANUAL) if (!P.some(p => p.n === m.n)) P.push({ n: m.n, c: m.c, k: m.k, t: {}, a: m.a, pt: m.pt });
  const out = {
    v: new Date().toISOString().slice(0, 10),
    src: '© OpenStreetMap contributors, ODbL',
    p: P.map(p => [p.n, p.c, p.k, p.pt[0], p.pt[1], p.t, p.a]),
    s: [...S.values()].map(s => [s.n, s.c, s.pts, s.t, [...s.a].filter(x => x !== s.n)])
  };
  const json = JSON.stringify(out).replace(/,\{\},\[\]\]/g, ']').replace(/,\[\]\]/g, ']');
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'poi.json'), json);
  const miss = Object.keys(ALIAS).filter(n => !P.some(p => p.n === n) && !S.has(n));
  console.log(`Hotovo: ${out.p.length} míst, ${out.s.length} ulic, ${Math.round(json.length / 1024)} KB`);
  if (miss.length) console.log('Aliasy bez objektu v OSM:', miss.join(', '));
}

main().catch(e => { console.error(e.message); process.exit(1); });
