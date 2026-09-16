/* serve.js — minimal static server for previewing the site locally (root-relative /assets paths need http, not file://).
   Usage: node _build/serve.js [--root <dir>] [--port 8787]
*/
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(opt('root', path.join(__dirname, '..')));
const PORT = parseInt(opt('port', '8787'), 10);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let p = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404 ' + u); return; }
  if (fs.statSync(p).isDirectory()) { res.writeHead(301, { Location: u + '/' }); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} at http://localhost:${PORT}/`));
