/* 40-tint-removals.js — the owner-marked removals on /window-tint.

   Everything here was circled on a screenshot. Two deliberate exceptions, both flagged
   back to the owner rather than decided silently:

   1. The red box around "One tint. Ceramic film." reached the bottom of the screenshot
      and so enclosed the PRICE TABLE as well. The table is the only price on the page and
      published prices are the spec's central positioning, so the prose goes and the table
      stays until the owner says otherwise.

   2. The "Pending verification" note is NOT removed here. It is the only thing making the
      unverified Florida statute figures defensible to publish (spec section 6.5 explicitly
      requires the block be marked unverified, and TODO item 15 tracks it). Removing it
      leaves wrong VLT limits presented as fact on a page a customer may act on before a
      traffic stop. Held for an explicit decision.

   Usage: node _build/us/40-tint-removals.js
*/
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.resolve(__dirname, '..', '..', 'window-tint', 'index.html');
let s = fs.readFileSync(F, 'utf8');
const before = s;

function cut(label, needle) {
  if (!s.includes(needle)) throw new Error(`NOT FOUND (${label}): ${needle.slice(0, 80)}`);
  s = s.replace(needle, '');
  console.log('removed: ' + label);
}

/* 1. the IR / Heat rejection stat tile (marked green) */
cut('hero stat "IR / Heat rejection"',
  '        <div class="hstat"><b class="chrome-text">IR</b><span>Heat rejection</span></div>\n');

/* 2. the hero lead paragraph */
cut('hero lead paragraph',
  '    <p class="lead">One tint package, fitted properly: ceramic infrared-rejecting film on every side window and the rear glass. You pick how dark you want to go — we tell you what Florida allows before a single sheet is cut.</p>\n');

/* 3. "One tint. Ceramic film." heading block + the two copy paragraphs.
      The price region that follows is deliberately left in place. */
cut('section head "One tint. Ceramic film."',
  '    <div class="section-head reveal-up">\n' +
  '      <div>\n' +
  '        <span class="eyebrow">What we fit</span>\n' +
  '        <h2>One tint.<br>Ceramic film.</h2>\n' +
  '      </div>\n' +
  '      <p class="sh-note">No good / better / best ladder. There is one package, and it is the one we would put on our own car.</p>\n' +
  '    </div>\n\n');

cut('"Every side window and the rear glass" paragraph',
  "        <p>Every side window and the rear glass, in ceramic film. Ceramic means the heat rejection comes from the film's infrared-blocking layer rather than from how dark it is — so you are not forced to choose between a cool cabin and a legal one.</p>\n");

cut('"The film is plotted from the pattern" paragraph',
  '        <p>The film is plotted from the pattern for your exact make, model and year and cut off the car. No blade ever touches your glass or your defroster lines.</p>\n');

/* 4. Florida-law section head: heading + the VLT explainer */
cut('section head "How dark you are actually allowed to go."',
  '    <div class="section-head reveal-up">\n' +
  '      <div>\n' +
  '        <span class="eyebrow">Florida law</span>\n' +
  '        <h2>How dark you are actually allowed to go.</h2>\n' +
  '      </div>\n' +
  '      <p class="sh-note">VLT is visible light transmission: the percentage of light the glass plus film lets through. Lower number, darker window.</p>\n' +
  '    </div>\n\n');

/* 5. the medical-exemption table footer and the AS-1 explainer */
cut('medical exemption table footer',
  '        <tfoot>\n' +
  '          <tr>\n' +
  '            <td>A medical exemption exists in Florida for drivers who need darker film than the standard limit. It is granted by the state, not by an installer — bring us the paperwork and we will fit to what it allows.</td>\n' +
  '          </tr>\n' +
  '        </tfoot>\n');

cut('AS-1 line explainer',
  '      <p class="wt-law-foot">The AS-1 line is the mark etched near the top of most windshields. Above it is where a non-reflective strip is permitted; below it is the part you look through, and film does not belong there. Ask us for your vehicle and we will walk through it with the door open and a meter on the glass.</p>\n');

if (s === before) throw new Error('nothing changed');
fs.writeFileSync(F, s);

/* gates */
const left = [];
for (const [what, needle] of [
  ['IR stat', '<span>Heat rejection</span>'],
  ['hero lead', 'One tint package, fitted properly'],
  ['One tint heading', 'One tint.<br>Ceramic film.'],
  ['How dark heading', 'How dark you are actually allowed'],
  ['medical exemption', 'A medical exemption exists in Florida'],
  ['AS-1 explainer', 'The AS-1 line is the mark etched'],
]) if (s.includes(needle)) left.push(what);
if (left.length) { console.error('\nFAIL still present: ' + left.join(', ')); process.exit(1); }

const kept = [];
if (s.includes('REGION:prices:tint')) kept.push('price table (deliberate)');
if (s.includes('Pending verification')) kept.push('pending-verification note (deliberate, awaiting owner decision)');
console.log('\nkept on purpose: ' + kept.join('; '));
console.log('gate: every marked item is gone.');
