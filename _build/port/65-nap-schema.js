/* 65-nap-schema.js — Step 2: NAP, map and structured data for the Miami branch.
   Reads _build/port/miami.json -> business (+ domain). Never invents: every field it needs must be present.
     · tel: / wa.me / displayed phone / WhatsApp prefilled text (EN) / mobile-menu contact line (serres-enhance.js)
     · contact block + footer NAP (+ email row when provided), Google Maps iframe / place link / search link
     · JSON-LD (every block, every page): PostalAddress, telephone, email, geo, openingHoursSpecification,
       priceRange "$$$", areaServed, hasMap, sameAs (+ Barcelona site), parentOrganization + branchOf,
       address text inside FAQ answers (EN key + ES value rebuilt from the data)
   Usage: node 65-nap-schema.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, textFiles, pages, renameEntries, addEntries, loadDict, js } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 65-nap-schema.js <siteRoot>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'miami.json'), 'utf8'));
const B = cfg.business || {};
const need = ['streetAddress', 'addressLocality', 'postalCode', 'phoneE164', 'phoneDisplay', 'whatsappDigits', 'mapsPlaceUrl', 'mapsEmbedSrc', 'openingHours', 'hoursDisplayEn', 'hoursDisplayEs', 'hoursDaysEn', 'hoursDaysEs'];
const missing = need.filter(k => B[k] == null || B[k] === '');
if (missing.length) { console.log('SKIPPED — business data missing in miami.json: ' + missing.join(', ')); process.exit(0); }
if (B.latitude == null || B.longitude == null) console.log('note: latitude/longitude missing — GeoCoordinates will be omitted');

const files = textFiles(root).filter(f => !/[\\\/]_build[\\\/](port|reports)[\\\/]/.test(f));
const WA_OLD = 'wa.me/34621244469', WA_NEW = 'wa.me/' + B.whatsappDigits;
const TEL_OLD = 'tel:+34621244469', TEL_NEW = 'tel:' + B.phoneE164;
const PHONE_OLD = '+34 621 24 44 69';
const cityLine = `${B.addressLocality}, ${B.addressRegion || 'FL'}`;          // "Doral, FL"
const fullAddress = `${B.streetAddress}, ${B.addressLocality}, ${B.addressRegion || 'FL'} ${B.postalCode}`;
const WA_TEXT_EN = "Hi SERRES, I'd like a quote for my car.";

/* 1. links + displayed phone everywhere */
let n = { wa: 0, tel: 0, phone: 0 };
for (const f of files) editFile(f, (src, api) => {
  n.wa += api.all(WA_OLD, WA_NEW); n.tel += api.all(TEL_OLD, TEL_NEW); n.phone += api.all(PHONE_OLD, B.phoneDisplay);
  // prefilled WhatsApp messages (Spanish, URL-encoded in hrefs) -> English
  api.all('Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche.', encodeURIComponent(WA_TEXT_EN));
  api.all('Hola%20SERRES%2C%20quer%C3%ADa%20presupuesto%20del%20pack%20', encodeURIComponent("Hi SERRES, I'd like a quote for the ") );
  api.all('%20de%20Car%20Wrap%20para%20mi%20coche.', encodeURIComponent(' Car Wrap pack for my car.'));
});
console.log(`links: wa.me ×${n.wa}, tel: ×${n.tel}, displayed phone ×${n.phone}`);

/* 2. serres-enhance.js constants + mobile-menu contact line */
editFile(path.join(root, 'assets', 'serres-enhance.js'), (src, api) => {
  api.once('var WA_DIGITS = "34621244469";                 // +34 621 24 44 69', `var WA_DIGITS = "${B.whatsappDigits}";                 // ${B.phoneDisplay}`, 'WA_DIGITS');
  api.once('var WA_TEXT   = encodeURIComponent("Hola SERRES, quería pedir presupuesto para mi coche.");', `var WA_TEXT   = encodeURIComponent(${js(WA_TEXT_EN)});`, 'WA_TEXT');
  api.once('var TEL_HREF  = "tel:+" + WA_DIGITS;', `var TEL_HREF  = ${js(TEL_NEW)};`, 'TEL_HREF');
  api.once(`var TEL_TEXT  = "${B.phoneDisplay}";`, `var TEL_TEXT  = ${js(B.phoneDisplay)};`, 'TEL_TEXT (already replaced above)');
  api.once("'<div class=\"srs-menu-contact\">Sant Cugat del Vallès, Barcelona<br>", `'<div class="srs-menu-contact">${cityLine}<br>`, 'menu contact line');
});

