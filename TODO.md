# TODO(owner) — SERRES Wrap Center US

Everything on this site that is **not yet confirmed real**. Nothing here has been
invented or silently shipped as fact: each item is either hidden behind a flag, marked
visibly as pending, or left out.

Spec reference: `SERRES-US-WEBSITE-SPEC_1.md`. Fill a value in the file named, and the
site picks it up — for most of these, that is the only change needed.

---

## 1. Blocking — the site cannot convert without these

| # | Item | Where to fill it | What it unblocks |
|---|---|---|---|
| 1 | **US phone number** (E.164 + display) | `assets/business.js` → `phoneE164`, `phoneDisplay` | `tel:` links, sticky mobile bar Call button, `telephone` in every JSON-LD block |
| 2 | **SMS number** (usually the same) | `assets/business.js` → `smsE164` | sticky mobile bar Text button |
| 3 | **WhatsApp number** (digits only, no `+`) | `assets/business.js` → `whatsappDigits` | WhatsApp button **and the entire quote form** — its delivery is WhatsApp prefill, so with no number the form cannot send |
| 4 | **E-mail address** — confirm `info@serreswrap.com` once the domain is live | `assets/business.js` → `email` | footer, JSON-LD `email`, form reply-to |

> **You chose to hide all contact details until October.** That is what ships today:
> no call, text or WhatsApp button appears anywhere, and the quote form shows a truthful
> "the direct line opens in October, the studio opens November 13" state instead of a
> fake confirmation. Fill items 1–4 and all of it turns on from one file.
>
> If you would rather the form worked **before** the US number exists, the quickest
> alternative is a free Formspree endpoint — say the word and it is a 10-minute change.

## 2. October 2026 — the address drop

| # | Item | Where |
|---|---|---|
| 5 | Street address + ZIP | `assets/business.js` → `streetAddress`, `postalCode`, and replace `addressLine` |
| 6 | Latitude / longitude | `assets/business.js` → `latitude`, `longitude` (unblocks JSON-LD `geo`) |
| 7 | Google Business Profile URL | `assets/business.js` → `mapsPlaceUrl` (unblocks `hasMap`) |
| 8 | Real Google Maps embed | `assets/business.js` → `mapsEmbedSrc`. Today it is a city-level `q=Boca+Raton,+FL` embed — the `embed?pb=` blob encodes a specific place id and cannot be made up |

After filling these, run `node _build/regen.mjs` once — the address propagates to every
page, every JSON-LD `PostalAddress`, the footer and the contact page in one commit.

## 3. Confirm — currently a best guess

| # | Item | Current value | Where |
|---|---|---|---|
| 9 | **Opening hours** | `Mon–Sat 9:00 AM – 6:00 PM` (spec §4.3). The Barcelona studio runs Mon–Fri 9–19 + Sat 10–14 — these disagree | `assets/business.js` → `hoursDisplay`, `hoursSchema`, `hoursSpec` |
| 10 | **Instagram handle** | Using the **real Barcelona account** `instagram.com/serres.wrap.center`. The spec guesses `instagram.com/serreswrap`, which is unverified — shipping it would be a broken link. Does the US studio get its own account? | `assets/business.js` → `instagram` |
| 11 | **Domain purchase** | `serreswrap.com` assumed (spec §P0-3). Canonicals and OG tags already point there | `assets/business.js` → `domain`, `origin` |
| 12 | **Legal entity name** | Unknown — needed for `/terms` and JSON-LD `legalName` | `assets/business.js` → `legalName` |
| 13 | **"300+ cars protected in Barcelona since 2023"** | **Not published.** The spec asks for it but flags it unconfirmed, and the Barcelona site's own figures (`50+ coches`) contradict it. Give a number you can stand behind and it goes on the home page | home page "Proven in Barcelona" block |
| 14 | **"The only studio in Boca Raton with full transparent pricing"** | **Not published.** A competitive superlative with legal exposure — spec itself says confirm wording | `/pricing` H1 line |

## 4. Legal and compliance

| # | Item | Status |
|---|---|---|
| 15 | **Florida window-tint VLT limits** (statute 316.2953–2956) | The table is on `/window-tint` with the spec's numbers, **visibly marked as pending verification**. Publishing wrong VLT limits on a legal-accuracy page is worse than not publishing the table. Confirm against the current statute, then remove the marker |
| 16 | `/privacy` | Drafted from a standard template covering GA4, Meta Pixel, form data and off-site payment. **Not reviewed by a lawyer** |
| 17 | `/terms` | Drafted: service terms, deposit terms, warranty summary, FL sales tax. **Not reviewed by a lawyer** |
| 18 | Colour-change reporting to the state | The wrap article does **not** state Florida law on reporting a colour change, because it could not be verified. Marked `TODO(owner)` in the article |

## 5. Analytics

| # | Item | Where |
|---|---|---|
| 19 | **US GA4 property id** | `assets/business.js` → `ga4Id`. The Barcelona id `G-1K6FYZ99GN` was removed and must **never** be reused here — it would pollute the Spanish property |
| 20 | **Meta Pixel id** | `assets/business.js` → `pixelId`. The event hooks are built and ship inert |

## 6. Media

| # | Item | Notes |
|---|---|---|
| 21 | **Photo / video pack** | Every image on the site is Barcelona work. That is legitimate as "proven in Barcelona" evidence, but see 22 |
| 22 | **Two images show a readable Spanish licence plate** (`2383 MRZ`) and a `movento.es` dealer frame, in `assets/detailing/`. Several others show an EU plate band | Replace or crop before a US launch |
| 23 | **Hero video** `assets/serres-hero.mp4` is ~10 MB against the spec's 4 MB budget (§11) | Needs re-encoding; there is no system ffmpeg on this machine |
| 24 | **Barcelona Google review screenshots** | Spec §6.1.7 wants these on the home page. They cannot be manufactured, and the 5 Spanish testimonials must not be re-badged as US reviews. The review strip is absent until you supply them |

## 7. November 2026 — Founders Club (`/reserve`)

| # | Item | Where |
|---|---|---|
| 25 | Square Payment Link for the $100 deposit | `assets/business.js` → `squareLink` |
| 26 | Final deposit terms wording | `/reserve` small print |
| 27 | Spots remaining | `assets/business.js` → `foundersSpotsLeft` (edit by hand, no backend) |
| 28 | Flip the page live on Nov 2 | `assets/business.js` → `RESERVE_LIVE = true`, then `node _build/regen.mjs` |

## 8. Copy the spec says you will supply

| # | Item | Status |
|---|---|---|
| 29 | Final page copy replacing drafts | Drafts are in place and are specific, not lorem ipsum |
| 30 | Local-lander copy ×4 | Unique drafts written per city (Glades Rd, Atlantic Ave, I-95, US-1). Replace at will |
| 31 | Team names / roles for `/about` | Section omitted rather than filled with placeholders |

---

## Note on the spec's dates

The spec was written 2026-08-25 with a **Sep 15, 2026** launch deadline and an Aug 27 –
Sep 12 phase plan. Today is well past that. The task IDs in spec §12 were used for
**scope**, not for sequencing.
