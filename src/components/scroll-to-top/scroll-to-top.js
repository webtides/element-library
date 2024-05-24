import { StyledElement, defineElement } from '@webtides/element-js';
import style from './scroll-to-top.css';

export default class ScrollToTop extends StyledElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            duration: 1000,
            preventDefault: true,
        };
    }

    connected() {
        // TODO: find a more generic way of dealing with cloaking
        // maybe use a mixin for cloaking?!
        this.removeAttribute('cloak');
    }

    events() {
        return {
            this: {
                click: (e) => {
                    if (this.preventDefault) e.preventDefault();
                    this.scrollToTop();
                },
            },
        };
    }

    scrollToTop() {
        const htmlScroll = window
            .getComputedStyle(document.querySelectorAll('html')[0], null)
            .getPropertyValue('scroll-behavior');

        if (htmlScroll === 'smooth') {
            window.scrollTo(0, 0);
        } else {
            const duration = this.duration;
            const difference = document.documentElement.scrollTop || document.body.scrollTop;
            const startTime = performance.now();

            // noinspection JSAnnotator
            function step(timeStamp) {
                let normalizedTime = (timeStamp - startTime) / duration;
                if (normalizedTime > 1) normalizedTime = 1;

                window.scrollTo(0, difference * Math.cos(normalizedTime * Math.PI));
                if (normalizedTime < 1) window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        }
    }
}

export function define() {
    defineElement('scroll-to-top', ScrollToTop);
}
