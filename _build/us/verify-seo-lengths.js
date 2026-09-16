/* verify-seo-lengths.js — measure the RENDERED <title> and meta description of every
   shipped page against spec §8.2 (title <=60 chars, description 140-155 chars), and
   check uniqueness. Templates in seo.json carry {{tokens}} that shrink when resolved,
   so only the rendered HTML can be measured honestly.
   Usage: node _build/us/verify-seo-lengths.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(root);

const rows = [];
const titles = new Map(), descs = new Map(), h1s = new Map();

for (const f of files.sort()) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();
  const desc = (s.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ''])[1].trim();
  const canon = (s.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || [, ''])[1].trim();
  const h1n = (s.match(/<h1\b/g) || []).length;

  rows.push({ rel, title, desc, canon, h1n });
  if (title) titles.set(title, (titles.get(title) || []).concat(rel));
  if (desc) descs.set(desc, (descs.get(desc) || []).concat(rel));
}

const problems = [];
console.log('  T   D   H1  route');
for (const r of rows) {
  const tBad = r.title.length === 0 || r.title.length > 60;
  const dBad = r.desc.length < 140 || r.desc.length > 155;
  const hBad = r.h1n !== 1;
  if (tBad) problems.push(`${r.rel}: title ${r.title.length} chars (max 60) — ${JSON.stringify(r.title)}`);
  if (dBad) problems.push(`${r.rel}: description ${r.desc.length} chars (want 140-155)`);
  if (hBad) problems.push(`${r.rel}: ${r.h1n} <h1> elements (want exactly 1)`);
  if (!r.canon) problems.push(`${r.rel}: no canonical`);
  console.log(
    (tBad ? 'T!' : 'ok') + String(r.title.length).padStart(4) +
    (dBad ? ' D!' : ' ok') + String(r.desc.length).padStart(4) +
    (hBad ? '  H!' : '  ok') + '  ' + r.rel
  );
}

for (const [t, where] of titles) if (where.length > 1) problems.push(`duplicate title across ${where.join(', ')}: ${JSON.stringify(t)}`);
for (const [d, where] of descs) if (where.length > 1) problems.push(`duplicate description across ${where.join(', ')}`);

console.log(`\n${rows.length} pages checked`);
if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}
console.log('titles, descriptions, canonicals and <h1> counts all within spec §8.2.');
