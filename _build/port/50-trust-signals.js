/* 50-trust-signals.js — Step 5: strip trust signals that belong to the Barcelona Google listing.
   Same brand, different branch: Miami starts with 0 reviews, so nothing below may be inherited.
     · AggregateRating 4.9 / 50 in JSON-LD  (why-serres, body-kits, paint-correction)
     · why-serres hero stats "50+ Cars Transformed" / "4.9 Average Rating" -> claims already used elsewhere on the site
     · why-serres reviews section: hidden (TODO) — TESTIMONIALS[] emptied, pre-rendered cards + 4.9/50+/98% stats removed
   Usage: node 50-trust-signals.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, addEntries } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 50-trust-signals.js <siteRoot>'); process.exit(2); }
const P = rel => path.join(root, rel);

/* 1. JSON-LD aggregateRating blocks — exactly one per file, removed together with the comma before it */
for (const rel of ['pages/why-serres.html', 'services/body-kits.html', 'services/paint-correction.html']) {
  editFile(P(rel), (src, api) => {
    api.re(/,\s*"aggregateRating":\s*\{[^}]*\}/, '', 'aggregateRating block');
  });
  console.log('aggregateRating removed:', rel);
}

/* 2. why-serres.html */
const { loadDict: loadDict0, editFile: editFile0 } = require('./lib');
const whySrc = fs.readFileSync(P('pages/why-serres.html'), 'utf8').replace(/\r\n/g, '\n');
const tMatch = whySrc.match(/  const TESTIMONIALS=(\[\n[\s\S]*?\n  \]);\n/);
if (!tMatch) throw new Error('TESTIMONIALS array not found');
const testimonials = new Function('return (' + tMatch[1] + ')')();
editFile(P('pages/why-serres.html'), (src, api) => {
  // hero stats: replace the two Barcelona-listing numbers with claims the brand already makes on its own pages
  api.once(
    '        <div class="hstat"><b class="chrome-text">50+</b><span>Cars Transformed</span></div>\n' +
    '        <div class="hstat"><b class="chrome-text">4.9</b><span>Average Rating</span></div>\n' +
    '        <div class="hstat"><b class="chrome-text">1</b><span>Workshop</span></div>',
    '        <div class="hstat"><b class="chrome-text">1</b><span>Standard</span></div>\n' +
    '        <div class="hstat"><b class="chrome-text">100%</b><span>Hand Finished</span></div>\n' +
    '        <div class="hstat"><b class="chrome-text">0</b><span>Cut Corners</span></div>', 'hero stats');
  // reviews section: keep markup, hide it, drop the Barcelona stats and the pre-rendered cards
  api.once(
    '<!-- ===================== REVIEWS (sticky stacking) ===================== -->\n' +
    '<section class="reviews" data-screen-label="Why SERRES — Reviews">',
    '<!-- ===================== REVIEWS (sticky stacking) ===================== -->\n' +
    '<!-- TODO(Miami): section hidden until the Miami branch has its OWN Google reviews. The parent studio\'s\n' +
    '     testimonials, rating and review count must never be reused here. To enable: remove the\n' +
    '     `hidden` attribute below and fill TESTIMONIALS[] (script at the end of the page) with real reviews. -->\n' +
    '<section class="reviews" data-screen-label="Why SERRES — Reviews" hidden>', 'reviews section');
  api.re(/        <div class="rv-stats">\n(?:          <div class="rv-stat">.*\n){3}        <\/div>\n/, '', 'rv-stats block');
  api.re(/(<div class="rv-stack" id="rvStack" data-i18n-skip>).*?<\/article><\/div>/, '$1</div>', 'pre-rendered review cards');
  api.re(/  const TESTIMONIALS=\[\n[\s\S]*?\n  \];\n/,
    '  /* TODO(Miami): fill with REAL Miami reviews only — {name, role, rating, svc, quote} — never the parent studio\'s. */\n' +
    '  const TESTIMONIALS=[];\n', 'TESTIMONIALS array');
});
console.log('why-serres: hero stats swapped, reviews section hidden, TESTIMONIALS emptied');

/* 2b. the Barcelona reviews' dictionary entries (role lines + quotes) go with them; service tags stay (used elsewhere) */
{
  const d = loadDict0(root);
  const doomed = [];
  for (const t of testimonials) for (const s of [t.role, t.quote]) if (s && Object.prototype.hasOwnProperty.call(d, s)) doomed.push(s);
  const extra = ['BMW M2 · Owner']; // dead key left behind by an earlier review edit
  for (const k of extra) if (Object.prototype.hasOwnProperty.call(d, k)) doomed.push(k);
  if (doomed.length) editFile0(path.join(root, 'assets', 'serres-i18n.js'), (src, api) => {
    // entries may be single-line ("key": "value",) or split ("key":\n      "value",)
    for (const k of doomed) api.re(new RegExp('\\n    ' + JSON.stringify(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\s*"(?:[^"\\\\]|\\\\.)*",'), '', 'testimonial key ' + k.slice(0, 30));
  });
  console.log(`dictionary: ${doomed.length} Barcelona testimonial entries removed`);
}

/* 3. dictionary entries for the new hero stat labels ("Hand Finished" / "Cut Corners" already exist) */
addEntries(root, 'Miami port — why-serres hero stats', [
  { en: 'Standard', es: 'Estándar' },
]);
console.log('dictionary: hero stat labels ensured');

/* 4. rating / recommendation claims inside dictionary copy (FAQ answers) — Barcelona listing stats */
const { renameEntries, loadDict, pages } = require('./lib');
const dict = loadDict(root);
const RATING = /4[.,]9|98 ?%/;
const rated = Object.keys(dict).filter(k => RATING.test(k) || RATING.test(dict[k]));
if (rated.length) {
  // drop every sentence that carries the Barcelona-listing figure, then close with a neutral sentence
  const SENT = /\s*[^.]*(?:4[.,]9|98 ?%)[^.]*\.(?=\s|$)/g;
  const strip = (s, tail) => { const out = s.replace(SENT, ''); if (out === s) return s; if (!out.trim()) throw new Error('rating sentence was the whole string: ' + s.slice(0, 80)); return out.trim() + ' ' + tail; };
  renameEntries(root, pages(root), rated.map(k => ({ en: k,
    newEn: strip(k, 'That is why our clients recommend us.'),
    newEs: strip(dict[k], 'Por eso nuestros clientes nos recomiendan.') })));
  const left = Object.keys(loadDict(root)).filter(k => /4[.,]9|98 ?%/.test(k) || /4[.,]9|98 ?%/.test(loadDict(root)[k]));
  if (left.length) { console.error('rating claims still in the dictionary:\n  ' + left.map(k => k.slice(0, 120)).join('\n  ')); process.exit(1); }
  console.log(`dictionary: ${rated.length} entries with 4.9 / 98% claims rewritten`);
}
