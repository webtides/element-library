import { describe, it, expect } from 'vite-plus/test';
import Splitter, { define, Events } from './splitter.js';
define();

describe('Unit | Splitter', () => {
    it('can be created without errors', async () => {
        const el = new Splitter();
    });

    it('is at the end edge of its pane, between 0 and 100, and moves 16px with a key by default', async () => {
        const el = new Splitter();
        expect(el.properties()).toEqual({ value: 0, min: 0, max: 100, step: 16, label: '', placement: 'end' });
    });

    it('names its events', async () => {
        expect(Events).toEqual({ RESIZE: 'splitter-resize', RESIZE_END: 'splitter-resize-end' });
    });
});
