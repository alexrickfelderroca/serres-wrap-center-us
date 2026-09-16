# GLOBAL CHROME MAP — SERRES Wrap Center V12 (Spanish source)

Root (abbreviated below as `<SRC>`):
`C:\Users\Rickfelder\Desktop\Serres web\Serres wrap center webpage\Serres wrap center V12`

---

## 0. ARCHITECTURE SUMMARY (read this first)

**There is no template engine and no build step.** Every page is a standalone `.html` with a full inline `<style>` block in `<head>`. Chrome is **partly duplicated per page** (header, breadcrumb, footer) and **partly injected at runtime by one shared JS file**.

| Chrome piece | Where it lives | Duplicated? |
|---|---|---|
| Header/nav markup | Inline in each of the 16 HTML files | **Yes — 2 distinct variants, 16 copies** |
| Desktop nav-links list (7 items) | `index.html` **only**, lines 695–703 | No — home only |
| Breadcrumb `<nav class="crumbs">` | Inline per page, **5 different markup shapes** | Yes, inconsistently |
| Footer | Inline per page — **1 fat footer (home) + 15 one-line strips** | Yes |
| Hamburger + full-screen mobile overlay menu | **Injected by JS** — `assets/serres-enhance.js:132-202` | No — single source |
| Floating WhatsApp button | **Injected by JS** — `assets/serres-enhance.js:194-201` | No — single source |
| Sticky mobile call button | Inline markup, `index.html:905-907` **only** | No — home only |
| Language switcher EN/ES/CA | **Injected by JS** — `assets/serres-i18n.js:1390-1433` | No — single source |
| Design tokens `:root` | Inline `<style>` in 11 HTML files + `assets/blog.css` | **Yes — 12 copies, 4 variants** |
| Fonts | `assets/fonts.css` (self-hosted woff2) | No — shared |
| Logo sizing | `assets/serres-logo.css` (loaded LAST in `<head>`) | No — shared |
| GA4 gtag + WA/tel click tracking | Inline in all 16 pages | Yes |

**Files that make up the shared chrome layer (only 4):**
- `<SRC>\assets\serres-enhance.js` (358 lines) — burger, overlay menu, WA float, count-up, i18n loader, external-link opener, hero-video data-saver guard
- `<SRC>\assets\serres-i18n.js` (1485 lines, 162 KB) — dictionary + translation engine + language switcher UI
- `<SRC>\assets\fonts.css` (220 lines) — `@font-face` for Barlow Condensed + DM Sans
- `<SRC>\assets\serres-logo.css` (62 lines) — logo `<img>` sizing/overrides
- (blog subtree only) `<SRC>\assets\blog.css` (201 lines) — full standalone stylesheet incl. its own `:root`, nav, footer, crumbs

**Page inventory (16 HTML files):**
```
index.html                                   1039 lines
pages/gallery.html          768   pages/prices.html            591
pages/projects.html         418   pages/why-serres.html        504
services/ppf.html           989   services/vinyl.html         1312
services/ceramic.html       668   services/paint-correction.html 753
services/detailing.html     664   services/body-kits.html      699
blog/index.html             164   blog/cuanto-cuesta-ppf-coche.html        450
blog/cuanto-cuesta-vinilar-un-coche.html 451
blog/limpieza-tapiceria-coche-precio.html 464
blog/ppf-o-ceramico-que-elegir.html      449
```
Stray/unused at root: `PPF - Phone.html`, `SERRES - Phone.html`, `image-slot.js`, `tweaks-panel.jsx`, `frames/ios-frame.jsx`, `scraps/` — not linked from any page.

---

## 1. HEADER / NAV

### 1.1 Variant A — HOME (full nav), `index.html:692-708`

```html
<header class="nav" id="nav">
  <div class="nav-inner">
    <a href="#top" class="logo"><img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55"></a>
    <nav class="nav-links">
      <a href="#services">Servicios</a>
      <a href="pages/gallery.html">Proyectos</a>
      <a href="pages/projects.html"><span class="gold-text">Exclusivo</span></a>
      <a href="pages/prices.html">Precios</a>
      <a href="blog/index.html">Blog</a>
      <a href="pages/why-serres.html">Por qué SERRES</a>
      <a href="#contact">Contacto</a>
    </nav>
    <div class="nav-right">
      <a href="#contact" class="btn">Pedir presupuesto <span class="arr">→</span></a>
    </div>
  </div>
</header>
```

Nav items, in DOM order:

| # | Label (ES) | href | Notes |
|---|---|---|---|
| 1 | Servicios | `#services` | in-page anchor |
| 2 | Proyectos | `pages/gallery.html` | |
| 3 | Exclusivo | `pages/projects.html` | wrapped in `<span class="gold-text">` — gold gradient text |
| 4 | Precios | `pages/prices.html` | |
| 5 | Blog | `blog/index.html` | |
| 6 | Por qué SERRES | `pages/why-serres.html` | |
| 7 | Contacto | `#contact` | in-page anchor |
| CTA | Pedir presupuesto → | `#contact` | `.btn` (chrome-gradient, clip-path corner) |

**No dropdowns anywhere.** Flat nav only.

### 1.2 Variant B — ALL 15 INNER PAGES (logo + back-link + CTA)

Identical 11-line block, only the back-link href/label varies:

```html
<header class="nav">
  <div class="nav-inner">
    <div class="nav-left">
      <a href="../index.html" class="logo"><img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55"></a>
      <a href="{BACK_HREF}" class="back">← <span class="lbl">{BACK_LABEL}</span></a>
    </div>
    <div class="nav-right">
      <a href="../index.html#contact" class="btn">Pedir presupuesto <span class="arr">→</span></a>
    </div>
  </div>
</header>
```

