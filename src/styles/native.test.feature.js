import { describe, it, expect, beforeAll, afterAll } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../test-helpers.js';
import theme from '../themes/default.css?raw';
import native from './native.css?raw';
import { define as defineInputField } from '../components/input-field/input-field.js';
import { define as definePasswordField } from '../components/password-field/password-field.js';
import { define as defineTextareaField } from '../components/textarea-field/textarea-field.js';
import { define as defineSelectField } from '../components/select-field/select-field.js';
import { define as defineAmountField } from '../components/amount-field/amount-field.js';
defineInputField();
definePasswordField();
defineTextareaField();
defineSelectField();
defineAmountField();

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

            expect(controls).toHaveLength(4);
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

        it('gives el-input-field and el-password-field three sizes', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-input-field name="native-small" label="Small" size="small"></el-input-field>
                    <el-input-field name="native-medium" label="Medium"></el-input-field>
                    <el-input-field name="native-large" label="Large" size="large"></el-input-field>
                    <el-password-field name="native-password-small" label="Small" size="small"></el-password-field>
                </div>
            `);
            const [small, medium, large, password] = [...wrapper.children].map((field) => field.querySelector('input'));

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
            const before = document.adoptedStyleSheets;
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
