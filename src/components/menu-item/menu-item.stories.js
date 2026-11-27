import { html } from '@webtides/element-js';
import readme from './menu-item.readme.md?raw';
import { define } from './menu-item.js';
import { define as defineMenu } from '../menu/menu.js';
import { define as defineButton } from '../button/button.js';
define();
defineMenu();
defineButton();

export default {
    title: 'Components/MenuItem',
    component: 'el-menu-item',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
            story: { inline: false, height: '16rem' },
        },
    },
    args: {
        href: '',
        value: 'edit',
        disabled: false,
        variant: 'neutral',
    },
    argTypes: {
        variant: { options: ['neutral', 'brand', 'success', 'warning', 'danger'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ href, value, disabled, variant }) => html`
        <div style="padding:1rem">
            <el-menu open="true">
                <el-button slot="trigger" caret="true">More</el-button>
                <el-menu-item
                    href="${href}"
                    value="${value}"
                    disabled="${disabled ? 'true' : 'false'}"
                    variant="${variant}"
                    >The entry of the controls</el-menu-item
                >
                <el-menu-item value="other">Another entry</el-menu-item>
            </el-menu>
        </div>
    `,
};
