# INVENTORY — `index.html` (Spanish home page)

**Absolute path:** `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12\index.html`
**Total lines:** 1039. `<!DOCTYPE html>` L1, `<html lang="es">` L2, `<head>` L3–689, `<body>` L690–1038.
**Structure:** single-file page — ALL CSS inline in `<style>` L30–611 (582 lines), all page JS inline at L909–1036 + one external `assets/serres-enhance.js` (L1019). No build step, no framework, no CSS file of its own.

---

## 1. `<head>` (L3–689)

### Meta / SEO
| Line | Item | Value |
|---|---|---|
| L2 | `lang` | `es` |
| L4 | charset | UTF-8 |
| L5 | viewport | `width=device-width, initial-scale=1.0` |
| **L6** | `<title>` | `PPF, Car Wrap y Detailing en Barcelona \| SERRES` |
| **L7** | `meta description` | `Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp.` |
| **L8** | `canonical` | `https://serreswrapcenter.es/` |
| L9 | `og:type` | `website` |
| L10 | `og:site_name` | `SERRES Wrap Center` |
| L11 | `og:locale` | `es_ES` |
| L12 | `og:title` | same as `<title>` |
| L13 | `og:description` | same as meta description |
| L14 | `og:url` | `https://serreswrapcenter.es/` |
| L15 | `og:image` | `https://serreswrapcenter.es/assets/og/home.jpg` |
| L16–17 | `og:image:width/height` | 1200 / 630 |
| L18 | `twitter:card` | `summary_large_image` |
| L19 | `twitter:title` | same as `<title>` |
| L20 | `twitter:description` | same as meta description |
| L21 | `twitter:image` | `https://serreswrapcenter.es/assets/og/home.jpg` |
| L22–25 | icons | `/favicon.ico`, `/favicon-32.png`, `/favicon-16.png`, `/apple-touch-icon.png` (all root-absolute) |
| L26 | `theme-color` | `#0a0a0b` |
| L27–28 | font preloads | `/assets/fonts/barlow-condensed-700-normal-latin.woff2`, `/assets/fonts/dm-sans-400-normal-latin.woff2` |
| L29 | stylesheet | `/assets/fonts.css` (self-hosted fonts) |
| L688 | stylesheet | `/assets/serres-logo.css` |

**Absent from head:** no `hreflang` links, no `robots` meta, no `preconnect`, no Organization/BreadcrumbList/Service schema, no `og:image:alt`.

### JSON-LD block #1 — L612–646
```
@type: AutoBodyShop
name: "SERRES Wrap Center"                        L616
url: "https://serreswrapcenter.es"                L617
telephone: "+34649663380"                         L618
image: "https://serreswrapcenter.es/apple-touch-icon.png"  L619
priceRange: "€€€"                                 L620
description: "Taller de PPF, Car Wrap, Ceramic Coating, pulido por etapas, detailing y body kits en Sant Cugat del Vallès (Barcelona). Films de varias marcas profesionales y trabajo con cita previa."  L621
hasMap: "https://maps.google.com/?cid=14481261717501919901"  L622
address (PostalAddress) L623–630:
  streetAddress "Av. Can Fatjó dels Aurons, 15"   L625
  postalCode "08174"                              L626
  addressLocality "Sant Cugat del Vallès"         L627
  addressRegion "Barcelona"                       L628
  addressCountry "ES"                             L629
openingHoursSpecification L631–644:
  Mon–Fri 09:00–19:00                             L634–636
  Saturday 10:00–14:00                            L640–642
sameAs: ["https://www.instagram.com/serres.wrap.center/"]  L645
```

### JSON-LD block #2 — L648–678
```
@type: FAQPage, 3 Questions (mainEntity L652–677) — mirrors the visible FAQ at L818–831 verbatim:
 Q1 L655 "¿Cuánto cuesta instalar PPF en Barcelona?"
    A L658: "El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp…"
 Q2 L663 "¿Cuánto tarda un Car Wrap completo?"
    A L666: multi-day, desmontamos piezas, panel a panel…
 Q3 L671 "¿Dónde está el taller de SERRES?"
    A L674: "Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona)… lunes a viernes 09:00–19:00 y sábados 10:00–14:00."
```

### Analytics — L680–687
GA4 gtag.js, **measurement ID `G-1K6FYZ99GN`** (L681, L686). Must be swapped for the US property.

---

## 2. Body sections in DOM order

