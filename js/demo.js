function demoTables() {
  const C = [41.3275, 19.8187];
  const T = { agency: [{ agency_id: 'demo', agency_name: 'Ukázkový dopravce', agency_timezone: 'Europe/Tirane' }], stops: [], routes: [], trips: [], stop_times: [], frequencies: [], calendar: [], shapes: [] };
  T.calendar.push({ service_id: 'ALL', monday: '1', tuesday: '1', wednesday: '1', thursday: '1', friday: '1', saturday: '1', sunday: '1', start_date: '20260101', end_date: '20271231' });
  const ids = new Map();
  const stop = (name, lat, lon) => {
    const k = lat.toFixed(4) + ',' + lon.toFixed(4);
    if (ids.has(k)) return ids.get(k);
    const id = 'S' + (T.stops.length + 1);
    T.stops.push({ stop_id: id, stop_code: String(100 + T.stops.length), stop_name: name, stop_lat: lat.toFixed(6), stop_lon: lon.toFixed(6) });
    ids.set(k, id);
    return id;
  };
  const tstr = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':');

  const center = stop('Ukázka · Centrum', C[0], C[1]);
  const lineA = [];
  for (let k = -5; k <= 5; k++) lineA.push(k === 0 ? center : stop('Ukázka · ' + (k < 0 ? 'Západ ' + -k : 'Východ ' + k), C[0] + 0.004 * Math.sin(k / 2), C[1] + k * 0.0095));
  const lineB = [];
  for (let k = -4; k <= 4; k++) lineB.push(k === 0 ? center : stop('Ukázka · ' + (k < 0 ? 'Sever ' + -k : 'Jih ' + k), C[0] - k * 0.0085, C[1] + 0.003 * Math.cos(k)));
  const ring = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    ring.push(stop('Ukázka · Okruh ' + (k + 1), C[0] + 0.019 * Math.cos(a), C[1] + 0.025 * Math.sin(a)));
  }
  ring.push(ring[0]);
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * 2 * Math.PI;
    T.shapes.push({ shape_id: 'SH3', shape_pt_lat: (C[0] + 0.019 * Math.cos(a)).toFixed(6), shape_pt_lon: (C[1] + 0.025 * Math.sin(a)).toFixed(6), shape_pt_sequence: String(k) });
  }

  T.routes.push({ route_id: 'D1', route_short_name: 'D1', route_long_name: 'Západ – Centrum – Východ', route_type: '3', route_color: 'C8102E', route_text_color: 'FFFFFF' });
  T.routes.push({ route_id: 'D2', route_short_name: 'D2', route_long_name: 'Sever – Centrum – Jih', route_type: '3', route_color: '00798C', route_text_color: 'FFFFFF' });
  T.routes.push({ route_id: 'D3', route_short_name: 'D3', route_long_name: 'Okružní linka', route_type: '3', route_color: 'D99A1E', route_text_color: '1A1A1A' });

  const freqTrip = (route, dir, seq, hw, start, end, gap) => {
    const id = route + '-' + dir;
    T.trips.push({ route_id: route, service_id: 'ALL', trip_id: id, direction_id: String(dir) });
    seq.forEach((s, i) => T.stop_times.push({ trip_id: id, stop_id: s, stop_sequence: String(i + 1), arrival_time: tstr(start + i * gap), departure_time: tstr(start + i * gap) }));
    T.frequencies.push({ trip_id: id, start_time: tstr(start), end_time: tstr(end), headway_secs: String(hw) });
  };
  freqTrip('D1', 0, lineA, 600, 5.5 * 3600, 23 * 3600, 120);
  freqTrip('D1', 1, [...lineA].reverse(), 600, 5.5 * 3600 + 300, 23 * 3600, 120);
  freqTrip('D2', 0, lineB, 720, 6 * 3600, 22 * 3600, 150);
  freqTrip('D2', 1, [...lineB].reverse(), 720, 6 * 3600 + 360, 22 * 3600, 150);

  for (let s = 6 * 3600, n = 0; s <= 21 * 3600 + 2400; s += 1200, n++) {
    const id = 'D3-' + n;
    T.trips.push({ route_id: 'D3', service_id: 'ALL', trip_id: id, direction_id: '0', shape_id: 'SH3', trip_headsign: 'Okruh' });
    ring.forEach((st, i) => T.stop_times.push({ trip_id: id, stop_id: st, stop_sequence: String(i + 1), arrival_time: tstr(s + i * 180), departure_time: tstr(s + i * 180) }));
  }
  return T;
}
if (typeof module !== 'undefined') module.exports = demoTables;
