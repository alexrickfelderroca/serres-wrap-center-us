SRC = `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`

# 0. SITE-WIDE ANSWERS (asked explicitly)

**Contact page:** none. There is NO `contact.html` anywhere. Contact is a section on the home page only: `SRC\index.html` lines **836–864**, `<section class="cta" id="contact">`. Every page's nav/CTA links to `../index.html#contact`.

**Forms:** **ZERO.** `grep -rn "<form\|<input\|<textarea\|<select\|type=\"submit\""` across all `*.html` (excluding `.screenshots/`, `scraps/`, `frames/`) returns **no matches**. The entire site is form-free; all conversion runs through `wa.me` deep links + `tel:` links.

**Map embed:** exactly **one**, `SRC\index.html` line **859** — Google Maps `embed?pb=` iframe inside `<div class="contact-map"><div class="map-frame">` (lines 857–861), `allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"`, place `Serres Wrap Center`, coords `2.0633841973199507 / 41.49532481891128`, locale `!5e0!3m2!1ses!2ses`. Plus a plain Maps *link* at `index.html:893`. The other two `<iframe>` hits (`SRC\PPF - Phone.html:59`, `SRC\SERRES - Phone.html:47`) are local phone-mockup harnesses, not site pages.

**Global page inventory** (`SRC\sitemap.xml`, 16 URLs): `/`, 6 × `services/*.html` (ppf, vinyl, ceramic, paint-correction, detailing, body-kits), 4 × `pages/*.html` (prices 0.8, why-serres 0.7, gallery 0.7, projects 0.6), `blog/index.html` 0.7, 4 × blog posts 0.6. All `lastmod 2026-07-09`. `robots.txt` = `Allow: /` + sitemap ref.

**Shared chrome on all 5 target pages** (identical, per-page inlined):
- `<html lang="es">`; favicon block (`/favicon.ico`, `/favicon-32.png`, `/favicon-16.png`, `/apple-touch-icon.png`), `<meta name="theme-color" content="#0a0a0b">`
- 2 font preloads: `/assets/fonts/barlow-condensed-700-normal-latin.woff2`, `/assets/fonts/dm-sans-400-normal-latin.woff2`; `<link rel="stylesheet" href="/assets/fonts.css">`
- Fonts: **Barlow Condensed** (display, fallback `Bahnschrift`/`Arial Narrow`) + **DM Sans** (body). Body 17px/1.6.
- Identical `:root` tokens on every page: `--bg:#0a0a0b; --bg-2:#0e0e10; --panel:#141417; --panel-2:#191920; --line:rgba(255,255,255,0.09); --line-strong:rgba(255,255,255,0.16); --text:#f3f3f5; --muted:#9a9aa3; --muted-2:#6e6e77; --chrome:linear-gradient(176deg,#fdfdfe 0%,#cfcfd6 32%,#8d8d97 52%,#f0f0f4 72%,#a6a6b0 100%); --ease:cubic-bezier(.22,.61,.36,1); --maxw:1280px` (+ `--navh:62px` on gallery). Gold variant `--gold` gradient inline on prices/projects (`.gold-text`, `linear-gradient(105deg,#8a6d2f…#b28f41)`).
- GA4 `gtag.js` id **`G-1K6FYZ99GN`** (same 4-line snippet on every page), `<link rel="stylesheet" href="/assets/serres-logo.css">` as last head node.
- `<script src="../assets/serres-enhance.js" defer>` + an inline `whatsapp_click` / `phone_click` GA tracker (identical IIFE, last body script) on every page.
- Nav: `<header class="nav">` → logo `<img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55">`, `← Volver al sitio` back link, `Pedir presupuesto →` btn to `../index.html#contact`.
- NAP everywhere: `Av. Can Fatjó dels Aurons, 15`, `08174 Sant Cugat del Vallès`, `Barcelona`, `ES`; phone `+34 649 66 33 80` / `tel:+34649663380`; WhatsApp `https://wa.me/34649663380?text=…`; IG `https://www.instagram.com/serres.wrap.center/`; hours Mon–Fri 09:00–19:00, Sat 10:00–14:00.
- Button system (3 variants, consistent): `.btn` (chrome-gradient fill, `clip-path:polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))`), `.btn.ghost` (transparent + 1px border), plus text link `.lead-links a`.

**i18n (critical for the EN-only port):** `assets/serres-i18n.js` (1485 lines) is **dynamically injected** by `assets/serres-enhance.js:285–291` (`loadI18n()`), so it runs on every page even though no HTML references it. Pattern: static HTML ships **Spanish**; the script reverse-translates DOM text nodes against an **English-source dictionary** `DICT = {"English": ["español","català"]}` via an inverted ES→EN index, injects an EN/ES/CA segmented switcher into nav + mobile menu, persists to `localStorage["serres-lang"]`, and fires `serres:langchange`. Opt-outs: `data-i18n-skip` on a container; `data-en="English"` attribute override (e.g. `why-serres.html:339`). **All JS-driven data blocks (prices, testimonials, film filters) already hold their source strings in English** and call `T(s)` → `window.SERRES_I18N.t(s)`. For the US port the English copy for the price tiers and reviews already exists verbatim in the source.

---

# 1. `SRC\pages\prices.html` (591 lines)

## 1.1 `<head>` (lines 1–275)
| line | item | value |
|---|---|---|
| 6 | `<title>` | `Precios — PPF, Car Wrap, Ceramic Coating y Detailing \| SERRES` |
| 7 | description | `Precios de PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES.` |
| 8 | canonical | `https://serreswrapcenter.es/pages/prices.html` |
| 9–17 | OG | `type=website`, `site_name=SERRES Wrap Center`, `locale=es_ES`, title/desc = above, `url` = canonical, `image=https://serreswrapcenter.es/assets/og/prices.jpg` 1200×630 |
| 18–21 | Twitter | `summary_large_image` + same title/desc/image |
| 238–259 | JSON-LD #1 | `@type: Service` — name "Precios de PPF, Car Wrap, Ceramic Coating y Detailing"; `areaServed: Barcelona`; `provider` = `LocalBusiness` SERRES (tel, full PostalAddress, `openingHoursSpecification` Mo–Fr 09:00–19:00 / Sa 10:00–14:00, `sameAs` IG + wa.me); **`hasOfferCatalog.itemListElement`** = 5 Offers in EUR: Car Wrap `250`, PPF `890`, Corrección+Ceramic `340`, Detailing `35`, Body kits `450` (each links to its `services/*.html`) |
| 261–265 | JSON-LD #2 | `BreadcrumbList`: Inicio → Precios |

## 1.2 H1 (lines 302–306)
```html
<h1 class="display">
  <span class="ln"><span>Elige tu</span></span>
  <span class="ln"><span class="chrome-text">nivel.</span></span>
  <span class="ln ln-kw"><span class="h1-kw">Precios de PPF, Car Wrap, Ceramic Coating y Detailing en Barcelona</span></span>
</h1>
```
3-line pattern: plain line / chrome-gradient line / muted keyword sub-line. Size `clamp(54px,10.5vw,150px)`. Animated by `@keyframes rise` (translateY 108%→0, 1s).

## 1.3 Section list with line ranges
| lines | element | content |
|---|---|---|
| 278–288 | `<header class="nav">` | logo, back, CTA |
| 290–296 | `<nav class="crumbs">` | Inicio / **Precios** |
| 298–317 | `<section class="hero" data-screen-label="Prices — Intro">` | eyebrow `Precios transparentes`; H1; `.lead` (307); `.lead-links` (309–313 → ppf.html, vinyl.html, detailing.html); `.svc-tabs#svcTabs` (315) |
| 319–326 | `<section class="tiers-sec" data-screen-label="Prices — Tiers">` | `.svc-intro#svcIntro` (322), `.tier-grid#tierGrid` (323), `.price-note` (324) |
| 328–334 | `<section class="cmp-sec" data-screen-label="Prices — Comparison">` | `h3` "Compara `<span id="cmpName">` niveles" (331), `.cmp-wrap > table.cmp#cmpTable` (332) |
| 336–347 | `<section class="teaser" data-screen-label="Prices — Exclusivo teaser">` | eyebrow `¿Lo quieres todo?`; h2 `El proyecto completo es un <span class="gold-text">Exclusivo.</span>`; p (341); 2 CTAs → `projects.html`, `../index.html#contact` |
| 349 | `<footer>` | `© 2026 SERRES… · Precios orientativos en EUR, IVA incluido` |
| 351–569 | inline `<script>` | `PRICING` data + render engine |
| 571 | | `serres-enhance.js` |
| 573–588 | | GA click tracker |

Responsive: `@media(max-width:980px)` → `.tier-grid{grid-template-columns:1fr;max-width:520px}` (224); `@media(max-width:760px)` → 22px gutters, hide nav CTA + back label (227–231); `prefers-reduced-motion` block 232–236.

## 1.4 ★ COMPLETE PRICE INVENTORY (structured)
Source of truth is the JS object `PRICING` at **lines 356–462**. Five categories, three tiers each, plus a feature matrix. `vals`: `true` = included, `false` = excluded, string = detail value. Feature bullets on the cards are **derived** from `rows.slice(0,7)` — same data drives both card and table (`render()`, lines 509–557).

