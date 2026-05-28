const css = String.raw;

export default css`
    :host {
        display: block;
        position: relative;
    }

    [part~='panel'] {
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-lg, 0);
        padding: var(--el-space-3, 0);
        box-shadow: var(--el-shadow-lg, none);
    }
`;
