# RECON — i18n architecture of SERRES Wrap Center V12 (for the Miami port)

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12` — abbreviated `V12/` below.
All line numbers are 1-based and were taken from the files as they are today (2026-09-02). Nothing in V12 was modified.

Helper scripts I wrote while auditing (scratchpad only — the scratchpad is wiped, so copy whatever the port keeps into the deliverable's `_build/`):

- `scratchpad/recon/analyze-dict-v2.js` — extracts DICT the same way `_build/dict-tools.js` does and prints shape/collision/geo stats.
- `scratchpad/recon/extract-inline-v2.js` — lists every natural-language string literal inside inline `<script>` blocks and `serres-enhance.js`, tagged `[EN-KEY]` / `[ES-VAL]` / `[NOT-IN-DICT]`.
- `scratchpad/recon/walk-check-v2.js` — a runtime-faithful (regex tokenizer, no deps) DOM walk that reproduces `bindText/bindAttrs/bindKeyed/bindMeta` normalisation and reports bound vs orphan strings per page. Output: `scratchpad/recon/orphans/_ALL.txt`. This is the seed for the `_build/` orphan checker required by the brief (section 9.6).

---

## 0. Executive summary (what the port must know first)

1. **Nothing in the HTML loads `serres-i18n.js`.** Every page loads only `assets/serres-enhance.js` with `defer`; `serres-enhance.js:285-291` (`loadI18n()`) injects `<script id="srs-i18n-script" src="<base>assets/serres-i18n.js">` into `<body>` at runtime, after the mobile menu is built and the counters zeroed (`init()` at `:352`). There is **no inline config** anywhere — all i18n configuration is inside `serres-i18n.js` (`STORE`, `LANGS`, `LABELS`, default language).
2. **Base language = Spanish**, hard-coded: `getLang()` returns `"es"` when localStorage is empty (`serres-i18n.js:1196`). `<html lang="es">` on all 16 pages (line 2); `og:locale es_ES` on all 16 pages; JSON-LD `inLanguage` `"es"`/`"es-ES"` only on the 5 blog pages.
3. **Dictionary**: `var DICT` at `serres-i18n.js:31-1166`, **790 entries**, exact shape `"English key": ["español", "català"]` (0 duplicate keys, 0 non-standard values). Values are plain text: no HTML, no placeholders, no pipes except the `| SERRES` in 10 `<title>` keys. 10 keys embed `\u00A0` (NBSP). 1 empty translation (`"a reality": ["",""]`, `:79`). 20 identity entries (es === key). 1 key with a trailing space (`"Film Colors "`, `:642`). 115 single-token keys.
4. **Inverted index INV** (`:1174-1181`): built from the trimmed **es** value → first key wins (7 collisions: "Taller", "Camaleón"×2, "Detalle trasero", "Parrilla iluminada", "Valoración media", "Colores de film"). `enKeyOf()` (`:1184-1188`) checks **DICT first, then INV**, so English inline text is *also* accepted today (that is how the JS-injected English menu labels bind). A miss is silent (`bindText:1246 return`).
5. **What gets translated**: whole text nodes under `<body>` (TreeWalker), `aria-label` + `title` attributes, `document.title`, `meta[name=description]`, and `[data-en]` keyed elements. Skipped: `SCRIPT/STYLE/TEXTAREA` parents, anything under `[data-i18n-skip]` (44 subtrees), text directly under a `[data-en]` element. **Not** translated: `alt` (62 Spanish alts), OG/Twitter meta, JSON-LD, `data-*`, hrefs (WhatsApp prefill text is Spanish inside every `wa.me` URL).
6. **Matching is exact, per text node, after `affix()`** (`:1210-1221`): strip leading/trailing `\s` (JS Unicode whitespace, which includes NBSP), then strip one wrapping pair of `“ ”` or `" "` quotes. No case folding, no internal whitespace collapse, no Unicode normalisation, no substring matching. A node like `Sant Cugat del Vallès, Barcelona  ·` (8 service/page footers) does not match and stays Spanish forever.
7. **Data-driven sections** re-render themselves via `window.SERRES_I18N.t()` on `serres:langchange`: prices tiers/tabs/table (`pages/prices.html:466-567`), testimonials (`pages/why-serres.html:465-480`), PPF color carousel (`services/ppf.html:873-965`), vinyl palette (`services/vinyl.html:914-957`), gallery lightbox note (`pages/gallery.html:698,705`). Their containers carry `data-i18n-skip`. Their source strings are **already English keys** — they need no inversion, only currency/NAP edits.
8. **`data-en` is used exactly twice** (`index.html:798`, `pages/why-serres.html:338`). Both exist only because of the reverse (ES→EN) direction and both disappear naturally in an EN-base site.
9. **Switcher** is 100 % JS-injected (`serres-i18n.js:1368-1432`), rendered from `LANGS`; no HTML/CSS in the pages references it. Dropping Catalan = editing `LANGS`/`LABELS` at `:23-24` and pruning `[1]` of every value.
10. **Hard-coded Spanish in JS not in the dictionary**: `serres-enhance.js:15` (WhatsApp prefill), `:164` (NAP line in mobile menu), `pages/prices.html:525` (WhatsApp prefill built around translated names), `:489` (`fmtEur`, dot-thousands + " €" in every language), `services/vinyl.html:690` (`"Wrap Film Serie 2080"`).
11. **The blog is effectively Spanish-only**: article prose, meta, related grid and the index card grid are `data-i18n-skip`; h1 fragments, TOC links, eyebrows, breadcrumbs, `<title>` and description have no dictionary entries (45 orphan strings). Decision needed for Miami (section 9.8).
12. **Page count**: the brief says 15 pages but lists 16 (index + 4 pages + 6 services + blog index + 4 articles); `_build/verify-seo.js:11-19` also lists 16. Treat it as 16.

---

## 1. Runtime configuration: LANGS / LABELS / storage / default / URL / `<html lang>` / dir

| Item | Where | Exact behavior |
|---|---|---|
| Storage key | `serres-i18n.js:22` | `var STORE = "serres-lang";` — `localStorage` only (no cookie, no sessionStorage). Read at `:1195`, written at `:1351`, both inside `try/catch`. |
| Language list | `:23` | `var LANGS = ["en", "es", "ca"];` — order = render order of the switcher buttons and the guard list in `getLang()`/`setLang()`. |
| Labels | `:24` | `var LABELS = { en: "EN", es: "ES", ca: "CA" };` — button text **and** button `aria-label` (`:1399-1401`). |
| Default language | `:1193-1197` | `getLang()`: value from localStorage if it is in `LANGS`, otherwise `"es"`. **No** `navigator.language` sniffing, **no** `?lang=`, **no** `#hash`, **no** `<html lang>` read-back, **no** cookie. `var current = getLang();` at `:1198` is evaluated once at script load. |
| Set language | `:1345-1361` | `setLang(l)`: ignores unknown/unchanged (`:1346-1349`, re-syncs switcher if same), persists, `applyAll()`, `syncSwitchers()`, dispatches `CustomEvent("serres:langchange", {detail: l})` on `window` (fallback `createEvent` for old browsers `:1356-1360`). |
| `<html lang>` mutation | `:1338` | `applyAll()` first line: `document.documentElement.setAttribute("lang", current)`. Runs at init (`:1461`) and on every change. So in the current site the attribute is rewritten to `es`/`en`/`ca`. |
| `dir` | — | Never touched. No `dir=` attribute anywhere in the 16 pages (grep: 0). |
| Public API | `:1464-1468` | `window.SERRES_I18N = { get: () => current, set: setLang, t: tr }`. |
| Initial event | `:1471-1477` | `init()` ends by dispatching `serres:langchange` with the stored language so data-driven sections re-render (they first render in **English** because `T()` falls back to identity while `SERRES_I18N` is undefined — see section 4.6). |
| Boot | `:1480-1484` | `DOMContentLoaded` if still loading, else immediate. Because the script is injected dynamically from a `defer` script, in practice it runs immediately when it arrives (`readyState` is already `interactive`/`complete`). |
| Loader | `serres-enhance.js:285-291` | `loadI18n()`: idempotent by id `srs-i18n-script`; `s.src = base + 'assets/serres-i18n.js'`; appended to `document.body` (dynamic insert → async execution). `base` is `"../"` when `location.pathname` matches `/\/(services|pages|blog)\//` (`:22-24`), else `""`. **If blog slugs move to a different folder name, `:23` must change.** |
| Page include | 16 × `<script src="[../]assets/serres-enhance.js" defer>` | `index.html:1018`, `pages/gallery.html:747`, `pages/prices.html:570`, `pages/projects.html:397`, `pages/why-serres.html:485`, `services/body-kits.html:680`, `services/ceramic.html:649`, `services/detailing.html:513`, `services/paint-correction.html:734`, `services/ppf.html:970`, `services/vinyl.html:1293`, `blog/index.html:145`, `blog/cuanto-cuesta-ppf-coche.html:447`, `blog/cuanto-cuesta-vinilar-un-coche.html:432`, `blog/limpieza-tapiceria-coche-precio.html:445`, `blog/ppf-o-ceramico-que-elegir.html:446`. No `async`, no inline `<script>` references `serres-i18n`, no `window.SERRES_*` config in any page (grep: 0). |

