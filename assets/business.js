/* SERRES Wrap Center (US) — SINGLE SOURCE OF TRUTH FOR NAP, CONTACT AND FLAGS.
   Data is SERRES-US-WEBSITE-SPEC_1.md §4.3, extended with the fields the
   JSON-LD and the map embed need.

   RULE: no phone number, address, e-mail or opening hour may be authored by hand
   anywhere in this repo. _build/regen.mjs stamps every occurrence from this file,
   so the October address drop is a one-file change.

   Anything the owner has not confirmed is null and carries a TODO(owner) note.
   A null NEVER becomes an invented value — the matching *_LIVE flag hides the UI
   instead. See TODO.md. */
(function (root) {
  'use strict';
  var B = {};

  B.name = 'SERRES Wrap Center';
  B.legalName = null;                 // TODO(owner): US registered entity name for /terms + JSON-LD legalName

  /* ---------------------------------------------------------------- location */
  // TODO(owner) Oct 2026: replace with the real street address + ZIP.
  B.addressLine  = 'Boca Raton — Pompano Beach area · exact location announced October 2026';
  B.streetAddress = null;             // TODO(owner) Oct 2026
  B.city         = 'Boca Raton';
  B.region       = 'FL';
  B.regionName   = 'Florida';
  B.postalCode   = null;              // TODO(owner) Oct 2026
  B.country      = 'US';
  B.latitude     = null;              // TODO(owner) Oct 2026 — gates JSON-LD "geo"
  B.longitude    = null;              // TODO(owner) Oct 2026
  B.mapsPlaceUrl = null;              // TODO(owner) Oct 2026 — Google Business Profile URL, gates JSON-LD "hasMap"

  /* City-level embed until the listing exists. The opaque `embed?pb=` blob encodes a
     specific place id and cannot be synthesised, so this uses the documented q= form. */
  B.mapsEmbedSrc = 'https://www.google.com/maps?q=Boca+Raton,+FL&output=embed';

  B.areaServed = ['Boca Raton', 'Delray Beach', 'Pompano Beach', 'Deerfield Beach', 'Fort Lauderdale'];

  /* ----------------------------------------------------------------- contact */
  B.phoneE164   = null;               // TODO(owner): US number, e.g. "+15615550123"
  B.phoneDisplay = null;              // TODO(owner): e.g. "(561) 555-0123"
  B.smsE164     = null;               // TODO(owner): usually the same as phoneE164
  B.whatsappDigits = null;            // TODO(owner): digits only, no "+", e.g. "15615550123"
  B.email       = null;               // TODO(owner): confirm info@serreswrap.com once the domain is live

  /* Instagram: this is the VERIFIED Barcelona account. The spec guesses
     instagram.com/serreswrap, which is unconfirmed — an unverified handle would
     ship as a broken link, so the real one is used until the owner decides.
     TODO(owner): does the Boca Raton studio get its own IG account, or share this one? */
  B.instagram = 'https://www.instagram.com/serres.wrap.center/';
  B.parentUrl = 'https://serreswrapcenter.es/';   // the Barcelona studio, referenced as sameAs / parentOrganization

  /* ------------------------------------------------------------------- hours */
  // TODO(owner): confirm. Spec §4.3 says Mon–Sat 9–6; the Barcelona studio runs Mon–Fri 9–19 + Sat 10–14.
  B.hoursDisplay = 'Mon–Sat 9:00 AM – 6:00 PM';
  B.hoursSchema  = ['Mo-Sa 09:00-18:00'];         // schema.org openingHours strings
  B.hoursSpec    = [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '18:00' }];

  /* ---------------------------------------------------------------- openings */
  B.openingSoft = '2026-11-13';       // detailing services
  B.openingFull = '2026-12-08';       // full PPF launch
  B.openingSoftLabel = 'November 13, 2026';
  B.openingFullLabel = 'December 8, 2026';

  /* --------------------------------------------------------------- languages */
  B.languages = 'Se habla español · Говорим по-русски';

  /* ----------------------------------------------------------- founders club */
  B.foundersSpotsLeft = 30;           // owner edits this by hand; no backend
  B.foundersTotal = 30;
  B.depositUsd = 100;
  B.squareLink = null;                // TODO(owner): Square Payment Link for the $100 deposit

  /* --------------------------------------------------------------- analytics */
  B.ga4Id  = null;                    // TODO(owner): US GA4 property. The Barcelona id must NEVER be reused here.
  B.pixelId = null;                   // TODO(owner): Meta Pixel id

  /* --------------------------------------------------------------- publishing */
  /* serreswrapcenter.com — chosen 2026-09-16. The spec §P0-3 assumed serreswrap.com, but
     that is already registered (Wix, 2026-02-23, parked with no site). This name is
     geo-neutral, so it survives the studio moving or adding a second location, and it
     mirrors the Barcelona site's name on the .es TLD. */
  B.domain = 'serreswrapcenter.com';  // TODO(owner): confirm the registrar purchase went through
  B.origin = 'https://serreswrapcenter.com';

  /* -------------------------------------------------------------------- flags
     Each flag is derived, not hand-set, so a filled-in value switches the UI on
     automatically the moment the owner supplies it. */
  B.PHONE_LIVE    = !!B.phoneE164;
  B.SMS_LIVE      = !!B.smsE164;
  B.WHATSAPP_LIVE = !!B.whatsappDigits;
  B.EMAIL_LIVE    = !!B.email;
  B.MAP_PIN_LIVE  = !!(B.latitude && B.longitude);
  B.ANALYTICS_LIVE = !!B.ga4Id;
  B.PIXEL_LIVE    = !!B.pixelId;
  B.RESERVE_LIVE  = false;            // /reserve goes live Nov 2 2026 (spec §7)
  /* true when there is at least one way for a visitor to reach a human right now */
  B.CONTACT_LIVE  = B.PHONE_LIVE || B.WHATSAPP_LIVE || B.EMAIL_LIVE;

  /* --------------------------------------------------------------- built hrefs */
  B.telHref = function () { return B.phoneE164 ? 'tel:' + B.phoneE164 : null; };
  B.smsHref = function () { return B.smsE164 ? 'sms:' + B.smsE164 : null; };
  B.waHref = function (text) {
    if (!B.whatsappDigits) return null;
    return 'https://wa.me/' + B.whatsappDigits + (text ? '?text=' + encodeURIComponent(text) : '');
  };
  B.mailHref = function (subject) {
    if (!B.email) return null;
    return 'mailto:' + B.email + (subject ? '?subject=' + encodeURIComponent(subject) : '');
  };

  B.WA_TEXT = 'Hi SERRES — I’d like a quote. My car is a ';

  if (typeof module !== 'undefined' && module.exports) module.exports = B;
  root.SERRES_BUSINESS = B;
})(typeof window !== 'undefined' ? window : globalThis);
