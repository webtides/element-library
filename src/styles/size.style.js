import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The sizes of a control: `small`, `medium` (the default) and `large`, chosen with the `size`
 * attribute of the host. The component declares `size` as a reflected property, so that a size
 * set from a script reaches the attribute.
 *
 * The module resolves the size to properties on the host, and the stylesheet that paints the
 * control applies them. They are internal (`--_el-`), not tokens for a theme:
 *
 * - `--_el-size-scale`: the factor for the height, 0.8 for small and 1.25 for large
 * - `--_el-size-height`: the height of the control, `--el-control-height` times that factor
 * - `--_el-size-padding-block`, `--_el-size-padding-inline`: from the spacing scale
 * - `--_el-size-font-size`: from `--el-font-size-sm` and `--el-font-size-md`
 *
 * Without a theme they fall back to fixed values, so a sized control keeps its proportions. A
 * control that has no size without a theme, a native input for example, takes the factor and
 * multiplies it with a fallback of its own.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export default function sizeStyle(host = ':host') {
    return css`
        ${hostSelector(host)} {
            --_el-size-scale: 1;
            --_el-size-height: calc(var(--el-control-height, 2.5rem) * var(--_el-size-scale));
            --_el-size-padding-block: var(--el-space-2, 0.5em);
            --_el-size-padding-inline: var(--el-space-4, 1em);
            --_el-size-font-size: var(--el-font-size-md, 1rem);
        }

        ${hostSelector(host, "[size='small']")} {
            --_el-size-scale: 0.8;
            --_el-size-padding-block: var(--el-space-1, 0.25em);
            --_el-size-padding-inline: var(--el-space-3, 0.75em);
            --_el-size-font-size: var(--el-font-size-sm, 0.875rem);
        }

        ${hostSelector(host, "[size='large']")} {
            --_el-size-scale: 1.25;
            --_el-size-padding-block: var(--el-space-3, 0.75em);
            --_el-size-padding-inline: var(--el-space-5, 1.5em);
            --_el-size-font-size: calc(var(--el-font-size-md, 1rem) * 1.125);
        }
    `;
}

/**
 * The size a container gives to the controls inside of it: a toolbar with `size="small"` has small
 * controls. The container declares `size` as a reflected property and composes this module; it
 * sets properties on the host that are inherited, at any depth and into shadow roots:
 *
 * - `--_el-context-size-height`, `--_el-context-size-padding-block`,
 *   `--_el-context-size-padding-inline`, `--_el-context-size-font-size`
 *
 * They are what `sizeStyle()` resolves a size to, under other names: a control declares the
 * `--_el-size-` properties on its own host, so an inherited value of the same name would never
 * reach it. A control that takes its size from a container reads the context first and its own
 * size after it, on the element that it paints:
 *
 *     min-height: var(--_el-context-size-height, var(--_el-size-height));
 *
 * It does so only while the page has not given it a size of its own. The stylesheet cannot ask
 * that: element-js writes the default onto the element. So the control marks the element it paints
 * from its template (`button--inherit-size` of `el-button`).
 *
 * `medium` sets nothing: it is the size a control has anyway.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export function sizeContextStyle(host = ':host') {
    return css`
        ${hostSelector(host, "[size='small']")} {
            --_el-context-size-height: calc(var(--el-control-height, 2.5rem) * 0.8);
            --_el-context-size-padding-block: var(--el-space-1, 0.25em);
            --_el-context-size-padding-inline: var(--el-space-3, 0.75em);
            --_el-context-size-font-size: var(--el-font-size-sm, 0.875rem);
        }

        ${hostSelector(host, "[size='large']")} {
            --_el-context-size-height: calc(var(--el-control-height, 2.5rem) * 1.25);
            --_el-context-size-padding-block: var(--el-space-3, 0.75em);
            --_el-context-size-padding-inline: var(--el-space-5, 1.5em);
            --_el-context-size-font-size: calc(var(--el-font-size-md, 1rem) * 1.125);
        }
    `;
}
