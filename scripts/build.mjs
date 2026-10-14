import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'src'), out = path.join(root, 'dist');
let origin = process.env.SITE_ORIGIN;
if (origin === undefined && existsSync(path.join(root, '.env'))) {
  const line = readFileSync(path.join(root, '.env'), 'utf8').match(/^SITE_ORIGIN=(.*)$/m);
  origin = line ? line[1].trim().replace(/^['"]|['"]$/g, '') : '';
}
origin = (origin || '').trim();
if (origin) {
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('SITE_ORIGIN must be an HTTPS origin without credentials, path, query or fragment.');
  }
  origin = url.origin;
}
if (!existsSync(path.join(source, 'assets/fonts/fonts.css'))) throw new Error('Bundled fonts are missing.');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(source, out, { recursive: true });
const pages = readdirSync(out).filter(name => name.endsWith('.html'));
for (const page of pages) {
  const file = path.join(out, page);
  let html = readFileSync(file, 'utf8');
  if (origin) {
    const url = origin + (page === 'index.html' ? '/' : '/' + page.replace(/\.html$/, ''));
    html = html.replace('</head>', `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${origin}/assets/hero-desktop.webp">\n<meta property="og:image:alt" content="Illustrative workforce for Sri Lankan employers">\n<meta name="twitter:card" content="summary_large_image">\n</head>`);
  }
  writeFileSync(file, html);
}
writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''));
if (origin) writeFileSync(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + pages.map(page => `  <url><loc>${origin}${page === 'index.html' ? '/' : '/' + page.replace(/\.html$/, '')}</loc></url>`).join('\n') + '\n</urlset>\n');
writeFileSync(path.join(out, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Victoria</title><link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/shared.css"><main class="w ph"><h1>Page not found</h1><p>The page may have moved.</p><a class="btn s" href="/">Return home</a></main></html>');
console.log(`Built ${pages.length} pages plus a 404 page with local assets. ${origin ? 'Canonical URLs and sitemap configured.' : 'Set SITE_ORIGIN before public launch for canonical/social URLs and sitemap.'}`);