| File | Header lines | BACK_HREF | BACK_LABEL |
|---|---|---|---|
| `pages/gallery.html` | 285–295 | `../index.html` | Volver al sitio |
| `pages/prices.html` | 278–288 | `../index.html` | Volver al sitio |
| `pages/projects.html` | 240–250 | `../index.html` | Volver al sitio |
| `pages/why-serres.html` | 307–317 | `../index.html` | Volver al sitio |
| `services/ppf.html` | 451–461 | `../index.html#services` | Todos los servicios |
| `services/vinyl.html` | 482–492 | `../index.html#services` | Todos los servicios |
| `services/ceramic.html` | 369–379 | `../index.html#services` | Todos los servicios |
| `services/paint-correction.html` | 448–458 | `../index.html#services` | Todos los servicios |
| `services/detailing.html` | 305–315 | `../index.html#services` | Todos los servicios |
| `services/body-kits.html` | 421–431 | `../index.html#services` | Todos los servicios |
| `blog/index.html` | 64–74 | `../index.html` | Volver al sitio |
| `blog/cuanto-cuesta-ppf-coche.html` | 133–143 | `index.html` | Todos los artículos |
| `blog/cuanto-cuesta-vinilar-un-coche.html` | 153–163 | `index.html` | Todos los artículos |
| `blog/limpieza-tapiceria-coche-precio.html` | 153–163 | `index.html` | Todos los artículos |
| `blog/ppf-o-ceramico-que-elegir.html` | 133–143 | `index.html` | Todos los artículos |

The logo `<img src="/assets/serres-logo.png">` uses a **root-absolute path** on all 16 pages — breaks under any non-root deploy base.

### 1.3 Header CSS

- Home: `index.html:88-101` — `header.nav{position:fixed}` + `.scrolled` class toggled by inline script at `index.html:909-914` (`window.scrollY>40`).
- Inner pages: `header.nav{position:sticky;top:0;…backdrop-filter:blur(14px) saturate(120%)}` — e.g. `services/ppf.html:70-81`, `pages/gallery.html` same block, `assets/blog.css:44-56`.
- `.nav-links` styles: `index.html:110-117`.
- `.back` styles: `services/ppf.html:77-80`, `assets/blog.css:51-54`.

**Responsive breakpoints (chrome-relevant):**

| Rule | File:line |
|---|---|
| `@media(max-width:1500px)` shrink nav gaps/font | `index.html:582-586` |
| `@media(max-width:1200px){.nav-links{display:none}}` | `index.html:588-590` |
| `@media(max-width:980px){.srs-burger{display:inline-flex}}` | `assets/serres-enhance.js:57` |
| `@media(max-width:760px)` nav-inner top padding + safe-area | `index.html:592-596`; also forced by `serres-enhance.js:61-62` |
| `.nav-right .btn` hidden | `index.html:596` (`:not(.compact)`, ≤760px); `pages/gallery.html` ≤600px; all others ≤760px |
| `.back span.lbl{display:none}` ≤760px | `services/ppf.html:284`, `assets/blog.css:193` |

⚠ **Bug to carry or fix in the port:** on `index.html`, between **981px and 1200px** viewport width there is **no navigation at all** — `.nav-links` is hidden at ≤1200px but `.srs-burger` only appears at ≤980px.

---

## 2. FOOTER

### 2.1 Fat footer — `index.html:867-903` (HOME ONLY)

Blocks:

1. **Brand column** (`index.html:870-873`)
   - logo `<img src="/assets/serres-logo.png">`
   - `<p class="tagline">Protección de pintura, Car Wrap a medida y detailing de nivel concours.</p>`

2. **Column "Servicios"** (`index.html:875-883`)
   | Label | href | i18n |
   |---|---|---|
   | Paint Protection Film | `services/ppf.html` | translated |
   | Car Wrap | `services/vinyl.html` | `data-i18n-skip` (line 878) |
   | Ceramic Coating | `services/ceramic.html` | `data-i18n-skip` (line 879) |
   | Corrección de pintura | `services/paint-correction.html` | translated |
   | Detailing | `services/detailing.html` | `data-i18n-skip` (line 881) |
   | Body Kits | `services/body-kits.html` | translated |

3. **Column "Taller"** (`index.html:884-888`) — the only NAP block in a footer
   - `<p>Sant Cugat del Vallès<br>Barcelona, España</p>`
   - `<a href="tel:+34649663380">+34 649 66 33 80</a>` (line 887)

4. **Column "Síguenos"** (`index.html:889-894`)
   | Label | href |
   |---|---|
   | Instagram | `https://www.instagram.com/serres.wrap.center/` (line 891) |
   | WhatsApp | `https://wa.me/34649663380?text=Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche.` (line 892) |
   | Google Maps | `https://www.google.com/maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s` (line 893) |
   | Blog | `blog/index.html` (line 894) |
   All three externals: `target="_blank" rel="noopener"`.

5. **Bottom bar** (`index.html:897-900`)
   - `© 2026 SERRES. Todos los derechos reservados.`
   - `PPF · Car Wrap · Detailing · Corrección de pintura · Body Kits`

**Footer CSS:** `index.html:551-569`. Logo override `assets/serres-logo.css:44,52,57` (`.foot .logo img{width:190px}`).

