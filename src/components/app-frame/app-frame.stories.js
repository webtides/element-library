import { html } from '@webtides/element-js';
import readme from './app-frame.readme.md?raw';
import { define } from './app-frame.js';
import { define as defineAppBar } from '../app-bar/app-bar.js';
import { define as defineBadge } from '../badge/badge.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDescriptionList } from '../description-list/description-list.js';
import { define as defineDialog } from '../dialog/dialog.js';
import { define as defineList } from '../list/list.js';
import { define as defineListItem } from '../list-item/list-item.js';
import { define as defineNav } from '../nav/nav.js';
import { define as defineNavItem } from '../nav-item/nav-item.js';
import { define as defineScrollToTop } from '../scroll-to-top/scroll-to-top.js';
import { toast } from '../toast/toast.js';
define();
defineAppBar();
defineBadge();
defineButton();
defineDescriptionList();
defineDialog();
defineList();
defineListItem();
defineNav();
defineNavItem();
defineScrollToTop();

export default {
    title: 'Components/AppFrame',
    component: 'el-app-frame',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: readme,
            },
            // A frame fills the viewport: on the page of the docs every story has a viewport of
            // its own.
            story: { inline: false, height: '40rem' },
        },
    },
    args: {
        wideFrom: '48rem',
        skipLabel: 'Skip to content',
    },
    argTypes: {
        wideFrom: { options: ['30rem', '40rem', '48rem', '64rem', '80rem'], control: { type: 'inline-radio' } },
    },
    // A page that reaches under the notch and the home indicator of a phone says so in its
    // viewport. The frame keeps its regions clear of them.
    beforeEach() {
        const viewport = document.querySelector('meta[name="viewport"]');
        const before = viewport?.getAttribute('content');
        if (viewport && !before.includes('viewport-fit'))
            viewport.setAttribute('content', `${before}, viewport-fit=cover`);
        return () => viewport?.setAttribute('content', before);
    },
};

// Icons of the destinations: decorations, the destinations have their names. Each is a whole
// <svg>: a part of one that is put in from another template would be no part of the drawing.
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
const menu = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
    >
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
`;
const destinations = [
    { name: 'Inbox', current: true, icon: 'M4 13h4l2 3h4l2-3h4M4 13l2.5-8h11L20 13v6H4z' },
    { name: 'Today', icon: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M9 14h2v2H9z' },
    { name: 'Upcoming', icon: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18' },
    { name: 'Done', icon: 'm5 12 5 5 9-10' },
];

const lists = [
    { name: 'Inbox', count: 12, current: true },
    { name: 'Today', count: 3 },
    { name: 'Upcoming', count: 7 },
    { name: 'Waiting for others' },
    { name: 'Done' },
];

const tasks = [
    ['Write the release notes', 'Due today'],
    ['Answer the questions about the invoice', 'Due today'],
    ['Book the room for the workshop', 'Due tomorrow'],
    ['Read the proposal of the design team', 'Due on Friday'],
    ['Renew the certificate of the staging server', 'Due on Friday'],
    ['Plan the next sprint', 'Due next week'],
    ['Order the new laptops', 'Due next week'],
    ['Collect the feedback on the onboarding', 'Due next week'],
    ['Update the dependencies', 'No date'],
    ['Clean up the old branches', 'No date'],
    ['Write down how the deployment works', 'No date'],
    ['Check the contrast of the new theme', 'No date'],
    ['Move the images to the new bucket', 'No date'],
    ['Ask for the numbers of the last quarter', 'No date'],
    ['Find a date for the retrospective', 'No date'],
    ['Archive the projects of last year', 'No date'],
];

/**
 * An application in the frame: an app bar at the top and the tasks of one list as the content.
 * Where the frame is wide, the lists are a column at the start side and the task that is chosen
 * one at the end side. Where it is narrow, the places the user goes to all the time are a bar at
 * the lower edge.
 */
const application = ({ wideFrom, skipLabel, style = '' }) => html`
    <el-app-frame
        wide-from="${wideFrom}"
        skip-label="${skipLabel}"
        narrow-only="footer"
        navigation-label="Lists"
        wide-only="aside"
        style="${style}"
    >
        <header slot="header">
            <el-app-bar heading-level="1">
                <el-button slot="start" data-navigation-toggle circle="true" aria-label="Lists">${menu}</el-button>
                Tasks
                <el-button
                    slot="end"
                    variant="brand"
                    appearance="filled"
                    @click="${(event) => event.currentTarget.closest('el-app-frame').querySelector('el-dialog')?.show()}"
                    >New task</el-button
                >
            </el-app-bar>
        </header>

        <nav slot="navigation" aria-label="Lists" style="padding:0.5rem">
            <el-list label="Lists" density="compact" appearance="plain">
                ${lists.map(
                    ({ name, count, current }) => html`
                        <el-list-item
                            href="#${name.toLowerCase().replaceAll(' ', '-')}"
                            current="${current ? 'true' : 'false'}"
                        >
                            ${name} ${count ? html`<el-badge slot="end" pill="true">${count}</el-badge>` : ''}
                        </el-list-item>
                    `,
                )}
            </el-list>
        </nav>

        <main id="tasks" style="padding:1rem">
            <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:700">Inbox</h2>
            <el-list label="Tasks in the inbox" appearance="outlined">
                ${tasks.map(
                    ([title, due], index) => html`
                        <el-list-item current="${index === 1 ? 'true' : 'false'}">
                            ${title}
                            <span slot="description">${due}</span>
                        </el-list-item>
                    `,
                )}
            </el-list>
            <p style="margin:1rem 0 0">
                <el-scroll-to-top duration="300">
                    <el-button size="small" appearance="plain">Back to the top</el-button>
                </el-scroll-to-top>
            </p>
            <el-dialog label="New task">
                <p style="margin:0">A dialog is in the top layer: it shows over the frame, from any region.</p>
                <el-button
                    slot="footer"
                    variant="brand"
                    @click="${(event) => {
                        event.currentTarget.closest('el-dialog').hide();
                        toast('The task is saved.', { variant: 'success' });
                    }}"
                    >Save</el-button
                >
            </el-dialog>
        </main>

        <aside slot="aside" aria-label="The chosen task" style="padding:1rem">
            <h2 style="margin:0 0 0.75rem;font-size:1.125rem;font-weight:600">
                Answer the questions about the invoice
            </h2>
            <el-description-list>
                <dt>List</dt>
                <dd>Inbox</dd>
                <dt>Due</dt>
                <dd>Today</dd>
                <dt>From</dt>
                <dd>Ada Lovelace</dd>
            </el-description-list>
        </aside>

        <el-nav slot="footer" label="Main">
            ${destinations.map(
                ({ name, current, icon: path }) => html`
                    <el-nav-item href="#${name.toLowerCase()}" current="${current ? 'true' : 'false'}"
                        >${icon(path)}${name}</el-nav-item
                    >
                `,
            )}
        </el-nav>
    </el-app-frame>
