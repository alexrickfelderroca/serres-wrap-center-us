/* screenshots.js — reproducible full-page screenshots of every page at the two verification viewports
   (desktop 1440x900, mobile 390x844), in the selected language, with reduced motion so the capture is
   deterministic (no count-up / reveal timing). Used for Pass 1 (Barcelona baseline) and Pass 2 (Miami).
   Usage: node _build/screenshots.js --root "<site root>" --out "<dir>" --pass 1|2 [--lang en|es] [--pages a,b] [--viewport desktop|mobile|both]
   Files: <out>/pass-<n>-<viewport>-<lang>-<page-slug>-<timestamp>.png (never overwritten)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { serve, launchChrome, openPage, I18N_READY, sleep } = require('./headless');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const ROOT = opt('root', path.resolve(__dirname, '..'));
const OUT = opt('out'); const PASS = opt('pass', '2'); const LANG = opt('lang', 'en');
if (!OUT) { console.error('usage: node screenshots.js --root <site> --out <dir> --pass 1|2 [--lang en|es] [--pages ...] [--viewport both]'); process.exit(2); }
const VIEWPORTS = { desktop: { width: 1440, height: 900, mobile: false }, mobile: { width: 390, height: 844, mobile: true, scale: 2 } };
const VP = opt('viewport', 'both') === 'both' ? ['desktop', 'mobile'] : [opt('viewport')];
const STATIC = ['index.html', 'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html', 'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html', 'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html', 'blog/index.html'];
const blog = fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => 'blog/' + f).sort();
const PAGES = opt('pages', '') ? opt('pages').split(',') : STATIC.concat(blog);
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');

(async () => {
  const server = await serve(ROOT); const chrome = await launchChrome();
  fs.mkdirSync(OUT, { recursive: true });
  const results = [];
  try {
    for (const rel of PAGES) for (const vp of VP) {
      const v = VIEWPORTS[vp];
      const page = await openPage(chrome, server.base + '/' + rel, { lang: LANG, width: v.width, height: v.height, mobile: v.mobile, scale: v.scale || 1, reducedMotion: true,
        init: 'document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("video").forEach(function(x){try{x.pause();x.currentTime=0;}catch(e){}});});' });
      await page.waitFor(I18N_READY); await sleep(700);
      // lazy images: make them eager and scroll through the page so everything below the fold has loaded before capture
      await page.evaluate('document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager";if(i.dataset&&i.dataset.src)i.src=i.dataset.src;});"ok"');
      await page.evaluate('(async function(){var h=document.documentElement.scrollHeight;for(var y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(function(r){setTimeout(r,60)});}window.scrollTo(0,0);})()');
      await page.evaluate('Promise.all(Array.from(document.images).filter(function(i){return !i.complete}).map(function(i){return new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,4000)})})).then(function(){return "ok"})');
      // reveal-on-scroll classes: force everything visible so full-page captures are complete and deterministic
      await page.evaluate('document.querySelectorAll(".reveal-up,[data-reveal]").forEach(function(e){e.classList.add("in")});window.scrollTo(0,0);"ok"');
      await sleep(300);
      const overflow = await page.evaluate('({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})');
      const slug = rel.replace(/\.html$/, '').replace(/[\/]/g, '_');
      const file = path.join(OUT, `pass-${PASS}-${vp}-${LANG}-${slug}-${stamp}.png`);
      await page.screenshot(file, true);
      await page.close();
      results.push({ page: rel, viewport: vp, file: path.basename(file), horizontalScroll: overflow.sw > overflow.cw ? `${overflow.sw}>${overflow.cw}` : 'none' });
      console.log(`${vp.padEnd(7)} ${rel.padEnd(42)} hscroll=${overflow.sw > overflow.cw ? overflow.sw + '>' + overflow.cw : 'none'}  -> ${path.basename(file)}`);
    }
  } finally { chrome.close(); server.close(); }
  fs.writeFileSync(path.join(OUT, `pass-${PASS}-${LANG}-${stamp}.json`), JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(2); });
