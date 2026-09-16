# SERRES port pipeline — full recon

Root: `C:\Users\Rickfelder\Desktop\serres miami\_build`
Source (read-only): `C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12` (16 HTML pages, vanilla, no build step)
Environment verified: Node **v26.3.0**, Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe` (both required by steps 85 and the verification tools).

---

## 1. Layout

```
_build/
  i18n-port.js            319 l  HTML tokenizer + ES→EN inline transform (stage 10)
  port-i18n-runtime.js    154 l  rewrites assets/serres-i18n.js engine (stage 20)
  i18n-orphans.js         222 l  verification: live-DOM orphan checker
  verify-parity.js         71 l  verification: BCN-vs-port text diff
  count-terms.js           60 l  verification: acceptance greps
  screenshots.js           51 l  verification: pass-1/pass-2 captures
  headless.js              79 l  shared serve + CDP helpers (no deps)
  serve.js                 22 l  static preview server
  apply-jsonld-review.js   51 l  one-off generator for port/jsonld-map.json (already run)
  i18n-allowlist.txt       45 l  neutral proper nouns for the orphan checker
  i18n-en-only.txt          5 l  globs for EN-only pages (the 4 new blog slugs)
  port/
    run.js                 75 l  orchestrator
    lib.js                141 l  shared edit/dict helpers
    30,32,35,38,40,50,55,56,57,58,59,60,65,85,95-*.js   the 15 steps
    geo-map.json          334 l / 59 entries
    alt-map.json          442 l / 55 entries
    jsonld-map.json       395 l / 56 entries
    miami.json             50 l  the client-data file — ALL nulls today
    check-blog.js          77 l  standalone QA of the authored blog content
    content/blog/          4 authored EN articles + index-cards.html + blog-meta.json
    recon/                 8 .md notes (9.4k lines total) + apply-jsonld-review.js copy
