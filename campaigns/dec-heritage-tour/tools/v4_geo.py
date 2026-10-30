#!/usr/bin/env python3
"""Builds src/kit/geo/ghana_geo.json from Natural Earth 10m (public domain): Ghana + neighbour outlines (simplified),
and the Accra -> Cape Coast route assembled from Natural Earth road segments (the N1 coastal corridor), plus city points.
usage: v4_geo.py <ne_10m_admin_0_countries.geojson> <ne_10m_roads.geojson>"""
import json, sys, os, math
adm, roads = sys.argv[1:3]
out = os.path.join(os.path.dirname(__file__), '..', 'src', 'kit', 'geo', 'ghana_geo.json')
def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]; num = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1); den = math.hypot(x2 - x1, y2 - y1) or 1e-12
        if num / den > dmax: dmax, idx = num / den, i
    return dp(pts[:idx + 1], eps)[:-1] + dp(pts[idx:], eps) if dmax > eps else [pts[0], pts[-1]]
A = json.load(open(adm)); countries = {}
for f in A['features']:
    iso = f['properties'].get('ADM0_A3')
    if iso in ('GHA', 'CIV', 'BFA', 'TGO', 'BEN'):
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        def ring(r, eps):                               # closed ring: simplify the two halves separately
            r = [(round(x, 4), round(y, 4)) for x, y in r]; h = len(r) // 2
            return dp(r[:h + 1], eps)[:-1] + dp(r[h:], eps)
        rings = [ring(p[0], 0.012 if iso == 'GHA' else 0.03) for p in polys]
        countries[iso] = [r for r in rings if len(r) > 3]
R = json.load(open(roads)); segs = []
for f in R['features']:
    g = f['geometry']; lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
    for L in lines: segs.append([(round(x, 5), round(y, 5)) for x, y in L])
def near(p, q): return abs(p[0] - q[0]) < 2e-5 and abs(p[1] - q[1]) < 2e-5
def find(a, b):
    for s in segs:
        if near(s[0], a) and near(s[-1], b): return s
        if near(s[-1], a) and near(s[0], b): return s[::-1]
    raise SystemExit(f'segment {a}->{b} not found')
chain = [(-0.178254, 5.562251), (-0.227747, 5.566376), (-0.631941, 5.380777), (-1.007263, 5.261168), (-1.192862, 5.158058), (-1.242355, 5.10444)]
route = []
for a, b in zip(chain, chain[1:]): route += find(a, b)[(1 if route else 0):]
km = sum(6371 * math.radians(math.hypot((x2 - x1) * math.cos(math.radians((y1 + y2) / 2)), y2 - y1)) for (x1, y1), (x2, y2) in zip(route, route[1:]))
cities = {'Accra': (-0.1870, 5.6037), 'Cape Coast': (-1.2466, 5.1053), 'Kumasi': (-1.6244, 6.6885), 'Takoradi': (-1.7554, 4.8845), 'Tema': (-0.0166, 5.6698), 'Winneba': (-0.6231, 5.3511)}
json.dump(dict(source='Natural Earth 10m admin-0 countries + roads (public domain)', countries=countries, route=route, route_km=round(km, 1), cities=cities), open(out, 'w'))
print('GHA rings', [len(r) for r in countries['GHA']], 'route pts', len(route), f'{km:.0f} km (polyline, generalised)', 'bytes', os.path.getsize(out))