```json
{
  "wrap": {
    "label_en": "Car Wrap", "label_es": "Car Wrap",
    "blurb_en": "Colour change with films from several professional brands — from subtle accents to a full identity change.",
    "blurb_es": "Cambio de color con films de varias marcas profesionales — desde acentos sutiles hasta un cambio de identidad completo.",
    "quote": false,
    "tiers": [
      {"name_en":"Accents","name_es":"Acentos","price":250,"display":"250 €","popular":false,
       "desc_en":"Roof, mirrors and detail pieces — change the attitude, not the whole car.",
       "note_en":"From 1 day in the studio","note_es":"Desde 1 día en el taller"},
      {"name_en":"Full Colour Change","name_es":"Cambio de color completo","price":1490,"display":"1.490 €","popular":true,
       "desc_en":"Every exterior panel wrapped edge-to-edge in the colour you actually wanted.",
       "note_en":"From 3–4 days in the studio","note_es":"Desde 3–4 días en el taller"},
      {"name_en":"Signature Wrap","name_es":"Car Wrap Signature","price":1990,"display":"1.990 €","popular":false,
       "desc_en":"Premium and colour-flip films, with the service tailored to the vehicle configuration.",
       "note_en":"From 5–7 days in the studio","note_es":"Desde 5–7 días en el taller"}
    ],
    "rows": [
      ["Coverage","Roof · mirrors · accents","Full exterior","Full exterior + door shuts"],
      ["Films from professional brands", true, true, true],
      ["Service per vehicle configuration", false, true, true],
      ["Premium & colour-flip films", false, false, true],
      ["Design consultation", false, false, true],
      ["Maintenance kit", false, false, false]
    ]
  },
  "ppf": {
    "label_en": "PPF",
    "blurb_en": "Self-healing paint protection film — 50+ colours from several professional brands — over the areas the road attacks first, or the whole car.",
    "quote": false,
    "tiers": [
      {"name_en":"Front Pack","price":890,"display":"890 €","popular":false,
       "desc_en":"Bumper, partial bonnet and mirrors — the high-impact essentials covered.","note_en":"From 1 day in the studio"},
      {"name_en":"Pro","price":1190,"display":"1.190 €","popular":true,
       "desc_en":"Full bonnet, wings, bumper, mirrors and headlights — seamless coverage, sealed with a Ceramic Coating over the film.","note_en":"From 2–3 days in the studio"},
      {"name_en":"Full Body","price":2390,"display":"2.390 €","popular":false,
       "desc_en":"Every painted panel protected, edges tucked — invisible armour, total peace of mind.","note_en":"From 5–8 days in the studio"}
    ],
    "rows": [
      ["Coverage","Bumper + partial bonnet","Full front end","Every painted panel"],
      ["Self-healing topcoat", true, true, true],
      ["Headlight protection", false, true, true],
      ["Wrapped edges — no visible lines", false, true, true],
      ["Door cups & sill protection", false, false, true],
      ["Ceramic Coating over film", "Optional", true, true],
      ["Film warranty", "3 yr", "3 yr", "3 yr"],
      ["Maintenance kit", false, false, false]
    ]
  },
  "ceramic": {
    "label_en": "Correction + Ceramic", "label_es": "Pulido + Cerámica",
    "blurb_en": "Stage polishing to remove the swirls, then a Ceramic Coating to lock the gloss in — the two steps that belong together.",
    "quote": false,
    "tiers": [
      {"name_en":"Essential","price":340,"display":"340 €","popular":false,
       "desc_en":"Stage 1 polish to revive the gloss, then one ceramic layer to seal it — real protection, entry price.","note_en":"1–2 days in the studio"},
      {"name_en":"Signature","price":590,"display":"590 €","popular":true,
       "desc_en":"Stage 2 correction plus a two-layer ceramic coat and rain-repellent glass — our standard.","note_en":"2–3 days in the studio"},
      {"name_en":"Concours","price":890,"display":"890 €","popular":false,
       "desc_en":"Full Stage 3 correction under hex lighting, then a multi-layer ceramic stack and interior protection.","note_en":"3–4 days in the studio"}
    ],
    "rows": [
      ["Polishing stages","Stage 1 — enhance","Stage 2 — cut & refine","Stage 3 — full correction"],
      ["Coating layers","1","2","3+"],
      ["Rain-repellent glass treatment", false, true, true],
      ["Interior leather & fabric", false, false, true],
      ["Maintenance kit", false, false, false],
      ["Rated durability","2 yr","3 yr","5 yr"]
    ]
  },
  "detailing": {
    "label_en": "Detailing",
    "blurb_en": "From a proper reset wash to a full showroom revival, inside and out.",
    "quote": false,
    "tiers": [
      {"name_en":"Refresh","price":35,"display":"35 €","popular":false,
       "desc_en":"Exterior decontamination wash plus interior vacuum and wipe-down.","note_en":"Approx. 3 hours"},
      {"name_en":"Deep Clean","price":150,"display":"150 €","popular":true,
       "desc_en":"Steam-cleaned interior, extracted carpets, decontaminated exterior, sealed paint.","note_en":"1 day in the studio"},
      {"name_en":"Showroom Reset","price":490,"display":"490 €","popular":false,
       "desc_en":"Everything — engine bay, trim restoration, leather conditioning, 12-month sealant.","note_en":"1–2 days in the studio"}
    ],
    "rows": [
      ["Exterior decon wash", true, true, true],
      ["Interior vacuum & wipe-down", true, true, true],
      ["Steam clean & carpet extraction", false, true, true],
      ["Leather cleaned & conditioned", false, true, true],
      ["Engine bay detail", false, false, true],
      ["Trim & plastics restored", false, false, true],
      ["Paint sealant", false, "6 months", "12 months"]
    ]
  },
  "bodykits": {
    "label_en": "Body Kits",
    "blurb_en": "Aero and body work sourced, fitted and finished like it left the factory that way.",
    "quote": true,            // ← prices HIDDEN, cards render "On request"
    "tiers": [
      {"name_en":"Aero Parts","price":450,"popular":false,
       "desc_en":"Splitters, spoilers and diffusers — supplied and fitted with OEM-level care.","note_en":"From 1 day in the studio"},
      {"name_en":"Full Kit Fitted","price":1490,"popular":true,
       "desc_en":"A complete body kit installed and paint-matched to your car.","note_en":"From 3–5 days in the studio"},
      {"name_en":"Transformation","price":3490,"popular":false,
       "desc_en":"Kit, wheels, stance and arch work — a different car when it rolls out.","note_en":"2–4 weeks · by consultation"}
    ],
    "rows": [
      ["Scope","Splitter · spoiler · diffuser","Complete body kit","Kit + wheels + stance"],
      ["Supply & professional fitting", true, true, true],
      ["Paint-matched finish", false, true, true],
      ["Fitment & clearance check", true, true, true],
      ["Arch & clearance work", false, false, true],
      ["Wrap / PPF integration", false, false, true],
      ["Sourcing consultation", false, true, true]
    ]
  }
}
```

**Body-kits caveat (line 443 `quote:true`):** the 450/1490/3490 values live in the data but are NEVER rendered. `render()` line 531–533 swaps the price block for `<div class="t-price t-quote"><span class="t-quote-val chrome-text">On request</span><span class="t-quote-note">Message us to calculate your price</span></div>`, the CTA label becomes `Request a quote`, and the tfoot cell reads `On request`. Yet `prices.html:259` JSON-LD **does** publish `"Body kits" price 450 EUR` — an existing inconsistency to resolve in the port.

**Every distinct number on the page:** 250 · 1490 · 1990 · 890 · 1190 · 2390 · 340 · 590 · 890 · 35 · 150 · 490 · (450 · 1490 · 3490 hidden). Plus warranty/durability strings `3 yr` ×3, `2 yr`/`3 yr`/`5 yr`, `6 months`/`12 months`, coating layers `1`/`2`/`3+`.

## 1.5 Markup precision — cards & table

**Tabs** `#svcTabs` (line 315, `data-i18n-skip`, `role="tablist"`). Server-rendered as 5 `<button class="stab" data-key="wrap|ppf|ceramic|detailing|bodykits" role="tab">`; first has `.on`. **JS wipes and rebuilds them** (`tabsEl.innerHTML=''`, lines 472–486) from `Object.keys(PRICING)`, so the static markup is only a no-JS/SEO snapshot. `.stab` = pill, `border-radius:999px`, 1px `--line-strong`; `.stab.on` = chrome-gradient fill, `color:#0a0a0b`.

**Tier card DOM** (generated at 527–537; static snapshot at line 323):
```html
<article class="tier[ popular]">
  <span class="pop-tag">Más elegido</span>           <!-- only when t.pop -->
  <h3>Cambio de color completo</h3>
  <p class="t-desc">…</p>
  <div class="t-price">
    <span class="t-from">Desde</span>
    <span class="t-val chrome-text" data-price="1490">1.490 €</span>
  </div>
  <ul>
    <li class=""><svg class="ic ok" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.2"><path d="M4.5 12.5l5 5L19.5 7"></path></svg><span>Cobertura — Exterior completo</span></li>
    <li class="off"><svg class="ic no" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2"><path d="M6 6l12 12M18 6L6 18"></path></svg><span>Films premium y camaleón</span></li>
    … 6–7 <li> total (rows.slice(0,7)) …
  </ul>
  <div class="t-cta"><a class="btn" href="https://wa.me/34649663380?text=…" target="_blank" rel="noopener">Reserva por WhatsApp <span class="arr">→</span></a></div>
  <p class="t-note">Desde 3–4 días en el taller</p>
</article>
```
- Row label rendering (line 523): string value → `label = T(row[0]) + ' — ' + T(value)`; boolean → `T(row[0])`. `on = (v !== false)`, so `"Optional"` renders as an **included** tick.
- CTA class: popular tier gets `.btn`, the others `.btn ghost`. WhatsApp text template (line 526): `"Hola SERRES, quería presupuesto del pack "+T(t.name)+" de "+T(s.label)+" para mi coche."` URI-encoded.
- Card CSS (148–179): `.tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}`; `.tier` = `background:var(--panel)`, 1px `--line`, `padding:30px 28px 28px`, **`clip-path:polygon(0 0,100% 0,100% 100%,18px 100%,0 calc(100% - 18px))`** (cut bottom-left corner — the signature shape), hover `translateY(-4px)`; `.tier.popular` = `--panel-2` + `border:1px solid rgba(255,255,255,.34)`; `.pop-tag` absolute top-right, chrome fill, `border-radius:999px`, 10.5px; `.t-val` Barlow 700 **46px**; `.t-desc{min-height:42px}` (collapsed to 0 under 980px); `.tier li .ic{16×16;margin-top:3px}`, `.ic.ok{color:#e7e7ec}`, `.ic.no{color:var(--muted-2);opacity:.55}`.
- Count-up animation (488–501): `animatePrice()` — 1500 ms, `setInterval(…,16)`, ease `1-(1-p)^4`, formatter `fmtEur()` = thousands separated with **`.`** + ` €` (`\u20AC`). Honors `prefers-reduced-motion` (sets final value directly). **For USD this formatter must be rewritten** (`$1,490`, comma separator, symbol prefix).
- `.price-note` (line 324): `Precios orientativos · el presupuesto final depende del tamaño del vehículo, su estado y la elección de film · no incluyen kit de mantenimiento` — flanked by `::before/::after` 1px rules (`flex:1`).

