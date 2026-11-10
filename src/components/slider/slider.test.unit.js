import { describe, it } from 'vite-plus/test';
import Slider, { define } from './slider.js';
define();

describe('Unit | Slider', () => {
    it('can be created without errors', async () => {
        const el = new Slider();
    });
});
