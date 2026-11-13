import { describe, it, expect } from 'vite-plus/test';
import Avatar, { define } from './avatar.js';
define();

describe('Unit | Avatar', () => {
    it('can be created without errors', async () => {
        const el = new Avatar();
    });

    it('is a circle of medium size without an image, initials or a label by default', async () => {
        const el = new Avatar();
        expect(el.properties()).toEqual({ image: '', label: '', initials: '', shape: 'circle', size: 'medium' });
    });
});
