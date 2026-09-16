# Recon — nap-schema-analytics (SERRES Barcelona → Miami port)

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12`
Date: 2026-09-02. All paths below are relative to that root. Line numbers are 1-based and were taken from the files as they are today (Aug 12 2026 mtime; `serres-i18n.js` Aug 12 19:52).

Excluded per brief and NOT scanned: `.git/`, `uploads/`, `scraps/`, `screenshots/`, `.screenshots/`, `frames/`, `PPF - Phone.html`, `SERRES - Phone.html`, `tweaks-panel.jsx`, `image-slot.js`, `_build/node_modules/`. Also skipped binaries (png/jpg/webp/mp4/ico/woff). `_build/agg-report.json` and `_build/webp-manifest.json` were excluded from the main counts but checked separately (see §10, risk 1).

Method: `grep -rn` / `grep -F` over the tree, `sed -n` dumps of every JSON-LD block, and a Node classifier (`scratchpad/recon/classify.js` → `lines.md`, appended as Appendix B) that walks every in-scope text file line by line, tracks whether the line sits inside a `<script type="application/ld+json">` block, and tags each hit as (a) NAP, (b) SEO copy, (c) i18n dictionary, (d) meta/title/OG, (e) JSON-LD, (f) alt/title attribute, (g) other.

---

## 0. Baseline counts vs. the brief (PASO 0 expectations)

| Datum | Brief expects | Measured | Notes |
|---|---|---|---|
| `serreswrapcenter.es` | 190 | **190** | 18 files; all `https://serreswrapcenter.es` (no `www`, no `http:`). Per file: sitemap 16, prices 14, ppf 13, detailing 13, each blog article 12, vinyl 11, paint-correction 10, projects 9, body-kits 9, ceramic 9, why-serres 8, blog/index 7, index 6, gallery 6, robots 1 |
| `Barcelona` | ~130 in 18 files | **278 occurrences / 210 lines in 18 files**; **134 occurrences outside `serres-i18n.js`** (144 inside it) | The "~130" in the brief is the non-dictionary count. Per file (occurrences): index 19, ppf 17, paint-correction 16, ceramic 12, vinyl 12, projects 11, body-kits 11, detailing 10, gallery 8, prices 4, ppf-coche 3, ppf-o-ceramico 3, why-serres 2, vinilar 2, tapiceria 2, blog/index 1, enhance.js 1, i18n.js 144 |
| `tel:+34621244469` | 8 | **8** | index.html 843, 848, 886, 904; blog ×4 (388, 389, 402, 387). NB `assets/serres-enhance.js:18` builds a 9th one at runtime: `"tel:+" + WA_DIGITS` |
| `wa.me/34621244469` | 15 | **15** | 11 static `href`s (index 853, 891; prices 322 ×3; projects 281, 376; blog 386, 387, 400, 385) + prices.html:463 JS prefix + 3 `sameAs` (prices 253, projects 221, why-serres 266). enhance.js builds another at runtime from `WA_DIGITS` (line 16) |
| `G-1K6FYZ99GN` | 34 | **34** | 33 in HTML (16 pages × 2: loader `src` + `gtag('config')`) + `_build/verify-seo.js:45` |
| `reviewCount` 50 | 3 | **3** | why-serres 271, body-kits 290, paint-correction 329 |
| `Sant Cugat` | — | 206 occ. (116 outside i18n) | |
| `Vallès` | — | 163 occ. (93 outside i18n); `Valles` unaccented: 0 | |
| `08174` | — | 22 occ. (19 outside i18n) | |
| `Can Fatjó` | — | 47 occ. (29 outside i18n) | |
| `+34` | — | 69 occ. (51 outside i18n) | |
| `621 24 44 69` (spaced display) | — | 50 occ. (32 outside i18n) | |
| `IVA` | — | 73 occ. (51 outside i18n) + 11 `VAT` (EN keys, i18n only) | |
| `EUR` | — | 42 (38 `priceCurrency` + prices.html:348 footer + i18n 243–245) | |
| `€` | — | 415 (38 lines in i18n) | Detail belongs to the prices key, listed here only as a count |
| `<html lang="es">` | — | 16 (all pages, line 2) | |
| `og:locale` `es_ES` | — | 16 (all pages, line 11 / blog 16–20) | |
| JSON-LD blocks | — | **42** | 12 non-service (2 each on index, prices, projects, why-serres, gallery, blog/index) + 12 in the 4 articles (3 each) + 18 in services (3 each) |
| Google Maps embeds / links | — | 1 iframe, 1 `?cid=`, 1 `maps/search` — all in index.html | |
| `mailto:` / email addresses | — | **0 / 0** | The site has no email anywhere (only the URL regex in `_build/verify-seo.js:61`) |
| Legal pages (privacy/terms/cookies) | — | **none exist**; no consent banner; no RGPD/GDPR text | |

---

## 1. Phone, WhatsApp, mailto

### 1.1 Constants that generate NAP at runtime (change these first)

| File:line | Snippet | Notes |
|---|---|---|
| `assets/serres-enhance.js:14` | `var WA_DIGITS = "34621244469";                 // +34 621 24 44 69` | Single constant feeds BOTH `wa.me` (line 16) and `tel:` (line 18). If Miami phone ≠ Miami WhatsApp, split into two constants. |
| `assets/serres-enhance.js:15` | `var WA_TEXT   = encodeURIComponent("Hola SERRES, quería pedir presupuesto para mi coche.");` | Spanish prefilled message, used by the floating WA button (line 196) and the mobile overlay menu (line 161). Needs EN (base) + ES; today it is not language-aware. |
| `assets/serres-enhance.js:16` | `var WA_URL    = "https://wa.me/" + WA_DIGITS + "?text=" + WA_TEXT;` | |
| `assets/serres-enhance.js:17` | `var IG_URL    = "https://www.instagram.com/serres.wrap.center/";` | Confirm whether Miami uses the same Instagram (7 hard-coded occurrences site-wide incl. index.html:850, 889 and 3 `sameAs`). |
| `assets/serres-enhance.js:18` | `var TEL_HREF  = "tel:+" + WA_DIGITS;` | |
| `assets/serres-enhance.js:19` | `var TEL_TEXT  = "+34 621 24 44 69";` | Display format; Miami: `+1 (305) 000-0000` style — confirm format with client. |
| `assets/serres-enhance.js:164` | `'<div class="srs-menu-contact">Sant Cugat del Vallès, Barcelona<br><a href="' + TEL_HREF + '">' + TEL_TEXT + '</a></div>'` | Hard-coded city string inside the mobile menu footer (JS, not in dictionary — it is translated only if the DOM walker matches "Sant Cugat del Vallès, Barcelona" as an ES value; there is no such key, so it stays Spanish/Catalan-blind today). |
| `assets/serres-enhance.js:198` | `wa.setAttribute('aria-label', 'Chat on WhatsApp');` | EN key exists at i18n 51. |
| `pages/prices.html:463` | `var WA='https://wa.me/34621244469?text=';` | Prefix for the dynamically rendered tier CTAs. |
| `pages/prices.html:519` | `var msg=encodeURIComponent("Hola SERRES, quería presupuesto del pack "+T(t.name)+" de "+T(s.label)+" para mi coche.");` | Template builds a Spanish message around translated tier/service names → in EN mode the message is Spanglish ("…pack Full Kit Fitted de Body Kits…"). Needs EN/ES template chosen by `window.SERRES_I18N.get()`. This is the known verify-seo false positive mentioned in the brief. |

### 1.2 `tel:` links (8 static + 1 runtime)

| File:line | Snippet |
|---|---|
| `index.html:843` | `<a href="tel:+34621244469" class="btn ghost">Llamar al taller</a>` |
| `index.html:848` | `<div class="cm-row"><span class="cm-k">Teléfono</span><span class="cm-v"><a href="tel:+34621244469">+34 621 24 44 69</a></span></div>` |
| `index.html:886` | `<a href="tel:+34621244469">+34 621 24 44 69</a>` (footer "Taller" column) |
| `index.html:904` | `<a href="tel:+34621244469" class="mobile-call" aria-label="Llamar a SERRES">` |
| `blog/cuanto-cuesta-ppf-coche.html:388` | `<a class="btn ghost" href="tel:+34621244469">+34 621 24 44 69</a>` |
| `blog/cuanto-cuesta-vinilar-un-coche.html:389` | same |
| `blog/limpieza-tapiceria-coche-precio.html:402` | same |
| `blog/ppf-o-ceramico-que-elegir.html:387` | same |
| `assets/serres-enhance.js:18` | runtime `tel:+34621244469` (mobile menu, line 164) |

The click tracker on every page (see §5) fires `phone_click` on any `tel:` href — no change needed there beyond the number.

### 1.3 Visible phone text `+34 621 24 44 69` outside links (must become the US display number)

- Service page footers, `<p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p>`: `services/ppf.html:703`, `services/vinyl.html:669`, `services/ceramic.html:567`, `services/paint-correction.html:636`, `services/detailing.html:493`, `services/body-kits.html:598`, `pages/projects.html:379`, `pages/why-serres.html:421` (8 identical lines; plain text, not a link — no `tel:` on these pages except via enhance.js menu).
- Inside FAQ answers (visible + JSON-LD twin, must stay byte-identical because `_build/verify-seo.js:73-78` checks FAQPage text against visible HTML): `services/ppf.html:414` ↔ `677`; `services/vinyl.html:464` ↔ `654`; `services/ceramic.html:340` ↔ `546`; `services/paint-correction.html:430` ↔ `617`; `services/detailing.html:564` ↔ `477`; `services/body-kits.html:392` ↔ `582`.
- Blog prose: `blog/ppf-o-ceramico-que-elegir.html:371` (`+34 621 24 44 69 con el modelo y te damos presupuesto cerrado…`).
- JSON-LD `telephone` (two formats in use): E.164 `"+34621244469"` at `index.html:618`, `services/{body-kits:277, ceramic:251, detailing:583, paint-correction:316, ppf:312, vinyl:357}`, `blog/{cuanto-cuesta-ppf-coche:68, cuanto-cuesta-vinilar-un-coche:73, limpieza-tapiceria-coche-precio:73, ppf-o-ceramico-que-elegir:76}`; spaced `"+34 621 24 44 69"` at `pages/prices.html:247`, `pages/projects.html:218`, `pages/why-serres.html:240`. Normalise to one E.164 `+1XXXXXXXXXX` for Miami.
- i18n dictionary entries whose EN key AND es/ca values embed the number (6 entries, each 3 lines): `assets/serres-i18n.js:1064`, `1084`, `1100`, `1124`, `1146`, `1164`.

### 1.4 WhatsApp links with prefilled text (decoded; each needs an EN base + ES version)

| File:line | Decoded `text=` | Where it renders |
|---|---|---|
| `index.html:853` | `Hola SERRES, quería pedir presupuesto para mi coche.` | Contact section WA icon (`aria-label="WhatsApp"`) |
| `index.html:891` | same | Footer "Síguenos" column |
| `assets/serres-enhance.js:15` | same (source string) | Floating WA button (all pages) + mobile menu |
| `pages/prices.html:322` (SSR, 1st tier) | `Hola SERRES, quería presupuesto del pack Acentos de Car Wrap para mi coche.` | Server-rendered Car Wrap tier "Acentos" |
| `pages/prices.html:322` (SSR, 2nd tier) | `Hola SERRES, quería presupuesto del pack Cambio de color completo de Car Wrap para mi coche.` | tier "Cambio de color completo" |
| `pages/prices.html:322` (SSR, 3rd tier) | `Hola SERRES, quería presupuesto del pack Car Wrap Signature de Car Wrap para mi coche.` | tier "Car Wrap Signature" |
| `pages/prices.html:519` (JS template) | `Hola SERRES, quería presupuesto del pack {tier} de {service} para mi coche.` | Every tier of every service tab after JS render |
| `pages/projects.html:281` | `Hola SERRES, quería informarme sobre un Exclusivo completo y pedir una estimación de precio para mi coche.` | Hero CTA "Solicita tu proyecto" |
| `pages/projects.html:376` | same | Bottom CTA |
| `blog/cuanto-cuesta-ppf-coche.html:386` | `Hola SERRES, he leído la guía de precios de PPF y quiero un presupuesto para mi coche.` | Article CTA |
| `blog/cuanto-cuesta-vinilar-un-coche.html:387` | `Hola SERRES, he leído el artículo sobre cuánto cuesta vinilar un coche y quiero un presupuesto cerrado para el mío.` | Article CTA |
| `blog/limpieza-tapiceria-coche-precio.html:400` | `Hola SERRES, he leído el artículo sobre limpieza de tapicería y quiero precio cerrado para el interior de mi coche.` | Article CTA |
| `blog/ppf-o-ceramico-que-elegir.html:385` | `Hola SERRES, he leído el artículo sobre PPF o cerámico y quiero un presupuesto para mi coche.` | Article CTA |

`sameAs` WhatsApp URLs without text: `pages/prices.html:253`, `pages/projects.html:221`, `pages/why-serres.html:266`.

Static prefilled messages are plain `href` attributes; the i18n layer does not touch `href`, so today they stay Spanish in EN/CA. For Miami the port must either (a) keep two hrefs and swap them on `serres:langchange`, or (b) generate the href in JS from a dictionary key. Flag for the i18n key owner.

### 1.5 mailto / email

None. `grep -F 'mailto:'` → only `_build/verify-seo.js:61` (a URL filter regex). No `@`-address anywhere in scope. The Miami "email" datum has **no existing slot**; adding one (contact block `index.html:845-849`, footer `index.html:882-887`, JSON-LD `email`) is a scope decision, not a replacement.

---

## 2. Address, postcode, city, province, country — classified

Full per-line inventory with class tags is in Appendix B (586 unique lines). Class totals: (a) NAP 33 · (b) SEO copy 108 · (c) i18n 131 · (d) meta/title/OG 97 · (e) JSON-LD 173 · (f) alt/title-attr 10 · (g) analytics/config/other 34.

### 2.1 The full street address `Av. Can Fatjó dels Aurons, 15` (also written `…Aurons 15` without comma)

- JSON-LD `streetAddress` (14): `index.html:625`, `pages/prices.html:249`, `pages/projects.html:220`, `pages/why-serres.html:244`, `services/ppf.html:315`, `services/vinyl.html:360` (no comma), `services/ceramic.html:254`, `services/paint-correction.html:320`, `services/detailing.html:586` (no comma), `services/body-kits.html:281` (no comma), `blog/cuanto-cuesta-ppf-coche.html:62`, `blog/cuanto-cuesta-vinilar-un-coche.html:67`, `blog/limpieza-tapiceria-coche-precio.html:67`, `blog/ppf-o-ceramico-que-elegir.html:70`.
- Visible prose / FAQ (b): `index.html:828` (+ JSON-LD twin 674), `services/body-kits.html:582` (+392), `services/ceramic.html:546` (+340), `services/detailing.html:477` (+564), `services/paint-correction.html:617` (+430), `services/vinyl.html:654` (+464), `blog/cuanto-cuesta-ppf-coche.html:381`, `blog/cuanto-cuesta-vinilar-un-coche.html:382`, `blog/limpieza-tapiceria-coche-precio.html:394`.
- i18n (c): keys at `assets/serres-i18n.js:1049, 1084, 1100, 1124, 1146, 1164` (each with es/ca values on the following two lines).

### 2.2 Postcode `08174` (22)

JSON-LD `postalCode` ×14 (same blocks as above: `index.html:626`, `prices:249`, `projects:220`, `why-serres:246`, `ppf:318`, `vinyl:361`, `ceramic:257`, `paint-correction:323`, `detailing:587`, `body-kits:284`, blog `63/69/69/71`); visible (b): `index.html:828`, `blog/cuanto-cuesta-ppf-coche.html:382`, `blog/cuanto-cuesta-vinilar-un-coche.html:382`, `blog/limpieza-tapiceria-coche-precio.html:395`; JSON-LD FAQ twin `index.html:674`; i18n `1049` (+2 value lines).

### 2.3 `addressLocality` / `addressRegion` / `addressCountry` (JSON-LD, 14 blocks)

Every PostalAddress block carries `"addressLocality": "Sant Cugat del Vallès"`, `"addressRegion": "Barcelona"`, `"addressCountry": "ES"`. Miami: `addressLocality` = city from DATOS, `addressRegion` = `FL`, `addressCountry` = `US`, `postalCode` = ZIP. Lines: `index.html:627-629`; `pages/prices.html:249`; `pages/projects.html:220`; `pages/why-serres.html:245-248`; `services/ppf.html:316-319`; `services/vinyl.html:362-364`; `services/ceramic.html:255-258`; `services/paint-correction.html:321-324`; `services/detailing.html:588-590`; `services/body-kits.html:282-285`; `blog/cuanto-cuesta-ppf-coche.html:64-66`; `blog/cuanto-cuesta-vinilar-un-coche.html:68-71`; `blog/limpieza-tapiceria-coche-precio.html:68-71`; `blog/ppf-o-ceramico-que-elegir.html:72-74`.

`areaServed` (JSON-LD): string `"Barcelona"` at `pages/prices.html:245`, `pages/projects.html:216`; array `[{City "Sant Cugat del Vallès"},{City "Barcelona"}]` at `services/ppf.html:322-325`, `vinyl.html:367-370`, `ceramic.html:262-265`, `paint-correction.html:334-337`, `detailing.html:592-595`, `body-kits.html:295-298`.

### 2.4 (a) NAP / contact-block lines (33, non-dictionary)

- `index.html:846` `<span class="cm-k">Taller</span><span class="cm-v">Sant Cugat del Vallès, Barcelona</span>` — contact meta row (label key i18n 88 "Studio"→"Taller"; value has no dictionary key of its own → verify after port).
- `index.html:847` `Horario … Lun–Sáb · Con cita previa` (i18n key 91 `"Mon–Sat · By appointment"`).
- `index.html:848` phone row; `index.html:843` call button; `index.html:853` WA icon; `index.html:858` map iframe (`title="SERRES Wrap Center en Google Maps"`, i18n 965); `index.html:885` footer `<p>Sant Cugat del Vallès<br>Barcelona, España</p>` (i18n 97 `"Barcelona, Spain"`; note "Sant Cugat del Vallès" alone has NO dictionary key — it is a place name left untouched by design); `index.html:886` footer tel; `index.html:891` footer WA; `index.html:892` footer Google Maps link; `index.html:904` mobile call FAB.
- Service/pages footers `.phone` ×8 (see §1.3).
- `assets/serres-enhance.js:164` mobile menu contact.
- `pages/prices.html:322, 463`, `pages/projects.html:281, 376`, blog WA/tel CTAs (see §1).

### 2.5 (b) SEO copy — every visible "…en Barcelona" / Sant Cugat mention outside NAP (108 lines; the ones that carry a location are listed here)

H1 keyword spans (`.h1-kw`) — these are the page's primary SEO string and each has a matching EN key in the dictionary:
- `index.html:721` `PPF, Car Wrap y Detailing en Barcelona` (i18n 1039)
- `pages/gallery.html:306` `Galería de trabajos — PPF, Car Wrap y Detailing en Barcelona` (i18n 1104)
- `pages/prices.html:304` `Precios de PPF, Car Wrap, Ceramic Coating y Detailing en Barcelona` (i18n 1127)
- `pages/projects.html:270` `Proyectos de transformación completa en Barcelona` (i18n 1030)
- `pages/why-serres.html:332` `Estudio de detailing en Sant Cugat del Vallès` (i18n 1036)
- `services/ppf.html:477` `PPF en Barcelona — protección de pintura para tu coche` (i18n 1051)
- `services/vinyl.html:506` `Car Wrapping en Barcelona — vinilar tu coche` (i18n 1149)
- `services/ceramic.html:399` `Tratamiento cerámico para coche en Barcelona` (i18n 1087)
- `services/paint-correction.html:476` `Pulido de coche en Barcelona — corrección de pintura` (i18n 1131)
- `services/detailing.html:336` `Detailing de coche en Barcelona` (i18n 1070)
- `services/body-kits.html:447` `Montaje de body kits en Barcelona` (i18n 1107)

Leads / intros: `index.html:723` (i18n 63), `index.html:813` eyebrow `Taller en Barcelona` (i18n 1040), `index.html:814` (1041), `index.html:815` (1042, "a pocos minutos de Barcelona"), `pages/gallery.html:308` ("Fotografiado en Barcelona y alrededores", i18n 111), `pages/gallery.html:309` link `Protección PPF en Barcelona` (1105), `pages/gallery.html:383` M2 description ("azotea de Barcelona con la torre de Collserola", i18n 121), `pages/projects.html:279` (255), `pages/why-serres.html:341` (317), `pages/why-serres.html:380` link `Detailing profesional en Sant Cugat` (1037), `services/ppf.html:486` (389), `services/ppf.html:688-689` related links (1068, 1069), `services/vinyl.html:515` (648), `services/vinyl.html:623` (1112), `services/vinyl.html:639` (1159), `services/ceramic.html:408` (470), `services/paint-correction.html:485` (584), `services/paint-correction.html:609` (1142), `services/detailing.html:345` (530), `services/detailing.html:445` (1072), `services/detailing.html:472` (1082), `services/body-kits.html:456` (684), `services/body-kits.html:480` related link (1109), `services/body-kits.html:540` (1112), `services/body-kits.html:561` (1118), `services/ppf.html:672` (1062).

FAQ questions with the city: `index.html:819` / JSON-LD `655` `¿Cuánto cuesta instalar PPF en Barcelona?` (i18n 1044); `services/ppf.html:656` / `379` same; `services/paint-correction.html:596` / `388` `¿Cuánto cuesta un pulido de coche en Barcelona?` (1135).

Distance claims (rewrite for Miami — confirm with client which neighbourhood/landmark to anchor to): `index.html:815` "a pocos minutos de Barcelona"; `services/body-kits.html:392/582` "a 20 minutos de Barcelona"; `services/paint-correction.html:430/617` "a 20 minutos de Barcelona"; `services/vinyl.html:464/654` "a 20 minutos del centro de Barcelona"; `blog/cuanto-cuesta-vinilar-un-coche.html:383` "a 15 minutos de la ciudad"; `blog/ppf-o-ceramico-que-elegir.html:372-373` "a 15 minutos de Barcelona"; i18n `1042, 1124, 1146, 1164`.

Blog prose with location: `blog/cuanto-cuesta-ppf-coche.html:203, 263, 381-382`; `blog/cuanto-cuesta-vinilar-un-coche.html:229, 331-332, 382-383`; `blog/limpieza-tapiceria-coche-precio.html:394-395`; `blog/ppf-o-ceramico-que-elegir.html:244, 371-373`; `blog/index.html:7` (meta) and `:93` (alt).

### 2.6 (c) i18n dictionary — entries that carry a location (79 lines with "Barcelona", 56 with "Sant Cugat", 44 with "Vallès")

Key lines (EN key → es/ca values on the next 1–2 lines). For Miami the **EN key becomes the inline text**, so every one of these keys must be rewritten (not just the values) — and a rewritten key means the ES value must be re-authored too. Titles are the notable case: the EN keys for service `<title>`s carry no city at all (see §10 risk 3).

`assets/serres-i18n.js`: 57 (home title), 63 (hero sub), 91 (hours), 97 (`Barcelona, Spain`), 111 (gallery lead), 121 (M2 / Collserola), 125 (Supra / "Catalan countryside"), 133 (XM / "Catalan back road"), 148/174 (`Snow-dusted`), 151/176 (`Collserola`), 248 (Exclusive title), 255 (Exclusive lead), 312 (Why title), 317 (Why lead), 385 (`SERRES — Paint Protection Film (PPF)` → es "PPF en Barcelona — Protección de Pintura | SERRES"), 389 (PPF lead), 463 (`SERRES — Ceramic Coating` → es "Tratamiento Cerámico para Coche en Barcelona | SERRES"), 470, 523 (`SERRES — Detailing` → es "Detailing y Limpieza Interior de Coche en Barcelona | SERRES"), 530, 577 (`SERRES — Paint Correction` → es "Pulido y Corrección de Pintura de Coche en Barcelona | SERRES"), 584, 639 (`SERRES — Car Wrap / Vinyl` → es "Car Wrap en Barcelona — Cambio de Color | SERRES"), 648, 678 (`SERRES — Body Kits` → es "Montaje de Body Kits en Barcelona | SERRES"), 684, 965 (`SERRES Wrap Center on Google Maps`), 994 (home meta description), 1018 (Why meta), 1021 (gallery meta), 1024 (Exclusive meta), 1030, 1036, 1037, 1039, 1040, 1041, 1042, 1044, 1049 (address + hours FAQ answer), 1051, 1062, 1064, 1068, 1069, 1070, 1072, 1082, 1084, 1087, 1100, 1104, 1105, 1107, 1109, 1112, 1118, 1124, 1127, 1131, 1135, 1142, 1146, 1149, 1159, 1164.

Also in the dictionary but climate/geography-flavoured (relevant to the Florida refocus): 148–149 (`Snow-dusted`, `Winter`), 174 (`Snow-dusted · The ramp`).

