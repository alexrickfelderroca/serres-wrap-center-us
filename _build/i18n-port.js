/* i18n-port.js — static HTML tokenizer + string classifier for the SERRES Miami port.
   Mirrors the runtime rules of assets/serres-i18n.js:
     · text nodes except inside SCRIPT/STYLE/TEXTAREA, inside [data-i18n-skip] ancestors,
       or whose direct parent carries data-en
     · attributes aria-label + title (same skip rules)
     · <title> and <meta name="description"> content
     · affix(): strip leading/trailing whitespace and one pair of wrapping quotes "…" / “…”
   Modes:
     node i18n-port.js analyze <siteRoot> <outDir> [allow.txt]    -> dry-run classification per page (no writes to site)
     node i18n-port.js transform <siteRoot> <outDir> [allow.txt]  -> write EN-base copies of pages into outDir (mirrors tree)
   Classification of every translatable string core:
     KEY      already an English dictionary key
     INV      Spanish value found in dictionary -> maps to English key
     NEUTRAL  no letters at all (numbers, symbols) or explicitly allow-listed
     ORPHAN   has letters, not in dictionary in either direction
*/
'use strict';
const fs = require('fs');
const path = require('path');

const PAGES = [
  'index.html',
  'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html',
  'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html',
  'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html',
  'blog/index.html',
  'blog/cuanto-cuesta-vinilar-un-coche.html', 'blog/ppf-o-ceramico-que-elegir.html',
  'blog/cuanto-cuesta-ppf-coche.html', 'blog/limpieza-tapiceria-coche-precio.html',
];

/* ---------- dictionary ---------- */
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
  return { dict, open, close: i };
}
function buildInv(dict) {
  const inv = {};
  for (const k of Object.keys(dict)) {
    const raw = Array.isArray(dict[k]) ? dict[k][0] : dict[k];
    const v = (raw || '').replace(/^\s+|\s+$/g, '');
    if (v && !Object.prototype.hasOwnProperty.call(inv, v)) inv[v] = k;
  }
  return inv;
}

/* ---------- entities ---------- */
const NBSP = ' ';
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: NBSP, mdash: '—', ndash: '–',
  hellip: '…', middot: '·', rarr: '→', larr: '←', copy: '©', reg: '®', trade: '™',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', euro: '€',
  times: '×', deg: '°', bull: '•', eacute: 'é', aacute: 'á', iacute: 'í', oacute: 'ó',
  uacute: 'ú', ntilde: 'ñ', Eacute: 'É', Aacute: 'Á', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  Ntilde: 'Ñ', uuml: 'ü', ccedil: 'ç', iquest: '¿', iexcl: '¡', ordm: 'º', ordf: 'ª' };
