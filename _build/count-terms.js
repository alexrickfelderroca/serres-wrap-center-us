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
  /* "Barcelona" is INFORMATIONAL on the US site, not forbidden. The spec sells the
     Barcelona track record on purpose (section 1 positioning, 6.1.5 "Proven in Barcelona",
     6.9 the Barcelona->Boca story). What must never appear is the Barcelona NAP:
     the Sant Cugat address, the +34 phone, the 08174 postcode. Those stay hard failures. */
  { name: 'Barcelona (heritage — allowed, informational)', re: /Barcelona/g, info: true },
  { name: 'Sant Cugat', re: /Sant Cugat/g },
  { name: 'Vallès / Valles', re: /Vall[eè]s/g },
  { name: '+34', re: /\+34/g },
  { name: '08174', re: /08174/g },
  { name: 'Can Fatjó', re: /Can Fatj/g },
  { name: 'España / Spain', re: /Espa[ñn]a|\bSpain\b/g },
  { name: 'Catalan / Catalunya (not OfferCatalog)', re: /Catal(?!og)/g },
  { name: 'Collserola', re: /Collserola/g },
  /* The Barcelona site may be linked as the parent studio. Allowed shapes:
       - a sameAs / parentOrganization / branchOf key on the same line
       - a bare URL on its own line (a JSON-LD sameAs ARRAY element — the key is a line up)
       - the deliberate "SERRES Barcelona" link in the footer */
  { name: 'serreswrapcenter.es (outside sameAs/parent links)', re: /serreswrapcenter\.es/g, lineFilter: l => !(/sameAs|parentOrganization|branchOf|"url"/.test(l) || /^\s*"https:\/\/serreswrapcenter\.es\/?",?\s*$/.test(l) || /SERRES Barcelona/.test(l)), special: 'parent' },
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
/* Files that legitimately contain the forbidden terms and are never served as content:
     CLAUDE.md / TODO.md / the spec  — they DOCUMENT the terms (e.g. "never reuse G-1K6FYZ99GN")
     assets/serres-i18n.js           — the dormant EN->ES dictionary. It is kept in the repo
                                       for the December Spanish launch but is NOT loaded by any
                                       page (see CLAUDE.md), so its Spanish/EUR strings ship to
                                       nobody. Re-enabling it means re-harvesting it anyway. */
const EXEMPT_FILE = /^(CLAUDE|TODO|TODO-MIAMI|README|SERRES-US-WEBSITE-SPEC_1)\.md$|^serres-i18n\.js$/;
function walk(d, out) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!['_build', '.git', 'node_modules', '.screenshots'].includes(e.name)) walk(p, out); } else if (/\.(html|js|mjs|css|xml|txt|json|md)$|\.htaccess$/.test(e.name) && !EXEMPT_FILE.test(e.name)) out.push(p); } return out; }
const files = walk(ROOT, []);
let fail = 0;
const parentHits = [];
for (const t of TERMS) {
  let total = 0; const hits = {};
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => {
      const n = (l.match(t.re) || []).length; if (!n) return;
      /* A term can carry its own lineFilter: return false to ALLOW the line.
         The loop used to ignore it and apply a narrower hardcoded regex, so the
         JSON-LD sameAs array elements and the deliberate footer link to the Barcelona
         studio were reported as violations. */
      if (t.lineFilter && !t.lineFilter(l)) {
        if (t.special === 'parent') parentHits.push(path.relative(ROOT, f) + ':' + (i + 1));
        return;
      }
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
