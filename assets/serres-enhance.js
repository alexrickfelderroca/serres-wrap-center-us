/* =====================================================================
   SERRES — site enhancements (shared)
   1. Mobile menu (hamburger + full-screen overlay)
   2. Floating WhatsApp button
   3. Smooth count-up animation for stat numbers
   Drop in on every page with:
     <script src="assets/serres-enhance.js" defer></script>      (root pages)
     <script src="../assets/serres-enhance.js" defer></script>   (services/ & pages/)
   ===================================================================== */
(function(){
  "use strict";

  /* ---- contact constants ---- */
  var WA_DIGITS = "34649663380";                 // +34 649 66 33 80
  var WA_TEXT   = encodeURIComponent("Hola SERRES, quería pedir presupuesto para mi coche.");
  var WA_URL    = "https://wa.me/" + WA_DIGITS + "?text=" + WA_TEXT;
  var IG_URL    = "https://www.instagram.com/serres.wrap.center/";
  var TEL_HREF  = "tel:+" + WA_DIGITS;
  var TEL_TEXT  = "+34 649 66 33 80";

  /* ---- relative-path base (root vs services/ & pages/) ---- */
  var path = location.pathname;
  var nested = /\/(services|pages|blog)\//.test(path);
  var base = nested ? "../" : "";
  var onHome = !nested; // root-level index.html

  function homeLink(hash){ return onHome ? hash : base + "index.html" + hash; }

  var MENU = [
    { label: "Services",   href: homeLink("#services") },
    { label: "Projects",   href: base + "pages/gallery.html" },
    { label: "Exclusive",  href: base + "pages/projects.html", gold: true },
    { label: "Prices",     href: base + "pages/prices.html" },
    { label: "Why SERRES", href: base + "pages/why-serres.html" },
    { label: "Blog",       href: base + "blog/index.html" },
    { label: "Contact",    href: homeLink("#contact") }
  ];

  /* ---- icons ---- */
  var ICON_WA = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.56 4.18 1.62 6L4 29l8.16-1.58a12 12 0 0 0 3.88.64h.01C22.7 28.06 28.1 22.66 28.1 16.02 28.1 8.4 22.68 3 16.04 3Zm0 21.9h-.01c-1.18 0-2.34-.22-3.43-.66l-.25-.1-4.84.94.97-4.72-.16-.25a9.74 9.74 0 0 1-1.49-5.18c0-5.4 4.4-9.8 9.83-9.8 2.62 0 5.08 1.02 6.93 2.88a9.7 9.7 0 0 1 2.87 6.93c0 5.4-4.4 9.8-9.82 9.8Zm5.39-7.33c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z"/></svg>';
  var ICON_IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Z"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>';

  /* ===================================================================
     1 + 2.  STYLES
     =================================================================== */
  var css = ''
  + '.srs-burger{display:none;align-items:center;justify-content:center;width:46px;height:46px;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'cursor:pointer;flex:none;color:var(--text,#f3f3f5);'
  +   'clip-path:polygon(0 0,100% 0,100% 100%,9px 100%,0 calc(100% - 9px));'
  +   'transition:border-color .25s var(--ease,ease),background .25s var(--ease,ease)}'
  + '.srs-burger:hover{border-color:#fff;background:rgba(255,255,255,.06)}'
  + '.srs-burger span{display:block;width:20px;height:1.5px;background:var(--text,#f3f3f5);position:relative}'
  + '.srs-burger span::before,.srs-burger span::after{content:"";position:absolute;left:0;width:20px;height:1.5px;'
  +   'background:var(--text,#f3f3f5);transition:transform .3s var(--ease,ease)}'
  + '.srs-burger span::before{top:-6px}.srs-burger span::after{top:6px}'
  + '@media(max-width:980px){.srs-burger{display:inline-flex}}'

  /* lower the whole nav row on phones so the SERRES logo, language switcher and
     burger clear the device status bar (and respect the notch safe-area) */
  + '@media(max-width:760px){header.nav .nav-inner{'
  +   'padding-top:max(64px,calc(env(safe-area-inset-top) + 20px));padding-bottom:14px}}'

  /* overlay */
  + '.srs-menu{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;'
  +   'background:rgba(8,8,10,.97);-webkit-backdrop-filter:blur(20px) saturate(120%);backdrop-filter:blur(20px) saturate(120%);'
  +   'opacity:0;visibility:hidden;transition:opacity .42s var(--ease,ease),visibility .42s var(--ease,ease)}'
  + '.srs-menu.open{opacity:1;visibility:visible}'
  + '.srs-menu-bar{display:flex;align-items:center;justify-content:space-between;'
  +   'padding:max(60px,calc(env(safe-area-inset-top) + 20px)) 22px 20px;border-bottom:1px solid var(--line,rgba(255,255,255,.09))}'
  + '.srs-menu-logo{display:inline-flex;align-items:center;padding:0;font-size:0;line-height:0}'
  + '.srs-menu-logo img{display:block;width:150px;height:auto;aspect-ratio:600/55}'
  + '.srs-close{width:46px;height:46px;display:grid;place-items:center;cursor:pointer;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'color:var(--text,#f3f3f5);transition:border-color .25s var(--ease,ease),transform .25s var(--ease,ease)}'
  + '.srs-close:hover{border-color:#fff;transform:rotate(90deg)}'
  + '.srs-close svg{width:20px;height:20px}'
  + '.srs-links{flex:1;display:flex;flex-direction:column;justify-content:center;padding:8px 22px}'
  + '.srs-links a{display:flex;align-items:baseline;gap:18px;padding:clamp(11px,2.4vh,20px) 0;'
  +   'border-bottom:1px solid var(--line,rgba(255,255,255,.09));'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;text-transform:uppercase;'
  +   'letter-spacing:.05em;font-size:clamp(30px,8vw,46px);line-height:1;color:var(--text,#f3f3f5);'
  +   'opacity:0;transform:translateY(14px);transition:color .25s var(--ease,ease)}'
  + '.srs-menu.open .srs-links a{opacity:1;transform:none;'
  +   'transition:opacity .5s var(--ease,ease),transform .5s var(--ease,ease),color .25s var(--ease,ease)}'
  + '.srs-links a .idx{font-size:13px;font-weight:500;letter-spacing:.2em;color:var(--muted-2,#6e6e77);'
  +   'transform:translateY(-.35em)}'
  + '.srs-links a:hover{color:var(--muted,#9a9aa3)}'
  + '.srs-menu-foot{padding:20px 22px 26px;border-top:1px solid var(--line,rgba(255,255,255,.09));'
  +   'display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}'
  + '.srs-social{display:flex;gap:12px}'
  + '.srs-social a{width:48px;height:48px;display:grid;place-items:center;color:var(--text,#f3f3f5);'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));background:rgba(255,255,255,.02);'
  +   'transition:border-color .25s var(--ease,ease),background .25s var(--ease,ease),transform .25s var(--ease,ease)}'
  + '.srs-social a:hover{border-color:#fff;transform:translateY(-2px)}'
  + '.srs-social a.wa:hover{background:rgba(37,211,102,.16);border-color:#25d366;color:#25d366}'
  + '.srs-social a svg{width:24px;height:24px}'
  + '.srs-menu-contact{font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;text-transform:uppercase;'
  +   'letter-spacing:.16em;font-size:12.5px;color:var(--muted,#9a9aa3);text-align:right;line-height:1.7}'
  + '.srs-menu-contact a{color:var(--text,#f3f3f5)}'

  /* gold identity for the Exclusivo entry */
  + '.srs-gold{background:linear-gradient(105deg,#8a6d2f 0%,#c9a44f 20%,#f3e0ac 38%,#d4af5f 52%,#8a6d2f 70%,#e9d194 88%,#b28f41 100%);'
  +   'background-size:220% 100%;background-position:0% 0;'
  +   '-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;'
  +   'transition:filter .35s var(--ease,ease),background-position .9s var(--ease,ease)}'
  + 'a:hover .srs-gold,a:focus-visible .srs-gold{background-position:100% 0;'
  +   'filter:drop-shadow(0 0 6px rgba(212,175,95,.5)) drop-shadow(0 0 18px rgba(212,175,95,.22))}'

  /* floating WhatsApp */
  + '.srs-wa-float{position:fixed;right:18px;bottom:18px;z-index:120;width:58px;height:58px;border-radius:50%;'
  +   'display:grid;place-items:center;background:#25d366;color:#fff;'
  +   'box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,.5);'
  +   'transition:transform .3s var(--ease,ease)}'
  + '.srs-wa-float:hover{transform:translateY(-3px) scale(1.04)}'
  + '.srs-wa-float svg{width:32px;height:32px}'
  + '@media(prefers-reduced-motion:no-preference){.srs-wa-float{animation:srsPulse 2.6s ease-out infinite}}'
  + '@keyframes srsPulse{0%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,.45)}'
  +   '70%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 16px rgba(37,211,102,0)}'
  +   '100%{box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 0 0 rgba(37,211,102,0)}}'
  /* if a page already has a round mobile-call button, lift it above the WA float */
  + '.mobile-call{bottom:86px!important}';

  var style = document.createElement('style');
  style.id = 'srs-enhance-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ===================================================================
     BUILD DOM
     =================================================================== */
  function build(){
    var header = document.querySelector('header');
    var slot = header ? (header.querySelector('.nav-right') || header.querySelector('.nav-inner')) : null;

    /* hamburger */
    var burger = document.createElement('button');
    burger.className = 'srs-burger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span>';
    if (slot) slot.appendChild(burger);

    /* overlay */
    var menu = document.createElement('nav');
    menu.className = 'srs-menu';
    menu.setAttribute('aria-hidden', 'true');
    var linksHTML = MENU.map(function(m, i){
      var n = String(i + 1).padStart(2, '0');
      var lbl = m.gold ? '<span class="srs-gold">' + m.label + '</span>' : m.label;
      return '<a href="' + m.href + '"><span class="idx">' + n + '</span>' + lbl + '</a>';
    }).join('');
    menu.innerHTML =
      '<div class="srs-menu-bar">' +
        '<span class="srs-menu-logo"><img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55"></span>' +
        '<button class="srs-close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5l14 14M19 5L5 19"/></svg></button>' +
      '</div>' +
      '<div class="srs-links">' + linksHTML + '</div>' +
      '<div class="srs-menu-foot">' +
        '<div class="srs-social">' +
          '<a class="wa" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON_WA + '</a>' +
          '<a class="ig" href="' + IG_URL + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON_IG + '</a>' +
        '</div>' +
        '<div class="srs-menu-contact">Sant Cugat del Vallès, Barcelona<br><a href="' + TEL_HREF + '">' + TEL_TEXT + '</a></div>' +
      '</div>';
    document.body.appendChild(menu);

    var linkEls = menu.querySelectorAll('.srs-links a');
    function open(){
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      linkEls.forEach(function(a, i){ a.style.transitionDelay = (0.06 + i * 0.045) + 's'; });
    }
    function close(){
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      linkEls.forEach(function(a){ a.style.transitionDelay = '0s'; });
    }
    burger.addEventListener('click', open);
    menu.querySelector('.srs-close').addEventListener('click', close);
    linkEls.forEach(function(a){
      a.addEventListener('click', function(){
        // same-page hash links: just close and let smooth-scroll happen
        close();
      });
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

    /* floating WhatsApp button */
    var wa = document.createElement('a');
    wa.className = 'srs-wa-float';
    wa.href = WA_URL;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.innerHTML = ICON_WA;
    document.body.appendChild(wa);
  }

  /* ===================================================================
     3.  COUNT-UP
     =================================================================== */
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function fmt(n, decimals, comma){
    var s = n.toFixed(decimals);
    if (comma){
      var parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = parts.join('.');
    }
    return s;
  }

  function setupCounters(){
    var targets = document.querySelectorAll('.hstat b, .rv-stat b, .gb-val, [data-count-up]');
    var items = [];
    targets.forEach(function(el){
      var html = el.innerHTML;
      var m = html.match(/^(\s*)([0-9][\d,]*(?:\.\d+)?)([\s\S]*)$/);
      if (!m) return;
      var numStr = m[2];
      var rest = m[3];
      var decimals = (numStr.split('.')[1] || '').length;
      var comma = numStr.indexOf(',') !== -1;
      var value = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(value)) return;
      items.push({ el: el, value: value, decimals: decimals, comma: comma, rest: rest, finalHTML: numStr + rest });
      if (!reduce){
        el.innerHTML = fmt(0, decimals, comma) + rest;   // start at zero
      }
    });
    if (reduce || !items.length) return;

    function animate(it){
      var dur = 1800, start = Date.now();
      function step(){
        var p = Math.min(1, (Date.now() - start) / dur);
        var e = 1 - Math.pow(1 - p, 4);             // easeOutQuart — smooth, premium
        it.el.innerHTML = fmt(it.value * e, it.decimals, it.comma) + it.rest;
        if (p >= 1){ clearInterval(it._iv); it.el.innerHTML = it.finalHTML; }
      }
      it._iv = setInterval(step, 16);               // ~60fps; immune to rAF backgrounding
      step();
    }

    /* scroll-based viewport check — robust everywhere (does not rely on
       IntersectionObserver, which can stay dormant in some embedded contexts) */
    function inView(el){
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.height === 0 && r.width === 0) return false;
      return r.top < vh * 0.88 && r.bottom > vh * 0.04;
    }
    var pending = items.length;
    function checkAll(){
      for (var i = 0; i < items.length; i++){
        var it = items[i];
        if (!it.done && inView(it.el)){ it.done = true; pending--; animate(it); }
      }
      if (pending <= 0){
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    var scheduled = false;
    function onScroll(){
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function(){ scheduled = false; checkAll(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    checkAll();                       // fire for stats already in view on load
  }

  /* ===================================================================
     4.  LANGUAGE SWITCHER (EN / ES / CA) — loaded after the nav + mobile
         menu exist so the switcher can mount into both.
     =================================================================== */
  function loadI18n(){
    if (document.getElementById('srs-i18n-script')) return;
    var s = document.createElement('script');
    s.id = 'srs-i18n-script';
    s.src = base + 'assets/serres-i18n.js';
    document.body.appendChild(s);
  }

  /* ===================================================================
     5.  ROBUST EXTERNAL-LINK OPENER
         Opens WhatsApp / Instagram / Maps and any external target="_blank"
         link reliably — even inside sandboxed/embedded iframes or in-app
         browsers where a plain <a target="_blank"> is blocked ("this site
         can't be opened"). Tries a new tab first, then falls back through
         top-level → in-place navigation so the link ALWAYS goes somewhere.
     =================================================================== */
  function externalOpener(){
    /* Only intercept when we're actually embedded in a cross-origin frame
       (e.g. the design-preview sandbox), where a plain <a target="_blank">
       can be blocked. On the real deployed site we are NOT framed, so we do
       nothing and let the browser open links natively — this is what makes
       WhatsApp (wa.me → api.whatsapp.com) and Instagram open correctly. */
    var framed = false;
    try { framed = (window.top !== window.self); } catch(_){ framed = true; }
    if (!framed) return;

    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;            // only absolute http(s)
      try { if (href.indexOf(location.origin) === 0) return; } catch(_){}  // internal → normal
      e.preventDefault();
      /* NOTE: no 'noreferrer' — WhatsApp's api.whatsapp.com rejects referrer-less
         requests (ERR_BLOCKED_BY_RESPONSE). 'noopener' alone is safe. */
      var win = null;
      try { win = window.open(href, '_blank', 'noopener'); } catch(_){}
      if (win) return;
      try { if (window.top && window.top !== window) { window.top.location.href = href; return; } } catch(_){}
      window.location.href = href;
    }, false);
  }

  /* ===================================================================
     6.  HERO VIDEO — MOBILE / DATA-SAVER GUARD
         Hero background videos are large. On phones, metered ("save data")
         or slow connections we skip the video download entirely and let the
         lightweight poster image stand in — keeping the hero instant and
         saving several MB. Desktop / good connections still get the video.
     =================================================================== */
  function optimizeHeroVideo(){
    var conn = navigator.connection || navigator.webkitConnection || null;
    var saveData = !!(conn && conn.saveData);
    var slow = !!(conn && /(^|-)2g$|^slow-2g$|^3g$/.test(conn.effectiveType || ''));
    if (!(saveData || slow)) return;             // good connection (incl. phones) → keep video
    var vids = document.querySelectorAll('.hero video');
    vids.forEach(function(v){
      v.removeAttribute('autoplay');
      v.preload = 'none';
      try { v.pause(); } catch(_){}
      while (v.firstChild) v.removeChild(v.firstChild);   // drop <source> so nothing fetches
      v.removeAttribute('src');
      try { v.load(); } catch(_){}                        // settle on the poster frame
    });
  }

  /* ---- run ---- */
  function init(){ build(); setupCounters(); loadI18n(); externalOpener(); optimizeHeroVideo(); }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
