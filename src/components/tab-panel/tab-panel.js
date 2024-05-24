import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-panel.css';

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
    defineElement('tab-panel', TabPanel);
}
