const Feedback = (() => {
  const CATS = ['bug', 'idea', 'other'];
  const MAX_TEXT = 5000, MAX_FILE = 4 * 1024 * 1024, MAX_MAIL = 150;
  const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const cut = (s, n) => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n);
  const mailOk = s => { const v = String(s || '').trim(); return v.length <= MAX_MAIL && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v); };
  const fileErr = f => !f ? null : !TYPES.includes(f.type) ? 'type' : !(f.size > 0) || f.size > MAX_FILE ? 'size' : null;

  function device(ua) {
    const m = /Android ([\d.]+)(?:;\s*([^;)]+?))?(?:\s+Build\/[^;)]*)?[;)]/.exec(String(ua || ''));
    const model = m && m[2] && !/^(wv|K)$/.test(m[2].trim()) ? m[2].trim() : '';
    return { android: m ? m[1] : '', model };
  }

  function validate(d) {
    if (!d || !CATS.includes(d.cat)) return 'cat';
    if (!String(d.text || '').trim()) return 'text';
    if (String(d.email || '').trim() && !mailOk(d.email)) return 'mail';
    if (fileErr(d.file)) return 'file';
    return null;
  }

  function payload(d, env) {
    const e = env || {}, dev = device(e.ua), now = e.now instanceof Date ? e.now : new Date();
    return {
      category: d.cat,
      message: String(d.text || '').trim().slice(0, MAX_TEXT),
      email: String(d.email || '').trim(),
      version: cut(e.ver, 20),
      lang: cut(e.lang, 5),
      device: cut(dev.model, 60),
      android: cut(dev.android, 10),
      sent: now.toISOString()
    };
  }

  const ERR = { cat: 'fbErrText', text: 'fbErrText', mail: 'fbErrMail', fields: 'fbErrText', file: 'fbErrFile', files: 'fbErrFile', rate: 'fbErrRate', net: 'fbErrNet' };
  const errKey = c => ERR[c] || 'fbErrSend';

  return { CATS, TYPES, MAX_TEXT, MAX_FILE, MAX_MAIL, mailOk, fileErr, device, validate, payload, errKey };
})();
if (typeof module !== 'undefined') module.exports = Feedback;
