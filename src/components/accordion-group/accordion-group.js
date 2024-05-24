import { BaseElement, defineElement } from '@webtides/element-js';
import { Events } from '@webtides/accordion-element';

export default class AccordionGroup extends BaseElement {
    currentOpenElement = null;

    connected() {
        if (!this.showMultiple) return;

        document.querySelectorAll('accordion-elment').forEach((item) => {
            if (item.hasAttribute('open') && item.getAttribute('open') === 'true') {
                this.currentOpenElement = item;
            }
        });
    }

    properties() {
        return {
            showMultiple: true,
        };
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
    defineElement('accordion-group', AccordionGroup);
}
