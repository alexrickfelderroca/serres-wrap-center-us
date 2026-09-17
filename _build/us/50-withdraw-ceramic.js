/* 50-withdraw-ceramic.js — STAGE 1 of withdrawing Ceramic Coating as a service.

   The owner decided on 2026-09-17 to withdraw ceramic coating from the site entirely.
   A map of the whole repo found 234 touchpoints across 54 files. This script does the
   SOURCE edits — the ones that cascade through _build/regen.mjs into all 24 pages. The
   hand-written page markup is stage 2 (51-*.js); the gates are what prove stage 2 is
   complete, because verify-prices.mjs fails on any leftover ceramic price token.

   THE DISTINCTION THIS SCRIPT IS BUILT AROUND, and the reason none of it is a regex
   sweep for the word "ceramic":

     CERAMIC COATING  = the withdrawn service. Liquid SiO2 cured onto paint or film.
     CERAMIC FILM     = window tint. A DIFFERENT PRODUCT, staying. The tint SKU is
                        literally "Full Car — Ceramic Film" at $500 and /window-tint
                        carries ~39 instances of the word, nearly all of them this.

   The sharpest edge in the whole site is 404.html: two adjacent service cards, "Ceramic
   Coating" and "Window Tint — Ceramic IR-rejecting film", distinguishable only by their
   href. Any sweep for the word destroys the tint product.

   ORDER MATTERS, and getting it wrong un-does the work silently:
     1. The blog SLUGS entry goes FIRST. _build/us/30-install-blog.js rewrites
        blog/ppf-vs-ceramic-coating/index.html from its source on every build, with no
        existence check on the destination. Delete the shipped article and leave the
        slug, and the next `node _build/us/build.js` puts it straight back.
     2. Delete the slug but not the source and it is worse: nothing breaks. Delete the
        SOURCE but not the slug and the script's own `process.exit(1)` stops the whole
        pipeline before regen ever runs.
     3. The three sibling articles are also re-stamped from source, so every blog edit
        is made in _build/us/content/blog/, never in the shipped file.

   THE PACKAGES ARE NOT DELETED, they are unpublished. All three bundles include ceramic
   coating (Daily Driver $1,990, New Car $2,990, Collector $5,990) and their prices were
   set with it in them. A new price may not be invented on this project, so they go
   published:false — the idiom this file already uses for Phase 2 items. They vanish from
   /pricing, from the JSON-LD OfferCatalog and from the quote form automatically, because
   everything reads through P.published(). The data and the old prices stay as a record,
   and one flag brings them back when the owner supplies new ones. TODO item 46.

   Usage: node _build/us/50-withdraw-ceramic.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = new Map();
const log = [];

const read = (rel) => {
  if (!files.has(rel)) files.set(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  return files.get(rel);
};
const put = (rel, s) => files.set(rel, s);

function cut(rel, label, needle) {
  const s = read(rel);
  const i = s.indexOf(needle);
  if (i < 0) throw new Error(`NOT FOUND in ${rel} (${label}):\n---\n${needle.slice(0, 200)}\n---`);
  if (s.indexOf(needle, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label})`);
  put(rel, s.slice(0, i) + s.slice(i + needle.length));
  log.push(`  cut      ${rel}  ${label}`);
}

function swap(rel, label, from, to) {
  const s = read(rel);
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`NOT FOUND in ${rel} (${label}):\n---\n${from.slice(0, 200)}\n---`);
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label})`);
  put(rel, s.slice(0, i) + to + s.slice(i + from.length));
  log.push(`  rewrote  ${rel}  ${label}`);
}

function swapAll(rel, label, from, to) {
  const s = read(rel);
  if (!s.includes(from)) throw new Error(`NOT FOUND in ${rel} (${label}): ${from.slice(0, 120)}`);
  const n = s.split(from).length - 1;
  put(rel, s.split(from).join(to));
  log.push(`  rewrote  ${rel}  ${label}  (${n}x)`);
}

function drop(rel, label) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`NOT FOUND, cannot delete: ${rel}`);
  fs.rmSync(abs, { recursive: true, force: true });
  log.push(`  deleted  ${rel}  ${label}`);
}

/* ═══════════════ 1. BLOG INSTALLER — first, or the article comes back ═══════════════ */

