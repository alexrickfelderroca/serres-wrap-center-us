# RECON `seo-surface` — SERRES Wrap Center V12 (Barcelona) → Miami port

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12`
Git: branch `main`, HEAD `4dc52fc`, remote `https://github.com/alexrickfelderroca/serreswrapcenter.git`. Working tree clean except 7 untracked `uploads/*.PNG|JPG` (excluded dir).
All `file:line` references below are relative to that root. Nothing was written inside the source; only `node _build/verify-seo.js` and `node _build/dict-tools.js check` were executed (both read-only; `merge` was NOT run).

---

## 0. Scope correction and headline counts

- The brief says "15 pages" but lists **16**: `index.html` + 4 `pages/` + 6 `services/` + `blog/index.html` + 4 articles = **16 HTML pages**, and the sitemap has **16 `<loc>`**. Every count below is over 16 pages.
- Verified in-scope counts (brief expectation in parentheses):

| Pattern | In-scope count | Notes |
|---|---|---|
| `serreswrapcenter.es` | **190** (190) | occurrence-level, HTML+sitemap+robots. 194 if `_build/agg-report.json` (4) is kept — see §8. |
| `Barcelona` | **133 in 16 HTML** (≈130 in 18 files); +1 `assets/serres-enhance.js:164`; **+144 in `assets/serres-i18n.js`** (79 lines / 49 DICT entries) | i18n dictionary is the biggest single carrier. |
| `tel:+34621244469` | **8** (8) | index ×4 (`index.html:843,848,886,904`), one per blog article (`blog/cuanto-cuesta-ppf-coche.html:388`, `…vinilar…:389`, `…limpieza…:402`, `…ppf-o-ceramico…:387`). Service/pages have NO `tel:` in HTML — the mobile call button and menu phone are injected by `assets/serres-enhance.js:14-19,164`. |
| `wa.me/34621244469` | **15** (15) | index 2 (`:853,891`), prices 5 on 3 lines (`:253` sameAs, `:322` ×3 pre-rendered tiers, `:463` JS `WA` const), projects 3, why-serres 1, blog 4. Plus built at runtime in `assets/serres-enhance.js:14-16` (`WA_DIGITS = "34621244469"`). |
| `G-1K6FYZ99GN` | **33** (34) | 16 pages × 2 (script `src` + `gtag('config')`) = 32, + `_build/verify-seo.js:45` = 33. The 34th in the brief is probably `.screenshots/porsche-gallery/report.*` (excluded dir) — not in scope. |
| `reviewCount` / `aggregateRating` | **3** (3) | `pages/why-serres.html:268-272`, `services/paint-correction.html:327-331`, `services/body-kits.html:288-292`. |
| `<html lang="es">` | 16/16 | line 2 of every page. |
| `og:locale` `es_ES` | 16/16 | line 11 (blog articles line 16/19/20/19). |
| `hreflang` / `<link rel="alternate">` / `<meta name="robots">` | **0** | none anywhere in the 16 pages. |
| `+34` (any) | HTML 5+1+2+2+4×6+2+2+2+3 = 43 lines; enhance.js 2; i18n.js 6 | includes JSON-LD `telephone` and display strings `+34 621 24 44 69` (69 occurrences across HTML+JS). |
| `08174` | 1 per page except index 3, blog ×2 each (vinilar/ppf/limpieza), ceramico 1; i18n.js 1 | all inside JSON-LD `postalCode` or the "¿Dónde está el taller?" FAQ text. |
| `€` | 168 in HTML (blog 114, prices 11, services 42…) + 38 in i18n.js | `priceCurrency":"EUR"` 38 across prices + 6 services. |

---

## 1. Per-page SEO surface (16 rows)

Common to ALL 16 pages unless noted: `<html lang="es">` (L2) · `og:type` `website` (articles: `article`) · `og:site_name` "SERRES Wrap Center" · `og:locale` `es_ES` · `og:image:width/height` 1200×630 · `twitter:card summary_large_image` + `twitter:title` + `twitter:description` + `twitter:image` · favicons (§4) · `theme-color #0a0a0b` · 2 font preloads (root-relative) · `<link rel="stylesheet" href="/assets/fonts.css">` · **no** hreflang, **no** robots meta, **no** manifest · GA4 block (`googletagmanager.com/gtag/js?id=G-1K6FYZ99GN` + `gtag('config','G-1K6FYZ99GN')`) · inline click-tracker script emitting `whatsapp_click` / `phone_click` (exactly 1 per page) · `assets/serres-enhance.js` (defer) which dynamically injects `assets/serres-i18n.js` (`assets/serres-enhance.js:285-291`) · `<title>` == `og:title` byte-for-byte on all 16 · meta description == `og:description` on the 11 non-blog pages; the 5 blog pages use a shorter `og:description`.

Only external script host anywhere: `www.googletagmanager.com`. No other CDNs (no GSAP/AOS/fonts CDN — fonts are self-hosted in `assets/fonts/`).

