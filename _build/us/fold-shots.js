/* fold-shots.js — capture ONLY the first viewport of each page.

   Why this exists alongside screenshots.js: a full-page capture resizes the viewport to
   the document height, so a hero sized with 100dvh expands to the FULL PAGE HEIGHT in the
   image. On the home page that made the H1 look like it sat 3,400px down when a real
   1440x900 browser puts it at 376px, comfortably above the fold. Full-page shots are right
   for auditing whole-page layout; they are actively misleading about what a visitor sees
   first. This captures the fold honestly.

   Usage: node _build/us/fold-shots.js --root "<ABSOLUTE root>" --out <dir> [--pages a,b]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { serve, launchChrome, openPage, sleep } = require('../headless.js');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(opt('root', path.resolve(__dirname, '..', '..')));
const OUT = opt('out');
if (!OUT) { console.error('usage: node fold-shots.js --root <abs> --out <dir> [--pages a,b]'); process.exit(2); }

const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const found = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) found.push(path.relative(ROOT, p).split(path.sep).join('/'));
  }
})(ROOT);
found.sort();
const PAGES = opt('pages', '') ? opt('pages').split(',') : found;

const VIEWPORTS = { desktop: { width: 1440, height: 900, mobile: false, scale: 1 }, mobile: { width: 390, height: 844, mobile: true, scale: 2 } };

(async () => {
  const server = await serve(ROOT);
  const chrome = await launchChrome();
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  try {
    for (const rel of PAGES) {
      for (const vp of Object.keys(VIEWPORTS)) {
        const v = VIEWPORTS[vp];
        const page = await openPage(chrome, server.base + '/' + rel, { ...v, reducedMotion: true });
        await sleep(1200);
        await page.evaluate('document.querySelectorAll(".reveal-up,[data-reveal]").forEach(function(e){e.classList.add("in")});"ok"');
        await sleep(250);
        const m = await page.evaluate('(function(){var h1=document.querySelector("h1");var r=h1?h1.getBoundingClientRect():null;return {h1Top:r?Math.round(r.top):null,h1Vis:r?(r.top>=0&&r.top<window.innerHeight):false,sw:document.documentElement.scrollWidth,vw:window.innerWidth};})()');
        const slug = rel.replace(/\.html$/, '').replace(/[\/]/g, '_');
        const file = path.join(OUT, `fold-${vp}-${slug}.png`);
        await page.screenshot(file, false);      // false = viewport only, not full page
        await page.close();
        rows.push({ page: rel, vp, ...m });
        console.log(`${m.h1Vis ? 'ok  ' : 'H1!!'} ${vp.padEnd(7)} ${rel.padEnd(42)} h1Top=${String(m.h1Top).padStart(5)} hscroll=${m.sw > m.vw ? m.sw + '>' + m.vw : 'none'}`);
      }
    }
  } finally { chrome.close(); server.close(); }
  const bad = rows.filter(r => !r.h1Vis || r.sw > r.vw);
  fs.writeFileSync(path.join(OUT, 'fold-report.json'), JSON.stringify(rows, null, 1));
  if (bad.length) {
    console.error(`\n${bad.length} viewport(s) where the H1 is not visible on load, or the page scrolls sideways:`);
    bad.forEach(b => console.error(`  ${b.vp} ${b.page} h1Top=${b.h1Top} scrollWidth=${b.sw} vw=${b.vw}`));
    process.exit(1);
  }
  console.log(`\nall ${rows.length} folds: H1 visible on load, no horizontal scroll.`);
})().catch(e => { console.error(e); process.exit(2); });
