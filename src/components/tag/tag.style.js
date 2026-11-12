import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';
import variantsStyle from '../../styles/variants.style.js';
import appearanceStyle from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-flex;
        max-width: 100%;
        vertical-align: middle;
    }

    .tag {
        /* The colours come from the variants and appearance modules, the size from the size
           module. A tag is the small sibling of a control of the same size: 0.7 times its height,
           half its padding, and a font size one step down, so that it fits into a field. */
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
        max-width: 100%;
        min-height: calc(var(--_el-size-height) * 0.7);
        padding: 0 calc(var(--_el-size-padding-inline) * 0.5);
        border: var(--el-border-width, 1px) solid transparent;
        border-radius: var(--el-radius-md, 4px);
        font-family: var(--el-font-family, inherit);
        font-size: calc(var(--_el-size-font-size) * 0.875);
        line-height: 1.2;
        white-space: nowrap;
    }

    .tag--pill {
        border-radius: 999px;
    }

    /* A text that does not fit is cut off, the remove button stays. */
    .content {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ── Remove button ────────────────────────────────────────────────────── */

    .remove-button {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        /* Half of the padding back: the cross has air of its own around it. */
        margin-inline-end: calc(var(--_el-size-padding-inline) * -0.25);
        padding: 0.125em;
        border: none;
        border-radius: var(--el-radius-sm, 2px);
        background: transparent;
        color: inherit;
        font: inherit;
        line-height: 0;
        cursor: pointer;
    }

    .tag--pill .remove-button {
        border-radius: 50%;
    }

    .remove-button svg {
        width: 1em;
        height: 1em;
    }

    /* A tint of the text colour, which shows on every fill. Hover only where the pointer can
       hover: a touch screen leaves :hover on the button that was tapped last. */
    @media (hover: hover) {
        .remove-button:hover {
            background: color-mix(in srgb, currentColor 16%, transparent);
        }
    }

    .remove-button:active {
        background: color-mix(in srgb, currentColor 28%, transparent);
    }

    /* The ring has the text colour of the tag, not the focus colour of the theme: that one is the
       accent colour, which a brand tag has as its fill. */
    .remove-button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid currentColor;
        outline-offset: 1px;
    }

    /* Touch screens: the remove button is at least --el-touch-target, the cross keeps its size
       and the tag grows with the button. Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .remove-button {
            min-width: var(--el-touch-target, auto);
            min-height: var(--el-touch-target, auto);
        }
    }
`;

export default [hostStyle(), sizeStyle(), variantsStyle(), appearanceStyle('.tag'), style].join('\n');
