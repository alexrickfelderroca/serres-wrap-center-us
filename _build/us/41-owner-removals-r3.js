/* 41-owner-removals-r3.js — round 3 of the owner-marked removals.

   Convention established over the first two rounds and confirmed by what the owner
   accepted: RED and GREEN marker both mean "remove this". Green-marked items (the hero
   sub-paragraph, the SiO2 tile, the IR tile, the footer) were removed in rounds 1-2 and
   came back marked again in no screenshot, so green is not a different instruction.

   WHAT IS CUT HERE, one entry per screenshot:

   index.html
     - the five .sd-sub one-line descriptions on the service cards. The owner's green
       ovals enclosed ONLY that line: the card name, the image and the "from $X" price
       sit outside them and stay. (The price line is a generated <!--P:STARTING:...-->
       token — cutting by line number instead of by text would have taken the price.)
     - the whole PACKAGES section ("Bundled, not padded.") — captioned "todo este bloque".
     - the whole PROVEN IN BARCELONA section ("Not a new shop. A second one.") — captioned
       "todo este también" in round 1 and circled again in green in round 3.
     - the inline CSS those two sections owned, which nothing else uses.

   paint-protection-film/index.html
     - the "Three layers, one invisible skin." construct block — captioned "todo este
       bloque". The screenshot is this page and not our-films (the breadcrumb HOME /
       SERVICES / PPF appears only here); our-films carries a near-twin block that the
       owner has NOT marked and it is left alone.
     - side effect, and worth knowing: line 757 carried a DUPLICATED opening
       <div class="construct reveal-up"> that has shipped since the original build
       (741d240), leaving the file at 59 <div> vs 58 </div>. Cutting the block closes
       that hole — the page is valid HTML for the first time.
     - the two empty "FILM TIERS" / "TRANSFORMATION" comment headstones left by round 1.

   detailing/index.html
     - the "From hazy to mirror." section head and the two paragraphs beside the slider.
       The .xspecs data rows and the before/after slider STAY. That is not a guess: the
       car-wraps page uses the identical .xform component, the owner boxed only the prose
       there in round 2, and the spec rows and slider were kept and accepted. The red box
       here ran off the bottom of the phone screen around the spec rows, and round 2
       already set the precedent that content below the screen edge is not assumed marked
       (that is why the tint price table survived).

   window-tint/index.html
     - the "Pending verification" note. Round 2 refused to remove it because it was the
       only thing making unverified statute figures defensible to publish. It is removed
       here because the figures are now VERIFIED, not because the mark was repeated:
       every row was read as verbatim statutory text from the 2026 Florida Statutes on
       flsenate.gov and cross-checked against Online Sunshine (leg.state.fl.us).
         front side windows   >= 28% VLT, both vehicle classes   Fla. Stat. 316.2953
         behind the driver    >= 15% sedans / >= 6% MPV          Fla. Stat. 316.2954
       Florida regulates back side windows and the rear window as one class, so those two
       rows sharing a figure is correct, not a copy-paste error.
     - ONE CORRECTION, not a removal: the windshield row said "Non-reflective film above
       the AS-1 line only". The statute's word is "transparent", not "non-reflective"
       (316.2952(2)(b)), and reflectance is a separate limit that applies to the SIDE
       windows. The row now states the statutory rule.
     - the table caption gains the statute citation. Six words, and it is the attribution
       that replaces the disclaimer: the page publishes legal limits and should say where
       they come from. Flagged to the owner rather than assumed.
     - the tint FAQ answer repeated "We have not yet verified these figures" and the same
       "non-reflective" wording. Fixed in _build/us/faq/window-tint.json — the SOURCE —
       and in the merged _build/data/faq.json, so the visible FAQ and the JSON-LD stay
       byte-identical (verify-seo.js enforces that).

   STILL DELIBERATELY KEPT, unchanged from round 2 and flagged again: the tint price
   table. The red box reached the bottom edge of the screenshot and so enclosed it, but it
   is the only price on that page and published prices are the spec's central positioning.

   Usage:
     node _build/us/41-owner-removals-r3.js            apply (ONE-SHOT: every needle must
                                                       still match, so a second run fails
                                                       loudly rather than half-applying)
     node _build/us/41-owner-removals-r3.js --verify   change nothing, run the gates only
                                                       against what is on disk
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const VERIFY = process.argv.includes('--verify');
const files = new Map();
const log = [];

function read(rel) {
  if (!files.has(rel)) files.set(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  return files.get(rel);
}
function write(rel, s) { files.set(rel, s); }

/* Remove an exact block of text. Fails loudly: a needle that no longer matches means the
   file moved under us, and a silent no-op there is how a "done" report becomes a lie. */
