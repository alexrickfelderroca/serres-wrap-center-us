/* One-shot: harden _build/screenshots.js so a capture that rendered a browser
   error page instead of the site FAILS the run instead of reporting hscroll=none.
   (The 00-baseline-es run captured 32 identical 404 pages and reported success.) */
'use strict';
const fs = require('fs');
const P = '_build/screenshots.js';
let s = fs.readFileSync(P, 'utf8');
const orig = s;

const OVERFLOW = "      const overflow = await page.evaluate('({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})');";
const PROBE = [
  OVERFLOW,
  '      // Guard against silently capturing a 404 / error page: every real page of this site has a',
  '      // <footer>, a non-empty <title> and substantial body text. Without this probe the run',
  '      // cheerfully reports hscroll=none for a browser error page.',
  '      const loaded = await page.evaluate(\'({t:document.title||"",f:!!document.querySelector("footer"),n:(document.body?document.body.innerText.length:0)})\');',
  '      const ok = loaded.f && loaded.t.length > 0 && loaded.n > 400;',
].join('\n');
if (!s.includes(OVERFLOW)) throw new Error('anchor 1 (overflow) not found');
s = s.split(OVERFLOW).join(PROBE);

const PUSH = '      results.push({ page: rel, viewport: vp, file: path.basename(file), horizontalScroll:';
if (!s.includes(PUSH)) throw new Error('anchor 2 (results.push) not found');
s = s.split(PUSH).join('      results.push({ ok, title: loaded.t, textLen: loaded.n, page: rel, viewport: vp, file: path.basename(file), horizontalScroll:');

const LOG = '      console.log(`${vp.padEnd(7)}';
if (!s.includes(LOG)) throw new Error('anchor 3 (console.log) not found');
s = s.split(LOG).join('      console.log(`${ok ? "ok  " : "FAIL"} ${vp.padEnd(7)}');

const WRITE = '  fs.writeFileSync(path.join(OUT, `pass-${PASS}-${LANG}-${stamp}.json`), JSON.stringify(results, null, 1));';
if (!s.includes(WRITE)) throw new Error('anchor 4 (writeFileSync) not found');
s = s.split(WRITE).join([
  WRITE,
  '  const bad = results.filter(r => !r.ok);',
  '  if (bad.length) {',
  "    console.error('\\n' + bad.length + ' of ' + results.length + ' captures did NOT render the site (browser error page or empty document):');",
  "    bad.forEach(b => console.error('  ' + b.viewport + ' ' + b.page + '  title=' + JSON.stringify(b.title) + ' textLen=' + b.textLen));",
  "    console.error('Those PNGs are worthless as evidence. Fix the cause and re-run.');",
  '    process.exit(3);',
  '  }',
  "  console.log('\\nall ' + results.length + ' captures rendered the site.');",
].join('\n'));

if (s === orig) throw new Error('no change made');
fs.writeFileSync(P, s);
console.log('screenshots.js hardened (load probe + non-zero exit on any failed capture)');
