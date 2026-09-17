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
| 4 | **E-mail address** — confirm `info@serreswrapcenter.com` once the domain is live | `assets/business.js` → `email` | footer, JSON-LD `email`, form reply-to |

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
| 11 | **Domain purchase** | **`serreswrapcenter.com`** — chosen 2026-09-16, confirmed available against the Verisign registry. NOT the spec's `serreswrap.com` (§P0-3): that is already registered through Wix on 2026-02-23 and parked with no site — quite possibly by the client, worth asking. `serres.com` is also out: it belongs to a live Finnish medical-device company. Canonicals, OG tags, JSON-LD and the sitemap all point at the chosen name already | `assets/business.js` → `domain`, `origin` |
| 12 | **Legal entity name** | Unknown — needed for `/terms` and JSON-LD `legalName` | `assets/business.js` → `legalName` |
| 13 | **"300+ cars protected in Barcelona since 2023"** | **Not published.** The spec asks for it but flags it unconfirmed, and the Barcelona site's own figures (`50+ coches`) contradict it. Give a number you can stand behind and it goes on the site. The home page block it was written for was removed on 2026-09-16 at your request, so `/about` is now the place for it | `/about` — the Barcelona story |
| 14 | **"The only studio in Boca Raton with full transparent pricing"** | **Not published.** A competitive superlative with legal exposure — spec itself says confirm wording | `/pricing` H1 line |

## 4. Legal and compliance

| # | Item | Status |
|---|---|---|
| 15 | ~~**Florida window-tint VLT limits**~~ — **resolved 2026-09-16.** Every row was read as verbatim statutory text from the 2026 Florida Statutes on `flsenate.gov` and cross-checked word for word against Online Sunshine (`leg.state.fl.us`). Front side windows **≥ 28%** both vehicle classes (s. 316.2953); behind the driver **≥ 15%** sedans / **≥ 6%** MPV (s. 316.2954(1)(a)) — Florida regulates back side windows and the rear window as one class, which is why those two rows share a figure; windshield = a **transparent** strip above the AS-1 portion (s. 316.2952(2)(b)). The percentages have been unchanged since ch. 99-248 (1999). The "pending verification" note is therefore gone and the table now cites the statute in its caption. One wording fix went with it: the windshield row said "non-reflective", which is not the statutory word |
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
| 23 | ~~Hero video over budget~~ — **done.** Re-encoded 9.77 MB → 1.01 MB (plus a 765 KB WebM), poster 106 KB. SSIM 0.982 vs the original, audio track dropped from a muted autoplay loop | Nothing needed. Command is in README.md if you ever want to redo it |
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

## 9. Live preview

**https://alexrickfelderroca.github.io/serres-wrap-center-us/**

Repo: https://github.com/alexrickfelderroca/serres-wrap-center-us (public, GitHub Pages
from `main` root). Canonical tags already point at `serreswrapcenter.com`, so the preview URL
will not be indexed in its place. To attach the domain: add a `CNAME` file containing
`serreswrapcenter.com`, point the DNS at GitHub Pages, and enable HTTPS in repo settings.

### Measured, and still worth doing

| # | Item | Detail |
|---|---|---|
| 32 | **Image payload** | A performance trace on the home page reports ~1.4 MB of image bytes that could be saved by resizing/re-encoding the gallery and service photos. The hero video and poster are already inside the spec budget; the stills are not optimised. |
| 33 | **Review strip omitted** | Spec 6.1.7 wants Barcelona Google review screenshots on the home page. None were supplied, and re-badging the 5 Spanish testimonials as US reviews is not acceptable, so the section is absent rather than faked. See item 24. |

---

### Consecuencia de las eliminaciones del 2026-09-16

| # | Item | Detail |
|---|---|---|
| 34 | ~~Local landers further from home~~ — **resolved.** A crawl from the home page puts all four `/ppf-<city>/` landers at exactly **2 clicks**, via `/paint-protection-film`, which meets spec §8.4. The earlier note guessed 3; measured, it is 2. `_build/us/verify-reachability.js` now proves it on every build | Nothing needed |
| 36 | ~~**Footer emptied**~~ — **reverted the same day.** The brand block, the Services and Company columns, the NAP and the hours are back, at your request after seeing the emptied version. Only two things stay removed, because you struck those separately and have not asked for them back: the **"PPF near you" column** and the **"Se habla español · Говорим по-русски" line**. Every contact affordance in the restored block is still gated on the `*_LIVE` flags, so no phone, WhatsApp or e-mail renders — filling them in `assets/business.js` turns them on with no edit here. The Instagram link and the "announced October 2026" address line are back and visible. Every contact affordance in there is still gated on the  flags, so no phone, WhatsApp or e-mail renders — filling them in  turns them on with no edit here |
| 35 | **"Se habla español · Говорим по-русски" removed everywhere** | Footer, mobile menu and the contact page. The string is still in  as  if you ever want it back — nothing else references it now. |