How the layer works today (for whoever inverts it): `assets/serres-i18n.js:23` `var LANGS = ["en", "es", "ca"];`, `:24` `LABELS`, `:31` `var DICT = {` … `:1174-1181` builds `INV` (es/ca value → EN key), `:1184-1190` `enKeyOf(core)` looks the **inline Spanish text** up in `INV`, `:1196` default lang `"es"`, `:1323-1335` `bindMeta/applyMeta` translate `<title>` and `meta[name=description]` **only** (OG/Twitter/JSON-LD are never translated), `:1313` attributes translated are only `[aria-label]` and `[title]` (so `alt`, `href`, `data-note`, `content` of OG tags are static), `:1338` sets `<html lang>`. `_build/dict-tools.js` (check/lookup/merge) assumes the `[es, ca]` pair shape at lines 39, 50, 68, 79, 93 — it must be updated when CA is dropped.

### 2.7 (d) `<title>`, meta description, OG, Twitter — per page (97 lines)

All 16 pages: `<html lang="es">` (line 2) and `<meta property="og:locale" content="es_ES">` (line 11; blog articles 19–20, blog/index 16). Location-bearing titles/descriptions:

| Page | `<title>` (line 6/7) | description (7/8) · og:title (12) · og:description (13) · twitter:title (19) · twitter:description (20) |
|---|---|---|
| index.html | `PPF, Car Wrap y Detailing en Barcelona \| SERRES` | desc 7 "…en Barcelona (Sant Cugat del Vallès)…"; og 12/13; tw 19/20 |
| pages/gallery.html | (no city in title) | desc 7 "Proyectos de SERRES en Barcelona…"; og:description 13; tw 20 |
| pages/prices.html | (no city) | none location-bearing; desc carries "IVA incluido" (7/13/20) |
| pages/projects.html | `Exclusivo — Proyectos de Transformación en Barcelona \| SERRES` | desc 7, og 12/13, tw 19/20 |
| pages/why-serres.html | `Estudio de Detailing en Sant Cugat — Por Qué SERRES` | desc 7 "…Sant Cugat del Vallès… 98%…", og 12/13, tw 19/20 |
| services/ppf.html | `PPF en Barcelona — Protección de Pintura \| SERRES` | desc 7 "…Sant Cugat, Barcelona."; og 12/13; tw 19/20 |
| services/vinyl.html | `Car Wrap en Barcelona — Cambio de Color \| SERRES` | desc 7 "…Sant Cugat del Vallès."; og 12/13; tw 19/20 |
| services/ceramic.html | `Tratamiento Cerámico para Coche en Barcelona \| SERRES` | desc 7 "…Sant Cugat, Barcelona."; og 12/13; tw 19/20 |
| services/paint-correction.html | `Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES` | desc 7 "…Sant Cugat, Barcelona."; og 12/13; tw 19/20 |
| services/detailing.html | `Detailing y Limpieza Interior de Coche en Barcelona \| SERRES` | desc 7 "…Estudio premium en Sant Cugat."; og 12/13; tw 19/20 |
| services/body-kits.html | `Montaje de Body Kits en Barcelona \| SERRES` | desc 7 "…Sant Cugat del Vallès."; og 12/13; tw 19/20 |
| blog/index.html | (no city) | desc 7 "…tu coche en Barcelona."; og:description 13; tw 20 |
| blog/cuanto-cuesta-ppf-coche.html | (no city; "IVA incluido" in desc 8/22/33) | — |
| blog/cuanto-cuesta-vinilar-un-coche.html | (no city; H1 180 + JSON-LD headline 45 say "Precios reales en España (2026)") | — |
| blog/limpieza-tapiceria-coche-precio.html | (no city) | — |
| blog/ppf-o-ceramico-que-elegir.html | (no city) | desc 8 "…taller de Sant Cugat (Barcelona)…"; JSON-LD desc 57 "…taller de Sant Cugat…" |

Canonical (`rel="canonical"`) + `og:url` + `og:image` + `twitter:image` on every page carry the domain (see §9). No `hreflang`, no `geo.*`/`ICBM` meta, no `og:locale:alternate` exist.

### 2.8 (f) alt text and title attributes (10)

- `blog/index.html:93` alt `…en el taller SERRES de Sant Cugat`
- `blog/cuanto-cuesta-ppf-coche.html:175` alt `…en el taller SERRES de Sant Cugat del Vallès`
- `blog/cuanto-cuesta-vinilar-un-coche.html:195` alt `…en el taller SERRES de Sant Cugat del Vallès`
- `blog/limpieza-tapiceria-coche-precio.html:195` alt `…en el taller SERRES de Sant Cugat del Vallès`
- `blog/ppf-o-ceramico-que-elegir.html:175` alt `…en el taller SERRES de Sant Cugat`
- `pages/gallery.html:369` alt `RWB Porsche 993 cubierto de nieve sobre una rampa de hormigón` (snow)
- `pages/gallery.html:395` alt `Frontal del BMW M2 con la torre de Collserola detrás`
- `pages/gallery.html:400` alt `Zaga del BMW M2 con la torre de Collserola al fondo`
- `pages/gallery.html:421` alt `Toyota GR Supra blanco aparcado junto a una masía catalana de piedra`
- `index.html:858` iframe `title="SERRES Wrap Center en Google Maps"`

`alt` is NOT translated by the i18n layer (only `aria-label`/`title`), so these are single-language strings that must simply be rewritten in EN for Miami.

### 2.9 (g) other geography: gallery captions and data attributes

`pages/gallery.html:368` `data-note="Snow-dusted · The ramp"`, `:371` `<span class="cap-note">Con nieve</span><span class="cap-tag">Invierno</span>`, `:394` `data-note="Front end · Collserola"`, `:397` `cap-note Collserola`, `:414` "llevado después al campo catalán", `:471` "carretera secundaria catalana con el sol entre las nubes". These describe where the photos were actually taken (Barcelona). The brief keeps the photos; the acceptance grep (`Barcelona = 0`) forces rewording of `gallery.html:308, 383` and i18n `111, 121` — see §10 risk 7 (honesty of captions is a client decision).

---

## 3. Google Maps, `hasMap`, lat/long

| Item | File:line | Exact value |
|---|---|---|
| Embed iframe | `index.html:858` | `<iframe title="SERRES Wrap Center en Google Maps" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28430.735708274406!2d2.0633841973199507!3d41.49532481891128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2027f0d4ea2a70f1%3A0xc8f7c6ce9b2a429d!2sSerres%20Wrap%20Center!5e0!3m2!1ses!2ses!4v1780990222187!5m2!1ses!2ses" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade">` — center lng `2.0633841973199507`, lat `41.49532481891128`, place id `0x2027f0d4ea2a70f1:0xc8f7c6ce9b2a429d`, UI locale `!3m2!1ses!2ses` (es/ES → should become `!1sen!2sus`). Wrapped in `<div class="contact-map"><div class="map-frame">` (856–859). |
| `hasMap` (CID link) | `index.html:622` | `"hasMap": "https://maps.google.com/?cid=14481261717501919901",` — only on the home AutoBodyShop block; no other page has `hasMap`. |
| Footer "Google Maps" link | `index.html:892` | `<a href="https://www.google.com/maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s" target="_blank" rel="noopener">Google Maps</a>` |
| Lat/long elsewhere | — | **None.** No `GeoCoordinates`, `latitude`, `longitude`, `geo.position`, or `ICBM` anywhere. The brief's "geo" for the Miami AutoBodyShop is an **addition**, not a replacement. |
| i18n | `assets/serres-i18n.js:965` | `"SERRES Wrap Center on Google Maps": ["SERRES Wrap Center en Google Maps", "SERRES Wrap Center a Google Maps"]` (feeds the iframe `title`). |

---

## 4. JSON-LD — all 42 blocks (full dumps in Appendix A)

Legend for "must change": ADDR = PostalAddress (street/ZIP/locality/region/country), TEL = telephone, URL = any `serreswrapcenter.es` URL (`url`, `@id`, `image`, `logo`, `item`, `mainEntityOfPage`, offer `url`), HRS = openingHoursSpecification, AREA = areaServed, CUR = priceCurrency/price/VAT flag, RATE = aggregateRating, LANG = inLanguage, TXT = Spanish name/description/FAQ text with Barcelona/IVA/€ (becomes EN base), MAP = hasMap, SAME = sameAs.

| # | File | Lines | @type (nested) | Must change for Miami |
|---|---|---|---|---|
| 1 | index.html | 612–647 | **AutoBodyShop** | `url` 617; TEL 618 `"+34621244469"`; `image` 619; `priceRange` 620 `"€€€"` → `$$$`; `description` 621 (Sant Cugat/Barcelona, ES text); MAP 622; ADDR 623–630; HRS 631–643 (Mon–Fri 09:00–19:00, Sat 10:00–14:00); SAME 644 (Instagram only). Brief asks to ADD `geo`, `branchOf`/`parentOrganization` → SERRES Organization, `sameAs` incl. `https://serreswrapcenter.es`. |
| 2 | index.html | 648–679 | FAQPage (3 Q) | Q1 655 "¿Cuánto cuesta instalar PPF en Barcelona?" + A 658 (890 €/2.390 €, IVA); Q3 A 674 full address + hours. Must stay byte-identical with visible 819–828. |
| 3 | pages/prices.html | 238–260 | Service › provider LocalBusiness › hasOfferCatalog (5 Offers) | `description` 242 (IVA, Sant Cugat, Barcelona); `url` 243; `image` 244; AREA 245 `"Barcelona"`; TEL 247 (spaced); provider `url` 248; ADDR 249; HRS 250–252; SAME 253 (Instagram + wa.me); Offers 255–259 `price`/`priceCurrency:"EUR"`/`description "Desde N €, IVA incluido"`/`url`. |
| 4 | pages/prices.html | 261–265 | BreadcrumbList | `item` URLs 263–264; names "Inicio"/"Precios" (ES). |
| 5 | pages/projects.html | 210–222 | Service › provider LocalBusiness | `url` 214; `image` 215; AREA 216; TEL 218 (spaced); provider `url` 219; ADDR 220; SAME 221. |
| 6 | pages/projects.html | 223–227 | BreadcrumbList | 225–226 URLs; "Inicio"/"Exclusivo". |
| 7 | pages/why-serres.html | 232–274 | **AutoRepair** (top-level, with RATE) | `description` 237 (Sant Cugat); `url` 238; `image` 239; TEL 240 (spaced); `priceRange` 241 `"€€"` (inconsistent with index `€€€`); ADDR 242–249; HRS 250–262; SAME 263–267; **RATE 268–272 (4.9/50) → delete per brief**. |
| 8 | pages/why-serres.html | 275–294 | BreadcrumbList | 284, 290 URLs; "Inicio"/"Por qué SERRES". |
| 9 | pages/gallery.html | 267–269 | ImageGallery › publisher LocalBusiness | `description` (Sant Cugat del Vallès (Barcelona)); `url`; `image[]` 8 gallery URLs; publisher `url`. |
| 10 | pages/gallery.html | 270–272 | BreadcrumbList | 2 URLs; "Inicio"/"Proyectos". |
| 11 | blog/index.html | 31–40 | Blog › publisher Organization | `@id` 35; `name` "Blog de SERRES Wrap Center"; LANG 37 `"es"`; publisher `url` 38. |
| 12 | blog/index.html | 41–50 | BreadcrumbList | 46 URL. |
| 13 | blog/cuanto-cuesta-ppf-coche.html | 42–71 | BlogPosting › publisher Organization (ADDR+TEL) | `@id` 46, `mainEntityOfPage` 47, headline 48, description 49 (890€/2.390€ IVA), `image` 50, LANG 51 `"es"`, dates 52–53 (2026-07-09), author `url` 54, publisher `url` 58, `logo` 59, ADDR 60–67, TEL 68. |
| 14 | same | 74–84 | BreadcrumbList | 78–79 URLs. |
| 15 | same | 87–119 | FAQPage (5 Q) | A1 95 "En España, entre 900 € y 1.700 €… 890 €… IVA incluido"; A4 111 (340–890 €). Twin visible 339–341. |
| 16 | blog/cuanto-cuesta-vinilar-un-coche.html | 40–76 | Article › publisher Organization (ADDR+TEL) | `@id` 44, headline 45 "…Precios reales en España (2026)", description 46 (€), `image` 47, LANG 48 `"es-ES"`, dates 49–50, `mainEntityOfPage` 53, author `url` 58, publisher `url` 63, `logo` 64, ADDR 65–72, TEL 73. |
| 17 | same | 79–89 | BreadcrumbList | 83–84 URLs. |
| 18 | same | 92–139 | FAQPage (5 Q) | **Q3 115–118 "¿Hay que avisar a la DGT…" / A "…ficha técnica del vehículo en España… homologación ni ITV extraordinaria…"** → replace with a Florida-relevant Q/A (twin visible 354–356). |
| 19 | blog/limpieza-tapiceria-coche-precio.html | 40–76 | BlogPosting › publisher Organization (ADDR+TEL) | `@id` 44, `mainEntityOfPage` 47, description 51 (35–490 €), `image` 52, LANG 53 `"es-ES"`, dates 54–55, author `url` 59, publisher `url` 64, `logo` 65, ADDR 66–72, TEL 73. |
| 20 | same | 79–89 | BreadcrumbList | 83–84 URLs. |
| 21 | same | 92–139 | FAQPage (5 Q) | A1 101 (70–150 €, 30-40 €, 300–500 €) — market ranges are Spanish. |
| 22 | blog/ppf-o-ceramico-que-elegir.html | 50–79 | BlogPosting › publisher Organization (ADDR+TEL) | `@id` 54, `mainEntityOfPage` 55, description 57 "…taller de Sant Cugat…", `image` 58, LANG 59 `"es"`, dates 60–61, author `url` 62, publisher `url` 66, `logo` 67, ADDR 68–75, TEL 76. |
| 23 | same | 82–92 | BreadcrumbList | 86–87 URLs. |
| 24 | same | 95–127 | FAQPage (5 Q) | A4 119 "Por 890 €…". |
| 25 | services/ppf.html | 299–371 | Service › provider LocalBusiness; areaServed[]; 3 Offers | `@id` 303, `name` 304 "…en Barcelona", `url` 306, description 307 (Sant Cugat del Vallès, Barcelona), provider `url` 311, TEL 312, ADDR 313–321, AREA 322–325, Offers 326–369 (`price` 890/1190/2390, `priceCurrency` EUR ×6, `valueAddedTaxIncluded: true` ×3, offer `url` ×3). |
| 26 | services/ppf.html | 372–427 | FAQPage (6 Q) | Q1 379 "…en Barcelona", A 382 (€, IVA); A4 406 (Sant Cugat); A5 414 (phone, Mon–Sat); A6 422 (340 €). Twins 656–680. |
| 27 | services/ppf.html | 428–438 | BreadcrumbList | 433–435 URLs (`/#services`). |
| 28 | services/vinyl.html | 332–342 | BreadcrumbList | 337–339 URLs. |
| 29 | services/vinyl.html | 343–413 | Service › provider **AutoRepair**; areaServed[]; 3 Offers | `@id` 347, `url` 350, `image` 351, description 352 (Sant Cugat), provider `url` 356, TEL 357, ADDR 358–365, AREA 366–370, Offers 371–411 (250/1490/1990 EUR, VAT true, `minPrice`). |
| 30 | services/vinyl.html | 414–469 | FAQPage (6 Q) | A1 424 (€, IVA); A3 440 (Sant Cugat); A6 464 (address, phone, "20 minutos del centro de Barcelona"). Twins 629–654. |
| 31 | services/ceramic.html | 239–289 | Service › provider LocalBusiness; areaServed[]; 3 Offers | `name` 243 "…en Barcelona", `url` 245, description 246 (340 € IVA), provider `url` 250, TEL 251, ADDR 252–260, AREA 261–265, Offers 266–287 (340/590/890 EUR; descriptions "Desde N € IVA incluido"). |
| 32 | services/ceramic.html | 290–345 | FAQPage (6 Q) | A1 300 (IVA, €); A6 340 (Sant Cugat, address, phone). Twins 521–546. |
| 33 | services/ceramic.html | 346–356 | BreadcrumbList | 351–353 URLs (`/index.html#services`). |
| 34 | services/paint-correction.html | 293–303 | BreadcrumbList | 298–300 URLs. |
| 35 | services/paint-correction.html | 304–379 | Service › provider **AutoBodyShop** (with RATE); areaServed[]; 3 Offers | `@id` 308, `url` 312, provider TEL 316, `url` 317, ADDR 318–325, **RATE 326–332 → delete**, AREA 334–337, Offers 338–377 (340/590/890 EUR, VAT true). |
| 36 | services/paint-correction.html | 380–435 | FAQPage (6 Q) | Q1 388 "…en Barcelona", A 390 (€, IVA); A4 414 (Sant Cugat); A5 422 (890 €); A6 430 (phone, address, "20 minutos de Barcelona"). Twins 596–617. |
| 37 | services/detailing.html | 286–292 | BreadcrumbList | 288–290 URLs. |
| 38 | services/detailing.html | 514–569 | FAQPage (6 Q) | A1 524 (IVA, €); A3 540 (150 €); A5 556 (Sant Cugat, "valoración de 4,9 y… 98%"); A6 564 (address, phone). Twins 452–477. |
| 39 | services/detailing.html | 570–645 | Service › provider **AutoDetailing**; areaServed[]; 3 Offers | `@id` 574, `url` 578, provider `url` 582, TEL 583, ADDR 584–591, AREA 592–595, Offers 596–643 (35/150/490 EUR, VAT true, `minPrice`, offer `url` ×3). |
| 40 | services/body-kits.html | 266–341 | Service › provider **AutoBodyShop** (with RATE); areaServed[]; hasOfferCatalog (3 Offers) | `url` 272, description 273 (Sant Cugat, 450 € IVA), provider TEL 277, `url` 278 (no trailing slash), ADDR 279–286, **RATE 287–292 → delete**, AREA 294–298, Offers 303–338 (450/1490/3490 EUR, `minPrice`, VAT true). |
| 41 | services/body-kits.html | 342–397 | FAQPage (6 Q) | A1 352 (€, IVA); A3 368 (Sant Cugat); A6 392 (address, phone, "20 minutos de Barcelona"). Twins 547–582. |
| 42 | services/body-kits.html | 398–408 | BreadcrumbList | 403–405 URLs (`/index.html#services`). |

Cross-cutting JSON-LD observations:
- Business `@type` is **inconsistent**: AutoBodyShop (index, paint-correction provider, body-kits provider), AutoRepair (why-serres top-level, vinyl provider), LocalBusiness (ppf, ceramic, prices, projects, gallery publisher), AutoDetailing (detailing), Organization (blog ×5). The brief asks for AutoBodyShop with `branchOf`/`parentOrganization`; decide whether to normalise all 14 business nodes or only the home block.
- `priceRange`: `"€€€"` (index 620) vs `"€€"` (why-serres 241) → both `"$$$"`.
- `valueAddedTaxIncluded: true` appears in 13 PriceSpecification nodes (ppf 336/350/364, vinyl 381/394/407, paint-correction 347/360/373, detailing 607/622/637, body-kits 311/323/335). US prices are quoted pre-sales-tax; either drop the flag or set `false` — confirm with client.
- `inLanguage` is `"es"` (blog/index 37, ppf-coche 51, ppf-o-ceramico 59) vs `"es-ES"` (vinilar 48, tapiceria 53) → `"en-US"`.
- `datePublished`/`dateModified` are all `2026-07-09` (articles) — bump `dateModified` when the articles are refocused.
- No `Organization` node for the parent SERRES brand exists anywhere; the brief's `branchOf` target must be created (or referenced by `@id` on serreswrapcenter.es — confirm with the Barcelona site owner).

---

## 5. Analytics

### 5.1 GA4 `G-1K6FYZ99GN` (34 occurrences)

Identical snippet on all 16 pages (in `<head>`, right after the JSON-LD blocks):
```
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1K6FYZ99GN');
</script>
```
Lines (loader / config): `index.html:681/686`; `pages/gallery.html:274/279`; `pages/prices.html:267/272`; `pages/projects.html:229/234`; `pages/why-serres.html:296/301`; `services/body-kits.html:410/415`; `services/ceramic.html:358/363`; `services/detailing.html:294/299`; `services/paint-correction.html:437/442`; `services/ppf.html:440/445`; `services/vinyl.html:471/476`; `blog/index.html:52/57`; `blog/cuanto-cuesta-ppf-coche.html:121/126`; `blog/cuanto-cuesta-vinilar-un-coche.html:141/146`; `blog/limpieza-tapiceria-coche-precio.html:141/146`; `blog/ppf-o-ceramico-que-elegir.html:41/46`. Plus `_build/verify-seo.js:45` (hard-coded regex `googletagmanager\.com\/gtag\/js\?id=G-1K6FYZ99GN` — the verifier will FAIL every page until this is updated to the new ID).

No consent-mode calls, no `send_page_view` overrides, no custom dimensions.

### 5.2 Click tracker (custom events; no ID inside, but page-specific line numbers)

Same IIFE at the end of `<body>` on every page: `track('whatsapp_click', {link_url, page_path})` for hrefs containing `wa.me`/`api.whatsapp.com`, `track('phone_click', …)` for `tel:` — `index.html:1021-1034`; `pages/gallery.html:750-763`; `pages/prices.html:573-586`; `pages/projects.html:400-413`; `pages/why-serres.html:487-500`; `services/body-kits.html:682-695`; `services/ceramic.html:651-664`; `services/detailing.html:647-660`; `services/paint-correction.html:736-749`; `services/ppf.html:972-985`; `services/vinyl.html:1295-1308`; `blog/index.html:147-160`; `blog/cuanto-cuesta-ppf-coche.html:432-445`; `blog/cuanto-cuesta-vinilar-un-coche.html:434-447`; `blog/limpieza-tapiceria-coche-precio.html:447-460`; `blog/ppf-o-ceramico-que-elegir.html:431-444`. `_build/verify-seo.js:46-49` requires exactly one `whatsapp_click` string per page.

### 5.3 Other analytics / pixels

None. `grep -i 'googletagmanager|GTM-|fbq(|facebook.net|hotjar|clarity.ms|consent'` → only the gtag loader above. No Meta pixel, GTM container, Hotjar, Clarity, cookie banner.

---

## 6. Opening hours — every occurrence

| Where | File:line | Value |
|---|---|---|
| JSON-LD `openingHoursSpecification` | `index.html:631-643` | Mon–Fri `09:00`–`19:00`; Sat `10:00`–`14:00` |
| JSON-LD | `pages/prices.html:250-252` | same (one-line form) |
| JSON-LD | `pages/why-serres.html:250-262` | same |
| Visible contact row | `index.html:847` | `Lun–Sáb · Con cita previa` (i18n key 91 `"Mon–Sat · By appointment"` → ["Lun–Sáb · Con cita previa","Dl–Ds · Amb cita prèvia"]) |
| Visible FAQ + JSON-LD twin | `index.html:828` / `674` | "…de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00." (i18n 1049 + values 1050–1051) |
| Service FAQs "cita previa de lunes a sábado" (visible / JSON-LD) | `services/ppf.html:677/414`, `vinyl.html:654/464`, `ceramic.html:546/340`, `paint-correction.html:617/430` and `601/398`, `detailing.html:477/564`, `body-kits.html:582/392` | "lunes a sábado" only (no clock times) — i18n 1064, 1084, 1100, 1124, 1146, 1164 and (paint-correction 398) 1138 |
| Blog CTAs | `blog/cuanto-cuesta-ppf-coche.html:381`, `blog/cuanto-cuesta-vinilar-un-coche.html:332`, `blog/limpieza-tapiceria-coche-precio.html:395-396`, `blog/ppf-o-ceramico-que-elegir.html:372` | "cita previa de lunes a sábado" |

Inconsistency to resolve with Miami hours: JSON-LD says Sat 10–14 while visible text says "Lun–Sáb" without hours; the port should carry the client's Miami schedule to all 3 JSON-LD blocks + `index.html:828/674` + key 91/1049.

---

## 7. Other Spain-specific references

