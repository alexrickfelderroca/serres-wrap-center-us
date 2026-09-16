/* 40-prices.js — Step 3: EUR -> USD price pass with Miami list prices (US format "$1,490").
   Reads _build/port/miami.json -> prices. The Barcelona amounts are only lookup keys: 890 € is both
   "PPF front pack" and "Ceramic Concours", 1.490 € is both "full wrap" and "full body kit", so every
   occurrence is resolved by CONTEXT (service keywords before the amount in the same string / JSON block /
   PRICING object, then the file's own service). Unresolvable occurrences abort the step.
   Also: "VAT included"/"IVA incluido" clauses removed (tax display is a client decision — see taxDisplay),
   priceRange €€/€€€ -> $$$, priceCurrency EUR -> USD, fmtEur -> US formatter, valueAddedTaxIncluded dropped.
   Usage: node 40-prices.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, textFiles } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 40-prices.js <siteRoot>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'miami.json'), 'utf8'));
const P = cfg.prices || {};
const tiers = Object.keys(P).filter(k => !k.startsWith('_'));
const missing = tiers.filter(k => !Number.isInteger(P[k].usd));
if (missing.length) { console.log(`SKIPPED — USD prices not provided for: ${missing.join(', ')} (fill _build/port/miami.json → prices)`); process.exit(0); }

const usd = n => '$' + Math.round(n).toLocaleString('en-US');
const byEur = {};
for (const k of tiers) (byEur[P[k].eur] = byEur[P[k].eur] || []).push({ tier: k, service: k.split('.')[0], usd: P[k].usd });

const KEYWORDS = [
  ['ppf', /PPF|Paint Protection|Film de protección|lámina de protección|front pack|Front Pack|Pro\b|Full Body|frontal|carrocería completa/i],
  ['ceramic', /Ceramic|cerámic|Correction|corrección|polish|pulido|Essential|Signature(?!\s*Wrap)|Concours/i],
  ['wrap', /Car Wrap|wrap|vinil|vinyl|colou?r change|cambio de color|Accents|Acentos/i],
  ['detailing', /Detailing|detallado|limpieza|Refresh|Deep Clean|Showroom|interior|tapicer/i],
  ['bodykits', /body ?kit|Body Kits|Aero|widebody|splitter|difusor|diffuser|Transformation/i],
];
function fileService(file) {
  const f = file.replace(/\\/g, '/');
  if (/services\/ppf\.html|cuanto-cuesta-ppf/.test(f)) return 'ppf';
  if (/services\/(ceramic|paint-correction)\.html|ppf-o-ceramico/.test(f)) return 'ceramic';
  if (/services\/vinyl\.html|vinilar/.test(f)) return 'wrap';
  if (/services\/detailing\.html|tapiceria/.test(f)) return 'detailing';
  if (/services\/body-kits\.html/.test(f)) return 'bodykits';
  return null;
}
/* pick the service whose keyword appears LAST before `pos` in `ctx` (nearest mention wins), else the file's service */
function resolve(ctx, pos, file, candidates) {
  const cands = new Set(candidates.map(c => c.service));
  if (cands.size === 1) return candidates[0];
  const before = ctx.slice(Math.max(0, pos - 600), pos);
  let best = null, bestIdx = -1;
  for (const [svc, re] of KEYWORDS) {
    if (!cands.has(svc)) continue;
    const g = new RegExp(re.source, re.flags + 'g'); let m, last = -1;
    while ((m = g.exec(before))) last = m.index;
    if (last > bestIdx) { bestIdx = last; best = svc; }
  }
  if (!best) { const fs_ = fileService(file); if (fs_ && cands.has(fs_)) best = fs_; }
  return best ? candidates.find(c => c.service === best) : null;
}

const AMOUNT = /(?:€\s?(\d{1,3}(?:[.,]\d{3})*)(?![\d.,]))|(?:(\d{1,3}(?:[.,]\d{3})*)\s?€)/g;   // €890 · 890 € · 1.490 € · 2,390 €
const unresolved = [];
let replaced = 0;

