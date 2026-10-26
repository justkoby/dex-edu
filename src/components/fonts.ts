import { continueRender, delayRender, staticFile } from "remotion";
import { useEffect, useState } from "react";

const WEIGHTS = [500, 700, 800, 900] as const;

/** Loads the bundled Montserrat files (public/fonts) before any frame is rendered. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      WEIGHTS.map((w) =>
        new FontFace("Montserrat", `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)})`, {
          weight: String(w),
        })
          .load()
          .then((f) => (document.fonts as unknown as { add(f: FontFace): void }).add(f)),
      ),
    )
      .catch((e) => console.error("font load failed", e))
      .finally(() => continueRender(handle));
  }, [handle]);
};
