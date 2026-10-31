// Doplňkové linky LU-NA (Luna Travel) na letiště Tirana.
// Zdroj: https://luna.al/en/airport/timetable a https://luna.al/en/airport#stacionet (stav 29. 10. 2026).
// Polohy zastávek: odkazy Luna na Google Maps. Trasy: OSRM nad OpenStreetMap, zjednodušené na odchylku 6 m.
const EXTRA_I18N = {
  rx: {
    en: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – airport bus', TERM: 'Jug–Sever Terminal – airport bus', TIA: 'Tirana Airport – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express: centre – airport', desc: 'LU-NA. Every full hour, non-stop 24/7 in both directions. Fare 400 ALL (€4.50), paid on the bus, the ticket is valid all day. Journey time about 45 min.' },
        RT: { long: 'Jug–Sever Terminal – airport', desc: 'LU-NA. Every full hour: from the terminal 7:00–18:00, from the airport 8:00–18:00. Fare 300 ALL (€3.50). Luna does not state the journey time; the data uses an estimate of 30 min.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Tirana Airport (TIA)', 'Tirana centrum (Opera)': 'Tirana centre (Opera)', 'Terminál Jug–Sever': 'Jug–Sever Terminal' }
    },
    sq: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – autobusi për aeroport', TERM: 'Terminali Jug–Veri – autobusi për aeroport', TIA: 'Aeroporti i Tiranës – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express: qendra – aeroporti', desc: 'LU-NA. Çdo orë të plotë, pa ndërprerje 24/7 në të dy drejtimet. Bileta 400 ALL (4,50 €), paguhet në autobus dhe vlen gjithë ditën. Koha e udhëtimit rreth 45 min.' },
        RT: { long: 'Terminali Jug–Veri – aeroporti', desc: 'LU-NA. Çdo orë të plotë: nga terminali 7:00–18:00, nga aeroporti 8:00–18:00. Bileta 300 ALL (3,50 €). Luna nuk e tregon kohën e udhëtimit; në të dhëna është vlerësim 30 min.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Aeroporti i Tiranës (TIA)', 'Tirana centrum (Opera)': 'Qendra e Tiranës (Opera)', 'Terminál Jug–Sever': 'Terminali Jug–Veri' }
    },
    it: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – bus per l’aeroporto', TERM: 'Terminal Jug–Sever – bus per l’aeroporto', TIA: 'Aeroporto di Tirana – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express: centro – aeroporto', desc: 'LU-NA. Ogni ora piena, senza interruzioni 24/7 in entrambe le direzioni. Tariffa 400 ALL (4,50 €), si paga sull’autobus, il biglietto vale per tutto il giorno. Durata del viaggio circa 45 min.' },
        RT: { long: 'Terminal Jug–Sever – aeroporto', desc: 'LU-NA. Ogni ora piena: dal terminal 7:00–18:00, dall’aeroporto 8:00–18:00. Tariffa 300 ALL (3,50 €). Luna non indica la durata del viaggio; nei dati è usata una stima di 30 min.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Aeroporto di Tirana (TIA)', 'Tirana centrum (Opera)': 'Centro di Tirana (Opera)', 'Terminál Jug–Sever': 'Terminal Jug–Sever' }
    },
    de: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – Flughafenbus', TERM: 'Terminal Jug–Sever – Flughafenbus', TIA: 'Flughafen Tirana – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express: Zentrum – Flughafen', desc: 'LU-NA. Jede volle Stunde, rund um die Uhr in beide Richtungen. Fahrpreis 400 ALL (4,50 €), Bezahlung im Bus, der Fahrschein gilt den ganzen Tag. Fahrzeit etwa 45 Min.' },
        RT: { long: 'Terminal Jug–Sever – Flughafen', desc: 'LU-NA. Jede volle Stunde: vom Terminal 7:00–18:00, vom Flughafen 8:00–18:00. Fahrpreis 300 ALL (3,50 €). Luna gibt die Fahrzeit nicht an; in den Daten ist eine Schätzung von 30 Min. hinterlegt.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Flughafen Tirana (TIA)', 'Tirana centrum (Opera)': 'Zentrum Tirana (Opera)', 'Terminál Jug–Sever': 'Terminal Jug–Sever' }
    },
    pl: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – autobus na lotnisko', TERM: 'Terminal Jug–Sever – autobus na lotnisko', TIA: 'Lotnisko Tirana – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express: centrum – lotnisko', desc: 'LU-NA. Co pełną godzinę, całą dobę w obu kierunkach. Opłata 400 ALL (4,50 €), płatna w autobusie, bilet ważny przez cały dzień. Czas przejazdu około 45 min.' },
        RT: { long: 'Terminal Jug–Sever – lotnisko', desc: 'LU-NA. Co pełną godzinę: z terminalu 7:00–18:00, z lotniska 8:00–18:00. Opłata 300 ALL (3,50 €). Luna nie podaje czasu przejazdu; w danych przyjęto szacunek 30 min.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Lotnisko Tirana (TIA)', 'Tirana centrum (Opera)': 'Centrum Tirany (Opera)', 'Terminál Jug–Sever': 'Terminal Jug–Sever' }
    },
    fr: {
      stops: { CITY: 'Opera (Pallati i Kulturës) – bus pour l’aéroport', TERM: 'Terminal Jug–Sever – bus pour l’aéroport', TIA: 'Aéroport de Tirana – Nënë Tereza (TIA)' },
      routes: {
        RX: { long: 'Rinas Express : centre – aéroport', desc: 'LU-NA. Toutes les heures pleines, sans arrêt 24 h/24 dans les deux sens. Tarif 400 ALL (4,50 €), à payer dans le bus, le billet est valable toute la journée. Durée du trajet environ 45 min.' },
        RT: { long: 'Terminal Jug–Sever – aéroport', desc: 'LU-NA. Toutes les heures pleines : depuis le terminal de 7 h à 18 h, depuis l’aéroport de 8 h à 18 h. Tarif 300 ALL (3,50 €). Luna n’indique pas la durée du trajet ; les données utilisent une estimation de 30 min.' }
      },
      heads: { 'Letiště Tirana (TIA)': 'Aéroport de Tirana (TIA)', 'Tirana centrum (Opera)': 'Centre de Tirana (Opéra)', 'Terminál Jug–Sever': 'Terminal Jug–Sever' }
    }
  }
};
const EXTRA_FEEDS = [{
  id: 'rx',
  label: 'letiště (LU-NA)',
  updated: '20261029',
  name: 'Luna Travel',
  url: 'https://luna.al/aeroporti',
  tables: (() => {
    const tstr = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':');
    const T = {
      agency: [{ agency_id: 'LUNA', agency_name: 'LU-NA (Luna Travel)', agency_url: 'https://luna.al/en/airport', agency_timezone: 'Europe/Tirane' }],
      stops: [
        { stop_id: 'CITY', stop_name: 'Opera (Pallati i Kulturës) – bus na letiště', stop_desc: 'Za Palácem opery a baletu u Skanderbegova náměstí, autobus s nápisem TIRANA / AIRPORT', stop_lat: '41.328483', stop_lon: '19.820850' },
        { stop_id: 'TERM', stop_name: 'Terminál Jug–Sever – bus na letiště', stop_desc: 'Regionální autobusový terminál Jug–Sever', stop_lat: '41.344566', stop_lon: '19.777406' },
        { stop_id: 'TIA', stop_name: 'Letiště Tirana – Aeroporti Nënë Tereza (TIA)', stop_desc: 'Parkoviště autobusů, asi 1 minutu chůze od příletové haly', stop_lat: '41.417255', stop_lon: '19.713910' }
      ],
      routes: [
        { route_id: 'RX', agency_id: 'LUNA', route_short_name: 'RX', route_long_name: 'Rinas Express: centrum – letiště', route_desc: 'LU-NA. Každou celou hodinu nonstop 24/7 oběma směry. Jízdné 400 ALL (4,50 €), platí se v autobusu, jízdenka platí celý den. Jízdní doba asi 45 min.', route_type: '3', route_color: '1F5FAD', route_text_color: 'FFFFFF' },
        { route_id: 'RT', agency_id: 'LUNA', route_short_name: 'RT', route_long_name: 'Terminál Jug–Sever – letiště', route_desc: 'LU-NA. Každou celou hodinu: z terminálu 7:00–18:00, z letiště 8:00–18:00. Jízdné 300 ALL (3,50 €). Jízdní dobu Luna neuvádí, v datech je odhad 30 min.', route_type: '3', route_color: '5B6B8C', route_text_color: 'FFFFFF' }
      ],
      calendar: [{ service_id: 'DAILY', monday: '1', tuesday: '1', wednesday: '1', thursday: '1', friday: '1', saturday: '1', sunday: '1', start_date: '20260101', end_date: '20271231' }],
      trips: [],
      stop_times: [],
      shapes: []
    };
    const SHAPES = {
      'CITY-TIA': '41.32841,19.82088;41.32861,19.82189;41.33579,19.81778;41.33604,19.81761;41.33616,19.81738;41.33438,19.80648;41.33416,19.80592;41.33344,19.80473;41.33331,19.80425;41.33336,19.80363;41.33918,19.78694;41.33963,19.78574;41.34001,19.78503;41.34062,19.78308;41.34074,19.78248;41.34254,19.77747;41.36033,19.72602;41.36071,19.72480;41.36412,19.71163;41.36611,19.70601;41.36676,19.70490;41.36730,19.70441;41.36833,19.70382;41.36926,19.70357;41.37053,19.70345;41.40105,19.70432;41.40421,19.70415;41.40941,19.70365;41.41121,19.70334;41.41339,19.70280;41.41417,19.70277;41.41468,19.70308;41.41497,19.70369;41.41679,19.71270;41.41680,19.71281;41.41577,19.71295;41.41578,19.71309;41.41678,19.71296;41.41709,19.71415;41.41736,19.71410;41.41731,19.71387',
      'TIA-CITY': '41.41731,19.71387;41.41710,19.71359;41.41707,19.71292;41.42078,19.71242;41.42103,19.71254;41.42113,19.71243;41.42101,19.71183;41.42041,19.71047;41.41951,19.70784;41.41959,19.70739;41.41946,19.70709;41.41949,19.70683;41.42063,19.70090;41.42053,19.70043;41.42026,19.70017;41.41990,19.70021;41.41903,19.70107;41.41819,19.70095;41.40355,19.69606;41.40248,19.69583;41.40097,19.69578;41.39959,19.69607;41.39812,19.69666;41.39292,19.70048;41.39191,19.70107;41.39073,19.70156;41.38920,19.70197;41.38393,19.70260;41.38262,19.70265;41.38124,19.70253;41.38002,19.70224;41.37875,19.70175;41.37780,19.70125;41.37646,19.70030;41.37475,19.69865;41.37290,19.69624;41.37182,19.69505;41.37051,19.69410;41.36838,19.69320;41.36809,19.69297;41.36791,19.69259;41.36792,19.69233;41.36805,19.69205;41.36826,19.69192;41.36851,19.69196;41.36868,19.69217;41.36882,19.69269;41.36816,19.69841;41.36774,19.70087;41.36720,19.70276;41.36436,19.71026;41.36057,19.72475;41.36006,19.72636;41.34107,19.78120;41.33965,19.78475;41.33856,19.78829;41.33326,19.80356;41.33274,19.80427;41.33278,19.80491;41.33260,19.80561;41.32903,19.81588;41.32899,19.81598;41.32560,19.81690;41.32594,19.81911;41.32671,19.81891;41.32714,19.81934;41.32747,19.82267;41.32783,19.82233;41.32861,19.82189;41.32841,19.82088',
      'TERM-TIA': '41.34447,19.77760;41.34519,19.77824;41.34537,19.77828;41.34656,19.77621;41.34651,19.77598;41.34586,19.77546;41.34590,19.77497;41.35163,19.77070;41.35183,19.77065;41.35194,19.77074;41.35202,19.77065;41.35191,19.77047;41.35151,19.77067;41.34389,19.77630;41.34363,19.77621;41.34345,19.77567;41.34343,19.77528;41.34444,19.77235;41.34464,19.77131;41.34489,19.77058;41.36033,19.72602;41.36071,19.72480;41.36400,19.71208;41.36450,19.71041;41.36611,19.70601;41.36660,19.70511;41.36712,19.70455;41.36838,19.70380;41.36926,19.70357;41.37053,19.70345;41.40167,19.70430;41.40941,19.70365;41.41121,19.70334;41.41339,19.70280;41.41417,19.70277;41.41468,19.70308;41.41497,19.70369;41.41679,19.71270;41.41680,19.71281;41.41577,19.71295;41.41578,19.71309;41.41678,19.71296;41.41709,19.71415;41.41736,19.71410;41.41731,19.71387',
      'TIA-TERM': '41.41731,19.71387;41.41710,19.71359;41.41707,19.71292;41.42078,19.71242;41.42103,19.71254;41.42113,19.71243;41.42101,19.71183;41.42041,19.71047;41.41951,19.70784;41.41959,19.70739;41.41946,19.70709;41.41949,19.70683;41.42063,19.70090;41.42053,19.70043;41.42026,19.70017;41.41990,19.70021;41.41903,19.70107;41.41819,19.70095;41.40355,19.69606;41.40248,19.69583;41.40097,19.69578;41.39959,19.69607;41.39812,19.69666;41.39292,19.70048;41.39191,19.70107;41.39073,19.70156;41.38920,19.70197;41.38393,19.70260;41.38262,19.70265;41.38124,19.70253;41.38002,19.70224;41.37875,19.70175;41.37780,19.70125;41.37646,19.70030;41.37475,19.69865;41.37290,19.69624;41.37182,19.69505;41.37051,19.69410;41.36838,19.69320;41.36809,19.69297;41.36793,19.69271;41.36790,19.69246;41.36795,19.69221;41.36812,19.69199;41.36834,19.69191;41.36858,19.69203;41.36882,19.69269;41.36816,19.69841;41.36774,19.70087;41.36720,19.70276;41.36436,19.71026;41.36057,19.72475;41.35724,19.73464;41.34459,19.77109;41.34421,19.77178;41.34290,19.77546;41.34268,19.77573;41.34225,19.77697;41.34235,19.77749;41.34268,19.77760;41.34317,19.77697;41.34534,19.77540;41.34584,19.77547;41.34651,19.77598;41.34656,19.77621;41.34541,19.77823;41.34524,19.77828;41.34447,19.77760'
    };
    for (const [id, s] of Object.entries(SHAPES)) s.split(';').forEach((p, i) => {
      const [lat, lon] = p.split(',');
      T.shapes.push({ shape_id: id, shape_pt_lat: lat, shape_pt_lon: lon, shape_pt_sequence: String(i + 1) });
    });
    const add = (route, dir, from, to, head, hours, ride) => {
      for (const h of hours) {
        const id = route + '-' + from + '-' + String(h).padStart(2, '0');
        T.trips.push({ route_id: route, service_id: 'DAILY', trip_id: id, direction_id: String(dir), trip_headsign: head, shape_id: from + '-' + to });
        T.stop_times.push({ trip_id: id, stop_id: from, stop_sequence: '1', arrival_time: tstr(h * 3600), departure_time: tstr(h * 3600) });
        T.stop_times.push({ trip_id: id, stop_id: to, stop_sequence: '2', arrival_time: tstr(h * 3600 + ride), departure_time: tstr(h * 3600 + ride) });
      }
    };
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    add('RX', 0, 'CITY', 'TIA', 'Letiště Tirana (TIA)', range(0, 23), 45 * 60);
    add('RX', 1, 'TIA', 'CITY', 'Tirana centrum (Opera)', range(0, 23), 45 * 60);
    add('RT', 0, 'TERM', 'TIA', 'Letiště Tirana (TIA)', range(7, 18), 30 * 60);
    add('RT', 1, 'TIA', 'TERM', 'Terminál Jug–Sever', range(8, 18), 30 * 60);
    return T;
  })()
}];
EXTRA_FEEDS.localize = (x, lang) => {
  const L = EXTRA_I18N[x.id] && EXTRA_I18N[x.id][lang];
  if (!L) return x.tables;
  const T = x.tables;
  return Object.assign({}, T, {
    stops: T.stops.map(s => L.stops[s.stop_id] ? Object.assign({}, s, { stop_name: L.stops[s.stop_id] }) : s),
    routes: T.routes.map(r => L.routes[r.route_id] ? Object.assign({}, r, { route_long_name: L.routes[r.route_id].long, route_desc: L.routes[r.route_id].desc }) : r),
    trips: T.trips.map(t => L.heads[t.trip_headsign] ? Object.assign({}, t, { trip_headsign: L.heads[t.trip_headsign] }) : t)
  });
};
if (typeof module !== 'undefined') module.exports = EXTRA_FEEDS;
