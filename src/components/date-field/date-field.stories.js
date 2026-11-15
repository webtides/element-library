import { html } from '@webtides/element-js';
import readme from './date-field.readme.md?raw';
import { define } from './date-field.js';
define();

export default {
    title: 'Components/DateField',
    component: 'el-date-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'delivery',
        label: 'Delivery',
        type: 'date',
        value: '2026-11-20',
        min: '2026-11-16',
        max: '2026-12-23',
        step: '',
        required: false,
        disabled: false,
        size: 'medium',
        helpMessage: 'Between 16 November and 23 December.',
        errorMessage: 'Pick a day between 16 November and 23 December.',
    },
    argTypes: {
        type: { control: 'select', options: ['date', 'time', 'datetime-local', 'month', 'week'] },
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const DateField = {
    parameters: {
        docs: {
            description: {
                story: 'The control of the browser for a date, with the label, the help message and the layout of every field. `min` and `max` are the earliest and the latest day.',
            },
        },
    },
    render: ({ name, label, type, value, min, max, step, required, disabled, size, helpMessage, errorMessage }) => html`
        <el-date-field
            name="${name}"
            label="${label}"
            type="${type}"
            value="${value}"
            min="${min}"
            max="${max}"
            step="${step}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            size="${size}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-date-field>
    `,
};

export const Types = {
    name: 'A time, both, a month, a week',
    parameters: {
        docs: {
            description: {
                story: 'The `type` picks the control. The value is always in the one format of that control. A month and a week are a text input in a browser that has no control for them.',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-date-field name="time" label="Time" type="time" value="14:30"></el-date-field>
            <el-date-field
                name="both"
                label="Date and time"
                type="datetime-local"
                value="2026-11-15T14:30"
            ></el-date-field>
            <el-date-field name="month" label="Month" type="month" value="2026-11"></el-date-field>
            <el-date-field name="week" label="Week" type="week" value="2026-W46"></el-date-field>
        </div>
    `,
};

export const Steps = {
    name: 'A time in steps',
    parameters: {
        docs: {
            description: {
                story: 'The step of a time is in seconds: every quarter of an hour between nine and five. A time beside a step or outside of the limits is not valid.',
            },
        },
    },
    render: () => html`
        <el-date-field
            name="pickup"
            label="Pick-up"
            type="time"
            min="09:00"
            max="17:00"
            step="900"
            value="09:15"
            help-message="Every quarter of an hour, from 9 to 5."
            error-message="Pick a quarter of an hour between 9 and 5."
        ></el-date-field>
    `,
};

export const Required = {
    name: 'Required, in a form',
    parameters: {
        docs: {
            description: {
                story: 'The browser refuses to submit the form without a date, and with one outside of the limits. The field then shows its error message.',
            },
        },
    },
    render: () => html`
        <form
            style="display: grid; gap: 1rem; justify-items: start"
            @submit="${(event) => {
                event.preventDefault();
                event.target.querySelector('output').textContent =
                    `Submitted: ${new FormData(event.target).get('arrival')}`;
            }}"
        >
            <el-date-field
                name="arrival"
                label="Arrival"
                required="true"
                min="2026-11-16"
                error-message="Pick a day from 16 November on."
            ></el-date-field>
            <button type="submit">Send</button>
            <output></output>
        </form>
    `,
};

export const Sizes = {
    parameters: {
        docs: {
            description: {
                story: 'The three sizes show once the control is decorated (`styles/native.css`).',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-date-field name="small" label="Small" size="small" value="2026-11-15"></el-date-field>
            <el-date-field name="medium" label="Medium" value="2026-11-15"></el-date-field>
            <el-date-field name="large" label="Large" size="large" value="2026-11-15"></el-date-field>
        </div>
    `,
};

export const Disabled = {
    render: () => html`
        <el-date-field name="locked" label="Delivery" value="2026-11-20" disabled="true"></el-date-field>
    `,
};
