import React from 'react';
import { COLOR } from './brand';
import { Reveal } from './Reveal';
import { Accent, Label, Rule } from './Type';
import { expoOut, prog } from './motion';
/** Editorial destination / chapter label: index, drawn rule, spaced title, optional serif line. Top-left by default. */
export const DestinationLabel: React.FC<{ t: number; at: number; outAt: number; index?: string; title: string; sub?: string; x?: number; y?: number; align?: 'left' | 'right' }> =
  ({ t, at, outAt, index, title, sub, x = 84, y = 250, align = 'left' }) => {
    const pr = expoOut(prog(t, at, at + 0.6)) * (1 - expoOut(prog(t, outAt, outAt + 0.35)));
    if (t < at) return null;
    return (
      <div style={{ position: 'absolute', top: y, ...(align === 'left' ? { left: x } : { right: 1080 - x }), display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'flex-end', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexDirection: align === 'left' ? 'row' : 'row-reverse' }}>
          {index && <Reveal t={t} at={at} dur={0.45} outAt={outAt}><Label size={30} color={COLOR.orange} tracking={0.2}>{index}</Label></Reveal>}
          <Rule p={pr} width={88} />
        </div>
        <Reveal t={t} at={at + 0.12} outAt={outAt + 0.02}><Label size={40} tracking={0.3}>{title}</Label></Reveal>
        {sub && <Reveal t={t} at={at + 0.24} outAt={outAt + 0.04}><Accent size={58} color="#fff">{sub}</Accent></Reveal>}
      </div>
    );
  };
