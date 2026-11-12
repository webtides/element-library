import { describe, it, expect } from 'vite-plus/test';
import Tooltip, { define } from './tooltip.js';
import Events from './tooltip.events.js';
define();

describe('Unit | Tooltip', () => {
    it('can be created without errors', async () => {
        const el = new Tooltip();
        expect(el).toBeInstanceOf(Tooltip);
    });

    it('is closed, above its anchor at a distance of 8px, without an arrow and with a delay of 150ms to open, by default', async () => {
        const el = new Tooltip();
        expect(el.properties()).toEqual({
            for: '',
            open: false,
            placement: 'top',
            distance: 8,
            showDelay: 150,
            hideDelay: 0,
            arrow: false,
            disabled: false,
        });
    });

    it('exposes the event-name constants', async () => {
        expect(Events.SHOW).toBe('tooltip-show');
        expect(Events.HIDE).toBe('tooltip-hide');
    });
});
