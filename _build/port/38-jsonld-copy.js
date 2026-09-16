/* 38-jsonld-copy.js — English copy for JSON-LD strings that have no i18n dictionary key
   (Service / Offer / LocalBusiness names & descriptions, gallery/collection names, Person names).
   Reads _build/port/jsonld-map.json: [{ es, en, pages }]. Replaces exact string VALUES inside every
   <script type="application/ld+json"> block on every page (any key). Blog articles are handled by 80-blog.js.
   Usage: node 38-jsonld-copy.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, pages } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 38-jsonld-copy.js <siteRoot>'); process.exit(2); }
const file = path.join(__dirname, 'jsonld-map.json');
if (!fs.existsSync(file)) { console.log('SKIPPED — jsonld-map.json not present yet'); process.exit(0); }
const map = new Map(JSON.parse(fs.readFileSync(file, 'utf8')).map(e => [e.es.trim(), e.en]));
let replaced = 0, blocks = 0;
const used = new Set();
for (const f of pages(root)) {
  editFile(f, (src, api) => {
    let changed = false;
    const s = src.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
      let obj; try { obj = JSON.parse(body); } catch (e) { return m; }
      let n = 0;
      (function walk(o) {
        if (Array.isArray(o)) { o.forEach((v, i) => { if (typeof v === 'string') { const t = v.trim(); if (map.has(t)) { o[i] = map.get(t); n++; used.add(t); } } else walk(v); }); return; }
        if (o && typeof o === 'object') for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { const t = v.trim(); if (map.has(t)) { o[k] = map.get(t); n++; used.add(t); } } else walk(v); }
      })(obj);
      if (!n) return m;
      changed = true; blocks++; replaced += n;
      return a + '\n' + JSON.stringify(obj, null, 2) + '\n' + c;
    });
    if (changed) api.set(s);
  });
}
const unused = [...map.keys()].filter(k => !used.has(k));
console.log(`JSON-LD copy: ${replaced} strings replaced in ${blocks} blocks; ${unused.length} map entries unused`);
if (unused.length) console.log('  unused: ' + unused.slice(0, 10).map(u => JSON.stringify(u.slice(0, 70))).join(', ') + (unused.length > 10 ? ' …' : ''));
