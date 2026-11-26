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
    },
};

export const Playground = {
    render: ({ label }) =>
        phone(html`
            <el-nav label="${label}">
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
