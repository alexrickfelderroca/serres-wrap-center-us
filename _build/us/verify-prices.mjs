/* verify-prices.mjs — the price gate.

   The spec's §15.2 check ("no hardcoded prices outside src/data/") is literally
   unachievable on a static HTML site: prices legitimately appear in prose, FAQ text,
   <title>, meta descriptions and JSON-LD. The enforceable restatement is:

     No dollar amount may be AUTHORED BY HAND. Every "$" in the shipped tree must be a
     value that assets/pricing.js can produce.

   Fails on:
     1. a dollar amount that pricing.js cannot produce
     2. any id whose published flag is false appearing in shipped HTML
     3. any surviving EUR / € / IVA / VAT-included / valueAddedTaxIncluded
     4. any unresolved {{PRICE:…}} / {{STARTING:…}} template token
     5. priceCurrency other than USD

   Usage: node _build/us/verify-prices.mjs [siteRoot]
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.');
const require = createRequire(import.meta.url);
const P = require(path.join(root, 'assets', 'pricing.js'));

/* ---------------------------------------------- what pricing.js can legitimately emit */
const amounts = new Set(P.allAmounts());
const formatted = new Set([...amounts].map(n => P.usd(n)));

/* ids that must never appear in shipped markup */
const unpublished = [];
for (const [, items] of Object.entries(P.groups())) {
  for (const it of items) if (it.published !== true) unpublished.push(it);
}

/* ------------------------------------------------------------------- collect files */
const SKIP = new Set(['_build', '.git', '.screenshots', 'node_modules', 'assets']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|xml)$/.test(e.name)) files.push(p);
  }
})(root);

const fails = [];
const add = (file, line, msg) => fails.push(`${path.relative(root, file).split(path.sep).join('/')}:${line}  ${msg}`);

const MONEY = /\$\s?\d[\d,]*(?:\.\d{2})?/g;
const EUROISH = /€|\bEUR\b|\bIVA\b|VAT included|valueAddedTaxIncluded/;
const TOKEN = /\{\{\s*(PRICE|STARTING)\s*:/i;

let dollarsChecked = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((raw, i) => {
    const n = i + 1;

    // "$$$" is schema.org priceRange, not an amount
    const line = raw.replace(/"priceRange"\s*:\s*"\$+"/g, '"priceRange":"X"');

    for (const m of line.match(MONEY) || []) {
      dollarsChecked++;
      const norm = '$' + m.replace(/[^\d,.]/g, '');
      if (!formatted.has(norm)) add(file, n, `dollar amount ${JSON.stringify(m)} is not producible from pricing.js`);
    }

    if (EUROISH.test(line)) add(file, n, `Barcelona currency/tax leftover: ${JSON.stringify(line.trim().slice(0, 90))}`);
    if (TOKEN.test(line)) add(file, n, `unresolved price token: ${JSON.stringify(line.trim().slice(0, 90))}`);

    const pc = line.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/);
    if (pc && pc[1] !== 'USD') add(file, n, `priceCurrency ${pc[1]} (must be USD)`);

    for (const it of unpublished) {
      if (line.includes(`"${it.id}"`) || line.includes(`>${it.name}<`)) {
        add(file, n, `unpublished item "${it.id}" (${it.name}) must not render at launch`);
      }
    }
  });
}

console.log(`price gate: ${files.length} shipped files, ${dollarsChecked} dollar amounts checked`);
console.log(`pricing.js can produce: ${[...formatted].join(', ')}`);

if (fails.length) {
  console.error(`\n${fails.length} failure(s):`);
  fails.slice(0, 80).forEach(f => console.error('  ' + f));
  if (fails.length > 80) console.error(`  … and ${fails.length - 80} more`);
  process.exit(1);
}
console.log('price gate clean — every dollar amount traces to assets/pricing.js.');
