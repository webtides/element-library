import { html } from '@webtides/element-js';
import readme from './app-frame.readme.md?raw';
import { define } from './app-frame.js';
import { define as defineAppBar } from '../app-bar/app-bar.js';
import { define as defineBadge } from '../badge/badge.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDescriptionList } from '../description-list/description-list.js';
import { define as defineDialog } from '../dialog/dialog.js';
import { define as defineInputField } from '../input-field/input-field.js';
import { define as defineList } from '../list/list.js';
import { define as defineListItem } from '../list-item/list-item.js';
import { define as defineNav } from '../nav/nav.js';
import { define as defineNavItem } from '../nav-item/nav-item.js';
import { define as defineScrollToTop } from '../scroll-to-top/scroll-to-top.js';
import { define as defineStatusBar } from '../status-bar/status-bar.js';
import { define as defineTree } from '../tree/tree.js';
import { define as defineTreeItem } from '../tree-item/tree-item.js';
import { toast } from '../toast/toast.js';
define();
defineAppBar();
defineBadge();
defineButton();
defineDescriptionList();
defineDialog();
defineInputField();
defineList();
defineListItem();
defineNav();
defineNavItem();
defineScrollToTop();
defineStatusBar();
defineTree();
defineTreeItem();

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

const further = [
    { name: "What's new", icon: 'M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1M16 9a4 4 0 0 1 0 6' },
    { name: 'Feedback', icon: 'M5 5h14v10H9l-4 4z' },
];

