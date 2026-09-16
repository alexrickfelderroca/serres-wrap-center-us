#!/usr/bin/env node
/* ============================================================================
   _build/regen.mjs — SERRES Wrap Center US: the chrome + content regeneration
   engine.

     node _build/regen.mjs            regenerate every region in the shipped tree
     node _build/regen.mjs --check    exit 1 if a run WOULD change anything
     node _build/regen.mjs --emit prices:ppf [--depth 1]
                                      print one rendered region to stdout

   WHAT IT OWNS
   Every comment-delimited region in every shipped .html page:

       <!-- REGION:name -->  ...generated, do not hand-edit...  <!-- /REGION:name -->

     header               _build/partials/header.html
     trustbar             _build/partials/trust-bar.html
     ctaband              _build/partials/cta-band.html
     terms                _build/partials/terms.html
     footer               _build/partials/footer.html
     seo                  _build/partials/seo.html      + _build/data/seo.json
     jsonld               _build/partials/jsonld.html   + _build/data/seo.json
     faq:<route>          _build/partials/faq-item*.html + _build/data/faq.json
                          (emits the visible accordion AND the FAQPage JSON-LD,
                           byte-identical answers, as _build/verify-seo.js wants)
     prices:<group>       _build/partials/price-table*.html
     startingat:<group>   _build/partials/starting-at.html

   ...plus sitemap.xml and robots.txt.

   If a marker is missing, regen INSERTS it once by locating the inherited
   markup it replaces (the <header class="nav"> block, the <footer>, the head
   SEO tags, the JSON-LD scripts, the run of FAQ <details>). From then on the
   markers are the contract.

   INVARIANTS
   - Idempotent: two runs produce a byte-identical tree. Nothing reads the clock
     (see YEAR below) and every list is ordered by its source file.
   - EOL-preserving: each file is written back with the line endings it had.
   - No dollar amount, phone number, address, e-mail or opening hour is authored
     here. Everything comes from assets/pricing.js and assets/business.js.
   - Contact affordances are gated on the business.js *_LIVE flags and render
     NOTHING while a flag is false. No placeholders, ever.
   - Every generated link is RELATIVE and computed from the page's own depth, so
     the tree works both at a GitHub Pages project URL and at the apex domain.
   - This file writes no CSS. New classes are prefixed "us-" and the complete
     list lives in the header comment of _build/partials/header.html.
   ========================================================================== */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PARTIALS = path.join(HERE, 'partials');
const DATA = path.join(HERE, 'data');

/* The copyright year is a CONSTANT, never new Date(): a clock reading would
   make the output non-idempotent across a New Year boundary. Bump by hand. */
const YEAR = 2026;

const P = require(path.join(ROOT, 'assets', 'pricing.js'));
const B = require(path.join(ROOT, 'assets', 'business.js'));
const SEO = readJson(path.join(DATA, 'seo.json'));
const FAQ = readJson(path.join(DATA, 'faq.json'));

const SKIP_DIRS = new Set(['_build', '.git', '.screenshots', 'node_modules', 'assets']);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const argv = process.argv.slice(2);
const CHECK = argv.includes('--check');
const EMIT = argv.includes('--emit') ? argv[argv.indexOf('--emit') + 1] : null;
const EMIT_DEPTH = argv.includes('--depth') ? Number(argv[argv.indexOf('--depth') + 1]) : 1;

const warnings = [];
const warn = (m) => warnings.push(m);

/* ========================================================================== */
/*  small helpers                                                             */
/* ========================================================================== */

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/* Only the four characters that would break HTML or the FAQ byte-identity.
   Apostrophes are deliberately NOT escaped: the content uses curly quotes and
   entity-escaping them would desync the visible answer from the JSON-LD. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* depth-correct relative href. depth 0 = site root. */
function relHref(depth, target) {
  const t = String(target == null ? '' : target);
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  if (t === '') return depth === 0 ? './' : prefix;
  if (t.startsWith('#')) return (depth === 0 ? './' : prefix) + t;
  return prefix + t;
}

/* absolute canonical URL for a route ('' = home, '#services' = home anchor) */
function absUrl(route) {
  const r = String(route == null ? '' : route);
  if (r === '') return B.origin + '/';
  if (r.startsWith('#')) return B.origin + '/' + r;
  return B.origin + '/' + r;
}

