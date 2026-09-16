/* 21-fix-seo-lengths.js — bring the 5 out-of-range meta descriptions into the
   140-155 char window of spec §8.2. Lengths are measured on the RENDERED string
   (tokens resolved), which is the only honest measurement.
   Usage: node _build/us/21-fix-seo-lengths.js
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const P = require(path.join(root, 'assets', 'pricing.js'));

const FILE = path.join(root, '_build', 'data', 'seo.json');
const raw = fs.readFileSync(FILE, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const json = JSON.parse(raw);
const routes = json.routes || json;

/* resolve the same tokens regen.mjs resolves, so we measure what ships */
function render(s) {
  return String(s)
    .replace(/\{\{\s*price:([a-z0-9-]+)\.(essential|signature)\s*\}\}/gi,
      (_, id, tier) => P.usd(P.byId(id)[tier === 'essential' ? 'priceEssential' : 'priceSignature']))
    .replace(/\{\{\s*price:([a-z0-9-]+)\s*\}\}/gi, (_, id) => P.usd(P.byId(id).price))
    .replace(/\{\{\s*startingAt:([a-z0-9]+)\s*\}\}/gi, (_, g) => P.startingAtLabel(g));
}

const NEW = {
  // 165 -> trim the list, keep the two most distinctive protocol steps
  'about/':
    'From a Barcelona studio to Boca Raton: the SERRES protocol — paint thickness gauged at intake, a filtered-air bay, and gloss measured in and out.',
  // 159 -> drop one item from the list
  'gallery/':
    'Cars finished by the SERRES team: paint protection film, full color changes, chrome deletes and ceramic coating, photographed panel by panel.',
  // 139 -> add the differentiator the spec asks for
  'detailing/':
    'Detailing and paint correction in Boca Raton {{startingAt:detailing}}: interior strip-down, extraction, compound and polish, gloss measured in and out. No bait pricing.',
  // 135 -> name the film tiers, which is the article's actual hook
  'blog/how-much-does-ppf-cost/':
    'What paint protection film really costs in Boca Raton: full front {{price:full-front.essential}} in NAR H190 or {{price:full-front.signature}} in 3M, full body {{price:full-body.essential}}, and what moves the number.',
  // 132 -> add the reversibility angle
  'blog/how-much-does-a-car-wrap-cost/':
    'What a vinyl wrap really costs in Boca Raton: chrome delete {{price:chrome-delete}}, full color change {{price:color-change}}, premium color-shift film {{price:signature-wrap}} — and what drives the price.',
};

let changed = 0;
for (const [route, desc] of Object.entries(NEW)) {
  if (!routes[route]) { console.error('no such route in seo.json: ' + route); process.exit(1); }
  const before = render(routes[route].description).length;
  const after = render(desc).length;
  if (after < 140 || after > 155) {
    console.error(`FAIL ${route}: new description renders to ${after} chars, still outside 140-155`);
    console.error('     ' + JSON.stringify(render(desc)));
    process.exit(1);
  }
  console.log(`${route.padEnd(38)} ${before} -> ${after} chars`);
  routes[route].description = desc;
  changed++;
}

fs.writeFileSync(FILE, JSON.stringify(json, null, 2).split('\n').join(eol) + eol);
console.log(`\n${changed} description(s) rewritten in _build/data/seo.json — run regen to stamp them.`);
