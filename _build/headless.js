/* headless.js — zero-dependency helpers shared by the _build verification tools:
   a static file server for the site, headless Chrome launched with the DevTools protocol,
   and a tiny CDP client on Node's native WebSocket (Node ≥ 22).
*/
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
function serve(root) {
  root = path.resolve(root);   // callers may pass a relative root; the guard below needs it absolute
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let p = path.join(root, u.endsWith('/') ? u + 'index.html' : u);
      if (!p.startsWith(path.resolve(root)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: 'http://127.0.0.1:' + srv.address().port, close: () => srv.close() }));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function launchChrome(chromePath) {
  const CHROME = chromePath || process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'srs-headless-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--disable-extensions', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
  if (!fs.existsSync(portFile)) { proc.kill(); throw new Error('Chrome did not expose DevToolsActivePort (' + CHROME + ')'); }
  const port = parseInt(fs.readFileSync(portFile, 'utf8').split(/\r?\n/)[0], 10);
  const version = await new Promise((resolve, reject) => http.get('http://127.0.0.1:' + port + '/json/version', r => { let b = ''; r.on('data', d => b += d); r.on('end', () => resolve(JSON.parse(b))); }).on('error', reject));
  const cdp = await CDP.connect(version.webSocketDebuggerUrl);
  return { proc, profile, cdp, close() { cdp.close(); try { proc.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} }, 500); } };
}
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } else if (m.method) this.listeners.forEach(l => l(m)); }); }
  static connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); ws.addEventListener('open', () => resolve(new CDP(ws))); ws.addEventListener('error', () => reject(new Error('ws error'))); }); }
  send(method, params, sessionId) { const id = ++this.id; const msg = { id, method, params: params || {} }; if (sessionId) msg.sessionId = sessionId; this.ws.send(JSON.stringify(msg)); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); }
  on(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; }
  close() { try { this.ws.close(); } catch (e) {} }
}
/* Open a page in its own target; returns helpers bound to that session. opts: {lang, width, height, mobile, reducedMotion, init} */
async function openPage(chrome, url, opts = {}) {
  const cdp = chrome.cdp;
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (m, p) => cdp.send(m, p, sessionId);
  await send('Page.enable'); await send('Runtime.enable');
  if (opts.width) await send('Emulation.setDeviceMetricsOverride', { width: opts.width, height: opts.height || 900, deviceScaleFactor: opts.scale || 1, mobile: !!opts.mobile });
  if (opts.reducedMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const init = [];
  if (opts.lang) init.push(`try{localStorage.setItem("serres-lang",${JSON.stringify(opts.lang)});}catch(e){}`);
  if (opts.init) init.push(opts.init);
  if (init.length) await send('Page.addScriptToEvaluateOnNewDocument', { source: init.join('\n') });
  const loaded = new Promise(resolve => { const off = cdp.on(m => { if (m.method === 'Page.loadEventFired' && m.sessionId === sessionId) { off(); resolve(); } }); });
  await send('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]);
  const evaluate = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('evaluate: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  const waitFor = async (expression, timeout = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await evaluate(expression)) return true; await sleep(100); } return false; };
  const screenshot = async (file, fullPage) => {
    let clip;
    if (fullPage) { const dims = await evaluate('({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight})'); await send('Emulation.setDeviceMetricsOverride', { width: opts.width || 1440, height: dims.h, deviceScaleFactor: opts.scale || 1, mobile: !!opts.mobile }); clip = { x: 0, y: 0, width: opts.width || 1440, height: dims.h, scale: 1 }; }
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!fullPage, clip });
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); return file;
  };
  const close = () => cdp.send('Target.closeTarget', { targetId });
  return { send, evaluate, waitFor, screenshot, close, sessionId };
}
/* wait until the i18n layer mounted its switcher (serres-enhance.js loads serres-i18n.js dynamically) */
const I18N_READY = '!!(window.SERRES_I18N&&document.querySelector(".srs-lang"))';

module.exports = { serve, launchChrome, openPage, sleep, I18N_READY };
