const fs = require('fs');
const zlib = require('zlib');

function unzip(buf) {
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('Not a ZIP file');
  const n = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const out = {};
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nl);
    const ds = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.subarray(ds, ds + csize);
    out[name] = method === 0 ? raw : zlib.inflateRawSync(raw);
    p += 46 + nl + xl + cl;
  }
  return out;
}

function csv(txt) {
  txt = txt.replace(/^﻿/, '');
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) {
      if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && txt[i + 1] === '\n') i++;
      row.push(f); f = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  const h = rows.shift().map(x => x.trim());
  return rows.map(r => { const o = {}; h.forEach((k, i) => { o[k] = r[i] != null ? r[i] : ''; }); return o; });
}

function readTables(file) {
  const files = unzip(fs.readFileSync(file)), t = {};
  for (const n of ['agency', 'stops', 'routes', 'trips', 'stop_times', 'calendar', 'calendar_dates', 'frequencies', 'shapes', 'feed_info']) {
    const k = Object.keys(files).find(x => x === n + '.txt' || x.endsWith('/' + n + '.txt'));
    if (k) t[n] = csv(files[k].toString('utf8'));
  }
  return t;
}

module.exports = { readTables };
