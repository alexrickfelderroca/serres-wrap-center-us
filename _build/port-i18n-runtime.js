/* port-i18n-runtime.js — one-shot migration of assets/serres-i18n.js for the Miami port.
   Base language becomes ENGLISH; the dictionary is applied forward (EN key -> ES value).
     1. LANGS = ["en","es"], LABELS without "ca", default language "en"
     2. DICT values ["español","català"]  ->  "español"   (Catalan pruned)
     3. INV (inverted ES->EN index) removed; enKeyOf(core) only accepts English keys
     4. tr() reads string values
     5. Header comments updated
   Usage: node port-i18n-runtime.js <siteRoot>
   Every replacement is asserted to match exactly once — the script aborts (no write) otherwise.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root) { console.error('usage: node port-i18n-runtime.js <siteRoot>'); process.exit(2); }
const FILE = path.join(root, 'assets', 'serres-i18n.js');
const rawSrc = fs.readFileSync(FILE, 'utf8');
const EOL = rawSrc.indexOf('\r\n') >= 0 ? '\r\n' : '\n';   // preserve the file's line endings
let src = rawSrc.replace(/\r\n/g, '\n');
const before = src;

function once(from, to, label) {
  const idx = src.indexOf(from);
  if (idx < 0) throw new Error('NOT FOUND: ' + label);
  if (src.indexOf(from, idx + 1) >= 0) throw new Error('AMBIGUOUS (>1 match): ' + label);
  src = src.slice(0, idx) + to + src.slice(idx + from.length);
}

/* ---- 1. dictionary literal bounds ---- */
const start = src.indexOf('var DICT = {');
const open = src.indexOf('{', start);
let depth = 0, close = open;
for (; close < src.length; close++) {
  if (src[close] === '{') depth++;
  else if (src[close] === '}') { depth--; if (depth === 0) break; }
}
const literal = src.slice(open, close + 1);
const dictBefore = new Function('return (' + literal + ')')();
const nKeys = Object.keys(dictBefore).length;
const shapes = {};
for (const k of Object.keys(dictBefore)) { const v = dictBefore[k]; const s = Array.isArray(v) ? 'array' + v.length : typeof v; shapes[s] = (shapes[s] || 0) + 1; }
console.log('DICT keys:', nKeys, 'value shapes:', JSON.stringify(shapes));

/* ---- 2. prune catalan: "key": ["es", "ca"] -> "key": "es" ---- */
const STR = '"(?:[^"\\\\]|\\\\.)*"';
const pairRe = new RegExp('(' + STR + ')(\\s*:\\s*)\\[\\s*(' + STR + ')\\s*,\\s*(' + STR + ')\\s*\\]', 'g');
let n = 0;
const newLiteral = literal.replace(pairRe, (m, k, colon, es, ca) => { n++; return k + colon + es; });
if (n !== nKeys) throw new Error(`pruned ${n} pairs but dictionary has ${nKeys} keys — shapes differ, aborting`);
const dictAfter = new Function('return (' + newLiteral + ')')();
for (const k of Object.keys(dictBefore)) {
  if (dictAfter[k] !== dictBefore[k][0]) throw new Error('value mismatch after prune for key ' + JSON.stringify(k));
}
src = src.slice(0, open) + newLiteral + src.slice(close + 1);

/* ---- 3. runtime constants ---- */
once('var LANGS = ["en", "es", "ca"];', 'var LANGS = ["en", "es"];', 'LANGS');
once('var LABELS = { en: "EN", es: "ES", ca: "CA" };', 'var LABELS = { en: "EN", es: "ES" };', 'LABELS');
once('return LANGS.indexOf(l) >= 0 ? l : "es";', 'return LANGS.indexOf(l) >= 0 ? l : "en";', 'default lang');

/* ---- 4. INV block + enKeyOf ---- */
const invRe = /\n  \/\* =+\n     INVERTED INDEX[\s\S]*?function enKeyOf\(core\) \{[\s\S]*?\n  \}\n/;
if (!invRe.test(src)) throw new Error('INV block not found');
if (src.match(new RegExp(invRe.source, 'g')).length !== 1) throw new Error('INV block ambiguous');
src = src.replace(invRe,
  '\n  /* resolve a DOM text core to its dictionary key — the HTML is authored in\n' +
  '     English, so the core IS the key (no inverted index needed) */\n' +
  '  function enKeyOf(core) {\n' +
  '    return DICT.hasOwnProperty(core) ? core : null;\n' +
  '  }\n');

/* ---- 5. tr() ---- */
once(
  '  function tr(core) {\n' +
  '    if (current === "en") return core;\n' +
  '    var e = DICT[core];\n' +
  '    if (!e) return core;\n' +
  '    var v = current === "es" ? e[0] : e[1];\n' +
  '    return v == null ? core : v;\n' +
  '  }',
  '  function tr(core) {\n' +
  '    if (current === "en") return core;\n' +
  '    var v = DICT[core];\n' +
  '    return v == null ? core : v;\n' +
  '  }', 'tr()');

