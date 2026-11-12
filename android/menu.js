(function () {
  const T = {
    cs: { menu: 'Menu', lang: 'Jazyk', about: 'O aplikaci', ver: 'Verze', tickets: 'Jízdné', data: 'Platnost dat', adp: 'Soukromí reklam' },
    en: { menu: 'Menu', lang: 'Language', about: 'About the app', ver: 'Version', tickets: 'Fares', data: 'Data validity', adp: 'Ad privacy' },
    sq: { menu: 'Menyja', lang: 'Gjuha', about: 'Rreth aplikacionit', ver: 'Versioni', tickets: 'Tarifa', data: 'Vlefshmëria e të dhënave', adp: 'Privatësia e reklamave' },
    it: { menu: 'Menu', lang: 'Lingua', about: 'Info sull’app', ver: 'Versione', tickets: 'Tariffe', data: 'Validità dei dati', adp: 'Privacy degli annunci' },
    de: { menu: 'Menü', lang: 'Sprache', about: 'Über die App', ver: 'Version', tickets: 'Fahrpreise', data: 'Datengültigkeit', adp: 'Datenschutz bei Werbung' },
    pl: { menu: 'Menu', lang: 'Język', about: 'O aplikacji', ver: 'Wersja', tickets: 'Taryfy', data: 'Ważność danych', adp: 'Prywatność reklam' },
    fr: { menu: 'Menu', lang: 'Langue', about: 'À propos de l’appli', ver: 'Version', tickets: 'Tarifs', data: 'Validité des données', adp: 'Confidentialité des annonces' },
    es: { menu: 'Menú', lang: 'Idioma', about: 'Acerca de la app', ver: 'Versión', tickets: 'Tarifas', data: 'Validez de los datos', adp: 'Privacidad de los anuncios' },
    mk: { menu: 'Мени', lang: 'Јазик', about: 'За апликацијата', ver: 'Верзија', tickets: 'Тарифи', data: 'Важност на податоците', adp: 'Приватност на реклами' },
    el: { menu: 'Μενού', lang: 'Γλώσσα', about: 'Σχετικά με την εφαρμογή', ver: 'Έκδοση', tickets: 'Ναύλα', data: 'Εγκυρότητα δεδομένων', adp: 'Απόρρητο διαφημίσεων' },
    ru: { menu: 'Меню', lang: 'Язык', about: 'О приложении', ver: 'Версия', tickets: 'Тарифы', data: 'Актуальность данных', adp: 'Конфиденциальность рекламы' },
    tr: { menu: 'Menü', lang: 'Dil', about: 'Uygulama hakkında', ver: 'Sürüm', tickets: 'Ücretler', data: 'Veri geçerliliği', adp: 'Reklam gizliliği' }
  };
  const NAMES = { cs: 'Čeština', en: 'English', sq: 'Shqip', it: 'Italiano', de: 'Deutsch', pl: 'Polski', fr: 'Français', es: 'Español', mk: 'Македонски', el: 'Ελληνικά', ru: 'Русский', tr: 'Türkçe' };
  const KEY = 'tirana-data-info';
  let info = [{ from: '', to: '', upd: '' }, { from: '', to: '', upd: '20261029' }];
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s[0]) info[0] = s[0]; } catch (e) {}
  try {
    const c = EXTRA_FEEDS[0].tables.calendar[0];
    info[1] = { from: c.start_date, to: c.end_date, upd: '20261029', name: EXTRA_FEEDS[0].tables.agency[0].agency_name };
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(info)); } catch (e) {} };
  save();
  if (window.JSZip && window.Papa) {
    const orig = JSZip.loadAsync.bind(JSZip);
    JSZip.loadAsync = async (...a) => {
      const z = await orig(...a);
      try {
        const f = z.file('feed_info.txt');
        const r = f ? Papa.parse(await f.async('string'), { header: true, skipEmptyLines: true, transformHeader: h => h.trim() }).data[0] : null;
        if (r) { info[0] = { from: r.feed_start_date, to: r.feed_end_date, upd: r.feed_version }; save(); }
      } catch (e) {}
      return z;
    };
  }
  const langBox = document.querySelector('.lang');
  if (!langBox) return;
  const IC = {
    lang: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    tickets: '<path d="M3 8.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6.5v11" stroke-dasharray="2 2.2"/>',
    data: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    pre: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    rt: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    poi: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    about: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    ext: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    adp: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    pro: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>'
  };
  const ic = k => '<svg class="mico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + '</svg>';
  const wrap = document.createElement('div');
  wrap.className = 'amwrap';
  wrap.innerHTML = '<button type="button" class="ambtn" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
    '<div class="ammenu" hidden><button type="button" class="mi mipro" id="mi-pro">' + ic('pro') + '<span>Tirana BUS PRO</span></button>' +
    '<button type="button" class="mi" id="mi-rt">' + ic('rt') + '<span class="rt"></span><span class="probadge">PRO</span></button>' +
    '<button type="button" class="mi" id="mi-pre">' + ic('pre') + '<span class="pre"></span><span class="probadge">PRO</span></button>' +
    '<button type="button" class="mi" id="mi-poi">' + ic('poi') + '<span class="poi"></span><span class="probadge">PRO</span></button>' +
    '<div class="miwrap"><button type="button" class="mi" id="mi-ext" role="switch" aria-checked="false">' + ic('ext') + '<span class="ext"></span><span class="probadge">PRO</span><span class="sw" aria-hidden="true"></span></button><button type="button" class="mihelp" id="mi-exthelp" aria-expanded="false" aria-controls="mi-exthelptx">' + ic('help') + '</button></div><p class="mihelptx" id="mi-exthelptx" hidden></p>' +
    '<button type="button" class="mi" id="mi-lang" aria-expanded="false">' + ic('lang') + '<span data-k="lang"></span><span class="cur"></span></button>' +
    '<div class="langslot" hidden></div>' +
    '<button type="button" class="mi" id="mi-theme">' + ic('moon') + '<span class="thm"></span></button>' +
    '<a class="mi" id="mi-tickets" href="tickets.html">' + ic('tickets') + '<span data-k="tickets"></span></a>' +
    '<a class="mi" id="mi-data" href="validity.html">' + ic('data') + '<span data-k="data"></span></a>' +
    '<button type="button" class="mi" id="mi-adp" hidden>' + ic('adp') + '<span data-k="adp"></span></button>' +
    '<button type="button" class="mi" id="mi-about" aria-expanded="false">' + ic('about') + '<span data-k="about"></span></button><div class="about" hidden></div></div>';
  langBox.parentNode.insertBefore(wrap, langBox);
  const q = s => wrap.querySelector(s);
  const btn = q('.ambtn'), menu = q('.ammenu'), slot = q('.langslot'), about = q('.about'), miLang = q('#mi-lang'), miAbout = q('#mi-about');
  slot.appendChild(langBox);
  for (const b of langBox.querySelectorAll('[data-lang]')) b.insertAdjacentHTML('beforeend', '<span>' + NAMES[b.dataset.lang] + '</span>');
  langBox.addEventListener('click', () => langBox.classList.add('open'), true);

  const miExt = q('#mi-ext');
  const locked = () => document.documentElement.dataset.pro === 'free';
  try { miExt.setAttribute('aria-checked', String(!locked() && localStorage.getItem('tirana-mhd-ext') === '1')); } catch (e) {}
  miExt.addEventListener('click', () => {
    if (locked()) { closeMenu(); document.dispatchEvent(new CustomEvent('tb-pro')); return; }
    const v = miExt.getAttribute('aria-checked') !== 'true';
    miExt.setAttribute('aria-checked', String(v));
    document.dispatchEvent(new CustomEvent('tb-ext', { detail: v }));
  });

  q('#mi-exthelp').addEventListener('click', () => {
    const p = q('#mi-exthelptx'), open = p.hidden;
    closeSubs();
    p.hidden = !open; q('#mi-exthelp').setAttribute('aria-expanded', String(open));
  });
  window.tbAdsPrivacy = () => { let v = false; try { v = !!(window.TBAds && window.TBAds.privacy()); } catch (e) {} q('#mi-adp').hidden = !v; };
  window.tbAdsPrivacy();
  q('#mi-adp').addEventListener('click', () => { closeMenu(); try { window.TBAds.options(); } catch (e) {} });
  q('#mi-pro').addEventListener('click', () => { closeMenu(); document.dispatchEvent(new CustomEvent('tb-pro')); });
  q('#mi-pre').addEventListener('click', () => { closeMenu(); document.dispatchEvent(new CustomEvent('tb-presets')); });
  q('#mi-rt').addEventListener('click', () => { closeMenu(); document.dispatchEvent(new CustomEvent('tb-routes')); });
  q('#mi-poi').addEventListener('click', () => { closeMenu(); document.dispatchEvent(new CustomEvent('tb-pois')); });

  const subs = [[miLang, slot], [miAbout, about]];
  const closeSubs = () => { for (const [b, box] of subs) { box.hidden = true; b.setAttribute('aria-expanded', 'false'); } q('#mi-exthelptx').hidden = true; q('#mi-exthelp').setAttribute('aria-expanded', 'false'); };
  const closeMenu = () => { closeSubs(); menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  for (const [b, box] of subs) b.addEventListener('click', () => {
    const open = box.hidden;
    closeSubs();
    box.hidden = !open; b.setAttribute('aria-expanded', String(open));
  });
  btn.addEventListener('click', () => {
    const open = menu.hidden;
    closeMenu();
    menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  });
  langBox.addEventListener('click', e => { if (e.target.closest('[data-lang]')) closeMenu(); });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const sync = () => {
    const l = T[document.documentElement.lang] ? document.documentElement.lang : 'en', x = T[l];
    for (const el of wrap.querySelectorAll('[data-k]')) el.textContent = x[el.dataset.k];
    btn.setAttribute('aria-label', x.menu); btn.title = x.menu;
    q('.cur').textContent = NAMES[l];
    const A = I18N.D[l] || I18N.D.en;
    q('#mi-ext .ext').textContent = A.extSearch;
    q('#mi-exthelptx').textContent = A.extHelp;
    q('#mi-exthelp').setAttribute('aria-label', A.extHelpLbl); q('#mi-exthelp').title = A.extHelpLbl;
    q('#mi-pre .pre').textContent = A.preTitle;
    q('#mi-rt .rt').textContent = A.rtTitle;
    q('#mi-poi .poi').textContent = A.poiTitle;
    about.textContent = '';
    const bold = s => { const e = document.createElement('b'); e.textContent = s; return e; };
    const link = (h, s) => { const e = document.createElement('a'); e.href = h; e.textContent = s; return e; };
    const add = (...n) => { const e = document.createElement('p'); e.append(...n); about.append(e); };
    add(bold(A.title), document.createElement('br'), A.aboutDesc);
    add(A.aboutCredits);
    add(bold(A.aboutAuthor + ': '), link('https://besaweb.al', 'besaweb.al'), document.createElement('br'), bold(A.aboutContact + ': '), link('mailto:info@besaweb.al', 'info@besaweb.al'));
    add(bold(x.ver + ': '), window.APP_VERSION || '?');
  };
  const syncTheme = () => {
    const l = T[document.documentElement.lang] ? document.documentElement.lang : 'en', A = I18N.D[l] || I18N.D.en;
    const d = document.documentElement.dataset.theme === 'dark';
    q('#mi-theme .thm').textContent = d ? A.themeLight : A.themeDark;
    q('#mi-theme .mico').innerHTML = IC[d ? 'sun' : 'moon'];
  };
  q('#mi-theme').addEventListener('click', () => { const b = document.getElementById('theme'); if (b) b.click(); });
  new MutationObserver(() => { sync(); syncTheme(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
  sync();
  syncTheme();
})();

(function () {
  const tm = document.getElementById('time');
  if (!tm) return;
  const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  const tx = document.createElement('input');
  tx.type = 'text'; tx.id = 'time24'; tx.inputMode = 'numeric'; tx.maxLength = 5; tx.placeholder = 'HH:MM'; tx.autocomplete = 'off';
  tm.parentNode.insertBefore(tx, tm);
  let last = '';
  const use24 = () => document.documentElement.lang !== 'en';
  const norm = v => {
    const m = /^(\d{1,2}):?(\d{2})$/.exec(v.trim());
    return m && +m[1] < 24 && +m[2] < 60 ? String(m[1]).padStart(2, '0') + ':' + m[2] : null;
  };
  Object.defineProperty(tm, 'value', {
    get() { return use24() ? last : d.get.call(tm); },
    set(v) { d.set.call(tm, v); const n = norm(v || ''); if (n) { last = n; tx.value = n; } }
  });
  tx.addEventListener('input', () => {
    const g = tx.value.replace(/\D/g, '').slice(0, 4);
    tx.value = g.length > 2 ? g.slice(0, 2) + ':' + g.slice(2) : g;
  });
  tx.addEventListener('change', () => {
    const n = norm(tx.value);
    if (!n) { tx.value = last; return; }
    last = n; tx.value = n;
    d.set.call(tm, n);
    tm.dispatchEvent(new Event('change'));
  });
  tx.addEventListener('focus', () => tx.select());
  const sync = () => {
    const on = use24();
    if (on && !last) last = d.get.call(tm) || '';
    if (!on && last) d.set.call(tm, last);
    if (on) tx.value = last;
    tx.hidden = !on; tm.hidden = on;
    tx.setAttribute('aria-label', tm.getAttribute('aria-label') || '');
  };
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  sync();
})();
