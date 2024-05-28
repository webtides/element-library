import { BaseElement, defineElement } from '@webtides/element-js';

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
                click: (e) => {
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

export function define() {
    defineElement('el-scroll-to', ScrollTo);
}
