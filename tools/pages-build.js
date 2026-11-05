// Vygeneruje statické stránky pro vyhledávače (letiště, linky, zastávky) ve 12 jazycích, jazykové kopie úvodní stránky a sitemap.xml s hreflang.
// Spuštění: node tools/pages-build.js <výstupní_složka> [gtfs.zip] [verze_pro_cache]
// Výstup se přidává k hotovému webu (index.html, css, js atd. se nekopírují). Vyžaduje příkaz unzip.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const GTFS = require('../js/gtfs-core.js');
const I18N = require('../js/i18n.js');
const EXTRA = require('../js/extra-airport.js');
const { P, NAMES } = require('./pages-i18n.js');

const [outArg, zipArg, ver] = process.argv.slice(2);
if (!outArg) { console.error('Použití: node tools/pages-build.js <výstupní_složka> [gtfs.zip] [verze]'); process.exit(1); }
const OUT = path.resolve(outArg);
const ZIP = path.resolve(zipArg || path.join(ROOT, 'gtfs.zip'));
const SITE = 'https://tiranabus.al/';
const LANGS = I18N.LANGS;
const LOCALE = { cs: 'cs_CZ', en: 'en_US', sq: 'sq_AL', it: 'it_IT', de: 'de_DE', pl: 'pl_PL', fr: 'fr_FR', es: 'es_ES', mk: 'mk_MK', el: 'el_GR', ru: 'ru_RU', tr: 'tr_TR' };
const FILES = ['agency', 'stops', 'routes', 'trips', 'stop_times', 'calendar', 'calendar_dates', 'frequencies', 'shapes', 'feed_info'];
const V = ver ? '?v=' + ver : '';

function csv(txt) {
  txt = txt.replace(/^﻿/, '');
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); f = ''; rows.push(row); row = []; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const h = rows.shift().map(x => x.trim());
  return rows.filter(r => r.length > 1 || r[0] !== '').map(r => Object.fromEntries(h.map((k, i) => [k, r[i] == null ? '' : r[i]])));
}

let tb = {};
for (const n of FILES) {
  try { tb[n] = csv(cp.execFileSync('unzip', ['-p', ZIP, n + '.txt'], { maxBuffer: 1 << 28, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })); } catch (e) {}
}
if (!tb.stops || !tb.routes) { console.error('Feed ' + ZIP + ' nejde přečíst.'); process.exit(1); }
const cityAgency = ((tb.agency || [])[0] || {}).agency_name || 'Municipality of Tirana';
for (const x of EXTRA) tb = GTFS.merge(tb, x.tables, x.id + ':');
const f = GTFS.build(tb);

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (s, p) => s.replace(/\{(\w+)\}/g, (m, k) => p && p[k] != null ? p[k] : m);
const jsonld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const msOf = ymd => Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8));
const ymdOf = ms => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
const wdOf = ymd => (new Date(msOf(ymd)).getUTCDay() + 6) % 7;
const WD = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const clock = GTFS.clock(f.tz);
if (/^\d{8}$/.test(process.env.PAGES_TODAY || '')) clock.ymd = process.env.PAGES_TODAY;
const exDates = new Set([...f.ex.keys()].map(k => k.split('|')[1]));
function refDay(wd) {
  let s = clock.ymd;
  if (f.from && s < f.from) s = f.from;
  if (f.to && msOf(s) > msOf(f.to) - 6 * 864e5) s = ymdOf(msOf(f.to) - 6 * 864e5);
  if (f.from && s < f.from) s = f.from;
  let best = null;
  for (let i = 0; i < 70; i++) {
    const ymd = ymdOf(msOf(s) + i * 864e5);
    if (f.to && ymd > f.to) break;
    if (wdOf(ymd) !== wd) continue;
    if (!exDates.has(ymd)) return ymd;
    best = best || ymd;
  }
  return best || s;
}
const DAYS = [['wd', refDay(2)], ['sat', refDay(5)], ['sun', refDay(6)]];
const active = (sid, ymd) => {
  const e = f.ex.get(sid + '|' + ymd);
  if (e === '1') return true;
  if (e === '2') return false;
  const c = f.cal.get(sid);
  return !!c && c.start_date <= ymd && ymd <= c.end_date && (c[WD[wdOf(ymd)]] || '').trim() === '1';
};

