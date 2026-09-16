# SERRES WRAP CENTER — US Website Technical Specification (v1.0, 2026-08-25)

Build the US website for Serres Wrap Center — a premium PPF / wrap / ceramic / tint / detailing studio opening in Boca Raton–Pompano Beach, FL. This spec is self-contained: every price, route, keyword, and acceptance criterion is in this file. The existing Spanish site (serreswrapcenter.es) is a *reference for brand feel only* — do not port its content, prices, or language.

**Two hard deadlines:**

| Date | Deliverable |
|---|---|
| **Sep 15, 2026** | Full site live on production domain, submitted to Google Search Console |
| **Nov 2, 2026** | `/reserve` page accepting $100 deposits (Founders Club) |

Soft opening (detailing services): **Nov 13, 2026**. Full PPF launch: **Dec 8, 2026**.

---

## 0. How to work through this spec with Claude Code

1. Put this file in the repo root as `SPEC.md`. Commit it first.
2. Create `CLAUDE.md` from §2.3 before writing any code — it makes every Claude Code session follow the same conventions.
3. Work phase by phase (§12). Feed Claude Code one task ID at a time, e.g.: *"Read SPEC.md. Implement task P2-3. Follow CLAUDE.md conventions. When done, run the checks in the task's DoD and show me the results."*
4. Never let a session invent prices, addresses, or claims. All prices come from `src/data/pricing.ts` (§3). Anything unknown gets `TODO(owner)` and is listed in the PR description.
5. One task = one commit (or one small PR). Commit message format: `P2-3: pricing page with tier tables`.
6. After each phase, run the phase QA block and fix failures before starting the next phase.

---

## 1. Project summary

- **Business:** premium car protection studio. Services: PPF (paint protection film), color-change wraps, ceramic coating, window tint, detailing/paint correction.
- **Market:** Boca Raton / Delray Beach / Pompano Beach / Deerfield Beach / Fort Lauderdale, FL. Customers: Tesla owners, trucks/SUVs, luxury & exotics.
- **Positioning:** transparent pricing ("no bait pricing"), proven Barcelona track record, 3M + NAR films, 1-year installation warranty.
- **Primary goals:** rank for local SEO queries (§8) and convert visitors to (a) quote requests, (b) phone/WhatsApp/SMS contact, (c) Founders Club reservations with deposit.
- **Language:** English only at launch. Spanish `/es` is deferred (build i18n-ready, §6.13).
- **Tone:** confident, specific, zero fluff. Short sentences. Prices visible everywhere. No stock-photo look.

Constraints:

- No CMS at launch. Content lives in the repo (Markdown/TS data files). Owner edits via PRs.
- Static-first. No server runtime except the reserve-form handler (§7).
- Budget hosting: Vercel or Netlify free/pro tier.
- The exact street address is unknown until October. Use the placeholder defined in §4.3 everywhere; it must be swappable in one file.

---

## 2. Tech stack & repo conventions

### 2.1 Stack (recommended; substitute only with equal-or-better and note why in PR)

- **Framework:** Next.js 15 (App Router) with `output: "export"` (static export) — or Astro 5. Either must produce fully static HTML per route.
- **Styling:** Tailwind CSS. Dark premium theme (§5).
- **Fonts:** Inter (400/600/800) via `next/font` or self-hosted woff2. No render-blocking font CDNs.
- **Images:** all local, WebP/AVIF, responsive `srcset`, lazy-loaded below the fold. Hero poster ≤ 120 KB.
- **Video:** self-hosted MP4/WebM ≤ 4 MB with poster image, `preload="none"`, autoplay muted loop only in hero.
- **Forms:** static form POST to a serverless function (Vercel/Netlify function) → email + Google Sheets webhook (§7.4). No client-side secrets.
- **Analytics:** GA4 + Meta Pixel via a single `src/lib/analytics.ts` wrapper (§9).

### 2.2 Repo layout

```
/SPEC.md                  ← this file
/CLAUDE.md                ← conventions (§2.3)
/src/data/pricing.ts      ← SINGLE SOURCE OF TRUTH for all prices
/src/data/business.ts     ← NAP, hours, phone, social, address placeholder
/src/data/seo.ts          ← per-route titles/descriptions (from §8.2)
/src/data/faq.ts          ← FAQ items per service
/src/components/          ← shared components (§5.3)
/src/app/... or /src/pages/…  ← routes from §4.1
/public/media/            ← images/video, kebab-case names
/content/blog/            ← markdown posts (empty at launch, structure ready)
```

