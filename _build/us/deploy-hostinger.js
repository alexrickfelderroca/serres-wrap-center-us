/* deploy-hostinger.js — upload the shipped site to Hostinger over FTP.

   Uses curl, which is present on Windows 10+ and speaks FTP with --ftp-create-dirs,
   so there is nothing to install and no npm dependency.

   Usage:
     node _build/us/deploy-hostinger.js --host <ftp host> --user <user> --pass <password>
                                        [--dir public_html] [--dry] [--only <substr>]
                                        [--port 21] [--ftps]

   The password is only ever passed to curl for this process. It is NOT written to disk,
   NOT logged, and NOT stored in any project or memory file.

   WHAT IS UPLOADED: the shipped tree only. _build/ (Node tooling and recon notes), .git/,
   .screenshots/ and the internal .md files stay local — they are not part of the website,
   and _build in particular contains working notes that should not be public.
   .htaccess IS uploaded; it carries the HTTPS redirect, 404, caching and MIME rules.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const flag = n => argv.includes('--' + n);

const ROOT = path.resolve(__dirname, '..', '..');
const HOST = opt('host');
const USER = opt('user');
const PASS = opt('pass');
const PORT = opt('port', '21');
const REMOTE = opt('dir', 'public_html').replace(/^\/+|\/+$/g, '');
const DRY = flag('dry');
const LIST = flag('list');
const ONLY = opt('only', '');
const SCHEME = flag('ftps') ? 'ftps' : 'ftp';

if (!DRY && (!HOST || !USER || !PASS)) {
  console.error('usage: node _build/us/deploy-hostinger.js --host H --user U --pass P [--dir public_html] [--dry] [--list]');
  process.exit(2);
}

/* --list: show what is on the server WITHOUT uploading anything.
   On a Hostinger plan with several domains the main site lives in public_html/ and the
   others in domains/<domain>/public_html/. Sending 72 MB to the wrong one is not
   something to discover afterwards, so look first. */
if (LIST) {
  const probe = (p) => {
    try {
      const out = execFileSync('curl', [
        '--silent', '--show-error', '--fail', '--ftp-pasv',
        '--connect-timeout', '25', '--max-time', '60',
        '--user', `${USER}:${PASS}`,
        `${SCHEME}://${HOST}:${PORT}/${p}`,
      ], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
      return out.trim().split('\n').filter(Boolean);
    } catch (e) {
      return null;
    }
  };
  for (const p of ['', 'public_html/', 'domains/', `domains/${opt('domain', 'serreswrapcenter.com')}/`,
                   `domains/${opt('domain', 'serreswrapcenter.com')}/public_html/`]) {
    const rows = probe(p);
    console.log(`\n/${p}`);
    if (rows === null) { console.log('   (not readable / does not exist)'); continue; }
    if (!rows.length) { console.log('   (empty)'); continue; }
    rows.slice(0, 25).forEach(r => console.log('   ' + r));
    if (rows.length > 25) console.log(`   … ${rows.length - 25} more`);
  }
  console.log('\n--list: nothing uploaded. Re-run with --dir <the right path> to deploy.');
  process.exit(0);
}

/* ---------------------------------------------------------------- selection */
const SKIP_DIRS = new Set(['_build', '.git', '.screenshots', 'node_modules', '.vscode', '.claude']);
const SKIP_FILES = new Set(['.gitignore', '.gitattributes', '.nojekyll', 'CLAUDE.md', 'README.md', 'TODO.md']);
const SKIP_EXT = new Set(['.md', '.bak']);

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { walk(abs); continue; }
    if (SKIP_FILES.has(e.name)) continue;
    if (SKIP_EXT.has(path.extname(e.name).toLowerCase())) continue;
    files.push(abs);
  }
})(ROOT);

let selected = files.map(f => ({
  abs: f,
  rel: path.relative(ROOT, f).split(path.sep).join('/'),
  size: fs.statSync(f).size,
}));
if (ONLY) selected = selected.filter(f => f.rel.includes(ONLY));
selected.sort((a, b) => a.rel.localeCompare(b.rel));

const total = selected.reduce((n, f) => n + f.size, 0);
console.log(`${selected.length} file(s), ${(total / 1048576).toFixed(1)} MB -> ${SCHEME}://${HOST || '<host>'}/${REMOTE}/`);
console.log(`excluded: ${[...SKIP_DIRS].join(' ')} and ${[...SKIP_FILES].join(' ')}`);

if (DRY) {
  const byDir = {};
  for (const f of selected) {
    const d = f.rel.includes('/') ? f.rel.split('/').slice(0, -1).join('/') : '(root)';
    byDir[d] = (byDir[d] || 0) + 1;
  }
  Object.keys(byDir).sort().forEach(d => console.log(`  ${String(byDir[d]).padStart(4)}  ${d}`));
  console.log('\n--dry: nothing uploaded');
  process.exit(0);
}

/* ------------------------------------------------------------------ upload */
/* A domain-scoped Hostinger FTP account (user "uNNNNNNNN.<domain>") already lands INSIDE
   that site's public_html, so there is no public_html/ to descend into — the listing at /
   shows default.php directly. Pass --dir "" in that case; an empty REMOTE must not
   produce a double slash. */
const base = REMOTE ? `${SCHEME}://${HOST}:${PORT}/${REMOTE}/` : `${SCHEME}://${HOST}:${PORT}/`;
let done = 0, bytes = 0, failed = [];
const started = Date.now();

for (const f of selected) {
  const url = base + f.rel;
  try {
    execFileSync('curl', [
      '--silent', '--show-error', '--fail',
      '--ftp-create-dirs',
      '--ftp-pasv',
      '--connect-timeout', '30',
      '--max-time', '300',
      '--user', `${USER}:${PASS}`,
      '--upload-file', f.abs,
      url,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    done++; bytes += f.size;
  } catch (e) {
    const msg = ((e.stderr || '') + '').trim().split('\n').pop() || 'curl failed';
    failed.push(`${f.rel}: ${msg}`);
  }
  if ((done + failed.length) % 20 === 0 || done + failed.length === selected.length) {
    const pct = Math.round(((done + failed.length) / selected.length) * 100);
    process.stdout.write(`\r  ${pct}%  ${done + failed.length}/${selected.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
  }
}
process.stdout.write('\n');

const secs = ((Date.now() - started) / 1000).toFixed(0);
console.log(`\nuploaded ${done} file(s), ${(bytes / 1048576).toFixed(1)} MB in ${secs}s`);

if (failed.length) {
  console.error(`\n${failed.length} file(s) FAILED:`);
  failed.slice(0, 30).forEach(f => console.error('  ' + f));
  if (failed.length > 30) console.error(`  … and ${failed.length - 30} more`);
  console.error('\nA partial upload leaves the site inconsistent. Fix the cause and re-run;');
  console.error('the script overwrites, so a re-run is safe.');
  process.exit(1);
}
console.log('all files uploaded.');
