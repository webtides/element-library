import modalStyle from '../../styles/modal.style.js';

const css = String.raw;

/*
 * What is the dialog's own: a box in the middle of the viewport, which fades in and rises a little.
 * The paint of the surface, the backdrop and the parts are in the modal module.
 */
const style = css`
    dialog {
        margin: auto;
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);

        width: var(--el-dialog-width, 31rem);
        max-width: calc(100vw - 2 * var(--el-space-4, 1rem));
        max-height: calc(100vh - 2 * var(--el-space-4, 1rem));

        opacity: 0;
        transform: translateY(var(--el-dialog-enter-offset, 0.5rem));
    }
`;

export default [modalStyle(), style].join('\n');
