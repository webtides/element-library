import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

/**
 * The control keeps the look of the browser, as the control of every field does: `styles/native.css`
 * gives it the border of the other fields and its button the tokens of the theme.
 */
const style = css`
    el-file-field {
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

export default [hostStyle('el-file-field'), formControlStyle('el-file-field'), sizeStyle('el-file-field'), style].join(
    '\n',
);