| # | File | `<title>` (line) | meta description (line) | canonical / og:url (lines) | og:image (line) | JSON-LD @types (lines) | GA4 (lines) | Links to blog | Script includes (lines) | Domain-absolute preload/prefetch |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `index.html` | "PPF, Car Wrap y Detailing en Barcelona \| SERRES" (6) | "Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès)…" (7) | `https://serreswrapcenter.es/` (8 / 14) | `/assets/og/home.jpg` (15, twitter 21) | **AutoBodyShop** (612-646: url 617, telephone 618, image 619, priceRange "€€€" 620, hasMap cid 622, PostalAddress 623-629, 2× OpeningHoursSpecification 631-643, sameAs Instagram 645); **FAQPage** 3 Q (648-679; Q3 contains full address+hours 674) | 681-686; tracker 1020-1029 | `blog/index.html` nav 699, footer 893 (+ menu via enhance.js) | inline 908, 915, 1020; `assets/serres-enhance.js` 1018 | none (font preloads 27-28 are `/assets/fonts/…`) |
| 2 | `pages/gallery.html` | "Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing \| SERRES" (6) | "Proyectos de SERRES en Barcelona: galería…" (7) | `/pages/gallery.html` (8 / 14) | `/assets/og/gallery.jpg` (15, 21) | **ImageGallery** (267-268: url, 8-URL `image` array, publisher LocalBusiness url); **BreadcrumbList** (270-271) | 274-279; tracker 749 | none | inline 675, 687; enhance 747 | none |
| 3 | `pages/prices.html` | "Precios — PPF, Car Wrap, Ceramic Coating y Detailing \| SERRES" (6) | "Precios de PPF desde 890 €… IVA incluido…" (7) | `/pages/prices.html` (8 / 14) | `/assets/og/prices.jpg` (15, 21) | **Service** + provider LocalBusiness (address 249, hours 250-252, sameAs IG+wa.me 253, telephone "+34 621 24 44 69" 247, areaServed "Barcelona" 245) + **OfferCatalog** 5 Offers EUR w/ service URLs (254-259); **BreadcrumbList** (261-264) | 267-272; tracker 572-585 | none | inline PRICING 350-568 (`WA` 463, `T()` 466, listens `serres:langchange`); enhance 570 | none |
| 4 | `pages/projects.html` | "Exclusivo — Proyectos de Transformación en Barcelona \| SERRES" (6) | "Exclusivo SERRES: proyectos… en Barcelona… Solo 6 al año." (7) | `/pages/projects.html` (8 / 14) | `/assets/og/projects.jpg` (15, 21) | **Service** + provider LocalBusiness (address 220, sameAs 221, telephone 218, areaServed "Barcelona" 216); **BreadcrumbList** (223-226) | 229-234; tracker 399 | none | inline 385; enhance 397 | none |
| 5 | `pages/why-serres.html` | "Estudio de Detailing en Sant Cugat — Por Qué SERRES" (6) | "Estudio de detailing en Sant Cugat del Vallès… un 98% de clientes que nos recomiendan." (7) | `/pages/why-serres.html` (8 / 14) | `/assets/og/why-serres.jpg` (15, 21) | **AutoRepair** (232-273: url, image, telephone "+34 621 24 44 69" 241, priceRange "€€" 242, address 243-249, hours 251-263, sameAs IG+wa.me 264-267, **AggregateRating 4.9/50** 268-272); **BreadcrumbList** (275-293) | 296-301; tracker 486 | none | inline 427, 439 (**TESTIMONIALS** 442-453, `paint()` 468); enhance 485 | none |
| 6 | `services/ppf.html` | "PPF en Barcelona — Protección de Pintura \| SERRES" (6) | "Instalación de PPF autorreparable… desde 890 €. Sant Cugat, Barcelona." (7) | `/services/ppf.html` (8 / 14) | `/assets/og/ppf.jpg` (15, 21) | **Service** @id (299-370: provider LocalBusiness address 313-320, areaServed 2 Cities 322-325, 3 Offers EUR + PriceSpecification `valueAddedTaxIncluded` 327-368); **FAQPage** 6 Q (372-426); **BreadcrumbList** 3 items (428-437, item2 `…/#services`) | 440-445; tracker 971 | none | inline 709, 721, 782; enhance 970 | none |
| 7 | `services/vinyl.html` | "Car Wrap en Barcelona — Cambio de Color \| SERRES" (6) | "Car Wrap… Coche completo desde 1.490 €. Sant Cugat del Vallès." (7) | `/services/vinyl.html` (8 / 14) | `/assets/og/vinyl.jpg` (15, 21) | **BreadcrumbList** (332-341); **Service** @id + image (343-412: provider **AutoRepair** address 358-365, areaServed 367-370, 3 Offers EUR 372-411); **FAQPage** 6 Q (414-469) | 471-476; tracker 1294 | none | inline 675, 687, 1032, 1097, 1251; enhance 1293 | none |
| 8 | `services/ceramic.html` | "Tratamiento Cerámico para Coche en Barcelona \| SERRES" (6) | "Tratamiento Ceramic Coating SiO2… Desde 340 €. Sant Cugat, Barcelona." (7) | `/services/ceramic.html` (8 / 14) | `/assets/og/ceramic.jpg` (15, 21) | **Service** (239-288: provider LocalBusiness 247-257, areaServed 260-263, 3 Offers EUR with "IVA incluido" descriptions 265-286); **FAQPage** 6 Q (290-344); **BreadcrumbList** (346-356, item2 `…/index.html#services`) | 358-363; tracker 650 | none | inline 573, 587; enhance 649 | none |
| 9 | `services/paint-correction.html` | "Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES" (6) | "Pulido por etapas… Sant Cugat, Barcelona." (7) | `/services/paint-correction.html` (8 / 14) | `/assets/og/paint-correction.jpg` (15, 21) | **BreadcrumbList** (293-302); **Service** @id (304-378: provider **AutoBodyShop** address 318-325 + **AggregateRating 4.9/50/best 5** 326-331, areaServed 333-336, 3 Offers EUR 338-377); **FAQPage** 6 Q (380-435) | 437-442; tracker 735 | none | inline 642, 654, 672; enhance 734 | none |
| 10 | `services/detailing.html` | "Detailing y Limpieza Interior de Coche en Barcelona \| SERRES" (6) | "Limpieza integral… Deep Clean desde 150 €… Estudio premium en Sant Cugat." (7) | `/services/detailing.html` (8 / 14) | `/assets/og/detailing.jpg` (15, 21) | **BreadcrumbList** (286-292); **FAQPage** 6 Q (514-568, placed AFTER the enhance script, in body); **Service** @id (570-644: provider **AutoDetailing** address 584-591, areaServed 593-596, 3 Offers EUR w/ url 598-643) | 294-299; tracker 646 | none | inline 499; enhance 513 | none |
| 11 | `services/body-kits.html` | "Montaje de Body Kits en Barcelona \| SERRES" (6) | "Instalación y pintura de body kits… Desde 450 €. Sant Cugat del Vallès." (7) | `/services/body-kits.html` (8 / 14) | `/assets/og/body-kits.jpg` (15, 21) | **Service** (266-340: provider **AutoBodyShop** address 279-286 + **AggregateRating 4.9/50** 287-292, areaServed 294-297, **OfferCatalog** 3 Offers EUR minPrice 298-338); **FAQPage** 6 Q (342-396); **BreadcrumbList** (398-408, item2 `…/index.html#services`) | 410-415; tracker 681 | none | inline 604, 618; enhance 680 | none |
| 12 | `blog/index.html` | "Blog — Consejos de PPF, Car Wrap y Detailing \| SERRES" (6) | "Guías y consejos del equipo SERRES… en Barcelona." (7) | `/blog/index.html` (8 / 19) | `/assets/og/home.jpg` (20, 26) — reuses home OG | **Blog** (31-39: @id, `inLanguage:"es"` 37, publisher Organization url 38); **BreadcrumbList** 2 items, item2 has no `item` URL (41-49) | 52-57; tracker 146 | 4 post cards: `cuanto-cuesta-vinilar-un-coche.html` 90, `ppf-o-ceramico-que-elegir.html` 102, `cuanto-cuesta-ppf-coche.html` 114, `limpieza-tapiceria-coche-precio.html` 126 (grid is `data-i18n-skip` 88) | `../assets/blog.css` 30; enhance 145 | none |
| 13 | `blog/cuanto-cuesta-vinilar-un-coche.html` | "¿Cuánto cuesta vinilar un coche? Precios reales 2026" (7) | "Vinilar un coche cuesta desde 250 €…" (8) | `/blog/cuanto-cuesta-vinilar-un-coche.html` (9 / 22) | `/assets/blog/cuanto-cuesta-vinilar-un-coche/og.jpg` (23, 32) | **Article** (40-77: @id 44, headline "…en España (2026)" 45, `inLanguage:"es-ES"` 48, dates 49-50, mainEntityOfPage 51-54, author Org 55-59, publisher Org + logo apple-touch-icon 64 + **PostalAddress 65-72** + telephone 73); **BreadcrumbList** 3 (79-90); **FAQPage** 5 Q (92-139; Q4 is the **DGT/ITV** question 115-118) | 141-146; tracker 433 | rel-cards `ppf-o-ceramico-que-elegir.html` 406, `cuanto-cuesta-ppf-coche.html` 412; back `index.html`; crumbs | `../assets/blog.css`; enhance 432 | none; `article:published_time/modified_time` 2026-07-09 (26-27) |
| 14 | `blog/ppf-o-ceramico-que-elegir.html` | "PPF o cerámico: ¿qué elegir? Precios y diferencias 2026" (7) | "PPF desde 890 € o cerámico desde 340 €… taller de Sant Cugat (Barcelona)…" (8) | `/blog/ppf-o-ceramico-que-elegir.html` (9 / 23) | `/assets/blog/ppf-o-ceramico-que-elegir/og.jpg` (24, 34) | **GA4 comes BEFORE JSON-LD here** (41-46); **BlogPosting** (50-80: `inLanguage:"es"` 59, author "Equipo SERRES" 62, publisher + logo 67 + address 68-75 + telephone 76); **BreadcrumbList** (82-93); **FAQPage** 5 Q inline-style (95-~128) | 41-46; tracker 430 | rel-cards `cuanto-cuesta-ppf-coche.html` 404, `cuanto-cuesta-vinilar-un-coche.html` 410 | `../assets/blog.css` 39; tracker 430; enhance **446 (after tracker)** | none; article: tags 27-28 |
| 15 | `blog/cuanto-cuesta-ppf-coche.html` | "¿Cuánto cuesta el PPF para tu coche? Precios reales 2026" (7) | "PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido)…" (8) | `/blog/cuanto-cuesta-ppf-coche.html` (9 / 23) | `/assets/blog/cuanto-cuesta-ppf-coche/og.jpg` (24, 34) | **BlogPosting** (42-72: `inLanguage:"es"` 51, publisher address 60-67, telephone 68); **BreadcrumbList** (74-85); **FAQPage** 5 Q (87-119; Q1 "En España, entre 900 € y 1.700 €…" 95) | 121-126; tracker 431 | rel-cards `ppf-o-ceramico-que-elegir.html` 405, `cuanto-cuesta-vinilar-un-coche.html` 411, `../services/ppf.html` 417; in-text `../index.html` 202, `../pages/prices.html` 222, `../services/ppf.html` 330 | `../assets/blog.css` 39; tracker 431; enhance 447 | none; article: tags 27-28 |
| 16 | `blog/limpieza-tapiceria-coche-precio.html` | "Limpieza de tapicería del coche: precios y qué incluye" (7) | "Cuánto cuesta limpiar la tapicería… de 35 € a 490 €…" (8) | `/blog/limpieza-tapiceria-coche-precio.html` (9 / 22) | `/assets/blog/limpieza-tapiceria-coche-precio/og.jpg` (23, 32) | **BlogPosting** (40-77: `inLanguage:"es-ES"` 52, publisher address 65-72, telephone 73); **BreadcrumbList** (79-90); **FAQPage** 5 Q (92-139) | 141-146; tracker 446 | rel-cards `cuanto-cuesta-vinilar-un-coche.html` 419, `ppf-o-ceramico-que-elegir.html` 425 | `../assets/blog.css` 37; enhance 445 | none; article: tags 26-27 |

