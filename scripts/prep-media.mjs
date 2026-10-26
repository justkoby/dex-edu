// Builds web-ready, muted, normalised copies of the originals in BUDAPEST-VID/ into public/media/.
// Originals are never modified. Run: npm run prep
import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => path.join(root, "BUDAPEST-VID", f);
const out = path.join(root, "public", "media");
mkdirSync(out, { recursive: true });
mkdirSync(path.join(root, "public", "fonts"), { recursive: true });

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

// [source file, output name] -- video: 30 fps, no audio, h264, yuv420p, keyframe-friendly
const videos = [
  ["Man_making_video_call_20261026154547.mp4", "kofi_call.mp4"],
  ["14685997_1080_1920_30fps.mp4", "budapest_statue.mp4"],
  ["16296368_1440_2562_30fps.mp4", "budapest_parliament.mp4"],
  ["Drone_shot_of_university_campus_20261026152253.mp4", "bmu_campus.mp4"],
  ["Generated Video October 26, 2026 - 2_49PM.mp4", "ibs_students_a.mp4"],
  ["Generated Video October 26, 2026 - 3_04PM.mp4", "ibs_group.mp4"],
];
for (const [s, o] of videos) {
  ff("-i", src(s), "-an", "-vf", "fps=30,scale='min(1440,iw)':-2:flags=lanczos", "-c:v", "libx264",
     "-preset", "medium", "-crf", "17", "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(out, o));
}

// stills -> jpg/png (Chromium-safe), original resolution kept
const stills = [
  ["Sunny Campus Video Call Wave.png", "ama_wave.jpg"],
  ["brive-ibs-international-business-school-budapest-6.jpg", "ibs_students.jpg"],
  ["20140919_134440_bmEhMUO.2e16d0ba.fill-1200x628.jpg", "ibs_building.jpg"],
  ["images.jpg", "bmu_facade.jpg"],
  ["east-legon.jpg", "east_legon.jpg"],
  ["images (1).jpg", "bmu_garden.jpg"],
  ["164735_LandinPage3.jpg_1900x1000.avif", "campus_crowd.jpg"],
];
for (const [s, o] of stills) ff("-i", src(s), "-q:v", "2", path.join(out, o));

// Kofi avatar for the call UI: a frame of the real clip
ff("-ss", "1.2", "-i", path.join(out, "kofi_call.mp4"), "-frames:v", "1", "-q:v", "2", path.join(out, "kofi_avatar.jpg"));

// Music bed (review track — licence unverified, see ASSET_MANIFEST.md)
ff("-i", path.join(root, "audio", "(Audio) Upbeat Background Music For Videos (No Copyright).m4a"), "-c:a", "aac", "-b:a", "192k", path.join(out, "music_bed.m4a"));

copyFileSync(path.join(root, "Logo.svg"), path.join(root, "public", "logo.svg"));
for (const w of [500, 700, 800, 900]) {
  const f = `montserrat-latin-${w}-normal.woff2`;
  const p = path.join(root, "node_modules/@fontsource/montserrat/files", f);
  if (existsSync(p)) copyFileSync(p, path.join(root, "public", "fonts", f));
}
const wd = path.join(root, "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2");
if (existsSync(wd)) copyFileSync(wd, path.join(root, "public", "fonts", "archivo-latin-wdth-normal.woff2"));
console.log("media ready");
