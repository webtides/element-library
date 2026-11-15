import { describe, it, expect, beforeAll, afterAll } from 'vite-plus/test';
import { fixture, forcePseudoClasses, nextFrame, sizeOf, useTouchScreen } from '../test-helpers.js';
import theme from '../themes/default.css?raw';
import native from './native.css?raw';
import { define as defineInputField } from '../components/input-field/input-field.js';
import { define as definePasswordField } from '../components/password-field/password-field.js';
import { define as defineTextareaField } from '../components/textarea-field/textarea-field.js';
import { define as defineSelectField } from '../components/select-field/select-field.js';
import { define as defineAmountField } from '../components/amount-field/amount-field.js';
import { define as defineRangeField } from '../components/range-field/range-field.js';
import { define as defineFileField } from '../components/file-field/file-field.js';
import { define as defineOtpField } from '../components/otp-field/otp-field.js';
import { define as defineTagField } from '../components/tag-field/tag-field.js';
defineInputField();
definePasswordField();
defineTextareaField();
defineSelectField();
defineAmountField();
defineRangeField();
defineFileField();
defineOtpField();
defineTagField();

/** Loads stylesheets into the page for the tests of the surrounding `describe`. */
function useStyles(...sheets) {
    const nodes = [];
    beforeAll(() => {
        for (const text of sheets) {
            const style = document.createElement('style');
            style.textContent = text;
            document.head.append(style);
            nodes.push(style);
        }
    });
    afterAll(() => {
        for (const node of nodes) node.remove();
    });
}

// The minimum height is left out: in the row of a field its initial value reads `auto`.
const look = (control) => {
    const { borderTopWidth, borderTopStyle, borderTopColor, borderTopLeftRadius, paddingLeft } =
        getComputedStyle(control);
    return { borderTopWidth, borderTopStyle, borderTopColor, borderTopLeftRadius, paddingLeft };
};

// The values of the default theme in a light scheme.
const DECORATED = {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'rgb(209, 213, 219)',
    borderTopLeftRadius: '6px',
    paddingLeft: '12px',
};

const FIELDS = `
    <el-input-field name="native-input" label="Name"></el-input-field>
    <el-password-field name="native-password" label="Password"></el-password-field>
    <el-otp-field name="native-otp" label="Code"></el-otp-field>
    <el-tag-field name="native-tag" label="Skills"></el-tag-field>
    <el-textarea-field name="native-textarea" label="Message"></el-textarea-field>
    <el-select-field name="native-select" label="Size" options='["S", "M"]'></el-select-field>
`;

