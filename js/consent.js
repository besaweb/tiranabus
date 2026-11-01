// Souhlas s reklamou (CMP). Dokud je enabled = false, nic se nezobrazí ani nenačte.
// Po výběru reklamní sítě: enabled = true a načtení sítě na událost 'ads-consent'.
const Consent = (() => {
  const KEY = 'tirana-mhd-consent';
  const C = { enabled: false };
  let bar = null;

  C.get = () => {
    try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch (e) { return null; }
  };
  C.set = v => {
    try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {}
    C.render();
  };

  function build() {
    bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML = '<p></p><div class="cb"><button type="button" class="btn" data-c="denied"></button><button type="button" class="btn primary" data-c="granted"></button></div>';
    bar.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) C.set(b.dataset.c); });
    document.body.appendChild(bar);
  }

  C.render = () => {
    const slot = document.getElementById('adslot');
    if (!C.enabled) { if (slot) slot.hidden = true; if (bar) bar.hidden = true; return; }
    const v = C.get();
    if (!bar) build();
    bar.querySelector('p').textContent = I18N.t('consentText');
    bar.querySelector('[data-c="denied"]').textContent = I18N.t('consentNo');
    bar.querySelector('[data-c="granted"]').textContent = I18N.t('consentOk');
    bar.hidden = v !== null;
    if (slot) slot.hidden = v !== 'granted';
    if (v === 'granted') document.dispatchEvent(new CustomEvent('ads-consent', { detail: { slot } }));
  };

  document.addEventListener('click', e => {
    if (e.target.closest('.adprefs')) { e.preventDefault(); C.set(null); }
  });

  return C;
})();
