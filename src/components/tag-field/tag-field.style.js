import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

/**
 * The input keeps the look of the browser, as the control of every field does: `styles/native.css`
 * decorates it. The entries are `el-tag` and bring their look along.
 */
const style = css`
    el-tag-field {
        /* The row of the control is the input and, below it, the entries: they wrap. */
        .field {
            flex-wrap: wrap;
        }

        .tags {
            display: flex;
            flex: 1 1 100%;
            flex-wrap: wrap;
            gap: var(--el-space-1, 4px);
            min-width: 0;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        /* An entry that is longer than the field is cut off by its tag. */
        .tags li {
            display: flex;
            min-width: 0;
            max-width: 100%;
        }

        /* What a screen reader is told: off the screen, and still there for it. */
        .status {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }

        /* Touch screens: the input is at least --el-touch-target high, whatever the size of the
           field. The remove button of a tag has that size from the tag. Without the token the sizes
           stay as they are. */
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

export default [hostStyle('el-tag-field'), formControlStyle('el-tag-field'), sizeStyle('el-tag-field'), style].join(
    '\n',
);
