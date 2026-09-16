/* 59-us-english.js — base language is US English (Miami audience): British spellings and UK car terms in the
   ENGLISH copy become American. Applied as whole-word replacements across every text file (HTML inline text,
   dictionary keys, page JS data such as PRICING/TESTIMONIALS, JSON-LD, authored blog), so dictionary keys and
   the inline text that must match them change together. Spanish values are untouched (the patterns are English).
   Usage: node 59-us-english.js <siteRoot> [--census]      (--census: count only, change nothing)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, textFiles } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 59-us-english.js <siteRoot> [--census]'); process.exit(2); }
const CENSUS = process.argv.includes('--census');

/* [pattern (whole word, case-preserving via callback), replacement] */
const RULES = [
  ['colour', 'color'], ['colours', 'colors'], ['coloured', 'colored'], ['colourful', 'colorful'],
  ['tyre', 'tire'], ['tyres', 'tires'],
  ['bonnet', 'hood'], ['bonnets', 'hoods'],
  ['windscreen', 'windshield'], ['windscreens', 'windshields'],
  ['kerb', 'curb'], ['kerbs', 'curbs'], ['kerbed', 'curbed'],
  ['aluminium', 'aluminum'],
  ['centre', 'center'], ['centred', 'centered'],
  ['customise', 'customize'], ['customised', 'customized'], ['customisation', 'customization'],
  ['personalise', 'personalize'], ['personalised', 'personalized'], ['personalisation', 'personalization'],
  ['optimise', 'optimize'], ['optimised', 'optimized'], ['organise', 'organize'], ['organised', 'organized'],
  ['recognise', 'recognize'], ['recognised', 'recognized'], ['specialise', 'specialize'], ['specialised', 'specialized'],
  ['favourite', 'favorite'], ['favourites', 'favorites'],
  ['programme', 'program'], ['programmes', 'programs'],
  ['licence', 'license'], ['licences', 'licenses'],
  ['metres', 'meters'], ['metre', 'meter'], ['litre', 'liter'], ['litres', 'liters'],
  ['fibre', 'fiber'], ['vapour', 'vapor'], ['armour', 'armor'], ['behaviour', 'behavior'],
  ['catalogue', 'catalog'], ['defence', 'defense'], ['jewellery', 'jewelry'],
  /* "grey" and "petrol" deliberately NOT converted: they occur in film colour names ("Petrol Blue", "Frozen Shark Grey") */
  ['mould', 'mold'], ['moulding', 'molding'], ['mouldings', 'moldings'],
  ['number plate', 'license plate'], ['number plates', 'license plates'],
  ['whilst', 'while'], ['towards', 'toward'], ['amongst', 'among'],
  ['motorway', 'highway'], ['car park', 'parking lot'],
  ['boot lid', 'trunk lid'],
];
/* words whose UK/US meaning differs by context — replaced only inside these known phrases */
const PHRASES = [
  ['Full bonnet, wings, bumper', 'Full hood, fenders, bumper'],
  ['Bumper, partial bonnet and mirrors', 'Bumper, partial hood and mirrors'],
  ['Bumper + partial bonnet', 'Bumper + partial hood'],
  ['wings, bumper, mirrors and headlights', 'fenders, bumper, mirrors and headlights'],
];
const dec = s => s.replace(/&amp;/g, '&');
function caseLike(src, rep) { if (src === src.toUpperCase() && src.length > 1) return rep.toUpperCase(); if (src[0] === src[0].toUpperCase()) return rep[0].toUpperCase() + rep.slice(1); return rep; }

const files = textFiles(root).filter(f => !/[\\\/]_build[\\\/]/.test(f));
const census = {}; let total = 0;
for (const f of files) {
  editFile(f, (src, api) => {
    let s = src;
    for (const [from, to] of PHRASES) { const n = s.split(from).length - 1; if (n) { census[from] = (census[from] || 0) + n; total += n; if (!CENSUS) s = s.split(from).join(to); } }
    for (const [from, to] of RULES) {
      const re = new RegExp('(^|[^A-Za-z-])(' + from.replace(/ /g, '[ ]') + ')(?![A-Za-z-])', 'gi');
      s = s.replace(re, (m, pre, w) => { census[from] = (census[from] || 0) + 1; total += 1; return CENSUS ? m : pre + caseLike(w, to); });
    }
    if (!CENSUS && s !== src) api.set(s);
  });
}
const rows = Object.entries(census).sort((a, b) => b[1] - a[1]);
console.log((CENSUS ? 'census' : 'us-english') + ': ' + total + ' replacements across ' + rows.length + ' patterns');
rows.forEach(([k, v]) => console.log('  ' + String(v).padStart(4) + '  ' + k));
