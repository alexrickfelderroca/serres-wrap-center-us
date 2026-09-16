# RECON — blog-content (SERRES V12 → Miami port)

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12`
Files read in full: `blog/index.html` (163 l), `blog/cuanto-cuesta-ppf-coche.html` (449 l), `blog/cuanto-cuesta-vinilar-un-coche.html` (450 l), `blog/limpieza-tapiceria-coche-precio.html` (463 l), `blog/ppf-o-ceramico-que-elegir.html` (448 l), `assets/blog.css` (201 l), `assets/serres-enhance.js` (358 l), `assets/serres-i18n.js` (header L1-40, dictionary L1020-1166, engine L1168-1485), `_build/verify-seo.js`, `_build/dict-tools.js`, `_build/optimize-images.js` (L50-125), `_build/webp-manifest.json` (L255-290), `sitemap.xml`, `robots.txt`, `.htaccess`, `index.html` (L690-705, L885-900).
Helper scripts (scratchpad only): `recon/wc-blog.js` (body word counts), `recon/i18n-sim.js` (static simulation of the i18n binder → bound strings vs orphans per page). All numbers below were produced by executing those scripts, not by hand.

---

## 0. Executive facts that govern the port

1. **Article bodies are NOT translated by the switcher.** Every article wraps its prose in `<article class="prose" data-i18n-skip>` (`cuanto-cuesta-ppf-coche.html:197`, `cuanto-cuesta-vinilar-un-coche.html:216`, `limpieza-tapiceria-coche-precio.html:216`, `ppf-o-ceramico-que-elegir.html:198`). `.post-meta` (author/dates/reading time), `.rel-grid` (related cards) and, on the index, `.post-grid` (L88) and the `El Blog` H1 (L81) are also `data-i18n-skip`. The switcher only touches the **chrome**: back-link label, CTA button, breadcrumb "Inicio" + article crumb (where an entry exists), TOC heading "Contenido", the TOC link "Preguntas frecuentes", "Sigue leyendo" / "Artículos relacionados", footer copyright, and the `aria-label="Migas de pan"`. `<title>` and meta description on blog pages have **no** dictionary entries, so they never switch. `<html lang>` is overwritten at runtime by `applyAll()` (`serres-i18n.js:1338`).
   → For Miami the mirror-image behaviour is: English body, Spanish chrome when ES is selected. Producing Spanish article bodies is **out of scope of the dictionary mechanism** (would need ~1.5k words × 4 articles as dictionary entries or separate `es/` files). Decision for the orchestrator — see §9.
2. **How i18n reaches blog pages:** blog pages load only `../assets/serres-enhance.js` (index L145, articles L447/L432/L445/L446). `serres-enhance.js:23` detects `/\/(services|pages|blog)\//` → `base="../"`, and `loadI18n()` (L285-291) injects `../assets/serres-i18n.js`. The `blog/` folder name must stay `blog/` (or the regex must be updated). `serres-enhance.js:35` is the mobile-menu "Blog" entry (`base + "blog/index.html"`).
3. **Current i18n direction on blog pages (verified by simulation):** 8-9 bound text nodes per article, 16-18 orphan text nodes outside skip per article (brand "SERRES", arrows, "Blog", eyebrow "Blog · PPF", the 3 H1 fragments, 6-8 TOC links, footer "· Blog"), plus 1 orphan attribute per article (`aria-label="Tabla de contenidos"`). Full list in §6.3. The Miami orphan script must therefore (a) honour `[data-i18n-skip]` exactly as the engine does, and (b) decide whether H1/TOC/eyebrow/crumb strings get dictionary entries or get moved under skip — today they are silently left untranslated.
4. **Rename blast radius per article = 8 self-references + 1-3 cross-article related cards + 2 index-card refs + sitemap + `_build/verify-seo.js` PAGES + `_build/optimize-images.js` BLOG map (+ the `assets/blog/<slug>/` folder if renamed).** Complete map in §5.
5. **`_build/verify-seo.js` hard-codes** the Spanish blog filenames (L16-18) **and** the GA4 ID `G-1K6FYZ99GN` (L45). After the port, without editing this script every page reports `MISSING` / `gtag head x0`. Its BANNED list (L21-24) is Spanish-only (`/10 años/`, `/medidor de brillo/` …) and will no longer guard English copy.
6. **FAQPage JSON-LD must stay byte-identical to the visible FAQ** (verify-seo.js L70-78 checks `html.includes(name)` / `html.includes(answer)`). Every Florida rewrite of a FAQ answer has to be applied twice (JSON-LD + `<details>`), including `€`→`$`, `SiO₂`, and en-dashes.
7. Inline Barcelona-derived trust claims live inside the article bodies (not only in aggregateRating): "el 98% de nuestros clientes nos recomiende" and "valoración media de 4,9" — 5 occurrences (§4). Same origin as the reviewCount 50 data → cannot be carried to Miami as fact.

---

## 1. blog/index.html — dossier

| Item | Value | Line |
|---|---|---|
| `<html lang>` | `es` | 2 |
| `<title>` | `Blog — Consejos de PPF, Car Wrap y Detailing \| SERRES` | 6 |
| meta description | `Guías y consejos del equipo SERRES: precios reales de PPF, Car Wrap, Ceramic Coating y Detailing, y cómo mantener el acabado de tu coche en Barcelona.` | 7 |
| canonical | `https://serreswrapcenter.es/blog/index.html` | 8 |
| favicons (root-relative) | `/favicon.ico`, `/favicon-32.png`, `/favicon-16.png`, `/apple-touch-icon.png` | 9-12 |
| og:type / site_name / locale | `website` / `SERRES Wrap Center` / `es_ES` | 14-16 |
| og:title / description / url / image (1200×630) | title = L6; desc `Guías y consejos del equipo SERRES sobre protección de pintura y personalización.`; url = canonical; image `https://serreswrapcenter.es/assets/og/home.jpg` | 17-22 |
| twitter:card/title/description/image | `summary_large_image`, same as OG, image `assets/og/home.jpg` | 23-26 |
| font preloads (root-relative) + `/assets/fonts.css` + `../assets/blog.css` | | 27-30 |
| JSON-LD #1 `Blog` | `@id` canonical, `name: Blog de SERRES Wrap Center`, `inLanguage: es`, publisher Organization url `https://serreswrapcenter.es` | 31-40 |
| JSON-LD #2 `BreadcrumbList` | `Inicio` → `https://serreswrapcenter.es/` ; `Blog` | 41-50 |
| GA4 | `G-1K6FYZ99GN` ×2 | 52, 57 |
| Nav | logo `../index.html`; back `../index.html` label `Volver al sitio` (bound → "Back to site"); CTA `../index.html#contact` `Pedir presupuesto` | 66-70 |
| H1 | `El <span class="chrome-text">Blog</span>` — `data-i18n-skip` with explanatory HTML comment (L80: "Blog" identical in EN/ES/CA and "El" would collide with dictionary key "The") | 80-81 |
| eyebrow / lead | `Guías y consejos` (bound) / `Precios, comparativas y mantenimiento — escrito por el equipo del taller, sin humo comercial.` (bound) | 79, 82 |
| Cards (`.post-grid data-i18n-skip`) | 4 cards, order: vinilar → ppf-o-ceramico → ppf-coche → limpieza | 88-138 |
| Card 1 | href `cuanto-cuesta-vinilar-un-coche.html`; img `../assets/blog/cuanto-cuesta-vinilar-un-coche/cover.webp` 1600×1000 lazy; alt `Cambio de color completo con vinilo en un coche en el taller SERRES de Sant Cugat`; date `9 jul 2026 · Car Wrap`; h2 `¿Cuánto cuesta vinilar un coche?`; p `Tarifas reales 2026: acentos desde 250 € y cambio de color completo desde 1.490 €. Qué incluye cada precio y cómo comparar presupuestos.`; `Leer artículo →` | 90-100 |
| Card 2 | href `ppf-o-ceramico-que-elegir.html`; img `.../ppf-o-ceramico-que-elegir/cover.webp`; alt `Aplicación de Ceramic Coating sobre la pintura de un coche protegido con PPF`; `9 jul 2026 · PPF · Ceramic`; h2 `PPF o cerámico: ¿qué elegir?`; p `Protección física frente a protección química: duración, precios reales y qué opción encaja con tu coche.` | 102-112 |
| Card 3 | href `cuanto-cuesta-ppf-coche.html`; img `.../cuanto-cuesta-ppf-coche/cover.webp`; alt `Instalación de film de protección de pintura PPF en el frontal de un coche`; `9 jul 2026 · PPF`; h2 `¿Cuánto cuesta el PPF para tu coche?`; p `Frontal desde 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, IVA incluido. Qué incluye cada cobertura.` | 114-124 |
| Card 4 | href `limpieza-tapiceria-coche-precio.html`; img `.../limpieza-tapiceria-coche-precio/cover.webp`; alt `Limpieza profesional de la tapicería del interior de un coche con inyección-extracción`; `9 jul 2026 · Detailing`; h2 `Limpieza de tapicería del coche: precios`; p `De 35 € a 490 € según el nivel: qué incluye cada servicio, qué técnicas se usan y cuándo compensa cada opción.` | 126-136 |
| footer | `© 2026 SERRES. Todos los derechos reservados.` (bound) | 143 |
| scripts | `../assets/serres-enhance.js` defer; inline GA click tracker (wa.me / tel:) | 145-161 |
| word count (visible, tags stripped) | 183 | — |

Note: the index card for the PPF article has its own alt text (no "Sant Cugat"); card 1 alt mentions Sant Cugat.

---

## 2. Article dossiers

