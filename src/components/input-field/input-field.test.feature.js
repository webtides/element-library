import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './input-field.js';
define();

describe('Feature | InputField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-input-field></el-input-field>`);
        await nextFrame();
    });
});
