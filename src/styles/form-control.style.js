import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The layout every form field shares, around whatever control it renders: the label, the help
 * message, the row with the control (`.field`) and the error message stack in a column, with the
 * same gap between them in every field.
 *
 * It also is the look of the texts around the control, so that no field has one of its own:
 *
 * - a label, and the legend of a group, has the text colour of the theme;
 * - the messages are set in the small font size;
 * - the help message has the muted colour of the theme, the error message its danger colour.
 *
 * Without a theme each of them has the colour of the text, which can be read on any background.
 *
 * The control itself is not touched. Without a theme a native control keeps the look of the
 * browser.
 *
 * Every rule names the host itself, and none is nested in the rule of the host. A rule nested in
 * `:host` does not reach the content of a shadow root in every browser that knows nesting (Safari
 * before 18.1), and `el-amount-field` composes this module for its shadow root.
 * @param {string} [host] - `':host'` (the default), or the tag of a field without a shadow root.
 * @returns {string}
 */
export default function formControlStyle(host = ':host') {
    const field = hostSelector(host);

    return css`
        ${field} {
            display: flex;
            flex-direction: column;
            gap: var(--el-space-1, 4px);
        }

        ${field} label,
        ${field} legend {
            color: var(--el-color-fg, inherit);
        }

        ${field} .field {
            display: flex;
            align-items: center;
            gap: var(--el-space-2, 8px);
        }

        ${field} .message {
            font-size: var(--el-font-size-sm, 14px);
        }

        ${field} .help-message {
            color: var(--el-color-fg-muted, inherit);
        }

        /* A field renders the element of the help message with or without a text. Without one it
           would still be a row of the column, and the gap after it would show. */
        ${field} .help-message:empty {
            display: none;
        }

        /* The keyword red on white is 4 : 1, so there is no red for a page without a theme. */
        ${field} .error-message {
            color: var(--el-color-danger, inherit);
        }
    `;
}
