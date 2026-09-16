# Recon — inherited-trust-signals (SERRES Barcelona → Miami port)

Source (read-only): `C:/Users/Rickfelder/Desktop/Serres web/Serres wrap center webpage/Serres wrap center V12`
Date: 2026-09-02. All line numbers refer to the source files as they are today.
Method: grep/awk over the 15 in-scope pages + `assets/serres-i18n.js`, `assets/serres-enhance.js`, `.htaccess`, `_build/*.js`, `_build/agg-report.json`; every OG image, hero poster, before/after pair, service tile, blog cover and 30+ gallery photos were opened and inspected visually. Videos (`.mp4`) could NOT be frame-inspected (no ffmpeg on this machine) — listed as unverified at the end of §7.

Everything below is content that is **not transferable** to the Miami branch as-is, or that must be a "confirm with client" item. Nothing here is a design/brand element.

---

## 0. Executive summary (what the port must remove / replace / confirm)

| # | Item | Where | Action for Miami |
|---|------|-------|------------------|
| 1 | `aggregateRating 4.9 / reviewCount 50` in JSON-LD | `pages/why-serres.html:268-272`, `services/body-kits.html:287-292`, `services/paint-correction.html:326-331` | Delete (3 blocks). Brief says "3 páginas de servicio" — it is actually **1 page + 2 service pages**; `ceramic`, `detailing`, `ppf`, `vinyl` have none. No `Review` schema anywhere. |
| 2 | `TESTIMONIALS[]` (5 Barcelona reviews, Catalan names) + inline pre-rendered copy of the same 5 cards | `pages/why-serres.html:442-453` (JS) and `:407` (SSR HTML) | Delete both copies + the section's stat tiles; no empty state exists (see §2.4). |
| 3 | Visible counters `50+ Coches transformados`, `4.9 Valoración media`, `98% Recomendaciones` | `pages/why-serres.html:336-338, 396-398`, meta description `:7,13,20` | Remove/replace; count-up animation in `serres-enhance.js:219-236` targets them. |
| 4 | `98 %` / `4,9` claims in blog prose | 4 blog articles (§3.3) | Rewrite. |
| 5 | Barcelona-only photo copy (Collserola, azotea de Barcelona, masía catalana, carretera de costa, nieve) | `pages/gallery.html`, `assets/serres-i18n.js:111-182` | Confirm with client whether Barcelona photos are reused in Miami; if yes, strip the geographic captions. |
| 6 | **Readable Spanish licence plate `2383 MRZ` + `movento.es` dealer frame** | `assets/detailing/ext-before.{jpg,webp}` and `ext-after.{jpg,webp}` (used `services/detailing.html:385,389`) | Must be blurred/replaced (privacy + geography). |
| 7 | EU "E" plate bands / Spanish road sign / Barcelona landmark in photos | §7 table | Confirm with client. |
| 8 | Brand / warranty / certification claims (3M 2080, Avery Dennison, Inozetek, "3 años de garantía del fabricante", "materiales certificados", "garantizamos por escrito", "Solo 6 Exclusivos al año", "1 Taller") | §4 | Do not decide — "confirm with client" list. |
| 9 | Legal: **zero** privacy / cookies / terms pages, no consent banner, GA4 fires unconditionally on all 16 pages | §5 | Create US/Florida privacy + terms as TODO; add footer links (footer structure documented in §5.2). |
| 10 | `.htaccess` is Apache/Hostinger-only cache policy (no redirects/HTTPS/www/404) | §6 | Keep on Hostinger; delete + `.nojekyll` on GitHub Pages. |
| 11 | Instagram `serres.wrap.center` (Barcelona account) in `sameAs`, footer, contact, mobile menu | §8 | Confirm Miami handle. |
| 12 | `_build/verify-seo.js` hard-codes `G-1K6FYZ99GN` and the Spanish blog slugs | `_build/verify-seo.js:11-19, 45` | Update or every page FAILs. |

Key counts: 3 aggregateRating blocks · 0 Review schema · 5 testimonials (×2 copies) · 6 review-flavoured stat tiles on why-serres · 4 blog prose trust claims · 16 `<footer>` elements (1 rich + 15 one-liners) · 0 legal pages · 0 cookie consent · 8 Instagram link occurrences · 2 images with a fully readable Spanish plate · 6 images with visible EU "E" band · 5 images with a Barcelona landmark (Torre de Collserola / masía) · 43 `.htaccess` lines, 4 rule groups.

---

## 1. aggregateRating / ratingValue / reviewCount / bestRating (JSON-LD)

Grep (`-F` on `aggregateRating|ratingValue|reviewCount|bestRating|worstRating|"Review"|reviewBody|reviewRating|ratingCount`) over all 15 pages + JS + `_build/*.js` returns exactly three blocks. **No `Review` entries, no `reviewBody`, no `ratingCount` anywhere.** No visible review widget accompanies the two service-page blocks (self-serving rating with no on-page reviews — a Google rich-result policy risk even in Barcelona).

### 1.1 `pages/why-serres.html:232-274` — top-level `AutoRepair` node (rating is on the business itself)

```json
232	<script type="application/ld+json">
233	{
234	  "@context": "https://schema.org",
235	  "@type": "AutoRepair",
236	  "name": "SERRES Wrap Center",
237	  "description": "Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap, Ceramic Coating, corrección de pintura y body kits.",
238	  "url": "https://serreswrapcenter.es/",
239	  "image": "https://serreswrapcenter.es/assets/og/why-serres.jpg",
240	  "telephone": "+34 621 24 44 69",
241	  "priceRange": "€€",
242	  "address": {
243	    "@type": "PostalAddress",
244	    "streetAddress": "Av. Can Fatjó dels Aurons, 15",
245	    "addressLocality": "Sant Cugat del Vallès",
246	    "postalCode": "08174",
247	    "addressRegion": "Barcelona",
248	    "addressCountry": "ES"
249	  },
250	  "openingHoursSpecification": [
251	    {
252	      "@type": "OpeningHoursSpecification",
253	      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
254	      "opens": "09:00",
255	      "closes": "19:00"
256	    },
257	    {
258	      "@type": "OpeningHoursSpecification",
259	      "dayOfWeek": "Saturday",
260	      "opens": "10:00",
261	      "closes": "14:00"
262	    }
263	  ],
264	  "sameAs": [
265	    "https://www.instagram.com/serres.wrap.center/",
266	    "https://wa.me/34621244469"
267	  ],
268	  "aggregateRating": {
269	    "@type": "AggregateRating",
270	    "ratingValue": "4.9",
271	    "reviewCount": "50"
272	  }
273	}
274	</script>
```
Notes: no `bestRating` here (the other two have it); `priceRange` is `€€` while `index.html:620` says `€€€` — pre-existing inconsistency, brief wants `$$$`.

### 1.2 `services/body-kits.html:266-341` — `Service.provider.aggregateRating`

```json
266	<script type="application/ld+json">
267	{
268	  "@context": "https://schema.org",
269	  "@type": "Service",
270	  "name": "Montaje de body kits",
271	  "serviceType": "Instalación y pintura de body kits, spoilers y widebody",
272	  "url": "https://serreswrapcenter.es/services/body-kits.html",
273	  "description": "Instalación, ajuste OEM y pintura de body kits, splitters, difusores y kits widebody en nuestro taller de Sant Cugat del Vallès. Desde 450 € IVA incluido.",
274	  "provider": {
275	    "@type": "AutoBodyShop",
276	    "name": "SERRES Wrap Center",
277	    "telephone": "+34621244469",
278	    "url": "https://serreswrapcenter.es",
279	    "address": {
280	      "@type": "PostalAddress",
281	      "streetAddress": "Av. Can Fatjó dels Aurons 15",
282	      "addressLocality": "Sant Cugat del Vallès",
283	      "addressRegion": "Barcelona",
284	      "postalCode": "08174",
285	      "addressCountry": "ES"
286	    },
287	    "aggregateRating": {
288	      "@type": "AggregateRating",
289	      "ratingValue": "4.9",
290	      "reviewCount": "50",
291	      "bestRating": "5"
292	    }
293	  },
294	  "areaServed": [
295	    { "@type": "City", "name": "Sant Cugat del Vallès" },
296	    { "@type": "City", "name": "Barcelona" }
297	  ],
298	  "hasOfferCatalog": { ... 3 Offers, priceCurrency EUR, valueAddedTaxIncluded true ... }   // lines 298-339
340	}
341	</script>
```
When deleting lines 287-292 remember the trailing comma on line 286 (`}` of address) must go too, or JSON-LD parse fails and `_build/verify-seo.js:42` reports it.

