import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-panel.style.js';

/**
 * Content panel paired with an `<el-tab-link>` by `name`. Visibility is driven by the
 * parent `<el-tab-group>`, which toggles `display: block / none` based on the active
 * selection.
 *
 * @element el-tab-panel
 *
 * @slot - Default slot for the panel's content.
 *
 * @property {string | undefined} name - Identifier matched by a `<el-tab-link for="…">` to
 *   activate this panel.
 */
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
