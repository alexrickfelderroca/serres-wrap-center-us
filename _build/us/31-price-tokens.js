/* 31-price-tokens.js — resolve every price token in the shipped tree.

   Turns   {{PRICE:full-front.essential}}
   into    <!--P:PRICE:full-front.essential-->$1,900<!--/P-->

   and REFRESHES any marker already present, so re-running after a change to
   assets/pricing.js updates every sentence on the site. Idempotent.

   See _build/us/price-tokens.js for the token grammar.
   Usage: node _build/us/31-price-tokens.js [siteRoot] [--check]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.');
const CHECK = process.argv.includes('--check');
const T = require('./price-tokens.js');
const P = T.load(root);

const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|xml)$/.test(e.name)) files.push(p);
  }
})(root);

const errors = [];
let changed = 0, resolved = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');
  const res = T.resolveHtml(P, src, (key, err) => errors.push(`${rel}: ${err.message}`));
  resolved += res.count;
  if (res.html !== src) {
    if (CHECK) { errors.push(`${rel}: would change (run without --check)`); }
    else { fs.writeFileSync(f, res.html); changed++; }
  }
}

console.log(`${files.length} file(s) scanned, ${resolved} token(s) resolved, ${changed} file(s) rewritten`);

/* no raw token may survive */
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');
  for (const m of s.matchAll(/\{\{[^}]*\}\}/g)) errors.push(`${rel}: unresolved token ${m[0]}`);
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  [...new Set(errors)].slice(0, 40).forEach(e => console.error('  ' + e));
  process.exit(1);
}
console.log('all price tokens resolved; none left unrendered.');
