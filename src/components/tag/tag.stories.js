import { expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './tag.readme.md?raw';
import { define } from './tag.js';
define();

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
const appearances = ['filled', 'outlined', 'plain'];

export default {
    title: 'Components/Tag',
    component: 'el-tag',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'TypeScript',
        variant: 'neutral',
        appearance: 'filled',
        size: 'medium',
        pill: false,
        removable: true,
    },
    argTypes: {
        variant: { options: variants, control: { type: 'select' } },
        appearance: { options: appearances, control: { type: 'inline-radio' } },
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ label, variant, appearance, size, pill, removable }) => html`
        <el-tag
            variant="${variant}"
            appearance="${appearance}"
            size="${size}"
            pill="${pill ? 'true' : 'false'}"
            removable="${removable ? 'true' : 'false'}"
        >
            ${label}
        </el-tag>
    `,
};

export const Variants = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
            ${variants.map((variant) => html`<el-tag variant="${variant}">${variant}</el-tag>`)}
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
        <div style="display:grid;gap:0.5rem">
            ${appearances.map(
                (appearance) => html`
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
                        ${variants.map(
                            (variant) =>
                                html`<el-tag variant="${variant}" appearance="${appearance}" removable="true">
                                    ${variant}
                                </el-tag>`,
                        )}
                    </div>
                `,
            )}
        </div>
    `,
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A tag is 0.7 times as high as a control of the same size, so it fits into one.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
            <el-tag size="small" removable="true">Small</el-tag>
            <el-tag size="medium" removable="true">Medium</el-tag>
            <el-tag size="large" removable="true">Large</el-tag>
        </div>
    `,
};

export const Pill = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
            <el-tag pill="true">Draft</el-tag>
            <el-tag variant="brand" pill="true" removable="true">Design</el-tag>
            <el-tag variant="success" appearance="outlined" pill="true" removable="true">Published</el-tag>
        </div>
    `,
};

export const Removable = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The remove button fires `tag-remove`. The tag does not remove itself: here a listener on the list takes the tag out that the event comes from.',
            },
        },
    },
    render: () => html`
        <div
            data-testid="tags"
            style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center"
            @tag-remove="${(event) => event.target.remove()}"
        >
            <el-tag removable="true">TypeScript</el-tag>
            <el-tag removable="true">Svelte</el-tag>
            <el-tag removable="true">Vite</el-tag>
        </div>
    `,
    play: async ({ canvasElement }) => {
        const list = canvasElement.querySelector('[data-testid="tags"]');
        const second = list.children[1];
        // The shadow root comes with the first render, a frame after the element is connected.
        const button = await waitFor(() => {
            const found = second.shadowRoot?.querySelector('[part="remove-button"]');
            if (!found) throw new Error('The remove button is not rendered yet');
            return found;
        });

        button.click();

        await waitFor(() => expect(list.children).toHaveLength(2));
        expect([...list.children].map((tag) => tag.textContent.trim())).toEqual(['TypeScript', 'Vite']);
    },
};

export const LongText = {
    name: 'A text that does not fit',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="width:12rem;padding:0.5rem;border:1px dashed currentColor">
            <el-tag removable="true">A keyword that is much too long for this place</el-tag>
        </div>
    `,
};
