# Migration from @web/test-runner to Vitest 4

This document describes the migration from `@web/test-runner` to Vitest 4 with browser mode.

## What Changed

### Dependencies Added
- `vitest@^4.0.0` - Core test runner
- `@vitest/browser@^4.0.0` - Browser mode support
- `@vitest/ui@^4.0.0` - UI for test visualization
- `@vitest/coverage-istanbul@^4.0.0` - Coverage provider
- `playwright@^1.49.0` - Browser automation (used by Vitest browser mode)

### Dependencies Kept
- `@open-wc/testing@^4.0.0` - Still used for web component testing utilities (compatible with Vitest)

### Dependencies That Can Be Removed
You can now safely remove these packages by running `npm uninstall`:
- `@web/test-runner`
- `@web/dev-server`

### Files Added
- `vitest.config.js` - Main Vitest configuration
- `vitest.setup.js` - Global test setup (replaces web-test-runner's testRunnerHtml)

### Files Removed
- `web-test-runner.config.js` - No longer needed

## Configuration

### vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
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
        setupFiles: ['./vitest.setup.js'],
    },
});
```

### vitest.setup.js
```javascript
// Global setup for Vitest tests
globalThis.elementJsConfig = { observeGlobalStyles: true };
```

## Updated Scripts

### Before
```json
{
  "test": "web-test-runner src/**/*.test.*.{html,js} --node-resolve",
  "test:coverage": "web-test-runner src/**/*.test.*.{html,js} --node-resolve --coverage",
  "test:watch": "web-test-runner src/**/*.test.*.{html,js} --node-resolve --watch"
}
```

### After
```json
{
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

## Test File Compatibility

**Good news!** Your existing test files do NOT need to be modified. They will work as-is with Vitest because:

1. Vitest provides global `describe`, `it`, and `expect` functions (just like the testing libraries you were using)
2. `@open-wc/testing` utilities (`fixture`, `nextFrame`, `oneEvent`, etc.) are fully compatible with Vitest's browser mode
3. The test structure and assertions remain the same

### Example Test (No Changes Needed)
```javascript
/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './accordion-element.js';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-element></el-accordion-element>`);
        await nextFrame();
    });
});
```

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with UI
```bash
npm run test:ui
```

The UI will open a browser interface showing all your tests with detailed information.

## Next Steps

1. Run `npm install` to install the new dependencies
2. Run `npm test` to verify all tests pass
3. Optionally run `npm uninstall @web/test-runner @web/dev-server` to remove old dependencies
4. Commit the changes

## Benefits of Vitest

1. **Faster execution** - Vitest is significantly faster than web-test-runner
2. **Better DX** - Hot module reload, better error messages, and instant test re-runs
3. **Modern tooling** - Built on Vite, uses esbuild for fast transforms
4. **UI mode** - Visual test runner with detailed information
5. **Better watch mode** - Smarter test re-runs based on changed files
6. **API compatibility** - Similar API to Jest, making it familiar
7. **Browser mode** - Native browser testing without jsdom limitations

## Troubleshooting

### Tests not found
If tests aren't being picked up, check that they match the pattern in `vitest.config.js`:
```javascript
include: ['src/**/*.test.{unit,feature}.js']
```

### Playwright installation issues
If Playwright browsers aren't installed, run:
```bash
npx playwright install chromium
```

### Coverage not working
Make sure `@vitest/coverage-istanbul` is installed:
```bash
npm install -D @vitest/coverage-istanbul
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Vitest Configuration](https://vitest.dev/config/)