function routeOf(relFile) {
  return relFile.split(path.sep).join('/').replace(/index\.html$/, '');
}

/* Depth is a property of the FILE, not the route. Deriving it from the route broke
   404.html: routeOf() only strips a trailing "index.html", so the route came out as
   "404.html" and counted as one segment — depth 1. The file is at the site root, so every
   generated link on it was written as "../…" and pointed outside the site. Counting the
   directory segments of the file path is right for index.html (0), about/index.html (1),
   blog/<slug>/index.html (2) and 404.html (0) alike. */
function depthOfFile(relFile) {
  return relFile.split(path.sep).join('/').split('/').length - 1;
}

function shortDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return '';
  return MONTHS[Number(m[2]) - 1] + ' ' + String(Number(m[3]));
}

/* ========================================================================== */
/*  template engine                                                           */
/*                                                                            */
/*  {{!-- comment --}}   {{token}} escaped   {{{token}}} raw                   */
/*  {{#if KEY}}…{{/if}}  {{#unless KEY}}…{{/unless}}   (not nestable)          */
/*  Token namespaces are resolved in resolveToken() below and documented in    */
/*  the header comment of _build/partials/header.html.                         */
/* ========================================================================== */

const partialCache = new Map();
function partial(name) {
  if (!partialCache.has(name)) {
    const raw = fs.readFileSync(path.join(PARTIALS, name), 'utf8').replace(/\r\n/g, '\n');
    partialCache.set(name, raw);
  }
  return partialCache.get(name);
}

function render(tpl, ctx, opts = {}) {
  /* The leading doc comment ends at the first "--}}" sitting ALONE at column 0.
     Both halves of that rule are load-bearing:
       - lazy alone breaks header.html, whose doc comment quotes "{{!-- ... --}}"
         on an indented line; the match would end there and leak the docs.
       - greedy alone broke footer.html the moment it gained a SECOND comment:
         the match ran to the LAST "--}}" in the file and swallowed the
         <footer class="us-footer"> opening tag between the two, shipping 24
         pages with an orphan </footer> and no contentinfo landmark. */
  let out = tpl.replace(/^\{\{!--[\s\S]*?\n--\}\}\n?/, '');
  /* any further comments in the body (indented, closing delimiter inline) */
  out = out.replace(/[ \t]*\{\{!--[\s\S]*?--\}\}\n?/g, '');

  const BLOCK = /\{\{#(if|unless)\s+([A-Za-z0-9_.:]+)\}\}([\s\S]*?)\{\{\/\1\}\}/;
  for (let guard = 0; guard < 200 && BLOCK.test(out); guard++) {
    out = out.replace(BLOCK, (_m, kind, key, body) => {
      const v = ctx[key];
      const truthy = !!v && v !== 'null' && v !== 'undefined';
      return (kind === 'if') === truthy ? body : '';
    });
  }

  out = out.replace(/\{\{\{([^}]+)\}\}\}/g, (_m, t) => String(resolveToken(t.trim(), ctx) ?? ''));
  out = out.replace(/\{\{([^}]+)\}\}/g, (_m, t) => {
    const v = String(resolveToken(t.trim(), ctx) ?? '');
    return opts.raw ? v : esc(v);
  });
  return out.replace(/\n+$/, '');
}

function renderPartial(name, ctx) {
  return render(partial(name), ctx);
}

