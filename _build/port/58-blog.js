/* 58-blog.js — Step 4 (blog): English slugs, Florida-focused articles, zero broken links.
   Content authored for the port lives in _build/port/content/blog/:
     <new-slug>.html (4 articles), index-cards.html (inner HTML of blog/index.html .post-grid), blog-meta.json
   This step:
     · removes the 4 Spanish articles, installs the English ones, renames assets/blog/<old>/ -> <new>/
     · resolves {{PRICE:key}} tokens from miami.json (left in place with a warning if prices are missing)
     · rewrites every reference to the old slugs (sitemap, verify-seo PAGES, optimize-images BLOG map, dictionary crumbs)
     · blog/index.html: cards, EN-only H1 via the data-en hatch, title/description keys (+ Spanish values)
   Runs BEFORE 60/65 so the Barcelona placeholders inside the new files (domain, GA4, tel, wa.me) get replaced like everywhere else.
   Usage: node 58-blog.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, addEntries, textFiles, js } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 58-blog.js <siteRoot>'); process.exit(2); }
const C = path.join(__dirname, 'content', 'blog');
const SLUGS = {
  'cuanto-cuesta-ppf-coche': 'how-much-does-ppf-cost',
  'cuanto-cuesta-vinilar-un-coche': 'how-much-does-a-car-wrap-cost',
  'ppf-o-ceramico-que-elegir': 'ppf-vs-ceramic-coating',
  'limpieza-tapiceria-coche-precio': 'car-upholstery-cleaning-cost',
};
const ready = Object.values(SLUGS).every(s => fs.existsSync(path.join(C, s + '.html'))) && fs.existsSync(path.join(C, 'index-cards.html')) && fs.existsSync(path.join(C, 'blog-meta.json'));
if (!ready) { console.log('SKIPPED — authored blog content not complete in _build/port/content/blog/'); process.exit(0); }
const meta = JSON.parse(fs.readFileSync(path.join(C, 'blog-meta.json'), 'utf8'));
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'miami.json'), 'utf8'));
const prices = cfg.prices || {};
const usd = n => '$' + Math.round(n).toLocaleString('en-US');
let unresolved = 0;
const resolve = s => s.replace(/\{\{PRICE:([a-z]+\.[a-z]+)\}\}/g, (m, k) => { const p = prices[k]; if (p && Number.isInteger(p.usd)) return usd(p.usd); unresolved++; return m; });

/* 1. articles */
for (const [oldSlug, slug] of Object.entries(SLUGS)) {
  const oldFile = path.join(root, 'blog', oldSlug + '.html');
  if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  const html = fs.readFileSync(path.join(C, slug + '.html'), 'utf8');
  fs.writeFileSync(path.join(root, 'blog', slug + '.html'), resolve(html).replace(/\r?\n/g, '\r\n'));
  const oldDir = path.join(root, 'assets', 'blog', oldSlug), newDir = path.join(root, 'assets', 'blog', slug);
  if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) fs.renameSync(oldDir, newDir);
}
console.log('blog: 4 English articles installed, asset folders renamed');

/* 2. every remaining reference to the old slugs (sitemap, tooling, dictionary, index) */
let refs = 0;
for (const f of textFiles(root).filter(f => !/[\\\/]_build[\\\/](port|reports)[\\\/]/.test(f))) {
  editFile(f, (src, api) => { for (const [o, n] of Object.entries(SLUGS)) refs += api.all(o, n); });
}
console.log(`blog: ${refs} slug references rewritten (sitemap, verify-seo PAGES, optimize-images, dictionary, index)`);

/* 3. blog/index.html — cards, H1 hatch, title/description */
const idx = path.join(root, 'blog', 'index.html');
editFile(idx, (src, api) => {
  const cards = resolve(fs.readFileSync(path.join(C, 'index-cards.html'), 'utf8')).replace(/\r\n/g, '\n').trim();
  api.re(/(<div class="post-grid" data-i18n-skip>)[\s\S]*?(\n  <\/div>\n<\/div>)/, `$1\n\n${cards}\n\n$2`, 'post-grid');
  api.re(/<!-- data-i18n-skip: «Blog».*\n/, '<!-- "The" is context-dependent in Spanish ("El Blog"): keyed explicitly through the data-en hatch -->\n', 'h1 comment');
  api.once('<h1 class="display" data-i18n-skip>El <span class="chrome-text">Blog</span></h1>', '<h1 class="display"><span data-en="The (blog)">The</span> <span class="chrome-text">Blog</span></h1>', 'blog h1');
  api.re(/<title>[^<]*<\/title>/, '<title>' + meta.index.title + '</title>', 'title');
  api.re(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + meta.index.description.replace(/"/g, '&quot;') + '">', 'description');
  api.re(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + meta.index.title.replace(/"/g, '&quot;') + '">', 'og:title');
  api.re(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + meta.index.description.replace(/"/g, '&quot;') + '">', 'og:description');
  api.re(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + meta.index.title.replace(/"/g, '&quot;') + '">', 'twitter:title');
  api.re(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + meta.index.description.replace(/"/g, '&quot;') + '">', 'twitter:description');
  let s = api.get();
  s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
    let o; try { o = JSON.parse(body); } catch (e) { return m; }
    if (o.inLanguage) o.inLanguage = 'en-US';
    if (o['@type'] === 'Blog' || o['@type'] === 'CollectionPage' || o['@type'] === 'WebPage') { if (o.name) o.name = meta.index.title.replace(/ \| SERRES$/, ''); if (o.description) o.description = meta.index.description; }
    return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c;
  });
  api.set(s);
});
const entries = [
  { en: 'The (blog)', es: 'El' },
  { en: meta.index.title, es: meta.index.titleEs },
  { en: meta.index.description, es: meta.index.descriptionEs },
];
for (const [slug, m] of Object.entries(meta.articles || {})) if (m.crumb && m.crumbEs) entries.push({ en: m.crumb, es: m.crumbEs });
addEntries(root, 'Miami port — blog index + article crumbs', entries);
console.log(`blog/index.html: cards, H1 hatch, title/description; ${entries.length} dictionary entries ensured`);
if (unresolved) console.log(`WARNING: ${unresolved} {{PRICE:…}} tokens left unresolved (USD prices missing in miami.json)`);
