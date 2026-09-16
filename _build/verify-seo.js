/* Static SEO verifier — run after the SEO package edits.
   Checks every page for: OG/Twitter tags, parseable JSON-LD, GA4 (head+body,
   exactly once), single h1, banned business claims, resolvable local asset
   references (.webp/img/href), canonical presence.
   Usage: node _build/verify-seo.js
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const PAGES = [
  'index.html',
  'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html',
  'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html',
  'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html',
  'blog/index.html',
  'blog/cuanto-cuesta-vinilar-un-coche.html', 'blog/ppf-o-ceramico-que-elegir.html',
  'blog/cuanto-cuesta-ppf-coche.html', 'blog/limpieza-tapiceria-coche-precio.html',
];

const BANNED = [
  /10 años/i, /200 ?micras/i, /200 ?µm/i, /\b9H\b/, /subcontrat/i,
  /cristal líquido/i, /\b1080\b/, /medidor de brillo/i, /medidor de espesor/i,
];

let fail = 0;
for (const rel of PAGES) {
  const file = path.join(ROOT, rel);
  const problems = [];
  if (!fs.existsSync(file)) { console.log(`MISSING  ${rel}`); fail++; continue; }
  const html = fs.readFileSync(file, 'utf8');

  // OG / Twitter
  ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'twitter:card'].forEach(t => {
    if (!html.includes(t)) problems.push('no ' + t);
  });
  if (!html.includes('rel="canonical"')) problems.push('no canonical');

  // JSON-LD parse
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) problems.push('no JSON-LD');
  ld.forEach((m, i) => { try { JSON.parse(m[1]); } catch (e) { problems.push(`JSON-LD #${i + 1} parse error: ${e.message.slice(0, 60)}`); } });

  // GA4
  const gtagHead = (html.match(/googletagmanager\.com\/gtag\/js\?id=G-1K6FYZ99GN/g) || []).length;
  const gtagClick = (html.match(/whatsapp_click/g) || []).length;
  if (gtagHead !== 1) problems.push(`gtag head x${gtagHead}`);
  if (gtagClick < 1) problems.push('no click tracker');
  if (gtagClick > 1) problems.push(`click tracker x${gtagClick}`);

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
console.log(fail ? `\n${fail} page(s) with problems` : '\nAll pages clean');
process.exit(0);
