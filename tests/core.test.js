const test = require('node:test');
const assert = require('node:assert/strict');
const { GTFS, hasZip, feed, tables, testDay } = require('./helpers');

const skip = !hasZip && 'chybí gtfs.zip (nastav GTFS_ZIP)';

test('toSec a hhmm včetně časů přes 24:00', () => {
  assert.equal(GTFS.toSec('25:10:00'), 90600);
  assert.equal(GTFS.hhmm(90600), '01:10');
  assert.equal(GTFS.toSec(''), null);
});

test('nextDay přes konec měsíce a roku', () => {
  assert.deepEqual(GTFS.nextDay('20261231', 3), { ymd: '20270101', wd: 4 });
  assert.deepEqual(GTFS.nextDay('20260228', 5), { ymd: '20260301', wd: 6 });
});

test('validity', () => {
  const f = { from: '20260101', to: '20261231' };
  assert.equal(GTFS.validity(f, '20260601').state, 'ok');
  assert.equal(GTFS.validity(f, '20261215').state, 'soon');
  assert.equal(GTFS.validity(f, '20270102').state, 'expired');
  assert.equal(GTFS.validity(f, '20251220').state, 'future');
});

test('clock počítá v zóně feedu', () => {
  const c = GTFS.clock('Europe/Tirane', new Date('2026-07-01T22:30:00Z'));
  assert.equal(c.ymd, '20260702');
  assert.equal(c.sec, 30 * 60);
});

test('merge přidá prefix ID a nemění základ', () => {
  const base = { stops: [{ stop_id: 'A' }], routes: [{ route_id: 'R' }] };
  const out = GTFS.merge(base, { stops: [{ stop_id: 'A', parent_station: 'P' }] }, 'x:');
  assert.deepEqual(out.stops.map(s => s.stop_id), ['A', 'x:A']);
  assert.equal(out.stops[1].parent_station, 'x:P');
  assert.equal(base.stops.length, 1);
});

test('demo síť se sestaví', () => {
  const f = GTFS.build(require('../js/demo.js')());
  assert.ok(f.routes.size > 0 && f.stops.size > 0);
});

test('reálný feed: základní počty a platnost', { skip }, () => {
  const f = feed({ extras: false });
  const t = tables();
  assert.equal(f.tz, 'Europe/Tirane');
  assert.ok(f.routes.size >= 20, 'linek ' + f.routes.size);
  assert.ok(f.stops.size >= 400, 'zastávek ' + f.stops.size);
  assert.ok(f.nTrips >= 1000, 'spojů ' + f.nTrips);
  assert.ok(/^\d{8}$/.test(f.from) && /^\d{8}$/.test(f.to) && f.from < f.to);
  for (const n of ['agency', 'stops', 'routes', 'trips', 'stop_times']) assert.ok(t[n] && t[n].length, n);
  console.log(`feed ${f.version}: ${f.routes.size} linek, ${f.stops.size} zastávek, ${f.nTrips} spojů, ${f.from}–${f.to}`);
});

test('letištní doplněk: linky RX a RT s prefixem', { skip }, () => {
  const a = feed({ extras: false }), b = feed();
  assert.ok(b.routes.has('rx:RX') && b.routes.has('rx:RT'));
  assert.equal(b.routes.size, a.routes.size + 2);
  for (const id of a.routes.keys()) assert.ok(!id.startsWith('rx:'));
});

test('groupStops: unikátní popisky', { skip }, () => {
  const g = GTFS.groupStops([...feed().stops.values()]);
  const labels = g.map(x => x.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('odjezdy: seřazené, v horizontu, i přes půlnoc', { skip }, () => {
  const f = feed(), d = testDay(f);
  const busy = [...f.stops.values()].sort((a, b) => (b.routes ? b.routes.size : 0) - (a.routes ? a.routes.size : 0))[0];
  for (const sec of [8 * 3600, 23 * 3600 + 50 * 60, 30 * 60]) {
    const deps = GTFS.departures(f, busy, { ...d, sec }, 10);
    for (let i = 1; i < deps.length; i++) assert.ok(deps[i].t >= deps[i - 1].t);
    for (const x of deps) assert.ok(x.t >= sec - 60 && x.t <= sec + 3 * 3600 + 60, `${sec}: ${x.t}`);
    if (sec === 8 * 3600) assert.ok(deps.length > 0, 'ráno bez odjezdů');
  }
});

test('letiště RX jezdí 24/7 i kolem půlnoci', { skip }, () => {
  const f = feed(), d = testDay(f);
  const s = f.stops.get('rx:CITY');
  assert.ok(s);
  const deps = GTFS.departures(f, s, { ...d, sec: 23 * 3600 + 30 * 60 }, 3).filter(x => x.tr.route.id === 'rx:RX');
  assert.ok(deps.length >= 1);
});
