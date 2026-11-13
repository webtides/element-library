import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, sizeOf } from '../../test-helpers.js';
import { define } from './card.js';
define();

const regions = ['media', 'header', 'body', 'footer'];
const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const shown = (el) => regions.filter((name) => getComputedStyle(part(el, name)).display !== 'none');
const paint = (el) => {
    const { backgroundColor, borderTopWidth, borderTopColor, boxShadow, color } = getComputedStyle(part(el, 'base'));
    return {
        background: backgroundColor,
        border: `${borderTopWidth} ${borderTopColor}`,
        shadow: boxShadow,
        text: color,
    };
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
// What a theme provides. The text has lines of 20px, so the heights below can be counted.
const tokens = `
    --el-color-bg: rgb(255, 255, 255);
    --el-color-bg-muted: rgb(240, 240, 240);
    --el-color-fg: rgb(10, 10, 10);
    --el-color-border: rgb(200, 200, 200);
    --el-border-width: 1px;
    --el-radius-lg: 12px;
    --el-space-2: 8px;
    --el-space-4: 16px;
    --el-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    width: 300px;
    font: 16px/20px sans-serif;
    color: rgb(90, 90, 90);
`;
const themed = async (cards) => {
    const wrapper = await fixture(`<div style="${tokens}">${cards}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};
// An image of 600 by 400, three to two.
const image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='teal'/%3E%3C/svg%3E`;

describe('Feature | Card', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-card>Body</el-card>`);
        await nextFrame();
    });

    it('shows its content, and is no more than a container for assistive technology', async () => {
        const el = await fixture(`<el-card>Body</el-card>`);
        expect(part(el, 'body').querySelector('slot').assignedNodes()[0].textContent).toBe('Body');
        expect(getComputedStyle(el).display).toBe('block');
        expect(el.hasAttribute('role')).toBe(false);
        expect(part(el, 'base').hasAttribute('role')).toBe(false);
    });

    describe('regions', () => {
        it('is its body alone when nothing else is slotted', async () => {
            const el = await themed(`<el-card>Body</el-card>`);

            expect(shown(el)).toEqual(['body']);
            // One line of text, the padding around it, the border.
            expect(sizeOf(el).height).toBe(1 + 16 + 20 + 16 + 1);
        });

        it('puts media, header, body and footer below each other, whatever the order of the children', async () => {
            const el = await themed(`
                <el-card>
                    <span slot="footer">Footer</span>
                    Body
                    <span slot="header">Header</span>
                    <div slot="media" style="height: 50px"></div>
                </el-card>
            `);

            expect(shown(el)).toEqual(regions);
            const tops = regions.map((name) => part(el, name).getBoundingClientRect().top);
            expect(tops).toEqual([...tops].sort((a, b) => a - b));
            expect(new Set(tops).size).toBe(4);
        });

        it('shows a region when an element comes into it, and leaves it out when that element goes', async () => {
            const el = await themed(`<el-card>Body</el-card>`);
            const height = sizeOf(el).height;

            const title = Object.assign(document.createElement('span'), { slot: 'header', textContent: 'Title' });
            el.append(title);
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['header', 'body']);
            expect(sizeOf(el).height).toBeGreaterThan(height);

            title.remove();
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['body']);
            expect(sizeOf(el).height).toBe(height);
        });

        it('follows an element that changes its slot', async () => {
            const el = await themed(`<el-card>Body<span slot="header">Note</span></el-card>`);
            const note = el.querySelector('span');
            expect(shown(el)).toEqual(['header', 'body']);

            note.slot = 'footer';
            await nextFrame();
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['body', 'footer']);

            note.removeAttribute('slot');
            await nextFrame();
            await nextFrame();
            await nextFrame();
            expect(shown(el)).toEqual(['body']);
        });

        it('leaves the same regions out in the server-rendered markup', async () => {
            const el = await fixture(`<el-card><span slot="header">Title</span>Body</el-card>`);
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el.template().toString();

            expect(markup).toMatch(/<div part="media" hidden=""><slot name="media"><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="header"\s*><slot name="header"><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="body"><slot><\/slot><\/div>/);
            expect(markup).toMatch(/<div part="footer" hidden=""><slot name="footer"><\/slot><\/div>/);
        });

        it('takes over a server-rendered card as it is', async () => {
            // The markup the SSR renderer writes: the template of the element as a Declarative Shadow
            // DOM, rendered with the children the element has in the page.
            const children = `<span slot="header">Title</span>Body`;
            const source = document.createElement('el-card');
            Object.assign(source, source.properties());
            source.innerHTML = children;
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(`
                <el-card>
                    <template shadowrootmode="open">${source.template().toString()}</template>
                    ${children}
                </el-card>
            `);
            const el = wrapper.querySelector('el-card');
            const server = { base: part(el, 'base'), shown: shown(el) };
            await nextFrame();
            await nextFrame();

            expect(server.shown).toEqual(['header', 'body']);
            expect(shown(el)).toEqual(['header', 'body']);
            expect(part(el, 'base')).toBe(server.base);
            wrapper.remove();
        });
    });

    describe('appearance', () => {
        it('is outlined by default, and says so on the host', async () => {
            const el = await fixture(`<el-card>Body</el-card>`);
            expect(el.appearance).toBe('outlined');
            expect(el.getAttribute('appearance')).toBe('outlined');
        });

        it('is a surface in the background of the page, with a border, round corners and a shadow', async () => {
            const el = await themed(`<el-card>Body</el-card>`);

            expect(paint(el)).toEqual({
                background: 'rgb(255, 255, 255)',
                border: '1px rgb(200, 200, 200)',
                shadow: 'rgba(0, 0, 0, 0.08) 0px 4px 12px 0px',
                text: 'rgb(10, 10, 10)',
            });
            expect(getComputedStyle(part(el, 'base')).borderRadius).toBe('12px');
        });

        it('has a muted fill as filled, and is the same apart from that', async () => {
            const [outlined, filled] = await themed(`
                <el-card>Body</el-card>
                <el-card appearance="filled">Body</el-card>
            `);

            expect(paint(filled)).toEqual({ ...paint(outlined), background: 'rgb(240, 240, 240)' });
            expect(sizeOf(filled)).toEqual(sizeOf(outlined));
        });

        it('paints nothing as plain, and keeps the text colour of where it stands', async () => {
            const el = await themed(`<el-card appearance="plain">Body</el-card>`);

            expect(paint(el)).toMatchObject({ background: TRANSPARENT, shadow: 'none', text: 'rgb(90, 90, 90)' });
            // No border at all: forced colours paint a transparent one.
            expect(getComputedStyle(part(el, 'base')).borderTopStyle).toBe('none');
            expect(sizeOf(el).height).toBe(16 + 20 + 16);
        });

        it('takes an appearance set from a script', async () => {
            const el = await themed(`<el-card>Body</el-card>`);

            el.appearance = 'filled';
            await nextFrame();

            expect(el.getAttribute('appearance')).toBe('filled');
            expect(paint(el).background).toBe('rgb(240, 240, 240)');
        });

        it('paints an appearance it does not know like the default', async () => {
            const [outlined, unknown] = await themed(`
                <el-card>Body</el-card>
                <el-card appearance="elevated">Body</el-card>
            `);
            expect(paint(unknown)).toEqual(paint(outlined));
        });

        it('paints nothing without a theme, in any appearance', async () => {
            const wrapper = await fixture(`
                <div style="width: 300px; font: 16px/20px sans-serif">
                    <el-card>Body</el-card>
                    <el-card appearance="filled">Body</el-card>
                    <el-card appearance="plain">Body</el-card>
                </div>
            `);

            for (const el of wrapper.children) {
                const { backgroundColor, borderTopWidth, borderRadius, boxShadow } = getComputedStyle(part(el, 'base'));
                expect({ backgroundColor, borderTopWidth, borderRadius, boxShadow }, el.appearance).toEqual({
                    backgroundColor: TRANSPARENT,
                    borderTopWidth: '0px',
                    borderRadius: '0px',
                    boxShadow: 'none',
                });
                // The regions keep a padding of their own.
                expect(sizeOf(el).height, el.appearance).toBe(16 + 20 + 16);
            }
        });
    });

    describe('spacing', () => {
        const full = `
            <span slot="header">Header</span>
            Body
            <span slot="footer">Footer</span>
        `;

        it('has one padding around its regions and one between them', async () => {
            const el = await themed(`<el-card>${full}</el-card>`);

            // Three lines of text, four paddings, the border.
            expect(sizeOf(el).height).toBe(1 + 16 + 20 + 16 + 20 + 16 + 20 + 16 + 1);
            const { left, right } = el.getBoundingClientRect();
            for (const slot of ['header', 'footer']) {
                expect(el.querySelector(`[slot="${slot}"]`).getBoundingClientRect().left, slot).toBe(left + 1 + 16);
            }
            expect(sizeOf(part(el, 'body')).width).toBe(right - left - 2);
            expect(getComputedStyle(part(el, 'body')).paddingLeft).toBe('16px');
        });

        it('keeps the padding above the body and the footer when the region before them is left out', async () => {
            const [bodyFirst, withMedia] = await themed(`
                <el-card>Body<span slot="footer">Footer</span></el-card>
                <el-card><div slot="media" style="height: 50px"></div>Body</el-card>
            `);

            expect(sizeOf(bodyFirst).height).toBe(1 + 16 + 20 + 16 + 20 + 16 + 1);
            // The media has no padding, so the body under it keeps its own.
            expect(sizeOf(withMedia).height).toBe(1 + 50 + 16 + 20 + 16 + 1);
        });

        it('takes its padding from --el-space-4 of the theme, and from --el-card-padding before that', async () => {
            const [theme, narrow, none] = await themed(`
                <el-card style="--el-space-4: 10px">${full}</el-card>
                <el-card style="--el-space-4: 10px; --el-card-padding: 4px">${full}</el-card>
                <el-card style="--el-card-padding: 0">${full}</el-card>
            `);

            expect(sizeOf(theme).height).toBe(1 + 10 + 20 + 10 + 20 + 10 + 20 + 10 + 1);
            expect(sizeOf(narrow).height).toBe(1 + 4 + 20 + 4 + 20 + 4 + 20 + 4 + 1);
            expect(sizeOf(none).height).toBe(1 + 20 + 20 + 20 + 1);
        });

        it('pushes the items of the header apart, and lines the items of the footer up with a gap', async () => {
            const el = await themed(`
                <el-card>
                    <span slot="header">Title</span><span slot="header">Edit</span>
                    Body
                    <span slot="footer">Save</span><span slot="footer">Cancel</span>
                </el-card>
            `);
            const { left, right } = el.getBoundingClientRect();
            const [title, edit] = [...el.querySelectorAll('[slot="header"]')].map((item) =>
                item.getBoundingClientRect(),
            );
            const [save, cancel] = [...el.querySelectorAll('[slot="footer"]')].map((item) =>
                item.getBoundingClientRect(),
            );

            expect(title.left).toBe(left + 1 + 16);
            expect(edit.right).toBe(right - 1 - 16);
            expect(edit.top).toBe(title.top);
            expect(save.left).toBe(left + 1 + 16);
            expect(Math.round((cancel.left - save.right) * 10) / 10).toBe(8);
        });

        it('keeps a gap in a full header, centres its items, and wraps a full footer', async () => {
            const box = (slot, width, height) =>
                `<span slot="${slot}" style="display: block; width: ${width}px; height: ${height}px"></span>`;
            const el = await themed(`
                <el-card>
                    <span slot="header">A title that is long enough to need a second line in a card this wide</span>
                    <span slot="header" style="line-height: 100px">Edit</span>
                    Body
                    ${box('footer', 150, 20)}${box('footer', 150, 40)}${box('footer', 60, 20)}
                </el-card>
            `);
            const [title, action] = [...el.querySelectorAll('[slot="header"]')].map((item) =>
                item.getBoundingClientRect(),
            );
            const [first, second, third] = [...el.querySelectorAll('[slot="footer"]')].map((item) =>
                item.getBoundingClientRect(),
            );
            const centre = (rect) => rect.top + rect.height / 2;

            // The title wraps and leaves the gap to the action.
            expect(action.right).toBe(el.getBoundingClientRect().right - 1 - 16);
            expect(Math.round((action.left - title.right) * 10) / 10).toBe(8);
            expect(title.height).toBeGreaterThan(20);
            expect(centre(title)).toBe(centre(action));

            // 150 + 8 + 150 do not fit into 266: the second item is on a line of its own, and the
            // third beside it, both in the middle of that line.
            expect(second.top).toBe(first.bottom + 8);
            expect(third.left).toBe(second.right + 8);
            expect(centre(third)).toBe(centre(second));
        });

        it('takes the margins of the browser off a heading in the header and a paragraph in the footer', async () => {
            const el = await themed(`<el-card><h3 slot="header">Title</h3>Body<p slot="footer">Note</p></el-card>`);

            expect(getComputedStyle(el.querySelector('h3')).margin).toBe('0px');
            expect(getComputedStyle(el.querySelector('p')).margin).toBe('0px');
            // The body is left alone: what is in it is content of the page.
            expect(getComputedStyle(part(el, 'header')).fontWeight).toBe('600');
        });
    });

    describe('media', () => {
        it('reaches from edge to edge, and keeps the proportions of an image', async () => {
            const el = await themed(
                `<el-card><img slot="media" alt="" width="600" height="400" src="${image}" />Body</el-card>`,
            );
            const img = el.querySelector('img');
            await img.decode();
            const card = el.getBoundingClientRect();
            const media = img.getBoundingClientRect();

            expect(media.left).toBe(card.left + 1);
            expect(media.right).toBe(card.right - 1);
            expect(media.top).toBe(card.top + 1);
            // 298 wide, three to two.
            expect(sizeOf(img)).toEqual({ width: 298, height: 198.7 });
            // Nothing under the image but the body: an image is a block here, not a word in a line.
            expect(sizeOf(el).height).toBe(1 + 198.7 + 16 + 20 + 16 + 1);
        });

        it('is round where the card is, and the card itself cuts nothing off', async () => {
            const [el, sketched] = await themed(`
                <el-card><div slot="media" style="height: 50px"></div>Body</el-card>
                <el-card style="--el-radius-lg: 26px 15px 30px 17px / 17px 28px 15px 26px">
                    <div slot="media" style="height: 50px"></div>
                    Body
                </el-card>
            `);
            const corners = (element) => {
                const style = getComputedStyle(element);
                return [
                    style.borderTopLeftRadius,
                    style.borderTopRightRadius,
                    style.borderBottomRightRadius,
                    style.borderBottomLeftRadius,
                ];
            };

            expect(corners(part(el, 'media'))).toEqual(['12px', '12px', '0px', '0px']);
            // A radius with eight values, as a theme may set it, reaches the media as well.
            expect(corners(part(sketched, 'base'))).toEqual(['26px 17px', '15px 28px', '30px 15px', '17px 26px']);
            expect(corners(part(sketched, 'media'))).toEqual(['26px 17px', '15px 28px', '0px', '0px']);
            expect(getComputedStyle(part(el, 'media')).overflow).toBe('hidden');
            // The list of a select or a focus ring may reach out of a card.
            expect(getComputedStyle(part(el, 'base')).overflow).toBe('visible');
            expect(getComputedStyle(part(el, 'body')).overflow).toBe('visible');
        });
    });

    it('fills the height its container gives it, with the footer at the bottom', async () => {
        const wrapper = await fixture(`
            <div style="${tokens} width: auto; display: grid; grid-template-columns: 200px 200px; gap: 8px">
                <el-card>Short<span slot="footer">Footer</span></el-card>
                <el-card>
                    Long long long long long long long long long long long long long long long long long long
                    <span slot="footer">Footer</span>
                </el-card>
            </div>
        `);
        const [short, long] = wrapper.children;

        expect(sizeOf(long).height).toBeGreaterThan(1 + 16 + 20 + 16 + 20 + 16 + 1);
        expect(sizeOf(part(short, 'base')).height).toBe(sizeOf(long).height);
        expect(part(short, 'footer').getBoundingClientRect().bottom).toBe(
            part(long, 'footer').getBoundingClientRect().bottom,
        );
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-card hidden>Body</el-card>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('is a group with the name of its heading when the page says so', async () => {
        const el = await themed(`
            <el-card role="group" aria-labelledby="card-test-title">
                <h3 slot="header" id="card-test-title">Profile</h3>
                Body
            </el-card>
        `);

        expect(await accessibleRole(el)).toBe('group');
        expect(await accessibleName(el)).toBe('Profile');
    });

    it('has no detectable a11y violations', async () => {
        const wrapper = await fixture(`
            <div style="${tokens}">
                <el-card>
                    <img slot="media" alt="A lake in the morning" width="600" height="400" src="${image}" />
                    <h3 slot="header">Lake house</h3>
                    <p>Two rooms, a boat and a view.</p>
                    <button slot="footer" type="button">Book</button>
                </el-card>
                <el-card appearance="filled"><p>Filled</p></el-card>
                <el-card appearance="plain"><p>Plain</p></el-card>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
