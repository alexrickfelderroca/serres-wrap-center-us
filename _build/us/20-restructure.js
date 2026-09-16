/* 20-restructure.js — move the Barcelona file tree onto the spec's route table
   and rewrite every internal link to match.

   URL convention (decided in _build/us/recon/PLAN.md D1, amended):
     - extensionless directory routes:  /pricing  ->  pricing/index.html
     - home stays index.html, 404.html stays at the root
     - links are RELATIVE, not root-absolute, so the site works both at a GitHub
       Pages project URL (user.github.io/repo/) and later at serreswrap.com.
       (PLAN D2 proposed root-absolute; that breaks on a project page, and the
       owner chose GitHub Pages with the domain pointed here later.)

   Pages with no home in the spec are not deleted, they are moved to
   _build/us/harvest/ so the agents authoring /about and /detailing can mine them.

   Usage: node _build/us/20-restructure.js <siteRoot> [--dry]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const DRY = process.argv.includes('--dry');

/* old site path -> new site path ('' = harvest only, not shipped) */
const ROUTES = {
  '/index.html': '/index.html',
  '/services/ppf.html': '/paint-protection-film/index.html',
  '/services/vinyl.html': '/car-wraps/index.html',
  '/services/ceramic.html': '/ceramic-coating/index.html',
  '/services/detailing.html': '/detailing/index.html',
  '/pages/prices.html': '/pricing/index.html',
  '/pages/gallery.html': '/gallery/index.html',
  '/pages/why-serres.html': '/about/index.html',
  '/blog/index.html': '/blog/index.html',
  '/blog/cuanto-cuesta-ppf-coche.html': '/blog/how-much-does-ppf-cost/index.html',
  '/blog/cuanto-cuesta-vinilar-un-coche.html': '/blog/how-much-does-a-car-wrap-cost/index.html',
  '/blog/ppf-o-ceramico-que-elegir.html': '/blog/ppf-vs-ceramic-coating/index.html',
  '/blog/limpieza-tapiceria-coche-precio.html': '/blog/car-upholstery-cleaning-cost/index.html',
};

/* Pages that leave the shipped tree. TWO different things, deliberately kept apart —
   conflating them silently overwrote /pricing and /detailing on the first run:
     HARVEST_DEST  = where the FILE is moved to (kept for agents to mine)
     LINK_FALLBACK = where LINKS that pointed at it are redirected */
const HARVEST_DEST = {
  '/services/paint-correction.html': '/_build/us/harvest/paint-correction.html',
  '/services/body-kits.html': '/_build/us/harvest/body-kits.html',
  '/pages/projects.html': '/_build/us/harvest/projects.html',
};
const LINK_FALLBACK = {
  '/services/paint-correction.html': '/detailing/index.html',   // spec folds paint correction into /detailing
  '/services/body-kits.html': '/pricing/index.html',            // no body-kit SKU exists in the spec at any tier
  '/pages/projects.html': '/about/index.html',                  // "Exclusivo" folds into /about
};

/* home-page anchors that now have their own route */
const ANCHOR_ROUTES = { '#contact': '/contact/index.html' };

/* routes that will exist once the new pages are authored — link targets are valid now */
const FUTURE = ['/window-tint/index.html', '/our-films/index.html', '/contact/index.html',
  '/reserve/index.html', '/privacy/index.html', '/terms/index.html',
  '/ppf-boca-raton/index.html', '/ppf-fort-lauderdale/index.html',
  '/ppf-pompano-beach/index.html', '/ppf-delray-beach/index.html'];

const ALL_NEW = new Set(Object.values(ROUTES).concat(FUTURE));

/* ---------------------------------------------------------------- helpers */
const posix = p => p.split(path.sep).join('/');
const sitePath = abs => '/' + posix(path.relative(root, abs));

/* "/pricing/index.html" seen from "/blog/x/index.html" -> "../../pricing/" */
function relLink(fromSite, toSite) {
  const fromDir = path.posix.dirname(fromSite);
  let r = path.posix.relative(fromDir, toSite);
  if (r === '') r = '.';
  // a directory route is addressed by its directory, never by index.html
  if (r.endsWith('/index.html')) r = r.slice(0, -'index.html'.length);
  else if (r === 'index.html') r = './';
  if (!r.startsWith('.') && !r.startsWith('/')) r = r; // sibling paths stay bare
  return r;
}

/* resolve an href written in `fromSite` to an absolute site path */
function resolveRef(fromSite, ref) {
  if (ref.startsWith('/')) return path.posix.normalize(ref);
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromSite), ref));
}

/* ------------------------------------------------------- 1. plan the moves */
const moves = [];
for (const [from, to] of Object.entries(ROUTES)) {
  if (from === to) continue;
  moves.push({ from, to, kind: 'route' });
}
for (const [from, to] of Object.entries(HARVEST_DEST)) {
  moves.push({ from, to, kind: 'harvest' });
}

