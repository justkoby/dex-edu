export type ShotV2T = { id: string; clip: string; src: number; ramp: [number, number][]; t0: number; t1: number; tin: string; out_dur: number; flag: string };
export type TimelineV2 = { fps: number; bpm: number; total: number; totalFrames: number; shots: ShotV2T[]; vo: { id: string; at: number; end: number; dur: number; text: string }[]; sections: { id: string; t0: number; t1: number }[] };
