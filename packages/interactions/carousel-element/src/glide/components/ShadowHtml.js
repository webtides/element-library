import GlideHTMLComponent from '@glidejs/glide/src/components/html';
import { define } from '@glidejs/glide/src/utils/object';

const TRACK_SELECTOR = '[data-glide-el="track"]';

export default function (Glide, Components) {
	const glideHtml = GlideHTMLComponent(Glide, Components);

	define(glideHtml, 'host', {
		/**
		 * Exposes light DOM Host or default wrapper
		 *
		 * @return {Object}
		 */
		get() {
			return glideHtml.root.getRootNode().host ? glideHtml.root.getRootNode().host : glideHtml.wrapper;
		},
	});

	glideHtml.mount = function () {
		this.root = Glide.selector;
		this.track = this.root.querySelector(TRACK_SELECTOR);

		this.slides = Array.prototype.slice.call(this.host.children).filter((slide) => {
			return !slide.classList.contains(Glide.settings.classes.cloneSlide) && !slide.hasAttribute('slot');
		});
	};

	return glideHtml;
}
