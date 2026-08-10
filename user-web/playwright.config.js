import { defineConfig, devices } from '../admin-web/node_modules/@playwright/test/index.mjs';

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  workers: 1,
  reporter: 'line',
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${process.env.CUBICI_USER_E2E_PORT || '4175'}`,
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...(executablePath ? { executablePath } : {}) },
    },
  ],
});
