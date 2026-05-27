import { BaseElement, defineElement } from '@webtides/element-js';
import Events from '../accordion-element/accordion-element.events.js';

export default class AccordionGroup extends BaseElement {
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
