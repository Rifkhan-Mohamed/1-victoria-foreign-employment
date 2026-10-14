import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(dir + '/' + entry.name) : [dir + '/' + entry.name]);
const files = ['playwright.config.js', ...['src', 'scripts', 'tests'].flatMap(walk)].filter(file => /\.(?:js|mjs|cjs)$/.test(file));
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Syntax checked ${files.length} JavaScript files. This project has no TypeScript or separate linter.`);
