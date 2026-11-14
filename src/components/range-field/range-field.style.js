import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';

const css = String.raw;

/**
 * The control keeps the look of the browser, as the control of every field does: `styles/native.css`
 * makes it as wide as the field and gives it the accent colour of the theme.
 */
const style = css`
    el-range-field {
        /* The value beside the control. Two texts lie in the same cell: the value of now, and the
           longest one the field can have, which is not seen and keeps the room. The control does
           not change its length while the thumb moves. */
        .value {
            display: inline-grid;
            flex: none;
            color: var(--el-color-fg, inherit);
            font-variant-numeric: tabular-nums;
        }

        .value > * {
            grid-area: 1 / 1;
            text-align: end;
        }

        .value-room {
            visibility: hidden;
        }

        /* Touch screens: the control is at least --el-touch-target high. Without the token the
           size stays as it is. */
        @media (any-pointer: coarse) {
            input {
                min-height: var(--el-touch-target, auto);
            }
        }
    }
`;

export default [hostStyle('el-range-field'), formControlStyle('el-range-field'), style].join('\n');
