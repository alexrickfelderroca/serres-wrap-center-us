Read: full spec (457 lines), all 16 Spanish HTML pages' structure, the pricing engine, the i18n engine, the existing pipeline + its 8 recon reports. Nothing written.

---

# SERRES US PORT — DELTA (spec vs. Spanish V12, keeping vanilla stack)

## 0. SOURCE INVENTORY (authoritative, counted)

Root: `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`

| # | File | Lines | What it is |
|---|---|---|---|
| 1 | `index.html` | 1039 | Home. `<header class="nav">` 692-708 (only page with real nav links, 699-705) · hero video 711-733 · svcnav 6 tiles 736-790 · scroll-canvas "reveal" 793-809 (72 frames `assets/urus/`) · `home-seo` + 3 `<details>` FAQ 812-833 · CTA/contact + Maps iframe 836-864 · footer 867-903 · `.mobile-call` 905 |
| 2 | `pages/gallery.html` | 768 | 10 per-car "exhibit" rooms + lightbox. `ImageGallery` JSON-LD 267-268. **No service filter** |
| 3 | `pages/prices.html` | 591 | 5-tab × 3-tier price matrix. `PRICING` object 355-461, `fmtEur` 489, `render()` 501-556, static no-JS snapshot 314/321/322/331 |
| 4 | `pages/projects.html` | 418 | "Exclusivo" — 6 full builds/year program |
| 5 | `pages/why-serres.html` | 504 | Standards (4) 347-386 · reviews 388-412 (stats 397-399, 5 testimonials 442-453) |
| 6 | `services/ppf.html` | 989 | hero · xform · protect (4 feats + 3-layer diagram) 529-583 · color carousel 585-618 · FAQ ×6 620-694 · CTA |
| 7 | `services/vinyl.html` | 1312 | Car Wrap. palette 521-555 · xform · FAQ ×6 · film brands (3M/Avery/Inozetek) at :516, 571, 630, 640, 674, 689-691, 757, 838 |
| 8 | `services/ceramic.html` | 668 | Correction+Ceramic. process 452-482 · FAQ ×6 |
| 9 | `services/paint-correction.html` | 753 | Stage 1/2/3 polish. **Publishes the same 340/590/890 as ceramic.html** |
| 10 | `services/detailing.html` | 664 | process 398-430 · FAQ ×6 |
| 11 | `services/body-kits.html` | 699 | Aero/widebody |
| 12 | `blog/index.html` | 164 | 4 cards, `data-i18n-skip` |
| 13-16 | `blog/*.html` ×4 | 450/451/464/449 | ES articles, heavy ES-market EUR ranges |

Shared: `assets/serres-enhance.js` (358 — mobile menu `MENU[]` :29-37, WA constants :14-19, NAP line :164, float WA :191-200, count-up :209-236, i18n loader :285-291) · `assets/serres-i18n.js` (1485 — `DICT` 790 entries :31-1166, engine :1168-1485) · `assets/fonts.css` (self-hosted Barlow Condensed 700 + DM Sans 400) · `assets/blog.css` · `assets/serres-logo.css` · `sitemap.xml` (16 locs) · `robots.txt` · `.htaccess` (cache only, no rewrites) · 4 favicons + unused `favicon-512.png`.

**Things that do not exist anywhere in the source (grep-verified, count = 0):** `<form>` · window-tint / lunas / tintado content · a contact PAGE (contact is `index.html#contact` only) · an about page · 404 · privacy/terms/cookie anchors · hreflang · robots meta · any `$`/`USD` · any external CDN except `googletagmanager.com`.

---

## 1. ROUTE MAP

Vanilla stack ⇒ "routes" are file paths. Recommendation: **keep flat `.html` files but rename to the spec's slugs** so the URL carries the keyword (`/paint-protection-film.html` or a folder+`index.html` for extensionless URLs). Note `assets`, `fonts.css` and favicons are **root-relative** (`/assets/…`) on all 16 pages — flattening or nesting is safe only on a custom-domain/apex host, and breaks on a GitHub Pages *project* site.

