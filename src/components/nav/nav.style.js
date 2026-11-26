import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
        /* A line to the content, which the region of a frame draws itself where the bar is in one.
           Where the user forces colours it is there without a theme as well. */
        --_el-nav-line-width: var(--el-border-width, 0px);

        /*
         * The room the system takes at the edges of the screen. In a region of an el-app-frame
         * the region says how far its surface reaches. Alone, the bar asks the screen itself: it
         * lies at the lower edge, so the home indicator and the two sides count.
         */
        --_el-nav-inset-block-end: var(--_el-context-inset-block-end, env(safe-area-inset-bottom, 0px));
        --_el-nav-inset-inline-start: var(--_el-context-inset-inline-start, env(safe-area-inset-left, 0px));
        --_el-nav-inset-inline-end: var(--_el-context-inset-inline-end, env(safe-area-inset-right, 0px));
    }

    /* Asked of the host: with \`dir\` on an element around the bar, Chromium does not match
       \`:dir(rtl)\` for an element inside the shadow root. */
    :host(:dir(rtl)) {
        --_el-nav-inset-inline-start: var(--_el-context-inset-inline-start, env(safe-area-inset-right, 0px));
        --_el-nav-inset-inline-end: var(--_el-context-inset-inline-end, env(safe-area-inset-left, 0px));
    }

    @media (forced-colors: active) {
        :host {
            --_el-nav-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /*
     * The surface. In the footer of a frame it reaches as far as the surface of the region: to the
     * lower edge of the screen and to its sides. That room is padding here, so the destinations
     * stay above the home indicator.
     *
     * The margins are on the landmark and not on the element: a reset of the page (margin: 0 for
     * everything) wins over a rule for the host, and the bar would have the room twice.
     */
    .nav--bar {
        margin-block: calc(-1 * var(--_el-context-inset-block-start, 0px))
            calc(-1 * var(--_el-context-inset-block-end, 0px));
        margin-inline: calc(-1 * var(--_el-context-inset-inline-start, 0px))
            calc(-1 * var(--_el-context-inset-inline-end, 0px));
        padding-block: var(--_el-context-inset-block-start, 0px) var(--_el-nav-inset-block-end);
        padding-inline: var(--_el-nav-inset-inline-start) var(--_el-nav-inset-inline-end);
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border-block-start: var(--_el-context-line-block-start, var(--_el-nav-line-width)) solid
            var(--el-color-border, transparent);
    }

    /* The destinations share the width in equal parts, however long their texts are. */
    .nav--bar .list {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
    }
`;

export default [hostStyle(), style].join('\n');
