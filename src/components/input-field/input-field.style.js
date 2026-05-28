const css = String.raw;

export default css`
    el-input-field {
        display: flex;
        flex-direction: column;
        gap: var(--el-space-1, 4px);

        .field {
            display: flex;
            align-items: center;
            gap: var(--el-space-2, 8px);

            .validity {
                .valid {
                    color: var(--el-color-success, green);
                }

                .invalid {
                    color: var(--el-color-danger, red);
                }
            }
        }

        .message {
            font-size: var(--el-font-size-sm, 14px);

            &.error-message {
                color: var(--el-color-danger, red);
            }
        }
    }
`;
