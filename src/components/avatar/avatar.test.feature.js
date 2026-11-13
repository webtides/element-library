import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, aTimeout, fixture, nextFrame, sizeOf } from '../../test-helpers.js';
import Avatar, { define } from './avatar.js';
define();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
// Which of the three the avatar shows.
const shows = (el) => ['image', 'initials', 'icon'].filter((name) => part(el, name));
// An image of 80 by 40, twice as wide as high.
const picture = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Crect width='80' height='40' fill='teal'/%3E%3C/svg%3E`;
const otherPicture = picture.replace('teal', 'navy');
// An address that the browser cannot make an image of.
const broken = 'data:image/png;base64,AAAA';
const until = async (condition) => {
    for (let tries = 0; tries < 100 && !condition(); tries++) await aTimeout(10);
};
const place = `font: 16px/20px sans-serif; color: rgb(0, 0, 255);`;
const placed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};

describe('Feature | Avatar', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-avatar></el-avatar>`);
        await nextFrame();
    });

    describe('what it shows', () => {
        it('shows an icon when it has nothing else, the outline of a person', async () => {
            const el = await placed(`<el-avatar></el-avatar>`);

            expect(shows(el)).toEqual(['icon']);
            // A head and shoulders.
            expect(part(el, 'icon').querySelectorAll('slot[name="icon"] svg > :is(circle, path)')).toHaveLength(2);
        });

        it('shows the icon of the page in the place of its own', async () => {
            const el = await placed(`<el-avatar><svg slot="icon" width="20" height="20"></svg></el-avatar>`);
            const slot = part(el, 'icon').querySelector('slot');

            expect(slot.assignedElements()).toEqual([el.querySelector('svg')]);
            expect(sizeOf(slot.querySelector('svg'))).toEqual({ width: 0, height: 0 });
        });

        it('shows the initials before the icon, and the image before the initials', async () => {
            const [initials, image] = await placed(`
                <el-avatar initials="AL"></el-avatar>
                <el-avatar initials="AL" image="${picture}"></el-avatar>
            `);

            expect(shows(initials)).toEqual(['initials']);
            expect(part(initials, 'initials').textContent).toBe('AL');
            expect(shows(image)).toEqual(['image']);
            expect(part(image, 'image').getAttribute('src')).toBe(picture);
        });

        it('follows its properties', async () => {
            const el = await placed(`<el-avatar></el-avatar>`);

            el.initials = 'GH';
            await nextFrame();
            expect(shows(el)).toEqual(['initials']);

            el.image = picture;
            await nextFrame();
            expect(shows(el)).toEqual(['image']);

            el.image = '';
            el.initials = '';
            await nextFrame();
            expect(shows(el)).toEqual(['icon']);
        });
    });

    describe('image', () => {
        it('fills the avatar and is cut to its shape, not squeezed into it', async () => {
            const el = await placed(`<el-avatar image="${picture}"></el-avatar>`);
            const image = part(el, 'image');
            await image.decode();

            expect(sizeOf(image)).toEqual(sizeOf(el));
            expect(getComputedStyle(image).objectFit).toBe('cover');
            expect(getComputedStyle(part(el, 'base')).overflow).toBe('hidden');
        });

        it('makes way for the initials when it cannot be loaded', async () => {
            const el = await placed(`<el-avatar image="${broken}" initials="GH"></el-avatar>`);
            await until(() => !part(el, 'image'));

            expect(shows(el)).toEqual(['initials']);
        });

        it('makes way for the icon when there are no initials', async () => {
            const el = await placed(`<el-avatar image="${broken}"></el-avatar>`);
            await until(() => !part(el, 'image'));

            expect(shows(el)).toEqual(['icon']);
        });

        it('makes way for an image that fails after the avatar is there', async () => {
            const el = await placed(`<el-avatar initials="GH"></el-avatar>`);

            el.image = broken;
            await nextFrame();
            expect(shows(el)).toEqual(['image']);
            await until(() => !part(el, 'image'));
            expect(shows(el)).toEqual(['initials']);
        });

        it('tries another address again, and gives up on that one alone', async () => {
            const el = await placed(`<el-avatar image="${broken}" initials="GH"></el-avatar>`);
            await until(() => !part(el, 'image'));

            el.image = picture;
            await nextFrame();
            expect(shows(el)).toEqual(['image']);
            await part(el, 'image').decode();
            await aTimeout(50);
            expect(shows(el)).toEqual(['image']);

            el.image = broken;
            await nextFrame();
            await until(() => !part(el, 'image'));
            expect(shows(el)).toEqual(['initials']);
        });

        it('makes way when the image had failed before the element took over', async () => {
            // Server-rendered markup: the browser loads the image while it parses, and nobody
            // listens yet when that fails. The element is defined under another tag here, late.
            const source = document.createElement('el-avatar');
            Object.assign(source, source.properties(), { image: broken, initials: 'GH' });
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(`
                <el-avatar-late image="${broken}" initials="GH">
                    <template shadowrootmode="open">${source.template().toString()}</template>
                </el-avatar-late>
            `);
            const el = wrapper.firstElementChild;
            const image = part(el, 'image');
            await until(() => image.complete);
            expect(image.naturalWidth).toBe(0);
            expect(shows(el)).toEqual(['image']);

            customElements.define('el-avatar-late', class extends Avatar {});
            await nextFrame();
            await nextFrame();
            await nextFrame();

            expect(shows(el)).toEqual(['initials']);
            wrapper.remove();
        });
    });

    describe('name', () => {
        it('is an image with its label as the name', async () => {
            const [initials, image] = await placed(`
                <el-avatar label="Ada Lovelace" initials="AL"></el-avatar>
                <el-avatar label="Grace Hopper" image="${picture}"></el-avatar>
            `);

            expect(await accessibleRole(part(initials, 'base'))).toBe('image');
            expect(await accessibleName(part(initials, 'base'))).toBe('Ada Lovelace');
            expect(await accessibleName(part(image, 'base'))).toBe('Grace Hopper');
            // The name is on the base. The image inside has none of its own.
            expect(part(image, 'image').getAttribute('alt')).toBe('');
        });

        it('is hidden from assistive technology without a label', async () => {
            const el = await placed(`<el-avatar initials="AL"></el-avatar>`);

            expect(part(el, 'base').getAttribute('aria-hidden')).toBe('true');
            expect(part(el, 'base').hasAttribute('role')).toBe(false);
        });

        it('takes a label set from a script, and gives it back', async () => {
            const el = await placed(`<el-avatar initials="AL"></el-avatar>`);

            el.label = 'Ada Lovelace';
            await nextFrame();
            expect(part(el, 'base').hasAttribute('aria-hidden')).toBe(false);
            expect(await accessibleName(part(el, 'base'))).toBe('Ada Lovelace');

            el.label = '';
            await nextFrame();
            expect(part(el, 'base').getAttribute('aria-hidden')).toBe('true');
            expect(part(el, 'base').hasAttribute('role')).toBe(false);
            expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);
        });
    });

    describe('shape', () => {
        const radius = (el) => getComputedStyle(part(el, 'base')).borderRadius;

        it('is a circle by default, and says so on the host', async () => {
            const el = await placed(`<el-avatar></el-avatar>`);

            expect(el.getAttribute('shape')).toBe('circle');
            expect(radius(el)).toBe('50%');
        });

        it('is a square, or a square with the corners of the theme', async () => {
            const [square, rounded, themed] = await placed(`
                <el-avatar shape="square"></el-avatar>
                <el-avatar shape="rounded"></el-avatar>
                <el-avatar shape="rounded" style="--el-radius-md: 10px"></el-avatar>
            `);

            expect(radius(square)).toBe('0px');
            expect(radius(rounded)).toBe('4px');
            expect(radius(themed)).toBe('10px');
        });

        it('takes a shape set from a script, and is a circle with one it does not know', async () => {
            const [el, unknown] = await placed(`<el-avatar></el-avatar><el-avatar shape="star"></el-avatar>`);

            el.shape = 'square';
            await nextFrame();
            expect(el.getAttribute('shape')).toBe('square');
            expect(radius(el)).toBe('0px');
            expect(radius(unknown)).toBe('50%');
        });
    });

    describe('size', () => {
        const sizes = `
            <el-avatar size="small" initials="S"></el-avatar>
            <el-avatar initials="M"></el-avatar>
            <el-avatar size="large" initials="L"></el-avatar>
        `;

        it('has the control height of its size as its width and its height', async () => {
            const [small, medium, large] = await placed(sizes, '--el-control-height: 60px;');

            expect(medium.getAttribute('size')).toBe('medium');
            expect(sizeOf(small)).toEqual({ width: 48, height: 48 });
            expect(sizeOf(medium)).toEqual({ width: 60, height: 60 });
            expect(sizeOf(large)).toEqual({ width: 75, height: 75 });
        });

        it('has the sizes of the controls without a theme as well', async () => {
            const [small, medium, large] = await placed(sizes);

            expect(sizeOf(small)).toEqual({ width: 32, height: 32 });
            expect(sizeOf(medium)).toEqual({ width: 40, height: 40 });
            expect(sizeOf(large)).toEqual({ width: 50, height: 50 });
        });

        it('takes any size from --el-avatar-size, whatever the size attribute says', async () => {
            const el = await placed(
                `<el-avatar size="small" initials="XL" style="--el-avatar-size: 80px"></el-avatar>`,
            );
            expect(sizeOf(el)).toEqual({ width: 80, height: 80 });
        });

        it('sizes the initials and the icon with the avatar', async () => {
            const [initials, icon] = await placed(
                `<el-avatar initials="XL"></el-avatar><el-avatar></el-avatar>`,
                '--el-avatar-size: 80px;',
            );

            // Two fifths of the avatar for the letters, three fifths for the icon.
            expect(getComputedStyle(part(initials, 'initials')).fontSize).toBe('32px');
            expect(sizeOf(part(icon, 'icon').querySelector('svg'))).toEqual({ width: 48, height: 48 });
            // In the middle.
            const outer = initials.getBoundingClientRect();
            const inner = part(initials, 'initials').getBoundingClientRect();
            expect(Math.round(inner.left + inner.width / 2 - outer.left)).toBe(40);
            expect(Math.round(inner.top + inner.height / 2 - outer.top)).toBe(40);
            // One line of the letters, not a box as high as the avatar with the letters at its top.
            expect(inner.height).toBe(32);
        });

        it('takes a size set from a script', async () => {
            const el = await placed(`<el-avatar></el-avatar>`);

            el.size = 'large';
            await nextFrame();
            expect(el.getAttribute('size')).toBe('large');
            expect(sizeOf(el)).toEqual({ width: 50, height: 50 });
        });

        it('stands in a line of text, in the middle of it', async () => {
            const el = await placed(`<el-avatar></el-avatar>`);
            const { display, verticalAlign } = getComputedStyle(el);
            expect({ display, verticalAlign }).toEqual({ display: 'inline-block', verticalAlign: 'middle' });
        });
    });

    describe('colours', () => {
        const paint = (el) => {
            const { backgroundColor, color } = getComputedStyle(part(el, 'base'));
            return { background: backgroundColor, text: color };
        };

        it('has an eighth of the text colour of the theme as its background, and that colour as its text', async () => {
            const el = await placed(`<el-avatar initials="AL"></el-avatar>`, '--el-color-fg: rgb(255, 0, 0);');
            expect(paint(el)).toEqual({ background: 'color(srgb 1 0 0 / 0.12)', text: 'rgb(255, 0, 0)' });
        });

        it('has the text colour of where it stands without a theme', async () => {
            const el = await placed(`<el-avatar initials="AL"></el-avatar>`);
            expect(paint(el)).toEqual({ background: 'color(srgb 0 0 1 / 0.12)', text: 'rgb(0, 0, 255)' });
        });

        it('has semibold initials in one line', async () => {
            const el = await placed(`<el-avatar initials="AL"></el-avatar>`);
            const { fontWeight, lineHeight, fontSize } = getComputedStyle(part(el, 'initials'));
            expect({ fontWeight, lineHeight, fontSize }).toEqual({
                fontWeight: '600',
                lineHeight: '16px',
                fontSize: '16px',
            });
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-avatar hidden></el-avatar>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('has no detectable a11y violations', async () => {
        const wrapper = await fixture(`
            <div style="--el-color-fg: rgb(10, 10, 10); color: rgb(10, 10, 10); background: rgb(255, 255, 255)">
                <el-avatar label="Ada Lovelace" initials="AL"></el-avatar>
                <el-avatar label="Grace Hopper" image="${picture}"></el-avatar>
                <el-avatar label="Unknown user"></el-avatar>
                <p><el-avatar initials="KJ"></el-avatar> Katherine Johnson</p>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('has what it shows, its role and its name in the server-rendered markup', async () => {
        const [image, initials, icon] = await placed(`
            <el-avatar label="Grace Hopper" image="${otherPicture}" initials="GH"></el-avatar>
            <el-avatar label="Ada Lovelace" initials="AL"></el-avatar>
            <el-avatar></el-avatar>
        `);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        // Without the comments that mark the places of the values.
        const markup = (el) =>
            el
                .template()
                .toString()
                .replace(/<!--[\s\S]*?-->/g, '');

        expect(markup(image)).toMatch(/<span part="base" class="avatar"\s+role='img'\s+aria-label='Grace Hopper'\s*>/);
        expect(markup(image)).toMatch(/<img part="image" ref="image"\s+src="data:image[^"]+" alt=""\s*\/>/);
        expect(markup(image)).not.toMatch(/part="initials"|part="icon"/);
        expect(markup(initials)).toMatch(/<span part="initials">AL<\/span>/);
        expect(markup(icon)).toMatch(/<span part="base" class="avatar"\s+aria-hidden='true'\s*>/);
        expect(markup(icon)).toMatch(/<slot name="icon">\s*<svg/);
    });
});
