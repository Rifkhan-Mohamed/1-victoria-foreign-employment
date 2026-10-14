import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const build = origin => spawnSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_ORIGIN: origin }, encoding: 'utf8' });
test('origin metadata, sitemap, local fonts and host headers', () => {
  const result = build('https://victoria.example'); assert.equal(result.status, 0, result.stderr);
  const home = readFileSync('dist/index.html', 'utf8');
  assert.ok(home.includes('rel="canonical" href="https://victoria.example/"'));
  assert.ok(readFileSync('dist/hire.html', 'utf8').includes('https://victoria.example/hire'));
  assert.ok(readFileSync('dist/sitemap.xml', 'utf8').includes('<loc>https://victoria.example/industries</loc>'));
  assert.ok(readFileSync('dist/robots.txt', 'utf8').includes('Sitemap: https://victoria.example/sitemap.xml'));
  assert.ok(readFileSync('dist/_headers', 'utf8').includes("connect-src 'none'"));
  assert.ok(!/chatgpt\.site|fonts\.googleapis/.test(home));
});
test('unsafe origins fail before output is changed', () => {
  const before = readFileSync('dist/index.html', 'utf8');
  for (const origin of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com/?q=x', 'http://example.com', 'https://example.com/#x']) assert.notEqual(build(origin).status, 0, origin);
  assert.equal(readFileSync('dist/index.html', 'utf8'), before);
});
test('origin-free output removes stale sitemap; repeated builds are identical', () => {
  assert.equal(build('').status, 0);
  assert.equal(existsSync('dist/sitemap.xml'), false);
  assert.ok(!readFileSync('dist/index.html', 'utf8').includes('rel="canonical"'));
  const files = readdirSync('dist').filter(f => /\.(html|txt)$/.test(f));
  const before = files.map(file => readFileSync('dist/' + file, 'utf8'));
  assert.equal(build('').status, 0);
  assert.deepEqual(files.map(file => readFileSync('dist/' + file, 'utf8')), before);
});
