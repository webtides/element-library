import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
        /* Lower than a control: seven tenths of its height, so the bar follows the theme. */
        --_el-status-bar-height: calc(var(--el-control-height, 2.5rem) * 0.7);
        /* A line to the content, which the region of a frame draws itself where the bar is in one.
           Where the user forces colours it is there without a theme as well. */
        --_el-status-bar-line-width: var(--el-border-width, 0px);

        /*
         * What the bar tells the controls in it, in properties that are inherited: a button is as
         * high as the bar and has its small text, it is plain, and its focus ring is inside of it.
         * Around the button there is the edge of the bar, and under the bar the edge of the screen.
         */
        --_el-context-size-height: var(--_el-status-bar-height);
        --_el-context-size-padding-block: 0px;
        --_el-context-size-padding-inline: var(--el-space-2, 0.5em);
        --_el-context-size-font-size: var(--el-font-size-sm, 0.875rem);
        --_el-context-appearance-plain: ;
        --_el-context-focus-ring-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* On a touch screen the bar is at least as high as a finger needs, and so is a button in it.
       Without the token it stays as it is. */
    @media (any-pointer: coarse) {
        :host {
            --_el-status-bar-height: max(calc(var(--el-control-height, 2.5rem) * 0.7), var(--el-touch-target, 0px));
        }
    }

    @media (forced-colors: active) {
        :host {
            --_el-status-bar-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /*
     * The surface. In a region of an el-app-frame it reaches as far as the surface of the region:
     * to the lower edge of the screen and to its sides. The region says how far, and that room is
     * padding here, so the entries stay clear of it. Outside of a frame the room is nothing.
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
        color: var(--el-color-fg-muted, inherit);
        border-block-start: var(--_el-context-line-block-start, var(--_el-status-bar-line-width)) solid
            var(--el-color-border, transparent);
        font-size: var(--el-font-size-sm, 0.875rem);
        line-height: 1.2;
    }

    /* One row with a height of its own: whatever is in the bar, it is as high as without it. */
    .row {
        display: flex;
        align-items: center;
        block-size: var(--_el-status-bar-height);
    }

    /*
     * The two groups. Each has the room to the edge of the bar and to the other group as its own
     * padding: what is cut off is cut at the edge of the bar, and the focus ring of an entry at
     * the edge of a group has room.
     *
     * Where the bar is too narrow, the entries at the start give way: the group is cut at its end,
     * and the group at the end keeps its entries. Only a bar that is narrower than the group at
     * the end cuts that one as well. Nothing wraps, and no entry lies on another.
     *
     * Cut and not clipped: the browser moves a group to show a button in the part that is cut when
     * the keyboard gets to it.
     */
    .start,
    .end {
        display: flex;
        align-items: center;
        gap: var(--el-space-3, 0.75rem);
        box-sizing: border-box;
        block-size: 100%;
        min-inline-size: 0;
        padding-inline: var(--el-space-3, 0.75rem);
        overflow: hidden;
    }

    .start {
        flex: 1 1000 auto;
    }

    .end {
        flex: 0 1 auto;
    }

    /* An entry is one line, and as wide as it is. A rule of the page for the element wins over
       this. */
    ::slotted(*) {
        flex: none;
        white-space: nowrap;
    }

    /* A progress bar is as wide as its place, and an entry has none: it gets a width. */
    ::slotted(el-progress-bar) {
        inline-size: 6rem;
    }

    /* A divider between two entries is as high as their text. */
    ::slotted(el-divider) {
        align-self: center;
        height: 1.2em;
    }
`;

export default [hostStyle(), style].join('\n');
