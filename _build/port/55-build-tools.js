/* 55-build-tools.js — adapt the inherited _build/ tooling to the Miami site.
     · _build/verify-seo.js: banned-claim regexes were Spanish-only -> add the English equivalents
       (the GA4 id and the blog slugs in its PAGES list are patched by 60-seo-domain.js / 80-blog.js)
     · _build/dict-tools.js: dictionary values are plain strings now ("key": "es"), no Catalan
     · root .gitignore: ignore _build/reports/ (checker output) and the screenshots folder
   Usage: node 55-build-tools.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 55-build-tools.js <siteRoot>'); process.exit(2); }

editFile(path.join(root, '_build', 'verify-seo.js'), (src, api) => {
  api.once(
    'const BANNED = [\n' +
    '  /10 años/i, /200 ?micras/i, /200 ?µm/i, /\\b9H\\b/, /subcontrat/i,\n' +
    '  /cristal líquido/i, /\\b1080\\b/, /medidor de brillo/i, /medidor de espesor/i,\n' +
    '];',
    'const BANNED = [\n' +
    '  // Spanish (kept: the ES dictionary values still go through the same pages)\n' +
    '  /10 años/i, /200 ?micras/i, /200 ?µm/i, /\\b9H\\b/, /subcontrat/i,\n' +
    '  /cristal líquido/i, /\\b1080\\b/, /medidor de brillo/i, /medidor de espesor/i,\n' +
    '  // English equivalents (Miami base language)\n' +
    '  /10[- ]years?/i, /200 ?microns?/i, /subcontract/i, /liquid[- ]glass/i, /gloss meter/i, /thickness gauge/i,\n' +
    '];', 'BANNED list');
});
console.log('verify-seo.js: English banned-claim patterns added');

editFile(path.join(root, '_build', 'dict-tools.js'), (src, api) => {
  api.once('/* Extract DICT from assets/serres-i18n.js and provide collision checks.', '/* Extract DICT from assets/serres-i18n.js and provide collision checks.\n   Miami port: values are plain strings ("English key": "español"); no Catalan.');
  api.once('     node _build/dict-tools.js check                 -> report internal es/ca collisions', '     node _build/dict-tools.js check                 -> report Spanish values shared by several keys (warning only)');
  api.once('   entries.json: { dict_new: [{en,es,ca}], dict_changed: [{old_es,new_es,new_en,new_ca}] }', '   entries.json: { dict_new: [{en,es}], dict_changed: [{old_es,new_es}] }');
  api.once('    [v[0], v[1]].forEach((val) => {\n      if (!val) return;', '    [v].forEach((val) => {\n      if (!val) return;');
  api.once("    if (v[0] === q || v[1] === q || k === q) { console.log(JSON.stringify({ en: k, es: v[0], ca: v[1] })); found = true; }", "    if (v === q || k === q) { console.log(JSON.stringify({ en: k, es: v })); found = true; }");
  api.once("    const entry = Object.entries(dict).find(([, v]) => v[0] === ch.old_es);", "    const entry = Object.entries(dict).find(([, v]) => v === ch.old_es);");
  api.once("      // update ca on the same entry: replace old ca string next to it if provided\n      if (ch.new_ca && v[1] && out.includes(esc(v[1]))) out = out.replace(esc(v[1]), esc(ch.new_ca));\n      report.changed++;\n      dict[k] = [ch.new_es, ch.new_ca || v[1]];", "      report.changed++;\n      dict[k] = ch.new_es;");
  api.once("    [v[0], v[1]].forEach((val) => { if (val && !inv[val]) inv[val] = k; });", "    [v].forEach((val) => { if (val && !inv[val]) inv[val] = k; });");
  api.once("      if (dict[e.en][0] === e.es) { report.skipped_same++; continue; }\n      report.collisions.push({ type: 'key', en: e.en, existing_es: dict[e.en][0], new_es: e.es });", "      if (dict[e.en] === e.es) { report.skipped_same++; continue; }\n      report.collisions.push({ type: 'key', en: e.en, existing_es: dict[e.en], new_es: e.es });");
  api.once("    lines.push('    ' + esc(e.en) + ': [' + esc(e.es) + ', ' + esc(e.ca) + '],');\n    dict[e.en] = [e.es, e.ca];\n    inv[e.es] = e.en; if (e.ca) inv[e.ca] = e.en;", "    lines.push('    ' + esc(e.en) + ': ' + esc(e.es) + ',');\n    dict[e.en] = e.es;\n    inv[e.es] = e.en;");
  api.once("    const insertion = '\\n    /* ---------- SEO package 2026-07-09: FAQ, keyword lines, blog ---------- */\\n' + lines.join('\\n') + '\\n  ';", "    const insertion = '\\n    /* ---------- dict-tools merge ---------- */\\n' + lines.join('\\n') + '\\n  ';");
});
console.log('dict-tools.js: adapted to string values');

editFile(path.join(root, '.gitignore'), (src, api) => {
  let s = src.replace(/\.bak-2026-07-09\/\n/, '');
  // Barcelona-only working folders (never existed in this tree)
  s = s.replace(/# Working material — never publish \(contains client photos & internal docs\)\n(?:.*\n){4}\n?/, '');
  if (!/_build\/reports\//.test(s)) s = s.replace('# Build tooling deps', '# Port checker output\n_build/reports/\n\n# Build tooling deps');
  api.set(s);
});
console.log('.gitignore: Barcelona working folders removed, _build/reports/ ignored');
