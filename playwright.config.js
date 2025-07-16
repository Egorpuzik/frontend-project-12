import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run start-frontend',
    url: 'http://localhost:5003',
    timeout: 60000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5003',
    headless: false,      
    slowMo: 1000,         
  },
});