Execution order on every page (matters for the plan):

1. Inline page scripts run during parsing (GA4 config block near the top; feature scripts near the bottom, e.g. `pages/prices.html:350-568` renders the tiers **in English** because `T()` at `:466` returns its input while `window.SERRES_I18N` is undefined).
2. `serres-enhance.js` (`defer`) → `init()` `:352`: `build()` (hamburger + `.srs-menu` overlay with English `MENU` labels `:29-37`, Spanish NAP line `:164`, aria-labels `:139,156,199`), `setupCounters()` (rewrites `innerHTML` of `.hstat b, .rv-stat b, .gb-val, [data-count-up]` to start at 0 unless reduced-motion `:219-236`), `loadI18n()`, `externalOpener()`, `optimizeHeroVideo()`.
3. `serres-i18n.js` arrives → `init()` `:1456-1478`: `injectStyle()`, `bindMeta()`, `walk(document.body)` (binds everything present, including the injected menu), `mountSwitchers()`, `applyAll()`, `observe()`, expose API, dispatch `serres:langchange` → data-driven sections re-render in the stored language.

Consequence today: Spanish visitors see an English flash in the prices/testimonials/palette sections until step 3. In an EN-base Miami site the first paint is already correct and only ES visitors get the (brief) EN flash — an improvement, no change needed.

---

## 2. Dictionary shape

### 2.1 Location and size
- `var DICT = {` at `serres-i18n.js:31`, closing `};` at `:1166`. Header comment `:26-30` documents the shape: `"English source" : ["español", "català"]` and that `""` means "render nothing in that language".
- **790 entries** after JS object evaluation; **790 key lines in source → 0 duplicate keys** (a duplicate would silently be overwritten by the later one; none exist).
- Every value is a 2-element array of strings (0 exceptions).
- Key length: min 2 (`"yr"`), median 19, max 380 chars; 45 keys are longer than 200 chars (FAQ answers, meta descriptions).
- File is 163 KB / 1485 lines; the runtime engine is only `:1168-1485` (~320 lines).

### 2.2 Section comments (grouping is cosmetic; the object is flat)
| Line | Section | Entries |
|---|---|---|
| 32 | NAV / shared actions | 22 |
| 56 | HOME | 37 |
| 106 | GALLERY (incl. sub-comments `:142,169,202,212`) | 90 |
| 224 | PRICES (static chrome only; tiers handled in-page) | 13 |
| 247 | PROJECTS / EXCLUSIVO | 36 |
| 311 | WHY SERRES (static; testimonials in-page) | 34 |
| 363 | SERVICE: shared | 19 |
| 384 | SERVICE: PPF | 50 |
| 462 | SERVICE: CERAMIC | 38 |
| 522 | SERVICE: DETAILING | 36 |
| 576 | SERVICE: PAINT CORRECTION | 38 |
| 638 | SERVICE: VINYL | 27 |
| 677 | SERVICE: BODY KITS | 32 |
| 729-732 | banner comment: DATA-DRIVEN SECTIONS (rendered from JS via `SERRES_I18N.t()`) | — |
| 734 | PRICES: tab labels + UI words | 12 |
| 748 | PRICES: service blurbs | 6 |
| 768 | PRICES: tier names | 15 |
| 791 | PRICES: tier descriptions | 18 |
| 847 | PRICES: turnaround notes | 12 |
| 861 | PRICES: comparison-row labels | 34 |
| 897 | PRICES: comparison-cell values | 21 |
| 920 | WHY SERRES: testimonial roles, services, quotes | 63 (includes the following two unlabelled blocks) |
| 946-947 | VINYL / PPF: finish families (display only — `data-finish` keeps English) | (in the 63) |
| 961-962 | STRINGS BAKED IN SPANISH (EN key = original English text) | (in the 63) |
| 992-993 | SEO META DESCRIPTIONS (EN key = *legacy* English description) | (in the 63) |
| 1028 | SEO package 2026-07-09: FAQ, keyword lines, blog | 137 |

`_build/dict-tools.js:102` appends new entries under a hard-coded `SEO package 2026-07-09` comment — the "merge" command's insertion point is the closing brace of DICT, not a section.

### 2.3 Value characteristics (all verified programmatically)
- **HTML in values**: none (0 keys or es values contain `<x`/`</`).
- **Placeholders** (`{x}`, `%s`, `${}`): none.
- **Pipes**: only in the 10 `<title>` keys (`| SERRES`): `:57, 107, 225, 248, 385, 463, 523, 577, 639, 678`.
- **NBSP `\u00A0`** inside 10 keys and their values (footer copyright lines): `:139, 243, 307, 359, 458, 518, 572, 634, 673, 725` — pattern `"© 2026 SERRES. All rights reserved. \u00A0·\u00A0 …"`. In the HTML these are written as `&nbsp;` (2–4 per page) and the parser yields U+00A0, which matches the JS escape byte-for-byte. The Miami checker must decode `&nbsp;` → U+00A0 before comparing.
- **Other special characters that must be preserved exactly**: `\u2122` (™) in `:667`; `SiO₂` (U+2082) in ~15 keys; `—` U+2014, `–` U+2013, `·` U+00B7 everywhere; curly quotes `“ ”` inside key `:317`; ASCII apostrophes in keys (`"What's Included"` `:49`, `"isn't"` `:261`, `"we'll"` `:304`) — never normalised.
- **Newline/tab inside keys**: none. Multi-line source entries are single-line strings.
- **Leading/trailing whitespace**: exactly one key, `"Film Colors "` (`:642`, trailing space, es `"Colores de film "`). It exists to be distinct from `"Film Colors"` (`:393`). INV trims both → `:393` wins; `:642` is unreachable via INV and only reachable as a direct key.
- **Empty values**: exactly one — `"a reality": ["", ""]` (`:79`), consumed by the `data-en` element at `index.html:798`.
- **Identity entries (es === key)**, 20: `"CAR WRAP"` :80, `"Body Kits"` :83, `"Paint Protection Film"` :96, `"RAUH-Welt Begriff"` :114, `"Detailing"` :118, `"Collserola"` :151, `"Wrap"` :153, `"Interior"` :167, `"Ceramic Coating"` :273, `"Film"` :374, `"Kit"` :381, `"Paint"` :387, `"Armor"` :388, `"Car"` :641, `"Reversible"` :645, `"3M™ 2080 Satin Black"` :667, `"VW Golf GTI Mk7 · Tornado Red"` :698, `"Car Wrap"` :735, `"Pro"` :773, `"Frozen Matte"` :958. These are the "protect this brand term" mechanism (section 8). 40 further entries have ca === es.
- **Case-distinct near-duplicates** (all intentional, both needed): `"From"`/`"from"` :739-740, `"Workshop"`/`"workshop"` :316/:342, `"Self-Healing"`/`"Self-healing"` :392/:418, `"Cure."`/`"Cure"` :489/:503, `"Exclusive."`/`"Exclusive"` :239/:249.
- **Single-token keys (≤12 chars, no space): 115.** These are the risky ones in forward mode (section 9.4). Full list from the analysis: Services, Gallery, Projects, Prices, Contact, Scroll, Elevate, Ceramic, Studio, Hours, Phone, Follow, Our, The, Detailing, Frames, Snow-dusted, Winter, Rooftop, Collserola, Wrap, Gloss, Detail, Interior, Cockpit, level., Compare, levels, Exclusive., Exclusive, Everything., Bespoke, Explore, Why, Workshop, Obsessive, prep, Results, Premium, materials, One, workshop, Cars, Referrals, standard., Before, After, Vehicle, Coverage, Warranty, Finish, Film, Process, Effect, Coating, Lifespan, Defects, Turnaround, Kit, Fitment, Paint, Armor, Self-Healing, Stone-chip, defense, Self-healing, topcoat, Fully, removable, drive., Liquid, Glass, Protection, Cure., Application, Cure, gloss., Showroom, Fresh, Lived-in, Dust-caked, Protect., Staged, polishing, Holograms, Car, Reversible, Layers, color?, Presence, presence., pricing, From, from, Feature, Accents, Pro, Essential, Enhancement, Two-Stage, Scope, Optional, All, Satin, Matte, Flip, Metallic, Pearl, yr, Head-on, Home, Contents, clear., Related:, Breadcrumb.
- **Swapped-order split headings** (the ES translation of fragment A is the *second* word and vice-versa — these must keep the exact fragmentation in the EN markup): `"Obsessive"→"Preparación"` / `"prep"→"obsesiva"` :326-327; `"Premium"→"Materiales"` / `"materials"→"premium"` :336-337; `"Liquid"→"Cristal"` / `"Glass"→"líquido"` :465-466; `"Showroom"→"Como recién"` / `"Fresh"→"entregado"` :525-526; `"Staged"→"Pulido"` / `"polishing"→"por etapas"` :579-580; `"Stone-chip"→"Defensa contra"` / `"defense"→"impactos"` :413-414; `"Self-healing"→"Capa superior"` / `"topcoat"→"autorreparable"` :418-419; `"Stain &"→"Resistente a"` / `"UV resistant"→"manchas y UV"` :423-424; `"Fully"→"Totalmente"` / `"removable"→"reversible"` :428-429; `"Built for"→"Hecho para"` / `"Presence"→"impactar"` :680-681; `"We make your"→"Hacemos realidad tu"` / `"dream car"→"coche soñado"` / `"a reality"→""` :77-79.

