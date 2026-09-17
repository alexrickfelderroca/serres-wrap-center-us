/* verify-ceramic-withdrawn.js — ceramic coating stays withdrawn, ceramic TINT stays.

   Two failures are possible here and both are silent:
     a ceramic-COATING leftover republishes a service the shop does not sell;
     a ceramic-TINT reference deleted by an over-eager sweep breaks the tint product,
     which is a real service with a real published price.

   So this gate does not grep for "ceramic". It classifies every occurrence by the noun
   that follows it, prints the tint ones so they can be eyeballed, and fails only on the
   coating ones. The rule is the same one the removal was built on:

     ceramic film / ceramic window tint / ceramic IR / ceramic infrared  -> TINT, keep
     everything else                                                    -> COATING, fail

   Two allowances, both deliberate and both named rather than pattern-matched:
     window-tint/index.html  — its FAQ says "the one tint we fit is ceramic", which no
                               "ceramic <noun>" rule can match and which is plainly tint.
     assets/pricing.js       — the unpublished wheels-off item "rim ceramic + caliper
                               paint" is wheel coating, a different surface, and it has
                               published:false so it renders nowhere. TODO item 48.

   Usage: node _build/us/verify-ceramic-withdrawn.js [root]
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const SKIP = new Set(['_build', '.git', '.screenshots', 'node_modules']);
const TINT = /ceramic[\s-]*(film|window tint|tint|ir\b|infrared)/i;

const targets = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|json|xml)$/.test(e.name)) targets.push(p);
  }
})(ROOT);
targets.sort();

const EXEMPT_FILE = new Set([
  /* its FAQ says "the one tint we fit is ceramic" — plainly the film, unmatchable by rule */
  'window-tint/index.html',
  /* The EN->ES dictionary is NOT LOADED by any page (serres-us.css and the enhance script
     never pull it in; Spanish is deferred to December, spec 6.13). It still carries the
     Barcelona site's ceramic copy AND euro prices, so it ships to nobody and describes a
     different market. It must be cleaned before /es is ever switched on — TODO item 49. */
  'assets/serres-i18n.js',
]);

const EXEMPT_LINE = [
  /* wheels-off rim coating: a different surface, and published:false so it renders
     nowhere. Kept rather than deleted, because withdrawing paint coating does not
     obviously withdraw wheel coating. TODO item 48. */
  /rim ceramic \+ caliper paint/i,
  /* assets/pricing.js keeps the three bundles as published:false with their original
     'includes' strings, as the record of what was offered. The comment above them
     explains the withdrawal, so it mentions it too. Neither renders. */
  /published: false/,
  /^\s*(UNPUBLISHED 2026-09-17|and ceramic coating was withdrawn)/,
  /* per-page CSS-prefix doc comments naming the old file as a convention example
     ("Same convention as 'cc-' on ceramic-coating/index.html"). They document a naming
     rule, not a service, and they are HTML comments. Cosmetic; TODO item 50. */
  /"cc-"|prefix on ceramic-coating|\/ceramic-coating and "ab-"|Same convention as/,
  /^\s*ceramic-coating\/index\.html\.$/,
];

let coating = 0, tint = 0;
const report = [];
for (const p of targets) {
  const rel = path.relative(ROOT, p).split(path.sep).join('/');
  if (EXEMPT_FILE.has(rel)) continue;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  lines.forEach((l, i) => {
    if (!/ceramic/i.test(l)) return;
    if (TINT.test(l) || EXEMPT_LINE.some(re => re.test(l))) { tint++; return; }
    coating++;
    report.push(`  ${rel}:${i + 1}  ${l.trim().slice(0, 120)}`);
  });
}

/* the page and the article really are gone */
for (const gone of ['ceramic-coating/index.html', 'blog/ppf-vs-ceramic-coating/index.html']) {
  if (fs.existsSync(path.join(ROOT, gone))) { coating++; report.push(`  ${gone} still exists`); }
}
/* and cannot come back on the next build */
const installer = fs.readFileSync(path.join(ROOT, '_build', 'us', '30-install-blog.js'), 'utf8');
if (installer.includes('ppf-vs-ceramic-coating')) {
  coating++;
  report.push('  _build/us/30-install-blog.js still lists the article — the next build would recreate it');
}

console.log(`${targets.length} files scanned; ${tint} ceramic-TINT reference(s) kept.`);
if (coating) {
  console.error(`\nFAIL ${coating} ceramic-coating reference(s):`);
  report.forEach(r => console.error(r));
  process.exit(1);
}
console.log('ceramic coating is withdrawn everywhere; ceramic tint is untouched.');
