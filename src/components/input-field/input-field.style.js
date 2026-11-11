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

        /* Touch screens: the control and the clear cross are at least --el-touch-target. The mark
           beside the input keeps that width in both states, so the input does not jump when the
           validity changes. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            input {
                min-height: max(var(--el-control-height, 0px), var(--el-touch-target, 0px));
            }

            .validity,
            [data-clear-input] {
                display: grid;
                place-items: center;
                min-width: var(--el-touch-target, auto);
            }

            [data-clear-input] {
                min-height: var(--el-touch-target, auto);
            }
        }
    }
`;