export const Sidebar = {
    name: 'A sidebar, and a bar on a phone',
    args: { column: 'list' },
    argTypes: {
        column: { options: ['list', 'rail'], control: { type: 'inline-radio' } },
        wideFrom: { table: { disable: true } },
        skipLabel: { table: { disable: true } },
    },
    parameters: {
        docs: {
            description: {
                story: 'An element of the page in the `navigation` slot, with the name of the application, an `el-nav` and the account in it. Where the frame is wide, the destinations are a list (`column="list"` on the `el-nav`) or a rail: an attribute a server writes per view. The `el-nav` takes the height that is left, so its destinations scroll and the account stays in view. Where the frame is narrow, the same destinations are a bar at the lower edge: the second group is left out, and the page hides what is no destination with a query by the width of the frame.',
            },
        },
    },
    render: ({ column }) => html`
        <style>
            .story-side {
                display: flex;
                flex-direction: column;
                block-size: 100%;
            }

            .story-side-account {
                flex: none;
                display: grid;
                gap: 0.75rem;
                padding: 1rem;
                border-top: 1px solid var(--el-color-border, currentColor);
                font-size: 0.875rem;
            }

            /* The frame is a container: what is no destination is there where it is wide. */
            @container (width < 48rem) {
                .story-side-only {
                    display: none;
                }
            }
        </style>
        <el-app-frame narrow-navigation="bar" narrow-only="header">
            <header slot="header"><el-app-bar heading-level="1">Tasks</el-app-bar></header>
            <div slot="navigation" class="story-side">
                <a
                    class="story-side-only"
                    href="#home"
                    style="flex:none;padding:1.25rem 1rem;font-size:1.125rem;font-weight:700;overflow:hidden;text-overflow:ellipsis"
                    >${column === 'rail' ? 'T' : 'Tasks'}</a
                >
                <el-nav label="Main" column="${column}" secondary-label="More">
                    ${destinations.map(
                        ({ name, current, icon: path }) => html`
                            <el-nav-item href="#${name.toLowerCase()}" current="${current ? 'true' : 'false'}"
                                >${icon(path)}${name}</el-nav-item
                            >
                        `,
                    )}
                    ${further.map(
                        ({ name, icon: path }) => html`
                            <el-nav-item slot="secondary" href="#${name.toLowerCase().replace(/\W+/g, '-')}"
                                >${icon(path)}${name}</el-nav-item
                            >
                        `,
                    )}
                </el-nav>
                <div class="story-side-account story-side-only">
                    <span style="overflow:hidden;text-overflow:ellipsis" title="ada@example.com"
                        >${column === 'rail' ? 'A' : 'ada@example.com'}</span
                    >
                    <el-button appearance="outlined" size="small">${column === 'rail' ? 'Out' : 'Log out'}</el-button>
                </div>
            </div>
            <main id="sidebar-main" style="padding:1rem">
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

const notes = [
    ['Release notes', 'What changed in the last version, and what a user has to do'],
    ['Questions about the invoice', 'The three open points, and who answers them'],
    ['Room for the workshop', 'Twelve people, a projector, two days'],
    ['Proposal of the design team', 'The new navigation, read and commented'],
    ['Certificate of the staging server', 'Runs out at the end of the month'],
    ['Next sprint', 'What is left over, and what comes first'],
    ['New laptops', 'Four of them, with the larger screen'],
    ['Feedback on the onboarding', 'What the last three who joined said'],
    ['Dependencies', 'Which ones are behind, and which ones break'],
    ['Old branches', 'Everything that was merged before the summer'],
    ['How the deployment works', 'From the tag to the release, step by step'],
    ['Contrast of the new theme', 'The muted text on the raised surface'],
];

export const Columns = {
    name: 'A view of columns',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A list and what is chosen in it, beside each other. Where the frame is wide, the view is as high as the region of the content, each column scrolls on its own, and the region does not scroll as well. Where the frame is narrow, the view is a page that scrolls as a whole. The frame does nothing for it: the view takes the height of the region (`block-size: 100%`) in a query of the page by the width of the frame.',
            },
        },
    },
    render: () => html`
        <style>
            .story-view {
                box-sizing: border-box;
            }

            .story-view > * {
                padding: 1rem;
            }

            /* The frame is a container, and 48rem is its wide-from. */
            @container (min-width: 48rem) {
                .story-view {
                    display: flex;
                    block-size: 100%;
                }

                .story-view > * {
                    min-inline-size: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                }

                .story-view > section {
                    flex: none;
                    inline-size: 22rem;
                    border-inline-end: 1px solid var(--el-color-border, currentColor);
                }

                .story-view > article {
                    flex: 1 1 0;
                }
            }
        </style>
        <el-app-frame narrow-navigation="bar">
            <header slot="header"><el-app-bar heading-level="1">Notes</el-app-bar></header>
            <el-nav slot="navigation" label="Main">
                ${destinations.map(
                    ({ name, current, icon: path }) => html`
                        <el-nav-item href="#${name.toLowerCase()}" current="${current ? 'true' : 'false'}"
                            >${icon(path)}${name}</el-nav-item
                        >
                    `,
                )}
            </el-nav>
            <main id="columns-main" class="story-view">
                <section aria-label="Notes">
                    <el-list label="Notes">
                        ${notes.map(
                            ([title, text], index) => html`
                                <el-list-item href="#note-${index}">
                                    ${title}
                                    <span slot="description">${text}</span>
                                </el-list-item>
                            `,
                        )}
                    </el-list>
                </section>
                <article tabindex="0" aria-label="Release notes">
                    <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:700">Release notes</h2>
                    ${Array.from(
                        { length: 12 },
                        (_, index) => html`
                            <p style="margin:0 0 1rem;max-width:40rem">
                                ${index + 1}. The list at the side scrolls on its own, and so does this note. The header
                                stays, and the region of the content has nothing left to scroll: the view is as high as
                                the region.
                            </p>
                        `,
                    )}
                </article>
            </main>
        </el-app-frame>
    `,
};

export const Keyboard = {
    name: 'On a phone: the status bar and the keyboard',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Open this on an iPhone. Scroll down and tap the status bar: the content goes back to its top (`status-bar-tap="true"`). Then scroll to the end and tap the field. The on-screen keyboard covers the lower part of the viewport, and the browser moves the page up behind it. The frame takes what shows: its header stays in view, the bar lies above the keyboard, and the field is in view between them.',
            },
        },
    },
    render: () => html`
        <el-app-frame narrow-navigation="bar" status-bar-tap="true">
            <header slot="header"><el-app-bar heading-level="1">Messages</el-app-bar></header>
            <el-nav slot="navigation" label="Main">
                ${destinations.map(
                    ({ name, current, icon: path }) => html`
                        <el-nav-item href="#${name.toLowerCase()}" current="${current ? 'true' : 'false'}"
                            >${icon(path)}${name}</el-nav-item
                        >
                    `,
                )}
            </el-nav>
            <main id="keyboard-main" style="padding:1rem">
                ${tasks.map(([title, due]) => html`<p style="margin:0 0 1rem">${title}: ${due}</p>`)}
                ${tasks.map(([title]) => html`<p style="margin:0 0 1rem">${title}</p>`)}
                <el-input-field label="Reply" name="reply"></el-input-field>
            </main>
        </el-app-frame>
    `,
};

const paragraphs = [
    'The frame of an application has five regions: a header, a footer, a navigation, an aside and the content. The page writes the element of every region, and the frame lays it out.',
    'A tool for a desktop has a narrow line of state at its lower edge. It says whether the connection is there, where the cursor is and whether the document is saved.',
    'The line keeps its height whatever is in it, and the content scrolls above it.',
];

export const Workbench = {
    name: 'A tool for a desktop',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An editor: the files in the navigation, the outline of the document in the aside, and an `el-status-bar` in the footer. The user sets the width of both columns (`resizable="navigation aside"`): drag the line between a column and the text, or give it the focus with the Tab key and use the arrow keys, Home and End. The line of state is for a desktop (`wide-only="footer"`): where the frame is narrow it is not there, the files open as a drawer, and there is no edge to drag.',
            },
        },
    },
    render: () => html`
        <el-app-frame
            wide-only="footer aside"
            resizable="navigation aside"
            navigation-label="Files"
            aside-label="Outline"
            @app-frame-resize-end="${(event) => {
                const { region, size } = event.detail;
                event.currentTarget.querySelector('[data-kept]').textContent = `${region} ${size}px`;
            }}"
        >
            <header slot="header">
                <el-app-bar heading-level="1">
                    <el-button slot="start" data-navigation-toggle circle="true" aria-label="Files">${menu}</el-button>
                    Notes
                </el-app-bar>
            </header>

            <nav slot="navigation" aria-label="Files" style="padding:0.5rem">
                <el-tree label="Files">
                    <el-tree-item label="Guides" open="true">
                        <el-tree-item label="The frame of an application" href="#frame" current="true"></el-tree-item>
                        <el-tree-item label="Destinations" href="#destinations"></el-tree-item>
                        <el-tree-item label="A line of state" href="#state"></el-tree-item>
                    </el-tree-item>
                    <el-tree-item label="Drafts">
                        <el-tree-item label="Ideas for the next release" href="#ideas"></el-tree-item>
                    </el-tree-item>
                    <el-tree-item label="Readme" href="#readme"></el-tree-item>
                </el-tree>
            </nav>

            <main id="workbench-main" style="padding:1rem 1.5rem;max-width:44rem">
                <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:700">The frame of an application</h2>
                ${Array.from(
                    { length: 8 },
                    (_, index) => html`<p style="margin:0 0 1rem">${paragraphs[index % paragraphs.length]}</p>`,
                )}
            </main>

            <aside slot="aside" aria-label="Outline" style="padding:1rem">
                <h2 style="margin:0 0 0.75rem;font-size:1.125rem;font-weight:600">Outline</h2>
                <el-list label="Headings of the document" density="compact" appearance="plain">
                    <el-list-item href="#regions">The regions</el-list-item>
                    <el-list-item href="#scrolling">What scrolls</el-list-item>
                    <el-list-item href="#state">A line of state</el-list-item>
                </el-list>
            </aside>

            <footer slot="footer">
                <el-status-bar>
                    <span>Connected</span>
                    <span>Line 12, column 4</span>
                    <span role="status">Saved</span>
                    <span slot="end" data-kept></span>
                    <span slot="end">Markdown</span>
                    <el-button slot="end">main</el-button>
                </el-status-bar>
            </footer>
        </el-app-frame>
    `,
};
