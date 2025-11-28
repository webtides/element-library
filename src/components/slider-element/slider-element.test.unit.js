import { describe, it } from 'vitest';
import SliderElement, { define } from './slider-element.js';
define();

describe('Unit | SliderElement', () => {
    it('can be created without errors', async () => {
        const el = new SliderElement();
    });
});
