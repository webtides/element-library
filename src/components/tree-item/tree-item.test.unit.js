import { describe, it, expect } from 'vite-plus/test';
import TreeItem, { define, Events } from './tree-item.js';
define();

describe('Unit | TreeItem', () => {
    it('can be created without errors', async () => {
        const el = new TreeItem();
    });

    it('is a closed entry without a name and without an address, not the current one, by default', async () => {
        const el = new TreeItem();
        expect(el.properties()).toEqual({
            label: '',
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
            open: false,
        });
        expect(el.hasItems).toBe(false);
    });

    it('exposes the event-name constant', async () => {
        expect(Events.TOGGLE).toBe('tree-item-toggle');
    });
});
