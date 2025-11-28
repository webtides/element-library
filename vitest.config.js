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
            exclude: ['src/**/*.test.*.js', 'src/**/*.stories.js', 'src/**/*.style.js', 'src/**/*.events.js'],
        },
        // Setup file for global configuration
        setupFiles: ['./vitest.setup.js'],
    },
});
