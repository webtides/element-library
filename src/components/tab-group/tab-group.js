import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-group.style.js';

let tabLinkIds = 0;

/**
 * Container that pairs `<el-tab-link>` children with `<el-tab-panel>` children and shows
 * one panel at a time. Listens for `tab-select` events bubbled from `<el-tab-link>` and
 * mirrors the active selection onto the `selected` attribute (reflected).
 *
 * The group wires the tabs for assistive technology and the keyboard: the selected link has
 * `aria-selected="true"` and is the only one in the tab order, every panel is labelled by its
 * link, and the arrow keys, Home and End move between the links that are not disabled and select
 * the one they land on. The element around the links becomes the `tablist`, so put the links
 * into an element of their own.
 *
 * The links and panels need not be defined, or be there, when the group connects: it marks the
 * selection with attributes and styles, and takes in parts that are added later.
 *
 * @element el-tab-group
 *
 * @slot - Default slot containing `<el-tab-link>` and `<el-tab-panel>` children.
 *
 * @property {string | undefined} selected - Name of the currently selected tab. Matches a
 *   `<el-tab-panel>`'s `name`. Reflected to the `selected` attribute.
 * @property {'horizontal' | 'vertical'} orientation - Direction of the links: the left and right
 *   arrow keys move between them, or the up and down keys when `'vertical'`. Default
 *   `'horizontal'`.
 * @property {string} linkSelector - Selector used to find tab link children.
 * @property {string} panelSelector - Selector used to find tab panel children.
 */
export default class TabGroup extends StyledElement {
    /** @private */
    tabLinks = [];
    /** @private */
    tabPanels = [];
    /** @private */
    _tabsObserver = null;

    constructor() {
        super({ styles: [style], propertyOptions: { selected: { reflect: true } } });
    }

    properties() {
        return {
            selected: undefined,
            orientation: 'horizontal',
            linkSelector: 'el-tab-link',
            panelSelector: 'el-tab-panel',
        };
    }

    watch() {
        return {
            selected: () => {
                this.updateSelection();
            },
            orientation: () => {
                this._syncTabList();
            },
        };
    }

    connected() {
        this._syncTabs();

        // Links and panels that come later: added by the page or a framework, or not parsed yet
        // when the group connected.
        this._tabsObserver = new MutationObserver(() => {
            const same = (now, before) => now.length === before.length && [...now].every((n, i) => n === before[i]);
            if (same(this.queryTabLinks(), this.tabLinks) && same(this.queryTabPanels(), this.tabPanels)) return;
            this._syncTabs();
        });
        this._tabsObserver.observe(this, { childList: true, subtree: true });

        // this.setAttribute('cloak', 'false');
    }

    disconnected() {
        this._tabsObserver?.disconnect();
        this._tabsObserver = null;
    }

    /**
     * Finds the links and panels and brings them in line with the selection. Everything the group
     * tells them is an attribute or a style, so it reaches a link or a panel whose tag is not
     * defined yet as well.
     * @private
     */
    _syncTabs() {
        this.tabLinks = this.queryTabLinks();
        this.tabPanels = this.queryTabPanels();

        // select first tab if none was selected declarative
        if (!this.selected && this.tabPanels.length > 0) {
            const firstPanel = this.tabPanels[0];
            // The attribute is there before the panel is defined, the property is not.
            this.selectTab(firstPanel.getAttribute('name') ?? firstPanel.name);
        }

        this.updateSelection();
        this._syncTabList();
    }

    events() {
        return {
            this: {
                'tab-select': (event) => {
                    const { selected } = event.detail;
                    this.selected = selected;
                },
                keydown: (event) => {
                    this._onKeydown(event);
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
        const tabLinks = [...this.tabLinks];
        // The one link in the tab order: the selected one, or the first that can be used.
        const tabStop =
            tabLinks.find((tabLink) => tabLink.getAttribute('for') === this.selected) ??
            tabLinks.find((tabLink) => !tabLink.hasAttribute('disabled'));

        for (const tabLink of tabLinks) {
            const isSelected = tabLink.getAttribute('for') === this.selected;
            // An el-tab-link shows its `active` state from this attribute.
            tabLink.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            tabLink.setAttribute('tabindex', tabLink === tabStop ? '0' : '-1');
        }

        for (const tabPanel of this.tabPanels) {
            const panelName = tabPanel.getAttribute('name');
            tabPanel.style['display'] = panelName === this.selected ? 'block' : 'none';

            const tabLink = tabLinks.find((link) => link.getAttribute('for') === panelName);
            if (tabLink) {
                if (!tabLink.id) tabLink.id = `el-tab-link-${++tabLinkIds}`;
                tabPanel.setAttribute('aria-labelledby', tabLink.id);
            }
        }
    }

    /**
     * Makes the element around the links the `tablist` and tells it the orientation. Links that
     * are direct children of the group have no such element: the group cannot be the list itself,
     * because it holds the panels as well.
     * @private
     */
    _syncTabList() {
        const tabLinks = [...this.tabLinks];
        const tabList = tabLinks[0]?.parentElement;
        if (!tabList || tabList === this || tabLinks.some((tabLink) => tabLink.parentElement !== tabList)) return;

        if (!tabList.hasAttribute('role')) tabList.setAttribute('role', 'tablist');
        if (tabList.getAttribute('role') === 'tablist') tabList.setAttribute('aria-orientation', this.orientation);
    }

    /**
     * The arrow keys of the orientation, Home and End move the focus to another link and select
     * it. Disabled links are skipped, and the arrow keys wrap around.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeydown(event) {
        const current = event.target.closest(this.linkSelector);
        if (!current || event.altKey || event.ctrlKey || event.metaKey) return;

        const tabLinks = [...this.queryTabLinks()];
        const enabled = tabLinks.filter((tabLink) => !tabLink.hasAttribute('disabled'));
        if (enabled.length === 0) return;

        const step = (direction) => {
            let index = tabLinks.indexOf(current);
            do {
                index = (index + direction + tabLinks.length) % tabLinks.length;
            } while (tabLinks[index].hasAttribute('disabled'));
            return tabLinks[index];
        };
        const [previousKey, nextKey] =
            this.orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
        const targets = {
            [previousKey]: () => step(-1),
            [nextKey]: () => step(1),
            Home: () => enabled[0],
            End: () => enabled[enabled.length - 1],
        };
        if (!Object.hasOwn(targets, event.key)) return;

        // The arrow keys, Home and End would scroll the page.
        event.preventDefault();
        const target = targets[event.key]();
        target.focus();
        target.click();
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
