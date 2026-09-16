/* measure-hero-contrast.js — measure the REAL contrast of the hero text against the
   pixels actually behind it.

   The hero text sits over a video with a semi-transparent overlay on top, so the
   background is whatever the frame happens to be at that moment. You cannot read that
   off the CSS: the only honest way is to render the page, find where each text element
   is, and sample the pixels underneath it.

   Method: hide the text, screenshot, then sample every pixel inside each text element's
   box and compute the contrast of the text colour against the WORST (lightest for dark
   text, darkest for light text) pixel found there. Reporting the average would hide
   exactly the spot where the text becomes unreadable.

   Usage: node _build/us/measure-hero-contrast.js [--width 390] [--height 844]
*/
'use strict';
const path = require('path');
const fs = require('fs');
const { serve, launchChrome, openPage, sleep } = require('../headless.js');

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const ROOT = opt('root', path.resolve(__dirname, '..', '..'));
const TMP = process.env.TEMP || process.env.TMP || '.';

const SELECTORS = ['.hero .eyebrow', '.hero h1 .ln:nth-child(1) span', '.hero h1 .h1-kw',
  '.hero .sub', '.hero .actions .btn', '.scroll-cue', '.hero-meta'];

const srgb = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => { const l1 = Math.max(a, b), l2 = Math.min(a, b); return (l1 + 0.05) / (l2 + 0.05); };
const parseColor = s => { const m = s.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).map(Number) : [255, 255, 255]; };

(async () => {
  const server = await serve(ROOT);
  const chrome = await launchChrome();
  const viewports = [['desktop', 1440, 900, false], ['mobile', 390, 844, true]];
  let worst = null;
  const rows = [];

  try {
    for (const [name, w, h, mobile] of viewports) {
      const page = await openPage(chrome, server.base + '/index.html', { width: w, height: h, mobile, scale: 1, reducedMotion: true });
      await sleep(1800);
      await page.evaluate('document.querySelectorAll(".reveal-up").forEach(function(e){e.classList.add("in")});"ok"');

      const info = JSON.parse(await page.evaluate(`JSON.stringify(${JSON.stringify(SELECTORS)}.map(function(sel){
        var el=document.querySelector(sel); if(!el) return null;
        var r=el.getBoundingClientRect();
        if(r.width<2||r.height<2||r.top>window.innerHeight||r.bottom<0) return null;
        var cs=getComputedStyle(el);
        return {sel:sel, color:cs.color, x:Math.round(r.left), y:Math.round(Math.max(r.top,0)),
                w:Math.round(r.width), h:Math.round(Math.min(r.bottom,window.innerHeight)-Math.max(r.top,0))};
      }))`));

      /* hide the text so the sampled pixels are purely what sits behind it */
      await page.evaluate(`${JSON.stringify(SELECTORS)}.forEach(function(s){var e=document.querySelector(s);if(e)e.style.visibility="hidden";});"ok"`);
      await sleep(250);
      const shot = path.join(TMP, `hero-bg-${name}.png`);
      await page.screenshot(shot, false);
      await page.close();

      const png = fs.readFileSync(shot);
      const pixels = await decodePng(png);

      for (const t of info) {
        if (!t) continue;
        const [tr, tg, tb] = parseColor(t.color);
        const tl = lum(tr, tg, tb);
        let worstHere = Infinity, worstPx = null;
        for (let y = t.y; y < t.y + t.h; y += 2) {
          for (let x = t.x; x < t.x + t.w; x += 2) {
            const p = pixels.at(x, y);
            if (!p) continue;
            const r = ratio(tl, lum(p[0], p[1], p[2]));
            if (r < worstHere) { worstHere = r; worstPx = p; }
          }
        }
        if (worstHere === Infinity) continue;
        const big = /h1|eyebrow/.test(t.sel);
        const floor = big ? 3.0 : 4.5;
        const pass = worstHere >= floor;
        rows.push({ name, sel: t.sel, ratio: worstHere, floor, pass });
        if (!worst || worstHere < worst.ratio) worst = { name, sel: t.sel, ratio: worstHere, floor };
        console.log(`${pass ? 'ok  ' : 'FAIL'} ${name.padEnd(8)} ${t.sel.padEnd(34)} worst ${worstHere.toFixed(2)}:1  (floor ${floor})  bg rgb(${worstPx.join(',')})`);
      }
    }
  } finally { chrome.close(); server.close(); }

  const fails = rows.filter(r => !r.pass);
  console.log(`\n${rows.length} text element(s) measured across 2 viewports`);
  if (fails.length) {
    console.error(`${fails.length} below the WCAG AA floor:`);
    fails.forEach(f => console.error(`  ${f.name} ${f.sel}: ${f.ratio.toFixed(2)}:1 needs ${f.floor}`));
    process.exit(1);
  }
  console.log(`worst overall: ${worst.sel} at ${worst.ratio.toFixed(2)}:1 on ${worst.name}`);
  console.log('hero text passes WCAG AA against the actual rendered background.');
})().catch(e => { console.error(e); process.exit(2); });

/* minimal PNG decoder (RGBA, 8-bit, non-interlaced — what Chrome emits) */
async function decodePng(buf) {
  const zlib = require('zlib');
  let pos = 8, width = 0, height = 0, depth = 8, colorType = 6, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8); height = buf.readUInt32BE(pos + 12);
      depth = buf[pos + 16]; colorType = buf[pos + 17]; interlace = buf[pos + 20];
    }
    else if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
    else if (type === 'IEND') break;
    pos += len + 12;
  }
  /* Assuming RGBA produced nonsense: the sampler reported orange and pink pixels in a
     grey studio hero, because a mis-sized stride walks diagonally through the image. */
  const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  if (depth !== 8 || interlace !== 0 || !CHANNELS[colorType]) {
    throw new Error(`unsupported PNG: depth=${depth} colorType=${colorType} interlace=${interlace}`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = CHANNELS[colorType], stride = width * bpp;
  if (raw.length !== height * (stride + 1)) {
    throw new Error(`PNG size mismatch: got ${raw.length}, expected ${height * (stride + 1)} (${width}x${height}, ${bpp} channels)`);
  }
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const line = raw.slice(rp, rp + stride); rp += stride;
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.slice(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[i] = v & 0xff;
    }
  }
  return { width: width, height: height, at(x, y) { if (x < 0 || y < 0 || x >= width || y >= height) return null; const o = y * stride + x * bpp; return bpp >= 3 ? [out[o], out[o + 1], out[o + 2]] : [out[o], out[o], out[o]]; } };
}
