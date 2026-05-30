import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './slider.js';
define();

describe('Feature | Slider', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-slider></el-slider>`);
        await nextFrame();
    });
});
