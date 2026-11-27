import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    useForcedColors,
    useSafeAreaInsets,
    useTouchScreen,
} from '../../test-helpers.js';
import { activeElement } from '../../utils/focus.js';
import { define } from './nav.js';
import { define as defineNavItem } from '../nav-item/nav-item.js';
import { define as defineAppFrame } from '../app-frame/app-frame.js';
import { define as defineBadge } from '../badge/badge.js';
import { forcePseudoClasses } from '../../test-helpers.js';
define();
defineNavItem();
defineAppFrame();
defineBadge();

const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: a control height of 40px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px; --el-touch-target: 44px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-font-size-xs: 12px; --el-font-size-sm: 14px; --el-font-size-md: 16px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(90, 90, 90);
    --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const icon = `<svg slot="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>`;
const destination = (name, attributes = '', extra = '') =>
    `<el-nav-item id="${name.toLowerCase()}" href="#${name.toLowerCase()}" ${attributes}>${icon}${name}${extra}</el-nav-item>`;
const four = `
    ${destination('Inbox', 'current="true"')}
    ${destination('Today')}
    ${destination('Upcoming')}
    ${destination('Done')}
`;

const nav = async (
    content,
    { attributes = 'label="Main"', width = 400, height = 0, style = theme, dir = 'ltr' } = {},
) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px; ${height ? `height: ${height}px;` : ''}">
            <button class="before" type="button">Before</button>
            <el-nav ${attributes}>${content}</el-nav>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-nav');
};