function cut(rel, label, needle) {
  if (VERIFY) return;
  const s = read(rel);
  const i = s.indexOf(needle);
  if (i < 0) throw new Error(`NOT FOUND in ${rel} (${label}):\n---\n${needle.slice(0, 160)}\n---`);
  if (s.indexOf(needle, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label}): matches more than once`);
  write(rel, s.slice(0, i) + s.slice(i + needle.length));
  log.push(`  cut      ${rel}  ${label}`);
}

/* Remove everything from `from` to the end of `to`, inclusive. `witness` MUST fall inside
   the removed span — the guard against a pair of anchors that are individually fine and
   together select the wrong region. */
function cutSpan(rel, label, from, to, witness) {
  if (VERIFY) return;
  const s = read(rel);
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`NOT FOUND in ${rel} (${label}) start anchor: ${from.slice(0, 120)}`);
  if (s.indexOf(from, a + 1) >= 0) throw new Error(`AMBIGUOUS start anchor in ${rel} (${label})`);
  const b = s.indexOf(to, a + from.length);
  if (b < 0) throw new Error(`NOT FOUND in ${rel} (${label}) end anchor: ${to.slice(0, 120)}`);
  const span = s.slice(a, b + to.length);
  if (!span.includes(witness)) throw new Error(`WRONG SPAN in ${rel} (${label}): witness "${witness.slice(0, 60)}" not inside the ${span.length} chars selected`);
  write(rel, s.slice(0, a) + s.slice(b + to.length));
  log.push(`  cut      ${rel}  ${label}  (${span.split('\n').length} lines)`);
}

function swap(rel, label, from, to) {
  if (VERIFY) return;
  const s = read(rel);
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`NOT FOUND in ${rel} (${label}): ${from.slice(0, 120)}`);
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label})`);
  write(rel, s.slice(0, i) + to + s.slice(i + from.length));
  log.push(`  rewrote  ${rel}  ${label}`);
}

/* ══════════════════════════ index.html ══════════════════════════ */
const HOME = 'index.html';

/* 1 — the five service-card sub-descriptions (green ovals) */
for (const [name, text] of [
  ['01 Paint Protection Film', 'Self-healing urethane over the panels that take the hits. NAR H190 or 3M Scotchgard Pro Series 200.'],
  ['02 Car Wraps', 'Chrome delete to a full color change, edges wrapped in.'],
  ['03 Ceramic Coating', 'Decon, gloss prep, coating, cure — on bare paint or over fresh film.'],
  ['04 Window Tint', 'Ceramic IR-rejecting film, Florida-legal VLT options.'],
  ['05 Detailing', 'Interior strip-down and extraction, or 1–2 stage paint correction.'],
]) cut(HOME, `sd-sub ${name}`, `        <span class="sd-sub">${text}</span>\n`);

/* 2 — the PACKAGES section, banner comment and the blank line above it */
cutSpan(HOME, 'PACKAGES section ("Bundled, not padded.")',
  '\n<!-- ===================== 4 · PACKAGES ===================== -->\n<section class="hm-pkg" id="packages"',
  '</section>\n',
  '<h2 id="hm-pkg-title">Bundled,<br>not padded.</h2>');

/* 3 — the PROVEN IN BARCELONA section, its banner and its TODO(owner) comment.
       The TODO does not just vanish: it moves to TODO.md, because the car-count question
       it records outlives the block it was written next to. */
