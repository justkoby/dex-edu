import React from "react";
import type { Arm, Body, Face } from "./poses";

/**
 * The Dexterity Netherlands storyteller – a vector puppet modelled on the supplied reference sheet
 * (NETHERLANDS/Ghanaian Character Expressions and Poses.png): short twisted hair with faded sides, thick brows,
 * large brown eyes, cream polo with navy collar + stripes, dark smartwatch.
 * Pure function of its props, so every scene shows the exact same design.
 *
 * Local units: origin = waist centre, y up is negative, shoulders at y = -330, head centre at y = -520.
 */
export const SKIN = { base: "#A9582E", light: "#CC7646", shade: "#84401D", deep: "#5F2610", lip: "#7A3320" };
const HAIR = "#191110";
const POLO = { cream: "#EFE1CC", shade: "#D2BDA2", navy: "#232A4D", navyLight: "#3A4578" };
const WINTER = { jacket: "#F37A20", jacketShade: "#C9590C", jacketLight: "#FF9A4A", navy: "#283C8D", navyDeep: "#17235A", white: "#FFFFFF" };

export type Winter = { beanie: number; scarf: number; jacket: number };
export type CharacterProps = {
  body: Body; face: Face; arms: [Arm, Arm];
  talk?: number; // 0..1 extra mouth opening from the narration envelope
  viseme?: number; // 0..1 slowly varying shape selector (wide <-> round) so speech is not a plain flap
  blink?: number; // 0..1 lids closed
  winter?: Winter;
  cold?: number; // 0..1 bluish tint + chattering
  frame?: number;
};

const rad = (d: number) => (d * Math.PI) / 180;
const SHOULDER_Y = -318, SHOULDER_X = 138, UPPER = 150, FORE = 138;

/* ------------------------------------------------------------------ hands */
const Hand: React.FC<{ type: number; side: -1 | 1; mitten?: boolean }> = ({ type, side, mitten }) => {
  // local space: wrist at origin, +y points away from the elbow. `side` mirrors the thumb.
  const fill = mitten ? WINTER.navy : "url(#skinHand)";
  const edge = mitten ? WINTER.navyDeep : SKIN.shade;
  const finger = (ang: number, len: number, w = 15, y0 = 34) => {
    const a = rad(ang), x1 = Math.sin(a) * 6, x2 = Math.sin(a) * (len + 6);
    return <line x1={x1} y1={y0} x2={x2} y2={y0 + Math.cos(a) * len} stroke={fill} strokeWidth={w} strokeLinecap="round" />;
  };
  const fingerEdge = (ang: number, len: number, w = 15, y0 = 34) => {
    const a = rad(ang), x1 = Math.sin(a) * 6, x2 = Math.sin(a) * (len + 6);
    return <line x1={x1} y1={y0} x2={x2} y2={y0 + Math.cos(a) * len} stroke={edge} strokeWidth={w + 3} strokeLinecap="round" opacity={0.55} />;
  };
  if (mitten) {
    return (
      <g transform={`scale(${side},1)`}>
        <ellipse cx={0} cy={30} rx={31} ry={36} fill={WINTER.navy} />
        <ellipse cx={30} cy={20} rx={13} ry={20} fill={WINTER.navy} transform="rotate(-24 30 20)" />
        <ellipse cx={-8} cy={22} rx={12} ry={20} fill="#3D55B8" opacity={0.5} />
        <rect x={-30} y={-12} width={60} height={20} rx={9} fill={WINTER.white} />
      </g>
    );
  }
  const t = Math.round(type);
  if (t === 4) {
    // foreshortened "pointing at the viewer": a big fist with the fingertip facing camera
    return (
      <g transform={`scale(${side * 1.3},1.3)`}>
        <ellipse cx={0} cy={26} rx={34} ry={33} fill={fill} />
        {[-16, 4, 22].map((x, i) => <ellipse key={i} cx={x + 4} cy={47} rx={10} ry={11} fill={fill} stroke={edge} strokeWidth={1.5} strokeOpacity={0.5} />)}
        <ellipse cx={30} cy={24} rx={11} ry={17} fill={fill} transform="rotate(-18 30 24)" />
        <circle cx={-8} cy={18} r={17} fill={SKIN.shade} opacity={0.5} />
        <circle cx={-9} cy={16} r={15.5} fill={SKIN.light} />
        <ellipse cx={-9} cy={11} rx={8} ry={6} fill="#E7B48F" opacity={0.85} />
      </g>
    );
  }
  return (
    <g transform={`scale(${side},1)`}>
      {t === 0 && (<>
        {[-30, -11, 8, 27].map((a, i) => <React.Fragment key={i}>{fingerEdge(a, [30, 38, 38, 30][i])}</React.Fragment>)}
        {fingerEdge(74, 20, 16, 16)}
        <ellipse cx={0} cy={24} rx={29} ry={30} fill={fill} />
        {[-30, -11, 8, 27].map((a, i) => <React.Fragment key={i}>{finger(a, [30, 38, 38, 30][i])}</React.Fragment>)}
        {finger(74, 20, 16, 16)}
        <ellipse cx={2} cy={28} rx={15} ry={14} fill={SKIN.light} opacity={0.35} />
      </>)}
      {t === 1 && (<>
        {fingerEdge(0, 50, 16, 30)}
        <ellipse cx={0} cy={24} rx={28} ry={29} fill={fill} />
        {finger(0, 50, 16, 30)}
        {[-16, 2, 18].map((x, i) => <ellipse key={i} cx={x + 8} cy={46} rx={10} ry={11} fill={fill} stroke={edge} strokeWidth={1.5} strokeOpacity={0.5} />)}
        {finger(80, 16, 16, 18)}
      </>)}
      {t >= 2 && (<>
        <ellipse cx={0} cy={26} rx={t === 3 ? 26 : 29} ry={t === 3 ? 34 : 30} fill={fill} />
        {t === 2 && [-19, -6, 7, 20].map((x, i) => <ellipse key={i} cx={x} cy={48} rx={8.5} ry={9} fill={fill} stroke={edge} strokeWidth={1.5} strokeOpacity={0.45} />)}
        {t === 3 && [-14, -2, 10].map((x, i) => <line key={i} x1={x} y1={46} x2={x} y2={58} stroke={edge} strokeWidth={1.6} strokeLinecap="round" opacity={0.45} />)}
        <ellipse cx={26} cy={22} rx={10} ry={16} fill={fill} transform="rotate(-18 26 22)" />
        <ellipse cx={-6} cy={20} rx={12} ry={14} fill={SKIN.light} opacity={0.3} />
      </>)}
    </g>
  );
};

