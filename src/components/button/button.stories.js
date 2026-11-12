import { html } from '@webtides/element-js';
import readme from './button.readme.md?raw';
import { define } from './button.js';
define();

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
const appearances = ['filled', 'outlined', 'plain'];

export default {
    title: 'Components/Button',
    component: 'el-button',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Button',
        variant: 'brand',
        appearance: 'filled',
        size: 'medium',
        pill: false,
        circle: false,
        caret: false,
        loading: false,
        disabled: false,
    },
    argTypes: {
        variant: { options: variants, control: { type: 'select' } },
        appearance: { options: appearances, control: { type: 'inline-radio' } },
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, variant, appearance, size, pill, circle, caret, loading, disabled }) => html`
        <el-button
            variant="${variant}"
            appearance="${appearance}"
            size="${size}"
            pill="${pill ? 'true' : 'false'}"
            circle="${circle ? 'true' : 'false'}"
            caret="${caret ? 'true' : 'false'}"
            loading="${loading ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
        >
            ${label}
        </el-button>
    `,
};

export const Variants = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            ${variants.map((variant) => html`<el-button variant="${variant}">${variant}</el-button>`)}
        </div>
    `,
};

export const Appearances = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Every variant in every appearance: `filled` paints the fill of the variant, `outlined` its border and text, `plain` its text only.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.75rem">
            ${appearances.map(
                (appearance) => html`
                    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
                        ${variants.map(
                            (variant) =>
                                html`<el-button variant="${variant}" appearance="${appearance}">${variant}</el-button>`,
                        )}
                    </div>
                `,
            )}
        </div>
    `,
};

export const Sizes = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="brand" size="small">Small</el-button>
            <el-button variant="brand" size="medium">Medium</el-button>
            <el-button variant="brand" size="large">Large</el-button>
        </div>
    `,
};

export const Shapes = {
    name: 'Pill & circle',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="brand" pill="true">Pill button</el-button>
            <el-button variant="brand" circle="true" aria-label="Add">+</el-button>
            <el-button appearance="outlined" circle="true" aria-label="Settings">⚙</el-button>
        </div>
    `,
};

export const WithIcons = {
    name: 'Prefix, suffix & caret',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="brand">
                <span slot="prefix" aria-hidden="true">★</span>
                Favorite
            </el-button>
            <el-button>
                Continue
                <span slot="suffix" aria-hidden="true">→</span>
            </el-button>
            <el-button caret="true">Menu</el-button>
        </div>
    `,
};

export const Loading = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="brand" loading="true">Saving</el-button>
            <el-button loading="true">Loading</el-button>
        </div>
    `,
};

export const Disabled = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="brand" disabled="true">Disabled</el-button>
            <el-button appearance="outlined" disabled="true">Disabled</el-button>
        </div>
    `,
};

export const AsLink = {
    name: 'As a link',
    parameters: { controls: { disable: true } },
    render: () => html`
        <el-button variant="brand" href="https://webtides.github.io/element-library" target="_blank">
            Open the docs
            <span slot="suffix" aria-hidden="true">↗</span>
        </el-button>
    `,
};
