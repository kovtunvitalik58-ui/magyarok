// Мінімальний статичний сервер для Railway. Без залежностей.
// Ключове: .js має віддаватися як text/javascript, інакше ES-модулі не завантажаться.

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

function stream(res, file) {
  const ext = path.extname(file).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    // index.html не кешуємо, щоб оновлення доїжджали одразу;
    // решту — коротко, аби Telegram-webview не тримав старі модулі
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  };
  res.writeHead(200, headers);
  fs.createReadStream(file)
    .on('error', () => { res.destroy(); })
    .pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return send(res, 400, 'Bad request'); }

  if (pathname === '/health') return send(res, 200, 'ok');
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  const safe = path.normalize(pathname).replace(/^([\\/]|\.\.)+/, '');
  const file = path.resolve(ROOT, safe);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden');

  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) return stream(res, file);
    // Фолбек на index.html лише для «маршрутів» без розширення —
    // інакше зниклий .js мовчки віддавав би HTML і ламав імпорт незрозумілою помилкою
    if (!path.extname(safe)) return stream(res, path.join(ROOT, 'index.html'));
    send(res, 404, 'Not found');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`magyarok: слухаю порт ${PORT}`);
});
