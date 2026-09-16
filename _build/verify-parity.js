/* verify-parity.js — text parity between the Barcelona source and the Miami port, page by page, in BOTH
   languages: every visible text node / alt / aria-label / title / meta description is extracted from the live
   DOM (same rules as the i18n engine) of the source site (Barcelona, base ES) and of the Miami site, each
   rendered with the same language selected. The two sequences are diffed; every difference must be an
   intended change of the port (NAP, geography, prices, trust signals, blog, alt text). Everything else is a
   regression. Output: console summary + _build/reports/parity-<lang>.json with the diffs per page.
   Usage: node _build/verify-parity.js --src "<Barcelona root>" [--lang en|es|both] [--pages a,b] [--out dir]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { serve, launchChrome, openPage, I18N_READY, sleep } = require('./headless');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const SRC = opt('src'); if (!SRC) { console.error('usage: node verify-parity.js --src <barcelonaRoot> [--lang both] [--pages ...] [--out dir]'); process.exit(2); }
const LANGS = opt('lang', 'both') === 'both' ? ['en', 'es'] : [opt('lang')];
const OUT = opt('out', path.join(__dirname, 'reports'));
/* page pairs: Miami page -> source page (blog slugs differ) */
const SLUGS = { 'how-much-does-ppf-cost': 'cuanto-cuesta-ppf-coche', 'how-much-does-a-car-wrap-cost': 'cuanto-cuesta-vinilar-un-coche', 'ppf-vs-ceramic-coating': 'ppf-o-ceramico-que-elegir', 'car-upholstery-cleaning-cost': 'limpieza-tapiceria-coche-precio' };
const STATIC = ['index.html', 'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html', 'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html', 'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html', 'blog/index.html'];
const blog = fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => f.replace(/\.html$/, ''));
const PAIRS = STATIC.map(p => [p, p]).concat(blog.map(s => ['blog/' + s + '.html', 'blog/' + (SLUGS[s] || s) + '.html']));
const ONLY = opt('pages', '') ? opt('pages').split(',') : null;

const WALKER = `(function(){
  function affix(raw){var c=raw.replace(/^\\s+|\\s+$/g,"");if(c.length>1){var f=c.charAt(0),l=c.charAt(c.length-1);if((f==="\\u201C"||f==='"')&&(l==="\\u201D"||l==='"'))c=c.slice(1,-1);}return c;}
  var out=[];var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);var n;
  while((n=tw.nextNode())){var raw=n.nodeValue;if(!raw||!raw.trim())continue;var p=n.parentNode;var tag=p.nodeName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA")continue;
    var el=p;var hidden=false;while(el&&el.nodeType===1){if(el.hidden||el.classList.contains("srs-lang")){hidden=true;break;}el=el.parentNode;}
    if(hidden)continue;var c=affix(raw);if(c)out.push(c);}
  var els=document.querySelectorAll("[alt],[aria-label],[title]");for(var i=0;i<els.length;i++){["alt","aria-label","title"].forEach(function(a){var v=els[i].getAttribute(a);if(v&&v.trim())out.push(a+"="+affix(v));});}
  out.push("title="+affix(document.title));var md=document.querySelector('meta[name="description"]');if(md)out.push("description="+affix(md.getAttribute("content")||""));
  return out;})()`;

/* LCS-based diff of two string arrays -> [{op:'-'|'+', text}] */
function diff(a, b) {
  const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ op: '-', text: a[i++] }); else out.push({ op: '+', text: b[j++] }); }
  while (i < n) out.push({ op: '-', text: a[i++] }); while (j < m) out.push({ op: '+', text: b[j++] });
  return out;
}

(async () => {
  const srcServer = await serve(SRC), miaServer = await serve(ROOT);
  const chrome = await launchChrome();
  fs.mkdirSync(OUT, { recursive: true });
  let total = 0;
  try {
    for (const lang of LANGS) {
      const report = {}; const table = {};
      for (const [mia, src] of PAIRS) {
        if (ONLY && !ONLY.includes(mia)) continue;
        const grab = async (base, rel) => { const p = await openPage(chrome, base + '/' + rel, { lang, width: 1440, height: 900, reducedMotion: true }); await p.waitFor(I18N_READY); await sleep(500); const t = await p.evaluate(WALKER); await p.close(); return t; };
        const a = await grab(srcServer.base, src), b = await grab(miaServer.base, mia);
        const d = diff(a, b);
        report[mia] = { source: src, removed: d.filter(x => x.op === '-').map(x => x.text), added: d.filter(x => x.op === '+').map(x => x.text) };
        table[mia] = { same: a.length - report[mia].removed.length, removed: report[mia].removed.length, added: report[mia].added.length };
        total += d.length;
      }
      console.log('\n=== parity lang=' + lang + ' (Barcelona source vs Miami) ===');
      console.table(table);
      const file = path.join(OUT, 'parity-' + lang + '.json'); fs.writeFileSync(file, JSON.stringify(report, null, 1));
      console.log('diffs written to', file);
    }
  } finally { chrome.close(); srcServer.close(); miaServer.close(); }
  console.log('total differing strings:', total);
})().catch(e => { console.error(e); process.exit(2); });
