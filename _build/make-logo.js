/* make-logo.js — turn the official SERRES wordmark into a web-ready asset.
 *
 * The file the client supplied is white ink on an OPAQUE black canvas with a
 * lot of empty margin (1536x1024, no alpha). Dropped straight into the header
 * it would paint a black rectangle over the nav, so this script:
 *
 *   1. trims the black canvas down to the ink,
 *   2. rebuilds the image as white ink with an alpha channel taken from the
 *      source luminance (so the edges stay antialiased instead of going
 *      jagged from a hard threshold),
 *   3. writes assets/serres-logo.png at a retina-safe width.
 *
 * The alpha doubles as a CSS mask, so the same file can later be tinted with
 * the site's chrome gradient without exporting a second asset.
 *
 *   node _build/make-logo.js
 */
const path = require('path');
const fs = require('fs');

// sharp lives in the sibling Next.js app (this repo's _build deps are not installed here)
const sharp = require('C:/Users/Rickfelder/Desktop/serres wrap center app/node_modules/sharp');

const REPO = path.resolve(__dirname, '..');
const SRC = path.join(REPO, 'assets', 'brand', 'serres-logo-original.png');
const OUT = path.join(REPO, 'assets', 'serres-logo.png');
const OUT_W = 600; // header renders ~118px, footer ~95px -> 600px covers 3x retina with room

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log(`source: ${meta.width}x${meta.height} ${meta.format} alpha=${!!meta.hasAlpha}`);

  // 1. Trim the black surround. Work from a greyscale copy so the trim keys on
  //    ink vs background rather than on any colour noise.
  const trimmed = await sharp(SRC)
    .greyscale()
    .trim({ background: '#000000', threshold: 12 })
    .toBuffer({ resolveWithObject: true });

  const { width: tw, height: th } = trimmed.info;
  console.log(`trimmed to ink: ${tw}x${th}  (aspect ${(tw / th).toFixed(4)})`);

  // 2. Resize the greyscale ink mask to the output width. This greyscale IS the
  //    alpha: white ink -> 255 (opaque), black canvas -> 0 (transparent).
  // .raw() matters: joinChannel needs raw samples, not a re-encoded PNG.
  const alpha = await sharp(trimmed.data)
    .resize({ width: OUT_W, fit: 'inside', kernel: 'lanczos3' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: aw, height: ah } = alpha.info;

  // 3. Solid white canvas + that alpha = white wordmark on transparency.
  await sharp({
    create: { width: aw, height: ah, channels: 3, background: '#ffffff' },
  })
    .joinChannel(alpha.data, { raw: { width: aw, height: ah, channels: 1 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUT);

  const outMeta = await sharp(OUT).metadata();
  const bytes = fs.statSync(OUT).size;
  console.log(
    `wrote ${path.relative(REPO, OUT)}: ${outMeta.width}x${outMeta.height} ` +
    `alpha=${!!outMeta.hasAlpha} ${(bytes / 1024).toFixed(1)} KB`
  );
  console.log(`CSS aspect-ratio: ${outMeta.width} / ${outMeta.height}`);
})().catch(e => { console.error(e); process.exit(1); });
