/* Static SEO verifier — run after the SEO package edits.
   Checks every page for: OG/Twitter tags, parseable JSON-LD, GA4 (head+body,
   exactly once), single h1, banned business claims, resolvable local asset
   references (.webp/img/href), canonical presence.
   Usage: node _build/verify-seo.js
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

/* Discovered, not hardcoded. The inherited list named the 16 Barcelona files
   (pages/, services/, blog/cuanto-cuesta-*.html); every one of them has moved or gone,
   so the verifier reported 4 MISSING pages and silently checked none of the new ones. */
const SKIP_DIRS = new Set(['_build', '.git', 'assets', '.screenshots', 'node_modules']);
const PAGES = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) PAGES.push(path.relative(ROOT, p).split(path.sep).join('/'));
  }
})(ROOT);
PAGES.sort();

/* Claims this site may not make. The inherited list was Spanish-market copy; these are
   the US ones. Warranty wording is fixed by spec section 3: manufacturer film warranty up
   to 10 years PLUS a 1-year SERRES installation warranty — so a bare "3-year film
   warranty" (the Barcelona claim) must never reappear, and neither may the Barcelona
   Google-listing figures. */
const BANNED = [
  /3-year film warranty/i,
  /\b4[.,]9\s*(?:\/\s*5|stars|rating)/i,
  /\b98\s?%\s+of\s+(?:our\s+)?clients/i,
  /aggregateRating/,
  /lifetime warranty/i,
  /\bIVA\b/, /VAT included/i,
  /10 años/i, /200 ?micras/i, /subcontrat/i, /cristal líquido/i,
];

let fail = 0;
for (const rel of PAGES) {
  const file = path.join(ROOT, rel);
  const problems = [];
  if (!fs.existsSync(file)) { console.log(`MISSING  ${rel}`); fail++; continue; }
  const html = fs.readFileSync(file, 'utf8');

  /* A noindex page (404) is never indexed and never shared, so social cards and a
     canonical are not just unnecessary — a self-canonical on a noindex URL asks Google to
     index the very page robots is telling it to skip. Skip both checks there. */
  const noindex = /<meta\s+name="robots"[^>]*noindex/i.test(html);
  if (!noindex) {
    ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'twitter:card'].forEach(t => {
      if (!html.includes(t)) problems.push('no ' + t);
    });
    if (!html.includes('rel="canonical"')) problems.push('no canonical');
  }

  // JSON-LD parse
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  /* noindex pages (404) carry no structured data on purpose — there is no entity to
     describe and nothing will ever read it. */
  if (!ld.length && !noindex) problems.push('no JSON-LD');
  ld.forEach((m, i) => { try { JSON.parse(m[1]); } catch (e) { problems.push(`JSON-LD #${i + 1} parse error: ${e.message.slice(0, 60)}`); } });

  /* Analytics. Inverted from the inherited check, which REQUIRED the Barcelona gtag on
     every page. That property belongs to the Spanish site; shipping it here would pour US
     traffic into it. The US site loads assets/analytics.js instead, which stays inert
     until business.js has a ga4Id. */
  if (/G-1K6FYZ99GN/.test(html)) problems.push('Barcelona GA4 property present');
  if (!/assets\/analytics\.js/.test(html)) problems.push('analytics.js not wired');

  // h1
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`h1 x${h1}`);

  // banned claims (visible text only roughly — whole file scan)
  BANNED.forEach(re => { const m = html.match(re); if (m) problems.push(`BANNED "${m[0]}"`); });

  // local refs resolve (src/href to local files, ignore http/#/tel/mailto)
  const dir = path.dirname(file);
  const refs = [...html.matchAll(/(?:src|href)="([^"#{}]+?)"/g)].map(m => m[1])
    .filter(u => !/^(https?:|#|tel:|mailto:|data:|javascript:)/.test(u));
  const seen = new Set();
  refs.forEach(u => {
    const clean = u.split('#')[0].split('?')[0];
    if (!clean || seen.has(clean)) return; seen.add(clean);
    const p = clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(dir, clean);
    if (!fs.existsSync(p)) problems.push('broken ref ' + u);
  });

  // FAQ pages: FAQPage JSON-LD names must appear in visible HTML
  const faqLd = ld.map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(o => o && (o['@type'] === 'FAQPage'));
  faqLd.forEach(o => (o.mainEntity || []).forEach(q => {
    const name = q.name;
    if (name && !html.includes(name)) problems.push('FAQPage question not in visible HTML: ' + name.slice(0, 50));
    const ans = q.acceptedAnswer && q.acceptedAnswer.text;
    if (ans && !html.includes(ans)) problems.push('FAQPage answer not in visible HTML: ' + ans.slice(0, 50));
  }));

  if (problems.length) { fail++; console.log(`FAIL  ${rel}\n   - ` + problems.join('\n   - ')); }
  else console.log(`OK    ${rel}`);
}
console.log(fail ? `\n${fail} page(s) with problems` : `\nAll ${PAGES.length} pages clean`);
/* This used to be an unconditional process.exit(0): the verifier printed FAIL lines and
   then told the build everything was fine. Wiring it into a gate list was meaningless. */
process.exit(fail ? 1 : 0);
