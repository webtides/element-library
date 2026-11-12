import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './form-field.js';
import { define as defineInputField } from '../input-field/input-field.js';
import { define as definePasswordField } from '../password-field/password-field.js';
define();
defineInputField();
definePasswordField();

describe('Feature | FormField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-form-field></el-form-field>`);
        await nextFrame();
    });

    // element-js keeps the stylesheets of an element on its class. A field used to find the ones of
    // its parent class there, when that one was connected first, and never built its own.
    it('lets every field have its own stylesheet when its parent class was connected first', async () => {
        await fixture(`<el-form-field name="sheets-base"></el-form-field>`);
        const input = await fixture(`<el-input-field name="sheets-input" label="Name"></el-input-field>`);
        const password = await fixture(
            `<el-password-field name="sheets-password" label="Password"></el-password-field>`,
        );

        // From the stylesheet of el-input-field: the field is a column.
        expect(getComputedStyle(input).display).toBe('flex');
        // From the stylesheet of el-password-field: the toggle has no border of a native button.
        expect(getComputedStyle(password.querySelector('.password-toggle')).borderTopStyle).toBe('none');
    });
});
