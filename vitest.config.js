import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            // Headless mode by default
            headless: true,
        },
        include: ['src/**/*.test.{unit,feature}.js'],
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './test/coverage',
            include: ['src/**/*.js'],
            exclude: [
                'src/**/*.test.*.js',
                'src/**/*.stories.js',
                'src/**/*.style.js',
                'src/**/*.events.js',
            ],
        },
        // Setup file for global configuration
        setupFiles: ['./vitest.setup.js'],
    },
});
