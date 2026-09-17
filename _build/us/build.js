/* build.js — the whole US pipeline, in the only order that works.

     node _build/us/build.js            build, then run every gate
     node _build/us/build.js --check    gates only, change nothing
     node _build/us/build.js --no-gates build only

   ORDER MATTERS:
     1  install-blog   English articles over the Spanish ones, asset folders renamed
     2  merge-faq      per-page FAQ files -> the single _build/data/faq.json
     3  regen          chrome, SEO, JSON-LD, FAQ, price regions, sitemap, robots
     4  price-tokens   {{PRICE}}/{{STARTING}}/{{PERMONTH}} in BODY COPY (skips regions)
     5  wire-assets    strip Barcelona GA4, wire css/js at the right relative depth
   regen has to run before the token pass so the regions exist; the token pass masks
   regions so regen --check stays honest afterwards.

   Every step is idempotent: running this twice changes nothing the second time.
*/
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const CHECK = process.argv.includes('--check');
const NO_GATES = process.argv.includes('--no-gates');

const BUILD = [
  ['install the English blog', ['_build/us/30-install-blog.js', '.']],
  ['merge per-page FAQ files', ['_build/us/32-merge-faq.js', '.']],
  ['regenerate regions', ['_build/regen.mjs']],
  ['resolve price tokens', ['_build/us/31-price-tokens.js', '.']],
  ['wire the asset layer', ['_build/us/22-wire-assets.js', '.']],
];

const GATES = [
  ['regions untouched by hand', ['_build/regen.mjs', '--check']],
  ['internal links resolve', ['_build/us/verify-links.js', '.']],
  ['prices trace to pricing.js', ['_build/us/verify-prices.mjs', '.']],
  ['titles / descriptions / h1', ['_build/us/verify-seo-lengths.js', '.']],
  ['every us- class is styled', ['_build/us/verify-css-contract.js', '.']],
  ['no Barcelona leftovers', ['_build/count-terms.js', '.']],
  ['landers unique (spec P3-2)', ['_build/us/verify-landers.js', '.']],
  ['OG, JSON-LD, visible FAQ === schema', ['_build/verify-seo.js']],
  ['no orphan pages (spec 8.4)', ['_build/us/verify-reachability.js', '.']],
  ['owner-marked removals stay removed', ['_build/us/verify-owner-marks.js', '.']],
  ['ceramic withdrawn, ceramic tint kept', ['_build/us/verify-ceramic-withdrawn.js', '.']],
];

function run(label, args) {
  process.stdout.write(`\n── ${label}\n`);
  try {
    const out = execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const lines = out.trim().split('\n');
    console.log('   ' + lines.slice(-3).join('\n   '));
    return true;
  } catch (e) {
    const text = ((e.stdout || '') + (e.stderr || '')).trim();
    console.log('   ' + text.split('\n').slice(-25).join('\n   '));
    console.log(`   >>> FAILED: ${label}`);
    return false;
  }
}

let ok = true;
if (!CHECK) for (const [label, args] of BUILD) ok = run(label, args) && ok;
if (!NO_GATES) {
  console.log('\n══ gates ══');
  const failed = [];
  for (const [label, args] of GATES) if (!run(label, args)) failed.push(label);
  console.log('\n══ summary ══');
  for (const [label] of GATES) console.log(`  ${failed.includes(label) ? 'FAIL' : 'ok  '}  ${label}`);
  if (failed.length) { console.log(`\n${failed.length} gate(s) failing.`); process.exit(1); }
  console.log('\nall gates green.');
}
if (!ok) process.exit(1);
