/* temp: build a full-chrome preview of ppf-delray-beach for screenshot verification */
const fs = require('fs');
const T = '_build/.dlb-tmp/';
const F = 'ppf-delray-beach/index.html';
let s = fs.readFileSync(F, 'utf8');
for (const r of ['header', 'trustbar', 'terms', 'ctaband', 'footer']) {
  const body = fs.readFileSync(T + 'reg-' + r + '.html', 'utf8').replace(/\s+$/, '');
  const open = '<!-- REGION:' + r + ' -->';
  const close = '<!-- /REGION:' + r + ' -->';
  const i = s.indexOf(open), j = s.indexOf(close);
  if (i < 0 || j < 0) { console.log('no region', r); continue; }
  s = s.slice(0, i) + open + '\n' + body + '\n' + s.slice(j);
}
console.log('chrome injected');
fs.writeFileSync(F, s);
