import { html } from '@webtides/element-js';
import readme from './badge.readme.md?raw';
import { define } from './badge.js';
define();

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
const appearances = ['filled', 'outlined', 'plain'];

export default {
    title: 'Components/Badge',
    component: 'el-badge',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'New',
        variant: 'brand',
        appearance: 'filled',
        pill: false,
        pulse: false,
    },
    argTypes: {
        variant: { options: variants, control: { type: 'select' } },
        appearance: { options: appearances, control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, variant, appearance, pill, pulse }) => html`
        <el-badge
            variant="${variant}"
            appearance="${appearance}"
            pill="${pill ? 'true' : 'false'}"
            pulse="${pulse ? 'true' : 'false'}"
        >
            ${label}
        </el-badge>
    `,
};

export const Variants = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            ${variants.map((variant) => html`<el-badge variant="${variant}">${variant}</el-badge>`)}
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
                                html`<el-badge variant="${variant}" appearance="${appearance}">${variant}</el-badge>`,
                        )}
                    </div>
                `,
            )}
        </div>
    `,
};

export const Pill = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A badge with a single character is as wide as it is high: a square, and a circle as a `pill`.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-badge variant="brand" pill="true">Beta</el-badge>
            <el-badge variant="danger" pill="true">3</el-badge>
            <el-badge variant="danger">3</el-badge>
            <el-badge variant="success" appearance="outlined" pill="true">99+</el-badge>
        </div>
    `,
};

export const Pulse = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A ring spreads from the badge, again and again. It stands still for a user who prefers reduced motion.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center;padding:0.5rem">
            ${variants.map(
                (variant) => html`<el-badge variant="${variant}" pill="true" pulse="true">${variant}</el-badge>`,
            )}
        </div>
    `,
};

export const InText = {
    name: 'Sized by the text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A badge is three quarters of the font size of the text it stands in.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.75rem">
            <h2 style="margin:0;font-size:1.75rem">Releases <el-badge variant="brand">New</el-badge></h2>
            <p style="margin:0">Inbox <el-badge variant="danger" pill="true">3</el-badge></p>
            <p style="margin:0;font-size:0.875rem">
                Build <el-badge variant="success" appearance="outlined">passing</el-badge>
            </p>
        </div>
    `,
};
