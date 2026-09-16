/* 22-wire-assets.js — strip the inherited Barcelona analytics and wire the US asset layer
   into every shipped page, at the correct relative depth.

   Why this is not a regen region: regen.mjs owns semantic regions (chrome, prices, SEO,
   JSON-LD). The <head> asset manifest is structural page plumbing, and regen deliberately
   refuses to own it (it warns instead).

   1. REMOVES the hard-coded Google tag for G-1K6FYZ99GN. That is the BARCELONA property.
      Shipping it on the US site would pour US traffic into the Spanish analytics account.
      Analytics now goes through assets/analytics.js, which stays inert until business.js
      has a ga4Id. Note the tag appears in TWO shapes — the service/home pages carry a
      "<!-- Google tag (gtag.js) -->" comment above it, the blog pages do not.
   2. ADDS assets/serres-us.css (the "us-" component stylesheet) after the page's own
      styles, so it extends the inherited design rather than fighting it.
   3. ADDS the data + behaviour scripts in dependency order, all `defer` (which preserves
      execution order): business.js, pricing.js, analytics.js, then the existing
      serres-enhance.js, then quote-form.js and cookie-notice.js.

   IDEMPOTENCE is enforced by REMOVING EVERY reference to the managed assets before
   re-inserting them, rather than by trusting a marker comment to still be there.
   An earlier version only wrapped the head block in a marker, so each run re-appended
   the tail scripts; three runs left six copies of quote-form.js on every page.

   Usage: node _build/us/22-wire-assets.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(root);

const GA_BLOCK = /[ \t]*(?:<!-- Google tag \(gtag\.js\) -->\s*\r?\n[ \t]*)?<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]*"><\/script>\s*\r?\n[ \t]*<script>[\s\S]*?gtag\('config',\s*'[^']*'\);\s*\r?\n[ \t]*<\/script>\r?\n/g;

/* everything this script owns; any existing reference is removed before re-inserting */
const HEAD_SCRIPTS = ['business.js', 'pricing.js', 'analytics.js'];
const TAIL_SCRIPTS = ['quote-form.js', 'cookie-notice.js'];
const MANAGED = HEAD_SCRIPTS.concat(TAIL_SCRIPTS);
const MARK = 'data-us-assets';
const TAIL_MARK = 'data-us-assets-tail';

let changed = 0, strippedGa = 0, removed = 0;

for (const file of pages) {
  const src = fs.readFileSync(file, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const rel = path.relative(root, file).split(path.sep).join('/');
  const depth = rel.split('/').length - 1;          // index.html = 0, about/index.html = 1
  const base = depth === 0 ? 'assets/' : '../'.repeat(depth) + 'assets/';

  let out = src;

  /* 1. strip the Barcelona Google tag */
  const beforeGa = out;
  out = out.replace(GA_BLOCK, '');
  if (out !== beforeGa) strippedGa++;

  /* 2. remove our marker blocks, if present */
  for (const m of [MARK, TAIL_MARK]) {
    out = out.replace(new RegExp('[ \\t]*<!-- ' + m + ' -->\\r?\\n?[\\s\\S]*?<!-- \\/' + m + ' -->\\r?\\n?', 'g'), '');
  }
  /* 3. and remove every stray reference to a managed asset, wherever it ended up */
  for (const s of MANAGED) {
    const re = new RegExp('[ \\t]*<script src="[^"]*assets\\/' + s.replace('.', '\\.') + '"[^>]*><\\/script>\\r?\\n?', 'g');
    const n = (out.match(re) || []).length;
    removed += n;
    out = out.replace(re, '');
  }
  out = out.replace(/[ \t]*<link rel="stylesheet" href="[^"]*assets\/serres-us\.css">\r?\n?/g, '');

  /* 4. insert the head block just before </head> */
  const head = [`<!-- ${MARK} -->`,
    `<link rel="stylesheet" href="${base}serres-us.css">`]
    .concat(HEAD_SCRIPTS.map(s => `<script src="${base}${s}" defer></script>`))
    .concat([`<!-- /${MARK} -->`])
    .join(eol) + eol;
  if (!/<\/head>/i.test(out)) { console.error('no </head> in ' + rel); process.exit(1); }
  out = out.replace(/([ \t]*)<\/head>/i, (m, indent) => head + indent + '</head>');

  /* 5. tail block after serres-enhance.js if present, else before </body> */
  const tail = [`<!-- ${TAIL_MARK} -->`]
    .concat(TAIL_SCRIPTS.map(s => `<script src="${base}${s}" defer></script>`))
    .concat([`<!-- /${TAIL_MARK} -->`])
    .join(eol);
  const enhance = /(<script src="[^"]*serres-enhance\.js" defer><\/script>)/;
  if (enhance.test(out)) out = out.replace(enhance, `$1${eol}${tail}`);
  else out = out.replace(/([ \t]*)<\/body>/i, (m, indent) => tail + eol + indent + '</body>');

  if (out !== src) { fs.writeFileSync(file, out); changed++; }
}

console.log(`${pages.length} page(s) scanned, ${changed} rewritten`);
console.log(`Barcelona Google tag removed from ${strippedGa}; ${removed} pre-existing managed-asset reference(s) cleared before re-inserting`);

/* ------------------------------------------------------------------------ gates */
const problems = [];
for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (s.includes('G-1K6FYZ99GN')) problems.push(`${rel}: Barcelona GA4 property still present`);
  /* Count only real <script src>/<link href> references. Counting every occurrence of
     the string "assets/pricing.js" also counted the TODO(build) comments the blog
     authors wrote, which mention the file by path. */
  for (const a of MANAGED) {
    const n = (s.match(new RegExp('<script[^>]+src="[^"]*assets\\/' + a.replace('.', '\\.') + '"', 'g')) || []).length;
    if (n !== 1) problems.push(`${rel}: <script src=...${a}> appears ${n} time(s), expected exactly 1`);
  }
  const css = (s.match(/<link[^>]+href="[^"]*assets\/serres-us\.css"/g) || []).length;
  if (css !== 1) problems.push(`${rel}: <link ...serres-us.css> appears ${css} time(s), expected exactly 1`);
}
if (problems.length) {
  console.error('\nFAIL:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('gate: no Barcelona GA4 id, and every managed asset referenced exactly once per page.');
