const Footer = (() => {
  const ORDER = ['sq', 'cs', 'en', 'it', 'de', 'pl', 'fr', 'es', 'mk', 'el', 'ru', 'tr'];
  const NAMES = { sq: 'Shqip', cs: 'Čeština', en: 'English', it: 'Italiano', de: 'Deutsch', pl: 'Polski', fr: 'Français', es: 'Español', mk: 'Македонски', el: 'Ελληνικά', ru: 'Русский', tr: 'Türkçe' };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    lines: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.7"/>',
    air: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    ticket: '<path d="M3 8.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 6.5v11" stroke-dasharray="2 2.2"/>',
    data: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M4 7.5h16"/><circle cx="8" cy="14.5" r=".6"/><circle cx="16" cy="14.5" r=".6"/><path d="M6.5 18v2.5M17.5 18v2.5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5s1.2-6.2 3.6-8.5z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>'
  };

  // o: { t, lang, pre (cesta ke kořeni webu), langHref(x) → URL jazykové verze, nebo nic (tlačítka data-flang), year }
  function html(o) {
    const { t, lang, pre = '' } = o, y = o.year || new Date().getFullYear();
    const a = (href, icon, label, ext) => `<li><a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${ico(I[icon])}<span>${esc(label)}</span>${ext ? `<span class="sfx">${ico(I.ext)}</span>` : ''}</a></li>`;
    const langs = ORDER.map(x => {
      const cur = x === lang ? ' aria-current="true"' : '';
      return o.langHref
        ? `<li><a href="${esc(o.langHref(x))}" hreflang="${x}" lang="${x}"${cur}>${NAMES[x]}</a></li>`
        : `<li><button type="button" data-flang="${x}" lang="${x}"${cur}>${NAMES[x]}</button></li>`;
    }).join('');
    return `<div class="sfin">
  <div class="sfbrand">
    <a class="sflogo" href="${esc(pre + lang + '/')}"><img src="${esc(pre)}img/logo.png" alt="" width="44" height="44"><span>Tirana Bus</span></a>
    <p class="sftag">${esc(t('footTag'))}</p>
    <p class="sfdesc">${esc(t('footDesc'))}</p>
    <p class="sfloc">${ico(I.pin)}<span>${esc(t('footLoc'))}</span></p>
  </div>
  <nav class="sfcol" aria-labelledby="sfh-nav">
    <h2 id="sfh-nav">${esc(t('footNav'))}</h2>
    <ul>${a(pre + lang + '/', 'map', t('seoHome'))}${a(pre + lang + '/lines/', 'lines', t('lines'))}${a(pre + lang + '/airport/', 'air', t('seoAirNav'))}${a(pre + 'tickets.html', 'ticket', t('tkTitle'))}</ul>
  </nav>
  <nav class="sfcol" aria-labelledby="sfh-info">
    <h2 id="sfh-info">${esc(t('footInfo'))}</h2>
    <ul>${a('https://pt.tirana.al/', 'data', t('footData'), 1)}${a('https://luna.al/en', 'air', t('tkLuna'), 1)}${a('https://www.etransport.al/', 'bus', t('tkEt'), 1)}</ul>
  </nav>
  <div class="sfcol sflangcol">
    <h2 id="sfh-lang">${esc(t('footLang'))}</h2>
    <details class="sflang">
      <summary aria-describedby="sfh-lang">${ico(I.globe)}<span>${NAMES[lang]}</span><span class="sfchev">${ico(I.chev)}</span></summary>
      <ul>${langs}</ul>
    </details>
  </div>
</div>
<div class="sfbar">
  <p>© ${y} Tirana Bus. ${esc(t('footRights'))}</p>
  <p class="sfcred">${esc(t('aboutCredits'))}</p>
  <ul><li><a href="${esc(pre)}privacy.html">${esc(t('privacy'))}</a></li><li>${esc(t('footMade'))} <a href="https://besaweb.al" target="_blank" rel="noopener">BesaWeb</a></li></ul>
</div>`;
  }

  // onLang(l): přepnutí jazyka bez načtení stránky (hlavní stránka); jinak uložit a načíst znovu
  function mount(el, I18N, onLang) {
    el.innerHTML = html({ t: I18N.t, lang: I18N.lang, pre: el.dataset.pre || '' });
    for (const b of el.querySelectorAll('[data-flang]')) b.addEventListener('click', () => {
      if (onLang) { onLang(b.dataset.flang); return; }
      try { localStorage.setItem('tirana-mhd-lang', b.dataset.flang); } catch (e) {}
      location.reload();
    });
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    document.addEventListener('click', e => { const box = el.querySelector('.sflang'); if (box && box.open && !box.contains(e.target)) box.open = false; });
    el.addEventListener('keydown', e => { const box = el.querySelector('.sflang'); if (e.key === 'Escape' && box && box.open) { box.open = false; box.querySelector('summary').focus(); } });
  }

  return { html, mount, ORDER, NAMES };
})();
if (typeof module !== 'undefined') module.exports = Footer;
else (() => {
  const el = document.getElementById('sf');
  if (!el || typeof I18N === 'undefined') return;
  if (location.hostname === 'appassets.androidplatform.net') { el.remove(); return; }
  if (el.hasAttribute('data-app')) return;
  let l = null;
  try { l = localStorage.getItem('tirana-mhd-lang'); } catch (e) {}
  I18N.setLang(l || I18N.detect(navigator.languages || [navigator.language]));
  Footer.mount(el, I18N);
})();
