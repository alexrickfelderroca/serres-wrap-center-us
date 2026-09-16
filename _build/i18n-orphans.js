/* i18n-orphans.js — real-DOM orphan-string checker for the SERRES i18n layer.
   No dependencies: serves the site over a local HTTP server, drives headless Chrome through the
   DevTools protocol using Node's native WebSocket, and walks the live DOM with the SAME rules
   as assets/serres-i18n.js (text nodes except SCRIPT/STYLE/TEXTAREA, [data-i18n-skip] subtrees
   and data-en parents; aria-label/title attributes; document.title; meta description; affix()
   trimming + wrapping quotes).

   Usage:  node _build/i18n-orphans.js [--lang en|es|both] [--pages rel1,rel2] [--allow file] [--out dir] [--chrome path]
   EN mode: every visible core must be a dictionary KEY (or neutral: no letters / allow-listed) -> else ORPHAN
   ES mode: every visible core must be a dictionary VALUE (or neutral)                         -> else ORPHAN
            (a core that is still an English KEY with a non-empty Spanish value = UNTRANSLATED)
   Strings inside [data-i18n-skip] are listed separately (SKIPPED) for manual review.
   Exit code 1 when any ORPHAN/UNTRANSLATED is found.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DEFAULT = [
  'index.html',
  'pages/gallery.html', 'pages/prices.html', 'pages/projects.html', 'pages/why-serres.html',
  'services/body-kits.html', 'services/ceramic.html', 'services/detailing.html',
  'services/paint-correction.html', 'services/ppf.html', 'services/vinyl.html',
  'blog/index.html',
];
// blog articles are discovered from the folder so slug renames never break the checker
function discoverPages() {
  const blog = fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => 'blog/' + f).sort();
  return PAGES_DEFAULT.concat(blog);
}

/* ---------- args ---------- */
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; }
const LANG = opt('lang', 'both');
const PAGES = opt('pages', '') ? opt('pages', '').split(',') : discoverPages();
const ALLOW_FILE = opt('allow', path.join(__dirname, 'i18n-allowlist.txt'));
/* pages whose CONTENT is English-only by design (blog articles: body, TOC, hero, title/meta) — only their chrome must translate */
const EN_ONLY_FILE = path.join(__dirname, 'i18n-en-only.txt');
const EN_ONLY = fs.existsSync(EN_ONLY_FILE) ? fs.readFileSync(EN_ONLY_FILE, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')).map(g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$')) : [];
const isEnOnly = rel => EN_ONLY.some(re => re.test(rel));
const OUT = opt('out', path.join(__dirname, 'reports'));
const CHROME = opt('chrome', process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');

/* ---------- dictionary ---------- */
function loadDict() {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'serres-i18n.js'), 'utf8');
  const start = src.indexOf('var DICT = {'); const open = src.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') { depth--; if (depth === 0) break; } }
  const dict = new Function('return (' + src.slice(open, i + 1) + ')')();
  const es = {}; // trimmed spanish value -> key
  for (const k of Object.keys(dict)) {
    const raw = Array.isArray(dict[k]) ? dict[k][0] : dict[k];
    const v = (raw == null ? '' : String(raw)).replace(/^\s+|\s+$/g, '');
    if (v && !Object.prototype.hasOwnProperty.call(es, v)) es[v] = k;
  }
  return { dict, es };
}
const { dict, es: esIndex } = loadDict();
const allow = new Set(fs.existsSync(ALLOW_FILE) ? fs.readFileSync(ALLOW_FILE, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')) : []);
const hasLetters = s => /[A-Za-zÀ-ɏ]/.test(s);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const esValueOf = k => { const v = dict[k]; return (Array.isArray(v) ? v[0] : v) || ''; };

function classify(core, lang) {
  if (!hasLetters(core) || allow.has(core)) return 'NEUTRAL';
  if (lang === 'en') return Object.prototype.hasOwnProperty.call(dict, core) ? 'KEY' : 'ORPHAN';
  if (Object.prototype.hasOwnProperty.call(esIndex, core)) return 'ES';
  if (Object.prototype.hasOwnProperty.call(dict, core)) return esValueOf(core).trim() ? 'UNTRANSLATED' : 'ES';
  return 'ORPHAN';
}

/* ---------- static server ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let p = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

/* ---------- chrome + CDP ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'srs-i18n-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
  if (!fs.existsSync(portFile)) { proc.kill(); throw new Error('Chrome did not expose DevToolsActivePort'); }
  const port = parseInt(fs.readFileSync(portFile, 'utf8').split(/\r?\n/)[0], 10);
  const version = await new Promise((resolve, reject) => http.get('http://127.0.0.1:' + port + '/json/version', r => { let b = ''; r.on('data', d => b += d); r.on('end', () => resolve(JSON.parse(b))); }).on('error', reject));
  return { proc, profile, wsUrl: version.webSocketDebuggerUrl };
}
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } else if (m.method) this.listeners.forEach(l => l(m)); }); }
  static connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); ws.addEventListener('open', () => resolve(new CDP(ws))); ws.addEventListener('error', e => reject(new Error('ws error'))); }); }
  send(method, params, sessionId) { const id = ++this.id; const msg = { id, method, params: params || {} }; if (sessionId) msg.sessionId = sessionId; this.ws.send(JSON.stringify(msg)); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); }
  on(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; }
  close() { try { this.ws.close(); } catch (e) {} }
}

/* ---------- in-page walker (mirrors serres-i18n.js binding rules) ---------- */
const WALKER = `(function(){
  function affix(raw){var lead="",trail="",core=raw,m;
    if((m=core.match(/^\\s+/))){lead=m[0];core=core.slice(m[0].length);}
    if((m=core.match(/\\s+$/))){trail=m[0];core=core.slice(0,core.length-m[0].length);}
    if(core.length>1){var f=core.charAt(0),l=core.charAt(core.length-1);
      if((f==="\\u201C"||f==='"')&&(l==="\\u201D"||l==='"')){core=core.slice(1,core.length-1);}}
    return core;}
  function inSkip(node){var el=node.nodeType===1?node:node.parentNode;return !!(el&&el.closest&&el.closest("[data-i18n-skip]"));}
  function pathOf(el){var parts=[];var e=el;var n=0;while(e&&e.nodeType===1&&n<4){var s=e.nodeName.toLowerCase();if(e.id)s+="#"+e.id;else if(e.classList&&e.classList.length)s+="."+e.classList[0];parts.unshift(s);e=e.parentNode;n++;}return parts.join(">");}
  var out=[];
  var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);var n;
  while((n=tw.nextNode())){var raw=n.nodeValue;if(!raw||!raw.trim())continue;var p=n.parentNode;if(!p)continue;
    var tag=p.nodeName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA")continue;
    if(p.nodeType===1&&p.hasAttribute&&p.hasAttribute("data-en")){
      /* keyed element: in ES its text must equal the dictionary value of its key — report as a synthetic slot */
      if(localStorage.getItem("serres-lang")==="es"){var kc=affix(raw);if(kc)out.push({kind:"text",core:kc,path:pathOf(p)});}
      continue;}
    var core=affix(raw);if(!core)continue;
    out.push({kind:inSkip(n)?"skipped":"text",core:core,path:pathOf(p)});}
  var els=document.querySelectorAll("[aria-label],[title],[alt]");
  for(var i=0;i<els.length;i++){var el=els[i];if(inSkip(el))continue;
    ["aria-label","title","alt"].forEach(function(at){var raw=el.getAttribute(at);if(!raw||!raw.trim())return;var c=affix(raw);if(c)out.push({kind:"attr:"+at,core:c,path:pathOf(el)});});}
  /* data-en hatch: the attribute value must be a dictionary key (checked in EN mode); the visible text is checked in ES mode as usual */
  if(localStorage.getItem("serres-lang")==="en"){var kd=document.querySelectorAll("[data-en]");for(var q=0;q<kd.length;q++){if(inSkip(kd[q]))continue;var kv=affix(kd[q].getAttribute("data-en")||"");if(kv)out.push({kind:"attr:data-en",core:kv,path:pathOf(kd[q])});}}
  out.push({kind:"title",core:affix(document.title||""),path:"<title>"});
  var md=document.querySelector('meta[name="description"]');if(md)out.push({kind:"meta",core:affix(md.getAttribute("content")||""),path:"<meta description>"});
  /* OG / Twitter copies are static (never translated at runtime): they must be in the BASE language, so check them in EN mode only */
  if(localStorage.getItem("serres-lang")==="en"){["og:title","og:description","twitter:title","twitter:description"].forEach(function(id){
    var m=document.querySelector('meta[property="'+id+'"],meta[name="'+id+'"]');if(m)out.push({kind:"meta",core:affix(m.getAttribute("content")||""),path:"<meta "+id+">"});});}
  return {lang:document.documentElement.getAttribute("lang"),i18n:!!window.SERRES_I18N,slots:out};
})()`;

async function checkPage(cdp, base, rel, lang) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem("serres-lang",${JSON.stringify(lang)});}catch(e){}` }, sessionId);
  const loaded = new Promise(resolve => { const off = cdp.on(m => { if (m.method === 'Page.loadEventFired' && m.sessionId === sessionId) { off(); resolve(); } }); });
  await cdp.send('Page.navigate', { url: base + '/' + rel }, sessionId);
  await Promise.race([loaded, sleep(15000)]);
  // wait for the i18n layer (loaded dynamically by serres-enhance.js) to initialise
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.SERRES_I18N&&document.querySelector(".srs-lang"))', returnByValue: true }, sessionId);
    if (r.result.value) break; await sleep(100);
  }
  await sleep(400); // let langchange re-renders settle
  const r = await cdp.send('Runtime.evaluate', { expression: WALKER, returnByValue: true }, sessionId);
  await cdp.send('Target.closeTarget', { targetId });
  return r.result.value;
}

(async () => {
  const { srv, port } = await serve();
  const base = 'http://127.0.0.1:' + port;
  const chrome = await launchChrome();
  const cdp = await CDP.connect(chrome.wsUrl);
  fs.mkdirSync(OUT, { recursive: true });
  const langs = LANG === 'both' ? ['en', 'es'] : [LANG];
  let failures = 0;
  try {
    for (const lang of langs) {
      const table = {}; const problems = []; const skipped = [];
      for (const rel of PAGES) {
        const res = await checkPage(cdp, base, rel, lang);
        const c = { htmlLang: res.lang, i18n: res.i18n };
        const enOnly = isEnOnly(rel);
        for (const s of res.slots) {
          let cls;
          if (enOnly && (s.kind === 'title' || s.kind === 'meta')) { c.EN_ONLY_META = (c.EN_ONLY_META || 0) + 1; continue; }
          if (enOnly && s.kind === 'skipped') { c.SKIPPED = (c.SKIPPED || 0) + 1; skipped.push({ page: rel, core: s.core, path: s.path }); continue; }
          if (s.kind === 'skipped') {
            // [data-i18n-skip] zones are rendered by page JS through T(): detect language leaks there too
            cls = 'SKIPPED';
            if (!allow.has(s.core)) {
              if (lang === 'en' && has(esIndex, s.core) && esIndex[s.core] !== s.core) cls = 'ES-LEAK';          // Spanish snapshot left in the EN base
              if (lang === 'es' && has(dict, s.core) && esValueOf(s.core).trim() && esValueOf(s.core) !== s.core) cls = 'EN-LEAK'; // English key not translated by page JS
            }
          } else cls = classify(s.core, lang);
          c[cls] = (c[cls] || 0) + 1;
          if (cls === 'ORPHAN' || cls === 'UNTRANSLATED' || cls === 'ES-LEAK' || cls === 'EN-LEAK') problems.push({ page: rel, cls, kind: s.kind, core: s.core, path: s.path });
          if (cls === 'SKIPPED') skipped.push({ page: rel, core: s.core, path: s.path });
        }
        if (res.lang !== lang) problems.push({ page: rel, cls: 'HTML-LANG', kind: 'html', core: String(res.lang), path: '<html lang>' });
        table[rel] = c;
      }
      console.log('\n=== lang=' + lang + ' ===');
      console.table(table);
      const outFile = path.join(OUT, 'i18n-orphans-' + lang + '.json');
      fs.writeFileSync(outFile, JSON.stringify({ lang, problems, skipped }, null, 1));
      const distinct = {};
      problems.forEach(p => { const k = p.cls + '\t' + JSON.stringify(p.core); (distinct[k] = distinct[k] || []).push(p.page + ' ' + p.path); });
      const rows = Object.entries(distinct).sort((a, b) => b[1].length - a[1].length);
      console.log(`problems: ${problems.length} (${rows.length} distinct) | skipped strings: ${skipped.length} | report: ${outFile}`);
      rows.slice(0, 60).forEach(([k, v]) => console.log(`  ${v.length}\t${k}\t${v.slice(0, 3).join(' | ')}`));
      if (rows.length > 60) console.log(`  … ${rows.length - 60} more in the report`);
      failures += problems.length;
    }
  } finally {
    cdp.close(); chrome.proc.kill(); srv.close();
    setTimeout(() => { try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }, 500);
  }
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