| Spec route (§4.1) | Status | Source file | Work |
|---|---|---|---|
| `/` Home | **MAPS** | `index.html` | Keep shell + hero + reveal canvas. Section order differs from §6.1: needs TrustBar (new), Packages strip (new), "Proven in Barcelona" block (new), Gallery preview 6 tiles (new — gallery lives on its own page today), ReviewStrip (exists as a *why-serres* section, must move/duplicate), starting prices on the 6 service tiles (`index.html:736-790` tiles have **no prices**). FAQ 812-833 has 3 items, spec wants 4. Service grid is 6 tiles vs spec's 5 |
| `/paint-protection-film` | **RENAME** | `services/ppf.html` | 1:1 rename. Big content adds (§2, §3 below) |
| `/car-wraps` | **RENAME** | `services/vinyl.html` | 1:1 rename (`vinyl.html` → `car-wraps`). This is the single best-preserved page — palette, 3M/Avery/Inozetek, xform all reusable |
| `/ceramic-coating` | **RENAME + SPLIT** | `services/ceramic.html` | Rename. But the ES page is *Correction + Ceramic* and shares its 3 prices with `paint-correction.html`; the spec separates them (CERAMIC = 2 SKUs; paint correction lives under `/detailing`). Must decouple |
| `/window-tint` | **BRAND NEW** | — | Zero source content. Needs full page + the FL VLT legal table (§6.5), which is the spec's stated content differentiator |
| `/detailing` | **RENAME + MERGE** | `services/detailing.html` **+** `services/paint-correction.html` | Spec's DETAILING = Interior Detail + Paint Correction (1–2 stage). Fold the stage-1/2/3 blocks from `paint-correction.html:529-584` into the detailing page; add before/after slider (§6.6) — none exists |
| `/pricing` | **RENAME** | `pages/prices.html` | Rename. Engine survives; data model must change (§2) |
| `/our-films` | **BRAND NEW page, partial source** | — | Harvestable: 3-layer TPU diagram `services/ppf.html:562-583`; brand lines `services/vinyl.html:689-691`; "50+ colors from several professional brands". The *argument* (3M vs NAR vs why-no-cheap-film, TPU vs TPH, yellowing under FL sun) is 100% new |
| `/about` | **RENAME + REWRITE** | `pages/why-serres.html` | Shell + "Standards you can measure" (4 items, :347-386) ≈ "the Serres protocol", but the protocol's 6 named steps (thickness gauge, HEPA bay, anti-static prep, filtered-air dry, gloss measurement, photo documentation) are **not** in the source and must be written. The Barcelona 2023→2026 story is new. Consider folding `pages/projects.html` (Exclusivo) in here |
| `/contact` | **BRAND NEW page** | `index.html:836-864` | The block exists (contact meta, map iframe, IG/WA); promote to a standalone page, add QuoteForm (no form exists anywhere) and "Se habla español · Говорим по-русски" |
| `/reserve` | **BRAND NEW** | — | Founders Club. Needs a form + a `RESERVE_LIVE` flag mechanism the site has no equivalent of |
| `/ppf-boca-raton`, `/ppf-fort-lauderdale`, `/ppf-pompano-beach`, `/ppf-delray-beach` | **BRAND NEW ×4** | — | Copy is owner-supplied by spec (§6.11); build drafts |
| `/blog` (+ posts) | **MAPS, content replaced** | `blog/index.html` + 4 articles | Shell reusable. The 4 ES articles are stuffed with Spanish-market EUR ranges and DGT/ITV references (see `prices-currency.md` §1c) — cannot be translated, must be replaced. **4 EN/Florida rewrites already exist** in `C:\Users\Rickfelder\Desktop\serres miami\_build\port\content\blog\` with `{{PRICE:key}}` tokens |
| `/privacy`, `/terms` | **BRAND NEW ×2** | — | Nothing exists; no footer legal column either (`index.html:868-900` = Servicios/Taller/Síguenos) |
| `/404` | **BRAND NEW** | — | — |

### 1b. Existing Spanish pages with NO home in the spec

| File | Recommendation |
|---|---|
| `services/body-kits.html` (699 ln) | Spec has **no body kits at any price tier, not even PHASE2**. Do **not** publish at launch. Two options: (a) drop the page and the 6th home tile, drop the `bodykits` tab from `PRICING`; (b) keep as an unlinked "on request" page. Recommend (a) with the file retained unlinked — republishing later costs nothing, whereas a live page with no price contradicts the whole "transparent pricing" positioning |
| `services/paint-correction.html` (753 ln) | **Merge into `/detailing`** (spec §6.6 names it "Paint Correction (1–2 stage)" at $600). Keep the stage-1/2/3 process blocks; delete the duplicated 340/590/890 Offer JSON-LD (`:337-377`) which double-publishes ceramic's prices |
| `pages/gallery.html` (768 ln) | **Keep, retitled `/gallery`.** Spec never lists it but §5.3 requires `GalleryGrid` filterable by service and §6.1.6 a 6-tile home preview — this page is the only asset for that. It needs a service filter it doesn't have. Captions are Barcelona-specific (Collserola tower, Catalan countryside); `_build/port/geo-map.json` already holds neutralised replacements |
| `pages/projects.html` (418 ln) | "Exclusivo — 6 per year". No spec home. **Fold its content into `/about`** or drop. It clashes with the US positioning ("transparent pricing, no bait") because it is the one page that deliberately refuses to price. Also the `/pricing` page teases it at `:337-345` — that teaser must go or be repointed |
| `pages/why-serres.html` | Becomes `/about`; its **reviews block** (:388-412) becomes the home `ReviewStrip` |

### 1c. Global header/footer delta (§4.2) — larger than it looks
- Only `index.html` has nav links (`:699-705`). **All 10 sub-pages carry a stripped header** (logo + "← Todos los servicios" + one CTA — see `services/ppf.html:451-461`). The spec's header (Services dropdown · Pricing · Our Films · About · Contact · Reserve CTA) must be **added to every page**, or the ≤980px JS menu (`serres-enhance.js:29-37`) promoted to desktop.
- Mobile sticky bottom bar (Call · Text · WhatsApp) — **does not exist**. Today: a floating WA bubble on all pages (`serres-enhance.js:191-200`) + a `.mobile-call` button on `index.html:905` only. No SMS link anywhere.
- Footer: needs legal links column + hours + "Se habla español · Говорим по-русски" + `RESERVE_LIVE` awareness.

---

## 2. PRICING DELTA

### 2.1 What the site publishes today (15 numbers, EUR, VAT-inclusive)

Single interactive source: `pages/prices.html:355-461` — `PRICING = { wrap, ppf, ceramic, detailing, bodykits }`, 3 tiers each, one `price:` integer per tier, plus `rows[]` for the comparison table and `quote:true` on bodykits.

| Key | Line | EUR |
|---|---|---|
| wrap.accents / .full / .signature | 360 / 362 / 364 | 250 / 1490 / 1990 |
| ppf.front / .pro / .full | 380 / 382 / 384 | 890 / 1190 / 2390 |
| ceramic.essential / .signature / .concours | 402 / 404 / 406 | 340 / 590 / 890 |
| detailing.refresh / .deep / .showroom | 422 / 424 / 426 | 35 / 150 / 490 |
| bodykits.aero / .full / .transformation | 444 / 446 / 448 | 450 / 1490 / 3490 (never rendered — `quote:true` at :442) |

Every other price on the site is a **hard-coded duplicate** of these: 298 `€` chars on 174 lines across 14 HTML pages, 117 more in `assets/serres-i18n.js`, 41 `"priceCurrency":"EUR"`, 23 `Offer` objects, 15 `valueAddedTaxIncluded:true`, 51 occurrences of the word "IVA". Full line-by-line index already exists at `C:\Users\Rickfelder\Desktop\serres miami\_build\port\recon\prices-currency.md` §3.1-3.9 — **use it, do not re-derive**.

### 2.2 Structural mismatches — where number substitution is NOT enough

| # | Spec requirement | Source reality | Verdict |
|---|---|---|---|
| A | **PPF = 4 coverage levels × 2 film tiers** (Essential NAR H190 / Signature 3M Pro 200) = 8 prices, each card rendering "Essential from $X · Signature from $Y" | 3 tiers × **1** price each. `PRICING.ppf` has no tier axis at all | **NEW MARKUP.** `PRICING.ppf` needs `priceEssential`/`priceSignature`; `render()` (:501-556) needs a two-price branch in `.t-price` and a second `<tfoot>` row in the comparison table; `FILM_TIERS` legend block is new |
| B | **Packages** (Daily Driver $1,990 / New Car $2,990 popular / Collector $5,990) | No concept of a bundle anywhere | **NEW MARKUP.** New `PackageCard` component + a 6th tab or a dedicated section on `/pricing` + a "Packages strip" on Home (§6.1.4) |
| C | **Window Tint** SKU ($500 full car, FL-legal VLT) | No tint anywhere | **NEW** tab in `PRICING` + new page |
| D | **`published: false` PHASE2** (5 SKUs must exist in data, not render) | The renderer has no `published` flag; only `quote:true` (service-level) | **NEW LOGIC** — one filter in `render()` + in the JSON-LD emitter. Trivial but must actually be built, or the flag silently does nothing |
| E | **`price: null` → "on request"** (WRAPS "Roof / accents / custom") | `quote:true` blanks the *entire service*, per-item null unsupported | **NEW BRANCH** in `render()` :531-534 |
| F | **"Most popular" badge** | **EXISTS** — `.pop-tag` rendered at :528, CSS `.tier.popular`, text key "Most chosen"/"Más elegido" | **REUSE**, relabel to "Most popular". Move `pop` from `wrap.full`→`ppf.full-front` per §3 (`full-front` and `new-car` are the popular ones) |
| G | **US currency format `$1,900`** | `fmtEur()` at :489 emits dot-thousands + ` €`. Call sites :491, :493, :497, :532, :554 | **REPLACE** one function: `'$' + n.toLocaleString('en-US')` |
| H | **TERMS small print on every page that shows a price** | `.price-note` :324 + footer :348 on the pricing page only; elsewhere the tax claim is baked into prose as "IVA incluido" ×51 | **PARTIAL REUSE** — container exists, text is new; needs replicating onto 6 service pages + home + landers |
| I | **"No bait pricing" top banner** on `/pricing` (§6.7) | Eyebrow "Precios transparentes" :301 | **REUSE container, new copy** |
| J | **Sticky right-rail QuoteForm** on `/pricing` (§6.7) | No form, no rail | **NEW** |
| K | **Prices in money-page `<title>`** ("— from $1,000") | Titles carry no price; descriptions do on 11 pages | **NEW** title pattern (§8.2) |
| L | Prices "only from `src/data/pricing.ts`", grep-verifiable | Prices are hard-coded in ~174 HTML lines + 790-entry dictionary | **ARCHITECTURAL.** See §4.11 |

### 2.3 Price blocks to REPLACE (exact targets)

Interactive/JS: `pages/prices.html:355-461` (data), `:489` (formatter), `:501-556` (renderer), `:463`+`:525` (Spanish WhatsApp prefill), `:314/:321/:322/:331` (the static no-JS snapshot — a pasted `innerHTML` dump with **no generator**; must be re-baked by hand in EN/USD or a crawler sees Spanish EUR).

JSON-LD `Offer` blocks (all EUR → USD, drop `valueAddedTaxIncluded`): `pages/prices.html:255-259` · `services/ppf.html:327-368` · `vinyl.html:372-411` · `ceramic.html:265-286` · `paint-correction.html:338-377` · `detailing.html:598-643` · `body-kits.html:298-338`. `priceRange`: `index.html:620` `"€€€"` and `why-serres.html:242` `"€€"` (inconsistent) → `"$$$"` on both.

Visible+schema FAQ price answers (each exists **twice**, visible and in JSON-LD, and `_build/verify-seo.js:77` fails if they diverge): `index.html:658`/`:820` · `ppf.html:382`/`:657`, `:422`/`:682` · `vinyl.html:424`/`:629` · `ceramic.html:300`/`:521` · `paint-correction.html:390`/`:597`, `:422`/`:613` · `detailing.html:452`/`:524`, `:462`/`:540` · `body-kits.html:352`/`:547`.

Meta/OG/Twitter descriptions carrying prices (3 lines each, pages 7/13/20): `prices.html`, `ppf.html`, `vinyl.html`, `ceramic.html`, `detailing.html`, `body-kits.html` + 5 blog pages.

Derived arithmetic that must be **recomputed, never substituted**: `blog/cuanto-cuesta-ppf-coche.html:255, 301-303` · `limpieza-tapiceria-coche-precio.html:289-291` · `ppf-o-ceramico-que-elegir.html:277-279`.

### 2.4 Price-model reconciliation (Barcelona → spec)

| Spec SKU | Nearest ES tier | Note |
|---|---|---|
| PPF Partial Front $1,000/$1,150 | `ppf.front` €890 | coverage wording differs (spec adds fenders) |
| PPF Full Front $1,900/$2,150 **popular** | `ppf.pro` €1,190 | |
| PPF Track Pack $2,600/$2,900 | — | **new SKU** |
| PPF Full Body $4,995/$5,600 | `ppf.full` €2,390 | |
| Chrome Delete $450 | `wrap.accents` €250 | renamed/narrowed |
| Full Color Change $3,500 | `wrap.full` €1,490 | |
| Signature Wrap $4,500 | `wrap.signature` €1,990 | |
| Ceramic 3-Year $1,200 / Top-up $600 | `ceramic.*` €340/590/890 | **3 tiers → 2 SKUs**; the Essential/Signature/Concours ladder disappears |
| Tint $500 | — | **new** |
| Interior Detail $300 / Paint Correction $600 | `detailing.*` €35/150/490 + `paint-correction` | **3 tiers → 2 SKUs**; €35 Refresh has no US equivalent |
| Packages ×3 | — | **new** |
| PHASE2 ×5 | — | **new, unpublished** |
| — | `bodykits.*` ×3 | **dropped** |

⚠️ Consequence: **the 15-slot `_build/port/miami.json → prices` map is obsolete.** It assumes 1 USD per EUR tier. The new model has 8 PPF + 4 wrap + 2 ceramic + 1 tint + 2 detailing + 3 packages + 5 phase2 = 25 values, and all 25 are already given in spec §3 — so this is no longer an owner blocker, but `_build/port/40-prices.js` (which resolves occurrences by EUR lookup key + service keyword) must be re-keyed to SKU, not EUR amount.

---

## 3. CONTENT DELTA (§6.1–6.13)

| § | Page | REUSABLE as-is (after geo/lang pass) | MUST BE WRITTEN FRESH |
|---|---|---|---|
| 6.1 | Home | Hero video shell (`index.html:711-733`) · scroll-canvas "transformation" (:793-809, 72 frames) · 6-tile service grid (:736-790) · contact block (:836-864) · footer (:867-903) | H1 "Paint Protection Film & Detailing in Boca Raton" · "opening Nov 13" sub + `CountdownBadge` · **TrustBar** (3M · NAR · 1-yr warranty · Barcelona-proven) · **prices on the service tiles** · **Packages strip** ×3 · **"Proven in Barcelona" block** (needs the "300+ cars since 2023" figure — TODO owner) · **6-tile gallery preview** · **ReviewStrip** · 4th FAQ · CtaBand |
| 6.2 | `/paint-protection-film` | "Protección que no se ve" 4 feats (:529-583) ≈ the 4 icon points, but reframed · 3-layer TPU diagram (:562-583) · color carousel (:585-618) · FAQ shell ×6 | **Coverage table 4×2 tiers** · **"3M Signature vs NAR Essential" comparison block** · **"Why PPF in Florida"** (I-95 rock chips, UV, love bugs, sand — all 4 points new; the ES page argues gravilla/insectos/UV generically and can seed it) · **5-step Process** (wash&decon → thickness gauge → HEPA bay → install → warranty) — *no process section exists on this page at all* · gallery filter · QuoteForm. FAQ topics: ES has cost/duration/self-healing/process/lead-time/vs-ceramic; spec wants yellowing, self-healing, warranty, 1–3 days, care, removal → **3 of 6 reusable** |
| 6.3 | `/car-wraps` | **Best case.** palette (:521-555) · xform (:557-615) · film brands 3M/Avery/Inozetek (:689-691) · FAQ ×6 (spec wants 5) | Options table re-cut to chrome-delete / color-change / signature · QuoteForm · US-market framing |
| 6.4 | `/ceramic-coating` | process Prepara/Aplica/Cura (:452-482) · hydrophobic xform (:415-450) fills the "hydrophobic video slot" · FAQ ×6→5 | 2-SKU table (3-yr package / top-up over PPF) · **"ceramic vs PPF vs both" mini-table** (new) · QuoteForm. Decouple from paint-correction's shared pricing |
| 6.5 | `/window-tint` | Page chrome only | **Everything**: hero, options, **FL legal VLT table** (statute 316.2953–2956 — spec pre-fills the numbers but flags `TODO(owner): verify`), 4 FAQs, QuoteForm |
| 6.6 | `/detailing` | detailing process (:398-430) · interior/exterior xform (:352-396) · FAQ ×6→3 · correction stages 1/2/3 from `paint-correction.html:529-584` | 2-card layout (Interior Detail / Paint Correction) · **before-after slider** (none exists; `assets/correction/` has 6 images to seed it) · QuoteForm |
| 6.7 | `/pricing` | Tab engine · tier cards · comparison table · popular badge · count-up animation · `.price-note` | Two-tier PPF rendering · packages · tint · PHASE2 gating · "No bait pricing" banner · sticky QuoteForm rail · "only studio in Boca Raton with transparent pricing" line (TODO owner) · drop the Exclusivo teaser (:337-345) |
| 6.8 | `/our-films` | 3-layer diagram · brand names | **Whole page.** Why 3M (60 yrs, warranty that pays) · why NAR (same TPU class, savings passed on) · **"Why we refuse cheap film"** TPH vs TPU, yellowing 6-18 months under FL sun · warranty explainer. Zero source |
| 6.9 | `/about` | `why-serres.html` shell · "Estándares que puedes medir" 4 items (:347-386) · studio photos in `assets/` | **Barcelona 2023→2026 story** · **the 6-step "Serres protocol"** (thickness gauge · HEPA bay · anti-static prep · filtered-air dry · gloss measurement · photo documentation) — none of the six is on the site · team (TODO owner) · opening timeline |
| 6.10 | `/contact` | contact meta rows + IG/WA + map frame (`index.html:836-864`) | Standalone page · QuoteForm · hours block · **"Se habla español · Говорим по-русски"** · city-level map pin (the current embed is a hard-coded Barcelona `pb=` string at :858) |
| 6.11 | 4 local landers | Nothing | **400-600 unique words × 4**, each naming Glades Rd / Atlantic Ave / I-95 / US-1, drive times, 2 FAQs, `areaServed` schema, cross-links |
| 6.12 | `/blog` | `blog/index.html` shell + `assets/blog.css` (201 ln) + per-slug OG/cover images | 4 EN Florida articles — **already drafted** at `serres miami\_build\port\content\blog\` (`how-much-does-ppf-cost.html`, `how-much-does-a-car-wrap-cost.html`, `ppf-vs-ceramic-coating.html`, `car-upholstery-cleaning-cost.html`, `index-cards.html`, `blog-meta.json`). They carry `{{PRICE:key}}` tokens keyed to the **old 15-slot model** → re-key |
| 6.13 | i18n-ready, no `/es` | **Already solved and better than the spec asks.** `assets/serres-i18n.js` DICT (790 keys) + `_build/port-i18n-runtime.js` flips the base to EN with a forward EN→ES map and drops Catalan. Keep the engine loaded with `LANGS=["en"]` (no switcher) and the December `/es` is a data edit | — |

### 3.1 Content that must be DELETED, not translated
- AggregateRating 4.9/50 JSON-LD: `why-serres.html:268-272`, `paint-correction.html:326-331`, `body-kits.html:287-292` — a US entity with zero reviews cannot claim these.
- Stat tiles 4.9 / 50+ / 98% : `why-serres.html:397-399`; the 98% claim also at `blog/cuanto-cuesta-ppf-coche.html:332` and inside `detailing.html:556` JSON-LD.
- 5 Spanish testimonials `why-serres.html:442-453` (`Marc Vidal`, `Marcos Catlano`, `Daniel Roca`, `Aleix Soler`, `Núria Camps`) — spec §6.1.7 wants **Barcelona Google review screenshots**, i.e. owner-supplied real artefacts, not these strings re-badged.
- All ES-market price ranges + DGT/ITV content in the 4 blog articles (`prices-currency.md` §1c lists every line).
- 3-year film warranty claims (`ppf.html`) — spec's US warranty is manufacturer up-to-10-yr + 1-yr install.

---

## 4. THINGS IN THE SPEC THAT SHOULD **NOT** BE DONE

**4.1 Next.js 15 / Astro 5 (§2.1, P0-1).** Reject. The owner's instruction is to keep the site; a framework migration *is* the rebuild. The existing site already satisfies every outcome the framework was chosen for: fully static HTML per route, zero build step, self-hosted fonts, one external script host. Adopting Next would also throw away the scroll-canvas, the 790-key i18n engine and the price renderer — ~13k lines of working code — for no measurable gain against §11's budgets, which vanilla already beats.

**4.2 Tailwind CSS (§2.1).** Reject. Every page ships its own `<style>` block driven by `:root` tokens (`index.html:33-46`: `--bg #0a0a0b`, `--panel`, `--line`, `--text`, `--muted`, `--chrome` gradient, `--ease`). Tailwind would mean rewriting every class in 16 files and would flatten the chrome-gradient/clip-path vocabulary that is the brand.

