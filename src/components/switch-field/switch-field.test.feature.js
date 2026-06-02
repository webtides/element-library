import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent } from '../../test-helpers.js';
import { define } from './switch-field.js';
define();

const switchFixture = (attrs = '') =>
    fixture(`<el-switch-field name="notifications" label="Enable notifications" ${attrs}></el-switch-field>`);

describe('Feature | SwitchField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-switch-field></el-switch-field>`);
        await nextFrame();
    });

    it('renders a native checkbox with role="switch"', async () => {
        const el = await switchFixture();
        const input = el.querySelector('input');
        expect(input.type).toBe('checkbox');
        expect(input.getAttribute('role')).toBe('switch');
    });

    it('defaults to off', async () => {
        const el = await switchFixture();
        expect(el.checked).toBe(false);
        expect(el.querySelector('input').checked).toBe(false);
        expect(el.matches(':state(checked)')).toBe(false);
    });

    it('toggling it on updates checked, the state and emits input-change', async () => {
        const el = await switchFixture();
        const changed = oneEvent(el, 'input-change');
        el.querySelector('input').click();
        await changed;
        await nextFrame();
        expect(el.checked).toBe(true);
        expect(el.matches(':state(checked)')).toBe(true);
    });

    it('honours checked="true" declaratively', async () => {
        const el = await switchFixture('checked="true"');
        expect(el.checked).toBe(true);
        expect(el.querySelector('input').checked).toBe(true);
        expect(el.matches(':state(checked)')).toBe(true);
    });

    it('reflects the disabled state onto the native input', async () => {
        const el = await switchFixture('disabled="true"');
        expect(el.querySelector('input').disabled).toBe(true);
    });

    it('has no detectable a11y violations', async () => {
        const el = await switchFixture();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
