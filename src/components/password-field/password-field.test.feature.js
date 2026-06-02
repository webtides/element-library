import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './password-field.js';
define();

const passwordFixture = (attrs = '') =>
    fixture(`<el-password-field name="password" label="Password" ${attrs}></el-password-field>`);

describe('Feature | PasswordField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-password-field></el-password-field>`);
        await nextFrame();
    });

    it('renders a masked input with a reveal button by default', async () => {
        const el = await passwordFixture();
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
        const toggle = el.querySelector('[data-password-toggle]');
        expect(toggle).not.toBeNull();
        expect(toggle.getAttribute('aria-label')).toBe('Show password');
        expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('reveals and re-masks the value when the toggle is clicked', async () => {
        const el = await passwordFixture();

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.passwordVisible).toBe(true);
        expect(el.querySelector('input').getAttribute('type')).toBe('text');
        expect(el.querySelector('[data-password-toggle]').getAttribute('aria-label')).toBe('Hide password');
        expect(el.querySelector('[data-password-toggle]').getAttribute('aria-pressed')).toBe('true');

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.passwordVisible).toBe(false);
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
    });

    it('omits the reveal button with password-toggle="false"', async () => {
        const el = await passwordFixture('password-toggle="false"');
        await nextFrame();
        expect(el.querySelector('[data-password-toggle]')).toBeNull();
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
    });

    it('has no detectable a11y violations', async () => {
        const el = await passwordFixture('required="true"');
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
