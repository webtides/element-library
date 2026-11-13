import { html } from '@webtides/element-js';
import readme from './skeleton.readme.md?raw';
import { define } from './skeleton.js';
import { define as defineCard } from '../card/card.js';
define();
defineCard();

const effects = ['none', 'sheen', 'pulse'];

export default {
    title: 'Components/Skeleton',
    component: 'el-skeleton',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        effect: 'sheen',
    },
    argTypes: {
        effect: { options: effects, control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ effect }) => html`
        <div style="display:grid;gap:0.75rem;max-width:24rem" aria-busy="true">
            <el-skeleton effect="${effect}" style="width:40%"></el-skeleton>
            <el-skeleton effect="${effect}"></el-skeleton>
            <el-skeleton effect="${effect}" style="width:80%"></el-skeleton>
        </div>
    `,
};

export const Effects = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`none` stands still, `sheen` lets a lighter band pass over the shape, `pulse` fades and comes back. Both stand still for a user who prefers reduced motion.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:24rem">
            ${effects.map(
                (effect) => html`
                    <div style="display:grid;gap:0.5rem">
                        <span>${effect}</span>
                        <el-skeleton effect="${effect}"></el-skeleton>
                    </div>
                `,
            )}
        </div>
    `,
};

export const Shapes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A line by default. A width and a height on the element make it a block, `--el-skeleton-radius` a circle or a shape with sharp corners.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
            <el-skeleton style="width:10rem"></el-skeleton>
            <el-skeleton style="width:3rem;height:3rem;--el-skeleton-radius:50%"></el-skeleton>
            <el-skeleton style="width:3rem;height:3rem"></el-skeleton>
            <el-skeleton style="width:9rem;height:auto;aspect-ratio:3/2"></el-skeleton>
            <el-skeleton style="width:6rem;height:2.5rem;--el-skeleton-radius:0"></el-skeleton>
        </div>
    `,
};

export const SizedByTheText = {
    name: 'Sized by the text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A line is as high as the text it stands in for: in a heading it is higher than in a paragraph.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.75rem;max-width:24rem">
            <h2 style="margin:0;font-size:1.75rem"><el-skeleton style="width:60%"></el-skeleton></h2>
            <p style="margin:0"><el-skeleton></el-skeleton></p>
            <p style="margin:0;font-size:0.875rem"><el-skeleton style="width:30%"></el-skeleton></p>
        </div>
    `,
};

export const InACard = {
    name: 'In the place of a card’s content',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The region that loads says so with `aria-busy`, and a text that is hidden from the eye says what is loading.',
            },
        },
    },
    render: () => html`
        <el-card style="max-width:24rem" aria-busy="true">
            <span style="position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden;white-space:nowrap"
                >Loading the profile</span
            >
            <el-skeleton
                slot="media"
                effect="sheen"
                style="height:auto;aspect-ratio:3/1;--el-skeleton-radius:0"
            ></el-skeleton>
            <div style="display:flex;gap:0.75rem;align-items:center">
                <el-skeleton
                    effect="sheen"
                    style="flex:none;width:3rem;height:3rem;--el-skeleton-radius:50%"
                ></el-skeleton>
                <div style="flex:1;display:grid;gap:0.5rem">
                    <el-skeleton effect="sheen" style="width:50%"></el-skeleton>
                    <el-skeleton effect="sheen" style="width:80%"></el-skeleton>
                </div>
            </div>
        </el-card>
    `,
};