**Comparison table DOM** (generated 548–556; static snapshot line 332):
```html
<div class="cmp-wrap">
  <table class="cmp" id="cmpTable" data-i18n-skip>
    <thead><tr><th>Característica</th><th class="">Acentos</th><th class="col-pop">Cambio de color completo</th><th class="">Car Wrap Signature</th></tr></thead>
    <tbody>
      <tr><td>Cobertura</td><td class="">Techo · retrovisores · acentos</td><td class="col-pop">Exterior completo</td><td class="">Exterior completo + marcos</td></tr>
      <tr><td>Films premium y camaleón</td><td class=""><span class="dash">—</span></td>…<td class=""><svg class="ic ok" …/></td></tr>
    </tbody>
    <tfoot><tr><td>Precio orientativo</td><td class=""><span class="chrome-text">desde 250 €</span></td><td class="col-pop"><span class="chrome-text">desde 1.490 €</span></td><td class=""><span class="chrome-text">desde 1.990 €</span></td></tr></tfoot>
  </table>
</div>
```
- `cellHTML(v,extra)` (504–508): `true` → `<td class="…">OK-svg</td>`; `false` → `<td class="…"><span class="dash">—</span></td>`; string → `<td class="…">T(v)</td>`.
- `popIdx = tiers.findIndex(t=>t.pop)` → that column gets `class="col-pop"` in thead/tbody/tfoot.
- Table CSS (186–208): `.cmp-wrap{border:1px solid var(--line);overflow-x:auto;-webkit-overflow-scrolling:touch;background:rgba(20,20,23,.5)}`; `table.cmp{width:100%;border-collapse:collapse;min-width:640px}` (horizontal scroll on mobile, NOT card-stacked); `th/td padding:13px 20px`, 14px; thead Barlow 600 uppercase `.14em`, centered, `background:rgba(255,255,255,.03)`; first thead cell left-aligned 11.5px `.2em` muted-2; tbody first cell left-aligned 13.5px muted; `tr:hover{background:rgba(255,255,255,.025)}`; `.col-pop{background:rgba(255,255,255,.045)}`; tfoot Barlow 700 19px; `@media(max-width:880px)` reduces padding to 12/14px.
- Language re-render hook: lines 563–568, `window.addEventListener('serres:langchange', …)` rebuilds tabs + calls `render(currentKey)`. Entry point: `var currentKey='wrap'; render('wrap');` (559–560).

---

# 2. `SRC\pages\gallery.html` (768 lines) — "Proyectos"

## 2.1 `<head>`
| line | item | value |
|---|---|---|
| 6 | title | `Proyectos y Galería de Trabajos — PPF, Car Wrap y Detailing \| SERRES` |
| 7 | description | `Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover.` |
| 8 | canonical | `https://serreswrapcenter.es/pages/gallery.html` |
| 9–21 | OG/Twitter | `og:image = /assets/og/gallery.jpg` 1200×630, `og:locale=es_ES` |
| 267–269 | JSON-LD #1 | `@type: ImageGallery`, name "Proyectos de SERRES — galería de trabajos", `image[]` = 8 absolute URLs: `rwb-front.jpg, m2-rooftop.webp, supra-villa.webp, e92-coast.webp, xm-front.webp, landrover-studio.jpg, ligier-front.webp, serie1-front.webp` (all under `/assets/gallery/`); publisher LocalBusiness |
| 270–272 | JSON-LD #2 | `BreadcrumbList` Inicio → Proyectos |

## 2.2 H1 (304–308)
`Nuestros` / `<span class="chrome-text">Proyectos</span>` / `<span class="h1-kw">Galería de trabajos — PPF, Car Wrap y Detailing en Barcelona</span>`

## 2.3 Section list with line ranges
| lines | element |
|---|---|
| 285–295 | `<header class="nav">` |
| 297–325 | `<section class="hero" data-screen-label="Proyectos — Intro">` — crumbs (300–302, inside hero here, unlike prices), eyebrow `El showroom` (303), H1 (304–308), `.lead` (309), `.lead-links` (310 → ppf.html, vinyl.html), **`<nav class="dir">` jump-nav (312–323)** = 10 pills `01 Porsche 993 RWB … 10 911 Carrera GTS` linking to `#porsche #m2 #supra #e92 #xm #landrover #ligier #serie1 #cayenne #gts` |
| 328–647 | `<main class="exhibits"><div class="wrap">` |
| 332–375 | exhibit 01 `#porsche` |
| 378–406 | exhibit 02 `#m2` |
| 409–437 | exhibit 03 `#supra` |
| 440–463 | exhibit 04 `#e92` |
| 466–504 | exhibit 05 `#xm` |
| 507–530 | exhibit 06 `#landrover` |
| 533–556 | exhibit 07 `#ligier` |
| 559–577 | exhibit 08 `#serie1` |
| 580–608 | exhibit 09 `#cayenne` |
| 611–644 | exhibit 10 `#gts` |
| 649–658 | `<section class="cta">` — eyebrow `El próximo, tu coche`; h2 `Gánate tu <span class="chrome-text">propia sala.</span>`; 1 CTA → `../index.html#contact` |
| 660 | `<footer>` `© 2026 SERRES… · Sobre coches reales de clientes` |
| 662–674 | **lightbox** `<div class="lb" id="lb" aria-hidden="true" role="dialog" aria-label="Visor de imágenes">` — `.lb-bar` (`#lbCar`, `#lbCount`, `#lbClose`), `.lb-stage` (`#lbPrev`, `<img id="lbImg">`, `#lbNext`), `.lb-cap > .c2#lbNote` |
| 676–686 | reveal-on-scroll IO (`.reveal-up` → `.in`, threshold .08, rootMargin `0px 0px -6% 0px`; no-IO fallback adds `.in` to all) |
| 688–746 | lightbox JS (scoped per `.ex-gallery[data-car]`, `pad()` 2-digit counter, Esc/←/→ keys, touch-swipe >48px, `documentElement.style.overflow` lock) |
| 748 / 750–765 | enhance.js / GA tracker |

## 2.4 Gallery structure & full image path inventory
Each exhibit:
```html
<section class="exhibit" id="<slug>" data-screen-label="Proyectos — <Car>">
  <div class="ex-head reveal-up">
    <div class="ex-id">01</div>
    <div class="ex-meta">
      <span class="eyebrow">RAUH-Welt Begriff</span>
      <h2>Porsche 993 <span class="chrome-text">RWB</span></h2>
      <p class="ex-desc">…</p>
      <div class="ex-tags"><span>Taller</span><span>Detailing</span><span>Cerámica</span></div>
    </div>
    <div class="ex-count"><b>06</b><small>Tomas</small></div>
  </div>
  <div class="ex-gallery lay-mosaic reveal-up" data-car="Porsche 993 RWB">
    <figure class="shot feature" data-full="../assets/gallery/rwb-front.jpg" data-note="Front three-quarter · In the studio">
      <img src="../assets/gallery/rwb-front-s.jpg" alt="…" width="507" height="900" loading="eager" fetchpriority="high" decoding="async">
      <span class="zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>
      <figcaption><span class="cap-note">En el estudio</span><span class="cap-tag">Taller</span></figcaption>
    </figure>
    …
  </div>
</section>
```
Note the **two-tier image scheme**: `<img src>` = `-s.jpg` thumbnail (explicit width/height, all `loading="lazy" decoding="async"` except the single `feature` shot which is `eager` + `fetchpriority="high"`); `figure[data-full]` = the full-size asset the lightbox loads (mixed `.jpg`/`.webp`). `data-note` is an **English** string translated by `T()` at lightbox time; `figcaption .cap-note` / `.cap-tag` are Spanish in the DOM.

