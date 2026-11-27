import { describe, it, expect } from 'vite-plus/test';
import StatusBar, { define } from './status-bar.js';
define();

describe('Unit | StatusBar', () => {
    it('can be created without errors', async () => {
        const el = new StatusBar();
    });

    it('has nothing to set: the entries are what the page writes', async () => {
        const el = new StatusBar();
        expect(el.properties()).toEqual({});
    });
});
