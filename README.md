# SERRES Wrap Center — US site

The Boca Raton site for SERRES Wrap Center, built from the design of the Barcelona site
(serreswrapcenter.es) with the content, pricing and SEO of `SERRES-US-WEBSITE-SPEC_1.md`.

Static, hand-coded, **no build step to serve it**. Open `index.html` through a local
server and that is the site. `_build/` holds Node tooling that regenerates parts of the
HTML; it is never served.

---

## Local development

```bash
node _build/serve.js              # http://localhost:8787
```

A plain file:// open mostly works, but directory routes (`/pricing/` → `pricing/index.html`)
need the server, so use it.

## Changing content

| To change… | Edit… | Then run |
|---|---|---|
| **any price** | `assets/pricing.js` | `node _build/us/build.js` |
| **phone / address / hours / email / flags** | `assets/business.js` | `node _build/us/build.js` |
| **a page title or meta description** | `_build/data/seo.json` | `node _build/us/build.js` |
| **an FAQ** | `_build/data/faq.json` | `node _build/us/build.js` |
| **header / footer / CTA band markup** | `_build/partials/*.html` | `node _build/us/build.js` |
| **page body copy** | the page's own `index.html`, outside any `REGION` | nothing |

**Never type a dollar amount, phone number, address or opening hour into a page.**
They live in `pricing.js` / `business.js` and are stamped in. A price in the middle of a
sentence is written as a token and keeps its key beside it:

```html
{{PRICE:full-front.essential}}
→ <!--P:PRICE:full-front.essential-->$1,900<!--/P-->
```

Re-running the build recomputes it in place, so changing one number in `pricing.js`
updates the price tables, the page titles, the meta descriptions, the FAQ answers, the
JSON-LD offers and the prose — everywhere, in one command.

Token grammar: `{{PRICE:<id>}}`, `{{PRICE:<id>.essential|.signature}}`,
`{{STARTING:<group>}}`, `{{PERMONTH:<id>[.<tier>]:<years>}}`.
Inside an FAQ answer the namespace is lowercase: `{{price:…}}`, `{{startingAt:…}}`,
`{{terms:…}}`, `{{business:…}}`.

## Generated regions — do not hand-edit

```html
<!-- REGION:header --> …generated… <!-- /REGION:header -->
```

`header` · `footer` · `trustbar` · `ctaband` · `terms` · `seo` · `jsonld` ·
`faq:<route>` · `prices:<group>` · `startingat:<group>`

Anything you type inside a region is overwritten on the next build.
`node _build/regen.mjs --check` exits non-zero if a region was hand-edited.

## Build

```bash
node _build/us/build.js              # build, then run every gate
node _build/us/build.js --check      # gates only, change nothing
node _build/us/build.js --no-gates   # build only
```

Order matters and `build.js` enforces it:
`install-blog → merge-faq → regen → price-tokens → wire-assets`.
Every step is idempotent — running the build twice changes nothing the second time.

## Gates

| Command | What it proves |
|---|---|
| `node _build/regen.mjs --check` | nobody hand-edited a generated region |
| `node _build/us/verify-links.js .` | every internal href/src resolves to a real file |
| `node _build/us/verify-prices.mjs .` | every `$` traces to `pricing.js`; no EUR/IVA; nothing `published:false` rendered |
| `node _build/us/verify-seo-lengths.js .` | title ≤60, description 140–155, one `<h1>`, canonical present, no duplicates |
| `node _build/us/verify-css-contract.js .` | every `us-` class in the markup is actually styled |
| `node _build/us/verify-landers.js .` | the 4 local landers are unique and city-anchored (spec P3-2) |
| `node _build/count-terms.js .` | no Barcelona NAP, EUR, `+34` or old domain left |
| `node _build/verify-seo.js` | visible FAQ text is byte-identical to the FAQPage JSON-LD |

## Screenshots

```bash
node _build/screenshots.js --root "<ABSOLUTE path to repo>" \
  --out .screenshots/<task-slug> --pass 1|2 --lang en --viewport both
```

`--root` **must be absolute** — a relative root makes the internal server 404 every
request. The tool probes that each capture actually rendered the site and exits non-zero
otherwise; an earlier version happily captured 32 identical 404 pages and reported success.

Desktop is 1440×900, mobile 390×844. Output goes to `.screenshots/` (git-ignored).

## Media

`assets/serres-hero.mp4` is re-encoded to the spec's 4 MB budget. To redo it (there is no
`ffmpeg` on PATH on this machine; a static build ships inside the Claude scratch workspace
under `node_modules/ffmpeg-static/`):

```bash
ffmpeg -i in.mp4 -an -c:v libx264 -crf 27 -preset slow -profile:v main \
       -pix_fmt yuv420p -movflags +faststart assets/serres-hero.mp4
ffmpeg -i in.mp4 -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 assets/serres-hero.webm
```

`-an` matters: the source carried a 128 kbps audio track on a video that autoplays muted.

## Deploy

Asset and page links are **relative**, so the same tree runs unchanged on a GitHub Pages
project URL, on Hostinger at the apex domain, or from any subfolder. Canonicals and OG
tags point at `serreswrapcenter.com` (set in `assets/business.js`).

### Hostinger (production)

Upload the repo root to `public_html/`, **excluding** `_build/`, `.git/`, `.screenshots/`
and the `.md` files. `.htaccess` is committed and handles HTTPS, the www→apex redirect,
`ErrorDocument 404`, caching, gzip and the woff2 MIME type.

```bash
node _build/us/deploy-hostinger.js --host <ftp host> --user <ftp user> --pass <password>
```

Note the caching policy: HTML and CSS/JS are `no-cache, must-revalidate` (stored, but
revalidated — an unchanged file returns a cheap 304), while images, fonts and video are
cached hard for 30 days because a new asset always gets a new filename. The Barcelona
site used `no-store` on HTML, which forbids caching entirely and re-downloads the page on
every visit.

### GitHub Pages (preview)

From `main` branch root; `.nojekyll` is committed so Pages serves `_`-prefixed
directories. Live at `https://alexrickfelderroca.github.io/serres-wrap-center-us/`.
`.htaccess` is ignored there (Pages is nginx), so keeping it costs nothing.

## Forms

The quote form has **no backend**. Delivery is WhatsApp prefill:
`assets/quote-form.js` composes the message and opens `business.waHref(text)`.

While `business.whatsappDigits` is null the form does not pretend to send — it shows a
truthful state saying nothing was sent and when the line opens. To make it live, set
`whatsappDigits` in `assets/business.js`. To use a real form backend instead
(Formspree, Netlify Forms, an Apps Script webhook), point the submit handler in
`assets/quote-form.js` at the endpoint; it is one function.

## Analytics

`assets/analytics.js` wraps GA4 and Meta Pixel behind `window.SERRES_TRACK(event, params)`
and is **inert** until `business.ga4Id` / `business.pixelId` are set. Events per spec §9:
`quote_submit`, `reserve_submit`, `deposit_click`, `phone_click`, `sms_click`,
`whatsapp_click`, `pricing_view`.

The Barcelona property `G-1K6FYZ99GN` was removed from every page and **must never be
reused here** — it would pour US traffic into the Spanish account.

## Outstanding

`TODO.md` lists every item the owner still needs to supply, what file to put it in and
what it unblocks. The blocking ones are the US phone, WhatsApp number and email: with
them null, no contact affordance renders anywhere and the quote form cannot deliver.
