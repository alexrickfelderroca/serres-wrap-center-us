# SERRES US (Boca Raton) — Authoritative Implementation Plan

**Produced by:** planner, synthesising 6 recon reports + `SERRES-US-WEBSITE-SPEC_1.md` (456 lines, read in full).
**Source site (read-only, never edited):** `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`
**Spec:** `C:\Users\Rickfelder\Desktop\serres miami\SERRES-US-WEBSITE-SPEC_1.md`
**Existing pipeline:** `C:\Users\Rickfelder\Desktop\serres miami\_build`

**Governing decision (owner):** keep the Spanish site's design and stack — hand-coded vanilla HTML/CSS/JS, per-project `:root` tokens, no framework, no build step in the shipped artifact. Apply the spec's *content*: US market, USD, English-only, new SEO, new pages. Spec §3 preamble ("do not port its content… this is a rebuild, not a port") applies to **copy and prices only** — the stack/design instruction there is overruled and must not cause a downstream agent to start from zero.

---

## 0. DECISIONS TAKEN (read before anything else)

| # | Decision | Rationale |
|---|---|---|
| D1 | **URL convention: extensionless directory routes.** `/paint-protection-film` → `paint-protection-film/index.html`. Home stays `index.html`. `404.html` at root. | The source site uses literal `.html` under `pages/`, `services/`, `blog/` (16 files, 1:1, no rewrites in `.htaccess`). The spec's route table has no extensions. Directory+`index.html` gives the spec's exact URLs on every static host with zero server config, and is the only convention that survives both GitHub Pages and Netlify. |
| D2 | **All internal references become root-absolute** (`/assets/…`, `/pricing/`, `/blog/<slug>/`). | Fonts, favicons, logo and `serres-logo.css` are *already* root-absolute on all 16 pages. Making everything root-absolute deletes the depth problem created by D1 and lets us delete the `nested`/`base` logic at `assets/serres-enhance.js:21-27` (the single point of failure for every new top-level folder). **Cost: requires an apex/custom domain — a GitHub Pages *project* site would break.** See B-08. |
| D3 | **Do NOT run `_build/port/run.js` end-to-end. Reuse ~40% of it, surgically.** | Full justification in §6. |
| D4 | **Pricing lives in `assets/pricing.js`**, a UMD-shaped plain script consumed at runtime by pages *and* by Node in `_build/`. Everything else is a generated region. Full model in §4. |
| D5 | **`assets/serres-i18n.js` stays in the repo but is NOT loaded.** Remove the `loadI18n()` call (`serres-enhance.js:285-291` + its invocation at `:352`). | Satisfies spec §6.13 ("i18n-ready, do not build `/es`") at zero runtime cost. 162 KB of JS on every page would blow the §11 budget (<150 KB gz/page) and would mount an EN/ES/CA switcher. Re-enabling in December is one line + a dictionary re-harvest (needed anyway, since all US copy is new). |
| D6 | **Drop Body Kits from launch.** `services/body-kits.html` is deleted from the site and preserved only in the archived Barcelona source. | The spec has no body-kit SKU at any tier, not even `PHASE2`. A live page with no price directly contradicts the "no bait pricing" positioning that is the entire US differentiator. |
| D7 | **Merge `paint-correction` into `/detailing`; decouple ceramic pricing.** | Spec §6.6 names "Paint Correction (1–2 stage)" as a $600 detailing SKU. The source double-publishes the same 340/590/890 Offers on both `ceramic.html` and `paint-correction.html` — an existing schema defect that must not be carried. |
| D8 | **Fold `pages/projects.html` ("Exclusivo") into `/about`; keep `/gallery` as its own route.** | Exclusivo's "we don't price this" stance clashes with US positioning; its 6-discipline grid and 3-step process are good `/about` material. Gallery is not in the spec's route table but §5.3 requires a filterable `GalleryGrid` and §6.1.6 a 6-tile home preview — `pages/gallery.html` (31 shots, 10 exhibits, lightbox) is the only asset for both. |
| D9 | **Shared chrome and all price/FAQ/SEO/JSON-LD blocks become comment-delimited generated regions**, regenerated in place by `_build/regen.mjs`. The shipped HTML remains plain static HTML with no build step. | The source duplicates the header 16×, the `:root` block 12× in 4 drifting variants, and ~90 NAP occurrences. Adding 9 new pages without this would create 25 copies. `_build/` tooling is explicitly sanctioned by the global rules ("regenerable build tooling → durable `_build/`"). |
| D10 | **Design system is the Barcelona one, not spec §5.1.** Keep `#0a0a0b` + chrome/silver gradient + Barlow Condensed 700 / DM Sans 400. Reject Inter, Tailwind, `#0b1220` navy, `#2a78d6` blue. | Spec §5.2 itself says "match the *feel* of serreswrapcenter.es". Inter is on the global banned-font list; a blue-accent dark theme is the generic AI aesthetic the global rules forbid. |

---

## 1. FILE MANIFEST

Target root (**confirm before writing — see B-00**): `<US_ROOT>` — proposed `C:\Users\Rickfelder\Desktop\serres miami\serres-us-site`.
Legend: `[COPY]` copied from Barcelona unchanged · `[EDIT]` copied then modified · `[NEW]` authored from zero · `[DELETE]` present in the Barcelona tree, must not exist in the US tree.

### 1.1 Pages

