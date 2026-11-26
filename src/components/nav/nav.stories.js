import { html } from '@webtides/element-js';
import readme from './nav.readme.md?raw';
import { define } from './nav.js';
import { define as defineNavItem } from '../nav-item/nav-item.js';
import { define as defineBadge } from '../badge/badge.js';
define();
defineNavItem();
defineBadge();

// Icons of the stories: decorations, the destinations have their names. Each is a whole <svg>: a
// part of one that is put in from another template would be no part of the drawing.
const icon = (path) => html`
    <svg
        slot="icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="${path}" />
    </svg>
`;
const icons = {
    inbox: 'M4 13h4l2 3h4l2-3h4M4 13l2.5-8h11L20 13v6H4z',
    today: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M9 14h2v2H9z',
    upcoming: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    done: 'm5 12 5 5 9-10',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
};

const phone = (content) => html`
    <div style="max-width:390px;border:1px solid var(--el-color-border, currentColor)">${content}</div>
`;

export default {
    title: 'Components/Nav',
    component: 'el-nav',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Main',
        layout: 'bar',
        labels: true,
    },
    argTypes: {
        layout: { options: ['auto', 'bar', 'rail'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, layout, labels }) =>
        phone(html`
            <el-nav
                label="${label}"
                layout="${layout}"
                labels="${labels ? 'true' : 'false'}"
                style="${layout === 'rail' ? 'height:24rem' : ''}"
            >
                <el-nav-item href="#inbox" current="true">${icon(icons.inbox)}Inbox</el-nav-item>
                <el-nav-item href="#today">${icon(icons.today)}Today</el-nav-item>
                <el-nav-item href="#upcoming">${icon(icons.upcoming)}Upcoming</el-nav-item>
                <el-nav-item href="#done">${icon(icons.done)}Done</el-nav-item>
            </el-nav>
        `),
};

export const Counts = {
    name: 'A count and a dot',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'What is in the `badge` slot sits on the corner of the icon. It is part of the link: a screen reader reads "Inbox 12 unread". A dot has no text for the eye and one for assistive technology.',
            },
        },
    },
    render: () =>
        phone(html`
            <el-nav label="Main">
                <el-nav-item href="#inbox" current="true">
                    ${icon(icons.inbox)}Inbox
                    <el-badge slot="badge" variant="danger" pill="true"
                        >12<span
                            style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap"
                        >
                            unread</span
                        ></el-badge
                    >
                </el-nav-item>
                <el-nav-item href="#today">
                    ${icon(icons.today)}Today
                    <span
                        slot="badge"
                        style="display:block;width:0.5rem;height:0.5rem;border-radius:50%;background:var(--el-color-accent, currentColor)"
                        ><span
                            style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap"
                            >has news</span
                        ></span
                    >
                </el-nav-item>
                <el-nav-item href="#done">${icon(icons.done)}Done</el-nav-item>
            </el-nav>
        `),
};

export const FiveDestinations = {
    name: 'Five destinations, and a long text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Three to five destinations share the width in equal parts. A text that does not fit is cut: it does not wrap, and the bar keeps its height.',
            },
        },
    },
    render: () =>
        phone(html`
            <el-nav label="Main">
                <el-nav-item href="#inbox">${icon(icons.inbox)}Inbox</el-nav-item>
                <el-nav-item href="#today" current="true">${icon(icons.today)}Today</el-nav-item>
                <el-nav-item href="#upcoming">${icon(icons.upcoming)}Upcoming and later</el-nav-item>
                <el-nav-item href="#done">${icon(icons.done)}Done</el-nav-item>
                <el-nav-item href="#more">${icon(icons.more)}More</el-nav-item>
            </el-nav>
        `),
};

const settings =
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 12h2M18 12h2M12 4v2M12 18v2M6.5 6.5l1.4 1.4M16.1 16.1l1.4 1.4M6.5 17.5l1.4-1.4M16.1 7.9l1.4-1.4';
const account = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M5 20a7 7 0 0 1 14 0';

const railOf = (labels) => html`
    <el-nav label="Main" layout="rail" labels="${labels ? 'true' : 'false'}">
        <el-nav-item href="#inbox" current="true">${icon(icons.inbox)}Inbox</el-nav-item>
        <el-nav-item href="#today">${icon(icons.today)}Today</el-nav-item>
        <el-nav-item href="#upcoming">${icon(icons.upcoming)}Upcoming</el-nav-item>
        <el-nav-item href="#done">${icon(icons.done)}Done</el-nav-item>
        <el-nav-item slot="end" href="#settings">${icon(settings)}Settings</el-nav-item>
        <el-nav-item slot="end" href="#account">${icon(account)}Account</el-nav-item>
    </el-nav>
`;

export const Rail = {
    name: 'A rail',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`layout="rail"`: the destinations below each other in a narrow column, with a group at its top and the `end` slot at its lower end. The rail is as high as its place, 26rem here.',
            },
        },
    },
    render: () => html`<div style="height:26rem;display:flex">${railOf(true)}</div>`,
};

export const IconsAlone = {
    name: 'A rail of icons alone',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`labels="false"`: the texts are off the screen and stay the names of the links. They show as tooltips, for the pointer and for the focus of the keyboard.',
            },
        },
    },
    render: () => html`<div style="height:26rem;display:flex">${railOf(false)}</div>`,
};

export const ShortRail = {
    name: 'More destinations than the height takes',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The group at the top scrolls, and the one at the lower end stays in view. The Tab key reaches every destination.',
            },
        },
    },
    render: () => html`<div style="height:14rem;display:flex">${railOf(true)}</div>`,
};
