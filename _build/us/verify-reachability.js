/* verify-reachability.js — can a visitor (and a crawler) actually GET to every page?

   Spec section 8.4: "no orphan pages (every page reachable <= 2 clicks from home)".
   Emptying the footer removes a lot of site-wide links at once, and an orphaned page is
   invisible: it still returns 200, still passes every other gate, and nobody ever lands
   on it. Only a crawl catches that.

   Breadth-first from index.html, following internal links only.
   Usage: node _build/us/verify-reachability.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SKIP_DIRS = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const all = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) all.push('/' + path.relative(root, p).split(path.sep).join('/'));
  }
})(root);

const SKIP = /^(https?:|\/\/|#|mailto:|tel:|sms:|data:|javascript:)/i;
const NOT_A_PATH = /['"`+]|\$\{|\{\{|<%/;

/* a link target -> the canonical html file it resolves to */
function resolveTo(fromSite, raw) {
  const bare = raw.split('#')[0].split('?')[0];
  if (!bare) return null;
  const abs = path.posix.normalize(bare.startsWith('/') ? bare : path.posix.join(path.posix.dirname(fromSite), bare));
  if (abs.endsWith('.html')) return abs;
  const asDir = (abs.endsWith('/') ? abs : abs + '/') + 'index.html';
  return all.includes(asDir) ? asDir : null;
}

function linksOf(site) {
  const f = path.join(root, site.slice(1));
  if (!fs.existsSync(f)) return [];
  const s = fs.readFileSync(f, 'utf8');
  const out = new Set();
  for (const m of s.matchAll(/\bhref="([^"]+)"/g)) {
    const raw = m[1];
    if (SKIP.test(raw) || NOT_A_PATH.test(raw)) continue;
    const t = resolveTo(site, raw);
    if (t && all.includes(t)) out.add(t);
  }
  return [...out];
}

const START = '/index.html';
const depth = new Map([[START, 0]]);
const queue = [START];
while (queue.length) {
  const cur = queue.shift();
  for (const next of linksOf(cur)) {
    if (!depth.has(next)) { depth.set(next, depth.get(cur) + 1); queue.push(next); }
  }
}

/* Pages that are unlinked BY DESIGN:
     404.html   — the server serves it on a bad URL; nothing ever links to it.
     reserve/   — the Founders Club page is built but deliberately not linked and excluded
                  from the sitemap while business.RESERVE_LIVE is false (spec section 7).
                  It stops being exempt the moment that flag flips. */
const B = require(path.join(root, 'assets', 'business.js'));
const EXEMPT = new Set(['/404.html']);
if (!B.RESERVE_LIVE) EXEMPT.add('/reserve/index.html');

const rows = all.slice().sort();
let orphans = 0, deep = 0;
for (const p of rows) {
  if (EXEMPT.has(p)) { console.log(`  n/a  ${p}  (unlinked by design)`); continue; }
  const d = depth.get(p);
  if (d === undefined) { console.log(`  ORPHAN ${p}`); orphans++; continue; }
  if (d > 2) { console.log(`  ${d} clicks ${p}  (spec wants <= 2)`); deep++; continue; }
  console.log(`  ${d} click${d === 1 ? ' ' : 's'} ${p}`);
}

console.log(`\n${rows.length} pages: ${orphans} orphan(s), ${deep} deeper than 2 clicks`);
if (orphans) { console.error('An orphaned page returns 200 and is still invisible. Link it or delete it.'); process.exit(1); }
if (deep) { console.error('Pages deeper than 2 clicks from home (spec 8.4).'); process.exit(1); }
console.log('every page is reachable within 2 clicks of the home page.');