function every(ts) {
  const pick = ts.filter(t => t >= 25200 && t <= 72000);
  const a = pick.length >= 3 ? pick : ts, g = [];
  for (let i = 1; i < a.length; i++) if (a[i] > a[i - 1]) g.push(a[i] - a[i - 1]);
  if (!g.length) return null;
  g.sort((x, y) => x - y);
  return Math.max(1, Math.round(g[g.length >> 1] / 60));
}
function stat(r, dir, ymd) {
  let ts = [];
  for (const tr of r.trips) {
    if (tr.dir !== dir || tr.first == null || !active(tr.service, ymd)) continue;
    if (tr.freq) for (const q of tr.freq) { if (q.start != null && q.end != null) for (let s = q.start; s < q.end; s += q.hw) ts.push(s); }
    else ts.push(tr.first);
  }
  ts = [...new Set(ts)].sort((a, b) => a - b);
  return ts.length ? { first: ts[0], last: ts[ts.length - 1], n: ts.length, every: every(ts), ts } : null;
}

const extraNames = {};
for (const lang of LANGS) {
  const m = { stop: new Map(), head: new Map() };
  for (const x of EXTRA) {
    const L = EXTRA.localize(x, lang);
    L.stops.forEach(s => m.stop.set(x.id + ':' + s.stop_id, s.stop_name));
    x.tables.trips.forEach((t, i) => m.head.set(t.trip_headsign, L.trips[i].trip_headsign));
  }
  extraNames[lang] = m;
}

const natural = (a, b) => a.short.localeCompare(b.short, 'en', { numeric: true });
const routes = [...f.routes.values()].sort(natural);
const used = new Set();
for (const r of routes) {
  let s = r.short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'r' + r.id;
  if (used.has(s)) s += '-' + r.id.replace(/[^a-z0-9]+/gi, '');
  used.add(s);
  r.slug = s;
  r.extra = r.id.includes(':');
  r.stats = r.dirs.map(d => Object.fromEntries(DAYS.map(([k, ymd]) => [k, stat(r, d.dir, ymd)])));
}
const city = routes.filter(r => !r.extra);
const rx = f.routes.get('rx:RX'), rt = f.routes.get('rx:RT');
if (!city.length || !rx || !rt) { console.error('Ve feedu chybí městské linky nebo letištní linky RX/RT.'); process.exit(1); }

const lum = hex => {
  const [R, G, B] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * R + .7152 * G + .0722 * B;
};
const chip = r => `<span class="chip" style="background:${r.color};color:${lum(r.color) > .4 ? '#15213F' : '#FFFFFF'}">${esc(r.short)}</span>`;

const rel = (lang, rest) => (lang === 'en' ? '' : lang + '/') + rest;
const abs = (lang, rest) => SITE + rel(lang, rest);
const relative = (from, to) => {
  const r = path.posix.relative(from || '.', to || '.');
  return to.endsWith('/') || !to ? (r ? r + '/' : './') : r;
};
const lineRest = r => r.extra ? 'airport/' : 'line/' + r.slug + '/';

const today = new Date().toISOString().slice(0, 10);
const feedDate = /^\d{4}-\d{2}-\d{2}$/.test(f.version) ? f.version : today;
const gitDate = file => { try { return cp.execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim() || today; } catch (e) { return today; } };

const written = [];
const put = (p, txt) => {
  const fp = path.join(OUT, p);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, txt);
  written.push([p, Buffer.byteLength(txt)]);
};

