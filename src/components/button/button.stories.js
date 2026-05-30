import { html } from '@webtides/element-js';
import readme from './button.readme.md?raw';
import { define } from './button.js';
define();

const variants = ['default', 'primary', 'success', 'neutral', 'warning', 'danger', 'text'];

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
        variant: 'primary',
        size: 'medium',
        outline: false,
        pill: false,
        circle: false,
        caret: false,
        loading: false,
        disabled: false,
    },
    argTypes: {
        variant: { options: variants, control: { type: 'select' } },
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, variant, size, outline, pill, circle, caret, loading, disabled }) => html`
        <el-button
            variant="${variant}"
            size="${size}"
            outline="${outline ? 'true' : 'false'}"
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

export const Outline = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            ${variants
                .filter((v) => v !== 'text')
                .map((variant) => html`<el-button variant="${variant}" outline="true">${variant}</el-button>`)}
        </div>
    `,
};

export const Sizes = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="primary" size="small">Small</el-button>
            <el-button variant="primary" size="medium">Medium</el-button>
            <el-button variant="primary" size="large">Large</el-button>
        </div>
    `,
};

export const Shapes = {
    name: 'Pill & circle',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="primary" pill="true">Pill button</el-button>
            <el-button variant="primary" circle="true" aria-label="Add">+</el-button>
            <el-button variant="default" circle="true" outline="true" aria-label="Settings">⚙</el-button>
        </div>
    `,
};

export const WithIcons = {
    name: 'Prefix, suffix & caret',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="primary">
                <span slot="prefix" aria-hidden="true">★</span>
                Favorite
            </el-button>
            <el-button variant="default">
                Continue
                <span slot="suffix" aria-hidden="true">→</span>
            </el-button>
            <el-button variant="default" caret="true">Menu</el-button>
        </div>
    `,
};

export const Loading = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="primary" loading="true">Saving</el-button>
            <el-button variant="default" loading="true">Loading</el-button>
        </div>
    `,
};

export const Disabled = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-button variant="primary" disabled="true">Disabled</el-button>
            <el-button variant="default" outline="true" disabled="true">Disabled</el-button>
        </div>
    `,
};

export const AsLink = {
    name: 'As a link',
    parameters: { controls: { disable: true } },
    render: () => html`
        <el-button variant="primary" href="https://webtides.github.io/element-library" target="_blank">
            Open the docs
            <span slot="suffix" aria-hidden="true">↗</span>
        </el-button>
    `,
};
