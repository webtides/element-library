import { html } from '@webtides/element-js';
import readme from './splitter.readme.md?raw';
import { define } from './splitter.js';
import { define as defineList } from '../list/list.js';
import { define as defineListItem } from '../list-item/list-item.js';
define();
defineList();
defineListItem();

const messages = [
    ['Ada Lovelace', 'Notes on the analytical engine'],
    ['Grace Hopper', 'The first compiler is running'],
    ['Margaret Hamilton', 'Priority displays, and why they matter'],
    ['Katherine Johnson', 'The numbers for the orbit'],
];

/** The page takes the width from the event, and sets it on its layout. */
const follow = (property) => (event) => {
    event.currentTarget.style.setProperty(property, `${event.detail.value}px`);
};

export default {
    title: 'Components/Splitter',
    component: 'el-splitter',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Messages',
        value: 280,
        min: 180,
        max: 420,
        step: 16,
    },
};

export const Playground = {
    render: ({ label, value, min, max, step }) => html`
        <div
            style="--list:${value}px;display:grid;grid-template-columns:var(--list) auto minmax(0,1fr);height:20rem;border:1px solid var(--el-color-border, currentColor)"
            @splitter-resize="${follow('--list')}"
        >
            <el-list label="Messages" appearance="plain" style="overflow:auto">
                ${messages.map(
                    ([from, subject], index) => html`
                        <el-list-item current="${index === 0 ? 'true' : 'false'}">
                            ${from}
                            <span slot="description">${subject}</span>
                        </el-list-item>
                    `,
                )}
            </el-list>
            <el-splitter label="${label}" value="${value}" min="${min}" max="${max}" step="${step}"></el-splitter>
            <article style="padding:1rem;overflow:auto">
                <h2 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Notes on the analytical engine</h2>
                <p style="margin:0">
                    Drag the line between the list and this text, or give it the focus with the Tab key and use the
                    arrow keys, Home and End.
                </p>
            </article>
        </div>
    `,
};

export const AtTheStart = {
    name: 'At the start edge of its pane',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`placement="start"`: the pane the splitter sizes is after it, details at the end side for example. The width grows when the edge moves to the start.',
            },
        },
    },
    render: () => html`
        <div
            style="--details:240px;display:grid;grid-template-columns:minmax(0,1fr) auto var(--details);height:16rem;border:1px solid var(--el-color-border, currentColor)"
            @splitter-resize="${follow('--details')}"
        >
            <article style="padding:1rem;overflow:auto">
                <h2 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">The numbers for the orbit</h2>
                <p style="margin:0">The details are a pane at the end side.</p>
            </article>
            <el-splitter placement="start" label="Details" value="240" min="160" max="360"></el-splitter>
            <aside aria-label="Details" style="padding:1rem;overflow:auto">
                <p style="margin:0">From Katherine Johnson</p>
            </aside>
        </div>
    `,
};

export const Kept = {
    name: 'A width the page keeps',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`splitter-resize-end` tells of the width that stays: when the pointer lets go of the edge, and with every key. Here the page writes it under the panes; a real one keeps it in the storage of the browser or on the server, and gives it back as `value` and on its layout.',
            },
        },
    },
    render: () => html`
        <div
            @splitter-resize-end="${(event) => {
                event.currentTarget.querySelector('output').textContent = `${event.detail.value}px`;
            }}"
        >
            <div
                style="--list:200px;display:grid;grid-template-columns:var(--list) auto minmax(0,1fr);height:10rem;border:1px solid var(--el-color-border, currentColor)"
                @splitter-resize="${follow('--list')}"
            >
                <div style="padding:1rem;overflow:hidden">The pane</div>
                <el-splitter label="The pane" value="200" min="120" max="400"></el-splitter>
                <div style="padding:1rem">The rest</div>
            </div>
            <p style="margin:0.75rem 0 0">The width that is kept: <output>200px</output></p>
        </div>
    `,
};