console.log('planned moves:');
moves.forEach(m => console.log(`  ${m.kind === 'harvest' ? 'harvest' : 'route  '}  ${m.from}  ->  ${m.to}`));
if (DRY) { console.log('\n--dry: nothing written'); process.exit(0); }

/* ----------------------------------------------------- 2. rewrite the links
   Done BEFORE moving, so every href is resolved against the file's real old
   location, then re-expressed relative to its new one. */
const htmlOld = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_build' || e.name === '.git' || e.name === 'assets' || e.name === '.screenshots') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlOld.push(p);
  }
})(root);

const newSiteOf = old => ROUTES[old] || HARVEST_DEST[old] || old;
const ATTR = /\b(href|src|content)="([^"]+)"/g;
const SKIP = /^(https?:|\/\/|#|mailto:|tel:|sms:|data:|javascript:)/i;
/* An href written INSIDE a JavaScript string is not a path. pages/prices.html builds
   its cards with  '…href="'+WA+msg+'"…'  and the first run happily turned that into
   href="../pages/'+WA+msg+'". Anything carrying JS concatenation or a template
   placeholder is left exactly as found. */
const NOT_A_PATH = /['"`+]|\$\{|\{\{|<%/;

let rewritten = 0, unresolved = [];
const staged = new Map();   // newSitePath -> file contents

for (const file of htmlOld) {
  const oldSite = sitePath(file);
  const newSite = newSiteOf(oldSite);
  const src = fs.readFileSync(file, 'utf8');

  const out = src.replace(ATTR, (m, attr, ref) => {
    // og:url / canonical carry absolute URLs; the SEO layer regenerates them later
    if (SKIP.test(ref)) {
      if (attr === 'href' && ANCHOR_ROUTES[ref]) {
        return `${attr}="${relLink(newSite, ANCHOR_ROUTES[ref])}"`;
      }
      return m;
    }
    if (attr === 'content') return m;                     // meta content is not a link
    if (NOT_A_PATH.test(ref)) return m;                    // href built by JS, not a path
    const hashAt = ref.indexOf('#');
    const hash = hashAt >= 0 ? ref.slice(hashAt) : '';
    const bare = hashAt >= 0 ? ref.slice(0, hashAt) : ref;
    if (!bare) return m;                                   // pure fragment

    const target = resolveRef(oldSite, bare);

    // assets and other non-page files: keep the same target, re-express relatively
    if (!target.endsWith('.html')) {
      rewritten++;
      return `${attr}="${relLink(newSite, target)}${hash}"`;
    }

    // a page: map it through the route table
    let mapped = ROUTES[target] || LINK_FALLBACK[target];
    if (!mapped) {
      if (ALL_NEW.has(target)) mapped = target;
      else { unresolved.push(`${oldSite} -> ${ref}`); return m; }
    }
    // the home page's #contact anchor became its own route
    if (mapped === '/index.html' && hash === '#contact') {
      rewritten++;
      return `${attr}="${relLink(newSite, '/contact/index.html')}"`;
    }
    rewritten++;
    return `${attr}="${relLink(newSite, mapped)}${hash}"`;
  });

  // Two sources staging to one destination silently destroys a page: on the first run
  // paint-correction overwrote /detailing and body-kits overwrote /pricing, and nothing
  // said a word. Never again.
  if (staged.has(newSite)) {
    console.error(`\nDESTINATION COLLISION: ${newSite} would be written by two sources.`);
    console.error(`  already staged by: ${staged.get(newSite).from}`);
    console.error(`  also claimed by:   ${oldSite}`);
    process.exit(1);
  }
  staged.set(newSite, { from: oldSite, content: out });
}

if (unresolved.length) {
  console.error('\nunresolved internal links (nothing written):');
  [...new Set(unresolved)].forEach(u => console.error('  ' + u));
  process.exit(1);
}

/* ------------------------------------------------------- 3. write & delete */
for (const [newSite, { content }] of staged) {
  const dest = path.join(root, newSite.slice(1));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}
// remove the old files that moved
for (const m of moves) {
  const old = path.join(root, m.from.slice(1));
  if (fs.existsSync(old) && path.resolve(old) !== path.resolve(path.join(root, m.to.slice(1)))) fs.unlinkSync(old);
}
// drop now-empty source folders
for (const d of ['services', 'pages']) {
  const p = path.join(root, d);
  if (fs.existsSync(p) && fs.readdirSync(p).length === 0) fs.rmdirSync(p);
}

console.log(`\n${rewritten} internal references rewritten across ${staged.size} pages`);
console.log('shipped routes now:');
[...ALL_NEW].sort().forEach(r => {
  const exists = fs.existsSync(path.join(root, r.slice(1)));
  console.log(`  ${exists ? 'OK     ' : 'TO BUILD'} ${r.replace(/index\.html$/, '')}`);
});
