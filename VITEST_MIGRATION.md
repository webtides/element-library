# Migration from @web/test-runner to Vitest 4

This document describes the migration from `@web/test-runner` to Vitest 4 with browser mode.

## What Changed

### Dependencies Added
- `vitest@^4.0.0` - Core test runner
- `@vitest/browser@^4.0.0` - Browser mode support
- `@vitest/ui@^4.0.0` - UI for test visualization
- `@vitest/coverage-istanbul@^4.0.0` - Coverage provider
- `playwright@^1.49.0` - Browser automation (used by Vitest browser mode)

### Dependencies Removed
You can now safely remove these packages by running `npm uninstall`:
- `@web/test-runner` - Replaced by Vitest
- `@web/dev-server` - No longer needed
- `@open-wc/testing` - Replaced by custom test helpers

### Files Added
- `vitest.config.js` - Main Vitest configuration
- `vitest.setup.js` - Global test setup (replaces web-test-runner's testRunnerHtml)
- `test-helpers.js` - Custom testing utilities (replaces @open-wc/testing)

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

## Test File Changes

Test files have been updated to use custom test helpers instead of `@open-wc/testing`. The import statement changed, but the APIs remain the same.

### What Changed in Test Files

**Before:**
```javascript
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
```

**After:**
```javascript
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
```

The utilities work exactly the same way - only the import path changed!

### Example Test
```javascript
/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import { define } from './accordion-element.js';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-element></el-accordion-element>`);
        await nextFrame();
    });
});
```

### Custom Test Helpers

The `test-helpers.js` file provides minimal utilities for browser testing:

- **`fixture(html)`** - Creates and renders HTML elements in the DOM
- **`fixtureSync(html)`** - Synchronous version of fixture
- **`nextFrame()`** - Waits for the next animation frame
- **`aTimeout(ms)`** - Async timeout helper
- **`oneEvent(element, eventName)`** - Waits for a single event

For assertions, use Vitest's native `expect` API directly (e.g., `expect(value).toBe(expected)`).

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
3. Optionally run `npm uninstall @web/test-runner @web/dev-server @open-wc/testing` to remove old dependencies
4. Commit the changes

## Benefits of Vitest

1. **Faster execution** - Vitest is significantly faster than web-test-runner
2. **Better DX** - Hot module reload, better error messages, and instant test re-runs
3. **Modern tooling** - Built on Vite, uses esbuild for fast transforms
4. **UI mode** - Visual test runner with detailed information
5. **Better watch mode** - Smarter test re-runs based on changed files
6. **API compatibility** - Similar API to Jest, making it familiar
7. **Browser mode** - Native browser testing without jsdom limitations
8. **Zero external test dependencies** - Custom test helpers mean no dependency on @open-wc/testing

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
