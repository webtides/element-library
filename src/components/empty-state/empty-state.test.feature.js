import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf } from '../../test-helpers.js';
import { define } from './empty-state.js';
define();

const regions = ['icon', 'heading', 'message', 'action'];
const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const shown = (el) => regions.filter((name) => getComputedStyle(part(el, name)).display !== 'none');
const round = (number) => Math.round(number * 10) / 10;
// Where the middle of an element is, counted from the left edge of another.
const middle = (element, from) => {
    const { left, width } = element.getBoundingClientRect();
    return round(left + width / 2 - from.getBoundingClientRect().left);
};
// How far the top of an element is below the bottom of another.
const below = (element, other) => round(element.getBoundingClientRect().top - other.getBoundingClientRect().bottom);
// What a theme provides. The text has lines of 20px, so the heights below can be counted.
const tokens = `
    --el-color-fg: rgb(10, 10, 10);
    --el-color-fg-muted: rgb(100, 100, 100);
    --el-space-2: 8px;
    --el-space-4: 16px;
    --el-space-5: 24px;
    width: 800px;
    font: 16px/20px sans-serif;
    color: rgb(0, 0, 200);
`;
const themed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${tokens} ${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};
const full = `
    <svg slot="icon" width="40" height="40" aria-hidden="true"><rect width="40" height="40" /></svg>
    <span slot="heading">No projects</span>
    <span>Create your first project.</span>
    <span slot="action">Create</span>
`;

