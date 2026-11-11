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
 * @attribute {boolean} disabled - When present, the link does not dispatch `tab-select` on click
 *   and is exposed as disabled (`aria-disabled="true"`).
 */
export default class TabLink extends StyledElement {
    static observedAttributes = ['disabled'];

    constructor() {
        super({ styles: [style] });
    }

    attributeChangedCallback() {
        this._syncDisabled();
    }

    /**
     * Tells assistive technology what the `disabled` attribute says.
     * @private
     */
    _syncDisabled() {
        if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
        else this.removeAttribute('aria-disabled');
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
                    this.dispatch('tab-select', { selected: this.for });
                },
            },
        };
    }
}

export function define() {
    defineElement('el-tab-link', TabLink);
}
