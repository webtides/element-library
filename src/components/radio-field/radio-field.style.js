import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';

const css = String.raw;

const style = css`
    el-radio-field {
        /* The group is a fieldset, and the fieldset is the column of this field: the legend, the
           help message, the options and the error message are inside it, for a screen reader. */
        fieldset.field {
            flex-direction: column;
            align-items: stretch;
            gap: var(--el-space-1, 4px);
            margin: 0;
            padding: 0;
            border: 0;
            min-width: 0;
        }

        /* The browser sets a legend on the border of its fieldset. It is no row of the column, so
           the gap of the column is its margin. */
        legend {
            padding: 0;
            margin-bottom: var(--el-space-1, 4px);
        }

        .options {
            display: flex;
            flex-direction: column;
            gap: var(--el-space-2, 0.5em);
        }

        .option {
            display: inline-flex;
            align-items: center;
            gap: var(--el-space-2, 0.5em);
            cursor: pointer;
        }

        .option:has(input:disabled) {
            cursor: not-allowed;
        }

        /* The native radio is replaced by .radio-indicator; hide it visually but keep it in the
           accessibility tree and focusable. */
        input[type='radio'] {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: 0;
            padding: 0;
            border: 0;
            opacity: 0;
            overflow: hidden;
            white-space: nowrap;
            clip: rect(0 0 0 0);
            clip-path: inset(50%);
        }

        /* Reflect keyboard focus onto the custom indicator. */
        input[type='radio']:focus-visible + .radio-indicator {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
            outline-offset: 2px;
        }

        .radio-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: none;
            /* Fallbacks render a usable circle even without a theme, since the native input is hidden. */
            width: var(--el-space-4, 1em);
            height: var(--el-space-4, 1em);
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            border-radius: 50%;
            background: var(--el-color-bg, transparent);
            transition: border-color var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        /* The filled dot scales in when the option is selected (driven by :checked, no host state). */
        .radio-indicator::after {
            content: '';
            width: 50%;
            height: 50%;
            border-radius: 50%;
            background: var(--el-color-accent, currentColor);
            transform: scale(0);
            transition: transform var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        input[type='radio']:checked + .radio-indicator {
            border-color: var(--el-color-accent, currentColor);
        }

        input[type='radio']:checked + .radio-indicator::after {
            transform: scale(1);
        }

        input[type='radio']:disabled + .radio-indicator {
            opacity: 0.5;
        }

        /* Touch screens: the label of an option is its hit area and at least --el-touch-target
           in both directions. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            .option {
                min-width: var(--el-touch-target, auto);
                min-height: var(--el-touch-target, auto);
            }
        }
    }
`;

export default [hostStyle('el-radio-field'), formControlStyle('el-radio-field'), style].join('\n');
