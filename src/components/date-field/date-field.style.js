import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

/**
 * The field has the style of `el-input-field`, under its own tag: a field does not get the
 * stylesheet of the class it extends.
 */
const style = css`
    el-date-field {
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

export default [hostStyle('el-date-field'), formControlStyle('el-date-field'), sizeStyle('el-date-field'), style].join(
    '\n',
);
