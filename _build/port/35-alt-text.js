/* 35-alt-text.js — English alt text (base language) + Spanish dictionary values.
   Reads _build/port/alt-map.json: [{ es, en, esNew, files }]. Replaces alt="<es>" with alt="<en>" in the listed
   files (entity-encoded and raw forms) and registers "en": "esNew" in the dictionary so the ES switcher
   translates alt attributes (the runtime's ATTRS list includes "alt" after the port).
   Usage: node 35-alt-text.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, addEntries, pages } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 35-alt-text.js <siteRoot>'); process.exit(2); }
const file = path.join(__dirname, 'alt-map.json');
if (!fs.existsSync(file)) { console.log('SKIPPED — alt-map.json not present yet'); process.exit(0); }
const map = JSON.parse(fs.readFileSync(file, 'utf8'));
const encAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decAttr = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

let replaced = 0; const missing = [];
for (const f of pages(root)) {
  editFile(f, (src, api) => {
    let s = src;
    s = s.replace(/alt="([^"]*)"/g, (m, v) => {
      const dec = decAttr(v).trim();
      const hit = map.find(e => e.es.trim() === dec || e.en === dec);
      if (!hit) return m;
      if (dec === hit.en) return m;
      replaced++; return 'alt="' + encAttr(hit.en) + '"';
    });
    if (s !== src) api.set(s);
  });
}
for (const e of map) {
  const found = pages(root).some(f => fs.readFileSync(f, 'utf8').includes('alt="' + encAttr(e.en) + '"'));
  if (!found) missing.push(e.en);
}
addEntries(root, 'Miami port — alt text (EN key -> ES)', map.map(e => ({ en: e.en, es: e.esNew != null ? e.esNew : e.es })));
console.log(`alt text: ${replaced} attributes rewritten, ${map.length} dictionary entries ensured`);
if (missing.length) { console.error('alt entries with no matching attribute in any page:\n  ' + missing.join('\n  ')); process.exit(1); }
