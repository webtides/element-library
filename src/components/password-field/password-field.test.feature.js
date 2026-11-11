import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    // The danger colour is the default theme's: without a theme the message is `red`, 3.99 : 1 on white.
    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await passwordFixture(
            'error-message="Enter your password" valid="false" style="--el-color-danger: #dc2626"',
        );
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('input').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('keeps the text entry attributes on the input when the toggle renders it again', async () => {
        const el = await passwordFixture('autocomplete="new-password" autocapitalize="none" spellcheck="false"');
        const expected = { autocomplete: 'new-password', autocapitalize: 'none', spellcheck: 'false' };
        const onInput = () =>
            Object.fromEntries(
                Object.keys(expected).map((name) => [name, el.querySelector('input').getAttribute(name)]),
            );
        expect(onInput()).toEqual(expected);

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.querySelector('input').getAttribute('type')).toBe('text');
        expect(onInput()).toEqual(expected);

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(onInput()).toEqual(expected);
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-password-field name="password" label="Password"></el-password-field></div>`,
        );
        expect(sizeOf(wrapper.querySelector('[data-password-toggle]')).width).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the toggle and the input at least --el-touch-target', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-password-field name="password" label="Password"></el-password-field></div>`,
            );
            const toggle = sizeOf(wrapper.querySelector('[data-password-toggle]'));
            expect(Math.min(toggle.width, toggle.height)).toBeGreaterThanOrEqual(44);
            expect(sizeOf(wrapper.querySelector('input')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
