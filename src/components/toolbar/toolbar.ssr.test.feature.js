import { describe, it, expect } from 'vite-plus/test';
import { accessibleName, accessibleRole, nextFrame } from '../../test-helpers.js';
import Toolbar, { define } from './toolbar.js';
import Button, { define as defineButton } from '../button/button.js';
import SegmentedField, { define as defineSegmentedField } from '../segmented-field/segmented-field.js';
import toolbarStyle from './toolbar.style.js';
import buttonStyle from '../button/button.style.js';
import segmentedStyle from '../segmented-field/segmented-field.style.js';

// These tests cover the time before the toolbar and its controls are defined, so the elements must
// not be registered up front. Subclasses under other tags are only used to call `template()`,
// which gives the same markup the SSR renderer writes: into a Declarative Shadow DOM for the
// toolbar and the buttons, into the element for the field. A server does not run the lifecycle,
// and neither do these: they are never connected.
customElements.define('el-toolbar-ssr-source', class extends Toolbar {});
customElements.define('el-button-ssr-source', class extends Button {});
customElements.define('el-segmented-field-ssr-source', class extends SegmentedField {});

const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

/** The template of an element with these attributes and children, as a server renders it. */
function templateOf(tag, attributes, properties, children = '') {
    const source = document.createElement(`${tag}-ssr-source`);
    for (const [name, value] of Object.entries(attributes)) source.setAttribute(name, value);
    source.innerHTML = children;
    Object.assign(source, source.properties(), properties);
    return source.template().toString();
}

const shadow = (style, template) => `<template shadowrootmode="open"><style>${style}</style>${template}</template>`;

function button(attributes, properties, content) {
    const template = templateOf('el-button', attributes, properties);
    return `<el-button ${attributesOf(attributes)}>${shadow(buttonStyle, template)}${content}</el-button>`;
}

function serverRender(toolbarAttributes) {
    const options = ['List', 'Board'];
    const field = { name: 'view', label: 'View', value: 'List' };
    const children = `
        ${button({ id: 'reply' }, {}, 'Reply')}
        ${button({ id: 'send', variant: 'brand' }, { variant: 'brand' }, 'Send')}
        ${button({ id: 'star', toggle: 'true', pressed: 'true' }, { toggle: true, pressed: true }, 'Star')}
        ${button({ id: 'own', size: 'large', appearance: 'filled' }, { size: 'large', appearance: 'filled' }, 'Own')}
        <el-segmented-field ${attributesOf(field)} options='${JSON.stringify(options)}'><style id="EL-SEGMENTED-FIELD0">${segmentedStyle}</style>${templateOf('el-segmented-field', field, { ...field, options })}</el-segmented-field>
        ${button({ id: 'more', slot: 'end', circle: 'true', 'aria-label': 'More' }, { circle: true }, 'm')}
    `;
    const template = templateOf('el-toolbar', toolbarAttributes, toolbarAttributes, children);
    return `<el-toolbar ${attributesOf(toolbarAttributes)}>${shadow(toolbarStyle, template)}${children}</el-toolbar>`;
}

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px; --el-space-5: 24px;
        --el-font-size-sm: 14px; --el-font-size-md: 16px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10);
        --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
        --el-color-accent: rgb(0, 0, 200);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: 700px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-toolbar');
}

const control = (el, id) => el.querySelector(`#${id}`).shadowRoot.querySelector('[part="base"]');
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** Where every control is and how it is painted. */
function look(el) {
    const box = (node) => {
        const { left, top, width, height } = node.getBoundingClientRect();
        return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
    };
    const paint = (node) => {
        const { backgroundColor, borderTopColor, color, fontSize } = getComputedStyle(node);
        return [backgroundColor, borderTopColor, color, fontSize];
    };
    return {
        toolbar: box(el),
        buttons: [...el.querySelectorAll('el-button')].map((button) => {
            const base = button.shadowRoot.querySelector('[part="base"]');
            return {
                id: button.id,
                box: box(base),
                paint: paint(base),
                ring: getComputedStyle(base, '::before').content,
            };
        }),
        segments: [...el.querySelectorAll('.segment')].map((segment) => ({ box: box(segment), paint: paint(segment) })),
    };
}

