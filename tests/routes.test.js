const test = require('node:test');
const assert = require('node:assert/strict');
const Places = require('../js/places.js');

const A = { k: 'stop', l: 'Skanderbeg Square', lat: 41.327, lon: 19.819 };
const B = { k: 'place', l: 'Airport', lat: 41.414, lon: 19.72 };
const mk = (o = {}) => ({ id: 'a1', n: 'Do práce', f: A, t: B, ...o });

test('routes: platná trasa projde, linky, čas ani datum se neukládají', () => {
  const [r] = Places.routes(JSON.stringify({ v: 1, items: [mk({ ts: 123, dep: '10:00', date: '20261109', x: [{ r: '11' }] })] }));
  assert.deepEqual(Object.keys(r).sort(), ['f', 't', 'id', 'n'].sort());
  assert.deepEqual(Object.keys(r.f).sort(), ['k', 'l', 'lat', 'lon']);
});

test('routes: duplicita (stejné konce a linky) a neplatné záznamy se zahodí', () => {
  const out = Places.routes([mk(), mk({ id: 'a2', n: 'Jiný název' }), mk({ id: 'a3', f: { k: 'stop', l: 'X', lat: 999, lon: 0 } }), mk({ id: '', n: 'x' }), null, 5]);
  assert.equal(out.length, 1);
  assert.equal(Places.routes([mk(), mk({ id: 'a2', t: A, f: B })]).length, 2);
});

test('routes: poškozený vstup dá prázdný seznam, limit počtu', () => {
  assert.deepEqual(Places.routes('{nesmysl'), []);
  assert.deepEqual(Places.routes(null), []);
  const many = Array.from({ length: 80 }, (_, i) => mk({ id: 'i' + i, f: { ...A, l: 'Zastávka ' + i } }));
  assert.equal(Places.routes(many).length, Places.ROUTE_MAX);
});

test('routes: konce smí být jen zastávka nebo místo, ostatní klíče se zahodí', () => {
  const [r] = Places.routes([mk({ f: { ...A, id: 'S1', ts: 9, dep: '10:00', lines: ['11'] }, t: { ...B, extra: 1 } })]);
  assert.deepEqual(Object.keys(r.f).sort(), ['k', 'l', 'lat', 'lon']);
  assert.deepEqual(Object.keys(r.t).sort(), ['k', 'l', 'lat', 'lon']);
  for (const k of ['map', 'gps', '', undefined, 5]) assert.equal(Places.routes([mk({ f: { ...A, k } })]).length, 0, String(k));
  assert.equal(Places.routes([mk({ t: { ...B, l: '   ' } })]).length, 0);
  assert.equal(Places.routes([mk({ f: { ...A, lat: 0, lon: 0 } })]).length, 0);
});

test('routes: id musí být [\w-]{1,20}, duplicitní id se zahodí', () => {
  const bad = ['', 'a'.repeat(21), 'spatne id', 'a/b', 5, null];
  for (const id of bad) assert.equal(Places.routes([mk({ id })]).length, 0, String(id));
  assert.equal(Places.routes([mk({ id: 'a'.repeat(20) })]).length, 1);
  assert.equal(Places.routes([mk(), mk({ t: { ...B, l: 'Jiné' } })]).length, 1);
});

test('routes: název se ořízne na 60, popisek konce na 80, nestringový název je prázdný', () => {
  const [r] = Places.routes([mk({ n: '  ' + 'x'.repeat(100), f: { ...A, l: 'y'.repeat(200) } })]);
  assert.equal(r.n.length, 60);
  assert.equal(r.f.l.length, 80);
  assert.equal(Places.routes([mk({ n: 42 })])[0].n, '');
});

test('routes: duplicita se pozná bez diakritiky a velikosti písmen', () => {
  const out = Places.routes([mk({ f: { ...A, l: 'Zastávka Šiška' } }), mk({ id: 'a2', f: { ...A, l: 'ZASTAVKA SISKA ' } })]);
  assert.equal(out.length, 1);
  assert.equal(Places.routeKey(out[0]), Places.routeKey({ f: { l: 'zastavka siska' }, t: B }));
  assert.notEqual(Places.routeKey({ f: A, t: B }), Places.routeKey({ f: B, t: A }));
});

test('routes: limit drží prvních ROUTE_MAX v pořadí, vstup se nemění', () => {
  assert.equal(Places.ROUTE_MAX, 50);
  const many = Array.from({ length: 70 }, (_, i) => mk({ id: 'i' + i, f: { ...A, l: 'Zastávka ' + i } }));
  const copy = JSON.stringify(many);
  const out = Places.routes(many);
  assert.equal(out[0].id, 'i0');
  assert.equal(out[Places.ROUTE_MAX - 1].id, 'i' + (Places.ROUTE_MAX - 1));
  assert.equal(JSON.stringify(many), copy);
});

test('routes: vstup bez seznamu a pole se špatnými typy dá prázdný seznam', () => {
  for (const raw of [undefined, '', '[]', '{}', '42', '"x"', '{"items": 5}', '{"v":1}', 7, true, {}]) assert.deepEqual(Places.routes(raw), [], String(raw));
  assert.deepEqual(Places.routes(JSON.stringify([mk()])).map(r => r.id), ['a1']);
});
