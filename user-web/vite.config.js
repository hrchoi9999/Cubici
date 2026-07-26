import path from 'node:path';
import react from '../admin-web/node_modules/@vitejs/plugin-react/dist/index.js';
import { defineConfig } from '../admin-web/node_modules/vite/dist/node/index.js';

export default defineConfig({
  plugins: [react()],
  publicDir: '../src/main/webapp/resources',
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'),
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
});
