/* 54-ceramic-faq.js — STAGE 5: the FAQ sources.

   These four answers are why regen kept aborting with 'pricing.js has no item
   "ceramic-topup"'. The token lives in the FAQ text, not in the page markup, so the
   HTML-side sweep in stage 4 could not see it and regen never got far enough to rewrite
   the nav it was being blamed for.

   Edited in _build/us/faq/*.json, the SOURCES. 32-merge-faq.js rebuilds
   _build/data/faq.json from them on every build; regen then stamps each answer into both
   the visible FAQ and its FAQPage JSON-LD twin, which _build/verify-seo.js requires to
   stay byte-identical. Editing the merged file instead is undone by the next build.

   The /reserve answer is the one that is not housekeeping. The Founding Member offer was
   "three things" and the second was the free ceramic top-up. It is now two things, and
   the answer says two. RESERVE_LIVE is false and the page is unlinked until Nov 2, so no
   customer has been promised this — but it is a commercial change, TODO item 47.

   NOT TOUCHED: window-tint.json, whose two ceramic answers are about ceramic FILM.

   Usage: node _build/us/54-ceramic-faq.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, 'faq');
const log = [];

function editAnswer(file, label, from, to) {
  const p = path.join(DIR, file);
  const raw = fs.readFileSync(p, 'utf8');
  if (!raw.includes(from)) throw new Error(`NOT FOUND in ${file} (${label}):\n---\n${from.slice(0, 200)}\n---`);
  if (raw.indexOf(from) !== raw.lastIndexOf(from)) throw new Error(`AMBIGUOUS in ${file} (${label})`);
  const out = raw.replace(from, to);
  JSON.parse(out);                       /* a broken FAQ file takes out every page's <head> */
  fs.writeFileSync(p, out);
  log.push(`  rewrote  ${file.padEnd(28)} ${label}`);
}

editAnswer('detailing.json', 'paint-correction answer — ceramic prep sentence',
  ' It is also the right prep step before a ceramic coating, so the finish is sealed at its best rather than as found.',
  ' It is also the right prep step before paint protection film, so what the film preserves is the paint at its best rather than as found.');

editAnswer('paint-protection-film.json', 'aftercare answer — ceramic top-up upsell',
  ' A ceramic top-up over fresh film makes washing easier again: {{from:ceramic-topup}}.',
  '');

editAnswer('pricing.json', 'what-is-not-priced answer — drop the ceramic group',
  'wraps {{startingAt:wraps}}, ceramic coating {{startingAt:ceramic}}, window tint {{startingAt:tint}}',
  'wraps {{startingAt:wraps}}, window tint {{startingAt:tint}}');

editAnswer('reserve.json', 'Founders Club answer — three benefits become two',
  'Three things: 15% off any paint protection film or wrap, a free ceramic top-up over the fresh film, normally {{price:ceramic-topup}}, and Founding Member status, which is 10% off detailing for life.',
  'Two things: 15% off any paint protection film or wrap, and Founding Member status, which is 10% off detailing for life.');

console.log(log.join('\n'));

/* Gate: no FAQ source may mention ceramic coating. window-tint.json is exempt as a whole
   file, not by pattern — it is the tint page's FAQ and every ceramic in it is the film,
   including "the one tint we fit is ceramic", which no "ceramic <noun>" rule can match. */
const TINT = /ceramic (film|window tint|infrared|IR)/i;
let bad = 0;
for (const f of fs.readdirSync(DIR).filter(n => n.endsWith('.json') && n !== 'window-tint.json')) {
  const blob = fs.readFileSync(path.join(DIR, f), 'utf8');
  const hits = (blob.match(/.{0,60}ceramic.{0,80}/gi) || []).filter(h => !TINT.test(h));
  if (hits.length) { bad += hits.length; console.error(`\nFAIL ${f}:`); hits.forEach(h => console.error('  …' + h.replace(/\s+/g, ' ') + '…')); }
}
console.log('');
if (bad) process.exit(1);
console.log('FAQ sources clean — ceramic survives only as the tint film.');
console.log('NEXT: node _build/us/build.js');
