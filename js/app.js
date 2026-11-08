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
  const fmtDate = s => s && s.length === 8 ? (I18N.lang === 'cs' ? `${+s.slice(6)}. ${+s.slice(4, 6)}. ${s.slice(0, 4)}` : ['de', 'pl', 'ru', 'mk', 'tr'].includes(I18N.lang) ? `${s.slice(6)}.${s.slice(4, 6)}.${s.slice(0, 4)}` : `${s.slice(6)}/${s.slice(4, 6)}/${s.slice(0, 4)}`) : '–';
  const FARE = { lek: 40, luna: { 'rx:RX': 400, 'rx:RT': 300 }, cur: { cs: ['CZK', .268], en: ['EUR', .011], sq: null, it: ['EUR', .011], de: ['EUR', .011], pl: ['PLN', .047], fr: ['EUR', .011], es: ['EUR', .011], el: ['EUR', .011], ru: ['EUR', .011], mk: ['MKD', .68], tr: ['EUR', .011] } };
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
  let ext = false, pidx = null, pload = null;
  try { ext = localStorage.getItem('tirana-mhd-ext') === '1'; } catch (e) {}
  let wnet = null, wload = null;
  const loadNet = () => {
    if (!wload) wload = fetch('data/walk.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => { wnet = Places.net(d); useNet(); }).catch(() => { wload = null; });
    return wload;
  };
  loadNet();
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const mins = s => Math.max(1, Math.round(s / 60));

  const status = (msg, err) => { const el = $('#status'); el.textContent = msg || ''; el.classList.toggle('err', !!err); };

  const scr = () => getComputedStyle($('#panel')).overflowY === 'visible' ? $('.side') : $('#panel');
  const fit = (b, p, maxZoom) => { if (b.isValid()) map.fitBounds(b, { padding: [p, p], maxZoom }); };
  if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize({ pan: false })).observe($('#map'));

  function draw() {
    lineLayer.clearLayers(); stopLayer.clearLayers(); lines = []; markers.clear();
    const routes = [...feed.routes.values()].sort((a, b) => b.stops.size - a.stops.size);
    for (const r of routes) for (const d of r.dirs) {
      const pl = L.polyline(d.line, { renderer, color: r.color, weight: 4, opacity: .9, lineCap: 'round', lineJoin: 'round' });
      pl.on('click', e => { if (mode !== 'browse') return; L.DomEvent.stop(e); openRoute(r); });
      pl.bindTooltip(esc(r.short + (r.long ? ' · ' + r.long : '')), { sticky: true });
      pl.addTo(lineLayer);
      lines.push({ r, pl });
    }
    for (const s of feed.stops.values()) {
      const m = L.circleMarker([s.lat, s.lon], { renderer, radius: 2, weight: 1.5 });
      m.on('click', e => { L.DomEvent.stop(e); if (prePick) prePickAt(s.lat, s.lon, s); else if (poiPick) poiForm(s.lat, s.lon, poiPick); else if (mode === 'plan') pickStop(s); else openStop(s); });
      m.bindTooltip(esc(s.name), { direction: 'top', offset: [0, -4] });
      m.addTo(stopLayer);
      markers.set(s.id, { s, m });
    }
    restyle();
    poiDraw();
    const b = L.latLngBounds([...feed.stops.values()].map(s => [s.lat, s.lon]));
    fit(b, 24);
  }

  const sr = () => { const z = map.getZoom(); return z >= 16 ? 4 : z >= 14.5 ? 3.5 : z >= 13.5 ? 3 : 2; };
  map.on('zoomend', () => restyle());

  function restyle() {
    if (!feed) return;
    poiStyle();
    const sf = tok('--stop-fill'), ss = tok('--stop-stroke'), ac = tok('--accent');
    const R = sel.route, S = sel.stop;
    const J = mode === 'plan' && plan.res && plan.res.list[plan.open];
    if (mode === 'plan') {
      const ends = new Map();
      for (const s of plan.from && !plan.from.place ? plan.from.stops : []) ends.set(s.id, ac);
      for (const s of plan.to && !plan.to.place ? plan.to.stops : []) ends.set(s.id, ss);
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

  const MICO = {
    tk: '<path d="M3 8.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6.5v11" stroke-dasharray="2 2.2"/>',
    dark: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    data: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>',
    about: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    ext: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/>',
    bus: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.7"/>',
    air: '<path d="M10.5 4.5c0-1 .7-1.8 1.5-1.8s1.5.8 1.5 1.8v5.2l7 4.3v2l-7-2v3.7l2 1.5v1.5L12 20l-3.5 1v-1.5l2-1.5v-3.7l-7 2v-2l7-4.3z"/>'
  };
  const mil = (k, txt) => `<span class="mil"><svg class="mico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MICO[k]}</svg><span>${txt}</span></span>`;
  const themeItem = () => { const d = document.documentElement.dataset.theme === 'dark'; return mil(d ? 'light' : 'dark', t(d ? 'themeLight' : 'themeDark')); };

  let extHelpOpen = false;
  const VERSION = '1.04';
  function renderMeta() {
    const aboutBody = `<p><b>${esc(t('title'))}</b><br>${esc(t('aboutDesc'))}</p><p>${esc(t('aboutCredits'))}</p><p><b>${esc(t('aboutAuthor'))}:</b> <a href="https://besaweb.al" target="_blank" rel="noopener">besaweb.al</a><br><b>${esc(t('aboutContact'))}:</b> <a href="mailto:info@besaweb.al">info@besaweb.al</a><br><b>${esc(t('aboutVer'))}:</b> ${esc(window.APP_VERSION || VERSION)}</p><p><a href="privacy.html">${esc(t('privacy'))}</a>${typeof Consent !== 'undefined' && Consent.enabled ? ` · <a href="#" class="adprefs">${esc(t('adPrefs'))}</a>` : ''}</p>`;
    const seo = window.APP_VERSION ? '' : `<a class="mi mlink" href="${I18N.lang}/lines/">${mil('bus', t('lines'))}</a><a class="mi mlink" href="${I18N.lang}/airport/">${mil('air', t('seoAirNav'))}</a>`;
    $('#meta').innerHTML = `<a class="mi mlink" href="tickets.html">${mil('tk', t('tickets'))}</a>${seo}
      <button type="button" class="mi mtheme" id="themeitem">${themeItem()}</button>
      <button type="button" class="mi mtoggle" aria-expanded="false">${mil('data', t('dataTitle'))}</button><div class="mpane data">${metaData()}</div>
      <button type="button" class="mi mtoggle" aria-expanded="false">${mil('about', t('aboutTitle'))}</button><div class="mpane about">${aboutBody}</div>
      <div class="mextwrap"><button type="button" class="mi mext" role="switch" aria-checked="${ext}">${mil('ext', t('extSearch'))}<span class="sw" aria-hidden="true"></span></button><button type="button" class="mhelp" aria-expanded="${extHelpOpen}" aria-controls="exthelp" aria-label="${esc(t('extHelpLbl'))}" title="${esc(t('extHelpLbl'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg></button></div><p class="mexthelp" id="exthelp" ${extHelpOpen ? '' : 'hidden'}>${esc(t(window.APP_VERSION ? 'extHelp' : 'extHelpW'))}</p>`;
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
    scr().scrollTop = 0;
  }

  function openRoute(r, zoom = true) {
    if (mode !== 'browse') setMode('browse', true);
    prevView = null;
    view = { kind: 'route', r };
    sel = { route: r, stop: null };
    restyle(); render();
    if (zoom) fit(L.latLngBounds(r.dirs.flatMap(d => d.line)), 30, 16);
  }

  function openStop(s, keepPrev) {
    if (!keepPrev) prevView = view.kind === 'route' ? view : view.kind === 'stop' ? prevView : null;
    view = { kind: 'stop', s };
    sel = { route: null, stop: s };
    restyle(); render();
    if (!map.getBounds().pad(-.1).contains([s.lat, s.lon])) map.panTo([s.lat, s.lon]);
    stopTimer();
    timer = setInterval(() => { if (view.kind === 'stop' && view.s === s) { const el = scr(), st = el.scrollTop; showStop(s); el.scrollTop = st; } }, 30000);
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
    if (jb) { plan.open = +jb.dataset.j === plan.open ? -1 : +jb.dataset.j; const el = scr(), st = el.scrollTop; showPlan(); el.scrollTop = st; drawJourney(true); restyle(); return; }
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

  function useNet() {
    if (!feed || !wnet || feed.walkFn) return;
    feed.walkFn = (st, lim) => Places.stopWalks(wnet, st, lim);
    feed.walk = null;
    if (plan.res && plan.from && plan.to) runPlan();
  }

  function setFeed(f, name, demo) {
    feed = f; source = name; demoMode = !!demo;
    useNet();
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
    preMarkers();
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
    const r = GTFS.plan(feed, plan.from.stops, plan.to.stops, day, t0, 5, plan.from.place || plan.to.place ? accOf(plan.from, plan.to) : undefined);
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
      html += `<p class="hint lg">${t('hintPlan')}</p>`;
      html += `<div class="gplay"><p class="hint lg">${t('gplaySoon')}</p><div class="gprow"><a class="gpbtn" href="https://ko-fi.com/tiranabus" target="_blank" rel="noopener"><svg viewBox="0 0 24 26" aria-hidden="true"><path fill="#00D7FE" d="M1.5 1.2 13 13 1.5 24.8c-.3-.3-.5-.7-.5-1.2V2.4c0-.5.2-.9.5-1.2z"/><path fill="#00F076" d="M16.8 9.2 13 13 1.5 1.2c.5-.3 1.1-.3 1.7 0z"/><path fill="#FF3A44" d="M16.8 16.8 3.2 24.8c-.6.3-1.2.3-1.7 0L13 13z"/><path fill="#FFD500" d="M22 11.9c.9.5.9 1.7 0 2.2l-5.2 2.7L13 13l3.8-3.8z"/></svg><span><small>DONATION FOR</small><b>Google Play</b></span></a><a class="gpbtn" href="https://ko-fi.com/tiranabus" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg><span><small>DONATION FOR</small><b>App Store</b></span></a></div><a href="https://ko-fi.com/tiranabus" target="_blank" rel="noopener"><img class="promo" src="img/promo.webp" alt="${esc(t('promoAlt'))}" width="640" height="640" loading="lazy"></a><a class="kofi" href="https://ko-fi.com/tiranabus" target="_blank" rel="noopener"><img src="img/kofi.webp" alt="${esc(t('kofiAlt'))}" width="400" height="212" loading="lazy"></a></div>`;
    } else if (r.same) {
      html += `<div class="empty">${t('same')}</div>`;
    } else if (!r.list.length) {
      html += `<div class="empty">${t('noRes', { t: GTFS.hhmm(r.t0) })}</div>`;
    } else {
      const now = GTFS.clock(feed.tz).sec;
      html += `<div class="jhead"><span class="ji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.7"/></svg></span><b>${esc(plan.from.label)} → ${esc(plan.to.label)}</b><span class="n">${r.list.length}</span></div>`;
      html += r.list.map((j, i) => {
        const wait = r.today ? Math.floor((j.dep - now) / 60) : null;
        const sum = `<button class="jsum" data-j="${i}" aria-expanded="${i === plan.open}">
          <span class="jt">${GTFS.hhmm(j.dep)} – ${GTFS.hhmm(j.arr)}</span>
          ${wait != null && wait >= 0 && wait < 120 ? `<span class="jin ${wait <= 5 ? 'soon' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>${wait === 0 ? t('nowLc') : t('inMin', { n: wait })}</span>` : ''}
          <span class="jm">${t('minutes', { n: mins(j.arr - j.dep) })} · ${j.rides ? (j.transfers ? j.transfers + ' ' + pl('uTransfer', j.transfers) : t('direct')) + ' · <span class="nw">' + fareText(j) + '</span>' : t('walkOnly')}</span>
          <span class="jlegs">${j.legs.filter(l => l.kind === 'ride' || l.m > 150 || j.legs.length === 1).map(legIcon).join('<i>›</i>')}</span><span class="chev" aria-hidden="true"></span>
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
        const mid = l.inst.tr.st.slice(l.k0 + 1, l.k1).map(x => [x.dep + l.inst.base, feed.stops.get(x.stop).name]);
        out += `<li class="leg ride" style="--c:${l.route.color}">
          <div class="lh">${chip(l.route)}<span>${t('dirLeg', { h: '<b>' + esc(l.head) + '</b>' })}</span></div>
          <div class="ls a"><time>${GTFS.hhmm(l.dep)}</time><span>${esc(l.from.name)}</span></div>
          ${mid.length ? `<details class="lm"><summary>${n} ${pl('uStop', n)} · ${t('minutes', { n: mins(l.arr - l.dep) })}</summary><ul>${mid.map(([s, x]) => `<li><time>${GTFS.hhmm(s)}</time><span>${esc(x)}</span></li>`).join('')}</ul></details>` : `<div class="lm">${n} ${pl('uStop', n)} · ${t('minutes', { n: mins(l.arr - l.dep) })}</div>`}
          <div class="ls b"><time>${GTFS.hhmm(l.arr)}</time><span>${esc(l.to.name)}</span></div>
        </li>`;
      } else {
        out += `<li class="leg walk">${legIcon(l)}<span>${t('walkLeg', { n: mins(l.arr - l.dep), m: Math.round(l.m / 10) * 10 })}<br><small>${!l.acc && l.from.name === l.to.name ? t('walkCross') : ''}${t(String(l.to.id)[0] === '@' ? 'walkPlace' : 'walkTo', { s: esc(l.to.name) })}</small></span></li>`;
      }
      prevArr = l.arr;
    }
    return out + '</ol>';
  }

  function drawJourney(zoom) {
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
        const path = Places.route(wnet, [l.from.lat, l.from.lon], [l.to.lat, l.to.lon]);
        pts.push(...path);
        L.polyline(path, { renderer, interactive: false, color: fg, weight: 3.5, opacity: .85, dashArray: '1 8', lineCap: 'round' }).addTo(planLayer);
      }
    }
    for (const l of j.legs) if (l.kind === 'ride') for (const x of l.inst.tr.st.slice(l.k0 + 1, l.k1)) {
      const s = feed.stops.get(x.stop);
      if (s) L.circleMarker([s.lat, s.lon], { renderer, interactive: false, radius: 4, color: l.route.color, weight: 2.5, fillColor: panel, fillOpacity: 1 }).bindTooltip(esc(s.name)).addTo(planLayer);
    }
    for (const l of j.legs) if (l.kind === 'ride') for (const s of [l.from, l.to]) L.circleMarker([s.lat, s.lon], { renderer, interactive: false, radius: 5.5, color: l.route.color, weight: 3, fillColor: panel, fillOpacity: 1 }).bindTooltip(esc(s.name)).addTo(planLayer);
    const o = j.legs.length ? j.legs[0].from : j.origin, dst = j.dest;
    L.circleMarker([o.lat, o.lon], { renderer, interactive: false, radius: 8, color: panel, weight: 2.5, fillColor: ac, fillOpacity: 1 }).addTo(planLayer);
    L.circleMarker([dst.lat, dst.lon], { renderer, interactive: false, radius: 8, color: panel, weight: 2.5, fillColor: fg, fillOpacity: 1 }).addTo(planLayer);
    if (zoom && pts.length) fit(L.latLngBounds(pts), 40, 16);
  }

  const PICO = {
    stop: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 18v2.5M16 18v2.5"/><circle cx="8.5" cy="14.5" r=".6"/><circle cx="15.5" cy="14.5" r=".6"/>',
    road: '<path d="M8 3 5 21M16 3l3 18M12 4v3M12 10.5v3M12 17v3"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    sight: '<path d="M10 21V8l2-5 2 5v13M7 21h10"/>',
    museum: '<path d="M3 21h18M5 21V10M19 21V10M9.5 21V10M14.5 21V10M3 10l9-6 9 6z"/>',
    gov: '<path d="M3 21h18M5 21V10h14v11M3 10l9-6 9 6M9 14v4M15 14v4M12 14v4"/>',
    health: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
    edu: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v5"/>',
    air: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    park: '<path d="M12 21v-6M12 15c-4 0-6-2.5-6-5.5S8.5 3 12 3s6 3 6 6.5-2 5.5-6 5.5z"/>',
    sport: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/>',
    culture: '<path d="M4 5h16v6a8 8 0 0 1-16 0z"/><path d="M9 10h.01M15 10h.01M9.5 14.5c1.5 1 3.5 1 5 0"/>',
    hotel: '<path d="M3 19V6M3 15h18v4M21 15v-2.5a2.5 2.5 0 0 0-2.5-2.5H10v5"/><circle cx="6.5" cy="11.5" r="1.5"/>',
    food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1.5-2 6 0 8v10"/>',
    shop: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    fun: '<ellipse cx="12" cy="9" rx="5.5" ry="6.5"/><path d="M12 15.5 11 17h2l-1-1.5M12 17c-1 1.5 1 2.5 0 4.5"/>'
  };
  const PK = { street: 'road', square: 'road', area: 'pin', worship: 'sight', bus: 'stop' };
  const picon = k => `<i class="si"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PICO[PK[k] || k] || PICO.pin}</svg></i>`;
  const allStops = () => [...feed.stops.values()];

  const GEO = !!window.APP_VERSION && 'geolocation' in navigator;
  const geoLayer = L.layerGroup().addTo(map);
  let geo = null, locBtn = null;
  const fmtD = d => d < 1000 ? t('geoM', { n: Math.round(d / 5) * 5 }) : t('geoKm', { n: new Intl.NumberFormat(I18N.loc(), { maximumFractionDigits: 1 }).format(d / 1000) });
  const cssv = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  const gchips = g => [...g.routes].sort(byName).map(r => chip(r)).join('');
  function geoShow() {
    const box = $('#geo');
    if (!geo) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    const x = `<button type="button" class="gx" data-geo="x" aria-label="${esc(t('close'))}">×</button>`;
    if (geo.st === 'busy') { box.innerHTML = `${x}<p class="gbusy"><span class="gspin"></span>${esc(t('geoBusy'))}</p>`; return; }
    if (geo.st !== 'ok') {
      const link = geo.st === 'blocked' ? `<a class="btn sm" href="tbapp://settings">${esc(t('geoSettings'))}</a>` : geo.st === 'off' ? `<a class="btn sm" href="tbapp://location">${esc(t('geoLocSettings'))}</a>` : '';
      box.innerHTML = `${x}<p class="gmsg">${esc(t(geo.k, geo.p))}</p><div class="grow">${link}<button type="button" class="btn sm" data-geo="retry">${esc(t('geoRetry'))}</button></div>`;
      return;
    }
    const [a, ...rest] = geo.list, g = stopGroup.get(a.s.id);
    box.innerHTML = `${x}<div class="ghead">${esc(t('geoHead'))}</div>
      <div class="gname">${esc(g.label)}</div>
      <div class="gdist">${esc(t('geoAir', { d: fmtD(a.d) }))}</div>
      <div class="gchips">${gchips(g)}</div>
      <p class="gacc">${esc(t('geoAcc', { m: Math.round(geo.acc) }))}${geo.acc > a.d ? ' ' + esc(t('geoAccWarn')) : ''}</p>
      <div class="grow"><button type="button" class="btn sm" data-geo="0">${esc(t('geoShow'))}</button><button type="button" class="btn sm primary" data-geo="d0">${esc(t('geoDetail'))}</button></div>
      ${rest.length ? `<div class="ghead">${esc(t('geoMore'))}</div><ol class="glist">${rest.map((r, i) => `<li><button type="button" data-geo="${i + 1}"><b>${esc(stopGroup.get(r.s.id).label)}</b><span>${esc(fmtD(r.d))}</span></button></li>`).join('')}</ol>` : ''}`;
  }
  function geoDraw() {
    geoLayer.clearLayers();
    const { p, acc, list } = geo, blue = '#1A73E8', ac = cssv('--accent'), sf = cssv('--stop-fill'), ss = cssv('--stop-stroke');
    L.circle(p, { radius: acc, color: blue, weight: 1, opacity: .5, fillColor: blue, fillOpacity: .12, interactive: false }).addTo(geoLayer);
    geo.mk = list.map((r, i) => {
      const g = stopGroup.get(r.s.id);
      const m = L.circleMarker([r.s.lat, r.s.lon], i ? { radius: 7, color: ss, weight: 2, fillColor: sf, fillOpacity: 1 } : { radius: 11, color: '#fff', weight: 3, fillColor: ac, fillOpacity: 1 }).addTo(geoLayer);
      const el = document.createElement('div');
      el.className = 'gpop';
      el.innerHTML = `<b>${esc(g.label)}</b><span>${esc(t('geoAir', { d: fmtD(r.d) }))}</span><div class="gchips">${gchips(g)}</div><button type="button" class="btn sm">${esc(t('geoDetail'))}</button>`;
      el.querySelector('button').addEventListener('click', () => geoDetail(i));
      m.bindPopup(el, { autoPanPaddingTopLeft: [72, 16], autoPanPaddingBottomRight: [72, 56] });
      return m;
    });
    L.circleMarker(p, { radius: 8, color: '#fff', weight: 3, fillColor: blue, fillOpacity: 1, interactive: false }).addTo(geoLayer);
    fit(L.latLngBounds([p, ...list.map(r => [r.s.lat, r.s.lon])]), 40, 17);
  }
  function geoFocus(i) {
    const r = geo.list[i];
    map.setView([r.s.lat, r.s.lon], Math.max(map.getZoom(), 16));
    geo.mk[i].openPopup();
  }
  function geoDetail(i) {
    if (mode !== 'browse') setMode('browse', true);
    openStop(geo.list[i].s);
  }
  function geoOnce(ok, bad) {
    window.tbGeo = null;
    navigator.geolocation.getCurrentPosition(pos => {
      const p = [pos.coords.latitude, pos.coords.longitude], acc = pos.coords.accuracy, st = Places.locate(p, acc);
      if (st === 'invalid') return bad('err', 'geoUnavail');
      if (st === 'outside') return bad('outside', 'geoOutside');
      if (st === 'inaccurate') return bad('err', 'geoInaccurate', { m: Math.round(acc) });
      ok(p, acc);
    }, err => setTimeout(() => {
      const g = window.tbGeo;
      if (g === 'off') bad('off', 'geoOff');
      else if (err.code === 1) bad(g === 'blocked' ? 'blocked' : 'err', g === 'blocked' ? 'geoBlocked' : 'geoDenied');
      else bad('err', err.code === 3 ? 'geoTimeout' : 'geoUnavail');
    }, 150), { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  }
  function locate() {
    if (geo && geo.st === 'busy') return;
    geoLayer.clearLayers();
    geo = { st: 'busy' };
    geoShow();
    locBtn.classList.add('busy');
    const done = (st, k, p, x) => { locBtn.classList.remove('busy'); geo = Object.assign({ st, k, p }, x); geoShow(); };
    geoOnce((p, acc) => {
      const list = Places.nearest(allStops(), p, 5, s => stopGroup.get(s.id) || s.id);
      if (!list.length) return done('err', 'geoNone');
      done('ok', '', null, { p, acc, list });
      geoDraw();
    }, done);
  }
  $('#geo').addEventListener('click', e => {
    const b = e.target.closest('[data-geo]');
    if (!b) return;
    const v = b.dataset.geo;
    if (v === 'x') { geo = null; geoLayer.clearLayers(); geoShow(); }
    else if (v === 'retry') locate();
    else if (v[0] === 'd') geoDetail(+v.slice(1));
    else geoFocus(+v);
  });
  const PREK = 'tirana-presets';
  let pre = {}, preEdit = null, prePick = null, preMsg = null;
  try { pre = Places.presets(localStorage.getItem(PREK)); } catch (e) {}
  const preSave = () => { try { localStorage.setItem(PREK, JSON.stringify(pre)); } catch (e) {} };
  // Lucide 0.460.0, ISC License, (c) Lucide Contributors 2022, portions (c) Cole Bemis 2013-2022 (Feather, MIT), https://lucide.dev/license
  const PRE_ICO = {
    'house': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'briefcase-business': '<path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    'shopping-cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    'coffee': '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'dumbbell': '<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>',
    'landmark': '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    'train-front': '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
    'bus-front': '<path d="M4 6 2 7"/><path d="M10 6h4"/><path d="m22 7-2-1"/><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 21v-2"/>',
    'car-front': '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'church': '<path d="M10 9h4"/><path d="M12 7v5"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22"/><path d="m18 7 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.618a1 1 0 0 1 .553-.894L6 7"/>',
    'tree-pine': '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>'
  };
  const icSvg = i => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PRE_ICO[i]}</svg>`;
  const preIc = k => Places.presetIcon(pre[k], k);
  const preIcon = k => `<i class="si">${icSvg(preIc(k))}</i>`;
  const preName = k => (pre[k] && pre[k].n) || t('pre_' + k);
  const preList = q => GEO ? Places.SLOTS.filter(k => pre[k] && pre[k].k && (!q || Places.presetHit(preName(k), q))) : [];
  const ptEnd = (id, n, p, which) => placeEnd({ id, n, c: 'pin', pts: [p], t: {} }, which);
  function preGroup(p) {
    if (p.k !== 'stop') return null;
    const near = Places.nearest(allStops(), [p.lat, p.lon], 1)[0];
    return names.find(x => x.label === p.l) || (near && stopGroup.get(near.s.id)) || null;
  }
  function preEnd(k, which) {
    const p = pre[k];
    return preGroup(p) || ptEnd('@pre-' + k, preName(k), [p.lat, p.lon], which);
  }
  function preActive(k) {
    const p = pre[k], g = preGroup(p);
    return ['from', 'to'].some(w => { const e = plan[w]; return e && (e.place ? e.place.id === '@pre-' + k : g && e === g); });
  }
  function preSet(k, x, n) {
    pre[k] = Object.assign({ n: n !== undefined ? n : (pre[k] && pre[k].n) || '' }, x);
    preSave();
    preEdit = prePick = preMsg = null;
    preShow();
  }
  const pkNote = L.DomUtil.create('div', 'pknote', map.getContainer());
  pkNote.hidden = true;
  const UI_IC = {
    edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    del: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>'
  };
  const uiSvg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI_IC[k]}</svg>`;
  const plBtns = (sc, id, del) => `<button type="button" class="plb" data-pa="edit" ${sc}="${id}" aria-label="${esc(t('preChange'))}" title="${esc(t('preChange'))}">${uiSvg('edit')}</button>` +
    (del ? `<button type="button" class="plb del" data-pa="del" ${sc}="${id}" aria-label="${esc(t('preDel'))}" title="${esc(t('preDel'))}">${uiSvg('del')}</button>` : '<span class="plb ghost"></span>');
  const plConf = (sc, id) => `<div class="plconf" role="alert"><span>${esc(t('poiDelSure'))}</span><button type="button" class="btn sm danger" data-pa="del2" ${sc}="${id}">${esc(t('preDel'))}</button><button type="button" class="btn sm" data-pa="nodel">${esc(t('preCancel'))}</button></div>`;
  const SEC = { pre: { card: '#precard', open: false, col: false, key: 'tirana-pre-col', title: 'preTitle' }, poi: { card: '#places', open: false, col: false, key: 'tirana-pl-col', title: 'poiTitle', sub: 'plSub' } };
  let preDel = null;
  for (const x of Object.values(SEC)) try { x.col = localStorage.getItem(x.key) === '1'; } catch (e) {}
  function plHead(sec) {
    const x = SEC[sec], box = $(x.card);
    box.hidden = !x.open;
    box.classList.toggle('col', x.col);
    const n = sec === 'pre' ? Places.SLOTS.filter(k => pre[k] && pre[k].k).length : pois.length;
    box.querySelector('.plhead').innerHTML = `<div class="pltop"><h2 class="ghead">${esc(t(x.title))}</h2>${n ? `<span class="plnum" title="${esc(t('plSaved', { n }))}" aria-label="${esc(t('plSaved', { n }))}">${n}</span>` : ''}<button type="button" class="plb sm" data-pl="col" aria-expanded="${!x.col}" aria-controls="${sec}body" aria-label="${esc(t(x.col ? 'plOpen' : 'plClose'))}" title="${esc(t(x.col ? 'plOpen' : 'plClose'))}">${uiSvg('down')}</button><button type="button" class="plb sm" data-pl="x" aria-label="${esc(t('close'))}" title="${esc(t('close'))}">×</button></div>${x.sub ? `<p class="plsub">${esc(t(x.sub))}</p>` : ''}`;
  }
  function preShow() {
    const box = $('#pre');
    preDraw();
    pkSync();
    plHead('pre');
    if (!SEC.pre.open) { box.innerHTML = ''; return; }
    let h = '';
    for (const k of Places.SLOTS) {
      const p = pre[k] || {};
      h += `<div class="plrow"><button type="button" class="plgo" data-pa="go" data-slot="${k}"><span class="plic">${icSvg(preIc(k))}</span><span class="pltx"><b>${esc(preName(k))}</b><span>${esc(p.k ? p.l : t('preUnset'))}</span></span></button>${plBtns('data-slot', k, p.k || p.n || p.i)}</div>`;
      if (preDel === k) h += plConf('data-slot', k);
      if (preEdit === k) {
        h += `<div class="pedit"><input class="pname" data-slot="${k}" maxlength="24" value="${esc(preName(k))}" aria-label="${esc(t('preName'))}"><div class="picgrid" role="group" aria-label="${esc(t('preIcon'))}">${Places.ICONS.map(i => `<button type="button" class="${i === preIc(k) ? 'on' : ''}" data-pa="seticon" data-slot="${k}" data-ic="${i}" aria-pressed="${i === preIc(k)}" aria-label="${esc(t('ic')[i])}" title="${esc(t('ic')[i])}">${icSvg(i)}</button>`).join('')}</div>`;
        h += `<input type="search" class="pq" placeholder="${esc(t('preSearch'))}" aria-label="${esc(t('preSearch'))}" autocomplete="off"><div class="plist"></div>`;
        h += `<div class="grow"><button type="button" class="btn sm" data-pa="gps">${esc(t('preHere'))}</button><button type="button" class="btn sm" data-pa="map">${esc(t('preOnMap'))}</button><button type="button" class="btn sm" data-pa="cancel">${esc(t('preCancel'))}</button></div>`;
        if (prePick === k) h += `<p class="gmsg">${esc(t('prePickHint'))}</p>`;
        if (preMsg) h += `<p class="gmsg">${esc(t(preMsg.k, preMsg.p))}</p>`;
        h += '</div>';
      }
    }
    box.innerHTML = h;
  }
  function preFind(v) {
    const q = norm(v.trim()), box = $('#pre .plist');
    if (!box) return;
    if (!q) { box.innerHTML = ''; return; }
    const ps = pidx ? Places.search(pidx, v, I18N.lang, 5) : [];
    const hits = names.filter(g => g.key.includes(q)).sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q))).slice(0, ps.length ? 5 : 8);
    box.innerHTML = hits.length || ps.length
      ? hits.map(g => `<button type="button" class="sg st" data-pa="stop" data-name="${esc(g.id)}">${picon('stop')}<b>${esc(g.label)}</b></button>`).join('') + ps.map(it => `<button type="button" class="sg pl" data-pa="place" data-place="${esc(it.id)}">${picon(it.c)}<b>${esc(Places.label(it, I18N.lang))}</b><span>${esc(t('cats')[it.c] || '')}</span></button>`).join('')
      : `<div class="sg none">${t('noStop')}</div>`;
  }
  $('#pre').addEventListener('click', e => {
    const b = e.target.closest('[data-pa]');
    if (!b) return;
    const a = b.dataset.pa, k = b.dataset.slot || preEdit;
    if (a !== 'del') preDel = null;
    if (a === 'go') { if (!pre[k] || !pre[k].k) { a2edit(k); return; } map.setView([pre[k].lat, pre[k].lon], Math.max(map.getZoom(), 15)); prePop(k); if (innerWidth <= 760) $('#map').scrollIntoView({ block: 'nearest' }); preShow(); }
    else if (a === 'seticon') { pre[k] = Object.assign(pre[k] || { n: '' }, { i: b.dataset.ic }); preSave(); preShow(); const f = $(`#pre .picgrid [data-ic="${b.dataset.ic}"]`); if (f) f.focus(); }
    else if (a === 'edit') a2edit(k);
    else if (a === 'del') { preDel = preDel === k ? null : k; preShow(); }
    else if (a === 'nodel') preShow();
    else if (a === 'del2') { delete pre[k]; preSave(); if (preEdit === k) preEdit = prePick = preMsg = null; preShow(); }
    else if (a === 'cancel') { preEdit = prePick = preMsg = null; preShow(); map.closePopup(); }
    else if (a === 'map') { prePick = k; preMsg = null; if (poiPick) { poiPick = null; poiShow(); } preShow(); if (innerWidth <= 760) $('#map').scrollIntoView({ block: 'nearest' }); }
    else if (a === 'gps') { preMsg = { k: 'geoBusy' }; preShow(); geoOnce(p => preSet(k, { k: 'gps', l: t('preGpsLbl'), lat: p[0], lon: p[1] }), (st, mk, mp) => { if (preEdit !== k) return; preMsg = { k: mk, p: mp }; preShow(); }); }
    else if (a === 'stop') { const g = groups.get(b.dataset.name); if (g) preSet(k, { k: 'stop', l: g.label, lat: g.stops[0].lat, lon: g.stops[0].lon }); }
    else if (a === 'place') { const it = pidx && pidx.items.find(x => x.id === b.dataset.place); if (it) { const c = Places.center(it); preSet(k, { k: 'place', l: Places.label(it, I18N.lang), lat: c[0], lon: c[1] }); } }
  });
  function a2edit(k) { preEdit = preEdit === k ? null : k; prePick = preMsg = null; preShow(); loadPlaces(); loadNet(); const q = $('#pre .pq'); if (q) q.focus({ preventScroll: true }); }
  $('#pre').addEventListener('input', e => { if (e.target.classList.contains('pq')) preFind(e.target.value); });
  $('#pre').addEventListener('change', e => {
    const el = e.target;
    if (!el.classList.contains('pname')) return;
    const k = el.dataset.slot, v = el.value.trim(), n = v === t('pre_' + k) ? '' : v.slice(0, 24);
    if (pre[k]) pre[k].n = n; else if (n) pre[k] = { n };
    if (pre[k] && !pre[k].n && !pre[k].k && !pre[k].i) delete pre[k];
    preSave();
    preDraw();
    const r = $(`#pre .plgo[data-slot="${k}"]`);
    if (r) { r.querySelector('b').textContent = preName(k); r.querySelector('.plic').innerHTML = icSvg(preIc(k)); }
    for (const x of document.querySelectorAll(`#pre .picgrid [data-slot="${k}"]`)) { const on = x.dataset.ic === preIc(k); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }
  });
  const secShow = sec => sec === 'pre' ? preShow() : poiShow();
  function plShow(sec) { Object.assign(SEC[sec], { open: true, col: false }); secShow(sec); $(SEC[sec].card).scrollIntoView({ block: 'nearest' }); }
  document.addEventListener('tb-presets', () => plShow('pre'));
  for (const sec of ['pre', 'poi']) $(SEC[sec].card + ' .plhead').addEventListener('click', e => {
    const b = e.target.closest('[data-pl]'), x = SEC[sec];
    if (!b) return;
    if (b.dataset.pl === 'x') {
      x.open = false;
      if (sec === 'pre') preEdit = prePick = preMsg = preDel = null; else poiEdit = poiPick = poiMsg = poiDel = null;
      map.closePopup();
    } else { x.col = !x.col; try { localStorage.setItem(x.key, x.col ? '1' : '0'); } catch (e) {} }
    secShow(sec);
  });
  const ptLayer = L.layerGroup().addTo(map);
  function ptPop(ll, el) {
    map.closePopup();
    L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: cssv('--accent'), fillOpacity: 1, interactive: false }).addTo(ptLayer);
    const pop = L.popup({ autoPanPaddingTopLeft: [72, 16], autoPanPaddingBottomRight: [72, 56] }).setLatLng(ll).setContent(el).openOn(map);
    pkNote.hidden = true;
    pop.on('remove', () => { ptLayer.clearLayers(); pkSync(); });
    return pop;
  }
  const preLayer = L.layerGroup().addTo(map);
  function preFields() {
    const ks = preList('');
    for (const w of ['from', 'to']) {
      const box = $('#' + w + '-pre');
      box.hidden = !ks.length;
      box.parentNode.classList.toggle('haspre', !!ks.length);
      box.parentNode.style.setProperty('--pn', ks.length);
      box.innerHTML = ks.map(k => `<button type="button" data-pre="${k}" aria-label="${esc(preName(k))}" title="${esc(preName(k))}">${icSvg(preIc(k))}</button>`).join('');
    }
  }
  for (const w of ['from', 'to']) $('#' + w + '-pre').addEventListener('click', e => {
    const b = e.target.closest('[data-pre]');
    if (!b || !pre[b.dataset.pre]) return;
    if (mode !== 'plan') setMode('plan', true);
    chooseEnd(w, preEnd(b.dataset.pre, w), true);
  });
  function preDraw() {
    preFields();
    preMarkers();
  }
  function preMarkers() {
    preLayer.clearLayers();
    if (!GEO) return;
    for (const k of Places.SLOTS) {
      const p = pre[k];
      if (!p || !p.k || !preActive(k)) continue;
      const m = L.marker([p.lat, p.lon], { icon: L.divIcon({ className: 'premk', html: icSvg(preIc(k)), iconSize: [32, 32], iconAnchor: [16, 16] }), title: preName(k), keyboard: false, zIndexOffset: 500 }).addTo(preLayer);
      m.on('click', e => { L.DomEvent.stop(e); if (prePick) prePickAt(p.lat, p.lon); else prePop(k); });
    }
  }
  function prePop(k) {
    const p = pre[k], el = document.createElement('div');
    el.className = 'gpop';
    el.innerHTML = `<b>${esc(preName(k))}</b><span>${esc(p.l)}</span><div class="grow"><button type="button" class="btn sm" data-w="from">${esc(t('mapFrom'))}</button><button type="button" class="btn sm" data-w="to">${esc(t('mapTo'))}</button></div>`;
    const pop = L.popup({ offset: [0, -10], autoPanPaddingTopLeft: [72, 16], autoPanPaddingBottomRight: [72, 56] }).setLatLng([p.lat, p.lon]).setContent(el).openOn(map);
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-w]');
      if (!b) return;
      map.closePopup(pop);
      if (mode !== 'plan') setMode('plan', true);
      chooseEnd(b.dataset.w, preEnd(k, b.dataset.w));
    });
  }
  function prePickAt(lat, lon, stop) {
    const k = prePick, g = stop && stopGroup.get(stop.id);
    const x = stop ? { k: 'stop', l: g ? g.label : stop.name, lat: stop.lat, lon: stop.lon } : { k: 'map', l: t('preMapPt'), lat, lon };
    const el = document.createElement('div');
    el.className = 'gpop';
    el.innerHTML = `<b>${esc(x.l)}</b><input class="pname" maxlength="24" value="${esc(preName(k))}" aria-label="${esc(t('preName'))}"><div class="grow"><button type="button" class="btn sm" data-pp="save">${esc(t('preSave'))}</button><button type="button" class="btn sm" data-pp="cancel">${esc(t('preCancel'))}</button></div>`;
    const pop = ptPop([x.lat, x.lon], el), inp = el.querySelector('input');
    const save = () => {
      const v = inp.value.trim();
      map.closePopup(pop);
      preSet(k, x, v === t('pre_' + k) ? '' : v.slice(0, 24));
    };
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') save(); });
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-pp]');
      if (!b) return;
      if (b.dataset.pp === 'save') save(); else map.closePopup(pop);
    });
  }
  if (GEO) {
    map.on('click', e => { if (prePick) prePickAt(e.latlng.lat, e.latlng.lng); else if (poiPick) poiForm(e.latlng.lat, e.latlng.lng, poiPick); });
    map.on('contextmenu', e => {
      if (prePick) return prePickAt(e.latlng.lat, e.latlng.lng);
      if (poiPick) return poiForm(e.latlng.lat, e.latlng.lng, poiPick);
      const el = document.createElement('div');
      el.className = 'gpop';
      el.innerHTML = `<b>${esc(t('preMapPt'))}</b><div class="grow"><button type="button" class="btn sm" data-w="from">${esc(t('mapFrom'))}</button><button type="button" class="btn sm" data-w="to">${esc(t('mapTo'))}</button><button type="button" class="btn sm" data-w="poi">${esc(t('poiAddMap'))}</button></div>`;
      const pop = ptPop(e.latlng, el);
      el.addEventListener('click', ev => {
        const b = ev.target.closest('[data-w]');
        if (!b) return;
        map.closePopup(pop);
        if (b.dataset.w === 'poi') return poiForm(e.latlng.lat, e.latlng.lng, { id: null });
        if (mode !== 'plan') setMode('plan', true);
        chooseEnd(b.dataset.w, ptEnd('@map-' + b.dataset.w, t('preMapPt'), [e.latlng.lat, e.latlng.lng], b.dataset.w));
      });
    });
  }
  const POIK = 'tirana-pois';
  let pois = [], poiEdit = null, poiPick = null, poiDel = null, poiMsg = null;
  try { pois = Places.pois(localStorage.getItem(POIK)); } catch (e) {}
  const poiId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const poiEnd = (p, which) => ptEnd('@poi-' + p.id, p.n, [p.lat, p.lon], which);
  const poiList = v => GEO && v ? pois.filter(p => Places.poiHit(p, v)).slice(0, 5) : [];
  const poiRow = (p, act) => `<button type="button" class="sg pl poi ${act ? 'act' : ''}" data-poi="${esc(p.id)}"><i class="si"><span class="pldot"></span></i><b>${esc(p.n)}</b><span>${esc(p.d || t('poiLbl'))}</span></button>`;
  const pkSync = () => { pkNote.hidden = !prePick && !poiPick; pkNote.textContent = t(poiPick ? 'poiPickHint' : 'prePickHint'); };
  const poiLayer = L.layerGroup().addTo(map);
  function poiSave(x) {
    if (x) for (const w of ['from', 'to']) if (plan[w] && plan[w].place && plan[w].place.id === '@poi-' + x.id) { setEnd(w, poiEnd(x, w)); plan.res = null; planLayer.clearLayers(); showPlan(); restyle(); }
    try { localStorage.setItem(POIK, JSON.stringify({ v: 1, items: pois })); } catch (e) {}
    poiDraw();
    poiShow();
  }
  function poiDraw() {
    poiLayer.clearLayers();
    if (!GEO) return;
    for (const p of pois) {
      const m = L.circleMarker([p.lat, p.lon], { renderer, radius: sr(), weight: 1.5, fillOpacity: 1 }).addTo(poiLayer);
      m.bindTooltip(esc(p.n), { direction: 'top', offset: [0, -4] });
      m.on('click', e => { L.DomEvent.stop(e); if (prePick) prePickAt(p.lat, p.lon); else if (poiPick) poiForm(p.lat, p.lon, poiPick); else poiPop(p); });
    }
    poiStyle();
  }
  function poiStyle() {
    const ac = tok('--accent'), st = { radius: sr() + .5, color: ac, fillColor: ac };
    poiLayer.eachLayer(m => { m.setStyle(st); m.bringToFront(); });
  }
  function poiPop(p) {
    const el = document.createElement('div');
    el.className = 'gpop';
    el.innerHTML = `<b>${esc(p.n)}</b><span>${esc(p.d || t('poiLbl'))}</span><div class="grow"><button type="button" class="btn sm" data-w="from">${esc(t('mapFrom'))}</button><button type="button" class="btn sm" data-w="to">${esc(t('mapTo'))}</button><button type="button" class="btn sm" data-w="edit">${esc(t('poiEdit'))}</button></div>`;
    const pop = L.popup({ offset: [0, -4], autoPanPaddingTopLeft: [72, 16], autoPanPaddingBottomRight: [72, 56] }).setLatLng([p.lat, p.lon]).setContent(el).openOn(map);
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-w]');
      if (!b) return;
      map.closePopup(pop);
      if (b.dataset.w === 'edit') { poiEdit = p.id; poiDel = poiMsg = null; plShow('poi'); return; }
      if (mode !== 'plan') setMode('plan', true);
      chooseEnd(b.dataset.w, poiEnd(p, b.dataset.w));
    });
  }
  function poiForm(lat, lon, pk) {
    const old = pk.id && pois.find(x => x.id === pk.id);
    const el = document.createElement('div');
    el.className = 'gpop';
    if (!Places.inArea([lat, lon])) {
      el.innerHTML = `<b>${esc(t('poiAddMap'))}</b><span>${esc(t('poiOutside'))}</span>`;
      ptPop([lat, lon], el);
      return;
    }
    if (!old && pois.length >= Places.POI_MAX) {
      el.innerHTML = `<b>${esc(t('poiAddMap'))}</b><span>${esc(t('poiMax', { n: Places.POI_MAX }))}</span>`;
      ptPop([lat, lon], el);
      return;
    }
    el.innerHTML = `<b>${esc(t(old ? 'poiMove' : 'poiAddMap'))}</b><input class="pname" maxlength="40" placeholder="${esc(t('poiName'))}" aria-label="${esc(t('poiName'))}" value="${esc(old ? old.n : '')}"><input class="pname pdesc" maxlength="200" placeholder="${esc(t('poiDesc'))}" aria-label="${esc(t('poiDesc'))}" value="${esc(old ? old.d : '')}"><span class="perr" hidden>${esc(t('poiNameReq'))}</span><div class="grow"><button type="button" class="btn sm" data-pp="save">${esc(t('preSave'))}</button><button type="button" class="btn sm" data-pp="cancel">${esc(t('preCancel'))}</button></div>`;
    const pop = ptPop([lat, lon], el), [inN, inD] = el.querySelectorAll('input');
    const save = () => {
      const n = inN.value.trim().slice(0, 40);
      if (!n) { el.querySelector('.perr').hidden = false; inN.setAttribute('aria-invalid', 'true'); inN.focus(); return; }
      const x = { id: old ? old.id : poiId(), n, d: inD.value.trim().slice(0, 200), lat, lon, ts: Date.now() };
      if (old) pois[pois.indexOf(old)] = x; else pois.push(x);
      poiPick = poiEdit = null;
      map.closePopup(pop);
      poiSave(x);
    };
    for (const i of [inN, inD]) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') save(); });
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-pp]');
      if (!b) return;
      if (b.dataset.pp === 'save') save(); else map.closePopup(pop);
    });
  }
  function poiShow() {
    const box = $('#poi');
    pkSync();
    plHead('poi');
    if (!SEC.poi.open) { box.innerHTML = ''; return; }
    let h = pois.length ? '' : `<p class="gmsg plempty">${esc(t('poiEmpty'))}</p>`;
    for (const p of pois) {
      h += `<div class="plrow"><button type="button" class="plgo poi" data-pa="go" data-id="${esc(p.id)}"><span class="pldot" aria-hidden="true"></span><span class="pltx"><b>${esc(p.n)}</b><span>${esc(p.d || t('poiLbl'))}</span></span></button>${plBtns('data-id', esc(p.id), true)}</div>`;
      if (poiDel === p.id) h += plConf('data-id', esc(p.id));
      if (poiEdit === p.id) {
        h += `<div class="pedit"><input class="pname" data-f="n" maxlength="40" value="${esc(p.n)}" placeholder="${esc(t('poiName'))}" aria-label="${esc(t('poiName'))}"><input class="pname pdesc" data-f="d" maxlength="200" value="${esc(p.d)}" placeholder="${esc(t('poiDesc'))}" aria-label="${esc(t('poiDesc'))}">${poiMsg ? `<p class="gmsg">${esc(t(poiMsg))}</p>` : ''}<div class="grow"><button type="button" class="btn sm" data-pa="save" data-id="${esc(p.id)}">${esc(t('preSave'))}</button><button type="button" class="btn sm" data-pa="move" data-id="${esc(p.id)}">${esc(t('poiMove'))}</button><button type="button" class="btn sm" data-pa="cancel">${esc(t('preCancel'))}</button></div></div>`;
      }
      if (poiPick && poiPick.id === p.id) h += `<p class="gmsg">${esc(t('poiPickHint'))} <button type="button" class="btn sm" data-pa="cancel">${esc(t('preCancel'))}</button></p>`;
    }
    const full = pois.length >= Places.POI_MAX;
    h += `<button type="button" class="pladd" data-pa="add" ${full ? 'disabled' : ''}><span class="plplus">${uiSvg('plus')}</span>${esc(t('plAdd'))}</button>`;
    if (full) h += `<p class="gmsg">${esc(t('poiMax', { n: Places.POI_MAX }))}</p>`;
    if (poiPick && !poiPick.id) h += `<p class="gmsg">${esc(t('poiPickHint'))} <button type="button" class="btn sm" data-pa="cancel">${esc(t('preCancel'))}</button></p>`;
    box.innerHTML = h;
  }
  $('#poi').addEventListener('click', e => {
    const b = e.target.closest('[data-pa]');
    if (!b) return;
    const a = b.dataset.pa, p = pois.find(x => x.id === b.dataset.id);
    if (a !== 'del') poiDel = null;
    if (a === 'nodel') {}
    else if (a === 'add') { poiPick = { id: null }; poiEdit = poiMsg = null; if (prePick) { prePick = null; preShow(); } map.closePopup(); if (innerWidth <= 760) $('#map').scrollIntoView({ block: 'nearest' }); }
    else if (a === 'cancel') { poiPick = poiEdit = poiMsg = null; map.closePopup(); }
    else if (!p) return;
    else if (a === 'go') { map.setView([p.lat, p.lon], Math.max(map.getZoom(), 15)); poiPop(p); if (innerWidth <= 760) $('#map').scrollIntoView({ block: 'nearest' }); }
    else if (a === 'edit') { poiEdit = poiEdit === p.id ? null : p.id; poiPick = poiMsg = null; }
    else if (a === 'move') { poiPick = { id: p.id }; poiEdit = poiMsg = null; if (prePick) { prePick = null; preShow(); } map.closePopup(); map.panTo([p.lat, p.lon]); if (innerWidth <= 760) $('#map').scrollIntoView({ block: 'nearest' }); }
    else if (a === 'del') poiDel = poiDel === p.id ? null : p.id;
    else if (a === 'del2') { pois = pois.filter(x => x !== p); poiDel = null; if (poiEdit === p.id) poiEdit = null; return poiSave(); }
    else if (a === 'save') {
      const n = $('#poi [data-f="n"]').value.trim().slice(0, 40), d = $('#poi [data-f="d"]').value.trim().slice(0, 200);
      if (!n) { poiMsg = 'poiNameReq'; poiShow(); $('#poi [data-f="n"]').focus(); return; }
      const x = pois[pois.indexOf(p)] = Object.assign({}, p, { n, d, ts: Date.now() });
      poiEdit = poiMsg = null;
      return poiSave(x);
    }
    poiShow();
  });
  document.addEventListener('tb-pois', () => plShow('poi'));
  poiDraw();
  if (GEO) {
    const Loc = L.Control.extend({
      onAdd() {
        const b = L.DomUtil.create('button', 'leaflet-bar locbtn');
        b.type = 'button';
        b.dataset.i18nAria = b.dataset.i18nTitle = 'geoBtn';
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3"/></svg>';
        L.DomEvent.disableClickPropagation(b);
        b.addEventListener('click', locate);
        return b;
      }
    });
    locBtn = new Loc({ position: 'bottomright' }).addTo(map).getContainer();
  }

  function loadPlaces() {
    if (!pload) pload = fetch('data/poi.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => { pidx = Places.build(d); }).catch(() => { pload = null; });
    return pload;
  }
  function setExt(v) {
    ext = v;
    try { localStorage.setItem('tirana-mhd-ext', v ? '1' : '0'); } catch (e) {}
    for (const b of document.querySelectorAll('.mext')) b.setAttribute('aria-checked', v);
    if (v) loadPlaces();
    else for (const w of ['from', 'to']) if (plan[w] && plan[w].place) setEnd(w, null);
    if (mode === 'plan') { showPlan(); restyle(); }
  }
  document.addEventListener('tb-ext', e => setExt(!!e.detail));

  function placeEnd(it, which) {
    const c = Places.center(it), acc = Places.access(allStops(), it.pts, wnet), name = Places.label(it, I18N.lang);
    return { place: it, label: name, stops: acc.map(a => a.s), acc, pt: { id: '@' + which, name, lat: c[0], lon: c[1] } };
  }
  function accOf(A, B) {
    const ep = (g, id) => g.place ? g : { acc: g.stops.map(s => ({ s, w: 0, m: 0 })), pt: { id, name: g.label, lat: g.stops[0].lat, lon: g.stops[0].lon } };
    const a = ep(A, '@from'), b = ep(B, '@to');
    const d = Places.between(wnet, [a.pt.lat, a.pt.lon], [b.pt.lat, b.pt.lon], 1500);
    return { o: new Map(a.acc.map(x => [x.s.id, x])), d: new Map(b.acc.map(x => [x.s.id, x])), op: a.pt, dp: b.pt, walk: d == null ? null : { w: Math.max(30, Math.round(d / Places.WALK_V)), m: Math.round(d) } };
  }

  const sgView = box => {
    if (box.hidden || innerWidth > 760) return;
    document.body.classList.add('sgpad');
    requestAnimationFrame(() => box.parentNode.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('resize', () => {
    const a = document.activeElement;
    if (a && (a.id === 'from' || a.id === 'to')) sgView($('#' + a.id + '-sugg'));
  });
  function suggest(which) {
    const inp = $('#' + which), box = $('#' + which + '-sugg');
    const q = norm(inp.value.trim());
    if (!q) {
      box.innerHTML = '';
      box.hidden = true;
      return [];
    }
    if (ext && !pidx) loadPlaces().then(() => { if (pidx && document.activeElement === inp && !plan[which]) suggest(which); });
    const ps = ext && pidx ? Places.search(pidx, inp.value, I18N.lang, 5) : [], po = poiList(inp.value.trim());
    const hits = names.filter(g => g.key.includes(q)).sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q))).slice(0, ps.length ? 5 : 8);
    const prow = (it, act) => {
      if (!it.nr || it.nr[0] !== feed || it.nr[1] !== wnet) it.nr = [feed, wnet, Places.access(allStops(), it.pts, wnet)[0]];
      const a = it.nr[2];
      return `<button type="button" class="sg pl ${act ? 'act' : ''}" data-place="${esc(it.id)}">${picon(it.c)}<b>${esc(Places.label(it, I18N.lang))}</b><span>${esc(t('cats')[it.c] || '')}${a ? ' · ' + esc(t('nearStop', { m: Math.round(a.m / 10) * 10, s: a.s.name })) : ''}</span></button>`;
    };
    box.innerHTML = po.map((p, i) => poiRow(p, !i)).join('') + (hits.length || ps.length
      ? hits.map((g, i) => `<button type="button" class="sg ${i === 0 && !po.length ? 'act' : ''}${ext ? ' st' : ''}" data-name="${esc(g.id)}">${ext ? picon('stop') : ''}<b>${esc(g.label)}</b><span>${[...g.routes].sort(byName).slice(0, 6).map(r => esc(r.short)).join(' · ')}</span></button>`).join('') + ps.map((it, i) => prow(it, !hits.length && !po.length && !i)).join('')
      : po.length ? '' : `<div class="sg none">${t('noStop')}</div>`);
    box.hidden = false;
    sgView(box);
    return hits;
  }
  for (const which of ['from', 'to']) {
    const inp = $('#' + which), box = $('#' + which + '-sugg');
    inp.addEventListener('input', () => { plan[which] = null; plan.res = null; planLayer.clearLayers(); preMarkers(); suggest(which); restyle(); });
    inp.addEventListener('focus', () => { if (ext) { loadPlaces(); loadNet(); } if (!plan[which] && inp.value) suggest(which); });
    inp.addEventListener('blur', () => setTimeout(() => { box.hidden = true; inp.scrollLeft = 0; if (!/^(from|to)$/.test((document.activeElement || {}).id)) document.body.classList.remove('sgpad'); }, 150));
    inp.addEventListener('keydown', e => {
      const items = [...box.querySelectorAll('.sg[data-name], .sg[data-place], .sg[data-poi]')];
      if (box.hidden || !items.length) return;
      let i = items.findIndex(x => x.classList.contains('act'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[i] && items[i].classList.remove('act');
        i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        chooseEl(which, items[Math.max(0, i)]);
      } else if (e.key === 'Escape') box.hidden = true;
    });
    box.addEventListener('mousedown', e => {
      const b = e.target.closest('[data-name], [data-place], [data-poi]');
      if (!b) return;
      e.preventDefault();
      chooseEl(which, b);
    });
  }
  for (const b of document.querySelectorAll('.fclr')) {
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', () => {
      const inp = $('#' + b.dataset.for);
      inp.value = '';
      inp.focus();
      inp.dispatchEvent(new Event('input'));
    });
  }
  const chooseEl = (which, b) => b.dataset.poi ? chooseEnd(which, poiEnd(pois.find(p => p.id === b.dataset.poi), which)) : b.dataset.place ? choose(which, null, pidx.items.find(x => x.id === b.dataset.place)) : choose(which, b.dataset.name);
  function choose(which, name, it) {
    chooseEnd(which, it ? placeEnd(it, which) : groups.get(name));
  }
  function chooseEnd(which, e, quiet) {
    setEnd(which, e);
    $('#' + which + '-sugg').hidden = true;
    restyle();
    if (plan.from && plan.to) runPlan();
    else { showPlan(); const g = plan[which]; if (g) map.panTo(g.pt ? [g.pt.lat, g.pt.lon] : [g.stops[0].lat, g.stops[0].lon]); if (!quiet) $('#' + (which === 'from' ? 'to' : 'from')).focus(); }
  }
  function resolveTyped(which) {
    if (plan[which]) return;
    const v = norm($('#' + which).value.trim());
    if (!v) return;
    const pk = preList('').find(k => norm(preName(k)) === v);
    if (pk) { setEnd(which, preEnd(pk, which)); return; }
    const pi = GEO && pois.find(p => norm(p.n) === v);
    if (pi) { setEnd(which, poiEnd(pi, which)); return; }
    const exact = names.filter(g => g.key === v);
    const hits = exact.length ? exact : names.filter(g => g.key.includes(v));
    if (hits.length === 1) setEnd(which, hits[0]);
    else if (!hits.length && ext && pidx) { const it = Places.search(pidx, $('#' + which).value, I18N.lang, 1)[0]; if (it) setEnd(which, placeEnd(it, which)); }
  }
  $('#swap').addEventListener('click', () => {
    const a = plan.from, b = plan.to, va = $('#from').value, vb = $('#to').value;
    plan.from = b; plan.to = a; $('#from').value = vb; $('#to').value = va;
    plan.res = null; planLayer.clearLayers();
    preMarkers();
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

  let deepLine = null;
  try { deepLine = new URLSearchParams(location.search).get('line'); } catch (e) {}

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
      if (deepLine) {
        const q = deepLine.toLowerCase(), r = [...feed.routes.values()].find(x => x.short.toLowerCase() === q);
        deepLine = null;
        if (r) openRoute(r);
      }
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
    const hb = e.target.closest('.mhelp');
    if (hb) { extHelpOpen = !extHelpOpen; hb.setAttribute('aria-expanded', extHelpOpen); menuBox.querySelector('.mexthelp').hidden = !extHelpOpen; fitPop(menuBox); return; }
    if (e.target.closest('.mtheme')) { toggleTheme(); return; }
    if (e.target.closest('.mext')) { setExt(!ext); return; }
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
    const ti = $('#themeitem'); if (ti) ti.innerHTML = themeItem();
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('tirana-mhd-theme'); } catch (e) {}
  document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  const toggleTheme = () => {
    const th = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = th;
    try { localStorage.setItem('tirana-mhd-theme', th); } catch (e) {}
    syncTheme();
  };
  themeBtn.addEventListener('click', toggleTheme);

  function applyLang() {
    const l = I18N.lang;
    if (typeof Consent !== 'undefined') Consent.render();
    document.documentElement.lang = l;
    document.title = t('metaTitle');
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
    for (const el of document.querySelectorAll('[data-i18n-ph]')) el.placeholder = t(el.dataset.i18nPh);
    for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
    for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
    for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === l);
    for (const a of document.querySelectorAll('[data-seo]')) a.setAttribute('href', l + '/' + a.dataset.seo + '/');
    menuBtn.setAttribute('aria-label', t('dataTitle')); menuBtn.title = t('dataTitle');
    syncTheme();
    if (!feed) return;
    if (baseTables && builtLang !== l) { setFeed(buildFeed(), source, false); return; }
    setAttr(); renderMeta(); renderExpiry(); geoShow(); preShow(); poiShow();
    if (mode === 'plan') showPlan(); else { const el = scr(), st = el.scrollTop; render(); el.scrollTop = st; }
  }
  const langBox = $('.lang');
  document.addEventListener('click', e => { if (!langBox.contains(e.target)) langBox.classList.remove('open'); });
  for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => {
    if (!langBox.classList.contains('open')) { langBox.classList.add('open'); return; }
    langBox.classList.remove('open');
    I18N.setLang(b.dataset.lang);
    try { localStorage.setItem('tirana-mhd-lang', b.dataset.lang); } catch (e) {}
    if (pageLang) {
      pageLang = I18N.lang;
      try { history.replaceState(null, '', location.pathname.replace(/[a-z]{2}\/?$/, pageLang + '/') + location.search + location.hash); } catch (e) {}
    }
    applyLang();
  });
  let savedLang = null;
  try { savedLang = localStorage.getItem('tirana-mhd-lang'); } catch (e) {}
  let pageLang = document.documentElement.dataset.pageLang || null;
  I18N.setLang(pageLang || savedLang || I18N.detect(navigator.languages || [navigator.language]));

  setFeed(GTFS.build(demoTables()), null, true);
  applyLang();

  const boot = $('#boot');
  const endBoot = fail => {
    if (!fail) { boot.classList.add('done'); return; }
    boot.classList.add('fail');
    $('#boottx').dataset.i18n = 'bootFail'; $('#boottx').textContent = t('bootFail'); $('#boottext .bookico').remove();
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
