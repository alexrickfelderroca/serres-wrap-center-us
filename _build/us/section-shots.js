/* section-shots.js — screenshot ONE named block of a page, clipped to its own box.

   Why this exists alongside screenshots.js and fold-shots.js:
     screenshots.js  full page  — right for whole-page layout, but a 15,000px tall PNG is
                                  unreadable once it is scaled down to be looked at.
     fold-shots.js   first fold — right for "what does a visitor see first".
     section-shots.js one block — right for "did THIS block change the way I said it did",
                                  which is what a two-pass comparison of a removal needs.

   The clip is the element's own bounding box plus padding, captured beyond the viewport,
   so the image is legible at 1:1 and the two passes line up.

   Usage:
     node _build/us/section-shots.js --root "<ABSOLUTE root>" --out <dir> --pass 1|2 \
          --shots "index.html#services,index.html#packages,detailing/index.html#paint-correction"
     A shot is "<page>#<id>" or "<page>@<css selector>" or "<page>~<data-screen-label>".
   Exit code is non-zero if a selector matched nothing — a missing block must fail the run,
   not silently produce one fewer PNG than the report claims.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { serve, launchChrome, openPage, sleep } = require('../headless.js');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(opt('root', path.resolve(__dirname, '..', '..')));
const OUT = opt('out');
const PASS = opt('pass', '2');
const PAD = parseInt(opt('pad', '24'), 10);
const SHOTS = (opt('shots', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false, scale: 1 },
  mobile: { width: 390, height: 844, mobile: true, scale: 2 },
};
const VP = opt('viewport', 'both') === 'both' ? ['desktop', 'mobile'] : [opt('viewport')];
if (!OUT || !SHOTS.length) {
  console.error('usage: node section-shots.js --root <abs> --out <dir> --pass 1|2 --shots "page#id,page@sel"');
  process.exit(2);
}

const stamp = process.env.SHOT_STAMP || new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');

function parseShot(s) {
  for (const [sep, kind] of [['#', 'id'], ['@', 'css'], ['~', 'label']]) {
    const i = s.indexOf(sep);
    if (i > 0) return { page: s.slice(0, i), kind, key: s.slice(i + 1) };
  }
  return null;
}

function selectorFor(shot) {
  if (shot.kind === 'id') return '#' + shot.key;
  if (shot.kind === 'label') return `[data-screen-label="${shot.key}"]`;
  return shot.key;
}

(async () => {
  const server = await serve(ROOT);
  const chrome = await launchChrome();
  fs.mkdirSync(OUT, { recursive: true });
  const missing = [];
  const made = [];
  try {
    for (const raw of SHOTS) {
      const shot = parseShot(raw);
      if (!shot) { missing.push(`${raw} (unparseable)`); continue; }
      const sel = selectorFor(shot);
      for (const vpName of VP) {
        const v = VIEWPORTS[vpName];
        const page = await openPage(chrome, server.base + '/' + shot.page, {
          lang: 'en', width: v.width, height: v.height, mobile: v.mobile, scale: v.scale,
          reducedMotion: true,
          init: 'document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("video").forEach(function(x){try{x.pause();x.currentTime=0;}catch(e){}});});',
        });
        await sleep(700);
        await page.evaluate('document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager";});"ok"');
        await page.evaluate('(async function(){var h=document.documentElement.scrollHeight;for(var y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(function(r){setTimeout(r,60)});}window.scrollTo(0,0);})()');
        await page.evaluate('Promise.all(Array.from(document.images).filter(function(i){return !i.complete}).map(function(i){return new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,4000)})})).then(function(){return "ok"})');
        await page.evaluate('document.querySelectorAll(".reveal-up,[data-reveal]").forEach(function(e){e.classList.add("in")});window.scrollTo(0,0);"ok"');
        await sleep(250);

        const exists = await page.evaluate(`!!document.querySelector(${JSON.stringify(sel)})`);
        if (!exists) { missing.push(`${raw} [${vpName}] — selector ${sel} matched nothing`); await page.close(); continue; }

        /* Resize to the full document height FIRST, then measure. Measuring before the
           resize is the trap fold-shots.js documents: a 100dvh hero grows to the whole
           document height under the tall viewport, so every offset taken beforehand points
           at the wrong place and the clip lands somewhere else entirely. */
        const preH = await page.evaluate('document.documentElement.scrollHeight');
        await page.send('Emulation.setDeviceMetricsOverride', { width: v.width, height: Math.min(preH, 30000), deviceScaleFactor: v.scale, mobile: v.mobile });
        await sleep(400);
        await page.evaluate('document.querySelectorAll(".reveal-up,[data-reveal]").forEach(function(e){e.classList.add("in")});window.scrollTo(0,0);"ok"');

        const box = await page.evaluate(
          `(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;` +
          `var r=e.getBoundingClientRect();return {x:r.left+window.scrollX,y:r.top+window.scrollY,w:r.width,h:r.height};})()`);
        if (!box) { missing.push(`${raw} [${vpName}] — selector ${sel} vanished after resize`); await page.close(); continue; }

        const full = await page.evaluate('({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight})');
        const clip = {
          x: Math.max(0, box.x - PAD),
          y: Math.max(0, box.y - PAD),
          width: Math.min(full.w, box.w + PAD * 2),
          height: Math.min(full.h, box.h + PAD * 2),
          scale: 1,
        };
        const r = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
        const slug = raw.replace(/\.html/g, '').replace(/[\/#@~]/g, '-');
        const file = path.join(OUT, `pass-${PASS}-${vpName}-${slug}-${stamp}.png`);
        fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
        made.push(`${vpName.padEnd(7)} ${raw.padEnd(48)} ${Math.round(box.w)}x${Math.round(box.h)} -> ${path.basename(file)}`);
        await page.close();
      }
    }
  } finally {
    await chrome.close(); server.close();
  }
  made.forEach(m => console.log('ok   ' + m));
  if (missing.length) {
    console.error('\nFAIL — selector matched nothing:');
    missing.forEach(m => console.error('  ' + m));
    process.exit(1);
  }
  console.log(`\n${made.length} section shot(s) written to ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
