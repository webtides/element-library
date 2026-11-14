import { afterEach, beforeEach, describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    aTimeout,
    fixture,
    forcePseudoClasses,
    nextFrame,
    oneEvent,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define, Events } from './copy-button.js';
import { define as defineInputField } from '../input-field/input-field.js';
define();
defineInputField();

const button = (el) => el.shadowRoot.querySelector('[part="base"]');
const icon = (el) => el.shadowRoot.querySelector('[part="icon"]');
const feedback = (el) => el.shadowRoot.querySelector('[part="feedback"]');
// The name of the slot that shows its icon right now.
const shownIcon = (el) => icon(el).querySelector('slot').name;

// What the button has written to the clipboard. The clipboard of the browser refuses a page that
// does not have the focus, which a test file never has, so the tests put a clipboard of their
// own in its place.
let written;
/**
 * Replaces `navigator.clipboard.writeText` for the tests of the surrounding `describe`.
 * @param {(text: string) => Promise<void>} [writeText] - Unset, it records the text in `written`.
 */
function useClipboard(writeText) {
    beforeEach(() => {
        written = [];
        navigator.clipboard.writeText =
            writeText ??
            (async (text) => {
                written.push(text);
            });
    });
    afterEach(() => {
        delete navigator.clipboard.writeText;
    });
}

// A press, and the frames the button needs to show the outcome.
const press = async (el) => {
    button(el).click();
    await nextFrame();
    await nextFrame();
};

