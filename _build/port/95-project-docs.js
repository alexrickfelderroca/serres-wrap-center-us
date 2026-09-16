/* 95-project-docs.js — project-level CLAUDE.md + TODO-MIAMI.md for the new site (per the global rules: stack, tokens,
   file layout, i18n pattern, live URL/repo and per-client decisions live in a CLAUDE.md inside the project root).
   Reads miami.json for the facts that are known; everything unknown is listed as "confirm with the owner".
   Usage: node 95-project-docs.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root) { console.error('usage: node 95-project-docs.js <siteRoot>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'miami.json'), 'utf8'));
const B = cfg.business || {};
const v = x => (x == null || x === '' ? '**PENDIENTE (confirmar con el cliente)**' : String(x));
const prices = Object.entries(cfg.prices || {}).filter(([k]) => !k.startsWith('_'));
const pricesDone = prices.every(([, p]) => Number.isInteger(p.usd));

const claude = `# SERRES Wrap Center — Miami (CLAUDE.md del proyecto)

Sede de Miami del MISMO negocio que serreswrapcenter.es (Barcelona). Port 1:1 del sitio de Barcelona
(commit 4dc52fc, 02-09-2026): misma marca, mismos tokens, misma tipografía, mismas animaciones y componentes.
Solo cambia lo local: idioma base, NAP, moneda, dominio, SEO local, analítica y el blog (clima de Florida).

## Stack
- HTML/CSS/JS vanilla, sin build step, sin frameworks, sin dependencias en el sitio. Tokens en \`:root\` de cada página
  (\`--bg #0a0a0b\`, \`--panel\`, \`--text #f3f3f5\`, \`--muted\`, \`--chrome\` gradient, \`--ease\`); fuentes self-hosted
  Barlow Condensed + DM Sans (\`assets/fonts.css\`). Dark-only por diseño de marca.
- 16 páginas: \`index.html\` · \`pages/{gallery,prices,projects,why-serres}.html\` · \`services/{ppf,vinyl,ceramic,paint-correction,detailing,body-kits}.html\`
  · \`blog/index.html\` + 4 artículos con slug en inglés.
- \`assets/serres-enhance.js\` (menú móvil, WhatsApp flotante, contadores; carga \`serres-i18n.js\`) y \`assets/serres-i18n.js\` (switcher EN/ES).

## i18n — patrón "clave inglesa = texto inline"
- Idioma base **inglés** (\`<html lang="en">\`, inglés americano). Español vía diccionario \`DICT = { "English key": "español" }\`
  aplicado hacia delante; **el texto inglés inline debe coincidir byte a byte con la clave**. Sin índice invertido, sin catalán.
- Se traducen: nodos de texto del body, \`aria-label\`, \`title\`, \`alt\`, \`<title>\` y \`meta description\`. No se traducen: OG/Twitter,
  JSON-LD, hrefs, ni nada bajo \`[data-i18n-skip]\` (chips de marca, snapshots renderizados por JS, cuerpos de artículo).
- Escotilla para palabras ambiguas: \`<span data-en="The (blog)">The</span>\` → muestra su texto en EN y \`DICT["The (blog)"]\` en ES.
- Comprobación obligatoria tras tocar copy: \`node _build/i18n-orphans.js --lang both\` → 0 problemas (usa Chrome headless vía CDP,
  sin dependencias; \`_build/i18n-allowlist.txt\` lista los nombres propios neutros).
- Blog: cuerpos solo en inglés (paridad con Barcelona, donde son solo en español); el chrome (nav, CTA, footer, migas) sí traduce.

## Datos del negocio (fuente: \`_build/port/miami.json\`)
- Dominio: ${v(cfg.domain)} · Hosting: ${v(cfg.hosting)}
- Dirección: ${v(B.streetAddress)}, ${v(B.addressLocality)}, ${B.addressRegion || 'FL'} ${v(B.postalCode)}
- Teléfono: ${v(B.phoneDisplay)} · WhatsApp: ${B.whatsappDigits ? 'wa.me/' + B.whatsappDigits : v(null)} · Email: ${v(B.email)}
- Horario: ${v(B.hoursDisplayEn)}
- GA4: ${v(cfg.ga4)} (la propiedad de Barcelona G-1K6FYZ99GN NO se reutiliza)
- Precios en USD: ${pricesDone ? 'cargados' : '**PENDIENTES**'} (formato \`$1,490\`; impuestos: ${v(cfg.taxDisplay)})
- Sede matriz: https://serreswrapcenter.es/ (enlazada en \`sameAs\` / \`parentOrganization\` de todo JSON-LD local).

## Regenerar el sitio desde la fuente de Barcelona
\`node _build/port/run.js --src "<ruta de Serres wrap center V12>" --dest "<esta carpeta>"\` copia la fuente (con las exclusiones del
brief) y aplica los pasos numerados de \`_build/port/\` (transform i18n → runtime → geo → títulos SEO → alt → precios → JSON-LD →
reseñas heredadas → herramientas → correcciones → blog → inglés americano → dominio/GA4 → NAP/schema → snapshot precios → docs).
Los datos van en \`_build/port/miami.json\`; los mapas de copy en \`_build/port/{geo,alt,jsonld}-map.json\`; el blog en \`_build/port/content/blog/\`.

## Verificación (sin evidencia = no hecho)
- \`node _build/verify-seo.js\` (FAIL conocido y falso en \`pages/prices.html\`: URL de WhatsApp construida en JS).
- \`node _build/i18n-orphans.js --lang both\` → 0 · \`node _build/verify-parity.js --src "<Barcelona>"\` → solo cambios del port.
- Capturas: \`node _build/screenshots.js --root . --out .screenshots/<tarea> --pass 2\` (1440×900 y 390×844, EN y ES).
- Greps de aceptación: \`Barcelona|Sant Cugat|Vall[eè]s|\\+34|08174|serreswrapcenter\\.es|G-1K6FYZ99GN\` → 0 (excepción: sameAs/parentOrganization) · \`€\` → 0.

## Decisiones tomadas en el port (reversibles)
- Reseñas: sección de testimonios oculta (\`hidden\` + TODO) y \`aggregateRating\` eliminado hasta que Miami tenga reseñas propias.
- Stats del hero de "Why SERRES": las cifras de la ficha de Barcelona (50+ coches, 4.9) sustituidas por claims que la marca ya usa (1 Standard · 100% Hand Finished · 0 Cut Corners).
- Inglés americano en el copy (\`_build/port/59-us-english.js\`): color→color, grey→gray, hood→hood, wings→fenders…
- Captions de galería sin geografía (las fotos son trabajo real hecho en Barcelona; no se afirma que sean de Miami).
- Páginas legales (privacy / terms) NO creadas: ver TODO-MIAMI.md.
`;

const todo = `# TODO — SERRES Miami (confirmar con el cliente antes de publicar)

## Datos que faltan o hay que confirmar
${[
  ['Dominio y hosting', cfg.domain && cfg.hosting],
  ['Dirección completa, ZIP, lat/long y ficha de Google Maps (URL/CID + embed)', B.streetAddress && B.mapsPlaceUrl && B.mapsEmbedSrc],
  ['Teléfono, WhatsApp y email de Miami', B.phoneE164 && B.whatsappDigits],
  ['Horario de Miami (formato 12 h)', B.openingHours],
  ['GA4 de Miami (nueva propiedad)', cfg.ga4],
  ['Tabla de precios USD (15 niveles)', pricesDone],
  ['Cómo mostrar impuestos (los precios de Barcelona decían "IVA incluido"; en Florida suele ser "plus sales tax")', cfg.taxDisplay],
].map(([t, ok]) => `- [${ok ? 'x' : ' '}] ${t}`).join('\n')}
- [ ] Instagram: ¿la sede de Miami usa la misma cuenta (serres.wrap.center) o una propia?
- [ ] Marcas y garantías que se instalan en Miami: films 3M / Avery Dennison / Inozetek, PPF "de varias marcas profesionales", "3-year film warranty", cerámico "hasta 5 años" — el copy hereda las de Barcelona.
- [ ] Claims de capacidad heredados: "Only 6 a year" (Exclusive), "one workshop".
- [ ] Reseñas: cuando Miami tenga reseñas reales de Google, rellenar TESTIMONIALS[] en pages/why-serres.html, quitar \`hidden\` de la sección y valorar reponer AggregateRating con cifras reales.
- [ ] Páginas legales de EE. UU./Florida (privacy policy, terms): no existen. Necesitan nombre legal, dirección y email; enlazarlas en el footer, añadirlas al sitemap y a \`_build/verify-seo.js\`.
- [ ] Fotos: la galería y los antes/después son trabajos hechos en Barcelona. Revisar la matrícula española legible y el marco de concesionario en \`assets/detailing/ext-before|after\`, las bandas "E" de matrículas de la UE y las fotos con nieve/Collserola.
- [ ] Blog: cuerpos solo en inglés. Si se quiere blog bilingüe para el público hispano de Miami, son 4 traducciones fuera del diccionario (páginas gemelas).
- [ ] Barrio/zona de Miami para el SEO local: el copy dice "Miami, Florida"; con la dirección confirmada se puede afinar (p. ej. "Doral").
`;
fs.writeFileSync(path.join(root, 'CLAUDE.md'), claude.replace(/\n/g, '\r\n'));
fs.writeFileSync(path.join(root, 'TODO-MIAMI.md'), todo.replace(/\n/g, '\r\n'));
console.log('CLAUDE.md + TODO-MIAMI.md written');
