import hostStyle from '../../styles/host.style.js';

const css = String.raw;

/*
 * What a column has that a bar has not, as the values of internal properties: a rail and a list
 * are both a column. Every rule below reads one of them and falls back to the value of the bar.
 */
const column = {
    // A column, which takes the height it is given and scrolls where it has more destinations.
    direction: 'column',
    'block-size': '100%',
    'groups-flex': '1 1 auto',
    overflow: 'auto',
    // The second group, and the group at the lower end.
    'secondary-display': 'block',
    'end-display': 'flex',
    // A destination is as high as it is, not a share of the height.
    'item-flex': 'none',
    // The line is at the side that faces the content. A region of a frame draws it itself.
    'line-block-start': '0px',
    'line-inline-end': 'var(--_el-context-line-inline-end, var(--_el-nav-line-width))',
    // Alone, a column lies at the side from the top of the screen to its lower edge.
    'inset-block-start': 'var(--_el-context-inset-block-start, env(safe-area-inset-top, 0px))',
    'inset-inline-end': 'var(--_el-context-inset-inline-end, 0px)',
};

/* The room of the screen at the start side and the line are on top of the width of a column. */
const onTop =
    'var(--_el-context-inset-inline-start, var(--_el-nav-screen-start)) + var(--_el-context-line-inline-end, var(--_el-nav-line-width))';

/* A rail: as narrow as an icon with a word under it. */
const rail = {
    ...column,
    'inline-size': `calc(var(--el-nav-rail-size, 5rem) + ${onTop})`,
    // The second group is below a line, and its heading is its name alone.
    'secondary-line': 'var(--_el-nav-line-width)',
    'secondary-room': 'var(--el-space-2, 0.5rem)',
};

/*
 * A list: an icon and its text in one row, as wide as the place of the list. Its own width counts
 * where the place is as wide as what is in it: the column of a frame without a width.
 */
const list = {
    ...column,
    'inline-size': `calc(var(--el-nav-list-size, 16rem) + ${onTop})`,
    fill: 'calc(100% + var(--_el-context-inset-inline-start, 0px) + var(--_el-context-inset-inline-end, 0px))',
    'list-gap': 'var(--el-space-1, 0.25rem)',
    'list-padding': 'var(--el-space-2, 0.5rem)',
    // The second group is below its heading.
    'secondary-line': '0px',
    'secondary-room': 'var(--el-space-2, 0.5rem)',
    'heading-display': 'block',
    // A destination: a row, with the mark of the current one behind the whole of it.
    'item-direction': 'row',
    'item-justify': 'flex-start',
    'item-gap': 'var(--el-space-3, 0.75rem)',
    'item-min-block-size': 'var(--el-control-height, 2.5rem)',
    'item-padding-block': '0px',
    'item-padding-inline': 'var(--el-space-3, 0.75rem)',
    'item-radius': 'var(--el-radius-md, 0)',
    'item-font-size': 'var(--el-font-size-sm, 0.875rem)',
    'item-mark-width': '1px',
    'item-mark-background': 'var(--el-color-bg-muted, transparent)',
    'icon-mark-width': '0px',
    'icon-mark-background': 'transparent',
    'icon-padding-block': '0px',
    'icon-padding-inline': '0px',
    'label-flex': '1 1 auto',
    // A count is at the end of the row, in the flow.
    'badge-position': 'static',
    'badge-margin': '0px',
};

/** The properties of a layout, each with `condition` in front of its value. */
const properties = (layout, condition = '') =>
    Object.entries(layout)
        .map(([name, value]) => `--_el-nav-${name}: ${condition}${value};`)
        .join('\n        ');

/* What a frame says where it has the element in the column at its side: a property that is set to
   nothing. In front of a value it leaves the value as it is, and where the property is not set,
   the declaration is not valid and the rule that reads it falls back to the value of the bar. */
const inColumn = 'var(--_el-context-nav-column) ';

const style = css`
    :host {
        display: block;
        /* A column fills the height of its place: where a frame has the element in the column at
           its side. In an element of the page that lays out a column of its own (a flex column),
           it takes the height that is left, and not the one of its destinations. */
        --_el-nav-host-block-size: ${inColumn}100%;
        --_el-nav-host-min-block-size: ${inColumn}0px;
        block-size: var(--_el-nav-host-block-size, auto);
        min-block-size: var(--_el-nav-host-min-block-size, auto);
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
    :host([layout='rail']),
    :host([layout='list']) {
        block-size: 100%;
        min-block-size: 0;
    }

    /* As wide as the rail, not as its place. A list is as wide as its place. */
    :host([layout='rail']) {
        inline-size: fit-content;
    }

    :host([layout='bar']) {
        block-size: auto;
        min-block-size: auto;
    }

    /* ── Bar, rail or list ────────────────────────────────────────────────── */

    /* A rail or a list, because the page says so. */
    .nav--rail {
        ${properties(rail)}
    }

    .nav--list {
        ${properties(list)}
    }

    /*
     * And where a frame has the element in the column at its side: a rail, or the list the page
     * asks for there (\`column\`). The stylesheet decides, so this holds before the script has run.
     */
    .nav--auto {
        ${properties(rail, inColumn)}
    }

    .nav--auto.nav--column-list {
        ${properties(list, inColumn)}
    }

    /* ── The surface ──────────────────────────────────────────────────────── */

    /*
     * In a region of a frame the surface reaches as far as the surface of the region: to the edge
     * of the screen. That room is padding here, so the destinations stay clear of the home
     * indicator and the notch. Alone, the element asks the screen: a bar lies at the lower edge,
     * a column at the side.
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
        /* A list is as wide as its place, wider or narrower than its own width. */
        min-inline-size: var(--_el-nav-fill, 0);
        max-inline-size: var(--_el-nav-fill, none);
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

    /* The two groups at the top. In a column they scroll together where the height does not take
       them, and the group at the lower end stays in view. */
    .groups {
        display: flex;
        flex-direction: column;
        flex: var(--_el-nav-groups-flex, none);
        min-block-size: 0;
        overflow-y: var(--_el-nav-overflow, visible);
    }

    /* The destinations: in a bar they share the width in equal parts, however long their texts
       are. In a column they are below each other. */
    .list,
    .end {
        flex-direction: var(--_el-nav-direction, row);
        gap: var(--_el-nav-list-gap, 0px);
        padding: var(--_el-nav-list-padding, 0px);
    }

    .list {
        display: flex;
        flex: none;
    }

    /* The second group: the destinations that have no room in a bar, which leaves them out. In a
       rail they are below a line, in a list below their heading. */
    .secondary {
        display: var(--_el-nav-secondary-display, none);
        flex: none;
        margin-block-start: var(--_el-nav-secondary-room, 0px);
        border-block-start: var(--_el-nav-secondary-line, 0px) solid var(--el-color-border, transparent);
    }

    /* The heading of the second group, which a list shows. The list of the group has its text as
       its name, so assistive technology reads it once. */
    .heading {
        display: var(--_el-nav-heading-display, none);
        padding-block: var(--el-space-2, 0.5rem) 0;
        padding-inline: calc(var(--el-space-2, 0.5rem) + var(--el-space-3, 0.75rem) + 1px);
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-xs, 0.75rem);
        font-weight: var(--el-font-weight-semibold, 600);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* The group at the lower end of a column. A bar has no room for it. */
    .end {
        display: var(--_el-nav-end-display, none);
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
