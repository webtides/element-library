import hostStyle from '../../styles/host.style.js';

const css = String.raw;

/*
 * The names and the values are elements of the page, slotted into the list. A rule for them here
 * (::slotted) loses against every rule of the page for the same property, whatever its
 * specificity and its cascade layer, and a reset has such a rule for every element and for what an
 * element generates: `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; }`.
 *
 * So the list takes nothing from the margin, the padding or the border of a name or a value. The
 * room of a row is the gap between the rows of the grid, and the padding of the list above its
 * first and below its last row. The gap between a name and its value is a column of the grid. The
 * line between two rows is a box with a height, placed without a margin. What the rules below do
 * set on the elements of the page is what such a reset leaves alone: the place in the grid, the
 * text, a position.
 */
const style = css`
    /* The list measures its own width: the layout follows the place the list has, not the
       viewport. */
    :host {
        display: block;
        container-type: inline-size;
    }

    .list {
        --_el-description-list-padding: var(--el-description-list-padding-block, var(--el-space-3, 0.75rem));
        --_el-description-list-gap: var(--el-description-list-gap, var(--el-space-4, 1rem));

        display: grid;
        /* A name above its value. The second column is the one of the actions; without an action
           it has no width. */
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        /* A name and its value are two rows of the grid here, and the gap is between every two
           rows. A value is moved up by that gap, to its name (see below): what is left after it,
           and the gap to the next name, are the room below this row and above the next. The
           room above the first row is the padding of the list. */
        row-gap: var(--_el-description-list-padding);
        /* The lines between the rows are placed from here. */
        position: relative;
        margin: 0;
        padding-block: var(--_el-description-list-padding) 0;
        padding-inline: 0;
        color: var(--el-color-fg, inherit);
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-md, inherit);
        line-height: var(--el-line-height, inherit);
    }

    /* A list with nothing in it has no room for a row. A stylesheet in here cannot ask for less:
       whether the element has a row in it (:has() in :host()) is not answered by every browser. */
    :host(:empty) .list {
        padding-block: 0;
    }

    /* ── Name ─────────────────────────────────────────────────────────────── */

    /* Quieter than its value. Its line is as high as a line of the value, so the two stand on
       one line side by side without being moved against each other. The margin is taken off: a
       browser gives none to a dt, and the list counts on none. */
    ::slotted(dt) {
        grid-column: 1 / -1;
        min-width: 0;
        margin: 0;
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-sm, 0.875em);
        line-height: 1lh;
        overflow-wrap: anywhere;
    }

    /* ── Value ────────────────────────────────────────────────────────────── */

    /* A long value breaks, inside of a word where it has to: it cannot widen the list. The margin
       is the one the browser gives a dd. It stands right under its name: moved up by the gap of
       the grid, with a position, which takes no room and which a reset leaves alone. */
    ::slotted(dd) {
        grid-column: 1;
        position: relative;
        inset-block-start: calc(-1 * var(--_el-description-list-padding));
        min-width: 0;
        margin: 0;
        overflow-wrap: anywhere;
    }

    /* ── Action ───────────────────────────────────────────────────────────── */

    /* At the end of the row, as high as one line of the value and with its content in the middle
       of that line. A button is higher than a line: it reaches out of the box above and below, and
       the row stays as high as a row without an action. */
    ::slotted(dd[data-action]) {
        grid-column: 2;
        display: flex;
        align-items: center;
        height: 1lh;
        overflow-wrap: normal;
        white-space: nowrap;
    }

    /* The gap to the value is an empty box in front of the content of the action, as wide as the
       gap: the column of the actions has no width, and no gap, in a list without an action. */
    ::slotted(dd[data-action])::before {
        content: '';
        flex: none;
        inline-size: var(--_el-description-list-gap);
    }

    /* ── Line between two rows ────────────────────────────────────────────── */

    /* A row begins with its name, and the line above a row is drawn by that name: over the whole
       width of the list, in the middle of the room between two rows, which is where the row of
       this name begins. It is a box with a height and a fill, not a border, and it is moved there
       with translate, not with a margin: a reset of the page that takes the border and the margin
       off every element reaches the name and what it generates, and wins there. Without a theme
       the line has no height. */
    ::slotted(dt)::before {
        content: '';
        position: absolute;
        inset-inline: 0;
        height: var(--el-border-width, 0);
        translate: 0 calc(-1 * var(--_el-description-list-padding));
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

    /* From 30rem of the list itself: a column for the names, the gap, a column for the values and
       one for the actions. The values of all rows begin on one line. A name and its value are one
       row of the grid here, so the gap between two rows is the room below one and above the next,
       and a value stays where it is. */
    @container (min-width: 30rem) {
        .list {
            grid-template-columns:
                var(--el-description-list-term-width, fit-content(calc(40% - var(--_el-description-list-gap))))
                var(--_el-description-list-gap)
                minmax(0, 1fr)
                auto;
            row-gap: calc(2 * var(--_el-description-list-padding));
            padding-block: var(--_el-description-list-padding);
        }

        ::slotted(dt) {
            grid-column: 1;
        }

        ::slotted(dd) {
            grid-column: 3;
            inset-block-start: 0;
        }

        ::slotted(dd[data-action]) {
            grid-column: 4;
        }
    }
`;

export default [hostStyle(), style].join('\n');
