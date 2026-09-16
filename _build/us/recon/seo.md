# SEO / TECHNICAL SURFACE — Spanish source site

**SITE ROOT** = `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`
All paths below are relative to SITE ROOT unless absolute. Live domain: `https://serreswrapcenter.es`.

---

## 0. PAGE INVENTORY (16 in-scope .html)

| # | File path (rel. to SITE ROOT) | Public URL | sitemap? |
|---|---|---|---|
| 1 | `index.html` | `/` | yes |
| 2 | `pages/gallery.html` | `/pages/gallery.html` | yes |
| 3 | `pages/prices.html` | `/pages/prices.html` | yes |
| 4 | `pages/projects.html` | `/pages/projects.html` | yes |
| 5 | `pages/why-serres.html` | `/pages/why-serres.html` | yes |
| 6 | `services/ppf.html` | `/services/ppf.html` | yes |
| 7 | `services/vinyl.html` | `/services/vinyl.html` | yes |
| 8 | `services/ceramic.html` | `/services/ceramic.html` | yes |
| 9 | `services/paint-correction.html` | `/services/paint-correction.html` | yes |
| 10 | `services/detailing.html` | `/services/detailing.html` | yes |
| 11 | `services/body-kits.html` | `/services/body-kits.html` | yes |
| 12 | `blog/index.html` | `/blog/index.html` (also resolves at `/blog/`) | yes |
| 13 | `blog/cuanto-cuesta-vinilar-un-coche.html` | `/blog/cuanto-cuesta-vinilar-un-coche.html` | yes |
| 14 | `blog/cuanto-cuesta-ppf-coche.html` | `/blog/cuanto-cuesta-ppf-coche.html` | yes |
| 15 | `blog/ppf-o-ceramico-que-elegir.html` | `/blog/ppf-o-ceramico-que-elegir.html` | yes |
| 16 | `blog/limpieza-tapiceria-coche-precio.html` | `/blog/limpieza-tapiceria-coche-precio.html` | yes |

Excluded per instructions: `PPF - Phone.html`, `SERRES - Phone.html`, `scraps/extractor.html`, `frames/`, `uploads/`. Also present but NOT a page: `.screenshots/porsche-gallery/report.html` (Lighthouse JSON dump artifact, git-ignored).

**URL ↔ file mapping: 1:1, literal `.html`. There are NO clean URLs.** `.htaccess` contains **zero** `RewriteRule` / `RewriteEngine` / `Redirect` directives (verified — see §5). Only `/` → `index.html` via Apache's default `DirectoryIndex`. There is exactly one `.htaccess`, at SITE ROOT (no per-folder ones).

---

## 1. HEAD METADATA — every page

Structural constants, identical on all 16 pages:
- Line 1 `<!DOCTYPE html>`, line 2 `<html lang="es">` (all 16 — no `data-lang`, no variants)
- Line 4 `<meta charset="UTF-8">`, line 5 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<meta name="theme-color" content="#0a0a0b">`
- **`<meta name="robots">`: ABSENT on all 16 pages (grep count 0).**
- **hreflang / `<link rel="alternate">`: ABSENT on all 16 pages (grep count 0).**
- **`<base>` tag: ABSENT site-wide.**
- `og:site_name` = `SERRES Wrap Center`, `og:locale` = `es_ES`, `og:image:width` 1200 / `og:image:height` 630, `twitter:card` = `summary_large_image` — on all 16.
- `og:type` = `website` on 12 pages; = `article` on the 4 blog posts.

### 1a. Root + pages/ (line numbers are per-file)

| File | title (L6) | meta description (L7) | canonical (L8) | og:url (L14) | og:image + twitter:image (L15 / L21) |
|---|---|---|---|---|---|
| `index.html` | `PPF, Car Wrap y Detailing en Barcelona \| SERRES` | "Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp." | `https://serreswrapcenter.es/` | same | `…/assets/og/home.jpg` |
| `pages/gallery.html` | `Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing \| SERRES` | "Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover." | `…/pages/gallery.html` | same | `…/assets/og/gallery.jpg` |
| `pages/prices.html` | `Precios — PPF, Car Wrap, Ceramic Coating y Detailing \| SERRES` | "Precios de PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES." | `…/pages/prices.html` | same | `…/assets/og/prices.jpg` |
| `pages/projects.html` | `Exclusivo — Proyectos de Transformación en Barcelona \| SERRES` | "Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año." | `…/pages/projects.html` | same | `…/assets/og/projects.jpg` |
| `pages/why-serres.html` | `Estudio de Detailing en Sant Cugat — Por Qué SERRES` | "Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan." | `…/pages/why-serres.html` | same | `…/assets/og/why-serres.jpg` |

