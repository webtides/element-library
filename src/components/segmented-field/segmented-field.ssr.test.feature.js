import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { nextFrame } from '../../test-helpers.js';
import SegmentedField, { define } from './segmented-field.js';
import style from './segmented-field.style.js';

// These tests cover the time before `el-segmented-field` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer writes into the element, after the stylesheet of the element.
customElements.define('el-segmented-field-ssr-source', class extends SegmentedField {});

const options = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month', disabled: true },
];

function serverRender(properties) {
    const source = document.createElement('el-segmented-field-ssr-source');
    Object.assign(source, source.properties(), { name: 'view', label: 'Calendar', options, ...properties });
    const attributes = Object.entries({ name: 'view', label: 'Calendar', ...properties })
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');
    return `
        <form>
            <el-segmented-field ${attributes} options='${JSON.stringify(options)}'><style id="EL-SEGMENTED-FIELD0">${style}</style>${source.template().toString()}</el-segmented-field>
        </form>
    `;
}

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-4: 16px; --el-font-size-sm: 14px; --el-font-size-md: 16px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: 600px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-segmented-field');
}

const radios = (el) => [...el.querySelectorAll('input[type="radio"]')];
const segments = (el) => [...el.querySelectorAll('.segment')];

/** Where the legend and every option is, and how each option is painted. */
function look(el) {
    const box = (node) => {
        const { left, top, width, height } = node.getBoundingClientRect();
        return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
    };
    return {
        field: box(el),
        legend: box(el.querySelector('legend')),
        segments: segments(el).map((segment) => {
            const { backgroundColor, color, borderTopColor, borderTopLeftRadius, borderTopRightRadius, opacity } =
                getComputedStyle(segment);
            const ring = getComputedStyle(segment, '::before');
            return {
                box: box(segment),
                paint: [backgroundColor, color, borderTopColor, borderTopLeftRadius, borderTopRightRadius, opacity],
                ring: [ring.content, ring.borderTopWidth],
            };
        }),
        checked: radios(el).map((radio) => radio.checked),
    };
}

// Order matters: the first tests run while `el-segmented-field` is still undefined.
describe('Feature | SegmentedField | server-rendered', () => {
    it('is a row of joined options with the chosen one marked, before the element is defined', () => {
        const el = mount(serverRender({ value: 'week', size: 'small' }));
        const [day, week, month] = segments(el);

        expect(customElements.get('el-segmented-field')).toBeUndefined();
        expect(week.getBoundingClientRect().left).toBe(day.getBoundingClientRect().right - 1);
        expect(day.getBoundingClientRect().height).toBe(32);
        expect(getComputedStyle(day).borderTopLeftRadius).toBe('6px');
        expect(getComputedStyle(week).borderTopLeftRadius).toBe('0px');
        expect(getComputedStyle(week, '::before').borderTopWidth).toBe('2px');
        expect(getComputedStyle(day, '::before').content).toBe('none');
        expect(getComputedStyle(month).opacity).toBe('0.5');
        // The native radios are not shown.
        expect(getComputedStyle(radios(el)[0]).opacity).toBe('0');
    });

    it('submits its value before the element is defined, and takes a click and the arrow keys', async () => {
        const el = mount(serverRender({ value: 'week' }));
        const form = el.closest('form');

        expect(customElements.get('el-segmented-field')).toBeUndefined();
        expect(new FormData(form).get('view')).toBe('week');

        await userEvent.click(segments(el)[0]);
        expect(new FormData(form).get('view')).toBe('day');
        expect(getComputedStyle(segments(el)[0], '::before').borderTopWidth).toBe('2px');

        await userEvent.keyboard('{ArrowRight}');
        expect(new FormData(form).get('view')).toBe('week');
    });

    it('is required before the element is defined', () => {
        const el = mount(serverRender({ required: 'true' }));

        expect(customElements.get('el-segmented-field')).toBeUndefined();
        expect(el.closest('form').checkValidity()).toBe(false);
    });

    it('looks the same before and after the element takes over', async () => {
        const fields = [
            mount(serverRender({ value: 'week' })),
            mount(serverRender({ value: 'day', size: 'large' })),
            mount(serverRender({})),
        ];
        fields[0].scrollIntoView({ block: 'start' });
        const before = fields.map(look);

        define();
        const seen = [];
        for (let frame = 0; frame < 6; frame++) {
            await nextFrame();
            seen.push(fields.map(look));
        }

        expect(fields.every((el) => el.matches(':state(connected)'))).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
        // And it is the field now: a choice of the user is its value.
        await userEvent.click(segments(fields[0])[0]);
        await nextFrame();
        expect(fields[0].value).toBe('day');
        // One stylesheet for the element, the one the server wrote.
        expect(document.querySelectorAll('#EL-SEGMENTED-FIELD0').length).toBeGreaterThan(0);
        expect(fields[0].querySelectorAll('style').length).toBe(1);
    });
});
