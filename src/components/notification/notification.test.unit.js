import { describe, it, expect } from 'vitest';
import Notification, { define } from './notification.js';
import Events from './notification.events.js';
define();

describe('Unit | Notification', () => {
    it('can be created without errors', async () => {
        const el = new Notification();
        expect(el).toBeInstanceOf(Notification);
    });

    it('exposes the event-name constants', async () => {
        expect(Events.SHOW).toBe('notification-show');
        expect(Events.AFTER_HIDE).toBe('notification-after-hide');
    });
});