/* ---- 5b. translate alt text too (the Miami base ships English alt text; Spanish comes from the dictionary) ---- */
once('  var ATTRS = ["aria-label", "title"];', '  var ATTRS = ["aria-label", "title", "alt"];', 'ATTRS');
once('    var els = root.querySelectorAll("[aria-label],[title]");', '    var els = root.querySelectorAll("[aria-label],[title],[alt]");', 'attr selector');

/* ---- 5c. data-en becomes the forward-mode disambiguation hatch:
        <span data-en="The (blog)">The</span> renders its own text in EN and DICT["The (blog)"] in ES,
        so short words whose Spanish depends on context ("The" -> "El"/"La") can be keyed explicitly. ---- */
once(
  '  /* explicit keyed elements: <span data-en="a reality"></span> */\n' +
  '  function bindKeyed(el) {',
  '  /* explicit keyed elements — forward-mode hatch for context-dependent words:\n' +
  '     <span data-en="The (blog)">The</span> keeps its own text in EN and renders\n' +
  '     DICT["The (blog)"] in ES (the key never has to equal the visible text) */\n' +
  '  function bindKeyed(el) {', 'bindKeyed comment');
once(
  '    var b = { el: el, lead: a.lead, core: a.core, trail: a.trail };\n' +
  '    keyBindings.push(b);',
  '    var b = { el: el, lead: a.lead, core: a.core, trail: a.trail, en: el.textContent };\n' +
  '    keyBindings.push(b);', 'bindKeyed binding');
once(
  '  function applyKeyed(b) {\n' +
  '    var v = tr(b.core);\n' +
  '    var out = v ? b.lead + v + b.trail : "";',
  '  function applyKeyed(b) {\n' +
  '    if (current === "en") { if (b.el.textContent !== b.en) b.el.textContent = b.en; return; }\n' +
  '    var v = tr(b.core);\n' +
  '    var out = v ? b.lead + v + b.trail : "";', 'applyKeyed EN branch');

/* ---- 6. comments ---- */
once('   SERRES — site-wide language switcher (EN / ES / CA)', '   SERRES — site-wide language switcher (EN / ES)', 'header title');
once(
  '   • The static HTML ships in SPANISH (SEO base language). This script\n' +
  '     reversibly translates static DOM text nodes + a few attributes\n' +
  '     against a curated EN→{es,ca} dictionary, matched in reverse via an\n' +
  '     inverted ES→EN index (INV). Anything not in the dictionary is left\n' +
  '     untouched (graceful — car names, 3M film names, codes, place\n' +
  '     names, PPF/SiO₂/3M, units, etc. stay as-is).',
  '   • The static HTML ships in ENGLISH (SEO base language). This script\n' +
  '     reversibly translates static DOM text nodes + a few attributes\n' +
  '     against a curated EN→ES dictionary: the inline English text must\n' +
  '     match a dictionary key byte-for-byte. Anything not in the dictionary\n' +
  '     is left untouched (graceful — car names, film names, codes, place\n' +
  '     names, PPF/SiO₂/3M, units, etc. stay as-is).', 'header bullet 1');
once(
  '   • Elements with data-en="English key" render tr(key) as their text —\n' +
  '     used for fragments whose Spanish rendition is empty ("").',
  '   • A dictionary value of "" renders nothing in Spanish (used for inline\n' +
  '     fragments whose words reflow into other fragments).', 'header bullet 2');
once('   • Injects a segmented EN/ES/CA switcher into the desktop nav and the', '   • Injects a segmented EN/ES switcher into the desktop nav and the', 'header bullet 3');
once(
  '     DICTIONARY  —  "English source" : ["español", "català"]\n' +
  '     A value of "" means: render nothing in that language (used for\n' +
  '     inline-split headings whose words reflow into other fragments).',
  '     DICTIONARY  —  "English source" : "español"\n' +
  '     A value of "" means: render nothing in Spanish (used for\n' +
  '     inline-split headings whose words reflow into other fragments).', 'dict comment');

if (src === before) throw new Error('nothing changed');
fs.writeFileSync(FILE, src.replace(/\n/g, EOL));
/* final sanity: file parses, dictionary loads with string values */
new Function(src);
const s2 = src.indexOf('var DICT = {'); const o2 = src.indexOf('{', s2); let d2 = 0, c2 = o2;
for (; c2 < src.length; c2++) { if (src[c2] === '{') d2++; else if (src[c2] === '}') { d2--; if (d2 === 0) break; } }
const dictFinal = new Function('return (' + src.slice(o2, c2 + 1) + ')')();
const bad = Object.keys(dictFinal).filter(k => typeof dictFinal[k] !== 'string');
console.log('migrated:', FILE, '| keys:', Object.keys(dictFinal).length, '| non-string values:', bad.length, '| size', before.length, '->', src.length);
if (bad.length) process.exit(1);
