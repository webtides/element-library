import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-link.style.js';

/**
 * The tab of a `<el-tab-panel>` (`role="tab"`). Dispatches a bubbling `tab-select` event with
 * `detail.selected` set to its `for` attribute when it is clicked or when Enter or Space is
 * pressed on it (unless `disabled`). Used inside `<el-tab-group>`, which marks the selected
 * link (`aria-selected`), keeps it in the tab order and moves between the links with the arrow keys.
 *
 * @element el-tab-link
 *
 * @fires {CustomEvent<{ selected: string }>} tab-select - Fired on click and on Enter or Space.
 *   `detail.selected` is the `for` value, used by `<el-tab-group>` to activate the matching
 *   panel. Bubbles and crosses shadow boundaries.
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

    connected() {
        if (!this.hasAttribute('role')) this.setAttribute('role', 'tab');
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
                keydown: (event) => {
                    // Keys pressed on something inside the link belong to that element.
                    if (event.target !== this || (event.key !== 'Enter' && event.key !== ' ')) return;
                    // Space would scroll the page.
                    event.preventDefault();
                    this.click();
                },
            },
        };
    }
}

export function define() {
    defineElement('el-tab-link', TabLink);
}
