import hostStyle from '../../styles/host.style.js';
import arrowStyle from '../../styles/arrow.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
    }

    [part~='panel'] {
        /* The platform centres a popover in the viewport and gives it a look of its own. The panel
           is placed at the anchor instead: the script sets left and top, in the coordinates of the
           viewport. Whether it is shown stays with the platform, so there is no display here. */
        position: fixed;
        inset: auto;
        top: 0;
        left: 0;
        margin: 0;
        width: max-content;
        max-width: min(20rem, calc(100vw - 1rem));
        /* The arrow sticks out. */
        overflow: visible;
        padding: var(--el-space-3, 0.75rem);
        /* System colours as the headless fallback: a floating surface has to be readable over the
           page, so transparent is no option here. */
        background: var(--el-color-bg, Canvas);
        color: var(--el-color-fg, CanvasText);
        border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
        border-radius: var(--el-radius-lg, 0);
        box-shadow: var(--el-shadow-lg, none);
        /* A popover can stand in a row of joined buttons (el-button-group), which joins its
           anchor with properties that inherit. What is in the panel is not part of that row:
           they stop here. */
        --_el-group-radius-start: initial;
        --_el-group-radius-end: initial;
        --_el-group-divider: initial;
    }
`;

export default [hostStyle(), style, arrowStyle("[part~='panel']")].join('\n');
