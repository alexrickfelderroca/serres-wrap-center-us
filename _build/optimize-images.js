/* =====================================================================
   SERRES — image optimization pipeline (SEO package, 2026-07)
   1. Converts every heavy referenced image (>200 KB) to WebP <=200 KB,
      max 1600 px wide, written next to the original (same basename).
   2. Generates 1200x630 OG JPEGs (<=300 KB) into assets/og/.
   3. Generates blog cover.webp (1600x900) + og.jpg per article slug.
   Outputs _build/webp-manifest.json with dimensions for width/height attrs.
   Run from the project root:  node _build/optimize-images.js
   ===================================================================== */
const sharp = require('./node_modules/sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIMIT_WEBP = 200 * 1024;
const LIMIT_OG = 300 * 1024;

const CONVERT = [
  'assets/svc/bodykit.png',
  'assets/vinyl/wrap-texture.png',
  'assets/vinyl/xm-after.jpg',
  'assets/vinyl/xm-before.jpg',
  'assets/bodykit/after.jpg',
  'assets/bodykit/before.jpg',
  'assets/ceramic/after.jpg',
  'assets/ceramic/before.jpg',
  'assets/ppf/after.jpg',
  'assets/ppf/before.jpg',
  'assets/correction/after.jpg',
  'assets/correction/before.jpg',
  'assets/detailing/ext-after.jpg',
  'assets/detailing/ext-before.jpg',
  'assets/detailing/int-after.jpg',
  'assets/detailing/int-before.jpg',
  'assets/gallery/xm-front.jpg',
  'assets/gallery/xm-grille.jpg',
  'assets/gallery/xm-rear.jpg',
  'assets/gallery/supra-villa.jpg',
  'assets/gallery/supra-rear.jpg',
  'assets/gallery/ligier-front.jpg',
  'assets/gallery/ligier-rear.jpg',
  'assets/gallery/serie1-front.jpg',
  'assets/gallery/rwb-snow.jpg',
  'assets/gallery/rwb-side.jpg',
  'assets/gallery/rwb-top.jpg',
  'assets/gallery/m2-rooftop.jpg',
  'assets/gallery/m2-front.jpg',
  'assets/gallery/e92-coast.jpg',
];

const OG = {
  'assets/og/home.jpg': 'assets/serres-poster.jpg',
  'assets/og/ppf.jpg': 'assets/ppf/after.jpg',
  'assets/og/vinyl.jpg': 'assets/vinyl/xm-after.jpg',
  'assets/og/ceramic.jpg': 'assets/ceramic/after.jpg',
  'assets/og/detailing.jpg': 'assets/detailing/int-after.jpg',
  'assets/og/paint-correction.jpg': 'assets/correction/after.jpg',
  'assets/og/body-kits.jpg': 'assets/bodykit/after.jpg',
  'assets/og/gallery.jpg': 'assets/gallery/rwb-front.jpg',
  'assets/og/projects.jpg': 'assets/gallery/rwb-profile.jpg',
  'assets/og/prices.jpg': 'assets/gallery/m2-front.jpg',
  'assets/og/why-serres.jpg': 'assets/gallery/landrover-studio.jpg',
};

const BLOG = {
  'cuanto-cuesta-vinilar-un-coche': 'assets/vinyl/xm-after.jpg',
  'ppf-o-ceramico-que-elegir': 'assets/ceramic/after.jpg',
  'cuanto-cuesta-ppf-coche': 'assets/ppf/after.jpg',
  'limpieza-tapiceria-coche-precio': 'assets/detailing/int-after.jpg',
};

async function toWebp(srcRel) {
  const src = path.join(ROOT, srcRel);
  const outRel = srcRel.replace(/\.(jpe?g|png)$/i, '.webp');
  const out = path.join(ROOT, outRel);
  const meta = await sharp(src).metadata();
  let width = Math.min(meta.width, 1600);
  let buf;
  for (;;) {
    for (let q = 80; q >= 45; q -= 7) {
      buf = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
      if (buf.length <= LIMIT_WEBP) { q = -1; break; }
    }
    if (buf.length <= LIMIT_WEBP || width <= 1000) break;
    width -= 200;
  }
  fs.writeFileSync(out, buf);
  const m2 = await sharp(out).metadata();
  return { src: srcRel, out: outRel.replace(/\\/g, '/'), width: m2.width, height: m2.height, kb: Math.round(buf.length / 1024) };
}

async function toOg(outRel, srcRel) {
  const out = path.join(ROOT, outRel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let buf;
  for (let q = 82; q >= 50; q -= 6) {
    buf = await sharp(path.join(ROOT, srcRel)).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= LIMIT_OG) break;
  }
  fs.writeFileSync(out, buf);
  return { out: outRel, kb: Math.round(buf.length / 1024) };
}

async function blogAssets(slug, srcRel) {
  const dir = path.join(ROOT, 'assets', 'blog', slug);
  fs.mkdirSync(dir, { recursive: true });
  let buf;
  for (let q = 80; q >= 45; q -= 7) {
    buf = await sharp(path.join(ROOT, srcRel)).resize(1600, 900, { fit: 'cover', position: 'attention' }).webp({ quality: q }).toBuffer();
    if (buf.length <= LIMIT_WEBP) break;
  }
  fs.writeFileSync(path.join(dir, 'cover.webp'), buf);
  const og = await toOg(`assets/blog/${slug}/og.jpg`, srcRel);
  return { slug, cover: `assets/blog/${slug}/cover.webp`, coverKb: Math.round(buf.length / 1024), og: og.out, ogKb: og.kb };
}

(async () => {
  const manifest = { webp: [], og: [], blog: [] };
  for (const f of CONVERT) {
    try { manifest.webp.push(await toWebp(f)); console.log('webp', f); }
    catch (e) { console.error('FAIL webp', f, e.message); }
  }
  for (const [out, src] of Object.entries(OG)) {
    try { manifest.og.push(await toOg(out, src)); console.log('og', out); }
    catch (e) { console.error('FAIL og', out, e.message); }
  }
  for (const [slug, src] of Object.entries(BLOG)) {
    try { manifest.blog.push(await blogAssets(slug, src)); console.log('blog', slug); }
    catch (e) { console.error('FAIL blog', slug, e.message); }
  }
  fs.writeFileSync(path.join(__dirname, 'webp-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('manifest written:', manifest.webp.length, 'webp,', manifest.og.length, 'og,', manifest.blog.length, 'blog');
})();