On all five: `og:title`/`twitter:title` (L12/L19) = exact copy of `<title>`; `og:description`/`twitter:description` (L13/L20) = exact copy of meta description.

### 1b. services/ (identical line layout: title L6, desc L7, canonical L8, og L9–17, twitter L18–21)

| File | title | meta description | canonical / og:url | og+twitter image |
|---|---|---|---|---|
| `services/ppf.html` | `PPF en Barcelona — Protección de Pintura \| SERRES` | "Instalación de PPF autorreparable con más de 50 colores de varias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona." | `…/services/ppf.html` | `…/assets/og/ppf.jpg` |
| `services/vinyl.html` | `Car Wrap en Barcelona — Cambio de Color \| SERRES` | "Car Wrap: cambio de color con films 3M, Avery Dennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès." | `…/services/vinyl.html` | `…/assets/og/vinyl.jpg` |
| `services/ceramic.html` | `Tratamiento Cerámico para Coche en Barcelona \| SERRES` | "Tratamiento Ceramic Coating SiO2 con hasta 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona." | `…/services/ceramic.html` | `…/assets/og/ceramic.jpg` |
| `services/paint-correction.html` | `Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES` | "Pulido por etapas a máquina: Etapa 1, 2 o 3 según el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona." | `…/services/paint-correction.html` | `…/assets/og/paint-correction.jpg` |
| `services/detailing.html` | `Detailing y Limpieza Interior de Coche en Barcelona \| SERRES` | "Limpieza integral: vapor, tapicería, cuero y motor. Deep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat." | `…/services/detailing.html` | `…/assets/og/detailing.jpg` |
| `services/body-kits.html` | `Montaje de Body Kits en Barcelona \| SERRES` | "Instalación y pintura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès." | `…/services/body-kits.html` | `…/assets/og/body-kits.jpg` |

`og:title`/`twitter:title` = `<title>`; `og:description`/`twitter:description` = meta description, on all six.

### 1c. blog/

`blog/index.html` uses a DIFFERENT head ordering than every other page (favicons L9–12 come BEFORE the OG block L14–26):

| Tag | Line | Value |
|---|---|---|
| `<title>` | 6 | `Blog — Consejos de PPF, Car Wrap y Detailing \| SERRES` |
| meta description | 7 | "Guías y consejos del equipo SERRES: precios reales de PPF, Car Wrap, Ceramic Coating y Detailing, y cómo mantener el acabado de tu coche en Barcelona." |
| canonical | 8 | `https://serreswrapcenter.es/blog/index.html` |
| og:type | 14 | `website` |
| og:title | 17 | = `<title>` |
| og:description | 18 | "Guías y consejos del equipo SERRES sobre protección de pintura y personalización." (**differs from meta description**) |
| og:url | 19 | `…/blog/index.html` |
| og:image / twitter:image | 20 / 26 | `…/assets/og/home.jpg` (reuses home OG — no dedicated blog OG image) |
| twitter:description | 25 | same short variant as og:description |

The 4 blog posts share a distinct head layout (blank lines between blocks; title at L7, canonical at L9):

| File | title (L7) | canonical (L9) | og:type | og:url | og:image / twitter:image | article:published_time / modified_time |
|---|---|---|---|---|---|---|
| `blog/cuanto-cuesta-vinilar-un-coche.html` | `¿Cuánto cuesta vinilar un coche? Precios reales 2026` | `…/blog/cuanto-cuesta-vinilar-un-coche.html` (L9) | `article` (L17) | L22 | `…/assets/blog/cuanto-cuesta-vinilar-un-coche/og.jpg` (L23 / L32) | L26 / L27 = `2026-07-09` |
| `blog/cuanto-cuesta-ppf-coche.html` | `¿Cuánto cuesta el PPF para tu coche? Precios reales 2026` | L9 | `article` (L18) | L23 | `…/assets/blog/cuanto-cuesta-ppf-coche/og.jpg` (L24 / L34) | L27 / L28 = `2026-07-09` |
| `blog/ppf-o-ceramico-que-elegir.html` | `PPF o cerámico: ¿qué elegir? Precios y diferencias 2026` | L9 | `article` (L18) | L23 | `…/assets/blog/ppf-o-ceramico-que-elegir/og.jpg` (L24 / L34) | L27 / L28 = `2026-07-09` |
| `blog/limpieza-tapiceria-coche-precio.html` | `Limpieza de tapicería del coche: precios y qué incluye` | L9 | `article` (L17) | L22 | `…/assets/blog/limpieza-tapiceria-coche-precio/og.jpg` (L23 / L32) | L26 / L27 = `2026-07-09` |

