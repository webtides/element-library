import { describe, it, expect } from 'vite-plus/test';
import Card, { define } from './card.js';
define();

describe('Unit | Card', () => {
    it('can be created without errors', async () => {
        const el = new Card();
    });

    it('is outlined by default', async () => {
        const el = new Card();
        expect(el.properties()).toEqual({ appearance: 'outlined' });
    });
});