### 2.4 Title and meta-description keys are NOT true pairs
- `<title>` keys use a legacy English pattern that is *not* the SEO title: `"SERRES — Prices"` :225, `"SERRES — Paint Protection Film (PPF)"` :385, `"SERRES — Ceramic Coating"` :463, `"SERRES — Detailing"` :523, `"SERRES — Paint Correction"` :577, `"SERRES — Car Wrap / Vinyl"` :639, `"SERRES — Body Kits"` :678, while their es values are the real SEO titles present in each page's `<title>` (e.g. `services/ceramic.html:6`). Home/gallery/projects/why-serres use SEO-style EN keys (`:57, 107, 248, 312`).
- Meta descriptions `:994-1026`: EN keys are "legacy English description" (comment `:992-993`) whose *content* differs from the es (e.g. `:997` EN talks about finishes; ES about 50 colors and the 890 € price). The 5 blog pages have **no** title/description entries at all (my walker: `TITLE ORPHAN`, `DESC ORPHAN` for `blog/index.html` and the 4 articles).
- For Miami every page's `<title>`/description must be **the English SEO text and the key at the same time**, with a freshly written es value → 16 new title + 16 new description entries replacing `:57,107,225,248,312,385,463,523,577,639,678` and `:994-1026`.

### 2.5 Geo/currency/legal tokens baked into the dictionary (must all be rewritten for Miami)
| Token | Entries | Lines |
|---|---|---|
| `Barcelona` | 49 | 57, 63, 97, 111, 121, 248, 255, 385, 389, 463, 470, 523, 530, 577, 584, 639, 648, 678, 684, 994, 997, 1003, 1006, 1021, 1024, 1030, 1039, 1040, 1041, 1042, 1044, 1049, 1051, 1068, 1069, 1070, 1084, 1087, 1104, 1105, 1107, 1109, 1124, 1127, 1131, 1135, 1146, 1149, 1164 |
| `Sant Cugat` | 32 | 63, 312, 317, 389, 530, 584, 648, 684, 994, 997, 1000, 1003, 1006, 1009, 1012, 1018, 1036, 1037, 1042, 1049, 1062, 1072, 1082, 1084, 1100, 1112, 1118, 1124, 1142, 1146, 1159, 1164 |
| `Vallès` | 24 | subset of the above |
| `+34 621 24 44 69` | 6 | 1064, 1084, 1100, 1124, 1146, 1164 |
| `€` (price literals) | 21 | 229, 389, 530, 648, 684, 997, 1000, 1003, 1009, 1012, 1015, 1045, 1056, 1066, 1074, 1078, 1090, 1114, 1136, 1144, 1155 |
| `VAT`/`IVA` | 11 | 229, 243, 1015, 1043, 1045, 1056, 1074, 1090, 1114, 1136, 1155 |
| `EUR` | 1 | 243 (`"Guide prices in EUR, VAT included"`) |
| `08174` | 1 | 1049 |
| `Av. Can Fatjó dels Aurons` | 6 | 1049, 1084, 1100, 1124, 1146, 1164 |
| `Catalan` countryside/back road | 2 | 125, 133 |
| `Collserola` | 3 | 121, 151, 176 |
| `"Barcelona, Spain"` | 1 | 97 |
| hours `Monday to Friday 09:00-19:00 / Saturdays 10:00-14:00` | 1 | 1049 (+ `"Mon–Sat · By appointment"` :91) |
| `ITV`, `DGT` | 0 | (they live in the blog prose, which is outside the dictionary) |

Note `"Miami Blue"` already appears as a 3M/Inozetek color name (`services/ppf.html:841`, `services/vinyl.html:853`) — an acceptance grep for "Miami" is meaningless; grep for Barcelona-side tokens only.

---

## 3. The inverted index (INV) layer

```js
// serres-i18n.js:1174-1181
var INV = {};
(function () {
  for (var k in DICT) {
    if (!DICT.hasOwnProperty(k)) continue;
    var v = (DICT[k][0] || "").replace(/^\s+|\s+$/g, "");
    if (v && !INV.hasOwnProperty(v)) INV[v] = k;
  }
})();
// :1184-1188
function enKeyOf(core) {
  if (DICT.hasOwnProperty(core)) return core;
  if (INV.hasOwnProperty(core)) return INV[core];
  return null;
}
```

- **Source**: the **es** value only (`DICT[k][0]`); ca values are never indexed.
- **Normalisation**: trim leading/trailing `\s` only. JS `\s` = `[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]` — so NBSP at the ends is trimmed, internal NBSP is kept. **No** lowercase, **no** whitespace collapse, **no** NFC/NFD, **no** entity handling (the DOM already decoded), **no** punctuation stripping.
- **Collisions**: first key in object order wins (`!INV.hasOwnProperty(v)`). 7 collisions today:
  - `"Detalle trasero"` → `"Rear detail"` :152 (shadows `"Rear deck detail"` :177)
  - `"Parrilla iluminada"` → `"Lit grille"` :163 (shadows `"Illuminated kidney grille"` :184)
  - `"Taller"` → `"Studio"` :88 (shadows `"Workshop"` :316) — the reason for `data-en="Workshop"` at `pages/why-serres.html:338`
  - `"Valoración media"` → `"Average Rating"` :315 (shadows `"Avg Rating"` :353)
  - `"Colores de film"` → `"Film Colors"` :393 (shadows `"Film Colors "` :642)
  - `"Camaleón"` → `"Color Flip"` :951 (shadows `"Color Shift"` :952 and `"Flip"` :953)
  The shadowed keys are still reachable *as keys* (JS `T()` calls and `data-en`), which is how the site works today.
- **Empty es** (`"a reality"`) is skipped, so an empty Spanish text node can never bind via INV (that is why `data-en` exists).
- **Ambiguity check** (es value that is also a key of a *different* entry, which `enKeyOf` would mis-resolve as English): 0 today.
- **Miss behavior**: `enKeyOf` returns `null`; `bindText:1246`, `bindAttrs:1267`, `bindKeyed:1288`, `bindMeta:1324/1328` all just skip — nothing is logged, nothing is marked. Untranslated text is indistinguishable from intentionally-skipped text at runtime, hence the brief's requirement for a build-time orphan checker.
- INV size today: 782 (790 − 1 empty − 7 collisions).

---

## 4. Exactly which DOM nodes are translated

### 4.1 Text nodes — `walk()` `:1301-1319` + `bindText()` `:1234-1251`
- Root: `document.body` at init (`:1459`); later any node added to the DOM (MutationObserver `:1437-1451`, `childList + subtree`, walks each `addedNode` of type 1 or 3).
- `walk(root)`: if `root` is an element inside `[data-i18n-skip]` → return (whole subtree skipped, `:1305`). Otherwise `createTreeWalker(root, SHOW_TEXT)` collects **every** text node (`:1307-1310`), including those inside `<a>`, `<b>`, `<small>`, `<summary>`, `<figcaption>`, `<option>`, `<h1>` spans, etc. There is no tag whitelist.
- `bindText(tn)` exclusions, in order: already seen (WeakSet `:1226,1235`), empty/whitespace-only after `trim()` (`:1237`), no parent (`:1239`), parent nodeName `SCRIPT`/`STYLE`/`TEXTAREA` (`:1241`), any ancestor-or-self with `data-i18n-skip` (`inSkip` `:1229-1232`, uses `closest`), parent element has `data-en` (`:1243`).
- Then `affix(raw)` `:1210-1221` → `{lead, core, trail}`; `enKeyOf(core)`; on hit push `{node, lead, core: <EN key>, trail}` and `applyText()` → `nodeValue = lead + tr(key) + trail` (only if different, `:1255`). Whole text node only. Text nodes containing markup boundaries are separate nodes (e.g. `<h2>¿Cuánto cuesta el <span>PPF</span> para tu coche?</h2>` = 3 nodes, 3 lookups).
- `tr(core)` `:1200-1206`: `en` → return the key itself; `es` → `e[0]`; anything else → `e[1]`; unknown key → return input; a `""` value is returned as `""` (only `null`/`undefined` fall back to the key).

### 4.2 Attributes — `bindAttrs()` `:1258-1275`
- `ATTRS = ["aria-label", "title"]` (`:1227`). Applied to the walk root itself and `root.querySelectorAll("[aria-label],[title]")` (`:1312-1314`), skipping `[data-i18n-skip]` subtrees. Same `affix` + `enKeyOf`. Bound state is an expando `el["__i18n_aria-label"]` / `el["__i18n_title"]` (`:1268-1270`).
- **Not** handled: `alt`, `placeholder`, `value`, `label`, `aria-description`, `aria-current`, `content` of any `<meta>` other than description, `data-*`, `href`, `<option>`/`<select>`. Site inventory: `placeholder` 0, `<form>/<input>/<textarea>` 0, `title=` 1 (`index.html:858` iframe, bound to `"SERRES Wrap Center on Google Maps"` :965), `aria-label` 37 (31 bound, 6 orphan; see 4.7), `alt` 62 (all Spanish, none translated; `pages/gallery.html` alone has 32 e.g. `:344,349,354…638`; the lightbox copies them into `#lbImg` at `pages/gallery.html:704`).

