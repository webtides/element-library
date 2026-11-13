import { html } from '@webtides/element-js';
import readme from './card.readme.md?raw';
import { define } from './card.js';
import { define as defineButton } from '../button/button.js';
import { define as defineInputField } from '../input-field/input-field.js';
define();
defineButton();
defineInputField();

const appearances = ['outlined', 'filled', 'plain'];
// A picture without a request: three to two, in the colours of a morning.
const picture = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fde68a" />
                <stop offset="1" stop-color="#f97316" />
            </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#sky)" />
        <circle cx="430" cy="150" r="60" fill="#fff7ed" />
        <path d="M0 400 L0 290 L150 180 L290 300 L400 220 L600 340 L600 400 Z" fill="#7c2d12" />
    </svg>
`)}`;

export default {
    title: 'Components/Card',
    component: 'el-card',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        appearance: 'outlined',
        header: 'Lake house',
        body: 'Two rooms, a boat and a view of the water.',
        media: true,
        footer: true,
    },
    argTypes: {
        appearance: { options: appearances, control: { type: 'inline-radio' } },
        header: { description: 'Text of the heading in the `header` slot. Empty: no header.' },
        body: { description: 'Text in the default slot.' },
        media: { description: 'Whether an image is slotted into `media`.' },
        footer: { description: 'Whether a button is slotted into `footer`.' },
    },
};

export const Playground = {
    render: ({ appearance, header, body, media, footer }) => html`
        <el-card appearance="${appearance}" style="max-width:20rem">
            ${media ? html`<img slot="media" alt="Hills at sunrise" width="600" height="400" src="${picture}" />` : ''}
            ${header ? html`<h3 slot="header">${header}</h3>` : ''}
            <p>${body}</p>
            ${footer ? html`<el-button slot="footer" variant="brand">Book</el-button>` : ''}
        </el-card>
    `,
};

export const Regions = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A card has four regions: `media`, `header`, the body and `footer`. A region that nothing is slotted into takes no space.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem;align-items:start">
            <el-card><p>The body alone.</p></el-card>
            <el-card>
                <h3 slot="header">Header</h3>
                <p>A header and the body.</p>
            </el-card>
            <el-card>
                <h3 slot="header">Header</h3>
                <p>A header, the body and a footer.</p>
                <el-button slot="footer">Action</el-button>
            </el-card>
            <el-card>
                <img slot="media" alt="Hills at sunrise" width="600" height="400" src="${picture}" />
                <h3 slot="header">Header</h3>
                <p>All four regions.</p>
                <el-button slot="footer">Action</el-button>
            </el-card>
        </div>
    `,
};

export const Appearances = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`outlined` is a surface in the background of the page with a border, `filled` has a muted fill, `plain` paints nothing and keeps the regions.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem">
            ${appearances.map(
                (appearance) => html`
                    <el-card appearance="${appearance}">
                        <h3 slot="header">${appearance}</h3>
                        <p>The surface of a card, painted from the tokens of the theme.</p>
                    </el-card>
                `,
            )}
        </div>
    `,
};

export const HeaderWithAction = {
    name: 'Header with an action',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The header pushes what is slotted into it apart: the title to the start, an action to the end.',
            },
        },
    },
    render: () => html`
        <el-card style="max-width:28rem">
            <h3 slot="header">Members</h3>
            <el-button slot="header" size="small">Invite</el-button>
            <p>Three people have access to this project.</p>
        </el-card>
    `,
};

export const Form = {
    name: 'Around a form',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A section of settings: the fields in the body, the action in the footer.',
            },
        },
    },
    render: () => html`
        <el-card style="max-width:28rem">
            <h3 slot="header">Profile</h3>
            <div style="display:grid;gap:1rem">
                <el-input-field name="card-story-name" label="Name" value="Ada Lovelace"></el-input-field>
                <el-input-field name="card-story-email" label="Email" type="email"></el-input-field>
            </div>
            <el-button slot="footer" variant="brand">Save</el-button>
            <el-button slot="footer" appearance="plain">Cancel</el-button>
        </el-card>
    `,
};

export const InAGrid = {
    name: 'In a grid',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Cards that a grid stretches are equally high, and their footers are in one line.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem">
            <el-card>
                <h3 slot="header">Starter</h3>
                <p>One project.</p>
                <el-button slot="footer">Choose</el-button>
            </el-card>
            <el-card>
                <h3 slot="header">Team</h3>
                <p>Ten projects, shared with everyone who works on them, and a history of every change.</p>
                <el-button slot="footer" variant="brand">Choose</el-button>
            </el-card>
            <el-card>
                <h3 slot="header">Company</h3>
                <p>Projects without a limit.</p>
                <el-button slot="footer">Choose</el-button>
            </el-card>
        </div>
    `,
};

export const Padding = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-card-padding` is the padding of the header, the body and the footer. The second card takes the padding off its body alone, with `::part(body)`, for a list that reaches from edge to edge.',
            },
        },
    },
    render: () => html`
        <style>
            .card-story-flush::part(body) {
                padding: 0;
            }
            .card-story-list {
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .card-story-list li {
                padding: 0.5rem 1rem;
                border-top: 1px solid var(--el-color-border, currentColor);
            }
        </style>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem;align-items:start">
            <el-card style="--el-card-padding:0.5rem">
                <h3 slot="header">Compact</h3>
                <p>Half the padding, in every region.</p>
            </el-card>
            <el-card class="card-story-flush">
                <h3 slot="header">Members</h3>
                <ul class="card-story-list">
                    <li>Ada Lovelace</li>
                    <li>Grace Hopper</li>
                    <li>Katherine Johnson</li>
                </ul>
            </el-card>
        </div>
    `,
};
