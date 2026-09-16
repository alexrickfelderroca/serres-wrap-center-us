/* run.js — rebuild the Miami site from the Barcelona source, reproducibly.
   Usage:
     node run.js --src "<Barcelona V12 root>" --dest "<Miami root>" [--upto NN] [--skip-copy] [--only NN]
   Pipeline:
     0. clean copy of the source into dest (brief exclusions + the unreferenced _build/agg-report.json)
     1. install the port tooling into dest/_build and dest/_build/port
     2. node _build/i18n-port.js transform      (inline Spanish -> English dictionary keys, alt/og/twitter included)
     3. node _build/port-i18n-runtime.js         (EN base, EN->ES forward, no INV, no Catalan, alt translated)
     4. every dest/_build/port/NN-*.js step in numeric order (each receives the site root)
   The source tree is never written to.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const flag = n => args.includes('--' + n);
const SRC = opt('src'); const DEST = opt('dest');
if (!SRC || !DEST) { console.error('usage: node run.js --src <barcelonaRoot> --dest <miamiRoot> [--upto NN] [--only NN] [--skip-copy]'); process.exit(2); }
const UPTO = parseInt(opt('upto', '999'), 10);
const ONLY = opt('only', null);
const TOOLS = path.resolve(__dirname, '..');          // scratchpad/tools during development; dest/_build after install

const EXCLUDE_DIRS = new Set(['.git', 'uploads', 'scraps', 'screenshots', '.screenshots', 'frames', 'node_modules']);
const EXCLUDE_FILES = new Set(['PPF - Phone.html', 'SERRES - Phone.html', 'tweaks-panel.jsx', 'image-slot.js']);
const EXCLUDE_PATHS = new Set([
  path.join('_build', 'agg-report.json'),            // stale SEO build artifact, 118 lines of Barcelona copy, referenced by nothing
  path.join('_build', 'optimize-porsche-gallery.js'), // one-off script that reads the excluded uploads/ folder
]);

function copyTree() {
  if (path.resolve(DEST).startsWith(path.resolve(SRC))) throw new Error('dest inside src — refusing');
  let files = 0, bytes = 0;
  (function rec(rel) {
    const from = path.join(SRC, rel);
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) { if (EXCLUDE_DIRS.has(e.name)) continue; fs.mkdirSync(path.join(DEST, r), { recursive: true }); rec(r); }
      else { if (EXCLUDE_FILES.has(e.name) || EXCLUDE_PATHS.has(r)) continue; fs.mkdirSync(path.join(DEST, rel), { recursive: true }); fs.copyFileSync(path.join(SRC, r), path.join(DEST, r)); files++; bytes += fs.statSync(path.join(SRC, r)).size; }
    }
  })('');
  console.log(`copied ${files} files, ${(bytes / 1048576).toFixed(1)} MB -> ${DEST}`);
}

function installTools() {
  const b = path.join(DEST, '_build'); fs.mkdirSync(path.join(b, 'port'), { recursive: true });
  for (const f of ['i18n-port.js', 'i18n-orphans.js', 'i18n-allowlist.txt', 'i18n-en-only.txt', 'port-i18n-runtime.js', 'headless.js', 'verify-parity.js', 'screenshots.js', 'count-terms.js']) {
    const s = path.join(TOOLS, f); if (fs.existsSync(s)) fs.copyFileSync(s, path.join(b, f));
  }
  for (const f of fs.readdirSync(__dirname)) if (/\.(js|json|txt|html)$/.test(f)) fs.copyFileSync(path.join(__dirname, f), path.join(b, 'port', f));
  // content authored for the port (blog articles, legal pages) lives in port/content/
  const content = path.join(__dirname, 'content');
  if (fs.existsSync(content)) fs.cpSync(content, path.join(b, 'port', 'content'), { recursive: true });
  console.log('tooling installed in', b);
}

function run(script, ...a) {
  console.log('\n▶ ' + path.relative(DEST, script) + ' ' + a.join(' '));
  execFileSync(process.execPath, [script, ...a], { stdio: 'inherit', cwd: DEST });
}

if (!flag('skip-copy')) { copyTree(); }
installTools();
if (!ONLY) {
  if (UPTO >= 10) run(path.join(DEST, '_build', 'i18n-port.js'), 'transform', DEST, DEST);
  if (UPTO >= 20) run(path.join(DEST, '_build', 'port-i18n-runtime.js'), DEST);
}
const steps = fs.readdirSync(path.join(DEST, '_build', 'port')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
for (const s of steps) {
  const n = parseInt(s.slice(0, 2), 10);
  if (ONLY ? s.startsWith(ONLY) : n <= UPTO) run(path.join(DEST, '_build', 'port', s), DEST);
}
console.log('\ndone.');