Notes on the table:
- **Blog articles lack `og:image`? No** — present on all. But the 5 blog pages have **no `og:image` under `assets/og/`**; they use per-slug `assets/blog/<slug>/og.jpg` (1200×630) + `cover.webp` (1600×900) — all 8 files exist (`assets/blog/<slug>/`). Renaming slugs therefore also renames 4 asset directories (§6).
- All 11 `assets/og/*.jpg` exist (`home, ppf, vinyl, ceramic, paint-correction, detailing, body-kits, gallery, projects, prices, why-serres`).
- All 8 gallery JSON-LD image URLs (`pages/gallery.html:268`) resolve to existing files.
- BreadcrumbList item 1 name is "Inicio" on all 16 pages → "Home" for Miami; services breadcrumb item 2 URL is inconsistent: `…/#services` (ppf 434, vinyl 338, paint-correction 299, detailing 289) vs `…/index.html#services` (ceramic 352, body-kits 404).
- `priceRange` inconsistent: `"€€€"` (`index.html:620`) vs `"€€"` (`pages/why-serres.html:242`) → brief says `$$$`.
- Provider `@type` inconsistent across pages: AutoBodyShop (index, paint-correction, body-kits), AutoRepair (why-serres, vinyl), LocalBusiness (ppf, ceramic, prices, projects, gallery publisher), AutoDetailing (detailing), Organization (blog). Brief asks for AutoBodyShop + `branchOf`/`parentOrganization` → decide whether to normalise while touching every block anyway.
- `valueAddedTaxIncluded: true` appears 15× (ppf ×3, vinyl ×3, paint-correction ×3, detailing ×3, body-kits ×3) — VAT semantics; US pricing usually excludes sales tax → remove/false (client decision).
- "IVA incluido" literal inside JSON-LD Offer `description` (prices 255-259 ×5, ceramic 269/276/283, body-kits 273) and in visible text (IVA: prices 11, blog ppf 11, ceramic 6, index 3, i18n.js 14 lines / 11 DICT entries).
- `hasMap` exists only on `index.html:622` (`https://maps.google.com/?cid=14481261717501919901`). **No `geo` (latitude/longitude) property anywhere** — the brief's Miami schema adds `geo`; there is nothing to replace, only to add.
- Maps iframe: `index.html:858` `src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28430.73…!2d2.0633841973199507!3d41.49532481891128…!1s0x2027f0d4ea2a70f1%3A0xc8f7c6ce9b2a429d!2sSerres%20Wrap%20Center…!3m2!1ses!2ses…"` with `title="SERRES Wrap Center en Google Maps"` (title is a DICT-translated attr: `assets/serres-i18n.js:965`). **Brief's grep target `maps/search?query=` returns 0** — the real link is `index.html:892` `https://www.google.com/maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s` (note `/search/?api=1&query=`). Only `index.html` has any Google Maps reference; `2.0634` literal does not exist (coordinate is `2.0633841973199507`), `41.4953` matches once (`index.html:858`).
- Instagram `https://www.instagram.com/serres.wrap.center/` ×7: `index.html:645` (sameAs), `:852`, `:890`; `pages/why-serres.html:265`; `pages/projects.html:221`; `pages/prices.html:253`; `assets/serres-enhance.js:17`. Brief doesn't say whether Miami shares the IG account — confirm with client.
- Legal pages: **none exist and none are linked** (grep for privac/legal/cookie/términos across 16 pages = 0 anchors). Footer of `index.html:868-900` has Servicios / Taller / Síguenos columns only. Brief PASO 5 "privacy/terms as TODO or create" starts from zero.
- Data-driven copy with its own EN strings translated at runtime through `window.SERRES_I18N.t` (`serres:langchange` listeners): `pages/prices.html` (PRICING 354-461, `T()` 466), `pages/why-serres.html` (TESTIMONIALS 442-453), `services/ppf.html`, `services/vinyl.html` (finish filters). These sections are authored in **English in JS** and translated to ES via DICT — i.e. they are ALREADY EN-base; only the pre-rendered fallback HTML (e.g. `pages/prices.html:322`, a single 8 KB line with Spanish tiers + 3 wa.me links) is ES.
- `data-en` explicit-key elements: only 2 — `index.html:798` (`data-en=" a reality"`, the one DICT entry with empty ES value) and `pages/why-serres.html:338` (`data-en="Workshop"` → "Taller"). `data-i18n-skip` ×45 (index 9, prices 5, ppf 5, vinyl 4, projects 3, ceramic 3, blog 3 each, why-serres 1).

