import { describe, it, expect } from 'vite-plus/test';
import Popover, { define } from './popover.js';
import Events from './popover.events.js';
define();

describe('Unit | Popover', () => {
    it('can be created without errors', async () => {
        const el = new Popover();
        expect(el).toBeInstanceOf(Popover);
    });

    it('is closed, below its anchor at a distance of 8px and without an arrow, by default', async () => {
        const el = new Popover();
        expect(el.properties()).toEqual({ open: false, placement: 'bottom', distance: 8, arrow: false });
    });

    it('exposes the event-name constants', async () => {
        expect(Events.SHOW).toBe('popover-show');
        expect(Events.HIDE).toBe('popover-hide');
    });
});