**There are NO legal links anywhere on the site** — no Aviso legal, Privacidad, Cookies, or Términos page exists, and no cookie banner. (Relevant: the US spec will likely require Privacy Policy / Terms / ADA statement — these must be created from scratch.)

**There is NO email address anywhere on the site** — `grep -rniI "mailto|e-mail|correo electr|\bemail\b"` over all HTML/JS returns zero hits.

### 2.2 Thin footers — 15 inner pages (single `<footer>` line each)

| File:line | Content |
|---|---|
| `pages/gallery.html:660` | `© 2026 SERRES. Todos los derechos reservados. &nbsp;·&nbsp; Sobre coches reales de clientes` |
| `pages/prices.html:349` | `… &nbsp;·&nbsp; Precios orientativos en EUR, IVA incluido` |
| `pages/projects.html:384` | `… &nbsp;·&nbsp; Exclusivo — proyectos completos limitados` |
| `pages/why-serres.html:426` | `… &nbsp;·&nbsp; Detailing y personalización premium` |
| `services/ppf.html:708` | `… &nbsp;·&nbsp; Paint Protection Film · Inozetek · 3M` |
| `services/vinyl.html:674` | `… &nbsp;·&nbsp; Car Wrap · 3M · Avery Dennison · Inozetek` |
| `services/ceramic.html:572` | `… &nbsp;·&nbsp; Ceramic Coating SiO₂` |
| `services/paint-correction.html:641` | `… &nbsp;·&nbsp; Pulido por etapas a máquina` |
| `services/detailing.html:498` | `… &nbsp;·&nbsp; Detailing de interior y exterior` |
| `services/body-kits.html:603` | `… &nbsp;·&nbsp; Body Kits · Llantas a medida · Colas de escape` |
| `blog/index.html:144` | `© 2026 SERRES. Todos los derechos reservados.` |
| `blog/cuanto-cuesta-ppf-coche.html:430` | `…&nbsp;&nbsp;<a href="index.html">· Blog</a>` |
| `blog/cuanto-cuesta-vinilar-un-coche.html:431` | `…<span> &nbsp;·&nbsp; </span><a href="index.html">Blog</a>` |
| `blog/limpieza-tapiceria-coche-precio.html:444` | same shape as above |
| `blog/ppf-o-ceramico-que-elegir.html:429` | `<span>© …</span> &nbsp;·&nbsp; <a href="index.html">Blog</a>` |

Note the 3 different markup shapes for the same blog footer string — deliberate, so the i18n text-node binder can match the copyright core (see §4.4).

Footer CSS: `pages/gallery.html:235-236`, `services/ppf.html:267-268`, `assets/blog.css:180-182`.

### 2.3 Repeated pre-footer CTA strip (chrome-like, on 8 inner pages)

`<p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 649 66 33 80</strong></p>`

At: `pages/projects.html:380`, `pages/why-serres.html:422`, `services/ppf.html:704`, `services/vinyl.html:670`, `services/ceramic.html:568`, `services/paint-correction.html:637`, `services/detailing.html:494`, `services/body-kits.html:599`.

Blog articles use a different CTA block with two buttons — `blog/*.html` ~lines 386-390 (WA link with an article-specific prefilled `?text=`, plus `<a class="btn ghost" href="tel:+34649663380">+34 649 66 33 80</a>`).

---

## 3. FLOATING / STICKY CONTACT BUTTONS

### 3.1 Floating WhatsApp bubble — JS-injected, ALL pages
`assets/serres-enhance.js:194-201`
```js
var wa = document.createElement('a');
wa.className = 'srs-wa-float';
wa.href = WA_URL;                    // https://wa.me/34649663380?text=<urlencoded>
wa.target = '_blank'; wa.rel = 'noopener';
wa.setAttribute('aria-label', 'Chat on WhatsApp');
wa.innerHTML = ICON_WA;              // inline SVG, line 40
document.body.appendChild(wa);
```
CSS `serres-enhance.js:111-120`: `position:fixed;right:18px;bottom:18px;z-index:120;58×58;border-radius:50%;background:#25d366`, pulse keyframes `srsPulse` 2.6s gated behind `@media(prefers-reduced-motion:no-preference)`.

### 3.2 Sticky mobile call button — HOME ONLY, inline markup
`index.html:905-907`
```html
<a href="tel:+34649663380" class="mobile-call" aria-label="Llamar a SERRES">
  <svg viewBox="0 0 24 24" …phone path… ></svg>
</a>
```
CSS `index.html:571-577` (`display:none;position:fixed;right:18px;bottom:18px;z-index:60;58×58;border-radius:50%;background:var(--chrome)`), shown by `index.html:600` `@media(max-width:760px){.mobile-call{display:grid}}`.
Collision fix: `serres-enhance.js:122` forces `.mobile-call{bottom:86px!important}` so it stacks above the WA float.

### 3.3 Hamburger + full-screen overlay menu — JS-injected, ALL pages
`assets/serres-enhance.js:136-191`. Appended into `header .nav-right` (fallback `.nav-inner`) — line 134.

Overlay `MENU` array — `serres-enhance.js:29-37`. **Labels here are ENGLISH source keys**, translated at runtime by the i18n text-node walker:

| # | `label` | `href` (root page) | `href` (nested) |
|---|---|---|---|
| 01 | `Services` | `#services` | `../index.html#services` |
| 02 | `Projects` | `pages/gallery.html` | `../pages/gallery.html` |
| 03 | `Exclusive` (`gold:true`) | `pages/projects.html` | `../pages/projects.html` |
| 04 | `Prices` | `pages/prices.html` | `../pages/prices.html` |
| 05 | `Why SERRES` | `pages/why-serres.html` | `../pages/why-serres.html` |
| 06 | `Blog` | `blog/index.html` | `../blog/index.html` |
| 07 | `Contact` | `#contact` | `../index.html#contact` |