### 2.1 `blog/cuanto-cuesta-ppf-coche.html` (449 lines)

| Item | Value | Line |
|---|---|---|
| `<html lang>` | es | 2 |
| `<title>` | `¿Cuánto cuesta el PPF para tu coche? Precios reales 2026` | 7 |
| meta description | `PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía.` | 8 |
| canonical | `https://serreswrapcenter.es/blog/cuanto-cuesta-ppf-coche.html` | 9 |
| og:type/site_name/locale | article / SERRES Wrap Center / es_ES | 18-20 |
| og:title | = title | 21 |
| og:description | `PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales: opciones, plazos y garantía.` | 22 |
| og:url / og:image | canonical / `https://serreswrapcenter.es/assets/blog/cuanto-cuesta-ppf-coche/og.jpg` 1200×630 | 23-26 |
| article:published_time / modified_time | 2026-07-09 / 2026-07-09 | 27-28 |
| twitter:* | card summary_large_image; title = title; description = og:description; image = og image | 31-34 |
| JSON-LD #1 `BlogPosting` | `@id` canonical#article; mainEntityOfPage canonical; headline = title; description = meta; image = og; `inLanguage: es`; datePublished/Modified 2026-07-09; **author Organization `Equipo SERRES`** url `https://serreswrapcenter.es/`; publisher `SERRES Wrap Center` + logo `apple-touch-icon.png` + **PostalAddress `Av. Can Fatjó dels Aurons, 15` / `08174` / `Sant Cugat del Vallès` / region `Barcelona` / country `ES`** + telephone `+34621244469` | 42-71 (address 60-67, tel 68) |
| JSON-LD #2 `BreadcrumbList` | Inicio → `/`; Blog → `/blog/index.html`; `Cuánto cuesta el PPF` | 74-84 |
| JSON-LD #3 `FAQPage` | 5 Q/A (identical to visible FAQ L337-372) | 87-119 |
| GA4 | ×2 | 121, 126 |
| Nav | back `index.html` label `Todos los artículos`; CTA `../index.html#contact` | 135-139 |
| Breadcrumbs (visible) | `aria-label="Migas de pan"`; Inicio / Blog / `Cuánto cuesta el PPF` | 145-153 |
| eyebrow | `Blog · PPF` | 159 |
| H1 | `¿Cuánto cuesta el <span class="chrome-text">PPF</span> para tu coche?` | 160 |
| post-meta (skip) | `Por Equipo SERRES`; `Publicado: 9 de julio de 2026`; `Actualizado: 9 de julio de 2026`; `Lectura: 8 min` | 162-170 |
| cover | `../assets/blog/cuanto-cuesta-ppf-coche/cover.webp` 1600×900 fetchpriority=high; alt `Instalación de PPF en un coche: aplicación de la lámina de protección de pintura en el frontal en el taller SERRES de Sant Cugat del Vallès` | 173-175 |
| TOC (`aria-label="Tabla de contenidos"`) | 8 anchors: #que-es-ppf, #precio-tipo-cobertura, #ppf-frontal-precio, #ppf-completo-precio, #material-preparacion, #vale-pena-ppf, #comparar-presupuestos, #faq | 183-195 |
| Headings | H2 L208 `Qué es el PPF y por qué su precio varía tanto` — TPU film, four price variables. H2 L219 `PPF coche: precio por tipo de cobertura` — 4-row table SERRES vs Spanish market + two notes. H2 L242 `PPF frontal precio: la zona que recibe el 80% de los impactos` — partial vs full front, 300 € delta vs repaint. H2 L259 `PPF coche completo precio: cuándo tiene sentido` — 3 scenarios, 3-4 days, tucked edges. H2 L277 `Lámina de protección de pintura: precio según material y preparación` — brand/warranty/prep/disassembly/size factors. H2 L298 `¿Vale la pena el PPF? Haz números` — annualised cost, cost of not protecting, resale; when it does not pay (ceramic alternative). H2 L318 `Cómo comparar presupuestos de PPF sin sorpresas` — 7 written points. H2 L336 `Preguntas frecuentes sobre el precio del PPF` — 5 FAQ. CTA H3 L379 `¿Quieres una cifra exacta para tu coche?`. H2 L401 `Artículos relacionados` + H3s L407/413/419. | |
| Internal links out (body) | `../index.html` (L202), `../pages/prices.html` (L222), `../services/ppf.html` (L330); CTA `https://wa.me/34621244469?text=Hola%20SERRES%2C%20he%20le%C3%ADdo%20la%20gu%C3%ADa%20de%20precios%20de%20PPF%20y%20quiero%20un%20presupuesto%20para%20mi%20coche.` (L386), `tel:+34621244469` display `+34 621 24 44 69` (L388) | |
| Related cards (skip) | `ppf-o-ceramico-que-elegir.html` (L405), `cuanto-cuesta-vinilar-un-coche.html` (L411), `../services/ppf.html` (L417, text `desde 890 €, con 3 años de garantía del fabricante`) | 404-423 |
| footer | `© 2026 SERRES. Todos los derechos reservados.&nbsp;&nbsp;<a href="index.html">· Blog</a>` | 429 |
| Word count | article body 1,650 (1,592 excl. CTA; FAQ 290); whole page visible 1,815 | — |
| € signs / IVA / Sant Cugat / Barcelona / 08174 / serreswrapcenter.es / GA | 60 / 11 / 5 / 3 / 2 / 12 / 2 | — |

### 2.2 `blog/cuanto-cuesta-vinilar-un-coche.html` (450 lines)

| Item | Value | Line |
|---|---|---|
| `<title>` | `¿Cuánto cuesta vinilar un coche? Precios reales 2026` | 7 |
| meta description | `Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales, factores y tabla comparativa 2026.` | 8 |
| canonical | `https://serreswrapcenter.es/blog/cuanto-cuesta-vinilar-un-coche.html` | 9 |
| og:* | type article; locale es_ES; title = title; description `Desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales, factores y tabla comparativa 2026.`; url canonical; image `.../assets/blog/cuanto-cuesta-vinilar-un-coche/og.jpg`; published/modified 2026-07-09 | 17-27 |
| twitter:* | title = title; description `Desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales y tabla comparativa 2026.`; image = og | 29-32 |
| JSON-LD #1 **`Article`** (not BlogPosting) | headline **`¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)`**; description = meta; `inLanguage: es-ES`; **author Organization `SERRES Wrap Center`**; publisher with address L65-72 (`Av. Can Fatjó dels Aurons, 15`, `Sant Cugat del Vallès`, `08174`, `Barcelona`, `ES`), telephone L73 | 40-76 |
| JSON-LD #2 BreadcrumbList | Inicio / Blog / `Cuánto cuesta vinilar un coche` | 79-89 |
| JSON-LD #3 FAQPage | 5 Q/A identical to visible FAQ L340-372 | 92-139 |
| GA4 | ×2 | 141, 146 |
| Nav / crumbs | as 2.1; crumb `Cuánto cuesta vinilar un coche` (bound → "How much does it cost to wrap a car") | 152-173 |
| eyebrow / H1 | `Blog · Car Wrap` / `¿Cuánto cuesta <span class="chrome-text">vinilar un coche</span>? Precios reales en España (2026)` | 179-180 |
| post-meta | Equipo SERRES; 9 de julio de 2026 ×2; `Lectura: 7 min` | 182-190 |
| cover | `../assets/blog/cuanto-cuesta-vinilar-un-coche/cover.webp`; alt `Vinilar un coche: cambio de color completo con film de fundición en el taller SERRES de Sant Cugat del Vallès` | 193-195 |
| TOC | 7 anchors: #precio-tipo-trabajo, #vinilado-integral-incluye, #car-wrapping-material, #vinilado-parcial-piezas, #vinilo-frente-pintar, #evaluar-presupuesto, #faq | 203-214 |
| Headings | H2 L226 `Vinilar un coche: precio según el tipo de trabajo` — 4-row table Spanish market vs SERRES. H2 L250 `Precio del vinilado integral: qué incluye (y qué no)` — 18-22 m material, 25-40 h, 4 steps; warning under 1.000 €. H2 L268 `¿Cuánto cuesta un car wrapping según el material?` — cast vs calendered vs special finishes; brands. H2 L287 `Vinilado parcial: precio por piezas` — per-piece Spanish prices. H2 L301 `Vinilar el coche entero: precio frente a pintar` — paint 3.000-6.000 € vs wrap; PPF pointer. H2 L318 `Cómo evaluar un presupuesto de vinilado` — 5 questions incl. IVA; workshop paragraph with 98 % / 4,9. H2 L339 FAQ (5). CTA H3 L379 `Precio cerrado para tu coche`. H2 L402 Related + H3 L408/414/420. | |
| Internal links out | `../index.html` (L221), `../services/vinyl.html` (L283), `../services/ppf.html` (L314), `../pages/prices.html` (L335); wa.me text `...he%20le%C3%ADdo%20el%20art%C3%ADculo%20sobre%20cu%C3%A1nto%20cuesta%20vinilar%20un%20coche%20y%20quiero%20un%20presupuesto%20cerrado%20para%20el%20m%C3%ADo.` (L387); tel (L389) | |
| Related cards | `ppf-o-ceramico-que-elegir.html` (L406), `cuanto-cuesta-ppf-coche.html` (L412), `../services/vinyl.html` (L418, `desde 1.490 €`) | 405-424 |
| footer | `© 2026 SERRES. Todos los derechos reservados.<span> &nbsp;·&nbsp; </span><a href="index.html">Blog</a>` | 430 |
| Word count | body 1,450 (1,380 excl. CTA; FAQ 290); page 1,619 | — |
| € / IVA / España* / Sant Cugat / Barcelona / 08174 / domain / GA | 36 / 5 / 8 / 5 / 2 / 2 / 12 / 2 | — |