describe('Feature | Styles | native.css', () => {
    describe('with a theme alone', () => {
        useStyles(theme);

        it('leaves the control of a field with the look of the browser', async () => {
            const wrapper = await fixture(`<div style="color-scheme: light"><input type="text" />${FIELDS}</div>`);
            const [plain, ...inFields] = wrapper.querySelectorAll('input[type="text"], input[type="password"]');

            expect(look(plain).borderTopStyle).not.toBe('solid');
            for (const control of inFields) expect(look(control), control.outerHTML).toEqual(look(plain));
        });

        it('hides the chevron of el-select-field, the select has its own', async () => {
            const el = await fixture(
                `<el-select-field name="native-chevron-off" label="Size" options='["S", "M"]'></el-select-field>`,
            );
            expect(getComputedStyle(el.querySelector('.dropdown-indicator')).display).toBe('none');
            expect(getComputedStyle(el.querySelector('select')).appearance).not.toBe('none');
        });
    });

    describe('with a theme and native.css', () => {
        useStyles(theme, native);

        it('decorates the input, the textarea and the select of the fields with the tokens', async () => {
            const wrapper = await fixture(`<div style="color-scheme: light">${FIELDS}</div>`);
            const controls = wrapper.querySelectorAll('input, textarea, select');

            expect(controls).toHaveLength(6);
            for (const control of controls) expect(look(control), control.outerHTML).toEqual(DECORATED);
        });

        it('leaves native controls alone that are not in a field', async () => {
            const wrapper = await fixture(`
                <div style="color-scheme: light">
                    <input type="text" />
                    <textarea></textarea>
                    <select><option>a</option></select>
                    <input type="checkbox" />
                    <button>Send</button>
                </div>
            `);
            for (const control of wrapper.children) {
                expect(look(control).borderTopColor, control.outerHTML).not.toBe(DECORATED.borderTopColor);
                expect(look(control).borderTopLeftRadius, control.outerHTML).not.toBe(DECORATED.borderTopLeftRadius);
            }
        });

        it('does not reach into a shadow root', async () => {
            const el = await fixture(`<el-amount-field name="native-shadow" label="Amount"></el-amount-field>`);
            const input = el.shadowRoot.querySelector('input');
            // The field styles its input itself, without a border.
            expect(getComputedStyle(input).borderTopWidth).toBe('0px');
            expect(getComputedStyle(input).minHeight).not.toBe('40px');
        });

        // A reset in no cascade layer wins over every rule in a layer. That is why native.css is in none.
        it('keeps the look when the page has a reset, also one that is loaded later', async () => {
            const reset = document.createElement('style');
            reset.textContent = `
                *, ::before, ::after { border-width: 0; border-style: solid; border-color: rgb(229, 231, 235); }
                button, input, optgroup, select, textarea { padding: 0; margin: 0; font-size: 100%; color: inherit; }
            `;
            document.head.append(reset);
            try {
                const wrapper = await fixture(`<div style="color-scheme: light">${FIELDS}</div>`);
                for (const control of wrapper.querySelectorAll('input, textarea, select')) {
                    expect(look(control), control.outerHTML).toEqual(DECORATED);
                }
            } finally {
                reset.remove();
            }
        });

        it('marks a field that fails its validation', async () => {
            const el = await fixture(`
                <el-input-field name="native-invalid" label="Name" valid="false" touched="true"></el-input-field>
            `);
            expect(getComputedStyle(el.querySelector('input')).borderTopColor).not.toBe(DECORATED.borderTopColor);
        });

        it('shows one chevron on el-select-field: its own, in place of the native one', async () => {
            const el = await fixture(
                `<el-select-field name="native-chevron-on" label="Size" options='["S", "M"]'></el-select-field>`,
            );
            expect(getComputedStyle(el.querySelector('.dropdown-indicator')).display).toBe('flex');
            expect(getComputedStyle(el.querySelector('select')).appearance).toBe('none');
        });

        it('gives el-input-field, el-password-field, el-otp-field and el-tag-field three sizes', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-input-field name="native-small" label="Small" size="small"></el-input-field>
                    <el-input-field name="native-medium" label="Medium"></el-input-field>
                    <el-input-field name="native-large" label="Large" size="large"></el-input-field>
                    <el-password-field name="native-password-small" label="Small" size="small"></el-password-field>
                    <el-otp-field name="native-otp-small" label="Small" size="small"></el-otp-field>
                    <el-tag-field name="native-tag-small" label="Small" size="small"></el-tag-field>
                </div>
            `);
            const [small, medium, large, password, otp, tag] = [...wrapper.children].map((field) =>
                field.querySelector('input'),
            );

            expect([small, medium, large].map((input) => getComputedStyle(input).fontSize)).toEqual([
                '14px',
                '16px',
                '18px',
            ]);
            // 0.8, 1 and 1.25 times --el-control-height (40px)
            expect([small, medium, large].map((input) => getComputedStyle(input).minHeight)).toEqual([
                '32px',
                '40px',
                '50px',
            ]);
            expect(sizeOf(small).height).toBeLessThan(sizeOf(medium).height);
            expect(sizeOf(medium).height).toBeLessThan(sizeOf(large).height);
            expect(getComputedStyle(password).minHeight).toBe('32px');
            expect(getComputedStyle(otp).minHeight).toBe('32px');
            expect(sizeOf(otp).height).toBe(sizeOf(small).height);
            expect(getComputedStyle(tag).minHeight).toBe('32px');
            expect(sizeOf(tag).height).toBe(sizeOf(small).height);

            wrapper.children[1].size = 'large';
            await nextFrame();
            await nextFrame();
            expect(wrapper.children[1].getAttribute('size')).toBe('large');
            expect(getComputedStyle(medium).minHeight).toBe('50px');
        });
    });

    describe('the tokens of a theme', () => {
        it('give way to a token of the page that is in no layer, also when the theme is loaded after it', async () => {
            const own = document.createElement('style');
            own.textContent = `:root { --el-color-accent: rgb(1, 2, 3); }`;
            const themeStyle = document.createElement('style');
            themeStyle.textContent = theme;
            document.head.append(own, themeStyle);
            // element-js watches the page for new stylesheets and reads them a moment later. It has to
            // find them still in the page, so they are not taken out again before that.
            await nextFrame();
            try {
                expect(getComputedStyle(document.documentElement).getPropertyValue('--el-color-accent').trim()).toBe(
                    'rgb(1, 2, 3)',
                );
                // A token the page does not set comes from the theme.
                expect(getComputedStyle(document.documentElement).getPropertyValue('--el-radius-md').trim()).toBe(
                    '6px',
                );
            } finally {
                own.remove();
                themeStyle.remove();
            }
        });
    });

    // A range has no border and no padding to decorate: the file makes it as wide as its field and
    // gives it the accent colour of the theme.
    describe('the range of el-range-field', () => {
        const RANGES = `
            <input type="range" />
            <el-range-field name="native-range" label="Volume"></el-range-field>
            <el-range-field name="native-range-shown" label="Width" show-value="true"></el-range-field>
        `;
        const inPage = (markup) => fixture(`<div style="color-scheme: light; width: 320px">${markup}</div>`);
        const lookOfRange = (control) => {
            const { accentColor, marginLeft, marginTop } = getComputedStyle(control);
            return { accentColor, marginLeft, marginTop, width: sizeOf(control).width };
        };

        describe('with a theme alone', () => {
            useStyles(theme);

            it('keeps the look and the size of the browser', async () => {
                const wrapper = await inPage(RANGES);
                const [plain, ...inFields] = wrapper.querySelectorAll('input');

                expect(lookOfRange(plain).accentColor).toBe('auto');
                for (const control of inFields) expect(lookOfRange(control)).toEqual(lookOfRange(plain));
            });
        });

        describe('with a theme and native.css', () => {
            useStyles(theme, native);

            it('is as wide as its field and has the accent colour of the theme', async () => {
                const wrapper = await inPage(RANGES);
                await nextFrame();
                const [plain, alone, withValue] = wrapper.querySelectorAll('input');
                const value = wrapper.querySelector('.value');

                expect(lookOfRange(alone)).toEqual({
                    accentColor: 'rgb(37, 99, 235)',
                    marginLeft: '0px',
                    marginTop: '0px',
                    width: 320,
                });
                // Beside the shown value: the two and the gap of the row fill the field.
                expect(lookOfRange(withValue).accentColor).toBe('rgb(37, 99, 235)');
                expect(sizeOf(withValue).width + 8 + sizeOf(value).width).toBeCloseTo(320, 0);
                expect(sizeOf(value).width).toBeGreaterThan(0);
                // A range of the page that is in no field is left alone.
                expect(lookOfRange(plain).accentColor).toBe('auto');
                expect(lookOfRange(plain).width).toBeLessThan(320);
            });

            it('shows keyboard focus with the ring of the theme', async () => {
                const wrapper = await inPage(RANGES);
                const control = wrapper.querySelector('el-range-field input');

                await forcePseudoClasses(control, ['focus-visible']);

                const { outlineStyle, outlineWidth, outlineColor, outlineOffset } = getComputedStyle(control);
                expect({ outlineStyle, outlineWidth, outlineColor, outlineOffset }).toEqual({
                    outlineStyle: 'solid',
                    outlineWidth: '2px',
                    outlineColor: 'rgb(37, 99, 235)',
                    outlineOffset: '2px',
                });
            });

            it('keeps the look when the page has a reset', async () => {
                const reset = document.createElement('style');
                reset.textContent = `
                    *, ::before, ::after { border-width: 0; border-style: solid; border-color: rgb(229, 231, 235); }
                    button, input, optgroup, select, textarea { padding: 0; margin: 0; font-size: 100%; color: inherit; }
                `;
                document.head.append(reset);
                try {
                    const wrapper = await inPage(RANGES);
                    const control = wrapper.querySelector('el-range-field input');
                    expect(lookOfRange(control).accentColor).toBe('rgb(37, 99, 235)');
                    expect(lookOfRange(control).width).toBe(320);
                } finally {
                    reset.remove();
                }
            });
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            // Both orders: the stylesheets in front of the styles of the field, and after them.
            it('is at least --el-touch-target high, whichever stylesheet comes later', async () => {
                const heights = [];
                const styles = [theme, native].map((text) => {
                    const style = document.createElement('style');
                    style.textContent = text;
                    return style;
                });
                document.head.prepend(...styles);
                try {
                    const wrapper = await inPage(RANGES);
                    heights.push(sizeOf(wrapper.querySelector('el-range-field input')).height);
                } finally {
                    for (const style of styles) style.remove();
                }

                const sheets = [theme, native].map((text) => {
                    const sheet = new CSSStyleSheet();
                    sheet.replaceSync(text);
                    return sheet;
                });
                // A copy: the list of the document is a live one, and would be the new list after the next line.
                const before = [...document.adoptedStyleSheets];
                document.adoptedStyleSheets = [...before, ...sheets];
                try {
                    const wrapper = await inPage(RANGES);
                    heights.push(sizeOf(wrapper.querySelector('el-range-field input')).height);
                } finally {
                    document.adoptedStyleSheets = before;
                }

                // --el-touch-target of the default theme is 2.75rem
                expect(heights).toEqual([44, 44]);
            });
        });
    });

    // A file input is a button and a text in one control. The file gives the control the border of
    // the other fields, and the button the tokens of the theme.
    describe('the file input of el-file-field', () => {
        const FILES = `
            <input type="file" />
            <el-file-field name="native-file" label="CV"></el-file-field>
        `;
        const inPage = (markup) => fixture(`<div style="color-scheme: light; width: 320px">${markup}</div>`);
        const lookOfButton = (control) => {
            const {
                backgroundColor,
                color,
                borderTopWidth,
                paddingLeft,
                paddingTop,
                marginRight,
                borderTopLeftRadius,
            } = getComputedStyle(control, '::file-selector-button');
            return {
                backgroundColor,
                color,
                borderTopWidth,
                paddingLeft,
                paddingTop,
                marginRight,
                borderTopLeftRadius,
            };
        };
        // The values of the default theme in a light scheme.
        const BUTTON = {
            backgroundColor: 'rgb(243, 244, 246)',
            color: 'rgb(17, 24, 39)',
            borderTopWidth: '0px',
            paddingLeft: '8px',
            paddingTop: '0px',
            marginRight: '12px',
            borderTopLeftRadius: '2px',
        };

        describe('with a theme alone', () => {
            useStyles(theme);

            it('keeps the look and the size of the browser', async () => {
                const wrapper = await inPage(FILES);
                const [plain, inField] = wrapper.querySelectorAll('input');

                expect(look(plain).borderTopStyle).not.toBe('solid');
                expect(look(inField)).toEqual(look(plain));
                expect(lookOfButton(inField)).toEqual(lookOfButton(plain));
                expect(sizeOf(inField)).toEqual(sizeOf(plain));
            });
        });

        describe('with a theme and native.css', () => {
            useStyles(theme, native);

            it('has the border of the other fields, and its button the tokens of the theme', async () => {
                const wrapper = await inPage(FILES);
                const [plain, inField] = wrapper.querySelectorAll('input');

                expect(look(inField)).toEqual(DECORATED);
                expect(lookOfButton(inField)).toEqual(BUTTON);
                expect(sizeOf(inField).width).toBe(320);
                // A file input of the page that is in no field is left alone.
                expect(look(plain).borderTopStyle).not.toBe('solid');
                expect(lookOfButton(plain).backgroundColor).not.toBe(BUTTON.backgroundColor);
            });

            it('is as high as an el-input-field beside it, in the three sizes', async () => {
                const wrapper = await inPage(
                    ['small', 'medium', 'large']
                        .map(
                            (size) => `
                                <el-input-field name="native-file-input-${size}" label="Name" size="${size}"></el-input-field>
                                <el-file-field name="native-file-${size}" label="CV" size="${size}"></el-file-field>
                            `,
                        )
                        .join(''),
                );
                await nextFrame();
                const heights = (tag) =>
                    [...wrapper.querySelectorAll(`${tag} input`)].map((control) => sizeOf(control).height);

                expect(heights('el-file-field')).toEqual(heights('el-input-field'));
                expect(heights('el-file-field')).toEqual([32, 42, 53]);
            });

            it('shows focus and a failed validation as the other fields do', async () => {
                const wrapper = await inPage(`
                    <el-input-field name="native-file-focus-input" label="Name"></el-input-field>
                    <el-file-field name="native-file-focus" label="CV"></el-file-field>
                    <el-file-field name="native-file-invalid" label="CV" valid="false" touched="true"></el-file-field>
                `);
                const [input, focused, invalid] = wrapper.querySelectorAll('input');
                // The ring comes with a transition: without it the end is there at once.
                for (const control of [input, focused]) control.style.transition = 'none';
                const ring = (control) => {
                    const { borderTopColor, boxShadow, outlineStyle } = getComputedStyle(control);
                    return { borderTopColor, boxShadow, outlineStyle };
                };

                // A second forced state takes the first one away, so each is read in its turn.
                await forcePseudoClasses(input, ['focus']);
                const ringOfInput = ring(input);
                await forcePseudoClasses(focused, ['focus']);

                expect(ring(focused)).toEqual(ringOfInput);
                expect(ring(focused).borderTopColor).toBe('rgb(37, 99, 235)');
                expect(ring(focused).boxShadow).not.toBe('none');
                // --el-color-danger of the default theme
                expect(getComputedStyle(invalid).borderTopColor).toBe('rgb(220, 38, 38)');
            });

            // A reset of the page that comes later, the button of a file input included.
            it('keeps the look when the page has a reset', async () => {
                const reset = document.createElement('style');
                reset.textContent = `
                    *, ::before, ::after, ::file-selector-button { margin: 0; padding: 0; border: 0 solid rgb(229, 231, 235); }
                    button, input, optgroup, select, textarea, ::file-selector-button { font-size: 100%; color: inherit; background: transparent; }
                `;
                document.head.append(reset);
                try {
                    const wrapper = await inPage(FILES);
                    const control = wrapper.querySelector('el-file-field input');
                    expect(look(control)).toEqual(DECORATED);
                    expect(lookOfButton(control)).toEqual(BUTTON);
                } finally {
                    reset.remove();
                }
            });
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            // Both orders: the stylesheets in front of the styles of the field, and after them.
            it('is at least --el-touch-target high, whichever stylesheet comes later', async () => {
                const heights = [];
                const styles = [theme, native].map((text) => {
                    const style = document.createElement('style');
                    style.textContent = text;
                    return style;
                });
                document.head.prepend(...styles);
                try {
                    const wrapper = await inPage(FILES);
                    heights.push(sizeOf(wrapper.querySelector('el-file-field input')).height);
                } finally {
                    for (const style of styles) style.remove();
                }

                const sheets = [theme, native].map((text) => {
                    const sheet = new CSSStyleSheet();
                    sheet.replaceSync(text);
                    return sheet;
                });
                // A copy: the list of the document is a live one, and would be the new list after the next line.
                const before = [...document.adoptedStyleSheets];
                document.adoptedStyleSheets = [...before, ...sheets];
                try {
                    const wrapper = await inPage(FILES);
                    heights.push(sizeOf(wrapper.querySelector('el-file-field input')).height);
                } finally {
                    document.adoptedStyleSheets = before;
                }

                // --el-touch-target of the default theme is 2.75rem
                expect(heights).toEqual([44, 44]);
            });
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        // A stylesheet a page adopts comes after the styles of the fields in the cascade. The minimum
        // height of the theme used to win there over the touch rule of the field.
        it('keeps the controls at least --el-touch-target high when the stylesheets come after the fields', async () => {
            const sheets = [theme, native].map((text) => {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(text);
                return sheet;
            });
            // A copy: the list of the document is a live one, and would be the new list after the next line.
            const before = [...document.adoptedStyleSheets];
            document.adoptedStyleSheets = [...before, ...sheets];
            try {
                const wrapper = await fixture(`<div>${FIELDS}</div>`);
                // --el-touch-target of the default theme is 2.75rem
                for (const control of wrapper.querySelectorAll('input, select')) {
                    expect(sizeOf(control).height, control.outerHTML).toBeGreaterThanOrEqual(44);
                }
            } finally {
                document.adoptedStyleSheets = before;
            }
        });
    });
});
