import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

/**
 * The control keeps the look of the browser, as the control of every field does: `styles/native.css`
 * gives it the border of the other fields and its button the tokens of the theme.
 *
 * The area to drop a file onto is no control of the browser, so its look is here: a dashed line
 * around its text and the control, with the colours of the text where there is no theme. In the
 * area the control has no border of its own, with and without `styles/native.css`: the area is
 * the box. The rules for the control in the area name the area, so they win over the rules for
 * the control of that file whichever comes first.
 */
const style = css`
    el-file-field {
        .drop-area {
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            align-items: center;
            gap: var(--el-space-2, 8px);
            box-sizing: border-box;
            min-inline-size: 0;
            padding: var(--el-space-4, 16px);
            border: var(--el-border-width, 1px) dashed var(--el-color-border, currentColor);
            border-radius: var(--el-radius-md, 0);
            background: var(--el-color-bg, transparent);
            color: var(--el-color-fg-muted, inherit);
            text-align: center;
            cursor: pointer;
            transition:
                border-color var(--el-duration-md, 0s) var(--el-ease, linear),
                background-color var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        .drop-area input {
            inline-size: auto;
            max-inline-size: 100%;
            min-block-size: 0;
            border: 0;
            padding: 0;
            background: transparent;
            box-shadow: none;
        }

        /* The ring of the keyboard is around the area, for the control that is in it. */
        .drop-area input:focus {
            outline: none;
            box-shadow: none;
        }

        .drop-area:has(input:focus-visible) {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: var(--el-focus-ring-offset, 2px);
        }

        /* A file is over the area: a line that is drawn through, in the accent colour, and a tint
           of it. The line is what shows where the user forces colours. */
        &:state(dragover) .drop-area {
            border-style: solid;
            border-color: var(--el-color-accent, currentColor);
            background: color-mix(in srgb, var(--el-color-accent, currentColor) 8%, var(--el-color-bg, transparent));
            color: var(--el-color-fg, inherit);
        }

        &:state(invalid) .drop-area {
            border-color: var(--el-color-danger, currentColor);
        }

        /* A field that is disabled takes no file: the area fades as a control does, and its
           control not a second time. */
        .drop-area:has(input:disabled) {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .drop-area input:disabled {
            opacity: 1;
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

export default [hostStyle('el-file-field'), formControlStyle('el-file-field'), sizeStyle('el-file-field'), style].join(
    '\n',
);
