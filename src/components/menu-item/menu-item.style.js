import hostStyle from '../../styles/host.style.js';
import variantsStyle from '../../styles/variants.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /* The whole entry is the control: an icon, and the text beside it. A little lower than a
       control of a form, so a menu of a few entries is no tower. */
    .item {
        display: flex;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: calc(var(--el-control-height, 2.5rem) * 0.85);
        margin: 0;
        padding: var(--el-space-1, 0.25rem) var(--el-space-3, 0.75rem);
        border: 0;
        border-radius: var(--el-radius-md, 0);
        background: transparent;
        /* The colour of the variant: the text colour of the menu, or the colour of a danger. */
        color: var(--_el-variant-text);
        font: inherit;
        text-align: start;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
    }

    .icon {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
    }

    /* One line as a rule. A text that is longer than the menu is wide wraps: an action that is
       cut off cannot be read. */
    .label {
        flex: 1 1 auto;
        min-inline-size: 0;
    }

    /* Under the pointer, and with the focus of the keyboard: a tint of the text colour, which
       shows on every background. Hover only where a pointer can hover: a touch screen leaves the
       state on what was tapped last. */
    @media (hover: hover) {
        .item:hover {
            background: color-mix(in srgb, currentColor 10%, transparent);
        }
    }

    .item:focus-visible {
        background: color-mix(in srgb, currentColor 10%, transparent);
        /* The ring is inside of the entry: the edge of the menu is around it. It is what shows
           where the user forces colours. */
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    .item:active {
        background: color-mix(in srgb, currentColor 18%, transparent);
    }

    /* An entry that cannot be chosen. The keyboard still gets to it, so it has its ring. */
    .item--disabled,
    .item--disabled:hover,
    .item--disabled:active {
        background: transparent;
        opacity: 0.55;
        cursor: not-allowed;
    }

    /* On a touch screen an entry is at least as high as a finger needs. Without the token the
       sizes stay as they are. */
    @media (any-pointer: coarse) {
        .item {
            min-block-size: max(calc(var(--el-control-height, 2.5rem) * 0.85), var(--el-touch-target, 0px));
        }
    }
`;

export default [hostStyle(), variantsStyle(), style].join('\n');
