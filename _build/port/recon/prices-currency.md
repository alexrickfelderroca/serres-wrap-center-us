# RECON — prices-currency (SERRES Wrap Center V12 → Miami port)

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12`
Date: 2026-09-02. All line numbers are 1-based against the files as they exist today.
Method: `grep -F "€"`, `grep -w IVA`, `grep priceCurrency|priceRange|"price"|minPrice|Offer`, full reads of `pages/prices.html`, `assets/serres-enhance.js`, `_build/verify-seo.js`, `_build/dict-tools.js`, the i18n engine (`assets/serres-i18n.js` 1174-1485) and every PRICES dictionary block, plus a Node pass that parsed the DICT object and classified every price token. `node _build/verify-seo.js` was executed (read-only script, writes nothing) to capture the known FAIL verbatim.

---

## 0. Headline numbers

| Metric | Count | Where |
|---|---|---|
| `€` characters, in-scope HTML (14 of 15 pages; gallery + projects have 0) | **298** on 174 lines | see §3 |
| `€` characters in `assets/serres-i18n.js` | **117** on 38 lines (35 in EN keys, 41 in ES values, 41 in CA values) | §4 |
| `€` total shipped | **415** | |
| `€` in `_build/agg-report.json` (unreferenced build artifact) | 108 | §7 |
| `"priceCurrency": "EUR"` | **41** (services 36 + prices.html 5) | §5 |
| `"priceRange"` | **2** — `€€€` index.html:620, `€€` pages/why-serres.html:241 (inconsistent) | §5 |
| schema.org `Offer` objects | **23** (prices 5, ppf 3, vinyl 3, ceramic 3, paint-correction 3, detailing 3, body-kits 3) | §5 |
| `"valueAddedTaxIncluded": true` | **15** (ppf, vinyl, paint-correction, detailing, body-kits × 3; ceramic 0; prices.html 0) | §5 |
| word `IVA` in HTML | **51** (index 3, prices 11, body-kits 3, ceramic 6, detailing 2, paint-correction 2, ppf 2, vinyl 2, blog 20) | §6 |
| word `IVA` in i18n (ES + CA values) | **22** | §6 |
| word `VAT` in i18n (EN keys) | **11** | §6 |
| literal `EUR` outside JSON-LD | 1 in HTML (prices.html:348 footer) + 3 lines in i18n (243-245) | §6 |
| `$`, `USD`, `&euro;` anywhere | **0 / 0 / 0** | |
| `\u20AC` escape | 1 — `pages/prices.html:489` (`fmtEur`) | §2 |
| prices inside `alt=`, `title=`, `aria-label=` | **0** | §8 |
| prices inside `<meta name=description>` / `og:description` / `twitter:description` | **yes — 11 pages** (all except index, gallery, projects, why-serres, paint-correction) | §8 |
| DICT entries in serres-i18n.js | 790; **18** EN keys carry €/EUR/VAT | §4 |
| Distinct SERRES price lines the client must fill in USD | **17** numeric + 2 "on request" + 1 priceRange token | §1 |

Whitespace facts that matter for byte-for-byte i18n matching: every `N €` in HTML uses a **regular U+0020 space** before `€` (285 instances), **0** NBSP, and **8** instances with **no space** (`890€`, `2.390€`) — all 8 are in `blog/cuanto-cuesta-ppf-coche.html` lines 8, 22, 33, 49. Ranges use en-dash `900–1.700 €` (blog ppf, ppf-o-ceramico) or hyphen `25-50 €` (blog limpieza). Thousands separator is always the dot (`1.490`), never a comma, in ES text.

---

## 1. DISTINCT PRICE LIST — the table the client fills with Miami USD

De-duplicated across all 15 pages + JSON-LD + i18n + blog. "Where" lists the canonical sources; every other occurrence is in §3.

| # | Service | Variant / size | Barcelona EUR (as written) | Where it is published | Miami USD |
|---|---|---|---|---|---|
| 1 | Car Wrap | Accents — roof, mirrors, pillars / detail pieces | desde 250 € | prices.html:322,331,360 · vinyl.html:375,424,629 · prices.html:255 (Offer) · blog | ___ |
| 2 | Car Wrap | Full colour change — standard car ("turismo") | desde 1.490 € | prices.html:322,331,362 · vinyl.html:7,388,424,515 · blog | ___ |
| 3 | Car Wrap | Full colour change — SUV / large saloon | "Presupuesto cerrado previo" (no number) | blog/cuanto-cuesta-vinilar-un-coche.html:239 only | ___ (or keep on-request) |
| 4 | Car Wrap | Signature Wrap — premium / colour-flip films, extended disassembly, door shuts | desde 1.990 € | prices.html:322,331,364 · vinyl.html:401,424 · blog | ___ |
| 5 | PPF | Front pack — bumper, partial bonnet (front third), mirrors | desde 890 € | prices.html:256,380 · ppf.html:7,330,382,486 · index.html:658,820 · blog | ___ |
| 6 | PPF | Pro / "Frontal completo" — full bonnet, wings, bumper, headlights, mirrors, A-pillars (+ ceramic over film) | desde 1.190 € | prices.html:382 · ppf.html:344,382 · blog | ___ |
| 7 | PPF | Full body — every painted panel | desde 2.390 € | prices.html:384 · ppf.html:358,382 · index.html:658,820 · blog | ___ |
| 8 | PPF | Spot zones — headlights, sills, door frames, boot edge | "desde 60–150 €" | blog/cuanto-cuesta-ppf-coche.html:233 only | ___ |
| 9 | Correction + Ceramic | Essential — stage-1 polish + 1 ceramic layer, 2 yr | desde 340 € | prices.html:257,402 · ceramic.html:7,269,271,300 · paint-correction.html:341,390 · ppf.html:422 · blog | ___ |
| 10 | Correction + Ceramic | Signature — stage-2 + 2 layers + rain-repellent glass, 3 yr | desde 590 € | prices.html:404 · ceramic.html:276,278,300 · paint-correction.html:354,390 · blog | ___ |
| 11 | Correction + Ceramic | Concours — stage-3 + multi-layer + interior, 5 yr | desde 890 € | prices.html:406 · ceramic.html:283,285,300 · paint-correction.html:367,390 · blog | ___ |
| 12 | Detailing | Refresh — exterior decon wash + interior vacuum/wipe (~3 h) | desde 35 € | prices.html:258,422 · detailing.html:452,601 · blog | ___ |
| 13 | Detailing | Deep Clean — steam interior, carpet extraction, sealed paint (1 day) | desde 150 € | prices.html:424 · detailing.html:7,345,452,462,616 · blog | ___ |
| 14 | Detailing | Showroom Reset — everything incl. engine bay, trim, leather, 12-month sealant | desde 490 € | prices.html:426 · detailing.html:7,452,631 · blog | ___ |
| 15 | Body Kits | Aero parts — splitter / spoiler / diffuser supplied + fitted | desde 450 € | prices.html:259,444 · body-kits.html:7,273,305,352,456 | ___ |
| 16 | Body Kits | Full kit fitted + paint-matched | desde 1.490 € | prices.html:446 · body-kits.html:317,352 | ___ |
| 17 | Body Kits | Transformation / widebody — kit + wheels + stance + arch work (2–4 weeks) | desde 3.490 € | prices.html:448 · body-kits.html:329,352 | ___ |
| 18 | Exclusivo (full build) | one car, one project | no number ("presupuestado como un único proyecto") | prices.html:340 · pages/projects.html | keep |
| 19 | Body Kits tier cards on prices page | `quote:true` → cards render "On request" / "A consultar" | — | prices.html:442,531,554 | keep or publish |
| 20 | schema `priceRange` | LocalBusiness tier token | `€€€` (index) / `€€` (why-serres) | index.html:620 · why-serres.html:241 | `$$$` (brief) — unify both |

Notes on the table
- Rows 9–11 are the SAME three prices published twice under different Offer names: `ceramic.html` ("Cerámico Essential/Signature/Concours", :268/275/282) and `paint-correction.html` ("Corrección + Ceramic Coating Essential/…", :340/353/366). One USD value each.
- Rows 3 and 8 exist ONLY in blog articles — easy to miss if the port only scans the prices page.
- Row 15–17: on `pages/prices.html` the body-kit cards deliberately hide the numbers (`quote:true`, :442) while the JSON-LD (prices.html:259, body-kits.html:305-333), FAQ (body-kits.html:352/547), meta (:7/13/20) and lead (:456) publish them. Decide once for Miami.
- Tier names WITHOUT a dictionary entry (identity in every language): `Signature`, `Concours`, `Refresh`, `PPF`, `Pro` (Pro has an identity entry at i18n:773). `Essential` → ES "Esencial" (i18n:775) — but `services/ceramic.html:300/521` and `paint-correction.html:390/597` write "Essential" in Spanish prose, while `blog/ppf-o-ceramico-que-elegir.html:236` writes "Esencial". Pre-existing inconsistency; the port should pick one.

### 1b. Figures DERIVED from EUR prices (must be RECOMPUTED from the USD table, never substituted)
| File:line | Text | Derivation |
|---|---|---|
| blog/cuanto-cuesta-ppf-coche.html:255 | "La diferencia de 300 € suele compensar." | 1.190 − 890 |
| blog/cuanto-cuesta-ppf-coche.html:301-303 | "Un frontal completo de 1.190 € amortizado en cinco años … unos 240 € al año, unos 20 € al mes. Una carrocería completa de 2.390 €, a unos 40 € al mes." | 1190/5, /60; 2390/60 |
| blog/limpieza-tapiceria-coche-precio.html:289-291 | "un interior degradado resta entre 300 € y 800 € al valor de reventa … Showroom Reset de 490 € suele recuperarse … Deep Clean de 150 € casi siempre." | resale claim vs. rows 13-14 |
| blog/ppf-o-ceramico-que-elegir.html:277-279 | "Desde 340 € tienes pulido de un paso … La gama alta … queda en 890 €." | rows 9, 11 |

### 1c. SPANISH-MARKET ranges (NOT SERRES prices) — no Miami equivalent; client must supply US ranges or the sentences are cut
All in the four blog articles. They must not be converted.
- `blog/cuanto-cuesta-ppf-coche.html`: :95 (900–1.700 €, 2.500 €), :199 (600–5.000 €), :201 (900–1.700 €, 1.500–2.500 €), :202 (3.100–5.000 €), :217 (900 € o 5.000 €), :230-233 col "Rango de mercado" (900–1.700 / 1.500–2.500 / 3.100–5.000 / 60–300 €), :255-256 (400–700 €), :261 (3.100–5.000 €), :304-305 (600–1.000 €, 300–600 €), :339 (visible FAQ copy of :95).
- `blog/cuanto-cuesta-vinilar-un-coche.html`: :8/:21/:31/:46 ("de 1.200 a 3.500 €" in meta/OG/Twitter/JSON-LD), :218-221 (250–3.500 €, 1.400–2.000 €), :237-240 col "Mercado en España" (150–800 / 1.200–2.500 / 2.000–3.500 / 2.500–5.000 €), :246 (1.200 € o 3.000 €), :264 (1.000 €), :269 (400–900 €), :275 (500–900 €), :291-295 per-piece list (150–300, 180–350, 60–120, 90–180, 80–200 €), :298 (250–400 €), :304 (3.000–6.000 €), :306 (1.400–2.000 €), :312 ("cientos o miles de euros").
- `blog/limpieza-tapiceria-coche-precio.html`: :102 (70–150 €, 30–40 €, 300–500 €), :218-220, :239-242 col "Precio de mercado" (25-50 / 40-70 / 70-150 / 300-500 €), :247 (25 €), :273 (25 €), :279/:282/:285 (30-50 / 100-150 / 300-500 €), :289 (300–800 €), :311 (20-40 €), :327 (20-60 €), :330 (30-50 €), :354-357 (visible FAQ copy of :102).
- `blog/ppf-o-ceramico-que-elegir.html`: :241-242 (1.500–3.000 €, 4.000–8.000 €), :297 (600-900 €), :307 (30-80 €).
- `blog/cuanto-cuesta-ppf-coche.html:271` and `blog/cuanto-cuesta-vinilar-un-coche.html:312`: the word "euros" (the only two uses of the word in the site).

---

## 2. Where the EUR format is GENERATED BY CODE (cannot be fixed by text substitution)

| # | File:line | What | Required change |
|---|---|---|---|
| 2.1 | `pages/prices.html:489` | `function fmtEur(n){return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' \u20AC';}` — dot thousands + space + € | Rename/replace with `'$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')` → `$1,490`. **Call sites: :491 (reduced-motion), :493 (count-up start), :497 (count-up frame), :532 (card `.t-val` initial), :554 (comparison `<tfoot>` "from …")**. |
| 2.2 | `pages/prices.html:355-461` | `var PRICING = {…}` — numeric `price:` fields: wrap 250/1490/1990 (:360,362,364), ppf 890/1190/2390 (:380,382,384), ceramic 340/590/890 (:402,404,406), detailing 35/150/490 (:422,424,426), bodykits 450/1490/3490 (:444,446,448). Body kits has `quote:true` (:442) so its numbers never render. | Replace 15 integers with USD. This is the ONLY price source for the interactive cards + comparison table on the prices page. |
| 2.3 | `pages/prices.html:314, 321, 322, 331` | **Static pre-rendered snapshot** of the *wrap* tab (tabs, intro, 3 cards, comparison table) baked into the HTML for no-JS/SEO. It is a pasted `innerHTML` dump (note the `class=""` artifacts) — **there is no generator for it in `_build/`**. Contains Spanish copy and EUR: `:322` three `<span class="t-val chrome-text" data-price="250">250 €</span>`, `data-price="1490">1.490 €`, `data-price="1990">1.990 €`; `:331` `<tfoot>` "desde 250 €", "desde 1.490 €", "desde 1.990 €"; `:314` tab labels "Pulido + Cerámica"; `:321` intro "Car Wrap precios". All four containers carry `data-i18n-skip`, so i18n never touches them; JS overwrites them on load (`render('wrap')` at :559). | Re-bake in EN + USD by hand (or add a `_build/` script that renders and dumps `#svcTabs/#svcIntro/#tierGrid/#cmpTable`). If left as-is, a no-JS crawler sees Spanish EUR on the EN Miami page. |
| 2.4 | `pages/prices.html:525` | `var msg=encodeURIComponent("Hola SERRES, quería presupuesto del pack "+T(t.name)+" de "+T(s.label)+" para mi coche.");` — WhatsApp pre-filled message hard-coded **in Spanish regardless of active language** (tier/service names are translated, the sentence is not). Also the three static hrefs at `:322` carry the same Spanish text URL-encoded. `WA` constant at `:463` (`https://wa.me/34621244469?text=`). | EN base sentence (and ideally per-language via `T()`); number → `wa.me/1…`. |
| 2.5 | `pages/prices.html:255-259` | JSON-LD `OfferCatalog` — 5 Offers with `"description":"Desde N €, IVA incluido"`, `"price":"N"`, `"priceCurrency":"EUR"`, absolute `url` to serreswrapcenter.es. | USD, `"priceCurrency":"USD"`, EN description, new domain. |
| 2.6 | `assets/serres-enhance.js:14-19` | `WA_TEXT = encodeURIComponent("Hola SERRES, quería pedir presupuesto para mi coche.")` (Spanish, no price) used by the floating WA button (:196) and mobile-menu WA link (:161). | EN base text; number. (Listed because it is the quote CTA that every price points to.) |
| 2.7 | `assets/serres-enhance.js:209-217` | `fmt(n, decimals, comma)` count-up formatter — **comma** thousands, applies only to `.hstat b, .rv-stat b, .gb-val, [data-count-up]` (:220). Not used for prices (price cards use 2.1). Note the regex at :224 only recognises `1,500`-style numbers, so an ES-style `1.500` stat would silently not animate — not a price issue, but relevant if any stat is re-formatted. | No change needed for currency. |
| 2.8 | `assets/serres-i18n.js:1200-1206` (`tr`) + `:1323-1335` (`bindMeta/applyMeta`) | `<title>` and `<meta name="description">` are re-written at runtime from DICT (keys 994-1020). OG/Twitter descriptions are **not** touched. | The EN meta descriptions with USD become the inline text; ES values are the translation. |