// Order matters: the first tests run while the elements are still undefined.
describe('Feature | Toolbar | server-rendered', () => {
    it('is a toolbar with its name before the element is defined', async () => {
        const el = mount(serverRender({ label: 'Message' }));
        const base = el.shadowRoot.querySelector('[part="base"]');

        expect(customElements.get('el-toolbar')).toBeUndefined();
        expect(await accessibleRole(base)).toBe('toolbar');
        expect(await accessibleName(base)).toBe('Message');
        // The tooltips come with the script.
        expect(el.shadowRoot.querySelector('el-tooltip')).toBeNull();
    });

    it('gives its controls its size and its appearance before any element is defined', () => {
        const el = mount(serverRender({ label: 'Message', size: 'small', appearance: 'outlined' }));
        const paint = (id) => {
            const { backgroundColor, borderTopColor, color } = getComputedStyle(control(el, id));
            return [backgroundColor, borderTopColor, color];
        };
        const height = (id) => control(el, id).getBoundingClientRect().height;

        expect(customElements.get('el-button')).toBeUndefined();
        expect(customElements.get('el-segmented-field')).toBeUndefined();
        expect(height('reply')).toBe(32);
        expect(el.querySelector('.segment').getBoundingClientRect().height).toBe(32);
        expect(control(el, 'more').getBoundingClientRect().width).toBe(32);
        expect(paint('reply')).toEqual([TRANSPARENT, 'rgb(150, 150, 150)', 'rgb(10, 10, 10)']);
        expect(paint('send')).toEqual([TRANSPARENT, 'rgb(0, 0, 200)', 'rgb(0, 0, 200)']);
        // A control that names its own keeps it.
        expect(height('own')).toBe(53);
        expect(paint('own')).toEqual(['rgb(230, 230, 230)', 'rgb(150, 150, 150)', 'rgb(10, 10, 10)']);
        // The group at the end is at the end.
        expect(Math.round(control(el, 'more').getBoundingClientRect().right)).toBe(
            Math.round(el.getBoundingClientRect().right),
        );
    });

    it('is plain without an appearance attribute, before the element is defined', () => {
        const el = mount(serverRender({ label: 'Message' }));
        const { backgroundColor, borderTopColor } = getComputedStyle(control(el, 'reply'));

        expect(customElements.get('el-toolbar')).toBeUndefined();
        expect(el.hasAttribute('appearance')).toBe(false);
        expect([backgroundColor, borderTopColor]).toEqual([TRANSPARENT, TRANSPARENT]);
    });

    it('looks the same before and after the elements take over', async () => {
        const toolbars = [
            mount(serverRender({ label: 'Message' })),
            mount(serverRender({ label: 'Message', size: 'small', appearance: 'outlined' })),
            mount(serverRender({ label: 'Message', size: 'large', appearance: 'filled' })),
        ];
        toolbars[0].scrollIntoView({ block: 'start' });
        const before = toolbars.map(look);

        defineButton();
        defineSegmentedField();
        define();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(toolbars.map(look));
        }

        expect(toolbars.every((el) => el.matches(':state(connected)'))).toBe(true);
        expect([...toolbars[0].querySelectorAll('el-button')].every((el) => el.matches(':state(connected)'))).toBe(
            true,
        );
        for (const after of seen) expect(after).toEqual(before);

        // The defaults are on the elements now, and say nothing about the look.
        expect(toolbars[1].querySelector('#reply').getAttribute('size')).toBe('medium');
        expect(toolbars[1].querySelector('#reply').getAttribute('appearance')).toBe('filled');
        // And the script has brought the tooltip of the button with an icon alone.
        expect(toolbars[0].shadowRoot.querySelector('el-tooltip').textContent.trim()).toBe('More');
    });
});