function resolveToken(token, ctx) {
  const colon = token.indexOf(':');
  const ns = colon < 0 ? '' : token.slice(0, colon);
  const arg = colon < 0 ? '' : token.slice(colon + 1);

  switch (ns) {
    case 'rel':
      return relHref(ctx.depth, arg);

    case 'business': {
      if (!(arg in B)) throw new Error(`business.js has no field "${arg}"`);
      const v = B[arg];
      return v == null ? '' : v;
    }

    case 'terms': {
      if (!(arg in P.TERMS)) throw new Error(`pricing.js TERMS has no key "${arg}"`);
      return P.TERMS[arg];
    }

    case 'film': {
      const [tier, field] = arg.split('.');
      const t = P.FILM_TIERS[tier];
      if (!t || !(field in t)) throw new Error(`unknown film token "${arg}"`);
      return t[field];
    }

    case 'price': {
      const [id, tier] = arg.split('.');
      const item = P.byId(id);
      if (!item) throw new Error(`pricing.js has no item "${id}"`);
      if (!tier) return P.usd(item.price);
      const key = tier === 'essential' ? 'priceEssential'
        : tier === 'signature' ? 'priceSignature' : null;
      if (!key) throw new Error(`unknown tier "${tier}" in {{price:${arg}}}`);
      return P.usd(item[key]);
    }

    case 'from': {
      const item = P.byId(arg);
      if (!item) throw new Error(`pricing.js has no item "${arg}"`);
      return P.from(item);
    }

    case 'startingAt':
      return P.startingAtLabel(arg);

    case 'startingAtAmount': {
      const lo = P.startingAt(arg);
      return lo === null ? 'on request' : P.usd(lo);
    }

    default: {
      if (!(token in ctx)) throw new Error(`unknown template token "{{${token}}}"`);
      const v = ctx[token];
      return v == null ? '' : v;
    }
  }
}

/* Expand tokens inside a plain data string (seo.json / faq.json values).
   raw = do not HTML-escape: used for FAQ text, which must stay byte-identical
   between the visible <p> and the JSON-LD acceptedAnswer. */
function expand(str, { raw = false } = {}) {
  return render(String(str), { depth: 0 }, { raw });
}

/* ========================================================================== */
/*  region plumbing                                                           */
/* ========================================================================== */

const open = (n) => `<!-- REGION:${n} -->`;
const close = (n) => `<!-- /REGION:${n} -->`;

function hasRegion(src, name) {
  return src.includes(open(name));
}

function emptyRegion(name, indent = '') {
  return indent + open(name) + '\n' + indent + close(name);
}

function setRegion(src, name, body) {
  const re = new RegExp(reEsc(open(name)) + '[\\s\\S]*?' + reEsc(close(name)));
  if (!re.test(src)) return src;
  const indent = indentOf(src, src.indexOf(open(name)));
  const inner = body.split('\n').map((l) => (l === '' ? l : indent + l)).join('\n');
  return src.replace(re, () => indent.length
    ? open(name) + '\n' + inner + '\n' + indent + close(name)
    : open(name) + '\n' + inner + '\n' + close(name));
}

function indentOf(src, idx) {
  if (idx < 0) return '';
  const ls = src.lastIndexOf('\n', idx) + 1;
  const m = /^[ \t]*/.exec(src.slice(ls, idx));
  return m ? m[0] : '';
}