### 2.3 `CLAUDE.md` (create verbatim, then extend as needed)

```markdown
# Serres US website — conventions
- Prices, phone, address, hours: import from src/data/*. NEVER hardcode in components or copy.
- Currency format: $1,900 (comma thousands, no cents). Always prefix "from" for starting prices.
- Every page: exactly one <h1>; title/meta from src/data/seo.ts; OG tags; canonical.
- Components must pass mobile-first review at 390px width. No horizontal scroll anywhere.
- Every CTA fires an analytics event via src/lib/analytics.ts (never inline gtag/fbq calls).
- No external scripts except GA4 and Meta Pixel. No jQuery, no UI kits, no cookie-consent SaaS.
- Images: WebP, width-capped, alt text describing car + service ("Tesla Model Y full front PPF, Boca Raton").
- Do not invent facts, reviews, numbers, or legal text. Unknown → TODO(owner) + list in PR.
- Legal disclaimers: prices exclude FL sales tax; "from" = standard sedan; film warranty by manufacturer.
- Blog posts: /content/blog/*.md with frontmatter {title, description, date, slug}.
- Run `npm run build && npm run lint` before declaring any task done.
```

---

## 3. Pricing data — single source of truth

Create `src/data/pricing.ts` with exactly this data. Components render FROM this file; the PDF price list and this file must always match. `published: false` items exist in data but must NOT render at launch.

```ts
export const FILM_TIERS = {
  essential: { label: "Essential", film: "NAR H190 PPF", note: "Self-healing 7.5-mil TPU, 10-yr film warranty" },
  signature: { label: "Signature", film: "3M Scotchgard Pro Series 200", note: "3M flagship PPF, up to 10-yr 3M warranty" },
} as const;

export const PPF = [
  { id: "partial-front", name: "Partial Front", coverage: "Full bumper, partial hood & fenders, mirrors",
    priceEssential: 1000, priceSignature: 1150, published: true },
  { id: "full-front", name: "Full Front", coverage: "Full hood, full fenders, bumper, mirrors",
    priceEssential: 1900, priceSignature: 2150, published: true, popular: true },
  { id: "track-pack", name: "Track Pack", coverage: "Full front + rocker panels + A-pillars + leading roof edge",
    priceEssential: 2600, priceSignature: 2900, published: true },
  { id: "full-body", name: "Full Body", coverage: "Every painted panel",
    priceEssential: 4995, priceSignature: 5600, published: true },
];

export const WRAPS = [
  { id: "chrome-delete", name: "Chrome Delete", price: 450, from: true, published: true },
  { id: "color-change", name: "Full Color Change", price: 3500, from: true, published: true,
    note: "3M 2080 / Avery SW900, gloss·satin·matte" },
  { id: "signature-wrap", name: "Signature Wrap", price: 4500, from: true, published: true,
    note: "Premium films: Inozetek, KPMF, color-flip" },
  { id: "accents", name: "Roof / accents / custom", price: null, published: true }, // renders "on request"
];

export const CERAMIC = [
  { id: "ceramic-3yr", name: "3-Year Ceramic Package", price: 1200, from: true, published: true },
  { id: "ceramic-topup", name: "Top-up over PPF / wrap", price: 600, from: true, published: true },
];

export const TINT = [
  { id: "tint-full", name: "Full Car — Ceramic Film", price: 500, from: true, published: true,
    note: "FL-legal VLT options" },
];

export const DETAILING = [
  { id: "interior", name: "Interior Detail", price: 300, from: true, published: true },
  { id: "paint-correction", name: "Paint Correction (1–2 stage)", price: 600, from: true, published: true },
];

export const PACKAGES = [
  { id: "daily-driver", name: "Daily Driver", includes: "Partial front PPF + ceramic", price: 1990, published: true },
  { id: "new-car", name: "New Car", includes: "Full front PPF + ceramic + tint", price: 2990, published: true, popular: true },
  { id: "collector", name: "Collector", includes: "Full body PPF + ceramic", price: 5990, published: true },
];

// Phase 2 — keep unpublished until owner flips the flag:
export const PHASE2 = [
  { id: "windshield-film", name: "Windshield Protection Film", price: 450, from: true, published: false },
  { id: "wheels-calipers", name: "Wheels-Off: rim ceramic + caliper paint", price: 300, from: true, published: false },
  { id: "headlights", name: "Headlight Restoration + PPF", price: 250, from: true, published: false },
  { id: "film-removal", name: "Old Film / Wrap Removal", price: 400, from: true, published: false },
  { id: "color-ppf", name: "Color PPF", price: 6500, from: true, published: false },
];

export const TERMS = {
  deposit: "Booking secured with a 30% deposit.",
  tax: "Prices exclude FL sales tax.",
  fromMeaning: "“From” pricing = real price for a standard sedan in good condition — no bait pricing.",
  warranty: "Manufacturer film warranty (up to 10 years) + 1-year Serres installation warranty.",
  quoteSpeed: "Send your make & model — exact quote within 2 hours.",
};
```