| # | id | eyebrow | H2 | tags | shots | layout | `data-car` | thumb → full pairs (all under `../assets/gallery/`) |
|---|---|---|---|---|---|---|---|---|
| 01 | `porsche` | RAUH-Welt Begriff | Porsche 993 **RWB** | Taller, Detailing, Cerámica | 06 | `lay-mosaic` | `Porsche 993 RWB` | `rwb-front-s.jpg`(507×900,**feature**,eager)→`rwb-front.jpg`; `rwb-top-s.jpg`(600×900)→`rwb-top.webp`; `rwb-doors-s.jpg`(600×900)→`rwb-doors.jpg`; `rwb-side-s.jpg`(900×600)→`rwb-side.webp`; `rwb-profile-s.jpg`(600×900)→`rwb-profile.jpg`; `rwb-snow-s.jpg`(600×900)→`rwb-snow.webp` |
| 02 | `m2` | G87 · Car Wrap gris frozen | BMW **M2** | Car Wrap, PPF | 03 | `lay-trio` | `BMW M2` | `m2-rooftop-s.jpg`(600×900)→`m2-rooftop.webp`; `m2-front-s.jpg`(600×900)→`m2-front.webp`; `m2-tower-s.jpg`(600×900)→`m2-tower.jpg` |
| 03 | `supra` | A90 · Blanco perla | Toyota **GR Supra** | Cerámica, Corrección de pintura | 03 | `lay-trio` | `Toyota GR Supra` | `supra-villa-s.jpg`(720×900)→`supra-villa.webp`; `supra-rear-s.jpg`(720×900)→`supra-rear.webp`; `supra-road-s.jpg`(475×552)→`supra-road.jpg` |
| 04 | `e92` | E92 · Negro brillo | BMW **335i** | Detailing, Corrección de pintura | 02 | `lay-duo` | `BMW 335i E92` | `e92-rolling-s.jpg`(900×600)→`e92-rolling.jpg`; `e92-coast-s.jpg`(900×600)→`e92-coast.webp` |
| 05 | `xm` | G09 · Negro mate | BMW **XM** | PPF, Detailing, Car Wrap | 05 | `lay-mosaic` | `BMW XM` | `xm-front-s.jpg`(900×600,**feature**)→`xm-front.webp`; `xm-grille-s.jpg`(439×780)→`xm-grille.webp`; `xm-rear-s.jpg`(520×780)→`xm-rear.webp`; `xm-headliner-s.jpg`(442×645)→`xm-headliner.jpg`; `xm-wheel-s.jpg`(448×672)→`xm-wheel.jpg` |
| 06 | `landrover` | Land Rover · Car Wrap negro satinado | Range Rover **Sport** | Car Wrap, Negro satinado, Taller | 02 | `lay-duo` | `Range Rover Sport` | `landrover-studio-s.jpg`(603×900)→`landrover-studio.jpg`; `landrover-nose-s.jpg`(600×900)→`landrover-nose.jpg` |
| 07 | `ligier` | Ligier · Car Wrap negro mate | Ligier **Microcar** | Car Wrap, Negro mate | 02 | `lay-duo` | `Ligier` | `ligier-rear-s.jpg`(706×900)→`ligier-rear.webp`; `ligier-front-s.jpg`(675×900)→`ligier-front.webp` |
| 08 | `serie1` | F40 · Car Wrap gris satinado | BMW **Serie 1** | Car Wrap, Taller | 01 | `lay-duo` | `BMW Serie 1` | `serie1-front-s.jpg`(677×900, inline `style="grid-column:1/-1"`)→`serie1-front.webp` |
| 09 | `cayenne` | E-Hybrid · Car Wrap negro satinado | Porsche **Cayenne** | Car Wrap, Negro satinado, Detailing | 03 | `lay-trio` | `Porsche Cayenne` | `cayenne-front-s.jpg`(601×900)→`cayenne-front.jpg`; `cayenne-quarter-s.jpg`(601×900)→`cayenne-quarter.jpg`; `cayenne-crest-s.jpg`(601×900)→`cayenne-crest.jpg` |
| 10 | `gts` | 992 · Car Wrap arena satinado | 911 **Carrera GTS** | Car Wrap, Arena satinada, Taller | 04 | `lay-duo` | `Porsche 911 Carrera GTS` | `gts-quarter-s.jpg`(598×900)→`gts-quarter.jpg`; `gts-front-s.jpg`(598×900)→`gts-front.jpg`; `gts-rear-s.jpg`(598×900)→`gts-rear.jpg`; `gts-tail-s.jpg`(598×900)→`gts-tail.jpg` |

**Total: 31 shots across 10 exhibits.** Caption `.cap-tag` vocabulary: `Taller, Detailing, Car Wrap, PPF, Cerámica, Detalle, Interior, Brillo, Invierno, Negro brillo, En la carretera`. Directory `SRC\assets\gallery\` holds 73 files (each shot as `-s.jpg` thumb + full `.jpg`, with `.webp` alternates for 15 of them).

**Grid CSS (150–177):** `.ex-gallery{display:grid;gap:14px}`; `.lay-mosaic{grid-template-columns:repeat(3,1fr);grid-auto-rows:clamp(148px,20vw,250px);grid-auto-flow:dense}` + `.lay-mosaic .feature{grid-column:span 2;grid-row:span 2}`; `.lay-trio{repeat(3,1fr);grid-auto-rows:clamp(300px,30vw,430px)}`; `.lay-duo{repeat(2,1fr);grid-auto-rows:clamp(320px,40vw,480px)}`. `.shot` = `cursor:zoom-in`, `clip-path:polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px))`, img `object-fit:cover` + `filter:brightness(.9) saturate(.95)` → hover `scale(1.06)` + full brightness (1.1 s); `figcaption` fades in on hover with `linear-gradient(180deg,transparent,rgba(8,8,9,.8))`; `.zoom` = 34px circle top-right with backdrop blur. Mobile ≤600px: `.ex-gallery{grid-template-columns:1fr!important}`, `.shot{aspect-ratio:4/5}`, figcaptions always visible, `.ex-count{display:none}` at ≤980px.

**Unused-but-present CSS:** `.ex-standby` "coming soon" placeholder block (lines 179–193, with `@keyframes pulse`) — **no markup uses it**; `.dir a.soon` (125–127) likewise unused. Leftover from an earlier version where exhibits were placeholders.

## 2.5 Claims/stats/reviews on gallery
No numeric claims, no reviews. Only the `.ex-count` per-exhibit shot counters (`06/03/03/02/05/02/02/01/03/04`) and the copy claim in the lead (line 309): *"Fotografiado en Barcelona y alrededores — sin fotos de stock ni coches de alquiler."*

---

# 3. `SRC\pages\projects.html` (418 lines) — "Exclusivo"

## 3.1 `<head>`
| line | item | value |
|---|---|---|
| 6 | title | `Exclusivo — Proyectos de Transformación en Barcelona \| SERRES` |
| 7 | description | `Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año.` |
| 8 | canonical | `https://serreswrapcenter.es/pages/projects.html` |
| 9–21 | OG/Twitter | `og:image = /assets/og/projects.jpg` 1200×630 |
| 210–221 | JSON-LD #1 | `@type: Service`, name "Exclusivo — proyecto de transformación completa de coches"; `serviceType` "(corrección, vinilo, PPF, cerámico, carrocería, interior)"; `areaServed: Barcelona`; provider LocalBusiness (tel, address, sameAs). **No `hasOfferCatalog`, no price at all.** |
| 223–226 | JSON-LD #2 | `BreadcrumbList` Inicio → Exclusivo |

## 3.2 H1 (268–272)
`Un coche.` / `<span class="chrome-text">Todo.</span>` / `<span class="h1-kw">Proyectos de transformación completa en Barcelona</span>`

## 3.3 Section list with line ranges
| lines | element | content |
|---|---|---|
| 240–250 | `<header class="nav">` | |
| 252–258 | `<nav class="crumbs">` | Inicio / **Exclusivo** |
| 260–286 | `<section class="hero">` | **full-bleed hero image** line 262: `<img class="hero-img" src="../assets/gallery/rwb-profile.jpg" width="1200" height="1800" fetchpriority="high" decoding="async" alt="RWB Porsche 993 en el estudio SERRES bajo luces hexagonales">` + `<div class="hero-overlay">`; eyebrow `<span class="gold-text">Exclusivo</span>`; H1; **`.hero-stats`** (274–278); `.lead` (280); 2 CTAs (282–283): WhatsApp deep link + `#included` ghost |
| 288–338 | `<section class="included" id="included">` | `.section-head`: eyebrow `El alcance`, h2 `Cada disciplina.<br>Una visión.`, `.sh-note`; **`.inc-grid`** 6 × `.inc` |
| 340–368 | `<section class="process">` | eyebrow `Cómo funciona`, h2 `Tres pasos hacia<br>un coche distinto.`; **`.steps`** 3 × `.step` |
| 370–382 | `<section class="cta">` | eyebrow `Limitado por diseño`; h2 `<span class="gold-text">Seis Exclusivos.</span><br><span class="chrome-text">Al año. Nada más.</span>`; p (375); 2 CTAs (WhatsApp / `../pages/gallery.html`); `.phone` line 380: `Sant Cugat del Vallès, Barcelona · <strong>+34 649 66 33 80</strong>` |
| 384 | `<footer>` | `© 2026 SERRES… · Exclusivo — proyectos completos limitados` |
| 386–396 | reveal IO | threshold .12, rootMargin `0px 0px -8% 0px` |
| 398 / 400–415 | | enhance.js / GA tracker |

## 3.4 Claims & stats
`.hero-stats` (274–278) — three `<div class="hstat"><b>…</b><span>…</span></div>`:
- **`6`** (gold-text) / `Exclusivos al año`
- **`1`** (chrome-text) / `Coche a la vez`
- **`100%`** (chrome-text) / `A medida`

CTA reinforces: *"solo aceptamos unos pocos al año"* (375). No prices, no reviews on this page.

## 3.5 `.inc-grid` — 6 disciplines (lines 300–335)
Pattern: `<div class="inc"><span class="in-no">0N</span><h3>…</h3><p>…</p><a href="…">Ver más <span>→</span></a></div>`

