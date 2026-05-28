import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-link.style.js';

/**
 * Clickable label for a `<el-tab-panel>`. Dispatches a bubbling `tab-select` event with
 * `detail.selected` set to its `for` attribute when clicked (unless `disabled`). Used
 * inside `<el-tab-group>`.
 *
 * @element el-tab-link
 *
 * @fires {CustomEvent<{ selected: string }>} tab-select - Fired on click. `detail.selected`
 *   is the `for` value, used by `<el-tab-group>` to activate the matching panel. Bubbles
 *   and crosses shadow boundaries.
 *
 * @slot - Default slot for the tab label content.
 *
 * @cssstate active - Set by the parent `<el-tab-group>` while this link's panel is the
 *   selected one. Style with `el-tab-link:state(active) { … }`.
 *
 * @property {string | undefined} for - Name of the panel this link activates (matches a
 *   `<el-tab-panel>`'s `name`).
 */
export default class TabLink extends StyledElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            for: undefined,
        };
    }

    events() {
        return {
            this: {
                click: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (this.hasAttribute('disabled')) return;
                    this.dispatch('tab-select', { selected: this.for }, true, true, true);
                },
            },
        };
    }
}

export function define() {
    defineElement('el-tab-link', TabLink);
}
