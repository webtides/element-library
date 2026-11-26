import { describe, it, expect } from 'vite-plus/test';
import DescriptionList, { define } from './description-list.js';
define();

describe('Unit | DescriptionList', () => {
    it('can be created without errors', async () => {
        const el = new DescriptionList();
    });

    it('has no properties: the page writes the names and the values', async () => {
        const el = new DescriptionList();
        expect(el.properties()).toEqual({});
    });
});
