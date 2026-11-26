import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /*
     * How far in the entry stands. An entry takes what the list it is in hands down, and hands
     * down one step more to the list below it. The two have different names: a property cannot be
     * counted up from its own inherited value.
     */
    :host {
        display: block;
        --_el-tree-indent: var(--_el-tree-indent-below, 0px);
    }

    .children {
        --_el-tree-indent-below: calc(var(--_el-tree-indent) + var(--el-tree-indent, var(--el-space-4, 1rem)));
    }

    /* Closed unless the host is open. The rule reads the attribute of the host, which is all there
       is before the element starts: a server-rendered tree shows its open branches, and no other,
       from the first paint. */
    :host(:not([open='true'])) .children {
        display: none;
    }

    /* ── Row ──────────────────────────────────────────────────────────────── */

    /* As wide as the tree, on every level: the fill of a row under the pointer and of the current
       row reaches from edge to edge, and what stands in the row is moved in. */
    .row {
        --_el-tree-row-padding: var(--el-space-2, 0.5rem);
        --_el-tree-toggle-size: 1.5rem;

        display: flex;
        align-items: center;
        gap: var(--el-space-1, 0.25rem);
        /* The link of an entry is as large as this box, and the button that opens the entry lies
           on top of it. Both stay inside of the row. */
        position: relative;
        isolation: isolate;
        min-width: 0;
        padding-block: var(--el-space-1, 0.25rem);
        padding-inline: calc(var(--_el-tree-row-padding) + var(--_el-tree-indent)) var(--_el-tree-row-padding);
        border-radius: var(--el-radius-md, 0);
        color: var(--el-color-fg, inherit);
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-md, inherit);
        line-height: var(--el-line-height, inherit);
        transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    /* ── Button of a branch ───────────────────────────────────────────────── */

    /* Every row has the place of the button, with or without entries below: the names of a level
       begin on one line. */
    .toggle,
    .toggle-place {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: var(--_el-tree-toggle-size);
        height: var(--_el-tree-toggle-size);
        color: var(--el-color-fg-muted, inherit);
    }

    .toggle {
        /* On top of the link of the row: a target of its own. */
        position: relative;
        z-index: 1;
        margin: 0;
        padding: 0;
        border: none;
        border-radius: var(--el-radius-sm, 2px);
        background: transparent;
        font: inherit;
        cursor: pointer;
    }

    @media (hover: hover) {
        .toggle:hover {
            background: color-mix(in srgb, currentColor 16%, transparent);
        }
    }

    .toggle:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* It points along the reading direction while the entry is closed, and down while it is open. */
    .chevron {
        width: 1em;
        height: 1em;
        transition: rotate var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    :host(:dir(rtl)) .chevron {
        scale: -1 1;
    }

    :host([open='true']) .chevron {
        rotate: 90deg;
    }

    :host([open='true']:dir(rtl)) .chevron {
        rotate: -90deg;
    }

    /* ── Start, name, end ─────────────────────────────────────────────────── */

    .start {
        display: inline-flex;
        flex: none;
        align-items: center;
    }

    /* A name a user typed cannot widen the tree: it breaks, inside of a word where it has to. */
    .label {
        flex: 1 1 auto;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
        text-decoration: none;
        overflow-wrap: anywhere;
    }

    button.label {
        cursor: pointer;
    }

    /* A count: quieter than the name. */
    .end {
        display: inline-flex;
        flex: none;
        align-items: center;
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-sm, 0.875em);
    }

    /* ── A row that leads somewhere, or opens ─────────────────────────────── */

    /* The target of the link, and of a name that is a button, is the whole row: the box of the
       row, drawn by the name. It lies on the start and the end, and under the button of a branch
       that is a link. */
    a.label::after,
    button.label::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
    }

    .row:has(a.label, button.label) {
        cursor: pointer;
    }

    /* A tint of the text colour, which shows on every background. Hover only where the pointer
       can hover: a touch screen leaves :hover on the row that was tapped last. */
    @media (hover: hover) {
        .row:has(.label:is(a, button):hover) {
            background: color-mix(in srgb, currentColor 8%, transparent);
        }
    }

    .row:has(.label:is(a, button):active) {
        background: color-mix(in srgb, currentColor 16%, transparent);
    }

    /* The ring of a theme, and without one a ring in the colour of the text. It is drawn around
       the row and inside of it. */
    .label:focus-visible {
        outline: none;
    }

    .label:focus-visible::after {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* ── The current entry ────────────────────────────────────────────────── */

    /* A fill, a bar at the start and a heavier name. The bar and the weight tell the entry apart
       without a colour; the bar is a border, which forced colours keep. */
    .row--current {
        background: color-mix(in srgb, currentColor 8%, transparent);
    }

    .row--current::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        border-inline-start: 0.1875rem solid var(--el-color-accent, currentColor);
        border-start-start-radius: inherit;
        border-end-start-radius: inherit;
        pointer-events: none;
    }

    .row--current .label {
        font-weight: var(--el-font-weight-semibold, 600);
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer a row that is a target is at least --el-touch-target high, and so is the
       button of a branch, in both directions. Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .row:has(a.label, button.label) {
            min-height: var(--el-touch-target, auto);
        }

        .toggle {
            min-width: var(--el-touch-target, var(--_el-tree-toggle-size));
            min-height: var(--el-touch-target, var(--_el-tree-toggle-size));
        }
    }
`;

export default [hostStyle(), style].join('\n');
