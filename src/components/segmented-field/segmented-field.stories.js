import { html } from '@webtides/element-js';
import readme from './segmented-field.readme.md?raw';
import { define } from './segmented-field.js';
define();

// Symbols for the options that show an icon. An option names one by its address.
const sprite = html`
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
        <symbol id="segmented-story-list" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
        </symbol>
        <symbol id="segmented-story-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </symbol>
    </svg>
`;

export default {
    title: 'Components/SegmentedField',
    component: 'el-segmented-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Calendar',
        value: 'week',
        size: 'medium',
        required: false,
        disabled: false,
        helpMessage: '',
        errorMessage: 'Please choose one.',
    },
    argTypes: {
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, value, size, required, disabled, helpMessage, errorMessage }) => html`
        <el-segmented-field
            name="view"
            label="${label}"
            value="${value}"
            size="${size}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
            .options="${[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
            ]}"
        ></el-segmented-field>
    `,
};

export const Sizes = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:grid;gap:1.5rem">
            ${['small', 'medium', 'large'].map(
                (size) => html`
                    <el-segmented-field
                        name="size-${size}"
                        label="${size}"
                        size="${size}"
                        value="Week"
                        .options="${['Day', 'Week', 'Month']}"
                    ></el-segmented-field>
                `,
            )}
        </div>
    `,
};

export const Icons = {
    name: 'Options that show an icon',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `icon`, the address of an SVG symbol, an option shows the icon in the place of its label. The label is its name for assistive technology, and its tooltip.',
            },
        },
    },
    render: () => html`
        ${sprite}
        <el-segmented-field
            name="layout"
            label="Layout"
            value="list"
            .options="${[
                { value: 'list', label: 'List', icon: '#segmented-story-list' },
                { value: 'grid', label: 'Grid', icon: '#segmented-story-grid' },
            ]}"
        ></el-segmented-field>
    `,
};

export const Disabled = {
    name: 'Disabled, as a whole and one option',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:grid;gap:1.5rem">
            <el-segmented-field
                name="one"
                label="One option is disabled"
                value="day"
                .options="${[
                    { value: 'day', label: 'Day' },
                    { value: 'week', label: 'Week', disabled: true },
                    { value: 'month', label: 'Month' },
                ]}"
            ></el-segmented-field>
            <el-segmented-field
                name="all"
                label="The whole field is disabled"
                value="Week"
                disabled="true"
                .options="${['Day', 'Week', 'Month']}"
            ></el-segmented-field>
        </div>
    `,
};

export const Required = {
    name: 'In a form, required',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The field has a value under its name in a native form. `required` is the constraint of the browser: a submit without a choice is refused, and the field shows its error message.',
            },
        },
    },
    render: () => html`
        <form
            style="display:grid;gap:1rem;justify-items:start"
            onsubmit="event.preventDefault(); this.querySelector('output').textContent = 'Submitted: ' + new URLSearchParams(new FormData(this)).toString();"
        >
            <el-segmented-field
                name="plan"
                label="Plan"
                required="true"
                help-message="You can change it later."
                error-message="Please choose a plan."
                .options="${['Free', 'Team', 'Company']}"
            ></el-segmented-field>
            <div style="display:flex;gap:0.5rem">
                <button type="submit" style="border:1px solid;border-radius:0.25rem;padding:0.25rem 0.75rem">
                    Submit
                </button>
                <button type="reset" style="border:1px solid;border-radius:0.25rem;padding:0.25rem 0.75rem">
                    Reset
                </button>
            </div>
            <output></output>
        </form>
    `,
};

export const Narrow = {
    name: 'A row that is wider than its place',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The row is never wider than its place. The options share the width then, and a label that does not fit breaks into lines.',
            },
        },
    },
    render: () => html`
        <div style="max-width:20rem;border:1px dashed var(--el-color-border, #d1d5db);padding:0.5rem">
            <el-segmented-field
                name="narrow"
                label="Notifications"
                value="mentions"
                .options="${[
                    { value: 'all', label: 'Every message' },
                    { value: 'mentions', label: 'Mentions only' },
                    { value: 'none', label: 'Nothing at all' },
                ]}"
            ></el-segmented-field>
        </div>
    `,
};
