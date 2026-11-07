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
