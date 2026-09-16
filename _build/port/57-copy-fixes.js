/* 57-copy-fixes.js — one-off English fixes for strings the mechanical transform cannot map
   (Spanish text that had no dictionary entry in the Barcelona site, or attributes inside skip zones):
     · index.html  aria-label="Servicios SERRES"          -> "SERRES services"   (+ ES value)
     · prices.html aria-label="Elige un servicio"          -> "Choose a service"  (skip container: base language only)
     · gallery.html "BMW Serie 1" nav label                -> "BMW 1 Series"      (+ ES value)
     · services/ceramic.html legacy meta description key   -> rewritten (the inherited English key contained the banned
       "liquid-glass" claim the owner removed from the Spanish copy; verify-seo enforces it in English now too)
   Usage: node 57-copy-fixes.js <siteRoot>
*/
'use strict';
const path = require('path');
const { editFile, addEntries, renameEntries, loadDict, pages } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 57-copy-fixes.js <siteRoot>'); process.exit(2); }
const P = rel => path.join(root, rel);

editFile(P('index.html'), (src, api) => { api.once('aria-label="Servicios SERRES"', 'aria-label="SERRES services"', 'services grid aria-label'); });
editFile(P('assets/serres-enhance.js'), (src, api) => { api.once('     4.  LANGUAGE SWITCHER (EN / ES / CA) — loaded after the nav + mobile', '     4.  LANGUAGE SWITCHER (EN / ES) — loaded after the nav + mobile', 'enhance.js switcher comment'); });
/* dead dictionary key (trailing space: affix() can never produce it) */
editFile(P('assets/serres-i18n.js'), (src, api) => { api.re(/\n    "Film Colours ": "[^"\n]*",/, '', 'dead key "Film Colours "'); });
editFile(P('pages/prices.html'), (src, api) => { api.all('aria-label="Elige un servicio"', 'aria-label="Choose a service"', 1); });
editFile(P('pages/gallery.html'), (src, api) => { api.all('BMW Serie 1', 'BMW 1 Series', 1); });   // nav label, data-car (lightbox title), data-screen-label
addEntries(root, 'Miami port — copy fixes', [
  { en: 'SERRES services', es: 'Servicios SERRES' },
  { en: 'BMW 1 Series', es: 'BMW Serie 1' },
]);

/* vinyl FAQ: the "5 to 7 years outdoors" film-life figure is a Barcelona-climate claim (blog recon R5) — under Florida
   UV/heat the makers publish shorter ratings, so the sentence is rewritten without a number (EN key + ES value + JSON-LD twin) */
{
  const d = loadDict(root);
  const k = Object.keys(d).find(x => /last between 5 and 7 years outdoors/.test(x));
  if (k) renameEntries(root, pages(root), [{ en: k,
    newEn: k.replace('last between 5 and 7 years outdoors with normal care, and the manufacturer backs them with its official warranty.',
      'are rated by their makers for years of outdoor use with normal care, and the manufacturer backs them with its official warranty; under Florida\'s year-round sun and heat the real lifespan depends on the film and on its rating for high-UV zones.'),
    newEs: d[k].replace('duran entre 5 y 7 años en exterior con un mantenimiento normal, y el fabricante los respalda con su garantía oficial.',
      'están clasificados por el fabricante para años de uso en exterior con un mantenimiento normal, y el fabricante los respalda con su garantía oficial; con el sol y el calor de Florida todo el año, la duración real depende del film y de su clasificación para zonas de alto UV.') }]);
  console.log(k ? 'vinyl FAQ film-life claim softened for Florida' : 'vinyl FAQ film-life key not found (already changed?)');
}

/* ceramic meta description: find the key that carries the banned claim and rewrite it (EN + ES) */
const dict = loadDict(root);
const bad = Object.keys(dict).filter(k => /liquid[- ]glass/i.test(k));
if (bad.length) {
  renameEntries(root, pages(root), bad.map(k => ({
    en: k,
    newEn: 'Ceramic Coating in Miami: SiO₂ protection that seals the gloss, repels water and dirt and shields the paint from UV for years. Applied after correction, by appointment.',
    newEs: 'Ceramic Coating en Miami: protección SiO₂ que sella el brillo, repele agua y suciedad y protege la pintura de los UV durante años. Aplicado tras la corrección, con cita previa.',
  })));
  console.log(`ceramic description rewritten (${bad.length} legacy key(s) with the banned claim)`);
}
console.log('copy fixes applied');
