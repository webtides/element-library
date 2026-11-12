import { expect, userEvent, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './drawer.readme.md?raw';
import { define } from './drawer.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

const placements = ['start', 'end', 'top', 'bottom'];

export default {
    title: 'Components/Drawer',
    component: 'el-drawer',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Filters',
        placement: 'end',
        noHeader: false,
        closeLabel: 'Close',
    },
    argTypes: {
        placement: { options: placements, control: { type: 'select' } },
    },
};

/**
 * The close button is inside the shadow root, which only exists after the first render. `open` is
 * true before that, so on a busy machine a step can get here while it is still missing.
 */
const closeButtonOf = (drawer) =>
    waitFor(() => {
        const button = drawer.shadowRoot?.querySelector('[part~="close-button"]');
        expect(button).toBeTruthy();
        return button;
    });

export const Playground = {
    render: ({ label, placement, noHeader, closeLabel }) => html`
        <el-button variant="brand" onclick="this.nextElementSibling.show()">Open the drawer</el-button>
        <el-drawer
            label="${label}"
            placement="${placement}"
            no-header="${noHeader ? 'true' : 'false'}"
            close-label="${closeLabel}"
        >
            <p>A drawer lies over the page along one edge of the viewport. Try the tab key: the focus stays inside.</p>
            <p>Press <kbd>Escape</kbd>, use the close button or click beside the drawer to close it.</p>
            <el-button slot="footer" onclick="this.closest('el-drawer').hide()">Cancel</el-button>
            <el-button slot="footer" variant="brand" onclick="this.closest('el-drawer').hide()">Apply</el-button>
        </el-drawer>
    `,
    play: async ({ canvasElement, step }) => {
        const drawer = canvasElement.querySelector('el-drawer');
        const opener = canvasElement.querySelector('el-button');

        await step('opens when the button is clicked', async () => {
            await userEvent.click(opener);
            await waitFor(() => expect(drawer.open).toBe(true));
            await waitFor(() => expect(drawer.shadowRoot.querySelector('dialog').matches(':modal')).toBe(true));
        });

        await step('closes with its close button', async () => {
            // Escape is not tried here: the keys of this test are simulated, and the browser closes
            // a dialog for the real key only. The feature tests press the real key.
            await userEvent.click(await closeButtonOf(drawer));
            await waitFor(() => expect(drawer.open).toBe(false));
            await waitFor(() => expect(drawer.shadowRoot.querySelector('dialog').open).toBe(false));
        });
    },
};

export const Placements = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The edge of the viewport the drawer comes from. `start` and `end` are the two ends of a line of text, so they swap in a right-to-left page. A drawer at the start or the end goes from the top to the bottom; one at the top or the bottom goes across and is as high as its content.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
            ${placements.map(
                (placement) => html`
                    <div>
                        <el-button onclick="this.nextElementSibling.show()">${placement}</el-button>
                        <el-drawer label="Placed at the ${placement}" placement="${placement}">
                            <p>This drawer comes from the ${placement}.</p>
                        </el-drawer>
                    </div>
                `,
            )}
        </div>
    `,
};

export const Navigation = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A navigation at the start. The links are the content of the drawer, in a `<nav>` of the page.',
            },
        },
    },
    render: () => html`
        <el-button aria-label="Menu" onclick="this.nextElementSibling.show()">
            <span aria-hidden="true">☰</span>
        </el-button>
        <el-drawer label="Menu" placement="start" style="--el-drawer-size: 18rem">
            <nav aria-label="Main">
                <ul style="list-style:none;margin:0;padding:0;display:grid;gap:0.25rem">
                    ${['Dashboard', 'Projects', 'Team', 'Reports', 'Settings'].map(
                        (name, index) => html`
                            <li>
                                <a
                                    href="#"
                                    aria-current="${index === 0 ? 'page' : 'false'}"
                                    style="display:block;padding:0.5rem 0;color:inherit;font-weight:${
                                        index === 0 ? '600' : '400'
                                    }"
                                    onclick="event.preventDefault(); this.closest('el-drawer').hide()"
                                >
                                    ${name}
                                </a>
                            </li>
                        `,
                    )}
                </ul>
            </nav>
        </el-drawer>
    `,
};

export const Size = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`--el-drawer-size` is the width of a drawer at the start or the end (`25rem` without it) and the height of one at the top or the bottom (the height of its content without it). The drawer is never larger than the viewport.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
            <div>
                <el-button onclick="this.nextElementSibling.show()">Narrow, at the end</el-button>
                <el-drawer label="16rem wide" style="--el-drawer-size: 16rem">
                    <p>This drawer is 16rem wide.</p>
                </el-drawer>
            </div>
            <div>
                <el-button onclick="this.nextElementSibling.show()">Half of the width</el-button>
                <el-drawer label="Half of the viewport" style="--el-drawer-size: 50vw">
                    <p>This drawer takes half of the width of the viewport.</p>
                </el-drawer>
            </div>
            <div>
                <el-button onclick="this.nextElementSibling.show()">Half of the height, at the bottom</el-button>
                <el-drawer label="Half of the viewport" placement="bottom" style="--el-drawer-size: 50vh">
                    <p>This drawer takes half of the height of the viewport.</p>
                </el-drawer>
            </div>
        </div>
    `,
};