### S1 — HEADER / NAV · L692–708
- `<header class="nav" id="nav">`, fixed, transparent → `.scrolled` glass at scrollY>40 (JS L910–913; CSS L91–100).
- **Logo (L694):** `<img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55">` inside `<a href="#top">`.
- **Nav links (L695–703):** `Servicios` → `#services`; `Proyectos` → `pages/gallery.html`; `Exclusivo` → `pages/projects.html` (wrapped in `<span class="gold-text">`, gold gradient CSS L309–320); `Precios` → `pages/prices.html`; `Blog` → `blog/index.html`; `Por qué SERRES` → `pages/why-serres.html`; `Contacto` → `#contact`.
- **CTA button (L705):** `Pedir presupuesto →` → `#contact` (chrome-gradient `.btn`, clip-path notch, CSS L123–140).
- Nav links hidden ≤1200px (L586) / ≤760px (L595); desktop CTA hidden ≤760px (L596). The mobile burger + overlay menu is **injected by `assets/serres-enhance.js`**, not present in this HTML.
- No content, cards, prices, claims.

### S2 — HERO · L711–733 (`#top`, `data-screen-label="Hero"`)
- **Video (L712–714):** `<video autoplay muted loop playsinline preload="metadata" poster="assets/serres-poster.jpg">` + `<source src="assets/serres-hero.mp4" type="video/mp4">`. **`assets/serres-hero.mp4` is 10,001,356 bytes (~10 MB).** Poster `assets/serres-poster.jpg` (~122 KB).
- Gradient overlay div L715 (CSS L149–154, ends on `#14151b` to hand off to next section).
- **Eyebrow (L718):** `Detailing y personalización premium`
- **H1 (L719–723)**, three `.ln` lines with staggered rise animation (CSS L156–170):
  - L720 `Eleva`
  - L721 `tu sueño` (`.chrome-text` metallic gradient)
  - L722 `<span class="h1-kw">PPF, Car Wrap y Detailing en Barcelona</span>` — **an SEO keyword line rendered small (11.5–17px) inside the H1**
- **Sub (L724):** `PPF, Car Wrap a medida y detailing de nivel concours en Barcelona (Sant Cugat del Vallès), pensados para los coches alrededor de los que construyes tu vida. Un taller. Estándares obsesivos.`
- **Actions (L725–728):** `Pedir presupuesto →` → `#contact` (ghost); `Ver servicios` → `#services` (ghost).
- **Scroll cue (L731):** `Desliza` + animated bar. **Hero meta (L732):** `PPF · Car Wrap · Corrección de pintura` / `Estudio de detailing`. Both hidden ≤760px (L599).
- Height `100svh`, min 640px (L143). No cards/stats/prices.

### S3 — SERVICE NAVIGATOR · L736–790 (`#services`, `data-screen-label="Services"`)
- Section bg = 6-stop gradient bridging hero→black studio (CSS L206–213); padding 110/120px.
- **Head (L738–744):** eyebrow `Nuestros servicios` (L740); **H2 (L741, chrome-text):** `Elige por dónde empezar.`; note (L743): `Seis especialidades, un mismo estándar. Toca un servicio para ver el proceso, los materiales y los precios.`
- **Grid:** `<nav class="svcnav-grid" aria-label="Servicios SERRES">` (L745) — **3 columns desktop / 2 at ≤1024px and ≤760px** (CSS L221–223, 287, 292). NOT a uniform 3-card row: 6 tiles.
- **Six `.svc-door` tiles**, each = number + hover-reveal background photo + name + subtitle + animated bottom line + arrow SVG:

| Tile | Lines | href | Image (`.sd-img`) | Name | Subtitle |
|---|---|---|---|---|---|
| 01 | L746–752 | `services/ppf.html` | `assets/svc/ppf-tile.jpg` (L747) | PPF | Protección invisible |
| 02 | L753–759 | `services/vinyl.html` | `assets/gallery/xm-grille-s.jpg` (L754) | Car Wrap *(`data-i18n-skip`)* | Cambio de color |
| 03 | L760–766 | `services/ceramic.html` | `assets/gallery/supra-villa-s.jpg` (L761) | Ceramic Coating *(skip)* | Sellado y brillo |
| 04 | L767–773 | `services/paint-correction.html` | `assets/gallery/e92-coast-s.jpg` (L768) | Corrección de pintura | Pulido por etapas |
| 05 | L774–780 | `services/detailing.html` | `assets/gallery/xm-headliner-s.jpg` (L775) | Detailing *(skip)* | Interior y exterior |
| 06 | L781–787 | `services/body-kits.html` | `assets/gallery/rwb-profile-s.jpg` (L782) | Body Kits *(skip)* | Aero y stance |