/* 3. pages/prices.html WhatsApp message builder (Spanish sentence around translated tier names) */
editFile(path.join(root, 'pages', 'prices.html'), (src, api) => {
  api.once('var msg=encodeURIComponent("Hola SERRES, quería presupuesto del pack "+T(t.name)+" de "+T(s.label)+" para mi coche.");',
           'var msg=encodeURIComponent("Hi SERRES, I\'d like a quote for the "+T(t.name)+" "+T(s.label)+" pack for my car.");', 'prices WA msg');
});

/* 4. visible NAP text (index contact block, footer, service-page CTA lines) */
const napHtml = [];
for (const f of pages(root)) editFile(f, (src, api) => {
  let s = src;
  // "Sant Cugat del Vallès, Barcelona  ·" CTA lines on inner pages
  s = s.split('Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp;').join(cityLine + ' &nbsp;·&nbsp;');
  // index contact meta rows + footer
  s = s.replace('<span class="cm-k">Workshop</span><span class="cm-v">Sant Cugat del Vallès, Barcelona</span>', `<span class="cm-k">Workshop</span><span class="cm-v">${fullAddress}</span>`);
  s = s.replace('<p>Sant Cugat del Vallès<br>Barcelona, Spain</p>', `<p>${B.streetAddress}<br>${B.addressLocality}, ${B.addressRegion || 'FL'} ${B.postalCode}</p>`);
  s = s.split('Sant Cugat del Vallès, Barcelona').join(cityLine);
  if (B.email) {
    s = s.replace(/(<div class="cm-row"><span class="cm-k">Phone<\/span>.*?<\/div>)/, `$1\n          <div class="cm-row"><span class="cm-k">Email</span><span class="cm-v"><a href="mailto:${B.email}">${B.email}</a></span></div>`);
    s = s.replace(/(<h3>Workshop<\/h3>\n\s*<p>[^<]*<br>[^<]*<\/p>\n\s*<a href="tel:[^"]*">[^<]*<\/a>)/, `$1\n          <a href="mailto:${B.email}">${B.email}</a>`);
  }
  if (s !== src) { api.set(s); napHtml.push(path.relative(root, f)); }
});
console.log('visible NAP updated in: ' + napHtml.join(', '));

/* 5. Google Maps: iframe, place link, search link */
editFile(path.join(root, 'index.html'), (src, api) => {
  api.re(/<iframe title="SERRES Wrap Center en Google Maps" src="https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]*"/, `<iframe title="SERRES Wrap Center on Google Maps" src="${B.mapsEmbedSrc}"`, 'maps iframe');
  api.re(/https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^"]*/, B.mapsPlaceUrl, 'maps search link');
});
for (const f of files) editFile(f, (src, api) => { api.all('https://maps.google.com/?cid=14481261717501919901', B.mapsPlaceUrl); });

/* 6. JSON-LD */
const hours = B.openingHours; // [{days:["Monday",...], opens:"09:00", closes:"19:00"}]
const ohs = hours.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes }));
const parent = { '@type': 'Organization', name: 'SERRES Wrap Center', url: B.parentUrl || 'https://serreswrapcenter.es/' };
const LOCAL_TYPES = new Set(['AutoBodyShop', 'AutoRepair', 'LocalBusiness', 'AutomotiveBusiness', 'Store']);
let blocks = 0;
function patch(o) {
  if (Array.isArray(o)) { o.forEach(patch); return; }
  if (!o || typeof o !== 'object') return;
  if (o['@type'] === 'PostalAddress') {
    o.streetAddress = B.streetAddress; o.addressLocality = B.addressLocality; o.addressRegion = B.addressRegion || 'FL'; o.postalCode = B.postalCode; o.addressCountry = 'US';
  }
  if (typeof o.telephone === 'string') o.telephone = B.phoneE164;
  if (o.priceRange) o.priceRange = '$$$';
  if (o.openingHoursSpecification) o.openingHoursSpecification = ohs;
  if (o.hasMap) o.hasMap = B.mapsPlaceUrl;
  if (Array.isArray(o.areaServed) || typeof o.areaServed === 'string') o.areaServed = [{ '@type': 'City', name: B.addressLocality }, { '@type': 'City', name: 'Miami' }, { '@type': 'State', name: 'Florida' }].filter((a, i, arr) => arr.findIndex(b => b.name === a.name) === i);
  if (Array.isArray(o.sameAs)) { o.sameAs = o.sameAs.filter(u => !/wa\.me/.test(u)); if (!o.sameAs.includes(parent.url)) o.sameAs.push(parent.url); }
  if (LOCAL_TYPES.has(o['@type']) && o.address) {
    if (B.email) o.email = B.email;
    if (B.latitude != null && B.longitude != null) o.geo = { '@type': 'GeoCoordinates', latitude: B.latitude, longitude: B.longitude };
    o.parentOrganization = parent; o.branchOf = parent;
    if (!o.sameAs) o.sameAs = [B.instagram, parent.url].filter(Boolean);
  }
  for (const k of Object.keys(o)) patch(o[k]);
}
for (const f of pages(root)) editFile(f, (src, api) => {
  let s = src, changed = false;
  s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
    let obj; try { obj = JSON.parse(body); } catch (e) { return m; }
    const before = JSON.stringify(obj); patch(obj);
    if (JSON.stringify(obj) === before) return m;
    changed = true; blocks++; return a + '\n' + JSON.stringify(obj, null, 2) + '\n' + c;
  });
  if (changed) api.set(s);
});
console.log(`JSON-LD: ${blocks} blocks patched (address, phone, hours, geo, priceRange, areaServed, sameAs, parentOrganization/branchOf)`);

