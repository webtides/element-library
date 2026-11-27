import { html } from '@webtides/element-js';
import readme from './status-bar.readme.md?raw';
import { define } from './status-bar.js';
import { define as defineButton } from '../button/button.js';
import { define as defineProgressBar } from '../progress-bar/progress-bar.js';
import { define as defineSpinner } from '../spinner/spinner.js';
define();
defineButton();
defineProgressBar();
defineSpinner();

// A dot that says whether the connection is there. With a name: it is the whole entry where it
// stands alone, and a decoration in front of a text.
const dot = (name) => html`
    <svg
        width="0.625em"
        height="0.625em"
        viewBox="0 0 10 10"
        fill="var(--el-color-success, currentColor)"
        role="${name ? 'img' : null}"
        aria-label="${name || null}"
        aria-hidden="${name ? null : 'true'}"
    >
        <circle cx="5" cy="5" r="5" />
    </svg>
`;

// An entry with an icon in front of its text lays the two out itself: a reset of the page makes an
// svg a block as a rule, and the icon would stand over the text.
const withIcon = 'display:inline-flex;align-items:center;gap:0.375em';

const frame = (content) => html`
    <div style="border:1px solid var(--el-color-border, currentColor);border-block-start:0">${content}</div>
`;

export default {
    title: 'Components/StatusBar',
    component: 'el-status-bar',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const Playground = {
    render: () =>
        frame(html`
            <el-status-bar>
                <span style="${withIcon}">${dot()} Connected</span>
                <span>128 entries</span>
                <span>3 selected</span>
                <el-button slot="end">main</el-button>
                <span slot="end">v1.4.2</span>
            </el-status-bar>
        `),
};

export const BackgroundTask = {
    name: 'A task in the background',
    parameters: {
        docs: {
            description: {
                story: 'A small component is an entry as a text is: an `el-spinner` for a wait of unknown length, an `el-progress-bar` for a task that knows how far it is. The bar keeps its height with both.',
            },
        },
    },
    render: () =>
        frame(html`
            <el-status-bar>
                <span style="${withIcon}">${dot()} Connected</span>
                <span><el-spinner label="Syncing"></el-spinner> Syncing</span>
                <span slot="end">Importing 40 of 100</span>
                <el-progress-bar slot="end" value="40" label="Import"></el-progress-bar>
            </el-status-bar>
        `),
};

export const Announced = {
    name: 'An entry that is announced',
    parameters: {
        docs: {
            description: {
                story: 'The bar is no live region: a count that changes with every click would be read out all the time. The page marks the one entry whose change matters with `role="status"`, which a screen reader announces when it has nothing else to say. Here it is the entry that says when the document was saved.',
            },
        },
    },
    render: () => html`
        <p style="margin:0 0 0.75rem">
            <el-button
                @click="${(event) => {
                    const saved = event.currentTarget.closest('div').querySelector('[role="status"]');
                    saved.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
                }}"
                >Save</el-button
            >
        </p>
        ${frame(html`
            <el-status-bar>
                <span>Line 12, column 4</span>
                <span role="status">Not saved yet</span>
                <span slot="end">UTF-8</span>
            </el-status-bar>
        `)}
    `,
    decorators: [(story) => html`<div>${story()}</div>`],
};

export const Narrow = {
    name: 'A bar that is too narrow',
    parameters: {
        docs: {
            description: {
                story: 'Nothing wraps, and no entry lies on another. The entries at the start give way: the group is cut at its end. The entries at the end stay. A button in the part that is cut is still reached with the Tab key: the bar shows it while it has the focus.',
            },
        },
    },
    render: () => html`
        <div style="max-width:20rem">
            ${frame(html`
                <el-status-bar>
                    <span style="${withIcon}">${dot()} Connected to the server in Frankfurt</span>
                    <span>128 entries</span>
                    <el-button>Retry</el-button>
                    <span slot="end">v1.4.2</span>
                </el-status-bar>
            `)}
        </div>
    `,
};

export const IconAlone = {
    name: 'An icon with a name',
    parameters: {
        docs: {
            description: {
                story: 'An icon that stands alone has a name (`role="img"` with an `aria-label`), and a button with an icon alone an `aria-label`.',
            },
        },
    },
    render: () =>
        frame(html`
            <el-status-bar>
                ${dot('Connected')}
                <span>128 entries</span>
                <el-button slot="end" circle="true" aria-label="Notifications">
                    <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
                    </svg>
                </el-button>
            </el-status-bar>
        `),
};
