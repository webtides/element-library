import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The control of a text field that has more in it than its input: content of the page at its
 * start and at its end (an icon, a unit, a button), and the button that clears it. `.control` is
 * the row with the input in its middle. A field renders it only while there is such content.
 *
 * This is the layout of that row, and the button. That the row is the control to the eye, with
 * the border, the surface and the focus ring around all of it and none on the input, is the part
 * of `styles/native.css`, as the border of an input alone is. Without that file the input keeps
 * the look of the browser, and the content stands beside it in the row.
 *
 * The row follows the reading direction: the start is at the right in a right-to-left page.
 * @param {string} [host] - `':host'` (the default), or the tag of a field without a shadow root.
 * @returns {string}
 */
export default function inputControlStyle(host = ':host') {
    const field = hostSelector(host);

    return css`
        ${field} .control {
            display: flex;
            flex: 1 1 auto;
            align-items: center;
            gap: var(--el-space-2, 8px);
            min-inline-size: 0;
        }

        /* The input takes the room that is left, and gives way to the content beside it. */
        ${field} .control input {
            flex: 1 1 auto;
            min-inline-size: 0;
        }

        /* What the page has put at the start or at the end: as wide as it is, in one line, in
           the muted colour of the theme. A control in it has its own colours. */
        ${field} .control-content {
            display: inline-flex;
            flex: none;
            align-items: center;
            gap: var(--el-space-1, 4px);
            color: var(--el-color-fg-muted, inherit);
            white-space: nowrap;
        }

        ${field} .control-content[hidden],
        ${field} .control-clear[hidden] {
            display: none;
        }

        ${field} .control-clear {
            display: inline-flex;
            flex: none;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: var(--el-radius-sm, 0);
            background: transparent;
            color: var(--el-color-fg-muted, inherit);
            font: inherit;
            line-height: 0;
            cursor: pointer;
        }

        ${field} .control-clear:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: 2px;
        }

        ${field} .control-clear svg {
            width: 1em;
            height: 1em;
        }

        /* On a touch screen the button is at least as large as a finger needs. Without the token
           it stays as it is. */
        @media (any-pointer: coarse) {
            ${field} .control-clear {
                min-inline-size: var(--el-touch-target, auto);
                min-block-size: var(--el-touch-target, auto);
            }
        }
    `;
}
