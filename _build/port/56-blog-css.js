/* 56-blog-css.js — one-rule fix for a pre-existing mobile defect inherited from the Barcelona blog CSS.
   assets/blog.css lays the article out as a grid: desktop "280px minmax(0,1fr)", but the ≤980px rule collapses it to "1fr",
   whose implicit minimum is the content's min-content — and .prose table carries min-width:520px — so every article page
   is 520–590px wide on a 390px phone (horizontal scroll on the source site too). "minmax(0,1fr)" lets the column shrink;
   the tables then scroll inside their existing .table-scroll wrapper (overflow-x:auto), exactly as the CSS intended.
   Usage: node 56-blog-css.js <siteRoot>
*/
'use strict';
const path = require('path');
const { editFile } = require('./lib');

const root = process.argv[2];
if (!root) { console.error('usage: node 56-blog-css.js <siteRoot>'); process.exit(2); }
editFile(path.join(root, 'assets', 'blog.css'), (src, api) => {
  api.once('  .post-layout{grid-template-columns:1fr;gap:34px}', '  .post-layout{grid-template-columns:minmax(0,1fr);gap:34px} /* minmax: the 520px-min table must scroll inside .table-scroll, not widen the page */', 'mobile post-layout rule');
});
console.log('blog.css: mobile grid column -> minmax(0,1fr) (no horizontal scroll at 390px)');
