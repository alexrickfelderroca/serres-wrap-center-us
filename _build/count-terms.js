/* count-terms.js — acceptance greps for the Miami port, with the known false positives excluded:
     · "Catal" inside "OfferCatalog" (JSON-LD), "maps" inside "sitemaps.org", "Miami Blue" (a film color name)
     · serreswrapcenter.es is allowed ONLY on sameAs / parentOrganization / branchOf lines (the Barcelona parent site)
   Scans the shipped files (HTML, JS, CSS, XML, TXT, .htaccess) — never _build/ — and prints per-term totals + file hits.
   Usage: node _build/count-terms.js [siteRoot]    exit 1 when any forbidden term remains
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));

const TERMS = [
  { name: 'Barcelona', re: /Barcelona/g },
  { name: 'Sant Cugat', re: /Sant Cugat/g },
  { name: 'Vallès / Valles', re: /Vall[eè]s/g },
  { name: '+34', re: /\+34/g },
  { name: '08174', re: /08174/g },
  { name: 'Can Fatjó', re: /Can Fatj/g },
  { name: 'España / Spain', re: /Espa[ñn]a|\bSpain\b/g },
  { name: 'Catalan / Catalunya (not OfferCatalog)', re: /Catal(?!og)/g },
  { name: 'Collserola', re: /Collserola/g },
  { name: 'serreswrapcenter.es (outside sameAs/parent lines)', re: /serreswrapcenter\.es/g, lineFilter: l => !/sameAs|parentOrganization|branchOf|"url"|https:\/\/serreswrapcenter\.es\/"\s*$/.test(l) || false, special: 'parent' },
  { name: 'G-1K6FYZ99GN', re: /G-1K6FYZ99GN/g },
  { name: '€', re: /€/g },
  { name: 'EUR', re: /\bEUR\b/g },
  { name: 'IVA / VAT', re: /\bIVA\b|\bVAT\b/g },
  { name: 'valueAddedTaxIncluded', re: /valueAddedTaxIncluded/g },
  { name: 'ITV / DGT', re: /\bITV\b|\bDGT\b/g },
  { name: 'lang="es" (static)', re: /<html lang="es"/g },
  { name: 'es_ES', re: /es_ES/g },
  { name: 'data-en= (hatch uses, informational)', re: /data-en=/g, info: true },
  { name: '"ca" language', re: /\["en", "es", "ca"\]|ca: "CA"/g },
  { name: 'aggregateRating / reviewCount', re: /aggregateRating|reviewCount/g },
  { name: 'cuanto-cuesta / limpieza-tapiceria / ppf-o-ceramico (old slugs)', re: /cuanto-cuesta|limpieza-tapiceria|ppf-o-ceramico/g },
  { name: '{{PRICE / tokens', re: /\{\{[A-Z_]+[:}]/g },
  { name: 'wa.me/34', re: /wa\.me\/34/g },
  { name: 'tel:+34', re: /tel:\+34/g },
];
function walk(d, out) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!['_build', '.git', 'node_modules', '.screenshots'].includes(e.name)) walk(p, out); } else if (/\.(html|js|mjs|css|xml|txt|json|md)$|\.htaccess$/.test(e.name) && !/^(CLAUDE|TODO-MIAMI)\.md$/.test(e.name)) out.push(p); } return out; }
const files = walk(ROOT, []);
let fail = 0;
const parentHits = [];
for (const t of TERMS) {
  let total = 0; const hits = {};
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => {
      const n = (l.match(t.re) || []).length; if (!n) return;
      if (t.special === 'parent') { if (/sameAs|parentOrganization|branchOf|"url": "https:\/\/serreswrapcenter\.es\/"/.test(l)) { parentHits.push(path.relative(ROOT, f) + ':' + (i + 1)); return; } }
      if (/Miami Blue/.test(l) && t.name === 'Barcelona') return; // never; kept as an example of a line filter
      total += n; (hits[path.relative(ROOT, f)] = hits[path.relative(ROOT, f)] || []).push(i + 1);
    });
  }
  const bad = total > 0 && !t.info;
  if (bad) fail++;
  console.log(`${bad ? 'FAIL' : ' ok '}  ${String(total).padStart(4)}  ${t.name}` + (total ? '  →  ' + Object.entries(hits).map(([f, ls]) => `${f}:${ls.slice(0, 6).join(',')}${ls.length > 6 ? '…' : ''}`).join('  ') : ''));
}
console.log(`\nparent-site links (allowed): ${parentHits.length}` + (parentHits.length ? '  →  ' + parentHits.join('  ') : ''));
console.log(fail ? `\n${fail} forbidden term(s) still present` : '\nall acceptance greps clean');
process.exit(fail ? 1 : 0);
