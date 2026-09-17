/* 51-ceramic-blog-sources.js — STAGE 2: the blog SOURCES.

   Every shipped blog page is rewritten from _build/us/content/blog/*.html by
   30-install-blog.js on every build, with no existence check on the destination. An edit
   made in blog/<slug>/index.html is undone by the next `node _build/us/build.js`. So all
   of this happens in the source.

   Three articles referenced the withdrawn service. Nothing here is reworded to sell
   something else in its place: where a ceramic recommendation carried real advice, the
   advice is kept and re-pointed at a service that still exists and still has a published
   price (Paint Correction, {{PRICE:paint-correction}}); where it was only an upsell, the
   sentence goes.

   The FAQ pair in how-much-does-ppf-cost is removed from BOTH the visible <details> and
   its FAQPage JSON-LD twin. _build/verify-seo.js requires the two to stay byte-identical,
   so removing one and not the other fails the build — which is the point.

   Usage: node _build/us/51-ceramic-blog-sources.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, '_build', 'us', 'content', 'blog');
const files = new Map();
const log = [];

/* These sources are CRLF, unlike the rest of the repo. Needles are written with \n, so
   every needle is adapted to the file it is matched against rather than the file being
   rewritten — converting the file would show up as a whole-file diff and bury the change. */
const read = (f) => {
  if (!files.has(f)) files.set(f, fs.readFileSync(path.join(DIR, f), 'utf8'));
  return files.get(f);
};
/* And they are MIXED: the JSON-LD head of how-much-does-ppf-cost.html is CRLF while its
   body is LF, in the same file. So a needle is tried as written and then again with CRLF,
   rather than deciding per file — deciding per file is what made the first run fail on a
   line that was sitting there in plain sight. */
const variants = (needle) => [needle, needle.split('\n').join('\r\n')];
const findOne = (s, needle) => {
  for (const v of variants(needle)) {
    const i = s.indexOf(v);
    if (i >= 0) return { i, v };
  }
  return null;
};

