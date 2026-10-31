(() => {
  let lang = null, theme = null;
  try { lang = localStorage.getItem('tirana-mhd-lang'); theme = localStorage.getItem('tirana-mhd-theme'); } catch (e) {}
  I18N.setLang(lang || I18N.detect(navigator.languages || [navigator.language]));
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.lang = I18N.lang;
  document.title = I18N.t('tickets') + ' – ' + I18N.t('title');
  for (const el of document.querySelectorAll('[data-k]')) el.textContent = I18N.t(el.dataset.k);
  document.getElementById('title').textContent = I18N.t('tkTitle');
  const RATE = { cs: ['CZK', .268], en: ['EUR', .011], it: ['EUR', .011], de: ['EUR', .011], pl: ['PLN', .047], fr: ['EUR', .011] }[I18N.lang];
  if (RATE) {
    const c = new Intl.NumberFormat(I18N.loc(), { style: 'currency', currency: RATE[0], maximumFractionDigits: RATE[0] === 'CZK' ? 0 : 2 }).format(40 * RATE[1]);
    document.querySelector('[data-k="tkFareV"]').textContent += ' (≈ ' + c + ')';
  }
  const back = document.getElementById('back');
  back.textContent = I18N.t('tkBack');
  back.addEventListener('click', e => {
    if (history.length > 1) { e.preventDefault(); history.back(); }
  });
})();
