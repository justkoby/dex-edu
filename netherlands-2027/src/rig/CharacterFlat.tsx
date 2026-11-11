import React from "react";
import type { CharacterProps } from "./Character";
import type { Arm } from "./poses";

/**
 * Character v3 – FLAT VECTOR style (client-approved direction: character-concept/references/ref-4-flat-vector-APPROVED-STYLE.webp).
 * Solid shapes, no outlines, no gradients on the body, a few thin fold lines and one shadow tone. Original design:
 * young Ghanaian man, high-top fade with a curly top edge, white ringer tee with navy trim, navy trousers, dark smartwatch.
 *
 * Drop-in replacement for the first rig: same props, same pose/expression libraries (poses.ts) and performance engine
 * (perform.ts), so every scene works unchanged. Local units: origin = waist centre, shoulders y = -318, head centre y = -520.
 */
const C = {
  skin: "#96472E", skinDark: "#7A3622", skinLight: "#A9573A", line: "#5C2414",
  hair: "#131013", white: "#FFFFFF", fold: "#D9D6E3", navy: "#283C8D", navyDeep: "#17235A", pants: "#3A2FC0",
  orange: "#F37A20", orangeDark: "#D4620F", mouth: "#4A1218", tongue: "#E0606A", watch: "#1E1F2B",
};
const rad = (d: number) => (d * Math.PI) / 180;
const SHOULDER_Y = -318, SHOULDER_X = 138, UPPER = 150, FORE = 138;

