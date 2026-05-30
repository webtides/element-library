import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './sticky.js';
define();

describe('Feature | Sticky', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-sticky></el-sticky>`);
        await nextFrame();
    });
});
