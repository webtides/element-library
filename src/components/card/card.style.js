import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /*
     * The surface. It is headless without a theme: every token falls back to a value that paints
     * nothing, so an unthemed card is its regions and their padding.
     */
    .card {
        --_el-card-padding: var(--el-card-padding, var(--el-space-4, 1rem));

        display: flex;
        flex-direction: column;
        /* A card that its container stretches, in a grid of cards for example, fills that height. */
        height: 100%;
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);
        box-shadow: var(--el-shadow-md, none);
        /* No overflow here: what a card holds may reach out of it, the list of a select or a focus
           ring for example. The media region clips itself to the corners instead. */
    }

    :host([appearance='filled']) .card {
        background: var(--el-color-bg-muted, transparent);
    }

    :host([appearance='plain']) .card {
        background: transparent;
        color: inherit;
        /* No border at all, not a transparent one: forced colours would paint that. */
        border: none;
        box-shadow: none;
    }

    /* ── Regions ──────────────────────────────────────────────────────────── */

    /* From edge to edge, and round where the card is. The two corners are the card's own,
       inherited: a theme may give the radius eight values, and those cannot be calculated with.
       Inside of the border that is a little rounder than the border itself, by less than its
       width. */
    [part~='media'] {
        overflow: hidden;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    /* An image or a video is as wide as the card and keeps its proportions. A rule of the page
       for the element wins over this one. */
    ::slotted([slot='media']) {
        display: block;
        width: 100%;
        height: auto;
    }

    [part~='header'] {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--el-space-2, 0.5rem);
        padding: var(--_el-card-padding);
        font-weight: var(--el-font-weight-semibold, 600);
    }

    [part~='body'] {
        /* Takes the height that is left, so the footer of a stretched card is at its bottom. */
        flex: 1 1 auto;
        padding: var(--_el-card-padding);
    }

    /* One padding between two regions, not two: the region above keeps its own. */
    [part~='header']:not([hidden]) + [part~='body'] {
        padding-top: 0;
    }

    [part~='footer'] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        padding: var(--_el-card-padding);
        padding-top: 0;
    }

    /* The header and the footer place what is slotted into them, with the gap. The margins the
       browser gives a heading or a paragraph would come on top of that. */
    ::slotted([slot='header']),
    ::slotted([slot='footer']) {
        margin: 0;
    }
`;

export default [hostStyle(), style].join('\n');