export const Scrolling = {
    name: 'Scrolling body',
    parameters: {
        docs: {
            description: {
                story: 'When the content is longer than the drawer, the body scrolls. The header and the footer stay where they are.',
            },
        },
    },
    render: ({ label, placement }) => html`
        <el-button onclick="this.nextElementSibling.show()">Open the drawer</el-button>
        <el-drawer label="${label}" placement="${placement}">
            ${Array.from({ length: 40 }, (_, i) => html`<p>Paragraph ${i + 1}</p>`)}
            <el-button slot="footer" variant="brand" onclick="this.closest('el-drawer').hide()">Close</el-button>
        </el-drawer>
    `,
};

export const HeaderActions = {
    name: 'Header actions',
    parameters: {
        docs: {
            description: {
                story: 'Controls in the `header-actions` slot stand in the header, before the close button. The `label` slot takes markup for the title.',
            },
        },
    },
    render: ({ placement }) => html`
        <el-button onclick="this.nextElementSibling.show()">Open the drawer</el-button>
        <el-drawer placement="${placement}">
            <span slot="label">Order <code>#4711</code></span>
            <el-button slot="header-actions" size="small" appearance="plain">Edit</el-button>
            <p>Three items, paid, sent on Tuesday.</p>
        </el-drawer>
    `,
};

export const NoHeader = {
    name: 'No header',
    parameters: {
        docs: {
            description: {
                story: 'With `no-header` the title and the close button are left out. The `label` still names the drawer for a screen reader, and the content has to bring a way to close it.',
            },
        },
    },
    render: ({ label, placement }) => html`
        <el-button onclick="this.nextElementSibling.show()">Open the drawer</el-button>
        <el-drawer label="${label}" placement="${placement}" no-header="true">
            <p>This drawer has no header.</p>
            <el-button slot="footer" variant="brand" onclick="this.closest('el-drawer').hide()">Done</el-button>
        </el-drawer>
    `,
};

export const PreventClose = {
    name: 'Prevent close',
    parameters: {
        docs: {
            description: {
                story: 'A listener of `drawer-request-close` can call `preventDefault()` to keep the drawer open. Here `Escape` and a click on the backdrop are refused, so only the buttons close it.',
            },
        },
    },
    render: ({ label, placement }) => html`
        <el-button onclick="this.nextElementSibling.show()">Open the drawer</el-button>
        <el-drawer label="${label}" placement="${placement}">
            <p>Escape and a click beside the drawer do not close it. Use one of the buttons.</p>
            <el-button slot="footer" variant="brand" onclick="this.closest('el-drawer').hide()">I understand</el-button>
        </el-drawer>
    `,
    play: async ({ canvasElement, step }) => {
        const drawer = canvasElement.querySelector('el-drawer');
        const opener = canvasElement.querySelector('el-button');
        drawer.addEventListener('drawer-request-close', (event) => {
            if (event.detail.source !== 'close-button') event.preventDefault();
        });

        await step('opens when the button is clicked', async () => {
            await userEvent.click(opener);
            await waitFor(() => expect(drawer.open).toBe(true));
        });

        await step('stays open when the keyboard asks for a close', async () => {
            // The way the Escape key takes; the listener refuses it.
            drawer.requestClose('keyboard');
            await expect(drawer.open).toBe(true);
        });

        await step('closes with the button in the footer', async () => {
            await userEvent.click(drawer.querySelector('[slot="footer"]'));
            await waitFor(() => expect(drawer.open).toBe(false));
        });
    },
};

export const RightToLeft = {
    name: 'Right to left',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'In a right-to-left page the start is on the right and the end on the left, and the drawer slides in from there.',
            },
        },
    },
    render: () => html`
        <div dir="rtl" style="display:flex;flex-wrap:wrap;gap:0.75rem">
            ${['start', 'end'].map(
                (placement) => html`
                    <div>
                        <el-button onclick="this.nextElementSibling.show()">${placement}</el-button>
                        <el-drawer label="الإعدادات" placement="${placement}" close-label="إغلاق">
                            <p>مرحبا بالعالم</p>
                        </el-drawer>
                    </div>
                `,
            )}
        </div>
    `,
};
