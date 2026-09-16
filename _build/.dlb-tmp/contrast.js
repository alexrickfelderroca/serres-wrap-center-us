/* temp: worst-case contrast of hero text against the photo + overlay stack.
   Method: hide the hero text, screenshot the composited background, then for each
   text box read the LIGHTEST pixel under it and compute the ratio against the
   text's own colour. Lightest pixel = worst case for light text. */
'use strict';
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { serve, launchChrome, openPage, sleep } = require(path.resolve('_build/headless.js'));
const OUT = '_build/.dlb-tmp';

function srgb(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum(r, g, b) { return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b); }
function ratio(a, b) { const L1 = Math.max(a, b), L2 = Math.min(a, b); return (L1 + 0.05) / (L2 + 0.05); }

(async () => {
  const server = await serve(path.resolve('.'));
  const chrome = await launchChrome();
  try {
    for (const v of [{ n: 'desktop', width: 1440, height: 900, mobile: false }, { n: 'mobile', width: 390, height: 844, mobile: true }]) {
      const page = await openPage(chrome, server.base + '/ppf-delray-beach/index.html',
        { lang: 'en', width: v.width, height: v.height, mobile: v.mobile, scale: 1, reducedMotion: true });
      await sleep(900);
      const boxes = await page.evaluate(`(function(){
        const sel = {eyebrow:'.hero .eyebrow', h1:'.hero h1', lead:'.hero .lead', stat:'.hero .hstat span'};
        const out = {};
        for (const k in sel){
          const e = document.querySelector(sel[k]); if(!e) continue;
          const b = e.getBoundingClientRect();
          out[k] = {x:Math.max(0,Math.round(b.left)), y:Math.max(0,Math.round(b.top)), w:Math.round(b.width), h:Math.round(b.height), color:getComputedStyle(e).color};
        }
        return out;
      })()`);
      await page.evaluate(`document.querySelectorAll('.hero .wrap, .hero .crumbs').forEach(function(e){e.style.visibility='hidden'});"ok"`);
      await sleep(300);
      const png = path.join(OUT, 'bg-' + v.n + '.png');
      await page.screenshot(png, false);
      const img = sharp(png);
      const meta = await img.metadata();
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      const sx = info.width / v.width;
      console.log('\n== ' + v.n + ' == capture ' + meta.width + 'x' + meta.height + ' scale ' + sx.toFixed(2));
      for (const k in boxes) {
        const b = boxes[k];
        const x0 = Math.round(b.x * sx), y0 = Math.round(b.y * sx);
        const x1 = Math.min(info.width, Math.round((b.x + b.w) * sx));
        const y1 = Math.min(info.height, Math.round((b.y + b.h) * sx));
        let best = -1, bestPx = null;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const i = (y * info.width + x) * info.channels;
          const L = lum(data[i], data[i + 1], data[i + 2]);
          if (L > best) { best = L; bestPx = [data[i], data[i + 1], data[i + 2]]; }
        }
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(b.color);
        const tl = lum(+m[1], +m[2], +m[3]);
        console.log('  ' + k.padEnd(8) + ' text ' + b.color.padEnd(20) + ' lightest bg rgb(' + bestPx.join(',') + ')  ratio ' + ratio(tl, best).toFixed(2));
      }
      await page.close();
    }
  } finally { chrome.close(); server.close(); }
})();
