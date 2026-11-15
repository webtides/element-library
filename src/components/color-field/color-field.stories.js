import { html } from '@webtides/element-js';
import readme from './color-field.readme.md?raw';
import { define } from './color-field.js';
define();

export default {
    title: 'Components/ColorField',
    component: 'el-color-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'accent',
        label: 'Accent colour',
        value: '#2563eb',
        showValue: true,
        size: 'medium',
        disabled: false,
        helpMessage: 'Of buttons and links.',
    },
    argTypes: {
        value: { control: 'color' },
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const ColorField = {
    parameters: {
        docs: {
            description: {
                story: 'A native colour input with the label, the help message and the layout of every field. `show-value` shows the value beside the control.',
            },
        },
    },
    render: ({ name, label, value, showValue, size, disabled, helpMessage }) => html`
        <el-color-field
            name="${name}"
            label="${label}"
            value="${value}"
            show-value="${showValue ? 'true' : 'false'}"
            size="${size}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
        ></el-color-field>
    `,
};

export const WithoutValue = {
    name: 'Without a value',
    parameters: {
        docs: {
            description: {
                story: 'A colour input always has a value. Without one it is black, and the field takes that value over: it is what the form submits.',
            },
        },
    },
    render: () => html`<el-color-field name="ink" label="Ink" show-value="true"></el-color-field>`,
};

export const Options = {
    name: 'With colours to pick from',
    parameters: {
        docs: {
            description: {
                story: 'The picker of the browser offers the colours of `options`. How it shows them is up to the browser; the user can still pick any other colour.',
            },
        },
    },
    render: () => html`
        <el-color-field
            name="label"
            label="Label colour"
            value="#16a34a"
            show-value="true"
            .options="${['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#111827']}"
        ></el-color-field>
    `,
};

export const Sizes = {
    parameters: {
        docs: {
            description: {
                story: 'The three sizes show once the control is decorated (`styles/native.css`): the control is as high as an input of its size.',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-color-field name="small" label="Small" size="small" value="#2563eb"></el-color-field>
            <el-color-field name="medium" label="Medium" value="#2563eb"></el-color-field>
            <el-color-field name="large" label="Large" size="large" value="#2563eb"></el-color-field>
        </div>
    `,
};

export const WithError = {
    name: 'With an error message',
    parameters: {
        docs: {
            description: {
                story: 'A colour is never invalid for the browser. The page says so, after its own check: `valid="false"` shows the error message.',
            },
        },
    },
    render: () => html`
        <el-color-field
            name="text"
            label="Text colour"
            value="#e5e7eb"
            show-value="true"
            valid="false"
            error-message="Too light to read on white."
        ></el-color-field>
    `,
};

export const Disabled = {
    render: () => html`
        <el-color-field
            name="locked"
            label="Accent colour"
            value="#2563eb"
            show-value="true"
            disabled="true"
        ></el-color-field>
    `,
};
