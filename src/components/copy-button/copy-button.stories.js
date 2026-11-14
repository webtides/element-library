import { html } from '@webtides/element-js';
import readme from './copy-button.readme.md?raw';
import { define } from './copy-button.js';
define();

export default {
    title: 'Components/CopyButton',
    component: 'el-copy-button',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        value: 'npm i --save @webtides/element-library',
        size: 'medium',
        disabled: false,
        feedbackDuration: 1500,
        label: 'Copy',
        successLabel: 'Copied',
        errorLabel: 'Could not copy',
    },
    argTypes: {
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
        disabled: { control: 'boolean' },
        feedbackDuration: { control: { type: 'number' } },
    },
};

const row = 'display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center';
const code = 'padding:0.25rem 0.5rem;border-radius:0.25rem;background:var(--el-color-bg-muted, #e5e7eb)';

export const Playground = {
    render: ({ value, size, disabled, feedbackDuration, label, successLabel, errorLabel }) => html`
        <div style="${row}">
            <code style="${code}">${value}</code>
            <el-copy-button
                value="${value}"
                size="${size}"
                disabled="${disabled}"
                feedback-duration="${feedbackDuration}"
                label="${label}"
                success-label="${successLabel}"
                error-label="${errorLabel}"
            ></el-copy-button>
        </div>
    `,
};

export const From = {
    name: 'From another element',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`from` names an element by its id. The button copies its text, or its value if it is a control, at the moment of the press.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:28rem">
            <div style="${row}">
                <code id="copy-story-command" style="${code}">npx vp test run</code>
                <el-copy-button from="copy-story-command" label="Copy the command"></el-copy-button>
            </div>
            <div style="${row}">
                <label for="copy-story-link">Link to share</label>
                <input
                    id="copy-story-link"
                    type="text"
                    value="https://example.com/s/4f9a"
                    readonly
                    style="flex:1;min-width:0;padding:0.5rem;border:1px solid var(--el-color-border, #d1d5db);border-radius:0.25rem"
                />
                <el-copy-button from="copy-story-link" label="Copy the link"></el-copy-button>
            </div>
        </div>
    `,
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A square of the control height of its size, the height of a button of that size.',
            },
        },
    },
    render: () => html`
        <div style="${row}">
            <el-copy-button value="small" size="small"></el-copy-button>
            <el-copy-button value="medium" size="medium"></el-copy-button>
            <el-copy-button value="large" size="large"></el-copy-button>
        </div>
    `,
};

export const NothingToCopy = {
    name: 'Nothing to copy',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Without a text the button shows a cross and fires `copy-button-error`. The same happens when the browser refuses the clipboard.',
            },
        },
    },
    render: () => html`<el-copy-button label="Copy nothing"></el-copy-button>`,
};

export const Disabled = {
    parameters: { controls: { disable: true } },
    render: () => html`<el-copy-button value="npm install" disabled="true"></el-copy-button>`,
};

export const Icons = {
    name: 'With icons of the page',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The slots `copy-icon`, `success-icon` and `error-icon` take other icons.',
            },
        },
    },
    render: () => html`
        <el-copy-button value="https://example.com/s/4f9a" label="Copy the link">
            <svg
                slot="copy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
            <svg
                slot="success-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="9" />
                <polyline points="16 9 11 15 8 12" />
            </svg>
        </el-copy-button>
    `,
};