`pages/prices.html` is the one page that is **already "forward"**: its data (`PRICING`) is English and `T()` (:466) → `SERRES_I18N.t` → `tr()` (:1200) returns the EN key when `current==="en"` and `DICT[key][0]` when `"es"`. Removing the INV layer does not affect it. Only 2.1–2.5 need work on this page.

Timing quirk worth knowing: `render('wrap')` runs synchronously at parse time (:559) **before** `serres-enhance.js` (deferred, :570) injects `serres-i18n.js` (:285-291), so today the ES snapshot is briefly overwritten with English and then re-rendered in ES on `serres:langchange` (:562-567, fired by i18n `init` :1471-1477). With an EN base this flash disappears.

---

## 3. FULL OCCURRENCE INVENTORY (HTML)

Legend — **S** = SERRES price · **M** = Spanish-market range (not ours) · **D** = derived arithmetic · **T** = tax wording only · fmt = number format used.

### 3.1 `pages/prices.html` (27 €, 11 lines; `IVA` 11)
| Line | Exact string (trimmed) | Amount(s) | Refers to | fmt |
|---|---|---|---|---|
| 7 | `<meta name="description" content="Precios de PPF desde 890 €, Car Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES.">` | 890/250/340/35 | S entry prices | `N €` |
| 13 | `og:description` — identical text | same | S | `N €` |
| 20 | `twitter:description` — identical text | same | S | `N €` |
| 242 | JSON-LD Service `"description":"Precios orientativos con IVA incluido de todos los servicios … Sant Cugat del Vallès (Barcelona)."` | — | T | |
| 255 | `{"@type":"Offer","name":"Car Wrap — cambio de color","description":"Desde 250 €, IVA incluido","price":"250","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/vinyl.html"}` | 250 | S row 1 | `N €` + numeric |
| 256 | Offer PPF — `"Desde 890 €, IVA incluido"`, price 890 | 890 | S row 5 | |
| 257 | Offer Corrección + Ceramic — `"Desde 340 €, IVA incluido"`, price 340 | 340 | S row 9 | |
| 258 | Offer Detailing — `"Desde 35 €, IVA incluido"`, price 35 | 35 | S row 12 | |
| 259 | Offer Body kits — `"Desde 450 €, IVA incluido"`, price 450 | 450 | S row 15 | |
| 306 | `<p class="lead">Precios de PPF (desde 890 €), Car Wrap (desde 250 €), Ceramic Coating (desde 340 €) y detailing (desde 35 €), IVA incluido. Tres niveles por servicio; …</p>` | 890/250/340/35 | S | `N €` — DICT key at i18n:229 |
| 314 | static tabs `Car Wrap / PPF / Pulido + Cerámica / Detailing / Body Kits` (data-i18n-skip) | — | snapshot | |
| 321 | static intro `Car Wrap <span>precios</span>` … (data-i18n-skip) | — | snapshot | |
| 322 | static wrap cards: `data-price="250">250 €`, `data-price="1490">1.490 €`, `data-price="1990">1.990 €`; 3× `href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20presupuesto%20del%20pack%20…"` | 250/1490/1990 | S rows 1,2,4 | `N €`, `1.490 €` |
| 323 | `<p class="price-note">Precios orientativos · el presupuesto final depende del tamaño del vehículo, su estado y la elección de film · no incluyen kit de mantenimiento</p>` | — | guide-price note — DICT i18n:232 | |
| 331 | static comparison `<tfoot>`: `desde 250 €`, `desde 1.490 €`, `desde 1.990 €` | 250/1490/1990 | S | |
| 348 | `<footer>© 2026 SERRES. Todos los derechos reservados. &nbsp;·&nbsp; Precios orientativos en EUR, IVA incluido</footer>` | — | currency name + T — DICT i18n:243 (key uses `\u00A0·\u00A0`) | `EUR` |
| 355-461 | `PRICING` integers (see 2.2) | 15 values | S rows 1-2,4-7,9-17 | numeric |
| 489 | `fmtEur` (see 2.1) | — | generator | `' \u20AC'` |
| 525 | Spanish WA message (see 2.4) | — | CTA | |

