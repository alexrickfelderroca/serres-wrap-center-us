/* swap-logo.js — replace the Barlow Condensed text wordmark with the official
 * SERRES mark across every page.
 *
 * Three places carry the logo:
 *   1. the nav on all 16 pages            (<a class="logo chrome-text">SERRES</a>)
 *   2. the footer on index.html           (<div class="logo chrome-text">SERRES</div>)
 *   3. the mobile menu overlay, injected at runtime by serres-enhance.js
 *
 * Edits are done as exact string replacements so the files keep their CRLF
 * line endings and nothing else in them shifts.
 *
 *   node _build/swap-logo.js
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const IMG = '<img src="/assets/serres-logo.png" alt="SERRES" width="600" height="55">';
const CSS_LINK = '<link rel="stylesheet" href="/assets/serres-logo.css">';

const HTML = [
  'index.html',
  'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html',
  'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html',
  'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html',
  'blog/index.html', 'blog/cuanto-cuesta-ppf-coche.html', 'blog/cuanto-cuesta-vinilar-un-coche.html',
  'blog/limpieza-tapiceria-coche-precio.html', 'blog/ppf-o-ceramico-que-elegir.html',
];

let logoSwaps = 0, linkAdds = 0;
const report = [];

for (const rel of HTML) {
  const p = path.join(REPO, rel);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;
  let n = 0;

  // 1 + 2. the wordmark itself
  const patterns = [
    ['<a href="../index.html" class="logo chrome-text">SERRES</a>',
     '<a href="../index.html" class="logo">' + IMG + '</a>'],
    ['<a href="#top" class="logo chrome-text">SERRES</a>',
     '<a href="#top" class="logo">' + IMG + '</a>'],
    ['<div class="logo chrome-text">SERRES</div>',
     '<div class="logo">' + IMG + '</div>'],
  ];
  for (const [from, to] of patterns) {
    while (src.includes(from)) { src = src.replace(from, to); n++; }
  }

  // 3. stylesheet, injected last in <head> so it beats the per-page inline .logo rules
  if (!src.includes(CSS_LINK)) {
    const close = src.lastIndexOf('</head>');
    if (close < 0) throw new Error('no </head> in ' + rel);
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    src = src.slice(0, close) + CSS_LINK + eol + src.slice(close);
    linkAdds++;
  }

  if (src !== before) fs.writeFileSync(p, src);
  logoSwaps += n;
  report.push(rel.padEnd(42) + ' logo x' + n);
}

// --- mobile menu overlay inside serres-enhance.js -------------------------
const jsPath = path.join(REPO, 'assets/serres-enhance.js');
let js = fs.readFileSync(jsPath, 'utf8');

const oldCss =
  "  + '.srs-menu-logo{font-family:\"Barlow Condensed\",\"Bahnschrift\",\"Arial Narrow\",sans-serif;font-style:italic;font-weight:700;'\n" +
  "  +   'font-size:26px;letter-spacing:.16em;text-transform:uppercase;padding:0 .28em 0 .04em}'";
const newCss =
  "  + '.srs-menu-logo{display:inline-flex;align-items:center;padding:0;font-size:0;line-height:0}'\n" +
  "  + '.srs-menu-logo img{display:block;width:150px;height:auto;aspect-ratio:600/55}'";

// tolerate CRLF in the source
const oldCssCRLF = oldCss.replace(/\n/g, '\r\n');
const newCssCRLF = newCss.replace(/\n/g, '\r\n');

let jsCssDone = false;
if (js.includes(oldCssCRLF)) { js = js.replace(oldCssCRLF, newCssCRLF); jsCssDone = true; }
else if (js.includes(oldCss)) { js = js.replace(oldCss, newCss); jsCssDone = true; }

const oldMarkup = "'<span class=\"srs-menu-logo chrome-text\">SERRES</span>' +";
const newMarkup = "'<span class=\"srs-menu-logo\">" + IMG + "</span>' +";
let jsMarkupDone = false;
if (js.includes(oldMarkup)) { js = js.replace(oldMarkup, newMarkup); jsMarkupDone = true; }

fs.writeFileSync(jsPath, js);

console.log(report.join('\n'));
console.log('\nnav/footer wordmarks replaced :', logoSwaps);
console.log('stylesheet links added        :', linkAdds);
console.log('mobile-menu CSS rewritten     :', jsCssDone);
console.log('mobile-menu markup rewritten  :', jsMarkupDone);
if (!jsCssDone || !jsMarkupDone) { console.error('\nMOBILE MENU NOT FULLY PATCHED'); process.exit(1); }
