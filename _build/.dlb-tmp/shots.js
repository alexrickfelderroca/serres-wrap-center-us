/* temp: viewport-sized frames of ppf-delray-beach at both verification viewports */
'use strict';
const path = require('path');
const fs = require('fs');
const { serve, launchChrome, openPage, sleep } = require(path.resolve('_build/headless.js'));
const OUT = process.argv[2] || '.screenshots/page-ppf-delray-beach';
const TAG = process.argv[3] || 'vp';
const VPS = [
  { n: 'desktop', width: 1440, height: 900, mobile: false, scale: 1 },
  { n: 'mobile', width: 390, height: 844, mobile: true, scale: 2 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve(path.resolve('.'));
  const chrome = await launchChrome();
  try {
    for (const v of VPS) {
      const page = await openPage(chrome, server.base + '/ppf-delray-beach/index.html',
        { lang: 'en', width: v.width, height: v.height, mobile: v.mobile, scale: v.scale, reducedMotion: true });
      await sleep(900);
      await page.evaluate('document.querySelectorAll("img[loading=lazy]").forEach(i=>i.loading="eager");document.querySelectorAll(".reveal-up").forEach(e=>e.classList.add("in"));"ok"');
      await sleep(400);
      const marks = await page.evaluate(`(function(){
        const r = {};
        r.scrollW = document.documentElement.scrollWidth;
        r.clientW = document.documentElement.clientWidth;
        r.docH = document.documentElement.scrollHeight;
        r.heroH = Math.round(document.querySelector('.hero').getBoundingClientRect().height);
        r.h1 = document.querySelectorAll('h1').length;
        r.main = document.querySelectorAll('main').length;
        const over = [];
        document.querySelectorAll('main *').forEach(function(e){
          const b = e.getBoundingClientRect();
          if (b.width && (b.right > r.clientW + 1 || b.left < -1)) over.push(e.tagName + '.' + (e.className && e.className.baseVal === undefined ? String(e.className).slice(0,40) : '') + ' L' + Math.round(b.left) + ' R' + Math.round(b.right));
        });
        r.overflow = over.slice(0, 8);
        const small = [];
        document.querySelectorAll('a[href],button,summary,input,select,textarea').forEach(function(e){
          const b = e.getBoundingClientRect();
          if (!b.width || !b.height) return;
          const cs = getComputedStyle(e);
          if (cs.visibility === 'hidden' || cs.display === 'none') return;
          let h = b.height;
          const after = getComputedStyle(e, '::after');
          if (after && after.content !== 'none' && parseFloat(after.height) > h) h = parseFloat(after.height);
          if (h < 44) small.push((e.tagName + ' ' + (e.textContent||'').trim().slice(0,28) + ' h=' + Math.round(h)));
        });
        r.smallTargets = small.slice(0, 14);
        r.sections = [...document.querySelectorAll('main section')].map(function(s){
          return (s.getAttribute('data-screen-label')||s.className) + ' y=' + Math.round(s.getBoundingClientRect().top + window.scrollY) + ' h=' + Math.round(s.getBoundingClientRect().height);
        });
        return r;
      })()`);
      console.log('\n== ' + v.n + ' ==');
      console.log(JSON.stringify(marks, null, 1));
      const ys = [0];
      for (const s of ['.dlb-drive', '.dlb-road', '.dlb-prices', '.dlb-near', '.dlb-quote']) {
        const y = await page.evaluate(`Math.round(document.querySelector('${s}').getBoundingClientRect().top + window.scrollY)`);
        ys.push(y);
      }
      let i = 0;
      for (const y of ys) {
        await page.evaluate('window.scrollTo(0,' + y + ');"ok"');
        await sleep(350);
        await page.screenshot(path.join(OUT, `${TAG}-${v.n}-${String(i).padStart(2, '0')}.png`), false);
        i++;
      }
      await page.close();
    }
  } finally { chrome.close(); server.close(); }
  console.log('\ndone');
})();
