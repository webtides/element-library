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
 * The row is as high as its control. The mark of a touched field (\`.validity\`, a check mark or a
 * cross beside the control) does not add to that height.
 *
 * The control itself is not touched. Without a theme a native control keeps the look of the
 * browser.
 *
 * Every rule names the host itself, and none is nested in the rule of the host. A rule nested in
 * `:host` does not reach the content of a shadow root in every browser that knows nesting (Safari
 * before 18.1), so the module also works for a field that composes it for a shadow root.
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

        /* The mark of a touched field is a line of the text of the page, and that line can be
           higher than a native control: 24px to 21px for text of 16px at a line height of 1.5. The
           row would grow by the difference when the mark comes, and what follows the field would
           move. Half a line of margin less above and below takes the line out of the height of
           the row; the mark stays in its middle. */
        ${field} .validity {
            margin-block: -0.5lh;
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