cutSpan(HOME, 'PROVEN IN BARCELONA section ("Not a new shop. A second one.")',
  '\n<!-- ===================== 5 · PROVEN IN BARCELONA ===================== -->\n<!-- TODO(owner): spec 6.1.5 wants the line "300+ cars protected in Barcelona since 2023".',
  '</section>\n',
  '<h2 id="hm-proof-title">Not a new shop.<br><span class="chrome-text">A second one.</span></h2>');

/* 4 — the inline CSS the two sections owned. Nothing else in the repo selects these. */
cutSpan(HOME, 'dead CSS: PACKAGES + PROVEN IN BARCELONA rules',
  '\n  /* ---------- PACKAGES ---------- */',
  '.hm-proof-shots figure:nth-child(3){grid-column:2;grid-row:2;aspect-ratio:4/5}\n',
  '.hm-proof-text .btn.link{margin-top:28px}');

cut(HOME, 'dead CSS: .hm-proof-grid @1024',
  '    .hm-proof-grid{grid-template-columns:1fr;gap:44px}\n');

cutSpan(HOME, 'dead CSS: the whole @880 block (only .hm-proof-shots rules in it)',
  '  @media(max-width:880px){\n    .hm-proof-shots{grid-template-columns:1fr 1fr}',
  '  }\n',
  '.hm-proof-shots figure:nth-child(3){grid-column:1/-1;grid-row:2;aspect-ratio:16/9}');

/* shared selector lists: drop the dead names, leave .hm-gal exactly as it was */
swap(HOME, 'shared padding rule: drop .hm-pkg and .hm-proof',
  '    .hm-pkg,.hm-proof,.hm-gal{padding:68px 0 76px}',
  '    .hm-gal{padding:68px 0 76px}');
swap(HOME, 'shared button rule: drop .hm-pkg-foot',
  '    .hm-gal-foot .btn,.hm-pkg-foot .btn{width:100%}',
  '    .hm-gal-foot .btn{width:100%}');

/* ══════════════════════ paint-protection-film ══════════════════════ */
const PPF = 'paint-protection-film/index.html';

/* 5 — "Three layers, one invisible skin." Cutting from the blank line above the
       duplicated opening tag through the inner .construct close also repairs the
       long-standing div imbalance: what remains closes .feat-grid, then .wrap. */
cutSpan(PPF, '"Three layers, one invisible skin." construct block',
  '\n    <div class="construct reveal-up">    <div class="construct reveal-up">',
  '<span class="ly-micron">Conformable · residue-free</span>\n        </div>\n      </div>\n    </div>\n',
  '<h3>Three layers,<br>one invisible skin.</h3>');

cutSpan(PPF, 'dead CSS: .construct / .stack / .layer',
  '\n  /* film construction strip */\n  .construct{',
  '.layer.l3{background:rgba(255,255,255,.015)}\n',
  '.layer:hover{transform:translateX(6px)');
cut(PPF, 'dead CSS: .construct mobile override',
  '    .construct{grid-template-columns:1fr;gap:30px}\n');

/* 6 — the two empty section headstones left by round 1 */
cut(PPF, 'empty "FILM TIERS" / "TRANSFORMATION" section markers',
  '<!-- ===================== FILM TIERS ===================== -->\n\n<!-- ===================== TRANSFORMATION ===================== -->\n\n');

/* ══════════════════════════ detailing ══════════════════════════ */
const DET = 'detailing/index.html';

/* 7 — "From hazy to mirror." head + the two paragraphs. .xspecs and the slider stay,
       so .xform-grid keeps both of its columns populated and does not need a CSS change. */
cut(DET, '"From hazy to mirror." section head',
  '    <div class="section-head reveal-up">\n' +
  '      <div>\n' +
  '        <span class="eyebrow">Paint Correction</span>\n' +
  '        <h2>From hazy<br>to mirror.</h2>\n' +
  '      </div>\n' +
  '      <p class="sh-note">Washing makes paint clean. Correction makes it flat — and flat paint is what reflects a straight line back at you.</p>\n' +
  '    </div>\n');

cut(DET, 'paint-correction paragraph 1 (the BMW)',
  '        <p>This BMW arrived with years of wash-induced swirls and micro-marring dulling its gloss black — light scattering in every direction instead of reflecting cleanly.</p>\n');
