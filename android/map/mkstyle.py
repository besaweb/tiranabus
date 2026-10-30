import json
H = 'https://appassets.androidplatform.net'
P = {
  'light': dict(bg='#f2efe9', wood='#cfe3b8', grass='#dcebc6', farm='#ebe9d4', res='#ebe7df', park='#c9e2b3', water='#a9d3f0', bld='#d9d3c8', bldl='#c7bfb1',
    motor='#f6b26b', trunk='#f8c98a', prim='#fbe29a', sec='#ffffff', min='#ffffff', path='#b9b2a6', case='#c9c2b5', rail='#9a948a', txt='#333333', halo='#ffffff', wtxt='#3b79b0', ptxt='#222222'),
  'dark': dict(bg='#1d2126', wood='#22301f', grass='#25331f', farm='#272a22', res='#23272c', park='#243a22', water='#16314a', bld='#2c3138', bldl='#363c44',
    motor='#8a5a2b', trunk='#7a5a35', prim='#6b5d34', sec='#4a5058', min='#3b4047', path='#555b63', case='#15181c', rail='#5d646c', txt='#d6dae0', halo='#1d2126', wtxt='#6fa8d6', ptxt='#e8ebef'),
}
SRC = 'osm'


def style(m):
  c = P[m]
  L = []

  def add(id, type, layer=None, **kw):
    d = dict(id=id, type=type)
    if layer:
      d['source'] = SRC
      d['source-layer'] = layer
    d.update(kw)
    L.append(d)

  W = lambda z1, w1, z2, w2: ['interpolate', ['exponential', 1.5], ['zoom'], z1, w1, z2, w2]
  add('bg', 'background', paint={'background-color': c['bg']})
  add('lc-wood', 'fill', 'landcover', filter=['==', 'class', 'wood'], paint={'fill-color': c['wood']})
  add('lc-grass', 'fill', 'landcover', filter=['in', 'class', 'grass', 'scrub'], paint={'fill-color': c['grass']})
  add('lc-farm', 'fill', 'landcover', filter=['==', 'class', 'farmland'], paint={'fill-color': c['farm']})
  add('lu-res', 'fill', 'landuse', filter=['in', 'class', 'residential', 'suburb', 'commercial', 'retail', 'industrial'], paint={'fill-color': c['res']})
  add('lu-park', 'fill', 'landuse', filter=['in', 'class', 'cemetery', 'playground', 'pitch', 'stadium'], paint={'fill-color': c['park']})
  add('park', 'fill', 'park', paint={'fill-color': c['park'], 'fill-opacity': .7})
  add('water', 'fill', 'water', paint={'fill-color': c['water']})
  add('waterway', 'line', 'waterway', paint={'line-color': c['water'], 'line-width': ['interpolate', ['linear'], ['zoom'], 10, .6, 15, 2.5]})
  add('aeroway', 'fill', 'aeroway', filter=['==', '$type', 'Polygon'], paint={'fill-color': c['bldl']})
  add('aeroway-rw', 'line', 'aeroway', filter=['==', '$type', 'LineString'], paint={'line-color': c['bldl'], 'line-width': W(10, 1, 15, 8)})
  add('building', 'fill', 'building', minzoom=13, paint={'fill-color': c['bld'], 'fill-outline-color': c['bldl']})
  road = lambda cl: ['all', ['in', 'class'] + cl, ['!in', 'brunnel', 'tunnel']]
  classes = [('motor', ['motorway'], 2.2), ('trunk', ['trunk'], 2), ('prim', ['primary'], 1.8), ('sec', ['secondary'], 1.5), ('sec', ['tertiary'], 1.3), ('min', ['minor', 'service'], .9)]
  lay = {'line-cap': 'round', 'line-join': 'round'}
  for k, cl, w in classes:
    add('rc-' + cl[0], 'line', 'transportation', filter=road(cl), layout=lay, paint={'line-color': c['case'], 'line-width': W(8, w * .8, 18, w * 18)})
  for k, cl, w in classes:
    add('r-' + cl[0], 'line', 'transportation', filter=road(cl), layout=lay, paint={'line-color': c[k], 'line-width': W(8, w * .5, 18, w * 14)})
  add('r-path', 'line', 'transportation', minzoom=14, filter=['in', 'class', 'path', 'track'], paint={'line-color': c['path'], 'line-width': 1, 'line-dasharray': [2, 2]})
  add('r-rail', 'line', 'transportation', filter=['==', 'class', 'rail'], paint={'line-color': c['rail'], 'line-width': 1, 'line-dasharray': [4, 3]})
  nm = ['coalesce', ['get', 'name:latin'], ['get', 'name']]

  def txt(**kw):
    d = {'text-field': nm, 'text-font': ['Noto Sans Regular']}
    d.update(kw)
    return d

  def tp(col, hw=1.5):
    return {'text-color': c[col], 'text-halo-color': c['halo'], 'text-halo-width': hw}

  add('road-name', 'symbol', 'transportation_name', minzoom=13, layout=txt(**{'symbol-placement': 'line', 'text-size': 11, 'text-max-angle': 30}), paint=tp('txt'))
  add('water-name', 'symbol', 'water_name', layout=txt(**{'text-size': 12, 'text-font': ['Noto Sans Medium']}), paint=tp('wtxt'))
  add('peak', 'symbol', 'mountain_peak', minzoom=11, layout=txt(**{'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, .3]}), paint=tp('txt'))
  add('poi', 'symbol', 'poi', minzoom=16, filter=['<=', 'rank', 25], layout=txt(**{'text-size': 10.5, 'text-anchor': 'top'}), paint=tp('ptxt'))
  add('place-sub', 'symbol', 'place', minzoom=12, filter=['in', 'class', 'suburb', 'neighbourhood', 'quarter', 'village', 'hamlet'],
      layout=txt(**{'text-size': ['interpolate', ['linear'], ['zoom'], 12, 11, 16, 14], 'text-transform': 'uppercase', 'text-letter-spacing': .05, 'text-max-width': 8}), paint=tp('txt'))
  add('place-city', 'symbol', 'place', filter=['in', 'class', 'city', 'town'],
      layout=txt(**{'text-size': ['interpolate', ['linear'], ['zoom'], 6, 13, 12, 20], 'text-font': ['Noto Sans Medium'], 'text-max-width': 8}), paint=tp('ptxt', 2))
  return dict(version=8, name='tirana-' + m, glyphs=H + '/map/fonts/{fontstack}/{range}.pbf',
              sources={SRC: dict(type='vector', tiles=[H + '/vt/{z}/{x}/{y}.pbf'], minzoom=0, maxzoom=14, bounds=[19.62, 41.22, 20.02, 41.46],
                                 attribution='© OpenMapTiles © OpenStreetMap contributors')}, layers=L)


for m in P:
  json.dump(style(m), open('style-%s.json' % m, 'w'), separators=(',', ':'))
