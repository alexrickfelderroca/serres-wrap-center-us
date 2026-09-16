/* 32-seo-titles.js — local-SEO <title> + meta description for the 11 main pages (blog pages are authored separately).
   The Barcelona site's Spanish titles were SEO-tuned ("PPF en Barcelona — Protección de Pintura | SERRES") while the
   English dictionary keys were older generic strings ("SERRES — Paint Protection Film (PPF)"). Miami's base language is
   English, so the English text gets the same local-SEO structure and the Spanish value mirrors it.
   Anchored on the page's CURRENT <title>/description text (which is the dictionary key), so it works whatever the geo
   pass produced. Money fragments keep the source wording (from €890 / desde 890 €) — 40-prices.js converts them.
   Usage: node 32-seo-titles.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { renameEntries, pages, loadDict } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 32-seo-titles.js <siteRoot>'); process.exit(2); }

const SEO = {
  'index.html': {
    title: ['PPF, Car Wrap & Detailing in Miami | SERRES', 'PPF, Car Wrap y Detailing en Miami | SERRES'],
    desc: ['PPF, Car Wrap and detailing studio in Miami, Florida: Ceramic Coating, multi-stage polishing and body kits. Get a quote on WhatsApp.',
           'Estudio de PPF, Car Wrap y detailing en Miami, Florida: Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp.'] },
  'pages/gallery.html': {
    title: ['Projects & Work Gallery — PPF, Car Wrap & Detailing | SERRES', 'Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing | SERRES'],
    desc: ['SERRES projects: a gallery of real PPF, Car Wrap, Ceramic Coating and detailing work on Porsche, BMW, Toyota and Range Rover.',
           'Proyectos de SERRES: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover.'] },
  'pages/prices.html': {
    title: ['Prices — PPF, Car Wrap, Ceramic Coating & Detailing | SERRES', 'Precios — PPF, Car Wrap, Ceramic Coating y Detailing | SERRES'],
    desc: ['SERRES Miami prices: PPF from €890, Car Wrap from €250, Ceramic Coating from €340 and detailing from €35, VAT included. Ask for your exact quote.',
           'Precios SERRES Miami: PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto.'] },
  'pages/projects.html': {
    title: ['Exclusive — Car Transformation Projects in Miami | SERRES', 'Exclusivo — Proyectos de Transformación en Miami | SERRES'],
    desc: ['SERRES Exclusive: complete car transformation projects in Miami. Correction, color change, PPF, Ceramic Coating and interior. Only 6 a year.',
           'Exclusivo SERRES: proyectos de transformación completa de coches en Miami. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año.'] },
  'pages/why-serres.html': {
    title: ['Detailing Studio in Miami — Why SERRES', 'Estudio de Detailing en Miami — Por Qué SERRES'],
    desc: ['Detailing studio in Miami, Florida: PPF, Car Wrap and paint correction with certified materials and clients who recommend us.',
           'Estudio de detailing en Miami, Florida: PPF, Car Wrap y corrección de pintura con materiales certificados y clientes que nos recomiendan.'] },
  'services/body-kits.html': {
    title: ['Body Kit Installation in Miami | SERRES', 'Montaje de Body Kits en Miami | SERRES'],
    desc: ['Body kit, spoiler and widebody installation and paint with OEM-level fitment. From €450. Miami, Florida.',
           'Instalación y pintura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Miami, Florida.'] },
  'services/ceramic.html': {
    title: ['Ceramic Coating for Cars in Miami | SERRES', 'Tratamiento Cerámico para Coche en Miami | SERRES'],
    desc: ['SiO2 Ceramic Coating with up to 5 years of protection. Prep and polishing by pack. From €340. Miami, Florida.',
           'Tratamiento Ceramic Coating SiO2 con hasta 5 años de protección. Preparación y pulido según pack. Desde 340 €. Miami, Florida.'] },
  'services/detailing.html': {
    title: ['Car Detailing & Interior Cleaning in Miami | SERRES', 'Detailing y Limpieza Interior de Coche en Miami | SERRES'],
    desc: ['Full detailing: steam, upholstery, leather and engine bay. Deep Clean from €150, Showroom Reset from €490. Premium studio in Miami.',
           'Limpieza integral: vapor, tapicería, cuero y motor. Deep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Miami.'] },
  'services/paint-correction.html': {
    title: ['Car Paint Correction & Polishing in Miami | SERRES', 'Pulido y Corrección de Pintura de Coche en Miami | SERRES'],
    desc: ['Multi-stage machine polishing: Stage 1, 2 or 3 depending on your paint. Goodbye swirls, scratches and holograms. Miami, Florida.',
           'Pulido por etapas a máquina: Etapa 1, 2 o 3 según el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Miami, Florida.'] },
  'services/ppf.html': {
    title: ['PPF in Miami — Paint Protection Film | SERRES', 'PPF en Miami — Protección de Pintura | SERRES'],
    desc: ['Self-healing PPF installation in 50+ colors from several professional brands. Front and full-car packs from €890. Miami, Florida.',
           'Instalación de PPF autorreparable con más de 50 colores de varias marcas profesionales. Packs frontal y coche completo desde 890 €. Miami, Florida.'] },
  'services/vinyl.html': {
    title: ['Car Wrap in Miami — Color Change | SERRES', 'Car Wrap en Miami — Cambio de Color | SERRES'],
    desc: ['Car Wrap: color change with 3M, Avery Dennison and Inozetek films. 150+ colors. Full car from €1,490. Miami, Florida.',
           'Car Wrap: cambio de color con films 3M, Avery Dennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Miami, Florida.'] },
};
const dec = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const dict = loadDict(root);
const changes = []; const same = [];
for (const [rel, seo] of Object.entries(SEO)) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const title = dec((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim();
  const desc = dec((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim();
  for (const [cur, [en, es]] of [[title, seo.title], [desc, seo.desc]]) {
    if (!cur) throw new Error(rel + ': title/description not found');
    if (!Object.prototype.hasOwnProperty.call(dict, cur)) throw new Error(rel + ': current text is not a dictionary key: ' + cur.slice(0, 80));
    if (cur === en && dict[cur] === es) { same.push(cur); continue; }
    if (cur !== en && Object.prototype.hasOwnProperty.call(dict, en) && !changes.some(c => c.en === en)) { changes.push({ en: cur, newEn: en + ' ', newEs: es }); continue; } // (defensive; never expected)
    changes.push({ en: cur, newEn: en, newEs: es });
  }
}
// dedupe (title and description could be the same key on a page — not the case today)
const seen = new Set(); const uniq = changes.filter(c => (seen.has(c.en) ? false : seen.add(c.en)));
const counts = renameEntries(root, pages(root), uniq);
console.log(`seo titles: ${uniq.length} entries updated (${same.length} already right); inline replacements: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
const bad = uniq.filter(c => c.newEn !== c.en && !counts[c.en]);
if (bad.length) { console.error('no inline occurrence replaced for:\n  ' + bad.map(b => b.en.slice(0, 80)).join('\n  ')); process.exit(1); }
