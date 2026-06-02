const css = String.raw;

export default css`
    :host {
        display: contents;
    }

    /*
     * The native <dialog> is the top-layer surface (the "panel"). It is headless by default —
     * every visual token falls back to a null-ish value so an unthemed dialog imposes nothing.
     */
    dialog {
        margin: auto;
        padding: 0;
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        box-shadow: var(--el-shadow-lg, none);

        width: var(--el-dialog-width, 31rem);
        max-width: calc(100vw - 2 * var(--el-space-4, 1rem));
        max-height: calc(100vh - 2 * var(--el-space-4, 1rem));

        opacity: 0;
        transform: translateY(var(--el-dialog-enter-offset, 0.5rem));
        transition:
            opacity var(--el-duration-md, 0s) var(--el-ease, ease),
            transform var(--el-duration-md, 0s) var(--el-ease, ease);
    }

    /* Lay the box out only while open so the UA's \`dialog:not([open]) { display: none }\` still hides it. */
    dialog[open] {
        display: flex;
        flex-direction: column;
    }

    dialog.showing {
        opacity: 1;
        transform: none;
    }

    dialog::backdrop {
        background: var(--el-dialog-overlay-background, transparent);
        opacity: 0;
        transition: opacity var(--el-duration-md, 0s) var(--el-ease, ease);
    }

    dialog.showing::backdrop {
        opacity: 1;
    }

    [part~='header'] {
        display: flex;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        padding: var(--el-space-4, 1rem);
    }

    [part~='title'] {
        flex: 1 1 auto;
        margin: 0;
        font-size: var(--el-font-size-lg, 1.125rem);
        font-weight: var(--el-font-weight-semibold, 600);
        line-height: 1.2;
    }

    [part~='header-actions'] {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
    }

    [part~='close-button'] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: var(--el-radius-md, 0);
        background: transparent;
        color: inherit;
        cursor: pointer;
        line-height: 0;
    }

    [part~='close-button'] svg {
        width: 1.25rem;
        height: 1.25rem;
    }

    [part~='body'] {
        flex: 1 1 auto;
        overflow: auto;
        padding: var(--el-space-4, 1rem);
    }

    /* Header present: let the header own the top padding so the body doesn't double it. */
    [part~='header'] + [part~='body'] {
        padding-top: 0;
    }

    [part~='footer'] {
        display: flex;
        flex: 0 0 auto;
        justify-content: flex-end;
        gap: var(--el-space-2, 0.5rem);
        padding: var(--el-space-4, 1rem);
        padding-top: 0;
    }

    /* Collapse the footer entirely when nothing is slotted into it. */
    [part~='footer']:not(:has(*)) {
        display: none;
    }

    @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog::backdrop {
            transition-duration: 0s;
        }
    }
`;
