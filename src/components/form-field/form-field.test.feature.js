import { describe, it } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './form-field.js';
define();

describe('Feature | FormField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-form-field></el-form-field>`);
        await nextFrame();
    });
});
