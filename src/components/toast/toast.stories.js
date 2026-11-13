import { userEvent, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './toast.readme.md?raw';
import { define, toast } from './toast.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDialog } from '../dialog/dialog.js';
define();
defineButton();
defineDialog();

const placements = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];
const variants = ['default', 'primary', 'success', 'neutral', 'warning', 'danger'];
const region = (canvasElement) => canvasElement.querySelector('el-toast');
const texts = (el) => [...el.children].map((entry) => entry.textContent.trim());
// A story leaves no toast behind for the next one: the ones that are shown, then the ones that
// have waited for their place.
const clear = async (el) => {
    await waitFor(async () => {
        await Promise.all([...el.children].map((entry) => entry.hide()));
        await expect(el.childElementCount).toBe(0);
    });
};
// The close button of a toast, once the toast is rendered.
const closeButton = (entry) =>
    waitFor(() => {
        const button = entry.shadowRoot?.querySelector('[part~="close-button"]');
        if (!button) throw new Error('the toast is not rendered yet');
        return button;
    });
let count = 0;

export default {
    title: 'Components/Toast',
    component: 'el-toast',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
            // A toast is at an edge of the viewport: every story gets a frame of its own.
            story: { inline: false, iframeHeight: 320 },
        },
    },
    args: {
        placement: 'top-end',
        max: 3,
        label: 'Notifications',
    },
    argTypes: {
        placement: { options: placements, control: { type: 'select' } },
        max: { control: { type: 'number', min: 1 } },
    },
};

export const Playground = {
    render: ({ placement, max, label }) => html`
        <el-toast placement="${placement}" max="${max}" label="${label}"></el-toast>
        <el-button
            variant="brand"
            @click="${(event) =>
                event.currentTarget.previousElementSibling.toast(`Message ${++count} is saved.`, {
                    variant: 'success',
                })}"
        >
            Show a toast
        </el-button>
    `,
    play: async ({ canvasElement, step }) => {
        const el = region(canvasElement);
        const button = canvasElement.querySelector('el-button');
        await waitFor(() => expect(el.shadowRoot?.querySelector('[part~="base"]')).toBeTruthy());

        await step('is not shown without a toast', async () => {
            await expect(el.matches(':popover-open')).toBe(false);
        });

        await step('the button shows a toast in the region, which is in the top layer now', async () => {
            await userEvent.click(button);
            await waitFor(() => expect(el.firstElementChild?.open).toBe(true));
            await expect(el.matches(':popover-open')).toBe(true);
            await expect(el.firstElementChild.localName).toBe('el-notification');
            // The role is set once the notification is rendered.
            await waitFor(() => expect(el.firstElementChild).toHaveAttribute('role', 'status'));
        });

        await step('no more than three show at once, the fourth and the fifth wait', async () => {
            for (let i = 0; i < 4; i++) await userEvent.click(button);
            await waitFor(() => expect(el.childElementCount).toBe(3));
        });

        await step('closing one lets the next one in', async () => {
            const first = el.firstElementChild;
            await userEvent.click(await closeButton(first));
            await waitFor(() => expect(first.isConnected).toBe(false));
            await waitFor(() => expect(el.childElementCount).toBe(3));
        });

        await clear(el);
    },
};

