import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    oneEvent,
    useForcedColors,
    usePrint,
    useSafeAreaInsets,
} from '../../test-helpers.js';
import { activeElement } from '../../utils/focus.js';
import { define } from './app-frame.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDialog } from '../dialog/dialog.js';
import { define as defineDrawer } from '../drawer/drawer.js';
import { define as definePopover } from '../popover/popover.js';
import { define as defineTooltip } from '../tooltip/tooltip.js';
import { define as defineToast } from '../toast/toast.js';
import { define as defineScrollTo } from '../scroll-to/scroll-to.js';
import { define as defineScrollToTop } from '../scroll-to-top/scroll-to-top.js';
define();
defineButton();
defineDialog();
defineDrawer();
definePopover();
defineTooltip();
defineToast();
defineScrollTo();
defineScrollToTop();

// A frame fills the viewport, and a later fixture would lie on an earlier one: every test takes
// its fixture out of the page again.
const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: lines of 1px, and colours that can be told apart.
const theme = `
    --el-border-width: 1px; --el-radius-md: 6px;
    --el-space-2: 8px; --el-space-3: 12px; --el-font-size-sm: 14px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10);
    --el-color-border: rgb(150, 150, 150); --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

let ids = 0;
const paragraphs = (count) => Array.from({ length: count }, (_, i) => `<p>Paragraph ${i + 1}</p>`).join('');

/** The five regions as a page writes them: a header of 50px, a footer of 30px. */
const regions = ({ lines = 2 } = {}) => `
    <header slot="header" style="display: block; height: 50px">Header</header>
    <nav slot="navigation" aria-label="Main"><a id="nav-link" href="#one">One</a></nav>
    <main id="content-${++ids}">
        <h1>Title</h1>
        ${paragraphs(lines)}
        <a id="link" href="#two">A link in the content</a>
    </main>
    <aside slot="aside" aria-label="Details"><p>Aside</p></aside>
    <footer slot="footer" style="display: block; height: 30px">Footer</footer>
`;

/** A frame in a box of its own: the page sets the position and a height on the element. */
const frame = async (content, { attributes = '', width = 1000, height = 600, style = theme, dir = 'ltr' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <button class="before" type="button">Before</button>
            <el-app-frame style="position: relative; height: ${height}px" ${attributes}>${content}</el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-app-frame');
};

/** A frame as it is by default: it fills the viewport. */
const viewportFrame = async (content, { attributes = '', style = theme } = {}) => {
    const wrapper = await fixture(`
        <div style="${style}">
            <el-app-frame ${attributes}>${content}</el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-app-frame');
};

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};

/** Where a part of the frame is, counted from the corner of the frame. */
const box = (el, name) => {
    const origin = el.getBoundingClientRect();
    const { left, top, width, height } = part(el, name).getBoundingClientRect();
    return [left - origin.left, top - origin.top, width, height].map((value) => Math.round(value * 10) / 10);
};

