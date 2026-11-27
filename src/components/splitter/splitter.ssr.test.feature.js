import { describe, it, expect } from 'vite-plus/test';
import { accessibleName, accessibleRole, nextFrame } from '../../test-helpers.js';
import Splitter, { define } from './splitter.js';
import style from './splitter.style.js';

// These tests cover the time before the splitter is defined, so the element must not be registered
// up front. A subclass under another tag is only used to call `template()`, which gives the same
// markup the SSR renderer writes into a Declarative Shadow DOM. A server does not run the
// lifecycle, and neither does this: the source is never connected.
customElements.define('el-splitter-ssr-source', class extends Splitter {});

const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

/** A splitter as a server renders it, between two panes of a page. */
function serverRender(attributes, properties) {
    const source = document.createElement('el-splitter-ssr-source');
    Object.assign(source, source.properties(), properties);
    const template = source.template().toString();

    return `
        <div style="display: flex; height: 200px">
            <div id="pane" style="flex: none; width: ${properties.value}px">Pane</div>
            <el-splitter ${attributesOf(attributes)}><template shadowrootmode="open"><style>${style}</style>${template}</template></el-splitter>
            <div id="rest" style="flex: 1; min-width: 0">Rest</div>
        </div>
    `;
}

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-space-2: 8px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: 400px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper;
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const box = (origin, node) => {
    const from = origin.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - from.left, top - from.top, width, height].map((value) => Math.round(value * 10) / 10);
};

/** Where the splitter, its parts and the panes of the page are, and how the line is painted. */
function look(wrapper) {
    const el = wrapper.querySelector('el-splitter');
    const { borderLeftWidth, borderLeftColor } = getComputedStyle(part(el, 'line'));
    return {
        host: box(wrapper, el),
        parts: ['base', 'line'].map((name) => [name, box(wrapper, part(el, name))]),
        page: ['#pane', '#rest'].map((id) => [id, box(wrapper, wrapper.querySelector(id))]),
        paint: [borderLeftWidth, borderLeftColor],
    };
}

const kept = { label: 'List', value: '180', min: '100', max: '300' };
const keptProperties = { label: 'List', value: 180, min: 100, max: 300 };

// Order matters: the first tests run while the element is still undefined.
describe('Feature | Splitter | server-rendered', () => {
    it('is a line between the panes with the width the page has kept, before the element is defined', async () => {
        const wrapper = mount(serverRender(kept, keptProperties));
        const el = wrapper.querySelector('el-splitter');
        const separator = part(el, 'base');

        expect(customElements.get('el-splitter')).toBeUndefined();
        expect(box(wrapper, el)).toEqual([180, 0, 1, 200]);
        expect(box(wrapper, separator)).toEqual([176.5, 0, 8, 200]);
        expect(getComputedStyle(part(el, 'line')).borderLeftWidth).toBe('1px');
        // The separator is in the markup, with its name and its value.
        expect(await accessibleRole(separator)).toBe('separator');
        expect(await accessibleName(separator)).toBe('List');
        expect(separator.getAttribute('aria-valuenow')).toBe('180');
        expect(separator.getAttribute('aria-valuemin')).toBe('100');
        expect(separator.getAttribute('aria-valuemax')).toBe('300');
    });

    it('looks the same before and after the element takes over', async () => {
        const wrappers = [
            mount(serverRender(kept, keptProperties)),
            mount(serverRender({ ...kept, placement: 'start' }, { ...keptProperties, placement: 'start' })),
        ];
        const before = wrappers.map(look);

        define();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(wrappers.map(look));
        }

        expect(wrappers.every((wrapper) => wrapper.querySelector('el-splitter').matches(':state(connected)'))).toBe(
            true,
        );
        for (const after of seen) expect(after).toEqual(before);
        // And it has the width of the page as its own.
        expect(wrappers[0].querySelector('el-splitter').value).toBe(180);
    });
});
