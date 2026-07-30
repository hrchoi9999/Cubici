import { defineConfig, devices } from '@playwright/test';

const adminStorageStatePath = process.env.CUBICI_ADMIN_STORAGE_STATE_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  workers: 1,
  reporter: 'line',
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.CUBICI_ADMIN_BASE_URL || `http://127.0.0.1:${process.env.CUBICI_E2E_PORT || '4173'}`,
    ...(adminStorageStatePath ? { storageState: adminStorageStatePath } : {}),
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
