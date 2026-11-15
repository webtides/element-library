import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

/**
 * The control keeps the look of the browser, as the control of every field does: `styles/native.css`
 * gives it the border and the height of the other controls.
 */
const style = css`
    el-color-field {
        /* The value beside the control. Every colour has as many characters, and digits of one
           width keep the text from moving while the user goes through the picker. */
        .value {
            flex: none;
            color: var(--el-color-fg, inherit);
            font-variant-numeric: tabular-nums;
        }

        /* Touch screens: the control is at least --el-touch-target high, whatever the size of the
           field. Without the token the size stays as it is. */
        @media (any-pointer: coarse) {
            input {
                min-height: max(
                    calc(var(--el-control-height, 0px) * var(--_el-size-scale, 1)),
                    var(--el-touch-target, 0px)
                );
            }
        }
    }
`;

export default [
    hostStyle('el-color-field'),
    formControlStyle('el-color-field'),
    sizeStyle('el-color-field'),
    style,
].join('\n');
