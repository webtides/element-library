import hostStyle from '../../styles/host.style.js';

const css = String.raw;

/*
 * What a rail has that a bar has not, as the values of internal properties. Every rule below
 * reads one of them and falls back to the value of the bar.
 */
const rail = {
    // A column, which takes the height it is given and scrolls where it has more destinations.
    direction: 'column',
    'block-size': '100%',
    // The width is the one of the destinations: the room of the screen and the line are on top.
    'inline-size':
        'calc(var(--el-nav-rail-size, 5rem) + var(--_el-context-inset-inline-start, var(--_el-nav-screen-start)) + var(--_el-context-line-inline-end, var(--_el-nav-line-width)))',
    'list-flex': '1 1 auto',
    overflow: 'auto',
    // The group at the lower end.
    'end-display': 'flex',
    // A destination is as high as it is, not a share of the height.
    'item-flex': 'none',
    // The line is at the side that faces the content. A region of a frame draws it itself.
    'line-block-start': '0px',
    'line-inline-end': 'var(--_el-context-line-inline-end, var(--_el-nav-line-width))',
    // Alone, a rail lies at the side from the top of the screen to its lower edge.
    'inset-block-start': 'var(--_el-context-inset-block-start, env(safe-area-inset-top, 0px))',
    'inset-inline-end': 'var(--_el-context-inset-inline-end, 0px)',
};

/** The properties of a rail, each with `condition` in front of its value. */
const railProperties = (condition = '') =>
    Object.entries(rail)
        .map(([name, value]) => `--_el-nav-${name}: ${condition}${value};`)
        .join('\n        ');

const style = css`
    :host {
        display: block;
        /* A rail fills the height of its place: where a frame has the element in the column at
           its side, which the region says with a property that is set to nothing. */
        --_el-nav-host-block-size: var(--_el-context-nav-rail) 100%;
        block-size: var(--_el-nav-host-block-size, auto);
        /* A line to the content, which the region of a frame draws itself where the element is in
           one. Where the user forces colours it is there without a theme as well. */
        --_el-nav-line-width: var(--el-border-width, 0px);

        /* The sides of the screen, as a phone that lies on its side has them. Alone, the element
           asks the screen itself. */
        --_el-nav-screen-start: env(safe-area-inset-left, 0px);
        --_el-nav-screen-end: env(safe-area-inset-right, 0px);
    }

    /* Asked of the host: with \`dir\` on an element around it, Chromium does not match
       \`:dir(rtl)\` for an element inside the shadow root. */
    :host(:dir(rtl)) {
        --_el-nav-screen-start: env(safe-area-inset-right, 0px);
        --_el-nav-screen-end: env(safe-area-inset-left, 0px);
    }

    @media (forced-colors: active) {
        :host {
            --_el-nav-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /* And where the page says what the destinations are. */
    :host([layout='rail']) {
        block-size: 100%;
        /* As wide as the rail, not as its place. */
        inline-size: fit-content;
    }

    :host([layout='bar']) {
        block-size: auto;
    }

    /* ── Bar or rail ──────────────────────────────────────────────────────── */

    /* A rail, because the page says so. */
    .nav--rail {
        ${railProperties()}
    }

    /*
     * A rail where a frame has the element in the column at its side. The region says so with a
     * property that is set to nothing: in front of a value it leaves the value as it is, and
     * where the property is not set, the declaration is not valid and the rule below falls back
     * to the value of the bar. The stylesheet decides, so this holds before the script has run.
     */
    .nav--auto {
        ${railProperties('var(--_el-context-nav-rail) ')}
    }

    /* ── The surface ──────────────────────────────────────────────────────── */

    /*
     * In a region of a frame the surface reaches as far as the surface of the region: to the edge
     * of the screen. That room is padding here, so the destinations stay clear of the home
     * indicator and the notch. Alone, the element asks the screen: a bar lies at the lower edge,
     * a rail at the side.
     *
     * The margins are on the landmark and not on the element: a reset of the page (margin: 0 for
     * everything) wins over a rule for the host, and the room would be there twice.
     */
    .nav {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        block-size: var(--_el-nav-block-size, auto);
        inline-size: var(--_el-nav-inline-size, auto);
        margin-block: calc(-1 * var(--_el-context-inset-block-start, 0px))
            calc(-1 * var(--_el-context-inset-block-end, 0px));
        margin-inline: calc(-1 * var(--_el-context-inset-inline-start, 0px))
            calc(-1 * var(--_el-context-inset-inline-end, 0px));
        padding-block: var(--_el-nav-inset-block-start, var(--_el-context-inset-block-start, 0px))
            var(--_el-context-inset-block-end, env(safe-area-inset-bottom, 0px));
        padding-inline: var(--_el-context-inset-inline-start, var(--_el-nav-screen-start))
            var(--_el-nav-inset-inline-end, var(--_el-context-inset-inline-end, var(--_el-nav-screen-end)));
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border: 0 solid var(--el-color-border, transparent);
        border-block-start-width: var(
            --_el-nav-line-block-start,
            var(--_el-context-line-block-start, var(--_el-nav-line-width))
        );
        border-inline-end-width: var(--_el-nav-line-inline-end, 0px);
    }

    /* The destinations: in a bar they share the width in equal parts, however long their texts
       are. In a rail they are below each other, and scroll where the height does not take them. */
    .list {
        display: flex;
        flex-direction: var(--_el-nav-direction, row);
        flex: var(--_el-nav-list-flex, none);
        min-block-size: 0;
        overflow-y: var(--_el-nav-overflow, visible);
    }

    /* The group at the lower end of a rail. A bar has no room for it. */
    .end {
        display: var(--_el-nav-end-display, none);
        flex-direction: column;
        flex: none;
    }

    /* ── Icons alone ──────────────────────────────────────────────────────── */

    /* The text of a destination is off the screen and stays its name. The destination reads these
       in its own stylesheet. */
    .nav--icons {
        --_el-nav-label-position: absolute;
        --_el-nav-label-size: 1px;
        --_el-nav-label-clip: inset(50%);
    }

    /* The tooltips take no room. A tooltip hides itself while it is closed, but with a stylesheet
       it only has once it has rendered: for a frame its text would be a line under the element. */
    el-tooltip:not(:popover-open) {
        display: none;
    }
`;

export default [hostStyle(), style].join('\n');
