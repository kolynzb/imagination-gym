import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 2,
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:5180',
    channel: 'chrome',
    timezoneId: 'Africa/Kampala',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm run dev --host 127.0.0.1 --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: false,
    env: { VITE_CONVEX_URL: '', VITE_GOOGLE_CLIENT_ID: '' },
  },
});
