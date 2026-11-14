import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The layout every form field shares, around whatever control it renders: the label, the help
 * message, the row with the control (`.field`) and the error message stack in a column, and the
 * messages are set in the small font size. The error message has the danger colour of the theme,
 * and without a theme the colour of the text.
 *
 * The control itself is not touched. Without a theme a native control keeps the look of the
 * browser.
 * @param {string} [host] - `':host'` (the default), or the tag of a field without a shadow root.
 * @returns {string}
 */
export default function formControlStyle(host = ':host') {
    return css`
        ${hostSelector(host)} {
            display: flex;
            flex-direction: column;
            gap: var(--el-space-1, 4px);

            .field {
                display: flex;
                align-items: center;
                gap: var(--el-space-2, 8px);
            }

            .message {
                font-size: var(--el-font-size-sm, 14px);

                /* Without a theme the colour of the text, which can be read on any background.
                   The keyword red on white is 4 : 1. */
                &.error-message {
                    color: var(--el-color-danger, inherit);
                }
            }
        }
    `;
}
