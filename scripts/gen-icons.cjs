/**
 * Renders the PWA / iOS icons from public/icon.svg.
 *   node scripts/gen-icons.cjs
 * Needs Playwright's Chromium (preinstalled in CI images and in most dev setups).
 * iOS ignores SVG and transparency for the home-screen icon, so apple-touch-icon is a full-bleed PNG.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const pub = path.join(__dirname, '..', 'public');
const svg = fs.readFileSync(path.join(pub, 'icon.svg'), 'utf8');

const targets = [
  // name, size, full-bleed (no rounded corners: iOS and maskable add their own), safe-zone padding
  ['apple-touch-icon.png', 180, true, 0],
  ['pwa-192x192.png', 192, false, 0],
  ['pwa-512x512.png', 512, false, 0],
  ['maskable-512x512.png', 512, true, 0.1],
  ['favicon-32.png', 32, false, 0],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, size, fullBleed, pad] of targets) {
    const art = fullBleed ? svg.replace(/rx="112"/g, 'rx="0"') : svg;
    const inner = Math.round(size * (1 - pad * 2));
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${fullBleed ? '#0057e0' : 'transparent'}">
         <div style="width:${inner}px;height:${inner}px">${art.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div>
       </body></html>`,
    );
    await page.screenshot({ path: path.join(pub, name), omitBackground: !fullBleed });
    console.log('wrote', name);
  }
  await browser.close();
})();