### 2.3 `blog/limpieza-tapiceria-coche-precio.html` (463 lines)

| Item | Value | Line |
|---|---|---|
| `<title>` | `Limpieza de tapicería del coche: precios y qué incluye` | 7 |
| meta description | `Cuánto cuesta limpiar la tapicería del coche: de 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas.` | 8 |
| canonical | `https://serreswrapcenter.es/blog/limpieza-tapiceria-coche-precio.html` | 9 |
| og:* | article; es_ES; title = title; description `De 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas de los asientos.`; image `.../assets/blog/limpieza-tapiceria-coche-precio/og.jpg`; dates 2026-07-09 | 17-27 |
| twitter:* | description `De 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas.` | 29-32 |
| JSON-LD #1 BlogPosting | headline = title; `inLanguage: es-ES`; author Organization `SERRES Wrap Center`; publisher address L65-72; tel L73 | 40-76 |
| JSON-LD #2 BreadcrumbList | Inicio / Blog / `Limpieza de tapicería del coche` | 79-89 |
| JSON-LD #3 FAQPage | 5 Q/A = visible FAQ L352-385 | 92-139 |
| GA4 | ×2 | 141, 146 |
| crumb (visible) | `Limpieza de tapicería del coche` — **no dictionary entry (orphan today)** | 170 |
| eyebrow / H1 | `Blog · Detailing` / `Limpieza de <span class="chrome-text">tapicería</span> del coche: precios y qué incluye` | 179-180 |
| post-meta | Equipo SERRES; dates; `Lectura: 7 min` | 182-190 |
| cover | `../assets/blog/limpieza-tapiceria-coche-precio/cover.webp`; alt `Limpieza de tapicería del coche con máquina de inyección-extracción en el taller SERRES de Sant Cugat del Vallès` | 193-195 |
| TOC | 7: #precio-limpieza-tapiceria (`Cuánto cuesta en 2026`), #incluye-limpieza-profesional, #limpieza-interior-niveles, #quitar-manchas-asientos, #factores-precio, #compensa-cada-opcion, #faq | 203-214 |
| Headings | H2 L226 `Cuánto cuesta limpiar la tapicería del coche en 2026` — 3 variables; 4-row table Spanish market vs Refresh/Deep Clean/Showroom Reset; 25 € car wash vs studio. H2 L254 `Qué incluye una limpieza de tapicería profesional` — 6-step process (vacuum, pre-treat, steam >100 °C, injection-extraction, leather, controlled drying). H2 L275 `Limpieza interior del coche: precio según el nivel de servicio` — 3 tiers with € ranges; resale impact 300-800 €; detailing link. H2 L296 `Cómo quitar manchas de los asientos del coche` — by stain type; supermarket products. H2 L319 `Qué factores encarecen (o abaratan) el precio` — size, material, dirt level, headliner, ozone; 98 %. H2 L337 `Cuándo compensa cada opción` — Refresh/Deep Clean/Showroom Reset. H2 L351 FAQ (5). CTA H3 L392 `¿Qué nivel necesita tu interior?`. H2 L415 Related + H3 L421/427/433. | |
| Internal links out | `../index.html` (L221), `../pages/prices.html` (L252), `../services/detailing.html` (L292); wa.me text `...el%20art%C3%ADculo%20sobre%20limpieza%20de%20tapicer%C3%ADa%20y%20quiero%20precio%20cerrado%20para%20el%20interior%20de%20mi%20coche.` (L400); tel (L402) | |
| Related cards | `cuanto-cuesta-vinilar-un-coche.html` (L419), `ppf-o-ceramico-que-elegir.html` (L425), `../services/detailing.html` (L431, `Refresh 35 €, Deep Clean 150 € y Showroom Reset 490 €`) | 418-437 |
| footer | same markup as 2.2 | 443 |
| Word count | body 1,511 (1,449 excl. CTA; FAQ 254); page 1,682 | — |
| € / IVA / España* / Sant Cugat / Barcelona / 08174 / domain / GA | 53 / 2 / 2 / 3 / 2 / 2 / 12 / 2 | — |
| **Inbound links** | only `blog/index.html:126` + sitemap — **no other article links to it** (related cards on the other three never point here) | — |

### 2.4 `blog/ppf-o-ceramico-que-elegir.html` (448 lines)

| Item | Value | Line |
|---|---|---|
| `<title>` | `PPF o cerámico: ¿qué elegir? Precios y diferencias 2026` | 7 |
| meta description | `PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat (Barcelona) y decide en 5 minutos.` | 8 |
| canonical | `https://serreswrapcenter.es/blog/ppf-o-ceramico-que-elegir.html` | 9 |
| og:* | article; es_ES; title = title; description `PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real y decide en 5 minutos.`; image `.../assets/blog/ppf-o-ceramico-que-elegir/og.jpg`; dates 2026-07-09 | 18-28 |
| twitter:* | = OG | 31-34 |
| **GA4 placed BEFORE the JSON-LD** (other articles: after) | ×2 | 41, 46 |
| JSON-LD #1 BlogPosting | headline **`PPF o cerámico: ¿qué elegir según tu coche y tu presupuesto?`** (≠ title); description `PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat y decide en cinco minutos.`; `inLanguage: es`; author `Equipo SERRES`; publisher address L68-75; tel L76 | 50-79 |
| JSON-LD #2 BreadcrumbList | Inicio / Blog / `PPF o cerámico: ¿qué elegir?` | 82-92 |
| JSON-LD #3 FAQPage | 5 Q/A = visible FAQ L335-365 | 95-127 |
| crumb (visible) | `PPF o cerámico` (bound → "PPF or ceramic") | 150 |
| eyebrow / H1 | `Blog · PPF · Ceramic Coating` / `PPF o <span class="chrome-text">cerámico</span>: ¿qué elegir según tu coche y tu presupuesto?` | 159-160 |
| post-meta | Equipo SERRES; dates; `Lectura: 8 min` | 162-170 |
| cover | `../assets/blog/ppf-o-ceramico-que-elegir/cover.webp`; alt `PPF o cerámico: comparativa de protección de pintura sobre un coche en el taller SERRES de Sant Cugat` | 173-175 |
| TOC | 9: #diferencia-30-segundos, #tabla-comparativa, #ventajas-ppf, #ventajas-ceramico, #cuatro-escenarios, #opciones-proteccion, #criterio-taller, #faq, #siguiente-paso | 183-196 |
| Headings | H2 L208 `PPF vs cerámico: la diferencia en 30 segundos` — physical vs chemical barrier. H2 L221 `Diferencia entre PPF y tratamiento cerámico: tabla comparativa` — 10-row table + Spanish market note. H2 L246 `Qué hace el PPF que el cerámico no puede hacer` — chips on motorway, parking, self-heal, reversibility; brands. H2 L266 `Qué hace el cerámico que el PPF no puede hacer` — hydrophobic, gloss, chemicals, low entry cost; "no para una piedra". H2 L288 `¿Qué es mejor, PPF o cerámico? Depende de estos cuatro escenarios` — 4 scenarios. H2 L303 `Protección de pintura del coche: todas las opciones ordenadas` — wax → ceramic → PPF front → PPF full → PPF+ceramic. H2 L323 `Cómo decidimos en el taller` — motorway/street vs garage/city; 4,9 / 98 %. H2 L334 FAQ (5). **H2 L368 `El siguiente paso` — a prose section AFTER the FAQ** containing phone + Sant Cugat + "15 minutos de Barcelona". CTA H3 L379 `¿PPF, cerámico o los dos?`. H2 L400 Related + H3 L406/412/418. | |
| Internal links out | `../services/ppf.html` (L263), `../services/ceramic.html` (L286), `../index.html` (L330); wa.me text `...el%20art%C3%ADculo%20sobre%20PPF%20o%20cer%C3%A1mico%20y%20quiero%20un%20presupuesto%20para%20mi%20coche.` (L385); tel (L387) | |
| Related cards | `cuanto-cuesta-ppf-coche.html` (L404), `cuanto-cuesta-vinilar-un-coche.html` (L410), `../services/ceramic.html` (L416) | 403-421 |
| footer | `<span>© 2026 SERRES. Todos los derechos reservados.</span> &nbsp;·&nbsp; <a href="index.html">Blog</a>` (third footer variant) | 428 |
| Word count | body 1,667 (1,623 excl. CTA; FAQ 250); page 1,838 | — |
| € / IVA / España* / Sant Cugat / Barcelona / 08174 / domain / GA | 37 / 1 / 1 / 6 / 3 / 1 / 12 / 2 | — |

Schema inconsistencies to preserve-or-normalise consciously: type `Article` (vinyl) vs `BlogPosting` (others); author `Equipo SERRES` (ppf, ceramic) vs `SERRES Wrap Center` (vinyl, upholstery); `inLanguage` `es` (ppf, ceramic, index) vs `es-ES` (vinyl, upholstery). For Miami: `en` / `en-US` consistently; author `SERRES Team` or `SERRES Wrap Center Miami` — confirm naming with client.

---

## 3. Head/metadata changes common to all 5 blog pages (mechanical)

