import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cubiciRoot = path.resolve(__dirname, '..');
const userRoot = path.join(cubiciRoot, 'user-web');
const adminRoot = path.join(cubiciRoot, 'admin-web');
const legacyWebappRoot = path.join(cubiciRoot, 'src', 'main', 'webapp');
const outputRoot = path.join(cubiciRoot, 'dist-cloudflare');
const nodeExe = process.execPath;
const viteCli = path.join(adminRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'https://api.example.com';
const masterAdminEmail = process.env.VITE_CUBICI_MASTER_ADMIN_EMAIL ?? process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';

runBuild('user-web', userRoot, {
  VITE_API_BASE_URL: apiBaseUrl,
});

runBuild('admin-web', adminRoot, {
  VITE_API_BASE_URL: apiBaseUrl,
  VITE_CUBICI_MASTER_ADMIN_EMAIL: masterAdminEmail,
  CUBICI_ADMIN_BASE: '/admin/',
});

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
copyDirectory(path.join(userRoot, 'dist'), outputRoot);
copyDirectory(path.join(adminRoot, 'dist'), path.join(outputRoot, 'admin'));
fs.copyFileSync(path.join(outputRoot, 'admin', 'index.html'), path.join(outputRoot, 'admin-spa.html'));
copyDirectory(path.join(legacyWebappRoot, 'resources'), path.join(outputRoot, 'resources'));
copyDirectory(path.join(adminRoot, 'public', 'resources'), path.join(outputRoot, 'resources'));
writeCloudflareRoutingFiles(outputRoot);

console.log(`Cloudflare static bundle created: ${outputRoot}`);
console.log(`API base URL: ${apiBaseUrl}`);

function runBuild(label, cwd, extraEnv) {
  const result = spawnSync(nodeExe, [viteCli, 'build'], {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${label} build failed with exit code ${result.status}`);
  }
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`missing build directory: ${source}`);
  }
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function writeCloudflareRoutingFiles(target) {
  fs.writeFileSync(
    path.join(target, '_redirects'),
    [
      '/assets/* /assets/:splat 200',
      '/admin/assets/* /admin/assets/:splat 200',
      '/admin /admin/ 200',
      '/admin/* /admin/ 200',
      '/admin-spa /admin/ 200',
      '/resources/* /resources/:splat 200',
      '/* /index.html 200',
      '',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(target, '_routes.json'),
    JSON.stringify(
      {
        version: 1,
        include: ['/*'],
        exclude: ['/assets/*', '/admin/assets/*', '/resources/*'],
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(target, '_worker.js'),
    [
      'export default {',
      '  async fetch(request, env) {',
      '    const url = new URL(request.url);',
      '    const lastSegment = url.pathname.split("/").pop() ?? "";',
      '    const looksLikeFile = lastSegment.includes(".");',
      '    const isAdminRoute = url.pathname === "/admin"',
      '      || url.pathname.startsWith("/admin/")',
      '      || url.pathname === "/admin-spa";',
      '    if (isAdminRoute && !looksLikeFile) {',
      '      const adminUrl = new URL("/admin/", url.origin);',
      '      return env.ASSETS.fetch(new Request(adminUrl, request));',
      '    }',
      '    const assetResponse = await env.ASSETS.fetch(request);',
      '    if (assetResponse.status !== 404) {',
      '      return assetResponse;',
      '    }',
      '    const fallbackPath = isAdminRoute',
      '      ? "/admin/"',
      '      : "/index.html";',
      '    const fallbackUrl = new URL(fallbackPath, url.origin);',
      '    return env.ASSETS.fetch(new Request(fallbackUrl, request));',
      '  },',
      '};',
      '',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(target, '_headers'),
    [
      '/*',
      '  X-Frame-Options: DENY',
      '  X-Content-Type-Options: nosniff',
      '  Referrer-Policy: strict-origin-when-cross-origin',
      '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
      '',
      '/assets/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
      '/admin/assets/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
      '/resources/*',
      '  Cache-Control: public, max-age=86400',
      '',
    ].join('\n'),
    'utf8',
  );
}