### 1.3 `services/paint-correction.html:304-379` — `Service.provider.aggregateRating`

```json
304	<script type="application/ld+json">
305	{
306	"@context": "https://schema.org",
307	"@type": "Service",
308	"@id": "https://serreswrapcenter.es/services/paint-correction.html#service",
309	"name": "Pulido y corrección de pintura de coche",
310	"serviceType": "Corrección de pintura y Ceramic Coating",
311	"description": "Pulido multietapa a máquina que elimina arañazos, remolinos y hologramas, con sellado Ceramic Coating SiO₂ y revisión panel a panel bajo iluminación hexagonal controlada antes de la entrega.",
312	"url": "https://serreswrapcenter.es/services/paint-correction.html",
313	"provider": {
314	"@type": "AutoBodyShop",
315	"name": "SERRES Wrap Center",
316	"telephone": "+34621244469",
317	"url": "https://serreswrapcenter.es/",
318	"address": {
319	"@type": "PostalAddress",
320	"streetAddress": "Av. Can Fatjó dels Aurons, 15",
321	"addressLocality": "Sant Cugat del Vallès",
322	"addressRegion": "Barcelona",
323	"postalCode": "08174",
324	"addressCountry": "ES"
325	},
326	"aggregateRating": {
327	"@type": "AggregateRating",
328	"ratingValue": "4.9",
329	"reviewCount": "50",
330	"bestRating": "5"
331	}
332	},
333	"areaServed": [
334	{ "@type": "City", "name": "Sant Cugat del Vallès" },
335	{ "@type": "City", "name": "Barcelona" }
336	],
337	"offers": [ ... 3 Offers EUR ... ]   // 337-377
378	}
379	</script>
```
Same trailing-comma caveat at line 325.

### 1.4 Service pages WITHOUT aggregateRating (for the acceptance grep)
- `services/ceramic.html:239-289` provider `LocalBusiness` — no rating.
- `services/detailing.html:571-…` provider `AutoDetailing` — no rating.
- `services/ppf.html:300-371` provider `LocalBusiness` — no rating.
- `services/vinyl.html:344-413` provider `AutoRepair` — no rating.
- `index.html:612-647` `AutoBodyShop` — no rating.
- `pages/prices.html:238-260`, `pages/projects.html:210-222`, `pages/gallery.html:267-269` — no rating.

---

## 2. TESTIMONIALS[] on `pages/why-serres.html` — full dump + rendering

### 2.1 The JS array (English keys, translated at runtime) — `pages/why-serres.html:439-482`

```js
439	<script>
440	/* ---------- Reviews: stacking testimonial cards ---------- */
441	(function(){
442	  const TESTIMONIALS=[
443	    {name:"Marc Vidal",role:"Golf GTI · Owner",rating:5.0,svc:"Full Wrap",
444	     quote:"Excellent service from start to finish. The treatment is genuinely exceptional — very professional, attentive to every detail and always ready to offer a personalised experience. I brought my Golf GTI in for a black wrap and the result was flawless, beyond my expectations. I'm delighted with both the finish and the whole process. Without a doubt, a place I thoroughly recommend."},
445	    {name:"Marcos Catlano",role:"Porsche 911 · Owner",rating:5.0,svc:"Paint Correction",
446	     quote:"Years of swirls just… gone. They walked me round the car panel by panel under the hex lights. You can see your reflection in the roof like a mirror."},
447	    {name:"Daniel Roca",role:"Mercedes G-Class · Collector",rating:4.8,svc:"Full Wrap",
448	     quote:"Colour change on the G-Class was flawless — every shut line and edge finished properly. This is a proper studio."},
449	    {name:"Aleix Soler",role:"Audi RS6 · Owner",rating:5.0,svc:"PPF + Ceramic",
450	     quote:"Booked the full front PPF and a ceramic on top. Communication was perfect, timeline was exact, and the car came back cleaner than the showroom."},
451	    {name:"Núria Camps",role:"Range Rover · Owner",rating:4.9,svc:"Detailing",
452	     quote:"The interior detail genuinely felt like a new car. They care about the parts nobody photographs."}
453	  ];
454	
455	  function stars(r){
456	    let out='';
457	    for(let i=1;i<=5;i++){
458	      const full=i<=Math.round(r);
459	      out+='<svg viewBox="0 0 24 24" fill="currentColor" class="'+(full?'s-full':'s-empty')+'">'+
460	        '<path d="M12 2l2.9 6.26L21.5 9.2l-4.75 4.43 1.2 6.62L12 17.1 6.05 20.25l1.2-6.62L2.5 9.2l6.6-.94z"/></svg>';
461	    }
462	    return out;
463	  }
464	  function initials(n){return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
465	  function T(s){return (window.SERRES_I18N&&window.SERRES_I18N.t)?window.SERRES_I18N.t(s):s;}
466	
467	  function paint(){
468	    document.getElementById('rvStack').innerHTML=TESTIMONIALS.map(t=>
469	      '<article class="rv-card">'+
470	        '<div class="rv-top">'+
471	          '<div class="rv-avatar">'+initials(t.name)+'</div>'+
472	          '<div class="rv-id"><span class="rv-name">'+t.name+'</span><span class="rv-role">'+T(t.role)+'</span></div>'+
473	        '</div>'+
474	        '<div class="rv-rate"><span class="score">'+t.rating.toFixed(1)+'</span><span class="rv-stars">'+stars(t.rating)+'</span></div>'+
475	        '<p class="rv-quote">&ldquo;'+T(t.quote)+'&rdquo;</p>'+
476	        '<span class="rv-svc">'+T(t.svc)+'</span>'+
477	      '</article>').join('');
478	  }
479	  paint();
480	  window.addEventListener('serres:langchange',paint);
481	})();
482	</script>
```

Names are Catalan/Barcelona-typical (Marc Vidal, Aleix Soler, Núria Camps, Daniel Roca) — not credible for a Florida branch and, per the brief, reviews of the Barcelona shop.

### 2.2 The second, pre-rendered copy (SSR, Spanish) — `pages/why-serres.html:407`

Line 407 is a single ~6 KB line: `<div class="rv-stack" id="rvStack" data-i18n-skip>` followed by the **same 5 cards already rendered in Spanish** (avatars `MV/MC/DR/AS/NC`, roles "Golf GTI · Propietario", "Porsche 911 · Propietario", "Mercedes G-Class · Coleccionista", "Audi RS6 · Propietario", "Range Rover · Propietario", scores 5.0/5.0/4.8/5.0/4.9, five inline star `<svg>`s each, quotes in Spanish, service pills "Car Wrap completo", "Corrección de pintura", "Car Wrap completo", "PPF + Cerámica", "Detailing"). `data-i18n-skip` stops the i18n walker from binding these text nodes; `paint()` at line 479 overwrites the whole `innerHTML` on load anyway, so the SSR copy only matters for no-JS and for crawlers. **Both copies must be removed.**

### 2.3 Dictionary entries that exist only for these testimonials — `assets/serres-i18n.js:920-944`