### 4.3 Meta — `bindMeta()` `:1323-1331`, `applyMeta()` `:1332-1335`
- `document.title.trim()` → `enKeyOf` (note: **`trim()` only, no quote-stripping**); `meta[name="description"]` content `.trim()` → `enKeyOf`. Applied on every `applyAll()`.
- Untouched: `<meta property="og:*">`, `twitter:*`, `og:locale` (`es_ES` on all 16 pages: line 11 of the 11 non-blog pages, `blog/index.html:16`, articles `:19/:20/:20/:19`), `<link rel=canonical>`, JSON-LD (`inLanguage` `"es"` at `blog/index.html:37`, `blog/ppf-o-ceramico-que-elegir.html:59`, `blog/cuanto-cuesta-ppf-coche.html:51`; `"es-ES"` at `blog/cuanto-cuesta-vinilar-un-coche.html:48`, `blog/limpieza-tapiceria-coche-precio.html:52`; the other 11 pages declare no `inLanguage`). No `hreflang`/`rel=alternate` anywhere (grep: 0) — languages share one URL, so ES content is JS-only for crawlers; same will be true in Miami.

### 4.4 `innerHTML` replacements by the i18n engine
None. The engine only writes `nodeValue`, `setAttribute`, `textContent` (keyed elements), `document.title`.

### 4.5 `[data-en]` keyed elements — `bindKeyed()` `:1282-1293`, `applyKeyed()` `:1295-1299`
See section 5.

### 4.6 Data-driven sections (JS templates translated via `window.SERRES_I18N.t`)
Each defines `function T(s){return (window.SERRES_I18N&&window.SERRES_I18N.t)?window.SERRES_I18N.t(s):s;}` and re-renders on `serres:langchange`. Their source strings are **English keys** (verified: every natural-language literal passed to `T()` is tagged `[EN-KEY]` by `extract-inline-v2.js`).

| Page | `T()` def | Strings translated | Re-render hook | Skip container(s) |
|---|---|---|---|---|
| `pages/prices.html` | `:466` | `PRICING` object `:355-461` (labels, blurbs, tier names/desc/notes, row labels, cell strings), UI words `'pricing'` :514, `'Most chosen'` :527, `'From'` :532, `'On request'`/`'Message us to calculate your price'` :531, `'Request a quote'`/`'Book via WhatsApp'` :534, `'Feature'` :547, `'Guide price'` :553, `'from'` :554 | `window.addEventListener('serres:langchange', …)` `:562-567` (re-labels tabs, `render(currentKey)`) | `#svcTabs` :314, `#svcIntro` :321, `#tierGrid` :322, `#cmpName` :330, `#cmpTable` :331 (all `data-i18n-skip`; `:321,:322,:331` also contain **baked Spanish/EUR SSR output** that JS replaces at runtime) |
| `pages/why-serres.html` | `:465` | `TESTIMONIALS[]` `:442-453`: `role`, `svc`, `quote` via `T()` `:472,475,476`; `name` and `rating` untranslated | `:480` `paint` | `#rvStack` :407 (`data-i18n-skip`, contains baked Spanish reviews) |
| `services/ppf.html` | `:873` | family chips `T(f)` :891, `T('Color Shift')` flag :899, `T(col.f)` :901; color names `col.n` and brand labels untranslated | `:965` | `#colBrands` :594, `#colFilters` :595, `#cfTrack` :599 |
| `services/vinyl.html` | `:914` | `T('Flip')` :931, `T(col.f)` :937, `T(f)` :954 | `:957` | `#brandFilters` :531, `#filters` :534, `#track` :549 |
| `pages/gallery.html` | `:698` | lightbox note `T(s.dataset.note)` :705 — the 31 `data-note` attributes (`:343…:637`) hold English keys (all present in DICT `:170-222, 989-990`); `carName` from `data-car` (10 values, brand names) untranslated | none needed (re-evaluated on each `show()`) | none (the `#lb` aria-labels `:662-670` are bound by the walker) |

Family names present in the palettes but **absent from DICT** (so shown in English in every language today): `"Super Gloss"` (vinyl `:837-861,906`), `"ColorFlow"` (`:825-830,909`), `"Diamond"` (`:832-835,906`), and the series strings `"Wrap Film Serie 2080"` `:690` (Spanish "Serie"), `"Supreme Wrapping Film"` `:756`, `"Super Gloss"` `:837` (series is not rendered, only `label`).

### 4.7 Current-site coverage measured with the runtime-faithful walker (`walk-check-v2.js`)
Per page (`text` = non-empty text nodes outside skip zones; `boundES` = matched via INV; `boundEN` = matched directly as a key, all 41 are identity entries like "Detailing"/"Car Wrap"; `ORPHAN` = no match, `(n)` = of which have no letters):

```
index.html                       text=  91 boundES= 60 boundEN= 4 ORPHAN= 27 (16) | attrs 5: bound 2 orphan 3 | data-en 1/1 | skip 9
pages/gallery.html               text= 199 boundES=104 boundEN=26 ORPHAN= 69 (36) | attrs 6: bound 6          |            | skip 0
pages/prices.html                text=  27 boundES= 22 boundEN= 0 ORPHAN=  5 ( 4) | attrs 2: bound 2          |            | skip 5
pages/projects.html              text=  75 boundES= 49 boundEN= 0 ORPHAN= 26 (24) | attrs 1: bound 1          |            | skip 3
pages/why-serres.html            text=  65 boundES= 44 boundEN= 0 ORPHAN= 21 (18) | attrs 1: bound 1          | data-en 1/1 | skip 1
services/body-kits.html          text=  84 boundES= 66 boundEN= 4 ORPHAN= 14 (11) | attrs 2: bound 2          |            | skip 0
services/ceramic.html            text=  86 boundES= 66 boundEN= 0 ORPHAN= 20 (17) | attrs 2: bound 2          |            | skip 3
services/detailing.html          text=  88 boundES= 65 boundEN= 1 ORPHAN= 22 (19) | attrs 1: bound 1          |            | skip 0
services/paint-correction.html   text=  92 boundES= 74 boundEN= 0 ORPHAN= 18 (14) | attrs 2: bound 2          |            | skip 0
services/ppf.html                text= 100 boundES= 79 boundEN= 2 ORPHAN= 19 (16) | attrs 4: bound 4          |            | skip 5
services/vinyl.html              text=  77 boundES= 55 boundEN= 4 ORPHAN= 18 (15) | attrs 4: bound 4          |            | skip 4
blog/index.html                  text=   8 boundES=  5 boundEN= 0 ORPHAN=  3 ( 2) | attrs 0                   | TITLE+DESC ORPHAN | skip 2
blog/cuanto-cuesta-vinilar…      text=  25 boundES=  9 boundEN= 0 ORPHAN= 16 ( 3) | attrs 2: bound 1 orphan 1 | TITLE+DESC ORPHAN | skip 3
blog/ppf-o-ceramico…             text=  27 boundES=  9 boundEN= 0 ORPHAN= 18 ( 3) | attrs 2: bound 1 orphan 1 | TITLE+DESC ORPHAN | skip 3
blog/cuanto-cuesta-ppf…          text=  25 boundES=  9 boundEN= 0 ORPHAN= 16 ( 2) | attrs 2: bound 1 orphan 1 | TITLE+DESC ORPHAN | skip 3
blog/limpieza-tapiceria…         text=  25 boundES=  8 boundEN= 0 ORPHAN= 17 ( 3) | attrs 2: bound 1 orphan 1 | TITLE+DESC ORPHAN | skip 3
TOTAL: 1094 text nodes; 724 bound via INV; 41 bound as keys; 329 unmatched (203 numeric/symbol, 126 with letters); attrs 38 (31 bound, 7 orphan); data-en 2/2; skip subtrees 44
```

The 126 letter-bearing unmatched strings today fall into: (a) brand/proper nouns that must stay — `SERRES` ×16 (logo links), `Blog` ×9, `PPF` ×6, car names in the gallery (`Porsche 993`, `RWB`, `BMW`, `M2`, `Toyota`, `GR Supra`, `335i`, `XM`, `Range Rover`, `Sport`, `Ligier`, `Microcar`, `Cayenne`, `Carrera GTS`, jump-list `:312-321`), `BMW M2` (`services/ppf.html:504`), `BMW XM` (`services/vinyl.html:569`), `OEM` (`services/body-kits.html:452`), `SiO₂` (`services/ceramic.html:403`), `GU` (`services/paint-correction.html:568,575`), `Instagram`/`WhatsApp`/`Google Maps` (`index.html:890-892`), `Ceramic Coating SiO₂` (`services/detailing.html:432`); (b) **NAP strings that are silently untranslated today**: `index.html:846` `"Sant Cugat del Vallès, Barcelona"`, `:885` `"Sant Cugat del Vallès"`, and the footer line `"Sant Cugat del Vallès, Barcelona  ·"` (two spaces before the middot) at `pages/projects.html:379`, `pages/why-serres.html:421`, `services/body-kits.html:598`, `services/ceramic.html:567`, `services/detailing.html:493`, `services/paint-correction.html:636`, `services/ppf.html:703`, `services/vinyl.html:669`; (c) **blog chrome with no entries** (~45): eyebrows `"Blog · PPF"` etc., h1 fragments, breadcrumb current items, TOC links (`blog/*:186-194 / 206-211`), `"· Blog"` footer links. Attribute orphans: `index.html:744 aria-label="Servicios SERRES"`, `:852 "Instagram"`, `:853 "WhatsApp"`, and `aria-label="Tabla de contenidos"` on the 4 articles (`:203/:183/:183/:203`). Full list: `scratchpad/recon/orphans/_ALL.txt`.