Blog-post meta descriptions (L8):
- vinilar: "Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales, factores y tabla comparativa 2026."
- ppf-coche: "PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía."
- ppf-o-ceramico: "PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat (Barcelona) y decide en 5 minutos."
- tapiceria: "Cuánto cuesta limpiar la tapicería del coche: de 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas."

On all 4 posts, `og:description` and `twitter:description` are SHORTENED variants of the meta description (not identical copies).

---

## 2. JSON-LD — every block, per page

Block positions vs `</head>`:

| File | `</head>` line | ld+json blocks at lines | note |
|---|---|---|---|
| `index.html` | 689 | 612, 648 | both in head |
| `pages/gallery.html` | 282 | 267, 270 | head |
| `pages/prices.html` | 275 | 238, 261 | head |
| `pages/projects.html` | 237 | 210, 223 | head |
| `pages/why-serres.html` | 304 | 232, 275 | head |
| `services/ppf.html` | 448 | 299, 372, 428 | head |
| `services/vinyl.html` | 479 | 332, 343, 414 | head |
| `services/ceramic.html` | 366 | 239, 290, 346 | head |
| `services/paint-correction.html` | 445 | 293, 304, 380 | head |
| **`services/detailing.html`** | **302** | **286, 515, 571** | **2 of 3 blocks are in `<body>`** |
| `services/body-kits.html` | 418 | 266, 342, 398 | head |
| `blog/index.html` | 60 | 31, 41 | head |
| `blog/cuanto-cuesta-vinilar-un-coche.html` | 149 | 40, 79, 92 | head |
| `blog/cuanto-cuesta-ppf-coche.html` | 129 | 42, 74, 87 | head |
| `blog/ppf-o-ceramico-que-elegir.html` | 129 | 50, 82, 95 | head |
| `blog/limpieza-tapiceria-coche-precio.html` | 149 | 40, 79, 92 | head |

Total: 42 JSON-LD blocks.

### Block-by-block

**`index.html` L612–647 — `AutoBodyShop`**
`name` SERRES Wrap Center · `url` `https://serreswrapcenter.es` (no trailing slash) · `telephone` `+34649663380` · `image` `https://serreswrapcenter.es/apple-touch-icon.png` · `priceRange` `€€€` · `description` (ES) · `hasMap` `https://maps.google.com/?cid=14481261717501919901` · `address` PostalAddress {streetAddress `Av. Can Fatjó dels Aurons, 15`, postalCode `08174`, addressLocality `Sant Cugat del Vallès`, addressRegion `Barcelona`, addressCountry `ES`} · `openingHoursSpecification` [Mon–Fri 09:00–19:00; Sat 10:00–14:00] · `sameAs` [`https://www.instagram.com/serres.wrap.center/`]

**`index.html` L648–679 — `FAQPage`** — 3 Questions: "¿Cuánto cuesta instalar PPF en Barcelona?", "¿Cuánto tarda un Car Wrap completo?", "¿Dónde está el taller de SERRES?"

**`pages/gallery.html` L267–269 — `ImageGallery`** (single-line minified at L268)
`name`, `description`, `url` `…/pages/gallery.html`, `image` array of 8 absolute URLs (`assets/gallery/`: rwb-front.jpg, m2-rooftop.webp, supra-villa.webp, e92-coast.webp, xm-front.webp, landrover-studio.jpg, ligier-front.webp, serie1-front.webp), `publisher` LocalBusiness.
**`pages/gallery.html` L270–272 — `BreadcrumbList`**: Inicio → Proyectos.

**`pages/prices.html` L238–260 — `Service`**
`name` "Precios de PPF, Car Wrap, Ceramic Coating y Detailing" · `serviceType` (ES) · `url` L243 · `image` L244 `…/assets/og/prices.jpg` · `areaServed` "Barcelona" · `provider` LocalBusiness {telephone `+34 649 66 33 80` (spaced form), url, PostalAddress, openingHours Mon–Fri/Sat, sameAs [instagram, `https://wa.me/34649663380`]} · `hasOfferCatalog` OfferCatalog "Servicios SERRES — precios de entrada" with 5 Offers, all `priceCurrency:"EUR"`:
| Offer name | price | url |
|---|---|---|
| Car Wrap — cambio de color | 250 | `/services/vinyl.html` (L255) |
| PPF — film de protección de pintura | 890 | `/services/ppf.html` (L256) |
| Corrección + Ceramic Coating | 340 | `/services/ceramic.html` (L257) |
| Detailing | 35 | `/services/detailing.html` (L258) |
| Body kits | 450 | `/services/body-kits.html` (L259) |

