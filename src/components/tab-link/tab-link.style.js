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

        &:state(active) {
            color: var(--el-color-fg, inherit);
            background: var(--el-color-bg-muted, transparent);
            border-color: var(--el-color-accent, transparent);
        }

        &[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
`;