```js
920	    /* ---------- WHY SERRES: testimonial roles, services, quotes ---------- */
921	    "BMW M2 · Owner": ["BMW M2 · Propietario", "BMW M2 · Propietari"],            // DEAD — no testimonial uses it
922	    "Golf GTI · Owner": ["Golf GTI · Propietario", "Golf GTI · Propietari"],
923	    "Porsche 911 · Owner": ["Porsche 911 · Propietario", "Porsche 911 · Propietari"],
924	    "Mercedes G-Class · Collector": ["Mercedes G-Class · Coleccionista", "Mercedes G-Class · Col·leccionista"],
925	    "Audi RS6 · Owner": ["Audi RS6 · Propietario", "Audi RS6 · Propietari"],
926	    "Range Rover · Owner": ["Range Rover · Propietario", "Range Rover · Propietari"],
927	    "Satin PPF": ["PPF satinado", "PPF setinat"],                                  // DEAD
928	    "Full Wrap": ["Car Wrap completo", "Car Wrap complet"],
929	    "PPF + Ceramic": ["PPF + Cerámica", "PPF + Ceràmica"],
930	    "Excellent service from start to finish. … a place I thoroughly recommend.":
931	      ["Un servicio excelente de principio a fin. … Sin duda, un lugar totalmente recomendable.",
932	       "Un servei excel·lent de principi a fi. … Sens dubte, un lloc totalment recomanable."],
933	    "Years of swirls just… gone. …": [ "Años de micro-arañazos simplemente… desaparecidos. …", "Anys de micro-ratllades …" ],   // 933-935
936	    "Colour change on the G-Class was flawless — …": [ "El cambio de color del clase G fue impecable — …", "…" ],             // 936-938
939	    "Booked the full front PPF and a ceramic on top. …": [ "Reservé el PPF frontal completo y una cerámica encima. …", "…" ],  // 939-941
942	    "The interior detail genuinely felt like a new car. …": [ "El detallado de interior hizo que pareciera un coche nuevo de verdad. …", "…" ], // 942-944
```
"Paint Correction" (line 82) and "Detailing" (untranslated, not in DICT) are shared keys and stay. Removing the testimonials leaves lines 921-944 as dead dictionary weight; `_build/dict-tools.js check` will not flag dead keys (it only flags collisions).

### 2.4 How the section is rendered and what happens if the array is empty

Section markup `pages/why-serres.html:386-410`:
```html
386	<!-- ===================== REVIEWS (sticky stacking) ===================== -->
387	<section class="reviews" data-screen-label="Why SERRES — Reviews">
388	  <div class="wrap">
389	    <div class="rv-grid">
391	      <div class="rv-left">
392	        <span class="rv-tag"><span class="dot"></span> Lo que dicen los clientes</span>
393	        <h2>La confianza de<br>los coches que<br>más quieren.</h2>
394	        <p>Desde un primer Car Wrap hasta un proyecto completo de PPF y corrección — estas son las personas que nos dieron las llaves, y lo que dijeron al recuperarlas.</p>
395	        <div class="rv-stats">
396	          <div class="rv-stat"><b class="chrome-text">4.9</b><span>Valoración media</span></div>
397	          <div class="rv-stat"><b class="chrome-text">50+</b><span>Coches</span></div>
398	          <div class="rv-stat"><b class="chrome-text">98%</b><span>Recomendaciones</span></div>
399	        </div>
400	        <div class="rv-actions">
401	          <a href="../index.html#contact" class="btn">Pedir presupuesto <span class="arr">→</span></a>
402	          <a href="projects.html" class="btn ghost">Ver proyectos</a>
403	        </div>
404	      </div>
407	      <div class="rv-stack" id="rvStack" data-i18n-skip> …5 SSR cards… </div>
408	    </div>
409	  </div>
410	</section>
```
CSS (`pages/why-serres.html:146-191`, responsive `:210-215`):
- `.reviews{padding:110px 0 60px}` — section has fixed vertical padding regardless of content.
- `.rv-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start}`; `@media(max-width:980px)` → single column, `.rv-left{position:static}`, `.rv-stack{padding-bottom:10vh}`.
- `.rv-left{position:sticky;top:calc(var(--navh) + 40px)}` — left column is sticky.
- `.rv-stack{display:flex;flex-direction:column;gap:22px;padding-bottom:30vh}`; `.rv-card{position:sticky; …}` with `nth-child(1..5)` `top` offsets (`:169-173`) — the stacking effect is hard-wired to **exactly 5 cards**; a 6th card would not be sticky-offset.
- Stars: `.rv-stars svg{width:16px;height:16px}`, `.s-full{color:#f3f3f5}`, `.s-empty{opacity:.4}`; score `.rv-rate .score`.
- **There is no empty-state rule** (no `:empty`, no `[hidden]`, no conditional in `paint()`). With `TESTIMONIALS=[]`, `paint()` sets `innerHTML=''` → the right column becomes an empty flex box that is still `30vh` tall (10vh on mobile); the left column (tag "Lo que dicen los clientes", H2, paragraph, 4.9/50+/98% tiles, two buttons) stays → a half-empty two-column section with the headline "La confianza de los coches que más quieren." and no cards. On mobile the left block is followed by ~10vh of blank space, then the CTA.
- Recommended port behaviour: remove the whole `<section class="reviews">` (386-410) plus the script (439-482) plus the SSR div. The following `.cta{margin-top:80px;padding:104px 0}` (`:194`) already provides its own top spacing, so the Standards section flows straight into the CTA without a hard cut. Also delete `.reviews/.rv-*` CSS (146-191, 212-215) to avoid dead styles, and the i18n keys at `serres-i18n.js:346-355` ("What clients say", "Trusted with", "the cars they", "love most.", the intro paragraph, "Avg Rating", "Cars", "Referrals").

### 2.5 Other review-flavoured counters on the same page

`pages/why-serres.html:335-339` (hero):
```html
335	      <div class="hero-stats">
336	        <div class="hstat"><b class="chrome-text">50+</b><span>Coches transformados</span></div>
337	        <div class="hstat"><b class="chrome-text">4.9</b><span>Valoración media</span></div>
338	        <div class="hstat"><b class="chrome-text">1</b><span data-en="Workshop">Taller</span></div>
339	      </div>
```
- `.hero-stats{display:flex;gap:46px;flex-wrap:wrap}` (`:105`); entrance fade `:116`; reduced-motion override `:228`.
- `50+`/`4.9`/`1` are animated from 0 by `assets/serres-enhance.js:219-236` (`querySelectorAll('.hstat b, .rv-stat b, .gb-val, [data-count-up]')`; regex `^(\s*)([0-9][\d,]*(?:\.\d+)?)([\s\S]*)$` so `50+`→counts to 50 then appends `+`, `4.9`→1 decimal, `98%`→appends `%`). Replacing these with non-numeric text (e.g. "Miami") is safe — non-matching innerHTML is skipped (`if (!m) return;`).
- `1 Taller` (`data-en="Workshop"`, DICT `:316`) is factually wrong once there are two branches — decision for the client (e.g. "2 Workshops"/"1 Studio in Miami").
- i18n keys: `"Cars Transformed"` `:314`, `"Average Rating"` `:315`, `"Workshop"` `:316`, `"Avg Rating"` `:353` (ES value collides with `:315` → INV maps "Valoración media" to "Average Rating"; irrelevant once the dictionary is applied forward EN→ES), `"Cars"` `:354`, `"Referrals"` `:355`.

Meta/OG/Twitter description with the 98% claim — `pages/why-serres.html:7,13,20`:
```html
7	<meta name="description" content="Estudio de detailing en Sant Cugat del Vallès: PPF, Car Wrap y corrección de pintura con materiales certificados y un 98% de clientes que nos recomiendan.">
```
DICT key `serres-i18n.js:1018-1020` ("Detailing studio in Sant Cugat del Vallès: … 98% of clients who recommend us.").

