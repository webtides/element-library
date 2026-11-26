import hostStyle from '../../styles/host.style.js';

const css = String.raw;

/*
 * The names and the values are elements of the page, slotted into the list. A rule for them here
 * (::slotted) loses against every rule of the page for the same property, a reset included. So
 * the rules below set what a reset leaves alone: the place in the grid, the padding, the text.
 * The line between two rows is not a border for that reason.
 */
const style = css`
    /* The list measures its own width: the layout follows the place the list has, not the
       viewport. */
    :host {
        display: block;
        container-type: inline-size;
    }

    .list {
        --_el-description-list-padding: var(--el-space-3, 0.75rem);
        --_el-description-list-gap: var(--el-space-4, 1rem);

        display: grid;
        /* A name above its value. The second column is the one of the actions; without an action
           it has no width. */
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        /* The lines between the rows are placed from here. */
        position: relative;
        margin: 0;
        color: var(--el-color-fg, inherit);
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-md, inherit);
        line-height: var(--el-line-height, inherit);
    }

    /* ── Name ─────────────────────────────────────────────────────────────── */

    /* Quieter than its value. Its line is as high as a line of the value, so the two stand on
       one line side by side without being moved against each other. */
    ::slotted(dt) {
        grid-column: 1 / -1;
        min-width: 0;
        margin: 0;
        padding-block-start: var(--_el-description-list-padding);
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-sm, 0.875em);
        line-height: 1lh;
        overflow-wrap: anywhere;
    }

    /* ── Value ────────────────────────────────────────────────────────────── */

    /* A long value breaks, inside of a word where it has to: it cannot widen the list. The margin
       is the one the browser gives a dd. */
    ::slotted(dd) {
        grid-column: 1;
        min-width: 0;
        margin: 0;
        padding-block-end: var(--_el-description-list-padding);
        overflow-wrap: anywhere;
    }

    /* ── Action ───────────────────────────────────────────────────────────── */

    /* At the end of the row, as high as one line of the value and with its content in the middle
       of that line. A button is higher than a line: it reaches out of the box above and below, and
       the row stays as high as a row without an action. The box has no padding above and below,
       so its height is the same whichever way the page counts the sizes of its elements. */
    ::slotted(dd[data-action]) {
        grid-column: 2;
        display: flex;
        align-items: center;
        height: 1lh;
        padding-block: 0;
        padding-inline-start: var(--_el-description-list-gap);
        overflow-wrap: normal;
        white-space: nowrap;
    }

    /* ── Line between two rows ────────────────────────────────────────────── */

    /* A row begins with its name, and the line above a row is drawn by that name: over the whole
       width of the list, at the upper edge of the name. It is a box with a height and a fill, not
       a border: a reset of the page that takes the border off every element reaches the name and
       what it generates, and wins there. Without a theme the line has no height. */
    ::slotted(dt)::before {
        content: '';
        position: absolute;
        inset-inline: 0;
        height: var(--el-border-width, 0);
        margin-block-start: calc(-1 * var(--_el-description-list-padding));
        background: var(--el-color-border, transparent);
    }

    /* Nothing stands above the first row. */
    ::slotted(dt:first-child)::before {
        content: none;
    }

    /* Forced colours take a fill away, and keep one that is a colour of the system. */
    @media (forced-colors: active) {
        ::slotted(dt)::before {
            background: CanvasText;
        }
    }

    /* ── Side by side ─────────────────────────────────────────────────────── */

    /* From 30rem of the list itself: a column for the names, one for the values and one for the
       actions. The values of all rows begin on one line. */
    @container (min-width: 30rem) {
        .list {
            grid-template-columns:
                var(--el-description-list-term-width, fit-content(40%))
                minmax(0, 1fr)
                auto;
        }

        ::slotted(dt) {
            grid-column: 1;
            padding-block: var(--_el-description-list-padding);
            padding-inline-end: var(--_el-description-list-gap);
        }

        ::slotted(dd) {
            grid-column: 2;
            padding-block: var(--_el-description-list-padding);
        }

        /* The line of the value begins after the padding of the row. */
        ::slotted(dd[data-action]) {
            grid-column: 3;
            height: calc(1lh + 2 * var(--_el-description-list-padding));
            padding-block: 0;
        }
    }
`;

export default [hostStyle(), style].join('\n');
