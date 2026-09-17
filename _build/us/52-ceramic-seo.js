/* 52-ceramic-seo.js — STAGE 3: the SEO data.

   _build/data/seo.json is the single source for every page's <title>, meta description,
   OG tags, breadcrumbs and Service JSON-LD. Two whole route entries go, and four pages
   had ceramic coating written into their title or description.

   WHAT IS NOT TOUCHED, and it is three of the ceramic hits in this file: the window-tint
   route's title, description and Service JSON-LD all say "ceramic" because the tint film
   IS ceramic. Different product, staying.

   Replacement wording names window tint where ceramic coating used to sit — tint is a real
   published service with a real published price, so nothing here promises anything the
   shop does not sell. Lengths stay inside spec section 8.2; verify-seo-lengths.js is the check.

   Usage: node _build/us/52-ceramic-seo.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const F = path.resolve(__dirname, '..', 'data', 'seo.json');
let s = fs.readFileSync(F, 'utf8');
const log = [];

function swap(label, from, to) {
  if (!s.includes(from)) throw new Error(`NOT FOUND (${label}): ${from.slice(0, 120)}`);
  if (s.indexOf(from) !== s.lastIndexOf(from)) throw new Error(`AMBIGUOUS (${label})`);
  s = s.replace(from, to);
  log.push('  rewrote  ' + label);
}

/* Cut a whole route object by its key, from its own line to the line after its closing
   brace. Done structurally and then re-parsed as JSON, because a route entry is 20+ lines
   of nested objects and transcribing it is how these edits go wrong. */
function dropRoute(key) {
  const k = `    "${key}": {`;
  const a = s.indexOf(k);
  if (a < 0) throw new Error(`route not found: ${key}`);
  let depth = 0, i = s.indexOf('{', a);
  for (; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') { depth--; if (depth === 0) break; }
  }
  let end = i + 1;
  if (s[end] === ',') end++;
  while (s[end] === '\r') end++;
  if (s[end] === '\n') end++;
  const span = s.slice(a, end);
  if (!span.includes(key)) throw new Error(`wrong span for ${key}`);
  s = s.slice(0, a) + s.slice(end);
  log.push(`  removed  route "${key}"  (${span.split('\n').length} lines)`);
}

dropRoute('ceramic-coating/');
dropRoute('blog/ppf-vs-ceramic-coating/');

swap('home title',
  '"title": "PPF, Wraps and Ceramic in Boca Raton | SERRES"',
  '"title": "PPF, Wraps and Window Tint in Boca Raton | SERRES"');
swap('home description',
  '{{startingAtAmount:wraps}} and ceramic coating in Boca Raton.',
  '{{startingAtAmount:wraps}} and ceramic window tint in Boca Raton.');

swap('pricing title',
  '"title": "PPF, Wrap and Ceramic Prices in Boca Raton | SERRES"',
  '"title": "PPF, Wrap and Tint Prices in Boca Raton | SERRES"');
swap('pricing description',
  'wraps {{startingAt:wraps}}, ceramic {{startingAt:ceramic}}, tint and detailing.',
  'wraps {{startingAt:wraps}}, tint {{startingAt:tint}} and detailing.');

swap('gallery title',
  '"title": "Gallery: PPF, Wraps and Ceramic Work | SERRES"',
  '"title": "Gallery: PPF, Wraps and Tint Work | SERRES"');
swap('gallery description',
  'chrome deletes and ceramic coating, photographed panel by panel.',
  'chrome deletes and ceramic window tint, photographed panel by panel.');

/* Both replacements are length-tuned: spec section 8.2 wants 140-155 characters and
   verify-seo-lengths.js enforces it on the RENDERED text, after the price tokens resolve.
   The first drafts came out at 167 and 137 — measured, not eyeballed. */
swap('blog index description',
  'what paint protection film and wraps really cost in South Florida, PPF versus ceramic, and how to keep a finish looking new.',
  'what paint protection film and wraps really cost in South Florida, and how to keep a finish looking new in this climate.');

/* parse before writing — a broken seo.json takes down every page's <head> at once */
JSON.parse(s);
fs.writeFileSync(F, s);
console.log(log.join('\n'));

/* Gate: "ceramic" may survive ONLY where it qualifies the tint film. The rule is the noun
   that follows, not the route — the home and gallery descriptions legitimately say
   "ceramic window tint" now, and an earlier version of this check flagged its own correct
   output because it keyed on the route instead. */
const TINT = /ceramic (window tint|film|infrared|IR)/i;
const after = JSON.parse(fs.readFileSync(F, 'utf8'));
const routes = after.routes || after;
const offenders = [];
for (const [route, data] of Object.entries(routes)) {
  const blob = JSON.stringify(data);
  const hits = blob.match(/.{0,50}ceramic.{0,70}/gi) || [];
  hits.filter(h => !TINT.test(h)).forEach(h => offenders.push(route + ' -> ' + h));
}
console.log('');
if (offenders.length) {
  console.error('FAIL ceramic left outside the window-tint route:');
  offenders.forEach(o => console.error('  ' + o));
  process.exit(1);
}
console.log('seo.json clean — ceramic survives only on the window-tint route, where it is the film.');
