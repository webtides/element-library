import { BaseElement } from '@currentjs/element';

export default class ScrollTo extends BaseElement {
    properties() {
        return {
            selector: '',
            preventDefault: true,
        };
    }

    events() {
        return {
            this: {
                click: e => {
                    if (this.preventDefault === true) e.preventDefault();
                    document.querySelector(this.selector)?.scrollIntoView({
                        behavior: 'auto',
                        block: 'start',
                    });
                },
            },
        };
    }
}
