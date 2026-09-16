/* 85-render-snapshots.js — re-bake the static (no-JS / crawler) snapshot of the JS-rendered pricing UI in
   pages/prices.html: #svcTabs, #svcIntro, #tierGrid, #cmpName, #cmpTable. The Barcelona file shipped a pasted
   innerHTML dump in Spanish + EUR; this renders the page headless in English with reduced motion (final prices,
   no count-up) and writes the real innerHTML back, so what crawlers read equals what the JS renders.
   Usage: node 85-render-snapshots.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile } = require('./lib');
const { serve, launchChrome, openPage, I18N_READY, sleep } = require('../headless');

const root = process.argv[2];
if (!root) { console.error('usage: node 85-render-snapshots.js <siteRoot>'); process.exit(2); }
const IDS = ['svcTabs', 'svcIntro', 'tierGrid', 'cmpName', 'cmpTable'];

(async () => {
  const server = await serve(root);
  const chrome = await launchChrome();
  try {
    const page = await openPage(chrome, server.base + '/pages/prices.html', { lang: 'en', width: 1440, height: 900, reducedMotion: true });
    if (!await page.waitFor(I18N_READY)) throw new Error('i18n layer did not initialise');
    await sleep(600);
    const snap = await page.evaluate(`(function(){var o={};${JSON.stringify(IDS)}.forEach(function(id){var el=document.getElementById(id);o[id]=el?el.innerHTML:null;});return o;})()`);
    await page.close();
    for (const id of IDS) if (snap[id] == null) throw new Error('#' + id + ' not found in the rendered page');
    editFile(path.join(root, 'pages', 'prices.html'), (src, api) => {
      for (const id of IDS) {
        const re = new RegExp('(<[a-z0-9]+ [^>]*\\bid="' + id + '"[^>]*>)([\\s\\S]*?)(<\\/(?:div|span|table|h3)>)', '');
        const m = src.match(re); if (!m) throw new Error('snapshot container #' + id + ' not found in source');
        api.once(m[0], m[1] + snap[id].replace(/\r?\n/g, '') + m[3], '#' + id);
      }
    });
    console.log('prices.html: static snapshot re-baked in English (' + IDS.join(', ') + ')');
  } finally { chrome.close(); server.close(); }
})().catch(e => { console.error(e.message || e); process.exit(1); });
