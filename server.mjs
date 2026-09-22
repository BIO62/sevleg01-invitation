import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
const PEOPLE_FILE = path.join(__dirname, 'rsvp-data.json');

function readPeople() {
  try {
    return JSON.parse(fs.readFileSync(PEOPLE_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderPeoplePage(people) {
  const rows = people.slice().reverse().map((p) => `
    <tr>
      <td>${escapeHtml(p.submittedAt)}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.count)}</td>
      <td>${escapeHtml(p.message)}</td>
    </tr>`).join('');

  return `<!doctype html>
<html lang="mn"><head><meta charset="utf-8">
<title>Ирэх хүмүүсийн жагсаалт</title>
<style>
  body { font-family: sans-serif; padding: 24px; background: #f5f5f7; }
  h1 { font-size: 20px; }
  table { border-collapse: collapse; width: 100%; background: #fff; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 14px; }
  th { background: #1a237e; color: #fff; }
  tr:nth-child(even) { background: #fafafa; }
</style></head>
<body>
  <h1>Бүртгүүлсэн хүмүүс (${people.length})</h1>
  <table>
    <thead><tr><th>Огноо</th><th>Овог нэр</th><th>Утас</th><th>Хүний тоо</th><th>Сэтгэгдэл</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0].split('#')[0];

  if (req.method === 'POST' && urlPath === '/api/rsvp') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid body' }));
        return;
      }
      const people = readPeople();
      people.push({
        name: data.name || '',
        phone: data.phone || '',
        count: data.count || '',
        message: data.message || '',
        submittedAt: new Date().toISOString()
      });
      fs.writeFileSync(PEOPLE_FILE, JSON.stringify(people, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  if (req.method === 'GET' && urlPath === '/people') {
    const people = readPeople();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderPeoplePage(people));
    return;
  }

  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath === '/' || safePath === '\\' ? 'index.html' : safePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