**`pages/prices.html` L261–265 — `BreadcrumbList`**: Inicio → Precios.

**`pages/projects.html` L210–222 — `Service`**: name "Exclusivo — proyecto de transformación completa de coches", serviceType, url L214, image L215 `…/assets/og/projects.jpg`, areaServed "Barcelona", provider LocalBusiness (telephone `+34 649 66 33 80`, PostalAddress, sameAs instagram+wa.me). **No offers.**
**`pages/projects.html` L223–227 — `BreadcrumbList`**: Inicio → Exclusivo.

**`pages/why-serres.html` L232–274 — `AutoRepair`**: name, description, `url` `https://serreswrapcenter.es/` (root, NOT the page), image `…/assets/og/why-serres.jpg`, telephone `+34 649 66 33 80`, `priceRange` `€€` (note: `€€€` on index), PostalAddress, openingHours Mon–Fri/Sat, sameAs [instagram, wa.me], **`aggregateRating` {ratingValue "4.9", reviewCount "50"} (L268–272)**.
**`pages/why-serres.html` L275–294 — `BreadcrumbList`**: Inicio → Por qué SERRES.

**`services/ppf.html` L299–371 — `Service`**: `@id` `…/services/ppf.html#service`, name, serviceType "Paint Protection Film (PPF)", url, description, provider LocalBusiness (telephone `+34649663380` compact), `areaServed` [City "Sant Cugat del Vallès", City "Barcelona"], 3 Offers each with nested `PriceSpecification` + `valueAddedTaxIncluded:true` + `availability InStock`: **890 / 1190 / 2390 EUR** (PPF frontal / frontal completo / carrocería completa).
**L372–427 — `FAQPage`** (6 Q): cuesta instalar PPF; cuánto dura/garantía; autorregenera; proceso instalación; días/cita; PPF vs cerámico.
**L428–438 — `BreadcrumbList`**: Inicio → Servicios (`https://serreswrapcenter.es/#services`) → PPF.

**`services/vinyl.html` L332–342 — `BreadcrumbList`** (breadcrumb FIRST here): Inicio → Servicios (`/#services`) → Car Wrap.
**L343–413 — `Service`**: `@id` `…#service`, name "Car Wrap — Vinilado de coches (car wrapping)", serviceType mentions 3M 2080 / Avery Dennison / Inozetek, url L350, `image` L351 `…/assets/og/vinyl.jpg`, provider `@type` **`AutoRepair`**, areaServed [City ×2], 3 Offers w/ PriceSpecification: **250 / 1490 / 1990 EUR** (Acentos en vinilo / Cambio de color completo / Cambio de color Signature).
**L414–478 — `FAQPage`** (6 Q).

**`services/ceramic.html` L239–289 — `Service`**: name "Tratamiento cerámico para coche en Barcelona", serviceType "Recubrimiento cerámico SiO2 (Ceramic Coating)", url L245, provider LocalBusiness (telephone `+34649663380`), areaServed [City ×2], 3 Offers: **340 / 590 / 890 EUR** (Essential / Signature / Concours). **No `@id`, no `image` field, no aggregateRating.**
**L290–345 — `FAQPage`** (6 Q).
**L346–356 — `BreadcrumbList`**: Inicio → Servicios (**`https://serreswrapcenter.es/index.html#services`** — inconsistent with `/#services` used on ppf/vinyl/paint-correction/detailing) → Ceramic Coating.

**`services/paint-correction.html` L293–303 — `BreadcrumbList`**: Inicio → Servicios (`/#services`) → Pulido de coche.
**L304–379 — `Service`**: `@id` `…#service`, name "Pulido y corrección de pintura de coche", serviceType, url L312, provider `@type` **`AutoBodyShop`** with **nested `aggregateRating` 4.9 / 50 (L326–329)**, areaServed [City ×2], 3 Offers w/ PriceSpecification: **340 / 590 / 890 EUR**.
**L380–436 — `FAQPage`** (6 Q).

**`services/detailing.html` L286–291 — `BreadcrumbList`** (minified, in head): Inicio → Servicios (`/#services`) → Detailing.
**L515–570 — `FAQPage`** (6 Q) — **IN BODY**.
**L571–… — `Service`** — **IN BODY**: `@id` `…#service`, name "Detailing y limpieza interior de coche", serviceType "Car detailing", url L579, provider `@type` **`AutoDetailing`**, areaServed [City ×2], 3 Offers w/ PriceSpecification + per-offer `url`: **35 / 150 / 490 EUR** (Refresh / Deep Clean / Showroom Reset).

