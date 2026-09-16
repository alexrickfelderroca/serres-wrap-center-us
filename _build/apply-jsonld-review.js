/* apply-jsonld-review.js — apply the validated reviewer findings to recon/jsonld-map.json and write tools/port/jsonld-map.json.
   Rejected on purpose (see notes in the port report):
     · "Barcelona" / "Sant Cugat del Vallès" -> "Miami" as key-agnostic value replacements: they would set PostalAddress.addressLocality
       to an invented city; areaServed is rebuilt from real data by 65-nap-schema.js instead.
     · gallery description "...in Miami, Florida": the photos are Barcelona work; the copy stays location-neutral (honesty over the SEO hint).
*/
'use strict';
const fs = require('fs');
const path = require('path');
const src = path.resolve(__dirname, '..', 'recon', 'jsonld-map.json');
const dst = path.resolve(__dirname, 'port', 'jsonld-map.json');
let map = JSON.parse(fs.readFileSync(src, 'utf8'));
const byEs = Object.fromEntries(map.map(e => [e.es, e]));
const set = (es, en) => { if (!byEs[es]) throw new Error('missing entry: ' + es); byEs[es].en = en; };
const log = [];

/* wording / consistency */
set('Taller de PPF, Car Wrap, Ceramic Coating, pulido por etapas, detailing y body kits en Sant Cugat del Vallès (Barcelona). Films de varias marcas profesionales y trabajo con cita previa.',
    'Workshop for PPF, Car Wrap, Ceramic Coating, multi-stage polishing, detailing and body kits in Miami, Florida. Films from several professional brands; we work by appointment.');
set('Car Wrap — Vinilado de coches (car wrapping)', 'Car Wrap — vinyl car wrapping');
set('Acentos en vinilo (techo, retrovisores, pilares)', 'Accents (roof, mirrors, pillars)');
set('Cambio de color Signature (desmontaje ampliado)', 'Signature Wrap (extended disassembly)');
set('PPF frontal completo', 'PPF Full Front');
const ceramicAll = Object.keys(byEs).find(k => k.startsWith('Todos los packs incluyen descontaminación'));
if (ceramicAll) byEs[ceramicAll].en = byEs[ceramicAll].en.replace(/a SiO₂ Ceramic Coating|a SiO2 Ceramic Coating|Ceramic Coating SiO₂/g, 'Ceramic Coating SiO2');
const prices = Object.keys(byEs).find(k => k.startsWith('Precios orientativos con IVA incluido'));
if (prices) byEs[prices].en = 'Guide prices (IVA incluido) for all SERRES Wrap Center services in Miami, Florida.';

/* invented-fact / wrong-scope entries: removed */
for (const es of ['Barcelona', 'Sant Cugat del Vallès']) if (byEs[es]) { delete byEs[es]; log.push('removed ' + es); }

/* coverage gaps: serviceType strings */
const add = [
  ['Protección y personalización de vehículos (PPF, Car Wrap, Ceramic Coating, detailing, body kits)', 'Vehicle protection and customization (PPF, Car Wrap, Ceramic Coating, detailing, body kits)', ['pages/prices.html']],
  ['Transformación integral del vehículo (corrección, vinilo, PPF, cerámico, carrocería, interior)', 'Complete car transformation (paint correction, colour change, PPF, Ceramic Coating, body work, interior)', ['pages/projects.html']],
  ['Instalación y pintura de body kits, spoilers y widebody', 'Body kit, spoiler and widebody installation and painting', ['services/body-kits.html']],
  ['Recubrimiento cerámico SiO2 (Ceramic Coating)', 'SiO2 ceramic coating (Ceramic Coating)', ['services/ceramic.html']],
  ['Corrección de pintura y Ceramic Coating', 'Paint correction and Ceramic Coating', ['services/paint-correction.html']],
  ['Car wrapping — cambio de color con films 3M 2080, Avery Dennison e Inozetek', 'Car wrapping — colour change with 3M 2080, Avery Dennison and Inozetek films', ['services/vinyl.html']],
];
for (const [es, en, pages] of add) if (!byEs[es]) { byEs[es] = { es, en, pages }; log.push('added serviceType ' + es.slice(0, 40)); }

map = Object.values(byEs);
/* safety: no money fragment changed, no geo leftovers in EN */
for (const e of map) {
  const m1 = (e.es.match(/\d[\d.,]*\s?€|IVA incluido/g) || []).sort().join('|'), m2 = (e.en.match(/\d[\d.,]*\s?€|IVA incluido/g) || []).sort().join('|');
  if (m1 !== m2) throw new Error('money fragment changed for: ' + e.es.slice(0, 60));
  if (/Barcelona|Sant Cugat|Vall[eè]s|Catal|España|Spain/.test(e.en)) throw new Error('geo leftover in EN: ' + e.en);
}
fs.writeFileSync(dst, JSON.stringify(map, null, 2) + '\n');
console.log('jsonld-map: ' + map.length + ' entries -> ' + dst + '\n  ' + log.join('\n  '));
