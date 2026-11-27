import { html } from '@webtides/element-js';
import readme from './menu-group.readme.md?raw';
import { define } from './menu-group.js';
import { define as defineMenu } from '../menu/menu.js';
import { define as defineMenuItem } from '../menu-item/menu-item.js';
import { define as defineButton } from '../button/button.js';
define();
defineMenu();
defineMenuItem();
defineButton();

export default {
    title: 'Components/MenuGroup',
    component: 'el-menu-group',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
            story: { inline: false, height: '18rem' },
        },
    },
    args: {
        label: 'Share',
    },
};

export const Playground = {
    render: ({ label }) => html`
        <div style="padding:1rem">
            <el-menu open="true">
                <el-button slot="trigger" caret="true">File</el-button>
                <el-menu-item value="open">Open</el-menu-item>
                <el-menu-group label="${label}">
                    <el-menu-item value="mail">Mail</el-menu-item>
                    <el-menu-item value="link">Copy link</el-menu-item>
                </el-menu-group>
            </el-menu>
        </div>
    `,
};