**`services/body-kits.html` L266–341 — `Service`**: name "Montaje de body kits", serviceType, url L272, provider `@type` **`AutoBodyShop`**, provider `url` **`https://serreswrapcenter.es`** (L278, no trailing slash), nested **`aggregateRating` 4.9 / 50 (L287–290)**, areaServed [City ×2], `hasOfferCatalog` OfferCatalog "Tarifas de montaje de body kits" with 3 Offers: **450 / 1490 / 3490 EUR**.
**L342–397 — `FAQPage`** (6 Q).
**L398–408 — `BreadcrumbList`**: Inicio → Servicios (`…/index.html#services`) → Body Kits.

**`blog/index.html` L31–40 — `Blog`**: `@id` `…/blog/index.html`, name "Blog de SERRES Wrap Center", `inLanguage` `"es"`, publisher Organization.
**L41–50 — `BreadcrumbList`**: Inicio → Blog (position 2 has **no `item`**).

**Blog posts** — each has 3 blocks (Article/BlogPosting → BreadcrumbList → FAQPage):

| File | Block 1 @type | @id | headline | inLanguage | datePublished / dateModified | author | publisher.logo |
|---|---|---|---|---|---|---|---|
| `cuanto-cuesta-vinilar-un-coche.html` (L40) | **`Article`** | `…#article` | "¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)" (≠ `<title>`) | **`es-ES`** | 2026-07-09 / 2026-07-09 | Organization "SERRES Wrap Center" | `…/apple-touch-icon.png` |
| `cuanto-cuesta-ppf-coche.html` (L42) | **`BlogPosting`** | `…#article` | "¿Cuánto cuesta el PPF para tu coche? Precios reales 2026" | **`es`** | 2026-07-09 / 2026-07-09 | Organization **"Equipo SERRES"** | `…/apple-touch-icon.png` |
| `ppf-o-ceramico-que-elegir.html` (L50) | **`BlogPosting`** | `…#article` | "PPF o cerámico: ¿qué elegir según tu coche y tu presupuesto?" (≠ `<title>`) | **`es`** | 2026-07-09 / 2026-07-09 | Organization **"Equipo SERRES"** | `…/apple-touch-icon.png` |
| `limpieza-tapiceria-coche-precio.html` (L40) | **`BlogPosting`** | `…#article` | "Limpieza de tapicería del coche: precios y qué incluye" | **`es-ES`** | 2026-07-09 / 2026-07-09 | Organization "SERRES Wrap Center" | `…/apple-touch-icon.png` |

All 4 carry `mainEntityOfPage` → WebPage `@id` = page URL, `image` = the post's `og.jpg`, and a `publisher.address` PostalAddress.
Breadcrumbs (L79 / L74 / L82 / L79): Inicio → Blog (`…/blog/index.html`) → post title, **position 3 has no `item`** on all 4.
FAQPage blocks (L92 / L87 / L95 / L92): 5 Questions each.

---

## 3. `sitemap.xml` (SITE ROOT, 2549 bytes, 16 `<url>` entries)

No `<changefreq>`, no `xhtml:link` alternates. Every entry has `<lastmod>2026-07-09</lastmod>`.

| Line | `<loc>` | priority |
|---|---|---|
| 4 | `https://serreswrapcenter.es/` | 1.0 |
| 9 | `…/services/ppf.html` | 0.9 |
| 14 | `…/services/vinyl.html` | 0.9 |
| 19 | `…/services/ceramic.html` | 0.9 |
| 24 | `…/services/paint-correction.html` | 0.9 |
| 29 | `…/services/detailing.html` | 0.9 |
| 34 | `…/services/body-kits.html` | 0.9 |
| 39 | `…/pages/prices.html` | 0.8 |
| 44 | `…/pages/why-serres.html` | 0.7 |
| 49 | `…/pages/gallery.html` | 0.7 |
| 54 | `…/pages/projects.html` | 0.6 |
| 59 | `…/blog/index.html` | 0.7 |
| 64 | `…/blog/cuanto-cuesta-vinilar-un-coche.html` | 0.6 |
| 69 | `…/blog/ppf-o-ceramico-que-elegir.html` | 0.6 |
| 74 | `…/blog/cuanto-cuesta-ppf-coche.html` | 0.6 |
| 79 | `…/blog/limpieza-tapiceria-coche-precio.html` | 0.6 |

---

## 4. `robots.txt` (SITE ROOT, 77 bytes, CRLF line endings)