`;

export const Application = {
    name: 'An application, on a desktop',
    parameters: {
        docs: {
            description: {
                story: 'The frame fills the viewport. The app bar stays in view, the content scrolls below it, and the lists and the chosen task are columns beside it. Make the window narrower than the width of `wide-from`: the lists open as a drawer from the button in the app bar, the chosen task goes (`wide-only="aside"`), and the destinations are a bar at the lower edge (`narrow-only="footer"`).',
            },
        },
    },
    render: ({ wideFrom, skipLabel }) => application({ wideFrom, skipLabel }),
};

export const Phone = {
    name: 'An application, on a phone',
    parameters: {
        docs: {
            description: {
                story: 'The same application in a box as wide as a phone: an app bar with the button that opens the lists as a drawer, the content, and the destinations at the lower edge. The frame is wide or narrow by its own width, so it is narrow here whatever the window is. A frame in a box of the page has a position and a height of its own.',
            },
        },
    },
    render: ({ wideFrom, skipLabel }) => html`
        <div style="display:flex;justify-content:center;padding:1rem">
            <div
                style="width:390px;max-width:100%;border:1px solid var(--el-color-border, currentColor);border-radius:1.5rem;overflow:hidden"
            >
                ${application({ wideFrom, skipLabel, style: 'position:relative;height:720px' })}
            </div>
        </div>
    `,
};

const region = (name, lines = 1) => html`
    <div style="padding:0.75rem;font-family:monospace">
        ${name}
        ${Array.from({ length: lines - 1 }, (_, index) => html`<p style="margin:0.5rem 0 0">Line ${index + 2}</p>`)}
    </div>
`;

export const Regions = {
    name: 'The five regions',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The page writes the element of every region, which is its landmark, and gives it to the slot of the region. The frame has no landmark of its own.',
            },
        },
    },
    render: () => html`
        <el-app-frame>
            <header slot="header">${region('<header slot="header">')}</header>
            <nav slot="navigation" aria-label="Main">${region('<nav slot="navigation">')}</nav>
            <main id="regions-main">${region('<main>, the content: it scrolls', 40)}</main>
            <aside slot="aside">${region('<aside slot="aside">')}</aside>
            <footer slot="footer">${region('<footer slot="footer">')}</footer>
        </el-app-frame>
    `,
};

export const EmptyRegions = {
    name: 'Regions the page leaves empty',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A region the page leaves empty takes no room. Here there is a header and the content.',
            },
        },
    },
    render: () => html`
        <el-app-frame>
            <header slot="header">${region('<header slot="header">')}</header>
            <main id="empty-main">${region('<main>', 40)}</main>
        </el-app-frame>
    `,
};

export const Widths = {
    name: 'The widths of the columns',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-app-frame-navigation-size` and `--el-app-frame-aside-size` are the widths of the two columns: `12rem` and `14rem` here.',
            },
        },
    },
    render: () => html`
        <el-app-frame style="--el-app-frame-navigation-size:12rem;--el-app-frame-aside-size:14rem">
            <nav slot="navigation" aria-label="Main">${region('12rem')}</nav>
            <main id="widths-main">${region('<main>', 10)}</main>
            <aside slot="aside">${region('14rem')}</aside>
        </el-app-frame>
    `,
};

export const WrittenOnce = {
    name: 'Destinations the page writes once',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An `el-nav` in the `navigation` slot, and `narrow-navigation="bar"` on the frame. Where the frame is wide, the destinations are a rail in the column at its side. Where it is narrow, the navigation lies at the lower edge and they are a bar. Make the window narrower to see it change: the stylesheets decide, by the width of the frame.',
            },
        },
    },
    render: () => html`
        <el-app-frame narrow-navigation="bar">
            <header slot="header"><el-app-bar heading-level="1">Tasks</el-app-bar></header>
            <el-nav slot="navigation" label="Main">
                ${destinations.map(
                    ({ name, current, icon: path }) => html`
                        <el-nav-item href="#${name.toLowerCase()}" current="${current ? 'true' : 'false'}"
                            >${icon(path)}${name}</el-nav-item
                        >
                    `,
                )}
            </el-nav>
            <main id="once-main" style="padding:1rem">
                <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:700">Inbox</h2>
                <el-list label="Tasks in the inbox" appearance="outlined">
                    ${tasks.map(
                        ([title, due]) => html`
                            <el-list-item>
                                ${title}
                                <span slot="description">${due}</span>
                            </el-list-item>
                        `,
                    )}
                </el-list>
            </main>
        </el-app-frame>
    `,
};
