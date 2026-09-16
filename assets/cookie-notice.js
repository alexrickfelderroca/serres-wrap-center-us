/* =====================================================================
   SERRES Wrap Center (US) — cookie notice   (spec section 9)
   ---------------------------------------------------------------------
   A simple dismissible bar linking to /privacy. NOT an EU-style blocking
   consent gate: nothing here withholds analytics, it only informs.

   HONESTY GATE: business.ga4Id and business.pixelId are both null, so the
   site currently sets NO analytics cookies at all. Announcing cookies that
   do not exist would be a false statement, so the bar stays hidden until
   ANALYTICS_LIVE or PIXEL_LIVE is true. Set window.SERRES_COOKIE_FORCE = true
   before this script runs to preview it.

   localStorage can throw (private mode, blocked site data), so every read
   and write is wrapped in try/catch and the bar degrades to "shows once per
   page load" rather than breaking.
   ===================================================================== */
(function () {
  "use strict";

  if (window.SERRES_COOKIE_NOTICE) return;

  var KEY = 'serres-us-cookie-notice';
  var VALUE = 'dismissed';

  function B() { return window.SERRES_BUSINESS || {}; }

  function store(op, val) {
    try {
      if (!window.localStorage) return null;
      if (op === 'get') return window.localStorage.getItem(KEY);
      if (op === 'set') { window.localStorage.setItem(KEY, val); return val; }
    } catch (_) { /* private mode / blocked storage — ignore */ }
    return null;
  }

  function privacyHref() {
    if (typeof window.SERRES_URL === 'function') return window.SERRES_URL('privacy/');
    return 'privacy/';
  }

  var css = ''
  + '.us-cookie{position:fixed;left:0;right:0;z-index:140;'
  +   'bottom:calc(var(--us-bar-h,0px) + env(safe-area-inset-bottom));'
  +   'display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;'
  +   'padding:14px 20px;box-sizing:border-box;'
  +   'background:linear-gradient(180deg,rgba(14,14,16,.97),rgba(10,10,11,.98));'
  +   '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);'
  +   'border-top:1px solid var(--line-strong,rgba(255,255,255,.16));'
  +   'box-shadow:0 -10px 34px rgba(0,0,0,.42),0 -1px 0 rgba(255,255,255,.04);'
  +   'transform:translateY(100%);transition:transform .38s var(--ease,cubic-bezier(.22,.61,.36,1))}'
  + '.us-cookie.us-cookie-in{transform:none}'
  + '.us-cookie-txt{font-size:14px;line-height:1.6;color:var(--muted,#9a9aa3);margin:0;max-width:64ch}'
  + '.us-cookie-txt a{color:var(--text,#f3f3f5);text-decoration:underline;text-underline-offset:3px}'
  + '.us-cookie-txt a:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:2px}'
  + '.us-cookie-ok{min-height:44px;padding:0 22px;cursor:pointer;flex:none;'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:700;'
  +   'text-transform:uppercase;letter-spacing:.16em;font-size:12.5px;'
  +   'color:#0a0a0b;background:var(--text,#f3f3f5);border:1px solid var(--text,#f3f3f5);'
  +   'clip-path:polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px));'
  +   'transition:background .2s var(--ease,ease)}'
  + '.us-cookie-ok:hover{background:#fff}'
  + '.us-cookie-ok:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:3px}'
  + '@media(max-width:560px){.us-cookie{justify-content:flex-start;padding:16px 20px}'
  +   '.us-cookie-ok{width:100%;justify-content:center;display:inline-flex;align-items:center}}'
  + '@media(prefers-reduced-motion:reduce){.us-cookie{transition-duration:.01ms!important;transform:none}}';

  function build() {
    var style = document.createElement('style');
    style.id = 'us-cookie-style';
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement('aside');
    bar.className = 'us-cookie';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie notice');
    bar.innerHTML =
      '<p class="us-cookie-txt">We use cookies for analytics &#8212; to see which pages people actually read. ' +
      'No ads follow you around. <a href="' + privacyHref() + '">Privacy policy</a>.</p>' +
      '<button type="button" class="us-cookie-ok">Got it</button>';
    document.body.appendChild(bar);

    /* next frame, so the slide-up transition has a start value to animate from */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bar.classList.add('us-cookie-in'); });
    });

    bar.querySelector('.us-cookie-ok').addEventListener('click', function () {
      store('set', VALUE);
      bar.classList.remove('us-cookie-in');
      setTimeout(function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 420);
    });
  }

  function init() {
    if (document.querySelector('.us-cookie')) return;
    var b = B();
    var live = !!(b.ANALYTICS_LIVE || b.PIXEL_LIVE) || window.SERRES_COOKIE_FORCE === true;
    if (!live) return;                       // no cookies are set — say nothing
    if (store('get') === VALUE) return;      // already dismissed
    build();
  }

  window.SERRES_COOKIE_NOTICE = { init: init, reset: function () { store('set', ''); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
