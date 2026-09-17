/* 53-ceramic-pages.js — STAGE 4: the hand-written page markup.

   Everything regen owns (nav, footer, SEO head, JSON-LD, FAQ, price regions) was handled
   by stages 1-3 and cascades on the next `node _build/regen.mjs`. What is left is markup
   written by hand into the pages themselves, outside every REGION.

   regen ABORTS on the first orphaned price marker ("pricing.js has no item ceramic-topup"),
   so until the markers below are gone the nav and footer cannot update at all. That is
   why this script runs before the build, not after — and why the first attempt looked
   like regen was ignoring the partials when in fact it had never got that far.

   THE CASCADES, which is the part a find-and-replace would miss. Four separate hardcoded
   numbered sequences renumber when the ceramic entry is pulled out of the middle:
     index.html         service doors 01-05          -> 04 and 05 become 03 and 04
     404.html           "the five services" 01-05    -> same, plus the heading count
     pricing/index.html group eyebrows "03 — ..."    -> 04 and 05 become 03 and 04
     reserve/index.html Founders Club offers 01-03   -> 03 becomes 02
   And two headings count out loud: "Five ways in." and "The five services".

   ONE OFFER IS CHANGED, NOT JUST A LINK. /reserve's Founding Member deal was exactly
   three benefits and the second was "a free ceramic top-up, normally $600". It cannot
   survive the service being withdrawn and a replacement benefit cannot be invented here,
   so the card goes and the offer is now two benefits. business.RESERVE_LIVE is false and
   the page is unlinked by design until Nov 2, so this changes nothing a customer has seen
   — but it is a commercial decision and it is TODO item 47, not a silent edit.

   Usage: node _build/us/53-ceramic-pages.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = new Map();
const log = [];

const read = (f) => {
  if (!files.has(f)) files.set(f, fs.readFileSync(path.join(ROOT, f), 'utf8'));
  return files.get(f);
};

function swap(f, label, from, to) {
  const s = read(f);
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`NOT FOUND in ${f} (${label}):\n---\n${from.slice(0, 220)}\n---`);
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  files.set(f, s.slice(0, i) + to + s.slice(i + from.length));
  log.push(`  rewrote  ${f.padEnd(34)} ${label}`);
}
const cut = (f, label, needle) => swap(f, label, needle, '');

/* Cut the WHOLE LINE containing a unique substring. For the one-line "see also" links
   scattered across the service pages: their indentation varies from 4 to 10 spaces and
   guessing it wrong is a NOT FOUND on markup that is sitting right there. */
