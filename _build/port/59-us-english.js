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
  ['color', 'color'], ['colors', 'colors'], ['colored', 'colored'], ['colorful', 'colorful'],
  ['tire', 'tire'], ['tires', 'tires'],
  ['hood', 'hood'], ['hoods', 'hoods'],
  ['windshield', 'windshield'], ['windshields', 'windshields'],
  ['curb', 'curb'], ['curbs', 'curbs'], ['curbed', 'curbed'],
  ['aluminum', 'aluminum'],
  ['center', 'center'], ['centered', 'centered'],
  ['customize', 'customize'], ['customized', 'customized'], ['customization', 'customization'],
  ['personalize', 'personalize'], ['personalized', 'personalized'], ['personalization', 'personalization'],
  ['optimize', 'optimize'], ['optimized', 'optimized'], ['organize', 'organize'], ['organized', 'organized'],
  ['recognize', 'recognize'], ['recognized', 'recognized'], ['specialize', 'specialize'], ['specialized', 'specialized'],
  ['favorite', 'favorite'], ['favorites', 'favorites'],
  ['program', 'program'], ['programs', 'programs'],
  ['license', 'license'], ['licenses', 'licenses'],
  ['meters', 'meters'], ['meter', 'meter'], ['liter', 'liter'], ['liters', 'liters'],
  ['fiber', 'fiber'], ['vapor', 'vapor'], ['armor', 'armor'], ['behavior', 'behavior'],
  ['catalog', 'catalog'], ['defense', 'defense'], ['jewelry', 'jewelry'],
  /* "grey" and "petrol" deliberately NOT converted: they occur in film color names ("Petrol Blue", "Frozen Shark Grey") */
  ['mold', 'mold'], ['molding', 'molding'], ['moldings', 'moldings'],
  ['license plate', 'license plate'], ['license plates', 'license plates'],
  ['while', 'while'], ['toward', 'toward'], ['among', 'among'],
  ['highway', 'highway'], ['parking lot', 'parking lot'],
  ['trunk lid', 'trunk lid'],
];
/* words whose UK/US meaning differs by context — replaced only inside these known phrases */
const PHRASES = [
  ['Full hood, fenders, bumper', 'Full hood, fenders, bumper'],
  ['Bumper, partial hood and mirrors', 'Bumper, partial hood and mirrors'],
  ['Bumper + partial hood', 'Bumper + partial hood'],
  ['fenders, bumper, mirrors and headlights', 'fenders, bumper, mirrors and headlights'],
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