**4.3 Inter font (§2.1).** Reject twice over. It is on the global banned-font list, and the site's identity *is* Barlow Condensed 700 uppercase + DM Sans 400, already self-hosted as woff2 with preloads (`assets/fonts.css`, 20 files in `assets/fonts/`) and already compliant with §11 (max 3 weights, self-hosted, `font-display: swap`).

**4.4 Dark premium `#0b1220` navy + `#2a78d6` electric blue (§5.1).** Reject as written. The site's palette is `#0a0a0b` near-black with a chrome/silver gradient accent. Spec §5.2 itself says "match the *feel* of serreswrapcenter.es" — so the existing palette satisfies the intent while the hex values do not. Adopting a blue accent would also make it a sibling of every other AI-default dark site.

**4.5 `/dev/components` Storybook-style demo route (§5.3, P1-2).** Skip. It exists to keep a typed component library honest in a framework repo. There are no components to catalog here — there are HTML sections. A dev route would be a second place to keep in sync and one more page to exclude from the sitemap.

**4.6 Serverless functions for forms (§2.1, §7.4, P4-1).** Defer/replace. Adding a Vercel/Netlify function contradicts "no build step" and drags the whole repo onto a different host. At launch the site's *existing* conversion path is WhatsApp/tel (15 `wa.me` links, `serres-enhance.js:14-19`), which converts better for this business than a form does. Ship the QuoteForm against a no-backend endpoint (Formspree/Netlify Forms/Apps Script POST) or, if that is unacceptable, ship WhatsApp prefill with the make/model prompt. Revisit only when `/reserve` genuinely needs it in October.

