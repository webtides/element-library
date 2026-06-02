const css = String.raw;

export default css`
    :host {
        display: block;
        pointer-events: auto;
    }

    /*
     * The animated wrapper. Visibility is managed imperatively (is-hidden / showing classes) rather
     * than via the reflected [open] attribute, so the exit transition can play before the element is
     * fully hidden. The class is intentionally not bound in the template (which would wipe these).
     */
    [part~='base'] {
        opacity: 0;
        transform: translateX(0.75rem);
        transition:
            opacity var(--el-duration-md, 0s) var(--el-ease, ease),
            transform var(--el-duration-md, 0s) var(--el-ease, ease);
    }

    [part~='base'].showing {
        opacity: 1;
        transform: none;
    }

    [part~='base'].is-hidden {
        display: none;
    }

    .panel {
        display: flex;
        align-items: flex-start;
        gap: var(--el-space-3, 0.75rem);
        padding: var(--el-space-3, 0.75rem) var(--el-space-4, 1rem);
        /* System colors as the headless fallback: a floating surface needs to be readable over the
           page, so transparent isn't an option here (unlike inline components). */
        background: var(--el-color-bg, Canvas);
        color: var(--el-color-fg, CanvasText);
        border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
        border-inline-start: 4px solid var(--variant-color, var(--el-color-border, currentColor));
        border-radius: var(--el-radius-md, 0);
        box-shadow: var(--el-shadow-lg, none);
        min-width: 18rem;
        max-width: 28rem;
    }

    .notification--default {
        --variant-color: var(--el-color-border, currentColor);
    }
    .notification--primary {
        --variant-color: var(--el-color-accent, currentColor);
    }
    .notification--success {
        --variant-color: var(--el-color-success, currentColor);
    }
    .notification--neutral {
        --variant-color: var(--el-color-fg-muted, currentColor);
    }
    .notification--warning {
        --variant-color: var(--el-color-warning, #f59e0b);
    }
    .notification--danger {
        --variant-color: var(--el-color-danger, currentColor);
    }

    [part~='icon'] {
        display: inline-flex;
        flex: none;
        color: var(--variant-color, currentColor);
    }

    [part~='icon'] svg {
        width: 1.25rem;
        height: 1.25rem;
    }

    [part~='message'] {
        flex: 1 1 auto;
        min-width: 0;
        line-height: var(--el-line-height, 1.5);
    }

    .close-button {
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: var(--el-radius-sm, 0);
        background: transparent;
        color: var(--el-color-fg-muted, inherit);
        cursor: pointer;
        line-height: 0;
    }

    .close-button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
        outline-offset: 2px;
    }

    .close-button svg {
        width: 1.1rem;
        height: 1.1rem;
    }

    @media (prefers-reduced-motion: reduce) {
        [part~='base'] {
            transition-duration: 0s;
        }
    }
`;
