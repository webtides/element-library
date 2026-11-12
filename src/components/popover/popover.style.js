import hostStyle from '../../styles/host.style.js';

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
    }

    /* ── Arrow ────────────────────────────────────────────────────────────── */

    /* A square with the surface and the border of the panel, turned by 45 degrees, with its middle
       on the outer edge of the panel. The script sets its place along that edge. */
    .arrow {
        --_el-popover-arrow-size: 0.75rem;
        --_el-popover-arrow-offset: calc(var(--_el-popover-arrow-size) / -2 - var(--el-border-width, 1px));
        position: absolute;
        width: var(--_el-popover-arrow-size);
        height: var(--_el-popover-arrow-size);
        background: inherit;
        border: inherit;
        transform: rotate(45deg);
    }

    /* The edge that faces the anchor, by the side the panel ended up at. The two sides of the
       square that lie inside the panel lose their border. */
    [data-placement^='bottom'] .arrow {
        top: var(--_el-popover-arrow-offset);
        border-right-color: transparent;
        border-bottom-color: transparent;
    }

    [data-placement^='top'] .arrow {
        bottom: var(--_el-popover-arrow-offset);
        border-top-color: transparent;
        border-left-color: transparent;
    }

    [data-placement^='right'] .arrow {
        left: var(--_el-popover-arrow-offset);
        border-top-color: transparent;
        border-right-color: transparent;
    }

    [data-placement^='left'] .arrow {
        right: var(--_el-popover-arrow-offset);
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
`;

export default [hostStyle(), style].join('\n');
