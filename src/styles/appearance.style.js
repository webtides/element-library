import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * How a component paints the colours of its variant: `filled` (the default), `outlined` or
 * `plain`, chosen with the `appearance` attribute of the host. The component declares
 * `appearance` as a reflected property, so that an appearance set from a script reaches the
 * attribute. Goes together with the `variants` module, which provides the colours.
 *
 * - `filled`: the fill of the variant, with its border and the text colour for that fill
 * - `outlined`: no fill, the border and the text of the variant
 * - `plain`: no fill and no border, the text of the variant
 *
 * The module sets the background, the border colour and the text colour of the surface. The width
 * and the style of the border, and what a state like hover does, belong to the component.
 * @param {string} surface - Selector of the element inside the host that is painted, `'.button'`
 *   for example.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export default function appearanceStyle(surface, host = ':host') {
    return css`
        ${hostSelector(host)} ${surface} {
            background: var(--_el-variant-fill);
            border-color: var(--_el-variant-fill-border);
            color: var(--_el-variant-on-fill);
        }

        ${hostSelector(host, "[appearance='outlined']")} ${surface} {
            background: transparent;
            border-color: var(--_el-variant-border);
            color: var(--_el-variant-text);
        }

        ${hostSelector(host, "[appearance='plain']")} ${surface} {
            background: transparent;
            border-color: transparent;
            color: var(--_el-variant-text);
        }
    `;
}
