import { html } from '@webtides/element-js';
import readme from './list.readme.md?raw';
import { define } from './list.js';
import { define as defineItem } from '../list-item/list-item.js';
import { define as defineAvatar } from '../avatar/avatar.js';
import { define as defineBadge } from '../badge/badge.js';
import { define as defineButton } from '../button/button.js';
import { define as defineCard } from '../card/card.js';
define();
defineItem();
defineAvatar();
defineBadge();
defineButton();
defineCard();

// An arrow head that points with the reading direction: a decoration, hidden from assistive technology.
const chevron = (slot = 'end') => html`
    <svg
        slot="${slot}"
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
        <path d="m9 6 6 6-6 6" />
    </svg>
`;

const file = html`
    <svg
        slot="start"
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
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
    </svg>
`;

export default {
    title: 'Components/List',
    component: 'el-list',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Messages',
        density: 'default',
        appearance: 'plain',
    },
    argTypes: {
        density: { control: 'inline-radio', options: ['default', 'compact'] },
        appearance: { control: 'inline-radio', options: ['plain', 'outlined', 'filled'] },
    },
};

export const Playground = {
    render: ({ label, density, appearance }) => html`
        <el-list label="${label}" density="${density}" appearance="${appearance}" style="max-width:28rem">
            <el-list-item href="#ada" mark="Unread">
                <el-avatar slot="start" initials="AL" label="Ada Lovelace"></el-avatar>
                Ada Lovelace
                <span slot="description">The notes on the engine are ready for you.</span>
                <time slot="end" datetime="09:12">09:12</time>
            </el-list-item>
            <el-list-item href="#grace" current="true">
                <el-avatar slot="start" initials="GH" label="Grace Hopper"></el-avatar>
                Grace Hopper
                <span slot="description">Found it. A moth, in relay 70.</span>
                <time slot="end" datetime="08:40">08:40</time>
            </el-list-item>
            <el-list-item href="#alan">
                <el-avatar slot="start" initials="AT" label="Alan Turing"></el-avatar>
                Alan Turing
                <span slot="description">Can we talk about the machine tomorrow?</span>
                <time slot="end" datetime="2026-11-25">Yesterday</time>
            </el-list-item>
        </el-list>
    `,
};

export const Settings = {
    name: 'The entries of a settings page',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Rows that lead somewhere: the value and the chevron in `end` are part of the link, the whole row is its target.',
            },
        },
    },
    render: () => html`
        <el-list label="Settings" appearance="outlined" style="max-width:28rem">
            <el-list-item href="#language">Language <span slot="end">English</span>${chevron()}</el-list-item>
            <el-list-item href="#notifications">
                Notifications
                <span slot="description">Mail, and a badge on the icon</span>
                ${chevron()}
            </el-list-item>
            <el-list-item href="#plan">Plan <span slot="end">Team, 12 seats</span>${chevron()}</el-list-item>
        </el-list>
    `,
};

export const Start = {
    name: 'Something at the start',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The texts of all rows begin on one line: after the widest start of the list. A row without a start keeps to that line, and a `mark` does not move anything.',
            },
        },
    },
    render: () => html`
        <el-list label="People and files" style="max-width:28rem">
            <el-list-item mark="Unread">
                <el-avatar slot="start" initials="AL" label="Ada Lovelace"></el-avatar>
                Ada Lovelace
                <span slot="description">An avatar at the start, and a mark</span>
            </el-list-item>
            <el-list-item>
                ${file} notes.pdf
                <span slot="description">A small icon at the start</span>
            </el-list-item>
            <el-list-item>
                No start
                <span slot="description">Nothing at the start</span>
            </el-list-item>
        </el-list>
    `,
};

export const Action = {
    name: 'A control at the end',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A control in `action` is a target of its own, also in a row that is a link: it lies on top of the link. The count in `end` belongs to the row.',
            },
        },
    },
    render: () => html`
        <el-list label="Files" appearance="outlined" style="max-width:28rem">
            <el-list-item href="#notes">
                ${file} notes.pdf
                <span slot="description">240 KB</span>
                <el-badge slot="end" pill="true">3</el-badge>
                <el-button slot="action" size="small" appearance="plain" aria-label="Remove notes.pdf">✕</el-button>
            </el-list-item>
            <el-list-item href="#plan">
                ${file} plan.pdf
                <span slot="description">1.2 MB</span>
                <el-button slot="action" size="small" appearance="plain" aria-label="Remove plan.pdf">✕</el-button>
            </el-list-item>
        </el-list>
    `,
};

export const Density = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`density="compact"` gives a row less room above and below its texts: `--el-space-2` in the place of `--el-space-3`.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.5rem;align-items:start">
            <el-list label="Default" appearance="outlined">
                <el-list-item>Inbox <span slot="end">12</span></el-list-item>
                <el-list-item>Drafts <span slot="end">2</span></el-list-item>
                <el-list-item>Sent</el-list-item>
            </el-list>
            <el-list label="Compact" appearance="outlined" density="compact">
                <el-list-item>Inbox <span slot="end">12</span></el-list-item>
                <el-list-item>Drafts <span slot="end">2</span></el-list-item>
                <el-list-item>Sent</el-list-item>
            </el-list>
        </div>
    `,
};

export const Surface = {
    name: 'From edge to edge, and as a card',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A plain list has no surface and reaches from edge to edge of its place. `outlined` and `filled` are the surfaces of `el-card`. In the body of a card, `--el-list-padding-inline: 0` puts the rows on the line of the other content.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.5rem;align-items:start">
            <div style="border:1px dashed var(--el-color-border, #d1d5db)">
                <el-list label="Plain">
                    <el-list-item href="#inbox">Inbox</el-list-item>
                    <el-list-item href="#drafts">Drafts</el-list-item>
                </el-list>
            </div>
            <el-list label="Outlined" appearance="outlined">
                <el-list-item href="#inbox">Inbox</el-list-item>
                <el-list-item href="#drafts">Drafts</el-list-item>
            </el-list>
            <el-list label="Filled" appearance="filled">
                <el-list-item href="#inbox">Inbox</el-list-item>
                <el-list-item href="#drafts">Drafts</el-list-item>
            </el-list>
            <el-card>
                <strong slot="header">In a card</strong>
                <el-list label="In a card" style="--el-list-padding-inline:0">
                    <el-list-item>Inbox <span slot="end">12</span></el-list-item>
                    <el-list-item>Drafts <span slot="end">2</span></el-list-item>
                </el-list>
            </el-card>
        </div>
    `,
};

export const LongTexts = {
    name: 'Long texts',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A long title breaks into more lines, inside of a word where it has to. `truncate` cuts the title and the line under it after one line.',
            },
        },
    },
    render: () => html`
        <el-list label="Long texts" appearance="outlined" style="max-width:20rem">
            <el-list-item>
                A title that is longer than the row is wide breaks into a second line
                <span slot="description">And so does the line under it, which says a little more than fits</span>
            </el-list-item>
            <el-list-item truncate="true">
                A title that is longer than the row is wide is cut with truncate
                <span slot="description">And so is the line under it, which says a little more than fits</span>
            </el-list-item>
            <el-list-item>
                Averyveryverylongwordwithoutanyspaceatallthatauserhastypedintoafield
                <span slot="end">alongvaluewithoutaspace@example.com</span>
            </el-list-item>
        </el-list>
    `,
};