---

## 2. sitemap.xml (`sitemap.xml`, 83 lines)

16 `<url>` entries, each with `<loc>`, `<lastmod>2026-07-09</lastmod>`, `<priority>`; **no `<changefreq>`** on any entry. All 16 `<loc>` resolve to existing files (verified with Node):

| line | loc | priority | file |
|---|---|---|---|
| 4 | `https://serreswrapcenter.es/` | 1.0 | index.html |
| 9 | `/services/ppf.html` | 0.9 | ok |
| 14 | `/services/vinyl.html` | 0.9 | ok |
| 19 | `/services/ceramic.html` | 0.9 | ok |
| 24 | `/services/paint-correction.html` | 0.9 | ok |
| 29 | `/services/detailing.html` | 0.9 | ok |
| 34 | `/services/body-kits.html` | 0.9 | ok |
| 39 | `/pages/prices.html` | 0.8 | ok |
| 44 | `/pages/why-serres.html` | 0.7 | ok |
| 49 | `/pages/gallery.html` | 0.7 | ok |
| 54 | `/pages/projects.html` | 0.6 | ok |
| 59 | `/blog/index.html` | 0.7 | ok |
| 64 | `/blog/cuanto-cuesta-vinilar-un-coche.html` | 0.6 | ok — slug renames |
| 69 | `/blog/ppf-o-ceramico-que-elegir.html` | 0.6 | ok — slug renames |
| 74 | `/blog/cuanto-cuesta-ppf-coche.html` | 0.6 | ok — slug renames |
| 79 | `/blog/limpieza-tapiceria-coche-precio.html` | 0.6 | ok — slug renames |