### 3.2 `index.html` (7 €, 3 lines; `IVA` 3)
| Line | Exact string | Amount | Refers to | fmt |
|---|---|---|---|---|
| 620 | `"priceRange": "€€€",` (AutoBodyShop JSON-LD, block 612-647) | — | tier token | `€€€` |
| 658 | FAQ JSON-LD answer: `"El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp …"` | 890 / 2.390 | S rows 5, 7 | `N €`, `2.390 €` — DICT i18n:1045 (EN key writes `2,390 €`) |
| 816 | `…detailing y body kits, con precios orientativos publicados e IVA incluido.</p>` | — | T — DICT i18n:1043 | |
| 820 | visible `<details>` copy of 658 (must stay identical to 658 or `verify-seo.js:77` fails) | 890 / 2.390 | S | |

### 3.3 `pages/why-serres.html` (2 €, 1 line)
| 241 | `"priceRange": "€€",` (AutoRepair JSON-LD, block 232-…) | — | tier token — **differs from index (`€€€`)** | `€€` |

### 3.4 `services/ppf.html` (12 €; `IVA` 2; 3 Offers, 6 priceCurrency, 3 valueAddedTaxIncluded)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 7 / 13 / 20 | meta / og / twitter description: `…Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona.` | 890 | S row 5 (DICT ES value i18n:998 — its EN key at :997 has NO price) |
| 326-369 | `"offers"`: Offer "PPF frontal" price `890` (:330, :334 PriceSpecification, `valueAddedTaxIncluded:true` :336), "PPF frontal completo" `1190` (:344/:348/:350), "PPF carrocería completa" `2390` (:358/:362/:364); `priceCurrency:"EUR"` at :331,335,345,349,359,363; `url` :339/:353/:367 to serreswrapcenter.es | 890/1190/2390 | S rows 5-7 |
| 382 | FAQ JSON-LD: `"El pack frontal parte de 890 €, el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende …"` | 890/1.190/2.390 | S — DICT i18n:1056 (**EN key writes `1.190 €` / `2.390 €` with Spanish dots**) |
| 422 | FAQ JSON-LD: `…el Ceramic Coating SiO₂ (desde 340 €) aporta brillo…` | 340 | S row 9 — DICT i18n:1066 |
| 486 | `<p class="lead">Instalamos PPF en Barcelona … Film autorregenerable con 3 años de garantía, desde 890 €. …</p>` | 890 | S — DICT i18n:389 (EN key `from 890 €`) |
| 657 | visible FAQ copy of 382 | | |
| 682 | visible FAQ copy of 422 | | |

