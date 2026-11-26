import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;

        /* What the rows read. The density is the room above and below the texts of a row. */
        --_el-list-padding-block: var(--el-space-3, 0.75rem);
    }

    :host([density='compact']) {
        --_el-list-padding-block: var(--el-space-2, 0.5rem);
    }

    /*
     * Two columns for every row: what stands at the start, and the rest. A row takes them over
     * (subgrid), so the first column is as wide as the widest start of the list, and the texts of
     * all rows begin on one line. Without a start in any row the column has no width.
     *
     * The rows are told on themselves, not through the host: a property of the host would reach
     * everything inside of the list, a row of another list in the content of a row as well.
     */
    .list {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        font-family: var(--el-font-family, inherit);
        line-height: var(--el-line-height, inherit);
    }

    ::slotted(*) {
        --_el-list-columns: subgrid;
    }

    /* ── Surface ──────────────────────────────────────────────────────────── */

    /* A card: the surface of el-card. It is headless without a theme, every token falls back to a
       value that paints nothing. The corners clip the fill of a row under the pointer; the focus
       ring of a row is inside of the row, so it is not cut. */
    :host([appearance='outlined']) .list,
    :host([appearance='filled']) .list {
        overflow: hidden;
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);
        box-shadow: var(--el-shadow-md, none);
    }

    :host([appearance='filled']) .list {
        background: var(--el-color-bg-muted, transparent);
    }
`;

export default [hostStyle(), style].join('\n');
