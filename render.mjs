// Renders the spin wheel template to a 1080x1920 MP4.
// Usage:
//   node render.mjs [config.json] [--preset "Rainbow palette"] [--out wheel.mp4]
//                   [--fps 30] [--hold-start 1] [--hold-end 2.5] [--winner "Label"]
// fps / holds default to the "Video export" settings stored in the config.
// config.json = the file produced by "Export JSON" in the settings panel (E).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const flagValues = new Set(args.flatMap((a, i) => (a.startsWith('--') ? [i, i + 1] : [])));
const configFile = args.find((a, i) => !flagValues.has(i));

const preset = opt('preset');
const out = opt('out', configFile ? path.basename(configFile, '.json') + '.mp4' : (preset || 'wheel').replace(/\W+/g, '-').toLowerCase() + '.mp4');

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(dir, 'index.html')).href + '?render=1';
const config = configFile ? JSON.parse(readFileSync(configFile, 'utf8')) : null;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });

// Virtual clock so every frame is exact regardless of capture speed.
await page.addInitScript(({ config, preset }) => {
  if (config) window.__WHEEL_CONFIG = config;
  if (preset) window.__WHEEL_PRESET = preset;
  let vt = 0, id = 0;
  const cbs = new Map();
  Object.defineProperty(performance, 'now', { value: () => vt });
  window.requestAnimationFrame = cb => { cbs.set(++id, cb); return id; };
  window.cancelAnimationFrame = i => cbs.delete(i);
  window.__advance = ms => { vt += ms; const list = [...cbs.values()]; cbs.clear(); list.forEach(cb => cb(vt)); };
}, { config, preset });

await page.goto(url);
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.evaluate(() => { resetWheel(); draw(); });
const forced = opt('winner');
if (forced) await page.evaluate(w => { cfg.result.mode = 'fixed'; cfg.result.fixedLabel = w; }, forced);
const ex = await page.evaluate(() => ({ spin: Math.max(0.2, +cfg.spin.duration), ...cfg.export }));
const spinSeconds = ex.spin;
const fps = +opt('fps', ex.fps || 30);
const holdStart = +opt('hold-start', ex.holdStart ?? 1);
const holdEnd = Math.max(0.6, +opt('hold-end', ex.holdEnd ?? 2.5));

const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));

const frameMs = 1000 / fps;
const total = Math.round((holdStart + spinSeconds + holdEnd) * fps);
const spinAt = Math.round(holdStart * fps);
for (let f = 0; f < total; f++) {
  if (f === spinAt) await page.evaluate(() => spin());
  if (f > 0) await page.evaluate(ms => window.__advance(ms), frameMs);
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % fps === 0) process.stdout.write(`\r${Math.round((f / total) * 100)}%`);
}
const winner = await page.evaluate(() => segs[winnerIndex]?.label);
ff.stdin.end();
await done;
await browser.close();
console.log(`\rDone: ${out} (${(total / fps).toFixed(1)}s, winner: ${winner})`);
