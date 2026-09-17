/* 30-install-blog.js — install the 4 rewritten English articles over the Spanish ones.

   The shipped blog/ is still the Barcelona Spanish version: EUR prices, IVA clauses,
   DGT/ITV content and the old Refresh/Deep/Showroom tiers. It cannot be translated,
   only replaced. The replacements live in _build/us/content/blog/ and were rewritten
   onto the US SKU model.

   Does four things, idempotently:
     1. renames assets/blog/<spanish-slug>/ -> assets/blog/<english-slug>/
        (10 cover.webp / og.jpg references would otherwise 404)
     2. normalises every asset reference in the articles to the English slug
     3. copies the articles into blog/<english-slug>/index.html
     4. swaps the card grid in blog/index.html for the regenerated cards

   Afterwards you MUST run, in this order:
     node _build/us/31-price-tokens.js .     resolve {{PRICE}} / {{STARTING}} / {{PERMONTH}}
     node _build/regen.mjs                   re-insert the chrome/SEO/JSON-LD regions
     node _build/us/22-wire-assets.js .      wire the asset layer at the right depth

   Usage: node _build/us/30-install-blog.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const SRC = path.join(root, '_build', 'us', 'content', 'blog');

/* Spanish asset folder -> English slug. Derived from the route map in 20-restructure.js. */
const SLUGS = {
  'cuanto-cuesta-ppf-coche': 'how-much-does-ppf-cost',
  'cuanto-cuesta-vinilar-un-coche': 'how-much-does-a-car-wrap-cost',
  'limpieza-tapiceria-coche-precio': 'car-upholstery-cleaning-cost',
};

/* ---------------------------------------------- 1. rename the asset folders */
const assetsBlog = path.join(root, 'assets', 'blog');
let renamed = 0;
for (const [es, en] of Object.entries(SLUGS)) {
  const from = path.join(assetsBlog, es), to = path.join(assetsBlog, en);
  if (fs.existsSync(from) && !fs.existsSync(to)) { fs.renameSync(from, to); renamed++; console.log(`assets/blog/${es} -> ${en}`); }
  else if (!fs.existsSync(to)) console.error(`WARN neither assets/blog/${es} nor ${en} exists`);
}
console.log(`asset folders renamed: ${renamed}`);

/* ------------------------------- 2 + 3. normalise refs and install articles */
let installed = 0;
for (const en of Object.values(SLUGS)) {
  const src = path.join(SRC, en + '.html');
  if (!fs.existsSync(src)) { console.error(`MISSING draft ${src}`); process.exit(1); }
  let html = fs.readFileSync(src, 'utf8');

  // any lingering Spanish asset slug -> the English one
  for (const [es, e] of Object.entries(SLUGS)) html = html.split('assets/blog/' + es).join('assets/blog/' + e);

  const destDir = path.join(root, 'blog', en);
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, 'index.html'), html);
  installed++;
  console.log(`blog/${en}/index.html  (${html.split(/\r?\n/).length} lines)`);
}

/* remove the Spanish articles that the restructure moved to the English routes but
   which were never overwritten (they are the same paths, so this is a no-op guard) */

/* -------------------------------------- 4. swap the cards in blog/index.html */
const cardsFile = path.join(SRC, 'index-cards.html');
const indexFile = path.join(root, 'blog', 'index.html');
if (fs.existsSync(cardsFile) && fs.existsSync(indexFile)) {
  const cards = fs.readFileSync(cardsFile, 'utf8').trim();
  let idx = fs.readFileSync(indexFile, 'utf8');
  const eol = idx.includes('\r\n') ? '\r\n' : '\n';
  const MARK = 'us-blog-cards';
  /* index-cards.html holds only the <a class="post-card"> elements, so the inherited
     grid container has to be re-created around them — replacing it along with the cards
     left them as bare anchors inside .wrap and the grid layout collapsed. */
  const block = `<!-- ${MARK} -->${eol}<div class="post-grid us-post-grid" data-i18n-skip>${eol}${cards}${eol}</div>${eol}<!-- /${MARK} -->`;

  const existing = new RegExp('<!-- ' + MARK + ' -->[\\s\\S]*?<!-- \\/' + MARK + ' -->');
  if (existing.test(idx)) {
    idx = idx.replace(existing, block);
    console.log('blog/index.html: cards refreshed');
  } else {
    // first install: replace the inherited grid that holds the 4 Spanish cards.
    // The container is <div class="post-grid" data-i18n-skip> and it closes just before
    // the wrapping </div>. Match to the last </a> and then its own closing tag.
    const grid = /<div class="post-grid"[^>]*>[\s\S]*?<\/a>\s*\r?\n\s*<\/div>/;
    if (!grid.test(idx)) {
      console.error('FAIL could not find the inherited card grid in blog/index.html — not guessing.');
      console.error('     Look for the container holding the 4 article cards and wrap it in');
      console.error(`     <!-- ${MARK} --> ... <!-- /${MARK} --> by hand once.`);
      process.exit(1);
    }
    idx = idx.replace(grid, block + eol);
    console.log('blog/index.html: inherited card grid replaced');
  }
  fs.writeFileSync(indexFile, idx);
}

console.log(`\n${installed} article(s) installed.`);

/* ------------------------------------------------------------------- gates */
const problems = [];
for (const en of Object.values(SLUGS)) {
  const f = path.join(root, 'blog', en, 'index.html');
  const s = fs.readFileSync(f, 'utf8');
  for (const [es] of Object.entries(SLUGS)) if (s.includes(es)) problems.push(`blog/${en}: still references Spanish slug "${es}"`);
  if (/€|\bEUR\b|\bIVA\b/.test(s)) problems.push(`blog/${en}: EUR/IVA leftover`);
  if (/\bMiami\b/.test(s)) problems.push(`blog/${en}: says Miami`);
  for (const m of s.matchAll(/(?:src|href)="([^"]*assets\/blog\/[^"]*)"/g)) {
    const abs = path.resolve(path.dirname(f), m[1]);
    if (!fs.existsSync(abs)) problems.push(`blog/${en}: missing asset ${m[1]}`);
  }
}
if (problems.length) { console.error('\nFAIL:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('gate: no Spanish slugs, no EUR/IVA, no Miami, and every blog asset resolves.');
