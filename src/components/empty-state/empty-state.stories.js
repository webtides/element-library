import { html } from '@webtides/element-js';
import readme from './empty-state.readme.md?raw';
import { define } from './empty-state.js';
import { define as defineButton } from '../button/button.js';
import { define as defineCard } from '../card/card.js';
define();
defineButton();
defineCard();

// An empty tray: a decoration, so it is hidden from assistive technology.
const icon = html`
    <svg
        slot="icon"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path
            d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        />
    </svg>
`;

export default {
    title: 'Components/Empty State',
    component: 'el-empty-state',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        heading: 'No projects yet',
        message: 'A project holds everything that belongs to one piece of work.',
        icon: true,
        action: true,
    },
    argTypes: {
        heading: { description: 'Text of the heading in the `heading` slot. Empty: no heading.' },
        message: { description: 'Text in the default slot.' },
        icon: { description: 'Whether an icon is slotted into `icon`.' },
        action: { description: 'Whether a button is slotted into `action`.' },
    },
};

export const Playground = {
    render: ({ heading, message, icon: withIcon, action }) => html`
        <el-empty-state>
            ${withIcon ? icon : ''} ${heading ? html`<h3 slot="heading">${heading}</h3>` : ''} ${message}
            ${action ? html`<el-button slot="action" variant="brand">Create a project</el-button>` : ''}
        </el-empty-state>
    `,
};

export const MessageOnly = {
    name: 'A message alone',
    parameters: { controls: { disable: true } },
    render: () => html`<el-empty-state>Nothing here yet.</el-empty-state>`,
};

export const WithAction = {
    name: 'With an action',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'What the user can do now is slotted into `action`: a button of your own, with a listener of your own.',
            },
        },
    },
    render: () => html`
        <el-empty-state>
            <h3 slot="heading">No results</h3>
            No project matches “quarterly report”.
            <el-button slot="action">Reset the search</el-button>
        </el-empty-state>
    `,
};

export const Everything = {
    name: 'Icon, heading, message and two actions',
    parameters: { controls: { disable: true } },
    render: () => html`
        <el-empty-state>
            ${icon}
            <h3 slot="heading">No projects yet</h3>
            A project holds everything that belongs to one piece of work.
            <a href="#projects">Read how projects work</a>
            <el-button slot="action" variant="brand">Create a project</el-button>
            <el-button slot="action">Import</el-button>
        </el-empty-state>
    `,
};

export const InACard = {
    name: 'In a card',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'In the place of a list: the empty state is the body of the card until there are members.',
            },
        },
    },
    render: () => html`
        <el-card style="max-width:28rem">
            <h3 slot="header">Members</h3>
            <el-empty-state>
                ${icon} Nobody has access to this project but you.
                <el-button slot="action" size="small">Invite someone</el-button>
            </el-empty-state>
        </el-card>
    `,
};
