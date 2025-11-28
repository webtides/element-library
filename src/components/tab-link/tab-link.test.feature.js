import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './tab-link.js';
define();

describe('Feature | TabLink', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-link></el-tab-link>`);
        await nextFrame();
    });
});
