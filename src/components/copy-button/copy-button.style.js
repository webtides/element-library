import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        /* The place the text of the outcome is taken out of the flow from. */
        position: relative;
        vertical-align: middle;
    }

    /* ── Button ───────────────────────────────────────────────────────────── */

    /* A square of the control height of the size, without a surface of its own: a quiet tool next
       to the text it copies. */
    .copy-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--_el-size-height);
        height: var(--_el-size-height);
        padding: 0;
        border: none;
        border-radius: var(--el-radius-md, 4px);
        background: transparent;
        color: var(--el-color-fg, inherit);
        font-family: var(--el-font-family, inherit);
        font-size: var(--_el-size-font-size);
        line-height: 1;
        cursor: pointer;
        user-select: none;
        transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    .icon {
        display: inline-flex;
    }

    /* The icons that are there without an icon of the page, and an svg the page slots in. */
    .icon svg,
    ::slotted(svg) {
        width: 1.25em;
        height: 1.25em;
    }

    /* ── Outcome ──────────────────────────────────────────────────────────── */

    :host([status='success']) .icon {
        color: var(--el-color-success, inherit);
    }

    :host([status='error']) .icon {
        color: var(--el-color-danger, inherit);
    }

    /* The text of the outcome is for a screen reader. The icon says the same to the eye. */
    .feedback {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
    }

    /* ── States ───────────────────────────────────────────────────────────── */

    /* A tint of the text colour, which shows on every background. Hover only where the pointer
       can hover: a touch screen leaves :hover on the button that was tapped last. */
    @media (hover: hover) {
        .copy-button:hover {
            background: color-mix(in srgb, currentColor 12%, transparent);
        }
    }

    .copy-button:active {
        background: color-mix(in srgb, currentColor 24%, transparent);
    }

    .copy-button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    .copy-button[disabled] {
        background: transparent;
        opacity: 0.55;
        cursor: not-allowed;
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer the button does not fall below --el-touch-target in either direction.
       Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .copy-button {
            min-width: var(--el-touch-target, auto);
            min-height: var(--el-touch-target, auto);
        }
    }
`;

export default [hostStyle(), sizeStyle(), style].join('\n');
