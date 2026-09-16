/* =====================================================================
   SERRES Wrap Center (US) — analytics wrapper   (spec section 9)
   ---------------------------------------------------------------------
   Exposes:  window.SERRES_TRACK(event, params)

   Providers are read from window.SERRES_BUSINESS:
     business.ga4Id   → GA4 (gtag.js)
     business.pixelId → Meta Pixel

   Both are null today, so this file is a SILENT NO-OP in production: no
   network request, no cookie, no global gtag/fbq. On localhost (or with
   ?srsdebug=1) it still logs every event to the console so the wiring is
   verifiable before the ids exist.

   The provider scripts are loaded only AFTER first interaction or 3s idle,
   so they never compete with LCP.

   Events (spec section 9):
     quote_submit · reserve_submit · deposit_click
     phone_click · sms_click · whatsapp_click · pricing_view
   ===================================================================== */
(function () {
  "use strict";

  if (window.SERRES_TRACK) return;

  var B = window.SERRES_BUSINESS || {};
  var GA4 = B.ga4Id || null;
  var PIXEL = B.pixelId || null;

  var DEV = (function () {
    try {
      if (location.protocol === 'file:') return true;
      var h = location.hostname;
      if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]') return true;
      if (/\.local$/.test(h) || /^192\.168\./.test(h) || h === '') return true;
      if (location.search.indexOf('srsdebug=1') !== -1) return true;
    } catch (_) {}
    return false;
  })();

  /* Meta Pixel has a fixed vocabulary; map our events onto it where one
     genuinely matches, and send the rest as custom events. */
  var PIXEL_STANDARD = {
    quote_submit: 'Lead',
    reserve_submit: 'Lead',
    deposit_click: 'InitiateCheckout',
    pricing_view: 'ViewContent'
  };

  var loaded = false;
  var queue = [];

  /* ------------------------------------------------------------ dispatch */
  function dispatch(event, params) {
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', event, params || {}); } catch (_) {}
    }
    if (typeof window.fbq === 'function') {
      try {
        var std = PIXEL_STANDARD[event];
        if (std) window.fbq('track', std, params || {});
        else window.fbq('trackCustom', event, params || {});
      } catch (_) {}
    }
  }

  function flush() {
    while (queue.length) {
      var q = queue.shift();
      dispatch(q[0], q[1]);
    }
  }

  /* ------------------------------------------------------------- loaders */
  function loadGa4() {
    if (!GA4) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4, { send_page_view: true });
  }

  function loadPixel() {
    if (!PIXEL) return;
    /* Meta's standard snippet, rewritten as plain ES5. */
    if (window.fbq) return;
    var n = window.fbq = function () {
      if (n.callMethod) n.callMethod.apply(n, arguments);
      else n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
  }

  function loadProviders() {
    if (loaded) return;
    loaded = true;
    if (!GA4 && !PIXEL) return;          // nothing to load — stays a no-op
    loadGa4();
    loadPixel();
    flush();
  }

  /* first interaction OR 3s idle, whichever comes first */
  function armLoaders() {
    if (!GA4 && !PIXEL) { loaded = true; return; }
    var evts = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    function once() {
      evts.forEach(function (e) { window.removeEventListener(e, once, true); });
      loadProviders();
    }
    evts.forEach(function (e) { window.addEventListener(e, once, { passive: true, capture: true }); });
    var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 3000); };
    idle(function () { once(); }, { timeout: 3000 });
    setTimeout(once, 3000);
  }

  /* ---------------------------------------------------------- public API */
  window.SERRES_TRACK = function (event, params) {
    if (!event) return;
    var p = {};
    if (params) for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k];
    if (p.page_path === undefined) { try { p.page_path = location.pathname; } catch (_) {} }

    if (DEV) {
      try { console.info('[SERRES_TRACK]', event, p); } catch (_) {}
    }
    if (!GA4 && !PIXEL) return;          // silent no-op in production, by design
    if (!loaded) { queue.push([event, p]); return; }
    dispatch(event, p);
  };

  /* ------------------------------------------- delegated click tracking */
  /* Capture phase, so the event is recorded before the browser navigates. */
  function hrefEvent(href) {
    if (!href) return null;
    if (href.indexOf('tel:') === 0) return 'phone_click';
    if (href.indexOf('sms:') === 0) return 'sms_click';
    if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) return 'whatsapp_click';
    if (B.squareLink && href.indexOf(B.squareLink) === 0) return 'deposit_click';
    if (href.indexOf('squareup.com') !== -1 || href.indexOf('square.link') !== -1) return 'deposit_click';
    return null;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('[data-us-track],a[href]');
    if (!el) return;

    var name = el.getAttribute && el.getAttribute('data-us-track');
    var href = el.getAttribute ? (el.getAttribute('href') || '') : '';
    if (!name) name = hrefEvent(href);
    if (!name) return;

    var params = { link_url: href || undefined };
    var label = el.getAttribute && el.getAttribute('data-us-track-label');
    if (label) params.label = label;
    window.SERRES_TRACK(name, params);
  }, true);

  /* --------------------------------------------------------- pricing_view
     GA4 records the pageview automatically; the custom event exists so the
     Meta Pixel sees it too (spec section 9). */
  function pricingView() {
    var isPricing = false;
    try { isPricing = /\/pricing\/?(?:index\.html)?$/.test(location.pathname); } catch (_) {}
    if (!isPricing && document.querySelector('[data-us-page="pricing"]')) isPricing = true;
    if (isPricing) window.SERRES_TRACK('pricing_view', {});
  }

  function init() { armLoaders(); pricingView(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
