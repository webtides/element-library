import { html } from '@webtides/element-js';
import readme from './app-bar.readme.md?raw';
import { define } from './app-bar.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

// Icons of the stories: decorations, the buttons have their names. Each is a whole <svg>: a part of
// one that is put in from another template would be no part of the drawing.
const back = html`
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
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
`;
const search = html`
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
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
`;
const more = html`
    <svg width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
    </svg>
`;

export default {
    title: 'Components/AppBar',
    component: 'el-app-bar',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        title: 'Inbox',
        headingLevel: 1,
        appearance: 'plain',
    },
    argTypes: {
        headingLevel: { options: [0, 1, 2, 3, 4, 5, 6], control: { type: 'inline-radio' } },
        appearance: { options: ['filled', 'outlined', 'plain'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ title, headingLevel, appearance }) => html`
        <el-app-bar heading-level="${headingLevel}" appearance="${appearance}">
            <el-button slot="start" circle="true" aria-label="Back">${back}</el-button>
            ${title}
            <el-button slot="end" circle="true" aria-label="Search">${search}</el-button>
            <el-button slot="end" circle="true" aria-label="More">${more}</el-button>
        </el-app-bar>
    `,
};

export const LongTitle = {
    name: 'A title that does not fit',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The title is cut with an ellipsis and never pushes the actions out. The whole title stays in the page, for assistive technology. Here the bar is as wide as a phone.',
            },
        },
    },
    render: () => html`
        <div style="max-width:390px;border:1px solid var(--el-color-border, currentColor)">
            <el-app-bar heading-level="1">
                <el-button slot="start" circle="true" aria-label="Back">${back}</el-button>
                Answer the questions about the invoice of the last quarter
                <el-button slot="end" circle="true" aria-label="Search">${search}</el-button>
                <el-button slot="end" circle="true" aria-label="More">${more}</el-button>
            </el-app-bar>
        </div>
    `,
};

export const TitleOnly = {
    name: 'A title alone',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A region the page leaves empty takes no room. The bar is as high as with a button in it.',
            },
        },
    },
    render: () => html`<el-app-bar heading-level="1">Settings</el-app-bar>`,
};

export const Actions = {
    name: 'Actions with a text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The buttons of a bar are plain while they have no appearance of their own. A button that names its own keeps it: "Save" is filled here.',
            },
        },
    },
    render: () => html`
        <el-app-bar heading-level="1">
            <el-button slot="start" circle="true" aria-label="Back">${back}</el-button>
            Edit the task
            <el-button slot="end">Discard</el-button>
            <el-button slot="end" variant="brand" appearance="filled">Save</el-button>
        </el-app-bar>
    `,
};