function regionNames(src) {
  const out = [];
  const re = /<!-- REGION:([^\s>]+) -->/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

/* ========================================================================== */
/*  first-run marker insertion                                                */
/* ========================================================================== */

const RE_NAV_HEADER = /<header\b[^>]*class="[^"]*\bnav\b[^"]*"[^>]*>[\s\S]*?<\/header>/;
const RE_FOOTER = /<footer\b[^>]*>[\s\S]*?<\/footer>/;

function insertMarkers(src, page) {
  /* --- header ---------------------------------------------------------- */
  if (!hasRegion(src, 'header')) {
    if (!RE_NAV_HEADER.test(src)) throw new Error(`${page.rel}: no <header class="nav"> to replace`);
    src = src.replace(RE_NAV_HEADER, emptyRegion('header'));
  }

  /* --- footer ---------------------------------------------------------- */
  if (!hasRegion(src, 'footer')) {
    const n = (src.match(new RegExp(RE_FOOTER.source, 'g')) || []).length;
    if (n !== 1) throw new Error(`${page.rel}: expected exactly 1 <footer>, found ${n}`);
    src = src.replace(RE_FOOTER, emptyRegion('footer'));
  }

  /* --- trust bar: REMOVED at the owner's request (2026-09-16) -----------
     The 3M / NAR / 1-year / Barcelona-proven strip used to be auto-inserted under the
     header on every page. It no longer is, and any existing region is stripped below.
     To bring it back: restore this insert and the renderer in regionHtml(). */
  src = src.replace(/[ \t]*<!-- REGION:trustbar -->[\s\S]*?<!-- \/REGION:trustbar -->\r?\n?/g, '');

  /* --- CTA band: straight above the footer ----------------------------- */
  if (!hasRegion(src, 'ctaband')) {
    src = src.replace(open('footer'), emptyRegion('ctaband') + '\n\n' + open('footer'));
  }

  /* --- small print: above the CTA band, on pages that show a price ----- */
  if (page.entry && page.entry.hasPrices && !hasRegion(src, 'terms')) {
    src = src.replace(open('ctaband'), emptyRegion('terms') + '\n\n' + open('ctaband'));
  }

  /* --- head: SEO block ------------------------------------------------- */
  if (page.entry && !hasRegion(src, 'seo')) src = insertSeoMarkers(src, page);

  /* --- head: JSON-LD graph --------------------------------------------- */
  if (page.entry && !hasRegion(src, 'jsonld')) src = insertJsonLdMarkers(src, page);

  /* --- FAQ accordions --------------------------------------------------- */
  const faqKey = page.route;
  if (FAQ[faqKey] && !hasRegion(src, 'faq:' + faqKey)) src = insertFaqMarkers(src, page, faqKey);

  return src;
}

const SEO_KILL = [
  /^<title>/i,
  /^<meta\s+name="description"/i,
  /^<meta\s+name="robots"/i,
  /^<link\s+rel="canonical"/i,
  /^<meta\s+property="og:/i,
  /^<meta\s+name="twitter:/i,
  /^<meta\s+property="article:/i,
  /^<!--\s*Open Graph\s*-->$/i,
  /^<!--\s*Twitter\s*-->$/i,
];

function insertSeoMarkers(src, page) {
  const he = src.indexOf('</head>');
  if (he < 0) throw new Error(`${page.rel}: no </head>`);
  const lines = src.slice(0, he).split('\n');
  const kept = [];
  let at = -1;
  for (const line of lines) {
    const t = line.trim();
    if (SEO_KILL.some((re) => re.test(t))) {
      if (at < 0) at = kept.length;
      continue;
    }
    kept.push(line);
  }
  if (at < 0) {
    const vp = kept.findIndex((l) => /<meta\s+name="viewport"/i.test(l));
    at = vp >= 0 ? vp + 1 : 1;
  }
  kept.splice(at, 0, open('seo'), close('seo'));
  return kept.join('\n') + src.slice(he);
}

const RE_LD = /[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g;
const RE_LD_COMMENT = /[ \t]*<!--\s*Schema:[^\n]*-->\n?/g;

function insertJsonLdMarkers(src, page) {
  let s = src.replace(RE_LD_COMMENT, '');
  let first = -1;
  s = s.replace(RE_LD, (m, off) => {
    if (first < 0) first = off;
    return '';
  });
  if (first < 0) {
    /* nothing inherited to replace — park the graph just before </head> */
    const he = s.indexOf('</head>');
    if (he < 0) throw new Error(`${page.rel}: no </head>`);
    return s.slice(0, he) + emptyRegion('jsonld') + '\n' + s.slice(he);
  }
  return s.slice(0, first) + emptyRegion('jsonld') + '\n' + s.slice(first);
}

/* The FAQ accordion is the contiguous run of sibling <details> inside the page's
   FAQ container. Anything around it (heading, intro, related links) is left
   alone — regen only owns the questions themselves. */
function insertFaqMarkers(src, page, key) {
  let ci = src.indexOf('<div class="faq-list');
  if (ci < 0) ci = src.indexOf('<section class="faq"');
  if (ci < 0) {
    warn(`${page.rel}: faq.json has an entry for "${key}" but the page has no FAQ container — region not inserted`);
    return src;
  }
  const start = src.indexOf('<details', ci);
  if (start < 0) {
    warn(`${page.rel}: FAQ container has no <details> to replace`);
    return src;
  }
  let end = start;
  for (;;) {
    const e = src.indexOf('</details>', end);
    if (e < 0) break;
    const stop = e + '</details>'.length;
    const next = src.indexOf('<details', stop);
    end = stop;
    if (next < 0 || src.slice(stop, next).trim() !== '') break;
  }
  const indent = indentOf(src, start);
  return src.slice(0, start) + open('faq:' + key) + '\n' + indent + close('faq:' + key) + src.slice(end);
}

/* ========================================================================== */
/*  region bodies                                                             */
/* ========================================================================== */

function baseCtx(page) {
  const depth = page.depth;
  return {
    depth,
    year: YEAR,
    telHref: B.telHref() || '',
    waHref: B.waHref(B.WA_TEXT) || '',
    mailHref: B.mailHref('Quote request') || '',
    PHONE_LIVE: B.PHONE_LIVE,
    SMS_LIVE: B.SMS_LIVE,
    WHATSAPP_LIVE: B.WHATSAPP_LIVE,
    EMAIL_LIVE: B.EMAIL_LIVE,
    CONTACT_LIVE: B.CONTACT_LIVE,
    MAP_PIN_LIVE: B.MAP_PIN_LIVE,
    RESERVE_LIVE: B.RESERVE_LIVE,
  };
}

function regionBody(name, page) {
  const ctx = baseCtx(page);

  if (name === 'header') {
    /* Spec 4.2: the CTA is the reservation only while RESERVE_LIVE is true.
       Until then it is a quote CTA — never a dead or disabled Reserve button. */
    ctx.ctaLabel = B.RESERVE_LIVE ? `Reserve — ${shortDate(B.openingSoft)}` : 'Get a Quote';
    ctx.ctaHref = relHref(page.depth, B.RESERVE_LIVE ? 'reserve/' : 'contact/');
    return renderPartial('header.html', ctx);
  }

  if (name === 'trustbar') {
    ctx.essentialFilm = P.FILM_TIERS.essential.film;
    ctx.signatureFilm = P.FILM_TIERS.signature.film;
    return renderPartial('trust-bar.html', ctx);
  }

  if (name === 'ctaband') return renderPartial('cta-band.html', ctx);
  if (name === 'terms') return renderPartial('terms.html', ctx);
  if (name === 'footer') return renderPartial('footer.html', ctx);
  if (name === 'seo') return renderSeo(page);
  if (name === 'jsonld') return renderJsonLd(page);

  if (name.startsWith('faq:')) return renderFaq(name.slice(4), page);
  if (name.startsWith('prices:')) return renderPrices(name.slice(7), page);
  if (name.startsWith('startingat:')) return renderStartingAt(name.slice(11), page);

  throw new Error(`${page.rel}: unknown region "${name}"`);
}

/* ------------------------------------------------------------------ SEO --- */

function renderSeo(page) {
  const e = page.entry;
  if (!e) throw new Error(`${page.rel}: REGION:seo but no seo.json entry for "${page.route}"`);
  const d = SEO.defaults;
  const title = expand(e.title);
  const description = expand(e.description);

  if (title.length > 60) warn(`seo.json "${page.route}": title is ${title.length} chars (spec 8.2 wants <= 60)`);
  if (description.length < 140 || description.length > 155) {
    warn(`seo.json "${page.route}": description is ${description.length} chars (spec 8.2 wants 140-155)`);
  }

  const art = e.article || {};
  return renderPartial('seo.html', {
    depth: page.depth,
    title,
    description,
    robots: e.robots || d.robots,
    canonical: absUrl(page.route),
    ogType: e.ogType || d.ogType,
    siteName: d.siteName,
    locale: d.locale,
    ogImage: B.origin + '/' + (e.ogImage || d.ogImage),
    twitterCard: d.twitterCard,
    isArticle: !!e.article,
    published: art.published || '',
    modified: art.modified || art.published || '',
  });
}

/* --------------------------------------------------------------- JSON-LD --- */

function businessNode() {
  const address = {
    '@type': 'PostalAddress',
    ...(B.streetAddress ? { streetAddress: B.streetAddress } : {}),
    addressLocality: B.city,
    addressRegion: B.region,
    ...(B.postalCode ? { postalCode: B.postalCode } : {}),
    addressCountry: B.country,
  };
  return {
    '@type': 'AutoRepair',
    '@id': B.origin + '/#business',
    name: B.name,
    ...(B.legalName ? { legalName: B.legalName } : {}),
    url: B.origin + '/',
    image: B.origin + '/assets/og/home.jpg',
    priceRange: '$$$',
    address,
    areaServed: B.areaServed,
    openingHours: B.hoursSchema.length === 1 ? B.hoursSchema[0] : B.hoursSchema,
    ...(B.PHONE_LIVE ? { telephone: B.phoneE164 } : {}),
    ...(B.EMAIL_LIVE ? { email: B.email } : {}),
    ...(B.MAP_PIN_LIVE ? { geo: { '@type': 'GeoCoordinates', latitude: B.latitude, longitude: B.longitude } } : {}),
    ...(B.mapsPlaceUrl ? { hasMap: B.mapsPlaceUrl } : {}),
    sameAs: [B.instagram, B.parentUrl].filter(Boolean),
  };
}

/* An Offer per published row. "From" prices become a minPrice
   PriceSpecification so we never claim an exact figure we have not quoted. */
function offersFor(group) {
  const url = absUrl((P.GROUP_ROUTES[group] || '') + '/');
  const out = [];
  for (const item of P.published(group)) {
    const tiers = item.priceEssential !== undefined
      ? [['essential', 'priceEssential'], ['signature', 'priceSignature']]
      : [[null, 'price']];
    for (const [tier, key] of tiers) {
      const v = item[key];
      const name = tier ? `${item.name} — ${P.FILM_TIERS[tier].label}` : item.name;
      const offer = {
        '@type': 'Offer',
        name,
        url,
        itemOffered: { '@type': 'Service', name },
      };
      if (typeof v === 'number') {
        if (tier || item.from) {
          /* No valueAddedTaxIncluded anywhere: that was the EUR site's field.
             US prices exclude FL sales tax and TERMS.tax says so in the copy. */
          offer.priceSpecification = {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            minPrice: v,
          };
        } else {
          offer.priceCurrency = 'USD';
          offer.price = String(v);
        }
      }
      out.push(offer);
    }
  }
  return out;
}

function catalogFor(group) {
  return {
    '@type': 'OfferCatalog',
    name: P.GROUP_LABELS[group],
    itemListElement: offersFor(group),
  };
}

function breadcrumbNode(page) {
  const crumbs = [['Home', '']].concat(page.entry.crumbs || []);
  return {
    '@type': 'BreadcrumbList',
    '@id': absUrl(page.route) + '#breadcrumb',
    itemListElement: crumbs.map(([name, route], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absUrl(route),
    })),
  };
}

const PAGE_TYPE = {
  home: 'WebPage', service: 'WebPage', local: 'WebPage', pricing: 'WebPage',
  collection: 'CollectionPage', about: 'AboutPage', contact: 'ContactPage',
  page: 'WebPage', article: 'WebPage',
};

function renderJsonLd(page) {
  const e = page.entry;
  if (!e) throw new Error(`${page.rel}: REGION:jsonld but no seo.json entry for "${page.route}"`);
  const s = e.schema || { kind: 'page' };
  const url = absUrl(page.route);
  const graph = [businessNode()];

  graph.push({
    '@type': 'WebSite',
    '@id': B.origin + '/#website',
    url: B.origin + '/',
    name: SEO.defaults.siteName,
    publisher: { '@id': B.origin + '/#business' },
    inLanguage: 'en-US',
  });

  const webpage = {
    '@type': PAGE_TYPE[s.kind] || 'WebPage',
    '@id': url + '#webpage',
    url,
    name: expand(e.title),
    description: expand(e.description),
    isPartOf: { '@id': B.origin + '/#website' },
    about: { '@id': B.origin + '/#business' },
    primaryImageOfPage: B.origin + '/' + (e.ogImage || SEO.defaults.ogImage),
    inLanguage: 'en-US',
  };
  if (e.crumbs) webpage.breadcrumb = { '@id': url + '#breadcrumb' };
  graph.push(webpage);

  if (s.kind === 'service' || s.kind === 'local') {
    const svc = {
      '@type': 'Service',
      '@id': url + '#service',
      name: s.name,
      serviceType: s.serviceType,
      description: expand(s.description || e.description),
      url,
      provider: { '@id': B.origin + '/#business' },
      areaServed: s.kind === 'local' ? [s.city] : B.areaServed,
    };
    if (s.group) svc.hasOfferCatalog = catalogFor(s.group);
    graph.push(svc);
    webpage.mainEntity = { '@id': url + '#service' };
  }

  if (s.kind === 'pricing' || s.kind === 'home') {
    const groups = P.GROUPS.filter((g) => g !== 'phase2' && P.published(g).length);
    const catalog = {
      '@type': 'OfferCatalog',
      '@id': url + '#catalog',
      name: 'SERRES Wrap Center price list',
      itemListElement: groups.map(catalogFor),
    };
    graph.push(catalog);
    if (s.kind === 'pricing') webpage.mainEntity = { '@id': url + '#catalog' };
    else graph[0].hasOfferCatalog = { '@id': url + '#catalog' };
  }

  if (s.kind === 'article') {
    const art = e.article || {};
    graph.push({
      '@type': 'BlogPosting',
      '@id': url + '#article',
      mainEntityOfPage: { '@id': url + '#webpage' },
      headline: s.headline || expand(e.title),
      description: expand(e.description),
      image: B.origin + '/' + (e.ogImage || SEO.defaults.ogImage),
      datePublished: art.published,
      dateModified: art.modified || art.published,
      inLanguage: 'en-US',
      author: { '@type': 'Organization', name: 'SERRES Team', url: B.origin + '/' },
      publisher: { '@id': B.origin + '/#business' },
    });
    webpage.mainEntity = { '@id': url + '#article' };
  }

  if (e.crumbs) graph.push(breadcrumbNode(page));

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  return renderPartial('jsonld.html', { depth: page.depth, json });
}

/* ------------------------------------------------------------------- FAQ --- */

/* The visible text and acceptedAnswer.text must be the SAME BYTES, so the FAQ
   strings are written into the HTML unescaped. That is only safe for text that
   needs no escaping: no < > or ", and no ambiguous ampersand (an & followed by
   an alphanumeric or #, which a browser would try to read as an entity).
   "make & model" is fine; "Tom & Jerry&amp;" or "a < b" are not. */
const BAD_FAQ_CHARS = /[<>"]|&(?=[A-Za-z0-9#])/;

function renderFaq(key, page) {
  const entry = FAQ[key];
  if (!entry) throw new Error(`${page.rel}: REGION:faq:${key} but faq.json has no entry "${key}"`);
  const itemPartial = entry.style === 'article' ? 'faq-item-article.html' : 'faq-item.html';

  const pairs = entry.items.map((it) => {
    const q = expand(it.q, { raw: true });
    const a = expand(it.a, { raw: true });
    for (const [label, v] of [['question', q], ['answer', a]]) {
      if (BAD_FAQ_CHARS.test(v)) {
        throw new Error(`faq.json "${key}": the ${label} contains < > " or an ambiguous & — the ` +
          `visible text and the FAQPage JSON-LD must be the same bytes, so neither can be escaped:` +
          `\n    ${v}`);
      }
    }
    return { q, a };
  });

  const items = pairs
    .map((p) => renderPartial(itemPartial, { depth: page.depth, q: p.q, a: p.a }))
    .join('\n\n');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absUrl(page.route) + '#faq',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.q,
      acceptedAnswer: { '@type': 'Answer', text: p.a },
    })),
  };

  return items + '\n\n' + renderPartial('jsonld.html', {
    depth: page.depth,
    json: JSON.stringify(ld, null, 2),
  });
}