### 4.8 Interplay with `setupCounters()` (`serres-enhance.js:219-279`)
Counter targets (`.hstat b`, `.rv-stat b`, `.gb-val`) get their `innerHTML` rewritten every 16 ms during the count-up. Where the target contains translatable text — `services/ceramic.html:404` `<b>5<span style="font-size:.55em">años</span></b>` (`"años"` = es of `"yr"` :970) and `services/paint-correction.html:568,575` (`" GU"`) — each rewrite creates new text nodes that the MutationObserver walks and re-binds (a new binding object is pushed per frame; harmless but the `textBindings` array grows by ~110 entries per such counter). `services/body-kits.html:451` `<b>Todos</b>` (es of `"All"`) is not numeric so the count-up regex `:224` skips it and the walker translates it to "All". In an EN-base site the same applies with `"yr"` inline.

---

## 5. The `data-en` mechanism

```js
// serres-i18n.js:1281-1299
function bindKeyed(el) {
  if (!el.getAttribute || inSkip(el)) return;
  if (el.__i18n_keyed) return;
  var raw = el.getAttribute("data-en");
  if (!raw) return;
  var a = affix(raw);                       // whitespace/quotes in the ATTRIBUTE become lead/trail
  if (!DICT.hasOwnProperty(a.core)) return; // key must exist (INV is NOT consulted)
  el.__i18n_keyed = true;
  keyBindings.push({ el, lead, core: a.core, trail });
  applyKeyed(b);
}
function applyKeyed(b) {
  var v = tr(b.core);
  var out = v ? b.lead + v + b.trail : "";  // "" translation empties the element
  if (b.el.textContent !== out) b.el.textContent = out;   // replaces ALL children
}
```
- Discovery: `walk()` calls `bindKeyed(root)` and `root.querySelectorAll("[data-en]")` (`:1316-1318`); text nodes directly under such an element are excluded from `bindText` (`:1243`) so the engine owns the element's text entirely. Re-applied by `applyAll()` (`:1341`).
- Semantics: the attribute is the **English key**; the element renders `tr(key)` in every language (in EN, the key text itself). Intended (header comment `:10-11`) for "fragments whose Spanish rendition is empty".

**Every element using it (2 in 16 pages; grep `data-en` counts: `index.html` 1, `pages/why-serres.html` 1, all others 0):**

| File:line | Markup | Spanish inline text | `data-en` value | Key → es | Why it exists |
|---|---|---|---|---|---|
| `index.html:798` | `<h2>Hacemos realidad tu <span class="chrome-text">coche soñado</span><span data-en=" a reality"></span></h2>` | (empty span) | `" a reality"` (leading space → `lead=" "`) | `"a reality": ["",""]` :79 | Word order: EN "We make your **dream car** a reality" vs ES "Hacemos realidad tu **coche soñado**". In EN the span renders `" a reality"`; in ES/CA it is emptied. |
| `pages/why-serres.html:338` | `<div class="hstat"><b class="chrome-text">1</b><span data-en="Workshop">Taller</span></div>` | `Taller` | `"Workshop"` | `"Workshop": ["Taller","Taller"]` :316 | INV collision: `"Taller"` resolves to `"Studio"` :88, which would render "Studio" in EN; the attribute forces "Workshop". |

Other i18n-related attributes:
- `data-i18n-skip` — 44 subtrees (the only opt-out mechanism; see the full list in 8.3). Also set on the switcher itself (`:1393`).
- `data-lang` — only on the injected switcher buttons (`:1400`, read at `:1414`).
- `data-ca`, `data-es`, `data-i18n` (other than `-skip`), `data-lang-show`, `data-lang-*` — **none** in HTML, CSS or JS (grep: 0). The `data-lang-show` and `data-i18n` patterns from `~/.claude/rules/i18n-static-sites.md` are not used here; this site is pattern 2-ish ("attribute overrides") but with the dictionary living in JS and text-node matching instead of per-element attributes.
- `data-note` (31, gallery, English keys consumed by JS), `data-car` (10, gallery), `data-finish` (CSS hook, keeps English per comment `:946-947`), `data-price` (prices), `data-key` (prices tabs) — data payloads, not translated by the walker.

---

## 6. The language switcher UI

Entirely created by `serres-i18n.js`; nothing in the pages or in `assets/*.css` mentions it (grep `srs-lang|srs-i18n|:lang(|[lang` over `assets/*.css` and all 16 pages: 0 hits outside the JS).

- **Style**: `injectStyle()` `:1368-1388` appends `<style id="srs-i18n-style">` with `.srs-lang` (inline-flex pill, `border-radius:999px`, `--line-strong` border), `.srs-lang button` (Barlow Condensed 12.5 px uppercase, `--muted` color), `button+button` left border, `:hover`, `.on` (chrome background, dark text), `.srs-lang-menu` variant (12 px radius, 15 px font, bigger padding), `@media(max-width:760px) .srs-lang-nav button` (7×9 px padding, 12 px). Uses the page tokens `--line-strong`, `--line`, `--muted`, `--text`, `--chrome`, `--ease` with fallbacks. Do not restyle (art direction locked); it renders identically with 2 buttons.
- **Markup**: `makeSwitcher(variant)` `:1390-1408` → `<div class="srs-lang <variant>" data-i18n-skip role="group" aria-label="Language / Idioma">` + for each `LANGS[i]`: `<button type="button" data-lang="xx" aria-label="XX">XX</button>` with a click → `setLang`. `syncSwitchers()` `:1410-1419` toggles `.on` and `aria-pressed`.
- **Mount points**: `mountSwitchers()` `:1421-1432`: desktop → `header .nav-right` (`insertBefore(firstChild)`, i.e. left of the "Pedir presupuesto" button). `.nav-right` exists on all 16 pages (`index.html:703`, `blog/index.html:69`, …; grep counts ≥1 everywhere). Mobile → `.srs-menu-foot` created by `serres-enhance.js:159` (`insertBefore(firstChild)`, i.e. left of the social icons). Idempotent (`!querySelector(".srs-lang")`), re-run from the MutationObserver (`:1448`) in case the menu appears later.
- **Removing `ca` cleanly**: change `:23` to `["en","es"]` and `:24` to `{ en:"EN", es:"ES" }`. The render loop, the `button+button` border rule and `syncSwitchers` need no change. Update the header comments `:2`, `:12`, `serres-enhance.js:282` ("EN / ES / CA") and the `aria-label` can stay "Language / Idioma".

---

## 7. Hard-coded natural-language strings in JS that are NOT in the dictionary

Method: `extract-inline-v2.js` over all inline `<script>` blocks (excluding JSON-LD and `src=`) plus `serres-enhance.js`; 465 literals listed, 284 not in DICT, of which the following are real user-visible language (the rest are color names, CSS strings, SVG paths, template fragments):

| File:line | Literal | Rendered where | Status |
|---|---|---|---|
| `assets/serres-enhance.js:15` | `"Hola SERRES, quería pedir presupuesto para mi coche."` | `WA_URL` → mobile-menu WhatsApp icon `:161` and floating button `:196` | Spanish in every language; not a key. Same encoded text is baked into every static `wa.me` href in the HTML (e.g. `index.html:853,891`). |
| `assets/serres-enhance.js:14,18,19` | `"34621244469"`, `"tel:+…"`, `"+34 621 24 44 69"` | mobile menu foot `:164` | NAP constants (not language, but must change). |
| `assets/serres-enhance.js:164` | `'Sant Cugat del Vallès, Barcelona<br>…'` | `.srs-menu-contact` | Injected into DOM → walked → not a key → stays Spanish in EN/CA today. |
| `assets/serres-enhance.js:30-36` | `MENU` labels `"Services","Projects","Exclusive","Prices","Why SERRES","Blog","Contact"` | overlay menu links | All DICT keys except `"Blog"` (not a key; same in every language). Bound by the walker after injection. |
| `assets/serres-enhance.js:139,156,199` | `'Open menu'`, `'Close menu'`, `'Chat on WhatsApp'` | aria-labels | DICT keys `:53,54,52` → translated. |
| `assets/serres-enhance.js:161,162` | `'WhatsApp'`, `'Instagram'` | aria-labels | Not keys; brand names — fine. |
| `assets/serres-enhance.js:155` | `'SERRES'` | menu logo | brand. |
| `pages/prices.html:525` | `"Hola SERRES, quería presupuesto del pack " + T(t.name) + " de " + T(s.label) + " para mi coche."` | tier WhatsApp CTA href | Spanish wrapper around translated names → Spanglish prefill in EN/CA. Not a key. |
| `pages/prices.html:463` | `'https://wa.me/34621244469?text='` | same | NAP. |
| `pages/prices.html:489` | `fmtEur`: `replace(/\B(?=(\d{3})+(?!\d))/g,'.') + ' \u20AC'` | tier prices, comparison foot | Spanish number format + € in every language. |
| `pages/why-serres.html:443,445,447,449,451` | `"Marc Vidal"`, `"Marcos Catlano"`, `"Daniel Roca"`, `"Aleix Soler"`, `"Núria Camps"` | testimonial cards | Names (not translated by design). Barcelona reviewers → brief says remove. |
| `services/vinyl.html:690` | `"Wrap Film Serie 2080"` | `series` field — **not rendered** (only `label` is) | Spanish "Serie"; harmless but grep-visible. |
| `services/vinyl.html:837`, `:825-835`, `:832` | `"Super Gloss"`, `"ColorFlow"`, `"Diamond"` family names | filter chips + `.sw-fin` | Not keys → English in ES/CA today. Add entries if ES chips should translate. |
| `services/ppf.html:788-858`, `services/vinyl.html:692-901` | ~190 color names (`"Piano Black"`, `"Miami Blue"`, …) | `.film-name` / `.sw-name` | Manufacturer names — deliberately untranslated. |
| JS comments only | `services/vinyl.html:688` "paleta multimarca", `services/ppf.html:783` "multimarca", `pages/prices.html:351-354` | — | not rendered. |
| GA4 blocks (16×) and click trackers (16×) | no natural-language strings | — | — |

