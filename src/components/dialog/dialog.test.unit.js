import { describe, it, expect } from 'vitest';
import Dialog, { define } from './dialog.js';
import Events from './dialog.events.js';
define();

describe('Unit | Dialog', () => {
    it('can be created without errors', async () => {
        const el = new Dialog();
        expect(el).toBeInstanceOf(Dialog);
    });

    it('exposes the event-name constants', async () => {
        expect(Events.REQUEST_CLOSE).toBe('dialog-request-close');
        expect(Events.AFTER_SHOW).toBe('dialog-after-show');
        expect(Events.AFTER_HIDE).toBe('dialog-after-hide');
    });
});
