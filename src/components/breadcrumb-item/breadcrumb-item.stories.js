import { html } from '@webtides/element-js';
import readme from './breadcrumb-item.readme.md?raw';
import { define } from './breadcrumb-item.js';
import { define as defineBreadcrumb } from '../breadcrumb/breadcrumb.js';
define();
defineBreadcrumb();

export default {
    title: 'Components/BreadcrumbItem',
    component: 'el-breadcrumb-item',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        href: '#',
        target: '',
        current: false,
    },
    argTypes: {
        current: { control: 'boolean' },
    },
};

export const Playground = {
    render: ({ href, target, current }) => html`
        <el-breadcrumb>
            <el-breadcrumb-item href="#">Home</el-breadcrumb-item>
            <el-breadcrumb-item href="${href}" target="${target}" current="${current}">Shoes</el-breadcrumb-item>
        </el-breadcrumb>
    `,
};

export const LinkAndText = {
    name: 'Link and text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `href` an item is a link, without it is text. `current` marks the page the user is on.',
            },
        },
    },
    render: () => html`
        <el-breadcrumb>
            <el-breadcrumb-item href="#">A link</el-breadcrumb-item>
            <el-breadcrumb-item>Text</el-breadcrumb-item>
            <el-breadcrumb-item current="true">The current page</el-breadcrumb-item>
        </el-breadcrumb>
    `,
};
