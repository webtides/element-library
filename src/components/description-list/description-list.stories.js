import { html } from '@webtides/element-js';
import readme from './description-list.readme.md?raw';
import { define } from './description-list.js';
import { define as defineButton } from '../button/button.js';
import { define as defineTag } from '../tag/tag.js';
import { define as defineCard } from '../card/card.js';
define();
defineButton();
defineTag();
defineCard();

const rows = html`
    <dt>Plan</dt>
    <dd>Team, 12 seats</dd>
    <dd data-action>
        <el-button size="small" appearance="plain" href="#plan" aria-label="Change the plan">Change</el-button>
    </dd>
    <dt>Address</dt>
    <dd>12 Garden Road<br />1017 Amsterdam</dd>
    <dd data-action>
        <el-button size="small" appearance="plain" href="#address" aria-label="Change the address">Change</el-button>
    </dd>
    <dt>Created</dt>
    <dd><time datetime="2026-03-12">12 March 2026</time></dd>
`;

export default {
    title: 'Components/DescriptionList',
    component: 'el-description-list',
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
    render: () => html`<el-description-list>${rows}</el-description-list>`,
};

export const Narrow = {
    name: 'In a narrow place',
    parameters: {
        docs: {
            description: {
                story: 'Below 30rem of its own width a name stands above its value. The list measures itself, not the viewport: this one is in a column of 20rem.',
            },
        },
    },
    render: () => html`
        <div style="max-width:20rem;border:1px dashed var(--el-color-border, #d1d5db);padding:0 1rem">
            <el-description-list>${rows}</el-description-list>
        </div>
    `,
};

export const Values = {
    name: 'Values of every kind',
    parameters: {
        docs: {
            description: {
                story: 'A value is what the page writes into the `<dd>`: a text, a tag, a link, several lines. A name can have several values. A long value breaks, inside of a word where it has to.',
            },
        },
    },
    render: () => html`
        <el-description-list style="max-width:40rem">
            <dt>Status</dt>
            <dd><el-tag size="small" variant="success">Active</el-tag></dd>
            <dt>Owners</dt>
            <dd>Ada Lovelace</dd>
            <dd>Grace Hopper</dd>
            <dt>Website</dt>
            <dd><a href="#site">example.com</a></dd>
            <dt>Token</dt>
            <dd>
                <code>a3f9c2e7b1d84f6a9c0e5b7d2f8a4c6e1b3d5f7a9c2e4b6d8f0a1c3e5b7d9f2a4c6e8b0d</code>
            </dd>
        </el-description-list>
    `,
};

export const TermWidth = {
    name: 'The width of the names',
    parameters: {
        docs: {
            description: {
                story: 'Side by side, the column of the names is as wide as the longest name. `--el-description-list-term-width` sets it, so that the values of two lists begin on one line.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1.5rem;max-width:40rem">
            <el-description-list style="--el-description-list-term-width:10rem">
                <dt>Plan</dt>
                <dd>Team</dd>
                <dt>Seats</dt>
                <dd>12</dd>
            </el-description-list>
            <el-description-list style="--el-description-list-term-width:10rem">
                <dt>Day of the next invoice</dt>
                <dd>1 December 2026</dd>
            </el-description-list>
        </div>
    `,
};

export const InACard = {
    name: 'In a card',
    parameters: {
        docs: {
            description: {
                story: 'The list has no surface of its own. In the body of an `el-card` it has the padding of the card around it.',
            },
        },
    },
    render: () => html`
        <el-card style="max-width:40rem">
            <strong slot="header">Subscription</strong>
            <el-description-list>${rows}</el-description-list>
        </el-card>
    `,
};