/* ------------------------------------------------------------------ hands (flat silhouettes) */
const Hand: React.FC<{ type: number; side: -1 | 1; mitten?: boolean }> = ({ type, side, mitten }) => {
  const f = mitten ? C.navy : C.skin;
  const cap = (ang: number, len: number, w: number, x0: number, y0: number) => {
    const a = rad(ang);
    return <line x1={x0} y1={y0} x2={x0 + Math.sin(a) * len} y2={y0 + Math.cos(a) * len} stroke={f} strokeWidth={w} strokeLinecap="round" />;
  };
  if (mitten) return (
    <g transform={`scale(${side},1)`}>
      <ellipse cx={0} cy={30} rx={31} ry={37} fill={C.navy} />
      <ellipse cx={30} cy={20} rx={13} ry={20} fill={C.navy} transform="rotate(-24 30 20)" />
      <rect x={-30} y={-12} width={60} height={20} rx={9} fill={C.white} />
    </g>
  );
  const t = Math.round(type);
  return (
    <g transform={`scale(${side},1)`}>
      {t === 0 && (<>
        <rect x={-27} y={-4} width={54} height={56} rx={22} fill={f} />
        {cap(-20, 32, 17, -18, 40)}{cap(-6, 40, 17.5, -6, 42)}{cap(7, 38, 17, 6, 42)}{cap(21, 28, 16, 18, 40)}
        {cap(66, 28, 18, 18, 14)}
      </>)}
      {t === 1 && (<>
        <rect x={-27} y={-4} width={54} height={56} rx={22} fill={f} />
        {cap(0, 52, 18, -10, 40)}
        <rect x={-4} y={34} width={32} height={24} rx={12} fill={f} />
        <path d="M6,40 v14 M16,40 v13" stroke={C.skinDark} strokeWidth={2.5} strokeLinecap="round" />
        {cap(74, 20, 16, 18, 16)}
      </>)}
      {(t === 2 || t === 3) && (<>
        <rect x={-25} y={-4} width={50} height={t === 3 ? 66 : 58} rx={23} fill={f} />
        {t === 2 && <path d="M-10,34 v16 M2,36 v16 M13,34 v15" stroke={C.skinDark} strokeWidth={2.5} strokeLinecap="round" />}
        <ellipse cx={25} cy={22} rx={9} ry={16} fill={f} transform="rotate(-16 25 22)" />
      </>)}
      {t === 4 && (
        <g transform="scale(1.3)">
          <rect x={-30} y={-6} width={60} height={62} rx={26} fill={f} />
          <ellipse cx={28} cy={22} rx={10} ry={17} fill={f} transform="rotate(-16 28 22)" />
          <path d="M6,38 v14 M17,36 v14" stroke={C.skinDark} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={-8} cy={22} r={17} fill={C.skinDark} />
          <circle cx={-8} cy={20} r={15} fill={C.skinLight} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------- arms */
const ArmView: React.FC<{ arm: Arm; side: -1 | 1; jacket: boolean; watch?: boolean }> = ({ arm, side, jacket, watch }) => {
  const sx = side * SHOULDER_X, sy = SHOULDER_Y;
  const dir = (a: number) => [side * Math.sin(rad(a)), Math.cos(rad(a))] as const;
  const [ux, uy] = dir(arm.sh), [fx, fy] = dir(arm.el);
  const ex = sx + ux * UPPER, ey = sy + uy * UPPER, wx = ex + fx * FORE, wy = ey + fy * FORE;
  const handRot = (Math.atan2(fy, fx) * 180) / Math.PI - 90 + side * -arm.wrist;
  const at = (p: number) => [sx + ux * UPPER * p, sy + uy * UPPER * p] as const;
  const [cx, cy] = at(0.6), [c0x, c0y] = at(0.47);
  return (
    <g>
      {jacket ? (<>
        <path d={`M${sx},${sy} L${ex},${ey} L${wx - fx * 14},${wy - fy * 14}`} stroke={C.orange} strokeWidth={86} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {[0.45, 0.85].map((p) => <line key={p} x1={at(p)[0] - uy * 42} y1={at(p)[1] + ux * 42} x2={at(p)[0] + uy * 42} y2={at(p)[1] - ux * 42} stroke={C.orangeDark} strokeWidth={5} />)}
        {[0.4, 0.75].map((p) => <line key={p} x1={ex + fx * FORE * p - fy * 40} y1={ey + fy * FORE * p + fx * 40} x2={ex + fx * FORE * p + fy * 40} y2={ey + fy * FORE * p - fx * 40} stroke={C.orangeDark} strokeWidth={5} />)}
      </>) : (<>
        <path d={`M${cx},${cy} L${ex},${ey} L${wx},${wy}`} stroke={C.skin} strokeWidth={60} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {watch && (
          <g transform={`translate(${ex + fx * FORE * 0.8} ${ey + fy * FORE * 0.8}) rotate(${(Math.atan2(fy, fx) * 180) / Math.PI - 90})`}>
            <rect x={-29} y={-11} width={58} height={22} rx={6} fill={C.watch} />
            <rect x={-17} y={-18} width={34} height={36} rx={9} fill={C.watch} />
            <rect x={-11} y={-12} width={22} height={24} rx={5} fill="#4B5278" />
          </g>
        )}
        {/* short tee sleeve with a navy ringer cuff */}
        <line x1={sx} y1={sy} x2={cx} y2={cy} stroke={C.white} strokeWidth={84} strokeLinecap="butt" />
        <circle cx={sx} cy={sy} r={42} fill={C.white} />
        <line x1={c0x} y1={c0y} x2={cx} y2={cy} stroke={C.navy} strokeWidth={84} strokeLinecap="butt" />
      </>)}
      <g transform={`translate(${wx} ${wy}) rotate(${handRot}) translate(0 -10) scale(1.1)`}>
        <Hand type={arm.hand} side={side === -1 ? 1 : -1} mitten={jacket} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------- head */
const FACE = "M-104,-40 C-106,-112 -66,-138 0,-138 C66,-138 106,-112 104,-40 L102,20 C100,76 62,128 0,132 C-62,128 -100,76 -102,20 Z";
// high-top with a curly top edge (scalloped), drawn as one flat shape
const HAIR_TOP_OLD = "M-108,-52 L-112,-150 C-112,-170 -98,-176 -88,-168 C-84,-186 -62,-190 -52,-176 C-46,-194 -20,-196 -12,-180 C-4,-198 24,-196 30,-180 C40,-196 66,-192 68,-174 C82,-186 102,-178 102,-160 C114,-158 116,-142 110,-134 L108,-52 C92,-84 60,-98 0,-98 C-60,-98 -92,-84 -108,-52 Z";

const Eye: React.FC<{ x: number; open: number; px: number; py: number; pupil: number; happy: number; id: string }> = ({ x, open, px, py, pupil, happy, id }) => {
  if (open < 0.16) return <path d={happy > 0.5 ? `M${x - 25},6 Q${x},-18 ${x + 25},6` : `M${x - 25},0 Q${x},11 ${x + 25},0`} stroke={C.hair} strokeWidth={7} strokeLinecap="round" fill="none" />;
  const ry = 23 * Math.min(open, 1.3), rx = 25;
  return (
    <g>
      <clipPath id={id}><ellipse cx={x} cy={0} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={x} cy={0} rx={rx} ry={ry} fill={C.white} />
      <ellipse cx={x + px * 8} cy={py * 6} rx={16 * pupil} ry={20 * pupil} fill={C.hair} clipPath={`url(#${id})`} />
      <circle cx={x + px * 8 + 5} cy={py * 6 - 8} r={4.2} fill={C.white} clipPath={`url(#${id})`} />
      <path d={`M${x - rx - 3},${-ry * 0.2} Q${x},${-ry * 1.5} ${x + rx + 3},${-ry * 0.2}`} stroke={C.hair} strokeWidth={6} strokeLinecap="round" fill="none" />
    </g>
  );
};

const Mouth: React.FC<{ smile: number; open: number; wide: number; o: number; chatter: number }> = ({ smile, open, wide, o, chatter }) => {
  const w = 42 * (1 + wide * 0.3) * (1 - o * 0.45), cy = -smile * 11;
  if (open < 0.08) return (
    <g>
      <path d={`M${-w},${cy} Q0,${smile * 26 + cy * 0.2} ${w},${cy}`} stroke={C.line} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d={`M-13,${smile * 13 + 15} Q0,${smile * 13 + 21} 13,${smile * 13 + 15}`} stroke={C.skinDark} strokeWidth={5} strokeLinecap="round" fill="none" />
    </g>
  );
  const low = smile * 22 + open * 76 + o * 8, up = smile * 8 - open * 8 - o * 10;
  const d = `M${-w},${cy} Q0,${up} ${w},${cy} Q0,${low} ${-w},${cy} Z`;
  return (
    <g>
      <clipPath id="flatMouth"><path d={d} /></clipPath>
      <path d={d} fill={C.mouth} />
      <g clipPath="url(#flatMouth)">
        <ellipse cx={0} cy={low * 0.5 + 8} rx={w * 0.6} ry={Math.max(6, open * 18)} fill={C.tongue} />
        <rect x={-w} y={Math.min(cy, up) - 6} width={w * 2} height={Math.min(15, 5 + open * 18) + 6 + Math.abs(cy - up) * 0.5} fill={C.white} />
        {chatter > 0.3 && <rect x={-w} y={low * 0.5 - 2} width={w * 2} height={26} fill={C.white} />}
      </g>
    </g>
  );
};

const Brow: React.FC<{ x: number; side: -1 | 1; raise: number; rot: number }> = ({ x, side, raise, rot }) => (
  <g transform={`translate(${x} ${-46 - raise * 0.6}) rotate(${side * -rot}) scale(${side} 1)`}>
    <path d="M-27,6 Q-6,-12 26,-4" stroke={C.hair} strokeWidth={13} strokeLinecap="round" fill="none" />
  </g>
);

const HAIR_TOP = "M-108,-50 L-114,-158 C-118,-182 -98,-192 -86,-180 C-84,-204 -56,-208 -48,-190 C-42,-212 -12,-214 -8,-194 C0,-214 30,-212 34,-192 C44,-210 72,-204 72,-184 C88,-196 110,-186 106,-166 C120,-162 120,-144 112,-136 L108,-50 C92,-80 60,-92 0,-92 C-60,-92 -92,-80 -108,-50 Z";

/* ------------------------------------------------------------------- body */
const TORSO = "M-120,-346 C-176,-342 -196,-300 -190,-250 L-172,40 L172,40 L190,-250 C196,-300 176,-342 120,-346 L62,-358 L-62,-358 Z";

export const CharacterFlat: React.FC<CharacterProps> = ({ body, face, arms, talk = 0, viseme = 0.5, blink = 0, winter, cold = 0, frame = 0 }) => {
  const w = winter ?? { beanie: 0, scarf: 0, jacket: 0 };
  const jacket = w.jacket > 0.5;
  const shiver = cold > 0 ? Math.sin(frame * 2.9) * 5 * cold : 0;
  const tx = body.turn * 15, ty = body.nod * 9;
  const open = Math.max(0, face.eye * (1 - blink));
  const chatter = cold > 0.5 ? (Math.sin(frame * 2.6) > 0 ? 1 : 0) * cold : 0;
  const mOpen = Math.min(1, face.open + talk * (0.5 + 0.35 * viseme) + chatter * 0.25), mO = Math.min(1, face.o + talk * (1 - viseme) * 0.5);
  return (
    <g transform={`translate(${body.x + shiver} ${body.y}) rotate(${body.rot}) scale(${body.sx} ${body.sy})`}>
      <defs>
        <clipPath id="flatTorso"><path d={TORSO} /></clipPath>
        <linearGradient id="flatFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.hair} /><stop offset="1" stopColor={C.hair} stopOpacity="0" /></linearGradient>
      </defs>

      {/* trousers (waistband just in frame on wider shots) */}
      <path d="M-170,30 L170,30 L176,260 L-176,260 Z" fill={C.pants} />
      {/* neck + under-chin shadow */}
      <path d="M-44,-420 L-48,-330 Q0,-296 48,-330 L44,-420 Z" fill={C.skin} />
      {w.scarf < 0.5 && <path d="M-46,-392 Q0,-340 46,-392 L46,-420 L-46,-420 Z" fill={C.skinDark} />}

      {jacket ? (
        <g>
          <path d="M-164,-346 C-198,-340 -208,-306 -204,-268 L-188,44 L188,44 L204,-268 C208,-306 198,-340 164,-346 L60,-362 L-60,-362 Z" fill={C.orange} />
          {[-250, -170, -90, -10].map((y) => <path key={y} d={`M-200,${y} Q0,${y + 20} 200,${y}`} stroke={C.orangeDark} strokeWidth={6} fill="none" />)}
          <line x1={0} y1={-356} x2={0} y2={44} stroke={C.orangeDark} strokeWidth={7} />
        </g>
      ) : (
        <g>
          <path d={TORSO} fill={C.white} />
          <g clipPath="url(#flatTorso)">
            <path d="M-186,-268 L-170,40 L-120,40 L-136,-250 Z" fill={C.fold} opacity={0.55} />
            <path d="M-128,-196 Q-116,-110 -122,-30" stroke={C.fold} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M118,-150 Q104,-80 112,10" stroke={C.fold} strokeWidth={4} fill="none" strokeLinecap="round" />
            <rect x={56} y={-214} width={64} height={62} rx={8} fill="none" stroke={C.fold} strokeWidth={4} />
          </g>
          {/* navy ringer collar */}
          <path d="M-62,-356 Q0,-300 62,-356 L50,-362 Q0,-322 -50,-362 Z" fill={C.navy} />
          <path d="M-50,-362 Q0,-322 50,-362 L44,-372 L-44,-372 Z" fill={C.skin} />
          <path d="M-46,-372 Q0,-336 46,-372 L44,-384 L-44,-384 Z" fill={C.skinDark} opacity={0.0} />
        </g>
      )}

      {w.scarf > 0.01 && (
        <g transform={`translate(0 -350) scale(${w.scarf}) translate(0 350)`}>
          <path d="M28,-344 L86,-342 L98,-188 L44,-184 Z" fill={C.navyDeep} />
          {[-300, -262, -224].map((y) => <rect key={y} x={34} y={y} width={58} height={12} fill={C.white} />)}
          <rect x={-106} y={-410} width={212} height={80} rx={40} fill={C.navy} />
          <path d="M-90,-352 Q0,-328 90,-352" stroke={C.navyDeep} strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* head */}
      <g transform={`translate(${body.hx} ${-520 + body.hy}) rotate(${body.hrot} 0 130) translate(0 130) scale(1.3) translate(0 -130)`}>
        {([-1, 1] as const).map((s) => (
          <g key={s} transform={`translate(${s * 108 - body.turn * 8} ${6 + ty * 0.4})`}>
            <ellipse rx={25} ry={36} fill={C.skin} />
            <path d={`M${s * 4},-12 Q${s * 14},0 ${s * 2},12`} stroke={C.line} strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <path d={FACE} fill={C.skin} />
        {cold > 0 && <path d={FACE} fill="#7FB2FF" opacity={0.22 * cold} />}
        {/* faded sides, then the flat-top */}
        <path d="M-104,-40 L-108,-110 L-84,-110 Q-92,-70 -92,-10 L-102,10 Z" fill="url(#flatFade)" />
        <path d="M104,-40 L108,-110 L84,-110 Q92,-70 92,-10 L102,10 Z" fill="url(#flatFade)" />
        <path d={HAIR_TOP} fill={C.hair} />
        <g transform={`translate(${tx} ${ty})`}>
          <Eye x={-46} open={open} px={face.px} py={face.py} pupil={face.pupil} happy={face.happyEye} id="flatEyeL" />
          <Eye x={46} open={open} px={face.px} py={face.py} pupil={face.pupil} happy={face.happyEye} id="flatEyeR" />
          <Brow x={-48} side={-1} raise={face.browLy} rot={face.browLr} />
          <Brow x={48} side={1} raise={face.browRy} rot={face.browRr} />
          <path d={`M${4 + body.turn * 6},18 Q${14 + body.turn * 8},44 ${6 + body.turn * 6},50 Q${-4 + body.turn * 6},54 ${-12 + body.turn * 6},48`} stroke={C.line} strokeWidth={6.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(0 86)"><Mouth smile={face.smile} open={mOpen} wide={face.wide + talk * viseme * 0.25} o={mO} chatter={chatter} /></g>
        </g>
        {w.beanie > 0.01 && (
          <g transform={`translate(0 -96) scale(${w.beanie}) translate(0 96)`}>
            <circle cx={0} cy={-232} r={30} fill={C.white} />
            <path d="M-122,-70 C-130,-170 -70,-218 0,-218 C70,-218 130,-170 122,-70 Z" fill={C.navy} />
            <rect x={-130} y={-108} width={260} height={56} rx={26} fill={C.orange} />
            {[-90, -60, -30, 0, 30, 60, 90].map((x) => <line key={x} x1={x} y1={-100} x2={x} y2={-60} stroke={C.orangeDark} strokeWidth={5} strokeLinecap="round" />)}
          </g>
        )}
      </g>

      <ArmView arm={arms[0]} side={-1} jacket={jacket} />
      <ArmView arm={arms[1]} side={1} jacket={jacket} watch />
    </g>
  );
};
