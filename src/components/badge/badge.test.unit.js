import { describe, it, expect } from 'vite-plus/test';
import Badge, { define } from './badge.js';
define();

describe('Unit | Badge', () => {
    it('can be created without errors', async () => {
        const el = new Badge();
    });

    it('is neutral and filled, without a pill shape and a pulse, by default', async () => {
        const el = new Badge();
        expect(el.properties()).toEqual({ variant: 'neutral', appearance: 'filled', pill: false, pulse: false });
    });
});
