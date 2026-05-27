import { BaseElement, defineElement } from '@webtides/element-js';
import Events from '../accordion-element/accordion-element.events.js';

/**
 * Container that manages multiple `<el-accordion-element>` children. When `showMultiple` is
 * `false`, only one accordion can be open at a time; opening a new accordion closes the
 * previously open one.
 *
 * @element el-accordion-group
 *
 * @slot - Default slot for `<el-accordion-element>` children.
 *
 * @property {boolean} showMultiple - When `false`, only one child accordion can be open at a
 *   time; opening a new accordion closes the previously open one. When `true`, multiple
 *   accordions can be open simultaneously.
 */
export default class AccordionGroup extends BaseElement {
    /** @private */
    currentOpenElement = null;

    properties() {
        return {
            showMultiple: true,
        };
    }

    connected() {
        if (!this.showMultiple) return;

        document.querySelectorAll('el-accordion-elment').forEach((item) => {
            if (item.hasAttribute('open') && item.getAttribute('open') === 'true') {
                this.currentOpenElement = item;
            }
        });
    }

    events() {
        return {
            this: {
                [Events.TOGGLE]: (event) => {
                    if (this.showMultiple) return;

                    const { open } = event.detail;

                    if (open) {
                        if (this.currentOpenElement) {
                            this.currentOpenElement.open = false;
                        }
                        this.currentOpenElement = event.target;
                    } else {
                        if (event.target === this.currentOpenElement) {
                            this.currentOpenElement = null;
                        }
                    }
                },
            },
        };
    }
}

export function define() {
    defineElement('el-accordion-group', AccordionGroup);
}
