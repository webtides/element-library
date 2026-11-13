import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /* A row that breaks into a second one where it does not fit, so it never is wider than its
       container. */
    [part~='list'] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--el-space-1, 0.25rem);
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: flex;
    }

    /* ── Buttons ──────────────────────────────────────────────────────────── */

    /* A square of the control height of the size, which grows in width with a long number. The
       ellipsis has the same box, so the row does not move when it comes or goes. */
    [part~='button'],
    [part~='ellipsis'] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: var(--_el-size-height);
        min-height: var(--_el-size-height);
        /* Little, so that two figures fit into the square of the small size too. */
        padding: 0 var(--el-space-1, 0.25em);
        font-family: var(--el-font-family, inherit);
        font-size: var(--_el-size-font-size);
        /* Figures of one width: the row is as wide with a 1 as with an 8. */
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }

    [part~='button'] {
        border: none;
        border-radius: var(--el-radius-md, 4px);
        background: transparent;
        color: var(--el-color-fg, inherit);
        cursor: pointer;
        user-select: none;
        transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    [part~='ellipsis'] {
        color: var(--el-color-fg-muted, inherit);
        user-select: none;
    }

    /* The arrow heads that are there without an icon of the page. */
    slot > svg {
        width: 1.25em;
        height: 1.25em;
    }

    /* They point with the reading direction. The page before is at the right in a text that runs
       from right to left. */
    :host(:dir(rtl)) slot > svg {
        transform: scaleX(-1);
    }

    /* ── States ───────────────────────────────────────────────────────────── */

    /* A tint of the text colour, which shows on every background. Hover only where the pointer
       can hover: a touch screen leaves :hover on the button that was tapped last. */
    @media (hover: hover) {
        [part~='button']:hover {
            background: color-mix(in srgb, currentColor 12%, transparent);
        }
    }

    [part~='button']:active {
        background: color-mix(in srgb, currentColor 24%, transparent);
    }

    [part~='button']:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    /* The current page has the fill of the accent colour, like a brand button. It leads nowhere,
       so it does not answer to the pointer. */
    [part~='current'],
    [part~='current']:hover,
    [part~='current']:active {
        background: var(--el-color-accent, #2563eb);
        color: var(--el-color-bg, #fff);
        font-weight: 600;
        cursor: default;
    }

    /* Forced colours take the fill away. The colours of a selection mark the page there. The
       button is taken out of the forcing as a whole: a browser would paint a plate in the colour
       of the page behind the figure, on which the text colour of a selection cannot be read. */
    @media (forced-colors: active) {
        [part~='current'],
        [part~='current']:hover,
        [part~='current']:active {
            forced-color-adjust: none;
            background: Highlight;
            color: HighlightText;
        }
    }

    [part~='button'][disabled] {
        background: transparent;
        opacity: 0.55;
        cursor: not-allowed;
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer no button falls below --el-touch-target in either direction. Without
       the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        [part~='button'],
        [part~='ellipsis'] {
            min-width: max(var(--_el-size-height), var(--el-touch-target, 0px));
            min-height: max(var(--_el-size-height), var(--el-touch-target, 0px));
        }
    }
`;

export default [hostStyle(), sizeStyle(), style].join('\n');
