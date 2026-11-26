import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /*
     * A row of the grid of its list: it spans the two columns and takes them over, so its start is
     * in the first one and its texts begin where the texts of the other rows do. A row that is in
     * no list has two columns of its own.
     */
    :host {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: var(--_el-list-columns, auto minmax(0, 1fr));
        min-width: 0;
    }

    .item {
        /* What the list tells its rows ends here: a row of another list in the content of this
           one is in no grid of this list. */
        --_el-list-columns: initial;
        --_el-list-item-padding-inline: var(--el-list-padding-inline, var(--el-space-4, 1rem));
        --_el-list-item-gap: var(--el-space-3, 0.75rem);

        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: subgrid;
        align-items: center;
        /* The link of a row is as large as this box, and the control at its end lies on top of
           the link. Both stay inside of the row. */
        position: relative;
        isolation: isolate;
        min-width: 0;
        padding: var(--_el-list-padding-block, var(--el-space-3, 0.75rem)) var(--_el-list-item-padding-inline);
        color: var(--el-color-fg, inherit);
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-md, inherit);
        line-height: var(--el-line-height, inherit);
        transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
        /* The line between two rows. Without a theme it has no width. It is drawn inside of the
           shadow root: a reset of the page that takes the border off every element reaches the
           host, and wins there. */
        border-block-start: var(--el-border-width, 0) solid var(--el-color-border, transparent);
    }

    /* Nothing stands above the first row. */
    :host(:first-of-type) .item {
        border-block-start: none;
    }

    /* ── Start ────────────────────────────────────────────────────────────── */

    .start {
        display: flex;
        align-items: center;
    }

    /* The gap to the texts comes with what is slotted, so a row without a start has none, and a
       list without a start in any row has no first column. A margin of the page wins over it. */
    ::slotted([slot='start']) {
        flex: none;
        margin-inline-end: var(--_el-list-item-gap);
    }

    /* ── Mark ─────────────────────────────────────────────────────────────── */

    /* A dot in the middle of the padding at the start of the row. It is out of the flow, so a row
       with a mark has its start and its texts where a row without one has them. A border draws
       it: forced colours take a background away. */
    .mark {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: calc(var(--_el-list-item-padding-inline) / 2);
        translate: -50% -50%;
        width: 0;
        height: 0;
        border: 0.25rem solid var(--el-color-accent, currentColor);
        border-radius: 50%;
        pointer-events: none;
    }

    :host(:dir(rtl)) .mark {
        translate: 50% -50%;
    }

    /* The text of the mark is for assistive technology alone. */
    .mark-text {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    /* ── Texts ────────────────────────────────────────────────────────────── */

    .body {
        grid-column: 2;
        display: flex;
        align-items: center;
        min-width: 0;
    }

    /* A text a user typed cannot widen the row: it breaks, inside of a word where it has to. */
    .text {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .title {
        display: block;
        min-width: 0;
        color: inherit;
        text-decoration: none;
    }

    .description {
        display: block;
        min-width: 0;
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-sm, 0.875em);
    }

    .item--truncate .title,
    .item--truncate .description {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* ── End ──────────────────────────────────────────────────────────────── */

    /* A value, a count, a chevron: it takes the width it has, up to half of the row, and breaks
       after that. */
    .end {
        display: flex;
        flex: 0 1 auto;
        align-items: center;
        min-width: 0;
        max-width: 50%;
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-sm, 0.875em);
        overflow-wrap: anywhere;
        text-align: end;
    }

    .action {
        display: flex;
        flex: none;
        align-items: center;
        /* On top of the link of the row: a control here is a target of its own. */
        position: relative;
        z-index: 1;
    }

    ::slotted([slot='end']),
    ::slotted([slot='action']) {
        margin-inline-start: var(--_el-list-item-gap);
    }

    /* ── A row that is a link ─────────────────────────────────────────────── */

    /* The link is the title, and its target is the whole row: the box of the row, drawn by the
       link. It lies on the start, the texts and the end, and under the control at the very end. */
    a.title::after {
        content: '';
        position: absolute;
        inset: 0;
    }

    .item--link {
        cursor: pointer;
    }

    /* A tint of the text colour, which shows on every background. Hover only where the pointer
       can hover: a touch screen leaves :hover on the row that was tapped last. */
    @media (hover: hover) {
        .item--link:has(a.title:hover) {
            background: color-mix(in srgb, currentColor 8%, transparent);
        }
    }

    .item--link:has(a.title:active) {
        background: color-mix(in srgb, currentColor 16%, transparent);
    }

    /* The ring of a theme, and without one a ring in the colour of the text. It is drawn around
       the row and inside of it: a list with round corners clips what is outside. */
    a.title:focus-visible {
        outline: none;
    }

    a.title:focus-visible::after {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* ── The current row ──────────────────────────────────────────────────── */

    /* A fill, a bar at the start and a heavier title. The bar and the weight tell the row apart
       without a colour; the bar is a border, which forced colours keep. */
    .item--current {
        background: color-mix(in srgb, currentColor 8%, transparent);
    }

    .item--current::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        border-inline-start: 0.1875rem solid var(--el-color-accent, currentColor);
        pointer-events: none;
    }

    .item--current .title {
        font-weight: var(--el-font-weight-semibold, 600);
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer a row that is a link is at least --el-touch-target high. Without the
       token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .item--link {
            min-height: var(--el-touch-target, auto);
        }
    }
`;

export default [hostStyle(), style].join('\n');
