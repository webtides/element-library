import { BaseElement, defineElement } from '@webtides/element-js';

function load(element) {
    if (element.nodeName.toLowerCase() === 'picture') {
        const img = document.createElement('img');
        if (element.getAttribute('data-alt')) {
            img.alt = element.getAttribute('data-alt');
        }
        element.appendChild(img);
    }
    if (element.nodeName.toLowerCase() === 'video' && !element.getAttribute('data-src')) {
        if (element.children) {
            const childs = element.children;
            let childSrc;
            for (let i = 0; i <= childs.length - 1; i++) {
                childSrc = childs[i].getAttribute('data-src');
                if (childSrc) {
                    childs[i].src = childSrc;
                }
            }
            element.load();
        }
    }
    if (element.getAttribute('data-src')) {
        element.src = element.getAttribute('data-src');
    }
    if (element.getAttribute('data-srcset')) {
        element.setAttribute('srcset', element.getAttribute('data-srcset'));
    }
    if (element.getAttribute('data-background-image')) {
        element.style.backgroundImage = `url('${element.getAttribute('data-background-image')}')`;
    }
    if (element.getAttribute('data-toggle-class')) {
        element.classList.toggle(element.getAttribute('data-toggle-class'));
    }
}

function markAsLoaded(element) {
    element.setAttribute('data-loaded', true);
    element.removeAttribute('data-src');
}

const isLoaded = element => element.getAttribute('data-loaded') === 'true';

const onIntersection = (after = () => {}) => (entries, observer) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
            observer.unobserve(entry.target);

            if (!isLoaded(entry.target)) {
                load(entry.target);
                markAsLoaded(entry.target);
                after();
            }
        }
    });
};

export default class LazySrc extends BaseElement {
    #observer = null;

    constructor() {
        super({
            propertyOptions: {
                loaded: {
                    reflect: true,
                },
            },
        });
    }

    properties() {
        return {
            rootMargin: '0px',
            threshold: 0.01,
            loaded: false,
        };
    }

    connected() {
        this.#observer = new IntersectionObserver(onIntersection(this.afterIntersection.bind(this)), {
            document,
            rootMargin: this.rootMargin,
            threshold: this.threshold,
        });

        const element = this.firstElementChild;

        this.#observer.observe(element);
    }

    afterIntersection() {
        this.loaded = true;
        this.dispatch('src-loaded', {}, true);
    }
}

export function define() {
	defineElement('lazy-src', LazySrc);
}