describe('Feature | AppFrame', () => {
    describe('the regions, where the frame is wide', () => {
        it('lays out a header, a footer, a navigation at the start, an aside at the end and the content', async () => {
            const el = await frame(regions());

            expect(el.wide).toBe(true);
            // The header and the footer have a line to the content of 1px.
            expect(box(el, 'header')).toEqual([0, 0, 1000, 51]);
            expect(box(el, 'footer')).toEqual([0, 569, 1000, 31]);
            // 16rem and 20rem, and a line each.
            expect(box(el, 'navigation')).toEqual([0, 51, 257, 518]);
            expect(box(el, 'content')).toEqual([257, 51, 422, 518]);
            expect(box(el, 'aside')).toEqual([679, 51, 321, 518]);
        });

        it('has the navigation at the right and the aside at the left in a right-to-left page', async () => {
            const el = await frame(regions(), { dir: 'rtl' });

            expect(box(el, 'navigation')).toEqual([743, 51, 257, 518]);
            expect(box(el, 'content')).toEqual([321, 51, 422, 518]);
            expect(box(el, 'aside')).toEqual([0, 51, 321, 518]);
        });

        it('gives a region the page leaves empty no room', async () => {
            const el = await frame(`<main id="only"><p>Content</p></main>`);

            expect(box(el, 'content')).toEqual([0, 0, 1000, 600]);
            for (const name of ['header', 'navigation', 'aside', 'footer']) {
                expect(box(el, name).slice(2)).toEqual([0, 0]);
            }
        });

        it('makes room for a region that comes later, and takes it back when it goes', async () => {
            const el = await frame(`<main id="late"><p>Content</p></main>`);

            el.insertAdjacentHTML('beforeend', `<aside slot="aside">Aside</aside>`);
            await rendered();
            expect(box(el, 'aside')).toEqual([679, 0, 321, 600]);
            expect(box(el, 'content')).toEqual([0, 0, 679, 600]);

            el.querySelector('aside').remove();
            await rendered();
            expect(box(el, 'content')).toEqual([0, 0, 1000, 600]);
        });

        it('takes the widths of the navigation and of the aside from the page', async () => {
            const el = await frame(regions(), {
                style: `${theme} --el-app-frame-navigation-size: 200px; --el-app-frame-aside-size: 100px;`,
            });

            expect(box(el, 'navigation')).toEqual([0, 51, 201, 518]);
            expect(box(el, 'content')).toEqual([201, 51, 698, 518]);
            expect(box(el, 'aside')).toEqual([899, 51, 101, 518]);
        });

        it('makes the navigation as wide as what is in it for auto', async () => {
            const el = await frame(
                `<nav slot="navigation" aria-label="Main"><div style="width: 72px">Rail</div></nav>
                 <main id="auto"><p>Content</p></main>`,
                { style: `${theme} --el-app-frame-navigation-size: auto;` },
            );

            expect(box(el, 'navigation')).toEqual([0, 0, 73, 600]);
        });
    });

    describe('what scrolls', () => {
        it('scrolls the content, and the header, the footer and the columns stay', async () => {
            const el = await frame(regions({ lines: 60 }));
            const scrollOfTheWindow = window.scrollY;
            const before = ['header', 'footer', 'navigation', 'aside'].map((name) => box(el, name));

            expect(el.scroller).toBe(part(el, 'content'));
            expect(el.scroller.scrollHeight).toBeGreaterThan(el.scroller.clientHeight);

            el.scroller.scrollTop = 400;
            await nextFrame();

            expect(el.scroller.scrollTop).toBe(400);
            expect(['header', 'footer', 'navigation', 'aside'].map((name) => box(el, name))).toEqual(before);
            expect(window.scrollY).toBe(scrollOfTheWindow);
            // Nothing but the content has moved: the frame is as high as it was.
            expect(box(el, 'base')).toEqual([0, 0, 1000, 600]);
        });

        it('scrolls a navigation and an aside that are longer than the frame on their own', async () => {
            const el = await frame(`
                <nav slot="navigation" aria-label="Main">${paragraphs(60)}</nav>
                <main id="short"><p>Content</p></main>
                <aside slot="aside">${paragraphs(60)}</aside>
            `);

            part(el, 'navigation').scrollTop = 300;
            part(el, 'aside').scrollTop = 200;
            await nextFrame();

            expect(part(el, 'navigation').scrollTop).toBe(300);
            expect(part(el, 'aside').scrollTop).toBe(200);
            expect(part(el, 'content').scrollTop).toBe(0);
        });

        it('is one column that scrolls between the header and the footer where it is narrow', async () => {
            const el = await frame(regions({ lines: 60 }), { width: 400 });
            const [, contentTop] = box(el, 'content');
            const [, asideTop] = box(el, 'aside');

            expect(el.wide).toBe(false);
            expect(el.scroller).toBe(part(el, 'body'));
            expect(box(el, 'header')).toEqual([0, 0, 400, 51]);
            expect(box(el, 'body')).toEqual([0, 51, 400, 518]);
            expect(box(el, 'footer')).toEqual([0, 569, 400, 31]);
            // The content and the aside below each other, each as wide as the frame.
            expect(asideTop).toBeGreaterThan(contentTop);
            expect(box(el, 'content')[2]).toBe(400);
            expect(box(el, 'aside')[2]).toBe(400);

            el.scroller.scrollTop = 300;
            await nextFrame();

            expect(box(el, 'content')[1]).toBe(contentTop - 300);
            expect(box(el, 'header')).toEqual([0, 0, 400, 51]);
            expect(box(el, 'footer')).toEqual([0, 569, 400, 31]);
            // The regions do not scroll in themselves there.
            expect(getComputedStyle(part(el, 'content')).overflowY).toBe('visible');
        });
    });

    describe('wide from a width', () => {
        const isWide = async (width, attributes) => (await frame(regions(), { width, attributes })).wide;

        it('is wide from 48rem unless the page names another step', async () => {
            expect(await isWide(767)).toBe(false);
            expect(await isWide(768)).toBe(true);
        });

        it.each([
            ['30rem', 480],
            ['40rem', 640],
            ['48rem', 768],
            ['64rem', 1024],
            ['80rem', 1280],
        ])('is wide from %s with that step', async (step, width) => {
            expect(await isWide(width - 1, `wide-from="${step}"`)).toBe(false);
            expect(await isWide(width, `wide-from="${step}"`)).toBe(true);
        });

        it('takes a width the stylesheet does not know as the default', async () => {
            expect(await isWide(767, 'wide-from="50rem"')).toBe(false);
            expect(await isWide(768, 'wide-from="50rem"')).toBe(true);
        });

        it('follows its own width, and a step that is set later', async () => {
            const el = await frame(regions(), { width: 600 });
            expect(el.wide).toBe(false);

            el.parentElement.style.width = '900px';
            await rendered();
            await rendered();
            expect(el.wide).toBe(true);
            expect(box(el, 'navigation')).toEqual([0, 51, 257, 518]);

            el.parentElement.style.width = '600px';
            el.wideFrom = '30rem';
            await rendered();
            expect(el.wide).toBe(true);

            el.setAttribute('wide-from', '40rem');
            await rendered();
            expect(el.wide).toBe(false);
        });
    });

    describe('the navigation where the frame is narrow', () => {
        const toggleButton = `<el-button id="toggle" data-navigation-toggle circle="true" aria-label="Menu">m</el-button>`;
        const page = ({ toggle = toggleButton, nav = '' } = {}) => `
            <header slot="header">${toggle}</header>
            <nav slot="navigation" aria-label="Main" style="display: block; padding: 8px">
                <a id="nav-one" href="#one">One</a>
                <a id="nav-two" href="#two">Two</a>
                <button id="nav-button" type="button">No link</button>
                ${nav}
            </nav>
            <main id="content-${++ids}"><p>Content</p><a id="link" href="#x">A link in the content</a></main>
        `;
        const narrow = (content = page(), options = {}) => frame(content, { width: 400, ...options });
        const drawer = (el) => el.shadowRoot.querySelector('el-drawer');
        const surface = (el) => drawer(el)?.shadowRoot.querySelector('dialog');
        const control = (button) => button.shadowRoot.querySelector('[part="base"]');
        const open = async (el) => {
            await userEvent.click(el.querySelector('#toggle'));
            await expect.poll(() => surface(el)?.matches(':modal.showing')).toBe(true);
            await rendered();
        };
        const closed = (el) => expect.poll(() => !!surface(el)?.open).toBe(false);

        it('does not show the navigation, and keeps the one the page wrote', async () => {
            const el = await narrow();
            const nav = el.querySelector('nav');

            expect(nav.getBoundingClientRect().height).toBe(0);
            expect(part(el, 'navigation')).toBeNull();
            expect(drawer(el)).not.toBeNull();
            // It is where the page wrote it: a child of the frame, in the slot of the navigation.
            expect(nav.parentElement).toBe(el);
            expect(nav.assignedSlot.closest('el-drawer')).toBe(drawer(el));
            // The Tab key passes it: the skip link, the button, the link in the content.
            el.parentElement.querySelector('.before').focus();
            const stops = [];
            for (let i = 0; i < 3; i++) {
                await userEvent.keyboard('{Tab}');
                stops.push(activeElement().id || activeElement().getAttribute('part') || activeElement().className);
            }
            expect(stops[0]).toBe('skip-link');
            expect(activeElement()).toBe(el.querySelector('#link'));
        });

        it('opens it as a modal drawer from the start edge, with the button of the page', async () => {
            const el = await narrow();
            const nav = el.querySelector('nav');
            const toggle = el.querySelector('#toggle');
            expect(toggle.getAttribute('aria-expanded')).toBe('false');

            await open(el);

            const { left, top, width, height } = surface(el).getBoundingClientRect();
            // At the left edge of the viewport, from its top to its bottom, as wide as the column.
            expect([left, top, width, height]).toEqual([0, 0, 256, window.innerHeight]);
            expect(surface(el).matches(':modal')).toBe(true);
            // The navigation of the page is in it: the same element, shown now.
            expect(el.querySelector('nav')).toBe(nav);
            expect(nav.getBoundingClientRect().height).toBeGreaterThan(0);
            expect(nav.getBoundingClientRect().left).toBe(0);
            // The frame and the button say so.
            expect(el.navigationOpen).toBe(true);
            expect(el.getAttribute('navigation-open')).toBe('true');
            expect(el.matches(':state(navigation-open)')).toBe(true);
            expect(toggle.getAttribute('aria-expanded')).toBe('true');
            expect(control(toggle).getAttribute('aria-expanded')).toBe('true');
        });

        it('comes from the right in a right-to-left page', async () => {
            const el = await narrow(page(), { dir: 'rtl' });
            await open(el);

            expect(Math.round(surface(el).getBoundingClientRect().right)).toBe(document.documentElement.clientWidth);
        });

        it('has the name and the close button the page gives it', async () => {
            const el = await narrow(page(), {
                attributes: 'navigation-label="Navigation principale" close-label="Fermer"',
            });
            await open(el);

            expect(await accessibleRole(surface(el))).toBe('dialog');
            expect(await accessibleName(surface(el))).toBe('Navigation principale');
            expect(await accessibleName(drawer(el).shadowRoot.querySelector('[part~="close-button"]'))).toBe('Fermer');
        });

        it('keeps the focus in the drawer', async () => {
            const el = await narrow();
            await open(el);

            // In the navigation or on the close button of the drawer. From its last stop the Tab key
            // goes out of the page, to the browser, and comes back into the drawer: it never gets
            // to the page behind it.
            const where = () => {
                const active = activeElement();
                if (el.querySelector('nav').contains(active) || active.getRootNode().host === drawer(el))
                    return 'drawer';
                return el.contains(active) && active !== el ? 'page' : 'browser';
            };
            expect(where()).toBe('drawer');
            const seen = new Set();
            for (let i = 0; i < 8; i++) {
                await userEvent.keyboard('{Tab}');
                seen.add(where());
            }
            expect(seen.has('drawer')).toBe(true);
            expect(seen.has('page')).toBe(false);
        });

        it('closes with Escape, and gives the focus back to the button that opened it', async () => {
            const el = await narrow();
            const toggle = el.querySelector('#toggle');
            await open(el);

            await userEvent.keyboard('{Escape}');
            await closed(el);
            await rendered();

            expect(el.navigationOpen).toBe(false);
            expect(el.matches(':state(navigation-open)')).toBe(false);
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
            expect(activeElement()).toBe(control(toggle));
            expect(el.querySelector('nav').getBoundingClientRect().height).toBe(0);
        });

        it('closes with a click beside it, and with its close button', async () => {
            const el = await narrow();

            await open(el);
            // A click on the backdrop has the dialog as its target, at a point outside of its box.
            surface(el).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 380, clientY: 300 }));
            await closed(el);
            expect(el.navigationOpen).toBe(false);

            await open(el);
            await userEvent.click(drawer(el).shadowRoot.querySelector('[part~="close-button"]'));
            await closed(el);
            expect(el.navigationOpen).toBe(false);
        });

        it('closes with the button of the page as well', async () => {
            const el = await narrow();
            el.navigationOpen = true;
            await expect.poll(() => surface(el)?.matches(':modal')).toBe(true);

            // The page behind a modal is inert, so the script of a page is what clicks its button.
            el.querySelector('#toggle').click();
            await closed(el);

            expect(el.navigationOpen).toBe(false);
        });

        it('closes when the user has followed a link in it, also where the page keeps the click', async () => {
            const el = await narrow();
            // A single-page application: the page takes the click and changes the view itself.
            let followed = 0;
            el.querySelector('nav').addEventListener('click', (event) => {
                if (event.target.matches('a')) {
                    event.preventDefault();
                    followed++;
                }
            });
            await open(el);

            await userEvent.click(el.querySelector('#nav-two'));
            await closed(el);

            expect(followed).toBe(1);
            expect(el.navigationOpen).toBe(false);
        });

        it('stays open for a click on something in it that is no link', async () => {
            const el = await narrow();
            await open(el);

            await userEvent.click(el.querySelector('#nav-button'));
            await rendered();

            expect(el.navigationOpen).toBe(true);
            expect(surface(el).matches(':modal')).toBe(true);
        });

        it('opens and closes with its property, and tells the page once each time', async () => {
            const el = await narrow();
            const told = [];
            el.addEventListener('app-frame-navigation-toggle', (event) => told.push(event.detail.open));

            el.navigationOpen = true;
            await expect.poll(() => surface(el)?.matches(':modal')).toBe(true);
            el.navigationOpen = false;
            await closed(el);
            await rendered();

            expect(told).toEqual([true, false]);
        });

        it('keeps what the drawer says of itself in the frame', async () => {
            const el = await narrow();
            const heard = [];
            for (const name of ['drawer-show', 'drawer-after-show', 'drawer-hide', 'drawer-after-hide']) {
                el.parentElement.addEventListener(name, () => heard.push(name));
            }

            await open(el);
            await userEvent.keyboard('{Escape}');
            await closed(el);
            await rendered();

            expect(heard).toEqual([]);
        });

        it('says on every button of the page whether it is open', async () => {
            const el = await narrow(
                page({
                    toggle: `${toggleButton}<button id="second" data-navigation-toggle type="button">Menu</button>`,
                }),
            );
            const second = el.querySelector('#second');
            expect(second.getAttribute('aria-expanded')).toBe('false');

            second.focus();
            await userEvent.keyboard('{Enter}');
            await expect.poll(() => surface(el)?.matches(':modal')).toBe(true);

            expect(second.getAttribute('aria-expanded')).toBe('true');
            expect(el.querySelector('#toggle').getAttribute('aria-expanded')).toBe('true');
        });

        it('is as wide as the page makes the navigation', async () => {
            const el = await narrow(page(), { style: `${theme} --el-app-frame-navigation-size: 200px;` });
            await open(el);

            expect(surface(el).getBoundingClientRect().width).toBe(200);
        });

        it('leaves nothing behind when the frame gets wide while the drawer is open', async () => {
            const el = await narrow();
            const nav = el.querySelector('nav');
            const told = [];
            el.addEventListener('app-frame-navigation-toggle', (event) => told.push(event.detail.open));
            await open(el);
            expect(document.documentElement.style.overflow).toBe('hidden');

            el.parentElement.style.width = '1000px';
            await expect.poll(() => el.wide && !!part(el, 'navigation')).toBe(true);
            await rendered();

            // The navigation is a column, with the element the page wrote.
            expect(drawer(el)).toBeNull();
            // The header has the button alone, which is not there now: a line is what is left of it.
            expect(box(el, 'navigation')).toEqual([0, 1, 257, 599]);
            expect(el.querySelector('nav')).toBe(nav);
            expect(nav.getBoundingClientRect().height).toBeGreaterThan(0);
            // No drawer, no backdrop, no lock on the scroll of the page, and the frame says so.
            expect(el.shadowRoot.querySelector('dialog')).toBeNull();
            expect(document.documentElement.style.overflow).not.toBe('hidden');
            expect(el.navigationOpen).toBe(false);
            expect(el.matches(':state(navigation-open)')).toBe(false);
            expect(told).toEqual([true, false]);
            // The page is not inert: the pointer and the keyboard reach it.
            const link = el.querySelector('#nav-one');
            const { left, top, width, height } = link.getBoundingClientRect();
            expect(document.elementFromPoint(left + width / 2, top + height / 2)).toBe(link);
            link.focus();
            expect(activeElement()).toBe(link);

            // And narrow again, the navigation is a drawer that is closed.
            el.parentElement.style.width = '400px';
            await expect.poll(() => !!drawer(el)).toBe(true);
            await rendered();
            expect(nav.getBoundingClientRect().height).toBe(0);
            expect(el.navigationOpen).toBe(false);
        });

        it('does not open where the navigation is a column', async () => {
            const el = await frame(page());
            const told = [];
            el.addEventListener('app-frame-navigation-toggle', (event) => told.push(event.detail.open));

            el.navigationOpen = true;
            await rendered();
            el.querySelector('#toggle').click();
            await rendered();

            expect(el.navigationOpen).toBe(false);
            expect(drawer(el)).toBeNull();
            expect(told).toEqual([]);
        });

        it('has no drawer for a navigation the page has for the wide frame only, or without one', async () => {
            const wideOnly = await narrow(page(), { attributes: 'wide-only="navigation"' });
            const none = await narrow(`<header slot="header">${toggleButton}</header><main id="none"></main>`);

            for (const el of [wideOnly, none]) {
                expect(drawer(el)).toBeNull();
                expect(getComputedStyle(el.querySelector('#toggle')).display).toBe('none');
                el.navigationOpen = true;
                await rendered();
                expect(el.navigationOpen).toBe(false);
            }
        });

        it('gets its drawer when the navigation comes later, and loses it when it goes', async () => {
            const el = await narrow(`<header slot="header">${toggleButton}</header><main id="later"></main>`);
            expect(drawer(el)).toBeNull();

            el.insertAdjacentHTML('beforeend', `<nav slot="navigation" aria-label="Main"><a href="#a">A</a></nav>`);
            await expect.poll(() => !!drawer(el)).toBe(true);
            await rendered();
            expect(getComputedStyle(el.querySelector('#toggle')).display).toBe('inline-block');

            el.querySelector('nav').remove();
            await expect.poll(() => !!drawer(el)).toBe(false);
        });
    });

    describe('the button for the navigation', () => {
        const buttons = `
            <el-button id="library" data-navigation-toggle aria-label="Menu">m</el-button>
            <button id="native" data-navigation-toggle type="button">Menu</button>
        `;
        const page = `
            <header slot="header">${buttons}</header>
            <nav slot="navigation" aria-label="Main"><a href="#one">One</a></nav>
            <main id="buttons-main"><p>Content</p></main>
        `;

        it('is there where the navigation is a drawer', async () => {
            const el = await frame(page, { width: 400 });

            expect(getComputedStyle(el.querySelector('#library')).display).toBe('inline-block');
            expect(el.querySelector('#native').hidden).toBe(false);
        });

        it('is not there where the navigation is a column', async () => {
            const el = await frame(page);

            // An el-button by the stylesheet of the frame, any other element by its script.
            expect(getComputedStyle(el.querySelector('#library')).display).toBe('none');
            expect(el.querySelector('#native').hidden).toBe(true);
            expect(el.querySelector('#native').getBoundingClientRect().width).toBe(0);
        });

        it('comes and goes with the width of the frame', async () => {
            const el = await frame(page, { width: 400 });

            el.parentElement.style.width = '1000px';
            await expect.poll(() => el.querySelector('#native').hidden).toBe(true);
            expect(getComputedStyle(el.querySelector('#library')).display).toBe('none');

            el.parentElement.style.width = '400px';
            await expect.poll(() => el.querySelector('#native').hidden).toBe(false);
            expect(getComputedStyle(el.querySelector('#library')).display).toBe('inline-block');
        });

        it('is a button as any other outside of a frame', async () => {
            const wrapper = await fixture(`<div><el-button data-navigation-toggle>Menu</el-button></div>`);
            wrappers.push(wrapper);

            expect(getComputedStyle(wrapper.querySelector('el-button')).display).toBe('inline-block');
        });
    });

    describe('regions for one width only', () => {
        it('has a region that is for the wide frame only where it is wide', async () => {
            const narrow = await frame(regions(), { width: 400, attributes: 'wide-only="navigation aside"' });
            const wide = await frame(regions(), { attributes: 'wide-only="navigation aside"' });

            // Narrow: the content alone between the header and the footer.
            expect(box(narrow, 'navigation').slice(2)).toEqual([0, 0]);
            expect(box(narrow, 'aside').slice(2)).toEqual([0, 0]);
            expect(box(narrow, 'body')).toEqual([0, 51, 400, 518]);
            // Wide: as without the attribute.
            expect(box(wide, 'navigation')).toEqual([0, 51, 257, 518]);
            expect(box(wide, 'aside')).toEqual([679, 51, 321, 518]);
        });

        it('has a region that is for the narrow frame only where it is narrow', async () => {
            const narrow = await frame(regions(), { width: 400, attributes: 'narrow-only="footer"' });
            const wide = await frame(regions(), { attributes: 'narrow-only="footer"' });

            expect(box(narrow, 'footer')).toEqual([0, 569, 400, 31]);
            // Wide: no footer, and the columns reach the lower edge.
            expect(box(wide, 'footer').slice(2)).toEqual([0, 0]);
            expect(box(wide, 'content')).toEqual([257, 51, 422, 549]);
        });

        it('takes every region by its name, and nothing else', async () => {
            const el = await frame(regions(), { attributes: 'narrow-only="header footer content base x"' });

            expect(part(el, 'base').dataset.narrowOnly).toBe('header footer');
            expect(box(el, 'header').slice(2)).toEqual([0, 0]);
            expect(box(el, 'footer').slice(2)).toEqual([0, 0]);
            expect(box(el, 'content')).toEqual([257, 0, 422, 600]);
        });

        it('follows a change of the attribute and of the width', async () => {
            const el = await frame(regions(), { width: 400 });
            expect(box(el, 'aside')[2]).toBe(400);

            el.wideOnly = 'aside';
            await rendered();
            expect(box(el, 'aside').slice(2)).toEqual([0, 0]);

            el.parentElement.style.width = '1000px';
            await nextFrame();
            expect(box(el, 'aside')).toEqual([679, 51, 321, 518]);
        });

        it('prints a region that is not there as little as it shows it', async () => {
            const el = await frame(regions(), { attributes: 'narrow-only="footer"' });
            expect(getComputedStyle(part(el, 'footer')).display).toBe('none');
        });
    });

    describe('the viewport', () => {
        it('fills what the browser shows, whatever margin the body has', async () => {
            document.body.style.margin = '8px';
            const el = await viewportFrame(regions({ lines: 80 }));
            const { left, top, width, height } = el.getBoundingClientRect();
            document.body.style.margin = '';

            expect([left, top, width, height]).toEqual([
                0,
                0,
                document.documentElement.clientWidth,
                window.innerHeight,
            ]);
            // The footer ends at the lower edge of the viewport, with content that is much longer.
            expect(Math.round(part(el, 'footer').getBoundingClientRect().bottom)).toBe(window.innerHeight);
            // And the frame adds nothing to scroll to the document.
            expect(document.documentElement.scrollHeight).toBe(document.documentElement.clientHeight);
        });
    });

    describe('landmarks', () => {
        it('leaves the landmarks to the elements of the page, one per region', async () => {
            const el = await frame(regions());

            expect(await accessibleRole(el.querySelector('header'))).toBe('banner');
            expect(await accessibleRole(el.querySelector('nav'))).toBe('navigation');
            expect(await accessibleName(el.querySelector('nav'))).toBe('Main');
            expect(await accessibleRole(el.querySelector('main'))).toBe('main');
            expect(await accessibleRole(el.querySelector('aside'))).toBe('complementary');
            expect(await accessibleRole(el.querySelector('footer'))).toBe('contentinfo');
        });

        it('adds no landmark of its own', async () => {
            const el = await frame(regions());

            for (const name of ['base', 'header', 'body', 'navigation', 'content', 'aside', 'footer']) {
                expect(await accessibleRole(part(el, name))).not.toMatch(
                    /banner|navigation|main|complementary|contentinfo|region/,
                );
            }
        });
    });

    describe('the link that skips to the content', () => {
        it('is the first stop of the Tab key, and shows while it has the focus', async () => {
            const el = await frame(regions());
            const link = part(el, 'skip-link');
            expect(link.getBoundingClientRect().width).toBe(1);

            el.parentElement.querySelector('.before').focus();
            await userEvent.keyboard('{Tab}');

            expect(activeElement()).toBe(link);
            expect(await accessibleRole(link)).toBe('link');
            expect(await accessibleName(link)).toBe('Skip to content');
            const { left, top, width, height } = link.getBoundingClientRect();
            const origin = el.getBoundingClientRect();
            expect(width).toBeGreaterThan(100);
            expect(height).toBeGreaterThan(30);
            // In the corner at the start, with a gap of --el-space-2.
            expect([left - origin.left, top - origin.top]).toEqual([8, 8]);
            // A surface of its own: it lies on the header.
            expect(getComputedStyle(link).backgroundColor).toBe('rgb(255, 255, 255)');
        });

        it('takes its text from the page', async () => {
            const el = await frame(regions(), { attributes: 'skip-label="Zum Inhalt"' });
            expect(await accessibleName(part(el, 'skip-link'))).toBe('Zum Inhalt');

            el.skipLabel = 'Aller au contenu';
            await rendered();
            expect(await accessibleName(part(el, 'skip-link'))).toBe('Aller au contenu');
        });

        it('is a link to the id of the main of the page, which works before the script has run', async () => {
            const el = await frame(regions());
            expect(part(el, 'skip-link').getAttribute('href')).toBe(`#${el.querySelector('main').id}`);
        });

        it('puts the focus into the content, and the Tab key goes on there', async () => {
            const el = await frame(regions({ lines: 60 }));
            const address = location.href;
            el.scroller.scrollTop = 500;

            el.parentElement.querySelector('.before').focus();
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Enter}');
            await nextFrame();

            // The region of the content has the focus, so the keys scroll it.
            expect(activeElement()).toBe(part(el, 'content'));
            // The content is in view from its start, and the address is as it was.
            expect(el.scroller.scrollTop).toBe(0);
            expect(location.href).toBe(address);
            // The region shows no ring: it is no control.
            expect(getComputedStyle(part(el, 'content')).outlineStyle).toBe('none');

            await userEvent.keyboard('{Tab}');
            expect(activeElement()).toBe(el.querySelector('#link'));
            // The region is no stop of the Tab key, and nothing is left on it.
            expect(part(el, 'content').hasAttribute('tabindex')).toBe(false);
        });

        it('scrolls the content with the keys after it', async () => {
            const el = await frame(regions({ lines: 60 }));

            el.parentElement.querySelector('.before').focus();
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard('{End}');

            await expect.poll(() => el.scroller.scrollTop).toBeGreaterThan(0);
        });

        it('works without an id on the content', async () => {
            const el = await frame(`
                <header slot="header">Header</header>
                <main><a id="first" href="#x">First</a></main>
            `);

            el.parentElement.querySelector('.before').focus();
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard('{Tab}');

            expect(activeElement()).toBe(el.querySelector('#first'));
        });

        it('leads to the start of the content where the frame is narrow, wherever the column is', async () => {
            const el = await frame(`<main id="below"><a id="first" href="#x">First</a>${paragraphs(40)}</main>`, {
                width: 400,
            });
            el.scroller.scrollTop = 300;

            el.parentElement.querySelector('.before').focus();
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('{Enter}');
            await nextFrame();

            const top = (node) => Math.round(node.getBoundingClientRect().top);
            expect(top(el.querySelector('main'))).toBe(top(part(el, 'body')));
            expect(activeElement()).toBe(part(el, 'content'));
        });
    });

    describe('a region that scrolls and has nothing in it that takes the focus', () => {
        it('is a stop of the Tab key itself, so the keyboard can scroll it', async () => {
            const el = await frame(`
                <header slot="header"><a id="home" href="#home">Home</a></header>
                <main id="plain"><h1>Title</h1>${paragraphs(60)}</main>
            `);
            const content = part(el, 'content');

            expect(content.getAttribute('tabindex')).toBe('0');

            el.querySelector('#home').focus();
            await userEvent.keyboard('{Tab}');
            expect(activeElement()).toBe(content);
            // The ring is inside of the region: around it is the edge of the screen.
            expect(getComputedStyle(content).outlineStyle).toBe('solid');
            expect(getComputedStyle(content).outlineOffset).toBe('-2px');

            await userEvent.keyboard('{End}');
            await expect.poll(() => content.scrollTop).toBeGreaterThan(0);
        });

        it('is none where something in it takes the focus, or where it does not scroll', async () => {
            const withLink = await frame(regions({ lines: 60 }));
            const short = await frame(`<main id="short-text"><p>Short</p></main>`);

            expect(part(withLink, 'content').hasAttribute('tabindex')).toBe(false);
            expect(part(short, 'content').hasAttribute('tabindex')).toBe(false);
        });

        it('follows the content: a stop while it scrolls and has no control, none after', async () => {
            const el = await frame(`<main id="grows"><p>Short</p></main>`);
            const content = part(el, 'content');
            const main = el.querySelector('main');
            expect(content.hasAttribute('tabindex')).toBe(false);

            main.insertAdjacentHTML('beforeend', paragraphs(60));
            await expect.poll(() => content.getAttribute('tabindex')).toBe('0');

            main.innerHTML = '<p>Short</p>';
            await expect.poll(() => content.hasAttribute('tabindex')).toBe(false);
        });

        it('is the one column where the frame is narrow', async () => {
            const el = await frame(`<main id="plain-narrow"><h1>Title</h1>${paragraphs(60)}</main>`, { width: 400 });

            expect(part(el, 'body').getAttribute('tabindex')).toBe('0');
            expect(part(el, 'content').hasAttribute('tabindex')).toBe(false);
        });

        it('covers an aside and a navigation that scroll', async () => {
            const el = await frame(`
                <nav slot="navigation" aria-label="Main">${paragraphs(60)}</nav>
                <main id="beside"><a href="#x">A link</a></main>
                <aside slot="aside">${paragraphs(60)}<a href="#y">A link at its end</a></aside>
            `);

            expect(part(el, 'navigation').getAttribute('tabindex')).toBe('0');
            expect(part(el, 'aside').hasAttribute('tabindex')).toBe(false);
            expect(part(el, 'content').hasAttribute('tabindex')).toBe(false);
        });

        it('keeps its stop when the skip link has put the focus there', async () => {
            const el = await frame(`
                <header slot="header">Header</header>
                <main id="stays"><h1>Title</h1>${paragraphs(60)}</main>
            `);
            const content = part(el, 'content');

            part(el, 'skip-link').click();
            expect(activeElement()).toBe(content);
            content.blur();

            expect(content.getAttribute('tabindex')).toBe('0');
        });
    });

    describe('the top layer', () => {
        const centre = (node) => {
            const { left, top, width, height } = node.getBoundingClientRect();
            return [left + width / 2, top + height / 2];
        };
        const isOnTop = (surface, host) => {
            const hit = document.elementFromPoint(...centre(surface));
            return hit === host || host.contains(hit);
        };

        it('shows a dialog, a drawer, a popover, a tooltip and a toast over the frame, from any region', async () => {
            const el = await viewportFrame(`
                <header slot="header">
                    <el-popover><button slot="anchor" type="button">Options</button><p>Panel</p></el-popover>
                    <button id="help" type="button">Help</button>
                    <el-tooltip for="help">Explains</el-tooltip>
                </header>
                <main id="layer">
                    <el-dialog label="Dialog"><p>In the dialog</p></el-dialog>
                    ${paragraphs(40)}
                </main>
                <aside slot="aside"><el-drawer label="Drawer"><p>In the drawer</p></el-drawer></aside>
                <footer slot="footer"><el-toast placement="bottom"></el-toast></footer>
            `);

            const popover = el.querySelector('el-popover');
            popover.querySelector('button').click();
            await rendered();
            const panel = popover.shadowRoot.querySelector('[part~="panel"]');
            expect(panel.matches(':popover-open')).toBe(true);
            expect(isOnTop(panel, popover)).toBe(true);
            popover.querySelector('button').click();

            const tooltip = el.querySelector('el-tooltip');
            el.querySelector('#help').focus();
            await rendered();
            expect(tooltip.matches(':popover-open')).toBe(true);
            el.querySelector('#help').blur();

            const toast = el.querySelector('el-toast');
            toast.toast('Saved');
            await rendered();
            expect(toast.matches(':popover-open')).toBe(true);
            expect(isOnTop(toast.querySelector('el-notification'), toast)).toBe(true);

            for (const modal of [el.querySelector('el-dialog'), el.querySelector('el-drawer')]) {
                await modal.show();
                const surface = modal.shadowRoot.querySelector('dialog');
                expect(surface.matches(':modal')).toBe(true);
                expect(isOnTop(surface, modal)).toBe(true);
                await modal.hide();
            }
        });

        it('does not scroll the content behind a dialog, and gives it back after', async () => {
            const el = await viewportFrame(`
                <main id="locked"><el-dialog label="Dialog"><p>In the dialog</p></el-dialog>${paragraphs(80)}</main>
            `);
            const dialog = el.querySelector('el-dialog');
            const { width } = el.getBoundingClientRect();

            await dialog.show();
            // The lock of the dialog is on the document, which the frame does not need: its width
            // is as it was.
            expect(el.getBoundingClientRect().width).toBe(width);
            await dialog.hide();

            el.scroller.scrollTop = 200;
            expect(el.scroller.scrollTop).toBe(200);
        });
    });

    describe('with the scroll helpers of the library', () => {
        it('scrolls its content to the top with el-scroll-to-top', async () => {
            const el = await frame(`
                <main id="top">
                    ${paragraphs(60)}
                    <el-scroll-to-top duration="1"><button id="up" type="button">To the top</button></el-scroll-to-top>
                </main>
            `);
            el.scroller.scrollTop = 800;

            el.querySelector('#up').click();

            await expect.poll(() => el.scroller.scrollTop).toBe(0);
        });

        it('scrolls its one column to the top where it is narrow', async () => {
            const el = await frame(
                `<main id="top-narrow">
                    ${paragraphs(60)}
                    <el-scroll-to-top duration="1"><button id="up" type="button">To the top</button></el-scroll-to-top>
                </main>`,
                { width: 400 },
            );
            el.scroller.scrollTop = 800;

            el.querySelector('#up').click();

            await expect.poll(() => el.scroller.scrollTop).toBe(0);
        });

        it('brings a place of the content into view with el-scroll-to', async () => {
            const el = await frame(`
                <main id="to">
                    <el-scroll-to selector="#target"><button id="go" type="button">Go</button></el-scroll-to>
                    ${paragraphs(60)}
                    <h2 id="target" style="margin: 0">Target</h2>
                    ${paragraphs(60)}
                </main>
            `);

            el.querySelector('#go').click();
            await nextFrame();

            expect(el.scroller.scrollTop).toBeGreaterThan(0);
            expect(Math.round(el.querySelector('#target').getBoundingClientRect().top)).toBe(
                Math.round(el.scroller.getBoundingClientRect().top),
            );
        });
    });

    describe('on a phone with a notch and a home indicator', () => {
        useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

        const paddings = (el, name) => {
            const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(part(el, name));
            return [paddingTop, paddingRight, paddingBottom, paddingLeft].map(parseFloat);
        };

        it('keeps what is in the header and in the footer clear of them, and their surfaces reach the edge', async () => {
            const el = await frame(regions(), { width: 400 });

            // The surface is the part, from the edge of the frame.
            expect(box(el, 'header')).toEqual([0, 0, 400, 98]);
            expect(box(el, 'footer')).toEqual([0, 535, 400, 65]);
            expect(paddings(el, 'header')).toEqual([47, 20, 0, 10]);
            expect(paddings(el, 'footer')).toEqual([0, 20, 34, 10]);
            // The header of the page is below the notch, the footer above the home indicator.
            const origin = el.getBoundingClientRect();
            const header = el.querySelector('header').getBoundingClientRect();
            const footer = el.querySelector('footer').getBoundingClientRect();
            expect([header.left - origin.left, header.top - origin.top, header.width]).toEqual([10, 47, 370]);
            expect(origin.bottom - footer.bottom).toBe(34);
        });

        it('keeps the column that scrolls clear of the sides where the frame is narrow', async () => {
            const el = await frame(regions(), { width: 400 });

            expect(paddings(el, 'body')).toEqual([0, 20, 0, 10]);
            expect(paddings(el, 'base')).toEqual([0, 0, 0, 0]);
        });

        it('keeps the columns clear of the sides where the frame is wide, each at its edge', async () => {
            const el = await frame(regions());

            expect(paddings(el, 'navigation')).toEqual([0, 0, 0, 10]);
            expect(paddings(el, 'content')).toEqual([0, 0, 0, 0]);
            expect(paddings(el, 'aside')).toEqual([0, 20, 0, 0]);
            // The width the page sets is the one of what is in the region.
            expect(box(el, 'navigation')[2]).toBe(256 + 10 + 1);
            expect(box(el, 'aside')[2]).toBe(320 + 20 + 1);
        });

        it('swaps the sides in a right-to-left page', async () => {
            const el = await frame(regions(), { dir: 'rtl' });

            // The navigation is at the right now, where the room of the system is 20px.
            expect(paddings(el, 'navigation')).toEqual([0, 20, 0, 0]);
            expect(paddings(el, 'aside')).toEqual([0, 0, 0, 10]);
        });

        it('keeps the content clear of a side that has no column', async () => {
            const el = await frame(`
                <header slot="header">Header</header>
                <main id="alone"><p>Content</p></main>
                <footer slot="footer">Footer</footer>
            `);

            expect(paddings(el, 'content')).toEqual([0, 20, 0, 10]);
        });

        it('keeps the edges clear itself without a header and a footer, so nothing scrolls under them', async () => {
            const el = await frame(`<main id="bare">${paragraphs(60)}</main>`);

            expect(paddings(el, 'base')).toEqual([47, 0, 34, 0]);
            expect(box(el, 'content')).toEqual([0, 47, 1000, 519]);
        });

        it('keeps the edge of a header or a footer clear itself where the page has left it out', async () => {
            const wide = await frame(regions(), { attributes: 'narrow-only="header footer"' });
            const narrow = await frame(regions(), { width: 400, attributes: 'wide-only="header footer"' });

            expect(paddings(wide, 'base')).toEqual([47, 0, 34, 0]);
            expect(paddings(narrow, 'base')).toEqual([47, 0, 34, 0]);
            // And not where the region is there.
            expect(paddings(await frame(regions(), { attributes: 'wide-only="header footer"' }), 'base')).toEqual([
                0, 0, 0, 0,
            ]);
            expect(
                paddings(await frame(regions(), { width: 400, attributes: 'narrow-only="header footer"' }), 'base'),
            ).toEqual([0, 0, 0, 0]);
        });

        it('keeps the content clear of the side of a column the page has left out', async () => {
            const el = await frame(regions(), { attributes: 'narrow-only="navigation aside"' });

            expect(paddings(el, 'content')).toEqual([0, 20, 0, 10]);
        });

        it('puts the skip link below the notch', async () => {
            const el = await frame(regions());
            const link = part(el, 'skip-link');

            link.focus();
            const origin = el.getBoundingClientRect();
            const { left, top } = link.getBoundingClientRect();

            expect([left - origin.left, top - origin.top]).toEqual([10 + 8, 47 + 8]);
        });

        it('tells the components in the header and in the footer how far their surface reaches', async () => {
            const el = await frame(regions());
            const insets = (node) =>
                ['block-start', 'inline-end', 'block-end', 'inline-start'].map((side) =>
                    getComputedStyle(node).getPropertyValue(`--_el-context-inset-${side}`).trim(),
                );

            expect(insets(el.querySelector('header'))).toEqual(['47px', '20px', '0px', '10px']);
            expect(insets(el.querySelector('footer'))).toEqual(['0px', '20px', '34px', '10px']);
            expect(insets(el.querySelector('nav'))).toEqual(['0px', '0px', '0px', '10px']);
            // What is in the content is no surface of the frame.
            expect(insets(el.querySelector('main'))).toEqual(['0px', '0px', '0px', '0px']);
            expect(insets(el.querySelector('aside'))).toEqual(['0px', '0px', '0px', '0px']);
        });

        it('tells the components in the header and in the footer that it draws the line to the content', async () => {
            const el = await frame(regions());
            const line = (node, side) => getComputedStyle(node).getPropertyValue(`--_el-context-line-${side}`).trim();

            expect(line(el.querySelector('header'), 'block-end')).toBe('0px');
            expect(line(el.querySelector('footer'), 'block-start')).toBe('0px');
            // Not in the content: a bar there has its own line.
            expect(line(el.querySelector('main'), 'block-end')).toBe('');
            expect(line(el.querySelector('main'), 'block-start')).toBe('');
        });
    });

    describe('on paper', () => {
        usePrint();

        it('is as long as its content, which prints whole', async () => {
            const el = await viewportFrame(regions({ lines: 80 }));
            const content = part(el, 'content');

            expect(getComputedStyle(el).position).toBe('static');
            for (const name of ['body', 'content', 'aside']) {
                expect(getComputedStyle(part(el, name)).overflowY).toBe('visible');
            }
            // Nothing is cut off: the content is as high as what is in it, and the frame around it
            // as well.
            expect(content.scrollHeight).toBe(content.clientHeight);
            expect(content.getBoundingClientRect().height).toBeGreaterThan(80 * 24);
            expect(el.getBoundingClientRect().height).toBeGreaterThan(content.getBoundingClientRect().height);
            expect(getComputedStyle(part(el, 'skip-link')).display).toBe('none');
        });

        it('prints a wide frame whole too', async () => {
            const el = await frame(regions({ lines: 80 }), { width: 1000, height: 600 });

            expect(getComputedStyle(part(el, 'content')).overflowY).toBe('visible');
            expect(part(el, 'content').getBoundingClientRect().height).toBeGreaterThan(80 * 24);
        });
    });

    describe('without a theme', () => {
        it('paints nothing of its own, so it reads as the page does', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await frame(regions(), {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });

                expect(getComputedStyle(el).backgroundColor).toBe('rgba(0, 0, 0, 0)');
                expect(getComputedStyle(el).color).toBe(getComputedStyle(el.parentElement).color);
                // No lines without a theme.
                expect(box(el, 'header')).toEqual([0, 0, 1000, 50]);

                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });

        it('gives the skip link a surface that reads in a light and in a dark scheme', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await frame(regions(), {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });
                const link = part(el, 'skip-link');
                link.focus();

                const { backgroundColor, color, borderTopWidth } = getComputedStyle(link);
                expect(backgroundColor).toBe(getComputedStyle(el.parentElement).backgroundColor);
                expect(color).toBe(getComputedStyle(el.parentElement).color);
                expect(borderTopWidth).toBe('1px');

                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        const lines = (el) => ({
            header: getComputedStyle(part(el, 'header')).borderBottomWidth,
            footer: getComputedStyle(part(el, 'footer')).borderTopWidth,
            navigation: getComputedStyle(part(el, 'navigation')).borderRightWidth,
            aside: getComputedStyle(part(el, 'aside')).borderLeftWidth,
        });

        it('keeps the lines between the regions', async () => {
            const el = await frame(regions());

            expect(lines(el)).toEqual({ header: '1px', footer: '1px', navigation: '1px', aside: '1px' });
            // A colour of the system, not the one of the theme.
            expect(getComputedStyle(part(el, 'header')).borderBottomColor).not.toBe('rgb(150, 150, 150)');
            expect(getComputedStyle(part(el, 'header')).borderBottomColor).not.toBe('rgba(0, 0, 0, 0)');
        });

        it('has the lines without a theme as well, where nothing else tells the regions apart', async () => {
            const el = await frame(regions(), { style: 'font: 16px/24px sans-serif;' });

            expect(lines(el)).toEqual({ header: '1px', footer: '1px', navigation: '1px', aside: '1px' });
        });
    });

    describe('accessibility', () => {
        it('passes axe where it is wide', async () => {
            const el = await frame(regions({ lines: 60 }));
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe where it is narrow', async () => {
            const el = await frame(regions({ lines: 60 }), { width: 400 });
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe with content that has nothing to tab to', async () => {
            const el = await frame(`
                <header slot="header">Header</header>
                <main id="text"><h1>Title</h1>${paragraphs(60)}</main>
            `);
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe where it is narrow, with content that has nothing to tab to', async () => {
            const el = await frame(
                `<header slot="header">Header</header>
                 <main id="text-narrow"><h1>Title</h1>${paragraphs(60)}</main>`,
                { width: 400 },
            );
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe where the navigation is a drawer, closed and open', async () => {
            const el = await frame(
                `<header slot="header"><el-button id="toggle" data-navigation-toggle aria-label="Menu">m</el-button></header>
                 <nav slot="navigation" aria-label="Main"><a href="#one">One</a></nav>
                 <main id="axe-drawer"><h1>Title</h1><a href="#x">A link</a></main>`,
                { width: 400 },
            );
            expect((await axe.run(el.parentElement)).violations).toEqual([]);

            el.navigationOpen = true;
            await expect
                .poll(() => el.shadowRoot.querySelector('el-drawer')?.shadowRoot.querySelector('dialog.showing:modal'))
                .not.toBeNull();
            await rendered();
            expect((await axe.run(el.parentElement)).violations).toEqual([]);
        });

        it('passes axe while the skip link shows', async () => {
            const el = await frame(regions());
            part(el, 'skip-link').focus();
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});
