const css = String.raw;

export default css`
    el-checkbox-field {
        display: block;

        .field > label {
            display: inline-flex;
            align-items: center;
            gap: var(--el-space-2, 0);
            cursor: pointer;
        }

        .checked-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--el-space-4, auto);
            height: var(--el-space-4, auto);
            border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
            border-radius: var(--el-radius-sm, 0);
            background: var(--el-color-bg, transparent);
            color: transparent;
            transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        &:state(checked) .checked-indicator {
            background: var(--el-color-accent, transparent);
            border-color: var(--el-color-accent, transparent);
            color: var(--el-color-bg, currentColor);
        }
    }
`;