| Ref | File:line(s) | Notes |
|---|---|---|
| **ITV / DGT / homologación** | `blog/cuanto-cuesta-vinilar-un-coche.html:115-118` (JSON-LD Q/A) and `354-356` (visible `<details>`) | Whole FAQ item is Spanish vehicle-registry law ("El color no consta en la ficha técnica del vehículo en España… ni ITV extraordinaria… comunicarlo a tu aseguradora"). Replace with a Florida equivalent (e.g. no DHSMV color update required, but notify insurer) — confirm wording with client; keep JSON-LD/visible twins identical. |
| **IVA** (VAT) — 51 occurrences outside i18n | index 658/816/820; prices 7/13/20/242/255-259/306/348; ppf 382/657; vinyl 424/629; ceramic 246/271/278/285/300/521; paint-correction 390/597; detailing 524/452; body-kits 273/352/547; blog/index 121; ppf-coche 8/22/33/49/95/203/222/227/239/323/341; vinilar 221/234/328-329/381; tapiceria 222/236; ppf-o-ceramico 236 | US has no VAT; "IVA incluido" → drop or "tax not included" per client. EN keys use "VAT included" at i18n 229, 243, 1015, 1043, 1045, 1056, 1074, 1090, 1114, 1136, 1155 (11) — these keys become inline EN text. |
| **"en EUR"** | `pages/prices.html:348` footer `Precios orientativos en EUR, IVA incluido`; i18n 243–245 | → USD |
| **`priceRange` "€€€"/"€€"** | `index.html:620`, `pages/why-serres.html:241` | → `$$$` |
| **"España"** (14 outside i18n) | `index.html:885` (footer, i18n 97 `Barcelona, Spain`); `blog/cuanto-cuesta-ppf-coche.html:95, 199, 221, 339`; `blog/cuanto-cuesta-vinilar-un-coche.html:45, 118, 180, 227, 234, 289, 355`; `blog/limpieza-tapiceria-coche-precio.html:219`; `blog/ppf-o-ceramico-que-elegir.html:241` | Blog "market in Spain" price ranges (e.g. "En España, entre 900 € y 1.700 €", "Mercado en España" table headers 234) must become Miami/US market ranges — **do not convert**, get real Miami ranges or drop the comparison columns (client confirm). |
| **`og:locale` es_ES** | all 16 pages (line 11 / blog 16–20) | → `en_US` (+ optional `og:locale:alternate` `es_US`). |
| **`<html lang="es">`** | all 16 pages line 2; also set at runtime by `serres-i18n.js:1338` | → `en` |
| **`inLanguage`** | see §4 | → `en-US` |
| **Toll/metric idiom** | `blog/cuanto-cuesta-ppf-coche.html:245` "Un capó con 20.000 km de peaje" | Spanish idiom + km; rewrite (miles, I-95/turnpike) |
| **km / metric** | blog articles use km, cm ("a más de 30 cm del panel" vinilar 129), °C none | Unit decision for US copy — flag only |
| **Snow / winter** | `pages/gallery.html:368-371` (`Snow-dusted · The ramp`, `Con nieve`, `Invierno`), alt 369; i18n 148–149, 174 | Photo of a snowy RWB — caption is factual; Florida refocus may want to keep as "shot in the mountains" — client decision. |
| **Collserola / Catalan countryside** | `pages/gallery.html:383, 394, 395, 397, 400, 414, 421, 471`; i18n 121–123, 125, 133, 151, 176 | Barcelona landmarks in captions/alt (see §2.9). |
| **"Catal"** false positive | `pages/prices.html:254` `OfferCatalog`, `services/body-kits.html:299` `OfferCatalog` | Ignore in the final grep. |
| **"Equipo SERRES"** author | `blog/*` byline lines 165/185/185/165 and JSON-LD author 54, 62 | Brand-level, fine; EN base "SERRES Team" via i18n. |
| **RGPD / cookies / legal / privacy / terms** | none anywhere | Site has no legal pages at all; brief PASO 5 (US/Florida privacy + terms) is a creation task → "confirm with client" TODO. |
| **TÜV / CE / EU marks** | none | `CE ` hits are only CSS comments (`SERVICE NAVIGATOR`). |
| **Holiday references** | none | |
| **Nearby towns** (Rubí, Terrassa, Sabadell, Cerdanyola, Valldoreix…) | none | |
| **Cataluña/Catalunya** | none as words; only "catalán/catalana/Catalan" in gallery captions | |

---

## 8. Reviews / ratings inherited from Barcelona

| Item | File:line | Notes |
|---|---|---|
| `aggregateRating` 4.9 / 50 | `pages/why-serres.html:268-272`; `services/body-kits.html:287-292`; `services/paint-correction.html:326-332` | Delete per brief. |
| Visible "4.9 Valoración media" | `pages/why-serres.html:337` (`.hstat`), `:396` (`.rv-stat`) | Count-up targets (`enhance.js:219`). Brief only mandates deleting aggregateRating + TESTIMONIALS; these stat tiles and the "98% recomiendan" claim (why-serres meta 7/13/20, i18n 1018; `services/detailing.html:472/556` "valoración de 4,9 y… 98%") are Barcelona review data too → flag as "confirm with client / remove". |
| "4,9" in blog prose | `blog/cuanto-cuesta-vinilar-un-coche.html:334`, `blog/ppf-o-ceramico-que-elegir.html:328` | Same. |
| `TESTIMONIALS[]` | `pages/why-serres.html:442-452` (Marc Vidal · Golf GTI; Marcos Catlano · Porsche 911; Daniel Roca · Mercedes G-Class; Aleix Soler · Audi RS6; Núria Camps · Range Rover — EN quotes, translated by `T()` on `serres:langchange`, line 468–476) | Plus the server-rendered Spanish copy of the same 5 cards at `pages/why-serres.html:407` (`<div class="rv-stack" id="rvStack" data-i18n-skip>…`) which is overwritten by `paint()` on load. Both must go. Dictionary entries for the 5 quotes/roles live in i18n (search "Golf GTI · Owner" etc.). |

---

## 9. Domain, sitemap, robots, .htaccess, build scripts

- 190 × `https://serreswrapcenter.es`. Contexts: `<loc>` 16 (sitemap 4–79), `rel="canonical"` 16, `og:url` 16, `og:image` 16, `twitter:image` 16, `Sitemap:` 1 (`robots.txt:4`), the rest inside JSON-LD (`url`, `@id`, `image`, `logo`, `item`, `mainEntityOfPage`, offer `url`, gallery `image[]`). Distinct URLs are listed in the classifier output; note `https://serreswrapcenter.es` without trailing slash appears 5× (index 617, body-kits 278, blog/index 38, ppf-coche 58, ppf-o-ceramico 66) vs `…/` 33× — keep one form for the new domain.
- `sitemap.xml`: 16 `<loc>` (lines 4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79), all `<lastmod>2026-07-09</lastmod>`; the 4 blog `<loc>` (64, 69, 74, 79) carry the Spanish slugs that the brief renames.
- `robots.txt:4` `Sitemap: https://serreswrapcenter.es/sitemap.xml`.
- `.htaccess`: Apache/Hostinger cache + MIME rules only (comments mention Hostinger at 14, 37); no domain, no redirects, no www/https rewrite. Keep on Hostinger; delete + add `.nojekyll` on GitHub Pages (brief).
- `_build/verify-seo.js`: PAGES list 11–19 hard-codes the Spanish blog slugs (17–18) and GA regex (45); BANNED claims list 21–24 is Spanish-only (`/10 años/`, `/medidor de brillo/`…) and will not catch the English equivalents once the base is EN — extend with EN patterns ("10 years", "gloss meter", "thickness gauge", "9H", "liquid glass").
- `_build/dict-tools.js`: assumes `[es, ca]` pairs (39, 50, 68, 79, 93, 6) — update for `[es]`-only or `{es}` shape.
- `_build/optimize-images.js:113-114` derives blog asset folders from `slug` → renaming blog slugs implies renaming `assets/blog/<slug>/` folders (and the 12 `og.jpg`/`cover.webp` refs) or keeping old folder names — decide before slug change.
- `_build/agg-report.json` (excluded from scans, but present in `_build/`): contains `Barcelona` ×125, `serreswrapcenter` ×4, `+34` ×18. It is a stale dictionary-merge report; if copied into the Miami tree it breaks the acceptance grep. Delete or add to the copy exclusion list.

---

## 10. Risks / surprises

1. **`_build/agg-report.json` will fail the acceptance grep** (125 × Barcelona, 18 × +34, 4 × domain). Not in the brief's exclusion list.
2. **No email, no legal pages, no GeoCoordinates, no parent Organization node exist** — four of the brief's Miami items are additions with no slot to replace; each needs an explicit placement decision.
3. **Service page `<title>` EN keys carry no city** (`SERRES — Paint Protection Film (PPF)` etc., i18n 385/463/523/577/639/678) while the ES values are the SEO titles with "Barcelona". Inverting the layer naively would ship city-less EN titles; the port must author new EN SEO titles (with Miami) as the inline text/keys and new ES values.
4. **One constant drives phone and WhatsApp** (`enhance.js:14`); prefilled WA messages are Spanish `href` attributes untouched by i18n, and `prices.html:519` builds a Spanish template around translated names (the known verify-seo false positive). EN/ES message switching needs a small mechanism, not a find-replace.
5. **JSON-LD business types are inconsistent** (AutoBodyShop / AutoRepair / LocalBusiness / AutoDetailing / Organization) and phone formats differ (E.164 vs spaced) — a straight replace preserves the inconsistency; decide whether to normalise.
6. **13 × `valueAddedTaxIncluded: true`** and 51 × "IVA incluido" — US pricing semantics (sales tax excluded) are the opposite; client must confirm the tax wording.
7. **Gallery captions/alt describe Barcelona shooting locations** (Collserola tower ×5, Catalan countryside/back road, snow/winter). Photos stay per brief, but `gallery.html:308, 383` and i18n 111/121 contain the literal word "Barcelona" and will be caught by the acceptance grep; rewording them risks stating the photos were taken in Miami. Needs a client decision ("shot at our Barcelona studio" vs neutral captions).
8. **Blog "market in Spain" price-range columns** (`cuanto-cuesta-ppf-coche` 221–239 table, `vinilar` 234 table header "Mercado en España", `limpieza` 219, `ppf-o-ceramico` 241) cannot be translated — they need real Miami market data or removal; and the DGT/ITV FAQ (vinilar 115–118/354–356) is a whole Q/A to replace while keeping JSON-LD ↔ visible parity.
9. **Visible review stats beyond the brief** ("4.9 Valoración media" tiles why-serres 337/396, "98% nos recomiendan" in why-serres meta and detailing FAQ, "4,9" in two blog articles) are Barcelona review data the brief does not list — flag before shipping.
10. **`verify-seo.js` will go red immediately** (GA regex 45, Spanish slugs 17–18, Spanish-only BANNED list) — update it in the same pass, otherwise the verification step has no baseline.
11. **`serres-i18n.js` is 163 KB with 1,485 lines and 3-way arrays**; `dict-tools.js` and the `INV` builder (1174–1181) hard-code the pair shape. Dropping CA is a structural edit across every entry (the "prune second element" step), not a config flag.
12. Map iframe `pb=` string encodes the Barcelona place id (`0x2027f0d4ea2a70f1:0xc8f7c6ce9b2a429d`), coordinates and `es/es` UI locale — needs a freshly generated Miami embed, not a coordinate swap.

---

## 11. Master table — datum → Barcelona value → where → Miami source

| Datum | Barcelona value | Where (file:line) | Miami replacement source (DATOS DE MIAMI) | Notes |
|---|---|---|---|---|
| Phone (E.164) | `+34621244469` | JSON-LD `telephone` ×11 (§1.3); `tel:` ×8 (§1.2); `enhance.js:14` | Teléfono +1 | Also `enhance.js:18` runtime |
| Phone (display) | `+34 621 24 44 69` | `enhance.js:19`; index 848, 886; footers ×8; FAQ twins ×12; blog 371/388/389/402/387; JSON-LD prices 247, projects 218, why-serres 240; i18n 1064/1084/1100/1124/1146/1164 | Teléfono +1 (US display format) | Confirm display format |
| WhatsApp number | `34621244469` | `wa.me/` ×15 (§0) + `enhance.js:14/16` | WhatsApp +1 → `wa.me/1XXXXXXXXXX` | May differ from phone |
| WA prefilled texts (9 distinct) | Spanish "Hola SERRES, …" | §1.4 | — (author EN base + ES) | Needs lang-aware href |
| Email | none | — | Email | New slot (contact block / footer / JSON-LD) |
| Street | `Av. Can Fatjó dels Aurons, 15` | §2.1 (14 JSON-LD + 9 visible + 6 i18n keys) | Dirección (calle) | Two spellings (comma / no comma) |
| ZIP | `08174` | §2.2 (22) | ZIP | |
| City | `Sant Cugat del Vallès` | 206 occ. (§2.3–2.6) | Ciudad | No standalone dictionary key — place name is passed through untouched today |
| Region | `Barcelona` (`addressRegion`) | 14 JSON-LD blocks | `FL` | |
| Country | `ES` / `España` / `Spain` | 14 JSON-LD; index 885; i18n 97 | `US` / "FL, USA" | |
| areaServed | `Barcelona` (+ `Sant Cugat del Vallès`) | prices 245, projects 216, 6 services (§2.3) | Miami / Miami-Dade (client) | |
| Lat/long | 41.49532481891128, 2.0633841973199507 (iframe only) | index 858 | Lat/long → new `geo` GeoCoordinates in AutoBodyShop + new embed | No GeoCoordinates exist today |
| Google Maps embed | pb string (§3) | index 858 | New embed from Miami place | Locale `!1ses!2ses` → `!1sen!2sus` |
| Google Maps CID | `https://maps.google.com/?cid=14481261717501919901` | index 622 (`hasMap`) | Google Maps CID/place URL | |
| Google Maps search link | `maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s` | index 892 | Place URL / query with Miami name | |
| Opening hours | Mon–Fri 09–19, Sat 10–14; "Lun–Sáb · Con cita previa"; "lunes a sábado" | §6 | Horario | 3 JSON-LD + key 91 + key 1049 + 6 FAQ keys |
| priceRange | `€€€` / `€€` | index 620, why-serres 241 | `$$$` | |
| priceCurrency | `EUR` ×38 | §0 / Appendix A | `USD` | Prices themselves: tabla USD (not this key) |
| VAT flag | `valueAddedTaxIncluded: true` ×13; "IVA incluido" ×51; "VAT included" keys ×11 | §7 | client tax wording | |
| Currency footer | `Precios orientativos en EUR, IVA incluido` | prices 348; i18n 243–245 | USD wording | |
| Domain | `https://serreswrapcenter.es` ×190 | §9 | Dominio | Keep in `sameAs` only |
| Sitemap | 16 loc, lastmod 2026-07-09 | sitemap.xml | Dominio + today + new blog slugs | |
| robots | `Sitemap: …/sitemap.xml` | robots.txt:4 | Dominio | |
| GA4 | `G-1K6FYZ99GN` ×34 | §5.1 | GA4 ID nuevo | incl. verify-seo.js:45 |
| `<html lang>` | `es` ×16 (+ runtime 1338) | line 2 each page | `en` | |
| `og:locale` | `es_ES` ×16 | line 11 / blog 16–20 | `en_US` | |
| `inLanguage` | `es` ×3, `es-ES` ×2 | §4 | `en-US` | |
| Instagram | `instagram.com/serres.wrap.center/` ×7 | index 850, 889; enhance.js 17; sameAs prices 253, projects 221, why-serres 264, index 644 | confirm same account | Not in DATOS list |
| aggregateRating | 4.9 / 50 ×3 | §8 | delete | |
| Testimonials | 5 Barcelona reviewers | why-serres 407, 442–452 | delete / client reviews | |
| Review stats in copy | 4.9 avg, 98% recommend | why-serres 337, 396, meta 7/13/20; detailing 472/556; blog vinilar 334, ppf-o-ceramico 328 | confirm | Beyond brief |
| ITV/DGT FAQ | Spanish registry law Q/A | vinilar 115–118, 354–356 | Florida equivalent (confirm) | |
| "Mercado en España" ranges | Spanish market prices | ppf-coche 95/199/221–239/339; vinilar 227/234/289; limpieza 219; ppf-o-ceramico 241 | Miami market data or drop | Never convert |
| Gallery location captions | Barcelona rooftop, Collserola, Catalan countryside, snow | gallery 308, 368–371, 383, 394–400, 414, 421, 471; i18n 111, 121–133, 148–151, 174–176 | client decision | Honesty vs grep |
| Legal pages | none | — | US/FL privacy + terms | Create or TODO |

---

## Appendix A — JSON-LD blocks, verbatim (42)

(Extracted with `sed -n` from the source; line ranges as in §4.)


### A.1 — `index.html` lines 612–647

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoBodyShop",
  "name": "SERRES Wrap Center",
  "url": "https://serreswrapcenter.es",
  "telephone": "+34621244469",
  "image": "https://serreswrapcenter.es/apple-touch-icon.png",
  "priceRange": "€€€",
  "description": "Taller de PPF, Car Wrap, Ceramic Coating, pulido por etapas, detailing y body kits en Sant Cugat del Vallès (Barcelona). Films de varias marcas profesionales y trabajo con cita previa.",
  "hasMap": "https://maps.google.com/?cid=14481261717501919901",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Can Fatjó dels Aurons, 15",
    "postalCode": "08174",
    "addressLocality": "Sant Cugat del Vallès",
    "addressRegion": "Barcelona",
    "addressCountry": "ES"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "14:00"
    }
  ],
  "sameAs": ["https://www.instagram.com/serres.wrap.center/"]
}
</script>
```

### A.2 — `index.html` lines 648–679

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta instalar PPF en Barcelona?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El pack frontal de PPF parte de 890 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp con el modelo de tu coche y te pasamos un presupuesto exacto."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tarda un Car Wrap completo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un cambio de color completo requiere varios días de taller: desmontamos piezas, forramos panel a panel y revisamos cada borde antes de la entrega. Al reservar tu cita te confirmamos el plazo exacto para tu coche."
      }
    },
    {
      "@type": "Question",
      "name": "¿Dónde está el taller de SERRES?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Estamos en Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). Trabajamos con cita previa: de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00."
      }
    }
  ]
}
</script>
```

### A.3 — `pages/prices.html` lines 238–260

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Service",
 "name":"Precios de PPF, Car Wrap, Ceramic Coating y Detailing",
 "serviceType":"Protección y personalización de vehículos (PPF, Car Wrap, Ceramic Coating, detailing, body kits)",
 "description":"Precios orientativos con IVA incluido de todos los servicios de SERRES Wrap Center en Sant Cugat del Vallès (Barcelona).",
 "url":"https://serreswrapcenter.es/pages/prices.html",
 "image":"https://serreswrapcenter.es/assets/og/prices.jpg",
 "areaServed":"Barcelona",
 "provider":{"@type":"LocalBusiness","name":"SERRES Wrap Center",
   "telephone":"+34 621 24 44 69",
   "url":"https://serreswrapcenter.es/",
   "address":{"@type":"PostalAddress","streetAddress":"Av. Can Fatjó dels Aurons, 15","postalCode":"08174","addressLocality":"Sant Cugat del Vallès","addressRegion":"Barcelona","addressCountry":"ES"},
   "openingHoursSpecification":[
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"19:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":"Saturday","opens":"10:00","closes":"14:00"}],
   "sameAs":["https://www.instagram.com/serres.wrap.center/","https://wa.me/34621244469"]},
 "hasOfferCatalog":{"@type":"OfferCatalog","name":"Servicios SERRES — precios de entrada","itemListElement":[
  {"@type":"Offer","name":"Car Wrap — cambio de color","description":"Desde 250 €, IVA incluido","price":"250","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/vinyl.html"},
  {"@type":"Offer","name":"PPF — film de protección de pintura","description":"Desde 890 €, IVA incluido","price":"890","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/ppf.html"},
  {"@type":"Offer","name":"Corrección + Ceramic Coating","description":"Desde 340 €, IVA incluido","price":"340","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/ceramic.html"},
  {"@type":"Offer","name":"Detailing","description":"Desde 35 €, IVA incluido","price":"35","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/detailing.html"},
  {"@type":"Offer","name":"Body kits","description":"Desde 450 €, IVA incluido","price":"450","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/body-kits.html"}]}}
</script>
```

### A.4 — `pages/prices.html` lines 261–265

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Inicio","item":"https://serreswrapcenter.es/"},
 {"@type":"ListItem","position":2,"name":"Precios","item":"https://serreswrapcenter.es/pages/prices.html"}]}
</script>
```

### A.5 — `pages/projects.html` lines 210–222

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Service",
 "name":"Exclusivo — proyecto de transformación completa de coches",
 "serviceType":"Transformación integral del vehículo (corrección, vinilo, PPF, cerámico, carrocería, interior)",
 "url":"https://serreswrapcenter.es/pages/projects.html",
 "image":"https://serreswrapcenter.es/assets/og/projects.jpg",
 "areaServed":"Barcelona",
 "provider":{"@type":"LocalBusiness","name":"SERRES Wrap Center",
   "telephone":"+34 621 24 44 69",
   "url":"https://serreswrapcenter.es/",
   "address":{"@type":"PostalAddress","streetAddress":"Av. Can Fatjó dels Aurons, 15","postalCode":"08174","addressLocality":"Sant Cugat del Vallès","addressRegion":"Barcelona","addressCountry":"ES"},
   "sameAs":["https://www.instagram.com/serres.wrap.center/","https://wa.me/34621244469"]}}
</script>
```

### A.6 — `pages/projects.html` lines 223–227

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Inicio","item":"https://serreswrapcenter.es/"},
 {"@type":"ListItem","position":2,"name":"Exclusivo","item":"https://serreswrapcenter.es/pages/projects.html"}]}
</script>
```

### A.7 — `pages/why-serres.html` lines 232–274

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "SERRES Wrap Center",
  "description": "Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap, Ceramic Coating, corrección de pintura y body kits.",
  "url": "https://serreswrapcenter.es/",
  "image": "https://serreswrapcenter.es/assets/og/why-serres.jpg",
  "telephone": "+34 621 24 44 69",
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Can Fatjó dels Aurons, 15",
    "addressLocality": "Sant Cugat del Vallès",
    "postalCode": "08174",
    "addressRegion": "Barcelona",
    "addressCountry": "ES"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "14:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/serres.wrap.center/",
    "https://wa.me/34621244469"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "50"
  }
}
</script>
```

### A.8 — `pages/why-serres.html` lines 275–294

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://serreswrapcenter.es/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Por qué SERRES",
      "item": "https://serreswrapcenter.es/pages/why-serres.html"
    }
  ]
}
</script>
```

### A.9 — `pages/gallery.html` lines 267–269

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ImageGallery","name":"Proyectos de SERRES — galería de trabajos","description":"Fotos reales de proyectos de PPF, Car Wrap, Ceramic Coating y detailing hechos en el taller de SERRES en Sant Cugat del Vallès (Barcelona).","url":"https://serreswrapcenter.es/pages/gallery.html","image":["https://serreswrapcenter.es/assets/gallery/rwb-front.jpg","https://serreswrapcenter.es/assets/gallery/m2-rooftop.webp","https://serreswrapcenter.es/assets/gallery/supra-villa.webp","https://serreswrapcenter.es/assets/gallery/e92-coast.webp","https://serreswrapcenter.es/assets/gallery/xm-front.webp","https://serreswrapcenter.es/assets/gallery/landrover-studio.jpg","https://serreswrapcenter.es/assets/gallery/ligier-front.webp","https://serreswrapcenter.es/assets/gallery/serie1-front.webp"],"publisher":{"@type":"LocalBusiness","name":"SERRES Wrap Center","url":"https://serreswrapcenter.es/"}}
</script>
```

### A.10 — `pages/gallery.html` lines 270–272

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Inicio","item":"https://serreswrapcenter.es/"},{"@type":"ListItem","position":2,"name":"Proyectos","item":"https://serreswrapcenter.es/pages/gallery.html"}]}
</script>
```

### A.11 — `blog/index.html` lines 31–40

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://serreswrapcenter.es/blog/index.html",
  "name": "Blog de SERRES Wrap Center",
  "inLanguage": "es",
  "publisher": { "@type": "Organization", "name": "SERRES Wrap Center", "url": "https://serreswrapcenter.es" }
}
</script>
```

### A.12 — `blog/index.html` lines 41–50

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Blog" }
  ]
}
</script>
```

### A.13 — `blog/cuanto-cuesta-ppf-coche.html` lines 42–71

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://serreswrapcenter.es/blog/cuanto-cuesta-ppf-coche.html#article",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://serreswrapcenter.es/blog/cuanto-cuesta-ppf-coche.html" },
  "headline": "¿Cuánto cuesta el PPF para tu coche? Precios reales 2026",
  "description": "PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía.",
  "image": "https://serreswrapcenter.es/assets/blog/cuanto-cuesta-ppf-coche/og.jpg",
  "inLanguage": "es",
  "datePublished": "2026-07-09",
  "dateModified": "2026-07-09",
  "author": { "@type": "Organization", "name": "Equipo SERRES", "url": "https://serreswrapcenter.es/" },
  "publisher": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es",
    "logo": { "@type": "ImageObject", "url": "https://serreswrapcenter.es/apple-touch-icon.png" },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "postalCode": "08174",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    },
    "telephone": "+34621244469"
  }
}
</script>
```

### A.14 — `blog/cuanto-cuesta-ppf-coche.html` lines 74–84

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://serreswrapcenter.es/blog/index.html" },
    { "@type": "ListItem", "position": 3, "name": "Cuánto cuesta el PPF" }
  ]
}
</script>
```

