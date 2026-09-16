/* 33-fix-blog-slug-refs.js — finish the Spanish->English blog slug rename.

   30-install-blog.js renamed assets/blog/<spanish-slug>/ and normalised the references
   inside the article BODIES. Two places were missed because they are generated, not
   authored:

     1. _build/data/seo.json still points og:image / twitter:image / primaryImageOfPage
        at the Spanish folders, and regen.mjs stamps those into every blog <head>.
        The files moved, so all 12 were 404s.
     2. index-cards.html carries a TODO(build) comment telling someone to rename the
        folders. They are renamed; the note is now misleading and ships inside
        blog/index.html.

   Usage: node _build/us/33-fix-blog-slug-refs.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SLUGS = {
  'cuanto-cuesta-ppf-coche': 'how-much-does-ppf-cost',
  'cuanto-cuesta-vinilar-un-coche': 'how-much-does-a-car-wrap-cost',
  'ppf-o-ceramico-que-elegir': 'ppf-vs-ceramic-coating',
  'limpieza-tapiceria-coche-precio': 'car-upholstery-cleaning-cost',
};

/* ------------------------------------------------------------- 1. seo.json */
const seoFile = path.join(root, '_build', 'data', 'seo.json');
let seo = fs.readFileSync(seoFile, 'utf8');
const eol = seo.includes('\r\n') ? '\r\n' : '\n';
let n = 0;
for (const [es, en] of Object.entries(SLUGS)) {
  const before = seo;
  seo = seo.split('assets/blog/' + es).join('assets/blog/' + en);
  if (seo !== before) n += (before.split('assets/blog/' + es).length - 1);
}
JSON.parse(seo);                      // must still be valid JSON
fs.writeFileSync(seoFile, seo);
console.log(`seo.json: ${n} blog image path(s) retargeted to the English slugs`);

/* ------------------------------------------- 2. the stale note in the cards */
const cards = path.join(root, '_build', 'us', 'content', 'blog', 'index-cards.html');
if (fs.existsSync(cards)) {
  let s = fs.readFileSync(cards, 'utf8');
  const before = s;
  // the TODO(build) block about renaming asset folders — the rename is done
  s = s.replace(/<!--\s*TODO\(build\)[\s\S]*?-->\s*\r?\n?/g, '');
  if (s !== before) { fs.writeFileSync(cards, s); console.log('index-cards.html: stale TODO(build) rename note removed'); }
  else console.log('index-cards.html: no stale note found');
}

/* the same note also survives inside the article drafts */
const dir = path.join(root, '_build', 'us', 'content', 'blog');
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html') && x !== 'index-cards.html')) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/<!--\s*TODO\(build\)[^>]*?(?:cover images|Rename each)[\s\S]*?-->\s*\r?\n?/g, '');
  for (const [es, en] of Object.entries(SLUGS)) s = s.split('assets/blog/' + es).join('assets/blog/' + en);
  if (s !== before) { fs.writeFileSync(p, s); console.log(`${f}: cleaned`); }
}

/* ------------------------------------------------------------------- gate */
const bad = [];
/* Shipped tree only. _build/ holds tooling and inherited reports (webp-manifest.json,
   i18n-orphans-*.json) that legitimately record the old Spanish names; they are never
   served, so they are not a defect. */
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', '.screenshots', 'node_modules', '_build'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|json|xml)$/.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      for (const es of Object.keys(SLUGS)) {
        if (s.includes(es)) bad.push(`${path.relative(root, p).split(path.sep).join('/')}: still mentions "${es}"`);
      }
    }
  }
})(root);
if (bad.length) { console.error('\nFAIL:\n  ' + [...new Set(bad)].join('\n  ')); process.exit(1); }
console.log('gate: no Spanish blog slug survives anywhere.');
