(() => {
  let lang = null, theme = null;
  try { lang = localStorage.getItem('tirana-mhd-lang'); theme = localStorage.getItem('tirana-mhd-theme'); } catch (e) {}
  I18N.setLang(lang || I18N.detect(navigator.languages || [navigator.language]));
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.lang = I18N.lang;
  const t = I18N.t;
  document.title = t('ctTitle') + ' – ' + t('title');
  for (const el of document.querySelectorAll('[data-k]')) el.textContent = t(el.dataset.k);
  document.getElementById('title').textContent = t('ctTitle');
  const back = document.getElementById('back');
  back.textContent = t('tkBack');
  back.addEventListener('click', e => { if (history.length > 1) { e.preventDefault(); history.back(); } });

  const MAX_FILES = 3, MAX_SIZE = 4 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const form = document.getElementById('cf'), input = document.getElementById('cfiles'), list = document.getElementById('flist');
  const st = document.getElementById('st'), send = document.getElementById('send');
  let files = [];

  const say = (msg, bad) => { st.textContent = msg || ''; st.className = 'status' + (msg ? (bad ? ' bad' : ' ok') : ''); };
  const kb = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' kB';

  function draw() {
    list.textContent = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = f.name + ' (' + kb(f.size) + ')';
      const x = document.createElement('button');
      x.type = 'button'; x.textContent = '×'; x.title = t('ctRemove'); x.setAttribute('aria-label', t('ctRemove'));
      x.addEventListener('click', () => { files.splice(i, 1); draw(); say(''); });
      li.append(name, x);
      list.appendChild(li);
    });
  }

  document.getElementById('pick').addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    let bad = false;
    for (const f of input.files) {
      if (files.length >= MAX_FILES || f.size > MAX_SIZE || !TYPES.includes(f.type)) { bad = true; continue; }
      files.push(f);
    }
    input.value = '';
    draw();
    say(bad ? t('ctErrFiles') : '', bad);
  });

  form.addEventListener('input', e => e.target.classList.remove('err'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements;
    let bad = false;
    for (const el of [f.name, f.email, f.subject, f.message]) {
      const ok = el.value.trim() && (el !== f.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle('err', !ok);
      if (!ok) bad = true;
    }
    if (bad) return say(t('ctBad'), true);
    const fd = new FormData();
    for (const k of ['name', 'email', 'subject', 'message', 'website']) fd.append(k, f[k].value.trim());
    fd.append('lang', I18N.lang);
    files.forEach(x => fd.append('files[]', x, x.name));
    send.disabled = true;
    send.textContent = t('ctSending');
    say('');
    try {
      const r = await fetch(form.action, { method: 'POST', body: fd });
      let j = null;
      try { j = await r.json(); } catch (e2) {}
      if (j && j.ok) {
        form.reset(); files = []; draw();
        say(t('ctOk'));
      } else {
        const c = j && j.error;
        say(c === 'files' ? t('ctErrFiles') : c === 'rate' ? t('ctErrRate') : c === 'fields' ? t('ctBad') : t('ctErr'), true);
      }
    } catch (e2) {
      say(t('ctErr'), true);
    }
    send.disabled = false;
    send.textContent = t('ctSend');
  });
})();