Port: 16 domain substitutions + 4 slug substitutions + 16 `lastmod` → today. Sitemap uses `.html` suffixes and `/blog/index.html` explicitly (not `/blog/`), consistent with canonicals.

## 3. robots.txt (`robots.txt`, 4 lines)
```
User-agent: *          (1)
Allow: /               (2)
Sitemap: https://serreswrapcenter.es/sitemap.xml   (4)
```
One domain substitution.

## 4. .htaccess, favicons, manifest

- **`.htaccess` (43 lines) contains NO redirects, NO RewriteRule, NO domain**: only `ExpiresActive Off` (16-18), `Cache-Control no-cache, must-revalidate` + `no-store` for `.html?|json` (21-30), `FileETag MTime Size` (34), `AddType font/woff2|woff|ttf` (39-43). Comments reference Hostinger (14-15, 37). On GitHub Pages it is inert → delete and add `.nojekyll` per brief; on Hostinger keep as-is (no edits needed).
- **Favicons** (identical block on all 16 pages; `index.html:22-25`, blog articles `:11-14`, `blog/index.html:9-12`): `<link rel="icon" href="/favicon.ico" sizes="any">`, `/favicon-32.png`, `/favicon-16.png`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. All 4 files exist at root. **`favicon-512.png` exists but is referenced by nothing** (no manifest). `apple-touch-icon.png` doubles as JSON-LD `image`/`logo` (`index.html:619`, 4 blog `logo` URLs).
- **No `site.webmanifest`, `manifest.json`, `browserconfig.xml`, `mask-icon`.** `theme-color #0a0a0b` line 26 (blog 15/13).
- **All favicon, `fonts.css` and font-preload hrefs are ROOT-RELATIVE (`/favicon.ico`, `/assets/fonts.css`, `/assets/fonts/*.woff2`)** on every page. They work on a custom domain or Hostinger root, but **break on a GitHub Pages project site** (`user.github.io/<repo>/`). If Miami goes to GitHub Pages without a custom domain, either add a CNAME/custom domain or convert those 6 links per page to relative paths (`../` for nested pages).

## 5. Every absolute `serreswrapcenter.es` URL — by purpose and by file (190 total)

By purpose (occurrence-level, Node-classified):

| Purpose | Count | Where |
|---|---|---|
| `<link rel="canonical">` | 16 | line 8 (blog articles 9) of each page |
| `og:url` | 16 | line 14 (blog 19/22/23/23/22) |
| `og:image` | 16 | line 15 (blog 20/23/24/24/23) |
| `twitter:image` | 16 | line 21 (blog 26/32/34/34/32) |
| JSON-LD `url` (business / service / offer / author / publisher) | 40 | see per-file |
| JSON-LD BreadcrumbList `item` | 35 | 16 pages × 2-3 |
| JSON-LD `@id` | 13 | 5 services/blog `#service`/`#article` + mainEntityOfPage + Blog |
| JSON-LD `image` | 17 | 9 scalar + 8 in gallery `ImageGallery.image[]` (`pages/gallery.html:268`) |
| JSON-LD `logo` | 4 | 4 blog articles → `/apple-touch-icon.png` |
| sitemap `<loc>` | 16 | `sitemap.xml` |
| robots `Sitemap:` | 1 | `robots.txt:4` |
| hreflang / `<a href>` in body / preload / CSS / JS / .htaccess | **0** | none — `assets/serres-i18n.js`, `assets/serres-enhance.js`, `assets/blog.css`, `assets/fonts.css`, `.htaccess` contain **no** domain reference |

Per file (occurrences): `index.html` 6 · `pages/gallery.html` 16 · `pages/prices.html` 14 · `pages/projects.html` 9 · `pages/why-serres.html` 8 · `services/ppf.html` 13 · `services/vinyl.html` 11 · `services/ceramic.html` 9 · `services/paint-correction.html` 10 · `services/detailing.html` 13 · `services/body-kits.html` 9 · `blog/index.html` 7 · 4 articles 12 each (48) · `sitemap.xml` 16 · `robots.txt` 1 = **190**. (`grep -c` line counts differ: gallery shows 6 lines but 16 occurrences because line 268 holds 10 URLs.)

Two URL forms coexist: `https://serreswrapcenter.es` (no slash: `index.html:617`, `services/body-kits.html:278`, `blog/index.html:38`, blog publisher url ×2) and `https://serreswrapcenter.es/`. A plain domain replace handles both; the brief's `sameAs` exception must keep exactly one reference per business block pointing back to the Barcelona site.

## 6. Blog slug rename — every reference that breaks (4 slugs)

Current slugs → files in `blog/` and asset dirs in `assets/blog/`:
`cuanto-cuesta-vinilar-un-coche`, `ppf-o-ceramico-que-elegir`, `cuanto-cuesta-ppf-coche`, `limpieza-tapiceria-coche-precio`.

References (all must change together):
1. **File names**: `blog/<slug>.html` ×4; **asset dirs** `assets/blog/<slug>/{cover.webp,og.jpg}` ×4.
2. **Self-references inside each article** (canonical, og:url, og:image, twitter:image, `@id`, `mainEntityOfPage.@id`, `image`, `<img src="../assets/blog/<slug>/cover.webp">`):
   - vinilar: `:9, :22, :23, :32, :44, :47, :53, :193`
   - ppf-o-ceramico: `:9, :23, :24, :34, :54, :55, :58, :173`
   - cuanto-cuesta-ppf: `:9, :23, :24, :34, :46, :47, :50, :173`
   - limpieza: `:9, :22, :23, :32, :44, :47, :51, :193`