### 3.5 `services/vinyl.html` (10 €; `IVA` 2; 3 Offers with `minPrice`)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 7 / 13 / 20 | `Car Wrap: cambio de color con films 3M, Avery Dennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès.` | 1.490 | S row 2 (DICT ES i18n:1001) |
| 371-411 | Offers: "Acentos en vinilo (techo, retrovisores, pilares)" `250` (:375, :379, minPrice :382), "Cambio de color completo" `1490` (:388/:392/:395), "Cambio de color Signature (desmontaje ampliado)" `1990` (:401/:405/:408); EUR at :376,380,389,393,402,406; VAT flag :381,394,407 | 250/1490/1990 | S rows 1,2,4 |
| 424 | FAQ JSON-LD: `"El cambio de color completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desde 1.990 €. …"` | 1.490/250/1.990 | S — DICT i18n:1155 (EN `€1,490`, `€250`, `€1,990`) |
| 515 | lead: `…Coche completo desde 1.490 €, totalmente reversible, en nuestro taller de Sant Cugat del Vallès.` | 1.490 | S — DICT i18n:648 (EN `€1,490`) |
| 629 | visible FAQ copy of 424 | | |

### 3.6 `services/ceramic.html` (13 €; `IVA` 6; 3 Offers, NO PriceSpecification, NO VAT flag — tax lives in description strings)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 7 / 13 / 20 | `Tratamiento Ceramic Coating SiO2 con hasta 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona.` | 340 | S row 9 (DICT ES i18n:1004) |
| 246 | Service JSON-LD description: `…Packs desde 340 € IVA incluido.` | 340 | S |
| 268-271 | Offer "Cerámico Essential" price `340`, EUR :270, `"description": "Pulido de una etapa y una capa de Ceramic Coating SiO2. Durabilidad estimada de 2 años. Desde 340 € IVA incluido."` | 340 | S row 9 |
| 275-278 | Offer "Cerámico Signature" `590`, `…Desde 590 € IVA incluido.` | 590 | S row 10 |
| 282-285 | Offer "Cerámico Concours" `890`, `…Desde 890 € IVA incluido.` | 890 | S row 11 |
| 300 | FAQ JSON-LD: `"Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. …"` | 340/590/890 | S — DICT i18n:1090 |
| 521 | visible FAQ copy of 300 | | |

### 3.7 `services/paint-correction.html` (8 €; `IVA` 2; meta has NO price)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 337-377 | Offers "Corrección + Ceramic Coating Essential/Signature/Concours" `340/590/890` (:341/:345, :354/:358, :367/:371), EUR :342,346,355,359,368,372, VAT flag :347,360,373 | 340/590/890 | S rows 9-11 (duplicate of ceramic.html) |
| 390 | FAQ JSON-LD: `"En SERRES Wrap Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 €. …"` | 340/590/890 | S — DICT i18n:1136 |
| 422 | FAQ JSON-LD: `…el PPF autorregenerable (desde 890 € el frontal) incluye 3 años de garantía del film.` | 890 | S row 5 — DICT i18n:1144 |
| 597 | visible FAQ copy of 390 | | |
| 613 | visible FAQ copy of 422 | | |

### 3.8 `services/detailing.html` (15 €; `IVA` 2)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 7 / 13 / 20 | `Limpieza integral: vapor, tapicería, cuero y motor. Deep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat.` | 150/490 | S rows 13-14 (DICT ES i18n:1010) |
| 345 | lead: `…en nuestro estudio de Sant Cugat del Vallès. Deep Clean desde 150 €.` | 150 | S — DICT i18n:530 (EN `€150`) |
| 452 | visible FAQ: `Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo por dentro y por fuera — desde 490 €. …` | 35/150/490 | S — DICT i18n:1074 |
| 462 | visible FAQ: `…Está incluido desde el nivel Deep Clean (desde 150 €).` | 150 | S — DICT i18n:1078 |
| 524 | FAQ JSON-LD copy of 452 | | |
| 540 | FAQ JSON-LD copy of 462 | | |
| 597-643 | Offers "Detailing Refresh" `35` (:601/:605, minPrice :608), "Detailing Deep Clean — limpieza interior a vapor" `150` (:616/:620/:623), "Detailing Showroom Reset — interior y exterior completo" `490` (:631/:635/:638); EUR :602,606,617,621,632,636; VAT :607,622,637; url :611/:626/:641 | 35/150/490 | S rows 12-14 |

### 3.9 `services/body-kits.html` (11 €; `IVA` 3)
| Line | Exact string | Amount | Refers to |
|---|---|---|---|
| 7 / 13 / 20 | `Instalación y pintura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès.` | 450 | S row 15 (DICT ES i18n:1013) |
| 273 | JSON-LD description: `…en nuestro taller de Sant Cugat del Vallès. Desde 450 € IVA incluido.` | 450 | S |
| 298-339 | `hasOfferCatalog` "Tarifas de montaje de body kits": "Complementos aerodinámicos (splitter, difusor, spoiler)" `450` (:305, minPrice :309), "Kit completo con ajuste y pintura" `1490` (:317/:321), "Transformación integral / widebody" `3490` (:329/:333); EUR :306,310,318,322,330,334; VAT :311,323,335 | 450/1490/3490 | S rows 15-17 |
| 352 | FAQ JSON-LD: `"Los complementos aerodinámicos —splitter, difusor o spoiler— parten de 450 €. Un kit completo con ajuste y pintura empieza en 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. …"` | 450/1.490/3.490 | S — DICT i18n:1114 |
| 456 | lead: `…conversiones widebody, desde 450 €. …` | 450 | S — DICT i18n:684 (EN `€450`) |
| 547 | visible FAQ copy of 352 | | |

### 3.10 `blog/index.html` (7 €, 3 lines; `IVA` 1) — all inside `<div class="post-grid" data-i18n-skip>` (:88)
| 97 | `Tarifas reales 2026: acentos desde 250 € y cambio de color completo desde 1.490 €. …` | 250/1.490 | S |
| 121 | `Frontal desde 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, IVA incluido. …` | 890/1.190/2.390 | S |
| 133 | `De 35 € a 490 € según el nivel: …` | 35/490 | S |

