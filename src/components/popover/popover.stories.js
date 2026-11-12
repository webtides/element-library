import { expect, userEvent, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './popover.readme.md?raw';
import { define } from './popover.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

const sides = ['top', 'bottom', 'left', 'right'];
const placements = sides.flatMap((side) => [side, `${side}-start`, `${side}-end`]);

export default {
    title: 'Components/Popover',
    component: 'el-popover',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        placement: 'bottom',
        distance: 8,
        arrow: false,
    },
    argTypes: {
        placement: { options: placements, control: { type: 'select' } },
        distance: { control: { type: 'number', min: 0, max: 40 } },
    },
};

export const Playground = {
    render: ({ placement, distance, arrow }) => html`
        <div style="display:flex;justify-content:center;padding:8rem 2rem">
            <el-popover placement="${placement}" distance="${distance}" arrow="${arrow ? 'true' : 'false'}">
                <el-button slot="anchor" variant="brand" caret="true">Options</el-button>
                <strong>Sort the list</strong>
                <p style="margin:0.25rem 0 0">By date, by name or by size.</p>
            </el-popover>
        </div>
    `,
    play: async ({ canvasElement }) => {
        const popover = canvasElement.querySelector('el-popover');
        // The shadow root comes with the first render, a frame after the element is connected.
        const panel = await waitFor(() => {
            const found = popover.shadowRoot?.querySelector('[part="panel"]');
            if (!found) throw new Error('The panel is not rendered yet');
            return found;
        });
        const anchor = popover.querySelector('el-button');

        await userEvent.click(anchor);
        await waitFor(() => expect(panel.matches(':popover-open')).toBe(true));
        expect(anchor.getAttribute('aria-expanded')).toBe('true');

        // Escape is not tried here: the keys of this test are simulated, and the platform closes a
        // popover only for a real one. The feature tests press the real key.
        await userEvent.click(anchor);
        await waitFor(() => expect(panel.matches(':popover-open')).toBe(false));
        expect(popover.open).toBe(false);
        expect(anchor.getAttribute('aria-expanded')).toBe('false');
    },
};

export const Placements = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The side of the anchor, and with `-start` or `-end` the edge of the anchor the panel is aligned with. One popover is open at a time: opening the next closes the one before.',
            },
        },
    },
    render: () => html`
        <div
            style="display:grid;grid-template-columns:repeat(3,max-content);gap:0.75rem;justify-content:center;padding:6rem 2rem"
        >
            ${placements.map(
                (placement) => html`
                    <el-popover placement="${placement}" arrow="true">
                        <el-button slot="anchor" size="small">${placement}</el-button>
                        Placed at <code>${placement}</code>
                    </el-popover>
                `,
            )}
        </div>
    `,
};

export const Arrow = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `arrow` the panel points to its anchor. The `distance` then is the gap between the anchor and the tip of the arrow.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;gap:1rem;justify-content:center;padding:2rem 2rem 7rem">
            <el-popover arrow="true">
                <el-button slot="anchor">With an arrow</el-button>
                The arrow points to the middle of the anchor.
            </el-popover>
            <el-popover arrow="true" distance="0">
                <el-button slot="anchor">At a distance of 0</el-button>
                The tip of the arrow touches the anchor.
            </el-popover>
        </div>
    `,
};

export const NoRoom = {
    name: 'Without room',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A panel that has no room on its side goes to the other one, and one that would leave the viewport is pushed back into it. Nothing clips the panel: it is in the top layer, above the box that scrolls here.',
            },
        },
    },
    render: () => html`
        <div style="height:11rem;overflow:auto;border:1px dashed currentColor;padding:0.75rem">
            <p style="margin:0 0 3rem">Scroll this box with the panel open.</p>
            <el-popover placement="top" arrow="true">
                <el-button slot="anchor">Asked for the top</el-button>
                The panel follows its anchor and changes sides when it has to.
            </el-popover>
            <p style="margin:8rem 0 0">The end of the box.</p>
        </div>
    `,
};

export const Content = {
    name: 'With controls inside',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The content of the panel comes right after the anchor for the keyboard. `Escape` closes the panel and gives the focus back to the anchor.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;justify-content:center;padding:2rem 2rem 9rem">
            <el-popover placement="bottom-start">
                <el-button slot="anchor" caret="true">Account</el-button>
                <div style="display:grid;gap:0.5rem;min-width:10rem">
                    <a href="#profile">Profile</a>
                    <a href="#settings">Settings</a>
                    <el-button size="small" appearance="outlined" variant="danger">Sign out</el-button>
                </div>
            </el-popover>
        </div>
    `,
};

export const NativeAnchor = {
    name: 'With a native button',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display:flex;justify-content:center;padding:2rem 2rem 6rem">
            <el-popover>
                <button slot="anchor" type="button">Help</button>
                Any element can be the anchor. A button is the one a keyboard can reach.
            </el-popover>
        </div>
    `,
};