const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XJ9EK9ZKWF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XJ9EK9ZKWF');
</script>`;

function svgRoute(r, label) {
  const lines = r.dirs.map(d => d.line).filter(l => l.length > 1);
  const all = lines.flat();
  if (!all.length) return '';
  const lats = all.map(p => p[0]), lons = all.map(p => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const k = Math.cos((minLat + maxLat) / 2 * Math.PI / 180), pad = 14;
  const dx = (maxLon - minLon) * k, dy = maxLat - minLat;
  const s = Math.min((640 - 2 * pad) / (dx || 1e-6), (360 - 2 * pad) / (dy || 1e-6));
  const w = Math.round(dx * s + 2 * pad), h = Math.round(dy * s + 2 * pad);
  const X = lon => ((lon - minLon) * k * s + pad).toFixed(1), Y = lat => ((maxLat - lat) * s + pad).toFixed(1);
  const paths = lines.map((l, i) => {
    const step = Math.ceil(l.length / 160), pts = l.filter((p, j) => j % step === 0 || j === l.length - 1);
    return `<path d="M${pts.map(p => X(p[1]) + ' ' + Y(p[0])).join('L')}" stroke="${r.color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"${i ? ' opacity=".55"' : ''}/>`;
  }).join('');
  const seen = new Set(), dots = [];
  for (const d of r.dirs) d.stops.forEach((st, i) => {
    if (seen.has(st.id)) return;
    seen.add(st.id);
    const end = i === 0 || i === d.stops.length - 1;
    dots.push(`<circle cx="${X(st.lon)}" cy="${Y(st.lat)}" r="${end ? 4.5 : 2.4}" fill="${end ? r.color : 'var(--panel)'}" stroke="${r.color}" stroke-width="1.5"/>`);
  });
  return `<svg class="rmap" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${paths}${dots.join('')}</svg>`;
}

function render(lang, rest, o) {
  const T = (k, p) => fmt(P[lang][k] != null ? P[lang][k] : I18N.D[lang][k] != null ? I18N.D[lang][k] : I18N.D.cs[k], p);
  const here = rel(lang, rest);
  const L = to => relative(here, to);
  const url = abs(lang, rest);
  const title = o.title + ' | Tirana Bus';
  const hl = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${abs(l, rest)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${abs('en', rest)}">`;
  const crumbs = [[T('homeL'), rel(lang, '')], ...o.crumbs];
  const ld = jsonld({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: crumbs.concat([[o.crumb || o.h, rel(lang, rest)]]).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: SITE + c[1] })) },
      { '@type': 'WebPage', '@id': url + '#page', url, name: o.title, description: o.desc, inLanguage: lang, isPartOf: { '@id': SITE + '#website' }, dateModified: feedDate }
    ]
  });
  const nav = crumbs.map(c => `<a href="${L(c[1])}">${esc(c[0])}</a>`).join(' › ') + ' › <span aria-current="page">' + esc(o.crumb || o.h) + '</span>';
  const lnav = LANGS.map(l => `<a href="${L(rel(l, rest))}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${NAMES[l]}</a>`).join(' ');
  const pages = `<a href="${L(rel(lang, 'lines/'))}">${esc(T('navLines'))}</a> · <a href="${L(rel(lang, 'stops/'))}">${esc(T('navStops'))}</a> · <a href="${L(rel(lang, 'airport/'))}">${esc(T('navAirport'))}</a> · <a href="${L('tickets.html')}">${esc(T('tkTitle'))}</a> · <a href="${L('privacy.html')}">${esc(T('privacy'))}</a>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
${GA}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
${hl}
<link rel="icon" href="${L('favicon.ico')}" sizes="48x48">
<link rel="icon" type="image/png" href="${L('img/logo.png')}" sizes="192x192">
<link rel="apple-touch-icon" href="${L('img/logo.png')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tirana Bus">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}img/og.jpg">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
${ld}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="${L('css/tickets.css')}${V}">
<link rel="stylesheet" href="${L('css/pages.css')}${V}">
<script>try { if (localStorage.getItem('tirana-mhd-theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch (e) {}</script>
</head>
<body>
<header>
  <a class="back" href="${L(rel(lang, ''))}">← Tirana Bus</a>
  <nav class="crumbs" aria-label="Breadcrumb">${nav}</nav>
  <h1>${o.h1}</h1>
</header>
<main>
${o.body(T, L)}
</main>
<footer class="pgfoot">
  <p>${pages}</p>
  <p class="meta">${esc(T('aboutCredits'))}</p>
  <nav class="lnav" aria-label="${esc(T('langAria'))}">${lnav}</nav>
</footer>
</body>
</html>
`;
}

