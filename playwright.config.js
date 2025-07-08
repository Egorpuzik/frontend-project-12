import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'make start',
    port: 5000,
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5000',
  },
});