### Round 3 — the 2026-09-16 evening screenshots

| # | Item | Detail |
|---|---|---|
| 37 | **Packages are now only on `/pricing`** | The home "Bundled, not padded." block is gone. Daily Driver, New Car and Collector are still fully published on `/pricing` and still reachable from the header. Nothing on the home page mentions a package any more — worth knowing, because a bundle is usually the highest-value thing a first-time visitor sees |
| 38 | **The home page no longer says you are a Barcelona studio** | "Not a new shop. A second one." went with its three photos. `/about` is now the only page carrying that story, and the header still links to it. If the Barcelona track record is part of how you sell in Boca Raton, it currently only reaches people who click through |
| 39 | **Home JSON-LD still lists the three packages** | The `OfferCatalog` in the home page's structured data still carries Daily Driver / New Car / Collector, with every `url` pointing at `/pricing/`, so it is truthful — the packages are real and are published there. It is generated by `_build/regen.mjs` from `assets/pricing.js`, so removing it would also change `/pricing`. Left in place; say the word if you want the home page's structured data to stop mentioning them |
| 40 | **`/our-films` carries a near-twin of the block removed from `/paint-protection-film`** | "Three layers, one invisible skin." was cut from the PPF page — the screenshot's breadcrumb proves that is the page you marked. `/our-films` has almost the same block with different copy, and you have not marked that page. Left alone deliberately. One line to cut it if you want the pair to match |
| 41 | **Two sections on `/window-tint` still have the shape you removed elsewhere** | "Florida is a heat problem before it is a style one." and "Four steps. No shortcuts." both still have a full heading + note + four paragraph cards — ten paragraphs of prose between them, no data. Every comparable block on that page has now been stripped to its data. Flagging rather than assuming they were spared on purpose |
| 42 | **Statute facts that matter to the shop, deliberately not published** | Verifying the VLT table turned up four things that affect you rather than the customer, and the page is now data-only so they are recorded here instead: the separate **reflectance caps** (25% front sides, 35% behind the driver, measured on the nonfilm side — a mirrored film can pass VLT and still be unlawful); the **±3% tolerance** is meter error, not permission; s. 316.2955(1) requires the **installer to affix a compliance label to the inside left door jamb**; and "multipurpose passenger vehicle" (the 6% column) means truck chassis or off-road features, **not body style** — a unibody crossover is arguable, so do not promise 6% on one. Also: under s. 316.2956 the driver risks a nonmoving infraction while the **installer commits a second-degree misdemeanour**. None of this is legal advice; worth a lawyer's eye before it goes anywhere customer-facing |
| 43 | **Dead CSS and JS left by the round-1 removals on `/paint-protection-film`** | The `.xform` / `.compare` / `.cmp-*` rules (~35 lines of inline CSS) survive on that page although the transformation block they styled was removed on 2026-09-16. Invisible to visitors, pure housekeeping. Round 3 cleaned only what round 3 itself orphaned, to keep the commit reviewable |
| 45 | **The `/window-tint` price still stands — one decision open since round 2** | Your red box around "One tint. Ceramic film." reached the bottom edge of the phone screen and so enclosed the `$500 · Full car — ceramic film` row underneath. The prose above it went; the price stayed, because it is the only price on that page and published prices are the spec's whole positioning. Say the word and it goes in one line. The same "content below the screen edge is not assumed marked" rule is why `/detailing` kept its spec rows and its before/after slider |
| 44 | **FAQ open/close icon renders nothing on `/detailing` and `/car-wraps`** | Predates all the removals. Those two pages style `.fq-ico`, but the FAQ generator emits `.fq-x`, so the plus/minus affordance is a zero-width span. The other 11 FAQ pages define `.fq-x` correctly. The accordion still works by click and by keyboard; it just has no visible icon |

---

## Note on the spec's dates

The spec was written 2026-08-25 with a **Sep 15, 2026** launch deadline and an Aug 27 –
Sep 12 phase plan. Today is well past that. The task IDs in spec §12 were used for
**scope**, not for sequencing.