Note: overlay order ≠ desktop nav order (Blog is 5th on desktop, 6th in overlay).

Overlay foot — `serres-enhance.js:159-165`:
- `.srs-social` → WhatsApp `WA_URL`, Instagram `IG_URL`
- `.srs-menu-contact` → `Sant Cugat del Vallès, Barcelona<br><a href="tel:+34649663380">+34 649 66 33 80</a>`
- Language switcher is inserted as `foot.firstChild` by i18n (`serres-i18n.js:1428-1431`)

Interactions: open/close at `serres-enhance.js:169-191`; `Escape` closes; `document.documentElement.style.overflow='hidden'` while open; staggered link reveal via `transitionDelay` (0.06 + i*0.045 s).

### 3.4 Path/base resolution (`serres-enhance.js:21-27`)
```js
var path   = location.pathname;
var nested = /\/(services|pages|blog)\//.test(path);
var base   = nested ? "../" : "";
var onHome = !nested;
function homeLink(hash){ return onHome ? hash : base + "index.html" + hash; }
```
⚠ Hard-coded directory names. Any renamed/new top-level folder in the US port (e.g. `/locations/`, `/service-areas/`) **must be added to this regex** or the overlay menu links, the WhatsApp button and the i18n script `src` all break on those pages.

---

## 4. LANGUAGE SWITCHER + i18n RUNTIME — EXACT MECHANICS

### 4.1 Loading chain
1. Every page ships `<script src="…/assets/serres-enhance.js" defer></script>` as the last-but-one script — `index.html:1019`, `pages/*.html:748/571/398/486`, `services/*.html:681/650/514/735/971/1294`, `blog/*.html:448/433/146/446/447`.
2. `serres-enhance.js` `init()` (line 352) runs `build(); setupCounters(); loadI18n(); externalOpener(); optimizeHeroVideo();`
3. `loadI18n()` (lines 285-291) injects `<script id="srs-i18n-script" src="{base}assets/serres-i18n.js">` into `<body>`.

**No HTML file references `serres-i18n.js` directly** (verified by grep). It is only ever loaded through `serres-enhance.js:289`.

### 4.2 DOM default language
- `<html lang="es">` hard-coded in **all 16** HTML files (line 2 of each).
- All static text, `<title>`, `meta[name=description]`, `aria-label`/`title` attributes are authored **in Spanish**.
- Spanish is the SEO base language; EN and CA exist **only as client-side runtime overrides** — they are not crawlable, have no separate URLs, and no `hreflang` tags exist anywhere.

### 4.3 Dictionary shape
`assets/serres-i18n.js:31-1166` — `var DICT = { … };`
- **790 top-level entries**, ~148 KB.
- Shape: **English source string → `[español, català]`**
  ```js
  "Services": ["Servicios", "Serveis"],
  "Get a Quote": ["Pedir presupuesto", "Demana pressupost"],
  "a reality": ["", ""],          // "" = render nothing in that language
  ```
- Sections (comment-delimited): NAV/shared actions (31-…), HOME, GALLERY, gallery lightbox `data-note` strings (169-…), PRICES, WHY SERRES, service pages, blog, FAQ blocks, and from line 729: **DATA-DRIVEN SECTIONS** (strings consumed by in-page JS via `SERRES_I18N.t()`).

Constants: `STORE="serres-lang"` (line 22), `LANGS=["en","es","ca"]` (23), `LABELS={en:"EN",es:"ES",ca:"CA"}` (24).

### 4.4 The inverted index — this is the key mechanism
`serres-i18n.js:1174-1188`
```js
var INV = {};
for (var k in DICT) { var v = DICT[k][0].trim(); if (v && !INV[v]) INV[v] = k; }  // Spanish → English key
function enKeyOf(core){
  if (DICT.hasOwnProperty(core)) return core;   // text already English
  if (INV.hasOwnProperty(core)) return INV[core]; // text is Spanish → map back to EN key
  return null;                                   // not translatable → left untouched
}
```
Because the HTML is authored in Spanish, bindings are discovered by looking up the **Spanish** rendition in `INV`; the stored binding key is always the **English** key so `tr()`/`t()` work uniformly. **First-wins collision policy** (`!INV.hasOwnProperty(v)`) — two English keys sharing a Spanish rendition silently drop the second.

### 4.5 Language selection & persistence
`serres-i18n.js:1193-1198`
```js
function getLang(){
  var l; try { l = localStorage.getItem("serres-lang"); } catch(e){}
  return LANGS.indexOf(l) >= 0 ? l : "es";     // DEFAULT = "es"
}
var current = getLang();
```
- **Persistence:** `localStorage["serres-lang"]`, written in `setLang()` at line 1351.
- **No** URL param, cookie, `navigator.language` sniff, or server negotiation.
- `setLang()` (1345-1361): guards invalid/no-op, sets `current`, persists, `applyAll()`, `syncSwitchers()`, dispatches `CustomEvent("serres:langchange", {detail:l})` on `window` (with a `document.createEvent` fallback).
- `applyAll()` (1337-1343) sets `document.documentElement.setAttribute("lang", current)` then reapplies all bindings + meta.

### 4.6 Binding types (4 kinds)

