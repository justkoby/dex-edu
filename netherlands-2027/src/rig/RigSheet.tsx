import React from "react";
import { AbsoluteFill } from "remotion";
import { CharacterFlat as Character } from "./CharacterFlat";
import { ARMS, ArmsName, BODY0, FACES, FaceName } from "./poses";

/** Model sheet: every expression and arm pose of the rig on one page – the consistency reference for this project. */
export const RigSheet: React.FC = () => {
  const faces = Object.keys(FACES) as FaceName[];
  const arms = Object.keys(ARMS) as ArmsName[];
  const cells = [
    ...faces.map((f) => ({ label: f, face: f, arms: "rest" as ArmsName, winter: false })),
    ...arms.map((a, i) => ({ label: a, face: faces[i % faces.length], arms: a, winter: false })),
    { label: "winter + cold", face: "cold" as FaceName, arms: "hug" as ArmsName, winter: true },
  ];
  const cols = 8, cw = 2400 / cols, ch = 330;
  return (
    <AbsoluteFill style={{ background: "#F4F1EC", fontFamily: "sans-serif" }}>
      <svg width={2400} height={Math.ceil(cells.length / cols) * ch} viewBox={`0 0 2400 ${Math.ceil(cells.length / cols) * ch}`}>
        {cells.map((c, i) => (
          <g key={i} transform={`translate(${(i % cols) * cw + cw / 2} ${Math.floor(i / cols) * ch + 300})`}>
            <g transform="scale(0.36)">
              <Character body={BODY0} face={FACES[c.face]} arms={ARMS[c.arms]} winter={c.winter ? { beanie: 1, scarf: 1, jacket: 1 } : undefined} cold={c.winter ? 1 : 0} />
            </g>
            <text y={24} textAnchor="middle" fontSize={20} fontWeight={700} fill="#232A4D">{c.label}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
