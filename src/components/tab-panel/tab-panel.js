import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-panel.style.js';

export default class TabPanel extends StyledElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            name: undefined,
        };
    }
}

export function define() {
    defineElement('el-tab-panel', TabPanel);
}
