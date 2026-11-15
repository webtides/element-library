import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './otp-field.readme.md?raw';
import { define } from './otp-field.js';
define();

export default {
    title: 'Components/OtpField',
    component: 'el-otp-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'code',
        label: 'Code from the SMS',
        length: 6,
        required: false,
        disabled: false,
        size: 'medium',
        helpMessage: 'We have sent six digits to your phone.',
        errorMessage: 'Enter the six digits of the code.',
    },
    argTypes: {
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const OtpField = {
    parameters: {
        docs: {
            description: {
                story: 'One input for the whole code. Type it, or paste it the way a mail shows it: `123 456`.',
            },
        },
    },
    render: ({ name, label, length, required, disabled, size, helpMessage, errorMessage }) => html`
        <el-otp-field
            name="${name}"
            label="${label}"
            length="${length}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            size="${size}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-otp-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-otp-field');

        await step('renders one input that a phone can fill in', async () => {
            // The field renders its control into light DOM asynchronously on connect.
            const control = await canvas.findByLabelText('Code from the SMS');
            await expect(control).toHaveAttribute('autocomplete', 'one-time-code');
            await expect(control).toHaveAttribute('inputmode', 'numeric');
        });

        await step('takes the space out of a code and says when it is complete', async () => {
            const completes = [];
            field.addEventListener('input-complete', (event) => completes.push(event.detail));

            await userEvent.type(await canvas.findByLabelText('Code from the SMS'), '123 456');

            await waitFor(() => expect(field.value).toBe('123456'));
            await expect(completes).toEqual(['123456']);
        });
    },
};

export const SubmitsWhenComplete = {
    name: 'Submit when the code is complete',
    parameters: {
        docs: {
            description: {
                story: '`input-complete` is fired once the user has entered a code of full length that is valid. Here the page submits the form with it.',
            },
        },
    },
    render: () => html`
        <form
            style="display: grid; gap: 1rem; justify-items: start"
            @submit="${(event) => {
                event.preventDefault();
                event.target.querySelector('output').textContent =
                    `Submitted ${new FormData(event.target).get('code')}`;
            }}"
            @input-complete="${(event) => event.currentTarget.requestSubmit()}"
        >
            <el-otp-field name="code" label="Code" help-message="Six digits."></el-otp-field>
            <output></output>
        </form>
    `,
};

export const Letters = {
    name: 'A code with letters',
    parameters: {
        docs: {
            description: {
                story: 'A pattern of the page takes the place of the digits. `inputmode="text"` gives a phone its letters back.',
            },
        },
    },
    render: () => html`
        <el-otp-field
            name="backup"
            label="Backup code"
            length="8"
            pattern="[A-Za-z0-9]{8}"
            inputmode="text"
            autocomplete="off"
            help-message="Eight letters or digits, as on your list: ABCD-1234."
            error-message="A backup code has eight letters or digits."
        ></el-otp-field>
    `,
};

export const Required = {
    name: 'Required, with no code',
    parameters: {
        docs: {
            description: {
                story: 'The error message shows once the user has left the control, or the browser has refused to submit the form: press the button.',
            },
        },
    },
    render: () => html`
        <form style="display: grid; gap: 1rem; justify-items: start" @submit="${(event) => event.preventDefault()}">
            <el-otp-field
                name="code"
                label="Code"
                required="true"
                error-message="Enter the six digits of the code."
            ></el-otp-field>
            <button type="submit">Confirm</button>
        </form>
    `,
};

export const Disabled = {
    render: () => html` <el-otp-field name="locked" label="Code" value="123456" disabled="true"></el-otp-field> `,
};