/* 7. Data-bearing dictionary entries rebuilt from miami.json (EN key + ES value). The geo pass (30) already
      removed the Barcelona street/ZIP but kept Barcelona's hours verbatim — those are replaced here. */
const dict = loadDict(root);
const findKey = (re, label) => { const ks = Object.keys(dict).filter(k => re.test(k)); if (ks.length !== 1) throw new Error(`expected exactly one dictionary key for ${label}, found ${ks.length}: ${ks.map(k => k.slice(0, 60)).join(' | ')}`); return ks[0]; };
const changes = [];
// index FAQ "Where is the SERRES workshop?" answer
changes.push({ en: findKey(/^(We're at Av\. Can Fatjó|Our workshop is in Miami).*appointment/i, 'FAQ address answer'),
  newEn: `We're at ${fullAddress}. We work by appointment only: ${B.hoursDisplayEn}.`,
  newEs: `Estamos en ${fullAddress}. Trabajamos solo con cita previa: ${B.hoursDisplayEs}.` });
// service-page FAQ "how do I book" answer (days phrase + address + phone)
const bookKey = Object.keys(dict).find(k => /^We work by appointment only, Monday to Saturday, at (Av\. Can Fatjó|our workshop in Miami)/.test(k));
if (bookKey) changes.push({ en: bookKey,
  newEn: bookKey.replace(/Monday to Saturday, at (Av\. Can Fatjó[^.]*\(Barcelona\)|our workshop in Miami, Florida)\./, `${B.hoursDaysEn}, at ${fullAddress}.`),
  newEs: dict[bookKey].replace(/de lunes a sábado, en (Av\. Can Fatjó[^.]*\(Barcelona\)|nuestro taller de Miami, Florida)\./, `${B.hoursDaysEs}, en ${fullAddress}.`) });
// contact block "Hours" row
const oldHoursKey = Object.keys(dict).find(k => /^Mon[–-]Sat · By appointment$/.test(k));
if (oldHoursKey) changes.push({ en: oldHoursKey, newEn: B.hoursDisplayEn, newEs: B.hoursDisplayEs });
if (changes.length) { renameEntries(root, pages(root), changes); console.log(`dictionary: ${changes.length} data-bearing entries rebuilt (FAQ address answer, hours row)`); }
const leftovers = [];
for (const f of files) { const t = fs.readFileSync(f, 'utf8'); for (const p of ['Sant Cugat', 'Vallès', '08174', '+34', 'Can Fatjó']) { const c = t.split(p).length - 1; if (c) leftovers.push(`${path.relative(root, f)}: ${p} ×${c}`); } }
if (leftovers.length) console.log('still present (expected only in sameAs/parent links or blog bodies pending rewrite):\n  ' + leftovers.join('\n  '));
