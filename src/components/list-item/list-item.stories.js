import { html } from '@webtides/element-js';
import readme from './list-item.readme.md?raw';
import { define } from './list-item.js';
import { define as defineList } from '../list/list.js';
import { define as defineAvatar } from '../avatar/avatar.js';
import { define as defineButton } from '../button/button.js';
define();
defineList();
defineAvatar();
defineButton();

export default {
    title: 'Components/ListItem',
    component: 'el-list-item',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        href: '#ada',
        target: '',
        current: false,
        mark: '',
        truncate: false,
    },
    argTypes: {
        current: { control: 'boolean' },
        truncate: { control: 'boolean' },
    },
};

export const Playground = {
    render: ({ href, target, current, mark, truncate }) => html`
        <el-list label="Messages" appearance="outlined" style="max-width:28rem">
            <el-list-item href="${href}" target="${target}" current="${current}" mark="${mark}" truncate="${truncate}">
                <el-avatar slot="start" initials="AL" label="Ada Lovelace"></el-avatar>
                Ada Lovelace
                <span slot="description">The notes on the engine are ready for you.</span>
                <time slot="end" datetime="09:12">09:12</time>
            </el-list-item>
            <el-list-item href="#grace">
                <el-avatar slot="start" initials="GH" label="Grace Hopper"></el-avatar>
                Grace Hopper
                <span slot="description">Found it. A moth, in relay 70.</span>
                <time slot="end" datetime="08:40">08:40</time>
            </el-list-item>
        </el-list>
    `,
};

export const LinkAndText = {
    name: 'A link and a row that is none',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `href` the title is a link and the whole row is its target. Without, the row is text.',
            },
        },
    },
    render: () => html`
        <el-list label="A link and a row that is none" appearance="outlined" style="max-width:28rem">
            <el-list-item href="#profile">Profile <span slot="description">A link: the whole row</span></el-list-item>
            <el-list-item>Version <span slot="end">0.3.1</span></el-list-item>
        </el-list>
    `,
};

export const Current = {
    name: 'The current row',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`current` marks the row of the page the user is on, or the one that is chosen: `aria-current`, a fill, a bar at the start and a heavier title.',
            },
        },
    },
    render: () => html`
        <el-list label="Folders" appearance="outlined" style="max-width:20rem">
            <el-list-item href="#inbox">Inbox <span slot="end">12</span></el-list-item>
            <el-list-item href="#drafts" current="true">Drafts <span slot="end">2</span></el-list-item>
            <el-list-item href="#sent">Sent</el-list-item>
        </el-list>
    `,
};

export const Mark = {
    name: 'A mark',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`mark` draws a dot in the padding at the start of the row. Its text is read in front of the title.',
            },
        },
    },
    render: () => html`
        <el-list label="Messages" appearance="outlined" style="max-width:28rem">
            <el-list-item href="#ada" mark="Unread">
                Ada Lovelace
                <span slot="description">The notes on the engine are ready for you.</span>
            </el-list-item>
            <el-list-item href="#grace">
                Grace Hopper
                <span slot="description">Found it. A moth, in relay 70.</span>
            </el-list-item>
        </el-list>
    `,
};

export const Action = {
    name: 'A control of its own',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'What is slotted into `action` lies on top of the link of the row and is a target of its own.',
            },
        },
    },
    render: () => html`
        <el-list label="Members" appearance="outlined" style="max-width:28rem">
            <el-list-item href="#ada">
                <el-avatar slot="start" initials="AL" label="Ada Lovelace"></el-avatar>
                Ada Lovelace
                <span slot="description">Owner</span>
                <el-button slot="action" size="small" appearance="outlined">Remove</el-button>
            </el-list-item>
        </el-list>
    `,
};
