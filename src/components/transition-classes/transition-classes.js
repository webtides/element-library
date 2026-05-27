import { BaseElement, defineElement } from '@webtides/element-js';

/**
 * Applies transition classes to the host element across `enter` / `enter-start` /
 * `enter-end` and `leave` / `leave-start` / `leave-end` stages, driven by the `show`
 * property. Each stage is read from a same-named attribute on the host (e.g.
 * `enter="fade-in"` `enter-start="opacity-0"` `enter-end="opacity-100"`).
 *
 * @element el-transition-classes
 *
 * @slot - Default slot for the element(s) being transitioned.
 *
 * @attr enter - Space-separated classes added throughout the enter transition.
 * @attr enter-start - Classes applied at the start of the enter transition.
 * @attr enter-end - Classes applied at the end of the enter transition.
 * @attr leave - Space-separated classes added throughout the leave transition.
 * @attr leave-start - Classes applied at the start of the leave transition.
 * @attr leave-end - Classes applied at the end of the leave transition.
 *
 * @property {boolean} show - When `true` the host plays the enter transition; when `false`
 *   the leave transition.
 */
export default class TransitionClasses extends BaseElement {
    /** @private */
    initialClasses = '';

    properties() {
        return {
            show: false,
        };
    }

    connected() {
        this.initialClasses = Array.from(this.classList) || [];
    }

    watch() {
        return {
            show: (show) => {
                if (show) this.in();
                else this.out();
            },
        };
    }

    /** @private */
    stages(during, start, end, show, hide) {
        return {
            start: () => {
                this.classList.add(...start);
            },
            during: () => {
                this.classList.add(...during);
            },
            show: () => {
                show();
            },
            end: () => {
                // Don't remove classes that were in the original class attribute.
                this.classList.remove(...start.filter((i) => !this.initialClasses.includes(i)));
                this.classList.add(...end);
            },
            hide: () => {
                hide();
            },
        };
    }

    /** @private */
    classes(attribute) {
        return this.getAttribute(attribute)
            .split(' ')
            .filter((token) => token !== '');
    }

    /** @private */
    in() {
        this.transition(
            this.stages(
                this.classes('enter'),
                this.classes('enter-start'),
                this.classes('enter-end'),
                () => {
                    if (this.style.length === 1 && this.style.display === 'none') {
                        this.removeAttribute('style');
                    } else {
                        this.style.removeProperty('display');
                    }
                },
                () => {},
            ),
        );
    }

    /** @private */
    out() {
        this.transition(
            this.stages(
                this.classes('leave'),
                this.classes('leave-start'),
                this.classes('leave-end'),
                () => {},
                () => {
                    this.style.display = 'none';
                },
            ),
        );
    }

    /**
     * Play the enter transition (equivalent to setting `show = true`).
     * @returns {void}
     */
    show() {
        this.in();
    }
    /**
     * Play the leave transition (equivalent to setting `show = false`).
     * @returns {void}
     */
    hide() {
        this.out();
    }

    /** @private */
    transition(stages) {
        stages.start();
        stages.during();

        requestAnimationFrame(() => {
            // Note: Safari's transitionDuration property will list out comma separated transition durations
            // for every single transition property. Let's grab the first one and call it a day.
            let duration = Number(getComputedStyle(this).transitionDuration.replace(/,.*/, '').replace('s', '')) * 1000;

            if (duration === 0) {
                duration = Number(getComputedStyle(this).animationDuration.replace('s', '')) * 1000;
            }

            stages.show();

            requestAnimationFrame(() => {
                stages.end();

                setTimeout(() => {
                    stages.hide();
                }, duration);
            });
        });
    }
}

export function define() {
    defineElement('el-transition-classes', TransitionClasses);
}