/* ------------------------------------------------------------------- arms */
const ArmView: React.FC<{ arm: Arm; side: -1 | 1; jacket: number; watch?: boolean }> = ({ arm, side, jacket, watch }) => {
  const sx = side * SHOULDER_X, sy = SHOULDER_Y;
  const dir = (a: number) => [side * Math.sin(rad(a)), Math.cos(rad(a))] as const; // side=-1: +angle swings out to screen-left
  const [ux, uy] = dir(arm.sh), [fx, fy] = dir(arm.el);
  const ex = sx + ux * UPPER, ey = sy + uy * UPPER, wx = ex + fx * FORE, wy = ey + fy * FORE;
  const handRot = (Math.atan2(fy, fx) * 180) / Math.PI - 90 + side * -arm.wrist;
  const sleeveEnd = 0.62, cx = sx + ux * UPPER * sleeveEnd, cy = sy + uy * UPPER * sleeveEnd;
  const cuff0 = 0.5, c0x = sx + ux * UPPER * cuff0, c0y = sy + uy * UPPER * cuff0;
  const j = jacket > 0.5;
  // perpendicular offset for the tube highlight (towards the key light, upper-left)
  const hl = (x1: number, y1: number, x2: number, y2: number, w: number, o = 0.3, col = SKIN.light) => (
    <line x1={x1 - 7} y1={y1 - 7} x2={x2 - 7} y2={y2 - 7} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={o} />
  );
  return (
    <g>
      {j ? (<>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={WINTER.jacketShade} strokeWidth={96} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={wx - fx * 12} y2={wy - fy * 12} stroke={WINTER.jacketShade} strokeWidth={88} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={WINTER.jacket} strokeWidth={86} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={wx - fx * 12} y2={wy - fy * 12} stroke={WINTER.jacket} strokeWidth={78} strokeLinecap="round" />
        {hl(sx, sy, ex, ey, 34, 0.5, WINTER.jacketLight)}
        {hl(ex, ey, wx - fx * 14, wy - fy * 14, 28, 0.5, WINTER.jacketLight)}
        {[0.42, 0.82].map((p) => <line key={p} x1={sx + ux * UPPER * p - uy * 42} y1={sy + uy * UPPER * p + ux * 42} x2={sx + ux * UPPER * p + uy * 42} y2={sy + uy * UPPER * p - ux * 42} stroke={WINTER.jacketShade} strokeWidth={5} strokeLinecap="round" />)}
        {[0.35, 0.72].map((p) => <line key={p} x1={ex + fx * FORE * p - fy * 38} y1={ey + fy * FORE * p + fx * 38} x2={ex + fx * FORE * p + fy * 38} y2={ey + fy * FORE * p - fx * 38} stroke={WINTER.jacketShade} strokeWidth={5} strokeLinecap="round" />)}
      </>) : (<>
        {/* skin: upper arm + forearm as shaded tubes */}
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={SKIN.shade} strokeWidth={66} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={wx} y2={wy} stroke={SKIN.shade} strokeWidth={58} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={SKIN.base} strokeWidth={60} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={wx} y2={wy} stroke={SKIN.base} strokeWidth={52} strokeLinecap="round" />
        {hl(cx, cy, ex, ey, 22)}
        {hl(ex, ey, wx, wy, 18)}
        {watch && (
          <g transform={`translate(${ex + fx * FORE * 0.78} ${ey + fy * FORE * 0.78}) rotate(${(Math.atan2(fy, fx) * 180) / Math.PI - 90})`}>
            <rect x={-30} y={-13} width={60} height={26} rx={8} fill="#1E1F26" />
            <rect x={-19} y={-21} width={38} height={42} rx={10} fill="#2B2D38" />
            <rect x={-14} y={-16} width={28} height={32} rx={7} fill="#0E0F14" />
            <rect x={-10} y={-12} width={9} height={14} rx={3} fill="#4C5270" opacity={0.7} />
          </g>
        )}
        {/* short polo sleeve with the navy cuff stripe */}
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke={POLO.shade} strokeWidth={90} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke={POLO.cream} strokeWidth={84} strokeLinecap="butt" />
        <circle cx={sx} cy={sy} r={42} fill={POLO.cream} />
        <line x1={c0x} y1={c0y} x2={cx} y2={cy} stroke={POLO.navy} strokeWidth={86} strokeLinecap="butt" />
        <line x1={sx - 8} y1={sy - 8} x2={c0x - 8} y2={c0y - 8} stroke="#FFFFFF" strokeWidth={26} strokeLinecap="round" opacity={0.35} />
      </>)}
      <g transform={`translate(${wx} ${wy}) rotate(${handRot}) translate(0 -8) scale(1.18)`}>
        <Hand type={arm.hand} side={side === -1 ? 1 : -1} mitten={j} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------- face */
const Eye: React.FC<{ x: number; face: Face; blink: number; id: string }> = ({ x, face, blink, id }) => {
  const open = Math.max(0, face.eye * (1 - blink));
  const ry = 36 * Math.min(open, 1.32), rx = 31 + Math.max(0, open - 1) * 8;
  if (open < 0.14) {
    const up = face.happyEye > 0.5;
    return <path d={up ? `M${x - 30},4 Q${x},-24 ${x + 30},4` : `M${x - 30},0 Q${x},10 ${x + 30},0`} stroke={HAIR} strokeWidth={8} strokeLinecap="round" fill="none" />;
  }
  const ix = x + face.px * 8, iy = face.py * 9 + (1 - Math.min(open, 1)) * 4;
  return (
    <g>
      <clipPath id={id}><ellipse cx={x} cy={0} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={x} cy={2} rx={rx + 5} ry={ry + 5} fill={SKIN.shade} opacity={0.55} />
      <ellipse cx={x} cy={0} rx={rx} ry={ry} fill="#FDFBF7" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={x} cy={-ry} rx={rx + 4} ry={14} fill="#B9A9A0" opacity={0.55} />
        <circle cx={ix} cy={iy} r={25} fill="url(#iris)" />
        <circle cx={ix} cy={iy} r={12.5 * face.pupil} fill="#120A08" />
        <circle cx={ix - 8} cy={iy - 9} r={7} fill="#fff" />
        <circle cx={ix + 7} cy={iy + 7} r={2.6} fill="#fff" opacity={0.85} />
      </g>
      {/* upper lash line */}
      <path d={`M${x - rx - 2},${-ry * 0.25} Q${x},${-ry * 1.42} ${x + rx + 2},${-ry * 0.25}`} stroke={HAIR} strokeWidth={6.5} strokeLinecap="round" fill="none" />
    </g>
  );
};

const Brow: React.FC<{ x: number; side: -1 | 1; raise: number; rot: number }> = ({ x, side, raise, rot }) => (
  <g transform={`translate(${x} ${-56 - raise * 0.6}) rotate(${side * -rot})`}>
    <path d={`M${side * 34},6 Q${side * 4},-16 ${side * -32},2`} stroke={HAIR} strokeWidth={17} strokeLinecap="round" fill="none" />
    <path d={`M${side * 30},3 Q${side * 4},-17 ${side * -24},-2`} stroke="#3B2A26" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
  </g>
);

const Mouth: React.FC<{ face: Face; talk: number; viseme: number; chatter: number }> = ({ face, talk, viseme, chatter }) => {
  const o = Math.min(1, face.o + talk * (1 - viseme) * 0.55);
  const open = Math.min(1, face.open + talk * (0.5 + 0.35 * viseme) + chatter * 0.25);
  const w = 46 * (1 + (face.wide + talk * viseme * 0.25) * 0.3) * (1 - o * 0.42);
  const cy = -face.smile * 13;
  const lowCtl = face.smile * 26 + open * 92 + o * 10;
  const upCtl = face.smile * 9 - open * 10 - o * 12;
  if (open < 0.07) {
    return (<g transform="translate(0 86)">
      <path d={`M${-w},${cy} Q0,${face.smile * 30 + cy * 0.2} ${w},${cy}`} stroke={SKIN.deep} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      {face.smile > 0.2 && <><circle cx={-w - 4} cy={cy - 1} r={4} fill={SKIN.shade} opacity={0.6} /><circle cx={w + 4} cy={cy - 1} r={4} fill={SKIN.shade} opacity={0.6} /></>}
    </g>);
  }
  const d = `M${-w},${cy} Q0,${upCtl} ${w},${cy} Q0,${lowCtl} ${-w},${cy} Z`;
  const teethH = Math.min(17, 5 + open * 22);
  return (
    <g transform="translate(0 86)">
      <clipPath id="mouthClip"><path d={d} /></clipPath>
      <path d={d} fill="#3A0D10" stroke={SKIN.lip} strokeWidth={6} strokeLinejoin="round" />
      <g clipPath="url(#mouthClip)">
        <ellipse cx={0} cy={lowCtl * 0.5 + 6} rx={w * 0.62} ry={Math.max(6, open * 22)} fill="#D9666E" />
        <rect x={-w} y={Math.min(cy, upCtl) - 6} width={w * 2} height={teethH + 6 + Math.abs(cy - upCtl) * 0.5} fill="#FFFDF8" rx={4} />
        {chatter > 0.3 && <rect x={-w} y={lowCtl * 0.5 - 4} width={w * 2} height={30} fill="#FFFDF8" />}
      </g>
      <path d={`M${-w * 0.5},${lowCtl * 0.5 + 9} Q0,${lowCtl * 0.5 + 16} ${w * 0.5},${lowCtl * 0.5 + 9}`} stroke={SKIN.light} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.5} />
    </g>
  );
};

// deterministic hair-twist layout (bumpy silhouette + inner twists)
const TWISTS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const rows = [
    { r: 150, n: 13, a0: 200, a1: 340, s: 25 }, { r: 126, n: 11, a0: 198, a1: 342, s: 25 },
    { r: 101, n: 9, a0: 204, a1: 336, s: 24 }, { r: 76, n: 6, a0: 214, a1: 326, s: 23 },
  ];
  for (const row of rows) for (let i = 0; i < row.n; i++) {
    const a = rad(row.a0 + ((row.a1 - row.a0) * i) / (row.n - 1));
    out.push([Math.cos(a) * row.r * 0.86, 12 + Math.sin(a) * row.r * 1.02, row.s + ((i * 7) % 3)]);
  }
  return out;
})();