```
User-agent: *
Allow: /

Sitemap: https://serreswrapcenter.es/sitemap.xml
```
Only one domain reference, at **line 4**. No `Disallow`, no crawl-delay, no per-bot blocks.

---

## 5. `.htaccess` (SITE ROOT, 2130 bytes, 43 lines)

Contains **no redirects, no rewrites, no HTTPS/www canonicalization, no security headers, no compression, no custom error docs.** It does exactly three things:

| Lines | Directive | Effect |
|---|---|---|
| 16–18 | `<IfModule mod_expires.c> ExpiresActive Off </IfModule>` | Kills Hostinger's default long-lived expiry (was caching 7 days) |
| 21–30 | `<IfModule mod_headers.c>` → `Header unset Expires`, `Header unset Pragma`, `Header set Cache-Control "no-cache, must-revalidate"`; plus `<FilesMatch "\.(html?\|json)$">` → `Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"` | Everything must revalidate; HTML/JSON never reused from cache |
| 34 | `FileETag MTime Size` | Keeps ETag/Last-Modified so revalidation can 304 |
| 39–43 | `<IfModule mod_mime.c>` → `AddType font/woff2 .woff2`, `font/woff .woff`, `font/ttf .ttf` | Correct MIME for self-hosted fonts on Hostinger |

The header comment block (L1–12) documents the intent: "every change pushed to the site is visible immediately". Note the `no-store` on HTML is a deliberate anti-stale-cache choice, NOT a performance setting — it will hurt Core Web Vitals on a US site and should be a conscious port decision.

---

## 6. HARDCODED `serreswrapcenter.es` — every occurrence (file : line)

Total **179 occurrences across 20 files**. Zero in `assets/*.js`, `assets/*.css`, `.htaccess`, `image-slot.js`, or any binary. Per-file totals: sitemap.xml 16, prices 14, ppf 13, detailing 13, the 4 blog posts 12 each, vinyl 11, paint-correction 10, ceramic 9, body-kits 9, projects 9, why-serres 8, blog/index 7, gallery 6, index 6, `_build/agg-report.json` 4, robots.txt 1.

**`robots.txt`**: 4
**`sitemap.xml`**: 4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79

**`index.html`** (6): 8 canonical · 14 og:url · 15 og:image · 21 twitter:image · 617 JSON-LD `url` (no trailing slash) · 619 JSON-LD `image`
**`pages/gallery.html`** (6 lines, 15 string instances): 8 canonical · 14 og:url · 15 og:image · 21 twitter:image · **268** (10 instances: ImageGallery `url`, 8 `image[]` entries, publisher `url`) · **271** (2: breadcrumb items)
**`pages/prices.html`** (14): 8 · 14 · 15 · 21 · 243 · 244 · 248 · 255 · 256 · 257 · 258 · 259 · 263 · 264
**`pages/projects.html`** (9): 8 · 14 · 15 · 21 · 214 · 215 · 219 · 225 · 226
**`pages/why-serres.html`** (8): 8 · 14 · 15 · 21 · 238 · 239 · 284 · 290
**`services/ppf.html`** (13): 8 · 14 · 15 · 21 · 303 · 306 · 311 · 339 · 353 · 367 · 433 · 434 (`/#services`) · 435
**`services/vinyl.html`** (11): 8 · 14 · 15 · 21 · 337 · 338 (`/#services`) · 339 · 347 · 350 · 351 · 356
**`services/ceramic.html`** (9): 8 · 14 · 15 · 21 · 245 · 250 · 351 · 352 (`/index.html#services`) · 353
**`services/paint-correction.html`** (10): 8 · 14 · 15 · 21 · 298 · 299 (`/#services`) · 300 · 308 · 312 · 317
**`services/detailing.html`** (13): 8 · 14 · 15 · 21 · 288 · 289 (`/#services`) · 290 · 575 · 579 · 583 · 612 · 627 · 642
**`services/body-kits.html`** (9): 8 · 14 · 15 · 21 · 272 · 278 (no trailing slash) · 403 · 404 (`/index.html#services`) · 405
**`blog/index.html`** (7): 8 · 19 · 20 · 26 · 35 · 38 (no trailing slash) · 46
**`blog/cuanto-cuesta-vinilar-un-coche.html`** (12): 9 · 22 · 23 · 32 · 44 · 47 · 53 · 58 · 63 · 64 · 84 · 85
**`blog/cuanto-cuesta-ppf-coche.html`** (12): 9 · 23 · 24 · 34 · 46 · 47 · 50 · 54 · 58 (no slash) · 59 · 79 · 80
**`blog/ppf-o-ceramico-que-elegir.html`** (12): 9 · 23 · 24 · 34 · 54 · 55 · 58 · 62 · 66 (no slash) · 67 · 87 · 88
**`blog/limpieza-tapiceria-coche-precio.html`** (12): 9 · 22 · 23 · 32 · 44 · 47 · 51 · 58 · 63 · 64 · 84 · 85
**`_build/agg-report.json`** (4, prose inside a prior-session report, not shipped): 881, 905, 916, 969