const ymdLabel = lang => {
  I18N.setLang(lang);
  return f.to ? new Intl.DateTimeFormat(I18N.loc(), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(msOf(f.to))) : '';
};
const DK = [['wd', 'wd'], ['sat', 'sat'], ['sun', 'sun']];
const hh = GTFS.hhmm;
const headOf = (lang, d) => extraNames[lang].head.get(d.head) || d.head;
const stopOf = (lang, s) => extraNames[lang].stop.get(s.id) || s.name;
const mainStat = r => { for (const k of ['wd', 'sat', 'sun']) for (const st of r.stats) if (st[k]) return st[k]; return null; };

function linePage(lang, r) {
  I18N.setLang(lang);
  const rest = lineRest(r), name = r.long || r.short, d = ymdLabel(lang);
  const wd = r.stats.map(s => s.wd).filter(Boolean);
  const ms = wd.length ? wd[0] : mainStat(r);
  const a = wd.length ? hh(Math.min(...wd.map(x => x.first))) : ms ? hh(ms.first) : '', b = wd.length ? hh(Math.max(...wd.map(x => x.last))) : ms ? hh(ms.last) : '';
  const m = ms && ms.every ? ms.every : null;
  const desc0 = P[lang].lineDesc;
  return render(lang, rest, {
    title: fmt(P[lang].lineTitle, { n: r.short, r: name }),
    h: fmt(P[lang].bus, { n: r.short }) + ' ' + name,
    crumb: fmt(P[lang].bus, { n: r.short }),
    h1: `${chip(r)}<span>${esc(name)}</span>`,
    desc: fmt(desc0, { n: r.short, r: name, a, b, m: m || '?' }),
    crumbs: [[I18N.t('navLines'), rel(lang, 'lines/')]],
    body: (T, L) => {
      let h = `<section class="card"><a class="cta" href="${L(rel(lang, ''))}?line=${encodeURIComponent(r.short)}">${esc(T('open'))}</a>${svgRoute(r, T('bus', { n: r.short }) + ' ' + name)}<dl><dt>${esc(T('oper'))}</dt><dd>${esc(cityAgency)}</dd><dt>${esc(T('tkFare'))}</dt><dd>${esc(T('tkFareV'))}</dd></dl></section>\n`;
      r.dirs.forEach((dr, i) => {
        const rows = DK.map(([k]) => {
          const s = r.stats[i][k];
          return `<tr><th scope="row">${esc(T(k))}</th>` + (s ? `<td>${hh(s.first)}</td><td>${hh(s.last)}</td><td>${s.every ? esc(T('every', { n: s.every })) : '–'}</td>` : `<td colspan="3" class="no">${esc(T('noSvc'))}</td>`) + '</tr>';
        }).join('');
        h += `<section class="card"><h2>${esc(T('dir', { h: headOf(lang, dr) }))}</h2><h3>${esc(T('timetable'))}</h3><table class="tt"><thead><tr><th></th><th>${esc(T('first'))}</th><th>${esc(T('last'))}</th><th>${esc(T('freq'))}</th></tr></thead><tbody>${rows}</tbody></table><h3>${esc(T('stopsHead'))}</h3><ol class="board" style="--c:${r.color}">${dr.stops.map(s => `<li>${esc(s.name)}</li>`).join('')}</ol></section>\n`;
      });
      return h + `<p class="note">${esc(T('valid', { d }))}</p>`;
    }
  });
}

