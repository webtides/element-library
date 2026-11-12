import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The sizes of a control: `small`, `medium` (the default) and `large`, chosen with the `size`
 * attribute of the host. The component declares `size` as a reflected property, so that a size
 * set from a script reaches the attribute.
 *
 * The module resolves the size to four properties on the host, and the component's own stylesheet
 * applies them to its control. They are internal (`--_el-`), not tokens for a theme:
 *
 * - `--_el-size-height`: the height of the control, from `--el-control-height` (0.8 times for
 *   small, 1.25 times for large)
 * - `--_el-size-padding-block`, `--_el-size-padding-inline`: from the spacing scale
 * - `--_el-size-font-size`: from `--el-font-size-sm` and `--el-font-size-md`
 *
 * Without a theme they fall back to fixed values, so a sized control keeps its proportions.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export default function sizeStyle(host = ':host') {
    return css`
        ${hostSelector(host)} {
            --_el-size-height: var(--el-control-height, 2.5rem);
            --_el-size-padding-block: var(--el-space-2, 0.5em);
            --_el-size-padding-inline: var(--el-space-4, 1em);
            --_el-size-font-size: var(--el-font-size-md, 1rem);
        }

        ${hostSelector(host, "[size='small']")} {
            --_el-size-height: calc(var(--el-control-height, 2.5rem) * 0.8);
            --_el-size-padding-block: var(--el-space-1, 0.25em);
            --_el-size-padding-inline: var(--el-space-3, 0.75em);
            --_el-size-font-size: var(--el-font-size-sm, 0.875rem);
        }

        ${hostSelector(host, "[size='large']")} {
            --_el-size-height: calc(var(--el-control-height, 2.5rem) * 1.25);
            --_el-size-padding-block: var(--el-space-3, 0.75em);
            --_el-size-padding-inline: var(--el-space-5, 1.5em);
            --_el-size-font-size: calc(var(--el-font-size-md, 1rem) * 1.125);
        }
    `;
}