function decode(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return Object.prototype.hasOwnProperty.call(NAMED, e) ? NAMED[e] : m;
  });
}
function encodeText(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'); }
function encodeAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'); }

/* ---------- affix (same as runtime) ---------- */
function affix(raw) {
  let lead = '', trail = '', core = raw, m;
  if ((m = core.match(/^\s+/))) { lead = m[0]; core = core.slice(m[0].length); }
  if ((m = core.match(/\s+$/))) { trail = m[0]; core = core.slice(0, core.length - m[0].length); }
  if (core.length > 1) {
    const f = core.charAt(0), l = core.charAt(core.length - 1);
    if ((f === '“' || f === '"') && (l === '”' || l === '"')) { lead += f; trail = l + trail; core = core.slice(1, core.length - 1); }
  }
  return { lead, core, trail };
}

/* ---------- tokenizer ---------- */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
function tokenize(html) {
  const toks = [];
  let i = 0, line = 1;
  const push = (t) => { t.line = line; toks.push(t); line += (t.raw.match(/\n/g) || []).length; };
  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const j = html.indexOf('-->', i); const end = j < 0 ? html.length : j + 3;
      push({ type: 'comment', raw: html.slice(i, end) }); i = end; continue;
    }
    if (html[i] === '<' && /[a-zA-Z!\/?]/.test(html[i + 1] || '')) {
      let j = i + 1, q = null;
      while (j < html.length) {
        const c = html[j];
        if (q) { if (c === q) q = null; }
        else if (c === '"' || c === "'") q = c;
        else if (c === '>') break;
        j++;
      }
      const raw = html.slice(i, j + 1);
      const m = raw.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)/);
      if (!m) { push({ type: 'other', raw }); i = j + 1; continue; }
      const closing = !!m[1], name = m[2].toLowerCase();
      const selfClosing = /\/\s*>$/.test(raw);
      const tok = { type: closing ? 'close' : 'open', name, raw, selfClosing };
      if (!closing) tok.attrs = parseAttrs(raw);
      push(tok); i = j + 1;
      if (!closing && RAW.has(name) && !selfClosing) {
        const re = new RegExp('</' + name + '\\s*>', 'i');
        const mm = re.exec(html.slice(i));
        const end = mm ? i + mm.index : html.length;
        push({ type: 'rawtext', name, raw: html.slice(i, end) }); i = end;
      }
      continue;
    }
    let j = html.indexOf('<', i); if (j < 0) j = html.length;
    push({ type: 'text', raw: html.slice(i, j) }); i = j;
  }
  return toks;
}
function parseAttrs(raw) {
  const attrs = [];
  const body = raw.replace(/^<[a-zA-Z][a-zA-Z0-9:-]*/, '').replace(/\/?>$/, '');
  const re = /([^\s"'=<>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(body))) {
    attrs.push({ name: m[1], value: m[3] != null ? m[3] : m[4] != null ? m[4] : m[5] != null ? m[5] : null, quote: m[3] != null ? '"' : m[4] != null ? "'" : '', match: m[0] });
  }
  return attrs;
}
function attr(tok, name) { const a = (tok.attrs || []).find(x => x.name.toLowerCase() === name); return a ? a : null; }

/* ---------- walk: yields translatable slots with context ---------- */
function walk(toks, onSlot) {
  const stack = []; // {name, skip, dataEn}
  const inSkip = () => stack.some(s => s.skip);
  const parent = () => stack[stack.length - 1];
  for (let idx = 0; idx < toks.length; idx++) {
    const t = toks[idx];
    if (t.type === 'open') {
      const skip = !!attr(t, 'data-i18n-skip');
      const dataEn = attr(t, 'data-en');
      const ancestorSkip = inSkip();
      if (!ancestorSkip && !skip) {
        for (const an of ['aria-label', 'title', 'alt']) {
          const a = attr(t, an);
          if (a && a.value != null && a.value.trim()) onSlot({ kind: 'attr', attr: an, tok: t, idx, raw: decode(a.value), line: t.line, a });
        }
        if (dataEn && dataEn.value) onSlot({ kind: 'data-en', tok: t, idx, raw: decode(dataEn.value), line: t.line, a: dataEn });
      }
      if (t.name === 'meta') {
        // description (runtime-translated) + OG/Twitter title & description (static, must be in the base language)
        const n = attr(t, 'name'); const p = attr(t, 'property'); const c = attr(t, 'content');
        const id = (n && n.value) || (p && p.value) || '';
        if (/^(description|twitter:title|twitter:description|og:title|og:description)$/.test(id) && c && c.value) onSlot({ kind: 'meta', meta: id, tok: t, idx, raw: decode(c.value), line: t.line, a: c });
      }
      if (!VOID.has(t.name) && !t.selfClosing) stack.push({ name: t.name, skip: skip || ancestorSkip, dataEn: !!dataEn });
    } else if (t.type === 'close') {
      for (let s = stack.length - 1; s >= 0; s--) if (stack[s].name === t.name) { stack.length = s; break; }
    } else if (t.type === 'rawtext') {
      if (t.name === 'title') onSlot({ kind: 'title', tok: t, idx, raw: decode(t.raw), line: t.line });
    } else if (t.type === 'text') {
      if (!t.raw.trim()) continue;
      const p = parent();
      if (inSkip()) { onSlot({ kind: 'skipped', tok: t, idx, raw: decode(t.raw), line: t.line, parent: p && p.name }); continue; }
      if (p && p.dataEn) continue;
      onSlot({ kind: 'text', tok: t, idx, raw: decode(t.raw), line: t.line, parent: p && p.name });
    }
  }
}

function hasLetters(s) { return /[A-Za-zÀ-ɏ]/.test(s); }

function classify(core, dict, inv, allow) {
  if (Object.prototype.hasOwnProperty.call(dict, core)) return 'KEY';
  if (Object.prototype.hasOwnProperty.call(inv, core)) return 'INV';
  if (!hasLetters(core)) return 'NEUTRAL';
  if (allow.has(core)) return 'NEUTRAL';
  return 'ORPHAN';
}

function analyzePage(html, dict, inv, allow) {
  const toks = tokenize(html);
  const slots = [];
  walk(toks, (s) => {
    const a = affix(s.raw);
    if (!a.core) return;
    const cls = s.kind === 'skipped' ? 'SKIPPED' : classify(a.core, dict, inv, allow);
    slots.push({ kind: s.kind, line: s.line, core: a.core, cls, parent: s.parent, key: cls === 'INV' ? inv[a.core] : cls === 'KEY' ? a.core : null });
  });
  return { toks, slots };
}

/* lead/trail of the ORIGINAL raw (whitespace + wrapping quote), to restore around the new core */
function splitRaw(raw) {
  const a = affix(raw);
  return { lead: a.lead, trail: a.trail };
}
function replaceAttr(tok, a, newValue) {
  const q = a.quote || '"';
  const enc = q === '"' ? encodeAttr(newValue) : newValue.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  const newMatch = a.name + '=' + q + enc + q;
  tok.raw = tok.raw.replace(a.match, newMatch);
  a.value = newValue; a.match = newMatch;
}

function transformPage(html, dict, inv, allow, report) {
  const toks = tokenize(html);
  const edits = [];
  walk(toks, (s) => {
    const a = affix(s.raw);
    if (!a.core) return;
    if (s.kind === 'skipped') return;
    if (s.kind === 'data-en') {
      const key = a.core;
      edits.push({ idx: s.idx, fn: t => {
        t.raw = t.raw.replace(/\s+data-en\s*=\s*("[^"]*"|'[^']*')/, '');
        const next = toks[s.idx + 1];
        const val = a.lead + key + a.trail;
        if (next && next.type === 'text') next.raw = encodeText(val);
        else toks.splice(s.idx + 1, 0, { type: 'text', raw: encodeText(val), line: t.line });
      } });
      report.push({ line: s.line, kind: 'data-en', key });
      return;
    }
    const cls = classify(a.core, dict, inv, allow);
    if (cls === 'INV') {
      const en = inv[a.core];
      const dec = s.raw; // decoded raw
      const { lead, trail } = splitRaw(dec);
      if (s.kind === 'text' || s.kind === 'title') edits.push({ idx: s.idx, fn: t => { t.raw = encodeText(lead) + encodeText(en) + encodeText(trail); } });
      else if (s.kind === 'attr' || s.kind === 'meta') edits.push({ idx: s.idx, fn: t => { replaceAttr(t, s.a, lead + en + trail); } });
      report.push({ line: s.line, kind: s.kind, es: a.core, en });
    } else if (cls === 'ORPHAN') {
      report.push({ line: s.line, kind: s.kind, orphan: a.core });
    }
  });
  edits.sort((x, y) => y.idx - x.idx).forEach(e => e.fn(toks[e.idx]));
  /* JSON-LD: map Spanish string values to their English dictionary keys (FAQPage text must equal the visible copy) */
  const COPY_KEYS = new Set(['name', 'description', 'text', 'headline', 'alternativeName', 'caption', 'abstract', 'alternateName', 'keywords', 'articleSection', 'slogan', 'jobTitle', 'serviceType']);
  for (let i = 1; i < toks.length; i++) {
    const t = toks[i], prev = toks[i - 1];
    if (t.type !== 'rawtext' || t.name !== 'script' || prev.type !== 'open' || !/application\/ld\+json/.test(prev.raw)) continue;
    let obj; try { obj = JSON.parse(t.raw); } catch (e) { report.push({ line: t.line, kind: 'jsonld', error: e.message.slice(0, 80) }); continue; }
    let changed = 0;
    (function map(o, parentKey) {
      if (Array.isArray(o)) { o.forEach((v, k) => { if (typeof v === 'string') { const r = mapStr(v, parentKey); if (r != null) { o[k] = r; changed++; } } else map(v, parentKey); }); return; }
      if (o && typeof o === 'object') for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { const r = mapStr(v, k); if (r != null) { o[k] = r; changed++; } } else map(v, k); }
    })(obj, null);
    function mapStr(v, key) {
      if (key === 'inLanguage' && /^es(-ES)?$/.test(v)) return 'en-US';   // base language of the whole site
      const a = affix(v);
      if (!a.core) return null;
      if (Object.prototype.hasOwnProperty.call(inv, a.core)) return a.lead + inv[a.core] + a.trail;
      if (COPY_KEYS.has(key) && hasLetters(a.core) && !/^https?:|^\d{4}-\d{2}/.test(a.core) && !Object.prototype.hasOwnProperty.call(dict, a.core) && !allow.has(a.core)) report.push({ line: t.line, kind: 'jsonld', key, unmapped: a.core });
      return null;
    }
    if (changed) { t.raw = '\n' + JSON.stringify(obj, null, 2) + '\n'; report.push({ line: t.line, kind: 'jsonld', mapped: changed }); }
  }
  /* static base-language attributes */
  for (const t of toks) {
    if (t.type !== 'open') continue;
    if (t.name === 'html') t.raw = t.raw.replace(/\blang="es"/, 'lang="en"');
    if (t.name === 'meta' && /property="og:locale"/.test(t.raw)) t.raw = t.raw.replace(/content="es_ES"/, 'content="en_US"');
  }
  return toks.map(t => t.raw).join('');
}

/* ---------- CLI ---------- */
if (require.main === module) {
  const [mode, root, outDir, allowFile] = process.argv.slice(2);
  if (!mode || !root || !outDir) { console.error('usage: node i18n-port.js analyze|transform <siteRoot> <outDir> [allowlist.txt]'); process.exit(2); }
  const src = fs.readFileSync(path.join(root, 'assets', 'serres-i18n.js'), 'utf8');
  const { dict } = extractDict(src);
  const inv = buildInv(dict);
  const allow = new Set(allowFile && fs.existsSync(allowFile) ? fs.readFileSync(allowFile, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean) : []);
  fs.mkdirSync(outDir, { recursive: true });
  const reportDir = path.join(outDir, '_build', 'reports', 'i18n-port'); fs.mkdirSync(reportDir, { recursive: true });
  const totals = {};
  const orphanIndex = {};
  const jsonldUnmapped = [];
  for (const rel of PAGES) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) { console.log('MISSING', rel); continue; }
    const html = fs.readFileSync(file, 'utf8');
    if (mode === 'analyze') {
      const { slots } = analyzePage(html, dict, inv, allow);
      const c = {}; slots.forEach(s => { c[s.cls] = (c[s.cls] || 0) + 1; });
      totals[rel] = c;
      slots.filter(s => s.cls === 'ORPHAN').forEach(s => { (orphanIndex[s.core] = orphanIndex[s.core] || []).push(rel + ':' + s.line); });
      fs.writeFileSync(path.join(reportDir, rel.replace(/[\/]/g, '__') + '.json'), JSON.stringify(slots, null, 1));
    } else if (mode === 'transform') {
      const report = [];
      const EOL = html.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
      const out = transformPage(html, dict, inv, allow, report).replace(/\r\n/g, '\n').replace(/\n/g, EOL);
      const dest = path.join(outDir, rel); fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, out);
      const c = { replaced: report.filter(r => r.en).length, orphans: report.filter(r => r.orphan).length, dataEn: report.filter(r => r.key).length, jsonld: report.filter(r => r.mapped).reduce((s, r) => s + r.mapped, 0), jsonldUnmapped: report.filter(r => r.unmapped).length };
      totals[rel] = c;
      report.filter(r => r.orphan).forEach(r => { (orphanIndex[r.orphan] = orphanIndex[r.orphan] || []).push(rel + ':' + r.line); });
      report.filter(r => r.unmapped).forEach(r => jsonldUnmapped.push({ page: rel, line: r.line, key: r.key, value: r.unmapped }));
      fs.writeFileSync(path.join(reportDir, '_report_' + rel.replace(/[\/]/g, '__') + '.json'), JSON.stringify(report, null, 1));
    }
  }
  console.log('dict entries:', Object.keys(dict).length, '| inv entries:', Object.keys(inv).length);
  console.table(totals);
  const orph = Object.entries(orphanIndex).sort((a, b) => b[1].length - a[1].length);
  fs.writeFileSync(path.join(reportDir, '_orphans.txt'), orph.map(([k, v]) => `${v.length}\t${JSON.stringify(k)}\t${v.slice(0, 6).join(' ')}`).join('\n'));
  console.log('distinct orphan strings:', orph.length, '-> ' + path.join(reportDir, '_orphans.txt'));
  if (mode === 'transform') {
    fs.writeFileSync(path.join(reportDir, '_jsonld-unmapped.json'), JSON.stringify(jsonldUnmapped, null, 1));
    console.log('JSON-LD copy strings without a dictionary key:', jsonldUnmapped.length, '-> ' + path.join(reportDir, '_jsonld-unmapped.json'));
  }
}
module.exports = { extractDict, buildInv, tokenize, walk, affix, decode, analyzePage, transformPage, PAGES };
