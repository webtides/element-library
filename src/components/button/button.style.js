const css = String.raw;

export default css`
    :host {
        display: inline-block;
        vertical-align: middle;
    }

    /* ── Base control ─────────────────────────────────────────────────────── */

    .button {
        /* Tokens with headless fallbacks: an unthemed button still renders as a usable
           native-ish control rather than disappearing. */
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--el-space-2, 0.5em);
        box-sizing: border-box;
        width: 100%;
        min-height: var(--el-control-height, 2.5rem);
        padding: var(--el-space-2, 0.5em) var(--el-space-4, 1em);
        border: var(--el-border-width, 1px) solid transparent;
        border-radius: var(--el-radius-md, 4px);
        background: var(--el-color-bg-muted, #e5e7eb);
        color: var(--el-color-fg, currentColor);
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-md, 1rem);
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

    .button:hover {
        /* Subtle, token-free hover that works on any background fill. */
        filter: brightness(0.95);
    }

    .button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    /* ── Sizes ────────────────────────────────────────────────────────────── */

    .button--small {
        min-height: calc(var(--el-control-height, 2.5rem) * 0.8);
        padding: var(--el-space-1, 0.25em) var(--el-space-3, 0.75em);
        font-size: var(--el-font-size-sm, 0.875rem);
    }

    .button--large {
        min-height: calc(var(--el-control-height, 2.5rem) * 1.25);
        padding: var(--el-space-3, 0.75em) var(--el-space-5, 1.5em);
        font-size: calc(var(--el-font-size-md, 1rem) * 1.125);
    }

    /* ── Solid variants ───────────────────────────────────────────────────── */

    /* Filled buttons read the label against the surface color, the same contrast trick the
       checkbox checkmark uses: in light schemes bg is light → light text on a colored fill,
       in dark schemes bg is dark → dark text. So a single token works in both. */
    .button--primary {
        background: var(--el-color-accent, #2563eb);
        border-color: var(--el-color-accent, #2563eb);
        color: var(--el-color-bg, #fff);
    }

    .button--success {
        background: var(--el-color-success, #16a34a);
        border-color: var(--el-color-success, #16a34a);
        color: var(--el-color-bg, #fff);
    }

    .button--danger {
        background: var(--el-color-danger, #dc2626);
        border-color: var(--el-color-danger, #dc2626);
        color: var(--el-color-bg, #fff);
    }

    .button--neutral {
        background: var(--el-color-fg, #374151);
        border-color: var(--el-color-fg, #374151);
        color: var(--el-color-bg, #fff);
    }

    /* No dedicated warning token exists yet; fall back to amber. Amber stays light in both
       color schemes, so dark text keeps the label readable regardless of theme. */
    .button--warning {
        background: var(--el-color-warning, #f59e0b);
        border-color: var(--el-color-warning, #f59e0b);
        color: #1c1917;
    }

    /* default keeps the muted surface but gains a themed border for definition. */
    .button--default {
        border-color: var(--el-color-border, transparent);
    }

    /* text — no chrome, color-only, like a link that behaves as a button. */
    .button--text {
        background: transparent;
        border-color: transparent;
        color: var(--el-color-accent, currentColor);
    }

    .button--text:hover {
        filter: none;
        text-decoration: underline;
    }

    /* ── Outline ──────────────────────────────────────────────────────────── */

    .button--outline {
        background: transparent;
    }

    .button--outline.button--default {
        border-color: var(--el-color-border, currentColor);
        color: var(--el-color-fg, currentColor);
    }

    .button--outline.button--primary {
        border-color: var(--el-color-accent, currentColor);
        color: var(--el-color-accent, currentColor);
    }

    .button--outline.button--success {
        border-color: var(--el-color-success, currentColor);
        color: var(--el-color-success, currentColor);
    }

    .button--outline.button--danger {
        border-color: var(--el-color-danger, currentColor);
        color: var(--el-color-danger, currentColor);
    }

    .button--outline.button--neutral {
        border-color: var(--el-color-fg, currentColor);
        color: var(--el-color-fg, currentColor);
    }

    .button--outline.button--warning {
        border-color: var(--el-color-warning, #f59e0b);
        color: var(--el-color-warning, #b45309);
    }

    .button--outline:hover {
        /* Fill on hover by lifting the brightness of a faint tint of the current text color. */
        background: color-mix(in srgb, currentColor 12%, transparent);
        filter: none;
    }

    /* ── Shapes ───────────────────────────────────────────────────────────── */

    .button--pill {
        border-radius: 999px;
    }

    .button--circle {
        width: var(--el-control-height, 2.5rem);
        height: var(--el-control-height, 2.5rem);
        min-height: 0;
        padding: 0;
        border-radius: 50%;
        aspect-ratio: 1;
    }

    .button--circle.button--small {
        width: calc(var(--el-control-height, 2.5rem) * 0.8);
        height: calc(var(--el-control-height, 2.5rem) * 0.8);
    }

    .button--circle.button--large {
        width: calc(var(--el-control-height, 2.5rem) * 1.25);
        height: calc(var(--el-control-height, 2.5rem) * 1.25);
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
