/* verify-owner-marks.js — everything the owner struck off a screenshot is still gone.

   Three rounds of removals (2026-09-16) were applied by 40-tint-removals.js,
   41-owner-removals-r3.js and two hand passes. Nothing else in the suite would notice if
   a later edit, a regen run or a copy-paste from _build/us/harvest/ put one of them back:
   every other gate checks structure, links, prices or SEO, none checks content that is
   supposed to be absent. This is that gate.

   Each entry is the most distinctive string in the removed block, plus — where a harmless
   substring of it survives in unrelated copy — the exact files allowed to still match and
   why. An allowance is a decision, so it is written down rather than the needle being
   quietly loosened until it stops firing.

   If the owner later asks for one of these BACK, delete its entry here in the same commit
   that restores it. A failing gate you cannot explain is the point; a gate quietly edited
   until it passes is not.

   Usage: node _build/us/verify-owner-marks.js [root]
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);
pages.sort();

/* [label, needle, allowed] — `allowed` maps a page path fragment to the reason it may
   still contain the needle. Anything not listed is a failure. */
const MARKS = [
  ['round 1  home hero sub-paragraph', 'The protocol we have run in our Barcelona studio', {}],
  ['round 1  trust bar (sitewide)', 'us-trustbar', {}],
  ['round 1  "Every service carries a published starting price"', 'Every service carries a published starting price', {}],
  ['round 1  footer "PPF near you" column', 'PPF near you', {
    'ppf-fort-lauderdale': 'the lander\'s own .rel-links label, not the footer column — it is one of the links that keeps the four city pages within 2 clicks of home',
  }],
  ['round 1  "Se habla espanol"', 'Se habla', {}],
  ['round 1  "Govorim po-russki"', 'po-russki', {}],
  ['round 1  PPF "3M Signature vs NAR Essential"', 'Signature vs NAR', {}],
  ['round 1  PPF "Every panel, edge to edge"', 'edge to edge', {
    'ppf-delray-beach': 'inside a CSS comment about text running edge to edge — unrelated to the removed section',
  }],
  ['round 2  car-wraps BMW XM paragraph', 'stripped it back, decontaminated', {}],
  ['round 2  car-wraps "Drag the slider" line', 'Drag the slider to see the change', {}],
  ['round 2  ceramic SiO2 lead paragraph', 'A SiO2 layer that cures onto the clear coat', {}],
  ['round 2  ceramic "Film on the front, ceramic over the rest"', 'ceramic over the rest', {
    'ceramic-coating': 'an FAQ answer ("Film on the front end and ceramic over the rest is how most cars leave the shop") and its JSON-LD twin. The owner marked the SECTION, not the FAQ',
  }],
  ['round 2  tint IR / Heat rejection tile', 'Heat rejection', {}],
  ['round 2  tint hero lead', 'One tint package, fitted properly', {}],
  ['round 2  tint "One tint. Ceramic film."', 'One tint.', {}],
  ['round 2  tint "How dark you are actually allowed to go."', 'How dark you are actually allowed', {}],
  ['round 2  tint VLT explainer', 'VLT is visible light transmission', {}],
  ['round 2  tint medical-exemption table footer', 'A medical exemption exists in Florida', {}],
  ['round 2  tint AS-1 explainer', 'The AS-1 line is the mark etched', {}],
  ['round 3  home service-card sub-descriptions', 'class="sd-sub"', {}],
  ['round 3  home PACKAGES block', 'not padded.', {}],
  ['round 3  home "Not a new shop. A second one."', 'A second one.', {}],
  ['round 3  PPF "Three layers, one invisible skin."', 'invisible skin', {
    'our-films': 'a near-twin block on a page the owner has NOT marked — left on purpose, TODO item 40',
  }],
  ['round 3  detailing "From hazy to mirror."', 'From hazy', {}],
  ['round 3  detailing BMW swirls paragraph', 'wash-induced swirls', {}],
  ['round 3  tint "Pending verification" note', 'Pending verification', {}],
  ['round 3  tint "Non-reflective film above the AS-1 line"', 'Non-reflective film above', {}],
  ['round 3  tint FAQ unverified disclaimer', 'not yet verified these figures', {}],
  ['rounds 1+3  footer body (columns, NAP, hours, Instagram)', 'us-footer__col', {}],
];

const cache = new Map();
const body = (p) => { if (!cache.has(p)) cache.set(p, fs.readFileSync(p, 'utf8')); return cache.get(p); };

let failed = 0;
for (const [label, needle, allowed] of MARKS) {
  const hits = pages.filter(p => body(p).includes(needle));
  const bad = hits.filter(h => !Object.keys(allowed).some(frag => h.includes(frag)));
  const excused = hits.filter(h => Object.keys(allowed).some(frag => h.includes(frag)));
  if (bad.length) {
    failed++;
    console.log(`BACK   ${label}`);
    bad.forEach(h => console.log(`         ${path.relative(ROOT, h)}`));
  } else {
    console.log(`gone   ${label}${excused.length ? `   (allowed: ${excused.map(h => path.relative(ROOT, h)).join(', ')})` : ''}`);
  }
}

/* The removals also repaired two structural defects. Guard them, because both were
   invisible on screen and survived every other gate for weeks. */
const structural = [];
for (const p of pages) {
  const s = body(p);
  const o = (s.match(/<footer\b/g) || []).length;
  const c = (s.match(/<\/footer>/g) || []).length;
  if (o !== c) structural.push(`${path.relative(ROOT, p)}: ${o} <footer> / ${c} </footer> — the greedy partial-comment bug is back (see _build/regen.mjs render())`);
  const dO = (s.match(/<div\b/g) || []).length;
  const dC = (s.match(/<\/div>/g) || []).length;
  if (dO !== dC) structural.push(`${path.relative(ROOT, p)}: ${dO} <div> / ${dC} </div> — unbalanced by ${dO - dC}`);
}
const home = body(path.join(ROOT, 'index.html'));
const mainAt = home.indexOf('<main id="main">');
const divAfter = home.slice(mainAt, mainAt + 40);
if (divAfter.includes('</div>')) structural.push('index.html: </div> immediately after <main id="main"> — an HTML parser closes <main> there, emptying the landmark');

console.log('');
if (structural.length) {
  console.log('STRUCTURAL REGRESSIONS:');
  structural.forEach(s => console.log('  ' + s));
}
console.log(`${pages.length} shipped pages checked; ${failed} marked item(s) back; ${structural.length} structural regression(s).`);
if (failed || structural.length) process.exit(1);
console.log('every owner-marked removal is still removed, and the markup repairs still hold.');
