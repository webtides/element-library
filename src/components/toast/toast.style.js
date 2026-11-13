import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /* The element is the box at the edge of the viewport, and a popover while it has toasts. What
       the platform gives a popover (a centred place, a border, a padding, a background, a scroll
       bar) goes. Before the script has run it is a fixed box in the same place. */
    :host {
        --_el-toast-inset: var(--el-toast-inset, var(--el-space-4, 1rem));

        position: fixed;
        inset: auto;
        /* The default, top-end. */
        top: var(--_el-toast-inset);
        inset-inline-end: var(--_el-toast-inset);
        /* Never wider than the viewport between the two distances. */
        max-width: calc(100% - 2 * var(--_el-toast-inset));
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        overflow: visible;
        /* The box lets the pointer through to the page; a notification takes it back. */
        pointer-events: none;
    }

    :host([placement^='bottom']) {
        top: auto;
        bottom: var(--_el-toast-inset);
    }

    :host([placement$='-start']) {
        inset-inline-end: auto;
        inset-inline-start: var(--_el-toast-inset);
    }

    /* In the middle: the box reaches from one side to the other, and the stack puts the toasts
       into its middle. Not with auto margins: a page that resets the margin of every element
       takes them from the host. */
    :host([placement='top']),
    :host([placement='bottom']) {
        inset-inline: var(--_el-toast-inset);
        width: auto;
    }

    /* The first toast is at the edge, the next ones follow towards the middle of the viewport. */
    .stack {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--el-space-2, 0.5rem);
    }

    :host([placement^='bottom']) .stack {
        flex-direction: column-reverse;
    }

    :host([placement$='-start']) .stack {
        align-items: flex-start;
    }

    :host([placement='top']) .stack,
    :host([placement='bottom']) .stack {
        align-items: center;
    }

    /* A toast is no wider than the stack, which is no wider than the viewport. */
    ::slotted(*) {
        max-width: 100%;
    }
`;

export default [hostStyle(), style].join('\n');
