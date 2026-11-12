import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

const style = css`
    el-input-field {
        .field {
            .validity {
                .valid {
                    color: var(--el-color-success, green);
                }

                .invalid {
                    color: var(--el-color-danger, red);
                }
            }
        }

        /* Touch screens: the control and the clear cross are at least --el-touch-target, whatever
           the size of the field. The mark beside the input keeps that width in both states, so the
           input does not jump when the validity changes. Without the token the sizes stay as they
           are. */
        @media (any-pointer: coarse) {
            input {
                min-height: max(
                    calc(var(--el-control-height, 0px) * var(--_el-size-scale, 1)),
                    var(--el-touch-target, 0px)
                );
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

export default [
    hostStyle('el-input-field'),
    formControlStyle('el-input-field'),
    sizeStyle('el-input-field'),
    style,
].join('\n');
