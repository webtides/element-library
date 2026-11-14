import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import choiceGroupStyle from '../../styles/choice-group.style.js';

const css = String.raw;

/**
 * The fieldset as the column of the field, the option as the hit area of its radio and the hidden
 * native radio are the shared module `choice-group`. Here: the options below each other, and the
 * circle that is drawn in the place of a radio.
 */
const style = css`
    el-radio-field {
        .options {
            display: flex;
            flex-direction: column;
            gap: var(--el-space-2, 0.5em);
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
    }
`;

export default [
    hostStyle('el-radio-field'),
    formControlStyle('el-radio-field'),
    choiceGroupStyle('el-radio-field'),
    style,
].join('\n');
