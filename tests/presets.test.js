const test = require('node:test');
const assert = require('node:assert/strict');
const { Places } = require('./helpers');

test('presets: načtení platných předvoleb', () => {
  const p = Places.presets(JSON.stringify({
    home: { n: ' Doma ', k: 'stop', l: 'Dollari A', lat: 41.3277, lon: 19.8164 },
    work: { k: 'map', l: 'Bod na mapě', lat: '41.33', lon: '19.82' },
    school: { n: 'Fitko' }
  }));
  assert.deepEqual(p.home, { n: 'Doma', k: 'stop', l: 'Dollari A', lat: 41.3277, lon: 19.8164 });
  assert.deepEqual(p.work, { n: '', k: 'map', l: 'Bod na mapě', lat: 41.33, lon: 19.82 });
  assert.deepEqual(p.school, { n: 'Fitko' });
});

test('presets: poškozená a neplatná data', () => {
  for (const raw of [null, undefined, '', 'nesmysl', '[]', '42', '{"home": 5}']) assert.deepEqual(Places.presets(raw), {}, String(raw));
  const p = Places.presets({
    home: { k: 'stop', l: 'X', lat: NaN, lon: 19.8 },
    work: { k: 'neznamy', l: 'X', lat: 41.3, lon: 19.8 },
    school: { n: 'x'.repeat(40), k: 'gps', l: 'y'.repeat(200), lat: 41.3, lon: 19.8 },
    other: { n: 'Chata', k: 'map', lat: 41.3, lon: 19.8 }
  });
  assert.equal(p.home, undefined);
  assert.equal(p.work, undefined);
  assert.equal(p.school.n.length, 24);
  assert.equal(p.school.l.length, 80);
  assert.equal(p.other, undefined);
  assert.deepEqual(Places.SLOTS, ['home', 'work', 'school']);
});

test('presetHit: začátek názvu nebo slova, bez diakritiky', () => {
  assert.ok(Places.presetHit('Domů', 'do'));
  assert.ok(Places.presetHit('Domů', 'DOMU'));
  assert.ok(Places.presetHit('Moje škola', 'sko'));
  assert.ok(Places.presetHit('Shtëpia', 'shte'));
  assert.ok(!Places.presetHit('Práce', 'ace'));
  assert.ok(!Places.presetHit('Domů', ''));
  assert.ok(!Places.presetHit('Domů', '  '));
});