**4.7 `src/data/*.ts` single-source-of-truth + `npm run build && npm run lint` (§2.3, §15.2).** Reject the TypeScript form, **keep the principle**. There is no npm, no type-checker, no linter. The durable equivalent already exists and is proven: `_build/port/*.js` + a JSON data file, run once to stamp values into the HTML, plus `_build/verify-seo.js` and `_build/port/count-terms.js` as the grep gates. Do not introduce a runtime data layer — it would mean prices arriving after first paint on a site whose whole pitch is visible prices.

**4.8 GA4 + Meta Pixel + cookie notice (§9, P3-3).** Partially block. GA4 is already wired (`G-1K6FYZ99GN` × 32 occurrences) but that is the **Barcelona property** — it must be swapped, not reused, and the US id is owner-only. Meta Pixel has no id and no account. The `analytics.ts` wrapper is unnecessary: the site already has a per-page inline delegated click-tracker emitting `whatsapp_click`/`phone_click` (e.g. `prices.html:572-585`) — extend that one function with `quote_submit`/`reserve_submit`/`deposit_click`/`sms_click` rather than introducing a module system. Cookie notice: build it, but it is dead weight until a real analytics id exists.

**4.9 `/reserve` + Square deposit (§7, P4).** Not launch scope. Deadline is Nov 2, it is gated on `NEXT_PUBLIC_SQUARE_LINK` (owner-only), and the `foundersSpotsLeft` counter, deposit terms and refund wording are all owner text. Build the page shell in October; do not build the flag machinery now.

