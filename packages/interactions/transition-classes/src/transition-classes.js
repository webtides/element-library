import { BaseElement, defineElement } from '@webtides/element-js';

export default class TransitionClasses extends BaseElement {
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

	classes(attribute) {
		return this.getAttribute(attribute)
			.split(' ')
			.filter((token) => token !== '');
	}

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

	show() {
		this.in();
	}
	hide() {
		this.out();
	}

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
	defineElement('transition-classes', TransitionClasses);
}