- All `.sd-img` are `alt="" aria-hidden="true" loading="lazy" decoding="async"`, opacity 0 → 1 on hover; on touch (≤760px) they sit at opacity .34 permanently (L298–299).
- No prices, no claims in this section.

### S4 — REVEAL / SCROLL TRANSFORMATION · L793–809 (`#transformacion`, `data-screen-label="Transformation"`)
- `.reveal` = **`height:200vh`, black**, with `.reveal-stage` `position:sticky;top:0;height:100svh` (CSS L326–327). Two decorative layers: top gradient melt L330–340, radial "studio pool" `mix-blend-mode:screen` L344–353.
- **`<canvas id="urus-canvas">` (L795)** — scroll-driven **72-frame JPEG sequence**, driven by inline JS **L916–1017**: `N=72` (L919), sources `assets/gclass/frame_00.jpg` … `frame_71.jpg` (L941, zero-padded, L929). Directory `assets/gclass/` confirmed to hold 72 files. Mobile "lite" mode ≤760px loads only even frames + last (L935–939). Progress bar `#reveal-fill` (L806/L1004), hint fades out after 1.5 % scroll (L1005).
- **Head overlay (L797–801):** eyebrow `La transformación SERRES` (L798); **H2 (L799):** `Hacemos realidad tu <span class="chrome-text">coche soñado</span>` + `<span data-en=" a reality"></span>` ← i18n hook, empty in ES.
- **Pill nav (L800):** 6 rounded-pill links — `PPF` · `CAR WRAP` · `Ceramic Coating` · `Corrección de pintura` · `Detailing` · `Body Kits` → the six `services/*.html`.
- **Hint (L803):** `Desliza para transformar`. **Footer track (L805–807):** progress line.
- No prices, no claims, no text content beyond the above.

### S5 — LOCAL SEO + FAQ · L812–833 (`#taller-barcelona`, `data-screen-label="Taller"`)
- Narrow text column (`.home-seo .wrap{max-width:900px}` L464), gradient black→`#0e0e10` (L462).
- Eyebrow L814 `Taller en Barcelona`; **H2 L815:** `PPF, Car Wrap y detailing en Barcelona`.
- **Paragraph 1 (L816):** *"SERRES es un taller de PPF, Car Wrap y detailing en Sant Cugat del Vallès, a pocos minutos de Barcelona. Trabajamos con films de varias marcas profesionales: PPF con más de 50 colores y vinilos 3M, Avery Dennison e Inozetek con más de 150 colores para el cambio de color."*
- **Paragraph 2 (L817):** *"Cada proyecto se trabaja con cita previa y se revisa panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite antes de la entrega. Completamos la gama con Ceramic Coating, pulido por etapas, detailing y body kits, con precios orientativos publicados e IVA incluido."*
- **FAQ (L818–831):** native `<details>/<summary>` accordion, 3 items, "+"→"×" rotate marker (CSS L471–489). Text identical to the FAQPage JSON-LD:
  - L820 summary / L821 answer — **contains the only visible prices on the page**
  - L824 / L825
  - L828 / L829 — address + opening hours

### S6 — CTA / CONTACT · L836–864 (`#contact`, `data-screen-label="Contact"`)
- Two-column grid `1.04fr 1fr` (CSS L511), collapses to 1 col ≤880px (L547).
- **Left (L839–856):** eyebrow `Reserva tu proyecto` (L840); **H2 (L841):** `Tráenos el coche.` / `Lo redefiniremos.` (chrome-text).
  - **Actions (L842–845):** `Pedir presupuesto →` → `#contact` (self-link, dead anchor); `Llamar al taller` → `tel:+34649663380`.
  - **Meta rows (L846–850):** `Taller` → `Sant Cugat del Vallès, Barcelona`; `Horario` → `Lun–Sáb · Con cita previa`; `Teléfono` → `+34 649 66 33 80` (tel link L849).
  - **Social (L851–855):** label `Síguenos y escríbenos`; Instagram `https://www.instagram.com/serres.wrap.center/` (L853, inline SVG); WhatsApp `https://wa.me/34649663380?text=Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche.` (L854, inline SVG, hover turns `#25d366`).
