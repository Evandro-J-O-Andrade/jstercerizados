import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'C:/NewWaveProjetos/jrtercerisados/audit',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'off',
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});