| Path (relative to `<US_ROOT>`) | Mark | Note |
|---|---|---|
| `index.html` | [EDIT] | Home. Keeps hero video + 72-frame reveal canvas + service tiles; section order rebuilt to spec §6.1 (TrustBar, Packages strip, Barcelona-proven block, gallery preview, ReviewStrip, 4 FAQs). |
| `paint-protection-film/index.html` | [EDIT] | From `services/ppf.html` (989 l). Keeps 3-layer TPU diagram (`:562-583`), 4-feature block, colour carousel. Adds 4×2 tier table, Florida-reasons block, 5-step process, QuoteForm. |
| `car-wraps/index.html` | [EDIT] | From `services/vinyl.html` (1312 l). Best-preserved page: palette scroller (190 colours, 3 brands), xform, before/after slider all reusable. |
| `ceramic-coating/index.html` | [EDIT] | From `services/ceramic.html`. Decoupled from paint-correction pricing; 3 tiers → 2 SKUs; adds "ceramic vs PPF vs both" mini-table. |
| `window-tint/index.html` | [NEW] | Zero source content. Hero + SKU + **FL legal VLT table** (the spec's stated content differentiator) + 4 FAQs + QuoteForm. |
| `detailing/index.html` | [EDIT] | Merge of `services/detailing.html` (duo before/after pattern, 3-stage process) + the Stage 1/2/3 blocks from `services/paint-correction.html:529-584` and its gloss-meter (`:560-581`, 42→94 GU). |
| `pricing/index.html` | [EDIT] | From `pages/prices.html` (591 l). Tab engine, tier cards, comparison table, count-up, `.pop-tag` all reused; `PRICING` object replaced by `assets/pricing.js`; `fmtEur` → `usd()`. |
| `our-films/index.html` | [NEW] | Harvests the 3-layer diagram and brand lines; the argument (3M vs NAR, TPH vs TPU, yellowing under FL sun, warranty explainer) is 100% new. |
| `about/index.html` | [EDIT] | From `pages/why-serres.html` + folded `pages/projects.html`. 4 "standards" reframed as the 6-step Serres protocol; Barcelona 2023→2026 story new. |
| `contact/index.html` | [NEW] | Promotes `index.html:836-864` (contact meta, IG/WA, map frame) to a page; adds hours block, QuoteForm, "Se habla español · Говорим по-русски". |
| `gallery/index.html` | [EDIT] | From `pages/gallery.html`. Adds a service filter (does not exist today). Captions neutralised (Collserola → tower, masia → farmhouse). |
| `reserve/index.html` | [NEW] | **P4, October.** Shell only at launch, hidden from nav + sitemap behind `RESERVE_LIVE`. |
| `ppf-boca-raton/index.html` | [NEW] | Local lander, 400–600 unique words. Glades Rd, I-95. |
| `ppf-fort-lauderdale/index.html` | [NEW] | Local lander. US-1, I-95. |
| `ppf-pompano-beach/index.html` | [NEW] | Local lander. |
| `ppf-delray-beach/index.html` | [NEW] | Local lander. Atlantic Ave. |
| `blog/index.html` | [EDIT] | Card grid reused; 4 cards regenerated from `_build/data/blog-meta.json`. Note the source has 4 cards in a 3-col grid (orphan row) — fix to a 2-col or 4-col rhythm. |
| `blog/how-much-does-ppf-cost/index.html` | [EDIT] | From `_build/port/content/blog/how-much-does-ppf-cost.html` (already authored EN, Miami → Boca Raton, `{{PRICE:…}}` re-keyed). |
| `blog/how-much-does-a-car-wrap-cost/index.html` | [EDIT] | idem. |
| `blog/ppf-vs-ceramic-coating/index.html` | [EDIT] | idem. |
| `blog/car-upholstery-cleaning-cost/index.html` | [EDIT] | idem. |
| `privacy/index.html` | [NEW] | GA4, Meta Pixel, form data, Square off-site. `TODO(owner): have reviewed`. |
| `terms/index.html` | [NEW] | Service terms + deposit terms + warranty summary + FL sales tax. |
| `404.html` | [NEW] | Root-level so GH Pages/Netlify pick it up. Links to the 5 services + pricing + contact. |
| `services/ppf.html`, `vinyl.html`, `ceramic.html`, `detailing.html`, `paint-correction.html`, `body-kits.html` | [DELETE] | Superseded by D1/D6/D7. |
| `pages/prices.html`, `gallery.html`, `projects.html`, `why-serres.html` | [DELETE] | Superseded by D1/D8. |
| `blog/cuanto-cuesta-ppf-coche.html`, `cuanto-cuesta-vinilar-un-coche.html`, `ppf-o-ceramico-que-elegir.html`, `limpieza-tapiceria-coche-precio.html` | [DELETE] | Spanish-market EUR ranges + DGT/ITV content; cannot be translated, only replaced. |
| `PPF - Phone.html`, `SERRES - Phone.html`, `tweaks-panel.jsx`, `image-slot.js`, `frames/`, `scraps/`, `uploads/` | [DELETE] | Already excluded by `run.js:28-33`. |

### 1.2 CSS / JS / data

| Path | Mark | Note |
|---|---|---|
| `assets/serres-base.css` | [NEW] | **The single biggest structural win.** `:root` tokens (Variant A, `index.html:31-45`) + `.chrome-text` + `.gold-text` + 3-variant button system + `header.nav` + `.crumbs` + `footer` + `.reveal-up` + `prefers-reduced-motion` block. Deleted from the 11 inline `<style>` blocks. Prevents 25 drifting copies once 9 new pages exist. |
| `assets/pricing.js` | [NEW] | Spec §3 verbatim + `usd()` + helpers. See §4. |
| `assets/business.js` | [NEW] | Spec §4.3 verbatim: NAP, phone, WhatsApp, hours, IG, email, `RESERVE_LIVE`, `PHONE_LIVE`, `foundersSpotsLeft`. UMD-shaped like `pricing.js`. |
| `assets/serres-enhance.js` | [EDIT] | Delete `loadI18n()` + its call (D5). Delete the `nested`/`base`/`homeLink` logic at `:21-27` (D2). Rewrite `MENU[]` (`:29-37`) to the spec's 5 services + Pricing/Our Films/About/Contact/Reserve. Replace `WA_DIGITS/WA_TEXT/TEL_HREF/TEL_TEXT` (`:14-19`) with reads from `window.SERRES_BUSINESS`. Add the **sticky mobile bottom bar** (Call · Text · WhatsApp) — does not exist today; the current `.mobile-call` (`index.html:905`) is home-only. Add `sms_click` tracking. Fix the **981–1200px nav dead zone** (`.nav-links` hides at ≤1200px, `.srs-burger` appears only at ≤980px). |
| `assets/serres-i18n.js` | [EDIT] | Stage-20 rewrite applied (EN base, `LANGS=["en","es"]`, Catalan pruned, forward `data-en` hatch). **Not loaded.** Kept for the December `/es`. |
| `assets/fonts.css` | [EDIT] | Add **DM Sans 500/600/700** — today only 400 is loaded while CSS sets 600/700 on body-font elements, causing synthetic bolding. Keep ≤3 weights per family per §11. Regenerate via `_build/fetch-fonts.mjs`. |
| `assets/serres-logo.css` | [COPY] | |
| `assets/blog.css` | [EDIT] | Apply the `56-blog-css.js` fix (`.post-layout` `1fr` → `minmax(0,1fr)` at ≤980px — horizontal-scroll defect at 390px). Move its `:root` into `serres-base.css`. |
| `assets/quote-form.js` | [NEW] | QuoteForm: US phone validation, honeypot, 3-second min-fill timer, service `<select>` populated from `pricing.js` published items, inline success state. No form exists anywhere in the source. |
| `assets/cookie-notice.js` | [NEW] | Dismissible bar, `localStorage`-gated, link to `/privacy`. Loads pixels after first interaction or 3s idle (spec §9). |
| `assets/gallery-filter.js` | [NEW] | Service filter for `/gallery` and the home 6-tile preview. |
| `assets/fonts/*.woff2` | [COPY] + [NEW] | 20 existing + the added DM Sans weights. |
| `assets/gallery/`, `assets/gclass/`, `assets/ppf/`, `assets/vinyl/`, `assets/ceramic/`, `assets/correction/`, `assets/bodykit/`, `assets/svc/`, `assets/detailing/` | [COPY] | See B-14 (two images carry a readable Spanish plate `2383 MRZ` + `movento.es` dealer frame — must be replaced or cropped). `assets/bodykit/` kept only if D6 is reversed. |
| `assets/og/*.jpg` | [EDIT] | 11 existing; rename to the new route slugs, add `window-tint`, `our-films`, `blog`, 4 landers, `privacy`, `terms`. |
| `assets/blog/<new-slug>/` | [EDIT] | 4 directories renamed per the slug map. |
| `assets/serres-hero.mp4` | [EDIT] | **10,001,356 bytes — 2.5× over the §11 budget of 4 MB.** Must be re-encoded and given `preload="none"`. |
| `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` | [COPY] | |
| `favicon-512.png` | [EDIT] | Currently orphaned (zero references). Either wire a `site.webmanifest` or delete. |

### 1.3 Config / root

| Path | Mark | Note |
|---|---|---|
| `sitemap.xml` | [EDIT] | Regenerated: ~26 URLs on the new routes, real `lastmod` (source is frozen at `2026-07-09`). `/reserve` excluded while `RESERVE_LIVE=false`. |
| `robots.txt` | [EDIT] | New domain in the `Sitemap:` line. |
| `.nojekyll` | [NEW] | If GitHub Pages (per global deploy rule). |
| `.htaccess` | [DELETE] or [EDIT] | Hostinger-only; contains **`Cache-Control: no-store` on all HTML** (`:28`) — deliberate anti-stale on Hostinger, ruinous for the §11 CWV gate. If Netlify → `_headers` instead. Decision blocked on B-08. |
| `_headers` | [NEW] | Netlify only: font MIME + sane cache policy + `Strict-Transport-Security`. |
| `.gitignore` | [EDIT] | Drop Barcelona working folders; add `.screenshots/`, `_build/reports/`, `_build/node_modules/`. |
| `CLAUDE.md` | [NEW] | Project memory: stack, tokens, file layout, URL convention, pricing model, live URL/repo. Adapted from spec §2.3 to this stack (no npm, no TS). |
| `TODO.md` | [NEW] | Every `TODO(owner)` in one file, per spec §15.1. |
| `README.md` | [NEW] | Local dev (`node _build/serve.js`), deploy, forms setup, how to change a price. |

### 1.4 `_build/` (durable tooling, never shipped to the browser)

| Path | Mark | Note |
|---|---|---|
| `_build/regen.mjs` | [NEW] | **The spine.** Idempotent in-place regeneration of every comment-delimited region across all pages: chrome (header/footer/sticky bar), prices, FAQ (visible + JSON-LD, byte-identical), SEO head block, JSON-LD graph, NAP. |
| `_build/partials/header.html`, `footer.html`, `sticky-bar.html`, `cta-band.html`, `quote-form.html`, `trust-bar.html` | [NEW] | Source of the chrome regions. |
| `_build/data/seo.json` | [NEW] | Per-route title/description/OG/canonical (spec §8.2 pattern, prices tokenised). |
| `_build/data/faq.json` | [NEW] | Per-page FAQ items; single source for the visible `<details>` and the `FAQPage` JSON-LD. |
| `_build/data/blog-meta.json` | [EDIT] | From `_build/port/content/blog/blog-meta.json`, retargeted. |
| `_build/verify-prices.mjs` | [NEW] | Grep gate: every `$N` in shipped HTML must equal a value derivable from `assets/pricing.js`. See §4.4. |
| `_build/verify-seo.js` | [EDIT] | Inherited. Retarget the hardcoded 16-page list (`:11-19`), GA4 id (`:45`), and the Spanish banned-claims regexes (`:21-24`). Keeps the critical invariant: every FAQPage question **and** answer must also appear in visible HTML. |
| `_build/count-terms.js` | [EDIT] | Inherited, 25 acceptance greps (Barcelona, `+34`, 08174, `€`, `EUR`, `IVA`, `es_ES`, `G-1K6FYZ99GN`, `{{TOKEN`, old slugs…). Add `Miami`, `serreswrapcenter.es`, `€€`. Keep the `Miami Blue` false-positive filter (a real 3M colour at `ppf.html:841` / `vinyl.html:853`). |
| `_build/screenshots.js`, `headless.js`, `serve.js` | [COPY] | Reused verbatim. 1440×900 + 390×844@2x, reduced motion, videos paused, lazy images forced, horizontal-overflow report. |
| `_build/i18n-orphans.js`, `verify-parity.js` | [COPY] | Useful while the English base is still 1:1 with Barcelona (T02–T05); of declining value once pages are restructured. |
| `_build/port/check-blog.js` | [EDIT] | Blog QA: FAQ byte-identity, title/description length, forbidden terms, `{{PRICE:key}}` validity. Re-key to the new price ids. |
| `_build/fetch-fonts.mjs`, `optimize-images.js`, `make-logo.js`, `swap-logo.js`, `dict-tools.js` | [COPY]/[EDIT] | Inherited from the Barcelona `_build/`. `swap-logo.js` also patches the overlay-menu logo inside `serres-enhance.js:66-67` — keep in sync. |
| `_build/port/**` (run.js, 15 numbered steps, geo-map/alt-map/jsonld-map, miami.json, recon/) | [EDIT]/[DELETE] | See §6. Keep as an **archived reference tree** at `_build/legacy-port/`, not on the execution path. |

---

## 2. ROUTE TABLE

**Convention (stated explicitly, per the task requirement):** the Barcelona site uses **literal 1:1 file→URL mapping with `.html` extensions** and no rewrites (`.htaccess` contains zero `RewriteRule`). The US site **changes this to extensionless directory URLs** (D1) because the spec's route table has no extensions and directory+`index.html` achieves that on any static host with no server config. Every internal link and asset reference is **root-absolute** (D2).

| # | Spec route | Output file | Source | Phase |
|---|---|---|---|---|
| 1 | `/` | `index.html` | `index.html` | P1 |
| 2 | `/paint-protection-film` | `paint-protection-film/index.html` | `services/ppf.html` | P2 |
| 3 | `/car-wraps` | `car-wraps/index.html` | `services/vinyl.html` | P2 |
| 4 | `/ceramic-coating` | `ceramic-coating/index.html` | `services/ceramic.html` | P2 |
| 5 | `/window-tint` | `window-tint/index.html` | — NEW | P2 |
| 6 | `/detailing` | `detailing/index.html` | `services/detailing.html` + `paint-correction.html` | P2 |
| 7 | `/pricing` | `pricing/index.html` | `pages/prices.html` | P2 |
| 8 | `/our-films` | `our-films/index.html` | — NEW | P2 |
| 9 | `/about` | `about/index.html` | `pages/why-serres.html` + `pages/projects.html` | P1 |
| 10 | `/contact` | `contact/index.html` | `index.html:836-864` | P1 |
| 11 | `/reserve` | `reserve/index.html` | — NEW | P4 (Oct) |
| 12a | `/ppf-boca-raton` | `ppf-boca-raton/index.html` | — NEW | P3 |
| 12b | `/ppf-fort-lauderdale` | `ppf-fort-lauderdale/index.html` | — NEW | P3 |
| 12c | `/ppf-pompano-beach` | `ppf-pompano-beach/index.html` | — NEW | P3 |
| 12d | `/ppf-delray-beach` | `ppf-delray-beach/index.html` | — NEW | P3 |
| 13 | `/blog` | `blog/index.html` | `blog/index.html` | P3 |
| 13a | `/blog/how-much-does-ppf-cost` | `blog/how-much-does-ppf-cost/index.html` | authored EN draft | P3 |
| 13b | `/blog/how-much-does-a-car-wrap-cost` | `blog/how-much-does-a-car-wrap-cost/index.html` | authored EN draft | P3 |
| 13c | `/blog/ppf-vs-ceramic-coating` | `blog/ppf-vs-ceramic-coating/index.html` | authored EN draft | P3 |
| 13d | `/blog/car-upholstery-cleaning-cost` | `blog/car-upholstery-cleaning-cost/index.html` | authored EN draft | P3 |
| 14a | `/privacy` | `privacy/index.html` | — NEW | P3 |
| 14b | `/terms` | `terms/index.html` | — NEW | P3 |
| 15 | `/404` | `404.html` | — NEW | P1 |
| +1 | `/gallery` (not in spec; D8) | `gallery/index.html` | `pages/gallery.html` | P2 |

**Orphan check (spec §8.4, "every page reachable ≤2 clicks from home"):** header nav reaches 1–10 and 13; footer reaches 14a/14b and `/gallery`; the 4 landers are reached from each service page footer and cross-linked to each other (spec §6.11); blog posts from `/blog`.

---

## 3. ORDERED TASK LIST

Each task: **id · what changes · files · data needed · verification**. Screenshot protocol per `~/.claude/rules/web-verification.md` (Pass 1 baseline *before* editing, Pass 2 after, 1440×900 + 390×844, `.screenshots/<task-slug>/`).

### Phase 0 — workspace and mechanical English base

**T00 · Session setup and target confirmation**
- Changes: none on disk.
- Actions: `ListAgents`; if other sessions are live on this tree, message them the file list before writing anything. Confirm `<US_ROOT>` absolute path with the owner (B-00). Confirm hosting target (B-08). Load the design skills by name: `frontend-design` + `high-end-visual-design` + `redesign-existing-projects`.
- Verify: owner has stated the absolute output path in writing; `ListAgents` answered.

**T01 · Create the working tree**
- Changes: recursive copy of the Barcelona V12 tree into `<US_ROOT>`, honouring `run.js` exclusions (`.git, uploads, scraps, .screenshots, frames, node_modules`, `PPF - Phone.html`, `SERRES - Phone.html`, `tweaks-panel.jsx`, `image-slot.js`, `_build/agg-report.json`).
- Files: all.
- Data: none.
- Verify: `node _build/serve.js` + open `/` — the Spanish site renders identically to source at 1440×900 and 390×844. **This is Pass 1 for the whole project.** Store as `.screenshots/00-baseline/`.

**T02 · Flip the base language to English (one-shot, anchors still intact)**
- Changes: run `_build/i18n-port.js transform` (stage 10) then `_build/port-i18n-runtime.js` (stage 20). This rewrites every Spanish text node, `alt`/`aria-label`/`title`, `<title>`, meta description, OG/Twitter and JSON-LD string to its English dictionary key; flattens `data-en`; sets `lang="en"`, `og:locale=en_US`, `inLanguage=en-US`; converts the 790-entry dictionary from `["es","ca"]` pairs to forward EN→ES strings and drops Catalan.
- Files: all 16 pages + `assets/serres-i18n.js`.
- Data: none.
- Verify: `node _build/i18n-orphans.js --lang en` → 0 problems. Spot-check 3 pages in the browser.
- **Why now:** this is the single highest-value thing in the old pipeline and it only works while the Barcelona markup is byte-identical. Do it before any restructuring.

**T03 · Mechanical passes that are geo-neutral**
- Changes, in order: `35-alt-text.js` (55 alt rewrites) → `50-trust-signals.js` (strips the 3 `aggregateRating 4.9/50` blocks at `why-serres.html:268-272`, `body-kits.html:287-292`, `paint-correction.html:326-331`; empties `TESTIMONIALS`; removes the 4.9/50+/98% stat tiles; strips every `4.9`/`98%` sentence from the dictionary) → `56-blog-css.js` → `59-us-english.js` (40+ UK→US rules, case-preserving; `bonnet→hood`, `wings→fenders`; `grey`/`petrol` excluded because they are film colour names) → cherry-picked edits from `57-copy-fixes.js` (the `aria-label` fixes, `BMW Serie 1 → BMW 1 Series`, the dead `"Film Colours "` key). **Do not** take 57's ceramic meta-description edit (Miami-worded; the description is re-authored in T25).
- Files: all pages + `assets/serres-i18n.js` + `assets/blog.css`.
- Data: none.
- Verify: `node _build/count-terms.js` — expect remaining hits only on the still-unhandled categories (Barcelona geo, €, +34, domain, GA4). Zero `aggregateRating|reviewCount`.

**T04 · Clear Barcelona geography**
- Changes: rewrite `_build/port/geo-map.json` — 49 of 59 entries currently say "Miami"; retarget to Boca Raton. Leave the 10 geo-neutral gallery entries untouched (Collserola→Tower, Masia→Farmhouse driveway, etc.). Retarget the 8 Miami entries in `jsonld-map.json`. Run steps `30-geo-copy.js` and `38-jsonld-copy.js`.
- Files: `assets/serres-i18n.js` + all pages' text and JSON-LD.
- Data: none (Boca Raton is the confirmed market).
- Verify: `count-terms.js` reports 0 for `Barcelona`, `Sant Cugat`, `Vall[eè]s`, `Collserola`, `España|Spain` (except the intentional `sameAs`/`parentOrganization` reference to the Barcelona site). 0 for `Miami`.
- Note: the geo map deliberately **keeps** the `+34` phone (5 entries) and the EUR fragments (4 entries) for T09/T19 to handle. Do not "fix" them here.

**T05 · Freeze and re-baseline**
- Changes: none.
- Verify: `node _build/screenshots.js --pass 1 --lang en` across all pages. Write 5 concrete observations. This English-base snapshot is the reference for every later comparison. Commit point (single session only, per the parallel-session protocol).

### Phase 1 — structure

**T06 · URL restructure**
- Changes: move every page to `<route>/index.html` per §2; delete `pages/`, `services/`; convert **every** internal `href`/`src` to root-absolute; delete the `path`/`nested`/`base`/`homeLink` block at `serres-enhance.js:21-27` and every `base +` concatenation downstream; rewrite `MENU[]` (`:29-37`) to the spec nav.
- Files: all 20 HTML files, `assets/serres-enhance.js`, `sitemap.xml`, `_build/verify-seo.js` page list.
- Data: none.
- Verify: `node _build/verify-seo.js` → zero unresolvable local refs. Crawl every page in the browser and click every nav/footer/CTA link; 0 404s. `count-terms.js` reports 0 `.html"` internal hrefs (except `404.html`).

**T07 · Extract `assets/serres-base.css`**
- Changes: create the shared stylesheet from the canonical Variant A `:root` (`index.html:31-45`) plus `.chrome-text`, `.gold-text`, the 3-variant button system, `header.nav`/`.nav-inner`/`.nav-links`/`.back`, `.crumbs`, `footer`, `.reveal-up`, `.eyebrow`, `.display`, `.wrap`, and the `prefers-reduced-motion` block. Delete those rules from all 11 inline `<style>` blocks and from `blog.css`. Load order in `<head>`: `fonts.css` → `serres-base.css` → page `<style>` → `serres-logo.css` (last, as today).
- Files: `assets/serres-base.css` [NEW], all pages, `assets/blog.css`.
- Data: none.
- Verify: Pass-2 screenshots vs T05 at both viewports on all pages — **pixel-equivalent**, this is a pure refactor. Grep: exactly one `:root{` in the CSS tree (plus any deliberate page override). `body{min-height:100dvh}` everywhere (source uses `100vh` on inner pages — violates the numeric standard).

**T08 · Global chrome as generated regions**
- Changes: author `_build/partials/{header,footer,sticky-bar,cta-band,trust-bar,quote-form}.html`; wrap the corresponding spots in every page with `<!-- REGION:header -->…<!-- /REGION:header -->`; write `_build/regen.mjs` and run it. New header = full nav on **every** page (logo · Services dropdown ×5 · Pricing · Our Films · About · Contact · CTA "Reserve — Nov 13"), replacing the 15 stripped "back-link" headers. New footer adds a legal column, hours, and "Se habla español · Говорим по-русски". New sticky mobile bottom bar (Call · Text · WhatsApp), flag-gated on `PHONE_LIVE`.
- Files: `_build/regen.mjs`, `_build/partials/*`, all pages, `assets/serres-enhance.js`.
- Data: `assets/business.js` (placeholder values are fine — spec §4.3 defines them).
- Verify: 390px — no horizontal scroll on any page; sticky bar does not collide with the floating WhatsApp bubble (source already stacks `.mobile-call` at `bottom:86px` via `serres-enhance.js:122` — replicate). Keyboard: full nav traversable, dropdown opens on Enter/Space and closes on Escape, visible focus rings. Tap targets ≥44px. `regen.mjs` run twice produces an empty diff (idempotence gate).

**T09 · Pricing data model** — see §4 for the full design.
- Changes: author `assets/pricing.js` (spec §3 verbatim + `usd()` + selectors); add the `_build/regen.mjs` price-region renderer and `_build/verify-prices.mjs`; delete the `PRICING` object from `pricing/index.html` and the `fmtEur` formatter.
- Files: `assets/pricing.js` [NEW], `_build/regen.mjs`, `_build/verify-prices.mjs`, `pricing/index.html`.
- Data: **none blocked** — spec §3 supplies all 25 values.
- Verify: `node _build/verify-prices.mjs` → every `$N` in the tree traces to a `pricing.js` value. Change `full-front.priceEssential` from 1900 to 1999, run `regen.mjs`, confirm the change lands in the pricing table, the PPF page table, the home tile, the `<title>`, the meta description, the FAQ answer and the JSON-LD `Offer` — then revert.

### Phase 2 — money pages

**T10 · `/pricing`** — full list grouped by category; both PPF tiers; packages highlighted; `published:false` filtered; `price:null` → "on request"; "No bait pricing" banner + `TERMS.fromMeaning`; sticky right-rail QuoteForm (desktop); `popular` badge moved to `full-front` and `new-car`; Exclusivo teaser (`prices.html:337-345`) removed. Data: pricing.js. Verify: every published item present, no `published:false` item rendered, comparison table scrolls horizontally without breaking the page at 390px, Pass-2 screenshots.

**T11 · `/paint-protection-film`** — 4×2 coverage table, "3M Signature vs NAR Essential" block linking `/our-films`, "Why PPF in Florida" (I-95 rock chips, UV, love bugs, sand), 5-step process (wash & decon → thickness gauge → HEPA bay → install → warranty — *none of these five exists on the source page*), gallery filter, 6 FAQs (yellowing, self-healing, warranty, 1–3 days, care, removal — 3 of the source's 6 are reusable), QuoteForm. Delete the 3-year film-warranty claims (US warranty is manufacturer up-to-10-yr + 1-yr install). Verify: Rich Results Test passes `Service` + `FAQPage`; visible FAQ ≡ JSON-LD FAQ (`verify-seo.js`).

**T12 · `/car-wraps`** — options table re-cut to chrome-delete / color-change / signature-wrap / accents(on request); keep the 190-colour palette scroller and the 3-brand line; 5 FAQs; QuoteForm.

**T13 · `/ceramic-coating`** — 2 SKUs (3-Year Package $1,200 / Top-up over PPF $600); keep the Prepare/Apply/Cure process and the hydrophobic before/after (fills the spec's "hydrophobic video slot"); new "ceramic vs PPF vs both" mini-table; **delete the duplicated 340/590/890 Offers**; 5 FAQs.

**T14 · `/detailing`** — two cards (Interior Detail $300 / Paint Correction 1–2 stage $600); merge in the Stage 1/2/3 process and the 42→94 GU gloss meter from `paint-correction.html`; keep the `.duo` before/after pattern; add a compare slider; 3 FAQs. Note the source's €35 "Refresh" tier has **no US equivalent** — it disappears.

**T15 · `/window-tint`** — page from zero. Hero, SKU ($500 full car, FL-legal VLT), **Florida legal limits table** (sedans front side ≥28% / back ≥15% / rear ≥15%; SUV front ≥28% / back & rear ≥6%; windshield non-reflective above AS-1; medical exemption), 4 FAQs, QuoteForm. **The table ships behind `TODO(owner): verify against FL statute 316.2953–2956` — see B-12.** Verify: the block is visibly marked as pending owner verification, or held back entirely.

**T16 · `/our-films`** — page from zero. Why 3M · why NAR · **why we refuse cheap film** (TPH vs TPU, yellowing in 6–18 months under FL sun, no real warranty) · warranty explainer. Harvest the 3-layer TPU diagram from `ppf.html:562-583` and the brand lines from `vinyl.html:689-691`. Internal links to `/paint-protection-film` + `/pricing` (spec P2-4 DoD).

**T17 · `/gallery`** — add a service filter (`assets/gallery-filter.js`), re-tag the 10 exhibits by service, keep the lightbox. The 31 `data-note` captions are already English and fall through the removed `T()` shim as identity.

### Phase 3 — remaining pages

**T18 · Home rebuild** — section order to spec §6.1: Hero (H1 "Paint Protection Film & Detailing in Boca Raton", sub "proven in Barcelona, opening Nov 13", `CountdownBadge`) → TrustBar (3M · NAR · 1-yr warranty · Barcelona-proven) → **5** service cards each with a starting price from `pricing.js` (source has 6 tiles and no prices) → Packages strip ×3 → "Proven in Barcelona" block (**B-11**) → 6-tile gallery preview → ReviewStrip (**B-13**) → 4 FAQs → CtaBand. Keep the hero video and the 72-frame reveal canvas. Verify: exactly one `<h1>`; CWV budget met (B-15 on the 10 MB hero).

**T19 · `/about`** — Barcelona 2023→2026 story; the 6-step "Serres protocol" (thickness gauge at intake · HEPA-filtered bay · anti-static prep · filtered-air dry · gloss measurement · photo documentation — none of the six exists in the source); fold in the Exclusivo 6-discipline grid and 3-step process; opening timeline; team `TODO(owner)`.

**T20 · `/contact`** — NAP from `business.js`, hours, city-level map embed (**do not hand-synthesise a `maps/embed?pb=` blob — use `q=Boca+Raton,+FL` until the real place exists**), all contact buttons flag-gated, QuoteForm, "Se habla español · Говорим по-русски".

**T21 · `/404`, `/privacy`, `/terms`**

**T22 · Blog** — install the 4 authored EN articles with new slugs, Miami→Boca Raton throughout (**every FAQ edit twice: JSON-LD `acceptedAnswer.text` AND the visible `<details>` — `verify-seo.js:70-78` enforces byte identity**), re-key every `{{PRICE:…}}` token from the old 15-slot EUR model to the new SKU ids, rebuild `blog/index.html` cards, rename the 4 `assets/blog/<slug>/` directories. Verify: `node _build/port/check-blog.js` exits 0; zero surviving `{{` tokens.

**T23 · 4 local landers** — 400–600 unique words each, naming Glades Rd / Atlantic Ave / I-95 / US-1 and drive times; services + prices summary from `pricing.js`; 2 FAQs each; QuoteForm; `LocalBusiness` schema with `areaServed: {City}`; cross-linked. Verify (spec P3-2 DoD): no two landers share a paragraph — run a diff check.

**T24 · QuoteForm delivery** — see §5 D-06. At launch: honeypot + 3s timer + a no-backend endpoint (Formspree / Netlify Forms / Apps Script POST), *or* WhatsApp prefill with make/model if no endpoint is approved. Blocked on B-06/B-07.

### Phase 4 — SEO, analytics, performance, accessibility

**T25 · SEO regeneration** — `_build/data/seo.json` filled for all ~26 routes per spec §8.2 (titles ≤60 chars **with the starting price on money pages**; descriptions 140–155 chars with city + price + differentiator); `regen.mjs` stamps `<title>`, description, OG/Twitter, canonical into every page; `sitemap.xml` + `robots.txt` rebuilt; per-page OG images. Fix the inherited defects: no `robots` meta anywhere, `blog/index.html` canonical pointing at `/blog/index.html`, trailing-slash inconsistency in JSON-LD `url`s. Data: **domain (B-08)**. Verify: `curl` each route — unique title/description/H1; `verify-seo.js` clean.

**T26 · JSON-LD entity graph** — one `@id`-linked graph: site-wide `AutoRepair` (spec §8.3) as the single business entity, referenced by `provider` on every `Service`. Fix the inherited mess: 5 different business `@type`s across pages, `priceRange` `€€€` vs `€€` → `"$$$"`, the 2 body-placed JSON-LD blocks on `detailing.html`, breadcrumb `Servicios` target inconsistency, `Article` vs `BlogPosting`, author name inconsistency, `inLanguage` `es` vs `es-ES` → `en-US`. All Offers regenerated from `pricing.js` in USD with `valueAddedTaxIncluded` deleted. Verify: Rich Results Test passes `AutoRepair` + `FAQPage` + `Service`; zero `priceCurrency:"EUR"`; zero `valueAddedTaxIncluded`.

**T27 · Analytics** — swap `G-1K6FYZ99GN` (33 occurrences incl. `_build/verify-seo.js:45`) for the US property; **refuse to ship the Barcelona id** (step `60-seo-domain.js` already enforces this). Extend the existing per-page delegated click-tracker (the source already emits `whatsapp_click`/`phone_click`) with `sms_click`, `quote_submit`, `reserve_submit`, `deposit_click`, `pricing_view`. Cookie notice. Meta Pixel gated on B-10. Verify: GA4 DebugView shows each event.

**T28 · Performance pass to §11** — re-encode `serres-hero.mp4` to ≤4 MB + `preload="none"`; audit the 72-frame `assets/gclass/` sequence (mobile already loads even frames only) and the 200vh reveal section; confirm total JS <150 KB gz per page (trivially met once `serres-i18n.js` is not loaded); hero poster ≤120 KB; fonts max 3 weights, `font-display:swap`, self-hosted, preloaded. Verify: PSI mobile ≥85 and CWV green on `/`, `/paint-protection-film`, `/pricing`; screenshots attached.

**T29 · Accessibility + two-pass visual verification** — Chrome DevTools MCP; `axe` or Lighthouse a11y run on every route with the score captured; semantic landmarks, form labels (not placeholders), keyboard end-to-end, visible focus, `prefers-reduced-motion` disables all motion with no layout shift, body contrast ≥4.5:1 (measure by compositing on a 1×1 canvas — `color-mix`/`oklch` cannot be parsed by eye, and `textDecorationColor` is not the text). Pass-2 screenshots at both viewports against T05, every Pass-1 finding resolved. **If Chrome DevTools MCP is not connected, say so explicitly — never skip silently.**

**T30 · Deploy + project docs** — hosting config per B-08 (`.nojekyll` + delete `.htaccess` for GitHub Pages; `_headers` for Netlify); www→apex 301; `CLAUDE.md`, `TODO.md`, `README.md`. Repo `serres-wrap-center-us` under `alexrickfelderroca` (never `trvevr2-a11y`).

### Phase 5 — October/November (out of launch scope)

**T31 · NAP swap** — real address, phone, WhatsApp, hours, lat/lng, Maps place URL/embed into `assets/business.js`; `regen.mjs` propagates to all ~90 occurrences + every JSON-LD `PostalAddress` + the map embed in one run. Verify: `count-terms.js` reports 0 `+34`, 0 `08174`, 0 `Can Fatjó`; address appears everywhere from one commit.
**T32 · `/reserve`** — Founders Club, `RESERVE_LIVE` flip, Square deposit link, spots-left counter.
**T33 · P5-1 Barcelona banner** — **out of this port's scope.** Touches the live Spanish repo; requires an explicit separate go-ahead.

---

## 4. THE PRICING DATA MODEL (spec §3 in a vanilla, no-build stack)

### 4.1 The file — `assets/pricing.js`

A single plain script, UMD-shaped so the **same bytes** are the browser's source of truth and Node's:

```js
/* SERRES US — SINGLE SOURCE OF TRUTH FOR ALL PRICES.
   Nothing else in this repo may contain a dollar amount that is not
   generated from this file by _build/regen.mjs. */
(function (root) {
  var P = {};

  P.FILM_TIERS = {
    essential: { label: "Essential", film: "NAR H190 PPF",
                 note: "Self-healing 7.5-mil TPU, 10-yr film warranty" },
    signature: { label: "Signature", film: "3M Scotchgard Pro Series 200",
                 note: "3M flagship PPF, up to 10-yr 3M warranty" }
  };

  P.PPF = [ /* spec §3 verbatim: partial-front, full-front(popular), track-pack, full-body */ ];
  P.WRAPS = [ /* chrome-delete 450, color-change 3500, signature-wrap 4500, accents null */ ];
  P.CERAMIC = [ /* ceramic-3yr 1200, ceramic-topup 600 */ ];
  P.TINT = [ /* tint-full 500 */ ];
  P.DETAILING = [ /* interior 300, paint-correction 600 */ ];
  P.PACKAGES = [ /* daily-driver 1990, new-car 2990 (popular), collector 5990 */ ];
  P.PHASE2 = [ /* 5 items, all published:false */ ];
  P.TERMS = { deposit, tax, fromMeaning, warranty, quoteSpeed };

  /* --- formatting & selectors (the ONLY place a "$" is composed) --- */
  P.usd = function (n) {
    return n == null ? "on request" : "$" + Number(n).toLocaleString("en-US");
  };
  P.from = function (item, key) {              // "from $1,900" | "on request"
    var v = key ? item[key] : item.price;
    if (v == null) return "on request";
    return (item.from || key ? "from " : "") + P.usd(v);
  };
  P.groups   = function () { return { ppf:P.PPF, wraps:P.WRAPS, ceramic:P.CERAMIC,
                                      tint:P.TINT, detailing:P.DETAILING,
                                      packages:P.PACKAGES, phase2:P.PHASE2 }; };
  P.published = function (g) { return (P.groups()[g]||[]).filter(function(i){return i.published;}); };
  P.byId    = function (id) { /* flat lookup across every group, incl. PHASE2 */ };
  P.startingAt = function (g) { /* lowest published price in a group, for the home tiles */ };

  if (typeof module !== "undefined" && module.exports) module.exports = P;
  root.SERRES_PRICING = P;
})(typeof window !== "undefined" ? window : globalThis);
```

Loaded on every page that shows a price: `<script src="/assets/pricing.js" defer></script>` (≈3 KB, no parse cost worth measuring). `assets/business.js` follows the identical shape for NAP/flags.

### 4.2 How pages consume it — three tiers, in priority order

**Tier 1 — runtime rendering (interactive regions).** The `/pricing` tab engine, the PPF 4×2 coverage table, the packages strip, and the home service tiles' "from $X" read `window.SERRES_PRICING` directly. This is the existing `render()` pattern from `pages/prices.html:501-556`, kept almost intact — only the data shape and the formatter change. New branches needed, all small:
- two-price PPF row → `Essential from $X · Signature from $Y` (source has no tier axis);
- `price: null` → `"on request"` **per item** (source only supports `quote:true` per whole service);
- `published: false` → filtered out of both the DOM and the JSON-LD (source has no such flag);
- `popular: true` → reuse the existing `.pop-tag` / `.tier.popular` CSS, relabelled "Most popular".

**Tier 2 — baked static fallback (no-JS and crawlers).** Every Tier-1 region is wrapped in markers and its *default* view is written into the HTML by `_build/regen.mjs`, which loads `assets/pricing.js` via `require()` and renders the same templates server-side:
```html
<div class="tier-grid" id="tierGrid" data-price-region="pricing:ppf">
  <!-- PRICES:START pricing:ppf — generated by _build/regen.mjs, do not edit by hand -->
  …baked cards…
  <!-- PRICES:END -->
</div>
```
This replaces the source's hand-pasted 5,540-byte Spanish snapshot at `pages/prices.html:314-331`, which had **no generator at all** and which the old `85-render-snapshots.js` re-baked by driving headless Chrome. Node-side rendering is simpler, deterministic and needs no browser.

**Tier 3 — prose, meta, titles and JSON-LD (the ~174 lines that cannot be JS-rendered).** These are *also* generated regions, because a price inside `<title>` or an `Offer` cannot carry an HTML comment:
- `<title>`, `meta[name=description]`, `og:*`, `twitter:*`, `canonical` → the whole head block is delimited `<!-- SEO:START --> … <!-- SEO:END -->` and regenerated from `_build/data/seo.json`, whose strings carry `{{price:full-front.essential}}` tokens resolved against `pricing.js`.
- FAQ answers containing prices → `_build/data/faq.json` is the single source; `regen.mjs` emits **both** the visible `<details>` accordion (`<!-- FAQ:START ppf --> … <!-- FAQ:END -->`) and the `FAQPage` JSON-LD (`<script type="application/ld+json" data-gen="faq:ppf">`), guaranteeing the byte identity that `_build/verify-seo.js:70-78` already enforces. The source has this invariant but maintains it by hand across 8 pages.
- `Offer` / `hasOfferCatalog` arrays → `<script type="application/ld+json" data-gen="offers:ppf">`, fully regenerated, USD, no `valueAddedTaxIncluded`.
- `TERMS` small print → `<!-- REGION:terms -->`, stamped on every page that shows a price (spec §3 rendering rule).

`regen.mjs` is **idempotent** (running it twice produces an empty diff) and **CRLF-safe** (reuse `_build/port/lib.js`'s `editFile()`, which normalises and restores the original EOL).

### 4.3 What "no hardcoded prices outside the data file" means here

The spec's §15.2 grep gate (`no hardcoded prices outside src/data/`) is literally unachievable on a static HTML site — prices legitimately appear in prose, FAQ text, titles, meta and JSON-LD. The honest, enforceable restatement:

> **No dollar amount may be authored by hand. Every `$` in the shipped tree is inside a generated region and traces back to `assets/pricing.js`.**

### 4.4 The gate — `_build/verify-prices.mjs`

1. `require('../assets/pricing.js')` → build the set of all valid amounts and their formatted strings.
2. Scan every shipped `.html`/`.xml` for `/\$\s?\d[\d,]*/g` and for `"price"|"minPrice"|"maxPrice"` in JSON-LD.
3. **Fail** if any amount is not in the set, or sits outside a `PRICES:`/`SEO:`/`FAQ:`/`data-gen` region.
4. **Fail** if any `published:false` id appears anywhere in the shipped HTML.
5. **Fail** if any `€`, `EUR`, `IVA`, `VAT included` or `valueAddedTaxIncluded` survives.
6. **Fail** if `regen.mjs --check` reports a dirty region (i.e. someone edited generated HTML by hand).

Acceptance demo (spec P2-3 DoD): change one number in `pricing.js`, run `regen.mjs`, and the number changes on the pricing page, the service page, the home tile, the `<title>`, the meta description, the FAQ answer and the JSON-LD `Offer` — in one command.

### 4.5 Consequences the implementer must not miss

- **`_build/port/miami.json`'s 15-slot price map is obsolete.** It assumes one USD per Barcelona EUR tier. The new model has 8 PPF (4 coverages × 2 film tiers) + 4 wraps + 2 ceramic + 1 tint + 2 detailing + 3 packages + 5 phase2 = **25 values, all supplied by spec §3**. Pricing is therefore **not** an owner blocker.
- **`_build/port/40-prices.js` cannot be adapted and must be deleted from the execution path.** It is a 1:1 amount-substitution engine keyed by the *old EUR value*, with no concept of a row id, a tier matrix, a `published` flag or a bundle. It also aborts the whole pipeline today: 82 euro amounts in the four Spanish blog articles are not in its 15-tier lookup, so the moment prices are supplied it exits 1. Its only salvageable parts are the `EUR→USD` word pass, the `priceRange` swap, the VAT-clause removal and the final "no € left" gate — all of which are folded into `verify-prices.mjs`.
- Barcelona blog *ranges* ("900–1.700 €", "3.100–5.000 €") must be **cut, not converted** — they are Spanish-market data. The 4 authored EN articles already handle this; their derived arithmetic ("$1,190 / 5 years ≈ $20/month") must be **recomputed with Node**, never hand-substituted (global rule: verify every numeric result by executing it).

---

## 5. DEFERRED / NOT DOING

| id | Spec asks for | Decision | Justification |
|---|---|---|---|
| D-01 | Next.js 15 / Astro 5 (§2.1, P0-1) | **Not doing** | A framework migration *is* the rebuild the owner rejected. Vanilla already delivers every outcome the framework was chosen for — fully static HTML per route, no build step, self-hosted fonts, one external script host — and already beats the §11 budgets. Migrating would discard the scroll-canvas, the price renderer and ~13k lines of working code for no measurable gain. |
| D-02 | Tailwind CSS (§2.1) | **Not doing** | Every page is driven by `:root` design tokens and a chrome-gradient / `clip-path` vocabulary that *is* the brand. Tailwind means rewriting every class in 20+ files and flattening that vocabulary. |
| D-03 | Inter font (§2.1) | **Not doing** | On the global banned-font list. Barlow Condensed 700 + DM Sans is the brand identity, already self-hosted woff2 with preloads and already §11-compliant. |
| D-04 | `#0b1220` navy + `#2a78d6` electric blue (§5.1) | **Not doing** | Spec §5.2 itself asks to match the feel of the Spanish site. A blue-accent dark theme is precisely the generic AI aesthetic the global rules ban. Existing palette satisfies the intent. |
| D-05 | `/dev/components` Storybook route (§5.3, P1-2) | **Not doing** | Exists to keep a *typed component library* honest. There are no typed components here — there are HTML sections and `_build/partials/`. It would be a second place to keep in sync and one more page to exclude from the sitemap. |
| D-06 | Serverless form handler (§2.1, §7.4, P4-1) | **Deferred / replaced** | Contradicts "no build step" and drags the repo onto a specific host. Launch conversion runs through the existing WhatsApp/tel path (15 `wa.me` links). Ship QuoteForm against a no-backend endpoint (Formspree / Netlify Forms / Apps Script POST). Revisit when `/reserve` genuinely needs it in October. |
| D-07 | `src/data/*.ts` + `npm run build && npm run lint` (§2.3, §15.2) | **Principle kept, TypeScript form rejected** | No npm, no type-checker, no linter in this stack. The durable equivalent is §4's `assets/pricing.js` + `_build/regen.mjs` + `verify-prices.mjs` + `verify-seo.js` + `count-terms.js`. A *runtime* data layer is also wrong: it would deliver prices after first paint on a site whose entire pitch is visible prices. |
| D-08 | `analytics.ts` wrapper module (§9) | **Not doing as a module** | The site already has a per-page delegated click-tracker emitting `whatsapp_click`/`phone_click`. Extend that one function with the 5 new events rather than introducing a module system. |
| D-09 | Meta Pixel (§9, §13) | **Deferred** | No account, no id (B-10). Build the hook, ship it inert. |
| D-10 | `/reserve` + Square deposit (§7) | **Deferred to October** | Deadline is Nov 2; gated on `NEXT_PUBLIC_SQUARE_LINK`, deposit terms and the spots-left value, all owner-only. Build the shell in October; do not build the flag machinery now. |
| D-11 | The Sep 15 / Nov 2 deadlines and the P0–P5 date plan (§12) | **Informational only** | Today is 2026-09-16. The Sep 15 launch date has passed and P0–P3's targets (Aug 27 – Sep 12) are all in the past. The spec was written 2026-08-25 for a build that did not happen. Use the task IDs for *scope*, never for sequencing. |
| D-12 | P0-3 (buy/wire `serreswrap.com`) and P5-1 (banner on serreswrapcenter.es) | **Not site work** | P0-3 is a registrar/DNS action by the owner. P5-1 requires write access to the live Spanish repo — out of this port's scope and, per the parallel-session protocol, not to be touched without an explicit go-ahead. |
| D-13 | Renaming `assets/` → `public/media/`, `/content/blog/*.md` (§2.2) | **Not doing** | Markdown posts need a renderer. The blog is already 5 hand-built HTML pages with per-slug OG assets. Moving `assets/` breaks the root-absolute refs on every page. |
| D-14 | Hand-built Google Maps `embed?pb=` string | **Not doing** | That opaque parameter blob encodes a specific place id and cannot be synthesised correctly. Use a city-level `q=Boca+Raton,+FL` embed until the real listing exists (the spec's own placeholder rule). |
| D-15 | Body Kits pages/pricing | **Dropped** (D6) | No SKU in the spec at any tier. |
| D-16 | `/es` Spanish version (§6.13) | **Correctly deferred by the spec** | The engine and a 790-entry dictionary already exist and are flipped to EN-base; re-enabling is one line plus a re-harvest. Do not build `/es` now. |
| D-17 | Barcelona `aggregateRating 4.9 / 50 reviews`, the 98% claim, the 5 Spanish testimonials, `50+ coches` | **Deleted, not translated** | A US entity with zero US reviews cannot publish these. Spec §6.1.7 wants Barcelona Google review **screenshots** — an owner artefact (B-13), not re-badged strings. |
| D-18 | The spec's §3 preamble "do not port its content… this is a rebuild, not a port" | **Overruled by the owner, once, explicitly** | Flagged here so no downstream agent starts from zero. Content and prices come from the spec; design and stack come from the Spanish site. |

---

## 6. THE `_build` PORT PIPELINE: REUSE OR BYPASS

**Verdict: bypass `_build/port/run.js` as an end-to-end pipeline. Reuse roughly 40% of its parts, surgically, and archive the rest at `_build/legacy-port/` as a reference tree.**

### Why not run it

1. **It solves a different problem.** It is a 1:1 Barcelona→Miami *retarget* of 16 existing pages. This brief restructures the route table, adds 7 pages that have no Barcelona ancestor (`/window-tint`, `/our-films`, `/contact`, `/reserve`, 4 landers, `/privacy`, `/terms`), merges two pages, splits one, and drops one. **Nothing in `_build/port` creates a page** — every step edits pages the Barcelona copy already provided.
2. **Its edit contract breaks the moment markup moves.** `lib.js`'s `api.once(from,to)` throws on `NOT FOUND` / `AMBIGUOUS`, and a non-zero exit from any step aborts the whole run (`run.js:71-75`). Step 50 alone makes 5 `api.once` calls against byte-exact Barcelona markup in `why-serres.html`; step 65 makes dozens across the contact block, the 8 `<p class="phone">` lines and the footer. After T06–T08, those anchors no longer exist.
3. **Step 40 is already broken and cannot be fixed.** 82 euro amounts in the four Spanish blog articles are outside its 15-tier lookup, so it exits 1 the instant `miami.json` prices are filled. And its whole lookup strategy (resolve by old EUR value + nearest service keyword) cannot express the spec's two-tier PPF matrix, window tint, packages, `published:false` or `TERMS`. §4.5.
4. **It is targeted at Miami, not Boca Raton, in ~130 places**, including three regexes in `65-nap-schema.js` (`:127`, `:131`, `:133-134`) that are hard-coupled to the literal string "Miami" emitted by `geo-map.json` — retarget one without the other and the step throws.
5. **Its output today is wrong in a specific, misleading way**: English-base, Miami-branded, review-free — but still carrying Barcelona money (~415 `€`), phone, address, `serreswrapcenter.es` ×190, `G-1K6FYZ99GN` ×33, and **82 literal `{{PRICE:…}}` tokens visible in the shipped blog articles**.
6. **`95-project-docs.js` documents a superseded plan** (a 1:1 Barcelona port, a "Doral" SEO suggestion) in Spanish, into the site root.

### What to reuse — and exactly when

| Asset | Use | When |
|---|---|---|
| `i18n-port.js` (stage 10) + `port-i18n-runtime.js` (stage 20) | **Reuse verbatim.** This is the single highest-value thing in the pipeline: it flips 16 pages of Spanish DOM text, attributes, titles, metas and JSON-LD to English using the 790-entry dictionary. Nothing else gives this. | T02 — **must run while Barcelona markup is byte-identical** |
| `35-alt-text.js` + `alt-map.json` (55 entries, already geo-neutral) | Reuse verbatim | T03 |
| `50-trust-signals.js` | Reuse; reword the `TODO(Miami)` strings | T03 |
| `56-blog-css.js` | Reuse verbatim | T03 |
| `59-us-english.js` | Reuse verbatim (40+ UK→US rules, `grey`/`petrol` correctly excluded) | T03 |
| `57-copy-fixes.js` | **Cherry-pick 3 of 5 edits.** Skip its ceramic meta description (Miami-worded) and keep its Florida-UV softening of the vinyl FAQ claim | T03 |
| `geo-map.json` (59 entries) | **Rewrite 49 entries Miami→Boca Raton**, keep the 10 geo-neutral gallery entries, then run `30-geo-copy.js`. Cheapest way to clear 59 Barcelona strings including captions and alt text. Its entry-2 `note` is the best artefact in the tree: an exact file:line list of the inline Barcelona strings the dictionary cannot reach | T04 |
| `jsonld-map.json` (56 entries) | Retarget 8 Miami entries; note two entries carry a literal Spanish `IVA incluido` that step 40 was supposed to clean — clean it here instead. Then run `38-jsonld-copy.js` | T04 |
| `60-seo-domain.js` | Reuse verbatim (domain, GA4 with a refusal to reuse the Barcelona id, `lastmod`, hosting branch) | T25/T27/T30 |
| `content/blog/` — 4 authored EN articles + `index-cards.html` + `blog-meta.json` | Reuse as **drafts**: retarget Miami→Boca Raton (28/28/24/16 hits) and re-key the `{{PRICE:…}}` tokens | T22 |
| `check-blog.js` | Reuse, re-keyed | T22 |
| `screenshots.js`, `headless.js`, `serve.js`, `i18n-orphans.js`, `verify-parity.js`, `count-terms.js`, `i18n-allowlist.txt`, `i18n-en-only.txt` | **Reuse verbatim.** These are the verification layer and are the most valuable non-transform part of the tree | throughout |
| `lib.js` `editFile()` CRLF-safe helper | Reuse inside the new `regen.mjs` | T08 |
| `recon/*.md` (9,396 lines) | **Reference only.** `prices-currency.md` is the line-by-line index of all 415 `€`; `nap-schema-analytics.md` Appendix A dumps all 42 JSON-LD blocks verbatim; `completeness-critic.md` resolves 19 measured contradictions. Do not re-derive any of this | throughout |
| `32-seo-titles.js` | **Discard.** Its 22 hardcoded strings carry Barcelona/Miami framing and EUR prices; titles are re-authored from spec §8.2 with USD prices in them | — |
| `40-prices.js` | **Discard** (§4.5) | — |
| `58-blog.js` | **Discard the step**, keep its content and slug map — the new blog paths are directories (D1), so its `api.all` slug replacement is wrong | — |
| `65-nap-schema.js` | **Discard the step, keep its knowledge.** Its 13-field data contract and its JSON-LD `patch()` walker are the correct model; re-implement as the NAP section of `regen.mjs`, sourced from `assets/business.js`. **Fix `:99` on the way**: `areaServed` must become Boca Raton / Delray Beach / Pompano Beach / Deerfield Beach / Fort Lauderdale, not `[locality, 'Miami', 'Florida']` | — |
| `85-render-snapshots.js` | **Discard.** Its job (re-bake the static price snapshot) is done deterministically in Node by `regen.mjs`, with no headless browser | — |
| `95-project-docs.js` | **Discard.** `CLAUDE.md` / `TODO.md` are authored fresh in T30 | — |
| `miami.json` | **Discard the price half** (§4.5); keep the 13-field business contract as the template for `assets/business.js`. Rename to `business.json` / fold into `assets/business.js` | — |

---

## 7. BLOCKERS — data only the owner can supply

Ordered by how much work they gate. A spec-defined fallback, where one exists, is noted — the implementer should build against the fallback and log the item in `TODO.md` rather than stall.

| id | Item | Gates | Spec fallback |
|---|---|---|---|
| **B-00** | **Absolute output path for the deliverable** | T01 — everything | none. The launch folder is not an implicit output directory. Must be confirmed in writing before any file is written. |
| **B-01** | **US phone number** | ~8 `tel:` links, `serres-enhance.js` constants, 43 `+34` HTML lines, `telephone` in every JSON-LD, sticky mobile bar | §4.3: hide call buttons behind `PHONE_LIVE=false` |
| **B-02** | **WhatsApp number** | 15 `wa.me` links + the runtime `WA_DIGITS` constant. **This is the site's primary conversion path** — with no number there is no CTA at all | none defined. Escalate. |
| **B-03** | **Street address + ZIP** | `PostalAddress` in every JSON-LD block, the "where are you" FAQ, 8 `<p class="phone">` NAP lines, footer, `/contact` | §4.3: `"Boca Raton — Pompano Beach area · exact location announced October 2026"` |
| **B-04** | **lat/lng + Google Maps place URL / CID / embed** | `geo`, `hasMap`, the map iframe | city-level `q=Boca+Raton,+FL` embed (D-14) |
| **B-05** | **Business hours** | 2 `openingHoursSpecification` blocks, footer, `/contact`. Spec says Mon–Sat 9–6; the source says Mon–Fri 09–19 + Sat 10–14 — one confirmation, not an invention | §4.3 value, marked `TODO(owner)` |
| **B-06** | **Form delivery endpoint** (`FORM_TO_EMAIL`, sheet webhook or Formspree) | QuoteForm on 10+ pages | WhatsApp prefill with make/model (D-06) |
| **B-07** | **Email address** | footer, JSON-LD `email`, form reply-to | `info@serreswrap.com`, depends on B-08 |
| **B-08** | **Domain + hosting target** | 190 absolute `serreswrapcenter.es` URLs (canonicals, og:url, JSON-LD `@id`, breadcrumbs, sitemap, robots); **and D2**: root-absolute refs break on a GitHub Pages *project* site without a custom domain | `serreswrap.com` per §P0-3. **Decide hosting at T00 — it changes `.htaccess` vs `_headers` vs `.nojekyll` and validates D2.** |
| **B-09** | **US GA4 property id** | 33 occurrences of the Barcelona id `G-1K6FYZ99GN`. Shipping it would pollute the Spanish property | step 60 already refuses to reuse it — ships with analytics absent |
| **B-10** | **Meta Pixel id** | §9 events | build inert (D-09) |
| **B-11** | **"300+ cars protected in Barcelona since 2023"** | home §6.1.5 | `TODO(owner: confirm number)`. **Note the conflict**: the source's only comparable figures are `50+ coches` / `4.9` / `98%` — which contradict 300+ and must not be silently reconciled. |
| **B-12** | **FL tint statute values (316.2953–2956)** | the `/window-tint` legal table — the page's entire reason to exist | spec pre-fills the numbers but flags them unverified. Publishing wrong VLT limits on a legal-accuracy page is worse than not shipping the table. |
| **B-13** | **Barcelona Google review screenshots** | home ReviewStrip | §6.1.7 explicitly says screenshots at launch. Cannot be manufactured; the 5 Spanish testimonials must not be re-badged. |
| **B-14** | **Photo/video pack** | every image is Barcelona work. Legitimate as "proven in Barcelona" evidence, but: **two images carry a fully readable Spanish plate `2383 MRZ` + a `movento.es` dealer frame** (`assets/detailing/ext-before|after`), six carry an EU "E" plate band, five show Barcelona landmarks | build with Barcelona imagery + neutralised captions; flag the plate images for replacement or crop |
| **B-15** | **Hero video re-encode approval** | `assets/serres-hero.mp4` is 10 MB vs the §11 budget of 4 MB | re-encode (T28) — no owner input needed unless the source master is wanted |
| **B-16** | **Instagram handle** | 7 `sameAs` arrays + footer + overlay menu | spec guesses `instagram.com/serreswrap`; source has `instagram.com/serres.wrap.center/`. **Open question: does the US studio share the Barcelona account?** |
| **B-17** | **Sales-tax display policy** | spec says "prices exclude FL sales tax"; source says "IVA incluido" 51×. Mutually exclusive | §3 `TERMS.tax` — one confirmation removes 51 clauses |
| **B-18** | **"The only studio in Boca Raton with full transparent pricing"** | `/pricing` H1 line | `TODO(owner): confirm claim wording`. Competitive superlative, legally exposed — do not ship unconfirmed. |
| **B-19** | **Team names / roles** | `/about` | `TODO(owner)` |
| **B-20** | **Local-lander copy ×4** | `/ppf-{city}` | spec says owner supplies; build clearly-marked unique drafts meanwhile |
| **B-21** | **Privacy/terms legal sign-off** | `/privacy`, `/terms` | draft from template, `TODO(owner): have reviewed` |
| **B-22** | **Square link, deposit terms, `foundersSpotsLeft`** | `/reserve` (October) | §7.2.5 fallback text defined |

### Non-blocking design questions (ask ONE per message, wait for the answer)
Body-kits fate (drop vs unlinked archive) · Exclusivo fate (fold into `/about` vs drop) · whether `/gallery` keeps its own route · 5 service tiles (spec) vs 6 (source) on the home grid · whether the Catalan dictionary layer is deleted or kept dormant · whether the header CTA reads "Reserve — Nov 13" before `RESERVE_LIVE` flips.

---

## 8. STANDING RULES FOR THE IMPLEMENTER

1. **Design skills are mandatory and auto-applied**: `frontend-design` + `high-end-visual-design`, plus `redesign-existing-projects` (this is an upgrade of an existing site). Reference by name; never copy their text into project files. Numeric floor: `~/.claude/rules/design-system.md`.
2. **Two-pass screenshot verification on every visual change.** Pass 1 before editing, Pass 2 after, 1440×900 + 390×844, `.screenshots/<task-slug>/pass-<n>-<viewport>-<timestamp>.png`, never overwritten. Reading code is not seeing the result. If Chrome DevTools MCP is not connected, say so explicitly.
3. **Accessibility gate before any task is declared done**: WCAG 2.1 AA floor plus a real axe or Lighthouse run with the score captured.
4. **Verify every number by executing it** (Node on this machine). Never present hand-computed output as final — this applies to the blog articles' amortisation arithmetic and to every contrast ratio (composite the foreground over its background stack on a 1×1 canvas and read the pixel; `color-mix`/`oklch`/`color(srgb …)` cannot be parsed by eye, and `textDecorationColor` is not the text).
5. **Content rule**: this is a LIVE client site, not a demo. Real data only. Anything unverified becomes an explicit `TODO(owner)` in `TODO.md` — never silently shipped as real. No invented reviews, numbers, certifications or legal text.
6. **Parallel sessions**: `ListAgents` at start; announce your file list before writing; answer "is this file yours?" by reading `git diff`, never from memory; only ONE session commits, at the end, after an explicit "nothing in flight" from every other session. A finding in another session's files is **reported, not fixed**.
7. **Node, not Python** (the local Python is an MS Store stub). PDFs via headless Chrome `--print-to-pdf`. Keep any `.ps1` ASCII-only.
8. **Generate a project `CLAUDE.md`** at `<US_ROOT>` early (T30 at the latest, ideally after T09) covering stack, brand tokens, file layout, the URL convention, the pricing model, and the live URL/repo.