Per page: `<html lang="es">`→`en` (L2); `og:locale` `es_ES`→`en_US` (index L16; ppf L20; vinyl L19; uph L19; cer L20); canonical/og:url/og:image/twitter:image/JSON-LD `@id`/`mainEntityOfPage`/`image`/publisher url/author url/breadcrumb `item` → new domain + new slug (12 domain hits per article, 7 on index); `inLanguage`; JSON-LD publisher `address` block + `telephone` (4 articles); BreadcrumbList `Inicio`→`Home` (5 pages); GA4 ×2 per page (10 total); `article:published_time`/`modified_time` + `<time datetime>` + `Publicado/Actualizado` labels; `Lectura: N min`→`N min read`; `Por Equipo SERRES`→author; visible date format `9 de julio de 2026`→`July 9, 2026`; index card dates `9 jul 2026`→`Jul 9, 2026`. Root-relative refs kept: `/favicon*.png`, `/apple-touch-icon.png`, `/assets/fonts.css`, `/assets/fonts/*.woff2` (index L9-12, 27-29; articles L11-14, 36-38 / L34-36) — see risk R7 for GitHub Pages sub-path.

WhatsApp prefilled texts (Spanish, URL-encoded) that need English replacements + `wa.me/1XXXXXXXXXX`: ppf L386, vinyl L387, uph L400, cer L385. Phone display `+34 621 24 44 69`: ppf L388, vinyl L389, uph L402, cer L371 (in prose) + L387.

---

## 4. Passages that must change for Florida — exhaustive, with exact text

Legend: **[REG]** Spanish regulation/tax · **[GEO]** Barcelona/Sant Cugat/Spain · **[CLIM]** climate facts · **[LOC]** local habits/roads/parking · **[EUR]** EUR price/number format · **[MKT]** Spanish market comparison (needs real Miami data — never convert) · **[UNIT]** metric → US · **[CLAIM]** Barcelona-derived trust claim · **[WA]** contact.
Florida angles the brief allows: year-round sun/UV, salt air, hurricane season, love bugs (May & Sept), afternoon storms, heat/humidity, sun-damaged clear coat, sprinkler hard-water spots. Market ranges in USD must come from the client / verified Miami sources, not be invented.

### 4.1 blog/index.html
- L7 [GEO] `…y cómo mantener el acabado de tu coche en Barcelona.`
- L93 [GEO] alt `…en el taller SERRES de Sant Cugat`
- L95/107/119/131 date + category labels `9 jul 2026 · …`
- L97 [EUR][REG] `Tarifas reales 2026: acentos desde 250 € y cambio de color completo desde 1.490 €.`
- L109 (no locale; translate only)
- L121 [EUR][REG] `Frontal desde 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, IVA incluido.`
- L133 [EUR] `De 35 € a 490 € según el nivel:`
- L98/110/122/134 `Leer artículo →`; L67 `Volver al sitio`; L70 `Pedir presupuesto`; L79 `Guías y consejos`; L82 lead; L143 footer.

### 4.2 blog/cuanto-cuesta-ppf-coche.html
Head:
- L7/21/32 title [EUR-implicit] `¿Cuánto cuesta el PPF para tu coche? Precios reales 2026`
- L8/22/33/49 [EUR][REG] `PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido)…`
- L60-68 [GEO][WA] publisher address + `"telephone": "+34621244469"`
- L81 crumb name `Cuánto cuesta el PPF`
- L95 [MKT][EUR][REG] FAQ-1 answer: `En España, entre 900 € y 1.700 € el frontal parcial y hasta 2.500 € el frontal completo. Nuestra tarifa es de 890 € el frontal y 1.190 € el frontal completo, con IVA incluido, film de poliuretano autorregenerable y 3 años de garantía del fabricante.` (mirror at L339-342)
- L100 FAQ-2 [CLIM-opportunity] `…3 años de garantía del fabricante contra amarilleo, grietas y delaminación. Los films genéricos suelen degradarse a partir del segundo o tercer año.` — under Florida UV, yellowing of cheap film is faster; warranty figure must match the film the Miami shop installs (confirm). Mirror L346-349.
- L105 FAQ-3 `…lo retira un profesional con calor controlado…` (no change beyond translation) mirror L353-356.
- L110 [EUR] FAQ-4 `El Ceramic Coating SiO₂ (de 340 € a 890 € en nuestro caso, con corrección de pintura incluida)…` mirror L360-364.
- L115 FAQ-5 (translate) mirror L368-371.
Body:
- L159 `Blog · PPF`; L160 H1; L165 `Por Equipo SERRES`; L167-169 dates/`Lectura: 8 min`
- L175 [GEO] alt `…en el taller SERRES de Sant Cugat del Vallès`
- L186-193 TOC labels (translate)
- L199-206 [MKT][GEO][EUR][REG] `El PPF (Paint Protection Film) cuesta en España entre 600 € y 5.000 €, según la superficie que cubras y la calidad del film. La horquilla habitual del mercado: un frontal parcial se mueve entre 900 € y 1.700 €, un frontal completo entre 1.500 € y 2.500 €, y la carrocería completa entre 3.100 € y 5.000 €. En SERRES Wrap Center (Sant Cugat del Vallès, Barcelona) trabajamos con tarifas cerradas e IVA incluido: frontal 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, siempre con film de poliuretano autorregenerable y 3 años de garantía del fabricante.`
- L209-212 [CLIM] `Absorbe impactos de gravilla, roces de aparcamiento, arañazos de lavado y ataques químicos como resina o excrementos de pájaro.` → Florida: add love-bug acid, salt air, sun-baked bird droppings; `los microarañazos desaparecen con calor` (Florida sun does this daily — natural angle).
- L213-217 [EUR] `De ahí que un mismo servicio pueda costar 900 € o 5.000 €.`
- L220-222 [MKT][GEO][REG] `Los rangos de mercado proceden de tarifas publicadas por instaladores en España en 2026; la columna SERRES corresponde a nuestros precios de PPF, con IVA incluido.`
- L227 [REG] table header `Precio SERRES (IVA incl.)`, `Rango de mercado`
- L230-233 [EUR][MKT] every cell: `890 €` / `900–1.700 €` ; `1.190 €` / `1.500–2.500 €` ; `2.390 €` / `3.100–5.000 €` ; `desde 60–150 €` / `60–300 €`
- L238-240 [REG][LOC] `Primero: la mayoría de talleres publica precios «desde» y sin IVA; pide siempre la cifra final. Segundo: en coches de gran formato (SUV grandes, furgonetas camperizadas) el material extra puede sumar entre un 10% y un 20%.` → US: "plus sales tax" practice; large-format examples → full-size pickups / Suburban-class SUVs.
- L243-245 [LOC][UNIT] `Paragolpes, capó y aletas delanteras concentran la inmensa mayoría de los picotazos de gravilla en autopista. Un capó con 20.000 km de peaje lo demuestra a simple vista.` → I-95 / Florida's Turnpike / Palmetto, miles.
- L248-253 [EUR] `Frontal parcial (890 € en nuestro caso).` / `Frontal completo (1.190 €).`
- L255-257 [EUR][MKT][LOC] `La diferencia de 300 € suele compensar. Repintar solo un capó dañado cuesta entre 400 € y 700 € en un chapista, y esa pieza deja de llevar pintura original, algo que cualquier tasador detecta en la reventa.` (US body-shop repaint cost — real figure needed; "tasador" → appraiser / paint-meter check)
- L260-263 [MKT][GEO][EUR] `En el mercado español se factura entre 3.100 € y 5.000 €; nuestra tarifa es de 2.390 € con film de poliuretano autorregenerable, posible porque todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès.`
- L266-267 [CLIM] `El film envejece en lugar de la pintura` (Florida: clear-coat UV failure angle)
- L270-271 [EUR] `…se traduce en cientos o miles de euros al vender.`
- L281-283 [CLIM] `…La diferencia se nota al tercer año: los films económicos amarillean y pierden brillo.` (faster under FL UV — say so only if client/film data supports)
- L284-286 warranty `3 años de garantía del fabricante` [CLAIM-confirm]
- L294-295 [LOC] `Un Porsche 911 y un Ford Kuga necesitan cantidades de film distintas…` (Kuga is sold as Ford Escape in the US)
- L301-303 [EUR] `Un frontal completo de 1.190 € amortizado en cinco años de uso sale a unos 240 € al año, unos 20 € al mes. Una carrocería completa de 2.390 €, a unos 40 € al mes.` (recompute from USD prices; verify arithmetic with Node)
- L304-306 [EUR][MKT][LOC] `Repintar capó y paragolpes ronda los 600–1.000 €. Un lateral rayado en un parking, 300–600 € por pieza.`
- L311-316 [LOC][EUR] `…en un renting a 2 años donde no capitalizas la reventa…` (→ 2-year lease) `…Ceramic Coating con corrección de pintura previa (desde 340 € en nuestro caso, con durabilidad de hasta 5 años según el pack)…`
- L323 [REG] `Precio final con IVA incluido.` → "Out-the-door price including sales tax"
- L329-332 [CLAIM] `Es el motivo de que el 98% de nuestros clientes nos recomiende.` — Barcelona review statistic; remove or client-confirm for Miami.
- L378 `Presupuesto en 24 h`; L380-382 [GEO][WA] `Envíanos el modelo y unas fotos por WhatsApp y te preparamos un presupuesto cerrado de PPF el mismo día. Con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del Vallès (Barcelona).` (hours: confirm Miami schedule)
- L386 [WA] wa.me + Spanish text; L388 [WA] tel + display
- L408/414/420 related-card blurbs: `…qué cuesta…`, `Precios reales de vinilado por piezas y coche completo en 2026.`, `Packs frontal y coche completo desde 890 €, con 3 años de garantía del fabricante.`
- L429 footer.

