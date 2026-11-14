import { html } from '@webtides/element-js';
import readme from './breadcrumb.readme.md?raw';
import { define } from './breadcrumb.js';
import { define as defineItem } from '../breadcrumb-item/breadcrumb-item.js';
define();
defineItem();

// A house: a decoration next to "Home", so it is hidden from assistive technology.
const home = html`
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
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
    </svg>
`;

export default {
    title: 'Components/Breadcrumb',
    component: 'el-breadcrumb',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Breadcrumb',
    },
};

export const Playground = {
    render: ({ label }) => html`
        <el-breadcrumb label="${label}">
            <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
            <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
            <el-breadcrumb-item href="#">Running</el-breadcrumb-item>
            <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
        </el-breadcrumb>
    `,
};

export const Separator = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-breadcrumb-separator` is a CSS string. Set on the breadcrumb, or for the whole page, it is the separator of every entry.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem">
            <el-breadcrumb style="--el-breadcrumb-separator:'›'">
                <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            </el-breadcrumb>
            <el-breadcrumb style="--el-breadcrumb-separator:'·'">
                <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            </el-breadcrumb>
            <el-breadcrumb style="--el-breadcrumb-separator:'→'">
                <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
    `,
};

export const WithIcon = {
    name: 'With an icon',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An icon in front of the name is part of what is slotted into the item. One that only repeats the name is hidden from a screen reader.',
            },
        },
    },
    render: () => html`
        <el-breadcrumb>
            <el-breadcrumb-item href="#">${home}Home</el-breadcrumb-item>
            <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
            <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
        </el-breadcrumb>
    `,
};

export const Wrapping = {
    name: 'A trail that does not fit',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The trail breaks into a second line. That line starts with a separator, which says that the trail goes on.',
            },
        },
    },
    render: () => html`
        <div style="max-width:18rem;border:1px dashed var(--el-color-border, #d1d5db);padding:0.5rem">
            <el-breadcrumb>
                <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Outdoor</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
                <el-breadcrumb-item href="#">Running</el-breadcrumb-item>
                <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
    `,
};

export const CurrentAsLink = {
    name: 'The current page as a link',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The entry of the current page can be a link too. `current` marks it either way.',
            },
        },
    },
    render: () => html`
        <el-breadcrumb>
            <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
            <el-breadcrumb-item href="#">Shoes</el-breadcrumb-item>
            <el-breadcrumb-item href="#" current="true">Trail runner 4</el-breadcrumb-item>
        </el-breadcrumb>
    `,
};
