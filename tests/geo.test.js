const test = require('node:test');
const assert = require('node:assert/strict');
const { Places, hasZip, feed } = require('./helpers');

const skip = !hasZip && 'chybí gtfs.zip (nastav GTFS_ZIP)';
const SQUARE = [41.3275, 19.8187];

test('locate: centrum Tirany, okraj oblasti, mimo, Praha', () => {
  assert.equal(Places.locate(SQUARE, 15), 'ok');
  assert.equal(Places.locate([41.2201, 19.8], 20), 'ok');
  assert.equal(Places.locate([41.2199, 19.8], 20), 'outside');
  assert.equal(Places.locate([41.3, 20.03], 20), 'outside');
  assert.equal(Places.locate([50.0755, 14.4378], 10), 'outside');
});

test('locate: neplatné souřadnice a nízká přesnost', () => {
  for (const p of [[NaN, 19.8], [41.3, Infinity], [0, 0], [91, 19.8], [41.3, 181], null, [41.3]]) assert.equal(Places.locate(p, 10), 'invalid');
  assert.equal(Places.locate(SQUARE, Places.MAX_ACC), 'ok');
  assert.equal(Places.locate(SQUARE, Places.MAX_ACC + 1), 'inaccurate');
  assert.equal(Places.locate(SQUARE, NaN), 'inaccurate');
  assert.equal(Places.locate(SQUARE), 'ok');
  assert.equal(Places.locate([50.0755, 14.4378], 5000), 'outside');
});

test('nearest: řazení, limit, jedna položka na klíč, neplatné zastávky', () => {
  const st = [
    { id: 'a1', g: 'A', lat: 41.3290, lon: 19.8187 },
    { id: 'a2', g: 'A', lat: 41.3280, lon: 19.8187 },
    { id: 'b', g: 'B', lat: 41.3300, lon: 19.8187 },
    { id: 'c', g: 'C', lat: 41.3265, lon: 19.8187 },
    { id: 'x', g: 'X', lat: NaN, lon: 19.8 },
    { id: 'z', g: 'Z', lat: 0, lon: 0 }
  ];
  const r = Places.nearest(st, SQUARE, 5, s => s.g);
  assert.deepEqual(r.map(x => x.s.id), ['a2', 'c', 'b']);
  assert.ok(r.every((x, i) => i === 0 || r[i - 1].d <= x.d));
  assert.ok(Math.abs(r[0].d - 55.6) < 1);
  assert.equal(Places.nearest(st, SQUARE, 2, s => s.g).length, 2);
  assert.equal(Places.nearest(st, SQUARE).length, 4);
  assert.deepEqual(Places.nearest([], SQUARE), []);
  assert.deepEqual(Places.nearest([st[4], st[5]], SQUARE), []);
});

test('nearest nad skutečným feedem (offline, bez sítě)', { skip }, () => {
  const f = feed();
  const r = Places.nearest([...f.stops.values()], SQUARE, 5, s => s.name);
  assert.equal(r.length, 5);
  assert.ok(r[0].d < 500, 'nejbližší zastávka u náměstí Skanderbeg do 500 m, je ' + Math.round(r[0].d));
  assert.equal(new Set(r.map(x => x.s.name)).size, 5);
  assert.ok(r.every(x => Places.inArea([x.s.lat, x.s.lon])));
});

test('nearPlace: nejbližší místo do limitu, ulice s přirážkou, mimo limit nic', () => {
  const idx = { items: [
    { id: 'p0', n: 'Kavárna', c: 'food', pts: [[41.3276, 19.8188]] },
    { id: 's0', n: 'Ulice', c: 'street', pts: [[41.32752, 19.81872], [41.33, 19.82]] },
    { id: 'p1', n: 'Daleko', c: 'shop', pts: [[41.34, 19.83]] }
  ] };
  assert.equal(Places.nearPlace(idx, SQUARE, 60).id, 'p0');
  assert.equal(Places.nearPlace({ items: [idx.items[1]] }, SQUARE, 60).id, 's0');
  assert.equal(Places.nearPlace({ items: [idx.items[2]] }, SQUARE, 60), null);
  assert.equal(Places.nearPlace(null, SQUARE), null);
});
