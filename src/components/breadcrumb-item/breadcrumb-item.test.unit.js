import { describe, it, expect } from 'vite-plus/test';
import BreadcrumbItem, { define } from './breadcrumb-item.js';
define();

describe('Unit | BreadcrumbItem', () => {
    it('can be created without errors', async () => {
        const el = new BreadcrumbItem();
    });

    it('is text, not the current page, by default', async () => {
        const el = new BreadcrumbItem();
        expect(el.properties()).toEqual({ href: '', target: '', rel: 'noreferrer noopener', current: false });
    });
});