describe('Feature | CopyButton', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-copy-button></el-copy-button>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a native button named "Copy"', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);

            expect(button(el).tagName).toBe('BUTTON');
            expect(button(el).type).toBe('button');
            expect(await accessibleRole(button(el))).toBe('button');
            expect(await accessibleName(button(el))).toBe('Copy');
        });

        it('takes its name from the label, also when it is set from a script', async () => {
            const el = await fixture(`<el-copy-button value="npm install" label="Befehl kopieren"></el-copy-button>`);
            expect(await accessibleName(button(el))).toBe('Befehl kopieren');

            el.label = 'Copier';
            await nextFrame();
            expect(await accessibleName(button(el))).toBe('Copier');
        });

        it('has a live region for the outcome that is there, and empty, from the start', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);

            expect(feedback(el).getAttribute('role')).toBe('status');
            expect(feedback(el).textContent).toBe('');
            // Not shown, and not taken out of the accessibility tree.
            expect(sizeOf(feedback(el))).toEqual({ width: 1, height: 1 });
            expect(getComputedStyle(feedback(el)).display).not.toBe('none');
            expect(getComputedStyle(feedback(el)).visibility).toBe('visible');
        });

        it('keeps its icons out of the accessibility tree', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);
            expect(icon(el).getAttribute('aria-hidden')).toBe('true');
        });

        it('has no detectable a11y violations', async () => {
            const wrapper = await fixture(`
                <div style="background: rgb(255, 255, 255); color: rgb(0, 0, 0)">
                    <code id="command">npm install</code>
                    <el-copy-button from="command"></el-copy-button>
                </div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            // The rule for the name of a button has seen the button inside the shadow root.
            expect(results.passes.map((pass) => pass.id)).toContain('button-name');
        });
    });

    describe('a press', () => {
        useClipboard();

        it('copies the value and says so with an event', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);
            const copied = oneEvent(el, Events.COPY);

            button(el).click();
            const event = await copied;

            expect(written).toEqual(['npm install']);
            expect(event.detail).toEqual({ value: 'npm install' });
        });

        it('fires an event that bubbles and crosses shadow roots', async () => {
            const wrapper = await fixture(`<div><el-copy-button value="npm install"></el-copy-button></div>`);
            const copied = oneEvent(wrapper, Events.COPY);

            button(wrapper.firstElementChild).click();
            const event = await copied;

            expect(event.target).toBe(wrapper.firstElementChild);
            expect([event.bubbles, event.composed]).toEqual([true, true]);
        });

        it('copies a value set from a script', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);

            el.value = 'npm ci';
            await press(el);
            expect(written).toEqual(['npm ci']);
        });

        it('takes the focus and is a tab stop, as any native button', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);

            el.focus();
            expect(el.shadowRoot.activeElement).toBe(button(el));
            expect(button(el).tabIndex).toBe(0);
        });

        it('copies from the method, and resolves with the outcome', async () => {
            const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);

            expect(await el.copy()).toBe(true);
            expect(written).toEqual(['npm install']);

            el.value = '';
            expect(await el.copy()).toBe(false);
            expect(written).toEqual(['npm install']);
        });
    });

    describe('from', () => {
        useClipboard();

        it('copies the text of the element with that id, without the white space around it', async () => {
            const wrapper = await fixture(`
                <div>
                    <pre id="snippet">
                        npm install
                    </pre>
                    <el-copy-button from="snippet"></el-copy-button>
                </div>
            `);

            await press(wrapper.lastElementChild);
            expect(written).toEqual(['npm install']);
        });

        it('copies the value of an input, and of a field of the library', async () => {
            const wrapper = await fixture(`
                <div>
                    <input id="token" value=" abc 123 " />
                    <el-input-field id="link" value="https://example.com/share"><input /></el-input-field>
                    <el-copy-button from="token"></el-copy-button>
                    <el-copy-button from="link"></el-copy-button>
                </div>
            `);
            const [, , fromInput, fromField] = wrapper.children;

            await press(fromInput);
            await press(fromField);
            // The value of a control is copied as it is.
            expect(written).toEqual([' abc 123 ', 'https://example.com/share']);
        });

        it('reads the element when the button is pressed, not before', async () => {
            const wrapper = await fixture(`
                <div>
                    <input id="draft" value="first" />
                    <el-copy-button from="draft"></el-copy-button>
                </div>
            `);

            wrapper.firstElementChild.value = 'second';
            await press(wrapper.lastElementChild);
            expect(written).toEqual(['second']);
        });

        it('comes before value', async () => {
            const wrapper = await fixture(`
                <div>
                    <code id="command">npm install</code>
                    <el-copy-button from="command" value="npm ci"></el-copy-button>
                </div>
            `);

            await press(wrapper.lastElementChild);
            expect(written).toEqual(['npm install']);
        });

        it('finds the element in the shadow root the button is in', async () => {
            const host = await fixture(`<div></div>`);
            host.attachShadow({ mode: 'open' }).innerHTML = `
                <code id="command">npm install</code>
                <el-copy-button from="command"></el-copy-button>
            `;
            await nextFrame();
            await nextFrame();

            await press(host.shadowRoot.querySelector('el-copy-button'));
            expect(written).toEqual(['npm install']);
        });
    });

    describe('the outcome', () => {
        describe('after the text was copied', () => {
            useClipboard();

            it('shows a check mark and tells a screen reader, for the time of feedback-duration', async () => {
                const el = await fixture(
                    `<el-copy-button value="npm install" feedback-duration="300"></el-copy-button>`,
                );
                expect([el.status, shownIcon(el), feedback(el).textContent]).toEqual(['idle', 'copy-icon', '']);

                await press(el);
                expect([el.status, shownIcon(el), feedback(el).textContent]).toEqual([
                    'success',
                    'success-icon',
                    'Copied',
                ]);
                expect(el.getAttribute('status')).toBe('success');
                // The name of the button stays: what it does has not changed.
                expect(await accessibleName(button(el))).toBe('Copy');

                await aTimeout(450);
                await nextFrame();
                expect([el.status, shownIcon(el), feedback(el).textContent]).toEqual(['idle', 'copy-icon', '']);
                expect(el.getAttribute('status')).toBe('idle');
            });

            it('keeps the focus on the button while the icon changes', async () => {
                const el = await fixture(
                    `<el-copy-button value="npm install" feedback-duration="100"></el-copy-button>`,
                );
                const pressed = button(el);

                el.focus();
                await press(el);
                expect(button(el)).toBe(pressed);
                expect(el.shadowRoot.activeElement).toBe(pressed);

                await aTimeout(250);
                await nextFrame();
                expect(el.shadowRoot.activeElement).toBe(pressed);
            });

            it('starts the time again with a second press', async () => {
                const el = await fixture(
                    `<el-copy-button value="npm install" feedback-duration="400"></el-copy-button>`,
                );

                await press(el);
                await aTimeout(250);
                await press(el);
                await aTimeout(250);
                // 500ms after the first press, 250ms after the second.
                expect(el.status).toBe('success');
                expect(written).toEqual(['npm install', 'npm install']);

                await aTimeout(400);
                expect(el.status).toBe('idle');
            });

            it('says it in the language of the page', async () => {
                const el = await fixture(
                    `<el-copy-button value="npm install" success-label="Kopiert"></el-copy-button>`,
                );

                await press(el);
                expect(feedback(el).textContent).toBe('Kopiert');
            });

            it('shows the icon of the page in the place of the check mark', async () => {
                const el = await fixture(`
                    <el-copy-button value="npm install">
                        <svg slot="copy-icon" viewBox="0 0 24 24"></svg>
                        <svg slot="success-icon" viewBox="0 0 24 24"></svg>
                    </el-copy-button>
                `);
                const [own, ownSuccess] = el.children;
                expect(icon(el).querySelector('slot').assignedElements()).toEqual([own]);

                await press(el);
                expect(icon(el).querySelector('slot').assignedElements()).toEqual([ownSuccess]);
            });
        });

        describe('when there is nothing to copy', () => {
            useClipboard();

            it('shows a cross, tells a screen reader and fires an error, without touching the clipboard', async () => {
                const el = await fixture(`<el-copy-button></el-copy-button>`);
                const failed = oneEvent(el, Events.ERROR);

                await press(el);
                const event = await failed;

                expect(written).toEqual([]);
                expect(event.detail.error).toBeInstanceOf(Error);
                expect([el.status, shownIcon(el), feedback(el).textContent]).toEqual([
                    'error',
                    'error-icon',
                    'Could not copy',
                ]);
            });

            it('counts an element that is not there, and one without content, as nothing to copy', async () => {
                const wrapper = await fixture(`
                    <div>
                        <code id="empty">   </code>
                        <el-copy-button from="missing"></el-copy-button>
                        <el-copy-button from="empty" error-label="Nichts zu kopieren"></el-copy-button>
                    </div>
                `);
                const [, missing, empty] = wrapper.children;

                await press(missing);
                await press(empty);
                expect(written).toEqual([]);
                expect(missing.status).toBe('error');
                expect(feedback(empty).textContent).toBe('Nichts zu kopieren');
            });
        });

        describe('when the browser refuses', () => {
            const refusal = new DOMException('Write permission denied.', 'NotAllowedError');
            useClipboard(async () => {
                throw refusal;
            });

            it('shows a cross and hands the error of the browser on', async () => {
                const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);
                const failed = oneEvent(el, Events.ERROR);
                let copied = false;
                el.addEventListener(Events.COPY, () => (copied = true));

                expect(await el.copy()).toBe(false);
                const event = await failed;
                await nextFrame();

                expect(event.detail.error).toBe(refusal);
                expect(copied).toBe(false);
                expect([el.status, shownIcon(el), feedback(el).textContent]).toEqual([
                    'error',
                    'error-icon',
                    'Could not copy',
                ]);
            });
        });

        describe('when the page has no clipboard', () => {
            // A page that is not served over https has none.
            beforeEach(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
            afterEach(() => delete navigator.clipboard);

            it('shows a cross and fires an error', async () => {
                const el = await fixture(`<el-copy-button value="npm install"></el-copy-button>`);
                expect(navigator.clipboard).toBe(undefined);

                expect(await el.copy()).toBe(false);
                await nextFrame();
                expect(el.status).toBe('error');
            });
        });
    });

    describe('disabled', () => {
        useClipboard();

        it('disables the native button, and copies nothing', async () => {
            const el = await fixture(`<el-copy-button value="npm install" disabled="true"></el-copy-button>`);
            let events = 0;
            el.addEventListener(Events.COPY, () => events++);
            el.addEventListener(Events.ERROR, () => events++);

            expect(button(el).disabled).toBe(true);
            await press(el);
            expect(await el.copy()).toBe(false);

            expect(written).toEqual([]);
            expect(events).toBe(0);
            expect(el.status).toBe('idle');
        });

        it('copies again when it is enabled from a script', async () => {
            const el = await fixture(`<el-copy-button value="npm install" disabled="true"></el-copy-button>`);

            el.disabled = false;
            await nextFrame();
            expect(button(el).disabled).toBe(false);
            await press(el);
            expect(written).toEqual(['npm install']);
        });
    });

    describe('look', () => {
        const themed = async (markup, style = '') => {
            const wrapper = await fixture(
                `<div style="--el-control-height: 40px; font: 16px/24px sans-serif; color: rgb(0, 0, 255); ${style}">${markup}</div>`,
            );
            return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
        };

        it('is a square of the control height of its size, with an icon of one and a quarter of the text', async () => {
            const [small, medium, large] = await themed(`
                <el-copy-button value="a" size="small"></el-copy-button>
                <el-copy-button value="a"></el-copy-button>
                <el-copy-button value="a" size="large"></el-copy-button>
            `);

            expect(medium.getAttribute('size')).toBe('medium');
            expect([small, medium, large].map((el) => sizeOf(el))).toEqual([
                { width: 32, height: 32 },
                { width: 40, height: 40 },
                { width: 50, height: 50 },
            ]);
            expect([small, medium, large].map((el) => sizeOf(icon(el).querySelector('svg')))).toEqual([
                { width: 17.5, height: 17.5 },
                { width: 20, height: 20 },
                { width: 22.5, height: 22.5 },
            ]);
        });

        it('has no surface of its own, and the text colour', async () => {
            const [plain, withTheme] = [
                await themed(`<el-copy-button value="a"></el-copy-button>`),
                await themed(`<el-copy-button value="a"></el-copy-button>`, '--el-color-fg: rgb(1, 2, 3);'),
            ];

            expect(getComputedStyle(button(plain)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(getComputedStyle(button(plain)).borderTopWidth).toBe('0px');
            expect(getComputedStyle(button(plain)).color).toBe('rgb(0, 0, 255)');
            expect(getComputedStyle(button(withTheme)).color).toBe('rgb(1, 2, 3)');
        });

        describe('with an outcome', () => {
            useClipboard();

            it('paints the icon in the success and the danger colour of the theme', async () => {
                const [copied, failed] = await themed(
                    `
                        <el-copy-button value="a"></el-copy-button>
                        <el-copy-button></el-copy-button>
                    `,
                    '--el-color-success: rgb(0, 128, 0); --el-color-danger: rgb(255, 0, 0);',
                );
                expect(getComputedStyle(icon(copied)).color).toBe('rgb(0, 0, 255)');

                await press(copied);
                await press(failed);
                expect(getComputedStyle(icon(copied)).color).toBe('rgb(0, 128, 0)');
                expect(getComputedStyle(icon(failed)).color).toBe('rgb(255, 0, 0)');
            });

            it('keeps the text colour for the icon without a theme', async () => {
                const copied = await themed(`<el-copy-button value="a"></el-copy-button>`);

                await press(copied);
                expect(getComputedStyle(icon(copied)).color).toBe('rgb(0, 0, 255)');
            });
        });

        it('shows the focus of the keyboard with the ring of the theme', async () => {
            const el = await themed(
                `<el-copy-button value="a"></el-copy-button>`,
                '--el-color-focus-ring: rgb(9, 8, 7); --el-focus-ring-width: 3px; --el-focus-ring-offset: 1px;',
            );

            await forcePseudoClasses(button(el), ['focus-visible']);
            const { outlineColor, outlineStyle, outlineWidth, outlineOffset } = getComputedStyle(button(el));
            expect({ outlineColor, outlineStyle, outlineWidth, outlineOffset }).toEqual({
                outlineColor: 'rgb(9, 8, 7)',
                outlineStyle: 'solid',
                outlineWidth: '3px',
                outlineOffset: '1px',
            });
        });

        it('shows a tint of the text colour while it is pressed', async () => {
            const el = await themed(`<el-copy-button value="a"></el-copy-button>`);

            await forcePseudoClasses(button(el), ['active']);
            expect(getComputedStyle(button(el)).backgroundColor).toBe('color(srgb 0 0 1 / 0.24)');
        });

        it('is faded while it is disabled', async () => {
            const el = await themed(`<el-copy-button value="a" disabled="true"></el-copy-button>`);

            expect(getComputedStyle(button(el)).opacity).toBe('0.55');
            expect(getComputedStyle(button(el)).cursor).toBe('not-allowed');
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-copy-button hidden></el-copy-button>`);
            expect(getComputedStyle(el).display).toBe('none');
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('is at least --el-touch-target, in every size', async () => {
                const [small, medium, large] = await themed(
                    `
                        <el-copy-button value="a" size="small"></el-copy-button>
                        <el-copy-button value="a"></el-copy-button>
                        <el-copy-button value="a" size="large"></el-copy-button>
                    `,
                    '--el-touch-target: 44px;',
                );
                expect(matchMedia('(any-pointer: coarse)').matches).toBe(true);

                expect([small, medium, large].map((el) => sizeOf(button(el)))).toEqual([
                    { width: 44, height: 44 },
                    { width: 44, height: 44 },
                    { width: 50, height: 50 },
                ]);
            });

            it('keeps its sizes without the token', async () => {
                const small = await themed(`<el-copy-button value="a" size="small"></el-copy-button>`);
                expect(sizeOf(button(small))).toEqual({ width: 32, height: 32 });
            });
        });
    });

    it('has the button, its name and the live region in the server-rendered markup', async () => {
        const el = await fixture(`<el-copy-button value="npm install" label="Befehl kopieren"></el-copy-button>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<button\s/);
        expect(markup).toMatch(/\saria-label=['"]Befehl kopieren['"]/);
        expect(markup).toMatch(/\srole=['"]status['"]/);
        expect(markup).toMatch(/<slot name="copy-icon">/);
    });
});
