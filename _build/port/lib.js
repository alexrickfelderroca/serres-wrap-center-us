/* lib.js — shared helpers for the Miami port steps (CRLF-safe, asserted edits). */
'use strict';
const fs = require('fs');
const path = require('path');

/* Read a text file, normalise to LF, hand it to fn(src, api), write back with the original EOL. */
function editFile(file, fn) {
  const raw = fs.readFileSync(file, 'utf8');
  const EOL = raw.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  let src = raw.replace(/\r\n/g, '\n');
  const before = src;
  const api = {
    /* replace `from` with `to`; must match exactly once */
    once(from, to, label) {
      const i = src.indexOf(from);
      if (i < 0) throw new Error(`${path.basename(file)}: NOT FOUND — ${label || from.slice(0, 60)}`);
      if (src.indexOf(from, i + 1) >= 0) throw new Error(`${path.basename(file)}: AMBIGUOUS — ${label || from.slice(0, 60)}`);
      src = src.slice(0, i) + to + src.slice(i + from.length);
    },
    /* replace a regex; must match exactly `count` times (default 1) */
    re(regex, to, label, count = 1) {
      const g = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
      const n = (src.match(g) || []).length;
      if (n !== count) throw new Error(`${path.basename(file)}: expected ${count} match(es) for ${label || regex}, got ${n}`);
      src = src.replace(g, to);
    },
    /* replace every occurrence; returns the count (0 allowed unless min given) */
    all(from, to, min = 0) {
      const n = src.split(from).length - 1;
      if (n < min) throw new Error(`${path.basename(file)}: expected >= ${min} of ${JSON.stringify(from.slice(0, 60))}, got ${n}`);
      if (n) src = src.split(from).join(to);
      return n;
    },
    get() { return src; },
    set(s) { src = s; },
  };
  fn(src, api);
  if (src !== before) fs.writeFileSync(file, src.replace(/\n/g, EOL));
  return src !== before;
}

/* ---- dictionary helpers (assets/serres-i18n.js, post-migration: "key": "value") ---- */
function dictFile(root) { return path.join(root, 'assets', 'serres-i18n.js'); }
function dictBounds(src) {
  const start = src.indexOf('var DICT = {');
  const open = src.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') { depth--; if (depth === 0) break; } }
  return { open, close: i };
}
function loadDict(root) {
  const src = fs.readFileSync(dictFile(root), 'utf8');
  const { open, close } = dictBounds(src);
  return new Function('return (' + src.slice(open, close + 1) + ')')();
}
const js = s => JSON.stringify(s);
/* append entries under a section comment; skips keys that already exist with the same value, throws on conflicts */
function addEntries(root, section, entries) {
  return editFile(dictFile(root), (src, api) => {
    const dict = loadDict(root);
    const lines = [];
    for (const e of entries) {
      if (Object.prototype.hasOwnProperty.call(dict, e.en)) {
        if (dict[e.en] === e.es) continue;
        throw new Error(`dictionary conflict for key ${js(e.en)}: has ${js(dict[e.en])}, wanted ${js(e.es)}`);
      }
      lines.push('    ' + js(e.en) + ': ' + js(e.es) + ',');
    }
    if (!lines.length) return;
    const { close } = dictBounds(api.get());
    const s = api.get();
    api.set(s.slice(0, close) + '\n    /* ---------- ' + section + ' ---------- */\n' + lines.join('\n') + '\n  ' + s.slice(close));
  });
}
/* rename a key and/or change its value; every occurrence of the old key in the given HTML files is replaced too */
function renameEntries(root, htmlFiles, changes) {
  // changes: [{en, newEn?, newEs?}]
  const dict = loadDict(root);
  const misses = changes.filter(c => !Object.prototype.hasOwnProperty.call(dict, c.en)).map(c => c.en);
  if (misses.length) throw new Error('renameEntries: unknown keys:\n' + misses.map(js).join('\n'));
  editFile(dictFile(root), (src, api) => {
    for (const c of changes) {
      const oldLine = '    ' + js(c.en) + ': ' + js(dict[c.en]) + ',';
      const idx = src.indexOf(oldLine);
      const newLine = '    ' + js(c.newEn || c.en) + ': ' + js(c.newEs != null ? c.newEs : dict[c.en]) + ',';
      if (idx >= 0) api.once(oldLine, newLine, 'dict line ' + c.en.slice(0, 40));
      else {
        // multi-line or differently-escaped entry: fall back to key-only replace + value replace within the entry
        const keyLit = js(c.en) + ':';
        api.once(keyLit, js(c.newEn || c.en) + ':', 'dict key ' + c.en.slice(0, 40));
        if (c.newEs != null) {
          const s = api.get(); const k = s.indexOf(js(c.newEn || c.en) + ':'); const valStart = s.indexOf('"', k + (js(c.newEn || c.en) + ':').length);
          // find end of JSON string literal
          let j = valStart + 1; while (j < s.length) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === '"') break; j++; }
          api.set(s.slice(0, valStart) + js(c.newEs) + s.slice(j + 1));
        }
      }
    }
  });
  const counts = {};
  for (const f of htmlFiles) {
    editFile(f, (src, api) => {
      for (const c of changes) {
        if (!c.newEn || c.newEn === c.en) continue;
        // whole-value only: a text node (>…<), an attribute value ("…"), a JS/JSON string literal — never a substring of
        // a longer string ("Collserola" inside an alt, or one key nested in a longer heading key)
        let n = 0;
        for (const [from, to] of encodeText(c.en) !== c.en ? [[encodeText(c.en), encodeText(c.newEn)], [c.en, c.newEn]] : [[c.en, c.newEn]]) {
          const re = new RegExp('(?<=[>"\'`]\\s*)' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=\\s*[<"\'`])', 'g');
          const s = api.get(); const m = s.match(re); if (!m) continue;
          n += m.length; api.set(s.replace(re, to.replace(/\$/g, '$$$$')));
        }
        if (n) counts[c.en] = (counts[c.en] || 0) + n;
      }
    });
  }
  return counts;
}
function encodeText(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const PAGES_STATIC = [
  'index.html',
  'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html',
  'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html',
  'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html',
  'blog/index.html',
];
function pages(root) {
  const blog = fs.readdirSync(path.join(root, 'blog')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => 'blog/' + f).sort();
  return PAGES_STATIC.concat(blog).map(p => path.join(root, p));
}
function walkFiles(dir, filter) {
  const out = [];
  (function rec(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.git') rec(p); } else if (!filter || filter(p)) out.push(p); } })(dir);
  return out;
}
function textFiles(root) {
  return walkFiles(root, p => /\.(html|js|mjs|css|xml|txt|json|md)$|\.htaccess$/.test(p));
}

module.exports = { editFile, loadDict, addEntries, renameEntries, dictFile, pages, walkFiles, textFiles, encodeText, js };
