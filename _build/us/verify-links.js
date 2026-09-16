/* verify-links.js — every internal href/src in the shipped tree must resolve to a
   real file on disk. Directory routes resolve through <dir>/index.html.
   Exits non-zero on any dangling reference.
   Usage: node _build/us/verify-links.js [siteRoot] [--allow-missing a,b]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.');
const ai = process.argv.indexOf('--allow-missing');
const ALLOW = ai >= 0 ? process.argv[ai + 1].split(',').map(s => s.trim()).filter(Boolean) : [];

const SKIP_DIRS = new Set(['_build', '.git', '.screenshots', 'node_modules']);
const html = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) html.push(p);
  }
})(root);

const posix = p => p.split(path.sep).join('/');
const SKIP = /^(https?:|\/\/|#|mailto:|tel:|sms:|data:|javascript:)/i;
const ATTR = /\b(href|src|srcset|poster)="([^"]+)"/g;

const bad = [], seenOk = new Set();
let checked = 0;

for (const file of html) {
  const fromSite = '/' + posix(path.relative(root, file));
  const src = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = ATTR.exec(src))) {
    const attr = m[1];
    const refs = attr === 'srcset'
      ? m[2].split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean)
      : [m[2]];
    for (const raw of refs) {
      if (SKIP.test(raw)) continue;
      const bare = raw.split('#')[0].split('?')[0];
      if (!bare) continue;
      checked++;
      const abs = bare.startsWith('/')
        ? path.posix.normalize(bare)
        : path.posix.normalize(path.posix.join(path.posix.dirname(fromSite), bare));
      if (ALLOW.some(a => abs.startsWith(a))) continue;
      const disk = path.join(root, abs.slice(1));
      const ok = fs.existsSync(disk) &&
        (fs.statSync(disk).isFile() || fs.existsSync(path.join(disk, 'index.html')));
      if (ok) seenOk.add(abs);
      else bad.push(`${fromSite}  ${attr}="${raw}"  ->  ${abs}`);
    }
  }
}

console.log(`checked ${checked} internal references across ${html.length} pages`);
if (bad.length) {
  console.error(`\n${bad.length} dangling reference(s):`);
  [...new Set(bad)].sort().forEach(b => console.error('  ' + b));
  process.exit(1);
}
console.log('all internal references resolve.');