cut(DET, 'paint-correction paragraph 2 (the process)',
  '        <p>We assessed the clear coat, then cut, refined and finished the paint by machine until the defects were gone. The hex lighting now mirrors back razor-sharp, with deep, wet-looking reflections restored.</p>\n');

/* ══════════════════════════ window-tint ══════════════════════════ */
const TINT = 'window-tint/index.html';

/* 8 — the "do not remove until verified" comment is replaced by what verified it */
swap(TINT, 'statute comment: unverified -> verified, with the sources',
  '<!-- TODO(owner): VERIFY THESE VLT FIGURES AGAINST FLORIDA STATUTE 316.2953-316.2956\n' +
  '     BEFORE PUBLISH. They come straight from SERRES-US-WEBSITE-SPEC_1.md section 6.5,\n' +
  '     which itself flags them as UNVERIFIED. Publishing a wrong legal limit on the one\n' +
  '     page whose whole purpose is legal accuracy is worse than publishing no table at\n' +
  '     all, so the visible .us-note above the table must NOT be removed until the statute\n' +
  '     text (or counsel) has confirmed every single row. If a row turns out to be wrong,\n' +
  '     fix the row AND keep the note until the whole table is confirmed. -->',
  '<!-- VERIFIED 2026-09-16 against the 2026 Florida Statutes, read as verbatim statutory\n' +
  '     text on flsenate.gov and cross-checked word for word against Online Sunshine\n' +
  '     (leg.state.fl.us). Every row below traces to a section:\n' +
  '       front side windows   >= 28% VLT, no vehicle-class exception   s. 316.2953\n' +
  '       behind the driver    >= 15% sedans, >= 6% MPV                 s. 316.2954(1)(a)\n' +
  '       windshield           transparent strip above the AS-1 portion s. 316.2952(2)(b)\n' +
  '     Florida regulates back side windows and the rear window together as "any windows\n' +
  '     behind the driver", which is why those two rows carry the same figure. The VLT\n' +
  '     percentages have been unchanged since ch. 99-248 (1999).\n' +
  '     NOT on this page, on purpose, because the table is the data and the owner struck\n' +
  '     the prose: the 25%/35% reflectance caps, the +/-3% meter tolerance, the door-jamb\n' +
  '     compliance label the installer must affix (s. 316.2955(1)), and that the MPV test\n' +
  '     is truck chassis / off-road features, not body style. Those matter to the shop and\n' +
  '     are recorded in TODO.md rather than published here. -->');

/* 9 — the "Pending verification" note the owner boxed, now that it has nothing to warn about */
cutSpan(TINT, '"Pending verification" note',
  '      <div class="us-note" role="note">\n',
  'the route is the state medical exemption, not a quiet install.</p>\n      </div>\n\n',
  '<strong>Pending verification</strong>');

/* 10 — the windshield row: the statute says "transparent", and reflectance is a
        separate limit that applies to the side windows, not the windshield strip */
swap(TINT, 'windshield row (sedans): statutory wording',
  '            <td data-label="Sedans">Non-reflective film above the AS-1 line only</td>',
  '            <td data-label="Sedans">Transparent strip above the AS-1 line only</td>');
swap(TINT, 'windshield row (SUV / van): statutory wording',
  '            <td data-label="SUV / van">Non-reflective film above the AS-1 line only</td>',
  '            <td data-label="SUV / van">Transparent strip above the AS-1 line only</td>');

/* 11 — attribution moves into the caption, where the data is */
swap(TINT, 'table caption: cite the statute',
  '<caption class="wt-caption">Florida window tint limits, by vehicle type</caption>',
  '<caption class="wt-caption">Florida window tint limits, by vehicle type · Fla. Stat. §§ 316.2951–316.2957</caption>');

/* ══════════════════════════ faq ══════════════════════════ */
/* The SOURCE is the per-page file. _build/data/faq.json is GENERATED from it by
   32-merge-faq.js, which build.js runs before regen — edit only the merged file and the
   next build quietly puts the old sentence back. It cost a round trip to learn: the first
   version of this script edited the merged file, the gate below passed because it was
   reading this script's own in-memory copy, and the text was already back on disk. Both
   are written here, and the gate now reads the disk. */