Rendering rules:

- Every PPF card shows both tiers: **Essential from $X · Signature from $Y**. Headline/summary numbers use the Essential price.
- `from: true` → prefix "from". `price: null` → "on request".
- `popular: true` → "Most popular" badge.
- TERMS lines appear (small print) on every page that shows a price.

---

## 4. Site map & global elements

### 4.1 Routes

| # | Route | Page | Phase |
|---|---|---|---|
| 1 | `/` | Home | P1 |
| 2 | `/paint-protection-film` | PPF (primary money page) | P2 |
| 3 | `/car-wraps` | Wraps | P2 |
| 4 | `/ceramic-coating` | Ceramic | P2 |
| 5 | `/window-tint` | Tint | P2 |
| 6 | `/detailing` | Detailing & paint correction | P2 |
| 7 | `/pricing` | Full transparent price list | P2 |
| 8 | `/our-films` | Why 3M + NAR (and why no cheap film) | P2 |
| 9 | `/about` | Barcelona → Boca story, process, team | P1 |
| 10 | `/contact` | Contact / NAP / map | P1 |
| 11 | `/reserve` | Founders Club reservation + deposit | P4 |
| 12 | `/ppf-boca-raton`, `/ppf-fort-lauderdale`, `/ppf-pompano-beach`, `/ppf-delray-beach` | Local SEO landers | P3 |
| 13 | `/blog` (+ `/blog/[slug]`) | Blog index (empty ok) | P3 |
| 14 | `/privacy`, `/terms` | Legal | P3 |
| 15 | `/404` | Not found with CTA | P1 |

### 4.2 Global header / footer

- **Header:** logo (text "SERRES" ok until logo file provided) · nav: Services (dropdown: 5 services) · Pricing · Our Films · About · Contact · CTA button "Reserve — Nov 13" → `/reserve` (before Nov 2: scrolls to quote form instead; behind `RESERVE_LIVE` flag in `business.ts`).
- **Mobile:** hamburger + **sticky bottom bar** with 3 buttons: Call · Text · WhatsApp (fires events, §9).
- **Footer:** NAP block (§4.3) · hours · social (Instagram) · "Se habla español · Говорим по-русски" · legal links · © Serres Wrap Center.

### 4.3 `src/data/business.ts`

```ts
export const BUSINESS = {
  name: "Serres Wrap Center",
  addressLine: "Boca Raton — Pompano Beach area · exact location announced October 2026", // TODO(owner) Oct: real address
  city: "Boca Raton", region: "FL",
  phone: "TODO(owner)",        // +1 number; until provided, hide call buttons behind flag PHONE_LIVE=false
  whatsapp: "TODO(owner)",
  instagram: "https://instagram.com/serreswrap", // TODO(owner): confirm handle
  hours: "Mon–Sat 9:00 AM – 6:00 PM",
  email: "info@serreswrap.com",
  openingSoft: "2026-11-13", openingFull: "2026-12-08",
  RESERVE_LIVE: false, PHONE_LIVE: false,
};
```

---

## 5. Design system

### 5.1 Look

- Dark premium: near-black/navy background (`#0b1220` family), white text, one accent (electric blue `#2a78d6`). Light sections allowed for readability blocks.
- Real photography only (owner provides). No stock cars, no AI-generated cars.
- Density: large hero, generous spacing, price cards with big numerals.

### 5.2 Reference

Match the *feel* of serreswrapcenter.es (dark, minimal, gallery-heavy) but this is a rebuild, not a port. Do not copy its text or layout literally.

### 5.3 Components to build (shared, typed props)