### 4.3 blog/cuanto-cuesta-vinilar-un-coche.html
Head:
- L7/20/30 title `¿Cuánto cuesta vinilar un coche? Precios reales 2026`
- L8/21/31/46 [EUR][MKT] `Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo…`
- L45 [GEO] headline `¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)`
- L65-73 [GEO][WA] address + telephone
- L86 crumb `Cuánto cuesta vinilar un coche`
- L102 [CLIM][LOC] FAQ-1 `Un vinilo de fundición 3M o Avery Dennison dura de 5 a 7 años en exterior con un mantenimiento normal. Los calandrados baratos aguantan 2 o 3 años antes de encoger o perder color. Aparcar a cubierto y lavar a mano alargan la vida útil del film.` → Florida outdoor durability is shorter under year-round UV/heat (manufacturers publish reduced durability for FL/AZ "zone 2") — use the film maker's Florida figure, do not keep 5-7 as-is; covered parking matters more. Mirror L342-344.
- L110 FAQ-2 `…el film protege la laca de rayado leve y radiación UV…` (translate; UV angle) mirror L348-351.
- L115-118 [REG] FAQ-3 **whole Q/A is Spanish law**: `¿Hay que avisar a la DGT si vinilo el coche de otro color?` / `El color no consta en la ficha técnica del vehículo en España, así que el cambio no exige homologación ni ITV extraordinaria. Sí conviene comunicarlo a tu aseguradora para que la póliza refleje el aspecto real del coche. Es un trámite de minutos y evita problemas en un parte.` → replace with a Florida question (e.g. whether to update the vehicle colour on the FLHSMV registration / tell the insurer). Legal facts must be verified or marked "confirm" — do not assert. Mirror L354-358.
- L126 FAQ-4 `Entre 3 y 5 días laborables…` (translate) mirror L362-365.
- L134 [UNIT][LOC] FAQ-5 `¿Se puede lavar un coche vinilado en el túnel?` / `…lanza a presión a más de 30 cm del panel…` → automatic brush car wash; 12 inches. Mirror L368-371.
Body:
- L179 `Blog · Car Wrap`; L180 [GEO] H1 `…Precios reales en España (2026)`; L185-189 meta
- L195 [GEO] alt `…en el taller SERRES de Sant Cugat del Vallès`
- L206-212 TOC labels
- L218-224 [EUR][MKT][REG] `Vinilar un coche cuesta entre 250 € por piezas sueltas (techo, retrovisores, pilares) y 3.500 € por un cambio de color integral en un SUV grande con vinilo premium. La horquilla más habitual para un turismo medio con vinilo de fundición 3M o Avery Dennison se mueve entre 1.400 y 2.000 €, IVA incluido. En SERRES Wrap Center trabajamos con tarifas cerradas y publicadas: acentos desde 250 €, cambio de color completo por 1.490 € y acabado Signature por 1.990 €.`
- L227-229 [GEO][MKT] `La mayoría de talleres en España da presupuestos «a consultar». Nosotros preferimos publicar los números. Esta tabla resume lo que vas a encontrar en el mercado y lo que cobramos en nuestro taller de Sant Cugat del Vallès:`
- L234 [GEO][REG] headers `Mercado en España`, `Tarifa SERRES (IVA incl.)`
- L237-240 [EUR][MKT] cells `150 – 800 €`/`Desde 250 €`; `1.200 – 2.500 €`/`1.490 €`; `2.000 – 3.500 €`/`Presupuesto cerrado previo`; `2.500 – 5.000 €`/`1.990 €`
- L245-248 [MKT][GEO][EUR] `Los rangos de mercado salen de tarifas publicadas por talleres y rotulistas españoles en 2025-2026. La dispersión es real: por el mismo coche te pueden pedir 1.200 € o 3.000 €.`
- L251-253 [UNIT] `…hablamos de 18 a 22 metros de material y de 25 a 40 horas de trabajo.` (→ ~60-72 ft / a full 25-yd roll)
- L255-256 [CLIM] `Cualquier resto de cera o resina levanta el vinilo en meses.` (FL heat accelerates)
- L264-266 [EUR] `Cuando un presupuesto de vinilado integral baja de 1.000 €…`
- L269-270 [EUR] `El material explica entre 400 y 900 € del precio final…`
- L272-275 [CLIM][EUR] `…dura de 5 a 7 años en exterior. Coste de material para un turismo: 500 – 900 €.`
- L276-278 [CLIM] `…en un capó curvo encoge, deja ver juntas y dura 2 o 3 años.` (FL heat = faster shrink)
- L279-281 `…entre un 20 y un 40 %` (format `20-40%`)
- L288-296 [GEO][EUR][MKT] `…estos son los precios orientativos por pieza en España:` + list `Techo completo: 150 – 300 €`, `Capó: 180 – 350 €`, `Retrovisores (par): 60 – 120 €`, `Pilares y marcos de ventana: 90 – 180 €`, `Difusor, splitter o molduras: 80 – 200 €`
- L297-299 [EUR] `…transforma un acabado de serie por 250 – 400 €.`
- L304-307 [EUR][MKT] `Pintura integral de calidad: 3.000 – 6.000 €…` / `Vinilo integral: 1.400 – 2.000 € en un turismo…`
- L309-312 [EUR] `…valora en cientos o miles de euros.`
- L313-316 [EUR] `…desde 890 € el frontal y con 3 años de garantía del fabricante.`
- L328-329 [REG] `¿El precio incluye IVA? Buena parte de los rangos que verás publicados son sin IVA; los nuestros lo incluyen.` → sales-tax wording
- L331-335 [GEO][CLAIM] `En SERRES Wrap Center todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès, con cita previa de lunes a sábado. Cada coche pasa una revisión documentada panel a panel antes de la entrega, y el 98 % de nuestros clientes nos recomienda, con una valoración media de 4,9.`
- L378 `Presupuesto en 48 h`; L380-383 [REG][GEO][LOC] `…te devolvemos un presupuesto cerrado, con IVA incluido, en menos de 48 horas. Estamos en Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del Vallès (Barcelona), a 15 minutos de la ciudad.`
- L387 [WA]; L389 [WA]
- L409/415/421 related blurbs; L421 [EUR] `…desde 1.490 €.`
- L430 footer.

### 4.4 blog/limpieza-tapiceria-coche-precio.html
Head:
- L7/20/30 title; L8/21/31/50 [EUR] `…de 35 € a 490 € según el nivel…`
- L65-73 [GEO][WA] address + tel; L86 crumb
- L102 [EUR][MKT] FAQ-1 `Entre 70 € y 150 € en un servicio profesional con vapor e inyección-extracción. Los servicios básicos de mantenimiento parten de 30-40 €. Un detallado interior premium con tratamiento de cuero y desinfección se mueve entre 300 € y 500 €.` mirror L354-357
- L110 [CLIM] FAQ-2 `…más 2-4 horas de secado según el clima…` → Miami humidity: longer drying / forced-air drying essential (mildew risk). Mirror L361-363.
- L118 FAQ-3 (translate) mirror L367-370; L126 FAQ-4 mirror L374-377; L134 FAQ-5 mirror L381-384 (`Con niños, mascotas o fumadores, cada 3-4 meses` — could add beach sand/sunscreen).
Body:
- L179 `Blog · Detailing`; L180 H1; L185-189 meta; L195 [GEO] alt `…en el taller SERRES de Sant Cugat del Vallès`
- L206 TOC `Cuánto cuesta en 2026`; L207-211
- L218-224 [GEO][EUR][MKT][REG] `La limpieza profesional de la tapicería de un coche cuesta entre 70 € y 150 € en la mayoría de talleres de España. Los servicios básicos parten de 30-40 €, y un detallado interior completo con vapor, extracción y tratamiento de cuero puede llegar a 400-500 €. En SERRES Wrap Center trabajamos con tres niveles cerrados, IVA incluido: Refresh por 35 €, Deep Clean por 150 € y Showroom Reset por 490 €.`
- L226 H2 `Cuánto cuesta limpiar la tapicería del coche en 2026`
- L227-229 [CLIM-opportunity] `…extraer manchas de café incrustadas durante dos años o recuperar un cuero agrietado.` → sun-cracked leather, sunscreen, sweat, sand, mildew.
- L230-231 [GEO][MKT] `Estas son las horquillas habituales del mercado español, comparadas con nuestros precios cerrados:`
- L236 [REG] header `En SERRES (IVA incl.)`
- L239-242 [EUR][MKT] cells `25-50 €`/`Refresh, 35 €`; `40-70 €`; `70-150 €`/`Deep Clean, 150 €`; `300-500 €`/`Showroom Reset, 490 €`
- L247-250 [EUR][LOC] `La diferencia clave entre un lavadero de 25 € y un estudio de detailing no es el jabón.`
- L262-263 [UNIT] `El vapor a más de 100 °C…` (→ 212 °F)
- L269-270 [CLIM] `Un interior mal secado genera olor a humedad y moho en 48 horas.` (in Miami humidity: faster; strengthen)
- L272-273 [EUR] `En un Deep Clean de 150 €… ningún servicio de 25 €…`
- L279-287 [EUR] tiers `Mantenimiento (30-50 €)`, `Limpieza profunda (100-150 €)`, `Detallado completo (300-500 €)`
- L289-291 [EUR][MKT] `…resta entre 300 € y 800 € al valor de reventa de un coche medio. Un Showroom Reset de 490 €… y un Deep Clean de 150 €…`
- L311-312 [EUR] `…encarece el servicio 20-40 € en muchos talleres…`
- L322-323 [LOC] `Un SUV de 7 plazas o una furgoneta camperizada puede suponer un 30-50 % más…` (→ 3-row SUV / minivan / pickup)
- L326-327 [EUR] `…suplementos de 20-60 €…`; L330-331 [EUR] `Ozono o desinfección certificada suman 30-50 €…`
- L333-335 [CLAIM] `El 98 % de nuestros clientes nos recomienda en parte por eso…`
- L339-344 [EUR] `Refresh (35 €)`, `Deep Clean (150 €)`, `Showroom Reset (490 €)`
- L391 `Precio cerrado en el día`; L393-396 [GEO][WA] `…Estamos en Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del Vallès (Barcelona), con cita previa de lunes a sábado.`
- L400 [WA]; L402 [WA]
- L422 [EUR] `Desde 250 € por piezas y desde 1.490 € el cambio de color completo, con tarifas cerradas.`; L434 [EUR] `Refresh 35 €, Deep Clean 150 € y Showroom Reset 490 €.`
- L443 footer.

