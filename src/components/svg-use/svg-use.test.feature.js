import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './svg-use.js';
define();

describe('Feature | SvgUse', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-svg-use></el-svg-use>`);
        await nextFrame();
    });
});
