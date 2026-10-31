(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const lum = h => {
    const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
  };
  const ink = r => r.text || (lum(r.color) > .4 ? '#141A19' : '#FFFFFF');
  const chip = (r, cls = '') => `<span class="chip ${cls}" style="--c:${r.color};--ct:${ink(r)}">${esc(r.short)}</span>`;
  const { t, pl } = I18N;
  const fmtDate = s => s && s.length === 8 ? (I18N.lang === 'cs' ? `${+s.slice(6)}. ${+s.slice(4, 6)}. ${s.slice(0, 4)}` : I18N.lang === 'de' || I18N.lang === 'pl' ? `${s.slice(6)}.${s.slice(4, 6)}.${s.slice(0, 4)}` : `${s.slice(6)}/${s.slice(4, 6)}/${s.slice(0, 4)}`) : '–';
  const FARE = { lek: 40, luna: { 'rx:RX': 400, 'rx:RT': 300 }, cur: { cs: ['CZK', .268], en: ['EUR', .011], sq: null, it: ['EUR', .011], de: ['EUR', .011], pl: ['PLN', .047] } };
  const fareText = j => {
    const total = j.legs.reduce((a, l) => l.kind === 'ride' ? a + (FARE.luna[l.route.id] || FARE.lek) : a, 0), c = FARE.cur[I18N.lang];
    if (!c) return t('priceLek', { l: total });
    const [cur, rate] = c;
    return t('price', { l: total, c: new Intl.NumberFormat(I18N.loc(), { style: 'currency', currency: cur, maximumFractionDigits: cur === 'CZK' ? 0 : 2 }).format(total * rate) });
  };
  const byName = (a, b) => a.short.localeCompare(b.short, 'cs', { numeric: true });

  const map = L.map('map', { preferCanvas: true, zoomSnap: .5, attributionControl: true }).setView([41.3275, 19.8187], 13);
  map.attributionControl.setPrefix(false);
  const renderer = L.canvas({ padding: .5, tolerance: 6 });
  const OSM = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  const BASE = {
    'OpenStreetMap': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: OSM }),
    'Esri Streets': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '© Esri' }),
    'Esri Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '© Esri, Maxar' }),
    'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, subdomains: 'abc', attribution: OSM + ', © OpenTopoMap' }),
    'No basemap': L.layerGroup()
  };
  const VEC = 'Offline mapa';
  if (window.OFFLINE_MAP && window.maplibregl) {
    const sty = () => new URL('map/style-' + (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light') + '.json', location.href).href;
    BASE[VEC] = L.Layer.extend({
      getAttribution: () => '© OpenMapTiles © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      onAdd(m) {
        this._m = m;
        this._el = L.DomUtil.create('div', 'vec-map');
        m.getPane('tilePane').appendChild(this._el);
        this._gl = new maplibregl.Map({ container: this._el, style: sty(), interactive: false, attributionControl: false, fadeDuration: 0, center: [m.getCenter().lng, m.getCenter().lat], zoom: m.getZoom() - 1 });
        this._sync = () => this._place();
        m.on('move zoom resize viewreset', this._sync);
        this._obs = new MutationObserver(() => this._gl.setStyle(sty()));
        this._obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        this._place();
      },
      onRemove(m) {
        m.off('move zoom resize viewreset', this._sync);
        this._obs.disconnect();
        this._gl.remove();
        L.DomUtil.remove(this._el);
      },
      _place() {
        const m = this._m, sz = m.getSize(), c = m.getCenter();
        L.DomUtil.setPosition(this._el, m.containerPointToLayerPoint([0, 0]));
        this._el.style.width = sz.x + 'px'; this._el.style.height = sz.y + 'px';
        this._gl.resize();
        this._gl.jumpTo({ center: [c.lng, c.lat], zoom: m.getZoom() - 1 });
      }
    });
    BASE[VEC] = new BASE[VEC]();
  }
  const fromFile = location.protocol === 'file:';
  let saved = null;
  try { saved = localStorage.getItem('tirana-mhd-base'); } catch (e) {}
  let current = BASE[saved] ? saved : BASE[VEC] ? VEC : fromFile ? 'Esri Streets' : 'OpenStreetMap';
  BASE[current].addTo(map);
  L.control.layers(BASE, null, { position: 'topright' }).addTo(map);
  const dimTiles = () => document.getElementById('map').classList.toggle('dim-tiles', current !== 'Esri Satellite' && current !== VEC);
  dimTiles();
  let tileOk = false, tileErr = 0, tileDismissed = false;
  const note = (key) => { if (tileDismissed) return; $('#tiletext').textContent = t(key); $('#tilenote').hidden = false; };
  for (const [name, layer] of Object.entries(BASE)) {
    if (!layer.on) continue;
    layer.on('tileload', () => { tileOk = true; });
    layer.on('tileerror', () => { if (!tileOk && ++tileErr === 2) note('tileNone'); });
  }
  map.on('baselayerchange', e => {
    current = e.name; dimTiles();
    try { localStorage.setItem('tirana-mhd-base', current); } catch (err) {}
    if (current === 'OpenStreetMap' && fromFile) note('tileOsmFile');
  });
  if (fromFile && current !== 'OpenStreetMap') note('tileFile');
  $('#tileclose').addEventListener('click', () => { tileDismissed = true; $('#tilenote').hidden = true; });
  const retheme = () => { restyle(); drawJourney(false); };

  const lineLayer = L.layerGroup().addTo(map);
  const stopLayer = L.layerGroup().addTo(map);
  const planLayer = L.layerGroup().addTo(map);
  let feed = null, lines = [], markers = new Map(), sel = { route: null, stop: null }, timer = null, source = null;
  let view = { kind: 'list' }, prevView = null;
  let baseTables = null, builtLang = null, mode = 'plan', demoMode = true, groups = new Map(), stopGroup = new Map(), names = [];
  let plan = { from: null, to: null, res: null, open: 0, timeTouched: false };
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const mins = s => Math.max(1, Math.round(s / 60));

  const status = (msg, err) => { const el = $('#status'); el.textContent = msg || ''; el.classList.toggle('err', !!err); };

  function draw() {
    lineLayer.clearLayers(); stopLayer.clearLayers(); lines = []; markers.clear();
    const routes = [...feed.routes.values()].sort((a, b) => b.stops.size - a.stops.size);
    for (const r of routes) for (const d of r.dirs) {
      const pl = L.polyline(d.line, { renderer, color: r.color, weight: 4, opacity: .9, lineCap: 'round', lineJoin: 'round' });
      pl.on('click', e => { if (mode !== 'browse') return; L.DomEvent.stop(e); openRoute(r); });
      pl.bindTooltip(r.short + (r.long ? ' · ' + r.long : ''), { sticky: true });
      pl.addTo(lineLayer);
      lines.push({ r, pl });
    }
    for (const s of feed.stops.values()) {
      const m = L.circleMarker([s.lat, s.lon], { renderer, radius: 2, weight: 1.5 });
      m.on('click', e => { L.DomEvent.stop(e); if (mode === 'plan') pickStop(s); else openStop(s); });
      m.bindTooltip(s.name, { direction: 'top', offset: [0, -4] });
      m.addTo(stopLayer);
      markers.set(s.id, { s, m });
    }
    restyle();
    const b = L.latLngBounds([...feed.stops.values()].map(s => [s.lat, s.lon]));
    if (b.isValid()) map.fitBounds(b, { padding: [24, 24] });
  }

  const sr = () => { const z = map.getZoom(); return z >= 16 ? 4 : z >= 14.5 ? 3.5 : z >= 13.5 ? 3 : 2; };
  map.on('zoomend', () => restyle());

  function restyle() {
    if (!feed) return;
    const sf = tok('--stop-fill'), ss = tok('--stop-stroke'), ac = tok('--accent');
    const R = sel.route, S = sel.stop;
    const J = mode === 'plan' && plan.res && plan.res.list[plan.open];
    if (mode === 'plan') {
      const ends = new Map();
      for (const s of plan.from ? plan.from.stops : []) ends.set(s.id, ac);
      for (const s of plan.to ? plan.to.stops : []) ends.set(s.id, ss);
      for (const { pl } of lines) pl.setStyle({ opacity: J ? .12 : .55, weight: 4 });
      for (const { s, m } of markers.values()) {
        const e = ends.get(s.id);
        m.setStyle({ radius: e ? 8 : sr(), color: e || ss, fillColor: e || sf, fillOpacity: J && !e ? .35 : 1, opacity: J && !e ? .35 : 1, weight: e ? 2.5 : 1.5 });
        if (e) m.bringToFront();
      }
      return;
    }
    for (const { r, pl } of lines) {
      const on = !R && !S || R === r || (!R && S && S.routes.has(r));
      pl.setStyle({ opacity: on ? .92 : .13, weight: R === r ? 6 : 4 });
      if (R === r || (!R && S && on)) pl.bringToFront();
    }
    for (const { s, m } of markers.values()) {
      const on = R ? R.stops.has(s) : true;
      const hit = S === s;
      m.setStyle({ radius: hit ? 8.5 : R && on ? sr() + 1 : sr(), color: hit ? ac : ss, fillColor: hit ? ac : sf, fillOpacity: on ? 1 : .3, opacity: on ? 1 : .3, weight: hit ? 2.5 : 1.5 });
      if ((R && on) || hit) m.bringToFront();
    }
    if (S && markers.has(S.id)) markers.get(S.id).m.bringToFront();
  }

  function renderExpiry() {
    const el = $('#expiry'), v = GTFS.validity(feed, GTFS.clock(feed.tz).ymd);
    const d = v.days, p = { d: fmtDate(v.state === 'future' ? feed.from : feed.to), n: d, u: d != null ? pl('uDay', d) : '' };
    const msg = demoMode || v.state === 'ok' ? '' : v.state === 'expired' ? t('expExpired', p) : v.state === 'future' ? t('expFuture', p) : t(d ? 'expSoon' : 'expSoon0', p);
    el.innerHTML = msg;
    el.hidden = !msg;
  }

  function metaData() {
    if (!baseTables) {
      return `<h2>${t('dataTitle')}</h2>
      <dl class="kv ds">
        <dt>${t('operator')}</dt><dd>${esc(feed.agencies.join(', ') || '–')}</dd>
        <dt>${t('valid')}</dt><dd>${fmtDate(feed.from)} – ${fmtDate(feed.to)}</dd>
      </dl>`;
    }
    const src = [{ name: baseTables.agency.map(a => (a.agency_name || '').trim()).filter(Boolean).join(', ') || '–', from: feed.from, to: feed.to, upd: feed.version }];
    for (const x of typeof EXTRA_FEEDS !== 'undefined' ? EXTRA_FEEDS : []) {
      const c = x.tables.calendar[0];
      src.push({ name: x.name || x.tables.agency[0].agency_name, from: c.start_date, to: c.end_date, upd: x.updated, url: x.url });
    }
    const fd = v => v ? fmtDate(String(v).replace(/-/g, '')) : '–';
    return `<h2>${t('dataTitle')}</h2>${src.map(x => `<dl class="kv ds">
        <dt>${t('operator')}</dt><dd>${esc(x.name)}</dd>
        <dt>${t('valid')}</dt><dd>${fd(x.from)} – ${fd(x.to)}</dd>
        <dt>${t('lastUpd')}</dt><dd>${fd(x.upd)}</dd>${x.url ? `
        <dt>${t('web')}</dt><dd><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.url.replace(/^https?:\/\//, ''))}</a></dd>` : ''}
      </dl>`).join('')}`;
  }

  function renderMeta() {
    const aboutBody = `<p><b>${esc(t('title'))}</b><br>${esc(t('aboutDesc'))}</p><p>${esc(t('aboutCredits'))}</p><p><b>${esc(t('aboutAuthor'))}:</b> <a href="https://besaweb.al" target="_blank" rel="noopener">besaweb.al</a><br><b>${esc(t('aboutContact'))}:</b> <a href="mailto:info@besaweb.al">info@besaweb.al</a></p>`;
    $('#meta').innerHTML = `<a class="mi mlink" href="tickets.html">${t('tickets')}</a>
      <button type="button" class="mi mtoggle" aria-expanded="false">${t('dataTitle')}</button><div class="mpane data">${metaData()}</div>
      <button type="button" class="mi mtoggle" aria-expanded="false">${t('aboutTitle')}</button><div class="mpane about">${aboutBody}</div>`;
    $('#aboutbox').innerHTML = `<h2>${t('aboutTitle')}</h2><div class="aboutbody">${aboutBody}</div>`;
  }

  const routeRow = r => {
    const d = r.dirs[0];
    const sub = r.long || (d.stops[0].name + ' – ' + d.stops[d.stops.length - 1].name);
    return `<button class="row" data-route="${esc(r.id)}">${chip(r)}<span class="t"><b>${esc(sub)}</b><span>${r.dirs.map(x => '→ ' + esc(x.head)).join('  ')}</span></span><span class="n">${r.stops.size}</span></button>`;
  };
  const stopRow = s => {
    const rs = [...s.routes].sort(byName);
    return `<button class="row" data-stop="${esc(s.id)}"><span class="dot"></span><span class="t"><b>${esc(s.name)}</b><span>${rs.slice(0, 8).map(r => esc(r.short)).join(' · ')}${rs.length > 8 ? ' …' : ''}</span></span></button>`;
  };

  function showList() {
    stopTimer();
    const q = norm($('#q').value.trim());
    const routes = [...feed.routes.values()].sort(byName).filter(r => !q || norm(r.short + ' ' + r.long).includes(q) || r.dirs.some(d => norm(d.head).includes(q)));
    let html = `<div class="sect"><span>${t('lines')}</span><span>${routes.length}</span></div>`;
    html += routes.length ? routes.map(routeRow).join('') : `<div class="empty">${t('noLines')}</div>`;
    if (q) {
      const st = [...feed.stops.values()].filter(s => norm(s.name).includes(q) || s.code.toLowerCase() === q).sort((a, b) => a.name.localeCompare(b.name, 'cs', { numeric: true })).slice(0, 40);
      html += `<div class="sect"><span>${t('stops')}</span><span>${st.length}</span></div>`;
      html += st.length ? st.map(stopRow).join('') : `<div class="empty">${t('noStops')}</div>`;
    } else {
      html += `<p class="hint">${t('hintList')}</p>`;
    }
    $('#panel').innerHTML = html;
  }

  function showRoute(r) {
    stopTimer();
    let html = `<button class="back" data-back>${t('backLines')}</button>
      <div class="head">${chip(r, 'lg')}<div><h2>${esc(r.long || r.short)}</h2><p>${r.stops.size} ${pl('uStop', r.stops.size)} · ${r.trips.length} ${pl('uTrip', r.trips.length)}</p></div></div>${r.desc ? `<p class="hint" style="margin-top:4px">${esc(r.desc)}</p>` : ''}`;
    for (const d of r.dirs) {
      html += `<div class="sect"><span>${t('dir', { h: esc(d.head) })}</span></div><ol class="board" style="--c:${r.color}">`;
      html += d.stops.map(s => {
        const other = [...s.routes].filter(x => x !== r).sort(byName);
        return `<li><button class="row" data-stop="${esc(s.id)}"><span class="dot"></span><span class="t"><b>${esc(s.name)}</b></span>${other.length ? `<span class="xfer">${other.slice(0, 4).map(x => chip(x)).join('')}${other.length > 4 ? '<span class="n">+' + (other.length - 4) + '</span>' : ''}</span>` : ''}</button></li>`;
      }).join('');
      html += `</ol>`;
    }
    $('#panel').innerHTML = html;
  }

  function showStop(s) {
    const now = GTFS.clock(feed.tz);
    const deps = GTFS.departures(feed, s, now, 10);
    const rs = [...s.routes].sort(byName);
    const backLabel = prevView && prevView.kind === 'route' ? t('backRoute', { r: esc(prevView.r.short) }) : t('backLines');
    let html = `<button class="back" data-back>${backLabel}</button>
      <div class="head"><span class="dot" style="margin:0 4px"></span><div><h2>${esc(s.name)}</h2><p>${s.code ? t('code', { c: esc(s.code) }) + ' · ' : ''}ID ${esc(s.id)}</p></div></div>
      <div class="chips">${rs.map(r => `<button data-route="${esc(r.id)}" title="${esc(r.long || r.short)}">${chip(r)}</button>`).join('')}</div>
      <div class="planbtns"><button class="btn sm" data-plan="from" data-sid="${esc(s.id)}"><span class="pin a">A</span>${t('planFrom')}</button><button class="btn sm" data-plan="to" data-sid="${esc(s.id)}"><span class="pin b">B</span>${t('planTo')}</button></div>
      <div class="sect"><span>${t('nextDeps')}</span><span class="clock">${esc(feed.tz.split('/').pop())} ${GTFS.hhmm(now.sec)}</span></div>`;
    if (deps.length) {
      html += `<table class="deps"><tbody>${deps.map(d => {
        const m = Math.max(0, Math.floor((d.t - now.sec) / 60));
        return `<tr><td class="tm">${GTFS.hhmm(d.t)}</td><td>${chip(d.tr.route)}</td><td class="hd">${esc(d.tr.head)}${d.hw ? `<small>${t('every', { n: Math.round(d.hw / 60) })}</small>` : ''}</td><td class="in ${m <= 3 ? 'soon' : ''}">${m === 0 ? t('nowLc') : t('inMin', { n: m })}</td></tr>`;
      }).join('')}</tbody></table>`;
      html += `<p class="hint">${t('approx')}</p>`;
      if (deps.some(d => d.hw)) html += `<p class="hint">${t('freqHint')}</p>`;
    } else {
      html += `<div class="empty">${t('noDeps')}</div>`;
    }
    $('#panel').innerHTML = html;
  }

  function render() {
    if (view.kind === 'list') showList();
    else if (view.kind === 'route') showRoute(view.r);
    else showStop(view.s);
    $('#panel').scrollTop = 0;
  }

  function openRoute(r, fit = true) {
    if (mode !== 'browse') setMode('browse', true);
    prevView = null;
    view = { kind: 'route', r };
    sel = { route: r, stop: null };
    restyle(); render();
    if (fit) map.fitBounds(L.latLngBounds(r.dirs.flatMap(d => d.line)), { padding: [30, 30], maxZoom: 16 });
  }

  function openStop(s, keepPrev) {
    if (!keepPrev) prevView = view.kind === 'route' ? view : view.kind === 'stop' ? prevView : null;
    view = { kind: 'stop', s };
    sel = { route: null, stop: s };
    restyle(); render();
    if (!map.getBounds().pad(-.1).contains([s.lat, s.lon])) map.panTo([s.lat, s.lon]);
    stopTimer();
    timer = setInterval(() => { if (view.kind === 'stop' && view.s === s) { const st = $('#panel').scrollTop; showStop(s); $('#panel').scrollTop = st; } }, 30000);
  }

  function openList() {
    prevView = null;
    view = { kind: 'list' };
    sel = { route: null, stop: null };
    restyle(); render();
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  $('#panel').addEventListener('click', e => {
    const pb = e.target.closest('[data-plan]');
    if (pb) { setEnd(pb.dataset.plan, stopGroup.get(pb.dataset.sid)); setMode('plan'); maybeRun(); return; }
    const jb = e.target.closest('[data-j]');
    if (jb) { plan.open = +jb.dataset.j === plan.open ? -1 : +jb.dataset.j; const st = $('#panel').scrollTop; showPlan(); $('#panel').scrollTop = st; drawJourney(true); restyle(); return; }
    const b = e.target.closest('[data-route],[data-stop],[data-back]');
    if (!b) return;
    if (b.hasAttribute('data-back')) {
      if (view.kind === 'stop' && prevView && prevView.kind === 'route') openRoute(prevView.r, false);
      else openList();
    } else if (b.dataset.route) openRoute(feed.routes.get(b.dataset.route));
    else if (b.dataset.stop) {
      const s = feed.stops.get(b.dataset.stop);
      openStop(s);
      map.setView([s.lat, s.lon], Math.max(map.getZoom(), 15));
    }
  });
  $('#q').addEventListener('input', () => { if (view.kind !== 'list') { view = { kind: 'list' }; sel = { route: null, stop: null }; restyle(); } showList(); });

  function setAttr() {
    map.attributionControl.removeAttribution(map._gtfsAttr || '');
    if (document.body.classList.contains('nodata')) return;
    map._gtfsAttr = demoMode ? t('attrDemo') : t('attr', { a: esc(feed.agencies.join(', ') || source) });
    map.attributionControl.addAttribution(map._gtfsAttr);
  }

  function setFeed(f, name, demo) {
    feed = f; source = name; demoMode = !!demo;
    document.body.classList.remove('nodata');
    $('#demo').hidden = !demo;
    setAttr();
    $('#q').value = '';
    groups = new Map(); stopGroup = new Map();
    names = GTFS.groupStops([...f.stops.values()]);
    names.forEach((g, i) => {
      g.id = 'g' + i; g.key = norm(g.label); g.routes = new Set();
      groups.set(g.id, g);
      for (const s of g.stops) { stopGroup.set(s.id, g); for (const r of s.routes) g.routes.add(r); }
    });
    names.sort((a, b) => a.label.localeCompare(b.label, 'cs', { numeric: true }));
    plan = { from: null, to: null, res: null, open: 0, timeTouched: false };
    $('#from').value = ''; $('#to').value = '';
    planLayer.clearLayers();
    renderMeta(); renderExpiry(); draw();
    if (mode === 'plan') { setNow(); showPlan(); restyle(); } else openList();
  }

  function setMode(m, quiet) {
    mode = m;
    $('#tab-browse').setAttribute('aria-selected', m === 'browse');
    $('#tab-plan').setAttribute('aria-selected', m === 'plan');
    $('.search').hidden = m !== 'browse';
    $('#planform').hidden = m !== 'plan';
    if (m === 'plan') {
      stopTimer();
      if (!plan.timeTouched) setNow();
      showPlan(); drawJourney(false); restyle();
    } else {
      planLayer.clearLayers();
      if (!quiet) { render(); restyle(); }
    }
  }
  $('#tab-browse').addEventListener('click', () => setMode('browse'));
  $('#tab-plan').addEventListener('click', () => setMode('plan'));

  function setNow() {
    const c = GTFS.clock(feed.tz);
    $('#time').value = GTFS.hhmm(c.sec);
    $('#day').value = '0';
  }

  function setEnd(which, g) {
    plan[which] = g;
    $('#' + which).value = g ? g.label : '';
    plan.res = null;
    planLayer.clearLayers();
  }

  function pickStop(s) {
    const g = stopGroup.get(s.id);
    if (!plan.from || (plan.from && plan.to && plan.from === g)) setEnd('from', g);
    else setEnd('to', g);
    showPlan(); restyle();
    maybeRun();
  }

  function maybeRun() { if (plan.from && plan.to) runPlan(); }

  function runPlan() {
    if (!plan.from || !plan.to) { showPlan(t('pickBoth')); return; }
    const c = GTFS.clock(feed.tz);
    const day = $('#day').value === '1' ? { ...GTFS.nextDay(c.ymd, c.wd) } : { ymd: c.ymd, wd: c.wd };
    const m = /^(\d{1,2}):(\d{2})/.exec($('#time').value || '');
    const t0 = m ? +m[1] * 3600 + +m[2] * 60 : c.sec;
    const r = GTFS.plan(feed, plan.from.stops, plan.to.stops, day, t0);
    plan.res = { ...r, t0, today: day.ymd === c.ymd };
    plan.open = r.list.length ? 0 : -1;
    showPlan(); drawJourney(true); restyle();
  }

  const legIcon = l => l.kind === 'walk'
    ? `<span class="wk" title="${t('walk')}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="2.8" r="1.4"/><path d="M8.4 5.6 6.6 9.2l2.4 1.6.8 3.6M8.4 5.6l2.2 2.4 2 .6M6.6 9.2 5.2 13.6M8.4 5.6 5.8 6.8 4.8 9"/></svg></span>`
    : chip(l.route);

  function showPlan(msg) {
    const r = plan.res;
    let html = '';
    if (msg) html += `<div class="empty">${esc(msg)}</div>`;
    if (!r) {
      html += `<p class="hint">${t('hintPlan')}</p>`;
      html += `<div class="gplay"><p class="hint">${t('gplaySoon')}</p><div class="gprow"><a class="gpbtn" href="https://ko-fi.com/tiranabus" target="_blank" rel="noopener"><svg viewBox="0 0 24 26" aria-hidden="true"><path fill="#00D7FE" d="M1.5 1.2 13 13 1.5 24.8c-.3-.3-.5-.7-.5-1.2V2.4c0-.5.2-.9.5-1.2z"/><path fill="#00F076" d="M16.8 9.2 13 13 1.5 1.2c.5-.3 1.1-.3 1.7 0z"/><path fill="#FF3A44" d="M16.8 16.8 3.2 24.8c-.6.3-1.2.3-1.7 0L13 13z"/><path fill="#FFD500" d="M22 11.9c.9.5.9 1.7 0 2.2l-5.2 2.7L13 13l3.8-3.8z"/></svg><span><small>DONATION FOR</small><b>Google Play</b></span></a></div></div>`;
    } else if (r.same) {
      html += `<div class="empty">${t('same')}</div>`;
    } else if (!r.list.length) {
      html += `<div class="empty">${t('noRes', { t: GTFS.hhmm(r.t0) })}</div>`;
    } else {
      const now = GTFS.clock(feed.tz).sec;
      html += `<div class="sect"><span>${esc(plan.from.label)} → ${esc(plan.to.label)}</span><span>${r.list.length}</span></div>`;
      html += r.list.map((j, i) => {
        const wait = r.today ? Math.floor((j.dep - now) / 60) : null;
        const sum = `<button class="jsum" data-j="${i}" aria-expanded="${i === plan.open}">
          <span class="jt"><b>${GTFS.hhmm(j.dep)} – ${GTFS.hhmm(j.arr)}</b><span>${t('minutes', { n: mins(j.arr - j.dep) })} · ${j.rides ? (j.transfers ? j.transfers + ' ' + pl('uTransfer', j.transfers) : t('direct')) + ' · <span class="nw">' + fareText(j) + '</span>' : t('walkOnly')}</span></span>
          <span class="jlegs">${j.legs.filter(l => l.kind === 'ride' || l.m > 150 || j.legs.length === 1).map(legIcon).join('<i>›</i>')}</span>
          ${wait != null && wait >= 0 && wait < 120 ? `<span class="jin ${wait <= 5 ? 'soon' : ''}">${wait === 0 ? t('nowLc') : t('inMin', { n: wait })}</span>` : ''}
        </button>`;
        return `<div class="jrn ${i === plan.open ? 'open' : ''}">${sum}${i === plan.open ? detail(j) : ''}</div>`;
      }).join('');
      html += `<p class="hint">${t('approx')}</p>`;
      if (r.list.some(j => j.legs.some(l => l.kind === 'ride' && l.inst.tr.freq))) html += `<p class="hint">${t('freqHintPlan')}</p>`;
    }
    $('#panel').innerHTML = html;
  }

  function detail(j) {
    let out = '<ol class="legs">', prevArr = null;
    for (const l of j.legs) {
      if (l.kind === 'ride') {
        if (prevArr != null && l.dep - prevArr >= 120) out += `<li class="leg wait">${t('wait', { n: mins(l.dep - prevArr) })}</li>`;
        const n = l.k1 - l.k0;
        const mid = l.inst.tr.st.slice(l.k0 + 1, l.k1).map(x => feed.stops.get(x.stop).name);
        out += `<li class="leg ride" style="--c:${l.route.color}">
          <div class="lh">${chip(l.route)}<span>${t('dirLeg', { h: '<b>' + esc(l.head) + '</b>' })}</span></div>
          <div class="ls"><time>${GTFS.hhmm(l.dep)}</time><span>${esc(l.from.name)}</span></div>
          ${mid.length ? `<details class="lm"><summary>${n} ${pl('uStop', n)} · ${t('minutes', { n: mins(l.arr - l.dep) })}</summary><ul>${mid.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : `<div class="lm">${n} ${pl('uStop', n)} · ${t('minutes', { n: mins(l.arr - l.dep) })}</div>`}
          <div class="ls"><time>${GTFS.hhmm(l.arr)}</time><span>${esc(l.to.name)}</span></div>
        </li>`;
      } else {
        out += `<li class="leg walk">${legIcon(l)}<span>${t('walkLeg', { n: mins(l.arr - l.dep), m: Math.round(l.m / 10) * 10 })}<br><small>${l.from.name === l.to.name ? t('walkCross') : ''}${t('walkTo', { s: esc(l.to.name) })}</small></span></li>`;
      }
      prevArr = l.arr;
    }
    return out + '</ol>';
  }

  function drawJourney(fit) {
    planLayer.clearLayers();
    const j = plan.res && plan.res.list[plan.open];
    if (!j || mode !== 'plan') return;
    const pts = [], panel = tok('--panel'), fg = tok('--fg'), ac = tok('--accent');
    for (const l of j.legs) {
      if (l.kind === 'ride') {
        const path = GTFS.legPath(feed, l);
        pts.push(...path);
        L.polyline(path, { renderer, interactive: false, color: panel, weight: 11, opacity: .9, lineCap: 'round', lineJoin: 'round' }).addTo(planLayer);
        L.polyline(path, { renderer, interactive: false, color: l.route.color, weight: 7, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(planLayer);
      } else {
        const path = [[l.from.lat, l.from.lon], [l.to.lat, l.to.lon]];
        pts.push(...path);
        L.polyline(path, { renderer, interactive: false, color: fg, weight: 3.5, opacity: .85, dashArray: '1 8', lineCap: 'round' }).addTo(planLayer);
      }
    }
    for (const l of j.legs) if (l.kind === 'ride') for (const x of l.inst.tr.st.slice(l.k0 + 1, l.k1)) {
      const s = feed.stops.get(x.stop);
      if (s) L.circleMarker([s.lat, s.lon], { renderer, interactive: false, radius: 4, color: l.route.color, weight: 2.5, fillColor: panel, fillOpacity: 1 }).bindTooltip(s.name).addTo(planLayer);
    }
    for (const l of j.legs) if (l.kind === 'ride') for (const s of [l.from, l.to]) L.circleMarker([s.lat, s.lon], { renderer, interactive: false, radius: 5.5, color: l.route.color, weight: 3, fillColor: panel, fillOpacity: 1 }).bindTooltip(s.name).addTo(planLayer);
    const o = j.legs.length ? j.legs[0].from : j.origin, dst = j.dest;
    L.circleMarker([o.lat, o.lon], { renderer, interactive: false, radius: 8, color: panel, weight: 2.5, fillColor: ac, fillOpacity: 1 }).addTo(planLayer);
    L.circleMarker([dst.lat, dst.lon], { renderer, interactive: false, radius: 8, color: panel, weight: 2.5, fillColor: fg, fillOpacity: 1 }).addTo(planLayer);
    if (fit && pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 });
  }

  function suggest(which) {
    const inp = $('#' + which), box = $('#' + which + '-sugg');
    const q = norm(inp.value.trim());
    if (!q) { box.hidden = true; box.innerHTML = ''; return []; }
    const hits = names.filter(g => g.key.includes(q)).sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q))).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map((g, i) => `<button type="button" class="sg ${i === 0 ? 'act' : ''}" data-name="${esc(g.id)}"><b>${esc(g.label)}</b><span>${[...g.routes].sort(byName).slice(0, 6).map(r => esc(r.short)).join(' · ')}</span></button>`).join('')
      : `<div class="sg none">${t('noStop')}</div>`;
    box.hidden = false;
    return hits;
  }
  for (const which of ['from', 'to']) {
    const inp = $('#' + which), box = $('#' + which + '-sugg');
    inp.addEventListener('input', () => { plan[which] = null; plan.res = null; planLayer.clearLayers(); suggest(which); restyle(); });
    inp.addEventListener('focus', () => { if (inp.value && !plan[which]) suggest(which); });
    inp.addEventListener('blur', () => setTimeout(() => { box.hidden = true; }, 150));
    inp.addEventListener('keydown', e => {
      const items = [...box.querySelectorAll('.sg[data-name]')];
      if (box.hidden || !items.length) return;
      let i = items.findIndex(x => x.classList.contains('act'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[i] && items[i].classList.remove('act');
        i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        choose(which, items[Math.max(0, i)].dataset.name);
      } else if (e.key === 'Escape') box.hidden = true;
    });
    box.addEventListener('mousedown', e => {
      const b = e.target.closest('[data-name]');
      if (!b) return;
      e.preventDefault();
      choose(which, b.dataset.name);
    });
  }
  function choose(which, name) {
    setEnd(which, groups.get(name));
    $('#' + which + '-sugg').hidden = true;
    restyle();
    if (plan.from && plan.to) runPlan();
    else { showPlan(); const g = plan[which]; if (g) map.panTo([g.stops[0].lat, g.stops[0].lon]); $('#' + (which === 'from' ? 'to' : 'from')).focus(); }
  }
  function resolveTyped(which) {
    if (plan[which]) return;
    const v = norm($('#' + which).value.trim());
    if (!v) return;
    const exact = names.filter(g => g.key === v);
    const hits = exact.length ? exact : names.filter(g => g.key.includes(v));
    if (hits.length === 1) setEnd(which, hits[0]);
  }
  $('#swap').addEventListener('click', () => {
    const a = plan.from, b = plan.to, va = $('#from').value, vb = $('#to').value;
    plan.from = b; plan.to = a; $('#from').value = vb; $('#to').value = va;
    plan.res = null; planLayer.clearLayers();
    restyle();
    if (plan.from && plan.to) runPlan(); else showPlan();
  });
  $('#nowbtn').addEventListener('click', () => { plan.timeTouched = false; setNow(); maybeRun(); });
  $('#time').addEventListener('change', () => { plan.timeTouched = true; maybeRun(); });
  $('#day').addEventListener('change', () => { plan.timeTouched = true; maybeRun(); });
  $('#planform').addEventListener('submit', e => {
    e.preventDefault();
    resolveTyped('from'); resolveTyped('to');
    if (!plan.from || !plan.to) { showPlan(t(!plan.from ? 'errFrom' : 'errTo')); return; }
    runPlan();
  });

  function buildFeed() {
    let tt = baseTables;
    const extras = typeof EXTRA_FEEDS !== 'undefined' ? EXTRA_FEEDS : [];
    for (const x of extras) tt = GTFS.merge(tt, EXTRA_FEEDS.localize(x, I18N.lang), x.id + ':');
    const f = GTFS.build(tt);
    f.extras = extras.map(x => x.label);
    builtLang = I18N.lang;
    return f;
  }

  async function loadFile(file) {
    if (!file) return;
    status(t('loading', { f: file.name }));
    let zip;
    try { zip = await JSZip.loadAsync(file); }
    catch (e) { status(t('errZip'), true); return; }
    try {
      const tb = await GTFS.readZip(zip, txt => Papa.parse(txt, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() }).data);
      status(t('processing'));
      await new Promise(r => setTimeout(r, 30));
      baseTables = tb;
      setFeed(buildFeed(), file.name, false);
      status('');
    } catch (e) {
      status((e && e.message) || t('errProc'), true);
    }
  }

  let dragDepth = 0;
  addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dragDepth++; $('#app').classList.add('dropping'); } });
  addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#app').classList.remove('dropping'); } });
  addEventListener('drop', e => { e.preventDefault(); dragDepth = 0; $('#app').classList.remove('dropping'); const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) loadFile(f); });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const menuBtn = $('#menubtn'), menuBox = $('#meta');
  const aboutBtn = $('#aboutbtn'), aboutBox = $('#aboutbox');
  const fitPop = box => {
    box.style.right = '';
    if (matchMedia('(max-width: 760px)').matches) return;
    const r = box.getBoundingClientRect();
    if (r.left < 8) box.style.right = (r.left - 8) + 'px';
    else if (r.right > innerWidth - 8) box.style.right = (r.right - innerWidth + 8) + 'px';
  };
  const setMenu = o => { menuBox.hidden = !o; menuBtn.setAttribute('aria-expanded', o); if (o) { setAbout(false); fitPop(menuBox); } };
  const setAbout = o => { aboutBox.hidden = !o; aboutBtn.setAttribute('aria-expanded', o); if (o) { setMenu(false); fitPop(aboutBox); } };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(menuBox.hidden); });
  aboutBtn.addEventListener('click', e => { e.stopPropagation(); setAbout(aboutBox.hidden); });
  document.addEventListener('click', e => { if (!menuBox.contains(e.target)) setMenu(false); if (!aboutBox.contains(e.target)) setAbout(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); setAbout(false); } });
  menuBox.addEventListener('click', e => {
    const b = e.target.closest('.mtoggle');
    if (!b) return;
    const pane = b.nextElementSibling, open = !pane.classList.contains('open');
    for (const x of menuBox.querySelectorAll('.mpane')) x.classList.remove('open');
    for (const x of menuBox.querySelectorAll('.mtoggle')) x.setAttribute('aria-expanded', 'false');
    if (open) { pane.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  });
  const themeBtn = $('#theme');
  const isDark = () => document.documentElement.dataset.theme === 'dark';
  function syncTheme() {
    const k = isDark() ? 'themeLight' : 'themeDark';
    themeBtn.setAttribute('aria-label', t(k)); themeBtn.title = t(k);
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('tirana-mhd-theme'); } catch (e) {}
  document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  themeBtn.addEventListener('click', () => {
    const th = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = th;
    try { localStorage.setItem('tirana-mhd-theme', th); } catch (e) {}
    syncTheme();
  });

  function applyLang() {
    const l = I18N.lang;
    document.documentElement.lang = l;
    document.title = t('title');
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
    for (const el of document.querySelectorAll('[data-i18n-ph]')) el.placeholder = t(el.dataset.i18nPh);
    for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
    for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
    for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === l);
    menuBtn.setAttribute('aria-label', t('dataTitle')); menuBtn.title = t('dataTitle');
    syncTheme();
    if (!feed) return;
    if (baseTables && builtLang !== l) { setFeed(buildFeed(), source, false); return; }
    setAttr(); renderMeta(); renderExpiry();
    if (mode === 'plan') showPlan(); else { const st = $('#panel').scrollTop; render(); $('#panel').scrollTop = st; }
  }
  const langBox = $('.lang'), narrow = matchMedia('(max-width: 760px)');
  document.addEventListener('click', e => { if (!langBox.contains(e.target)) langBox.classList.remove('open'); });
  for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => {
    if (narrow.matches && !langBox.classList.contains('open')) { langBox.classList.add('open'); return; }
    langBox.classList.remove('open');
    I18N.setLang(b.dataset.lang);
    try { localStorage.setItem('tirana-mhd-lang', b.dataset.lang); } catch (e) {}
    applyLang();
  });
  let savedLang = null;
  try { savedLang = localStorage.getItem('tirana-mhd-lang'); } catch (e) {}
  I18N.setLang(savedLang || I18N.detect(navigator.languages || [navigator.language]));

  setFeed(GTFS.build(demoTables()), null, true);
  applyLang();

  const boot = $('#boot');
  const endBoot = fail => {
    if (!fail) { boot.classList.add('done'); return; }
    boot.classList.add('fail');
    $('#boottext').dataset.i18n = 'bootFail'; $('#boottext').textContent = t('bootFail');
    setTimeout(() => {
      document.body.classList.add('nodata');
      lineLayer.clearLayers(); stopLayer.clearLayers(); planLayer.clearLayers();
      map.attributionControl.removeAttribution(map._gtfsAttr);
      $('#demo').dataset.i18nHtml = 'dataFail'; $('#demo').innerHTML = t('dataFail'); $('#demo').hidden = false;
      boot.classList.add('done');
    }, 1800);
  };
  async function autoLoad() {
    if (!/^https?:$/.test(location.protocol)) { boot.classList.add('done'); return; }
    $('#demo').hidden = true;
    try {
      const r = await fetch('gtfs.zip', { cache: 'no-cache' });
      if (!r.ok) throw 0;
      const b = await r.blob();
      if (source === null) await loadFile(new File([b], 'gtfs.zip'));
    } catch (e) {}
    endBoot(source === null);
  }
  autoLoad();
})();
