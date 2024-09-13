import { defineConfig } from '@playwright/test';

export default defineConfig({
    timeout: 80000, // 60 seconds

    testDir: './task1_tests',   // Updated directory name
    use: {
        baseURL: 'https://admin.moralis.io',  // Base URL for all tests
        headless: true,  // Run tests in headless mode
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        // Optionally configure Firefox or WebKit
    ],
});
