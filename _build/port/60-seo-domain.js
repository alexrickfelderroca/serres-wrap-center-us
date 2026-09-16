/* 60-seo-domain.js — Step 4: domain, GA4 property, sitemap, robots, hosting file.
   Reads _build/port/miami.json -> domain, ga4, hosting.
     · every https://serreswrapcenter.es URL (canonical, OG, Twitter, JSON-LD, sitemap, robots, preloads) -> new domain
     · G-1K6FYZ99GN -> new GA4 id (pages + _build/verify-seo.js)
     · sitemap.xml <lastmod> -> today
     · hosting: github-pages -> remove .htaccess (Apache-only) and add .nojekyll; hostinger -> keep .htaccess
   Runs BEFORE 65-nap-schema.js so the parent-site link (serreswrapcenter.es in sameAs/parentOrganization) survives.
   Usage: node 60-seo-domain.js <siteRoot>
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { editFile, textFiles } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 60-seo-domain.js <siteRoot>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'miami.json'), 'utf8'));
const skipped = [];
const files = textFiles(root).filter(f => !/[\\\/]_build[\\\/]port[\\\/]/.test(f) && !/[\\\/]_build[\\\/]reports[\\\/]/.test(f));

/* 1. domain */
if (cfg.domain) {
  const dom = cfg.domain.replace(/\/+$/, '');
  const host = dom.replace(/^https?:\/\//, '');
  let n = 0;
  for (const f of files) editFile(f, (src, api) => { n += api.all('https://serreswrapcenter.es', dom); n += api.all('serreswrapcenter.es', host); });
  console.log(`domain: ${n} occurrences -> ${dom}`);
} else skipped.push('domain');

/* 2. GA4 */
if (cfg.ga4) {
  if (cfg.ga4 === 'G-1K6FYZ99GN') { console.error('GA4: refusing to reuse the Barcelona property G-1K6FYZ99GN'); process.exit(1); }
  let n = 0;
  for (const f of files) editFile(f, (src, api) => { n += api.all('G-1K6FYZ99GN', cfg.ga4); });
  console.log(`GA4: ${n} occurrences -> ${cfg.ga4}`);
} else skipped.push('ga4');

/* 3. sitemap lastmod = today (run date) */
const today = new Date().toISOString().slice(0, 10);
editFile(path.join(root, 'sitemap.xml'), (src, api) => { api.set(src.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>' + today + '</lastmod>')); });
console.log('sitemap: lastmod ->', today);

/* 4. hosting */
if (cfg.hosting === 'github-pages') {
  const ht = path.join(root, '.htaccess'); if (fs.existsSync(ht)) fs.unlinkSync(ht);
  fs.writeFileSync(path.join(root, '.nojekyll'), '');
  console.log('hosting: GitHub Pages — .htaccess removed, .nojekyll added');
} else if (cfg.hosting === 'hostinger') {
  console.log('hosting: Hostinger — .htaccess kept (Apache cache policy + font MIME types)');
} else skipped.push('hosting');

if (skipped.length) console.log('SKIPPED (not in miami.json yet): ' + skipped.join(', '));
