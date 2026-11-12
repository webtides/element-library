import { describe, it, expect } from 'vite-plus/test';
import Tag, { define } from './tag.js';
import Events from './tag.events.js';
define();

describe('Unit | Tag', () => {
    it('can be created without errors', async () => {
        const el = new Tag();
        expect(el).toBeInstanceOf(Tag);
    });

    it('is neutral, filled and medium, and not removable, by default', async () => {
        const el = new Tag();
        expect(el.properties()).toEqual({
            variant: 'neutral',
            appearance: 'filled',
            size: 'medium',
            pill: false,
            removable: false,
            removeLabel: 'Remove',
        });
    });

    it('exposes the event-name constants', async () => {
        expect(Events.REMOVE).toBe('tag-remove');
    });
});
