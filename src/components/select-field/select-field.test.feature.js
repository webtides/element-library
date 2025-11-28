import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './select-field.js';
define();

describe('Feature | SelectField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-select-field></el-select-field>`);
        await nextFrame();
    });
});
