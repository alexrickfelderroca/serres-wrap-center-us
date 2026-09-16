# SERRES Wrap Center — US site (Boca Raton, FL)

The US branch site. Built by copying the design of the Barcelona site
(serreswrapcenter.es) and applying `SERRES-US-WEBSITE-SPEC_1.md`.

**Barcelona source, read-only, never edit from here:**
`C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`

---

## Stack

Hand-coded **vanilla HTML / CSS / JS**. No framework, no npm, no build step in the
shipped artifact. `_build/` holds Node tooling that regenerates parts of the HTML; it
is never served.

The spec (§2.1) recommends Next.js/Astro + Tailwind + Inter. **We deliberately do not
follow that** — the owner asked to keep the existing site, and a framework migration is
a rebuild, not a change. See "Deliberately not doing" below.

## URLs

Extensionless **directory routes**: `/pricing` → `pricing/index.html`.
Home is `index.html`, `404.html` sits at the root.

**All internal links and asset references are RELATIVE and depth-correct.**
Never write a root-absolute `/assets/...` path: the site must work both at the GitHub
Pages project URL and later at `serreswrapcenter.com`. Depths: home 0, most pages 1,
blog posts 2 (`blog/<slug>/index.html`).

## Single sources of truth — nothing may be hardcoded

| What | File |
|---|---|
| Every price | `assets/pricing.js` (spec §3, verbatim) |
| NAP, contact, hours, flags | `assets/business.js` (spec §4.3) |
| Per-route title / description / OG | `_build/data/seo.json` |
| FAQ items (visible **and** JSON-LD) | `_build/data/faq.json` |

**No dollar amount, phone number, address, e-mail or opening hour may be typed by hand
anywhere.** They live in the data files and are stamped into the pages by
`_build/regen.mjs`. That is what makes the October address drop a one-file change.

Both data files are UMD: `window.SERRES_PRICING` / `window.SERRES_BUSINESS` in the
browser, `module.exports` under Node, from the same bytes.

## Generated regions

`_build/regen.mjs` rewrites comment-delimited regions in place:

```html
<!-- REGION:header --> …generated… <!-- /REGION:header -->
```

Regions: `header`, `footer`, `trustbar`, `ctaband`, `terms`, `prices:<group>`,
`startingat:<group>`, `seo`, `faq:<page>`, `jsonld`.

**Never hand-edit inside a region** — the next `regen` run overwrites it.
`node _build/regen.mjs --check` exits non-zero if anything inside a region drifted.

```
node _build/regen.mjs            # regenerate
node _build/regen.mjs --check    # fail if a region was hand-edited
```

## Flags — how unknown data is handled

`assets/business.js` derives `PHONE_LIVE`, `WHATSAPP_LIVE`, `EMAIL_LIVE`,
`MAP_PIN_LIVE`, `ANALYTICS_LIVE`, `PIXEL_LIVE`, `RESERVE_LIVE` from whether the value
is null. **A null never becomes an invented value** — the flag hides the UI instead.
Fill the value and the UI appears; nothing else changes.

Right now every contact flag is false (owner's decision: no contact details published
until October 2026), so no call / text / WhatsApp affordance renders anywhere.

## Design system

Inherited from Barcelona — do not invent a new one, and do not apply the spec's §5.1
navy/electric-blue palette.

Tokens (in each page's inline `<style>` `:root`):
`--bg:#0a0a0b --bg-2:#0e0e10 --panel:#141417 --panel-2:#191920`
`--line:rgba(255,255,255,.09) --line-strong:rgba(255,255,255,.16)`
`--text:#f3f3f5 --muted:#9a9aa3 --muted-2:#6e6e77 --maxw:1280px`
`--ease:cubic-bezier(.22,.61,.36,1) --chrome:(silver gradient)`

Fonts: **Barlow Condensed 700** (display) + **DM Sans** (body), self-hosted woff2.
Never Inter/Roboto/Poppins/Montserrat.

**New CSS lives in `assets/serres-us.css` and every new class is prefixed `us-`.**
That guarantees no collision with the 13 pages' inherited inline styles. The inline
per-page `<style>` blocks are left alone on purpose — extracting them would be a pure
refactor with real regression risk and no spec requirement.

## Content rules

This is a **live client site, not a demo**. Real data only.

- Never invent prices, reviews, ratings, car counts, certifications or legal text.
- Anything unverified becomes an explicit `TODO(owner)` and is listed in `TODO.md`.
- The Barcelona Google-listing claims (4.9 rating, 98% recommend, aggregateRating)
  were deliberately removed. A US entity with no US reviews may not publish them.
  Do not reintroduce them.
- Product claims that are true regardless of market (50+/150+ film colours) are kept.
- English only at launch. `assets/serres-i18n.js` holds a ready EN→ES dictionary but
  **is not loaded** — Spanish `/es` is deferred to December (spec §6.13).

## Verification — "sin evidencia = no hecho"

```
node _build/serve.js                      # local preview on :8787
node _build/us/verify-links.js .          # every internal ref resolves
node _build/us/verify-prices.mjs          # every $ traces to pricing.js
node _build/verify-seo.js                 # unique title/meta; visible FAQ === JSON-LD FAQ
node _build/count-terms.js .              # no Barcelona / EUR / +34 / old domain left
node _build/screenshots.js --root "<ABSOLUTE path>" --out .screenshots/<slug> --pass 1|2
```

`--root` **must be absolute** for `screenshots.js` — a relative root 404s every request.
`screenshots.js` fails the run if a capture did not actually render the site.

Two-pass screenshots on every visual change (1440×900 + 390×844), plus an axe or
Lighthouse a11y run with the score captured, before any task is called done.

## Deploy

GitHub Pages from `main` branch root, `.nojekyll` in the repo root.
Account `alexrickfelderroca` (never `trvevr2-a11y`). Custom domain `serreswrapcenter.com`
to be pointed here once the registrar purchase is confirmed; canonicals already use it.

## Deliberately not doing (and why)

| Spec asks | Why not |
|---|---|
| Next.js / Astro + Tailwind + Inter (§2.1) | A stack migration is the rebuild the owner rejected. Inter is a banned font. |
| Navy `#0b1220` + electric blue `#2a78d6` (§5.1) | §5.2 asks to match the Barcelona feel; a blue-accent dark theme is the generic AI look. |
| `/dev/components` Storybook route (§5.3) | There is no typed component library to keep honest — only partials. |
| Serverless form handler (§2.1, §7.4) | Needs a host and a build step this site does not have. Quote form delivers via WhatsApp prefill instead. |
| `src/data/*.ts`, `npm run build && npm run lint` (§2.3) | No npm/TS here. The equivalent gates are the verify scripts above. |
| Body Kits pages and pricing | The spec has no body-kit SKU at any tier. Source page kept at `_build/us/harvest/body-kits.html`. |
| `/es` Spanish version (§6.13) | Spec itself defers it. Engine and dictionary are ready. |

## Working with parallel sessions

The owner often runs several Claude sessions on this repo at once. Run `ListAgents` at
session start, announce which files you will touch before writing, answer "is this file
yours?" by reading `git diff` and never from memory, and let **one** session commit, at
the end, after an explicit "nothing in flight" from every other session.
Full protocol: `~/.claude/rules/sesiones-en-paralelo.md`.
