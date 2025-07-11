import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: undefined, 
    url: 'http://localhost:5002', 
    timeout: 60000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5002',
  },
});