`Hero` (video/image + H1 + sub + 2 CTAs) · `PriceCard` (tiered) · `TierTable` · `PackageCard` · `FaqAccordion` (renders FAQPage schema) · `GalleryGrid` (filterable by service) · `ReviewStrip` (Barcelona reviews at launch) · `CtaBand` ("Get exact quote in 2 hours") · `QuoteForm` (§7.1) · `StickyMobileBar` · `TrustBar` (3M · NAR · 1-yr warranty · Barcelona-proven) · `LocalNap` · `CountdownBadge` (to Nov 13, config-driven).

---

## 6. Page specs

Common to every page: one `<h1>`; title + meta from `src/data/seo.ts` (§8.2); OG image; canonical; `CtaBand` before footer; TERMS small print where prices shown. Copy: write first-draft English yourself following §1 tone; owner replaces via PR by Sep 5. Mark uncertain claims `TODO(owner)`.

### 6.1 `/` Home
Sections in order:
1. Hero: video loop (placeholder gradient until assets arrive) · H1 "Paint Protection Film & Detailing in Boca Raton" · sub: proven in Barcelona, opening Nov 13 · CTAs: "Reserve your spot" + "See pricing".
2. TrustBar.
3. Services grid: 5 cards → service pages, each with starting price from pricing.ts.
4. Packages strip (3 PackageCards).
5. "Proven in Barcelona" block: 2–3 photos, line "300+ cars protected in Barcelona since 2023" `TODO(owner: confirm number)` + link `/about`.
6. Gallery preview (6 tiles) → full gallery on service pages.
7. ReviewStrip (Barcelona Google reviews screenshots at launch).
8. FAQ (4 items) + CtaBand.

### 6.2 `/paint-protection-film`
1. Hero image, H1 "Paint Protection Film (PPF) in Boca Raton".
2. Coverage table: 4 PPF options × both tiers (from pricing.ts), popular badge on Full Front.
3. "3M Signature vs NAR Essential" comparison block (link `/our-films`).
4. Why PPF in Florida: I-95 rock chips, UV/sun fade, love bugs, sand — 4 icon points.
5. Process (5 steps: wash & decon → paint inspection with thickness gauge → HEPA-filtered install bay → install → 1-yr warranty & aftercare).
6. Gallery (PPF filter) · FAQ (6 items: yellowing, self-healing, warranty, duration 1–3 days, care, removal) · CtaBand + QuoteForm.

### 6.3 `/car-wraps` — same skeleton: options table (chrome delete / color change / signature), film brands line, gallery, FAQ (5), QuoteForm.

### 6.4 `/ceramic-coating` — packages table, hydrophobic video slot, "ceramic vs PPF vs both" mini-table, FAQ (5), QuoteForm.

### 6.5 `/window-tint`
- Options from pricing.ts + **Florida legal tint limits table** (content differentiator):
  Sedans: front side ≥ 28% VLT, back side ≥ 15%, rear ≥ 15%. SUV/van: front side ≥ 28%, back side & rear ≥ 6%. Windshield: non-reflective film above AS-1 line only. Medical exemption exists. Mark block `TODO(owner): verify against current FL statute 316.2953–2956 before publish`.
- FAQ (4), QuoteForm.

### 6.6 `/detailing` — interior / paint correction cards, before-after slider (static compare ok), FAQ (3), QuoteForm.

### 6.7 `/pricing`
- Full price list, ALL published items grouped by category, both PPF tiers, packages highlighted.
- Top banner: "No bait pricing" + TERMS.fromMeaning.
- Sticky right rail (desktop): QuoteForm.
- Line under H1: "The only studio in Boca Raton with full transparent pricing." `TODO(owner): confirm claim wording`.

### 6.8 `/our-films`
1. Why we install 3M (60+ years of film science, warranty that pays out, up-to-10-yr coverage).
2. Why we also offer NAR (same TPU class, self-healing topcoat, better price — savings passed to you).
3. **"Why we refuse cheap film"**: TPH vs TPU, yellowing in 6–18 months under FL sun, no real warranty. Position as consumer-protection content.
4. Warranty explainer: manufacturer film warranty + 1-year Serres installation warranty.

### 6.9 `/about` — Barcelona story (2023 → 2026), studio photos ES, "the Serres protocol" (paint thickness gauge at intake · HEPA-filtered bay · anti-static prep · filtered-air dry · gloss measurement · photo documentation), team `TODO(owner)`, opening timeline.