### 3.11 `blog/cuanto-cuesta-ppf-coche.html` (60 €, 31 lines; `IVA` 11) — body in `<article class="prose" data-i18n-skip>` (:197)
| Line | Content | Type |
|---|---|---|
| 8, 22, 33, 49 | meta / og / twitter / JSON-LD description: `PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). …` | S — **fmt `890€` no space (only place on the site)** |
| 95 | FAQ JSON-LD: `En España, entre 900 € y 1.700 € el frontal parcial y hasta 2.500 € el frontal completo. Nuestra tarifa es de 890 € el frontal y 1.190 € el frontal completo, con IVA incluido, …` | M + S |
| 110 | FAQ JSON-LD: `…Ceramic Coating SiO₂ (de 340 € a 890 € en nuestro caso, con corrección de pintura incluida)…` | S |
| 199-202 | `cuesta en España entre 600 € y 5.000 € … entre 900 € y 1.700 €, un frontal completo entre 1.500 € y 2.500 €, y la carrocería completa entre 3.100 € y 5.000 €.` | M |
| 203 | `(Sant Cugat del Vallès, Barcelona) trabajamos con tarifas cerradas e IVA incluido:` | T |
| 204 | `frontal 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, siempre con film…` | S |
| 217 | `costar 900 € o 5.000 €.` | M |
| 222 | `…precios de PPF</a>, con IVA incluido.` | T |
| 227 | table header `Precio SERRES (IVA incl.)` / `Rango de mercado` | T |
| 230 | Frontal · `890 €` · `900–1.700 €` · 1 día | S + M |
| 231 | Frontal completo · `1.190 €` · `1.500–2.500 €` · 1–2 días | S + M |
| 232 | Carrocería completa · `2.390 €` · `3.100–5.000 €` · 3–4 días | S + M |
| 233 | Zonas puntuales · `desde 60–150 €` · `60–300 €` · 2–4 horas | **S (row 8, blog-only)** + M |
| 239 | `IVA; pide siempre la cifra final.` | T |
| 248 | `Frontal parcial (890 € en nuestro caso).` | S |
| 251 | `Frontal completo (1.190 €).` | S |
| 255-256 | `La diferencia de 300 € suele compensar. Repintar solo un capó dañado cuesta entre 400 € y 700 €…` | D + M |
| 261-262 | `se factura entre 3.100 € y 5.000 €; nuestra tarifa es de 2.390 €` | M + S |
| 301-303 | amortisation sentence (see §1b) | S + D |
| 305 | `600–1.000 €` · `300–600 € por pieza` | M |
| 314 | `Coating con corrección de pintura previa (desde 340 € en nuestro caso…` | S |
| 323 | `<li>Precio final con IVA incluido.</li>` | T |
| 339-341 | visible FAQ copy of 95 | M + S + T |
| 360-361 | visible FAQ copy of 110 | S |
| 420 | related card: `Packs frontal y coche completo desde 890 €, con 3 años de garantía del fabricante.` | S |

### 3.12 `blog/cuanto-cuesta-vinilar-un-coche.html` (36 €, 27 lines; `IVA` 5)
| Line | Content | Type |
|---|---|---|
| 8 | meta: `Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. …` | S + M |
| 21 / 31 / 46 | og / twitter / JSON-LD: `Desde 250 € por piezas y de 1.200 a 3.500 €…` | S + M |
| 218-221 | `entre 250 € por piezas sueltas … y 3.500 € … entre 1.400 y 2.000 €, IVA incluido.` | S + M |
| 222-223 | `acentos desde 250 €, cambio de color completo por 1.490 € y acabado Signature por 1.990 €.` | S |
| 234 | header `Mercado en España` / `Tarifa SERRES (IVA incl.)` | T |
| 237 | Acentos · `150 – 800 €` · `Desde 250 €` | M + S |
| 238 | Cambio de color completo (turismo) · `1.200 – 2.500 €` · `1.490 €` | M + S |
| 239 | Cambio de color completo (SUV / gran berlina) · `2.000 – 3.500 €` · `Presupuesto cerrado previo` | M + **S row 3 (blog-only)** |
| 240 | Vinilado Signature · `2.500 – 5.000 €` · `1.990 €` | M + S |
| 246 | `te pueden pedir 1.200 € o 3.000 €.` | M |
| 264 | `baja de 1.000 €` | M |
| 269 | `entre 400 y 900 € del precio final` | M |
| 275 | `500 – 900 €.` | M |
| 291-295 | per-piece list `150 – 300 €`, `180 – 350 €`, `60 – 120 €`, `90 – 180 €`, `80 – 200 €` | M |
| 298 | `por 250 – 400 €.` | M |
| 304 | `Pintura integral de calidad: 3.000 – 6.000 €` | M |
| 306 | `Vinilo integral: 1.400 – 2.000 €` | M |
| 312 | `cientos o miles de euros` | word |
| 315 | `desde 890 € el frontal` (PPF) | S |
| 328-329 | `¿El precio incluye IVA? … son sin IVA; los nuestros lo incluyen.` | T (the only "sin IVA") |
| 381 | `presupuesto cerrado, con IVA incluido` | T |
| 421 | related card: `…desde 1.490 €.` | S |

### 3.13 `blog/limpieza-tapiceria-coche-precio.html` (53 €, 33 lines; `IVA` 2)
| Line | Content | Type |
|---|---|---|
| 8 / 21 / 31 / 50 | meta / og / twitter / JSON-LD: `de 35 € a 490 € según el nivel` | S |
| 102 | FAQ JSON-LD: `Entre 70 € y 150 € … parten de 30-40 €. … entre 300 € y 500 €.` | M |
| 218-220 | `entre 70 € y 150 € … 30-40 € … 400-500 €` | M |
| 222 | `IVA incluido: Refresh por 35 €, Deep Clean por 150 € y Showroom Reset por 490 €.` | S + T |
| 236 | header `Precio de mercado` / `En SERRES (IVA incl.)` | T |
| 239 | Limpieza básica interior · `25-50 €` · `Refresh, 35 €` | M + S |
| 240 | Limpieza parcial · `40-70 €` · `—` | M |
| 241 | Limpieza de tapicería completa · `70-150 €` · `Deep Clean, 150 €` | M + S |
| 242 | Detallado interior premium · `300-500 €` · `Showroom Reset, 490 €` | M + S |
| 247 | `lavadero de 25 €` | M |
| 272-273 | `Deep Clean de 150 € … ningún servicio de 25 €` | S + M |
| 279 / 282 / 285 | `(30-50 €)`, `(100-150 €)`, `(300-500 €)` | M |
| 289-291 | resale sentence (see §1b) `300 € y 800 €`, `490 €`, `150 €` | M/D + S |
| 311 / 327 / 330 | `20-40 €`, `20-60 €`, `30-50 €` | M |
| 339 / 341 / 343 | `Refresh (35 €)`, `Deep Clean (150 €)`, `Showroom Reset (490 €)` | S |
| 354-357 | visible FAQ copy of 102 | M |
| 422 | related card: `Desde 250 € por piezas y desde 1.490 € el cambio de color completo` | S |
| 434 | related card: `Refresh 35 €, Deep Clean 150 € y Showroom Reset 490 €` | S |

### 3.14 `blog/ppf-o-ceramico-que-elegir.html` (37 €, 23 lines; `IVA` 1)
| Line | Content | Type |
|---|---|---|
| 8 / 22 / 33 / 57 | meta / og / twitter / JSON-LD: `PPF desde 890 € o cerámico desde 340 €` | S |
| 118 | FAQ JSON-LD: `Por 890 € proteges la zona crítica…` | S |
| 201-203 | `desde 890 € el frontal y 2.390 € … el tratamiento cerámico va de 340 € a 890 €` | S |
| 236 | table row `Precio orientativo (IVA incl.)` · `Frontal 890 € · Pro 1.190 € · carrocería completa 2.390 €` · `Esencial 340 € · Signature 590 € · Concours 890 €` | S (note "Esencial") |
| 241-242 | `entre 1.500 € y 3.000 €, y el coche completo entre 4.000 € y 8.000 €` | M |
| 277-279 | `Desde 340 € … queda en 890 €.` | S |
| 290-291 | `(890 €)` … `carrocería completa (2.390 €)` | S |
| 293 | `Signature (340-590 €)` | S |
| 297 | `600-900 €` repaint | M |
| 307 | `Cera o sellante tradicional (30-80 €)` | M |
| 309 / 311 / 313 | `(340-890 €)`, `(890-1.190 €)`, `(2.390 €)` | S |
| 357 | visible FAQ copy of 118 | S |
| 407 | related card: `frontal desde 890 € y carrocería completa 2.390 €` | S |
| 413 | related card: `desde acentos por 250 €` | S |

