import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cubiciRoot = path.resolve(__dirname, '..');
const bundleRoot = path.join(cubiciRoot, 'dist-cloudflare');
const requiredFiles = [
  'index.html',
  'admin/index.html',
  '_redirects',
  '_headers',
  'resources/rudicks/img/icon/upload-n.svg',
  'resources/rudicks/img/admin/intro-bg.jpg',
  'resources/rudicks/img/logo.svg',
  'resources/img/icon/calendar.svg',
];

for (const relativePath of requiredFiles) {
  const fullPath = path.join(bundleRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`missing bundle file: ${relativePath}`);
  }
}

await smokeRoutes();
console.log('cloudflare static bundle smoke ok');

async function smokeRoutes() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    let filePath = path.join(bundleRoot, pathname);
    if (pathname === '/' || !fs.existsSync(filePath)) {
      filePath = pathname.startsWith('/admin/') ? path.join(bundleRoot, 'admin', 'index.html') : path.join(bundleRoot, 'index.html');
    }
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    response.writeHead(200, { 'content-type': contentType(filePath) });
    response.end(fs.readFileSync(filePath));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    for (const route of ['/', '/moneybank/request', '/admin', '/admin/moneybank/request', '/resources/rudicks/img/logo.svg']) {
      const status = await requestStatus(`http://127.0.0.1:${port}${route}`);
      if (status !== 200) {
        throw new Error(`smoke failed ${route}: ${status}`);
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function requestStatus(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error(`timeout: ${url}`));
    });
  });
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}
