// Vygeneruje statické stránky pro SEO: domovské stránky /{jazyk}/, přehled linek, stránky linek, letiště a sitemap.xml.
// Spuštění: node tools/build-pages.js [výstupní složka=site]   (V=<verze> přidá ?v= k css, SITE=https://tiranabus.al)
// Vstupy: gtfs.zip ve výstupní složce (jinak v kořeni), index.html, js/*.js. Výstup se necommituje.
const fs = require('fs');
const path = require('path');
const GTFS = require('../js/gtfs-core.js');
const EXTRA = require('../js/extra-airport.js');
const I18N = require('../js/i18n.js');
const { readTables } = require('./gtfs-node.js');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'site');
const SITE = (process.env.SITE || 'https://tiranabus.al').replace(/\/$/, '');
const VQ = process.env.V ? '?v=' + process.env.V : '';
const LANGS = I18N.LANGS;
const NAMES = { cs: 'Čeština', en: 'English', sq: 'Shqip', it: 'Italiano', de: 'Deutsch', pl: 'Polski', fr: 'Français', es: 'Español', mk: 'Македонски', el: 'Ελληνικά', ru: 'Русский', tr: 'Türkçe' };
const OGLOC = { cs: 'cs_CZ', en: 'en_US', sq: 'sq_AL', it: 'it_IT', de: 'de_DE', pl: 'pl_PL', fr: 'fr_FR', es: 'es_ES', mk: 'mk_MK', el: 'el_GR', ru: 'ru_RU', tr: 'tr_TR' };
const TODAY = new Date().toISOString().slice(0, 10);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const write = (rel, txt) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, txt);
};

const zipFile = [path.join(OUT, 'gtfs.zip'), path.join(ROOT, 'gtfs.zip')].find(f => fs.existsSync(f));
if (!zipFile) throw new Error('gtfs.zip nenalezen');
const base = readTables(zipFile);
const tpl = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const isAir = r => r.id.startsWith('rx:');
const slugOf = (r, used) => {
  let s = r.short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || r.id.replace(/\W+/g, '-').toLowerCase();
  if (used.has(s)) s += '-' + r.id.replace(/\W+/g, '-').toLowerCase();
  used.add(s);
  return s;
};
const byShort = (a, b) => isAir(a) - isAir(b) || (isAir(a) ? 0 : a.short.localeCompare(b.short, 'en', { numeric: true }));

function feedFor(l) {
  let tt = base;
  for (const x of EXTRA) tt = GTFS.merge(tt, EXTRA.localize(x, l), x.id + ':');
  return GTFS.build(tt);
}

const WD = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
function dayStats(f, r, dir, wd) {
  const trips = r.trips.filter(tr => tr.dir === dir && tr.st.length && f.cal.get(tr.service) && f.cal.get(tr.service)[WD[wd]] === '1');
  if (!trips.length) return null;
  let first = Infinity, last = -Infinity;
  const dep = new Set(), hw = [];
  for (const tr of trips) {
    if (tr.freq) {
      for (const q of tr.freq) {
        first = Math.min(first, q.start);
        last = Math.max(last, q.start + Math.floor((q.end - q.start - 1) / q.hw) * q.hw);
        hw.push(q.hw);
      }
    } else {
      const d = tr.st[0].dep;
      if (d == null) continue;
      first = Math.min(first, d); last = Math.max(last, d); dep.add(d);
    }
  }
  if (!isFinite(first)) return null;
  let ev = null;
  if (hw.length) ev = [Math.min(...hw), Math.max(...hw)];
  else if (dep.size > 2) {
    const a = [...dep].sort((x, y) => x - y), g = a.slice(1).map((x, i) => x - a[i]).sort((x, y) => x - y);
    ev = [g[g.length >> 1], g[g.length >> 1]];
  }
  return { first, last, ev: ev && ev.map(x => Math.round(x / 60) || 1) };
}
const sameStat = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function dayRows(f, r, dir) {
  const st = WD.map((_, i) => dayStats(f, r, dir, i)), rows = [];
  for (let i = 0; i < 7; i++) {
    if (!st[i]) continue;
    const last = rows[rows.length - 1];
    if (last && last.to === i - 1 && sameStat(last.s, st[i])) last.to = i; else rows.push({ from: i, to: i, s: st[i] });
  }
  return rows;
}
const dayName = (i, loc) => new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + i)));
const evText = ev => !ev ? '–' : I18N.t('every', { n: ev[0] === ev[1] ? ev[0] : ev[0] + '–' + ev[1] });
const hm = GTFS.hhmm;

