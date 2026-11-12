import { describe, it, expect } from 'vite-plus/test';
import Drawer, { define, Events as ExportedEvents } from './drawer.js';
import Events from './drawer.events.js';
import Dialog, { define as defineDialog } from '../dialog/dialog.js';
import DialogEvents from '../dialog/dialog.events.js';
define();
defineDialog();

describe('Unit | Drawer', () => {
    it('can be created without errors', async () => {
        const el = new Drawer();
        expect(el).toBeInstanceOf(Drawer);
    });

    it('is a dialog', async () => {
        expect(new Drawer()).toBeInstanceOf(Dialog);
    });

    it('is closed, at the end, with a header and a close button named "Close", by default', async () => {
        const el = new Drawer();
        expect(el.properties()).toEqual({
            open: false,
            label: '',
            placement: 'end',
            noHeader: false,
            closeLabel: 'Close',
        });
    });

    it('exposes the event-name constants', async () => {
        expect(ExportedEvents).toBe(Events);
        expect(Events).toEqual({
            SHOW: 'drawer-show',
            AFTER_SHOW: 'drawer-after-show',
            HIDE: 'drawer-hide',
            AFTER_HIDE: 'drawer-after-hide',
            INITIAL_FOCUS: 'drawer-initial-focus',
            REQUEST_CLOSE: 'drawer-request-close',
        });
    });

    it('has a name of its own for every event of the dialog', async () => {
        expect(Object.keys(Events)).toEqual(Object.keys(DialogEvents));
        for (const [key, name] of Object.entries(DialogEvents)) {
            expect(Events[key]).toBe(name.replace(/^dialog-/, 'drawer-'));
        }
    });

    it('leaves the dialog its own events', async () => {
        expect(new Dialog()._eventNames).toBe(DialogEvents);
        expect(new Drawer()._eventNames).toBe(Events);
    });
});
