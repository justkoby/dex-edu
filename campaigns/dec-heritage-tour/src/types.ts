export type Trans = { type: 'cut' | 'dissolve' | 'leak' | 'push'; dur: number };
export type Shot = { id: string; scene: string; clip: string; start: number; end: number; dur: number; srcIn: number; trans: Trans; head: number; tail: number; flag: string };
export type Timeline = { fps: number; total: number; totalFrames: number; lead: number; voStart: number; voEnd: number; scenes: { id: string; start: number; end: number }[]; vo: { scene: string; start: number; end: number }[]; shots: Shot[] };
