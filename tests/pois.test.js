const test = require('node:test');
const assert = require('node:assert/strict');
const { Places } = require('./helpers');

test('pois: načtení platných míst ve formátu v1', () => {
  const p = Places.pois(JSON.stringify({ v: 1, items: [
    { id: 'a1', n: ' Babička ', d: 'třetí patro', lat: 41.33, lon: 19.82, ts: 5 },
    { id: 'b-2', n: 'Fitko', lat: '41.31', lon: '19.84' }
  ] }));
  assert.deepEqual(p, [
    { id: 'a1', n: 'Babička', d: 'třetí patro', lat: 41.33, lon: 19.82, ts: 5 },
    { id: 'b-2', n: 'Fitko', d: '', lat: 41.31, lon: 19.84, ts: 0 }
  ]);
});

test('pois: neplatná, neúplná a cizí data se zahodí', () => {
  for (const raw of [null, undefined, '', 'nesmysl', '{}', '42', '{"items": 5}']) assert.deepEqual(Places.pois(raw), [], String(raw));
  const p = Places.pois([
    { id: 'ok', n: 'x'.repeat(60), d: 'y'.repeat(300), lat: 41.33, lon: 19.82 },
    { id: 'ok', n: 'Duplicitní', lat: 41.33, lon: 19.82 },
    { id: 'bez-nazvu', n: '  ', lat: 41.33, lon: 19.82 },
    { id: 'praha', n: 'Praha', lat: 50.08, lon: 14.43 },
    { id: 'nan', n: 'NaN', lat: 'x', lon: 19.8 },
    { id: 'bez-delky', n: 'Bez délky', lat: 41.33 },
    { id: 'spatne id!', n: 'Id', lat: 41.33, lon: 19.82 },
    { n: 'Bez id', lat: 41.33, lon: 19.82 }
  ]);
  assert.equal(p.length, 1);
  assert.equal(p[0].n.length, 40);
  assert.equal(p[0].d.length, 200);
});

test('pois: nejvýš POI_MAX míst', () => {
  const items = Array.from({ length: Places.POI_MAX + 20 }, (_, i) => ({ id: 'p' + i, n: 'Místo ' + i, lat: 41.33, lon: 19.82 }));
  assert.equal(Places.pois({ items }).length, Places.POI_MAX);
});

test('poiHit: název i popis, bez diakritiky', () => {
  const p = { n: 'Babička', d: 'Rruga e Durrësit' };
  assert.ok(Places.poiHit(p, 'bab'));
  assert.ok(Places.poiHit(p, 'durres'));
  assert.ok(!Places.poiHit(p, 'xyz'));
  assert.ok(!Places.poiHit({ n: 'Fitko', d: '' }, 'durres'));
});

test('pois: id [\w-]{1,40}, souřadnice na okraji oblasti, ts jen číslo, cizí klíče pryč', () => {
  const { s, w, n, e } = Places.AREA;
  const p = Places.pois([
    { id: 'a'.repeat(40), n: 'Dlouhé id', lat: s, lon: w, ts: 'x', cizi: 1 },
    { id: 'a'.repeat(41), n: 'Příliš dlouhé id', lat: 41.33, lon: 19.82 },
    { id: 'mimo', n: 'Mimo', lat: n + 0.01, lon: e },
    { id: 'zaporne', n: 'Záporné ts', lat: 41.33, lon: 19.82, ts: -5 }
  ]);
  assert.deepEqual(p.map(x => x.id), ['a'.repeat(40), 'zaporne']);
  assert.deepEqual(Object.keys(p[0]).sort(), ['d', 'id', 'lat', 'lon', 'n', 'ts']);
  assert.equal(p[0].ts, 0);
  assert.equal(p[0].d, '');
});

test('pois: nestringový název a popis, limit drží prvních POI_MAX, vstup se nemění', () => {
  assert.deepEqual(Places.pois([{ id: 'a', n: 5, lat: 41.33, lon: 19.82 }]), []);
  assert.equal(Places.pois([{ id: 'a', n: 'X', d: 5, lat: 41.33, lon: 19.82 }])[0].d, '');
  const items = Array.from({ length: Places.POI_MAX + 5 }, (_, i) => ({ id: 'p' + i, n: 'M' + i, lat: 41.33, lon: 19.82 }));
  const copy = JSON.stringify(items), out = Places.pois(items);
  assert.equal(out[Places.POI_MAX - 1].id, 'p' + (Places.POI_MAX - 1));
  assert.equal(JSON.stringify(items), copy);
});