### 3.15 Pages with ZERO price/currency content
`pages/gallery.html`, `pages/projects.html` (Exclusivo — "priced as a single project", no numbers), `assets/serres-enhance.js` (no €), `assets/*.css`, `sitemap.xml`, `robots.txt`, `.htaccess` (sitemap only names `pages/prices.html` :39 and the blog slug `limpieza-tapiceria-coche-precio.html` :79 — slug work belongs to the blog/SEO key).

---

## 4. `assets/serres-i18n.js` — prices inside the dictionary

Engine facts relevant to prices (all cited): `LANGS` :23, `LABELS` :24, `DICT` :31-1172 (790 entries), `INV` built :1174-1181 from `DICT[k][0]` (ES) → key, `enKeyOf` :1184-1188 (tries DICT key first, then INV), default language `"es"` :1196, `tr` :1200-1206, `affix` :1210-1221 (strips leading/trailing whitespace and wrapping quotes before matching — so a price string must match exactly *inside* those), `bindText` :1234-1251 (skips SCRIPT/STYLE/TEXTAREA, anything under `[data-i18n-skip]`, and `[data-en]` hosts), `bindAttrs` :1258-1275 (only `aria-label`, `title` — none carry prices), `bindMeta` :1323-1331 (only `<title>` and `meta[name=description]`), public API `window.SERRES_I18N.t = tr` :1464-1468.

### 4.1 All 18 EN keys carrying €/EUR/VAT (byte-exact tokens found by parsing DICT)
| i18n line | Tokens in EN key | Key (start) | ES value (prices) |
|---|---|---|---|
| 229 | `€890`, `€250`, `€340`, `€35`, VAT | "PPF (from €890), Car Wrap (from €250), Ceramic Coating (from €340) and detailing (from €35), VAT included. Three levels…" | :230 "Precios de PPF (desde 890 €)…" (= prices.html:306) |
| 243 | `EUR`, VAT | "© 2026 SERRES. All rights reserved. \u00A0·\u00A0 Guide prices in EUR, VAT included" | :244 (= prices.html:348 footer; HTML uses `&nbsp;`) |
| 389 | `890 €` | "We install PPF in Barcelona… Self-healing film with a 3-year warranty, from 890 €. …" | :390 (= ppf.html:486) |
| 530 | `€150.` | "Car detailing in Barcelona… Deep Clean from €150." | :531 (= detailing.html:345) |
| 648 | `€1,490,` | "Car wrapping in Barcelona… Full car from €1,490, fully reversible…" | :649 (= vinyl.html:515) |
| 684 | `€450.` | "We fit body kits in Barcelona… from €450. …" | :685 (= body-kits.html:456) |
| 1015 | `€890,` `€250,` `€340` `€35,` VAT | "PPF from €890, Car Wrap from €250, Ceramic Coating from €340 and detailing from €35, VAT included. Ask SERRES for your exact quote." | :1016 (= prices.html:7 meta description) |
| 1043 | VAT | "Every project is booked by appointment… with published guide prices, VAT included." | (= index.html:816) |
| 1045 | `890 €`, `2,390 €`, VAT | "The front-end PPF pack starts at 890 € and the full car at 2,390 €, with a 3-year film warranty and VAT included. …" | (= index.html:658/820) |
| 1056 | `890 €`, **`1.190 €`, `2.390 €`** (Spanish dot-thousands inside an English key), VAT | "The front pack starts at 890 €, the full front at 1.190 € and the full body at 2.390 €, VAT included. …" | (= ppf.html:382/657) |
| 1066 | `340 €` | "They are different things: PPF physically protects… Ceramic Coating SiO₂ (from 340 €) adds gloss…" | (= ppf.html:422/682) |
| 1074 | VAT, `€35,` `€150` `€490.` | "We work with three fixed tiers, VAT included: Refresh from €35, Deep Clean … from €150 and Showroom Reset … from €490. …" | (= detailing.html:452/524) |
| 1078 | `€150` | "We steam-treat every panel… It is included from the Deep Clean tier (from €150)." | (= detailing.html:462/540) |
| 1090 | VAT, `€340,` `€590` `€890.` | "We work with three fixed packs, VAT included: Essential from €340, Signature from €590 and Concours from €890. …" | (= ceramic.html:300/521) |
| 1114 | `€450.` `€1,490,` `€3,490,` VAT | "Aero add-ons —splitter, diffuser or spoiler— start at €450. A complete kit with fitting and paint starts at €1,490, and a full widebody transformation from €3,490, VAT included. …" | (= body-kits.html:352/547) |
| 1136 | `340 €`, VAT, `590 €`, `890 €` | "At SERRES Wrap Center polishing with a SiO₂ Ceramic Coating starts at 340 € (Essential, VAT included). The Signature level… costs 590 €, and the Concours… 890 €. …" | (= paint-correction.html:390/597) |
| 1144 | `890 €` | "The SiO₂ Ceramic Coating protects… self-healing PPF (from 890 € for the front end) includes a 3-year film warranty." | (= paint-correction.html:422/613) |
| 1155 | `€1,490`, VAT, `€250`, `€1,990.` | "A full colour change with 3M, Avery Dennison or Inozetek films starts at €1,490 VAT included; accents… from €250 and the Signature finish… from €1,990. …" | (= vinyl.html:424/629) |

**Format chaos in the EN keys — four styles coexist:** `€890 / €1,490` (symbol-first, comma) 24 tokens; `890 €` (ES style in English) 8 tokens; `2,390 €` 1 token; `1.190 € / 2.390 €` (Spanish dots in English) 2 tokens. ES values are consistent: `890 €` ×32, `1.490 €` ×9; CA identical (41 €). For Miami every EN key must be normalised to `$1,490` and the inline EN HTML must equal the key byte-for-byte (§4.3).

