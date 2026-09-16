/* 30-geo-copy.js — Step 2/4 (copy): Barcelona -> Miami in the i18n dictionary and the inline English copy.
   Reads _build/port/geo-map.json: [{ en, newEn, newEs, note? }] (authored + reviewed; no invented facts).
   Renames each dictionary key (EN) and its Spanish value, and replaces the old key text wherever it appears
   in the HTML (inline text, alt/aria/title, meta, JSON-LD). Aborts if a key is unknown.
   Usage: node 30-geo-copy.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { renameEntries, pages, loadDict } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 30-geo-copy.js <siteRoot>'); process.exit(2); }
const file = path.join(__dirname, 'geo-map.json');
if (!fs.existsSync(file)) { console.log('SKIPPED — geo-map.json not present yet'); process.exit(0); }
const map = JSON.parse(fs.readFileSync(file, 'utf8')).filter(m => m.newEn && m.newEn !== m.en || m.newEs != null);
const dict = loadDict(root);
const dupes = map.map(m => m.newEn || m.en).filter((k, i, a) => a.indexOf(k) !== i);
if (dupes.length) { console.error('duplicate target keys:', dupes); process.exit(1); }
const clash = map.filter(m => m.newEn && m.newEn !== m.en && Object.prototype.hasOwnProperty.call(dict, m.newEn));
if (clash.length) { console.error('target keys already exist:', clash.map(c => c.newEn)); process.exit(1); }
const counts = renameEntries(root, pages(root), map);
const untouched = map.filter(m => m.newEn && m.newEn !== m.en && !counts[m.en]);
console.log(`geo copy: ${map.length} dictionary entries updated; ${Object.values(counts).reduce((a, b) => a + b, 0)} inline replacements in HTML`);
if (untouched.length) console.log(`  (${untouched.length} renamed keys had no inline occurrence — used only via T() in page JS or not on any page):\n   - ` + untouched.map(u => u.en.slice(0, 80)).join('\n   - '));
