import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';

const css = String.raw;

const style = css`
    el-textarea-field {
        /* The mark of a touched field stands beside the first line of the textarea. The shared
           layout would centre it, at a height that changes with the rows of the textarea. */
        .field {
            align-items: flex-start;

            .validity {
                .valid {
                    color: var(--el-color-success, green);
                }

                .invalid {
                    color: var(--el-color-danger, red);
                }
            }
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

export default [hostStyle('el-textarea-field'), formControlStyle('el-textarea-field'), style].join('\n');
