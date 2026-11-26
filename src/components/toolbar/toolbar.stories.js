import { html } from '@webtides/element-js';
import readme from './toolbar.readme.md?raw';
import { define } from './toolbar.js';
import { define as defineButton } from '../button/button.js';
import { define as defineButtonGroup } from '../button-group/button-group.js';
import { define as defineDivider } from '../divider/divider.js';
import { define as defineSegmentedField } from '../segmented-field/segmented-field.js';
define();
defineButton();
defineButtonGroup();
defineDivider();
defineSegmentedField();

// Icons of the stories: decorations, the buttons have their names. Each is a whole <svg>: a part of
// one that is put in from another template would be no part of the drawing.
const reply = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10a6 6 0 0 1 6 6v4" />
    </svg>
`;
const forward = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="m15 14 5-5-5-5" />
        <path d="M20 9H10a6 6 0 0 0-6 6v4" />
    </svg>
`;
const archive = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <path d="M5 8v11h14V8M10 12h4" />
    </svg>
`;
const trash = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
`;
const star = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
    </svg>
`;
const more = html`
    <svg
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
    </svg>
`;

const views = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
];

const controls = html`
    <el-button circle="true" aria-label="Reply">${reply}</el-button>
    <el-button circle="true" aria-label="Forward">${forward}</el-button>
    <el-divider orientation="vertical"></el-divider>
    <el-button circle="true" aria-label="Archive">${archive}</el-button>
    <el-button circle="true" aria-label="Delete" variant="danger">${trash}</el-button>
    <el-divider orientation="vertical"></el-divider>
    <el-button toggle="true" circle="true" aria-label="Starred">${star}</el-button>
    <el-segmented-field
        name="view"
        label="View"
        label-screen-reader-only="true"
        value="list"
        .options="${views}"
    ></el-segmented-field>
    <el-button slot="end" circle="true" aria-label="More">${more}</el-button>
`;

export default {
    title: 'Components/Toolbar',
    component: 'el-toolbar',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Message',
        size: 'medium',
        appearance: 'plain',
    },
    argTypes: {
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
        appearance: { options: ['filled', 'outlined', 'plain'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, size, appearance }) => html`
        <el-toolbar label="${label}" size="${size}" appearance="${appearance}">${controls}</el-toolbar>
    `,
};

export const SizeAndAppearance = {
    name: 'One size and one appearance',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The controls take `size` and `appearance` from the toolbar. A control that names its own keeps it: the button "Send" is filled in every toolbar.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1.5rem">
            ${[
                ['small', 'plain'],
                ['medium', 'outlined'],
                ['large', 'filled'],
            ].map(
                ([size, appearance]) => html`
                    <el-toolbar label="${size}, ${appearance}" size="${size}" appearance="${appearance}">
                        <el-button circle="true" aria-label="Reply">${reply}</el-button>
                        <el-button>Archive</el-button>
                        <el-button toggle="true" pressed="true">Starred</el-button>
                        <el-segmented-field
                            name="view-${size}"
                            label="View"
                            label-screen-reader-only="true"
                            value="list"
                            .options="${views}"
                        ></el-segmented-field>
                        <el-button slot="end" variant="brand" appearance="filled">Send</el-button>
                    </el-toolbar>
                `,
            )}
        </div>
    `,
};

export const Groups = {
    name: 'Groups, and a group at the end',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An `el-divider` stands between two groups. An `el-button-group` is a group of buttons that touch. What is slotted into `end` stands at the end of the toolbar.',
            },
        },
    },
    render: () => html`
        <el-toolbar label="Message" appearance="outlined">
            <el-button-group label="Answer">
                <el-button>Reply</el-button>
                <el-button>Reply to all</el-button>
                <el-button>Forward</el-button>
            </el-button-group>
            <el-divider orientation="vertical"></el-divider>
            <el-button>Archive</el-button>
            <el-button variant="danger">Delete</el-button>
            <el-button slot="end" toggle="true">Starred</el-button>
            <el-button slot="end" circle="true" aria-label="More">${more}</el-button>
        </el-toolbar>
    `,
};

export const Narrow = {
    name: 'More controls than the width takes',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The toolbar breaks into a second line. Every control stays in reach, of the pointer and of the arrow keys.',
            },
        },
    },
    render: () => html`
        <div style="max-width:18rem;border:1px dashed var(--el-color-border, #d1d5db);padding:0.5rem">
            <el-toolbar label="Message">${controls}</el-toolbar>
        </div>
    `,
};
