import { expect, userEvent, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './tooltip.readme.md?raw';
import { define } from './tooltip.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

const sides = ['top', 'bottom', 'left', 'right'];
const placements = sides.flatMap((side) => [side, `${side}-start`, `${side}-end`]);

export default {
    title: 'Components/Tooltip',
    component: 'el-tooltip',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        placement: 'top',
        distance: 8,
        showDelay: 150,
        hideDelay: 0,
        arrow: false,
        disabled: false,
    },
    argTypes: {
        placement: { options: placements, control: { type: 'select' } },
        distance: { control: { type: 'number', min: 0, max: 40 } },
        showDelay: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
        hideDelay: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
    },
};

export const Playground = {
    render: ({ placement, distance, showDelay, hideDelay, arrow, disabled }) => html`
        <div style="display:flex;justify-content:center;padding:5rem 2rem">
            <el-button id="tooltip-playground-anchor" variant="brand">Save</el-button>
            <el-tooltip
                for="tooltip-playground-anchor"
                placement="${placement}"
                distance="${distance}"
                show-delay="${showDelay}"
                hide-delay="${hideDelay}"
                arrow="${arrow ? 'true' : 'false'}"
                disabled="${disabled ? 'true' : 'false'}"
            >
                Saves the document
            </el-tooltip>
        </div>
    `,
    play: async ({ canvasElement }) => {
        const tooltip = canvasElement.querySelector('el-tooltip');
        const anchor = canvasElement.querySelector('el-button');
        // The tooltip binds itself to its anchor with its first render, a frame after it is connected.
        await waitFor(() => expect(anchor.getAttribute('aria-describedby')).toBe(tooltip.id));
        expect(tooltip.matches(':popover-open')).toBe(false);

        await userEvent.hover(anchor);
        await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true));
        expect(tooltip.open).toBe(true);

        // Escape is not tried here: the keys of this test are simulated. The feature tests press the
        // real key.
        await userEvent.unhover(anchor);
        await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(false));
        expect(tooltip.open).toBe(false);
    },
};

export const Placements = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The side of the anchor, and with `-start` or `-end` the edge of the anchor the tooltip is aligned with.',
            },
        },
    },
    render: () => html`
        <div
            style="display:grid;grid-template-columns:repeat(3,max-content);gap:0.75rem;justify-content:center;padding:4rem 2rem"
        >
            ${placements.map(
                (placement) => html`
                    <div>
                        <el-button id="tooltip-placement-${placement}" size="small">${placement}</el-button>
                        <el-tooltip for="tooltip-placement-${placement}" placement="${placement}" arrow="true">
                            Placed at ${placement}
                        </el-tooltip>
                    </div>
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
                story: 'With `arrow` the tooltip points to its anchor. The `distance` then is the gap between the anchor and the tip of the arrow.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;gap:1rem;justify-content:center;padding:4rem 2rem 2rem">
            <el-button id="tooltip-arrow-default">With an arrow</el-button>
            <el-tooltip for="tooltip-arrow-default" arrow="true"
                >The arrow points to the middle of the anchor</el-tooltip
            >

            <el-button id="tooltip-arrow-zero">At a distance of 0</el-button>
            <el-tooltip for="tooltip-arrow-zero" arrow="true" distance="0">
                The tip of the arrow touches the anchor
            </el-tooltip>
        </div>
    `,
};

export const IconButtons = {
    name: 'On icon buttons',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A button that shows only an icon needs a name of its own (`aria-label`). The tooltip is not that name: it is the description, which a screen reader reads after it. Move along the buttons with Tab: the tooltip of the one with the focus opens at once.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;gap:0.5rem;justify-content:center;padding:4rem 2rem 2rem">
            <el-button id="tooltip-icon-bold" circle="true" aria-label="Bold"><strong>B</strong></el-button>
            <el-tooltip for="tooltip-icon-bold">Makes the selection bold</el-tooltip>

            <el-button id="tooltip-icon-italic" circle="true" aria-label="Italic"><em>I</em></el-button>
            <el-tooltip for="tooltip-icon-italic">Sets the selection in italics</el-tooltip>

            <el-button id="tooltip-icon-underline" circle="true" aria-label="Underline"><u>U</u></el-button>
            <el-tooltip for="tooltip-icon-underline">Underlines the selection</el-tooltip>
        </div>
    `,
};

export const LongText = {
    name: 'With a long text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A tooltip is as wide as its text, up to `20rem`, and wraps after that. The pointer can go from the anchor onto the text, to select it for example: the tooltip stays.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;justify-content:center;padding:6rem 2rem 2rem">
            <el-button id="tooltip-long-anchor">Archive</el-button>
            <el-tooltip for="tooltip-long-anchor" arrow="true">
                Moves the project to the archive. Its files stay where they are, and you can bring it back at any time
                from the list of archived projects.
            </el-tooltip>
        </div>
    `,
};

export const NativeAnchors = {
    name: 'On native elements',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The anchor is any element with an id. One that can take the focus is what a keyboard reaches: a button, a link, a field.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;gap:1.5rem;align-items:center;justify-content:center;padding:4rem 2rem 2rem">
            <button id="tooltip-native-button" type="button">A native button</button>
            <el-tooltip for="tooltip-native-button">Does nothing, in this story</el-tooltip>

            <a id="tooltip-native-link" href="#tooltip">A link</a>
            <el-tooltip for="tooltip-native-link" placement="bottom">Stays on this page</el-tooltip>

            <input id="tooltip-native-input" type="text" aria-label="Invoice number" placeholder="Invoice number" />
            <el-tooltip for="tooltip-native-input" placement="right"
                >Six digits, on the top right of the invoice</el-tooltip
            >
        </div>
    `,
};

export const FromAScript = {
    name: 'From a script',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'With `disabled` the pointer and the focus neither open nor close the tooltip, and it is left to a script: `show()`, `hide()` or the `open` property. `Escape` still closes it.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;gap:1rem;justify-content:center;padding:4rem 2rem 2rem">
            <el-button id="tooltip-script-anchor" variant="brand">Publish</el-button>
            <el-tooltip id="tooltip-script" for="tooltip-script-anchor" disabled="true" arrow="true">
                Nothing is published yet
            </el-tooltip>

            <el-button size="small" @click="${() => document.getElementById('tooltip-script').show()}"
                >show()</el-button
            >
            <el-button size="small" @click="${() => document.getElementById('tooltip-script').hide()}"
                >hide()</el-button
            >
        </div>
    `,
};