### 4.5 blog/ppf-o-ceramico-que-elegir.html
Head:
- L7/21/32 title; L8 [GEO][EUR] meta `PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat (Barcelona) y decide en 5 minutos.`; L22/33 og/tw desc [EUR]
- L56 headline; L57 [GEO][EUR] `…con datos de un taller de Sant Cugat…`
- L68-76 [GEO][WA] address + tel; L89 crumb
- L103 FAQ-1 (translate) mirror L337-339
- L108 [CLAIM-confirm] FAQ-2 `…en SERRES trabajamos con films de 3M (serie 2080), Avery Dennison e Inozetek con 3 años de garantía del fabricante. El Ceramic Coating dura de 2 a 5 años según el pack…` — NB 3M 2080 / Avery SWF / Inozetek are **wrap** films, not PPF (the PPF article names 3M/XPEL/SunTek at L281). Pre-existing inconsistency; Miami must name the PPF actually installed there. Mirror L343-346.
- L113 [LOC] FAQ-3 `…una piedra en autopista o un roce de llave…` mirror L350-352
- L118 [EUR] FAQ-4 `Por 890 € proteges la zona crítica…` mirror L356-358
- L123 [LOC] FAQ-5 `…su ventaja en leasing y reventa…` mirror L362-364
Body:
- L159 `Blog · PPF · Ceramic Coating`; L160 H1; L165-169 meta; L175 [GEO] alt `…en el taller SERRES de Sant Cugat`
- L186-194 TOC labels
- L200-206 [LOC][EUR] `…gravilla, roces de parking, arañazos de lavado—, elige PPF: en nuestro taller cuesta desde 890 € el frontal y 2.390 € la carrocería completa, con 3 años de garantía del fabricante. Si buscas brillo profundo, lavados más rápidos y protección química y UV, el tratamiento cerámico va de 340 € a 890 € y dura de 2 a 5 años según el pack.`
- L213-215 [CLIM] `…repele agua, suciedad, savia, excrementos de pájaro y radiación UV.` → add love bugs, salt spray, sprinkler water spots.
- L217-219 [CLIM] `…el cerámico la protege de la intemperie…`
- L231 table row `Químicos, UV, pájaros`; L234 `Duración … 3 años de garantía`; L235 `Garantía en SERRES`; L236 [EUR][REG] `Precio orientativo (IVA incl.)` / `Frontal 890 € · Pro 1.190 € · carrocería completa 2.390 €` / `Esencial 340 € · Signature 590 € · Concours 890 €` (NB "Pro" here vs "Frontal completo" in the PPF article — pack-name inconsistency)
- L241-244 [MKT][GEO][EUR] `Una nota sobre los precios: en España el PPF frontal suele moverse entre 1.500 € y 3.000 €, y el coche completo entre 4.000 € y 8.000 € según la publicación que consultes. Nuestras tarifas están por debajo de esa horquilla porque trabajamos en nuestro taller propio de Sant Cugat del Vallès, sin intermediarios.` (also contradicts the PPF article's 900-1.700 / 3.100-5.000 range — pre-existing)
- L250-251 [LOC] `Chinazos en autopista. La piedra rebota en la lámina…`
- L252-253 [LOC] `Roces de parking y de maletero. Carritos, mochilas, perros…`
- L254-255 [CLIM] `Los arañazos superficiales del lavado desaparecen con el calor del sol o con agua templada.` (Miami: every day)
- L256-257 [LOC] `En un coche de leasing o pensado para reventa…`
- L259-261 `…reciben cerca del 90 % de los impactos.` (PPF article says 80% at L242 — pre-existing inconsistency)
- L262-264 [CLAIM-confirm] `En SERRES trabajamos con films de 3M (serie 2080), Avery Dennison e Inozetek.`
- L270-271 `Un lavado pasa de 40 minutos a 15.`
- L275-276 [CLIM] `Excrementos de pájaro, savia, resina y contaminación industrial atacan el barniz en horas.` → love bugs, salt, sprinkler minerals; "contaminación industrial" less relevant.
- L277-279 [EUR] `Desde 340 € tienes pulido de un paso más recubrimiento con 2 años de durabilidad. La gama alta, con corrección completa y hasta 5 años, queda en 890 €.`
- L281-284 [UNIT] `…resiste microarañazos de lavado, no gravilla a 120 km/h.` (→ 75 mph)
- L289-291 [EUR] `PPF frontal como mínimo (890 €)… carrocería completa (2.390 €).`
- L292-294 [EUR] `Cerámico Esencial o Signature (340-590 €).`
- L295-297 [LOC][EUR][MKT] `Muchos kilómetros de autopista. … Un repintado de capó en un coche premium cuesta 600-900 € y nunca iguala la pintura de fábrica.`
- L298-301 [LOC] `Leasing, renting o reventa a corto plazo. PPF frontal si el contrato penaliza desperfectos…`
- L307-314 [EUR] `Cera o sellante tradicional (30-80 €)`, `Tratamiento cerámico (340-890 €)`, `PPF frontal (890-1.190 €)`, `PPF carrocería completa (2.390 €)`
- L324-326 [LOC][CLIM] `Si el coche hace autopista o duerme en la calle, la conversación empieza por el PPF. Si vive en garaje y hace ciudad, el cerámico suele ser suficiente.` → Miami: cars that sleep outdoors under sun/salt vs covered parking; highway commute.
- L327-330 [CLAIM] `Es parte del método que nos mantiene en 4,9 de valoración con un 98 % de clientes que nos recomiendan.`
- L369-373 [WA][GEO][LOC] `…Escríbenos por WhatsApp al +34 621 24 44 69 con el modelo y te damos presupuesto cerrado, sin visitas comerciales ni letra pequeña. Atendemos con cita previa de lunes a sábado en Sant Cugat del Vallès, a 15 minutos de Barcelona.`
- L378 `Presupuesto en 24 h`; L385 [WA]; L387 [WA]
- L407 [EUR] `…frontal desde 890 € y carrocería completa 2.390 €.`; L413 [EUR] `…desde acentos por 250 €…`; L419 `Packs Esencial, Signature y Concours…`
- L428 footer.

Units/format sweep list (all files): `1.490 €`→`$1,490` (US format, no space, symbol first); `4,9`→`4.9`; `98 %`→`98%`; `20-40 %`→`20-40%`; km/km/h/°C/cm/metros → mi/mph/°F/in/ft; `IVA`→sales tax wording; `lunes a sábado` → confirm Miami hours; dates → `July 9, 2026`.

---

## 5. Proposed English slugs + INTERNAL LINK MAP (zero-broken-links rename)

| Current | Proposed slug | Alternative |
|---|---|---|
| `blog/cuanto-cuesta-ppf-coche.html` | `blog/how-much-does-ppf-cost.html` | `paint-protection-film-cost.html` |
| `blog/cuanto-cuesta-vinilar-un-coche.html` | `blog/how-much-does-a-car-wrap-cost.html` | `car-wrap-cost.html` |
| `blog/ppf-o-ceramico-que-elegir.html` | `blog/ppf-vs-ceramic-coating.html` | `ppf-or-ceramic-coating-which-to-choose.html` |
| `blog/limpieza-tapiceria-coche-precio.html` | `blog/car-upholstery-cleaning-cost.html` | `car-interior-detailing-cost.html` |
| `blog/index.html` | unchanged | — |
| `assets/blog/<slug>/{cover.webp,og.jpg}` | rename folders to the new slugs (recommended; 4 dirs × 2 files) | keep Spanish asset folders (works, but leaks ES slugs into OG URLs) |

Anchor ids inside articles (`#que-es-ppf`, `#precio-tipo-cobertura`, …, `#faq`, `#siguiente-paso`) are Spanish too; they are only referenced by each article's own TOC (L186-193 / 206-212 / 206-212 / 186-194) — renaming them to English is optional and self-contained. No external file links to an article anchor (verified: grep shows no `blog/*.html#` references anywhere).

### 5.1 Who links to `cuanto-cuesta-ppf-coche.html`
- `blog/index.html:114` (card href), `:115` (cover img src `../assets/blog/cuanto-cuesta-ppf-coche/cover.webp`)
- self: `:9` canonical, `:23` og:url, `:24` og:image, `:34` twitter:image, `:46` `@id`, `:47` mainEntityOfPage, `:50` image, `:173` cover img src
- `blog/cuanto-cuesta-vinilar-un-coche.html:412` (rel-card)
- `blog/ppf-o-ceramico-que-elegir.html:404` (rel-card)
- `sitemap.xml:74`
- `_build/verify-seo.js:18` (PAGES); `_build/optimize-images.js:68` (BLOG map key → output folder); `_build/webp-manifest.json:276-279` (generated, informational); `_build/agg-report.json:935…` (historical report, informational)
- dictionary label (not a link): `assets/serres-i18n.js:1103` `"How much does PPF cost": ["Cuánto cuesta el PPF", …]` (crumb)

### 5.2 Who links to `cuanto-cuesta-vinilar-un-coche.html`
- `blog/index.html:90`, `:91`
- self: `:9`, `:22`, `:23`, `:32`, `:44`, `:47`, `:53`, `:193`
- `blog/cuanto-cuesta-ppf-coche.html:411`
- `blog/limpieza-tapiceria-coche-precio.html:419`
- `blog/ppf-o-ceramico-que-elegir.html:410`
- `sitemap.xml:64`
- `_build/verify-seo.js:17`; `_build/optimize-images.js:66`; `_build/webp-manifest.json:262-265`
- dictionary crumb: `assets/serres-i18n.js:1032`

### 5.3 Who links to `ppf-o-ceramico-que-elegir.html`
- `blog/index.html:102`, `:103`
- self: `:9`, `:23`, `:24`, `:34`, `:54`, `:55`, `:58`, `:173`
- `blog/cuanto-cuesta-ppf-coche.html:405`
- `blog/cuanto-cuesta-vinilar-un-coche.html:406`
- `blog/limpieza-tapiceria-coche-precio.html:425`
- `sitemap.xml:69`
- `_build/verify-seo.js:17`; `_build/optimize-images.js:67`; `_build/webp-manifest.json:269-272`
- dictionary crumb: `assets/serres-i18n.js:1050`

### 5.4 Who links to `limpieza-tapiceria-coche-precio.html`
- `blog/index.html:126`, `:127`
- self: `:9`, `:22`, `:23`, `:32`, `:44`, `:47`, `:51`, `:193`
- **no other article** links to it
- `sitemap.xml:79`
- `_build/verify-seo.js:18`; `_build/optimize-images.js:69`; `_build/webp-manifest.json:283-286`
- dictionary crumb: **none** (orphan `Limpieza de tapicería del coche` at `:170`)

### 5.5 Who links to `blog/index.html`
- `index.html:699` (desktop nav) and `:893` (footer column)
- `assets/serres-enhance.js:35` (mobile menu MENU entry, `base + "blog/index.html"`)
- each article: nav back-link `href="index.html"` (ppf :136, vinyl :156, uph :156, cer :136); crumb (ppf :149, vinyl :169, uph :169, cer :149); footer (ppf :429, vinyl :430, uph :443, cer :428); BreadcrumbList JSON-LD item URL (ppf :80, vinyl :85, uph :85, cer :88)
- self: `:8` canonical, `:19` og:url, `:35` `@id`
- `sitemap.xml:59`; `_build/verify-seo.js:16`
- No service page or `pages/*.html` links to the blog (grep `-i blog` over `services/*.html pages/*.html` = 0 hits).

### 5.6 Links OUT of the blog that the rest of the port must keep valid
`../index.html`, `../index.html#contact`, `../pages/prices.html`, `../services/ppf.html`, `../services/vinyl.html`, `../services/ceramic.html`, `../services/detailing.html`, `../assets/blog.css`, `../assets/serres-enhance.js`, `/assets/fonts.css`, `/assets/fonts/barlow-condensed-700-normal-latin.woff2`, `/assets/fonts/dm-sans-400-normal-latin.woff2`, `/favicon.ico`, `/favicon-32.png`, `/favicon-16.png`, `/apple-touch-icon.png`, `https://serreswrapcenter.es/apple-touch-icon.png` (JSON-LD logo, 4 articles), `https://serreswrapcenter.es/assets/og/home.jpg` (index OG).

---

## 6. i18n and the blog

### 6.1 Dictionary entries that bind on blog pages today (assets/serres-i18n.js)
| Line | EN key | ES value | Where used |
|---|---|---|---|
| 39 | `Get a Quote` | `Pedir presupuesto` | nav CTA, all 5 |
| 41 | `Back to site` | `Volver al sitio` | index nav |
| 100 | `© 2026 SERRES. All rights reserved.` | `© 2026 SERRES. Todos los derechos reservados.` | footers (trailing `&nbsp;` is trimmed by `affix()` L1210-1221 — `\s` matches U+00A0) |
| 1029 | `Home` | `Inicio` | crumbs ×4 |
| 1031 | `All articles` | `Todos los artículos` | article nav back-link ×4 |
| 1032 | `How much does it cost to wrap a car` | `Cuánto cuesta vinilar un coche` | vinyl crumb |
| 1033 | `Contents` | `Contenido` | TOC h2 ×4 |
| 1034 | `Keep reading` | `Sigue leyendo` | related eyebrow ×4 |
| 1035 | `Related articles` | `Artículos relacionados` | related h2 ×4 |
| 1050 | `PPF or ceramic` | `PPF o cerámico` | ceramic crumb |
| 1052 | `Frequently asked questions` | `Preguntas frecuentes` | TOC `#faq` link ×4 (the FAQ `<h2>` itself is inside skip) |
| 1103 | `How much does PPF cost` | `Cuánto cuesta el PPF` | ppf crumb |
| 1125 | `Guides & advice` | `Guías y consejos` | index eyebrow |
| 1126 | `Prices, comparisons and maintenance — written by the workshop team, no sales fluff.` | `Precios, comparativas y mantenimiento — escrito por el equipo del taller, sin humo comercial.` | index lead |
| 1165 | `Breadcrumb` | `Migas de pan` | `aria-label` on `<nav class="crumbs">` ×4 |
Total: **15 entries** touch blog chrome. The dictionary block is labelled `/* ---------- SEO package 2026-07-09: FAQ, keyword lines, blog ---------- */` (L1028); `_build/dict-tools.js merge` appends new entries under the same label (L102). `node _build/dict-tools.js check` → 790 entries, 13 pre-existing collisions (none blog-related: "Taller", "Camaleón", "Valoración media", "Demana pressupost", "Detalle trasero", "Parrilla iluminada").

### 6.2 What the switcher does on a blog page (engine facts)
- `getLang()` default `"es"` (L1196) → Miami needs `"en"`.
- `walk(document.body)` binds text nodes whose trimmed core is a DICT key or an INV (ES→EN) value (L1234-1251); attributes `aria-label`/`title` (L1227, L1258-1275); `data-en` keyed spans (L1282-1299 — none used in blog).
- `bindMeta()` (L1323-1331) binds `<title>` and `meta[name=description]` only if their text is a key/value — **no blog title/description is in the dictionary**, so they never switch (unlike service pages, e.g. L1149).
- `applyAll()` sets `<html lang>` to the current language (L1338).
- `MutationObserver` (L1437-1451) re-walks injected nodes (mobile menu from enhance.js).
- Content under `[data-i18n-skip]` is never bound (L1229-1232, L1305).

### 6.3 Current orphans per page (visible text outside skip with no entry) — output of `recon/i18n-sim.js`
- **index.html** (3): L66 `SERRES`, L67 `←`, L70 `→` (all intentional).
- **ppf-coche** (16 + 1 attr): L135 `SERRES`, L136 `←`, L139 `→`, L149 `Blog`, L159 `Blog · PPF`, L160 `¿Cuánto cuesta el` / `PPF` / `para tu coche?` (H1 split by chrome span), L186-192 seven TOC labels, L429 `· Blog`; attr L183 `aria-label="Tabla de contenidos"`.
- **vinilar** (16 + 1): L155/156/159 brand+arrows, L169 `Blog`, L179 `Blog · Car Wrap`, L180 `¿Cuánto cuesta` / `vinilar un coche` / `? Precios reales en España (2026)`, L206-211 six TOC labels, L430 `·` and `Blog`; attr L203.
- **limpieza** (17 + 1): L155/156/159, L169 `Blog`, **L170 crumb `Limpieza de tapicería del coche`**, L179 `Blog · Detailing`, L180 `Limpieza de` / `tapicería` / `del coche: precios y qué incluye`, L206-211 six TOC labels, L443 `·` `Blog`; attr L203.
- **ceramico** (18 + 1): L135/136/139, L149 `Blog`, L159 `Blog · PPF · Ceramic Coating`, L160 `PPF o` / `cerámico` / `: ¿qué elegir según tu coche y tu presupuesto?`, L186-194 eight TOC labels, L428 `·` `Blog`; attr L183.
Interpretation: today, switching to EN on an article translates only the chrome; H1, eyebrow, TOC and body stay Spanish. There is no `data-i18n-skip` on the `.post-hero` H1/eyebrow or on `.toc` — they are de-facto untranslated without being declared skip. **For the Miami "zero orphans" gate the port must either add ~45 entries (4 eyebrows, 12 H1 fragments incl. the split-heading `""` trick already used at L1053-1054 `"PPF, made"`/`"clear."`, 27 TOC labels, 1 crumb, 1 aria-label `Table of contents`) or mark `.post-hero`, `.toc`, the eyebrow and the footer link as `data-i18n-skip`, and whitelist `SERRES`, `Blog`, `←`, `→`, `·` in the orphan script.**

### 6.4 Inversion notes specific to blog
- After inversion, inline English chrome must equal the EN **keys** byte-for-byte: `Get a Quote`, `Back to site`, `All articles`, `Home`, `Contents`, `Keep reading`, `Related articles`, `Frequently asked questions`, `Guides & advice` (note the `&` — in HTML it must be `Guides &amp; advice` so the DOM text is `Guides & advice`), `Breadcrumb`, `© 2026 SERRES. All rights reserved.`, crumbs `How much does PPF cost` / `How much does it cost to wrap a car` / `PPF or ceramic` (+ a new one for upholstery).
- `Get a Quote` (L39) has a Catalan collision with `Request a quote` (`Demana pressupost`) — pruning CA removes it.
- `Blog` heading on index: keep `data-i18n-skip` (the L80 comment explains the "The"/"El" collision; with EN base the H1 would be `The Blog` and `The` **is** a dictionary key → same hazard, keep skip).
- Related-card and index-card copy (`Leer artículo →`, `Ver servicio →`, blurbs) are inside skip → English-only in Miami unless the port adds entries; consistent with today's Spanish-only behaviour.

---

## 7. Build tooling touchpoints
- `_build/verify-seo.js`: L16-18 PAGES (rename slugs); L45 GA4 regex hard-coded to `G-1K6FYZ99GN` → new ID; L21-24 BANNED list Spanish-only → add English equivalents (`10-year`, `200 microns`, `9H` already language-neutral, `subcontract`, `liquid glass`, `gloss meter`, `thickness gauge`); L70-78 FAQ mirror check stays valid and is the guard for §0.6. Known pre-existing FAIL on `pages/prices.html` (JS-built WhatsApp URL) is outside the blog.
- `_build/optimize-images.js`: L65-70 `BLOG` map keyed by Spanish slug (source photos `assets/vinyl/xm-after.jpg`, `assets/ceramic/after.jpg`, `assets/ppf/after.jpg`, `assets/detailing/int-after.jpg`) → output `assets/blog/<slug>/cover.webp` (1600×900) + `og.jpg` (1200×630) via `blogAssets()` L104-115. Depends on `_build/node_modules/sharp` (excluded from the copy — reinstall only if regeneration is needed; the copied assets already exist).
- `_build/dict-tools.js`: assumes `DICT` values are `[es, ca]` pairs (L39, L50, L68, L79) — after pruning Catalan to `[es]` (or after inverting to EN→ES), `check`/`lookup`/`merge` need a one-line adaptation (`v[1]` becomes undefined; `lookup` still works, `merge` writes `[es, ca]`).
- `_build/webp-manifest.json` L260-289 and `_build/agg-report.json` (many lines) are generated/historical outputs; they contain the Spanish slugs but nothing reads them at runtime.
- `assets/blog.css`: no locale strings (only `content:"+"` L127 and `content:"/"` L62). Tokens duplicated from services pages in its own `:root` (L5-11). `min-height:100dvh` (L15), reduced-motion block (L198-201). Nothing to change for Miami.
- `assets/serres-enhance.js` (shared, injected into every blog page): L14-19 `WA_DIGITS`, `WA_TEXT` (Spanish), `TEL_TEXT`; L164 mobile-menu contact line `Sant Cugat del Vallès, Barcelona`; L23 `/blog/` path regex; L35 MENU "Blog". Owned by another recon key but it renders on the blog.

---

## 8. Counts (blog scope)
- Pages: 5 (index + 4 articles); lines 163 / 449 / 450 / 463 / 448.
- Article body words (incl. FAQ + CTA): 1,650 / 1,450 / 1,511 / 1,667; whole-page visible: 1,815 / 1,619 / 1,682 / 1,838; index 183.
- H2 per page (incl. TOC/related/FAQ headings): 4 / 10 / 9 / 9 / 11; H3: 0 / 4 / 4 / 4 / 4.
- `€`: 7 / 60 / 36 / 53 / 37 = **193**. `IVA`: 1 / 11 / 5 / 2 / 1 = **20**.
- `serreswrapcenter.es`: 7 / 12 / 12 / 12 / 12 = **55** (of the brief's 190 site-wide).
- `G-1K6FYZ99GN`: 2 × 5 = **10** (of 34). `wa.me/34621244469`: **4** (of 15). `tel:+34621244469`: **4** (of 8). `+34 621 24 44 69` display: **5**.
- `Sant Cugat`: 1 / 5 / 5 / 3 / 6 = **20**; `Barcelona`: 1 / 3 / 2 / 2 / 3 = **11**; `08174`: 0 / 2 / 2 / 2 / 1 = **7**; `Vallès`: 0 / 5 / 5 / 3 / 3 = **16**; `España/español*`: 0 / 5 / 8 / 2 / 1 = **16**.
- JSON-LD blocks: index 2 (Blog, BreadcrumbList); each article 3 (BlogPosting|Article, BreadcrumbList, FAQPage with 5 Q/A) → **14 blocks, 20 FAQ pairs** to mirror.
- Postal-address blocks in JSON-LD: 4. Cover images: 4 (`cover.webp` 1600×900 on articles; index cards declare 1600×1000 for the same files). OG images: 4 blog + `og/home.jpg`.
- Dictionary entries binding on blog: 15. Current orphans (text): 3 / 16 / 16 / 17 / 18; orphan attrs: 0 / 1 / 1 / 1 / 1.
- Files referencing an article filename outside `blog/`: `sitemap.xml`, `_build/verify-seo.js`, `_build/optimize-images.js` (+2 generated JSON). Files referencing `blog/index.html` outside `blog/`: `index.html` (2), `assets/serres-enhance.js` (1), `sitemap.xml`, `_build/verify-seo.js`.
- Sitemap: 16 `<loc>` today (5 blog), all `lastmod 2026-07-09`; blog priorities 0.7 (index) / 0.6 (articles).

---

## 9. Risks & surprises
R1. **Article bodies are switcher-inert by design** (`data-i18n-skip`). Miami EN base ⇒ bodies English-only; a Spanish reader switching to ES gets Spanish chrome + English article, exactly mirroring today's EN experience. Either accept (parity) or budget 4 Spanish article translations outside the dictionary mechanism. Orphan script must respect skip or it reports ~6,000 "orphans".
R2. **Inline trust claims from Barcelona reviews** (98% recommend, 4.9 rating) appear 5× in article prose (ppf :332, vinyl :333-334, uph :334, cer :328-329) — not caught by an aggregateRating sweep. Must be removed/"confirm with client".
R3. **Spanish-law FAQ** (vinyl :115-118 & :354-358, DGT/ITV/homologación/aseguradora) needs a Florida replacement whose legal content is verified or explicitly flagged — do not invent FLHSMV rules.
R4. **Market ranges are the article's backbone** (every article opens with "en España entre X € y Y €"; 3 comparison tables). USD Miami ranges must be sourced, not converted; if unavailable, restructure those sentences around SERRES' own USD prices and drop the market column ("confirm with client").
R5. **Durability numbers are climate-dependent**: vinyl 5-7 years outdoor (vinyl :102/:274/:342), cheap film 2-3 years, ceramic 2-5 years, PPF 3-year warranty — under Florida UV/heat manufacturers publish shorter horizontal-surface figures. Carrying 5-7 years verbatim into Miami is a factual risk; take the film maker's Florida-zone figure or soften.
R6. **verify-seo.js will fail every page after the port until edited** (hard-coded GA ID L45 + Spanish slugs L16-18); BANNED list is Spanish-only.
R7. **Root-relative asset paths** (`/assets/fonts.css`, `/assets/fonts/*.woff2`, `/favicon*`, `/apple-touch-icon.png`) break if the Miami site is served from a GitHub Pages project sub-path without a custom domain; fine on Hostinger or with a custom domain.
R8. Pre-existing content inconsistencies the English rewrite will expose: PPF brands (3M/XPEL/SunTek at ppf :281 vs "3M 2080/Avery/Inozetek" as PPF at cer :108/:262/:344 — those are wrap films); market range for front PPF 900-1.700 € (ppf) vs 1.500-3.000 € (cer :241); "80% de los impactos" (ppf :242) vs "cerca del 90 %" (cer :261); pack name "Pro 1.190 €" (cer :236) vs "Frontal completo 1.190 €" (ppf). Confirm the Miami pack names/brands with the client and make all four articles agree.
R9. **FAQ mirror discipline**: 20 Q/A pairs must be byte-identical in JSON-LD and `<details>`; any `€`→`$`, dash or `SiO₂` change applied only once flips verify-seo.js to FAIL.
R10. Cover/OG photos are Barcelona workshop shots (alt texts say so at index :93, ppf :175, vinyl :195, uph :195, cer :175). Alt texts must drop "Sant Cugat"; whether Barcelona photos may represent the Miami shop is a client decision (brief says media stays).
R11. Three different footer markups across the four articles (ppf :429, vinyl/uph :430/:443, cer :428) and GA block position differs in cer (:41-47, before JSON-LD). Harmless, but a regex-based global replace must handle all variants.
R12. `limpieza-tapiceria-coche-precio.html` has no inbound link from any other article — SEO-weak already; the port could add it to a related card but that is beyond "only what the brief asks".
R13. `_build/dict-tools.js` assumes `[es, ca]` pairs; pruning Catalan without touching it makes `check`/`merge` misreport.
R14. `Guides & advice` key contains `&` → inline English must be written `&amp;` in HTML; a literal `&` would still parse in most browsers but is invalid and may trip the orphan script's decoder.
R15. Dates: `article:published_time`/`dateModified`/`<time>` all 2026-07-09; sitemap lastmod → today per brief. Decide whether Miami articles keep `datePublished` 2026-07-09 (they are rewrites, not new) or get the port date; `dateModified` should be the port date either way.

## 10. Confirm-with-client list (blog-specific)
Miami USD prices for PPF (front / full front "Pro" / full body / spot areas), wrap (accents / full colour change / Signature), ceramic (Essential / Signature / Concours), detailing (Refresh / Deep Clean / Showroom Reset); Miami market ranges or permission to drop the market columns; PPF brand(s) actually installed in Miami and their warranty term; wrap-film durability figure for Florida; opening days/hours (articles say "lunes a sábado"); author label (`Equipo SERRES` vs `SERRES Wrap Center`); whether the 98% / 4.9 claims may be reused (default: remove); Florida colour-change registration/insurance guidance for the vinyl FAQ; whether Barcelona workshop photos may illustrate Miami articles; new WhatsApp/phone; new domain; hosting (decides `.htaccess` vs `.nojekyll` and the root-relative-path question R7).
