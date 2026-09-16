/* 34-main-landmark.js — give every page exactly one <main> landmark.

   Lighthouse flags "landmark-one-main" sitewide: the inherited Barcelona markup went
   straight from </header> to <section>, with no <main>. That is the single accessibility
   failure left on the home page (98 instead of 100), and it matters for real screen-reader
   users, who use the main landmark to skip the nav.

   Where <main> goes, so it is the same on every page:
     opens right after  <!-- /REGION:trustbar -->   (or after </header> if there is no trust bar)
     closes right before <!-- REGION:ctaband -->    (or before the footer region / <footer>)
   That puts the page's own content inside and leaves the generated chrome outside, which
   is what the landmark is for.

   Idempotent: a page that already has a <main> is left alone.
   Usage: node _build/us/34-main-landmark.js [siteRoot]
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

const OPENERS = ['<!-- /REGION:trustbar -->', '</header>'];
const CLOSERS = ['<!-- REGION:ctaband -->', '<!-- REGION:footer -->', '<footer'];

let added = 0, already = 0, failed = [];

for (const file of pages) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  let s = fs.readFileSync(file, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';

  /* Strip comments before counting. contact/index.html carries a comment that MENTIONS
     </main> ("the generated terms strip sits INSIDE <main>…"), and counting that
     reported a second landmark which does not exist. */
  const stripComments = t => t.replace(/<!--[\s\S]*?-->/g, '');
  const existing = (stripComments(s).match(/<main\b/gi) || []).length;
  if (existing === 1) { already++; continue; }
  if (existing > 1) { failed.push(`${rel}: ${existing} <main> elements — a page may have only one`); continue; }

  const open = OPENERS.find(o => s.includes(o));
  if (!open) { failed.push(`${rel}: no anchor to open <main> after`); continue; }
  const openAt = s.indexOf(open) + open.length;

  const closeTok = CLOSERS.find(c => s.indexOf(c, openAt) !== -1);
  if (!closeTok) { failed.push(`${rel}: no anchor to close <main> before`); continue; }
  const closeAt = s.indexOf(closeTok, openAt);

  s = s.slice(0, openAt) + eol + '<main id="main">' + s.slice(openAt, closeAt) + '</main>' + eol + s.slice(closeAt);
  fs.writeFileSync(file, s);
  added++;
  console.log(`${rel.padEnd(46)} <main> added`);
}

console.log(`\n${added} page(s) given a <main>, ${already} already had one`);

/* gate */
const bad = [];
for (const f of pages) {
  const n = (fs.readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '').match(/<main\b/gi) || []).length;
  if (n !== 1) bad.push(`${path.relative(root, f).split(path.sep).join('/')}: ${n} <main> element(s)`);
}
if (failed.length || bad.length) {
  console.error('\nFAIL:\n  ' + failed.concat(bad).join('\n  '));
  process.exit(1);
}
console.log('gate: every page has exactly one <main> landmark.');