function cutLine(f, label, substring) {
  const s = read(f);
  const at = s.indexOf(substring);
  if (at < 0) throw new Error(`NOT FOUND in ${f} (${label}): ${substring.slice(0, 120)}`);
  if (s.indexOf(substring, at + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  const start = s.lastIndexOf('\n', at) + 1;
  let end = s.indexOf('\n', at);
  end = end < 0 ? s.length : end + 1;
  files.set(f, s.slice(0, start) + s.slice(end));
  log.push(`  cut line ${f.padEnd(34)} ${label}`);
}

/* Cut a whole element located by a unique substring of its opening tag, balancing the tag
   so nested copies of the same tag name cannot truncate the span. Transcribing 8-line
   blocks by hand is what went wrong twice already today. */
function cutElement(f, label, openMatch, tag) {
  const s = read(f);
  const at = s.indexOf(openMatch);
  if (at < 0) throw new Error(`NOT FOUND in ${f} (${label}): ${openMatch.slice(0, 120)}`);
  if (s.indexOf(openMatch, at + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  /* The anchor is usually INSIDE the element (a heading, an eyebrow, a link), so walk
     BACK to the nearest opening tag first and balance forward from there. Balancing
     forward from the anchor was the first version, and it reported "unbalanced <li>" on
     perfectly good markup because it never saw the opening tag. */
  const openAt = s.lastIndexOf(`<${tag}`, at);
  if (openAt < 0) throw new Error(`no enclosing <${tag}> before the anchor in ${f} (${label})`);
  const start = s.lastIndexOf('\n', openAt) + 1;
  const open = new RegExp(`<${tag}\\b`, 'g');
  const close = new RegExp(`</${tag}>`, 'g');
  let depth = 0, i = openAt, end = -1;
  while (i < s.length) {
    open.lastIndex = i; close.lastIndex = i;
    const o = open.exec(s), c = close.exec(s);
    if (!c) break;
    if (o && o.index < c.index) { depth++; i = o.index + 1; continue; }
    depth--; i = c.index + 1;
    if (depth === 0) { end = c.index + tag.length + 3; break; }
  }
  if (end < 0) throw new Error(`unbalanced <${tag}> in ${f} (${label})`);
  while (s[end] === '\r') end++;
  if (s[end] === '\n') end++;
  const span = s.slice(start, end);
  if (!/ceramic/i.test(span)) throw new Error(`span for ${label} in ${f} has no ceramic in it — wrong block`);
  files.set(f, s.slice(0, start) + s.slice(end));
  log.push(`  cut      ${f.padEnd(34)} ${label} (${span.split('\n').length} lines)`);
}

/* ══════════════════════════ index.html ══════════════════════════ */
cutElement('index.html', 'home service door 03', '<a class="svc-door" href="ceramic-coating/">', 'a');
swap('index.html', 'renumber service doors 04->03, 05->04',
  '<span class="sd-num">04</span>', '<span class="sd-num">03</span>');
swap('index.html', 'renumber service door 05->04',
  '<span class="sd-num">05</span>', '<span class="sd-num">04</span>');
swap('index.html', 'services heading counts out loud',
  '<h2 id="hm-svc-title">Five ways in.<br>One standard.</h2>',
  '<h2 id="hm-svc-title">Four ways in.<br>One standard.</h2>');
swap('index.html', 'hero meta line',
  '<div class="hero-meta">PPF · Wraps · Ceramic<br>Tint · Detailing</div>',
  '<div class="hero-meta">PPF · Wraps<br>Tint · Detailing</div>');
swap('index.html', 'FAQ intro prose',
  'SERRES Wrap Center is a paint protection film, wrap, ceramic coating, window tint and detailing studio',
  'SERRES Wrap Center is a paint protection film, wrap, window tint and detailing studio');

/* ══════════════════════════ 404.html ══════════════════════════ */
cutElement('404.html', 'service list item 03', '<a href="ceramic-coating/">', 'li');
swap('404.html', 'renumber 404 service list 04->03',
  '<span class="n">04</span>', '<span class="n">03</span>');
swap('404.html', 'renumber 404 service list 05->04',
  '<span class="n">05</span>', '<span class="n">04</span>');
swap('404.html', '404 heading counts out loud',
  '<h2 class="nf-title">The five services</h2>', '<h2 class="nf-title">The four services</h2>');

/* ══════════════════════════ pricing ══════════════════════════ */
cutElement('pricing/index.html', 'the ceramic price group', '<span class="eyebrow">03 — Ceramic coating</span>', 'article');
swap('pricing/index.html', 'renumber price groups 04->03',
  '<span class="eyebrow">04 — Window tint</span>', '<span class="eyebrow">03 — Window tint</span>');
swap('pricing/index.html', 'renumber price groups 05->04',
  '<span class="eyebrow">05 — Detailing &amp; paint correction</span>',
  '<span class="eyebrow">04 — Detailing &amp; paint correction</span>');
cut('pricing/index.html', 'in-page jump nav entry',
  '      <a href="#ceramic">Ceramic coating</a>\n');
swap('pricing/index.html', 'scroll-margin rule',
  '#ppf,#wraps,#ceramic,#tint,#detailing,#packages,#faq{scroll-margin-top:104px}',
  '#ppf,#wraps,#tint,#detailing,#packages,#faq{scroll-margin-top:104px}');
swap('pricing/index.html', 'H1 keyword line',
  'PPF, wrap, ceramic, tint and detailing prices in Boca Raton, FL',
  'PPF, wrap, tint and detailing prices in Boca Raton, FL');
/* The "How the coating is applied" paragraph needs no edit of its own: it sat inside the
   ceramic price <article> cut above, and went with it. */

/* ══════════════════════════ reserve ══════════════════════════ */
cutElement('reserve/index.html', 'Founders Club offer 02 — the free ceramic top-up',
  '<h3>A free ceramic top-up</h3>', 'article');
swap('reserve/index.html', 'renumber Founders Club offers 03->02',
  '<span class="rs-offer-no">03</span>', '<span class="rs-offer-no">02</span>');
swap('reserve/index.html', 'form-aside service list',
  'Which service you want: PPF, wrap, ceramic, tint or a package.',
  'Which service you want: PPF, wrap, tint or a package.');

/* ══════════════════════════ landers ══════════════════════════ */
cutElement('ppf-boca-raton/index.html', '"more" row', '<a href="../ceramic-coating/">Ceramic coating</a>', 'li');
cutElement('ppf-pompano-beach/index.html', '"also" row', '<span class="pb-also__svc">Ceramic coating</span>', 'li');
cutElement('ppf-fort-lauderdale/index.html', 'lander facts row', '<span class="us-lander-k">Ceramic coating</span>', 'li');
cutLine('ppf-delray-beach/index.html', 'related-services link',
  '<a class="rel-link" href="../ceramic-coating/">Ceramic coating</a>');
swap('ppf-delray-beach/index.html', 'prices footnote — ceramic and the bundle both go',
  'Film is rarely the only thing a car leaves with. Ceramic coating over bare paint starts at <!--P:PRICE:ceramic-3yr-->$1,200<!--/P-->, or <!--P:PRICE:ceramic-topup-->$600<!--/P--> as a top-up laid straight over fresh film. A full car in ceramic tint is <!--P:PRICE:tint-full-->$500<!--/P-->. The Daily Driver package — partial front film plus ceramic, bought together — is <!--P:PRICE:daily-driver-->$1,990<!--/P-->. <a href="../pricing/">See every service and every price</a>, or <a href="../paint-protection-film/">read how the coverage options differ</a>.',
  'Film is rarely the only thing a car leaves with. A full car in ceramic tint is <!--P:PRICE:tint-full-->$500<!--/P-->, and an interior detail starts at <!--P:STARTING:detailing-->from $300<!--/P-->. <a href="../pricing/">See every service and every price</a>, or <a href="../paint-protection-film/">read how the coverage options differ</a>.');

/* ══════════════════════════ service pages ══════════════════════════ */
cutLine('window-tint/index.html', 'related-services link',
  '<a class="rel-link" href="../ceramic-coating/">Ceramic coating</a>');
cutLine('paint-protection-film/index.html', 'inline link row',
  '<a href="../ceramic-coating/">Ceramic coating →</a>');
cutLine('paint-protection-film/index.html', '"you may also be interested in" link',
  'Ceramic Coating — paint correction and ceramic sealing in Boca Raton');
cutLine('car-wraps/index.html', 'inline link',
  '<a href="../ceramic-coating/">Ceramic Coating treatment</a>');
cutLine('detailing/index.html', '"pair it with" link',
  '<a href="../ceramic-coating/">Ceramic Coating</a>');
swap('detailing/index.html', 'price-card note',
  'Also the prep step before a <a href="../ceramic-coating/">ceramic coating</a> — the finish',
  'Also the prep step before film — the finish');

/* ══════════════════════════ legal + about + contact ══════════════════════════ */
swap('terms/index.html', 'services sentence',
  'They cover paint protection film, wraps, ceramic coating, window tint and detailing',
  'They cover paint protection film, wraps, window tint and detailing');
swap('privacy/index.html', 'services sentence',
  'SERRES Wrap Center is a vehicle protection studio — paint protection film, wraps, ceramic coating',
  'SERRES Wrap Center is a vehicle protection studio — paint protection film, wraps');

/* ══════════════════════════ write ══════════════════════════ */
for (const [f, out] of files) fs.writeFileSync(path.join(ROOT, f), out);
console.log(log.join('\n'));
files.clear();

/* ══════════════════════════ gates ══════════════════════════ */
const SKIP = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);

let bad = 0;
for (const p of pages) {
  const s = fs.readFileSync(p, 'utf8');
  const rel = path.relative(ROOT, p).split(path.sep).join('/');
  const markers = (s.match(/<!--P:(PRICE|STARTING|PERMONTH):ceramic[^-]*-->/g) || []);
  if (markers.length) { bad++; console.error(`FAIL ${rel}: ${markers.length} orphaned ceramic price marker(s) — regen will abort`); }
}
console.log('');
if (bad) process.exit(1);
console.log('no ceramic price markers left; regen can run.');
console.log('NEXT: node _build/us/build.js — the remaining nav/footer/JSON-LD links cascade from the partials.');

/* ══════════════════════ round 2, guided by the gates ══════════════════════
   verify-links found two hand-written links stages 1-4 missed, and verify-prices caught
   the /pricing package cards still rendering items that are now published:false. That is
   the gates doing the job the map could not: the map listed 234 touchpoints, these three
   are the ones a human reading a list of 234 would have walked past. */
