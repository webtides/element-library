import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './notification.readme.md?raw';
import { define } from './notification.js';
define();

const variants = ['default', 'primary', 'success', 'neutral', 'warning', 'danger'];

export default {
    title: 'Components/Notification',
    component: 'el-notification',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        variant: 'primary',
        closable: true,
        message: 'Your changes have been saved.',
    },
    argTypes: {
        variant: { options: variants, control: { type: 'select' } },
    },
};

export const Notification = {
    parameters: {
        docs: {
            description: {
                story: 'An inline notification with a leading icon, a message and an optional close button. Shown inline here; call `toast()` to float it in the top-right corner instead.',
            },
        },
    },
    render: ({ variant, closable, message }) => html`
        <el-notification open="true" variant="${variant}" closable="${closable ? 'true' : 'false'}">
            ${message}
        </el-notification>
    `,
    play: async ({ canvasElement, step }) => {
        const note = canvasElement.querySelector('el-notification');

        await step('is exposed as a polite live region for non-urgent variants', async () => {
            // role/aria-live are set in connected() (deferred by element-js), so wait for them.
            await waitFor(() => expect(note).toHaveAttribute('role', 'status'));
            await expect(note).toHaveAttribute('aria-live', 'polite');
            await waitFor(() => expect(note.matches(':state(open)')).toBe(true));
        });

        await step('the close button hides it', async () => {
            const closeButton = note.shadowRoot.querySelector('[data-close]');
            await userEvent.click(closeButton);
            await waitFor(() => expect(note.open).toBe(false));
        });
    },
};

export const Variants = {
    parameters: {
        docs: {
            description: {
                story: 'Each variant carries its own accent color and default icon. `danger` and `warning` are announced assertively.',
            },
        },
    },
    render: () => html`
        <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:28rem">
            ${variants.map(
                (variant) => html`
                    <el-notification open="true" variant="${variant}" closable="true">
                        This is a <strong>${variant}</strong> notification.
                    </el-notification>
                `,
            )}
        </div>
    `,
};

export const Toast = {
    parameters: {
        docs: {
            description: {
                story: 'Calling `toast()` moves the notification into a shared, top-right stack and shows it. Here the button toasts a fresh notification that auto-dismisses after 3 seconds (the countdown pauses on hover).',
            },
        },
    },
    render: () => html`
        <button type="button" onclick="this.nextElementSibling.cloneNode(true).toast()">Show toast</button>
        <el-notification variant="success" closable="true" duration="3000"> Saved to your library. </el-notification>
    `,
    play: async ({ canvasElement, step }) => {
        const trigger = canvasElement.querySelector('button');

        await step('clicking the trigger floats a toast in the top-right stack', async () => {
            await userEvent.click(trigger);
            const toast = await waitFor(() => {
                const node = document.querySelector('.el-toast-stack el-notification');
                // role is set in the deferred connected() hook, so wait for it too.
                if (!node || !node.open || node.getAttribute('role') !== 'status') {
                    throw new Error('toast not ready yet');
                }
                return node;
            });
            await expect(toast).toHaveAttribute('role', 'status');
            // Clean up so repeated runs don't accumulate toasts.
            await toast.hide();
        });
    },
};
