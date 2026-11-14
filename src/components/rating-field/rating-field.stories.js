import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './rating-field.readme.md?raw';
import { define } from './rating-field.js';
define();

export default {
    title: 'Components/RatingField',
    component: 'el-rating-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'rating',
        label: 'How was your stay?',
        value: '3',
        max: 5,
        required: false,
        disabled: false,
        helpMessage: 'One star is poor, five are great.',
        errorMessage: 'Please rate your stay.',
    },
};

export const RatingField = {
    parameters: {
        docs: {
            description: {
                story: 'A rating from 1 to `max` as a row of stars. It is a native radio group: click a star, or move with the arrow keys.',
            },
        },
    },
    render: ({ name, label, value, max, required, disabled, helpMessage, errorMessage }) => html`
        <el-rating-field
            name="${name}"
            label="${label}"
            value="${value}"
            max="${max}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-rating-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-rating-field');

        await step('renders one radio per star, the one of the value chosen', async () => {
            // The field renders its radios into light DOM asynchronously on connect.
            const radios = await canvas.findAllByRole('radio');
            await expect(radios).toHaveLength(5);
            await expect(radios[2]).toBeChecked();
        });

        await step('a click on the fifth star chooses it', async () => {
            await userEvent.click(await canvas.findByRole('radio', { name: '5' }));
            await waitFor(() => expect(field.value).toBe('5'));
        });
    },
};

export const Required = {
    name: 'Required, with nothing chosen',
    parameters: {
        docs: {
            description: {
                story: 'The field is not valid from the start. Its error message shows once the user has left the group, or the browser has refused to submit the form: press the button.',
            },
        },
    },
    render: () => html`
        <form style="display: grid; gap: 1rem; justify-items: start" @submit="${(event) => event.preventDefault()}">
            <el-rating-field
                name="service"
                label="Service"
                required="true"
                error-message="Please rate the service."
            ></el-rating-field>
            <button type="submit">Send</button>
        </form>
    `,
};

export const Scale = {
    name: 'A longer scale',
    parameters: {
        docs: {
            description: {
                story: '`max` is the number of stars.',
            },
        },
    },
    render: () => html` <el-rating-field name="score" label="Score" max="10" value="7"></el-rating-field> `,
};

export const ColorAndSize = {
    name: 'Colour and size',
    parameters: {
        docs: {
            description: {
                story: 'A filled star has the accent colour of the theme. `--el-rating-color` sets another one, `--el-rating-size` the size of a star.',
            },
        },
    },
    render: () => html`
        <el-rating-field
            name="colour"
            label="Rating"
            value="4"
            style="--el-rating-color: #b45309; --el-rating-size: 2.25rem"
        ></el-rating-field>
    `,
};

export const Disabled = {
    render: () => html` <el-rating-field name="locked" label="Rating" value="2" disabled="true"></el-rating-field> `,
};
