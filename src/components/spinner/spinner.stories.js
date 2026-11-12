import { html } from '@webtides/element-js';
import readme from './spinner.readme.md?raw';
import { define } from './spinner.js';
define();

export default {
    title: 'Components/Spinner',
    component: 'el-spinner',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        size: 'medium',
        label: 'Loading',
    },
    argTypes: {
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ size, label }) => html`<el-spinner size="${size}" label="${label}"></el-spinner>`,
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A spinner is as large as the text it stands in. `small` is 0.8 times, `large` 1.25 times that size.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
            <el-spinner size="small"></el-spinner>
            <el-spinner size="medium"></el-spinner>
            <el-spinner size="large"></el-spinner>
        </div>
    `,
};

export const FontSize = {
    name: 'Sized by the font size',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'For a spinner of any other size, set a font size: on the spinner itself or on what it stands in.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-spinner style="font-size:1.5rem"></el-spinner>
            <el-spinner style="font-size:2.5rem"></el-spinner>
            <el-spinner style="font-size:4rem"></el-spinner>
        </div>
    `,
};

export const InText = {
    name: 'In a line of text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Next to a text that already says what is going on, the spinner is decoration: `aria-hidden="true"` keeps a screen reader from announcing both.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.75rem">
            <p style="margin:0"><el-spinner aria-hidden="true"></el-spinner> Loading the results</p>
            <h3 style="margin:0;font-size:1.5rem"><el-spinner aria-hidden="true"></el-spinner> Saving your changes</h3>
        </div>
    `,
};

export const Colours = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The indicator has the accent colour of the theme. `--el-spinner-indicator-color` and `--el-spinner-track-color` set the two colours; on a coloured surface, `currentColor` makes the indicator follow the text.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center;font-size:1.5rem">
            <el-spinner></el-spinner>
            <el-spinner style="--el-spinner-indicator-color:var(--el-color-danger, #dc2626)"></el-spinner>
            <span
                style="display:inline-flex;padding:0.75rem;border-radius:0.5rem;background:#1e3a8a;color:#ffffff;--el-spinner-indicator-color:currentColor"
            >
                <el-spinner></el-spinner>
            </span>
        </div>
    `,
};
