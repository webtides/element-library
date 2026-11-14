import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import choiceGroupStyle from '../../styles/choice-group.style.js';

const css = String.raw;

/**
 * The fieldset as the column of the field, the option as the hit area of its checkbox and the
 * hidden native checkbox are the shared module `choice-group`. Here: the options below each other,
 * and the box that is drawn in the place of a checkbox, with the look of the box of
 * `el-checkbox-field`.
 */
const style = css`
    el-checkbox-group-field {
        .options {
            display: flex;
            flex-direction: column;
            gap: var(--el-space-2, 0.5em);
        }

        .checkbox-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: none;
            /* Fallbacks render a usable box even without a theme, since the native input is hidden. */
            width: var(--el-space-4, 1em);
            height: var(--el-space-4, 1em);
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            border-radius: var(--el-radius-sm, 0);
            background: var(--el-color-bg, transparent);
            transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        /* The check mark. Hidden via opacity (not color: transparent) so the currentColor border
           of the box stays visible while it is not checked. */
        .checkbox-indicator::after {
            content: '\2713';
            line-height: 1;
            opacity: 0;
        }

        input[type='checkbox']:checked + .checkbox-indicator {
            background: var(--el-color-accent, currentColor);
            border-color: var(--el-color-accent, currentColor);
        }

        /* The mark contrasts against the filled box. Set on the mark (not the box) so the
           currentColor-based fill above keeps resolving to the text colour. */
        input[type='checkbox']:checked + .checkbox-indicator::after {
            opacity: 1;
            color: var(--el-color-bg, Canvas);
        }
    }
`;

export default [
    hostStyle('el-checkbox-group-field'),
    formControlStyle('el-checkbox-group-field'),
    choiceGroupStyle('el-checkbox-group-field'),
    style,
].join('\n');