cut('_build/us/30-install-blog.js', 'SLUGS entry for the ceramic article',
  "  'ppf-o-ceramico-que-elegir': 'ppf-vs-ceramic-coating',\n");
cut('_build/us/33-fix-blog-slug-refs.js', 'second SLUGS map entry',
  "  'ppf-o-ceramico-que-elegir': 'ppf-vs-ceramic-coating',\n");

/* ═══════════════════════════ 2. PRICE DATA ═══════════════════════════ */

const PR = 'assets/pricing.js';
cut(PR, 'P.CERAMIC — the two withdrawn SKUs',
  '  /* ------------------------------------------------------------------ ceramic */\n' +
  '  P.CERAMIC = [\n' +
  "    { id: 'ceramic-3yr', name: '3-Year Ceramic Package', price: 1200, from: true, published: true,\n" +
  "      coverage: 'Decon, single-stage gloss prep, coating, cure' },\n" +
  "    { id: 'ceramic-topup', name: 'Top-up over PPF / wrap', price: 600, from: true, published: true,\n" +
  "      coverage: 'Ceramic applied over fresh film — hydrophobics without touching the paint' }\n" +
  '  ];\n\n');

swap(PR, 'P.GROUPS — drop the ceramic group',
  "  P.GROUPS = ['ppf', 'wraps', 'ceramic', 'tint', 'detailing', 'packages', 'phase2'];",
  "  P.GROUPS = ['ppf', 'wraps', 'tint', 'detailing', 'packages', 'phase2'];");
cut(PR, 'P.GROUP_LABELS.ceramic', "    ceramic: 'Ceramic Coating',\n");
cut(PR, 'P.GROUP_ROUTES.ceramic', "    ceramic: 'ceramic-coating',\n");
swap(PR, 'P.groups() — drop the ceramic registry entry',
  '      ppf: P.PPF, wraps: P.WRAPS, ceramic: P.CERAMIC, tint: P.TINT,',
  '      ppf: P.PPF, wraps: P.WRAPS, tint: P.TINT,');

/* The bundles: unpublished, not deleted. See the header. */
swap(PR, 'P.PACKAGES — unpublish all three, with the reason in place',
  '  /* ----------------------------------------------------------------- packages */\n' +
  '  P.PACKAGES = [\n' +
  "    { id: 'daily-driver', name: 'Daily Driver',\n" +
  "      includes: 'Partial front PPF + ceramic', price: 1990, published: true },\n" +
  "    { id: 'new-car', name: 'New Car',\n" +
  "      includes: 'Full front PPF + ceramic + tint', price: 2990, published: true, popular: true },\n" +
  "    { id: 'collector', name: 'Collector',\n" +
  "      includes: 'Full body PPF + ceramic', price: 5990, published: true }\n" +
  '  ];',
  '  /* ----------------------------------------------------------------- packages\n' +
  '     UNPUBLISHED 2026-09-17, not deleted. Every one of these bundles ceramic coating,\n' +
  '     and ceramic coating was withdrawn as a service. Their prices were set with it in\n' +
  '     them, so they cannot simply drop the line and keep the number, and a new price may\n' +
  '     not be invented here. published:false takes them off /pricing, out of the JSON-LD\n' +
  "     OfferCatalog and out of the quote form on its own, because everything reads through\n" +
  '     P.published(). The old contents and prices stay as the record of what was offered.\n' +
  '     Flip published back to true once the owner supplies the new bundles. TODO item 46. */\n' +
  '  P.PACKAGES = [\n' +
  "    { id: 'daily-driver', name: 'Daily Driver',\n" +
  "      includes: 'Partial front PPF + ceramic', price: 1990, published: false },\n" +
  "    { id: 'new-car', name: 'New Car',\n" +
  "      includes: 'Full front PPF + ceramic + tint', price: 2990, published: false, popular: true },\n" +
  "    { id: 'collector', name: 'Collector',\n" +
  "      includes: 'Full body PPF + ceramic', price: 5990, published: false }\n" +
  '  ];');

/* ═══════════════════════════ 3. SITE CHROME ═══════════════════════════ */

cut('_build/partials/header.html', 'desktop Services dropdown link',
  '          <a class="us-nav__panel-link" href="{{rel:ceramic-coating/}}">Ceramic Coating</a>\n');
cut('_build/partials/header.html', 'mobile menu link',
  '          <a class="us-nav__mobile-link" href="{{rel:ceramic-coating/}}">Ceramic Coating</a>\n');
