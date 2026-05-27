import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-group.style.js';

/**
 * Container that pairs `<el-tab-link>` children with `<el-tab-panel>` children and shows
 * one panel at a time. Listens for `tab-select` events bubbled from `<el-tab-link>` and
 * mirrors the active selection onto the `selected` attribute (reflected).
 *
 * @element el-tab-group
 *
 * @slot - Default slot containing `<el-tab-link>` and `<el-tab-panel>` children.
 *
 * @property {string | undefined} selected - Name of the currently selected tab. Matches a
 *   `<el-tab-panel>`'s `name`. Reflected to the `selected` attribute.
 * @property {string} linkSelector - Selector used to find tab link children.
 * @property {string} panelSelector - Selector used to find tab panel children.
 */
export default class TabGroup extends StyledElement {
    /** @private */
    tabLinks = [];
    /** @private */
    tabPanels = [];

    constructor() {
        super({ styles: [style], propertyOptions: { selected: { reflect: true } } });
    }

    properties() {
        return {
            selected: undefined,
            linkSelector: 'el-tab-link',
            panelSelector: 'el-tab-panel',
        };
    }

    watch() {
        return {
            selected: () => {
                this.updateSelection();
            },
        };
    }

    connected() {
        this.tabLinks = this.queryTabLinks();
        this.tabPanels = this.queryTabPanels();

        // select first tab if none was selected declarative
        if (!this.selected && this.tabPanels.length > 0) {
            const firstPanel = this.tabPanels[0];
            this.selectTab(firstPanel.name);
        }

        this.updateSelection();

        // this.setAttribute('cloak', 'false');
    }

    events() {
        return {
            this: {
                'tab-select': (event) => {
                    const { selected } = event.detail;
                    this.selected = selected;
                },
            },
        };
    }

    /**
     * Programmatically activate the panel with the given name.
     * @param {string} name - The `name` of the target `<el-tab-panel>`.
     * @returns {void}
     */
    selectTab(name) {
        this.selected = name;
    }

    /** @private */
    updateSelection() {
        for (const tabLink of this.tabLinks) {
            const panelName = tabLink.getAttribute('for');
            if (panelName === this.selected) {
                tabLink.setAttribute('active', '');
            } else {
                tabLink.removeAttribute('active');
            }
        }

        for (const tabPanel of this.tabPanels) {
            const panelName = tabPanel.getAttribute('name');
            tabPanel.style['display'] = panelName === this.selected ? 'block' : 'none';
        }
    }

    /** @private */
    queryTabLinks() {
        return this.querySelectorAll(this.linkSelector);
    }

    /** @private */
    queryTabPanels() {
        return this.querySelectorAll(this.panelSelector);
    }
}

export function define() {
    defineElement('el-tab-group', TabGroup);
}
