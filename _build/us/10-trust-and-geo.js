/* 10-trust-and-geo.js
   (a) finishes what _build/port/50-trust-signals.js started before it crashed:
       removes the Barcelona Google-listing review claims (4.9 rating, 98% recommend)
       from the dictionary and therefore from every page that renders them.
       A US entity with zero US reviews may not publish a Spanish listing's rating.
   (b) retargets the port's geo + JSON-LD maps from "Miami" to "Boca Raton".
       The earlier session assumed Miami; SERRES-US-WEBSITE-SPEC_1.md §1 says
       Boca Raton / Pompano Beach.

   Product claims that are NOT review claims are deliberately kept:
     "50+ Film Colors" (ppf), "150+ Film Colors" (vinyl) — real film-range counts.
   Usage: node _build/us/10-trust-and-geo.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const { renameEntries, loadDict, pages } = require(path.join(root, '_build', 'port', 'lib.js'));

/* ------------------------------------------------------------------ (a) trust */
const dict = loadDict(root);
const CLAIM = /4[.,]9(?!\d)|98 ?%/;
const hits = Object.keys(dict).filter(k => CLAIM.test(k));

const REWRITES = {
  // meta description for why-serres: drop the listing stat, keep the substance
  'Detailing studio in Sant Cugat del Vallès: PPF, Car Wrap and paint correction with certified materials and 98% of clients who recommend us.': {
    en: 'Detailing studio in Sant Cugat del Vallès: PPF, Car Wrap and paint correction with certified materials and a documented process.',
    es: 'Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un proceso documentado.',
  },
};

const changes = [];
for (const k of hits) {
  if (REWRITES[k]) { changes.push({ en: k, newEn: REWRITES[k].en, newEs: REWRITES[k].es }); continue; }
  // generic: drop the sentence carrying the claim, close with a neutral one
  const SENT = /\s*[^.]*(?:4[.,]9(?!\d)|98 ?%)[^.]*\.(?=\s|$)/g;
  const strip = (s, tail) => {
    const out = s.replace(SENT, '').trim();
    if (out === s.trim()) return null;
    if (!out) throw new Error('claim sentence was the whole string: ' + s.slice(0, 80));
    return out + ' ' + tail;
  };
  const newEn = strip(k, 'Nothing leaves the studio until it meets that standard.');
  const newEs = strip(dict[k], 'Nada sale del taller hasta que cumple ese estándar.');
  if (newEn) changes.push({ en: k, newEn, newEs: newEs || dict[k] });
}

if (changes.length) {
  renameEntries(root, pages(root), changes);
  console.log(`trust: ${changes.length} dictionary entr${changes.length === 1 ? 'y' : 'ies'} with 4.9 / 98% claims rewritten`);
} else {
  console.log('trust: no 4.9 / 98% dictionary claims found');
}

/* gate: nothing with a review claim may survive in the dictionary or in visible HTML */
const after = loadDict(root);
const leftDict = Object.keys(after).filter(k => CLAIM.test(k) || CLAIM.test(after[k]));
if (leftDict.length) {
  console.error('FAIL review claims still in the dictionary:\n  ' + leftDict.map(k => k.slice(0, 120)).join('\n  '));
  process.exit(1);
}
// Spanish blog articles are replaced wholesale later (they carry 98% claims); exclude them here.
const leftHtml = [];
for (const f of pages(root)) {
  if (/blog[\\/](cuanto|ppf-o-|limpieza)/.test(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  src.split('\n').forEach((line, i) => {
    // strip inline SVG path data before testing — "4.9" occurs inside the WhatsApp glyph
    const clean = line.replace(/<path[^>]*>/g, '').replace(/\sd="[^"]*"/g, '');
    if (/4[.,]9(?!\d)\s*(rating|\/5|estrellas|stars)|98 ?% ?(of|de)/i.test(clean)) leftHtml.push(path.relative(root, f) + ':' + (i + 1));
  });
}
if (leftHtml.length) {
  console.error('FAIL review claims still visible in HTML:\n  ' + leftHtml.join('\n  '));
  process.exit(1);
}
console.log('trust: gate clean — no 4.9 / 98% review claim in the dictionary or in shipped HTML');

/* -------------------------------------------------------------------- (b) geo */
// No "Miami Blue" (a real 3M film colour) exists in either map — verified before writing —
// so a literal Miami -> Boca Raton replace is safe here. It is NOT safe on the pages,
// which is why this only ever touches the two map files.
for (const rel of ['_build/port/geo-map.json', '_build/port/jsonld-map.json']) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { console.log('geo: skip (absent) ' + rel); continue; }
  const before = fs.readFileSync(p, 'utf8');
  if (/Miami Blue/.test(before)) throw new Error(rel + ' contains "Miami Blue" — a blind replace would corrupt a film colour name');
  const n = (before.match(/Miami/g) || []).length;
  const after = before.split('Miami').join('Boca Raton');
  if (n) fs.writeFileSync(p, after);
  console.log(`geo: ${rel} — ${n} "Miami" -> "Boca Raton"`);
}

/* sanity: both maps must still be valid JSON after the rewrite */
for (const rel of ['_build/port/geo-map.json', '_build/port/jsonld-map.json']) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) { JSON.parse(fs.readFileSync(p, 'utf8')); console.log('geo: ' + rel + ' parses'); }
}