### 2.6 Review sections on OTHER pages — none
Grep for `rese[ñn]a|review|★|⭐|estrella|valorad|opini[oó]n|testimon|Google review|rating|stars|Trustpilot|Yelp` over the other 14 pages: **no hits** except `pages/gallery.html:471,493,495` ("cielo estrellado" = starlight headliner, not a rating) and the JSON-LD blocks in §1. `index.html` hero has **no** trust bar / no "50+ reseñas" / no "Valorado en Google" badge; its only Google element is the Maps iframe (`index.html:858`) and the Maps link (`:892`). The word "reseñas" does not appear anywhere in the HTML. Other `.hstat` counters (not review-related, listed for completeness; all pass through the count-up):
- `pages/projects.html:274-276` — `6 Exclusivos al año` (gold), `1 Coche a la vez`, `100% A medida` (+ CTA copy `:373-374` "Seis Exclusivos. Al año. Nada más." — capacity claim of the Barcelona shop, confirm for Miami).
- `services/ppf.html:481-483` — `50+ Colores de film`, `100% Reversible`, `3 Capas de film`.
- `services/vinyl.html:510-512` — `150+ Colores de film`, `3 Marcas profesionales`, `100% Reversible`.
- `services/ceramic.html:403-405`, `services/detailing.html:340-342`, `services/paint-correction.html:480-482` (`95% Eliminación de defectos`), `services/body-kits.html:451-453`; gloss meter `gb-val` 42/94 GU `paint-correction.html:568,575`.

---

## 3. Visible star-rating UI and "reseñas"-type counts

### 3.1 Star UI
Only on `pages/why-serres.html`: inline `<svg class="s-full">` ×5 per card in line 407 and the JS `stars()` generator (`:455-463`). No star glyphs (★/⭐/☆) or star SVGs elsewhere. No Google review widget, no third-party embed, no `schema.org/Review`.

### 3.2 Numeric review-type claims in HTML text (complete list)
| File:line | Text |
|---|---|
| `pages/why-serres.html:336` | `50+ Coches transformados` |
| `pages/why-serres.html:337` | `4.9 Valoración media` |
| `pages/why-serres.html:396` | `4.9 Valoración media` |
| `pages/why-serres.html:397` | `50+ Coches` |
| `pages/why-serres.html:398` | `98% Recomendaciones` |
| `pages/why-serres.html:7,13,20` | "…un 98% de clientes que nos recomiendan." |
| `pages/why-serres.html:407` | scores 5.0 / 5.0 / 4.8 / 5.0 / 4.9 (SSR cards) |
| `pages/why-serres.html:443-452` | `rating:5.0/5.0/4.8/5.0/4.9` (JS) |

### 3.3 Trust claims embedded in blog prose (must be rewritten in the Florida refocus)
- `blog/cuanto-cuesta-vinilar-un-coche.html:331-335`:
  ```
  331	    <p>En SERRES Wrap Center todo el trabajo se hace en nuestro taller propio de Sant Cugat del
  332	       Vallès, con cita previa de lunes a sábado. Cada coche pasa una revisión documentada panel a
  333	       panel antes de la entrega, y el 98 % de nuestros clientes nos recomienda, con una valoración
  334	       media de 4,9. Puedes revisar todas las tarifas vigentes en nuestra
  335	       <a href="../pages/prices.html">página de precios</a>.</p>
  ```
- `blog/ppf-o-ceramico-que-elegir.html:327-330`: "…Es parte del método que nos mantiene en 4,9 de valoración con un 98 % de clientes que nos recomiendan…"
- `blog/cuanto-cuesta-ppf-coche.html:332`: "…Es el motivo de que el 98% de nuestros clientes nos recomiende."
- `blog/limpieza-tapiceria-coche-precio.html:334`: "…El 98 % de nuestros clientes nos recomienda en parte por…"
- Same article also carries Spain-only regulatory content (not trust, but in this sweep): `blog/cuanto-cuesta-vinilar-un-coche.html:115-118` (FAQ JSON-LD) and `:354-356` (visible FAQ) — "¿Hay que avisar a la DGT si vinilo el coche de otro color?" / "…no exige homologación ni ITV extraordinaria…". `serres-i18n.js` has 17 lines matching `ITV|DGT|IVA|VAT`.

### 3.4 i18n dictionary entries carrying review/stat vocabulary (all in `assets/serres-i18n.js`)
`:314 "Cars Transformed"`, `:315 "Average Rating"`, `:316 "Workshop"`, `:346 "What clients say"`, `:347-349 "Trusted with"/"the cars they"/"love most."`, `:350-352` intro paragraph ("From a first wrap to a full PPF and correction build — these are the people who handed us the keys…"), `:353 "Avg Rating"`, `:354 "Cars"`, `:355 "Referrals"`, `:921-944` testimonial roles/services/quotes, `:1018-1020` the 98 % meta description. No dictionary entry contains "4.9" or "50 reviews"; `50+` appears only in PPF colour copy (`:447, :752`), which is not a review claim.

---

## 4. Barcelona-specific project claims, brands, certifications, partners (→ "confirm with client")

### 4.1 Gallery copy tied to Barcelona geography — `pages/gallery.html`
| Line | Snippet | Why not transferable |
|---|---|---|
| 7, 13, 20 | "Proyectos de SERRES en Barcelona: galería de trabajos reales…" | meta/OG |
| 306 | `<span class="h1-kw">Galería de trabajos — PPF, Car Wrap y Detailing en Barcelona</span>` | H1 keyword line |
| 308 | "Cada coche tiene su propia sala… **Fotografiado en Barcelona y alrededores — sin fotos de stock ni coches de alquiler.** Elige un proyecto abajo o recorre la planta." | explicit provenance claim |
| 309 | "Protección PPF en Barcelona" link label | |
| 371 | `<span class="cap-note">Con nieve</span><span class="cap-tag">Invierno</span>` (+ img alt `:369` "RWB Porsche 993 cubierto de nieve sobre una rampa de hormigón") | snow ≠ Miami |
| 383 | "Un M2 G87 nuevo… fotografiado en **una azotea de Barcelona con la torre de Collserola detrás**…" | landmark |
| 392, 397 | captions `Azotea`, `Collserola` (alt `:395` "…con la torre de Collserola detrás", `:400` "…con la torre de Collserola al fondo") | landmark |
| 414 | "Un GR Supra blanco perla protegido y sellado, **llevado después al campo catalán**." | |
| 421, 423 | alt "…junto a una **masía catalana** de piedra"; caption "Entrada de la masía" | |
| 445, 452-459 | "…rodando a velocidad en la **autopista** y aparcado en una **carretera de costa** bordeada de cipreses" ; captions "Toma rodando", "Carretera de costa" | Mediterranean coast |
| 471, 480 | "…fotografiado en una **carretera secundaria catalana** con el sol entre las nubes"; caption "Carretera secundaria" | |
| 659 | `<footer>© 2026 SERRES. Todos los derechos reservados. &nbsp;·&nbsp; Sobre coches reales de clientes</footer>` | provenance claim |
| 268 | ImageGallery JSON-LD: "Fotos reales de proyectos … hechos en el taller de SERRES en Sant Cugat del Vallès (Barcelona)." | |

Matching dictionary keys: `serres-i18n.js:111-113` (gallery lead), `:121-123` (M2/Collserola), `:125` (Catalan countryside), `:129` (motorway/coast road), `:133-135` (Catalan back road), `:139-141` (footer "Shot on real client cars"), `:148 "Snow-dusted"`, `:150 "Rooftop"`, `:151 "Collserola"`, `:154 "Masia driveway"`, `:160 "Coast road"`, `:174-182` combined captions ("Snow-dusted · The ramp", "Frozen grey · Rooftop", "Front end · Collserola", "Pearl white · Masia driveway", "Gloss black · Coast road").
Decision needed: does Miami reuse the Barcelona portfolio (same brand, "sin fotos de stock" claim becomes untrue for Miami if the cars were not done there) or launch with a reduced gallery? Not decided here.