| Kind | Bound by | Array | Notes |
|---|---|---|---|
| **Text nodes** | `bindText()` 1234-1251 | `textBindings` | `TreeWalker(SHOW_TEXT)`; skips `SCRIPT/STYLE/TEXTAREA`, `[data-i18n-skip]` subtrees, and parents carrying `data-en`. Dedup via `WeakSet`. |
| **Attributes** | `bindAttrs()` 1258-1275 | `attrBindings` | Only `ATTRS = ["aria-label","title"]` (line 1227). Marks `el["__i18n_aria-label"]=true` to avoid rebinding. |
| **Keyed elements** | `bindKeyed()` 1282-1293 | `keyBindings` | `<span data-en="English key">` — sets `textContent = tr(key)`; empty translation → `""`. |
| **Meta** | `bindMeta()` 1323-1331 / `applyMeta()` 1332-1336 | `titleBind`, `descBind` | Translates `document.title` and `meta[name="description"]` content. |

`affix()` (1210-1221) strips leading/trailing whitespace **and wrapping straight/curly quotes** before lookup, then restores them verbatim on apply — so `"Frase"` and `Frase` both match the same key.

`data-en` usages site-wide (only 2):
- `index.html:799` — `<span data-en=" a reality"></span>` (empty in ES/CA)
- `pages/why-serres.html:339` — `<span data-en="Workshop">Taller</span>`

`data-i18n-skip` usages: 42 total. Breakdown by file: `index.html` 9 (lines 756, 763, 777, 784, 800, 878, 879, 881 + 1), `pages/prices.html` 5 (315, 322, 323, 331, 332), `pages/projects.html` 3 (308, 314, 320), `pages/why-serres.html` 1 (408), `services/ppf.html` 5 (471, 477, 595, 596, 600), `services/vinyl.html` 4 (506, 532, 535, 550), `services/ceramic.html` 3 (390, 398, 399), each blog file 3. Used for (a) brand/product names identical across languages, (b) JS-rendered containers that manage their own copy, (c) the blog `<article class="prose">` bodies which are intentionally Spanish-only.

### 4.7 Switcher UI
- Styles injected by `injectStyle()` 1368-1388 (`#srs-i18n-style`), class `.srs-lang` + variant.
- `makeSwitcher(variant)` 1390-1408 builds `<div class="srs-lang {variant}" data-i18n-skip role="group" aria-label="Language / Idioma">` with three `<button type="button" data-lang="en|es|ca" aria-label="EN|ES|CA">`.
- `syncSwitchers()` 1410-1419 toggles `.on` class + `aria-pressed`.
- `mountSwitchers()` 1421-1433 — **two mount points**:
  - desktop: `header .nav-right` → `insertBefore(makeSwitcher("srs-lang-nav"), navRight.firstChild)` (i.e. **before** the "Pedir presupuesto" button)
  - mobile: `.srs-menu-foot` (built by `serres-enhance.js`) → `insertBefore(makeSwitcher("srs-lang-menu"), foot.firstChild)`

### 4.8 MutationObserver
`observe()` 1437-1452 — watches `document.body` `{childList:true, subtree:true}`; `walk()`s every added element/text node and re-runs `mountSwitchers()`. This is how JS-rendered content (price tiers, color carousels, testimonials, lightbox) and the late-appended mobile menu get translated.

### 4.9 Public API + data-driven consumers
`window.SERRES_I18N = { get(), set(lang), t(key) }` — `serres-i18n.js:1464-1468`.

Consumers (all use the same `T()` shim + `serres:langchange` listener):
| File:line | What |
|---|---|
| `pages/gallery.html:699` | `T()` for lightbox `data-note` captions (31 `data-note` attrs, **authored in English**, e.g. line 344 `data-note="Front three-quarter · In the studio"`) |
| `pages/prices.html:467`, `:563` | price tiers, tabs, comparison table re-render |
| `pages/why-serres.html:466`, `:481` | testimonial stack `paint()` |
| `services/ppf.html:874`, `:966` | `buildBrands(); buildFilters(); render();` color carousel |
| `services/vinyl.html:915`, `:958` | same |

`pages/prices.html:464` holds its own WhatsApp base: `var WA='https://wa.me/34649663380?text=';`

### 4.10 i18n gaps relevant to the US port
- Translating `<title>`/`description` client-side does **nothing** for SEO — Google indexes the Spanish HTML.
- No `hreflang`, no per-language URLs, no `lang` attribute in the served HTML (only patched at runtime).
- **Since the port is English-only at launch, the entire `serres-i18n.js` (162 KB) can be deleted** and `loadI18n()` removed from `serres-enhance.js:285-291, 352`. If it is kept, the DICT direction must be inverted (English becomes the authored DOM language, so `INV` and `enKeyOf()` become no-ops and `tr()` must return `DICT[core][n]` for the *non*-English target).

---

## 5. CONTACT DATA — EVERY OCCURRENCE

### 5.1 Canonical values (Spanish original)
| Field | Value |
|---|---|
| Phone | `+34 649 66 33 80` / digits `34649663380` / `tel:+34649663380` |
| WhatsApp | `https://wa.me/34649663380?text=…` |
| Instagram | `https://www.instagram.com/serres.wrap.center/` |
| Street | `Av. Can Fatjó dels Aurons, 15` (also written without comma: `Av. Can Fatjó dels Aurons 15`) |
| Postal | `08174` |
| Locality | `Sant Cugat del Vallès` |
| Region | `Barcelona` |
| Country | `ES` |
| Hours | Mon–Fri 09:00–19:00, Sat 10:00–14:00 (display string: `Lun–Sáb · Con cita previa`) |
| Domain | `https://serreswrapcenter.es` |
| Maps CID | `https://maps.google.com/?cid=14481261717501919901` |
| GA4 | `G-1K6FYZ99GN` |
| Email | **NONE — does not exist anywhere** |