/* ---------------------------------------------------------------- prices --- */

function badge(item) {
  return item.popular ? renderPartial('price-badge.html', { depth: 0, label: 'Most popular' }) : '';
}

function renderPrices(group, page) {
  if (!P.GROUPS.includes(group)) throw new Error(`${page.rel}: unknown price group "${group}"`);
  const items = P.published(group);          /* published:false never renders */
  const ctx = { depth: page.depth, group, groupLabel: P.GROUP_LABELS[group] };

  if (group === 'ppf') {
    const rows = items.map((item) => renderPartial('price-row-tiers.html', {
      depth: page.depth,
      name: item.name,
      desc: item.coverage || '',
      badge: badge(item),
      tier1Price: P.from(item, 'priceEssential'),
      tier2Price: P.from(item, 'priceSignature'),
    })).join('\n');
    return renderPartial('price-table-tiers.html', {
      ...ctx,
      rows,
      tier1Label: P.FILM_TIERS.essential.label,
      tier1Film: P.FILM_TIERS.essential.film,
      tier1Note: P.FILM_TIERS.essential.note,
      tier2Label: P.FILM_TIERS.signature.label,
      tier2Film: P.FILM_TIERS.signature.film,
      tier2Note: P.FILM_TIERS.signature.note,
    });
  }

  const rows = items.map((item) => renderPartial('price-row.html', {
    depth: page.depth,
    name: item.name,
    desc: item.coverage || item.includes || '',
    badge: badge(item),
    note: item.note ? renderPartial('price-note.html', { depth: 0, note: item.note }) : '',
    price: P.from(item),                     /* "from $450" / "$1,990" / "on request" */
  })).join('\n');

  return renderPartial('price-table.html', {
    ...ctx,
    rows,
    descHeading: group === 'packages' ? 'What is included' : 'What it covers',
  });
}

