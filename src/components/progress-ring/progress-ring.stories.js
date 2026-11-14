import { html } from '@webtides/element-js';
import readme from './progress-ring.readme.md?raw';
import { define } from './progress-ring.js';
define();

export default {
    title: 'Components/ProgressRing',
    component: 'el-progress-ring',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        value: 45,
        max: 100,
        label: 'Progress',
    },
    argTypes: {
        value: { control: { type: 'number' } },
        max: { control: { type: 'number' } },
    },
};

export const Playground = {
    render: ({ value, max, label }) =>
        html`<el-progress-ring value="${value}" max="${max}" label="${label}"></el-progress-ring>`,
};

export const Values = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`value` of `max` is the share of the ring that is drawn, clockwise from the top. With another `max` than 100 both count in the unit of the task, here 3 of 12 files.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-progress-ring value="0" label="Not started"></el-progress-ring>
            <el-progress-ring value="45" label="Upload"></el-progress-ring>
            <el-progress-ring value="3" max="12" label="Files"></el-progress-ring>
            <el-progress-ring value="100" label="Done"></el-progress-ring>
        </div>
    `,
};

export const Middle = {
    name: 'With a text in the middle',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The default slot is the middle of the ring. Keep the text short; a screen reader announces the value, not this text.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-progress-ring value="45" label="Storage" style="font-size:0.875rem">45 %</el-progress-ring>
            <el-progress-ring value="3" max="12" label="Files" style="font-size:0.875rem">3 / 12</el-progress-ring>
            <el-progress-ring
                value="72"
                label="Profile"
                style="--el-progress-ring-size:7rem;--el-progress-ring-track-width:0.5rem;font-size:1.5rem;font-weight:600"
                >72 %</el-progress-ring
            >
        </div>
    `,
};

export const Size = {
    name: 'Size and width of the ring',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-progress-ring-size` is the width and the height, `--el-progress-ring-track-width` the thickness of the ring.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-progress-ring
                value="60"
                style="--el-progress-ring-size:1.5rem;--el-progress-ring-track-width:0.2rem"
            ></el-progress-ring>
            <el-progress-ring value="60"></el-progress-ring>
            <el-progress-ring
                value="60"
                style="--el-progress-ring-size:6rem;--el-progress-ring-track-width:0.75rem"
            ></el-progress-ring>
        </div>
    `,
};

export const Colours = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The part that is drawn has the accent colour of the theme. `--el-progress-ring-indicator-color` and `--el-progress-ring-track-color` set the two colours.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-progress-ring value="60"></el-progress-ring>
            <el-progress-ring
                value="100"
                label="Done"
                style="--el-progress-ring-indicator-color:var(--el-color-success, #16a34a)"
            ></el-progress-ring>
            <el-progress-ring
                value="92"
                label="Storage"
                style="--el-progress-ring-indicator-color:var(--el-color-danger, #dc2626)"
            ></el-progress-ring>
        </div>
    `,
};