Inline HTML (not JS) Spanish strings that are **not** keys are listed in 4.7 (NAP lines, blog chrome, `aria-label="Servicios SERRES"`, `"Tabla de contenidos"`).

---

## 8. Strings that must NOT be translated, and how the code protects them today

### 8.1 Mechanisms
1. **Absence from DICT/INV** — the default. Anything not matching is left byte-identical (`bindText:1246`). This is what protects `SERRES`, `PPF`, `3M`, `Inozetek`, `Avery Dennison`, car models, color names, reviewer names, `OEM`, `GU`, `SiO₂`, `Instagram`, `WhatsApp`, `Google Maps`, `Blog`, numbers, prices (`250 €`), phone numbers, arrows/separators (`→ ← · / + ＋`).
2. **Identity entries** (20, listed in 2.3) — words that *look* translatable but must survive (`"Detailing"`, `"Car Wrap"`, `"Ceramic Coating"`, `"Body Kits"`, `"Paint Protection Film"`, `"Wrap"`, `"Film"`, `"Kit"`, `"Car"`, `"Pro"`, `"Frozen Matte"`, `"Collserola"`, …). Needed today because otherwise the *Spanish* text couldn't bind at all; in forward mode they are still useful as an explicit "same in ES" declaration and keep the orphan checker green.
3. **`data-i18n-skip`** (44 subtrees) — used for (a) brand terms split into fragments that collide with real keys: `services/ceramic.html:397-398` (`Ceramic` / `Coating` would become "Cerámica"/"Recubrimiento"), `services/ppf.html:470,476` (`PPF`), `services/vinyl.html:505` (`Wrap`), `pages/projects.html:307,313,319` (`Car Wrap`/`PPF`/`Ceramic Coating`), `index.html:755,762,776,783,799(×2),877,878,880` (service names), `services/ceramic.html:389` breadcrumb; (b) the one documented collision `blog/index.html:80-81` (`El <span>Blog</span>` — "El" would hit `"The"`→"La" in reverse); (c) JS-owned containers (prices ×5, why-serres ×1, ppf ×3, vinyl ×3); (d) blog content with no translations (`post-meta`, `article.prose`, `rel-grid` on 4 articles, `post-grid` on the index).
4. **`affix()`** keeps surrounding whitespace and one pair of `“ ”`/`" "` quotes outside the match, so quoted testimonials and padded fragments (`" a reality"`) round-trip exactly.
5. **Numbers** are never keys; `setupCounters()` guards non-numeric targets (`serres-enhance.js:224-231`); price formatting is JS-only (`pages/prices.html:489`) and the baked SSR prices in `pages/prices.html:322,331` are inside `data-i18n-skip`.
6. **`data-finish`** stays English for CSS/filtering by design (comment `serres-i18n.js:946-947`, `services/vinyl.html:929`, `services/ppf.html:898`).

### 8.2 What this protection does NOT cover (today's silent gaps that Miami inherits unless fixed)
- `alt` texts (62), OG/Twitter descriptions, JSON-LD names/descriptions, WhatsApp prefill text in hrefs, `aria-label="Servicios SERRES"`, blog chrome, the NAP footer lines, `Super Gloss`/`ColorFlow`/`Diamond` chips.

### 8.3 All 44 `data-i18n-skip` subtrees (file:line)
`index.html:755, 762, 776, 783, 799 (a→vinyl), 799 (a→ceramic), 877, 878, 880` · `pages/prices.html:314, 321, 322, 330, 331` · `pages/projects.html:307, 313, 319` · `pages/why-serres.html:407` · `services/ceramic.html:389, 397, 398` · `services/ppf.html:470, 476, 594, 595, 599` · `services/vinyl.html:505, 531, 534, 549` · `blog/index.html:81, 88` · `blog/cuanto-cuesta-ppf-coche.html:162, 197, 404` · `blog/cuanto-cuesta-vinilar-un-coche.html:182, 216, 405` · `blog/limpieza-tapiceria-coche-precio.html:182, 216, 418` · `blog/ppf-o-ceramico-que-elegir.html:162, 198, 403`.

---

## 9. PLAN — invert the architecture for Miami (EN base, forward EN→ES, no CA, no INV)

Design goal: the smallest diff that makes **English inline text = dictionary key**, applied forward, with a build-time checker that proves zero orphans. Everything below is vanilla, no new deps, no design changes.

### 9.1 `assets/serres-i18n.js` — engine changes (exact lines)
| Line(s) today | Change |
|---|---|
| `:2` `(EN / ES / CA)`, `:4-17` header | Rewrite: static HTML ships in ENGLISH; dictionary EN→ES applied forward; `data-i18n-skip` opt-out; switcher EN/ES. |
| `:23` | `var LANGS = ["en", "es"];` |
| `:24` | `var LABELS = { en: "EN", es: "ES" };` |
| `:26-30` comment | `"English source" : ["español"]` (or `: "español"` if plain strings are chosen — see 9.2). |
| `:31-1166` DICT | Rebuild (9.2). |
| `:1168-1181` INV block | **Delete.** |
| `:1183-1188` `enKeyOf` | Keep the function name (4 call sites `:1245, 1266, 1324, 1328` stay untouched) but reduce to `return DICT.hasOwnProperty(core) ? core : null;`. |
| `:1196` | default `"es"` → `"en"`. |
| `:1200-1206` `tr` | `if (current === "en") return core; var e = DICT[core]; if (e == null) return core; var v = e[0]; return v == null ? core : v;` — keep the "`""` is a valid translation" semantics (`v == null`, not `!v`). With plain-string values: `var v = DICT[core]; return v == null ? core : v;`. |
| `:1223-1225`, `:1243`, `:1281-1299`, `:1316-1318`, `:1341` (`data-en` machinery) | Two options: (A) **keep unchanged** (zero risk, dead code after the 2 usages are converted); (B) delete all six spots (~30 lines). The brief says "eliminar la capa INV" and "revisar cada data-en uno a uno" — it does not require deleting the mechanism. Recommendation: **keep, but extend by two lines** so it becomes the forward-mode disambiguation hatch (9.4): in `bindKeyed` store `en: el.textContent` and in `applyKeyed` use `var v = current === "en" ? b.en : tr(b.core);`. Then `<span data-en="The (masc.)">The</span>` renders "The" in EN and `DICT["The (masc.)"]` in ES, and the checker treats `data-en` elements as bound by their attribute. If option B is chosen instead, the ambiguous fragments in 9.4 must be solved by re-keying the markup. |
| `:1338` | Unchanged — it sets `lang="en"`/`"es"`. |
| `:1395` | Keep `"Language / Idioma"`. |
| `:1464-1468` API, `:1437-1451` observer, `:1321-1335` meta, `:1363-1432` switcher | Unchanged. |
| `serres-enhance.js:2-9, 282` comments | "EN / ES". |

