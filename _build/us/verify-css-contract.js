/* verify-css-contract.js — every "us-" class used in the shipped HTML or in the
   partials must actually be styled in assets/serres-us.css, and vice versa.

   The whole "us-" prefix contract exists so independently-written markup and CSS line
   up. They did not: the chrome partials used BEM names (us-trustbar__item) while the
   stylesheet implemented the agreed flat names (us-trust-item), so the trust bar
   shipped as an unstyled <ul> overlapping the header on every page.

   Usage: node _build/us/verify-css-contract.js [siteRoot]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');

const SKIP = new Set(['.git', '.screenshots', 'node_modules', 'assets']);
const html = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name === '_build') { partialsIn(p); continue; } walk(p); }
    else if (e.name.endsWith('.html')) html.push(p);
  }
})(root);
function partialsIn(buildDir) {
  const pd = path.join(buildDir, 'partials');
  if (!fs.existsSync(pd)) return;
  for (const f of fs.readdirSync(pd)) if (f.endsWith('.html')) html.push(path.join(pd, f));
}

/* classes USED in markup */
const used = new Map();   // class -> Set(file)
for (const f of html) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).split(path.sep).join('/');
  for (const m of s.matchAll(/class="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) {
      if (!c.startsWith('us-')) continue;
      if (!used.has(c)) used.set(c, new Set());
      used.get(c).add(rel);
    }
  }
}

/* Classes DEFINED — in the shared stylesheet AND in each page's own inline <style>.
   Page-specific "us-<page>-" classes are supposed to live in the page's inline block
   (a page author may not edit the shared file), so reading only serres-us.css reported
   the whole gallery filter as unstyled when it was styled correctly. */
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '');   // so prose in comments can't count
let css = strip(fs.readFileSync(path.join(root, 'assets', 'serres-us.css'), 'utf8'));
for (const f of html) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    css += '\n' + strip(m[1]);
  }
}
const defined = new Set([...css.matchAll(/\.(us-[A-Za-z0-9_-]+)/g)].map(m => m[1]));

const undefinedClasses = [...used.keys()].filter(c => !defined.has(c)).sort();
const unusedClasses = [...defined].filter(c => !used.has(c)).sort();

console.log(`markup uses ${used.size} "us-" classes; stylesheet defines ${defined.size}`);

if (undefinedClasses.length) {
  console.error(`\n${undefinedClasses.length} class(es) USED IN MARKUP BUT NOT STYLED — these render unstyled:`);
  for (const c of undefinedClasses) {
    const where = [...used.get(c)];
    console.error(`  .${c}  (${where.length} file(s), e.g. ${where[0]})`);
  }
}
if (unusedClasses.length) {
  console.log(`\n${unusedClasses.length} class(es) styled but never used (harmless, but likely a naming mismatch):`);
  unusedClasses.forEach(c => console.log('  .' + c));
}

if (undefinedClasses.length) process.exit(1);
console.log('\nCSS contract holds: every "us-" class in the markup is styled.');
