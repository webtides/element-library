const css = String.raw;

export default css`
    el-password-field {
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

        .password-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: none;
            padding: 0;
            border: none;
            border-radius: var(--el-radius-sm, 0);
            background: transparent;
            color: var(--el-color-fg-muted, inherit);
            cursor: pointer;
            line-height: 0;
        }

        .password-toggle:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        .password-toggle:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
            outline-offset: 2px;
        }

        .password-toggle svg {
            width: 1.25em;
            height: 1.25em;
        }

        .message {
            font-size: var(--el-font-size-sm, 14px);

            &.error-message {
                color: var(--el-color-danger, red);
            }
        }

        /* Touch screens: the control, the toggle and the clear cross are at least
           --el-touch-target. The mark beside the input keeps that width in both states, so the
           input does not jump when the validity changes. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            input {
                min-height: max(var(--el-control-height, 0px), var(--el-touch-target, 0px));
            }

            .password-toggle {
                min-width: var(--el-touch-target, auto);
                min-height: var(--el-touch-target, auto);
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