/** A bar in the footer of a frame that is a box of 600px. */
const framed = async (content, { width = 400, style = theme, dir = 'ltr', attributes = '' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-app-frame style="position: relative; height: 600px" ${attributes}>
                <main id="nav-main"><p>Content</p></main>
                <el-nav slot="footer" label="Main">${content}</el-nav>
            </el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-nav');
};

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const box = (origin, node) => {
    const from = origin.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - from.left, top - from.top, width, height].map((value) => Math.round(value * 10) / 10);
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('Feature | Nav', () => {
    describe('the landmark', () => {
        it('is a navigation with the name of the page, and a list of links', async () => {
            const el = await nav(four);
            const base = part(el, 'base');

            expect(await accessibleRole(base)).toBe('navigation');
            expect(await accessibleName(base)).toBe('Main');
            expect(await accessibleRole(part(el, 'list'))).toBe('list');
            for (const item of el.querySelectorAll('el-nav-item')) {
                expect(await accessibleRole(part(item, 'base'))).toBe('listitem');
                expect(await accessibleRole(part(item, 'link'))).toBe('link');
            }
            expect(await accessibleName(part(el.querySelector('#today'), 'link'))).toBe('Today');
        });

        it('has no name while the page gives none', async () => {
            const el = await nav(four, { attributes: '' });
            expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);

            el.label = 'Hauptnavigation';
            await rendered();
            expect(await accessibleName(part(el, 'base'))).toBe('Hauptnavigation');
        });

        it('marks the destination of the current view for assistive technology', async () => {
            const el = await nav(four);
            const link = (id) => part(el.querySelector(id), 'link');

            expect(link('#inbox').getAttribute('aria-current')).toBe('page');
            expect(link('#today').hasAttribute('aria-current')).toBe(false);

            el.querySelector('#inbox').current = false;
            el.querySelector('#today').setAttribute('current', 'true');
            await rendered();

            expect(link('#inbox').hasAttribute('aria-current')).toBe(false);
            expect(link('#today').getAttribute('aria-current')).toBe('page');
        });

        it('stops the Tab key at every destination: it is a navigation, not a menu', async () => {
            const el = await nav(four);
            el.parentElement.querySelector('.before').focus();

            const stops = [];
            for (let i = 0; i < 4; i++) {
                await userEvent.keyboard('{Tab}');
                stops.push(activeElement().getRootNode().host.id);
            }

            expect(stops).toEqual(['inbox', 'today', 'upcoming', 'done']);
        });
    });

    describe('a destination', () => {
        it('is a link with an address, and with a target the page names', async () => {
            const el = await nav(`
                ${destination('Inbox')}
                <el-nav-item id="docs" href="https://example.com/docs" target="_blank">${icon}Docs</el-nav-item>
            `);
            const inbox = part(el.querySelector('#inbox'), 'link');
            const docs = part(el.querySelector('#docs'), 'link');

            expect(inbox.getAttribute('href')).toBe('#inbox');
            expect(inbox.hasAttribute('target')).toBe(false);
            expect(inbox.hasAttribute('rel')).toBe(false);
            expect(docs.getAttribute('target')).toBe('_blank');
            expect(docs.getAttribute('rel')).toBe('noreferrer noopener');
        });

        it('has its icon over its text, in the middle', async () => {
            const el = await nav(four);
            const item = el.querySelector('#today');
            const [iconLeft, iconTop, iconWidth, iconHeight] = box(item, item.querySelector('svg'));
            const [labelLeft, labelTop, labelWidth] = box(item, part(item, 'label'));

            expect(labelTop).toBeGreaterThanOrEqual(iconTop + iconHeight);
            expect(iconLeft + iconWidth / 2).toBe(50);
            expect(Math.round(labelLeft + labelWidth / 2)).toBe(50);
        });

        it('reads a count with the name of the destination', async () => {
            const el = await nav(`
                ${destination('Inbox', '', '<el-badge slot="badge" pill="true" variant="danger">12</el-badge>')}
                ${destination('Today')}
                ${destination('Done')}
            `);
            const item = el.querySelector('#inbox');

            expect(await accessibleName(part(item, 'link'))).toBe('Inbox 12');
            // The badge is on the corner of the icon, and takes no room: the bar is as high as
            // without it.
            const badge = item.querySelector('el-badge').getBoundingClientRect();
            const drawing = item.querySelector('svg').getBoundingClientRect();
            expect(badge.left).toBeGreaterThan(drawing.left + drawing.width / 2);
            expect(badge.top).toBeLessThan(drawing.top + drawing.height / 2);
            expect(box(el, part(el, 'base'))[3]).toBe(57);
        });
    });

    describe('the bar', () => {
        it('gives three to five destinations the width in equal parts', async () => {
            for (const count of [3, 4, 5]) {
                const names = ['Inbox', 'Today', 'A much longer name', 'Done', 'More'].slice(0, count);
                const el = await nav(names.map((name, index) => destination(index === 2 ? 'Long' : name)).join(''));
                el.querySelector('#long').lastChild.textContent = 'A much longer name of a destination';
                await rendered();

                const widths = [...el.querySelectorAll('el-nav-item')].map((item) => box(el, item)[2]);
                expect(widths).toEqual(Array.from({ length: count }, () => Math.round(4000 / count) / 10));
            }
        });

        it('cuts a text that does not fit, and keeps its height', async () => {
            const el = await nav(`
                ${destination('Inbox')}
                <el-nav-item id="long" href="#long">${icon}A much longer name of a destination</el-nav-item>
                ${destination('Today')}
                ${destination('Upcoming')}
                ${destination('Done')}
            `);
            const label = part(el.querySelector('#long'), 'label');

            expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
            expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
            expect(label.getBoundingClientRect().height).toBeLessThan(20);
            // A control of 40px and 8px above and below it, and the line of 1px: as an app bar.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            // The whole text is there for assistive technology.
            expect(await accessibleName(part(el.querySelector('#long'), 'link'))).toBe(
                'A much longer name of a destination',
            );
        });

        it('has the first destination at the right in a right-to-left page', async () => {
            const el = await nav(four, { dir: 'rtl' });

            expect(box(el, el.querySelector('#inbox'))[0]).toBe(300);
            expect(box(el, el.querySelector('#done'))[0]).toBe(0);
        });

        it('has a surface and a line to the content from the tokens', async () => {
            const el = await nav(four);
            const { backgroundColor, borderTopWidth, borderTopColor } = getComputedStyle(part(el, 'base'));

            expect(backgroundColor).toBe('rgb(255, 255, 255)');
            expect([borderTopWidth, borderTopColor]).toEqual(['1px', 'rgb(150, 150, 150)']);
        });
    });

    describe('the rail', () => {
        const rail = (content = four, options = {}) =>
            nav(content, { attributes: 'label="Main" layout="rail"', height: 400, ...options });
        const settings = `
            <el-nav-item slot="end" id="settings" href="#settings">${icon}Settings</el-nav-item>
            <el-nav-item slot="end" id="account" href="#account">${icon}Account</el-nav-item>
        `;

        it('has its destinations below each other, in a column of 5rem with a line to the content', async () => {
            const el = await rail();
            const { borderRightWidth, borderTopWidth } = getComputedStyle(part(el, 'base'));

            // As high as its place, and 80px with the line of 1px.
            expect(box(el.parentElement, part(el, 'base')).slice(2)).toEqual([81, 400]);
            expect([borderRightWidth, borderTopWidth]).toEqual(['1px', '0px']);
            expect([...el.querySelectorAll('el-nav-item')].map((item) => box(el, item))).toEqual([
                [0, 0, 80, 56],
                [0, 56, 80, 56],
                [0, 112, 80, 56],
                [0, 168, 80, 56],
            ]);
        });

        it('is as wide as the page says', async () => {
            const el = await rail(four, { style: `${theme} --el-nav-rail-size: 100px;` });
            expect(box(el.parentElement, part(el, 'base'))[2]).toBe(101);
        });

        it('has a group at its top and a group at its lower end', async () => {
            const el = await rail(`${four}${settings}`);

            expect(await accessibleRole(part(el, 'end'))).toBe('list');
            expect(box(el, el.querySelector('#inbox'))[1]).toBe(0);
            // The last one ends where the rail ends.
            const [, top, , height] = box(el, el.querySelector('#account'));
            expect(top + height).toBe(400);
            expect(box(el, el.querySelector('#settings'))[1]).toBe(400 - 2 * 56);
        });

        it('leaves the list of the lower end out while it is empty', async () => {
            const el = await rail();
            expect(part(el, 'end').hidden).toBe(true);

            el.insertAdjacentHTML('beforeend', settings);
            await rendered();
            expect(part(el, 'end').hidden).toBe(false);
        });

        it('scrolls where it has more destinations than its height takes, and every one is reached', async () => {
            const many = Array.from({ length: 12 }, (_, i) => destination(`Place${i}`)).join('');
            const el = await rail(`${many}${settings}`);
            const list = part(el, 'groups');

            expect(getComputedStyle(list).overflowY).toBe('auto');
            expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
            // The rail is as high as its place, and the group at the lower end stays in view.
            expect(box(el.parentElement, part(el, 'base'))[3]).toBe(400);
            const [, top, , height] = box(el, el.querySelector('#account'));
            expect(top + height).toBe(400);

            // The Tab key stops at every destination, and the one with the focus is in view.
            el.parentElement.querySelector('.before').focus();
            const stops = [];
            for (let i = 0; i < 14; i++) {
                await userEvent.keyboard('{Tab}');
                stops.push(activeElement().getRootNode().host.id);
            }
            expect(stops).toEqual([...Array.from({ length: 12 }, (_, i) => `place${i}`), 'settings', 'account']);
            el.querySelector('#place11').shadowRoot.querySelector('a').focus();
            await nextFrame();
            const last = el.querySelector('#place11').getBoundingClientRect();
            const view = list.getBoundingClientRect();
            expect(last.top).toBeGreaterThanOrEqual(view.top);
            expect(last.bottom).toBeLessThanOrEqual(view.bottom);
        });

        it('has its line at the left in a right-to-left page', async () => {
            const el = await rail(four, { dir: 'rtl' });
            const { borderLeftWidth, borderRightWidth } = getComputedStyle(part(el, 'base'));

            expect([borderLeftWidth, borderRightWidth]).toEqual(['1px', '0px']);
        });

        it('marks the current destination as in a bar', async () => {
            const el = await rail();
            const link = part(el.querySelector('#inbox'), 'link');

            expect(link.getAttribute('aria-current')).toBe('page');
            expect(getComputedStyle(link).fontWeight).toBe('600');
            expect(getComputedStyle(part(el.querySelector('#inbox'), 'icon')).backgroundColor).toBe(
                'rgb(230, 230, 230)',
            );
        });

        it('passes axe', async () => {
            const el = await rail(`${four}${settings}`);
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });
    });

    describe('the list', () => {
        const list = (content = four, options = {}) =>
            nav(content, { attributes: 'label="Main" layout="list"', width: 300, height: 400, ...options });
        const settings = `
            <el-nav-item slot="end" id="settings" href="#settings">${icon}Settings</el-nav-item>
            <el-nav-item slot="end" id="account" href="#account">${icon}Account</el-nav-item>
        `;

        it('has its destinations below each other, as wide as its place, with a line to the content', async () => {
            const el = await list();
            const { borderRightWidth, borderTopWidth } = getComputedStyle(part(el, 'base'));

            expect(box(el.parentElement, part(el, 'base')).slice(2)).toEqual([300, 400]);
            expect([borderRightWidth, borderTopWidth]).toEqual(['1px', '0px']);
            // A row is as high as a control, with room around the rows and between them.
            expect([...el.querySelectorAll('el-nav-item')].map((item) => box(el, item))).toEqual([
                [8, 8, 283, 40],
                [8, 52, 283, 40],
                [8, 96, 283, 40],
                [8, 140, 283, 40],
            ]);
        });

        it('has the text of a destination beside its icon, in one row', async () => {
            const el = await list();
            const today = el.querySelector('#today');
            const [iconLeft, iconTop, iconWidth, iconHeight] = box(today, part(today, 'icon'));
            const [labelLeft, labelTop, , labelHeight] = box(today, part(today, 'label'));

            // The icon at the start, the text after it, both in the middle of the row.
            expect(iconLeft).toBe(13);
            expect(labelLeft).toBe(iconLeft + iconWidth + 12);
            expect(Math.abs(iconTop + iconHeight / 2 - 20)).toBeLessThanOrEqual(0.5);
            expect(Math.abs(labelTop + labelHeight / 2 - 20)).toBeLessThanOrEqual(0.5);
            expect(getComputedStyle(part(today, 'link')).fontSize).toBe('14px');
        });

        it('is as wide as its own width where its place is as wide as what is in it', async () => {
            const el = await list(four, { style: `${theme} display: flex; align-items: flex-start;` });
            // 16rem, and the line.
            expect(box(el.parentElement, part(el, 'base'))[2]).toBe(257);

            const wider = await list(four, {
                style: `${theme} display: flex; align-items: flex-start; --el-nav-list-size: 300px;`,
                width: 600,
            });
            expect(box(wider.parentElement, part(wider, 'base'))[2]).toBe(301);
        });

        it('is as wide as a place that is narrower than its own width', async () => {
            const el = await list(four, { width: 180 });

            expect(box(el.parentElement, part(el, 'base'))[2]).toBe(180);
            expect(box(el, el.querySelector('#inbox'))[2]).toBe(163);
        });

        it('cuts a text that does not fit, and keeps the height of the row', async () => {
            const el = await list(destination('A very long name of a destination that does not fit'), { width: 180 });
            const item = el.querySelector('el-nav-item');
            const label = part(item, 'label');

            expect(box(el, item).slice(2)).toEqual([163, 40]);
            expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
            expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
        });

        it('marks the current destination by its weight and a surface behind its row, not by its colour alone', async () => {
            const el = await list();
            const look = (id) => {
                const item = el.querySelector(id);
                const link = getComputedStyle(part(item, 'link'));
                const shape = getComputedStyle(part(item, 'icon'));
                return [
                    link.fontWeight,
                    link.color,
                    link.backgroundColor,
                    link.borderTopWidth,
                    link.borderTopLeftRadius,
                    shape.backgroundColor,
                    shape.borderTopWidth,
                ];
            };

            expect(look('#inbox')).toEqual([
                '600',
                'rgb(10, 10, 10)',
                'rgb(230, 230, 230)',
                '1px',
                '6px',
                TRANSPARENT,
                '0px',
            ]);
            expect(look('#today')).toEqual(['400', 'rgb(90, 90, 90)', TRANSPARENT, '0px', '6px', TRANSPARENT, '0px']);
            // A row is the same with and without the border of its surface, and so is what is in it.
            const boxes = (id) => ['link', 'icon', 'label'].map((name) => box(el, part(el.querySelector(id), name)));
            const [inbox, today] = [boxes('#inbox'), boxes('#today')];
            expect(inbox.map(([left, , , height]) => [left, height])).toEqual(
                today.map(([left, , , height]) => [left, height]),
            );
        });

        it('has a count at the end of its row, read with the name of the destination', async () => {
            const el = await list(
                `${destination('Inbox', 'current="true"', '<el-badge slot="badge" pill="true">12</el-badge>')}${destination('Today')}`,
            );
            const inbox = el.querySelector('#inbox');
            const [linkLeft, , linkWidth, linkHeight] = box(inbox, part(inbox, 'link'));
            const [labelLeft, , labelWidth] = box(inbox, part(inbox, 'label'));
            const [badgeLeft, badgeTop, badgeWidth, badgeHeight] = box(inbox, part(inbox, 'badge'));

            expect(getComputedStyle(part(inbox, 'badge')).position).toBe('static');
            // After the text, which takes the room in between, and 12px and the border from the end.
            expect(badgeLeft).toBe(labelLeft + labelWidth + 12);
            expect(badgeLeft + badgeWidth).toBe(linkLeft + linkWidth - 13);
            expect(Math.abs(badgeTop + badgeHeight / 2 - linkHeight / 2)).toBeLessThanOrEqual(0.5);
            expect(await accessibleName(part(inbox, 'link'))).toBe('Inbox 12');
        });

        it('has a group at its lower end, which stays in view while the others scroll', async () => {
            const many = Array.from({ length: 12 }, (_, i) => destination(`Place${i}`)).join('');
            const el = await list(`${many}${settings}`);
            const groups = part(el, 'groups');

            expect(await accessibleRole(part(el, 'end'))).toBe('list');
            expect(groups.scrollHeight).toBeGreaterThan(groups.clientHeight);
            expect(box(el.parentElement, part(el, 'base'))[3]).toBe(400);
            const [, top, , height] = box(el, el.querySelector('#account'));
            expect(top + height).toBe(400 - 8);

            el.parentElement.querySelector('.before').focus();
            const stops = [];
            for (let i = 0; i < 14; i++) {
                await userEvent.keyboard('{Tab}');
                stops.push(activeElement().getRootNode().host.id);
            }
            expect(stops).toEqual([...Array.from({ length: 12 }, (_, i) => `place${i}`), 'settings', 'account']);
        });

        it('has its line at the left in a right-to-left page, and the icon at the right of its text', async () => {
            const el = await list(four, { dir: 'rtl' });
            const today = el.querySelector('#today');
            const { borderLeftWidth, borderRightWidth } = getComputedStyle(part(el, 'base'));

            expect([borderLeftWidth, borderRightWidth]).toEqual(['1px', '0px']);
            expect(box(today, part(today, 'icon'))[0]).toBeGreaterThan(box(today, part(today, 'label'))[0]);
        });

        it('passes axe', async () => {
            const el = await list(`${four}${settings}`);
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });
    });

    describe('the second group', () => {
        const more = `
            <el-nav-item slot="secondary" id="news" href="#news">${icon}News</el-nav-item>
            <el-nav-item slot="secondary" id="feedback" href="#feedback">${icon}Feedback</el-nav-item>
        `;
        const withMore = (layout, options = {}) =>
            nav(`${four}${more}`, {
                attributes: `label="Main" layout="${layout}" secondary-label="More"`,
                width: 300,
                height: 500,
                ...options,
            });

        it('is a list of its own below the first, under its heading, in a list', async () => {
            const el = await withMore('list');
            const heading = part(el, 'secondary-label');
            const [, headingTop, , headingHeight] = box(el, heading);

            expect(heading.textContent.trim()).toBe('More');
            expect(getComputedStyle(heading).display).toBe('block');
            expect(headingTop).toBeGreaterThan(box(el, el.querySelector('#done'))[1] + 40);
            expect(box(el, el.querySelector('#news'))[1]).toBeGreaterThanOrEqual(headingTop + headingHeight);
            // The heading starts where the icons of the rows start.
            expect(box(el, heading)[0]).toBe(0);
            expect(getComputedStyle(heading).paddingLeft).toBe('21px');
            expect(box(el, el.querySelector('#news')).slice(2)).toEqual([283, 40]);
        });

        it('has the heading as its name, read once', async () => {
            const el = await withMore('list');
            const group = part(el, 'secondary-list');

            expect(await accessibleRole(group)).toBe('list');
            expect(await accessibleName(group)).toBe('More');
            expect(part(el, 'secondary-label').getAttribute('aria-hidden')).toBe('true');
            // The first group has no name: it is the navigation.
            expect(await accessibleName(part(el, 'list'))).toBe('');
        });

        it('is below a line in a rail, and its heading is its name alone', async () => {
            const el = await withMore('rail');
            const group = part(el, 'secondary');

            expect(getComputedStyle(part(el, 'secondary-label')).display).toBe('none');
            expect(getComputedStyle(group).borderTopWidth).toBe('1px');
            expect(await accessibleName(part(el, 'secondary-list'))).toBe('More');
            // Below the four of the first group, the line and the room around it.
            expect(box(el, el.querySelector('#news'))).toEqual([0, 4 * 56 + 8 + 1, 80, 56]);
            expect(box(el, el.querySelector('#feedback'))).toEqual([0, 5 * 56 + 8 + 1, 80, 56]);
        });

        it('is left out in a bar, which has no room for it', async () => {
            const el = await nav(`${four}${more}`, { attributes: 'label="Main" secondary-label="More"' });

            expect(getComputedStyle(part(el, 'secondary')).display).toBe('none');
            expect(el.querySelector('#news').getBoundingClientRect().width).toBe(0);
            expect(await accessibleRole(part(el, 'secondary-list'))).not.toBe('list');
            expect(box(el, el.querySelector('#inbox'))[2]).toBe(100);
        });

        it('is not there while it is empty, and has no heading while the page gives none', async () => {
            const el = await nav(four, { attributes: 'label="Main" layout="list"', width: 300, height: 500 });
            expect(part(el, 'secondary').hidden).toBe(true);

            el.insertAdjacentHTML('beforeend', more);
            await rendered();
            expect(part(el, 'secondary').hidden).toBe(false);
            expect(part(el, 'secondary-label').hidden).toBe(true);
            expect(part(el, 'secondary-list').hasAttribute('aria-label')).toBe(false);

            el.setAttribute('secondary-label', 'Mehr');
            await rendered();
            expect(part(el, 'secondary-label').hidden).toBe(false);
            expect(await accessibleName(part(el, 'secondary-list'))).toBe('Mehr');
        });

        it('scrolls with the first group, above the group at the lower end', async () => {
            const el = await withMore('list', { height: 200 });
            el.insertAdjacentHTML(
                'beforeend',
                `<el-nav-item slot="end" id="settings" href="#settings">${icon}Settings</el-nav-item>`,
            );
            await rendered();
            const groups = part(el, 'groups');

            expect(groups.scrollHeight).toBeGreaterThan(groups.clientHeight);
            groups.scrollTop = groups.scrollHeight;
            await nextFrame();
            const feedback = el.querySelector('#feedback').getBoundingClientRect();
            const settings = el.querySelector('#settings').getBoundingClientRect();
            expect(feedback.bottom).toBeLessThanOrEqual(settings.top);
            expect(feedback.bottom).toBeLessThanOrEqual(groups.getBoundingClientRect().bottom);
        });

        it('passes axe in a list and in a rail', async () => {
            for (const layout of ['list', 'rail']) {
                const el = await withMore(layout);
                const results = await axe.run(el.parentElement);
                expect(results.violations).toEqual([]);
            }
        });
    });

    describe('the group at the lower end, in a bar', () => {
        it('is left out: a bar has no room for it', async () => {
            const el = await nav(
                `${four}<el-nav-item slot="end" id="settings" href="#settings">${icon}Settings</el-nav-item>`,
            );

            expect(getComputedStyle(part(el, 'end')).display).toBe('none');
            expect(el.querySelector('#settings').getBoundingClientRect().width).toBe(0);
            expect(box(el, el.querySelector('#inbox'))[2]).toBe(100);
        });
    });

    describe('destinations with an icon alone', () => {
        const iconsOnly = (options = {}) =>
            nav(four, { attributes: 'label="Main" layout="rail" labels="false"', height: 400, ...options });
        const tooltips = (el) => [...el.shadowRoot.querySelectorAll('el-tooltip')];

        it('keep their texts as the names of their links, off the screen', async () => {
            const el = await iconsOnly();
            const item = el.querySelector('#today');
            const { width, height } = part(item, 'label').getBoundingClientRect();

            expect([width, height]).toEqual([1, 1]);
            expect(await accessibleName(part(item, 'link'))).toBe('Today');
            // The destination is as high as with its text: the rail does not jump.
            expect(box(el, item)).toEqual([0, 56, 80, 56]);
        });

        it('show their names as tooltips, for the keyboard and for the pointer', async () => {
            const el = await iconsOnly();
            const item = el.querySelector('#today');
            const tooltip = tooltips(el)[1];

            expect(tooltips(el).map((entry) => entry.textContent.trim())).toEqual([
                'Inbox',
                'Today',
                'Upcoming',
                'Done',
            ]);
            expect(tooltip.matches(':popover-open')).toBe(false);

            part(item, 'link').focus();
            await expect.poll(() => tooltip.matches(':popover-open')).toBe(true);
            await rendered();
            // Beside the rail, on the side of the content.
            expect(el.getBoundingClientRect().width).toBe(81);
            expect(tooltip.getBoundingClientRect().left).toBeGreaterThanOrEqual(el.getBoundingClientRect().right - 1);
            // The name is on the link already: a screen reader does not read it twice.
            expect(tooltip.getAttribute('aria-hidden')).toBe('true');
            expect(part(item, 'link').hasAttribute('aria-describedby')).toBe(false);

            part(item, 'link').blur();
            await expect.poll(() => tooltip.matches(':popover-open')).toBe(false);

            await userEvent.hover(item);
            await expect.poll(() => tooltip.matches(':popover-open')).toBe(true);
            await userEvent.unhover(item);
        });

        it('have no tooltips while their texts show, and take no room with them', async () => {
            const withTexts = await nav(four, { attributes: 'label="Main" layout="rail"', height: 400 });
            const without = await iconsOnly();

            expect(tooltips(withTexts)).toEqual([]);
            for (const tooltip of tooltips(without)) {
                expect(getComputedStyle(tooltip).display).toBe('none');
            }

            withTexts.labels = false;
            await rendered();
            expect(tooltips(withTexts).length).toBe(4);
            expect(part(withTexts.querySelector('#today'), 'label').getBoundingClientRect().width).toBe(1);
        });

        it('follow a text that changes, and a destination that comes', async () => {
            const el = await iconsOnly();

            el.querySelector('#today').lastChild.textContent = 'Heute';
            el.insertAdjacentHTML('beforeend', destination('More'));
            await rendered();
            await rendered();

            expect(tooltips(el).map((entry) => entry.textContent.trim())).toEqual([
                'Inbox',
                'Heute',
                'Upcoming',
                'Done',
                'More',
            ]);
        });

        it('show the tooltips above a bar', async () => {
            // With room above it: a tooltip without room goes to the other side.
            const el = await nav(four, {
                attributes: 'label="Main" layout="bar" labels="false"',
                style: `${theme} padding-top: 200px;`,
            });
            const item = el.querySelector('#today');
            const tooltip = tooltips(el)[1];

            part(item, 'link').focus();
            await expect.poll(() => tooltip.matches(':popover-open')).toBe(true);
            await rendered();

            expect(tooltip.getBoundingClientRect().bottom).toBeLessThanOrEqual(item.getBoundingClientRect().top + 1);
        });

        it('pass axe', async () => {
            const el = await iconsOnly();
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });
    });

    describe('the layout by where the element is', () => {
        let frames = 0;
        const frameWith = async (slot, { width = 1000, attributes = '', nav = '' } = {}) => {
            const wrapper = await fixture(`
                <div style="${theme} width: ${width}px;">
                    <el-app-frame style="position: relative; height: 600px" ${attributes}>
                        <main id="auto-main-${frames++}"><p>Content</p></main>
                        <el-nav slot="${slot}" label="Main" ${nav}>${four}</el-nav>
                    </el-app-frame>
                </div>
            `);
            wrappers.push(wrapper);
            await nextFrame();
            await nextFrame();
            return wrapper.querySelector('el-nav');
        };
        const tops = (el) => [...el.querySelectorAll('el-nav-item')].map((item) => Math.round(box(el, item)[1]));

        it('is a bar alone, and in the footer of a frame', async () => {
            const alone = await nav(four);
            const inFooter = await frameWith('footer');

            expect(tops(alone)).toEqual([1, 1, 1, 1]);
            expect(tops(inFooter)).toEqual([0, 0, 0, 0]);
        });

        it('is a rail in the column at the side of a frame, as high as the column', async () => {
            const el = await frameWith('navigation', { attributes: 'narrow-navigation="bar"' });
            const frame = el.closest('el-app-frame');

            expect(tops(el)).toEqual([0, 56, 112, 168]);
            expect(box(frame, part(el, 'base'))).toEqual([0, 0, 80, 600]);
            // The region draws the line, and is as wide as the rail.
            expect(getComputedStyle(part(el, 'base')).borderRightWidth).toBe('0px');
            expect(box(frame, frame.shadowRoot.querySelector('[part~="navigation"]'))).toEqual([0, 0, 81, 600]);
        });

        it('is the list the page asks for in the column of a frame, and a bar where the frame is narrow', async () => {
            const attributes = 'narrow-navigation="bar"';
            const wide = await frameWith('navigation', { attributes, nav: 'column="list"' });
            const narrow = await frameWith('navigation', { attributes, nav: 'column="list"', width: 400 });
            const frame = wide.closest('el-app-frame');

            // The stylesheet decides: nothing is written onto the element.
            expect(wide.hasAttribute('layout')).toBe(false);
            expect(tops(wide)).toEqual([8, 52, 96, 140]);
            // As wide as a list is, in a column that is as wide as what is in it. The region
            // draws the line.
            expect(box(frame, part(wide, 'base'))).toEqual([0, 0, 256, 600]);
            expect(getComputedStyle(part(wide, 'base')).borderRightWidth).toBe('0px');
            expect(box(frame, frame.shadowRoot.querySelector('[part~="navigation"]'))).toEqual([0, 0, 257, 600]);
            expect(box(wide, wide.querySelector('#inbox'))).toEqual([8, 8, 240, 40]);

            expect(tops(narrow)).toEqual([0, 0, 0, 0]);
            expect(box(narrow, narrow.querySelector('#inbox'))[2]).toBe(100);
        });

        it('fills a column that has a width', async () => {
            const kept = await frameWith('navigation', {
                attributes: 'narrow-navigation="bar" navigation-size="320"',
                nav: 'column="list"',
            });
            const drawer = await frameWith('navigation', { nav: 'column="list"' });

            expect(box(kept.closest('el-app-frame'), part(kept, 'base'))).toEqual([0, 0, 320, 600]);
            // A frame whose navigation is a drawer where it is narrow has a column of 16rem.
            expect(box(drawer.closest('el-app-frame'), part(drawer, 'base'))).toEqual([0, 0, 256, 600]);
        });

        it('says so once, and a change of the attribute changes the column', async () => {
            const el = await frameWith('navigation', { attributes: 'narrow-navigation="bar"' });
            expect(tops(el)).toEqual([0, 56, 112, 168]);

            el.setAttribute('column', 'list');
            await rendered();
            expect(tops(el)).toEqual([8, 52, 96, 140]);
        });

        describe('in an element of the page that is in the slot', () => {
            const many = Array.from({ length: 14 }, (_, i) => destination(`Place${i}`)).join('');
            const wrapped = async ({ width = 1000, column = 'list' } = {}) => {
                const wrapper = await fixture(`
                    <div style="${theme} width: ${width}px;">
                        <el-app-frame style="position: relative; height: 600px" narrow-navigation="bar">
                            <main id="wrapped-main-${width}-${column}"><p>Content</p></main>
                            <div slot="navigation" class="side" style="display: flex; flex-direction: column; height: 100%">
                                <div class="logo" style="flex: none; height: 50px">Logo</div>
                                <el-nav label="Main" column="${column}">
                                    ${many}
                                    <el-nav-item slot="end" id="settings" href="#settings">${icon}Settings</el-nav-item>
                                </el-nav>
                                <div class="account" style="flex: none; height: 60px">Account</div>
                            </div>
                        </el-app-frame>
                    </div>
                `);
                wrappers.push(wrapper);
                await rendered();
                return wrapper.querySelector('el-nav');
            };

            it('takes its layout from the frame, as one that is in the slot itself', async () => {
                const list = await wrapped();
                const rail = await wrapped({ column: 'rail' });
                const bar = await wrapped({ width: 400 });

                expect(tops(list).slice(0, 3)).toEqual([8, 52, 96]);
                expect(box(list, list.querySelector('#place0')).slice(2)).toEqual([240, 40]);
                expect(tops(rail).slice(0, 3)).toEqual([0, 56, 112]);
                expect(box(rail, rail.querySelector('#place0')).slice(2)).toEqual([80, 56]);
                // One row at the lower edge. The group at the lower end is left out.
                const row = [...bar.querySelectorAll('el-nav-item:not([slot])')].map((item) => box(bar, item)[1]);
                expect(new Set(row).size).toBe(1);
                expect(bar.querySelector('#settings').getBoundingClientRect().height).toBe(0);
            });

            it('takes the height that is left, scrolls its destinations and keeps its lower end in view', async () => {
                const el = await wrapped();
                const frame = el.closest('el-app-frame');
                const region = frame.shadowRoot.querySelector('[part~="navigation"]');
                const groups = part(el, 'groups');

                // Between what the page has put above and below it.
                expect(box(frame, el)).toEqual([0, 50, 256, 600 - 50 - 60]);
                expect(box(frame, frame.querySelector('.account'))).toEqual([0, 540, 256, 60]);
                // The destinations scroll, and the column of the frame does not.
                expect(groups.scrollHeight).toBeGreaterThan(groups.clientHeight);
                expect(region.scrollHeight).toBe(region.clientHeight);
                const [, top, , height] = box(frame, el.querySelector('#settings'));
                expect(top + height).toBe(540 - 8);
            });

            it('passes axe', async () => {
                const el = await wrapped();
                const results = await axe.run(el.closest('el-app-frame').parentElement);
                expect(results.violations).toEqual([]);
            });
        });

        it('is the layout the page names, wherever it is', async () => {
            const wrapper = await fixture(`
                <div style="${theme} width: 1000px;">
                    <el-app-frame style="position: relative; height: 600px">
                        <main id="named-main"><p>Content</p></main>
                        <el-nav slot="navigation" label="Main" layout="bar">${four}</el-nav>
                    </el-app-frame>
                </div>
            `);
            wrappers.push(wrapper);
            await rendered();

            // In one row, under the line of the bar.
            expect(tops(wrapper.querySelector('el-nav'))).toEqual([1, 1, 1, 1]);
        });
    });

    describe('the current destination', () => {
        it('is told apart by its weight and by a shape behind its icon, not by its colour alone', async () => {
            const el = await nav(four);
            const look = (id) => {
                const item = el.querySelector(id);
                const link = getComputedStyle(part(item, 'link'));
                const shape = getComputedStyle(part(item, 'icon'));
                return [link.fontWeight, link.color, shape.backgroundColor, shape.borderTopWidth];
            };

            expect(look('#inbox')).toEqual(['600', 'rgb(10, 10, 10)', 'rgb(230, 230, 230)', '1px']);
            expect(look('#today')).toEqual(['400', 'rgb(90, 90, 90)', TRANSPARENT, '0px']);
            // The shape is the same size with and without its border.
            const size = (id) => box(el, part(el.querySelector(id), 'icon')).slice(2);
            expect(size('#inbox')).toEqual(size('#today'));
        });

        it('is told apart by its weight without a theme', async () => {
            const el = await nav(four, { style: 'font: 16px/24px sans-serif;' });

            expect(getComputedStyle(part(el.querySelector('#inbox'), 'link')).fontWeight).toBe('600');
            expect(getComputedStyle(part(el.querySelector('#today'), 'link')).fontWeight).toBe('400');
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('keeps the shape of the current destination as a border, and the line of the bar', async () => {
            const el = await nav(four);
            const shape = (id) => getComputedStyle(part(el.querySelector(id), 'icon'));

            expect(shape('#inbox').borderTopWidth).toBe('1px');
            expect(shape('#inbox').borderTopColor).not.toBe(TRANSPARENT);
            expect(shape('#today').borderTopWidth).toBe('0px');
            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('1px');
        });

        it('has the line of the bar without a theme as well', async () => {
            const el = await nav(four, { style: 'font: 16px/24px sans-serif;' });
            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('1px');
        });

        it('keeps the surface of the current row of a list as a border, and no other row has one', async () => {
            const el = await nav(four, { attributes: 'label="Main" layout="list"', width: 300, height: 400 });
            const row = (id) => getComputedStyle(part(el.querySelector(id), 'link'));

            expect(row('#inbox').borderTopWidth).toBe('1px');
            expect(row('#inbox').borderTopColor).not.toBe(TRANSPARENT);
            expect(row('#today').borderTopWidth).toBe('0px');
            expect(getComputedStyle(part(el, 'base')).borderRightWidth).toBe('1px');
        });

        it('has the line over the second group of a rail without a theme as well', async () => {
            const el = await nav(
                `${four}<el-nav-item slot="secondary" id="news" href="#news">${icon}News</el-nav-item>`,
                { attributes: 'label="Main" layout="rail"', height: 500, style: 'font: 16px/24px sans-serif;' },
            );
            expect(getComputedStyle(part(el, 'secondary')).borderTopWidth).toBe('1px');
        });
    });

    describe('without a theme', () => {
        it('paints nothing of its own, and reads in a light and in a dark scheme', async () => {
            for (const [scheme, attributes] of [
                ['light', 'label="Main"'],
                ['dark', 'label="Main"'],
                ['light', 'label="Main" layout="list" secondary-label="More"'],
                ['dark', 'label="Main" layout="list" secondary-label="More"'],
            ]) {
                const el = await nav(`${four}<el-nav-item slot="secondary" href="#news">${icon}News</el-nav-item>`, {
                    attributes,
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });

                expect(getComputedStyle(part(el, 'base')).backgroundColor).toBe(TRANSPARENT);
                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every destination at least as large as a finger needs', async () => {
            // A theme with small controls, and five destinations in a narrow bar.
            const el = await nav(
                ['Inbox', 'Today', 'Upcoming', 'Done', 'More'].map((name) => destination(name)).join(''),
                { style: `${theme} --el-control-height: 20px;`, width: 320 },
            );

            for (const item of el.querySelectorAll('el-nav-item')) {
                const { width, height } = part(item, 'link').getBoundingClientRect();
                expect(width).toBeGreaterThanOrEqual(44);
                expect(height).toBeGreaterThanOrEqual(44);
            }
        });

        it('makes every row of a list at least as high as a finger needs', async () => {
            const el = await nav(four, { attributes: 'label="Main" layout="list"', width: 300, height: 400 });

            for (const item of el.querySelectorAll('el-nav-item')) {
                expect(part(item, 'link').getBoundingClientRect().height).toBe(44);
            }
        });
    });

    describe('in the footer of a frame', () => {
        it('leaves the line to the region, which draws it', async () => {
            const el = await framed(four);
            const frame = el.closest('el-app-frame');
            const footer = frame.shadowRoot.querySelector('[part~="footer"]');

            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('0px');
            expect(getComputedStyle(footer).borderTopWidth).toBe('1px');
            expect(box(frame, footer)).toEqual([0, 600 - 57, 400, 57]);
        });

        it('is left out where the frame is wide, when the page says so, without a script', async () => {
            const narrow = await framed(four, { attributes: 'narrow-only="footer"' });
            const wide = await framed(four, { attributes: 'narrow-only="footer"', width: 1000 });

            expect(box(narrow.closest('el-app-frame'), narrow)[3]).toBe(56);
            expect(wide.getBoundingClientRect().height).toBe(0);
            expect(await accessibleRole(part(wide, 'base'))).not.toBe('navigation');
        });
    });

    describe('on a phone with a home indicator', () => {
        useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

        it('reaches the lower edge of the screen with its surface in the footer of a frame, and its destinations do not', async () => {
            const el = await framed(four);
            const frame = el.closest('el-app-frame');

            // The surface: to the lower edge and to both sides, 34px higher than its row.
            expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 56, 400, 56 + 34]);
            // The destinations: above the home indicator, clear of the sides.
            expect(box(frame, part(el, 'list'))).toEqual([10, 600 - 34 - 56, 370, 56]);
            // The region of the frame is as high as the bar and its line: the room is there once.
            expect(box(frame, frame.shadowRoot.querySelector('[part~="footer"]'))).toEqual([0, 600 - 91, 400, 91]);
        });

        it('keeps its destinations above the home indicator alone as well', async () => {
            const el = await nav(four);

            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57 + 34]);
            expect(box(el, part(el, 'list'))).toEqual([10, 1, 370, 56]);
            // Alone it is not moved: the surface is the element.
            expect(el.getBoundingClientRect().height).toBe(57 + 34);
        });

        it('swaps the sides alone in a right-to-left page', async () => {
            const el = await nav(four, { dir: 'rtl' });
            expect(box(el, part(el, 'list'))).toEqual([10, 1, 370, 56]);
            const { paddingLeft, paddingRight } = getComputedStyle(part(el, 'base'));
            expect([paddingLeft, paddingRight]).toEqual(['10px', '20px']);
        });

        it('keeps a rail clear of the top, the side and the lower edge of the screen alone', async () => {
            const el = await nav(four, { attributes: 'label="Main" layout="rail"', height: 400 });
            const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(part(el, 'base'));

            expect([paddingTop, paddingRight, paddingBottom, paddingLeft]).toEqual(['47px', '0px', '34px', '10px']);
            // The destinations are 5rem wide, and the room of the screen is on top.
            expect(box(el.parentElement, part(el, 'base')).slice(2)).toEqual([10 + 80 + 1, 400]);
            expect(box(el, el.querySelector('#inbox'))).toEqual([10, 47, 80, 56]);
        });

        it('reaches the side of the screen with the surface of a rail in a frame, and its destinations do not', async () => {
            const wrapper = await fixture(`
                <div style="${theme} width: 1000px;">
                    <el-app-frame style="position: relative; height: 600px" narrow-navigation="bar">
                        <header slot="header" style="display: block; height: 50px">Header</header>
                        <main id="rail-safe"><p>Content</p></main>
                        <el-nav slot="navigation" label="Main">${four}</el-nav>
                    </el-app-frame>
                </div>
            `);
            wrappers.push(wrapper);
            await rendered();
            const el = wrapper.querySelector('el-nav');
            const frame = wrapper.querySelector('el-app-frame');

            // Below the header, which is 47px higher. From the left edge, and the frame keeps the
            // lower edge clear itself, as there is no footer.
            expect(box(frame, part(el, 'base'))).toEqual([0, 98, 90, 600 - 98 - 34]);
            expect(box(frame, el.querySelector('#inbox'))).toEqual([10, 98, 80, 56]);
        });

        it('keeps the room once in a page that resets every margin and padding', async () => {
            const reset = new CSSStyleSheet();
            reset.replaceSync(
                '*, ::before, ::after { margin: 0; padding: 0; box-sizing: border-box; border-width: 0; }',
            );
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
            try {
                const el = await framed(four);
                const frame = el.closest('el-app-frame');

                expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 56, 400, 56 + 34]);
                expect(box(frame, part(el, 'list'))).toEqual([10, 600 - 34 - 56, 370, 56]);
            } finally {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);
            }
        });
    });

    describe('accessibility', () => {
        it('passes axe', async () => {
            const el = await nav(`
                ${destination('Inbox', 'current="true"', '<el-badge slot="badge" pill="true">12</el-badge>')}
                ${destination('Today')}
                ${destination('Done')}
            `);
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe in the footer of a frame', async () => {
            const el = await framed(four);
            const results = await axe.run(el.closest('el-app-frame').parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});