**4.10 The two hard deadlines (Sep 15 / Nov 2) and the P0-P5 phase plan (§12).** Treat as informational. Today is **2026-09-16** — the Sep 15 launch date in the spec has already passed and P0-P3's target dates (Aug 27 – Sep 12) are all in the past. Do not let the task IDs drive sequencing; the spec was written 2026-08-25 for a build that did not happen. Also §P0-3 (buy/connect `serreswrap.com`, wire DNS/SSL) and §P5-1 (banner on serreswrapcenter.es) are owner/registrar actions, not site work — and P5-1 touches the **live Spanish repo**, which is out of scope for this port.

**4.11 §15.2 "no hardcoded prices/phone/address outside `src/data/`".** Unachievable as a grep gate on this stack and should not be attempted by refactoring. Prices legitimately appear 174 times in prose, FAQ text, JSON-LD and meta descriptions. Replace the gate with the pipeline's own invariants: `_build/verify-seo.js` (visible FAQ ≡ JSON-LD FAQ), `count-terms.js` (0 occurrences of `€`, `IVA`, `Barcelona`, `+34`, `serreswrapcenter.es`, `G-1K6FYZ99GN` in the output), and `i18n-orphans.js`.

**4.12 Renaming `assets/` → `public/media/`, `/content/blog/*.md` (§2.2).** Skip. Markdown posts need a renderer; the blog is already 5 hand-built HTML pages with per-slug OG assets. Moving `assets/` would break the root-relative `/assets/…` hrefs on all 16 pages plus `serres-enhance.js:23`.

