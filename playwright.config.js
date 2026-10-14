import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, workers: 2, timeout: 45000,
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:8080', browserName: 'chromium',
    launchOptions: { executablePath, args: ['--no-sandbox'] },
    trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:8080', reuseExistingServer: false }
});