export const TheFunction = {
    name: 'The function',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`toast()` from the module of the component needs no element in the page: it uses the first `el-toast` of the document and adds one when there is none.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
            ${variants.map(
                (variant) => html`
                    <el-button
                        @click="${() => toast(`A ${variant} message.`, { variant, duration: variant === 'danger' ? Infinity : 5000 })}"
                    >
                        ${variant}
                    </el-button>
                `,
            )}
        </div>
    `,
    play: async ({ canvasElement, step }) => {
        await step('adds a region to the page and shows the toast there', async () => {
            await userEvent.click(canvasElement.querySelectorAll('el-button')[2]);
            const el = await waitFor(() => {
                const found = document.querySelector('el-toast');
                if (!found?.firstElementChild?.open) throw new Error('no toast yet');
                return found;
            });
            await expect(texts(el)).toEqual(['A success message.']);
            await expect(el.firstElementChild.variant).toBe('success');
            await clear(el);
            el.remove();
        });
    },
};

export const Placements = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Six places: three at the top and three at the bottom of the viewport. The first toast is at the edge, the next ones follow towards the middle.',
            },
        },
    },
    render: () => html`
        <el-toast></el-toast>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
            ${placements.map(
                (placement) => html`
                    <el-button
                        @click="${(event) => {
                            const el = event.currentTarget.closest('div').previousElementSibling;
                            el.placement = placement;
                            el.toast(`At ${placement}.`);
                        }}"
                    >
                        ${placement}
                    </el-button>
                `,
            )}
        </div>
    `,
    play: async ({ canvasElement, step }) => {
        const el = region(canvasElement);
        await waitFor(() => expect(el.shadowRoot?.querySelector('[part~="base"]')).toBeTruthy());

        await step('a toast at the bottom start is in that corner', async () => {
            await userEvent.click(canvasElement.querySelectorAll('el-button')[3]);
            await waitFor(() => expect(el.firstElementChild?.open).toBe(true));
            // The attribute follows the property with the next rendering.
            await waitFor(() => expect(el).toHaveAttribute('placement', 'bottom-start'));
            const box = el.firstElementChild.getBoundingClientRect();
            await expect(Math.round(box.left)).toBe(16);
            await expect(Math.round(window.innerHeight - box.bottom)).toBe(16);
        });

        await clear(el);
    },
};

export const WithMarkup = {
    name: 'With markup, and a notification of your own',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A node is shown as the content of the toast. An `el-notification` is shown as it is: with its own icon, without a close button, for as long as it says.',
            },
        },
    },
    render: () => html`
        <el-toast placement="bottom"></el-toast>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
            <el-button
                @click="${(event) => {
                    const content = document.createElement('span');
                    content.innerHTML = 'Moved to <strong>Archive</strong>.';
                    event.currentTarget.closest('div').previousElementSibling.toast(content);
                }}"
            >
                Markup
            </el-button>
            <el-button
                @click="${(event) => {
                    const note = document.createElement('el-notification');
                    note.variant = 'primary';
                    note.duration = 3000;
                    note.innerHTML = '<span slot="icon" aria-hidden="true">✉</span>You have a new message.';
                    event.currentTarget.closest('div').previousElementSibling.toast(note);
                }}"
            >
                A notification of your own
            </el-button>
        </div>
    `,
};

export const InADialog = {
    name: 'In a dialog',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An open modal dialog makes the rest of the page inert, a region outside of it included. A dialog that shows toasts has a region of its own inside.',
            },
        },
    },
    render: () => html`
        <el-button @click="${(event) => event.currentTarget.nextElementSibling.show()}">Open the dialog</el-button>
        <el-dialog label="Settings">
            <p style="margin:0 0 1rem">The toast of this dialog comes from a region inside of it.</p>
            <el-button
                variant="brand"
                @click="${(event) => event.currentTarget.nextElementSibling.toast('Saved.', { variant: 'success' })}"
            >
                Save
            </el-button>
            <el-toast placement="bottom"></el-toast>
        </el-dialog>
    `,
    play: async ({ canvasElement, step }) => {
        const dialog = canvasElement.querySelector('el-dialog');
        const el = region(canvasElement);

        await step('the toast of a region inside the dialog can be closed while the dialog is open', async () => {
            await userEvent.click(canvasElement.querySelector('el-button'));
            await waitFor(() => expect(dialog.open).toBe(true));
            await userEvent.click(dialog.querySelector('el-button'));
            await waitFor(() => expect(el.firstElementChild?.open).toBe(true));
            const entry = el.firstElementChild;
            await userEvent.click(await closeButton(entry));
            await waitFor(() => expect(entry.isConnected).toBe(false));
            await dialog.hide();
        });
    },
};
