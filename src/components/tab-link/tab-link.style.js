const css = String.raw;

export default css`
    el-tab-link {
        display: inline-block;
        padding: var(--el-space-2, 0) var(--el-space-3, 0);
        color: var(--el-color-fg-muted, inherit);
        background: var(--el-color-bg, transparent);
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-sm, 0);
        transition:
            color var(--el-duration-md, 0s) var(--el-ease, linear),
            background-color var(--el-duration-md, 0s) var(--el-ease, linear),
            border-color var(--el-duration-md, 0s) var(--el-ease, linear);

        &:hover {
            cursor: pointer;
            color: var(--el-color-fg, inherit);
        }

        &:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: var(--el-focus-ring-offset, 2px);
        }

        &:state(active) {
            color: var(--el-color-fg, inherit);
            background: var(--el-color-bg-muted, transparent);
            border-color: var(--el-color-accent, transparent);
        }

        &[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Touch screens: the tab is at least --el-touch-target in both directions. The block
           padding grows around one line of text, so the label stays centered; the minimum width
           leaves out the inline padding, which comes on top. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            min-width: calc(var(--el-touch-target, 0px) - 2 * var(--el-space-3, 0px));
            padding-block: max(var(--el-space-2, 0px), calc((var(--el-touch-target, 0px) - 1lh) / 2));
        }
    }
`;
