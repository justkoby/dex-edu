import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/** Loads the bundled Archivo variable font (public/fonts, created by `npm run prep`). */
export const useArchivo = () => {
  const [handle] = useState(() => delayRender("archivo"));
  useEffect(() => {
    const f = new FontFace("Archivo", `url(${staticFile("fonts/archivo-latin-wdth-normal.woff2")})`, { weight: "100 900", stretch: "62% 125%" });
    f.load()
      .then((ff) => (document.fonts as unknown as { add(f: FontFace): void }).add(ff))
      .catch((e) => console.error("archivo load failed", e))
      .finally(() => continueRender(handle));
  }, [handle]);
};