3. **Cross-links between articles** (`rel-card`): `cuanto-cuesta-ppf-coche.html:405,411` · `cuanto-cuesta-vinilar-un-coche.html:406,412` · `ppf-o-ceramico-que-elegir.html:404,410` · `limpieza-tapiceria-coche-precio.html:419,425`.
4. **`blog/index.html` cards**: `:90-91`, `:102-103`, `:114-115`, `:126-127` (href + cover img).
5. **`sitemap.xml`**: `:64, :69, :74, :79`.
6. **`_build/verify-seo.js` PAGES**: `:17-18` (else the verifier reports `MISSING`).
7. **`_build/optimize-images.js` BLOG map**: `:66-69` (only matters if covers are regenerated).
8. `_build/webp-manifest.json:262-286` and `_build/agg-report.json` (informational; see §8).
9. Not affected: `index.html`, services, pages (they link only to `blog/index.html`: `index.html:699,893`; `assets/serres-enhance.js:35` MENU). No JS builds article URLs. Nothing in `assets/serres-i18n.js` references slugs (article titles are keys, not URLs).

## 7. i18n architecture as it touches the SEO surface (`assets/serres-i18n.js`, 1485 lines, 163 KB)

- Header comment 1-19 documents the inverted design. `STORE="serres-lang"` (22), `LANGS=["en","es","ca"]` (23), `LABELS` (24), `var DICT = {` (31) … closing brace ~line 1165; **790 entries**, format `"English key": ["español", "català"]`. 20 entries have `es === key` (brand/tech terms), 1 entry with empty ES (`" a reality"`), 1 with empty CA.
- `INV` ES→EN index built 1174-1181 (first ES value wins; **13 ES/CA collisions today** per `dict-tools check`: "Taller"→Studio/Workshop, "Camaleón"→Color Flip/Colour Shift/Flip, "Valoración media", "Detalle trasero", "Parrilla iluminada", "Demana pressupost"). `enKeyOf()` 1184-1188 resolves either direction.
- `getLang()` 1193-1197: **default `"es"`** when nothing stored → must become `"en"`. `tr()` 1199-1205: `current==="en"` returns the key verbatim (so EN never needs a value).
- **`applyAll()` 1337-1343 sets `document.documentElement.lang = current`** — i.e. `<html lang>` is rewritten at runtime on every page; the static `lang="es"` is only the no-JS/first-paint value.
- **`<title>` and `meta[name=description]` are translated at runtime** (`bindMeta` 1322-1331, `applyMeta` 1332-1335) by exact-match lookup of the inline Spanish text. Coverage today: all 11 non-blog pages have title+description in DICT (`assets/serres-i18n.js:57,107,248` for titles; meta descriptions block 992-1027). **The 5 blog pages' titles/descriptions are NOT in DICT** → in EN mode they stay Spanish.
- **Trap for the Miami port**: the EN *keys* for the service/prices titles are legacy short titles, not SEO titles — e.g. prices title key `"SERRES — Prices"`, ppf `"SERRES — Paint Protection Film (PPF)"`, vinyl `"SERRES — Car Wrap / Vinyl"`, ceramic `"SERRES — Ceramic Coating"`, paint-correction `"SERRES — Paint Correction"`, detailing `"SERRES — Detailing"`, body-kits `"SERRES — Body Kits"`; and EN meta-description keys are the legacy 2025 marketing blurbs (992-1013). One of them carries a claim the Spanish SEO package deliberately removed: `"SERRES Ceramic Coating — a liquid-glass SiO₂ layer…"` (`assets/serres-i18n.js:1000`; Spanish ban regex `/cristal líquido/` in `_build/verify-seo.js:23` is Spanish-only so it would not catch the EN text). **Do not promote these keys to inline EN base text unchanged** — write new EN SEO titles/descriptions inline and make the DICT keys match them byte-for-byte.
- Geo/price load inside DICT (entries, not lines): Barcelona 49 (40 in EN keys) · Sant Cugat 32 · Vallès 24 · 08174 1 · +34 6 · Spain/España 1 (`:97`) · Collserola etc. 3 (`:121-123`) · `€` 21 (16 in EN keys) · VAT/IVA 11 · EUR 1.
- ATTRS translated: `aria-label`, `title` (1229) — includes the Maps iframe title (`:965`) and `aria-label="Llamar a SERRES"` etc. Nodes inside `[data-i18n-skip]` and `SCRIPT/STYLE/TEXTAREA` are skipped (1230-1242). Switcher mounted into `header .nav-right` and `.srs-menu-foot` (1425-1436), buttons carry `data-lang` (1400).
- `assets/serres-enhance.js` is the loader (`loadI18n()` 285-291, id `srs-i18n-script`, path `base + 'assets/serres-i18n.js'`, base `../` when path matches `/(services|pages|blog)/` — 22-24). It also hard-codes NAP: `WA_DIGITS "34621244469"` (14), Spanish WA_TEXT (15), `IG_URL` (17), `TEL_TEXT "+34 621 24 44 69"` (19), menu contact "Sant Cugat del Vallès, Barcelona" (164), and English MENU labels (29-37) translated by DICT.

## 8. `_build/` tooling — what it does, what it needs, what the port must change

Environment (verified): **Node v26.3.0, npm 11.16.0**. **`_build/node_modules/` is ABSENT** (git-ignored: `.gitignore:15-16`); `require.resolve` from `_build` fails for `sharp`, `jsdom`, `cheerio`, `playwright`. Global npm has only `@shopify/cli`, `skillui`, `ui-ux-pro-max-cli`. A real Python 3.12 exists at `C:/Users/Rickfelder/AppData/Local/Programs/Python/Python312/python` (not the Store stub) — but house rule is Node. `_build` size: `agg-report.json` 102 KB, `webp-manifest.json` 6.8 KB, 5 scripts.

### `_build/package.json` (16 lines)
`"type":"commonjs"`, no scripts, single dependency **`sharp ^0.35.3`** (14). Nothing else is declared — `verify-seo.js` and `dict-tools.js` are dependency-free (`fs`, `path` only). **No jsdom/cheerio anywhere**: the PASO-1 "orphan strings" DOM walker must be written without a DOM library (regex/tokenizer over HTML, or run the scan inside the real browser via Chrome DevTools MCP `evaluate_script` reusing the `walk()`/`enKeyOf()` logic and dump the result), or add a dependency — which the brief forbids ("sin deps nuevas").

