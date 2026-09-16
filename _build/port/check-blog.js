/* check-blog.js — mechanical review of the authored blog content in _build/port/content/blog/ (before 58-blog.js installs it).
   Checks per article: file completeness, <html lang="en">, og:locale, title/description lengths, canonical/og on the new slug,
   placeholders present (domain, GA4 ×2, tel, wa.me), JSON-LD parses + inLanguage/dates, FAQPage strings byte-identical to
   visible <summary>/<p>, {{PRICE:key}} tokens valid, forbidden terms (€, EUR, VAT/IVA, Barcelona…, 98%, 4.9, ITV/DGT, XPEL/SunTek),
   Spanish leakage outside chrome (common Spanish words), data-i18n-skip on post-hero/toc/prose, TOC anchors ↔ ids, internal links
   resolve (against a site root), related cards on the new slugs, "hood/color" in prose (US English expected outside pack names).
   Usage: node check-blog.js <contentDir> <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const [C, ROOT] = process.argv.slice(2);
if (!C || !ROOT) { console.error('usage: node check-blog.js <contentDir> <siteRoot>'); process.exit(2); }
const PRICE_KEYS = new Set(['wrap.accents', 'wrap.full', 'wrap.signature', 'ppf.front', 'ppf.pro', 'ppf.full', 'ceramic.essential', 'ceramic.signature', 'ceramic.concours', 'detailing.refresh', 'detailing.deep', 'detailing.showroom', 'bodykits.aero', 'bodykits.full', 'bodykits.transformation']);
const SLUGS = ['how-much-does-ppf-cost', 'how-much-does-a-car-wrap-cost', 'ppf-vs-ceramic-coating', 'car-upholstery-cleaning-cost'];
const dec = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”');
const SPANISH = /\b(que|para|coche|precio|precios|taller|desde|con|una|los|las|del|por|más|también|según|nuestro|nuestra|cómo|qué|cuánto|garantía|años|meses|días|vinilo|pintura|lámina)\b/gi;
let total = 0;
function check(slug) {
  const file = path.join(C, slug + '.html');
  const probs = [];
  if (!fs.existsSync(file)) { console.log('MISSING ' + slug); total++; return; }
  const html = fs.readFileSync(file, 'utf8');
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (!/<\/html>\s*$/.test(html)) probs.push('file does not end with </html> (truncated?)');
  if (!/<html lang="en">/.test(html)) probs.push('html lang != en');
  if (!/og:locale" content="en_US"/.test(html)) probs.push('og:locale != en_US');
  const title = dec((html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''); if (title.length < 20 || title.length > 62) probs.push('title length ' + title.length + ': ' + title);
  const desc = dec((html.match(/name="description" content="([^"]*)"/) || [])[1] || ''); if (desc.length < 110 || desc.length > 160) probs.push('description length ' + desc.length);
  if (!html.includes('rel="canonical" href="https://serreswrapcenter.es/blog/' + slug + '.html"')) probs.push('canonical not on new slug/placeholder domain');
  if (!html.includes('og:image" content="https://serreswrapcenter.es/assets/blog/' + slug + '/og.jpg"')) probs.push('og:image not on new asset folder');
  if ((html.match(/G-1K6FYZ99GN/g) || []).length !== 2) probs.push('GA4 placeholder count != 2');
  if (!/tel:\+34621244469/.test(html)) probs.push('tel placeholder missing');
  if (!/wa\.me\/34621244469\?text=/.test(html)) probs.push('wa.me placeholder missing');
  if (/wa\.me\/34621244469\?text=Hola/.test(html)) probs.push('WhatsApp prefill still Spanish');
  // JSON-LD
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (lds.length < 3) probs.push('JSON-LD blocks: ' + lds.length);
  let faq = null;
  for (const [i, t] of lds.entries()) { try { const o = JSON.parse(t); if (o['@type'] === 'BlogPosting') { if (o.inLanguage !== 'en-US') probs.push('inLanguage ' + o.inLanguage); if (o.datePublished !== '2026-09-02' || o.dateModified !== '2026-09-02') probs.push('dates ' + o.datePublished + '/' + o.dateModified); const ids = [o.url, o['@id'], o.mainEntityOfPage && (o.mainEntityOfPage['@id'] || o.mainEntityOfPage)].filter(x => typeof x === 'string'); if (!ids.some(u => u.includes(slug + '.html'))) probs.push('BlogPosting url/@id not on slug'); } if (o['@type'] === 'FAQPage') faq = o; } catch (e) { probs.push('JSON-LD #' + (i + 1) + ' parse error: ' + e.message.slice(0, 60)); } }
  if (!faq) probs.push('no FAQPage'); else for (const q of faq.mainEntity || []) { if (!html.includes(q.name)) probs.push('FAQ question not verbatim in HTML: ' + q.name.slice(0, 50)); const a = q.acceptedAnswer && q.acceptedAnswer.text; if (a && !html.includes(a)) probs.push('FAQ answer not verbatim in HTML: ' + (a || '').slice(0, 50)); }
  const details = (html.match(/<details>/g) || []).length; if (faq && faq.mainEntity && faq.mainEntity.length !== details) probs.push(`FAQ count JSON-LD ${faq.mainEntity.length} vs <details> ${details}`);
  // tokens
  for (const m of html.matchAll(/\{\{([^}]*)\}\}/g)) { const t = m[1]; if (!/^PRICE:/.test(t) || !PRICE_KEYS.has(t.slice(6))) probs.push('bad token {{' + t + '}}'); }
  // forbidden terms
  const bad = [[/€/, '€'], [/\bEUR\b/, 'EUR'], [/\bIVA\b|\bVAT\b/, 'IVA/VAT'], [/Barcelona|Sant Cugat|Vall[eè]s|Catal(?!og)|Espa[ñn]a|\bSpain\b/, 'geo'], [/98\s?%|4[.,]9\b/, 'rating claim'], [/\bITV\b|\bDGT\b/, 'ITV/DGT'], [/XPEL|SunTek|STEK|Gtechniq/i, 'unlisted brand'], [/\d{3,4} ?(€|\$|USD|EUR)|\$\s?\d/, 'literal price']];
  for (const [re, name] of bad) { const m = body.match(re); if (m) probs.push('forbidden: ' + name + ' ("' + m[0] + '")'); }
  // Spanish leakage in visible text (strip tags)
  const text = dec(body.replace(/<[^>]+>/g, ' '));
  const es = text.match(SPANISH) || []; if (es.length > 3) probs.push('Spanish words in text: ' + [...new Set(es.map(w => w.toLowerCase()))].slice(0, 8).join(', '));
  // skips + toc
  if (!/<section class="post-hero"[^>]*data-i18n-skip/.test(html)) probs.push('post-hero lacks data-i18n-skip');
  if (!/<aside class="toc"[^>]*data-i18n-skip/.test(html)) probs.push('toc lacks data-i18n-skip');
  if (!/<article class="prose"[^>]*data-i18n-skip/.test(html)) probs.push('prose lacks data-i18n-skip');
  const toc = [...html.matchAll(/<aside class="toc"[\s\S]*?<\/aside>/g)][0]; if (toc) { for (const m of toc[0].matchAll(/href="#([^"]+)"/g)) if (!new RegExp('id="' + m[1] + '"').test(html)) probs.push('TOC anchor without id: #' + m[1]); if (!/#faq"/.test(toc[0])) probs.push('TOC has no #faq'); }
  // links
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)"/g)) { const u = m[1]; if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue; const clean = u.split('#')[0]; const p = clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(path.join(ROOT, 'blog'), clean); const isNewSlug = SLUGS.some(s => clean.endsWith(s + '.html')) || /assets\/blog\/(how-much|ppf-vs|car-upholstery)/.test(clean); if (!fs.existsSync(p) && !isNewSlug) probs.push('unresolvable link: ' + u); }
  for (const s of SLUGS) if (s !== slug && !html.includes(s + '.html') && !/car-upholstery/.test(slug)) { /* related cards: at least two other slugs expected */ }
  const rel = SLUGS.filter(s => s !== slug && html.includes(s + '.html')).length; if (rel < 1) probs.push('no related card to another new slug');
  // US English outside pack names
  const prose = dec(body.replace(/Full Color Change|Signature Color Change|colour-shift|colour-flip/g, '').replace(/<[^>]+>/g, ' '));
  const uk = prose.match(/\b(color|colors|hood|tire|tires|windshield|curb)\b/gi); if (uk) probs.push('UK spelling in prose: ' + [...new Set(uk.map(w => w.toLowerCase()))].join(', ') + ' (59-us-english.js will convert; informational)');
  const words = (text.match(/[A-Za-z’']+/g) || []).length;
  console.log((probs.length ? 'FAIL ' : 'OK   ') + slug + `  (${words} words, title ${title.length}, desc ${desc.length})` + (probs.length ? '\n   - ' + probs.join('\n   - ') : ''));
  total += probs.length;
}
SLUGS.forEach(check);
/* index cards + meta */
const cards = fs.existsSync(path.join(C, 'index-cards.html')) ? fs.readFileSync(path.join(C, 'index-cards.html'), 'utf8') : '';
const meta = fs.existsSync(path.join(C, 'blog-meta.json')) ? JSON.parse(fs.readFileSync(path.join(C, 'blog-meta.json'), 'utf8')) : null;
const ip = [];
if (!cards) ip.push('index-cards.html missing'); else { if ((cards.match(/<a class="post-card"/g) || []).length !== 4) ip.push('cards != 4'); for (const s of SLUGS) if (!cards.includes('href="' + s + '.html"')) ip.push('card missing for ' + s); if (/€|Barcelona|Sant Cugat/.test(cards)) ip.push('forbidden term in cards'); if ((cards.match(SPANISH) || []).length > 3) ip.push('Spanish in cards'); }
if (!meta) ip.push('blog-meta.json missing'); else { if (!meta.index || !meta.index.title || !meta.index.titleEs || !meta.index.description || !meta.index.descriptionEs) ip.push('index meta incomplete'); for (const s of SLUGS) { const a = meta.articles && meta.articles[s]; if (!a || !a.crumb || !a.crumbEs) ip.push('crumb missing for ' + s); else { const f = path.join(C, s + '.html'); if (fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes('aria-current="page">' + a.crumb + '<')) ip.push('crumb text differs from article breadcrumb: ' + s + ' (' + a.crumb + ')'); } } }
console.log((ip.length ? 'FAIL ' : 'OK   ') + 'index-cards + blog-meta' + (ip.length ? '\n   - ' + ip.join('\n   - ') : ''));
total += ip.length;
console.log(total ? `\n${total} problem(s)` : '\nblog content clean');
process.exit(total ? 1 : 0);
