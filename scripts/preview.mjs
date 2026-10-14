import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 8080);
const headers = Object.fromEntries(readFileSync(path.join(root, '_headers'), 'utf8').split('\n').filter(line => /^  [\w-]+:/.test(line)).map(line => {
  const split = line.indexOf(':'); return [line.slice(0, split).trim(), line.slice(split + 1).trim()];
}));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    let part = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (part.endsWith('/')) part += 'index.html';
    if (part.split('/').some(segment => segment.startsWith('.') || segment.startsWith('_'))) throw new Error('private path');
    let file = path.resolve(root, '.' + part);
    if (!file.startsWith(root + path.sep)) throw new Error('invalid path');
    try { await stat(file); } catch (error) { if (!path.extname(file)) file += '.html'; else throw error; }
    const data = await readFile(file);
    res.writeHead(200, { ...headers, 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    const page = await readFile(path.join(root, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : page);
  }
});
server.listen(port, '127.0.0.1', () => console.log('Preview listening on port ' + port));
