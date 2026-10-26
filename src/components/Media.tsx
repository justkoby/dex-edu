import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";

type Tf = { scale?: number; x?: number; y?: number; origin?: string };

export const CoverVideo: React.FC<{ src: string; startFrom?: number; position?: string } & Tf> = ({
  src, startFrom = 0, scale = 1, x = 0, y = 0, origin = "50% 50%", position = "50% 50%",
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      muted
      style={{
        width: "100%", height: "100%", objectFit: "cover", objectPosition: position,
        transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: origin,
      }}
    />
  </AbsoluteFill>
);

/** Still image with a slow Ken-Burns push (used for fallback character shots). */
export const KenBurns: React.FC<{
  src: string; from?: number; to?: number; panX?: number; panY?: number; origin?: string; duration: number; extra?: Tf;
}> = ({ src, from = 1.04, to = 1.16, panX = 0, panY = 0, origin = "50% 40%", duration, extra }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, duration], [0, 1], { extrapolateRight: "clamp" });
  const s = (from + (to - from) * p) * (extra?.scale ?? 1);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%", objectFit: "cover", transformOrigin: origin,
          transform: `translate(${panX * p + (extra?.x ?? 0)}px, ${panY * p + (extra?.y ?? 0)}px) scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Top + bottom gradient so chips / subtitles stay readable on any footage. */
export const Scrim: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.55, bottom = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(10,16,48,${top}) 0%, rgba(10,16,48,0) 22%, rgba(10,16,48,0) 52%, rgba(10,16,48,${bottom}) 86%)`,
    }}
  />
);
