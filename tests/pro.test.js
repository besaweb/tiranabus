const test = require('node:test');
const assert = require('node:assert/strict');
const Pro = require('../js/pro.js');
const I18N = require('../js/i18n.js');

const T0 = Date.UTC(2026, 10, 12, 10, 0, 0), D = Pro.DAY;
const buy = (sku, time, auto) => ({ ready: true, purchases: [{ sku, time, auto: !!auto, state: 'purchased' }] });

test('Pro: tři plány s pevnými cenami', () => {
  assert.deepEqual(Pro.PLANS.map(p => [p.id, p.price, p.days, p.type]), [['tourist', '1,99 €', 7, 'inapp'], ['annual', '4,99 €', 365, 'subs'], ['lifetime', '19,99 €', 0, 'inapp']]);
  assert.deepEqual(Pro.PLANS.filter(p => p.best).map(p => p.id), ['annual']);
  assert.deepEqual(Pro.FEATURES, ['rt', 'pre', 'poi', 'ext']);
});

test('Pro: bez nákupu, bez mostu a s nesmyslným vstupem je FREE', () => {
  for (const raw of [undefined, null, '', 'x{', '[]', 42, { purchases: 'x' }, { ready: true, purchases: [null, { sku: 'jiny', time: T0, state: 'purchased' }] }]) {
    const s = Pro.state(raw, T0);
    assert.equal(s.plan, 'free');
    assert.equal(s.active, false);
  }
  assert.equal(Pro.state(undefined, T0).billing, false);
  assert.equal(Pro.state('{"ready":true,"purchases":[]}', T0).billing, true);
});

test('Pro: Tourist Pass platí přesně 7 dní', () => {
  const b = buy('pro_tourist_7d', T0);
  assert.deepEqual(Pro.state(b, T0 + 7 * D - 1), { plan: 'tourist', until: T0 + 7 * D, auto: false, active: true, billing: true });
  assert.equal(Pro.state(b, T0 + 7 * D).plan, 'free');
  assert.equal(Pro.state(JSON.stringify(b), T0 + D).plan, 'tourist');
});

test('Pro: Annual Premium s obnovou a po zrušení', () => {
  const on = buy('pro_annual', T0, true), off = buy('pro_annual', T0, false);
  assert.deepEqual(Pro.state(on, T0 + 10 * D), { plan: 'annual', until: T0 + 365 * D, auto: true, active: true, billing: true });
  assert.equal(Pro.state(on, T0 + 400 * D).until, T0 + 730 * D);
  assert.equal(Pro.state(off, T0 + 364 * D).plan, 'annual');
  assert.equal(Pro.state(off, T0 + 365 * D).active, false);
  assert.equal(Pro.state({ ready: true, purchases: [] }, T0 + 400 * D).active, false);
});

test('Pro: Lifetime Premium je trvalý a má přednost', () => {
  const s = Pro.state(buy('pro_lifetime', T0), T0 + 5000 * D);
  assert.deepEqual([s.plan, s.until, s.active], ['lifetime', null, true]);
  const mix = { ready: true, purchases: [buy('pro_tourist_7d', T0).purchases[0], buy('pro_lifetime', T0).purchases[0], buy('pro_annual', T0, true).purchases[0]] };
  assert.equal(Pro.state(mix, T0 + D).plan, 'lifetime');
});

test('Pro: nepotvrzený nákup a nákup z budoucnosti se nepočítá', () => {
  assert.equal(Pro.state({ ready: true, purchases: [{ sku: 'pro_lifetime', time: T0, state: 'pending' }] }, T0).active, false);
  assert.equal(Pro.state(buy('pro_tourist_7d', T0 + 3 * D), T0).active, false);
  assert.equal(Pro.state(buy('pro_tourist_7d', 0), T0).active, false);
});

test('Pro: can() zamyká jen při vynucení', () => {
  const free = Pro.state(null, T0), paid = Pro.state(buy('pro_lifetime', T0), T0);
  assert.equal(Pro.can(free, false), true);
  assert.equal(Pro.can(free, true), false);
  assert.equal(Pro.can(paid, true), true);
  assert.equal(Pro.can(null, true), false);
  assert.deepEqual([Pro.ads(free), Pro.ads(null), Pro.ads(paid)], [true, true, false]);
  assert.equal(Pro.ads(Pro.state(buy('pro_tourist_7d', T0), T0 + 7 * D)), true);
});

test('Pro: texty pro plány a srovnání ve všech jazycích', () => {
  const ks = ['proTitle', 'proSub', 'proLock', 'proUnlock', 'proSoon', 'proEarly', 'proFeat', 'proPlans', 'proChoose', 'proStatus', 'proStFree', 'proStUntil', 'proStRenew', 'proStLife', 'proForever', 'proDays', 'proOnce', 'proYearly', 'proActive', 'proNoAds', 'cmpAds', 'cmpAdsFree', 'cmpAdsPro'];
  for (const l of I18N.LANGS) {
    for (const k of [...ks, ...Pro.FREE, ...Pro.PLANS.map(p => 'proD_' + p.id)]) assert.equal(typeof I18N.D[l][k], 'string', `${l}.${k}`);
  }
});