### 5.2 `tel:` — every occurrence
```
assets/serres-enhance.js:18                    TEL_HREF = "tel:+" + WA_DIGITS   (JS constant)
index.html:844                                 <a href="tel:+34649663380" class="btn ghost">Llamar al taller</a>
index.html:849                                 contact-meta row "Teléfono"
index.html:887                                 footer col "Taller"
index.html:905                                 .mobile-call sticky button
blog/cuanto-cuesta-ppf-coche.html:389          <a class="btn ghost" href="tel:+34649663380">+34 649 66 33 80</a>
blog/cuanto-cuesta-vinilar-un-coche.html:390   same
blog/limpieza-tapiceria-coche-precio.html:403  same
blog/ppf-o-ceramico-que-elegir.html:388        same
```
Plus one `a.href.indexOf('tel:')` GA tracking line in each of the 16 pages (`index.html:1031`, `pages/gallery.html:760`, `pages/prices.html:583`, `pages/projects.html:410`, `pages/why-serres.html:497`, `services/body-kits.html:692`, `services/ceramic.html:661`, `services/detailing.html:657`, `services/paint-correction.html:746`, `services/ppf.html:982`, `services/vinyl.html:1305`, `blog/index.html:157`, `blog/cuanto-cuesta-ppf-coche.html:442`, `blog/cuanto-cuesta-vinilar-un-coche.html:444`, `blog/limpieza-tapiceria-coche-precio.html:457`, `blog/ppf-o-ceramico-que-elegir.html:441`).

### 5.3 Phone literal `+34 649 66 33 80` / `+34649663380` — display & schema
```
assets/serres-enhance.js:14,19                 WA_DIGITS, TEL_TEXT constants
assets/serres-i18n.js:1064,1084,1100,1124,1146,1164   inside 6 FAQ answer DICT entries (EN source strings)
index.html:618                                 JSON-LD AutoBodyShop "telephone"
index.html:849,887                             visible
pages/prices.html:247                          JSON-LD "telephone":"+34 649 66 33 80"
pages/projects.html:218                        JSON-LD
pages/projects.html:380                        <p class="phone">
pages/why-serres.html:240                      JSON-LD
pages/why-serres.html:422                      <p class="phone">
services/ppf.html:312 (LD), :414 (FAQ LD), :678 (FAQ visible), :704 (<p class="phone">)
services/vinyl.html:357, :464, :655, :670
services/ceramic.html:251, :340, :547, :568
services/paint-correction.html:316, :430, :618, :637
services/detailing.html:584, :565, :478, :494
services/body-kits.html:277, :392, :583, :599
blog/cuanto-cuesta-ppf-coche.html:68 (LD), :389
blog/cuanto-cuesta-vinilar-un-coche.html:73, :390
blog/limpieza-tapiceria-coche-precio.html:73, :403
blog/ppf-o-ceramico-que-elegir.html:76, :372 (prose), :388
```

### 5.4 `wa.me` links (real links, excluding the 16 GA `indexOf` lines)
```
assets/serres-enhance.js:16     WA_URL = "https://wa.me/34649663380?text=" + encodeURIComponent("Hola SERRES, quería pedir presupuesto para mi coche.")   (line 15)
index.html:854                  .contact-social a.wa
index.html:892                  footer "Síguenos" column
pages/prices.html:253           JSON-LD sameAs
pages/prices.html:464           var WA='https://wa.me/34649663380?text=';
pages/projects.html:221         JSON-LD sameAs
pages/projects.html:282, :377   two CTA links, prefilled "…un Exclusivo completo y pedir una estimación de precio…"
pages/why-serres.html:266       JSON-LD sameAs
blog/cuanto-cuesta-ppf-coche.html:387           prefilled "he leído la guía de precios de PPF…"
blog/cuanto-cuesta-vinilar-un-coche.html:388    prefilled "he leído el artículo sobre cuánto cuesta vinilar un coche…"
blog/limpieza-tapiceria-coche-precio.html:401   prefilled "he leído el artículo sobre limpieza de tapicería…"
blog/ppf-o-ceramico-que-elegir.html:386         prefilled "he leído el artículo sobre PPF o cerámico…"
```

### 5.5 Instagram — every occurrence (7)
```
assets/serres-enhance.js:17     IG_URL constant (overlay menu social)
index.html:645                  JSON-LD sameAs
index.html:853                  .contact-social a.ig (inline SVG)
index.html:891                  footer "Síguenos"
pages/prices.html:253           JSON-LD sameAs
pages/projects.html:221         JSON-LD sameAs
pages/why-serres.html:265       JSON-LD sameAs
```
No Facebook, TikTok, YouTube, X, or Google review link anywhere except the single Maps link at `index.html:893`.