### `_build/verify-seo.js` (84 lines) — exact checks, in order, per page
- `PAGES` (11-19): the 16 pages, **with the 4 Spanish blog slugs hard-coded (17-18)** → update.
- `BANNED` (21-24): Spanish-only regexes `/10 años/i, /200 ?micras/i, /200 ?µm/i, /\b9H\b/, /subcontrat/i, /cristal líquido/i, /\b1080\b/, /medidor de brillo/i, /medidor de espesor/i` — whole-file scan (56). For an EN base, add English equivalents (`10 years`, `200 micron`, `9H`, `subcontract`, `liquid[- ]glass`, `1080`, `gloss meter`, `thickness gauge`) or the check is meaningless.
- Per page: `MISSING` if file absent (30); substring presence of `og:title, og:description, og:image, og:url, og:type, twitter:card` (34-36); `rel="canonical"` (37); ≥1 `<script type="application/ld+json">` and each must `JSON.parse` (40-42); **`googletagmanager.com/gtag/js?id=G-1K6FYZ99GN` must occur exactly once (45-47) — the ID is hard-coded: with the Miami GA4 ID every page will FAIL `gtag head x0` until line 45 is changed**; `whatsapp_click` exactly once (46-49); `<h1[\s>]` exactly once (52-53); local `src|href` refs must exist on disk (59-68), regex `(?:src|href)="([^"#{}]+?)"` (60) ignoring `https?:|#|tel:|mailto:|data:|javascript:`; every `FAQPage` `mainEntity[].name` and `.acceptedAnswer.text` must appear verbatim in the HTML (70-78) → EN FAQ JSON-LD must match EN inline text byte-for-byte.
- **Always `process.exit(0)` (84)** — never fails by exit code; read stdout.
- Current run (executed, read-only): 15 OK, **1 FAIL `pages/prices.html — broken ref '+WA+msg+'`**. Cause: `pages/prices.html:534` contains the JS template fragment `href="'+WA+msg+'"` (WA = `'https://wa.me/34621244469?text='` at `:463`, `msg` built at `:525`); the regex captures `'+WA+msg+'`, which is not `https?:` so it is resolved as a relative path and reported broken. It is a false positive: the actual rendered href is a wa.me URL. Options for Miami: keep as documented known-FAIL; or harden `verify-seo.js:60` to `[^"#{}']` (excludes JS string fragments); or rewrite `:534` to not contain the literal `href="` sequence. Any of these keeps the "1 known FAIL" from masking real breakage.

### `_build/dict-tools.js` (109 lines)
- Reads `assets/serres-i18n.js` (10), extracts the `var DICT = {…}` literal by brace matching (14-25) and evaluates it with `new Function` (23) — so DICT must stay a plain object literal (no computed keys, no trailing code inside).
- `check` (35-45): reports ES/CA value collisions across entries (13 today). `lookup "<text>"` (46-52): matches key, ES or CA value. `merge <entries.json>` (53-106): **writes** to `serres-i18n.js` — applies `dict_changed` by string replacement of the JSON-escaped old ES value (64-73), appends `dict_new` lines formatted `"en": ["es", "ca"],` (93) after the closing brace with a fixed header comment `SEO package 2026-07-09` (102).
- **Assumes 2-element `[es, ca]` arrays everywhere** (`v[0]`, `v[1]` at 39, 50, 68, 79, 93-95). If the Miami DICT drops the CA column (brief: "podar el segundo elemento de cada par") the tool must be adapted to 1-element arrays or string values; `merge` output format (93) also changes.

### Other `_build` files
- `optimize-images.js` (133 lines): `require('./node_modules/sharp')` (10) → fails until `npm install` in `_build` (network; sharp downloads a prebuilt binary). CONVERT list (18-49), OG map (51-63, sources are Barcelona project photos), BLOG slug→source map (65-70). Writes next to originals and `webp-manifest.json` (131). Not needed unless assets are regenerated.
- `optimize-porsche-gallery.js` (37 lines): `require('C:/Users/Rickfelder/Desktop/serres wrap center app/node_modules/sharp')` (5) — that sibling path **exists** on this machine; reads `uploads/` (excluded from port) → irrelevant for Miami; safe to drop.
- `fetch-fonts.mjs` (86 lines): ESM, network fetch of Google Fonts CSS (15-16) → regenerates `assets/fonts/*.woff2` + `assets/fonts.css`. Output already committed (26 woff2 files); no need to run. Note `package.json` is `commonjs` but this file is `.mjs`, fine.
- `webp-manifest.json`: generated; contains the 4 ES slugs (262-286); no domain.
- **`agg-report.json`** (102 KB): historical orchestration report of the 2026-07-09 SEO package; contains **4 `serreswrapcenter.es`, 118 `Barcelona`, 85 `Sant Cugat`, 18 `+34`, 50 `€`**, and is referenced by no script. If copied into the Miami tree it alone breaks the acceptance grep (`Barcelona = 0`). Recommend excluding it (or the whole `_build/*.json` pair) in PASO 0 — it is not in the brief's exclusion list.

## 9. NAP / analytics / review surface to strip (consolidated pointers)

