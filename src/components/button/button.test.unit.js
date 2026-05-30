import { describe, it, expect } from 'vitest';
import Button, { define } from './button.js';
define();

describe('Unit | Button', () => {
    it('can be created without errors', async () => {
        const el = new Button();
    });

    it('defaults to a non-link button', async () => {
        const el = new Button();
        expect(el.isLink).toBe(false);
    });

    it('becomes a link once href is set', async () => {
        const el = new Button();
        el.href = 'https://example.com';
        expect(el.isLink).toBe(true);
    });
});
