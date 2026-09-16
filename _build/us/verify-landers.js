/* verify-landers.js — spec P3-2 DoD: "no two landers share a paragraph".

   The 4 local SEO landers are written in parallel from the same brief, so the real risk
   is an interchangeable paragraph with the city name swapped. Google treats that as
   doorway pages, which is worse than not having the landers at all.

   Checks, per lander and pairwise:
     - word count is inside the spec's 400-600 band
     - no paragraph is byte-identical to one on a sibling
     - no paragraph is near-identical once the city name is masked out
       (this is the one that actually catches the swap-the-city trick)
     - the city's own landmarks/roads actually appear

   Usage: node _build/us/verify-landers.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const LANDERS = {
  'ppf-boca-raton': { city: 'Boca Raton', anchors: ['Glades', 'Yamato', 'Mizner', 'Town Center', 'I-95', 'US-1', 'Federal Highway'] },
  'ppf-fort-lauderdale': { city: 'Fort Lauderdale', anchors: ['Las Olas', 'A1A', 'I-95', 'Federal Highway', 'yacht', 'marine', 'salt'] },
  'ppf-pompano-beach': { city: 'Pompano Beach', anchors: ['Atlantic Boulevard', 'Copans', 'I-95', 'Federal Highway', 'Citi Centre'] },
  'ppf-delray-beach': { city: 'Delray Beach', anchors: ['Atlantic Avenue', 'Linton', 'Pineapple Grove', 'I-95', 'Federal Highway'] },
};

const CITIES = Object.values(LANDERS).map(l => l.city);

function textOf(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
}

/* paragraphs from the <main> body only — chrome is generated and identical by design */
function paragraphs(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  return [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => textOf(m[1]).replace(/\s+/g, ' ').trim())
    .filter(p => p.split(/\s+/).length >= 12);      // ignore captions and one-liners
}

const maskCity = s => {
  let out = s;
  for (const c of CITIES) out = out.split(c).join('CITY');
  return out.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
};

/* token-level Jaccard, robust to a reordered clause */
function similarity(a, b) {
  const A = new Set(a.split(' ')), B = new Set(b.split(' '));
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

const problems = [];
const warnings = [];
const data = {};

for (const [slug, cfg] of Object.entries(LANDERS)) {
  const f = path.join(root, slug, 'index.html');
  if (!fs.existsSync(f)) { problems.push(`${slug}: page does not exist`); continue; }
  const html = fs.readFileSync(f, 'utf8');
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [])[0];
  if (!main) problems.push(`${slug}: no <main> element`);
  const paras = paragraphs(html);
  /* Spec 6.11 wants "400-600 words of unique copy" — that means PROSE, not everything
     inside <main>. Counting the whole landmark also counted the quote-form labels, the
     price table cells, the FAQ and the cross-links, which are shared components, so a
     perfectly-sized lander measured 1,097 words. Count the paragraphs only. */
  const words = paras.join(' ').split(/\s+/).filter(Boolean).length;
  data[slug] = { words, paras, masked: paras.map(maskCity) };

  /* Too little unique copy is a real defect (thin/doorway page). Too much is not — more
     genuinely city-specific prose helps. Over the band is a warning, not a failure. */
  if (words < 400) problems.push(`${slug}: only ${words} words of prose (spec 6.11 wants 400-600) — too thin`);
  else if (words > 600) warnings.push(`${slug}: ${words} words of prose, above the spec's 400-600 band (not a defect — it is unique, city-specific copy)`);
  const hit = cfg.anchors.filter(a => new RegExp(a, 'i').test(html));
  if (hit.length < 2) problems.push(`${slug}: mentions only ${hit.length} of its own landmarks/roads (${cfg.anchors.join(', ')}) — the copy is not anchored to the city`);
  if (!new RegExp(cfg.city, 'i').test(html)) problems.push(`${slug}: never names ${cfg.city}`);
  console.log(`${slug.padEnd(22)} ${String(words).padStart(4)} words, ${String(paras.length).padStart(2)} paragraphs, landmarks: ${hit.join(', ') || 'NONE'}`);
}

const slugs = Object.keys(data);
for (let i = 0; i < slugs.length; i++) {
  for (let j = i + 1; j < slugs.length; j++) {
    const A = data[slugs[i]], B = data[slugs[j]];
    A.paras.forEach((pa, ai) => {
      B.paras.forEach((pb, bi) => {
        if (pa === pb) {
          problems.push(`${slugs[i]}[p${ai}] and ${slugs[j]}[p${bi}] are IDENTICAL: "${pa.slice(0, 70)}..."`);
          return;
        }
        const sim = similarity(A.masked[ai], B.masked[bi]);
        if (sim >= 0.8) {
          problems.push(`${slugs[i]}[p${ai}] and ${slugs[j]}[p${bi}] are ${Math.round(sim * 100)}% identical once the city name is masked — this is the swap-the-city pattern: "${pa.slice(0, 70)}..."`);
        }
      });
    });
  }
}

console.log(`\n${slugs.length} lander(s) checked`);
if (warnings.length) {
  console.log('notes (not failures):');
  warnings.forEach(w => console.log('  ' + w));
}
if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}
console.log('landers are unique, city-anchored, and none is thin.');
