import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle = path.join(root, 'dist-cloudflare');
const base = new URL(process.argv[2] || 'https://cubici.co.kr');
assert.equal(base.protocol, 'https:');
assert.ok(base.hostname === 'cubici.co.kr' || base.hostname.endsWith('.cubici.pages.dev'));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
let count = 0;
async function check(route, relative) {
  const response = await fetch(new URL(route, base), {
    headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, `HTTP ${route}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(digest(bytes), digest(fs.readFileSync(path.join(bundle, relative))), `content ${route}`);
  count++;
}
for (const route of ['/', '/moneybank/current', '/moneybank/request']) await check(route, 'index.html');
for (const route of ['/admin/', '/admin/moneybank/request', '/admin/settlement', '/admin/logout']) {
  await check(route, 'admin/index.html');
}
const assets = new Set();
for (const htmlPath of ['index.html', 'admin/index.html']) {
  const html = fs.readFileSync(path.join(bundle, htmlPath), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:js|css))"/g)) assets.add(match[1]);
}
for (const asset of assets) {
  await check(asset, asset.slice(1));
  if (!asset.endsWith('.css')) continue;
  const css = fs.readFileSync(path.join(bundle, asset.slice(1)), 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?(\/[^)"'?#]+)["']?\s*\)/g)) {
    assert.ok(fs.existsSync(path.join(bundle, match[1].slice(1))), `CSS asset ${match[1]}`);
  }
}
for (const route of ['/resources/rudicks/img/logo.svg', '/resources/rudicks/img/admin/intro-bg.jpg']) {
  await check(route, route.slice(1));
}
console.log(JSON.stringify({ base: base.origin, checks: count, remote_content_hashes: 'matched', css_assets: 'present' }));
