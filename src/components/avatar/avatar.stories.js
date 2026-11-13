import { html } from '@webtides/element-js';
import readme from './avatar.readme.md?raw';
import { define } from './avatar.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

const shapes = ['circle', 'square', 'rounded'];
const sizes = ['small', 'medium', 'large'];
// A picture without a request: a face of two circles.
const picture = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#fde68a" />
        <circle cx="100" cy="80" r="42" fill="#7c2d12" />
        <path d="M20 200a80 80 0 0 1 160 0z" fill="#f97316" />
    </svg>
`)}`;

export default {
    title: 'Components/Avatar',
    component: 'el-avatar',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Ada Lovelace',
        initials: 'AL',
        image: '',
        shape: 'circle',
        size: 'medium',
    },
    argTypes: {
        shape: { options: shapes, control: { type: 'inline-radio' } },
        size: { options: sizes, control: { type: 'inline-radio' } },
        image: { description: 'The address of an image. Empty: the initials are shown.' },
    },
};

export const Playground = {
    render: ({ label, initials, image, shape, size }) => html`
        <el-avatar label="${label}" initials="${initials}" image="${image}" shape="${shape}" size="${size}"></el-avatar>
    `,
};

export const WhatItShows = {
    name: 'Image, initials, icon',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An avatar shows the first of these that it has: the image, the initials, an icon. The last one has an image that cannot be loaded, and shows its initials instead.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            <el-avatar label="Ada Lovelace" image="${picture}"></el-avatar>
            <el-avatar label="Grace Hopper" initials="GH"></el-avatar>
            <el-avatar label="Unknown user"></el-avatar>
            <el-avatar label="Katherine Johnson" initials="KJ" image="data:image/png;base64,AAAA"></el-avatar>
        </div>
    `,
};

export const Shapes = {
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
            ${shapes.map((shape) => html`<el-avatar label="${shape}" shape="${shape}" initials="AL"></el-avatar>`)}
            ${shapes.map((shape) => html`<el-avatar label="${shape}" shape="${shape}" image="${picture}"></el-avatar>`)}
        </div>
    `,
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The width and the height of an avatar are the control height of its size, the least height of a button of that size. `--el-avatar-size` makes it any other size, and the initials and the icon grow with it.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem">
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
                ${sizes.map(
                    (size) => html`
                        <el-avatar label="${size}" size="${size}" initials="AL"></el-avatar>
                        <el-button size="${size}">${size}</el-button>
                    `,
                )}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
                <el-avatar label="Ada Lovelace" initials="AL" style="--el-avatar-size:5rem"></el-avatar>
                <el-avatar label="Unknown user" style="--el-avatar-size:5rem"></el-avatar>
                <el-avatar label="Ada Lovelace" image="${picture}" style="--el-avatar-size:5rem"></el-avatar>
            </div>
        </div>
    `,
};

export const OwnIcon = {
    name: 'An icon of your own',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The `icon` slot takes the place of the outline of a person, for a team or a bot for example.',
            },
        },
    },
    render: () => html`
        <el-avatar label="Build bot" shape="rounded">
            <svg
                slot="icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect x="4" y="8" width="16" height="11" rx="2" />
                <path d="M12 8V4M9 13v2M15 13v2" />
            </svg>
        </el-avatar>
    `,
};

export const BesideAName = {
    name: 'Beside a name',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Where the name is written out beside it, the avatar has no `label`: it is a decoration and hidden from assistive technology, so the name is not read twice.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:0.5rem">
            <span><el-avatar size="small" initials="AL"></el-avatar> Ada Lovelace</span>
            <span><el-avatar size="small" image="${picture}"></el-avatar> Grace Hopper</span>
        </div>
    `,
};
