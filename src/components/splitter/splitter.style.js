import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /*
     * The element is as wide as its line and as high as the row it is in. What takes the pointer
     * is wider and lies over the panes at both sides.
     */
    :host {
        display: block;
        position: relative;
        z-index: 1;
        flex: none;
        align-self: stretch;
        /* Where the user forces colours, the line is there without a theme as well. */
        --_el-splitter-line-width: var(--el-splitter-line-width, var(--el-border-width, 0px));
        /* The width of what takes the pointer. */
        --_el-splitter-target: var(--el-space-2, 0.5rem);

        inline-size: var(--_el-splitter-line-width);
    }

    @media (forced-colors: active) {
        :host {
            --_el-splitter-line-width: max(var(--el-splitter-line-width, var(--el-border-width, 0px)), 1px);
        }
    }

    /* On a touch screen the edge takes a finger: at least the touch target. Without the token it
       stays as it is. */
    @media (any-pointer: coarse) {
        :host {
            --_el-splitter-target: max(var(--el-space-2, 0.5rem), var(--el-touch-target, 0px));
        }
    }

    /*
     * The separator, with the line in its middle. A drag that starts here selects no text, and a
     * finger that moves it does not scroll the page.
     */
    .splitter {
        position: absolute;
        inset-block: 0;
        inset-inline-start: calc((var(--_el-splitter-line-width) - var(--_el-splitter-target)) / 2);
        display: flex;
        justify-content: center;
        inline-size: var(--_el-splitter-target);
        cursor: col-resize;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
    }

    /*
     * While the edge is dragged, the separator covers the viewport. The pointer is over nothing
     * else then: not over a page in the page (an iframe), which would take a pen away from the
     * edge, and not over a control with a cursor of its own.
     */
    :host(:state(dragging)) .splitter::after {
        content: '';
        position: fixed;
        inset: 0;
    }

    /* The line is a border: it stays where the user forces colours. */
    .line {
        border-inline-start: var(--_el-splitter-line-width) solid var(--el-color-border, transparent);
        transition:
            border-color var(--el-duration-md, 0s) var(--el-ease, linear),
            border-width var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    /* Under the pointer, while it is dragged and with the focus of the keyboard the line is a mark:
       wider, and in the accent colour. Without a theme it has the colour of the text. */
    @media (hover: hover) {
        .splitter:hover .line {
            border-inline-start-width: max(var(--_el-splitter-line-width), 0.1875rem);
            border-inline-start-color: var(--el-color-accent, currentColor);
        }
    }

    :host(:state(dragging)) .line,
    .splitter:focus-visible .line {
        border-inline-start-width: max(var(--_el-splitter-line-width), 0.1875rem);
        border-inline-start-color: var(--el-color-accent, currentColor);
    }

    /* The ring is around what takes the pointer: a narrow bar as high as the edge. */
    .splitter:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    .splitter:focus:not(:focus-visible) {
        outline: none;
    }
`;

export default [hostStyle(), style].join('\n');
