import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /* The element is the box at the edge of the viewport, and a popover while it has toasts. What
       the platform gives a popover (a centred place, a border, a padding, a background, a scroll
       bar) goes. Before the script has run it is a fixed box in the same place. */
    :host {
        --_el-toast-inset: var(--el-toast-inset, var(--el-space-4, 1rem));
        /*
         * The distance from an edge of the viewport is on top of the room the system takes there
         * on a phone: the notch, the rounded corners, the home indicator. Nothing where the page
         * does not reach under them (no viewport-fit=cover), and on a desktop.
         */
        --_el-toast-top: calc(var(--_el-toast-inset) + env(safe-area-inset-top, 0px));
        --_el-toast-bottom: calc(var(--_el-toast-inset) + env(safe-area-inset-bottom, 0px));
        --_el-toast-start: calc(var(--_el-toast-inset) + env(safe-area-inset-left, 0px));
        --_el-toast-end: calc(var(--_el-toast-inset) + env(safe-area-inset-right, 0px));

        position: fixed;
        inset: auto;
        /* The default, top-end. */
        top: var(--_el-toast-top);
        inset-inline-end: var(--_el-toast-end);
        /* Never wider than the viewport between the two distances. */
        max-width: calc(100% - var(--_el-toast-start) - var(--_el-toast-end));
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        overflow: visible;
        /* The box lets the pointer through to the page; a notification takes it back. */
        pointer-events: none;
    }

    /* Asked of the host: the sides of the screen are left and right, start and end follow the
       direction of the text. */
    :host(:dir(rtl)) {
        --_el-toast-start: calc(var(--_el-toast-inset) + env(safe-area-inset-right, 0px));
        --_el-toast-end: calc(var(--_el-toast-inset) + env(safe-area-inset-left, 0px));
    }

    :host([placement^='bottom']) {
        top: auto;
        bottom: var(--_el-toast-bottom);
    }

    :host([placement$='-start']) {
        inset-inline-end: auto;
        inset-inline-start: var(--_el-toast-start);
    }

    /* In the middle: the box reaches from one side to the other, and the stack puts the toasts
       into its middle. Not with auto margins: a page that resets the margin of every element
       takes them from the host. */
    :host([placement='top']),
    :host([placement='bottom']) {
        inset-inline: var(--_el-toast-start) var(--_el-toast-end);
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
