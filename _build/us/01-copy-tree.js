/* 01-copy-tree.js — copy the Barcelona V12 site into the US root.
   The source tree is NEVER written to.
   Usage: node _build/us/01-copy-tree.js --src "<V12 root>" --dest "<US root>"
*/
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const SRC = opt('src'); const DEST = opt('dest');
if (!SRC || !DEST) { console.error('usage: node 01-copy-tree.js --src <v12> --dest <usroot>'); process.exit(2); }

// Exclusions inherited from _build/port/run.js (same brief), plus _build which is
// merged separately so the port tooling already living in DEST/_build is not clobbered.
const EXCLUDE_DIRS = new Set(['.git', 'uploads', 'scraps', 'screenshots', '.screenshots', 'frames', 'node_modules', '_build']);
const EXCLUDE_FILES = new Set(['PPF - Phone.html', 'SERRES - Phone.html', 'tweaks-panel.jsx', 'image-slot.js']);
// V12/_build files that must NOT come across (stale Barcelona artefacts / one-off scripts)
const BUILD_EXCLUDE = new Set(['agg-report.json', 'optimize-porsche-gallery.js']);

if (path.resolve(DEST).startsWith(path.resolve(SRC) + path.sep)) throw new Error('dest inside src — refusing');
if (path.resolve(SRC).startsWith(path.resolve(DEST) + path.sep)) throw new Error('src inside dest — refusing');

let files = 0, bytes = 0, skipped = 0;
(function rec(rel) {
  for (const e of fs.readdirSync(path.join(SRC, rel), { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) { skipped++; continue; }
      fs.mkdirSync(path.join(DEST, r), { recursive: true });
      rec(r);
    } else {
      if (EXCLUDE_FILES.has(e.name)) { skipped++; continue; }
      fs.mkdirSync(path.join(DEST, rel), { recursive: true });
      fs.copyFileSync(path.join(SRC, r), path.join(DEST, r));
      files++; bytes += fs.statSync(path.join(SRC, r)).size;
    }
  }
})('');

// merge V12/_build -> DEST/_build (no collisions with the port tooling; verified before writing)
const sb = path.join(SRC, '_build');
if (fs.existsSync(sb)) {
  for (const f of fs.readdirSync(sb)) {
    if (BUILD_EXCLUDE.has(f)) { skipped++; continue; }
    const dst = path.join(DEST, '_build', f);
    if (fs.existsSync(dst)) { console.log('  ! collision, kept DEST copy:', f); skipped++; continue; }
    fs.copyFileSync(path.join(sb, f), dst);
    files++; bytes += fs.statSync(path.join(sb, f)).size;
  }
}

console.log(`copied ${files} files, ${(bytes / 1048576).toFixed(1)} MB -> ${DEST}  (skipped ${skipped})`);
