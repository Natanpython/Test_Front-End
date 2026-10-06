import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:4200', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  // E2E_CHANNEL=msedge permite usar o Edge instalado, sem baixar outro navegador.
  ...(process.env['E2E_CHANNEL']
    ? {
        use: {
          baseURL: 'http://127.0.0.1:4200',
          channel: process.env['E2E_CHANNEL'],
          trace: 'retain-on-failure',
        },
      }
    : {}),
  webServer: {
    command: 'npm run start -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 60000,
  },
});