Also `index.html:753-781` reuses gallery photos as the six service tiles (`xm-grille-s`, **`supra-villa-s` (masía)**, **`e92-coast-s` (Spanish road sign)**, `xm-headliner-s`, `rwb-profile-s`) with empty `alt` — location leaks onto the home page even if the gallery is trimmed.

### 4.2 Exclusive / capacity claims — `pages/projects.html`
`:6-7,12-13,19-20` "Exclusivo — Proyectos de Transformación en Barcelona | SERRES", "…Solo 6 al año."; `:270` H1 kw "Proyectos de transformación completa en Barcelona"; `:274-276` stats `6 Exclusivos al año / 1 Coche a la vez / 100% A medida`; `:279` lead "…transformación completa de coches en Barcelona…"; `:372-374` "Limitado por diseño — Seis Exclusivos. Al año. Nada más. Un proyecto completo ocupa el taller durante semanas, así que solo aceptamos unos pocos al año…". These describe the Barcelona shop's capacity → confirm Miami's own number (or drop). JSON-LD `:216 "areaServed":"Barcelona"`.

### 4.3 Brand names, warranties, "certified" wording (no named certifications exist)
Grep for `XPEL|KPMF|Gtechniq|STEK|SunTek|Llumar|Ceramic Pro|Gyeon|certified installer|instalador autorizado|partner|concesionario oficial` → **no installer certification, no partner/dealer logos, no "authorised installer" claim anywhere.** What does exist and needs the client's OK for Miami (US distribution/warranty terms differ):
- Film brands: `3M` (Serie 2080), `Avery Dennison` (Supreme Wrapping Film), `Inozetek` (Super Gloss) — colour pickers `services/vinyl.html:688-…` (`{id:"3m",label:"3M",series:"Wrap Film Serie 2080"…}` `:690`, `avery` `:756`, `inozetek` `:837`) and `services/ppf.html:783-831` (`inozetek` `:786`, `3m` `:831`); footers `services/ppf.html:707` "Paint Protection Film · Inozetek · 3M", `services/vinyl.html:673` "Car Wrap · 3M · Avery Dennison · Inozetek"; meta `services/vinyl.html:7,13,20`; JSON-LD `services/vinyl.html:349,352`; FAQ `services/vinyl.html:424,440,629,639`; spec row `services/vinyl.html:570` "3M™ 2080 Satin Black"; hero stat `services/vinyl.html:511` "3 Marcas profesionales"; home `index.html:815`; blog `cuanto-cuesta-ppf-coche.html:281` ("3M, XPEL o SunTek" as market examples), `:205,285-286,348,420`; `cuanto-cuesta-vinilar-un-coche.html:102,220,273,284,315,322,342,421`; `ppf-o-ceramico-que-elegir.html:108,202,234-235,262,312,344-345`.
- "varias marcas profesionales" (deliberately vague) — `index.html:621,815`, `pages/prices.html:321`, `services/ppf.html:7,13,20,307,390,591,662`, `services/vinyl.html:527`.
- Warranty claims: "3 años de garantía del fabricante/del film" (PPF) — `index.html:658,820`, `services/ppf.html:307,390,662`, blog ×8 lines above; vinyl "duran entre 5 y 7 años… el fabricante los respalda con su garantía oficial. Además **garantizamos por escrito nuestra instalación**" `services/vinyl.html:440,639`; ceramic "hasta 5 años" `services/ceramic.html:246,316`, stat `:404`; body kits "Garantizamos la fijación, el ajuste de holguras y el acabado de pintura…" `services/body-kits.html:368,561`.
- "Certified" wording: `pages/why-serres.html:7,13,20` ("materiales certificados"), `:370` "Solo films, recubrimientos y compuestos **certificados** — respaldados por garantías reales de fabricante, nunca stock de mercado gris." (DICT `:338-340`); `blog/limpieza-tapiceria-coche-precio.html:330` "desinfección certificada".
- "concesionario" appears only inside a testimonial quote (`why-serres.html:407`, DICT `:940`) — goes away with §2.
- Other hard claims the port must keep consistent: `services/paint-correction.html:481` "95% Eliminación de defectos"; `services/ppf.html:591` "Más de 50 colores"; `services/vinyl.html:515` "más de 150 colores".

### 4.4 Pre-existing banned-claims guard
`_build/verify-seo.js:21-24`:
```js
const BANNED = [
  /10 años/i, /200 ?micras/i, /200 ?µm/i, /\b9H\b/, /subcontrat/i,
  /cristal líquido/i, /\b1080\b/, /medidor de brillo/i, /medidor de espesor/i,
];
```
`_build/agg-report.json` `banned` field records that every page was scanned clean on 2026-07-09. The Miami rewrite (English) must add English equivalents ("10 years", "200 microns", "9H", "subcontract", "liquid glass", "gloss meter", "thickness gauge") or the guard becomes useless.

---

## 5. Legal: privacy / cookies / terms / consent / footer

### 5.1 What exists — nothing
- Grep `privacidad|privacy|cookie|aviso legal|RGPD|GDPR|LOPD|términos|terms|condiciones|consent` over all 15 pages, both JS files and the dictionary → **zero hits** other than "© 2026 SERRES. Todos los derechos reservados." and the body-kits guarantee FAQ.
- No `privacy*.html`, `legal*.html`, `cookies*.html`, `terms*.html` in the tree (full `find` listing checked).
- No cookie banner, no consent-mode `gtag('consent', …)`, no CMP script. GA4 `G-1K6FYZ99GN` is loaded unconditionally in `<head>` on all 16 files (`index.html:681-686`, `pages/gallery.html:274-279`, `pages/prices.html:267-272`, `pages/projects.html:229-234`, `pages/why-serres.html:296-301`, `services/body-kits.html:410-415`, `services/ceramic.html:358-363`, `services/detailing.html:294-299`, `services/paint-correction.html:437-442`, `services/ppf.html:440-445`, `services/vinyl.html:471-476`, `blog/index.html:52-57`, `blog/cuanto-cuesta-ppf-coche.html:121-126`, `blog/cuanto-cuesta-vinilar-un-coche.html:141-146`, `blog/limpieza-tapiceria-coche-precio.html:141-146`, `blog/ppf-o-ceramico-que-elegir.html:41-46`) plus a click tracker (`whatsapp_click` / `phone_click`) at the bottom of each page (e.g. `pages/why-serres.html:486-501`). Under Florida law no banner is legally required for a small business, but a privacy policy that discloses GA4/WhatsApp is standard; the brief asks for privacy + terms as TODO/create.
- Google Maps embed (`index.html:858`) with `referrerpolicy="no-referrer-when-downgrade"` also sets Google cookies — disclose in the privacy page.

### 5.2 Footer inventory (where legal links would go)

