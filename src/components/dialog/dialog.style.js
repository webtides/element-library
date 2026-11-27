import modalStyle from '../../styles/modal.style.js';

const css = String.raw;

/*
 * What is the dialog's own: a box in the middle of the viewport, which fades in and rises a little.
 * The paint of the surface, the backdrop and the parts are in the modal module.
 *
 * The middle is the one of what the user can see and reach. On a phone the system takes room at
 * the edges of the screen, the notch and the home indicator, where the page reaches under them
 * (viewport-fit=cover): the box keeps out of that room. Elsewhere the room is nothing.
 */
const style = css`
    dialog {
        --_el-dialog-top: env(safe-area-inset-top, 0px);
        --_el-dialog-right: env(safe-area-inset-right, 0px);
        --_el-dialog-bottom: env(safe-area-inset-bottom, 0px);
        --_el-dialog-left: env(safe-area-inset-left, 0px);

        /* The browser centres a modal dialog between the four edges of the viewport. */
        inset: var(--_el-dialog-top) var(--_el-dialog-right) var(--_el-dialog-bottom) var(--_el-dialog-left);
        margin: auto;
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);

        width: var(--el-dialog-width, 31rem);
        max-width: calc(100vw - 2 * var(--el-space-4, 1rem) - var(--_el-dialog-left) - var(--_el-dialog-right));
        /* Never higher than what the browser shows. 100vh is the height with the address bar of a
           phone taken in: while the bar is there, the footer of a long dialog would be below the
           edge. A browser that does not know the dynamic unit keeps the line before it. */
        max-height: calc(100vh - 2 * var(--el-space-4, 1rem) - var(--_el-dialog-top) - var(--_el-dialog-bottom));
        max-height: calc(100dvh - 2 * var(--el-space-4, 1rem) - var(--_el-dialog-top) - var(--_el-dialog-bottom));

        opacity: 0;
        transform: translateY(var(--el-dialog-enter-offset, 0.5rem));
    }
`;

export default [modalStyle(), style].join('\n');
