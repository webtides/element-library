const css = String.raw;

export default css`
    el-form-field,
    el-input-field,
    el-textarea-field,
    el-select-field,
    el-amount-field,
    el-checkbox-field {
        display: block;

        > label {
            display: block;
            margin-bottom: var(--el-space-1, 0);
            color: var(--el-color-fg, inherit);
        }

        > .help-message {
            color: var(--el-color-fg-muted, inherit);
        }
    }
`;