```

---

## 2. `port\run.js` — orchestrator

`node run.js --src "<V12 root>" --dest "<target root>" [--upto NN] [--only NN] [--skip-copy]`

1. `copyTree()` (l.35–47): recursive copy, refuses if dest is inside src. `EXCLUDE_DIRS` = `.git, uploads, scraps, screenshots, .screenshots, frames, node_modules` (l.28). `EXCLUDE_FILES` = `PPF - Phone.html, SERRES - Phone.html, tweaks-panel.jsx, image-slot.js` (l.29). `EXCLUDE_PATHS` = `_build/agg-report.json`, `_build/optimize-porsche-gallery.js` (l.30–33). `.gitignore` and `.htaccess` ARE copied.
2. `installTools()` (l.49–59): copies 9 tool files into `dest/_build/`, every `*.js|json|txt|html` in `_build/port/` into `dest/_build/port/`, and `content/` via `cpSync`. `recon/` is NOT copied (no extension → filtered out).
3. `node dest/_build/i18n-port.js transform <DEST> <DEST>` when `UPTO>=10`. **Note: run.js passes no 4th arg, so `i18n-allowlist.txt` is never handed to the transform** (l.68) — affects only ORPHAN reporting, not writes.
4. `node dest/_build/port-i18n-runtime.js <DEST>` when `UPTO>=20`.
5. every `dest/_build/port/NN-*.js` matching `/^\d\d-.*\.js$/`, string-sorted, each invoked as `node <step> <DEST>` with `cwd=DEST` and `stdio:'inherit'` (l.61–64, 71–75). **Any non-zero exit throws and aborts the whole run.**

---

## 3. `port\lib.js` — the edit contract

- `editFile(file, fn)` — normalises CRLF→LF, runs `fn(src, api)`, writes back with the **original EOL**. This is why every step is CRLF-safe.
- `api.once(from,to,label)` — must match exactly once, else `NOT FOUND` / `AMBIGUOUS` throw.
- `api.re(regex,to,label,count=1)` — must match exactly `count` times.
- `api.all(from,to,min=0)` — replace-all, returns count, throws if `< min`.
- `loadDict(root)` / `dictBounds()` — brace-matches `var DICT = {` in `assets/serres-i18n.js` and `new Function`-evals it. Requires the dictionary to stay a plain object literal.
- `addEntries(root, section, entries)` — appends `"en": "es",` lines under a section comment; throws on value conflict for an existing key.
- `renameEntries(root, htmlFiles, changes)` — renames a dictionary key and/or value, then replaces the old key text in HTML **whole-value only**, via `(?<=[>"'\`]\s*)…(?=\s*[<"'\`])` (l.108–113), in both raw and entity-encoded forms. Throws `renameEntries: unknown keys` if any `en` is not in the dictionary.
- `pages(root)` — `PAGES_STATIC` (11 main pages + `blog/index.html`, l.118–124) plus every `blog/*.html` discovered at runtime, so it survives the slug rename.
- `textFiles(root)` — every `.html|js|mjs|css|xml|txt|json|md|.htaccess` under root.

---

## 4. Stage 10 — `_build\i18n-port.js` (`transform`)

Hand-rolled HTML tokenizer (no DOM lib, by design — none is installed and the brief forbids new deps). Mirrors `assets/serres-i18n.js` binding rules exactly: text nodes (not in `SCRIPT/STYLE/TEXTAREA`, not under `[data-i18n-skip]`, not under a `[data-en]` parent), attributes `aria-label`/`title`/**`alt`**, `<title>`, `meta[name=description]` + OG/Twitter title/description, and `affix()` (trim + one wrapping quote pair).

What it writes (l.211–271):
- every Spanish string found in the inverted ES→EN index is replaced by its **English dictionary key** inline;
- `data-en="key"` elements are flattened: attribute removed, key becomes the text;
- inside `<script type="application/ld+json">`, Spanish string values mapped to EN keys; `inLanguage: es|es-ES → en-US`;
- `<html lang="es"> → lang="en"`, `og:locale es_ES → en_US`.
- Reports to `dest/_build/reports/i18n-port/` incl. `_orphans.txt` and `_jsonld-unmapped.json` (that file is what `jsonld-map.json` was authored from).

`PAGES` (l.21–29) hardcodes the **four Spanish blog slugs** — correct, because this runs before `58-blog.js`.
No Miami geography here (one comment mention, l.1).

---

## 5. Stage 20 — `_build\port-i18n-runtime.js`

One-shot migration of `assets/serres-i18n.js`, every edit asserted-once (aborts without writing on any miss):
1. `LANGS ["en","es","ca"] → ["en","es"]`, `LABELS` without `ca`, default lang `"es" → "en"` (l.58–60).
2. Prunes Catalan: `"key": ["es","ca"] → "key": "es"`, and **verifies the pruned count equals the key count** (l.46–54).
3. Deletes the whole INV inverted-index block and replaces `enKeyOf()` with `DICT.hasOwnProperty(core) ? core : null` (l.63–71).
4. `tr()` reads string values (l.74–86).
5. Adds `alt` to `ATTRS` and to the attribute selector (l.89–90) — this is what makes `35-alt-text.js` work.
6. Turns `data-en` into a **forward-mode hatch**: element keeps its own EN text, renders `DICT[key]` in ES (l.95–114). Used by `58-blog.js` for `The (blog)`.
7. Rewrites the header comments. Final sanity: file parses, all dict values are strings.

No Miami geography (2 comment mentions).

---

## 6. The 15 numbered steps

Legend: **HARDCODED-MIAMI** = strings that must be retargeted to Boca Raton / Pompano Beach / Delray Beach / Deerfield Beach / Fort Lauderdale.

### `30-geo-copy.js` (25 l)
- **Does**: loads `geo-map.json`, guards against duplicate/clashing target keys, then one `renameEntries()` call that renames 59 dictionary keys + values and rewrites every whole-value inline occurrence across `pages(root)`.
- **Touches**: `assets/serres-i18n.js` + all 16 pages.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: all of it lives in `geo-map.json` (§7 below) — 49 of 59 entries contain "Miami"/"Florida". The step code itself is geo-agnostic.
- Skips cleanly with `SKIPPED — geo-map.json not present yet` if the map is deleted.

### `32-seo-titles.js` (83 l)
- **Does**: rewrites `<title>` + `meta description` (EN key and ES value) for the **11 non-blog pages**. Anchors on the page's *current* title/description text, asserts it is a dictionary key (`throw` otherwise, l.72), then `renameEntries`. Exits 1 if a rename produced no inline replacement (l.82–83).
- **Touches**: `assets/serres-i18n.js` + all pages.
- **miami.json inputs**: none — the prices in its descriptions are **literal EUR strings** (`from €890`, `desde 890 €`), left for `40-prices.js` to convert.
- **HARDCODED-MIAMI**: the whole `SEO` object, l.17–62, **30 "Miami"/"Florida" occurrences** across 22 strings (11 titles ×2 langs, 11 descriptions ×2 langs). Only 3 of 11 titles and 3 of 11 descriptions overlap with `geo-map.json` — **this step, not the geo map, is authoritative for the 11 main pages' title/description**. Retargeting must change both files consistently or step 32 will silently re-Miami-ify what step 30 set.
- Note l.28–29 and 36 also embed EUR price claims and the "VAT included / IVA incluido" clause that step 40 strips.

### `35-alt-text.js` (40 l)
- **Does**: for each `alt="…"` in `pages(root)`, looks the decoded value up in `alt-map.json` (by `es` or already-`en`) and rewrites it to English; then `addEntries()` registers `"<en>": "<esNew||es>"` so the ES switcher translates alt. Exits 1 if any map entry never matched an attribute.
- **Touches**: 16 pages + `assets/serres-i18n.js`.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: none in the step; `alt-map.json` is deliberately **geo-neutral** — 7 entries neutralise Barcelona cues (Collserola tower → "a communications tower", "taller SERRES de Sant Cugat" → descriptive scene text). Safe to keep as-is for Boca Raton.

### `38-jsonld-copy.js` (38 l)
- **Does**: parses every `<script type="application/ld+json">` on every page, walks it, replaces exact Spanish string values found in `jsonld-map.json` with EN, re-serialises with `JSON.stringify(obj,null,2)`. These are the JSON-LD strings that have no i18n key (Service/Offer names & descriptions, gallery names, Person names).
- **Touches**: JSON-LD blocks in the 16 pages.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: inside `jsonld-map.json` — **8 of 56 entries** carry "Miami"/"Florida" in their `en` (§8).
- Header comment l.4 wrongly says blog articles are handled by `80-blog.js` (the file is `58-blog.js`).

### `40-prices.js` (114 l) — see the deep dive in §10
- **Does**: EUR→USD across every text file except `_build/`. Four replacement passes (symbol amounts, JSON-LD `price|minPrice|maxPrice`, `price:N,` in the prices.html `PRICING` object, `data-price="N"`), plus `priceCurrency EUR→USD`, `priceRange €€/€€€ → $$$`, `\bEUR\b → USD`, removal of "VAT included / IVA incluido / taxes included" clauses and `valueAddedTaxIncluded`, and the `fmtEur` → US formatter swap (l.104–105).
- **Touches**: everything shipped (HTML, `assets/serres-i18n.js`, `assets/serres-enhance.js`, sitemap…).
- **miami.json inputs**: **`prices.*.usd` — all 15 integers required**. `prices.*.eur` is only the lookup key.
- **Guard (l.20–21)**: if any `usd` is not an integer → `SKIPPED` + `exit 0`. **Everything in this step is behind that guard**, including the currency-word, VAT and formatter conversions.
- **HARDCODED-MIAMI**: only a comment (l.1). Geo-neutral.

### `50-trust-signals.js` (92 l)
- **Does**: (1) removes the 3 `aggregateRating` blocks (`pages/why-serres.html`, `services/body-kits.html`, `services/paint-correction.html`) via `api.re(/,\s*"aggregateRating":\s*\{[^}]*\}/)`; (2) on `pages/why-serres.html` swaps the hero stats `50+ Cars Transformed / 4.9 Average Rating / 1 Workshop` → `1 Standard / 100% Hand Finished / 0 Cut Corners`, adds `hidden` + a TODO to the reviews section, deletes `.rv-stats` and the pre-rendered cards, empties `TESTIMONIALS=[]`; (3) deletes the 5 Barcelona testimonials' dictionary entries plus the dead key `"BMW M2 · Owner"`; (4) `addEntries` `Standard→Estándar`; (5) finds every dictionary key/value matching `/4[.,]9|98 ?%/` and strips the sentence carrying it, appending "That is why our clients recommend us." / "Por eso nuestros clientes nos recomiendan.", then **exits 1 if any rating claim survives**.
- **Touches**: `pages/why-serres.html`, `services/body-kits.html`, `services/paint-correction.html`, `assets/serres-i18n.js`.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: only in comments and the injected TODO text (`TODO(Miami)` at l.45, 52) and the `addEntries` section label (l.72). Cosmetic; should be reworded but is not functional.
- Brittle: 5 `api.once` calls with byte-exact Barcelona markup — any upstream change to `why-serres.html` breaks the step.

### `55-build-tools.js` (54 l)
- **Does**: patches the **inherited** `_build/verify-seo.js` (adds English banned-claim regexes next to the Spanish ones), rewrites `_build/dict-tools.js` for string values instead of `[es,ca]` pairs (9 `api.once` edits, l.33–43), and edits `.gitignore` (removes Barcelona working folders, adds `_build/reports/`).
- **Touches**: `_build/verify-seo.js`, `_build/dict-tools.js`, `.gitignore` in the DEST tree. Both source files confirmed present in the V12 `_build/`.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: comments only.
- Note: it does **not** patch `verify-seo.js`'s hardcoded `G-1K6FYZ99GN` (that is `60`) nor its hardcoded Spanish blog slugs (that is `58`).

### `56-blog-css.js` (17 l)
- **Does**: one `api.once` on `assets/blog.css`: `.post-layout{grid-template-columns:1fr}` → `minmax(0,1fr)` at the ≤980px breakpoint, fixing an inherited horizontal-scroll defect at 390px (the `.prose table` has `min-width:520px`).
- **Touches**: `assets/blog.css`.
- **miami.json inputs**: none. **HARDCODED-MIAMI**: none. Fully reusable.

### `57-copy-fixes.js` (53 l)
- **Does**: one-off English fixes the mechanical transform can't reach — `aria-label="Servicios SERRES"` → `"SERRES services"` (index), the `EN / ES / CA` comment in `serres-enhance.js`, deletion of the dead key `"Film Colours "`, `aria-label="Elige un servicio"` → `"Choose a service"` (prices, inside a skip zone), `BMW Serie 1` → `BMW 1 Series` (gallery), `addEntries` for the two new keys; then **two content rewrites**: the vinyl FAQ "last between 5 and 7 years outdoors" claim softened for Florida UV, and the ceramic meta description rewritten to drop the banned "liquid-glass" claim.
- **Touches**: `index.html`, `assets/serres-enhance.js`, `assets/serres-i18n.js`, `pages/prices.html`, `pages/gallery.html`, plus `renameEntries` across all pages.
- **miami.json inputs**: none.
- **HARDCODED-MIAMI**: l.36/38 — "**under Florida's year-round sun and heat…**" (fine for Boca Raton, Florida is still correct); l.48/49 — "**Ceramic Coating in Miami: …**" / "**Ceramic Coating en Miami: …**" → must become Boca Raton. 7 Miami/Florida hits total.

### `58-blog.js` (83 l)
- **Does**: (1) deletes the 4 Spanish articles, writes the 4 authored EN articles from `port/content/blog/`, renames `assets/blog/<old>/` → `<new>/`; (2) resolves `{{PRICE:key}}` tokens from `miami.json`; (3) `api.all` replaces the 4 old slugs everywhere outside `_build/port|reports` (sitemap, `verify-seo.js` PAGES, `optimize-images.js` BLOG map, dictionary, index, `webp-manifest.json`); (4) rebuilds `blog/index.html` (cards, `data-en="The (blog)"` H1 hatch, title/description/OG/Twitter from `blog-meta.json`, JSON-LD `inLanguage: en-US`); (5) `addEntries` for the index title/description and 4 breadcrumb crumbs.
- **Slug map** (l.20–25): `cuanto-cuesta-ppf-coche→how-much-does-ppf-cost`, `cuanto-cuesta-vinilar-un-coche→how-much-does-a-car-wrap-cost`, `ppf-o-ceramico-que-elegir→ppf-vs-ceramic-coating`, `limpieza-tapiceria-coche-precio→car-upholstery-cleaning-cost`.
- **miami.json inputs**: `prices.*.usd` (optional — unresolved tokens are left in place with a WARNING, l.83).
- **Guard**: `SKIPPED` if any of the 6 content files is missing (l.26–27). Today all are present → the step runs.
- **HARDCODED-MIAMI**: massive, in the content, not the code — `blog-meta.json` 4 hits, `index-cards.html` 2, and the four articles **28 / 28 / 24 / 16** hits (titles, descriptions, OG/Twitter, JSON-LD `headline`, FAQ names & answers, H1s, alt text, body prose). Examples that must be retargeted: `How Much Does PPF Cost in Miami?`, `Real prices in Miami (2026)`, `at our Miami studio`, `PPF vs Ceramic Coating in Miami`, `the SERRES Wrap Center studio in Miami` (alt), plus dozens of legitimate "Florida / South Florida" mentions that stay correct for Boca Raton.
- **FAQ mirror discipline**: every FAQ string appears twice (JSON-LD `acceptedAnswer.text` + visible `<details>`) and `_build/verify-seo.js:70-78` requires byte identity. Any Miami→Boca Raton edit must be applied to both halves. `check-blog.js` enforces this (l.41).

### `59-us-english.js` (67 l)
- **Does**: whole-word, case-preserving UK→US spelling/term conversion across every text file outside `_build/`. 40+ rules (l.17–41) + 4 exact phrases (l.43–48: `bonnet→hood`, `wings→fenders`). `grey` and `petrol` deliberately excluded (film colour names). `--census` flag counts without writing.
- **Touches**: everything shipped, including dictionary keys and the inline text that must match them (they change together — that is the point).
- **miami.json inputs**: none. **HARDCODED-MIAMI**: comment only. Fully reusable.

### `60-seo-domain.js` (52 l)
- **Does**: (1) replaces `https://serreswrapcenter.es` (190 occurrences) and the bare host with the new domain; (2) replaces `G-1K6FYZ99GN` (33 occurrences incl. `_build/verify-seo.js:45`), **refusing to reuse the Barcelona property** (l.32); (3) rewrites every `sitemap.xml <lastmod>` to today (unconditional); (4) hosting: `github-pages` → delete `.htaccess`, write `.nojekyll`; `hostinger` → keep `.htaccess`.
- **miami.json inputs**: `domain`, `ga4`, `hosting` — each independently optional; missing ones are listed as `SKIPPED (not in miami.json yet)`.
- **HARDCODED-MIAMI**: none. Fully reusable.
- Runs **before** `65` so the parent-site link survives in `sameAs` / `parentOrganization`.

### `65-nap-schema.js` (141 l) — the heaviest data-dependent step
- **Does**: (1) `wa.me/34621244469`, `tel:+34621244469`, displayed `+34 621 24 44 69` replaced everywhere; Spanish URL-encoded WhatsApp prefill texts replaced with English; (2) patches `assets/serres-enhance.js` constants `WA_DIGITS / WA_TEXT / TEL_HREF / TEL_TEXT` and the mobile-menu contact line; (3) patches the `pages/prices.html` WhatsApp message builder; (4) visible NAP: the 8 `Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp;` CTA lines, the index contact `.cm-v` row, the footer `<p>Sant Cugat del Vallès<br>Barcelona, Spain</p>`, plus optional email rows; (5) Google Maps iframe `src`, place link, and the `?cid=` URL; (6) `patch()` walks **every JSON-LD object on every page**: `PostalAddress`, `telephone`, `priceRange:"$$$"`, `openingHoursSpecification`, `hasMap`, `areaServed`, `sameAs` (strips `wa.me`, adds the parent URL), and on `AutoBodyShop|AutoRepair|LocalBusiness|AutomotiveBusiness|Store` nodes adds `email`, `geo`, `parentOrganization` + `branchOf`; (7) rebuilds 3 data-bearing dictionary entries (index FAQ address answer, service-page booking FAQ, contact "Hours" row) from `miami.json`; (8) prints surviving `Sant Cugat / Vallès / 08174 / +34 / Can Fatjó` leftovers.
- **miami.json inputs (all 13 required, l.19–21)**: `business.streetAddress, addressLocality, postalCode, phoneE164, phoneDisplay, whatsappDigits, mapsPlaceUrl, mapsEmbedSrc, openingHours, hoursDisplayEn, hoursDisplayEs, hoursDaysEn, hoursDaysEs`. `latitude/longitude` optional (omits `geo`). `email` optional (adds rows). `addressRegion` defaults `'FL'`, `parentUrl` defaults the Barcelona domain.
- **HARDCODED-MIAMI — 3 functional spots**:
  - **l.99**: `areaServed = [{City: B.addressLocality}, {City:'Miami'}, {State:'Florida'}]` — the literal `'Miami'` must become the Boca Raton service-area set (Boca Raton / Pompano Beach / Delray Beach / Deerfield Beach / Fort Lauderdale, per the spec's local-lander list).
  - **l.127**: `findKey(/^(We're at Av\. Can Fatjó|Our workshop is in Miami).*appointment/i, …)` — the alternation anchors on whatever `geo-map.json` produced. If the map says "Boca Raton" this regex finds 0 keys and the step **throws** (`expected exactly one dictionary key…, found 0`).
  - **l.131/133/134**: same coupling for the booking FAQ key — `/^We work by appointment only, Monday to Saturday, at (Av\. Can Fatjó|our workshop in Miami)/` and the two `.replace(/…our workshop in Miami, Florida…/)`. Retarget these three regexes in lockstep with `geo-map.json`.

### `85-render-snapshots.js` (36 l)
- **Does**: serves the built site, launches headless Chrome via `../headless.js`, opens `pages/prices.html` at 1440×900 with `lang=en` + reduced motion, waits for `I18N_READY`, reads `innerHTML` of `#svcTabs, #svcIntro, #tierGrid, #cmpTable, #cmpName` and writes it back into the HTML — re-baking the hand-pasted Spanish/EUR static snapshot (source `pages/prices.html:314-331`, a single 5,540-byte line) so no-JS crawlers see the same thing the JS renders.
- **Touches**: `pages/prices.html`.
- **miami.json inputs**: none directly, but it snapshots whatever prices step 40 produced — **if 40 was skipped, this step bakes EUR prices into the static fallback.**
- **HARDCODED-MIAMI**: none. Requires Chrome.

### `95-project-docs.js` (94 l)
- **Does**: writes `CLAUDE.md` and `TODO-MIAMI.md` (CRLF) into the site root, in Spanish, filling known values from `miami.json` and marking the rest `**PENDIENTE (confirmar con el cliente)**`.
- **miami.json inputs**: all of them, read-only.
- **HARDCODED-MIAMI**: 16 occurrences — the document title, the filename `TODO-MIAMI.md`, the whole narrative ("Sede de Miami", "Barrio/zona de Miami para el SEO local… p. ej. 'Doral'"), and the stack/i18n description. This file is documentation, so it needs a full rewrite for Boca Raton, not a find/replace. **It also documents a stack and decisions that the current brief supersedes** (it describes the port as 1:1 with Barcelona; the US spec adds new pages/services).

---

## 7. `geo-map.json` — exact shape

Array of **59** objects, all four fields present on every entry:

```json
{ "en": "<current English dictionary key>",
  "newEn": "<replacement English key/inline text>",
  "newEs": "<replacement Spanish dictionary value>",
  "note": "<rationale, optional>" }
```

- `30-geo-copy.js` filters `(newEn && newEn !== en) || newEs != null` → all 59 pass. 0 entries have `newEn === en`; 0 are missing `newEs`.
- It replaces **whole values only**: a dictionary key + its Spanish value, plus every inline HTML occurrence of the old key text that is bounded by `>`/`"`/`'`/backtick. So it hits body text, `alt`, `aria-label`, `title`, `<title>`, `meta`, and JSON-LD strings that happen to be the full value.
- **49 of 59 entries embed "Miami" / "Florida"** and must be retargeted. The 10 geo-neutral ones (safe to keep verbatim) are the gallery captions and tags: `Every car gets its own room…`, the M2/Supra/XM caption trio, `Collserola`→`Tower`, `Front end · Collserola`, `SERRES projects in Barcelona:…` (geo deliberately dropped), `Work gallery — PPF, Car Wrap & Detailing in Barcelona` (geo dropped), `Masia driveway`→`Farmhouse driveway`, `Pearl white · Masia driveway`.
- Deliberate design decisions baked in, carry them forward: the Barcelona street address and ZIP are **removed** but the `+34 621 24 44 69` phone is **kept verbatim in 5 entries** (entries 39, 41, 48, 53, 56) and the EUR money fragments **kept verbatim in 4 entries** (13, 15, 17, 18) — both are handed off to `65-nap-schema.js` and `40-prices.js` respectively. If those steps are skipped, those strings survive.
- The 98% claim is dropped in entries 20 and 38; `4.9 rating` is kept in entry 38 (step 50 strips it later).
- Entry 2's `note` is the most useful artefact in the file: it enumerates the inline Barcelona strings that the dictionary **cannot** reach (`index.html:885` footer, `index.html:846` `.cm-v`, the 8 `<p class="phone">` CTA lines with exact file:line, `id="taller-barcelona"` at `index.html:811`, the 98% stat tile at `pages/why-serres.html:398`, `services/detailing.html:556` inline FAQ JSON-LD, the 14 pages' PostalAddress/areaServed, and the Spanish-only blog pages with `en España`/ITV/DGT).

## 8. `alt-map.json` and `jsonld-map.json`

`alt-map.json` — **55** entries, `{ es, en, esNew, files[] }`. `es` = the Barcelona alt attribute, `en` = the new base-language alt, `esNew` = the Spanish dictionary value (usually identical to `es`, differing only where Barcelona geography was neutralised). 7 entries are geo-sensitive (Collserola → "communications tower"; four blog alts whose Spanish said "taller SERRES de Sant Cugat" were rewritten into pure scene descriptions). **No Miami in this file** — fully reusable.

`jsonld-map.json` — **56** entries, `{ es, en, pages[] }`, generated by `apply-jsonld-review.js` (which deliberately *rejected* `Barcelona→Miami` as a key-agnostic value replacement, because it would have set `addressLocality` to an invented city; `areaServed` is rebuilt from real data by step 65 instead). **8 of 56 entries carry Miami/Florida in `en`** and must be retargeted:
- index LocalBusiness description (`…in Miami, Florida. Films from several professional brands…`)
- prices `…for all SERRES Wrap Center services in Miami, Florida.` — **note this one still contains the literal Spanish "(IVA incluido)"**, injected by `apply-jsonld-review.js:27`; `40-prices.js` regex removes `IVA incluido` only when parenthesised/comma-led — verify after retarget
- why-serres `Detailing studio in Miami:…`
- body-kits `…at our Miami workshop. From 450 € IVA incluido.` (EUR + IVA intentionally left for step 40)
- ppf `PPF (paint protection film) installation in Miami`
- ppf long description `…at our workshop in Miami, Florida.`
- vinyl `…at our Miami workshop.`
- gallery description was deliberately left geo-free.

## 9. `miami.json` — the data contract (currently all nulls)

```
domain, hosting, ga4, taxDisplay                                  → null
business: name "SERRES Wrap Center", addressRegion "FL",
          addressCountry "US",
          instagram (Barcelona account), parentUrl (Barcelona site) → set
business: legalName, streetAddress, addressLocality, postalCode,
          latitude, longitude, mapsCid, mapsPlaceUrl, mapsEmbedSrc,
          phoneE164, phoneDisplay, whatsappDigits, email,
          openingHours, hoursDisplayEn/Es, hoursDaysEn/Es           → null
prices: 15 tiers, each { eur: <Barcelona lookup key>, usd: null }
        wrap.{accents,full,signature} ppf.{front,pro,full}
        ceramic.{essential,signature,concours}
        detailing.{refresh,deep,showroom}
        bodykits.{aero,full,transformation}
```

`openingHours` must be `[{days:["Monday",…], opens:"09:00", closes:"19:00"}, …]` (consumed at `65-nap-schema.js:84-85`).

---

## 10. `40-prices.js` in detail, and why the spec's price model breaks it

**How it finds prices** — four independent regex passes per file (files = `textFiles(root)` minus `_build/`):

1. `AMOUNT = /(?:€\s?(\d{1,3}(?:[.,]\d{3})*)(?![\d.,]))|(?:(\d{1,3}(?:[.,]\d{3})*)\s?€)/g` (l.59) — catches `€890`, `890 €`, `1.490 €`, `2,390 €`, and the no-space `890€` variant.
2. `/("(?:price|minPrice|maxPrice)"\s*:\s*"?)(\d+)("?)/g` — JSON-LD numeric prices.
3. `/(\bprice:)(\d+)(,)/g` — the `PRICING` object in `pages/prices.html`; service resolved by finding the nearest preceding `\n  (wrap|ppf|ceramic|detailing|bodykits):\{` (l.85).
4. `/(data-price=")(\d+)(")/g` — the static snapshot, wrap tab only.

**How it decides which tier a number is** — `byEur` maps EUR integer → candidate tiers. Because 890 is both `ppf.front` and `ceramic.concours`, and 1490 is both `wrap.full` and `bodykits.full`, `resolve()` (l.44–57) scans the 600 characters *before* the match for the **last-matching** service keyword from `KEYWORDS` (l.27–33), falling back to `fileService(file)` (l.34–42, a path/slug→service map that also knows the four **Spanish** blog slugs). If neither resolves → pushed to `unresolved` → the step **exits 1** (l.110). Any amount not in `byEur` at all → `unknown amount` → also exits 1. Finally it re-reads every file and exits 1 if any `€` survives (l.111–113).

**Latent failure, measured**: I simulated the AMOUNT pass against the real Barcelona source. **82 euro amounts are not in the 15-tier lookup**, all of them in the four Spanish blog articles (Spanish-market ranges: 900–1.700 €, 3.100–5.000 €, 25-50 €, derived arithmetic like "300 €", "240 € al año"…):

```
blog/cuanto-cuesta-ppf-coche.html            x30  [20,40,240,300,400,600,700,900,1000,1500,1700,2500,3100,5000]
blog/cuanto-cuesta-vinilar-un-coche.html     x23  [120,180,200,300,350,400,800,900,1000,1200,2000,2500,3000,3500,5000,6000]
blog/limpieza-tapiceria-coche-precio.html    x23  [25,40,50,60,70,300,500,800]
blog/ppf-o-ceramico-que-elegir.html          x6   [80,900,1500,3000,4000,8000]
```
(314 amounts *do* map, incl. 103 inside `assets/serres-i18n.js`.)
Step **40 runs before step 58**, so those Spanish articles are still on disk. **The moment `miami.json` prices are filled, `40-prices.js` will exit 1 and abort the whole pipeline.** Fix options: move the blog step before 40, or exclude `blog/cuanto-cuesta-*|ppf-o-ceramico-*|limpieza-tapiceria-*` from the price pass. This is unfinished work, not a design choice — the recon note `prices-currency.md §1c` explicitly says those ranges "must not be converted".

**How hard is the spec's price-model replacement?** The spec (`SERRES-US-WEBSITE-SPEC_1.md` §3) does not change the numbers — it changes the **schema**:
- New dimension: `FILM_TIERS` Essential/Signature, so every PPF row carries **two** prices (`priceEssential`/`priceSignature`) rendered as "Essential from $X · Signature from $Y".
- New service **window tint** (no Barcelona equivalent, no page, no JSON-LD, no dictionary entries).
- New **PACKAGES** group (Daily Driver / New Car / Collector) — a bundle concept that doesn't exist in the Barcelona site.
- New **PHASE2** group with a `published:false` flag that must exist in data but not render.
- Row identities barely overlap: BCN `wrap.accents/full/signature` ↔ US `chrome-delete / color-change / signature-wrap`; BCN `ppf.front/pro/full` ↔ US `partial-front / full-front / track-pack / full-body` (4 rows, not 3, and Track Pack is new); BCN `ceramic.essential/signature/concours` (3) ↔ US `ceramic-3yr / ceramic-topup` (2); BCN `detailing.refresh/deep/showroom` (3) ↔ US `interior / paint-correction` (2); BCN `bodykits.*` (3) ↔ **nothing** in the US model.
- New rendering flags `from`, `price:null → "on request"`, `popular → "Most popular" badge`, and a `TERMS` block (deposit 30%, "Prices exclude FL sales tax", "from" meaning, warranty, 2-hour quote) that must appear as small print on every page that shows a price.

`40-prices.js` is a **1:1 amount-substitution engine keyed by the old EUR value**. It has no concept of a row, a tier matrix, a published flag, or a bundle. **It cannot be adapted — it must be replaced.** Concretely, adopting the spec's model means: authoring a new price data source (the vanilla-stack equivalent of `pricing.ts` — e.g. a `PRICING` object in `pages/prices.html` plus a shared `assets/pricing.js`), rewriting the `PRICING` object and the tier-card renderer in `pages/prices.html` (source l.355–461 + `fmtEur` l.489 + 5 call sites), re-authoring every JSON-LD `Offer` on 7 pages (23 Offers, 15 `valueAddedTaxIncluded`, 38 `priceCurrency`), rewriting the **18 dictionary keys that embed prices** (`prices-currency.md §4.1`) *and* the inline HTML that must match them byte-for-byte, re-baking the static snapshot (step 85 does this automatically once the JS is right), and re-doing the 82 `{{PRICE:…}}` tokens in the authored blog content against new key names. The only parts of step 40 worth keeping are the `EUR→USD` / `priceRange` / VAT-clause cleanup passes (l.96–105) and the final "no € left" gate.

---

## 11. Does the pipeline produce clean output today? No.

With `miami.json` all nulls (guards evaluated against the real file):

| step | today | why |
|---|---|---|
| i18n-port transform | **runs** | no data deps |
| port-i18n-runtime | **runs** | no data deps |
| 30-geo-copy | **runs** | applies all 59 Miami strings |
| 32-seo-titles | **runs** | applies 11 Miami titles + descriptions |
| 35-alt-text | **runs** | geo-neutral |
| 38-jsonld-copy | **runs** | applies the 8 Miami JSON-LD strings |
| **40-prices** | **NO-OP** (`SKIPPED`, exit 0) | 15/15 `usd` are null |
| 50-trust-signals | **runs** | |
| 55-build-tools | **runs** | |
| 56-blog-css | **runs** | |
| 57-copy-fixes | **runs** | |
| 58-blog | **runs**, with a WARNING | content is complete; **82 `{{PRICE:…}}` tokens stay literal in the shipped articles** |
| 59-us-english | **runs** | |
| 60-seo-domain | **partial** | domain / GA4 / hosting all `SKIPPED`; only `sitemap.xml <lastmod>` is rewritten |
| **65-nap-schema** | **NO-OP** (`SKIPPED`, exit 0) | all 13 required business fields null |
| 85-render-snapshots | **runs** | bakes **EUR** prices into the static fallback, because 40 was skipped |
| 95-project-docs | **runs** | writes `CLAUDE.md` + `TODO-MIAMI.md` full of `**PENDIENTE**` |

So the output today is a site that is **English-base, Miami-branded in copy and SEO, review-free, blog-renamed — but still carrying Barcelona money, phone, address and analytics**: ~415 `€` occurrences, `+34 621 24 44 69` / `tel:+34621244469` / `wa.me/34621244469`, `Av. Can Fatjó dels Aurons` + `08174` in 14 JSON-LD blocks and the visible NAP, `https://serreswrapcenter.es` ×190, `G-1K6FYZ99GN` ×33, `"IVA incluido"`, `valueAddedTaxIncluded:true` ×15, `priceRange "€€€"/"€€"`, the Barcelona Maps iframe/CID, and 82 visible `{{PRICE:ppf.front}}`-style tokens. `count-terms.js` would FAIL on roughly a dozen terms.

**Other latent defects found**
1. **Step 40 aborts the pipeline once prices are supplied** (82 unmapped blog amounts — §10). Highest-priority fix.
2. **Step 65's three dictionary-key regexes (l.127, 131, 133, 134) are hard-coupled to the literal string "Miami"** produced by `geo-map.json`. Retarget one without the other and the step throws.
3. `38-jsonld-copy.js:4` and `55-build-tools.js:3` reference a non-existent `80-blog.js` (stale comments).
4. `run.js:68` never passes the allowlist to `i18n-port.js` (reporting noise only).
5. `jsonld-map.json` leaves a literal Spanish `IVA incluido` inside two English strings (`apply-jsonld-review.js:27` and the body-kits entry) — relies on step 40 to clean it.
6. Step 55 patches `verify-seo.js` banned-claims but not its hardcoded GA4 id or Spanish slugs (those belong to 60/58) — if either of those is skipped, `verify-seo.js` reports `gtag head x0` / `MISSING` on all 16 pages.

---

## 12. Verification tools — how to invoke each

All run from the **built site root** unless noted; all are dependency-free; the four browser tools need Chrome (override with `--chrome <path>` or `CHROME=` env for `i18n-orphans.js`, `chromePath` arg for `headless.js`).

```
node _build/i18n-orphans.js [--lang en|es|both] [--pages rel1,rel2] [--allow file]
                            [--out dir] [--chrome path]
```
Serves the site, drives headless Chrome over CDP, walks the **live DOM** with the engine's own rules. EN mode: every visible core must be a dictionary KEY. ES mode: every core must be a dictionary VALUE (an untranslated EN key with a non-empty ES value → `UNTRANSLATED`). Also detects `ES-LEAK`/`EN-LEAK` inside `[data-i18n-skip]` zones (JS-rendered snapshots), checks `<html lang>`, the `data-en` hatch, and the static OG/Twitter metas (EN mode only). Pages auto-discovered from `blog/`. Reads `_build/i18n-allowlist.txt` (45 neutral proper nouns) and `_build/i18n-en-only.txt` (the 4 EN-only blog slugs). Writes `_build/reports/i18n-orphans-<lang>.json`. **Exit 1 on any problem.** Target: 0.

```
node _build/verify-parity.js --src "<Barcelona V12 root>" [--lang en|es|both]
                             [--pages a,b] [--out dir]
```
Renders the same page from the Barcelona source and from the port, in the same language, extracts every visible text node + `alt`/`aria-label`/`title` + title + description, LCS-diffs the two sequences. Every diff must be an intended port change. Blog slug pairing is built in (`SLUGS`, l.21). Writes `_build/reports/parity-<lang>.json`. Skips `hidden` elements and the `.srs-lang` switcher. Exits 2 only on crash — read the table.

```
node _build/count-terms.js [siteRoot]
```
25 acceptance greps over the shipped files (never `_build/`, never `CLAUDE.md`/`TODO-MIAMI.md`): Barcelona, Sant Cugat, `Vall[eè]s`, `+34`, 08174, Can Fatjó, España/Spain, `Catal(?!og)`, Collserola, `serreswrapcenter.es` (allowed only on `sameAs|parentOrganization|branchOf|"url"` lines), `G-1K6FYZ99GN`, `€`, `EUR`, `IVA|VAT`, `valueAddedTaxIncluded`, `ITV|DGT`, `<html lang="es"`, `es_ES`, the CA language literals, `aggregateRating|reviewCount`, the old blog slugs, `{{TOKEN`, `wa.me/34`, `tel:+34`. `data-en=` is informational only. **Exit 1 if any forbidden term remains.**

```
node _build/screenshots.js --root "<site root>" --out "<dir>" --pass 1|2
                           [--lang en|es] [--pages a,b] [--viewport desktop|mobile|both]
```
Full-page captures at **1440×900** and **390×844 @2x**, reduced motion, videos paused, lazy images forced eager, whole page scrolled to trigger loads, reveal classes forced visible. Also reports horizontal overflow per page (`scrollWidth > clientWidth`). Files: `pass-<n>-<viewport>-<lang>-<slug>-<timestamp>.png` (never overwritten) + a JSON index. Use `--root "<Barcelona V12>"` `--pass 1` for the baseline.

```
node _build/serve.js [--root <dir>] [--port 8787]
```
Static preview server with `Cache-Control: no-store` (root-relative `/assets` paths need http, not `file://`).

```
node _build/headless.js      # library, not a CLI
```
Exports `serve(root)`, `launchChrome(chromePath?)`, `openPage(chrome, url, {lang,width,height,mobile,scale,reducedMotion,init})` → `{send, evaluate, waitFor, screenshot, close}`, `sleep`, `I18N_READY`. Used by `verify-parity.js`, `screenshots.js`, `85-render-snapshots.js`.

Two more, not in the list but present:
```
node _build/port/check-blog.js "<contentDir>" "<siteRoot>"
```
Pre-install QA of the authored articles: file completeness, `lang="en"`, `og:locale`, title 20–62 / description 110–160 chars, canonical + og:image on the new slug, placeholder counts (GA4 ×2, tel, wa.me), JSON-LD parse + `inLanguage` + dates `2026-09-02`, **FAQ strings byte-identical to the visible `<details>`**, `{{PRICE:key}}` validity against the 15 known keys, forbidden terms (`€`, EUR, IVA/VAT, Barcelona/Sant Cugat/Vallès/Catal/España/Spain, `98%`/`4.9`, ITV/DGT, XPEL/SunTek/STEK/Gtechniq, literal prices), Spanish leakage, `data-i18n-skip` on post-hero/toc/prose, TOC anchor↔id, link resolution, related cards, UK spelling. Exit 1 on any problem. **Run this after any Miami→Boca Raton edit to the blog content.**

Inherited from Barcelona and patched by step 55/58/60: `node _build/verify-seo.js` (always `exit 0`, read stdout; known false FAIL on `pages/prices.html — broken ref '+WA+msg+'` caused by the JS template at source l.534) and `node _build/dict-tools.js check|lookup|merge`.

---

## 13. Recon notes digest (`port\recon\*.md`, 9,396 lines)

- **`prices-currency.md`** (450 l) — the price bible. 298 `€` in HTML + 117 in the dictionary = 415 total; 38 `priceCurrency:"EUR"`; 15 `valueAddedTaxIncluded:true`; 73 `IVA`; 23 Offers. §1 is the 20-row distinct price table (17 numeric + 2 on-request + priceRange). §1b lists **derived arithmetic** in blog prose that must be recomputed, never substituted. §1c lists ~90 Spanish-market ranges that must be cut, not converted. §2 lists the 8 code generators of EUR (incl. `fmtEur` at `pages/prices.html:489` with 5 call sites, and the ungenerated static snapshot at l.314–331). §4.1 lists the **18 dictionary keys containing prices in four inconsistent formats**. §9 fixes the US format `$1,490`. §10 is 17 ranked risks.
- **`seo-surface.md`** (219 l) — 16 pages (the brief's "15" is wrong), 190 `serreswrapcenter.es`, 33 `G-1K6FYZ99GN`, 16 sitemap `<loc>`, 0 hreflang, 0 robots meta, 0 legal pages, 0 `mailto:`. Per-page table of title/description/canonical/og/JSON-LD types/GA4 lines. **7 root-relative links per page (112 total) break on a GitHub Pages project site without a custom domain.** Slug-rename blast radius. Full `_build/` tooling analysis.
- **`nap-schema-analytics.md`** (2,668 l) — the biggest. Baseline counts, every `tel:`/`wa.me`/address/ZIP/hours occurrence with file:line, all **42 JSON-LD blocks dumped verbatim in Appendix A**, the §11 master table (datum → Barcelona value → where → Miami source). Key facts: the Maps `pb=` string encodes the Barcelona place id and `!1ses!2ses` locale (needs a fresh embed, not a coordinate swap); no `GeoCoordinates`, no email, no parent Organization exist today — they are additions with no slot.
- **`i18n-architecture.md`** (450 l) — the engine. `serres-i18n.js` 1,485 lines / 163 KB / **790 entries** shaped `"EN key": ["es","ca"]`; injected at runtime by `serres-enhance.js:285-291` (base `../` when the path matches `/(services|pages|blog)/` — **the `blog/` folder must keep its name**); default lang `"es"` at l.1196; `applyAll()` rewrites `<html lang>` at runtime; matching is exact per text node after `affix()`; 44 real `data-i18n-skip` subtrees; `data-en` used exactly twice. §9 is the inversion plan the pipeline implements.
- **`inherited-trust-signals.md`** (637 l) — what must not be inherited: 3 `aggregateRating 4.9/50`, 5 testimonials ×2 copies, 6 review-flavoured stat tiles, 4 blog prose trust claims; **2 images with a fully readable Spanish plate `2383 MRZ` + `movento.es` dealer frame** (`assets/detailing/ext-before|after`), 6 with an EU "E" plate band, 5 with a Barcelona landmark; zero legal pages, zero cookie consent, GA4 fires unconditionally on all 16 pages; `.htaccess` is Hostinger cache policy only (no redirects).
- **`blog-content.md`** (501 l) — article bodies are `data-i18n-skip` ⇒ **switcher-inert by design**; Miami/US mirror = English body + Spanish chrome. Full Florida-rewrite passage list with exact text (§4), the internal link map (§5), and 15 risks incl. R3 (do not invent FLHSMV rules to replace the DGT/ITV FAQ) and R5 (5–7-year film life is a Barcelona-climate claim — `57-copy-fixes.js` already softens it).
- **`completeness-critic.md`** (247 l) — audits the other six. 17 gaps (G1–G17), 19 resolved contradictions (C1–C19) with the **measured truth**: GA4 = 33 not 34; `valueAddedTaxIncluded` = 15 not 13; `priceCurrency` = 38 not 41; `data-i18n-skip` = 44 attributes (grep says 45 because of a comment); the aggregateRating line ranges are `268-272` / `287-292` / `326-331`; the prices WhatsApp template is at l.**525** not 519; `€` totals 298/117/415. Also the acceptance-grep false-positive list (`OfferCatalog`, `sitemaps.org`, `Miami Blue` film colour, the `+34` in a code comment, `Vall[eè]s` must be accent-tolerant) — this is exactly what `count-terms.js` encodes.
- **`lines.md`** (642 l) — machine-generated term counts per file and a classified line inventory (a-nap 33, b-copy 108, c-i18n 131, d-meta 97, e-jsonld 173, f-alt 9, f-title-attr 1, g-analytics 32).

---

## 14. Retargeting Miami → Boca Raton: the concrete edit list

Functional (breaks or ships wrong text otherwise):
1. `_build\port\geo-map.json` — 49 of 59 entries (`newEn` + `newEs`). Leave the 10 geo-neutral ones alone.
2. `_build\port\32-seo-titles.js` l.17–62 — 30 occurrences across 11 pages (title EN/ES + desc EN/ES). Must stay consistent with #1.
3. `_build\port\65-nap-schema.js` l.99 (`areaServed` city list), l.127, l.131, l.133, l.134 (four regexes anchored on the literal "Miami"/"our workshop in Miami, Florida").
4. `_build\port\jsonld-map.json` — 8 entries.
5. `_build\port\57-copy-fixes.js` l.48–49 (ceramic meta description).
6. `_build\port\content\blog\*` — `blog-meta.json` (4), `index-cards.html` (2), and the 4 articles (28/28/24/16). Every FAQ edit twice (JSON-LD + `<details>`); re-run `check-blog.js` after.
7. `_build\port\miami.json` — rename the file or keep the name and fill it; `business.addressLocality` drives most of step 65.

Cosmetic but should be cleaned so the deliverable isn't misleading:
8. `_build\port\95-project-docs.js` — full rewrite (16 hits, writes `TODO-MIAMI.md`, describes a 1:1 Barcelona port and a "Doral" SEO suggestion).
9. `50-trust-signals.js` l.45/52/72 (`TODO(Miami)` text), `count-terms.js` l.2/50 ("Miami Blue" filter is still needed — it is a real 3M colour name on `services/ppf.html:841` and `services/vinyl.html:853`), `verify-parity.js`, `screenshots.js`, `run.js`, `lib.js`, `30/35/40/55/58/59` headers, `i18n-port.js`, `port-i18n-runtime.js`.

Pipeline repairs needed regardless of geography:
10. Reorder or scope `40-prices.js` so it does not see the four Spanish blog articles (82 unmapped amounts → guaranteed abort).
11. Replace the price model (§10) — step 40 cannot express the spec's two-tier PPF matrix, window tint, packages, `published:false` or `TERMS`.
12. The spec adds routes that do not exist in this pipeline at all: `/window-tint`, `/our-films`, `/about`, `/contact`, `/reserve`, 4 `/ppf-{city}` local landers, and privacy/terms. Nothing in `_build/port` creates pages — every step edits pages that the Barcelona copy already provided.