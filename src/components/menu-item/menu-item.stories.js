import { html } from '@webtides/element-js';
import readme from './menu-item.readme.md?raw';
import { define } from './menu-item.js';
import { define as defineMenu } from '../menu/menu.js';
import { define as defineMenuGroup } from '../menu-group/menu-group.js';
import { define as defineButton } from '../button/button.js';
define();
defineMenu();
defineMenuGroup();
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
        type: 'normal',
        checked: false,
        variant: 'neutral',
    },
    argTypes: {
        type: { options: ['normal', 'checkbox', 'radio'], control: { type: 'inline-radio' } },
        variant: { options: ['neutral', 'brand', 'success', 'warning', 'danger'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ href, value, disabled, type, checked, variant }) => html`
        <div style="padding:1rem">
            <el-menu open="true">
                <el-button slot="trigger" caret="true">More</el-button>
                <el-menu-item
                    href="${href}"
                    value="${value}"
                    disabled="${disabled ? 'true' : 'false'}"
                    type="${type}"
                    checked="${checked ? 'true' : 'false'}"
                    variant="${variant}"
                    >The entry of the controls</el-menu-item
                >
                <el-menu-item value="other">Another entry</el-menu-item>
            </el-menu>
        </div>
    `,
};

export const Checked = {
    name: 'Entries that are checked',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `type="radio"` an entry is one of several of which one is chosen, with `type="checkbox"` it is on or off, and `checked` is the state: a dot or a check in front of the text, whose place is there while the entry is not checked as well. The page sets the state. Here its listener of `menu-select` does, and the menu opens again to show it.',
            },
            story: { inline: false, height: '20rem' },
        },
    },
    render: () => {
        const choose = (event) => {
            const { item } = event.detail;
            if (item.type === 'radio') {
                for (const other of item.parentElement.querySelectorAll('el-menu-item')) other.checked = other === item;
            } else if (item.type === 'checkbox') {
                item.checked = !item.checked;
            }
            // A menu closes after a choice. The story shows what has changed.
            const menu = event.currentTarget;
            setTimeout(() => menu.show(), 150);
        };

        return html`
            <div style="padding:1rem">
                <el-menu open="true" @menu-select="${choose}">
                    <el-button slot="trigger" caret="true">View</el-button>
                    <el-menu-group label="Layout">
                        <el-menu-item type="radio" value="list" checked="true">List</el-menu-item>
                        <el-menu-item type="radio" value="grid">Grid</el-menu-item>
                        <el-menu-item type="radio" value="board" disabled="true">Board</el-menu-item>
                    </el-menu-group>
                    <el-menu-group>
                        <el-menu-item type="checkbox" value="archived" checked="true">Show archived</el-menu-item>
                        <el-menu-item type="checkbox" value="drafts">Show drafts</el-menu-item>
                    </el-menu-group>
                </el-menu>
            </div>
        `;
    },
};