const textOn = c => { const n = parseInt(c.slice(1), 16), y = (299 * (n >> 16) + 587 * ((n >> 8) & 255) + 114 * (n & 255)) / 1000; return y > 150 ? '#15213F' : '#FFFFFF'; };
const badge = r => `<span class="badge" style="background:${r.color};color:${textOn(r.color)}">${esc(r.short)}</span>`;

const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XJ9EK9ZKWF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XJ9EK9ZKWF');
</script>`;

const groups = [];
const alternates = (g, root) => {
  const a = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${g(l)}">`);
  a.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${root || g('en')}">`);
  return a.join('\n');
};

function homePage(l) {
  I18N.setLang(l);
  const t = I18N.t, title = esc(t('metaTitle')), desc = esc(t('metaDesc')), url = `${SITE}/${l}/`;
  let h = tpl;
  const rep = (a, b) => {
    if (a instanceof RegExp) a.lastIndex = 0;
    if (!(a instanceof RegExp ? a.test(h) : h.includes(a))) throw new Error('šablona: ' + a);
    if (a instanceof RegExp) a.lastIndex = 0;
    h = h.replace(a, b);
  };
  rep('<html lang="en">', `<html lang="${l}" data-page-lang="${l}">`);
  rep('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">');
  rep(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  rep(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`);
  rep(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  rep(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`);
  rep(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  rep(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  rep(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
  rep(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${title}$2`);
  rep(/<link rel="canonical"[^>]*>\n?/, '');
  rep(/<link rel="alternate" hreflang[^>]*>\n?/g, '');
  rep(/<meta property="og:locale[^>]*>\n?/g, '');
  rep('<meta property="og:type"', `<link rel="canonical" href="${url}">\n${alternates(x => `/${x}/`, '/')}\n<meta property="og:locale" content="${OGLOC[l]}">\n${LANGS.filter(x => x !== l).map(x => `<meta property="og:locale:alternate" content="${OGLOC[x]}">`).join('\n')}\n<meta property="og:type"`);
  rep('"@id": "https://tiranabus.al/#website", "url": "https://tiranabus.al/"', `"@id": "https://tiranabus.al/#website", "url": "${url}"`);
  rep('"inLanguage": "en"', `"inLanguage": "${l}"`);
  rep(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><div class="nojs"><h2>Tirana Bus</h2><p>${desc}</p><p><a href="${l}/lines/">${esc(t('lines'))}</a> · <a href="${l}/airport/">${esc(t('seoAirNav'))}</a> · <a href="tickets.html">${esc(t('tickets'))}</a> · <a href="privacy.html">${esc(t('privacy'))}</a></p></div></noscript>`);
  h = h.replace(/<use href="#/g, `<use href="${l}/#`);
  h = h.replace(/(data-seo="(?:lines|airport)" [^>]*href=")en\//g, `$1${l}/`);
  return h;
}

function contentPage(o) {
  const { l, path: p, title, desc, h1, body, crumbs } = o, t = I18N.t;
  const pre = '../'.repeat(p.split('/').length + 1);
  const url = `${SITE}/${l}/${p}/`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: SITE + c[1] }))
  };
  const sw = LANGS.map(x => x === l ? `<span aria-current="true">${NAMES[x]}</span>` : `<a href="${pre}${x}/${p}/" hreflang="${x}" lang="${x}">${NAMES[x]}</a>`).join(' ');
  return `<!doctype html>
<html lang="${l}">
<head>
${GA}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
${alternates(x => `/${x}/${p}/`)}
<link rel="icon" href="${pre}favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="${pre}img/logo.png" sizes="192x192">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tirana Bus">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/img/og.jpg">
<meta property="og:locale" content="${OGLOC[l]}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="${pre}css/tickets.css${VQ}">
<script>try { if (localStorage.getItem('tirana-mhd-theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch (e) {}</script>
</head>
<body>
<header>
  <nav class="crumbs" aria-label="Breadcrumb"><a class="back" href="${pre}${l}/">← Tirana Bus</a></nav>
  <h1>${h1}</h1>
</header>
<main>
${body(pre)}
  <p class="note">${esc(t('aboutCredits'))}</p>
  <nav class="langs" aria-label="Language">${sw}</nav>
  <nav class="foot">
    <a href="${pre}${l}/">${esc(t('seoHome'))}</a> · <a href="${pre}${l}/lines/">${esc(t('lines'))}</a> · <a href="${pre}${l}/airport/">${esc(t('seoAirNav'))}</a> · <a href="${pre}tickets.html">${esc(t('tickets'))}</a> · <a href="${pre}privacy.html">${esc(t('privacy'))}</a>
  </nav>
</main>
</body>
</html>
`;
}

function timetable(f, r, d, loc) {
  const t = I18N.t, rows = dayRows(f, r, d.dir);
  if (!rows.length) return '';
  const trs = rows.map(x => `<tr><th scope="row">${x.from === x.to ? dayName(x.from, loc) : dayName(x.from, loc) + '–' + dayName(x.to, loc)}</th><td>${hm(x.s.first)}</td><td>${hm(x.s.last)}</td><td>${esc(evText(x.s.ev))}</td></tr>`).join('');
  return `<table class="tt"><thead><tr><th></th><th>${esc(t('seoFirst'))}</th><th>${esc(t('seoLast'))}</th><th>${esc(t('seoFreq'))}</th></tr></thead><tbody>${trs}</tbody></table>`;
}

function lineBody(f, r, slugs, l) {
  const t = I18N.t, loc = I18N.loc();
  return pre => {
    const dirs = r.dirs.map(d => `<section class="card">
    <h2>${esc(t('dir', { h: d.head }))}</h2>
    <p class="meta">${d.stops.length} ${esc(I18N.pl('uStop', d.stops.length))}</p>
    <ol class="stops">${d.stops.map(s => `<li>${esc(s.name)}</li>`).join('')}</ol>
    ${timetable(f, r, d, loc)}
  </section>`).join('\n  ');
    const others = [...f.routes.values()].filter(x => x !== r && !isAir(x) === !isAir(r)).sort(byShort)
      .map(x => `<a class="chip" href="${pre}${l}/line/${slugs.get(x.id)}/">${badge(x)}</a>`).join('');
    return `  <section class="card">
    <p class="intro">${esc(lineDesc(f, r, l))}</p>
    <p><a class="cta" href="${pre}${l}/?line=${encodeURIComponent(r.short)}">${esc(t('seoOpen', { r: r.short }))} →</a></p>
  </section>
  ${dirs}
  <p class="note">${esc(t('approx'))}</p>
  <section class="card">
    <h2>${esc(t('seoOthers'))}</h2>
    <div class="chips">${others}</div>
  </section>`;
  };
}

function lineDesc(f, r) {
  const t = I18N.t, d = r.dirs[0];
  let first = Infinity, last = -Infinity;
  for (const x of r.dirs) for (let i = 0; i < 7; i++) {
    const s = dayStats(f, r, x.dir, i);
    if (s) { first = Math.min(first, s.first); last = Math.max(last, s.last); }
  }
  return t('seoLineDesc', { r: r.short, a: d.stops[0].name, b: d.stops[d.stops.length - 1].name, n: r.stops.size, f: isFinite(first) ? hm(first) : '–', l: isFinite(last) ? hm(last) : '–' });
}

function linesBody(f, slugs, l) {
  const t = I18N.t;
  return pre => {
    const item = r => {
      const d = r.dirs[0], sub = r.long || (d.stops[0].name + ' – ' + d.stops[d.stops.length - 1].name);
      return `<li><a href="${pre}${l}/line/${slugs.get(r.id)}/">${badge(r)}<span>${esc(sub)}</span></a></li>`;
    };
    const all = [...f.routes.values()].sort(byShort);
    return `  <section class="card">
    <p class="intro">${esc(t('seoLinesDesc', { n: all.filter(x => !isAir(x)).length }))}</p>
    <ul class="linelist">${all.filter(x => !isAir(x)).map(item).join('')}</ul>
  </section>
  <section class="card">
    <h2><a href="${pre}${l}/airport/">${esc(t('seoAirNav'))}</a></h2>
    <ul class="linelist">${all.filter(isAir).map(item).join('')}</ul>
  </section>
  <p><a class="cta" href="${pre}${l}/">${esc(t('seoHome'))} →</a></p>`;
  };
}

function airportBody(f, slugs, l) {
  const t = I18N.t, loc = I18N.loc();
  return pre => {
    const air = [...f.routes.values()].filter(isAir).sort(byShort);
    const sec = r => `<section class="card">
    <h2><a href="${pre}${l}/line/${slugs.get(r.id)}/">${badge(r)} ${esc(r.long)}</a></h2>
    <p>${esc(r.desc)}</p>
    ${r.dirs.map(d => `<h3>${esc(t('dir', { h: d.head }))}</h3><p class="meta">${d.stops.map(s => esc(s.name)).join(' → ')}</p>${timetable(f, r, d, loc)}`).join('\n    ')}
  </section>`;
    return `  <section class="card">
    <p class="intro">${esc(t('tkAirIntro'))}</p>
    <p class="intro">${esc(t('tkAirIntroB'))}</p>
  </section>
  ${air.map(sec).join('\n  ')}
  <p class="note">${esc(t('tkNote'))}</p>
  <p><a class="cta" href="${pre}tickets.html">${esc(t('tickets'))} →</a> <a class="cta" href="${pre}${l}/?line=${encodeURIComponent(air[0].short)}">${esc(t('seoOpen', { r: air[0].short }))} →</a></p>`;
  };
}

fs.rmSync(path.join(OUT, 'sitemap.xml'), { force: true });
const urls = [];
const addGroup = (g, root) => urls.push({ g, root });
let nLines = 0;
const slugsEn = new Map();
{
  const f = feedFor('en'), used = new Set();
  for (const r of [...f.routes.values()].sort(byShort)) slugsEn.set(r.id, slugOf(r, used));
}
const routePaths = [...slugsEn.values()];

for (const l of LANGS) {
  I18N.setLang(l);
  const t = I18N.t, f = feedFor(l), slugs = slugsEn, home = t('seoHome');
  write(`${l}/index.html`, homePage(l));
  const crumbs = (...c) => [[home, `/${l}/`], ...c];
  write(`${l}/lines/index.html`, contentPage({
    l, path: 'lines', title: t('seoLinesTitle'), desc: t('seoLinesDesc', { n: [...f.routes.values()].filter(r => !isAir(r)).length }), h1: esc(t('seoLinesTitle')),
    body: linesBody(f, slugs, l), crumbs: crumbs([t('lines'), `/${l}/lines/`])
  }));
  write(`${l}/airport/index.html`, contentPage({
    l, path: 'airport', title: t('seoAirTitle'), desc: t('seoAirDesc'), h1: esc(t('seoAirTitle')),
    body: airportBody(f, slugs, l), crumbs: crumbs([t('seoAirNav'), `/${l}/airport/`])
  }));
  for (const r of f.routes.values()) {
    const s = slugs.get(r.id);
    write(`${l}/line/${s}/index.html`, contentPage({
      l, path: `line/${s}`, title: t('seoLineTitle', { r: r.short }), desc: lineDesc(f, r), h1: `${badge(r)} ${esc(r.long || r.dirs[0].stops[0].name + ' – ' + r.dirs[0].stops[r.dirs[0].stops.length - 1].name)}`,
      body: lineBody(f, r, slugs, l), crumbs: crumbs([t('lines'), `/${l}/lines/`], [r.short, `/${l}/line/${s}/`])
    }));
    nLines++;
  }
}

addGroup(l => `/${l}/`, '/');
addGroup(l => `/${l}/lines/`);
addGroup(l => `/${l}/airport/`);
for (const s of routePaths) addGroup(l => `/${l}/line/${s}/`);

const link = (hl, u) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${SITE}${u}"/>`;
const entry = (loc, alts) => `  <url><loc>${SITE}${loc}</loc><lastmod>${TODAY}</lastmod>${alts.join('')}</url>`;
const sm = [];
for (const { g, root } of urls) {
  const alts = [...LANGS.map(l => link(l, g(l))), link('x-default', root || g('en'))];
  if (root) sm.push(entry(root, alts));
  for (const l of LANGS) sm.push(entry(g(l), alts));
}
sm.push(entry('/tickets.html', []), entry('/privacy.html', []));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.join('\n')}\n</urlset>\n`);
console.log(`Stránek: ${LANGS.length * (3 + routePaths.length)} (${routePaths.length} linek × ${LANGS.length} jazyků), sitemap: ${sm.length} URL`);