---

## 7. FAVICON / APPLE-TOUCH / MANIFEST

Files present at SITE ROOT: `favicon.ico` (3620 B), `favicon-16.png` (482 B), `favicon-32.png` (1081 B), `favicon-512.png` (8794 B), `apple-touch-icon.png` (8493 B).

Every one of the 16 pages carries this identical block (root-absolute paths — works because the site is at domain root):
```
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0a0a0b">
```
Lines: **22–26** on all pages EXCEPT `blog/index.html` (**9–13**) and the 4 blog posts (**11–15**, except `limpieza-tapiceria` at **11–15** too).

- **No `manifest.json` / `site.webmanifest` exists, and no `<link rel="manifest">` appears anywhere.** The site is not a PWA.
- **`favicon-512.png` is orphaned** — zero references in any HTML, CSS or JS. (It was presumably generated for a manifest that was never written.)
- `apple-touch-icon.png` doubles as the schema.org `logo`/`image` in 6 JSON-LD blocks (index L619, and the 4 blog posts' publisher logos) — a 180px icon used where a proper logo ImageObject belongs.

---

## 8. OTHER TECHNICAL SURFACE (relevant to the port)

**Shared head resources — identical on all 16 pages:**
- L27–28: `<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/barlow-condensed-700-normal-latin.woff2" crossorigin>` and `…/dm-sans-400-normal-latin.woff2`
- L29: `<link rel="stylesheet" href="/assets/fonts.css">` (self-hosted; **no Google Fonts CDN link anywhere**)
- `blog/*` additionally: `<link rel="stylesheet" href="../assets/blog.css">` (L30 on blog/index, L37 on posts)
- Last line of head: `<link rel="stylesheet" href="/assets/serres-logo.css">` (index 688, gallery 281, prices 274, projects 236, why-serres 303, ppf 447, vinyl 478, ceramic 365, paint-correction 444, detailing 301, body-kits 417, blog/index 59)
- Each page's CSS is otherwise a large inline `<style>` in the head (no external main stylesheet).
- Bottom of body: `<script src="assets/serres-enhance.js" defer>` (index L1019) / `"../assets/serres-enhance.js"` (all subfolder pages: gallery 748, prices 571, projects 398, why-serres 486, ppf 971, vinyl 1294, ceramic 650, paint-correction 735, detailing 514, body-kits 681, blog/index 146).
- **No preconnect / dns-prefetch anywhere.** No CDN script tags (no GSAP, no AOS) — everything is local except GA4.

**Analytics (GA4 property `G-1K6FYZ99GN`)** — present exactly once per page, in the head, immediately before `</head>`:
index 681/686 · gallery 274/279 · prices 267/272 · projects 229/234 · why-serres 296/301 · ppf 440/445 · vinyl 471/476 · ceramic 358/363 · paint-correction 437/442 · detailing 294/299 · body-kits 410/415 · blog/index 52/57 · vinilar 141/146 · ppf-coche 121/126 · ppf-o-ceramico 41/46 · tapiceria 141/146.
A `track('whatsapp_click', { link_url, page_path })` custom-event handler exists once per page in the body: index 1030, gallery 759, prices 582, projects 409, why-serres 496, ppf 981, vinyl 1304, ceramic 660, paint-correction 745, detailing 656, body-kits 691, blog/index 156, vinilar 443, ppf-coche 441, ppf-o-ceramico 440, tapiceria 456.

**i18n (matters for "English-only at launch"):** the static HTML ships in Spanish as the SEO base language. `assets/serres-enhance.js` L285–291 (`loadI18n()`) injects `assets/serres-i18n.js` (161 KB) on every page. That file (`STORE = "serres-lang"`, `LANGS = ["en","es","ca"]`, default `"es"` at L1196) reverse-translates DOM text against an EN→{es,ca} dictionary, injects an EN/ES/CA segmented switcher into desktop nav + mobile overlay, and persists the choice in `localStorage`. **It never touches `<html lang>`, never rewrites URLs, and never emits hreflang** — so the translated variants are invisible to crawlers. For a US English-only launch this whole layer is dead weight: the HTML becomes the English source and `serres-i18n.js` + its `loadI18n()` call should be removed (or reduced to a no-op), otherwise every English string would be translated INTO Spanish for any visitor whose `localStorage` defaults to `"es"`.

**Existing SEO verifier — reusable for the port:** `_build/verify-seo.js` (84 lines) hard-codes the 16-page list (L11–19), checks OG/Twitter presence, canonical presence, JSON-LD parseability, GA4 exactly once + exactly one `whatsapp_click`, exactly one `<h1>`, a banned-claims regex list (L21–24: `10 años`, `200 micras`, `9H`, `subcontrat`, `cristal líquido`, `1080`, `medidor de brillo/espesor`), resolvable local `src`/`href` refs, and that every FAQPage question AND answer string also appears in the visible HTML. **The GA4 ID (L45) and the Spanish banned-claim regexes (L21–24) are hardcoded and will need retargeting.** `<h1>` count is currently exactly 1 on all 16 pages (verified).

**Contact endpoints that encode ES identity** (not exhaustive, flagged because they appear in schema too): `tel:` / `wa.me` links — index (5 tel / 3 wa.me), prices (1 / 4), each service page (1 / 1), blog pages (1 / 1). Phone `+34649663380` appears both compact (index L618, ppf L312, ceramic) and spaced `+34 649 66 33 80` (prices L247, projects L218, why-serres L240) in JSON-LD. Google Maps CID `14481261717501919901` (index L622) and the Maps search link (index L893) are ES-specific. Instagram `https://www.instagram.com/serres.wrap.center/` in 7 `sameAs` arrays.

---

## 9. INCONSISTENCIES / DEFECTS TO FIX (not to replicate) IN THE PORT

1. **`blog/index.html` canonical is `/blog/index.html`** while the same document also serves at `/blog/` → self-inflicted duplicate. Same shape for sitemap entry L59.
2. **`services/detailing.html` puts 2 of its 3 JSON-LD blocks in `<body>`** (L515 FAQPage, L571 Service) while `</head>` is at L302. Valid but inconsistent with the other 15 pages.
3. **Breadcrumb "Servicios" target is inconsistent**: `https://serreswrapcenter.es/#services` (ppf L434, vinyl L338, paint-correction L299, detailing L289) vs `https://serreswrapcenter.es/index.html#services` (ceramic L352, body-kits L404).
4. **Business `@type` is different on nearly every page**: `AutoBodyShop` (index, paint-correction provider, body-kits provider), `AutoRepair` (why-serres, vinyl provider), `AutoDetailing` (detailing provider), `LocalBusiness` (prices, projects, ppf, ceramic providers), `Organization` (blog). No single `@id`-linked entity graph.
5. **`priceRange` conflicts**: `€€€` (index L620) vs `€€` (why-serres L241).
6. **`aggregateRating` 4.9/50 is duplicated on 3 pages** (why-serres L268, paint-correction L326, body-kits L287) and absent from the homepage. Review-snippet markup not tied to actual `Review` objects — a US site should confirm the real Google rating before carrying this over.
7. **`inLanguage` inconsistent across blog posts**: `es-ES` (vinilar, tapiceria) vs `es` (ppf-coche, ppf-o-ceramico); `blog/index.html` uses `es`.
8. **Article vs BlogPosting inconsistent** (vinilar is `Article`, the other three are `BlogPosting`); **author inconsistent** ("SERRES Wrap Center" vs "Equipo SERRES").
9. **Headline ≠ `<title>`** on 2 posts (vinilar, ppf-o-ceramico).
10. **Trailing-slash inconsistency on the same URL** across JSON-LD: `https://serreswrapcenter.es` (index L617, body-kits L278, blog/index L38, ppf-coche L58, ppf-o-ceramico L66) vs `https://serreswrapcenter.es/` everywhere else.
11. **`blog/index.html` reuses `assets/og/home.jpg`** as its OG image and has no dedicated one.
12. **Every `<lastmod>` and every `article:*_time` is frozen at `2026-07-09`.**
13. **No `robots` meta anywhere** — fine for a live site, but the port has no staging-noindex mechanism; there is also no `Disallow` and no `.htaccess` password/noindex path.
14. **No canonical host enforcement**: `.htaccess` has no http→https and no www→non-www redirect; on the US host this must be added or both hosts will be crawlable.
15. **`Cache-Control: no-store` on all HTML** (`.htaccess` L28) — a deliberate anti-stale choice on Hostinger; carrying it to the US site costs repeat-visit performance.
16. **`favicon-512.png` orphaned** and **no web manifest** exists.