(() => {
  const D = {
    cs: { data: 'Platnost dat', op: 'Dopravce', valid: 'Platnost jízdních řádů', upd: 'Poslední aktualizace', web: 'Odkaz na web' },
    en: { data: 'Data validity', op: 'Operator', valid: 'Timetable validity', upd: 'Last update', web: 'Website' },
    sq: { data: 'Vlefshmëria e të dhënave', op: 'Operatori', valid: 'Vlefshmëria e orarit', upd: 'Përditësimi i fundit', web: 'Faqja e internetit' },
    it: { data: 'Validità dei dati', op: 'Operatore', valid: 'Validità degli orari', upd: 'Ultimo aggiornamento', web: 'Sito web' },
    de: { data: 'Datengültigkeit', op: 'Betreiber', valid: 'Gültigkeit der Fahrpläne', upd: 'Letzte Aktualisierung', web: 'Webseite' },
    pl: { data: 'Ważność danych', op: 'Przewoźnik', valid: 'Ważność rozkładów jazdy', upd: 'Ostatnia aktualizacja', web: 'Strona internetowa' }
  };
  const SRC = [
    { name: 'Municipality of Tirana', url: 'https://pt.tirana.al' },
    { name: 'LU-NA (Luna Travel)', url: 'https://luna.al/aeroporti' }
  ];
  let lang = null, theme = null;
  try {
    lang = localStorage.getItem('tirana-mhd-lang'); theme = localStorage.getItem('tirana-mhd-theme');
    const s = JSON.parse(localStorage.getItem('tirana-data-info'));
    if (s) s.forEach((x, i) => Object.assign(SRC[i], x, { name: SRC[i].name }));
  } catch (e) {}
  const l = I18N.setLang(lang || I18N.detect(navigator.languages || [navigator.language])), d = D[l];
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.lang = l;
  document.title = d.data + ' – ' + I18N.t('title');
  document.getElementById('title').textContent = d.data;
  const back = document.getElementById('back');
  back.textContent = I18N.t('tkBack');
  back.addEventListener('click', e => { if (history.length > 1) { e.preventDefault(); history.back(); } });
  const fd = v => {
    const m = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(v || '');
    if (!m) return '–';
    return l === 'cs' ? +m[3] + '. ' + +m[2] + '. ' + m[1] : l === 'de' || l === 'pl' ? m[3] + '.' + m[2] + '.' + m[1] : m[3] + '/' + m[2] + '/' + m[1];
  };
  const main = document.getElementById('main');
  for (const x of SRC) {
    const card = document.createElement('section');
    card.className = 'card';
    const dl = document.createElement('dl');
    const row = (k, v, big) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = d[k];
      if (big) dd.className = 'big';
      dd.append(v);
      dl.append(dt, dd);
    };
    row('op', x.name, true);
    row('valid', fd(x.from) + ' – ' + fd(x.to));
    row('upd', fd(x.upd));
    const a = document.createElement('a');
    a.className = 'link'; a.href = x.url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = x.url.replace(/^https?:\/\//, '') + ' ↗';
    row('web', a);
    card.append(dl);
    main.append(card);
  }
})();
