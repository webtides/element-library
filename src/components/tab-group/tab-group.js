import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-group.style.js';

export default class TabGroup extends StyledElement {
    tabLinks = [];
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

    selectTab(name) {
        this.selected = name;
    }

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

    queryTabLinks() {
        return this.querySelectorAll(this.linkSelector);
    }

    queryTabPanels() {
        return this.querySelectorAll(this.panelSelector);
    }
}

export function define() {
    defineElement('el-tab-group', TabGroup);
}
