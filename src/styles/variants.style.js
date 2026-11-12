import { hostSelector } from './host.style.js';

const css = String.raw;

/**
 * The semantic variants of a component: `neutral` (the default), `brand`, `success`, `warning` and
 * `danger`, chosen with the `variant` attribute of the host. The component declares `variant` as a
 * reflected property, so that a variant set from a script reaches the attribute.
 *
 * The module resolves the variant to the colours of five roles on the host. The `appearance`
 * module, or the component's own stylesheet, decides which of them it paints. They are internal
 * (`--_el-`), not tokens for a theme:
 *
 * - `--_el-variant-fill`: the background of a filled surface
 * - `--_el-variant-fill-border`: the border around that fill
 * - `--_el-variant-on-fill`: text and icons on that fill
 * - `--_el-variant-border`: the border of a surface without a fill
 * - `--_el-variant-text`: text and icons on the page background
 *
 * A theme sets one colour per variant: `--el-color-accent` (brand), `--el-color-success`,
 * `--el-color-warning` and `--el-color-danger`. `neutral` reads the surface tokens
 * (`--el-color-bg-muted`, `--el-color-border`, `--el-color-fg`).
 *
 * The text on a brand, success or danger fill is `--el-color-bg`: light in a light scheme, dark in
 * a dark one, like the fills themselves are the other way round. A warning colour stays light in
 * both schemes, so its fill carries dark text, and as text on the page it is mixed half and half
 * with `--el-color-fg`.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export default function variantsStyle(host = ':host') {
    return css`
        ${hostSelector(host)} {
            --_el-variant-fill: var(--el-color-bg-muted, #e5e7eb);
            --_el-variant-fill-border: var(--el-color-border, transparent);
            --_el-variant-on-fill: var(--el-color-fg, currentColor);
            --_el-variant-border: var(--el-color-border, currentColor);
            --_el-variant-text: var(--el-color-fg, currentColor);
        }

        ${hostSelector(host, "[variant='brand']")} {
            --_el-variant-fill: var(--el-color-accent, #2563eb);
            --_el-variant-fill-border: var(--el-color-accent, #2563eb);
            --_el-variant-on-fill: var(--el-color-bg, #fff);
            --_el-variant-border: var(--el-color-accent, currentColor);
            --_el-variant-text: var(--el-color-accent, currentColor);
        }

        ${hostSelector(host, "[variant='success']")} {
            --_el-variant-fill: var(--el-color-success, #16a34a);
            --_el-variant-fill-border: var(--el-color-success, #16a34a);
            --_el-variant-on-fill: var(--el-color-bg, #fff);
            --_el-variant-border: var(--el-color-success, currentColor);
            --_el-variant-text: var(--el-color-success, currentColor);
        }

        ${hostSelector(host, "[variant='warning']")} {
            --_el-variant-fill: var(--el-color-warning, #f59e0b);
            --_el-variant-fill-border: var(--el-color-warning, #f59e0b);
            --_el-variant-on-fill: #1c1917;
            --_el-variant-border: var(--el-color-warning, #f59e0b);
            --_el-variant-text: color-mix(in srgb, var(--el-color-warning, #f59e0b), var(--el-color-fg, #1c1917));
        }

        ${hostSelector(host, "[variant='danger']")} {
            --_el-variant-fill: var(--el-color-danger, #dc2626);
            --_el-variant-fill-border: var(--el-color-danger, #dc2626);
            --_el-variant-on-fill: var(--el-color-bg, #fff);
            --_el-variant-border: var(--el-color-danger, currentColor);
            --_el-variant-text: var(--el-color-danger, currentColor);
        }
    `;
}
