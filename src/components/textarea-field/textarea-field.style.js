const css = String.raw;

export default css`
    el-textarea-field {
        display: block;

        /* The mark of a touched field stands beside the textarea, at its first line, as it stands
           beside an input. Below the textarea it was a line of its own: the field grew when it was
           left, and what comes after it moved. */
        .field {
            display: flex;
            align-items: flex-start;
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

        /* The error message has the danger colour of the theme, as in every field. Without a theme
           it has the colour of the text, which can be read on any background. */
        .error-message {
            color: var(--el-color-danger, inherit);
        }

        /* Touch screens: the control and the clear cross are at least --el-touch-target. The mark
           beside the textarea keeps that width in both states, so the textarea does not jump when
           the validity changes. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            textarea {
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