describe('Feature | EmptyState', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-empty-state>Nothing here yet.</el-empty-state>`);
        await nextFrame();
    });

    it('shows its message, and is no more than that for assistive technology', async () => {
        const el = await fixture(`<el-empty-state>Nothing here yet.</el-empty-state>`);
        expect(part(el, 'message').querySelector('slot').assignedNodes()[0].textContent).toBe('Nothing here yet.');
        expect(getComputedStyle(el).display).toBe('block');
        expect(el.hasAttribute('role')).toBe(false);
        expect(part(el, 'base').hasAttribute('role')).toBe(false);
    });

    describe('regions', () => {
        it('is its message alone when nothing else is slotted', async () => {
            const el = await themed(`<el-empty-state>Nothing here yet.</el-empty-state>`);

            expect(shown(el)).toEqual(['message']);
            // One line of text and the padding above and below it.
            expect(sizeOf(el).height).toBe(24 + 20 + 24);
        });

        it('puts icon, heading, message and action below each other, whatever the order of the children', async () => {
            const el = await themed(`
                <el-empty-state>
                    <span slot="action">Create</span>
                    <span>Create your first project.</span>
                    <span slot="heading">No projects</span>
                    <svg slot="icon" width="40" height="40" aria-hidden="true"><rect width="40" height="40" /></svg>
                </el-empty-state>
            `);

            expect(shown(el)).toEqual(regions);
            const tops = regions.map((name) => part(el, name).getBoundingClientRect().top);
            expect(tops).toEqual([...tops].sort((a, b) => a - b));
            expect(new Set(tops).size).toBe(4);
        });

        it('shows a region when an element comes into it, and leaves it out when that element goes', async () => {
            const el = await themed(`<el-empty-state>Nothing here yet.</el-empty-state>`);
            const height = sizeOf(el).height;

            const action = Object.assign(document.createElement('span'), { slot: 'action', textContent: 'Create' });
            el.append(action);
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['message', 'action']);
            expect(sizeOf(el).height).toBe(height + 16 + 20);

            action.remove();
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['message']);
            expect(sizeOf(el).height).toBe(height);
        });

        it('follows an element that changes its slot', async () => {
            const el = await themed(
                `<el-empty-state>Nothing here yet.<span slot="heading">Empty</span></el-empty-state>`,
            );
            const item = el.querySelector('span');
            expect(shown(el)).toEqual(['heading', 'message']);

            item.slot = 'action';
            await nextFrame();
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['message', 'action']);
        });

        it('leaves the same regions out in the server-rendered markup', async () => {
            const el = await fixture(
                `<el-empty-state><span slot="heading">Empty</span>Nothing here yet.</el-empty-state>`,
            );
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el.template().toString();

            expect(markup).toMatch(/<div part="icon" hidden=""><slot name="icon"><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="heading"\s*><slot name="heading"><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="message"><slot><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="action" hidden=""><slot name="action"><\/slot><\/div>/);
        });

        it('takes over a server-rendered empty state as it is', async () => {
            // The markup the SSR renderer writes: the template of the element as a Declarative Shadow
            // DOM, rendered with the children the element has in the page.
            const children = `<span slot="heading">Empty</span>Nothing here yet.`;
            const source = document.createElement('el-empty-state');
            source.innerHTML = children;
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(`
                <el-empty-state>
                    <template shadowrootmode="open">${source.template().toString()}</template>
                    ${children}
                </el-empty-state>
            `);
            const el = wrapper.querySelector('el-empty-state');
            const server = { base: part(el, 'base'), shown: shown(el) };
            await nextFrame();
            await nextFrame();

            expect(server.shown).toEqual(['heading', 'message']);
            expect(shown(el)).toEqual(['heading', 'message']);
            expect(part(el, 'base')).toBe(server.base);
            wrapper.remove();
        });
    });

    describe('layout', () => {
        it('stands in the middle of its place, in a column no wider than a text can be read', async () => {
            const [wide, narrow] = await themed(
                `<el-empty-state>${full}</el-empty-state>
                <el-empty-state style="width: 300px">${full}</el-empty-state>`,
            );

            expect(sizeOf(wide).width).toBe(800);
            expect(sizeOf(part(wide, 'base')).width).toBe(480);
            expect(middle(part(wide, 'base'), wide)).toBe(400);
            for (const child of wide.children) {
                expect(middle(child, wide), child.slot || 'message').toBe(400);
            }
            // In a narrow place it is as wide as that.
            expect(sizeOf(part(narrow, 'base')).width).toBe(300);
        });

        it('has the icon in the middle also when the page makes it a block', async () => {
            const el = await themed(`
                <el-empty-state>
                    <svg slot="icon" width="40" height="40" style="display: block" aria-hidden="true"></svg>
                    Nothing here yet.
                </el-empty-state>
            `);
            expect(middle(el.querySelector('svg'), el)).toBe(400);
        });

        it('has a small gap between its regions, and a larger one above the action', async () => {
            const el = await themed(`<el-empty-state>${full}</el-empty-state>`);

            expect(below(part(el, 'heading'), part(el, 'icon'))).toBe(8);
            expect(below(part(el, 'message'), part(el, 'heading'))).toBe(8);
            expect(below(part(el, 'action'), part(el, 'message'))).toBe(16);
            // The padding, an icon of 40px, three lines of text and the gaps.
            expect(sizeOf(el).height).toBe(24 + 40 + 8 + 20 + 8 + 20 + 16 + 20 + 24);
            expect(getComputedStyle(part(el, 'base')).paddingLeft).toBe('16px');
        });

        it('leaves no gap for a message that is not there', async () => {
            const el = await themed(`
                <el-empty-state>
                    <span slot="heading">No results</span>
                    <span slot="action">Reset the filter</span>
                </el-empty-state>
            `);

            expect(sizeOf(part(el, 'message')).height).toBe(0);
            expect(below(part(el, 'action'), part(el, 'heading'))).toBe(16);
            expect(sizeOf(el).height).toBe(24 + 20 + 16 + 20 + 24);
        });

        it('keeps a message with a link in it in one line', async () => {
            const el = await themed(
                `<el-empty-state>Nothing here yet. <a href="#help">Read how to start</a></el-empty-state>`,
            );

            expect(getComputedStyle(el.querySelector('a')).display).toBe('inline');
            expect(sizeOf(part(el, 'message')).height).toBe(20);
        });

        it('lines several actions up in the middle, with a gap, and wraps them', async () => {
            const box = (width) =>
                `<span slot="action" style="display: block; width: ${width}px; height: 20px"></span>`;
            const [el, narrow] = await themed(`
                <el-empty-state>Nothing here yet.${box(100)}${box(60)}</el-empty-state>
                <el-empty-state style="width: 232px">Nothing here yet.${box(96)}${box(96)}${box(60)}</el-empty-state>
            `);
            const rects = (host) =>
                [...host.querySelectorAll('[slot="action"]')].map((item) => item.getBoundingClientRect());

            const [first, second] = rects(el);
            expect(second.left - first.right).toBe(8);
            expect(second.top).toBe(first.top);
            expect(round((first.left + second.right) / 2 - el.getBoundingClientRect().left)).toBe(400);

            // 96 + 8 + 96 fill the 200px between the paddings of a place of 232px, the third does not fit.
            const [one, two, three] = rects(narrow);
            expect(two.top).toBe(one.top);
            expect(three.top).toBe(one.bottom + 8);
            expect(middle(narrow.querySelectorAll('[slot="action"]')[2], narrow)).toBe(116);
        });

        it('takes the margins of the browser off what is slotted', async () => {
            const el = await themed(`
                <el-empty-state>
                    <h3 slot="heading">No projects</h3>
                    <p>Create your first project.</p>
                </el-empty-state>
            `);

            expect(getComputedStyle(el.querySelector('h3')).margin).toBe('0px');
            expect(getComputedStyle(el.querySelector('p')).margin).toBe('0px');
        });
    });

    describe('colours', () => {
        it('has its message in the muted text colour and its heading in the text colour, semibold', async () => {
            const el = await themed(`<el-empty-state>${full}</el-empty-state>`);
            const [icon, heading, message, action] = el.children;

            expect(getComputedStyle(message).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(icon).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(action).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(heading).color).toBe('rgb(10, 10, 10)');
            expect(getComputedStyle(heading).fontWeight).toBe('600');
            expect(getComputedStyle(message).fontWeight).toBe('400');
        });

        it('paints no surface', async () => {
            const el = await themed(`<el-empty-state>${full}</el-empty-state>`);
            const { backgroundColor, borderTopWidth, boxShadow } = getComputedStyle(part(el, 'base'));

            expect({ backgroundColor, borderTopWidth, boxShadow }).toEqual({
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderTopWidth: '0px',
                boxShadow: 'none',
            });
        });

        it('has the text colour of where it stands without a theme, and keeps its layout', async () => {
            const wrapper = await fixture(`
                <div style="width: 800px; font: 16px/20px sans-serif; color: rgb(0, 0, 200)">
                    <el-empty-state>${full}</el-empty-state>
                </div>
            `);
            const el = wrapper.firstElementChild;
            const [, heading, message] = el.children;

            expect(getComputedStyle(message).color).toBe('rgb(0, 0, 200)');
            expect(getComputedStyle(heading).color).toBe('rgb(0, 0, 200)');
            expect(middle(message, el)).toBe(400);
            // The same as with the tokens above: they have the values of the fallbacks.
            expect(sizeOf(el).height).toBe(24 + 40 + 8 + 20 + 8 + 20 + 16 + 20 + 24);
        });

        it('takes its spacing from the tokens of the theme', async () => {
            const el = await themed(
                `<el-empty-state>${full}<span slot="action">Import</span></el-empty-state>`,
                '--el-space-2: 4px; --el-space-4: 10px; --el-space-5: 30px;',
            );
            const [create, other] = [...el.querySelectorAll('[slot="action"]')].map((item) =>
                item.getBoundingClientRect(),
            );

            expect(sizeOf(el).height).toBe(30 + 40 + 4 + 20 + 4 + 20 + 10 + 20 + 30);
            expect(getComputedStyle(part(el, 'base')).paddingLeft).toBe('10px');
            expect(round(other.left - create.right)).toBe(4);
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-empty-state hidden>Nothing here yet.</el-empty-state>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('has no detectable a11y violations', async () => {
        const wrapper = await fixture(`
            <div style="${tokens} background: rgb(255, 255, 255)">
                <el-empty-state>
                    <svg slot="icon" width="40" height="40" aria-hidden="true"><rect width="40" height="40" /></svg>
                    <h3 slot="heading">No projects</h3>
                    <p>Create your first project.</p>
                    <button slot="action" type="button">Create a project</button>
                </el-empty-state>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