const Head: React.FC<{ face: Face; body: Body; talk: number; viseme: number; blink: number; beanie: number; cold: number; frame: number }> = ({ face, body, talk, viseme, blink, beanie, cold, frame }) => {
  const tx = body.turn * 16, ty = body.nod * 10;
  const chatter = cold > 0.5 ? (Math.sin(frame * 2.6) > 0 ? 1 : 0) * cold : 0;
  return (
    <g>
      {/* ears */}
      {([-1, 1] as const).map((s) => (
        <g key={s} transform={`translate(${s * 124 - body.turn * 8} ${10 + ty * 0.4})`}>
          <ellipse rx={27} ry={40} fill="url(#skinEar)" />
          <path d={`M${s * -6},-16 Q${s * 12},-12 ${s * 6},14`} stroke={SKIN.deep} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5} />
        </g>
      ))}
      {/* faded sides */}
      <path d="M-123,-10 C-130,-90 -100,-130 -60,-140 L60,-140 C100,-130 130,-90 123,-10 L112,-40 C100,-80 -100,-80 -112,-40 Z" fill="#2C1E1B" />
      {/* skull + jaw */}
      <path d="M-120,-22 C-120,-118 -72,-150 0,-150 C72,-150 120,-118 120,-22 C120,58 84,134 0,142 C-84,134 -120,58 -120,-22 Z" fill="url(#skinHead)" />
      <path d="M-120,-22 C-120,-118 -72,-150 0,-150 C72,-150 120,-118 120,-22 C120,58 84,134 0,142 C-84,134 -120,58 -120,-22 Z" fill="url(#headRim)" />
      {cold > 0 && <path d="M-120,-22 C-120,-118 -72,-150 0,-150 C72,-150 120,-118 120,-22 C120,58 84,134 0,142 C-84,134 -120,58 -120,-22 Z" fill="#6FA8FF" opacity={0.2 * cold} />}
      {/* temple fade */}
      <path d="M-120,-22 C-121,-70 -110,-104 -92,-122 C-100,-90 -104,-50 -106,0 Z" fill="#2C1E1B" opacity={0.75} />
      <path d="M120,-22 C121,-70 110,-104 92,-122 C100,-90 104,-50 106,0 Z" fill="#2C1E1B" opacity={0.75} />
      {/* hair: twisted top */}
      <g>
        <path d="M-104,-84 C-112,-150 -60,-178 0,-178 C60,-178 112,-150 104,-84 C80,-112 40,-120 0,-120 C-40,-120 -80,-112 -104,-84 Z" fill={HAIR} />
        {TWISTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y - 40} r={r} fill="url(#twist)" />)}
      </g>
      {/* face features shift together for a little parallax "turn" */}
      <g transform={`translate(${tx} ${ty})`}>
        <ellipse cx={-70} cy={52} rx={30} ry={22} fill="#D97A4E" opacity={0.28 + Math.max(0, face.smile) * 0.12} />
        <ellipse cx={70} cy={52} rx={30} ry={22} fill="#D97A4E" opacity={0.28 + Math.max(0, face.smile) * 0.12} />
        <g transform="translate(0 -6)">
          <Eye x={-52} face={face} blink={blink} id="eyeL" />
          <Eye x={52} face={face} blink={blink} id="eyeR" />
        </g>
        <Brow x={-54} side={-1} raise={face.browLy} rot={face.browLr} />
        <Brow x={54} side={1} raise={face.browRy} rot={face.browRr} />
        {/* nose */}
        <g transform={`translate(${body.turn * 7} 40)`}>
          <ellipse cx={0} cy={2} rx={30} ry={19} fill={SKIN.shade} opacity={0.55} />
          <ellipse cx={0} cy={-2} rx={27} ry={17} fill="url(#skinNose)" />
          <ellipse cx={-5} cy={-8} rx={11} ry={7} fill="#E39364" opacity={0.75} />
          <ellipse cx={-13} cy={8} rx={6} ry={3.6} fill={SKIN.deep} opacity={0.8} />
          <ellipse cx={13} cy={8} rx={6} ry={3.6} fill={SKIN.deep} opacity={0.8} />
        </g>
        <Mouth face={face} talk={talk} viseme={viseme} chatter={chatter} />
      </g>
      {/* beanie */}
      {beanie > 0.01 && (
        <g transform={`translate(0 -96) scale(${beanie}) translate(0 96)`}>
          <circle cx={0} cy={-232} r={30} fill={WINTER.white} />
          <circle cx={-8} cy={-240} r={12} fill="#E9EEF8" />
          <path d="M-128,-70 C-136,-170 -70,-218 0,-218 C70,-218 136,-170 128,-70 Z" fill={WINTER.navy} />
          <path d="M-100,-120 C-90,-180 -40,-204 0,-206" stroke="#4C66C9" strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.6} />
          <rect x={-136} y={-108} width={272} height={56} rx={26} fill={WINTER.jacket} />
          <rect x={-136} y={-108} width={272} height={20} rx={10} fill={WINTER.jacketLight} opacity={0.6} />
          {[-96, -64, -32, 0, 32, 64, 96].map((x) => <line key={x} x1={x} y1={-100} x2={x} y2={-60} stroke={WINTER.jacketShade} strokeWidth={5} strokeLinecap="round" />)}
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------- body */
const TORSO = "M-150,-330 C-176,-326 -186,-300 -182,-262 L-166,40 L166,40 L182,-262 C186,-300 176,-326 150,-330 L58,-348 L-58,-348 Z";

export const Character: React.FC<CharacterProps> = ({ body, face, arms, talk = 0, viseme = 0.5, blink = 0, winter, cold = 0, frame = 0 }) => {
  const w = winter ?? { beanie: 0, scarf: 0, jacket: 0 };
  const j = w.jacket;
  const shiver = cold > 0 ? Math.sin(frame * 2.9) * 5 * cold : 0;
  return (
    <g transform={`translate(${body.x + shiver} ${body.y}) rotate(${body.rot}) scale(${body.sx} ${body.sy})`}>
      <defs>
        <radialGradient id="skinHead" cx="38%" cy="30%" r="80%"><stop offset="0" stopColor="#CF7A49" /><stop offset="0.45" stopColor={SKIN.base} /><stop offset="1" stopColor="#7C3C1C" /></radialGradient>
        <linearGradient id="headRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0.78" stopColor="#FFB070" stopOpacity="0" /><stop offset="1" stopColor="#FFC48A" stopOpacity="0.45" /></linearGradient>
        <radialGradient id="skinEar" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#C26B3D" /><stop offset="1" stopColor="#7C3C1C" /></radialGradient>
        <radialGradient id="skinNose" cx="42%" cy="25%" r="80%"><stop offset="0" stopColor="#D58353" /><stop offset="1" stopColor="#9A4D26" /></radialGradient>
        <radialGradient id="skinHand" cx="40%" cy="35%" r="80%" gradientUnits="objectBoundingBox"><stop offset="0" stopColor="#C26B3D" /><stop offset="1" stopColor="#99491F" /></radialGradient>
        <radialGradient id="iris" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#9A5524" /><stop offset="0.7" stopColor="#6A3212" /><stop offset="1" stopColor="#2E1408" /></radialGradient>
        <radialGradient id="twist" cx="36%" cy="30%" r="75%"><stop offset="0" stopColor="#4A3833" /><stop offset="0.5" stopColor="#201615" /><stop offset="1" stopColor="#120C0B" /></radialGradient>
        <linearGradient id="poloShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0.25" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#6B4A2A" stopOpacity="0.28" /></linearGradient>
        <linearGradient id="neckShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5F2610" /><stop offset="1" stopColor={SKIN.base} /></linearGradient>
        <clipPath id="torsoClip"><path d={TORSO} /></clipPath>
      </defs>

      {/* neck */}
      <rect x={-46} y={-408} width={92} height={90} rx={30} fill="url(#neckShade)" />

      {/* torso: polo or puffer jacket */}
      {j < 0.5 ? (
        <g>
          <path d={TORSO} fill={POLO.cream} />
          <g clipPath="url(#torsoClip)">
            <rect x={-200} y={-232} width={400} height={44} fill={POLO.navy} />
            <rect x={-200} y={-176} width={400} height={9} fill={POLO.navy} />
            <rect x={-200} y={-96} width={400} height={44} fill={POLO.navy} />
            <rect x={-200} y={-40} width={400} height={9} fill={POLO.navy} />
            <rect x={-200} y={-360} width={400} height={420} fill="url(#poloShade)" />
            {/* placket + buttons */}
            <rect x={-17} y={-344} width={34} height={118} fill={POLO.cream} />
            <rect x={-17} y={-344} width={34} height={118} fill="#B79C7C" opacity={0.25} />
            <circle cx={0} cy={-292} r={6} fill="#8C6B4A" /><circle cx={0} cy={-254} r={6} fill="#8C6B4A" />
            {/* chest pocket */}
            <path d="M62,-178 L122,-178 L122,-122 Q92,-108 62,-122 Z" fill="none" stroke="#B79C7C" strokeWidth={4} opacity={0.8} />
          </g>
          {/* collar */}
          <path d="M-62,-352 L-18,-344 L-40,-268 L-104,-318 Z" fill={POLO.navy} />
          <path d="M62,-352 L18,-344 L40,-268 L104,-318 Z" fill={POLO.navy} />
          <path d="M-62,-352 L-18,-344 L-26,-318 L-84,-334 Z" fill={POLO.navyLight} opacity={0.6} />
          <path d="M-22,-346 L0,-312 L22,-346 Z" fill={SKIN.shade} />
        </g>
      ) : (
        <g transform={`translate(0 -160) scale(${0.9 + j * 0.1}) translate(0 160)`}>
          <path d="M-164,-338 C-196,-332 -206,-300 -202,-262 L-186,40 L186,40 L202,-262 C206,-300 196,-332 164,-338 L60,-356 L-60,-356 Z" fill={WINTER.jacket} />
          <g clipPath="url(#torsoClip)" />
          {[-250, -170, -90, -10].map((y) => <path key={y} d={`M-198,${y} Q0,${y + 22} 198,${y}`} stroke={WINTER.jacketShade} strokeWidth={6} fill="none" />)}
          {[-296, -214, -134, -54].map((y) => <path key={y} d={`M-170,${y} Q-90,${y + 12} -30,${y + 8}`} stroke={WINTER.jacketLight} strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.55} />)}
          <line x1={0} y1={-350} x2={0} y2={40} stroke={WINTER.jacketShade} strokeWidth={7} />
          <rect x={-9} y={-300} width={18} height={30} rx={5} fill="#D9DEE8" />
        </g>
      )}

      {/* scarf */}
      {w.scarf > 0.01 && (
        <g transform={`translate(0 -350) scale(${w.scarf}) translate(0 350)`}>
          <path d="M28,-340 L84,-338 L96,-190 L44,-186 Z" fill={WINTER.navyDeep} />
          {[-300, -262, -224].map((y) => <rect key={y} x={34} y={y} width={56} height={12} fill={WINTER.white} opacity={0.9} transform={`rotate(-2 60 ${y})`} />)}
          {[50, 62, 74, 86].map((x) => <line key={x} x1={x - 2} y1={-190} x2={x} y2={-170} stroke={WINTER.navyDeep} strokeWidth={6} strokeLinecap="round" />)}
          <rect x={-104} y={-404} width={208} height={78} rx={38} fill={WINTER.navy} />
          <path d="M-84,-384 Q0,-360 84,-384" stroke="#4C66C9" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.7} />
          <path d="M-90,-350 Q0,-326 90,-350" stroke={WINTER.navyDeep} strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* head (rotates about the neck) */}
      <g transform={`translate(${body.hx} ${-520 + body.hy}) rotate(${body.hrot} 0 130) translate(0 130) scale(1.28) translate(0 -130)`}>
        <Head face={face} body={body} talk={talk} viseme={viseme} blink={blink} beanie={w.beanie} cold={cold} frame={frame} />
      </g>

      {/* arms in front */}
      <ArmView arm={arms[0]} side={-1} jacket={j} />
      <ArmView arm={arms[1]} side={1} jacket={j} watch />
    </g>
  );
};