function cut(f, label, rawNeedle) {
  const s = read(f);
  const hit = findOne(s, rawNeedle);
  if (!hit) throw new Error(`NOT FOUND in ${f} (${label}):\n---\n${rawNeedle.slice(0, 200)}\n---`);
  const needle = hit.v;
  const i = hit.i;
  if (i < 0) throw new Error(`NOT FOUND in ${f} (${label}):\n---\n${needle.slice(0, 200)}\n---`);
  if (s.indexOf(needle, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  files.set(f, s.slice(0, i) + s.slice(i + needle.length));
  log.push(`  cut      ${f}  ${label}`);
}

function swap(f, label, rawFrom, rawTo) {
  const s = read(f);
  const hit = findOne(s, rawFrom);
  if (!hit) throw new Error(`NOT FOUND in ${f} (${label}):\n---\n${rawFrom.slice(0, 200)}\n---`);
  const from = hit.v;
  /* match the replacement to whatever the match turned out to be */
  const to = from.includes('\r\n') ? rawTo.split('\n').join('\r\n') : rawTo;
  const i = hit.i;
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  files.set(f, s.slice(0, i) + to + s.slice(i + from.length));
  log.push(`  rewrote  ${f}  ${label}`);
}

/* The "Keep reading" card pointing at the deleted article. Located by its href and cut to
   its own closing tag rather than matched as a transcribed block: the three cards carry
   three different headings and blurbs, and transcribing them by hand is how the first two
   attempts failed on text that was sitting there in plain sight. */
function cutRelCard(f) {
  const s = read(f);
  const a = s.indexOf('<a class="rel-card" href="../ppf-vs-ceramic-coating/">');
  if (a < 0) throw new Error(`NOT FOUND in ${f}: rel-card for the deleted article`);
  if (s.indexOf('<a class="rel-card" href="../ppf-vs-ceramic-coating/">', a + 1) >= 0) throw new Error(`AMBIGUOUS rel-card in ${f}`);
  const lineStart = s.lastIndexOf('\n', a) + 1;          /* take the indentation with it */
  const close = s.indexOf('</a>', a);
  if (close < 0) throw new Error(`unterminated rel-card in ${f}`);
  let end = close + 4;
  while (s[end] === '\r') end++;
  if (s[end] === '\n') end++;
  const span = s.slice(lineStart, end);
  if (!span.includes('ppf-vs-ceramic-coating') || span.length > 800) throw new Error(`rel-card span looks wrong in ${f}: ${span.length} chars`);
  files.set(f, s.slice(0, lineStart) + s.slice(end));
  log.push(`  cut      ${f}  related-articles card (${span.split('\n').length} lines)`);
}

/* ════════════════════ how-much-does-ppf-cost ════════════════════ */
const A = 'how-much-does-ppf-cost.html';

cut(A, 'FAQPage JSON-LD — "Is PPF or a ceramic coating the better buy?"',
  '    {\n' +
  '      "@type": "Question",\n' +
  '      "name": "Is PPF or a ceramic coating the better buy?",\n' +
  '      "acceptedAnswer": { "@type": "Answer", "text": "They do different jobs. The 3-Year Ceramic Package costs {{PRICE:ceramic-3yr}} and adds gloss, hydrophobic behavior and easier washing, which matters against afternoon storms, sprinkler water and coastal humidity, but it does not stop a stone chip. PPF physically absorbs the impact. The usual combination on a premium car is PPF on the front end with ceramic applied over the film, which costs {{PRICE:ceramic-topup}} when it is added to a film or wrap job." }\n' +
  '    },\n');

cut(A, 'visible FAQ twin of the same question',
  '      <details>\n' +
  '        <summary>Is PPF or a ceramic coating the better buy?</summary>\n' +
  '        <div class="faq-a"><p>They do different jobs. The 3-Year Ceramic Package costs {{PRICE:ceramic-3yr}} and adds gloss, hydrophobic behavior and easier washing, which matters against afternoon storms, sprinkler water and coastal humidity, but it does not stop a stone chip. PPF physically absorbs the impact. The usual combination on a premium car is PPF on the front end with ceramic applied over the film, which costs {{PRICE:ceramic-topup}} when it is added to a film or wrap job.</p></div>\n' +
  '      </details>\n');

swap(A, '"when does it not pay off" — ceramic alternative re-pointed at paint correction',
  '    <p>When does it not pay off? On a car whose paint is already deteriorated — the film does not\n' +
  '       fix deep damage, it preserves it — on a short two-year lease where you never capitalize on\n' +
  '       the resale value, or if the budget only stretches to an unbranded film with no warranty.\n' +
  '       In that case, the 3-Year Ceramic Package with paint correction beforehand costs\n' +
  '       {{PRICE:ceramic-3yr}}, which is {{PERMONTH:ceramic-3yr:3}} a month over its three years. It protects far less\n' +
  '       against impacts, but it keeps the gloss and makes washing easier for a smaller investment.\n' +
  '       In this climate the hydrophobic layer earns its keep: afternoon thunderstorms, sprinkler\n' +
  '       water and humidity bead up and sheet off instead of drying into mineral spots. Added over\n' +
  '       fresh film or a wrap, that ceramic layer costs {{PRICE:ceramic-topup}}.</p>',
  '    <p>When does it not pay off? On a car whose paint is already deteriorated — the film does not\n' +
  '       fix deep damage, it preserves it — on a short two-year lease where you never capitalize on\n' +
  '       the resale value, or if the budget only stretches to an unbranded film with no warranty.\n' +
  '       In that case the better use of the money is the paint itself: Paint Correction (1–2 stage)\n' +
  '       is {{PRICE:paint-correction}} and brings back the gloss the clear coat still has. It does\n' +
  '       nothing against a stone chip, but it is honest about what it is — and if film comes later,\n' +
  '       corrected paint is what you want underneath it anyway.</p>');

swap(A, 'price-gate dev comment — drop the ceramic derived amount',
  '           4995 / 120 = 41.625  -> 41.63  (Full Body Essential, 10 years)\n' +
  '           1200 / 36  = 33.333… -> 33.33  (3-Year Ceramic Package, 3 years)\n',
  '           4995 / 120 = 41.625  -> 41.63  (Full Body Essential, 10 years)\n');

cutRelCard(A);

/* ════════════════════ how-much-does-a-car-wrap-cost ════════════════════ */
const B = 'how-much-does-a-car-wrap-cost.html';

cut(B, 'ceramic top-up upsell paragraph',
  '    <p>If you want the finish to stay slick and easy to wash, a ceramic top-up over fresh film is\n' +
  '       {{PRICE:ceramic-topup}} — see <a href="../../ceramic-coating/">ceramic coating</a>. It adds\n' +
  '       hydrophobics and makes love bugs and sprinkler spotting far easier to rinse off, without\n' +
  '       touching the paint underneath.</p>\n');

cutRelCard(B);

/* ════════════════════ car-upholstery-cleaning-cost ════════════════════ */
const C = 'car-upholstery-cleaning-cost.html';

swap(C, 'price-table row — "prep before ceramic or film" -> film only',
  'Outside work: swirls from automatic washes, dull paint, prep before ceramic or film',
  'Outside work: swirls from automatic washes, dull paint, prep before film');

swap(C, 'paint-correction bullet — "before a coating or film" -> film only',
  '          clear coat. It is also the prep step before a coating or film.</li>',
  '          clear coat. It is also the prep step before film.</li>');

swap(C, '"correct then protect" paragraph — ceramic option removed, order kept',
  '    <p>If the plan is to protect the car as well as clean it, the order matters: correct the paint\n' +
  '       first, then protect it. That is either the\n' +
  '       <a href="../../ceramic-coating/">3-Year Ceramic Package</a> ({{PRICE:ceramic-3yr}}) or\n' +
  '       <a href="../../paint-protection-film/">paint protection film</a>, and a coating applied over\n' +
  '       uncorrected paint just locks the swirls in. Neither of them does anything for the inside of\n' +
  '       the car — that is what the Interior Detail is for.</p>',
  '    <p>If the plan is to protect the car as well as clean it, the order matters: correct the paint\n' +
  '       first, then protect it with <a href="../../paint-protection-film/">paint protection film</a>,\n' +
  '       because film applied over uncorrected paint preserves the swirls exactly as they are. It\n' +
  '       does nothing for the inside of the car — that is what the Interior Detail is for.</p>');

cutRelCard(C);

/* ════════════════════ write + gates ════════════════════ */
for (const [f, out] of files) fs.writeFileSync(path.join(DIR, f), out);
console.log(log.join('\n'));
files.clear();

let bad = 0;
for (const f of fs.readdirSync(DIR).filter(n => n.endsWith('.html'))) {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  const hits = s.split('\n')
    .map((l, i) => ({ n: i + 1, l }))
    .filter(x => /ceramic/i.test(x.l));
  /* the only ceramic allowed to survive in the blog sources is window tint */
  const badHits = hits.filter(x => !/ceramic (film|window tint|IR)/i.test(x.l));
  if (badHits.length) {
    bad += badHits.length;
    console.error(`\nFAIL ${f}: ${badHits.length} ceramic-coating reference(s) left`);
    badHits.forEach(x => console.error(`  ${x.n}: ${x.l.trim().slice(0, 110)}`));
  }
}
const cards = fs.readFileSync(path.join(DIR, 'index-cards.html'), 'utf8');
if (cards.includes('ppf-vs-ceramic-coating')) { console.error('\nFAIL index-cards.html still lists the article'); bad++; }

console.log('');
if (bad) process.exit(1);
console.log('blog sources clean. NEXT: seo.json, then the hand-written page markup, then build.js');
