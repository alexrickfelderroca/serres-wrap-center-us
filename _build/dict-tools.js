/* Extract DICT from assets/serres-i18n.js and provide collision checks.
   Usage:
     node _build/dict-tools.js check                 -> report internal es/ca collisions
     node _build/dict-tools.js lookup "<es text>"    -> find entry by exact es value
     node _build/dict-tools.js merge <entries.json>  -> append dict_new + apply dict_changed
   entries.json: { dict_new: [{en,es,ca}], dict_changed: [{old_es,new_es,new_en,new_ca}] }
*/
const fs = require('fs');
const path = require('path');
const FILE = path.resolve(__dirname, '..', 'assets', 'serres-i18n.js');

function loadSrc() { return fs.readFileSync(FILE, 'utf8'); }

function extractDict(src) {
  const start = src.indexOf('var DICT = {');
  const open = src.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  const literal = src.slice(open, i + 1);
  const dict = new Function('return (' + literal + ')')();
  return { dict, open, close: i, literal };
}

function esc(s) {
  return JSON.stringify(s);
}

const cmd = process.argv[2];
const src = loadSrc();
const { dict, close } = extractDict(src);

if (cmd === 'check') {
  const seen = {};
  let bad = 0;
  for (const [k, v] of Object.entries(dict)) {
    [v[0], v[1]].forEach((val) => {
      if (!val) return;
      if (seen[val] && seen[val] !== k) { console.log('COLLISION:', JSON.stringify(val), '->', JSON.stringify(seen[val]), 'vs', JSON.stringify(k)); bad++; }
      if (!seen[val]) seen[val] = k;
    });
  }
  console.log('entries:', Object.keys(dict).length, 'collisions:', bad);
} else if (cmd === 'lookup') {
  const q = process.argv[3];
  let found = false;
  for (const [k, v] of Object.entries(dict)) {
    if (v[0] === q || v[1] === q || k === q) { console.log(JSON.stringify({ en: k, es: v[0], ca: v[1] })); found = true; }
  }
  if (!found) console.log('NOT FOUND');
} else if (cmd === 'merge') {
  const input = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  let out = src;
  const report = { appended: 0, skipped_same: 0, collisions: [], changed: 0, change_misses: [] };

  // Apply dict_changed first: replace es (and ca) values of the entry whose es === old_es.
  for (const ch of input.dict_changed || []) {
    const entry = Object.entries(dict).find(([, v]) => v[0] === ch.old_es);
    if (!entry) { report.change_misses.push(ch.old_es); continue; }
    const [k, v] = entry;
    // find the exact old value string in source (as JSON-escaped or raw) and replace
    const oldEsc = esc(ch.old_es);
    if (out.includes(oldEsc)) {
      out = out.replace(oldEsc, esc(ch.new_es));
      // update ca on the same entry: replace old ca string next to it if provided
      if (ch.new_ca && v[1] && out.includes(esc(v[1]))) out = out.replace(esc(v[1]), esc(ch.new_ca));
      report.changed++;
      dict[k] = [ch.new_es, ch.new_ca || v[1]];
    } else {
      report.change_misses.push(ch.old_es);
    }
  }

  // Build inverse for collision detection (post-changes)
  const inv = {};
  for (const [k, v] of Object.entries(dict)) {
    [v[0], v[1]].forEach((val) => { if (val && !inv[val]) inv[val] = k; });
  }

  const lines = [];
  for (const e of input.dict_new || []) {
    if (dict[e.en]) {
      if (dict[e.en][0] === e.es) { report.skipped_same++; continue; }
      report.collisions.push({ type: 'key', en: e.en, existing_es: dict[e.en][0], new_es: e.es });
      continue;
    }
    if (inv[e.es] && inv[e.es] !== e.en) {
      report.collisions.push({ type: 'es-value', es: e.es, existing_key: inv[e.es], new_key: e.en });
      continue;
    }
    lines.push('    ' + esc(e.en) + ': [' + esc(e.es) + ', ' + esc(e.ca) + '],');
    dict[e.en] = [e.es, e.ca];
    inv[e.es] = e.en; if (e.ca) inv[e.ca] = e.en;
    report.appended++;
  }

  if (lines.length) {
    // recompute close position on the mutated source
    const { close: c2 } = extractDict(out);
    const insertion = '\n    /* ---------- SEO package 2026-07-09: FAQ, keyword lines, blog ---------- */\n' + lines.join('\n') + '\n  ';
    out = out.slice(0, c2) + insertion + out.slice(c2);
  }
  fs.writeFileSync(FILE, out);
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('unknown cmd');
}