### 9.2 Dictionary rebuild (`:31-1166`)
1. **Key = the exact English text that will be inline in the HTML** (after `affix`). Re-derive every key from the new English markup, not from today's keys: many current keys are *not* the SEO copy (titles `:225,385,463,523,577,639,678`, meta descriptions `:994-1026`, Barcelona-flavoured paragraphs in 2.5). Keys that survive unchanged (nav, UI words, service copy without geo/price tokens) keep their es value.
2. **Value**: prune index `[1]` (ca). Two admissible shapes: `"key": ["es"]` (literal reading of "podar el segundo elemento"; `tr` reads `e[0]`) or `"key": "es"` (smaller file, simpler `tr`; ~15 % of the 163 KB goes away). Pick one and apply it to `_build/dict-tools.js` too (its `[v[0], v[1]]` iterations at `:39-41`, `:50`, `:68-70`, `:78-79`, `:93-95` assume arrays of 2).
3. **Empty values**: `"a reality": [""]` stays only if the "We make your dream car a reality" heading keeps that fragmentation (9.3).
4. **Identity entries** (20): keep them as explicit `"Detailing": ["Detailing"]` etc. They make the checker's "every visible string is a key" rule hold without an allow-list for these terms.
5. **Add** entries for everything that is an orphan today and must speak Spanish in Miami: the NAP/footer lines (new EN text, e.g. `"Miami, FL  ·"` — write the exact bytes including the two spaces and middot if the markup keeps them, or better, split the middot into its own span), `"Instagram"`/`"WhatsApp"`/`"Google Maps"`/`"Blog"` are fine as non-keys (proper nouns) — put them in the checker allow-list instead; `aria-label` for the services grid (`index.html:744`) and the TOC (`blog/*`); blog chrome (9.8); `"Super Gloss"`, `"ColorFlow"`, `"Diamond"` if ES chips should translate.
6. **Rewrite** the 49/32/24/21/11/6/1 Barcelona / Sant Cugat / Vallès / € / VAT / +34 / 08174 entries (2.5) with Miami data or "confirmar con el cliente" placeholders — never invent the address, phone, hours or prices. `"Barcelona, Spain"` :97 → `"Miami, FL"`; `"Guide prices in EUR, VAT included"` :243 → USD wording (sales tax treatment is a client decision); `"Mon–Sat · By appointment"` :91 → client hours.
7. **Titles/descriptions**: 16 + 16 entries whose key is the new English `<title>`/description (9.5) — `bindMeta` uses `trim()` only, so no wrapping quotes in these.
8. **Remove** `:920-944` testimonial roles/quotes (5 quotes + 6 roles + 3 service tags) together with `TESTIMONIALS[]` — or keep the role/service keys if placeholder cards remain; `_build/dict-tools.js check` will not flag unused keys, so add an "unused key" report to the checker (9.6).
9. Run `node _build/dict-tools.js check` after the rebuild (adapted to single values): it must report 0 collisions between different keys' es values only if you care; forward mode tolerates identical es under different keys (e.g. `"Studio"`/`"Workshop"` → "Taller"), so downgrade that check to a warning.

### 9.3 The two `data-en` elements
| Element | Action |
|---|---|
| `index.html:798` | Replace with plain inline English: `<h2>We make your <span class="chrome-text">dream car</span> a reality</h2>`. Text nodes: `"We make your "` → core `We make your`, `"dream car"`, `" a reality"` → core `a reality` (lead `" "`). Keys `:77-79` keep `["Hacemos realidad tu"]`, `["coche soñado"]`, `[""]`. In ES the third node becomes `" "` — same visual result as today's emptied span. Delete the attribute. |
| `pages/why-serres.html:338` | `<span>Workshop</span>` — `"Workshop"` is a direct key in forward mode; the INV collision with `"Studio"` no longer exists. Delete the attribute. |

After this, `grep -rn 'data-en=' *.html pages services blog` must return 0 (add to the acceptance greps).

### 9.4 Ambiguity in forward mode — single-word and swapped-pair keys
Forward matching is by exact English text, so *every* text node whose trimmed content equals a short key gets that key's Spanish, regardless of context. Audit these before shipping (the checker's `BOUND` listing per page makes it a 10-minute review):
- Articles/pronouns: `"The"`→`"La"` :110, `"Our"`→`"Nuestros"` :108, `"One"`→`"Un solo"` :341, `"Why"`→`"Por qué"` :313, `"All"`→`"Todos"` :948, `"From"`/`"from"` :739-740, `"Home"` :1029. Known conflict: `blog/index.html:81` `The <span>Blog</span>` needs "El", not "La" → use the extended `data-en` hatch (`<span data-en="The (blog)">The</span>`, key `"The (blog)": ["El"]`) or restructure so the whole `The Blog` is one node. Keep `data-i18n-skip` off the h1 so the checker sees it.
- Swapped pairs (2.3): the English markup must reproduce exactly `Obsessive`/`prep`, `Premium`/`materials`, `Liquid`/`Glass`, `Showroom`/`Fresh`, `Staged`/`polishing`, `Stone-chip`/`defense`, `Self-healing`/`topcoat`, `Stain &`/`UV resistant`, `Fully`/`removable`, `Built for`/`Presence` as separate `<span>`s in that order, because the es values are pre-swapped. If the EN copy is rewritten, rewrite both halves of the pair.
- Words that are keys **and** appear as brand-ish nouns elsewhere: `"Gloss"`→`"Brillo"`, `"Satin"`, `"Matte"`, `"Pearl"`, `"Metallic"`, `"Flip"`→`"Camaleón"` (chips — intended), `"Detail"`, `"Cure"`, `"Coating"`→`"Recubrimiento"` (the `services/ceramic.html:398` `Coating` span keeps `data-i18n-skip` for exactly this reason — verify all brand-term skips in 8.3 group (a) are still wanted with EN inline text; most become unnecessary because the inline text *is* the brand term and identity keys exist, but keeping them is harmless).
- `"Premium"`→`"Materiales"` :336 is the most dangerous: any future `<span>Premium</span>` badge would render "Materiales". Consider re-keying the why-serres heading fragments to include punctuation/context.