| no | h3 | copy | link |
|---|---|---|---|
| 01 | Corrección de pintura | La base. Pulido a máquina multietapa hasta que la pintura se ve impecable bajo la luz hexagonal. | `../services/paint-correction.html` |
| 02 | Car Wrap *(`data-i18n-skip`)* | La identidad. Un cambio de color completo o un film signature elegido en una consulta de diseño personalizada. | `../services/vinyl.html` |
| 03 | PPF *(`data-i18n-skip`)* | El seguro. Film autorreparable sobre las superficies acabadas, bordes ocultos, invisible. | `../services/ppf.html` |
| 04 | Ceramic Coating *(`data-i18n-skip`)* | El sellado. SiO₂ multicapa sobre pintura, film y cristales para años de protección deslizante. | `../services/ceramic.html` |
| 05 | Carrocería y stance | La silueta. Aero, pasos de rueda, llantas y encaje resueltos como parte del mismo diseño. | `../services/body-kits.html` |
| 06 | Renovación de interior | El habitáculo. Limpiado a vapor, acondicionado y protegido hasta igualar el exterior. | `../services/detailing.html` |

## 3.6 `.steps` — 3 steps (351–365)
`<div class="step"><span class="st-no">0N</span><h3>…</h3><p>…</p></div>`
- **01 La consulta** — "Trae el coche, o solo la idea. Hablamos de colores, films, stance y presupuesto — y te decimos con honestidad qué merece la pena hacer en tu coche."
- **02 El plano** — "Recibes un único documento: el diseño completo, el alcance exacto, los plazos y una estimación de precio cerrada. Sin sorpresas después."
- **03 El proyecto** — "Tu coche tiene el taller para él solo. Un equipo, de principio a fin — con fotos en cada hito hasta el día de la entrega."

WhatsApp text used twice (282, 377): `"Hola SERRES, quería informarme sobre un Exclusivo completo y pedir una estimación de precio para mi coche."`

---

# 4. `SRC\pages\why-serres.html` (504 lines)

## 4.1 `<head>`
| line | item | value |
|---|---|---|
| 6 | title | `Estudio de Detailing en Sant Cugat — Por Qué SERRES` |
| 7 | description | `Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan.` |
| 8 | canonical | `https://serreswrapcenter.es/pages/why-serres.html` |
| 9–21 | OG/Twitter | `og:image = /assets/og/why-serres.jpg` 1200×630 |
| 232–274 | JSON-LD #1 | **`@type: AutoRepair`** (the only page using it) — name, description, url `https://serreswrapcenter.es/`, image, telephone, **`priceRange: "€€"`**, full PostalAddress, openingHoursSpecification (Mo–Fr 09–19, Sa 10–14), sameAs, and **`aggregateRating { ratingValue: "4.9", reviewCount: "50" }`** |
| 275–294 | JSON-LD #2 | `BreadcrumbList` Inicio → Por qué SERRES |

## 4.2 H1 (330–334)
`Por qué` / `<span class="chrome-text">SERRES</span>` / `<span class="h1-kw">Estudio de detailing en Sant Cugat del Vallès</span>`

## 4.3 Section list with line ranges
| lines | element |
|---|---|
| 307–317 | `<header class="nav">` |
| 319–344 | `<section class="hero">` — crumbs inside hero (322–326), eyebrow `El estudio` (329), H1, `.hero-stats` (336–340), `.lead` (342) |
| 346–385 | `<section class="standards">` — `.section-head` (eyebrow `La diferencia`, h2 `Estándares que<br>puedes medir.`, `.sh-note`), `.std-grid` 4 × `.std` (358–377), `.std-links` (380–383) |
| 387–411 | `<section class="reviews">` — `.rv-grid` → sticky `.rv-left` (392–405) + `.rv-stack#rvStack` (408) |
| 413–424 | `<section class="cta">` — eyebrow `Tráenos el coche`, h2 `Exígenos el <span class="chrome-text">estándar.</span>`, 2 CTAs (`#contact`, `#services`), `.phone` (422) |
| 426 | `<footer>` `© 2026 SERRES… · Detailing y personalización premium` |
| 428–438 | reveal IO (ES6 arrow syntax here, unlike the var-style on other pages) |
| 440–483 | testimonials script (`TESTIMONIALS` array + `paint()`) |
| 486 / 487–502 | enhance.js / GA tracker |

## 4.4 ★ ALL CLAIMS & STATS
**Hero stats** (336–340), `<div class="hstat"><b class="chrome-text">N</b><span>label</span></div>`:
- **50+** / `Coches transformados`
- **4.9** / `Valoración media`
- **1** / `<span data-en="Workshop">Taller</span>` ← the one `data-en` attribute override on the page

**Reviews stats** (396–400), `<div class="rv-stat"><b class="chrome-text">N</b><span>label</span></div>`:
- **4.9** / `Valoración media`
- **50+** / `Coches`
- **98%** / `Recomendaciones`

**Schema claim** (270–271): `aggregateRating 4.9 / reviewCount 50`.
**Meta claim** (7, 13, 20): "un 98% de clientes que nos recomiendan".
Also repeated in blog copy: `cuanto-cuesta-vinilar-un-coche.html:334-335` — "el 98 % de nuestros clientes nos recomienda, con una valoración media de 4,9".

**4 standards** (`.std-grid`, 358–377) — `<div class="std"><span class="sd-num">0N</span><h3>…</h3><p>…</p></div>`:
1. **Preparación<br>obsesiva** — "La mayor parte del trabajo ocurre antes de que se vea el resultado. Descontaminación, inspección y corrección van primero — siempre."
2. **Resultados<br>a la vista** — "Iluminación hexagonal controlada y revisión panel a panel. Te enseñamos el acabado bajo la luz, no solo en fotos."
3. **Materiales<br>premium** — "Solo films, recubrimientos y compuestos certificados — respaldados por garantías reales de fabricante, nunca stock de mercado gris."
4. **Un solo<br>taller** — "Un único interlocutor de principio a fin: el mismo equipo que presupuesta tu coche es el que te lo entrega."

`.std-links` (380–383): `../services/detailing.html` "Detailing profesional en Sant Cugat →", `../services/ppf.html` "Protección PPF para tu pintura →".

## 4.5 ★ REVIEWS — data + markup
Source array `TESTIMONIALS` at **lines 443–454** (English source; the DOM snapshot at line 408 is the Spanish render, `data-i18n-skip`):

| # | name | initials | role (EN) | rating | svc (EN) | quote (EN, abbreviated) |
|---|---|---|---|---|---|---|
| 1 | Marc Vidal | MV | Golf GTI · Owner | 5.0 | Full Wrap | "Excellent service from start to finish. The treatment is genuinely exceptional — very professional, attentive to every detail and always ready to offer a personalised experience. I brought my Golf GTI in for a black wrap and the result was flawless, beyond my expectations. I'm delighted with both the finish and the whole process. Without a doubt, a place I thoroughly recommend." |
| 2 | Marcos Catlano | MC | Porsche 911 · Owner | 5.0 | Paint Correction | "Years of swirls just… gone. They walked me round the car panel by panel under the hex lights. You can see your reflection in the roof like a mirror." |
| 3 | Daniel Roca | DR | Mercedes G-Class · Collector | 4.8 | Full Wrap | "Colour change on the G-Class was flawless — every shut line and edge finished properly. This is a proper studio." |
| 4 | Aleix Soler | AS | Audi RS6 · Owner | 5.0 | PPF + Ceramic | "Booked the full front PPF and a ceramic on top. Communication was perfect, timeline was exact, and the car came back cleaner than the showroom." |
| 5 | Núria Camps | NC | Range Rover · Owner | 4.9 | Detailing | "The interior detail genuinely felt like a new car. They care about the parts nobody photographs." |

Spanish equivalents (DOM, line 408): roles `Golf GTI · Propietario`, `Porsche 911 · Propietario`, `Mercedes G-Class · Coleccionista`, `Audi RS6 · Propietario`, `Range Rover · Propietario`; services `Car Wrap completo`, `Corrección de pintura`, `Car Wrap completo`, `PPF + Cerámica`, `Detailing`.

Card DOM (generated 470–478):
```html
<article class="rv-card">
  <div class="rv-top">
    <div class="rv-avatar">MV</div>                     <!-- initials only, no photos -->
    <div class="rv-id"><span class="rv-name">Marc Vidal</span><span class="rv-role">Golf GTI · Propietario</span></div>
  </div>
  <div class="rv-rate">
    <span class="score">5.0</span>
    <span class="rv-stars"><svg viewBox="0 0 24 24" fill="currentColor" class="s-full"><path d="M12 2l2.9 6.26L21.5 9.2l-4.75 4.43 1.2 6.62L12 17.1 6.05 20.25l1.2-6.62L2.5 9.2l6.6-.94z"/></svg> ×5</span>
  </div>
  <p class="rv-quote">&ldquo;…&rdquo;</p>
  <span class="rv-svc">Car Wrap completo</span>
</article>
```
Helpers: `initials(n)` = first letter of each word, 2 chars, uppercase (465); `stars(r)` = 5 svgs, `class="s-full"` when `i <= Math.round(r)` else `s-empty` — so 4.8 and 4.9 still render 5 full stars (456–464); `rating.toFixed(1)`. Layout: `.rv-grid` = sticky left column (`.rv-left`) + `.rv-stack` of stacking cards; repaints on `serres:langchange` (481).

`.rv-left` copy (393–395): tag `<span class="rv-tag"><span class="dot"></span> Lo que dicen los clientes</span>`; h2 `La confianza de<br>los coches que<br>más quieren.`; p "Desde un primer Car Wrap hasta un proyecto completo de PPF y corrección — estas son las personas que nos dieron las llaves, y lo que dijeron al recuperarlas."; `.rv-actions` = `Pedir presupuesto →` (`../index.html#contact`) + `Ver proyectos` ghost (`projects.html`).

