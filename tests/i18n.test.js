const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const I18N = require('../js/i18n.js');
const EXTRA_FEEDS = require('../js/extra-airport.js');
const { ROOT } = require('./helpers');

const keys = o => Object.keys(o).sort();

test('i18n.js: všech 12 jazyků má stejné klíče jako en', () => {
  assert.equal(I18N.LANGS.length, 12);
  const ref = keys(I18N.D.en);
  for (const l of I18N.LANGS) {
    assert.ok(I18N.D[l], l);
    const k = keys(I18N.D[l]);
    assert.deepEqual(ref.filter(x => !k.includes(x)), [], `${l}: chybí`);
    assert.deepEqual(k.filter(x => !ref.includes(x)), [], `${l}: navíc`);
  }
});

test('i18n.js: parametry {x} shodné s en', () => {
  const ps = s => (JSON.stringify(s).match(/\{\w+\}/g) || []).sort().join();
  for (const l of I18N.LANGS) for (const k of keys(I18N.D.en)) assert.equal(ps(I18N.D[l][k]), ps(I18N.D.en[k]), `${l}.${k}`);
});

test('i18n.js: plurály mají tolik tvarů, kolik pl() potřebuje', () => {
  for (const l of I18N.LANGS) {
    I18N.setLang(l);
    for (const k of keys(I18N.D.en).filter(k => Array.isArray(I18N.D.en[k]))) {
      for (const n of [0, 1, 2, 3, 5, 11, 21, 22, 25, 101]) assert.equal(typeof I18N.pl(k, n), 'string', `${l}.${k}(${n})`);
    }
  }
});

test('extra-airport.js: texty letiště ve všech jazycích', () => {
  for (const x of EXTRA_FEEDS) for (const l of I18N.LANGS) {
    const t = EXTRA_FEEDS.localize(x, l);
    if (l !== 'cs') assert.notEqual(t, x.tables, `${x.id}: chybí překlad ${l}`);
    assert.ok(t.routes.every(r => r.route_long_name), `${x.id} ${l}`);
  }
});

function androidDict(file) {
  const src = fs.readFileSync(path.join(ROOT, 'android', file), 'utf8');
  const m = /const [TD] = (\{[\s\S]*?\n  \});/.exec(src);
  return vm.runInNewContext('(' + m[1] + ')');
}

for (const file of ['menu.js', 'validity.js']) {
  test(`android/${file}: všech 12 jazyků`, () => {
    const T = androidDict(file), ref = keys(T.en);
    for (const l of I18N.LANGS) {
      assert.ok(T[l], `${file}: chybí jazyk ${l}`);
      assert.deepEqual(keys(T[l]), ref, `${file} ${l}`);
    }
  });
}
