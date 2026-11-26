import { describe, it, expect } from 'vite-plus/test';
import AppBar, { define } from './app-bar.js';
define();

describe('Unit | AppBar', () => {
    it('can be created without errors', async () => {
        const el = new AppBar();
    });

    it('has a title that is no heading, and plain buttons, by default', async () => {
        const el = new AppBar();
        expect(el.properties()).toEqual({ headingLevel: 0, appearance: 'plain' });
    });
});
