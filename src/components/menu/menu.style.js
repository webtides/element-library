import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
    }

    [part~='panel'] {
        /* The platform centres a popover in the viewport and gives it a look of its own. The panel
           is placed at the button instead: the script sets left and top, in the coordinates of the
           viewport. Whether it is shown stays with the platform, so there is no display here. */
        position: fixed;
        inset: auto;
        top: 0;
        left: 0;
        margin: 0;
        box-sizing: border-box;
        inline-size: max-content;
        min-inline-size: var(--el-menu-min-width, 10rem);
        max-inline-size: min(var(--el-menu-max-width, 20rem), calc(100vw - 1rem));
        /* A long menu scrolls in what the browser shows, and is never higher. */
        max-block-size: calc(100vh - 1rem);
        max-block-size: calc(100dvh - 1rem);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--el-space-1, 0.25rem);
        /* System colours as the headless fallback: a floating surface has to be readable over the
           page, so transparent is no option here. */
        background: var(--el-color-bg, Canvas);
        color: var(--el-color-fg, CanvasText);
        border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
        border-radius: var(--el-radius-lg, 0);
        box-shadow: var(--el-shadow-lg, none);
        /* The text of the page around the button is not the text of a menu: a menu in a heading
           is no heading. */
        font-size: var(--el-font-size-sm, 0.875rem);
        font-weight: var(--el-font-weight-normal, 400);
        line-height: 1.25;
        text-align: start;
        /* A menu can stand in a row of joined buttons (el-button-group), which joins its button
           with properties that inherit. What is in the panel is not part of that row. */
        --_el-group-radius-start: initial;
        --_el-group-radius-end: initial;
        --_el-group-divider: initial;
        --_el-group-overlap: initial;
    }

    /* A line between two entries, which the page puts there. The menu names the room above and
       below it, in a property that inherits, and the line takes that room in its own shadow root.
       A margin of the slotted element would be gone on a page that takes the margin off every
       element: a rule of the page wins over a ::slotted rule. */
    ::slotted(el-divider) {
        --_el-context-divider-space: var(--el-space-1, 0.25rem);
    }
`;

export default [hostStyle(), style].join('\n');
