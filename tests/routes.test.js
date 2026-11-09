const test = require('node:test');
const assert = require('node:assert/strict');
const Places = require('../js/places.js');

const A = { k: 'stop', l: 'Skanderbeg Square', lat: 41.327, lon: 19.819 };
const B = { k: 'place', l: 'Airport', lat: 41.414, lon: 19.72 };
const mk = (o = {}) => ({ id: 'a1', n: 'Do práce', f: A, t: B, x: [{ r: '11', a: 'X', b: 'Y' }, { r: '5', a: 'Y', b: 'Z' }], ...o });

test('routes: platná trasa projde, čas ani datum se neukládá', () => {
  const [r] = Places.routes(JSON.stringify({ v: 1, items: [mk({ ts: 123, dep: '10:00', date: '20261109' })] }));
  assert.deepEqual(Object.keys(r).sort(), ['f', 't', 'id', 'n', 'x'].sort());
  assert.equal(r.x.length, 2);
  assert.deepEqual(Object.keys(r.f).sort(), ['k', 'l', 'lat', 'lon']);
});

test('routes: duplicita (stejné konce a linky) a neplatné záznamy se zahodí', () => {
  const out = Places.routes([mk(), mk({ id: 'a2', n: 'Jiný název' }), mk({ id: 'a3', f: { k: 'stop', l: 'X', lat: 999, lon: 0 } }), mk({ id: '', n: 'x' }), null, 5]);
  assert.equal(out.length, 1);
  assert.equal(Places.routes([mk(), mk({ id: 'a2', x: [{ r: '11', a: 'X', b: 'Y' }] })]).length, 2);
});

test('routes: poškozený vstup dá prázdný seznam, limit počtu', () => {
  assert.deepEqual(Places.routes('{nesmysl'), []);
  assert.deepEqual(Places.routes(null), []);
  const many = Array.from({ length: 80 }, (_, i) => mk({ id: 'i' + i, x: [{ r: 'L' + i }] }));
  assert.equal(Places.routes(many).length, Places.ROUTE_MAX);
});
