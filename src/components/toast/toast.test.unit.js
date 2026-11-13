import { describe, it, expect } from 'vite-plus/test';
import Toast, { define, toast } from './toast.js';
define();

describe('Unit | Toast', () => {
    it('can be created without errors', async () => {
        const el = new Toast();
        expect(el).toBeInstanceOf(Toast);
    });

    it('is at the top end, without a limit, by default', async () => {
        const el = new Toast();
        expect(el.properties()).toEqual({ placement: 'top-end', max: Infinity, label: 'Notifications' });
    });

    it('exports the function that shows a toast', async () => {
        expect(typeof toast).toBe('function');
        expect(typeof new Toast().toast).toBe('function');
    });
});
