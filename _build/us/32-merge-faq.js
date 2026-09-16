/* 32-merge-faq.js — merge the per-page FAQ files into _build/data/faq.json.

   _build/data/faq.json is the single source regen.mjs reads, but it is ONE shared file,
   so page agents writing to it in parallel would clobber each other. Each page instead
   writes _build/us/faq/<slug>.json and this step merges them in, deterministically.

   Slug -> route mapping: 'home' -> '', everything else -> '<slug>/'.

   Validates what regen.mjs requires before it can fail confusingly later:
     - answers are PLAIN TEXT (no HTML, and none of & < > ") because the visible answer
       and the JSON-LD acceptedAnswer.text must stay byte-identical
     - every {{token}} used is one regen actually resolves

   Usage: node _build/us/32-merge-faq.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SRC = path.join(root, '_build', 'us', 'faq');
const DEST = path.join(root, '_build', 'data', 'faq.json');

if (!fs.existsSync(SRC)) { console.log('no _build/us/faq/ — nothing to merge'); process.exit(0); }

const raw = fs.readFileSync(DEST, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const faq = JSON.parse(raw);

/* tokens regen.mjs resolves inside a FAQ answer (lowercase namespace) */
const TOKEN_OK = /^(price:[A-Za-z0-9-]+(\.(essential|signature))?|from:[A-Za-z0-9-]+|startingAt:[A-Za-z0-9]+|startingAtAmount:[A-Za-z0-9]+|terms:[A-Za-z]+|business:[A-Za-z]+|film:[A-Za-z]+\.[A-Za-z]+)$/;

const P = require(path.join(root, 'assets', 'pricing.js'));
const B = require(path.join(root, 'assets', 'business.js'));

const problems = [];
let merged = 0, items = 0;

for (const f of fs.readdirSync(SRC).filter(n => n.endsWith('.json')).sort()) {
  const slug = f.replace(/\.json$/, '');
  const route = slug === 'home' ? '' : slug + '/';
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')); }
  catch (e) { problems.push(`${f}: not valid JSON — ${e.message}`); continue; }

  if (!data || !Array.isArray(data.items)) { problems.push(`${f}: needs { "style": "...", "items": [...] }`); continue; }

  data.items.forEach((it, i) => {
    const where = `${f}[${i}]`;
    if (!it || typeof it.q !== 'string' || typeof it.a !== 'string') { problems.push(`${where}: needs string "q" and "a"`); return; }
    for (const [field, val] of [['q', it.q], ['a', it.a]]) {
      /* strip tokens before testing, then look for the forbidden characters */
      const bare = val.replace(/\{\{[^}]*\}\}/g, '');
      const bad = bare.match(/[&<>"]/g);
      if (bad) problems.push(`${where}.${field}: contains ${JSON.stringify([...new Set(bad)].join(''))} — answers must be plain text or the HTML and JSON-LD copies stop matching`);
      if (/<[a-z/]/i.test(bare)) problems.push(`${where}.${field}: contains HTML`);
    }
    for (const m of it.a.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
      const t = m[1];
      if (!TOKEN_OK.test(t)) { problems.push(`${where}: unknown FAQ token {{${t}}}`); continue; }
      const idm = /^(?:price|from):([A-Za-z0-9-]+)/.exec(t);
      if (idm && !P.byId(idm[1])) problems.push(`${where}: {{${t}}} references an id not in pricing.js`);
      const gm = /^startingAt(?:Amount)?:([A-Za-z0-9]+)$/.exec(t);
      if (gm && !P.groups()[gm[1]]) problems.push(`${where}: {{${t}}} references an unknown group`);
      const tm = /^terms:([A-Za-z]+)$/.exec(t);
      if (tm && !(tm[1] in P.TERMS)) problems.push(`${where}: {{${t}}} references an unknown TERMS key`);
      const bm = /^business:([A-Za-z]+)$/.exec(t);
      if (bm && !(bm[1] in B)) problems.push(`${where}: {{${t}}} references an unknown business field`);
    }
    items++;
  });

  faq[route] = { style: data.style || 'panel', items: data.items };
  merged++;
  console.log(`${f.padEnd(34)} -> faq.json["${route}"]  (${data.items.length} items)`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) — nothing written:`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}

fs.writeFileSync(DEST, JSON.stringify(faq, null, 1).split('\n').join(eol) + eol);
console.log(`\n${merged} file(s), ${items} FAQ item(s) merged into _build/data/faq.json — run regen to stamp them.`);