### 5.6 Address — every occurrence
JSON-LD `PostalAddress` blocks:
```
index.html:625-629                           pages/why-serres.html:244-248
pages/prices.html:249 (one-line)             pages/projects.html:220 (one-line)
services/ppf.html:315-319                    services/vinyl.html:360-364
services/ceramic.html:254-258                services/paint-correction.html:320-324
services/detailing.html:587-591              services/body-kits.html:281-285
blog/cuanto-cuesta-ppf-coche.html:62-66      blog/cuanto-cuesta-vinilar-un-coche.html:67-71
blog/limpieza-tapiceria-coche-precio.html:67-71   blog/ppf-o-ceramico-que-elegir.html:70-74
```
Visible prose containing the street address:
```
index.html:674 (FAQ LD), index.html:829 (FAQ visible)
services/body-kits.html:392 / :583      services/ceramic.html:340 / :547
services/detailing.html:565 / :478      services/paint-correction.html:430 / :618
services/ppf.html:414 / :678            services/vinyl.html:464 / :655
blog/cuanto-cuesta-ppf-coche.html:382-383
blog/cuanto-cuesta-vinilar-un-coche.html:383
blog/limpieza-tapiceria-coche-precio.html:395-396
assets/serres-i18n.js:1049, 1084, 1100, 1124, 1146, 1164  (EN source of those FAQ answers)
```
Short form `Sant Cugat del Vallès, Barcelona`:
`serres-enhance.js:164` (overlay menu foot), `index.html:848` (contact-meta "Taller"), `index.html:885` (footer), and the 8 `<p class="phone">` lines listed in §2.3.

### 5.7 Hours
- `openingHoursSpecification` JSON-LD: `index.html:631-644`, `pages/prices.html:250`, `pages/why-serres.html:250`. (Service pages carry `telephone`/`address` but **not** hours.)
- Visible: `index.html:848` contact-meta row `Horario` → `Lun–Sáb · Con cita previa`; `index.html:829` FAQ prose has the exact hours.

### 5.8 Map embed
`index.html:859` — Google Maps iframe, `title="SERRES Wrap Center en Google Maps"`, long `!1m18!…` pb= parameter, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`. CSS `.map-frame` `index.html:532-534` (470px tall, `filter:saturate(.9) brightness(.95) contrast(.96)`, clip-path corner). There is also an unused `.map-card` style block (`index.html:535-544`) with no matching markup.

---

## 6. DESIGN TOKEN SYSTEM

### 6.1 Where CSS lives
- **No shared site stylesheet.** Each of the 11 non-blog HTML files carries a full inline `<style>` in `<head>` (`index.html:30-611` = 582 lines; `services/vinyl.html` and `services/ppf.html` are the largest).
- Shared CSS files: `assets/fonts.css` (all pages), `assets/serres-logo.css` (all pages, loaded LAST), `assets/blog.css` (blog subtree only — replaces the inline block).
- Runtime-injected CSS: `#srs-enhance-style` (`serres-enhance.js:46-127`) and `#srs-i18n-style` (`serres-i18n.js:1368-1388`).

### 6.2 `:root` blocks — 12 copies, 4 variants

| File:line | Variant |
|---|---|
| `index.html:31` | A (full, incl. `--chrome-line`) |
| `pages/gallery.html:31`, `pages/why-serres.html:31` | B (adds `--navh:62px`) |
| `pages/projects.html:31` | C (drops `--panel-2`) |
| `services/*.html:31` (all 6), `pages/prices.html:31` | D (standard) |
| `assets/blog.css:5` | E (adds `--prose-text`, `--prose:760px`) |

**Variant A — `index.html:31-45` (the canonical set):**
```css
:root{
  --bg:#0a0a0b;
  --bg-2:#0e0e10;
  --panel:#141417;
  --panel-2:#191920;
  --line:rgba(255,255,255,0.09);
  --line-strong:rgba(255,255,255,0.16);
  --text:#f3f3f5;
  --muted:#9a9aa3;
  --muted-2:#6e6e77;
  --chrome:linear-gradient(176deg,#fdfdfe 0%,#cfcfd6 32%,#8d8d97 52%,#f0f0f4 72%,#a6a6b0 100%);
  --chrome-line:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 100%);
  --maxw:1280px;
  --ease:cubic-bezier(.22,.61,.36,1);
}
```
Variant D (`services/ppf.html:31-37`) is the same minus `--chrome-line`, written on 6 compressed lines.
Variant E (`assets/blog.css:5-11`) adds `--prose-text:#cdcdd4;` and `--prose:760px;`.

Additional non-`:root` palette values used as literals: `#25d366` (WhatsApp green, `serres-enhance.js:96,112,118-120`; `index.html:529`), `#e7e7ec` (`::selection`), and the gold gradient stack `#8a6d2f → #c9a44f → #f3e0ac → #d4af5f → #e9d194 → #b28f41` (`index.html:311`, duplicated verbatim at `serres-enhance.js:103`).

### 6.3 Fonts — 2 families (compliant with the 2-typeface rule)

| Role | Stack | Where declared |
|---|---|---|
| Body | `"DM Sans", system-ui, sans-serif` at `17px / 1.6` | `body{}` in every inline block, e.g. `index.html:48-56`; `assets/blog.css:14-17` uses `1.7` |
| Display / UI | `"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif` | `.display`, `.eyebrow`, `.logo`, `.nav-links a`, `.btn`, `.back`, `.foot-col h3`, `.srs-links a`, `.srs-lang button` |

Self-hosted, `assets/fonts.css` (220 lines, generated by `_build/fetch-fonts.mjs`):
- Barlow Condensed — weights 400, 500, 600, 700 normal + 600, 700 italic; 3 unicode subsets each (latin, latin-ext, vietnamese) → 18 woff2 files
- DM Sans — weight 400 normal only; latin + latin-ext → 2 woff2 files
- All `font-display: swap`
- Preloaded in every `<head>`: `index.html:27-28` → `barlow-condensed-700-normal-latin.woff2` + `dm-sans-400-normal-latin.woff2` (root-absolute `/assets/fonts/…`)