**`index.html:866-902`** — the only multi-column footer:
```html
866	<footer>
867	  <div class="wrap">
868	    <div class="foot">
869	      <div>
870	        <div class="logo chrome-text">SERRES</div>
871	        <p class="tagline">Protección de pintura, Car Wrap a medida y detailing de nivel concours.</p>
872	      </div>
873	      <div class="foot-cols">
874	        <div class="foot-col">
875	          <h3>Servicios</h3>
876	          <a href="services/ppf.html">Paint Protection Film</a>
877	          <a href="services/vinyl.html" data-i18n-skip>Car Wrap</a>
878	          <a href="services/ceramic.html" data-i18n-skip>Ceramic Coating</a>
879	          <a href="services/paint-correction.html">Corrección de pintura</a>
880	          <a href="services/detailing.html" data-i18n-skip>Detailing</a>
881	          <a href="services/body-kits.html">Body Kits</a>
882	        </div>
883	        <div class="foot-col">
884	          <h3>Taller</h3>
885	          <p>Sant Cugat del Vallès<br>Barcelona, España</p>
886	          <a href="tel:+34621244469">+34 621 24 44 69</a>
887	        </div>
888	        <div class="foot-col">
889	          <h3>Síguenos</h3>
890	          <a href="https://www.instagram.com/serres.wrap.center/" target="_blank" rel="noopener">Instagram</a>
891	          <a href="https://wa.me/34621244469?text=Hola%20SERRES%2C%20quer%C3%ADa%20pedir%20presupuesto%20para%20mi%20coche." target="_blank" rel="noopener">WhatsApp</a>
892	          <a href="https://www.google.com/maps/search/?api=1&query=Serres+Wrap+Center+Sant+Cugat+del+Vall%C3%A8s" target="_blank" rel="noopener">Google Maps</a>
893	          <a href="blog/index.html">Blog</a>
894	        </div>
895	      </div>
896	    </div>
897	    <div class="foot-bottom">
898	      <span>© 2026 SERRES. Todos los derechos reservados.</span>
899	      <span>PPF · Car Wrap · Detailing · Corrección de pintura · Body Kits</span>
900	    </div>
901	  </div>
902	</footer>
```
Natural place for `Privacy` / `Terms`: a third `<span>` (or two `<a>`) inside `.foot-bottom` (`:897-900`) or a 4th `.foot-col`. DICT keys involved: `:99-100` "© 2026 SERRES. All rights reserved.", `:101` "PPF · Car Wrap · Detailing · Paint Correction · Body Kits", `:97` "Barcelona, Spain".

**All other 15 pages** — a single-line footer whose entire content is one text node (i18n binds the whole string, `\u00A0·\u00A0` included), with a per-page tagline:
| File:line | Footer text after "© 2026 SERRES. Todos los derechos reservados." | DICT key line |
|---|---|---|
| `pages/gallery.html:659` | ` · Sobre coches reales de clientes` | `:139-141` |
| `pages/prices.html:348` | ` · Precios orientativos en EUR, IVA incluido` | `:243-245` |
| `pages/projects.html:383` | ` · Exclusivo — proyectos completos limitados` | `:307-309` |
| `pages/why-serres.html:425` | ` · Detailing y personalización premium` | `:359-361` |
| `services/ppf.html:707` | ` · Paint Protection Film · Inozetek · 3M` | `:458-460` |
| `services/ceramic.html:571` | ` · Ceramic Coating SiO₂` | `:518-520` |
| `services/detailing.html:497` | ` · Detailing de interior y exterior` | `:572-574` |
| `services/paint-correction.html:640` | ` · Pulido por etapas a máquina` | `:634-636` |
| `services/vinyl.html:673` | ` · Car Wrap · 3M · Avery Dennison · Inozetek` | `:673-675` |
| `services/body-kits.html:602` | ` · Body Kits · Llantas a medida · Colas de escape` | `:725-727` |
| `blog/index.html:143` | (none) | `:99-100` |
| `blog/cuanto-cuesta-ppf-coche.html:429` | `&nbsp;&nbsp;<a href="index.html">· Blog</a>` | `:99-100` |
| `blog/cuanto-cuesta-vinilar-un-coche.html:430` | `<span> &nbsp;·&nbsp; </span><a href="index.html">Blog</a>` | `:99-100` |
| `blog/limpieza-tapiceria-coche-precio.html:443` | `<span> &nbsp;·&nbsp; </span><a href="index.html">Blog</a>` | `:99-100` |
| `blog/ppf-o-ceramico-que-elegir.html:428` | `<span>© …</span> &nbsp;·&nbsp; <a href="index.html">Blog</a>` | `:99-100` |

Implications for adding Privacy/Terms links consistently: (a) on the 10 non-blog one-liners the copyright + tagline is **one** text node keyed by the full string — inserting `<a>` elements splits it into two text nodes, so the dictionary must be re-keyed to "© 2026 SERRES. All rights reserved." and the tagline separately (the pattern the blog articles already use); (b) the four blog articles use three different markups for the same footer (`· Blog` inside the link vs. `<span> · </span>` separators vs. a wrapped `<span>`) — normalise to one pattern while adding the legal links; (c) `pages/prices.html:348` tagline says **EUR, IVA incluido** → must become USD wording (Step 3 of the brief); (d) none of the footers has a `<nav>` or landmark for legal links — a11y gate wants a labelled nav.

---

## 6. `.htaccess` — full dump and rule-by-rule explanation

```apache
     1	# ─────────────────────────────────────────────────────────────────────────
     2	#  SERRES — cache policy
     3	#
     4	#  Goal: every change pushed to the site is visible immediately, for every
     5	#  visitor, on every device (not just in incognito).
     6	#
     7	#  How: browsers may still STORE files, but they must re-check ("revalidate")
     8	#  with the server before reusing them. When a file hasn't changed, the server
     9	#  answers with a tiny "304 Not Modified" (still fast, no re-download). When a
    10	#  file HAS changed, the browser fetches the new version right away. This
    11	#  removes the stale-cache problem caused by the previous 7-day cache rule.
    12	# ─────────────────────────────────────────────────────────────────────────
    13	
    14	# 1) Disable any long-lived expiry rules (Hostinger enables these by default,
    15	#    which is what cached files for up to 7 days).
    16	<IfModule mod_expires.c>
    17	  ExpiresActive Off
    18	</IfModule>
    19	
    20	# 2) Tell every response to always revalidate before being reused.
    21	<IfModule mod_headers.c>
    22	  Header unset Expires
    23	  Header unset Pragma
    24	  Header set Cache-Control "no-cache, must-revalidate"
    25	
    26	  # HTML pages: never reuse without checking the server first.
    27	  <FilesMatch "\.(html?|json)$">
    28	    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    29	  </FilesMatch>
    30	</IfModule>
    31	
    32	# 3) Keep validators on so unchanged files can return a fast 304 instead of
    33	#    re-downloading. (ETag + Last-Modified power the revalidation above.)
    34	FileETag MTime Size
    35	
    36	# 4) Correct MIME types for the self-hosted fonts. Most Apache builds already
    37	#    know woff2, but some Hostinger setups do not; declaring it guarantees the
    38	#    browser receives the fonts as fonts (not as octet-stream / html).
    39	<IfModule mod_mime.c>
    40	  AddType font/woff2 .woff2
    41	  AddType font/woff  .woff
    42	  AddType font/ttf   .ttf
    43	</IfModule>
```
| Rule | Lines | What it does | GitHub Pages equivalent |
|---|---|---|---|
| 1 `ExpiresActive Off` | 16-18 | Cancels Hostinger's default 7-day `Expires` headers. | N/A — GH Pages sends `Cache-Control: max-age=600` for everything; cannot be changed. |
| 2 `Cache-Control no-cache, must-revalidate` (all) and `no-store, max-age=0` for `.html/.htm/.json` | 21-30 | Forces revalidation on every asset; HTML never reused from cache. | Not configurable on GH Pages (10-min cache; CDN purge on deploy). Acceptable; nothing to add. |
| 3 `FileETag MTime Size` | 34 | Enables ETag so revalidation returns 304. | GH Pages already sends ETags. |
| 4 `AddType font/woff2 …` | 39-43 | Fixes font MIME for `assets/fonts/*.woff2` (`assets/fonts.css`). | GH Pages serves `font/woff2` correctly by default. |

**Not present** (so nothing to port): no `RewriteEngine`, no HTTP→HTTPS or www↔non-www redirect, no `ErrorDocument 404`, no gzip/brotli, no security headers, no trailing-slash rules. The comments (`:14-15`, `:37-38`) tie the file to Hostinger explicitly.
If Miami is on **Hostinger/Apache**: keep verbatim. If **GitHub Pages**: delete `.htaccess`, add `.nojekyll` (also needed because `_build/` starts with an underscore and Jekyll would otherwise ignore it — harmless — but `.nojekyll` is the global rule), enforce HTTPS in repo settings, optionally add a `404.html` (none exists today — Hostinger serves its own default 404 page).

