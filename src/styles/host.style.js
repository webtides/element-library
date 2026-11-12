const css = String.raw;

/**
 * The selector of a component's host, with a condition on it if one is given. A component with a
 * shadow root is `:host` in its own stylesheet, a component that renders into the page is its tag:
 *
 * - `hostSelector(':host', "[size='small']")` is `:host([size='small'])`
 * - `hostSelector('el-input-field', "[size='small']")` is `el-input-field[size='small']`
 *
 * The shared style modules take the host as their argument, so one module serves both kinds.
 * @param {string} host - `':host'`, or the tag of a component without a shadow root.
 * @param {string} [condition] - A compound selector for the host, an attribute selector for example.
 * @returns {string}
 */
export function hostSelector(host, condition = '') {
    if (host !== ':host') return `${host}${condition}`;
    return condition ? `:host(${condition})` : ':host';
}

/**
 * What every component needs on its host: the `hidden` attribute hides it. A component sets a
 * `display` of its own on the host, and that would win over the rule of the browser.
 *
 * In a shadow root the sizes also count from the border (`box-sizing: border-box`), for the host
 * and everything inside. A component that renders into the page leaves the box model of its
 * content alone: a native control keeps the one the page gives it.
 * @param {string} [host] - `':host'` (the default), or the tag of a component without a shadow root.
 * @returns {string}
 */
export default function hostStyle(host = ':host') {
    if (host !== ':host') {
        return css`
            ${host}[hidden] {
                display: none !important;
            }
        `;
    }

    return css`
        :host {
            box-sizing: border-box;
        }

        :host *,
        :host *::before,
        :host *::after {
            box-sizing: inherit;
        }

        [hidden],
        :host([hidden]) {
            display: none !important;
        }
    `;
}
