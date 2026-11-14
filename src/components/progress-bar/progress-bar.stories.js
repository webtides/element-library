import { html } from '@webtides/element-js';
import readme from './progress-bar.readme.md?raw';
import { define } from './progress-bar.js';
define();

export default {
    title: 'Components/ProgressBar',
    component: 'el-progress-bar',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        value: 40,
        max: 100,
        indeterminate: false,
        label: 'Progress',
    },
    argTypes: {
        value: { control: { type: 'number' } },
        max: { control: { type: 'number' } },
        indeterminate: { control: 'boolean' },
    },
};

export const Playground = {
    render: ({ value, max, indeterminate, label }) => html`
        <el-progress-bar
            value="${value}"
            max="${max}"
            indeterminate="${indeterminate}"
            label="${label}"
            style="max-width:28rem"
        ></el-progress-bar>
    `,
};

export const Values = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`value` of `max` is the share of the track that is filled. `max` is 100 by default, so a value is a percentage; with another `max` it counts in the unit of the task, here 3 of 12 files.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:28rem">
            <el-progress-bar value="0" label="Not started"></el-progress-bar>
            <el-progress-bar value="40" label="Upload"></el-progress-bar>
            <el-progress-bar value="3" max="12" label="Files"></el-progress-bar>
            <el-progress-bar value="100" label="Done"></el-progress-bar>
        </div>
    `,
};

export const Indeterminate = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'For a task whose progress is not known yet. The bar has no value; a part of the track moves, and fades instead for a user who prefers reduced motion.',
            },
        },
    },
    render: () => html`<el-progress-bar indeterminate="true" label="Import" style="max-width:28rem"></el-progress-bar>`,
};

export const WithText = {
    name: 'With a text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The bar has no text of its own. The page writes what the task is and how far it is next to the bar.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.5rem;max-width:28rem">
            <div style="display:flex;justify-content:space-between;gap:1rem">
                <span>Uploading report.pdf</span>
                <span aria-hidden="true">62 %</span>
            </div>
            <el-progress-bar value="62" label="Uploading report.pdf"></el-progress-bar>
        </div>
    `,
};

export const Look = {
    name: 'Height and colours',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-progress-bar-height` sets the height, `--el-progress-bar-indicator-color` and `--el-progress-bar-track-color` the two colours.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:28rem">
            <el-progress-bar value="60" style="--el-progress-bar-height:0.25rem"></el-progress-bar>
            <el-progress-bar value="60" style="--el-progress-bar-height:1rem"></el-progress-bar>
            <el-progress-bar
                value="100"
                label="Done"
                style="--el-progress-bar-indicator-color:var(--el-color-success, #16a34a)"
            ></el-progress-bar>
            <el-progress-bar
                value="80"
                label="Storage"
                style="--el-progress-bar-indicator-color:var(--el-color-danger, #dc2626)"
            ></el-progress-bar>
        </div>
    `,
};
