import { describe, it, expect } from 'vite-plus/test';
import ListItem, { define } from './list-item.js';
define();

describe('Unit | ListItem', () => {
    it('can be created without errors', async () => {
        const el = new ListItem();
    });

    it('is text without a mark, not the current row and not cut, by default', async () => {
        const el = new ListItem();
        expect(el.properties()).toEqual({
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
            mark: '',
            truncate: false,
        });
    });
});
