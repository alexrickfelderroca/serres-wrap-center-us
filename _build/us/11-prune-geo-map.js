/* 11-prune-geo-map.js — drop geo-map entries whose `en` key no longer exists.

   The geo map was written against Barcelona commit 4dc52fc. Two later source
   commits (5da3ad1 phone, 07a97ec logo) changed strings underneath it, so a few
   entries reference text that is no longer anywhere in the tree — mostly NAP
   sentences carrying the OLD phone +34 621 24 44 69.

   Those entries are safe to drop: every NAP string is regenerated from
   assets/business.js later. Dropping them silently would not be — so they are
   written to geo-map.pruned.json with the reason, and printed.

   Usage: node _build/us/11-prune-geo-map.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const { loadDict, pages } = require(path.join(root, '_build', 'port', 'lib.js'));

const MAP = path.join(root, '_build', 'port', 'geo-map.json');
const entries = JSON.parse(fs.readFileSync(MAP, 'utf8'));
const dict = loadDict(root);
const html = pages(root).map(f => fs.readFileSync(f, 'utf8')).join('\n');

const keep = [], pruned = [];
for (const e of entries) {
  const inDict = Object.prototype.hasOwnProperty.call(dict, e.en);
  const inHtml = html.includes(e.en);
  if (inDict || inHtml) keep.push(e);
  else pruned.push({ ...e, _prunedBecause: 'en key absent from both the dictionary and every HTML page (stale vs the current Barcelona source)' });
}

if (pruned.length) {
  fs.writeFileSync(path.join(root, '_build', 'port', 'geo-map.pruned.json'), JSON.stringify(pruned, null, 1));
  console.log(`pruned ${pruned.length} unresolvable geo-map entries -> _build/port/geo-map.pruned.json`);
  pruned.forEach(p => console.log('  - ' + p.en.slice(0, 110).replace(/\s+/g, ' ')));
  fs.writeFileSync(MAP, JSON.stringify(keep, null, 1));
} else {
  console.log('geo-map: nothing to prune');
}
console.log(`geo-map: ${keep.length} entries remain`);