function renderStartingAt(group, page) {
  if (!P.GROUPS.includes(group)) throw new Error(`${page.rel}: unknown price group "${group}"`);
  return renderPartial('starting-at.html', { depth: page.depth, label: P.startingAtLabel(group) });
}

/* ========================================================================== */
/*  pages                                                                     */
/* ========================================================================== */

function listPages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, p));
    }
  })(ROOT);
  return out;
}

function processPage(rel) {
  const abs = path.join(ROOT, rel);
  const raw = fs.readFileSync(abs, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const route = routeOf(rel);
  const page = { rel, abs, route, depth: depthOfFile(rel), entry: SEO.routes[route] };
  if (!page.entry) warn(`${rel}: no seo.json entry for route "${route}" — head and JSON-LD left alone`);
  if (/gtag\/js\?id=/.test(raw) && !B.ANALYTICS_LIVE) {
    warn(`${rel}: an inherited Barcelona GA4 tag is still hard-coded in this page, but business.js ga4Id is null. ` +
      `Analytics is not a regen region — the page owner has to strip it.`);
  }

  let src = raw.replace(/\r\n/g, '\n');
  src = insertMarkers(src, page);
  for (const name of regionNames(src)) src = setRegion(src, name, regionBody(name, page));

  return { abs, rel, raw, out: src.replace(/\n/g, eol) };
}

/* ========================================================================== */
/*  sitemap.xml + robots.txt                                                  */
/* ========================================================================== */

function buildSitemap() {
  const rows = [];
  for (const [route, e] of Object.entries(SEO.routes)) {
    if (e.inSitemap === false) continue;
    if (route === 'reserve/' && !B.RESERVE_LIVE) continue;   /* not live yet */
    if (!fs.existsSync(path.join(ROOT, route, 'index.html'))) continue;  /* not shipped yet */
    rows.push(`  <url>\n    <loc>${absUrl(route)}</loc>\n    <priority>${e.priority || '0.6'}</priority>\n  </url>`);
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    rows.join('\n') + '\n</urlset>\n';
}

function buildRobots() {
  return 'User-agent: *\nAllow: /\n\nSitemap: ' + B.origin + '/sitemap.xml\n';
}

function processTextFile(rel, body) {
  const abs = path.join(ROOT, rel);
  const raw = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  return { abs, rel, raw, out: body.replace(/\n/g, eol) };
}

/* ========================================================================== */
/*  main                                                                      */
/* ========================================================================== */

function main() {
  if (EMIT) {
    const page = { rel: '<emit>', route: '', depth: EMIT_DEPTH, entry: SEO.routes[''] };
    process.stdout.write(regionBody(EMIT, page) + '\n');
    return 0;
  }

  const results = listPages().map(processPage);
  results.push(processTextFile('sitemap.xml', buildSitemap()));
  results.push(processTextFile('robots.txt', buildRobots()));

  const changed = results.filter((r) => r.out !== r.raw);

  for (const w of warnings) console.warn('WARN  ' + w);

  if (CHECK) {
    if (changed.length) {
      console.error(`\n${changed.length} file(s) would change — a generated region was hand-edited ` +
        `or the data changed without a regen:`);
      for (const c of changed) console.error('  ' + c.rel.split(path.sep).join('/'));
      console.error('\nRun: node _build/regen.mjs');
      return 1;
    }
    console.log(`regen --check: ${results.length} file(s) already up to date.`);
    return 0;
  }

  for (const c of changed) fs.writeFileSync(c.abs, c.out);
  console.log(`regen: ${changed.length} of ${results.length} file(s) rewritten.`);
  for (const c of changed) console.log('  ' + c.rel.split(path.sep).join('/'));
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error('regen FAILED: ' + err.message);
  process.exit(2);
}
