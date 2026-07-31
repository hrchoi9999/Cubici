import fs from 'node:fs';
import path from 'node:path';
import react from '../admin-web/node_modules/@vitejs/plugin-react/dist/index.js';
import { defineConfig } from '../admin-web/node_modules/vite/dist/node/index.js';

const legacyResourcesRoot = path.resolve('../src/main/webapp/resources');

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.html': 'text/html; charset=utf-8',
  };
  return types[extension] ?? 'application/octet-stream';
}

function legacyResourceMiddleware() {
  return (req, res, next) => {
    const rawUrl = req.url?.split('?')[0] ?? '';
    if (!rawUrl.startsWith('/resources/')) {
      next();
      return;
    }
    const relativePath = decodeURIComponent(rawUrl.replace(/^\/resources\//, ''));
    const filePath = path.resolve(legacyResourcesRoot, relativePath);
    if (!filePath.startsWith(`${legacyResourcesRoot}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      next();
      return;
    }
    res.setHeader('Content-Type', contentType(filePath));
    fs.createReadStream(filePath).pipe(res);
  };
}

function serveLegacyResourcesPlugin() {
  return {
    name: 'serve-legacy-resources',
    configureServer(server) {
      server.middlewares.use(legacyResourceMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(legacyResourceMiddleware());
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    command === 'build' ? react() : null,
    serveLegacyResourcesPlugin(),
  ].filter(Boolean),
  publicDir: 'public',
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'),
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: [
      { find: 'react/jsx-runtime', replacement: path.resolve('../admin-web/node_modules/react/jsx-runtime.js') },
      { find: 'react/jsx-dev-runtime', replacement: path.resolve('../admin-web/node_modules/react/jsx-dev-runtime.js') },
      { find: 'react-dom/client', replacement: path.resolve('../admin-web/node_modules/react-dom/client.js') },
      { find: 'react-dom', replacement: path.resolve('../admin-web/node_modules/react-dom/index.js') },
      { find: 'react', replacement: path.resolve('../admin-web/node_modules/react/index.js') },
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4175,
    strictPort: false,
  },
}));