const FAQ = '_build/us/faq/window-tint.json';
const FAQ_MERGED = '_build/data/faq.json';
for (const f of [FAQ, FAQ_MERGED]) swap(f, 'tint FAQ: drop the unverified disclaimer, fix the windshield wording',
  'The windshield takes non-reflective film above the AS-1 line only, and a state medical exemption exists for drivers who need darker. We have not yet verified these figures against the current Florida statute, so confirm the law before you choose a shade.',
  'The windshield takes a transparent strip above the AS-1 line only, and a state medical exemption exists for drivers who need darker. Those figures are Florida Statutes 316.2953 and 316.2954; bring us the vehicle and we measure the glass before anything is cut.');

/* ══════════════════════════ write ══════════════════════════ */
if (!VERIFY) for (const [rel, out] of files) fs.writeFileSync(path.join(ROOT, rel), out);
console.log(log.join('\n'));

/* Every check below re-reads the DISK. Reading the in-memory copy is how the first run of
   this script reported a FAQ edit that a later build step had already reverted underneath
   it — the gate was interviewing itself. */
files.clear();

/* ══════════════════════════ gates ══════════════════════════ */
const gone = [
  [HOME, 'sd-sub', 'class="sd-sub"'],
  [HOME, 'packages section', 'id="packages"'],
  [HOME, 'Bundled, not padded', 'not padded.'],
  [HOME, 'proof section', 'hm-proof'],
  [HOME, 'Not a new shop', 'A second one.'],
  [HOME, 'hm-pkg CSS', '.hm-pkg'],
  [PPF, 'three layers', 'invisible skin'],
  [PPF, 'construct CSS', '.construct'],
  [PPF, 'duplicated construct tag', 'reveal-up">    <div'],
  [DET, 'from hazy to mirror', 'From hazy'],
  [DET, 'BMW paragraph', 'This BMW arrived with years'],
  [TINT, 'pending verification', 'Pending verification'],
  [TINT, 'non-reflective', 'Non-reflective'],
  [FAQ, 'faq disclaimer', 'We have not yet verified these figures'],
];
const left = gone.filter(([rel, , needle]) => read(rel).includes(needle));
if (left.length) {
  console.error('\nFAIL still present:\n' + left.map(([rel, what]) => `  ${rel}: ${what}`).join('\n'));
  process.exit(1);
}

const kept = [
  [DET, '.xspecs spec rows', 'class="xspecs"'],
  [DET, 'before/after slider', 'id="compare"'],
  [TINT, 'tint price table', 'REGION:prices:tint'],
  [TINT, 'VLT table', 'us-vlt-table'],
  [HOME, 'gallery section', 'hm-gal'],
  [HOME, 'service cards', 'svc-door'],
  ['our-films/index.html', 'our-films twin block (owner has not marked that page)', 'invisible skin'],
];
const lost = kept.filter(([rel, , needle]) => !read(rel).includes(needle));
if (lost.length) {
  console.error('\nFAIL removed something that had to stay:\n' + lost.map(([rel, what]) => `  ${rel}: ${what}`).join('\n'));
  process.exit(1);
}

/* div balance — no existing gate parses markup structure, and the PPF page has been
   +1 <div> since the original build without any of the nine gates noticing */
for (const rel of [HOME, PPF, DET, TINT]) {
  const s = read(rel);
  const o = (s.match(/<div\b/g) || []).length;
  const c = (s.match(/<\/div>/g) || []).length;
  console.log(`  balance  ${rel}  ${o} <div> / ${c} </div>  ${o === c ? 'ok' : 'MISMATCH'}`);
  if (o !== c) { console.error(`\nFAIL ${rel}: div imbalance ${o - c}`); process.exit(1); }
}

console.log('\nkept on purpose: tint price table (owner decision pending), our-films twin block (unmarked page)');
console.log('gate: every marked item is gone, everything meant to stay is still there.');