**4.13 "Do not port its content, prices, or language… this is a rebuild, not a port" (§3 preamble, §5.2).** Explicitly overruled by the owner. Flag it once and move on — it is the single line in the spec most likely to make a downstream agent start from zero.

**4.14 `hasMap` / Maps embed rebuild before October.** Do not hand-build a new `maps/embed?pb=…` string — that opaque parameter blob (`index.html:858`) cannot be synthesised correctly. Use a city-level `q=Boca+Raton,+FL` embed until the real place exists, per §4.3's own placeholder rule.

---

## 5. BLOCKERS — owner-only data we cannot invent

Spec-acknowledged `TODO(owner)`:

| # | Item | Spec ref | Why it blocks |
|---|---|---|---|
| 1 | **US phone number** | §4.3 `phone: "TODO(owner)"` | 8 `tel:+34649663380` links (`index.html:843/848/886/905` + 4 blog) + `serres-enhance.js:14,18-19` + 43 HTML lines with `+34` + JSON-LD `telephone` on 16 pages. Spec's own fallback: hide call buttons behind `PHONE_LIVE=false` |
| 2 | **WhatsApp number** | §4.3 | 15 `wa.me/34649663380` links + the runtime `WA_DIGITS` constant. This is the site's primary CTA — with no number there is no conversion path at all |
| 3 | **Street address + ZIP** | §1, §4.3 — "unknown until October" | `PostalAddress` in all 16 JSON-LD blocks + the visible "¿Dónde está el taller?" FAQ + 8 `<p class="phone">` NAP lines + footer. Placeholder is defined by the spec, so buildable — but the real value is October |
| 4 | **lat/lng + Google Maps place URL/CID/embed** | §8.3 `geo` | Source has `hasMap` cid `14481261717501919901` (Barcelona) and a hard-coded `pb=` embed at `index.html:858`. No US business profile exists yet |
| 5 | **Business hours** | §4.3 says `Mon–Sat 9-6` | Spec supplies a value, but it contradicts the source's two `OpeningHoursSpecification` blocks (`index.html:631-643`, M-F 09-19 + Sat 10-14). Needs one owner confirmation, not invention |
| 6 | **Instagram handle** | §4.3 `// TODO(owner): confirm handle` | Spec guesses `instagram.com/serreswrap`; source has `instagram.com/serres.wrap.center/` in 7 places. **Unresolved: does the US studio share the Barcelona account?** |
| 7 | **Email** | §4.3 `info@serreswrap.com` | Depends on the domain existing |
| 8 | **Domain** | §P0-3 | 190 absolute `serreswrapcenter.es` URLs (16 canonicals, 16 og:url, JSON-LD `url`/`@id`, breadcrumbs, sitemap, robots) |
| 9 | **GA4 property id** | §13 `NEXT_PUBLIC_GA4_ID` | 32 live occurrences of the **Barcelona** id `G-1K6FYZ99GN`. Shipping it would pollute the ES property |
| 10 | **Meta Pixel id** | §13 | No account exists |
| 11 | **Square payment link** | §13, §7.2.5 | `/reserve` deposit button. Spec's fallback text is defined |
| 12 | **`FORM_TO_EMAIL` + `SHEETS_WEBHOOK_URL`** | §13, §7.4 | Form delivery |
| 13 | **"300+ cars protected in Barcelona since 2023"** | §6.1.5 `TODO(owner: confirm number)` | Source's only comparable figures are `50+ Coches` / `4.9` / `98%` (`why-serres.html:397-399`) — which contradict 300+ and must not be silently reconciled |
| 14 | **"The only studio in Boca Raton with full transparent pricing"** | §6.7 `TODO(owner): confirm claim wording` | Competitive superlative; legally exposed |
| 15 | **FL tint statute values (316.2953-2956)** | §6.5 `TODO(owner): verify before publish` | Spec supplies the numbers but flags them unverified; publishing wrong VLT limits on a page whose whole point is legal accuracy is worse than not shipping the table |
| 16 | **Team names/roles** | §6.9 `TODO(owner)` | |
| 17 | **Photo/video pack** | §14 "owner delivers by Sep 5" | Every photo on the site is Barcelona work (`assets/gallery/` 76, `assets/gclass/` 72, `assets/urus/` 72, `assets/og/` 11, `assets/blog/` 4 slugs). Reusing them is legitimate as "proven in Barcelona" evidence but **captions naming Collserola/Catalan countryside must be neutralised** (replacements already drafted in `_build/port/geo-map.json`). The hero video `assets/serres-hero.mp4` also needs the §11 ≤4 MB / `preload=none` check |
| 18 | **Barcelona Google review screenshots** | §6.1.7, §14 | `ReviewStrip` at launch is explicitly screenshots, not re-typed text. Cannot be manufactured |
| 19 | **Final deposit terms text** | §7.2.6, §14 | |
| 20 | **`foundersSpotsLeft` starting value** | §7.2.2 | Spec says 30; owner must confirm the offer is live |
| 21 | **Hosting target** | §2.1 | Source ships a Hostinger `.htaccess`; the global rule says GitHub Pages + `.nojekyll`. **Root-relative `/assets/…`, `/favicon.ico`, `/assets/fonts/*.woff2` on all 16 pages break on a GitHub Pages project site** — needs a custom domain or 6 href rewrites per page. This is a decision, and it changes files |
| 22 | **Sales-tax display policy** | §3 `TERMS.tax` | Spec says "prices exclude FL sales tax"; source says "IVA incluido" 51×. Mutually exclusive — one owner confirmation removes 51 clauses |
| 23 | **Privacy/terms legal review** | §10 `TODO(owner): have reviewed` | Templates can be drafted; sign-off cannot |
| 24 | **Barcelona-site banner (P5-1)** | §12 P5 | Requires write access to the live `serreswrapcenter` repo — out of this port's scope, and per parallel-session rules must not be touched without an explicit go-ahead |

### 5.1 Non-blocking but decision-required (design questions, one per message)
Body-kits fate (drop vs unlinked) · Exclusivo/projects fate · whether `/gallery` keeps its own route · 6 service tiles vs the spec's 5 · whether the Catalan language layer is deleted or kept dormant · whether `pages/` and `services/` folders survive or the tree flattens for spec-shaped URLs.

### 5.2 Pipeline retargeting note
`C:\Users\Rickfelder\Desktop\serres miami\_build\` is reusable but **targets "Miami", not Boca Raton**, and predates this spec. Needs: `port/geo-map.json` (every `newEn`/`newEs` says Miami), `port/miami.json` (rename + 15-slot price map now obsolete, see §2.4), `port/32-seo-titles.js`, `port/30-geo-copy.js`, `port/38-jsonld-copy.js`, `port/65-nap-schema.js`, and the 4 blog drafts' `{{PRICE:key}}` tokens. `port/40-prices.js` resolves occurrences by EUR-amount + service keyword — that lookup strategy does not survive the SKU remodel and must be re-keyed. Steps 50/55/56/57/59/85/95 are geo-neutral and carry over unchanged.