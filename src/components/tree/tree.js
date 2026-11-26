import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import { activeElement } from '../../utils/focus.js';
import style from './tree.style.js';

/**
 * A tree: entries that open and close, for folders, categories and a library beside the content.
 * The tree is a list; every `el-tree-item` in it is an entry, and an entry holds the entries
 * below it. An entry is a link, and one with entries below it has a button that opens and closes
 * them.
 *
 * To assistive technology it is what it is in the markup: nested lists of links, each branch with
 * a button that says whether it is open. It has no `role="tree"`: the links stay links, and they
 * work before the script has run. The script adds the arrow keys of a tree.
 *
 * @element el-tree
 *
 * @slot - The entries of the first level: `el-tree-item` elements.
 *
 * @csspart base - The list of the first level (`role="list"`).
 *
 * @cssproperty --el-tree-indent - How far the entries of a level stand in from the ones of the
 *   level above. Unset, it is `--el-space-4`, and `1rem` without a theme. Read by the entries, so
 *   it can be set on the tree or for the page.
 *
 * @property {string} label - The name of the tree for assistive technology. Unset, the tree has
 *   none.
 */
export default class Tree extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            label: '',
        };
    }

    events() {
        return {
            this: {
                keydown: (event) => this._onKeydown(event),
            },
        };
    }

    /**
     * The entries that are shown, in their order: every entry that is in no closed branch. An
     * entry is asked for the control the focus goes to, see `focusTarget` of `el-tree-item`; one
     * that has none (a name without a link and without entries below it) is passed.
     * @private
     * @returns {HTMLElement[]}
     */
    _shownItems() {
        const isShown = (item) => {
            for (let parent = this._parentOf(item); parent; parent = this._parentOf(parent)) {
                if (!parent.open) return false;
            }
            return true;
        };
        return [...this.querySelectorAll('el-tree-item')].filter((item) => item.focusTarget && isShown(item));
    }

    /**
     * The entry an entry is below, or `null` for one of the first level.
     * @private
     * @param {Element} item
     * @returns {Element | null}
     */
    _parentOf(item) {
        const parent = item.parentElement?.closest('el-tree-item');
        return parent && this.contains(parent) ? parent : null;
    }

    /**
     * The keys of the WAI-ARIA tree view pattern. Up and down go to the entry before and after
     * among the ones that are shown, Home and End to the first and the last. Right opens a branch,
     * and goes to its first entry when it is open; left closes it, and goes to the entry above
     * when it is closed or has nothing below it. In a text that runs from right to left, the two
     * are the other way round.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeydown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;

        // The entry the focus is in: on its link, or on the button that opens it.
        const focused = activeElement();
        const current = event
            .composedPath()
            .find((node) => node instanceof Element && node.localName === 'el-tree-item' && this.contains(node));
        if (!current || !current.shadowRoot?.contains(focused)) return;

        const items = this._shownItems();
        const index = items.indexOf(current);
        const rtl = getComputedStyle(this).direction === 'rtl';
        const [inwards, outwards] = rtl ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];
        const focus = (item) => item?.focusTarget?.focus();

        const keys = {
            ArrowDown: () => focus(items[index + 1]),
            ArrowUp: () => focus(items[index - 1]),
            Home: () => focus(items[0]),
            End: () => focus(items[items.length - 1]),
            [inwards]: () => {
                if (!current.hasItems) return;
                if (!current.open) current.toggle(true);
                else focus(items[index + 1]);
            },
            [outwards]: () => {
                if (current.hasItems && current.open) current.toggle(false);
                else focus(this._parentOf(current));
            },
        };
        if (!Object.hasOwn(keys, event.key)) return;

        // The keys would scroll the page.
        event.preventDefault();
        keys[event.key]();
    }

    template() {
        // The role is inside of the shadow root, not on the element: it is part of the
        // server-rendered markup that way, and needs no script.
        return html`
            <div part="base" class="tree" role="list" ${spreadAttributes({ 'aria-label': this.label || undefined })}>
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-tree', Tree);
}
