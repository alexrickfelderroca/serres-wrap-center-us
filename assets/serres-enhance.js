/* =====================================================================
   SERRES Wrap Center (US) — shared site enhancements
   ---------------------------------------------------------------------
   1. Site-root resolution (works at any depth AND under a GitHub Pages
      project subpath — never emits a root-absolute "/..." path)
   2. Mobile menu (hamburger + full-screen overlay, focus-trapped)
   3. Floating WhatsApp button      — flag-gated on WHATSAPP_LIVE
   4. Sticky mobile bottom bar      — flag-gated on PHONE_LIVE / SMS_LIVE /
      WHATSAPP_LIVE (spec section 4.2); renders NOTHING while all are false
   5. Count-up animation for stat numbers
   6. Embedded-frame external-link opener
   7. Hero video data-saver guard

   EVERY phone number, address, e-mail and opening hour comes from
   window.SERRES_BUSINESS (assets/business.js). Nothing here is hardcoded.

   Drop in on every page with (path relative to the page):
     <script src="assets/serres-enhance.js" defer></script>
   ===================================================================== */
(function () {
  "use strict";

  if (window.__SERRES_ENHANCE__) return;
  window.__SERRES_ENHANCE__ = true;

  /* ===================================================================
     0.  SITE ROOT  —  replaces the old /(services|pages|blog)/ test.
     The script itself always lives at <site-root>/assets/serres-enhance.js,
     and the browser has already resolved that src to an absolute URL, so it
     tells us exactly where the site root is — at any depth, on a custom
     domain or under a /project-name/ GitHub Pages subpath.
     =================================================================== */
  var SELF_SRC = (function () {
    if (document.currentScript && document.currentScript.src) return document.currentScript.src;
    var s = document.getElementsByTagName('script'), i;
    for (i = s.length - 1; i >= 0; i--) {
      if (/serres-enhance\.js(?:[?#]|$)/.test(s[i].src || '')) return s[i].src;
    }
    return '';
  })();

  function rootFromUrl(u) {
    var i = String(u || '').indexOf('/assets/');
    return i === -1 ? '' : String(u).slice(0, i + 1);   // ".../"  with trailing slash
  }

  var ROOT = rootFromUrl(SELF_SRC);
  if (!ROOT) {
    /* fallback: anything else on the page already pointing into assets/ */
    var probe = document.querySelector('link[href*="assets/"],script[src*="assets/"],img[src*="assets/"]');
    if (probe) ROOT = rootFromUrl(probe.href || probe.src || '');
  }

  /* Turn the absolute root into a "../../" prefix so every href we emit stays
     relative — required because the site must work both at serreswrap.com and
     at a GitHub Pages project URL. */
  var BASE = (function () {
    var rootPath = '';
    try { rootPath = ROOT ? new URL(ROOT, location.href).pathname : ''; } catch (_) { rootPath = ''; }
    var cur = location.pathname;
    if (!rootPath || cur.indexOf(rootPath) !== 0) return '';
    var rest = cur.slice(rootPath.length).replace(/[^\/]*$/, '');   // drop the filename, keep dirs
    var n = rest ? rest.split('/').length - 1 : 0;
    return n > 0 ? new Array(n + 1).join('../') : '';
  })();

  function url(rel) { return BASE + rel; }

  /* published for quote-form.js / cookie-notice.js / analytics.js */
  window.SERRES_BASE = BASE;
  window.SERRES_URL = url;

  /* ===================================================================
     1.  HELPERS
     =================================================================== */
  var B = {};                       // window.SERRES_BUSINESS, read at init()
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toArray(list) { return Array.prototype.slice.call(list || []); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fn(name, arg) {
    try { return typeof B[name] === 'function' ? B[name](arg) : null; } catch (_) { return null; }
  }

  /* ===================================================================
     2.  NAV  —  spec section 4.2
     =================================================================== */
  var SERVICES = [
    { label: 'Paint Protection Film', slug: 'paint-protection-film' },
    { label: 'Car Wraps',             slug: 'car-wraps' },
    { label: 'Ceramic Coating',       slug: 'ceramic-coating' },
    { label: 'Window Tint',           slug: 'window-tint' },
    { label: 'Detailing',             slug: 'detailing' }
  ];

  var MENU = [
    { label: 'Pricing',   slug: 'pricing' },
    { label: 'Our Films', slug: 'our-films' },
    { label: 'About',     slug: 'about' },
    { label: 'Contact',   slug: 'contact' },
    { label: 'Blog',      slug: 'blog' },
    { label: 'Gallery',   slug: 'gallery' }
  ];

  /* ---- icons ---- */
  var ICON_WA = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.56 4.18 1.62 6L4 29l8.16-1.58a12 12 0 0 0 3.88.64h.01C22.7 28.06 28.1 22.66 28.1 16.02 28.1 8.4 22.68 3 16.04 3Zm0 21.9h-.01c-1.18 0-2.34-.22-3.43-.66l-.25-.1-4.84.94.97-4.72-.16-.25a9.74 9.74 0 0 1-1.49-5.18c0-5.4 4.4-9.8 9.83-9.8 2.62 0 5.08 1.02 6.93 2.88a9.7 9.7 0 0 1 2.87 6.93c0 5.4-4.4 9.8-9.82 9.8Zm5.39-7.33c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z"/></svg>';
  var ICON_IG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Z"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>';
  var ICON_TEL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 3.5h2.9l1.4 3.6-1.9 1.4a12.4 12.4 0 0 0 5.5 5.5l1.4-1.9 3.6 1.4v2.9a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/></svg>';
  var ICON_SMS = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.2c0 3.8-3.8 6.9-8.5 6.9a10 10 0 0 1-2.6-.34L4.2 20.5l1.5-3.4A6.6 6.6 0 0 1 3.5 12.2c0-3.8 3.8-6.9 8.5-6.9s8.5 3.1 8.5 6.9Z"/></svg>';

  /* ===================================================================
     3.  STYLES
     =================================================================== */
  var css = ''
  /* ---------- hamburger ---------- */
  + '.srs-burger{display:none;align-items:center;justify-content:center;width:46px;height:46px;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'cursor:pointer;flex:none;color:var(--text,#f3f3f5);'
  +   'clip-path:polygon(0 0,100% 0,100% 100%,9px 100%,0 calc(100% - 9px));'
  +   'transition:border-color .25s var(--ease,ease),background .25s var(--ease,ease)}'
  + '.srs-burger:hover{border-color:#fff;background:rgba(255,255,255,.06)}'
  + '.srs-burger:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:2px}'
  + '.srs-burger span{display:block;width:20px;height:1.5px;background:var(--text,#f3f3f5);position:relative}'
  + '.srs-burger span::before,.srs-burger span::after{content:"";position:absolute;left:0;width:20px;height:1.5px;'
  +   'background:var(--text,#f3f3f5);transition:transform .25s var(--ease,ease)}'
  + '.srs-burger span::before{top:-6px}.srs-burger span::after{top:6px}'
  /* The old code showed the burger at <=980px while the pages hide .nav-links at
     <=1200px, leaving 981-1200px with NO navigation. Rather than hardcode a second
     breakpoint that can drift out of sync with the header CSS, the burger is driven
     by whether the page's own nav row is actually rendered (see syncBurger). The
     media query below is only the fallback for a page with no .nav-links at all. */
  + '.srs-burger.us-burger-show{display:inline-flex}'
  + '@media(max-width:1200px){.srs-burger.us-burger-auto{display:inline-flex}}'
  /* hard floor: the spec requires a hamburger on mobile, so it is never
     suppressed below 760px whatever the header stylesheet does */
  + '@media(max-width:760px){.srs-burger{display:inline-flex}}'

  /* Lower the nav row on phones only as far as the notch actually requires.
     This used to be max(64px, …), inherited from the Barcelona site where the header was
     position:fixed. The US header is position:sticky and env(safe-area-inset-top) is 0 in
     an ordinary browser tab, so the 64px floor was pure empty space — a measured 125px-tall
     header on a 390x844 screen, ~15% of the viewport, above the logo. The inset term still
     does its job in a standalone/PWA context. */
  + '@media(max-width:760px){header.nav .nav-inner{'
  +   'padding-top:max(18px,calc(env(safe-area-inset-top) + 18px));padding-bottom:14px}}'

  /* ---------- overlay menu ---------- */
  + '.srs-menu{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;'
  +   'background:rgba(8,8,10,.97);-webkit-backdrop-filter:blur(20px) saturate(120%);backdrop-filter:blur(20px) saturate(120%);'
  /* visibility is switched with a 0s step (delayed on close) rather than
     interpolated: a transitioned `visibility` is still computed `hidden` at
     progress 0, so the close button could not take focus on open. */
  +   'opacity:0;visibility:hidden;transition:opacity .42s var(--ease,ease),visibility 0s linear .42s}'
  + '.srs-menu.open{opacity:1;visibility:visible;transition:opacity .42s var(--ease,ease),visibility 0s linear 0s}'
  + '.srs-menu-bar{display:flex;align-items:center;justify-content:space-between;'
  +   'padding:max(22px,calc(env(safe-area-inset-top) + 20px)) 22px 20px;border-bottom:1px solid var(--line,rgba(255,255,255,.09))}'
  + '.srs-menu-logo{display:inline-flex;align-items:center;padding:0;font-size:0;line-height:0}'
  + '.srs-menu-logo img{display:block;width:150px;height:auto;aspect-ratio:600/55}'
  + '.srs-close{width:46px;height:46px;display:grid;place-items:center;cursor:pointer;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'color:var(--text,#f3f3f5);transition:border-color .25s var(--ease,ease),transform .25s var(--ease,ease)}'
  + '.srs-close:hover{border-color:#fff;transform:rotate(90deg)}'
  + '.srs-close:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:2px}'
  + '.srs-close svg{width:20px;height:20px}'
  /* justify-content:center would clip the top of an overflowing flex column and
     make it unreachable — auto margins centre it only while there is room */
  + '.srs-links{flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:clamp(12px,2.2vh,22px);'
  +   'padding:clamp(12px,2.6vh,26px) 22px;overflow-y:auto;-webkit-overflow-scrolling:touch}'
  + '.srs-links>:first-child{margin-top:auto}.srs-links>:last-child{margin-bottom:auto}'

  /* services block (new — us- prefixed) */
  + '.us-menu-group{opacity:0;transform:translateY(14px);transition:opacity .5s var(--ease,ease),transform .5s var(--ease,ease)}'
  + '.srs-menu.open .us-menu-group{opacity:1;transform:none}'
  + '.us-menu-eyebrow{display:block;font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;'
  +   'text-transform:uppercase;letter-spacing:.24em;font-size:11px;color:var(--muted,#9a9aa3);'
  +   'padding-bottom:10px;border-bottom:1px solid var(--line,rgba(255,255,255,.09))}'
  + '.us-menu-svc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 20px;margin-top:4px}'
  + '.us-menu-svc a{display:flex;align-items:center;min-height:44px;'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;'
  +   'text-transform:uppercase;letter-spacing:.07em;font-size:clamp(15px,3.6vw,18px);line-height:1.15;'
  +   'color:var(--muted,#9a9aa3);text-decoration:none;transition:color .2s var(--ease,ease)}'
  + '.us-menu-svc a:hover,.us-menu-svc a:focus-visible{color:var(--text,#f3f3f5)}'
  + '.us-menu-svc a:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:3px}'
  + '@media(max-width:379px){.us-menu-svc{grid-template-columns:1fr}}'

  /* main rows (inherited look) */
  + '.us-menu-main{display:flex;flex-direction:column}'
  + '.srs-links a.us-row{display:flex;align-items:baseline;gap:18px;min-height:44px;padding:clamp(9px,1.9vh,16px) 0;'
  +   'border-bottom:1px solid var(--line,rgba(255,255,255,.09));'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;text-transform:uppercase;'
  +   'letter-spacing:.05em;font-size:clamp(26px,6.6vw,40px);line-height:1;color:var(--text,#f3f3f5);text-decoration:none;'
  +   'opacity:0;transform:translateY(14px);transition:color .25s var(--ease,ease)}'
  + '.srs-menu.open .srs-links a.us-row{opacity:1;transform:none;'
  +   'transition:opacity .5s var(--ease,ease),transform .5s var(--ease,ease),color .25s var(--ease,ease)}'
  + '.srs-links a.us-row .idx{font-size:13px;font-weight:500;letter-spacing:.2em;color:var(--muted-2,#6e6e77);'
  +   'transform:translateY(-.35em)}'
  + '.srs-links a.us-row:hover{color:var(--muted,#9a9aa3)}'
  + '.srs-links a.us-row:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:3px}'

  + '.srs-menu-foot{padding:20px 22px calc(26px + env(safe-area-inset-bottom));'
  +   'border-top:1px solid var(--line,rgba(255,255,255,.09));'
  +   'display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}'
  + '.srs-social{display:flex;gap:12px}'
  + '.srs-social a{width:48px;height:48px;display:grid;place-items:center;color:var(--text,#f3f3f5);'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'transition:border-color .25s var(--ease,ease),background .25s var(--ease,ease),transform .25s var(--ease,ease)}'
  + '.srs-social a:hover{border-color:#fff;transform:translateY(-2px)}'
  + '.srs-social a.wa:hover{background:rgba(37,211,102,.16);border-color:#25d366;color:#25d366}'
  + '.srs-social a:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:2px}'
  + '.srs-social a svg{width:24px;height:24px}'
  + '.srs-menu-contact{font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;text-transform:uppercase;'
  +   'letter-spacing:.14em;font-size:12.5px;color:var(--muted,#9a9aa3);text-align:right;line-height:1.75;max-width:52ch}'
  + '.srs-menu-contact a{color:var(--text,#f3f3f5)}'
  + '@media(max-width:560px){.srs-menu-contact{text-align:left;width:100%}}'

  /* gold identity kept for any gold-flagged entry */
  + '.srs-gold{background:linear-gradient(105deg,#8a6d2f 0%,#c9a44f 20%,#f3e0ac 38%,#d4af5f 52%,#8a6d2f 70%,#e9d194 88%,#b28f41 100%);'
  +   'background-size:220% 100%;background-position:0% 0;'
  +   '-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;'
  +   'transition:filter .35s var(--ease,ease),background-position .9s var(--ease,ease)}'
  + 'a:hover .srs-gold,a:focus-visible .srs-gold{background-position:100% 0;'
  +   'filter:drop-shadow(0 0 6px rgba(212,175,95,.5)) drop-shadow(0 0 18px rgba(212,175,95,.22))}'

  /* ---------- sticky mobile bottom bar (spec 4.2) ---------- */
  + ':root{--us-bar-h:0px}'
  + '.us-stickybar{position:fixed;left:0;right:0;bottom:0;z-index:130;display:none;'
  +   'grid-auto-flow:column;grid-auto-columns:1fr;'
  +   'background:linear-gradient(to top,rgba(8,8,10,.98),rgba(12,12,15,.94));'
  +   '-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);'
  +   'border-top:1px solid var(--line-strong,rgba(255,255,255,.16));'
  +   'box-shadow:0 -1px 0 rgba(255,255,255,.04),0 -10px 30px rgba(0,0,0,.45),0 -24px 60px rgba(0,0,0,.35);'
  +   'padding-bottom:env(safe-area-inset-bottom)}'
  + '@media(max-width:760px){.us-stickybar{display:grid}html.us-has-stickybar{--us-bar-h:56px}'
  +   'html.us-has-stickybar body{padding-bottom:calc(56px + env(safe-area-inset-bottom))}}'
  + '.us-sb-btn{min-height:56px;display:flex;align-items:center;justify-content:center;gap:9px;'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;'
  +   'text-transform:uppercase;letter-spacing:.15em;font-size:13px;color:var(--text,#f3f3f5);text-decoration:none;'
  +   'border-left:1px solid var(--line,rgba(255,255,255,.09));'
  +   '-webkit-tap-highlight-color:transparent;transition:background .18s var(--ease,ease)}'
  + '.us-sb-btn:first-child{border-left:0}'
  + '.us-sb-btn:active{background:rgba(255,255,255,.06)}'
  + '.us-sb-btn:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:-3px}'
  + '.us-sb-btn svg{width:18px;height:18px;flex:none}'
  + '.us-sb-btn.us-sb-wa{color:#7ee2a8}'

  /* ---------- floating WhatsApp ---------- */
  + '.srs-wa-float{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:120;'
  +   'width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:#25d366;color:#fff;'
  +   'box-shadow:0 2px 6px rgba(0,0,0,.28),0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,.5);'
  +   'transition:transform .25s var(--ease,ease)}'
  + '.srs-wa-float:hover{transform:translateY(-3px) scale(1.04)}'
  + '.srs-wa-float:focus-visible{outline:2px solid #fff;outline-offset:3px}'
  + '.srs-wa-float svg{width:32px;height:32px}'
  /* never let the bubble sit on top of the sticky bar */
  + '@media(max-width:760px){html.us-has-stickybar .srs-wa-float{'
  +   'bottom:calc(56px + env(safe-area-inset-bottom) + 16px)}}'
  + '@media(prefers-reduced-motion:no-preference){.srs-wa-float{animation:srsPulse 2.6s ease-out infinite}}'
  + '@keyframes srsPulse{0%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,.45)}'
  +   '70%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 16px rgba(37,211,102,0)}'
  +   '100%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,0)}}'
  /* legacy home-page round call button: lift it only when something is below it */
  + 'html.us-has-wa-float .mobile-call{bottom:86px!important}'
  + '@media(max-width:760px){html.us-has-stickybar .mobile-call{bottom:calc(56px + env(safe-area-inset-bottom) + 16px)!important}'
  +   'html.us-has-stickybar.us-has-wa-float .mobile-call{bottom:calc(56px + env(safe-area-inset-bottom) + 84px)!important}}'

  /* ---------- reduced motion ---------- */
  + '@media(prefers-reduced-motion:reduce){'
  +   '.srs-menu,.srs-links a.us-row,.us-menu-group,.srs-wa-float,.srs-close,.srs-burger,.us-sb-btn{'
  +     'transition-duration:.01ms!important;transition-delay:0s!important;animation:none!important}'
  +   '.srs-links a.us-row,.us-menu-group{transform:none!important}}';

  var style = document.createElement('style');
  style.id = 'srs-enhance-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ===================================================================
     4.  BUILD DOM
     =================================================================== */
  function contactLinks() {
    /* Every entry is gated on its own business flag. All flags are false while
       the values are null, so this returns [] and NOTHING is rendered. */
    var out = [];
    var tel = B.PHONE_LIVE ? fn('telHref') : null;
    var sms = B.SMS_LIVE ? fn('smsHref') : null;
    var wa  = B.WHATSAPP_LIVE ? fn('waHref', B.WA_TEXT || '') : null;
    if (tel) out.push({ key: 'phone', event: 'phone_click', href: tel, label: 'Call', icon: ICON_TEL, cls: '' });
    if (sms) out.push({ key: 'sms', event: 'sms_click', href: sms, label: 'Text', icon: ICON_SMS, cls: '' });
    if (wa)  out.push({ key: 'wa', event: 'whatsapp_click', href: wa, label: 'WhatsApp', icon: ICON_WA, cls: 'us-sb-wa' });
    return out;
  }

  /* The burger shows exactly when the page's own nav row is NOT rendered, so the
     two can never overlap and can never both be hidden — whatever breakpoint the
     header CSS uses. */
  function syncBurger(header, burger) {
    var nav = header.querySelector('.nav-links, .us-nav__links, [data-us-nav-links]');
    if (!nav) { burger.classList.add('us-burger-auto'); return; }
    function check() {
      var cs = window.getComputedStyle(nav);
      var hidden = cs.display === 'none' || cs.visibility === 'hidden' ||
                   nav.getBoundingClientRect().width === 0;
      if (hidden) burger.classList.add('us-burger-show');
      else burger.classList.remove('us-burger-show');
    }
    check();
    var queued = false;
    window.addEventListener('resize', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; check(); });
    }, { passive: true });
    window.addEventListener('orientationchange', check, { passive: true });
    /* late webfont / stylesheet arrival can change the nav's measured width */
    setTimeout(check, 400);
    setTimeout(check, 1500);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(check)['catch'](function () {});
    }
  }

  function buildMenu() {
    var header = document.querySelector('header');
    var slot = header ? (header.querySelector('.nav-right') || header.querySelector('.nav-inner')) : null;
    if (!slot) return;                      // no header on this page → no menu

    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'srs-burger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'srs-menu');
    burger.innerHTML = '<span></span>';
    slot.appendChild(burger);
    syncBurger(header, burger);

    var menu = document.createElement('nav');
    menu.className = 'srs-menu';
    menu.id = 'srs-menu';
    menu.setAttribute('aria-label', 'Site menu');
    menu.setAttribute('aria-hidden', 'true');

    var svcHTML = SERVICES.map(function (s) {
      return '<a href="' + esc(url(s.slug + '/')) + '">' + esc(s.label) + '</a>';
    }).join('');

    var rowsHTML = MENU.map(function (m, i) {
      var lbl = m.gold ? '<span class="srs-gold">' + esc(m.label) + '</span>' : esc(m.label);
      return '<a class="us-row" href="' + esc(url(m.slug + '/')) + '">' +
             '<span class="idx" aria-hidden="true">' + pad2(i + 1) + '</span>' + lbl + '</a>';
    }).join('');

    var contacts = contactLinks();
    var socialHTML = '';
    var waLink = B.WHATSAPP_LIVE ? fn('waHref', B.WA_TEXT || '') : null;
    if (waLink) {
      socialHTML += '<a class="wa" href="' + esc(waLink) + '" target="_blank" rel="noopener" ' +
                    'data-us-track="whatsapp_click" aria-label="Chat on WhatsApp">' + ICON_WA + '</a>';
    }
    if (B.instagram) {
      socialHTML += '<a class="ig" href="' + esc(B.instagram) + '" target="_blank" rel="noopener" ' +
                    'aria-label="Instagram">' + ICON_IG + '</a>';
    }

    /* NAP block — address / hours / languages from business.js only.
       A phone line appears only when PHONE_LIVE is true. */
    var napBits = [];
    if (B.addressLine) napBits.push(esc(B.addressLine));
    if (B.hoursDisplay) napBits.push(esc(B.hoursDisplay));
    var telHref = B.PHONE_LIVE ? fn('telHref') : null;
    if (telHref && B.phoneDisplay) {
      napBits.push('<a href="' + esc(telHref) + '" data-us-track="phone_click">' + esc(B.phoneDisplay) + '</a>');
    }
    /* languages line removed at the owner request 2026-09-16 (was: Se habla espanol / Govorim po-russki) */

    menu.innerHTML =
      '<div class="srs-menu-bar">' +
        '<a class="srs-menu-logo" href="' + esc(url('')) + '" aria-label="SERRES — home">' +
          '<img src="' + esc(url('assets/serres-logo.png')) + '" alt="SERRES" width="600" height="55">' +
        '</a>' +
        '<button type="button" class="srs-close" aria-label="Close menu">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false">' +
          '<path d="M5 5l14 14M19 5L5 19"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="srs-links">' +
        '<div class="us-menu-group">' +
          '<span class="us-menu-eyebrow">Services</span>' +
          '<div class="us-menu-svc">' + svcHTML + '</div>' +
        '</div>' +
        '<div class="us-menu-main">' + rowsHTML + '</div>' +
      '</div>' +
      '<div class="srs-menu-foot">' +
        (socialHTML ? '<div class="srs-social">' + socialHTML + '</div>' : '<div></div>') +
        (napBits.length ? '<div class="srs-menu-contact">' + napBits.join('<br>') + '</div>' : '') +
      '</div>';

    document.body.appendChild(menu);

    var rowEls = toArray(menu.querySelectorAll('.srs-links a.us-row'));
    var closeBtn = menu.querySelector('.srs-close');
    var lastFocus = null;

    function focusables() {
      return toArray(menu.querySelectorAll('a[href],button:not([disabled])'))
        .filter(function (el) { return el.offsetParent !== null || el === closeBtn; });
    }
    function open() {
      lastFocus = document.activeElement;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      rowEls.forEach(function (a, i) { a.style.transitionDelay = (0.06 + i * 0.04) + 's'; });
      /* the overlay is visibility:hidden until the class lands, and an element
         inside a hidden subtree cannot take focus — force a style flush first.
         (A rAF would be throttled to never in a backgrounded tab.) */
      void menu.offsetWidth;
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      if (!menu.classList.contains('open')) return;
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      rowEls.forEach(function (a) { a.style.transitionDelay = '0s'; });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    toArray(menu.querySelectorAll('.srs-links a')).forEach(function (a) {
      a.addEventListener('click', function () { close(); });
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- floating WhatsApp bubble — only when WHATSAPP_LIVE ---- */
  function buildWaFloat() {
    if (!B.WHATSAPP_LIVE) return;
    var href = fn('waHref', B.WA_TEXT || '');
    if (!href) return;
    var wa = document.createElement('a');
    wa.className = 'srs-wa-float';
    wa.href = href;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('data-us-track', 'whatsapp_click');
    wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.innerHTML = ICON_WA;
    document.body.appendChild(wa);
    document.documentElement.classList.add('us-has-wa-float');
  }

  /* ---- sticky mobile bottom bar — spec section 4.2 ----
     Call · Text · WhatsApp. Renders NOTHING (no stub, no placeholder number)
     while PHONE_LIVE / SMS_LIVE / WHATSAPP_LIVE are false. */
  function buildStickyBar() {
    var items = contactLinks();
    if (!items.length) return;
    var bar = document.createElement('div');
    bar.className = 'us-stickybar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Contact ' + (B.name || 'SERRES'));
    bar.innerHTML = items.map(function (it) {
      var attrs = it.key === 'wa' ? ' target="_blank" rel="noopener"' : '';
      return '<a class="us-sb-btn ' + it.cls + '" href="' + esc(it.href) + '"' + attrs +
             ' data-us-track="' + it.event + '">' + it.icon + '<span>' + esc(it.label) + '</span></a>';
    }).join('');
    document.body.appendChild(bar);
    document.documentElement.classList.add('us-has-stickybar');
  }

  /* ===================================================================
     5.  COUNT-UP
     =================================================================== */
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (_) {}

  function fmtNum(n, decimals, comma) {
    var s = n.toFixed(decimals);
    if (comma) {
      var parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = parts.join('.');
    }
    return s;
  }

  function setupCounters() {
    var targets = toArray(document.querySelectorAll('.hstat b, .rv-stat b, .gb-val, [data-count-up]'));
    var items = [];
    targets.forEach(function (el) {
      var html = el.innerHTML;
      var m = html.match(/^(\s*)([0-9][\d,]*(?:\.\d+)?)([\s\S]*)$/);
      if (!m) return;
      var numStr = m[2], rest = m[3];
      var decimals = (numStr.split('.')[1] || '').length;
      var comma = numStr.indexOf(',') !== -1;
      var value = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(value)) return;
      items.push({ el: el, value: value, decimals: decimals, comma: comma, rest: rest, finalHTML: numStr + rest });
      if (!reduce) el.innerHTML = fmtNum(0, decimals, comma) + rest;
    });
    if (reduce || !items.length) return;

    function animate(it) {
      var dur = 1800, start = Date.now();
      function step() {
        var p = Math.min(1, (Date.now() - start) / dur);
        var e = 1 - Math.pow(1 - p, 4);
        it.el.innerHTML = fmtNum(it.value * e, it.decimals, it.comma) + it.rest;
        if (p >= 1) { clearInterval(it._iv); it.el.innerHTML = it.finalHTML; }
      }
      it._iv = setInterval(step, 16);
      step();
    }

    function inView(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.height === 0 && r.width === 0) return false;
      return r.top < vh * 0.88 && r.bottom > vh * 0.04;
    }
    var pending = items.length;
    function checkAll() {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.done && inView(it.el)) { it.done = true; pending--; animate(it); }
      }
      if (pending <= 0) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    var scheduled = false;
    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { scheduled = false; checkAll(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    checkAll();
    setTimeout(checkAll, 900);          // failsafe if the first pass ran too early
  }

  /* ===================================================================
     6.  EXTERNAL-LINK OPENER (embedded / sandboxed frames only)
     =================================================================== */
  function externalOpener() {
    var framed = false;
    try { framed = (window.top !== window.self); } catch (_) { framed = true; }
    if (!framed) return;

    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;
      try { if (href.indexOf(location.origin) === 0) return; } catch (_) {}
      e.preventDefault();
      /* no 'noreferrer' — api.whatsapp.com rejects referrer-less requests */
      var win = null;
      try { win = window.open(href, '_blank', 'noopener'); } catch (_) {}
      if (win) return;
      try { if (window.top && window.top !== window) { window.top.location.href = href; return; } } catch (_) {}
      window.location.href = href;
    }, false);
  }

  /* ===================================================================
     7.  HERO VIDEO — MOBILE / DATA-SAVER GUARD
     =================================================================== */
  function optimizeHeroVideo() {
    var conn = navigator.connection || navigator.webkitConnection || null;
    var saveData = !!(conn && conn.saveData);
    var slow = !!(conn && /(^|-)2g$|^slow-2g$|^3g$/.test(conn.effectiveType || ''));
    if (!(saveData || slow)) return;
    toArray(document.querySelectorAll('.hero video')).forEach(function (v) {
      v.removeAttribute('autoplay');
      v.preload = 'none';
      try { v.pause(); } catch (_) {}
      while (v.firstChild) v.removeChild(v.firstChild);
      v.removeAttribute('src');
      try { v.load(); } catch (_) {}
    });
  }

  /* ===================================================================
     8.  SIBLING MODULES
     analytics.js / cookie-notice.js / quote-form.js are separate files so a
     page can include them explicitly. If a page has not, we inject them here
     — guarded so an explicit <script> tag never double-loads them.
     serres-i18n.js is deliberately NOT loaded (spec defers Spanish to
     December; the 110 KB file stays in the repo, unfetched).
     =================================================================== */
  function loadSibling(file, globalKey) {
    if (window[globalKey]) return;
    if (document.querySelector('script[src$="' + file + '"]')) return;
    var s = document.createElement('script');
    s.src = url('assets/' + file);
    s.defer = true;
    document.body.appendChild(s);
  }
  function loadSiblings() {
    loadSibling('analytics.js', 'SERRES_TRACK');
    loadSibling('cookie-notice.js', 'SERRES_COOKIE_NOTICE');
    if (document.querySelector('form[data-us-quote]')) loadSibling('quote-form.js', 'SERRES_QUOTE_FORM');
  }

  /* ---- run ---- */
  function init() {
    B = window.SERRES_BUSINESS || {};
    buildMenu();
    buildWaFloat();
    buildStickyBar();
    setupCounters();
    externalOpener();
    optimizeHeroVideo();
    loadSiblings();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