---

## 7. Barcelona-only media (plates, landmarks, Spanish text in images)

Every asset below was opened. "EU band" = the blue left-hand strip with the country letter "E" (Spain) visible even when digits are blanked. `.webp` siblings are conversions of the same frame (see `_build/webp-manifest.json`), so a fix must be applied to both.

### 7.1 MUST FIX — readable Spanish registration + dealer branding
| Asset | Used at | What is visible |
|---|---|---|
| `assets/detailing/ext-before.jpg` (+`.webp`) | `services/detailing.html:385` alt "Exterior de un Audi SQ7 antes — pintura polvorienta y apagada" | Audi SQ7 rear, plate **`E 2383 MRZ`** fully legible, dealer plate frame **`movento.es`** (Movento = Audi dealer group, Barcelona). |
| `assets/detailing/ext-after.jpg` (+`.webp`) | `services/detailing.html:389` | Same car, front, plate **`2383 MRZ`** legible again. |
| `assets/detailing/int-before.jpg`, `int-after.jpg` (+`.webp`) | `services/detailing.html:362,366` | Interior of the same SQ7 (no plate) — fine on their own, but the alt text names "Audi SQ7" and pairs them with the exterior shots. |
| `assets/og/detailing.jpg` and `assets/blog/limpieza-tapiceria-coche-precio/{og.jpg,cover.webp}` | OG for detailing + blog | Same Audi dashboard crop — no plate, OK. |
`.gitignore:10` lists a working folder `fotos sin matricula/` (plate-less photos) — the client has already produced plate-free versions of some photos; ask for them.

### 7.2 EU "E" plate band or Spanish street furniture visible (confirm with client; blur or replace)
| Asset | Used at | Detail |
|---|---|---|
| `assets/ppf/before.jpg` (+`.webp`) | `services/ppf.html:513` "BMW M2 antes" | Front plate digits blanked but blue **E** band visible. |
| `assets/correction/before.jpg`, `after.jpg` (+`.webp`) | `services/paint-correction.html:512-513` | E92 rear; blue **E** band at bottom-right in both frames; `RECARO` seats. |
| `assets/gallery/supra-rear-s.jpg` / `supra-rear.jpg` | `pages/gallery.html:426` | Blue EU band, digits blurred. |
| `assets/gallery/supra-road-s.jpg` / `.jpg` | `pages/gallery.html:431` | Blue EU band, digits blanked. |
| `assets/gallery/supra-villa-s.jpg` / `.webp` / `.jpg` | `pages/gallery.html:421`, **`index.html:760`** (ceramic tile), JSON-LD `pages/gallery.html:268` | Blue EU band + Catalan **masía** (stone farmhouse, terracotta roof). |
| `assets/gallery/e92-coast-s.jpg` / `.webp` / `.jpg` | `pages/gallery.html:457`, **`index.html:767`** (detailing tile), JSON-LD `:268` | Plate blanked, but a **Spanish blue pedestrian-zone road sign** on a post, Mediterranean cypresses, sea. |
| `assets/gallery/e92-rolling-s.jpg` | `pages/gallery.html:452` | Plate blanked white; Spanish motorway guardrail — low risk. |
| `assets/gallery/gts-rear-s.jpg`, `gts-tail-s.jpg` | `pages/gallery.html:633,638` | Plate blanked white — OK. |
| `assets/bodykit/before.jpg`, `after.jpg` (+`.webp`) | `services/body-kits.html:484-485` | Red Golf GTI, plate removed — OK. |
| `assets/vinyl/xm-before.jpg` (+`.webp`) | `services/vinyl.html:584` | Plate blacked out; parking lot — OK. |

### 7.3 Barcelona landmark / climate cues (no text, but recognisable)
| Asset | Used at | Detail |
|---|---|---|
| `assets/gallery/m2-tower-s.jpg`, `m2-front-s.jpg`/`.webp`, `m2-rooftop-s.jpg`/`.webp` | `pages/gallery.html:390-400`; JSON-LD `:268` (`m2-rooftop.webp`) | **Torre de Collserola** (Foster tower) behind the car; rooftop with Barcelona skyline and sea. Captions literally say "Collserola". |
| **`assets/og/prices.jpg`** | `pages/prices.html:15,21` og/twitter image; JSON-LD `pages/prices.html:244` | Same M2 shot with the Collserola tower — a Barcelona landmark in the OG card of the prices page. |
| `assets/og/ppf.jpg`, `assets/blog/cuanto-cuesta-ppf-coche/{og.jpg,cover.webp}`, `assets/ppf/after.jpg`/`.webp` | `services/ppf.html:15,21,512`; blog | M2 on a Collserola-park road (no plate, no tower) — generic. |
| `assets/gallery/rwb-snow-s.jpg`/`.webp`/`.jpg` | `pages/gallery.html:369` | Porsche under **snow** — impossible in Miami. |
| `assets/gallery/xm-front/rear/quarter…`, `assets/og/vinyl.jpg`, `assets/vinyl/xm-after.jpg`, blog vinilar `og/cover` | multiple | Pine-forest back road, no plate — generic (copy calls it "carretera secundaria catalana"). |

### 7.4 Clean (checked, nothing location-specific, no text overlays)
`assets/og/home.jpg`, `assets/serres-poster.jpg` (CGI studio with a "SERRES" wall sign — brand only), `assets/og/why-serres.jpg`, `assets/og/gallery.jpg`, `assets/og/projects.jpg`, `assets/og/ceramic.jpg`, `assets/og/body-kits.jpg`, `assets/og/paint-correction.jpg`, `assets/blog/ppf-o-ceramico-que-elegir/{og.jpg,cover.webp}`, `assets/ceramic/{before,after}.jpg`, `assets/ceramic/poster-opt.jpg`, `assets/correction/poster-opt.jpg` (Ferrari being polished — stock-looking), `assets/detailing/poster-opt.jpg` (steam cleaning — stock-looking), `assets/svc/ppf-tile.jpg`, `assets/svc/ppf.png`, `assets/svc/vinyl.png` (RWB with "RAUH-Welt" banner — brand of the kit, not location), `assets/svc/bodykit.png`/`.webp` (rendered parts wall), gallery studio shots (`rwb-front/profile/side/top/doors`, `gts-front/quarter`, `cayenne-front/quarter/crest`, `landrover-nose/studio`, `ligier-front/rear`, `serie1-front`, `xm-headliner`, `xm-wheel`, `xm-grille`), `assets/gclass/frame_00.jpg` (press-style G-Class render used by the scroll canvas `index.html:940`), `assets/urus/frame_00.jpg`.
No OG image carries baked-in text. All `og:locale` are `es_ES` (`index.html:11` etc.) — Step 4 item.

### 7.5 Unverifiable here — flag for manual check
`assets/serres-hero.mp4` (`index.html:712`), `assets/ceramic/ceramic.mp4` (`services/ceramic.html:383`), `assets/detailing/detailing.mp4` (`services/detailing.html:325`), `assets/correction/correction.mp4` (`services/paint-correction.html:462`). Need a frame scrub for plates/Spanish text (Playwright + canvas per the machine rules). `assets/svc/{ceramic,detailing,paint-correction}.mp4` and `assets/urus/frame_00-71.jpg` are referenced by **no** in-scope file (orphans — 75 files; the Urus set survives only in the canvas id `#urus-canvas`, which actually loads `assets/gclass/frame_NN.jpg`, `index.html:940`).

