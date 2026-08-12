import { defineConfig, devices } from '@playwright/test';

const adminStorageStatePath = process.env.CUBICI_ADMIN_STORAGE_STATE_PATH;
const browserExecutablePath = process.env.CUBICI_PLAYWRIGHT_EXECUTABLE_PATH;
const includeLegacyResponsiveSpecs = process.env.CUBICI_INCLUDE_LEGACY_RESPONSIVE_SPECS === '1';

const legacyResponsiveSpecs = [
  /adm-batch2-six-pages-responsive\.spec\.js/,
  /adm-batch3-moneybank-operation-responsive\.spec\.js/,
  /adm-batch4-customer-management-responsive\.spec\.js/,
  /adm-batch5-monitoring-responsive\.spec\.js/,
  /adm-batch5b-environment-responsive\.spec\.js/,
];

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: includeLegacyResponsiveSpecs ? [] : legacyResponsiveSpecs,
  timeout: 30_000,
  workers: 1,
  reporter: 'line',
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.CUBICI_ADMIN_BASE_URL || `http://127.0.0.1:${process.env.CUBICI_E2E_PORT || '4173'}`,
    ...(adminStorageStatePath ? { storageState: adminStorageStatePath } : {}),
    ...(browserExecutablePath ? { launchOptions: { executablePath: browserExecutablePath } } : {}),
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
