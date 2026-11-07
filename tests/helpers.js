const fs = require('fs');
const path = require('path');
const GTFS = require('../js/gtfs-core.js');
const EXTRA_FEEDS = require('../js/extra-airport.js');
const Places = require('../js/places.js');
const { readTables } = require('../tools/gtfs-node.js');

const ROOT = path.join(__dirname, '..');
const ZIP = process.env.GTFS_ZIP || path.join(ROOT, 'gtfs.zip');
const hasZip = fs.existsSync(ZIP);
const cache = {};

function tables() {
  if (!cache.t) cache.t = readTables(ZIP);
  return cache.t;
}

function feed({ extras = true, walk = false } = {}) {
  const k = 'f' + +extras + +walk;
  if (cache[k]) return cache[k];
  let tt = tables();
  if (extras) for (const x of EXTRA_FEEDS) tt = GTFS.merge(tt, EXTRA_FEEDS.localize(x, 'en'), x.id + ':');
  const f = GTFS.build(tt);
  if (walk) {
    const N = Places.net(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/walk.json'), 'utf8')));
    f.walkFn = (st, lim) => Places.stopWalks(N, st, lim);
  }
  return (cache[k] = f);
}

function testDay(f) {
  if (cache.day) return cache.day;
  const t = tables(), ex = new Map();
  for (const r of t.calendar_dates || []) ex.set(r.service_id + '|' + r.date, r.exception_type.trim());
  let best = null;
  const d = new Date(Date.UTC(+f.from.slice(0, 4), +f.from.slice(4, 6) - 1, +f.from.slice(6, 8)));
  for (; d.toISOString().slice(0, 10).replace(/-/g, '') <= f.to; d.setTime(d.getTime() + 864e5)) {
    if (d.getUTCDay() !== 2) continue;
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
    const n = (t.calendar || []).filter(c => ex.get(c.service_id + '|' + ymd) === '1' || (ex.get(c.service_id + '|' + ymd) !== '2' && c.tuesday.trim() === '1' && c.start_date <= ymd && ymd <= c.end_date)).length;
    if (!best || n > best.n) best = { ymd, n };
  }
  return (cache.day = { ymd: best.ymd, wd: 1 });
}

function rng(seed) {
  return () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
}

module.exports = { GTFS, EXTRA_FEEDS, Places, ROOT, ZIP, hasZip, feed, tables, testDay, rng };