### 6.10 `/contact` — NAP, hours, map embed (city-level pin until address known), all contact buttons, QuoteForm, "Se habla español · Говорим по-русски".

### 6.11 Local landers `/ppf-{city}` (4)
- 400–600 words unique copy each (owner supplies by Sep 5; build with clearly-marked draft copy meanwhile — draft must still be unique per city, mention city landmarks/roads: Glades Rd, Atlantic Ave, I-95, US-1).
- H1 pattern: "Paint Protection Film in {City}, FL". Include: distance/drive time from {City}, services + prices summary (from pricing.ts), 2 FAQs, QuoteForm, LocalBusiness schema with `areaServed: {City}`.
- Cross-link the 4 landers; link from each service page footer.

### 6.12 `/blog` — index renders `/content/blog/*.md`; empty-state "First posts coming after opening". Frontmatter per CLAUDE.md. No launch posts required.

### 6.13 i18n readiness — copy in per-page dicts or MDX so `/es` can be added in December without refactor. Do NOT build `/es` now.

---

## 7. `/reserve` — Founders Club (deadline Nov 2)

### 7.1 QuoteForm (used site-wide, simpler than reserve form)
Fields: name, phone (US format validate), email, car make/model/year (one text field ok), service (select from published items), message (optional). Submit → serverless → email to owner + row to Google Sheets → GA4/Pixel event `quote_submit`. Success state inline ("We reply within 2 hours during business hours").

### 7.2 Reserve page content
1. Offer block: "Founders Club — first 30 cars: **15% off any PPF or wrap** + **free ceramic top-up ($600 value)** + Founding Member status (lifetime 10% off detailing)."
2. Spots-left counter: value from `src/data/business.ts` (`foundersSpotsLeft: 30`), owner edits via PR — no backend.
3. Steps: Reserve with $100 refundable deposit → we contact you within 24h with quote & date → deposit applies to your service.
4. Form: QuoteForm fields + preferred month (Nov / Dec / Jan) + service (PPF/wrap/ceramic/tint/package).
5. On submit success → show **"Pay $100 deposit"** button = link from env `NEXT_PUBLIC_SQUARE_LINK` (Square Payment Link; owner provides; until provided render "We'll send a secure deposit link by text/email").
6. Terms small print: deposit refundable until work begins; applied to final invoice; discount locked to booking-day price list; limited to first 30 cars; one car per reservation.
7. Thank-you state fires `reserve_submit` + (on deposit click) `deposit_click` events.

### 7.3 Anti-spam: honeypot field + 3-second min-fill timer. No CAPTCHA at launch.

### 7.4 Delivery: serverless function env vars `FORM_TO_EMAIL`, `SHEETS_WEBHOOK_URL` (Google Apps Script webhook — create it and document setup in README §"Forms").

---

## 8. SEO

### 8.1 Keyword → page map (primary in bold)

| Page | Keywords |
|---|---|
| `/paint-protection-film` | **ppf boca raton**, paint protection film boca raton, clear bra boca raton, tesla ppf boca raton, ppf cost florida |
| `/ppf-fort-lauderdale` | **ppf fort lauderdale**, paint protection film fort lauderdale |
| `/ppf-pompano-beach` | **ppf pompano beach**, paint protection film pompano beach |
| `/ppf-delray-beach` | **ppf delray beach**, paint protection film delray beach |
| `/ceramic-coating` | **ceramic coating boca raton**, ceramic coating south florida |
| `/window-tint` | **window tint boca raton**, ceramic tint boca raton, florida legal tint |
| `/car-wraps` | **car wrap boca raton**, vinyl wrap fort lauderdale, chrome delete boca raton |
| `/pricing` | ppf prices boca raton, how much does ppf cost |
| `/detailing` | paint correction boca raton, interior detailing boca raton |

### 8.2 Title / meta pattern (store in `src/data/seo.ts`)
- Title: `Paint Protection Film (PPF) Boca Raton — from $1,000 | Serres Wrap Center` (≤ 60 chars where possible; include starting price on money pages).
- Description: 140–155 chars, includes city + price + differentiator ("transparent pricing", "3M films", "1-yr install warranty").