### 4.2 ES/CA values that carry prices while their EN key does NOT (meta-description "legacy" block, header comment at :992-993)
| i18n line | ES value (with price) | EN key (no price) | Page |
|---|---|---|---|
| 997 → 998/999 | "…Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona." | "SERRES PPF — self-healing paint protection film…" | ppf.html:7 |
| 1000 → 1001/1002 | "…Coche completo desde 1.490 €. Sant Cugat del Vallès." | "SERRES Car Wrap — full and partial colour-change wraps…" | vinyl.html:7 |
| 1003 → 1004/1005 | "…Desde 340 €. Sant Cugat, Barcelona." | "SERRES Ceramic Coating — a liquid-glass SiO₂ layer…" | ceramic.html:7 |
| 1009 → 1010/1011 | "…Deep Clean desde 150 €, Showroom Reset desde 490 €. …" | "SERRES Detailing — deep interior steam-cleaning…" | detailing.html:7 |
| 1012 → 1013/1014 | "…Desde 450 €. Sant Cugat del Vallès." | "SERRES Body Kits — aggressive aero…" | body-kits.html:7 |
After inversion the EN inline meta descriptions become the keys; decide whether the EN descriptions carry USD prices (recommended for parity with today's ES SEO copy) and write the ES values as translations. Note `bindMeta` (:1326) binds `meta[name="description"]` only; `og:description`/`twitter:description` on lines 13/20 of each service page are static and must be authored in EN+USD directly.

### 4.3 Byte-exact matching traps for price strings
- `affix()` (:1210) trims outer whitespace/quotes only; internal spacing, `€` spacing, en-dash vs hyphen, NBSP all must match. HTML `&nbsp;·&nbsp;` (prices.html:348) becomes `\u00A0·\u00A0` in the DOM and is written that way in the key (:243).
- The 8 no-space `890€` tokens (blog ppf meta) are inside `data-i18n-skip`-free `<head>` meta tags but are NOT dictionary keys today (blog descriptions are not in DICT) — only `<title>`/`meta description` would be looked up, and they simply miss.
- Blog article bodies are wrapped in `data-i18n-skip` (`article.prose` e.g. blog/cuanto-cuesta-ppf-coche.html:197, `post-meta` :162, `rel-grid` :404; blog/index.html `post-grid` :88, h1 :81) → **none of the ~180 blog price occurrences are in DICT**; only blog H1/labels exist as keys (:1032 "How much does it cost to wrap a car", :1050 "PPF or ceramic", :1103 "How much does PPF cost"). The Miami blog is therefore EN-only unless the port writes ES article bodies — out of scope for this key, but the orphan-scanner must treat `data-i18n-skip` regions as intentionally untranslated.
- `_build/dict-tools.js` (`check`/`lookup`/`merge`) reads `DICT` by scanning for `var DICT = {` (:15) and treats values as `[es, ca]` pairs (:39, :50, :93). After pruning CA to single-element arrays, `v[1]` becomes `undefined` — `check`/`lookup` still work (guarded by `if (!val) return`), but `merge` (:93) will append `[es, undefined]` → `"undefined"` unless updated.

---

## 5. JSON-LD price schema — exact locations

| Page | Block | Type | Offers (name → price) | Extras |
|---|---|---|---|---|
| index.html | :612-647 | AutoBodyShop | — | `priceRange "€€€"` :620 |
| pages/why-serres.html | :232-… | AutoRepair | — | `priceRange "€€"` :241 |
| pages/prices.html | :238-260 | Service + `hasOfferCatalog` | Car Wrap 250 (:255) · PPF 890 (:256) · Corrección + Ceramic 340 (:257) · Detailing 35 (:258) · Body kits 450 (:259) | each: `description "Desde N €, IVA incluido"`, `priceCurrency EUR`, `url` serreswrapcenter.es; provider address/telephone :246-253 |
| services/ppf.html | :326-369 | `offers[]` | PPF frontal 890 · PPF frontal completo 1190 · PPF carrocería completa 2390 | PriceSpecification (price, EUR, `valueAddedTaxIncluded:true`), `availability InStock`, `url` |
| services/vinyl.html | :371-411 | `offers[]` | Acentos 250 · Cambio de color completo 1490 · Signature 1990 | PriceSpecification + `minPrice` + VAT flag; no url |
| services/ceramic.html | :265-287 | `offers[]` | Cerámico Essential 340 · Signature 590 · Concours 890 | NO PriceSpecification; `description` strings embed "Desde N € IVA incluido" (:271/278/285) |
| services/paint-correction.html | :337-377 | `offers[]` | Corrección + CC Essential 340 · Signature 590 · Concours 890 | PriceSpecification + VAT flag + availability |
| services/detailing.html | :597-643 | `offers[]` | Refresh 35 · Deep Clean 150 · Showroom Reset 490 | PriceSpecification + `minPrice` + VAT flag + url |
| services/body-kits.html | :298-339 | `hasOfferCatalog` | Complementos aerodinámicos 450 · Kit completo 1490 · Transformación / widebody 3490 | PriceSpecification with `minPrice` only + VAT flag |

Every `priceCurrency` (41) → `USD`. `valueAddedTaxIncluded` (15) has no clean US meaning — drop it or set `false`; do not leave `true`. `price` values are plain integers (no decimals) — keep that shape with the USD numbers. The five prices.html Offer `url`s and the ppf/detailing Offer `url`s point at `https://serreswrapcenter.es/...` (domain key).

FAQ JSON-LD ↔ visible-text coupling: `_build/verify-seo.js:70-78` requires every FAQPage `name` and `acceptedAnswer.text` to appear verbatim in the page HTML. Price-bearing FAQ pairs: index 658↔820; ppf 382↔657, 422↔682; vinyl 424↔629; ceramic 300↔521; paint-correction 390↔597, 422↔613; detailing 524↔452, 540↔462; body-kits 352↔547; blog ppf 95↔339-341, 110↔360-361; blog limpieza 102↔354-357; blog ppf-o-ceramico 118↔357. Change both halves identically. The check is a plain `html.includes(text)` against the raw file, and it passes on every page today (see §8 output), so whatever wrapping/spacing the visible copy uses currently satisfies it — keep the JSON-LD `text` and the visible paragraph byte-identical after editing, exactly as they are now.

---

## 6. Tax wording ("IVA") — every place

Totals: `IVA` 51 in HTML + 22 in i18n (11 ES "IVA incluido/incl." + 11 CA "IVA inclòs") = **73**; `VAT` 11 (EN keys); `valueAddedTaxIncluded` 15; "sin IVA" 1.

Variants in HTML (exact substrings, counts): `IVA incluido` 39 · `con IVA incluido` 7 · `e IVA incluido` 4 (index ×3, blog ppf ×1) · `IVA incl.` 4 (table headers/cells: blog ppf :227, vinilar :234, limpieza :236, ppf-o-ceramico :236) · `sin IVA` 1 (vinilar :329) · bare `IVA;` 1 (blog ppf :239).

By file — index.html :658, :816, :820 · pages/prices.html :7, :13, :20, :242, :255-259, :306, :348 · body-kits :273, :352, :547 · ceramic :246, :271, :278, :285, :300, :521 · detailing :452, :524 · paint-correction :390, :597 · ppf :382, :657 · vinyl :424, :629 · blog/index :121 · blog ppf :8, :22, :33, :49, :95, :203, :222, :227, :239, :323, :341 · blog vinilar :221, :234, :328-329, :381 · blog limpieza :222, :236 · blog ppf-o-ceramico :236 · i18n :230-231, :244-245, :1016-1017, :1043-1045, :1056, :1074, :1090, :1114, :1136, :1155 (ES/CA halves) and the 11 EN keys listed in §4.1.

US replacement is a **client decision** (tax-inclusive display is unusual in the US; typical wording is "plus sales tax" / "tax not included" or silence). Do not invent; brief says every unlisted datum = "confirmar con el cliente". Whatever is chosen, the ES translation must not reintroduce "IVA".

---

## 7. Prices in alt text, OG, and non-shipped files

- `alt=` / `title=` / `aria-label=` containing `€` or a price: **none** (grep over all in-scope HTML).
- OG/Twitter descriptions containing prices (static, NOT translated at runtime): pages/prices.html :13/:20; services/ppf :13/:20; vinyl :13/:20; ceramic :13/:20; detailing :13/:20; body-kits :13/:20; blog ppf :22/:33; blog vinilar :21/:31; blog limpieza :21/:31; blog ppf-o-ceramico :22/:33. Meta `name=description` with prices: same pages at :7 (services/prices) and :8 (blog).
- `_build/agg-report.json` — 108 `€`, en/es/ca FAQ strings (:84-86, :139-141, :189-191, :229-231, :249-251, :309-311, :429-431, :539-540 …). Not referenced by any HTML/JS (grep `agg-report` = 0 hits outside itself). It is an SEO-package aggregation artifact; either exclude it from the copy or accept it as stale (it would fail a naive repo-wide `grep €`).
- `_build/optimize-images.js:69` and `_build/verify-seo.js:17-18` reference the blog slug `limpieza-tapiceria-coche-precio` — slug-rename dependency.

---

## 8. `_build/verify-seo.js` — the known prices.html FAIL, precisely

Executed today (script only reads files; `process.exit(0)` always):
```
OK    index.html
OK    pages/gallery.html
FAIL  pages/prices.html
   - broken ref '+WA+msg+'
OK    … (13 more OK)
1 page(s) with problems
```
Cause: `verify-seo.js:60` collects `(?:src|href)="([^"#{}]+?)"` over the **whole file including inline scripts**. In `pages/prices.html:534` the template string `'<div class="t-cta"><a class="btn'+(t.pop?'':' ghost')+'" href="'+WA+msg+'" target="_blank" …'` yields the capture `'+WA+msg+'`; it does not match the `^(https?:|#|tel:|mailto:|data:|javascript:)` exclusion at :61, so :66-67 resolves `path.resolve('pages', "'+WA+msg+'")`, finds no file, and reports `broken ref`. It is a false positive: the real href is built at runtime from `WA` (:463) + `msg` (:525). It will persist after the port unless either the verifier skips `<script>` bodies or the template is written as `href="' + WA + msg + '"` with spaces (the regex would then still capture `' + WA + msg + '`). Simplest: strip `<script>…</script>` before the ref scan.

Two more verifier facts the port will trip on (not price-specific, but discovered here): `verify-seo.js:45` hard-codes `G-1K6FYZ99GN` — with the new GA4 ID every page will FAIL `gtag head x0` until updated; and `PAGES` :11-19 hard-codes the four Spanish blog slugs — will report `MISSING` after the slug rename.

---

## 9. US format the port must emit — and the exact edits per generator

Target: `$1,490` — dollar sign first, no space, comma thousands, no decimals (`$35`, `$890`, `$1,190`, `$2,390`, `$3,490`); "from $890"; ranges as `$900–$1,700` (repeat the symbol) — ranges only appear in blog market copy, which is being rewritten anyway; `priceRange` → `$$$` on both index.html:620 and why-serres.html:241.

| Generator | Today | Miami |
|---|---|---|
| `fmtEur` prices.html:489 | `1.490 €` | `'$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')` → `$1,490` (rename to `fmtUsd`; 5 call sites :491/:493/:497/:532/:554) |
| static snapshot prices.html:322/:331 | `250 €`, `1.490 €`, `1.990 €`, `desde 1.490 €` | `$250`, `$1,490`, `$1,990`, `from $1,490` — re-bake whole `#svcTabs/#svcIntro/#tierGrid/#cmpTable` in EN |
| PRICING integers :360-448 | EUR ints | USD ints (client table §1) |
| JSON-LD `price`/`minPrice` (all pages) | EUR ints | USD ints; `priceCurrency:"USD"`; Offer `description` strings in EN "From $250" |
| DICT EN keys (18) | mixed `€890`/`890 €`/`1.190 €` | all `$890`, `$1,190`, … and identical bytes in the inline HTML |
| ES values (41 €) | `890 €` / `1.490 €` | Miami Spanish: keep `$` and US grouping (`$1,490`) so ES and EN show the same number — confirm with client; do NOT reintroduce dot-thousands |
| footer prices.html:348 + key :243 | "Guide prices in EUR, VAT included" | "Guide prices in USD, …tax wording TBD" |

Sanity greps for acceptance after the port (all must be 0): `€`, `EUR`, `IVA`, `VAT included`, `euro`, `\u20AC`, `valueAddedTaxIncluded": true`, `1\.[0-9]{3} ` (dot-thousands), `priceRange": "€`.

---

## 10. Risks / surprises (ordered by likelihood of biting the port)

1. **prices.html has a hand-baked static snapshot (lines 314-331) with no generator** in `_build/` — Spanish + EUR + Spanish WA hrefs. Text substitution alone leaves `desde 1.490 €` visible to no-JS crawlers on the EN page. Must be re-baked (the `class=""` artifacts show it was an `innerHTML` dump).
2. **EN dictionary keys use four different price formats** (`€890`, `890 €`, `2,390 €`, and `1.190 €`/`2.390 €` with Spanish dots at i18n:1056). Normalising to `$…` changes the keys → every inline EN string must be rewritten to the new bytes or it becomes an orphan.
3. **Blog contains arithmetic derived from EUR** (300 € difference :255; 240 €/yr, 20 €/mo, 40 €/mo :301-303) — substitution would produce wrong maths; recompute from the USD table.
4. **~90 Spanish-market price ranges** (§1c) with no Miami equivalent; converting them would be fabrication. Cut or replace with client-confirmed US ranges.
5. **Two SERRES prices exist only in blog articles** (PPF spot zones "desde 60–150 €" ppf:233; SUV wrap "Presupuesto cerrado previo" vinilar:239) — they must be on the client's USD sheet or removed deliberately.
6. **`valueAddedTaxIncluded: true` ×15** and "IVA incluido" in 51 places; the US tax display rule is unresolved client data. `ceramic.html` embeds the tax wording inside Offer `description` strings (:271/278/285) rather than a flag.
7. **`priceRange` mismatch** today (`€€€` vs `€€`) — brief says `$$$`; set both.
8. **WhatsApp pre-filled text is Spanish-hardcoded in JS** (prices.html:525, serres-enhance.js:15) and in 3 static hrefs (prices.html:322) — EN base needed; ideally per-language via `T()`.
9. **`890€` no-space variant** (8×, blog ppf :8/:22/:33/:49) — a `N €` regex misses it.
10. **verify-seo.js** will FAIL every page (GA4 ID hard-coded :45) and report MISSING blog pages (:17-18) after the port; the prices.html `'+WA+msg+'` false positive (:60) persists.
11. **`_build/agg-report.json`** (108 €) is an unreferenced artifact — will pollute a repo-wide `grep €` unless excluded.
12. **Body kits**: prices page hides numbers (`quote:true`) while JSON-LD/FAQ/meta/lead publish 450/1.490/3.490 — decide once.
13. **Ceramic and Paint-correction pages publish the same three prices under different Offer names** — one USD line each, two edit sites.
14. **`dict-tools.js merge`** (:93) writes `[es, ca]` pairs; after CA removal it will emit `undefined` unless adapted (only matters if the port uses it to append entries).
15. **Blog article bodies are `data-i18n-skip`** → not in DICT at all; the orphan scanner must whitelist skip regions or it will report ~180 "orphans" that are by design.
16. **FAQ JSON-LD ↔ visible-text coupling** enforced by verify-seo.js:70-78 — every price change in a FAQ must be made twice, byte-identical (17 pairs listed in §5).
17. i18n default language `"es"` at serres-i18n.js:1196 (and the `SERRES — Prices` title key :225 that differs from the ES title) — belongs to the i18n key but directly changes which price render wins on first load.
