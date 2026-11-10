const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { GTFS, hasZip, feed, testDay, rng } = require('./helpers');

const SNAP = path.join(__dirname, 'fixtures', 'planner-snapshot.json');
const skip = !hasZip && 'chybí gtfs.zip (nastav GTFS_ZIP)';

function queries(f, n, seed) {
  const g = GTFS.groupStops([...f.stops.values()].filter(s => !s.id.startsWith('rx:'))).sort((a, b) => a.label.localeCompare(b.label));
  const r = rng(seed), out = [];
  while (out.length < n) {
    const a = g[Math.floor(r() * g.length)], b = g[Math.floor(r() * g.length)];
    if (a === b) continue;
    out.push({ from: a.label, to: b.label, a: a.stops, b: b.stops, t0: 5 * 3600 + Math.floor(r() * 19 * 60) * 60, tomorrow: r() < 0.2 });
  }
  out.push({ from: g[0].label, to: g[g.length - 1].label, a: g[0].stops, b: g[g.length - 1].stops, t0: 23 * 3600 + 50 * 60, tomorrow: false });
  return out;
}

const sig = j => [GTFS.hhmm(j.dep), GTFS.hhmm(j.arr), j.transfers, j.legs.filter(l => l.kind === 'ride').map(l => l.route ? l.route.short : (l.inst && l.inst.tr.route.short)).join('>')].join(' ');

function run(walk) {
  const f = feed({ walk }), d = testDay(f), out = {}, bad = [];
  for (const q of queries(f, 80, walk ? 7 : 3)) {
    const day = q.tomorrow ? GTFS.nextDay(d.ymd, d.wd) : d;
    const r = GTFS.plan(f, q.a, q.b, day, q.t0, 5);
    for (const j of r.list) {
      if (j.dep < q.t0) bad.push(`${q.from} → ${q.to} ${GTFS.hhmm(q.t0)}: start ${GTFS.hhmm(j.dep)}`);
      assert.ok(j.arr >= j.dep);
      assert.equal(j.transfers, Math.max(0, j.rides - 1));
      let t = j.dep;
      for (const l of j.legs) { assert.ok(l.dep >= t - 1, `${q.from} → ${q.to}: navazování úseků`); t = l.arr; }
    }
    out[`${q.from} → ${q.to} ${GTFS.hhmm(q.t0)}${q.tomorrow ? ' +1' : ''}`] = r.same ? 'same' : r.list.map(sig);
  }
  return { feed: f.version, day: d.ymd, res: out, bad };
}

const results = {};

for (const walk of [false, true]) {
  test(`plánovač: invarianty a regresní snapshot (${walk ? 'pěší síť' : 'vzdušná čára'})`, { skip }, t => {
    const key = walk ? 'walk' : 'air', cur = run(walk);
    results[key] = cur;
    const snap = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, 'utf8')) : {};
    if (process.env.UPDATE_SNAPSHOT) {
      snap[key] = { feed: cur.feed, day: cur.day, res: cur.res };
      fs.writeFileSync(SNAP, JSON.stringify(snap, null, 1) + '\n');
      return;
    }
    const old = snap[key];
    if (!old || old.feed !== cur.feed) { t.skip(`snapshot je pro feed ${old && old.feed}, aktuální ${cur.feed} – přegeneruj UPDATE_SNAPSHOT=1`); return; }
    assert.deepEqual(cur.res, old.res);
  });
}

test('plánovač: spojení nezačíná před zadaným časem', { skip }, () => {
  const bad = Object.values(results).flatMap(r => r.bad);
  assert.deepEqual(bad, []);
});
