(() => {
  let lang = null, theme = null;
  try { lang = localStorage.getItem('tirana-mhd-lang'); theme = localStorage.getItem('tirana-mhd-theme'); } catch (e) {}
  I18N.setLang(lang || I18N.detect(navigator.languages || [navigator.language]));
  const l = I18N.lang === 'cs' ? 'cs' : 'en';
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.lang = l;
  document.title = I18N.t('privacy') + ' – ' + I18N.t('title');
  document.getElementById('title').textContent = I18N.t('privacy');
  document.getElementById('pp-en').hidden = l !== 'en';
  document.getElementById('pp-cs').hidden = l !== 'cs';
  const back = document.getElementById('back');
  back.textContent = I18N.t('tkBack');
  back.addEventListener('click', e => {
    if (history.length > 1) { e.preventDefault(); history.back(); }
  });
})();