- **JSON-LD business blocks with full Barcelona PostalAddress** (12 blocks): `index.html:623-629`; `pages/why-serres.html:243-249`; `pages/prices.html:249`; `pages/projects.html:220`; `services/ppf.html:313-320`; `services/vinyl.html:358-365`; `services/ceramic.html:252-258`; `services/paint-correction.html:318-325`; `services/detailing.html:584-591`; `services/body-kits.html:279-286`; blog ×4 (`vinilar:65-72`, `ppf-o-ceramico:68-75`, `cuanto-cuesta-ppf:60-67`, `limpieza:65-72`). `pages/gallery.html` and `blog/index.html` have no address. Street spelled two ways: "Av. Can Fatjó dels Aurons, 15" vs "…Aurons 15" (vinyl 361, detailing 587, body-kits 282).
- **Opening hours** (Mon-Fri 09-19, Sat 10-14): `index.html:631-643`, `pages/why-serres.html:251-263`, `pages/prices.html:250-252`; visible text `index.html:828, 674` (FAQ) and "Lun–Sáb · Con cita previa" `index.html:847`.
- **areaServed**: `City` Sant Cugat + Barcelona in the 6 services (ppf 322-325, vinyl 367-370, ceramic 260-263, paint-correction 333-336, detailing 593-596, body-kits 294-297); string "Barcelona" in prices 245 and projects 216.
- **AggregateRating 4.9/50**: why-serres 268-272, paint-correction 326-331, body-kits 287-292. Related visible stat claims not covered by the brief but Barcelona-derived: `pages/why-serres.html:336-337, 396-397` ("50+ Coches transformados", "4.9 Valoración media") and the "98% de clientes que nos recomiendan" claim in its title/meta/og/twitter descriptions (`:7,13,20`) and DICT (`assets/serres-i18n.js:1019-1021`).
- **TESTIMONIALS[]**: `pages/why-serres.html:442-453` — 5 reviewers (Marc Vidal, Marcos Catlano, Daniel Roca, Aleix Soler, Núria Camps), EN quotes rendered by `paint()` (466-475) into `#rvStack`, translated via `T()` (463); their ES/CA strings live in DICT and become dead entries when removed.
- **GA4**: `<script async src=…G-1K6FYZ99GN>` + config on every page (index 681/686, gallery 274/279, prices 267/272, projects 229/234, why-serres 296/301, ppf 440/445, vinyl 471/476, ceramic 358/363, paint-correction 437/442, detailing 294/299, body-kits 410/415, blog/index 52/57, vinilar 141/146, ppf-o-ceramico 41/46, cuanto-cuesta-ppf 121/126, limpieza 141/146) + `_build/verify-seo.js:45`.
- **Spain-specific content flagged by the brief**: DGT/ITV only in `blog/cuanto-cuesta-vinilar-un-coche.html` (FAQ JSON-LD 115-118 and visible 354-356); "España" in vinilar ×7 (headline 45, h1 180, 227, 234 table header "Mercado en España", 289), cuanto-cuesta-ppf ×4 (FAQ 95 "En España, entre 900 € y 1.700 €…"), ppf-o-ceramico ×1, limpieza ×1, `index.html:885` footer "Barcelona, España", `assets/serres-i18n.js:97`.
- **Barcelona-provenance captions that will fail the `Barcelona = 0` gate but describe real photos**: `pages/gallery.html:306,308,309,383` (M2 "azotea de Barcelona con la torre de Collserola") + DICT `:111-113, :121-123`; `index.html:940` loads `assets/gclass/frame_*.jpg` (G-Class scroll sequence, 5 MB; `assets/urus/` 5 MB appears unreferenced). Decide: rewrite captions neutrally or grant an exception.

## 10. Risks / surprises (ranked)

1. **`_build/verify-seo.js:45` hard-codes `G-1K6FYZ99GN`** — after the GA4 swap all 16 pages FAIL until the verifier is updated; `PAGES` also hard-codes the ES slugs (17-18). `BANNED` list is Spanish-only.
2. **`_build/agg-report.json` (and `webp-manifest.json`) are not in the brief's exclusion list** but carry Barcelona/domain/€ strings → acceptance greps fail unless excluded or exempted.
3. **Root-relative asset links on every page** (`/favicon*`, `/apple-touch-icon.png`, `/assets/fonts.css`, 2 font preloads) break on a GitHub Pages *project* site without a custom domain.
4. **EN dictionary keys are legacy titles/descriptions, not SEO copy**; one carries the banned "liquid-glass" claim (`assets/serres-i18n.js:1000`). Inline EN must be authored fresh, then keys aligned byte-for-byte; blog titles/descriptions have no DICT entries at all.
5. **No DOM library available and none may be added** — the orphan-string scanner needs a hand-rolled HTML text tokenizer or an in-browser run via DevTools MCP.
6. **`dict-tools.js` assumes `[es, ca]` pairs** — pruning CA silently changes what `check`/`merge` do.
7. **`pages/prices.html:322`**: one ~8 KB pre-rendered line with Spanish tiers, EUR prices and 3 wa.me links — easy to miss in a line-based diff; the JS re-renders it on load but the static fallback must match the EN base too.
8. **Brief grep targets that return 0 as written**: `maps/search?query=` (actual `maps/search/?api=1&query=` at `index.html:892`), `2.0634` (actual `2.0633841973199507`), `Valles` without accent (all instances are `Vallès`). The acceptance grep must use `Vall[eè]s`.
9. **`<html lang>` is overwritten at runtime by i18n** (`assets/serres-i18n.js:1338`) — the static `lang="en"` check passes on the file, but a visitor with a stored `serres-lang=es` from the Barcelona site on the same origin… different origin, so no carry-over; still, default in `getLang()` (1196) must be `"en"`.
10. Inconsistencies worth normalising while every block is touched: provider `@type` (5 variants), `priceRange` (€€ vs €€€), breadcrumb item-2 URL (`/#services` vs `/index.html#services`), `inLanguage` (`es` vs `es-ES`), street spelling (comma vs none), JSON-LD placement (detailing's FAQPage/Service after the enhance script `:514-644`; ppf-o-ceramico GA4 before JSON-LD `:41`, enhance after tracker `:446`).
11. `favicon-512.png` is an orphan (no manifest); `assets/urus/` (5 MB) appears unreferenced; `assets/svc/` is 21 MB and `serres-hero.mp4` 10 MB — fine for GitHub Pages limits but worth knowing for repo size (~81 MB in-scope tree).
12. Instagram account and photo provenance are shared-brand decisions the brief does not settle — "confirm with client".
