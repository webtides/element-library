import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * A group of choices in a field: a fieldset with a legend that holds the options, each of them a
 * label around a native radio or checkbox (`el-radio-field`, `el-checkbox-group-field`,
 * `el-rating-field`).
 *
 * - The fieldset is the column of the field. It loses the border and the padding of the browser
 *   and stacks the legend, the help message, the options and the error message: all of them are
 *   inside the group, for a screen reader.
 * - An option (`.option`) is the hit area of its control: a label with the control, the element
 *   that is drawn in its place, and the text. On a touch screen it is at least `--el-touch-target`
 *   in both directions.
 * - The native control is hidden from the eye. It stays focusable and in the accessibility tree.
 *   The element after it shows the keyboard focus, and fades while the control is disabled.
 *
 * How the options lie beside each other (`.options`) and what is drawn in the place of a control
 * are the business of the field.
 *
 * It goes together with `formControlStyle()`, which makes `.field` a flex container and gives the
 * texts their look.
 * @param {string} [host] - `':host'` (the default), or the tag of a field without a shadow root.
 * @returns {string}
 */
export default function choiceGroupStyle(host = ':host') {
    const field = hostSelector(host);

    return css`
        ${field} fieldset.field {
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
        ${field} legend {
            padding: 0;
            margin-bottom: var(--el-space-1, 4px);
        }

        ${field} .option {
            display: inline-flex;
            align-items: center;
            gap: var(--el-space-2, 0.5em);
            cursor: pointer;
        }

        ${field} .option:has(input:disabled) {
            cursor: not-allowed;
        }

        /* The native control is replaced by the element after it; hide it visually but keep it in
           the accessibility tree and focusable. */
        ${field} .option input {
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

        /* Reflect keyboard focus onto the element that is drawn in the place of the control. */
        ${field} .option input:focus-visible + * {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
            outline-offset: 2px;
        }

        ${field} .option input:disabled + * {
            opacity: 0.5;
        }

        /* Touch screens: the label of an option is its hit area and at least --el-touch-target
           in both directions. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            ${field} .option {
                min-width: var(--el-touch-target, auto);
                min-height: var(--el-touch-target, auto);
            }
        }
    `;
}
