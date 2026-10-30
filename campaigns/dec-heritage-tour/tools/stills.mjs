// Render selected frames of a composition from one bundle. usage: node tools/stills.mjs <compId> <outDir> <sec,sec,...>
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path'; import fs from 'node:fs';
const [comp, outDir, secs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const browserExecutable = process.env.CHROME_BIN;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const s of secs.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  await renderStill({ serveUrl, composition, frame, output: path.join(outDir, `f_${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85, browserExecutable });
  process.stdout.write(`${s}s `);
}
console.log('done');
