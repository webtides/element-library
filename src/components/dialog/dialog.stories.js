import { userEvent, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './dialog.readme.md?raw';
import { define } from './dialog.js';
define();

export default {
    title: 'Components/Dialog',
    component: 'el-dialog',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Dialog title',
    },
};

export const Dialog = {
    parameters: {
        docs: {
            description: {
                story: 'A modal dialog with a header, scrollable body and footer actions. Built on the native `<dialog>` element, so focus is trapped, the background is `inert`, and focus returns to the trigger on close. Closes on the close button, `Escape`, or an overlay click.',
            },
        },
    },
    render: ({ label }) => html`
        <button type="button" onclick="this.nextElementSibling.show()">Open dialog</button>
        <el-dialog label="${label}">
            <p>This is a native, accessible modal dialog. Try tabbing — focus stays inside.</p>
            <p>Press <kbd>Escape</kbd>, click the close button, or click outside to dismiss it.</p>
            <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">Cancel</button>
            <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">OK</button>
        </el-dialog>
    `,
    play: async ({ canvasElement, step }) => {
        const dialog = canvasElement.querySelector('el-dialog');
        const trigger = canvasElement.querySelector('button');

        await step('opens when the trigger is clicked', async () => {
            await userEvent.click(trigger);
            await waitFor(() => expect(dialog.open).toBe(true));
        });

        await step('closes via the built-in close button', async () => {
            // Synthetic key events don't trigger the UA's native dialog cancel, so drive the
            // close button (which routes through the same request-close flow as Escape).
            const closeButton = dialog.shadowRoot.querySelector('[data-dialog-close]');
            await userEvent.click(closeButton);
            await waitFor(() => expect(dialog.open).toBe(false));
        });
    },
};

export const NoHeader = {
    name: 'No header',
    parameters: {
        docs: {
            description: {
                story: 'With `no-header`, the title and built-in close button are removed — you supply your own dismissal. The `label` still provides the accessible name.',
            },
        },
    },
    render: ({ label }) => html`
        <button type="button" onclick="this.nextElementSibling.show()">Open dialog</button>
        <el-dialog label="${label}" no-header="true">
            <p>This dialog has no header. Provide your own way to close it.</p>
            <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">Done</button>
        </el-dialog>
    `,
};

export const Scrolling = {
    name: 'Scrolling body',
    parameters: {
        docs: {
            description: {
                story: 'When the content exceeds the dialog height, the body scrolls while the header and footer stay put.',
            },
        },
    },
    render: ({ label }) => html`
        <button type="button" onclick="this.nextElementSibling.show()">Open dialog</button>
        <el-dialog label="${label}">
            ${Array.from(
                { length: 30 },
                (_, i) => html`<p>Paragraph ${i + 1} — scroll to see the footer stay pinned.</p>`,
            )}
            <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">Close</button>
        </el-dialog>
    `,
};

export const PreventClose = {
    name: 'Prevent close',
    parameters: {
        docs: {
            description: {
                story: 'A `dialog-request-close` listener can call `preventDefault()` to keep the dialog open — here, overlay clicks and `Escape` are blocked, so only the explicit footer button closes it.',
            },
        },
    },
    render: ({ label }) => html`
        <button type="button" onclick="this.nextElementSibling.show()">Open dialog</button>
        <el-dialog label="${label}">
            <p>Escape and overlay clicks are blocked. Use the button below to close.</p>
            <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">I understand</button>
        </el-dialog>
    `,
    play: async ({ canvasElement, step }) => {
        const dialog = canvasElement.querySelector('el-dialog');
        const trigger = canvasElement.querySelector('button');
        dialog.addEventListener('dialog-request-close', (event) => {
            if (event.detail.source !== 'close-button') event.preventDefault();
        });

        await step('opens when the trigger is clicked', async () => {
            await userEvent.click(trigger);
            await waitFor(() => expect(dialog.open).toBe(true));
        });

        await step('stays open when a keyboard close is requested', async () => {
            // Same flow the UA's Escape-driven cancel takes; the listener prevents it, so it stays open.
            dialog.requestClose('keyboard');
            await expect(dialog.open).toBe(true);
        });

        await step('closes via the explicit footer button', async () => {
            const footerButton = dialog.querySelector('[slot="footer"]');
            await userEvent.click(footerButton);
            await waitFor(() => expect(dialog.open).toBe(false));
        });
    },
};
