import { html } from '@webtides/element-js';
import readme from './range-field.readme.md?raw';
import { define } from './range-field.js';
define();

export default {
    title: 'Components/RangeField',
    component: 'el-range-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'volume',
        label: 'Volume',
        value: '40',
        min: 0,
        max: 100,
        step: 1,
        showValue: true,
        disabled: false,
        helpMessage: 'Of the alarm, not of the media.',
    },
};

export const RangeField = {
    parameters: {
        docs: {
            description: {
                story: 'A native range with the label, the help message and the layout of every field. `show-value` shows the value beside the control.',
            },
        },
    },
    render: ({ name, label, value, min, max, step, showValue, disabled, helpMessage }) => html`
        <el-range-field
            name="${name}"
            label="${label}"
            value="${value}"
            min="${min}"
            max="${max}"
            step="${step}"
            show-value="${showValue ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
        ></el-range-field>
    `,
};

export const WithoutValue = {
    name: 'Without a value',
    parameters: {
        docs: {
            description: {
                story: 'A range always has a value. Without one the thumb is in the middle of the span, and the field takes that value over: it is what the form submits.',
            },
        },
    },
    render: () => html`
        <el-range-field
            name="brightness"
            label="Brightness"
            min="10"
            max="50"
            step="5"
            show-value="true"
        ></el-range-field>
    `,
};

export const Steps = {
    name: 'Steps',
    parameters: {
        docs: {
            description: {
                story: 'A step with decimals, and `step="any"` for every value of the span. The room for the shown value is the one of the longest value, so the control keeps its length while the thumb moves.',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-range-field
                name="opacity"
                label="Opacity"
                min="0"
                max="1"
                step="0.05"
                value="0.5"
                show-value="true"
            ></el-range-field>
            <el-range-field name="zoom" label="Zoom" min="1" max="4" step="any" value="1.5"></el-range-field>
        </div>
    `,
};

export const WithError = {
    name: 'With an error message',
    parameters: {
        docs: {
            description: {
                story: 'A range is never invalid for the browser. The page says so, after its own check: `valid="false"` shows the error message.',
            },
        },
    },
    render: () => html`
        <el-range-field
            name="budget"
            label="Budget"
            min="0"
            max="5000"
            step="100"
            value="4800"
            show-value="true"
            valid="false"
            error-message="The team has 4000 left this year."
        ></el-range-field>
    `,
};

export const Disabled = {
    render: () => html`
        <el-range-field name="locked" label="Volume" value="30" show-value="true" disabled="true"></el-range-field>
    `,
};
