/* 55-ceramic-gate-fixes.js — STAGE 6: the three things the GATES found.

   Stages 1-5 worked from a 234-item map. These three came from the gates instead, after
   the map was exhausted:

     verify-links   two hand-written links to the deleted page, on /about and /contact.
     verify-prices  the /pricing package cards were still rendering three items that
                    stage 1 had set to published:false. The gate's exact words were
                    'unpublished item "daily-driver" must not render at launch' — the same
                    rule that keeps the Phase 2 SKUs off the page caught this for free.

   That is the argument for the gates over the map: a person reading a 234-line list walks
   past the three lines that matter. The price gate does not.

   Usage: node _build/us/55-ceramic-gate-fixes.js
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const log = [];

function edit(rel, fn) {
  const p = path.join(ROOT, rel);
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before, rel);
  if (after === before) throw new Error(`no change made to ${rel}`);
  fs.writeFileSync(p, after);
}

function swap(s, rel, label, from, to) {
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`NOT FOUND in ${rel} (${label}): ${from.slice(0, 140)}`);
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label})`);
  log.push(`  rewrote  ${rel.padEnd(24)} ${label}`);
  return s.slice(0, i) + to + s.slice(i + from.length);
}

/* Cut from the line that opens `openTag` to the line that carries its closing tag, found
   by counting opening and closing tags with plain indexOf. No regex: the escaping games
   needed to get `<a\b` through a shell one-liner produced a pattern that matched nothing
   and reported it as unbalanced markup. */
function cutBlock(s, rel, label, anchor, tag) {
  const at = s.indexOf(anchor);
  if (at < 0) throw new Error(`NOT FOUND in ${rel} (${label}): ${anchor.slice(0, 120)}`);
  if (s.indexOf(anchor, at + 1) >= 0) throw new Error(`AMBIGUOUS in ${rel} (${label})`);
  const openTag = '<' + tag;
  const closeTag = '</' + tag + '>';
  const openAt = s.lastIndexOf(openTag, at);
  if (openAt < 0) throw new Error(`no enclosing ${openTag} in ${rel} (${label})`);
  const start = s.lastIndexOf('\n', openAt) + 1;
  let depth = 0, i = openAt, end = -1;
  while (i < s.length && i >= 0) {
    const o = s.indexOf(openTag, i);
    const c = s.indexOf(closeTag, i);
    if (c < 0) break;
    if (o >= 0 && o < c) { depth++; i = o + openTag.length; continue; }
    depth--; i = c + closeTag.length;
    if (depth === 0) { end = i; break; }
  }
  if (end < 0) throw new Error(`unbalanced ${openTag} in ${rel} (${label})`);
  while (s[end] === '\r') end++;
  if (s[end] === '\n') end++;
  const span = s.slice(start, end);
  if (!/ceramic/i.test(span)) throw new Error(`span for ${label} has no ceramic in it — wrong block`);
  if (span.split('\n').length > 60) throw new Error(`span for ${label} is ${span.split('\n').length} lines — too big, wrong block`);
  log.push(`  cut      ${rel.padEnd(24)} ${label} (${span.split('\n').length} lines)`);
  return s.slice(0, start) + s.slice(end);
}

/* ─────────────── /about — the "disciplines" card grid ─────────────── */
edit('about/index.html', (s, rel) => {
  s = cutBlock(s, rel, 'discipline card 04 — ceramic coating', '<a class="ab-disc" href="../ceramic-coating/">', 'a');
  s = swap(s, rel, 'renumber disciplines 05->04', '<span class="ab-disc-no">05</span>', '<span class="ab-disc-no">04</span>');
  s = swap(s, rel, 'renumber disciplines 06->05', '<span class="ab-disc-no">06</span>', '<span class="ab-disc-no">05</span>');
  return s;
});

/* ─────────────── /contact — the opening-programme sentence ─────────────── */
edit('contact/index.html', (s, rel) => swap(s, rel, 'opening-programme sentence',
  '<a class="cn-link" href="../car-wraps/">wraps</a>, <a class="cn-link" href="../ceramic-coating/">ceramic</a> and',
  '<a class="cn-link" href="../car-wraps/">wraps</a> and'));

/* ─────────────── /pricing — the bundles ─────────────── */
edit('pricing/index.html', (s, rel) => {
  s = cutBlock(s, rel, 'the packages section — all three bundles are now unpublished',
    '<section class="prc-packages" id="packages"', 'section');
  s = swap(s, rel, 'in-page nav entry for packages', '      <a href="#packages">Packages</a>\n', '');
  return s;
});

console.log(log.join('\n'));
console.log('\nNEXT: node _build/us/build.js');
