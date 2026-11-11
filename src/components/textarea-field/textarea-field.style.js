const css = String.raw;

export default css`
    el-textarea-field {
        display: block;

        /* Touch screens: the control and the clear cross are at least --el-touch-target.
           Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            textarea {
                min-height: var(--el-touch-target, auto);
            }

            [data-clear-input] {
                display: inline-grid;
                place-items: center;
                min-width: var(--el-touch-target, auto);
                min-height: var(--el-touch-target, auto);
            }
        }
    }
`;