- **Right (L857–861):** Google Maps `<iframe>` (L859) `title="SERRES Wrap Center en Google Maps"`, embed pb string pinned to **lat 41.49532, lng 2.06338**, place id `0x2027f0d4ea2a70f1:0xc8f7c6ce9b2a429d`, `hl=es`, `loading="lazy"`; frame 470px tall with clip-path notch (L532–534).
- **No contact form exists anywhere on this page** — all conversion is tel / WhatsApp / anchor.

### S7 — FOOTER · L867–903
- L871 logo `<img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55">`; L872 tagline `Protección de pintura, Car Wrap a medida y detailing de nivel concours.`
- **Col "Servicios" (L875–883):** `Paint Protection Film`, `Car Wrap`, `Ceramic Coating`, `Corrección de pintura`, `Detailing`, `Body Kits` → the six `services/*.html`.
- **Col "Taller" (L884–888):** `Sant Cugat del Vallès` / `Barcelona, España`; `+34 649 66 33 80` (tel).
- **Col "Síguenos" (L889–895):** Instagram, WhatsApp (same URLs), Google Maps search link `…query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s` (L893), Blog.
- **Foot-bottom (L898–901):** `© 2026 SERRES. Todos los derechos reservados.` (L899) and `PPF · Car Wrap · Detailing · Corrección de pintura · Body Kits` (L900).
- No legal pages linked (no privacy/cookies/aviso legal).

### S8 — STICKY MOBILE CALL FAB · L905–907
`<a href="tel:+34649663380" class="mobile-call" aria-label="Llamar a SERRES">` + phone SVG. `display:none` until ≤760px (CSS L571–577, L600).

### S9 — SCRIPTS · L909–1036
- L909–914 nav scroll-state.
- L916–1017 the 72-frame canvas sequence (see S4).
- **L1019 `<script src="assets/serres-enhance.js" defer>`** — injects: burger + full-screen mobile menu (menu labels authored in **English** as i18n keys), floating WhatsApp button, stat count-up animation, **loads `assets/serres-i18n.js`** (an EN/ES/CA segmented language switcher, 162 KB), external-link opener for framed contexts, and a hero-video data-saver guard that strips `<source>` on save-data/2G-3G.
- L1021–1035 GA4 event delegation: fires `whatsapp_click` and `phone_click` with `link_url` + `page_path`.

---

## 3. FACTUAL CLAIMS — every one, with line number

| Line | Claim | Type |
|---|---|---|
| L618 | telephone `+34649663380` | contact fact |
| **L620** | `priceRange: "€€€"` | price claim (schema) |
| L621 | "Films de varias marcas profesionales… trabajo con cita previa" (schema desc) | capability claim |
| L622 | Google Maps CID `14481261717501919901` | business identity |
| L625–629 | Address: Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del Vallès · Barcelona · ES | location fact |
| **L634–642** | Hours: Mon–Fri 09:00–19:00, Sat 10:00–14:00 | operating fact |
| L645 | `sameAs` Instagram `serres.wrap.center` | identity |
| **L658** | **"El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido"** (schema FAQ) | **price + warranty claim** |
| L666 | "Un cambio de color completo requiere varios días de taller… desmontamos piezas" (schema FAQ) | process/turnaround claim |
| L674 | address + hours repeated (schema FAQ) | location/operating fact |
| L722 | H1 keyword line "PPF, Car Wrap y Detailing en Barcelona" | geo claim |
| L724 | "detailing de nivel concours… Un taller. Estándares obsesivos." | quality claim |
| L743 | "Seis especialidades, un mismo estándar." | scope claim |
| **L816** | **"films de varias marcas profesionales: PPF con más de 50 colores y vinilos 3M, Avery Dennison e Inozetek con más de 150 colores"** | **brand-name + numeric inventory claim (3M / Avery Dennison / Inozetek, >50, >150)** |
| L816 | "a pocos minutos de Barcelona" | geo claim |
| **L817** | "se revisa panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite antes de la entrega" | **process + guarantee claim** |
| L817 | "precios orientativos publicados e IVA incluido" | pricing-policy claim |
| **L821** | **"parte de 890 € … 2.390 € … 3 años de garantía del film e IVA incluido"** (visible FAQ) | **only visible price + warranty on the page** |
| L825 | "varios días de taller" | turnaround claim |
| L829 | address + "cita previa" + hours (visible FAQ) | location/operating fact |
| L847 | "Sant Cugat del Vallès, Barcelona" | location |
| L848 | "Lun–Sáb · Con cita previa" | operating |
| L849 | "+34 649 66 33 80" | contact |
| L853–854 | Instagram handle + WhatsApp number | contact |
| L859 | Map embed coordinates 41.49532 / 2.06338 + place id | location |
| L872 | "detailing de nivel concours" | quality claim |
| L886–887 | "Sant Cugat del Vallès / Barcelona, España" + phone | location/contact |
| L899 | "© 2026 SERRES" | legal |

