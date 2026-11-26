import { html } from '@webtides/element-js';
import readme from './nav-item.readme.md?raw';
import { define } from './nav-item.js';
import { define as defineNav } from '../nav/nav.js';
define();
defineNav();

const icon = html`
    <svg
        slot="icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M4 13h4l2 3h4l2-3h4M4 13l2.5-8h11L20 13v6H4z" />
    </svg>
`;

export default {
    title: 'Components/NavItem',
    component: 'el-nav-item',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        text: 'Inbox',
        href: '#inbox',
        current: true,
    },
};

export const Playground = {
    render: ({ text, href, current }) => html`
        <div style="max-width:8rem">
            <el-nav label="Example">
                <el-nav-item href="${href}" current="${current ? 'true' : 'false'}">${icon}${text}</el-nav-item>
            </el-nav>
        </div>
    `,
};
