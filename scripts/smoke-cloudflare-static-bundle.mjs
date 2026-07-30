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
  'admin-spa.html',
  '_redirects',
  '_routes.json',
  '_worker.js',
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

const redirectsPath = path.join(bundleRoot, '_redirects');
const redirectRules = fs.readFileSync(redirectsPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/));

assertRedirectRule('/assets/*', '/assets/:splat', '200');
assertRedirectRule('/admin/assets/*', '/admin/assets/:splat', '200');
assertRedirectRule('/resources/*', '/resources/:splat', '200');
assertRedirectRule('/*', '/index.html', '200');
assertRuleOrder('/assets/*', '/*');
assertRuleOrder('/admin/assets/*', '/*');
assertRuleOrder('/resources/*', '/*');
assertRoutesJson();
assertWorkerFallback();
assertHtmlBundle('admin/index.html', {
  title: 'Cubici Admin',
  assetPrefix: '/admin/assets/',
});
assertHtmlBundle('admin-spa.html', {
  title: 'Cubici Admin',
  assetPrefix: '/admin/assets/',
});
assertHtmlBundle('index.html', {
  title: 'Cubici User Web',
  assetPrefix: '/assets/',
});
assertReferencedAssetsExist('admin/index.html');
assertReferencedAssetsExist('index.html');

await smokeRoutes();
console.log('cloudflare static bundle smoke ok');

async function smokeRoutes() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const routedPath = resolveCloudflarePagesPath(pathname);
    let filePath = path.join(bundleRoot, routedPath);
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    response.writeHead(200, { 'content-type': contentType(filePath) });
    response.end(fs.readFileSync(filePath));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const adminAssetRoute = firstBuiltAssetPath('admin/index.html');
    const userAssetRoute = firstBuiltAssetPath('index.html');
    const routeExpectations = [
      ['/', 'Cubici User Web'],
      ['/moneybank/current', 'Cubici User Web'],
      ['/moneybank/request', 'Cubici User Web'],
      ['/admin', 'Cubici Admin'],
      ['/admin/', 'Cubici Admin'],
      ['/admin/moneybank/request', 'Cubici Admin'],
      ['/admin/settlement', 'Cubici Admin'],
      [adminAssetRoute, null],
      [userAssetRoute, null],
      ['/resources/rudicks/img/logo.svg', null],
    ];
    for (const [route, expectedTitle] of routeExpectations) {
      const { status, body } = await requestBody(`http://127.0.0.1:${port}${route}`);
      if (status !== 200) {
        throw new Error(`smoke failed ${route}: ${status}`);
      }
      if (expectedTitle && !body.includes(`<title>${expectedTitle}</title>`)) {
        throw new Error(`smoke failed ${route}: expected ${expectedTitle} bundle`);
      }
      if (!expectedTitle && body.includes('<!doctype html>')) {
        throw new Error(`smoke failed ${route}: expected static asset, got HTML`);
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function requestBody(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body });
      });
    });
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error(`timeout: ${url}`));
    });
  });
}

function assertRedirectRule(source, destination, status) {
  if (!redirectRules.some(([ruleSource, ruleDestination, ruleStatus]) => (
    ruleSource === source
    && ruleDestination === destination
    && ruleStatus === status
  ))) {
    throw new Error(`missing redirect rule: ${source} ${destination} ${status}`);
  }
}

function assertRuleOrder(beforeSource, afterSource) {
  const beforeIndex = redirectRules.findIndex(([source]) => source === beforeSource);
  const afterIndex = redirectRules.findIndex(([source]) => source === afterSource);
  if (beforeIndex === -1 || afterIndex === -1 || beforeIndex > afterIndex) {
    throw new Error(`redirect order invalid: ${beforeSource} must be before ${afterSource}`);
  }
}

function assertRoutesJson() {
  const routes = JSON.parse(fs.readFileSync(path.join(bundleRoot, '_routes.json'), 'utf8'));
  if (routes.version !== 1) {
    throw new Error('_routes.json version must be 1');
  }
  for (const route of ['/*']) {
    if (!routes.include?.includes(route)) {
      throw new Error(`_routes.json missing include: ${route}`);
    }
  }
  for (const route of ['/assets/*', '/admin/assets/*', '/resources/*']) {
    if (!routes.exclude?.includes(route)) {
      throw new Error(`_routes.json missing exclude: ${route}`);
    }
  }
}

function assertWorkerFallback() {
  const worker = fs.readFileSync(path.join(bundleRoot, '_worker.js'), 'utf8');
  for (const expected of ['env.ASSETS.fetch', 'looksLikeFile', 'url.pathname === "/admin"', 'url.pathname.startsWith("/admin/")', '"/admin-spa.html"', '"/index.html"']) {
    if (!worker.includes(expected)) {
      throw new Error(`_worker.js missing routing marker: ${expected}`);
    }
  }
}

function assertHtmlBundle(relativePath, { title, assetPrefix }) {
  const html = fs.readFileSync(path.join(bundleRoot, relativePath), 'utf8');
  if (!html.includes(`<title>${title}</title>`)) {
    throw new Error(`${relativePath} is not ${title} bundle`);
  }
  if (!html.includes(assetPrefix)) {
    throw new Error(`${relativePath} does not reference ${assetPrefix} assets`);
  }
}

function assertReferencedAssetsExist(relativePath) {
  for (const assetPath of builtAssetPaths(relativePath)) {
    const fullPath = path.join(bundleRoot, assetPath.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      throw new Error(`${relativePath} references missing asset: ${assetPath}`);
    }
  }
}

function firstBuiltAssetPath(relativePath) {
  const [assetPath] = builtAssetPaths(relativePath);
  if (!assetPath) {
    throw new Error(`${relativePath} has no built asset references`);
  }
  return assetPath;
}

function builtAssetPaths(relativePath) {
  const html = fs.readFileSync(path.join(bundleRoot, relativePath), 'utf8');
  const assetPaths = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((assetPath) => assetPath.startsWith('/assets/') || assetPath.startsWith('/admin/assets/'));
  if (assetPaths.length === 0) {
    throw new Error(`${relativePath} has no built asset references`);
  }
  return assetPaths;
}

function resolveCloudflarePagesPath(pathname) {
  const staticCandidate = path.join(bundleRoot, pathname);
  if (pathname !== '/' && fs.existsSync(staticCandidate)) {
    return pathname.replace(/^\//, '');
  }
  const lastSegment = pathname.split('/').pop() ?? '';
  const looksLikeFile = lastSegment.includes('.');
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !looksLikeFile) {
    return 'admin-spa.html';
  }
  const redirectTarget = findRedirectTarget(pathname);
  if (redirectTarget) {
    return redirectTarget.replace(/^\//, '');
  }
  return pathname.startsWith('/admin/') || pathname === '/admin'
    ? 'admin/index.html'
    : 'index.html';
}

function findRedirectTarget(pathname) {
  for (const [source, destination, status] of redirectRules) {
    if (status !== '200') {
      continue;
    }
    if (source.endsWith('/*')) {
      const prefix = source.slice(0, -1);
      if (pathname.startsWith(prefix)) {
        return destination;
      }
    } else if (source === pathname) {
      return destination;
    }
  }
  return null;
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
