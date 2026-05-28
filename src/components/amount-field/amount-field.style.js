const css = String.raw;

export default css`
    [part='wrapper'] {
        display: flex;
        flex-direction: row;
        align-items: center;
        border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
        border-radius: var(--el-radius-md, 0);
        overflow: hidden;
        width: fit-content;
    }

    [part~='button'] {
        cursor: pointer;
        background: var(--el-color-bg-muted, transparent);
        color: var(--el-color-fg, inherit);
        border: 0;
        padding: var(--el-space-2, 0) var(--el-space-3, 0);
        min-height: var(--el-touch-target, auto);
        font: inherit;
    }

    [part~='button']:hover:not(:disabled) {
        background: var(--el-color-border, transparent);
    }

    [part~='button']:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    [part='input'] {
        text-align: center;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: textfield;
        border: 0;
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
        padding: var(--el-space-2, 0) var(--el-space-3, 0);
        min-width: var(--el-touch-target, auto);
        font: inherit;
    }

    [part='input']:focus {
        outline: none;
    }

    input[type='number'] {
        -moz-appearance: textfield;
    }

    input[type='number']::-webkit-outer-spin-button,
    input[type='number']::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
`;