### A.15 — `blog/cuanto-cuesta-ppf-coche.html` lines 87–119

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta el PPF frontal de un coche?",
      "acceptedAnswer": { "@type": "Answer", "text": "En España, entre 900 € y 1.700 € el frontal parcial y hasta 2.500 € el frontal completo. Nuestra tarifa es de 890 € el frontal y 1.190 € el frontal completo, con IVA incluido, film de poliuretano autorregenerable y 3 años de garantía del fabricante." }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dura el PPF una vez instalado?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un film de primera marca bien instalado mantiene sus propiedades durante años de uso. El film que instalamos está cubierto por 3 años de garantía del fabricante contra amarilleo, grietas y delaminación. Los films genéricos suelen degradarse a partir del segundo o tercer año." }
    },
    {
      "@type": "Question",
      "name": "¿El PPF daña la pintura al retirarlo?",
      "acceptedAnswer": { "@type": "Answer", "text": "No, si el film es de calidad y lo retira un profesional con calor controlado. La pintura queda como estaba el día de la instalación, que es precisamente el objetivo. El riesgo existe con films económicos muy envejecidos o sobre piezas repintadas con mala adherencia." }
    },
    {
      "@type": "Question",
      "name": "¿Qué es mejor, PPF o tratamiento cerámico?",
      "acceptedAnswer": { "@type": "Answer", "text": "Cumplen funciones distintas. El Ceramic Coating SiO₂ (de 340 € a 890 € en nuestro caso, con corrección de pintura incluida) aporta brillo, hidrofobicidad y facilidad de lavado, pero no detiene un impacto de gravilla. El PPF protege físicamente la pintura. La combinación habitual en coches premium: PPF en el frontal y Ceramic Coating en el resto, o aplicado sobre el propio film." }
    },
    {
      "@type": "Question",
      "name": "¿Se puede instalar PPF en un coche usado?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sí, siempre que la pintura esté en buen estado o se corrija antes. Lo habitual es un pulido previo para eliminar arañazos superficiales, porque el film conserva la superficie tal cual está debajo. En pinturas con daños profundos o repintados de baja calidad conviene valorarlo pieza a pieza." }
    }
  ]
}
</script>
```

### A.16 — `blog/cuanto-cuesta-vinilar-un-coche.html` lines 40–76

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://serreswrapcenter.es/blog/cuanto-cuesta-vinilar-un-coche.html#article",
  "headline": "¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)",
  "description": "Vinilar un coche cuesta desde 250 € por piezas y de 1.200 a 3.500 € el cambio de color completo. Precios reales, factores y tabla comparativa 2026.",
  "image": "https://serreswrapcenter.es/assets/blog/cuanto-cuesta-vinilar-un-coche/og.jpg",
  "inLanguage": "es-ES",
  "datePublished": "2026-07-09",
  "dateModified": "2026-07-09",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://serreswrapcenter.es/blog/cuanto-cuesta-vinilar-un-coche.html"
  },
  "author": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "logo": { "@type": "ImageObject", "url": "https://serreswrapcenter.es/apple-touch-icon.png" },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "addressLocality": "Sant Cugat del Vallès",
      "postalCode": "08174",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    },
    "telephone": "+34621244469"
  }
}
</script>
```

### A.17 — `blog/cuanto-cuesta-vinilar-un-coche.html` lines 79–89

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://serreswrapcenter.es/blog/index.html" },
    { "@type": "ListItem", "position": 3, "name": "Cuánto cuesta vinilar un coche" }
  ]
}
</script>
```

### A.18 — `blog/cuanto-cuesta-vinilar-un-coche.html` lines 92–139

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto dura un vinilo de coche?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un vinilo de fundición 3M o Avery Dennison dura de 5 a 7 años en exterior con un mantenimiento normal. Los calandrados baratos aguantan 2 o 3 años antes de encoger o perder color. Aparcar a cubierto y lavar a mano alargan la vida útil del film."
      }
    },
    {
      "@type": "Question",
      "name": "¿Vinilar el coche daña la pintura?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, siempre que la pintura sea original o un repintado bien curado. El adhesivo está diseñado para retirarse sin dejar residuo y el film protege la laca de rayado leve y radiación UV. Sobre repintados de mala calidad sí existe riesgo de arrastre, y un taller serio lo detecta antes de empezar."
      }
    },
    {
      "@type": "Question",
      "name": "¿Hay que avisar a la DGT si vinilo el coche de otro color?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El color no consta en la ficha técnica del vehículo en España, así que el cambio no exige homologación ni ITV extraordinaria. Sí conviene comunicarlo a tu aseguradora para que la póliza refleje el aspecto real del coche. Es un trámite de minutos y evita problemas en un parte."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto se tarda en vinilar un coche entero?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entre 3 y 5 días laborables en un turismo, según desmontaje y complejidad de la carrocería. Un vinilado parcial de techo o acentos se resuelve en una jornada. Desconfía de quien promete un integral en un día: las prisas se pagan en cantos y burbujas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Se puede lavar un coche vinilado en el túnel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mejor evitarlo: los rodillos y cepillos castigan los cantos del film. Lo recomendable es lavado a mano con champú de pH neutro o lanza a presión a más de 30 cm del panel. Con esa rutina, el vinilo conserva el acabado durante toda su vida útil."
      }
    }
  ]
}
</script>
```

### A.19 — `blog/limpieza-tapiceria-coche-precio.html` lines 40–76

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://serreswrapcenter.es/blog/limpieza-tapiceria-coche-precio.html#article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://serreswrapcenter.es/blog/limpieza-tapiceria-coche-precio.html"
  },
  "headline": "Limpieza de tapicería del coche: precios y qué incluye",
  "description": "Cuánto cuesta limpiar la tapicería del coche: de 35 € a 490 € según el nivel. Qué incluye cada servicio, tabla de precios real y cómo quitar manchas.",
  "image": "https://serreswrapcenter.es/assets/blog/limpieza-tapiceria-coche-precio/og.jpg",
  "inLanguage": "es-ES",
  "datePublished": "2026-07-09",
  "dateModified": "2026-07-09",
  "author": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "logo": { "@type": "ImageObject", "url": "https://serreswrapcenter.es/apple-touch-icon.png" },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "addressLocality": "Sant Cugat del Vallès",
      "postalCode": "08174",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    },
    "telephone": "+34621244469"
  }
}
</script>
```

### A.20 — `blog/limpieza-tapiceria-coche-precio.html` lines 79–89

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://serreswrapcenter.es/blog/index.html" },
    { "@type": "ListItem", "position": 3, "name": "Limpieza de tapicería del coche" }
  ]
}
</script>
```

### A.21 — `blog/limpieza-tapiceria-coche-precio.html` lines 92–139

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta limpiar la tapicería de un coche completo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entre 70 € y 150 € en un servicio profesional con vapor e inyección-extracción. Los servicios básicos de mantenimiento parten de 30-40 €. Un detallado interior premium con tratamiento de cuero y desinfección se mueve entre 300 € y 500 €."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tarda una limpieza de tapicería profesional?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Una limpieza profunda lleva entre 3 y 5 horas de trabajo, más 2-4 horas de secado según el clima. Un detallado completo puede requerir jornada entera. Los servicios exprés de menos de una hora solo cubren limpieza superficial."
      }
    },
    {
      "@type": "Question",
      "name": "¿La limpieza a vapor daña los asientos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, si se aplica con el equipo y la técnica correctos. El vapor controlado limpia y desinfecta sin empapar la espuma, y es más respetuoso que los métodos con exceso de agua. El riesgo aparece con máquinas domésticas sin control de humedad, sobre todo en el techo interior."
      }
    },
    {
      "@type": "Question",
      "name": "¿Se pueden quitar todas las manchas de los asientos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las manchas recientes se eliminan casi siempre. Las antiguas fijadas por calor y tiempo se atenúan en la mayoría de los casos, pero algunas —tintes, quemaduras químicas, lejía— dejan marca permanente. Un profesional te dirá antes de empezar qué resultado es realista."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cada cuánto conviene limpiar la tapicería del coche?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Una limpieza profunda una o dos veces al año es suficiente para un uso normal. Con niños, mascotas o fumadores, cada 3-4 meses. El mantenimiento básico mensual alarga el efecto de la limpieza profunda y sale más barato que recuperar un interior degradado."
      }
    }
  ]
}
</script>
```

### A.22 — `blog/ppf-o-ceramico-que-elegir.html` lines 50–79

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://serreswrapcenter.es/blog/ppf-o-ceramico-que-elegir.html#article",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://serreswrapcenter.es/blog/ppf-o-ceramico-que-elegir.html" },
  "headline": "PPF o cerámico: ¿qué elegir según tu coche y tu presupuesto?",
  "description": "PPF desde 890 € o cerámico desde 340 €: compara protección, duración y precio real con datos de un taller de Sant Cugat y decide en cinco minutos.",
  "image": "https://serreswrapcenter.es/assets/blog/ppf-o-ceramico-que-elegir/og.jpg",
  "inLanguage": "es",
  "datePublished": "2026-07-09",
  "dateModified": "2026-07-09",
  "author": { "@type": "Organization", "name": "Equipo SERRES", "url": "https://serreswrapcenter.es/" },
  "publisher": {
    "@type": "Organization",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es",
    "logo": { "@type": "ImageObject", "url": "https://serreswrapcenter.es/apple-touch-icon.png" },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "postalCode": "08174",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    },
    "telephone": "+34621244469"
  }
}
</script>
```

### A.23 — `blog/ppf-o-ceramico-que-elegir.html` lines 82–92

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://serreswrapcenter.es/blog/index.html" },
    { "@type": "ListItem", "position": 3, "name": "PPF o cerámico: ¿qué elegir?" }
  ]
}
</script>
```

### A.24 — `blog/ppf-o-ceramico-que-elegir.html` lines 95–127

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Se puede aplicar cerámico encima del PPF?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sí, y es la combinación más completa. El cerámico aporta al PPF la hidrofobia y la facilidad de lavado que la lámina no tiene de serie. Es el estándar en coches de alta gama y de colección." }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dura el PPF y cuánto el cerámico?",
      "acceptedAnswer": { "@type": "Answer", "text": "Un PPF de calidad bien mantenido protege durante años; en SERRES trabajamos con films de 3M (serie 2080), Avery Dennison e Inozetek con 3 años de garantía del fabricante. El Ceramic Coating dura de 2 a 5 años según el pack y el mantenimiento. Lavar sin rodillos y sin químicos agresivos alarga la vida de ambos." }
    },
    {
      "@type": "Question",
      "name": "¿El cerámico protege contra piedras y arañazos?",
      "acceptedAnswer": { "@type": "Answer", "text": "No contra impactos. Su capa de 1-2 micras resiste microarañazos leves de lavado, pero una piedra en autopista o un roce de llave llegan a la pintura. Para daño físico, la única protección efectiva es el PPF." }
    },
    {
      "@type": "Question",
      "name": "¿Merece la pena poner PPF solo en el frontal?",
      "acceptedAnswer": { "@type": "Answer", "text": "En la mayoría de los casos, sí. Capó, paragolpes, aletas y retrovisores concentran la gran mayoría de los impactos de gravilla. Por 890 € proteges la zona crítica y dejas el resto para un cerámico si buscas estética." }
    },
    {
      "@type": "Question",
      "name": "¿El PPF daña la pintura al retirarlo?",
      "acceptedAnswer": { "@type": "Answer", "text": "No, si la instalación y la retirada las hace un profesional. La lámina se despega dejando el barniz original intacto, sin restos de adhesivo. Es precisamente su ventaja en leasing y reventa: debajo, la pintura sigue como el día que se protegió." }
    }
  ]
}
</script>
```

### A.25 — `services/ppf.html` lines 299–371

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://serreswrapcenter.es/services/ppf.html#service",
  "name": "Instalación de PPF (lámina de protección de pintura) en Barcelona",
  "serviceType": "Paint Protection Film (PPF)",
  "url": "https://serreswrapcenter.es/services/ppf.html",
  "description": "Instalación de film de protección de pintura (PPF) autorregenerable de varias marcas profesionales con 3 años de garantía del fabricante. Packs frontal, frontal completo y carrocería completa en nuestro taller de Sant Cugat del Vallès, Barcelona. Más de 50 colores de PPF.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "telephone": "+34621244469",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "postalCode": "08174",
      "addressCountry": "ES"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "PPF frontal",
      "price": "890",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "890",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/ppf.html"
    },
    {
      "@type": "Offer",
      "name": "PPF frontal completo",
      "price": "1190",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "1190",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/ppf.html"
    },
    {
      "@type": "Offer",
      "name": "PPF carrocería completa",
      "price": "2390",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "2390",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/ppf.html"
    }
  ]
}
</script>
```

### A.26 — `services/ppf.html` lines 372–427

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta instalar PPF en Barcelona?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El pack frontal parte de 890 €, el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende del modelo y del estado de la pintura, por eso confirmamos presupuesto cerrado tras ver el coche o fotos por WhatsApp."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dura el PPF y qué garantía tiene?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos con film autorregenerable de varias marcas profesionales con 3 años de garantía del fabricante contra amarilleo, grietas y delaminación. Con lavados correctos, el film mantiene su transparencia durante toda su vida útil y se retira sin dañar la pintura original."
      }
    },
    {
      "@type": "Question",
      "name": "¿El PPF se autorregenera de verdad?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. La capa superior del film es autorregenerable: las micro-rayaduras de lavado y los roces leves desaparecen con el calor del sol o agua templada. Los impactos de gravilla quedan absorbidos por el espesor del film sin llegar a la pintura."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo es el proceso de instalación?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Descontaminación y corrección de la pintura, corte del patrón específico de tu modelo, aplicación en cabina limpia y revisión panel a panel bajo iluminación hexagonal controlada. El proceso se realiza en nuestro taller de Sant Cugat del Vallès y, si algo no cumple nuestro estándar, se repite antes de la entrega."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuántos días tarda y cómo pido cita?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un frontal se entrega en 1-2 días laborables; la carrocería completa, en 3-5 días. Trabajamos con cita previa de lunes a sábado: llama o escribe por WhatsApp al +34 621 24 44 69 y te confirmamos fecha y presupuesto en el mismo día."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es mejor, PPF o tratamiento cerámico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Son cosas distintas: el PPF protege físicamente contra impactos de piedras y arañazos; el Ceramic Coating SiO₂ (desde 340 €) aporta brillo, hidrofobia y facilidad de lavado. La combinación más completa es PPF en las zonas de impacto y Ceramic Coating en el resto, y podemos presupuestar ambos juntos."
      }
    }
  ]
}
</script>
```

### A.27 — `services/ppf.html` lines 428–438

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://serreswrapcenter.es/#services" },
    { "@type": "ListItem", "position": 3, "name": "PPF", "item": "https://serreswrapcenter.es/services/ppf.html" }
  ]
}
</script>
```

### A.28 — `services/vinyl.html` lines 332–342

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://serreswrapcenter.es/#services" },
    { "@type": "ListItem", "position": 3, "name": "Car Wrap", "item": "https://serreswrapcenter.es/services/vinyl.html" }
  ]
}
</script>
```

### A.29 — `services/vinyl.html` lines 343–413

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://serreswrapcenter.es/services/vinyl.html#service",
  "name": "Car Wrap — Vinilado de coches (car wrapping)",
  "serviceType": "Car wrapping — cambio de color con films 3M 2080, Avery Dennison e Inozetek",
  "url": "https://serreswrapcenter.es/services/vinyl.html",
  "image": "https://serreswrapcenter.es/assets/og/vinyl.jpg",
  "description": "Cambio de color total y parcial con films 3M 2080, Avery Dennison e Inozetek: más de 150 colores y acabados mate, satinado, brillo, metalizado y colour-flip. Instalación con termosellado panel a panel en nuestro taller de Sant Cugat del Vallès.",
  "provider": {
    "@type": "AutoRepair",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "telephone": "+34621244469",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons 15",
      "postalCode": "08174",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Acentos en vinilo (techo, retrovisores, pilares)",
      "price": "250",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "250",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "250"
      }
    },
    {
      "@type": "Offer",
      "name": "Cambio de color completo",
      "price": "1490",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "1490",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "1490"
      }
    },
    {
      "@type": "Offer",
      "name": "Cambio de color Signature (desmontaje ampliado)",
      "price": "1990",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "1990",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "1990"
      }
    }
  ]
}
</script>
```

### A.30 — `services/vinyl.html` lines 414–469

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta vinilar un coche completo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El cambio de color completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desde 1.990 €. El precio final depende del tamaño del vehículo, el film elegido y el nivel de desmontaje. Tras una inspección de 20 minutos te damos un presupuesto cerrado."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuántos días tarda un cambio de color completo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un cambio de color de carrocería completa requiere entre 5 y 7 días laborables: desmontaje de piezas, descontaminación, aplicación panel a panel y termosellado de bordes. Los trabajos parciales (techo, acentos) se entregan en 1 o 2 días. Te confirmamos la fecha de entrega antes de empezar."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dura el vinilo y qué garantía tiene?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los films 3M, Avery Dennison e Inozetek que instalamos duran entre 5 y 7 años en exterior con un mantenimiento normal, y el fabricante los respalda con su garantía oficial. Además garantizamos por escrito nuestra instalación: bordes, uniones y ausencia de levantamientos. Todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès."
      }
    },
    {
      "@type": "Question",
      "name": "¿El vinilo daña la pintura original?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Sobre una pintura de fábrica en buen estado, el vinilo la protege de rayos UV, roces leves y desgaste, y se retira sin dejar residuos. El proceso es totalmente reversible: al quitar el film, la pintura original queda intacta y conservada."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo es el proceso, desde el presupuesto hasta la entrega?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Primero eliges color y acabado entre más de 150 colores de nuestra paleta; después inspeccionamos el vehículo y cerramos presupuesto y fecha. En taller: lavado y descontaminación, desmontaje de piezas, aplicación del film panel a panel y termosellado. En la entrega revisamos juntos cada borde y te explicamos el cuidado de los primeros 15 días."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo pido cita y dónde estáis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minutos del centro de Barcelona. Escríbenos por WhatsApp o llama al +34 621 24 44 69 y te confirmamos día y presupuesto orientativo en la misma conversación."
      }
    }
  ]
}
</script>
```

### A.31 — `services/ceramic.html` lines 239–289

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Tratamiento cerámico para coche en Barcelona",
  "serviceType": "Recubrimiento cerámico SiO2 (Ceramic Coating)",
  "url": "https://serreswrapcenter.es/services/ceramic.html",
  "description": "Corrección de pintura y tratamiento Ceramic Coating SiO2 con hasta 5 años de protección según el pack. Revisión panel a panel bajo iluminación hexagonal controlada antes de la entrega. Packs desde 340 € IVA incluido.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "telephone": "+34621244469",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "postalCode": "08174",
      "addressCountry": "ES"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Cerámico Essential",
      "price": "340",
      "priceCurrency": "EUR",
      "description": "Pulido de una etapa y una capa de Ceramic Coating SiO2. Durabilidad estimada de 2 años. Desde 340 € IVA incluido."
    },
    {
      "@type": "Offer",
      "name": "Cerámico Signature",
      "price": "590",
      "priceCurrency": "EUR",
      "description": "Corrección de dos etapas, doble capa cerámica y tratamiento antilluvia en cristales. Durabilidad estimada de 3 años. Desde 590 € IVA incluido."
    },
    {
      "@type": "Offer",
      "name": "Cerámico Concours",
      "price": "890",
      "priceCurrency": "EUR",
      "description": "Corrección completa, capas cerámicas adicionales y protección interior. Durabilidad estimada de 5 años. Desde 890 € IVA incluido."
    }
  ]
}
</script>
```

### A.32 — `services/ceramic.html` lines 290–345

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta un tratamiento cerámico en SERRES?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. El precio final depende del tamaño del vehículo y del estado de la pintura, que valoramos en una inspección previa gratuita."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué incluye cada pack cerámico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Todos los packs incluyen descontaminación, corrección de pintura a máquina y Ceramic Coating SiO2. Essential aplica un pulido de una etapa y una capa; Signature añade corrección de dos etapas, doble capa y tratamiento antilluvia en cristales; Concours es la corrección completa con capas adicionales y protección interior."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dura el tratamiento en el coche?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hasta 5 años de protección según el pack y el mantenimiento: 2 años en Essential, 3 en Signature y 5 en Concours. Antes de la entrega revisamos el coche panel a panel bajo iluminación hexagonal controlada, y te damos una pauta de lavado para conservar el efecto hidrófobo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuántos días necesita el coche en el taller?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entre 1 y 4 días laborables según el pack: la corrección de pintura marca el ritmo y el recubrimiento necesita un curado controlado de 24 horas en box sin polvo. Te confirmamos el plazo exacto al reservar."
      }
    },
    {
      "@type": "Question",
      "name": "¿El cerámico elimina los arañazos existentes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los micro-arañazos y hologramas se eliminan en la fase de corrección de pintura, incluida en todos los packs. El recubrimiento después sella esa base corregida; por eso nunca aplicamos cerámica sobre pintura sin preparar."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo reservo cita?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Con cita previa de lunes a sábado en nuestro taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escríbenos por WhatsApp o llama al +34 621 24 44 69 y te damos presupuesto cerrado en el día."
      }
    }
  ]
}
</script>
```

### A.33 — `services/ceramic.html` lines 346–356

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://serreswrapcenter.es/index.html#services" },
    { "@type": "ListItem", "position": 3, "name": "Ceramic Coating", "item": "https://serreswrapcenter.es/services/ceramic.html" }
  ]
}
</script>
```

### A.34 — `services/paint-correction.html` lines 293–303

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://serreswrapcenter.es/#services" },
    { "@type": "ListItem", "position": 3, "name": "Pulido de coche", "item": "https://serreswrapcenter.es/services/paint-correction.html" }
  ]
}
</script>
```

### A.35 — `services/paint-correction.html` lines 304–379

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://serreswrapcenter.es/services/paint-correction.html#service",
  "name": "Pulido y corrección de pintura de coche",
  "serviceType": "Corrección de pintura y Ceramic Coating",
  "description": "Pulido multietapa a máquina que elimina arañazos, remolinos y hologramas, con sellado Ceramic Coating SiO₂ y revisión panel a panel bajo iluminación hexagonal controlada antes de la entrega.",
  "url": "https://serreswrapcenter.es/services/paint-correction.html",
  "provider": {
    "@type": "AutoBodyShop",
    "name": "SERRES Wrap Center",
    "telephone": "+34621244469",
    "url": "https://serreswrapcenter.es/",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons, 15",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "postalCode": "08174",
      "addressCountry": "ES"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50",
      "bestRating": "5"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Corrección + Ceramic Coating Essential",
      "price": "340",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "340",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Corrección + Ceramic Coating Signature",
      "price": "590",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "590",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Corrección + Ceramic Coating Concours",
      "price": "890",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "890",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock"
    }
  ]
}
</script>
```

### A.36 — `services/paint-correction.html` lines 380–435

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta un pulido de coche en Barcelona?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En SERRES Wrap Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 €. El precio exacto depende del estado de la pintura: lo confirmamos en la inspección inicial, panel a panel, antes de empezar."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo tarda la corrección de pintura?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un Essential se completa en una o dos jornadas; una corrección multietapa Signature o Concours requiere de 2 a 4 días según el tamaño del coche y la dureza del barniz. Trabajamos con cita previa de lunes a sábado y te damos fecha de entrega cerrada antes de empezar."
      }
    },
    {
      "@type": "Question",
      "name": "¿El pulido elimina todos los arañazos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eliminamos por completo remolinos, hologramas y arañazos superficiales que no atraviesan el barniz; los más profundos se atenúan hasta hacerlos casi invisibles. Antes de pulir evaluamos el estado del barniz panel a panel para retirar solo el material necesario y no comprometerlo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo es el proceso y cómo sé que el resultado es real?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos en tres etapas: corte para eliminar los defectos, refinado y acabado final. Revisamos el coche panel a panel bajo iluminación hexagonal controlada y, si algo no cumple nuestro estándar, se repite antes de la entrega. Todo se hace en nuestro taller de Sant Cugat del Vallès."
      }
    },
    {
      "@type": "Question",
      "name": "¿El resultado tiene garantía? ¿Cuánto dura?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Ceramic Coating SiO₂ protege la pintura corregida hasta 5 años según el pack elegido y el mantenimiento. Si quieres blindar el resultado frente a nuevos arañazos, el PPF autorregenerable (desde 890 € el frontal) incluye 3 años de garantía del film."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo reservo cita y necesito dejar el coche todo el día?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Escríbenos por WhatsApp al +34 621 24 44 69 o llámanos y te damos cita de lunes a sábado. Estamos en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Para correcciones de más de un día podemos coordinar la recogida y entrega contigo."
      }
    }
  ]
}
</script>
```

