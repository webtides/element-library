import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './dropdown.js';
define();

describe('Feature | Dropdown', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-dropdown></el-dropdown>`);
        await nextFrame();
    });
});
