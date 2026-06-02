import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent } from '../../test-helpers.js';
import { define } from './radio-field.js';
define();

// Options are passed as a JSON attribute so they are present at connect time (the group's initial
// validity is computed in connected()).
const radioFixture = (attrs = '', options = ['Starter', 'Pro', 'Enterprise']) =>
    fixture(
        `<el-radio-field name="plan" label="Choose a plan" options='${JSON.stringify(options)}' ${attrs}></el-radio-field>`,
    );

describe('Feature | RadioField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-radio-field></el-radio-field>`);
        await nextFrame();
    });

    it('renders one radio per option inside a fieldset/legend', async () => {
        const el = await radioFixture();
        expect(el.querySelectorAll('input[type="radio"]')).toHaveLength(3);
        expect(el.querySelector('fieldset')).not.toBeNull();
        expect(el.querySelector('legend').textContent.trim()).toBe('Choose a plan');
    });

    it('selecting a radio updates value and emits input-change', async () => {
        const el = await radioFixture();
        const changed = oneEvent(el, 'input-change');
        el.querySelectorAll('input[type="radio"]')[1].click();
        const event = await changed;
        expect(el.value).toBe('Pro');
        expect(event.detail).toBe('Pro');
    });

    it('shares a name so the radios are mutually exclusive', async () => {
        const el = await radioFixture();
        const radios = [...el.querySelectorAll('input[type="radio"]')];
        expect(radios.every((radio) => radio.name === 'plan')).toBe(true);

        radios[0].click();
        await nextFrame();
        radios[2].click();
        await nextFrame();

        expect(radios.filter((radio) => radio.checked)).toHaveLength(1);
        expect(el.value).toBe('Enterprise');
    });

    it('is invalid while required and unselected, valid once a choice is made', async () => {
        const el = await radioFixture('required="true"');
        // The state reflects validity immediately; the message stays hidden until touched.
        expect(el.matches(':state(invalid)')).toBe(true);

        el.querySelectorAll('input[type="radio"]')[0].click();
        await nextFrame();
        expect(el.matches(':state(valid)')).toBe(true);
    });

    it('disables an individual option via the option object', async () => {
        const el = await radioFixture('', [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', disabled: true },
        ]);
        const radios = el.querySelectorAll('input[type="radio"]');
        expect(radios[0].disabled).toBe(false);
        expect(radios[1].disabled).toBe(true);
    });

    it('has no detectable a11y violations', async () => {
        const el = await radioFixture('value="Pro"');
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