### A.37 — `services/detailing.html` lines 286–292

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Inicio","item":"https://serreswrapcenter.es/"},
  {"@type":"ListItem","position":2,"name":"Servicios","item":"https://serreswrapcenter.es/#services"},
  {"@type":"ListItem","position":3,"name":"Detailing","item":"https://serreswrapcenter.es/services/detailing.html"}
]}
</script>
```

### A.38 — `services/detailing.html` lines 514–569

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta un detailing completo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo por dentro y por fuera — desde 490 €. El precio exacto depende del tamaño del vehículo y su estado; lo confirmamos antes de empezar, sin sorpresas al recoger."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo tarda el servicio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un Refresh se resuelve en 1–2 horas y un Deep Clean con vapor y extracción de tapicería suele ocupar media jornada. El Showroom Reset requiere una jornada completa, porque cada panel, costura y superficie se trata a mano. Te damos la hora de entrega al confirmar la cita y la cumplimos."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué incluye la limpieza interior a vapor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tratamos a vapor cada panel, rejilla y costura del habitáculo, extraemos alfombras y tapicería y limpiamos y acondicionamos el cuero con protección UV. El vapor desinfecta sin químicos agresivos y elimina olores en origen, no los enmascara. Está incluido desde el nivel Deep Clean (desde 150 €)."
      }
    },
    {
      "@type": "Question",
      "name": "¿Elimináis manchas de tapicería y cuero?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, es parte central del Deep Clean: extracción en tejidos y limpieza específica de cuero con acondicionado posterior. Eliminamos la gran mayoría de manchas de uso — café, marcas de asiento, suciedad incrustada — y te decimos con honestidad si alguna mancha antigua ha dañado la fibra y no saldrá al 100%."
      }
    },
    {
      "@type": "Question",
      "name": "¿El resultado está garantizado? ¿Cómo lo controláis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No trabajamos a ojo: revisamos el acabado panel a panel bajo iluminación hexagonal controlada, en nuestro taller de Sant Cugat del Vallès. Si algo no cumple nuestro estándar, se repite antes de la entrega. Es la razón de nuestra valoración de 4,9 y de que el 98% de los clientes nos recomiende."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo reservo cita y dónde estáis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos solo con cita previa, de lunes a sábado, en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escríbenos por WhatsApp o llama al +34 621 24 44 69 con el modelo y el estado del coche y te confirmamos precio cerrado y fecha, normalmente el mismo día."
      }
    }
  ]
}
</script>
```

### A.39 — `services/detailing.html` lines 570–645

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://serreswrapcenter.es/services/detailing.html#service",
  "name": "Detailing y limpieza interior de coche",
  "serviceType": "Car detailing",
  "description": "Detailing premium de interior y exterior: limpieza a vapor del habitáculo, extracción de tapicería, cuidado de cuero, descontaminación de pintura y protección. Tres niveles: Refresh, Deep Clean y Showroom Reset.",
  "url": "https://serreswrapcenter.es/services/detailing.html",
  "provider": {
    "@type": "AutoDetailing",
    "name": "SERRES Wrap Center",
    "url": "https://serreswrapcenter.es/",
    "telephone": "+34621244469",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons 15",
      "postalCode": "08174",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "addressCountry": "ES"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Detailing Refresh",
      "price": "35",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "35",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "35"
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/detailing.html"
    },
    {
      "@type": "Offer",
      "name": "Detailing Deep Clean — limpieza interior a vapor",
      "price": "150",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "150",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "150"
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/detailing.html"
    },
    {
      "@type": "Offer",
      "name": "Detailing Showroom Reset — interior y exterior completo",
      "price": "490",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "490",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": true,
        "minPrice": "490"
      },
      "availability": "https://schema.org/InStock",
      "url": "https://serreswrapcenter.es/services/detailing.html"
    }
  ]
}
</script>
```

### A.40 — `services/body-kits.html` lines 266–341

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Montaje de body kits",
  "serviceType": "Instalación y pintura de body kits, spoilers y widebody",
  "url": "https://serreswrapcenter.es/services/body-kits.html",
  "description": "Instalación, ajuste OEM y pintura de body kits, splitters, difusores y kits widebody en nuestro taller de Sant Cugat del Vallès. Desde 450 € IVA incluido.",
  "provider": {
    "@type": "AutoBodyShop",
    "name": "SERRES Wrap Center",
    "telephone": "+34621244469",
    "url": "https://serreswrapcenter.es",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Can Fatjó dels Aurons 15",
      "addressLocality": "Sant Cugat del Vallès",
      "addressRegion": "Barcelona",
      "postalCode": "08174",
      "addressCountry": "ES"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50",
      "bestRating": "5"
    }
  },
  "areaServed": [
    { "@type": "City", "name": "Sant Cugat del Vallès" },
    { "@type": "City", "name": "Barcelona" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tarifas de montaje de body kits",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Complementos aerodinámicos (splitter, difusor, spoiler)",
        "price": "450",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "450",
          "priceCurrency": "EUR",
          "valueAddedTaxIncluded": true
        }
      },
      {
        "@type": "Offer",
        "name": "Kit completo con ajuste y pintura",
        "price": "1490",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "1490",
          "priceCurrency": "EUR",
          "valueAddedTaxIncluded": true
        }
      },
      {
        "@type": "Offer",
        "name": "Transformación integral / widebody",
        "price": "3490",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "3490",
          "priceCurrency": "EUR",
          "valueAddedTaxIncluded": true
        }
      }
    ]
  }
}
</script>
```

### A.41 — `services/body-kits.html` lines 342–397

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta montar un body kit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los complementos aerodinámicos —splitter, difusor o spoiler— parten de 450 €. Un kit completo con ajuste y pintura empieza en 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. Tras ver el coche y el kit, cerramos un presupuesto fijo por escrito antes de empezar."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tarda la instalación?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un lip o difusor se monta en el mismo día. Un kit completo con preparación y pintura requiere entre 3 y 5 días laborables, y un proyecto widebody entre 1 y 3 semanas según el trabajo de carrocería. Te damos fecha de entrega concreta al confirmar el encargo."
      }
    },
    {
      "@type": "Question",
      "name": "¿El montaje tiene garantía?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. Garantizamos la fijación, el ajuste de holguras y el acabado de pintura del kit instalado. Todo el trabajo se hace en nuestro taller de Sant Cugat del Vallès, por lo que respondemos directamente de cada pieza montada. Las condiciones exactas dependen del material del kit y se detallan en el presupuesto."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo es el proceso de montaje?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Primero hacemos una prueba de ajuste en seco y corregimos holguras pieza a pieza hasta lograr tolerancias de nivel OEM. Después preparamos, imprimamos y pintamos el kit igualando el color con el vehículo, y lo fijamos con anclajes y adhesivos estructurales. Antes de la entrega revisamos el ajuste y el acabado panel a panel bajo iluminación hexagonal controlada; si algo no cumple nuestro estándar, se repite."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo traer mi propio kit o lo pedís vosotros?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ambas opciones. Podemos trabajar con un kit que ya tengas o buscarte fabricantes contrastados en fibra, ABS o poliuretano para tu modelo. Si lo traes tú, lo inspeccionamos antes de presupuestar para detectar deformaciones o defectos de molde."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo pido cita y dónde estáis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Escríbenos por WhatsApp o llama al +34 621 24 44 69 con el modelo y el kit que tienes en mente, y te damos valoración y fecha en el día."
      }
    }
  ]
}
</script>
```

### A.42 — `services/body-kits.html` lines 398–408

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://serreswrapcenter.es/" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://serreswrapcenter.es/index.html#services" },
    { "@type": "ListItem", "position": 3, "name": "Body Kits", "item": "https://serreswrapcenter.es/services/body-kits.html" }
  ]
}
</script>
```


---

## Appendix B — Classified line inventory (Node classifier output)

Classes: a-nap · b-copy (SEO/visible) · c-i18n (dictionary; `KEY:` = the English key on that line, `VAL:` = an es/ca value line of a multi-line entry) · d-meta (title/meta/link/html) · e-jsonld · f-alt / f-title-attr · g-analytics / g-config / g-other. Snippets are ~190 chars around the first match.

## Term counts per file (occurrences, not lines)

- **Barcelona** — total 278: index.html (19), pages/gallery.html (8), pages/prices.html (4), pages/projects.html (11), pages/why-serres.html (2), services/ppf.html (17), services/vinyl.html (12), services/ceramic.html (12), services/paint-correction.html (16), services/detailing.html (10), services/body-kits.html (11), blog/index.html (1), blog/cuanto-cuesta-ppf-coche.html (3), blog/cuanto-cuesta-vinilar-un-coche.html (2), blog/limpieza-tapiceria-coche-precio.html (2), blog/ppf-o-ceramico-que-elegir.html (3), assets/serres-i18n.js (144), assets/serres-enhance.js (1)
- **Sant Cugat** — total 206: index.html (11), pages/gallery.html (1), pages/prices.html (2), pages/projects.html (2), pages/why-serres.html (12), services/ppf.html (10), services/vinyl.html (13), services/ceramic.html (8), services/paint-correction.html (11), services/detailing.html (12), services/body-kits.html (13), blog/index.html (1), blog/cuanto-cuesta-ppf-coche.html (5), blog/cuanto-cuesta-vinilar-un-coche.html (5), blog/limpieza-tapiceria-coche-precio.html (3), blog/ppf-o-ceramico-que-elegir.html (6), assets/serres-i18n.js (90), assets/serres-enhance.js (1)
- **Vallès** — total 163: index.html (11), pages/gallery.html (1), pages/prices.html (2), pages/projects.html (2), pages/why-serres.html (8), services/ppf.html (7), services/vinyl.html (12), services/ceramic.html (5), services/paint-correction.html (8), services/detailing.html (8), services/body-kits.html (12), blog/cuanto-cuesta-ppf-coche.html (5), blog/cuanto-cuesta-vinilar-un-coche.html (5), blog/limpieza-tapiceria-coche-precio.html (3), blog/ppf-o-ceramico-que-elegir.html (3), assets/serres-i18n.js (70), assets/serres-enhance.js (1)
- **08174** — total 22: index.html (3), pages/prices.html (1), pages/projects.html (1), pages/why-serres.html (1), services/ppf.html (1), services/vinyl.html (1), services/ceramic.html (1), services/paint-correction.html (1), services/detailing.html (1), services/body-kits.html (1), blog/cuanto-cuesta-ppf-coche.html (2), blog/cuanto-cuesta-vinilar-un-coche.html (2), blog/limpieza-tapiceria-coche-precio.html (2), blog/ppf-o-ceramico-que-elegir.html (1), assets/serres-i18n.js (3)
- **Can Fatjó** — total 47: index.html (3), pages/prices.html (1), pages/projects.html (1), pages/why-serres.html (1), services/ppf.html (1), services/vinyl.html (3), services/ceramic.html (3), services/paint-correction.html (3), services/detailing.html (3), services/body-kits.html (3), blog/cuanto-cuesta-ppf-coche.html (2), blog/cuanto-cuesta-vinilar-un-coche.html (2), blog/limpieza-tapiceria-coche-precio.html (2), blog/ppf-o-ceramico-que-elegir.html (1), assets/serres-i18n.js (18)
- **+34** — total 69: index.html (7), pages/prices.html (1), pages/projects.html (2), pages/why-serres.html (2), services/ppf.html (4), services/vinyl.html (4), services/ceramic.html (4), services/paint-correction.html (4), services/detailing.html (4), services/body-kits.html (4), blog/cuanto-cuesta-ppf-coche.html (3), blog/cuanto-cuesta-vinilar-un-coche.html (3), blog/limpieza-tapiceria-coche-precio.html (3), blog/ppf-o-ceramico-que-elegir.html (4), assets/serres-i18n.js (18), assets/serres-enhance.js (2)
- **34621244469** — total 35: index.html (7), pages/prices.html (5), pages/projects.html (3), pages/why-serres.html (1), services/ppf.html (1), services/vinyl.html (1), services/ceramic.html (1), services/paint-correction.html (1), services/detailing.html (1), services/body-kits.html (1), blog/cuanto-cuesta-ppf-coche.html (3), blog/cuanto-cuesta-vinilar-un-coche.html (3), blog/limpieza-tapiceria-coche-precio.html (3), blog/ppf-o-ceramico-que-elegir.html (3), assets/serres-enhance.js (1)
- **621 24 44 69** — total 50: index.html (2), pages/prices.html (1), pages/projects.html (2), pages/why-serres.html (2), services/ppf.html (3), services/vinyl.html (3), services/ceramic.html (3), services/paint-correction.html (3), services/detailing.html (3), services/body-kits.html (3), blog/cuanto-cuesta-ppf-coche.html (1), blog/cuanto-cuesta-vinilar-un-coche.html (1), blog/limpieza-tapiceria-coche-precio.html (1), blog/ppf-o-ceramico-que-elegir.html (2), assets/serres-i18n.js (18), assets/serres-enhance.js (2)
- **Google Maps** — total 5: index.html (2), assets/serres-i18n.js (3)
- **maps.google** — total 1: index.html (1)
- **maps/search** — total 1: index.html (1)
- **maps/embed** — total 1: index.html (1)
- **hasMap** — total 1: index.html (1)
- **España** — total 15: index.html (1), blog/cuanto-cuesta-ppf-coche.html (4), blog/cuanto-cuesta-vinilar-un-coche.html (7), blog/limpieza-tapiceria-coche-precio.html (1), blog/ppf-o-ceramico-que-elegir.html (1), assets/serres-i18n.js (1)
- **Spain** — total 1: assets/serres-i18n.js (1)
- **ITV** — total 2: blog/cuanto-cuesta-vinilar-un-coche.html (2)
- **DGT** — total 2: blog/cuanto-cuesta-vinilar-un-coche.html (2)
- **IVA** — total 73: index.html (3), pages/prices.html (11), services/ppf.html (2), services/vinyl.html (2), services/ceramic.html (6), services/paint-correction.html (2), services/detailing.html (2), services/body-kits.html (3), blog/index.html (1), blog/cuanto-cuesta-ppf-coche.html (11), blog/cuanto-cuesta-vinilar-un-coche.html (5), blog/limpieza-tapiceria-coche-precio.html (2), blog/ppf-o-ceramico-que-elegir.html (1), assets/serres-i18n.js (22)
- **VAT** — total 11: assets/serres-i18n.js (11)
- **EUR** — total 42: pages/prices.html (6), services/ppf.html (6), services/vinyl.html (6), services/ceramic.html (3), services/paint-correction.html (6), services/detailing.html (6), services/body-kits.html (6), assets/serres-i18n.js (3)
- **€€** — total 2: index.html (1), pages/why-serres.html (1)
- **es_ES** — total 16: index.html (1), pages/gallery.html (1), pages/prices.html (1), pages/projects.html (1), pages/why-serres.html (1), services/ppf.html (1), services/vinyl.html (1), services/ceramic.html (1), services/paint-correction.html (1), services/detailing.html (1), services/body-kits.html (1), blog/index.html (1), blog/cuanto-cuesta-ppf-coche.html (1), blog/cuanto-cuesta-vinilar-un-coche.html (1), blog/limpieza-tapiceria-coche-precio.html (1), blog/ppf-o-ceramico-que-elegir.html (1)
- **es-ES** — total 2: blog/cuanto-cuesta-vinilar-un-coche.html (1), blog/limpieza-tapiceria-coche-precio.html (1)
- **lang="es"** — total 16: index.html (1), pages/gallery.html (1), pages/prices.html (1), pages/projects.html (1), pages/why-serres.html (1), services/ppf.html (1), services/vinyl.html (1), services/ceramic.html (1), services/paint-correction.html (1), services/detailing.html (1), services/body-kits.html (1), blog/index.html (1), blog/cuanto-cuesta-ppf-coche.html (1), blog/cuanto-cuesta-vinilar-un-coche.html (1), blog/limpieza-tapiceria-coche-precio.html (1), blog/ppf-o-ceramico-que-elegir.html (1)
- **Lun–Sáb** — total 2: index.html (1), assets/serres-i18n.js (1)
- **Mon–Sat** — total 1: assets/serres-i18n.js (1)
- **09:00** — total 8: index.html (3), pages/prices.html (1), pages/why-serres.html (1), assets/serres-i18n.js (3)
- **nieve** — total 4: pages/gallery.html (2), assets/serres-i18n.js (2)
- **Snow** — total 3: pages/gallery.html (1), assets/serres-i18n.js (2)
- **peaje** — total 1: blog/cuanto-cuesta-ppf-coche.html (1)
- **Equipo SERRES** — total 6: blog/cuanto-cuesta-ppf-coche.html (2), blog/cuanto-cuesta-vinilar-un-coche.html (1), blog/limpieza-tapiceria-coche-precio.html (1), blog/ppf-o-ceramico-que-elegir.html (2)
- **G-1K6FYZ99GN** — total 33: index.html (2), pages/gallery.html (2), pages/prices.html (2), pages/projects.html (2), pages/why-serres.html (2), services/ppf.html (2), services/vinyl.html (2), services/ceramic.html (2), services/paint-correction.html (2), services/detailing.html (2), services/body-kits.html (2), blog/index.html (2), blog/cuanto-cuesta-ppf-coche.html (2), blog/cuanto-cuesta-vinilar-un-coche.html (2), blog/limpieza-tapiceria-coche-precio.html (2), blog/ppf-o-ceramico-que-elegir.html (2), _build/verify-seo.js (1)
- **Collserola** — total 14: pages/gallery.html (5), assets/serres-i18n.js (9)
- **catalan** — total 4: pages/gallery.html (2), assets/serres-i18n.js (2)
- **catalán** — total 2: pages/gallery.html (1), assets/serres-i18n.js (1)
- **Catal** — total 6: pages/prices.html (2), services/body-kits.html (2), assets/serres-i18n.js (2)

## Class totals (unique lines)

- a-nap: 33
- b-copy: 108
- c-i18n: 131
- d-meta: 97
- e-jsonld: 173
- f-alt: 9
- f-title-attr: 1
- g-analytics: 32
- g-config: 1
- g-other: 1

## Line inventory