⚠ Only **DM Sans 400** is loaded, but CSS elsewhere sets `font-weight:600/700` on body-font elements → synthetic bolding. Worth noting for the port.

### 6.4 Head boilerplate repeated on all 16 pages
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0a0a0b">
<link rel="preload" as="font" … crossorigin>  ×2
<link rel="stylesheet" href="/assets/fonts.css">
…inline <style> or blog.css…
…JSON-LD blocks…
…GA4 gtag…
<link rel="stylesheet" href="/assets/serres-logo.css">   ← always last
```
All these are **root-absolute (`/…`)** paths.

### 6.5 Button system (3 variants — compliant)
`.btn` (chrome-gradient, `clip-path:polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))`), `.btn.ghost` (transparent + `1px solid var(--line-strong)`, `clip-path:none`), and the JS-injected icon buttons (`.srs-burger`, `.srs-close`, `.srs-social a`). Defined at `index.html:119-138`, `assets/blog.css:30-40`, and repeated in every inline block.

### 6.6 Motion / a11y
- `--ease:cubic-bezier(.22,.61,.36,1)` used everywhere; micro-interactions `.25s–.3s`, section transitions `.4s–.5s`.
- `@media(prefers-reduced-motion:reduce)` present in: `index.html:605-609`, `services/ppf.html:291+`, `assets/blog.css:198+`, `assets/serres-logo.css:60-62`. The WA float pulse is gated the other way round at `serres-enhance.js:117` (`no-preference`). The count-up respects it at `serres-enhance.js:207,233,237`.
- `body{min-height:100vh}` on inner pages (`services/ppf.html:41`) — **violates the `100dvh` rule**; `assets/blog.css:15` correctly uses `100dvh`; `index.html` sets neither.

---

## 7. SITE-WIDE CONFIG FILES

| File | Content |
|---|---|
| `<SRC>\robots.txt` | `User-agent: * / Allow: / / Sitemap: https://serreswrapcenter.es/sitemap.xml` |
| `<SRC>\sitemap.xml` | 16 `<url>` entries, all `lastmod 2026-07-09`, priorities 1.0 → 0.6 |
| `<SRC>\.htaccess` | Apache/Hostinger cache policy: `ExpiresActive Off`, `Cache-Control "no-cache, must-revalidate"`, HTML/JSON `no-store`, `FileETag MTime Size`, `AddType font/woff2 .woff2`. **Apache-only — will not work on GitHub Pages / Netlify / Vercel.** |
| `<SRC>\.gitignore` | ignores `.screenshots/`, `.bak-2026-07-09/`, `_build/node_modules/`, plus client working folders |
| `<SRC>\_build\` | source-site tooling: `dict-tools.js` (extracts DICT from `serres-i18n.js`, collision checks — points at `../assets/serres-i18n.js:10`), `fetch-fonts.mjs`, `optimize-images.js`, `optimize-porsche-gallery.js`, `make-logo.js`, `swap-logo.js` (patches nav, footer **and the overlay-menu logo inside `serres-enhance.js:66-67`**), `verify-seo.js`, `agg-report.json`, `webp-manifest.json` |

---

## 8. PORT-CRITICAL FINDINGS (actionable)

1. **Header must be built twice.** The home "full nav" (7 links) and the inner-page "back-link" header are different components. The US spec's new pages (locations, service areas, about, contact, legal) need a decision: extend the back-link pattern, or promote the full nav site-wide. Promoting it fixes item 3 below.
2. **All chrome asset paths are root-absolute** (`/assets/serres-logo.png`, `/assets/fonts.css`, `/favicon*`, `/assets/serres-logo.css`). Any deploy under a sub-path breaks them. 16 files × ~7 refs.
3. **981–1200px dead zone on the home page** — no nav links (`index.html:589`), no burger (`serres-enhance.js:57`). Fix by aligning both to one breakpoint.
4. **`serres-enhance.js:23` regex `/\/(services|pages|blog)\//`** is the single point of failure for every new top-level directory. Must be updated for any new US folder.
5. **`serres-i18n.js` (162 KB, 790 entries) is dead weight for an English-only launch.** Delete it + `loadI18n()` (`serres-enhance.js:285-291` and its call at `:352`). But first extract: the overlay `MENU` labels (`serres-enhance.js:29-37`) are already English and need **no** translation layer, while `pages/gallery.html`'s 31 `data-note` attributes are English strings that currently pass through `T()` — once i18n is removed, `T()` falls back to identity (`pages/gallery.html:699`) and they render correctly as-is. Same for the `T()` shims in `prices.html:467`, `why-serres.html:466`, `ppf.html:874`, `vinyl.html:915`.
6. **No email, no legal pages, no cookie banner** exist. The US site needs these created from zero; the footer has no slot for them (add a 4th column or a legal row in `.foot-bottom`).
7. **12 duplicated `:root` blocks in 4 drifting variants.** Recommend consolidating into a single `assets/serres-base.css` during the port — this is the cheapest structural win and keeps the vanilla no-build stack intact.
8. **Contact data lives in ~90 places** across markup, JSON-LD and JS constants. Only 5 are centralized (`serres-enhance.js:14-19`). A US retarget touches every file listed in §5.
9. **`.htaccess` cache policy is Apache-specific** — needs a host-appropriate equivalent (`_headers` for Netlify, `vercel.json`, or nothing for GitHub Pages).
10. **GA4 property `G-1K6FYZ99GN`** is hard-coded in all 16 pages (2 lines each) and must be swapped for a US property.