import { html } from '@webtides/element-js';
import readme from './tree.readme.md?raw';
import { define } from './tree.js';
import { define as defineItem } from '../tree-item/tree-item.js';
import { define as defineBadge } from '../badge/badge.js';
define();
defineItem();
defineBadge();

// A folder: a decoration in front of the name, hidden from assistive technology.
const folder = html`
    <svg
        slot="start"
        width="1.125em"
        height="1.125em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </svg>
`;

export default {
    title: 'Components/Tree',
    component: 'el-tree',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Folders',
    },
};

export const Playground = {
    render: ({ label }) => html`
        <el-tree label="${label}" style="max-width:18rem">
            <el-tree-item label="Inbox" href="#inbox" open="true">
                ${folder}
                <span slot="end">12</span>
                <el-tree-item label="Work" href="#work" open="true">
                    ${folder}
                    <span slot="end">7</span>
                    <el-tree-item label="Invoices" href="#invoices" current="true">${folder}</el-tree-item>
                    <el-tree-item label="Travel" href="#travel">${folder}</el-tree-item>
                </el-tree-item>
                <el-tree-item label="Private" href="#private">
                    ${folder}
                    <span slot="end">5</span>
                    <el-tree-item label="Family" href="#family">${folder}</el-tree-item>
                </el-tree-item>
            </el-tree-item>
            <el-tree-item label="Drafts" href="#drafts">${folder}<span slot="end">2</span></el-tree-item>
            <el-tree-item label="Archive" href="#archive">
                ${folder}
                <el-tree-item label="2025" href="#2025">${folder}</el-tree-item>
                <el-tree-item label="2024" href="#2024">${folder}</el-tree-item>
            </el-tree-item>
        </el-tree>
    `,
};

export const Categories = {
    name: 'Branches that lead nowhere',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An entry without `href` that has entries below it is a button: its whole row opens and closes it.',
            },
        },
    },
    render: () => html`
        <el-tree label="Library" style="max-width:18rem">
            <el-tree-item label="Guides" open="true">
                <el-tree-item label="Getting started" href="#start"></el-tree-item>
                <el-tree-item label="Theming" href="#theming" current="true"></el-tree-item>
            </el-tree-item>
            <el-tree-item label="Components">
                <el-tree-item label="Button" href="#button"></el-tree-item>
                <el-tree-item label="Tree" href="#tree"></el-tree-item>
            </el-tree-item>
            <el-tree-item label="Changelog" href="#changelog"></el-tree-item>
        </el-tree>
    `,
};

export const Indent = {
    name: 'The indent of a level',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-tree-indent` is how far the entries of a level stand in from the ones above. Unset, it is `--el-space-4`.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1.5rem;align-items:start">
            ${['0.75rem', '1.5rem'].map(
                (indent) => html`
                    <el-tree label="Indent of ${indent}" style="--el-tree-indent:${indent}">
                        <el-tree-item label="One" href="#one" open="true">
                            <el-tree-item label="Two" href="#two" open="true">
                                <el-tree-item label="Three" href="#three"></el-tree-item>
                            </el-tree-item>
                        </el-tree-item>
                    </el-tree>
                `,
            )}
        </div>
    `,
};

export const LongNames = {
    name: 'Long names, and a count',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A name that is longer than the tree breaks into more lines, inside of a word where it has to. What is slotted into `end` stands at the end of the row.',
            },
        },
    },
    render: () => html`
        <el-tree label="Long names" style="max-width:14rem;border:1px dashed var(--el-color-border, #d1d5db)">
            <el-tree-item label="A folder with a name that is longer than the tree is wide" href="#long" open="true">
                <el-badge slot="end" pill="true">128</el-badge>
                <el-tree-item label="averyveryverylongnamewithoutaspacethatauserhastyped" href="#word"></el-tree-item>
            </el-tree-item>
        </el-tree>
    `,
};