const files = textFiles(root).filter(f => !/[\\\/]_build[\\\/]/.test(f));
for (const file of files) {
  editFile(file, (src, api) => {
    let s = src;
    // 1. amounts with € — resolve per occurrence using the surrounding text (same line / string / JSON block)
    s = s.replace(AMOUNT, (m, a, b, offset, whole) => {
      const n = parseInt((a || b).replace(/[.,]/g, ''), 10);
      const cands = byEur[n];
      if (!cands) { unresolved.push(`${path.relative(root, file)}: unknown amount ${m}`); return m; }
      const hit = resolve(whole, offset, file, cands);
      if (!hit) { unresolved.push(`${path.relative(root, file)}: ambiguous ${m} (${cands.map(c => c.tier).join('|')}) near "${whole.slice(Math.max(0, offset - 60), offset).replace(/\s+/g, ' ')}"`); return m; }
      replaced++; return usd(hit.usd);
    });
    // 2. JSON-LD numeric prices ("price": "890", "minPrice": 890) and prices.html PRICING data (price:890)
    s = s.replace(/("(?:price|minPrice|maxPrice)"\s*:\s*"?)(\d+)("?)/g, (m, pre, num, post, offset, whole) => {
      const cands = byEur[parseInt(num, 10)]; if (!cands) return m;
      const hit = resolve(whole, offset, file, cands);
      if (!hit) { unresolved.push(`${path.relative(root, file)}: ambiguous JSON price ${num}`); return m; }
      replaced++; return pre + hit.usd + post;
    });
    s = s.replace(/(\bprice:)(\d+)(,)/g, (m, pre, num, post, offset, whole) => {           // PRICING tiers in pages/prices.html
      const cands = byEur[parseInt(num, 10)]; if (!cands) return m;
      const block = whole.slice(0, offset); const km = block.match(/\n  (wrap|ppf|ceramic|detailing|bodykits):\{(?![\s\S]*\n  (?:wrap|ppf|ceramic|detailing|bodykits):\{)/);
      const svc = km ? km[1] : null; const hit = cands.find(c => c.service === svc);
      if (!hit) { unresolved.push(`${path.relative(root, file)}: ambiguous PRICING price:${num}`); return m; }
      replaced++; return pre + hit.usd + post;
    });
    s = s.replace(/(data-price=")(\d+)(")/g, (m, pre, num, post, offset, whole) => {          // static snapshot (wrap tab only)
      const cands = byEur[parseInt(num, 10)]; if (!cands) return m;
      const hit = cands.find(c => c.service === 'wrap') || (cands.length === 1 ? cands[0] : null);
      if (!hit) { unresolved.push(`${path.relative(root, file)}: ambiguous data-price ${num}`); return m; }
      replaced++; return pre + hit.usd + post;
    });
    // 3. currency words / tokens
    s = s.replace(/"priceCurrency"\s*:\s*"EUR"/g, '"priceCurrency": "USD"');
    s = s.replace(/"priceRange"\s*:\s*"€{2,3}"/g, '"priceRange": "$$$$$$"');
    s = s.replace(/\bEUR\b/g, 'USD');
    // 4. VAT clauses (tax display is a client decision) + JSON-LD VAT flags
    s = s.replace(/(?:,| and| e| y)?\s*\(?(?:VAT included|IVA incluido|IVA incl\.|impuestos incluidos|taxes included)\)?/g, '');
    s = s.replace(/,?\s*"valueAddedTaxIncluded"\s*:\s*(?:true|false)/g, '');
    // 5. pages/prices.html formatter
    s = s.replace("function fmtEur(n){return Math.round(n).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.')+' \\u20AC';}",
                  "function fmtEur(n){return '$'+Math.round(n).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');}");
    if (s !== src) api.set(s);
  });
}
console.log(`prices: ${replaced} amounts rewritten to USD across ${files.length} files`);
if (unresolved.length) { console.error('UNRESOLVED (fix by hand or extend KEYWORDS):\n  ' + unresolved.join('\n  ')); process.exit(1); }
const left = [];
for (const file of files) { const t = fs.readFileSync(file, 'utf8'); const n = (t.match(/€/g) || []).length; if (n) left.push(`${path.relative(root, file)} ×${n}`); }
if (left.length) { console.error('€ still present:\n  ' + left.join('\n  ')); process.exit(1); }
console.log('no € left outside _build/');
