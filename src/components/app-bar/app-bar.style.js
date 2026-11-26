import hostStyle from '../../styles/host.style.js';
import { appearanceContextStyle } from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
        /* A line to the content, which the region of a frame draws itself where the bar is in one.
           Where the user forces colours it is there without a theme as well. */
        --_el-app-bar-line-width: var(--el-border-width, 0px);
    }

    @media (forced-colors: active) {
        :host {
            --_el-app-bar-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /*
     * The surface. In a region of an el-app-frame it reaches as far as the surface of the region:
     * under the status bar of a phone and to the sides of the screen. The region says how far, and
     * that room is padding here, so the content of the bar stays clear of it. Outside of a frame
     * the room is nothing.
     *
     * The margins are on the bar and not on the element: a reset of the page (margin: 0 for
     * everything) wins over a rule for the host, and the bar would have the room twice.
     */
    .bar {
        margin-block: calc(-1 * var(--_el-context-inset-block-start, 0px))
            calc(-1 * var(--_el-context-inset-block-end, 0px));
        margin-inline: calc(-1 * var(--_el-context-inset-inline-start, 0px))
            calc(-1 * var(--_el-context-inset-inline-end, 0px));
        padding-block: var(--_el-context-inset-block-start, 0px) var(--_el-context-inset-block-end, 0px);
        padding-inline: var(--_el-context-inset-inline-start, 0px) var(--_el-context-inset-inline-end, 0px);
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border-block-end: var(--_el-context-line-block-end, var(--_el-app-bar-line-width)) solid
            var(--el-color-border, transparent);
    }

    /* One row, as high as a control and its padding: a bar with a button and a bar without one
       are the same height. */
    .row {
        display: flex;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        min-block-size: calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem));
        padding: var(--el-space-2, 0.5rem) var(--el-space-3, 0.75rem);
    }

    /* On a touch screen the bar is at least as high as a finger needs. Without the token it stays
       as it is. */
    @media (any-pointer: coarse) {
        .row {
            min-block-size: max(
                calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem)),
                var(--el-touch-target, 0px)
            );
        }
    }

    .start,
    .end {
        display: flex;
        flex: none;
        align-items: center;
        gap: var(--el-space-1, 0.25rem);
    }

    /* The title takes the room that is left, and gives it up before the actions do: what does not
       fit is cut with an ellipsis. The whole text stays in the page, for assistive technology. */
    .title {
        flex: 1 1 auto;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--el-font-size-lg, 1.125rem);
        font-weight: var(--el-font-weight-semibold, 600);
        line-height: 1.2;
    }

    /* Without something in front of it, the title starts a little further in: where the text of
       the content below it starts as a rule. */
    .start[hidden] + .title {
        padding-inline-start: var(--el-space-1, 0.25rem);
    }

    /* An element the page writes as the title, a heading of its own for example, is cut the same
       way and brings no margin and no size. A rule of the page for the element wins over this. */
    ::slotted(:not([slot])) {
        display: block;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font: inherit;
    }
`;

// Plain is the appearance of the buttons in a bar that names none.
export default [hostStyle(), appearanceContextStyle(':host', 'plain'), style].join('\n');