### 9.5 Page-level edits tied to i18n (all 16 pages)
- Line 2: `<html lang="es">` → `<html lang="en">`.
- `og:locale` `es_ES` → `en_US` (line 11 ×11, `blog/index.html:16`, articles `:19/:20/:20/:19`).
- JSON-LD `inLanguage` → `"en"`/`"en-US"` at `blog/index.html:37`, `blog/cuanto-cuesta-vinilar-un-coche.html:48`, `blog/ppf-o-ceramico-que-elegir.html:59`, `blog/cuanto-cuesta-ppf-coche.html:51`, `blog/limpieza-tapiceria-coche-precio.html:52`.
- `<title>` (line 6, blog line 7) and `meta description` (line 7, blog line 8): English SEO text = key.
- Every bound Spanish text node (724) → its English key text, byte-for-byte (same dashes, same `&nbsp;`, same curly quotes as the key). Mechanical rule: for each text node bound today, replace the core with `INV[core]` (today's key) — then hand-review the ~120 entries that carry Barcelona/€/+34 tokens and the titles/descriptions, where the key itself is being rewritten.
- The 31 bound `aria-label`/`title` attributes → their English keys (`"Breadcrumb"`, `"Jump to a car"`, `"Image viewer"`, `"Close viewer"`, `"Previous image"`, `"Next image"`, `"Related services"`, `"Choose a service"` (`pages/prices.html:314`, inside a skip container so it is *not* bound today — set it in English anyway), `"Drag to compare before and after"`, `"Previous color"`, `"Next color"`, `"Scroll left"`, `"Scroll right"`, `"Call SERRES"`, `"SERRES Wrap Center on Google Maps"` → new Miami map title).
- The 62 `alt` texts: write them in English (not translated at runtime; no engine change unless `"alt"` is added to `ATTRS` `:1227`, which would then require alt keys — recommended only if ES alts matter for SEO; they don't, ES is JS-only).
- Baked SSR blocks that JS overwrites but crawlers read: `pages/prices.html:314, 321, 322, 330, 331` (Spanish + `€`, `data-price`, `wa.me/34…` links) → regenerate in English/USD from the updated `PRICING`; `pages/why-serres.html:407` (`#rvStack` baked Spanish reviews) → remove with the testimonials.
- `pages/prices.html:489` `fmtEur` → `fmtUsd`: `'$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')` (`$1,490`); `:525` prefill → English (e.g. `"Hi SERRES, I'd like a quote for the " + T(t.name) + " " + T(s.label) + " pack for my car."`); `:463` `WA` base → `https://wa.me/1XXXXXXXXXX?text=`.
- `assets/serres-enhance.js:14-19` NAP constants; `:15` prefill in English; `:164` `Miami, FL` line (make the visible part a key if it must translate; a plain `"Miami, FL"` proper noun can be allow-listed).
- Keep every `data-i18n-skip` in 8.3 groups (c) and (d); re-evaluate group (a)/(b) per 9.4.
- `blog/*` chrome: see 9.8.

### 9.6 `_build/i18n-orphans.js` — the DOM-walking orphan checker (spec)
No jsdom (new dep forbidden); use a hand-rolled tokenizer like `scratchpad/recon/walk-check-v2.js` (copy it into `_build/` and adapt — it already implements the runtime rules below and writes per-page reports).

Inputs: the 16 pages (`_build/verify-seo.js:11-19` list), `assets/serres-i18n.js` (extract DICT with the same brace-matching as `_build/dict-tools.js:14-25`), `assets/serres-enhance.js` (for injected strings: `MENU` labels, aria-labels, `.srs-menu-contact`), optional `_build/i18n-allow.json` (exact-match allow-list of proper nouns).

Normalisation — **must be byte-identical to the runtime**:
1. Tokenise the HTML; skip comments, `<script>…</script>`, `<style>…</style>`, `<textarea>…</textarea>` bodies; walk `<body>` only (the runtime walks `document.body`; `<title>`/description are handled separately).
2. Maintain the open-element stack; a text node is skipped if any ancestor-or-self has a `data-i18n-skip` attribute (runtime `closest("[data-i18n-skip]")`), or if its direct parent has `data-en` (runtime `:1243`) — only if the hatch is kept.
3. Decode entities exactly like a browser: named (`&nbsp;`→U+00A0, `&amp; &lt; &gt; &quot; &apos; &hellip; &mdash; &ndash; &middot; &laquo; &raquo; &copy; &rsquo; &lsquo; &ldquo; &rdquo; &euro; &times; &deg; &trade; &reg;` — these are the ones the site uses) and numeric `&#NNN;`/`&#xHH;`. Do **not** decode inside `<script>`.
4. `raw` = decoded text. Skip if `raw.trim() === ""` (JS `trim` strips all Unicode White_Space incl. U+00A0, U+FEFF, U+2028/9, U+1680, U+2000–200A, U+202F, U+205F, U+3000).
5. `affix`: `core = raw.replace(/^\s+/, "").replace(/\s+$/, "")` (same JS `\s` set; `\s` does **not** include U+200B zero-width space — a ZWSP inside or at the edge of a node breaks matching, so also flag any U+200B/U+200C/U+200D/U+FEFF in cores as an error); then if `core.length > 1` and `core[0] ∈ {U+201C, U+0022}` and `core[last] ∈ {U+201D, U+0022}` strip both.
6. Lookup: `Object.prototype.hasOwnProperty.call(DICT, core)` — exact. No case folding, no `.normalize()`, no dash/quote unification, no whitespace collapse. Multi-line text nodes (a key broken across source lines with indentation) will never match because the runtime keeps interior newlines/indent; the checker must report them as orphans (and the fix is to keep keys on one source line).
7. Attributes on every element outside skip zones: `aria-label`, `title` (same affix + lookup); `data-en` (if kept: value through affix must be a key; and the element's own text must be non-empty English).
8. Head: `<title>` text `.trim()` → must be a key; `meta[name=description]` content `.trim()` → must be a key (no quote stripping here — mirrors `bindMeta`).
9. Classification of a non-key core: `NUMERIC` if it contains no letter (`/\p{L}/u` false — arrows, numbers, `·`, `/`, `+`, prices are fine); `ALLOWED` if the exact core is in `i18n-allow.json` (seed: `SERRES`, `PPF`, `Blog`, `Instagram`, `WhatsApp`, `Google Maps`, `OEM`, `GU`, `SiO₂`, `3M`, `Inozetek`, `Avery Dennison`, the 10 gallery car names, `BMW M2`, `BMW XM`, `Miami, FL`, phone number string); otherwise **`ORPHAN`**. Also `ORPHAN-ATTR`, `ORPHAN-TITLE`, `ORPHAN-DESC`.
10. Extra reports: `UNUSED-KEY` (keys never matched by any page text/attr/title/desc and never referenced as a string literal in any inline `<script>` or `serres-enhance.js` — catches Barcelona leftovers in DICT); `EMPTY-VALUE` (list, must be intentional); `KEY-WHITESPACE` (keys that differ from their trim — today `:642`); `GEO-TOKEN` (any key or value matching `/Barcelona|Sant Cugat|Vall[èe]s|\+34|08174|€|\bIVA\b|\bVAT\b|\bEUR\b|Can Fatj|Collserola|Catalan|España|Spain/`); `LANG-CONFIG` (assert `LANGS.length === 2`, no `ca` in `LABELS`, no `INV` symbol in the source, default `"en"`); `DATA-EN` count (expect 0 unless the hatch is used deliberately, then list them).
11. Exit code 1 on any `ORPHAN*`/`GEO-TOKEN`/`LANG-CONFIG` failure; print per-page counts like 4.7. Wire it next to `_build/verify-seo.js` in the verification step.

Known false positives to expect and how to handle: split headings where a fragment is intentionally a non-word (`"&"`, `"·"`) → NUMERIC; the `＋` (U+FF0B) plus signs in `services/vinyl.html:628-653` → NUMERIC; `"5"`+`<span>yr</span>` inside counters → `"yr"` is a key.

### 9.7 `_build/verify-seo.js` and `_build/dict-tools.js`
- `verify-seo.js:45` hard-codes `G-1K6FYZ99GN` → new GA4 id; `:21-24` `BANNED` are Spanish claims (`/10 años/`, `/cristal líquido/`, `/medidor de brillo/`, `/medidor de espesor/`) → add English equivalents (`/10 years/i`, `/liquid glass/i`, `/gloss meter/i`, `/thickness gauge/i`, keep `/\b9H\b/`, `/200 ?(microns|µm)/i`, `/\b1080\b/`, `/subcontract/i`). Note DICT `:1003` contains "liquid-glass" in an old meta key — if that copy is reused in an EN description it would trip the new banned rule.
- `verify-seo.js:70-78` FAQPage check requires JSON-LD question/answer text to appear verbatim in the HTML — with EN base the JSON-LD must carry the English FAQ text (which is also the key).
- `dict-tools.js`: adapt to the single-value shape (9.2.2); `merge` (`:53-106`) writes under the 2026-07-09 comment — either update the label or stop using merge for the port.

### 9.8 Blog (decision needed before executing)
Today the blog is Spanish-only: prose/meta/related/index-grid are `data-i18n-skip`, and h1/eyebrow/TOC/breadcrumb/title/description have no entries. Miami rewrites the 4 articles in English (Florida climate). Options for the ES switch: (a) **EN-only blog** — keep the skips, add `data-i18n-skip` to the h1/TOC/eyebrow too (or add keys for that chrome so only the prose stays English), allow-list nothing; (b) translate chrome via keys and leave prose EN (mixed-language pages — not recommended); (c) full ES twins as separate pages (out of the brief's scope, changes the sitemap count). The checker must know which option was chosen (skip zones vs. keys). Slugs: `blog/cuanto-cuesta-ppf-coche.html` etc. become English slugs; `serres-enhance.js:23` base detection depends only on the `blog/` folder, so keep the folder name.

### 9.9 Verification specific to i18n (adds to the brief's list)
- `node _build/i18n-orphans.js` → 0 ORPHAN, 0 GEO-TOKEN, LANG-CONFIG ok, DATA-EN 0 (or the deliberate list).
- Browser (Chrome DevTools MCP), per page: (1) fresh profile → `document.documentElement.lang === "en"`, switcher shows exactly `EN | ES`, `EN` has `.on`; (2) click ES → `lang="es"`, `localStorage["serres-lang"]==="es"`, `serres:langchange` fired, prices/palette/testimonial-replacement re-render, no English residue visible except allow-listed proper nouns; (3) reload → stays ES; click EN → text restored byte-identical to the static HTML (compare `document.body.innerText` before/after round-trip); (4) `matchMedia('(prefers-reduced-motion: reduce)')` → counters render final values immediately and the `"yr"` span still translates.
- `grep -rn 'data-en=' *.html pages services blog` = 0; `grep -c '"ca"' assets/serres-i18n.js` = 0; `grep -n 'INV' assets/serres-i18n.js` = 0.

---

## 10. Risks and surprises found during recon (also returned in the structured output)

1. `serres-i18n.js` is loaded by JS injection, not by a `<script>` tag — anyone grepping the HTML for the include will conclude it is unused.
2. Default language is a literal `"es"` at `:1196`; `<html lang>` is overwritten at runtime (`:1338`), so the static attribute is only what crawlers/no-JS see.
3. `enKeyOf` accepts English keys *and* Spanish values today; after inversion it must accept keys only, otherwise Spanish leftovers would silently keep binding.
4. 7 INV collisions and the `"Film Colors "` trailing-space key are artefacts of the reverse direction; they vanish, but `"Taller"`/`"Camaleón"` show that one Spanish word maps to several English keys — forward mode has the mirror problem for short English words (`"The"`, `"Premium"`, `"One"`, `"All"`, `"From"`, `"Gloss"`…) and the swapped-pair headings.
5. Title/description dictionary keys are *legacy English*, not SEO copy, and the 5 blog pages have none — 32 new entries are needed, not a mechanical inversion.
6. 8 service/page footers contain the untranslated node `"Sant Cugat del Vallès, Barcelona  ·"` (two spaces + middot inside the text node) and `index.html:846/885` NAP lines — none are keys, so a naive "replace bound text" pass will miss them; the acceptance grep will catch them.
7. WhatsApp prefill text is Spanish inside every `wa.me` href (HTML) and in `serres-enhance.js:15` / `pages/prices.html:525`; it is never translated.
8. `pages/prices.html:314-331` and `pages/why-serres.html:407` contain baked Spanish/EUR SSR output that JS overwrites; crawlers and the `verify-seo` FAQ/visible-text checks read the baked version.
9. Family names `"Super Gloss"`, `"ColorFlow"`, `"Diamond"` are not in the dictionary (English chips in ES today).
10. Counters rewrite `innerHTML` 60×/s and the observer re-binds `"años"`/`"yr"` each frame (`services/ceramic.html:404`) — harmless, but the checker must treat `"yr"` inline as a key, not an orphan.
11. `_build/verify-seo.js` hard-codes the Barcelona GA4 id and Spanish banned-claim regexes; `_build/dict-tools.js` assumes `[es, ca]` arrays.
12. The brief says 15 pages; the tree, the sitemap logic and `verify-seo.js` have 16 (blog index + 4 articles + 11).
13. Word "Miami" already occurs in color names (`"Miami Blue"`) — do not use "Miami" as a positive acceptance grep.
14. The tool I used to write scratch scripts (Bash heredocs) halves `\\` — any port script containing regex escapes must be written with the Write tool or verified by running it; my first two analysis runs failed silently on this before I noticed (attributes and `data-en` counted 0). Worth knowing for whoever writes `_build/i18n-orphans.js`.