| file:line | class | terms | snippet |
|---|---|---|---|
| index.html:2 | d-meta | lang="es" | <html lang="es"> |
| index.html:6 | d-meta | Barcelona | <title>PPF, Car Wrap y Detailing en Barcelona \| SERRES</title> |
| index.html:7 | d-meta | Barcelona, Sant Cugat, Vallès | a name="description" content="Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp."> |
| index.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| index.html:12 | d-meta | Barcelona | <meta property="og:title" content="PPF, Car Wrap y Detailing en Barcelona \| SERRES"> |
| index.html:13 | d-meta | Barcelona, Sant Cugat, Vallès | rty="og:description" content="Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp."> |
| index.html:19 | d-meta | Barcelona | <meta name="twitter:title" content="PPF, Car Wrap y Detailing en Barcelona \| SERRES"> |
| index.html:20 | d-meta | Barcelona, Sant Cugat, Vallès | twitter:description" content="Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp."> |
| index.html:618 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| index.html:620 | e-jsonld | €€ | "priceRange": "€€€", |
| index.html:621 | e-jsonld | Barcelona, Sant Cugat, Vallès | ar Wrap, Ceramic Coating, pulido por etapas, detailing y body kits en Sant Cugat del Vallès (Barcelona). Films de varias marcas profesionales y trabajo con cita previa.", |
| index.html:622 | e-jsonld | maps.google, hasMap | "hasMap": "https://maps.google.com/?cid=14481261717501919901", |
| index.html:625 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| index.html:626 | e-jsonld | 08174 | "postalCode": "08174", |
| index.html:627 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| index.html:628 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| index.html:635 | e-jsonld | 09:00 | "opens": "09:00", |
| index.html:655 | e-jsonld | Barcelona | "name": "¿Cuánto cuesta instalar PPF en Barcelona?", |
| index.html:658 | e-jsonld | IVA | 0 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp con el modelo de tu coche y te pasamos un presupuesto exacto." |
| index.html:674 | e-jsonld | Barcelona, Sant Cugat, Vallès, 08174, Can Fatjó, 09:00 | "text": "Estamos en Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). Trabajamos con cita previa: de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00 |
| index.html:681 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| index.html:686 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| index.html:721 | b-copy | Barcelona | <span class="ln"><span class="h1-kw">PPF, Car Wrap y Detailing en Barcelona</span></span> |
| index.html:723 | b-copy | Barcelona, Sant Cugat, Vallès | p class="sub">PPF, Car Wrap a medida y detailing de nivel concours en Barcelona (Sant Cugat del Vallès), pensados para los coches alrededor de los que construyes tu vida. Un taller. Estándar |
| index.html:813 | b-copy | Barcelona | <span class="eyebrow">Taller en Barcelona</span> |
| index.html:814 | b-copy | Barcelona | <h2>PPF, Car Wrap y detailing en Barcelona</h2> |
| index.html:815 | b-copy | Barcelona, Sant Cugat, Vallès | <p>SERRES es un taller de PPF, Car Wrap y detailing en Sant Cugat del Vallès, a pocos minutos de Barcelona. Trabajamos con films de varias marcas profesionales: PPF con más de 50 colores |
| index.html:816 | b-copy | IVA | etapas, detailing y body kits, con precios orientativos publicados e IVA incluido.</p> |
| index.html:819 | b-copy | Barcelona | <summary>¿Cuánto cuesta instalar PPF en Barcelona?</summary> |
| index.html:820 | b-copy | IVA | 0 € y el coche completo de 2.390 €, con 3 años de garantía del film e IVA incluido. Escríbenos por WhatsApp con el modelo de tu coche y te pasamos un presupuesto exacto.</p> |
| index.html:828 | b-copy | Barcelona, Sant Cugat, Vallès, 08174, Can Fatjó, 09:00 | <p>Estamos en Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). Trabajamos con cita previa: de lunes a viernes de 09:00 a 19:00 y sábados de 10:00 a 14:00.</p> |
| index.html:843 | a-nap | +34, 34621244469 | <a href="tel:+34621244469" class="btn ghost">Llamar al taller</a> |
| index.html:846 | a-nap | Barcelona, Sant Cugat, Vallès | div class="cm-row"><span class="cm-k">Taller</span><span class="cm-v">Sant Cugat del Vallès, Barcelona</span></div> |
| index.html:847 | a-nap | Lun–Sáb | iv class="cm-row"><span class="cm-k">Horario</span><span class="cm-v">Lun–Sáb · Con cita previa</span></div> |
| index.html:848 | a-nap | +34, 34621244469, 621 24 44 69 | ow"><span class="cm-k">Teléfono</span><span class="cm-v"><a href="tel:+34621244469">+34 621 24 44 69</a></span></div> |
| index.html:853 | a-nap | 34621244469 | <a class="wa" href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche." target="_blank" rel="noopener" aria-label="WhatsApp">< |
| index.html:858 | f-title-attr | Google Maps, maps/embed | <iframe title="SERRES Wrap Center en Google Maps" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28430.735708274406!2d2.0633841973199507!3d41.49532481891128!2m3!1f0!2f0 |
| index.html:885 | a-nap | Barcelona, Sant Cugat, Vallès, España | <p>Sant Cugat del Vallès<br>Barcelona, España</p> |
| index.html:886 | a-nap | +34, 34621244469, 621 24 44 69 | <a href="tel:+34621244469">+34 621 24 44 69</a> |
| index.html:891 | a-nap | 34621244469 | <a href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche." target="_blank" rel="noopener">WhatsApp</a> |
| index.html:892 | a-nap | Google Maps, maps/search | <a href="https://www.google.com/maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s" target="_blank" rel="noopener">Google Maps</a> |
| index.html:904 | a-nap | +34, 34621244469 | <a href="tel:+34621244469" class="mobile-call" aria-label="Llamar a SERRES"> |
| pages/gallery.html:2 | d-meta | lang="es" | <html lang="es"> |
| pages/gallery.html:7 | d-meta | Barcelona | <meta name="description" content="Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover."> |
| pages/gallery.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| pages/gallery.html:13 | d-meta | Barcelona | <meta property="og:description" content="Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover."> |
| pages/gallery.html:20 | d-meta | Barcelona | <meta name="twitter:description" content="Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover."> |
| pages/gallery.html:268 | e-jsonld | Barcelona, Sant Cugat, Vallès | ar Wrap, Ceramic Coating y detailing hechos en el taller de SERRES en Sant Cugat del Vallès (Barcelona).","url":"https://serreswrapcenter.es/pages/gallery.html","image":["https://serreswrapc |
| pages/gallery.html:274 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| pages/gallery.html:279 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| pages/gallery.html:306 | b-copy | Barcelona | span class="h1-kw">Galería de trabajos — PPF, Car Wrap y Detailing en Barcelona</span></span> |
| pages/gallery.html:308 | b-copy | Barcelona | che tiene su propia sala en esta galería de trabajos. Fotografiado en Barcelona y alrededores — sin fotos de stock ni coches de alquiler. Elige un proyecto abajo o recorre la planta.</p> |
| pages/gallery.html:309 | b-copy | Barcelona | p class="lead-links"><a href="../services/ppf.html">Protección PPF en Barcelona</a><span class="sep"> · </span><a href="../services/vinyl.html">Car Wrap y vinilado de coches</a></p> |
| pages/gallery.html:368 | b-copy | Snow | e class="shot" data-full="../assets/gallery/rwb-snow.webp" data-note="Snow-dusted · The ramp"> |
| pages/gallery.html:369 | f-alt | nieve | c="../assets/gallery/rwb-snow-s.jpg" alt="RWB Porsche 993 cubierto de nieve sobre una rampa de hormigón" width="600" height="900" loading="lazy" decoding="async"> |
| pages/gallery.html:371 | b-copy | nieve | <figcaption><span class="cap-note">Con nieve</span><span class="cap-tag">Invierno</span></figcaption> |
| pages/gallery.html:383 | b-copy | Barcelona, Collserola | on Car Wrap en un gris frozen profundo, fotografiado en una azotea de Barcelona con la torre de Collserola detrás. Carrocería mate, detalles en negro brillo, acentos de carbono.</p> |
| pages/gallery.html:394 | b-copy | Collserola | t" data-full="../assets/gallery/m2-front.webp" data-note="Front end · Collserola"> |
| pages/gallery.html:395 | f-alt | Collserola | ssets/gallery/m2-front-s.jpg" alt="Frontal del BMW M2 con la torre de Collserola detrás" width="600" height="900" loading="lazy" decoding="async"> |
| pages/gallery.html:397 | b-copy | Collserola | <figcaption><span class="cap-note">Collserola</span><span class="cap-tag">Car Wrap</span></figcaption> |
| pages/gallery.html:400 | f-alt | Collserola | ./assets/gallery/m2-tower-s.jpg" alt="Zaga del BMW M2 con la torre de Collserola al fondo" width="600" height="900" loading="lazy" decoding="async"> |
| pages/gallery.html:414 | b-copy | catalán | n GR Supra blanco perla protegido y sellado, llevado después al campo catalán.</p> |
| pages/gallery.html:421 | f-alt | catalan | a-villa-s.jpg" alt="Toyota GR Supra blanco aparcado junto a una masía catalana de piedra" width="720" height="900" loading="lazy" decoding="async"> |
| pages/gallery.html:471 | b-copy | catalan | lcantara y escape cuádruple, fotografiado en una carretera secundaria catalana con el sol entre las nubes.</p> |
| pages/prices.html:2 | d-meta | lang="es" | <html lang="es"> |
| pages/prices.html:7 | d-meta | IVA | Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES."> |
| pages/prices.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| pages/prices.html:13 | d-meta | IVA | Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES."> |
| pages/prices.html:20 | d-meta | IVA | Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES."> |
| pages/prices.html:242 | e-jsonld | Barcelona, Sant Cugat, Vallès, IVA | "description":"Precios orientativos con IVA incluido de todos los servicios de SERRES Wrap Center en Sant Cugat del Vallès (Barcelona).", |
| pages/prices.html:245 | e-jsonld | Barcelona | "areaServed":"Barcelona", |
| pages/prices.html:247 | e-jsonld | +34, 621 24 44 69 | "telephone":"+34 621 24 44 69", |
| pages/prices.html:249 | e-jsonld | Barcelona, Sant Cugat, Vallès, 08174, Can Fatjó | "address":{"@type":"PostalAddress","streetAddress":"Av. Can Fatjó dels Aurons, 15","postalCode":"08174","addressLocality":"Sant Cugat del Vallès","addressRegion":"Barcelona","addressCount |
| pages/prices.html:251 | e-jsonld | 09:00 | OfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"19:00"}, |
| pages/prices.html:253 | e-jsonld | 34621244469 | meAs":["https://www.instagram.com/serres.wrap.center/","https://wa.me/34621244469"]}, |
| pages/prices.html:254 | e-jsonld | Catal | "hasOfferCatalog":{"@type":"OfferCatalog","name":"Servicios SERRES — precios de entrada","itemListElement":[ |
| pages/prices.html:255 | e-jsonld | IVA, EUR | ffer","name":"Car Wrap — cambio de color","description":"Desde 250 €, IVA incluido","price":"250","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/vinyl.html"}, |
| pages/prices.html:256 | e-jsonld | IVA, EUR | me":"PPF — film de protección de pintura","description":"Desde 890 €, IVA incluido","price":"890","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/ppf.html"}, |
| pages/prices.html:257 | e-jsonld | IVA, EUR | er","name":"Corrección + Ceramic Coating","description":"Desde 340 €, IVA incluido","price":"340","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/ceramic.html"}, |
| pages/prices.html:258 | e-jsonld | IVA, EUR | {"@type":"Offer","name":"Detailing","description":"Desde 35 €, IVA incluido","price":"35","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/detailing.html"}, |
| pages/prices.html:259 | e-jsonld | IVA, EUR | {"@type":"Offer","name":"Body kits","description":"Desde 450 €, IVA incluido","price":"450","priceCurrency":"EUR","url":"https://serreswrapcenter.es/services/body-kits.html"}]}} |
| pages/prices.html:267 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| pages/prices.html:272 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| pages/prices.html:304 | b-copy | Barcelona | lass="h1-kw">Precios de PPF, Car Wrap, Ceramic Coating y Detailing en Barcelona</span></span> |
| pages/prices.html:306 | b-copy | IVA | desde 250 €), Ceramic Coating (desde 340 €) y detailing (desde 35 €), IVA incluido. Tres niveles por servicio; cada coche se confirma con un presupuesto exacto en persona.</p> |
| pages/prices.html:322 | a-nap | 34621244469 | </li></ul><div class="t-cta"><a class="btn ghost" href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20presupuesto%20del%20pack%20Acentos%20de%20Car%20Wrap%20para%20mi%20coc |
| pages/prices.html:348 | g-other | IVA, EUR | Todos los derechos reservados. &nbsp;·&nbsp; Precios orientativos en EUR, IVA incluido</footer> |
| pages/prices.html:463 | a-nap | 34621244469 | var WA='https://wa.me/34621244469?text='; |
| pages/projects.html:2 | d-meta | lang="es" | <html lang="es"> |
| pages/projects.html:6 | d-meta | Barcelona | <title>Exclusivo — Proyectos de Transformación en Barcelona \| SERRES</title> |
| pages/projects.html:7 | d-meta | Barcelona | ="Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año."> |
| pages/projects.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| pages/projects.html:12 | d-meta | Barcelona | operty="og:title" content="Exclusivo — Proyectos de Transformación en Barcelona \| SERRES"> |
| pages/projects.html:13 | d-meta | Barcelona | ="Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año."> |
| pages/projects.html:19 | d-meta | Barcelona | e="twitter:title" content="Exclusivo — Proyectos de Transformación en Barcelona \| SERRES"> |
| pages/projects.html:20 | d-meta | Barcelona | ="Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año."> |
| pages/projects.html:216 | e-jsonld | Barcelona | "areaServed":"Barcelona", |
| pages/projects.html:218 | e-jsonld | +34, 621 24 44 69 | "telephone":"+34 621 24 44 69", |
| pages/projects.html:220 | e-jsonld | Barcelona, Sant Cugat, Vallès, 08174, Can Fatjó | "address":{"@type":"PostalAddress","streetAddress":"Av. Can Fatjó dels Aurons, 15","postalCode":"08174","addressLocality":"Sant Cugat del Vallès","addressRegion":"Barcelona","addressCount |
| pages/projects.html:221 | e-jsonld | 34621244469 | meAs":["https://www.instagram.com/serres.wrap.center/","https://wa.me/34621244469"]}} |
| pages/projects.html:229 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| pages/projects.html:234 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| pages/projects.html:270 | b-copy | Barcelona | lass="ln"><span class="h1-kw">Proyectos de transformación completa en Barcelona</span></span> |
| pages/projects.html:279 | b-copy | Barcelona | Exclusivo es nuestro proyecto de transformación completa de coches en Barcelona: corrección de pintura, cambio de color, PPF, Ceramic Coating, carrocería e interior — cada disciplina que ten |
| pages/projects.html:281 | a-nap | 34621244469 | <a href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20informarme%20sobre%20un%20Exclusivo%20completo%20y%20pedir%20una%20estimaci%C3%B3n%20de%20precio%20para%20mi%20 |
| pages/projects.html:376 | a-nap | 34621244469 | <a href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20informarme%20sobre%20un%20Exclusivo%20completo%20y%20pedir%20una%20estimaci%C3%B3n%20de%20precio%20para%20mi%20 |
| pages/projects.html:379 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| pages/why-serres.html:2 | d-meta | lang="es" | <html lang="es"> |
| pages/why-serres.html:6 | d-meta | Sant Cugat | <title>Estudio de Detailing en Sant Cugat — Por Qué SERRES</title> |
| pages/why-serres.html:7 | d-meta | Sant Cugat, Vallès | <meta name="description" content="Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan."> |
| pages/why-serres.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| pages/why-serres.html:12 | d-meta | Sant Cugat | <meta property="og:title" content="Estudio de Detailing en Sant Cugat — Por Qué SERRES"> |
| pages/why-serres.html:13 | d-meta | Sant Cugat, Vallès | <meta property="og:description" content="Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomie |
| pages/why-serres.html:19 | d-meta | Sant Cugat | <meta name="twitter:title" content="Estudio de Detailing en Sant Cugat — Por Qué SERRES"> |
| pages/why-serres.html:20 | d-meta | Sant Cugat, Vallès | <meta name="twitter:description" content="Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomi |
| pages/why-serres.html:237 | e-jsonld | Sant Cugat, Vallès | "description": "Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap, Ceramic Coating, corrección de pintura y body kits.", |
| pages/why-serres.html:240 | e-jsonld | +34, 621 24 44 69 | "telephone": "+34 621 24 44 69", |
| pages/why-serres.html:241 | e-jsonld | €€ | "priceRange": "€€", |
| pages/why-serres.html:244 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| pages/why-serres.html:245 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| pages/why-serres.html:246 | e-jsonld | 08174 | "postalCode": "08174", |
| pages/why-serres.html:247 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| pages/why-serres.html:254 | e-jsonld | 09:00 | "opens": "09:00", |
| pages/why-serres.html:266 | e-jsonld | 34621244469 | "https://wa.me/34621244469" |
| pages/why-serres.html:296 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| pages/why-serres.html:301 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| pages/why-serres.html:332 | b-copy | Sant Cugat, Vallès | <span class="ln"><span class="h1-kw">Estudio de detailing en Sant Cugat del Vallès</span></span> |
| pages/why-serres.html:341 | b-copy | Sant Cugat, Vallès | <p class="lead">Somos un estudio de detailing en Sant Cugat del Vallès con una obsesión: hacerlo bien. Sin atajos, sin “ya vale” — solo preparación meticulosa, materiales premium y los m |
| pages/why-serres.html:380 | b-copy | Sant Cugat | <a href="../services/detailing.html">Detailing profesional en Sant Cugat <span class="arr">→</span></a> |
| pages/why-serres.html:421 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/ppf.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/ppf.html:6 | d-meta | Barcelona | <title>PPF en Barcelona — Protección de Pintura \| SERRES</title> |
| services/ppf.html:7 | d-meta | Barcelona, Sant Cugat | ias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona."> |
| services/ppf.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/ppf.html:12 | d-meta | Barcelona | <meta property="og:title" content="PPF en Barcelona — Protección de Pintura \| SERRES"> |
| services/ppf.html:13 | d-meta | Barcelona, Sant Cugat | ias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona."> |
| services/ppf.html:19 | d-meta | Barcelona | <meta name="twitter:title" content="PPF en Barcelona — Protección de Pintura \| SERRES"> |
| services/ppf.html:20 | d-meta | Barcelona, Sant Cugat | ias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona."> |
| services/ppf.html:304 | e-jsonld | Barcelona | "name": "Instalación de PPF (lámina de protección de pintura) en Barcelona", |
| services/ppf.html:307 | e-jsonld | Barcelona, Sant Cugat, Vallès | frontal, frontal completo y carrocería completa en nuestro taller de Sant Cugat del Vallès, Barcelona. Más de 50 colores de PPF.", |
| services/ppf.html:312 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/ppf.html:315 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| services/ppf.html:316 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/ppf.html:317 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/ppf.html:318 | e-jsonld | 08174 | "postalCode": "08174", |
| services/ppf.html:323 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/ppf.html:324 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/ppf.html:331 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:335 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:345 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:349 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:359 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:363 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ppf.html:379 | e-jsonld | Barcelona | "name": "¿Cuánto cuesta instalar PPF en Barcelona?", |
| services/ppf.html:382 | e-jsonld | IVA | , el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende del modelo y del estado de la pintura, por eso confirmamos presupuesto cerrado tra |
| services/ppf.html:406 | e-jsonld | Sant Cugat, Vallès | ción hexagonal controlada. El proceso se realiza en nuestro taller de Sant Cugat del Vallès y, si algo no cumple nuestro estándar, se repite antes de la entrega." |
| services/ppf.html:414 | e-jsonld | +34, 621 24 44 69 | os con cita previa de lunes a sábado: llama o escribe por WhatsApp al +34 621 24 44 69 y te confirmamos fecha y presupuesto en el mismo día." |
| services/ppf.html:440 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/ppf.html:445 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/ppf.html:477 | b-copy | Barcelona | <span class="ln"><span class="h1-kw">PPF en Barcelona — protección de pintura para tu coche</span></span> |
| services/ppf.html:486 | b-copy | Barcelona, Sant Cugat, Vallès | <p class="lead">Instalamos PPF en Barcelona, en nuestro taller de Sant Cugat del Vallès: una piel de uretano invisible sobre tu pintura de fábrica que absorbe impactos de piedra, micro-a |
| services/ppf.html:656 | b-copy | Barcelona | <summary>¿Cuánto cuesta instalar PPF en Barcelona?<span class="fq-x"></span></summary> |
| services/ppf.html:657 | b-copy | IVA | , el frontal completo de 1.190 € y la carrocería completa de 2.390 €, IVA incluido. El precio final depende del modelo y del estado de la pintura, por eso confirmamos presupuesto cerrado tra |
| services/ppf.html:672 | b-copy | Sant Cugat, Vallès | ción hexagonal controlada. El proceso se realiza en nuestro taller de Sant Cugat del Vallès y, si algo no cumple nuestro estándar, se repite antes de la entrega.</p> |
| services/ppf.html:677 | b-copy | +34, 621 24 44 69 | os con cita previa de lunes a sábado: llama o escribe por WhatsApp al +34 621 24 44 69 y te confirmamos fecha y presupuesto en el mismo día.</p> |
| services/ppf.html:688 | b-copy | Barcelona | <a href="vinyl.html">Car Wrap — cambio de color de coche en Barcelona</a> |
| services/ppf.html:689 | b-copy | Barcelona | ref="ceramic.html">Ceramic Coating — corrección y sellado cerámico en Barcelona</a> |
| services/ppf.html:703 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/vinyl.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/vinyl.html:6 | d-meta | Barcelona | <title>Car Wrap en Barcelona — Cambio de Color \| SERRES</title> |
| services/vinyl.html:7 | d-meta | Sant Cugat, Vallès | ennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès."> |
| services/vinyl.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/vinyl.html:12 | d-meta | Barcelona | <meta property="og:title" content="Car Wrap en Barcelona — Cambio de Color \| SERRES"> |
| services/vinyl.html:13 | d-meta | Sant Cugat, Vallès | ennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès."> |
| services/vinyl.html:19 | d-meta | Barcelona | <meta name="twitter:title" content="Car Wrap en Barcelona — Cambio de Color \| SERRES"> |
| services/vinyl.html:20 | d-meta | Sant Cugat, Vallès | ennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès."> |
| services/vinyl.html:352 | e-jsonld | Sant Cugat, Vallès | flip. Instalación con termosellado panel a panel en nuestro taller de Sant Cugat del Vallès.", |
| services/vinyl.html:357 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/vinyl.html:360 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons 15", |
| services/vinyl.html:361 | e-jsonld | 08174 | "postalCode": "08174", |
| services/vinyl.html:362 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/vinyl.html:363 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/vinyl.html:368 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/vinyl.html:369 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/vinyl.html:376 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:380 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:389 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:393 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:402 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:406 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/vinyl.html:424 | e-jsonld | IVA | lor completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desd |
| services/vinyl.html:440 | e-jsonld | Sant Cugat, Vallès | e levantamientos. Todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès." |
| services/vinyl.html:464 | e-jsonld | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | "text": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minutos del centro de Barcelona. Escríbenos por WhatsAp |
| services/vinyl.html:471 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/vinyl.html:476 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/vinyl.html:506 | b-copy | Barcelona | <span class="ln"><span class="h1-kw">Car Wrapping en Barcelona — vinilar tu coche</span></span> |
| services/vinyl.html:515 | b-copy | Barcelona, Sant Cugat, Vallès | <p class="lead">Car wrapping en Barcelona: vinilamos tu coche con cambio de color total o parcial usando films 3M, Avery Dennison e Inozetek — más de 150 colores en mate, satinado, brill |
| services/vinyl.html:623 | b-copy | Sant Cugat | <p class="sh-note">Lo que nos preguntan cada semana en el taller de Sant Cugat. Si tu duda no está aquí, escríbenos por WhatsApp.</p> |
| services/vinyl.html:629 | b-copy | IVA | lor completo con films 3M, Avery Dennison e Inozetek parte de 1.490 € IVA incluido; los acentos (techo, retrovisores, pilares) desde 250 € y el acabado Signature con desmontaje ampliado desd |
| services/vinyl.html:639 | b-copy | Sant Cugat, Vallès | e levantamientos. Todo el trabajo se hace en nuestro taller propio de Sant Cugat del Vallès.</p> |
| services/vinyl.html:654 | b-copy | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | <p class="fq-a">Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), a 20 minutos del centro de Barcelona. Escríbenos por WhatsA |
| services/vinyl.html:669 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/ceramic.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/ceramic.html:6 | d-meta | Barcelona | <title>Tratamiento Cerámico para Coche en Barcelona \| SERRES</title> |
| services/ceramic.html:7 | d-meta | Barcelona, Sant Cugat | a 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona."> |
| services/ceramic.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/ceramic.html:12 | d-meta | Barcelona | <meta property="og:title" content="Tratamiento Cerámico para Coche en Barcelona \| SERRES"> |
| services/ceramic.html:13 | d-meta | Barcelona, Sant Cugat | a 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona."> |
| services/ceramic.html:19 | d-meta | Barcelona | meta name="twitter:title" content="Tratamiento Cerámico para Coche en Barcelona \| SERRES"> |
| services/ceramic.html:20 | d-meta | Barcelona, Sant Cugat | a 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona."> |
| services/ceramic.html:243 | e-jsonld | Barcelona | "name": "Tratamiento cerámico para coche en Barcelona", |
| services/ceramic.html:246 | e-jsonld | IVA | uminación hexagonal controlada antes de la entrega. Packs desde 340 € IVA incluido.", |
| services/ceramic.html:251 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/ceramic.html:254 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| services/ceramic.html:255 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/ceramic.html:256 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/ceramic.html:257 | e-jsonld | 08174 | "postalCode": "08174", |
| services/ceramic.html:262 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/ceramic.html:263 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/ceramic.html:270 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ceramic.html:271 | e-jsonld | IVA | de Ceramic Coating SiO2. Durabilidad estimada de 2 años. Desde 340 € IVA incluido." |
| services/ceramic.html:277 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ceramic.html:278 | e-jsonld | IVA | antilluvia en cristales. Durabilidad estimada de 3 años. Desde 590 € IVA incluido." |
| services/ceramic.html:284 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/ceramic.html:285 | e-jsonld | IVA | es y protección interior. Durabilidad estimada de 5 años. Desde 890 € IVA incluido." |
| services/ceramic.html:300 | e-jsonld | IVA | "text": "Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. El precio final depende del tamaño del vehículo y del |
| services/ceramic.html:340 | e-jsonld | Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | "text": "Con cita previa de lunes a sábado en nuestro taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escríbenos por WhatsApp o llama al +34 621 24 44 69 y te damos pre |
| services/ceramic.html:358 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/ceramic.html:363 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/ceramic.html:399 | b-copy | Barcelona | pan class="ln"><span class="h1-kw">Tratamiento cerámico para coche en Barcelona</span></span> |
| services/ceramic.html:408 | b-copy | Barcelona | <p class="lead">El tratamiento cerámico para coche en Barcelona de SERRES: un recubrimiento SiO₂ que se adhiere químicamente a la pintura — sella el brillo con una capa hidrófoba y desli |
| services/ceramic.html:521 | b-copy | IVA | <p class="fq-a">Trabajamos con tres packs cerrados, IVA incluido: Essential desde 340 €, Signature desde 590 € y Concours desde 890 €. El precio final depende del tamaño del vehículo |
| services/ceramic.html:546 | b-copy | Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | p class="fq-a">Con cita previa de lunes a sábado en nuestro taller de Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Escríbenos por WhatsApp o llama al +34 621 24 44 69 y te damos pre |
| services/ceramic.html:567 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/paint-correction.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/paint-correction.html:6 | d-meta | Barcelona | <title>Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES</title> |
| services/paint-correction.html:7 | d-meta | Barcelona, Sant Cugat | ún el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona."> |
| services/paint-correction.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/paint-correction.html:12 | d-meta | Barcelona | operty="og:title" content="Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES"> |
| services/paint-correction.html:13 | d-meta | Barcelona, Sant Cugat | ún el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona."> |
| services/paint-correction.html:19 | d-meta | Barcelona | e="twitter:title" content="Pulido y Corrección de Pintura de Coche en Barcelona \| SERRES"> |
| services/paint-correction.html:20 | d-meta | Barcelona, Sant Cugat | ún el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona."> |
| services/paint-correction.html:316 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/paint-correction.html:320 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| services/paint-correction.html:321 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/paint-correction.html:322 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/paint-correction.html:323 | e-jsonld | 08174 | "postalCode": "08174", |
| services/paint-correction.html:334 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/paint-correction.html:335 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/paint-correction.html:342 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:346 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:355 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:359 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:368 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:372 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/paint-correction.html:387 | e-jsonld | Barcelona | "name": "¿Cuánto cuesta un pulido de coche en Barcelona?", |
| services/paint-correction.html:390 | e-jsonld | IVA | Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 |
| services/paint-correction.html:414 | e-jsonld | Sant Cugat, Vallès | dar, se repite antes de la entrega. Todo se hace en nuestro taller de Sant Cugat del Vallès." |
| services/paint-correction.html:430 | e-jsonld | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | "text": "Escríbenos por WhatsApp al +34 621 24 44 69 o llámanos y te damos cita de lunes a sábado. Estamos en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Bar |
| services/paint-correction.html:437 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/paint-correction.html:442 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/paint-correction.html:476 | b-copy | Barcelona | <span class="ln"><span class="h1-kw">Pulido de coche en Barcelona — corrección de pintura</span></span> |
| services/paint-correction.html:485 | b-copy | Barcelona, Sant Cugat, Vallès | <p class="lead">El pulido de coche en Barcelona de SERRES es una corrección multietapa a máquina que elimina micro-arañazos, hologramas y oxidación, devolviendo el brillo y la profundida |
| services/paint-correction.html:596 | b-copy | Barcelona | <summary>¿Cuánto cuesta un pulido de coche en Barcelona?</summary> |
| services/paint-correction.html:597 | b-copy | IVA | Center el pulido con Ceramic Coating SiO₂ parte de 340 € (Essential, IVA incluido). El nivel Signature, con corrección multietapa, cuesta 590 €, y el Concours, con acabado de concurso, 890 |
| services/paint-correction.html:609 | b-copy | Sant Cugat, Vallès | dar, se repite antes de la entrega. Todo se hace en nuestro taller de Sant Cugat del Vallès.</p> |
| services/paint-correction.html:617 | b-copy | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | <p class="faq-a">Escríbenos por WhatsApp al +34 621 24 44 69 o llámanos y te damos cita de lunes a sábado. Estamos en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minuto |
| services/paint-correction.html:636 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/detailing.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/detailing.html:6 | d-meta | Barcelona | <title>Detailing y Limpieza Interior de Coche en Barcelona \| SERRES</title> |
| services/detailing.html:7 | d-meta | Sant Cugat | eep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat."> |
| services/detailing.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/detailing.html:12 | d-meta | Barcelona | roperty="og:title" content="Detailing y Limpieza Interior de Coche en Barcelona \| SERRES"> |
| services/detailing.html:13 | d-meta | Sant Cugat | eep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat."> |
| services/detailing.html:19 | d-meta | Barcelona | me="twitter:title" content="Detailing y Limpieza Interior de Coche en Barcelona \| SERRES"> |
| services/detailing.html:20 | d-meta | Sant Cugat | eep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat."> |
| services/detailing.html:294 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/detailing.html:299 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/detailing.html:336 | b-copy | Barcelona | <span class="ln ln-kw"><span class="h1-kw">Detailing de coche en Barcelona</span></span> |
| services/detailing.html:345 | b-copy | Barcelona, Sant Cugat, Vallès | <p class="lead">Detailing de coche en Barcelona: limpieza a vapor, descontaminación y acabado a mano, por dentro y por fuera, en nuestro estudio de Sant Cugat del Vallès. Deep Clean desd |
| services/detailing.html:445 | b-copy | Sant Cugat | eguntan antes de un detailing — precios, tiempos y cómo trabajamos en Sant Cugat.</p> |
| services/detailing.html:452 | b-copy | IVA | <p class="fq-a">Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo p |
| services/detailing.html:472 | b-copy | Sant Cugat, Vallès | l a panel bajo iluminación hexagonal controlada, en nuestro taller de Sant Cugat del Vallès. Si algo no cumple nuestro estándar, se repite antes de la entrega. Es la razón de nuestra valorac |
| services/detailing.html:477 | b-copy | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | ass="fq-a">Trabajamos solo con cita previa, de lunes a sábado, en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escríbenos por WhatsApp o llama al +34 621 24 44 69 con el |
| services/detailing.html:493 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| services/detailing.html:524 | e-jsonld | IVA | "text": "Trabajamos con tres niveles cerrados, IVA incluido: Refresh desde 35 €, Deep Clean con limpieza interior a vapor desde 150 € y Showroom Reset — el reinicio completo por dent |
| services/detailing.html:556 | e-jsonld | Sant Cugat, Vallès | l a panel bajo iluminación hexagonal controlada, en nuestro taller de Sant Cugat del Vallès. Si algo no cumple nuestro estándar, se repite antes de la entrega. Es la razón de nuestra valorac |
| services/detailing.html:564 | e-jsonld | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | "text": "Trabajamos solo con cita previa, de lunes a sábado, en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Escríbenos por WhatsApp o llama al +34 621 24 44 69 con el |
| services/detailing.html:583 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/detailing.html:586 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons 15", |
| services/detailing.html:587 | e-jsonld | 08174 | "postalCode": "08174", |
| services/detailing.html:588 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/detailing.html:589 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/detailing.html:594 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/detailing.html:595 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/detailing.html:602 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/detailing.html:606 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/detailing.html:617 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/detailing.html:621 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/detailing.html:632 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/detailing.html:636 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:2 | d-meta | lang="es" | <html lang="es"> |
| services/body-kits.html:6 | d-meta | Barcelona | <title>Montaje de Body Kits en Barcelona \| SERRES</title> |
| services/body-kits.html:7 | d-meta | Sant Cugat, Vallès | intura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès."> |
| services/body-kits.html:11 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| services/body-kits.html:12 | d-meta | Barcelona | <meta property="og:title" content="Montaje de Body Kits en Barcelona \| SERRES"> |
| services/body-kits.html:13 | d-meta | Sant Cugat, Vallès | intura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès."> |
| services/body-kits.html:19 | d-meta | Barcelona | <meta name="twitter:title" content="Montaje de Body Kits en Barcelona \| SERRES"> |
| services/body-kits.html:20 | d-meta | Sant Cugat, Vallès | intura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès."> |
| services/body-kits.html:273 | e-jsonld | Sant Cugat, Vallès, IVA | body kits, splitters, difusores y kits widebody en nuestro taller de Sant Cugat del Vallès. Desde 450 € IVA incluido.", |
| services/body-kits.html:277 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469", |
| services/body-kits.html:281 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons 15", |
| services/body-kits.html:282 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| services/body-kits.html:283 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| services/body-kits.html:284 | e-jsonld | 08174 | "postalCode": "08174", |
| services/body-kits.html:295 | e-jsonld | Sant Cugat, Vallès | { "@type": "City", "name": "Sant Cugat del Vallès" }, |
| services/body-kits.html:296 | e-jsonld | Barcelona | { "@type": "City", "name": "Barcelona" } |
| services/body-kits.html:298 | e-jsonld | Catal | "hasOfferCatalog": { |
| services/body-kits.html:299 | e-jsonld | Catal | "@type": "OfferCatalog", |
| services/body-kits.html:306 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:310 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:318 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:322 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:330 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:334 | e-jsonld | EUR | "priceCurrency": "EUR", |
| services/body-kits.html:352 | e-jsonld | IVA | n 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. Tras ver el coche y el kit, cerramos un presupuesto fijo por escrito antes de empezar." |
| services/body-kits.html:368 | e-jsonld | Sant Cugat, Vallès | ntura del kit instalado. Todo el trabajo se hace en nuestro taller de Sant Cugat del Vallès, por lo que respondemos directamente de cada pieza montada. Las condiciones exactas dependen del m |
| services/body-kits.html:392 | e-jsonld | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | "text": "Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Escríbenos por WhatsApp o llama al +34 621 24 |
| services/body-kits.html:410 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| services/body-kits.html:415 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| services/body-kits.html:447 | b-copy | Barcelona | <span class="ln ln-kw"><span class="h1-kw">Montaje de body kits en Barcelona</span></span> |
| services/body-kits.html:456 | b-copy | Barcelona, Sant Cugat, Vallès | <p class="lead">Realizamos el montaje de body kits en Barcelona (taller en Sant Cugat del Vallès): instalación, pintura y ajuste a nivel OEM de labios, difusores, alerones y conversiones |
| services/body-kits.html:480 | b-copy | Barcelona | inks">Relacionado: <a href="vinyl.html">Car Wrap y cambio de color en Barcelona</a> · <a href="ppf.html">Protección de pintura PPF</a></p> |
| services/body-kits.html:540 | b-copy | Sant Cugat | <p class="sh-note">Lo que nos preguntan cada semana en el taller de Sant Cugat. Si tu duda no está aquí, escríbenos por WhatsApp.</p> |
| services/body-kits.html:547 | b-copy | IVA | n 1.490 €, y una transformación integral tipo widebody desde 3.490 €, IVA incluido. Tras ver el coche y el kit, cerramos un presupuesto fijo por escrito antes de empezar.</p> |
| services/body-kits.html:561 | b-copy | Sant Cugat, Vallès | ntura del kit instalado. Todo el trabajo se hace en nuestro taller de Sant Cugat del Vallès, por lo que respondemos directamente de cada pieza montada. Las condiciones exactas dependen del m |
| services/body-kits.html:582 | b-copy | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | <p>Trabajamos con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, a 20 minutos de Barcelona. Escríbenos por WhatsApp o llama al +34 621 24 44 |
| services/body-kits.html:598 | a-nap | Barcelona, Sant Cugat, Vallès, +34, 621 24 44 69 | <p class="phone">Sant Cugat del Vallès, Barcelona &nbsp;·&nbsp; <strong>+34 621 24 44 69</strong></p> |
| blog/index.html:2 | d-meta | lang="es" | <html lang="es"> |
| blog/index.html:7 | d-meta | Barcelona | eramic Coating y Detailing, y cómo mantener el acabado de tu coche en Barcelona."> |
| blog/index.html:16 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| blog/index.html:52 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| blog/index.html:57 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| blog/index.html:93 | f-alt | Sant Cugat | ambio de color completo con vinilo en un coche en el taller SERRES de Sant Cugat"> |
| blog/index.html:121 | b-copy | IVA | desde 890 €, frontal completo 1.190 € y carrocería completa 2.390 €, IVA incluido. Qué incluye cada cobertura.</p> |
| blog/cuanto-cuesta-ppf-coche.html:2 | d-meta | lang="es" | <html lang="es"> |
| blog/cuanto-cuesta-ppf-coche.html:8 | d-meta | IVA | ption" content="PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía."> |
| blog/cuanto-cuesta-ppf-coche.html:20 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| blog/cuanto-cuesta-ppf-coche.html:22 | d-meta | IVA | ption" content="PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales: opciones, plazos y garantía."> |
| blog/cuanto-cuesta-ppf-coche.html:33 | d-meta | IVA | ption" content="PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales: opciones, plazos y garantía."> |
| blog/cuanto-cuesta-ppf-coche.html:49 | e-jsonld | IVA | "description": "PPF frontal desde 890€ y coche completo desde 2.390€ (IVA incluido). Guía de precios reales de la lámina de protección de pintura: opciones, plazos y garantía.", |
| blog/cuanto-cuesta-ppf-coche.html:54 | e-jsonld | Equipo SERRES | "author": { "@type": "Organization", "name": "Equipo SERRES", "url": "https://serreswrapcenter.es/" }, |
| blog/cuanto-cuesta-ppf-coche.html:62 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| blog/cuanto-cuesta-ppf-coche.html:63 | e-jsonld | 08174 | "postalCode": "08174", |
| blog/cuanto-cuesta-ppf-coche.html:64 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| blog/cuanto-cuesta-ppf-coche.html:65 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| blog/cuanto-cuesta-ppf-coche.html:68 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469" |
| blog/cuanto-cuesta-ppf-coche.html:95 | e-jsonld | España, IVA | "acceptedAnswer": { "@type": "Answer", "text": "En España, entre 900 € y 1.700 € el frontal parcial y hasta 2.500 € el frontal completo. Nuestra tarifa es de 890 € el frontal y 1.190 € |
| blog/cuanto-cuesta-ppf-coche.html:121 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| blog/cuanto-cuesta-ppf-coche.html:126 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| blog/cuanto-cuesta-ppf-coche.html:165 | b-copy | Equipo SERRES | <span>Por <b>Equipo SERRES</b></span> |
| blog/cuanto-cuesta-ppf-coche.html:175 | f-alt | Sant Cugat, Vallès | lámina de protección de pintura en el frontal en el taller SERRES de Sant Cugat del Vallès"> |
| blog/cuanto-cuesta-ppf-coche.html:199 | b-copy | España | <p>El PPF (Paint Protection Film) cuesta en España entre 600 € y 5.000 €, según la superficie |
| blog/cuanto-cuesta-ppf-coche.html:203 | b-copy | Barcelona, Sant Cugat, Vallès, IVA | (Sant Cugat del Vallès, Barcelona) trabajamos con tarifas cerradas e IVA incluido: |
| blog/cuanto-cuesta-ppf-coche.html:221 | b-copy | España | instaladores en España en 2026; la columna SERRES corresponde a nuestros |
| blog/cuanto-cuesta-ppf-coche.html:222 | b-copy | IVA | <a href="../pages/prices.html">precios de PPF</a>, con IVA incluido.</p> |
| blog/cuanto-cuesta-ppf-coche.html:227 | b-copy | IVA | <tr><th>Cobertura</th><th>Qué protege</th><th>Precio SERRES (IVA incl.)</th><th>Rango de mercado</th><th>Plazo orientativo</th></tr> |
| blog/cuanto-cuesta-ppf-coche.html:239 | b-copy | IVA | IVA; pide siempre la cifra final. Segundo: en coches de gran formato (SUV grandes, |
| blog/cuanto-cuesta-ppf-coche.html:245 | b-copy | peaje | autopista. Un capó con 20.000 km de peaje lo demuestra a simple vista.</p> |
| blog/cuanto-cuesta-ppf-coche.html:263 | b-copy | Sant Cugat, Vallès | en nuestro taller propio de Sant Cugat del Vallès.</p> |
| blog/cuanto-cuesta-ppf-coche.html:323 | b-copy | IVA | <li>Precio final con IVA incluido.</li> |
| blog/cuanto-cuesta-ppf-coche.html:339 | b-copy | España | <div class="faq-a"><p>En España, entre 900 € y 1.700 € el frontal parcial y hasta 2.500 € |
| blog/cuanto-cuesta-ppf-coche.html:341 | b-copy | IVA | con IVA incluido, film de poliuretano autorregenerable y 3 años de garantía del |
| blog/cuanto-cuesta-ppf-coche.html:381 | b-copy | Can Fatjó | PPF el mismo día. Con cita previa de lunes a sábado en Av. Can Fatjó dels Aurons, 15 · |
| blog/cuanto-cuesta-ppf-coche.html:382 | b-copy | Barcelona, Sant Cugat, Vallès, 08174 | 08174 Sant Cugat del Vallès (Barcelona).</p> |
| blog/cuanto-cuesta-ppf-coche.html:386 | a-nap | 34621244469 | href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20he%20le%C3%ADdo%20la%20gu%C3%ADa%20de%20precios%20de%20PPF%20y%20quiero%20un%20presupuesto%20para%20mi%20coche."> |
| blog/cuanto-cuesta-ppf-coche.html:388 | a-nap | +34, 34621244469, 621 24 44 69 | <a class="btn ghost" href="tel:+34621244469">+34 621 24 44 69</a> |
| blog/cuanto-cuesta-vinilar-un-coche.html:2 | d-meta | lang="es" | <html lang="es"> |
| blog/cuanto-cuesta-vinilar-un-coche.html:19 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| blog/cuanto-cuesta-vinilar-un-coche.html:45 | e-jsonld | España | "headline": "¿Cuánto cuesta vinilar un coche? Precios reales en España (2026)", |
| blog/cuanto-cuesta-vinilar-un-coche.html:48 | e-jsonld | es-ES | "inLanguage": "es-ES", |
| blog/cuanto-cuesta-vinilar-un-coche.html:67 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| blog/cuanto-cuesta-vinilar-un-coche.html:68 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| blog/cuanto-cuesta-vinilar-un-coche.html:69 | e-jsonld | 08174 | "postalCode": "08174", |
| blog/cuanto-cuesta-vinilar-un-coche.html:70 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| blog/cuanto-cuesta-vinilar-un-coche.html:73 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469" |
| blog/cuanto-cuesta-vinilar-un-coche.html:115 | e-jsonld | DGT | "name": "¿Hay que avisar a la DGT si vinilo el coche de otro color?", |
| blog/cuanto-cuesta-vinilar-un-coche.html:118 | e-jsonld | España, ITV | "text": "El color no consta en la ficha técnica del vehículo en España, así que el cambio no exige homologación ni ITV extraordinaria. Sí conviene comunicarlo a tu aseguradora para que |
| blog/cuanto-cuesta-vinilar-un-coche.html:141 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| blog/cuanto-cuesta-vinilar-un-coche.html:146 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| blog/cuanto-cuesta-vinilar-un-coche.html:180 | b-copy | España | <span class="chrome-text">vinilar un coche</span>? Precios reales en España (2026)</h1> |
| blog/cuanto-cuesta-vinilar-un-coche.html:185 | b-copy | Equipo SERRES | <span>Por <b>Equipo SERRES</b></span> |
| blog/cuanto-cuesta-vinilar-un-coche.html:195 | f-alt | Sant Cugat, Vallès | cambio de color completo con film de fundición en el taller SERRES de Sant Cugat del Vallès"> |
| blog/cuanto-cuesta-vinilar-un-coche.html:221 | b-copy | IVA | entre 1.400 y 2.000 €, IVA incluido. En <a href="../index.html">SERRES Wrap Center</a> |
| blog/cuanto-cuesta-vinilar-un-coche.html:227 | b-copy | España | <p>La mayoría de talleres en España da presupuestos «a consultar». Nosotros preferimos publicar |
| blog/cuanto-cuesta-vinilar-un-coche.html:229 | b-copy | Sant Cugat, Vallès | nuestro taller de Sant Cugat del Vallès:</p> |
| blog/cuanto-cuesta-vinilar-un-coche.html:234 | b-copy | España, IVA | <tr><th>Tipo de trabajo</th><th>Qué incluye</th><th>Mercado en España</th><th>Tarifa SERRES (IVA incl.)</th></tr> |
| blog/cuanto-cuesta-vinilar-un-coche.html:289 | b-copy | España | ntrada más rentable y estos son los precios orientativos por pieza en España:</p> |
| blog/cuanto-cuesta-vinilar-un-coche.html:328 | b-copy | IVA | <li><strong>¿El precio incluye IVA?</strong> Buena parte de los rangos que verás publicados son |
| blog/cuanto-cuesta-vinilar-un-coche.html:329 | b-copy | IVA | sin IVA; los nuestros lo incluyen.</li> |
| blog/cuanto-cuesta-vinilar-un-coche.html:331 | b-copy | Sant Cugat | ERRES Wrap Center todo el trabajo se hace en nuestro taller propio de Sant Cugat del |
| blog/cuanto-cuesta-vinilar-un-coche.html:332 | b-copy | Vallès | Vallès, con cita previa de lunes a sábado. Cada coche pasa una revisión documentada panel a |
| blog/cuanto-cuesta-vinilar-un-coche.html:354 | b-copy | DGT | <summary>¿Hay que avisar a la DGT si vinilo el coche de otro color?</summary> |
| blog/cuanto-cuesta-vinilar-un-coche.html:355 | b-copy | España | ass="faq-a"><p>El color no consta en la ficha técnica del vehículo en España, así que |
| blog/cuanto-cuesta-vinilar-un-coche.html:356 | b-copy | ITV | el cambio no exige homologación ni ITV extraordinaria. Sí conviene comunicarlo a tu |
| blog/cuanto-cuesta-vinilar-un-coche.html:381 | b-copy | IVA | y dos fotos por WhatsApp y te devolvemos un presupuesto cerrado, con IVA incluido, en |
| blog/cuanto-cuesta-vinilar-un-coche.html:382 | b-copy | Sant Cugat, 08174, Can Fatjó | menos de 48 horas. Estamos en Av. Can Fatjó dels Aurons, 15 · 08174 Sant Cugat del |
| blog/cuanto-cuesta-vinilar-un-coche.html:383 | b-copy | Barcelona, Vallès | Vallès (Barcelona), a 15 minutos de la ciudad.</p> |
| blog/cuanto-cuesta-vinilar-un-coche.html:387 | a-nap | 34621244469 | href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20he%20le%C3%ADdo%20el%20art%C3%ADculo%20sobre%20cu%C3%A1nto%20cuesta%20vinilar%20un%20coche%20y%20quiero%20un%20presupuesto% |
| blog/cuanto-cuesta-vinilar-un-coche.html:389 | a-nap | +34, 34621244469, 621 24 44 69 | <a class="btn ghost" href="tel:+34621244469">+34 621 24 44 69</a> |
| blog/limpieza-tapiceria-coche-precio.html:2 | d-meta | lang="es" | <html lang="es"> |
| blog/limpieza-tapiceria-coche-precio.html:19 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| blog/limpieza-tapiceria-coche-precio.html:52 | e-jsonld | es-ES | "inLanguage": "es-ES", |
| blog/limpieza-tapiceria-coche-precio.html:67 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| blog/limpieza-tapiceria-coche-precio.html:68 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| blog/limpieza-tapiceria-coche-precio.html:69 | e-jsonld | 08174 | "postalCode": "08174", |
| blog/limpieza-tapiceria-coche-precio.html:70 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| blog/limpieza-tapiceria-coche-precio.html:73 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469" |
| blog/limpieza-tapiceria-coche-precio.html:141 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| blog/limpieza-tapiceria-coche-precio.html:146 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| blog/limpieza-tapiceria-coche-precio.html:185 | b-copy | Equipo SERRES | <span>Por <b>Equipo SERRES</b></span> |
| blog/limpieza-tapiceria-coche-precio.html:195 | f-alt | Sant Cugat, Vallès | del coche con máquina de inyección-extracción en el taller SERRES de Sant Cugat del Vallès"> |
| blog/limpieza-tapiceria-coche-precio.html:219 | b-copy | España | de talleres de España. Los servicios básicos parten de 30-40 €, y un detallado interior |
| blog/limpieza-tapiceria-coche-precio.html:222 | b-copy | IVA | IVA incluido: Refresh por 35 €, Deep Clean por 150 € y Showroom Reset por 490 €. En esta |
| blog/limpieza-tapiceria-coche-precio.html:236 | b-copy | IVA | <tr><th>Servicio</th><th>Precio de mercado</th><th>En SERRES (IVA incl.)</th><th>Qué incluye</th></tr> |
| blog/limpieza-tapiceria-coche-precio.html:394 | b-copy | Can Fatjó | necesita tu coche, con precio cerrado en el día. Estamos en Av. Can Fatjó dels |
| blog/limpieza-tapiceria-coche-precio.html:395 | b-copy | Barcelona, Sant Cugat, Vallès, 08174 | Aurons, 15 · 08174 Sant Cugat del Vallès (Barcelona), con cita previa de lunes |
| blog/limpieza-tapiceria-coche-precio.html:400 | a-nap | 34621244469 | href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20he%20le%C3%ADdo%20el%20art%C3%ADculo%20sobre%20limpieza%20de%20tapicer%C3%ADa%20y%20quiero%20precio%20cerrado%20para%20el%2 |
| blog/limpieza-tapiceria-coche-precio.html:402 | a-nap | +34, 34621244469, 621 24 44 69 | <a class="btn ghost" href="tel:+34621244469">+34 621 24 44 69</a> |
| blog/ppf-o-ceramico-que-elegir.html:2 | d-meta | lang="es" | <html lang="es"> |
| blog/ppf-o-ceramico-que-elegir.html:8 | d-meta | Barcelona, Sant Cugat | compara protección, duración y precio real con datos de un taller de Sant Cugat (Barcelona) y decide en 5 minutos."> |
| blog/ppf-o-ceramico-que-elegir.html:20 | d-meta | es_ES | <meta property="og:locale" content="es_ES"> |
| blog/ppf-o-ceramico-que-elegir.html:41 | g-analytics | G-1K6FYZ99GN | <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6FYZ99GN"></script> |
| blog/ppf-o-ceramico-que-elegir.html:46 | g-analytics | G-1K6FYZ99GN | gtag('config', 'G-1K6FYZ99GN'); |
| blog/ppf-o-ceramico-que-elegir.html:57 | e-jsonld | Sant Cugat | compara protección, duración y precio real con datos de un taller de Sant Cugat y decide en cinco minutos.", |
| blog/ppf-o-ceramico-que-elegir.html:62 | e-jsonld | Equipo SERRES | "author": { "@type": "Organization", "name": "Equipo SERRES", "url": "https://serreswrapcenter.es/" }, |
| blog/ppf-o-ceramico-que-elegir.html:70 | e-jsonld | Can Fatjó | "streetAddress": "Av. Can Fatjó dels Aurons, 15", |
| blog/ppf-o-ceramico-que-elegir.html:71 | e-jsonld | 08174 | "postalCode": "08174", |
| blog/ppf-o-ceramico-que-elegir.html:72 | e-jsonld | Sant Cugat, Vallès | "addressLocality": "Sant Cugat del Vallès", |
| blog/ppf-o-ceramico-que-elegir.html:73 | e-jsonld | Barcelona | "addressRegion": "Barcelona", |
| blog/ppf-o-ceramico-que-elegir.html:76 | e-jsonld | +34, 34621244469 | "telephone": "+34621244469" |
| blog/ppf-o-ceramico-que-elegir.html:165 | b-copy | Equipo SERRES | <span>Por <b>Equipo SERRES</b></span> |
| blog/ppf-o-ceramico-que-elegir.html:175 | f-alt | Sant Cugat | rativa de protección de pintura sobre un coche en el taller SERRES de Sant Cugat"> |
| blog/ppf-o-ceramico-que-elegir.html:236 | b-copy | IVA | <tr><td>Precio orientativo (IVA incl.)</td><td>Frontal 890 € · Pro 1.190 € · carrocería completa 2.390 €</td><td>Esencial 340 € · Signature 590 € · Concours 890 €</td></tr> |
| blog/ppf-o-ceramico-que-elegir.html:241 | b-copy | España | <p>Una nota sobre los precios: en España el PPF frontal suele moverse entre 1.500 € y 3.000 €, |
| blog/ppf-o-ceramico-que-elegir.html:244 | b-copy | Sant Cugat, Vallès | Sant Cugat del Vallès, sin intermediarios.</p> |
| blog/ppf-o-ceramico-que-elegir.html:371 | b-copy | +34, 621 24 44 69 | +34 621 24 44 69 con el modelo y te damos presupuesto cerrado, sin visitas comerciales ni |
| blog/ppf-o-ceramico-que-elegir.html:372 | b-copy | Sant Cugat, Vallès | letra pequeña. Atendemos con cita previa de lunes a sábado en Sant Cugat del Vallès, a 15 |
| blog/ppf-o-ceramico-que-elegir.html:373 | b-copy | Barcelona | minutos de Barcelona.</p> |
| blog/ppf-o-ceramico-que-elegir.html:385 | a-nap | 34621244469 | href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20he%20le%C3%ADdo%20el%20art%C3%ADculo%20sobre%20PPF%20o%20cer%C3%A1mico%20y%20quiero%20un%20presupuesto%20para%20mi%20coche. |
| blog/ppf-o-ceramico-que-elegir.html:387 | a-nap | +34, 34621244469, 621 24 44 69 | <a class="btn ghost" href="tel:+34621244469">+34 621 24 44 69</a> |
| assets/serres-i18n.js:57 | c-i18n | Barcelona | KEY: PPF, Car Wrap & Detailing in Barcelona \| SERRES |
| assets/serres-i18n.js:58 | c-i18n | Barcelona | VAL: ["PPF, Car Wrap y Detailing en Barcelona \| SERRES", "PPF, Car Wrap i Detailing a Barcelona \| SERRES"], |
| assets/serres-i18n.js:63 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: PPF, custom Car Wrap and concours-level detailing in Barcelona (Sant Cugat del Vallès) — engineered for the cars you build your life around. One works |
| assets/serres-i18n.js:64 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["PPF, Car Wrap a medida y detailing de nivel concours en Barcelona (Sant Cugat del Vallès), pensados para los coches alrededor de los que construyes tu vida. Un taller. Estándares obs |
| assets/serres-i18n.js:65 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "PPF, Car Wrap a mida i detailing de nivell concours a Barcelona (Sant Cugat del Vallès), pensats per als cotxes al voltant dels quals construeixes la teva vida. Un taller. Estàndards |
| assets/serres-i18n.js:91 | c-i18n | Lun–Sáb, Mon–Sat | KEY: Mon–Sat · By appointment |
| assets/serres-i18n.js:97 | c-i18n | Barcelona, España, Spain | KEY: Barcelona, Spain |
| assets/serres-i18n.js:111 | c-i18n | Barcelona | KEY: Every car gets its own room in this gallery of work. Shot in and around Barcelona — no stock photos, no rented cars. Pick a build below, or scroll the |
| assets/serres-i18n.js:112 | c-i18n | Barcelona | VAL: che tiene su propia sala en esta galería de trabajos. Fotografiado en Barcelona y alrededores — sin fotos de stock ni coches de alquiler. Elige un proyecto abajo o recorre la planta.", |
| assets/serres-i18n.js:113 | c-i18n | Barcelona | VAL: té la seva pròpia sala en aquesta galeria de treballs. Fotografiat a Barcelona i rodalies — sense fotos d'estoc ni cotxes de lloguer. Tria un projecte a sota o recorre la planta."], |
| assets/serres-i18n.js:121 | c-i18n | Barcelona, Collserola | KEY: A new G87 M2 wrapped in a deep frozen grey, photographed on a Barcelona rooftop with the Collserola tower behind it. Matte body, gloss-black detailing |
| assets/serres-i18n.js:122 | c-i18n | Barcelona, Collserola | VAL: on Car Wrap en un gris frozen profundo, fotografiado en una azotea de Barcelona con la torre de Collserola detrás. Carrocería mate, detalles en negro brillo, acentos de carbono.", |
| assets/serres-i18n.js:123 | c-i18n | Barcelona, Collserola | VAL: u amb Car Wrap en un gris frozen profund, fotografiat en un terrat de Barcelona amb la torre de Collserola al darrere. Carrosseria mat, detalls en negre brillant, accents de carboni."], |
| assets/serres-i18n.js:125 | c-i18n | Catal | KEY: A pearl-white GR Supra protected and sealed, then taken out into the Catalan countryside. |
| assets/serres-i18n.js:126 | c-i18n | catalán | VAL: n GR Supra blanco perla protegido y sellado, llevado después al campo catalán.", |
| assets/serres-i18n.js:133 | c-i18n | Catal | KEY: A matte-black XM wrapped in full PPF and finished inside and out — illuminated kidney grille, Alcantara starlight headliner and quad exhaust, shot on  |
| assets/serres-i18n.js:134 | c-i18n | catalan | VAL: lcantara y escape cuádruple, fotografiado en una carretera secundaria catalana con el sol entre las nubes.", |
| assets/serres-i18n.js:135 | c-i18n | catalan | VAL: ntara i escapament quàdruple, fotografiat en una carretera secundària catalana amb el sol entre els núvols."], |
| assets/serres-i18n.js:148 | c-i18n | nieve, Snow | KEY: Snow-dusted |
| assets/serres-i18n.js:151 | c-i18n | Collserola | KEY: Collserola |
| assets/serres-i18n.js:174 | c-i18n | nieve, Snow | KEY: Snow-dusted · The ramp |
| assets/serres-i18n.js:176 | c-i18n | Collserola | KEY: Front end · Collserola |
| assets/serres-i18n.js:229 | c-i18n | VAT | KEY: PPF (from €890), Car Wrap (from €250), Ceramic Coating (from €340) and detailing (from €35), VAT included. Three levels per service; every car is conf |
| assets/serres-i18n.js:230 | c-i18n | IVA | VAL: desde 250 €), Ceramic Coating (desde 340 €) y detailing (desde 35 €), IVA incluido. Tres niveles por servicio; cada coche se confirma con un presupuesto exacto en persona.", |
| assets/serres-i18n.js:231 | c-i18n | IVA | VAL: de 250 €), Ceramic Coating (des de 340 €) i detailing (des de 35 €), IVA inclòs. Tres nivells per servei; cada cotxe es confirma amb un pressupost exacte en persona."], |
| assets/serres-i18n.js:243 | c-i18n | VAT, EUR | KEY: © 2026 SERRES. All rights reserved. \u00A0·\u00A0 Guide prices in EUR, VAT included |
| assets/serres-i18n.js:244 | c-i18n | IVA, EUR | VAL: Todos los derechos reservados. \u00A0·\u00A0 Precios orientativos en EUR, IVA incluido", |
| assets/serres-i18n.js:245 | c-i18n | IVA, EUR | VAL: SERRES. Tots els drets reservats. \u00A0·\u00A0 Preus orientatius en EUR, IVA inclòs"], |
| assets/serres-i18n.js:248 | c-i18n | Barcelona | KEY: Exclusive — Car Transformation Projects in Barcelona \| SERRES |
| assets/serres-i18n.js:255 | c-i18n | Barcelona | KEY: The Exclusive is our complete car transformation project in Barcelona: paint correction, color change, PPF, Ceramic Coating, body work and interior — |
| assets/serres-i18n.js:256 | c-i18n | Barcelona | VAL: Exclusivo es nuestro proyecto de transformación completa de coches en Barcelona: corrección de pintura, cambio de color, PPF, Ceramic Coating, carrocería e interior — cada disciplina que ten |
| assets/serres-i18n.js:257 | c-i18n | Barcelona | VAL: 'Exclusiu és el nostre projecte de transformació completa de cotxes a Barcelona: correcció de pintura, canvi de color, PPF, Ceramic Coating, carrosseria i interior — cada disciplina que teni |
| assets/serres-i18n.js:312 | c-i18n | Sant Cugat | KEY: Detailing Studio in Sant Cugat — Why SERRES |
| assets/serres-i18n.js:317 | c-i18n | Sant Cugat, Vallès | KEY: We are a detailing studio in Sant Cugat del Vallès with one obsession: doing it properly. No shortcuts, no “good enough” — meticulous prep, premium ma |
| assets/serres-i18n.js:318 | c-i18n | Sant Cugat, Vallès | VAL: ["Somos un estudio de detailing en Sant Cugat del Vallès con una obsesión: hacerlo bien. Sin atajos, sin “ya vale” — solo preparación meticulosa, materiales premium y los mismos estánd |
| assets/serres-i18n.js:319 | c-i18n | Sant Cugat, Vallès | VAL: "Som un estudi de detailing a Sant Cugat del Vallès amb una obsessió: fer-ho bé. Sense dreceres, sense “ja n'hi ha prou” — només preparació meticulosa, materials premium i els mateixo |
| assets/serres-i18n.js:385 | c-i18n | Barcelona | KEY: SERRES — Paint Protection Film (PPF) |
| assets/serres-i18n.js:389 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: We install PPF in Barcelona, at our workshop in Sant Cugat del Vallès: an invisible urethane skin over your factory paint that absorbs stone chips, sw |
| assets/serres-i18n.js:390 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["Instalamos PPF en Barcelona, en nuestro taller de Sant Cugat del Vallès: una piel de uretano invisible sobre tu pintura de fábrica que absorbe impactos de piedra, micro-arañazos y ác |
| assets/serres-i18n.js:391 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "Instal·lem PPF a Barcelona, al nostre taller de Sant Cugat del Vallès: una pell d'uretà invisible sobre la teva pintura de fàbrica que absorbeix impactes de pedra, micro-ratllades i |
| assets/serres-i18n.js:463 | c-i18n | Barcelona | KEY: SERRES — Ceramic Coating |
| assets/serres-i18n.js:470 | c-i18n | Barcelona | KEY: The SERRES ceramic coating for cars in Barcelona: a SiO₂ coating that chemically bonds to the paint — sealing the gloss with a slick, hydrophobic laye |
| assets/serres-i18n.js:471 | c-i18n | Barcelona | VAL: ["El tratamiento cerámico para coche en Barcelona de SERRES: un recubrimiento SiO₂ que se adhiere químicamente a la pintura — sella el brillo con una capa hidrófoba y deslizante que re |
| assets/serres-i18n.js:472 | c-i18n | Barcelona | VAL: "El tractament ceràmic per a cotxe a Barcelona de SERRES: un recobriment SiO₂ que s'adhereix químicament a la pintura — segella la brillantor amb una capa hidròfoba i lliscant que rep |
| assets/serres-i18n.js:523 | c-i18n | Barcelona | KEY: SERRES — Detailing |
| assets/serres-i18n.js:530 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: Car detailing in Barcelona: steam cleaning, decontamination and hand finishing, inside and out, at our Sant Cugat del Vallès studio. Deep Clean from € |
| assets/serres-i18n.js:531 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["Detailing de coche en Barcelona: limpieza a vapor, descontaminación y acabado a mano, por dentro y por fuera, en nuestro estudio de Sant Cugat del Vallès. Deep Clean desde 150 €.", |
| assets/serres-i18n.js:532 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "Detailing de cotxe a Barcelona: neteja al vapor, descontaminació i acabat a mà, per dins i per fora, al nostre estudi de Sant Cugat del Vallès. Deep Clean des de 150 €."], |
| assets/serres-i18n.js:577 | c-i18n | Barcelona | KEY: SERRES — Paint Correction |
| assets/serres-i18n.js:584 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: SERRES car polishing in Barcelona is a multi-stage machine paint correction that removes micro-scratches, holograms and oxidation, restoring the true  |
| assets/serres-i18n.js:585 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["El pulido de coche en Barcelona de SERRES es una corrección multietapa a máquina que elimina micro-arañazos, hologramas y oxidación, devolviendo el brillo y la profundidad reales a t |
| assets/serres-i18n.js:586 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "El polit de cotxe a Barcelona de SERRES és una correcció multietapa a màquina que elimina micro-ratllades, hologrames i oxidació, tornant la brillantor i la profunditat reals a la te |
| assets/serres-i18n.js:639 | c-i18n | Barcelona | KEY: SERRES — Car Wrap / Vinyl |
| assets/serres-i18n.js:648 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: Car wrapping in Barcelona: we wrap your car with a full or partial color change using 3M, Avery Dennison and Inozetek films — over 150 colors in mat |
| assets/serres-i18n.js:649 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["Car wrapping en Barcelona: vinilamos tu coche con cambio de color total o parcial usando films 3M, Avery Dennison e Inozetek — más de 150 colores en mate, satinado, brillo, metalizad |
| assets/serres-i18n.js:650 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "Car wrapping a Barcelona: vinilem el teu cotxe amb canvi de color total o parcial amb films 3M, Avery Dennison i Inozetek — més de 150 colors en mat, setinat, brillant, metal·litzat |
| assets/serres-i18n.js:678 | c-i18n | Barcelona | KEY: SERRES — Body Kits |
| assets/serres-i18n.js:684 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: We fit body kits in Barcelona (workshop in Sant Cugat del Vallès): installation, painting and OEM-level fitment of lips, diffusers, spoilers and wideb |
| assets/serres-i18n.js:685 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["Realizamos el montaje de body kits en Barcelona (taller en Sant Cugat del Vallès): instalación, pintura y ajuste a nivel OEM de labios, difusores, alerones y conversiones widebody, d |
| assets/serres-i18n.js:686 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "Fem el muntatge de body kits a Barcelona (taller a Sant Cugat del Vallès): instal·lació, pintura i ajust a nivell OEM de llavis, difusors, alerons i conversions widebody, des de 450 |
| assets/serres-i18n.js:965 | c-i18n | Google Maps | KEY: SERRES Wrap Center on Google Maps |
| assets/serres-i18n.js:994 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: PPF, Car Wrap and detailing studio in Barcelona (Sant Cugat del Vallès): Ceramic Coating, multi-stage polishing and body kits. Get a quote on WhatsApp |
| assets/serres-i18n.js:995 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: ["Estudio de PPF, Car Wrap y detailing en Barcelona (Sant Cugat del Vallès): Ceramic Coating, pulido por etapas y body kits. Pide presupuesto por WhatsApp.", |
| assets/serres-i18n.js:996 | c-i18n | Barcelona, Sant Cugat, Vallès | VAL: "Estudi de PPF, Car Wrap i detailing a Barcelona (Sant Cugat del Vallès): Ceramic Coating, polit per etapes i body kits. Demana pressupost per WhatsApp."], |
| assets/serres-i18n.js:998 | c-i18n | Barcelona, Sant Cugat | VAL: ias marcas profesionales. Packs frontal y coche completo desde 890 €. Sant Cugat, Barcelona.", |
| assets/serres-i18n.js:999 | c-i18n | Barcelona, Sant Cugat | VAL: es marques professionals. Packs frontal i cotxe complet des de 890 €. Sant Cugat, Barcelona."], |
| assets/serres-i18n.js:1001 | c-i18n | Sant Cugat, Vallès | VAL: ennison e Inozetek. Más de 150 colores. Coche completo desde 1.490 €. Sant Cugat del Vallès.", |
| assets/serres-i18n.js:1002 | c-i18n | Sant Cugat, Vallès | VAL: Dennison i Inozetek. Més de 150 colors. Cotxe complet des de 1.490 €. Sant Cugat del Vallès."], |
| assets/serres-i18n.js:1004 | c-i18n | Barcelona, Sant Cugat | VAL: a 5 años de protección. Preparación y pulido según pack. Desde 340 €. Sant Cugat, Barcelona.", |
| assets/serres-i18n.js:1005 | c-i18n | Barcelona, Sant Cugat | VAL: a 5 anys de protecció. Preparació i polit segons pack. Des de 340 €. Sant Cugat, Barcelona."], |
| assets/serres-i18n.js:1007 | c-i18n | Barcelona, Sant Cugat | VAL: ún el estado de tu pintura. Adiós a arañazos, remolinos y hologramas. Sant Cugat, Barcelona.", |
| assets/serres-i18n.js:1008 | c-i18n | Barcelona, Sant Cugat | VAL: estat de la teva pintura. Adéu a esgarrapades, remolins i hologrames. Sant Cugat, Barcelona."], |
| assets/serres-i18n.js:1010 | c-i18n | Sant Cugat | VAL: eep Clean desde 150 €, Showroom Reset desde 490 €. Estudio premium en Sant Cugat.", |
| assets/serres-i18n.js:1011 | c-i18n | Sant Cugat | VAL: eep Clean des de 150 €, Showroom Reset des de 490 €. Estudi premium a Sant Cugat."], |
| assets/serres-i18n.js:1013 | c-i18n | Sant Cugat, Vallès | VAL: intura de body kits, spoilers y widebody con ajuste OEM. Desde 450 €. Sant Cugat del Vallès.", |
| assets/serres-i18n.js:1014 | c-i18n | Sant Cugat, Vallès | VAL: intura de body kits, spoilers i widebody amb ajust OEM. Des de 450 €. Sant Cugat del Vallès."], |
| assets/serres-i18n.js:1015 | c-i18n | VAT | KEY: PPF from €890, Car Wrap from €250, Ceramic Coating from €340 and detailing from €35, VAT included. Ask SERRES for your exact quote. |
| assets/serres-i18n.js:1016 | c-i18n | IVA | VAL: Wrap desde 250 €, Ceramic Coating desde 340 € y detailing desde 35 €, IVA incluido. Pide tu presupuesto exacto en SERRES.", |
| assets/serres-i18n.js:1017 | c-i18n | IVA | VAL: p des de 250 €, Ceramic Coating des de 340 € i detailing des de 35 €, IVA inclòs. Demana el teu pressupost exacte a SERRES."], |
| assets/serres-i18n.js:1018 | c-i18n | Sant Cugat, Vallès | KEY: Detailing studio in Sant Cugat del Vallès: PPF, Car Wrap and paint correction with certified materials and 98% of clients who recommend us. |
| assets/serres-i18n.js:1019 | c-i18n | Sant Cugat, Vallès | VAL: ["Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan.", |
| assets/serres-i18n.js:1020 | c-i18n | Sant Cugat, Vallès | VAL: "Estudi de detailing a Sant Cugat del Vallès: PPF, Car Wrap i correcció de pintura amb materials certificats i un 98% de clients que ens recomanen."], |
| assets/serres-i18n.js:1021 | c-i18n | Barcelona | KEY: SERRES projects in Barcelona: a gallery of real PPF, Car Wrap, Ceramic Coating and detailing work on Porsche, BMW, Toyota and Range Rover. |
| assets/serres-i18n.js:1022 | c-i18n | Barcelona | VAL: ["Proyectos de SERRES en Barcelona: galería de trabajos reales de PPF, Car Wrap, Ceramic Coating y detailing en Porsche, BMW, Toyota y Range Rover.", |
| assets/serres-i18n.js:1023 | c-i18n | Barcelona | VAL: "Projectes de SERRES a Barcelona: galeria de treballs reals de PPF, Car Wrap, Ceramic Coating i detailing en Porsche, BMW, Toyota i Range Rover."], |
| assets/serres-i18n.js:1024 | c-i18n | Barcelona | KEY: SERRES Exclusive: complete car transformation projects in Barcelona. Correction, color change, PPF, Ceramic Coating and interior. Only 6 a year. |
| assets/serres-i18n.js:1025 | c-i18n | Barcelona | VAL: ["Exclusivo SERRES: proyectos de transformación completa de coches en Barcelona. Corrección, cambio de color, PPF, Ceramic Coating e interior. Solo 6 al año.", |
| assets/serres-i18n.js:1026 | c-i18n | Barcelona | VAL: "Exclusiu SERRES: projectes de transformació completa de cotxes a Barcelona. Correcció, canvi de color, PPF, Ceramic Coating i interior. Només 6 a l'any."], |
| assets/serres-i18n.js:1030 | c-i18n | Barcelona | KEY: Complete transformation projects in Barcelona |
| assets/serres-i18n.js:1036 | c-i18n | Sant Cugat, Vallès | KEY: Detailing studio in Sant Cugat del Vallès |
| assets/serres-i18n.js:1037 | c-i18n | Sant Cugat | KEY: Professional detailing in Sant Cugat |
| assets/serres-i18n.js:1039 | c-i18n | Barcelona | KEY: PPF, Car Wrap & Detailing in Barcelona |
| assets/serres-i18n.js:1040 | c-i18n | Barcelona | KEY: Workshop in Barcelona |
| assets/serres-i18n.js:1041 | c-i18n | Barcelona | KEY: PPF, Car Wrap and detailing in Barcelona |
| assets/serres-i18n.js:1042 | c-i18n | Barcelona, Sant Cugat, Vallès | KEY: SERRES is a PPF, Car Wrap and detailing workshop in Sant Cugat del Vallès, minutes from Barcelona. We work with films from several professional brands |
| assets/serres-i18n.js:1043 | c-i18n | IVA, VAT | KEY: Every project is booked by appointment and inspected panel by panel under controlled hexagonal lighting; if anything falls short of our standard, it i |
| assets/serres-i18n.js:1044 | c-i18n | Barcelona | KEY: How much does PPF installation cost in Barcelona? |
| assets/serres-i18n.js:1045 | c-i18n | IVA, VAT | KEY: The front-end PPF pack starts at 890 € and the full car at 2,390 €, with a 3-year film warranty and VAT included. Message us on WhatsApp with your car |
| assets/serres-i18n.js:1049 | c-i18n | Barcelona, Sant Cugat, Vallès, 08174, Can Fatjó, 09:00 | KEY: We are at Av. Can Fatjó dels Aurons, 15, 08174 Sant Cugat del Vallès (Barcelona). We work by appointment: Monday to Friday from 09:00 to 19:00 and Sat |
| assets/serres-i18n.js:1051 | c-i18n | Barcelona | KEY: PPF in Barcelona — paint protection for your car |
| assets/serres-i18n.js:1056 | c-i18n | IVA, VAT | KEY: The front pack starts at 890 €, the full front at 1.190 € and the full body at 2.390 €, VAT included. The final price depends on the model and the con |
| assets/serres-i18n.js:1062 | c-i18n | Sant Cugat, Vallès | KEY: Paint decontamination and correction, cutting the pattern specific to your model, application in a clean booth and a panel-by-panel review under contr |
| assets/serres-i18n.js:1064 | c-i18n | +34, 621 24 44 69 | KEY: A front end is delivered in 1-2 working days; a full body, in 3-5 days. We work by appointment from Monday to Saturday: call or message us on WhatsApp |
| assets/serres-i18n.js:1068 | c-i18n | Barcelona | KEY: Car Wrap — car color change in Barcelona |
| assets/serres-i18n.js:1069 | c-i18n | Barcelona | KEY: Ceramic Coating — paint correction and ceramic sealing in Barcelona |
| assets/serres-i18n.js:1070 | c-i18n | Barcelona | KEY: Car detailing in Barcelona |
| assets/serres-i18n.js:1072 | c-i18n | Sant Cugat | KEY: What people ask before a detail — prices, timings and how we work in Sant Cugat. |
| assets/serres-i18n.js:1074 | c-i18n | IVA, VAT | KEY: We work with three fixed tiers, VAT included: Refresh from €35, Deep Clean with steam interior cleaning from €150 and Showroom Reset — the full inside |
| assets/serres-i18n.js:1082 | c-i18n | Sant Cugat, Vallès | KEY: We don't work by eye alone: we review the finish panel by panel under controlled hexagonal lighting, at our Sant Cugat del Vallès workshop. If anythin |
| assets/serres-i18n.js:1084 | c-i18n | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | KEY: We work by appointment only, Monday to Saturday, at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona). Message us on WhatsApp or call +3 |
| assets/serres-i18n.js:1087 | c-i18n | Barcelona | KEY: Ceramic coating for cars in Barcelona |
| assets/serres-i18n.js:1090 | c-i18n | IVA, VAT | KEY: We work with three fixed packs, VAT included: Essential from €340, Signature from €590 and Concours from €890. The final price depends on the size of  |
| assets/serres-i18n.js:1100 | c-i18n | Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | KEY: By prior appointment from Monday to Saturday at our workshop in Sant Cugat del Vallès (Av. Can Fatjó dels Aurons 15). Message us on WhatsApp or call + |
| assets/serres-i18n.js:1104 | c-i18n | Barcelona | KEY: Work gallery — PPF, Car Wrap & Detailing in Barcelona |
| assets/serres-i18n.js:1105 | c-i18n | Barcelona | KEY: PPF protection in Barcelona |
| assets/serres-i18n.js:1107 | c-i18n | Barcelona | KEY: Body kit fitting in Barcelona |
| assets/serres-i18n.js:1109 | c-i18n | Barcelona | KEY: Car Wrap and color change in Barcelona |
| assets/serres-i18n.js:1112 | c-i18n | Sant Cugat | KEY: What we get asked every week at the Sant Cugat workshop. If your question isn't here, message us on WhatsApp. |
| assets/serres-i18n.js:1114 | c-i18n | IVA, VAT | KEY: Aero add-ons —splitter, diffuser or spoiler— start at €450. A complete kit with fitting and paint starts at €1,490, and a full widebody transformation |
| assets/serres-i18n.js:1118 | c-i18n | Sant Cugat, Vallès | KEY: Yes. We guarantee the mounting, the panel-gap fitment and the paint finish of the installed kit. All the work is done at our Sant Cugat del Vallès wor |
| assets/serres-i18n.js:1124 | c-i18n | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | KEY: We work by appointment Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès, 20 minutes from Barcelona. Message us on WhatsApp or |
| assets/serres-i18n.js:1127 | c-i18n | Barcelona | KEY: PPF, Car Wrap, Ceramic Coating & Detailing prices in Barcelona |
| assets/serres-i18n.js:1131 | c-i18n | Barcelona | KEY: Car polishing in Barcelona — paint correction |
| assets/serres-i18n.js:1135 | c-i18n | Barcelona | KEY: How much does car polishing cost in Barcelona? |
| assets/serres-i18n.js:1136 | c-i18n | IVA, VAT | KEY: At SERRES Wrap Center polishing with a SiO₂ Ceramic Coating starts at 340 € (Essential, VAT included). The Signature level, with multi-stage correctio |
| assets/serres-i18n.js:1142 | c-i18n | Sant Cugat, Vallès | KEY: We work in three stages: cutting to remove the defects, refining and final finishing. We review the car panel by panel under controlled hexagonal ligh |
| assets/serres-i18n.js:1146 | c-i18n | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | KEY: Message us on WhatsApp at +34 621 24 44 69 or call us and we'll book you in Monday to Saturday. We are at Av. Can Fatjó dels Aurons 15, Sant Cugat del |
| assets/serres-i18n.js:1149 | c-i18n | Barcelona | KEY: Car wrapping in Barcelona — wrap your car |
| assets/serres-i18n.js:1155 | c-i18n | IVA, VAT | KEY: A full color change with 3M, Avery Dennison or Inozetek films starts at €1,490 VAT included; accents (roof, mirrors, pillars) from €250 and the Signa |
| assets/serres-i18n.js:1159 | c-i18n | Sant Cugat, Vallès | KEY: The 3M, Avery Dennison and Inozetek films we install last between 5 and 7 years outdoors with normal care, and the manufacturer backs them with its of |
| assets/serres-i18n.js:1164 | c-i18n | Barcelona, Sant Cugat, Vallès, Can Fatjó, +34, 621 24 44 69 | KEY: We work by appointment from Monday to Saturday at Av. Can Fatjó dels Aurons 15, Sant Cugat del Vallès (Barcelona), 20 minutes from central Barcelona.  |
| assets/serres-enhance.js:14 | a-nap | +34, 34621244469, 621 24 44 69 | var WA_DIGITS = "34621244469"; // +34 621 24 44 69 |
| assets/serres-enhance.js:19 | a-nap | +34, 621 24 44 69 | var TEL_TEXT = "+34 621 24 44 69"; |
| assets/serres-enhance.js:164 | a-nap | Barcelona, Sant Cugat, Vallès | '<div class="srs-menu-contact">Sant Cugat del Vallès, Barcelona<br><a href="' + TEL_HREF + '">' + TEL_TEXT + '</a></div>' + |
| _build/verify-seo.js:45 | g-config | G-1K6FYZ99GN | const gtagHead = (html.match(/googletagmanager\.com\/gtag\/js\?id=G-1K6FYZ99GN/g) \|\| []).length; |