cut('_build/partials/footer.html', 'footer Services column link',
  '          <a class="us-footer__link" href="{{rel:ceramic-coating/}}">Ceramic Coating</a>\n');
swap('_build/partials/footer.html', 'footer tagline',
  'Paint protection film, wraps, ceramic coating and detailing for South Florida.',
  'Paint protection film, wraps, window tint and detailing for South Florida.');

/* The fourth service list, and the one that breaks silently: this is JavaScript, regen
   never touches it, and it builds the overlay menu that is what actually shows at
   <=760px. verify-links.js cannot see the href because it is assembled from a string. */
cut('assets/serres-enhance.js', 'SERVICES list — the JS-built mobile overlay menu',
  "    { label: 'Ceramic Coating',       slug: 'ceramic-coating' },\n");

swap('assets/quote-form.js', 'quote form group order',
  "    var order = ['packages', 'ppf', 'wraps', 'ceramic', 'tint', 'detailing'];",
  "    var order = ['packages', 'ppf', 'wraps', 'tint', 'detailing'];");

/* ═══════════════════════════ 4. FAQ SOURCES ═══════════════════════════ */
/* Edited in _build/us/faq/*.json — the per-page SOURCES. 32-merge-faq.js rebuilds
   _build/data/faq.json from these on every build, so editing the merged file is undone.
   regen then stamps both the visible FAQ and its JSON-LD twin, which verify-seo.js
   requires to stay byte-identical. */

drop('_build/us/faq/ceramic-coating.json', 'per-page FAQ source for the deleted page');

/* ═══════════════════════════ 5. BLOG SOURCES ═══════════════════════════ */

drop('_build/us/content/blog/ppf-vs-ceramic-coating.html', 'the article source');

/* ═══════════════════════════ 6. SHIPPED TREES ═══════════════════════════ */

drop('ceramic-coating', 'the service page');
drop('blog/ppf-vs-ceramic-coating', 'the shipped article');

/* ═══════════════════════════ write ═══════════════════════════ */
for (const [rel, out] of files) fs.writeFileSync(path.join(ROOT, rel), out);
console.log(log.join('\n'));
files.clear();   /* every check below re-reads the disk */

/* ═══════════════════════════ gates ═══════════════════════════ */

const gone = [
  ['assets/pricing.js', 'P.CERAMIC', 'P.CERAMIC'],
  ['assets/pricing.js', 'ceramic group id', "'ceramic'"],
  ['assets/serres-enhance.js', 'ceramic in the JS service list', 'ceramic-coating'],
  ['assets/quote-form.js', 'ceramic in the group order', "'ceramic'"],
  ['_build/partials/header.html', 'nav links', 'ceramic-coating'],
  ['_build/partials/footer.html', 'footer link and tagline', 'ceramic'],
  ['_build/us/30-install-blog.js', 'blog slug', 'ceramic'],
  ['_build/us/33-fix-blog-slug-refs.js', 'blog slug', 'ceramic'],
];
const left = gone.filter(([f, , n]) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes(n));

/* The KEEP list. A ceramic-TINT reference deleted here is a broken product page, and it
   would look exactly like success. */
const keep = [
  ['assets/pricing.js', 'tint SKU "Full Car — Ceramic Film"', 'Full Car — Ceramic Film'],
  ['assets/pricing.js', 'tint coverage "ceramic IR-rejecting film"', 'ceramic IR-rejecting film'],
  ['assets/pricing.js', 'the tint group', "tint: P.TINT"],
  ['assets/pricing.js', 'the packages, unpublished but present', "id: 'daily-driver'"],
  ['assets/serres-enhance.js', 'Window Tint in the JS service list', 'window-tint'],
];
const lost = keep.filter(([f, , n]) => !fs.readFileSync(path.join(ROOT, f), 'utf8').includes(n));

console.log('');
if (left.length) console.error('FAIL still present:\n' + left.map(([f, w]) => `  ${f}: ${w}`).join('\n'));
if (lost.length) console.error('FAIL removed something that had to stay:\n' + lost.map(([f, w]) => `  ${f}: ${w}`).join('\n'));
if (left.length || lost.length) process.exit(1);

console.log('stage 1 done. Ceramic tint references verified intact.');
console.log('NEXT: node _build/us/51-ceramic-pages.js  then  node _build/us/build.js');
