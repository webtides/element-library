import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';
import variantsStyle from '../../styles/variants.style.js';
import appearanceStyle from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        vertical-align: middle;
    }

    /* ── Base control ─────────────────────────────────────────────────────── */

    .button {
        /* The size comes from the size module, the colours from the variants and appearance
           modules. All of them carry fallbacks: an unthemed button still renders as a usable
           native-ish control rather than disappearing. */
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--el-space-2, 0.5em);
        width: 100%;
        min-height: var(--_el-size-height);
        padding: var(--_el-size-padding-block) var(--_el-size-padding-inline);
        border: var(--el-border-width, 1px) solid transparent;
        border-radius: var(--el-radius-md, 4px);
        font-family: var(--el-font-family, inherit);
        font-size: var(--_el-size-font-size);
        font-weight: 600;
        line-height: var(--el-line-height, 1.5);
        text-align: center;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition:
            background var(--el-duration-md, 0s) var(--el-ease, linear),
            border-color var(--el-duration-md, 0s) var(--el-ease, linear),
            color var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    /* display:contents promotes the slotted content to be the flex items directly, so empty
       prefix/suffix slots contribute no box (and no phantom gap) when nothing is slotted. */
    [part='label'],
    [part='prefix'],
    [part='suffix'] {
        display: contents;
    }

    /* ── States ───────────────────────────────────────────────────────────── */

    /* Hover styles only where the pointer can hover. A touch screen keeps :hover on the button
       after a tap until the next tap lands elsewhere, so there they would stay behind. */
    @media (hover: hover) {
        .button:hover {
            /* Subtle, token-free hover that works on any background fill. */
            filter: brightness(0.95);
        }
    }

    /* Pressed: one step darker than hover, and the only feedback a touch screen gets. */
    .button:active {
        filter: brightness(0.88);
    }

    .button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    /* Without a fill there is nothing to darken. An outlined button gets a faint tint of its
       text colour instead, a plain one an underline like a link, and the tint when pressed. */
    @media (hover: hover) {
        :host([appearance='outlined']) .button:hover {
            background: color-mix(in srgb, currentColor 12%, transparent);
            filter: none;
        }

        :host([appearance='plain']) .button:hover {
            filter: none;
            text-decoration: underline;
        }
    }

    :host([appearance='outlined']) .button:active {
        background: color-mix(in srgb, currentColor 24%, transparent);
        filter: none;
    }

    :host([appearance='plain']) .button:active {
        background: color-mix(in srgb, currentColor 12%, transparent);
        filter: none;
        text-decoration: underline;
    }

    /* ── Shapes ───────────────────────────────────────────────────────────── */

    .button--pill {
        border-radius: 999px;
    }

    .button--circle {
        width: var(--_el-size-height);
        height: var(--_el-size-height);
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        aspect-ratio: 1;
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer no size or shape falls below --el-touch-target in either direction.
       Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .button {
            min-width: var(--el-touch-target, auto);
            min-height: max(var(--_el-size-height), var(--el-touch-target, 0px));
        }

        /* A circle has a fixed width and height. The minimum wins over both, so it stays round. */
        .button--circle {
            min-height: var(--el-touch-target, auto);
        }
    }

    /* ── Caret ────────────────────────────────────────────────────────────── */

    .caret {
        display: inline-flex;
        line-height: 1;
    }

    /* ── Loading ──────────────────────────────────────────────────────────── */

    /* Keep the label in the layout (so the button doesn't resize) but hide it under the
       spinner, which is centered over the whole control. */
    .button--loading {
        cursor: wait;
    }

    .button--loading [part='label'],
    .button--loading [part='prefix'],
    .button--loading [part='suffix'],
    .button--loading .caret {
        visibility: hidden;
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        /* The ring is drawn around the 1em box, not inside it. */
        box-sizing: content-box;
        width: 1em;
        height: 1em;
        margin: -0.5em 0 0 -0.5em;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: el-button-spin 0.7s linear infinite;
    }

    @keyframes el-button-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation-duration: 1.4s;
        }
    }

    /* ── Disabled ─────────────────────────────────────────────────────────── */

    .button[disabled],
    .button[aria-disabled='true'] {
        opacity: 0.55;
        cursor: not-allowed;
        pointer-events: none;
        filter: none;
    }
`;

export default [hostStyle(), sizeStyle(), variantsStyle(), appearanceStyle('.button'), style].join('\n');
