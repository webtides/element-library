import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    forcePseudoClasses,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './breadcrumb-item.js';
import { define as defineBreadcrumb } from '../breadcrumb/breadcrumb.js';
define();
defineBreadcrumb();

const part = (el, name) => el.shadowRoot.querySelector(`[part="${name}"]`);
const label = (el) => part(el, 'label');
const separator = (el) => part(el, 'separator');
// A trail in a place with text of 20px on lines of 30px, in blue on white. Returns the items.
const place = `font: 20px/30px sans-serif; color: rgb(0, 0, 255); background: rgb(255, 255, 255);`;
const trailOf = async (items, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}"><el-breadcrumb>${items}</el-breadcrumb></div>`);
    return [...wrapper.firstElementChild.children];
};

describe('Feature | BreadcrumbItem', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-breadcrumb-item></el-breadcrumb-item>`);
        await nextFrame();
    });

    describe('with href', () => {
        it('is a link to the page, named by its text', async () => {
            const [item] = await trailOf(`<el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>`);

            expect(label(item).tagName).toBe('A');
            expect(label(item).getAttribute('href')).toBe('/shoes');
            expect(await accessibleRole(label(item))).toBe('link');
            expect(await accessibleName(label(item))).toBe('Shoes');
            // No page was said to be the current one.
            expect(label(item).hasAttribute('aria-current')).toBe(false);
        });

        it('can be reached with the keyboard', async () => {
            const [home, shoes] = await trailOf(`
                <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
            `);

            label(shoes).focus();
            expect(shoes.shadowRoot.activeElement).toBe(label(shoes));
            expect(label(home).tabIndex).toBe(0);
        });

        it('passes target on, and writes rel only with it', async () => {
            const [same, other, own] = await trailOf(`
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item href="https://example.com" target="_blank">Shop</el-breadcrumb-item>
                <el-breadcrumb-item href="https://example.com" target="_blank" rel="external">Shop</el-breadcrumb-item>
            `);
            const attributes = (item) => [label(item).getAttribute('target'), label(item).getAttribute('rel')];

            expect(attributes(same)).toEqual([null, null]);
            expect(attributes(other)).toEqual(['_blank', 'noreferrer noopener']);
            expect(attributes(own)).toEqual(['_blank', 'external']);
        });

        it('follows an href set from a script, and becomes text without one', async () => {
            const [item] = await trailOf(`<el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>`);

            item.href = '/boots';
            await nextFrame();
            expect(label(item).getAttribute('href')).toBe('/boots');

            item.href = '';
            await nextFrame();
            expect(label(item).tagName).toBe('SPAN');
            expect(item.shadowRoot.querySelector('a')).toBe(null);
            // The name of the page is still shown.
            expect(label(item).querySelector('slot').assignedNodes()[0].textContent).toBe('Shoes');
        });
    });

    describe('without href', () => {
        it('is text, and no link', async () => {
            const [item] = await trailOf(`<el-breadcrumb-item>Shoes</el-breadcrumb-item>`);

            expect(label(item).tagName).toBe('SPAN');
            expect(label(item).hasAttribute('href')).toBe(false);
            expect(item.shadowRoot.querySelector('a')).toBe(null);
        });
    });

    describe('current', () => {
        it('marks the page the user is on, as text and as a link', async () => {
            const [text, link] = await trailOf(`
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes/trail-runner-4" current="true">Trail runner 4</el-breadcrumb-item>
            `);

            expect(label(text).tagName).toBe('SPAN');
            expect(label(text).getAttribute('aria-current')).toBe('page');
            expect(label(link).tagName).toBe('A');
            expect(label(link).getAttribute('aria-current')).toBe('page');
        });

        it('follows a value set from a script', async () => {
            const [item] = await trailOf(`<el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>`);

            item.current = true;
            await nextFrame();
            expect(label(item).getAttribute('aria-current')).toBe('page');

            item.current = false;
            await nextFrame();
            expect(label(item).hasAttribute('aria-current')).toBe(false);
        });

        it('has the text colour and a heavier weight, where the pages on the way have the accent colour', async () => {
            const [way, text, link] = await trailOf(
                `
                    <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                    <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
                    <el-breadcrumb-item href="/shoes/trail-runner-4" current="true">Trail runner 4</el-breadcrumb-item>
                `,
                '--el-color-accent: rgb(255, 0, 0); --el-color-fg: rgb(1, 2, 3);',
            );
            const look = (item) => {
                const { color, fontWeight } = getComputedStyle(label(item));
                return { color, fontWeight };
            };

            expect(look(way)).toEqual({ color: 'rgb(255, 0, 0)', fontWeight: '400' });
            expect(look(text)).toEqual({ color: 'rgb(1, 2, 3)', fontWeight: '600' });
            expect(look(link)).toEqual({ color: 'rgb(1, 2, 3)', fontWeight: '600' });
        });
    });

    describe('separator', () => {
        const content = (item) => getComputedStyle(separator(item), '::before').content;

        it('stands in front of every entry but the first', async () => {
            const [home, shoes, runner] = await trailOf(`
                <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            `);

            expect(getComputedStyle(separator(home)).display).toBe('none');
            for (const item of [shoes, runner]) {
                expect(getComputedStyle(separator(item)).display).not.toBe('none');
                expect(content(item)).toBe('"/"');
                expect(separator(item).getBoundingClientRect().right).toBeLessThan(
                    label(item).getBoundingClientRect().left,
                );
            }
        });

        it('is not read out, and not part of the name of the link', async () => {
            const [, shoes] = await trailOf(`
                <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
            `);

            expect(separator(shoes).getAttribute('aria-hidden')).toBe('true');
            expect(label(shoes).contains(separator(shoes))).toBe(false);
            expect(await accessibleName(label(shoes))).toBe('Shoes');
        });

        it('takes another string from --el-breadcrumb-separator', async () => {
            const [, shoes] = await trailOf(
                `
                    <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                    <el-breadcrumb-item href="/shoes" style="--el-breadcrumb-separator: '›'">Shoes</el-breadcrumb-item>
                `,
            );
            expect(content(shoes)).toBe('"›"');
        });

        it('has the muted text colour of the theme, and the text colour without one', async () => {
            const [, plain] = await trailOf(`
                <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
            `);
            const [, themed] = await trailOf(
                `
                    <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                    <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                `,
                '--el-color-fg-muted: rgb(4, 5, 6);',
            );

            expect(getComputedStyle(separator(plain)).color).toBe('rgb(0, 0, 255)');
            expect(getComputedStyle(separator(themed)).color).toBe('rgb(4, 5, 6)');
        });
    });

    describe('look', () => {
        it('has the text colour and no underline without a theme', async () => {
            const [way, here] = await trailOf(`
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            `);

            expect(getComputedStyle(label(way)).color).toBe('rgb(0, 0, 255)');
            expect(getComputedStyle(label(way)).textDecorationLine).toBe('none');
            expect(getComputedStyle(label(here)).color).toBe('rgb(0, 0, 255)');
        });

        it('shows the focus of the keyboard with the ring of the theme', async () => {
            const [item] = await trailOf(
                `<el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>`,
                '--el-color-focus-ring: rgb(9, 8, 7); --el-focus-ring-width: 3px; --el-focus-ring-offset: 1px;',
            );

            await forcePseudoClasses(label(item), ['focus-visible']);
            const { outlineColor, outlineStyle, outlineWidth, outlineOffset } = getComputedStyle(label(item));
            expect({ outlineColor, outlineStyle, outlineWidth, outlineOffset }).toEqual({
                outlineColor: 'rgb(9, 8, 7)',
                outlineStyle: 'solid',
                outlineWidth: '3px',
                outlineOffset: '1px',
            });
        });

        it('puts an icon next to the name, on the middle of the line', async () => {
            const [item] = await trailOf(
                `<el-breadcrumb-item href="/"><span style="display: inline-block; width: 16px; height: 16px"></span>Home</el-breadcrumb-item>`,
            );
            const icon = item.querySelector('span').getBoundingClientRect();
            const box = label(item).getBoundingClientRect();

            expect(Math.abs(icon.top + icon.height / 2 - (box.top + box.height / 2))).toBeLessThan(0.5);
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-breadcrumb-item hidden>Shoes</el-breadcrumb-item>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('has links of at least --el-touch-target, and leaves text as it is', async () => {
            const [home, here] = await trailOf(
                `
                    <el-breadcrumb-item href="/">Up</el-breadcrumb-item>
                    <el-breadcrumb-item current="true">Up</el-breadcrumb-item>
                `,
                '--el-touch-target: 44px;',
            );
            expect(matchMedia('(any-pointer: coarse)').matches).toBe(true);

            expect(sizeOf(label(home))).toEqual({ width: 44, height: 44 });
            expect(sizeOf(label(here)).height).toBe(30);
            expect(sizeOf(label(here)).width).toBeLessThan(44);
        });

        it('keeps its sizes without the token', async () => {
            const [home] = await trailOf(`<el-breadcrumb-item href="/">Up</el-breadcrumb-item>`);

            expect(sizeOf(label(home)).height).toBe(30);
            expect(sizeOf(label(home)).width).toBeLessThan(44);
        });
    });

    it('has no detectable a11y violations in a trail with a theme', async () => {
        const [item] = await trailOf(
            `
                <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            `,
            '--el-color-accent: #2563eb; --el-color-fg: #111827; --el-color-fg-muted: #6b7280;',
        );
        const results = await axe.run(item.closest('div'));
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
        expect(results.passes.map((pass) => pass.id)).toContain('link-name');
    });

    it('has its role, its link and the current page in the server-rendered markup', async () => {
        const el = await fixture(`<el-breadcrumb-item href="/shoes" current="true">Shoes</el-breadcrumb-item>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/\srole=['"]listitem['"]/);
        expect(markup).toMatch(/<a\s[^>]*href=['"]\/shoes['"]/);
        expect(markup).toMatch(/\saria-current=['"]page['"]/);
        expect(markup).toMatch(/<span part="separator" class="separator" aria-hidden="true"><\/span>/);
    });
});