function linesPage(lang) {
  I18N.setLang(lang);
  const d = ymdLabel(lang);
  return render(lang, 'lines/', {
    title: P[lang].linesH,
    h: P[lang].linesH,
    h1: `<span>${esc(P[lang].linesH)}</span>`,
    desc: fmt(P[lang].linesDesc, { c: city.length }),
    crumbs: [],
    body: (T, L) => `<section class="card"><p class="intro">${esc(T('linesIntro', { d }))}</p><ul class="lines">${routes.map(r => `<li><a href="${L(rel(lang, lineRest(r)))}">${chip(r)}<span>${esc(r.extra ? stopOf(lang, r.dirs[0].stops[0]).split(' – ')[0] + ' – ' + stopOf(lang, r.dirs[0].stops[r.dirs[0].stops.length - 1]).split(' – ')[0] : r.long || r.short)}</span></a></li>`).join('')}</ul></section>`
  });
}

function stopsPage(lang) {
  I18N.setLang(lang);
  const by = new Map();
  for (const s of f.stops.values()) {
    const n = stopOf(lang, s);
    (by.get(n) || by.set(n, new Set()).get(n));
    for (const r of s.routes) by.get(n).add(r);
  }
  const names = [...by.keys()].sort((x, y) => x.localeCompare(y, 'sq'));
  return render(lang, 'stops/', {
    title: P[lang].stopsPageH,
    h: P[lang].stopsPageH,
    h1: `<span>${esc(P[lang].stopsPageH)}</span>`,
    desc: fmt(P[lang].stopsDesc, { c: names.length }),
    crumbs: [],
    body: (T, L) => `<section class="card"><p class="intro">${esc(T('stopsIntro'))}</p><ul class="stoplist">${names.map(n => `<li><b>${esc(n)}</b> <span class="chips">${[...by.get(n)].sort(natural).map(r => `<a href="${L(rel(lang, lineRest(r)))}" title="${esc(r.long || r.short)}">${chip(r)}</a>`).join('')}</span></li>`).join('')}</ul></section>`
  });
}

function airportPage(lang) {
  I18N.setLang(lang);
  const blocks = [[rx, 'tkAirA', 'tkAirIntro', 'tkPriceA', 'tkSchedA', false], [rt, 'tkAirB', 'tkAirIntroB', 'tkPriceB', 'tkSchedB', true]];
  return render(lang, 'airport/', {
    title: P[lang].airTitle,
    h: P[lang].airH,
    h1: `<span>${esc(P[lang].airH)}</span>`,
    desc: P[lang].airDesc,
    crumbs: [],
    body: (T, L) => `<section class="card"><p>${esc(T('airHow'))}</p><a class="cta" href="${L(rel(lang, ''))}?line=RX">${esc(T('open'))}</a></section>\n` + blocks.map(([r, kh, ki, kp, ks, est]) => {
      const mins = Math.round(Math.max(...r.trips.map(tr => tr.st[tr.st.length - 1].arr - tr.st[0].dep)) / 60);
      const dirs = r.dirs.map(dr => {
        const ts = [...new Set(r.trips.filter(tr => tr.dir === dr.dir).map(tr => tr.first))].sort((x, y) => x - y);
        return `<h3>${esc(T('dir', { h: headOf(lang, dr) }))}</h3><p class="times"><span class="sr">${esc(T('airDep'))}: </span>${ts.map(x => `<span>${hh(x)}</span>`).join('')}</p>`;
      }).join('');
      return `<section class="card"><h2>${chip(r)}<span>${esc(T(kh))}</span></h2><p class="intro">${esc(T(ki))}</p><dl><dt>${esc(T('tkPrice'))}</dt><dd class="big">${esc(T(kp))}</dd><dt>${esc(T('tkSched'))}</dt><dd>${esc(T(ks))}</dd><dt>${esc(T('airJourney'))}</dt><dd>${est ? '≈ ' : ''}${esc(T('min', { n: mins }))}${est ? ' · ' + esc(T('airEst')) : ''}</dd></dl>${dirs}${svgRoute(r, T(kh))}</section>`;
    }).join('\n') + `\n<section class="card"><a class="link" href="https://luna.al/en" target="_blank" rel="noopener">${esc(T('tkLuna'))} ↗</a> · <a class="link" href="${L('tickets.html')}">${esc(T('tkTitle'))}</a></section><p class="note">${esc(T('tkNote'))}</p>`
  });
}

