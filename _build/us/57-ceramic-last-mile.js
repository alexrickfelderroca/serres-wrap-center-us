/* 57-ceramic-last-mile.js — STAGE 8: what verify-ceramic-withdrawn.js found after the
   gates were already green.

   All ten build gates passed with every one of these still on the page. That is the
   point of a purpose-built gate: verify-links only cares that an href RESOLVES, and none
   of these is a link. They are prose, a filter chip, image alt text, a meta description
   and two gallery tags — a customer reads all of them and a crawler indexes half.

   Usage: node _build/us/57-ceramic-last-mile.js
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
  if (i < 0) throw new Error(`NOT FOUND in ${f} (${label}):\n---\n${from.slice(0, 200)}\n---`);
  if (s.indexOf(from, i + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  files.set(f, s.slice(0, i) + to + s.slice(i + from.length));
  log.push(`  ${to === '' ? 'cut     ' : 'rewrote '} ${f.padEnd(28)} ${label}`);
}
function cutLine(f, label, substring) {
  const s = read(f);
  const at = s.indexOf(substring);
  if (at < 0) throw new Error(`NOT FOUND in ${f} (${label}): ${substring.slice(0, 120)}`);
  if (s.indexOf(substring, at + 1) >= 0) throw new Error(`AMBIGUOUS in ${f} (${label})`);
  const start = s.lastIndexOf('\n', at) + 1;
  let end = s.indexOf('\n', at);
  end = end < 0 ? s.length : end + 1;
  files.set(f, s.slice(0, start) + s.slice(end));
  log.push(`  cut line ${f.padEnd(28)} ${label}`);
}

/* ── 404: the meta description is hand-written here (404.html has no seo.json entry) ── */
/* Two edits, because cutting 'ceramic coating' dropped the description to 138 chars
   and spec 8.2 wants 140-155. Measured, not eyeballed. */
swap('404.html', 'meta description',
  'Links to paint protection film, wraps, ceramic coating, window tint, detailing and the price list at SERRES Wrap Center, Boca Raton.',
  'Links to paint protection film, wraps, window tint, detailing and the published price list at SERRES Wrap Center in Boca Raton.');

/* ── gallery: the filter chip, the tags a visitor reads, and the alt text ── */
cutLine('gallery/index.html', 'ceramic filter chip', 'data-us-gallery-service="ceramic"');
swap('gallery/index.html', 'Porsche exhibit service tags',
  '<section class="exhibit" id="porsche" data-services="ceramic detailing"',
  '<section class="exhibit" id="porsche" data-services="detailing"');
swap('gallery/index.html', 'Porsche visible tag chips',
  '<div class="ex-tags"><span>Studio</span><span>Detailing</span><span>Ceramic</span></div>',
  '<div class="ex-tags"><span>Studio</span><span>Detailing</span></div>');
swap('gallery/index.html', 'Supra exhibit service tags',
  '<section class="exhibit" id="supra" data-services="ceramic detailing"',
  '<section class="exhibit" id="supra" data-services="detailing"');
swap('gallery/index.html', 'Supra visible tag chips',
  '<div class="ex-tags"><span>Ceramic</span><span>Paint Correction</span></div>',
  '<div class="ex-tags"><span>Paint Correction</span></div>');
swap('gallery/index.html', 'Supra image alt text',
  'alt="Pearl-white Toyota GR Supra in profile after paint correction and ceramic sealing"',
  'alt="Pearl-white Toyota GR Supra in profile after paint correction"');
swap('gallery/index.html', 'caption tag — sealed pearl white',
  '<figcaption><span class="cap-note">Sealed pearl white</span><span class="cap-tag">Ceramic</span></figcaption>',
  '<figcaption><span class="cap-note">Pearl white</span><span class="cap-tag">Correction</span></figcaption>');
swap('gallery/index.html', 'caption tag — dappled light',
  '<figcaption><span class="cap-note">Dappled light</span><span class="cap-tag">Ceramic</span></figcaption>',
  '<figcaption><span class="cap-note">Dappled light</span><span class="cap-tag">Correction</span></figcaption>');

/* ── landers: body copy that sells the coating or the withdrawn bundles ── */
swap('ppf-boca-raton/index.html', 'package coverage line — both bundles are unpublished now',
  '<span class="pbr-more-cov">Daily Driver pairs a partial front with ceramic; New Car adds tint.</span>',
  '<span class="pbr-more-cov">Film on the panels that take the hits, tint on the glass.</span>');
swap('ppf-boca-raton/index.html', 'quote checklist item',
  '<li>Ceramic or tint at the same time?</li>', '<li>Tint at the same time?</li>');
swap('ppf-delray-beach/index.html', 'salt-and-sun paragraph',
  ' Film takes that load first. Ceramic over the top of it makes the whole car let go of dirt.',
  ' Film takes that load first, so the paint underneath never meets any of it.');
swap('ppf-delray-beach/index.html', 'quote checklist item',
  '<li>Whether ceramic or tint goes on at the same time.</li>',
  '<li>Whether tint goes on at the same time.</li>');

/* ── the empty section marker left where the ceramic price group was ── */
swap('pricing/index.html', 'empty CERAMIC section marker',
  '      <!-- ---------- CERAMIC ---------- -->\n\n', '');

/* ── a TODO that asks the owner about a service that no longer exists ── */
swap('about/index.html', 'TODO(owner) about launch dates',
  'confirm which of wraps, ceramic coating and window tint are bookable from Nov 13',
  'confirm which of wraps and window tint are bookable from Nov 13');

for (const [f, out] of files) fs.writeFileSync(path.join(ROOT, f), out);
console.log(log.join('\n'));
console.log('\nNEXT: node _build/us/verify-ceramic-withdrawn.js .  then  node _build/us/build.js');