### 8.3 Structured data (JSON-LD, one `<script>` per page)
- Site-wide `AutoRepair` (subtype ok: `AutoBodyShop`):
```json
{ "@context": "https://schema.org", "@type": "AutoRepair",
  "name": "Serres Wrap Center", "image": "https://DOMAIN/og.jpg",
  "address": { "@type": "PostalAddress", "addressLocality": "Boca Raton", "addressRegion": "FL", "addressCountry": "US" },
  "telephone": "TODO", "url": "https://DOMAIN", "priceRange": "$$$",
  "openingHours": "Mo-Sa 09:00-18:00",
  "areaServed": ["Boca Raton","Delray Beach","Pompano Beach","Deerfield Beach","Fort Lauderdale"] }
```
- Service pages: `Service` + `FAQPage` (from FaqAccordion data). Update address fields in ONE place when the real address lands (October).

### 8.4 Technical
`sitemap.xml` + `robots.txt` (allow all, sitemap ref) · canonical on every route · OG/Twitter cards with per-page image fallback · 301 www→apex (or reverse, pick one) · trailing-slash consistency · 404 with links · no orphan pages (every page reachable ≤ 2 clicks from home).

---

## 9. Analytics

`src/lib/analytics.ts` exposes `track(event, params)` → GA4 (`NEXT_PUBLIC_GA4_ID`) + Meta Pixel (`NEXT_PUBLIC_PIXEL_ID`). Fire:

| Event | Where |
|---|---|
| `quote_submit` | any QuoteForm success |
| `reserve_submit` | reserve form success |
| `deposit_click` | Square link click |
| `phone_click` / `sms_click` / `whatsapp_click` | all contact buttons incl. sticky bar |
| `pricing_view` | `/pricing` pageview (GA4 auto ok, keep custom for Pixel) |

Consent: simple dismissible notice bar "We use cookies for analytics" linking `/privacy` (no EU-style blocking consent). Load pixels after first interaction or 3s idle to protect LCP.

---

## 10. Legal (P3)

- `/privacy`: standard template covering GA4, Meta Pixel, form data (name/phone/email), Square handled off-site. Mark `TODO(owner): have reviewed`.
- `/terms`: service terms + deposit terms (§7.2.6) + warranty summary + "prices exclude FL sales tax".
- Footer disclaimers on money pages: TERMS.tax + TERMS.fromMeaning.

---

## 11. Performance budgets (hard gates)

- PageSpeed Insights **mobile ≥ 85**, all Core Web Vitals green (LCP < 2.5s, CLS < 0.1, INP < 200ms) on `/`, `/paint-protection-film`, `/pricing`.
- Total JS < 150 KB gzip per page. Hero media budget: image ≤ 120 KB / video ≤ 4 MB `preload=none`.
- Fonts: max 3 weights, `font-display: swap`, self-hosted.

---

## 12. Phase plan — atomic tasks with Definition of Done

**Suggested Claude Code prompt per task:** *"Read SPEC.md §12. Implement task {ID} only. Follow CLAUDE.md. Show diff summary + run DoD checks."*

### P0 — Setup (target: Aug 27–28)
- **P0-1** Init repo, framework, Tailwind, Inter, base layout, deploy pipeline to Vercel/Netlify with preview URLs. *DoD: `npm run build` clean; preview URL renders a styled placeholder home; Lighthouse mobile ≥ 95 on placeholder.*
- **P0-2** Create `CLAUDE.md` (§2.3), `src/data/pricing.ts` (§3 verbatim), `business.ts`, `seo.ts` skeleton, `analytics.ts` stub. *DoD: type-checks; one demo component renders a PriceCard from data.*
- **P0-3** Buy/connect domain `serreswrap.com` (owner does registrar; you wire DNS + SSL + www redirect). *DoD: https apex live, redirect works.*

### P1 — Frame & simple pages (target: Sep 2)
- **P1-1** Header/footer/nav/mobile sticky bar with flag-gated contact buttons. *DoD: 390px width no overflow; all buttons fire stub events.*
- **P1-2** Component library from §5.3 with Storybook-style demo route `/dev/components` (excluded from sitemap). *DoD: every component renders with mock data.*
- **P1-3** Home page per §6.1 with placeholder media. *DoD: matches section order; CWV budget met with placeholders.*
- **P1-4** `/about`, `/contact`, `/404`. *DoD: NAP from business.ts only; map pin city-level.*

