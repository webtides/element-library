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

/**
 * The appearance a container gives to the controls inside of it: a toolbar with
 * `appearance="plain"` has plain buttons. The container declares `appearance` as a reflected
 * property and composes this module; it sets one of two properties on the host, which are
 * inherited at any depth and into shadow roots:
 *
 * - `--_el-context-appearance-outlined`
 * - `--_el-context-appearance-plain`
 *
 * Each is a switch: it is set to nothing, or it is not set. A stylesheet cannot ask for the value
 * of a property, so the control puts the switch in front of a value in a property of its own,
 * which is valid only where the switch is set, and falls back from one to the next:
 *
 *     --_el-button-if-plain: var(--_el-context-appearance-plain) transparent;
 *     background: var(--_el-button-if-plain, var(--_el-variant-fill));
 *
 * Outside of a container none of the switches is set, and the control paints what it painted
 * before, with the same values. As with the size, the control only does so while the page has not
 * given it an appearance of its own, and marks that from its template.
 *
 * `filled` sets nothing: it is the appearance a control has anyway.
 *
 * The appearance a container has without the attribute is given as `byDefault`. The rule for it
 * selects a host that has no `appearance` attribute as well: element-js writes the default onto
 * the element when it starts, and in server-rendered markup it is not there yet.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @param {'filled'|'outlined'|'plain'} [byDefault] - The appearance of a container without the
 *   attribute. Default `'filled'`.
 * @returns {string}
 */
export function appearanceContextStyle(host = ':host', byDefault = 'filled') {
    const selectorOf = (appearance) =>
        [`[appearance='${appearance}']`, ...(appearance === byDefault ? [':not([appearance])'] : [])]
            .map((condition) => hostSelector(host, condition))
            .join(',\n        ');

    return css`
        ${selectorOf('outlined')} {
            --_el-context-appearance-outlined: ;
        }

        ${selectorOf('plain')} {
            --_el-context-appearance-plain: ;
        }
    `;
}
