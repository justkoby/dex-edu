#!/usr/bin/env python3
"""Generates luts/dexterity_warm_neutral.cube: restrained warm-neutral filmic look (applied AFTER per-clip normalisation).
Soft toe/shoulder, gentle warm mids/highs, vibrance-limited saturation, blues eased slightly (ocean/sky), tiny black lift."""
import numpy as np, os
N = 33
g = np.linspace(0, 1, N)
B, G, R = np.meshgrid(g, g, g, indexing='ij')            # cube order: R fastest, then G, then B
rgb = np.stack([R, G, B], -1).reshape(-1, 3)
def curve(x):
    s = x*x*(3-2*x)                                       # smoothstep contrast
    y = x*0.70 + s*0.30
    sh = 0.80; y = np.where(y > sh, sh + (1-sh)*np.tanh((y-sh)/(1-sh)), y)   # highlight roll-off
    return 0.012 + y*0.985                                # slight black lift
y = curve(rgb)
luma = (0.2126*y[:,0] + 0.7152*y[:,1] + 0.0722*y[:,2])[:,None]
# warmth: mids/highs warmer, shadows kept neutral-to-barely-cool
w = np.clip((luma-0.15)/0.6, 0, 1)
y[:,0:1] *= 1 + 0.030*w; y[:,2:3] *= 1 - 0.040*w
y[:,2:3] += 0.008*(1-w)
# saturation control with vibrance limiting
luma = (0.2126*y[:,0] + 0.7152*y[:,1] + 0.0722*y[:,2])[:,None]
ch = y - luma; c = np.sqrt((ch**2).sum(1, keepdims=True))
sat = 0.96/(1 + 0.45*(c/0.35)**2)
# ease blue/cyan hues (ocean, sky) a touch more
hue = np.degrees(np.arctan2(np.sqrt(3)*(y[:,1]-y[:,2]), 2*y[:,0]-y[:,1]-y[:,2]))[:,None] % 360
blue = np.exp(-((hue-215)/30)**2)
sat = sat*(1 - 0.10*blue)
y = np.clip(luma + ch*sat, 0, 1)
os.makedirs(os.path.dirname(__file__) + '/../luts', exist_ok=True)
with open(os.path.dirname(__file__) + '/../luts/dexterity_warm_neutral.cube', 'w') as f:
    f.write('TITLE "Dexterity warm-neutral"\nLUT_3D_SIZE %d\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n' % N)
    for r in y: f.write('%.6f %.6f %.6f\n' % tuple(r))
print('lut written', y.shape)
