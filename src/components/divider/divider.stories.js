import { html } from '@webtides/element-js';
import readme from './divider.readme.md?raw';
import { define } from './divider.js';
define();

export default {
    title: 'Components/Divider',
    component: 'el-divider',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        orientation: 'horizontal',
    },
    argTypes: {
        orientation: { options: ['horizontal', 'vertical'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ orientation }) => html`
        <div style="display:flex;flex-direction:${orientation === 'vertical' ? 'row' : 'column'};gap:1rem">
            <span>Billing address</span>
            <el-divider orientation="${orientation}"></el-divider>
            <span>Shipping address</span>
        </div>
    `,
};

export const Horizontal = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A divider has no space around it. A margin on the element, or the gap of the layout, sets the distance to the content.',
            },
        },
    },
    render: () => html`
        <div style="max-width:28rem">
            <p style="margin:0">Your order is on its way. The parcel was handed over this morning.</p>
            <el-divider style="margin-block:1rem"></el-divider>
            <p style="margin:0">Questions about the delivery go to the carrier, with the number below.</p>
        </div>
    `,
};

export const Vertical = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A vertical divider is as high as the row it stands in, and as high as the text in a line of text.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1.5rem">
            <div style="display:flex;gap:1rem;align-items:center">
                <span style="display:grid;place-items:center;height:3rem">Edit</span>
                <el-divider orientation="vertical"></el-divider>
                <span>Duplicate</span>
                <el-divider orientation="vertical"></el-divider>
                <span>Remove</span>
            </div>
            <p style="margin:0">
                Imprint <el-divider orientation="vertical" style="margin-inline:0.5rem"></el-divider> Privacy
                <el-divider orientation="vertical" style="margin-inline:0.5rem"></el-divider> Terms
            </p>
        </div>
    `,
};

export const Line = {
    name: 'Colour and width',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The line has the colour and the width of the borders of the theme. `--el-divider-color` and `--el-divider-width` set other ones.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1.5rem;max-width:28rem">
            <el-divider></el-divider>
            <el-divider style="--el-divider-width:3px"></el-divider>
            <el-divider style="--el-divider-color:var(--el-color-accent, #2563eb);--el-divider-width:2px"></el-divider>
        </div>
    `,
};