**No prices on this page.**

---

# 5. BLOG

## 5.1 `SRC\blog\index.html` (164 lines) — listing page

**`<head>`:** title `Blog — Consejos de PPF, Car Wrap y Detailing | SERRES` (6); description `Guías y consejos del equipo SERRES: precios reales de PPF, Car Wrap, Ceramic Coating y Detailing, y cómo mantener el acabado de tu coche en Barcelona.` (7); canonical `https://serreswrapcenter.es/blog/index.html` (8); OG/Twitter 14–26 with **`og:image = /assets/og/home.jpg`** (reuses the home OG, no dedicated blog OG) and a shorter og:description `Guías y consejos del equipo SERRES sobre protección de pintura y personalización.`; **`<link rel="stylesheet" href="../assets/blog.css">` (30) — the blog is the only part of the site with an EXTERNAL stylesheet** (201 lines) instead of inline `<style>`; JSON-LD `Blog` `@id=…/blog/index.html`, `inLanguage: "es"`, publisher Organization (31–40); JSON-LD `BreadcrumbList` Inicio → Blog, position 2 has **no `item`** (41–50).

**H1 (82):** `<h1 class="display" data-i18n-skip>El <span class="chrome-text">Blog</span></h1>` — with an HTML comment at 81 explaining the `data-i18n-skip` (the word "El" would collide with the dictionary's "The" entry).

**Sections:** `<header class="nav">` 64–74 (back link is `← Volver al sitio`); `<main>` 77–142; `<section class="blog-hero">` 78–85 (eyebrow `Guías y consejos`, H1, `.lead` "Precios, comparativas y mantenimiento — escrito por el equipo del taller, sin humo comercial."); `<div class="wrap"><div class="post-grid" data-i18n-skip>` 88–140; `<footer>` 144 `© 2026 SERRES. Todos los derechos reservados.`; enhance.js 146; GA tracker 147–162.

### ★ Post-card markup pattern (the listing unit) — lines 91–101
```html
<a class="post-card" href="cuanto-cuesta-vinilar-un-coche.html">
  <img src="../assets/blog/cuanto-cuesta-vinilar-un-coche/cover.webp" width="1600" height="1000"
       loading="lazy" decoding="async"
       alt="Cambio de color completo con vinilo en un coche en el taller SERRES de Sant Cugat">
  <div class="pc-body">
    <span class="pc-date">9 jul 2026 · Car Wrap</span>
    <h2>¿Cuánto cuesta vinilar un coche?</h2>
    <p>Tarifas reales 2026: acentos desde 250 € y cambio de color completo desde 1.490 €. Qué incluye cada precio y cómo comparar presupuestos.</p>
    <span class="pc-more">Leer artículo →</span>
  </div>
</a>
```
Key facts: the **whole card is one `<a>`** (no nested links); the card `<h2>` *is* the post title (page has one H1 + four H2s); `.pc-date` merges date and category with `·`; cover images are `.webp` declared **1600×1000** in the listing but **1600×900** in the article hero (`aspect-ratio:16/10` in the grid CSS vs `16/9` in `.post-cover`); all four covers `loading="lazy"` (no eager/priority hint on the first card).

**All four cards, in DOM order:**
| lines | href | cover `src` | `.pc-date` | `<h2>` | `<p>` | alt |
|---|---|---|---|---|---|---|
| 91–101 | `cuanto-cuesta-vinilar-un-coche.html` | `../assets/blog/cuanto-cuesta-vinilar-un-coche/cover.webp` | `9 jul 2026 · Car Wrap` | ¿Cuánto cuesta vinilar un coche? | Tarifas reales 2026: acentos desde 250 € y cambio de color completo desde 1.490 €. Qué incluye cada precio y cómo comparar presupuestos. | Cambio de color completo con vinilo en un coche en el taller SERRES de Sant Cugat |
| 103–113 | `ppf-o-ceramico-que-elegir.html` | `…/ppf-o-ceramico-que-elegir/cover.webp` | `9 jul 2026 · PPF · Ceramic` | PPF o cerámico: ¿qué elegir? | Protección física frente a protección química: duración, precios reales y qué opción encaja con tu coche. | Aplicación de Ceramic Coating sobre la pintura de un coche protegido con PPF |
| 115–125 | `cuanto-cuesta-ppf-coche.html` | `…/cuanto-cuesta-ppf-coche/cover.webp` | `9 jul 2026 · PPF` | ¿Cuánto cuesta el PPF para tu coche? | Frontal desde 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, IVA incluido. Qué incluye cada cobertura. | Instalación de film de protección de pintura PPF en el frontal de un coche |
| 127–137 | `limpieza-tapiceria-coche-precio.html` | `…/limpieza-tapiceria-coche-precio/cover.webp` | `9 jul 2026 · Detailing` | Limpieza de tapicería del coche: precios | De 35 € a 490 € según el nivel: qué incluye cada servicio, qué técnicas se usan y cuándo compensa cada opción. | Limpieza profesional de la tapicería del interior de un coche con inyección-extracción |

### Listing CSS (`SRC\assets\blog.css`)
- `.post-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;padding:40px 0 90px}` (164) → `1fr 1fr` at the ~980px breakpoint (188) → `1fr` at ~640px (195). **4 cards in a 3-column grid = one orphan on the second row.**
- `.post-card{border:1px solid var(--line);background:var(--panel);display:flex;flex-direction:column}` (165), hover `border-color:var(--line-strong);transform:translateY(-4px)` (167)
- `.post-card img{width:100%;aspect-ratio:16/10;object-fit:cover;border-bottom:1px solid var(--line)}` (168)
- `.pc-body{padding:22px;display:flex;flex-direction:column;gap:10px;flex:1}` (169)
- `.pc-date` Barlow, `letter-spacing:.2em;font-size:11.5px` (170); `.post-card h2` Barlow 600 uppercase (172); `.post-card p{color:var(--muted);font-size:14.5px}` (174); `.pc-more{margin-top:auto;padding-top:8px}` Barlow 600, brightens on card hover (175–177)
- No `clip-path` corner-cut on `.post-card` (unlike `.tier`/`.shot`) — the blog cards are plain rectangles.

## 5.2 Article template (identical across all 4)
Line ranges per file:

| element | `cuanto-cuesta-vinilar-un-coche` (450) | `ppf-o-ceramico-que-elegir` (449) | `cuanto-cuesta-ppf-coche` (450) | `limpieza-tapiceria-coche-precio` (464) |
|---|---|---|---|---|
| `<body>` | 150 | 130 | 130 | 150 |
| `<header class="nav">` | 153–163 | 133–143 | 133–143 | 153–163 |
| `<nav class="crumbs">` (`<ol>` 3 `<li>`) | 166–174 | 146–154 | 146–154 | 166–174 |
| `<main>` | 177–429 | 157–427 | 157–428 | 177–442 |
| `<section class="post-hero">` | 178–199 | 158–179 | 158–179 | 178–199 |
| `<div class="wrap post-layout">` | 202–395 | 182–394 | 182–395 | 202–409 |
| `<aside class="toc">` | 204–215 | 184–197 | 184–196 | 204–215 |
| `<article class="prose" data-i18n-skip>` | 217–394 | 199–392 | 198–393 | 217–407 |
| `<section class="faq" id="faq">` | 339–374 | 334–367 | 336–374 | 351–387 |
| `<section class="post-cta">` | 377–392 | 377–390 | 377–391 | 390–405 |
| `<section class="related">` | 398–427 | 396–425 | 397–426 | 411–440 |
| `<footer>` | 431 | 429 | 430 | 444 |
| `serres-enhance.js` | 433 | 447 | 448 | 446 |

Nav back link on articles: `<a href="index.html" class="back">← <span class="lbl">Todos los artículos</span></a>`.

**post-hero pattern** (e.g. 178–199 in art. 1):
```html
<section class="post-hero"><div class="wrap">
  <span class="eyebrow">Blog · Car Wrap</span>
  <h1 class="display">¿Cuánto cuesta <span class="chrome-text">vinilar un coche</span>? Precios reales en España (2026)</h1>
  <div class="post-meta" data-i18n-skip>
    <span class="author"><span class="avatar" aria-hidden="true">S</span><span>Por <b>Equipo SERRES</b></span></span>
    <span>Publicado: <time datetime="2026-07-09">9 de julio de 2026</time></span>
    <span>Actualizado: <time datetime="2026-07-09">9 de julio de 2026</time></span>
    <span>Lectura: 7 min</span>
  </div>
  <figure class="post-cover">
    <img src="../assets/blog/cuanto-cuesta-vinilar-un-coche/cover.webp" width="1600" height="900" fetchpriority="high" alt="…">
  </figure>
</div></section>
```
`.avatar` is a chrome-gradient circle with the literal letter **S** — no author photo. Article covers use `fetchpriority="high"` and **no `loading`/`decoding`** attributes.

**Prose/layout CSS** (`assets/blog.css`): `.post-layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:56px}` (83) → single column at ≤980px (185) with `.toc{position:static}` (186); `.toc{position:sticky;top:96px;border:1px solid var(--line);background:var(--panel)}` (85), `ol` list-style none, each `a` `padding:9px 0` + bottom border (89–92); `.prose{max-width:var(--prose)}` (95) with `.prose>p:first-of-type{font-size:19px;color:var(--text)}` (96, lede styling); `.table-scroll{overflow-x:auto;margin:26px 0}` (114); `.prose table{width:100%;border-collapse:collapse;font-size:15px;min-width:520px}` (115), `th/td{padding:12px 14px;border:1px solid var(--line);text-align:left}` (116); `.faq details{border:1px solid var(--line);background:var(--panel);margin-top:10px}` (122) with `summary::after{content:"+"}` rotating 45° when `[open]` (127–129) and `summary::-webkit-details-marker{display:none}` (126); `.post-cta{margin-top:64px;border:1px solid var(--line-strong);background:var(--panel)}` (133); `.rel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px}` (146, 1px gap = hairline dividers over a `--line` background) → `1fr` at ≤980px (187); `.rel-card{background:var(--bg);padding:28px;display:flex;flex-direction:column;gap:12px}` (148) hover `background:var(--panel)` (150), children `.rk` / `h3` / `p` / `.go` (151–158).

**post-cta pattern** (identical shape in all 4):
```html
<section class="post-cta">
  <div>
    <span class="eyebrow">Presupuesto en 48 h</span>   <!-- varies: 48 h / 24 h / 24 h / "Precio cerrado en el día" -->
    <h3>Precio cerrado para tu coche</h3>
    <p>…includes full NAP: Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del Vallès (Barcelona)…</p>
  </div>
  <div class="cta-actions">
    <a class="btn" target="_blank" rel="noopener" href="https://wa.me/34649663380?text=<article-specific message>">WhatsApp <span class="arr">→</span></a>
    <a class="btn ghost" href="tel:+34649663380">+34 649 66 33 80</a>
  </div>
</section>
```
Per-article CTA headings: `Precio cerrado para tu coche` / `¿PPF, cerámico o los dos?` / `¿Quieres una cifra exacta para tu coche?` / `¿Qué nivel necesita tu interior?`

**related pattern** (`.rel-grid` 3 cards, `data-i18n-skip`): `<a class="rel-card" href="…"><span class="rk">Blog · PPF</span><h3>…</h3><p>…</p><span class="go">Leer artículo →</span></a>`. Every article links 2 sibling posts + 1 service page; the service card uses `<span class="go">Ver servicio →</span>`. Full inventory:
- art.1 → `ppf-o-ceramico-que-elegir` (Blog · Protección), `cuanto-cuesta-ppf-coche` (Blog · PPF), `../services/vinyl.html` (Servicio / "Car Wrap en SERRES" / "Cambio de color con film de fundición 3M, Avery Dennison e Inozetek desde 1.490 €.")
- art.2 → `cuanto-cuesta-ppf-coche` ("Precios reales por pack: frontal desde 890 € y carrocería completa 2.390 €."), `cuanto-cuesta-vinilar-un-coche` ("…desde acentos por 250 €…"), `../services/ceramic.html` ("Packs Esencial, Signature y Concours con durabilidad de hasta 5 años.")
- art.3 → `ppf-o-ceramico-que-elegir`, `cuanto-cuesta-vinilar-un-coche`, `../services/ppf.html` ("Packs frontal y coche completo desde 890 €, con 3 años de garantía del fabricante.")
- art.4 → `cuanto-cuesta-vinilar-un-coche` ("Desde 250 € por piezas y desde 1.490 € el cambio de color completo…"), `ppf-o-ceramico-que-elegir`, `../services/detailing.html` ("Interior y exterior en tres niveles: Refresh 35 €, Deep Clean 150 € y Showroom Reset 490 €.")

## 5.3 Article 1 — `SRC\blog\cuanto-cuesta-vinilar-un-coche.html` (450 lines)
**Head:** title `¿Cuánto cuesta vinilar un coche? Precios reales 2026` (7); description (8) `Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales, factores y tabla comparativa 2026.`; canonical (9); OG 17–27 (`og:type=article`, `og:image=…/cuanto-cuesta-vinilar-un-coche/og.jpg` 1200×630, **`article:published_time` / `article:modified_time` = `2026-07-09`**); Twitter 29–32.
**JSON-LD (3 blocks):** `Article` 40–76 — note `@type: "Article"` (not `BlogPosting` like arts. 2–3), `@id …#article`, `inLanguage: "es-ES"`, headline `¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)`, `author`/`publisher` = Organization "SERRES Wrap Center" (publisher carries logo `apple-touch-icon.png`, full PostalAddress, `telephone: "+34649663380"`); `BreadcrumbList` 79–89; **`FAQPage` 92–~138 with 5 Questions, text byte-identical to the visible `<details>` block** (comment at 91 states this rule).
**H1 (181):** `¿Cuánto cuesta <span class="chrome-text">vinilar un coche</span>? Precios reales en España (2026)`. Eyebrow `Blog · Car Wrap`. Read time **7 min**.
**TOC / H2s (with ids):** `#precio-tipo-trabajo` (227) · `#vinilado-integral-incluye` (251) · `#car-wrapping-material` (269) · `#vinilado-parcial-piezas` (288) · `#vinilo-frente-pintar` (302) · `#evaluar-presupuesto` (319) · `#faq` (339, h2 "Preguntas frecuentes sobre el precio de vinilar un coche").
**Table (232–244), 4 cols × 4 rows** — `Tipo de trabajo | Qué incluye | Mercado en España | Tarifa SERRES (IVA incl.)`:
| Tipo | Qué incluye | Mercado | SERRES |
|---|---|---|---|
| Acentos y detalles | Techo, retrovisores, pilares o molduras en negro brillo, mate o carbono | 150 – 800 € | Desde 250 € |
| Cambio de color completo (turismo) | Carrocería completa, cantos retapados, desmontaje básico de piezas | 1.200 – 2.500 € | 1.490 € |
| Cambio de color completo (SUV / gran berlina) | Más superficie, más horas de desmontaje y ajuste | 2.000 – 3.500 € | Presupuesto cerrado previo |
| Vinilado Signature | Colores especiales (color flip, satinados, texturas), desmontaje ampliado, interiores de puerta | 2.500 – 5.000 € | 1.990 € |
**Other numbers/claims:** lede 250 € – 3.500 €, "horquilla más habitual 1.400–2.000 € IVA incl." (219–225); 18–22 m de material, 25–40 h de trabajo (253); "por debajo de 1.000 € falta algún paso" (265); material explains 400–900 € del precio (270); cast film cost 500–900 €/turismo, dura 5–7 años; calandrado dura 2–3 años; acabados especiales +20–40 %; **"más de 150 colores en catálogo físico"** with 3M serie 2080 / Avery Dennison / Inozetek (284–286); parcial por pieza: techo 150–300 €, capó 180–350 €, retrovisores (par) 60–120 €, pilares 90–180 €, difusor/splitter/molduras 80–200 €, paquete acentos 250–400 € (292–299); pintura integral 3.000–6.000 € vs vinilo 1.400–2.000 €, plazo vinilo 3–5 días vs pintura ≥2 semanas (305–313); PPF cross-sell "desde 890 € el frontal, 3 años de garantía" (314–317); **"el 98 % de nuestros clientes nos recomienda, con una valoración media de 4,9"** (334–335).
**FAQ (5 `<details>`, 341–373):** ¿Cuánto dura un vinilo de coche? · ¿Vinilar el coche daña la pintura? · **¿Hay que avisar a la DGT si vinilo el coche de otro color?** (Spain-specific: ficha técnica/ITV — must be rewritten for FL/DMV) · ¿Cuánto se tarda en vinilar un coche entero? · ¿Se puede lavar un coche vinilado en el túnel?

## 5.4 Article 2 — `SRC\blog\ppf-o-ceramico-que-elegir.html` (449 lines)
**Head:** title `PPF o cerámico: ¿qué elegir? Precios y diferencias 2026` (7); description (8) `PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat (Barcelona) y decide en 5 minutos.`; canonical (9); OG 21–28 + `og:image=…/ppf-o-ceramico-que-elegir/og.jpg`, published/modified `2026-07-09`; Twitter 32–34.
**JSON-LD:** `BlogPosting` 53–75 (`inLanguage: "es"`, headline `PPF o cerámico: ¿qué elegir según tu coche y tu presupuesto?`, author Organization **"Equipo SERRES"**); `BreadcrumbList` 85–90; `FAQPage` 98–~126, 5 Questions.
**H1 (161):** `PPF o <span class="chrome-text">cerámico</span>: ¿qué elegir según tu coche y tu presupuesto?`. Eyebrow `Blog · PPF · Ceramic Coating`. Read time **8 min**.
**H2s:** `#diferencia-30-segundos` (209) · `#tabla-comparativa` (222) · `#ventajas-ppf` (247) · `#ventajas-ceramico` (267) · `#cuatro-escenarios` (289) · `#opciones-proteccion` (304) · `#criterio-taller` (324) · `#faq` (334) · **`#siguiente-paso` (369)** — this article has a 9-item TOC, uniquely with a post-FAQ section.
**Table (222–245), 3 cols × 10 rows** — `Criterio | PPF | Ceramic Coating SiO₂`:
Qué es → Lámina de poliuretano autorregenerable / Recubrimiento líquido de 1-2 µm · Impactos de gravilla → Los absorbe / No protege · Arañazos y roces → Los detiene; los leves se autorregeneran con calor / Solo microarañazos de lavado muy leves · Químicos, UV, pájaros → Protege / Protege · Hidrofobia y facilidad de lavado → Media (alta si se aplica cerámico encima) / Muy alta · Brillo → Neutro, respeta el acabado original / Aumenta la profundidad del brillo a la vista · Duración → Años de servicio · 3 años de garantía del fabricante / De 2 a 5 años según pack · Garantía en SERRES → 3 años del fabricante / Durabilidad hasta 5 años según pack · **Precio orientativo (IVA incl.) → Frontal 890 € · Pro 1.190 € · carrocería completa 2.390 € / Esencial 340 € · Signature 590 € · Concours 890 €** · Ideal para → Coches nuevos, frontales castigados… / Mantenimiento estético, uso diario, presupuestos ajustados.
**Other numbers:** "en España el PPF frontal suele moverse entre 1.500 € y 3.000 €, y el coche completo entre 4.000 € y 8.000 €" (242–243); cerámico entry 340 € → 890 € 5-year stack (278–280); escenarios: frontal 890 €, completo 2.390 €, Signature 340-590 € (291–294); "repintar un capó premium 600-900 €" (298); **ordered protection ladder (304–316): Cera/sellante 30-80 € (2-3 meses) → Cerámico 340-890 € (2-5 años) → PPF frontal 890-1.190 € → PPF completo 2.390 €**.
**FAQ (5):** ¿Se puede aplicar cerámico encima del PPF? · ¿Cuánto dura el PPF y cuánto el cerámico? · ¿El cerámico protege contra piedras y arañazos? · ¿Merece la pena poner PPF solo en el frontal? · ¿El PPF daña la pintura al retirarlo?

## 5.5 Article 3 — `SRC\blog\cuanto-cuesta-ppf-coche.html` (450 lines)
**Head:** title `¿Cuánto cuesta el PPF para tu coche? Precios reales 2026` (7); description (8) `PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía.` *(note: `890€` without space here, unlike everywhere else)*; canonical (9); OG 21–28 + `og:image=…/cuanto-cuesta-ppf-coche/og.jpg`; Twitter 32–34.
**JSON-LD:** `BlogPosting` 45–67 (`inLanguage: "es"`, headline = title, author "Equipo SERRES"); `BreadcrumbList` 77–82; `FAQPage` 90–~118, 5 Questions.
**H1 (161):** `¿Cuánto cuesta el <span class="chrome-text">PPF</span> para tu coche?`. Eyebrow `Blog · PPF`. Read time **8 min**.
**H2s:** `#que-es-ppf` (209) · `#precio-tipo-cobertura` (220) · `#ppf-frontal-precio` (243) · `#ppf-completo-precio` (260) · `#material-preparacion` (278) · `#vale-pena-ppf` (299) · `#comparar-presupuestos` (319) · `#faq` (336).
**Table (220–241), 5 cols × 4 rows** — `Cobertura | Qué protege | Precio SERRES (IVA incl.) | Rango de mercado | Plazo orientativo`:
| Cobertura | Qué protege | SERRES | Mercado | Plazo |
|---|---|---|---|---|
| Frontal | Paragolpes, tercio delantero del capó y aletas, retrovisores | **890 €** | 900–1.700 € | 1 día |
| Frontal completo | Capó y aletas íntegros, paragolpes, faros, retrovisores y pilares A | **1.190 €** | 1.500–2.500 € | 1–2 días |
| Carrocería completa | Todos los paneles pintados del vehículo | **2.390 €** | 3.100–5.000 € | 3–4 días |
| Zonas puntuales | Faros, zócalos, marcos de puerta, borde de maletero | **desde 60–150 €** | 60–300 € | 2–4 horas |
**Other numbers:** "el PPF cuesta en España entre 600 € y 5.000 €" (200); "la diferencia de 300 € suele compensar; repintar un capó 400–700 €" (256–257); **amortisation math (302–304): frontal completo 1.190 € / 5 años ≈ 240 €/año ≈ 20 €/mes; carrocería 2.390 € ≈ 40 €/mes**; "repintado de capó 600–1.000 €, lateral rayado 300–600 € por pieza" (306); cerámico cross-sell desde 340 € (315).
**FAQ (5):** ¿Cuánto cuesta el PPF frontal de un coche? · ¿Cuánto dura el PPF una vez instalado? · ¿El PPF daña la pintura al retirarlo? · ¿Qué es mejor, PPF o tratamiento cerámico? · ¿Se puede instalar PPF en un coche usado?

## 5.6 Article 4 — `SRC\blog\limpieza-tapiceria-coche-precio.html` (464 lines)
**Head:** title `Limpieza de tapicería del coche: precios y qué incluye` (7); description (8) `Cuánto cuesta limpiar la tapicería del coche: de 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas.`; canonical (9); OG 20–27 + `og:image=…/limpieza-tapiceria-coche-precio/og.jpg`; Twitter 30–32.
**JSON-LD:** `BlogPosting` 43–~78 (`inLanguage: "es-ES"`, headline = title); `BreadcrumbList` 82–87; `FAQPage` 95–~140, 5 Questions.
**H1 (181):** `Limpieza de <span class="chrome-text">tapicería</span> del coche: precios y qué incluye`. Eyebrow `Blog · Detailing`. Read time **7 min**. *(Note this file is offset +20 lines vs arts. 2–3 because the head block is longer.)*
**H2s:** `#precio-limpieza-tapiceria` (227) · `#incluye-limpieza-profesional` (255) · `#limpieza-interior-niveles` (276) · `#quitar-manchas-asientos` (297) · `#factores-precio` (320) · `#compensa-cada-opcion` (338) · `#faq` (351).
**Table (~230–253), 4 cols × 4 rows** — `Servicio | Precio de mercado | En SERRES (IVA incl.) | Qué incluye`:
| Servicio | Mercado | SERRES | Incluye |
|---|---|---|---|
| Limpieza básica interior | 25-50 € | **Refresh, 35 €** | Aspirado completo, plásticos, cristales interiores, refresco de asientos |
| Limpieza parcial (2 asientos o una fila) | 40-70 € | **—** | Solo la zona afectada, sin tratar el resto del habitáculo |
| Limpieza de tapicería completa | 70-150 € | **Deep Clean, 150 €** | Vapor + inyección-extracción en asientos, moquetas, techo y maletero |
| Detallado interior premium | 300-500 € | **Showroom Reset, 490 €** | Todo lo anterior + tratamiento de cuero, desinfección y acabado de exposición |
**Other numbers:** market 70–150 €, básicos 30-40 €, premium 400-500 € (219–221); "Deep Clean de 150 € = 3–5 horas de trabajo real; ningún servicio de 25 € puede incluirlo" (273–274); tiers by cadence: Mantenimiento 30-50 € cada 4-6 semanas / Limpieza profunda 100-150 € 1-2×año / Detallado completo 300-500 € (280–287); **"un interior degradado resta entre 300 € y 800 € al valor de reventa"** (290–291); surcharges: pelo de mascota +20-40 € (312), manchas antiguas +20-60 € (328), ozono/desinfección +30-50 € (331).
**FAQ (5):** ¿Cuánto cuesta limpiar la tapicería de un coche completo? · ¿Cuánto tarda una limpieza de tapicería profesional? · ¿La limpieza a vapor daña los asientos? · ¿Se pueden quitar todas las manchas de los asientos? · ¿Cada cuánto conviene limpiar la tapicería del coche?

---

# 6. PORT-RELEVANT FLAGS

1. **`fmtEur()` (prices.html:490)** is the single currency formatter — `Math.round(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.') + ' €'`. USD needs `'$' + n.toLocaleString('en-US')` and prefix position. It is used in three places: card `.t-val` (533), the count-up loop (492/498), and the table `tfoot` (555).
2. **English copy already exists** for every price tier, feature row, tier note, blurb and testimonial — they are the *source* strings in `PRICING` (356–462) and `TESTIMONIALS` (443–454). The port can drop the ES/CA layer entirely and ship the existing DOM snapshots replaced by the English source.
3. **Static DOM snapshots must be regenerated**, not hand-edited: `prices.html` lines 315/322/323/331/332 and `why-serres.html` line 408 are one-line pre-rendered Spanish copies of what the JS builds. If the port keeps the JS engine and strips i18n, those five nodes render English at runtime but Spanish in view-source (and to crawlers with JS disabled).
4. **`assets/serres-i18n.js` is injected unconditionally** by `serres-enhance.js:285–291`. For English-only launch, that call must be removed or the file emptied, otherwise a EN/ES/CA switcher mounts in the nav.
5. **Body-kits price inconsistency** already present: `quote:true` hides 450/1490/3490 in the UI while JSON-LD line 259 publishes `price "450" EUR`.
6. **Spain-specific content requiring US rewriting, by location:** `IVA incluido` (everywhere, incl. all 4 blog tables, the prices footer line 349 and the `.price-note` line 324); `DGT / ficha técnica / ITV` FAQ (`cuanto-cuesta-vinilar-un-coche.html:354–360` + JSON-LD 115–119); `€€` `priceRange` (`why-serres.html:241`); `addressCountry: "ES"` / `addressRegion: "Barcelona"` / `areaServed: "Barcelona"` in 6 JSON-LD blocks; `og:locale: es_ES` on all pages; `inLanguage: "es"|"es-ES"`; `lang="es"`; date format `9 de julio de 2026` / `9 jul 2026`; decimal comma (`4,9`) mixed with dot (`4.9`).
7. **OG images needed for the port:** `assets/og/` currently holds 11 JPGs (`prices, gallery, projects, why-serres, home, ppf, vinyl, ceramic, paint-correction, detailing, body-kits`); `blog/index.html` has **no dedicated OG** (reuses `home.jpg`); each blog post has its own `assets/blog/<slug>/og.jpg` + `cover.webp`.
8. **`.htaccess`** (`SRC\.htaccess`) is Apache/Hostinger-specific: `ExpiresActive Off`, `Cache-Control: no-cache, must-revalidate`, `no-store` for `.html?|.json`, `FileETag MTime Size`, woff2/woff/ttf MIME declarations. GitHub Pages ignores it — cache policy and font MIME would need another mechanism.