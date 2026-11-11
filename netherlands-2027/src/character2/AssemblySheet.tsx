import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFonts } from "../components/fonts";
import { FONT } from "../config/brand";
import { ArmMode, Character2, POSE0, Pose2 } from "./Character2";

loadFonts();
type Cell = { label: string; pose: Partial<Pose2>; armL: ArmMode; armR: ArmMode; blink?: number };
/** Named looks used by the Scene 1 test – every one is the same artwork, only moved. */
export const LOOKS: Record<string, Cell> = {
  assembled: { label: "Assembled (as supplied)", pose: {}, armL: "point", armR: "back" },
  friendly: { label: "Friendly point", pose: { headRot: -5, browLy: 8, browRy: 8, mouthOpen: 0.7, lean: -2 }, armL: "point", armR: "back" },
  asking: { label: "Asking / skeptical", pose: { headRot: 6, browLy: -6, browLr: 10, browRy: 16, browRr: -4, eye: 0.82, mouthOpen: 0.45, mouthW: 0.9, frown: 1, lookX: 0.3 }, armL: "back", armR: "palm" },
  frustrated: { label: "Frustrated", pose: { headRot: -4, browLy: -8, browLr: 14, browRy: -8, browRr: 14, eye: 0.8, mouthOpen: 0.8, mouthW: 0.95, frown: 1, lean: 2 }, armL: "palm", armR: "palm", },
  thinking: { label: "Thinking", pose: { headRot: 8, browLy: 14, browLr: -6, browRy: 2, browRr: 6, lookX: 0.8, lookY: -0.9, mouthOpen: 0, mouthW: 0.55, headX: 6 }, armL: "back", armR: "back" },
  shocked: { label: "Shocked recoil", pose: { headRot: -9, lean: -7, bx: -30, browLy: 30, browRy: 30, browLr: -8, browRr: -8, eye: 1.15, lookY: -0.7, mouthOpen: 1, oh: 1, armLRot: -52, armRRot: 52, armLLift: 40, armRLift: 40 }, armL: "palm", armR: "palm" },
  deadpan: { label: "Deadpan", pose: { browLy: -10, browRy: -10, eye: 0.6, mouthOpen: 0, mouthW: 0.7, frown: 0.5, headRot: 3 }, armL: "back", armR: "back" },
  blink: { label: "Blink", pose: { mouthOpen: 0.3 }, armL: "back", armR: "palm", blink: 1 },
};

export const AssemblySheet: React.FC = () => {
  const cells = Object.values(LOOKS), k = 0.3, cw = 440, ch = 660;
  return (
    <AbsoluteFill style={{ background: "#F3F1FB", fontFamily: FONT.body }}>
      <div style={{ position: "absolute", left: 40, top: 26, fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: "#1D1730" }}>Character assembly preview <span style={{ fontSize: 24, fontWeight: 600, fontFamily: FONT.body }}>— supplied parts, uniform scale, original colours</span></div>
      <div style={{ position: "absolute", left: 40, top: 110, width: 520, height: 1330, background: "#fff", borderRadius: 28, overflow: "hidden" }}>
        <Img src={staticFile("character2/reference.svg")} style={{ position: "absolute", left: 20, top: 90, width: 480 }} />
        <div style={{ position: "absolute", left: 24, top: 20, fontWeight: 700, fontSize: 24, color: "#5A6078" }}>Reference: charcater-1.svg</div>
      </div>
      {cells.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 590 + (i % 4) * (cw + 16), top: 110 + Math.floor(i / 4) * (ch + 16), width: cw, height: ch, background: "#fff", borderRadius: 28, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: cw / 2 - 317 * k, top: 96, transform: `scale(${k})`, transformOrigin: "0 0" }}>
            <Character2 pose={{ ...POSE0, ...c.pose }} armL={c.armL} armR={c.armR} blink={c.blink} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#1D1730", color: "#fff", fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.label}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