### P2 — Money pages (target: Sep 8)
- **P2-1** `/paint-protection-film` per §6.2. *DoD: prices only from pricing.ts; FAQ schema validates in Rich Results Test.*
- **P2-2** `/car-wraps`, `/ceramic-coating`, `/window-tint` (with FL VLT table), `/detailing`. *DoD: same gates as P2-1.*
- **P2-3** `/pricing` per §6.7. *DoD: every published item present; changing one number in pricing.ts changes it everywhere; no hardcoded prices (grep `\$[0-9]` in components returns only formatter).*
- **P2-4** `/our-films` per §6.8. *DoD: content complete with TODO(owner) marks; internal links to PPF + pricing.*

### P3 — SEO / analytics / legal / performance (target: Sep 12)
- **P3-1** `seo.ts` filled for all routes per §8.2; JSON-LD per §8.3; sitemap/robots/canonical/OG. *DoD: Rich Results Test passes for AutoRepair + FAQPage; `curl` shows unique title/meta per route.*
- **P3-2** 4 local landers per §6.11. *DoD: uniqueness — no two landers share a paragraph (manual diff check).*
- **P3-3** GA4 + Pixel + events per §9 + cookie notice. *DoD: events visible in GA4 DebugView and Pixel Helper.*
- **P3-4** `/privacy`, `/terms`, blog skeleton. *DoD: pages live, linked in footer.*
- **P3-5** Performance pass to §11 budgets. *DoD: PSI screenshots ≥ 85 mobile for the 3 gated pages attached to PR.*
- **P3-6** Launch: Search Console verified, sitemap submitted, production DNS cutover. *DoD: GSC shows sitemap Success; date ≤ Sep 15.*

### P4 — Reserve (build Oct; live Nov 2)
- **P4-1** QuoteForm serverless delivery (§7.1, §7.4). *DoD: test submit lands in email + Sheet; spam honeypot works.*
- **P4-2** `/reserve` per §7.2–7.3 behind `RESERVE_LIVE` flag. *DoD: full flow with test Square link; events fire; flag flips page live.*
- **P4-3** Oct address update: real NAP in `business.ts`, schema address, map pin, Google Business Profile link. *DoD: address appears everywhere from one commit.*

### P5 — Barcelona site tie-in (15 min, any time)
- **P5-1** On serreswrapcenter.es add dismissible banner: "Now opening in Boca Raton, Florida → serreswrap.com". *DoD: banner live, link tagged `?utm_source=es-site`.*

---

## 13. Environment variables

| Var | Purpose | Provided by |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | GA4 | owner (creates property) |
| `NEXT_PUBLIC_PIXEL_ID` | Meta Pixel | owner |
| `NEXT_PUBLIC_SQUARE_LINK` | deposit payment link | owner (Square) |
| `FORM_TO_EMAIL` | form delivery | owner (info@serreswrap.com) |
| `SHEETS_WEBHOOK_URL` | leads sheet | dev creates Apps Script, owner owns the Sheet |

---

## 14. Content assets

**Available now:** full price data (§3) · brand name/tagline · Barcelona site imagery for reference · Barcelona Google reviews (screenshots).
**Owner delivers by Sep 5:** photo/video pack (Google Drive) · final page copy replacing drafts · Instagram handle + US phone · local-lander copy · deposit terms final text.
**Until assets arrive:** build with clearly-labeled drafts and gradient/photo placeholders — never fake reviews, never stock cars, never invented numbers.

---

## 15. Final acceptance checklist (run before Sep 15 sign-off)

1. All routes from §4.1 live, no lorem ipsum, all TODO(owner) items listed in a single `TODO.md`.
2. Grep check: no hardcoded prices/phone/address outside `src/data/`.
3. PSI mobile ≥ 85 & CWV green on `/`, `/paint-protection-film`, `/pricing` (screenshots in PR).
4. Rich Results Test: AutoRepair + FAQPage + Service pass; sitemap submitted in GSC.
5. Unique title/meta/H1 per page; prices present in money-page titles.
6. Forms deliver to email + Sheet; all §9 events verified in GA4 DebugView + Pixel Helper.
7. Mobile 390px: no horizontal scroll; sticky bar works; tap targets ≥ 44px.
8. Legal pages linked; cookie notice shows once; privacy covers GA4/Pixel/forms.
9. `RESERVE_LIVE=false` hides `/reserve` from nav & sitemap until Nov 2.
10. Repo: README with local-dev + deploy + forms setup; `CLAUDE.md` current; `SPEC.md` (this file) committed.

— end of spec —
