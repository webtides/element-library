import { html } from '@webtides/element-js';
import readme from './button-group.readme.md?raw';
import { define } from './button-group.js';
import { define as defineButton } from '../button/button.js';
import { define as definePopover } from '../popover/popover.js';
define();
defineButton();
definePopover();

export default {
    title: 'Components/ButtonGroup',
    component: 'el-button-group',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Text alignment',
    },
};

export const Playground = {
    render: ({ label }) => html`
        <el-button-group label="${label}">
            <el-button>Left</el-button>
            <el-button>Centre</el-button>
            <el-button>Right</el-button>
        </el-button-group>
    `,
};

export const Appearances = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Filled buttons are divided by a line on their fill, outlined ones share a border, plain ones stand side by side.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;justify-items:start">
            <el-button-group label="View">
                <el-button>Day</el-button>
                <el-button>Week</el-button>
                <el-button>Month</el-button>
            </el-button-group>
            <el-button-group label="View">
                <el-button variant="brand">Day</el-button>
                <el-button variant="brand">Week</el-button>
                <el-button variant="brand">Month</el-button>
            </el-button-group>
            <el-button-group label="View">
                <el-button appearance="outlined">Day</el-button>
                <el-button appearance="outlined">Week</el-button>
                <el-button appearance="outlined">Month</el-button>
            </el-button-group>
            <el-button-group label="View">
                <el-button appearance="plain">Day</el-button>
                <el-button appearance="plain">Week</el-button>
                <el-button appearance="plain">Month</el-button>
            </el-button-group>
        </div>
    `,
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The buttons carry their own `size`. Give every button of a group the same one.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;justify-items:start">
            <el-button-group label="History">
                <el-button size="small" appearance="outlined">Back</el-button>
                <el-button size="small" appearance="outlined">Forward</el-button>
            </el-button-group>
            <el-button-group label="History">
                <el-button appearance="outlined">Back</el-button>
                <el-button appearance="outlined">Forward</el-button>
            </el-button-group>
            <el-button-group label="History">
                <el-button size="large" appearance="outlined">Back</el-button>
                <el-button size="large" appearance="outlined">Forward</el-button>
            </el-button-group>
        </div>
    `,
};

export const Pill = {
    name: 'Pill buttons',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The outer ends of the row keep the shape of the buttons.',
            },
        },
    },
    render: () => html`
        <el-button-group label="History">
            <el-button pill="true" variant="brand">Back</el-button>
            <el-button pill="true" variant="brand">Reload</el-button>
            <el-button pill="true" variant="brand">Forward</el-button>
        </el-button-group>
    `,
};

export const Pressed = {
    name: 'With a choice that is pressed',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The group does not keep a selection. `aria-pressed` on a button says that it is on, and the page gives it another appearance.',
            },
        },
    },
    render: () => html`
        <el-button-group label="Text alignment">
            <el-button appearance="outlined" aria-pressed="false">Left</el-button>
            <el-button variant="brand" aria-pressed="true">Centre</el-button>
            <el-button appearance="outlined" aria-pressed="false">Right</el-button>
        </el-button-group>
    `,
};

export const WithPopover = {
    name: 'A button with more options',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A button inside of a slotted element is joined as that element is: here the anchor of an `el-popover`. What is in the panel of the popover is not part of the row.',
            },
        },
    },
    render: () => html`
        <el-button-group label="Save">
            <el-button variant="brand">Save</el-button>
            <el-popover placement="bottom-end">
                <el-button slot="anchor" variant="brand" caret="true" aria-label="More ways to save"></el-button>
                <div style="display:grid;gap:0.5rem">
                    <el-button appearance="plain">Save as a copy</el-button>
                    <el-button appearance="plain">Save and close</el-button>
                </div>
            </el-popover>
        </el-button-group>
    `,
};