**Claims that do NOT exist on this page (relevant gaps vs a US spec):** no years in business, no cars-completed count, no Google rating or review count, no testimonials/reviews block, no certifications/installer badges (XPEL/STEK/3M-certified etc.), no awards, no team/about block, no stats counters (the count-up code in `serres-enhance.js` finds nothing here), no gallery/before-after block, no pricing table, no contact form, no service-area list, no financing/insurance mentions.

---

## 4. Port-critical notes (ES→US)

1. **Currency & prices:** only two figures appear on the home page — `890 €` and `2.390 €`, both at **L821** (visible FAQ) and **L658** (JSON-LD FAQ). They must be changed in both places or the structured data will contradict the page. `priceRange "€€€"` at **L620**.
2. **Locale-bound strings to retarget:** `lang="es"` L2; title L6; desc L7; canonical L8; `og:locale` L11 (`es_ES`); OG/Twitter L12–21; JSON-LD address L623–630 + phone L618 + hasMap L622 + hours L631–644; map iframe `hl=es`/`&5e0…!2ses` L859; all `tel:+34649663380` at L844, L849, L887, L905; `wa.me/34649663380?text=Hola%20SERRES…` at L854, L892 (plus the same constants hardcoded in `assets/serres-enhance.js` L14–19: `WA_DIGITS`, `WA_TEXT`, `TEL_TEXT`); Google Maps search link L893; "Barcelona"/"Sant Cugat del Vallès" at L7, L13, L20, L621, L627, L674, L722, L724, L815, L816, L829, L847, L886; "IVA incluido" L658, L817, L821; `© 2026` L899.
3. **GA4 ID `G-1K6FYZ99GN`** hardcoded at L681 and L686.
4. **An English version of nearly every home-page string already exists** in `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12\assets\serres-i18n.js` — the dictionary is authored **English-first** (`"English source": ["español","català"]`). Home-page block is **L56–104** of that file, e.g. L61–62 `"Elevate"`/`"your dream"`, L63 the full hero sub, L68 `"Choose where to begin."`, L69 the services note, L72–76 the six tile subtitles, L77–78 `"We make your"`/`"dream car"`, L84 `"Scroll to transform"`, L85–87 the CTA headline, L88–92 contact labels, L93 the footer tagline, L99–104. For an English-only US launch these become the DOM text and the whole i18n layer (`serres-i18n.js` + the switcher injection at `serres-enhance.js` L281–291) should be dropped; the `data-en=" a reality"` hook at **L799** and the eight `data-i18n-skip` attributes (L756, L763, L777, L784, L800, L878, L879, L881) become dead and must be reconciled with the L799 heading split.
5. **Heavy assets:** `assets/serres-hero.mp4` ~10 MB (L713), 72 JPEGs in `assets/gclass/` (L941), 76 files in `assets/gallery/`. The reveal section is 200vh of scroll for one animation.
6. **Dead CSS shipped inline** (styles with no matching DOM in this page): `.svc` / `.svc-inner` / `.svc-more` scroll sections **L419–457**, `.cards` (L601), `.group`/`.group-label` (L589–590), `.map-card` **L535–545**, `.cta .phone` L504–508, `.reveal-labels` L409–413, `.hero .poster` L148, `.services` L602. Safe to prune or reuse on the US build.
7. **Design tokens to preserve** (`:root` L31–45): `--bg:#0a0a0b`, `--bg-2:#0e0e10`, `--panel:#141417`, `--panel-2:#191920`, `--line`/`--line-strong` white alphas, `--text:#f3f3f5`, `--muted:#9a9aa3`, `--muted-2:#6e6e77`, `--chrome` (5-stop metallic gradient), `--chrome-line`, `--maxw:1280px`, `--ease:cubic-bezier(.22,.61,.36,1)`. Type: **Barlow Condensed 700** (display/UI, condensed uppercase, letterspaced) + **DM Sans 400** (body, 17px/1.6), self-hosted via `/assets/fonts.css`. Signature devices: chrome-gradient text clip, `clip-path:polygon(…)` notched corners on buttons/tiles/map, gold gradient for "Exclusivo" (L310–319), long multi-stop section gradients (never a hard cut), `prefers-reduced-motion` blocks at L305, L321, L417, L493, L606.