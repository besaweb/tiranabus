(function () {
  const T = {
    cs: { menu: 'Menu', lang: 'Jazyk', about: 'O aplikaci', ver: 'Verze', tickets: 'Jízdenky', data: 'Platnost dat' },
    en: { menu: 'Menu', lang: 'Language', about: 'About the app', ver: 'Version', tickets: 'Tickets', data: 'Data validity' },
    sq: { menu: 'Menyja', lang: 'Gjuha', about: 'Rreth aplikacionit', ver: 'Versioni', tickets: 'Biletat', data: 'Vlefshmëria e të dhënave' },
    it: { menu: 'Menu', lang: 'Lingua', about: 'Info sull’app', ver: 'Versione', tickets: 'Biglietti', data: 'Validità dei dati' },
    de: { menu: 'Menü', lang: 'Sprache', about: 'Über die App', ver: 'Version', tickets: 'Fahrkarten', data: 'Datengültigkeit' },
    pl: { menu: 'Menu', lang: 'Język', about: 'O aplikacji', ver: 'Wersja', tickets: 'Bilety', data: 'Ważność danych' }
  };
  const NAMES = { cs: 'Čeština', en: 'English', sq: 'Shqip', it: 'Italiano', de: 'Deutsch', pl: 'Polski' };
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
  const wrap = document.createElement('div');
  wrap.className = 'amwrap';
  wrap.innerHTML = '<button type="button" class="ambtn" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
    '<div class="ammenu" hidden><button type="button" class="mi" id="mi-lang" aria-expanded="false"><span data-k="lang"></span><span class="cur"></span></button>' +
    '<div class="langslot" hidden></div>' +
    '<a class="mi" id="mi-tickets" href="tickets.html"><span data-k="tickets"></span></a>' +
    '<a class="mi" id="mi-data" href="validity.html"><span data-k="data"></span></a>' +
    '<button type="button" class="mi" id="mi-about" aria-expanded="false"><span data-k="about"></span></button><div class="about" hidden></div></div>';
  langBox.parentNode.insertBefore(wrap, langBox);
  const q = s => wrap.querySelector(s);
  const btn = q('.ambtn'), menu = q('.ammenu'), slot = q('.langslot'), about = q('.about'), miLang = q('#mi-lang'), miAbout = q('#mi-about');
  slot.appendChild(langBox);
  for (const b of langBox.querySelectorAll('[data-lang]')) b.insertAdjacentHTML('beforeend', '<span>' + NAMES[b.dataset.lang] + '</span>');
  langBox.addEventListener('click', () => langBox.classList.add('open'), true);

  const subs = [[miLang, slot], [miAbout, about]];
  const closeSubs = () => { for (const [b, box] of subs) { box.hidden = true; b.setAttribute('aria-expanded', 'false'); } };
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
    about.textContent = '';
    const b = document.createElement('b');
    b.textContent = document.title;
    about.append(b, document.createElement('br'), x.ver + ': ' + (window.APP_VERSION || '?'));
  };
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  sync();
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
