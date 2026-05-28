import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
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
                'src/**/*.define.js',
            ],
            // Regression ratchet: thresholds sit just below the current numbers
            // (measured 2026-05-28). Raise them as coverage improves.
            thresholds: {
                statements: 38,
                branches: 23,
                functions: 50,
                lines: 38,
            },
        },
        // Setup file for global configuration
        setupFiles: ['./vitest.setup.js'],
    },
});