function homePage(lang) {
  I18N.setLang(lang);
  const T = (k, p) => fmt(P[lang][k] != null ? P[lang][k] : I18N.t(k), p);
  let h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sub = (re, val) => {
    if (!re.test(h)) throw new Error('index.html: nenalezeno ' + re);
    h = h.replace(re, () => val);
  };
  sub(/<html lang="en">/, `<html lang="${lang}" data-pglang="${lang}" data-root="../">`);
  sub(/<title>[^<]*<\/title>/, `<title>${esc(I18N.D[lang].metaTitle)}</title>`);
  sub(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(P[lang].homeDesc)}">`);
  sub(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${abs(lang, '')}">`);
  sub(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(I18N.D[lang].metaTitle)}">`);
  sub(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(P[lang].ogDesc)}">`);
  sub(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${abs(lang, '')}">`);
  sub(/<meta property="og:locale" content="[^"]*">\n(?:<meta property="og:locale:alternate" content="[^"]*">\n)+/, `<meta property="og:locale" content="${LOCALE[lang]}">\n` + LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${LOCALE[l]}">\n`).join(''));
  sub(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(P[lang].ogDesc)}">`);
  sub(/"inLanguage": "en"/, `"inLanguage": "${lang}"`);
  sub(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><div class="nojs"><h2>Tirana Bus</h2><p>${esc(P[lang].homeDesc)}</p><p><a href="airport/">${esc(T('navAirport'))}</a> · <a href="lines/">${esc(T('navLines'))}</a> · <a href="stops/">${esc(T('navStops'))}</a> · <a href="tickets.html">${esc(T('tkTitle'))}</a> · <a href="privacy.html">${esc(T('privacy'))}</a></p></div></noscript>`);
  h = h.replace(/(\s(?:href|src)=")((?!https?:|\/\/|#|mailto:|airport\/|lines\/|stops\/)[^"]+)"/g, '$1../$2"');
  if (ver) h = h.replace(/((?:src|href)="\.\.\/(?:css|js)\/[^"?]+\.(?:js|css))"/g, `$1?v=${ver}"`);
  return h;
}

const PAGES = ['', 'airport/', 'lines/', 'stops/', ...city.map(r => lineRest(r))];
for (const lang of LANGS) {
  if (lang !== 'en') put(rel(lang, 'index.html'), homePage(lang));
  put(rel(lang, 'airport/index.html'), airportPage(lang));
  put(rel(lang, 'lines/index.html'), linesPage(lang));
  put(rel(lang, 'stops/index.html'), stopsPage(lang));
  for (const r of city) put(rel(lang, lineRest(r) + 'index.html'), linePage(lang, r));
}

const homeDate = gitDate('index.html');
const urls = PAGES.map(rest => {
  const alt = LANGS.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(l, rest)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${abs('en', rest)}"/>`;
  const lm = rest ? feedDate : homeDate;
  return LANGS.map(l => `  <url><loc>${abs(l, rest)}</loc><lastmod>${lm}</lastmod>${alt}</url>`).join('\n');
});
for (const file of ['tickets.html', 'privacy.html']) urls.push(`  <url><loc>${SITE}${file}</loc><lastmod>${gitDate(file)}</lastmod></url>`);
put('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);

const total = written.reduce((s, x) => s + x[1], 0);
console.log(`Vygenerováno ${written.length} souborů (${(total / 1024).toFixed(0)} KB) do ${OUT}: ${city.length} městských linek, ${LANGS.length} jazyků, feed ${f.version || '?'} (platí do ${f.to || '?'}), dny ${DAYS.map(x => x.join('=')).join(' ')}`);
