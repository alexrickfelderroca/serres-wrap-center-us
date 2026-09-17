/* 56-ceramic-seo-lengths.js — STAGE 7: two meta descriptions back inside spec 8.2.

   Rewriting the /blog and /pricing descriptions to drop ceramic coating pushed them out
   of the 140-155 character window verify-seo-lengths.js enforces: 167 and 137. The window
   applies to the RENDERED text, after {{startingAt:...}} resolves, so the lengths are
   measured here against resolved values rather than guessed from the template.

   Usage: node _build/us/56-ceramic-seo-lengths.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const F = path.join(ROOT, '_build', 'data', 'seo.json');
const P = require(path.join(ROOT, 'assets', 'pricing.js'));

const EDITS = [
  ['blog/',
    'Guides from the SERRES team: what paint protection film and wraps really cost in South Florida, what an interior detail includes, and how to keep a finish looking new.',
    'Guides from the SERRES team: what paint protection film and wraps really cost in South Florida, and how to keep a finish looking new in this climate.'],
  ['pricing/',
    'Every SERRES price in one place: PPF {{startingAt:ppf}}, wraps {{startingAt:wraps}}, tint {{startingAt:tint}} and detailing. No bait pricing, exact quote in 2 hours.',
    'Every SERRES price in one place: PPF {{startingAt:ppf}}, wraps {{startingAt:wraps}}, tint {{startingAt:tint}} and detailing {{startingAt:detailing}}. No bait pricing, exact quote in 2 hours.'],
];

/* P.startingAt() returns a bare number (1000), not the rendered string. regen formats it
   as "from $1,000" — 11 characters where the raw number is 4, which is why the first run
   of this script measured /pricing at 122 and refused an edit that was actually fine.
   Formatting is replicated here so the count is the count the gate will take. */
const resolve = (t) => t.replace(/\{\{startingAt:([a-z0-9-]+)\}\}/gi,
  (_m, g) => 'from $' + Number(P.startingAt(g)).toLocaleString('en-US'));

let s = fs.readFileSync(F, 'utf8');
for (const [route, from, to] of EDITS) {
  if (!s.includes(from)) throw new Error(`NOT FOUND (${route}): ${from.slice(0, 90)}`);
  s = s.replace(from, to);
  const n = resolve(to).length;
  const ok = n >= 140 && n <= 155;
  console.log(`  ${route.padEnd(10)} ${String(n).padStart(3)} chars rendered  ${ok ? 'ok' : 'OUT OF RANGE'}`);
  if (!ok) throw new Error(`${route} description is ${n} chars, spec 8.2 wants 140-155`);
}
JSON.parse(s);
fs.writeFileSync(F, s);
console.log('\nboth descriptions inside spec 8.2. NEXT: node _build/us/build.js');