### 7.6 Alt text with location (must be rewritten with the images)
`pages/gallery.html:369,395,400,421,426,457,478`; `blog/cuanto-cuesta-ppf-coche.html:175`, `blog/cuanto-cuesta-vinilar-un-coche.html:195`, `blog/index.html:93`, `blog/limpieza-tapiceria-coche-precio.html:195`, `blog/ppf-o-ceramico-que-elegir.html:175` (all "…en el taller SERRES de Sant Cugat (del Vallès)"); `pages/projects.html:261` "RWB Porsche 993 en el estudio SERRES bajo luces hexagonales" (no location).

---

## 8. Organization structured data & social handles

There is **no site-level `Organization` node** (no `founder`, `foundingDate`, `logo`, `brand`, `parentOrganization`). The business appears under five different types, which the Miami schema (AutoBodyShop + `branchOf`/`parentOrganization`) must unify:

| File:line | `@type` | name | telephone | priceRange | sameAs | image/logo |
|---|---|---|---|---|---|---|
| `index.html:615` | AutoBodyShop (top level) | SERRES Wrap Center | +34621244469 | `€€€` | `["https://www.instagram.com/serres.wrap.center/"]` (`:645`) | `apple-touch-icon.png` (`:619`); `hasMap` cid `:622` |
| `pages/why-serres.html:235` | AutoRepair (top level) | SERRES Wrap Center | +34 621 24 44 69 | `€€` | Instagram + `https://wa.me/34621244469` (`:264-267`) | `og/why-serres.jpg` |
| `pages/prices.html:246` | Service.provider LocalBusiness | " | " | — | Instagram + wa.me (`:253`) | — |
| `pages/projects.html:217` | Service.provider LocalBusiness | " | " | — | Instagram + wa.me (`:221`) | — |
| `pages/gallery.html:268` | ImageGallery.publisher LocalBusiness | " | — | — | — | — |
| `services/body-kits.html:275`, `services/paint-correction.html:314` | provider AutoBodyShop | " | +34621244469 | — | — (+aggregateRating) | — |
| `services/ceramic.html:248`, `services/ppf.html:309` | provider LocalBusiness | " | " | — | — | — |
| `services/detailing.html:580` | provider AutoDetailing | " | " | — | — | — |
| `services/vinyl.html:354` | provider AutoRepair | " | " | — | — | — |
| `blog/index.html:38` | Blog.publisher Organization | SERRES Wrap Center | — | — | — | — |
| `blog/cuanto-cuesta-ppf-coche.html:54-69`, `blog/ppf-o-ceramico-que-elegir.html:62-77` | author Organization **"Equipo SERRES"**; publisher Organization with `logo` `apple-touch-icon.png`, address, telephone | | | | | logo 180×180 px (below Google's 112 px min but not the 600 px recommendation) |
| `blog/cuanto-cuesta-vinilar-un-coche.html:55-74`, `blog/limpieza-tapiceria-coche-precio.html:55-74` | author + publisher Organization "SERRES Wrap Center", logo, address, telephone | | | | | same |

Observations for the port:
- `sameAs` contains a **WhatsApp deep link** (`wa.me/34621244469`) on 3 pages — non-standard; when the Miami number replaces it, decide whether to keep WhatsApp in `sameAs` at all.
- The brief wants `sameAs` to include `https://serreswrapcenter.es` (parent). Today no page links the parent, obviously.
- Instagram handle `serres.wrap.center` is the **Barcelona shop's** account. Occurrences (8): `index.html:645,852,890`, `pages/prices.html:253`, `pages/projects.html:221`, `pages/why-serres.html:265`, `assets/serres-enhance.js:17` (`IG_URL`, rendered into the mobile overlay menu at `:162`) and its comment `:295,306`. No TikTok, Facebook, YouTube, LinkedIn, X anywhere. → **Confirm with client**: does Miami get its own Instagram, or is the brand account shared?
- Google Maps: `index.html:622` `hasMap` cid `14481261717501919901`; `:858` embed iframe centred 41.4953/2.0634 with place id `0x2027f0d4ea2a70f1:0xc8f7c6ce9b2a429d`; `:892` search link. Mobile menu contact string "Sant Cugat del Vallès, Barcelona" is hard-coded in `assets/serres-enhance.js:164`.
- `openingHoursSpecification` appears in `index.html:631-644`, `pages/prices.html:250-252`, `pages/why-serres.html:250-263` only (other pages have none).
- `areaServed` = "Barcelona" / City nodes "Sant Cugat del Vallès" + "Barcelona" on prices, projects and all 6 service pages (`services/*.html` — e.g. `ppf.html:322-325`).

---

## 9. Build-tooling entanglements relevant to this key
- `_build/verify-seo.js:45` — GA4 check is hard-coded to `G-1K6FYZ99GN`; `:11-19` PAGES list uses the Spanish blog slugs; `:70-78` requires every FAQPage question/answer string to appear verbatim in visible HTML (so the FAQ JSON-LD and the visible `<details>` must be edited in lockstep — including the DGT/ITV FAQ). After removing `aggregateRating` blocks, re-run to confirm JSON-LD still parses.
- `_build/dict-tools.js:39,50,79` assume each DICT value is a `[es, ca]` pair (`v[0]`, `v[1]`); after pruning Catalan (`v[1]` gone) `check`/`lookup`/`merge` need the second index removed or they will treat `undefined` as a value.
- `_build/agg-report.json` is the 2026-07-09 SEO-package merge log: `dict_new` (139 entries incl. many "…in Barcelona" keys), `dict_changed` (25), `js_missing` (already-known dictionary gaps: `blog/index.html` "Guías y consejos" + subtitle, `pages/prices.html` tier labels, `services/vinyl.html` finish families) — a starting list for the "cero huérfanas" script.
- `assets/serres-i18n.js:1-18` header comment documents the current inverted (ES→EN via `INV`, `:1174-1188`) design; `getLang()` `:1193-1197` defaults to `"es"`; `tr()` `:1200-1206` returns the key untouched when `current === "en"` — the exact behaviour the Miami forward-mode must invert.

---

## 10. Risks / surprises noticed
1. **Legible Spanish plate + dealer frame** in the detailing before/after pair (`2383 MRZ`, `movento.es`) — a privacy issue on the live Barcelona site as well; needs the client's plate-free originals (`fotos sin matricula/` exists locally per `.gitignore:10`).
2. The brief's count "aggregateRating en 3 páginas de servicio" is off: it is `pages/why-serres.html` + 2 service pages; four service pages have none.
3. Testimonials exist **twice** (SSR line 407 and the JS array) and the CSS stacking is hard-wired to 5 cards; there is no empty state — remove the whole section rather than emptying the array.
4. `assets/og/prices.jpg` (the prices page's social card) shows the Torre de Collserola; `index.html` home tiles reuse the masía and Spanish-road-sign photos — geography leaks beyond the gallery page.
5. "Fotografiado en Barcelona… sin fotos de stock ni coches de alquiler" and the footer "Sobre coches reales de clientes" become false claims if the Barcelona portfolio is reused for Miami without saying so; meanwhile the home-page scroll sequence uses press-style G-Class renders (`assets/gclass/`), i.e. the "no stock photos" promise is already gallery-scoped only.
6. `1 Taller` hero stat and "Seis Exclusivos al año" are single-shop capacity claims.
7. No legal pages at all, and GA4 loads without consent on all pages — Miami needs a privacy page that discloses GA4 + Maps embed + WhatsApp; footer markup differs between page families (one text node vs. `<span>`/`<a>` mixes), so adding links needs dictionary re-keying.
8. `sameAs` lists a WhatsApp link; `priceRange` is `€€€` on the home page and `€€` on why-serres; `@type` varies across 5 values — worth unifying while doing Step 2.
9. 75 orphan asset files (`assets/urus/frame_*.jpg`, `assets/svc/*.mp4`) and 2 dead dictionary keys (`"BMW M2 · Owner"`, `"Satin PPF"`) — harmless but noise for the acceptance greps.
10. Four `.mp4` files could not be inspected for plates/Spanish text — manual frame scrub required before sign-off.
