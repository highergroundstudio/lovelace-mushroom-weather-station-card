#!/usr/bin/env node
/**
 * Regenerate README screenshots and the demo GIF from demo/index.html.
 *
 *   npm run build
 *   node scripts/screenshots.mjs        # needs `playwright` (with Chromium) and ffmpeg for the GIF
 *
 * Writes images/*.png and images/graph-popup.gif.
 */
import { createServer } from "node:http";
import { readFile, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "images");
const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Install Playwright first: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".map": "application/json" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = join(root, path.endsWith("/") ? `${path}index.html` : path);
  // Directory boundary, not a string prefix: /repo-private must not pass for /repo.
  if (file !== root && !file.startsWith(root + sep)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/demo/`;

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

async function page(query, viewport = { width: 1280, height: 900 }) {
  const p = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await p.goto(`${base}?${query}`);
  await p.waitForTimeout(1500);
  return p;
}
const card = (p, id) => p.locator(`#${id} mushroom-weather-station-card`);

// Full layout, dark.
let p = await page("lang=en&units=imperial&theme=dark");
await card(p, "full").screenshot({ path: join(out, "layout-full.png") });
await card(p, "compact").screenshot({ path: join(out, "layout-compact.png") });
await card(p, "chips").screenshot({ path: join(out, "layout-chips.png") });
await p.close();

// Translations + metric + light theme.
p = await page("lang=de&units=metric&theme=light");
await card(p, "compact").screenshot({ path: join(out, "layout-compact-de-light.png") });
await p.close();

// Graph popup frames → GIF.
p = await page("lang=en&units=imperial&theme=dark", { width: 760, height: 620 });
const frames = join(out, ".frames");
await rm(frames, { recursive: true, force: true });
await mkdir(frames, { recursive: true });
let n = 0;
const snap = async (repeat = 1) => {
  for (let i = 0; i < repeat; i++) await p.screenshot({ path: join(frames, `f${String(n++).padStart(3, "0")}.png`) });
};
await p.evaluate(() => window.scrollTo(0, 120));
await snap(3);
await card(p, "full").locator('.tile[data-key="temperature"]').click();
await p.waitForTimeout(500);
await snap(2);
const chart = card(p, "full").locator(".graph-chart");
let box = await chart.boundingBox();
for (let i = 1; i <= 8; i++) {
  await p.mouse.move(box.x + (box.width * i) / 9, box.y + box.height / 2);
  await snap();
}
await p.screenshot({ path: join(out, "graph-popup.png") });
for (const range of ["7d", "30d"]) {
  await card(p, "full").locator(`.graph-range[data-range="${range}"]`).click();
  await p.waitForTimeout(500);
  box = await chart.boundingBox();
  await snap(2);
  for (let i = 1; i <= 6; i++) {
    await p.mouse.move(box.x + (box.width * i) / 7, box.y + box.height / 2);
    await snap();
  }
}
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
await snap(3);
await p.close();
await browser.close();
server.close();

try {
  const filter = "fps=4,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer";
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "4", "-i", join(frames, "f%03d.png"), "-vf", filter, join(out, "graph-popup.gif")]);
  console.log("Wrote images/graph-popup.gif");
} catch {
  console.warn("ffmpeg not found — skipped the GIF.");
}
await rm(frames, { recursive: true, force: true });
console.log("Screenshots written to images/");
